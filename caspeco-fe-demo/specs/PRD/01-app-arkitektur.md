# Spec 01: App Architecture & Navigation

## Overview

The application is a single-page HTML demo mimicking Caspeco's restaurant management system. It consists of four views: a start view and three system views (POS Register, Staff Scheduling, Analytics). The app will later be integrated with OpenAI Realtime API for voice control directly in the browser.

## Visual Reference

See [`../reference-sketch.html`](../reference-sketch.html) for a complete visual mockup of all four views with Caspeco's color palette and layout.

## Technical Foundation

- **Format:** A single HTML file with embedded CSS and JavaScript (no external frameworks required, but CDN libraries are allowed where needed)
- **Design:** Dark theme matching Caspeco's existing UI (dark background ~#1a1f2e, teal accents, yellow/orange highlights, white text)
- **Typography:** Sans-serif, clean and modern
- **Responsive:** Optimized for desktop/laptop (1280px+), but should work down to 1024px

## View Structure

```
[Start View] → click start button → [POS Register]
                                          ↕
                                     [Scheduling]
                                          ↕
                                     [Analytics]
```

## Navigation

### User Stories

**US-1.1: Navigate between system views**
As a demo user, I want to navigate between POS, Scheduling, and Analytics via a navigation menu so that I can show different parts of the system during a presentation.

**Acceptance Criteria:**
- A fixed navigation panel is visible in all three system views (not on the start view)
- The navigation contains three clear options: "Kassa" (Register), "Schema" (Schedule), "Analys" (Analytics)
- The active view is visually highlighted in the navigation
- Switching views happens instantly without page reload
- The Caspeco logo is shown in the upper left corner of the navigation

**US-1.2: Return to start view**
As a demo user, I want to be able to return to the start view so that I can restart the demo from the beginning.

**Acceptance Criteria:**
- A small "back" icon or logo click in the navigation returns to the start view
- The start view hides the navigation panel

## Shared Design Language

### Color Palette (based on reference images)
- **Background:** #1a1f2e (dark navy/black)
- **Panels/cards:** #232a3a (slightly lighter)
- **Primary accent (teal):** #2ec4b6
- **Secondary accent (yellow/gold):** #f0b429
- **Warning/orange:** #e07020
- **Pink/red:** #d64a6a
- **Green:** #5ab87a
- **Primary text:** #ffffff
- **Secondary text:** #8899aa
- **Blue header band:** #1a6fb5 (used in the analytics dashboard)

### Layout
- Navigation: vertical sidebar (left) OR horizontal top bar — choose whichever best matches the reference images
- Main content: fills the remaining area
- All views should have a header indicating the current view

## AI Support Button

A floating action button (FAB) for activating the OpenAI voice support agent is present on all system views but **not** on the start view.

- **Position:** Fixed in the bottom-right corner of each view
- **Style:** Circular teal button (#2ec4b6) with a lightbulb/support icon, glowing box-shadow
- **Label:** A tooltip "AI Support" appears next to the button
- **Behavior:** Clicking the FAB activates the OpenAI Realtime voice session (see spec 06)
- **Visibility:** Only visible on POS, Schema, and Analys views — hidden on the start view

See [`../reference-sketch.html`](../reference-sketch.html) for the visual placement on each view.

## Preparation for Voice Integration

- The HTML structure should have an element with id `voice-control-container` hidden in each view
- The AI Support FAB serves as the primary entry point for voice interaction
- Future integration: OpenAI Realtime API via WebRTC will be added as a separate layer
