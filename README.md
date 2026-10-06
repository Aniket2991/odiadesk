# OdiaDesk

**Your Odisha. Your Local Desk.**

OdiaDesk is a district-first Odisha information platform built with Next.js, TypeScript, Prisma and PostgreSQL.

## Current platform

- All 30 Odisha districts configured in Prisma Postgres.
- Verified-source article model with Draft → Review → Published → Archived workflow.
- Public news feed and article pages read from published database records.
- District pages automatically show published stories for that district.
- Homepage includes district search and live published-story highlights.
- Category pages show published stories for the selected desk.
- Protected editorial dashboard at `/admin`.
- Admin login at `/admin/login`.
- Public news API exposes published stories only with bounded pagination and caching.
- Readiness endpoint at `/api/ready` checks database connectivity.
- SEO metadata, RSS, sitemap, robots rules and NewsArticle structured data are included.
- GitHub Actions build validation is configured.

## Environment

Copy `.env.example` to `.env.local`.

Required:
- `DATABASE_URL`: Prisma Postgres connection string.
- `ADMIN_KEY`: long private key used for the editorial login.

Never commit real environment values.

## Editorial rule

OdiaDesk must not invent news. Every published story should have a real source URL and be editorially verified.

AI may assist with summarisation, translation, categorisation and SEO, but it is not a source of facts.

## Production database migration note

The initial production schema was provisioned before the migration file was committed. Before running future production migrations, reconcile the existing initial migration history once:

`npx prisma migrate resolve --applied 20261004093751_init`

Only run this against the production `DATABASE_URL` after confirming that the existing database already matches the migration. Do not use `prisma migrate deploy` as the first step on this already-provisioned database.

## Launch roadmap

1. Connect the GitHub repository to Vercel.
2. Keep `DATABASE_URL` and `ADMIN_KEY` private in Vercel.
3. Verify the production build and `/api/ready`.
4. Connect `odiadesk.com`.
5. Publish a small set of genuinely verified stories before applying for advertising.
6. Add analytics and advertising after the content platform has real traffic.
7. Add local-business listings and sponsored placements only with clear labelling.
