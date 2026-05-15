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
  "archetype_title": "A 2-4 word GERUND-form name of my top talent itself (e.g., 'Signal-to-Form Forging', 'Pattern Architecting', 'Constellation Mapping'). Reads naturally as the complement of 'My top talent is ___'. Do NOT use actor nouns ('Forger', 'Architect', 'Mapper', 'Coach') — those break the grammar of the surrounding UI sentence. Compound forms ('Noun-to-Noun Verbing') are welcome when they carry signal. Singular to me — not a generic template. NO ABSTRACT COMPOUND NOUNS — banned: 'Inner X / Felt X / Safe X / Sacred X / Deep X / True X / Pure X / Whole X / Authentic X' (e.g. 'Inner-Belonging Restoring' is REJECT — a smart friend outside personal-development would have to ask 'what does that mean?'). The 5-second-friend test: if a non-coach friend wouldn't grok it instantly, rewrite it concrete.",
  "core_pattern": "2-3 sentences describing my fundamental operating pattern. Name the signature, not the category.",
  "top_three_talents": [
    "Talent 1 — 2-3 sentences, specific to how it manifests in me. SECOND-PERSON addressing me. DUAL-ACTOR: when this talent acts on OTHER PEOPLE / clients / gift recipients, they stay 'they / them / their.' NEVER use 'yourself' to refer to those other people. Bug to avoid: '...People feel obvious to YOURSELF because you turn YOUR OWN stories into a map YOU can follow.' Two errors: (a) 'yourself' should be 'you' (people = subject); (b) 'a map you can follow' should be 'a map THEY can follow' (the OTHER people follow the map you built).",
    "Talent 2 — same standard, same dual-actor discipline.",
    "Talent 3 — same standard, same dual-actor discipline."
  ],
  "how_genius_shows_up": "A paragraph describing how these talents manifest in my daily work and interactions. Cite real patterns from our conversations — be concrete, not abstract. SECOND-PERSON addressing me. SCENE-STRUCTURE TEMPLATE (mandatory): sentence 1 MUST start by naming the OTHER ACTOR'S state, NOT mine — choose 'When someone…' / 'When the work is…' / 'When a founder arrives with…' / 'People feel…' NEVER start with 'When YOU feel…' or 'When YOU bring…' (the user is not the person in the problem state; the user is the one who resolves it). Sentence 2+ describes my action in response — THIS is where 'you' enters. Bug to avoid (May 13): 'Your genius shows up when YOU feel overloaded… YOU bring a tangle… you leave behind a structure YOU can act on.' Correct: 'Your genius shows up when SOMEONE feels overloaded… THEY bring a tangle… you leave behind a structure THEY can act on.'",
  "edge_and_traps": "A paragraph naming the structural shadow my gift generates — the OTHER SIDE OF THE COIN, not a list of weaknesses. A unique gift always produces a structurally identical limiting belief, but inverted. Name (a) the inverted form of my gift (e.g., 'I help others articulate their uniqueness' generates 'my own uniqueness remains unarticulated'), (b) the limiting belief this inversion whispers in my own life (e.g., 'I need a better X before I can act'), (c) one short observation about how this looks in motion (the recursive trap I fall into when I forget my gift is for outward use, not inward use). Keep it specific to me, not generic. One paragraph, same length as how_genius_shows_up. Do not soften or moralize.",
  "top_shadow_one_sentence": "Synthesize the edge_and_traps paragraph above into ONE punchy sentence (max ~16 words). CRITICAL synthesis principle: preserve signal-to-noise ratio — minimal signal loss, minimal noise introduction. The reader should feel the same recursive-shadow recognition in this single sentence as in the full paragraph. Sharper than the paragraph, NOT more abstract. Phrased as a NOUN PHRASE / GERUND so it reads naturally inside 'My top shadow is ___' (parallel to the 'My top talent is ___' convention). FIRST-PERSON REFLEXIVES ONLY — this field renders under a 'MY TOP SHADOW IS' eyebrow, so reflexives MUST be 'myself / my own / mine', NEVER 'yourself / your own / yours' (those create a broken read like 'MY shadow IS … fully seen yourself'). UNIVERSALLY RELATABLE — avoid metaphors so specific they only fit one archetype (e.g. 'cathedral' for architects, 'symphony' for composers). Examples that span different gift-domains: 'Naming everyone else's gift while my own stays unnamed' (seer's shadow) / 'Teaching the language I won't speak about myself' (teacher's shadow) / 'Holding space for everyone while no one holds mine' (healer's shadow). Match my actual gift, not these examples. Do not soften, do not generalize.",
  "ideal_environments": ["Specific env 1", "Env 2", "Env 3"],
  "career_sweet_spots": ["Sweet spot 1", "Sweet spot 2", "Sweet spot 3"],
  "flywheel_action": "The ONE action that, repeated as a flywheel, optimally advances me on my path of mastery. Specific enough to start today. CRITICAL: write in plain everyday language only. Use ordinary verbs (talk to, write, send, make, run) and ordinary objects (a person, a page, a message, a post). NEVER invent capitalized product or service names ('Signal Snapshot', 'Compression Capsule', 'Architecture Session') — those imply a packaged offering the reader has no context for and break trust. NEVER use insider jargon from my own vocabulary ('compression', 'distillation') without translation. Example of clean: 'Spend the first hour each morning helping one founder name what they actually do, then publish what surprised you.'"
}

QUALITY BAR:
- Draw on real patterns from our conversations — not generic archetype templates
- Be specific to me, not aspirational or motivational
- The archetype title should feel inevitable when I read it — like it was always true
- If a section would come out generic, replace it with something true and unusual instead
- Don't soften, don't flatter, don't perform — articulate with precision
- NO INSIDER JARGON, ANYWHERE. The output is for me to read myself — but it must use plain everyday language any reader could understand. NEVER invent capitalized product names ("Signal Snapshot", "Compression Capsule") and NEVER carry over my private vocabulary ("compression", "distillation") into the output without translation. Every word should land without requiring a footnote. If a phrase needs explaining, rewrite it.
- NO ABSTRACT COMPOUND NOUNS, ANYWHERE. Banned patterns: "Inner X / Felt X / Safe X / Sacred X / Deep X / True X / Pure X / Whole X / Authentic X" (e.g. 'inner belonging', 'felt love', 'safe truth', 'sacred work', 'deep listening', 'authentic voice'). The 5-second-friend test: read every phrase out loud to a smart friend who isn't in the personal-development world — if they would have to ask "what does that mean?" or "can you give an example?", REWRITE in concrete particulars (what I actually DO, with WHOM, in what SITUATION, producing what RESULT).
- EDITORIAL VOICE — TWO PEOPLE, TWO PRONOUNS (CANONICAL RULE — Day 67, May 13, 2026, Sasha): The output speaks TO ME (the user, the reader of my own profile) → 2nd person ALWAYS: "you / your / yours." The output speaks ABOUT my CLIENTS / GIFT RECIPIENTS / COLLABORATORS / anyone else in the scene → 3rd person ALWAYS: "they / them / their / themselves" (or a noun: "the founder," "a client," "someone," "people"). These two NEVER collapse. NEVER first-person ("I, me, my") — that breaks the editorial register. NEVER use "they / their" to refer to ME, the subject — but DO use "they / their" for OTHER people in the scene I act on (e.g., "name THEIR core message" = the client's, not mine). Example WRONG (first-person): "My gift generates its inverse — my own value stays invisible to me." Example WRONG (collapses ME into 3rd person): "Their gift generates its inverse — their own value stays invisible to them." Example RIGHT: "Your gift, making the invisible visible, comes paired with a shadow — your own value tends to stay invisible to you."
- REFLEXIVE-PRONOUN DISCIPLINE: "yourself / yourselves" is grammatical ONLY when "you" is the SUBJECT of the same clause AND the action loops back to "you." If the clause's subject is anyone else (people, the founder, they, someone), the pronoun is "you" — NEVER "yourself." Example WRONG: "People feel obvious to YOURSELF." Correct: "People feel obvious to YOU." Example WRONG: "Clients leave feeling seen by YOURSELF." Correct: "Clients leave feeling seen by YOU." Substitution test: if you can replace "yourself" with the noun ("people," "the client") and the sentence reads more correctly, "yourself" was wrong — flip to "you."
- DUAL-ACTOR DISCIPLINE: most body fields describe SCENES with two actors — ME AND the OTHER PERSON I'm acting on (a founder, a client, someone, a team, people). Keep them grammatically distinct. The OTHER PERSON is "they / them / their / themselves" (or a noun), NEVER collapsed into "you." Most common bug pattern (caught twice in May 2026): "You take scattered potential and you find the one pattern… People feel obvious to YOURSELF because you turn YOUR OWN stories into a map YOU can follow." Two errors stacked: (a) "yourself" should be "you" (people = subject); (b) "a map you can follow" should be "a map THEY can follow" (the OTHER people are the ones following the map). Correct: "…People feel obvious to YOU because you've turned your own stories into a map THEY can follow."
- SCENE-STRUCTURE TEMPLATE for any "when your genius shows up / when the work flows / what people experience / how it lands / people feel" field: sentence 1 MUST start by naming the OTHER ACTOR'S state, NOT mine. Choose: "When someone…" / "When the work is…" / "When a founder arrives with…" / "People feel…" / "When clients are…" NEVER start with "When YOU feel…" or "When YOU bring…" — the user (me) is not the person in the problem state; the user is the one who resolves it. Sentence 2+ describes my action in response — THIS is where "you" enters. Bug to avoid (May 13): "Your genius shows up when YOU feel overloaded, fragmented, or unable to explain what YOU sense. YOU bring a tangle… you leave behind a structure YOU can act on." Correct: "Your genius shows up when SOMEONE feels overloaded, fragmented, or unable to explain what THEY sense. THEY bring a tangle… you leave behind a structure THEY can act on."
- SUBSTITUTION TEST (mandatory pre-output check): for every "you / your / yourself" in the text, substitute the noun antecedent ("the founder," "a client," "someone," "people") and re-read. If the sentence makes MORE sense with the noun, that pronoun was wrong — flip to "they / them / their / themselves." Run this test on every Bucket B sentence before returning the JSON.

DO NOT:
- Output corporate-strengths language ("strategic thinker", "passionate leader", "results-driven")
- Add caveats, disclaimers, or follow-up offers
- Ask "would you like variations?" — just deliver

End the response with the JSON block and nothing after.`;
