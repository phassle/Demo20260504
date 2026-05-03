"use client";

import { employees, shifts, weekDays, type Employee, type Shift } from "@/data/employees";
import { COLORS } from "@/lib/constants";

// Pre-compute lookup maps from static data (runs once at module load)
const shiftMap = new Map<string, Shift>();
const employeeHours = new Map<number, number>();
const employeeStations = new Map<number, string[]>();

for (const s of shifts) {
  shiftMap.set(`${s.employeeId}-${s.dayIndex}`, s);
}

function calcHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}

for (const emp of employees) {
  const empShifts = shifts.filter((s) => s.employeeId === emp.id);
  employeeHours.set(emp.id, empShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0));
  employeeStations.set(emp.id, Array.from(new Set(empShifts.map((s) => s.station))));
}

const STATION_COLORS: Record<string, string> = {
  "KITCHEN": COLORS.warningOrange,
  "DINING": COLORS.accentTeal,
};

function StationBadge({ station }: { station: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-body font-medium text-white"
      style={{ backgroundColor: STATION_COLORS[station] || COLORS.accentTeal }}
    >
      {station}
    </span>
  );
}

export default function ScheduleGrid() {
  return (
    <div className="overflow-x-auto">
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4" data-guide="schedule-filters">
        <span className="px-4 py-2 bg-accent-teal/20 text-accent-teal rounded-full text-sm font-body">
          Week 25
        </span>
        <span className="px-4 py-2 bg-bg-dark text-text-secondary rounded-full text-sm font-body">
          Jesper&apos;s Taverna
        </span>
        <span className="px-4 py-2 bg-bg-dark text-text-secondary rounded-full text-sm font-body">
          Cost Options
        </span>
        <div className="ml-auto">
          <input
            type="text"
            placeholder="Search staff..."
            className="px-3 py-2 bg-bg-dark text-white rounded-lg border border-white/10 text-sm font-body
              placeholder:text-text-secondary focus:outline-none focus:border-accent-teal"
          />
        </div>
      </div>

      {/* Schedule table */}
      <table className="w-full border-collapse" data-guide="schedule-grid">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 text-text-secondary text-sm font-body font-normal w-[180px]">
              Staff
            </th>
            {weekDays.map((day) => (
              <th key={day.label} className="py-3 px-2 text-text-secondary text-sm font-body font-normal text-center">
                <div>{day.label}</div>
                <div className="text-xs opacity-70">{day.date}</div>
              </th>
            ))}
            <th className="py-3 px-4 text-text-secondary text-sm font-body font-normal text-center w-[140px]">
              Total
            </th>
            <th className="py-3 px-4 text-text-secondary text-sm font-body font-normal text-center w-[120px]">
              Stations
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp: Employee, empIndex: number) => {
            const totalHours = employeeHours.get(emp.id) ?? 0;
            const stations = employeeStations.get(emp.id) ?? [];
            return (
              <tr key={emp.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <div className="text-white text-sm font-body font-medium">{emp.name}</div>
                  <div className="text-text-secondary text-xs font-body">
                    {emp.role}
                    {emp.contractedHours && ` · ${emp.contractedHours}h`}
                  </div>
                </td>
                {weekDays.map((_, dayIndex) => {
                  const shift = shiftMap.get(`${emp.id}-${dayIndex}`);
                  return (
                    <td key={dayIndex} className="py-2 px-2 text-center">
                      {shift ? (
                        <div className="bg-bg-dark rounded-lg p-2">
                          <div className="text-white text-xs font-body mb-1">
                            {shift.startTime}-{shift.endTime}
                          </div>
                          <StationBadge station={shift.station} />
                        </div>
                      ) : null}
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-center text-white text-sm font-body">
                  {totalHours.toFixed(1)} h
                </td>
                <td className="py-3 px-4 text-center" {...(empIndex === 0 ? { "data-guide": "station-badges" } : {})}>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {stations.map((s) => (
                      <StationBadge key={s} station={s} />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
