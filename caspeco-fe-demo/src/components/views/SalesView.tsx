"use client";

import DailySummary from "@/components/sales/DailySummary";
import ProductReport from "@/components/sales/ProductReport";

export type SalesTab = "daily" | "products";

interface SalesViewProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  activeTab: SalesTab;
  onTabChange: (tab: SalesTab) => void;
}

export default function SalesView({ activeCategory, onCategoryChange, activeTab, onTabChange }: SalesViewProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div id="sales-view">
      {/* Blue header band */}
      <div className="bg-blue-header px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6" data-guide="sales-tabs">
            <button
              onClick={() => onTabChange("daily")}
              className={`text-sm font-body pb-1 transition-colors cursor-pointer
                ${activeTab === "daily"
                  ? "text-white font-medium border-b-2 border-white"
                  : "text-white/60 hover:text-white"
                }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => onTabChange("products")}
              className={`text-sm font-body pb-1 transition-colors cursor-pointer
                ${activeTab === "products"
                  ? "text-white font-medium border-b-2 border-white"
                  : "text-white/60 hover:text-white"
                }`}
            >
              Product Report
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div data-guide="date-picker">
              <input
                type="date"
                defaultValue={today}
                className="bg-white/10 text-white text-sm font-body px-3 py-1.5 rounded border border-white/20
                  focus:outline-none focus:border-white/40"
              />
            </div>
            <button
              data-guide="export-button"
              className="px-4 py-1.5 bg-white/10 text-white text-sm font-body rounded
                hover:bg-white/20 transition-colors cursor-pointer border border-white/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "daily" && <DailySummary />}
        {activeTab === "products" && (
          <ProductReport
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        )}
      </div>
    </div>
  );
}
