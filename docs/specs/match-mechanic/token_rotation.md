# §8.6 — Match Consent Token Rotation Procedure

**Created:** 2026-05-19 (Day 67)

## When to rotate

- Secret leaked (committed to git, exposed in logs, etc.)
- Annual rotation hygiene (every ~12 months)
- Any sign of token forgery in `email_send_log`

## Effect

Bumping `MATCH_CONSENT_SECRET` invalidates **all in-flight tokens**.
Any user who clicks Yes / Not now on an existing heads-up email will
see the "this invitation expired" page instead of the action firing.

This is acceptable because:
- Token TTL is 30 days max
- Affected users can express interest again from the matchmaking page

## Procedure

### Step 1 — Generate a new secret

```bash
openssl rand -base64 48
```

Or any 32+ byte random source.

### Step 2 — Update the secret in Supabase

Lovable / Supabase dashboard:

1. Navigate to **Project Settings → Edge Functions → Secrets**
2. Find `MATCH_CONSENT_SECRET`
3. Replace value with the new secret
4. Save

Both `send-match-headsup-email` and `match-consent` functions read this
env var at request time, so the rotation takes effect immediately on
their next invocation.

### Step 3 — Communicate (optional)

If the rotation is from a real leak (not routine), consider sending a
one-time email to users with pending `match_interests` rows
(`consent_response IS NULL`) letting them know their pending invitations
are reset, with a link back to the matchmaking page to re-issue.

SQL to find affected users:

```sql
SELECT DISTINCT u.email
FROM auth.users u
JOIN public.match_interests mi ON mi.to_user_id = u.id
WHERE mi.consent_response IS NULL
  AND mi.headsup_email_sent_at IS NOT NULL;
```

### Step 4 — Verify

After rotation, manually:

1. Trigger a test heads-up (from a test account)
2. Click the Yes button in the test email
3. Confirm the consent flow works end-to-end with the new secret

## Prevention

- Never commit `MATCH_CONSENT_SECRET` to git
- Use Lovable / Supabase Edge Functions Secrets UI (not env files)
- Audit `console.log` calls in the edge functions for accidental secret logging
