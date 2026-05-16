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

```
                          Doing
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

**Set 2 Goals.** Engineer, Architect. Decide. Liberate.

**Fill the goals with emotion.** Not just thought — *felt*.

This is the architectural phase of the *next* cycle. The previous cycle
just closed in Celebrating; you're now designing what comes next. Two
goals — not seven. Discipline of restraint. Decide which two will get
the cycle's full energy.

The emotional charge matters: a goal you only think about doesn't have
the propellant. A goal you can *feel* — relief, anticipation, dignity —
is the one the body will execute.

## Phase 2 — Planting (Waning Crescent)

**Sex. Impregnate the Universe with your Goals.**

**Memorize the 2 Goals.** Daily meditation. Visualize. Movie them in your
mind.

> *"The How is None of Your Business."*

This is the surrender phase. The seed is planted in the dark. You don't
dig it up to check. You don't engineer the path from seed to harvest.
You hold the goals daily, vividly, and *let the universe arrange the
how*.

The mistake here is trying to solve. The mistake is checking. The
mistake is doubting. The work is *holding the picture* until the cycle
ripens it.

## Phase 3 — Clearing (New Moon)

**Dumping.** Banishing spell, fast. Ritual.

**Time to cry. No complaining.** Fear of time and drama come up.

The sky is fully dark. Everything that doesn't belong in the new cycle
surfaces to be cleared. Tears come. Drama comes. Old fears come. This
is *the right time* for them — you're not derailed, you're emptying.

Critical: **cry, don't complain.** Crying is clearing. Complaining is
re-planting. The phase requires the difference.

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

**The "How" is Revealed.** Telescope Vision. **Ah-Ha.**

**Put on Glasses.**

The half-lit moon. The first moment of clarity. What you couldn't see
through Planting and Gathering now *appears* — not because you forced
it, but because the cycle ripened it.

The instruction is to *see clearly* before acting. Put on the glasses.
Look through the telescope. Recognize the path that just appeared. The
next phase (Leading) is where you start to walk it.

## Phase 6 — Leading (Waxing Gibbous)

**Administration. Organization.** 90% admin, 10% work.

The moon is nearly full. You've seen the path. Now you orchestrate.
Sequence the steps. Prepare the field. Allocate. Schedule. Coordinate.

This is *not* the execution phase. The work itself is still ahead. But
without this admin layer, the execution phase scatters. Lead now so
Doing can be focused.

## Phase 7 — Doing (Full Moon)

**100% Gangsta.** High-energy physical to-do.

**Harvest & cut. Sweaty GTD.**

The moon is full. All the light is on. This is the only phase where
physical execution is the right move. Sweat. Push. Cut what needs
cutting. Harvest what's ripe. Get the visible work done.

The mistake here is to plan — you should have planned in Phase 1. The
mistake is to gather — you should have gathered in Phase 4. *This is
the phase to do.* Pure embodied action.

## Phase 8 — Celebrating (Waning Gibbous)

**Party. Gratitude. Show Off.** Brag.

**Celebrate others' wins.**

The first decline of the moon. The cycle is wrapping. Before going dark
again, honor what was harvested. Speak the wins. Show off without
shame. Receive recognition. Give recognition.

This is the *closing ritual* of the cycle. Skip this phase and the next
Planning lacks the emotional fuel — you forgot what's possible because
you didn't honor what just happened.

---

## Rinse & Repeat

The cycle returns to Last Quarter. New goals. New cycle. The wisdom of
each completed cycle remains; the structure is the same; the content
deepens.

## Mapping to Equilibrium v2 code

Each phase appears in [src/lib/equilibrium-cycles/index.ts](../../../src/lib/equilibrium-cycles/index.ts)
as a `MoonPhaseInfo.energy` string — compressed distillation, leading
with the Phase Name. The pill stack on Box 6 (Lunar Energy) renders
prev/current/next via these energy strings.

The full wisdom for each phase lives only in this document so the source
signal isn't lost when the pill strings get re-tuned over time.
