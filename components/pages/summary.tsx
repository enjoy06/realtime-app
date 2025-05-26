"use client";

import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface Summary {
  id: string;
  user: string;
  total_earning: number;
  total_click: number;
  created_date: string; // "YYYY-MM-DD"
}

interface DashboardData {
  summary: Summary[];
}

function getTodayRange() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return {
    startDate: todayStr,
    endDate: todayStr,
  };
}

export function SummaryRealtime({ data }: { data: DashboardData }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const [searchUser, setSearchUser] = useState("");

  // Format date to YYYY-MM-DD
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const startDateStr = formatDate(dateRange[0].startDate);
  const endDateStr = formatDate(dateRange[0].endDate);

  // Filter by date & user search
  const filteredSummary = data.summary.filter((item) => {
    const inDateRange =
      item.created_date >= startDateStr && item.created_date <= endDateStr;
    const matchesUser = item.user
      .toLowerCase()
      .includes(searchUser.toLowerCase().trim());
    return inDateRange && matchesUser;
  });

  // Reset ke hari ini & kosongkan search
  const resetFilters = () => {
    const today = new Date();
    setDateRange([{ startDate: today, endDate: today, key: "selection" }]);
    setSearchUser("");
  };

  // Export CSV
  const handleExport = () => {
    const csvContent = [
      ["User", "Clicks", "Earning"],
      ...filteredSummary.map((row) => [
        row.user,
        row.total_click.toString(),
        `$${row.total_earning.toFixed(2)}`,
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
    <div className="pt-6 space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap justify-center items-center gap-4 px-3 py-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
        {/* Search user */}
        <input
          type="text"
          placeholder="Search user..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Date range picker toggle & display */}
        <button
          onClick={() => setShowDatePicker((v) => !v)}
          className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm font-medium dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
          aria-label="Toggle date picker"
        >
          {startDateStr} to {endDateStr}
        </button>

        {/* Reset */}
        <button
          onClick={resetFilters}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          title="Reset filters"
          aria-label="Reset filters"
        >
          <RotateCcw size={18} />
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          title="Export to CSV"
          aria-label="Export to CSV"
        >
          <Download size={18} /> Export
        </button>
      </div>

      {/* DateRange picker popup */}
      {showDatePicker && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        onClick={() => setShowDatePicker(false)} // klik background untuk close
      >
        <div
          className="bg-white dark:bg-zinc-900 p-4 rounded shadow-lg"
          onClick={(e) => e.stopPropagation()} // supaya klik di dalam popup gak close
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
            editableDateInputs={true}
          />
          <button
            onClick={() => setShowDatePicker(false)}
            className="mt-2 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700">
        <div className="overflow-x-auto rounded-2xl shadow-sm">
          <table className="min-w-full text-1xl text-left">
            <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500">
              <tr className="text-white uppercase text-xs font-semibold tracking-wide">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Earning</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.length ? (
                filteredSummary.map((click, i) => (
                  <tr
                    key={click.id}
                    className={`transition-colors duration-200 cursor-default ${
                      i % 2 === 0
                        ? "bg-cyan-50 dark:bg-zinc-900"
                        : "bg-cyan-100 dark:bg-zinc-800"
                    } hover:bg-blue-100 dark:hover:bg-blue-900`}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {click.user}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                      {click.total_click}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                      ${click.total_earning.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
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
    </div>
  );
}
