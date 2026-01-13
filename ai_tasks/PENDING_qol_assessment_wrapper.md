# Create QoL Assessment Wrapper for GameShell

## Task
Wrap the existing Quality of Life Map Assessment inside GameShellV2 for consistent 3-panel navigation.

## Context
Currently `QualityOfLifeMapAssessment.tsx` uses the old standalone Navigation component. We need to integrate it into the new 3-panel layout while preserving all functionality.

## Requirements

### 1. Add renderMode prop to existing assessment

Modify `/src/pages/QualityOfLifeMapAssessment.tsx`:

```tsx
interface QualityOfLifeMapAssessmentProps {
  renderMode?: 'standalone' | 'embedded';
}

const QualityOfLifeMapAssessment = ({ 
  renderMode = 'standalone' 
}: QualityOfLifeMapAssessmentProps) => {
  // ...
  
  // If embedded, don't render Navigation and back button
  if (renderMode === 'embedded') {
    return (
      <div className="py-8">
        {/* Only the assessment content */}
      </div>
    );
  }
  
  // Current standalone behavior
  return (
    <div className="min-h-dvh">
      <Navigation />
      {/* ... */}
    </div>
  );
};
```

### 2. Create wrapper page

Create `/src/pages/spaces/transformation/TransformationQolAssessment.tsx`:

```tsx
import GameShellV2 from "@/components/game/GameShellV2";
import QualityOfLifeMapAssessment from "@/pages/QualityOfLifeMapAssessment";

const TransformationQolAssessment = () => {
  return (
    <GameShellV2>
      <QualityOfLifeMapAssessment renderMode="embedded" />
    </GameShellV2>
  );
};

export default TransformationQolAssessment;
```

### 3. Add route in App.tsx

Add route:
```tsx
<Route path="/game/transformation/qol-assessment" element={<TransformationQolAssessment />} />
```

### 4. Update SectionsPanel

Add "Quality of Life Map" as a section in SPACE_SECTIONS for "transformation" space.

## Update Navigation Flow

After assessment completion, navigate to:
- `/game/transformation/qol-results` instead of `/quality-of-life/results`

Create results wrapper page as well.

## Files to Modify
- `/src/pages/QualityOfLifeMapAssessment.tsx` - Add renderMode prop
- `/src/App.tsx` - Add new route
- `/src/components/game/SectionsPanel.tsx` - Add section

## Files to Create
- `/src/pages/spaces/transformation/TransformationQolAssessment.tsx`
- `/src/pages/spaces/transformation/TransformationQolResults.tsx` (if needed)

## Definition of Done
- [ ] Assessment renders correctly inside GameShellV2
- [ ] SpacesRail and SectionsPanel visible during assessment
- [ ] All assessment functionality works (selecting stages, navigation)
- [ ] Completion navigates to results inside GameShell
- [ ] Standalone route still works for backward compatibility
