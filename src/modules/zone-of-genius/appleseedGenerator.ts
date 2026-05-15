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
    // top_three_talents_compact:  see EXAMPLE 2 (Karime) below — that triplet is the CANONICAL template for the compact form. Aleksandr's compact form will be regenerated and added back as a second template once it passes the 5-second-friend test cleanly.
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
- topTalentProfile.top_three_talents_compact:  // ★ CANONICAL TEMPLATE for the compact-three field. Each entry: gerund + concrete object, 2-4 words, plain English, distinct verbs, passes the 5-second-friend test cleanly. NOT abstract ("Sensing the unspoken" passes; "Sensing inner truth" or "Sensing nested signal" would FAIL — too abstract). Use this triplet's shape as the bar.
    "1. Sensing the unspoken"
    "2. Bonding the disconnected"
    "3. Harmonizing the field"

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
- Day 58 (2026-05-02) JARGON CHECK: does ANY field — especially flywheel_action, top_three_talents, top_three_talents_compact, how_genius_shows_up — contain an invented capitalized product name ("Signal Snapshot," "Compression Capsule," "Architecture Session") or insider vocabulary the reader hasn't been introduced to ("compression," "distillation" used as nouns without translation)? REJECT and rewrite in plain everyday English. The reader has zero context for jargon — every undefined term breaks trust.
- Day 61 (2026-05-04) COMPACT-TALENTS SYNTHESIS CHECK: top_three_talents_compact is shown on the FIRST REVEAL card, three lines stacked. Each entry must (a) be 2-4 words, (b) be a GERUND + CONCRETE OBJECT ("Sensing the unspoken", NOT "Sensing inner truth"), (c) preserve the signal of the matching long form in top_three_talents with ZERO noise added — sharper than the long form, NOT more abstract, (d) pass the 5-second-friend test (a smart friend with no personal-development context groks it instantly), (e) use a DISTINCT verb from the other two entries. REJECT any entry that drifts into abstract compound nouns ("Inner X / Sacred X / Deep X / True X") — same banned patterns as elsewhere in topTalentProfile. NO machine-speak, NO fluff, NO decorative adjectives, NO trailing period.
- Day 58 (2026-05-03) VOICE-REGISTER CHECK: does top_shadow_one_sentence contain ANY second-person reflexive ("yourself," "your own," "yours")? If yes, REJECT — this field renders under "MY TOP SHADOW IS" so reflexives MUST be first-person ("myself," "my own," "mine"). Rewrite. Same check applies to bullseyeSentence and elevatorPitch (also "MY X IS"–framed surfaces): no "you / your / yourself" allowed, only "I / my / myself."
- Day 58 (2026-05-03) ABSTRACT-COMPOUND-NOUN CHECK: scan EVERY field — especially vibrationalKey.name, topTalentProfile.archetype_title, bullseyeSentence, top_shadow_one_sentence — for the banned patterns (Inner X, Felt X, Safe X, Sacred X, Deep X, True X, Pure X, Whole X, Authentic X, and any compound where the adjective doesn't ground the noun in something concrete). If found, REJECT and rewrite as a concrete particular. THE 5-SECOND-FRIEND TEST: a smart friend outside personal-development should grok the phrase in 5 seconds without having to ask "what does that mean?" — if not, rewrite. Karime walkthrough (2026-05-03) shipped "Inner-Belonging Restoring / inner belonging / safe truth" — all three were in this category, and the resonance score dropped accordingly.
- Day 67 (2026-05-13) DUAL-ACTOR PRONOUN CHECK (universalized — no field list, applies to EVERY Bucket B body field): for each "you / your" in the text, ask: does this "you" refer to THE USER (the reader of their own profile), or could it refer to AN OTHER PERSON in the scene (a founder, a client, someone, a team, people)? If the "you" could plausibly point at anyone other than the user, REJECT and rewrite that pronoun as "they / them / their" (or a noun: "the founder", "the client"). The CANONICAL RULE (Sasha 2026-05-13): the passage speaks TO THE USER (2nd person) ABOUT THEIR CLIENTS / GIFT RECIPIENTS / COLLABORATORS (3rd person). These two never collapse. Quick test: substitute the noun antecedent ("the founder", "the client", "someone", "people") for the "you" — if the sentence now reads more correctly, the original "you" was wrong. Two bug patterns to ruthlessly flag: (Day 67 talent paragraph) "People feel obvious to YOURSELF because you turn YOUR OWN stories into a map YOU can follow" → "People feel obvious to YOU because you've turned your own stories into a map THEY can follow"; (Day 67 how_genius_shows_up) "Your genius shows up when YOU feel overloaded… YOU bring a tangle… you leave behind a structure YOU can act on" → "Your genius shows up when SOMEONE feels overloaded… THEY bring a tangle… you leave behind a structure THEY can act on." THIS is the most common LLM failure mode in this prompt — apply the substitution test to every "you / your" in every Bucket B sentence before returning.
- Day 67 (2026-05-13) REFLEXIVE-PRONOUN CHECK: scan every Bucket B field for "yourself / yourselves." Reflexive is grammatical ONLY when "you" is the SUBJECT of the same clause AND the action loops back. If the clause's subject is anyone else (people, the founder, they, someone), the pronoun is "you" — NEVER "yourself." Bug to flag: "People feel obvious to YOURSELF" / "Clients leave feeling seen by YOURSELF" / "The founder thanks YOURSELF." Correct: "People feel obvious to YOU" / "Clients leave feeling seen by YOU" / "The founder thanks YOU." When in doubt: if you can replace "yourself" with the noun ("people", "the client") and the sentence reads more correctly, "yourself" was wrong — flip to "you."
- Day 67 (2026-05-13) SCENE-STRUCTURE CHECK (for any field describing "when your genius shows up / when the work flows / what people experience / how it lands / people feel / they thrive"): does sentence 1 START by naming the OTHER ACTOR'S state ("When someone…" / "When the work is…" / "When a founder arrives with…" / "People feel…") — or does it incorrectly start with the user's state ("When YOU feel…" / "When YOU bring…")? If it starts with "you," REJECT — the user is not the person in the problem state; the user is the one who resolves it. Restructure: other actor first, then user's response. The Day 67 how_genius_shows_up bug ("Your genius shows up when YOU feel overloaded") was an OPENING-SENTENCE failure — the entire paragraph collapsed because sentence 1 mis-cast who is in the scene.
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

VOICE REGISTER — TWO BUCKETS + EDITORIAL DISCIPLINE (Day 67, 2026-05-13 — strengthened after two pronoun-collapse regressions caught in production on the live platform):

There are TWO surfaces, and each takes a distinct voice. Mixing them creates broken reads on the reveal card (Day 58 bug) AND broken body paragraphs (Day 67 bugs in talent long-form + how_genius_shows_up).

Bucket A — FIRST PERSON ("I / me / my / mine / myself"):
  Fields rendered under "MY TOP X IS" eyebrows on the reveal card. The reader is speaking ABOUT THEMSELVES; reflexives must point back at the speaker.
  • bullseyeSentence — rendered as "I [verb] …" on the hero
  • top_shadow_one_sentence — rendered raw under "MY TOP SHADOW IS" → reflexives MUST be first-person ("myself", "my own"), NEVER second-person ("yourself", "your own")
  • elevatorPitch — first-person summary

──────────────────────────────────────────────────────────────────────
Bucket B — EDITORIAL OBSERVER (the canonical rule, Sasha 2026-05-13):
──────────────────────────────────────────────────────────────────────

  Speaks TO THE USER (reader of their own profile) → 2nd person ALWAYS:
    "you / your / yours"

  Speaks ABOUT the user's CLIENTS, GIFT RECIPIENTS, COLLABORATORS, OR
  ANYONE ELSE in the scene → 3rd person ALWAYS:
    "they / them / their / themselves" (or a noun: "the founder",
    "a client", "someone", "people")

  These two NEVER collapse. The most common failure mode (caught
  twice in May 2026) is using "you" or "yourself" to refer to BOTH
  actors at once — the reader cannot tell who is doing what to whom,
  and the sentence reads broken.

  NEVER first person ("I / my") — that breaks the editorial register.

REFLEXIVE-PRONOUN DISCIPLINE (Day 67, 2026-05-13 — codified after the "obvious to yourself" regression):

  "yourself / yourselves" is grammatical ONLY when "you" is the
  SUBJECT of the same clause AND the action loops back to "you."
  If the clause's subject is anyone else (people, the founder, they,
  someone), the second-person pronoun is "you" — NEVER "yourself."

    ✓ "You see yourself in their face."           (subject = you; loops back)
    ✗ "People see yourself in their work."        → "People see you in their work."
    ✗ "People feel obvious to yourself."          → "People feel obvious to you."
    ✗ "Clients leave feeling seen by yourself."   → "Clients leave feeling seen by you."

UNIVERSALIZE — applies to EVERY Bucket B body field that could
plausibly describe a scene with both you and another person — which
is most of them. The list below is ILLUSTRATIVE, NOT EXHAUSTIVE.
Adding new fields does NOT require updating the rule; the rule
applies by default:

  top_three_talents · top_three_talents_compact · core_pattern ·
  how_genius_shows_up · edge_and_traps · flywheel_action ·
  career_sweet_spots · complementaryPartner.synergy ·
  masteryStages.description · ideal_environments ·
  appreciatedFor.scene · lifeScene · any future Bucket B field.

SCENE-STRUCTURE TEMPLATE (mandatory for any field describing "when
your genius shows up / when the work flows / what people experience /
how it lands / people feel" — i.e., any consequence- or situation-
naming field):

  Sentence 1 MUST start by naming the OTHER ACTOR'S state, NOT
  the user's state. Choose one of:
    "When someone…" / "When the work is…" / "When a founder
    arrives with…" / "People feel…" / "When clients are…"

  NEVER start with "When YOU feel…" or "When YOU bring…" — the
  user is not the person in the problem state; the user is the
  one who resolves it.

  Sentence 2+ describes the user's action in response. THIS is
  where "you" enters.

WORKED EXAMPLES (the regression bugs that triggered this codification):

Bucket A bug — Day 58 (reveal-card "MY top shadow IS"):
  ✗ "Naming everyone else's gift while your own stays unnamed."
  ✓ "Naming everyone else's gift while my own stays unnamed."

Bucket B bug — Day 67 (top_three_talents long form, "Building the map"):
  ✗ "You take scattered potential and you find the one pattern… People feel obvious to yourself because you turn your own stories into a map you can follow."
  ✓ "You take scattered potential and you find the one pattern… People feel obvious to you because you've turned your own stories into a map THEY can follow."
  (Two bugs stacked: "yourself" is reflexive misuse — "people" is the subject, so the pronoun is "you," not "yourself." "you can follow" is dual-actor collapse — you BUILT the map FROM your own stories, but THEY (the people) are the ones who FOLLOW it.)

Bucket B bug — Day 67 (how_genius_shows_up):
  ✗ "Your genius shows up when YOU feel overloaded, fragmented, or unable to explain what YOU sense. YOU bring a tangle: business goals mixed with identity shifts… you leave behind a structure YOU can act on."
  ✓ "Your genius shows up when SOMEONE feels overloaded, fragmented, or unable to explain what THEY sense. THEY bring a tangle: business goals mixed with identity shifts… you leave behind a structure THEY can act on."
  (The first three "you"s collapsed the OTHER PERSON — the one bringing the tangle — into the subject. The final "you" collapsed the OTHER PERSON — the one acting on the structure you built — into the subject. Reader can't parse who's overloaded, who's tangled, who built the structure, who executes on it.)

Bucket B bug — Day 62 (how_genius_shows_up, prior):
  ✗ "Your genius shows up when someone is circling what YOU mean… YOU talk in paragraphs, qualifiers, and half-decisions… YOU don't let the conversation stay loose."
  ✓ "Your genius shows up when someone is circling what THEY mean… THEY talk in paragraphs, qualifiers, and half-decisions… YOU don't let the conversation stay loose — you define terms."

QUICK SUBSTITUTION TEST (mandatory pre-output check on every Bucket B sentence):

  For every "you / your / yourself" in the text: substitute the
  noun antecedent ("the founder", "a client", "someone", "people")
  for the pronoun and re-read. If the sentence makes MORE sense
  with the noun, that pronoun was wrong — flip to "they / them /
  their / themselves."

  Worked example: "you leave behind a structure YOU can act on
  immediately" → substitute "people" for the second YOU → "you
  leave behind a structure PEOPLE can act on immediately" → reads
  better → original "you" was wrong → flip to "they."

  Run this test on EVERY sentence containing "you" before returning
  the JSON. If the test fires, the field is broken — rewrite, do
  not ship.
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
      "scene": "string - the situation. SECOND-PERSON addressing the subject; OTHER PEOPLE in the scene (founder, client, teammate, the room) stay \"they / them / their\" — never collapse them into \"you\".",
      "outcome": "string - the result"
    }
  ],
  "masteryStages": [
    {
      "stage": 1,
      "name": "string",
      "description": "string — SECOND-PERSON (\"You learn to…\", \"You start naming…\"). DUAL-ACTOR DISCIPLINE: when the description names what happens with OTHER PEOPLE (notes, founders, teams), they stay \"they / them / their\" — never collapse the other person into \"you\"."
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
    "synergy": "string — ONE tight prose paragraph (3-5 sentences) describing the complementary partner this archetype most needs. Fuse three layers into continuous flow, not labeled sections: skills the partner brings (what they execute that this person doesn't), genius they bring (how they sense, see, or create — their irreducible signature), and archetype they embody (their being-pattern). Then close with the synergy: what the two of them, together, produce that neither alone could. Read like a paragraph in a profile, not a four-row table. No bullet lists. No headings. No 'Skills-wise…, Genius-wise…' labels. One continuous read. SECOND-PERSON addressing the subject (\"your best partner is…\"). DUAL-ACTOR DISCIPLINE: the PARTNER stays \"they / them / their\" throughout — never collapse the partner into \"you\". (Bug example to avoid: \"Your best partner loves finishing what YOU started\" — that second \"you\" is fine if it really is the subject's work; but \"a partner who senses what YOU will say yes to\" when meaning the partner senses what BUYERS will say yes to is wrong → \"what THEY will say yes to\".)",
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
    "core_pattern": "string — 2-3 sentence paragraph describing my fundamental operating pattern. Names the signature, not the category. This is the bullseye opened up into prose. Specific to me, not aspirational. SECOND-PERSON register (\"you / your\"). DUAL-ACTOR DISCIPLINE: when the sentence describes a scene with both the subject AND someone the subject acts on, the subject is \"you\" and the other person is \"they / them / their\" — never collapse the other into \"you\". (Bug example: \"You listen until you can name the real point\" is fine; \"You listen until someone hears what YOU mean\" is wrong — that second \"you\" should be \"they\".)",
    "top_three_talents": [
      "string — Talent 1, brief, specific to how it manifests in me (not generic strengths-finder language). 2-3 sentences. SECOND-PERSON register addressing the user (\"You take… you find… you build…\"). DUAL-ACTOR DISCIPLINE — CRITICAL: this paragraph almost always describes a SCENE with two actors — the USER AND the OTHER PERSON / CLIENTS / GIFT RECIPIENTS the user is acting on. The user is ALWAYS \"you / your.\" The OTHER PERSON is ALWAYS \"they / them / their / themselves\" (or a noun: \"people,\" \"a founder,\" \"a client,\" \"someone\"). NEVER collapse the two. NEVER use \"yourself\" to refer to anyone but the user (and only when \"you\" is also the clause's subject). Bug to avoid (Day 67): \"You take scattered potential and you find the one pattern… People feel obvious to YOURSELF because you turn YOUR OWN stories into a map YOU can follow.\" Two errors: (a) \"yourself\" — \"people\" is the subject, so it must be \"you\"; (b) \"a map you can follow\" — the map is for the OTHER PEOPLE, so it must be \"a map THEY can follow.\" Correct: \"…People feel obvious to YOU because you've turned your own stories into a map THEY can follow.\" Apply the SUBSTITUTION TEST before returning: for each \"you / your / yourself,\" substitute the noun antecedent (\"people,\" \"a client\") and re-read — if it reads better with the noun, the pronoun was wrong, flip to \"they.\"",
      "string — Talent 2, same standard, same dual-actor discipline.",
      "string — Talent 3, same standard, same dual-actor discipline."
    ],
    "top_three_talents_compact": [
      "string — Talent 1 in COMPACT form: 2-4 words, GERUND + concrete object (e.g., 'Sensing the unspoken', 'Softening the wound', 'Blessing the threshold'). 1:1 mapping with top_three_talents above — same talent, distilled. Renders on the FIRST REVEAL card under a 'MY THREE TALENTS' eyebrow, three of them stacked, so each must read as a complete thought standing alone. CRITICAL synthesis principle (same as top_shadow_one_sentence): preserve maximum signal from the long form, introduce zero noise — sharper than the long form, NOT more abstract. UNIVERSALLY RELATABLE + GROKABLE — a smart friend outside personal-development should grok the phrase in 5 seconds without asking 'what does that mean?'. NO abstract compound nouns (banned: 'Inner X / Felt X / Safe X / Sacred X / Deep X / True X / Pure X / Whole X / Authentic X' as adjective+noun pairs — same ban as the rest of topTalentProfile). NO machine-speak, no insider jargon, no fluff, no decorative adjectives. Plain ordinary English with one concrete object. NO period at the end. The three entries must use DISTINCT verbs (no 'sensing / sensing / sensing' — each verb names a different motion). The verb stem may be reused from threeLenses.actions where the fit is clean, but the gerund + object form here is mandatory.",
      "string — Talent 2, same standard",
      "string — Talent 3, same standard"
    ],
    "how_genius_shows_up": "string — paragraph describing how these talents manifest in the user's daily work and interactions. Cite real patterns from rawSignal — concrete, not abstract. SECOND-PERSON register addressing the user (\"you / your\"). DUAL-ACTOR DISCIPLINE — CRITICAL FOR THIS FIELD: this paragraph almost always describes a SCENE with two actors — the USER AND the OTHER PERSON / CLIENTS / GIFT RECIPIENTS the user is acting on (a founder, a client, someone, a team, people). The user is ALWAYS \"you / your.\" The OTHER PERSON is ALWAYS \"they / them / their / themselves\" (or a noun like \"the founder,\" \"a client,\" \"someone,\" \"people\"). Never collapse the two. SCENE-STRUCTURE TEMPLATE (mandatory): sentence 1 MUST start by naming the OTHER ACTOR'S state, NOT the user's state — choose one of: \"When someone…\" / \"When the work is…\" / \"When a founder arrives with…\" / \"People feel…\" / \"When clients are…\" NEVER start with \"When YOU feel…\" or \"When YOU bring…\" — the user is not the person in the problem state; the user is the one who resolves it. Sentence 2+ describes the user's action in response — THIS is where \"you\" enters. Bug to avoid (Sasha Day 67): \"Your genius shows up when YOU feel overloaded, fragmented, or unable to explain what YOU sense. YOU bring a tangle: business goals mixed with identity shifts… you leave behind a structure YOU can act on.\" Two layers of collapse: (a) the first three \"you\"s should be \"someone / they / they\" — the OTHER PERSON brings the tangle, not the user; (b) the final \"you\" should be \"they\" — the user BUILT the structure, the OTHER PERSON acts on it. Correct: \"Your genius shows up when SOMEONE feels overloaded, fragmented, or unable to explain what THEY sense. THEY bring a tangle: business goals mixed with identity shifts… you leave behind a structure THEY can act on.\" Older bug to avoid (Day 62): \"Your genius shows up when someone is circling what YOU mean but can't land it: YOU talk in paragraphs…\" — the first three \"you\"s refer to the OTHER PERSON. Correct: \"…what THEY mean but can't land it: THEY talk in paragraphs… YOU don't let the conversation stay loose — you define terms.\" SUBSTITUTION TEST: substitute the noun (\"the founder,\" \"people,\" \"a client\") for any \"you\" and re-read; if the sentence now makes more sense, that \"you\" was wrong — flip to \"they / them / their.\" Run this test on every \"you\" in the paragraph before returning.",
    "edge_and_traps": "string — paragraph naming the structural shadow my gift generates — the OTHER SIDE OF THE COIN, not a list of weaknesses. A unique gift always produces a structurally identical limiting belief, but inverted. Name (a) the inverted form of my gift (e.g., 'I help others articulate their uniqueness' → 'my own uniqueness remains unarticulated'), (b) the limiting belief this inversion whispers in my own life ('I need a better X before I can act'), (c) one short observation about how this looks in motion (the recursive trap when I forget my gift is for outward use, not inward use). Specific to me. Same length as how_genius_shows_up. Do not soften or moralize. SECOND-PERSON register (\"you / your\"). DUAL-ACTOR DISCIPLINE: when contrasting what the subject does FOR OTHERS vs. for themselves, OTHERS are \"they / them / their\" and the subject is \"you / your / yourself\" — never collapse the two.",
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
    "flywheel_action": "string — the ONE action that, repeated as a flywheel, optimally advances me on my path of mastery. Specific enough to start today. Not advice — an instruction. CRITICAL: write in plain everyday language only. Use ordinary verbs (talk to, write, send, make, run) and ordinary objects (a person, a page, a message, a post). NEVER invent capitalized product or service names ('Signal Snapshot', 'Compression Capsule', 'Architecture Session') — those imply a packaged offering the reader has no context for and immediately break trust. NEVER use insider jargon from the user's own world ('compression', 'distillation', 'capsule') without translation. SECOND-PERSON IMPERATIVE register addressing the subject (\"do X\", \"call Y\"). DUAL-ACTOR DISCIPLINE: the OTHER PERSON the subject is acting on stays \"they / them / their\" — the subject's actions stay implicit-imperative or \"you\". Example clean: 'Spend the first hour each morning helping one founder name what THEY actually do, then publish what surprised YOU.' Example broken (pronoun collapse): 'Spend the first hour helping one founder name what YOU actually do' — the second \"you\" should be \"they\"."
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
/**
 * Unifying Role Profile — Day 66 (Sasha 2026-05-12): a NEW aspect-form
 * perspective on the same unique gift. Where Top Talent Profile names
 * WHAT the person uniquely does (the irreducible signature pattern),
 * Unifying Role names WHAT THEY ARE in the relational/social field —
 * the structural function their being performs in the larger meshwork:
 * the split they heal, the two realms they bridge, the holonic position
 * they hold.
 *
 * Sibling perspective to TopTalentProfile, NOT a sub-field of it. Lives
 * directly on AppleseedData. Generated separately by the Unifying Role
 * prompt (parked in chat as v1.0; not yet productized to src/prompts —
 * Wave 2 of the rollout). Until Wave 3 (auto-generation) ships, only
 * Sasha himself has data — the perspective view falls back to a clean
 * empty-state ("opens after your first session") for every other user.
 *
 * Full DoD: see roadmap entry "Unifying Role subpage" (Day 66).
 */
export interface UnifyingRoleProfile {
  /** 2-5 word noun phrase. The function, not the actor. Reads inside
   * "My unifying role is ___" (e.g. "The Bridge From Who You Are to
   * What You Sell"). NOT a gerund — that's TopTalent's grammar. */
  unifying_role_title: string;
  /** ONE sentence naming the structural fracture this person's
   * presence integrates. Concrete, plain language. */
  the_split_you_heal: string;
  /** Exactly 2 entries — the two realms in genuine tension that the
   * person stands between. Concrete particulars, not abstractions. */
  the_two_poles: string[];
  /** Paragraph (3-5 sentences) describing HOW the person performs the
   * unification — the signature move that closes the gap. */
  the_signature_integration: string;
  /** Paragraph naming what specifically suffers in the world when this
   * unification doesn't happen. Concrete real-world consequences. */
  what_breaks_when_you_are_absent: string;
  /** Paragraph describing what becomes possible when the unification
   * lands. Same scene, opposite side of the bridge. */
  what_lands_when_you_are_present: string;
  /** 3 entries — specific environments / situations where this
   * unification is most needed. */
  where_this_role_matters_most: string[];
  /** Paragraph describing the constituency: who recognizes the
   * unifying role as their missing piece on first contact. */
  the_tribe_that_recognizes_you: string;
  /** ONE sentence naming the larger pattern this role serves in
   * the noosphere / market / culture. The dharma-level statement. */
  the_civilizational_function: string;
  /** Compact synth — reads naturally inside "My unifying role is ___".
   * Max ~20 words. First-person reflexives only (never "yourself"). */
  unifying_role_one_sentence: string;
}

export interface TopTalentProfile {
  archetype_title: string;
  core_pattern: string;
  top_three_talents: string[];
  /**
   * Day 61 (Sasha 2026-05-04): compact 2-4 word "gerund + concrete object"
   * form of each talent — 1:1 with `top_three_talents` above. Renders on
   * the FIRST REVEAL card under the "MY THREE TALENTS" eyebrow as three
   * stacked lines. The long form keeps powering the deep "Three Key
   * Talents" perspective sub-page; this compact form is for the reveal
   * box only. Optional for back-compat with pre-Day-61 snapshots — when
   * absent, the reveal block hides cleanly.
   */
  top_three_talents_compact?: string[];
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
  /**
   * Day 66 (Sasha 2026-05-12): Unifying Role — sibling perspective to
   * TopTalentProfile that names the structural function the person's
   * gift performs in the larger relational/social field. Optional;
   * pre-Day-66 snapshots and any user without a session-generated
   * unifying role won't have it (the perspective view falls back to a
   * clean empty-state). Renders at /game/me/zone-of-genius/unifying-role.
   * See UnifyingRoleProfile interface above for field-by-field shape.
   */
  unifyingRole?: UnifyingRoleProfile;
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
    // Day 61 (Sasha 2026-05-04): compact form for the FIRST REVEAL card.
    // Optional — pre-Day-61 snapshots don't have it; the reveal block
    // hides cleanly when undefined.
    //
    // Day 61 (post-roast): warn loudly when the long form is present
    // but the compact form isn't or is wrong-shape — that's the model
    // partially complying with the new schema, and the operator
    // wondering "why isn't the new section showing up after a re-run?"
    // wants to see this in the console.
    top_three_talents_compact: (() => {
        if (Array.isArray(parsed.top_three_talents_compact)) {
            return parsed.top_three_talents_compact.map((t: unknown) => String(t)).filter(Boolean);
        }
        if (Array.isArray(parsed.top_three_talents) && parsed.top_three_talents.length > 0) {
            console.warn(
                "[appleseedGenerator] top_three_talents_compact missing or invalid — " +
                "model returned the long form but skipped the compact form. " +
                "The MY THREE TALENTS reveal block will not render for this snapshot.",
                { received: parsed.top_three_talents_compact }
            );
        }
        return undefined;
    })(),
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
