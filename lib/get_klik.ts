import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

export async function fetchClicks() {
  // Fetch all klik, sorted by newest first
  const getClicks = await getDocs(
    query(collection(db, "clicks"), orderBy("created_at", "desc"))
  );

  const clicks: {
    id: string;
    user: string;
    country: any;
    source: any;
    gadget: string;
    ip: any;
    created_at: any;
  }[] = [];

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

  return {
    clicks,
  };
}

export async function fetchLiveClicks() {
  // Fetch all klik, sorted by newest first
  const getClicks = await getDocs(
    query(collection(db, "live_clicks"), orderBy("created_at", "desc"))
  );

  const clicks: {
    id: string;
    user: string;
    country: any;
    source: any;
    gadget: string;
    ip: any;
    created_at: any;
  }[] = [];

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

  return {
    clicks,
  };
}