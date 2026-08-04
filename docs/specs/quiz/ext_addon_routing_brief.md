# TRANSITION QUIZ — ADD-ON ONLY: Funnel Routing and Top Talent Continuity Layer

*Received from Sasha verbatim, August 4, 2026. Additive refinement on top of the shipped Result Experience EXT (see ext_implementation_brief.md, ext_phase5_review.md). Treat current code as ground truth.*

## Important context

The full Result Experience EXT implementation has already been completed. The Hero's Journey positioning work is either already completed or currently being handled separately. Do not rebuild, rewrite, or repeat any previously completed work. This task is an additive refinement only.

Preserve the current: three-question quiz; scoring; stage definitions; result architecture; chapter presentation; answer-derived proof; synthesis; detours; developmental fork; self-directed experiment; Next Chapter Map offer; save-and-return system; crossed-peer route; visual design; mobile and desktop layouts; locale architecture; persistence; analytics already implemented.

Before changing anything, inspect the current production code and identify the smallest changes needed to add the routing and ecosystem-continuity behavior below. Do not assume that an older specification still describes the live implementation. Treat the current code as ground truth.

## 1. PURPOSE OF THIS ADD-ON

The quiz has two legitimate jobs:

1. Identify and directly invite the people who are currently the strongest fit for the Next Chapter Map and deeper work.
2. Give every other visitor a valuable next step through the free Top Talent, resource-mapping, and mission pathway.

This add-on must strengthen both jobs without turning the result page into a menu of competing offers.

Use this principle: Every visitor receives one clearly recommended primary next step. High-fit visitors receive a direct invitation to the Next Chapter Map. Earlier-stage visitors receive a valuable Top Talent pathway. Secondary options remain available but visually subordinate.

## 2. DO NOT REPEAT COMPLETED WORK

Do not change or recreate: entry headline; entry subheadline; entry CTA; Hero's Journey positioning; chapter-task copy; movement markers; result proof architecture; EXT copy modules; detour logic; experiment logic; existing offer explanation; result-completion boundary; save-and-return behavior, except where route hierarchy must be preserved; existing result-page visual hierarchy, except the CTA ordering described below.

Do not add duplicate: chapter sections; chapter tasks; movement markers; Top Talent sections; offer sections; save forms; result summaries.

If a relevant module already exists, revise or reposition it rather than adding another version.

## 3. AUDIT FIRST

Inspect the live code and report briefly:

1. Where Top Talent is currently linked from the transition quiz.
2. Which result branches currently show it.
3. Whether stages 1–3 already use stage-specific Top Talent copy.
4. Whether stages 4–7 currently show any Top Talent pathway.
5. The current ordering of: Next Chapter Map; experiment; save; Top Talent; share; retake.
6. Whether the saved-result page preserves the same ordering.
7. Which email captures already exist and what each one promises.

Then make only the changes required below.

## 4. PRIMARY ROUTE HIERARCHY

Every result must have one obvious primary next step. Do not display several equal calls to action.

**Stages 1–3.** Primary route: Free Top Talent assessment or reveal. These visitors should receive a complete transition result first. After the result, explain why Top Talent is the useful next layer for their current stage. Do not make them feel rejected, premature, or commercially unimportant.

**Stages 4–7.** Primary route: The Next Chapter Map. These are the strongest-fit visitors for the current practitioner-led work. The direct conversation invitation must remain visually and strategically primary. Do not place Top Talent above it. Do not require Top Talent completion before showing the call.

**Crossed peer.** Preserve the existing peer-specific primary route. Do not route mature peers into a beginner pathway unless Top Talent is clearly framed as deeper articulation rather than basic self-discovery.

## 5. STAGES 1–3: TOP TALENT AS PRIMARY NEXT STEP

After the person receives the complete stage result, show a stage-matched bridge into Top Talent. The bridge must explain why this assessment is relevant now.

Do not use generic copy such as: Take another quiz; Learn more about yourself; Discover your strengths; Continue your journey.

Use the existing product truth: The transition quiz shows where the person is now. Top Talent shows what valuable capacity continues across changing roles and chapters.

Create or revise one stage-specific bridge for each early stage.

**Stage 1 direction.** Core logic: A major professional crossing may not be active yet. The useful next move is to recognize the talent and contribution already present beneath the current role. Suggested CTA: Reveal my Top Talent

**Stage 2 direction.** Core logic: Early change often first appears as a recurring ability, interest, or contribution asking for more room. Suggested CTA: See what keeps asking for expression

**Stage 3 direction.** Core logic: Before forcing a direction, identify the talent, resources, and mission threads already repeating across the person's life and work. Suggested CTA: Map what is already emerging

These are copy directions. Inspect the actual Top Talent experience and preserve any stronger, more accurate existing product language. Do not overpromise permanent purpose, guaranteed income, or definitive identity.

## 6. STAGES 4–7: PROTECT THE HIGH-FIT INVITATION

For stages 4–7, preserve the Next Chapter Map as the unmistakable primary action.

Required hierarchy: 1. Next Chapter Map 2. Top Talent as a complementary secondary layer 3. Save result 4. Share and retake utilities

Prevent these failure modes: Top Talent appears before the call; the experiment visually overpowers the call; save-for-later is easier to notice than the call; excessive caveats make the call sound unnecessary; the visitor reaches the Top Talent section before understanding what the Next Chapter Map is; several equal buttons force the visitor to choose their own funnel path.

The result should communicate: Based on where you are, this conversation is the most relevant next step. Do this without coercion.

A valid bridge shape is: Your answers suggest that the transition is no longer theoretical. The unresolved question is already affecting the shape of your work. At this stage, an outside conversation can expose assumptions that are difficult to see from inside the transition and help convert the pattern into a working decision.

Do not use one universal paragraph if the current EXT system already supports stage- or synthesis-specific bridge copy.

## 7. TOP TALENT AS A SECONDARY LAYER FOR STAGES 4–7

After the Next Chapter Map invitation, show a quieter Top Talent module.

Preferred framing:

Another useful layer
**Your Top Talent**
Your chapter may change. The underlying form of value you create often repeats.
The free Top Talent assessment helps you name the ability or contribution that continues across roles, offers, and professional chapters.

CTA: Reveal my Top Talent
Suggested microcopy: Free · A few minutes · Includes your personal result

Only use claims that match the actual Top Talent product. This module must be clearly secondary to the Next Chapter Map. It should not look like an alternative of equal importance for a high-fit visitor.

## 8. FREE ECOSYSTEM SEQUENCE

The broader free pathway is: Chapter → Top Talent → Resources → Mission

Do not display all four as equal choices on the transition result. The transition result should point to Top Talent. Top Talent may then lead to resource mapping. Resource mapping may then lead to mission identification. Reveal the pathway one useful step at a time. Do not create a large "free tools" menu on the result page.

## 9. POSITIONING OF TOP TALENT

Top Talent is not a consolation prize for visitors who are not ready for the call. Position it as a valuable product in its own right.

The transition quiz answers: Where am I now?
Top Talent answers: What valuable capacity continues to travel with me?
Resource mapping answers: What do I already have available?
Mission identification answers: What larger contribution may these capacities and resources support?

Use this logic to create continuity between the products. Do not make Top Talent feel unrelated to the chapter result.

## 10. EMAIL CAPTURE

Do not add or redesign email capture unless required for the route to function. Use existing email infrastructure where possible. Every email request must explain its purpose.

Saved transition result — Promise: Send me one private link back to this result. Do not silently convert this into general marketing consent.

Top Talent — If email is required, state what the visitor receives. Example: Enter your email to save your Top Talent result. Only mention resource mapping or mission continuation if the actual product flow provides it.

Keep result delivery and broader marketing consent distinguishable where technically feasible. Do not block the transition result behind email.

## 11. CTA VISUAL HIERARCHY

Use the existing design system.

Primary CTA: Strongest button treatment. Only one primary CTA in the main decision area.
Secondary ecosystem CTA: Visible editorial treatment, clearly subordinate. Do not make it look disabled or hidden.
Continuity and utility actions: Quiet treatment for save; share; retake; disagreement.

Do not render all actions as a uniform vertical button stack. On mobile, the intended next step must be immediately understandable.

## 12. SAVED RESULT

Ensure the saved-result route preserves the same primary and secondary hierarchy as the live result.

For a saved stage 4–7 result: 1. Next Chapter Map remains primary. 2. Top Talent remains secondary. 3. Save status and utilities remain quiet.

For a saved stage 1–3 result: 1. Top Talent remains primary. 2. Return and retake remain secondary.

Do not allow the saved-result route to bypass the result logic or jump directly to booking. Do not replay duplicate Top Talent invitations if the person already completed it and that state is available.

## 13. CROSSED-PEER ROUTE

Preserve the existing peer-specific primary invitation. If Top Talent appears, frame it as: deeper language for what is already working — not: discover who you are. Do not make a mature peer repeat a beginner self-discovery path unnecessarily.

## 14. ANALYTICS

Do not rebuild the analytics system. Add only the smallest event or property changes necessary to distinguish: primary route shown; Next Chapter Map clicked; Top Talent clicked; result stage; live versus saved result; result version.

If analytics already capture CTA identity and result stage, reuse them. Avoid schema changes unless truly necessary. Document any added event names or properties.

## 15. LOCALE REQUIREMENTS

Apply new or revised copy across English, Russian, Spanish. Keep locale structures synchronized. Translate naturally. Do not translate Top Talent, resource mapping, or mission language literally if the result sounds artificial in a locale. Preserve product-name consistency where those names are branded.

## 16. ACCEPTANCE CRITERIA

**Preservation** — Existing EXT behavior remains intact. No completed entry, result, Hero's Journey, or offer work is rebuilt. No duplicate modules are introduced.

**Stages 1–3** — Each receives a complete result. Top Talent is the clear primary next step. The bridge is stage-specific. The visitor does not feel rejected or unqualified.

**Stages 4–7** — The Next Chapter Map remains unmistakably primary. Top Talent appears afterward as a complementary layer. Save, experiment, and utilities do not overpower the call. The invitation clearly explains why the conversation is relevant now.

**Crossed peer** — The peer route remains primary. Top Talent is framed appropriately or omitted.

**Ecosystem** — The result points to Top Talent rather than displaying all free tools at once. The larger sequence remains coherent: chapter; talent; resources; mission.

**Email** — Existing email capture is reused. Every email request has a clear purpose. The free result is not email-gated. Save-result consent is not silently treated as general marketing consent.

**UI** — One obvious primary action per result route. Secondary action is visible but subordinate. Mobile does not show an undifferentiated wall of CTAs. Saved results preserve the same hierarchy.

**Technical** — Existing scoring, routing, persistence, share-state, and EXT logic remain functional. Locale keys remain synchronized. Relevant tests, typecheck, build, and scoped lint pass.

## 17. REPORT BACK

After implementation, report only: 1. Existing modules reused 2. New or revised modules 3. CTA hierarchy by result type 4. Top Talent placement by stage group 5. Email behavior changed, if any 6. Locale keys changed 7. Analytics changes, if any 8. Live and saved result states checked 9. Tests run 10. Any remaining CTA conflict

## GOVERNING ADD-ON PRINCIPLE

Do not rebuild what already works. Add one clear route for each level of readiness. Give high-fit visitors the direct invitation. Give everyone else a valuable next step into the ecosystem.
