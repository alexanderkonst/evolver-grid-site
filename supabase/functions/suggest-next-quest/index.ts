/**
 * suggest-next-quest — Side Quest (Practice) Recommender
 * 
 * This function recommends practices from the library based on player intention.
 * It uses AI to select the best practice match.
 * 
 * NOTE: This is the "Side Quest" recommender, not the Main Quest state machine.
 * Main Quest progression is handled by suggest-main-quest function.
 * 
 * Output Contract:
 * {
 *   "domain": "spirit|mind|uniqueness|emotions|body",
 *   "practice": {
 *     "id": "string",
 *     "title": "string",
 *     "duration_min": 5,
 *     "tags": ["string"],
 *     "source": "library"
 *   },
 *   "why": ["bullet 1", "bullet 2"],
 *   "alternatives": [
 *     {"id":"string","title":"string","duration_min":10}
 *   ]
 * }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Canonical domain slugs
const CANONICAL_DOMAINS = ['spirit', 'mind', 'uniqueness', 'emotions', 'body'] as const;
type CanonicalDomain = typeof CANONICAL_DOMAINS[number];

interface Practice {
  id?: string;
  title: string;
  type: string;
  duration_minutes: number;
  description?: string;
  primary_path?: string;
  secondary_path?: string;
  tags?: string[];
}

interface SuggestQuestContext {
  lowestDomains?: string[];
  archetypeTitle?: string;
  corePattern?: string;
  pathSlug?: string;
}

interface SuggestQuestRequest {
  intention: string;
  practices: Practice[];
  context?: SuggestQuestContext;
}

interface SideQuestResponse {
  domain: CanonicalDomain;
  practice: {
    id: string;
    title: string;
    duration_min: number;
    tags: string[];
    source: 'library';
  };
  why: string[];
  alternatives: Array<{
    id: string;
    title: string;
    duration_min: number;
  }>;
}

/**
 * Normalize legacy path slugs to canonical domain slugs
 */
function normalizeDomainSlug(slug: string | undefined): CanonicalDomain | null {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();

  const legacyMap: Record<string, CanonicalDomain> = {
    // Legacy -> Canonical
    'waking-up': 'spirit',
    'waking_up': 'spirit',
    'growing-up': 'mind',
    'growing_up': 'mind',
    'cleaning-up': 'emotions',
    'cleaning_up': 'emotions',
    'heart': 'emotions',
    'showing-up': 'uniqueness',
    'showing_up': 'uniqueness',
    'uniqueness_work': 'uniqueness',
    'grounding': 'body',
  };

  if (legacyMap[normalized]) {
    return legacyMap[normalized];
  }

  if (CANONICAL_DOMAINS.includes(normalized as CanonicalDomain)) {
    return normalized as CanonicalDomain;
  }

  return null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Auth check - allowing anonymous access for guest users');
    }

    const { intention, practices, context }: SuggestQuestRequest = await req.json();

    if (!intention || !practices || practices.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing intention or practices' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Normalize path slug and all practice paths
    const normalizedPathSlug = normalizeDomainSlug(context?.pathSlug);
    const normalizedPractices = practices.map(p => ({
      ...p,
      primary_path: normalizeDomainSlug(p.primary_path) || p.primary_path,
      secondary_path: normalizeDomainSlug(p.secondary_path) || p.secondary_path,
    }));

    // Build context description for the LLM
    let contextDescription = '';
    if (normalizedPathSlug) {
      contextDescription += `\n- Selected development path: ${normalizedPathSlug}`;
    }
    if (context?.lowestDomains && context.lowestDomains.length > 0) {
      contextDescription += `\n- Lowest life domain(s): ${context.lowestDomains.join(', ')}`;
    }
    if (context?.archetypeTitle) {
      contextDescription += `\n- Zone of Genius archetype: ${context.archetypeTitle}`;
    }
    if (context?.corePattern) {
      contextDescription += `\n- Core pattern: ${context.corePattern}`;
    }

    const systemPrompt = `You are a guide inside a life-RPG called "Game of You".

You receive:
- intention: what the player most wants right now
${contextDescription ? `- context about the player:${contextDescription}` : ''}
- a list of practices from a library

YOUR TASK:
Choose ONE practice as a Side Quest (a practice the player can do today).
${normalizedPathSlug ? `- STRONGLY prefer practices whose primary_path matches "${normalizedPathSlug}"` : ''}
${context?.lowestDomains ? `- Consider practices that support: ${context.lowestDomains.join(', ')}` : ''}

Also choose up to TWO alternative practices.

IMPORTANT: The only valid domain values are: spirit, mind, uniqueness, emotions, body
Map any legacy paths: waking-up→spirit, growing-up→mind, cleaning-up→emotions, showing-up→uniqueness, heart→emotions, grounding→body

Return ONLY valid JSON (no markdown, no backticks) in this exact shape:
{
  "domain": "spirit|mind|uniqueness|emotions|body",
  "practice": {
    "id": "practice-id-from-input",
    "title": "Practice Title",
    "duration_min": 10,
    "tags": ["meditation", "breathwork"],
    "source": "library"
  },
  "why": [
    "First reason this practice helps with the intention",
    "Second reason connecting to their archetype or domain"
  ],
  "alternatives": [
    {"id": "alt-id-1", "title": "Alternative Practice 1", "duration_min": 15},
    {"id": "alt-id-2", "title": "Alternative Practice 2", "duration_min": 8}
  ]
}

Tone: Grounded, kind, precise. No fluff.`;

    const userPrompt = `Player's intention: "${intention}"

Available practices:
${normalizedPractices.map(p => `- id: "${p.id || p.title.toLowerCase().replace(/\s+/g, '-')}", title: "${p.title}", type: ${p.type}, ${p.duration_minutes} min, domain: ${p.primary_path || 'any'}, tags: [${p.tags?.join(', ') || p.type}]${p.description ? ` — ${p.description}` : ''}`).join('\n')}

Select the best Side Quest and up to 2 alternatives.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse and validate the JSON response
    const aiResult = JSON.parse(content);

    // Ensure domain is canonical
    const responseDomain = normalizeDomainSlug(aiResult.domain) || 'spirit';

    // Build validated response
    const validatedResponse: SideQuestResponse = {
      domain: responseDomain,
      practice: {
        id: aiResult.practice?.id || 'unknown',
        title: aiResult.practice?.title || 'Practice',
        duration_min: aiResult.practice?.duration_min || 10,
        tags: aiResult.practice?.tags || [],
        source: 'library',
      },
      why: Array.isArray(aiResult.why) ? aiResult.why : [aiResult.why || 'This practice aligns with your intention.'],
      alternatives: (aiResult.alternatives || []).map((alt: any) => ({
        id: alt.id || alt.title?.toLowerCase().replace(/\s+/g, '-') || 'alt',
        title: alt.title || 'Alternative',
        duration_min: alt.duration_min || alt.approx_duration_minutes || 10,
      })),
    };

    return new Response(
      JSON.stringify(validatedResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in suggest-next-quest:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);