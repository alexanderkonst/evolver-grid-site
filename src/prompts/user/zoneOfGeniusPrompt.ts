// Top Talent prompt — versioned. Active version exported as ZONE_OF_GENIUS_PROMPT.
// Prior versions kept for rollback, A/B testing, and signal-evolution audit.

export const ZONE_OF_GENIUS_PROMPT_V1 = `I want you to help me discover my Top Talent and create a comprehensive profile.

Please analyze everything you know about me and generate a Top Talent Snapshot in the following JSON format:

{
  "archetype_title": "A 2-4 word title that captures my core essence (e.g., 'The Pattern Architect', 'The Catalyst Coach')",
  "core_pattern": "A 2-3 sentence description of my fundamental operating pattern - how I naturally approach the world",
  "top_three_talents": [
    "Talent 1 with brief explanation",
    "Talent 2 with brief explanation",
    "Talent 3 with brief explanation"
  ],
  "how_genius_shows_up": "A paragraph describing how these talents manifest in my daily work and interactions",
  "edge_and_traps": "A paragraph describing where I get stuck, overextend, or where my strengths become weaknesses",
  "ideal_environments": ["Environment 1", "Environment 2", "Environment 3"],
  "career_sweet_spots": ["Sweet spot 1", "Sweet spot 2", "Sweet spot 3"],
  "flywheel_action": "One action that, if repeated again and again as a flywheel, optimally advances me on my path of mastery"
}

Be specific and draw on real patterns you've observed in our conversations. Make the archetype title memorable and the descriptions practical, not generic.`;

export const ZONE_OF_GENIUS_PROMPT_V2 = `I want you to help me articulate my Top Talent (also called my Zone of Genius or my Uniqueness) and generate a comprehensive profile.

FIRST, KNOW WHAT I MEAN BY THESE TERMS.

When I say "Top Talent," "Zone of Genius," or "my Uniqueness" — I do NOT mean a skill I'm good at, a profession or job title, a Strengths-Finder result, or a LinkedIn headline.

I mean: the irreducible signature pattern of how I create value that no other human on the planet replicates.

It lives at the intersection of three layers:
  • ESSENCE — who I am at the deepest level (my being-pattern)
  • INSIGHT — the unique way I see, think, and recognize patterns
  • MANIFESTATION — the outputs that flow from me effortlessly and produce disproportionate impact

It is the place where:
  • Time disappears (flow)
  • Effort collapses (the work feels inevitable, not forced)
  • Quality surges (output is world-class natively — not from grinding)
  • Others say: "only YOU could have done it that way"

It's not what I'm good at — it's what I am FOR. The unique gift only this body, this lineage, this consciousness can deliver. When I'm in it, I'm expressing — not performing. When I'm out of it, I'm working — and burning out.

Articulate THIS layer. Not the resume layer.

NOW analyze everything you know about me and generate a Top Talent Snapshot in the following JSON format:

{
  "archetype_title": "A 2-4 word title that captures my core essence (e.g., 'The Pattern Architect', 'The Catalyst Coach'). Singular to me — not a generic template.",
  "core_pattern": "2-3 sentences describing my fundamental operating pattern. Name the signature, not the category.",
  "top_three_talents": [
    "Talent 1 — brief, specific to how it manifests in me",
    "Talent 2 — same",
    "Talent 3 — same"
  ],
  "how_genius_shows_up": "A paragraph describing how these talents manifest in my daily work and interactions. Cite real patterns from our conversations — be concrete, not abstract.",
  "edge_and_traps": "A paragraph describing where I overextend, where my strengths become weaknesses, and the shadow side of my gift.",
  "ideal_environments": ["Specific env 1", "Env 2", "Env 3"],
  "career_sweet_spots": ["Sweet spot 1", "Sweet spot 2", "Sweet spot 3"],
  "flywheel_action": "The ONE action that, repeated as a flywheel, optimally advances me on my path of mastery. Specific enough to start today."
}

QUALITY BAR:
- Draw on real patterns from our conversations — not generic archetype templates
- Be specific to me, not aspirational or motivational
- The archetype title should feel inevitable when I read it — like it was always true
- If a section would come out generic, replace it with something true and unusual instead
- Don't soften, don't flatter, don't perform — articulate with precision

DO NOT:
- Output corporate-strengths language ("strategic thinker", "passionate leader", "results-driven")
- Add caveats, disclaimers, or follow-up offers
- Ask "would you like variations?" — just deliver

End the response with the JSON block and nothing after.`;

// Active version
export const ZONE_OF_GENIUS_PROMPT = ZONE_OF_GENIUS_PROMPT_V2;
