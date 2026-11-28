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

## Rings v7: segmented rings, phase brightness, neutral phase names (Sasha 2026-11-26 12:45 MST «да, делай»; 12:46 «маленькие луны пусть остаются»)

Mockups: [final dial](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v8-final.png) · [phone, real 200 px](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v8-phone.png) · [A vs B](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v8.png) (B chosen). Replaces the ring styling of v6–v6.3; the views, toggle, card and engine stay as they are. The 8-point roast above is NOT part of this change except where repeated here.

1. **Segmented rings.** Moon ring = 8 segments (one per phase), Week ring = 7 segments (one per day, chakra colour). Small gaps between segments: 0.004 of a turn at each end (~1.4°). Square (butt) caps, no round caps.
2. **Width grows with radius** (Sasha asked for Apple Watch geometry; Activity rings are actually equal width, so we scale by radius instead). In the 200-unit viewBox: Moon radius 84, stroke 15; Week radius 56, stroke 15×56/84 = 10. Year and Day rings (view 3) follow the same rule: stroke = 15 × r/84.
3. **Moon segment brightness = how lit that phase is.** Colour is a mix from #343640 (dark) to #fff1d6 (cream) by illumination: New 0.03, Growing Crescent 0.25, Growing Half 0.5, Almost Full 0.8, Full 1.0, Past Full 0.8, Fading Half 0.5, Fading Crescent 0.25.
4. **Lived vs ahead (variant B).** Ahead = full-width solid segment, opacity 1. Lived = the same colour as a thin line, 30% of the stroke width, opacity 0.85, centred on the ring radius. The current segment is split at "now": lived part thin, rest full. Same rule on the Week ring and on Year/Day rings.
5. **Small symbols stay.** Small moon-phase glyph centred on each Moon segment (lived ones at 45% opacity); current phase as the big MoonOrb with glow. Week ring: small planet on each day, current day big with glow. Reuse MoonOrb and the planet assets.
6. **Dark backing:** one full concentric dark disc behind the dial (rgba(6,9,20,.9)), radius = dial radius.
7. **Neutral phase names** everywhere the user reads them (clock, card, Equilibrium pages, transitions, harvest, Telegram/eyebrow copy in the frontend), en/ru/es locales:
   | old | en | ru | es |
   |---|---|---|---|
   | New Moon | New Moon | Новолуние | Luna nueva |
   | Waxing Crescent | Growing Crescent | Растущий серп | Creciente fina |
   | First Quarter | Growing Half | Растущая половина | Media creciente |
   | Waxing Gibbous | Almost Full | Почти полная | Casi llena |
   | Full Moon | Full Moon | Полнолуние | Luna llena |
   | Waning Gibbous | Past Full | После полнолуния | Recién llena |
   | Last Quarter | Fading Half | Убывающая половина | Media menguante |
   | Waning Crescent | Fading Crescent | Убывающий серп | Menguante fina |
   Display strings only: keep internal keys, ids, stored values and astronomy comments. Do not touch supabase/functions in this change (edge deploys cost Lovable credits); list any user-facing old names left there in the PR.
8. **Texture: "Light flow"** (Sasha 2026-11-26 12:51 «2 точно круче»; [three textures](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v9-styles.png), #2 chosen). Each ahead (full-width) segment is stroked with a linear gradient along its arc: start colour = 65% own + 35% previous segment's colour, middle = own colour, end = 65% own + 35% next segment's colour (gradientUnits userSpaceOnUse, from the segment's start point to its end point). So the Moon ring brightens and fades smoothly phase to phase and each day flows into the next. Lived thin lines stay flat colour. No glow, no shadow, no rim.
9. **All rings in the expanded view use the same style** (Sasha 2026-11-26 12:55 «применить такой стиль и ко всем кругам (годовому и так далее) в раскрытой версии»): Year ring = 4 season segments, Day ring = one continuous gold arc. Both: width ∝ radius (stroke = 15·r/84), small gaps between Year segments, butt caps, lived = thin line 30% width at .85, ahead = full width with the «Light flow» gradient (Year: toward neighbouring season colour; Day: gold #f2c46b → deeper amber toward the end of the day), current segment split at now. Small symbols/markers on these rings follow the Moon/Week rule (lived 45% opacity).
10. Out of scope (ideas, not approved): breathing glow on "now", a soft "click" at phase/day change.

Done when: on /village and /game/me/overview at 390 and 1280 the dial matches the final mockup; no "Gibbous"/"Waxing"/"Waning"/"First Quarter"/"Last Quarter" in user-facing UI text; tests green.


## Concept: «Light Instrument» — the dial as Bloom Stage 8 (proposal, 2026-11-26; not approved for build)

Source: `docs/01-vision/new_ui_paradigm_vision.md` (Bloom, the 8 primitives, Stage 8 Neo-Dimensional, B.1 rules, Part C anti-patterns) and `docs/03-playbooks/ui_playbook.md` (performance budgets, breathing UI, liquid glass). Sketch: [v7 vs concept](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v10-concept.png) · [phone](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v10-phone.png).

**Master result.** In one glance the dial reads as a real object under real light that tells true time of the sky and of my life. Futurism comes from light behaving intelligently; realism comes from material and the true sky. Not from more pixels.

**Core metaphor.** A dark stone instrument (astrolabe) with light channels cut into it. Light = what is still ahead in the cycle. Lived time = the empty engraved groove the light already passed through. This turns v7's «lived thin line» into a physical truth instead of a style.

### Eight primitives on one object
| Primitive | Dial rule | Realism ↔ futurism |
|---|---|---|
| Material | One material: night stone (pre-baked texture) with a thin gold rim. No glass blur. | real |
| Depth | Three planes only: stone (far), channels cut in (middle), moons/planets/words (near). Channels are inset (inner shadow + 1 px lower highlight). | real |
| Form | Circles and arcs only; butt-cut segment ends like cut stone. | real |
| Color | Moon channels = true illumination of each phase; week = chakra hues; year = four seasons; day = gold. Light flow gradient between neighbours. Bloom level tints the rim/sheen only. | both |
| Light | One light source = the real sun for this moment: the sheen on the stone sits where the sun is (time of day, computed locally). Ahead channels emit a soft halo; current moon carries its true terminator. | futurism through truth |
| Motion | One slow breath (≈12 s): light drifts along the ahead channels (gradient offset). Nothing else moves. Fast motion only on tap (view change). | futurism |
| Sound | Seed, off by default: one soft tone when a phase or day turns. | later |
| Typography | Serif for meanings, thin mono caps for names (current). | — |

### Truth layer (imitation of reality, computed, no network)
- Moon disc terminator and tilt from the engine's illumination and the local sky (already in `getAllCyclesV2` + one formula), not a photo swap per phase.
- Stone sheen angle = sun azimuth for the player's time zone and hour; at night the sheen dims and the moon becomes the light source (sheen moves to the moon's side).
- Day ring lit part ends at local sunset/sunrise when known from the timezone (optional, phase 3).

### Performance architecture (fits ui_playbook budgets)
- **Rendering:** SVG only. No WebGL, no canvas, no `backdrop-filter`, no runtime SVG filters (`feTurbulence`/`feGaussianBlur` are CPU-heavy on phones). Halos are a wider low-opacity stroke; inset is two strokes.
- **Assets:** one stone texture WebP ~20–30 KB (2× of 280 px), cached; moon/planet images already shipped. Total added weight ≤ 40 KB, zero new requests after first load, zero runtime network.
- **Compute:** geometry recomputed once a minute (memoised), the only animation is CSS `stroke-dashoffset`/gradient-transform on the ahead layer (GPU-composited). Paused by IntersectionObserver when off-screen and by `document.hidden`.
- **Tiers:** T0 `prefers-reduced-motion` or low-end (deviceMemory ≤ 2 / saveData): static, no breath. T1 default: breath. T2 desktop pointer: sheen follows pointer slightly (≤ 6°), parallax ≤ 2 px between planes.
- **Accessibility:** contrast of lit channels vs stone ≥ 3:1; text AA; screen-reader text unchanged.

### Build order (each step shippable)
1. Material + depth: stone disc, gold rim, engraved lived grooves, inset lit channels (static).
2. Truth light: sun/moon-driven sheen; true moon terminator.
3. Motion: the one breath; tiers T0–T2.
4. Sound seed (off by default) and Bloom tint of rim.

### Anti-patterns kept out
Neon/glow outlines, glassmorphism blur on the dial, more than one moving thing, particles, rainbow gradients behind text, any number or score on the rings.

### Roast v2 of the concept with Sasha's ideas (2026-11-26 13:23; proposal, not approved for build)
Sasha's inputs: background makes the dial physical; light through stone; Excalibur on a rock in the mountains joined to the village, peacock metallic light; new top-down landing view with the sword visible; the sword may lead to the top talent reveal («извлечь свою силу из камня»); dial from dry clay (his earlier carved clay surfaces). Sketches: [clay](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v11-clay.png) · [village + Excalibur](../../02-strategy/research/iconic-mechanics/mockups/village-excalibur-v1.jpg).
1. **One material story across scales.** Mountain rock → sword in stone → clay dial with light coming through carved channels. Myth = product: your power is already in the stone; only you can pull it out. Strongest part; keep it.
2. **Clay: dark fired, not raw.** Raw light clay (sketch, middle) kills the phase-brightness encoding and the centre text: light segments merge with the surface. Dark fired clay keeps the handmade warmth and the ≥3:1 contrast. Raw light clay can stay as the carved-symbol material elsewhere (cards, plaques).
3. **Sword light within Bloom rules.** Peacock palette as thin-film iridescence on the metal plus light falling on the rock; no halo, no beams. On the map it is the only moving thing (slow shimmer, CSS overlay), clock breath stays inside the dial.
4. **Scale.** The sketch's sword is taller than the minaret, which reads as a fantasy monument (kitsch risk). Recommend human-to-heroic scale (≈ 2–3× human) on a clearly visible rock; it is found by its light and a lit path, not by size.
5. **Collision found.** On the phone the dial sits top-right; the sketch puts the sword top-right too, so the dial would cover it. Place the sword upper-left/centre ridge, or move the dial. Must be checked in the 390 px crop before anything ships.
6. **Excalibur → top talent reveal** (core flow, needs Sasha's exact yes to a sketched flow): before the reveal the sword sits in the stone and the path glows; the reveal is pulling it; after it the stone is empty and the sword lives in the character profile (your talent). Map state, not ring state, so the rings rule (time and energy only) holds.
7. **Performance.** New map replaces the old one at the same budget (WebP ≤ 250 KB desktop, separate phone crop), sword shimmer is a small transparent overlay, clay texture one shared ≤ 30 KB tile. No WebGL.
9. **Moonlit dry clay** (Sasha 2026-11-26 13:38, replaces «dark fired clay» in (a)): raw dry clay under cool moonlight; the surface brightness and the silver sheen follow tonight's real moon illumination (Full Moon brightest, New Moon nearly dark, only the light channels glow); sheen sits on the moon's side of the sky. Contrast holds in all phases ([sketch](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v12-moonlit.png)). Same cost: one clay tile, tint and sheen in CSS/SVG from the engine's illumination.
8. **Order.** (a) dial in moonlit dry clay (item 9) (concept step 1); (b) map v2: mountains + sword, placed clear of the dial, phone crop checked; (c) Excalibur → reveal flow sketch; build each only after Sasha's yes.

### Craft layer: moonlit dry clay with inlaid light (2026-11-26 13:44; sketch [v13](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v13-inlay.png) · [phone](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v13-phone.png); approved 13:47)
**Idea.** The dial is a disc thrown on a potter's wheel; the rings are carved into it like a craftsman's grooves, and the light lives in inlays set into those grooves. Precision from Japanese craft, analog feel from the wheel and the hand.
1. **Base drawing = the potter's wheel (rokuro).** Faint concentric throwing lines with a slight hand wobble; the rings continue the wheel's own circles, so the clock looks born from the clay, not printed on it. Thrown raised lip at the edge instead of a painted gold rim.
2. **Dry clay, photoreal.** Multi-scale grain (6 octaves), pinholes, warm clay albedo under cool moonlight, carved grooves with shadow inside (ambient occlusion), surface lit by a real normal map from one light.
3. **Micro-glints.** Dry clay carries mica and quartz: about 1% of grains are tiny facets that catch the moon and sparkle; brighter at Full Moon, almost none at New Moon. Desktop pointer: glints shift slightly with the light angle.
4. **Inlay (zōgan / raden logic).** Lit segment = translucent stone set into the groove: a black urushi hairline around it, a soft core of light inside (subsurface), one thin bevel glint on the edge facing the moon. Light flow gradient stays.
5. **Lived = silver wire (nunome zōgan).** The empty groove keeps a single silver wire along its centre: the v7 «thin line» as metal, not paint.
6. **Hand-made ends.** Segment ends are hand-cut: tiny irregular angle (±0.1°), 0.9-unit bevel, never perfectly radial. Wabi-sabi, read only up close.
7. **Words impressed, not floating.** Centre words in dark ink (#2b2620; week name in deep chakra tone), like a stamped seal in clay; no white text on clay.
8. **Moonlight drives all of it.** Clay brightness, glint count and sheen side follow tonight's illumination (item 9 of the roast).
**Architecture.** Ring geometry is fixed (8 + 7 segments), so carving, wheel lines, grain and glints are baked once into one clay tile; only the state (which inlays glow, where now is) is live SVG. Measured: baked tile at 280 px WebP = 17 KB. Moonlight = CSS filter/opacity on that tile plus one sparkle layer. No WebGL, no runtime filters, no network.
**Approved** (Sasha 2026-11-26 13:47 «это все ОЧЕНЬ круто, делай»; 13:48 «слишком много неровностей… именно dry clay»): build the craft layer on top of Rings v7. Final look = [v15](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v15-inlay.png) · [phone](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v15-phone.png): smooth matte dry clay (chalky, fine powder grain, almost no relief, rare pinholes, faint wheel lines), not stone and not bumpy. Supersedes the v13 texture.
**Implementation**
- Assets (committed): `public/assets/equilibrium/clay/clay-surface.webp` (384 px, ~14 KB: grain, wheel lines, thrown lip; no grooves, so one tile serves every view and scales to the disc) and `clay-glints.webp` (320 px, ~6 KB, alpha: mica glints).
- Disc: replace the dark backing disc (v7 item 6) with the clay tile clipped to the dial circle; in view 3 the disc grows to cover the Year/Day rings.
- Carving in SVG per ring: full-ring stroke #2a221b at .55 opacity, ring width; plus 0.8-unit highlight #fff on the outer edge (.22, offset +0.6,+0.8) and inner edge (.18, offset −0.6,−0.8).
- Inlay (ahead segments): urushi hairline = #120f0c .85 stroke at width×0.8+1.6 under the Light-flow stroke at width×0.8; core #fff .22 at 30% of that width; bevel glint #fff .55 0.7 units on the outer edge, shade #000 .30 0.9 units on the inner edge.
- Lived: silver wire #c9ced8 .85, width max(12% stroke, 1.1), plus a hair #fff .35 0.5 and the segment colour .35 at 5% width (replaces v7 «thin line 30%»).
- Hand-cut ends: each segment end offset by a fixed pseudo-random ±0.1° (seeded by segment index, stable).
- Centre words: ink #2b2620; week words in the deep chakra tone (Thursday #4a2a78; derive the others by darkening the chakra colour to ≥4.5:1 on #c4b4a0).
- Moonlight: CSS on the disc only: `filter: brightness(b)` with b = 0.55 + 0.45 × illumination (from the engine), glints layer opacity = 0.15 + 0.85 × illumination; sheen = radial gradient #dfe8ff on the moon's side (upper-right when the moon is up, else upper-left warm #fff6e0 for daytime).
- Budget: +20 KB images, no WebGL/canvas/runtime filters (CSS brightness is GPU), works offline; `prefers-reduced-motion` unaffected (nothing moves).

**Finishes + side button** (Sasha 2026-11-26 14:02 «Как бы нам сделать кнопку которая меняет цвет дисплея между этими тремя опциями… кнопку стиля Apple… справа… большую зону реакции… Одна кнопка, и нажатие на сами часы»). Mockup [v18](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v18-finishes.png), finishes compared in [v17](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v17-ab.jpg).
- Three finishes, same rings and inlay, only the clay tile and ink change: **1 Wheel clay** `clay-wheel.webp` (v15, beige with faint wheel lines, ink #2b2620, week word deep chakra tone); **2 Dry clay** `clay-dry.webp` (v17a, beige, chalky, rare hairline cracks, sparkle, tan lip, same ink); **3 Moonlit clay** `clay-moonlit.webp` (v17b, dark slate, ink #efe6d6, week word light chakra tone e.g. Thursday #c8b2ff). All in `public/assets/equilibrium/clay/` (384 px, ~14–20 KB each; load only the active one). `clay-glints.webp` shared. Replaces the single `clay-surface.webp`.
- Default finish: 3 Moonlit clay (approved by Sasha 2026-11-26 14:06, «моя любимая! Делай»).
- Active moon fits inside its ring (Sasha 2026-11-26 14:13: it ran over the dial edge): radius 11/200 of dial size (was 15), centre 1.5/200 inward from the Moon ring radius, glow the same radius. Its outer edge stays at least 4/200 inside the clay rim. Mockup bioclock-v19-finishes.
- **Side button**: Apple-Watch-style pill on the dial's right edge at 3 o'clock (18×68 px at 260 px dial, scale with dial), bezel-coloured, with three dots showing the active finish. Tap = next finish 1→2→3→1. Invisible hit area ≥60×112 px (WCAG 2.5.8 and Apple 44 pt satisfied), does not trigger the dial. `aria-label="Clock finish: Moonlit clay. Tap for next"`, keyboard: Enter/Space. Choice saved in localStorage (`bioclock-finish`), same on village and profile. Cross-fade 200 ms (none with prefers-reduced-motion).
- **Tap on the dial** keeps its role: dial → + words card → + Year and Day → back to dial (two steps to fully open). These are the only two controls.

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

## Word ring: ЭКВИЛИБРИУМ (decided 2026-11-26)
- Sasha 17:40 approved the hand-carved wordmark look (v5: straight stems; a growing sine wave only on horizontal bars, Э middle bar, Б top bar, А middle bar; small elegant feet to the right on the bottom ends of К, Л, И; В bottom-left corner runs along the floor; round, slightly heavier ends; micro roughness). Sasha 17:41: «ставь вариантом три» = variant C.
- Variant C: the word sits in the gap between the Moon and Week rings, radius 68.8/200 of dial size, letter height 8.2/200, compact arc starting at 12 o'clock and running clockwise (about 0–130°), tracking 0.30 of letter height. Carved into the clay (same light as the dial: from upper left), never a flat text label. The active moon and planet orbs draw above the letters.
- Centre: Sasha's muted gold solar emblem, 26/200 of dial size, small shadow; phase words above it, day words below (v22 layout). v23 (36/200) tried and rejected 2026-11-27: text lost its harmony. Ship the emblem from his 1254 px original as 2×/3× WebP, never upscaled.
- Built as one pre-rendered transparent WebP per finish (wordmark arc with its carved shading), not as a runtime font. Mockup: bioclock-v22-word.jpg.
- Ships with the craft-layer issue.

## iPad clock stage on /equilibrium — concept and spec (APPROVED 2026-11-26 17:45 «да!»; backgrounds decided 17:54)
Ask (Sasha 2026-11-26 17:40): the same clock, same function and design, full screen on a black iPad screen; game shell collapsed; on /equilibrium.

### What is on /equilibrium today
- `/equilibrium` is only a redirect to `/build/equilibrium` (App.tsx). `/build/equilibrium` is the Equilibrium product page (EquilibriumV2Page): synthesis, PDF, Telegram, Products page link, the village dial link (MoonDial → /build/equilibrium), Sections panel row. It stays.
- Dead code: `src/pages/EquilibriumPage.tsx` (no route uses it) and `public/equilibrium/` (an old standalone build: index.html + assets). The static folder would also answer `/equilibrium/` with a trailing slash and shadow the new page.

### Concept architecture
1. One clock. The stage renders the existing `BiologicClock` with the same engine (`getAllCyclesV2`), finishes button, dial tap cycle (dial → words → Year and Day → dial), word ring, emblem. The only new input is its size.
2. Stage page `ClockStagePage` at `/equilibrium`, inside `GameShellV2` with `hideLogo`, no background video, pane 2 closed and pane 1 rail folded on entry, its restore toggle kept (one small control in a corner).
3. Stage in full-moon light, not black (Sasha 17:45 «только не черный фон, а FULL MOON LIGHT»): a soft radial moonlight field behind the dial, CSS gradient only, no image; three shades from mockup stage-v1: A moonlit night, B full-moon light (default), C pearl. Decided (Sasha 17:54): a tap anywhere outside the dial cycles the background A→B→C→A (cross-fade 400 ms, none with reduced motion; localStorage `bioclock-stage-bg`); the side crown keeps cycling the dial finish (wheel, dry, moonlit) exactly as on the village. Taps on the dial itself keep the dial → words → Year and Day cycle. Formerly: black stage, background #000; dial centred, size = 92% of min(viewport width, viewport height), respecting safe-area insets; works in portrait and landscape and re-centres on rotation. The open words card and the Year and Day view fit inside the same square.
4. Full screen: one small button in a corner, fades after 3 s without touch, comes back on touch. Calls `requestFullscreen` on the stage (webkit-prefixed fallback). If the browser refuses, the page still works as a black stage; the tip line says «Add to Home Screen» for a chrome-free view (web manifest `display: standalone` already or added for this route).
5. Screen stays on: Screen Wake Lock API while the stage is visible; re-acquire on `visibilitychange`; release on leave. No fallback video trick.
6. Time: the clock recomputes once a minute and on wake; nothing else polls. No network after load except the existing birthday read.
7. Who: signed-in player = all four rings from their birthday. Guest = the same guest behaviour as on the village (Year ring needs a birthday).
8. Screen care: the whole dial shifts by up to 2 px every 10 minutes (OLED iPads); brightness stays as the finish defines.
9. No new assets; the craft layer and word ring arrive through their own issue and show here automatically.

### Removal (recommendation)
- Keep `/build/equilibrium` and the Equilibrium product untouched.
- Replace the `/equilibrium` redirect route with the stage.
- Delete `src/pages/EquilibriumPage.tsx` and `public/equilibrium/` after a repo-wide grep shows no import or link (2026-11-21 snapshot: none).
- Update the path lists that name `/equilibrium` (SiteLogo.tsx, GameShellV2.tsx, shellRoutes.ts) so the stage gets: logo hidden, no video, nav collapsed.
- External links to `/equilibrium` that expect the product (old posts, emails) will now land on the clock; the stage carries one small text link «Equilibrium →» to `/build/equilibrium` in the restore corner.

### Done when
On iPad Safari, `/equilibrium` shows only the clock in full-moon light; full screen works from one tap; the screen stays on for 30 minutes; finish button and dial taps work as on the village; the shell opens from its toggle; `/build/equilibrium` still works; `/equilibrium/` no longer serves the old static app.

## Concept: realistic inlay and light through it (NOT APPROVED FOR BUILD, 2026-11-26)
Ask (Sasha 17:53): make the inlaid pieces more real, and the light passing through them more real.
1. Real stone, one per segment colour: malachite (green), carnelian (red/orange), lapis (blue), amethyst (violet), citrine (yellow), moonstone (Moon ring). Each a small photographed-style texture with its own banding and inclusions; one sprite of six tiles, about 20 KB WebP total, tiled along the arc so no two segments look stamped.
2. Thickness drives colour (how real translucent stone behaves): thin edges are lighter and clearer, the centre is deeper and more saturated. One radial gradient per segment over the texture.
3. Light from within, not a glow on top: the groove floor under ahead segments is lit, so colour spills a little onto the clay walls of the groove in the segment's own hue. No outer halo (replaces the Jupiter purple glow).
4. Moon as the light source: one moving highlight along each ring, placed at the real moon direction for the user's local time and as strong as the moon's illumination (full moon = bright cool sheen, new moon = almost none).
5. Seating: a hairline dark gap between pieces and clay on the shadow side, a thin bright lip on the lit side, a tiny resin meniscus at segment joints. Width varies ±0.3 px so the cut looks hand-made.
6. Now point: the inner light is strongest at "now" and fades toward the end of the ring, as a very slow drift (12 s loop, CSS gradient only, off with reduced motion). Lived segments stay silver wire.
7. Cost: about +20 KB for the stone sprite plus CSS; no WebGL, no canvas. Supersedes the roast's single grey mineral tile if approved.

## Phase and day words: Sasha's cursive (direction, 2026-11-26 17:53)
- All lowercase (it's just a word): "full moon", "harvesting", "thursday", "expansion".
- Font: Sasha's own handwriting (cursive), bold for the phase and day name, regular for its meaning. Source: a sheet in his hand with the alphabet and every word the clock shows; vectorised into one font (latin + cyrillic + spanish accents). Replaces the roast's Cormorant Garamond proposal.
- Legibility floor: on the 200 px phone dial the words are about 12 px; cursive needs strong strokes there, so bold stays heavier than the reference.


## Concept: phase and day words in Sasha's cursive (sketch v24, NOT APPROVED FOR BUILD)
Sasha 2026-11-27: a font for every reading. Moon: 8 names + 8 energy words. Week: 7 names + 7 energy words. All lowercase. Name and energy in ONE size; name bold, energy thin. He writes the words by hand; we vectorise them (fixed word images per finish, or a small font from his letters).
- A: cursive name bold + cursive energy thin (Caveat used as a stand-in for his hand).
- B: cursive name bold + energy carved like the ЭКВИЛИБРИУМ wordmark and filled with metallic-neon light as paint in stone: moon words pearl-silver, day words in the planet's colour (Thursday violet). Comfortaa is a stand-in for carved letters.
Words: moon (Sasha 2026-11-28, decided; Equilibrium MOON_PHASES lead word changes too) new moon/clearing, growing crescent/resourcing, growing half/clarifying, almost full/prepping, full moon/harvesting, past full/celebrating, fading half/intending, fading crescent/planning; week (Sasha 2026-11-28, decided; one engine, so Equilibrium PLANETARY_DAYS copy changes too) monday/envisioning, tuesday/action (kept, Sasha 11-28), wednesday/clarity & comms, thursday/expansion, friday/fun & beauty, saturday/structure, sunday/renewal. Mockups bioclock-v24A, bioclock-v24B.

Roast of v24 (2026-11-28): A 7/10 (calm, one voice, but stand-in Caveat is slanted and narrow vs Sasha's upright round hand; thin line at ~11 px on a 200 px dial is at the legibility floor). B 6/10 as drawn (three type voices: carved caps, cursive, geometric; halo blurs at small size; neon reads digital on matte clay; silver word has less contrast than A). Proposed C: one voice, his cursive for both; energy word as a hairline groove in his hand filled with soft light inside the groove only, no halo; pearl for moon, planet tint for day.
Sketch C (2026-11-28, Sasha «Да!» to drawing it; NOT APPROVED FOR BUILD): name in cursive bold; energy in cursive as a hairline groove filled with soft light inside only (lit cut edge, inner wall shade, no halo). Mockup bioclock-v25C. Check: on the 200 px phone dial the groove effect disappears and reads as thin light text (same as A, slightly dimmer); the inlay reads on profile 320 px and iPad stage.
Cursive dropped (Sasha 2026-11-28 «Курсив не выглядит хорошо. Давай просто подберем подходящие по вайбу шрифты»). Font sheet v26 (NOT APPROVED): Cormorant Garamond, Jost, Alegreya Sans, Philosopher, all OFL with Cyrillic; name bold, energy light, one size, lowercase. Recommendation: Jost (monoline like the carved wordmark, clearest at 200 px); Philosopher as the warmer backup.

## Centre words v8: Philosopher (APPROVED FOR BUILD, Sasha 2026-11-28 10:01 CST «делай ставь на сайт»)
Mockup: [v27](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v27.jpg) · [centre](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v27-centre.png). Replaces the cursive direction and sketches A/B/C.
1. Font: Philosopher (OFL, Google Fonts), Regular + Bold, self-hosted woff2 in `public/fonts/`, subset Latin + Cyrillic, `font-display: swap`. Used only for the centre words.
2. Four lines, all lowercase, one size: top = moon phase name (Regular), moon energy word (**Bold**); emblem (26/200) at the exact centre; bottom = weekday name (Regular), day energy word (**Bold**). Energy is bold, the name is not.
3. Symmetric about the dial centre: line centres at −15.5%, −10%, +10%, +15.5% of dial diameter. Horizontally centred on the dial centre. Font size 5% of dial diameter, never under 12 px.
4. Colours: moon lines pearl rgb(239,233,220); day lines in the day's planet tint (Thursday rgb(201,182,255); other days: the existing planet colour lifted to ≥4.5:1 on the dial).
5. Energy words (English; engine lead words, also Equilibrium): moon New Moon clearing · Growing Crescent resourcing · Growing Half clarifying · Almost Full prepping · Full Moon harvesting · Past Full celebrating · Fading Half intending · Fading Crescent planning. Week Monday envisioning · Tuesday action · Wednesday clarity & comms · Thursday expansion · Friday fun & beauty · Saturday structure · Sunday renewal. Change only the lead word of each energy string in `src/lib/equilibrium-cycles/index.ts` and the `en` locale values; keep keys and stored values; ru/es values unchanged until Sasha sets them.
6. All screens: phone 390 px (dial 200 px), tablet 768/1024, desktop 1280+, iPad stage.
