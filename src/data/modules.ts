import { Module } from "@/types/module";

export const modules: Module[] = [
  {
    id: "1",
    title: "DESTINY: YOUR UNIQUE GENIUS BUSINESS",
    slug: "destiny",
    category: "Business",
    tagline: "Activate your genius and design your core offer",
    status: "Live",
    price: "10% of new revenue capped at $3k",
    version: "v1.0",
    hero_CTA_label: "Book an Excalibur Call",
    hero_CTA_link: "https://calendly.com/your-link", // Replace with actual Calendly link
    space: "BUILD",
    versionNumber: "0.7",
    versionStage: "Alpha",
    startRoute: "/game/me/genius-business",
    description: "<p>Destiny: Your Unique Genius Business is a transformative program designed to help you uncover your unique genius and crystallize it into a compelling core offer. Through a series of powerful exercises and frameworks, you'll discover what makes you irreplaceable and how to share that gift with the world.</p>",
    who_for: [
      "Coaches and consultants seeking clarity on their offer",
      "Creative professionals ready to define their niche",
      "Entrepreneurs building their personal brand",
      "Change-makers wanting to amplify their impact"
    ],
    outcomes: [
      "Crystal-clear understanding of your unique genius",
      "A compelling core offer that resonates",
      "Confidence in your value proposition",
      "A roadmap for bringing your vision to life"
    ],
    structure: [
      "Discovery: Uncover your natural talents and passions",
      "Crystallization: Define your unique value proposition",
      "Design: Craft your signature offer",
      "Activation: Launch strategy and next steps"
    ],
    story: "Destiny emerged from working with hundreds of talented individuals who struggled to articulate their unique value. This program distills that experience into a clear pathway for building a business around your genius.",
  },
  {
    id: "10",
    title: "GENIUS-LAYER MATCHING",
    slug: "genius-layer-matching",
    category: "Business",
    tagline: "Stop guessing co-founder fit. Match on how people are built to play.",
    status: "Live",
    version: "v1.0",
    hero_CTA_label: "Talk to Aleksandr about a pilot",
    hero_CTA_link: "https://www.calendly.com/konstantinov",
    space: "BUILD",
    versionNumber: "0.7",
    versionStage: "Alpha",
    description: "<p>Add a 'genius layer' to your founder matching. We use Zone-of-Genius assessments to surface each founder's deep operating pattern, then generate smarter matches for venture studios, accelerators, and founder programs.</p>",
    who_for: [
      "Venture studios curating founder teams",
      "Accelerators running cohort matching",
      "Founder programs seeking better team formation"
    ],
    outcomes: [
      "Fewer mis-matched founder pairs",
      "Faster trust and role-clarity in new teams",
      "Differentiated 'we see you' experience for founders"
    ],
    structure: [
      "30-min exploratory call",
      "5-10 founders take Zone-of-Genius assessment",
      "3-way A/B pilot with debrief",
      "Clear recommendations for rollout"
    ],
    story: "Most founder programs match on ideas and CVs. But what makes or breaks teams is how people operate. This pilot adds a high-signal 'genius layer' to see if smarter matching actually works.",
    app_links: [
      { label: "Book a Pilot Call", url: "https://www.calendly.com/konstantinov" }
    ]
  },
  {
    id: "9",
    title: "GENIUS OFFER SNAPSHOT",
    slug: "genius-offer",
    category: "Business",
    tagline: "Turn your genius into one clear offer people can say yes to.",
    status: "Live",
    price: "$111 (founding)",
    version: "v1.0",
    hero_CTA_label: "Claim Your Genius Offer",
    hero_CTA_link: "/genius-offer",
    space: "BUILD",
    versionNumber: "1.0",
    versionStage: "Commercial",
    startRoute: "/genius-offer",
    description: "<p>In 48 hours, get a one-page Genius Offer Snapshot that turns your complexity into one clear, concrete offer. Perfect for multi-talented founders, coaches, and creators who struggle to put their magic into one simple offer people actually understand and buy.</p>",
    who_for: [
      "Founders, coaches, and creators who are good at many things",
      "People with experience whose positioning feels fuzzy",
      "Anyone who wants honest reflection, not hype"
    ],
    outcomes: [
      "One clear Genius Offer sentence",
      "A one-page Offer Snapshot PDF",
      "3 revenue-focused next moves",
      "Optional 45-min integration call"
    ],
    structure: [
      "Quick Intake: 10–15 minute questionnaire",
      "Deep Synthesis: Mapping your genius into one offer",
      "Delivery: PDF + next moves within 48 hours"
    ],
    story: "Again and again, I saw the same bottleneck: incredibly gifted people who couldn't answer 'So what do you actually offer?' in a way that leads to a yes. This service is the sharpest slice of my work.",
  },
  {
    id: "2",
    title: "INTELLIGENCE BOOST FOR YOUR AI MODEL",
    slug: "intelligence-boost-for-your-ai-model",
    category: "AI",
    tagline: "Upgrade your AI's thinking to match the power of your creative output",
    status: "Live",
    price: "$33",
    version: "v4.02",
    hero_CTA_label: "Get the Upgrade",
    hero_CTA_link: "/ai-upgrade",
    versionNumber: "4.02",
    versionStage: "Commercial",
    startRoute: "/ai-upgrade",
    description: `<p>Your mind moves fast. Your AI doesn't.</p>
    
    <p>Instead of keeping pace, default AI over-explains, loses nuance, breaks coherence, gives junior-level insights, interrupts your flow, and dilutes your clarity.</p>
    
    <p>For high-level operators, this isn't noise — it's friction you feel every day. If your work depends on clarity, synthesis, or precision, default AI becomes a bottleneck.</p>
    
    <p>This upgrade installs the thinking layer your AI has been missing. It removes the bottleneck — giving your AI the speed, clarity, and reasoning your work demands.</p>
    
    <p><strong>Not a chatbot. A cognitive instrument.</strong></p>`,
    who_for: [
      "Strategic founders & CEOs who think with AI",
      "High-end consultants requiring precision",
      "Executive & performance coaches",
      "Systems thinkers & polymaths who value clarity as a competitive advantage"
    ],
    outcomes: [
      "AI that moves fast instead of dragging behind you",
      "Structured, precise, and context-aware responses",
      "Concise, coherent output at senior level",
      "Reliable cognitive instrument that matches your pace and depth",
      "Elimination of the drag between your thinking speed and AI output"
    ],
    structure: [
      "Install the upgrade in minutes",
      "Experience immediate transformation in AI behavior",
      "Your AI becomes fast, sharp, and insightful",
      "No more cleanup required — get senior-level output instantly"
    ],
    story: "Built for the top 20% of operators who don't just use AI — they think with it. After working with hundreds of high-level strategists, founders, and coaches, it became clear: the problem wasn't the people, it was the AI. Standard models couldn't keep up. This upgrade fixes that. Your work deserves responses that match your pace, your depth, and your precision. This upgrade brings your AI up to the level your mind already operates at — instantly.",
    app_links: [
      { label: "Get the Upgrade", url: "/ai-upgrade" }
    ]
  },
  {
    id: "3",
    title: "МУЖСКОЙ КРУГ",
    slug: "mens-circle",
    category: "Ceremonies",
    tagline: "Душевное пространство",
    status: "Live",
    version: "v1.0",
    hero_CTA_label: "Записаться",
    hero_CTA_link: "/mens-circle",
    space: "MEET",
    versionNumber: "1.0",
    versionStage: "Commercial",
    startRoute: "/mens-circle",
    description: "<p>Создаём один из самых душевных, качественных, трансформирующих и глобально ориентированных русскоязычных мужских кругов на планете с каннабисом как растением силы.</p>",
    who_for: [
      "Russian-speaking men seeking authentic connection",
      "Those who view cannabis as a plant ally",
      "Men ready for honest conversation and growth"
    ],
    outcomes: [
      "Deep connection with like-minded men",
      "Regular sacred space for growth",
      "Community support and accountability"
    ],
    structure: [
      "Opening meditation",
      "Open conversation and sharing",
      "Closing meditation",
      "Monthly gatherings"
    ],
    story: "A space for Russian-speaking men who approach cannabis as a plant of power and want to use it not for escape, but for honest conversation, support, and growth.",
    app_links: [
      { label: "Join Circle", url: "/mens-circle" }
    ]
  },
  {
    id: "7",
    title: "QUALITY OF LIFE ACTIVATION",
    slug: "quality-of-life-map",
    category: "Tools",
    tagline: "An integral framework for rapid life upgrades",
    status: "Live",
    price: "free",
    version: "v2.0",
    hero_CTA_label: "Start Assessment",
    hero_CTA_link: "/quality-of-life-map/assessment",
    space: "ME",
    versionNumber: "0.9",
    versionStage: "MVP",
    startRoute: "/quality-of-life-map/assessment",
    description: "<p>The Quality of Life Map is a practical assessment and upgrade framework covering the essential dimensions of your life. This tool helps you quickly identify areas needing attention and provides actionable pathways for improvement across all dimensions of wellbeing.</p>",
    who_for: [
      "Anyone feeling stuck or overwhelmed",
      "Life coaches and wellness practitioners",
      "People in transition seeking clarity",
      "High-performers optimizing their life systems"
    ],
    outcomes: [
      "Clear visibility across all life domains",
      "Prioritized action steps for improvement",
      "Balanced approach to personal development",
      "Measurable progress over time"
    ],
    structure: [
      "Assessment: Evaluate current state using integral framework",
      "Analysis: Identify priority areas and patterns",
      "Action: Generate personalized upgrade plans",
      "Tracking: Monitor progress and iterate"
    ],
    story: "After years of coaching, I noticed patterns in how life quality breaks down and improves. This map emerged as a simple yet comprehensive tool for rapid transformation.",
    app_links: [
      { label: "Open Map", url: "/quality-of-life-map/assessment" }
    ]
  },
  {
    id: "8",
    title: "ZONE OF GENIUS DISCOVERY",
    slug: "zone-of-genius",
    category: "Tools",
    tagline: "Get AI-powered clarity on your core strengths and next career step",
    status: "Live",
    price: "free",
    version: "v1.0",
    hero_CTA_label: "Open Tool",
    hero_CTA_link: "/zone-of-genius",
    space: "ME",
    versionNumber: "0.9",
    versionStage: "MVP",
    startRoute: "/zone-of-genius/entry",
    description: "<p>Zone of Genius Discovery is a free AI-powered assessment that reveals your core strengths and provides a clear path forward in your career. Get your personalized ZoG Snapshot PDF with strategic insights in just 5 minutes.</p>",
    who_for: [
      "Professionals in career transition",
      "Anyone seeking clarity on their unique talents",
      "Leaders wanting to align work with strengths",
      "Career coaches and advisors"
    ],
    outcomes: [
      "Clear understanding of your top 3 core talents",
      "Personalized Zone of Genius statement",
      "Strategic career insights and next steps",
      "Downloadable PDF report for future reference"
    ],
    structure: [
      "Assessment: Quick AI-powered strengths analysis",
      "Analysis: Identify your Zone of Genius",
      "Insights: Strategic career recommendations",
      "Action: Clear next steps and opportunities"
    ],
    story: "After working with hundreds of professionals in career transitions, I saw a clear pattern: people struggle to articulate their unique value. This AI-powered tool distills years of coaching insights into a fast, accessible assessment that reveals your Zone of Genius.",
    app_links: [
      { label: "Start Assessment", url: "/zone-of-genius/assessment" }
    ]
  },
  {
    id: "10",
    title: "MULTIPLE INTELLIGENCES SELF-ASSESSMENT",
    slug: "intelligences",
    category: "Tools",
    tagline: "A free 2–3 minute test to quickly map the ways you're naturally most intelligent",
    status: "Live",
    price: "free",
    version: "v1.0",
    hero_CTA_label: "Take the Quick Test",
    hero_CTA_link: "/intelligences",
    space: "ME",
    versionNumber: "0.5",
    versionStage: "PoC",
    startRoute: "/intelligences",
    description: "<p>A fast way to see which forms of intelligence feel most natural to you right now — so we can better understand how your genius expresses itself.</p>",
    who_for: [
      "Anyone curious about their natural strengths",
      "People exploring their Zone of Genius",
      "Those working on their Genius Offer"
    ],
    outcomes: [
      "Clear ranking of your top intelligences",
      "Self-awareness of how you naturally think",
      "Useful input for Genius Offer creation"
    ],
    structure: [
      "Rank 10 intelligences from most to least 'you'",
      "Takes 2–3 minutes",
      "Results saved for future reference"
    ],
    story: "Understanding how you're naturally intelligent helps clarify how your genius wants to express itself in the world.",
    app_links: [
      { label: "Start Assessment", url: "/intelligences" }
    ]
  },
  {
    id: "4",
    title: "Heartcraft (Game)",
    slug: "heartcraft-game",
    category: "Growth",
    tagline: "A level-based awakening game using conscious breathwork",
    status: "Coming Soon",
    hero_CTA_label: "Play Beta",
    hero_CTA_link: "#",
    description: "<p>Heartcraft is an interactive awakening experience that combines gamification with conscious breathwork practices. Progress through increasingly profound levels of self-discovery, each unlocking new breathwork techniques and insights about your inner landscape.</p>",
    who_for: [
      "Breathwork practitioners wanting structure",
      "Gamers interested in consciousness expansion",
      "Anyone seeking a playful approach to inner work",
      "People new to meditation and breathwork"
    ],
    outcomes: [
      "Develop a consistent breathwork practice",
      "Experience deeper states of consciousness",
      "Unlock emotional and energetic blockages",
      "Build inner resilience and clarity"
    ],
    structure: [
      "Level 1-3: Foundation breathwork techniques",
      "Level 4-6: Intermediate practices and insights",
      "Level 7-9: Advanced consciousness exploration",
      "Level 10+: Master practices and integration"
    ],
    story: "Heartcraft was born from the realization that gamification could make profound inner work more accessible and engaging, especially for those intimidated by traditional spiritual practices.",
    app_links: [
      { label: "Start Playing", url: "#" }
    ]
  },
  {
    id: "5",
    title: "Integral Mystery School",
    slug: "integral-mystery-school",
    category: "Growth",
    tagline: "A 5-module program on leadership and evolutionary development",
    status: "Coming Soon",
    hero_CTA_label: "Enroll Now",
    hero_CTA_link: "#",
    description: "<p>The Integral Mystery School is a comprehensive journey through the stages of human development and leadership evolution. Combining ancient wisdom traditions with modern developmental psychology, this program offers a complete map for personal and collective transformation.</p>",
    who_for: [
      "Leaders seeking evolutionary perspectives",
      "Facilitators and coaches working with groups",
      "Spiritual seekers integrating multiple traditions",
      "Change agents working on systemic transformation"
    ],
    outcomes: [
      "Understand developmental stages and their dynamics",
      "Embody higher levels of consciousness",
      "Lead from integral awareness",
      "Navigate complexity with wisdom and grace"
    ],
    structure: [
      "Module 1: The Developmental Map",
      "Module 2: Shadow Work and Integration",
      "Module 3: Stages of Leadership",
      "Module 4: Collective Intelligence",
      "Module 5: Emergence and Service"
    ],
    story: "Years of studying wisdom traditions and developmental psychology crystallized into this synthesis—a practical path for those called to serve human evolution.",
    app_links: [
      { label: "Course Portal", url: "#" }
    ]
  },
];

export const getModuleBySlug = (slug: string): Module | undefined => {
  return modules.find((module) => module.slug === slug);
};

export const getModulesByCategory = (category: string): Module[] => {
  if (category === "ALL") return modules;
  // Match category with proper casing (AI stays uppercase, others title case)
  const normalizedCategory = category === "AI" ? "AI" : category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return modules.filter((module) => module.category === normalizedCategory);
};

export const getRelatedModules = (moduleId: string, relatedSlugs?: string[]): Module[] => {
  if (!relatedSlugs) return [];
  return modules.filter((module) => relatedSlugs.includes(module.slug) && module.id !== moduleId);
};
