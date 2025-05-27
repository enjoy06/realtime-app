"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RealtimeTab } from "./dashboard";
import { StatsRealtime } from "./stats";
import { SummaryRealtime } from "./summary";
import { fetchDashboardData } from "@/lib/ambil_lead";
import { fetchLiveClicks } from "@/lib/get_klik";

export default function DashboardPage(props: any) {
  const [dashboardData, setDashboardData] = useState(props);
  const [selectedTab, setSelectedTab] = useState("realtime");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {

    // Inisialisasi data dashboard saat komponen pertama kali dimuat
    async function refreshData() {
      const newData = await fetchDashboardData();
      setDashboardData(newData);
    }
    refreshData();

    // Inisialisasi koneksi socket
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected with id:", socket.id);
    });

    socket.on("user-lead", async (payload) => {
      console.log("📥 Event 'user-lead' diterima:", payload);
      setTimeout(async () => {
        const newData = await fetchDashboardData();
        setDashboardData(newData);
      }, 5000); // Delay 5 detik untuk menunggu data terupdate
    });

    socket.on("user-klik", async (payload) => {
      console.log("📥 Event 'user-klik' diterima:", payload);
      setTimeout(async () => {
        const result = await fetchLiveClicks();
        setDashboardData((prev: any) => ({ ...prev, liveClicks: result.clicks }));
      }, 5000); // Delay 5 detik untuk menunggu data terupdate
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    return () => {
      socket.off("user-lead");
      socket.off("user-klik");
      socket.off("disconnect");
      socket.close();
    };
  }, []);

  // useEffect(() => {
    
  //   // const socket = io("http://localhost:3000", {
  //   //   path: "/api/socket",
  //   // });

  //   fetch(process.env.NEXT_PUBLIC_SOCKET_URL + "/broadcast", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       event: "user-connect",
  //       payload: {
  //         message: "Socket server initialized",
  //         data: {},
  //       },
  //     }),
  //   });

  //   const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  //     transports: ["websocket"],
  //     secure: true,
  //     autoConnect: true,
  //     forceNew: true,
  //     reconnectionAttempts: 5,
  //   });

  //   socket.on("connect", () => console.log("Connected to socket server"));
  //   socket.on("connect_error", (err) => console.error("Socket connect error:", err));
  //   socket.on("disconnect", () => console.log("Socket disconnected"));

  //   socket.on("user-connect", async (payload) => {
  //     console.log("📥 Event 'user-connect' diterima:", payload);
  //   });

  //   socket.on("user-lead", async (payload) => {
  //     console.log("📥 Event 'user-lead' diterima:", payload);
  //     setTimeout(async () => {
  //       const newData = await fetchDashboardData();
  //       setDashboardData(newData);
  //     }, 5000); // Delay 5 detik untuk menunggu data terupdate
  //   });

  //   socket.on("user-klik", async (payload) => {
  //     console.log("📥 Event 'user-klik' diterima:", payload);
  //     setTimeout(async () => {
  //       const result = await fetchLiveClicks();
  //       setDashboardData((prev: any) => ({ ...prev, liveClicks: result.clicks }));
  //     }, 5000); // Delay 5 detik untuk menunggu data terupdate
  //   });

  //   const interval = setInterval(async () => {
  //     const result = await fetchLiveClicks();
  //     setDashboardData((prev: any) => ({ ...prev, liveClicks: result.clicks }));
  //   }, 60000);

  //   socket.on("disconnect", () => console.log("Disconnected"));

  //   return () => {
  //     clearInterval(interval);
  //     socket.off("user-klik");
  //     socket.off("user-lead");
  //     socket.close();
  //   };
  // }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900 transition-colors">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        {/* Navbar utama */}
        <nav className="sticky top-0 z-[20000] bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 px-4 py-3 flex items-center justify-between">
          {/* Logo + Hamburger (kiri) */}
          <div className="flex items-center space-x-4">
            {/* Hamburger button mobile */}
            <button
              className="sm:hidden p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
              onClick={() => {
                setMenuOpen((open) => !open);
                window.scrollTo({ top: 0, behavior: "smooth" }); // scroll ke atas saat klik hamburger
              }}
            >
              <svg
                className="w-6 h-6 text-zinc-900 dark:text-zinc-100"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
              BALANESOHIB
            </div>
          </div>

          {/* Tabs desktop (kanan) */}
          <TabsList className="hidden sm:flex space-x-6 text-zinc-900 dark:text-zinc-100">
            <TabsTrigger value="realtime">Realtime</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>
        </nav>

        {/* Mobile menu (bawah navbar) */}
        {menuOpen && (
          <TabsList className="sm:hidden flex flex-col items-start bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
            <TabsTrigger
              value="realtime"
              className="p-3 border-b border-zinc-200 dark:border-zinc-700"
              onClick={() => setMenuOpen(false)}
            >
              Realtime
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="p-3 border-b border-zinc-200 dark:border-zinc-700"
              onClick={() => setMenuOpen(false)}
            >
              Stats
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="p-3"
              onClick={() => setMenuOpen(false)}
            >
              Leads
            </TabsTrigger>
          </TabsList>
        )}

        {/* Konten tab */}
        <main className="flex-grow p-4">
          <TabsContent value="realtime">
            <RealtimeTab data={dashboardData} />
          </TabsContent>
          <TabsContent value="stats">
            <StatsRealtime data={dashboardData} />
          </TabsContent>
          <TabsContent value="leads">
            <SummaryRealtime data={dashboardData} />
          </TabsContent>
        </main>
      </Tabs>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-700 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Powered by{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-200">- ZDEV</span>
      </footer>
    </div>
  );
}
