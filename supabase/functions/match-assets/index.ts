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

    // Day 63 (Sasha 2026-05-07) v3 prompt — aligned with the user-facing
    // ASSET_MAPPING_PROMPT upgrade (src/prompts/extraction/assetMappingPrompt.ts).
    // Same five new dimensions: maturity (5-value enum), horizon (now/next/later),
    // is_power_node (boolean), tightened leverage_score rubric (10 = revenue
    // ALMOST IMMEDIATELY if acted on), and explicit "things-touched ≠
    // deployable assets" filter. Driven by the "Divine Roast" feedback —
    // the prior prompt produced a flattering inventory rather than an
    // operational power map. Both extractors (this AI gateway path and
    // the user-AI paste path) now produce one consistent shape so the
    // client doesn't have to fork on which extractor ran.
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
            content: `You are a strategic asset extraction assistant. Given a user's description of their resources, you map their DEPLOYABLE POWER — not their biography.

THE CENTRAL FILTER: A real asset is something that can be activated, transferred, trusted, sold, scaled, or compounded. Things-touched ≠ deployable assets. If an item cannot move reality this month, it is either symbolic, aspirational, or latent — and you must tag it accordingly, not pretend it's a weapon.

For every candidate, ask:
1. Is it real now (not a plan, not an intention)?
2. Owned by the user (vs. relational, borrowed, aspirational)?
3. Can it create value this month?
4. Can someone else understand it cold?
5. Can someone buy it, share it, fund it, or build with it?

Return a JSON array. Every asset MUST have all 7 fields:
- "category": Best match from the provided list, format "Type > SubType > Title". If genuinely deployable but no fit, use "Other > Other > Other" and explain in description.
- "name": Specific, concrete asset name (3-7 words).
- "description": 1-2 sentences. What it actually IS, in plain language.
- "why_value": 1 sentence. What it can produce; who would buy / share / fund / build with it.
- "maturity": One of "monetizable_now" | "usable_but_needs_packaging" | "latent" | "aspirational" | "symbolic_only".
- "horizon": One of "now" | "next" | "later".
- "leverage_score": 1-10.
- "is_power_node": boolean. True ONLY for the 5-7 assets that hold most of the leverage. Default false.

MATURITY RUBRIC:
- monetizable_now: documented, deliverable, priced — could produce revenue THIS MONTH.
- usable_but_needs_packaging: real and proven, but lives in user's head or scattered artifacts. Two weeks of packaging from sellable.
- latent: potential real but unproven in market.
- aspirational: relational / networked / intended access. Door exists, not yet opened for value.
- symbolic_only: mythic / biographical / sacred fuel. Real but operationally inert today. Tag honestly.

HORIZON:
- now: activate this quarter.
- next: package in 6 months once "now" items are running.
- later: strategic-north-star or civilization-scale. Belongs for orientation, not this month's plan.

LEVERAGE_SCORE (HARSH):
- 10: revenue / credibility / strategic compounding ALMOST IMMEDIATELY if acted on. Reserve for very few.
- 8-9: proven and near. Has produced value before or one packaging-step away.
- 5-7: real but needs documentation, distribution, or proof.
- 3-4: latent or symbolic. Not currently moving reality.
- 1-2: present but operationally inert.

If more than ~5 items hit 8+, you are inflating. Re-score. The scoreboard should look like a power law, not a participation trophy.

IS_POWER_NODE: true only for items where, if removed, most of the leverage collapses. Most users have a small handful. Be ruthless.

Sort the final array by: power nodes first (desc leverage_score), then monetizable_now (desc), then everything else (desc), with symbolic_only LAST regardless of score.

Rules:
- Never empty name or description.
- Plain language a curious 15-year-old could grok. No jargon.
- Return ONLY a JSON array, no markdown, no preamble.

Example output:
[
  {
    "category": "Intellectual Property > Methodologies > Frameworks",
    "name": "Top Talent Method (named-gift → session)",
    "description": "A 4-step assessment that names a person's irreducible signature talent and turns it into a sellable session offer.",
    "why_value": "The user can run a paid 90-min session next week using the existing prompt + reveal page.",
    "maturity": "monetizable_now",
    "horizon": "now",
    "leverage_score": 10,
    "is_power_node": true
  },
  {
    "category": "Influence > Industry Recognition > Awards",
    "name": "MIT credibility line",
    "description": "Educational credential that opens doors with founders, investors, and corporate partners.",
    "why_value": "Compounds with every public mention; near-zero marginal cost to deploy.",
    "maturity": "monetizable_now",
    "horizon": "now",
    "leverage_score": 9,
    "is_power_node": true
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
      horizon?: "now" | "next" | "later";
      leverage_score?: number;
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
    // client doesn't render a garbage badge.
    const MATURITY_VALUES = new Set([
      "monetizable_now",
      "usable_but_needs_packaging",
      "latent",
      "aspirational",
      "symbolic_only",
    ]);
    const HORIZON_VALUES = new Set(["now", "next", "later"]);

    const validatedMatches = matches
      .filter((m) => m.category && m.name && m.description && m.why_value)
      .map((m) => ({
        category: m.category,
        name: m.name,
        description: m.description,
        why_value: m.why_value,
        maturity: m.maturity && MATURITY_VALUES.has(m.maturity) ? m.maturity : undefined,
        horizon: m.horizon && HORIZON_VALUES.has(m.horizon) ? m.horizon : undefined,
        leverage_score:
          typeof m.leverage_score === "number" &&
          m.leverage_score >= 1 &&
          m.leverage_score <= 10
            ? Math.round(m.leverage_score)
            : undefined,
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
