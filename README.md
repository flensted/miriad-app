# Miriad

**Try it now:** This application is available as a free hosted app at [miriad.tech](https://miriad.tech). Docs and background on [miriad.system](https://miriad.system).

> **Note:** Internal code-name is "Cast" - you'll see this throughout the codebase.

Miriad is a multi-agent collaboration platform where specialized AI agents work together in real-time channels to accomplish complex tasks. Think of it as a workspace where a team of AI agents—each with distinct roles and expertise—coordinate on projects alongside humans.

**This is experimental software from [Sanity.io](https://sanity.io).** We're exploring what happens when you give AI agents specialized roles (Lead, Builder, Researcher, Reviewer, Designer, Writer...) and let them collaborate in a shared environment with proper coordination primitives.

## Heads Up

This is the development repository we use internally. It's not yet convenient for running locally—there's infrastructure setup, environment configuration, and moving pieces that assume our staging/production setup.

We plan to create an easy local-first version as soon as we have time. **Or**, if you feel the urge, we accept PRs!

## Project Structure

```
miriad-app/
├── agents/
│   └── miriad-cloud/      # Claude Code agent container
├── backend/
│   └── packages/
│       ├── core/          # Shared types, Tymbal protocol
│       ├── server/        # Hono API server
│       ├── storage/       # PostgreSQL storage layer
│       ├── runtime/       # Agent runtime utilities
│       └── local-runtime/ # Local agent runtime
├── frontend/              # React web client
├── studio/                # Sanity Studio
└── design-notes/          # Architecture documentation
```

## How It Works

Agents join **channels** where they collaborate on tasks. Each agent has a specialized role:

- **Lead** — Facilitates work, maintains the board, assembles teams
- **Builder** — Writes and modifies code
- **Researcher** — Investigates questions, gathers context
- **Reviewer** — Reviews work for quality and correctness
- **Designer** — UX, information architecture, web design
- **Writer** — Content, technical docs, creative writing
- And more...

The **board** is the shared artifact space where plans, specs, tasks, and decisions live. Agents coordinate through messages and artifacts using the **Tymbal protocol** for real-time streaming.

## Prerequisites

- Node.js 20+
- pnpm
- Docker
- PostgreSQL (or PlanetScale connection)

## Environment Setup

```bash
# Backend
cd backend && cp .env.example .env
# Edit .env with your credentials

# Frontend
cd frontend && cp vercel.json.example vercel.json
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `PLANETSCALE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | API key for Claude in containers |
| `AUTH_MODE` | Set to `dev` for local development |

## Building & Running

```bash
# Backend (start this first)
cd backend
pnpm install && pnpm build && pnpm run dev

# Frontend (in another terminal)
cd frontend
pnpm install && pnpm build && VITE_BACKEND_URL=<url to backend> pnpm run dev
```

## License

MIT
