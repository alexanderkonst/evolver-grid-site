# Prompt Registry

This document is the single entry point for all AI prompts used in the app. If you need to update, review, or extend a prompt, start here.

## Source of Truth

**Frontend prompts** live in `src/prompts/`, split by intent:

- User-run prompts: `src/prompts/user/`
  - `src/prompts/user/missionDiscoveryPrompt.ts`
  - `src/prompts/user/zoneOfGeniusPrompt.ts`
  - `src/prompts/user/geniusOfferPrompts.ts`
- Extraction/system prompts: `src/prompts/extraction/`
  - `src/prompts/extraction/assetMappingPrompt.ts`

These are re-exported from `src/prompts/index.ts` and imported by UI screens.

**Backend prompts** (edge functions) live in:

- `supabase/functions/_shared/prompts.ts`

This keeps mission-matching copy in version control alongside the function that uses it.

## Update Process

1. Edit the prompt in its source file.
2. Keep outputs strict (JSON when required) and explicitly name required fields.
3. Avoid changing output structure unless the parsing code is updated in the same PR.
4. If you update the mission-matching prompt, redeploy the `match-missions` edge function.

## Source of Truth (No Duplication)

The **code prompts are the source of truth**. This doc is an index and guidelines only.
If you update a prompt, update only the source file; this doc should not repeat prompt text.

## Conventions

- Use ASCII only.
- Keep prompts explicit about required fields and output formats.
- Prefer short, structured instructions over verbose narrative.
