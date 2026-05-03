export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  colorGroup: "coffee" | "pastry" | "drinks" | "other";
}

export const products: Product[] = [
  // Coffee
  { id: 1, name: "Brewed Coffee", price: 49, category: "Coffee", colorGroup: "coffee" },
  { id: 2, name: "Cappuccino", price: 62, category: "Coffee", colorGroup: "coffee" },
  { id: 3, name: "Espresso", price: 39, category: "Coffee", colorGroup: "coffee" },
  { id: 4, name: "Vanilla Latte Deluxe", price: 79, category: "Coffee", colorGroup: "coffee" },
  { id: 5, name: "Iced Vanilla Fudge Latte", price: 82, category: "Coffee", colorGroup: "coffee" },
  { id: 6, name: "Café Mocha", price: 72, category: "Coffee", colorGroup: "coffee" },
  // Tea
  { id: 7, name: "Earl Grey", price: 49, category: "Tea", colorGroup: "drinks" },
  { id: 8, name: "Green Tea", price: 49, category: "Tea", colorGroup: "drinks" },
  { id: 9, name: "Chai Latte", price: 65, category: "Tea", colorGroup: "drinks" },
  // Pastries
  { id: 10, name: "Croissant", price: 65, category: "Pastries", colorGroup: "pastry" },
  { id: 11, name: "Blueberry Pie", price: 124, category: "Pastries", colorGroup: "pastry" },
  { id: 12, name: "Cinnamon Bun", price: 55, category: "Pastries", colorGroup: "pastry" },
  { id: 13, name: "Chocolate Ball", price: 45, category: "Pastries", colorGroup: "pastry" },
  // Sandwiches
  { id: 14, name: "Avocado Toast", price: 109, category: "Sandwiches", colorGroup: "other" },
  { id: 15, name: "Club Sandwich", price: 129, category: "Sandwiches", colorGroup: "other" },
  { id: 16, name: "Shrimp Sandwich", price: 139, category: "Sandwiches", colorGroup: "other" },
  // Fresh Juice
  { id: 17, name: "Orange Juice", price: 69, category: "Fresh Juice", colorGroup: "drinks" },
  { id: 18, name: "Carrot Ginger", price: 75, category: "Fresh Juice", colorGroup: "drinks" },
  // Salad
  { id: 19, name: "Caesar Salad", price: 139, category: "Salad", colorGroup: "other" },
  { id: 20, name: "Halloumi Salad", price: 129, category: "Salad", colorGroup: "other" },
  // Milkshakes
  { id: 21, name: "Strawberry Milkshake", price: 89, category: "Milkshakes", colorGroup: "drinks" },
  { id: 22, name: "Chocolate Milkshake", price: 89, category: "Milkshakes", colorGroup: "drinks" },
  // Smoothies
  { id: 23, name: "Berry Smoothie", price: 85, category: "Smoothies", colorGroup: "drinks" },
  { id: 24, name: "Mango Passion", price: 85, category: "Smoothies", colorGroup: "drinks" },
  // Sweets
  { id: 25, name: "Chocolate Cake", price: 75, category: "Sweets", colorGroup: "pastry" },
  { id: 26, name: "Cheesecake", price: 95, category: "Sweets", colorGroup: "pastry" },
  // Hot Chocolate
  { id: 27, name: "Hot Chocolate", price: 59, category: "Hot Chocolate", colorGroup: "drinks" },
  { id: 28, name: "White Chocolate", price: 65, category: "Hot Chocolate", colorGroup: "drinks" },
  // Gluten Free
  { id: 29, name: "GF Brownie", price: 69, category: "Gluten Free", colorGroup: "pastry" },
  // Local
  { id: 30, name: "Local Craft Beer", price: 89, category: "Local", colorGroup: "other" },
];

export const categories = [
  "Coffee", "Tea", "Pastries", "Sandwiches", "Fresh Juice",
  "Salad", "Milkshakes", "Smoothies", "Sweets", "Hot Chocolate",
  "Gluten Free", "Local",
];
