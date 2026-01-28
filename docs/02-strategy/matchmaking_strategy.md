# Matchmaking Strategy

> **Core Insight:** Start as a community tool with intra-community matching. Graduate to community-of-communities when multiple tribes are thriving.

---

## Strategic Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Intra vs Inter-community** | Intra-community first | Higher trust, faster action, proves value faster |
| **Tool vs Platform** | Community Tool first | MVP serves one tribe; network effects come later |
| **Scale architecture** | Rule-based now, embeddings later | Works to ~1,000 users; pgvector ready for growth |

---

## Match Types (Priority Order)

| Match Type | Signal | Question Answered | Status |
|------------|--------|-------------------|--------|
| **Complementary Genius** | Archetype pairing | "Who's a great co-founder fit?" | ✅ Built |
| **Similar Genius** | Archetype/pattern overlap | "Who thinks like me?" | ✅ Built |
| **Similar Mission** | Mission commitment | "Who's working on what I care about?" | ✅ Built |
| **Asset Complementarity** | I have X, you need X | "Who can help / needs my help?" | 🔶 Next |
| **Growth Pairing** | QoL weak spots | "Who's navigating similar challenges?" | 🔶 Future |

---

## Current Implementation

**What exists:**
- `Matchmaking.tsx` — Shows 3 match categories
- `archetypeMatching.ts` — Complementarity logic
- `MatchCard.tsx` — Pass/Connect UI (connect action needs work)
- Filters: location, language

**Data sources used:**
- Zone of Genius (`appleseed_data`)
- Mission commitments (`mission_participants`)

**Not yet used:**
- Assets (currently localStorage, needs DB persist)
- Quality of Life data

---

## Scale Architecture

### Current (up to ~1,000 users)
- Brute-force comparison: O(n²)
- Cached server-side, recomputed on profile change
- Works fine for MVP

### Future (10,000+ users)
```
Profile → Synthesized Text → Embedding → Vector DB (pgvector)

Query: "Find top 10 nearest neighbors to this embedding"
Complexity: O(log n) with approximate nearest neighbor
```

**Supabase-ready approach:**
1. Add `profile_embedding` column to `game_profiles`
2. Edge function generates embedding on profile update
3. Query with `ORDER BY embedding <=> $target LIMIT 10`

---

## MVP Scope

### Must Have
- [ ] Connect button actually works (email or connection request)
- [ ] Intra-community filtering (by cohort/program if applicable)
- [ ] Page rename: "Matchmaking" → "Discover" (cosmetic)

### Nice to Have
- [ ] AI-generated match explanation ("Why collaborate")
- [ ] Asset-based matching (requires DB migration for assets)

### Future (Post-Pilot)
- [ ] pgvector embedding column
- [ ] Inter-community toggle
- [ ] Growth/QoL-based pairing

---

## Community Framing

**Phase 1: Community Tool**
- Platform serves ONE community at a time
- All matching is intra-community (same cohort/program)
- High trust, fast iteration, value proven quickly

**Phase 2: Community of Communities**
- Multiple tribes on platform
- Inter-community matching unlocked
- Introduction/trust layer needed
- Network effects begin

**Transition trigger:** 3-5 thriving tribes using the tool internally.

---

## Notes

- Assets currently stored in localStorage per user — needs DB migration before asset-matching works
- Connect button exists in UI but action may be non-functional
- Current matching algorithm handles ~1,000 users fine; embedding prep is for growth readiness
