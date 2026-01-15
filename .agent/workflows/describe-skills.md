---
description: Create or update skill documentation based on project context
---

# Describe Skills Workflow

Use this workflow when creating new skills or updating existing skill documentation.

## Context Sources

Before writing skill documentation, review these sources:

1. **Vision & Strategy**
   - `docs/vision.md` — Core thesis, planetary synapse concept
   - `docs/evolutionary_avantgarde_taxonomy.md` — 6 currents, subcultures
   - `docs/project_synthesis.md` — Full architecture, user journey

2. **Technical Reference**
   - `docs/ui_skills.md` — UI implementation standards
   - `README.md` — Quick start, architecture overview

3. **Knowledge Items (if available)**
   - Check `/Users/alexanderkonst/.gemini/antigravity/knowledge/` for distilled context

## Skill Documentation Format

```markdown
---
description: [One-line description of what this skill does]
---

# [Skill Name]

## Purpose
[Why this skill exists and when to use it]

## Context
[Key concepts from project documentation relevant to this skill]

## Instructions
[Step-by-step instructions for completing the skill]

## Examples
[Concrete examples of skill usage]

## Reference Files
[Links to relevant source files or documentation]
```

## Key Concepts to Include

When describing skills for this project, always consider:

1. **Evolutionary Avantgarde** — 6 currents: Sovereignty, Innovation, Regeneration, Awakening, Rooting, Creation
2. **Planetary Synapse** — Completing circuits between complementary geniuses
3. **Genius Resonance** — 4th coordination mechanism (fast, generative, fractal)
4. **Wabi-sabi + Apple Industrial** — Design aesthetic (pearl bg, violet accents)
5. **Self-First, Then Others** — User journey principle
6. **One-Screen Viewport** — UI constraint
7. **GameShellV2** — Standard page wrapper

## Verification

After creating a skill:
1. Read the skill file to verify formatting
2. Ensure all referenced files exist
3. Test any scripts included in the skill
