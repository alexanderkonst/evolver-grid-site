# Task: Marketplace Browse Page

## Context
Users should be able to browse public Genius Offers from other users.

## Files to Read
- `src/pages/spaces/MarketplaceSpace.tsx` — current implementation
- Database schema for profiles/genius offers
- Public profile page for reference

## What to Build

1. Create new page:
```tsx
// src/pages/marketplace/BrowseGuides.tsx
```

2. Query public genius offers:
```tsx
const { data: offers } = useQuery({
  queryKey: ['public-offers'],
  queryFn: async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, genius_statement, unique_offer_headline')
      .not('unique_offer_headline', 'is', null)
      // Only show profiles with visibility enabled
      .eq('visibility_genius', true);
    return data;
  }
});
```

3. Display as card grid:
- Avatar
- Name
- Genius statement snippet
- Offer headline
- "View Profile" button

4. Add route:
```tsx
<Route path="/game/marketplace/browse" element={<BrowseGuides />} />
```

5. Wrap in GameShellV2

## Success Criteria
- [ ] BrowseGuides page created
- [ ] Shows grid of public genius offers
- [ ] Links to public profile pages
- [ ] Route added
- [ ] Build passes
