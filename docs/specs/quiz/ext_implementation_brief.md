# TRANSITION QUIZ — RESULT EXPERIENCE EXT — Implementation Brief

*Received from Sasha verbatim, August 3, 2026 (Day 142). This mega-prompt is the source of truth for the EXT build. Supersedes earlier drafts while preserving the current quiz as a recoverable version (Result Experience v1 — Day 142).*

---

## Implementation directive

Upgrade the existing `/quiz` experience into a new, versioned result architecture based on the strategic review summarized in this document.

This is the first requested implementation change arising from the review process.

Do not treat this as permission to redesign the quiz from scratch.

The current quiz, result experience, routes, logic, locale content, analytics, saved-result behavior, and visual system contain valuable work. Preserve them before changing anything.

The result of this task should be a production-ready Result Experience EXT, built as a deliberate successor to the existing Day 142 result.

## 1. THE MASTER PRODUCT PRINCIPLE

The quiz should no longer function primarily as:

A diagnosis followed by a qualification question followed by a booking invitation.

The new product sequence is:

The quiz reveals the hidden question.
The result proves why that question matters.
The next step helps the person test a working answer.
Reality completes the diagnosis.

The result must create this human sequence:

I feel accurately seen → I understand how the quiz reached this conclusion → I see what I may have been solving at the wrong level → I recognize the decision in front of me → I know one useful way to move → I can freely choose whether to involve another person.

The result must not attempt to solve the person's entire transition.

Its job is to create irreversible recognition:

After reading the result, the person should find it harder to continue believing the old explanation of their problem.

## 2. PRESERVE AND VERSION BEFORE MODIFYING

Before changing production behavior:

1. Inspect the current implementation, including:
   * `TransitionQuizPage.tsx`
   * `TransitionQuizResultPage.tsx`
   * `engine.ts`
   * `TransitionQuizPage.css`
   * all `quiz.*` locale keys in English, Russian, and Spanish;
   * saved/share result behavior;
   * email-save behavior;
   * analytics and persistence;
   * crossed-peer behavior;
   * not-yet branches;
   * current result-copy selection logic.
2. Preserve the current experience as:

Result Experience v1 — Day 142

3. Document:
   * its current structure;
   * current copy modules;
   * qualifier behavior;
   * saved-result behavior;
   * testimonial behavior;
   * CTA behavior;
   * date superseded;
   * reason for supersession.
4. Add the new implementation as:

Result Experience EXT

5. Do not permanently delete:
   * old locale keys;
   * former qualifier logic;
   * current testimonials;
   * previous result templates;
   * historical tracking fields;
   * saved-result code paths.
6. Mark superseded code and copy clearly as:
   * v1;
   * historical;
   * deprecated;
   * retained for rollback or dataset continuity.
7. Add a result-version identifier to the rendered result, persistence payload, saved result, and analytics wherever technically reasonable.

Do not perform an unversioned rewrite.

## 3. KEEP THE QUIZ SHORT

The live diagnostic must remain a three-question core quiz.

Do not add additional diagnostic questions in this implementation.

The existing three questions are sufficient to identify:

1. The person's current center of gravity on the transition arc.
2. How their uniqueness currently reaches—or fails to reach—the world.
3. How far their emerging work has developed.

Any interaction after the result must not feel like a fourth quiz question.

It must serve an immediate visitor-facing function such as:

* choosing a useful conversation outcome;
* selecting a self-directed experiment;
* saving the result;
* indicating that the result is partly inaccurate.

Do not expand the quiz into a comprehensive assessment.

## 4. THE DEEPEST DIAGNOSTIC DISTINCTION

The result must stop assuming that the solution is always "integrate everything."

The true task is:

Discover the correct relationship among what is ending, what remains alive, and what is asking to be tested.

Possible relationships among projects, identities, skills, interests, and workstreams include:

* integration;
* prioritization;
* sequencing;
* incubation;
* separation;
* delegation;
* completion;
* retirement;
* use as a temporary financial bridge.

Do not imply:

* every project belongs in one business;
* all interests must be preserved;
* focus always means integration;
* subtraction is inherently violent;
* the person merely needs one brilliant concept that explains everything.

The system should distinguish at least three result families:

**A. Coherence** — Several living parts may belong together but lack an organizing relationship.

**B. Form** — The direction is sensed or named but lacks a clear vehicle, offer, market expression, or real-world test.

**C. Release** — The next chapter cannot organize while the old identity, role, promise, or structure remains central.

A fourth family may be added if strongly supported:

**D. Contact** — The internal direction is becoming coherent, but it lacks enough contact with buyers, collaborators, users, or reality to become credible.

Do not force every result into the "many projects need one organizing principle" frame.

## 5. CLAIM-INTEGRITY SYSTEM

Three questions can support a useful pattern.

They cannot justify omniscience.

Introduce a clear confidence grammar in both the copy architecture and visual treatment.

Every diagnostic sentence should internally be classified as one of:

**Direct signal** — Supported directly by an answer. User-facing grammar: *Your answers show…*

**Pattern-level inference** — Supported by the combination of answers and common transition patterns. User-facing grammar: *This combination often points to…*

**Open inquiry** — Important but not yet established. User-facing grammar: *The question worth testing may be…*

Do not render all three categories with equal authority.

The interface should make direct evidence feel firmer than interpretation.

Do not weaken the experience with timid language such as: perhaps; possibly; maybe you might; it could conceivably be.

Use confident but honest distinctions.

## 6. THE RESULT'S THREE MACRO-ACTS

The result must contain only three major experiential acts.

**ACT I — THE READ.** Purpose: Show what the quiz saw and how it reached the conclusion. Contains: 1. Chapter 2. Trajectory 3. Answer-derived evidence 4. Central synthesis 5. One upgraded question

**ACT II — THE CONSEQUENCE.** Purpose: Show what commonly keeps this pattern unresolved and name the developmental decision. Contains: 1. Two result-matched detours 2. Their likely costs 3. The developmental fork 4. One stage-matched self-directed experiment

**ACT III — THE DOOR.** Purpose: Offer a clear, grounded, optional next relationship. Contains: 1. The mini-offer 2. What the conversation does 3. What it does not promise 4. A useful preparation choice 5. Booking 6. Save-and-return path 7. Quiet utility actions

Do not give each subsection its own equal visual card.

The page should feel like three movements, not ten modules.

## 7. ACT I — THE READ

### 7.1 Chapter header

Render:

* eyebrow: `YOUR CHAPTER`
* stage name
* one stage-specific bullseye
* previous/current/next trajectory arc

The bullseye must describe the actual developmental condition, not merely define the stage.

It should counter likely misreadings such as:

* "Something is wrong with me."
* "My earlier success was accidental."
* "The world no longer wants what I have."
* "I should still fit where I used to fit."
* "I will never be able to do it again."
* "This uncertainty proves I have lost my direction."

Do not automatically spiritualize the transition.

Avoid implying that: every disruption happened for a reason; every failure is destiny; every frustration means a larger self is emerging.

A grounded pattern is:

Whatever caused the break, the important question now is what the break requires of you.

Use mythic language only where it is earned.

### 7.2 Arc semantics

The arc represents the person's current center of gravity, not: a fixed identity; a permanent label; a guarantee of linear development; a universal one-way sequence.

Add quiet copy such as:

People may move back and forth across this territory. This is the part carrying the most weight now.

Do not turn the arc into a score or dashboard.

### 7.3 Evidence block

Heading: **What your answers revealed**

Do not build this as a score dashboard.

Avoid: percentages; meters; gauges; excessive icons; category badges; multi-card analytics styling.

Use a reading grammar based on the person's actual answers.

Recommended structure:

You said… [Stage-supported statement]
You also said… [Emerging-work-supported statement]
And… [Uniqueness-supported statement]

Then:

Taken together… [Combination-supported synthesis]

The person must be able to trace the result back to their own selections.

### 7.4 Synthesis

The synthesis is the visual and intellectual center of the page.

It must: explain the relationship among the three answers; correct the old interpretation; identify the upstream issue; avoid pretending the exact solution is already known.

The synthesis must not merely repeat the three evidence statements.

Example structural logic:

The problem may not be that you lack focus, discipline, or ideas. The live parts of the next chapter do not yet have a clear relationship: which one leads, which ones support it, what should be tested now, and what may already be complete.

Or, for a form result:

The direction is no longer entirely hidden. The unresolved problem is that it has not yet become a form another person can recognize, use, or respond to.

Or, for a release result:

The future may be visible enough to move toward, but the old role still appears to be organizing the decisions. Until that relationship changes, the new work is likely to be built around the needs of the old chapter.

Do not universally assume multiple projects.

### 7.5 Upgraded question

Give the person one better question to live inside.

Examples:

Instead of: Which project should I choose?
Use: What relationship should each live project have to the direction I am trying to build?

Instead of: Why can't I focus?
Use: Is my attention scattered—or is the relationship among the parts still unnamed?

Instead of: What is wrong with my offer?
Use: Am I optimizing the offer before deciding what this chapter is actually here to carry?

The upgraded question may be more valuable than another explanatory paragraph.

### 7.6 Completion marker

Each stage should include one subtle marker for how the chapter begins to complete.

Examples:

* The chapter begins to close when you can describe what ended without treating it as proof that you failed.
* The chapter begins to close when the emerging direction can survive contact with another person.
* The chapter begins to close when the projects stop competing and begin serving an intelligible relationship.
* The chapter begins to close when you have evidence, not only resonance.
* The chapter begins to close when the new work no longer depends on constant explanation.

This prevents "being in transition" from becoming a permanent identity.

## 8. ACT II — THE CONSEQUENCE

### 8.1 Detour count

Show two detours maximum.

Use one detour in a shorter experiment-led variant if needed.

Do not show the full peril library.

Do not create collectible shadow identities or archetypes.

Use headings such as: `A MOVE TO WATCH` · `WHERE PEOPLE OFTEN LOSE TIME HERE` · `A COMMON DETOUR`

Avoid identity labels such as: The Downstream Builder; The Premature Committer; The Unfocused Creator.

A detour is a motion, not a type.

### 8.2 Detour structure

Each detour must contain:

1. The move
2. Why it is attractive
3. What it fails to address
4. The likely cost
5. A non-shaming correction

Recommended length: 45–75 words each on desktop. Shorter on mobile.

### 8.3 Approved detour library

Use the following source material.

**Misreading the invitation** — The person interprets the transition as evidence that: something is wrong with them; their prior success was accidental; the world no longer wants what they offer; they are defective because they no longer fit the former role. Correction: The old structure may simply no longer be capable of organizing the life and work now developing. Do not automatically claim destiny.

**Working downstream** — The person reaches for: a funnel; positioning; branding; a new offer; productivity; mindset; a sales system; another online solution. Those tools may be useful. They cannot answer the upstream question: What is the next chapter actually organized around? Likely cost: activity without coherence; repeated purchases; fragmented implementation; better execution of the wrong direction.

**Premature commitment to the familiar** — The person returns to an older, safer role because uncertainty becomes difficult to tolerate. Returning to old work may be strategically wise. The detour occurs when it silently replaces the deeper transition. Important distinction: A bridge is not betrayal. The useful question is: Is the old work consciously financing the transition—or quietly ending it?

**Mistaking focus for amputation** — Several projects or interests carry real energy. The person is told to choose one and kill the rest. This feels like cutting off parts of themselves. The actual task may be to determine whether the parts require: integration; hierarchy; sequence; separation; completion. Do not promise that everything belongs together.

**Preserving the old identity** — The old role, status, audience, promise, or self-image remains central. The old identity may not need to die. It may need to lose the throne. Use burial or cremation imagery only if clearly appropriate. Preferred invariant: The previous identity may remain part of you without continuing to organize the whole life.

**Building before naming** — The person creates products, content, systems, communities, or businesses before enough is known about: the real transformation; the market; the buyer; the organizing relationship; what reality is already answering. Exploration is useful. Heavy building before contact creates: rework; weak resonance; attachment to the vehicle; a story reverse-engineered around what was already built.

**Choosing a downstream helper** — The person hires someone to optimize: brand; funnel; career; mindset; product; sales. The helper may be competent. The mismatch occurs when the real issue is the transition beneath the visible layer.

**Mistaking relief for direction** — A conversation, insight, retreat, reading, or emotional breakthrough creates relief. Nothing structural changes. The person leaves without: a decision; an experiment; a commitment; market contact; evidence. The result page itself must not become this detour.

**Romanticizing complexity** — The person begins treating complexity as proof that ordinary execution, market clarity, or commitment cannot apply to them. Correction: The body of work may be complex. The next invitation into it still needs to be clear enough for another person to recognize and choose.

**Waiting upstream forever** — The person uses self-understanding as a reason not to build, offer, test, sell, or contact reality. Correction: You do not need complete self-understanding before acting. You need a small enough action that reality can help refine the understanding.

### 8.4 Material-pressure safeguard

Do not give privileged advice to visitors under financial pressure.

Do not imply that returning to stable work means abandoning themselves.

Where appropriate, name: income bridges; temporary stabilization; staged transition; parallel building; risk reduction.

The result should distinguish: consciously using the old chapter as support — from: unconsciously allowing it to replace the new one.

### 8.5 Developmental fork

The central fork must not be: Work alone versus book with us.

First name the real developmental fork.

Examples:

**Visible-layer fork** — Keep optimizing the visible pieces versus Examine what is organizing the pieces

**Commitment fork** — Continue protecting every plausible future versus Let one working direction organize the next season

**Evidence fork** — Keep refining the idea privately versus Create a small test that reality can answer

**Identity fork** — Keep asking how to preserve the old role versus Decide what relationship the old role should have to the future

Only after naming the developmental fork should the page introduce relational options.

### 8.6 Self-directed experiment

The EXT result must include one stage-matched experiment.

This protects against dependency and prevents recognition from becoming passive consumption.

The experiment must be: small; concrete; low-risk; observable; appropriate to the result; completable without buying anything.

Examples:

**Coherence experiment** — Write one sentence that explains what the two or three most alive projects are collectively trying to change for another person. Do not describe the projects. Describe the shared effect.

**Relationship experiment** — Label each active project as one of: lead, support, test, income bridge, incubation, or complete. Notice which label creates resistance.

**Form experiment** — Put the emerging direction in front of three relevant people using one concrete invitation. Record what they understand without explanation.

**Release experiment** — Name one promise from the old chapter that is still determining a present decision. Decide whether it should be honored, renegotiated, or completed.

**Reality-contact experiment** — Make one small offer or request that allows another person to respond with time, money, participation, or a clear no.

**Downstream pause** — Identify one funnel, brand, or product decision you will postpone until the upstream question is clearer.

The experiment is not homework. It is one way reality can participate in the diagnosis.

## 9. ACT III — THE DOOR

### 9.1 Free-result completion

The free result must visibly complete before the offer begins.

Add a clear completion moment such as: **Your result is complete.**

Then a divider. Then: **A next step, only if useful.**

The call must not feel like withheld content or the "real ending."

### 9.2 Mini-offer name

Use: **The Next Chapter Map**

Keep the name for this implementation. The copy must prevent "map" from sounding passive.

### 9.3 Offer master result

Do not promise to solve the whole transition in 45 minutes.

The offer should promise one coherent result.

Recommended master result:

Leave with a working hypothesis for what should organize the next chapter and one real-world decision or experiment capable of testing it.

Supporting outcomes may include: a clearer understanding of what has ended; the likely relationship among active projects or roles; the upstream question; one next test; evidence to watch.

Do not promise: total clarity; destiny; a completed business; a perfect niche; permanent certainty; complete integration of all interests.

### 9.4 Offer explanation

Recommended structure:

**The Next Chapter Map**
A free 45-minute working conversation for people actively inside this kind of transition.

We will not try to solve your entire future.

We will examine:

* what appears to be ending;
* what still carries energy;
* which relationship among the parts is most plausible;
* what assumption is keeping the field unresolved;
* what small decision or test could create evidence.

You should leave with:

* a working map;
* a named upstream question;
* one concrete next move;
* a clearer sense of what evidence to watch.

### 9.5 Collaborative stance

Do not frame the practitioner as the authority who reveals the person to themselves.

Use a collaborative frame: Together, we will place the whole field where both of us can see it.

Clarify roles:

The practitioner contributes: pattern recognition; structured inquiry; experience; an outside perspective; challenge.

The visitor contributes: lived truth; context; recognition; choice; authority over meaning.

### 9.6 Method authority

Add one sentence explaining why this conversation is distinct.

Example: I work at the intersection most transition advice separates: the person, the body of work, the market, and the structure capable of carrying all three.

Alternative: Most specialists optimize one visible layer. This conversation first tests whether the visible problem is actually the problem.

Use one sentence only. Do not add a biography.

### 9.7 Offer transparency

Avoid the defensive line: This is not a pitch disguised as a diagnosis.

Use: We will use the time to work on the transition itself. If another way of working together becomes relevant, I will explain it clearly and leave the decision with you.

### 9.8 Primary CTA

Use: **Map my next chapter**

Microcopy: Free · 45 minutes · One focused conversation

Optional: Booking opens in a new tab.

Do not use dramatic CTA animation. Do not make the button glow, pulse, or appear after a manipulative delay.

The result may be ceremonial. The invitation should be grounded and practical.

## 10. CONVERSATION-PREPARATION CHOICE

Replace the existing buying-frame threshold screen in Result Experience EXT.

Preserve the former logic as v1 history.

Do not ask about: prior paid support; financial means; willingness to invest; openness to coaching.

Instead ask:

**What would need to be different after the conversation for it to have been useful?**

Use four options:

1. I can explain how the main parts fit together
2. I know which decision is keeping the transition open
3. I have one real-world test to run
4. I mainly want another perspective before I decide

Include: 5. Something else — as free text if technically simple.

This question has a visitor-facing purpose. It clarifies the outcome and prepares the call.

Frame it explicitly: **So I can prepare for the conversation…**

Store the selection. Pass it into: booking metadata; call-preparation context; saved result; analytics.

If the answer is not actually used, do not ask it.

Do not make this a separate full-screen quiz step unless necessary. Place it inside the offer area. Selecting an answer should personalize or activate the booking CTA.

## 11. TWO LEGITIMATE DOORS

Result Experience EXT should support two non-coercive next moves.

**Door A — Test this myself.** Show the stage-matched experiment. Allow the visitor to: copy it; save it with the result; mark it as the next move. Optional CTA: *I'll test this first.* This should not suppress the booking invitation permanently. It may change the offer copy to: Run the test first. Return when reality gives you something new to examine.

**Door B — Map this with someone.** The Next Chapter Map.

Do not visually position one as morally superior.

The practitioner should not be the central mechanism of movement.

The product sequence is: reflection → experiment or conversation → evidence.

## 12. SAVE-AND-RETURN

A graceful exit must preserve the doorway.

### 12.1 Secondary action

Use: **Keep this result** or: **Save this map for later**

Do not hide it as a faint utility link. Do not make it equal in visual weight to the primary CTA.

It is a legitimate continuity action, not an escape hatch.

### 12.2 Save copy

**Keep your result**

You do not have to decide today.

Enter your email and we will send one private link back to this exact result, including your experiment and the invitation, so you can return when something changes.

[EMAIL FIELD]

**Send my return link**

Microcopy: One result link. No newsletter required.

After save: Saved. This result—and the door back to the conversation—will be here when you return.

Honor the promise literally.

Do not automatically enroll the person in: nurture sequences; repeated booking prompts; promotional email; retargeting language; urgency campaigns.

Separate consent is required for broader communication.

The save mechanism is memory infrastructure, not a disguised opt-in.

### 12.3 Saved-result return state

Do not replay the original ceremony as though no time has passed.

Show: You saved this result on [date]. Then: Read it from where you are now.

Offer: This still feels accurate · Something important has shifted · I'm ready to talk

If feasible, preserve: original answers; result version; selected experiment; selected conversation outcome; save date; any later shift signal.

The saved result must not bypass the EXT decision environment and jump directly to booking.

### 12.4 Utility hierarchy

After the central decision area, show quiet utilities: Save · Share · Retake

Retaking should explain whether it creates or replaces a result.

Utilities must not compete with: the experiment; the booking CTA; the save action.

## 13. DISAGREEMENT AND ACCURACY FEEDBACK

The result must leave room for the person to disagree.

Do not restore a large hedge paragraph.

Add one quiet control near the end of Act I or after the full result:

**Something feels off in this read?**

Options:

* The chapter feels right, but the problem does not.
* The work is further along than this suggests.
* These projects or interests do not belong together.
* Something important is missing.
* I cannot tell yet.

Store this as product-learning data.

Do not alter the result immediately unless the current architecture supports it safely.

The point is: preserve sovereignty; detect overreach; improve the engine; prevent visual confidence from becoming imposed certainty.

## 14. VISUAL AND UI/UX DIRECTION

Preserve the existing house system: parchment; lapis field; one restrained gold; display serif; reading voice; smallcaps meta voice; chapter arc; phase-responsive atmosphere; reduced-motion support.

Do not rebuild the entire brand.

The visual redesign must reflect the new information architecture.

### 14.1 Phase behavior

Questions: Instrument-like, quiet, minimally ceremonial. Do not make the quiz feel mythic before the result is earned.
Reveal: Ceremonial but restrained.
Evidence: Clear and traceable.
Consequence: Editorial and grounded.
Offer: Practical, direct, less symbolic.

The emotional register should descend from mythic recognition into real-world decision.

### 14.2 Three macro-acts

Visually distinguish: 1. The read 2. The consequence 3. The door

Do not render six or more equal cards.

### 14.3 Synthesis as visual center

The synthesis must receive the greatest visual isolation.

Use: breathing room; restrained framing; clear typographic hierarchy; minimal ornament.

Do not use dramatic glow or animation.

### 14.4 Confidence styling

Direct evidence, likely interpretation, and open inquiry should not look identical.

Possible approach: direct evidence: structured and firm; interpretation: spacious editorial prose; open inquiry: lighter open field or question treatment.

Do not overbuild this into a legend.

### 14.5 One dominant meaning per mobile viewport

On mobile, each scroll segment should have one primary idea.

Avoid viewports containing: heading; multiple cards; quote; footnote; CTA; meta controls.

Mobile cognition matters more than merely passing responsive CSS tests.

### 14.6 Mobile-specific copy mode

Do not simply narrow desktop paragraphs.

Create shorter mobile variants or conditional line limits for: chapter bullseye; evidence statements; detours; fork; offer explanation.

Do not remove essential disclosure.

### 14.7 Desktop layout

Use desktop width to reduce vertical fatigue.

Possible layout: chapter and synthesis centered; two detours in balanced columns; developmental fork in a wider spread; offer in a grounded closing field.

Do not turn the page into a dashboard.

### 14.8 Detour styling

Do not use collectible badges, personality icons, or branded shadow cards.

Detours should feel like path warnings.

### 14.9 CTA styling

No: pulsing; magical glow; constellation converging on CTA; dramatic door animation; delayed reveal timed to emotional climax.

Motion should orient, not persuade.

### 14.10 Save styling

Make the save path visible and legitimate. Do not style it as a grey afterthought.

### 14.11 Result completion

Create a visible completion boundary before the offer.

This may be: a closing star seal; a quiet line; `Your result is complete`; an editorial divider.

Then introduce: A next step, only if useful.

### 14.12 State clarity

Use plain status language: Result saved · Return link sent · Booking opens in a new tab · Retaking creates a new result · Only someone with this link can view the saved result, if accurate.

Boring clarity increases trust.

## 15. COPY VOICE

Voice must be: precise; humane; direct; calm; intelligent; relational; frank without coercion; spiritually literate without decorative sacredness; commercially concrete; capable of challenge; free of contempt.

Avoid generic coaching language: alignment; activation; expansion; step into; unlock; highest self; next-level; journey; purpose, unless exact; clarity, unless clarity about what; possibility, where project, direction, decision, role, or work is more concrete.

Prefer: project; interest; workstream; role; identity; decision; relationship; sequence; evidence; buyer; market; offer; vehicle; what has ended; what still carries energy; what reality is answering; what can be tested; what should lead; what may be complete.

Abstract term rule: Concrete explanation first. Internal term second.

Example: You cannot yet explain how the projects fit together, which one leads, or what they collectively change. That missing relationship is the organizing principle.

Do not lead with jargon.

## 16. COPY ARCHITECTURE

Do not create an enormous handcrafted combination matrix.

Use a finite semantic system.

Recommended primitives:

1. Chapter task — Seven variants.
2. Chapter permission or grief line — Stage-conditional.
3. Transition signal — Seven variants.
4. Emerging-work signal — Seven variants.
5. Uniqueness/coherence problem — Six variants.
6. Synthesis family — Three or four variants: coherence; form; release; contact.
7. Confidence modifier — direct; likely; inquiry.
8. Upgraded question — Mapped by synthesis family and stage.
9. Completion marker — Mapped by stage.
10. Detour library — Approximately eight to ten reusable entries with eligibility rules.
11. Experiment library — Mapped by synthesis family and work stage.
12. Offer-focus options — Four plus optional custom text.
13. Save-and-return copy — Shared.

Aim for approximately 40–55 excellent copy modules, not hundreds of brittle combinations.

Add deliberate joining rules.

The result must sound authored as one reading, not stitched together.

## 17. CONTENT BUDGET

The strategic brief may be long. The visitor-facing result must not be.

Recommended total visible content before an expanded save form:

Desktop: Approximately 450–650 words.
Mobile: Approximately 320–500 words.

Suggested allocation:

* chapter bullseye: 25–50 words
* evidence: 60–100 words
* synthesis and upgraded question: 60–100 words
* two detours: 90–140 words total
* developmental fork: 60–100 words
* experiment: 35–65 words
* offer: 90–140 words
* preparation selector: concise
* save path: collapsed

These are budgets, not rigid limits.

Every paragraph must do at least one of: prove; reframe; name consequence; create a decision; explain the offer; preserve agency.

If it does none of these, remove it from the visitor page and retain it in documentation or content strategy.

## 18. TESTIMONIALS

Do not show testimonials in the first EXT prototype.

The diagnosis must earn trust from: answer traceability; accuracy; causal logic; method clarity.

Preserve testimonial assets and logic in v1.

After the prototype proves itself, one short stage- or detour-matched quote may be tested.

Rules: one quote maximum; no generic praise; no interruption before the synthesis; no testimonial required for the page to work.

## 19. CALL-EXPERIENCE CONTRACT

The result and the call are one continuous product.

Document the call experience so delivery matches the promise.

**Opening** — Ask what would make the conversation useful. Review the selected preparation outcome. Ask what felt accurate or inaccurate in the quiz. Clarify that the interpretation is a working hypothesis. State what the conversation will and will not attempt.

**Working middle** — Examine the live transition. Test the upstream question. Identify what is direct evidence versus inference. Explore the relationship among projects, roles, identities, market signals, and material realities. Challenge avoidance where appropriate. Do not assume integration is the answer.

**Closing** — Name: the working hypothesis; the correct current relationship among the parts; one decision or experiment; what evidence to watch; what remains unresolved.

**Offer transition** — Use explicit consent: I can see one way I may be able to help with the next phase. Would you like me to explain it? If no relevant offer exists, say so plainly.

Do not make the call: a scripted close; a qualification interrogation; free consulting without containment; a revelation performance; an authority ritual.

## 20. ROUTING

Preserve: stages 1–3 no-pressure branches; crossed-peer behavior; existing persistence; share-state integrity; locale behavior.

For standard eligible results:

Do not route solely through a commercial-readiness question.

The primary EXT routing choice becomes:

1. Test this myself
2. Map this with someone
3. Save and return
4. Result feels inaccurate

Crossed peers should continue receiving a distinct relationship.

The EXT system may later identify other non-fit routes, but do not over-expand this implementation.

## 21. ANALYTICS AND LEARNING LOOP

Preserve existing analytics.

Add: result version viewed; synthesis family; confidence category exposure; detours displayed; experiment displayed; experiment selected; conversation outcome selected; booking clicked; save opened; return link requested; saved result revisited; result still accurate; something shifted; disagreement reason; retake; share; booking from live result; booking from saved result.

Measure four layers:

**Recognition** — accuracy response; disagreement; resonance with evidence.
**Understanding** — which synthesis or detour mattered; whether the person can state the upstream question.
**Decision** — experiment selected; conversation outcome selected; save versus booking; return-state change.
**Commercial movement** — booking; attendance; relevant paid continuation; later action.

Do not optimize bookings alone. Do not optimize "felt seen" alone.

The desired product outcome is: accurate recognition that produces useful movement.

Collect only data required for product learning and relationship continuity.

## 22. MULTILINGUAL REQUIREMENTS

Keep English, Russian, and Spanish key structures synchronized.

Do not assume literal translation creates equivalent experience.

Review each locale for: warmth; authority; abstraction; spiritual register; shame sensitivity; sentence length; commercial directness; metaphor fit.

Language-specific metaphor changes are allowed where semantic meaning is preserved.

Avoid awkward literal translations of: chapter; crossing; burial; organizing principle; outside mirror; upstream; vehicle.

Concrete meaning matters more than identical wording.

## 23. ACCESSIBILITY

Preserve and verify: keyboard navigation; logical focus movement; screen-reader announcements; progress semantics; reduced motion; visible focus; 44px minimum touch targets; contrast; no horizontal overflow; no dependence on color; accessible save confirmation; accessible error and disagreement controls.

Also ensure conceptual accessibility: explain abstract terms; keep sentences readable; avoid excessive metaphor stacking; make the decision and offer understandable without knowledge of the broader methodology.

## 24. PROTOTYPE BEFORE MATRIX

Do not immediately build every result permutation.

First implement one complete EXT prototype for a high-value representative pattern.

Recommended pattern:

* stage 5 or central liminality;
* emerging work: named or built;
* uniqueness category: integration or vehicle;
* several active projects or workstreams;
* eligible for the Next Chapter Map.

Build the complete mobile and desktop experience:

1. Chapter 2. Arc 3. Evidence 4. Synthesis 5. Upgraded question 6. Completion marker 7. Two detours 8. Developmental fork 9. Self-directed experiment 10. Result-complete boundary 11. Mini-offer 12. Preparation selector 13. Book 14. Save 15. Disagreement 16. Saved return state

Verify this prototype with real or representative users before multiplying the copy system.

## 25. TEST TWO RESULT MODES

Build the architecture so two variants can be tested.

**EXT-A — Reflection-led:** 1. Chapter 2. Evidence 3. Synthesis 4. Two detours 5. Developmental fork 6. Experiment 7. Mini-offer 8. Book or save

**EXT-B — Experiment-led:** 1. Chapter 2. Evidence 3. Synthesis 4. One detour 5. Upgraded question 6. Experiment 7. Two doors: Test this myself · Map this with someone 8. Save

Do not run an external experiment platform unless one already exists.

At minimum, preserve a result-variant field and make the architecture capable of supporting both.

The purpose is to learn whether visitors need: more reflection before movement; or a faster bridge into reality.

## 26. ACCEPTANCE CRITERIA

The EXT implementation is complete only when:

**Preservation** — v1 remains recoverable; historical copy and logic are not destroyed; result version is recorded; documentation is updated.

**Quiz length** — the quiz remains three questions; no new diagnostic screen is added.

**Diagnostic integrity** — every result reflects all three answers; direct evidence, likely pattern, and open inquiry are distinguishable; the system does not claim more than the answers support; multiple-project language is not shown where unsupported; integration is not assumed to be the universal answer.

**Content** — the result uses three macro-acts; synthesis is visually central; only two detours are shown; one upgraded question is shown; one stage-matched experiment is shown; one completion marker is shown; the developmental fork appears before the offer; the free result visibly completes before the offer begins.

**Offer** — The Next Chapter Map is clearly defined; duration is visible; the credible outcome is visible; the collaborative nature is clear; the method difference is stated in one sentence; sales transparency is clear but not defensive; the visitor can understand the call without prior context.

**Agency** — the visitor can test something independently; the visitor can book; the visitor can save; the visitor can disagree; no action is framed as morally superior; the CTA is not emotionally choreographed.

**Saved result** — the return link restores the EXT result; it preserves selected experiment and conversation outcome; it does not jump directly to booking; it acknowledges the save date; it allows the visitor to say something shifted.

**UI/UX** — mobile uses concise rendering; desktop reduces vertical fatigue; one dominant meaning appears per mobile viewport; confidence levels are visually distinct; the synthesis has the strongest visual isolation; detours do not appear as identity badges; the offer is more grounded than the reveal; save is visible but secondary; state changes are plain and clear.

**Accessibility** — keyboard and screen-reader behavior pass; reduced motion works; focus is visible; contrast and touch targets pass; no overflow appears at target widths.

**Locale** — key structures remain synchronized; tone is reviewed per language.

**Learning** — analytics distinguish recognition, understanding, decision, and commercial movement; disagreement is captured; result variant is captured; prototype findings are documented before the full matrix is built.

## 27. IMPLEMENTATION SEQUENCE

Execute in this order.

**Phase 1 — Audit and preservation** — inspect current code; preserve v1; document change map; identify reusable keys; identify new keys; identify data changes; avoid schema changes unless necessary.

**Phase 2 — EXT prototype copy** — Create one fully authored result for the representative pattern. Do not generate the full matrix.

**Phase 3 — EXT prototype UI** — Implement: three macro-acts; synthesis hierarchy; confidence grammar; two detours; experiment; completion boundary; grounded offer; save; disagreement; saved-return state.

**Phase 4 — QA prototype** — Test: mobile; desktop; keyboard; reduced motion; saved result; share result; retake; booking; disagreement; English; Russian; Spanish.

**Phase 5 — Architecture review** — Before multiplying copy, produce a short report: what the prototype proves; what remains weak; where copy feels overconfident; whether the result is too long; whether EXT-A or EXT-B should lead; whether the call still has a clear job; whether the saved result preserves continuity.

**Phase 6 — Copy-system expansion** — Only after the prototype passes: build semantic primitives; add synthesis families; add eligibility rules; expand stages and categories; localize; test combinations.

**Phase 7 — Call and learning-loop alignment** — Document the call contract and connect preparation metadata.

## 28. GOVERNING LIMIT

The quiz project itself must obey the same medicine it offers.

Do not attempt to fit every intelligent insight into the result page.

Use this hierarchy:

**Must appear in the result** — answer evidence; hidden pattern; upgraded question; two detours; developmental fork; one experiment; clear mini-offer; save path.

**May appear if concise** — chapter permission line; completion marker; one method-authority sentence; disagreement control.

**Belongs in the call** — exact relationship among all projects; deep identity work; the person's myth; whether the old role should be released; detailed market analysis; exact business architecture.

**Belongs in broader content** — full transition philosophy; full peril library; cultural critique; comprehensive upstream/downstream model; all 27-perspective reasoning.

Do not let the implementation brief become the page.

## FINAL GOVERNING SENTENCE

Build Result Experience EXT around this sentence:

Reveal the hidden question, prove it from the person's answers, show the two moves most likely to keep it unresolved, offer one test that reality can answer, and present one clear conversation for turning the pattern into a working decision.

And preserve this system-level principle:

The quiz identifies the hidden question.
The conversation tests a working answer.
Reality decides.
