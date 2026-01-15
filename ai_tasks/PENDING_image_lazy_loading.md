# CODEX: Add loading="lazy" to images

## Objective
Add native lazy loading to all `<img>` tags for better performance.

## Scope
All `.tsx` files in `src/` directory

## Changes required
Find all `<img` tags and add `loading="lazy"` attribute:
```tsx
// Before:
<img src="..." alt="..." />

// After:
<img src="..." alt="..." loading="lazy" />
```

## Exceptions
- Do NOT add to images above the fold (hero images, logos in header)
- Focus on images in cards, galleries, and scrollable content

## Acceptance criteria
- [ ] All appropriate images have loading="lazy"
- [ ] Build passes with no errors
