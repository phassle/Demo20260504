export const COLORS = {
  bgDark: "#1a1f2e",
  bgPanel: "#232a3a",
  accentTeal: "#2ec4b6",
  accentGold: "#f0b429",
  warningOrange: "#e07020",
  pink: "#d64a6a",
  green: "#5ab87a",
  textPrimary: "#ffffff",
  textSecondary: "#8899aa",
  blueHeader: "#1a6fb5",
} as const;

export const COLOR_GROUP_MAP: Record<string, string> = {
  coffee: "#e8808e",
  pastry: "#f0c050",
  drinks: "#a8cce0",
  other: "#a0d4c0",
};

export const VIEW_IDS = {
  START: "start",
  POS: "pos",
  SCHEDULE: "schedule",
  ANALYTICS: "analytics",
  SALES: "sales",
  KB: "kb",
} as const;

export type ViewId = (typeof VIEW_IDS)[keyof typeof VIEW_IDS];

export const NAV_ITEMS = [
  { id: VIEW_IDS.POS, label: "POS", icon: "pos" },
  { id: VIEW_IDS.SALES, label: "Sales", icon: "sales" },
  { id: VIEW_IDS.SCHEDULE, label: "Schedule", icon: "schedule" },
  { id: VIEW_IDS.ANALYTICS, label: "Analytics", icon: "analytics" },
  { id: VIEW_IDS.KB, label: "Knowledge Base", icon: "kb" },
] as const;
