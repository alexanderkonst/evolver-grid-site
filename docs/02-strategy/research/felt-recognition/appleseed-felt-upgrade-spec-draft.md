# Spec draft: Appleseed felt upgrade (catch the feeling at the reveal)

Template: spec-handoff (draft) · Version: v0 · 2026-11-27 · Status: **parked** (Sasha 2026-11-27 14:54 MST: «нет! Рано идти в мысли про экран. Сначала пиши технологию»). Kept only as a record; screens come later, from the technology. The top talent reveal is a core flow: nothing here is built without Sasha's yes to the exact change. Source: [synthesis](./synthesis.md), [technology draft](./caught-recognition-technology-draft.md).

## Why
Today the reveal shows the phrase, three talents and the top shadow, then one 1–10 «How much does this sound like you?» (one number, not logged to `resonance_events`). The feeling itself, the part Sasha calls priceless, is never caught, kept, re-met or used.

## What the player sees (proposal)
1. **Reveal as now** (phrase, talents, shadow). No change to generation.
2. **A quiet beat** (~3 s) after the shadow appears: no buttons move in.
3. **«Where did that land?»** A simple body silhouette; one tap (head, throat, chest, belly, whole body, «nowhere»). «Nowhere» is a valid answer and is kept.
4. **«A word or image for it, yours.»** Optional single field; placeholder in the player's language, never a suggested word.
5. **Two dials** (from the sessions): «How much is this you?» 1–10 for the phrase (the current rating, moved here) and «How much charge does the shadow carry?» 0–10.
6. **Calm end and token:** the word (or the body place) appears on the character card as «your tuning fork». Then the existing next step.
7. **Next visit, once:** «Remember [word]? Is it here now?» (yes / a little / no / deeper). Never a notification outside the game.
8. **Later, in the game:** before choosing a quest or an offer, an optional «check with [word]».

## Data
`resonance_events` rows: reveal_body_place, reveal_word, gift_resonance (1–10), shadow_charge (0–10), reevoke_answer, reevoke_at. Private to the player; shown only to them.

## Guards
Consent line before the reveal (PST 125). No pre-filled words. Skip always available. No paid AI call added. The word is never used in marketing or shared without the player's own share action (PST 56).

## DoD (when approved)
- The five moves work at 390 / 768 / 1440, reduced motion, en/es/ru; axe zero serious.
- A Playwright spec per step; `generate-*` blocked in tests.
- E0 felt layer readable from data: caught rate, re-evoke rate, same-or-deeper rate.
- Fix the quiz term clash: the «recognition» answer maps to holomap stage 3; rename or remap (separate issue).

## Questions for Sasha
1. Yes to steps 2–6 on the reveal screen as written (core flow)?
2. Steps 7–8 now or after the first data?
3. Name for the token: «tuning fork» / «камертон» / other?
