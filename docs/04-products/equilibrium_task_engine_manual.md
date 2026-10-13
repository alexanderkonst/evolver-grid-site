# Equilibrium — The Task Engine: Why It Works This Way

> *© 2026 Alexander Konstantinov · CC BY-NC-SA 4.0*
>
> The companion to the User Manual. That one says *how* to fill the watch. This one says *why* the ACT side is built the way it is. Read it when the structure feels strange. Usually that's the moment it's working.

---

## The one idea

**Every action you take today should trace, in one unbroken line, back to the reason you're alive.**

Most task managers start at the bottom: a pile of to-dos, sorted by urgency. Urgency is someone else's priority wearing your clothes. Equilibrium starts at the top and narrows down:

```
Lifelong Dedication   why I'm here            (life)
Role                  what I'm best at         (years)
Moon Focus            this cycle's intention   (29.5 days)
Current Strategy      1–3 directions           (the cycle)
Workstreams           ≤7 streams of work       (weeks)
Intuitive Tasks       ≤7 moves per stream      (days)
DO NOW                1 move                   (now)
```

Each level is a lens that narrows the one above it. By the bottom, a whole life collapses into one move. That move is not "a task." It's your Dedication, expressed at the scale of the next hour.

If a task can't trace back up the chain, it doesn't belong on the watch. Either it serves someone else's chain, or it's noise.

---

## Why the chain is filled from the top

You can't choose well among moves until you know the direction. You can't know the direction until you know the intention. Fill from the bottom and you get a busy list with no spine; the grind the watch exists to end.

So the identity layer (Dedication, Role) is set first and rarely changes. The cycle layer (Focus, Strategy) is set once a month. The motion layer (Workstreams, Tasks, DO NOW) changes daily. **Slow things on top, fast things below.** The fast layer can move freely *because* the slow layer holds still.

---

## Why tasks are "intuitive", not planned

Equilibrium doesn't ask you to plan the how. It asks you to *notice* it.

The lunar sequence enforces this:

- **Planting** gives you strategies: *what direction.*
- **Clearing** tells you to release fear and *not* engineer the how. It isn't yours yet.
- **Gathering** brings people, resources, meetings.
- **Seeing** (First Quarter): the how reveals itself. *Now* you write Workstreams and Tasks, fast, before clarity drifts.

Planned tasks come from the mind under pressure. Intuitive tasks come from a mind that waited until the terrain was visible. The first kind produces long lists you resent. The second produces short lists you actually want to do.

**Rule:** if a section is empty, leave it. Clarity hasn't arrived. An empty field is information, not failure.

---

## Why seven, and not more

Up to **7 workstreams**. Up to **7 tasks** per stream.

Seven is roughly what a human holds in view at once. Past that, a list stops being a field you choose from and becomes a backlog you feel guilty about. A backlog is the grind in storage.

The limit forces the real question: *if this is the eighth thing, which of the seven is it more important than?* Usually the answer is none. Then it doesn't go on the watch. It goes nowhere, and that's fine.

---

## Why DO NOW holds one

DO NOW allows up to 3. **One is recommended.**

This is the **Chosen** stage of the daily arc: the watch forces a single intuitive selection from the whole field, given today's terrain and your direction. Paralysis-by-choice ends the moment one thing claims the present.

Three is a concession for days with real parallel motion. One is the practice. When you notice yourself filling all three, ask what you're avoiding by not choosing.

The **DO NOW** button on a task is a *command* ("start this"). The section is called **DOING NOW** because it describes a *state* ("this is what I am doing"). Command, then state. You promote, then you live inside it.

---

## Why there's no urgency column

Equilibrium has no "high / medium / low." Priority isn't a label on a task; it's the act of promoting one task to DO NOW.

Timing doesn't live in the task either. It lives in the cycles: the lunar phase says *what kind* of work is native now (Seeing writes, Leading sets up, Harvesting ships), the weekday says *what mode* (Tuesday acts, Wednesday communicates, Saturday closes out). A task that fights its day can wait for the day it belongs to.

---

## Why completion cascades

Check the box in DO NOW and the task animates complete and drops into its workstream's **done-pile**. It doesn't vanish.

This is the **Executed** stage. Completion has to be *felt* to close the loop: the next session starts cleaner, and the done-pile becomes the raw material for **Celebrating**, the phase where you announce and thank. Gratitude for what you finished is the fuel for the next Planning. Delete finished work and you starve the next cycle.

---

## Why ATTUNE comes before ACT

The watch is a binary: **ATTUNE** (read the terrain) and **ACT** (work the tool). Feminine, then masculine. Receive, then move.

Acting without attuning is how the grind works: pushing a Harvest task on a Clearing day, then calling the resistance a personal defect. Attune first and the resistance has a name. It's terrain, not a flaw. Then you choose a move that fits the ground.

---

## Why your AI can write here too

Equilibrium is the task manager you share with your AI. You deliver the pulse ("this moved, that's done, this is next") and the AI writes it into the chain: new tasks under the right workstream, completions, the next DO NOW. It reads the same state you do.

Same chain, same limits, same rules for it as for you. If a task the AI proposes can't trace back to your Dedication, it doesn't go on.

---

## The task engine in five rules

1. **Top before bottom.** Direction before moves.
2. **Notice, don't engineer.** Write tasks when the how reveals (Seeing), not before.
3. **Seven is the ceiling.** Past seven is guilt, not a list.
4. **One DO NOW.** Choosing is the work.
5. **Finish, then feel it.** The done-pile feeds the next cycle.

---

## Where it connects

- How to fill it, phase by phase: [`equilibrium_user_manual.md`](./equilibrium_user_manual.md)
- The design spine (locked): `docs/specs/equilibrium/equilibrium_v2_spec.md` (§3 daily arc, §11 ATTUNE/ACT)
- The watch: `/build/equilibrium`
