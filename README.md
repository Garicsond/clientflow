# Clientflow

Solo / small-team CRM for clients and the workflows you run against them.

Clients live in a simple book (lead → active → paused → closed). Workflow templates are ordered step lists you can start on a client; each instance tracks step status, due dates, and notes.

No authentication in v1 — this is a local/dev app. **TODO:** add auth before sharing or deploying.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via Prisma (no external database)
- Server Actions for mutations

## Run

```bash
npm install
cp .env.example .env   # skip if .env already exists
npm run db:push
npm run db:seed        # optional; the app also seeds on first load if the DB is empty
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run db:push` creates `prisma/dev.db`. Sample data includes a few clients and a **Client onboarding** template, with one workflow already started.

### Other scripts

| Script | What it does |
| --- | --- |
| `npm run db:setup` | `db:push` then `db:seed` |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## What you can do

1. **Clients** — list, create, edit, archive/restore. Fields: name, company, email, phone, status, tags, notes.
2. **Client detail** — overview, activity log, assigned workflows.
3. **Templates** — create ordered steps (title + optional instructions).
4. **Workflows** — start a template on a client, mark steps to do / doing / done, save due dates and notes, complete or cancel the instance.
5. **Dashboard** — counts, recent clients, active workflows.

## Auth TODO

v1 has no login, users, or permissions. Everything in the local SQLite file is fully writable. Before any shared or production use:

- [ ] Add authentication (e.g. Auth.js / a hosted IdP)
- [ ] Scope clients and workflows to a user or workspace
- [ ] Stop auto-seeding outside local development
