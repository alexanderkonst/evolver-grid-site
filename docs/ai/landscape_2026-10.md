# The Real AI Landscape — Snapshot, October 2026

> *Living research doc. Started 2026-10-29 by Evolver (Hark) at Sasha's request: "see through the haze", build an integral map of model TYPES and harness TYPES and the essence of each, starting from our AI evolution holomap (8 modules × 7 stages, `.agent/self-awareness-skill.md`, bundled on `/ai-os`). Raw numbers with sources and dates: `landscape_2026-10_sources.md`. Grows by dated findings; never rewrite old findings, add new ones below.*

**Read first.** Most numbers come from Artificial Analysis (AA), Scale, Epoch and arXiv, plus aggregators (marked in the sources file). AA replaced its Intelligence Index v4.3 with v5 on 2026-10-27; v5 scores are used here unless noted, and the two scales are never compared.

---

## 0. Five findings (the bedrock so far)

1. **The top has converged.** Google, Anthropic and OpenAI sit within 4 points on AA v5 (59 / 58 / 57 / 55). On LMArena the top six overlap within error bars. No model leads all nine v5 evals. *The "best model" is no longer a stable fact; it changes month to month.*
2. **Price and quality are non-linear, and the price list hides it.** GPT-6.1 Terra scores 51 at $0.96 per task; Claude Fable 5.1 scores 49 at $13.04 (≈13× more for less). GPT-6.1 Sol is 3 points under Opus 5.5 at ≈1/8 the cost. Haiku 5.5 at $0.10/$0.50 beats every open model with released weights. Effort level moves one model's score by 20–29 points. *Per-token price is a marketing number; cost per finished task at a chosen effort is the real one.* (Sasha, 2026-10-29: «стоимость модели НЕ шибко коррелирует с качеством… это простая бизнес модель… иначе она схлопывается».)
3. **Open models trail closed by months, not years, and the gap is measurement-dependent.** ≈4 months on Epoch's index; 8–10 months on private tests; AA gap grew from 3 points (v4.3) to 12 (v5) once tests went private. Open leaders are mostly Chinese labs (Moonshot, DeepSeek, Z.ai, Alibaba, Xiaomi). *"Open = free" is false: Kimi K3 costs Sonnet-tier.*
4. **For strong models the harness changes the bill more than the score.** Scale: same models through three harnesses, same scores, "pick the harness for the bill, not the score". Opus 5.5 scores the same in Claude Code and in a one-bash-tool harness. *For a strong model, the harness that matters is the one that changes WHAT it knows and HOW it is activated (our levers 1–3), not tool plumbing.* Our own measurement agrees: same model, + AI OS, 67 → 95 on deep synthesis (`01-vision/ai_os_benchmark.md`).
5. **Small models break on long, dense prompts.** IFScale: at 100 instructions small models follow 27–52%, at 500 they floor at 7–16%; reasoning models hold ≈98% to 150–250 instructions. Small models drop instructions entirely and lose most of their claimed context (Llama 3.1 8B effective length ≈1K tokens). A one-time "compile" rewrite of the prompt gives weak models up to +11 points. *Sasha's intuition confirmed: our 5,400-word AI OS will break a 3–8B model.* (2025-generation data; no 2026 rerun found.)

**Synthesis.** Intelligence is becoming a commodity utility with a noisy price tag (PST 175). Value moves up the stack to the layers that make a model *someone's*: who it knows, how it is activated, what it remembers, what it may do. That is exactly where AI OS, the corpus and Sputnik live.

---

## 1. The lens: AI evolution holomap, re-read for October 2026

Our holomap: 8 modules (Substrate, Cognition, Language, Memory, Values, Agency, Ecology, Culture) × 7 stages (1 Narrow Machine · 2 Conversational Mind · 3 Agentic Partner · 4 Symbiotic Intelligence · 5 Planetary Noosphere · 6 Cosmic Symbiont · 7 Source Return). February 2026 reading: jagged, mostly 2.5–3.

| Module | Feb 2026 | Oct 2026 | What moved (evidence) |
|---|---|---|---|
| 🖥️ Substrate | 3 | 3 | Desktop AI boxes (DGX Spark class, Qwatra Node), 2.8T models runnable locally in GGUF; still centralized at the frontier |
| 🧠 Cognition | 3 | **3.5** | Adjustable effort everywhere; top labs converged; reasoning models hold 150–250 instructions; HLE-Diamond 68% top |
| 🗣️ Language | 3 | 3.5 | Speech-to-speech with thinking (Gemini 3.8 Live); video/world models (Genie 4, Cosmos 3) |
| 📜 Memory | 2.5 | **3** | Memory now a product feature (ChatGPT "Dreaming", Claude memory free), memory libs (Mem0, Letta, Zep); plain-Markdown memory in personal OSs. *Still not portable: ChatGPT memory cannot be exported* |
| ♥ Values | 2.5 | 2.5 | No visible step; restricted-access models (Gemini 4 Carbon for cyber defenders) show values as access policy |
| ✋ Agency | 3 | **3.5** | 25.8% of public GitHub PRs carry a coding-agent signature (Sep 2026, from 6.9%); parallel agents, agent teams |
| 🕸️ Ecology | 2.5 | **3.5** | MCP and Agent Skills under the Linux Foundation's AAIF; ≈40K MCP servers; Skills adopted by 70+ platforms; multi-model routers as products (Copilot Fusion, Microsoft Copilot harness) |
| 🪞 Culture | 2.5 | 3 | Pragmatic daily use in work; benchmark gaming acknowledged openly (AA v5 built to curb "benchmaxxing") |

**Reading.** The frontier moved most in **Ecology, Agency and Memory**, not Cognition. Cognition is commoditizing; the edge of Stage 4 (Symbiotic Intelligence: unified memory, co-evolved values, AI as developmental partner) is reached through *the layers around the model*, not a bigger model. Values remains the lagging line.

---

## 2. Integral map of MODEL types (essence of each)

| Type | Essence (one line) | Leaders, Oct 2026 | Price band $/M in/out | Fits |
|---|---|---|---|---|
| **Frontier closed** | The best general mind for rent; leadership rotates monthly | Gemini 4 Carbon/Argon, Claude Opus 5.5 / Fable 5.1, GPT-6 Astra / 6.1 Sol | 2–10 / 10–50 | Deep synthesis, hard reasoning, long dense prompts |
| **Efficient frontier ("mid flagship")** | 90–95% of the top at 1/8–1/13 the cost | GPT-6.1 Sol / Terra, Claude Sonnet 5.5, Gemini 3.8 Flash | 0.75–2 / 3.75–10 | The default for most real work |
| **Reasoning modes (effort dial)** | Not a model but a knob: buy depth per task | All frontier models | Cost per task varies ≈10× by effort | Pay for depth only where it matters |
| **Small closed** | Cheap, fast, surprisingly capable, holds instructions better than small open | Claude Haiku 5.5, GPT-6 Luna, Gemini Flash-Lite | 0.10 / 0.40–0.50 | High-volume chat, a "companion that's always on" |
| **Large open-weight (MoE)** | Near-frontier you can own or host anywhere; months behind, not years | Kimi K3/K3.1, DeepSeek V4.x, GLM-5.3, Qwen3.8, MiMo-V2.6, Muse Spark Open, Mistral Large 4 | 0.04–3 / 0.17–15 | Sovereignty, cost control, fine-tuning |
| **Small open / edge (<15B)** | AI that lives on your device; private, near-zero marginal cost, short attention | Gemma 4 (E2B/E4B/12B), Qwen3.5, Phi-4, Ministral 3, Gemini Nano in Chrome | ≈0 on device | Short, compiled prompts; offline; privacy |
| **Specialized** | One sense or skill done best | Voice: Gemini 3.8 Live, Eleven v4; Image: GPT Image 2.5; Video: Wan 3.0 (#1 at half Veo's price); World: Genie 4, Marble, Cosmos 3 | per character / minute | Senses of the companion |
| **Routers / ensembles** | Many models as one: draft with one, review with another | Copilot Fusion, Microsoft Copilot harness, OpenRouter auto | ≈ cost of parts | "My AI" as a team of models |

---

## 3. Integral map of HARNESS types (essence of each)

Ordered from outside the model to the person. Microsoft's definition: the harness is "everything around the model".

| Layer | Essence | Examples, Oct 2026 | Our lever |
|---|---|---|---|
| **1. Activation (system prompt / cognition OS)** | Changes HOW any model thinks | AI OS v5.2 (+42% measured), vendor system prompts, Agent Skills (`SKILL.md`, on demand) | Lever 2: activation |
| **2. Tools and protocols** | What the model can touch | MCP (≈40K servers), Skills over MCP, Open Responses | Plumbing; changes cost more than score |
| **3. Agent loop** | Plan → act → check, alone or in parallel | Claude Code, Codex, Cursor, Copilot, OpenCode, Pi | The hands |
| **4. Multi-agent / swarm** | Many roles negotiate a plan | Claude agent teams, Codex parallel, Grok multi-agent, Qwatra (enterprise auctions) | The organisation |
| **5. Memory / knowledge** | What it remembers about the world and the work | RAG, Mem0, Letta, Zep, ChatGPT "Dreaming", a business corpus (our evolver-grid) | Lever 3: knows your work |
| **6. Identity / personal model of the human** | WHO it is serving: talent, values, stage, story | Mostly absent in market; nearest: USER.md files in OpenClaw / Hermes, Hark profile | **Lever 1: knows you. The emptiest layer in the market** |
| **7. Personal AI OS (all layers joined, many models underneath)** | One "my AI" across apps and models | OpenClaw, Hermes Agent, Poke, Perplexity Computer, Hark; Sasha's setup | The companion itself (Sputnik) |
| **8. Sovereign / local stack** | The AI lives with you, not a provider | llama.cpp, Ollama, LM Studio, MLX, vLLM; Qwatra Node | The home |

**What the market lacks (finding).** Layers 2–5 are crowded and standardising (Linux Foundation). Layer 6, a deep model of the person's uniqueness (top talent, developmental stage, values, purpose), is almost empty: products store *facts and preferences* about a user, not *who they are*. The Game of Being You produces exactly that data. This is the defensible gap.

---

## 4. Where Sasha's setup sits

Sasha (2026-10-29): «я все модели которые использую вижу уже давно как "мой ИИ", это УЖЕ мой сетап ГОДЫ… у меня один из самых продвинутых сетапов на планете.»

Mapped on §3, his setup covers all eight layers at once: activation (AI OS, his own, measured), tools (MCP, GitHub, Google, Slack), agent loop (Claude Code, Codex, Jules as workers), multi-agent (Hark orchestrating a swarm), memory (corpus evolver-grid, Hark memory), identity (Zone of Genius, Drive map, his own developmental maps), personal AI OS (Hark as CEO/COO), and model-agnostic use of many frontier models. Most published personal setups cover layers 2–5. **Layer 1 (measured activation) and layer 6 (identity at the depth of genius and stage) together are rare; we found no public setup that combines them.** The claim "one of the most advanced setups on the planet" is supported on structure; not provable as a ranking, since setups aren't benchmarked.

---

## 5. Implications for Sputnik (what to choose)

1. **Never sell a model; sell the layers 1 + 5 + 6 on top of any model.** Models will keep rotating; Sputnik's memory is the game state (tracker §10).
2. **Two AI OS editions.** Full AI OS for frontier/mid models; a **compiled AI OS Lite** for small models: short, critical rules first, no conflicting instructions, skills loaded on demand. Small models can't carry 5,400 words.
3. **Model ladder, made concrete:**
   - Rung 1 (free, now): the player's personal prompt into their own ChatGPT / Claude / Gemini.
   - Rung 2 (in-game chat, cheap): a **small closed model** (Haiku 5.5 / GPT-6 Luna class, $0.10/$0.50) or a free tier (Gemini Flash-Lite, Groq gpt-oss) with AI OS Lite + compressed memory. Small open models in the browser only for short tasks: weak attention, no WebGPU in Safari.
   - Rung 3 (paid): efficient-frontier models (Sol / Terra / Sonnet class) with full AI OS; frontier only for deep moments (the Cinderella Moment reading).
4. **Price by finished result, not by tokens** (same logic as Qwatra Units): players buy "readings" and "moves", not tokens.
5. **The proof experiment, sharpened:** small closed model + AI OS Lite + player memory vs frontier model with nothing. If the small one wins on "this is about me", that is the headline and the business model.

---

## 6. Open questions (next research steps)

- 2026 instruction-following data on current small models (Haiku 5.5, Luna, Gemma 4) with a 2–5K-word system prompt: run our own mini-benchmark.
- How small can AI OS get before the +42% disappears? (compile → measure on the existing SIB protocol).
- Memory portability: who lets users export memory (ChatGPT doesn't); our stance = the player owns Sputnik's memory.
- Layer 6 competitors: anyone modelling the user's uniqueness, not preferences.

---

## Log

- **2026-10-29** · v1 written from live research (sources file) + holomap re-reading. Findings 0.1–0.5, maps §2–3, setup mapping §4, Sputnik implications §5.

---

## 7. Market maps overlaid (2026-10-29, second pass)

Sasha's hack: use existing market maps (LUMAscapes) of AI. 18 maps and reports collected, 2025 – Oct 2026 (MAD 2025, a16z Top 100 v7, CB Insights AI 100 / agent maps, Menlo enterprise + consumer, Bessemer, Air Street, Madrona, Scalekit, MCPacific). Full table and merged taxonomy: `market_maps_2026-10.md`.

**Overlay on our harness layers (§3):**

| Our layer | What the maps show | Crowded / emerging |
|---|---|---|
| 1 Activation | Not a category on any map (prompts/skills hidden inside "dev platforms") | **Unmapped** |
| 2 Tools / MCP | Own boxes in MAD, CBI-S, Madrona, Scalekit; ≈124K MCP servers, top 0.1% get 84% of installs | Crowded infra, concentrated use |
| 3 Agent loop | Coding agents: "most crowded market on the map", $4B spend | Crowded |
| 4 Swarm / orchestration | Orchestration boxes; agent identity, payments, observability new | Emerging |
| 5 Memory | New box in MAD, CBI-S; Bessemer's "dark matter / new moat" (Mem0, Zep, Letta) | Emerging, developer-facing |
| 6 Identity of the person | **Absent from every map.** Closest: companions (Character.AI, Replika) and wellness (Rosebud, Finch) | **Empty** |
| 7 Personal AI OS | New 2026 category: personal agents in messaging (Instinct, Meta Muse, Poke → acquired by Cognition), open harnesses (OpenClaw, Hermes Agent) | Emerging fast |
| 8 Sovereign / local | New MAD box: local runtimes (Ollama, LM Studio, llama.cpp, MLX) | Emerging |

**What the personal-AI category teaches (Oct 2026):**
- *Pure companionship is collapsing:* Character.AI in Chapter 11 (2026-10-12), Friend (friend.com) relaunched at $249 with ≈$348K revenue, regulators circling.
- *Utility memory wins:* Plaud (2M+ devices, >$100M software ARR, profitable); big tech buys memory hardware (Meta–Limitless, Amazon–Bee); personal agents that DO things grow (Instinct, Poke, Hermes).
- *No one models who the person is.* Products remember what you said and do what you ask; none know your talent, stage or purpose.

**Conclusion.** The player's AI should sit where the growing curves cross: **companion warmth + real utility + identity at the depth of genius (layer 6)**, carried by the empty layer 1 (activation). Companionship alone fails; utility alone is a commodity; the empty layers are the moat.

**Next step (Sasha, 2026-10-29):** map products onto this map (friend.com, Plaud, and the rest), see where AI is going, pick what to build; building is cheap now.
