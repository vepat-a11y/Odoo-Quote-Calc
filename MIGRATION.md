# Migration Guide: Replit → Local + Vercel + Neon

This guide moves the Odoo Quote Calculator off Replit's pay-per-use Agent and onto a free/cheap stack: **GitHub** (source), **Neon** (Postgres), **Vercel** (hosting), and **Claude Code** (local development). Run every command on **your own machine**, not inside Replit.

---

## Why this stack
- **Vercel + Neon** has a free tier that fits this app (Express + Vite + Postgres). Both scale to zero.
- **Claude Artifacts cannot host this app.** Artifacts only run sandboxed single-file React/HTML; they have no Node server, no Postgres, no `express`, no Drizzle migrations, and no env-var support. This app needs all four.
- Running Claude Code locally lets you control token spend (Plan Mode, `/clear`, model selection) instead of paying per-message on the Replit Agent.

---

## Phase 1 — Get repo + database off Replit

### 1.1 Pull the repo locally
On Replit, open the Git pane and push to a new private GitHub repo (or use the shell):

```bash
# Inside Replit shell (one time)
git remote add origin git@github.com:<you>/odoo-quote-calculator.git
git push -u origin main
```

On your local machine:

```bash
git clone git@github.com:<you>/odoo-quote-calculator.git
cd odoo-quote-calculator
```

### 1.2 Dump the Replit Postgres database
Grab `DATABASE_URL` from Replit → Tools → Secrets, then on your local machine:

```bash
# Replace with your Replit Postgres URL
export REPLIT_DB_URL="postgres://..."

pg_dump --no-owner --no-acl --clean --if-exists \
  "$REPLIT_DB_URL" > backup.sql
```

> If `pg_dump` complains about a version mismatch, install matching client tools (`brew install postgresql@16` or `apt install postgresql-client-16`).

### 1.3 Create a Neon project and restore
1. Sign up at <https://neon.tech>, create a project (region near your users), grab the **pooled** connection string.
2. Restore the dump:

```bash
export NEON_URL="postgres://...neon.tech/neondb?sslmode=require"
psql "$NEON_URL" < backup.sql
```

3. Smoke-test:

```bash
psql "$NEON_URL" -c "SELECT count(*) FROM quotes;"
```

### 1.4 Rollback safety
Leave the Replit project running (read-only) for **30 days**. Don't delete it until you've verified production on Vercel works end-to-end.

---

## Phase 2 — Local development

### 2.1 Install dependencies

```bash
nvm use 20      # or any Node ≥ 20
npm install
```

### 2.2 Create `.env`

```bash
cat > .env <<'EOF'
DATABASE_URL=postgres://...neon.tech/neondb?sslmode=require
EOF
```

See `SECRETS_CHECKLIST.md` for the full list (includes placeholders for future Shopify/Recharge keys).

### 2.3 Run the app

```bash
npm run dev
# Open http://localhost:5000
```

### 2.4 Apply schema changes (when needed)

```bash
npm run db:push
```

---

## Phase 3 — Deploy to Vercel

### 3.1 Push to GitHub
Already done in Phase 1.1.

### 3.2 Import the repo into Vercel
1. <https://vercel.com/new> → Import the GitHub repo.
2. **Framework preset**: Other.
3. **Build command**: `npm run build`
4. **Output directory**: `dist`
5. **Install command**: `npm install`
6. **Start command (for the Node server function)**: `npm run start`

> The repo's `package.json` scripts (`build` → `tsx script/build.ts`, `start` → `node dist/index.cjs`) drive both steps. Do not edit them.

### 3.3 Add environment variables
In Vercel → Project → Settings → Environment Variables, add every row from `SECRETS_CHECKLIST.md` for **Production** (and **Preview** if you want PR deploys to work).

At minimum:
- `DATABASE_URL` = your Neon pooled URL
- `NODE_ENV` = `production`

### 3.4 First deploy
Trigger a deploy from the Vercel dashboard. Watch the build log; if it fails:
- Type errors → run `npm run check` locally.
- Missing env var → re-check Settings → Environment Variables.

### 3.5 Verify
- Hit the Vercel URL, create a quote, refresh, confirm it persists.
- `psql "$NEON_URL" -c "SELECT * FROM quotes ORDER BY id DESC LIMIT 3;"` to confirm writes land.

---

## Phase 4 — After migration

### 4.1 Install Claude Code
```bash
npm i -g @anthropic-ai/claude-code     # or: brew install anthropic/claude/claude
claude --version
claude                                  # first run triggers auth
```
Then read `CLAUDE_CODE_SETUP.md` for MCP servers and the first-session checklist.

### 4.2 Install the Shopify CLI (when you start integration work)
The Shopify CLI is run via `npx`, not added to `package.json`. Verify it works:
```bash
npx @shopify/cli@latest version
```
Then follow `docs/integrations/shopify.md` to create a custom app and get the Admin API token.

### 4.3 Curate context
Paste prior decisions/chats into the templates under `docs/context/`.

### 4.4 Wire Shopify / Recharge
Use the stubs in `docs/integrations/shopify.md` and `docs/integrations/recharge.md` once you're ready, and move their secret rows from "planned" to "active" in `SECRETS_CHECKLIST.md`.
