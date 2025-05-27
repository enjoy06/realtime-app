import { NextApiRequest, NextApiResponse } from 'next';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/firebaseAdmin';
import axios from 'axios';

interface LeadData {
  userId: string;
  earning: number;
  country?: string;
  useragent?: string;
  ip?: string;
  created_at: Timestamp;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { click, earning } = req.query;

    if (!click || !earning) {
      return res.status(400).json({ error: 'Missing click or earning parameter' });
    }

    try {
      // Decode base64 safely
      const decodedClick = Buffer.from(click as string, 'base64').toString('utf-8');
      const parts = decodedClick.split('|');

      if (parts.length < 4) {
        return res.status(400).json({ error: 'Invalid click format. Expected 4 parts separated by |' });
      }

      const [sub, country, useragent, ip] = parts;
      const cekUser = await db
        .collection('users')
        .where('username', '==', sub)
        .limit(1)
        .get();

      if (cekUser.empty) {
        return res.status(404).json({ error: `User ${sub} not found in users collection` });
      }

      const leadData: LeadData = {
        userId: sub,
        earning: Number(earning),
        country: country || undefined,
        useragent: useragent || undefined,
        ip: ip || undefined,
        created_at: Timestamp.now(),
      };

      const sendData = await db.collection('leads').add(leadData);
      if (!sendData) {
        return res.status(500).json({ error: 'Failed to save lead data' });
      }

      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/broadcast`, {
        event: "user-klik",
        payload: {
          message: `User: ${sub} Lead received..!`,
          data: { ...leadData },
        }
      });

      return res.status(200).json({ message: 'Lead received successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: 'Invalid base64 in click parameter', errorDetails: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}