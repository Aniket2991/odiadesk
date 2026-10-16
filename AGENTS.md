# Agent Instructions — OdiaDesk

OdiaDesk is a local Odisha news and information platform built with Next.js, Prisma, PostgreSQL, and Vercel.

## Required skills
- For React/Next.js implementation and performance work, read `.agents/skills/vercel-react-best-practices/SKILL.md`.
- For UI, accessibility, and UX reviews, read `.agents/skills/web-design-guidelines/SKILL.md`.
- For deployment, API, database, authentication, and environment-variable changes, read `.agents/skills/vercel-deployment-security/SKILL.md`.

## Editorial integrity — mandatory
- Never invent news, quotes, dates, statistics, source names, or article URLs.
- Every imported or published news story must retain a real source URL and clear source attribution.
- Importing or fetching a story must create a draft only; never auto-publish imported content.
- Preserve the human editorial workflow: Draft → Review → Published → Archived.
- Public APIs and public pages must expose published stories only. Drafts and review material are private to authorized admins.
- Protect admin routes and actions with server-side authorization. Treat ADMIN_KEY and DATABASE_URL as secrets; never expose them to client components or commit them.
- Keep district, category, language, and source metadata consistent with the existing schema and the coverage of all 30 Odisha districts.
- For mixed Odia-English presentation, preserve the meaning of both languages and do not fabricate translations or article imagery. Use relevant, licensed, source-appropriate images; provide a fallback when no suitable image exists.

## Engineering rules
- Inspect existing code and Prisma schema before changing architecture or database models.
- Prefer small, reversible changes; preserve working behavior.
- Validate external data and user input on the server, handle errors safely, and avoid leaking secrets.
- Do not reset or destructively migrate production data without explicit approval.
- Run available lint, type-check, tests, and production build; report exactly what was run.
- Never claim deployment, indexing, or tests succeeded without confirming evidence.
