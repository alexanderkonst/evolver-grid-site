import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  appleseedData?: Record<string, unknown>;
  excaliburData?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if request has body with user data
    let users: TestUserPayload[] = [];
    
    try {
      const body = await req.json();
      if (body.users && Array.isArray(body.users)) {
        users = body.users;
      } else if (body.email) {
        users = [body];
      }
    } catch {
      // No body, use default test user
      users = [{
        email: "test@evolvergrid.test",
        password: "testpassword123",
        firstName: "Test",
        lastName: "User",
      }];
    }

    const results = [];

    for (const userData of users) {
      const { email, password, firstName, lastName, appleseedData, excaliburData } = userData;
      
      console.log(`Processing user: ${email}`);

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === email);

      let userId: string;

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            password: password,
            email_confirm: true,
          }
        );

        if (updateError) {
          console.error(`Error updating user ${email}:`, updateError);
          results.push({ email, success: false, error: updateError.message });
          continue;
        }

        userId = updatedUser.user.id;
        console.log(`Updated existing user: ${email}, id: ${userId}`);
      } else {
        // Create new user with confirmed email (no email sent)
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
        });

        if (createError) {
          console.error(`Error creating user ${email}:`, createError);
          results.push({ email, success: false, error: createError.message });
          continue;
        }

        userId = newUser.user.id;
        console.log(`Created new user: ${email}, id: ${userId}`);
      }

      // Check if game_profile exists for this user
      const { data: existingProfile } = await supabaseAdmin
        .from("game_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      let profileId: string;

      if (existingProfile) {
        profileId = existingProfile.id;
        console.log(`Found existing profile: ${profileId}`);
      } else {
        // Create game_profile
        const { data: newProfile, error: profileError } = await supabaseAdmin
          .from("game_profiles")
          .insert({
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            onboarding_completed: true,
            zone_of_genius_completed: !!(appleseedData || excaliburData),
          })
          .select("id")
          .single();

        if (profileError) {
          console.error(`Error creating profile for ${email}:`, profileError);
          results.push({ email, success: false, error: profileError.message, userId });
          continue;
        }

        profileId = newProfile.id;
        console.log(`Created profile: ${profileId}`);
      }

      // Create zog_snapshot with Appleseed and Excalibur data if provided
      if (appleseedData || excaliburData) {
        const { data: snapshot, error: snapshotError } = await supabaseAdmin
          .from("zog_snapshots")
          .insert({
            profile_id: profileId,
            archetype_title: (appleseedData as { vibrationalKey?: { name?: string } })?.vibrationalKey?.name || "Discovered Genius",
            core_pattern: (appleseedData as { threeLenses?: { primeDriver?: string } })?.threeLenses?.primeDriver || "Unique Pattern",
            top_three_talents: [],
            top_ten_talents: [],
            appleseed_data: appleseedData || null,
            excalibur_data: excaliburData || null,
            appleseed_generated_at: appleseedData ? new Date().toISOString() : null,
            excalibur_generated_at: excaliburData ? new Date().toISOString() : null,
            xp_awarded: true,
          })
          .select("id")
          .single();

        if (snapshotError) {
          console.error(`Error creating snapshot for ${email}:`, snapshotError);
          results.push({ email, success: false, error: snapshotError.message, userId, profileId });
          continue;
        }

        // Update game_profile with last_zog_snapshot_id
        const { error: updateProfileError } = await supabaseAdmin
          .from("game_profiles")
          .update({
            last_zog_snapshot_id: snapshot.id,
            first_name: firstName,
            last_name: lastName,
            zone_of_genius_completed: true,
            genius_stage: "complete",
          })
          .eq("id", profileId);

        if (updateProfileError) {
          console.error(`Error updating profile snapshot for ${email}:`, updateProfileError);
        }

        console.log(`Created zog_snapshot: ${snapshot.id}`);
        results.push({ email, success: true, userId, profileId, snapshotId: snapshot.id });
      } else {
        results.push({ email, success: true, userId, profileId });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} users`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in create-test-user:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
