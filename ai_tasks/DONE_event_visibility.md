# Add Event Visibility Toggle

## Task
Add a visibility level selector to the event creation form.

## Context
Users need to control who can see their events:
- **Public** — Anyone can see (default)
- **Community** — Only logged-in community members
- **Private** — Only invited people
- **Team** — Only team members

## Current State
Events table likely already has or needs a `visibility` column.
Profile visibility uses: `"hidden" | "minimal" | "medium" | "full"`

## What to Build

### 1. Database Migration (if needed)
```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
-- Values: 'public', 'community', 'private', 'team'
```

### 2. Update Event Creation Form
File: Find event creation page/component

Add toggle/select:
```tsx
<Select value={visibility} onValueChange={setVisibility}>
  <SelectTrigger>
    <SelectValue placeholder="Who can see this?" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="public">
      <Globe className="w-4 h-4 mr-2" />
      Public — Anyone
    </SelectItem>
    <SelectItem value="community">
      <Users className="w-4 h-4 mr-2" />
      Community — Members only
    </SelectItem>
    <SelectItem value="private">
      <Lock className="w-4 h-4 mr-2" />
      Private — Invite only
    </SelectItem>
    <SelectItem value="team">
      <UserCheck className="w-4 h-4 mr-2" />
      Team — My team only
    </SelectItem>
  </SelectContent>
</Select>
```

### 3. Update Event List Filtering
When fetching events, filter based on user's access level:
- Unauthenticated: only `public`
- Authenticated: `public` + `community` + events they're invited to
- Team member: above + `team` events for their team

### 4. UI Indicator
Show a badge on event cards indicating visibility:
- 🌐 Public (no badge needed)
- 👥 Community badge
- 🔒 Private badge
- 👤 Team badge

## Files to Modify
- Event creation page (create or find)
- Event list/browse page
- Event detail page (show visibility)
- Database types if needed

## Definition of Done
- [ ] Visibility select in create form
- [ ] Events save with visibility
- [ ] Event list filters correctly
- [ ] Visual indicator on event cards
- [ ] Build passes
