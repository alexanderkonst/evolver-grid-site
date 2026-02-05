# Module Polish Workflow

> Audit an existing module against playbook standards and fix issues

---

## Overview

**Purpose:** Iteratively improve modules that are functional but not perfect. This workflow applies a "Build → Use → Audit → Polish" cycle.

**When to use:**
- After initial module build is complete
- When UX feels rough or repetitive
- Before shipping to users

**Token efficiency:** Hybrid approach — code analysis (cheap) + selective browser verification (3 key screens only)

---

## Quick Reference

```
/polish [module-name]

Examples:
/polish onboarding
/polish zone-of-genius
/polish product-builder
```

---

## Phase 1: Code Audit (Token-Efficient)

### Step 1.1: Load Context
Read in this order:
1. Module's product spec: `docs/04-specs/[module]/`
2. Module's code: `src/modules/[module]/` or `src/components/[module]/`
3. Game design principles: `docs/04-specs/game_design_principles.md`

### Step 1.2: Quick Roast Checklist

| Check | Question | Fix If No |
|-------|----------|-----------|
| **Master Result** | Does the flow achieve the promised transformation? | Clarify screens |
| **Screen Count** | Are there unnecessary screens? | Merge or remove |
| **Message Duplication** | Does text repeat across screens? | Consolidate |
| **Magic Buttons** | Do buttons say "what I get" not "what I do"? | Reword CTAs |
| **UX Feeling** | Fast, Clear, Easy, Useful, WOW? | Apply Principle 14 |
| **One Next Action** | Is it obvious what to do on each screen? | Simplify |
| **Visual Hierarchy** | Is the most important thing most visible? | Adjust layout |
| **Unused Props** | Are there props/state no longer needed? | Remove dead code |

### Step 1.3: Generate Fix List
Output concrete fixes with file paths and line numbers.

---

## Phase 2: Implement Fixes

### Step 2.1: Apply Changes
For each identified fix:
1. Make the code change
2. Verify no lint errors

### Step 2.2: Build Check
```bash
npm run build 2>&1 | tail -10
```

---

## Phase 3: Browser Spot-Check (Selective)

**Only verify 3 key moments** — not every screen:

| Checkpoint | What to verify |
|------------|----------------|
| **Entry Point** | Does the module load correctly? |
| **Master Result Screen** | Is the WOW moment delivered? |
| **Exit Transition** | Does it flow to the next step? |

Capture screenshots of these 3 checkpoints only.

---

## Phase 4: Report

### Report Format

```markdown
## [Module Name] Polish Report

### Fixes Applied
- [x] Fix 1: [description] — [file:line]
- [x] Fix 2: [description] — [file:line]

### Remaining Issues (if any)
- [ ] Issue needing discussion

### UX Score
- Fast: ✅/❌
- Clear: ✅/❌  
- Easy: ✅/❌
- Useful: ✅/❌
- WOW: ✅/❌
```

---

## Token Efficiency Guidelines

| DO | DON'T |
|----|-------|
| Read code to understand flow | Click through every screen |
| Make targeted fixes | Generate long reports |
| Spot-check 3 screens max | Re-read playbook if already in context |

---

## Example: Onboarding Polish (2026-02-05)

**Fixes applied:**
- Button text: "Begin Journey" → "Begin My Journey"
- Skip button: small text → full-width ghost button
- Step counter: "Step 4 of 4" → "Final Step"
- Removed unused `hasQol` prop

**UX Score:** Fast ✅ | Clear ✅ | Easy ✅ | Useful ✅ | WOW ✅

---

*Last updated: 2026-02-05*
