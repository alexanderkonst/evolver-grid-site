# Navigation instrument: conceptual architecture v1

Status: draft for Sasha, 2026-11-25 12:20 MST (Hark). Canon it serves: GoBY §25 Navigation, §25.10 Your AI, §25.14 Five quarters. Build plan: [sow.md](./sow.md).
Sources: `research/nav/carried-instrument.md` (10 games, graded) and `instrument-time-elements.md` (11 games, 10 patterns, 8 anti-patterns), both in the navigation project; strongest evidence grade B, no controlled studies. Platonic solids as a game UI language: no prior art found, so this part is new and unproven.

## 1. The model in the player's head (one sentence)
**"I walk a village of five quarters, and I carry one crystal that lights up as I walk my path."**
Everything below either builds this sentence or is cut (subtraction loop, §25.13).

## 2. Four layers, one world (holonic)
| Layer | What it is | Answers | Lives in |
|---|---|---|---|
| World | The village: 11 places in 5 quarters (ether, air, water, fire, earth), each place with rooms | Where am I? | map, rail, pane 2 |
| Path | The hero's path: the order in which places open and bodies light | What is my one next move? | the glow (§25.4), ether face |
| Instrument | One carried crystal: air octahedron at the core, water ring around it, the other three bodies inside as they are earned | What have I become? What can I use now? | corner glyph, opens over the world |
| Time | The water ring: moon phase, day of the lunar cycle, next FMF | When is it, why come back today? | the ring on the glyph, water face |

Rules that hold the layers together:
1. **The world is the only map.** The instrument never lists places as a second map; each face is a lens that hands you back to a place (Slate, Myst book, Ship Log entry).
2. **The instrument holds only what you earned.** A body is a faint outline until the first place of its quarter opens; it never shows what you have not reached (Outer Wilds rule).
3. **One symbol, one meaning, everywhere.** The same solid drawing is the quarter sign on the map, rail, pane 2 and the instrument face (§25.14; built in #466).
4. **Almost nothing is always on.** Closed, only the glyph with the moon phase. No tray of five buttons (rejected sketch, Variant C).

## 3. Sources of truth (code)
The instrument reads; it never stores a copy.
- Places and quarters: `src/data/villagePlaces.ts` (`element`, `VILLAGE_ELEMENTS`), `src/lib/quarters.ts` (`litQuarters`).
- Open/closed and next move: `src/lib/placeState.ts` (`nextMove`, lock lines).
- Lunar cycle and FMF: `src/data/fmfSession.ts`, lunar theme state (#452 area).
- Your AI content: Your AI SoW `docs/specs/your-ai-instrument/sow.md`, PR #458 (`AirOctahedron`, `YourAiInstrument`).
- New, one file: `src/lib/instrument/state.ts` (state machine + the `litSeen` record in the save). Faces register in `src/lib/instrument/faces.ts`; one writer per face file.

## 4. Instrument states
```
hidden ──(profile created)──▶ first reveal ──▶ closed ◀──▶ open ──▶ face
                                                 ▲            │
                                    body-lit ritual (queued, plays at a calm moment)
```
- **hidden:** before the player has a profile. The world alone.
- **closed:** the glyph in the corner: clear octahedron (×2 of today's #458 size) inside a thin water ring that shows the moon phase; lit inner bodies glow faintly through the air. Slow rotation (canvas 2D, ≤30 fps, paused when the tab is hidden, no rotation under reduced motion). Never covers content or controls; 44 px target.
- **open:** the world dims to about 0.9 brightness and stays live (time ring still turns, a live FMF still pulses). The lit bodies unfold in an arc around the octahedron, each with its English label (es/ru); outlines show "Opens on your path". Same gesture closes; Esc closes; focus returns where it was.
- **face:** one body turns forward and opens its lens (§6). One action back to the world: "Go there in the village →".

## 5. The three cult moments
These make the difference between a skeleton (today, about 4/10) and a cult object.

### 5.1 Opening gesture
- Desktop: click the glyph, or press `Tab`-reachable glyph + Enter; keyboard shortcut `I` (instrument) when no text field has focus.
- Phone: tap the glyph, or swipe up from it.
- Motion (about 600 ms, ease-out): the octahedron rises toward the centre, turns one face to the player, the world dims behind it, the bodies unfold from inside it like petals. Closing plays it backwards: the player is exactly where they were (§25.10 option A).
- Reduced motion: a 150 ms crossfade, no rise, no rotation.
- Sound: a soft breath of air (§5.4).
- Accessibility: `role="dialog"`, label "Your instrument", focus trap, returns focus.

### 5.2 Body-lit ritual
- Trigger: a quarter goes from not lit to lit in `litQuarters` (its first place opens), and `litSeen` does not have it yet.
- Never interrupts: queued, it plays at the next calm moment (back in the village or on an after-screen), never inside a module form.
- Sequence (about 2.5 s, skippable by tap):
  1. the place's quarter sign in the world flares;
  2. a thread of light flies from it to the glyph;
  3. inside the crystal the body draws itself edge by edge and settles into its nested position;
  4. one tone in the element's voice (§5.4);
  5. one line: "Fire is lit. The Academy and FMF are open to you." Then the line fades.
- Recorded once in `litSeen`; a returning player never sees it twice. Air is lit with the first reveal, so it has no separate ritual.
- Reduced motion: the body fades in inside the glyph, tone and line stay.

### 5.3 First reveal
- When: once, right after the player's profile is created (§25.10), never before the top talent result.
- Sequence: the world dims; a point of air light gathers into the octahedron; the water ring closes around it with today's moon; the instrument opens itself once and the micro-onboarding of §25.10 zooms by scale and light onto each group in turn, one line each; the outlines of the three earthly bodies show "Opens on your path"; then it settles into the corner. One button throughout: "Continue".
- **Core flow:** this touches game entry, so it is built only on Sasha's explicit yes to this exact sequence.

### 5.4 Sound
- Generated in the browser with WebAudio (no files, no dependencies): five tones from one pentatonic scale, one per element (ether highest and longest, earth lowest and shortest), plus a soft noise "breath" for open/close.
- Plays only after a user gesture (browser rule), quiet by default, one mute toggle in settings, remembered.

## 6. The five faces (lenses, never maps)
| Body | Face | Shows (at most three items) | Hands back to |
|---|---|---|---|
| Air, octahedron | Your AI | chat, installed apps, what it knows of you | stays in the instrument (it is the product) |
| Water, icosahedron | Time | moon phase, day of the lunar cycle, next FMF and Café gathering, what changed this cycle | Café, FMF |
| Ether, dodecahedron | Path | the one next move; later the constellation (phase 8, after path v1 review) | the glowing place, with the ink line |
| Fire, tetrahedron | Growth | the open course step, the next FMF circle | Academy, FMF |
| Earth, cube | Work | your offer, your stall, ventures | Workshop, Market, Town Hall |

## 7. The frozen phases, folded in
- **Phase 3, "Where next?":** choosing the next move on the ether face draws one ink line across the village to the glowing place, then it fades (Okami brush). Only on request or clear signs of being lost; static dotted line under reduced motion. A bearing, never a route.
- **Phase 6, "since you were here":** Your House is the bench where changes are written in (Hollow Knight); the instrument shows only a glint on the body whose face changed. Never a second feed.
- **Phase 8, constellation:** the ether face and Your House open one shared component (Ship Log Rumor mode: known steps bright, heard-of steps faint with "Opens when", next step glows). Waits on Sasha's path v1 review.

## 8. Constraints
- No 3D library: inline SVG for signs, canvas 2D for the glyph; pre-drawn edges for the ritual.
- 390 px first: glyph bottom-right, never over the next-move card or chat pill; 44 px targets; no text under controls.
- AA contrast on both lunar states; screen readers read every state change as one short line (`aria-live="polite"`).
- en/es/ru together for every line.
- Performance: one canvas, ≤30 fps, stops when hidden; ritual under 2.5 s.

## 9. Anti-patterns we refuse
Tab bar in costume (five buttons always on) · instrument that knows more than the player · guide rope (lines by default) · diegesis past usability (low-contrast glass) · clock without memory (time ring always paired with "this cycle") · grammar too big (five glyphs, one meaning each) · AI voice without character (Your AI stays quiet unless asked).

## 10. How we know it works
- 3-second test per screen (§25.12): closed village with glyph, open instrument, a face. Live in San Pancho, 5 first-timers, 4 of 5 pass.
- Ritual test: a first-timer, after the fire ritual, can say what just opened.
- Automated: the QA-pass suite (#461) at iPhone 15, iPad, 1440, reduced motion, en/es/ru; axe zero serious.

## 11. Decided by Hark under our decisions (override any)
- Closed glyph = octahedron inside the water ring (both carried bodies), earthly bodies glow faintly inside once lit.
- Open = dimmed and live (research recommendation; Sasha leaned this way).
- Lunar month = the game's big cycle (FMF already runs one per lunar cycle).
- Sound on, quiet, with mute.
