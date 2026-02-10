

# Taxonomy Audit and Module Infrastructure Update

## Overview

This plan covers three connected tasks:
1. Fix `docs/02-strategy/module_taxonomy.md` to match code reality
2. Update `src/types/module.ts` and `src/data/modules.ts` to align with the Spaces architecture
3. Sync the older `docs/00-intro kit/module_taxonomy.md` with the canonical version

---

## Part 1: Taxonomy Audit Findings

After auditing every route in `App.tsx`, every module folder in `src/modules/`, and the SpacesRail navigation, here is the comparison between `module_taxonomy.md` v2.1 and what actually exists in code:

### ME Space (/game/grow/*)

| Module | Taxonomy | Code Reality | Verdict |
|--------|----------|-------------|---------|
| Zone of Genius | v0.9 | Full: landing, entry, 5-step assessment, appleseed, excalibur, overview, perspectives | v0.9 correct |
| Quality of Life | v0.9 | Full: assessment, results, priorities, growth-recipe | v0.9 correct |
| Personality Tests | v0.5 | /resources/personality-tests + /game/learn/tests | v0.5 correct |
| Mission Discovery | v0.7 | Dedicated module folder + landing + wizard | v0.7 correct |
| Resource Mapping | v0.7 | /game/grow/assets + dedicated module folder (asset-mapping) | v0.7 correct |
| Art | Matrix says v0.5, detail says v0.1 (conflict!) | /art, /art/:category, /game/grow/art | User says: move OUTSIDE spaces |

### LEARN Space (/game/learn/*)

| Module | Taxonomy | Code Reality | Verdict |
|--------|----------|-------------|---------|
| Daily Loop | v0.7 | /game/next-move + /game/next-move-v2 + /game/learn/today | v0.7 correct |
| Library | v0.7 | /library + /game/learn/library, dedicated module folder | v0.7 correct |
| Growth Paths | v0.5 | /game/learn/paths + /game/learn/path/:pathId, dedicated module folder, 5 paths with upgrades | Upgrade to v0.7 -- more developed than PoC |
| Skill Trees | v0.3 | No dedicated route visible | v0.3 correct |

### MEET Space (/game/meet/*)

| Module | Taxonomy | Code Reality | Verdict |
|--------|----------|-------------|---------|
| Events | v0.9 | /game/meet + create + my-rsvps + /events/:id | v0.9 correct |
| Men's Circle | v1.0 | /mens-circle + /mens-circle/thank-you (Stripe payment integrated) | v1.0 correct |

### COLLABORATE Space (/game/collaborate/*)

| Module | Taxonomy | Code Reality | Verdict |
|--------|----------|-------------|---------|
| Matchmaking | v0.7 | /game/collaborate/matches | v0.7 correct |
| Connections | v0.3 | /game/collaborate/connections + /game/collaborate/people + /game/collaborate/mission | Upgrade to v0.5 -- has more sub-routes than Prototype |

### BUILD Space (/game/build/*)

| Module | Taxonomy | Code Reality | Verdict |
|--------|----------|-------------|---------|
| Genius Business | v0.7 | /game/grow/genius-business + 4 sub-pages (audience, promise, channels, vision) | v0.7 correct. Note: routed under /game/grow, not /game/build |
| Product Builder | v0.3 | /game/build/product-builder with 7 steps (ICP, pain, promise, landing, blueprint, CTA, published) | Upgrade to v0.7 -- feature-complete flow, not just a prototype |
| Business Incubator | v0.1 | /game/build (BuildSpace page exists) | Upgrade to v0.3 -- basic page exists |

### BUY and SELL Space (/game/marketplace/*)

| Module | Taxonomy | Code Reality | Verdict |
|--------|----------|-------------|---------|
| Marketplace | v0.3 | /game/marketplace + /game/marketplace/browse + /p/:slug + /mp/:slug + /my-page | Upgrade to v0.5 -- browse, creator pages, product pages all working |

### Special Modules

| Module | Taxonomy | Code Reality | Verdict |
|--------|----------|-------------|---------|
| Onboarding | v0.7 | /start, dedicated module folder | v0.7 correct |
| Tour | v0.5 | Tour steps within onboarding flow | v0.5 correct |

### Standalone Modules (outside spaces -- per user directive)

| Module | Currently in taxonomy? | Code Reality | Action |
|--------|----------------------|-------------|--------|
| Art | Listed in ME Space (wrong) | /art, /art/:category, /game/grow/art | Move to Standalone, set v0.5 |
| Equilibrium | Not listed | Not in code | Add as v0.1 Concept |
| Clock | Not listed | Not in code (created today) | Add as v0.1 Concept |
| Transcriber | Not listed | /transcriber (working YouTube transcriber) | Add as v0.5 PoC |

### Legacy Landing Page Modules (kept in src/data/modules.ts, NOT used)

These 10 modules in `src/data/modules.ts` were for the old Index.tsx landing page (now replaced by LandingPage.tsx). They remain in code but are not actively used:
- DESTINY: YOUR UNIQUE GENIUS BUSINESS
- GENIUS-LAYER MATCHING
- GENIUS OFFER SNAPSHOT
- INTELLIGENCE BOOST FOR YOUR AI MODEL
- Men's Circle (duplicate -- real one is in MEET space)
- QUALITY OF LIFE ACTIVATION (duplicate)
- ZONE OF GENIUS DISCOVERY (duplicate)
- MULTIPLE INTELLIGENCES SELF-ASSESSMENT
- Heartcraft (Coming Soon)
- Integral Mystery School (Coming Soon)

These will NOT be deleted per user instruction but are not part of the taxonomy.

### Additional Discrepancies Found

1. URL path naming: SpacesRail label says "ME" but routes use `/game/grow` (legacy from "GROW" rename)
2. Genius Business routes are under `/game/grow/genius-business` but the taxonomy places it in BUILD Space
3. Matchmaking submodules in taxonomy list 5 types (Genius, Complementary, Resource, Mission, Match Refresh) -- the code has `/game/collaborate/mission` and `/game/collaborate/people` as separate routes supporting this
4. Multiple Intelligences (/intelligences) is a standalone assessment page -- in the taxonomy it appears as a submodule upgrade within Growth Paths > Genius Path but also as a standalone route

---

## Part 2: Changes to module_taxonomy.md

### File: `docs/02-strategy/module_taxonomy.md`

Bump version from 2.1 to 2.2. Changes:

1. **Fix Art module**: Remove from ME Space, add to new "Standalone Modules" section at v0.5
2. **Add Standalone section**: Art (v0.5), Equilibrium (v0.1), Clock (v0.1), Transcriber (v0.5)
3. **Fix version inconsistency**: Art was 0.5 in matrix but 0.1 in detail -- resolve to 0.5 based on code (gallery, portfolios, subpages all implemented)
4. **Update Growth Paths**: v0.5 to v0.7 (has dedicated module folder, path sections, 5 vectors)
5. **Update Product Builder**: v0.3 to v0.7 (has 7 working steps, not just a prototype)
6. **Update Connections**: v0.3 to v0.5 (has people directory, mission selection sub-routes)
7. **Update Marketplace**: v0.3 to v0.5 (has browse, creator pages, product pages)
8. **Update Business Incubator**: v0.1 to v0.3 (has a basic BuildSpace page)
9. **Update ME Space module count**: 6 to 5 (Art moved out)
10. **Update version statistics**: Recalculate percentages based on updated versions
11. **Add route annotations**: Document actual URL paths next to each module for developer reference
12. **Note route naming discrepancy**: ME Space uses `/game/grow` paths (legacy from GROW rename)
13. **Note Genius Business placement**: Routed under ME (/game/grow) but logically belongs to BUILD

### File: `docs/00-intro kit/module_taxonomy.md`

Add deprecation header pointing to `docs/02-strategy/module_taxonomy.md` v2.2 as the canonical source. Keep the file for historical context but clearly mark it as outdated.

---

## Part 3: Code Type and Data Updates

### File: `src/types/module.ts`

1. Expand `ModuleCategory` to include Space identifiers alongside legacy categories:

```
"AI" | "Growth" | "Business" | "Ceremonies" | "Tools" | "Apps" | "Other"
| "ME" | "LEARN" | "MEET" | "COLLABORATE" | "BUILD" | "BUY_SELL" | "Special" | "Standalone"
```

2. Add Space-aware fields to `Module` interface:
   - `space?: string` -- which space this module belongs to
   - `versionNumber?: string` -- semantic version (0.1-1.0+)
   - `versionStage?: string` -- human-readable stage (Concept/Prototype/PoC/Alpha/MVP/Commercial)
   - `startRoute?: string` -- the entry route for the module
   - `dependencies?: string[]` -- module slugs this depends on

3. Keep all existing fields for backward compatibility

### File: `src/data/modules.ts`

1. Keep all 10 existing legacy module entries unchanged (they compile and are technically still referenced by ModuleDetail.tsx via /m/:slug route)
2. Add `space` field to modules that map to spaces (ZoG, QoL, Men's Circle, etc.)
3. No entries removed

---

## Execution Sequence

1. Update `docs/02-strategy/module_taxonomy.md` -- the main deliverable
2. Add deprecation note to `docs/00-intro kit/module_taxonomy.md`
3. Update `src/types/module.ts` -- expand types
4. Update `src/data/modules.ts` -- add space annotations to existing entries
5. Verify build compiles successfully

