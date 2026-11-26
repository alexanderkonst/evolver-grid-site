# Biologic Clock (spec v1)

Sasha, 2026-11-21 16:35 MST: «чисто как часы персональные биологические, на основании движка эквилибриума, на основном игровом экране». Decided design: **mockup v5**, Sasha 2026-11-22 11:47 MST «А вот это уже хорошо! Делаем!».
Mockup v5 (real engine values for Sasha, Sun 2026-11-22 ~11:15 MST: Waxing Gibbous, Full Moon Tue 2026-11-24 08:25 Mazatlán; Sunday): [village, desktop](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v5-village.jpg) · [phone 390 px](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v5-mobile.jpg). Static, not in code.

## What it is
A personal biological clock: in 5 seconds the player feels **where they are in their cycles**, not in time («время — это на самом деле циклы»). For each rhythm: the current phase, its symbol and its meaning, the previous and next phase, and (for the moon) how long until the next phase.

## Rules
- Not tied to actions. The clock shows cycles and their energy, never progress, scores or streaks.
- One engine: `src/lib/equilibrium-cycles` via `useCycles` / `getAllCyclesV2(now, birthday)`. No second calculation.
- Reuse Equilibrium first: `CycleEnergyBar` already carries the model (orbs, prev / current / next labels); `MoonOrb` draws the real moon per phase; `formatPhaseEndsAt` / `daysRemainingInPhase` give the time to the next phase.
- Every phase has two things: a **symbol** (what it looks like) and **information** (what it means).
- No mechanical clock time on the clock (it should not hurry anyone). No moon in the centre. No Do now.
- 5-second test without a legend before any UI change ships.

## Default view: two rings (Moon, Week)
| Ring | Phases | Symbol | Information |
|---|---|---|---|
| Moon (outer) | 8, New Moon at top, clockwise | the real moon of each phase (`MoonOrb`) | `MOON_PHASES[i].energy`: first word = phase word, the rest = meaning line |
| Week (inner) | 7, Monday at top, clockwise | the planet as a photo (table below); the chakra colour on the ring track | `PLANETARY_DAYS[i]`: first word of `energy` = day word, `description` = meaning line |

Drawing (one grammar for both rings):
- A thin track per ring. Moon: a light arc from the top to now (`lunar.progress`). Week: 7 track segments in the chakra colours, today's bright and thicker, others ~35%.
- Moon orbs up to the current phase lit, later ones dim. Planets ~75%, today's full.
- The current orb is larger, with a soft glow (moon: warm white; week: today's chakra colour).
- Centre: two words, the moon phase word (large serif) over the day word (smaller).
- Three views, one tap cycles them (Sasha 2026-11-22 14:49): **1 dial only** (default: the two rings + the two centre words, no text) → **2 dial + text** (the readout below, one block per ring: `prev symbol + word › CURRENT (bold) › next`; phase name; meaning line; Moon only: «Full Moon in 1 d 21 h»; Week shows no time left; on the village the Moon Focus line sits here) → **3 + Year and day** (adds Year as the outer ring, 4 seasons birthday to birthday: `SOLAR_HOLONIC` Seeding, Sprouting, Fruiting, Harvest, no birthday → `BirthdayPrompt`; the part of the day as a thin gold arc; their readout blocks in the same grammar) → tap again → back to 1. Tap target: the dial itself, plus one small round control under it (`+` in views 1–2, `−` in view 3) with aria-label naming the next view. Last view remembered (localStorage). Still no clock time.

## Week: planets and chakras (Sasha 2026-11-21)
| Day | Planet (photo) | Chakra | Colour |
|---|---|---|---|
| Monday | Moon | Third eye | indigo #5b4fc4 |
| Tuesday | Mars | Root | red #c9483c |
| Wednesday | Mercury | Throat | blue #3f84d0 |
| Thursday | Jupiter | Crown | violet #9a62d6 |
| Friday | Venus | Sacral | orange #e48a3c |
| Saturday | Saturn | Solar plexus | yellow #e8c447 |
| Sunday | Sun | Heart | green #4fb06e |

Planet images: `public/assets/equilibrium/planets/{moon,mars,mercury,jupiter,venus,saturn,sun}.png` (240 px, transparent background). Sources: NASA / ESA public domain via Wikimedia Commons (Mars: OSIRIS true colour; Mercury: «Mercury in true color»; Jupiter: Hubble 2014 full disc; Venus: «Venus globe»; Saturn: Hubble natural colour); Moon and Sun from `public/assets/equilibrium/`. Saturn's rings make its disc small: draw it ~1.7× the other planets' size.

## Words (engine copy; also changes Equilibrium)
- Waxing Gibbous: `Leading` → **`Readying`** («готовить к жатве»): energy `Readying · Prep for harvest · Set up infrastructure · Get the help`.
- Waxing Gibbous again (Sasha 2026-11-22 21:09): `Readying` → **`Prepping`**, in the clock and everywhere in Equilibrium.
- Sunday: `Illumination & Celebration` → **`Threshold & Celebration`** (liminal day between weeks); description starts «Between weeks: vision, ceremony, sharing with community. Write, don't send; seed Monday.»

## Where it lives
- Village map: a compact watch in the **top-right corner of the map** (Sasha asked where; my pick 2026-11-22: it stays visible while you look at the village, never covers place labels, and on a phone it sits as a small dial over the map's corner). Views 2–3 open as a card dropping down from the dial over the map, closing back to the dial. Replaces the old `MoonDial` block in the header; Do now gone.
- Character sheet header `/game/me/overview`: the same component, beside the name, same three views (opens in place, pushing content down).
- Sizes (Sasha 2026-11-22 15:36 «слишком маленькие», commit 056d963): village dial 200 px desktop, 148 px phone; profile up to 320 px. Phone (~390 px): the card is full width under the dial; nothing clipped. v6: the centre words never render below 12 px, so the phone dial is 200 px too (148 px gave ~9 px words).

## Improvements v6 (from the live review, Sasha 2026-11-22 21:06 «сделай спецификацию по улучшению»)
8. **Card text, one grid per ring** (Sasha 21:13 «текст очень малоорганизованный»; was: three different layouts, two fonts, five sizes, no ring names, Moon Focus floating between blocks). Every block the same 3 lines: (a) small caps label in the ring colour with its address (`MOON · WAXING GIBBOUS`, `WEEK · SUNDAY, SUN`, `YOUR YEAR · FROM YOUR BIRTHDAY`) and time left right-aligned; (b) current symbol + current word large in the ring colour, `was … · next …` small and dim on the right; (c) meaning as one plain sentence. Extras sit under their own block: Moon Focus link under Moon; `Today: N% of the day left` (gold) under Year. Thin dividers between blocks. Three sizes only (11 / 13 / 20), one serif for names, sans for the rest.
9. **Sun image clipped to a circle** (Sasha 21:13 «Солнце обрезано»): `planets/sun.png` has a square crop with black bars and a cut corona; render the Sun through a circular mask (disc ~88% of the image) with our own glow.
Mockup v6 (real values, Sun 2026-11-22 ~21:00 MST): [three views](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v6-views.jpg) · [village, desktop 200 px](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v6-village.jpg) · [phone 390 px, dial 200 px](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v6-mobile.jpg). Static, not in code.
Why: live check 2026-11-22. The two centre words don't say which cycle they belong to; the second is grey and barely readable; each ring shows «where I am» its own way; symbols are 9–13 px and merge into dots; the rings jump when Year and day open. The 5-second test fails.

1. **One grammar for every ring** (Moon, Week, Year, Day): the current phase is one large glowing symbol; what is already lived is dim (~35%); what is still ahead is bright (~85%). Track arcs follow the same rule: the part from now to the end of the cycle bright, the part already lived faint. (Today the moon lights the past, the week has no progress, and the day lights the lived part; the founding idea was «lived part dim, what's left bright».)
2. **Readable symbols**: the current moon and today's planet 2–3× the others (radius ~15–16 viewBox units instead of ~10); the other phases stay small, quiet marks. At 148 px (phone) the current symbols are at least ~20 px. Nothing overlaps the centre words.
3. **Centre words with an address**: each word carries its ring's symbol and colour. Line 1: small current moon + phase word, in moon colour (warm white). Line 2: small planet of the day + day word, in today's chakra colour (Sunday green). Both words same size, weight and full brightness. A newcomer links each word to its ring without a legend.
4. **Stable rings**: Moon and Week keep the same size and place in all three views. View 3 adds two thin rings outside them, Day (gold) then Year (silver), and the dial grows outward; nothing new goes inside the week ring (no room beside the centre words); the centre words don't shrink.
5. **Year names** (decided A, Sasha 2026-11-22 21:08 «делай»): the personal year runs birthday to birthday, so calendar names mislead (on 2026-11-22 the clock said «Autumn Equinox»). A: show only the energy names (Seeding, Sprouting, Fruiting, Harvest) with the line «Your year, from your birthday», no calendar season. B: keep the names and add «your year:» before them.
6. **Small fixes**:
   - The dial itself is the control (role button, keyboard Enter/Space, aria-label naming the next view); the separate round `+` / `−` goes.
   - Moon Focus line also in the profile card (view 2), as on the village.
   - The village card is narrower (≤ 340 px on desktop) so it covers fewer places.
   - The view is remembered per place (village and profile separately).
7. **Test**: first a static mockup of views 1–3 from real engine values (desktop + 390 px), 5-second check without legend, Sasha's yes; then the @claude issue. After going live: show it to 2–3 people with no explanation and ask «where are you now in the moon cycle and in the week?».

Done when: a newcomer, without a legend, names the moon phase and the day of the week from the dial in 5 seconds, on desktop and phone.

## Observations: user walk-through 2026-11-24 (live v6 + #409, signed in, desktop ~1920; phone not checked)
Sasha 2026-11-24 09:39 «Просмотри как пользователь, наблюдай, запиши наблюдения». Observed by a browser agent as a first-time user on /village and /game/me/overview, Tuesday, Full Moon. Observations only, no decisions yet.

**«Done when» fails.** Without a legend the newcomer named neither the moon phase nor the weekday from the dial in 5 s: the dial read as decoration. The phase was guessed only from the separate sky moon and the caption «Full moon. Harvest.»; the weekday not at all.

Confusing:
1. Nothing says the dial is clickable on either page (the cue is only its accessible name).
2. One moment, three names: village caption «Full moon. Harvest.», Moon card «Harvesting», Year card «Harvest» (moon phase and year season collide on the same word family).
3. «Waning Gibbous in 3 d 4 h» beside «MOON · FULL MOON»: not clear it is the next phase.
4. «was Prepping · next Celebrating»: no time for «next».
5. «Reap what's ripe · Cut · Receive the fruits of labor»: three near-synonyms; one instruction or three?
6. Week copy «The week's kinetic day.»: «kinetic» is jargon.
7. View 3: the two outer rings carry no label; which is year and which is day is not readable.
8. «Today: 60% of the day left»: no ring points to it.
9. Card asks for things elsewhere: village «Add your birthday to see your year» / «Sign in to see your Moon Focus», profile «Name your Moon Focus in Equilibrium»; each leaves the page.
10. Village: open card covers TOWN HALL, CO-WORKING, MASTERMIND, WORKSHOP labels (by spec, still felt).
11. Profile: last card line still below the fold on the agent's screen (#409 scroll fix to recheck).

Cosmetic:
12. Small low-contrast grey «was · next» and orange «Action» over the dark textured map.
13. Profile shows «Loading profile...» bars while the clock is already drawn above the name.
14. The same dial looks like two different objects (small over the map vs large on a dark disc).
15. Text layer runs words together («Harvestingwas Prepping», «MOON · FULL MOONWaning Gibbous in 3 d 4 h»): screen readers may read one word. Unverified: may be the agent's DOM reader; check the JSX before filing.

Works well:
16. Three-click cycle dial → card → Year and day → dial is clean and reversible on both pages; the button name updates («Show Year and day», «Back to the dial only»).
17. Year is right against the birthday: «Harvest», «41 days to 4 Jan», «was Fruiting · next Seeding».

## Fixes v6.2 (Sasha 2026-11-24 10:09 «правь», from the walk-through above)
1. **Centre words name the cycle.** Each centre line gets its address as a small caps label above the meaning word: `FULL MOON` over «Harvesting» (moon colour), `TUESDAY` over «Action» (chakra colour). This is what the 5-second test needs.
2. **Click cue.** View 1 shows a small «tap» hint under the dial («+» chip, ≥24 px target) and the dial has `cursor: pointer` and a soft glow on hover/focus.
3. **One word per moment.** The village caption («Full moon. Harvest.») uses the same engine word as the card («Harvesting»); never a second spelling. Year seasons keep their own names (Harvest etc.) but always under `YOUR YEAR`.
4. **«next» has a time.** Moon: `Next: Waning Gibbous in 3 d 4 h` (word «Next:» added). Meta line: `before Prepping · next Celebrating, in 3 d 4 h`; week: `before Intuition · next Clarity, tomorrow`.
5. **Copy (engine, also Equilibrium):** Full Moon line «Reap what's ripe · Cut · Receive the fruits of labor» → «Reap what's ripe. Receive the fruits of your work.»; Tuesday «The week's kinetic day.» → «The week's day to move.»
6. **View 3 rings labelled.** Small labels `YEAR` and `DAY` on the two outer rings; the line «Today: 60% of the day left» starts with a dot in the day ring's colour.
7. **One invitation, not three.** Signed out: one quiet line «Sign in to see your year and Moon Focus». Signed in: «Moon Focus: name it in Equilibrium →». No «Add your birthday» line when the player is signed out.
8. **Contrast.** «before · next» meta text and coloured words reach WCAG AA (4.5:1) on the map: lighter grey, subtle text-shadow behind the card text.
9. **Text layer.** Every adjacent label/word pair is separated by a space or its own block so screen readers don't read «Harvestingwas» (check first; fix only if real).
10. **Profile.** After opening view 2 or 3, the whole card scrolls into view (recheck #409).
Not changed (by spec): the open village card may cover map labels; dial framing differs per place.

## Observations: phone 390 px, 2026-11-24 (live v6.2 after #439, guest, local Chromium 390x844, iPhone UA)
Works: centre reads FULL MOON / Harvesting / TUESDAY / Action at a glance; «+ tap» cue visible under the dial; three views cycle; YEAR and DAY labels present.
1. The open card covers the primary CTA block («YOUR NEXT MOVE · ENTRY PORTAL · Start by finding your top talent»), and that text shows through the card (card not opaque), reading as ghost text under «Action» and «Massive action…». For a new player this hides the first move.
2. View 3 for a guest: header «YOUR YEAR · FROM YOUR BIRTHDAY» is followed only by «Today: 40% of the day left» (a day line under a year header; a guest has no birthday).
3. «Next: Waning Gibbous in 2 d 22 h» (card header) and «next Celebrating, in 2 d 22 h» (line below) say the same moment twice with two names.
4. YEAR / DAY sit stacked in a small pill at 12 o'clock and crowd the ring stroke (also on the desktop profile dial).
5. Screen reader: adjacent spans join without spaces («FULL MOONHarvestingTUESDAYAction», «YOUR YEAR · FROM YOUR BIRTHDAY41 days to 4 Jan»), seen in the accessibility tree.

## Fixes v6.3 (Sasha 2026-11-24 19:53 «Да», from the phone 390 observations above)
1. Open card is fully opaque and never overlaps the page's own blocks: on phone it pushes «YOUR NEXT MOVE» (Entry Portal CTA) down instead of covering it; nothing shows through.
2. «Next» once: keep the header «Next: <phase> in <time>»; the line below keeps «before <word>» and drops the repeated «· next <word>, in <time>» (use the same word as the header, one name per moment). Same for the week block («next Clarity, tomorrow» stays only if the header has no next).
3. Guest (no birthday): view 3 shows no «YOUR YEAR · FROM YOUR BIRTHDAY» header; the day line gets its own label «TODAY» (or «DAY»). Signed in: year block unchanged, day line under its own «DAY» label, not under the year header.
4. YEAR / DAY ring labels: one label per ring, placed on its own ring's arc (not stacked in one pill at 12 o'clock), clear of the ring stroke, ≥11 px.
5. Accessibility text: visible words are separate (space or separator between spans), so a screen reader says «Full Moon, Harvesting, Tuesday, Action».
Done when: at 390x844 guest, opening the card leaves «ENTER» and the Entry Portal title fully visible and unobscured on scroll; no duplicated «next»; view 3 for a guest has no year header.

## Roast: thicker rings + live v6.3 review (2026-11-26, local Chromium 390x844 and 1280x900, guest, Thursday / Full Moon)
Measured (computed styles): dial 200x200 on phone AND desktop; Moon ring stroke 1.4 px, same cream colour, lived part opacity 0.35 vs ahead 0.85; Week ring ~3 px chakra segments.
Verdict: thicker is right but not enough alone. The split «lived / ahead» is carried only by opacity of one colour on a noisy dotted photo, so it stays unreadable at any width.
1. Ring weight: Moon and Week tracks 8 px on the 200 px dial (4% of diameter; Apple-style 12% would swallow the phase and planet glyphs). Year 6 px, Day 4 px dashed kept.
2. Lived vs ahead by two cues, not one: ahead = solid full colour; lived = same hue at ≤25% plus thin (2 px) centreline. Contrast ahead vs map ≥3:1 (WCAG 1.4.11).
3. Solid dark plate: a full circle behind the dial, ~85% opaque, concentric. Today the dark shape is offset left and only partly covers the map.
4. Centre words collide with inner glyphs: «Harvesting» touches the Saturn orb, «Expansion» touches the Sun orb. Either shrink inner orbs off the text box or push the Week ring out by ~8 px.
5. Two big discs compete: the current Full Moon (bottom) and a large pale disc at top. One big = now; everything else small.
6. Desktop dial is 200 px too: at 1280 it reads as an icon. Desktop 260–280 px.
7. Card now pushes «YOUR NEXT MOVE» and ENTER below the fold on phone (trade-off of v6.3). Keep card short: drop «before …» lines on phone, or the card closes on scroll.
8. The header line «Full moon. Harvesting.» repeats the dial centre; one of them is enough.

## Done when
A player opens the village map and, without a legend, sees in the dial alone the moon phase and the day of the week (symbols + two words); one tap opens meaning, previous, next and the time to the next moon phase; a second adds Year and day; a third closes back to the dial. Checked live on desktop and on a phone.

## History
- v0/v1 (2026-11-21): four rings Year · Moon · Week · Day, built in PR #378. Sasha 2026-11-22 10:38: hard to read even for its author; insider glyphs, four grammars, legend only in the mockup.
- v2: one grammar, word labels (rejected: cut pieces, lost the meaning). v3: Equilibrium-style strips with meanings (rejected: must look like cycles). v4: v3 content on two rings. v5: photo planets, chakra track, new words → decided.
- Lessons: reuse Equilibrium before drawing new visuals; 5-second test without a legend.
- v5 built (issue #381, 2026-11-22): `BiologicClock.tsx` rewritten to two rings + readout + «+ Year and day» (localStorage `bioclock:expanded`); engine words changed; Do now removed from `MoonDial`. The day-part arc carries no words (the engine has none for parts of the day).
- 2026-11-22 14:49: Sasha: default shows only the dial; the toggle cycles dial → text → + Year and day → dial. Placement asked; picked the map's top-right corner (also clears the Moon Focus line running under the CAFÉ label).
- Three views + village placement built (issue #385, 2026-11-22): `BiologicClock` takes `view` 1/2/3 (`onCycleView`, round `+` / `−` control under the dial, localStorage `bioclock:view`; the v5 key `bioclock:expanded` migrates: «1» → view 3, «0» → view 2). The village mounts `MoonDial` as a watch in the top-right of `vl-frame` (dial 128 px, 96 px on a phone; Moon Focus moved into the card, view 2 onward; sky moon steps left of it; offset below the fixed language pill). Character sheet: same component, `placement="inline"`.
- 2026-11-22 21:06: live review (two-part analysis in chat) → «Improvements v6» section; Sasha asked for the spec. Next: mockup, his yes, then build.
- 2026-11-22 21:08–21:09: Sasha «делай» (Year names A) and Readying → Prepping everywhere; mockup v6 made.
- Built v6 (issue #405, 2026-11-23): `BiologicClock` rewritten to the v6 grammar (lived 35% / ahead 85% / now ×2.5 on every ring, addressed centre words, Day + Year rings outside in view 3 with the viewBox growing outward, Sun through a circular mask, card grid per ring, the dial is the control with Enter/Space). The view is remembered per place (`bioclock:view:village`, `bioclock:view:profile`; a place without its own key starts from the shared `bioclock:view`). Moon Focus is `MoonFocusLine`, under the Moon block in the village card and, via `ProfileClock`, in the profile card. `Readying` → `Prepping` in the engine copy. Not checked in a browser from CI: look at it live on desktop and a phone (5-second test) before closing the issue.
- Built v6.2 (issue #434, 2026-11-24): items 1–10. Centre: small caps address over each word (`FULL MOON` / `TUESDAY`, 11 px, ring colour) and the Moon / Week blocks keep their grid; the dial gets a `+ tap` chip (view 1 only, 24 px, out of the tab order) and a glow on hover / focus; the village caption takes its Full Moon word from the engine (`phaseWord(MOON_PHASES[4].energy)`, «Harvesting»; `phaseWord` now lives in the engine); `Next: Waning Gibbous in 3 d 4 h`, `before … · next …, in …` (week: `tomorrow`; year: days to the next season); engine copy for Full Moon and Tuesday changed (also Equilibrium); `YEAR` / `DAY` curved labels on the two outer rings and a gold dot before «Today: …»; one invitation (signed out: `Sign in to see your year and Moon Focus`, no birthday line; signed in: `Moon Focus: name it in Equilibrium →`); chakra colours lightened for WORDS only until they reach 4.5:1 (Monday indigo, Tuesday red), track colours unchanged; spaces between adjacent label / word pieces; the card scrolls whole into view (end if it fits, start if taller than the screen). The «before … · next …» line moved from the right of the word to its own row under it (it no longer fits beside it). Not done: waxing / waning captions on the village («Build», «Digest») are bucket verbs over three engine words each, so they were left. Looked at in headless Chromium from CI (desktop); phone and live not checked.
- Built v6.3 (issue #448, 2026-11-25): items 1–5. (1) The open village card is a solid `#070b16`; on a phone `MoonDial` measures how far the watch runs below the map frame (`clockPush`, ResizeObserver, breakpoint 767 px) and the Village adds that much `margin-bottom` to `.vl-frame`, so the card pushes «YOUR NEXT MOVE» down instead of covering it (checked in headless Chromium 390x844, guest, views 2 and 3: ENTER and the Entry Portal title sit fully below the card). (2) The Moon line below the word is `before <word>` only (the header keeps `Next: <phase> in <time>`); Week and Year keep «· next …» because their headers carry no next. (3) A guest's view 3 has no year block; the day line has its own `DAY` block (for signed-in players too, no longer inside the year block). (4) `YEAR` / `DAY` are 11 px, each on its own ring at its own angle in the upper half (moved clear of the ring's own dot), with the ring stroke cut under the letters. (5) The centre `<g>` is `aria-hidden` (the dial's name carries the words: «Waxing Gibbous, Prepping, Saturday, Structure»); card rows get a visually hidden «, » (`.bio-clock__sr`) between pieces, since flex rows drop plain spaces. Not checked: live site, desktop and signed-in views in a real browser.
