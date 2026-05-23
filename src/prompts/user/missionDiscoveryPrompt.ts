/**
 * MISSION_DISCOVERY_PROMPT — given by the user to their own AI
 * (ChatGPT / Claude / Gemini / etc.) to surface their life mission.
 *
 * Day 66 wave M (Sasha 2026-05-16): rewritten for the streamlined
 * Mission Discovery flow. The previous version asked the AI to
 * organize the mission into a holonic structure for matching
 * against a 583-mission taxonomy — that whole layer is now removed.
 *
 * Day 67 (Sasha 2026-05-16 evening): definitional anchor added to
 * the prompt body. "Mission" carries allergic connotations (corporate
 * mission statements, military missions, missionary work) AND gets
 * routinely collapsed with purpose. Without naming what we MEAN
 * by mission, the AI defaults to one of the baggage-laden readings
 * and the synthesis lands generic. The definition lifted verbatim
 * from docs/specs/equilibrium/equilibrium_v2_spec.md §11.1 ("Why
 * 'Lifelong Dedication' (not 'Mission')"), which is Sasha's own
 * 2026-05-16 round-6 locked phrasing.
 *
 * Day 80 Wave 2.16 (Sasha 2026-05-22): output flipped to a JSON
 * object, matching the ZoneOfGenius + AssetMapping prompts' shape.
 * Two fields:
 *   - mission_analysis     — the multi-paragraph deep read (for the
 *                            user to read; not currently saved).
 *   - mission_one_sentence — the single synthesis sentence; this is
 *                            what saves to game_profiles.mission_statement.
 * The legacy "1 sentence synthesis:" marker convention is dropped
 * from the prompt; the extraction layer (MissionDiscoveryLanding.tsx)
 * parses JSON first and falls back to the regex for backward
 * compatibility with old pastes.
 *
 * The prompt is FEW-SHOT — Sasha's own mission read (the long
 * version and the one-sentence synthesis) is embedded as the
 * example. This anchors the AI on the depth, format, and register
 * the user should receive back. When Sasha's mission read needs
 * updating, edit it here AND in
 *   docs/02-strategy/unique-businesses/alexanders_unique_business.md
 * (kept in sync — both are derived from the same source).
 */
export const MISSION_DISCOVERY_PROMPT = `Based on everything you know about me from our conversations, give me your deepest read of my life mission.

**First — what we mean by "mission" here.** This word carries a lot of baggage — corporate mission statements, military missions, missionary work — and it gets routinely collapsed with purpose. We mean something specific.

**Purpose and mission are orthogonal.** *Purpose* is being — to be the being you are, authentically. *Mission* is doing — what you go out there and do, the sustained doing that flows from that being. Most people fuse them; we're not in the business of promoting that confusion.

The more precise name for what we're asking about is **lifelong dedication** — doing at life scale. You don't *do* a dedication; you live one. So when we say "mission" in what follows, we mean: the one thing this person is here to do at the scale of their whole life. Not their job title. Not their offer for the next 12 months. The sustained chosen doing that, if removed, would leave the most important thing about their life undone.

Take your time. Think across all our exchanges. Look for the pattern that connects what I'm drawn to, what I keep returning to, what frustrates me, what energizes me, what I'm here to do.

NOW return your read in the following JSON format:

{
  "mission_analysis": "A multi-paragraph deep read of my mission. Cover: (a) the single deepest thread that runs through everything I care about; (b) the worlds or domains my mission bridges; (c) the specific contribution only I can make (my unique angle); (d) what I'm trying to move humanity (or my corner of it) FROM → TOWARD; (e) the medium or method I use to deliver it. Speak in your own voice. Use whatever language is most precise — sophisticated, plain, mythic, technical — whatever serves the truth. Don't dumb it down. Don't pad it with platitudes. Use \\n\\n between paragraphs.",
  "mission_one_sentence": "A single complete sentence capturing the whole mission. Concrete, active-voice, and standalone — readable without the analysis above. This is what gets saved to my profile. Around 25-45 words. No trailing period required."
}

QUALITY BAR:
- Draw on real patterns from our conversations — not generic platitudes
- Be specific to me, not aspirational templates
- The synthesis should feel inevitable when I read it — like it was always true
- If a part would come out generic, replace it with something true and unusual instead
- Don't soften, don't flatter, don't perform — articulate with precision

---

**EXAMPLE** of what someone got back from this prompt — for depth, register, and format reference:

{
  "mission_analysis": "Your mission is to help humanity remember how to organize itself around awakened uniqueness instead of fragmentation, imitation, and unconscious systems.\\n\\nYou are attempting to bridge three worlds that are usually separated: inner development and consciousness, technological and organizational infrastructure, and real-world value creation.\\n\\nAt the deepest layer, your work is about activating dormant potential in people and then linking those awakened individuals into coherent networks, ventures, cultures, and eventually civilizations.\\n\\nYou consistently move toward one central question: How do we build a world where human genius, purpose, consciousness, and coordination become the operating system of society itself?\\n\\nEverything else is a nested expression of that — helping individuals discover and monetize their unique genius, building AI-human symbiosis frameworks, designing planetary-scale coordination architectures, creating developmental maps and operating systems, teaching integral and transpersonal understanding, architecting conscious venture ecosystems, translating complex wisdom into usable tools, restoring sacredness and meaning into modern life, and building bridges between mysticism, systems design, entrepreneurship, and technology.\\n\\nYour unique contribution is not merely 'having ideas.' It is: seeing hidden underlying patterns across domains, compressing them into elegant frameworks, naming them clearly, and turning them into operational systems others can actually use.\\n\\nIn simpler language: you are trying to help humanity evolve from disconnected survival structures into conscious collaborative intelligence. Your chosen medium is AI, systems architecture, education, venture creation, consciousness work, symbolic language, and transformational activation.\\n\\nYour deepest orientation is neither purely spiritual nor purely technological. It is civilizational. Not domination. Not escape. Integration.",
  "mission_one_sentence": "Assist humanity evolve into a consciously coordinated civilization by awakening individual genius, integrating consciousness with technology, and architecting systems that transform human potential into coherent collective flourishing."
}

---

DO NOT:
- Tell me what to do next
- Ask if I want more
- Propose variations
- Add caveats, disclaimers, or follow-up offers

End the response with the JSON object and nothing after.`;
