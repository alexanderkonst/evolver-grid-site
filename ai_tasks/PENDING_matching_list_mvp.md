---
priority: medium
agent: codex
---

# Matching List MVP

## Goal
Simple matching list showing top matches per category.

## Context
From Crystalline Clarity Framework — MVP v1 uses simple list format (no tender mechanics).

## Match Categories

| Category | Logic |
|----------|-------|
| **Similar Genius** | Compare archetype, core pattern, talents from ZoG |
| **Complementary Genius** | Find complementary archetypes/talents |
| **Similar Mission** | Compare mission/purpose data (when available) |

## Display
- Show Top 3 matches OR Top 1 per category
- Card format with: name, archetype, similarity score

## Filters (Toggles)
- Same location (optional)
- Same language(s) (optional)

## Data Requirements
- Requires `spoken_languages` field in profile (separate task)
- Uses existing ZoG snapshot data

## Location
New page: `/game/matches` or section in Community space

## Acceptance Criteria
1. Shows matches based on ZoG data
2. Filter toggles work
3. At least one category shows matches
