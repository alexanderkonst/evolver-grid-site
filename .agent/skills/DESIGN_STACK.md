# Design Stack — Adopted Tools

*Four tools for landing page and UI work, installed April 15, 2026. License: MIT-side (this file is practice guidance, not Sasha's corpus).*

---

## 1. UI/UX Pro Max — installed

**Location**: `.agent/skills/ui-ux-pro-max/`
**What it is**: Local skill. 67 styles, 96 palettes, 57 font pairings, 25 chart types, 99 UX guidelines across 13 stacks. MIT licensed.
**How to invoke**: Read `.agent/skills/ui-ux-pro-max/SKILL.md` when planning, building, reviewing, or refactoring UI. The SKILL.md links to data files under `data/` and scripts under `scripts/`.
**When**: Always active as a reference. Read SKILL.md before designing a new surface, choosing a palette, or reviewing existing code for UX issues.
**Reinstall**: `npx --yes uipro-cli init --ai claude`, then move output from `.claude/skills/ui-ux-pro-max/` to `.agent/skills/ui-ux-pro-max/`.

---

## 2. Gemini 3.1 Flash Image Preview (Nano Banana 2) — direct access path

**What it is**: Google's latest image generation / editing model (November 2025). Higher fidelity than Nano Banana 1, better text rendering, better prompt adherence, consistent multi-image editing.
**Official access**: https://aistudio.google.com — "Get started" → select Gemini 3.1 Flash Image Preview. Free tier covers generous daily quota.
**Skip**: Third-party wrappers (infsh and similar) flagged Trust Hub FAIL during verification. Use Google's own surface.
**When to use**:
- Brand-aligned illustrations for the landing page (Bio-Light palette, Pearl #e7e9e5, Violet #8460ea).
- Infographic Episodes — visual production (~60% done, backlog item W8).
- Founder portraits, hero images, module landing visuals.
**Workflow**: Generate in AI Studio → download PNG → place in `public/` or `src/assets/` → reference from components. Alternative: Google's Gemini API if Codex needs programmatic generation.

---

## 3. Stitch — design tool with MCP export

**What it is**: Google's AI design tool at https://stitch.withgoogle.com. 350 free generations/month. Generates full UI mockups from prompts, exports to Figma or straight to Claude Code via MCP.
**Install path for this project**: Stitch's MCP server runs on their side. To connect, generate a design in Stitch → click "Export to Claude Code" → follow their MCP handshake which writes config to `.mcp.json` or `.cursor/mcp.json` at project root.
**Status**: No `.mcp.json` exists yet in this repo. Sasha will add it on first Stitch export, or we can create a placeholder when the first Stitch design is ready to import.
**When to use**:
- Landing page mockups before code (tribe-aligned homepage rebuild).
- Module landing pages (backlog item 23).
- Quick visual exploration of alternatives.
**Alternative for code-first work**: Skip Stitch if the surface is already well-defined — go straight from SKILL.md → component.

---

## 4. 21st.dev — shadcn/ui component registry

**What it is**: Community registry of shadcn/ui-compatible components. Complementary to shadcn/ui (not a duplicate). Richer component library, same install pattern.
**Install pattern**:
```bash
npx shadcn@latest add "https://21st.dev/r/<author>/<component-name>"
```
**When to use**:
- Need a pre-built component that isn't in the base shadcn/ui set (pricing tables, testimonial carousels, hero sections, bento grids).
- The landing page rebuild will likely pull from here for sections that aren't already crystallized in our component library.
**Browse**: https://21st.dev — search by category, preview, copy install command.

---

## Decision tree — which tool for what

- **Planning a new UI surface** → read `ui-ux-pro-max/SKILL.md` first, then either sketch in Stitch or go straight to components.
- **Need a visual asset (illustration, portrait, hero image)** → Gemini 3.1 Flash Image Preview via AI Studio.
- **Need a pre-built component** → 21st.dev first, base shadcn/ui second, custom last.
- **Full landing page mockup before code** → Stitch.
- **Code-first iteration** → skip Stitch, use UI UX Pro Max guidelines + 21st.dev components.

---

*This file is practice guidance, not Sasha's corpus. Lives under `.agent/skills/` per the license boundary.*
