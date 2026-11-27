# Nature · Aligns You With Natural Rhythms (mini-training)

> Draft v0.2 (2026-11-26), built by Hark on Sasha's brief of 2026-11-26 18:44 MST. Template: [course-from-source.md](../templates/course-from-source.md) (11 steps), roast: [roasting.md](../templates/roasting.md). Name and caption as in [apps/nature.card.yaml](../assets/infographics/apps/nature.card.yaml) (Nature, "Aligns You With Natural Rhythms"); Sasha's working words: "Nature · Align with rhythms of nature".
> Status: **signed by Sasha 2026-11-27 11:50 CST** («Супер! Продолжай по шаблону»). Ships as course version **1.0**. In production: NotebookLM videos, episode infographics, platform.

## Sources (step 3)
- [equilibrium_user_manual.md](../04-products/equilibrium_user_manual.md): Solar Energy (personal year, 5 phases), Lunar Energy and the eight phases (essence, act, trap), elements in pairs, Day-of-Week Energy, A normal day, Three Degrees, Rules.
- [holonic_cycles.md](../01-vision/holonic_cycles.md): Naming table, Circadian (4 quarters), Weekly (Chaldean order, 24 mod 7), Lunar, Seasonal.
- [equilibrium_task_engine_manual.md](../04-products/equilibrium_task_engine_manual.md): only as the bridge to the app (outro).

## 1. Result (step 1, v0.2; will keep improving)
After about 40 minutes the person can, on any day, read where they stand in four rhythms (their year from birthday to birthday, the moon, the week, the day) in under a minute, and choose one action that goes with them instead of against them.
**Check:** at the end they write their own "Now" in four lines (year phase, moon phase, day's planet, part of the day) plus one action, and it is correct for today.
**Shift (initiation):** from Degree 1 "something is wrong with me" to Degree 2 "oh, it's the New Moon, I'm supposed to feel this", with the first taste of Degree 3: shaping the calendar around the rhythms (manual → Three Degrees).

## 2. Architecture v1 (structure set by Sasha, 2026-11-26)
Year (birthday to birthday, its seasons) → Month (4 lunar seasons, 8 phases) → Week (7 visible planets) → Day (one turn of the Earth). One module per rhythm, plus intro and outro. ~12 micro-modules × 90 s, each with an Ask AI button.

## 3. Roast of v1 (tough love, no fixing until the synthesis)
**Roast 1.** The result read "be in sync with nature": a vibe, not a skill. Nothing checkable. Twelve videos of tables (5 year phases, 4 seasons, 8 phases, 7 days, 4 quarters = 28 items) is a lecture, not an initiation. No threshold, no moment where the person does something.
**Roast 2.** Two different "years" collide: the personal year from the birthday and the Earth's seasons. In the southern hemisphere the seasons flip, near the tropics (San Pancho) they barely show. Mixing them without saying so confuses. The week's planetary modes and the lunar jobs are tradition and practice, not science; the day's rhythm is biology. Presented in one voice, the skeptic drops the whole course at the first planet.
**Meta-roast.** The roast protected the order. Year→day goes from the slowest, most abstract rhythm to the most felt one; an initiation usually starts from what you already feel. But the structure is Sasha's, so the fix is inside it: open with the felt experience (Three Degrees) and close with the day, where everything lands in the body. Deepest issue not named: the course must end in the person's own today, or it stays knowledge.
**Crash-test (busy, skeptical person).** Died because: "astrology" alarm at minute 3, too many numbers, nothing to do after. Ashes: the Three Degrees relief ("nothing is wrong with you") and the moon as a window with days left survive and pull. Next: lead with relief, label every claim, one idea per episode, end with a written Now.

## 4. Architecture v2 (synthesis)
- **Result** made checkable (section 1).
- **Honesty labels** on screen per episode: *established* (Earth's turn, the lunar cycle, planet names in the weekdays, the circadian shift), *tradition* (planetary day modes, seasons as phases of a year), *practice* (the jobs of the eight phases, the personal-year phases). No claim that the moon changes behaviour.
- **Two years, named apart:** your year (birthday to birthday) is the main one; the Earth's seasons are the outer one, with a hemisphere line.
- **Numbers live on the infographic, not in the narration.** Each episode carries one idea.
- **Every Ask AI button reads the person's own today** (birthday from the platform, today's date), up to 5 lines.
- **Rite at the end:** the person writes their Now (four lines + one action). Then the door to Equilibrium (`/build/equilibrium`), where the watch reads it for them daily.
- Zodiac layer cut (manual: a flavor layer).

| Module | Code | Micro-module | One idea |
|---|---|---|---|
| Intro | N01 | Nothing Is Wrong With You | You feel terrain you don't see yet. Three degrees: asleep, aware, attuned. |
| Year | Y01 | Your Year Starts on Your Birthday | Your own year has five phases, from fresh start to wind down. |
| Year | Y02 | Two Years Turn at Once | Your year and the Earth's seasons: the inner and the outer. |
| Month | M01 | The Moon Has Four Seasons | Month comes from moon; its four seasons are fire, water, earth, air. |
| Month | M02 | The Seed Half | Planning, Planting, Clearing, Gathering: the how is none of your business. |
| Month | M03 | The Harvest Half | Seeing, Prep for Harvest, Harvesting, Celebrating. |
| Month | M04 | The Cycle Starts After You Celebrate | Don't skip gratitude; the next intention rises out of the quiet. |
| Week | W01 | Seven Lights Named Your Week | The weekdays carry the seven visible planets, by simple arithmetic. |
| Week | W02 | Don't Run the Week in One Mode | Each day has a native mode; honour each a little. |
| Day | D01 | One Turn of the Earth | Morning creates, afternoon polishes, evening closes, night ripens. |
| Day | D02 | Waves Inside the Day | The ~90-minute wave: 3–4 deep sprints a day, then rest. |
| Outro | O01 | Read Your Now | Four rhythms in under a minute, one action, then the watch. |

12 micro-modules × (90 s video + one Ask AI turn) ≈ 35–40 minutes (template limit 40).

## 5. Look & feel (step 7)
**Course look:** nested rings of a living dial, opening at night and turning toward dawn; aqua, moon silver, warm sand; soft grain; slow turning motion; never mechanical clock ticks, never zodiac clip-art.
**Infographic:** kit v4 skin, AQUA halo of the Nature app icon. Overview card: [book/nature/N00](../assets/infographics/book/nature/N00.png) (four rings around You; asleep · aware · attuned).

## 6. Micro-modules (step 6), v0.2
Each: promise line · text (source for NotebookLM, ~90 s) · label · scene · Ask AI.

### N01 · Nothing Is Wrong With You
**Promise:** Some days you can't push, and it isn't a flaw.
**Text:** There are days when everything flows and days when nothing moves, and most of us decide something is wrong with us. Usually nothing is. You are feeling terrain you can't see yet: the turn of the day, the week, the moon, your own year. These rhythms move every living thing, and they move you whether you notice or not. There are three degrees of living with them. First, unconscious: "things are wrong with me." Second, conscious: "oh, today is the New Moon, I'm supposed to feel like this." Recognition alone dissolves the shame. Third, collaboration: "it's a clearing day, so I'll release and reschedule the push." You shape your calendar around the rhythms instead of fighting them. This mini-training walks you from the first degree to the second, and gives you a taste of the third. Four rhythms, from the slowest to the closest: your year, the moon, the week, the day.
**Label:** practice. **Scene:** a figure at night under nested faint rings; the first ring catches light.
**Ask AI:** "Recall a week when I felt 'wrong' for no clear reason. Ask me 2 short questions to see if it matched a natural low (time of day, the moon, the season, the end of my personal year). Up to 5 lines."

### Y01 · Your Year Starts on Your Birthday
**Promise:** Your real new year is the day you were born.
**Text:** The calendar year starts on the first of January for everyone. Your year starts on your birthday. It has five phases. Fresh start, the first two weeks or so: a new road opens, maximum potential, minimum proof. Big push, roughly days 14 to 90: the year's biggest output belongs here. Steady stretch, days 90 to 270: the long middle, rhythm, not spikes. Harvest time, days 270 to 335: reap, close projects, announce wins. Wind down, the last month: resolve loose ends and don't start big things. If the weeks before your birthday feel heavy and scattered, that's the wind down doing its work. If right after it you want to begin everything at once, that's the fresh start. Knowing where you are in your own year tells you what kind of effort is native right now.
**Label:** practice. **Scene:** one large ring with a lit point at the birthday; five arcs of different light around it.
**Ask AI:** "My birthday is {birthday}. Today is {today}. Which phase of my personal year am I in (fresh start, big push, steady stretch, harvest time, wind down), and what one kind of effort belongs to it? Up to 5 lines."

### Y02 · Two Years Turn at Once
**Promise:** Your year inside, the Earth's year outside.
**Text:** Two years turn at once. Your own, from birthday to birthday, and the Earth's, the seasons. The Earth's year has its own logic: spring for seeds and new projects, summer for execution and expansion, autumn for launch and harvest, winter for integration and rest. Your personal year is the main one for your work, because it's yours. The seasons are the weather around it. Sometimes they agree, and a harvest phase falls in autumn: easy. Sometimes they pull apart, and your big push lands in winter: then push, and rest more. Two notes. In the southern hemisphere the seasons are reversed. Near the tropics they're soft, and the year shows more in rain and dry than in snow. Notice both years, and let the inner one lead.
**Label:** established (seasons) · tradition (seasons as phases of work). **Scene:** two rings, inner warm and outer cool, turning at different speeds.
**Ask AI:** "I live in {location if known, else 'ask me where'}. My birthday is {birthday}. How do my personal-year phase and the current season meet right now, and what does that suggest for this month? Up to 5 lines."

### M01 · The Moon Has Four Seasons
**Promise:** Every month is a small year.
**Text:** The word month comes from moon. Every 29 and a half days the moon goes through its whole cycle, and that cycle is a small year with four seasons, each about a week long. Fire is will: the end of one cycle and the first intention of the next. Water is emanation: the dark of the moon, where directions take shape before you can see them. Earth is digestion: first light, when what you need arrives and the picture comes together. Air is enrichment: the build-up to the full moon and the harvest itself. Each season holds two phases, eight in all. The moon is the most useful clock you have for a month of work, because it gives you windows, not deadlines: you can see how many days are left in the phase you're in.
**Label:** established (lunar cycle, 29.5 days) · practice (the four seasons). **Scene:** a moon passing through four tinted quarters of a ring: ember, deep blue, green-gold, pale aqua.
**Ask AI:** "Today is {today}. Which moon phase are we in, which of the four lunar seasons (fire, water, earth, air) holds it, and how many days are left? Then one line on what it's for. Up to 5 lines."

### M02 · The Seed Half
**Promise:** The how is none of your business, yet.
**Text:** The moon's cycle has two halves. The first is the seed, and its rule is simple: the how is none of your business yet. Planning, at the last quarter: after the harvest it goes quiet, and the next intention rises by itself. You notice it and name it in one to three words. Planting, the waning crescent: in the dark, one to three directions start to show. Note them, don't lock them. Clearing, the new moon: the intention is bigger than the old you, and fear comes up. Let it pass through. Crying releases; complaining locks it in. Don't invent the how while afraid. Gathering, the waxing crescent: first light. People, leads and coincidences arrive. Say yes, receive, don't filter too early. In this half you don't build. You notice, release and receive.
**Label:** practice. **Scene:** a seed in dark soil under a thinning, then returning, crescent; roots in blue light.
**Ask AI:** "We're in the {current phase} phase. Ask me one question that helps me notice what this phase is bringing me (an intention, a direction, a fear to release, or what has arrived). Up to 5 lines."

### M03 · The Harvest Half
**Promise:** Clarity first, then the work, then the fruit.
**Text:** The second half is manifestation. Seeing, the first quarter: everything gathered clicks into one picture, and the strategy crystallizes, often in the last hours of the phase. Write it and lock it. Prep for Harvest, the waxing gibbous: the farmer before the harvest. Now, and not before, you write the workstreams and the tasks, and you prepare the tools, the people and the storehouse. Harvesting, the full moon: the peak. Ship, close, receive what has ripened. What isn't ripe stays on the vine, and you don't start anything new. Celebrating, the waning gibbous: say the win out loud and give thanks. Each phase has a trap: drifting unwritten, reopening the strategy, planning during the harvest, skipping the thanks. Each phase has one job. Do that job, and the next phase gets easier.
**Label:** practice. **Scene:** a field brightening under a growing moon into full gold light, baskets filling.
**Ask AI:** "Here's what I'm working on: {mission or current project, else 'ask me'}. If I lived the next harvest half of the moon by its four jobs, what would each phase ask of me? One line each. Up to 5 lines."

### M04 · The Cycle Starts After You Celebrate
**Promise:** Gratitude is the fuel for what comes next.
**Text:** When does a new cycle begin? Not on the first of the month, and not at the new moon. It begins after the full moon, once the harvest has been celebrated. First you ship what's ripe. Then you announce it, thank what made it possible, and feel the gratitude. Then it goes quiet, and from the realized potential of that harvest the next intention starts to surface. That surfacing is Planning, about three and a half days after the full moon. Most people skip the celebration and jump straight from the harvest into planning the next thing. It feels efficient. It drains the fuel. Gratitude is what the next intention grows from. So the rule is short: don't skip Celebrating. Announce, thank, then let the quiet come.
**Label:** practice. **Scene:** a fire circle under a waning moon; warm light rising into a quiet sky.
**Ask AI:** "What did I harvest in the last few weeks? Ask me, then help me name one win to say out loud and one person or thing to thank. Up to 5 lines."

### W01 · Seven Lights Named Your Week
**Promise:** Your weekdays are named after the sky.
**Text:** Look up on a clear night and, with the naked eye, you'll find seven lights that move against the stars: the Sun, the Moon, Mars, Mercury, Jupiter, Venus and Saturn. Ancient astronomers gave each hour of the day to one of them in a fixed order, and the planet of a day's first hour named the whole day. Because a day has 24 hours and there are 7 planets, each day jumps three places in that ring, and the week falls out in exactly the order we still use. Sunday is the Sun's day, Monday the Moon's. In Spanish and French the rest is plain: martes for Mars, miércoles for Mercury, jueves for Jupiter, viernes for Venus. Saturday is Saturn's. Your week is a slow walk past seven lights.
**Label:** established (the names and the arithmetic) · tradition (planetary hours). **Scene:** seven lights stepping around a ring by threes, each lighting a day.
**Ask AI:** "Show me, in up to 5 lines, how my language's weekday names trace back to the seven planets, and which planet rules today."

### W02 · Don't Run the Week in One Mode
**Promise:** A week with seven modes composes itself.
**Text:** Tradition gives each day a native mode. Sunday, the Sun: illumination, celebration, renewal. Monday, the Moon: intuition, reflection, visioning. Tuesday, Mars: action and courage, decisive execution. Wednesday, Mercury: clarity and communication, writing and calls. Thursday, Jupiter: expansion and the big picture. Friday, Venus: beauty, harmony and connection. Saturday, Saturn: structure, discipline, closing out. This is tradition, not lab science, so treat it as a lens, and test it on yourself. The wisdom is simple: don't run the whole week as one mode. Seven days of pushing burns you out; seven days of reflecting gets nothing out the door. Honour each day at least a little, a call on Wednesday, a walk with someone on Friday, a tidy desk on Saturday, and the week composes itself.
**Label:** tradition. **Scene:** seven small arcs, each with its own colour within the course palette.
**Ask AI:** "Today is {weekday}. What's its traditional mode, and what's one small thing in my day that would honour it? Up to 5 lines."

### D01 · One Turn of the Earth
**Promise:** Mornings create, afternoons polish.
**Text:** The closest rhythm is the day: one turn of the Earth. Your body runs on it more than on anything else. Light in the morning, dark at night, and your nervous system shifts across the day from activation toward rest. That gives the day four natural quarters. Morning, roughly six to noon: peak creation, the time for the work that needs your freshest mind. Afternoon, noon to six: polish and communicate, meetings, edits, replies. Evening, six to ten: close and reflect. Night: sleep and dreams, when what you did during the day ripens. Mornings create, afternoons polish. If you spend your best morning hours on email, you're giving your peak to the smallest job.
**Label:** established (circadian rhythm) · practice (the four quarters as work modes). **Scene:** the Earth turning slowly from night to dawn, the inner ring catching the first light.
**Ask AI:** "Here's how my day usually goes: ask me in one question. Then tell me which part of my day I'm spending against the four quarters, and one swap. Up to 5 lines."

### D02 · Waves Inside the Day
**Promise:** Work in waves, not in a straight line.
**Text:** Inside the day there are smaller waves. Research on attention describes a basic rest-activity cycle of roughly 90 minutes that runs through the day as well as through sleep. You can work with it: a deep sprint of about an hour and a half, then a real break. Most people have three or four good sprints in a day, not eight hours of focus. Inside a sprint there's a smaller rhythm too: a few minutes to arrive, a long stretch of focus, a few minutes to close. And at the bottom of every rhythm is your breath. When you notice the dip at the end of a wave, it isn't laziness. It's the wave finishing. Stand up, look far away, breathe slowly, and the next wave comes.
**Label:** established (ultradian cycle, ~90 min) · practice (sprint structure). **Scene:** a calm sea of waves inside the day ring, three or four tall ones lit.
**Ask AI:** "Help me place 3 deep work sprints of about 90 minutes into my day tomorrow, with breaks, given the four quarters of the day. Up to 5 lines."

### O01 · Read Your Now
**Promise:** Four rhythms in under a minute.
**Text:** Now put it together. Where are you in your year, birthday to birthday? Which phase is the moon in, and how many days are left? Which planet rules today? Which part of the day is it? Four answers, under a minute. Then one action that goes with them: a push in a big-push month on a Mars morning, or release on a new moon, or a thank-you on a Celebrating evening. That's the whole practice. Recognition comes first, and it already changes how the day feels. Collaboration grows over weeks, as you start shaping your calendar around what you read. You don't have to do the arithmetic every day. Equilibrium, the watch on our platform, reads all four for you and keeps your intention, strategy and next task in step with the moon.
**Label:** practice. **Scene:** all four rings lit at once around the figure; dawn breaks fully.
**Ask AI (the rite):** "My birthday is {birthday}, today is {today}, and it's {time of day}. Write my Now in 4 lines (year phase, moon phase and days left, today's planet and mode, part of the day), then 1 line: the one action that goes with all four. Up to 5 lines."

## 7. Wizard (step 9)
The person passes N01 → Y01–Y02 → M01–M04 → W01–W02 → D01–D02 → O01. The badge is given when they send the O01 rite and its Now is written. Door: Equilibrium (`/build/equilibrium`).

## 8. Next (after Sasha's signature)
1. NotebookLM: one notebook per micro-module, Explainer 16:9, 90 s, course look + episode scene (runbook in course-from-source.md → Production line). Upload unlisted, one playlist.
2. Episode infographics in the kit (book/nature/), one per micro-module.
3. Platform through an @claude issue: `src/data/courses/nature.ts` (version 1.0, level Fundamental, category General), thin page, route, Grow row, Ask AI cards.

## 9. NotebookLM inputs (runbook action 7; pasted, never composed during the run)
**Notebook name:** `<code> <Title> v1.0`, e.g. `N01 Nothing Is Wrong With You v1.0`. Source = the episode's **Text** in section 6 (promise line on top).
**Format:** Explainer · Custom. Add to the end of the focus box: "Total video length must stay under 90 seconds."
**Style line (whole course):** Bio-Light aesthetic, inverted colors (dark background): nested rings of a living dial slowly turning from night toward dawn; aqua, moon silver, warm sand; soft grain; slow, calm motion; never mechanical clock ticks, never zodiac clip-art, no faces, no text clutter.
**Focus lines (one per episode):**
| Code | Focus |
|---|---|
| N01 | Only the three degrees: unconscious, conscious, collaboration. Relief first: nothing is wrong with you. |
| Y01 | The personal year from birthday to birthday and its five phases; one kind of effort per phase. |
| Y02 | Two years at once: personal year leads, Earth's seasons are the weather; hemisphere and tropics note. |
| M01 | Month comes from moon; four lunar seasons (fire, water, earth, air), windows not deadlines. |
| M02 | The seed half: Planning, Planting, Clearing, Gathering; the how is none of your business yet. |
| M03 | The harvest half: Seeing, Prep for Harvest, Harvesting, Celebrating; one job and one trap each. |
| M04 | The cycle starts after the celebration; don't skip gratitude. |
| W01 | Seven visible lights name the weekdays; the 24-hours-and-7-planets arithmetic, plainly. |
| W02 | Each day's traditional mode, labeled as tradition; don't run the week in one mode. |
| D01 | One Earth turn, four quarters of the day; mornings create, afternoons polish. Label the biology as established. |
| D02 | The ~90-minute wave; 3–4 deep sprints a day; the dip is the wave ending. |
| O01 | Read your Now: four rhythms in under a minute, one action; Equilibrium as the watch that reads them daily. |

## 10. Production tracker (v1.0)
| Code | Notebook | Video | YouTube (unlisted) | Infographic |
|---|---|---|---|---|
| N01 | | | | |
| Y01 | | | | |
| Y02 | | | | |
| M01 | | | | |
| M02 | | | | |
| M03 | | | | |
| M04 | | | | |
| W01 | | | | |
| W02 | | | | |
| D01 | | | | |
| D02 | | | | |
| O01 | | | | |

## Changelog
- 0.1 (2026-11-26): architecture v1 from Sasha's structure.
- 0.3 (2026-11-27): signed by Sasha; NotebookLM inputs and production tracker added; production started (videos, infographics, platform in parallel).
- 0.2 (2026-11-26): roast (3 passes + crash-test) → v2: checkable result, honesty labels, two years named apart, rite at the end; 12 micro-module texts; overview infographic N00.
