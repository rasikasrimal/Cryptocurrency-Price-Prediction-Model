# Realstream Demo Platform

A demo-ready, production-inspired realtime workspace showcasing streaming chat, WebSocket-enabled tool orchestration, and a live metrics dashboard built with Next.js 14, TypeScript, Tailwind, and shadcn/ui.

## Features

- **Realtime chat** using Server-Sent Events with heartbeats and incremental token rendering.
- **Bidirectional tool layer** powered by WebSockets with resume-safe sequencing.
- **Tool registry** for enabling/disabling integrations and dispatching test invocations.
- **Operations dashboard** visualising live WebSocket events and derived metrics.
- **Reusable design system** built on Tailwind tokens, shadcn/ui primitives, and Inter typography.

## Prerequisites

- **Node.js 18.18+** (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
- **pnpm 8+** (`corepack enable` on Node 18.18+ automatically provides pnpm)

## Step-by-Step Setup & Run Guide

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/Cryptocurrency-Price-Prediction-Model.git
   cd Cryptocurrency-Price-Prediction-Model
   ```

2. **Install JavaScript dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables (optional)**

   Copy `.env.example` to `.env.local` if you need to override defaults used by the prediction backend or frontend clients. See [Environment](#environment) for available variables.

4. **Run database migrations (optional)**

   The current demo stores data in-memory, so Prisma migrations are not required. If you connect a database, update the Prisma schema and execute:

   ```bash
   pnpm prisma migrate dev
   ```

5. **Start the development servers**

   ```bash
   pnpm dev
   ```

   - The Next.js frontend runs on `http://localhost:3000`.
   - The prediction backend API is served from the same process under `/api/predictions`.

6. **Query the prediction backend**

   Example curl command for retrieving the default portfolio forecast:

   ```bash
   curl 'http://localhost:3000/api/predictions'
   ```

   Retrieve a specific asset forecast by providing the `symbol` query parameter (e.g. `BTC` or `ETH`):

   ```bash
   curl 'http://localhost:3000/api/predictions?symbol=BTC'
   ```

7. **Run tests**

   ```bash
   pnpm test
   ```

## Quickstart (TL;DR)

```bash
pnpm install
pnpm dev
```

## Project Scaffold

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

- Shared contracts live in `types` and are enforced with zod at API boundaries.
- `components/ui` wraps shadcn primitives with project-specific tokens and interaction states.
- `hooks/useStream` and `hooks/useWebSocket` manage realtime flows with automatic cleanup and retries.
- `stores/*` slices keep UI state modular and minimise unnecessary renders.


## Testing

```bash
pnpm test
```

Add Playwright scenarios under `tests/e2e` to cover streaming, tool execution, and reconnection flows.

## Environment

Environment variables are validated with zod in `lib/validators.ts`. Optional variables:


- `NEXT_PUBLIC_API_BASE`
- `NEXT_PUBLIC_WS_BASE`
- `NEXT_PUBLIC_LOG_LEVEL`

## Notes

- Server utilities under `server` provide an upgrade path toward persistent storage, rate limiting, and pub/sub fan-out.
- The in-memory message store keeps the demo self-contained while exposing clear seams for database integration.
- Styling adheres to a 4px spacing scale, dual accent palette, and consistent typography for high visual polish.
