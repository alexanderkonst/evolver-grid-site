# QoL Compact Display

> **Status**: PENDING  
> **Agent**: CLAUDE  
> **Priority**: High  
> **Estimate**: 2-3 hours (large file: 737 lines)

## Objective
Apply one-screen layout pattern to QualityOfLifeMapResults.tsx, similar to AppleseedDisplay simplification.

## Approach
1. Extract hero section with main QoL score
2. Reduce visible sections to essentials
3. Move detailed breakdowns to "Apply Your Genius" paid section
4. Add Share button dropdown
5. Maintain Save to Profile functionality

## Files to Modify
- `/src/pages/QualityOfLifeMapResults.tsx` - Main results page
- Possibly create `/src/modules/quality-of-life-map/QolDisplay.tsx` - Simplified view

## Acceptance Criteria
- [ ] Single-screen layout (no scrolling for core info)
- [ ] Wabi-sabi styling applied
- [ ] Share dropdown integrated
- [ ] Build passes
