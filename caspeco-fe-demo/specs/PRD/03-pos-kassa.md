# Spec 03: POS Register

## Overview

The POS view is a register interface optimized for tablet/touchscreen that displays products in a grid with an order panel on the right. The design is based on reference image `Optimize_Purchases.png`.

## Visual Reference

See [`../reference-sketch.html`](../reference-sketch.html) — "Vy 2: POS / Kassa" for the visual mockup of this view with exact colors, product grid layout, and order panel.

## Reference Image: What We See

The image shows a tablet with:
- **Left side (~70%):** Product grid
  - Top: Search field with "Sök efter artiklar" (Search for items)
  - Row of category buttons (pills): Kaffe, Te, Bakverk, Smörgåsar, Färskpressad juice, Sallad, Milkshakes, Smoothies, Sötsaker, Varm choklad, Glutenfritt, Lokalt
  - Below: Grid of product buttons (5 columns × 4 visible rows)
  - Each product button shows: product name (e.g., "Bryggkaffe", "Cappuccino", "Latte") and price (e.g., 1250.00 / 995.00 / 49.00)
  - Product buttons are color-coded in various pastel colors: pink/coral, yellow/gold, blue-green, green/mint — grouped by category
- **Right side (~30%):** Order panel
  - Order number: #001
  - Heading: "Artiklar (4)" (Items)
  - Item list: "1 x Lyxlatte med vanilj — 79.00", "1 x Blåbärspaj — 124.00", "1 x Croissant — 65.00", "1 x Islatte vanilj/fudge — 82.00"
  - Bottom: Toggle "Äta här / Ta med" (Dine in / Take away)
  - Total: "Totalt SEK 350.00"
  - Row with "Varav rabatter 0.00" (Of which discounts)
  - Large teal "Betala" (Pay) button
  - Below: "Terminal 1 | Terminal 2"

## User Stories

**US-3.1: View product categories**
As register staff, I want to see category buttons at the top so that I can quickly filter products by type.

**Acceptance Criteria:**
- At least 10 category buttons are displayed in a horizontal row (wraps if needed)
- Categories: Kaffe, Te, Bakverk, Smörgåsar, Färskpressad juice, Sallad, Milkshakes, Smoothies, Sötsaker, Varm choklad, Glutenfritt, Lokalt
- Buttons have rounded corners (pill shape) with dark background and light text
- Active category has an accent color highlight
- Clicking a category filters the product grid (in the demo, visual highlight is sufficient)

**US-3.2: View products in grid**
As register staff, I want to see products as large buttons in a grid so that I can quickly tap the right product.

**Acceptance Criteria:**
- Products are displayed in a grid with 5 columns
- Each product button shows: product name and price in SEK
- Buttons are color-coded by category:
  - Coffee: pink/coral (#d64a6a / #e07070)
  - Pastry: yellow/gold (#f0b429 / #d4a030)
  - Drinks: blue-green/teal (#5ab8a0 / #7ecfc0)
  - Other: mint/green (#7ab89a)
- At least 15–20 products are visible (hardcoded demo data)
- Clicking a product adds it to the order list

**US-3.3: View current order**
As register staff, I want to see a list of selected items on the right so that I can keep track of the customer's order.

**Acceptance Criteria:**
- The order panel shows the order number (#001)
- The heading shows the item count, e.g., "Artiklar (4)"
- Each row shows: quantity × item name and price
- Total is clearly displayed at the bottom with "Totalt SEK XXX.00"
- A "Äta här / Ta med" (Dine in / Take away) toggle is above the total

**US-3.4: Pay for order**
As register staff, I want to press a pay button so that I can complete the purchase.

**Acceptance Criteria:**
- A large, clear "Betala" (Pay) button in teal (#2ec4b6)
- Below the button: "Terminal 1" and "Terminal 2" as selectable options
- Clicking Pay shows a brief confirmation animation (e.g., checkmark) and clears the order
- The order number increases to #002 after a paid order

**US-3.5: Search for a product**
As register staff, I want to search for a product via the search field so that I can quickly find items not visible in the grid.

**Acceptance Criteria:**
- A search field with placeholder "Sök efter artiklar" is above the category buttons
- Search filters the product grid in real-time (in the demo: simple text matching)

## Layout

```
┌──────────────────────────────────────────┬───────────────┐
│ 🔍 Sök efter artiklar                   │  #001         │
│                                          │  Artiklar (4) │
│ [Kaffe][Te][Bakverk][Smörgåsar][Juice].. │               │
│ [Milkshakes][Smoothies][Sötsaker]...     │ 1x Lyxlatte   79│
│                                          │ 1x Blåbärspaj 124│
│ ┌────────┬────────┬────────┬────────┐    │ 1x Croissant   65│
│ │Bryggkaf│Cappucc │ Latte  │Skumtom │    │ 1x Islatte     82│
│ │1250.00 │ 995.00 │1195.00 │1195.00 │    │               │
│ ├────────┼────────┼────────┼────────┤    │               │
│ │Pumpalat│Latte v │Lyxlatte│American│    │ Äta här/Ta med│
│ │  49.00 │  49.00 │  49.00 │  49.00 │    │               │
│ ├────────┼────────┼────────┼────────┤    │ Totalt    350 │
│ │Cortado │Flat wh │Kaffe m │Latte m │    │ Rabatt    0.00│
│ │  49.00 │  49.00 │  49.00 │  49.00 │    │               │
│ ├────────┼────────┼────────┼────────┤    │  [  BETALA  ] │
│ │Balanoor│Bala lg │        │        │    │               │
│ │  49.00 │  49.00 │        │        │    │ Term 1 | Term2│
│ └────────┴────────┴────────┴────────┘    │               │
└──────────────────────────────────────────┴───────────────┘
```

## AI Support Button

An "AI Support" FAB is positioned in the bottom-right corner of this view. See spec 01 and [`../reference-sketch.html`](../reference-sketch.html) — "Vy 2" for placement.

## Demo Data

Hardcode at least 20 products with realistic Swedish café prices (49–149 SEK). Start with 4 items already in the order so it looks alive right away.
