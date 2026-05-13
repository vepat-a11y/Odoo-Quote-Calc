# Curated Replit Agent threads

Same idea as `claude-ai-threads.md` but for the prior Replit Agent sessions on this project. Capture the *decisions* and *why*, not the chat noise.

## How to use this file
- One section per session/feature. Most recent first.
- Reference the file paths the change touched.
- Note anything the Replit Agent got wrong, so future Claude Code sessions don't repeat it.

## Format
```
## YYYY-MM-DD — <feature or fix>
**Files touched:** path/a.ts, path/b.tsx
**Outcome:** shipped / reverted / partial

- Decision: ...
- Why: ...
- What worked: ...
- What didn't: ...
```

## Example (delete once you add real entries)

## 2025-09-30 — Per-term discount UI
**Files touched:** `client/src/pages/Calculator.tsx`, `shared/schema.ts`
**Outcome:** shipped

- Decision: store discounts as JSONB on `quotes.term_discounts`, keyed by term length.
- Why: keeps the schema flat and avoids a join for a feature that's read-mostly.
- What worked: progressive disclosure in the sidebar — discount inputs only show after a term is checked.
- What didn't: an earlier attempt to store per-term overrides as separate rows; killed due to N+1 reads.

---

<!-- Add new entries above this line -->
