import { products, type Product } from "./products";

export interface SalesEntry {
  productId: number;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  totalQuantity: number;
}

// Deterministic "random" sales data for the day
function generateSalesEntries(): SalesEntry[] {
  const quantities: Record<number, number> = {
    1: 24,  // Brewed Coffee
    2: 18,  // Cappuccino
    3: 12,  // Espresso
    4: 8,   // Vanilla Latte Deluxe
    5: 6,   // Iced Vanilla Fudge Latte
    6: 5,   // Café Mocha
    7: 7,   // Earl Grey
    8: 4,   // Green Tea
    9: 9,   // Chai Latte
    10: 14, // Croissant
    11: 6,  // Blueberry Pie
    12: 16, // Cinnamon Bun
    13: 11, // Chocolate Ball
    14: 5,  // Avocado Toast
    15: 7,  // Club Sandwich
    16: 4,  // Shrimp Sandwich
    17: 10, // Orange Juice
    18: 6,  // Carrot Ginger
    19: 8,  // Caesar Salad
    20: 6,  // Halloumi Salad
    21: 4,  // Strawberry Milkshake
    22: 5,  // Chocolate Milkshake
    23: 7,  // Berry Smoothie
    24: 5,  // Mango Passion
    25: 3,  // Chocolate Cake
    26: 4,  // Cheesecake
    27: 8,  // Hot Chocolate
    28: 3,  // White Chocolate
    29: 2,  // GF Brownie
    30: 9,  // Local Craft Beer
  };

  return products.map((p: Product) => ({
    productId: p.id,
    productName: p.name,
    category: p.category,
    quantity: quantities[p.id] || 3,
    unitPrice: p.price,
    totalAmount: (quantities[p.id] || 3) * p.price,
  }));
}

export const salesEntries: SalesEntry[] = generateSalesEntries();

export const categorySummaries: CategorySummary[] = (() => {
  const map = new Map<string, CategorySummary>();
  for (const entry of salesEntries) {
    const existing = map.get(entry.category);
    if (existing) {
      existing.totalAmount += entry.totalAmount;
      existing.totalQuantity += entry.quantity;
    } else {
      map.set(entry.category, {
        category: entry.category,
        totalAmount: entry.totalAmount,
        totalQuantity: entry.quantity,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
})();

export const salesTotalAmount = salesEntries.reduce((sum, e) => sum + e.totalAmount, 0);
export const salesTotalQuantity = salesEntries.reduce((sum, e) => sum + e.quantity, 0);
