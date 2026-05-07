/**
 * ASSET_MAPPING_PROMPT — versioned. Preserves the lineage in-file
 * because the taxonomy is the most precious artifact in this module
 * (Sasha 2026-05-07: "treat the prompt as precious. SAVE ALL PRIOR
 * VERSIONS. FIND THE MOST RELEVANT PLACE TO TRACK IT IN. DO NOT
 * CREATE A NEW MD FILE.").
 *
 * ════════════════════════════════════════════════════════════════════
 *   VERSION EVOLUTION
 * ════════════════════════════════════════════════════════════════════
 *
 *   v1 (Day-X original) — alive but strategically blurry.
 *     • Breadth, texture, humanity, mythic continuity
 *     • No maturity distinctions, no power-law prioritization
 *     • Mixed ontological layers (mythic + practical in one ranking)
 *     • Confused potential energy with kinetic energy
 *     Preserved as `_ASSET_MAPPING_PROMPT_V1` below for diff-ability.
 *
 *   v2 (Day 63 morning, 2026-05-07) — Divine-Roast-driven upgrade.
 *     STRENGTHS: maturity enum (5 values), horizon (3 values), tighter
 *     leverage rubric, is_power_node, "things-touched ≠ deployable"
 *     filter, tribal-recognition test.
 *     OVER-CORRECTION (caught by 27P roast same evening):
 *     • Too venture-capital-brain, too eager to amputate symbolic layers
 *     • Smuggled in the false hidden assumption: "asset is only real if
 *       commercially actionable now"
 *     • Forced "Symbolic Animal Encounters" and "Top Talent Method" into
 *       the same ontology — distortion
 *     • Score inflation persisted even with the rubric (most things at
 *       6+, six 8s, four 9s, two 10s — not a power law)
 *     • De-duplication missed RELATIONAL duplicates (e.g. testimonials
 *       listed separately from the relationship that produced them)
 *     • "Service/Offer" node missing from taxonomy → offers got shoved
 *       into Methodologies, blurring IP from productized expression
 *     • Voice flattened to LinkedIn copy by the 15-year-old reading-
 *       level instruction overriding the user's actual register
 *     Preserved as `_ASSET_MAPPING_PROMPT_V2` below for diff-ability.
 *
 *   v3 (Day 63 evening, 2026-05-07) — alive AND operational. Exported
 *     as the active `ASSET_MAPPING_PROMPT`.
 *     KEY INSIGHTS DRIVING v3:
 *     1. FOUR DIMENSIONS, NOT ONE LADDER. Leverage / Maturity / Horizon
 *        / NATURE — kept distinct so symbolic-mythic capacity can score
 *        high on Leverage without being demoted by a single-axis ranking.
 *     2. NATURE ENUM (7 values: practical, relational, symbolic,
 *        infrastructural, mythic, intellectual, economic) gives
 *        ontological permission for the meaning-making layer that v2
 *        amputated as "symbolic_only."
 *     3. HORIZON EXPANDED to 4 values (now / near / long_term /
 *        civilization_scale) so strategic-north-star items have a
 *        proper home that doesn't fight money-now items.
 *     4. FIELD-FUNCTION RECOGNITION. The user's true core asset is
 *        often a verb-phrase capacity ("perceive latent essence,
 *        articulate it, reorganize reality around it") not a noun.
 *        v3 asks the AI to NAME this center of gravity FIRST in a
 *        special meta-asset entry, then tag every other asset with
 *        `expresses_root` showing how it branches from the center.
 *     5. LEVERAGE RUBRIC RECALIBRATED. Value = revenue OR credibility
 *        OR strategic position OR generative force. A symbolic asset
 *        that holds up much else can score 9 honestly; a monetizable
 *        asset that doesn't compound others scores 7. "Load-bearing"
 *        is the test, not "monetizable."
 *     6. RELATIONAL DE-DUPLICATION. Testimonials are an EXPRESSION of
 *        the relationship; do not list both. Network = relationship;
 *        social proof = output of relationship. Pick one.
 *     7. SERVICE/OFFER FLAG. Productized offers (paid sessions,
 *        cohorts, retainers) get `nature: "economic"`, not shoved into
 *        Methodologies. The taxonomy stays untouched (precious); the
 *        nature field carries the distinction.
 *     8. VOICE — keep grokability for descriptions, BUT preserve
 *        relational texture (people by name + texture, not "social
 *        proof generator"). Anti-LinkedIn guard.
 *     9. POWER-LAW DISTRIBUTION ENFORCED. Most assets 3-5; few 7s; one
 *        or two 9s. If more than ~5 hit 8+, you are inflating.
 *
 * ════════════════════════════════════════════════════════════════════
 *
 * Companion: supabase/functions/match-assets/index.ts is updated the
 * same day to mirror the v3 schema. Both extractors (this user-paste
 * path AND the edge-fn path) produce one consistent shape.
 */

// ════════════════════════════════════════════════════════════════════
// v1 — preserved for diff-ability. NOT ACTIVE. Do not import.
// ════════════════════════════════════════════════════════════════════

export const _ASSET_MAPPING_PROMPT_V1 = `Based on everything you know about me from our conversations, please map my assets across these 6 categories:

**CATEGORIES:**
1. **Expertise** — Professional skills and knowledge I've demonstrated
2. **Life Experiences** — Significant experiences that shaped me
3. **Networks** — Communities, organizations, and people I'm connected to
4. **Material Resources** — Physical, digital, or financial resources I have access to
5. **Intellectual Property** — Frameworks, content, methodologies, or creative works I've developed
6. **Influence** — Platforms, recognition, or credibility I've built

**TAXONOMY (USE THIS):**
You must classify each asset into this 3-level taxonomy: **type → subtype → category**.

Types:
- Expertise
  - Scientific & Technical: Professional, Life Sciences, Engineering, Information Technology, Mathematics
  - Business & Economics: Management, Finance, Marketing, Entrepreneurship, Economics
  - Arts & Humanities: Visual Arts, Performing Arts, Literature, Philosophy, History
  - Social Sciences: Psychology, Sociology, Anthropology, Political Science, Education
  - Applied Fields: Healthcare, Law, Environmental Studies, Urban Planning, Agriculture
- Life Experiences
  - Personal Growth: Self-discovery, Overcoming Challenges, Spiritual Journeys, Relationships, Health Transformations
  - Cultural Immersion: Long-term Travel, Living Abroad, Language Acquisition, Cultural Studies, Intercultural Projects
  - Humanitarian & Service: Volunteering, Social Work, Peace Corps, Disaster Relief, Community Building
  - Nature & Adventure: Wilderness Expeditions, Environmental Conservation, Extreme Sports, Wildlife Interaction, Sustainable Living
- Networks
  - Professional: Industry Associations, Alumni Networks, Professional Societies, Mentorship Circles, Entrepreneurial Ecosystems
  - Community: Local Organizations, Volunteer Groups, Spiritual Communities, Hobby Clubs, Neighborhood Associations
  - Industry: Trade Groups, Research Consortiums, Standards Bodies, Innovation Hubs, Industry-Specific Forums
  - Global: International NGOs, Cultural Exchange Programs, Global Think Tanks, Multinational Collaborations, Diaspora Networks
- Material Resources
  - Financial Capital: Liquid Savings, Investment Portfolio, Income Streams, Credit Access
  - Digital Assets: Domains & Websites, Email Lists & Subscribers, Software & API Access, Digital Content Libraries
  - Investment Interests: Angel Investing, Seed Funding, Series A-C, Growth Capital, Impact Investing, Philanthropy
  - Physical Space: Home Base, Office Space, Land, Event Venues
  - Equipment: Vehicles, Production Equipment, Tech Stack, Wellness Equipment
  - Natural Resources: Agriculture, Water Access, Energy Sources, Raw Materials
- Intellectual Property
  - Innovations: Patents, Product Concepts, Technical Breakthroughs
  - Methodologies: Frameworks, Processes, Playbooks
  - Creative Works: Books, Courses, Media, Art
- Influence
  - Thought Leadership: Publications, Speaking, Original Ideas
  - Media Reach: Social Media, Podcast/YouTube, Newsletter
  - Industry Recognition: Awards, Certifications, Credentials
  - Community Impact: Initiatives, Community Leadership, Volunteer Impact

**QUALITY CHECK:**
After drafting each asset, verify the type/subtype/category matches the asset's title and description. If it doesn't fit, **reassign it to the best matching taxonomy node**.

**OUTPUT FORMAT (REQUIRED):**
Return **only** a JSON array with this schema and **include "name" and "description" for every asset**:
\`\`\`json
[
  {
    "type": "Expertise|Life Experiences|Networks|Material Resources|Intellectual Property|Influence",
    "subtype": "e.g. Business & Economics, Cultural Immersion, etc.",
    "category": "e.g. Entrepreneurship, Language Acquisition, Social Media, etc.",
    "name": "Asset name",
    "description": "Brief description (1 sentence)",
    "leverage_score": 1-10,
    "leverage_reason": "Why this asset is high/low leverage"
  }
]
\`\`\`

**DE-DUPLICATION:**
Merge near-duplicates into a single asset. Prefer the most specific wording and fold similar items into the description.

**LEVERAGE SCORING:**
Rate each asset 1-10 based on:
- **Revenue potential** — How quickly could this generate income?
- **Strategic compounding** — Does this asset multiply the value of other assets?
- **Uniqueness** — How rare is this in the market?

Be comprehensive — include everything you've learned about my skills, resources, connections, and interests. Sort the final list by leverage_score (highest first).

**IMPORTANT LANGUAGE REQUIREMENTS:**
- Use universally understandable language that anyone can grasp
- Avoid technical jargon, academic terms, or specialized vocabulary
- Write descriptions as if explaining to a curious 15-year-old

**RESPONSE FORMAT:**
- Return ONLY the JSON array as specified above
- Do NOT add any follow-up suggestions, options, or offers to provide more
- Do NOT ask if I want additional analysis, visual representations, or variations
- End your response after the JSON array closes

I'm using this to map my assets in a personal development tool for potential collaborations and projects.`;

// ════════════════════════════════════════════════════════════════════
// v2 — preserved for diff-ability. NOT ACTIVE. Do not import.
// Day 63 morning (2026-05-07): the Divine-Roast-driven upgrade. Sharper
// than v1 but flattened the symbolic/mythic layers — see v3 below for
// the fix.
// ════════════════════════════════════════════════════════════════════

export const _ASSET_MAPPING_PROMPT_V2 = `Based on everything you know about me from our conversations, please map my **deployable assets**.

**THE CENTRAL FILTER (READ THIS FIRST):**
A real asset is something that can be **activated, transferred, trusted, sold, scaled, or compounded**. If it cannot do any of those — it is NOT an asset for this map. It may be mythology, biography, fuel, or future optionality, but it does not belong here unless tagged \`maturity: "symbolic_only"\` (see below).

For every candidate item, ask yourself FIVE questions before including it:
1. Is it real **now** (not a plan, not an intention)?
2. Is it owned by me (vs. relational, borrowed, or aspirational)?
3. Can it create value **this month**?
4. Can someone other than me understand it cold?
5. Can someone else buy it, share it, fund it, or build with it?

If the answer to most of these is no, the item is either symbolic, aspirational, or latent. Include it ONLY with the appropriate maturity tag. Do not flatter breadth.

**TAXONOMY (USE THIS, BUT DON'T LET IT MASTER THE TRUTH):**
You must classify each asset into this 3-level taxonomy: **type → subtype → category**.

[v2 carried the same taxonomy as v3 below — see active prompt for the full list]

**OUTPUT FORMAT (v2):**
Each asset has: type, subtype, category, name, description, maturity (5-value enum: monetizable_now | usable_but_needs_packaging | latent | aspirational | symbolic_only), horizon (3-value enum: now | next | later), leverage_score (1-10), leverage_reason, is_power_node (boolean).

**v2 LEVERAGE RUBRIC:**
- 10 = revenue / credibility / strategic compounding ALMOST IMMEDIATELY
- 8-9 = proven and near
- 5-7 = real but needs documentation/distribution/proof
- 3-4 = latent or symbolic. Not currently moving reality.
- 1-2 = present but operationally inert.

**v2 IS_POWER_NODE:** mark only the 5-7 assets that, if removed, would collapse most of the leverage. Default false.

**v2 SORTING:** power nodes first (desc leverage), then monetizable_now (desc), then everything else (desc), with symbolic_only LAST regardless of score.

[Full v2 text omitted in archive — see git history if needed. Key over-corrections caught by the 27P roast: forced symbolic items into "operationally inert" bucket, smuggled in commercial-only assumption, score inflation persisted, missed relational duplicates, missed Service/Offer ontological gap.]`;

// ════════════════════════════════════════════════════════════════════
// v3 — ACTIVE. Day 63 evening (2026-05-07). Alive AND operational.
//
// Synthesizes both feedback rounds:
//   • v1's mythic continuity + breadth (don't amputate symbolic layers)
//   • v2's deployability rigor (maturity, horizon, power-node, anti-fog)
//   • v3's NEW: nature ontological tag + field-function recognition
//     + relational de-dup + score-inflation guard with a power-law check
//
// Schema is BACKWARDS-COMPATIBLE: v2 fields all preserved; v3 adds
// `nature`, `expresses_root`, expanded `horizon` (4 values), `is_offer`.
// Local parser + edge fn handle missing v3 fields gracefully.
// ════════════════════════════════════════════════════════════════════

export const ASSET_MAPPING_PROMPT = `Based on everything you know about me from our conversations, please map my assets across **four simultaneous dimensions**: leverage, maturity, time horizon, and nature.

**FIRST — name my CENTER OF GRAVITY (root capacity).**
Before listing any assets, articulate in ONE sentence the deeper field-function I run on the world. This is usually a verb-phrase capacity, not a noun. (Example pattern: *"the ability to perceive latent essence in people and systems, articulate it clearly, and reorganize reality around it"*.) Every asset that follows is an expression of this root. The root itself is the FIRST entry in the JSON array, with \`type: "Center of Gravity"\` and a meaningful 1-sentence \`name\`.

**TAXONOMY (PRECIOUS — DO NOT REWORD):**
You must classify each asset into this 3-level taxonomy: **type → subtype → category**.

Types:
- Expertise
  - Scientific & Technical: Professional, Life Sciences, Engineering, Information Technology, Mathematics
  - Business & Economics: Management, Finance, Marketing, Entrepreneurship, Economics
  - Arts & Humanities: Visual Arts, Performing Arts, Literature, Philosophy, History
  - Social Sciences: Psychology, Sociology, Anthropology, Political Science, Education
  - Applied Fields: Healthcare, Law, Environmental Studies, Urban Planning, Agriculture
- Life Experiences
  - Personal Growth: Self-discovery, Overcoming Challenges, Spiritual Journeys, Relationships, Health Transformations
  - Cultural Immersion: Long-term Travel, Living Abroad, Language Acquisition, Cultural Studies, Intercultural Projects
  - Humanitarian & Service: Volunteering, Social Work, Peace Corps, Disaster Relief, Community Building
  - Nature & Adventure: Wilderness Expeditions, Environmental Conservation, Extreme Sports, Wildlife Interaction, Sustainable Living
- Networks
  - Professional: Industry Associations, Alumni Networks, Professional Societies, Mentorship Circles, Entrepreneurial Ecosystems
  - Community: Local Organizations, Volunteer Groups, Spiritual Communities, Hobby Clubs, Neighborhood Associations
  - Industry: Trade Groups, Research Consortiums, Standards Bodies, Innovation Hubs, Industry-Specific Forums
  - Global: International NGOs, Cultural Exchange Programs, Global Think Tanks, Multinational Collaborations, Diaspora Networks
- Material Resources
  - Financial Capital: Liquid Savings, Investment Portfolio, Income Streams, Credit Access
  - Digital Assets: Domains & Websites, Email Lists & Subscribers, Software & API Access, Digital Content Libraries
  - Investment Interests: Angel Investing, Seed Funding, Series A-C, Growth Capital, Impact Investing, Philanthropy
  - Physical Space: Offices, Workshops, Land, Venues, Retreat Centers
  - Equipment: Technology, Machinery, Vehicles, Scientific Instruments, Artistic Tools
  - Natural Resources: Water Sources, Energy Resources, Agricultural Land, Forests, Mineral Deposits
- Intellectual Property
  - Innovations: Patents, Inventions, Algorithms, Prototypes, Novel Applications
  - Methodologies: Frameworks, Processes, Systems, Techniques, Approaches
  - Creative Works: Writing, Artwork, Music, Software, Designs
- Influence
  - Thought Leadership: Publishing, Speaking, Consulting, Mentoring, Academic Influence
  - Media Reach: Social Media, Traditional Media, Podcasts, Blogs, Video Platforms
  - Industry Recognition: Awards, Board Positions, Expert Status, Patent Citation, Peer Recognition
  - Community Impact: Local Leadership, Grassroots Organizing, Policy Influence, Social Movements, Philanthropy

**WHEN A REAL ASSET DOESN'T FIT:** if an item is genuinely real but doesn't sit cleanly in any category, set \`category: "Other"\` and explain in description. Do NOT force-fit into the wrong slot. The taxonomy serves reality, not the other way around.

**SERVICE/OFFER NOTE:** Productized offers (paid sessions, cohort programs, retainers, paid call formats, named services) carry \`nature: "economic"\` AND \`is_offer: true\`. They typically file under Influence > Thought Leadership > Consulting/Speaking/Mentoring or Intellectual Property > Methodologies > Frameworks. Do NOT shove offers into Methodologies and call them done — flag them with \`is_offer: true\` so they're distinguishable from the underlying IP they deploy.

**THE FOUR DIMENSIONS:**

1. **Leverage** — value-creation potential (1-10 score).
2. **Maturity** — how real and deployed it is (5-value enum).
3. **Horizon** — time at which this asset operates (4-value enum).
4. **Nature** — what KIND of value this asset produces (7-value enum).

These are independent dimensions — an asset can be high-leverage AND symbolic, high-leverage AND mythic, mid-leverage AND economic, etc. Do not collapse them into one ladder.

**OUTPUT FORMAT (REQUIRED):**
Return **only** a JSON array. The FIRST entry is the Center of Gravity (see above). Every entry must include all 11 fields:
\`\`\`json
[
  {
    "type": "Center of Gravity | Expertise | Life Experiences | Networks | Material Resources | Intellectual Property | Influence",
    "subtype": "e.g. Business & Economics, Cultural Immersion — or null for the Center of Gravity entry",
    "category": "e.g. Entrepreneurship, Language Acquisition — or 'Other' or 'Root Capacity' for the Center of Gravity",
    "name": "Specific asset name (3-7 words, concrete) — or for Center of Gravity, the field-function articulation",
    "description": "1-2 sentences. What it actually IS, in plain language that preserves the user's actual register.",
    "expresses_root": "1-line: how this asset expresses or branches from the Center of Gravity. For the Center of Gravity entry itself, this is empty.",
    "maturity": "monetizable_now | usable_but_needs_packaging | latent | aspirational | symbolic_only",
    "horizon": "now | near | long_term | civilization_scale",
    "nature": "practical | relational | symbolic | infrastructural | mythic | intellectual | economic",
    "leverage_score": 1-10,
    "leverage_reason": "1 sentence: why this score, what it can produce, who would buy/share/fund it. For symbolic/mythic items, leverage means upstream-generative force, not commercial revenue.",
    "is_offer": true | false,
    "is_power_node": true | false
  }
]
\`\`\`

**MATURITY RUBRIC (UNCHANGED FROM v2):**
- \`monetizable_now\` — documented, deliverable, priced — could produce revenue THIS MONTH if activated.
- \`usable_but_needs_packaging\` — real and proven, but scattered or in your head. Two weeks of packaging from sellable.
- \`latent\` — potential is real but unproven in market.
- \`aspirational\` — relational/networked/intended access. Door exists, not yet opened for value.
- \`symbolic_only\` — mythic/biographical/sacred fuel. Real, but operationally inert RIGHT NOW. (Note: this is different from \`nature: "symbolic"\` — see below.)

**HORIZON RUBRIC (EXPANDED TO 4 VALUES):**
- \`now\` — activate this quarter for income, credibility, distribution.
- \`near\` — package or position in the next 6-18 months.
- \`long_term\` — multi-year strategic asset; matures over 2-5 years.
- \`civilization_scale\` — strategic-north-star, generational. Belongs for orientation, not for this month's plan. Does not compete with money-now items.

**NATURE RUBRIC (NEW — THE ONTOLOGICAL DIMENSION v2 MISSED):**
- \`practical\` — concrete skills, tools, deliverables, artifacts.
- \`relational\` — trust, connections, warm bonds, shared history.
- \`symbolic\` — meaning-making, narrative coherence, brand essence, archetypal resonance. (HIGH-LEVERAGE in its own right — these are upstream generators of downstream reality, NOT inert decoration.)
- \`infrastructural\` — systems, platforms, distribution rails, operational scaffolding.
- \`mythic\` — origin stories, sacred lineage, cross-domain synthesis that organizes worldview.
- \`intellectual\` — frameworks, methodologies, structured thought, IP.
- \`economic\` — commercial offers, financial instruments, productized services.

**CRITICAL — DO NOT amputate symbolic/mythic layers.** Some of the highest-leverage assets a human owns are meaning-making capacity, mythic coherence, cross-domain synthesis, deep trust fields, embodied worldview architecture. These are NOT "symbolic_only" maturity — they may be very real and currently shaping everything around them. Use \`nature: "symbolic"\` or \`nature: "mythic"\` to honor what they are; use \`maturity\` separately to indicate whether they're deployed/usable/latent.

**LEVERAGE_SCORE RUBRIC (RECALIBRATED):**
"Value" includes ALL of: revenue, credibility, strategic position, generative force, audience trust, mythic coherence. A symbolic asset that holds up your entire worldview is high-leverage. A monetizable asset that doesn't compound others is mid-leverage at best.
- **10** — load-bearing for everything else; if removed, much collapses.
- **8-9** — proven and producing value, OR upstream of multiple other assets.
- **5-7** — real but needs documentation/distribution/proof OR mid-tier generative.
- **3-4** — latent or symbolic without much downstream activation yet.
- **1-2** — present but operationally inert.

**POWER-LAW DISTRIBUTION (HARD GUARD AGAINST INFLATION):**
Most assets should land 3-5. A few at 7. One or two at 9. **At most ~5 assets should hit 8 or higher.** If you find yourself rating more than 5 assets at 8+, you are inflating — re-score. The scoreboard should look like a power law, not a participation trophy. The 27P roast on v2 caught this exact failure: 23 of 32 assets scored 6+ with six 8s, four 9s, two 10s. That's not ranking, that's flattery wearing the costume of analysis.

**IS_POWER_NODE RULE:**
Mark \`is_power_node: true\` ONLY for the 3-7 assets where, if removed, most of the leverage collapses. Default false. Most users have a small handful of true power nodes. Be ruthless. The Center of Gravity entry is automatically a power node.

**IS_OFFER RULE:**
\`true\` only for productized offers (sessions, cohorts, retainers, named services with implicit/explicit price). False for the underlying IP, methodologies, or capacities they deploy.

**TRIBAL RECOGNITION TEST (apply after writing each entry):**
Read each \`name\` + \`description\` + \`leverage_reason\` aloud as if to the user's ideal client / aligned founder / closest collaborator. Two questions:
1. Would they say *"this is exactly the person who can name what I can't"*?
2. Would the people NAMED in any relational asset recognize themselves in how they're described — or would the description feel transactional ("social proof generator," "referral source") and rupture trust if they ever saw it?
If either fails, REWRITE.

**RELATIONAL DE-DUPLICATION:**
The relationship is the asset. Testimonials, social proof, referral count, etc. are EXPRESSIONS of the relationship — not separate assets. Do NOT list both. Pick the deeper one (the relationship) and fold the expressions into its description. Same goes for: (a) the methodology vs. the productized session that uses it (mark the session \`is_offer: true\`, the methodology stays separate), (b) the audience vs. the broadcast that reached them (the audience is the asset; the broadcast is an event).

**VOICE — preserve relational texture, no LinkedIn copy:**
- Concrete > abstract. Plain English. A curious 15-year-old should grok the description.
- BUT do NOT collapse all texture into the same uniform "polished AI" register. When listing networks, name people by name with one human texture-word ("warm," "cracked-open," "in motion") instead of generic functional labels. When listing offers, describe what it actually FEELS like to receive it, not just what it produces. The user's actual register matters more than the reading-level instruction.
- Anti-pattern: descriptions that sound like landing-page copy, LinkedIn taglines, or coach-speak. If a sentence could appear on any consultant's website, rewrite it.

**SORTING (HARD RULE):**
1. Center of Gravity entry FIRST (always).
2. Then power nodes (\`is_power_node: true\`), descending leverage_score.
3. Then \`maturity: monetizable_now\`, descending leverage_score.
4. Then everything else by descending leverage_score.
5. \`maturity: symbolic_only\` LAST regardless of score (these are honest acknowledgements that aren't currently in motion).

**LANGUAGE REQUIREMENTS:**
- Plain English with concrete particulars.
- Preserve the user's actual register where you have signal for it.
- No academic jargon, no internal shorthand, no consulting-deck idioms.

**RESPONSE FORMAT:**
- Return ONLY the JSON array.
- No markdown, no preamble, no follow-up suggestions.
- End your response after the closing \`]\`.

I'm using this to map my actual deployable power AND my upstream-generative capacity, simultaneously, without flattening either dimension.`;
