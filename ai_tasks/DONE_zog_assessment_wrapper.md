# Create ZoG Assessment Wrapper for GameShell

## Task
Wrap the existing Zone of Genius Assessment inside GameShellV2 for consistent 3-panel navigation.

## Context
Currently `ZoneOfGeniusAssessmentLayout.tsx` uses the old Navigation + Footer layout. We need to integrate it into the new 3-panel layout while preserving the 5-step wizard functionality.

## Requirements

### 1. Add renderMode prop to existing layout

Modify `/src/modules/zone-of-genius/ZoneOfGeniusAssessmentLayout.tsx`:

```tsx
interface ZoneOfGeniusAssessmentLayoutProps {
  renderMode?: 'standalone' | 'embedded';
}

const ZoneOfGeniusAssessmentLayout = ({ 
  renderMode = 'standalone' 
}: ZoneOfGeniusAssessmentLayoutProps) => {
  // ...
  
  if (renderMode === 'embedded') {
    return (
      <ZoneOfGeniusProvider>
        <div className="py-8">
          {/* Step indicator */}
          {/* Outlet for step content */}
          <Outlet />
        </div>
      </ZoneOfGeniusProvider>
    );
  }
  
  // Current standalone behavior with Navigation + Footer
  return (/* ... */);
};
```

### 2. Create wrapper page

Create `/src/pages/spaces/transformation/TransformationGeniusAssessment.tsx`:

```tsx
import { Outlet } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { ZoneOfGeniusProvider } from "@/modules/zone-of-genius/ZoneOfGeniusContext";

const TransformationGeniusAssessment = () => {
  return (
    <GameShellV2>
      <ZoneOfGeniusProvider>
        {/* Step progress indicator */}
        <Outlet />
      </ZoneOfGeniusProvider>
    </GameShellV2>
  );
};

export default TransformationGeniusAssessment;
```

### 3. Add routes in App.tsx

Add nested routes:
```tsx
<Route path="/game/transformation/genius-assessment" element={<TransformationGeniusAssessment />}>
  <Route path="step-0" element={<ZoneOfGeniusStep0 />} />
  <Route path="step-1" element={<ZoneOfGeniusStep1 />} />
  <Route path="step-2" element={<ZoneOfGeniusStep2 />} />
  <Route path="step-3" element={<ZoneOfGeniusStep3 />} />
  <Route path="step-4" element={<ZoneOfGeniusStep4 />} />
</Route>
```

### 4. Update SectionsPanel

Add "Zone of Genius" as a section in SPACE_SECTIONS for "transformation" space.

## Files to Modify
- `/src/modules/zone-of-genius/ZoneOfGeniusAssessmentLayout.tsx` - Add renderMode prop
- `/src/App.tsx` - Add new routes
- `/src/components/game/SectionsPanel.tsx` - Add section

## Files to Create
- `/src/pages/spaces/transformation/TransformationGeniusAssessment.tsx`

## Definition of Done
- [ ] All 5 steps render correctly inside GameShellV2
- [ ] SpacesRail and SectionsPanel visible during assessment
- [ ] Step navigation works correctly
- [ ] Provider context preserved across steps
- [ ] Completion shows results inside GameShell
- [ ] Standalone routes still work for backward compatibility
