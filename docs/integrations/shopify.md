# Shopify integration

**Status:** not yet wired into this repo. Use this doc when you add it.

## Recommended approach: Shopify CLI + custom-app Admin API token

Two options exist:

| Option | When to pick | Trade-off |
|---|---|---|
| **Shopify CLI** (`@shopify/cli`) + a **custom app** Admin API token | You only need to talk to one or two known stores from your own backend. | Easiest to spin up; no OAuth dance; tied to a single store per token. |
| **Shopify Dev Dashboard "Public app"** with OAuth | You're shipping a multi-tenant app others install. | More setup, requires an OAuth callback URL, cleaner permissions UX, can list on the App Store. |

**Pick the CLI + custom-app token** for this project unless you decide later to ship a public app. Reasons: this codebase is a single-tenant internal tool (Odoo quoting), there's no installer flow, and a custom-app token is one header (`X-Shopify-Access-Token`) instead of an OAuth round-trip.

## Setup steps (when you're ready)

1. **Install the CLI locally** (no `package.json` change required — use `npx`):
   ```bash
   npx @shopify/cli@latest version
   ```

2. **Create a custom app in your Shopify admin:**
   Settings → Apps and sales channels → Develop apps → Create an app → grant the Admin API scopes you need (likely `read_products`, `read_customers`, plus any write scopes you actually use).

3. **Install the app on the store**, then copy the **Admin API access token** (starts with `shpat_`).

4. **Add to env (do not commit):**
   ```bash
   # .env
   SHOPIFY_STORE_DOMAIN=your-shop.myshopify.com
   SHOPIFY_ADMIN_API_TOKEN=shpat_...
   ```
   Mirror these in Vercel Project Settings → Environment Variables.

5. **Add the rows to `SECRETS_CHECKLIST.md`** (move them from "planned" to "active").

6. **Smoke test** with `/shopify-test` (see `.claude/commands/shopify-test.md`).

## Calling the Admin API from the server

Stick to fetch — no SDK needed for simple calls:

```ts
const r = await fetch(
  `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/products.json?limit=10`,
  { headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN! } }
);
```

Wrap it behind a method on `IStorage` (or a new `ShopifyClient` module) so routes stay thin.

## Webhooks
If you accept webhooks: verify the HMAC header (`X-Shopify-Hmac-Sha256`) against the **raw** request body. The Express setup in `server/index.ts` already captures `req.rawBody` for this purpose.
