"use client";

import { bookingKPIs, guestKPIs, type KPICard } from "@/data/bookings";

function PersonIcon() {
  return (
    <svg className="w-8 h-8 text-text-secondary opacity-50" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function KPICardComponent({ card }: { card: KPICard }) {
  return (
    <div className="bg-bg-panel rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-body mb-1">{card.label}</p>
          <p className="text-text-secondary text-xs font-body mb-3">{card.date}</p>
          <p className="text-white text-3xl font-display font-bold">
            {card.value} <span className="text-lg text-text-secondary">{card.unit}</span>
          </p>
        </div>
        <PersonIcon />
      </div>
    </div>
  );
}

export default function KPICards() {
  return (
    <div className="space-y-6" data-guide="kpi-cards">
      {/* Booking counts */}
      <div className="grid grid-cols-4 gap-4">
        {bookingKPIs.map((card, i) => (
          <KPICardComponent key={`booking-${i}`} card={card} />
        ))}
      </div>
      {/* Guest counts */}
      <div className="grid grid-cols-4 gap-4">
        {guestKPIs.map((card, i) => (
          <KPICardComponent key={`guest-${i}`} card={card} />
        ))}
      </div>
    </div>
  );
}
