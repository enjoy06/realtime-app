"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { fetchDashboardData } from "@/lib/ambil_lead";
import { fetchLiveClicks } from "@/lib/get_klik";
import { RealtimeTab } from "./realtime-lead";
import { StatsRealtime } from "./stats";
import { SummaryRealtime } from "./summary";

// Types
interface User {
  username: string;
  sum: number;
}

interface Click {
  id: string;
  user: string;
  country: string;
  source: string;
  gadget: string;
  ip: string;
  created_at: Date;
}

interface Lead {
  id: string;
  userId: string;
  country: string;
  useragent: string;
  ip: string;
  earning: number;
  created_at: any;
}

interface TopLead {
  name: string;
  total: number;
}

interface Summary {
  id: string;
  user: string;
  total_earning: number;
  total_click: number;
  created_at: Date;
}

interface DashboardProps {
  summary: Summary[];
  clicks: Click[];
  liveClicks: Click[];
  topUsers: User[];
  leads: Lead[];
  infoString: string;
  countryData: Record<string, number>;
  topLeads: TopLead[];
}

export default function DashboardPage(props: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardProps>(props);
  
    useEffect(() => {

    //Initial websocket!
    const socket = io('http://localhost:3000', {
      path: '/api/socket',
      transports: ['websocket'],
      upgrade: false,
    });

    socket.on("user-lead", (data) => {
      console.log("Alhamdulillah Lead baru:", data);
      setTimeout(async () => {
        const newData = await fetchDashboardData();
        setDashboardData(newData); // ⬅️ Trigger re-render
      }, 500);
    });

    socket.on("user-klik", (data) => {
      console.log("🚀 Data klik baru:", data);
      // bisa fetch ulang data atau push ke state
      setTimeout(async () => {
        const result = await fetchLiveClicks(); // hasilnya { clicks: [...] }
        setDashboardData((prev) => ({
          ...prev,
          liveClicks: result.clicks, // ambil hanya array-nya
        }));
      }, 500);
    });

    const interval = setInterval(async () => {
      const result = await fetchLiveClicks(); // hasilnya { clicks: [...] }
        setDashboardData((prev) => ({
          ...prev,
          liveClicks: result.clicks, // ambil hanya array-nya
        }));
    }, 60000);

    socket.on("connect", () => console.log("Connected"));
    socket.on("disconnect", () => console.log("Disconnected"));
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    return () => {
      clearInterval(interval);
      socket.off("user-klik");
      socket.close();
    };
  }, []);

  return (
  <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900 transition-colors">
  <div className="flex-grow p-6 flex justify-center">
    <div className="w-full max-w-screen-xl space-y-6">
      {/* Tabs */}
      <Tabs defaultValue="realtime">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 flex justify-between items-center border-b pb-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500">
              BALANESOHIB
            </h1>
          </div>
          <TabsList className="mt-2 w-15 justify-start space-x-2 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white dark:bg-zinc-800 dark:text-zinc-300 p-2 rounded-xl">
            <TabsTrigger value="realtime">Realtime</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>
        </nav>

        <TabsContent value="realtime">
          <RealtimeTab data={dashboardData} />
        </TabsContent>

        <TabsContent value="stats">
          <StatsRealtime data={dashboardData} />
        </TabsContent>

        <TabsContent value="leads">
          <SummaryRealtime data={dashboardData} />
        </TabsContent>
      </Tabs>
    </div>
  </div>

  {/* Footer */}
  <footer className="border-t border-zinc-200 dark:border-zinc-700 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
    Powered by <span className="font-semibold text-zinc-700 dark:text-zinc-200">- ZDEV</span>
  </footer>
</div>

);

}
