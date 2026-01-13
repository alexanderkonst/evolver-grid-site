# Task: Image Lazy Loading

## Context
Images load immediately even when off-screen. Add lazy loading for better performance.

## Files to Modify
- Components that display images:
  - Avatar components
  - Event images
  - Profile pictures
  - Any `<img>` tags

## What to Build

1. Add loading="lazy" to all images:
```tsx
<img 
  src={imageUrl} 
  alt={altText}
  loading="lazy"
  className="..."
/>
```

2. For avatars, add fallback and error handling:
```tsx
<img 
  src={avatarUrl || '/default-avatar.png'} 
  alt={name}
  loading="lazy"
  onError={(e) => {
    e.currentTarget.src = '/default-avatar.png';
  }}
/>
```

3. Consider intersection observer for more control (optional):
```tsx
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  
  // Use native lazy loading
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      className={cn(className, !isLoaded && 'opacity-0')}
      onLoad={() => setIsLoaded(true)}
    />
  );
};
```

## Success Criteria
- [ ] All images have loading="lazy"
- [ ] Fallback images for errors
- [ ] No broken image icons
- [ ] Build passes
