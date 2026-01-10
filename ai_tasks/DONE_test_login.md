# Task: Add Test Login Mode

**Assigned to:** Codex  
**Priority:** Medium  
**Created:** 2026-01-10

---

## Context

For UI testing without real accounts, we need a test login button that creates a temporary session.

---

## What to Build

### Modify `src/pages/Login.tsx`

Add a "Test Login" button below the regular login form:

```tsx
const handleTestLogin = async () => {
  // Sign in with test credentials
  const { error } = await supabase.auth.signInWithPassword({
    email: 'test@evolvergrid.test',
    password: 'testpassword123'
  });
  
  if (!error) {
    navigate('/game');
  }
};

// In the JSX, after the main login button:
{process.env.NODE_ENV === 'development' && (
  <Button 
    variant="outline" 
    onClick={handleTestLogin}
    className="w-full mt-4"
  >
    Test Login (Dev Only)
  </Button>
)}
```

### Create test user in Supabase

Run this SQL in Supabase:
```sql
-- Create test user (do this manually in Supabase Auth dashboard)
-- Email: test@evolvergrid.test
-- Password: testpassword123
```

---

## Success Criteria

- [ ] Test Login button visible only in dev mode
- [ ] Clicking it logs in and navigates to /game
- [ ] Works without real email verification

---

## When Done

Rename this file to `DONE_test_login.md`
