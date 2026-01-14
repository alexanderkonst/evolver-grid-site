# Task: Lazy Load Images

## Priority: Medium
## Complexity: Low

## Description
Add `loading="lazy"` attribute to all `<img>` tags for better performance.

## Files to Audit
All files in:
- `src/components/`
- `src/pages/`
- `src/modules/`

## Implementation
Find all `<img` tags and add `loading="lazy"`:

Before:
```tsx
<img src={url} alt={alt} className="..." />
```

After:
```tsx
<img src={url} alt={alt} loading="lazy" className="..." />
```

## Exceptions
Do NOT add lazy loading to:
- Hero images (above fold)
- Logo in header
- Profile pictures in header/nav

## Additional Optimization
Also add `decoding="async"` for non-critical images:
```tsx
<img src={url} alt={alt} loading="lazy" decoding="async" className="..." />
```

## Acceptance Criteria
- [ ] All below-fold images have `loading="lazy"`
- [ ] Hero/critical images do NOT have lazy loading
- [ ] No broken images after change
- [ ] Page loads faster (verify with Lighthouse)
