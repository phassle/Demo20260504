"use client";

import { categorySummaries, salesTotalAmount, salesTotalQuantity } from "@/data/salesData";
import { COLORS } from "@/lib/constants";

export default function DailySummary() {
  const maxAmount = Math.max(...categorySummaries.map((c) => c.totalAmount));

  return (
    <div className="space-y-6">
      {/* Total summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-panel rounded-xl p-5 border border-white/5" data-guide="sales-total">
          <p className="text-text-secondary text-sm font-body mb-1">Total Sales</p>
          <p className="text-white text-3xl font-display font-bold">
            {salesTotalAmount.toLocaleString("en-US")} <span className="text-lg text-text-secondary">SEK</span>
          </p>
        </div>
        <div className="bg-bg-panel rounded-xl p-5 border border-white/5">
          <p className="text-text-secondary text-sm font-body mb-1">Items Sold</p>
          <p className="text-white text-3xl font-display font-bold">
            {salesTotalQuantity} <span className="text-lg text-text-secondary">pcs</span>
          </p>
        </div>
        <div className="bg-bg-panel rounded-xl p-5 border border-white/5">
          <p className="text-text-secondary text-sm font-body mb-1">Categories</p>
          <p className="text-white text-3xl font-display font-bold">
            {categorySummaries.length} <span className="text-lg text-text-secondary">pcs</span>
          </p>
        </div>
      </div>

      {/* Category bar chart */}
      <div className="bg-bg-panel rounded-xl p-6 border border-white/5" data-guide="category-chart">
        <h3 className="text-white font-display font-semibold mb-4">Sales by Category</h3>
        <div className="space-y-3">
          {categorySummaries.map((cat) => {
            const widthPercent = (cat.totalAmount / maxAmount) * 100;
            const labelInside = widthPercent >= 15;
            return (
              <div key={cat.category} className="flex items-center gap-3">
                <span className="text-text-secondary text-sm font-body w-[140px] text-right shrink-0">
                  {cat.category}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-bg-dark rounded-full h-7 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center px-3 transition-all duration-500"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: COLORS.accentTeal,
                      }}
                    >
                      {labelInside && (
                        <span className="text-white text-xs font-body font-medium whitespace-nowrap">
                          {cat.totalAmount.toLocaleString("en-US")} SEK
                        </span>
                      )}
                    </div>
                  </div>
                  {!labelInside && (
                    <span className="text-text-secondary text-xs font-body font-medium whitespace-nowrap shrink-0">
                      {cat.totalAmount.toLocaleString("en-US")} SEK
                    </span>
                  )}
                </div>
                <span className="text-text-secondary text-xs font-body w-[50px] shrink-0">
                  {cat.totalQuantity} pcs
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
