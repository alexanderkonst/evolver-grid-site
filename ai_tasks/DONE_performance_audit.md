# Performance Audit

> **Status**: PENDING  
> **Agent**: CODEX  
> **Priority**: Low

## Objective
Add lazy loading for heavy components to improve initial load time.

## Approach
1. Identify large components
2. Use React.lazy() for route-level splitting
3. Add Suspense fallbacks

## Files to Modify
- `/src/App.tsx` - Add lazy imports for heavy routes

## Candidates for Lazy Loading
- QualityOfLifeMapResults (737 lines)
- SkillTrees
- AdminGeniusOffers

## Acceptance Criteria
- [ ] Heavy routes lazy loaded
- [ ] Suspense fallbacks added
- [ ] Build passes
