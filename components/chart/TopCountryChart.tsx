"use client";

import { Doughnut } from "react-chartjs-2";
import { Card, CardContent } from "@/components/ui/card";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TopCountryChartProps {
  countryData: Record<string, number>;
}

export default function TopCountryChart({ countryData }: TopCountryChartProps) {
  if (!countryData || Object.keys(countryData).length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-2">Top Country</h2>
          <p className="text-sm text-gray-500">No country data available.</p>
        </CardContent>
      </Card>
    );
  }

  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#14b8a6", "#eab308"
  ];

  const data = {
    labels: Object.keys(countryData),
    datasets: [
      {
        label: "Leads",
        data: Object.values(countryData),
        backgroundColor: colors.slice(0, Object.keys(countryData).length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <Card className="rounded-2xl shadow-lg transition hover:shadow-2xl">
      <CardContent className="p-4">
        <h2 className="font-semibold text-lg mb-2">Top Country</h2>
        <div className="relative w-full max-w-sm h-64 mx-auto">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
