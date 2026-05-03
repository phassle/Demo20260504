# Feature Specification: Caspeco Restaurant Management Demo

**Feature Branch**: `001-caspeco-restaurant-demo`
**Created**: 2026-03-13
**Status**: Draft
**Input**: Caspeco restaurant management demo with POS register, staff scheduling, analytics dashboard, and AI voice assistant

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Launch demo and navigate between views (Priority: P1)

A presenter opens the application and sees a clean welcome screen with the Caspeco logo and a "Starta demo" button. They click the button and enter the POS register view. From there, they can navigate between POS (Kassa), Staff Scheduling (Schema), and Analytics (Analys) using a sidebar navigation menu. The active view is visually highlighted. They can return to the start screen at any time.

**Why this priority**: Navigation is the foundation — without it, no other feature can be demonstrated. This is the minimal viable demo shell.

**Independent Test**: Can be fully tested by opening the app, clicking "Starta demo", and switching between all views. Delivers a navigable demo skeleton.

**Acceptance Scenarios**:

1. **Given** the app is opened for the first time, **When** the page loads, **Then** the start view is displayed with the Caspeco logo centered, a tagline "Restaurant Management System", and a "Starta demo" button — no navigation elements are visible.
2. **Given** the user is on the start view, **When** they click "Starta demo", **Then** the app navigates to the POS register view with a fade transition (200-300ms) and the sidebar navigation becomes visible.
3. **Given** the user is on any system view, **When** they click a navigation item (Kassa, Schema, or Analys), **Then** the corresponding view is displayed instantly and the active item is visually highlighted.
4. **Given** the user is on any system view, **When** they click the Caspeco logo or a back icon in the navigation, **Then** the app returns to the start view and the navigation is hidden.

---

### User Story 2 - Use the POS register to build and pay an order (Priority: P1)

A register operator sees a product grid on the left (~70% width) with category filter pills and a search field. They tap category buttons to filter products, tap products to add them to the order panel on the right (~30% width). The order panel shows item count, line items with quantities and prices, a dine-in/take-away toggle, total amount, and a "Betala" (Pay) button. After paying, the order clears and the order number increments.

**Why this priority**: The POS register is the flagship view of the demo — the most visually impressive and interactive feature. It demonstrates core restaurant operations.

**Independent Test**: Can be tested by clicking products, verifying they appear in the order panel, toggling dine-in/take-away, and completing a payment.

**Acceptance Scenarios**:

1. **Given** the user is on the POS view, **When** it loads, **Then** at least 10 category pills are displayed (Kaffe, Te, Bakverk, Smörgåsar, etc.), a search field with placeholder "Sök efter artiklar" is visible, a 5-column product grid shows at least 20 products with names and prices in SEK, and the order panel is pre-populated with 4 items so the view looks alive immediately.
2. **Given** the user is on the POS view, **When** they click a category pill, **Then** that category is visually highlighted and the product grid filters to show matching products.
3. **Given** the user is on the POS view, **When** they click a product button, **Then** the product is added as a new line item in the order panel showing name and price. Clicking the same product again adds another separate line item (no quantity grouping). The item count in "Artiklar (N)" updates and the total recalculates.
4. **Given** an order has items, **When** the user clicks the "Betala" button, **Then** a confirmation animation is shown (e.g., checkmark), the order clears, and the order number increments (e.g., #001 to #002).
5. **Given** the user types in the search field, **When** text is entered, **Then** the product grid filters in real-time based on text matching.

---

### User Story 3 - View the weekly staff schedule (Priority: P2)

A restaurant manager views the weekly staff schedule as a grid with employee names on the left, days of the week (Mon-Sun with dates) as columns, and shift details in each cell. Each shift shows a time range and a color-coded station badge (KOK/Kitchen in orange, MATSAL/Dining Room in teal). A summary column on the right shows total hours per employee. Filter pills for week number and restaurant name are visible at the top.

**Why this priority**: Demonstrates workforce management capabilities and adds breadth to the demo beyond POS.

**Independent Test**: Can be tested by navigating to the Schema view and verifying that employees, shifts, station badges, and hour totals are correctly displayed.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Schema view, **When** it loads, **Then** a grid displays with 7 day columns (Mon-Sun with dates), at least 6 employees listed as rows, and a "Vecka 25" header with restaurant name "Jespers Taverna".
2. **Given** the schedule is displayed, **When** the user looks at a shift cell, **Then** it shows a time range (e.g., "08:00-18:00") and a station badge — "KOK" with orange background (#e07020) or "MATSAL" with teal background (#2ec4b6). Empty cells indicate days off.
3. **Given** the schedule is displayed, **When** the user looks at the right summary column, **Then** each employee row shows "Totalt" hours as a decimal (e.g., 24.0 h, 41.5 h) and assigned stations.
4. **Given** the schedule is displayed, **When** the user looks at employee info, **Then** each row shows the employee's name, role (Kock, Servis, Intermittent), and optionally contracted hours.

---

### User Story 4 - View booking analytics dashboard (Priority: P2)

A restaurant manager views a booking analytics dashboard with a line chart showing hourly booking volumes (12:00-22:00) broken down by source (Total, Manual, Walk-in, Web). Below the chart, two rows of KPI cards show booking counts and guest counts by source. A blue header band contains date pickers and dashboard tab navigation.

**Why this priority**: Demonstrates analytics and data visualization — a key Caspeco value proposition. Adds visual variety to the demo.

**Independent Test**: Can be tested by navigating to the Analys view and verifying the chart renders with data, tooltips work on hover, and KPI cards display correct values.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Analys view, **When** it loads, **Then** a line chart is displayed with title "Antal bokningar graf", date "17 Jun 2024", hourly time slots on the X-axis (12:00-22:00), and multiple colored lines (Total, Manuell, Walk-in, Webb) with a legend below.
2. **Given** the chart is displayed, **When** the user hovers over a data point, **Then** a tooltip shows the booking values for that time slot.
3. **Given** the analytics view is displayed, **When** the user looks below the chart, **Then** 4 KPI cards show: "Antal bokningar totalt" (80 st), "Manuell" (30 st), "Walk-in" (25 st), "Web" (25 st) — each with the date and a person icon. Sub-categories sum to the total.
4. **Given** the analytics view is displayed, **When** the user looks at the second KPI row, **Then** 4 guest count cards show: "Antal gäster totalt" (200 st), "Manuell" (85 st), "Walk in" (60 st), "Web" (55 st). Sub-categories sum to the total.
5. **Given** the analytics view is displayed, **When** the user looks at the top, **Then** a blue header band (#1a6fb5) shows a "Bokning" tab as active, a date picker pre-filled with 2024-06-17, and a "Ladda om" button.

---

### User Story 5 - Talk to the AI voice assistant (Priority: P3)

A presenter clicks the AI Support floating action button (visible on all system views, not on the start view) to activate a voice session. The AI assistant responds in natural Swedish voice in real-time. The assistant can guide the user through the demo, navigate between views on voice command ("Visa schemat"), and describe what's currently on screen when asked ("Vad ser du?"). A transcript of the conversation is displayed alongside the audio.

**Why this priority**: Voice integration is the "wow factor" of the demo but depends on all UI views being complete first. It's also the most complex feature with external API dependencies.

**Independent Test**: Can be tested by clicking the FAB, speaking a command, and verifying the AI responds with voice, navigates views, and describes screen content.

**Acceptance Scenarios**:

1. **Given** the user is on any system view, **When** they look at the bottom-right corner, **Then** a circular teal FAB (#2ec4b6) with a lightbulb/support icon and "AI Support" tooltip is visible. The FAB is not visible on the start view.
2. **Given** the user clicks the AI Support FAB, **When** the voice session is being established, **Then** a visual indicator shows connection status (connecting, connected, AI speaking, user speaking). The transcript panel is hidden by default; the user can toggle it open as a slide-in sidebar from the right (~300px wide, overlaying the main content).
3. **Given** a voice session is active, **When** the user says "Visa schemat", **Then** the AI calls the navigate_to_page tool, the app navigates to the Schema view, and the AI describes the new view with voice.
4. **Given** a voice session is active, **When** the user asks "Vad ser du?", **Then** a screenshot is captured and sent to the AI, and the AI describes specific elements on screen (e.g., "Jag ser att du har 4 artiklar i ordern").
5. **Given** a voice session is active, **When** the user wants to stop, **Then** they can end the session at any time and the FAB returns to its idle state.

---

### Edge Cases

- What happens when the user clicks "Betala" with an empty order? The pay button should be disabled or show a notification.
- What happens when the voice session fails to connect (network error, missing API key)? The FAB switches to a disabled state with a tooltip "Voice unavailable". All UI views remain fully functional without the voice feature.
- What happens when the user rapidly switches between views during an active voice session? The session should persist and the AI should receive updated screenshots.
- What happens when the search field has no matching products? The grid should show an empty state message.
- What happens when the user denies microphone permission? The FAB switches to disabled state with tooltip "Mikrofon ej tillgänglig". Voice is unavailable but all UI views work normally.
- What happens when the AI voice tool `add_product_to_order` receives a product name that doesn't match exactly? Fuzzy matching (case-insensitive substring) is used. If no match, the AI receives an error with suggestions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a start view with Caspeco logo, tagline, and a "Starta demo" button as the default view on page load.
- **FR-002**: System MUST provide navigation between POS (Kassa), Scheduling (Schema), and Analytics (Analys) views via a fixed sidebar visible on all system views.
- **FR-003**: System MUST display a POS register with a searchable, category-filterable product grid (5 columns, 20+ products) and an order panel showing items, quantities, prices, dine-in/take-away toggle, and total.
- **FR-004**: System MUST allow adding and removing individual products from the order by clicking product buttons (to add) and a remove control per line item (to remove). Quantity editing is not supported. Orders are completed via a "Betala" button with confirmation feedback.
- **FR-005**: System MUST display a weekly staff schedule grid with employees, shift times, color-coded station badges (KOK/MATSAL), and total hours per employee.
- **FR-006**: System MUST display an analytics dashboard with a multi-line booking chart (hourly intervals, multiple sources) with hover tooltips and a legend.
- **FR-007**: System MUST display two rows of KPI cards showing booking counts and guest counts by source with hardcoded demo data.
- **FR-008**: System MUST use Caspeco's dark theme design language (background #1a1f2e, teal accent #2ec4b6, gold accent #f0b429, white text).
- **FR-009**: System MUST display an AI Support floating action button on all system views (not on start view) that activates a voice session.
- **FR-010**: System MUST support real-time voice interaction via the AI assistant, including speech-to-speech responses, view navigation by voice command, and screen description on demand.
- **FR-011**: System MUST capture and send screenshots to the AI assistant on view navigation and on demand for contextual guidance.
- **FR-012**: System MUST provide a conversation transcript in a slide-in sidebar from the right (~300px), hidden by default and toggleable by the user during an active voice session.

### Key Entities

- **Product**: A menu item with name, price (SEK), and category. Displayed as a color-coded button in the POS grid.
- **Order**: A collection of individual order line items (no quantity grouping — each added product is a separate line), a dine-in/take-away flag, total amount, and sequential order number.
- **Employee**: A staff member with name, role (Kock/Servis/Intermittent), contracted hours, and weekly shift assignments.
- **Shift**: A time block assigned to an employee for a specific day, linked to a station (KOK or MATSAL).
- **Booking**: An analytics data point with timestamp, source (Manual/Walk-in/Web), and guest count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A presenter can launch the demo and navigate to all four views within 10 seconds.
- **SC-002**: A presenter can build a 4-item order and complete payment in the POS register within 30 seconds.
- **SC-003**: The staff schedule displays at least 6 employees with shifts, station badges, and hour totals correctly without visual glitches.
- **SC-004**: The analytics chart renders with 4 data lines and interactive tooltips, and all 8 KPI cards display correct values.
- **SC-005**: The AI voice assistant responds with first audible audio within 500ms (typical 220-400ms) and can successfully navigate between views and describe screen content.
- **SC-006**: The entire demo can run as a presentation tool for 5+ minutes without errors or visual inconsistencies.
- **SC-007**: All views match Caspeco's dark theme design language with correct color palette, typography, and layout proportions.

## Clarifications

### Session 2026-03-13

- Q: Can users edit the order in the POS register (add only, add+remove, or add+remove+change quantity)? → A: Add and remove individual items; no quantity editing.
- Q: Should the POS order panel start pre-populated with items? → A: Yes, 4 items pre-loaded so the view looks alive immediately.
- Q: Where does the voice transcript panel appear? → A: Hidden by default; toggleable slide-in sidebar from the right (~300px, overlay).
- Q: What happens if OpenAI API is unavailable during the demo? → A: FAB shows in disabled state with "Voice unavailable" tooltip; all UI views remain fully functional.

## Assumptions

- All data is hardcoded demo data — no backend or database is required for the UI views.
- The application targets desktop/laptop screens (1280px+) with support down to 1024px.
- Swedish language is used for all UI labels and the AI assistant's voice.
- The AI voice assistant requires an OpenAI API key configured server-side.
- A charting library (e.g., Chart.js) will be used for the analytics line chart.
- Product prices use realistic Swedish cafe pricing (49-149 SEK).
