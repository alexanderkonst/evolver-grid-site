---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when building web components, pages, artifacts, posters, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

> **License:** MIT (Anthropic) — This file is supplementary tooling, NOT original methodology.
> **Source:** Adapted from [anthropics/skills/frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
> **Boundary:** Alexander's playbooks (`docs/03-playbooks/`) are independently authored under CC BY-NC-SA 4.0 and predate this file. See `LICENSE_BOUNDARY.md` for details.
> **Evolver adaptation:** Integrated with our Bio-Light aesthetic, Pearl Mode, and design token system.

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. For Evolver platform work, default to **Bio-Light / Pearl Mode** (see brandbook).
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. For Evolver: `Cormorant Garamond` (display) + `DM Sans` (body). For external pages: unexpected, characterful font choices that pair a distinctive display font with a refined body font. NEVER use generic fonts like Arial, Inter, or Roboto.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. For Evolver: see `docs/03-playbooks/ui_playbook.md` Part VI design tokens. For external pages: dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise. Respect `prefers-reduced-motion`.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures: gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliché color schemes (particularly purple gradients on white backgrounds), predictable layouts, and cookie-cutter design.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

## Evolver-Specific Standards

When building for the Evolver platform:

1. **Read the UI Playbook** (`docs/03-playbooks/ui_playbook.md`) — the authoritative design reference
2. **Use design tokens** from Part VI (JSON format) — no hardcoded values
3. **Use premium components**: `PremiumCard`, `PremiumButton`, `HeroIcon`, `PremiumLoader`
4. **Apply breathing UI effects**: `alive-card`, `breathing-card`, `aurora-gradient`, `aurora-text`
5. **Follow the CSS Variable Override Trap rules** for components inside GameShell
6. **Color**: Never pure black. Use `#2c3150` for text, `rgba(44,49,80,0.7)` for body
7. **Glass morphism**: `bg-white/85 backdrop-blur-sm` for card surfaces

When building external pages (landing pages, marketing):

1. **Break free** from the platform aesthetic — each page should feel unique to the founder it represents
2. **Match the founder's energy** — Oyi's page feels different from Sergey's
3. **Conversion-focused** — Clear hero, pain section, promise, social proof, CTA
