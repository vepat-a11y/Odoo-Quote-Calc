---
description: Smoke-test the Recharge integration (extend once wired).
---

Recharge is **not yet wired** into this repo. This command is a stub. See `docs/integrations/recharge.md` for the chosen approach (REST API key, header `X-Recharge-Access-Token`).

Run these checks (skip any that don't apply yet):

1. **Env present?**
   ```bash
   printenv RECHARGE_API_KEY | sed 's/.\{4\}$/****/'
   ```
   If missing, stop and point me at `SECRETS_CHECKLIST.md`.

2. **Auth works?** Hit a cheap read endpoint:
   ```bash
   curl -sS https://api.rechargeapps.com/customers?limit=1 \
     -H "X-Recharge-Access-Token: $RECHARGE_API_KEY" \
     -H "X-Recharge-Version: 2021-11" | jq '.customers | length'
   ```
   Expect `0` or `1`. Any 401 → wrong key. 403 → missing scopes.

3. **List one subscription**:
   ```bash
   curl -sS "https://api.rechargeapps.com/subscriptions?limit=1" \
     -H "X-Recharge-Access-Token: $RECHARGE_API_KEY" \
     -H "X-Recharge-Version: 2021-11" | jq '.subscriptions[0].id'
   ```

4. **Rate-limit headers** — print `X-Recharge-Limit` from the last response. If you're near cap (≥35/40), back off.

5. **Webhook signature check** — once webhooks are wired, add a step here that POSTs a known payload with a precomputed HMAC and asserts a 200.

Report PASS/FAIL for each step.
