# Architecture decisions

Lightweight ADRs. One bullet list per decision. Newest first.

## Format
```
## YYYY-MM-DD — <decision title>
- **Status:** accepted / superseded by <date> / reverted
- **Context:** what forced the decision
- **Decision:** what we picked
- **Alternatives:** what we rejected and why
- **Consequences:** what this locks us into
```

## 2026-05-07 — Host on Vercel + Neon, develop in Claude Code
- **Status:** accepted
- **Context:** Replit Agent is pay-per-message and the app fits a free tier elsewhere.
- **Decision:** GitHub for source, Neon for Postgres, Vercel for runtime, Claude Code locally.
- **Alternatives:** Claude Artifacts (rejected — no Node server, no Postgres, no env vars); Render/Fly (heavier than needed).
- **Consequences:** Build/start scripts in `package.json` are now load-bearing for Vercel; don't break them.

## 2025-XX-XX — Single comparison table per quote
- **Status:** accepted
- **Context:** users were comparing 1–4 term lengths side by side.
- **Decision:** one table, label column + one column per selected term, with hero "Total Contract" row.
- **Alternatives:** one table per term (too much vertical scroll); cards (lost row alignment).
- **Consequences:** all per-term math must produce the same row set or the table breaks visually.

<!-- Add new entries above this line -->
