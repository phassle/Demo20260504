# Spec 04: Staff Scheduling View

## Overview

The scheduling view displays a weekly staff schedule in a grid format with employees as rows and days as columns. Each shift is shown as a colored block indicating the station (Kitchen, Dining Room, etc.). The design is based on reference image `Better_Pay_Percentage.png`.

## Visual Reference

See [`../reference-sketch.html`](../reference-sketch.html) — "Vy 3: Schema / Scheduling" for the visual mockup of this view with station badges, employee grid, and hour totals.

## Reference Image: What We See

The image shows a laptop screen with:
- **Top bar:** Caspeco logo, breadcrumb-style filters: "Vecka 25" (Week 25), "Jespers Taverna", "Kostnadsalternativ" (Cost alternative), and a search field "Skriv här för att söka" (Type here to search)
- **Sub-header:** Restaurant name "Jespers Taverna" centered
- **Left column:** Employee names with role and contracted hours:
  - Tilde Kruse, Kock (Chef)
  - Hanna Höglund, Kock (Chef)
  - Smilla Sjölj, Servis (Service)
  - Aina Kilberg, Kock (Chef), 42.5 h
  - Lars-Eric Gullberg, Servis (Service)
  - Gunnar Spålin, Intermittent
- **Grid:** 7 day columns (Monday 17/6 → Sunday 23/6), each cell contains:
  - Shift time (e.g., "08:00–18:00")
  - Station label in colored block: "KÖK" (Kitchen, orange) or "MATSAL" (Dining Room, teal)
  - Some cells are empty (day off)
- **Right column:** Summary per employee:
  - "Totalt" (Total) column showing total hours
  - "Stationer" (Stations) column
  - Values: 24.0 h, 29.0 h, 22.0 h, 41.5 h, 15.5 h, 19.3 h
- **Bottom row:** "Anställningsbara" (Available for hire) section showing "Boss" with a KÖK shift
- **Footer:** "Lägg till ny person" (Add new person) and "Lägg till rad för anställningsbara" (Add row for available staff)

## User Stories

**US-4.1: View weekly schedule**
As a restaurant manager, I want to see the weekly schedule for all staff so that I can get an overview of who works when.

**Acceptance Criteria:**
- A grid displays with days of the week as columns (Mon–Sun) with dates
- Employee names are listed as rows on the left side
- The current week number is shown in the header (e.g., "Vecka 25")
- The restaurant name is shown in a sub-header

**US-4.2: See shift details per employee**
As a restaurant manager, I want to see each employee's shifts with time and station so that I know where everyone is assigned.

**Acceptance Criteria:**
- Each shift cell shows the time range (e.g., "08:00–18:00")
- Each shift cell shows the station as a colored label:
  - "KÖK" (Kitchen) — orange/amber background (#e07020)
  - "MATSAL" (Dining Room) — teal background (#2ec4b6)
- Empty cells indicate days off
- Employee role is shown under their name (Kock, Servis, etc.)

**US-4.3: See total hours per employee**
As a restaurant manager, I want to see total scheduled hours per employee so that I can manage labor costs.

**Acceptance Criteria:**
- A "Totalt" (Total) column on the right shows the sum of hours per employee
- Hours are displayed as decimal (e.g., 24.0 h, 41.5 h)
- A "Stationer" (Stations) column shows which stations the employee has been assigned to

**US-4.4: See employee roles and contract info**
As a restaurant manager, I want to see each employee's role and employment type so that I can plan appropriately.

**Acceptance Criteria:**
- Each employee row shows: Name, Role (Kock/Servis/etc.), and optionally contracted hours
- Employment type labels (e.g., "Intermittent") are shown where applicable

**US-4.5: Filter by restaurant**
As a restaurant manager, I want to filter by restaurant location so that I see the right schedule.

**Acceptance Criteria:**
- A breadcrumb/filter bar at the top shows the selected restaurant
- Filter pills for week number and restaurant name are visible
- Clicking filters does not need to work in the demo, but they should look interactive

## Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ CASPECO   [Vecka 25 ▼] [Jespers Taverna ▼] [Kostnadsalt ▼] 🔍     │
├──────────────────────────────────────────────────────────────────────┤
│                        Jespers Taverna                               │
├──────────┬────────┬────────┬────────┬────────┬────────┬────┬────┬───┤
│ Vecka 25 │ Mån    │ Tis    │ Ons    │ Tor    │ Fre    │Lör │Sön │Tot│
│          │ 17/6   │ 18/6   │ 19/6   │ 20/6   │ 21/6   │22/6│23/6│   │
├──────────┼────────┼────────┼────────┼────────┼────────┼────┼────┼───┤
│Tilde     │08-18   │08-18   │08-18   │        │        │    │    │24 │
│Kock      │        │ KÖK    │        │        │        │    │    │   │
├──────────┼────────┼────────┼────────┼────────┼────────┼────┼────┼───┤
│Hanna     │09-16   │08-16   │08-16   │        │09-16   │    │    │29 │
│Kock      │        │ KÖK    │ KÖK    │        │        │    │    │   │
├──────────┼────────┼────────┼────────┼────────┼────────┼────┼────┼───┤
│Smilla    │09-17   │09-17   │09-16   │09-16   │MATSAL  │    │    │22 │
│Servis    │MATSAL  │        │MATSAL  │MATSAL  │        │    │    │   │
└──────────┴────────┴────────┴────────┴────────┴────────┴────┴────┴───┘
```

## AI Support Button

An "AI Support" FAB is positioned in the bottom-right corner of this view. See spec 01 and [`../reference-sketch.html`](../reference-sketch.html) — "Vy 3" for placement.

## Demo Data

Hardcode 6 employees with realistic Swedish names, roles, and shift patterns for one week. Mix of Kitchen (KÖK) and Dining Room (MATSAL) stations. Total hours should range from 15–42 hours per week.
