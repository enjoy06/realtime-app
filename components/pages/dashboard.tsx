"use client";

import { Card, CardContent } from "@/components/ui/card";
import ReactCountryFlag from "react-country-flag";
import Image from "next/image";
import { FaComputer } from "react-icons/fa6";
import { RiSmartphoneLine } from "react-icons/ri";
import { FcFlashOn } from "react-icons/fc";
import TopCountryChart from "@/components/chart/TopCountryChart";
import { ClientDate } from "./clientDate";

// Types
interface Click {
  id: string;
  user: string;
  country: string;
  source: string;
  gadget: string;
  ip: string;
  created_at: Date;
}

interface TopLead {
  name: string;
  total: number;
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

interface User {
  username: string;
  sum: number;
}

interface DashboardData {
  clicks: Click[];
  liveClicks: Click[];
  topUsers: User[];
  leads: Lead[];
  countryData: Record<string, number>;
  topLeads: TopLead[];
}

export function RealtimeTab({ data }: { data: DashboardData }) {
  return (
    <div className="pt-6 space-y-6">
      {/* Live Clicks & Top Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Live Clicks */}
        <Card className="rounded-2xl shadow-lg col-span-1 md:col-span-2 lg:col-span-2 w-full 
        bg-gradient-to-r from-lime-50 via-lime-100 to-orange-200 dark:text-white dark:bg-gradient-to-r 
        dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
        hover:bg-gradient-to-r hover:from-blue-300 hover:via-cyan-200 hover:to-cyan-100
        max-h-[400px] overflow-auto
        ">
        <div className="flex items-start justify-start gap-2 mb-4 p-0">
        <FcFlashOn className="text-2xl text-blue-500 animate-pulse" />
        <h2 className="font-mono text-1xl text-zinc-800 dark:text-white">Live Clicks</h2>
        </div>

        <div className="p-6 pt-0">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {[...data.liveClicks]
                .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
                .slice(0, 15)
                .map((click) => (
                <div 
                    key={click.id} 
                    className="live-clicks-row animate-pulse"
                >
                    {/* Flag */}
                    <div className="flex-shrink-0 w-10">
                    <ReactCountryFlag
                        countryCode={click.country || "XX"}
                        svg
                        style={{ width: "auto", height: "1.5rem", borderRadius: "3px", boxShadow: "0 0 2px rgba(0,0,0,0.15)" }}
                        title={click.country}
                    />
                    </div>

                    {/* User */}
                    <div className="flex-grow truncate font-mono text-cyan-500 text-base sm:text-lg px-2">
                    {click.user}
                    </div>

                    {/* Device Icon */}
                    <div className="flex-shrink-0 w-8 text-xl px-2">
                    {click.source.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/) ? (
                        <RiSmartphoneLine />
                    ) : (
                        <FaComputer />
                    )}
                    </div>

                    {/* IP */}
                    <div className="flex-grow font-serif text-zinc-600 dark:text-teal-300 text-base truncate px-2">
                    {click.ip}
                    </div>

                    {/* Browser Icon (optional) */}
                    <div className="flex-shrink-0 w-8 text-center text-xs text-zinc-500 px-2">
                    {click.gadget.includes("chrome") && (
                        <Image src={"/safari.svg"} alt="Browser Icon" width={25} height={25} />
                    )}
                    </div>
                </div>
                ))}
            </div>
        </div>
        </Card>

        {/* Top Users */}
        <Card className="rounded-2xl shadow-lg hidden lg:block 
        bg-gradient-to-r from-lime-50 via-lime-100 to-orange-200 dark:bg-gradient-to-r 
        dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
        hover:bg-gradient-to-r hover:from-blue-300 hover:via-cyan-200 hover:to-cyan-100">
          <div className="p-6">
            <h2 className="font-semibold text-xl text-zinc-800 dark:text-white mb-2">Top Users</h2>
            {data.topUsers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No top users found.</p>
            ) : (
              <ul className="space-y-1 mt-2 text-zinc-700 dark:text-zinc-200">
                {data.topUsers.slice(0, 3).map((user, i) => (
                  <li key={i}>
                    <span className="font-semibold text-blue-500">{i + 1}.</span> {user.username}{" "}
                    <span className="text-sm text-zinc-500">(${user.sum})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Quote */}
      <div className="w-full">
        <div className="float-left mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-xl shadow-sm border border-blue-300 dark:border-blue-700 text-sm font-medium">
          ❤️ ORANG YANG BERUSAHA TIDAK AKAN MENGHIANATI HASIL...
        </div>
      </div>
      <div className="clear-left" />

    {/* Table */}
    <div className="overflow-x-auto rounded-xl shadow-md mt-4 border border-zinc-200 dark:border-zinc-700">
        <table className="table-auto min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
            <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">User</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">Country</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">Source</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap hidden md:table-cell">IP</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">Earning</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap hidden sm:table-cell">Time</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {data.leads.map((lead) => (
                <tr key={lead.id} className="odd:bg-cyan-100 even:bg-cyan-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition">
                {/* UserId */}
                <td className="px-4 py-2 font-serif text-zinc-800 dark:text-zinc-100 whitespace-nowrap">
                    {lead.userId}
                </td>
                {/* Country */}
                <td className="px-4 py-2 whitespace-nowrap text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <ReactCountryFlag
                    countryCode={lead.country || "XX"}
                    svg
                    style={{ width: "1.5em", height: "1em", borderRadius: "3px", boxShadow: "0 0 2px rgba(0,0,0,0.2)" }}
                    title={lead.country}
                    />
                    <span className="hidden sm:inline">{lead.country}</span>
                </td>
                {/* Source */}
                <td className="px-4 py-2 text-2xl whitespace-nowrap">
                    {lead.useragent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/g) ? (
                    <RiSmartphoneLine />
                    ) : (
                    <FaComputer />
                    )}
                </td>
                {/* IP Address */}
                <td className="px-4 py-2 font-mono text-zinc-800 dark:text-zinc-100 whitespace-nowrap  hidden md:table-cell">
                    {lead.ip}
                </td>
                {/* Earning */}
                <td className="px-4 py-2 font-mono font-bold text-green-700 dark:text-green-400 whitespace-nowrap">
                    ${lead.earning.toFixed(2)}
                </td>
                {/* Time */}
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap hidden sm:table-cell">
                    <ClientDate date={lead.created_at} />
                </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    {/* Chart & Top Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <TopCountryChart countryData={data.countryData} />
        <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-cyan-50 via-cyan-100 to-blue-200 
            dark:bg-gradient-to-r dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
            hover:bg-gradient-to-r hover:from-blue-300 hover:via-cyan-200 hover:to-cyan-100"
        >
          <CardContent className="p-6">
            <h2 className="font-semibold text-xl text-zinc-800 dark:text-white mb-3">Top Leads</h2>
            {data.topLeads.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-white-400">No leads available.</p>
            ) : (
              <ul className="font-mono text-1xl space-y-1 text-zinc-700 dark:text-white">
                {data.topLeads.map((lead, i) => (
                  <li key={i}>
                    {i + 1}. {lead.name} - ${lead.total.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}