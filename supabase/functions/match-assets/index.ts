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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an asset extraction assistant. Given a user's description of their assets, skills, or resources, extract each distinct asset and categorize it.

For EACH asset mentioned, return a structured object with:
- "category": The best matching category from the provided list (use the format "Type > SubType > Title")
- "name": A concise asset name (3-6 words). If input has "Asset: X", use X. Otherwise derive from first clause.
- "description": 1-2 sentences describing what this asset is or does.
- "why_value": 1 sentence explaining why this asset is valuable or how it can be leveraged.

Rules:
- Never return empty name or description fields.
- Each asset must have all 4 fields.
- Return ONLY a JSON array, no markdown.

Example output:
[
  {
    "category": "Material Resources > Digital Assets > Digital Content Libraries",
    "name": "Content + distribution channels",
    "description": "Multi-channel distribution strategy for short-form and long-form content across YouTube, Instagram, X, Telegram, WhatsApp, FB.",
    "why_value": "Built-in go-to-market rails for funnels, launches, and community onboarding."
  }
]`
          },
          {
            role: "user",
            content: `Extract and categorize the assets from this text:\n\n"${text}"\n\nAvailable categories:\n${categoryList}\n\nReturn up to ${limit} extracted assets as a JSON array.`
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

    // Parse the AI response - extract JSON from potential markdown
    let matches: Array<{ category: string; name: string; description: string; why_value: string }> = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      matches = [];
    }

    // Validate and filter matches - ensure all required fields are present
    const validatedMatches = matches
      .filter(m => m.category && m.name && m.description && m.why_value)
      .map(m => ({
        category: m.category,
        name: m.name,
        description: m.description,
        why_value: m.why_value,
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
