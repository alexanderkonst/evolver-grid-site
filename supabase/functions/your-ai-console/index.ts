// Your AI Console v1 (docs/specs/your-ai-console/console-v1.md): one model call per Console button.
// Signed-in only; AI OS v6.0 as the system message; the same per-player daily cap as mini-training-chat.
// The logic is in ./handler.ts (testable); this file wires it to Supabase and the AI gateway.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { handle, MAX_OUTPUT_TOKENS, MODEL } from "./handler.ts";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

Deno.serve((req) =>
  handle(req, {
    corsHeaders,
    getUserId: async (authHeader) => {
      const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      return user?.id ?? null;
    },
    takeTurn: async (userId, cap) => {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data, error } = await admin.rpc("your_ai_take_turn", { p_user: userId, p_cap: cap });
      if (error) throw error;
      return data as number;
    },
    complete: async (system, user) => {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) throw new Error("LOVABLE_API_KEY is not configured");
      const res = await fetch(`${GATEWAY}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
        }),
      });
      if (!res.ok) {
        console.error("gateway", res.status, await res.text());
        return { status: res.status, text: "" };
      }
      const data = await res.json();
      return { status: res.status, text: String(data?.choices?.[0]?.message?.content ?? "") };
    },
  }),
);
