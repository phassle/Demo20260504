"use client";

interface StartViewProps {
  onStart: () => void;
}

export default function StartView({ onStart }: StartViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-dark">
      <h1 className="font-display text-6xl font-extralight tracking-[18px] text-white mb-4">
        CASPECO
      </h1>
      <p className="text-text-secondary text-xl mb-12 font-body">
        Restaurant Management System
      </p>
      <button
        onClick={onStart}
        className="px-10 py-4 bg-accent-gold text-bg-dark font-display font-semibold text-lg rounded-lg
          hover:shadow-[0_0_30px_rgba(240,180,41,0.4)] hover:scale-105
          transition-all duration-200 cursor-pointer"
      >
        Start demo
      </button>
    </div>
  );
}
