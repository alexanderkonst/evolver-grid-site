# /products — Buyer-Facing Product Sheet (Day 121, July 11, 2026)

**One page. Seven offers. Shelf language. One CTA per card.**

Sasha's decisions (Day 121 chat): no cathedral footer · no Torus, no R&D/MAI · placement recommended but not wired now (page is a shareable URL; the link you send to Oyi, post-session clients, and the pitch deck) · copy rigorous and depth-sensitive.

## Rules the page obeys

- **Shelf language only** (Domain 103): category lines quoted from `alexanders_unique_business.md` evolution table. The thesis stays behind the door.
- **Funnel monogamy per card:** exactly one CTA each.
- **No ghosting:** early-access offers say "early access" plainly, full opacity. Nothing dimmed.
- **Sequencing rule:** the two revenue doors lead (Session, then FYTT; White-Label third).
- **External-copy bans:** no em-dashes, no "Not X. Y." constructions in visible copy.
- **Register:** same editorial register as `/` (parchment, Cormorant headlines, Source Serif body, gold eyebrows). Standalone page, no game shell.
- **Prices published only where already public:** $555 (/ignite), $37 activation. White-label pricing NOT published (in negotiation); CTA is a call.

## The seven cards (order locked)

| # | Offer | Price shown | CTA | Destination |
|---|---|---|---|---|
| 1 | Productize Yourself Session | $555 | Book the session | /ignite |
| 2 | Find Your Top Talent | Free to start · $37 activation | Start the reveal | /zone-of-genius |
| 3 | White-Label Node | none (call) | Book a 15-minute call | cal.com/aleksandrkonstantinov/15min |
| 4 | Collaborative Matchmaking | included in platform | Start with your free reveal | /zone-of-genius |
| 5 | Equilibrium | early access | Ask about early access | cal.com/aleksandrkonstantinov/15min |
| 6 | Founder Cockpit | early access | Ask about early access | cal.com/aleksandrkonstantinov/15min |
| 7 | Venture Studio | by invitation | Start a conversation | cal.com/aleksandrkonstantinov/15min |

Copy canon (EN, verbatim): lives in `src/locales/en/common.json` under `products.*` once shipped; the page is the single render of it. RU/ES full translations ship with v1.

## Placement (recommended, not wired)

Footer link + direct URL. Not in primary nav (nav keeps the funnel monogamous). v1 ships the route only.

## DoD

| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | `/products` public route renders standalone editorial page | route in App.tsx, no shell | ☐ |
| 2 | 7 cards, locked order, one CTA each, correct destinations | visual check | ☐ |
| 3 | Copy matches canon; no em-dashes in visible copy | read of rendered page | ☐ |
| 4 | EN/RU/ES strings complete, page fully translated | locale switch check | ☐ |
| 5 | SEO component with title/description/canonical | view-source | ☐ |
| 6 | Build + typecheck clean; `/` unchanged | npm build | ☐ |
| 7 | Verified in browser at desktop + mobile widths | screenshots | ☐ |
