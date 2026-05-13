---
description: Smoke-test the Shopify integration (extend once wired).
---

Shopify is **not yet wired** into this repo. This command is a stub for once you add it. See `docs/integrations/shopify.md` for the chosen approach (Shopify CLI + Admin API token).

Run these checks (skip any that don't apply yet):

1. **Env present?**
   ```bash
   printenv SHOPIFY_STORE_DOMAIN SHOPIFY_ADMIN_API_TOKEN | sed 's/shpat_.*/shpat_***/'
   ```
   If either is missing, stop and point me at `SECRETS_CHECKLIST.md`.

2. **Auth works?** Use the Admin API to fetch the shop:
   ```bash
   curl -sS "https://$SHOPIFY_STORE_DOMAIN/admin/api/2024-10/shop.json" \
     -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_API_TOKEN" | jq .shop.name
   ```
   Expect the shop name back. Any 401/403 → token is wrong or scopes are missing.

3. **Read one product** (smoke):
   ```bash
   curl -sS "https://$SHOPIFY_STORE_DOMAIN/admin/api/2024-10/products.json?limit=1" \
     -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_API_TOKEN" | jq '.products[0].id'
   ```

4. **CLI sanity** (if using `@shopify/cli`):
   ```bash
   npx shopify version
   npx shopify app info  # only inside an app project
   ```

5. **Webhook signature check** — once webhooks are wired, add a step here that POSTs a known payload with a precomputed HMAC and asserts a 200.

Report PASS/FAIL for each step.
