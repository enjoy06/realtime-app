import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    //const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    const { click, earning } = req.query;

    // Validasi parameter
    if (!click || !earning) {
      return res.status(400).json({ error: 'Missing click or earning parameter' });
    }

    try {
      const decodedClick = Buffer.from(click as string, 'base64').toString('utf-8');
      // if(res.statusCode === 200) {
      //   // Trigger WebSocket ketika ada request POST ke /api/user/upload_akun
      //   const io = (res.socket as any).server.io;
      //   io.emit('user-klik', { 
      //       message: 'Menerima klik!', 
      //       sub: decodedClick, 
      //       earning: parseFloat(earning as string)
      //   });
      // }
      return res.status(200).json({
        data: {
          sub: decodedClick,
          earning: parseFloat(earning as string)
        },
        message: 'Lead received successfully'
     });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid click!' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}