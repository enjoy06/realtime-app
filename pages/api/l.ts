import { NextApiRequest, NextApiResponse } from "next";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebaseAdmin";
import axios from "axios";

interface LeadData {
  userId: string;
  earning: number;
  country?: string;
  useragent?: string;
  ip?: string;
  created_at: Timestamp;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { leads, earn } = req.query;

  if (!leads || !earn) {
    return res.status(400).json({ error: "Missing parameter!" });
  }

  try {
    const decodedClick = Buffer.from(leads as string, "base64").toString("utf-8");
    const parts = decodedClick.split("|");

    if (parts.length < 4) {
      return res
        .status(400)
        .json({ error: "Invalid click format. Expected 4 parts separated by |" });
    }

    const [sub, country, ip, useragent] = parts;
    const earningValue = Number(earn);

    if (isNaN(earningValue)) {
      return res.status(400).json({ error: "Invalid earning value" });
    }

    console.log("Checking user:", sub);

    const cekUser = await db
      .collection("users")
      .where("username", "==", sub)
      .limit(1)
      .get();

    if (cekUser.empty) {
      console.log("User not found:", sub);
      return res.status(404).json({ error: `User ${sub} not found` });
    }

    const leadData: LeadData = {
      userId: sub,
      earning: earningValue,
      country: country || undefined,
      useragent: useragent || undefined,
      ip: ip || undefined,
      created_at: Timestamp.now(),
    };

    console.log("Adding lead data for user:", sub);
    const sendData = await db.collection("leads").add(leadData);
    if (!sendData) {
      return res.status(500).json({ error: "Failed to save lead data" });
    }

    // Create consistent doc ID for summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateString = today.toISOString().split("T")[0];
    const summaryId = `${sub}_${dateString}`;
    const summaryRef = db.collection("user_summary").doc(summaryId);

    console.log(`Updating summary ${summaryId} with +${earningValue}`);

    await summaryRef.set(
      {
        user: sub,
        created_date: dateString,
        total_earning: FieldValue.increment(earningValue),
        total_click: FieldValue.increment(1),
        created_at: Timestamp.now(),
      },
      { merge: true }
    );

    // Trigger realtime update
    await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/broadcast`, {
      event: "user-lead",
      payload: {
        message: `User: ${sub} Lead received..!`,
        data: { ...leadData },
      },
    });

    return res.status(200).json({ message: "Lead received successfully" });
  } catch (error: any) {
    console.error("Error in API:", error);
    return res.status(400).json({
      error: "Invalid base64 in leads parameter",
      errorDetails: error.message,
    });
  }
}