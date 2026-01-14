# Add Plain Language to Appleseed Generation

## Goal
Make Zone of Genius results (Appleseed) immediately understandable.

## File
Find the Appleseed generation edge function (likely `supabase/functions/generate-appleseed/index.ts` or similar).

## Changes

### 1. Add LANGUAGE GUIDELINES to prompt:
```
LANGUAGE GUIDELINES:
- For every abstract term, provide a simple explanation
- archetype_title should be poetic but archetype_meaning should be in everyday language
- Use words a 13-year-old would understand in the "meaning" fields
- Connect every concept to a real-world action or result
```

### 2. Add _plain fields to OUTPUT:
```json
{
  "archetype_meaning": "What this means in plain language",
  "primeDriver_meaning": "What I actually do",
  "tagline_simple": "One sentence anyone can understand"
}
```

## Acceptance
- User reads result and says "Yes, that's me!"
- User can explain to friends what it means
