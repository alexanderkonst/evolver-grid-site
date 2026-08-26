export const DEFAULT_REGION = "Global";
export const WEEKLY_CAP = 80;
export const RESULTS_PER_SEARCH = 35;

export const ICPS = [
  {
    id: "post_exit_founders",
    name: "Post-exit founders",
    hypothesis: "A proven founder in a visible next-chapter transition is ready to convert capability into a new offer.",
    strong: ["former founder", "ex-founder", "post-exit", "sabbatical", "career break", "next chapter", "exploring what's next", "recovering founder"],
    weak: ["founder", "entrepreneur", "advisor", "board member"],
    terms: ["former founder sabbatical", "ex-founder career break", "founder exploring what's next", "post-exit founder advisor", "recovering founder", "founder next chapter"]
  },
  {
    id: "fractional_executives",
    name: "Fractional executives",
    hypothesis: "Senior operators with portfolio careers need a precise market position and productized offer.",
    strong: ["fractional", "portfolio career", "fractional cmo", "fractional coo", "fractional cto", "fractional chief"],
    weak: ["consultant", "advisor", "independent", "interim"],
    terms: ["fractional executive founder", "fractional cmo consultant", "fractional coo advisor", "fractional chief strategy officer", "portfolio executive independent", "interim executive consultant"]
  },
  {
    id: "coaches_solopreneurs",
    name: "Coaches & solopreneurs",
    hypothesis: "Experienced practitioners whose profile remains abstract will pay to turn conversations into artifacts and offers.",
    strong: ["executive coach", "founder coach", "leadership coach", "solopreneur", "independent coach", "career coach"],
    weak: ["coach", "facilitator", "mentor", "consultant"],
    terms: ["executive coach solopreneur", "founder coach independent", "leadership coach consultant", "career coach next chapter", "business coach positioning", "independent facilitator coach"]
  },
  {
    id: "consultants_transition",
    name: "Big Four / MBB transition",
    hypothesis: "Senior consultants approaching an up-or-out transition want to build the next chapter in parallel.",
    strong: ["mckinsey", "bcg", "bain", "deloitte", "pwc", "ey", "kpmg", "ex-consultant"],
    weak: ["strategy consultant", "management consultant", "principal", "engagement manager"],
    terms: ["McKinsey engagement manager career break", "BCG principal transition", "Bain consultant next chapter", "Deloitte director independent", "PwC director career transition", "KPMG partner advisor"]
  },
  {
    id: "community_holders",
    name: "Community & ecosystem holders",
    hypothesis: "Leaders of trusted founder communities can distribute workshops and later buy onboarding and matching infrastructure.",
    strong: ["community founder", "ecosystem lead", "community director", "network founder", "venture studio", "accelerator director"],
    weak: ["community", "ecosystem", "network", "accelerator", "incubator", "membership"],
    terms: ["founder community director", "entrepreneur community founder", "venture studio ecosystem lead", "accelerator community director", "membership community founder", "innovation ecosystem partnerships"]
  }
];

const roleRules = [
  [/(founder|co-?founder|owner|chief executive|\bceo\b|managing director|principal)/i, 30, "decision-maker"],
  [/(partnerships?|business development|alliances?|ecosystem lead)/i, 28, "partnership owner"],
  [/(general manager|\bgm\b|director|head of|\bvp\b|vice president)/i, 18, "senior leader"]
];
const penaltyRe = /(open\s*to\s*work|student|intern(ship)?|recruiter|talent acquisition)/i;
const activeTransitionRe = /(career break|sabbatical|next chapter|in transition|exploring|reinventing|pivoting|former|ex-founder|post-exit)/i;
const topMarketsRe = /(united states|\busa\b|canada|united kingdom|\buk\b|australia|singapore|dubai|new york|san francisco|london|toronto|sydney|melbourne)/i;

const normalize = (value = "") => String(value).toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
const contains = (text, term) => normalize(text).includes(normalize(term));

export function scorePerson(person, foundByIcpId, region = DEFAULT_REGION) {
  const text = [person.headline, person.currentPosition, person.location].filter(Boolean).join(" · ");
  const candidates = ICPS.map(icp => {
    const strong = icp.strong.find(term => contains(text, term));
    const weak = icp.weak.find(term => contains(text, term));
    return { icp, keyword: strong ? 40 : weak ? 20 : icp.id === foundByIcpId ? 10 : 0, match: strong || weak || "search-source only" };
  }).sort((a, b) => b.keyword - a.keyword);
  const best = candidates[0];
  const role = roleRules.find(([re]) => re.test(text)) || [null, 5, "role unclear"];
  const degree = normalize(person.connectionDegree);
  const reachability = degree.includes("2nd") ? 15 : degree.includes("1st") ? 8 : 3;
  const regionPoints = region === "Global" ? 10 : contains(person.location, region) ? 15 : 3;
  const transition = activeTransitionRe.test(text) ? 10 : 0;
  const market = region === "Global" && topMarketsRe.test(person.location || "") ? 5 : 0;
  const penalty = penaltyRe.test(text) ? -15 : 0;
  const raw = best.keyword + role[1] + reachability + regionPoints + transition + market + penalty;
  const score = Math.max(0, Math.min(100, raw));
  return {
    score,
    icpId: best.icp.id,
    icpName: best.icp.name,
    reason: [best.match, role[2], transition ? "visible transition" : null].filter(Boolean).join(" · "),
    breakdown: { keyword: best.keyword, role: role[1], reachability, region: regionPoints, transition, market, penalty }
  };
}

export function canonicalPerson(raw, foundByIcpId, searchTerm, region = DEFAULT_REGION) {
  const profileUrn = raw.profileUrn || raw.participantUrn || raw.profileId || raw.profileUrl;
  if (!profileUrn) throw new Error("Search result has no stable LinkedIn identity");
  const scoring = scorePerson(raw, foundByIcpId, region);
  return {
    id: `linkedin:${profileUrn}`,
    profileUrn,
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    name: raw.name || [raw.firstName, raw.lastName].filter(Boolean).join(" ") || "Unknown",
    headline: raw.headline || raw.currentPosition || "",
    currentPosition: raw.currentPosition || "",
    location: raw.location || "",
    connectionDegree: raw.connectionDegree || "",
    profileUrl: raw.profileUrl || "",
    source: { channel: "linkedin", mechanism: "icp_search", searchTerm, foundByIcpId, capturedAt: new Date().toISOString() },
    commercial: { stage: "prospect", repliedAt: null, callAt: null, offerAt: null, paymentAt: null, deliveredAt: null, expansionAt: null },
    ...scoring
  };
}

export function mergePeople(existing, incoming) {
  const map = new Map(existing.map(person => [person.profileUrn, person]));
  for (const person of incoming) {
    const old = map.get(person.profileUrn);
    map.set(person.profileUrn, old ? {
      ...old,
      ...person,
      source: old.source,
      commercial: old.commercial,
      score: Math.max(old.score || 0, person.score || 0),
      searches: [...new Set([...(old.searches || [old.source?.searchTerm]).filter(Boolean), person.source?.searchTerm].filter(Boolean))]
    } : { ...person, searches: [person.source?.searchTerm].filter(Boolean) });
  }
  return [...map.values()];
}

export function mondayUtc(timestamp = Date.now()) {
  const d = new Date(timestamp);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (day === 0 ? 6 : day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

export function weeklyRequestCount(requests, now = Date.now()) {
  const floor = mondayUtc(now);
  return requests.filter(r => new Date(r.sentAt || r.queuedAt).getTime() >= floor && r.status !== "failed").length;
}

export function parseToolResult(result) {
  if (result?.isError) throw new Error(result.content?.[0]?.text || "MCP call failed");
  if (result?.structuredContent) return result.structuredContent;
  const text = result?.content?.[0]?.text;
  if (!text) return result;
  try { return JSON.parse(text); } catch { return { text }; }
}
