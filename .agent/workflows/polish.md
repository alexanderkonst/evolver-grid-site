---
description: Polish a module by auditing against playbook and fixing issues
---

# /polish — Module Polish Workflow

> Audit an existing module against playbook standards and fix issues

## Prerequisites
- Module must be built and functional
- Dev server running (`npm run dev`)

## Usage
```
/polish [module-name]
```

Example: `/polish onboarding` or `/polish zone-of-genius`

---

## Phase 1: Code Audit (Token-Efficient)

### Step 1.1: Load Context
Read the following in this order:
1. Module's product spec: `docs/04-specs/[module]/` or similar
2. Module's code: `src/modules/[module]/` or `src/components/[module]/`
3. Game design principles: `docs/04-specs/game_design_principles.md`

### Step 1.2: Quick Roast Checklist
Evaluate against these criteria:

| Check | Question | Fix If No |
|-------|----------|-----------|
| **Master Result** | Does the flow achieve the promised transformation? | Clarify screens |
| **Screen Count** | Are there unnecessary screens? | Merge or remove |
| **Message Duplication** | Does text repeat across screens? | Consolidate |
| **Magic Buttons** | Do buttons say "what I get" not "what I do"? | Reword CTAs |
| **UX Feeling** | Fast, Clear, Easy, Useful, WOW? | Apply Principle 14 |
| **One Next Action** | Is it obvious what to do on each screen? | Simplify |
| **Visual Hierarchy** | Is the most important thing most visible? | Adjust layout |

### Step 1.3: Generate Fix List
Output a concrete list of fixes with file paths and line numbers.

---

## Phase 2: Implement Fixes

### Step 2.1: Apply Changes
// turbo-all
For each fix identified:
1. Make the code change
2. Run build to verify no errors

### Step 2.2: Build Check
// turbo
```bash
npm run build 2>&1 | tail -10
```

---

## Phase 3: Browser Spot-Check (Selective)

Only verify 3 key moments — not every screen:

### Step 3.1: Critical Checkpoints
1. **Entry Point** — Does the module load correctly?
2. **Master Result Screen** — Is the WOW moment delivered?
3. **Exit Transition** — Does it flow to the next step?

### Step 3.2: Capture Evidence
Take screenshots of the 3 checkpoints. Note any visual issues.

---

## Phase 4: Report

### Output Format
```markdown
## [Module Name] Polish Report

### Fixes Applied
- [x] Fix 1: [description] — [file:line]
- [x] Fix 2: [description] — [file:line]

### Before/After (if visual changes)
- Screenshot: [checkpoint name]

### Remaining Issues (if any)
- [ ] Issue needing user input

### UX Score
- Fast: ✅/❌
- Clear: ✅/❌
- Easy: ✅/❌
- Useful: ✅/❌
- WOW: ✅/❌
```

---

## Token Efficiency Notes

- **DO:** Read code to understand flow (cheap)
- **DO:** Make targeted fixes (cheap)
- **DO:** Spot-check 3 screens max (medium)
- **DON'T:** Click through every screen (expensive)
- **DON'T:** Generate long reports (expensive)
- **DON'T:** Re-read playbook if already in context (expensive)

---

*Created: 2026-02-05*
