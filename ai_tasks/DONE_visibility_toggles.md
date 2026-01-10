# Task: Visibility Toggles for Data Privacy

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-10

---

## Context

Users need control over who sees their data. Three visibility levels:
- **Me** — private, only I see
- **My Community** — visible to my community members
- **Public** — visible in marketplace

This implements the "Visibility Matrix" from data_architecture.md.

---

## Files to Read

- `docs/data_architecture.md` — the spec
- `src/pages/spaces/ProfileSpace.tsx` — where toggles will appear

---

## What to Build

### 1. Create visibility toggle component

`src/components/VisibilityToggle.tsx`

```tsx
interface VisibilityToggleProps {
  value: 'private' | 'community' | 'public';
  onChange: (value: 'private' | 'community' | 'public') => void;
  disabled?: boolean;
}
```

Visual: three small icons (Lock, Users, Globe) with the active one highlighted.

### 2. Add to ProfileSpace 

Show toggles next to each data section:
- Zone of Genius → toggle (default: community)
- Quality of Life → toggle (default: private, disabled)
- Assets → toggle (default: private)

### 3. Database

Create migration for `visibility_settings` table:
```sql
CREATE TABLE visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'zog', 'qol', 'assets', 'offer'
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'community', 'public')),
  UNIQUE(user_id, data_type)
);
```

---

## Success Criteria

- [ ] Toggle component renders three options
- [ ] Clicking toggle saves to database
- [ ] Page reload shows correct saved state
- [ ] Some toggles are disabled (QoL always private)
- [ ] No TypeScript errors

---

## When Done

Rename this file to `DONE_visibility_toggles.md`
