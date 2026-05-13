# CLAUDE.md — Odoo Quote Calculator

This file is loaded automatically by Claude Code at the start of every session in this repo. Keep it tight.

## What this app is
Full-stack TypeScript app for generating Odoo software quotes (US/CA, Standard/Custom plans, multi-year terms). Express API + React frontend, single Postgres database.

## Stack
- **Frontend**: React 18 + Vite + TypeScript, Wouter routing, TanStack Query v5, Tailwind + shadcn/ui, Framer Motion. Brand colors: `#714B67` purple, `#017E84` teal.
- **Backend**: Express 5 (TypeScript via `tsx` in dev), thin REST routes in `server/routes.ts`.
- **DB**: Postgres via Drizzle ORM (`shared/schema.ts`). Migrations: `npm run db:push` (Drizzle Kit, no SQL files).
- **Build**: `tsx script/build.ts` (Vite for client, esbuild for server → `dist/index.cjs`).
- **Hosting**: Vercel (web) + Neon (Postgres). See `MIGRATION.md`.

## Repo layout
```
client/src/   React app           (see client/src/CLAUDE.md)
server/       Express API         (see server/CLAUDE.md)
shared/       Schema + API contract (Zod + Drizzle, used both sides)
script/       Build script
migrations/   Drizzle output (don't hand-edit)
docs/         Curated context + integration notes
.claude/      Slash commands + hooks
```

## Hard rules — DO NOT TOUCH
- `package.json` (scripts, deps). Ask the user; install via `npm i` only.
- `vite.config.ts` and `server/vite.ts` — Vite middleware setup is tuned.
- `drizzle.config.ts` — already correct.
- `tsconfig.json` — path aliases (`@/`, `@shared/`) are wired here.
- Anything under `client/src/components/ui/` unless explicitly asked (vendored shadcn).

## Conventions (carried over from `replit.md`)
- Data model lives in `shared/schema.ts` and is the single source of truth. Generate insert schemas with `createInsertSchema(...).omit({...})` and types via `z.infer` / `$inferSelect`.
- All DB access goes through `IStorage` in `server/storage.ts`. Routes are thin and only validate + delegate.
- Frontend data fetching: TanStack Query with array `queryKey`s (`['/api/quotes', id]`). Mutations use `apiRequest` from `@/lib/queryClient` and invalidate the matching `queryKey`.
- Forms: `useForm` + `Form` from `@/components/ui/form` + `zodResolver`.
- Add `data-testid` to every interactive element and meaningful display value (`{action}-{target}` or `{type}-{id}`).
- Tailwind custom CSS vars use `H S% L%` (no `hsl()` wrapper).
- Communication style with the user: simple, everyday language.

## Token-saving playbook (read this every session)
1. **Plan Mode first.** For any non-trivial change, run `/plan` (or Shift+Tab to Plan Mode). Approve the plan before editing.
2. **`/clear` between unrelated tasks.** Never let the context window drift across multiple features — costs compound quadratically.
3. **Reference `file:line` ranges**, not whole files. Example: "look at `server/routes.ts:12-27`" beats "read `server/routes.ts`".
4. **Default model: Sonnet.** Switch to Opus only for architecture, debugging tangled bugs, or migrations. Switch back after.
5. **Let hooks do the typing-check work.** `.claude/settings.json` runs `npm run check` after edits — don't waste a turn asking me to "verify it compiles".
6. **Use sub-agents for parallel reads** (e.g. "search how X is used") instead of opening files one by one.
7. **Don't paste large outputs back into chat.** Save to a file and reference it.

## Commands you can run
- `npm run dev` — local server on `:5000`
- `npm run check` — TypeScript typecheck (no emit)
- `npm run db:push` — apply schema to the DB pointed at by `DATABASE_URL`
- `npm run build && npm run start` — production smoke test

## Where to find things
- API contract: `shared/routes.ts`
- DB schema: `shared/schema.ts`
- DB connection: `server/db.ts`
- Storage layer: `server/storage.ts`
- Routes: `server/routes.ts`
- Main page: `client/src/pages/Calculator.tsx`
- Query client: `client/src/lib/queryClient.ts`

## When stuck
Read `docs/context/decisions.md` for prior architecture choices. Read `docs/context/claude-ai-threads.md` and `docs/context/replit-agent-threads.md` for curated history from previous sessions.
