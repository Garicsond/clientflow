# Clientflow

Solo / small-team CRM for clients and the workflows you run against them.

Clients live in a simple book (lead → active → paused → closed). Workflow templates are ordered step lists you can start on a client; each instance tracks step status, due dates, and notes.

v1 uses a **shared site password** in production (not per-user auth). Set `SITE_PASSWORD` before sharing the URL.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- [Neon](https://neon.tech) Postgres via Prisma (works on Vercel’s ephemeral filesystem)
- Server Actions for mutations
- Hosted on [Vercel](https://vercel.com)

**Why Neon:** Prisma talks to Postgres natively (`db push`, seed, generate) without a SQLite/libSQL driver adapter. Neon’s pooled connection string is built for serverless, the free tier is enough for a solo CRM, and Vercel has a first-party Neon integration. Local `npm run dev` uses the same provider with a local or Neon URL.

## Environment variables

Copy `.env.example` to `.env` and fill in values. Never commit `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection for the app. On Neon, use the **pooled** URL (`-pooler` in the host). |
| `DATABASE_URL_UNPOOLED` | yes | Direct (unpooled) URL for Prisma CLI (`db push`, seed). Locally this can be the same as `DATABASE_URL`. |
| `SITE_PASSWORD` | production | Shared password for the site-wide unlock page. Leave empty to skip the gate in local/dev. In production the app stays locked until this is set. |
| `ALLOW_SEED` | no | Set to `true` to insert sample clients/templates into an **empty** database. Hosted URLs and production never auto-seed without this. |

## Run locally

You need a Postgres database. Easiest options:

1. **Same Neon branch you deploy with** (paste both connection strings into `.env`)
2. **Local Postgres**, for example Docker:

```bash
docker run --name clientflow-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=clientflow -p 5432:5432 -d postgres:16
```

Then:

```bash
npm install
cp .env.example .env
# edit .env — local example (matches the Docker command above):
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clientflow?schema=public"
# DATABASE_URL_UNPOOLED="postgresql://postgres:postgres@localhost:5432/clientflow?schema=public"
# SITE_PASSWORD=""          # gate off locally
# ALLOW_SEED=""             # local Postgres auto-seeds on first load if empty

npm run db:push
npm run db:seed        # optional; first load also seeds local empty DBs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To try the password gate locally, set `SITE_PASSWORD` in `.env` and restart `npm run dev`.

### Other scripts

| Script | What it does |
| --- | --- |
| `npm run db:setup` | `db:push` then `db:seed` |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:push` | Push the Prisma schema to the database in `DATABASE_URL` / `DATABASE_URL_UNPOOLED` |
| `npm run db:seed` | Seed sample data if the DB is empty (blocked on hosted DBs unless `ALLOW_SEED=true`) |
| `npm run build` | `prisma generate` + production build |
| `npm run lint` | ESLint |

## Deploy on Vercel (phone browser)

Exact path from zero to opening the app on a phone:

### 1. Create a Neon database

1. Sign up at [https://console.neon.tech](https://console.neon.tech) and create a project (free tier is fine).
2. Open **Connect** and copy both strings:
   - **Pooled** → `DATABASE_URL`  
     Example: `postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&connect_timeout=15`
   - **Direct** → `DATABASE_URL_UNPOOLED`  
     Example: `postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require`
3. From this repo, point `.env` at those URLs and create the tables:

```bash
npx prisma db push
```

Do **not** run `npm run db:seed` against Neon unless you want the fake sample clients.

### 2. Import the GitHub repo on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new) and import `Garicsond/clientflow`.
2. Framework preset: **Next.js** (default). No `vercel.json` is required.
3. Before the first deploy, add environment variables (Production + Preview):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** URL |
| `DATABASE_URL_UNPOOLED` | Neon **direct** URL |
| `SITE_PASSWORD` | a password only you know |
| `ALLOW_SEED` | leave unset |

`prisma generate` runs on install (`postinstall`) and again in `npm run build`.

4. Deploy. The first production URL looks like `https://clientflow-xxx.vercel.app`.

Alternatively, Vercel → Storage → **Create Database → Neon** will provision Postgres and inject URLs; rename/copy them to `DATABASE_URL` and `DATABASE_URL_UNPOOLED` as above, then run `npx prisma db push` once with those values.

### 3. Seed production (optional, once)

Only if you want the demo clients and “Client onboarding” template on the hosted DB:

```bash
ALLOW_SEED=true DATABASE_URL="postgresql://..." DATABASE_URL_UNPOOLED="postgresql://..." npm run db:seed
```

Otherwise start empty and add real clients from the phone.

### 4. Open on a phone

1. Visit the Vercel URL.
2. Enter `SITE_PASSWORD` on the unlock page.
3. Add a home-screen shortcut if you like; this is a mobile-friendly web app, not a store app.

To lock the device later, use **Lock** in the header (phone) or sidebar footer (desktop).

If you forget to set `SITE_PASSWORD`, production stays on the unlock page with a config message instead of exposing the CRM.

## What you can do

1. **Clients** — list, create, edit, archive/restore. Fields: name, company, email, phone, status, tags, notes.
2. **Client detail** — overview, activity log, assigned workflows.
3. **Templates** — create ordered steps (title + optional instructions).
4. **Workflows** — start a template on a client, mark steps to do / doing / done, save due dates and notes, complete or cancel the instance.
5. **Dashboard** — counts, recent clients, active workflows.

## Auth TODO

The shared password is a stopgap, not real user accounts.

- [x] Site-wide password gate for production
- [ ] Add authentication (e.g. Auth.js / a hosted IdP)
- [ ] Scope clients and workflows to a user or workspace
