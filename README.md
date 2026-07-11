# CareerTrack — Job Application Dashboard

A modern full-stack dashboard for tracking internship and full-time applications. Built to replace spreadsheet tracking with analytics, calendar views, and a clean hiring pipeline.

## Stack

- **Next.js 15** (App Router) + React + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Prisma** + **PostgreSQL** ([Neon](https://neon.tech) or local Docker)
- **Recharts** for analytics
- Dark mode via `next-themes`

## Features

- Dashboard with totals, interview/offer/rejection counts, response rate, monthly chart, status pie, recent activity
- Applications table with search, sort, status/location filters, pagination, color-coded badges
- Add / edit applications (company, title, location, dates, status, salary, referral, links, resume version, cover letter, notes)
- Analytics: rates, locations, monthly trends, funnel + Sankey pipeline
- Calendar for interviews and deadlines
- Dark mode + responsive layout

## Quick start (Neon)

1. Create a free project at [console.neon.tech](https://console.neon.tech)
2. Open **Connection details** and copy:
   - **Pooled** connection → `DATABASE_URL`
   - **Direct** connection → `DIRECT_URL`
3. Configure and run:

```bash
npm install
cp .env.example .env
# Paste both Neon URLs into .env

npx prisma migrate deploy
npm run db:seed   # optional sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local Docker (optional)

```bash
npm run db:up
# Set DATABASE_URL and DIRECT_URL to the local Postgres URL in .env.example
npm run db:migrate
npm run db:seed
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js (Turbopack) |
| `npm run build` | Production build |
| `npm run db:up` | Start local Postgres via Docker |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed sample applications |
| `npm run db:studio` | Open Prisma Studio |

## Application statuses

Wishlist → Applied → OA → Recruiter Screen → Interview → Final Round → Offer  
Also: Rejected, Withdrawn, Ghosted

## Project structure

```
src/
  app/                 # Pages (dashboard, applications, analytics, calendar)
  components/          # UI, charts, forms, layout
  lib/                 # Prisma, actions, analytics, validations
prisma/
  schema.prisma
  seed.ts
docker-compose.yml     # Local Postgres
```
