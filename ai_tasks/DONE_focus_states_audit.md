# Task: Focus States Audit

## Priority: High
## Complexity: Low

## Description
Add visible focus rings to all interactive elements for keyboard accessibility.

## Files to Modify
- `src/index.css` — global focus styles
- Component files as needed

## Implementation

### Global Styles (index.css)
```css
/* Focus visibility for keyboard navigation */
:focus-visible {
  outline: 2px solid #8460ea;
  outline-offset: 2px;
}

/* Remove focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Button Components
Add to Tailwind classes:
```
focus:ring-2 focus:ring-[#8460ea] focus:ring-offset-2
```

### Input Components
Add to Tailwind classes:
```
focus:ring-2 focus:ring-[#8460ea] focus:border-[#8460ea]
```

## Elements to Check
- [ ] All `<button>` elements
- [ ] All `<a>` links
- [ ] All `<input>` fields
- [ ] All `<textarea>` elements
- [ ] All `<select>` elements
- [ ] Custom interactive components

## Acceptance Criteria
- [ ] All focusable elements have visible focus indicator
- [ ] Focus ring color is #8460ea (electric violet)
- [ ] Works with Tab key navigation
- [ ] No focus ring on mouse click (only keyboard)
