---
description: Run comprehensive UX/UI audit of the live site using browser automation
---

# UX Audit Workflow

// turbo-all

## Steps

1. Navigate to https://evolver-grid-site.vercel.app and capture landing page state

2. Test onboarding flow:
   - Go to `/start`
   - Check if sidebar is visible (should NOT be)
   - Try clicking "Start" button
   - Document where it leads

3. Test Zone of Genius flow:
   - Go to `/zone-of-genius/entry`
   - Check if sidebar is visible (should NOT be)
   - Verify AI check options work

4. Test game routes:
   - Go to `/game`
   - Document sidebar structure
   - Check for broken links (404s)
   - Verify all spaces are accessible

5. Test profile:
   - Go to `/game/profile`
   - Check if content loads for anonymous user
   - Document any auth walls

6. Create audit report:
   - List all issues found
   - Categorize by severity (Critical/Medium/Low)
   - Create task files for each issue

## Output

Audit results saved to:
- `walkthrough.md` (summary)
- `ai_tasks/PENDING_*.md` (individual tasks)

## Usage

Run this workflow with: `/ux-audit`

The agent will automatically navigate the site and document all issues without asking for permission.
