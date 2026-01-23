---
description: Generate a Feature Requirement Document (FReD) before implementing new features
---

# Feature Workflow

**When to use:** Before implementing any new feature or functionality.

## Steps

1. **Create FReD document** in `ai_tasks/features/`
   - Filename: `FEATURE_[name].md`

2. **Fill in template** (see below)

3. **Review with human** before implementation

4. **Implement** following the FReD

5. **Mark complete** when acceptance criteria pass

---

## FReD Template

```markdown
# Feature: [Short, descriptive title]

## Goal
What problem does this feature solve? Why does it exist?

## Result It Delivers
Link back to the Playbook result this implements.
(Result = what user GETS. Feature = how we deliver it.)

## User Story
As a [user type], I want to [goal], so that I can [benefit].

## Functional Requirements
List core behaviors the feature must support. Be specific and measurable.
- [ ] Behavior 1
- [ ] Behavior 2
- [ ] Behavior 3

## Data Requirements
What new tables, fields, or relationships are needed?
- New: [tables/fields]
- Reused: [existing data]

## User Flow
1. User does X
2. System responds with Y
3. User sees Z
4. User clicks [Magic Button]
5. Result is delivered

## Acceptance Criteria
Clear conditions defining when this feature is "done":
- [ ] Condition 1
- [ ] Condition 2
- [ ] Condition 3

## Edge Cases
- What if user skips?
- What if data is missing?
- What if load fails?

## Non-Functional Requirements (Optional)
- Performance: [constraints]
- Security: [constraints]
- UX: [constraints]
```

---

## Why This Matters

The Playbook operates in **Results**. Features are derived from Results at build time.

| Concept | Definition |
|---------|------------|
| **Result** | Transformation the user receives (what user GETS) |
| **Feature** | Capability the product has (what product DOES) |

Features are implementation. Results are value.

---

## Reference

- See `docs/ux_playbook.md` Part 15 for full context
- See `docs/one_button_product_builder.md` for meta-product overview
