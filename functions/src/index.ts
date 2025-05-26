import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Hindari inisialisasi ulang
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// Fungsi yang dijalankan setiap 1 menit
export const deleteOldLiveClicks = onSchedule(
  { schedule: "every 1 minutes" },
  async () => {
    const now = Timestamp.now();
    const oneMinuteAgo = new Date(now.toDate().getTime() - 60_000);

    const snapshot = await db
      .collection("live_clicks")
      .where("created_at", "<=", oneMinuteAgo)
      .get();

    const deletions = snapshot.docs.map((doc) => doc.ref.delete());
    console.log(`🧹 Deleted ${deletions.length} expired live_clicks`);
    await Promise.all(deletions);
  }
);