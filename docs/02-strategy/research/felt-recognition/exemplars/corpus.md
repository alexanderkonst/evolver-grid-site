# Exemplar cluster: OUR OWN CORPUS (closest to target)

Source: repo alexanderkonst/evolver-grid-site, read at commit 66e89d5 (2026-11-27 21:30 UTC). Base URL for every path below: https://github.com/alexanderkonst/evolver-grid-site/blob/main/ (written as `R/<path>#L<n>`). Grades: B = real user data (named sessions, user scores, verbatim client words); C = design intent / spec / theory. Repo was read only; nothing edited.

---

## E1. Appleseed / Zone of Genius / Top Talent reveal (+ resonance rating)

**1. Header.** Sasha + Evolver/Claude builders; Jan 2026 (hackathon) → Nov 2026. Why in: closest to target — this is the exact screen where the felt moment happens.

**2. Layers**
| layer | what happens | who/what | when |
|---|---|---|---|
| Generation | LLM writes archetype, bullseye phrase, 3 talents, `edge_and_traps`, `top_shadow_one_sentence`, `shadow_currency` | `src/prompts/user/zoneOfGeniusPrompt.ts`, edge fn `generate-appleseed` | after the user's raw signal |
| Reveal | "MY TOP TALENT IS" → "MY THREE TALENTS" → ornament → "MY TOP SHADOW IS" | `src/components/game/RevelatoryHero.tsx` | first screen after generation |
| Rating | "How much does this sound like you?" 1–10, placed directly under the reveal box | `ResonanceRating.tsx`, `AppleseedDisplay.tsx#L518-528` | right after reading |
| Reply | tiered message (≥8 resonant / 5–7 partial / ≤4 off) | `src/lib/resonanceMatrix.ts` | on tap |
| Store | integer in `zog_snapshots.resonance_rating` | `src/lib/saveResonanceRating.ts` | on tap |

**3. Seed questions**
- Q1 Evoked by the text itself, explicitly engineered for it: «TRANSMIT, DON'T REPORT… meant to land as recognition the instant I read it… the "that is me, and I feel it" jolt… the flywheel and shadow at the gut» (`R/src/prompts/user/zoneOfGeniusPrompt.ts#L36`). Shadow sentence: «The reader should feel the same recursive-shadow recognition in this single sentence as in the full paragraph» (#L52).
- Q2 Anti-Barnum guards are linguistic: "no flattery, no abstraction, no clever titles" (#L36); banned abstract compounds "Inner X / Felt X / Sacred X…", the 5-second-friend test (#L143, #L205); the shadow is structurally derived from the gift ("inverted", #L51), which makes it falsifiable per person. *Judgment:* no check that the text is specific to this person rather than generically pleasing.
- Q3 Caught only as a number (1–10). No word, image or body place is captured.
- Q4 Integer column; the reveal text is saved as a snapshot. The feeling itself is not stored.
- Q5 Revisit view (`AppleseedView.tsx`) re-shows the reveal and the rating; retake exists (`retake.ts`). No re-evocation of the feeling.
- Q6 Not addressed in product.
- Q7 1–10 "resonance"; Jan 2026 claim of 10/10 (see §4); `resonance_events` table drafted for funnel-wide telemetry (`R/docs/05-specs/resonance_events_lovable_prompt.md`) but no reveal caller of `saveResonanceEvent` found in `src/` at 66e89d5 (only ai-os uses the table).
- Q8 Karime walkthrough 2026-05-03: abstract phrases ("Inner-Belonging Restoring… safe truth") and «the resonance score dropped accordingly» (#L143). One dial for light + shadow misreads the shadow (see E5).
- Q9 The AI is the mirror; Tech 56 adds a human second mirror via share ("is this actually me?").
- Q10 The appleseed resonant reply was compressed on 2026-05-03 «let the resonance moment be quiet» → "Congrats with receiving the gift of self-knowledge 💗" (`R/src/lib/resonanceMatrix.ts#L55-67`). Earlier tier message: «What if this voice has been yours all along?» (`R/docs/09-logs/session_log.md#L5409`).

**4. Best practices**
1. Write for felt recognition, then police it with plain-language bans (5-second friend). Grade B (Karime score drop as natural experiment, n=1). Driver: abstraction routes the reading to the mind and kills the body response. `R/src/prompts/user/zoneOfGeniusPrompt.ts#L143`.
2. Ask the rating immediately under the reveal (Day 58, Sasha): proximity keeps the rating about the felt hit. Grade C. `R/src/modules/zone-of-genius/AppleseedDisplay.tsx#L518`.
3. Early signal: «2 users in last 2 days rated ZoG resonance 10/10 — "matches my brightest self exactly."» Grade B (n=2, self-report). `R/docs/09-logs/hackathon_log_2026_01_24.md#L135`.

**5. Failures.** Rating UI existed but «no caller passed the prop, so the rating UI never rendered» until 2026-04-18 (`R/docs/archive/codex_workflow_2026/ai_tasks/DONE_resonance_rating.md`, execution notes). Correction to frame.md: the rating is now live, not only an old spec. Over-cosmic language ("Когерентный Алхимик") → «Непонятно… Не заземлённо» (`R/docs/07-technology/zog_language_improvement.md`).

**6. Quotes.** «Aim the archetype_title and core_pattern at the heart (the "that is me, and I feel it" jolt)… the destination is the click of self-recognition.» (`zoneOfGeniusPrompt.ts#L36`). Success criterion: «Человек читает свой результат и говорит: "Да, это я!"» (`zog_language_improvement.md#L107`).

---

## E2. Uniqueness Holomap, stage 3→4 Recognition and the seer invariant

**1. Header.** Sasha + Evolver, Jul–Nov 2026. Why in: names the developmental place of the felt moment.

**2. Layers**
| layer | what happens | who/what | when |
|---|---|---|---|
| Stage 3 Initiation | "the words don't hold… guessing, or bragging" | person alone | years |
| 3→4 Mi-Fa shock | outside mirror names the throughline | session, mentor, friend, transition-shock | one moment |
| Stage 4 Recognition | "landed in my body… That's actually true." seen, not owned | person | the moment |
| 4→5 | tested in 2nd/3rd context, holds after "the mirror-session glow fades" | person under stakes | weeks |

**3. Seed questions**
- Q1 An outside accurate reflection that is *received*: «Nobody names their own invariant alone» (`R/docs/holomaps/uniqueness_holomap.md#L37`).
- Q2 Stage 5 is the truth test: «Tested past the one flattering moment» (#L26 table). Recognition alone is not proof.
- Q3 Body language of the stage: «it landed in my body»; archetype cell: «"that's it" — said once, about someone else's reflection» (#L80).
- Q4 Not addressed beyond 4→5 repetition.
- Q5 4→5 = said again in other contexts; risk of evaporation «once the mirror-session glow fades» (#L38). Implies the feeling fades without anchoring.
- Q6 5→6: description stops being recited and becomes the operating mode (#L39).
- Q7 Retrodiction over 5 clients, all crossed via live session (#L139-159). Grade B (small n, interpretive).
- Q8 Receiving is its own threshold; «consent, not accuracy, is usually the blocker» (Tech 125).
- Q9 Central: stage 4 defined by the mirror. Open question whether a literal other person is required (#L159).
- Q10 Shadow row: Recognition = «named for the first time too, still raw» (#L81).

**4. Best practices.** (1) Treat Recognition as "seen, not owned" and design the next step as testing, not celebration. Grade C. (2) Stage 8 "Instrumentation": the mirror becomes repeatable (prompt, SOP, canvas, quiz) (#L112). Grade C.

**5. Failures.** Open: no clean solo-crossing case on file (#L159).

**6. Quote.** «"Someone said it back to me and it landed in my body. ...That's actually true." The pattern is seen, not yet owned.» (`uniqueness_holomap.md#L26`).

---

## E3. /quiz uniqueness question (Q2) as a scale

**1. Header.** Transition quiz, Jul 2026 (3-question version since 2026-07-29). Why in: a self-report scale with an explicit "recognition" rung; control for how we measure position, not feeling.

**2. Layers**
| layer | what happens | who/what | when |
|---|---|---|---|
| Prompt | "Are you monetizing your uniqueness yet?" | `src/locales/en/common.json` quiz.q2 | quiz step 2 |
| Six answers | discovery → recognition → integration → vehicle → transmission → scaling | user self-selects | — |
| Routing | recognition/integration past stage 4 → "coherence" path | `src/modules/transition-quiz/engine.ts#L231-255` | result |
| Result beat | "The value is already real. The pattern is still unnamed." | quiz.result.beats.recognition | result page |

**3. Seed questions**
- Q1 Not addressed (no reflection shown, no felt moment).
- Q2 Not addressed.
- Q3 The "recognition" answer names the pre-recognition state: «I know I bring something valuable, but I can't articulate it clearly yet. When I can, I'll do what I want.» Note: the quiz label "recognition" = holomap stage 3 (pattern still unnamed), not stage 4. *Judgment:* naming mismatch worth knowing.
- Q4–Q6 Not addressed.
- Q7 Ordinal 6-point developmental scale of articulation → monetization. «The Recognition Delta question from the earlier design was NOT carried into the final SOW» (`engine.ts#L23`). Q4 "if that sentence appeared today…" cut 2026-07-29 (#L26-28) — this was the nearest thing to measuring anticipated felt impact.
- Q8 Self-placement bias; not addressed.
- Q9 None.
- Q10 Gives a before-state to compare with an after-reveal state.

**4. Best practice.** First-person, situation-shaped answers ("I know… but I can't articulate it") instead of abstract levels. Grade C. `R/src/locales/en/common.json` (quiz.q2.options).

**5. Failures.** Recognition Delta and Q4 dropped; no pre/post felt measure exists.

**6. Quote.** «More brainstorming won't get you there. The move is finding the thread that has been true across your work all along…» (quiz.result.beats.recognition.nextMove).

---

## E4. Phase Shift Technologies: 56, 58, 115, 118, 125, 128, 137, 154, 156 (+ Feeling Doesn't Shout)

**1. Header.** Sasha's theory library, Apr–Oct 2026 (`R/docs/01-vision/phase_shift_technology_library.md`). Why in: the laws our product cites.

**2. Layers (as a chain)**
| layer | technology | line |
|---|---|---|
| Ground | 156 Emotion ⊂ feeling | feeling is wider and quieter than emotion (#L8246-8376) |
| Seeing | 118 Seer Invariant | development = subject→object; the mirror performs it (#L7455) |
| Receiving | 125 Social Physics of the Mirror | consent before sight (#L7611) |
| Naming | 115 Articulation = growth; 128 Name is the Result | (#L7408, #L7651) |
| Verifying | 56 Externalized Self-Recognition | share = "is this actually me?" (#L3004) |
| Keeping | 154 Mirror Must Not Lag | self-knowledge is a living signal (#L533) |
| Limit | 137 Sealed Mirror | release, not imposition (#L7830) |

**3. Seed questions**
- Q1 118: naming seats the person above their frame: «the shoulders drop because it is elevation, not information».
- Q2 156/«Feeling Doesn't Shout»: true speech «звенит, вибрирует, резонирует с правдой»; thinking eats the bandwidth for feeling (#~L8320). 115 honesty marker. No explicit Barnum test.
- Q3 156 gives a layered map (body → impulses → pain/pleasure → emotions → subtle plane, chakra ladder) — a ready vocabulary for naming *where* a felt sense sits. Not yet used in product.
- Q4 154: re-articulation «is a practice, not an event»; one source of truth.
- Q5 154: drift = acting from an expired self-model; «verify before asserting».
- Q6 115 loop: articulate → see possibilities → enter → re-articulate. 154: «Check the mirror before debugging the hands.»
- Q7 115 proposes measurable "articulation depth"; 58 is about networking ("resonant connections self-formed"), only loosely relevant — recognition as the outcome, not volume. *Judgment:* 58 does not measure the inner moment.
- Q8 125 (unconsented seeing → status test), 137 (the Missionary: imposed reflection cancels free looking; «the last competence of a mirror is release, not accuracy»), 154 (stale self-model asserted with confidence).
- Q9 56: the friend is a second mirror; must come AFTER ownership (save first, then "sanity check").
- Q10 No technology names the felt moment itself as an object to catch and keep. Grep found no «эталон/etalon» in the library.

**4. Best practices.** (1) Consent then sight (125). Grade C (pilot session pair, 2026-10-27, per session-script). (2) Save before share (56h). Grade C. (3) Quiet the mind before reading (156, meditation as "calm lake"). Grade C.

**5. Failures.** 156 is oral-only, AI-drafted significance, Sasha to rewrite (156 §Significance "AI draft", inside #L8246-8376).

**6. Quotes.** «Да, чувствование оно не кричит… не борется за место под солнцем, оно просто чувствует.» (156, call 2026-09-03). «People don't share mirrors to help their friends. They share mirrors to confirm what they saw.» (56g).

---

## E5. Session templates (Private Founder-Market Fit Session) + canvas laws + Two Dials

**1. Header.** Sasha's live sessions (Ogi Mar 2026, Alexa Mar 2026, Rafael Jul 2026), codified Mar–Nov 2026. Why in: the only place where the felt moment is already probed in body terms with real people.

**2. Layers**
| layer | what happens | who | when |
|---|---|---|---|
| Name the gift | "You are the person who [X]", iterate to 9+/10 by gut | Sasha + client | min 25–50 |
| Recognition line | A always-known-never-said; B where in the body, what moved; C too simple? | Sasha asks all three | after each body score |
| Shadow | predicted internally, named gently; "the peak" | Sasha | after gift |
| Refinement | rate each artifact 1–10 by body, log exact words | both | min 80–100 |
| Reflection | "what landed (her words)"; "energy and vibration read" | Evolver, after | same day |

**3. Seed questions**
- Q1 The spoken sentence, then three probes (`R/docs/templates/session-script.md#L79`).
- Q2 «The body scores… If the facilitator or the AI says 9 and the founder feels 7, it's 7» and «is it "this isn't me" or "I don't want this to be me"?» (`R/docs/02-strategy/unique_business_canvas_template.md#L16-21`). Two Dials: resonance for light, CHARGE (0–10, "how much does this sting?") for shadow; landed = high charge AND, a minute later, «"это про меня"» (`R/docs/03-playbooks/unique_business_playbook.md#L2260-2272`).
- Q3 Probe B: body place + what moved (chills, warmth, tears, a drop, a breath). Verbatim words logged into the Nuance list (canvas law 7).
- Q4 Versioned, dated scores; «Only higher replaces»; reflection §3 "resonance map" (`R/docs/templates/session-reflection.md#L33-34`).
- Q5 Feed "what landed" into the next session. No ritual for the client to re-evoke alone.
- Q6 «Derive from the highest-rated version» (canvas law 6): the body score is used as the reference for building downstream artifacts.
- Q7 Body score 1–10 + charge 0–10; client-assigned scores (Ogi: Myth 8.9, Shadow 11.23, overall 10/10).
- Q8 Live shadow scored 6–7 gets dropped for a comfortable 10 (Two Dials risk); "name the shadow gently, don't do therapy" (script DO/DON'T).
- Q9 Sasha is the mirror; consent and container per PST 125.
- Q10 «The moment in the session where the founder gets emotional IS the crack where the shadow lives» (playbook #L2256).

**4. Best practices.**
1. Recognition line A/B/C after every score. Grade C (spec), drawn from sessions. `session-script.md#L79`.
2. Two dials: resonance for the gift, charge for the shadow; confirm ownership a minute later. Grade B (Rafael, Day 137: the live shadow scored 7.5–8 with visible resistance and he called it «практически вся тёмная сторона»). `unique_business_playbook.md#L2260-2272`.
3. Body overrides the guide's score. Grade C. `unique_business_canvas_template.md#L16`.

**5. Failures.** «The 2-hour minute plan is a composition; Sasha has not run it as written» (`session-script.md`, §6). Shadows scored before Two Dials may be the wrong ones (playbook #L2269).

**6. Quotes.** Ogi: «Sir, that's an 11.23. That's brutal. That's a cold plunge.» + «Lossum. In the gut. Very primal.» (`unique_business_playbook.md#L4235-4239`). Rafael: light lands as «вау, да, это я», shadow as «нет, блядь, это не я, идите нахер» — «Resistance IS the confirmation» (#L2262).

---

## Cluster patterns

- **What we already do, in the reveal:** prompts are written to produce a felt jolt (heart for the phrase, gut for the shadow), with anti-abstraction bans; one 1–10 "How much does this sound like you?" sits right under the reveal and is stored as an integer. Live since 2026-04-18.
- **What we already do, live:** the session has a mature somatic protocol — body score, recognition line A/B/C (incl. *where in the body did it land, what moved*), verbatim logging, "only higher replaces", Two Dials (resonance for light, charge for shadow). This is the closest existing etalon practice, but only for people in a paid session.
- **Theory is in place:** 156 (feeling ⊃ emotion; feeling is quiet and needs a calm mind), 118 (the mirror lifts subject to object), 125 (consent first), 56 (save, then verify with a friend), 154 (self-knowledge must be re-evoked or it goes stale), 137 (offer once, release).
- **Missing 1 — capture:** the product never catches the feeling itself (word/image + body place). The session's probe B has no product counterpart.
- **Missing 2 — shadow dial:** the reveal rates light and shadow on one resonance dial. The playbook's own evidence says this under-scores the live shadow; no charge dial or one-minute ownership check in the product.
- **Missing 3 — anchor and re-evoke:** nothing stores the feeling as a reference, nothing brings it back next day, and nothing uses it for a decision. The holomap warns the glow fades (4→5). Tech 154 demands re-articulation, but nothing implements it for the felt sense.
- **Missing 4 — measurement:** no pre/post felt measure (quiz Recognition Delta and Q4 were cut); `resonance_events` is not wired from the reveal; evidence for "10/10" is n=2 self-report (Jan 2026) plus named session cases.
- **Naming hazard:** the quiz's "recognition" answer = holomap stage 3 (still unnamed); the felt moment is stage 4. Keep the terms straight in any new technology.
- **A new technology would connect:** 156 (vocabulary and quiet), 118 (what the moment is), 125 + 137 (consent and non-imposition, anti-manipulation), 56 (friend check after ownership), 115 + 154 (re-evocation as practice, one source of truth), the canvas laws 2/3/7 and Two Dials (body scores, recognition line, charge), and holomap 3→4→5 (catch at 4, test into 5).
