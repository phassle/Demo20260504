export interface Employee {
  id: number;
  name: string;
  role: "Chef" | "Server" | "Intermittent";
  contractedHours: number | null;
}

export interface Shift {
  employeeId: number;
  dayIndex: number; // 0=Mon, 6=Sun
  startTime: string;
  endTime: string;
  station: "KITCHEN" | "DINING";
}

export const employees: Employee[] = [
  { id: 1, name: "Tilde Kruse", role: "Chef", contractedHours: null },
  { id: 2, name: "Hanna Höglund", role: "Chef", contractedHours: null },
  { id: 3, name: "Smilla Sjölj", role: "Server", contractedHours: null },
  { id: 4, name: "Aina Kilberg", role: "Chef", contractedHours: 42.5 },
  { id: 5, name: "Lars-Eric Gullberg", role: "Server", contractedHours: null },
  { id: 6, name: "Gunnar Spålin", role: "Intermittent", contractedHours: null },
];

export const shifts: Shift[] = [
  // Tilde Kruse (id: 1) - KÖK heavy week
  { employeeId: 1, dayIndex: 0, startTime: "08:00", endTime: "16:00", station: "KITCHEN" },
  { employeeId: 1, dayIndex: 1, startTime: "08:00", endTime: "16:00", station: "KITCHEN" },
  { employeeId: 1, dayIndex: 2, startTime: "08:00", endTime: "16:00", station: "KITCHEN" },
  { employeeId: 1, dayIndex: 3, startTime: "08:00", endTime: "18:00", station: "KITCHEN" },
  { employeeId: 1, dayIndex: 4, startTime: "08:00", endTime: "16:00", station: "KITCHEN" },
  // Hanna Höglund (id: 2) - Mix KÖK/MATSAL
  { employeeId: 2, dayIndex: 0, startTime: "10:00", endTime: "18:00", station: "KITCHEN" },
  { employeeId: 2, dayIndex: 1, startTime: "10:00", endTime: "18:00", station: "DINING" },
  { employeeId: 2, dayIndex: 3, startTime: "08:00", endTime: "16:00", station: "KITCHEN" },
  { employeeId: 2, dayIndex: 4, startTime: "10:00", endTime: "18:00", station: "KITCHEN" },
  { employeeId: 2, dayIndex: 5, startTime: "10:00", endTime: "16:00", station: "DINING" },
  // Smilla Sjölj (id: 3) - MATSAL
  { employeeId: 3, dayIndex: 0, startTime: "11:00", endTime: "19:00", station: "DINING" },
  { employeeId: 3, dayIndex: 1, startTime: "11:00", endTime: "19:00", station: "DINING" },
  { employeeId: 3, dayIndex: 2, startTime: "11:00", endTime: "19:00", station: "DINING" },
  { employeeId: 3, dayIndex: 4, startTime: "11:00", endTime: "19:00", station: "DINING" },
  { employeeId: 3, dayIndex: 5, startTime: "12:00", endTime: "18:00", station: "DINING" },
  // Aina Kilberg (id: 4) - Full week KÖK
  { employeeId: 4, dayIndex: 0, startTime: "06:00", endTime: "14:00", station: "KITCHEN" },
  { employeeId: 4, dayIndex: 1, startTime: "06:00", endTime: "14:00", station: "KITCHEN" },
  { employeeId: 4, dayIndex: 2, startTime: "06:00", endTime: "14:30", station: "KITCHEN" },
  { employeeId: 4, dayIndex: 3, startTime: "06:00", endTime: "14:00", station: "KITCHEN" },
  { employeeId: 4, dayIndex: 4, startTime: "06:00", endTime: "14:00", station: "KITCHEN" },
  { employeeId: 4, dayIndex: 6, startTime: "08:00", endTime: "13:00", station: "KITCHEN" },
  // Lars-Eric Gullberg (id: 5) - MATSAL part week
  { employeeId: 5, dayIndex: 1, startTime: "16:00", endTime: "23:00", station: "DINING" },
  { employeeId: 5, dayIndex: 3, startTime: "16:00", endTime: "23:00", station: "DINING" },
  { employeeId: 5, dayIndex: 5, startTime: "16:00", endTime: "23:00", station: "DINING" },
  // Gunnar Spålin (id: 6) - Intermittent
  { employeeId: 6, dayIndex: 4, startTime: "10:00", endTime: "18:00", station: "DINING" },
  { employeeId: 6, dayIndex: 5, startTime: "10:00", endTime: "18:00", station: "KITCHEN" },
];

export const weekDays = [
  { label: "Mon", date: "6/16" },
  { label: "Tue", date: "6/17" },
  { label: "Wed", date: "6/18" },
  { label: "Thu", date: "6/19" },
  { label: "Fri", date: "6/20" },
  { label: "Sat", date: "6/21" },
  { label: "Sun", date: "6/22" },
];
