# Profile Overview Summary Cards

> **Status**: PENDING  
> **Agent**: CLAUDE  
> **Priority**: Medium

## Objective
Add summary cards to Profile Overview showing ZoG, QoL, and Genius Business at a glance.

## Approach
1. Create compact summary card component
2. Show key data: Archetype, QoL Score, Business Name
3. Link to detailed sections

## Files to Modify
- `/src/pages/spaces/sections/ProfileOverview.tsx` - Add summary cards
- Create `/src/components/profile/ProfileSummaryCard.tsx` - Reusable card

## Acceptance Criteria
- [ ] Summary cards show ZoG archetype
- [ ] Summary cards show QoL score
- [ ] Summary cards show Genius Business name
- [ ] Cards link to detail pages
- [ ] Build passes
