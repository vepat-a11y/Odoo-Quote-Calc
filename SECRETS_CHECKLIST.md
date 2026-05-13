# Secrets Checklist

Every secret this codebase reads (or will read) and where it belongs. Audit source: `rg "process.env" -n` across `server/`, `shared/`, and `client/`.

| Secret | Used in | Local (`.env`) | Production (Vercel → Env Vars) | Status |
|---|---|---|---|---|
| `DATABASE_URL` | `server/db.ts`, `drizzle.config.ts` | required | required (use Neon pooled URL) | **active** |
| `NODE_ENV` | `server/index.ts` | optional (defaults to `development`) | set to `production` | **active** |
| `PORT` | `server/index.ts` | optional (defaults to `5000`) | Vercel sets automatically | **active** |
| `SHOPIFY_STORE_DOMAIN` | _not yet wired_ | placeholder | placeholder | **planned** |
| `SHOPIFY_ADMIN_API_TOKEN` | _not yet wired_ | placeholder | placeholder | **planned** |
| `SHOPIFY_API_KEY` | _not yet wired_ | placeholder | placeholder | **planned** |
| `SHOPIFY_API_SECRET` | _not yet wired_ | placeholder | placeholder | **planned** |
| `RECHARGE_API_KEY` | _not yet wired_ | placeholder | placeholder | **planned** |

> Shopify and Recharge are **not yet referenced in this repo**. They live in your broader workflow. Add the rows above when you wire those integrations (see `docs/integrations/shopify.md` and `docs/integrations/recharge.md`).

---

## Local `.env` template

```bash
# Required
DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Optional / planned (uncomment when wired)
# NODE_ENV=development
# PORT=5000
# SHOPIFY_STORE_DOMAIN=your-shop.myshopify.com
# SHOPIFY_ADMIN_API_TOKEN=shpat_...
# SHOPIFY_API_KEY=
# SHOPIFY_API_SECRET=
# RECHARGE_API_KEY=
```

`.env` is already in `.gitignore`. Never commit it.

---

## Vercel setup steps
1. Project → Settings → **Environment Variables**.
2. For each row above marked **active**, paste the value and select **Production** (and **Preview** if you want PR deploys).
3. Redeploy after adding/changing any var (Vercel does not hot-reload env vars).

## Rotating a secret
1. Generate the new value at the source (Neon, Shopify Admin, Recharge).
2. Update Vercel env var → trigger redeploy.
3. Update local `.env`.
4. Revoke the old value at the source.
