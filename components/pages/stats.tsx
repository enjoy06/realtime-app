"use client";

import ReactCountryFlag from "react-country-flag";
import { ClientDate } from "./clientDate";
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
        <div className="overflow-x-auto rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full text-1xl text-left">
          <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500">
            <tr className="text-white uppercase text-xs font-semibold tracking-wide">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3 max-w-[250px]">Source</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {data.clicks.map((click, i) => (
              <tr
                key={click.id}
                className={`transition-colors duration-200 cursor-default ${
                  i % 2 === 0
                    ? 'bg-cyan-50 dark:bg-zinc-900'
                    : 'bg-cyan-100 dark:bg-zinc-800'
                } hover:bg-blue-100 dark:hover:bg-blue-900`}
              >
                {/* User */}
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {click.user}
                </td>

                {/* Country */}
                <td className="px-4 py-3 flex items-center gap-2 whitespace-nowrap">
                  <ReactCountryFlag
                    countryCode={click.country || 'XX'}
                    svg
                    style={{
                      width: '1.5em',
                      height: '1em',
                      borderRadius: '3px',
                      boxShadow: '0 0 2px rgba(0,0,0,0.2)',
                    }}
                    title={click.country}
                  />
                  <span className="hidden sm:inline text-zinc-800 dark:text-zinc-200">
                    {click.country}
                  </span>
                </td>

                {/* Device */}
                <td className="px-4 py-3 text-center text-xl text-zinc-600 dark:text-zinc-400">
                  {click.source.match(
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/
                  ) ? (
                    <RiSmartphoneLine />
                  ) : (
                    <FaComputer />
                  )}
                </td>

                {/* Source */}
                <td
                  className="px-4 py-3 max-w-[250px] truncate text-zinc-700 dark:text-zinc-300 text-sm select-text"
                  title={click.source}
                >
                  {click.source.length > 75
                    ? click.source.slice(0, 75) + '...'
                    : click.source}
                </td>

                {/* IP */}
                <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  {click.ip}
                </td>

                {/* Time */}
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-sm">
                  <ClientDate date={click.created_at} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}