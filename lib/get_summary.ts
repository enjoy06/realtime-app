import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

export async function fetchSummary() {

    const getSummary = await getDocs(
        query(collection(db, "clicks"), orderBy("created_at", "desc"), limit(15))
    );
    const summary: { id: string; user: string; total_earning: any; total_click: any; created_at: any; }[] = [];
    getSummary.forEach((doc) => {
        const data = doc.data();
        summary.push({
        id: doc.id,
        user: data.user,
        total_earning: data.total_earning,
        total_click: data.total_click,
        created_at: data.created_at.toDate(),
        });
    });

    return {
        summary
    }

}