# Add Plain Language to Excalibur Generation

## Goal
Make Excalibur results immediately understandable by adding plain-language versions of every poetic term.

## File
`supabase/functions/generate-excalibur/index.ts`

## Changes

### 1. Add to EXCALIBUR_PHILOSOPHY
After existing guiding tenets, add:
```
7. Plain Language Rule — Every poetic term must have a plain-language twin.
   "Sacred Mirror" → "I reflect back what people can't see in themselves"
8. 13-Year-Old Test — If a 13-year-old wouldn't understand it, rewrite it.
```

### 2. Update OUTPUT FORMAT 
Add `_plain` fields to essenceAnchor:
```json
{
  "essenceAnchor": {
    "coreVibration": "string - poetic name",
    "coreVibration_plain": "string - what this means in everyday words",
    "primeDriver": "string - 3-word formula",
    "primeDriver_plain": "string - what I actually do",  
    "archetype": "string - compound archetype",
    "archetype_plain": "string - who I am in simple terms"
  }
}
```

### 3. Add Example
Include one example in EXCALIBUR_EXAMPLES showing both poetic and plain versions.

## Acceptance
- Every poetic term has a `_plain` sibling
- User can explain their result to a friend
