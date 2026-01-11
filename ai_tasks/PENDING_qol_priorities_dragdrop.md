---
priority: medium
agent: codex
---

# QoL Priorities Drag-Drop UI

## Goal
After QoL Assessment, show user next-level potential and let them drag-drop to prioritize which domains matter most.

## Context
From Crystalline Clarity Framework — users see their growth potential and rank priorities. System uses this to personalize Daily Loop recommendations.

## Location
New step after QoL Assessment completion, before entering main app.

## UI Requirements

### Screen 1: Next Level View
- Show each of 8 QoL domains
- Display current stage and next stage description for each
- Highlight domains with biggest growth potential

### Screen 2: Prioritization
- Draggable list of 8 domains
- User drags to reorder by personal priority
- Save top 3 as focus areas

### Database
```sql
ALTER TABLE game_profiles 
ADD COLUMN qol_priorities TEXT[] DEFAULT '{}';
```

## Acceptance Criteria
1. Shows next-level descriptions after QoL
2. Users can drag-drop to prioritize
3. Top priorities saved to profile
4. Daily Loop uses priorities for recommendations
