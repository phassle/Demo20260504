# Implementation Plan: Caspeco Restaurant Management Demo

**Branch**: `001-caspeco-restaurant-demo` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-caspeco-restaurant-demo/spec.md`

## Summary

Build a Caspeco restaurant management demo as a Next.js App Router application with four views (Start, POS, Schedule, Analytics) and an OpenAI Realtime API voice/vision assistant. All UI and voice are built in a single project — no separate HTML prototype phase. Hardcoded Swedish-language demo data, Caspeco dark theme branding.

## Technical Context

**Language/Version**: TypeScript + Next.js 14 (App Router)
**Primary Dependencies**: Next.js, React 18, Tailwind CSS, shadcn/ui, Chart.js (react-chartjs-2), html2canvas
**Storage**: N/A — all data is hardcoded TypeScript modules
**Testing**: Manual browser testing with checkpoint scripts per user story
**Target Platform**: Desktop/laptop browsers (Chrome, Firefox, Safari, Edge), 1280px+ (min 1024px)
**Project Type**: Web application (Next.js)
**Performance Goals**: Instant view switching (<50ms), Chart.js render <500ms, voice first-audio <500ms
**Constraints**: Server-side API route for ephemeral tokens; OPENAI_API_KEY never exposed to browser
**Scale/Scope**: 4 views, ~20 products, 6 employees, 1 analytics dashboard, 1 voice assistant

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Next.js From Day One | PASS | Single Next.js project, no HTML prototype phase |
| II. Visual Fidelity | PASS | Color palette, typography (Outfit/DM Sans), dark theme from PRD |
| III. Interactivity Over Complexity | PASS | Simple React state, hardcoded data, no external backend |
| IV. Voice-First Architecture | PASS | FAB on all system views, WebRTC voice, semantic IDs, session persistence |

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-caspeco-restaurant-demo/
├── plan.md              # This file
├── research.md          # Research decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # How to run
└── tasks.md             # Implementation tasks
```

### Source Code

```text
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, global styles
│   ├── page.tsx                # Main page: view state, navigation, FAB visibility
│   └── api/
│       └── realtime/
│           └── token/
│               └── route.ts    # POST: ephemeral token from OpenAI
├── components/
│   ├── views/
│   │   ├── StartView.tsx       # Logo, tagline, "Starta demo" button
│   │   ├── POSView.tsx         # Product grid + order panel
│   │   ├── ScheduleView.tsx    # Weekly staff schedule grid
│   │   └── AnalyticsView.tsx   # Booking chart + KPI cards
│   ├── navigation/
│   │   └── Sidebar.tsx         # Nav items, logo, active state
│   ├── pos/
│   │   ├── ProductGrid.tsx     # 5-column color-coded grid
│   │   ├── CategoryPills.tsx   # Horizontal filter pills
│   │   ├── OrderPanel.tsx      # Order items, total, pay button
│   │   └── SearchField.tsx     # Real-time product search
│   ├── schedule/
│   │   └── ScheduleGrid.tsx    # Employee × day grid with station badges
│   ├── analytics/
│   │   ├── BookingChart.tsx    # Chart.js line chart
│   │   └── KPICards.tsx        # 2 rows × 4 KPI cards
│   └── voice/
│       ├── FABButton.tsx       # Floating action button with states
│       ├── StatusIndicator.tsx # Connection/speaking indicators
│       └── TranscriptSidebar.tsx # Slide-in transcript panel
├── hooks/
│   └── useRealtimeVoice.ts    # WebRTC, DataChannel, audio, tool dispatch
├── data/
│   ├── products.ts            # 20+ cafe products with categories
│   ├── employees.ts           # 6 employees + shift data
│   └── bookings.ts            # Hourly booking data + KPI values
└── lib/
    ├── voice/
    │   ├── webrtc.ts          # RTCPeerConnection, SDP exchange
    │   ├── tools.ts           # Tool definitions + execution
    │   └── screenshot.ts      # html2canvas capture + state-hash dedup
    └── constants.ts           # Colors, labels, config
```

**Structure Decision**: Single Next.js project. Views are React components. Voice is a first-class feature built alongside UI, not a separate phase.

## Build Sequence

1. Next.js project setup (Tailwind, shadcn/ui, fonts, color palette)
2. Hardcoded data modules (products, employees, bookings)
3. Start view + sidebar navigation + view switching
4. POS view (product grid, categories, search, order panel, payment)
5. Schedule view (employee grid, station badges, hour totals)
6. Analytics view (Chart.js chart, KPI cards, blue header band)
7. Voice: API route + WebRTC hook + FAB button + tool calling
8. Voice: screenshot capture + transcript sidebar
9. Polish: responsive, hover states, microphone permission handling
10. Validate against reference sketch

## Complexity Tracking

> No violations to justify — all constitution gates pass.
