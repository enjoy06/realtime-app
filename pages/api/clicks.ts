import { write } from '@/lib/firebaseAdmin';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import { Timestamp } from 'firebase-admin/firestore';
import { NextApiRequest, NextApiResponse } from 'next';

interface clickData {
  user: string;
  country: string;
  source: string;
  gadget: string;
  ip: string;
  created_at: Timestamp;
}

interface newClicks {
  user: string;
  total_click: number;
  total_earning: number;
  created_at: Timestamp;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"] || "Unknown";
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const getCountry = (ip: string) => "US"; // dummy country for this example

  try {
    const sub = Array.isArray(req.query.sub) ? req.query.sub[0] : (req.query.sub ?? 'unknown');

    const getSources = userAgent.includes("Instagram") ? "instagram"
      : userAgent.includes("[FBAN") || userAgent.includes("FB_") || userAgent.includes("IAB") || userAgent.includes("FB4A") || userAgent.includes("FBAV") ? "facebook"
      : userAgent.includes("Chrome") ? "chrome"
      : userAgent.includes("CriOS") || userAgent.includes("EdgiOS") ? "safari"
      : "default";

    const gadget = isMobile ? 'WAP' : 'WEB';

    const encoded = Buffer.from(`${sub}|${getCountry(ip || '')}|${gadget}|${ip}`).toString('base64');

    // Emit socket event (optional)
    const io = (res.socket as any)?.server?.io;
    io?.emit('user-klik', {
      message: `User: ${sub} Connected successfully..!`,
      data: sub,
      ip,
      gadget,
      getSources
    });

    // Simpan klik ke koleksi "clicks"
    const klikData: clickData = {
      user: sub,
      country: getCountry(ip || ''),
      source: userAgent,
      gadget: getSources,
      ip: ip || '',
      created_at: Timestamp.now(),
    };

    await write.collection('clicks').add(klikData);

    // Ambil data leads dan user_summary
    const getClicksSnap = await getDocs(query(collection(db, "leads")));
    const getStatsSnap = await getDocs(query(collection(db, "user_summary")));

    // Buat map user_summary
    const statsMap: Record<string, any> = {};
    getStatsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.user) {
        statsMap[data.user] = { id: doc.id, ...data };
      }
    });

    // Hitung total earning dari leads per userId
    const countEarning: Record<string, number> = {};
    getClicksSnap.forEach((doc) => {
      const data = doc.data();
      if (!data.userId || typeof data.earning !== 'number') return;
      countEarning[data.userId] = (countEarning[data.userId] || 0) + data.earning;
    });

    // Update atau buat dokumen user_summary
    for (const userId in countEarning) {
      const userStats = statsMap[userId];

      const updatedClicksData: newClicks = {
        user: userId,
        total_click: (userStats?.total_click || 0) + 1,
        total_earning: countEarning[userId],
        created_at: Timestamp.now(),
      };

      const docRef = write.collection('user_summary').doc(userStats?.id || userId); // pakai userId sebagai docId jika baru

      try {
        await docRef.set(updatedClicksData, { merge: true });
        console.log(`✅ Updated or created user_summary for: ${userId}`);
      } catch (err) {
        console.error(`❌ Gagal update user_summary untuk ${userId}:`, err);
      }
    }

    return res.status(200).json({
      data: encoded,
      status: 'OK',
    });

  } catch (error) {
    console.error("❌ Server error saat klik:", error);
    return res.status(400).json({ error: 'Invalid click or server error!' });
  }
}
