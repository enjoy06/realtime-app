import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import dayjs from "dayjs";

export async function fetchDashboardData() {
  const now = new Date();
  const todayDate = dayjs(now).format("YYYY-MM-DD");
  const currentHour = dayjs(now).format("HH"); // jam 2 digit, contoh "14"

  // Fetch users top 3
  const userSnapshot = await getDocs(
    query(collection(db, "users"), orderBy("sum", "desc"), limit(3))
  );
  const topUsers = userSnapshot.docs.map((doc) => ({
    username: doc.data().username,
    sum: doc.data().sum,
  }));

  // Fetch all leads (desc by created_at)
  const leadSnapshot = await getDocs(
    query(collection(db, "leads"), orderBy("created_at", "desc"))
  );

  // Fetch clicks (desc by created_at, limit 15)
  const getClicks = await getDocs(
    query(collection(db, "clicks"), orderBy("created_at", "desc"), limit(15))
  );

  // Buat array clicks dari query
    const clicks: { id: string; user: string; country: any; source: any; gadget: string; ip: any; created_at: any; }[] = [];

  getClicks.forEach((doc) => {
    const data = doc.data();
    clicks.push({
      id: doc.id,
      user: data.user,
      country: data.country,
      source: data.source,
      gadget: data.gadget,
      ip: data.ip,
      created_at: data.created_at.toDate(),
    });
  });

  // Leads full array + top country + top lead map
  const leads: { id: string; userId: string; country: any; useragent: any; ip: any; earning: any; created_at: any; }[] = [];
  const countryCount: Record<string, number> = {};
  const topLeadMap: Record<string, number> = {};

  leadSnapshot.forEach((doc) => {
    const data = doc.data();
    leads.push({
      id: doc.id,
      userId: data.userId,
      country: data.country,
      useragent: data.useragent,
      ip: data.ip,
      earning: data.earning,
      created_at: data.created_at.toDate(),
    });

    if (data.country) {
      countryCount[data.country] = (countryCount[data.country] || 0) + 1;
    }
    if (data.userId) {
      topLeadMap[data.userId] = (topLeadMap[data.userId] || 0) + data.earning;
    }
  });

  // Top leads sorted by earning
  const topLeads = Object.entries(topLeadMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Ambil user_summary (limit 15)
  const getSummary = await getDocs(
    query(collection(db, "user_summary"), orderBy("created_at", "desc"), limit(15))
  );
  const summary: { id: string; user: string; total_earning: any; total_click: any; created_at: any; created_date: any; created_hour: any; created_week: any; }[] = [];
  getSummary.forEach((doc) => {
    const data = doc.data();
    summary.push({
      id: doc.id,
      user: data.user,
      total_earning: data.total_earning,
      total_click: data.total_click,
      created_at: data.created_at.toDate(),
      created_date: data.created_date,
      created_hour: data.created_hour,
      created_week: data.created_week,
    });
  });

  // Ambil live clicks (limit 15)
  const getLiveClicks = await getDocs(
    query(collection(db, "live_clicks"), orderBy("created_at", "desc"), limit(15))
  );
  const liveClicks: { id: string; user: string; country: any; source: any; gadget: string; ip: any; created_at: any; }[] = [];
  getLiveClicks.forEach((doc) => {
    const data = doc.data();
    liveClicks.push({
      id: doc.id,
      user: data.user,
      country: data.country,
      source: data.source,
      gadget: data.gadget,
      ip: data.ip,
      created_at: data.created_at.toDate(),
    });
  });

  // Hitung leads per user untuk hari ini & jam ini
  const leadsPerUserHour: { [userId: string]: { count: number; earningSum: number } } = {};
  leadSnapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.created_at) return;
    const leadDate = dayjs(data.created_at.toDate()).format("YYYY-MM-DD");
    const leadHour = dayjs(data.created_at.toDate()).format("HH");
    if (leadDate === todayDate && leadHour === currentHour) {
      if (!leadsPerUserHour[data.userId]) {
        leadsPerUserHour[data.userId] = { count: 0, earningSum: 0 };
      }
      leadsPerUserHour[data.userId].count++;
      leadsPerUserHour[data.userId].earningSum += data.earning || 0;
    }
  });

  // Hitung clicks per user untuk hari ini & jam ini
  const clicksPerUserHour: { [userId: string]: number } = {};
  clicks.forEach((click) => {
    const clickDate = dayjs(click.created_at).format("YYYY-MM-DD");
    const clickHour = dayjs(click.created_at).format("HH");
    if (clickDate === todayDate && clickHour === currentHour) {
      clicksPerUserHour[click.user] = (clicksPerUserHour[click.user] || 0) + 1;
    }
  });

  // Gabungkan leads & clicks per user, hitung CR%
  const summaryWithCR = Object.entries(leadsPerUserHour).map(
    ([userId, info]) => {
      const clicksCount = clicksPerUserHour[userId] || 0;
      const cr = clicksCount > 0 ? (info.count / clicksCount) * 100 : 0;
      return {
        user: userId,
        total_leads: info.count,
        total_earning: info.earningSum,
        total_click: clicksCount,
        cr: cr.toFixed(2),
      };
    }
  );

  return {
    topUsers,
    leads,
    clicks,
    liveClicks,
    summary,
    countryData: countryCount,
    topLeads,
    summaryWithCR, // data leads+clicks+earning+CR per user untuk jam ini
    infoString: `Total leads: ${leads.length}, Summary untuk tanggal ${todayDate} jam ${currentHour}:00`,
  };
}