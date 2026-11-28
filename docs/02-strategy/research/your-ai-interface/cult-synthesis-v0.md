# Cult companion interfaces for My AI: integral holonic synthesis (v0)

2026-11-25 · Status: draft for Sasha (Aleksandr Konstantinov) · Template: [integral-synthesis](../../../templates/integral-synthesis.md) · Evidence grades A/B/C as in [Mechanic Transplant, rule 1](../iconic-mechanics/template.md)
Corpus: 18 exemplars in 4 clusters (§A) · Invariants: 7 core (§B) · Keeper: Evolver (Hark)

Owner's ask (Sasha, 2026-11-25): «фокус на культовость... пока это просто саас элемент... применяй шаблон глубокого синтеза к тому какие есть культовые решения подобных интерфейсов, включая даже физические которые нас могут вдохновить» (focus on cult status; right now it is just a SaaS element; apply the deep synthesis template to cult solutions of such interfaces, physical ones included).

Deviation from the template, stated once: this is a v0 run by one keeper in one pass. Dossiers are compressed into the corpus table (§A) instead of separate files, the roast is one cycle (§8), and no live first-timer test has run yet. The Western RPG dossier is not repeated here; Pip-Boy and Mass Effect facts are cited from [navigation/exemplars/rpg.md](../navigation/exemplars/rpg.md).

---

## The whole in one sentence
**My AI is a living crystal you consult: every state it has shows in the crystal itself, and its words surface from inside the crystal, so the object, not a chat window, is the interface.**

---

## 0. Frame: the target and why it reads as SaaS today

**Target whole.** My AI, the air face of the carried navigation instrument (GoBY §25.10, §25.14: air, octahedron, mind). Closed: a glass octahedron glyph bottom right, with lit quarters inside and a water ring with today's moon (`InstrumentGlyph.tsx`). Open: the crystal rises, the world dims and stays live, the air face opens a panel being enlarged to about 92% of the screen (full screen on mobile) with two tabs, Conversation and Console (the five-step Phoenix chain). Canon law: near-black, one ice-blue accent, physical materials, no glow rings (GoBY §5, quoted in `YourAiInstrument.tsx` header); smooth everywhere, an ancient mystical instrument (§25.11); the 3-second test (§25.12). Protected and out of scope: reveal, intro, themes, title, entry. My AI never sends a player to an outside AI (§25.10).

**What reads as SaaS in today's code** (facts from `YourAiInstrument.tsx`, `AirOctahedron.tsx`, main branch 2026-11-25):
1. The moment the panel opens, the crystal disappears into a header and stops: `AirOctahedron` stops its loop "when the panel is open". The living object hands over to a generic card.
2. The conversation is chat bubbles (`rounded-2xl` boxes, player right, AI left), the exact grammar of Intercom, ChatGPT and every support widget.
3. Thinking is an italic word (`yourAiInstrument.thinking`), not the object working.
4. The header is app chrome: back chevron, title, a "powered" subline, replay icon, close icon.
5. The panel is a rounded card with a drop shadow that slides up from bottom right (`translateY(28px) scale(0.9)`), the motion of a chat launcher.

*Judgment:* the object is already strong (a clear octahedron of air is a better icon than most exemplars have). The SaaS feel comes from the moment of opening onward: the object stops being the interface.

---

## A. Corpus (18 exemplars, 4 clusters)

| # | Exemplar | Cluster | What it is, in one line | Strongest graded fact | Source |
|---|---|---|---|---|---|
| 1 | Fallout Pip-Boy | Game device | Wrist device the character raises; holds map, quests, stats, radio | **B** demand: FO4 Pip-Boy Edition ($120) sold out; factory "this is as many as we can make" (Hines, 2015). **C** Pagliarulo: "your link to survival... strapped to your wrist" | rpg.md §Fallout 3/NV/4; https://www.polygon.com/2015/7/28/9056765/fallout-4-pipboy-edition-preorder-sold-out/ |
| 2 | Mass Effect omni-tool, codex | Game device | Arm hologram for tools; codex as in-world encyclopedia | **C** (see dossier) | rpg.md §Mass Effect |
| 3 | Dead Space RIG + holo inventory | Game device | Health on the suit spine, inventory as a hologram in the world, game does not pause | **C** Ignacio GDC 2013: RIG "out of the necessity to keep the player immersed"; Schofield: "no HUD" was a founding rule | https://www.polygon.com/2013/3/31/4166250/dead-space-user-interface-gdc-2013/ ; https://arstechnica.com/video/watch/dead-space-extended-interview |
| 4 | Zelda BotW Sheikah Slate | Game device | Ancient tablet: map, scope, camera, runes downloaded at shrines; docks into towers with stone sounds | **C** Aonuma/Fujibayashi interviews; runes given at start, abilities "downloaded" | https://www.theverge.com/2017/3/11/14881076/ ; https://www.eurogamer.net/technology-and-nature-have-a-strange-relationship-in-zelda-breath-of-the-wild |
| 5 | Destiny Ghost | Game companion | Small floating shell that wakes you and speaks throughout | **C** recast of the whole voice (Dinklage to North) for "a unified character voice" from level 1 to 40; wooden first voice became a meme | https://gameinformer.com/b/news/archive/2015/08/04/destiny-recasts-its-most-important-character-with-nolan-north-9709 ; https://www.bbc.co.uk/news/entertainment-arts-33785569 |
| 6 | Death Stranding Odradek + BB | Game companion | Shoulder scanner whose petals point and clap faster as danger nears; a baby in a pod that coos, cries, gives "likes" | **C** device as motion, not screen; BB cry routed to the controller speaker | https://gamefaqs.gamespot.com/ps4/184428-death-stranding/faqs/78057/odradek ; https://www.theverge.com/2019/11/8/20953147/ |
| 7 | Journey | Game companion | An anonymous companion; the only voice is one chime | **C** Chen: "we have to remove their power, and remove their tasks"; ping size and speed carry intent | https://www.gamedeveloper.com/design/a-personal-journey-jenova-chen-s-goals-for-games ; https://www.eurogamer.net/how-journey-only-truly-made-sense-when-almost-everything-had-been-cut |
| 8 | Myst linking books | Game device | A book whose page shows a living moving picture of the place; touching it takes you there | **C** judgment, not sourced here | (none fetched) |
| 9 | Her, OS1 (Samantha) | Film OS | No face, no avatar; install blanks the screen, then everything looks the same "except now her voice comes out"; she names herself | **C** Barrett: "it shouldn't be anything... make Samantha's voice the center"; McFetridge: "post-icon", avoid "overly busy walls of transparent data" | https://www.fastcompany.com/3023518/ ; https://wepresent.wetransfer.com/stories/designing-fictional-ui-for-tv-and-film ; https://scifiinterfaces.com/2014/02/11/her-interface-components/ |
| 10 | JARVIS / FRIDAY | Film OS | Floating holographic walls of data around the hero | **C** used here as the busy pole McFetridge designed against | (as above) |
| 11 | Alethiometer (His Dark Materials) | Fiction oracle | Brass and crystal dial, 36 symbols, three hands set the question, a fourth needle answers; read in a calm state | **C** fiction; the reading is a practice, not a query | https://hisdarkmaterials.fandom.com/wiki/Alethiometer |
| 12 | Magic 8-Ball / crystal ball / palantír | Physical oracle | Ask, shake, wait, one short answer floats up into a dark window | **B** about 1 million sold a year, 75 years (Mattel) | https://investors.mattel.com/news/news-details/2025/Mattel-Studios-Teams-with-M--Night-Shyamalan-and-Brad-Falchuk-on-Premium-Live-Action-Magic-8-Ball-Series/default.aspx |
| 13 | Ouija / tarot | Physical ritual | Hands on the planchette; the answer comes through your own movement | **A** ideomotor answers 65% vs 50% verbal on guessed items (n=21) | https://doi.org/10.1016/j.concog.2012.01.016 |
| 14 | Antikythera, astrolabe, orrery | Physical instrument | Rings, engraved scales, a pointer you turn; cosmos you can read | **C** judgment, not sourced here | (none fetched) |
| 15 | Tamagotchi | Physical companion | An egg you carry; a creature that grows through stages because you care for it | **B** 100 million units shipped by July 2025 (Bandai) | https://www.bandai.co.jp/press/2025/250828.php |
| 16 | Braun (Rams), Teenage Engineering, Nothing Glyph | Physical object | Restraint, one accent, tactile controls; Nothing: light patterns so you look at the screen less | **B-** Pei: "eight out of ten of our users have the Glyph interface enabled from day one" (company claim); strips replaced by Glyph Matrix in 2025 | https://indianexpress.com/article/technology/tech-news-technology/nothing-phone-3-glyph-matrix-features-10101431 ; https://www.cnet.com/tech/mobile/nothing-just-killed-its-phones-flashy-glyph-interface-i-think-the-replacement-is-better |
| 17 | Apple breathing sleep light, Siri orb, Dynamic Island | AI/OS object | A light that breathes at rest; a living orb when listening; status that grows out of where it lives | **C** patent: rhythm "mimics the rhythm of breathing which is psychologically appealing" (US 6,658,577); Siri orb and Dynamic Island not sourced here | https://patents.google.com/patent/US6658577B2/en |
| 18 | Rabbit R1, Humane AI Pin (anti-exemplars) | AI device | Novel objects whose core act did not work daily | **B** R1: 100k sold, 20k to 34k daily users (Lyu, corrected by The Verge); Humane: returns outpaced sales, shut down, assets sold to HP for $116M | https://www.theverge.com/2024/10/7/24264275/ ; https://www.theverge.com/2024/8/7/24211339/ ; https://www.theverge.com/news/614883/ |

Control sources (out of domain, for T4): ritual research (Vohs et al. 2013), labor illusion (Buell and Norton 2011), IKEA effect (Norton et al. 2012), attachment to companions (De Freitas et al. 2026, Replika), people naming household robots (Sung et al. 2007), diegetic vs HUD displays (Peacocke, Teather et al. 2015/2018; Iacovides et al. 2015).

---

## B. Invariants (7 core)

Order is the user's order of experience. Each passed T1 to T7 unless noted.

| ID | Invariant (the need) | The user's question | Common denominator | Forms seen | Scale | Verdict |
|---|---|---|---|---|---|---|
| I1 | Feel it is with me, alive, without it asking for attention | "Is it here?" | a quiet sign of life on a carried object | Pip-Boy on wrist, Ghost hovering, BB pod, breathing light, Glyph, Tamagotchi egg | rest | core |
| I2 | Reach it without leaving my world, and put it back exactly | "Can I ask without losing my place?" | one gesture, in-world, reversible | Pip-Boy arm raise, Dead Space holo (no pause), Sheikah Slate, Dynamic Island | open, close | core (holonic: the same gesture at every level) |
| I3 | Feel the moment of asking is set apart | "Is this special?" | a short act I perform that frames the question | Ouija hands, alethiometer hands, 8-Ball shake, tarot shuffle, Slate docking | open | core |
| I4 | See that it heard me and is working for me | "Is it thinking about me?" | the object itself shows effort | Odradek clapping, alethiometer needle swing, 8-Ball die rising, Siri orb | speaking | core |
| I5 | Know it is one being, the same one, and mine | "Is this my one?" | one voice, one name, no break in identity | Ghost recast for one voice, Samantha names herself, Roomba names, Replika break as failure | all | core |
| I6 | See it grow with me | "Does it know me more now?" | visible change earned by my own acts | Tamagotchi stages, Slate runes, Ghost shells, quarters lit in the glyph (ours) | rest, open | core |
| I7 | Read the answer in its own language, at a glance | "What did it say?" | compressed answer in the object's material | 8-Ball window, alethiometer symbols, Journey chime, Her voice with no face | speaking | core |

**Tree.** I2 parents "close returns me where I was" (child, not separate). I5 parents "naming" (child). I6 depends on I5 (growth needs an identity to grow).
**Came from the open question:** I3 (ritual) was not in the seed list; it came from the physical oracles and was then confirmed by the control (Vohs: A).
**Rejected:** "holographic data around the user" (JARVIS form; a fashion, fails T3: nobody suffers its absence; McFetridge designed against it). "A face or avatar" (fails T2/T3: Her, Ghost, Odradek, 8-Ball all work without one). "Replace the phone" (Humane, Rabbit: not a need, a pitch; B evidence it fails).
**Parked under T7:** voice output (Her); real for the field, but costs money per turn: decision D3.

---

## C. Solution ledger (best candidates per invariant)

Score = evidence (A3/B2/C1) + convergence (0-2) + driver (0-2) + attribution (0-2) + failure (0 to -2).

| ID | Solution form | Exemplars | Inv. | Grade | Score | Driver (named effect) | Failures |
|---|---|---|---|---|---|---|---|
| S1 | Carried in-world object as the whole interface | Pip-Boy, Slate, RIG, Odradek | I1 I2 | B (Pip-Boy demand) + A (diegetic co-located display: best performance and higher immersion, Peacocke/Teather 2015) | 2+2+2+1 = 7 | diegesis lowers mode-switch cost | HUD beat diegetic for health info in the 2018 study (https://www.sciencedirect.com/science/article/abs/pii/S1875952117300435): diegetic is not always better |
| S2 | Breathing light at rest | Apple sleep light, BB coos | I1 | C | 1+2+1+1 = 5 | slow rhythm read as alive and calm | none recorded |
| S3 | Short self-performed ritual before the answer | Ouija, alethiometer, 8-Ball, tarot | I3 | A (Vohs 2013: ritual raised enjoyment d=0.73 and willingness to pay d=0.82; random gestures did not; watching a ritual did not) | 3+2+2+1 = 8 | involvement | a ritual that is slow every time becomes friction (judgment) |
| S4 | The object visibly works while you wait | Odradek, alethiometer needle, 8-Ball die | I4 | A (Buell and Norton 2011: shown effort makes people prefer longer waits) | 3+1+2+2 = 8 | labor illusion, reciprocity | fake effort, when noticed, would be a lie: show only real steps |
| S5 | One voice and one name for life | Ghost recast, Samantha, Roomba naming (21 of 30 named, Sung 2007) | I5 | B (Replika identity break: negative posts +24.7 points, De Freitas et al. 2026, Nature Human Behaviour) | 2+1+2+2 = 7 | attachment; separation distress when broken | Dinklage Ghost: weak voice is a weak interface |
| S6 | Growth you caused, shown in the object | Tamagotchi, Slate runes, our lit quarters | I6 | B (Tamagotchi 100M) + A (IKEA effect, meta d=0.57) | 2+2+2+1 = 7 | IKEA effect, endowment | needs completion: effort without completion lost the effect (Norton 2012) |
| S7 | Answer surfaces in the object's window, short | 8-Ball, alethiometer, Journey chime | I7 | B (8-Ball ~1M/yr for 75 years) | 2+1+1+1 = 5 | curiosity, compression | an 8-Ball answer is random; ours must be true and useful |
| S8 | No face; the voice and words carry the being | Her, Ghost, Odradek | I5 I7 | C | 1+2+1+1 = 5 | projection fills the gap | none |
| S9 | Novel object without a daily working core | Rabbit R1, Humane Pin | (anti) | B | negative | novelty decays | the lesson: mystique must never slow or replace a good answer |

Gaps: no core invariant rests on C alone. I1's "breathing" element is C, but I1 is also answered by S1 (A/B).

---

## D. Matrix and readings

| Solution | I1 | I2 | I3 | I4 | I5 | I6 | I7 | Levels |
|---|---|---|---|---|---|---|---|---|
| S1 carried object | ● | ● | ○ | ○ | ○ | ○ | | rest, open |
| S2 breathing | ● | | | ○ | | | | rest |
| S3 ritual | | ○ | ● | | | | | open |
| S4 visible work | | | | ● | ○ | | ○ | speaking |
| S5 one voice, one name | | | | | ● | ○ | ○ | all |
| S6 earned growth | ○ | | | | ○ | ● | | rest, open |
| S7 answer surfaces | | | ○ | ○ | | | ● | speaking |
| S8 no face | | | | | ● | | ● | all |

1. **Multi-answer:** S1 (the object) touches six of seven. That is the seed of the principle.
2. **Gaps:** none without an A/B answer.
3. **Redundancy:** I5 has S5 and S8; they reinforce (one name, no face), keep both.
4. **Conflict:** ritual (S3) vs speed (S9 lesson, and our §25.11 smoothness). Dissolved by the principle: the ritual is the crystal's own motion during the time the model is computing anyway, never added waiting.
5. **Level spread:** I2 and I5 hold at every level (holonic); I3, I4, I7 live in one moment each.

---

## 1. Organizing principle

**My AI is a living crystal you consult: every state shows in the crystal itself, and its words surface from inside it, so the object, not a chat window, is the interface.**

Rules out: chat bubbles, spinners or italic status words separate from the crystal, avatars and faces, app chrome around the object, holographic data walls, and any path that sends the player to another AI.

Checked against canon: it sharpens GoBY §25.10 ("an instrument you carry") and §25.11 ("an ancient mystical instrument") and obeys §5 (no glow rings: the crystal's life is shown by refraction and motion, never by a halo).

| Element | How it follows |
|---|---|
| Breath at rest | the crystal is alive, so at rest it breathes |
| Rise to consult | consulting means bringing the crystal before you |
| Panel opens out of the crystal | the words come from inside it, so the surface unfolds from it |
| Crystal stays on top while open | the object is the interface, it never hides behind a header |
| Thinking is the crystal turning | every state shows in the crystal |
| Answer surfaces, unboxed | words come from inside, not in a bubble beside it |
| Console as a dial with a needle | an instrument is read by a needle on a ring, like the alethiometer |
| Name engraved under the crystal | one being, one name |
| Lit quarters inside the crystal | growth shows in the crystal (already canon) |

Did not derive: the daily free-turn limit and usage tiers. They stay, as a quiet line in the Console, not in the face.

---

## 2. The whole, level by level

| Level | What is a whole here | Invariants | Element (one per invariant) | Evidence | Enter / leave |
|---|---|---|---|---|---|
| L0 Glyph at rest | a small crystal that is alive and yours | I1, I6, I5 | breath of refraction (~12 cycles a minute); lit quarters inside; name in its accessible label once named | S2 C, S6 A/B, S5 B | always there / tap, Enter, `I`, swipe up |
| L1 Summoning | a short rite that frames the question | I2, I3 | the crystal rises to center, the world dims and blurs, the surface unfolds out of the crystal (iris), one quiet air tone (D1) | S1 A/B, S3 A | one gesture / same gesture back |
| L2 The open instrument | the crystal before you, with a surface to write on | I5, I7, I2 | crystal at top center (about 96 px), its name in serif beneath, the latest answer below it, one input line at the bottom, close in the corner | S5, S8, S7 | from L1 / L5 |
| L3 Speaking and thinking | a consultation in progress | I4, I7 | listening: crystal turns its face to you and holds still; thinking: it turns faster and light runs along its edges, with one line of real work when there is one; answering: text rises out of the crystal into the surface, unboxed | S4 A, S7 B | send / answer settles |
| L4 Console | the same instrument read as a dial | I4, I6, I2 | five stations on an engraved ring (goal, case and risks, v2, what is weak, what survives), a needle that moves station to station as each step runs, done stations lit with the same grammar as the quarters | S4 A, S6 A, alethiometer C | tab / tab |
| L5 Closing | the crystal takes it back | I2, I5 | same gesture in reverse; surface folds into the crystal, crystal returns to the corner; the player is exactly where they were (already built) | S1 | any close / L0 |

```
L0 crystal in the corner (breath, lit quarters, its name)
 └ L1 rite: rise, dim, iris out of the crystal, one tone
    └ L2 open instrument: crystal + name / latest answer / one input line
       ├ L3 speaking: crystal listens, turns, answer rises out of it
       └ L4 Console: same crystal over a ring of five stations, needle
    └ L5 fold back into the crystal, back to where you were
```

**Synergy tests.** Remove-one: removing the crystal from L2 loses I5 and I7 at once (it is the speaker); removing the breath leaves I1 to the lit quarters only, weaker but answered (breath kept, C). Add-nothing: every core invariant has an answer at each level it applies to. Reinforcing pairs: breath at rest and turning while thinking are one motion language at two speeds; lit quarters in the glyph and lit stations on the Console ring are one "lit means done" grammar; name under the crystal and one consistent voice in copy. **Emergent property:** the player starts to say "I asked it" about an object, not "I typed into the chat", because the same crystal is visibly the one listening, working, answering and growing.

---

## 3. What we cut and why

| Element today | Reason | Fate |
|---|---|---|
| Chat bubbles for AI and player | the single strongest SaaS signal; answers no invariant the surfacing text does not | cut |
| Italic "thinking" word | state shown outside the crystal | cut (replaced by L3) |
| "Powered" subline in the header | app chrome; says "a model behind a widget" at the moment of consultation | cut from header, moved to the Console footer with the free-turn line |
| Replay-tour icon in the header | a once-used action taking a top slot | moved into the Console footer |
| Back chevron + close icon both in the header | two exits | keep close only on the air face (back to the bodies arc stays on Esc and on the crystal itself) |
| Card drop shadow and slide-up launcher motion | the motion of a chat launcher | cut (iris from the crystal) |
| Crystal loop stopping when the panel opens | kills the object at the moment it matters | reversed: it runs while thinking, rests otherwise |

Detail count on the open screen: today about 11 visible controls and chrome items (back, title, subline, replay, close, two tabs, log box, bubbles, chips, input, send) → after: crystal, name, latest answer, input line, up to 2 next-step buttons, close, two tab words. One primary signal (the crystal and its answer), at most two secondary (input, next steps).

---

## 4. What changes in the product (deltas, browser-light)

All deltas are CSS and SVG, plus the existing 2D canvas. No WebGL: the 2D canvas octahedron already exists, is budgeted at 30 fps and stops on hidden tabs (`loop.ts`), and nothing here needs depth beyond it. None of these touch reveal, intro, themes, title or entry.

| # | Element | Level | Today (file) | Change | Canon | Owner's yes? |
|---|---|---|---|---|---|---|
| Δ1 | Crystal stays on top and alive in the open instrument | L2, L3 | `AirOctahedron` hidden in header, loop off when open | Render the 2D crystal at top center of the air face (~96 px). Pose by state: idle still or very slow; thinking: spin rate x3 plus an edge highlight sweeping along the 12 edges; answer arrives: settles in 400 ms. Loop runs only while thinking, 30 fps cap, still frame under reduced motion | §25.10, §25.11, §5 | no (point improvement under the platform-fix grant) |
| Δ2 | Answers surface, no bubbles | L3 | `bubble` class, `rounded-2xl`, left/right | AI text unboxed on the instrument surface, max ~60ch, appears with opacity 0→1 and translateY 6px→0 over 240 ms, starting from under the crystal; player lines as quiet right-aligned inscriptions (muted ink, small caps label "You"), no boxes. Only the latest exchange at full contrast; older ones step down in contrast and scroll up | §25.11 | no |
| Δ3 | Breath at rest | L0 | glyph turns slowly | In `drawGlyph`, modulate face refraction alpha between 0.82 and 1.0 on a 5 s sine (12 a minute, Apple's rate); no shadowBlur, no halo (§5). Reduced motion: static | §5, §25.11 | no |
| Δ4 | Thinking is shown as real work | L3 | italic `thinking` | Crystal state (Δ1) plus, only when the turn really does it, one line naming the step ("Reading your Zone of Genius", "Looking at your last traces") from the steps `askYourAi` already runs (player card, traces); otherwise no words | Buell and Norton A | no |
| Δ5 | Console as a dial | L4 | five buttons in a list (Phoenix chain, `console-v1.md`) | SVG ring (one hairline circle, five engraved ticks with labels), a needle (`<line>` rotated with CSS `transition: transform 600ms`) pointing at the current step; done stations lit in ice blue. The five real buttons stay as the accessible controls under the ring | alethiometer C, S4 A | no, unless console-v1 is his spec text: then a yes to the look |
| Δ6 | Opening as an iris out of the crystal | L1 | card slides up from bottom right | `clip-path: circle(0 at <crystal center>)` → `circle(150% ...)` over 450 ms with the existing `EASE`; reduced motion keeps the 150 ms crossfade. Optional one air tone from the existing `sound.ts` (D1) | §25.10 option A | tone: yes (D1) |
| Δ7 | Header subtraction and the name | L2 | back, title, powered, replay, close | Keep: crystal, the AI's name in serif under it (title until named), close. Move powered line, free-turns line and replay to a small Console footer | §25.10 (it names itself) | no |
| Δ8 | Glass-over-dark surface | L2 | `#0b0e13` card, shadow | Panel at rgba(11,14,19,0.86) over the already blurred world, 1px hairline, one engraved arc at the top echoing the water ring; no shadow, no glow | §5 | no |
| Δ9 | Close folds into the crystal | L5 | reverse of open | Same iris reversed into the crystal's position, then the crystal flies home (already). Deferred: a one-frame glint in the glyph when it lands | §25.10 | no (deferred) |

Packages: **P1 Living crystal** (Δ1, Δ3, Δ4), **P2 Oracle surface** (Δ2, Δ7, Δ8), **P3 Rite** (Δ6, Δ9), **P4 Dial** (Δ5). Each lands as one @claude issue in `evolver-grid-site` under the My AI SoW (`docs/specs/your-ai-instrument/sow.md`); P1 and P2 first, they carry most of the shift.

Risk at 92%: a large panel invites more chrome and turns into a full-screen chat app. The crystal-on-top rule (Δ1) and the detail budget (§3) are what keep the large size an instrument.

---

## 5. Acceptance test

1. **3-second test (§25.12)** on L0 and L2 with 5 first-timers, 4 of 5 pass: at rest, "it is alive, it is mine, I can open it"; open, "this crystal is who answers, I write here, this is how I close".
2. **Screenshot test (new):** show a screenshot of the open instrument with the brand cropped, ask "what app is this?". Passes when at most 1 of 5 answers "a chat app", "ChatGPT" or "a support widget".
3. **Wait test:** during a real turn, 4 of 5 can say without prompting that it is working on them.
4. **Return test:** after closing, 5 of 5 are exactly where they were (already true).
5. Reduced motion: every state still readable with motion off (crystal still frame plus the one line of work).

---

## 6. Decisions for Sasha

| # | Decision | Options | Recommendation | Why | Confidence |
|---|---|---|---|---|---|
| D1 | Sound of the rite | (a) one quiet air tone on open, on by default, mute in settings · (b) silent by default | (a) | ritual is something the player performs and senses (Vohs A); Journey's single chime and the BB's voice show one sound can carry a companion; the tone engine already exists (`sound.ts`) | medium |
| D2 | First activation as a held wake (inside the oracle quest, not entry) | (a) the very first time, the player presses and holds the crystal ~1 s to wake it, then it names itself · (b) a tap, as today | (a) | self-performed ritual beats watched ritual (Vohs Exp. 3, A); effort that completes raises value (IKEA, A); once only, so no friction later. It touches the quest Sasha owns | medium |
| D3 | Voice | (a) text only now, voice later as a paid power-up · (b) voice in phase 1 | (a) | Her proves a voice can be the whole interface, but voice costs per turn and adds latency; R1 and Humane show a slow core act kills the object (B) | high |

---

## 7. Evidence and gaps

- Core invariants resting on C only: none. Elements resting on C only: breath at rest (Δ3), the dial look (Δ5), the iris (Δ6). Each is cheap and testable by §5.
- No exemplar gives A-grade evidence about a companion's visual design as such; the A evidence is about mechanisms (ritual, shown effort, earned value, diegetic placement). The transfer from those studies to our screen is *Judgment*.
- Diegetic is not always better: in the 2018 controlled study players did better with a HUD for health information. Our case is closer to the ammo case (information that belongs to the object), but this is a reason to run the screenshot and wait tests, not to assume.
- Not sourced in this pass: Myst, Antikythera/astrolabe/orrery, Siri orb, Dynamic Island, Teenage Engineering, Braun. They inspired form only (rings, needles, restraint) and carry no claim here.
- Unverified detail: the exact text of `yourAiInstrument.powered` was not read; Δ7 moves the line whatever it says.

Sources used beyond the table: Vohs et al. 2013 https://pubmed.ncbi.nlm.nih.gov/23863754 · Buell and Norton 2011 https://pubsonline.informs.org/doi/10.1287/mnsc.1110.1376 · Norton, Mochon, Ariely 2012 https://www.sciencedirect.com/science/article/pii/S1057740811000829 and meta-analysis https://onlinelibrary.wiley.com/doi/full/10.1002/mar.70064 · De Freitas et al. 2026 https://www.juliandefreitas.com/_files/ugd/06f95c_145f854420634ffda5941ea7b8ed8cc0.pdf · Sung et al. 2007 https://faculty.cc.gatech.edu/~hic/hic-papers/Roomba-Ubicomp.pdf · Peacocke, Teather et al. 2015 http://www.csit.carleton.ca/~rteather/pdfs/GEM2015_HUDs.pdf · Iacovides et al. 2015 https://dl.acm.org/doi/10.1145/2793107.2793120

---

## 8. Roast, one cycle (short)

- **UL (does it feel true?):** a crystal that breathes and turns can tip into kitsch. Guard: no glow, no particles, no sparkle; motion only on the crystal; one tone at most.
- **LL (would the tribe recognize itself?):** founders who use Hark daily may want speed over rite. Guard: the rite fills the model's own latency, it never adds a wait; the iris is 450 ms.
- **First-timer:** may not know the crystal is a button at rest. Breath helps; the first-receipt landing (canon) already introduces it.
- **Returning after two weeks:** sees the same crystal with a name and lit quarters: continuity (I5) is the hook.
- **Phone:** full screen means the crystal must stay small (≤ 72 px) so the answer has room; input fixed to the bottom with safe-area padding.
- **Power user:** wants history. Older exchanges stay scrollable, just lower contrast.
- **Arriving from a shared link mid-world:** the glyph is the only My AI element visible; nothing else to learn.
- **Meta-roast:** the biggest risk is building P3 and P4 (pretty) before P1 and P2 (the actual shift). Order is P1, P2, then P3, P4.

## Genealogy
Template: integral-synthesis (v of 2026-11-25). Canon read: GoBY §5, §25.10 to §25.14; ui_playbook Part X; navigation/exemplars/rpg.md. Code read: `YourAiInstrument.tsx`, `InstrumentGlyph.tsx`, `AirOctahedron.tsx`, `InstrumentRitual.tsx` header, `lib/instrument/loop.ts` header (main, 2026-11-25).
