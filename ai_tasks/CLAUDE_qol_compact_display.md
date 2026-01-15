# CLAUDE: QoL Compact Display

## Priority: 🟡 MEDIUM

## Goal
Apply same one-screen layout to Quality of Life results as we did for AppleseedDisplay.

## Implementation Plan

### Follow AppleseedDisplay Pattern
1. Reduce max-width to 2xl
2. Reduce padding/spacing
3. Remove extra sections
4. Add Share button (reuse ShareZoG pattern)
5. Add Save button for guests

### Files to Modify
1. `src/modules/quality-of-life-map/QolLayout.tsx` or results display
2. `src/pages/QualityOfLifeMapResults.tsx`

### Changes
- Compact header
- Single-column layout
- Share dropdown button
- Save to Profile button

### Acceptance Criteria
- [ ] QoL results fit on one screen
- [ ] Share button with dropdown
- [ ] Consistent with ZoG styling

## Assignee: CLAUDE
