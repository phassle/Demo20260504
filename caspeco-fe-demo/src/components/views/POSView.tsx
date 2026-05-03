"use client";

import { useReducer, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { products as allProducts, type Product } from "@/data/products";
import CategoryPills from "@/components/pos/CategoryPills";
import SearchField from "@/components/pos/SearchField";
import ProductGrid from "@/components/pos/ProductGrid";
import OrderPanel, { type OrderItem } from "@/components/pos/OrderPanel";

interface OrderState {
  orderNumber: number;
  items: OrderItem[];
  dineIn: boolean;
}

type OrderAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; index: number }
  | { type: "TOGGLE_DINE_IN" }
  | { type: "PAY" };

const INITIAL_ITEMS: OrderItem[] = [
  { productId: 4, name: "Vanilla Latte Deluxe", price: 79 },
  { productId: 11, name: "Blueberry Pie", price: 124 },
  { productId: 10, name: "Croissant", price: 65 },
  { productId: 5, name: "Iced Vanilla Fudge Latte", price: 82 },
];

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, {
          productId: action.product.id,
          name: action.product.name,
          price: action.product.price,
        }],
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((_, i) => i !== action.index),
      };
    case "TOGGLE_DINE_IN":
      return { ...state, dineIn: !state.dineIn };
    case "PAY":
      return {
        orderNumber: state.orderNumber + 1,
        items: [],
        dineIn: true,
      };
    default:
      return state;
  }
}

export interface POSViewHandle {
  addProduct: (product: Product) => void;
}

const POSView = forwardRef<POSViewHandle>(function POSView(_, ref) {
  const [order, dispatch] = useReducer(orderReducer, {
    orderNumber: 1,
    items: INITIAL_ITEMS,
    dineIn: true,
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  useImperativeHandle(ref, () => ({
    addProduct: (product: Product) => dispatch({ type: "ADD_ITEM", product }),
  }));

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesCategory = !activeCategory || p.category === activeCategory;
      const matchesSearch = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchText]);

  return (
    <div className="flex h-screen" id="pos-view">
      {/* Product area - ~70% */}
      <div className="flex-[7] p-6 overflow-y-auto">
        <div data-guide="search-field">
          <SearchField value={searchText} onChange={setSearchText} />
        </div>
        <div data-guide="category-pills">
          <CategoryPills activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
        <ProductGrid
          products={filteredProducts}
          onAddProduct={(p) => dispatch({ type: "ADD_ITEM", product: p })}
        />
      </div>

      {/* Order panel - ~30% */}
      <div className="flex-[3] p-4 pl-0">
        <OrderPanel
          orderNumber={order.orderNumber}
          items={order.items}
          dineIn={order.dineIn}
          onToggleDineIn={() => dispatch({ type: "TOGGLE_DINE_IN" })}
          onRemoveItem={(i) => dispatch({ type: "REMOVE_ITEM", index: i })}
          onPay={() => dispatch({ type: "PAY" })}
        />
      </div>
    </div>
  );
});

export default POSView;
