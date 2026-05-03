"use client";

import { type Product } from "@/data/products";
import { COLOR_GROUP_MAP } from "@/lib/constants";

interface ProductGridProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export default function ProductGrid({ products, onAddProduct }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-secondary font-body">
        Inga produkter hittades
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-3" data-guide="product-grid">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onAddProduct(product)}
          style={{ backgroundColor: COLOR_GROUP_MAP[product.colorGroup] || "#7ab89a" }}
          className="p-4 rounded-lg text-left hover:scale-105 hover:brightness-110
            transition-all duration-150 cursor-pointer min-h-[90px] flex flex-col justify-between"
        >
          <span className="text-[13px] font-body font-medium leading-tight text-[#1a1a2e]">{product.name}</span>
          <span className="text-xs font-body text-[#1a1a2e]/60 mt-auto">{product.price} kr</span>
        </button>
      ))}
    </div>
  );
}
