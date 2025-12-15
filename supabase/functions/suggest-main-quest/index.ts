import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Main Quest Stage definitions (v0)
 */
const MAIN_QUEST_STAGES = [
    'mq_0_gateway',
    'mq_1_profile_clarity',
    'mq_2_first_side_quest',
    'mq_3_first_upgrade',
    'mq_4_daily_loop',
    'mq_5_share_or_build',
] as const;

type MainQuestStage = typeof MAIN_QUEST_STAGES[number];

interface MainQuestCopy {
    stage: MainQuestStage;
    title: string;
    objective: string;
    ctaText: string;
    ctaRoute?: string;
}

const MAIN_QUEST_COPY: Record<MainQuestStage, Omit<MainQuestCopy, 'stage'>> = {
    mq_0_gateway: {
        title: 'Enter the Game',
        objective: 'Complete onboarding and create your player profile',
        ctaText: 'Start Journey',
        ctaRoute: '/zone-of-genius',
    },
    mq_1_profile_clarity: {
        title: 'Clarify Your Genius',
        objective: 'Complete the Zone of Genius assessment to unlock your archetype',
        ctaText: 'Discover My Genius',
        ctaRoute: '/zone-of-genius',
    },
    mq_2_first_side_quest: {
        title: 'First Side Quest',
        objective: 'Complete your first practice from the library',
        ctaText: 'Find a Practice',
        ctaRoute: '/library',
    },
    mq_3_first_upgrade: {
        title: 'Unlock Your First Upgrade',
        objective: 'Complete an upgrade to level up your character',
        ctaText: 'Browse Upgrades',
        ctaRoute: '/skills',
    },
    mq_4_daily_loop: {
        title: 'Build the Habit',
        objective: 'Maintain a 3-day streak with any mix of practices and upgrades',
        ctaText: 'Continue Streak',
        ctaRoute: '/library',
    },
    mq_5_share_or_build: {
        title: 'Share or Build',
        objective: 'Create a real-world output: a post, pitch, or demo of your genius',
        ctaText: 'Create Output',
        ctaRoute: '/genius-offer',
    },
};

/**
 * Compute current Main Quest stage based on player stats
 */
function computeMainQuestStage(
    hasProfile: boolean,
    hasZogSnapshot: boolean,
    practiceCount: number,
    upgradesCompleted: number,
    currentStreak: number
): MainQuestStage {
    if (!hasProfile) return 'mq_0_gateway';
    if (!hasZogSnapshot) return 'mq_1_profile_clarity';
    if (practiceCount < 1) return 'mq_2_first_side_quest';
    if (upgradesCompleted < 1) return 'mq_3_first_upgrade';
    if (currentStreak < 3) return 'mq_4_daily_loop';
    return 'mq_5_share_or_build';
}

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

        // Get player profile and stats
        const { data: profile } = await supabase
            .from('game_profiles')
            .select('*, last_zog_snapshot_id')
            .eq('user_id', user.id)
            .maybeSingle();

        // Count completed upgrades
        let upgradesCompleted = 0;
        if (profile) {
            const { count } = await supabase
                .from('player_upgrades')
                .select('*', { count: 'exact', head: true })
                .eq('profile_id', profile.id);
            upgradesCompleted = count || 0;
        }

        // Compute current stage
        const hasProfile = !!profile;
        const hasZogSnapshot = !!profile?.last_zog_snapshot_id;
        const practiceCount = profile?.practice_count || 0;
        const currentStreak = profile?.current_streak_days || 0;

        const stage = computeMainQuestStage(
            hasProfile,
            hasZogSnapshot,
            practiceCount,
            upgradesCompleted,
            currentStreak
        );

        const stageIndex = MAIN_QUEST_STAGES.indexOf(stage);
        const progress = Math.round((stageIndex / (MAIN_QUEST_STAGES.length - 1)) * 100);

        const copy = MAIN_QUEST_COPY[stage];

        return new Response(
            JSON.stringify({
                stage,
                stageIndex,
                progress,
                title: copy.title,
                objective: copy.objective,
                ctaText: copy.ctaText,
                ctaRoute: copy.ctaRoute,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Error in suggest-main-quest:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
