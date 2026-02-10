import { ModuleLandingData } from "@/types/module";

/**
 * Landing page content for modules, generated via Module Landing Page Workflow SOP.
 * Data source: docs/06-modules/[slug]/landing_page_content.md
 * Keyed by module slug.
 */
export const moduleLandings: Record<string, ModuleLandingData> = {
    "zone-of-genius": {
        forAudience: "For professionals who know they're talented but can't name what makes them different",
        headline: "Name the work you were actually built to do",
        subheadline: "Get your free Zone of Genius Snapshot in 20 minutes — without another generic personality test",
        ctaButtonText: "Reveal your Zone of Genius",
        ctaButtonLink: "/zone-of-genius/entry",

        forWhom: [
            "You've done MBTI, StrengthsFinder, Enneagram — and still can't explain your edge in one sentence",
            "You're \"successful enough\" but feel like you're operating on borrowed positioning",
            "You're in a career transition and need clarity, not another job board",
            "People tell you \"you're so talented\" but can't name AT WHAT — and neither can you",
            "You want to build offers, lead projects, or switch careers from a place of known genius, not guesswork",
        ],

        painSectionHeader: "When you can't name what makes you different",
        painBullets: [
            "You describe yourself by job title instead of genius — so every networking intro sounds like everyone else's",
            "You've taken personality tests that told you you're \"strategic\" and \"empathetic\" — useful as saying you're \"human\"",
            "Career decisions feel like guesswork because you don't have a clear filter for \"this is my work / this isn't\"",
            "You keep diversifying your skills instead of deepening the one thing that would make you irreplaceable",
        ],

        solutionSectionHeader: "A clear path from unnamed to unmistakable",
        solutionSteps: [
            { verb: "Select", description: "your top talents from a taxonomy of 81 — see which ones light up for you" },
            { verb: "Narrow", description: "to your core 3 — the talents that define your genius, not just your skills" },
            { verb: "Order", description: "them — because the sequence reveals the pattern" },
            { verb: "Generate", description: "your Zone of Genius Snapshot — AI reveals your archetype, core pattern, and 12 perspectives on your genius" },
            { verb: "Download", description: "your personalized PDF — share it, use it, build from it" },
        ],

        outcomes: [
            "A named archetype (e.g., \"The Catalyst,\" \"The Architect\") that captures your essence",
            "A core pattern description explaining how your talents connect",
            "A Bullseye Sentence — your genius in one line",
            "12 perspectives on your genius: mastery stages, ideal roles, monetization paths, complementary partners, and more",
            "A Mastery Action — one repeatable practice to deepen your genius daily",
            "A downloadable PDF you can share with coaches, managers, or collaborators",
        ],

        howItWorks: [
            { step: "Select & Rank", description: "Pick your top talents from 81 options", time: "~15 min" },
            { step: "AI Analysis", description: "AI analyzes your unique talent pattern", time: "~1 min" },
            { step: "Your Snapshot", description: "Receive your archetype, insights, and PDF", time: "Instant" },
        ],

        story: "Built by Aleksandr Konstantinov — MIT alum, 10+ years guiding 250+ people through career transitions. After watching hundreds of talented professionals struggle to name what makes them different, he built the Zone of Genius taxonomy: 81 distinct talents organized into 9 categories. Not a personality type. Not a quiz. A talent map that gives you a name for the work you were built to do.",

        finalCtaHeadline: "Stop blending in. Name your genius.",
        finalCtaSubheadline: "Free · 20 minutes · Personalized PDF included",

        coreMessage: {
            belief: "We believe every person has a Zone of Genius waiting to be named.",
            oneLiner: "Zone of Genius Discovery helps professionals who feel 'successful but off' name the exact work they were built to do — in 20 minutes, for free.",
            resonanceHook: "For people who've done all the personality tests and still can't explain what makes them different in one sentence.",
        },
    },

    "quality-of-life-map": {
        forAudience: "For people who are doing well on paper but feel like something's quietly off",
        headline: "See exactly where your life stands — all 8 domains, one clear map",
        subheadline: "An integral framework for rapid life upgrades — free, 10 minutes, with AI-powered next steps",
        ctaButtonText: "Map your life now",
        ctaButtonLink: "/quality-of-life-map/assessment",

        forWhom: [
            "You're successful in your career but your health or relationships have quietly slipped",
            "You journal, reflect, maybe see a therapist — but you still can't name exactly what's off",
            "You've tried \"life audits\" before, but they were either too vague or too overwhelming to act on",
            "You want to focus your energy on the ONE area that will make the biggest difference right now",
            "You're not in crisis — you're in drift. And you want to steer.",
        ],

        painSectionHeader: "When 'I'm fine' stops being true",
        painBullets: [
            "You're crushing it at work but haven't exercised in months — and the energy debt is showing",
            "You know your relationships need attention but you keep telling yourself \"after this project\"",
            "You set goals every January that cover 3 areas and ignore 5 — because you've never seen all 8 at once",
            "The \"something's off\" feeling gets louder each year, but without a map, you can't navigate toward the fix",
        ],

        solutionSectionHeader: "From fog to a clear map in 10 minutes",
        solutionSteps: [
            { verb: "Assess", description: "each of 8 life domains on a 10-stage scale — not a gut rating, but specific criteria per stage" },
            { verb: "See", description: "your life as a radar chart — instantly spot which domains are strong and which need attention" },
            { verb: "Prioritize", description: "choose which domain to focus on first based on YOUR values, not a generic prescription" },
            { verb: "Act", description: "get AI-generated guidance: one inner shift + one outer shift per domain to reach the next stage" },
        ],

        outcomes: [
            "A radar chart showing all 8 life domains at a glance",
            "Stage descriptions for each domain — know exactly where you are",
            "Priority order — which domain to focus on first, second, third",
            "AI-generated next steps — one concrete inner shift + one outer shift per domain",
            "PDF export — save and share your map",
            "Profile integration — your map is saved and updates when you retake",
        ],

        howItWorks: [
            { step: "Self-Assessment", description: "Rate yourself in each of 8 life domains using guided stage descriptions", time: "~8 min" },
            { step: "Visual Map", description: "See your results as a visual radar map with AI-powered insights", time: "Instant" },
            { step: "Next Steps", description: "Set priorities and get personalized next-step guidance", time: "~2 min" },
        ],

        story: "Most life assessments ask you to rate happiness 1-10 and call it a day. That tells you nothing. The Quality of Life Map uses an integral framework across 8 domains — wealth, health, happiness, love & relationships, impact, growth, social ties, and home — each with 10 specific stages. It was built because we believe you can't improve what you can't see.",

        finalCtaHeadline: "Stop guessing. See the map.",
        finalCtaSubheadline: "Free · 10 minutes · AI-powered guidance included",

        coreMessage: {
            belief: "We believe clarity precedes change — you can't improve what you can't see.",
            oneLiner: "Quality of Life Map helps people who feel 'something's off' see exactly where they stand across 8 life domains — in 10 minutes, for free.",
            resonanceHook: "For people who are doing fine on paper but feel like they're winning in some areas while quietly neglecting others.",
        },
    },

    "intelligences": {
        forAudience: "For people who want to understand how their mind naturally works",
        headline: "Map the ways you're naturally most intelligent — in 2 minutes",
        subheadline: "Not IQ. Not grades. The forms of intelligence that feel like home when you use them.",
        ctaButtonText: "Take the quick test",
        ctaButtonLink: "/intelligences",

        forWhom: [
            "You've always felt smart in ways school never measured",
            "You're exploring your Zone of Genius and want another lens on how you think",
            "You're a coach, founder, or creative who wants to understand your natural operating mode",
            "You want a fast, zero-friction assessment — not a 45-minute psychological battery",
        ],

        painSectionHeader: "When you feel smart but can't point to why",
        painBullets: [
            "You know you're intelligent but \"intelligent at what?\" has never had a satisfying answer",
            "Standard tests measure one kind of smart — you operate in several, and they all blur together",
            "Without naming your intelligence type, you end up in roles that use your weakest modes",
            "You sense you're underutilizing something, but can't name the specific capacity being wasted",
        ],

        solutionSectionHeader: "See your intelligence profile in one ranking",
        solutionSteps: [
            { verb: "Rank", description: "10 forms of intelligence from most to least 'you' — fast drag-and-drop interface" },
            { verb: "See", description: "your natural ordering — which intelligences dominate and which lag" },
            { verb: "Use", description: "your results as input for Zone of Genius discovery and Genius Offer creation" },
        ],

        outcomes: [
            "A ranked list of your 10 intelligences — from most to least natural",
            "Clarity on which cognitive modes are your home base",
            "Input data that feeds into your Zone of Genius and Genius Offer",
            "A saved profile you can reference as you build your career path",
        ],

        howItWorks: [
            { step: "Rank", description: "Drag-and-drop 10 intelligences into your personal order", time: "~2 min" },
            { step: "Review", description: "See your intelligence profile with descriptions", time: "Instant" },
            { step: "Connect", description: "Feed results into Zone of Genius for deeper discovery", time: "Optional" },
        ],

        story: "Howard Gardner identified multiple intelligences decades ago, but most people still think of intelligence as one number. This quick assessment helps you see the forms of intelligence that feel most natural — so you can build from strength, not fit yourself into someone else's definition of smart.",

        finalCtaHeadline: "2 minutes. 10 intelligences. Your natural order.",
        finalCtaSubheadline: "Free · No signup required · Results saved to your profile",
    },

    "library": {
        forAudience: "For people who learn best through curated practices, not random content",
        headline: "One library of practices for every dimension of growth",
        subheadline: "Body, Emotions, Mind, Spirit, Genius — curated practices you can actually use, not another content dump",
        ctaButtonText: "Browse practices",
        ctaButtonLink: "/library",

        forWhom: [
            "You've bookmarked hundreds of articles and videos but never returned to most of them",
            "You want practices, not information — something you can DO, not just consume",
            "You're growing across multiple dimensions (body, mind, spirit) and need them organized",
            "You've tried meditation apps, breathwork apps, fitness apps — and you want ONE place",
        ],

        painSectionHeader: "When growth content creates more noise than growth",
        painBullets: [
            "You have 47 tabs of self-improvement content open and no idea where to start",
            "Every app wants to be your ONLY growth tool — but growth doesn't work in silos",
            "You know what to improve but can't find the right practice for the specific dimension you need",
            "Information overload has become a form of procrastination disguised as learning",
        ],

        solutionSectionHeader: "Curated practices, organized by the dimension they serve",
        solutionSteps: [
            { verb: "Browse", description: "practices organized by 5 growth dimensions: Body, Emotions, Mind, Spirit, Genius" },
            { verb: "Filter", description: "by category, duration, and difficulty — find exactly what fits your current need" },
            { verb: "Practice", description: "follow guided instructions — each practice is designed for immediate use" },
            { verb: "Track", description: "your journey — the library integrates with your Growth Paths and Daily Loop" },
        ],

        outcomes: [
            "A single organized library for all personal growth practices",
            "Practices tagged by dimension (Body, Emotions, Mind, Spirit, Genius)",
            "Filterable by duration, category, and level",
            "Integration with your personal growth path and daily recommendations",
            "New practices added regularly by the community and curators",
        ],

        howItWorks: [
            { step: "Browse", description: "Explore practices across 5 growth dimensions", time: "~2 min" },
            { step: "Choose", description: "Pick a practice based on your current need and time", time: "~1 min" },
            { step: "Practice", description: "Follow guided instructions and log your experience", time: "Varies" },
        ],

        story: "Most growth platforms are either too narrow (just meditation, just fitness) or too broad (random self-help content). The Library was built to be the middle path: curated practices across every dimension of human growth, organized so you can find exactly what you need when you need it. No algorithms deciding for you. Just a clean library you can trust.",

        finalCtaHeadline: "Stop scrolling. Start practicing.",
        finalCtaSubheadline: "Free · 5 dimensions · Curated practices",
    },

    "destiny": {
        forAudience: "For talented people who know they should be building something of their own — but can't get clear on what",
        headline: "Turn your genius into a business that actually works",
        subheadline: "A guided program to go from \"I'm talented but stuck\" to a clear core offer, pricing, and first clients",
        ctaButtonText: "Book an Excalibur Call",
        ctaButtonLink: "https://calendly.com/your-link",

        forWhom: [
            "You're a coach, consultant, or creative who's talented at many things — and that's the problem",
            "You've tried to define your offer before but ended up with something generic that doesn't sell",
            "You know you could build something great, but clarity on WHAT keeps slipping through your fingers",
            "You're tired of undercharging because you can't articulate your unique value in a way that justifies premium pricing",
            "You want a structured process, not another brainstorming session that goes nowhere",
        ],

        painSectionHeader: "When talent becomes a trap",
        painBullets: [
            "You're good at 5 things and can't pick ONE — so you end up offering a confusing menu that attracts no one",
            "Every time someone asks \"so what do you do?\" you give a different answer depending on who's asking",
            "You watch less talented people succeed with clear offers while you over-think yours into oblivion",
            "The gap between what you COULD earn and what you DO earn grows wider every year you stay unfocused",
        ],

        solutionSectionHeader: "From scattered genius to a focused business",
        solutionSteps: [
            { verb: "Discover", description: "your natural talents and passions using the Zone of Genius framework" },
            { verb: "Crystallize", description: "your unique value proposition — what only YOU can offer" },
            { verb: "Design", description: "your signature offer with clear pricing, packaging, and positioning" },
            { verb: "Activate", description: "launch strategy, first clients, and a revenue roadmap" },
        ],

        outcomes: [
            "Crystal-clear understanding of your unique genius",
            "A compelling core offer that resonates with your ideal clients",
            "Confidence in your value proposition and pricing",
            "A roadmap for bringing your vision to life",
            "Real momentum — not just a plan, but actual next moves",
        ],

        howItWorks: [
            { step: "Discovery Call", description: "30-min call to assess fit and understand your situation", time: "30 min" },
            { step: "Deep Work", description: "Structured sessions to uncover genius, design offer, and build strategy", time: "2-4 weeks" },
            { step: "Launch", description: "Go to market with your core offer and get your first paying clients", time: "Week 4+" },
        ],

        story: "Destiny emerged from working with hundreds of talented individuals who struggled to articulate their unique value. They had genius — they just couldn't package it. This program distills 10+ years of coaching experience into a clear pathway: find your genius, build your offer, get your first clients. No fluff. No theory. Just results.",

        finalCtaHeadline: "Your genius deserves a business. Let's build it.",
        finalCtaSubheadline: "Results-based pricing · 10% of new revenue, capped at $3k",
    },

    "genius-offer": {
        forAudience: "For multi-talented founders and creators who can't answer 'so what do you actually offer?'",
        headline: "One clear offer. 48 hours. Done.",
        subheadline: "Stop selling your complexity. Start selling your genius. Get a one-page Genius Offer Snapshot delivered in 48 hours.",
        ctaButtonText: "Claim your Genius Offer",
        ctaButtonLink: "/genius-offer-intake",

        forWhom: [
            "You're good at many things and can't pick one to lead with",
            "Your positioning feels fuzzy — you've been told 'I don't quite get what you do'",
            "You want honest reflection, not hype — a mirror, not a megaphone",
            "You need someone outside your head to NAME the thing you do best and package it",
            "You're ready to stop agonizing and just have ONE offer that clicks",
        ],

        painSectionHeader: "When 'I do many things' stops working",
        painBullets: [
            "You describe yourself differently every time someone asks — because you genuinely can't pick",
            "Potential clients love talking to you but don't buy — because they can't tell others what you do",
            "You've written 12 drafts of your offer page and none of them feel right",
            "Every week you delay defining your offer is a week of revenue you're leaving on the table",
        ],

        solutionSectionHeader: "From complexity to one clear offer in 48 hours",
        solutionSteps: [
            { verb: "Tell", description: "us about yourself — a 10-15 minute intake questionnaire captures your genius, experience, and goals" },
            { verb: "Receive", description: "deep synthesis — your complexity gets distilled into one clear, buyable offer" },
            { verb: "Use", description: "your Genius Offer Snapshot PDF — one sentence, one page, three next moves" },
        ],

        outcomes: [
            "One clear Genius Offer sentence — what you do for whom",
            "A one-page Offer Snapshot PDF you can use immediately",
            "3 revenue-focused next moves — specific, actionable, yours",
            "Optional 45-min integration call to refine and launch",
        ],

        howItWorks: [
            { step: "Quick Intake", description: "Fill out a focused questionnaire about your genius and goals", time: "10-15 min" },
            { step: "Deep Synthesis", description: "Your genius gets mapped into one clear, compelling offer", time: "24-48 hours" },
            { step: "Delivery", description: "Receive your PDF + next moves, ready to use", time: "Instant" },
        ],

        story: "Again and again, I saw the same bottleneck: incredibly gifted people who couldn't answer 'So what do you actually offer?' in a way that leads to a yes. Not because they lacked talent — because they had too much. This service is the sharpest slice of my work: take your complexity, distill it to one offer, deliver it in 48 hours.",

        finalCtaHeadline: "Stop explaining. Start offering.",
        finalCtaSubheadline: "$111 (founding price) · Delivered in 48 hours · PDF + next moves",
    },

    "intelligence-boost-for-your-ai-model": {
        forAudience: "For operators who think with AI and need it to keep up",
        headline: "Make your AI think at the level you do",
        subheadline: "One upgrade. Instant transformation. Your AI goes from generic assistant to precision cognitive instrument.",
        ctaButtonText: "Get the Upgrade — $33",
        ctaButtonLink: "/ai-upgrade",

        forWhom: [
            "Your mind moves at 10x and your AI drags at 1x — the gap is costing you hours daily",
            "You've tried every prompting trick and your AI still over-explains, loses context, and outputs junior-level thinking",
            "You're a strategic founder, consultant, or coach who needs precision, not filler",
            "You've accepted mediocre AI output as normal — it's not, you just haven't upgraded yet",
        ],

        painSectionHeader: "When your AI is the bottleneck",
        painBullets: [
            "Every response needs editing — your AI adds 300 words when 30 would do",
            "Context gets lost mid-conversation and you spend more time re-explaining than thinking",
            "Your AI gives 'safe' generic advice when you need sharp, strategic insight",
            "You've stopped using AI for your most important work because it can't keep up",
        ],

        solutionSectionHeader: "Install the thinking layer your AI has been missing",
        solutionSteps: [
            { verb: "Purchase", description: "the Intelligence Boost — one-time payment, instant delivery" },
            { verb: "Install", description: "in minutes — works with ChatGPT, Claude, and other models" },
            { verb: "Experience", description: "immediate transformation — concise, structured, senior-level output from the first message" },
        ],

        outcomes: [
            "AI that moves fast instead of dragging behind you",
            "Structured, precise, and context-aware responses",
            "Concise, coherent output at senior level — no more cleanup",
            "A reliable cognitive instrument that matches your pace and depth",
            "Elimination of the drag between your thinking speed and AI output",
        ],

        howItWorks: [
            { step: "Purchase", description: "One-time payment — no subscription, no recurring fees", time: "1 min" },
            { step: "Install", description: "Copy the upgrade into your AI platform of choice", time: "2 min" },
            { step: "Transform", description: "Your AI becomes fast, sharp, and insightful — immediately", time: "Instant" },
        ],

        story: "Built for the top 20% of operators who don't just use AI — they think with it. After working with hundreds of high-level strategists, founders, and coaches, it became clear: the problem wasn't the people, it was the AI. Standard models couldn't keep up. This upgrade fixes that. Your work deserves responses that match your pace, your depth, and your precision.",

        finalCtaHeadline: "Stop cleaning up after your AI. Upgrade it.",
        finalCtaSubheadline: "$33 · One-time · Works with any AI model · Instant access",
    },
};

/**
 * Get landing data for a module by slug.
 */
export function getModuleLandingData(slug: string): ModuleLandingData | undefined {
    return moduleLandings[slug];
}
