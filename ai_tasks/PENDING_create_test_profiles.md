# Task: Create Test Profiles in Supabase

**Assigned to:** Lovable  
**Priority:** Critical  
**Created:** 2026-01-11

---

## Context

Need 3 test profiles with full data for testing matchmaking. Data is in `docs/seed_test_profiles.md`.

---

## What to Do

Create 3 users in Supabase with their Appleseed and Excalibur data.

**IMPORTANT:** Do NOT send any emails to these users.

### Profiles

| Name | Email | Password |
|------|-------|----------|
| Karime Kuri | karimekurit@gmail.com | dclk109252 |
| Tracey Abbott | tracey@onpurposeleadership.co | dclk109252 |
| Tylor Middlestadt | info@ipd2group.com | dclk109252 |

### Steps

1. Create Auth user for each email/password
2. Create game_profile linked to user
3. Set first_name, last_name
4. Populate appleseed_data JSONB from seed file
5. Populate excalibur_data JSONB from seed file

---

## Reference

See `docs/seed_test_profiles.md` for complete JSON data.

---

## When Done

Rename to `DONE_create_test_profiles.md`
