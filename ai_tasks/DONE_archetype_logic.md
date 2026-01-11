# Task: Complementary Archetype Logic

**Assigned to:** Claude CLI  
**Priority:** Low  
**Created:** 2026-01-11

---

## Context

For matchmaking, we need to define which archetypes complement each other.

---

## Known Archetypes (from samples)

| Archetype | Description |
|-----------|-------------|
| Architect of Integration Codes | Sees patterns, builds bridges, creates coherence |
| Sacred Mirror | Reflects truth, holds space, transmutes pain |
| Network Cartographer | Maps connections, senses timing, introduces |
| Temple Builder of Futures | Translates vision into form, bridges ceremony and structure |

---

## Complementarity Matrix

**Hypothesis:** Archetypes complement when they cover different aspects of a complete project:

| Need | Complementary Archetype |
|------|------------------------|
| Vision → Structure | Architect + Builder |
| Individual → Collective | Mirror + Cartographer |
| Ideas → Action | Architect + Builder |
| Healing → Creating | Mirror + Architect |

---

## Implementation

**File:** `src/lib/archetypeMatching.ts`

```typescript
// Simple keyword matching for V1
const ARCHETYPE_KEYWORDS = {
  'architect': ['structure', 'pattern', 'integration', 'code'],
  'mirror': ['reflect', 'space', 'truth', 'healing'],
  'cartographer': ['network', 'connection', 'timing', 'bridge'],
  'builder': ['form', 'structure', 'vision', 'create']
};

const COMPLEMENTARY_PAIRS = [
  ['architect', 'mirror'],
  ['cartographer', 'builder'],
  ['architect', 'builder'],
  ['mirror', 'cartographer']
];

export function areComplementary(archetype1: string, archetype2: string): boolean {
  // Extract keywords from archetype names
  // Check against complementary pairs
}
```

---

## For AI Matching (Future)

Use embeddings to compute complementarity based on full Appleseed data, not just archetype name.

---

## Success Criteria

- [ ] Function to check complementarity
- [ ] Used in matchmaking scoring
- [ ] Can evolve as we learn more archetypes

---

## When Done

Rename to `DONE_archetype_logic.md`
