# OpenAI Realtime API - Forskningsrapport för röstbaserad AI-assistent

> **Datum:** 2026-03-13
> **Syfte:** Bygga en demo där användare kan prata med en AI-assistent som ser restaurang-UI:t och hjälper dem navigera/förstå det i realtid.

---

## Innehållsförteckning

1. [Översikt: OpenAI Realtime API](#1-översikt-openai-realtime-api)
2. [WebRTC-integration](#2-webrtc-integration)
3. [OpenAI Agents SDK (TypeScript)](#3-openai-agents-sdk-typescript)
4. [openai-realtime-agents referensrepo](#4-openai-realtime-agents-referensrepo)
5. [Vision/bildstöd i Realtime API](#5-visionbildstöd-i-realtime-api)
6. [Tool calling i realtidssessioner](#6-tool-calling-i-realtidssessioner)
7. [Ephemeral key-hantering med Next.js](#7-ephemeral-key-hantering-med-nextjs)
8. [Prissättning](#8-prissättning)
9. [Latens och prestanda](#9-latens-och-prestanda)
10. [Arkitekturförslag för Caspeco-demo](#10-arkitekturförslag-för-caspeco-demo)

---

## 1. Översikt: OpenAI Realtime API

### Vad är det?

OpenAI Realtime API möjliggör **speech-to-speech-interaktion** i realtid med modeller som `gpt-4o-realtime-preview` och `gpt-4o-mini-realtime-preview` (samt nyare `gpt-realtime` och `gpt-realtime-mini`). Till skillnad från traditionella flöden (STT -> LLM -> TTS) är detta en **nativt multimodal modell** som direkt tar emot ljud och producerar ljud, vilket ger:

- Lägre latens (ingen mellanliggande transkription)
- Bättre förståelse av tonfall, pauser och känsloläge
- Naturligare konversation med möjlighet till avbrott (interruptions)
- Stöd för ljud, text och bild som input

### Sessionsarkitektur

En Realtime-session består av tre huvudkomponenter:

1. **Session** - Konfigurerar modell, röst, ljudformat, verktyg och instruktioner
2. **Conversation** - Innehåller konversationsobjekt (meddelanden från användare och modell)
3. **Responses** - Modellgenererade svar (ljud + text)

### Anslutningsmetoder

- **WebRTC** (rekommenderat för webbläsare) - Direkt peer-to-peer-anslutning, automatisk hantering av ljud
- **WebSocket** - Server-side anslutning, manuell ljudhantering med base64-kodade chunks

### Tillgängliga röster

alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin, cedar

> **OBS:** Rösten låses efter första ljudsvaret i sessionen.

### Sessionsbegränsningar

- Max sessionslängd: **60 minuter**
- VAD (Voice Activity Detection) aktiverat som standard med `semantic_vad`

---

## 2. WebRTC-integration

### Steg-för-steg: Upprätta WebRTC-anslutning

WebRTC är det rekommenderade sättet att ansluta från webbläsaren. Fördelen är att ljud hanteras automatiskt - ingen manuell base64-kodning krävs.

#### Komplett flöde:

```typescript
// 1. Skapa RTCPeerConnection
const pc = new RTCPeerConnection();

// 2. Fånga mikrofon
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const [track] = stream.getAudioTracks();

// 3. Konfigurera ljud (in och ut)
pc.ontrack = (e) => {
  // Koppla modellens ljud till ett audio-element
  const audioEl = document.getElementById('ai-audio') as HTMLAudioElement;
  audioEl.srcObject = e.streams[0];
};
pc.addTrack(track, stream); // Skicka mikrofon till modellen

// 4. Skapa datakanal för API-events
const dc = pc.createDataChannel("oai-events");
dc.addEventListener("open", () => {
  console.log("Datakanal öppen - kan skicka/ta emot events");
});
dc.addEventListener("message", (event) => {
  const serverEvent = JSON.parse(event.data);
  handleServerEvent(serverEvent);
});

// 5. Skapa SDP offer
await pc.setLocalDescription();

// 6. Hämta ephemeral token från vår backend (se sektion 7)
const tokenResponse = await fetch("/api/realtime/token", { method: "POST" });
const { token } = await tokenResponse.json();

// 7. Skicka SDP offer till OpenAI
const response = await fetch(
  "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
  {
    method: "POST",
    body: pc.localDescription.sdp,
    headers: {
      Authorization: `Bearer ${token}`, // Ephemeral token
      "Content-Type": "application/sdp",
    },
  }
);

// 8. Sätt remote description med OpenAI:s svar
const answer = { type: "answer" as RTCSdpType, sdp: await response.text() };
await pc.setRemoteDescription(answer);

// 9. Vänta på att anslutningen etableras
await new Promise<void>((resolve, reject) => {
  const timeout = setTimeout(() => reject("Connection timeout"), 10_000);
  pc.addEventListener("connectionstatechange", () => {
    if (pc.connectionState === "connected") {
      clearTimeout(timeout);
      resolve();
    }
  });
});

console.log("WebRTC-anslutning etablerad!");
```

#### Konfigurera sessionen via datakanalen:

```typescript
// Skicka session.update för att konfigurera modellen
dc.send(JSON.stringify({
  type: "session.update",
  session: {
    modalities: ["audio", "text"],
    instructions: "Du är en hjälpsam assistent för Caspecos restauranghanteringssystem...",
    voice: "coral",
    tools: [
      {
        type: "function",
        name: "navigate_to_page",
        description: "Navigera användaren till en specifik sida i systemet",
        parameters: {
          type: "object",
          properties: {
            page: { type: "string", description: "Sidans namn, t.ex. 'bookings', 'menu', 'reports'" }
          },
          required: ["page"]
        }
      }
    ],
    input_audio_transcription: { model: "gpt-4o-transcribe" },
    turn_detection: { type: "semantic_vad" }
  }
}));
```

### Ljudformat

WebRTC använder **Opus-codec** (48kHz, wideband) med Forward Error Correction automatiskt - ingen konfiguration behövs.

---

## 3. OpenAI Agents SDK (TypeScript)

### Installation

```bash
npm install @openai/agents zod
```

### Paketnamn: `@openai/agents`

SDK:t är ett lättviktigt ramverk för multi-agent workflows och röstbaserade agenter. Det stöder:

- **Agents** - LLM:er konfigurerade med instruktioner, verktyg och handoffs
- **Tools** - Funktioner, MCP-verktyg, hosted tools
- **Handoffs** - Överlämning mellan agenter
- **Guardrails** - Validering av in- och utdata
- **RealtimeAgent** - Specifikt för röstinteraktion
- **RealtimeSession** - Hanterar liveanslutningen

### Grundläggande RealtimeAgent

```typescript
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { tool } from '@openai/agents';
import { z } from 'zod';

// Definiera verktyg
const navigateToPage = tool({
  name: 'navigate_to_page',
  description: 'Navigera användaren till en specifik sida i restauranghanteringssystemet',
  parameters: z.object({
    page: z.string().describe('Sidans sökväg, t.ex. "/bookings", "/menu", "/reports"'),
  }),
  execute: async ({ page }) => {
    // Denna funktion körs i webbläsaren
    window.location.href = page;
    return `Navigerade till ${page}`;
  },
});

const explainCurrentScreen = tool({
  name: 'explain_current_screen',
  description: 'Förklara vad användaren ser på den aktuella skärmen',
  parameters: z.object({
    context: z.string().describe('Kort beskrivning av vad som visas'),
  }),
  execute: async ({ context }) => {
    return `Förklarar: ${context}`;
  },
});

// Skapa agent
const agent = new RealtimeAgent({
  name: 'CaspecoAssistant',
  instructions: `Du är en hjälpsam svensk assistent för Caspecos restauranghanteringssystem.
    Du hjälper användare navigera systemet, förklarar funktioner och svarar på frågor.
    Svara alltid på svenska. Var koncis men vänlig.`,
  tools: [navigateToPage, explainCurrentScreen],
});

// Starta session
const session = new RealtimeSession(agent, {
  model: 'gpt-4o-realtime-preview',
});

// Anslut med WebRTC (i webbläsaren)
await session.connect({
  apiKey: ephemeralToken, // Ephemeral token från backend
  transport: 'webrtc',   // Automatisk mikrofon + ljud
});
```

### RealtimeSession - Händelsehantering

```typescript
// Lyssna på transkription
session.on('transcript', (event) => {
  console.log('AI sa:', event.text);
  // Visa textversionen i UI:t
});

session.on('tool_call', (event) => {
  console.log('Verktyg anropat:', event.name, event.arguments);
});

session.on('error', (event) => {
  console.error('Sessionsfel:', event);
});

// Koppla ner
session.disconnect();
```

### Multi-agent handoffs

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';

const bookingAgent = new RealtimeAgent({
  name: 'BookingAssistant',
  instructions: 'Du hjälper med bokningar. Svara på svenska.',
  tools: [/* bokningsverktyg */],
  handoffs: ['menuAgent', 'reportAgent'], // Kan delegera till dessa
});

const menuAgent = new RealtimeAgent({
  name: 'MenuAssistant',
  instructions: 'Du hjälper med menyhantering. Svara på svenska.',
  tools: [/* menyverktyg */],
  handoffs: ['bookingAgent'],
});
```

### Miljöer som stöds

- Node.js 22+
- Deno
- Bun
- Cloudflare Workers (experimentellt)

---

## 4. openai-realtime-agents referensrepo

**Repo:** https://github.com/openai/openai-realtime-agents

### Beskrivning

En Next.js TypeScript-app som demonstrerar avancerade agentmönster för röstbaserade agenter. Visar två huvudarkitekturer:

### Mönster 1: Chat-Supervisor

Ett dual-agent-system:
- **Realtime chat-agent** hanterar direktinteraktion med användaren (röst)
- **Text-baserad supervisor** (gpt-4.1) hanterar komplexa operationer

**Fördelar:**
- Enklare migrering från befintliga textagenter
- Högre intelligens via starkare modeller för komplexa uppgifter
- Lägre kostnader (realtime-mini för enkel konversation)
- Bättre UX med lägre latens

### Mönster 2: Sequential Handoffs (Swarm-inspirerat)

Specialiserade agenter överför användaren mellan sig baserat på detekterat intent:
1. Agenten definierar vilka andra agenter den kan delegera till via `handoffs`-array
2. Modellen anropar en `transferAgents()`-funktion
3. `session.update`-events uppdaterar instruktioner och verktyg
4. `injectTransferTools()` skapar transfermekanismerna automatiskt

### Kodstruktur

```
src/app/
├── agentConfigs/
│   ├── chatSupervisor/        # Chat-supervisor-mönstret
│   ├── customerServiceRetail/ # Kundtjänst-scenario
│   ├── guardrails.ts          # Säkerhetsvalidering
│   ├── index.ts               # Export
│   ├── simpleHandoff.ts       # Enkel handoff-demo
│   ├── types.ts               # TypeScript-typer
│   └── voiceAgentMetaprompt.txt
├── api/
│   └── session/               # Ephemeral token-endpoint
└── page.tsx                   # Huvud-UI
```

### Verktyg definieras med YAML-beskrivningar

Verktyg använder YAML-beskrivningar (istället för JSON) för att förhindra oavsiktlig direktanvändning. Tool-logik specificeras via `toolLogic`-funktioner:

```typescript
// Exempel på agentdefinition (förenklat)
const agent = {
  name: "ReturnSpecialist",
  instructions: "Du hanterar returer och reklamationer...",
  tools: [
    {
      name: "check_return_eligibility",
      description: "Kontrollera om en vara kan returneras",
      parameters: { order_id: "string", reason: "string" },
    }
  ],
  toolLogic: {
    check_return_eligibility: async ({ order_id, reason }) => {
      // Faktisk logik här
      return { eligible: true, refund_amount: 299 };
    }
  },
  handoffs: ["salesAgent", "generalAgent"],
};
```

### Guardrails

Meddelanden kontrolleras via guardrail-system innan de visas:
- Markeras som `IN_PROGRESS`, `FAIL`, eller `PASS`
- Baserat på `guardrail_tripped`-events

### Installera och köra

```bash
git clone https://github.com/openai/openai-realtime-agents
cd openai-realtime-agents
npm i
# Lägg till OPENAI_API_KEY i .env
npm run dev
# Öppna http://localhost:3000
```

---

## 5. Vision/bildstöd i Realtime API

### Kan Realtime API ta emot bilder? JA!

Modellerna `gpt-realtime` och `gpt-realtime-mini` (samt `gpt-4o-realtime-preview`) stöder **bildinput**. Du kan skicka bilder, foton och skärmdumpar tillsammans med ljud eller text.

### Skicka en bild via datakanalen

```typescript
// Fånga skärmdump av aktuell sida
async function captureScreenshot(): Promise<string> {
  // Alternativ 1: html2canvas
  const canvas = await html2canvas(document.body);
  return canvas.toDataURL('image/jpeg', 0.7); // base64-kodad

  // Alternativ 2: Specifikt element
  // const element = document.getElementById('main-content');
  // const canvas = await html2canvas(element);
  // return canvas.toDataURL('image/jpeg', 0.7);
}

// Skicka bild till Realtime API via datakanalen
async function sendScreenCapture(dc: RTCDataChannel) {
  const dataUrl = await captureScreenshot();
  // dataUrl = "data:image/jpeg;base64,/9j/4AAQ..."
  // Vi behöver bara base64-delen efter prefixet

  const event = {
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_image",
          image_url: dataUrl, // data:image/jpeg;base64,...
        },
        {
          type: "input_text",
          text: "Här är en skärmdump av vad jag ser just nu på skärmen."
        }
      ],
    },
  };

  dc.send(JSON.stringify(event));

  // Trigga ett svar
  dc.send(JSON.stringify({ type: "response.create" }));
}
```

### Strategi för periodiska skärmdumpar

```typescript
// Skicka skärmdump vid navigering eller periodiskt
class ScreenCaptureManager {
  private dc: RTCDataChannel;
  private lastCapture: string = '';
  private captureInterval: NodeJS.Timeout | null = null;

  constructor(dataChannel: RTCDataChannel) {
    this.dc = dataChannel;
  }

  // Skicka vid sidnavigering
  async onPageChange(pageName: string) {
    await this.sendCapture(`Användaren navigerade till ${pageName}`);
  }

  // Periodisk capture (var 10:e sekund om sidan ändrats)
  startPeriodicCapture(intervalMs: number = 10000) {
    this.captureInterval = setInterval(async () => {
      const capture = await captureScreenshot();
      if (capture !== this.lastCapture) {
        this.lastCapture = capture;
        await this.sendCapture("Skärmen har uppdaterats");
      }
    }, intervalMs);
  }

  stopPeriodicCapture() {
    if (this.captureInterval) clearInterval(this.captureInterval);
  }

  private async sendCapture(context: string) {
    const dataUrl = await captureScreenshot();

    this.dc.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          { type: "input_image", image_url: dataUrl },
          { type: "input_text", text: context },
        ],
      },
    }));
  }
}
```

### Optimeringstips för bilder

- **Skala ner** till 512-720px på längsta sidan
- Använd **JPEG** med kvalitet 0.6-0.7 (mindre data, snabbare)
- Skicka **2-4 fps vid rörelse**, mindre vid stillastående
- OCR-nivå förståelse fungerar bra för UI-element, labels, text
- Vid liten text eller bländning: be användaren zooma in

---

## 6. Tool calling i realtidssessioner

### Definiera verktyg vid session.update

```typescript
// Via raw datachannel
dc.send(JSON.stringify({
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "navigate_to_page",
        description: "Navigera till en sida i restauranghanteringssystemet",
        parameters: {
          type: "object",
          properties: {
            page: {
              type: "string",
              enum: ["bookings", "menu", "reports", "settings", "tables", "staff"],
              description: "Vilken sida att navigera till"
            }
          },
          required: ["page"]
        }
      },
      {
        type: "function",
        name: "explain_current_screen",
        description: "Beskriv och förklara vad som visas på den aktuella skärmen",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        type: "function",
        name: "search_bookings",
        description: "Sök efter bokningar baserat på kriterier",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Datum i format YYYY-MM-DD" },
            guest_name: { type: "string", description: "Gästens namn" },
            party_size: { type: "number", description: "Antal gäster" }
          }
        }
      },
      {
        type: "function",
        name: "get_page_help",
        description: "Hämta hjälptext och guideinfo för den aktuella sidan",
        parameters: {
          type: "object",
          properties: {
            page: { type: "string", description: "Aktuell sida" }
          },
          required: ["page"]
        }
      }
    ]
  }
}));
```

### Hantera tool calls från modellen

```typescript
function handleServerEvent(event: any) {
  switch (event.type) {
    case "response.function_call_arguments.done":
      // Modellen vill anropa ett verktyg
      const { call_id, name, arguments: args } = event;
      const parsedArgs = JSON.parse(args);

      executeToolCall(name, parsedArgs).then((result) => {
        // Skicka tillbaka resultatet
        dc.send(JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: call_id,
            output: JSON.stringify(result),
          },
        }));

        // Be modellen fortsätta med resultatet
        dc.send(JSON.stringify({ type: "response.create" }));
      });
      break;

    case "response.audio_transcript.delta":
      // Streaming transkription av AI:ns svar
      updateTranscript(event.delta);
      break;

    case "input_audio_buffer.speech_started":
      // Användaren började prata (kan användas för UI-feedback)
      showSpeakingIndicator();
      break;

    case "input_audio_buffer.speech_stopped":
      hideSpeakingIndicator();
      break;
  }
}

async function executeToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "navigate_to_page":
      // Navigera i Next.js
      router.push(`/${args.page}`);
      return { success: true, navigated_to: args.page };

    case "explain_current_screen":
      // Skicka skärmdump så modellen kan se
      const screenshot = await captureScreenshot();
      return {
        current_page: window.location.pathname,
        screenshot_sent: true,
        page_title: document.title,
      };

    case "search_bookings":
      const results = await api.searchBookings(args);
      return results;

    case "get_page_help":
      return getHelpContent(args.page);

    default:
      return { error: "Okänt verktyg" };
  }
}
```

### Med Agents SDK (enklare)

```typescript
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { tool } from '@openai/agents';
import { z } from 'zod';

const navigateTool = tool({
  name: 'navigate_to_page',
  description: 'Navigera till en sida i systemet',
  parameters: z.object({
    page: z.enum(['bookings', 'menu', 'reports', 'settings', 'tables', 'staff']),
  }),
  execute: async ({ page }) => {
    router.push(`/${page}`);
    return { success: true, page };
  },
});

const agent = new RealtimeAgent({
  name: 'CaspecoHelper',
  instructions: 'Du är en svensk assistent...',
  tools: [navigateTool],
});

const session = new RealtimeSession(agent);
await session.connect({ apiKey: ephemeralToken });

// SDK:t hanterar tool calls automatiskt!
```

---

## 7. Ephemeral key-hantering med Next.js

### Varför ephemeral keys?

API-nyckeln får **aldrig** exponeras i webbläsaren. OpenAI:s lösning: skapa korttidsnycklar (ephemeral tokens) via en server-side endpoint.

### Next.js API Route: `/app/api/realtime/token/route.ts`

```typescript
// app/api/realtime/token/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "coral",
        modalities: ["audio", "text"],
        instructions: "Du är en hjälpsam svensk assistent för ett restauranghanteringssystem.",
        tools: [
          {
            type: "function",
            name: "navigate_to_page",
            description: "Navigera till en specifik sida",
            parameters: {
              type: "object",
              properties: {
                page: { type: "string" }
              },
              required: ["page"]
            }
          }
        ],
        input_audio_transcription: {
          model: "gpt-4o-transcribe"
        },
        turn_detection: {
          type: "semantic_vad"
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Failed to create session", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Returnera ephemeral token till klienten
    return NextResponse.json({
      token: data.client_secret.value,
      expires_at: data.client_secret.expires_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Klientsidan: hämta token och anslut

```typescript
// hooks/useRealtimeSession.ts
async function getEphemeralToken(): Promise<string> {
  const response = await fetch('/api/realtime/token', { method: 'POST' });
  if (!response.ok) throw new Error('Failed to get token');
  const { token } = await response.json();
  return token;
}

async function connectToRealtime() {
  const token = await getEphemeralToken();

  const pc = new RTCPeerConnection();
  // ... (se WebRTC-setup i sektion 2)

  const response = await fetch(
    "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
    {
      method: "POST",
      body: pc.localDescription.sdp,
      headers: {
        Authorization: `Bearer ${token}`, // Ephemeral - säkert i browser
        "Content-Type": "application/sdp",
      },
    }
  );
  // ...
}
```

### Alternativt med Agents SDK

```typescript
// Backend: app/api/realtime/token/route.ts
// (samma som ovan)

// Frontend: Agents SDK hanterar WebRTC internt
import { RealtimeSession, RealtimeAgent } from '@openai/agents/realtime';

const agent = new RealtimeAgent({ name: 'Assistant', instructions: '...' });
const session = new RealtimeSession(agent);

const token = await getEphemeralToken();
await session.connect({
  apiKey: token,
  transport: 'webrtc',
});
```

---

## 8. Prissättning

### Modeller och kostnader (per 1M tokens)

#### gpt-4o-realtime-preview

| Typ | Input | Cached Input | Output |
|-----|-------|--------------|--------|
| **Audio** | $100.00 | $20.00 | $200.00 |
| **Text** | $5.00 | $2.50 | $20.00 |

#### gpt-4o-mini-realtime-preview

| Typ | Input | Cached Input | Output |
|-----|-------|--------------|--------|
| **Audio** | $10.00 | $0.30 | $20.00 |
| **Text** | $0.60 | $0.30 | $2.40 |

### Per-minut-kostnad (uppskattning)

| | gpt-4o-realtime | gpt-4o-mini-realtime |
|---|---|---|
| **Audio input** | ~$0.06/min | ~$0.006/min |
| **Audio output** | ~$0.24/min | ~$0.024/min |
| **Totalt per minut samtal** | ~$0.30/min | ~$0.03/min |

### Tokenräkning för ljud

- **Input-ljud:** 1 token per 100ms ljud
- **Output-ljud:** 1 token per 50ms ljud

### Uppskattad kostnad för vår demo

**Scenario:** 5-minuters demo-samtal med skärmdumpar

| Post | Uppskattning |
|------|-------------|
| Audio input (5 min) | $0.30 (realtime) / $0.03 (mini) |
| Audio output (3 min) | $0.72 (realtime) / $0.07 (mini) |
| Text tokens (instruktioner etc.) | ~$0.05 / ~$0.005 |
| Bildtokens (5 skärmdumpar) | ~$0.10 / ~$0.01 |
| **Totalt per session** | **~$1.17 / ~$0.12** |

> **Rekommendation:** Använd `gpt-4o-mini-realtime-preview` under utveckling och demo. Kostnaden är ~10x lägre. Växla till fullstor modell om kvaliteten inte räcker.

### Bildprissättning

Bilder i Realtime API prissätts som bildtokens, ungefär samma som i GPT-4o Vision:
- Låg upplösning: ~85 tokens
- Hög upplösning: ~170 tokens per 512x512-tile + 85 base

---

## 9. Latens och prestanda

### Uppmätt latens

| Mätpunkt | Typiskt värde |
|----------|---------------|
| **Time-to-first-byte (API)** | ~500ms (från USA) |
| **Första partiell text** | ~150-250ms |
| **Första hörbara ljud** | ~220-400ms |
| **Round-trip voice latency** | ~480-520ms |
| **WebRTC RTT** | ~60-70ms |

### Varför WebRTC är snabbare

- Eliminerar "double-hop"-latens (klient -> server -> OpenAI)
- Använder UDP med inbyggd kongestionskontroll
- Packet loss concealment hanteras av WebRTC-stacken
- Direkt anslutning till OpenAI:s media edge

### Optimeringstips

1. **Använd WebRTC** istället för WebSocket (lägre latens)
2. **Semantic VAD** ger naturligare turtagning
3. **Skicka inte för stora bilder** - skala ner till max 720px
4. **Cached input tokens** minskar kostnaden med 80%
5. **Använd mini-modellen** om latens är viktigare än intelligens

---

## 10. Arkitekturförslag för Caspeco-demo

### Översiktsarkitektur

```
┌─────────────────────────────────────────────┐
│                 Webbläsare                   │
│                                              │
│  ┌──────────────┐   ┌────────────────────┐  │
│  │  Caspeco UI  │   │  Voice Assistant   │  │
│  │  (React)     │   │  Panel             │  │
│  │              │   │  - Mikrofon-knapp  │  │
│  │  Bokningar   │   │  - Transkription   │  │
│  │  Menyer      │   │  - Status          │  │
│  │  Rapporter   │   │                    │  │
│  └──────┬───────┘   └────────┬───────────┘  │
│         │                    │               │
│         │    ┌───────────────┤               │
│         │    │  WebRTC       │               │
│         │    │  DataChannel  │               │
│         │    │  + Audio      │               │
│         │    │               │               │
│  ┌──────┴────┴───────────────┴───────────┐  │
│  │  RealtimeSession / WebRTC Manager     │  │
│  │  - Skärmdumpshantering                │  │
│  │  - Tool call execution                │  │
│  │  - Navigation hooks                   │  │
│  └───────────────┬───────────────────────┘  │
└──────────────────┼──────────────────────────┘
                   │ WebRTC (Audio + Data)
                   ▼
         ┌─────────────────┐
         │  OpenAI Realtime │
         │  API             │
         │  (gpt-4o-mini    │
         │   -realtime)     │
         └─────────────────┘
                   ▲
                   │ Ephemeral Token
         ┌─────────────────┐
         │  Next.js Backend │
         │  /api/realtime/  │
         │  token           │
         │                  │
         │  OPENAI_API_KEY  │
         └─────────────────┘
```

### Implementeringsplan

#### Fas 1: Grundläggande röstinteraktion
1. Skapa Next.js API route för ephemeral tokens
2. Implementera WebRTC-anslutning i en React-hook (`useRealtimeVoice`)
3. Enkel UI-panel med mikrofon-knapp och transkription
4. Grundläggande system-prompt på svenska

#### Fas 2: Skärmdumpar och vision
1. Integrera `html2canvas` för att fånga UI-skärmdumpar
2. Skicka skärmdump vid sidnavigering (via `router.events`)
3. Skicka skärmdump på begäran ("Vad ser jag på skärmen?")
4. Optimera bildstorlek (JPEG, 512-720px)

#### Fas 3: Tool calling
1. Implementera `navigate_to_page` - AI:n kan navigera användaren
2. Implementera `explain_current_screen` - AI:n beskriver aktuell vy
3. Implementera `search_bookings` - AI:n kan söka bokningar
4. Implementera `get_page_help` - AI:n hämtar kontextspecifik hjälp

#### Fas 4: Multi-agent (valfritt)
1. Specialiserade agenter per domän (bokningar, meny, rapporter)
2. Handoff-mekanismer mellan agenter
3. Supervisor-mönster för komplexa frågor

### Exempelkod: Komplett React-hook

```typescript
// hooks/useRealtimeVoice.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseRealtimeVoiceOptions {
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
  onToolCall?: (name: string, args: any) => Promise<any>;
  onError?: (error: Error) => void;
  systemPrompt?: string;
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const connect = useCallback(async () => {
    // 1. Hämta ephemeral token
    const tokenRes = await fetch('/api/realtime/token', { method: 'POST' });
    const { token } = await tokenRes.json();

    // 2. Setup WebRTC
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // 3. Audio output
    const audioEl = new Audio();
    audioEl.autoplay = true;
    audioRef.current = audioEl;
    pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };

    // 4. Audio input (mikrofon)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    pc.addTrack(stream.getAudioTracks()[0], stream);

    // 5. Datakanal
    const dc = pc.createDataChannel("oai-events");
    dcRef.current = dc;

    dc.addEventListener("open", () => {
      // Konfigurera sessionen
      dc.send(JSON.stringify({
        type: "session.update",
        session: {
          instructions: options.systemPrompt || "Du är en hjälpsam svensk assistent.",
          voice: "coral",
          input_audio_transcription: { model: "gpt-4o-transcribe" },
          turn_detection: { type: "semantic_vad" },
        }
      }));
    });

    dc.addEventListener("message", async (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "response.audio_transcript.done":
          options.onTranscript?.(msg.transcript, 'assistant');
          break;

        case "conversation.item.input_audio_transcription.completed":
          options.onTranscript?.(msg.transcript, 'user');
          break;

        case "response.function_call_arguments.done":
          if (options.onToolCall) {
            const result = await options.onToolCall(msg.name, JSON.parse(msg.arguments));
            dc.send(JSON.stringify({
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: msg.call_id,
                output: JSON.stringify(result),
              },
            }));
            dc.send(JSON.stringify({ type: "response.create" }));
          }
          break;

        case "input_audio_buffer.speech_started":
          setIsSpeaking(true);
          break;

        case "input_audio_buffer.speech_stopped":
          setIsSpeaking(false);
          break;

        case "response.audio.delta":
          setIsAiSpeaking(true);
          break;

        case "response.audio.done":
          setIsAiSpeaking(false);
          break;
      }
    });

    // 6. SDP-utbyte
    await pc.setLocalDescription();
    const sdpResponse = await fetch(
      "https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
      {
        method: "POST",
        body: pc.localDescription!.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
      }
    );
    await pc.setRemoteDescription({
      type: "answer",
      sdp: await sdpResponse.text(),
    });

    setIsConnected(true);
  }, [options]);

  const disconnect = useCallback(() => {
    pcRef.current?.close();
    setIsConnected(false);
  }, []);

  const sendScreenshot = useCallback(async (imageDataUrl: string, context?: string) => {
    if (!dcRef.current) return;

    dcRef.current.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          { type: "input_image", image_url: imageDataUrl },
          ...(context ? [{ type: "input_text", text: context }] : []),
        ],
      },
    }));
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!dcRef.current) return;

    dcRef.current.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    }));
    dcRef.current.send(JSON.stringify({ type: "response.create" }));
  }, []);

  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  return {
    isConnected,
    isSpeaking,
    isAiSpeaking,
    connect,
    disconnect,
    sendScreenshot,
    sendTextMessage,
  };
}
```

### Exempelkod: Voice Assistant Panel-komponent

```tsx
// components/VoiceAssistant.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import html2canvas from 'html2canvas';

interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export function VoiceAssistant() {
  const router = useRouter();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const handleToolCall = useCallback(async (name: string, args: any) => {
    switch (name) {
      case 'navigate_to_page':
        router.push(`/${args.page}`);
        // Fånga skärmdump efter navigering
        setTimeout(async () => {
          const canvas = await html2canvas(document.body);
          voice.sendScreenshot(
            canvas.toDataURL('image/jpeg', 0.6),
            `Navigerade till ${args.page}`
          );
        }, 1000);
        return { success: true, page: args.page };

      case 'get_current_page_info':
        return {
          path: window.location.pathname,
          title: document.title,
        };

      default:
        return { error: 'Okänt verktyg' };
    }
  }, [router]);

  const voice = useRealtimeVoice({
    systemPrompt: `Du är en hjälpsam AI-assistent för Caspecos restauranghanteringssystem.
Du kan se användarens skärm via skärmdumpar och hjälpa dem navigera systemet.
Svara alltid på svenska. Var vänlig, koncis och professionell.
När användaren frågar om något de ser på skärmen, analysera den senaste skärmdumpen.
Du kan navigera användaren till olika sidor med navigate_to_page-verktyget.`,
    onTranscript: (text, role) => {
      setTranscript(prev => [...prev, { role, text, timestamp: new Date() }]);
    },
    onToolCall: handleToolCall,
  });

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold">AI-assistent</h3>
        <p className="text-xs text-gray-500">
          {voice.isConnected ? 'Ansluten' : 'Frånkopplad'}
          {voice.isSpeaking && ' | Du pratar...'}
          {voice.isAiSpeaking && ' | AI:n svarar...'}
        </p>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-2">
        {transcript.map((entry, i) => (
          <div key={i} className={`text-sm ${
            entry.role === 'user' ? 'text-blue-700' : 'text-gray-700'
          }`}>
            <span className="font-medium">
              {entry.role === 'user' ? 'Du' : 'AI'}:
            </span>{' '}
            {entry.text}
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        {!voice.isConnected ? (
          <button
            onClick={voice.connect}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Starta röstassistent
          </button>
        ) : (
          <>
            <button
              onClick={voice.disconnect}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Avsluta
            </button>
            <button
              onClick={async () => {
                const canvas = await html2canvas(document.body);
                voice.sendScreenshot(
                  canvas.toDataURL('image/jpeg', 0.6),
                  'Användaren vill veta vad som visas på skärmen'
                );
              }}
              className="bg-gray-200 py-2 px-4 rounded hover:bg-gray-300"
              title="Skicka skärmdump"
            >
              📷
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## Sammanfattning och rekommendationer

### Val av approach

| Approach | Fördelar | Nackdelar | Rekommendation |
|----------|----------|-----------|----------------|
| **Raw WebRTC + DataChannel** | Full kontroll, minimal abstraktion | Mer kod att underhålla | Bra för demo |
| **@openai/agents SDK** | Enklare API, inbyggd tool/handoff-hantering | Extra dependency, nytt ramverk | Bra om vi vill ha multi-agent |
| **openai-realtime-agents repo** | Komplett referensimplementation | Kan vara overkill för enkel demo | Bra att studera |

### Rekommendation för Caspeco-demo

1. **Börja med raw WebRTC** - Vi har full kontroll och förstår varje del
2. **Använd `gpt-4o-mini-realtime-preview`** - Billigare, snabbare, tillräcklig kvalitet
3. **Implementera vision** - Skicka skärmdumpar vid sidbyten, otroligt kraftfullt
4. **Next.js API route** för ephemeral tokens - Säkert och enkelt
5. **3-4 tools** initialt: navigate, explain screen, search, get help
6. **Migrera till Agents SDK** om vi behöver multi-agent-handoffs senare

### Nyckelberoenden

```json
{
  "dependencies": {
    "html2canvas": "^1.4.1"
  }
}
```

OpenAI API-nyckeln behöver bara finnas server-side (i `.env.local`).

---

## Källor

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [OpenAI Realtime API WebRTC Guide](https://platform.openai.com/docs/guides/realtime-webrtc)
- [OpenAI Realtime Conversations Guide](https://developers.openai.com/api/docs/guides/realtime-conversations/)
- [openai-realtime-agents Repository](https://github.com/openai/openai-realtime-agents)
- [OpenAI Agents SDK (JS/TS)](https://github.com/openai/openai-agents-js)
- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-js/)
- [Voice Agents Quickstart](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [Unofficial Guide to OpenAI Realtime WebRTC](https://webrtchacks.com/the-unofficial-guide-to-openai-realtime-webrtc-api/)
- [Measuring Realtime API Latency](https://webrtchacks.com/measuring-the-response-latency-of-openais-webrtc-based-real-time-api/)
- [OpenAI Realtime + GPT-4o Vision](https://skywork.ai/blog/agent/openai-realtime-gpt-4o-vision-build-multimodal-voice-agents-2025/)
- [OpenAI Realtime API Pricing Calculator](https://skywork.ai/blog/agent/openai-realtime-api-pricing-2025-cost-calculator/)
- [GPT Realtime Mini Pricing Breakdown](https://www.eesel.ai/blog/gpt-realtime-mini-pricing)
- [Introducing gpt-realtime](https://openai.com/index/introducing-gpt-realtime/)
