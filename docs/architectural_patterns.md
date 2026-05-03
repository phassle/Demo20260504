# Architectural patterns

Patterns extracted from the demo subprojects in this repo. Reference, not prescription — these are how the existing code is shaped, so new code in the same subproject should follow them unless there's a reason not to.

---

## 1. View-switching state machine (`caspeco-fe-demo`)

**Where**: `caspeco-fe-demo/src/app/page.tsx:19-65`, `src/lib/constants.ts:21-38`.

A single client component (`Home`) holds **all** view state. There is no router, no per-route page file beyond the one root `page.tsx`. Views are React components that get switch-rendered based on `currentView: ViewId`.

Key elements:

- View IDs are a closed enum (`VIEW_IDS` in `src/lib/constants.ts:21-28`) — adding a view = adding a constant + a render branch + a nav item, in that order.
- Transitions use a 150ms opacity fade gated by a `transitioning` flag — see `src/app/page.tsx:32-39`.
- `showView()` is the **only** way to change the active view. Direct `setCurrentView` calls bypass the highlight-clear and the fade.
- View-specific sub-state (`salesCategory`, `salesTab`, `kbQuery`) lives on `Home` so the voice agent can mutate it without prop drilling.

**Implication for new features**: don't introduce React Router or per-route files. New views = new entry in `VIEW_IDS` + new branch in the render switch (`src/app/page.tsx:78-131`).

---

## 2. Voice-agent tool dispatch (`caspeco-fe-demo`)

**Where**: `caspeco-fe-demo/src/lib/voice/tools.ts`, `src/hooks/useRealtimeVoice.ts`, `src/app/page.tsx:59-65`.

The OpenAI Realtime agent does not own UI state. It calls **tools** that translate to host-provided callbacks.

Contract:

1. Tool schema is declared in `src/lib/voice/tools.ts:17` (`toolDefinitions`) — passed to OpenAI at session start.
2. Each tool has an executor (`executeAddProduct`, `executeHighlight`, `executeGetPageHelp`, …) that returns `ToolResult` (`tools.ts:155`).
3. Executors that mutate UI receive **callbacks from the host**: `onNavigate`, `onAddProduct`, `onApplyFilter`, `onSendToKB` — wired in `src/app/page.tsx:59-65`.
4. Highlight lifecycle: every navigation must call `clearAllHighlights()` first (`tools.ts:199`). This is enforced in `showView()` and in `executeHighlight()` itself (`tools.ts:232-234`). New voice tools that change view must follow the same rule.
5. Tools own DOM-targeted side effects (highlights, scroll). React state lives on `Home`. Don't cross the line.

**Implication**: when adding a new agent capability, add a tool definition + an executor + a host callback. Don't reach into React state from inside the executor.

---

## 3. Token-vended browser → backend → upstream pattern

**Where**:
- `caspeco-fe-demo/src/app/api/realtime/token/route.ts` (OpenAI)
- `caspeco-fe-demo/src/app/api/kb/chat/route.ts` (OpenAI / KB)
- `voicelive-webapp/backend/main.py` (Azure Voice Live)

Browser never holds upstream API keys. Two flavours in this repo:

**Flavour A — short-lived ephemeral session (OpenAI Realtime)**
- Browser POSTs to `/api/realtime/token`.
- Server adds `OPENAI_API_KEY` from env, calls OpenAI's `/v1/realtime/sessions`, returns the ephemeral session token to the browser.
- Browser uses the ephemeral token directly (over WebRTC) — server is not in the data path.

**Flavour B — full WebSocket proxy (Azure Voice Live)**
- Browser opens WebSocket to FastAPI backend.
- Backend authenticates to Azure with `DefaultAzureCredential` and opens its own WebSocket to Azure Voice Live.
- Backend bidirectionally pumps frames between the two sockets.
- See `voicelive-webapp/backend/main.py` for the full proxy lifecycle.

**Pick Flavour A** when the upstream supports ephemeral sessions and you need low latency. **Pick Flavour B** when the upstream requires a fixed credential the browser can't see, or when you need to inspect/transform frames.

---

## 4. WebRTC peer lifecycle

**Where**:
- `caspeco-fe-demo/src/lib/voice/webrtc.ts` (OpenAI Realtime)
- `voicelive-webapp/frontend/src/utils/WebRTCAvatarManager.ts` (Azure avatar)

Both projects use WebRTC for media but differ in role:

- **OpenAI Realtime (caspeco)**: browser is the active peer. Connects directly to OpenAI using the ephemeral token from Flavour A above. Server is out of the data path.
- **Azure avatar (voicelive)**: backend brokers the SDP offer/answer between browser and Azure. Browser receives the avatar video stream over the negotiated peer connection.

Common lifecycle (in both):
1. Get auth/token from backend.
2. Create `RTCPeerConnection` with audio/video transceivers.
3. Negotiate SDP.
4. Attach incoming tracks to `<audio>` / `<video>` elements.
5. On disconnect: close peer, stop tracks, detach refs.

**Implication**: don't introduce a new WebRTC implementation; extend the existing manager / hook.

---

## 5. MSAL (Entra ID) auth on the frontend

**Where**: `voicelive-webapp/frontend/src/utils/authService.ts`, `useAuth.ts`, `frontend/ENTRA_ID_SETUP.md`.

- Sign-in via `@azure/msal-browser` redirect/popup flow.
- Auth state surfaced through `useAuth()` hook — components subscribe rather than reading from MSAL directly.
- Backend trusts the JWT in the `Authorization` header on the WebSocket upgrade.

**Implication**: any new authenticated UI in `voicelive-webapp` should call `useAuth()` rather than touching MSAL directly.

---

## 6. Mock data, no persistence

**Where**: `caspeco-fe-demo/src/data/`, `caspeco-fe-demo/src/lib/constants.ts`.

This is a demo. There is no database, no ORM, no migration tool. Mock data is plain TS modules:

- `bookings.ts`, `employees.ts`, `products.ts`, `salesData.ts` — exported arrays / records.
- `constants.ts` — colours, view IDs, nav items.

To add seed data: edit the file. To "change schema": change the type and the data — the type-checker will tell you what else broke.

Do not introduce Prisma, Drizzle, or any backend persistence layer without explicit user approval.

---

## 7. Multi-project workspace, independent subprojects

The repo root is a workspace, not a monorepo:

- No root `package.json`, no shared `node_modules`, no Turborepo / Nx / pnpm workspaces.
- Each subproject manages its own deps.
- Root-level `AGENTS.md` indexes the subprojects but does not centralise their tooling.
- Per-subproject conventions can override; place a subproject-specific `AGENTS.md` in the subproject root if/when it diverges.

**Implication**: don't introduce monorepo tooling. If two subprojects need to share code, copy it — the friction signals whether it's worth a shared package.
