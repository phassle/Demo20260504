"use client";

import { useState } from "react";

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
}

interface OrderPanelProps {
  orderNumber: number;
  items: OrderItem[];
  dineIn: boolean;
  note: string;
  onNoteChange: (next: string) => void;
  onToggleDineIn: () => void;
  onRemoveItem: (index: number) => void;
  onPay: () => void;
}

export default function OrderPanel({
  orderNumber,
  items,
  dineIn,
  note,
  onNoteChange: _onNoteChange,
  onToggleDineIn,
  onRemoveItem,
  onPay,
}: OrderPanelProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const isEmpty = items.length === 0;

  const handlePay = () => {
    if (isEmpty) return;
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onPay();
    }, 1500);
  };

  return (
    <div className="bg-bg-panel rounded-lg flex flex-col h-full relative" data-guide="order-panel">
      {showConfirmation && (
        <div className="absolute inset-0 bg-bg-panel/95 z-10 flex items-center justify-center overflow-hidden rounded-lg">
          <div className="text-accent-teal animate-bounce">
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-center text-white font-body mt-2">Payment completed!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-secondary text-xs font-body">Terminal 1</span>
          <span className="text-text-secondary text-xs font-body">Terminal 2</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white font-display font-semibold">
            #{String(orderNumber).padStart(3, "0")}
          </span>
          <span className="text-text-secondary text-sm font-body">
            Items ({items.length})
          </span>
        </div>
      </div>

      {/* Dine-in / Take-away toggle */}
      <div className="px-4 py-2 border-b border-white/10" data-guide="dine-in-toggle">
        <div className="flex rounded-lg overflow-hidden bg-bg-dark">
          <button
            onClick={onToggleDineIn}
            className={`flex-1 py-2 text-sm font-body transition-colors cursor-pointer
              ${dineIn ? "bg-accent-teal text-white" : "text-text-secondary"}`}
          >
            Dine in
          </button>
          <button
            onClick={onToggleDineIn}
            className={`flex-1 py-2 text-sm font-body transition-colors cursor-pointer
              ${!dineIn ? "bg-accent-teal text-white" : "text-text-secondary"}`}
          >
            Take away
          </button>
        </div>
      </div>

      {/* Note placeholder */}
      <div className="px-4 py-2 border-b border-white/10">
        <span className={`text-sm font-body ${note ? "text-white" : "text-text-secondary"}`}>
          {note || "+ Lägg till notering"}
        </span>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm font-body truncate block">{item.name}</span>
            </div>
            <span className="text-white text-sm font-body mx-3 whitespace-nowrap">{item.price} SEK</span>
            <button
              onClick={() => onRemoveItem(index)}
              className="text-text-secondary hover:text-red-400 transition-colors cursor-pointer p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex justify-between text-text-secondary text-sm font-body mb-1">
          <span>Discounts</span>
          <span>0.00</span>
        </div>
        <div className="flex justify-between text-white font-display font-semibold text-lg mb-3">
          <span>Total SEK</span>
          <span>{total.toFixed(2)}</span>
        </div>
        <button
          onClick={handlePay}
          disabled={isEmpty}
          data-guide="pay-button"
          className={`w-full py-3 rounded-lg font-display font-semibold text-white transition-all cursor-pointer
            ${isEmpty
              ? "bg-gray-600 opacity-50 cursor-not-allowed"
              : "bg-accent-teal hover:brightness-110"
            }`}
        >
          Pay
        </button>
      </div>
    </div>
  );
}
