export type DomainId =
  | "wealth"
  | "health"
  | "happiness"
  | "love"
  | "impact"
  | "growth"
  | "socialTies"
  | "home";

export type Stage = {
  id: number;        // 1–10
  title: string;     // e.g. "Stage 3"
  description: string;
};

export type Domain = {
  id: DomainId;
  name: string;      // e.g. "Wealth"
  color: string;     // tailwind color key, e.g. "emerald"
  stages: Stage[];
};

export const DOMAINS: Domain[] = [
  {
    id: "wealth",
    name: "Wealth",
    color: "emerald",
    stages: [
      { id: 1, title: "Barely Surviving", description: "No savings, relying on external aid for basic needs." },
      { id: 2, title: "Paycheck Living", description: "Can meet monthly expenses but no savings, have debts." },
      { id: 3, title: "Cautious Saver", description: "Accumulated 1-2 months emergency savings, starting to pay off debt." },
      { id: 4, title: "Debt-Free", description: "3-6 months emergency savings, no high-interest debts." },
      { id: 5, title: "Initial Investments", description: "6-12 months savings, starting to invest." },
      { id: 6, title: "Diversified Investments", description: "Growing portfolio, exploring different asset classes." },
      { id: 7, title: "Self-Sustaining", description: "Over two years of savings, passive income covering essential living expenses." },
      { id: 8, title: "Financially Free", description: "Living off investments, work is a choice, not a necessity." },
      { id: 9, title: "Wealth & Philanthropy", description: "Growing wealth, actively giving back and contributing to causes." },
      { id: 10, title: "Legacy Creation", description: "Wealth is sustainable for future generations, focused on generational legacy planning." }
    ]
  },
  {
    id: "health",
    name: "Health",
    color: "rose",
    stages: [
      { id: 1, title: "Low Energy", description: "Frequent fatigue, poor diet, no exercise, recurrently getting sick." },
      { id: 2, title: "Coping", description: "Started basic exercise and diet improvements, but still often tired or sick." },
      { id: 3, title: "Active", description: "Seldom fatigued or sick, regular exercise, balancing nutrition." },
      { id: 4, title: "Moderate to High Energy", description: "Rarely tired or sick, vigorous exercise routine, mostly balanced nutrition." },
      { id: 5, title: "High Energy", description: "Consistently high energy levels, active lifestyle, balanced nutrition, ever rarely sick." },
      { id: 6, title: "Holistic Health", description: "Balanced nutrition, regular exercise, mindful of all health aspects (physical, mental)." },
      { id: 7, title: "Vitality", description: "Exceptional energy levels, engaged in advanced health practices." },
      { id: 8, title: "Peak Performance", description: "Consistently at top physical and mental state, helping others with their health." },
      { id: 9, title: "Well-being Ambassador", description: "Promoting lifelong health in your community, positively influencing others." },
      { id: 10, title: "Lifelong Health Legacy", description: "Sustained high energy and vitality, a model of well-being that inspires generations." }
    ]
  },
  {
    id: "happiness",
    name: "Happiness",
    color: "amber",
    stages: [
      { id: 1, title: "Crisis/Survival Mode", description: "Frequently overwhelmed by stress, anxiety, or depression." },
      { id: 2, title: "Struggling", description: "Managing stress but experiencing frequent emotional highs and lows." },
      { id: 3, title: "Emotional Coping", description: "Developing basic emotional coping strategies, learning to relate to emotions." },
      { id: 4, title: "Steady State", description: "Mostly stable emotions, occasional stress, beginning to practice mindfulness." },
      { id: 5, title: "Resilience", description: "Developing good stress management and emotional recovery skills." },
      { id: 6, title: "Inner Balance & Mindfulness", description: "Consistent mindfulness practice, good emotional regulation." },
      { id: 7, title: "Emotional Mastery", description: "High emotional intelligence and control, can navigate complex emotional states." },
      { id: 8, title: "Joyful Existence", description: "Pervasive sense of joy and contentment, rarely disturbed by external events." },
      { id: 9, title: "Inner Peace, Clarity & Focus", description: "High levels of mental clarity and focus, a state of deep-seated peace and tranquility." },
      { id: 10, title: "Unified Self", description: "Environmental and emotional mastery, cognitive and spiritual fulfillment, a state of unified consciousness." }
    ]
  },
  {
    id: "love",
    name: "Love & Relationships",
    color: "pink",
    stages: [
      { id: 1, title: "Isolation", description: "Feeling lonely most of the time, barely any active relationships." },
      { id: 2, title: "Initial Connections", description: "Basic social interactions but relationships are mostly surface-level, random romantic encounters." },
      { id: 3, title: "First Intimate Connections", description: "Developing a few emotional bonds, short-lived romances, weak family ties." },
      { id: 4, title: "Family Cohesion & Close Friends", description: "Bonding with immediate family, mutual emotional support from friends, steady romantic relationship." },
      { id: 5, title: "Deep Relationships", description: "Multiple close emotional bonds, sense of community, ready for or in an intimate partnership." },
      { id: 6, title: "Heartfelt Relationships", description: "Engaged in a loving, intimate romantic relationship, strong supportive friendships." },
      { id: 7, title: "Dynamic Community", description: "Engaged in a community that nurtures growth and support, seen as reliable by friends and family." },
      { id: 8, title: "Conscious Relations & Guidance", description: "Deep, aware relationships. Perhaps raising children or mentoring others, a source of emotional support." },
      { id: 9, title: "Expanded Love and Care", description: "Profound, trusting relationships. Expanding the circle of close relationships, offering wisdom in your community." },
      { id: 10, title: "Universal & Unconditional Love", description: "A sense of love and compassion that extends to all beings, living in service and unity." }
    ]
  },
  {
    id: "impact",
    name: "Impact",
    color: "violet",
    stages: [
      { id: 1, title: "Undirected Energy", description: "Unfulfilled in a job solely for income, not aligned with purpose, no clear impact." },
      { id: 2, title: "Skill Building, Small Acts", description: "In a job that helps build skills but isn't aligned, and/or making a difference on a micro-scale." },
      { id: 3, title: "Career Growth, Focused Intent", description: "Career path identified, honing your craft to a high level of proficiency in a relevant job." },
      { id: 4, title: "Impact Initiated, Aligned Work", description: "Engaged in creative process or work that begins to align with personal values and purpose." },
      { id: 5, title: "Creative Mastery & Leadership Roles", description: "Taking on leadership responsibilities that align with purpose, initial projects or hobbies." },
      { id: 6, title: "Expanding Influence", description: "Your creations/work start to influence your field or have regional or national impact." },
      { id: 7, title: "Broad Sustainable Impact", description: "Your creations/work significantly impact a larger community, established a sustainable model for continual impact." },
      { id: 8, title: "High Impact, Innovative Contributions", description: "Leading in uncharted territories, making increasing new contributions on a large scale." },
      { id: 9, title: "Global Influence, Multi-Domain Impact", description: "Your contributions affect people globally and cross multiple domains." },
      { id: 10, title: "Global Change-Maker, Legacy Work", description: "Your life's work contributes to significant global changes and will have a lasting, generational impact." }
    ]
  },
  {
    id: "growth",
    name: "Growth",
    color: "blue",
    stages: [
      { id: 1, title: "Unaware, Stagnation", description: "No conscious effort towards self-improvement or spiritual growth." },
      { id: 2, title: "Initial Questioning, Curiosity Sparked", description: "Started questioning deeper meaning of life, learning about self-improvement but barely any action." },
      { id: 3, title: "Self-Awareness, First Steps", description: "Beginning of personal growth or mindfulness practices, but still mostly theory." },
      { id: 4, title: "Practical Application, Mindful Living", description: "Good understanding of personal strengths and weaknesses, actively applying what you're learning." },
      { id: 5, title: "Spiritual Practice", description: "Consistent spiritual practice or self-reflection, and applying it to life." },
      { id: 6, title: "Deep Insights, Growing Inner Harmony", description: "Breakthroughs in personal and spiritual understanding, a growing sense of peace and balance." },
      { id: 7, title: "Spiritual Connection, Integrating Self", description: "Feeling a stronger connection to something greater, balancing various aspects of life for holistic growth." },
      { id: 8, title: "Intuitive Living, Spiritual Mentorship", description: "Regularly access intuitive guidance for decision making, starting to guide others on their journeys." },
      { id: 9, title: "Unified Being, Transcendent Experiences", description: "Experiencing moments of unity and awareness beyond the ordinary, guiding others in their spiritual journeys." },
      { id: 10, title: "Universal & Cosmic Oneness", description: "Experiencing a sustained state of interconnectedness with all that is." }
    ]
  },
  {
    id: "socialTies",
    name: "Social Ties",
    color: "cyan",
    stages: [
      { id: 1, title: "Self-Isolation", description: "Minimal social interactions, uncomfortable or disengaged in social settings." },
      { id: 2, title: "Acquaintances", description: "Casual connections and small talk dominate social landscape." },
      { id: 3, title: "Friendly Connections", description: "Joined groups but minimal active involvement." },
      { id: 4, title: "Community Member", description: "Established a tight-knit circle but not deeply rooted, regular give and take." },
      { id: 5, title: "Networked, High Quality Ties", description: "Meaningful ties that offer emotional support and practical advice." },
      { id: 6, title: "Close Ties, Extended Network", description: "More extensive social circle including mentors and advisors, connections are consistently shifting and mutual." },
      { id: 7, title: "Influential Community Member", description: "Taking up roles in community activities like organizing events." },
      { id: 8, title: "Community Leader", description: "Seen as a leader in multiple social circles, starting to influence others through your activities." },
      { id: 9, title: "Global Network, Social Benefactor", description: "Significantly impacting your community network, actions benefit the community." },
      { id: 10, title: "Universal Harmony", description: "Social influence transcends cultures and countries, fostering a sense of interconnectedness with all beings." }
    ]
  },
  {
    id: "home",
    name: "Home",
    color: "orange",
    stages: [
      { id: 1, title: "Chaotic, Cluttered Space", description: "Living environment is disorganized, stressful, or unsteady, no control over the environment." },
      { id: 2, title: "Basic Organization", description: "Starting to make the space functional, some level of tidiness, basic furniture." },
      { id: 3, title: "Basic Comfort", description: "Your living space is functional and stable, generally clean, and has household systems." },
      { id: 4, title: "Personalized Home", description: "The living space is functional and is beginning to reflect your style but lacks cohesion." },
      { id: 5, title: "Aesthetic Cohesion", description: "The environment is not only functional but is also visually pleasing, and is designed to reflect your personal style." },
      { id: 6, title: "Holistic Sanctuary", description: "Living space serves functional needs but also enhances your psychological well-being and creativity." },
      { id: 7, title: "Temple", description: "Your physical space is optimized for well-being. This is your nurturing space where you replenish." },
      { id: 8, title: "Social Hub", description: "Living space is not just a personal haven but also facilitates meaningful social interactions." },
      { id: 9, title: "Harmonic & Innovative Living", description: "Optimized for performance and flow. Adopting technologies or design principles to make the home adaptive or self-sustaining." },
      { id: 10, title: "Community Synergy Anchor", description: "Your home/space benefits the larger community, a universal habitat and holistic sanctuary." }
    ]
  }
];
