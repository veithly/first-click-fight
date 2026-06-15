# Deployment — Cloudflare Workers + D1

First-Click Fight runs as a Next.js (App Router) app on **Cloudflare Workers**
via the `@opennextjs/cloudflare` adapter, backed by **Cloudflare D1**.

- Production URL: `https://first-click-fight.veithly.workers.dev`
- Worker name: `first-click-fight`
- Adapter: `@opennextjs/cloudflare` (`open-next.config.ts`, output in `.open-next/`)

## Prerequisites

- Node 20+ and npm
- `npx wrangler login` (account with Workers + D1 write)

## Bindings (wrangler.jsonc)

| Binding | Type | Resource | Purpose |
|---|---|---|---|
| `DB` | D1 database | `first-click-fight` | fights, clicks, cards, usage_events |
| `ASSETS` | Assets | `.open-next/assets` | static Next.js assets |

No KV, R2, or Queue bindings are required for the hero path.

## Environment

| Name | Scope | Where | Notes |
|---|---|---|---|
| `OWNER_KEY_SECRET` | server secret | `wrangler secret put OWNER_KEY_SECRET` (prod) / `.dev.vars` (local) | HMAC key that signs owner rematch links. 64-char random hex. |
| `NEXT_PUBLIC_BASE_URL` | public var | `wrangler.jsonc` `vars` + build env | absolute base for share links / QR / OG metadata |
| `NEXT_PUBLIC_NOVUS_APP_ID` | public var | `wrangler.jsonc` `vars` | optional; empty until a Novus workspace is connected |

The `OWNER_KEY_SECRET` value is never committed or printed. Generate one with
`openssl rand -hex 32` and store it in `.dev.vars` locally.

## First-time deploy

```bash
npm install

# 1. Apply the D1 schema locally and remotely
npx wrangler d1 migrations apply first-click-fight            # local
npx wrangler d1 migrations apply first-click-fight --remote   # production

# 2. Build the OpenNext bundle and deploy the Worker
NEXT_PUBLIC_BASE_URL="https://first-click-fight.veithly.workers.dev" npm run deploy

# 3. Set the server secret on the deployed Worker (reads value from stdin)
awk -F= '/^OWNER_KEY_SECRET=/{print substr($0, index($0,"=")+1)}' .dev.vars \
  | npx wrangler secret put OWNER_KEY_SECRET
```

Seeded product screens are upserted idempotently on first request
(`ensureScreensSeeded`, guarded by a `__seed_v<N>__` marker row), so no manual
seed step is needed. Bump `SEED_VERSION` in `src/lib/screens.ts` to force a
reseed of static screen content.

## Redeploy

```bash
NEXT_PUBLIC_BASE_URL="https://first-click-fight.veithly.workers.dev" npm run deploy
```

## Smoke test (production)

```bash
BASE=https://first-click-fight.veithly.workers.dev
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/"            # 200
curl -s -X POST "$BASE/api/fights" -H 'content-type: application/json' \
  -d '{"screenId":"saas-landing","intendedTargetId":"t_start"}'   # -> fightId
# POST /api/fights/<id>/clicks {"nx":44,"ny":65}              -> cardSlug + result
curl -s "$BASE/api/usage?fightId=<id>"                        # live usage-learning log
```

Visual QA (desktop + mobile) before recording/submission:

```bash
node hackathonhunter/scripts/visual_qa_scan.mjs . \
  --url https://first-click-fight.veithly.workers.dev --fail-on warn
```

## Inspect D1 directly

```bash
npx wrangler d1 execute first-click-fight --remote \
  --command "SELECT event_name, COUNT(*) FROM usage_events GROUP BY event_name;"
```
