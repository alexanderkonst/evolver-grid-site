import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { archetype, topTalents, corePattern } = await req.json();

        if (!archetype && !topTalents) {
            return new Response(
                JSON.stringify({ error: 'Zone of Genius data required (archetype or topTalents)' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
            throw new Error('LOVABLE_API_KEY is not configured');
        }

        // Construct the prompt
        const prompt = `Based on this individual's Zone of Genius assessment:
- Archetype: ${archetype || 'Not specified'}
- Top Talents: ${Array.isArray(topTalents) ? topTalents.join(', ') : topTalents || 'Not specified'}
- Core Pattern: ${corePattern || 'Not specified'}

What 3-5 colors best represent their soul's unique essence and light? 
Consider their personality, energy, and the archetypes they embody.
Choose colors that feel aligned with their nature - could be vibrant, earthy, ethereal, or warm depending on their essence.

IMPORTANT: Return ONLY a valid JSON array of hex color codes, nothing else.
Example format: ["#9b5de5", "#f5a623", "#4361ee", "#ff6b35"]`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
            }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                return new Response(
                    JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
                    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            const errorText = await response.text();
            console.error('AI gateway error:', response.status, errorText);
            return new Response(
                JSON.stringify({ error: 'AI gateway error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content || '';

        // Parse the JSON array from the response
        let colors: string[];
        try {
            // Try to extract JSON array from the response
            const jsonMatch = generatedText.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                colors = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON array found');
            }
        } catch (parseError) {
            console.error('Failed to parse colors:', generatedText);
            // Fallback to default colors
            colors = ['#9b5de5', '#f5a623', '#4361ee'];
        }

        // Validate colors are hex codes
        const validColors = colors.filter(c => /^#[0-9A-Fa-f]{6}$/.test(c));
        if (validColors.length < 3) {
            validColors.push(...['#9b5de5', '#f5a623', '#4361ee'].slice(0, 3 - validColors.length));
        }

        // Get user's profile and save colors
        const { data: profile, error: profileError } = await supabase
            .from('game_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (profile && !profileError) {
            await supabase
                .from('game_profiles')
                .update({ soul_colors: validColors })
                .eq('id', profile.id);
        }

        return new Response(
            JSON.stringify({ colors: validColors }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in generate-soul-colors function:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
