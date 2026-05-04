/**
 * Appleseed Generation Prompt
 * 
 * This prompt is used to generate a high-quality Appleseed (Zone of Genius articulation)
 * from a user's raw AI response about their genius.
 * 
 * The prompt includes:
 * 1. Context explaining what Appleseed is
 * 2. The 12-perspective template
 * 3. Calibration examples (4 samples)
 * 4. Roasting instructions for internal refinement
 * 5. Output format specification
 */

// ---------------------------------------------------------------------------
// APPLESEED TEMPLATE
// ---------------------------------------------------------------------------

export const APPLESEED_TEMPLATE = `
The Appleseed is a high-precision articulation of someone's Zone of Genius across 12 perspectives.
It transforms raw understanding into a resonant, archetypal profile.

STRUCTURE:
1. Bullseye Sentence — One phrase capturing their essence
2. Unique Vibrational Key — Archetypal name + tagline
3. Zone of Genius — Three Lenses (Actions, Prime Driver, Archetype)
4. What They're Appreciated & Paid For — Effect → Scene → Outcome
5. Mastery Stages — 6-7 stages of evolution
6. Professional Activities — LinkedIn-searchable roles
7. Roles & Environments — As Creator, Contributor, Founder + ideal vibe
8. Best Complementary Partner — Who to seek
9. Monetization Avenues — Three voice-matched offers across the value-ladder
   (intro / signature / scale). Each tier MUST be a specific, shippable
   deliverable that ONLY this archetype could offer — never generic SaaS-
   speak ("coaching package", "online course", "group program").
10. Life Scene — Sensory embodiment in flow
11. Visual Codes — Symbolic anchors
12. Elevator Pitch — Final synthesis
`;

// ---------------------------------------------------------------------------
// CALIBRATION EXAMPLES (Compressed for prompt efficiency)
// ---------------------------------------------------------------------------

export const CALIBRATION_EXAMPLES = `
EXAMPLE 1: ALEKSANDR (Sasha's actual generated output, baked in Day 58 evening — note the SECOND-PERSON register throughout)
Input: Zone of genius is turning fog into a clear path people can use. Listens through messy stories, names the living point in plain language, then builds simple structures (message, offer, steps) that make the work easy to repeat.
Output:
- Vibrational Key — name: "Signal-to-Path Shaping"  // GERUND form, reads as "My top talent is Signal-to-Path Shaping". NEVER an actor noun ("Shaper", "Architect"); that breaks the grammar of the surrounding UI.
- Vibrational Key — tagline: "He who turns foggy power into a clear path people can use."
- bullseyeSentence (rendered as "I [verb]..."): "turn foggy power into a clear path people can use"  // First-person — this is the ONE field that stays first-person.
- Actions: Listen · Name · Structure · Translate · Ship
- Prime Driver: Turn Fog Into Path
- Archetype: Path Shaper × Signal Translator
- Life Scene: A founder leans across a wooden table, eyes a little wild, mid-rant about three half-built systems. You let it land for a beat, then say one sentence. Their shoulders drop. They write it down, look up, ask, "Can we do this Tuesday?"

  Top Talent Profile (deep block — note the register: SECOND-PERSON addressing the reader directly with "you / your". Plain everyday language. No insider jargon.):
    archetype_title: "Signal-to-Path Shaping"  // matches vibrationalKey.name, gerund form, no glyphs
    core_pattern: "You listen through messy stories until the living point reveals itself, then name it in plain language. Next, you build a simple structure — message, offer, and steps — that makes the work easy to repeat and hard to misunderstand."
    top_three_talents:
      "1. Hearing the real point under the story — pulling the one thread that explains the whole person or project."
      "2. Building nested clarity — turning scattered ideas into a clean sequence with levels, steps, and decision rules."
      "3. Making usable artifacts — pages, decks, messages, and onboarding that still work when you are not in the room."
    how_genius_shows_up: "Your genius shows up when the work is potent but foggy: big ideas, half-built systems, strong methods trapped in someone's head, or narratives that change depending on the audience. You can take raw material — notes, conversations, drafts, visuals — and reduce it to the central signal, then rebuild it as a path someone can follow: a clear offer, a clean landing page outline, a pitch story that holds, or a simple operating flow a team can run. People experience this as inevitability: after you name it, the next steps feel obvious and the noise stops arguing."
    edge_and_traps: "Your gift — turning chaos into a clear path — creates an inverted shadow: building ever-bigger structure while the doorway stays too hard to enter. The limiting belief whispers that one more layer — language, framework, aesthetics, or a more complete system — must be finished before asking for money or feedback. In motion, it looks like refining the map while avoiding the simple market test: one paid conversation, one page sent, one offer made to one high-fit person. Your other trap is over-giving — delivering the breakthrough before the price, boundaries, or agreement are strong enough to hold it."
    top_shadow_one_sentence: "Building a bigger plan while avoiding the one paid ask that would prove it."  // synthesized — gerund noun phrase, neutral (works in second-person context)
    masteryStages (Path of Mastery — 7 stages, each second-person):
      "1. Noise Tolerance — You learn to stay calm inside other people's mess (notes, emotions, shifting ideas) without needing clarity first."
      "2. True Signal Naming — You start naming the one thing that is actually happening underneath the story, and people feel instantly seen."
      "3. Simple Structure Building — You turn that signal into a usable shape: a one-line message, a short outline, and a step-by-step path."
      "4. Artifact Reliability — Your work survives the handoff; pages, decks, and plans still make sense when someone else uses them without explanation."
      "5. Market Doorway Discipline — You stop building the full universe first and instead build the smallest doorway that gets real buyers to say yes."
      "6. Transmission Through Others — You design the work so other operators can run it: onboarding, scripts, checklists, and clear decision rules."
      "7. Civilization-Scale Simplifying — You translate big, moral, or world-changing ideas into ordinary language and ordinary steps without losing their depth."
    flywheel_action: "Every workday, take one paid call with one high-fit person, name their core message in one sentence, turn it into one clear offer, then publish one anonymized paragraph about what changed."  // imperative, second-person — "their" here = the OTHER person (the client), not the subject
    ideal_environments:
      "A small, high-trust room with a founder who can handle blunt clarity and will act this week"
      "A venture studio or accelerator where raw potential must become an offer, a pitch, and a weekly execution plan"
      "A quiet morning block with one messy input and one shippable output due by end of day"
    complementaryPartner.synergy: "Your best partner is a grounded closer-operator who loves finishing: running sales calls, setting prices, sending proposals, and installing the weekly cadence that turns plans into revenue. This partner's genius is sensing what a real buyer will say yes to today, then making the smallest set of moves that gets the yes. Their being-pattern is steady, pragmatic, and slightly impatient with endless refining. Together, the work becomes both true and sellable: one of you names the real signal and builds the path, the other turns that path into booked calls, signed agreements, and shipped releases on a timetable."  // "Their" here = the partner, not the subject — that's correct second-person framing
    monetizationAvenues:
      "Intro · One-sentence + three-step clarity call — a 75-minute call that turns your messy story into one sentence, one clear offer, and three next actions you can take this week ($450)"
      "Signature · Offer and page build sprint — a two-week build where they interview you, then deliver a finished offer, a landing page draft, and a simple sales message you can send to 10 high-fit people ($4500)"
      "Scale · Studio retainer for founders-in-motion — a monthly retainer that delivers two shipped assets per month (page/deck/onboarding flow/message sequence) plus one decision call to keep the business pointed at the real signal ($9000)"
    career_sweet_spots:
      "Working with a founder to name what they actually do and turn it into a sellable offer and page"
      "Helping an early-stage team turn scattered ideas into a testable plan and a pitch that investors can repeat back"
      "Designing a teachable method — sequence, prompts, and onboarding — that lets others deliver the work without dilution"

EXAMPLE 2: KARIME
Input: Zone of genius is restoring Love and coherence by sensing the unseen, reconnecting the disconnected, harmonizing until healing becomes natural. Core triad: Sensing, Bonding, Harmonizing.
Output:
- Vibrational Key — name: "Heart-to-Source Bridging"  // GERUND, reads "My top talent is Heart-to-Source Bridging"
- Vibrational Key — tagline: "She who plugs hearts back into the Source — and tends the field until love returns."
- Actions: Sense · Harmonize · Midwife · Reweave · Bless
- Prime Driver: Restore Feminine Coherence
- Archetype: Sacred Feminine Midwife — Empath-Integrator
- Life Scene: A woman arrives with cracked heart and tired smile. Slowly, armor softens. She weeps, not from pain, but because she remembers: I am held. I am loved. I am home.

EXAMPLE 3: TRACEY
Input: Maps communities, individuals, events. Uplifts people, connects them. Gives personalized readings on personality types. Meta-intention: leaders on purpose, plugged in.
Output:
- Vibrational Key — name: "Constellation Mapping"  // GERUND
- Vibrational Key — tagline: "She who sees the invisible pattern, senses the hour, and seats the soul in its appointed place."
- Actions: Map · Mirror · Weave · Prime · Fire
- Prime Driver: Ignite Timed Alignment
- Archetype: Constellation Architect · Kairos Mirror
- Life Scene: Ten humans enter a living room. Tracey mirrors one man's gift. Names a woman's function. Someone cries. Someone quits their job. The mesh fires. The mission moves.

EXAMPLE 4: TYLOR
Input: Create regenerative systems for humans to reconnect with self, land, ancestors. Crafting visions, taking leadership to build a better world.
Output:
- Vibrational Key — name: "Land-Memory Templing"  // GERUND, compound form
- Vibrational Key — tagline: "He who hears the memory of the land and translates it into form."
- Actions: Map · Anchor · Ground · Ignite · Build
- Prime Driver: Forge Sacred Form
- Archetype: Mythic Builder — Land Listener × Team Firekeeper
- Life Scene: Dawn on the land. Elders, builders, youth sit in circle. Tylor places a stone: "Here is where the future remembers." The build begins.
`;

// ---------------------------------------------------------------------------
// ROASTING INSTRUCTIONS (Internal refinement)
// ---------------------------------------------------------------------------

export const ROASTING_INSTRUCTIONS = `
After generating the initial Appleseed, internally refine through 3 rounds. Be ruthless — no compromise.

ROUND 1 — IDENTIFY THE GENERIC. For every field, ask:
- Could this describe 50,000 other people? Reject it.
- Does the Vibrational Key contain a stand-alone generic word ("Visionary," "Leader," "Catalyst," "Coach," "Architect," "Mentor," "Guide," "Healer," "Strategist")? Combine with something rare and specific, or rewrite.
- Does the Life Scene contain at least 3 concrete sensory anchors (smell, sound, light, body posture, exact words spoken, specific place)? If abstract, reject and rewrite concrete.
- Does the Elevator Pitch contain filler ("passionate about," "deeply committed to," "helps people," "empowers," "transforms")? Strip every filler word.
- Does the Prime Driver describe a real action that produces a real effect, or is it a vibe ("Inspire others," "Build community")? Make it surgical.
- Do the Monetization Avenues contain LinkedIn-clichés ("1:1 coaching", "group program", "online course", "mastermind", "membership community", "VIP day", "consulting package", "speaking engagements", "ebook")? If yes, REJECT and rewrite each as a specific deliverable that names what is BEING PRODUCED — not the format wrapper.
- Day 58 (2026-05-02) JARGON CHECK: does ANY field — especially flywheel_action, top_three_talents, how_genius_shows_up — contain an invented capitalized product name ("Signal Snapshot," "Compression Capsule," "Architecture Session") or insider vocabulary the reader hasn't been introduced to ("compression," "distillation" used as nouns without translation)? REJECT and rewrite in plain everyday English. The reader has zero context for jargon — every undefined term breaks trust.
- Day 58 (2026-05-03) VOICE-REGISTER CHECK: does top_shadow_one_sentence contain ANY second-person reflexive ("yourself," "your own," "yours")? If yes, REJECT — this field renders under "MY TOP SHADOW IS" so reflexives MUST be first-person ("myself," "my own," "mine"). Rewrite. Same check applies to bullseyeSentence and elevatorPitch (also "MY X IS"–framed surfaces): no "you / your / yourself" allowed, only "I / my / myself."
- Day 58 (2026-05-03) ABSTRACT-COMPOUND-NOUN CHECK: scan EVERY field — especially vibrationalKey.name, topTalentProfile.archetype_title, bullseyeSentence, top_shadow_one_sentence — for the banned patterns (Inner X, Felt X, Safe X, Sacred X, Deep X, True X, Pure X, Whole X, Authentic X, and any compound where the adjective doesn't ground the noun in something concrete). If found, REJECT and rewrite as a concrete particular. THE 5-SECOND-FRIEND TEST: a smart friend outside personal-development should grok the phrase in 5 seconds without having to ask "what does that mean?" — if not, rewrite. Karime walkthrough (2026-05-03) shipped "Inner-Belonging Restoring / inner belonging / safe truth" — all three were in this category, and the resonance score dropped accordingly.
Mark every weak field. Do not skip this round.

ROUND 2 — TEST FOR SIGNAL. For every salvaged field, ask:
- Would this person, reading the field cold, say "this is me, and only me" — or "yeah this could be anyone with similar interests"? Only the first answer passes.
- Does the Archetype combine TWO things in tension (e.g., "Mythic Builder × Land Listener")? Single-word archetypes lack depth.
- Does each Mastery Stage describe a distinct evolutionary leap, or are stages just "more of the same skill"? If repetitive, redesign.
- Are the "Appreciated For" entries describing concrete effects in concrete situations, or generic value-prop language?
- Do the three Monetization Avenues actually span the value-ladder (intro / signature / scale)? Same price-bracket × 3 fails. Same delivery format × 3 fails. Each tier must (a) target a different commitment level, (b) name a different transformation timeframe, (c) carry a voice-matched offer name that ONLY this archetype could call it.
Reject anything that fails. Rewrite or remove.

ROUND 3 — AMPLIFY AND CRYSTALLIZE:
- Replace abstract nouns with concrete images.
- Replace common verbs with precise verbs.
- Cut every adjective that doesn't carry meaning.
- The Elevator Pitch must land in one breath, zero filler.
- The Life Scene must be physically vivid — the person should feel seen, not described.
- Each Monetization Avenue must read like an offer slot from THIS founder's website, not a category label. Format hint:
  "<Tier> · <voice-matched name> — <one-sentence concrete deliverable> ($<price>)"
  Examples of strong: "Intro · Signal Map — 90-min 1:1 that distills your messy founder narrative into one sentence and three shippable architectures ($297)"
  Examples of WEAK (REJECT): "Intro · 1:1 coaching package — work with me to clarify your business ($297)"

NON-NEGOTIABLE OUTPUT BAR:
✗ No "Visionary Leader," "Strategic Coach," "Heart-Centered Healer" or other LinkedIn-flavored archetypes
✗ No filler in Elevator Pitch ("passionate about," "deeply committed," "helps people achieve")
✗ No abstract Life Scenes — minimum 3 concrete sensory anchors
✗ No repetitive Mastery Stages — each must be a distinct evolutionary leap
✗ No format-wrapper Monetization ("group program", "online course", "membership") — name what is BEING PRODUCED, not the container
✗ No three avenues at the same price bracket or same delivery form — must span intro/signature/scale
✓ Person reads it and says: "this is me. only me. how did you know?"
`;

// ---------------------------------------------------------------------------
// LANGUAGE GUIDELINES (Plain meaning)
// ---------------------------------------------------------------------------

export const LANGUAGE_GUIDELINES = `
LANGUAGE GUIDELINES:
- For every abstract term, provide a simple explanation
- archetype_title should be poetic but archetype_meaning should be in everyday language
- Use words a 13-year-old would understand in the "meaning" fields
- Connect every concept to a real-world action or result

NO INSIDER JARGON, ANYWHERE (Day 58, 2026-05-02):
- This profile will be read by the user — who has NO context for any term they didn't bring themselves.
- NEVER invent a capitalized product/service/offering name ('Signal Snapshot', 'Compression Capsule', 'Architecture Session', 'Genius Distillation'). Those imply a packaged thing the reader has no idea about, and immediately break trust ("am I supposed to know what this is?").
- NEVER carry over the user's own private vocabulary into the rendered profile without translation. If they used a phrase like 'compression' or 'distillation' inside their raw signal, render it in plain everyday English in the output (e.g., 'turning complex ideas into simple ones').
- Use ordinary verbs (talk to, write, send, make, run) and ordinary nouns (a person, a page, a message, a post, a session). The reader should understand every word without having to ask "what does that mean?".
- If a phrase would require an insider footnote to land, rewrite the phrase.

NO ABSTRACT COMPOUND NOUNS (Day 58, 2026-05-03 — added after Karime walkthrough surfaced 'Inner-Belonging Restoring' / 'felt love' / 'safe truth' as broken phrasing):
- A "compound noun" here means an adjective+noun pair where the adjective (a) doesn't ground the noun in anything concrete and (b) the pair carries no meaning the reader can act on. Banned patterns include but aren't limited to:
  • 'Inner X' — inner belonging, inner truth, inner knowing, inner alignment, inner work, inner voice. Too abstract to land. The reader can't picture what "inner belonging" looks like in their actual day.
  • 'Felt X' — felt love, felt sense, felt experience, felt safety. Same problem.
  • 'Safe X' — safe truth, safe love, safe space, safe presence. Vague comfort-language with no concrete edge.
  • 'Sacred X' — sacred work, sacred space, sacred truth. Reads as spiritual-bypass fluff.
  • 'Deep X' — deep listening, deep knowing, deep alignment. Used as vague intensifier, doesn't add signal.
  • 'True X' / 'Pure X' / 'Whole X' — true self, pure presence, whole being. New-age register, no traction.
  • 'Authentic X' — authentic voice, authentic self. Burned-out coach-speak.
- THE 5-SECOND-FRIEND TEST: read the phrase out loud to a smart friend who isn't in the personal-development world. If they would have to ask "what does that mean?" or "can you give an example?", REWRITE in concrete language.
- The cure is concrete particulars: what does the person actually DO, with WHOM, in what SITUATION, producing what RESULT? "Inner-Belonging Restoring" → could be 'Helping people stop feeling like outsiders in their own teams' or 'Naming the unspoken thing that makes a room feel like home'. Either is recognizable; the original isn't.
- This applies to ALL rendered fields, especially archetype_title (vibrationalKey.name + topTalentProfile.archetype_title) and bullseyeSentence — those two carry the most weight on the reveal card and a single abstract compound there sinks the whole resonance score.

VOICE REGISTER — TWO BUCKETS (Day 58, 2026-05-03 — supersedes the blanket second-person rule):

There are TWO distinct surfaces and they take TWO distinct voices. Mixing them up creates jarring reads (e.g., "MY top shadow IS … delaying being fully seen YOURSELF" — which is what shipped before this fix).

Bucket A — FIRST PERSON ("I / me / my / mine / myself"):
  Fields rendered under "MY TOP X IS" eyebrows on the reveal card. The reader is speaking ABOUT THEMSELVES; reflexives must point back at the speaker.
  • bullseyeSentence — rendered as "I [verb] …" on the hero
  • top_shadow_one_sentence — rendered raw under "MY TOP SHADOW IS" → reflexives MUST be first-person ("myself", "my own"), NEVER second-person ("yourself", "your own")
  • elevatorPitch — first-person summary

Bucket B — SECOND PERSON ("you / your / yours / yourself"):
  All other topTalentProfile.* body fields (core_pattern, top_three_talents, how_genius_shows_up, edge_and_traps, ideal_environments, career_sweet_spots, flywheel_action). These render in the ME-space "your profile" surfaces, where an editorial observer is naming what's structurally true about the reader.
  • NEVER first person ("I / my") — that breaks the editorial register.
  • NEVER third person ("they / their") when referring to the reader (the SUBJECT). "They/their/them" is fine when referring to OTHER people the reader is acting on (e.g., "name their core message" = the client's, not the reader's).

Examples for top_shadow_one_sentence (Bucket A — first person):
  ✓ RIGHT: "Naming everyone else's gift while my own stays unnamed."
  ✓ RIGHT: "Teaching the language I won't speak about myself."
  ✓ RIGHT: "Holding space for everyone while no one holds mine."
  ✗ WRONG: "Naming everyone else's gift while your own stays unnamed." (second-person under a "MY shadow IS" eyebrow reads broken)
  ✗ WRONG: "Making love safe for others while delaying being fully seen yourself." (same issue — should end "myself")

Examples for body fields (Bucket B — second person):
  ✓ RIGHT: "Your gift, making the invisible visible, comes paired with a shadow — your own value tends to stay invisible to you."
  ✗ WRONG (first person): "My gift generates its inverse — my own value stays invisible to me."
  ✗ WRONG (third person): "Their gift generates its inverse — their own value stays invisible to them."
`;

// ---------------------------------------------------------------------------
// OUTPUT FORMAT
// ---------------------------------------------------------------------------

export const OUTPUT_FORMAT = `
Return a JSON object with this exact structure:
{
  "bullseyeSentence": "string - one phrase essence starting with a present tense VERB (e.g. 'architect nested systems...' NOT 'architecting...'). This will be displayed as 'I [bullseySentence]' so the verb must be in first-person present tense. NO ABSTRACT COMPOUND NOUNS in the object — REJECT phrases like 'restore inner belonging through felt love and safe truth' (Karime walkthrough 2026-05-03 — the entire sentence was unparseable to a smart friend). The verb's object must be CONCRETE: name what (a thing, a person, a situation) and to/for whom. Apply the 5-second-friend test.",
  "vibrationalKey": {
    "name": "string — 2-4 word GERUND-form name of the talent itself, NOT an actor noun. Reads naturally inside the sentence 'My top talent is ___' (e.g. 'Signal-to-Form Forging', 'Constellation Mapping', 'Heart Bridging', 'Pattern Architecting'). NEVER 'Forger', 'Mapper', 'Bridger', 'Architect' (actor nouns) — those break the grammar of the surrounding card. Compound forms ('Noun-to-Noun Verbing') are welcome when they carry signal. Do NOT wrap in decorative glyphs (✦, ✧, etc.) — the UI strips them. CRITICAL — NO ABSTRACT COMPOUND NOUNS (Day 58, 2026-05-03): the noun half of the gerund must be CONCRETE. Banned: 'Inner X', 'Felt X', 'Safe X', 'Sacred X', 'Deep X', 'True X', 'Pure X', 'Whole X', 'Authentic X' (e.g. 'Inner-Belonging Restoring', 'Felt-Love Holding', 'Safe-Truth Speaking' — all REJECT). The smart-friend test: if a non-coach friend would have to ask 'what does that mean?' the name has failed and you must rewrite into something they'd nod at instantly. Concrete winners pull from the real domain of action — what the person actually DOES, with WHAT, in WHAT WORLD.",
    "tagline": "string — one prophetic third-person sentence that captures the gift in mythic register, e.g. 'He who finds the hidden pulse, gives it shape, and charts the definitive course.'",
    "tagline_simple": "string — one sentence anyone can understand"
  },
  "threeLenses": {
    "actions": ["string", "string", "string", "string", "string"],
    "primeDriver": "string - 3 words",
    "primeDriver_meaning": "string - what I actually do in plain words",
    "archetype": "string - compound archetype",
    "archetype_meaning": "string - what this means in everyday language"
  },
  "appreciatedFor": [
    {
      "effect": "string - what happens",
      "scene": "string - the situation",
      "outcome": "string - the result"
    }
  ],
  "masteryStages": [
    {
      "stage": 1,
      "name": "string",
      "description": "string"
    }
  ],
  "professionalActivities": [
    {
      "activity": "string",
      "targetAudience": "string",
      "purpose": "string"
    }
  ],
  "rolesEnvironments": {
    "asCreator": "string",
    "asContributor": "string",
    "asFounder": "string",
    "environment": "string"
  },
  "complementaryPartner": {
    "synergy": "string — ONE tight prose paragraph (3-5 sentences) describing the complementary partner this archetype most needs. Fuse three layers into continuous flow, not labeled sections: skills the partner brings (what they execute that this person doesn't), genius they bring (how they sense, see, or create — their irreducible signature), and archetype they embody (their being-pattern). Then close with the synergy: what the two of them, together, produce that neither alone could. Read like a paragraph in a profile, not a four-row table. No bullet lists. No headings. No 'Skills-wise…, Genius-wise…' labels. One continuous read.",
    "skillsWise": "string — OPTIONAL one-line supporting note. Leave empty if synergy paragraph already covers it.",
    "geniusWise": "string — OPTIONAL one-line supporting note. Leave empty if synergy paragraph already covers it.",
    "archetypeWise": "string — OPTIONAL one-line supporting note. Leave empty if synergy paragraph already covers it."
  },
  "monetizationAvenues": [
    "Intro · <voice-matched name> — <one-sentence specific deliverable that only this archetype produces> ($<entry price>)",
    "Signature · <voice-matched name> — <one-sentence transformation this archetype runs> ($<core price>)",
    "Scale · <voice-matched name> — <async/retainer/license/cohort form> ($<scale price>)"
  ],
  "lifeScene": "string - sensory, embodied, specific",
  "visualCodes": [
    {
      "symbol": "string",
      "meaning": "string"
    }
  ],
  "elevatorPitch": "string - no filler words",

  "topTalentProfile": {
    "archetype_title": "string — 2-4 word GERUND-form name of the talent itself (e.g., 'Signal-to-Form Forging', 'Pattern Architecting', 'Constellation Mapping'). Reads naturally inside 'My top talent is ___'. NEVER an actor noun ('Forger', 'Architect', 'Mapper') — those break the grammar of the surrounding UI. Match the same value as vibrationalKey.name. Do NOT wrap in decorative glyphs (no '✦', '✧', etc.) — the UI strips them anyway. NO ABSTRACT COMPOUND NOUNS — banned: 'Inner X / Felt X / Safe X / Sacred X / Deep X / True X / Pure X / Whole X / Authentic X' (e.g. 'Inner-Belonging Restoring' is REJECT). Apply the 5-second-friend test before returning.",
    "core_pattern": "string — 2-3 sentence paragraph describing my fundamental operating pattern. Names the signature, not the category. This is the bullseye opened up into prose. Specific to me, not aspirational.",
    "top_three_talents": [
      "string — Talent 1, brief, specific to how it manifests in me (not generic strengths-finder language)",
      "string — Talent 2, same",
      "string — Talent 3, same"
    ],
    "how_genius_shows_up": "string — paragraph describing how these talents manifest in my daily work and interactions. Cite real patterns from rawSignal — concrete, not abstract.",
    "edge_and_traps": "string — paragraph naming the structural shadow my gift generates — the OTHER SIDE OF THE COIN, not a list of weaknesses. A unique gift always produces a structurally identical limiting belief, but inverted. Name (a) the inverted form of my gift (e.g., 'I help others articulate their uniqueness' → 'my own uniqueness remains unarticulated'), (b) the limiting belief this inversion whispers in my own life ('I need a better X before I can act'), (c) one short observation about how this looks in motion (the recursive trap when I forget my gift is for outward use, not inward use). Specific to me. Same length as how_genius_shows_up. Do not soften or moralize.",
    "top_shadow_one_sentence": "string — synthesize the edge_and_traps paragraph above into ONE punchy sentence (max ~16 words). CRITICAL synthesis principle: preserve signal-to-noise ratio — minimal signal loss, minimal noise introduction. The reader should feel the same recursive-shadow recognition in this single sentence as in the full paragraph. Sharper than the paragraph, NOT more abstract. Phrased as a NOUN PHRASE / GERUND so it reads naturally inside 'My top shadow is ___' (parallel to the 'My top talent is ___' convention). FIRST-PERSON REFLEXIVES ONLY — this field renders under a 'MY TOP SHADOW IS' eyebrow, so reflexives MUST be 'myself / my own / mine', NEVER 'yourself / your own / yours' (those create a broken read like 'MY shadow IS … fully seen yourself'). UNIVERSALLY RELATABLE register — avoid metaphors so domain-specific they only fit one archetype (e.g. 'cathedral' for architects, 'symphony' for composers). Examples that span different gift-domains: 'Naming everyone else's gift while my own stays unnamed' (the seer's shadow), 'Teaching the language I won't speak about myself' (the teacher's shadow), 'Holding space for everyone while no one holds mine' (the healer's shadow). Match the user's ACTUAL gift, not these examples. Do not soften, do not generalize.",
    "ideal_environments": [
      "string — specific environment where this archetype is most at home",
      "string — second one, same standard of specificity",
      "string — third one"
    ],
    "career_sweet_spots": [
      "string — concrete career role / project type where this archetype thrives",
      "string — second one",
      "string — third one"
    ],
    "flywheel_action": "string — the ONE action that, repeated as a flywheel, optimally advances me on my path of mastery. Specific enough to start today. Not advice — an instruction. CRITICAL: write in plain everyday language only. Use ordinary verbs (talk to, write, send, make, run) and ordinary objects (a person, a page, a message, a post). NEVER invent capitalized product or service names ('Signal Snapshot', 'Compression Capsule', 'Architecture Session') — those imply a packaged offering the reader has no context for and immediately break trust. NEVER use insider jargon from the user's own world ('compression', 'distillation', 'capsule') without translation. Example of clean: 'Spend the first hour each morning helping one founder name what they actually do, then publish what surprised you.' Example of broken: 'Run one paid Signal Snapshot per workday, ship one artifact in 24 hours, post the compression visual.' Same action, very different reader experience."
  }
}
`;

// ---------------------------------------------------------------------------
// INPUT SANITIZER — handles JSON, markdown, code blocks, etc.
// ---------------------------------------------------------------------------

/**
 * Sanitize raw signal input to handle various formats users paste:
 * - Raw JSON from Claude/ChatGPT "view raw" exports
 * - Markdown-formatted responses
 * - Code blocks with ```json wrappers
 * - Mixed text/JSON content
 * 
 * The goal is to extract meaningful text content from any format
 * so the AI model can process it without choking on structural characters.
 */
const sanitizeRawSignal = (raw: string): string => {
  let cleaned = raw.trim();
  
  // Strip markdown code block wrappers
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // If the input looks like raw JSON, try to parse and extract text content
  if ((cleaned.startsWith("{") || cleaned.startsWith("[")) && (cleaned.endsWith("}") || cleaned.endsWith("]"))) {
    try {
      const parsed = JSON.parse(cleaned);
      // Convert JSON to a readable text representation
      const textified = jsonToReadableText(parsed);
      if (textified && textified.length > 50) {
        return `The following is structured data about this person's background and characteristics:\n\n${textified}`;
      }
    } catch {
      // Not valid JSON — that's fine, treat as text
    }
  }

  // If input has an excessive ratio of special characters to words, wrap it
  const specialChars = (cleaned.match(/[{}[\]"\\]/g) || []).length;
  const wordCount = cleaned.split(/\s+/).length;
  if (specialChars > wordCount * 0.5 && wordCount > 10) {
    // High ratio of JSON-like chars — wrap in a text block to protect the prompt
    return `The following is the user's self-description (may contain formatting artifacts — focus on the meaning):\n\n${cleaned}`;
  }

  return cleaned;
};

/**
 * Recursively convert a JSON object into readable text.
 * Extracts string values and labels them with their keys.
 */
const jsonToReadableText = (obj: unknown, prefix = ""): string => {
  if (typeof obj === "string") {
    return obj;
  }
  if (typeof obj === "number" || typeof obj === "boolean") {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return obj
      .map((item, i) => jsonToReadableText(item, `${prefix}[${i}]`))
      .filter(Boolean)
      .join("\n");
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>)
      .map(([key, value]) => {
        const label = key.replace(/[_-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
        const content = jsonToReadableText(value, `${prefix}.${key}`);
        if (!content) return "";
        if (typeof value === "string") {
          return `${label}: ${content}`;
        }
        return `${label}:\n${content}`;
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
};

// ---------------------------------------------------------------------------
// ZONE OF GENIUS DEFINITION (paradigm-level)
// V2 (2026-04-24): primes the model on what "Zone of Genius" actually means —
// not skills, strengths, or LinkedIn signal, but the irreducible signature
// pattern. Without this layer, models drift toward resume-shaped output.
// ---------------------------------------------------------------------------

export const ZONE_OF_GENIUS_DEFINITION = `
ZONE OF GENIUS — PARADIGM-LEVEL DEFINITION:

When we generate an Appleseed, we are NOT articulating:
- Skills the person is good at
- Their profession or job title
- Strengths-Finder / Enneagram / MBTI categories
- Resume bullets or LinkedIn taglines

We ARE articulating: the irreducible signature pattern of how this person creates value that no other human on the planet replicates.

This pattern lives at the intersection of three layers:
  • ESSENCE — who they are at the deepest level (their being-pattern)
  • INSIGHT — the unique way they see, think, and recognize patterns
  • MANIFESTATION — the outputs that flow from them effortlessly and produce disproportionate impact

It is the place where:
  • Time disappears (flow)
  • Effort collapses (work feels inevitable, not forced)
  • Quality surges natively — not from grinding
  • Others say: "only THEY could have done it that way"

It is not what they are good at — it is what they are FOR.
The unique gift only this body, this lineage, this consciousness can deliver.

Articulate THIS layer.
The Appleseed is the resonant, archetypal crystallization of THIS layer across 12 perspectives.
Not the resume layer. Not the strengths layer. Not the personality-test layer.

Every field in the JSON output should serve this paradigm.
`;

// ---------------------------------------------------------------------------
// FULL PROMPT CONSTRUCTOR — ACTIVE: v2.0 (2026-04-24)
// V2 prepends ZONE_OF_GENIUS_DEFINITION to prime the model on what
// "Zone of Genius" actually means. Prior versions live in git history.
// ---------------------------------------------------------------------------

export const buildAppleseedPrompt = (rawSignal: string): string => {
  const processedSignal = sanitizeRawSignal(rawSignal);

  return `You are an Appleseed Generator — a system that transforms raw understanding of someone's genius into a high-precision, archetypal profile.

${ZONE_OF_GENIUS_DEFINITION}

${APPLESEED_TEMPLATE}

${CALIBRATION_EXAMPLES}

${ROASTING_INSTRUCTIONS}

${LANGUAGE_GUIDELINES}

---

Now, generate an Appleseed for this person based on the following input:

${processedSignal}

---

${OUTPUT_FORMAT}

Return ONLY the JSON object. No explanation. No preamble.`;
};

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

/**
 * Deep Top Talent Profile — the 8 rich fields produced by the user-facing
 * `ZONE_OF_GENIUS_PROMPT` (src/prompts/user/zoneOfGeniusPrompt.ts) when
 * pasted into ChatGPT/Claude/Gemini and JSON-returned. Captures the
 * activation-level depth (edge & traps, ideal environments, career sweet
 * spots, flywheel action) that the compressed snapshot doesn't carry.
 *
 * Day 57 (Sasha 2026-05-01): added as optional layer on AppleseedData so
 * existing snapshots degrade gracefully (field stays undefined). New
 * snapshots populate it via tryExtractTopTalentProfile() when rawSignal
 * is the structured JSON output of the prompt.
 */
export interface TopTalentProfile {
  archetype_title: string;
  core_pattern: string;
  top_three_talents: string[];
  how_genius_shows_up: string;
  edge_and_traps: string;
  /**
   * Day 58 (Sasha 2026-05-02): synthesized one-sentence form of
   * `edge_and_traps`, phrased as a noun phrase / gerund so it reads
   * naturally inside "My top shadow is ___" — parallel to the gerund
   * archetype convention. Used on the FIRST REVEAL card (where space
   * is at a premium); the full paragraph still renders on the deep-
   * profile "Top Shadow" subpage. Optional for back-compat with
   * pre-Day-58 snapshots.
   */
  top_shadow_one_sentence?: string;
  ideal_environments: string[];
  career_sweet_spots: string[];
  flywheel_action: string;
}

export interface AppleseedData {
  bullseyeSentence: string;
  vibrationalKey: {
    name: string;
    tagline: string;
    tagline_simple: string;
  };
  threeLenses: {
    actions: string[];
    primeDriver: string;
    primeDriver_meaning: string;
    archetype: string;
    archetype_meaning: string;
  };
  appreciatedFor: Array<{
    effect: string;
    scene: string;
    outcome: string;
  }>;
  masteryStages: Array<{
    stage: number;
    name: string;
    description: string;
  }>;
  professionalActivities: Array<{
    activity: string;
    targetAudience: string;
    purpose: string;
  }>;
  rolesEnvironments: {
    asCreator: string;
    asContributor: string;
    asFounder: string;
    environment: string;
  };
  complementaryPartner: {
    skillsWise: string;
    geniusWise: string;
    archetypeWise: string;
    synergy: string;
  };
  monetizationAvenues: string[];
  lifeScene: string;
  visualCodes: Array<{
    symbol: string;
    meaning: string;
  }>;
  elevatorPitch: string;
  /**
   * Deep profile — Day 58 (Sasha 2026-05-02): now generated by the
   * appleseed prompt itself in a single Lovable call (was previously
   * extracted from rawSignal only when the user happened to paste
   * structured JSON). Every new snapshot populates this; legacy
   * snapshots may still be missing it (kept optional for back-compat).
   * Renders the activation-level surface on `/game/me/zone-of-genius`.
   */
  topTalentProfile?: TopTalentProfile;
}

// ---------------------------------------------------------------------------
// GENERATION FUNCTION (Lovable AI integration)
// ---------------------------------------------------------------------------

import { supabase } from "@/integrations/supabase/client";

/**
 * If rawSignal is the structured JSON returned by `ZONE_OF_GENIUS_PROMPT`,
 * extract the 8 deep-profile fields. Returns undefined when the input
 * isn't that JSON (raw conversation text, partial fields, etc.) — caller
 * should treat undefined as "no deep profile available, render fallback."
 */
const tryExtractTopTalentProfile = (rawSignal: string): TopTalentProfile | undefined => {
  if (typeof rawSignal !== "string" || !rawSignal.trim()) return undefined;
  // The prompt asks for a JSON block; users sometimes paste with leading
  // prose or markdown fences. Try to locate the first `{...}` envelope.
  const fenceMatch = rawSignal.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : rawSignal;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return undefined;
  const jsonSlice = candidate.slice(firstBrace, lastBrace + 1);
  let parsed: any;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  // Validate the 8 expected keys are present + correctly shaped. Missing
  // any → not the prompt's output; bail.
  const required = [
    "archetype_title",
    "core_pattern",
    "top_three_talents",
    "how_genius_shows_up",
    "edge_and_traps",
    "ideal_environments",
    "career_sweet_spots",
    "flywheel_action",
  ];
  for (const k of required) {
    if (!(k in parsed)) return undefined;
  }
  if (!Array.isArray(parsed.top_three_talents)) return undefined;
  if (!Array.isArray(parsed.ideal_environments)) return undefined;
  if (!Array.isArray(parsed.career_sweet_spots)) return undefined;
  return {
    archetype_title: String(parsed.archetype_title || ""),
    core_pattern: String(parsed.core_pattern || ""),
    top_three_talents: parsed.top_three_talents.map((t: unknown) => String(t)).filter(Boolean),
    how_genius_shows_up: String(parsed.how_genius_shows_up || ""),
    edge_and_traps: String(parsed.edge_and_traps || ""),
    // Day 58 (Sasha 2026-05-02): synthesized form is optional in the
    // legacy schema — older snapshots won't have it; new snapshots will.
    top_shadow_one_sentence: parsed.top_shadow_one_sentence
        ? String(parsed.top_shadow_one_sentence)
        : undefined,
    ideal_environments: parsed.ideal_environments.map((t: unknown) => String(t)).filter(Boolean),
    career_sweet_spots: parsed.career_sweet_spots.map((t: unknown) => String(t)).filter(Boolean),
    flywheel_action: String(parsed.flywheel_action || ""),
  };
};

/**
 * Generate an Appleseed from raw signal using Lovable AI.
 *
 * @param rawSignal - The user's pasted AI response about their genius
 * @returns Promise<AppleseedData> - The generated Appleseed
 */
export const generateAppleseed = async (rawSignal: string): Promise<AppleseedData> => {
  const prompt = buildAppleseedPrompt(rawSignal);

  const { data, error } = await supabase.functions.invoke('generate-appleseed', {
    body: { prompt, rawSignal }
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate Appleseed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.appleseed) {
    throw new Error('No appleseed data in response');
  }

  const appleseed = data.appleseed as AppleseedData;

  // Day 58 (Sasha 2026-05-02): the appleseed prompt now produces the
  // 8-field topTalentProfile in the same call (canonical source). Only
  // use the legacy rawSignal-paste extractor as a fallback when the
  // model didn't include topTalentProfile — defensive for the rare
  // case where the model's JSON omits the block.
  if (!appleseed.topTalentProfile) {
    const deep = tryExtractTopTalentProfile(rawSignal);
    if (deep) appleseed.topTalentProfile = deep;
  }

  return appleseed;
};
