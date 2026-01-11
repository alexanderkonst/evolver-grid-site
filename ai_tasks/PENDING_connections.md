# Task: Connection Request System

**Assigned to:** Claude CLI / Lovable  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

After matching, users need a way to connect. This is the "Connect" button action.

---

## What to Build

### 1. Connections Table

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  message TEXT,                   -- optional intro message
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(requester_id, receiver_id)
);

-- RLS Policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  USING (requester_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create connection requests"
  ON connections FOR INSERT
  WITH CHECK (requester_id = auth.uid());
```

### 2. Connection Request Modal

When "Connect" clicked on MatchCard:

```
┌─────────────────────────────────────────┐
│  Connect with Karime                    │
│                                         │
│  Add a message (optional):              │
│  ┌─────────────────────────────────┐    │
│  │ Hi Karime! I saw we're both     │    │
│  │ working on regenerative food... │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Cancel]           [Send Request]      │
└─────────────────────────────────────────┘
```

### 3. Connections Page

**File:** `src/pages/Connections.tsx`

**Route:** `/connections`

Show:
- Pending requests (received)
- Sent requests (pending)
- Active connections

### 4. Accept/Decline Flow

For received requests:
```
[Karime wants to connect]
"Hi! I saw we're both..."

[Accept] [Decline]
```

### 5. What happens after Accept?

- Connection status = 'accepted'
- Both users can now see each other's email (if shared)
- Or: show "Message" button (future feature)

---

## Success Criteria

- [ ] Can send connection request
- [ ] Optional message with request
- [ ] Can accept/decline requests
- [ ] Connections list page works
- [ ] Duplicate requests prevented

---

## When Done

Rename to `DONE_connections.md`
