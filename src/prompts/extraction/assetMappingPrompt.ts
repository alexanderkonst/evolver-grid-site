/**
 * ASSET_MAPPING_PROMPT — Day 63 v3 (Sasha 2026-05-07).
 *
 * Upgrade driven by the "Divine Roast" feedback (captured 2026-05-07):
 * the v2 prompt was producing "spiritual capitalism fog" — a flattering
 * inventory of things-the-user-has-touched rather than a strategic mirror
 * of deployable assets. Eight named failure modes; this version fixes
 * them at the prompt layer:
 *
 *  1. Confused things-touched with deployable assets
 *     → Filter language up-front: "if it cannot be activated, transferred,
 *       trusted, sold, scaled, or compounded — it is NOT an asset here."
 *  2. Inflated leverage scores (too many 8-10s)
 *     → Tightened rubric: 10 = revenue/credibility/compounding ALMOST
 *       IMMEDIATELY if acted on. 8-9 reserved for proven-and-near. 5-6 is
 *       documented-but-needs-packaging. Below 5 = latent or symbolic.
 *  3. Map flatters breadth instead of identifying command centers
 *     → New `is_power_node` boolean: explicitly mark the 5-7 assets that
 *       hold most of the leverage. Default false; true is the exception.
 *  4. Owned vs. relational vs. aspirational not distinguished
 *     → Captured in the new `maturity` enum: monetizable_now /
 *       usable_but_needs_packaging / latent / aspirational / symbolic_only.
 *  5. Money-now vs. civilization-scale undifferentiated
 *     → New `horizon` enum: now / next / later. Strategic-north-star
 *       items keep their dignity AND don't fight money-now items in the
 *       leverage ladder.
 *  6. Tribe doesn't self-recognize the output
 *     → Tribal-recognition test added to the rubric: each entry should
 *       make a high-fit reader say "this person can name what I can't."
 *  7. Taxonomy obeyed too literally; soul squeezed into dropdowns
 *     → Permission to deviate: when an asset is real but doesn't fit a
 *       taxonomy slot cleanly, mark `category` as "Other" and rely on
 *       maturity + horizon for placement.
 *  8. Spiritual-biographical decorations alongside operational leverage
 *     → Hard filter: symbolic-only items must be tagged as such; they
 *       stay in the artifact for completeness but are flagged so the
 *       UI can render them quietly.
 *
 * Schema is BACKWARDS-COMPATIBLE: new fields are additive. Pre-Day-63
 * AI responses still parse correctly via the local parser; new fields
 * default to undefined and the UI degrades gracefully.
 *
 * Companion: supabase/functions/match-assets/index.ts is updated the
 * same day to match this schema, so both paths (user pastes AI response
 * OR the edge function re-extracts) produce one consistent shape.
 */
export const ASSET_MAPPING_PROMPT = `Based on everything you know about me from our conversations, please map my **deployable assets**.

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

**WHEN A REAL ASSET DOESN'T FIT:** if an item is genuinely deployable but doesn't sit cleanly in any category, set \`category: "Other"\` and explain in the description. Do NOT force it into the wrong slot just to satisfy the schema. The form should serve reality, not the other way around.

**OUTPUT FORMAT (REQUIRED):**
Return **only** a JSON array. Every asset must include all 9 fields:
\`\`\`json
[
  {
    "type": "Expertise|Life Experiences|Networks|Material Resources|Intellectual Property|Influence",
    "subtype": "e.g. Business & Economics, Cultural Immersion, etc. — or null if Other",
    "category": "e.g. Entrepreneurship, Language Acquisition, etc. — or 'Other'",
    "name": "Specific asset name (3-7 words, concrete)",
    "description": "1-2 sentences. What it actually IS, in plain language.",
    "maturity": "monetizable_now | usable_but_needs_packaging | latent | aspirational | symbolic_only",
    "horizon": "now | next | later",
    "leverage_score": 1-10,
    "leverage_reason": "1 sentence: why this score, what it can produce, who would buy/share/fund it",
    "is_power_node": true | false
  }
]
\`\`\`

**MATURITY RUBRIC (the hidden axis the v2 prompt missed):**
- \`monetizable_now\` — can produce money, bookings, or signed contracts THIS MONTH if activated. Documented, deliverable, priced.
- \`usable_but_needs_packaging\` — real and proven, but currently lives in your head or in scattered artifacts. Two weeks of packaging from sellable.
- \`latent\` — potential is real but unproven in the market. Untested or undocumented.
- \`aspirational\` — relational/networked/intended access. You know the door exists; you have not opened it for revenue or distribution yet.
- \`symbolic_only\` — mythic, biographical, or sacred fuel. Real, but operationally inert today. Tag honestly so the map doesn't masquerade dreams as weapons.

**HORIZON RUBRIC:**
- \`now\` — activate this quarter for income, credibility, or distribution.
- \`next\` — package or position this in the next 6 months once \`now\` items are running.
- \`later\` — civilization-scale or strategic-north-star. Belongs in the map for orientation, not for this month's plan.

**LEVERAGE_SCORE RUBRIC (TIGHTER):**
- **10** — generates revenue, credibility, or strategic compounding ALMOST IMMEDIATELY if acted on. Reserve for the very few. (e.g. "the productized service that books $5K conversations next week.")
- **8-9** — proven and near. Either has produced value before or is one packaging-step away.
- **5-7** — real but needs documentation, distribution, or proof. Mid-leverage.
- **3-4** — latent or symbolic. Not currently moving reality.
- **1-2** — present but operationally inert.

If you have more than ~5 items at score 8+, you are inflating. Re-score harshly. The scoreboard should look like a power law, not a participation trophy.

**IS_POWER_NODE RULE:**
Mark \`is_power_node: true\` ONLY for the 5-7 assets that, if removed, would collapse most of the leverage. The rest are support material, fuel, or future optionality — \`false\`. Most users have a small handful of true power nodes. Be ruthless.

**TRIBAL RECOGNITION TEST (apply after writing each entry):**
Read each \`name\` + \`description\` + \`leverage_reason\` aloud as if to your ideal client / aligned founder / future collaborator. Would they say "Holy shit — this person can name the thing I could never name"? OR would they say "Okay, this person has many interests"? Only the first type passes. Rewrite if not.

**DE-DUPLICATION:**
Merge near-duplicates into a single asset. Prefer the most specific wording and fold similar items into the description.

**SORTING (HARD RULE):**
After all entries are scored, sort the array by:
1. \`is_power_node: true\` first (descending leverage_score within power nodes)
2. \`maturity: monetizable_now\` next (descending leverage_score)
3. Everything else, descending leverage_score
4. \`maturity: symbolic_only\` LAST regardless of score (these are honest acknowledgements, not action items)

**LANGUAGE REQUIREMENTS:**
- Plain language a curious 15-year-old could grok
- No jargon, no academic vocabulary, no internal shorthand
- Concrete > abstract: "Top Talent Method (named-talent → productized session)" beats "Methodology for human flourishing"

**RESPONSE FORMAT:**
- Return ONLY the JSON array
- No markdown, no preamble, no follow-up suggestions
- End your response after the closing \`]\`

I'm using this to map my actual deployable power, not to inventory everything I've ever touched.`;
