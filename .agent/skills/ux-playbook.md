---
description: First-principles UX/UI design for building screens and interfaces
---

# UX Playbook Skill

Use this skill when designing screens, user flows, or evaluating UI decisions.

## The First Principles Chain

**User Journey → Screens → Interface → Bridge to Reality**

Every screen exists to deliver a result. The result defines the journey. The journey defines the screens.

## The Magic Button

> The evolutionary goal of every product is to become ONE BUTTON.

Ask: "If this screen could be one button, what would it do?"

- Button text = the RESULT the user gets
- Bad: "Submit", "Next", "Continue"
- Good: "Discover My Genius", "Find My People", "Start Growing"

## Screen Types

| Type | Purpose | Example |
|------|---------|---------|
| Start Screen | Promise + Magic Button | "Who are you, really?" + [Discover My Genius] |
| Process Screen | Progress toward result | Assessment steps with progress bar |
| End Screen | Result + Value + Next Step | "You are a [Archetype]" + [Start Growing] |

## Six Dimensions of a Screen

1. **Data Output** — What information is displayed
2. **Data Input** — What information is collected
3. **Backend Program** — What computation happens
4. **Harmony** — Visual and experiential balance
5. **Relationships** — How elements relate to each other
6. **Function** — What the screen achieves

## Navigation Elements

| Element | When to Use |
|---------|-------------|
| Back | Always (except first screen) |
| Skip | Optional steps during onboarding |
| Save | During multi-step assessments |
| Progress Bar | Multi-step flows (calms the user) |

## AI-Assisted Design Hacks

### 1. Mockup-First Development

Generate a UI mockup **before writing code**. This allows:
- User provides precise visual feedback
- Iterate on design with zero code changes
- Only generate code after design approval

**Workflow:** Describe screen → Generate mockup → Get feedback → Iterate → Then code

### 2. Architecture Diagrams

Generate easy-to-understand system or architecture diagrams to:
- Explain existing code visually
- Document complex knowledge
- Communicate structure before building

Use `generate_image` for clean, labeled diagrams with text rendering.

### 3. Custom Asset Generation

Generate highly relevant image assets for websites instead of stock photos:
- Hero images that match the exact vibe
- Icons and illustrations tailored to content
- Background patterns and textures

**Benefit:** Perfect fit, no licensing issues, unique brand identity.

## Source Document

Full specification: `docs/ux_playbook.md`

