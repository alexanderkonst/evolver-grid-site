# Task: LinkedIn Profile PDF Upload

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

To enrich user profiles and enable better matchmaking, users can upload their LinkedIn profile as PDF.
This gives us professional background, experience, connections context.

---

## What to Build

### 1. Storage bucket for PDFs

In Supabase Storage:
- Create bucket `linkedin-profiles`
- Authenticated upload
- Private read (only owner + system)

### 2. Add column to game_profiles

```sql
ALTER TABLE game_profiles ADD COLUMN linkedin_pdf_url TEXT;
ALTER TABLE game_profiles ADD COLUMN linkedin_extracted_at TIMESTAMPTZ;
```

### 3. LinkedInUpload component

**File:** `src/components/profile/LinkedInUpload.tsx`

UI:
```
┌─────────────────────────────────────────┐
│ 📄 Add Your LinkedIn Profile            │
│                                         │
│ [Upload PDF]                            │
│                                         │
│ ℹ️ How to get your LinkedIn PDF         │
│   (tooltip/expandable)                  │
│                                         │
│   1. Go to linkedin.com/in/your-profile │
│   2. Click "More" button                │
│   3. Select "Save to PDF"               │
│   4. Upload the downloaded file here    │
└─────────────────────────────────────────┘
```

### 4. Upload flow

1. User selects PDF file
2. Upload to Supabase Storage
3. Save URL to game_profiles.linkedin_pdf_url
4. Show success message

### 5. Add to Profile page

In CharacterHub or Profile section:
- Show upload component if no PDF
- Show "✓ LinkedIn imported" if uploaded
- Option to replace/delete

---

## Future Enhancement (Not This Task)

- Parse PDF to extract:
  - Current role
  - Company
  - Skills
  - Experience timeline
- Use for matchmaking

---

## Success Criteria

- [ ] Can upload LinkedIn PDF
- [ ] PDF stored in Supabase
- [ ] URL saved to profile
- [ ] Instructions visible and clear
- [ ] Can replace existing PDF

---

## When Done

Rename to `DONE_linkedin_upload.md`
