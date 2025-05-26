import { write } from '@/lib/firebaseAdmin';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
} from 'firebase/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';

interface ClickData {
  user: string;
  country: string;
  source: string;
  gadget: string;
  ip: string;
  created_at: Timestamp;
}

interface SummaryData {
  user: string;
  total_click: number;
  total_earning: number;
  created_at: Timestamp;
  created_date: string;
  created_hour: string;
  created_week: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const now = Timestamp.now();
  const nowJS = new Date();
  const createdDate = dayjs(nowJS).format('YYYY-MM-DD');
  const createdHour = dayjs(nowJS).format('HH:00');
  const createdWeek = dayjs(nowJS).startOf('week').format('YYYY-MM-DD');

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
  const userAgent = req.headers["user-agent"] || "Unknown";
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const getCountry = (ip: string) => "US"; // Dummy value

  const sub = Array.isArray(req.query.sub) ? req.query.sub[0] : (req.query.sub ?? 'unknown');
  const userId = sub;
  const cekUser = await write
    .collection('users')
    .where('username', '==', sub)
    .limit(1)
    .get();

  if (cekUser.empty) {
    return res.status(404).json({ error: `User ${sub} not found !!! clicks is not valid!` });
  }

  const sourceType =
    userAgent.includes("Instagram") ? "instagram"
    : userAgent.includes("FB") ? "facebook"
    : userAgent.includes("Chrome") ? "chrome"
    : userAgent.includes("Safari") ? "safari"
    : "default";

  const gadget = isMobile ? 'WAP' : 'WEB';
  const encoded = Buffer.from(`${sub}|${getCountry(ip)}|${gadget}|${ip}`).toString('base64');

  try {
    // Emit ke socket (opsional)
    const io = (res.socket as any)?.server?.io;
    io?.emit('user-klik', {
      message: `User: ${sub} Connected successfully..!`,
      data: sub,
      ip,
      gadget,
      source: sourceType,
    });

    const clickPayload: ClickData = {
      user: sub,
      country: getCountry(ip),
      source: userAgent,
      gadget: sourceType,
      ip,
      created_at: now,
    };

    await write.collection('clicks').add(clickPayload);

    const [leadsSnap, summarySnap] = await Promise.all([
      getDocs(query(collection(db, "leads"))),
      getDocs(query(collection(db, "user_summary"))),
    ]);

    // Hitung earning dari leads
    const earningMap: Record<string, number> = {};
    leadsSnap.forEach(doc => {
      const data = doc.data();
      if (data.userId && typeof data.earning === 'number') {
        earningMap[data.userId] = (earningMap[data.userId] || 0) + data.earning;
      }
    });

    // Cek apakah sudah ada summary user hari ini
    let summaryDocId = '';
    let existingClicks = 0;
    let existingEarning = 0;

    summarySnap.forEach(doc => {
      const data = doc.data();
      if (data.user === userId && data.created_date === createdDate) {
        summaryDocId = doc.id;
        existingClicks = data.total_click || 0;
        existingEarning = data.total_earning || 0;
      }
    });

    const summaryData: SummaryData = {
      user: userId,
      total_click: existingClicks + 1,
      total_earning: earningMap[userId] || existingEarning,
      created_at: now,
      created_date: createdDate,
      created_hour: createdHour,
      created_week: createdWeek,
    };

    const summaryRef = write.collection('user_summary').doc(summaryDocId || `${userId}_${createdDate}`);
    const liveClickRef = write.collection('live_clicks').doc(userId);

    await Promise.all([
      summaryRef.set(summaryData, { merge: true }),
      liveClickRef.set({ ...clickPayload, user: userId }, { merge: true }),
    ]);

    return res.status(200).json({
      data: encoded,
      status: 'OK',
    });

  } catch (error) {
    console.error("❌ Error on click:", error);
    return res.status(500).json({ error: 'Server error' });
  }
}
