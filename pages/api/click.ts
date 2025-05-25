import { write } from '@/lib/firebaseAdmin';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
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
  total_click: number,
  total_earning: number,
  created_at: Timestamp
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "Unknown";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const getCountry = (ip: string) => {
        // Dummy function to simulate country detection
        // In a real application, you might use a service or database to get the country from the IP
        return "US"; // Defaulting to US for this example
    }
    try {
      const dataLead = `${req.query.sub}|${getCountry(ip || '')}|${isMobile ? 'WAP' : 'WEB'}|${ip}`;
      const encode = Buffer.from(dataLead).toString('base64');
      const getPhones = isMobile ? 'WAP' : 'WEB';
      let getSources = "default";
        if (userAgent?.includes("[FBAN") || userAgent?.includes("FB_") || userAgent?.includes("IAB") || userAgent?.includes("FB4A") || userAgent?.includes("FBAV")) {
          getSources = "facebook";
        } else if (userAgent?.includes("Instagram")) {
          getSources = "instagram";
        } else if (userAgent?.includes("Chrome")) {
          getSources = "chrome";
        } else if (userAgent?.includes("CriOS") || userAgent?.includes("EdgiOS")) {
          getSources = "safari";
        }
      if (res.statusCode=== 200) {
        const io = (res.socket as any).server.io;
        io.emit('user-klik', { 
          message: `User: ${req.query.sub} Connected successfully..!`,
          data: req.query.sub, ip, getPhones, getSources
        });
        const klikData: clickData = {
          user: Array.isArray(req.query.sub) ? req.query.sub[0] : (req.query.sub ?? 'unknown'),
          country: getCountry(ip || ''),
          source: userAgent as string,
          gadget: getSources,
          ip: ip || '',
          created_at: Timestamp.now(),
        };

        const sendData = await write.collection('clicks').add(klikData);
        if (!sendData) {
          return res.status(500).json({ error: 'Failed to save clicks data' });
        }
        //send and update clicks!
        const getClicksSnap = await getDocs(query(collection(db, "leads")));
        const getStatsSnap = await getDocs(query(collection(db, "user_summary")));

        // Buat map statistik agar mudah diakses berdasarkan user
        const statsMap: Record<string, any> = {};
        getStatsSnap.forEach((doc) => {
          statsMap[doc.data().user] = { id: doc.id, ...doc.data() };
        });

        // Hitung total earning per user
        const countEarning: Record<string, number> = {};
        getClicksSnap.forEach((doc) => {
          const data = doc.data();
          countEarning[data.userId] = (countEarning[data.userId] || 0) + data.earning;
        });

        // Update masing-masing user_summary
        for (const userId in countEarning) {
          const userStats = statsMap[userId];
          if (!userStats) continue; // Lewatkan jika tidak ada data statistik user

          const updatedClicksData = {
            user: userId,
            total_click: userStats.total_click + 1,
            total_earning: userStats.total_earning + countEarning[userId],
            created_at: Timestamp.now(),
          };

          try {
            await write.collection('user_summary').doc(userStats.id).set(updatedClicksData, { merge: true });
            console.log("Updated user:", userId);
          } catch (err) {
            console.error("Gagal update:", userId, err);
          }
        }
        
      }
      return res.status(200).json({
        data: encode,
        status: 'OK' 
      });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid click or server error!' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}