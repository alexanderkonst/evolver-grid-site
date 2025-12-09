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

        const { testType, imageBase64 } = await req.json();

        if (!testType || !imageBase64) {
            return new Response(
                JSON.stringify({ error: 'testType and imageBase64 are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
            throw new Error('LOVABLE_API_KEY is not configured');
        }

        // Build prompt based on test type
        let prompt = '';
        if (testType === 'enneagram') {
            prompt = `Analyze this Enneagram test results screenshot. Extract all 9 type scores and identify the primary type (highest score).

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "primary_type": <number 1-9>,
  "primary_name": "<name like 'The Enthusiast'>",
  "scores": {
    "type_1": <number>,
    "type_2": <number>,
    "type_3": <number>,
    "type_4": <number>,
    "type_5": <number>,
    "type_6": <number>,
    "type_7": <number>,
    "type_8": <number>,
    "type_9": <number>
  }
}`;
        } else if (testType === '16personalities') {
            prompt = `Analyze this 16 Personalities (MBTI) test results screenshot. Extract the personality type code and trait percentages.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "type_code": "<4 letters like 'ENFP'>",
  "type_name": "<name like 'The Campaigner'>",
  "variant": "<'Assertive' or 'Turbulent'>",
  "traits": {
    "extroversion": <number 0-100>,
    "intuition": <number 0-100>,
    "feeling": <number 0-100>,
    "perceiving": <number 0-100>,
    "assertive": <number 0-100>
  }
}`;
        } else if (testType === 'human_design') {
            prompt = `Analyze this Human Design chart screenshot. Extract the key elements.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "type": "<type like 'Manifesting Generator'>",
  "strategy": "<strategy like 'Wait to respond'>",
  "authority": "<authority like 'Sacral'>",
  "profile": "<profile like '3/5'>",
  "definition": "<definition like 'Single'>",
  "incarnation_cross": "<cross name if visible, otherwise null>"
}`;
        } else {
            return new Response(
                JSON.stringify({ error: 'Unknown test type. Supported: enneagram, 16personalities, human_design' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Call Lovable AI with vision
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
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
                        ]
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
                JSON.stringify({ error: 'AI analysis failed' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        let results;
        try {
            // Try to extract JSON from response (may have markdown wrapper)
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                results = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', generatedText);
            return new Response(
                JSON.stringify({ error: 'Could not parse results from image. Please try a clearer screenshot.' }),
                { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Add metadata
        results.test_type = testType;
        results.uploaded_at = new Date().toISOString();

        return new Response(
            JSON.stringify({ success: true, results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in analyze-personality-test function:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
