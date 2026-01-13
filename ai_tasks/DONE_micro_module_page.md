# Create MicroModulePage Component

## Task
Create a reusable `MicroModulePage.tsx` component for displaying micro-learning content.

## Context
We're building a micro-learning curriculum with 60+ modules. Each module needs a consistent page layout with video, key takeaway, experience, integration, and resources.

## Requirements

Create `/src/components/game/MicroModulePage.tsx`:

```tsx
interface MicroModuleProps {
  moduleId: string;        // "S4"
  title: string;           // "Conscious Breath"
  path: string;            // "spirit" | "mind" | "emotions" | "body" | "genius"
  videoUrl?: string;       // YouTube embed URL
  keyTakeaway: string;     // Single paragraph
  experience: {
    duration: string;      // "2 min"
    instructions: string;  // Markdown content
  };
  integration: {
    duration: string;      // "7 days"
    instructions: string;  // Markdown content
  };
  resources?: {
    title: string;
    url: string;
    type: 'pdf' | 'audio' | 'link';
  }[];
  nextModuleId?: string;   // "S5" for navigation
  nextModuleTitle?: string;
  onComplete?: () => void;
}
```

## UI Structure

```
┌─────────────────────────────────────────────┐
│ [Path Icon] Module ID • Title               │
├─────────────────────────────────────────────┤
│                                             │
│         [YOUTUBE VIDEO EMBED]               │
│         16:9 aspect ratio container         │
│                                             │
├─────────────────────────────────────────────┤
│ KEY TAKEAWAY                                │
│ [Key takeaway text in styled card]          │
├─────────────────────────────────────────────┤
│ ▼ EXPERIENCE (2 min)                        │
│   [Collapsible content with instructions]   │
├─────────────────────────────────────────────┤
│ ▼ INTEGRATION (7 days)                      │
│   [Collapsible content with game rules]     │
├─────────────────────────────────────────────┤
│ RESOURCES (if any)                          │
│ • [PDF icon] Worksheet.pdf                  │
│ • [Audio icon] Guided Practice.mp3          │
├─────────────────────────────────────────────┤
│ [✓ Mark Complete]      [→ Next: Title →]    │
└─────────────────────────────────────────────┘
```

## Styling Guidelines

1. Use existing design tokens from the site
2. Video container: 16:9 aspect ratio with rounded corners
3. Key takeaway: Card with accent background (golden/primary)
4. Collapsible sections: Use shadcn Collapsible or custom accordion
5. Mark Complete: Primary button with checkmark
6. Next Module: Outline button with arrow
7. Resources: Simple list with icons based on type

## Dependencies

- Use `react-markdown` for rendering markdown instructions (already installed)
- Use lucide-react icons for file types
- Use existing UI components from shadcn

## Files to Create
- `/src/components/game/MicroModulePage.tsx`
- `/src/components/game/MicroModulePage.css` (if needed)

## Test
- Render with mock data
- Verify collapsibles work
- Verify video embed loads
- Verify responsive layout

## Definition of Done
- [ ] Component renders all sections
- [ ] Video embed works with YouTube URLs
- [ ] Collapsible sections expand/collapse
- [ ] Mark Complete and Next buttons are styled
- [ ] Responsive on mobile
