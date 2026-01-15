# First-time User Welcome Toast

> **Status**: PENDING  
> **Agent**: CLAUDE  
> **Priority**: Low

## Objective
Show a warm welcome toast when user completes signup for the first time.

## Approach
1. Check if this is first login after signup
2. Show personalized welcome message with first name
3. Use Wabi-sabi styled toast

## Files to Modify
- `/src/components/auth/SignupModal.tsx` - Add welcome toast after signup

## Acceptance Criteria
- [ ] Welcome toast shows on first signup
- [ ] Includes user's first name
- [ ] Wabi-sabi styling
