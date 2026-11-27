# Module 2 · Phase 2: Our Rack (the platform as module cards)

Draft v1 · 2026-11-21 · read from the code of evolver-grid-site (main branch, 2026-11-21) by Hark. Nothing changed in the code, nothing sent. Part of [Module 2](./README.md).

## Summary for decision

- **Answer:** our platform already is a rack. The village has 11 places, each a slot; the code already has a module type with most card fields; the Market already takes other people's products; and white-label skins already put the game inside partners' shells.
- **Consequence:** level 0 for partners is small work: add 4 fields to the module type (owner, external link, referral id, integration level) and let the Academy show partner courses next to ours.
- **Decision from you:** which places open to partners first. My pick: Academy (courses) and Market (products, already works). Certainty: likely.

## 1. The rack: village places as slots

| Place | What it is now | Partner slot? |
|---|---|---|
| Reception | Entry, welcome | No (ours) |
| Home | Crystal, mission, save file | No (player's own) |
| Quest Board | Next quest on the Journey | Later: partner quests |
| My AI | Ask your AI | Later: partner agents (level 4) |
| Café | Meet people | Partner communities, events |
| Co-working | Find partners for the work | Partner collaboration tools |
| Mastermind | Circle | Partner circles |
| **Academy** | Two courses on one path, rooms behind | **Yes: partner courses** |
| Workshop | Craft your offer | Partner business tools |
| **Market** | «Your shop and others'» | **Yes: already lists published products** |
| Town Hall | Build ventures together | Partner ventures (co-op) |

Source: src/data/villagePlaces.ts (single source for places and routes).

## 2. Our modules as cards

| Module | Place / space | Status | Price | Entry |
|---|---|---|---|---|
| Zone of Genius Discovery | ME | Live | free | /zone-of-genius/entry |
| Quality of Life Activation | ME | Live | free | /quality-of-life-map/assessment |
| Multiple Intelligences | ME | Live | free | /intelligences |
| Genius Offer Snapshot | BUILD | Live | $111 founding | /genius-offer |
| Destiny: Unique Genius Business | BUILD | Live (Alpha 0.7) | 10% of new revenue capped at $3k | /game/me/genius-business |
| Genius-Layer Matching | BUILD | Live (Alpha 0.7) | pilot | call |
| Intelligence Boost for your AI | — | Live | $33 | /ai-upgrade |
| Мужской круг | MEET | Live | — | /mens-circle |
| Heartcraft (game) | — | Coming soon | — | — |
| Integral Mystery School | — | Coming soon | — | — |

Source: src/data/modules.ts. Further modules live in code but are not in this registry yet: My AI, Mission Discovery, Unique Business Builder (Workshop), Product Builder, Growth Paths, Genius Path, Asset Mapping, Equilibrium, Transition Quiz, Library. The registry is not yet the single source of all modules.

## 3. The card already exists in code

The module type (taxonomy v2.2, src/types/module.ts) holds: title, tagline, space, status, price, who it is for, outcomes, structure, story, entry route, dependencies, version stage, and a full landing page block. Against the connector card ([connector.md](./connector.md), section 2):

| Card field | In code? |
|---|---|
| Name, kind, for whom, result | Yes |
| Place in the game | Yes (space) |
| Entry point | Yes for internal routes; external URL missing |
| Price | Yes; who takes the money missing |
| Owner | Missing |
| Attribution (referral id) | Missing |
| Integration level | Missing |
| Source of description | Missing |

## 4. What already works for partners

- **Market:** the Product Builder publishes a player's product to the marketplace (table marketplace_products). Other founders' products can already sit in the game.
- **White-label skins:** /ns (Network School), /daouniverse, /planetir, /aurum, /techstars. Here our game already lives inside a partner's look. This is level 3 of the roadmap, running in the opposite direction.

## 5. Level 0 for partners: what it takes

1. Add four fields to the module type: owner, external URL, referral id rule, integration level.
2. Academy shows partner courses next to ours, marked with the owner; the link carries the player's referral id.
3. Move all modules into the one registry, so partners and our modules live in one list.

Size: a few days of work through the usual Claude issue. Any change to the Academy screen goes to you first (core flow rule).

## 6. Against

The Academy was cut to two courses on 2026-10-30 on purpose, to keep one clear path. Partner courses there could blur it. Option: a separate room «Courses from partners» behind the path.

## Next
- Phase 3: one external project described as module cards + an integration proposal. Needs your pick of the project.
