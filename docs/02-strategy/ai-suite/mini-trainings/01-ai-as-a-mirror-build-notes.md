# Mini-training 1 · AI as a Mirror: build notes for the prompt button card

> Source spec: [01-ai-as-a-mirror.md](./01-ai-as-a-mirror.md) (v0.6). Issue #392. Template: spec-handoff.
> Code: `src/modules/mini-trainings/` · route `/mini-trainings/ai-as-a-mirror` · `?demo=1` shows a test profile with empty fields.
> This file holds what is NOT deployed or applied: the draft edge function and the proposed table. Neither sits under `supabase/`, so nothing here deploys or migrates by itself.

## Needs Sasha's yes before it goes live (Lovable credits)

1. **Deploy the edge function `mini-training-chat`** (draft below). Then set `VITE_MINI_TRAINING_CHAT_LIVE=true`; until then Send returns a marked placeholder answer.
2. **A table for «Save plan»** (proposal below). No existing table fits (see «Why not an existing table»). Until it exists, the plan is saved in the player's browser only.

## Draft edge function: `supabase/functions/mini-training-chat/index.ts`

Same pattern as `your-ai-turn`: signed-in only, per-player daily cap through the existing `your_ai_take_turn` RPC (shared counter with Your AI), Lovable AI gateway, cheapest chat model. Request: `{ messages: [{ role: "user" | "assistant", content }] }`. Response: `{ reply }`. A free-form chat, so it does not reuse `your-ai-turn`'s structured JSON turn.

```ts
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const MODEL = "google/gemini-3.1-flash-lite";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const DAILY_CAP = 40; // about 12 calls per person for the mini-training, with room to retry

const SYSTEM =
  "You are the player's AI inside a personal-growth game. Answer in plain English, no emojis, " +
  "and never longer than the line limit the player's message gives (default 5 lines). " +
  "Speak about the person, not about yourself: never explain how AI works.";

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).min(1).max(40),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "sign_in_required" }, 401);
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "sign_in_required" }, 401);

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error: capErr } = await admin.rpc("your_ai_take_turn", { p_user: user.id, p_cap: DAILY_CAP });
    if (capErr) {
      if (String(capErr.message).includes("cap")) return json({ error: "daily_cap_reached", cap: DAILY_CAP }, 429);
      throw capErr;
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY is not configured");
    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: SYSTEM }, ...parsed.data.messages] }),
    });
    if (res.status === 429) return json({ error: "Rate limits exceeded, please try again later." }, 429);
    if (res.status === 402) return json({ error: "Payment required, please add funds to your workspace." }, 402);
    if (!res.ok) {
      console.error("gateway", res.status, await res.text());
      return json({ error: "AI gateway error" }, 500);
    }
    const data = await res.json();
    const reply = String(data?.choices?.[0]?.message?.content ?? "").trim();
    if (!reply) return json({ error: "empty_reply" }, 502);
    return json({ reply });
  } catch (err) {
    console.error("mini-training-chat error", err);
    return json({ error: "internal_error" }, 500);
  }
});
```

Check before deploying: the model id is the cheapest the gateway lists today (the spec names Gemini 3.1 Flash Lite / GPT-6 Luna); the client reads HTTP 401 and 429 from the function error to show «sign in» and «enough for today».

## Why not an existing table (for «Save plan»)

- `user_business_artifacts`: the business-canvas table. Rows need a `step_number` of 1–18 and an `artifact_key` of a canvas piece; the Journey progress check, My Artifacts and Your AI's Workshop pieces all read it by key. A plan row would show up in, or confuse, those.
- `game_profiles.first_time_actions` (JSON): a flags bag, not a place for text.
- `player_cards`, `player_traces`, `player_messages`, `player_reflections`: each has a different meaning (versioned AI card, taps, messages between players, visitor answers).

## Proposed table (NOT applied; no migration in this PR)

One row per player, replaced on each save (#5 saves it, #8 saves a sharper one). In rung 2 it becomes their 90-day goals; in rung 3 it goes into their business document.

```sql
create table if not exists public.player_plans (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  plan_text  text not null,
  from_step  text not null,            -- '5' or '8'
  updated_at timestamptz not null default now()
);
alter table public.player_plans enable row level security;
create policy "own plan" on public.player_plans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Once it exists: replace `loadPlan` / `savePlan` in `mirror/mirrorChat.ts` with reads and upserts on it. The thread could move to a table the same way (today it is the browser's `localStorage`, per player).

## Decisions and questions for Sasha

- **#2 and the line cap.** The spec's #2 asks for a four-line motto plus two lines (six), while v0.6 says «Up to 5 lines» on every prompt. The card keeps the spec wording and adds only «No emojis.» to #2. Decide: shorten #2, or relax the rule for it.
- **#7 first button.** «Help me with my life.» stays exactly as written (the contrast needs it vague), so it has no «no emojis» closing.
- **#2 without a mastery action** uses «My talents: …» and «a four-line motto for them» (plural), so the sentence still reads.
- **Weakest-area wording.** Area names are lowercased in prompts («health», «love & relationships», «social ties»).
- **#6 «up to 3 times»** is read as: the button can be sent up to three times, each time with a line the player tapped.
- **No 90 s video** on the page yet (no production without Sasha's yes); the order «button first, then video» is untested.
- **Page shell.** The page is standalone (no game shell), so the route can move once the Academy level for this mini-training is set.
