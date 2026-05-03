# Spec 02: Start View

## Overview

The start view is the first thing the user sees. It has a simple, clean design with the Caspeco logo and a prominent start button. The purpose is to provide a clean entry point to the demo — perfect for having ready on screen before a presentation begins.

## Visual Reference

See [`../reference-sketch.html`](../reference-sketch.html) — "Vy 1: Startvy" for the visual mockup of this view.

## User Stories

**US-2.1: See start view on app launch**
As a demo user, I want to see a clean welcome screen when I open the application so that I can have it ready before my presentation begins.

**Acceptance Criteria:**
- The start view is displayed by default when the page loads
- The background is dark and matches Caspeco's design language
- The Caspeco logo is displayed centered in the upper portion
- A short tagline is shown below the logo, e.g., "Restaurant Management System"
- No navigation elements are visible — only logo, tagline, and start button

**US-2.2: Launch the demo**
As a demo user, I want to press a start button to enter the system so that I can begin showing the features.

**Acceptance Criteria:**
- A large, clear button with the text "Starta" or "Starta demo" is displayed centered
- The button uses Caspeco's gold/yellow accent color (#f0b429) with dark text
- On hover, the button gets a subtle glow/shadow effect
- Clicking the button navigates to the POS Register view (view 3)
- The transition uses a short fade animation (200–300ms)

## Layout

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         [CASPECO LOGO]          │
│                                 │
│    Restaurant Management System │
│                                 │
│        ┌──────────────┐         │
│        │  Starta demo │         │
│        └──────────────┘         │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

## Design

- Center everything vertically and horizontally
- The logo should be Caspeco's white text logo ("CASPECO" in uppercase, thin sans-serif)
- Background: solid dark (#1a1f2e) or with a very subtle gradient
- No other interactive elements besides the start button
