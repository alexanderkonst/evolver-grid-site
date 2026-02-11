/**
 * Equilibrium — AI Insight Client
 * 
 * Calls the generate-equilibrium-insight edge function,
 * caches in sessionStorage for 30 minutes, and provides fallback.
 */

const CACHE_KEY = 'equilibrium-ai-insight';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const TIMEOUT_MS = 10_000;

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export interface AIInsight {
  insight: string;
  activities: string[];
}

interface CachedInsight {
  data: AIInsight;
  timestamp: number;
  cacheKey: string; // hash of inputs to bust cache when energy changes
}

function makeCacheKey(dayEnergy: string, dominantPhase: string): string {
  return `${dayEnergy}|${dominantPhase}`;
}

/** Fallback templates matching the same format the AI returns */
const FALLBACK_MAP: Record<string, AIInsight> = {
  'will': { insight: 'Planning energy present', activities: ['strategizing', 'choosing priorities'] },
  'emanation': { insight: 'Build energy present', activities: ['deep work', 'creating'] },
  'digestion': { insight: 'Communication energy present', activities: ['sharing', 'conversations'] },
  'enrichment': { insight: 'Integration energy present', activities: ['reflecting', 'reviewing'] },
};

export function getFallbackInsight(dominantPhase: string): AIInsight {
  return FALLBACK_MAP[dominantPhase] || FALLBACK_MAP['emanation'];
}

export async function fetchAIInsight(
  dayEnergy: string,
  moonEnergy: string,
  dominantPhase: string,
  coherenceLevel: string,
  userIntention: string | null,
): Promise<AIInsight> {
  // Check cache
  const inputKey = makeCacheKey(dayEnergy, dominantPhase);
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: CachedInsight = JSON.parse(raw);
      if (cached.cacheKey === inputKey && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }
  } catch { /* ignore */ }

  if (!SUPABASE_URL) {
    return getFallbackInsight(dominantPhase);
  }

  // Fetch with timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/generate-equilibrium-insight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ dayEnergy, moonEnergy, dominantPhase, coherenceLevel, userIntention }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!resp.ok) {
      console.warn('AI insight fetch failed:', resp.status);
      return getFallbackInsight(dominantPhase);
    }

    const data: AIInsight = await resp.json();

    // Cache result
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
        cacheKey: inputKey,
      } as CachedInsight));
    } catch { /* storage full, ignore */ }

    return data;
  } catch (e) {
    clearTimeout(timer);
    console.warn('AI insight error:', e);
    return getFallbackInsight(dominantPhase);
  }
}
