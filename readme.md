# Prompt: Build a Scalable Real‑Time Web App (Next.js + TypeScript)

You are an expert full‑stack engineer tasked with scaffolding and implementing a **production‑grade, scalable, real‑time** web application. Follow the exact requirements below. When choices are unstated, apply industry best practices.

---

## Product Goal

Build a demo‑ready, extensible app that showcases:

* Real‑time APIs (WebSockets and Server‑Sent Events / streaming HTTP)
* Multi‑turn conversations and tool integrations (chat-style UX with streaming tokens)
* Modular, reusable UI components
* Benchmark‑ready architecture (easy to add features, tests, and services)

---

## Guiding Principles (must enforce)

1. **Clarity & Reuse:** Small, focused, reusable components. Factor repeated patterns into components.
2. **Consistency:** Enforce a unified design system: color tokens, typography, spacing, components.
3. **Simplicity:** Prefer minimal logic and styling complexity. Avoid premature abstractions.
4. **Demo-Oriented:** Optimize for rapid prototyping (streaming, multi-turn chat, tools) while keeping production quality.
5. **Visual Quality:** High polish: spacing, padding, hover states, focus rings, motion. Follow OSS-quality UI standards.

---

## Frontend Stack Defaults (hard requirements)

* **Framework:** Next.js (App Router) + **TypeScript**
* **Styling:** Tailwind CSS (with CSS variables for theme tokens)
* **UI Components:** shadcn/ui (Radix primitives)
* **Icons:** Lucide (primary). Leave adapters for Material Symbols/Heroicons.
* **State Management:** Zustand (slices per domain)
* **Animation:** Framer Motion (a.k.a. `motion`)
* **Fonts:** Sans Serif: Inter (default), Geist, Mona Sans, IBM Plex Sans, Manrope

---

## UI / UX Best Practices (must enforce)

* **Visual Hierarchy:** Limit to 4–5 font sizes/weights; use `text-xs` for captions. Use `text-xl+` only for hero headings.
* **Color Usage:** 1 neutral base (zinc) + up to 2 accents (primary, secondary). Use tokens, not raw colors.
* **Spacing & Layout:** Use multiples of 4 for padding/margins. For long streams, use fixed-height containers with internal scrolling.
* **State Handling:** Use skeletons (`animate-pulse`) for fetching. Indicate clickability via hover transitions and subtle shadow.
* **Accessibility:** Semantic HTML, ARIA where needed, and Radix/shadcn accessibility defaults.

---

## Project Structure (optimize for parallel development)

```
/src
  /app
    /(pages)
      /chat
        page.tsx
      /tools
        page.tsx
      /dashboard
        page.tsx
    /api
      /realtime/route.ts        # SSE stream endpoint
      /ws/route.ts              # WebSocket upgrade (Edge runtime)
      /messages/route.ts        # REST for messages (GET/POST)
      /tools/[tool]/route.ts    # Tool execution proxy
  /components                  # Reusable UI building blocks
    /ui/                       # Wrapped shadcn components with app tokens
    /layout/
    /charts/
    ChatComposer.tsx
    ChatMessage.tsx
    StreamContainer.tsx
    ToolInvocationCard.tsx
    Skeleton.tsx
  /hooks
    useStream.ts               # SSE hook
    useWebSocket.ts            # WS hook with auto-retry
    useKeyboardShortcuts.ts
  /lib
    fetcher.ts                 # typed fetch helpers
    sse.ts                     # EventSource helpers
    ws.ts                      # WS helpers (heartbeat, backoff)
    logger.ts                  # thin client logger
    validators.ts              # zod schemas
    metrics.ts                 # simple client metrics
  /stores
    chat.store.ts              # Zustand store (messages, status)
    tools.store.ts
    ui.store.ts
  /types
    chat.ts                    # message, tool, stream types
    api.ts                     # REST/SSE payload types
  /styles
    globals.css
    tailwind.css
    theme.css                  # CSS vars for colors/spacing/typography
  /server
    /realtime                  # server utilities
      sse.ts                   # stream builder
      ws.ts                    # WS server handlers
      broadcaster.ts           # pub/sub fan‑out
      rateLimit.ts
      auth.ts
    /services
      tools.ts                 # tool registry & dispatcher
      messages.ts              # chat/message service (persist + query)
    /db
      prisma.ts                # Prisma client
      repositories.ts
  /tests
    e2e/
    unit/
```

> Ensure code splitting by feature domain so multiple engineers can work in parallel without merge contention. Keep public APIs stable via shared `/types`.

---

## Data & Contracts (define with Zod + TypeScript)

Create shared, versioned contracts:

* `ChatMessage`: `{ id, role: 'user'|'assistant'|'tool'|'system', content, createdAt, toolCalls?: ToolCall[] }`
* `ToolCall`: `{ id, name, args, status: 'queued'|'running'|'done'|'error', output? }`
* `StreamChunk`: `{ type: 'token'|'message'|'tool-status'|'error'|'done', data: unknown }`
* `Paged<T>`: `{ items: T[]; nextCursor?: string }`
  Validate all inbound/outbound API payloads with zod and narrow types at boundaries.

---

## Real‑Time APIs

Implement both **SSE** and **WebSocket** for flexibility.

### 1) Streaming Inference (SSE)

* Endpoint: `POST /api/realtime` → starts stream; returns **SSE** with `text/event-stream`.
* Events: `token`, `message`, `tool-status`, `error`, `done`.
* Backpressure: flush every \~20–40ms; coalesce small tokens.
* Heartbeat: send `: ping` comments every 15s to keep proxies alive.
* Auth: Bearer token or cookie. Rate-limit per IP/user.

### 2) Bidirectional Tools (WebSocket)

* Endpoint: `GET /api/ws` → upgrades to WS. Edge runtime if possible.
* Client → Server messages: `invoke_tool`, `cancel_tool`, `ack`, `resume`.
* Server → Client messages: `tool_update`, `partial_result`, `error`, `complete`.
* Include session `id` and monotonic `seq` to support resume after reconnect.

### 3) REST for CRUD

* `GET/POST /api/messages` with cursor‑based pagination. Use `nextCursor`.
* `POST /api/tools/[tool]` executes a named tool through server registry.

---

## Pages & Core UI

* **/chat**: streaming chat with composer, history panel, tool results drawer.
* **/tools**: browse, configure, and test tools; toggle per‑tool permissions.
* **/dashboard**: metrics (RPS, latency, tokens/s, user sessions), live stream preview.

### Components (reusable)

* `ChatComposer`: textarea + send button, file attach (future), hotkeys (`Cmd+Enter`).
* `ChatMessage`: message bubble with role styling, markdown, code blocks, copy button.
* `StreamContainer`: fixed height, virtualized list, auto‑scroll with “Jump to latest” affordance.
* `ToolInvocationCard`: status badges, logs, collapse/expand, error state.
* `Skeleton`: for loading lists, charts, and message placeholders.

> Use shadcn/ui primitives (Card, Button, Input, Badge, Tabs, Tooltip, Dialog, Dropdown, ScrollArea) and Lucide icons.

---

## Styling System

* Tailwind + CSS variables for theme: `--bg`, `--fg`, `--muted`, `--accent`, etc.
* Base: `zinc` palette; up to **two** accent hues.
* Spacing scale: multiples of **4px**.
* Typography scale: 4–5 sizes, consistent weights. Headings only when necessary.
* Motion: Framer Motion for subtle entrance/exit, list reordering, and toast feedback.

---

## State & Data Flow

* **Zustand** stores per domain with selectors; avoid over‑rendering.
* Keep server state on server; hydrate only required slices.
* Streaming updates flow into `chat.store` via `useStream`/`useWebSocket` hooks.
* Idempotency keys for mutations; optimistic UI with rollback on error.

---

## Server Architecture

* Runtime: Next.js App Router API routes. Prefer Edge for SSE/WS if constraints allow.
* **Broadcaster**: In‑memory pub/sub with optional Redis adapter for multi‑instance fan‑out.
* **Persistence**: Prisma + Postgres (messages, tools, sessions). Add RLS if multi‑tenant.
* **Rate limiting**: token bucket (IP+user); fail fast with `429` + Retry‑After.
* **Observability**: pino logger, request IDs, OpenTelemetry traces, basic metrics (RPS, p95 latency, errors, dropped frames).

---

## Example Endpoints (spec)

### `POST /api/realtime`

Request: `{ prompt: string; context?: string; tools?: string[] }`
Stream events:

```
event: token
data: { id, text }

event: message
data: { id, role, content }

event: tool-status
data: { id, name, status }

event: error
data: { code, message }

event: done
data: { id }
```

### `GET /api/messages?cursor=...`

Response: `{ items: ChatMessage[]; nextCursor?: string }`

### `POST /api/tools/[tool]`

Request: `{ args: Record<string, unknown> }` → returns `{ jobId }` then progress via WS.

---

## Coding Standards

* Type‑safe boundaries (zod parse at API edges).
* ESLint + Prettier; strict TS config.
* No `any`; use discriminated unions for stream messages.
* Keep components under \~200 lines; extract subcomponents early.
* Write JSDoc/TSDoc on public types and utilities.

---

## Testing & Quality

* Unit: vitest for utilities, stores, and components.
* Integration: Playwright for core flows (send message, receive stream, tool run, reconnect).
* Contract tests: ensure API payloads match zod schemas.
* Lighthouse budget: performance ≥ 90, accessibility ≥ 95.

---

## Deployment & Ops

* Env‑based config with `zod` validation (fail fast on boot).
* Edge‑friendly where possible; fall back to Node runtime for DB operations.
* Sticky sessions not required (Redis broadcaster for WS scale‑out).
* CI: lint, type‑check, test, build. Preview deployments per PR.

---

## Acceptance Criteria (checklist)

* [ ] Repository boots with `pnpm` and generates shadcn UI.
* [ ] `/chat` streams tokens via SSE with heartbeat; UI shows incremental tokens.
* [ ] `/api/ws` supports bidirectional tool updates with resume on reconnect.
* [ ] Zustand stores manage messages and tool states without redundant renders.
* [ ] Theming uses tokens; consistent typography and spacing (4px grid).
* [ ] Skeletons and hover states present per UX best practices.
* [ ] Playwright e2e covers stream, tool, reconnect, and pagination.
* [ ] Metrics dashboard renders live stats via WS.

---

## Quickstart Commands (include in README)

```
pnpm create next-app@latest realtime-app --ts --eslint --tailwind --app
cd realtime-app
pnpm add zustand zod framer-motion lucide-react sonner
# shadcn setup
pnpm dlx shadcn-ui@latest init -y
pnpm dlx shadcn-ui@latest add button input card textarea badge tabs tooltip dialog dropdown-menu scroll-area skeleton
# server deps
pnpm add pino @prisma/client
pnpm add -D prisma vitest @vitest/ui playwright @playwright/test @types/node
```

---

## Notes for the Implementer

* Prefer streamed responses everywhere feasible.
* Keep a strict separation between UI components and domain logic.
* Write inline docs where decisions are non‑obvious.
* Leave TODOs only with context and clear next steps.
