# Architecture: First-Click Fight

First-Click Fight turns a fresh visitor's first click on a product screen into a saved, scored, reopenable result, and lets the screen owner ship a rematch route that promotes whatever the visitor actually clicked. This document covers the data model, request flow, scoring, identity, and the usage-learning loop.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js App Router (Server Components, Route Handlers, `middleware.ts`) |
| Runtime | Cloudflare Workers via the `@opennextjs/cloudflare` adapter |
| Storage | Cloudflare D1 (SQLite) bound as `DB` |
| UI | Mantine core, a hand-set editorial theme, `motion` for the click-to-card beat |
| IDs | `nanoid` for fight, card, and click identifiers |
| Signing | Web Crypto `HMAC-SHA256` for the owner key carried in share links |

## Data model

Four tables, applied from `migrations/`:

```sql
screens(id, slug, name, eyebrow, headline, subcopy, targets_json, seed_version)
fights(id, screen_id, intended_target_id, owner_session_id, status,
       rematch_choice, challenger_target_id, created_at)
clicks(id, fight_id, session_id, is_official, matched_target_id, nx, ny, created_at)
cards(slug, fight_id, result, created_at)
usage_events(id, fight_id, session_id, kind, meta_json, created_at)
```

- `screens` holds the seeded product mocks. `targets_json` is the list of clickable elements with normalized geometry; `seed_version` lets a deploy reseed when copy changes.
- `fights` is one builder intention. `intended_target_id` is the CTA the builder marked. `status` moves from `open` to `scored` to `rematch_shipped`.
- `clicks` records every click with normalized coordinates (`nx`, `ny`) and the `matched_target_id` the click resolved to. `is_official = 1` marks the first scored click for a visitor session.
- `cards` is the slug-addressable result. `result` is `CTA_DEFENDED` or `CTA_KNOCKED_OUT`.
- `usage_events` is the learning loop: `fcf_fight_created`, `fcf_first_action_clicked`, `fcf_result_inspected`, `fcf_rematch_shipped`.

## Request flow

```
Builder /app/new
  -> POST /api/fights                     create fight + fcf_fight_created
  -> /fight/[fightId]                      share surface (link + QR)

Visitor /fight/[fightId]
  -> POST /api/fights/[id]/clicks          first official click + scoring + card
  -> fcf_first_action_clicked
  -> /card/[cardSlug]                       Clarity KO Card

Visitor /card/[cardSlug]
  -> GET (getCardView join)                 reopen result + fcf_result_inspected

Owner /card/[cardSlug]/owner
  -> POST /api/fights/[id]/ship-rematch     status=rematch_shipped + fcf_rematch_shipped
  -> /rematch/[fightId]                      route with promoted target
```

## Scoring

`src/lib/scoring.ts` resolves a click to a target by hit-testing the normalized click point (`nx`, `ny`) against each target rectangle in `targets_json`. The first official click per visitor session is the only one scored:

1. Resolve `matched_target_id` from the click point.
2. Compare it to the fight's `intended_target_id`.
3. Write the result: `CTA_DEFENDED` when they match, `CTA_KNOCKED_OUT` otherwise.
4. Create the `cards` row keyed by a fresh slug.

`recordFirstClick` in `src/lib/fights.ts` is idempotent per session: a duplicate click from the same `fcf_session` preserves the first official click and returns the existing card link instead of double-scoring.

## Identity and sessions

- `src/middleware.ts` sets a `fcf_session` guest cookie on first visit. No account is required for any visitor path.
- The owner path is gated by a signed owner key. When a fight is created, the builder receives a link carrying an `HMAC-SHA256` signature of the fight id. `isOwnerSession` and the owner key verification let only the builder ship a rematch, even though no one logs in.

## Usage-learning loop

`src/lib/usage.ts` records every meaningful action into `usage_events` and exposes `buildUsageSummary`, which:

- counts official clicks per target,
- picks the winning target (the one strangers actually clicked most),
- emits a single human-readable learning line, and
- recommends whether the rematch should defend the intended CTA or promote the challenger.

`GET /api/usage?fightId=...` returns the raw events, the per-target tally, and the learning line. This is the inspectable proof that recorded usage, not a guess, drives the rematch decision. The repository keeps event names semantic and the loop isolated so a usage-analytics product such as Novus by Pendo can be connected to augment or replace the first-party tally; see [`NOVUS.md`](./NOVUS.md).

## Boundaries

- Product screens are seeded in `migrations/`; custom screen upload is not built yet.
- History is scoped to a single fight; there is no multi-fight team dashboard.
- The owner key is a lightweight signed token, not a full auth system; it is sufficient for the single-owner rematch action.

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the Cloudflare Workers plus D1 deploy, bindings, environment variables, migrations, and the production smoke test.
