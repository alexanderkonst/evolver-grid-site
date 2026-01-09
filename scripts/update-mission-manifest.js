import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, "src", "modules", "mission-discovery", "data");
const manifestPath = path.join(repoRoot, "public", "mission-manifest.json");

const readFile = (file) => fs.readFileSync(path.join(dataDir, file), "utf8");

const countIds = (text) => {
  const ids = [...text.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  return ids.length;
};

const countByPillar = (text) => {
  const counts = {};
  for (const match of text.matchAll(/\boutcomeId:\s*["']([^"']+)["']/g)) {
    const outcomeId = match[1];
    const pillarMatch = outcomeId.match(/^([a-z]+)-focus-area-/);
    const pillar = pillarMatch ? pillarMatch[1] : "unknown";
    counts[pillar] = (counts[pillar] || 0) + 1;
  }
  return counts;
};

const pillarsText = readFile("pillars.ts");
const focusAreasText = readFile("focusAreas.ts");
const challengesText = readFile("challenges.ts");
const outcomesText = readFile("outcomes.ts");
const missionsText = readFile("missions.ts");

const missionsByPillar = countByPillar(missionsText);

const now = new Date();
const version = now.toISOString().slice(0, 10);

const manifest = {
  version,
  generatedAt: now.toISOString(),
  counts: {
    pillars: countIds(pillarsText),
    focusAreas: countIds(focusAreasText),
    challenges: countIds(challengesText),
    outcomes: countIds(outcomesText),
    missions: countIds(missionsText),
  },
  missionsByPillar,
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Mission manifest updated: ${manifestPath}`);
