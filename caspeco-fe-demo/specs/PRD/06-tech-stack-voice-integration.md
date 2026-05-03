# Spec 06: Tech Stack & Voice/Vision Integration

## Overview

The Caspeco demo app will be built with Next.js and OpenAI's Realtime API to enable real-time voice interaction and screen vision. The AI assistant can guide the user through the demo with voice while seeing what's on screen. The Realtime API provides native speech-to-speech capabilities — no separate STT/TTS pipeline needed.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js (App Router) | Frontend + API routes for ephemeral key management |
| Voice | WebRTC via OpenAI Realtime API | Direct browser-to-OpenAI audio, ~220-400ms first audio |
| Vision | `html2canvas` → base64 image inputs | AI sees current view via `conversation.item.create` with `input_image` |
| UI | Tailwind CSS + shadcn/ui | Component library and styling |
| Model | `gpt-4o-mini-realtime-preview` (dev/demo) | Audio + text + image natively, ~$0.03/min |
| Model (premium) | `gpt-4o-realtime-preview` | Higher quality, ~$0.30/min |
| Screen capture | `html2canvas` ^1.4.1 | DOM-to-canvas for screenshot capture |

### Why NOT Agents SDK initially

The `@openai/agents` SDK provides `RealtimeAgent` and `RealtimeSession` abstractions with built-in tool calling and handoffs. However, for our demo we recommend **raw WebRTC + DataChannel** because:

- Full control over the connection lifecycle
- Fewer dependencies and abstractions to debug
- Better understanding of every API interaction
- Sufficient for a single-agent demo with 3-4 tools

The Agents SDK can be adopted later if multi-agent handoffs become needed.

## Architecture

```
┌─────────────────────────────────────────────┐
│                 Browser                      │
│                                              │
│  ┌──────────────┐   ┌────────────────────┐  │
│  │  Caspeco UI  │   │  Voice Assistant   │  │
│  │  (4 views)   │   │  Panel             │  │
│  │              │   │  - FAB button      │  │
│  │  Start       │   │  - Transcript      │  │
│  │  POS/Kassa   │   │  - Status          │  │
│  │  Schema      │   │                    │  │
│  │  Analys      │   └────────┬───────────┘  │
│  └──────┬───────┘            │               │
│         │    ┌───────────────┤               │
│  ┌──────┴────┴───────────────┴───────────┐  │
│  │  WebRTC Manager                       │  │
│  │  - RTCPeerConnection                  │  │
│  │  - DataChannel ("oai-events")         │  │
│  │  - Audio tracks (mic in / AI out)     │  │
│  │  - Screenshot capture + send          │  │
│  │  - Tool call execution                │  │
│  └───────────────┬───────────────────────┘  │
└──────────────────┼──────────────────────────┘
                   │ WebRTC (Audio + DataChannel)
                   ▼
         ┌─────────────────┐
         │  OpenAI Realtime │
         │  API             │
         │  (gpt-4o-mini    │
         │  -realtime)      │
         └─────────────────┘
                   ▲
                   │ POST /v1/realtime/sessions
         ┌─────────────────┐
         │  Next.js Backend │
         │  /api/realtime/  │
         │  token           │
         │                  │
         │  OPENAI_API_KEY  │
         │  (server-side)   │
         └─────────────────┘
```

## Voice Integration

### How it works (verified)

1. **Ephemeral token**: Next.js API route (`/api/realtime/token`) calls `POST https://api.openai.com/v1/realtime/sessions` with the server-side `OPENAI_API_KEY`. Returns a `client_secret.value` (short-lived token safe for browser use).
2. **WebRTC setup**: Browser creates `RTCPeerConnection`, captures microphone via `getUserMedia({ audio: true })`, creates DataChannel `"oai-events"`.
3. **SDP exchange**: Browser sends SDP offer to `https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview` with ephemeral token. Sets remote SDP answer.
4. **Session config**: Via DataChannel, send `session.update` with instructions, voice, tools, and VAD settings.
5. **Audio flows**: Microphone audio streams to OpenAI via WebRTC track. AI audio streams back via `pc.ontrack`. Uses Opus codec (48kHz) automatically.
6. **Turn detection**: `semantic_vad` (recommended) detects natural speech boundaries for smooth turn-taking.

### Audio format

WebRTC handles Opus codec automatically — no manual base64 audio encoding needed (unlike WebSocket transport).

### Available voices

`alloy`, `ash`, `ballad`, `coral`, `echo`, `sage`, `shimmer`, `verse`, `marin`, `cedar`

> **Note:** Voice locks after first audio response in the session.

### Session limits

- Max session duration: **60 minutes**
- Sufficient for any demo scenario

### User Stories

**US-6.1: Talk to the AI assistant**
As a demo user, I want to speak to an AI assistant that can guide me through the demo with voice.

**Acceptance Criteria:**
- The AI Support FAB activates the voice session
- The AI responds with natural voice in real-time (speech-to-speech, no STT/TTS pipeline)
- First audible response within 400ms
- The session can be started and stopped at any time
- A visual indicator shows connection status (connecting, connected, AI speaking, user speaking)
- Transcript of the conversation is shown alongside the audio

**US-6.2: AI navigates between views**
As a demo user, I want the AI to be able to switch between POS, Schema, and Analys views when I ask.

**Acceptance Criteria:**
- The AI has a `navigate_to_page` tool that can switch views
- User can say "Visa schemat" and the app navigates to the scheduling view
- Navigation happens instantly with the same fade transition as manual navigation
- After navigation, a screenshot is automatically sent so the AI can describe the new view

## Vision Integration

### How it works (verified)

The Realtime API **supports image inputs** via `conversation.item.create` with `input_image` type. Images are sent as base64 data URLs through the DataChannel.

```
User speaks → AI processes audio
                ↓
Screen capture sent as input_image
                ↓
AI sees UI + hears question → responds with contextual voice answer
```

### Capture strategy

| Trigger | When | Purpose |
|---------|------|---------|
| **On navigation** | User or AI switches view | AI knows what's displayed |
| **On demand** | User asks "Vad ser du?" | AI describes current screen |
| **Periodic** | Every 10s if screen changed | Keep AI context fresh |

### Image optimization

- **Format:** JPEG with quality 0.6-0.7 (smallest payload)
- **Resolution:** Downscale to 512-720px on longest side
- **Library:** `html2canvas` captures DOM to canvas, then `canvas.toDataURL('image/jpeg', 0.7)`
- **Token cost:** Low-res ~85 tokens, high-res ~170 tokens per 512x512 tile + 85 base
- **Comparison detection:** Only send if screenshot differs from last capture (avoid duplicate costs)

### Sending images via DataChannel

```typescript
dc.send(JSON.stringify({
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      { type: "input_image", image_url: "data:image/jpeg;base64,..." },
      { type: "input_text", text: "Användaren navigerade till POS-kassan" }
    ]
  }
}));
dc.send(JSON.stringify({ type: "response.create" }));
```

### User Stories

**US-6.3: AI sees the current screen**
As a demo user, I want the AI to be able to see what's currently displayed on screen so it can provide relevant guidance.

**Acceptance Criteria:**
- Screenshots are captured via `html2canvas` and sent as base64 JPEG
- Captures are sent on navigation and on demand (not continuous FPS to save cost)
- Images are downscaled to ~720px on longest side
- The AI can read UI text, labels, numbers and understand the layout
- A visual indicator shows when a screenshot is being sent

**US-6.4: AI explains what's on screen**
As a demo user, I want to ask "Vad ser du?" and have the AI describe the current view.

**Acceptance Criteria:**
- The AI can identify which view is active (POS, Schema, Analys)
- The AI can describe specific elements (e.g. "Jag ser att du har 4 artiklar i ordern totalt 350 kronor")
- The AI can suggest actions based on what it sees
- OCR-level understanding works well for UI elements, labels, and text

## Tool Calling

### How it works (verified)

Tools are defined in the `session.update` event. When the model wants to invoke a tool, it emits `response.function_call_arguments.done`. The client executes the tool and returns the result via `conversation.item.create` with type `function_call_output`, then triggers `response.create` for the model to continue.

### Tools for Caspeco demo

| Tool | Description | Parameters |
|------|-------------|------------|
| `navigate_to_page` | Switch between POS, Schema, Analys views | `page: "kassa" \| "schema" \| "analys"` |
| `explain_current_screen` | Trigger screenshot + AI description | none |
| `get_page_help` | Return contextual help text for current view | `page: string` |
| `add_product_to_order` | Add a product to the POS order | `product_name: string` |

### Event flow for tool calls

```
1. AI decides to call a tool
2. Server event: response.function_call_arguments.done { call_id, name, arguments }
3. Client parses arguments, executes tool locally
4. Client sends: conversation.item.create { type: "function_call_output", call_id, output }
5. Client sends: response.create (tell model to continue)
6. AI receives result, responds with voice
```

### Key server events to handle

| Event | Purpose |
|-------|---------|
| `response.function_call_arguments.done` | Tool call from model — execute and return result |
| `response.audio_transcript.done` | AI finished speaking — show full transcript |
| `conversation.item.input_audio_transcription.completed` | User speech transcribed — show in UI |
| `input_audio_buffer.speech_started` | User started speaking — show indicator |
| `input_audio_buffer.speech_stopped` | User stopped speaking — hide indicator |
| `response.audio.delta` | AI audio streaming — show "AI speaking" |
| `response.audio.done` | AI audio finished |

## Agent Structure (Phase 2 — optional)

For the initial demo, a **single agent** with all tools is sufficient. Multi-agent can be added later using either:

### Option A: Raw handoff via session.update

Switch agent personality by sending new `session.update` with different instructions and tools when context changes (e.g., user navigates to Analytics → update instructions to focus on bookings/KPIs).

### Option B: Agents SDK (if complexity grows)

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';

const posAgent = new RealtimeAgent({
  name: 'POSAssistant',
  instructions: 'Du hjälper med kassan, produkter och ordrar...',
  tools: [addProductTool, clearOrderTool, processPaymentTool],
  handoffs: ['schedulingAgent', 'analyticsAgent'],
});
```

Three specialist agents with supervisor handoffs:

| Agent | Scope | Example tools |
|-------|-------|--------------|
| **POS Agent** | Register, products, orders, payments | `add_product_to_order`, `clear_order`, `process_payment` |
| **Scheduling Agent** | Staff schedules, shifts, hours | `show_employee_schedule`, `explain_shift_coverage` |
| **Analytics Agent** | Bookings, KPIs, charts | `explain_chart_data`, `compare_booking_sources` |

## Ephemeral Key Management

### Why ephemeral keys?

The `OPENAI_API_KEY` must **never** be exposed in the browser. OpenAI's solution: create short-lived tokens server-side.

### Next.js API Route

**Endpoint:** `POST /api/realtime/token`

**Flow:**
1. Browser calls our API route
2. API route calls `POST https://api.openai.com/v1/realtime/sessions` with server-side API key
3. OpenAI returns `client_secret.value` (ephemeral token)
4. API route returns token to browser
5. Browser uses token for WebRTC SDP exchange

**Response from OpenAI:**
```json
{
  "client_secret": {
    "value": "ek_abc123...",
    "expires_at": 1234567890
  }
}
```

## Cost & Pricing (verified)

### Per-minute cost estimates

| Model | Audio in | Audio out | Total/min |
|-------|----------|-----------|-----------|
| `gpt-4o-realtime-preview` | ~$0.06 | ~$0.24 | **~$0.30** |
| `gpt-4o-mini-realtime-preview` | ~$0.006 | ~$0.024 | **~$0.03** |

### Token rates

- **Audio input:** 1 token per 100ms audio
- **Audio output:** 1 token per 50ms audio

### Demo session estimate (5 minutes)

| Item | Full model | Mini model |
|------|-----------|------------|
| Audio input (5 min) | $0.30 | $0.03 |
| Audio output (3 min) | $0.72 | $0.07 |
| Text tokens (instructions) | ~$0.05 | ~$0.005 |
| Image tokens (~5 screenshots) | ~$0.10 | ~$0.01 |
| **Total per session** | **~$1.17** | **~$0.12** |

> **Recommendation:** Use `gpt-4o-mini-realtime-preview` for development and demos. ~10x cheaper with sufficient quality for a presentation demo. Switch to full model only if quality doesn't meet expectations.

## Latency (measured)

| Metric | Value |
|--------|-------|
| First audible audio | 220-400ms |
| Round-trip voice latency | 480-520ms |
| WebRTC RTT | 60-70ms |
| First partial text | 150-250ms |

WebRTC is faster than WebSocket because it eliminates the server hop (browser → our server → OpenAI) and uses UDP with built-in congestion control.

## Implementation Phases

### Phase 1: Basic voice interaction
1. Create Next.js API route for ephemeral tokens
2. Implement WebRTC connection in a React hook (`useRealtimeVoice`)
3. AI Support FAB opens voice panel with mic button and transcript
4. Swedish system prompt for Caspeco context
5. Basic `session.update` with voice and VAD config

### Phase 2: Screenshots and vision
1. Integrate `html2canvas` for DOM screenshot capture
2. Send screenshot on view navigation
3. Send screenshot on demand ("Vad ser du?")
4. Optimize: JPEG quality 0.6, max 720px, dedup detection

### Phase 3: Tool calling
1. `navigate_to_page` — AI navigates user between views
2. `explain_current_screen` — AI describes what's displayed
3. `get_page_help` — Contextual help per view
4. `add_product_to_order` — AI can add items to POS order

### Phase 4: Multi-agent (optional)
1. Specialized agents per domain (POS, Schema, Analys)
2. Handoff mechanisms (via `session.update` or Agents SDK)
3. Supervisor pattern for complex cross-domain questions

## Starting Point

Clone [`openai/openai-realtime-agents`](https://github.com/openai/openai-realtime-agents) as reference. It provides:
- Multi-agent handoffs (Sequential Handoffs pattern and Chat-Supervisor pattern)
- WebRTC voice in the browser
- Tool calling with `toolLogic` pattern
- Ephemeral key generation
- Guardrails for message validation

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "html2canvas": "^1.4.1",
    "tailwindcss": "^3",
    "@shadcn/ui": "latest"
  }
}
```

Only `OPENAI_API_KEY` needed in `.env.local` (server-side only).

## Key References

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [OpenAI Realtime API WebRTC Guide](https://platform.openai.com/docs/guides/realtime-webrtc)
- [OpenAI Agents SDK (TypeScript)](https://github.com/openai/openai-agents-js)
- [openai-realtime-agents (Next.js example)](https://github.com/openai/openai-realtime-agents)
- [Voice Agents Quickstart](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
