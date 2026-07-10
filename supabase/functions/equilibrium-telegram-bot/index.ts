// equilibrium-telegram-bot — Founder Chat (Day 119, Sasha 2026-07-09).
//
// Repurposed: the old birthday/cosmic-reading flow is retired. The same
// bot (same token, same webhook) is now a PRIVATE chat between Sasha and
// his project — corpus mirror + live state, answered by Gemini via the
// Lovable gateway.
//
// Access: only the chat whose id matches env TELEGRAM_FOUNDER_CHAT_ID may
// talk to the brain. Any other chat gets a one-line decline. /start always
// replies with the chat id so the env can be set on first contact.
//
// Context per message:
//   1. founder_corpus_docs        — docs mirror (scripts/sync-founder-corpus.mjs)
//   2. live packet                — equilibrium tables + latest pulse_briefs
//      + CRM / project-pulse snapshots from /generated/*.json
//   3. telegram_founder_messages  — last 20 turns of this conversation
//
// Commands: /start · /pulse (latest brief) · /clear (forget conversation)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const FOUNDER_CHAT_ID = Deno.env.get("TELEGRAM_FOUNDER_CHAT_ID") ?? "";
const SITE_ORIGIN =
  Deno.env.get("PULSE_SNAPSHOT_ORIGIN") ?? "https://findyourtoptalent.com";
const FOUNDER_USER_ID =
  Deno.env.get("EQUILIBRIUM_AI_CONTEXT_USER_ID") ??
  "39e554f8-90ef-48f5-ae0a-9e20d375d57f";
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const HISTORY_TURNS = 20;
const CORPUS_DOC_CAP = 40_000; // chars per doc
const CORPUS_TOTAL_CAP = 150_000; // chars across all docs
const TELEGRAM_CHUNK = 3900;

const SYSTEM_PROMPT = `You are the private founder chat for Alexander (Sasha) Konstantinov's Planetary OS venture. You answer from his corpus mirror and the live project state provided below. You are talking to Sasha himself on Telegram.

Today is ${new Date().toISOString().slice(0, 10)}.

Rules:
- Every source carries dates (generated_at, updated_at, entry dates). When data is stale — an "upcoming" event whose date is in the past, a log whose latest entry is over a week old — say so explicitly ("latest pulse entry is July 7; nothing logged since") instead of presenting it as current.
- Lead with the answer. Keep replies short and phone-readable; expand only when he asks.
- Plain, human language. Short sentences. Concrete over abstract. No hype, no coaching filler.
- Russian in, Russian out; English in, English out.
- Quote the corpus rather than paraphrasing when exact wording matters (locked texts stay verbatim).
- Only claim what the provided context supports. If the corpus mirror or a data source is missing something, say so plainly instead of guessing.
- He calls the play: give options plus one recommendation, never orders.`;

// Persistent one-tap keyboard for the founder chat. Sending it also
// replaces the legacy "⚡ SEE CURRENT ENERGY" keyboard from the old bot.
const FOUNDER_KEYBOARD = {
  keyboard: [[{ text: "⚡ Project status" }, { text: "🫀 Pulse" }]],
  resize_keyboard: true,
  is_persistent: true,
};

const STATUS_QUESTION =
  "Give me a current project status snapshot: money, CRM movement, current focus, and next moves. Date-stamp the sources and flag anything stale.";

async function sendTelegram(chatId: number, text: string, withKeyboard = false) {
  // Telegram hard limit is 4096 chars; chunk conservatively.
  for (let i = 0; i < text.length; i += TELEGRAM_CHUNK) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(i, i + TELEGRAM_CHUNK),
        ...(withKeyboard ? { reply_markup: FOUNDER_KEYBOARD } : {}),
      }),
    });
  }
}

// ── Voice notes ──────────────────────────────────────────────────────

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

async function downloadVoice(fileId: string): Promise<Uint8Array> {
  const metaRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`,
  );
  const meta = await metaRes.json();
  const filePath = meta?.result?.file_path;
  if (!filePath) throw new Error("Telegram getFile returned no file_path");
  const fileRes = await fetch(
    `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`,
  );
  if (!fileRes.ok) throw new Error(`voice download HTTP ${fileRes.status}`);
  return new Uint8Array(await fileRes.arrayBuffer());
}

async function safeJson(url: string): Promise<unknown> {
  try {
    const res = await fetch(url);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

async function assembleLivePacket() {
  const userId = FOUNDER_USER_ID;
  const [state, workstreams, focus, synthesis, briefs, crm, pulse] = await Promise.all([
    admin
      .from("equilibrium_state")
      .select("mission_override_text, role_override_text, moon_focus_text, last_synthesis_text, last_synthesis_at")
      .eq("user_id", userId)
      .maybeSingle()
      .then((r) => r.data),
    admin
      .from("equilibrium_workstreams")
      .select("title, status")
      .eq("user_id", userId)
      .limit(12)
      .then((r) => r.data),
    admin
      .from("equilibrium_focus")
      .select("*")
      .eq("user_id", userId)
      .then((r) => r.data),
    admin
      .from("equilibrium_synthesis_log")
      .select("reading_text, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3)
      .then((r) => r.data),
    admin
      .from("pulse_briefs")
      .select("kind, title, bottom_line, markdown, created_at")
      .order("created_at", { ascending: false })
      .limit(2)
      .then((r) => r.data),
    safeJson(`${SITE_ORIGIN}/generated/crm-snapshot.json`),
    safeJson(`${SITE_ORIGIN}/generated/project-pulse-snapshot.json`),
  ]);
  return {
    equilibrium: { state, workstreams, focus, synthesis_log: synthesis },
    latest_pulse_briefs: briefs,
    crm_snapshot: crm,
    project_pulse_snapshot: pulse,
  };
}

async function loadCorpus(): Promise<string> {
  const { data } = await admin
    .from("founder_corpus_docs")
    .select("path, title, content, updated_at")
    .order("path");
  if (!data?.length) {
    return "(corpus mirror is empty — run scripts/sync-founder-corpus.mjs)";
  }
  let total = 0;
  const parts: string[] = [];
  for (const doc of data) {
    const content = String(doc.content ?? "").slice(0, CORPUS_DOC_CAP);
    if (total + content.length > CORPUS_TOTAL_CAP) break;
    total += content.length;
    parts.push(`===== ${doc.path} (synced ${doc.updated_at}) =====\n${content}`);
  }
  return parts.join("\n\n");
}

async function loadHistory(chatId: number) {
  const { data } = await admin
    .from("telegram_founder_messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_TURNS);
  return (data ?? []).reverse();
}

async function saveMessage(chatId: number, role: "user" | "assistant", content: string) {
  await admin.from("telegram_founder_messages").insert({ chat_id: chatId, role, content });
}

async function answer(
  chatId: number,
  question: string,
  voiceBase64?: string,
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const [corpus, live, history] = await Promise.all([
    loadCorpus(),
    assembleLivePacket(),
    loadHistory(chatId),
  ]);

  const userContent = voiceBase64
    ? [
        {
          type: "text",
          text:
            "This is a voice note from Sasha. Start your reply with one line: \"🎙️ \" plus a short paraphrase of what you heard, then answer it per your rules.",
        },
        {
          type: "input_audio",
          input_audio: { data: voiceBase64, format: "ogg" },
        },
      ]
    : question;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `LIVE PROJECT STATE (JSON):\n${JSON.stringify(live).slice(0, 24_000)}\n\nCORPUS MIRROR:\n${corpus}`,
    },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userContent },
  ];

  const res = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", temperature: 0.4, messages }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI gateway ${res.status}: ${body.slice(0, 200)}`);
  }
  const payload = await res.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI gateway returned no content");
  return String(text);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    const message = update?.message;
    if (!message?.text && !message?.voice) {
      return new Response("ok", { headers: corsHeaders });
    }

    const chatId: number = message.chat.id;
    const isFounder = FOUNDER_CHAT_ID !== "" && String(chatId) === FOUNDER_CHAT_ID;

    // ── Voice notes (founder only) ─────────────────────────────────
    if (message.voice) {
      if (!isFounder) {
        await sendTelegram(chatId, "This is a private bot. Nothing to see here.");
        return new Response("ok", { headers: corsHeaders });
      }
      if ((message.voice.duration ?? 0) > 300) {
        await sendTelegram(chatId, "That voice note is over 5 minutes — send a shorter one.", true);
        return new Response("ok", { headers: corsHeaders });
      }
      try {
        const audio = await downloadVoice(message.voice.file_id);
        const reply = await answer(chatId, "", toBase64(audio));
        await saveMessage(chatId, "user", "[voice note — gist is in the 🎙️ line of the next reply]");
        await saveMessage(chatId, "assistant", reply);
        await sendTelegram(chatId, reply, true);
      } catch (err) {
        console.error("voice note error:", err);
        await sendTelegram(
          chatId,
          `Couldn't process that voice note (${err instanceof Error ? err.message : String(err)}). Text works.`,
          true,
        );
      }
      return new Response("ok", { headers: corsHeaders });
    }

    let text: string = message.text.trim();

    // One-tap keyboard buttons (incl. the legacy button from the old bot).
    if (text === "⚡ Project status" || text === "⚡ SEE CURRENT ENERGY") {
      text = STATUS_QUESTION;
    } else if (text === "🫀 Pulse") {
      text = "/pulse";
    }

    if (text === "/start") {
      await sendTelegram(
        chatId,
        isFounder
          ? "Founder chat online. Ask the project anything — text or voice note. Commands: /pulse (latest brief), /clear (forget this conversation)."
          : `This is a private founder bot. Chat id: ${chatId}. If this bot is yours, set TELEGRAM_FOUNDER_CHAT_ID to this value in Supabase secrets.`,
        isFounder,
      );
      return new Response("ok", { headers: corsHeaders });
    }

    if (!isFounder) {
      await sendTelegram(chatId, "This is a private bot. Nothing to see here.");
      return new Response("ok", { headers: corsHeaders });
    }

    if (text === "/clear") {
      await admin.from("telegram_founder_messages").delete().eq("chat_id", chatId);
      await sendTelegram(chatId, "Conversation forgotten. Clean slate.", true);
      return new Response("ok", { headers: corsHeaders });
    }

    if (text === "/pulse") {
      const { data: brief } = await admin
        .from("pulse_briefs")
        .select("title, markdown, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      await sendTelegram(
        chatId,
        brief
          ? `${brief.title ?? "Founder Pulse"} (${brief.created_at})\n\n${brief.markdown}`
          : "No pulse brief yet. It runs 8:00 and 20:00 Mexico City, or tap Pulse now in the cockpit.",
        true,
      );
      return new Response("ok", { headers: corsHeaders });
    }

    await saveMessage(chatId, "user", text);
    try {
      const reply = await answer(chatId, text);
      await saveMessage(chatId, "assistant", reply);
      await sendTelegram(chatId, reply, true);
    } catch (err) {
      console.error("founder chat error:", err);
      await sendTelegram(
        chatId,
        `Hit an error answering that: ${err instanceof Error ? err.message : String(err)}`,
        true,
      );
    }

    return new Response("ok", { headers: corsHeaders });
  } catch (err) {
    console.error("Bot error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
