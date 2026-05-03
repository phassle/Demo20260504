"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { bookingData } from "@/data/bookings";
import { COLORS } from "@/lib/constants";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const labels = bookingData.map((d) => d.timeSlot);

const chartData = {
  labels,
  datasets: [
    {
      label: "Total Bookings",
      data: bookingData.map((d) => d.total),
      borderColor: COLORS.textPrimary,
      backgroundColor: "rgba(255,255,255,0.1)",
      tension: 0.4,
    },
    {
      label: "Manual",
      data: bookingData.map((d) => d.manual),
      borderColor: COLORS.accentGold,
      backgroundColor: "rgba(240,180,41,0.1)",
      tension: 0.4,
    },
    {
      label: "Walk-in",
      data: bookingData.map((d) => d.walkIn),
      borderColor: COLORS.accentTeal,
      backgroundColor: "rgba(46,196,182,0.1)",
      tension: 0.4,
    },
    {
      label: "Web",
      data: bookingData.map((d) => d.web),
      borderColor: COLORS.pink,
      backgroundColor: "rgba(214,74,106,0.1)",
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: COLORS.textSecondary, font: { family: "DM Sans" } },
    },
    tooltip: {
      backgroundColor: COLORS.bgPanel,
      titleColor: COLORS.textPrimary,
      bodyColor: COLORS.textSecondary,
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: COLORS.textSecondary, font: { family: "DM Sans" } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
    y: {
      ticks: { color: COLORS.textSecondary, font: { family: "DM Sans" } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
  },
};

export default function BookingChart() {
  return (
    <div className="bg-bg-panel rounded-xl p-6" data-guide="booking-chart">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-display font-semibold">Bookings Chart</h3>
          <p className="text-text-secondary text-sm font-body">Jun 17, 2024</p>
        </div>
      </div>
      <div className="h-[300px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
