"use client";

import type { VoiceState } from "@/hooks/useRealtimeVoice";

interface StatusIndicatorProps {
  state: VoiceState;
}

export default function StatusIndicator({ state }: StatusIndicatorProps) {
  if (state === "idle" || state === "disabled") return null;

  const labels: Record<string, string> = {
    connecting: "Ansluter...",
    connected: "Ansluten",
    "ai-speaking": "AI talar...",
    "user-speaking": "Lyssnar...",
  };

  const colors: Record<string, string> = {
    connecting: "bg-accent-gold",
    connected: "bg-accent-teal",
    "ai-speaking": "bg-accent-teal",
    "user-speaking": "bg-green",
  };

  return (
    <div className="fixed bottom-24 right-6 flex items-center gap-2 bg-bg-panel rounded-full px-4 py-2 shadow-lg z-50">
      <span className={`w-2.5 h-2.5 rounded-full ${colors[state] || "bg-gray-500"}
        ${state === "ai-speaking" || state === "connecting" ? "animate-pulse" : ""}`}
      />
      <span className="text-white text-sm font-body">{labels[state] || state}</span>
    </div>
  );
}
