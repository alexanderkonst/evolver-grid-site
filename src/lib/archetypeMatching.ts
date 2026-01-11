const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
  architect: ["architect", "integration", "pattern", "code", "coherence"],
  mirror: ["mirror", "reflect", "truth", "healing", "space"],
  cartographer: ["cartographer", "network", "connection", "timing", "bridge"],
  builder: ["builder", "structure", "vision", "form", "create"],
};

const COMPLEMENTARY_PAIRS = new Set([
  "architect:mirror",
  "mirror:architect",
  "cartographer:builder",
  "builder:cartographer",
  "architect:builder",
  "builder:architect",
  "mirror:cartographer",
  "cartographer:mirror",
]);

const normalize = (value: string) => value.toLowerCase().trim();

export const getArchetypeKey = (archetype: string): string | null => {
  const normalized = normalize(archetype);
  const entries = Object.entries(ARCHETYPE_KEYWORDS);

  for (const [key, keywords] of entries) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return key;
    }
  }

  return null;
};

export const areComplementary = (archetype1: string, archetype2: string): boolean => {
  const key1 = getArchetypeKey(archetype1);
  const key2 = getArchetypeKey(archetype2);
  if (!key1 || !key2) return false;
  return COMPLEMENTARY_PAIRS.has(`${key1}:${key2}`);
};

export const getComplementarityLabel = (archetype1: string, archetype2: string): string | null => {
  if (!areComplementary(archetype1, archetype2)) return null;

  const key1 = getArchetypeKey(archetype1);
  const key2 = getArchetypeKey(archetype2);
  if (!key1 || !key2) return null;

  if ((key1 === "architect" && key2 === "builder") || (key1 === "builder" && key2 === "architect")) {
    return "Ideas → Action pairing";
  }
  if ((key1 === "mirror" && key2 === "cartographer") || (key1 === "cartographer" && key2 === "mirror")) {
    return "Individual → Collective pairing";
  }
  if ((key1 === "architect" && key2 === "mirror") || (key1 === "mirror" && key2 === "architect")) {
    return "Healing → Creating pairing";
  }
  if ((key1 === "cartographer" && key2 === "builder") || (key1 === "builder" && key2 === "cartographer")) {
    return "Vision → Structure pairing";
  }
  return "Complementary archetype";
};
