import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Asset taxonomy - embedded for AI ranking
const ASSET_CATEGORIES = [
  { id: "professional-science", type: "Expertise", subType: "Scientific & Technical", title: "Professional" },
  { id: "life-sciences", type: "Expertise", subType: "Scientific & Technical", title: "Life Sciences" },
  { id: "engineering", type: "Expertise", subType: "Scientific & Technical", title: "Engineering" },
  { id: "information-technology", type: "Expertise", subType: "Scientific & Technical", title: "Information Technology" },
  { id: "mathematics", type: "Expertise", subType: "Scientific & Technical", title: "Mathematics" },
  { id: "management", type: "Expertise", subType: "Business & Economics", title: "Management" },
  { id: "finance", type: "Expertise", subType: "Business & Economics", title: "Finance" },
  { id: "marketing", type: "Expertise", subType: "Business & Economics", title: "Marketing" },
  { id: "entrepreneurship", type: "Expertise", subType: "Business & Economics", title: "Entrepreneurship" },
  { id: "economics", type: "Expertise", subType: "Business & Economics", title: "Economics" },
  { id: "visual-arts", type: "Expertise", subType: "Arts & Humanities", title: "Visual Arts" },
  { id: "performing-arts", type: "Expertise", subType: "Arts & Humanities", title: "Performing Arts" },
  { id: "literature", type: "Expertise", subType: "Arts & Humanities", title: "Literature" },
  { id: "philosophy", type: "Expertise", subType: "Arts & Humanities", title: "Philosophy" },
  { id: "history", type: "Expertise", subType: "Arts & Humanities", title: "History" },
  { id: "psychology", type: "Expertise", subType: "Social Sciences", title: "Psychology" },
  { id: "sociology", type: "Expertise", subType: "Social Sciences", title: "Sociology" },
  { id: "anthropology", type: "Expertise", subType: "Social Sciences", title: "Anthropology" },
  { id: "political-science", type: "Expertise", subType: "Social Sciences", title: "Political Science" },
  { id: "education", type: "Expertise", subType: "Social Sciences", title: "Education" },
  { id: "healthcare", type: "Expertise", subType: "Applied Fields", title: "Healthcare" },
  { id: "law", type: "Expertise", subType: "Applied Fields", title: "Law" },
  { id: "environmental-studies", type: "Expertise", subType: "Applied Fields", title: "Environmental Studies" },
  { id: "urban-planning", type: "Expertise", subType: "Applied Fields", title: "Urban Planning" },
  { id: "agriculture", type: "Expertise", subType: "Applied Fields", title: "Agriculture" },
  { id: "self-discovery", type: "Life Experiences", subType: "Personal Growth", title: "Self-discovery" },
  { id: "overcoming-challenges", type: "Life Experiences", subType: "Personal Growth", title: "Overcoming Challenges" },
  { id: "spiritual-journeys", type: "Life Experiences", subType: "Personal Growth", title: "Spiritual Journeys" },
  { id: "relationships", type: "Life Experiences", subType: "Personal Growth", title: "Relationships" },
  { id: "health-transformations", type: "Life Experiences", subType: "Personal Growth", title: "Health Transformations" },
  { id: "long-term-travel", type: "Life Experiences", subType: "Cultural Immersion", title: "Long-term Travel" },
  { id: "living-abroad", type: "Life Experiences", subType: "Cultural Immersion", title: "Living Abroad" },
  { id: "language-acquisition", type: "Life Experiences", subType: "Cultural Immersion", title: "Language Acquisition" },
  { id: "cultural-studies", type: "Life Experiences", subType: "Cultural Immersion", title: "Cultural Studies" },
  { id: "intercultural-projects", type: "Life Experiences", subType: "Cultural Immersion", title: "Intercultural Projects" },
  { id: "volunteering", type: "Life Experiences", subType: "Humanitarian & Service", title: "Volunteering" },
  { id: "social-work", type: "Life Experiences", subType: "Humanitarian & Service", title: "Social Work" },
  { id: "peace-corps", type: "Life Experiences", subType: "Humanitarian & Service", title: "Peace Corps" },
  { id: "disaster-relief", type: "Life Experiences", subType: "Humanitarian & Service", title: "Disaster Relief" },
  { id: "community-building", type: "Life Experiences", subType: "Humanitarian & Service", title: "Community Building" },
  { id: "wilderness-expeditions", type: "Life Experiences", subType: "Nature & Adventure", title: "Wilderness Expeditions" },
  { id: "environmental-conservation", type: "Life Experiences", subType: "Nature & Adventure", title: "Environmental Conservation" },
  { id: "extreme-sports", type: "Life Experiences", subType: "Nature & Adventure", title: "Extreme Sports" },
  { id: "wildlife-interaction", type: "Life Experiences", subType: "Nature & Adventure", title: "Wildlife Interaction" },
  { id: "sustainable-living", type: "Life Experiences", subType: "Nature & Adventure", title: "Sustainable Living" },
  { id: "industry-associations", type: "Networks", subType: "Professional", title: "Industry Associations" },
  { id: "alumni-networks", type: "Networks", subType: "Professional", title: "Alumni Networks" },
  { id: "professional-societies", type: "Networks", subType: "Professional", title: "Professional Societies" },
  { id: "mentorship-circles", type: "Networks", subType: "Professional", title: "Mentorship Circles" },
  { id: "entrepreneurial-ecosystems", type: "Networks", subType: "Professional", title: "Entrepreneurial Ecosystems" },
  { id: "local-organizations", type: "Networks", subType: "Community", title: "Local Organizations" },
  { id: "volunteer-groups", type: "Networks", subType: "Community", title: "Volunteer Groups" },
  { id: "spiritual-communities", type: "Networks", subType: "Community", title: "Spiritual Communities" },
  { id: "hobby-clubs", type: "Networks", subType: "Community", title: "Hobby Clubs" },
  { id: "neighborhood-associations", type: "Networks", subType: "Community", title: "Neighborhood Associations" },
  { id: "trade-groups", type: "Networks", subType: "Industry", title: "Trade Groups" },
  { id: "research-consortiums", type: "Networks", subType: "Industry", title: "Research Consortiums" },
  { id: "standards-bodies", type: "Networks", subType: "Industry", title: "Standards Bodies" },
  { id: "innovation-hubs", type: "Networks", subType: "Industry", title: "Innovation Hubs" },
  { id: "industry-forums", type: "Networks", subType: "Industry", title: "Industry-Specific Forums" },
  { id: "international-ngos", type: "Networks", subType: "Global", title: "International NGOs" },
  { id: "cultural-exchange", type: "Networks", subType: "Global", title: "Cultural Exchange Programs" },
  { id: "global-think-tanks", type: "Networks", subType: "Global", title: "Global Think Tanks" },
  { id: "multinational-collaborations", type: "Networks", subType: "Global", title: "Multinational Collaborations" },
  { id: "diaspora-networks", type: "Networks", subType: "Global", title: "Diaspora Networks" },
  { id: "liquid-savings", type: "Material Resources", subType: "Financial Capital", title: "Liquid Savings" },
  { id: "investment-portfolio", type: "Material Resources", subType: "Financial Capital", title: "Investment Portfolio" },
  { id: "income-streams", type: "Material Resources", subType: "Financial Capital", title: "Income Streams" },
  { id: "credit-access", type: "Material Resources", subType: "Financial Capital", title: "Credit Access" },
  { id: "domains-websites", type: "Material Resources", subType: "Digital Assets", title: "Domains & Websites" },
  { id: "email-lists", type: "Material Resources", subType: "Digital Assets", title: "Email Lists & Subscribers" },
  { id: "software-accounts", type: "Material Resources", subType: "Digital Assets", title: "Software & API Access" },
  { id: "digital-content", type: "Material Resources", subType: "Digital Assets", title: "Digital Content Libraries" },
  { id: "angel-investing", type: "Material Resources", subType: "Investment Interests", title: "Angel Investing" },
  { id: "seed-funding", type: "Material Resources", subType: "Investment Interests", title: "Seed Funding" },
  { id: "series-funding", type: "Material Resources", subType: "Investment Interests", title: "Series A-C" },
  { id: "growth-capital", type: "Material Resources", subType: "Investment Interests", title: "Growth Capital" },
  { id: "impact-investing", type: "Material Resources", subType: "Investment Interests", title: "Impact Investing" },
  { id: "philanthropy", type: "Material Resources", subType: "Investment Interests", title: "Philanthropy" },
  { id: "offices", type: "Material Resources", subType: "Physical Space", title: "Offices" },
  { id: "workshops", type: "Material Resources", subType: "Physical Space", title: "Workshops" },
  { id: "land", type: "Material Resources", subType: "Physical Space", title: "Land" },
  { id: "venues", type: "Material Resources", subType: "Physical Space", title: "Venues" },
  { id: "retreat-centers", type: "Material Resources", subType: "Physical Space", title: "Retreat Centers" },
  { id: "technology-equipment", type: "Material Resources", subType: "Equipment", title: "Technology" },
  { id: "machinery", type: "Material Resources", subType: "Equipment", title: "Machinery" },
  { id: "vehicles", type: "Material Resources", subType: "Equipment", title: "Vehicles" },
  { id: "scientific-instruments", type: "Material Resources", subType: "Equipment", title: "Scientific Instruments" },
  { id: "artistic-tools", type: "Material Resources", subType: "Equipment", title: "Artistic Tools" },
  { id: "water-sources", type: "Material Resources", subType: "Natural Resources", title: "Water Sources" },
  { id: "energy-resources", type: "Material Resources", subType: "Natural Resources", title: "Energy Resources" },
  { id: "agricultural-land", type: "Material Resources", subType: "Natural Resources", title: "Agricultural Land" },
  { id: "forests", type: "Material Resources", subType: "Natural Resources", title: "Forests" },
  { id: "mineral-deposits", type: "Material Resources", subType: "Natural Resources", title: "Mineral Deposits" },
  { id: "patents", type: "Intellectual Property", subType: "Innovations", title: "Patents" },
  { id: "inventions", type: "Intellectual Property", subType: "Innovations", title: "Inventions" },
  { id: "algorithms", type: "Intellectual Property", subType: "Innovations", title: "Algorithms" },
  { id: "prototypes", type: "Intellectual Property", subType: "Innovations", title: "Prototypes" },
  { id: "novel-applications", type: "Intellectual Property", subType: "Innovations", title: "Novel Applications" },
  { id: "frameworks", type: "Intellectual Property", subType: "Methodologies", title: "Frameworks" },
  { id: "processes", type: "Intellectual Property", subType: "Methodologies", title: "Processes" },
  { id: "systems", type: "Intellectual Property", subType: "Methodologies", title: "Systems" },
  { id: "techniques", type: "Intellectual Property", subType: "Methodologies", title: "Techniques" },
  { id: "approaches", type: "Intellectual Property", subType: "Methodologies", title: "Approaches" },
  { id: "writing", type: "Intellectual Property", subType: "Creative Works", title: "Writing" },
  { id: "artwork", type: "Intellectual Property", subType: "Creative Works", title: "Artwork" },
  { id: "music", type: "Intellectual Property", subType: "Creative Works", title: "Music" },
  { id: "software", type: "Intellectual Property", subType: "Creative Works", title: "Software" },
  { id: "designs", type: "Intellectual Property", subType: "Creative Works", title: "Designs" },
  { id: "publishing", type: "Influence", subType: "Thought Leadership", title: "Publishing" },
  { id: "speaking", type: "Influence", subType: "Thought Leadership", title: "Speaking" },
  { id: "consulting", type: "Influence", subType: "Thought Leadership", title: "Consulting" },
  { id: "mentoring", type: "Influence", subType: "Thought Leadership", title: "Mentoring" },
  { id: "academic-influence", type: "Influence", subType: "Thought Leadership", title: "Academic Influence" },
  { id: "social-media", type: "Influence", subType: "Media Reach", title: "Social Media" },
  { id: "traditional-media", type: "Influence", subType: "Media Reach", title: "Traditional Media" },
  { id: "podcasts", type: "Influence", subType: "Media Reach", title: "Podcasts" },
  { id: "blogs", type: "Influence", subType: "Media Reach", title: "Blogs" },
  { id: "video-platforms", type: "Influence", subType: "Media Reach", title: "Video Platforms" },
  { id: "awards", type: "Influence", subType: "Industry Recognition", title: "Awards" },
  { id: "board-positions", type: "Influence", subType: "Industry Recognition", title: "Board Positions" },
  { id: "expert-status", type: "Influence", subType: "Industry Recognition", title: "Expert Status" },
  { id: "patent-citation", type: "Influence", subType: "Industry Recognition", title: "Patent Citation" },
  { id: "peer-recognition", type: "Influence", subType: "Industry Recognition", title: "Peer Recognition" },
  { id: "local-leadership", type: "Influence", subType: "Community Impact", title: "Local Leadership" },
  { id: "grassroots-organizing", type: "Influence", subType: "Community Impact", title: "Grassroots Organizing" },
  { id: "policy-influence", type: "Influence", subType: "Community Impact", title: "Policy Influence" },
  { id: "social-movements", type: "Influence", subType: "Community Impact", title: "Social Movements" },
  { id: "philanthropy-impact", type: "Influence", subType: "Community Impact", title: "Philanthropy" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, limit = 6 } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build asset category list for AI
    const categoryList = ASSET_CATEGORIES.map((a) =>
      `- ${a.type} > ${a.subType} > ${a.title}`
    ).join("\n");

    // Day 63 evening (Sasha 2026-05-07) v3 prompt — aligned with the
    // user-facing ASSET_MAPPING_PROMPT v3 upgrade. Adds three things on
    // top of the morning's v2:
    //   1. NATURE field (7-value enum: practical | relational | symbolic
    //      | infrastructural | mythic | intellectual | economic) so
    //      symbolic/mythic capacity isn't amputated as "symbolic_only."
    //   2. HORIZON expanded from 3 values to 4 (added civilization_scale).
    //   3. CENTER OF GRAVITY meta-asset as the FIRST array entry: a
    //      named root field-function the user runs on the world; every
    //      subsequent asset has `expresses_root` linking back to it.
    //   4. is_offer boolean to distinguish productized services from
    //      the underlying IP they deploy.
    //   5. Leverage rubric recalibrated — load-bearing matters more
    //      than commercial-actionable-now. Symbolic capacity that holds
    //      up everything else can score 9 honestly.
    //   6. Power-law distribution enforced — at most ~5 assets at 8+.
    // Both extractors (this AI gateway path and the user-AI paste path)
    // produce one consistent shape so the client doesn't have to fork
    // on which extractor ran.
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a strategic asset extraction assistant. Given a user's description of their resources, you map their DEPLOYABLE POWER AND UPSTREAM-GENERATIVE CAPACITY across four simultaneous dimensions: leverage, maturity, time horizon, and nature.

CRITICAL — DO NOT amputate symbolic / mythic / meaning-making layers. Some of the highest-leverage assets a human owns are NOT directly monetizable: meaning-making capacity, mythic coherence, cross-domain synthesis, deep trust fields, embodied worldview architecture. These are upstream generators of downstream reality. Tag them with nature: symbolic / mythic and let them score high on leverage when they hold up everything else.

FIRST — name the user's CENTER OF GRAVITY (root capacity).
Before listing assets, articulate the deeper field-function the user runs on the world. This is usually a verb-phrase capacity, not a noun. The Center of Gravity is the FIRST entry in the array, with type: "Center of Gravity", category: "Root Capacity", subtype: null. Its name IS the field-function articulation in one sentence.

Return a JSON array. Every asset MUST have all 11 fields:
- "category": Best match from the provided list as "Type > SubType > Title". For Center of Gravity entry: "Center of Gravity > Root Capacity > <short label>". If a real asset doesn't fit, use "Other > Other > Other" and explain in description.
- "name": Specific, concrete asset name (3-7 words). For Center of Gravity, the field-function articulation as one sentence.
- "description": 1-2 sentences. What it actually IS, in plain language that preserves relational texture (no LinkedIn copy, no "social proof generator" labels).
- "why_value": 1 sentence. What it can produce; what it holds up. For symbolic/mythic items, why_value means upstream-generative force, not commercial revenue.
- "expresses_root": 1 line — how this asset expresses or branches from the Center of Gravity. Empty string for the Center of Gravity entry itself.
- "maturity": "monetizable_now" | "usable_but_needs_packaging" | "latent" | "aspirational" | "symbolic_only".
- "horizon": "now" | "near" | "long_term" | "civilization_scale".
- "nature": "practical" | "relational" | "symbolic" | "infrastructural" | "mythic" | "intellectual" | "economic".
- "leverage_score": 1-10.
- "is_offer": boolean. True only for productized offers (paid sessions, cohorts, retainers, named services). False for the underlying IP they deploy.
- "is_power_node": boolean. True only for the 3-7 assets where, if removed, most of the leverage collapses.

MATURITY (UNCHANGED — about deployment readiness, NOT about value):
- monetizable_now / usable_but_needs_packaging / latent / aspirational / symbolic_only

HORIZON (4 VALUES):
- now: activate this quarter.
- near: package in 6-18 months.
- long_term: 2-5 year strategic asset.
- civilization_scale: generational, north-star. Doesn't compete with money-now items.

NATURE (7 VALUES — the ontological dimension):
- practical: concrete skills/tools/deliverables.
- relational: trust, connections, warm bonds, shared history.
- symbolic: meaning-making, narrative coherence, brand essence, archetypal resonance. (HIGH-LEVERAGE in its own right.)
- infrastructural: systems, platforms, distribution rails, operational scaffolding.
- mythic: origin stories, sacred lineage, cross-domain synthesis that organizes worldview.
- intellectual: frameworks, methodologies, structured thought, IP.
- economic: commercial offers, financial instruments, productized services.

LEVERAGE_SCORE (RECALIBRATED):
"Value" includes ALL of: revenue, credibility, strategic position, generative force, audience trust, mythic coherence. A symbolic asset that holds up an entire worldview is high-leverage.
- 10: load-bearing; if removed, much collapses.
- 8-9: proven and producing value, OR upstream of multiple other assets.
- 5-7: real but mid-tier — needs distribution OR moderate generative.
- 3-4: latent or low-activation symbolic.
- 1-2: present but operationally inert.

POWER-LAW DISTRIBUTION (HARD GUARD):
Most assets land 3-5. A few at 7. One or two at 9. AT MOST ~5 ASSETS HIT 8+. If you find more than 5 at 8+, you are inflating — re-score harshly.

IS_POWER_NODE: true only for the 3-7 load-bearing assets. Center of Gravity is automatically a power node.

IS_OFFER: true for productized offers; false for the IP/methodology they deploy. Don't shove offers into Methodology tags — flag them with is_offer instead.

RELATIONAL DE-DUPLICATION:
The relationship IS the asset. Testimonials, referral counts, social proof are EXPRESSIONS of the relationship — fold them into the relationship's description, do not list separately. Same for: methodology vs. session that uses it, audience vs. broadcast that reached them.

TRIBAL RECOGNITION:
For each entry, ask: would the people NAMED recognize themselves in how they're described? "Social proof generator" / "referral source" framing strips relational texture and ruptures trust. Name people by name with one human texture-word ("warm," "cracked-open," "in motion") not generic function labels.

SORTING:
1. Center of Gravity entry FIRST.
2. Then power nodes (desc leverage_score).
3. Then maturity=monetizable_now (desc).
4. Then everything else (desc).
5. maturity=symbolic_only LAST regardless of score.

Rules:
- Never empty name, description, expresses_root (except Center of Gravity), or why_value.
- Plain English with concrete particulars; preserve user's relational texture.
- Return ONLY the JSON array, no markdown, no preamble.

Example output (excerpt — first 2 entries):
[
  {
    "category": "Center of Gravity > Root Capacity > Essence-naming field-function",
    "name": "The capacity to perceive latent essence in people and systems, articulate it clearly, and reorganize reality around it.",
    "description": "The user's deeper field-function: not a noun-asset but a verb-capacity that runs upstream of everything they make.",
    "why_value": "Every other asset in the map is a downstream expression of this; if absent, none of the others would coalesce.",
    "expresses_root": "",
    "maturity": "monetizable_now",
    "horizon": "long_term",
    "nature": "intellectual",
    "leverage_score": 10,
    "is_offer": false,
    "is_power_node": true,
    "type": "Center of Gravity",
    "subtype": null
  },
  {
    "category": "Intellectual Property > Methodologies > Frameworks",
    "name": "Top Talent Method",
    "description": "A 4-step assessment that names a person's irreducible signature talent and articulates it into productized form.",
    "why_value": "Direct downstream expression of the field-function; can become a signed paid session next week.",
    "expresses_root": "Operationalizes the essence-naming capacity into a repeatable artifact.",
    "maturity": "monetizable_now",
    "horizon": "now",
    "nature": "intellectual",
    "leverage_score": 9,
    "is_offer": false,
    "is_power_node": true,
    "type": "Intellectual Property",
    "subtype": "Methodologies"
  }
]`
          },
          {
            role: "user",
            content: `Extract and map the user's deployable assets from this text:\n\n"${text}"\n\nAvailable categories:\n${categoryList}\n\nReturn up to ${limit} extracted assets as a JSON array, sorted per the rubric above.`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI matching failed");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "[]";

    // Day 63 (Sasha 2026-05-07): response shape extended with the new
    // dimensions from the v3 prompt — maturity, horizon, leverage_score,
    // is_power_node. The first four core fields stay required; the new
    // fields are passed through when present (graceful for any model
    // that drops a field). Validation rejects anything missing the four
    // core fields so the client can still render meaningful cards.
    type EdgeMatchOut = {
      category: string;
      name: string;
      description: string;
      why_value: string;
      maturity?: "monetizable_now" | "usable_but_needs_packaging" | "latent" | "aspirational" | "symbolic_only";
      // Day 63 v3 — horizon expanded from 3 values to 4. v2's "next" still
      // accepted via legacy mapping below for backwards compat with any
      // model that hasn't picked up the new prompt yet.
      horizon?: "now" | "near" | "long_term" | "civilization_scale" | "next" | "later";
      // Day 63 v3 — nature ontological tag (7 values) preserves symbolic /
      // mythic capacity dignity instead of v2's flatten-to-symbolic_only.
      nature?: "practical" | "relational" | "symbolic" | "infrastructural" | "mythic" | "intellectual" | "economic";
      expresses_root?: string;
      leverage_score?: number;
      is_offer?: boolean;
      is_power_node?: boolean;
    };

    let matches: EdgeMatchOut[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      matches = [];
    }

    // Allowed enum values — drop unknown values to undefined so the
    // client doesn't render a garbage badge. Day 63 v3 adds NATURE
    // (7 values) and expands HORIZON to 4 values. Legacy v2 horizon
    // values (next/later) are mapped forward to v3 equivalents so
    // models that haven't picked up the new prompt still produce
    // valid output.
    const MATURITY_VALUES = new Set([
      "monetizable_now",
      "usable_but_needs_packaging",
      "latent",
      "aspirational",
      "symbolic_only",
    ]);
    const HORIZON_VALUES = new Set([
      "now",
      "near",
      "long_term",
      "civilization_scale",
    ]);
    const NATURE_VALUES = new Set([
      "practical",
      "relational",
      "symbolic",
      "infrastructural",
      "mythic",
      "intellectual",
      "economic",
    ]);
    // v2 → v3 horizon back-compat mapping. Older models may still emit
    // "next" or "later"; we map them forward to keep validation passing.
    const mapLegacyHorizon = (h: string | undefined): string | undefined => {
      if (!h) return undefined;
      if (HORIZON_VALUES.has(h)) return h;
      if (h === "next") return "near";
      if (h === "later") return "long_term";
      return undefined;
    };

    const validatedMatches = matches
      .filter((m) => m.category && m.name && m.description && m.why_value)
      .map((m) => ({
        category: m.category,
        name: m.name,
        description: m.description,
        why_value: m.why_value,
        expresses_root:
          typeof m.expresses_root === "string" ? m.expresses_root.trim() || undefined : undefined,
        maturity: m.maturity && MATURITY_VALUES.has(m.maturity) ? m.maturity : undefined,
        horizon: mapLegacyHorizon(m.horizon),
        nature: m.nature && NATURE_VALUES.has(m.nature) ? m.nature : undefined,
        leverage_score:
          typeof m.leverage_score === "number" &&
          m.leverage_score >= 1 &&
          m.leverage_score <= 10
            ? Math.round(m.leverage_score)
            : undefined,
        is_offer: typeof m.is_offer === "boolean" ? m.is_offer : false,
        is_power_node: typeof m.is_power_node === "boolean" ? m.is_power_node : false,
      }));

    return new Response(
      JSON.stringify({ matches: validatedMatches }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("match-assets error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
