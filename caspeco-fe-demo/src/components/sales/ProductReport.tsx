"use client";

import { useState, useMemo } from "react";
import { salesEntries } from "@/data/salesData";
import { categories } from "@/data/products";

interface ProductReportProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function ProductReport({ activeCategory, onCategoryChange }: ProductReportProps) {
  const [sortCol, setSortCol] = useState<"name" | "quantity" | "total">("total");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let entries = salesEntries;
    if (activeCategory) {
      entries = entries.filter((e) => e.category === activeCategory);
    }
    return [...entries].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "name") cmp = a.productName.localeCompare(b.productName, "en");
      else if (sortCol === "quantity") cmp = a.quantity - b.quantity;
      else cmp = a.totalAmount - b.totalAmount;
      return sortAsc ? cmp : -cmp;
    });
  }, [activeCategory, sortCol, sortAsc]);

  const filteredTotal = filtered.reduce((sum, e) => sum + e.totalAmount, 0);
  const filteredQuantity = filtered.reduce((sum, e) => sum + e.quantity, 0);

  const handleSort = (col: "name" | "quantity" | "total") => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 text-text-secondary">
      {sortCol === col ? (sortAsc ? "▲" : "▼") : ""}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex items-center gap-4" data-guide="category-filter">
        <select
          value={activeCategory || ""}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          className="bg-bg-panel text-white text-sm font-body px-4 py-2 rounded-lg border border-white/10
            focus:outline-none focus:border-accent-teal appearance-none cursor-pointer pr-8"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238899aa' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="text-text-secondary text-sm font-body">
          {filtered.length} products · {filteredQuantity} pcs · {filteredTotal.toLocaleString("en-US")} SEK
        </span>
      </div>

      {/* Product table */}
      <div className="bg-bg-panel rounded-xl border border-white/5 overflow-hidden" data-guide="product-table">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th
                onClick={() => handleSort("name")}
                className="text-left py-3 px-4 text-text-secondary text-sm font-body font-normal cursor-pointer hover:text-white transition-colors"
              >
                Product<SortIcon col="name" />
              </th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-body font-normal">
                Category
              </th>
              <th
                onClick={() => handleSort("quantity")}
                className="text-right py-3 px-4 text-text-secondary text-sm font-body font-normal cursor-pointer hover:text-white transition-colors"
              >
                Qty<SortIcon col="quantity" />
              </th>
              <th className="text-right py-3 px-4 text-text-secondary text-sm font-body font-normal">
                Unit Price
              </th>
              <th
                onClick={() => handleSort("total")}
                className="text-right py-3 px-4 text-text-secondary text-sm font-body font-normal cursor-pointer hover:text-white transition-colors"
              >
                Total<SortIcon col="total" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.productId} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-white text-sm font-body">{entry.productName}</td>
                <td className="py-3 px-4 text-text-secondary text-sm font-body">{entry.category}</td>
                <td className="py-3 px-4 text-white text-sm font-body text-right">{entry.quantity}</td>
                <td className="py-3 px-4 text-text-secondary text-sm font-body text-right">{entry.unitPrice} SEK</td>
                <td className="py-3 px-4 text-white text-sm font-body font-medium text-right">
                  {entry.totalAmount.toLocaleString("en-US")} SEK
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td className="py-3 px-4 text-white text-sm font-body font-semibold">Total</td>
              <td></td>
              <td className="py-3 px-4 text-white text-sm font-body font-semibold text-right">{filteredQuantity}</td>
              <td></td>
              <td className="py-3 px-4 text-white text-sm font-body font-semibold text-right">
                {filteredTotal.toLocaleString("en-US")} SEK
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
