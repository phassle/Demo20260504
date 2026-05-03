# Data Model: Caspeco Restaurant Management Demo

**Branch**: `001-caspeco-restaurant-demo` | **Date**: 2026-03-13

All data is hardcoded — no database or persistence layer. This document defines the shape of in-memory data structures used across all views.

## Entities

### Product

Represents a menu item in the POS register.

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier (1-based sequential) |
| name | string | Swedish product name (e.g., "Bryggkaffe", "Cappuccino") |
| price | number | Price in SEK (49-149 range) |
| category | string | One of: "Kaffe", "Te", "Bakverk", "Smorgosar", "Juice", "Sallad", "Milkshakes", "Smoothies", "Sotsaker", "Varm choklad", "Glutenfritt", "Lokalt" |
| colorGroup | string | One of: "coffee", "pastry", "drinks", "other" — maps to button background color |

**Validation**: Price must be positive. Category must be one of the defined values. At least 20 products required.

### OrderItem

Represents a line item in the current order.

| Field | Type | Description |
|-------|------|-------------|
| productId | number | Reference to Product.id |
| name | string | Product name (denormalized for display) |
| price | number | Unit price in SEK |

Each added product creates a separate line item. No quantity grouping — clicking the same product twice yields two lines.

### Order

Represents the current active order in the POS register.

| Field | Type | Description |
|-------|------|-------------|
| orderNumber | number | Sequential order number, displayed as #001, #002, etc. |
| items | OrderItem[] | List of order items |
| dineIn | boolean | True = "Äta här", False = "Ta med" |
| total | number | Calculated sum of all item prices |
| discount | number | Always 0.00 in the demo |

**State transitions**:
- Initial: Pre-populated with 4 items, orderNumber = 1, dineIn = true
- Add item: Append new OrderItem, recalculate total
- Remove item: Remove specific OrderItem by index, recalculate total
- Pay: Show confirmation, reset items to empty, increment orderNumber, dineIn = true

### Employee

Represents a staff member in the scheduling view.

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier |
| name | string | Swedish full name (e.g., "Tilde Kruse") |
| role | string | One of: "Kock", "Servis", "Intermittent" |
| contractedHours | number or null | Weekly contracted hours (null if not applicable) |

### Shift

Represents a single shift assignment for an employee on a specific day.

| Field | Type | Description |
|-------|------|-------------|
| employeeId | number | Reference to Employee.id |
| dayIndex | number | 0 = Monday, 6 = Sunday |
| startTime | string | Format "HH:MM" (e.g., "08:00") |
| endTime | string | Format "HH:MM" (e.g., "18:00") |
| station | string | One of: "KOK" (Kitchen), "MATSAL" (Dining Room) |

**Derived data**:
- Hours per shift: calculated from startTime/endTime
- Total hours per employee: sum of all shift hours in the week
- Stations per employee: unique set of station values across shifts

### BookingDataPoint

Represents one hourly data point in the analytics chart.

| Field | Type | Description |
|-------|------|-------------|
| timeSlot | string | Format "HH-HH" (e.g., "12-13", "13-14") |
| total | number | Total bookings in this hour |
| manual | number | Manual bookings |
| walkIn | number | Walk-in bookings |
| web | number | Web bookings |

### KPICard

Represents a summary metric displayed as a card.

| Field | Type | Description |
|-------|------|-------------|
| label | string | Card title (e.g., "Antal bokningar totalt") |
| value | number | Metric value |
| unit | string | Display unit ("st" for count) |
| date | string | Reference date (e.g., "17 jun 2024") |
| icon | string | Icon type ("person") |

## Relationships

```text
Product ──1:N──> OrderItem (via productId)
OrderItem ──N:1──> Order (items array)
Employee ──1:N──> Shift (via employeeId)
BookingDataPoint ──standalone (chart data array)
KPICard ──standalone (summary cards array)
```

## Demo Data Requirements

| Entity | Count | Source |
|--------|-------|--------|
| Product | 20+ | Realistic Swedish cafe items, 49-149 SEK |
| Order (initial) | 1 with 4 items | Pre-populated on POS load |
| Employee | 6 | Swedish names from PRD: Tilde Kruse, Hanna Hoglund, Smilla Sjolj, Aina Kilberg, Lars-Eric Gullberg, Gunnar Spalin |
| Shift | ~25 | Mixed KOK/MATSAL across Mon-Sun, 15-42h/week range |
| BookingDataPoint | 10 | Hourly slots 12-13 through 21-22 |
| KPICard | 8 | 4 booking counts + 4 guest counts |
