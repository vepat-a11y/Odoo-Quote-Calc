---
description: Force read-only planning before any code change.
---

You are in **Plan Mode**. Do NOT edit any files. Do NOT run write commands.

Task: $ARGUMENTS

Produce a plan in this format:

1. **Goal** — one sentence.
2. **Files to read** — list each as `path:line-range` with why.
3. **Files to change** — each with the minimal diff sketch (don't write the diff yet).
4. **New files** — only if strictly necessary; justify each.
5. **Schema/DB impact** — does this touch `shared/schema.ts`? If yes, list the migration.
6. **Tests / verification** — how I'll prove it works (`npm run check`, manual UI step, curl, etc.).
7. **Risks** — what could break, what's reversible, what's not.
8. **Token estimate** — rough size: S (one file), M (a few files), L (cross-cutting).

Stop after the plan. Wait for me to approve before exiting Plan Mode.
