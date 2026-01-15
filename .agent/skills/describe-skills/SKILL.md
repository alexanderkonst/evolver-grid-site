---
name: describe-skills
description: Creates or updates skill documentation using project context and Antigravity skill standards. Use when building new skills or improving existing skill SKILL.md files.
---

# Describe Skills

This skill helps create well-structured skill documentation for the Planetary OS project.

## When to use this skill

- Creating a new skill from scratch
- Updating existing skill documentation
- Converting informal instructions into proper skill format

## Context Sources

Before writing skill documentation, review these project sources:

| Source | Purpose |
|--------|---------|
| `docs/vision.md` | Core thesis, planetary synapse concept |
| `docs/evolutionary_avantgarde_taxonomy.md` | 6 currents, subcultures |
| `docs/project_synthesis.md` | Full architecture, user journey |
| `docs/ui_skills.md` | UI implementation standards |

## Skill Folder Structure

```
.agent/skills/my-skill/
├── SKILL.md       # Main instructions (required)
├── scripts/       # Helper scripts (optional)
├── examples/      # Reference implementations (optional)
└── resources/     # Templates and other assets (optional)
```

## SKILL.md Template

```markdown
---
name: skill-name
description: Third-person description with keywords. Use when doing X or Y.
---

# Skill Name

Brief overview of what this skill accomplishes.

## When to use this skill

- Use this when...
- This is helpful for...

## How to use it

Step-by-step guidance, conventions, and patterns.

## Decision Tree

If complex decisions needed:
- Condition A → Approach X
- Condition B → Approach Y

## Reference Files

- `path/to/relevant/file.ts`
```

## Key Concepts for This Project

Always consider these when writing skills:

| Concept | Description |
|---------|-------------|
| **6 Currents** | Sovereignty, Innovation, Regeneration, Awakening, Rooting, Creation |
| **Planetary Synapse** | Completing circuits between complementary geniuses |
| **Genius Resonance** | 4th coordination mechanism (fast, generative, fractal) |
| **Wabi-sabi + Apple Industrial** | Design aesthetic (pearl bg `#e7e9e5`, violet `#8460ea`) |
| **GameShellV2** | Standard page wrapper for all game pages |
| **One-Screen Viewport** | UI constraint — no scrolling for core content |

## Best Practices

1. **Keep descriptions specific** — Include keywords the agent will recognize
2. **Write in third person** — "Generates tests" not "I generate tests"
3. **Include decision trees** — For complex skills with branching logic
4. **Use scripts as black boxes** — Agent runs `--help` first, not read source
5. **Focus on one thing** — Separate skills for distinct tasks

## Verification Checklist

After creating a skill:
- [ ] YAML frontmatter has `name` and `description`
- [ ] Description is third-person with keywords
- [ ] Instructions are step-by-step
- [ ] Referenced files exist
- [ ] Any scripts are executable
