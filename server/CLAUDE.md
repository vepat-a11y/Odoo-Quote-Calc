# CLAUDE.md — `server/`

Backend conventions. Read root `CLAUDE.md` first.

## Stack quick-ref
- Express 5 + TypeScript via `tsx` (dev) / esbuild (prod build → `dist/index.cjs`).
- DB: Drizzle ORM over `pg` Pool. Connection in `db.ts`. Schema in `@shared/schema`.
- API contract: declared in `@shared/routes` (`api.<resource>.<op>`), consumed by both client and server.
- Validation: Zod schemas (`insertXxxSchema`) from `@shared/schema`. Always `.parse()` request bodies.

## File map
```
db.ts        Pool + Drizzle client (throws if DATABASE_URL missing)
storage.ts   IStorage interface + DatabaseStorage impl — ALL DB access
routes.ts    Express handlers — thin: parse → storage → respond
index.ts     Bootstrap, JSON body capture, request log, error handler
vite.ts      Dev-mode Vite middleware (DO NOT EDIT)
static.ts    Production static asset serving
```

## Rules
1. **Never call `db` directly from a route.** Add a method to `IStorage`, implement it in `DatabaseStorage`, then call it.
2. **Routes stay thin**: parse body with Zod, call storage, return JSON. Errors handled by the global handler in `index.ts` (or a try/catch that returns `400` for `ZodError`, `500` otherwise — see existing `POST /api/quotes`).
3. **Path comes from `@shared/routes`** (`api.quotes.create.path`), never hardcoded.
4. **Logging**: use the `log()` helper from `index.ts` — request log middleware already captures API responses.
5. **Status codes**: `201` on create, `200` on read, `400` on validation, `404` on missing, `500` on server error.

## Adding a new endpoint (canonical flow)
1. Add the table / extend schema in `shared/schema.ts`. Create `insertXxxSchema = createInsertSchema(xxx).omit({ id: true })`.
2. Add the contract in `shared/routes.ts` under `api.xxx`.
3. Add `getXxx` / `createXxx` to `IStorage` and `DatabaseStorage`.
4. Add the handler in `server/routes.ts` using `api.xxx.<op>.path` and `.input.parse(req.body)`.
5. Run `npm run db:push` if the schema changed. Run `npm run check`.

## Env vars used here
- `DATABASE_URL` — required.
- `NODE_ENV` — `production` switches to `static.ts`, otherwise mounts Vite dev middleware.
- `PORT` — defaults `5000`.
