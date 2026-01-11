---
priority: low
agent: codex
---

# Accessibility Audit: Add Missing Aria Labels

## Goal
Improve accessibility by adding appropriate aria-labels to interactive elements.

## Scope
Focus on:
- All `<button>` elements without text content
- Icon-only buttons
- Image elements without proper alt text
- Form inputs without labels

## Files to check
- `src/components/**/*.tsx`
- `src/pages/**/*.tsx`

## Acceptance Criteria
1. All icon-only buttons have `aria-label`
2. All images have meaningful `alt` text (not just "image")
3. Form inputs have associated labels or `aria-label`
4. No accessibility warnings in browser dev tools
