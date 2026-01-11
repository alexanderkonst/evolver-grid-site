---
priority: medium
agent: codex
---

# Add Language Selection to Profile

## Goal
Add multi-select field for languages user speaks fluently on the profile page.

## Context
Needed for matching feature — users can filter matches by same language(s).

## Implementation

### Database
Add column to `game_profiles` table:
```sql
ALTER TABLE game_profiles 
ADD COLUMN spoken_languages TEXT[] DEFAULT '{}';
```

### UI Location
Profile section or settings page.

### UI Component
- Multi-select dropdown or tag input
- Pre-populated with common languages: English, Russian, Spanish, German, French, Chinese, Portuguese, Japanese, Korean, Arabic
- Allow custom language entry

### Acceptance Criteria
1. User can select multiple languages
2. Selection persists to database
3. Profile displays selected languages
