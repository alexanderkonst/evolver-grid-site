export const ZONE_OF_GENIUS_PROMPT = `I want you to help me discover my Zone of Genius and create a comprehensive profile.

Please analyze everything you know about me and generate a Zone of Genius Snapshot in the following JSON format:

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
  "this_week_actions": ["Concrete action 1", "Concrete action 2", "Concrete action 3"]
}

Be specific and draw on real patterns you've observed in our conversations. Make the archetype title memorable and the descriptions practical, not generic.`;
