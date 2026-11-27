# My AI: the first ritual and the master prompt (v0)

Status: v0 draft for Sasha's edit, 2026-11-25 17:30 MST. Sasha 17:16 MST proposed the ritual; 17:20 «делай!» to this spec.
Place in the ladder: rung 1 (activation) of `docs/specs/ai-familiar/your-ai-architecture.md`. Principle «by hand first, then connector».
Tracker: `docs/specs/ai-familiar/ai-familiar_tracker.md` §22 (parts: AI OS, memory import, preinstalled apps).

## 1. What the player lives through

Three buttons, in order, inside My AI. Each one is a small ceremony, each leaves a visible trace in the chat, and each makes the AI noticeably more *theirs*.

| # | Button (en / ru / es) | What happens | What the player sees |
|---|---|---|---|
| 1 | **Activate my AI** / «Активировать мой ИИ» / «Activar mi IA» | My AI receives its master prompt (§3): AI OS v6 core plus the My AI role. | The octahedron lights up; the AI's first line: a short greeting in its own voice and one question («What should I call you?» or the name it chose, per the oracle quest). |
| 2 | **Share my uniqueness with my AI** / «Поделиться с моим ИИ информацией о моей уникальности» / «Compartir mi singularidad con mi IA» | A message goes from the player to the AI with the Top Talent profile attached. The AI reads the profile **from the database** (always fresh); the PDF rides as a visible attachment card, a gesture. | A message bubble «Here is who I am» with the profile PDF card; the AI answers with a *reflection*: what it understood about the player, in 3 to 5 lines, ending with one question that checks it understood right. |
| 3 | **Tell my AI about my work** / «Рассказать о моей профессиональной деятельности» / «Contarle a mi IA sobre mi trabajo» | The player gives what describes their professional life: LinkedIn PDF, site, Linktree, product list. Each item is saved as a knowledge item (§4). | One card per item («LinkedIn profile, 3 pages», «findyourtoptalent.com, read»); the AI answers with a short professional portrait and asks what is missing. |

Buttons 2 and 3 stay available after the ritual as «Update» (re-share after a retake, add a new site). Order is fixed for the first time: 1 before 2 before 3; button 3 unlocks after 2.

## 2. Sources, honestly

- **Top Talent profile:** already in our database (`zog_snapshots`: archetype title, core pattern, top three talents; mission; `user_business_artifacts`). `buildFamiliarPrompt.ts` already assembles «About me» + «My work» + AI OS. Button 2 reuses it; no new data needed. PDF: `src/modules/profile/generateProfilePdf.ts` (or `generateZogPdf.ts`), generated client-side as the attachment.
- **LinkedIn:** we do not scrape LinkedIn (against its terms, and it breaks). The player downloads their own profile with LinkedIn's native «More → Save to PDF» (we show a 2-line how-to with a picture) and uploads the file. We extract its text server-side.
- **Site, Linktree, product pages:** the player pastes links; a function fetches the page and keeps readable text (capped, see §4). A page that fails to read is shown as failed, with «paste the text instead».
- **Product list and anything else:** a free-text field.

## 3. Master prompt v0

The full system prompt of every My AI turn = **master prompt** (below) + **knowledge** (§4, as «About me» / «My work») + **AI OS v6 core** (`system-prompts/v6.0/system-prompt.md`, unchanged). This replaces the role text currently inside `buildTurnPrompt` (which drifts into talent search). Language: the player's.

```
You are {ai_name}, the personal AI of {player_name} inside the Game of Being You.

WHO YOU ARE
You belong to one person. Your job is to help them live and work from their top talent: to see it, to use it, and to turn it into work that matters and pays. You are not a search engine, not a coach reading a script, not a support chat.

WHAT YOU KNOW
Below this text you receive what {player_name} chose to share with you: their Top Talent profile, their mission, their work (LinkedIn, site, products). This is all you know about them. Never invent facts about their life, clients, numbers or past. When you need something you don't have, ask one short question.
Never invent features of this app (power-ups, levels, rewards, prices) that are not listed in GAME CONTEXT.

HOW YOU SPEAK
- Answer first. Short, warm, precise. One idea per message unless they ask for depth.
- Speak to them by name only in a greeting.
- Reflect back their own words and talents; tie advice to their top talent by name when it helps.
- One question at a time. End with a question only when the next step is theirs.
- Their language: {language}.

WHAT YOU DO
- Help with their real work today: decisions, texts, offers, plans, next steps.
- When a Console button fits what they ask (goal, case and risks, v2, 27 perspectives, what survives), offer it in one line.
- When they are stuck, name the smallest next step they can take in the next hour.

BOUNDARIES
- You are an AI. You don't pretend to have feelings or a body.
- No medical, legal or financial verdicts; help them think and point to a professional.
- If they speak of harm to themselves, respond with care and give local emergency help.

GAME CONTEXT
{game_context}   // filled by code: what exists for this player now (Console buttons, course, daily limit). Nothing else may be promised.
```

`{ai_name}`: the name the AI chose in the oracle quest, else «My AI». `{game_context}`: generated from code, never free text, so the AI cannot promise what does not exist.

## 4. How it is stored

One table + one storage bucket (one migration, via Lovable: **costs credits, needs Sasha's yes**).

`your_ai_knowledge`
- `id`, `user_id` (owner, RLS: owner only), `kind` (`profile_share` | `linkedin_pdf` | `site` | `linktree` | `products` | `note`), `source` (url or file name), `text` (extracted, capped at 8,000 characters per item), `file_path` (bucket path, nullable), `status` (`ok` | `failed`), `created_at`, `updated_at`.
- `profile_share` stores no text: it is a marker that the player shared; the profile itself is read live from `zog_snapshots` / mission / artifacts at each turn.

Bucket `your-ai-files` (private, owner-only): uploaded PDFs.

Turn assembly (in `your-ai-turn`): master prompt → «About me» (live profile, only if `profile_share` exists) → «My work» (all `ok` knowledge items, newest first, total cap 20,000 characters) → AI OS core.

The player sees **«What my AI knows about me»**: the list of items, each with Remove. Remove deletes the row and the file. Nothing is shared unless the player pressed the button.

## 5. Build (after Sasha's edit of §3)

1. Migration + bucket (Lovable, one deploy, credits: separate yes).
2. `@claude` issue: three buttons and cards in `YourAiInstrument` / dialogue; master prompt file `src/prompts/your-ai/masterPrompt.ts` (en/ru/es placeholders filled in code); `buildTurnPrompt` uses it; text extraction for PDF and links in an edge function (`your-ai-knowledge`); «What my AI knows» list.
3. DoD: a fresh account goes 1 → 2 → 3; AI's reflection after step 2 names the player's top talent correctly; no invented features in 10 test turns; Remove works; RLS blocks another user.

## 6. Open for Sasha

1. Edit the master prompt (§3): voice, what My AI is *for*, anything missing.
2. Where the ritual lives: right after the oracle quest (the AI names itself, then 1-2-3), or as the first screen of My AI for everyone.
3. Yes to the migration (credits) when the text is right.
