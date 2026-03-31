---
name: webapp-testing
description: Toolkit for testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
---

> **License:** MIT (Anthropic) — This file is supplementary tooling, NOT original methodology.
> **Source:** Adapted from [anthropics/skills/webapp-testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)
> **Boundary:** Alexander's playbooks (`docs/03-playbooks/`) are independently authored under CC BY-NC-SA 4.0 and predate this file. See `LICENSE_BOUNDARY.md` for details.
> **Evolver adaptation:** Configured for Vite dev server on port 5173/5174.

# Web Application Testing

To test local web applications, write native Python Playwright scripts.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start with: npm run dev -- --port 5174
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Example: Testing an Evolver Module

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5174')
    page.wait_for_load_state('networkidle')  # CRITICAL: Wait for JS to execute

    # Navigate to the module under test
    page.click('text=Unique Gift')
    page.wait_for_load_state('networkidle')

    # Capture state
    page.screenshot(path='/tmp/module_test.png', full_page=True)

    # Verify elements
    assert page.locator('h1').count() > 0, "Page should have a heading"

    browser.close()
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

## Common Pitfall

❌ **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

## Best Practices

- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.wait_for_selector()` or `page.wait_for_timeout()`

## Integration with Product Building Workflow

This skill maps to **Phase 4.5 (Verification)** and **Phase 4.6 (AI Self-Test)** of the Integrated Product Building Workflow (`docs/03-playbooks/integrated_product_building_workflow.md`).

Use it to:
- Verify all routes load correctly
- Test all CTAs navigate to expected destinations
- Capture before/after screenshots for polish cycles
- Run automated walkthroughs for proof of work
