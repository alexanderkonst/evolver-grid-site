import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = "test@evolvergrid.test";
    const password = "testpassword123";

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      // Update existing user to ensure password and confirmation
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          email_confirm: true,
        }
      );

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Test user updated and email confirmed",
          user: {
            id: updatedUser.user.id,
            email: updatedUser.user.email,
            email_confirmed_at: updatedUser.user.email_confirmed_at,
            created_at: updatedUser.user.created_at,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new user with confirmed email
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (createError) {
      throw createError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test user created with confirmed email",
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          email_confirmed_at: newUser.user.email_confirmed_at,
          created_at: newUser.user.created_at,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating test user:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
