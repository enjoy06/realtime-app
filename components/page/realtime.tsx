"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { fetchDashboardData } from "@/lib/ambil_lead";
import ReactCountryFlag from "react-country-flag";
import { FcFlashOn } from "react-icons/fc";
import { FaComputer } from "react-icons/fa6";
import { RiSmartphoneLine } from "react-icons/ri";
import { fetchClicks } from "@/lib/get_klik";
import { ClientDate } from "./clientDate";
import { RealtimeTab } from "./realtime-lead";
import { StatsRealtime } from "./stats";

// Dynamic import for chart
const TopCountryChart = dynamic(() => import("@/components/chart/TopCountryChart"), {
  ssr: false,
});

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

interface DashboardProps {
  clicks: Click[];
  topUsers: User[];
  leads: Lead[];
  infoString: string;
  countryData: Record<string, number>;
  topLeads: TopLead[];
}

export default function DashboardPage(props: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardProps>(props);

  // State for WebSocket connection
    useEffect(() => {
    const socket = io('http://localhost:3000', {
      path: '/api/socket',
    });

    socket.on("user-lead", async () => {
      const newData = await fetchDashboardData();
      setDashboardData(newData); // ⬅️ Trigger re-render
    });

    socket.on("user-klik", async () => {
      setTimeout(async () => {
        const result = await fetchClicks(); // hasilnya { clicks: [...] }
        setDashboardData((prev) => ({
          ...prev,
          clicks: result.clicks, // ambil hanya array-nya
        }));
      }, 500);
    });

    socket.on("connect", () => console.log("Connected"));
    socket.on("disconnect", () => console.log("Disconnected"));

    return () => {
      socket.close();
    };
  }, []);

  return (
  <div className="p-6 bg-white dark:bg-zinc-900 min-h-screen transition-colors flex justify-center">
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
      <TabsList className="mt-2 w-15 justify-start space-x-2 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-xl">
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
        <div className="pt-6 space-y-6">
          {/* Full leads table only */}
        </div>
      </TabsContent>
    </Tabs>
    
  </div>
  </div>
);

}
