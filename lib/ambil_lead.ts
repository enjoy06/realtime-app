import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

export async function fetchDashboardData() {
  // Fetch users
  const userSnapshot = await getDocs(
    query(collection(db, "users"), orderBy("sum", "desc"), limit(3))
  );

  const topUsers = userSnapshot.docs.map((doc) => ({
    username: doc.data().username,
    sum: doc.data().sum,
  }));

  // Fetch all leads
  const leadSnapshot = await getDocs(
    query(collection(db, "leads"), orderBy("created_at", "desc"))
  );
  const getClicks = await getDocs(
    query(collection(db, "clicks"), orderBy("created_at", "desc"), limit(15))
  );
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

    // Top country
    if (data.country) {
      countryCount[data.country] = (countryCount[data.country] || 0) + 1;
    }

    // Top leads
    if (data.userId) {
      topLeadMap[data.userId] = (topLeadMap[data.userId] || 0) + data.earning;
    }
  });

  // Format top leads
  const topLeads = Object.entries(topLeadMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  //get summary user!
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

  //get Live clicks
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

  return {
    topUsers,
    leads,
    clicks,
    liveClicks,
    summary,
    countryData: countryCount,
    topLeads,
    infoString: `Total leads: ${leads.length}`,
  };
}
