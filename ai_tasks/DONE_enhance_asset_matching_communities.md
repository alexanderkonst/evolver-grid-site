---
priority: high
agent: claude-cli
estimated_time: 2h
---

# Add Asset Matching to Matchmaking

## Context

Currently matchmaking matches people by genius/personality, but **does not match by assets**. This is a critical missing feature.

Assets = communities, audiences, products, services, skills, connections, resources that can be exchanged or combined.

## Two Changes Required

### 1. Update Asset Extraction Prompt

**Current:** Generic asset extraction
**Needed:** Focus on collaboration-ready, liquid, high-value assets

Add to the AI prompt:
```
When identifying assets, prioritize those that:
- Enable immediate collaboration or exchange
- Can be monetized or provide clear value to others
- Are most "liquid" (easy to share, access, or leverage)

Specifically look for:
- Communities/audiences (size, profile, what they need)
- Products/services (who is the ideal customer?)
- Skills that can be immediately applied
- Connections to key people or networks
- Distribution channels (newsletters, podcasts, social reach)
```

### 2. Create Asset Matching Logic

**New feature:** When matching people, also match by complementary assets.

Optimization criteria:
- **Collaboration potential** — Assets that combine well together
- **Monetization potential** — One has product, other has audience
- **Usefulness** — Practical, actionable matches

Examples:
- Person A has a course → Person B has community of ideal students
- Person A needs help with X → Person B is expert in X
- Person A has audience → Person B has content but no distribution

### Where This Lives

In Teams/Collabs space, add:
- "Match by Assets" toggle or tab
- Show asset-based match reasons alongside genius-based

## Files to Check/Modify

- Edge function for asset extraction prompt
- Matchmaking logic (Teams/Collabs)
- TeamsSpace.tsx or equivalent

## Acceptance Criteria

1. Asset extraction prompt prioritizes liquid, collaboration-ready assets
2. Users see asset-based match suggestions
3. Match explanations include "Your X + Their Y = opportunity"
