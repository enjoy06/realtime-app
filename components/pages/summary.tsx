"use client";

// Types
interface Summary {
  id: string;
  user: string;
  total_earning: number;
  total_click: number;
  created_at: Date;
}

interface DashboardData {
  summary: Summary[];
}

export function SummaryRealtime({ data }: { data: DashboardData }) {
  return (
    <div className="pt-6 space-y-6">
      {/* clicks Table */}
      <div className="overflow-x-auto rounded-xl shadow-md mt-4 border border-zinc-200 dark:border-zinc-700">
        <div className="overflow-x-auto rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full text-1xl text-left">
          <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500">
            <tr className="text-white uppercase text-xs font-semibold tracking-wide">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Earning</th>
            </tr>
          </thead>
          <tbody>
            {data.summary.map((click, i) => (
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

                {/* Total CLick */}
                <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  {click.total_click}
                </td>

                {/* Total Earning */}
                <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  ${click.total_earning.toFixed(2)}
                </td>

                {/* Time */}
                {/* <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-sm">
                  <ClientDate date={click.created_at} />
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}