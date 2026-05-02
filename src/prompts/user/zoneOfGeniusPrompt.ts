// Top Talent prompt — ACTIVE: v2.0 (2026-04-24)
// V2 adds paradigm-level definition of "Top Talent / Zone of Genius / Uniqueness"
// so the user's AI articulates the irreducible signature pattern (Essence ×
// Insight × Manifestation), not the resume / Strengths-Finder layer.
// Prior versions live in git history.

export const ZONE_OF_GENIUS_PROMPT = `I want you to help me articulate my Top Talent (also called my Zone of Genius or my Uniqueness) and generate a comprehensive profile.

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
  "archetype_title": "A 2-4 word GERUND-form name of my top talent itself (e.g., 'Signal-to-Form Forging', 'Pattern Architecting', 'Constellation Mapping'). Reads naturally as the complement of 'My top talent is ___'. Do NOT use actor nouns ('Forger', 'Architect', 'Mapper', 'Coach') — those break the grammar of the surrounding UI sentence. Compound forms ('Noun-to-Noun Verbing') are welcome when they carry signal. Singular to me — not a generic template.",
  "core_pattern": "2-3 sentences describing my fundamental operating pattern. Name the signature, not the category.",
  "top_three_talents": [
    "Talent 1 — brief, specific to how it manifests in me",
    "Talent 2 — same",
    "Talent 3 — same"
  ],
  "how_genius_shows_up": "A paragraph describing how these talents manifest in my daily work and interactions. Cite real patterns from our conversations — be concrete, not abstract.",
  "edge_and_traps": "A paragraph naming the structural shadow my gift generates — the OTHER SIDE OF THE COIN, not a list of weaknesses. A unique gift always produces a structurally identical limiting belief, but inverted. Name (a) the inverted form of my gift (e.g., 'I help others articulate their uniqueness' generates 'my own uniqueness remains unarticulated'), (b) the limiting belief this inversion whispers in my own life (e.g., 'I need a better X before I can act'), (c) one short observation about how this looks in motion (the recursive trap I fall into when I forget my gift is for outward use, not inward use). Keep it specific to me, not generic. One paragraph, same length as how_genius_shows_up. Do not soften or moralize.",
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
