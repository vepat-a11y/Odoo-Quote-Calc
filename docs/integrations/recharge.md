# Recharge integration

**Status:** not yet wired into this repo. Use this doc when you add it.

## Recommended approach: REST API key

Recharge has both a **REST API** (mature, well-documented, simple bearer-token auth) and a newer **GraphQL** surface. For a server-to-server integration like this one, **use REST**: simpler auth, broader docs, and the resources we'd touch (subscriptions, customers, charges) are all there.

## Setup steps (when you're ready)

1. **Generate an API token** in Recharge: Apps → API tokens → Create.
   - Pick the minimum scopes you need — start read-only and expand.
   - Token format is opaque; treat it like a password.

2. **Add to env (do not commit):**
   ```bash
   # .env
   RECHARGE_API_KEY=...
   ```
   Mirror in Vercel Project Settings → Environment Variables.

3. **Add the row to `SECRETS_CHECKLIST.md`** (move from "planned" to "active").

4. **Pin an API version.** Always send `X-Recharge-Version: 2021-11` (or newer) so behavior is stable across Recharge releases.

5. **Smoke test** with `/recharge-test` (see `.claude/commands/recharge-test.md`).

## Calling the REST API from the server

```ts
const r = await fetch("https://api.rechargeapps.com/subscriptions?limit=50", {
  headers: {
    "X-Recharge-Access-Token": process.env.RECHARGE_API_KEY!,
    "X-Recharge-Version": "2021-11",
    "Content-Type": "application/json",
  },
});
```

Wrap behind a `RechargeClient` module and expose only the methods you need via `IStorage` or a dedicated service module.

## Rate limits
Recharge uses a leaky-bucket. Watch the `X-Recharge-Limit` response header and back off well before the cap. For batch jobs, sleep ~600ms between calls or read the bucket header and adapt.

## Webhooks
Verify the `X-Recharge-Hmac-Sha256` header against the **raw** request body using your shared secret. Use `req.rawBody` (already captured in `server/index.ts`) — not the parsed JSON.
