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

export type LibraryItem = {
  id: string;
  categoryId: LibraryCategoryId;
  title: string;
  teacher?: string;
  url: string;
  youtubeId: string;
  durationLabel?: string;
  durationMinutes?: number;
};

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: "breathEnergy",
    name: "Breath & Energy",
    description: "Short breathwork and nervous system practices to regulate, energize, and uplift."
  },
  {
    id: "moneyAbundance",
    name: "Money & Abundance",
    description: "Practices and transmissions around the spirit of money, abundance, and receiving."
  },
  {
    id: "realityWisdom",
    name: "Reality Wisdom",
    description: "Wisdom nuggets about the nature of reality, consciousness, and creation."
  },
  {
    id: "spiritualGuidance",
    name: "Spiritual Guidance",
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
    description: "Coming soon: journeys to connect with the spirits of animals."
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
    durationMinutes: 5
  },
  {
    id: "feel-better-fast-energy-boost",
    categoryId: "breathEnergy",
    title: "Feel Better Fast | Daily Energy Boost",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=fd7SIapXES4",
    youtubeId: "fd7SIapXES4"
  },
  {
    id: "heart-coherence-breathing",
    categoryId: "breathEnergy",
    title: "Heart Coherence Breathing",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=XNINqgkZVEU",
    youtubeId: "XNINqgkZVEU"
  },
  {
    id: "energizing-breath-of-fire",
    categoryId: "breathEnergy",
    title: "Energizing Breath of Fire",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=GPo4EFq4XeY",
    youtubeId: "GPo4EFq4XeY"
  },
  {
    id: "vagus-nerve-reset-anxiety",
    categoryId: "breathEnergy",
    title: "Vagus Nerve Reset to Stop Anxiety",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=gVtaA8u4SFs",
    youtubeId: "gVtaA8u4SFs"
  },
  {
    id: "feel-high-naturally",
    categoryId: "breathEnergy",
    title: "Feel High Naturally",
    url: "https://www.youtube.com/watch?v=70obRpYkeFc",
    youtubeId: "70obRpYkeFc"
  },
  {
    id: "regulate-nervous-system-7min",
    categoryId: "breathEnergy",
    title: "Regulate Your Nervous System",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=61-mn1d5RIM",
    youtubeId: "61-mn1d5RIM",
    durationLabel: "7 min",
    durationMinutes: 7
  },
  {
    id: "feel-better",
    categoryId: "breathEnergy",
    title: "Feel Better",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=GdiQVpWsxeU",
    youtubeId: "GdiQVpWsxeU"
  },
  {
    id: "boost-life-force-energy",
    categoryId: "breathEnergy",
    title: "Boost Life Force Energy",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=wrVG0CYJyWc&t=1s",
    youtubeId: "wrVG0CYJyWc"
  },
  {
    id: "energy-1",
    categoryId: "breathEnergy",
    title: "Energy",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=errP3gH9OlE",
    youtubeId: "errP3gH9OlE"
  },
  {
    id: "energy-to-start-your-day",
    categoryId: "breathEnergy",
    title: "Energy to Start Your Day",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=errP3gH9OlE",
    youtubeId: "errP3gH9OlE"
  },
  {
    id: "heart-coherence-stress-relief",
    categoryId: "breathEnergy",
    title: "Heart Coherence for Stress Relief",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=OOgBjpQt3yQ",
    youtubeId: "OOgBjpQt3yQ",
    durationLabel: "10 min",
    durationMinutes: 10
  },
  {
    id: "energy-2",
    categoryId: "breathEnergy",
    title: "Energy",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=BcayO9W3ZDI&t=3s",
    youtubeId: "BcayO9W3ZDI"
  },
  {
    id: "rewire-brain-15min",
    categoryId: "breathEnergy",
    title: "Rewire Brain",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=cYXNkVpJVWk",
    youtubeId: "cYXNkVpJVWk",
    durationLabel: "15 min",
    durationMinutes: 15
  },
  {
    id: "chakra-activation",
    categoryId: "breathEnergy",
    title: "Chakra Activation",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=UvVznVFk-OA",
    youtubeId: "UvVznVFk-OA"
  },
  {
    id: "deep-release",
    categoryId: "breathEnergy",
    title: "Deep Release",
    teacher: "Sandy",
    url: "https://www.youtube.com/watch?v=cXCBsJAJSMk",
    youtubeId: "cXCBsJAJSMk"
  },
  {
    id: "clarity-focus-20min",
    categoryId: "breathEnergy",
    title: "Clarity & Focus",
    teacher: "Christopher August",
    url: "https://www.youtube.com/watch?v=s4FSz1lRUHM",
    youtubeId: "s4FSz1lRUHM",
    durationLabel: "20 min",
    durationMinutes: 20
  },
  {
    id: "soul-activation-christopher",
    categoryId: "breathEnergy",
    title: "Soul Activation",
    teacher: "Christopher August",
    url: "https://www.youtube.com/watch?v=MPK6IfOmmR0",
    youtubeId: "MPK6IfOmmR0"
  },

  // Money & Abundance
  {
    id: "spirit-of-money-activation",
    categoryId: "moneyAbundance",
    title: "Money Activations – Working With The Spirit of Money",
    teacher: "Ariel Gatoga",
    url: "https://www.youtube.com/watch?v=W3Mrnf39tVE",
    youtubeId: "W3Mrnf39tVE"
  },
  {
    id: "manifest-unexpected-money",
    categoryId: "moneyAbundance",
    title: "Manifest UNEXPECTED Money",
    teacher: "Sri Akarshana",
    url: "https://www.youtube.com/watch?v=r4mRoB7CEno",
    youtubeId: "r4mRoB7CEno"
  },

  // Reality Wisdom
  {
    id: "bashar-reality-wisdom-1",
    categoryId: "realityWisdom",
    title: "Learn about Reality – Wisdom Nugget",
    teacher: "Bashar",
    url: "https://youtube.com/shorts/VhyByp4_t8U?si=4EJIqq8udHG5FZfo",
    youtubeId: "VhyByp4_t8U"
  },
  {
    id: "bashar-reality-wisdom-2",
    categoryId: "realityWisdom",
    title: "Wisdom Nugget",
    teacher: "Bashar",
    url: "https://www.youtube.com/shorts/U7NPTcxGUBo",
    youtubeId: "U7NPTcxGUBo"
  },

  // Spiritual Guidance
  {
    id: "psychic-clearing-archangel-mikael",
    categoryId: "spiritualGuidance",
    title: "Psychic Clearing with Archangel Mikael",
    teacher: "Stephanie Kojec",
    url: "https://www.youtube.com/watch?v=Dp2AIif-6sk",
    youtubeId: "Dp2AIif-6sk"
  },

  // Activations
  {
    id: "unity-breath",
    categoryId: "activations",
    title: "Unity Breath",
    teacher: "Drunvalo Melchizedek",
    url: "https://www.youtube.com/watch?v=CUNuj-xgY-w",
    youtubeId: "CUNuj-xgY-w"
  },
  {
    id: "heart-meditation-drunvalo",
    categoryId: "activations",
    title: "Heart Meditation",
    teacher: "Drunvalo Melchizedek",
    url: "https://www.youtube.com/watch?v=mja7hKE-BC8",
    youtubeId: "mja7hKE-BC8"
  },
  {
    id: "violet-emerald-flame-intuition",
    categoryId: "activations",
    title: "Violet and Emerald Flame of Intuition",
    teacher: "Stephanie Kojec",
    url: "https://www.youtube.com/watch?v=pPFXD0e8sLA&t=8s",
    youtubeId: "pPFXD0e8sLA"
  }
];
