"use client";

import BookingChart from "@/components/analytics/BookingChart";
import KPICards from "@/components/analytics/KPICards";

export default function AnalyticsView() {
  return (
    <div id="analytics-view">
      {/* Blue header band */}
      <div className="bg-blue-header px-6 py-4" data-guide="analytics-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-white/60 text-sm font-body cursor-pointer hover:text-white transition-colors">
              Create new dashboard
            </span>
            <span className="text-white font-body font-medium text-sm border-b-2 border-white pb-1">
              Bookings
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              defaultValue="2024-06-17"
              className="bg-white/10 text-white text-sm font-body px-3 py-1.5 rounded border border-white/20
                focus:outline-none focus:border-white/40"
            />
            <button className="px-4 py-1.5 bg-white/10 text-white text-sm font-body rounded
              hover:bg-white/20 transition-colors cursor-pointer border border-white/20">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <BookingChart />
        <KPICards />
      </div>
    </div>
  );
}
