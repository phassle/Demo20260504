<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0
- Changed principles:
  - I. Single-File Demo First → I. Next.js From Day One
  - III. Interactivity Over Complexity (updated for React)
  - IV. Voice-Ready Architecture → IV. Voice-First Architecture
- Updated sections:
  - Technical Constraints (removed two-phase split)
  - Development Workflow (Next.js workflow)
- Rationale: Building vanilla HTML first and rewriting in Next.js is double work.
  Next.js with `next export` produces a static site equally easy to deploy.
  Voice integration is a core requirement, not a future phase.
-->

# Caspeco Frontend Demo Constitution

## Core Principles

### I. Next.js From Day One

The application MUST be built as a Next.js App Router project with Tailwind CSS and shadcn/ui. The app MUST be deployable via `next build` (or `next export` for static hosting). No separate HTML prototype phase — build the real thing once.

**Rationale:** Voice integration via OpenAI Realtime API requires a server-side API route for ephemeral tokens. Building a vanilla HTML prototype first and rewriting it in Next.js is wasted effort. A single Next.js build delivers both the UI and the voice backend.

### II. Visual Fidelity

The UI MUST faithfully match Caspeco's brand identity as defined in the PRD reference sketch and color palette. The dark theme (#1a1f2e background), teal (#2ec4b6) and gold (#f0b429) accents, Outfit/DM Sans typography, and component styling (rounded corners, card-based layouts, station badges) are non-negotiable. All demo data MUST use realistic Swedish-language content with SEK pricing.

**Rationale:** The demo represents Caspeco's product to potential customers and stakeholders. Visual credibility is critical.

### III. Interactivity Over Complexity

Each view MUST feel alive with working interactions (search filtering, category selection, add-to-order, payment flow) using hardcoded demo data. No external backend or persistent state is required beyond the Next.js API route for voice tokens. Prefer simple React state (`useState`/`useReducer`) over complex state management libraries.

**Rationale:** The demo needs to impress during a live presentation. Simplicity ensures reliability.

### IV. Voice-First Architecture

The AI Support FAB MUST be present on all system views (not on the start view). Voice interaction via OpenAI Realtime API (WebRTC + DataChannel) is a core feature, not an add-on. Each system view MUST include a `voice-control-container` element with semantic IDs. The voice session MUST persist across view navigation.

**Rationale:** The voice assistant is the "wow factor" of the demo. It must be built as a first-class feature, not bolted on after the fact.

## Technical Constraints

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Target resolution:** Desktop/laptop 1280px+, minimum 1024px
- **Browser support:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- **Typography:** Outfit (display) and DM Sans (body) via Google Fonts
- **Charts:** Chart.js (or react-chartjs-2) for the analytics dashboard
- **Voice:** OpenAI Realtime API via WebRTC, `gpt-4o-mini-realtime-preview` model
- **Screenshots:** html2canvas for DOM capture, JPEG quality 0.7, max 720px
- **Language:** Swedish for all UI text, demo data, and AI assistant voice
- **Demo data:** Hardcoded TypeScript modules, realistic, pre-populated to look "alive" on load
- **API key:** `OPENAI_API_KEY` in `.env.local` (server-side only, never exposed to browser)

## Development Workflow

- Each view (Start, POS, Schema, Analys) is a React component developed and validated independently
- Navigation between views uses React state with CSS transitions (200-300ms fade)
- The reference sketch (`specs/reference-sketch.html`) serves as the visual specification
- All PRD specs in `specs/PRD/` are authoritative for behavior and content requirements
- Voice integration is developed alongside UI views, not as a separate phase
- Before each demo: verify microphone permissions are granted in the browser

## Governance

This constitution governs all implementation decisions for the Caspeco Frontend Demo project. Any deviation from these principles MUST be documented with justification. Amendments require updating this file with a version bump following semantic versioning (MAJOR for principle changes, MINOR for additions, PATCH for clarifications).

**Version**: 2.0.0 | **Ratified**: 2026-03-13 | **Last Amended**: 2026-03-13
