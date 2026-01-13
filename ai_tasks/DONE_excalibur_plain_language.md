# Improve Excalibur Plain Language

## Task
Update the Excalibur generation prompt to produce more grounded, practical language alongside poetic descriptions.

## Problem
Current outputs are too abstract:
- "Coherent Alchemist" — beautiful but confusing
- "Temple Builder of Futures" — cool but what does it mean?
- "Sacred Mirror · Mother Healer" — ethereal but not actionable

## Solution
Add "plain language twins" for every abstract concept.

## File to Modify
`supabase/functions/generate-excalibur/index.ts`

## Changes

### 1. Add to EXCALIBUR_PHILOSOPHY (after line 23)

```typescript
7. Plain Language Rule — Every poetic term must have a plain-language twin.
   Example: "Sacred Mirror" → Plain: "I reflect back what people can't see in themselves"
8. 13-Year-Old Test — If a smart 13-year-old wouldn't understand it, add a simpler version.
9. Practical Anchor — Every description must connect to what the person actually DOES.
```

### 2. Update EXCALIBUR_OUTPUT_FORMAT (line 136-174)

Add `_plain` fields to essenceAnchor:

```typescript
{
  "essenceAnchor": {
    "coreVibration": "string - poetic name (e.g. 'Coherent Alchemist')",
    "coreVibration_plain": "string - simple explanation (e.g. 'I help chaotic systems become harmonious')",
    "primeDriver": "string - 3-word formula (e.g. 'Align · Transform · Integrate')",
    "primeDriver_plain": "string - what I do (e.g. 'I take messy situations and create clarity')",
    "archetype": "string - compound archetype (e.g. 'Temple Builder of Futures')",
    "archetype_plain": "string - who I am simply (e.g. 'I design spaces where transformation happens')"
  },
  // ... rest of structure unchanged
}
```

### 3. Add Example with Plain Language (in EXCALIBUR_EXAMPLES)

```typescript
EXAMPLE 4: PLAIN LANGUAGE DEMO
AppleSeed: Coherent Alchemist
- coreVibration: "Coherent Alchemist"
- coreVibration_plain: "I turn chaos into harmony"
- primeDriver: "Align · Transform · Integrate"
- primeDriver_plain: "I help people and systems find their natural order"
- archetype: "Temple Builder of Futures"
- archetype_plain: "I create structures where people can grow"
```

### 4. Add to System Message (line 272-273)

```typescript
{
  role: "system",
  content: "You are an Excalibur Generator that outputs ONLY valid JSON. No markdown, no code blocks. IMPORTANT: For every poetic term, also provide a plain-language explanation that a 13-year-old could understand."
}
```

## Definition of Done
- [ ] EXCALIBUR_PHILOSOPHY has new tenets 7, 8, 9
- [ ] OUTPUT_FORMAT has _plain fields
- [ ] Example shows plain language usage
- [ ] System message emphasizes plain language
- [ ] Edge function deploys successfully
- [ ] Test generation produces both poetic and plain versions
