# OdiaDesk

**Your Odisha. Your Local Desk.**

OdiaDesk is a district-first Odisha information platform built with Next.js, TypeScript, Prisma and PostgreSQL.

## Current platform

- All 30 Odisha districts configured in Prisma Postgres.
- Verified-source article model with Draft → Review → Published → Archived workflow.
- Public news feed and article pages read from published database records.
- District pages automatically show published stories for that district.
- Protected editorial dashboard at `/admin`.
- Admin login at `/admin/login`.
- Public news API exposes published stories only.
- SEO metadata and NewsArticle structured data are included.
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

## Production roadmap

1. Connect the GitHub repository to Vercel.
2. Add `DATABASE_URL` and `ADMIN_KEY` as private Vercel environment variables.
3. Verify the production build.
4. Connect `odiadesk.com`.
5. Add search, jobs, events, alerts, weather and local business modules.
6. Add analytics and advertising only after the content platform is stable.
