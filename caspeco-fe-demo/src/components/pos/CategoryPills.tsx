"use client";

import { categories } from "@/data/products";

interface CategoryPillsProps {
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryPills({ activeCategory, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(isActive ? null : cat)}
            className={`px-4 py-2 rounded-full text-sm font-body transition-colors cursor-pointer
              ${isActive
                ? "bg-accent-teal text-white"
                : "bg-bg-panel text-text-secondary hover:text-white hover:bg-white/10"
              }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
