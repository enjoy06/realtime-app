import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export async function fetchDashboardData() {
  const now = dayjs().tz("Asia/Jakarta");
  const todayDate = now.format("YYYY-MM-DD");
  const currentHour = now.format("HH");

  // Jam mulai dan jam selesai untuk range satu jam saat ini
  const startTime = now.hour() < 5 
    ? now.subtract(1, "day").hour(5).minute(0).second(0) 
    : now.hour(5).minute(0).second(0);
  const endTime = startTime.add(24, "hour").subtract(1, "second");

  // === Ambil 3 user dengan sum tertinggi ===
  const userSnapshot = await getDocs(
    query(collection(db, "users"), orderBy("sum", "desc"), limit(3))
  );
  const topUsers = userSnapshot.docs.map((doc) => ({
    username: doc.data().username,
    sum: doc.data().sum,
  }));

  // === Ambil semua leads ===
  const leadSnapshot = await getDocs(
    query(collection(db, "leads"), orderBy("created_at", "desc"))
  );

  // Untuk menyimpan semua leads dan hitung country serta total earning per user
  const leads: { id: string; userId: string; country: any; useragent: any; ip: any; earning: any; created_at: any; }[] = [];
  const countryCount: Record<string, number> = {};
  const topLeadMap: Record<string, number> = {};

  leadSnapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.created_at) return;

    const createdAt = data.created_at.toDate();
    const userId = data.userId;
    const earning = data.earning || 0;

    leads.push({
      id: doc.id,
      userId,
      country: data.country,
      useragent: data.useragent,
      ip: data.ip,
      earning,
      created_at: createdAt,
    });

    if (data.country) {
      countryCount[data.country] = (countryCount[data.country] || 0) + 1;
    }

    if (userId) {
      topLeadMap[userId] = (topLeadMap[userId] || 0) + earning;
    }
  });

  const topLeads = Object.entries(topLeadMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // === Ambil 15 klik terakhir ===
  const clickSnapshot = await getDocs(
    query(collection(db, "clicks"), orderBy("created_at", "desc"), limit(15))
  );
  const clicks = clickSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      user: data.user,
      country: data.country,
      source: data.source,
      gadget: data.gadget,
      ip: data.ip,
      created_at: data.created_at.toDate(),
    };
  });

  // === Ambil 15 live clicks terakhir ===
  const liveClickSnapshot = await getDocs(
    query(collection(db, "live_clicks"), orderBy("created_at", "desc"), limit(15))
  );
  const liveClicks = liveClickSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      user: data.user,
      country: data.country,
      source: data.source,
      gadget: data.gadget,
      ip: data.ip,
      created_at: data.created_at.toDate(),
    };
  });

  // === Ambil summary terakhir (optional, bisa dipakai jika perlu) ===
  const summarySnapshot = await getDocs(
    query(collection(db, "user_summary"), orderBy("created_at", "desc"), limit(15))
  );
  const summary = summarySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      user: data.user,
      total_earning: data.total_earning,
      total_click: data.total_click,
      created_at: data.created_at.toDate(),
      created_date: data.created_date,
      created_hour: data.created_hour,
      created_week: data.created_week,
    };
  });

  // === Hitung leads per user dalam rentang 05:00 hari ini - 04:59 besok ===
const hitungLead: Record<string, number> = {};

leadSnapshot.forEach((doc) => {
  const data = doc.data();
  if (!data.created_at || !data.userId) return;

  const createdAt = dayjs(data.created_at.toDate()).tz("Asia/Jakarta");

  if (createdAt.isSameOrAfter(startTime) && createdAt.isSameOrBefore(endTime)) {
    const userId = data.userId;
    hitungLead[userId] = (hitungLead[userId] || 0) + 1;
  }
});

  // === Hitung clicks per user di jam sekarang ===
  const clicksPerUserHour: Record<string, number> = {};
  clicks.forEach((click) => {
    const clickTime = dayjs(click.created_at).tz("Asia/Jakarta");
    const clickDate = clickTime.format("YYYY-MM-DD");
    const clickHour = clickTime.format("HH");

    if (clickDate === todayDate && clickHour === currentHour) {
      clicksPerUserHour[click.user] = (clicksPerUserHour[click.user] || 0) + 1;
    }
  });

  return {
    topUsers,
    leads,
    hitungLead,
    clicks,
    liveClicks,
    summary,
    countryData: countryCount,
    topLeads
  };
}