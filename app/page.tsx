import DashboardPage from "@/components/pages/realtime";
import { fetchDashboardData } from "@/lib/data";

export default async function Page() {
  const data = await fetchDashboardData();

  return <DashboardPage {...data} />;
}