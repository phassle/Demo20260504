# Tasks: Caspeco Restaurant Management Demo

**Input**: Design documents from `/specs/001-caspeco-restaurant-demo/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Manual checkpoint scripts per user story (inline).

**Organization**: Tasks grouped by user story. Single Next.js project — no HTML prototype phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- All file paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Next.js project initialization with Caspeco design system

- [x] T001 Initialize Next.js 14 project with App Router and TypeScript; install dependencies: tailwindcss, shadcn/ui, chart.js, react-chartjs-2, html2canvas in project root
- [x] T002 Configure Tailwind with Caspeco color palette (bg-dark: #1a1f2e, bg-panel: #232a3a, accent-teal: #2ec4b6, accent-gold: #f0b429, warning-orange: #e07020, pink: #d64a6a, green: #5ab87a, text-primary: #ffffff, text-secondary: #8899aa, blue-header: #1a6fb5) in tailwind.config.ts
- [x] T003 Configure Google Fonts (Outfit for display, DM Sans for body) in src/app/layout.tsx with global dark background and base typography styles

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hardcoded data modules and shared layout that all views depend on

- [x] T004 Create hardcoded product data (20+ items) with id, name, price, category, colorGroup fields in src/data/products.ts — categories: Kaffe, Te, Bakverk, Smörgåsar, Färskpressad juice, Sallad, Milkshakes, Smoothies, Sötsaker, Varm choklad, Glutenfritt, Lokalt — prices 49-149 SEK
- [x] T005 [P] Create hardcoded employee and shift data (6 employees: Tilde Kruse/Kock, Hanna Höglund/Kock, Smilla Sjölj/Servis, Aina Kilberg/Kock/42.5h, Lars-Eric Gullberg/Servis, Gunnar Spålin/Intermittent; ~25 shifts with KÖK/MATSAL stations) in src/data/employees.ts
- [x] T006 [P] Create hardcoded booking data (10 hourly datapoints 12-13 through 21-22) and KPI card data (8 cards: Antal bokningar totalt 80 st = Manuell 30 + Walk-in 25 + Web 25; Antal gäster totalt 200 st = Manuell 85 + Walk-in 60 + Web 55) in src/data/bookings.ts
- [x] T007 Create shared constants: color mappings, category list, view IDs, Swedish labels in src/lib/constants.ts

**Checkpoint**: Data modules importable, `npm run dev` starts without errors

---

## Phase 3: User Story 1 — Launch demo and navigate between views (Priority: P1) MVP

**Goal**: Presenter opens the app, sees start screen, clicks "Starta demo", navigates between all system views via sidebar.

**Manual Test**: Open localhost:3000. Verify start view with logo + button. Click "Starta demo" → POS loads with fade. Click Kassa/Schema/Analys in sidebar — each view loads, active item highlights. Click logo → back to start. FAB visible on system views, hidden on start.

### Implementation for User Story 1

- [x] T008 [US1] Build StartView component: centered Caspeco logo ("CASPECO" in Outfit font), tagline "Restaurant Management System", "Starta demo" button (gold #f0b429, dark text, hover glow) in src/components/views/StartView.tsx
- [x] T009 [US1] Build Sidebar component: fixed left sidebar (~220px), Caspeco logo at top, three nav items (Kassa, Schema, Analys) with icons, active state teal highlight, logo click returns to start in src/components/navigation/Sidebar.tsx
- [x] T010 [US1] Build main page layout: view state management (useState), showView function, fade transition (200-300ms opacity via CSS transition), sidebar visibility (hidden on start), voice-control-container div on each system view in src/app/page.tsx
- [x] T011 [US1] Build FAB placeholder: circular teal button (#2ec4b6) fixed bottom-right, lightbulb icon, tooltip "AI Support", disabled state initially, visible on system views only in src/components/voice/FABButton.tsx

**Checkpoint**: US1 complete — navigation works, FAB visible, voice containers present

---

## Phase 4: User Story 2 — POS register with order management (Priority: P1)

**Goal**: Interactive POS with product grid, category filtering, search, order panel with add/remove, dine-in/take-away toggle, payment flow. Pre-populated with 4 items.

**Manual Test**: Navigate to POS. Verify 20+ products in 5-column grid. Click "Kaffe" pill → only coffee shows. Type "Croissant" → one result. Click product → appears in order. Click X → removed. Toggle "Äta här/Ta med". Click "Betala" → checkmark animation, order clears, number → #002. Verify 4 items pre-loaded on first visit.

### Implementation for User Story 2

- [x] T012 [P] [US2] Build CategoryPills component: horizontal row of 12 category pills (rounded, dark bg, light text), active state with accent highlight, "all" toggle on re-click in src/components/pos/CategoryPills.tsx
- [x] T013 [P] [US2] Build SearchField component: dark input with placeholder "Sök efter artiklar", onInput callback for real-time filtering in src/components/pos/SearchField.tsx
- [x] T014 [P] [US2] Build ProductGrid component: 5-column CSS Grid, product buttons color-coded by colorGroup (coffee: #d64a6a, pastry: #f0b429, drinks: #5ab8a0, other: #7ab89a), name + price display, hover scale, click to add, empty state message when no matches in src/components/pos/ProductGrid.tsx
- [x] T015 [P] [US2] Build OrderPanel component: order number (#001), "Artiklar (N)" header, scrollable item list with name + price + remove X button, "Äta här / Ta med" toggle, total "Totalt SEK XXX.00", discount line "Varav rabatter 0.00", "Betala" button (teal, full width, disabled when empty), Terminal 1/2 labels in src/components/pos/OrderPanel.tsx
- [x] T016 [US2] Build POSView component: two-column layout (~70% left with search + pills + grid, ~30% right with order panel), order state (useReducer: add/remove/pay actions), category + search filter state, pre-populate 4 items on mount (Lyxlatte med vanilj 79kr, Blåbärspaj 124kr, Croissant 65kr, Islatte vanilj/fudge 82kr) in src/components/views/POSView.tsx
- [x] T017 [US2] Implement payment flow: Betala click → checkmark confirmation animation (CSS keyframe, 1-2s), clear order, increment orderNumber, reset dineIn to true in src/components/pos/OrderPanel.tsx

**Checkpoint**: US2 complete — full POS register with add/remove/filter/search/pay

---

## Phase 5: User Story 3 — Weekly staff schedule (Priority: P2)

**Goal**: Schedule grid with 6 employees, shifts across Mon-Sun, color-coded station badges, total hours.

**Manual Test**: Navigate to Schema. Verify 6 rows, 7 day columns with dates, "Vecka 25" header, "Jespers Taverna" sub-header. Check shift cells: time ranges + KÖK (orange) / MATSAL (teal) badges. Verify totals column sums correctly (range 15-42h).

### Implementation for User Story 3

- [x] T018 [US3] Build ScheduleGrid component: top bar with filter pills ("Vecka 25", "Jespers Taverna", "Kostnadsalternativ") + search field; HTML table with header row (days Mon-Sun with dates), employee rows (name, role, shifts), station badges (KÖK: #e07020, MATSAL: #2ec4b6), empty cells for days off, Totalt + Stationer columns in src/components/schedule/ScheduleGrid.tsx
- [x] T019 [US3] Build ScheduleView component: sub-header "Jespers Taverna", renders ScheduleGrid, calculates total hours per employee (sum shift durations as decimal), extracts unique stations per employee in src/components/views/ScheduleView.tsx

**Checkpoint**: US3 complete — schedule grid with correct data, badges, and totals

---

## Phase 6: User Story 4 — Booking analytics dashboard (Priority: P2)

**Goal**: Line chart with 4 data lines, blue header band, date picker, tabs, 2 rows of KPI cards.

**Manual Test**: Navigate to Analys. Verify blue header band (#1a6fb5) with "Bokning" tab active + date 2024-06-17. Verify line chart with 4 lines + legend + tooltips on hover. Verify 4 booking KPI cards (totalt 80, Manuell 30, Walk-in 25, Web 25) + 4 guest cards (totalt 200, Manuell 85, Walk-in 60, Web 55).

### Implementation for User Story 4

- [x] T020 [P] [US4] Build BookingChart component using react-chartjs-2: line chart with title "Antal bokningar graf" + "17 Jun 2024", X-axis hourly slots 12-13 through 21-22, 4 datasets (Antal bokningar/white, Manuell/yellow, Walk-in/teal, Webb/pink), hover tooltips, legend at bottom in src/components/analytics/BookingChart.tsx
- [x] T021 [P] [US4] Build KPICards component: two rows of 4 cards each, dark card background (#232a3a), subtle border, label + date "17 jun 2024" + value (number + "st") + person SVG icon in src/components/analytics/KPICards.tsx
- [x] T022 [US4] Build AnalyticsView component: blue header band (#1a6fb5) with "Skapa ny dashboard" link, "Bokning" tab active, date picker pre-filled 2024-06-17, "Ladda om" button; renders BookingChart + KPICards in src/components/views/AnalyticsView.tsx

**Checkpoint**: US4 complete — chart renders with tooltips, all 8 KPI cards with correct values

---

## Phase 7: User Story 5 — AI voice assistant (Priority: P3)

**Goal**: Voice interaction via OpenAI Realtime API with FAB, connection states, tool calling, screenshot capture, transcript sidebar.

**Manual Test**: Allow microphone when prompted. Click FAB → status shows "connecting" then "connected". Speak "Visa schemat" → app navigates to Schema, AI describes view. Ask "Vad ser du?" → AI describes screen elements. Toggle transcript sidebar. Stop session → FAB returns to idle. Test without API key → FAB shows disabled "Voice unavailable".

### Implementation for User Story 5

- [x] T023 [US5] Create ephemeral token API route: POST /api/realtime/token calls OpenAI POST /v1/realtime/sessions with server-side OPENAI_API_KEY, returns client_secret.value; returns 503 if API unavailable in src/app/api/realtime/token/route.ts
- [x] T024 [US5] Create .env.example with OPENAI_API_KEY placeholder and document in quickstart.md
- [x] T025 [US5] Implement WebRTC setup: RTCPeerConnection, DataChannel "oai-events", getUserMedia for microphone, SDP offer/answer exchange with ephemeral token in src/lib/voice/webrtc.ts
- [x] T026 [US5] Implement useRealtimeVoice hook: connects via webrtc.ts, sends session.update with Swedish system prompt + voice config (semantic_vad), exposes state (idle/connecting/connected/ai-speaking/user-speaking/disabled), provides sendToolResult and endSession methods in src/hooks/useRealtimeVoice.ts
- [x] T027 [US5] Define tool schemas (navigate_to_page, explain_current_screen, get_page_help, add_product_to_order) with structured responses; implement add_product_to_order with fuzzy matching (case-insensitive substring) returning {success, product} or {success: false, suggestions} in src/lib/voice/tools.ts
- [x] T028 [US5] Implement screenshot capture: html2canvas DOM capture, JPEG quality 0.7, downscale 720px max, send via DataChannel as conversation.item.create with input_image; use state-hash dedup (view name + order count) to avoid duplicate sends in src/lib/voice/screenshot.ts
- [x] T029 [US5] Wire voice events in useRealtimeVoice: response.function_call_arguments.done → tool dispatch, response.audio_transcript.done → AI transcript, conversation.item.input_audio_transcription.completed → user transcript, input_audio_buffer.speech_started/stopped → speaking state in src/hooks/useRealtimeVoice.ts
- [x] T030 [US5] Upgrade FABButton: connect to useRealtimeVoice, show all states (idle/connecting/connected/ai-speaking/user-speaking/disabled), tooltip "Voice unavailable" when API unreachable in src/components/voice/FABButton.tsx
- [x] T031 [US5] Build StatusIndicator component: visual feedback for connection state, pulsing animation when AI speaking, waveform when user speaking in src/components/voice/StatusIndicator.tsx
- [x] T032 [US5] Build TranscriptSidebar component: slide-in from right (~300px), hidden by default, toggle button, scrollable transcript with user/AI message bubbles, auto-scroll on new messages in src/components/voice/TranscriptSidebar.tsx
- [x] T033 [US5] Implement auto-screenshot on view navigation and on explain_current_screen tool call in src/lib/voice/screenshot.ts
- [x] T034 [US5] Add microphone permission handling: show pre-prompt message before getUserMedia, handle NotAllowedError → set FAB to disabled with tooltip "Mikrofon ej tillgänglig" in src/hooks/useRealtimeVoice.ts
- [x] T035 [US5] Persist voice session across view navigation: session stays active when switching views, FAB hidden on start view but session not disconnected in src/app/page.tsx

**Checkpoint**: US5 complete — voice works with navigation, screen description, tool calling, and transcript

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements

- [x] T036 Add responsive CSS adjustments for 1024px minimum width (smaller sidebar, adjusted grid columns, font scaling) in Tailwind responsive classes across components
- [x] T037 Add hover states and micro-interactions: button hover effects, nav transitions, card hover lifts across all view components
- [x] T038 Validate all views against reference sketch (specs/reference-sketch.html) for color accuracy, layout proportions, and typography; fix deviations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1
- **US1 (Phase 3)**: Depends on Phase 2 — navigation needed for all views
- **US2 (Phase 4)**: Depends on Phase 3 (needs page layout + navigation)
- **US3 (Phase 5)**: Depends on Phase 3
- **US4 (Phase 6)**: Depends on Phase 3
- **US5 (Phase 7)**: Depends on Phase 3 (needs FAB + page layout); can start in parallel with US2-US4
- **Polish (Phase 8)**: After all user stories complete

### User Story Dependencies

- **US1 (P1)**: Foundation only
- **US2 (P1)**: Depends on US1 (page layout)
- **US3 (P2)**: Depends on US1 (page layout)
- **US4 (P2)**: Depends on US1 (page layout)
- **US5 (P3)**: Depends on US1 (FAB + page layout). Can develop voice infrastructure (T023-T029) in parallel with US2-US4

### Parallel Opportunities

- T005 + T006: Employee data and booking data are independent files
- T012-T015: All POS sub-components are separate files
- T020 + T021: BookingChart and KPICards are separate files
- US2, US3, US4 can proceed in parallel after US1 (separate component files)
- US5 voice infrastructure (T023-T029) can develop alongside US2-US4

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Setup + Foundational (T001-T007)
2. Complete US1 Navigation (T008-T011)
3. Complete US2 POS Register (T012-T017)
4. **STOP and VALIDATE**: `npm run dev`, navigate, use POS
5. Demo-ready with navigation + POS

### Full Demo

1. MVP (above)
2. Add US3 (Schedule) → workforce management
3. Add US4 (Analytics) → data visualization
4. Add US5 (Voice) → AI assistant
5. Polish → responsive, hover states, validation

---

## Notes

- All [P] tasks target separate files — truly parallelizable
- Swedish characters (ö, ä, å) in all UI labels
- KPI values are internally consistent (sub-categories sum to totals)
- Commit after each completed user story phase
- Validate against specs/reference-sketch.html at each checkpoint
