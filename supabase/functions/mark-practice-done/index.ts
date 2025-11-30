import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Practice library - simplified version for edge function
const PRACTICE_XP_REWARD = 10; // Fixed XP per practice

interface Practice {
  id: string;
  primaryPath?: string;
  durationMinutes?: number;
}

// We'll import practice data from the request since we can't import from src/
// The frontend will send us the practice details

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { practiceId, primaryPath } = await req.json();

    if (!practiceId) {
      throw new Error('practiceId is required');
    }

    console.log(`Marking practice ${practiceId} as done for user ${user.id}`);

    // Find the user's game profile
    const { data: profile, error: profileError } = await supabase
      .from('game_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    if (!profile) {
      throw new Error('Game profile not found. Please complete the Zone of Genius or Quality of Life assessment first.');
    }

    // Calculate XP and path-specific XP update
    const xpReward = PRACTICE_XP_REWARD;
    const newXpTotal = profile.xp_total + xpReward;
    const newLevel = Math.floor(newXpTotal / 100) + 1;

    // Prepare update object
    const updates: any = {
      xp_total: newXpTotal,
      level: newLevel,
      practice_count: profile.practice_count + 1,
      last_practice_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add path-specific XP if path is provided
    if (primaryPath) {
      const pathXpMap: Record<string, string> = {
        'body': 'xp_body',
        'mind': 'xp_mind',
        'heart': 'xp_heart',
        'spirit': 'xp_spirit',
        'uniqueness_work': 'xp_uniqueness_work',
      };

      const pathKey = pathXpMap[primaryPath];
      if (pathKey) {
        updates[pathKey] = (profile[pathKey as keyof typeof profile] as number) + xpReward;
      }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('game_profiles')
      .update(updates)
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    console.log(`Practice logged successfully. New XP: ${newXpTotal}, New Level: ${newLevel}`);

    return new Response(
      JSON.stringify({
        success: true,
        newXpTotal,
        newLevel,
        practiceCount: updates.practice_count,
        message: `Practice logged. +${xpReward} XP`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in mark-practice-done:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});