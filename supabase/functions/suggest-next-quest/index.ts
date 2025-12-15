/**
 * suggest-next-quest — Side Quest (Practice) Recommender
 * 
 * This function recommends practices from the library based on player intention.
 * It uses AI to select the best practice match.
 * 
 * NOTE: This is the "Side Quest" recommender, not the Main Quest state machine.
 * Main Quest progression is handled by suggest-main-quest function.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Practice {
  title: string;
  type: string;
  duration_minutes: number;
  description?: string;
  primary_path?: string;
  secondary_path?: string;
}

interface NextQuestContext {
  lowestDomains?: string[];
  archetypeTitle?: string;
  corePattern?: string;
  pathSlug?: "body" | "mind" | "emotions" | "spirit" | "uniqueness" | "any";
}

interface SuggestQuestRequest {
  intention: string;
  practices: Practice[];
  context?: NextQuestContext;
}

// Normalize legacy path slugs to canonical domain slugs
const normalizeDomainSlug = (slug: string | undefined): string | null => {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();

  const legacyMap: Record<string, string> = {
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

  return legacyMap[normalized] || (['spirit', 'mind', 'emotions', 'uniqueness', 'body'].includes(normalized) ? normalized : null);
};

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
      // Allow anonymous access for guest users who aren't logged in
      // The game supports both authenticated and guest modes
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

    // Normalize any legacy path slugs in context
    const normalizedPathSlug = context?.pathSlug && context.pathSlug !== 'any'
      ? normalizeDomainSlug(context.pathSlug)
      : context?.pathSlug;

    // Build context description for the LLM
    let contextDescription = '';
    if (normalizedPathSlug && normalizedPathSlug !== 'any') {
      const pathNames: Record<string, string> = {
        body: 'Body',
        mind: 'Mind',
        emotions: 'Emotions',
        spirit: 'Spirit',
        uniqueness: 'Uniqueness'
      };
      contextDescription += `\n- Selected development path: ${pathNames[normalizedPathSlug] || normalizedPathSlug}`;
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
- intention: what the player most wants right now (e.g. "Calm my nervous system", "Feel clearer about money")
${contextDescription ? `- context about the player:${contextDescription}` : ''}
- a list of practices from a library, where each practice has: title, type, duration_minutes, primary_path, secondary_path, and optional description

YOUR TASK:
Choose ONE practice as the Main Quest:
- It must be doable today and clearly helpful for the intention
${normalizedPathSlug && normalizedPathSlug !== 'any' ? `- STRONGLY prefer practices whose primary_path or secondary_path matches "${normalizedPathSlug}"` : ''}
${context?.lowestDomains ? `- Also consider practices that support these life domains: ${context.lowestDomains.join(', ')}` : ''}
${context?.archetypeTitle ? `- Pick something that fits their archetype: ${context.archetypeTitle}` : ''}

Optionally choose up to TWO alternative practices that would also be good next steps.

For each selected practice, return:
- quest_title: the practice title
- practice_type: the type
- approx_duration_minutes: rounded duration in minutes
- why_it_is_a_good_next_move: 1-2 sentences that:
  * reference the intention
  * mention the development path (body/mind/heart/spirit/uniqueness & work) in plain language at least once
  ${context?.lowestDomains ? `* optionally mention the weakest domain(s) if relevant` : ''}
  ${context?.archetypeTitle ? `* optionally reference their archetype if relevant` : ''}

Tone: Grounded, kind, precise. No fluff or vague spiritual clichés.

Return ONLY valid JSON in this exact shape (no markdown, no backticks):
{
  "main": {
    "quest_title": "...",
    "practice_type": "...",
    "approx_duration_minutes": 8,
    "why_it_is_a_good_next_move": "..."
  },
  "alternatives": [
    {
      "quest_title": "...",
      "practice_type": "...",
      "approx_duration_minutes": 12,
      "why_it_is_a_good_next_move": "..."
    }
  ]
}`;

    const userPrompt = `Player's intention: "${intention}"

Available practices:
${practices.map(p => `- ${p.title} (${p.type}, ${p.duration_minutes} min, primary_path: ${p.primary_path || 'none'}, secondary_path: ${p.secondary_path || 'none'})${p.description ? `: ${p.description}` : ''}`).join('\n')}

Select the best Main Quest and up to 2 alternatives.`;

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

    // Parse the JSON response
    const result = JSON.parse(content);

    return new Response(
      JSON.stringify(result),
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