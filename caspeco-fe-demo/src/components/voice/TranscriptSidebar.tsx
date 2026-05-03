"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/hooks/useRealtimeVoice";

interface TranscriptSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TranscriptEntry[];
}

export default function TranscriptSidebar({ isOpen, onClose, entries }: TranscriptSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div
      className={`fixed top-0 right-0 bottom-0 w-[300px] bg-bg-panel shadow-2xl z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-display font-semibold text-sm">Transcript</h3>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: "calc(100vh - 52px)" }}>
        {entries.length === 0 && (
          <p className="text-text-secondary text-sm font-body text-center mt-8">
            Transcript will appear here...
          </p>
        )}
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg text-sm font-body
              ${entry.role === "user"
                ? "bg-bg-dark text-white ml-auto max-w-[90%]"
                : entry.role === "system"
                ? "bg-white/5 text-text-secondary text-xs italic"
                : "bg-accent-teal/10 text-white max-w-[90%]"
              }`}
          >
            {entry.role !== "system" && (
              <p className="text-text-secondary text-xs mb-1">
                {entry.role === "user" ? "You" : "AI"}
              </p>
            )}
            <p>{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
