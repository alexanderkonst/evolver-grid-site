# ZoG Profile Deep Dive — Product Spec

> **Module:** ZoG Profile Deep Dive  
> **Phase:** 1 — PRODUCT  
> **Status:** Draft  
> **Created:** 2026-01-28

---

## INPUT

| Element | Value |
|---------|-------|
| **Module Type** | Upgrade (post-onboarding) |
| **Parent Space** | GROW |
| **Prerequisite** | ZoG Onboarding complete |
| **Unlocks** | BUILD space badge |
| **Estimated Time** | 5-10 min |

---

## MASTER RESULT

> **FROM:** I have my Zone of Genius archetype but don't fully understand what it means  
> **TO:** I deeply connect with my genius profile and know how to leverage it for a genius business

### Transformation
User moves from surface-level awareness of their archetype to deep understanding of:
- Their unique value proposition
- How their genius translates to offerings
- Why they're uniquely suited to serve certain people

---

## SUB-RESULTS

| # | Sub-Result | Screen/Action |
|---|------------|---------------|
| 1 | User reads full genius profile breakdown | ProfileScreen |
| 2 | User understands their Excalibur (unique offering seed) | ExcaliburSection |
| 3 | User sees how their intelligences combine | IntelligenceMapSection |
| 4 | User marks profile as "read" → unlocks BUILD | CompletionAction |

---

## SCREENS

### Screen 1: ZoG Profile Screen (exists)
**Location:** `/game/grow/zog-profile` or `/game/profile/zone-of-genius`

**Content (already built):**
- Archetype title + description
- Intelligence breakdown (8 intelligences)
- Verb stack (core action verbs)
- Excalibur seed (unique offering idea)
- Full AI-generated profile text

**CTA:** "I've Read My Profile" → marks complete → triggers BUILD badge

---

## DAN TIANS (Engagement Hooks)

| Dan Tian | Implementation |
|----------|----------------|
| **Upper** (Insight) | "Your unique genius combination appears in only 2% of the population" |
| **Middle** (Emotion) | Personal narrative connecting user's life experience to their archetype |
| **Lower** (Action) | Clear next step: "Now you can create your Genius Offer in BUILD" |

---

## EXTENSIONS (Future)

- [ ] Audio version of profile (AI voice reading)
- [ ] Share profile as card (social)
- [ ] Compare with friends/team
- [ ] Deep dive into each intelligence

---

## INTEGRATION POINTS

### My Next Move
After ZoG onboarding complete, recommend:
> "Read Your Genius Profile" → 5 min → GROW space

### Skill Trees
Position as Upgrade #2 in GROW skill tree:
1. ✅ ZoG Onboarding (complete)
2. 📍 ZoG Profile Deep Dive ← YOU ARE HERE
3. [ ] Resources Mapping
4. [ ] Mission Discovery

### Badge Logic
```typescript
// BUILD badge triggers when:
if (hasZoG && hasReadZoGProfile && !nudges.buildNudgeSeen) {
    nudgeBadges.push('build');
}
```

---

## DATABASE CHANGES

Need new field in `game_profiles`:
```sql
ALTER TABLE game_profiles 
ADD COLUMN zog_profile_read_at TIMESTAMPTZ DEFAULT NULL;
```

When user clicks "I've Read My Profile":
```typescript
await supabase
  .from('game_profiles')
  .update({ zog_profile_read_at: new Date().toISOString() })
  .eq('id', profileId);
```

---

## ROAST GATE 1

| Check | Status |
|-------|--------|
| Master Result clear? | ✅ Yes |
| Sub-Results atomic? | ✅ Yes |
| Screens defined? | ✅ Already built |
| Dan Tians present? | ✅ Yes |
| Integration points clear? | ✅ Yes |
| DB changes defined? | ✅ Yes |

**VERDICT:** Ready for Phase 2 (Architecture) or direct implementation since screens exist.

---

## NEXT STEPS

1. [ ] Add `zog_profile_read_at` field to database
2. [ ] Add "I've Read My Profile" button to existing ZoG Profile screen
3. [ ] Update `myNextMoveLogic.ts` to check `hasReadZoGProfile`
4. [ ] Update `GameShellV2.tsx` BUILD badge logic
5. [ ] Add to GROW skill tree
