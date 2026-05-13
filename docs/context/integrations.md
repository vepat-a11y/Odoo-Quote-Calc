# Integrations log

Running notes about every third-party system this project (or your broader workflow) touches. Distinct from `docs/integrations/*.md`, which are how-to stubs — this file is the running journal of what's connected, when, and how it broke last.

## Format
```
## <Service name>
- **Purpose:** ...
- **Auth method:** ...
- **Where credentials live:** local `.env` key, Vercel env var name
- **Owner contact / dashboard URL:** ...
- **Last verified working:** YYYY-MM-DD
- **Known issues:** ...
```

## Postgres (Neon)
- **Purpose:** primary data store for quotes.
- **Auth method:** connection string.
- **Where credentials live:** `.env` `DATABASE_URL`; Vercel `DATABASE_URL` (Production + Preview).
- **Dashboard:** https://console.neon.tech
- **Last verified working:** _fill in after first deploy_
- **Known issues:** use the **pooled** URL on Vercel; the direct URL hits connection limits under serverless cold starts.

## Shopify
- _Not yet wired._ See `docs/integrations/shopify.md` for the chosen approach.

## Recharge
- _Not yet wired._ See `docs/integrations/recharge.md` for the chosen approach.

<!-- Add new entries above this line -->
