# AGENTS

Monterro Demo20260504 — AI-powered demos for portfolio companies. Built for live agentic-development workshops. No production code; mocked data; visual-first.

## Subprojects

| Path | Stack | Purpose |
|---|---|---|
| `caspeco-fe-demo/` | Next.js 14, TS, Tailwind, shadcn/ui, `@openai/agents`, OpenAI Realtime, Chart.js | Voice-driven restaurant POS / analytics demo |
| `voicelive-webapp/` | FastAPI + Vite/React, MSAL (Entra ID), WebSockets, WebRTC | Avatar voice chat over Azure Voice Live API |
| `caspeco-support-inbox/` | _(empty placeholder)_ | Reserved |
| `data/`, `research/` | — | Demo data + reference material; `data/` is gitignored |

Each subproject is independent — no shared deps, no monorepo tooling. Run dev servers separately.

## Commands

### caspeco-fe-demo

```
cd caspeco-fe-demo
npm install
npm run dev          # http://localhost:3000
npm run build
npm run lint         # next lint
```

Realtime voice needs `OPENAI_API_KEY` in `.env.local` — consumed by `src/app/api/realtime/token/route.ts`.

### voicelive-webapp

```
# Backend
cd voicelive-webapp/backend
pip install -r requirements.txt
python main.py       # FastAPI WebSocket proxy

# Frontend
cd voicelive-webapp/frontend
npm install
npm run dev          # vite (default :5173)
npm run type-check   # tsc --noEmit
```

Backend env (Azure): `AZURE_AI_RESOURCE_NAME`, `MODEL_DEPLOYMENT_NAME`, `AVATAR_CHARACTER`, `AVATAR_STYLE`, `VOICE_NAME` — see `voicelive-webapp/backend/main.py:50-65`. Backend authenticates to Azure via `DefaultAzureCredential`.

No test runners configured in either subproject.

## Architecture entry points

### caspeco-fe-demo

- View state hub (single source of truth) → `src/app/page.tsx:19-65`
- Render switch + voice FAB wiring → `src/app/page.tsx:78-131`
- View IDs + nav catalogue → `src/lib/constants.ts:21-38`
- Realtime voice hook → `src/hooks/useRealtimeVoice.ts`
- Voice tool definitions → `src/lib/voice/tools.ts:17`
- Voice tool executors → `src/lib/voice/tools.ts:163` (`executeAddProduct`), `:199` (`clearAllHighlights`), `:232` (`executeHighlight`)
- WebRTC for OpenAI Realtime → `src/lib/voice/webrtc.ts`
- Token vending → `src/app/api/realtime/token/route.ts`
- KB chat endpoint → `src/app/api/kb/chat/route.ts`
- Mock data (no DB) → `src/data/{bookings,employees,products,salesData}.ts`
- Per-project notes → `caspeco-fe-demo/CLAUDE.md`, `caspeco-fe-demo/specs/`

### voicelive-webapp

- WebSocket proxy to Azure Voice Live → `backend/main.py`
- Voice metadata parser → `backend/utils/voice_metadata.py`
- WebRTC avatar peer manager → `frontend/src/utils/WebRTCAvatarManager.ts`
- Voice client hook → `frontend/src/utils/useVoiceLiveClient.ts`
- MSAL Entra ID auth → `frontend/src/utils/authService.ts`, `frontend/src/utils/useAuth.ts`
- Top-level UI → `frontend/src/components/VoiceLiveAgent.tsx`
- Setup notes → `voicelive-webapp/README.md`, `voicelive-webapp/frontend/ENTRA_ID_SETUP.md`

## Patterns

See `docs/architectural_patterns.md` for:

- View-switching state machine + transition (`caspeco-fe-demo`)
- Voice-agent tool dispatch contract (host callbacks, highlight lifecycle)
- WebSocket-proxy + token-vending (browser never holds Azure/OpenAI secrets)
- WebRTC peer lifecycle for OpenAI Realtime and avatar streaming

## Conventions

- All data is hardcoded in `src/data/` or `src/lib/constants.ts` — there is no database, ORM, or migration layer. Edit the source files; no schema change is needed.
- Shared types live next to their producer module, not in a global `types/` folder.
- Tailwind only for styling in `caspeco-fe-demo`; no styled-components, no CSS modules.
- Next.js API routes are server-only — never add `'use client'` there.
- Voice tool handlers MUST call `clearAllHighlights()` before navigating — see `src/app/page.tsx:28-31`.
- Linters handle code style (`next lint`, `tsc --noEmit`) — don't restate style rules here.

## Issue conventions

Every issue in this project MUST include BDD scenarios (`Given` / `When` / `Then`) covering the acceptance criteria. The BDD block is the contract: when an agent picks the issue up, it derives TDD test cases directly from the scenarios. No BDD → the issue is not ready for an agent to pick up — apply `needs-info` and stop.

## Agent harness

- **Issue tracker** — GitHub issues on `phassle/Demo20260504` via `gh` CLI. See `docs/agents/issue-tracker.md`.
- **Triage labels** — default canonical vocabulary. See `docs/agents/triage-labels.md`.
- **Domain docs** — single-context, scoped to `caspeco-fe-demo` for now. See `docs/agents/domain.md`.
- **Skills** — synced from mattpocock/skills via `skills-lock.json`; sources in `.agents/skills/`; `.claude/skills/` is a symlink farm into them.
- **Demo seed** — `slack-thread.md` at the root is a `/grill-me` input for a small *bordsnotering* feature on `caspeco-fe-demo`.

## Stop rules

If unsure, stop and ask. Specifically:

- No destructive shell ops (`rm -rf`, `git reset --hard`, `git push --force`) without explicit confirmation.
- No commits or PRs without explicit user request.
- No edits to `caspeco-fe-demo/specs/` without confirming the spec is still active.
- No changes to `.agents/skills/` files — they are vendored from upstream; bump `skills-lock.json` instead.

## Plan output rules

- Be extremely concise. Sacrifice grammar for concision.
- At the end of each plan, list unresolved questions (if any).
