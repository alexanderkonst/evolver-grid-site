export type LibraryCategoryId =
  | "breathEnergy"
  | "moneyAbundance"
  | "realityWisdom"
  | "spiritualGuidance"
  | "activations"
  | "animalSpirits";

export type LibraryCategory = {
  id: LibraryCategoryId;
  name: string;
  description?: string;
};

export type ExperienceIntent =
  | "breathwork"
  | "activation"
  | "receiveWisdom"
  | "feelBetter"
  | "psychic";

export type DevelopmentPath = "body" | "mind" | "emotions" | "spirit" | "uniqueness";

export type QolDomain = "wealth" | "health" | "happiness" | "love_relationships" | "impact" | "growth" | "social_ties" | "home";

export type LibraryItem = {
  id: string;
  categoryId: LibraryCategoryId;
  title: string;
  teacher?: string;
  url: string;
  youtubeId: string;
  durationLabel?: string;
  durationMinutes?: number;
  intents?: ExperienceIntent[];
  primaryPath?: DevelopmentPath;
  secondaryPath?: DevelopmentPath;
  primaryDomain?: QolDomain;
};

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: "breathEnergy",
    name: "Breathwork",
    description: "Short breathwork and nervous system practices to regulate, energize, and uplift."
  },
  {
    id: "moneyAbundance",
    name: "Money & Abundance",
    description: "Practices and transmissions around the spirit of money, abundance, and receiving."
  },
  {
    id: "realityWisdom",
    name: "Reality Hacking",
    description: "Wisdom nuggets about the nature of reality, consciousness, and creation."
  },
  {
    id: "spiritualGuidance",
    name: "Spiritual Beings",
    description: "Guidance and clearings from spiritual beings and subtle allies."
  },
  {
    id: "activations",
    name: "Heart & Light Activations",
    description: "Activations and meditations for heart, intuition, and light body."
  },
  {
    id: "animalSpirits",
    name: "Animal Spirits",
    description: "Journeys to connect with the spirits of animals."
  }
];

export const LIBRARY_ITEMS: LibraryItem[] = [
  // Breath & Energy
  {
    id: "use-breath-relax-energize",
    categoryId: "breathEnergy",
    title: "Use Breath to Relax and Energize",
    teacher: "Christopher August",
    url: "https://www.youtube.com/watch?v=hxDKLyJ0Q0E",
    youtubeId: "hxDKLyJ0Q0E",
    durationLabel: "5 min",
    durationMinutes: 5,
    intents: ["breathwork", "feelBetter"],
    primaryPath: "body",
    primaryDomain: "health"
  },
  {
    id: "feel-better-fast-energy-boost",
    categoryId: "breathEnergy",
    title: "Feel Better Fast | Daily Energy Boost",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=fd7SIapXES4",
    youtubeId: "fd7SIapXES4",
    durationLabel: "5 min",
    durationMinutes: 5,
    intents: ["breathwork", "feelBetter", "activation"],
    primaryPath: "body",
    primaryDomain: "health"
  },
  {
    id: "heart-coherence-breathing",
    categoryId: "breathEnergy",
    title: "Heart Coherence Breathing",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=XNINqgkZVEU",
    youtubeId: "XNINqgkZVEU",
    durationLabel: "5 min",
    durationMinutes: 5,
    intents: ["breathwork", "feelBetter"],
    primaryPath: "body",
    secondaryPath: "emotions",
    primaryDomain: "health"
  },
  {
    id: "energizing-breath-of-fire",
    categoryId: "breathEnergy",
    title: "Energizing Breath of Fire",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=GPo4EFq4XeY",
    youtubeId: "GPo4EFq4XeY",
    durationLabel: "5 min",
    durationMinutes: 5,
    intents: ["breathwork", "activation"],
    primaryPath: "body",
    primaryDomain: "health"
  },
  {
    id: "vagus-nerve-reset-anxiety",
    categoryId: "breathEnergy",
    title: "Vagus Nerve Reset to Stop Anxiety",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=gVtaA8u4SFs",
    youtubeId: "gVtaA8u4SFs",
    durationLabel: "5 min",
    durationMinutes: 5,
    intents: ["breathwork", "feelBetter"],
    primaryPath: "body",
    secondaryPath: "emotions",
    primaryDomain: "health"
  },
  {
    id: "feel-high-naturally",
    categoryId: "breathEnergy",
    title: "Feel High Naturally",
    url: "https://www.youtube.com/watch?v=70obRpYkeFc",
    youtubeId: "70obRpYkeFc",
    durationLabel: "5 min",
    durationMinutes: 5,
    intents: ["breathwork", "activation", "feelBetter"],
    primaryPath: "body",
    primaryDomain: "happiness"
  },
  {
    id: "regulate-nervous-system-8min",
    categoryId: "breathEnergy",
    title: "Regulate Your Nervous System",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=61-mn1d5RIM",
    youtubeId: "61-mn1d5RIM",
    durationLabel: "8 min",
    durationMinutes: 8,
    intents: ["breathwork", "feelBetter"],
    primaryPath: "body",
    primaryDomain: "health"
  },
  {
    id: "feel-better",
    categoryId: "breathEnergy",
    title: "Feel Better",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=GdiQVpWsxeU",
    youtubeId: "GdiQVpWsxeU",
    durationLabel: "8 min",
    durationMinutes: 8,
    intents: ["breathwork", "feelBetter"],
    primaryPath: "body",
    primaryDomain: "happiness"
  },
  {
    id: "boost-life-force-energy",
    categoryId: "breathEnergy",
    title: "Boost Life Force Energy",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=wrVG0CYJyWc&t=1s",
    youtubeId: "wrVG0CYJyWc",
    durationLabel: "8 min",
    durationMinutes: 8,
    intents: ["breathwork", "activation"],
    primaryPath: "body",
    secondaryPath: "spirit",
    primaryDomain: "health"
  },
  {
    id: "energy-1",
    categoryId: "breathEnergy",
    title: "Energy",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=errP3gH9OlE",
    youtubeId: "errP3gH9OlE",
    durationLabel: "8 min",
    durationMinutes: 8,
    intents: ["breathwork", "activation"],
    primaryPath: "body",
    primaryDomain: "health"
  },
  {
    id: "energy-to-start-your-day",
    categoryId: "breathEnergy",
    title: "Energy to Start Your Day",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=errP3gH9OlE",
    youtubeId: "errP3gH9OlE",
    durationLabel: "8 min",
    durationMinutes: 8,
    intents: ["breathwork", "activation"],
    primaryPath: "body",
    primaryDomain: "health"
  },
  {
    id: "heart-coherence-stress-relief",
    categoryId: "breathEnergy",
    title: "Heart Coherence for Stress Relief",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=OOgBjpQt3yQ",
    youtubeId: "OOgBjpQt3yQ",
    durationLabel: "10 min",
    durationMinutes: 10,
    intents: ["breathwork", "feelBetter"],
    primaryPath: "body",
    secondaryPath: "emotions",
    primaryDomain: "health"
  },
  {
    id: "energy-2",
    categoryId: "breathEnergy",
    title: "Energy",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=BcayO9W3ZDI&t=3s",
    youtubeId: "BcayO9W3ZDI",
    durationLabel: "10 min",
    durationMinutes: 10,
    intents: ["breathwork", "activation"],
    primaryPath: "body",
    primaryDomain: "health"
  },
  {
    id: "rewire-brain-15min",
    categoryId: "breathEnergy",
    title: "Rewire Brain",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=cYXNkVpJVWk",
    youtubeId: "cYXNkVpJVWk",
    durationLabel: "15 min",
    durationMinutes: 15,
    intents: ["breathwork", "activation"],
    primaryPath: "body",
    secondaryPath: "mind",
    primaryDomain: "health"
  },
  {
    id: "chakra-activation",
    categoryId: "breathEnergy",
    title: "Chakra Activation",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=UvVznVFk-OA",
    youtubeId: "UvVznVFk-OA",
    durationLabel: "15 min",
    durationMinutes: 15,
    intents: ["activation", "breathwork"],
    primaryPath: "body",
    secondaryPath: "spirit",
    primaryDomain: "health"
  },
  {
    id: "deep-release",
    categoryId: "breathEnergy",
    title: "Deep Release",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=cXCBsJAJSMk",
    youtubeId: "cXCBsJAJSMk",
    durationLabel: "15 min",
    durationMinutes: 15,
    intents: ["breathwork", "feelBetter"],
    primaryPath: "body",
    secondaryPath: "emotions",
    primaryDomain: "happiness"
  },
  {
    id: "clarity-focus-20min",
    categoryId: "breathEnergy",
    title: "Clarity & Focus",
    teacher: "Christopher August",
    url: "https://www.youtube.com/watch?v=s4FSz1lRUHM",
    youtubeId: "s4FSz1lRUHM",
    durationLabel: "20 min",
    durationMinutes: 20,
    intents: ["breathwork", "activation"],
    primaryPath: "body",
    secondaryPath: "mind",
    primaryDomain: "health"
  },
  {
    id: "soul-activation-christopher",
    categoryId: "breathEnergy",
    title: "Soul Activation",
    teacher: "Christopher August",
    url: "https://www.youtube.com/watch?v=MPK6IfOmmR0",
    youtubeId: "MPK6IfOmmR0",
    durationLabel: "20 min",
    durationMinutes: 20,
    intents: ["activation", "breathwork"],
    primaryPath: "spirit",
    secondaryPath: "body",
    primaryDomain: "growth"
  },

  // Money & Abundance
  {
    id: "spirit-of-money-activation",
    categoryId: "moneyAbundance",
    title: "Money Activations – Working With The Spirit of Money",
    teacher: "Ariel Gatoga",
    url: "https://www.youtube.com/watch?v=W3Mrnf39tVE",
    youtubeId: "W3Mrnf39tVE",
    durationLabel: "20 min",
    durationMinutes: 20,
    intents: ["receiveWisdom", "activation"],
    primaryPath: "uniqueness",
    secondaryPath: "mind",
    primaryDomain: "wealth"
  },
  {
    id: "manifest-unexpected-money",
    categoryId: "moneyAbundance",
    title: "Manifest UNEXPECTED Money",
    teacher: "Sri Akarshana",
    url: "https://www.youtube.com/watch?v=r4mRoB7CEno",
    youtubeId: "r4mRoB7CEno",
    durationLabel: "20 min",
    durationMinutes: 20,
    intents: ["receiveWisdom", "activation"],
    primaryPath: "uniqueness",
    secondaryPath: "mind",
    primaryDomain: "wealth"
  },

  // Reality Wisdom
  {
    id: "bashar-reality-wisdom-1",
    categoryId: "realityWisdom",
    title: "Learn about Reality – Wisdom Nugget",
    teacher: "Bashar",
    url: "https://youtube.com/shorts/VhyByp4_t8U?si=4EJIqq8udHG5FZfo",
    youtubeId: "VhyByp4_t8U",
    durationLabel: "2 min",
    durationMinutes: 2,
    intents: ["receiveWisdom"],
    primaryPath: "mind",
    primaryDomain: "growth"
  },
  {
    id: "bashar-reality-wisdom-2",
    categoryId: "realityWisdom",
    title: "Wisdom Nugget",
    teacher: "Bashar",
    url: "https://www.youtube.com/shorts/U7NPTcxGUBo",
    youtubeId: "U7NPTcxGUBo",
    durationLabel: "2 min",
    durationMinutes: 2,
    intents: ["receiveWisdom"],
    primaryPath: "mind",
    primaryDomain: "growth"
  },

  // Spiritual Guidance
  {
    id: "psychic-clearing-archangel-mikael",
    categoryId: "spiritualGuidance",
    title: "Psychic Clearing with Archangel Mikael",
    teacher: "Stephanie Kojec",
    url: "https://www.youtube.com/watch?v=Dp2AIif-6sk",
    youtubeId: "Dp2AIif-6sk",
    durationLabel: "15 min",
    durationMinutes: 15,
    intents: ["psychic", "activation"],
    primaryPath: "spirit",
    primaryDomain: "growth"
  },

  // Activations
  {
    id: "unity-breath",
    categoryId: "activations",
    title: "Unity Breath",
    teacher: "Drunvalo Melchizedek",
    url: "https://www.youtube.com/watch?v=CUNuj-xgY-w",
    youtubeId: "CUNuj-xgY-w",
    durationLabel: "10 min",
    durationMinutes: 10,
    intents: ["activation"],
    primaryPath: "spirit",
    secondaryPath: "body",
    primaryDomain: "growth"
  },
  {
    id: "heart-meditation-drunvalo",
    categoryId: "activations",
    title: "Heart Meditation",
    teacher: "Drunvalo Melchizedek",
    url: "https://www.youtube.com/watch?v=mja7hKE-BC8",
    youtubeId: "mja7hKE-BC8",
    durationLabel: "20 min",
    durationMinutes: 20,
    intents: ["activation"],
    primaryPath: "emotions",
    secondaryPath: "spirit",
    primaryDomain: "love_relationships"
  },
  {
    id: "violet-emerald-flame-intuition",
    categoryId: "activations",
    title: "Violet and Emerald Flame of Intuition",
    teacher: "Stephanie Kojec",
    url: "https://www.youtube.com/watch?v=pPFXD0e8sLA&t=8s",
    youtubeId: "pPFXD0e8sLA",
    durationLabel: "20 min",
    durationMinutes: 20,
    intents: ["activation", "psychic"],
    primaryPath: "spirit",
    secondaryPath: "mind",
    primaryDomain: "growth"
  },

  // Animal Spirits
  {
    id: "black-panther-journey",
    categoryId: "animalSpirits",
    title: "Black Panther",
    teacher: "Stephanie Kojec",
    url: "https://youtu.be/H8QNRtYqE6U?si=upjYr5eRNyhJYI7z",
    youtubeId: "H8QNRtYqE6U",
    durationLabel: "20 min",
    durationMinutes: 20,
    intents: ["psychic", "activation"],
    primaryPath: "spirit",
    primaryDomain: "growth"
  }
];
