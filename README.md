# Realstream Demo Platform

A demo-ready, production-inspired realtime workspace showcasing streaming chat, WebSocket-enabled tool orchestration, and a live metrics dashboard built with Next.js 14, TypeScript, Tailwind, and shadcn/ui.

## Features

- **Realtime chat** using Server-Sent Events with heartbeats and incremental token rendering.
- **Bidirectional tool layer** powered by WebSockets with resume-safe sequencing.
- **Tool registry** for enabling/disabling integrations and dispatching test invocations.
- **Operations dashboard** visualising live WebSocket events and derived metrics.
- **Reusable design system** built on Tailwind tokens, shadcn/ui primitives, and Inter typography.

## Quickstart

```bash
pnpm install
pnpm dev
```

The project follows the same scaffold as a standard Next.js 14 App Router application. To recreate it from scratch, run:

```bash
pnpm create next-app@latest realtime-app --ts --eslint --tailwind --app
cd realtime-app
pnpm add zustand zod framer-motion lucide-react sonner
pnpm dlx shadcn-ui@latest init -y
pnpm dlx shadcn-ui@latest add button input card textarea badge tabs tooltip dialog dropdown-menu scroll-area skeleton
pnpm add pino @prisma/client
pnpm add -D prisma vitest @vitest/ui playwright @playwright/test @types/node
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server. |
| `pnpm build` | Build the production bundle. |
| `pnpm start` | Serve the production build. |
| `pnpm lint` | Run ESLint. |
| `pnpm test` | Run unit tests with Vitest. |
| `pnpm test:e2e` | Execute Playwright end-to-end tests. |

## Architecture Overview

```
/src
  app
    (pages)
      chat
      tools
      dashboard
    api
      realtime      # SSE endpoint
      ws             # WebSocket upgrade handler (Edge runtime)
      messages       # Cursor-based REST API
      tools/[tool]   # Tool execution proxy
  components        # Reusable, token-aware UI building blocks
  hooks             # Streaming, WebSocket, and keyboard hooks
  lib               # Fetching, logging, metrics, validators
  server            # Realtime helpers, persistence stubs
  stores            # Zustand slices per domain
  styles            # Tailwind + theme tokens
  tests             # Vitest + Playwright harness
```

- Shared contracts live in `src/types` and are enforced with zod at API boundaries.
- `src/components/ui` wraps shadcn primitives with project-specific tokens and interaction states.
- `src/hooks/useStream` and `src/hooks/useWebSocket` manage realtime flows with automatic cleanup and retries.
- `src/stores/*` slices keep UI state modular and minimise unnecessary renders.

## Testing

```bash
pnpm test
```

Add Playwright scenarios under `src/tests/e2e` to cover streaming, tool execution, and reconnection flows.

## Environment

Environment variables are validated with zod in `src/lib/validators.ts`. Optional variables:

- `NEXT_PUBLIC_API_BASE`
- `NEXT_PUBLIC_WS_BASE`
- `NEXT_PUBLIC_LOG_LEVEL`

## Notes

- Server utilities under `src/server` provide an upgrade path toward persistent storage, rate limiting, and pub/sub fan-out.
- The in-memory message store keeps the demo self-contained while exposing clear seams for database integration.
- Styling adheres to a 4px spacing scale, dual accent palette, and consistent typography for high visual polish.
