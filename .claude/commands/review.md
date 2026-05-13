---
description: Architectural review of the recent diff.
---

Review the most recent uncommitted changes (run `git diff` and `git status` first).

For each modified file produce:
- **What changed** — 1 line.
- **Correctness** — does it match the conventions in root `CLAUDE.md`, `client/src/CLAUDE.md`, and `server/CLAUDE.md`?
- **Schema/contract drift** — if `shared/schema.ts` or `shared/routes.ts` changed, did the matching client + server sides update?
- **Storage discipline** — any direct `db.` calls outside `server/storage.ts`? Flag them.
- **Test IDs** — any new interactive element missing `data-testid`?
- **Risk** — Low / Med / High and why.

End with a **GO / NO-GO** and a short rationale. If NO-GO, list the smallest set of fixes.

Do not edit anything during the review.
