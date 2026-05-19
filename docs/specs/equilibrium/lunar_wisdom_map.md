# The 8-Phase Lunar Wisdom Map

> Captured 2026-05-16 from Sasha's source infographic (Tamyris Garcia
> visualization). This is the deep teaching behind the lunar energy
> labels used in Equilibrium v2. The pill labels in [cycles.ts](../../../src/lib/equilibrium-cycles/index.ts)
> are compressed distillations — this file preserves the full signal.

## The cycle

8 phases × ~3.69 days each = 29.53-day synodic cycle. The cycle reads as
two halves of a hero's journey: **Last Quarter → New Moon → First
Quarter** is the inner/seed half ("the How is none of your business"),
and **First Quarter → Full Moon → Last Quarter** is the outer/manifest
half (the How reveals, the work happens, the harvest celebrates).

### The 4-Quarter Umbrella — Holonic Quadrants (refined 2026-05-18 round 4)

The 8 phases nest inside 4 holonic quadrants. Quadrant NAMES stay
internal; only the **element emoji** surfaces in the UI as a quiet
umbrella above the pills.

| Holonic Quadrant | Element (UI emoji) | Phases inside | What this half-cycle is for |
|---|---|---|---|
| **Will** | Fire 🔥 | Celebrating · Planning | Acknowledge the realized potential; the next intention surfaces. (Post-peak opening — the seed-fire ignites just after the visible apex.) |
| **Emanation** | Water 💧 | Planting · Clearing | Strategies reveal in the dark; release fear. (Deep gestation, interior work.) |
| **Digestion** | Earth 🌍 | Gathering · Seeing | Receive resources; the how reveals. (Body building, results emerging.) |
| **Enrichment** | Air 🌬️ | Leading · Harvesting | Prep the field; reap what's ripe. (Preparation peaking into visible harvest.) |

### Correction history (don't repeat the mistakes)

**Round 1 (2026-05-16):** Will placed at Harvesting + Celebrating — i.e.,
the harvest was treated as the start of the new cycle. Sasha rejected:
the Full Moon is *closure*, not opening.

**Round 3 (2026-05-16 later):** Will shifted to Planning + Planting (Last
Quarter + Waning Crescent). Reasoning: "the winter solstice is the
phase AFTER the celebration phase. That's what's really going on here."
This put the wheel-start at Winter Solstice equivalent.

**Round 4 (2026-05-18 — current):** Will refined further to **Celebrating
+ Planning** (Waning Gibbous + Last Quarter). Sasha: *"Full Moon is still
celebration happening, so it's really the closure more than it is the
opening. And Waning Gibbous is the opening."* The seed-fire of the new
wheel ignites IMMEDIATELY after the visible peak — Celebrating carries
forward into the new wheel as the first expression of Will (gratitude
generates the propellant for what comes next).

This places Full Moon at the END of Enrichment (Air, peak clarity =
visible harvest), and Waning Gibbous at the START of Will (Fire,
seed-fire under the still-visible glow). Each pair stays clean.

### Why this is the umbrella (not invented words)

Sasha already has the holonic framework. The mapping is also tied to the
element correspondences that show up across cycles (weekday planetary
days, zodiac elements). Inventing parallel vocabulary (like "CLEAR /
ORIENT / BUILD / RESEED" — earlier rejected draft) would fragment the
framework. The emoji-only surface keeps the depth available without
forcing the user to learn new words.

In code, each `MoonPhaseInfo` declares its `holonicQuadrant`. The
LunarState pulls the `elementEmoji` from the holonic phase info and
passes it to the UI as the eyebrow above the pill stack.

```
                        Harvesting
              Leading       ╱│╲       Celebrating
                  ╱        Full Moon         ╲
        Waxing Gibbous              Waning Gibbous
                  │                        │
              Seeing                    [Rinse &
        First Quarter                    Repeat]
                  │                        │
            Waxing Crescent          Last Quarter
                  ╲                        ╱
                Gathering              Planning
                          ╲             ╱
                          New Moon
                          Clearing
                  ╲                        ╱
                  Waning Crescent
                        Planting
                  "The How is None of Your Business"
```

## Phase 1 — Planning (Last Quarter)

**The next intention surfaces.** Receive it. Name it.

This is the FIRST phase of the new cycle — but its work is receptive,
not architectural. The previous cycle just closed with Celebrating; the
harvest realized potential; from that realized potential, the next
intention emerges. The intention isn't engineered, it's *noticed*.

In the 3.5 days of the Last Quarter, what wants to be done next becomes
obvious. It surfaces. It clarifies. It comes from the just-finished
harvest the way the next farming season's plan comes from the granary
you just filled — you know what to plant next BECAUSE of what you just
reaped.

The mistake here: treating this phase as goal-setting workshop. Trying
to "decide" the next intention by force. The right move is to slow down,
sense what's surfacing, and *name it* clearly.

Sasha 2026-05-16: *"The Full Moon isn't even the beginning. The
beginning is: the intention reveals itself in those 3.5 days. It
becomes obvious. It surfaces from the harvest that was just collected.
The harvest allows for the potential that was realized through the
harvest to then generate that next will."*

## Phase 2 — Planting (Waning Crescent)

**The 1–3 strategies reveal themselves.** Write them down.

Where Phase 1 surfaces the *intention* (the WHAT), Phase 2 surfaces the
**strategies** that translate the intention into directions (the
through-lines of HOW it will be lived). 1–3 of them — not seven.

This is still receptive work. The strategies aren't engineered any more
than the intention was. They arrive. The work is to *recognize* them
when they show up and *capture* them — write them down, name them in
plain language, get them out of the head and into a place you can
return to.

Sasha 2026-05-16: *"The planting phase is where one essentially
receives the understanding of what — not just the intention, but those
one to three strategies reveal themselves. That's what happens. Not in
the planning phase, but the one to three strategies that translate
that intention into directions, that's the planting phase."*

Concrete capture surfaces in the watch:
- The **Moon Focus** input (Box 6) — for the cycle's intention.
- The **Current Strategy** section (Box 8) — for the 1–3 strategies
  that just revealed themselves.

The mistake here: ignoring the revelation because no "goal" has been
written yet. The revelation IS the work. Capture it.

## Phase 3 — Clearing (New Moon)

**Release fear. Cry, don't complain.** The how is not yours yet.

This is THE phase where "the how is none of your business" matters
most. Here's why: the new intention is ambitious or novel — a new stage
for the human, whether the human knows it or not. The strategies have
revealed themselves but the actual moves are still unclear. So the
mind freaks out: *"how am I going to do this?"*

That freak-out is the trigger for resistance. The old version of the
human starts forming or reinforcing limiting beliefs — *"that's not
possible for me"*, *"that won't work"*, *"who am I to do that"*. Those
beliefs actively counter-manifest the potential the cycle is trying to
realize.

The work in Clearing: let the fear move WITHOUT forming beliefs around
it. Cry, don't complain. Cry is release. Complaint is reinforcement.

Sasha 2026-05-16: *"The danger is to form a body of beliefs or reinforce
a body of beliefs that essentially works against that manifestation and
so results, and so one starts to essentially actively counteract all
that beautiful potential harvest. The less consciousness one has about
these processes, the more one resists, and the more one resists, the
more one puts sticks into the bicycle wheels and prevents the good
stuff from happening."*

The mistake here: trying to figure out the how during the freak-out.
Forming limiting beliefs as the resistance speaks. Discharging on
others. The right move: feel it, cry if needed, and remember that the
how is not yours yet — it will reveal in Seeing.

## Phase 4 — Gathering (Waxing Crescent)

**FedEx.** Raw resources arrive.

**Yes ritual.** Talk sweet. Be open to possibilities.

**Honor self & others.** Law of attraction.

> *"The How is **Still** None of Your Business."*

The first sliver of moon returns. Resources, leads, conversations,
serendipities show up — but the work isn't to *grab* them. The work is
to *receive*. To say yes. To be open. To talk sweetly to whatever shows
up.

The "how" is still hidden. But materials are gathering. Trust that
what's arriving is exactly what the goals require.

## Phase 5 — Seeing (First Quarter)

**The how reveals. Write it down before clarity drifts.**

The half-lit moon. The first moment of clarity about the HOW. What you
couldn't see through Planting and Gathering — *how exactly the
intention will be realized in concrete moves* — now becomes obvious.
Not because you forced it, but because the cycle ripened it.

The instruction: capture what just got clear, in writing, fast. The
clarity is fragile. Within hours or a day it drifts back into the
ambient noise of options. Whatever the watch's capture surface (Moon
Focus, Strategy notes, a quick journal), use it.

Concrete answer to *"where in the watch do I capture this?"*:
- **Moon Focus** (Box 6) for the cycle's core intent.
- **Current Strategy** (Box 8) for the directions.
- **Workstreams** (Box 9) — names of the streams of work the strategies
  open.
- **Intuitive Tasks** (Box 10) — the first concrete moves under each
  workstream.

Removed from this phase's wisdom: "telescope vision" — that's metaphor
without instruction. The actual instruction is *write it down*.

## Phase 6 — Leading (Waxing Gibbous)

**Prep for harvest. Set up infrastructure. Get the help.**

The moon is nearly full. You've seen the how. Now ready the life-system
to receive the upcoming harvest.

This is the FARMER'S pre-harvest phase: storage room, instruments,
helpers. The work is to make sure you can actually receive what's about
to come. Without this prep, the next phase (Harvesting) scatters — you
have ripe fruit and no place to put it, or you have a big delivery and
no driver.

Concrete moves:
- Schedule the time blocks for Harvesting.
- Set up tools / files / systems that will hold the output.
- Get the help — hire, delegate, ask, schedule.
- Clear distractions so Harvesting can be focused.

The mistake here: starting to execute. That's Phase 7. Here you
*prepare for* execution.

## Phase 7 — Harvesting (Full Moon)

> Renamed 2026-05-16 from "Doing" → "Harvesting." Sasha: *"'Doing'
> doesn't make the cut, it's too big. Doing your harvesting is doing,
> but maybe a fusion of those two. It's the pinnacle of reception. It's
> the fruits of labor stage."*

**Reap what's ripe. Cut. Receive the fruits of labor.**

The moon is full. The cycle is at its peak. This is where you DO the
work AND collect what the work produces — fused. Not 100% physical
(that's reductive). It's both work and reception.

What's ripe: ship the deliverables, close the deals, send the proposals,
make the calls, cut the release. Whatever has matured through the cycle
to completion — *grab it and store it now*. Unripe stuff stays on the
vine.

Concrete moves:
- Ship what's ready.
- Close conversations that have ripened.
- Collect what's owed (literal and figurative).
- Don't start new things — finish what the cycle already grew.

The mistake here: planning (that was Phase 1) or gathering (that was
Phase 4). This is the only phase where execution-plus-reception is the
right move. Pure embodied harvest.

## Phase 8 — Celebrating (Waning Gibbous)

**Announce the harvest. Thank. Feel the gratitude.**

The first decline of the moon. The cycle is wrapping. Before going dark
again, honor what was harvested AND *thank what made it possible*.

Two moves, equally important:

1. **Announce / brag well.** Speak the win. Tell people. Show off
   without shame. This is closing-ritual hygiene — the cycle needs to
   be *spoken* to fully end.
2. **Thank. Feel the gratitude.** This is the missing piece in most
   "celebrate" advice. Gratitude is the **emotional fuel for the next
   Planning**. Skip this and Phase 1 of the next cycle has no
   propellant — the next intention surfaces but without the energetic
   charge to actually pursue it.

Sasha 2026-05-16: *"It has to be like a scene celebrated and not only
honored but also thanked. Yeah, it's the gratitude — the gratitude is
the emotional fuel. So celebration AND gratitude is the emotional
fuel."*

The mistake here: skipping straight from harvest to planning. The
cycle requires this closing acknowledgment to compost properly.

---

## Rinse & Repeat

The cycle returns to Last Quarter. New goals. New cycle. The wisdom of
each completed cycle remains; the structure is the same; the content
deepens.

## Verb-forward pill labels (locked 2026-05-16, round 2)

Re-tuned after Sasha's deep wisdom pass. Voice rule: every action must
pass the "what does that even mean?" test — point at a specific thing
the user can do or notice. No metaphor without instruction.

| Phase | Pill label |
|---|---|
| New Moon | Clearing · Release fear · Cry, don't complain · The how is not yours yet |
| Waxing Crescent | Gathering · Say yes · Take meetings · Receive resources |
| First Quarter | Seeing · The how reveals · Write it down · Capture before it drifts |
| Waxing Gibbous | Leading · Prep for harvest · Set up infrastructure · Get the help |
| Full Moon | Harvesting · Reap what's ripe · Cut · Receive the fruits of labor |
| Waning Gibbous | Celebrating · Announce the harvest · Thank · Feel the gratitude |
| Last Quarter | Planning · The next intention surfaces · Receive it · Name it |
| Waning Crescent | Planting · The 1–3 strategies reveal · Write them down |

## Ultra-concise inline guidance (one short sentence, watches are glanced)

Rendered as a single sentence (10–18 words) below the active pill —
*middle path* between 2-4 word pills and a paragraph. Same construction
across all 8 phases.

| Phase | Inline guidance |
|---|---|
| Clearing | The mind freaks out about the how — that's the resistance to release. Cry, don't complain. Don't form limiting beliefs. |
| Gathering | Say yes to whatever arrives — meetings, resources, opportunities. The how is still not yours. |
| Seeing | The how you couldn't see now becomes obvious. Write it down before the clarity drifts. |
| Leading | Prepare the system for the upcoming harvest — what tools, helpers, and storage need to be in place? |
| Harvesting | Reap what's ripe. Cut what's ready. Receive the fruits of labor — both work and reception. |
| Celebrating | Announce the harvest. Thank what made it possible. Gratitude is the emotional fuel for the next cycle. |
| Planning | The next intention surfaces from the just-finished harvest. Notice it. Name it. Don't engineer it. |
| Planting | The 1–3 strategies that translate the intention into directions reveal themselves. Capture them as they arrive. |

## Mapping to Equilibrium v2 code

Each phase appears in [src/lib/equilibrium-cycles/index.ts](../../../src/lib/equilibrium-cycles/index.ts)
as a `MoonPhaseInfo.energy` string — compressed distillation, leading
with the Phase Name. The pill stack on Box 6 (Lunar Energy) renders
prev/current/next via these energy strings.

The 4-Quarter umbrella + time-to-next-phase + inline guidance are
rendered as overlays on the lunar `<CycleEnergyBar>` — eyebrow above the
pills, sub-label below the active pill.

The full wisdom for each phase lives only in this document so the source
signal isn't lost when the pill strings get re-tuned over time.
