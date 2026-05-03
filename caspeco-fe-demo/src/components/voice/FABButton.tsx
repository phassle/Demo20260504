"use client";

import type { VoiceState } from "@/hooks/useRealtimeVoice";

interface FABButtonProps {
  onClick?: () => void;
  state: VoiceState;
  onTranscriptToggle?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
}

export default function FABButton({ onClick, state, onTranscriptToggle, isMuted, onMuteToggle }: FABButtonProps) {
  const isDisabled = state === "disabled";
  const isActive = state !== "idle" && state !== "disabled";

  const tooltip = isDisabled
    ? "Voice unavailable"
    : isActive
    ? "Avsluta röstassistent"
    : "AI Support";

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
      {isActive && onMuteToggle && (
        <button
          onClick={onMuteToggle}
          title={isMuted ? "Slå på mikrofon" : "Stäng av mikrofon"}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer
            ${isMuted
              ? "bg-red-500/80 text-white"
              : "bg-bg-panel text-text-secondary hover:text-white"
            }`}
        >
          {isMuted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3z" />
            </svg>
          )}
        </button>
      )}
      {isActive && onTranscriptToggle && (
        <button
          onClick={onTranscriptToggle}
          title="Visa transkript"
          className="w-10 h-10 rounded-full bg-bg-panel text-text-secondary hover:text-white
            flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
      <button
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        title={tooltip}
        className={`w-14 h-14 rounded-full flex items-center justify-center
          shadow-lg transition-all duration-200 cursor-pointer
          ${isDisabled
            ? "bg-gray-600 opacity-50 cursor-not-allowed"
            : isActive
            ? "bg-red-500 hover:bg-red-600"
            : "bg-accent-teal hover:scale-110 hover:shadow-[0_0_20px_rgba(46,196,182,0.4)]"
          }
          ${state === "ai-speaking" ? "animate-pulse" : ""}
        `}
      >
        {isActive ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </button>
    </div>
  );
}
