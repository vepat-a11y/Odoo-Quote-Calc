# Claude Code Setup

Run this once on your local machine after cloning the repo. The goal: a productive, **cheap** first session.

## 0. Install Claude Code
Follow the current install instructions at <https://docs.claude.com/claude-code>. On macOS:

```bash
# Homebrew (recommended if available)
brew install anthropic/claude/claude

# or, npm
npm i -g @anthropic-ai/claude-code
```

Verify:
```bash
claude --version
```

## 1. Authenticate
```bash
claude        # opens auth flow on first run
```

## 2. Start in this repo
```bash
cd path/to/odoo-quote-calculator
claude
```

Claude Code auto-loads:
- `CLAUDE.md` (root) — project memory
- `client/src/CLAUDE.md` and `server/CLAUDE.md` — folder-specific
- `.claude/settings.json` — model + hooks
- `.claude/commands/*.md` — slash commands (`/plan`, `/review`, `/db-migrate`, `/deploy`, `/shopify-test`, `/recharge-test`)

## 3. Recommended MCP servers

Install these so Claude Code can reach the tools you use most. Run from the repo root.

```bash
# Filesystem (already implicit, but useful for sandboxed dirs)
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem "$PWD"

# Postgres — read-only against your local/dev Neon URL
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres "$DATABASE_URL"

# GitHub
claude mcp add github -- npx -y @modelcontextprotocol/server-github
# then export GITHUB_PERSONAL_ACCESS_TOKEN=...

# Shopify dev (docs + admin API helpers)
claude mcp add shopify-dev -- npx -y @shopify/dev-mcp@latest

# Context7 (up-to-date library docs on demand)
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Playwright (browser automation for UI smoke tests)
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

Verify:
```bash
claude mcp list
```

> Server names and packages drift over time. If a command above 404s, search the current registry and update.

## 4. Recommended sub-agents (create later)
Once you've used Claude Code for a few days, create these custom agents (Settings → Sub-agents):
- **db-doctor** — Postgres + Drizzle expert; only allowed to read schema/data and propose migrations.
- **shopify-helper** — has the `shopify-dev` MCP server; scoped to `docs/integrations/shopify.md` patterns.
- **frontend-tester** — has Playwright MCP; runs UI smoke tests and reports.
- **reviewer** — read-only; runs `/review` style critiques.

Sub-agents keep specialized prompts out of your main context window → cheaper.

## 5. First-session checklist (do this in order, in one Claude Code run)

1. `/plan` — ask: "Confirm you can read the repo. Summarize the stack from `CLAUDE.md` in 3 bullets." (no edits expected; this verifies memory loaded).
2. Run `npm install` and `npm run check` from a normal terminal (not via Claude — saves tokens).
3. Back in Claude: `/plan` a tiny no-op change you want to make. Approve only if it matches what you'd do.
4. After the first real edit, watch the `PostToolUse` hook output — confirm `npm run check` is running automatically. If it's noisy, tighten the matcher in `.claude/settings.json`.
5. `/clear` between unrelated tasks. Always.

## 6. Token-saving rules of thumb
- **Default to Sonnet.** Switch to Opus only when stuck on architecture or a gnarly bug. Switch back.
- **Plan Mode first** for anything beyond a one-line change.
- **`/clear`** between unrelated tasks.
- **Reference `file:line`** ranges; don't ask Claude to "read the whole file" unless it's small.
- **Save large outputs to a file** instead of pasting them into chat.
- **Let MCP do bulk reads** (postgres, filesystem) instead of asking Claude to enumerate.

## 7. Where to put things going forward
- New decisions → `docs/context/decisions.md`
- Curated chat history → `docs/context/claude-ai-threads.md`, `docs/context/replit-agent-threads.md`
- Integration setup notes → `docs/integrations/<service>.md`
- New slash commands → `.claude/commands/<name>.md`
- New secrets → add a row in `SECRETS_CHECKLIST.md` first, then wire the code.
