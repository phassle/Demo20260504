# Demo20260504

Demo repository showcasing AI-powered applications for Monterro portfolio companies, plus the agentic-development practices used to build them.

## Projects

### caspeco-fe-demo

A frontend demo of **Caspeco's** restaurant management platform — POS, analytics, purchase optimization, and financial reporting for restaurants. Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

### voicelive-webapp

A real-time voice chat application with avatar support, built using **Azure Voice Live API** and WebRTC. Features AI-powered voice communication, avatar video streaming, transcription, and interactive controls. Python FastAPI backend with a React TypeScript frontend.

### caspeco-support-inbox

Support inbox tooling for Caspeco.

## Repository structure

```
├── caspeco-fe-demo/       # Caspeco restaurant platform frontend demo
├── caspeco-support-inbox/ # Caspeco support inbox tooling
├── voicelive-webapp/      # Real-time voice chat with AI avatar
├── data/                  # Data files and outputs
├── research/              # Research material, screenshots, and references
├── AGENTS.md              # Agent handbook (CLAUDE.md is a symlink to this)
└── docs/agents/           # Issue tracker, triage labels, domain doc conventions
```

---

# Agentic development practices

Conventions, code samples, and best practices used when working on this repo with coding agents. Distilled from the *Agentic Development Workshop* (May 2026).

The headline data point: Red Hat (April 2026) measured the same developers shipping **4.4× more code through an agent** when one disciplined markdown handbook (`AGENTS.md`) was in place vs. without it. Everything below builds on that.

## 1. Context is the bottleneck

The agent's context window is her desk. Every turn re-uploads everything she's seen so far. Attention cost grows **n²** in tokens (Vaswani et al., *Attention Is All You Need*, 2017) — at high fill, recall and judgment degrade fast.

Three working zones:

| Context fill | Behaviour |
|---|---|
| < 50% | Smart zone — sharp recall, good judgment |
| 50–75% | Drift zone — starts forgetting earlier instructions |
| > 75% | Danger zone — `/clear` and start a fresh session |

**Rules of thumb**

- Phase the work. Big task → split into phases, each in a fresh context.
- `/clear` between unrelated tasks. Don't let yesterday's debugging clutter today's feature.
- Run `/statusline` once per repo — puts model, context %, cost, and branch on screen permanently.

```bash
# One-shot setup (saved to .claude/statusline.sh; future sessions inherit it)
/statusline
```

## 2. `AGENTS.md` — the handbook

`AGENTS.md` is the single most important file in this repo. It's loaded into every agent session, so every line costs context — keep it tight.

**Targets**

- ≤ 150 lines (Anthropic recommends ~60; 150 is a generous upper bound).
- Cover **WHAT** (tech stack), **WHY** (purpose), **HOW** (commands).
- Use `file:line` references instead of inline code snippets — snippets go stale, line refs update with the code.
- Don't restate rules every C# / TS / Python project on Earth already follows. The LLM is the brain; you don't teach a senior colleague camelCase.

**Two mandatory closing lines** (every project should have these):

```markdown
- At the end of each plan, list unresolved questions (if any).
- Be extremely concise. Sacrifice grammar for concision.
```

> Pocock himself dropped *be concise* once `/grill-me` replaced the need for him to read plans. Keep it until your grilling discipline is in place.

**Generate it properly — don't `/init` and walk away**

`/init` produces a bloated handbook that crowds the desk every session. Use this prompt instead, run inside the repo root:

```text
Analyse this codebase and create an AGENTS.md file:
1. Keep it under 150 lines
2. Cover: WHAT (tech stack), WHY (purpose), HOW (commands)
3. Progressive Disclosure: index pointing to docs/ files
4. file:line references instead of code snippets
5. Assume linters handle code style
6. Always include these two lines:
   - Be extremely concise. Sacrifice grammar for concision.
   - At the end of each plan, list unresolved questions (if any).

Extract patterns into docs/architectural_patterns.md.
Finally: ln -s AGENTS.md CLAUDE.md
```

**Hierarchy** — backend, frontend, and integrations have different rules. Use nearest-wins:

```
myapp/
├── AGENTS.md              ← project-wide
├── backend/
│   └── AGENTS.md          ← .NET-specific rules
├── frontend/
│   └── AGENTS.md          ← React rules
└── integrations/
    └── partner/AGENTS.md  ← partner-specific only
```

**Symlink for tooling compatibility**

`AGENTS.md` is the cross-tool industry standard (60k+ repos as of 2026). Claude Code reads `CLAUDE.md`, so symlink rather than duplicate:

```bash
ln -s AGENTS.md CLAUDE.md
```

This repo is set up that way — `CLAUDE.md` is a symlink to `AGENTS.md`. One source of truth, both tools read it.

**Living document** — AGENTS.md is reviewed every sprint, not written once. Don't try to predict everything up front; let mistakes drive it. Third time the agent forgets X, add a line.

## 3. Soft rules vs. hard permissions

| | `AGENTS.md` | `.claude/settings.json` |
|---|---|---|
| Nature | Advisory — agent uses judgment | Enforced — agent literally cannot try |
| Use for | Style, conventions, "prefer X" | Destructive ops, prod surfaces, secrets |

Example deny-list:

```
Bash(rm -rf *)
Bash(dotnet ef database update *)
Bash(git push --force *)
```

If you wouldn't let a junior push to main, hooks should make sure the agent can't either.

## 4. The toolkit

Four mechanisms, each answering "how do I keep her desk clean?"

| Tool | Loads when | Use for |
|---|---|---|
| **AGENTS.md** | Every session | Always-true project rules |
| **Skills** | On demand (only description preloads, ~80 tokens) | Procedures invoked sometimes |
| **Slash commands** | When typed | Reusable prompts with `$ARGUMENTS` |
| **Subagents** | When delegated | Heavy work that needs its own desk |
| **Hooks** | Deterministic events | Format on save, run tests on stop |

### Skills

A skill costs ~80 tokens until invoked. SKILL.md is genuinely three sentences of metadata + a body:

```markdown
---
name: grill-me
description: Interview the user about a fuzzy idea, walking
             the design tree before any plan is drafted.
---

Interview me relentlessly about every aspect of this plan
until we reach a shared understanding.

Walk down each branch of the design tree, resolving dependencies
between decisions one-by-one.

For each question, provide your recommended answer.
Ask the questions one at a time.
```

### Slash commands with `$ARGUMENTS`

The killer feature — same command, different inputs, no rewriting:

```bash
/bdd-in-issue 1247
/bdd-in-issue issues/03-ui-modal.md
```

### Hooks (`.claude/settings.json`)

Deterministic — agent doesn't decide whether they fire.

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{ "command": "dotnet format --include $FILE" }]
    }],
    "Stop": [{
      "hooks": [{ "command": "dotnet build --warnaserror && dotnet test" }]
    }]
  }
}
```

| Event | Fires |
|---|---|
| `SessionStart` | New session |
| `PreToolUse` | Before a tool — can **block** |
| `PostToolUse` | After a tool |
| `Stop` | When the agent stops |

**Don't** put hook-style enforcement in AGENTS.md — she'll forget. **Don't** put skill content in AGENTS.md — it crowds the desk every session.

### Subagents

Most underused tool. Each subagent gets its own context window — the parent only sees the summary.

```markdown
---
name: deep-research
description: Investigate a topic, return summary
context: fork           ← isolated window
agent: Explore          ← read-only
tools: ["Read", "Grep", "Glob"]
---

Investigate $ARGUMENTS thoroughly. Return:
- key findings (3-5 bullets)
- file:line refs for the most important code
- unresolved questions
```

Practical patterns: a `/review-pr` subagent that reads the diff and returns a verdict; an `/explore-module` subagent that maps an unfamiliar area without polluting the parent context.

## 5. Storage — where everything lives

Specs are **per-ticket**, not long-lived artifacts. Source of truth is the issue tracker; the repo just mirrors the active slice.

```
project/
├── AGENTS.md
│
├── specs/            ← only while issue is OPEN
│   └── <feature>/
│       ├── spec.md  plan.md  tasks/
│       └── # delete folder when issue closes
│
├── docs/             ← survives close
│   ├── adr/NNNN-<title>.md
│   └── bdd/<feature>.feature
│
└── src/...

# Source of truth: GitHub / Jira issue
# Repo just mirrors the active slice.
```

ADRs are append-only. Specs come and go with their tickets.

This repo's agent conventions live in `docs/agents/` (issue tracker, triage labels, domain doc rules) — see `AGENTS.md` for the index.

## 6. The afternoon arc — fuzzy idea → shipped slice

Five steps. Steps 1–3 and 5 are human-in-the-loop. Step 4 runs AFK.

### Step 1 — `/grill-me`

Don't ask the agent for a plan — reach a shared design concept first. `/grill-me` walks the design tree, resolving each branch with the user.

```bash
/grill-me clientbrief.md
```

### Step 2 — `/to-prd`

Summarises the grilling into a destination document: problem, solution, user stories, implementation decisions, testing decisions.

```bash
/to-prd
```

```markdown
# PRD · gamification

## Problem
Students drop off after a few lessons.

## Solution
Points + streaks visible on dashboard.

## User stories
- As a student, when I complete a lesson…
- As a student, when I break a streak…
  (18 stories)

## Implementation decisions
## Testing decisions
```

### Step 3 — `/to-issues` (vertical slicing)

The most important step. Cut work into **independently grabbable** vertical slices — each issue carries enough context for a fresh agent to pick it up cold. Tracer-bullet style: thin slices through every layer, rather than horizontal layer-by-layer.

Output: a kanban of issues, each with its own spec.

### Step 4 — AFK execution loop (per issue)

```text
// Per issue
1. /clear                ← back to Momento (fresh desk)
2. read AGENTS.md        ← onboard
3. read issue            ← the destination
4. plan → implement → test
5. open PR
6. close issue           ← spec frozen
```

`/clear` between every issue is non-negotiable. Each ticket = fresh desk.

### Step 5 — Review

Don't skip. Code is your battleground — bad codebases produce bad agents. Borrow Linear's ritual (Thomas Kessler):

```text
Rule: you have to FIND your own fix.
      no one hands them to you.
      you hunt.
```

> Everybody was always on the lookout for small quality fixes, even when building totally unrelated features. They knew they had to come to the next Wednesday meeting with a fix.

## 7. Five takeaways (priority order)

1. **Context discipline** — phase the work, `/clear` often, watch the statusline.
2. **AGENTS.md ≤ 150 lines** — properly generated, hierarchical, with the two mandatory closing lines.
3. **Soft rules vs. hard permissions** — judgment in `AGENTS.md`, enforcement in `.claude/settings.json`.
4. **Skills, slash commands, hooks, subagents** — pick the right tool for each rule.
5. **Vertical slicing + AFK loop** — `/grill-me` → `/to-prd` → `/to-issues` → per-issue `/clear`-driven loop → review.

If you only do (1) and (2), you've already captured most of the 4.4× lift.

## 8. Credits

Standing on:

- **Vaswani et al., 2017** — *Attention Is All You Need* (n² attention cost, the reason context discipline matters)
- **Mitchell Hashimoto** — "context engineering" framing
- **Boris Cherny** — Claude Code; AGENTS.md vs. skills vs. hooks vs. subagents framing
- **Matt Pocock** — `/grill-me`, `/to-prd`, `/to-issues`, the per-ticket spec pattern, "AGENTS.md as living document"
- **Red Hat (April 2026)** — the 4.4× productivity measurement
- **Thomas Kessler / Linear** — "find your own fix" review ritual
