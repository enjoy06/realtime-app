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
        <Card className="rounded-2xl shadow-lg transition hover:shadow-2xl col-span-1 md:col-span-2 lg:col-span-2 w-full">
          <div className="flex items-center gap-2 mb-4 p-6">
            <FcFlashOn className="text-3xl animate-pulse text-yellow-400" />
            <h2 className="font-mono text-2xl text-zinc-800 dark:text-white">Live Clicks</h2>
          </div>
          <div className="p-6 pt-0">
            <div className="max-h-64 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-700 pr-2">
              {data.clicks.map((click, index) => (
                <div
                  key={click.id}
                  className="flex items-center justify-between py-2 text-sm text-zinc-800 dark:text-zinc-200 hover:shadow px-2 rounded-md blink animate-pulse"
                  style={{ animationDelay: `${index * 15000}ms` }}
                >
                  <div className="w-4/12 flex items-center gap-3">
                    <ReactCountryFlag
                      countryCode={click.country || "XX"}
                      svg
                      style={{
                        width: "auto",
                        height: "1.5rem",
                        borderRadius: "3px",
                        boxShadow: "0 0 2px rgba(0,0,0,0.15)",
                      }}
                      title={click.country}
                    />
                  </div>
                  <div className="w-6/12 truncate font-mono text-cyan-500 text-2xl">
                    {click.user}
                  </div>
                  <div className="w-6/12 truncate font-serif text-zinc-600 dark:text-teal-300 text-3xl">
                    {click.source.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/) ? (
                      <RiSmartphoneLine />
                    ) : (
                      <FaComputer />
                    )}
                  </div>
                  <div className="w-6/12 truncate font-serif text-zinc-600 dark:text-teal-300 text-2xl">
                    {click.ip}
                  </div>
                  <div className="w-2/12 text-center text-xs text-zinc-500">
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
        <Card className="rounded-2xl shadow-lg transition hover:shadow-2xl hidden lg:block">
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

      {/* Motivational Quote */}
      <div className="w-full">
        <div className="float-left mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-xl shadow-sm border border-blue-300 dark:border-blue-700 text-sm font-medium">
          ❤️ ORANG YANG BERUSAHA DI SAYANG OLEHNYA...
        </div>
      </div>
      <div className="clear-left" />

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-xl shadow-md mt-4 border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <th className="p-3 font-medium">USER</th>
              <th className="p-3 font-medium">Country</th>
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">IP</th>
              <th className="p-3 font-medium">Earning</th>
              <th className="p-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {data.leads.map((lead) => (
              <tr key={lead.id} className="border-t dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                <td className="p-3">{lead.userId}</td>
                <td className="p-3 flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode={lead.country || "XX"}
                    svg
                    style={{
                      width: "2em",
                      height: "1.2em",
                      borderRadius: "2px",
                      boxShadow: "0 0 2px rgba(0,0,0,0.15)",
                    }}
                    title={lead.country}
                  />
                  <span>{lead.country}</span>
                </td>
                <td className="p-3">
                  <Image
                    src="/globe.svg"
                    width={16}
                    height={16}
                    alt="Source Icon"
                    className="inline-block mr-1"
                  />
                </td>
                <td className="p-3">{lead.ip}</td>
                <td className="p-3 text-green-600 dark:text-green-400 font-medium">
                  ${lead.earning.toFixed(2)}
                </td>
                <td className="p-3">
                  <ClientDate date={lead.created_at} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart and Top Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <TopCountryChart countryData={data.countryData} />
        <Card className="rounded-2xl shadow-lg transition hover:shadow-2xl">
          <CardContent className="p-6">
            <h2 className="font-semibold text-xl text-zinc-800 dark:text-white mb-3">Top Leads</h2>
            {data.topLeads.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No leads available.</p>
            ) : (
              <ul className="space-y-1 text-zinc-700 dark:text-zinc-200">
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