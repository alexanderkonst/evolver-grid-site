# AI model landscape — state as of 2026-10-29

Compiled 2026-10-29 from web sources, each cited with its date. Prices are USD per 1M tokens, given as input / output, standard tier, short context. **[secondary]** means the number came from a third-party aggregator or blog and I did not check it against the vendor's own page. **[unverified]** means I could not confirm it, or sources conflict.

**Read this first: Artificial Analysis (AA) changed its index on 2026-10-27.** It replaced Intelligence Index v4.3.2 with v5, which is harder and rescaled. Scores on the two versions cannot be compared. In this report, "v5" means the current index and "v4.3" means the old one.

---

## 1. Model types, leading examples, API prices

### 1a. Frontier closed models (list prices as of 2026-10-15; source: [Frontier Wire survey of vendor pricing pages](https://thefrontierwire.com/articles/llm-api-pricing-compared/))
| Model | Lab | $/M in / out | Notes |
|---|---|---|---|
| GPT-6 Astra | OpenAI | 10 / 50 | Top OpenAI model. Prices are $20 / $75 above 272K input tokens. |
| GPT-6.1 Sol | OpenAI | 2 / 10 | Mid-tier flagship. |
| GPT-6.1 Terra | OpenAI | 1 / 5 | Released Oct 2026 ([AA, 2026-10-26](https://artificialanalysis.ai/articles/gpt-6-1-terra-pushes-the-cost-efficiency-frontier)). |
| GPT-6 Luna | OpenAI | 0.10 / 0.50 | Small tier. |
| Claude Fable 5.1 | Anthropic | 10 / 50 | Anthropic's flagship. |
| Claude Opus 5.5 | Anthropic | 4 / 20 | Same rate across the full 1M context. |
| Claude Sonnet 5.5 | Anthropic | 2 / 10 | |
| Claude Haiku 5.5 | Anthropic | 0.10 / 0.50 | Applies to prompts up to 100K tokens. Above that it is $0.50 / $2.50. |
| Gemini 4 Argon | Google | 2 / 10 | Rises to $4 / $20 on 2026-12-01. |
| Gemini 4 Carbon | Google | 4 / 20 | Restricted access: only for cyber defenders in Google's Fairwind program ([AA, 2026-10-28](https://artificialanalysis.ai/articles/gemini-4-carbon-new-number-1); [enjoy.dev, 2026-10-28](https://enjoy.dev/blog/intelligence-index-v5/)). |
| Gemini 3.8 Flash | Google | 0.75 / 3.75 | Doubles on 2027-01-01. |
| Gemini 2.5 Flash-Lite | Google | 0.10 / 0.40 | Covered by Google's free tier. |
| grok-4.7 | xAI | 2 / 6 | Released 2026-09-21. 500K context. Rate doubles for every token in a request once the prompt reaches 200K. |
| grok-4.20 / 4.3 | xAI | 1.25 / 2.50 | Includes a "multi-agent" variant. |
| Muse Wonder Full | Meta | No public API | Available only through Meta's own product plans. |

Discounts and modifiers:
- **Batch:** OpenAI, Anthropic and Google all charge 50% for batch.
- **Cached input:** costs 2.5–10% of the normal input rate.
- **DeepSeek off-peak:** 50% off during off-peak hours.

### 1b. Reasoning / "thinking" modes
- **Every frontier model now has adjustable effort levels, and the level changes both score and cost a lot.** Examples from AA v5 ([AA, 2026-10-27](https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v5)):
  - Claude Opus 5.5 scores 35 at low effort for $0.98 per task, and 58 at max effort for $10.04 per task.
  - Sonnet 5.5's score varies by 29 points from low to max effort.
  - GPT-6.1 Sol's spread is 20 points.
- **Reasoning tokens are billed as output tokens even when you never see them**, per OpenAI's reasoning guide and Google's pricing page (source: Frontier Wire, above).
- **v5 tasks use far more output.** The median model now writes 59K output tokens per task, up from 35K on v4.3 (source: AA, above).

### 1c. Large open-weight models (all Mixture-of-Experts; roughly 1M context is now standard)
| Model | Released | Size (total / active) | Price $/M in / out | License |
|---|---|---|---|---|
| Kimi K3.1 Pro (Moonshot) | 2026-10-23 | 2.8T / 104B | 2 / 10 | **Weights not yet published.** Release is promised for 2026-11-04 ([AA, 2026-10-23](https://artificialanalysis.ai/articles/kimi-k3-1-pro-launch-benchmarks); [af.net, 2026-10-29](https://af.net/realtime/artificial-analysis-overhauls-ai-benchmark-to-curb-benchmaxxing-as-moonshot-ais-kimi-model-drops-in-standings)). |
| Kimi K3 | 2026-07-16 | 2.8T / 104B | 3 / 15 | Weights released, but the license carries restrictions ([HF, 2026-08-14](https://huggingface.co/blog/state-of-open-models-summer-2026)). |
| DeepSeek V4.1 Flash 1017 | 2026-10-17 | Sources disagree: 763B ([aimachinevs](https://aimachinevs.com/blog/open-weight-models-october-2026)) vs 552B backbone with 8–16B active ([Respan](https://www.respan.ai/blog/best-open-source-llms)) **[unverified]** | 0.30 / 1.20 peak; 0.15 / 0.60 off-peak | MIT |
| DeepSeek V4 Pro | — | — | 1.32 / 3.96 peak | MIT |
| GLM-5.3 (Z.ai) | 2026-08-14/18; weights about 2 weeks later | 753B | 1.40 / 4.40 | Custom GLM-5.3 license |
| GLM-5.3-Flash | — | — | 0.15 / 0.50 | — |
| Qwen3.8 family (Alibaba) | 2026 | Open: 2.4T-A95B (restricted license) and a 27B dense model. Max tier is API-only. | Qwen3.8-Flash-Next: 0.15 / 0.47 **[secondary]** | Mixed |
| MiMo-V2.6-Pro (Xiaomi) | 2026-09-21 | — | 0.435 / 0.87 **[secondary]** | MIT |
| Muse Spark Open (Meta) | 2026-10-15 | 816B / 42B | 1.25 / 4.25 on OpenRouter | Muse Model License, gated download |
| Mistral Large 4 | 2026-10-06 | — | — | Weights' availability is unclear: one source says not shipped as of 2026-10-15, another (2026-10-29) says weights are available **[unverified]** ([pasqualepillitteri](https://pasqualepillitteri.it/en/news/24368/best-open-weight-models-october-2026-compared), [VentureBeat](https://venturebeat.com/technology/mistral-large-4-le-chonk-arrives-as-the-top-open-model-outside-china-with-improved-coding-performance-and-63-lower-cost-per-task)) |
| gpt-oss-120b / 20b (OpenAI) | 2025 | — | From $0.037 / $0.17 at DeepInfra | Apache 2.0 |

**Llama:** I found no new Llama release in 2026. Meta's current open model is Muse Spark Open. Llama now trails other families in local-use downloads (GGUF format: the files local runners like llama.cpp use):

| Family | GGUF downloads per month |
|---|---|
| Qwen | 39.6M |
| Gemma | 20.8M |
| Llama | 7.5M |

Source: [HF State of Open Models, 2026-08-14](https://huggingface.co/blog/state-of-open-models-summer-2026).

### 1d. Small / edge models (under 15B parameters; run on-device or in a browser)
- **Gemma 4 E2B / E4B** (Google; Apache 2.0)
  - Effective size 2.3B / 4.5B; 5.1B / 8B total parameters.
  - 128K context.
  - Inputs: text, image and audio.
  - Source: [Actian, 2026-09-18](https://www.actian.com/blog/developer/phi-4-mini-vs-gemma-4-vs-qwen3-best-llm-for-raspberry-pi-5/).
  - Speed on an iPhone 17 Pro (GPU): 56.5 tokens/s decode ([Intelligibberish, 2026-08-06](https://intelligibberish.com/articles/run-an-llm-locally-on-android-and-iphone/)).
- **Gemma 4 12B** (2026-06-03): runs on 16 GB of VRAM or unified memory; native audio input ([Google](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12b/)).
- **Other families:**
  - Qwen3.5 (0.8B–9B)
  - Qwen3.6-27B
  - MiniCPM5-2B (2026-09-07)
  - Phi-4 (14B) and Phi-4-mini (3.8B)
  - Ministral 3 (3B / 8B / 14B)
  - Nemotron 3 Nano 4B
  - SmolLM3 3B
- **In-browser runtimes:**
  - **WebLLM 0.2.85** (2026-09-08): 163 prebuilt model builds. Runs Llama 3.1 8B at 41.1 tokens/s on an M3 Max, about 71% of native speed ([Pinggy, 2026-09-20](https://pinggy.io/blog/run_llm_in_browser_webgpu/)).
  - **Chrome Prompt API** (built-in Gemini Nano): stable since Chrome 148 (2026-05-05). Requires 22 GB free disk and more than 4 GB VRAM.
  - **LiteRT-LM web:** up to 76 tokens/s, a figure Google reports for a MacBook Pro.
  - **Browser support:** Safari and Firefox had no stable WebGPU as of June 2026 ([Creeta, 2026-06-06](https://news.creeta.com/en/webllm-0-2-83-browser-on-device-llm-guide-2026)).
- **Small models via API:**
  - GPT-6 Luna and Claude Haiku 5.5: $0.10 / $0.50
  - Gemini 2.5 Flash-Lite: $0.10 / $0.40
  - DeepSeek Flash off-peak: $0.15 / $0.60

### 1e. Specialized models
- **Code:** see §4.
  - The strongest open models for agentic coding are GLM-5.3 and DeepSeek V4.1 Flash.
  - Reflection Beam (501B, Apache 2.0) has been announced, but its weights are not out ([Medium, 2026-10-05](https://medium.com/@dkwebsolutions/reflection-ai-unveils-beam-what-a-501b-open-weight-coding-model-means-for-developers-2abc374edd9f)).
- **Voice / realtime:**
  - Gemini 3.8 Live Extended Thinking is #1 on AA's Speech-to-Speech Index at 82.6% ([The Batch, 2026-10-02](https://www.deeplearning.ai/the-batch/voice-video-and-reasoning-in-one)).
  - On AA's Controlled Voice text-to-speech board, HeyGen Voice is #1 at Elo 1201, priced at $30 per 1M characters ([Digg/AA post, 2026-10-09](https://digg.com/ai/1n156b8r)).
  - On the TTS arena, Eleven v4 Turbo leads at Elo 1330, priced at $40 per 1M characters **[secondary]** ([Dbggr, 2026-10-13](https://dbggr.dev/articles/voice-ai-compared/)).
  - Ollama now offers local TTS (Phonon, 2026-10-24).
- **Image:** GPT Image 2.5 Sunburst is #1 on AA's text-to-image board at Elo 1222 ([9to5AI, 2026-10-24](https://9to5ai.tech/best-ai-image-generators-leaderboards)).
- **Video:** Wan 3.0 is #1 on AA's text-to-video board at Elo 1175 ([Renderhour, 2026-10-25](https://renderhour.com/blog/ai-video-leaderboard-price-vs-rank-2026)). Price at 1080p per minute: Wan 3.0 $12; Veo 3.1 (rank #21) $24.
- **World models:**
  - **Genie 4** (DeepMind, 2026-10-27): research preview; waitlist only; no price yet ([DeepMind](https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation), [TechCrunch](https://techcrunch.com/2026/10/27/googles-genie-4-world-model-adds-audio-more-realistic-worlds-and-real-time-steering/)).
  - **World Labs Marble:** public World API; consumer plans $0 / $20 / $35 / $95 per month. World Labs has agreed to join AMD.
  - **NVIDIA Cosmos 3:** open weights ([NVIDIA, 2026-10-22](https://blogs.nvidia.com/blog/cosmos-open-train-evaluate-deploy-world-models/)).

### 1f. Routers and MoE
- **MoE is the default architecture.** Long context (about 1M tokens) plus MoE is now the standard shape of an open model ([deepset, 2026-10-26](https://www.deepset.ai/blog/open-source-llm-open-weight-models)).
- **Multi-model routers are now packaged as products:**
  - **GitHub Copilot Fusion** routes and orchestrates between Anthropic and OpenAI models. On AA's Coding Agent Index it scores 59.9 at $5.59 per task, against 61.7 at $11.42 for Claude Code with Opus 5.5 ([enjoy.dev, 2026-10-23](https://enjoy.dev/blog/coding-agent-index-2/)).
  - **Microsoft Copilot harness:** multi-model, now offered through Foundry ([Microsoft, 2026-10-28](https://blogs.microsoft.com/blog/2026/10/28/introducing-the-microsoft-copilot-harness-unlocking-the-potential-of-truly-multi-model-agentic-work/)).
  - **OpenRouter** has an `openrouter/free` router that picks an available free model automatically.

---

## 2. Price vs quality evidence

### Leaderboards (late Oct 2026)

**AA Intelligence Index v5** — scores and cost per task ([AA, 2026-10-27/28](https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v5)):

| Model | Score | Cost per task |
|---|---|---|
| Gemini 4 Carbon | 59 | $7.76 (restricted access) |
| Claude Opus 5.5 | 58 | $10.04 |
| GPT-6 Astra | 57 | $6.24 |
| GPT-6.1 Sol | 55 | $1.27 |
| Claude Sonnet 5.5 | 54 | $10.02 |
| GPT-6.1 Terra | 51 | $0.96 |
| Gemini 4 Argon | 50 | $7.68 |
| Muse Wonder Full | 50 | — |
| Claude Fable 5.1 | 49 | $13.04 |
| Kimi K3.1 Pro | 46 | $3.68 |
| Claude Haiku 5.5 | 36 | — |
| DeepSeek V4.1 Flash | 32 | — |
| GLM-5.3 | 32 | — |
| Mistral Large 4 | 26 | — |

The per-task costs come from [enjoy.dev, 2026-10-28](https://enjoy.dev/blog/intelligence-index-v5/).

**LMArena text** ([arena.ai, 2026-10-15](https://arena.ai/leaderboard/chat/text); [benchlm, 2026-10-22](https://benchlm.ai/llm-leaderboard-history)):
- Top three: Gemini 4 Argon 1524 ±9, Claude Opus 5.5 ~1508–1516, Claude Fable 5.1 ~1512.
- The confidence intervals of the top six models overlap.
- Gemini 3.8 Flash (High) is #8 at 1498. It costs $0.75 / $3.75.
- Top open model: MiMo-V2.6-Pro at 1491, #11.

**HLE-Diamond** (refined subset of Humanity's Last Exam, inside AA v5):
- Opus 5.5 68%, GPT-6 Astra 64%, Fable 5.1 60%.
- Best open model: Kimi K3.1 Pro at 37%.

**SWE-bench:**
- SWE-bench Verified is saturated: top scores are around 95–96% (Claude Opus 5 / Fable 5, [benchlm](https://benchlm.ai/benchmarks/swe-bench-verified)).
- On Scale's SWE-Bench Pro V2 public set, the top score is 99.4%. Scale itself flags likely training-data exposure.
- The **private** set is the clean measurement. Tasks solved out of 272 ([Scale, 2026-09-22](https://labs.scale.com/blog/swe-bench-pro-v2)):

| Model | Solved (of 272) |
|---|---|
| Claude Opus 5 | 222 |
| Kimi K3 | 214 |
| GLM-5.3 | 211 |
| Gemini 3.8 Flash | 211 |

### Concrete cases: much cheaper model near or above a pricier one
1. **GPT-6.1 Terra vs Claude Fable 5.1** (AA v5): Terra scores **51** at $0.96 per task and $1 / $5 per token. Fable 5.1 scores **49** at $13.04 per task and $10 / $50. Terra scores higher at about 1/13 of the cost.
2. **GPT-6.1 Sol vs Claude Opus 5.5** (AA v5): Sol scores **55** at $1.27 per task. Opus 5.5 scores **58** at $10.04 per task. Sol is 3–4 points lower at about 1/8 of the cost (AA's own statement).
3. **Claude Sonnet 5.5 on the old v4.3 index** ([Neural Daily, 2026-10-18](https://www.neuraldaily.news/en/a/ai-models-intelligence-per-dollar-october-2026)): Sonnet 5.5 scored **56.0** at $2 / $10, above both Fable 5.1 (53.4) and GPT-6 Astra (52.7), which each cost $10 / $50.
4. **Claude Haiku 5.5** ($0.10 / $0.50): scores **36** on v5, above every open-weight model with released weights (32 at best).
   - On v4.3 it led intelligence per dollar at 217 points per dollar.
   - MiMo-V2.6-Flash was effectively tied at 216.6 ([Neural Daily](https://www.neuraldaily.news/en/a/ai-models-intelligence-per-dollar-october-2026)).
5. **Gemini 3.8 Flash on SWE-Bench Pro V2 private** ($0.75 / $3.75): solves 211 of 272 tasks, against 222 for Claude Opus 5, which costs several times more per token.
6. **Coding Agent Index v2.0** (AA, 2026-10-22):

| Setup | Score | Cost per task |
|---|---|---|
| Codex with GPT-6.1 Sol | 54.1 | $1.50 |
| Copilot Fusion | 59.9 | $5.59 |
| Claude Code with Opus 5.5 (max) | 61.7 | $11.42 |

   Source: [enjoy.dev](https://enjoy.dev/blog/coding-agent-index-2/). A different source reports "Codex + Sol 63 for $1.04" **[unverified; probably a different index version]** ([grahammiranda](https://tech.grahammiranda.com/ai-coding-harness-comparison/)).
7. **Video:** Wan 3.0 ranks #1 at $12 per minute. Veo 3.1 ranks #21 at $24 per minute.
8. **Kimi K3 is the counterexample: open weights do not mean cheap.** Kimi K3 is priced at $3 / $15, which is Sonnet-tier pricing ([Druva, 2026-07-31](https://www.druva.com/blog/open-models-crossing-frontier-or-expensive)).
   - A single SSRN working paper estimates that closed models sell at 2.6× the price of equally capable open models ([Krasnov, 2026-10-22](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7654759)).
9. **The per-token price list is misleading.** Cost per task (total tokens used × price) can reorder models. On v4.3, Opus 5.5 at xhigh effort matched Sonnet 5.5 at max on score (56) but cost $3.46 per task against $5.46 ([Neural Daily](https://www.neuraldaily.news/en/a/ai-models-intelligence-per-dollar-october-2026)).

---

## 3. Convergence

### Open vs closed models: the gap is small but not shrinking, and it depends on how you measure
**Epoch Capabilities Index (ECI):**
- Since January 2026, open models trail closed ones by about **4 months**, or about 8 ECI points ([Epoch, 2026-05-29](https://epoch.ai/data-insights/open-closed-eci-gap)).
- The earlier figure for January 2023 to October 2025 was **3 months** ([Epoch, 2025-10-30](https://epoch.ai/data-insights/open-weights-vs-closed-weights-models)).
- On cyber capabilities the gap is **6–7 months** ([Epoch, 2026-10-16](https://epoch.ai/data-insights/open-closed-cyber-eci-gap)).
- The gap has occasionally closed almost completely: Llama 3.1-405B in July 2024, and DeepSeek R1 in January 2025.

**Private vs public benchmarks:** open models are **8–10 months** behind on private benchmarks and 4–6 months behind on public ones. The gap was smallest in January 2025 and has grown since ([LessWrong, 2026-05-28](https://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)).

**AA index:**
- The open–closed gap went from 3 points (v4.3, counting Kimi K3.1 Pro) to **12 points** on v5.
- Among models with released weights, the gap is 26 points.
- AA attributes the change to v5 using mostly private, held-out tests: 60% of the index.

**Arena (Stanford AI Index 2026):** the top closed model led the top open model by 3.3% in March 2026, up from 0.5% in August 2024 **[secondary, via [GenAI Brief, 2026-09-22](https://genaibrief.com/models/open-weight-models-closing-the-gap/)]**.

**Who leads open models:** they come mostly from Chinese labs (Moonshot, DeepSeek, Z.ai, Alibaba, Xiaomi). The top open models from outside China are Mistral Large 4 (v5 score 26) and Meta's Muse Spark Open.

### Gap among the top labs: very small
- On AA v5, Google, Anthropic and OpenAI sit within **4 points** of each other: 59 / 58 / 57 / 55.
- On LMArena text, the top six models have overlapping confidence intervals.
- No model leads all 9 v5 evaluations. Opus 5.5 leads 3, and five other models lead the remaining six (AA).
- A secondary source counts "eleven leaders in ten months" on AA's leaderboard ([Acadia, 2026-10-29](https://www.acadia.im/blog/ai-benchmarks-2026-which-ai-should-you-use)) **[headline only, not checked]**.
- I could not find xAI's v5 score. Grok 4.7 is not in the published v5 top 10.

---

## 4. Harness and scaffold types

**What a harness is.** A harness is a system prompt plus the tools around a model. Microsoft defines it as "everything around the model" ([2026-10-28](https://blogs.microsoft.com/blog/2026/10/28/introducing-the-microsoft-copilot-harness-unlocking-the-potential-of-truly-multi-model-agentic-work/)).

**For strong models, the harness changes cost more than score:**
- Scale ran GLM-5.3 and Kimi K3 through three different harnesses (mini-swe-agent, Pi, OpenCode) and got about the same scores. Its conclusion: "Pick the harness for the bill, not the score" ([Scale, 2026-09-22](https://labs.scale.com/blog/swe-bench-pro-v2)).
- On Terminal-Bench 4.0, Opus 5.5 scores 64.8% in Claude Code and 65.2% in a single-bash-tool harness **[secondary]**.

### Coding agents
- **Main products:** Claude Code, OpenAI Codex (parallel agents, cloud), Cursor (agents, skills, plugins), GitHub Copilot (app, Fusion), Google Antigravity CLI (Gemini CLI stopped serving consumers on 2026-06-18) **[secondary]**.
- **Open agents:** OpenCode v2 (any model) and Pi.
- **Adoption** ([host0, 2026-10-07](https://host0.ai/blog/state-of-ai-coding-agents-2026); the PR figures are host0's own count):
  - In September 2026, **25.8%** of public GitHub pull requests carried a coding-agent signature, up from 6.9% a year earlier.
  - About 4.26M of those PRs carried a Claude Code footer.
  - JetBrains survey: 39% of professional developers use Claude Code at work.

### MCP (Model Context Protocol)
- Donated to the Agentic AI Foundation (AAIF, under the Linux Foundation) in December 2025.
- About **40K** servers are listed in the official registry, and the SDKs see about 0.5B downloads per month ([host0, 2026-10-06](https://host0.ai/blog/state-of-mcp-2026)).
- More than 1B tool calls have gone through Claude ([The Stack, 2026-09-18](https://www.thestack.technology/state-of-mcp-multi-agent-identities-and-overlapping-protocols/)).
- **New in 2026:**
  - A stateless spec.
  - A roadmap covering agent identity and agent-to-agent messaging ([MCP blog, 2026-08-22](https://blog.modelcontextprotocol.io/posts/mcp-roadmap/)).
  - **Skills over MCP** (SEP-2640) became an official extension ([Bloomberg, 2026-10-21](https://www.bloomberg.com/company/stories/skills-over-mcp-how-bloomberg-helped-standardize-agent-skills-at-scale/)).

### System prompts and skills
- Agent Skills (folders of `SKILL.md` instructions that load on demand) moved to the AAIF on 2026-10-22. More than 70 platforms have integrated the format ([TechForward, 2026-10-23](https://techforward.io/agntcon-mcpcon-na-2026-aaif-agent-skills-open-responses/)).
- In the same announcement, OpenAI contributed Open Responses and Hugging Face contributed OpenEnv.
- MCP vs skills: MCP provides access to systems; skills provide procedures. The GitHub MCP server loads about 19.7K tokens up front by default, and about 1.2K when its tools load on demand instead ([Voyager, 2026-10-20](https://voyager.so/blog/mcp-vs-skills)).

### RAG and memory
- **Memory libraries:** Mem0 (vendor claim: LoCoMo 92.5), Letta (memory blocks, agent runtime), Zep/Graphiti (a knowledge graph that tracks when facts change), Supermemory.
- **Built into chat products:**
  - ChatGPT "Dreaming" memory (June 2026): a background process that maintains a self-updating memory. It cannot be exported.
  - Claude memory: free since March 2026 **[secondary]** ([Agently, 2026-08-03](https://agently.dev/blog/best-ai-agent-memory-2026)).

### Personal AI OS products (assistants built around memory)
- **OpenClaw** ([GitHub](https://github.com/openclaw/openclaw)): self-hosted. Memory is plain Markdown files (MEMORY.md, USER.md). Reaches you over WhatsApp, Telegram, iMessage and others. Models can be swapped. Version 2.0 shipped 2026-09-01.
- **Hermes Agent** (Nous Research):
  - Memory is capped files: MEMORY.md at 2,200 characters and USER.md at 1,375.
  - It writes its own skills from experience ([docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)).
- **Hosted assistants:** Poke ($19 / $199 per month), Zo Computer, Perplexity Computer, Alexa+.

### Multi-agent setups
- Codex runs agents in parallel.
- Claude Code has `/batch` and agent teams.
- Grok 4.20 has a Multi-Agent API.
- Copilot Fusion uses one model to draft and another to review.

### Local / sovereign stacks
- **Tools:** llama.cpp (GGUF), Ollama, LM Studio, vLLM, SGLang, MLX.
- **Scale of what runs locally:** GGUF builds now exist for DeepSeek V4 Flash (about 284B) and Kimi K3 (about 2.8T) (HF, 2026-08-14).
- **For one workstation GPU:** Qwen3.8 27B dense, Gemma 4 26B-A4B and Gemma 4 31B.

---

## 5. Long or complex system prompts with small models

**Short answer: yes, small models degrade earlier and more sharply.**
- They fail under instruction load sooner and fall to lower floors.
- Their effective context is far shorter than what they claim.

The strongest controlled data is from 2025-generation models. I found no 2026 rerun with the current small models (Haiku 5.5, GPT-6 Luna, Gemma 4).

**IFScale** ([arXiv 2507.11538, July 2025](https://arxiv.org/html/2507.11538v1)): measures accuracy as the number of instructions in one prompt grows.

| Model | 10 instr. | 50 | 100 | 250 | 500 |
|---|---|---|---|---|---|
| gpt-4.1-nano | 94% | 72.8% | 51.6% | 25.7% | 16.2% |
| gpt-4o-mini | 94% | 65.6% | 41.8% | 18.3% | 10.4% |
| claude-3.5-haiku | 98% | 78.0% | 43.4% | 16.6% | 8.5% |
| llama-4-scout | 100% | 54.4% | 27.2% | 9.3% | 6.7% |
| gpt-4.1-mini | 100% | 93.2% | 80.0% | 44.5% | 27.2% |
| gpt-4.1 | 98% | 98.8% | 95.4% | 74.0% | 48.9% |
| o3 (high) | 100% | 99.6% | 98.2% | 97.8% | 62.8% |
| gemini-2.5-pro | 100% | 99.6% | 98.4% | 84.8% | 68.9% |

- **How each kind of model degrades:**
  - Small models decay exponentially and level off at a floor of 7–15%.
  - Large non-reasoning models decline roughly linearly.
  - Reasoning models stay near-perfect until about 150–250 instructions, then fall off.
- **Position effects:**
  - Earlier instructions are followed more reliably than later ones. This bias peaks at about 150–200 instructions.
  - Small models fail by dropping instructions entirely, rather than half-satisfying them.

**Instruction Stacking Collapse** ([arXiv 2608.02639, 2026-07-31](https://arxiv.org/abs/2608.02639)):
- Setup: 1–20 checkable instructions stacked in one prompt, tested on Sonnet 4.6, GPT-5-mini and Gemini 2.5 Flash.
- Follow rate fell from about 96% to as low as 20%.
- Much of the failure comes from pairs of instructions that contradict each other. Example: an "output JSON" constraint cannot be satisfied together with 9 of the other constraints.
- A fix: rewriting the prompt once with a separate "compiler" call recovered **up to +11 points for weaker models** and did essentially nothing for strong ones.

**Long context:**
- **NoLiMa** ([ICML 2025](https://arxiv.org/html/2502.05167)):
  - At 32K tokens, 11 of 13 models fell below 50% of their short-context score.
  - Llama 3.1 8B: effective length about 1K tokens; scored 76.7 at base and 14.2 at 32K.
  - GPT-4o mini: effective length under 1K tokens.
- **"Context Length Alone Hurts"** ([EMNLP Findings 2025](https://aclanthology.org/2025.findings-emnlp.1264)):
  - Performance dropped 13.9–85% as input grew, even when the model retrieved the needed information perfectly.
  - Proposed fix: have the model recite the relevant evidence before answering.
- **Chroma "context rot"** ([2025-07-14](https://www.trychroma.com/research/context-rot)): across 18 models, reliability falls as input length grows.
- **Multilingual** ([EACL 2026](https://aclanthology.org/2026.eacl-long.290.pdf)): models effectively use less than 30% of their claimed context.

**Other findings:**
- Explicit chain-of-thought reasoning can *lower* instruction-following accuracy. Example: Llama3-8B on IFEval fell from 75.2% to 59.0% ([arXiv 2505.11423](https://arxiv.org/pdf/2505.11423)).
- Models overfit IFEval's limited set of constraint types. IFBench uses 58 new constraint types to test whether they generalize ([arXiv 2507.02833](https://arxiv.org/html/2507.02833v2)).
- Small-model TPU benchmark: models of 2–4B hold up on tool calls but fall behind on long prompts ([deniz.in, 2026-10-13](https://deniz.in/apache-2-0-small-models-benchmarked-against-gemma-4-e2b-on-one-tpu-v5e)) **[excerpt only]**.

**Implications (my inference from the sources above, not something they state):** for small models, it should help to:
- keep the always-loaded system prompt short and load skills or tools only when needed;
- put critical rules first;
- remove instructions that conflict with each other;
- consider a one-time prompt "compile" step.

---

## 6. Hosting costs for open models (as of Oct 2026)
| Provider | Free tier | Example paid price $/M (in / out) | Speed |
|---|---|---|---|
| Groq | Free plan for gpt-oss-120b / 20b and Qwen3.8 27B: 30 requests/min, 1K requests/day, 200K tokens/day | gpt-oss-120b 0.15 / 0.60 | ~500 tokens/s on gpt-oss-120b |
| Cerebras | One-time $5 credit, expires after 30 days | gpt-oss-120b 0.35 / 0.75 | ~3,000 tokens/s (gpt-oss-120b); ~1,850 (Qwen3.8 27B) (vendor figures) |
| Together AI | — | gpt-oss-120B 0.15 / 0.60; GLM-5.3 1.40 / 4.40; Kimi K3 2.70 / 13.50 | — |
| Fireworks | $1 credit | gpt-oss-120b 0.15 / 0.60; GLM-5.3 Fast 2.10 / 6.60; Kimi K3 3 / 15 | Fast tier aims for 100+ tokens/s |
| DeepInfra (cheapest found) | — | gpt-oss-120b 0.037 / 0.17; DeepSeek V4.1 Flash 0.14 / 0.42; GLM-5.3 (FP4) 0.562 / 2.50; Kimi K3 2.85 / 14.25 | — |
| OpenRouter | 17–25+ free models: 20 requests/min; 50 requests/day, or 1,000/day once $10 of credits has been bought | Same price as the underlying provider | — |
| Gemini API | Free tier covers Flash / Flash-Lite and Gemma 4. Free-tier data is used to improve Google products. | — | — |
| Cloudflare Workers AI | 10K "neurons" per day | gpt-oss-120b 0.35 / 0.75 | — |
| SambaNova | gpt-oss-120b: 20 requests/min, 20 requests/day | — | — |

Sources:
- [apidog, 2026-10-22](https://apidog.com/blog/free-ai-api/)
- [hashnode, 2026-10-27](https://hashnode.com/blog/free-open-weight-model-apis)
- [andrew.ooo, 2026-10-05](https://andrew.ooo/answers/cheapest-inference-provider-for-open-weight-models-2026/) and [2026-10-10](https://andrew.ooo/answers/best-ai-infrastructure-providers-real-time-inference-2026/)
- [memetik, 2026-10-05](https://www.memetik.ai/guides/together-ai-competitors)
- [Cerebras](https://www.cerebras.ai/inference)

All of these are **[secondary]**, citing the providers' own pages. Fireworks notes that Groq retired several models in 2026 at short notice and that Cerebras offers only about 4 models.

---

## Gaps and caveats
- **Version comparisons:** v5 (2026-10-27) and v4.3 scores are on different scales, so I never compare across them.
- **Pricing changes:** several prices change soon. Gemini 4 Argon doubles on 2026-12-01, Gemini 3.8 Flash doubles on 2027-01-01, and GPT-5.6 Sol's promotional price runs through at least 2026-11-21.
- **Not verified:**
  - Grok 4.7's v5 score.
  - DeepSeek V4.1 Flash's parameter count.
  - Whether Mistral Large 4's weights are available.
  - Prices for Qwen and MiMo; these come only from the AA listing via Neural Daily.
  - The second Codex + Sol Coding Agent figure.
- **Instruction-following studies:** these use 2025-era models. I found no 2026 data on Gemma 4 or Haiku 5.5 under long system prompts.
- **Sourcing:** many numbers come from aggregators. Where I fetched a primary source, it is AA, Scale, Epoch, arXiv or DeepMind.
