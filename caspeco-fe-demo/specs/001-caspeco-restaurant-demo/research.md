# Research: Caspeco Restaurant Management Demo

**Branch**: `001-caspeco-restaurant-demo` | **Date**: 2026-03-13

## Decision 1: Single HTML vs Framework for Phase 1

**Decision**: Single HTML file with embedded CSS/JS and CDN libraries.

**Rationale**: Constitution principle I mandates single-file demo first. The demo must be trivially deployable — openable directly in a browser or served by any static file server. No build tools, bundlers, or package managers. CDN libraries are permitted.

**Alternatives considered**:
- Next.js from the start: Rejected — violates constitution, requires Node.js runtime and build step.
- Vite + vanilla JS: Rejected — still requires a build step and `npm install`.
- Multiple HTML files (one per view): Rejected — adds complexity, navigation requires page reloads or more tooling.

## Decision 2: Chart Library for Analytics

**Decision**: Chart.js via CDN (`https://cdn.jsdelivr.net/npm/chart.js`).

**Rationale**: Chart.js is lightweight (~60KB gzipped), supports line charts with multiple datasets, hover tooltips, legends, and custom styling out of the box. Available via CDN with no build step. Well-documented and widely used. The PRD explicitly suggests Chart.js.

**Alternatives considered**:
- D3.js: Rejected — much more powerful but significantly more code for a simple line chart. Overkill for hardcoded demo data.
- Apache ECharts: Viable but larger bundle size and less common in CDN-first workflows.
- Canvas API (raw): Rejected — would require implementing tooltips, legends, and responsive behavior from scratch.
- Lightweight Charts (TradingView): Rejected — optimized for financial data, not general-purpose.

## Decision 3: Typography via Google Fonts CDN

**Decision**: Outfit (display/headings) and DM Sans (body text) loaded via Google Fonts CDN.

**Rationale**: Constitution specifies these fonts. Google Fonts CDN is reliable, fast (HTTP/2, global CDN), and requires only a `<link>` tag. No self-hosting needed for a demo.

**Alternatives considered**:
- Self-hosted fonts: Rejected — adds file management, requires relative paths, and the demo must work as a single file.
- System fonts fallback only: Rejected — violates constitution principle II (Visual Fidelity).

## Decision 4: View Switching Strategy

**Decision**: All 4 views rendered in the DOM on page load, shown/hidden via CSS class toggling with fade transitions.

**Rationale**: Simplest approach — no routing library, no dynamic DOM creation, instant switching. CSS transitions (opacity 0→1, 200-300ms) provide smooth visual feedback. All view state (e.g., POS order) is preserved across navigation since elements stay in DOM.

**Alternatives considered**:
- Dynamic DOM creation per view: Rejected — slower switching, more complex state management.
- Hash-based routing: Partially viable but adds unnecessary complexity for 4 static views.
- CSS-only :target selector: Rejected — limited transition control and accessibility concerns.

## Decision 5: Voice Integration Approach (Phase 2)

**Decision**: Raw WebRTC + DataChannel via OpenAI Realtime API. No Agents SDK.

**Rationale**: Full control over connection lifecycle, fewer dependencies, sufficient for a single-agent demo with 3-4 tools. The PRD explicitly recommends this approach over the Agents SDK for the initial implementation.

**Alternatives considered**:
- OpenAI Agents SDK (`@openai/agents`): Deferred — provides RealtimeAgent abstractions but adds dependency and abstraction layer. Can be adopted later if multi-agent handoffs become needed.
- WebSocket transport: Rejected — WebRTC is faster (eliminates server hop), uses UDP with built-in congestion control, and handles Opus codec automatically.

## Decision 6: Screenshot Capture for Vision (Phase 2)

**Decision**: `html2canvas` library for DOM-to-canvas capture, output as JPEG with quality 0.6-0.7, downscaled to 720px max.

**Rationale**: html2canvas captures the DOM as rendered (including CSS styles) without requiring browser extension permissions. JPEG at 0.6 quality provides good balance of visual clarity and payload size. The PRD specifies this approach with measured token costs (~85-170 tokens per image).

**Alternatives considered**:
- Screen Capture API (`getDisplayMedia`): Rejected — requires user permission prompt, captures entire screen (not just app), and may show sensitive content.
- Canvas rendering (manual): Rejected — would need to reimplement the entire UI rendering pipeline.
- PNG format: Rejected — 3-5x larger file size than JPEG for no meaningful quality benefit at 720px.

## Decision 7: OpenAI Model Selection (Phase 2)

**Decision**: `gpt-4o-mini-realtime-preview` for development and demos. `gpt-4o-realtime-preview` as optional premium upgrade.

**Rationale**: Mini model is ~10x cheaper ($0.03/min vs $0.30/min). For a 5-minute demo session, cost is ~$0.12 vs ~$1.17. Quality is sufficient for presentation demos. The PRD recommends mini for dev/demo use.

**Alternatives considered**:
- Full model only: Rejected — cost prohibitive for development iterations.
- Third-party voice APIs (ElevenLabs, etc.): Rejected — would require separate STT→LLM→TTS pipeline with higher latency. OpenAI Realtime provides native speech-to-speech.

## Decision 8: POS Product Color Coding

**Decision**: Products color-coded by category using the Caspeco palette from PRD.

**Rationale**: The PRD reference images show distinct color groupings: coffee (pink/coral), pastry (yellow/gold), drinks (teal/blue-green), other (mint/green). This provides quick visual scanning and matches the reference sketch.

**Color mapping**:
- Kaffe (Coffee): `#d64a6a` / `#e07070` (pink/coral)
- Bakverk (Pastry): `#f0b429` / `#d4a030` (yellow/gold)
- Drycker (Drinks): `#5ab8a0` / `#7ecfc0` (teal/blue-green)
- Övrigt (Other): `#7ab89a` (mint/green)
