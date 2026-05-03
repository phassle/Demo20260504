export interface BookingDataPoint {
  timeSlot: string;
  total: number;
  manual: number;
  walkIn: number;
  web: number;
}

export interface KPICard {
  label: string;
  value: number;
  unit: string;
  date: string;
  icon: string;
}

export const bookingData: BookingDataPoint[] = [
  { timeSlot: "12-13", total: 12, manual: 5, walkIn: 4, web: 3 },
  { timeSlot: "13-14", total: 15, manual: 6, walkIn: 5, web: 4 },
  { timeSlot: "14-15", total: 8, manual: 3, walkIn: 2, web: 3 },
  { timeSlot: "15-16", total: 5, manual: 2, walkIn: 1, web: 2 },
  { timeSlot: "16-17", total: 4, manual: 1, walkIn: 2, web: 1 },
  { timeSlot: "17-18", total: 7, manual: 3, walkIn: 2, web: 2 },
  { timeSlot: "18-19", total: 14, manual: 5, walkIn: 4, web: 5 },
  { timeSlot: "19-20", total: 10, manual: 3, walkIn: 4, web: 3 },
  { timeSlot: "20-21", total: 4, manual: 1, walkIn: 1, web: 2 },
  { timeSlot: "21-22", total: 1, manual: 1, walkIn: 0, web: 0 },
];

export const bookingKPIs: KPICard[] = [
  { label: "Total Bookings", value: 80, unit: "pcs", date: "Jun 17, 2024", icon: "person" },
  { label: "Manual", value: 30, unit: "pcs", date: "Jun 17, 2024", icon: "person" },
  { label: "Walk-in", value: 25, unit: "pcs", date: "Jun 17, 2024", icon: "person" },
  { label: "Web", value: 25, unit: "pcs", date: "Jun 17, 2024", icon: "person" },
];

export const guestKPIs: KPICard[] = [
  { label: "Total Guests", value: 200, unit: "pcs", date: "Jun 17, 2024", icon: "person" },
  { label: "Manual", value: 85, unit: "pcs", date: "Jun 17, 2024", icon: "person" },
  { label: "Walk in", value: 60, unit: "pcs", date: "Jun 17, 2024", icon: "person" },
  { label: "Web", value: 55, unit: "pcs", date: "Jun 17, 2024", icon: "person" },
];
