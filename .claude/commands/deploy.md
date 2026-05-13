---
description: Vercel deploy checklist.
---

Walk through this checklist. Do not skip steps. Stop and ask if anything is unclear.

**Pre-deploy**
1. `git status` — working tree clean?
2. `npm run check` — passes?
3. `npm run build` — completes locally? Confirm `dist/index.cjs` and `dist/public/` exist.
4. `git log --oneline -n 5` — show me the last 5 commits going out.
5. Diff env vars: list every `process.env.*` reference in `server/` and confirm each one is present in Vercel (read `SECRETS_CHECKLIST.md`).

**Deploy**
6. `git push origin main` — Vercel auto-deploys.
7. Watch the Vercel build log. Surface any error verbatim.

**Post-deploy verification**
8. Hit the production URL → load the calculator page.
9. Create a quote, refresh, confirm it persists.
10. `psql "$NEON_URL" -c "SELECT id, plan, users FROM quotes ORDER BY id DESC LIMIT 3;"` — confirm new row landed.
11. Tail Vercel function logs for 1 minute, confirm no 5xx.

**On failure**
- Roll back via Vercel → Deployments → previous deploy → "Promote to Production".
- Then triage locally before redeploying.
