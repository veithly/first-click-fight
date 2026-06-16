# Connecting Novus by Pendo

First-Click Fight ships a working first-party usage-learning loop in Cloudflare D1 (`usage_events`, aggregated by `buildUsageSummary` in `src/lib/usage.ts`). Novus by Pendo is the sponsor direction for this build: it learns from product usage and proposes UI changes from real signals. The codebase already carries the Novus instrumentation, gated off by default. A person only needs to create the account, connect the repo, and set one variable. That account step needs a human, so it stays a manual runbook.

## What the build already ships

- `src/components/NovusScript.tsx` loads the Pendo Web SDK (the engine Novus by Pendo uses) and is mounted in `src/app/layout.tsx`. It activates only when `NEXT_PUBLIC_NOVUS_APP_ID` is set.
- `src/lib/novus.ts` exposes `trackNovus`, which mirrors the same semantic events into `pendo.track`.
- Four client seams call it next to the existing D1 writes: `fcf_fight_created` (`BuilderMarkScreen`), `fcf_first_action_clicked` (`JudgeFight`), `fcf_result_inspected` and `fcf_rematch_returned` (`UsageBeacon`), and `fcf_rematch_shipped` (`OwnerShip`).
- The Pendo visitor id is the first-party guest cookie `fcf_session` (set in `src/middleware.ts`), and the account id is `first-click-fight`. Novus and the D1 loop key usage to the same anonymous visitor.

When `NEXT_PUBLIC_NOVUS_APP_ID` is unset, none of this runs and the first-party D1 loop is the sole usage backbone, so the product stays fully operable and inspectable with or without a Novus account.

## Why the first-party loop comes first

The D1 `usage_events` table is the source of truth a reviewer can open today at `GET /api/usage?fightId=...`. Novus does not replace that evidence; it consumes the same semantic events and adds its hosted analysis and change suggestions on top.

## Steps

1. **Create a Novus by Pendo account.** Sign up with the account that owns the GitHub repository.
2. **Connect the repository.** Authorize the Novus GitHub app and select `veithly/first-click-fight`. Novus reads the repository. The named semantic events and the isolated `src/lib/usage.ts` and `src/lib/novus.ts` seams are what make it readable.
3. **Get the app id.** Copy the Pendo/Novus public app id (API key) from the Novus install snippet or dashboard.
4. **Review the instrumentation pull request.** If Novus opens a pull request, read the diff. The repo already installs the SDK and mirrors events, so the PR should be minimal or complementary. Keep the D1 writes intact.
5. **Set the variable.** Add `NEXT_PUBLIC_NOVUS_APP_ID` to the Cloudflare Worker variables (Dashboard, or `wrangler` vars), then redeploy with `npm run deploy`.
6. **Verify both paths.** Run one full fight on the live URL. Confirm `GET /api/usage?fightId=...` still returns the first-party tally, and confirm the same events land in the Novus dashboard.

## Where the integration points live

- `src/lib/usage.ts` — `recordUsageEvent` and `buildUsageSummary` (the server-side D1 loop).
- `src/lib/novus.ts` — `trackNovus` (the client-side Pendo mirror).
- `src/components/NovusScript.tsx` — the Pendo Web SDK loader, mounted in `src/app/layout.tsx`.
- `src/middleware.ts` — the `fcf_session` guest cookie used as the anonymous visitor key.
- `NEXT_PUBLIC_NOVUS_APP_ID` — the only variable to set. It is optional; when unset, the first-party loop runs unchanged.

## Rollback

If the Novus client causes any issue, unset `NEXT_PUBLIC_NOVUS_APP_ID` and redeploy. The first-party D1 loop continues to record events and drive the rematch decision exactly as before.
