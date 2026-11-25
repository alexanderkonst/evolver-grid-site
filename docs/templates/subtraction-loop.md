# Subtraction loop (iterate an interface until it gets out of the way)

*Sasha, 2026-11-24: «Сделай под это шаблон который он де-факто использовал», on Will Wright: «We iterated the Sims interface like 11 times and every iteration we got rid of a few buttons.»*

## Meta-description
- **Level / parent:** L2 · Product & UI · parent: [meta-template.md](./meta-template.md)
- **Lens:** Causal (show → watch → cut → show again) with Ideal Forms (the interface converges on the one form the player already has in their head)
- **Shift carried:** before: an interface grows by adding (one more button, one more hint) · after: it improves by removing, until the player sees the world and not the interface. PST candidate: 115 Articulation Is the Mechanism of Growth (nearest)
- **What emerges:** an interface a first-timer uses in seconds, with fewer parts each round
- **As a part of the whole:** the working loop behind the 3-second test ([GoBY §25.12](../02-strategy/game_of_being_you.md#25-navigation-sasha-2026-11-24)) and [ui_playbook](../03-playbooks/ui_playbook.md) («the ultimate goal of every interface is to become invisible»)
- **Siblings:** [improvement-loop.md](./improvement-loop.md) (the loop for long builds; this one is its UI form), [module-form.md](./module-form.md) §9, [roasting.md](./roasting.md)
- **Status · applied in · last reviewed:** draft v0 · first application: game navigation · 2026-11-24

## Honesty note
Wright never published a method. This loop is reconstructed from what he and his team said, each step traced to a source (dossier `docs/02-strategy/research/navigation/exemplars/rts-sims.md`):
- 11 iterations, each removing buttons (Wright, «Design Plunder»).
- «The digital models running on a computer are only compilers for the mental models users construct in their heads» (Wright 1996, via Don Hopkins): the target is the player's mental model, not the screen.
- Progressive discovery: move → needs → goals (Wright interview): the interface reveals layers as the player is ready.
- Objects advertise themselves («the fridge yells: I can satisfy hunger five!»): the world carries the UI, not menus.
- «SimEarth was too complex, SimAnt too simple, SimCity 2000 just right»: a sweet spot between, found by trying.

## The loop (one round)
1. **Name the one model** the player should hold in their head after 3 seconds (for navigation: where am I, next move, home). One sentence.
2. **Put it in front of a first-timer.** Real person, no explanation. Watch, don't help. 3–5 people a round.
3. **Mark every moment of friction**: hesitation, a wrong tap, a question, a glance at something that doesn't matter.
4. **For each element on the screen ask: does it build the model?** If not, cut it. If the world itself can carry it (the object advertises, the place glows), move it into the world and cut the control.
5. **Add only what a cut broke**, and only as the smallest signal (one line, one glow), never a new panel.
6. **Count:** elements on screen before and after; first-timers passing the 3-second test before and after. Log both below.
7. **Repeat** until a round removes nothing and 4 of 5 pass. Then stop: too simple is also a failure (SimAnt), so a round that strips the game of choice gets rolled back.

## Rules
- Each round must remove at least one thing, or it is not a round of this loop.
- Never cut the one next move, the way home, or the «Opens when … Inside: …» line; they are the model.
- Reveal in layers: what a first-timer doesn't need yet appears when they are ready, not before.
- Cuts are decided by watching people, not by taste.

## Log
| Round | Screen | Elements before → after | 3-second test before → after | What was cut / moved into the world |
|---|---|---|---|---|
