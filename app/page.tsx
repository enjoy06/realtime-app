import DashboardPage from "@/components/page/realtime";
import { fetchDashboardData } from "@/lib/ambil_lead";

export default async function Page() {
  const data = await fetchDashboardData();

  return <DashboardPage {...data} />;
}