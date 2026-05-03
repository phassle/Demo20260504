"use client";

import ScheduleGrid from "@/components/schedule/ScheduleGrid";

export default function ScheduleView() {
  return (
    <div className="p-6" id="schedule-view">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-semibold text-white">Schedule</h2>
        <p className="text-text-secondary font-body text-sm mt-1">Jesper&apos;s Taverna</p>
      </div>
      <div className="bg-bg-panel rounded-xl p-6">
        <ScheduleGrid />
      </div>
    </div>
  );
}
