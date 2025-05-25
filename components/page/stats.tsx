"use client";

import ReactCountryFlag from "react-country-flag";
import Image from "next/image";
import { ClientDate } from "./clientDate";
import { FcPhone } from "react-icons/fc";
import { FaComputer } from "react-icons/fa6";
import { RiSmartphoneLine } from "react-icons/ri";

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

interface DashboardData {
  clicks: Click[];
}

export function StatsRealtime({ data }: { data: DashboardData }) {
  return (
    <div className="pt-6 space-y-6">
      {/* clicks Table */}
      <div className="overflow-x-auto rounded-xl shadow-md mt-4 border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full text-left">
            <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase text-xs font-semibold tracking-wide">
                <th className="p-3">User</th>
                <th className="p-3">Country</th>
                <th className="p-3">Device</th>
                <th className="p-3 max-w-[250px]">Source</th>
                <th className="p-3">IP</th>
                <th className="p-3">Time</th>
            </tr>
            </thead>
            <tbody>
            {data.clicks.map((click, i) => (
                <tr
                key={click.id}
                className={`border-t dark:border-zinc-700 transition-colors duration-200 cursor-default ${
                    i % 2 === 0 ? "bg-zinc-50 dark:bg-zinc-900" : ""
                } hover:bg-blue-50 dark:hover:bg-blue-900`}
                >
                {/* user */}
                <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">{click.user}</td>
                {/* country */}
                <td className="p-3 flex items-center gap-2 whitespace-nowrap">
                    <ReactCountryFlag
                    countryCode={click.country || "XX"}
                    svg
                    style={{
                        width: "2em",
                        height: "1.2em",
                        borderRadius: "2px",
                        boxShadow: "0 0 2px rgba(0,0,0,0.15)",
                    }}
                    title={click.country}
                    />
                    <span className="hidden sm:inline">{click.country}</span>
                </td>
                {/* device */}
                <td className="p-3 text-center text-xl text-zinc-600 dark:text-zinc-400">
                    {click.source.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/) ? (
                    <RiSmartphoneLine />
                    ) : (
                    <FaComputer />
                    )}
                </td>
                {/* source (truncate dan max-width) */}
                <td className="p-3 max-w-[250px] truncate text-sm text-zinc-700 dark:text-zinc-300 select-text" title={click.source}>
                    {click.source.length > 75 ? click.source.slice(0, 75) + "..." : click.source}
                </td>
                {/* ip */}
                <td className="p-3 font-mono text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{click.ip}</td>
                {/* time */}
                <td className="p-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400 text-sm">
                    <ClientDate date={click.created_at} />
                </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    </div>
  );
}