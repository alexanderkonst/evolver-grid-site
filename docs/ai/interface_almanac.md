# Interface Almanac

> Evolutionary map of the human–machine interface: one invariant parameter, tracked through phase shifts. Same method as [game_design_almanac.md](../02-strategy/game_design_almanac.md). Feeds `docs/specs/ai-familiar/ai-familiar_tracker.md` §17 (interface features F1–F5) and library *Technology 176, 178*.
> *Started 2026-10-29 at Sasha's request («собирай эволюционную карту интерфейсов»). Owner: Aleksandr Konstantinov. Keeper: Evolver (Hark). v0: draft for Sasha's review; dates up to 2024 from the established record, Oct 2026 snapshot from our own use.*

## Invariant parameter: how much of the human the machine can read

First the machine reads a switch, then a card, a typed command, a pointing hand, a touch, a sentence, a field of intentions, a context, an intent, and finally the life itself. Each phase shift widens what the machine takes in by one order, and the human has less to translate.

Octave reading: stages 1→3 run in the machine's language. The **Mi–Fa interval** (3→4) is the leap from remembering commands to seeing and pointing. The **Si–Do shock** (6→7) is language itself: the machine starts speaking human, and a new octave begins.

| # | Stage | Era | Machine reads | One-line description |
|---|---|---|---|---|
| 1 | Wiring & Switches | 1940s–1950s | a circuit | ENIAC (1945) is programmed by re-plugging cables and setting switches: the human speaks the machine's physics. |
| 2 | Cards & Batch | 1950s–1960s | a deck of symbols | Punch cards and FORTRAN (1957): write the program, hand in the deck, get the answer hours later. |
| 3 | Command Line | 1961–1984 | a typed command | Time-sharing (CTSS 1961), Unix (1969), terminals: a live dialog, but in the machine's syntax and one line at a time. |
| ⟡ | Mi–Fa interval | 1963–1973 | | Sketchpad (1963), Engelbart's Mother of All Demos (1968: mouse, windows, hypertext), Xerox Alto (1973): recall gives way to recognition. |
| 4 | Windows & Pointer (GUI) | 1973/1984–2007 | a pointing hand | Alto, Macintosh (1984), Windows, the web browser (Mosaic 1993): many things on one screen side by side, each in its own window. |
| 5 | Touch & Pocket | 2007–2022 | the body's gesture | iPhone (2007), iPad (2010): direct manipulation with fingers, the computer always with you. Siri (2011) and Alexa (2014) are early voice precursors of 6. |
| 6 | Conversation (Si–Do) | 2022– | a sentence | ChatGPT (Nov 2022): the human states intent in their own words and the machine does the steps. Limit: one line of time. |
| 7 | Space & Streams | 2024– (emerging) | a field of intentions | Spatial computing (Vision Pro, Feb 2024; Meta glasses), canvases beside the chat (Claude Artifacts, ChatGPT Canvas, 2024), agents running work in parallel: the conversation unfolds into many live streams laid out in space. |

## Second axis: who adapts to whom

| # | Stage | Who translates |
|---|---|---|
| 1–3 | Switches, cards, command line | **The human learns the machine.** Syntax, flags, codes. |
| 4–5 | GUI, touch | **They meet halfway.** Metaphors the human already knows (desk, folder, finger). |
| 6 | Conversation | **The machine learns humans.** Any person's language. |
| 7 | Space & streams | **The machine learns how humans think:** in parallel threads, not in one line. |
| 8+ | (forecast) | **The machine learns this human.** Your AI. |

**Inversion at 6** (mirror of the game almanac's fidelity flip at 7): for five stages the human climbed toward the machine. With language the arrow turns, and the machine climbs toward the human, first humans in general, then one person.

## The spiral: chat is the command line, one turn up

The key pattern behind Sasha's features. A new octave repeats the old one at a higher turn:

| First octave | Second octave | What repeats |
|---|---|---|
| 3. Command line | 6. Chat | A linear transcript, one line of time, scroll back to find things. Chat is a command line that speaks human. |
| 4. GUI windows | 7. Stream windows | The linear line spreads into space: many things side by side, each with its state. |
| 5. Touch | 8. Ambient / spatial touch | The hand and body return: move the streams with gestures, on a table or a wall. |

The command line needed ~15 years to become the GUI (Unix 1969 → Macintosh 1984). Chat → space compresses that, plausibly to 2–4 years (2022 → ~2025–2026), which is why the founder feels the pain right now.

## Sasha's features fall out of the map

| Feature (§17) | Where it sits | Its first-octave ancestor |
|---|---|---|
| F1 Bookmarks in one chat | Stage 6 patch | Shell history and `!` recall; browser bookmarks |
| F2 Workstreams as live windows | Stage 7 core | GUI windows and the taskbar |
| F3 The AI opens and closes windows itself | Stage 7→8 | Nothing: in the GUI the human managed windows. This is new: the machine arranges the space. |
| F4 Touch and spatial control | Stage 7 + 5 merged | Multitouch, *Minority Report* (2002) |
| F5 The standing wall of events | Stage 7 surface | Mission-control walls, the Network School Luma stand |

**F3 is the true novelty.** Every earlier interface made the human the window manager. Here the machine follows the shape of his attention. That is the step from 7 toward 8.

## Forecast: the next notes (8–10)

| # | Stage | Horizon | Machine reads | One-line description | Precursors |
|---|---|---|---|---|---|
| 8 | Ambient Context (Re) | ~2026–2032 | the context | The interface appears only when needed: glasses, voice, sensing; the AI initiates, the wall shows only what needs you. | Smart glasses, always-on voice, proactive agents, Hark's own Home cards |
| 9 | Intent (Mi) | ~2032– | the intent | Attention and intent as input; little or no translation into words or gestures. | Neuralink's first human implant (Jan 2024), eye-tracking in Vision Pro |
| 10 | Disappearance (Fa) | not datable | the life | No interface: life itself is the interface, and the machine is one note in the person's chord (tracker §19). Mirrors stage 10 of the game almanac. | Calm technology (Weiser, 1990s), ubiquitous computing |

**Method.** (1) Invariant extrapolation: context → intent → life. (2) Second axis: from "humans" to "this human". (3) Octave and spiral: 7 repeats 4, 8 repeats 5. (4) Timing by compression: decades (1–5), years (6–7). Honest limit: the direction is grounded in precursors, the dates are not.

## Where we sit

Hark today is stage 6 with stage-7 seeds (parallel browsers, live cards, Home panels). Our product line (Interface / Activation / Models) builds the interface: enter at 7, built for 8 (the AI arranges the streams and speaks only when needed), compatible with 10 (it disappears, the person stays).
