# GitHub Copilot Instructions — OdiaDesk

Follow `AGENTS.md` as the repository-wide source of truth.

- Read the relevant skill under `.agents/skills/` before React/Next.js, UI, security, or deployment work.
- Never invent news content or sources. Source imports must remain drafts pending human review.
- Public endpoints and pages must expose published stories only; enforce admin authorization on the server.
- Protect `DATABASE_URL` and `ADMIN_KEY`; never commit or expose secrets.
- Preserve Odia/English content integrity, district/category/source relationships, and existing Prisma schema behavior.
- Inspect existing implementation first, make focused changes, and run available checks before reporting completion.
- Do not perform destructive production database operations without explicit approval.
