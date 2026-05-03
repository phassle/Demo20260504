# Spec 05: Analytics Dashboard

## Overview

The analytics view displays a booking dashboard with a line chart and KPI summary cards. It provides an overview of booking volumes broken down by source (manual, walk-in, web). The design is based on reference image `Comprehensive_Analysis.png`.

## Visual Reference

See [`../reference-sketch.html`](../reference-sketch.html) — "Vy 4: Analys / Analytics Dashboard" for the visual mockup of this view with chart, blue header band, and KPI cards.

## Reference Image: What We See

The image shows a laptop screen with:
- **Top bar:** Caspeco logo, then a blue header band with:
  - Tabs/links: "Dashboard." and "Datumintervall" (Date range)
  - Sub-navigation: "Skapa ny dashboard" (Create new dashboard) link, "Bokning" (Booking) tab active
  - Date picker: calendar icon with "2024-06-17" → "2024-06-17"
  - "Ladda om" (Reload) button and "Visa ut" (Export) option
- **Main area — Line chart:**
  - Title: "Antal bokningar graf" (Number of bookings graph)
  - Subtitle: "17 Jun 2024"
  - X-axis: Time slots from "12-13" to "21-22" (hourly intervals)
  - Y-axis: Numeric scale (~5 to ~25)
  - Three lines: "Antal bokningar" (teal/white), "Manuell" (yellow), "Walk-in" and "Webb" (separate lines)
  - Tooltip on hover at 13-14: "Antal bokningar: 11, Webb: 11"
  - Legend at bottom: ● Antal bokningar ● Manuell ● Walk-in ● Webb
- **KPI cards row (4 cards):**
  - "Antal bokningar totalt" — 17 jun 2024 — **145 st** (with person icon)
  - "Manuell" — 17 jun 2024 — **30 st** (with person icon)
  - "Walk-in" — 17 jun 2024 — **25 st** (with person icon)
  - "Web" — 17 jun 2024 — **25 st** (with person icon)
- **Second KPI row (partially visible):**
  - "Antal gäster totalt" — 17 jun 2024
  - "Manuell (gäster)" — 17 jun 2024
  - "Walk in (gäster)" — 17 jun 2024
  - "Web (gäster)" — 17 jun 2024

## User Stories

**US-5.1: View booking chart**
As a restaurant manager, I want to see a line chart of bookings over the day so that I can understand peak hours and booking patterns.

**Acceptance Criteria:**
- A line chart displays with hourly time slots on the X-axis (12:00–22:00)
- Multiple colored lines show: Total bookings (white/teal), Manual (yellow), Walk-in, and Web
- The chart title reads "Antal bokningar graf" with the selected date
- Hovering over data points shows a tooltip with values
- A legend below the chart labels each line

**US-5.2: View booking KPIs**
As a restaurant manager, I want to see total bookings broken down by source so that I get a quick summary of the day.

**Acceptance Criteria:**
- Four KPI cards are displayed in a row below the chart
- Each card shows: label, date, value (number + "st"), and an icon
- Cards: "Antal bokningar totalt" (145 st), "Manuell" (30 st), "Walk-in" (25 st), "Web" (25 st)
- Cards have a dark background with teal/dark-blue styling and subtle borders

**US-5.3: View guest count KPIs**
As a restaurant manager, I want to see total guest counts by source so that I understand covers per booking type.

**Acceptance Criteria:**
- A second row of KPI cards shows guest counts
- Cards: "Antal gäster totalt", "Manuell (gäster)", "Walk in (gäster)", "Web (gäster)"
- Values are hardcoded demo data (e.g., 380, 85, 60, 55)

**US-5.4: Select date range**
As a restaurant manager, I want to see a date picker in the header so that I can select which day to view.

**Acceptance Criteria:**
- A date range selector is visible in the blue header band
- Shows two date fields (from/to) with a calendar icon
- Pre-filled with a demo date (2024-06-17)
- Does not need to be functional — visual only

**US-5.5: Switch dashboard tabs**
As a restaurant manager, I want to see tab options for different dashboards so that I can navigate between analysis views.

**Acceptance Criteria:**
- A tab bar or sub-navigation shows "Bokning" (Booking) as the active tab
- Additional tabs visible but inactive (e.g., "Försäljning", "Personal")
- A "Skapa ny dashboard" link is visible
- A "Ladda om" (Reload) button is available

## Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ CASPECO                                                              │
├──────────────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ BLUE HEADER BAND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ + Skapa ny dashboard  [Bokning]    📅 2024-06-17 → 2024-06-17  🔄  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              Antal bokningar graf                                     │
│              17 Jun 2024                                             │
│                                                                      │
│   25 ┤                                                               │
│   20 ┤        ╱╲              ╱╲                                     │
│   15 ┤   ╱╲──╱  ╲     ╱╲───╱  ╲──                                  │
│   10 ┤──╱    ╱    ╲───╱  ╲╱      ╲──                                │
│    5 ┤                                                               │
│      └───┬────┬────┬────┬────┬────┬────┬────┬────┬───                │
│        12-13 13-14 14-15 15-16 16-17 17-18 18-19 ...                 │
│                                                                      │
│  ● Antal bokningar  ● Manuell  ● Walk-in  ● Webb                    │
│                                                                      │
├────────────────┬────────────────┬────────────────┬───────────────────┤
│ Bokningar tot. │   Manuell      │   Walk-in      │     Web           │
│ 17 jun 2024    │   17 jun 2024  │   17 jun 2024  │   17 jun 2024    │
│    145 st      │     30 st      │     25 st      │     25 st        │
├────────────────┼────────────────┼────────────────┼───────────────────┤
│ Gäster totalt  │ Manuell (gäst.)│ Walk-in (gäst.)│   Web (gäster)   │
│ 17 jun 2024    │   17 jun 2024  │   17 jun 2024  │   17 jun 2024    │
│    380 st      │     85 st      │     60 st      │     55 st        │
└────────────────┴────────────────┴────────────────┴───────────────────┘
```

## AI Support Button

An "AI Support" FAB is positioned in the bottom-right corner of this view. See spec 01 and [`../reference-sketch.html`](../reference-sketch.html) — "Vy 4" for placement.

## Technical Notes

- Use a charting library via CDN (e.g., Chart.js) for the line chart
- KPI cards should use the same dark card styling as the rest of the app
- The blue header band (#1a6fb5) is a distinct design element unique to this view
- Person/user icons on KPI cards can be simple SVG silhouettes
