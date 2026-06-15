# Submission: Mind the Product

> Paste-ready answers for the Devpost form. Remove this note before pasting.

## Platform
Devpost (mindtheproduct.devpost.com)

## Project name
First-Click Fight

## Tagline (140 chars max)
Score a visitor's first click and ship a clearer route in 30 seconds.

## Short description (280 chars max)
A PM-builder uses First-Click Fight to mark the CTA they expect. A fresh visitor's first click is saved and scored into a Clarity KO Card at /card/[cardSlug], and GET /api/usage shows the recorded events that decide the 30-second rematch route.

## What it does
A builder picks a seeded product screen and marks the call to action they expect a stranger to use first. They share a fight link. A fresh visitor opens it with no login and clicks once where they would start. That first official click is saved and scored: the Clarity KO Card reads CTA_DEFENDED when the visitor hit the marked target, or CTA_KNOCKED_OUT when a different element won, with the exact click point on the screen. The owner can then ship a rematch route in one action, and the next visitor sees the promoted target. Every card reopens at a stable link and replays on a phone by QR.

## How we built it
The recorded first click is the mechanism. A guest session cookie lets any visitor play with no account, while the owner action is gated by a signed key carried in the share link. The first click per session is hit-tested against the marked target, written to a relational row, and turned into a saved card. A usage-learning loop records four event types (fight created, first click, result inspected, rematch shipped) and rolls official clicks into a per-target tally and a learning line. That tally, not a guess, decides whether the rematch defends the intended CTA or promotes the challenger. The core path runs through src/app/api/fights/[id]/clicks/route.ts, src/lib/scoring.ts, and src/lib/usage.ts, and a reviewer can check GET /api/usage?fightId=... and the saved card link.

## Why it fits Mind the Product and Novus by Pendo
- Learn from real product usage -> a fresh visitor's first click is saved and scored, not surveyed -> open /card/[cardSlug]
- Let usage drive the next change -> the per-target tally promotes a clearer route in the rematch -> GET /api/usage?fightId=...
- Make the decision inspectable -> four recorded event types feed the learning line -> src/lib/usage.ts and the live usage feed

## Challenges we ran into
The first real fight was duplicate scoring: a visitor who clicked twice could create two cards and skew the tally. The fix made the first official click idempotent per session in recordFirstClick, so a second click preserves the original result and returns the existing card link. Running the cross-browser interaction check against the live route is what surfaced the abort behavior that drove that fix.

## Accomplishments we're proud of
The full loop is live and inspectable: a fresh visitor scores a first click, the KO card reopens in a second browser identically, and GET /api/usage returns the recorded events with a learning line. A real run shows two events from two distinct sessions deciding one rematch.

## What we learned
Building it changed where the trust comes from. The convincing part is not the verdict label; it is that the click, the card, and the tally are reopenable rows a stranger can re-run, so the rematch decision is auditable rather than asserted.

## What's next for First-Click Fight
Let builders upload their own screen instead of choosing a seeded one, then connect Novus by Pendo so its usage model can read the same recorded events and propose the rematch automatically.

## Build stack tags
Next.js App Router, Cloudflare Workers, D1, Mantine, motion, Playwright

## Track / Category
Product usage and first-run clarity

## Sponsor prize tracks
Novus by Pendo: a first-party usage-learning loop in D1 records the signals and drives the rematch decision; the repository is structured so Novus can be connected to read the same events. See docs/NOVUS.md.

## Demo URL
https://first-click-fight.veithly.workers.dev

## Repo URL
https://github.com/veithly/first-click-fight

## Documentation URL
https://github.com/veithly/first-click-fight/blob/main/docs/ARCHITECTURE.md

## Video URL
The hosted demo link is added here once the final cut is uploaded. The rendered file is pitch/recording/pitch-demo-combined-final.mp4.

## Team members
veithly

## Anything else
A reviewer with no account can run the whole loop: open the live link, mark a CTA, click as a fresh visitor in a private window, then reopen the saved card and read GET /api/usage. Owner-only actions are gated by a signed key, so the rematch cannot be shipped by a stranger.
