// equilibrium-cron — DEPRECATED (Day 119, Sasha 2026-07-09).
//
// This function used to broadcast planetary/lunar readings to every
// equilibrium_users chat. The Telegram bot has been repurposed into the
// private founder chat (see equilibrium-telegram-bot). Broadcasts are
// retired; this stub answers 410 so any surviving scheduler stops
// producing sends without erroring loudly.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: "deprecated",
      detail:
        "equilibrium-cron readings were retired on 2026-07-09. The bot is now the private founder chat (equilibrium-telegram-bot).",
    }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
