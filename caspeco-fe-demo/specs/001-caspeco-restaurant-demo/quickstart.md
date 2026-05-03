# Quickstart: Caspeco Restaurant Management Demo

**Branch**: `001-caspeco-restaurant-demo` | **Date**: 2026-03-13

## Prerequisites

- Node.js 18+
- npm or pnpm
- OpenAI API key with Realtime API access (for voice feature)

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and add: OPENAI_API_KEY=sk-...

# Start development server
npm run dev
# Visit http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (for voice) | OpenAI API key (server-side only, never exposed to browser) |

Without the API key, all UI views work normally. The AI Support FAB shows as disabled with "Voice unavailable" tooltip.

## What you'll see

1. **Start view**: Caspeco logo + "Starta demo" button
2. Click "Starta demo" → **POS register** with 4 pre-loaded order items
3. Navigate via sidebar to **Schema** (staff schedule) or **Analys** (booking analytics)
4. Click **AI Support FAB** (bottom-right) to start voice session

## Voice Integration

1. Click the **AI Support FAB** (teal button, bottom-right)
2. Allow microphone access when prompted
3. Speak in Swedish — the AI responds with voice
4. Try: "Visa schemat", "Vad ser du?", "Lägg till en cappuccino"
5. Toggle transcript sidebar via the transcript icon

## Demo Prep Checklist

- [ ] Verify `OPENAI_API_KEY` is set in `.env.local`
- [ ] Open Chrome and grant microphone permission for localhost
- [ ] Test voice by saying "Hej" — verify AI responds
- [ ] Run through all 4 views to verify rendering

## Cost Estimate

- Development/demo model (`gpt-4o-mini-realtime-preview`): ~$0.03/min
- 5-minute demo session: ~$0.12
