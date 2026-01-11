# Task: RSVP Email Confirmation

**Assigned to:** Claude CLI / Lovable  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

When user RSVPs to an event, they should be able to provide an email to receive confirmation.

---

## What to Build

### 1. Add email input to RSVP flow

When user clicks "Going" or "Maybe":
- Show optional email input
- "Send me a reminder" checkbox

### 2. Update event_rsvps table

Add column (if not exists):
```sql
ALTER TABLE event_rsvps ADD COLUMN email TEXT;
ALTER TABLE event_rsvps ADD COLUMN wants_reminder BOOLEAN DEFAULT false;
```

### 3. Edge function for email

**File:** `supabase/functions/send-rsvp-confirmation/index.ts`

Send email with:
- Event title, date, time, location
- Add to calendar link
- "You're confirmed" message

---

## Email Template

```
Subject: You're confirmed for {Event Title}!

Hi there,

You're confirmed for:

📅 {Event Title}
🗓️ {Date} at {Time}
📍 {Location}

[Add to Google Calendar] [Add to iCal]

See you there!
```

---

## Success Criteria

- [ ] Email input appears on RSVP
- [ ] Email saved to database
- [ ] Confirmation email sent
- [ ] Email contains event details

---

## When Done

Rename to `DONE_rsvp_email.md`
