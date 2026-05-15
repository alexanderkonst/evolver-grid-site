# Granting UBB / Platform Access — Admin Operator Playbook

**Audience:** Sasha (admin), running grants from `/admin`.
**Last updated:** Day 64, May 7, 2026.

This is the step-by-step for unlocking the UBB module + BUILD space for a specific account. Use it when a founder pays for the Top Talent Business Session, when you onboard someone to the Founders 50 cohort, or when you gift platform access for trial/strategic reasons.

The unlock gate is a single SQL flag: `game_profiles.entitlement_tier`. Any value other than `tasting` opens **all four** access surfaces in one move:

- The BUILD chip in the SPACES rail (left-most pane)
- The JOURNEY rail item #5 "Build a business off your top talent" (unlocks the row, removes the dimming)
- The `/ubb` route itself (otherwise bounces unauth-no-coupon users to `/zone-of-genius`)
- Any future commercial-tier surfaces (`useEntitlement().isCommercial`)

---

## Prerequisites

1. You're logged in with one of the magic admin emails:
   - `alexanderkonst@gmail.com` (main)
   - `konst@alum.mit.edu`
   - `me@sloan.mit.edu`

   These are hardcoded both client-side ([src/lib/isAdmin.ts](src/lib/isAdmin.ts)) and server-side (the `has_role()` SQL function, see migration `20260515170100_admin_email_lock.sql`). Admin status is derived from the email — it survives account deletion, progress reset, and any row-level data wipe. The next time you sign in with one of these emails, full admin returns automatically.

2. The target account exists in `auth.users` — i.e., the person has signed up (taken the assessment, saved their reveal, or paid for $37 activation). If they haven't signed up yet, the grant will fail with "user not found." Have them sign up first.

---

## The Step-by-Step

### 1. Navigate to the admin console

Open `https://findyourtoptalent.com/admin` (or `localhost:8080/admin` in dev). The `AdminGate` checks your session — non-admin emails get bounced to `/`.

You should see a multi-section page with KPIs at the top and an **"Entitlement grants"** section further down (titled exactly that — look for it; it's roughly at the middle of the page).

### 2. Inside "Entitlement grants" — fill the form

There are four input fields:

| Field | What to enter | Required |
|---|---|---|
| **Target email** | The email of the user you're granting access to (case-insensitive — the RPC lower-cases internally). Has to match a row in `auth.users`. | ✓ Required |
| **Tier** | Dropdown of 7 values. Pick by buyer type (see tier guide below). | ✓ Required |
| **Expires at** | Optional date picker. Leave blank for lifetime access. Set for trials. | ✗ Optional |
| **Note** | Optional free-text reason. Goes into the audit log so you can grep it later (`"founder #12"`, `"trial — Sandra"`, `"comp — Karime referral"`). | ✗ Optional |

### 3. Pick the right tier

Match the buyer to the tier they paid for (or the gift you're making). The dropdown values match the `entitlement_tier` enum in Supabase exactly:

| Buyer scenario | Tier to pick | Price they paid | Notes |
|---|---|---|---|
| Self-serve Builder buyer | `builder` | $197 | Personal UBB use, lifetime |
| Self-serve Locked-in buyer | `locked_in` | $497 | Commercial use rights |
| One of the first 50 cohort | `founders_50` | $197 | Locked-in access at Builder price; permanent cohort marker |
| Booked a Top Talent Business Session | `ignition` | $555 | Includes 1:1, commercial use, full platform |
| Gifting Builder access (trial / friend) | `gifted_builder` | $0 | Marks as gift in audit log |
| Gifting Locked-in access (strategic / collaborator) | `gifted_locked_in` | $0 | Same as above with commercial rights |
| Revoking access (rare — usually let it expire) | `tasting` | n/a | Re-locks UBB and BUILD chip |

**For your own account when you want to dogfood live:** use `ignition` — it gives you the same view a paid Top Talent Business Session client sees, plus commercial rights. (You can switch to `builder` later if you want to QA the lower-tier UX from the inside.)

### 4. Click "Grant"

The form calls the Supabase RPC `set_entitlement_tier(target_email, tier, expires_at, note)`. The RPC:

1. Verifies you're an admin (via `has_role(auth.uid(), 'admin')` — passes because your email is magic-listed)
2. Resolves the email → `game_profiles.id`
3. Updates `game_profiles.entitlement_tier` + `entitlement_granted_at` + `entitlement_granted_by` + `entitlement_expires_at` + `entitlement_note`
4. Inserts an audit row into `entitlement_grants` (immutable trail)
5. Returns `{ profile_id, previous_tier, new_tier, granted_at }`

A success toast confirms with the previous → new tier transition. Errors (user not found, RLS denial, invalid tier) surface as a destructive toast.

### 5. Verify the grant

Two ways:

**(a) The Lookup section** (on the same `/admin` page, above the grant form). Enter the same email, click Lookup, see `tier`, `expires_at`, `note`, `granted_at`. This is the canonical "what tier is this user on right now?" query.

**(b) Tell the user to refresh.** Their next page load will:
- Trigger `useEntitlement()` to refetch `entitlement_tier`
- Update `useDeepProfileActivated()` to `activated: true`
- Make the BUILD chip appear in their SPACES rail
- Unlock JOURNEY item #5
- Allow `/ubb` to render

If their session is already open, they need a fresh navigation (not an HMR refresh) — the hook reads on mount, not on each render.

---

## Common operational moves

### Grant yourself UBB access right now
1. Sign in with `alexanderkonst@gmail.com`
2. Go to `/admin`
3. Entitlement grants form: target email = `alexanderkonst@gmail.com`, tier = `ignition`, note = `"self-grant for dogfooding"`, no expiry
4. Click Grant → reload → BUILD chip appears → click → land on `/ubb` → start building

### Grant a Founders 50 buyer
1. They've paid $197 via Stripe (or manual invoice)
2. Wait for them to sign up (or send them the magic-link flow)
3. `/admin` → grants form: target email, tier = `founders_50`, note = `"founder #N — paid $197 Day X"`, no expiry
4. (Verbally during/after the session) tell them their UBB is live; have them navigate to `/ubb`

### Grant a trial (e.g., 30-day Builder)
1. `/admin` → grants form: target email, tier = `gifted_builder`, expires at = +30 days from today, note = `"30-day trial — <name>"`
2. The cron `revert_expired_entitlement_grants()` (already deployed, see migration `20260428030320_*`) auto-reverts the tier to `tasting` after the expiry date

### Revoke access (rare)
1. `/admin` → grants form: target email, tier = `tasting`, note = `"revoked — <reason>"`
2. Their next page load re-locks UBB and BUILD chip

### Find the audit trail for a single user
Query `entitlement_grants` directly via Supabase SQL editor:
```sql
SELECT * FROM entitlement_grants
WHERE profile_id = (SELECT id FROM game_profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'target@example.com'))
ORDER BY created_at DESC;
```

### Find all Founders 50 buyers
```sql
SELECT u.email, gp.entitlement_granted_at, gp.entitlement_note
FROM game_profiles gp
JOIN auth.users u ON u.id = gp.user_id
WHERE gp.entitlement_tier = 'founders_50'
ORDER BY gp.entitlement_granted_at ASC;
```

---

## What you do NOT have to worry about

- **Account deletion:** if a magic-listed admin (you) deletes the account and signs up again, admin auto-grants on first sign-in via the `on_auth_user_created_grant_admin` trigger.
- **Progress reset:** Settings → Reset Progress does NOT touch `entitlement_tier` (verified in [ProfileSettingsSection.tsx](src/components/settings/ProfileSettingsSection.tsx:624)). Your tier persists across resets.
- **Race conditions on first paint:** `useDeepProfileActivated` waits for `isLoading` to resolve before flipping the gate — no flicker of BUILD-chip-then-hide.
- **Stripe webhooks:** there isn't one yet for `entitlement_tier`. All grants are manual via this admin form. When Stripe webhooks land for the platform tiers, the admin grants form remains the fallback for non-Stripe paths (gifts, founders, manual invoices, comp).

---

## Related artifacts
- Pricing rationale + tier semantics: [alexanders_unique_business.md → Platform Access Pricing v3.0](../02-strategy/unique-businesses/alexanders_unique_business.md#platform-access-pricing-v30--one-time-not-subscription-day-64-may-7-2026)
- Migration that installs the admin email lock: `supabase/migrations/20260515170100_admin_email_lock.sql`
- The hook that gates the UI surfaces: [src/hooks/useDeepProfileActivated.ts](src/hooks/useDeepProfileActivated.ts)
- The hook that exposes raw tier state: [src/hooks/useEntitlement.ts](src/hooks/useEntitlement.ts)
