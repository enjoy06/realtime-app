"use client";

import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// ... bagian import tetap sama

interface Summary {
  id: string;
  user: string;
  total_earning: number;
  total_click: number;
  created_at: Date;
  created_date: string;
}

interface DashboardData {
  summary: Summary[];
}

export function SummaryRealtime({ data }: { data: DashboardData }) {

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [dateRange, setDateRange] = useState(() => {
  const today = new Date();
    return [
      {
        startDate: today,
        endDate: today,
        key: "selection",
      },
    ];
  });

  const getFilterRange = (start: Date, end: Date) => {
    const adjustedStart = new Date(start);
    adjustedStart.setHours(5, 0, 0, 0);

    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() + 1);
    adjustedEnd.setHours(4, 59, 59, 999);

    return [adjustedStart, adjustedEnd];
  };

  const [rangeStart, rangeEnd] = getFilterRange(
    dateRange[0].startDate!,
    dateRange[0].endDate!
  );

  const filteredSummary = data.summary.filter((item) => {
    const created = new Date(item.created_at);
    const inRange = created >= rangeStart && created <= rangeEnd;
    const matchesUser = item.user
      .toLowerCase()
      .includes(searchUser.toLowerCase().trim());
    return inRange && matchesUser;
  });

  const groupedSummary = Object.values(
    filteredSummary.reduce<Record<string, Summary & { total_leads: number }>>(
      (acc, item) => {
        if (!acc[item.user]) {
          acc[item.user] = { ...item, total_leads: 1 };
        } else {
          acc[item.user].total_click += item.total_click;
          acc[item.user].total_earning += item.total_earning;
          acc[item.user].total_leads += 1;
        }
        return acc;
      },
      {}
    )
  );

  const resetFilters = () => {
    const today = new Date();
    setDateRange([{ startDate: today, endDate: today, key: "selection" }]);
    setSearchUser("");
  };

  const handleExport = () => {
    const csvContent = [
      ["User", "Clicks", "Earning", "Leads", "CR (%)"],
      ...groupedSummary.map((row) => [
        row.user,
        row.total_click.toString(),
        `$${row.total_earning.toFixed(2)}`,
        row.total_leads.toString(),
        (
          (row.total_earning / row.total_click || 0) * 100
        ).toFixed(2),
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `summary_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="pt-0 space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap justify-center items-center gap-4 px-3 py-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <button
          onClick={() => setShowDatePicker((v) => !v)}
          className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm font-medium dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
        >
          {dateRange[0].startDate?.toLocaleDateString()} to{" "}
          {dateRange[0].endDate?.toLocaleDateString()}
        </button>

        <button
          onClick={resetFilters}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          title="Reset filters"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={handleExport}
          className="flex items-end gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          title="Export to CSV"
        >
          <Download size={18} />
        </button>

      </div>

      {showDatePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowDatePicker(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 p-4 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <DateRange
              onChange={(item) => {
                const { startDate, endDate, key } = item.selection;
                const today = new Date();
                setDateRange([
                  {
                    startDate: startDate ?? today,
                    endDate: endDate ?? today,
                    key: key ?? "selection",
                  },
                ]);
              }}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              maxDate={new Date()}
              editableDateInputs={false}
            />
            <button
              onClick={() => setShowDatePicker(false)}
              className="mt-5 w-full py-2 flex justify-center items-center font-mono bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="w-full mb-4">
        <input
          type="text"
          placeholder="Search user..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-md">
        <table className="table-auto min-w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500">
            <tr className="text-white uppercase text-xs font-semibold tracking-wide">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Earning</th>
              <th className="px-4 py-3">Leads</th>
              <th className="px-4 py-3">CR (%)</th>
            </tr>
          </thead>
          <tbody>
            {groupedSummary.length ? (
              groupedSummary.map((row, i) => {
                const cr = ((row.total_earning / row.total_click) * 100) || 0;
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors duration-200 ${
                      i % 2 === 0
                        ? "bg-cyan-50 dark:bg-zinc-900"
                        : "bg-cyan-100 dark:bg-zinc-800"
                    } hover:bg-blue-100 dark:hover:bg-blue-900`}
                  >
                    <td className="px-4 py-3 font-medium">{row.user}</td>
                    <td className="px-4 py-3 font-medium">{row.total_leads}</td>
                    <td className="px-4 py-3 font-medium">{cr.toFixed(2)}%</td>
                    <td className="px-4 py-3 font-medium">{row.total_click}</td>
                    <td className="px-4 py-3 font-mono">
                      ${row.total_earning.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-zinc-500 dark:text-zinc-400"
                >
                  No data found in selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
