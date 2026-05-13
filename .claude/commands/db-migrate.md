---
description: Safely apply schema changes via Drizzle Kit.
---

Goal: apply the current `shared/schema.ts` to the database in `DATABASE_URL`.

Pre-flight (do all of these, in order; STOP if any fails):

1. Show `git diff -- shared/schema.ts` so I see what's about to be applied.
2. Confirm `DATABASE_URL` is set: `printenv DATABASE_URL | sed 's/:[^:@]*@/:***@/'` (mask the password).
3. Confirm we are NOT pointed at production unless I explicitly say "production". The Neon prod URL contains the project name — if unsure, ASK.
4. Run `npm run check` and stop on type errors.

Migration:

5. Run `npm run db:push`.
6. If Drizzle prompts about a destructive change (drop column, rename, etc.), STOP and surface the prompt to me. Do not auto-confirm.

Post-flight:

7. Run a sanity query against one affected table (`psql "$DATABASE_URL" -c "\d <table>"`).
8. Summarize what changed in 3 bullets.
