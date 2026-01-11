---
priority: medium
agent: claude-cli
---

# Implement Panel 2 Toggle (Desktop)

## Context
On desktop, users should be able to collapse Panel 2 (SectionsPanel) to give more space to content. This is like Discord's channel list collapse.

## Requirements

### 1. Toggle Button
Add a toggle button in Panel 2 header that:
- Collapses Panel 2 to 0 width
- Shows expand button on Panel 1 or edge

### 2. State Persistence
Store collapsed state in localStorage so it persists across sessions.

### 3. Animation
Smooth width transition (200ms ease-out).

### 4. Keyboard Shortcut (Optional)
`Cmd/Ctrl + B` to toggle panel.

## Files to Modify
- `src/components/game/GameShellV2.tsx` - add toggle state and button
- `src/components/game/SectionsPanel.tsx` - add close button in header

## Implementation Approach
```tsx
// In GameShellV2.tsx
const [sectionsPanelOpen, setSectionsPanelOpen] = useState(() => {
    const saved = localStorage.getItem('sectionsPanelOpen');
    return saved !== null ? JSON.parse(saved) : true;
});

useEffect(() => {
    localStorage.setItem('sectionsPanelOpen', JSON.stringify(sectionsPanelOpen));
}, [sectionsPanelOpen]);
```

## Acceptance Criteria
1. Toggle button visible in Panel 2 header
2. Panel collapses/expands smoothly
3. State persists in localStorage
4. When collapsed, small expand button visible
