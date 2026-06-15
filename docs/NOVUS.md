# Connecting Novus by Pendo

First-Click Fight already ships a working first-party usage-learning loop in Cloudflare D1 (`usage_events`, aggregated by `buildUsageSummary` in `src/lib/usage.ts`). Novus by Pendo is the sponsor direction for this build: it learns from product usage and proposes UI changes from real signals. This runbook is the human-in-the-loop path to connect Novus on top of the existing loop. It requires a person to sign up and approve GitHub access, so it is intentionally a manual step rather than something the build automated.

## Why the first-party loop comes first

The D1 `usage_events` table is the source of truth a reviewer can open today at `GET /api/usage?fightId=...`. Novus does not replace that evidence; it consumes the same semantic events (`fcf_fight_created`, `fcf_first_action_clicked`, `fcf_result_inspected`, `fcf_rematch_shipped`) and adds its hosted analysis and change suggestions. Keeping the loop first-party means the product is fully operable and inspectable with or without the Novus account.

## Steps

1. **Create a Novus by Pendo account.** Sign up at the Novus by Pendo site with the account that owns the GitHub repository.
2. **Connect the repository.** In Novus, authorize the GitHub app and select `veithly/first-click-fight`. Novus reads the repository structure; the semantic event names and the isolated `src/lib/usage.ts` loop are what make it readable.
3. **Review the instrumentation pull request.** Novus opens a pull request that adds its SDK and event hooks. Read the diff. The hooks should sit alongside the existing `recordUsageEvent` calls, not replace the D1 writes.
4. **Set the app id.** Add `NEXT_PUBLIC_NOVUS_APP_ID` to the Cloudflare Worker variables (Dashboard or `wrangler secret`/`vars`), then redeploy with `npm run deploy`.
5. **Merge the pull request.** Once the diff is reviewed and the app id is set, merge it. The Novus client will start sending the same events it already sees in D1.
6. **Verify both paths.** Run one full fight on the live URL. Confirm `GET /api/usage?fightId=...` still returns the first-party tally, and that the same events appear in the Novus dashboard.

## Where the integration points live

- `src/lib/usage.ts` — `recordUsageEvent` and `buildUsageSummary`. This is the seam Novus instruments.
- `src/middleware.ts` — the `fcf_session` guest cookie used as the anonymous user key.
- `NEXT_PUBLIC_NOVUS_APP_ID` — the only new environment variable. It is optional; when unset, the first-party loop runs unchanged.

## Rollback

If the Novus client causes any issue, unset `NEXT_PUBLIC_NOVUS_APP_ID` and redeploy. The first-party D1 loop continues to record events and drive the rematch decision exactly as before.
