# Source Integration: any source → graph → corpus → reflection

*v1.2, 2026-11-08 (intake: Sasha never runs anything; v1.1 same day; v1.1 after the first test run, Hark on a 2:46 private conversation with a collaborator: privacy fixed, compaction, speaker map, conversation mode, series naming). Asked for by Sasha (chat, 2026-11-08): «шаблон, по которому любой искусственный интеллект может взять и выполнить задачу»: run any piece of knowledge (a long YouTube course, a conversation, a book, a talk) through the project, integrate it into the knowledge graph and the corpus with quality, and give Sasha a reflection he can actually absorb. Status: canonical. Lens (see [meta-template.md](./meta-template.md)): Causal.*

**Why it exists.** Hark tokens are scarce; a dense 10-hour course must not pass through Hark's context. This template is the meta-move: Hark (or Sasha) only writes the one-line intake; any capable agent (Claude Code, Codex, GPT, Gemini, a Hark subagent) executes it end to end; Sasha reads only the reflection.

---

## 0. How to run it (copy one line)

**Sasha never runs anything.** He gives a link and a depth; the rest is agents. (v1.2, 2026-11-08: v1.1 told him to open Claude Code and install yt-dlp; he rejected that, rightly.)

**Default, Mode B via Hark:** Hark fetches the transcript itself (its video-transcript tool works where YouTube blocks yt-dlp from cloud and GitHub IPs), commits it verbatim to the step 3 path, opens an issue in `knowledgegraph` with the three lines below plus "step 2 done, start from step 3", and adds it to `90 System/import-queue.yml` (the import chain dispatches Claude, Codex on fallback). Hark then checks the PR against §DoD and brings Sasha only the reflection.

```
Run docs/templates/source-integration.md (evolver-grid-site) on: <URL or file path>.
Depth: <A deep | B standard | C skim>. Privacy: <public | private>. Why now: <one line, optional>.
```

**Mode A, optional:** an agent already running on Sasha's Mac (Claude Code, Codex) with the three repos side by side may run the same line, acquiring with yt-dlp from the home IP. Only when it is already running; never as a chore for Sasha.

**Mode C, Hark:** only for short sources (under ~1 hour) or when Sasha wants to talk it through live. Hark still follows this template and reads only what it needs.

The agent does everything below without asking Sasha anything. Doubts become `[?]` and go into the reflection's open questions.

---

## 1. Intake card (the agent writes it first)

Create the source card (step 3 gives the path) with this front matter:

```yaml
type: source
source_kind: course | talk | conversation | book | article | podcast | own-session
author: <name>
title: <as published>
url: <link or "private recording">
date_published: <YYYY-MM-DD or unknown>
date_ingested: <YYYY-MM-DD>
length: <hh:mm or pages>
depth: A | B | C
privacy: public | private
sasha_lived_through: yes | partly | no   # did Sasha already absorb this himself? (he says so in the intake, else "unknown")
why_now: <one line>
status: acquiring | extracting | integrating | reflected | done
chunks: []   # filled in step 2, each with done: true/false (makes the run resumable)
```

**Depth tiers** (cost scales with depth; default B):
- **A, deep** (a core teacher, a course Sasha builds on): every chunk extracted fully; maps for every structure; corpus edits where they change something.
- **B, standard:** every chunk extracted; notes only for what is new or contradicts; corpus edits only for clear wins.
- **C, skim:** one pass over the whole; source card + up to 7 key ideas + reflection. No new maps.

**Privacy rule.** `evolver-grid-site` is **public**; `knowledgegraph` and `evolver-private-ledger` are **private**.
- Raw transcript of a private conversation (a client, a friend, a call): `evolver-private-ledger/sources/` only.
- Extract of a private conversation: `knowledgegraph` is fine (private), with the interpersonal part kept to a few lines; the CRM holds the rest.
- **Someone else's unreleased work is their IP** (e.g. a friend's system he is still licensing): it may live in the private graph, never in the public corpus, and is marked as theirs.
- Only Sasha's own positions or general ideas, de-identified, may reach `evolver-grid-site`. When unsure, treat as private.

## 2. Acquire the text, verbatim

- **YouTube video or playlist:** `yt-dlp --skip-download --write-auto-subs --write-subs --sub-langs "en.*,ru.*,es.*" --convert-subs srt -o "%(upload_date)s-%(title)s.%(ext)s" <URL>`; for a playlist this gives one file per video. Convert SRT to plain text with a `[h:mm:ss]` stamp every ~30 s; drop duplicate caption lines.
- **A call recorded in Fathom:** pull the transcript through the Fathom API (`api.fathom.ai/external/v1`, key in Sasha's vault, Hark has it) or export it from fathom.video.
- **Audio/video file:** Whisper (local) or any transcription tool; keep speaker labels.
- **PDF/doc:** extract text; keep page numbers as `[p. N]`.

Never summarize at this stage. Save verbatim (step 3 path), with a header: title, URL, author, date, length, how acquired.

**Speaker map** (conversations): diarization is unreliable. Identify who is who from content (who talks about whose project) and write it in the header, e.g. "Speaker 1 = the guest; Speakers 3 and 4 = Sasha; 2, 5–8 = café staff". One person split into two speaker labels and bystanders in a café are both normal. Count each person's words (talk share): it is part of the reflection.

**Compact working copy** (not saved): one line per utterance, `J[1:23:45] text`, markup stripped, bystander lines under four words dropped. Cuts ~30% of tokens; read this, cite timestamps from it.

**Chunking.** A source under ~25k words fits one pass in a large-context model; then log the chunks as topic ranges in the card (still useful for resuming and for the reflection) and read straight through. Otherwise split into chunks of ~20–30 minutes of speech or ~8–10k words, cut at chapter or topic boundaries (YouTube chapters if present). List them in the card's `chunks:`. Each chunk is processed in its own pass, so any model with a modest context window can do it and a run can resume after a cut.

## 3. Where things live

| What | Public source | Private source |
|---|---|---|
| Verbatim transcript | `knowledgegraph/10 Sources/<kind>/<author-slug>/<YYYY-MM-DD>-<slug>.md` (one per video) | `evolver-private-ledger/sources/<YYYY-MM-DD>-<slug>.md` |
| Source card (intake + chunk log + extraction + reflection) | `knowledgegraph/30 Sources/<Author> - <Title>.md` | `knowledgegraph/30 Sources/<Person> — Session N (extract).md` |
| Notes (concepts, frameworks, practices, distinctions) | `knowledgegraph/10 Notes/` | same; the other person's ideas marked as theirs |
| Maps (any structure with parts and arrows) | `knowledgegraph/20 Maps/` | same |
| Corpus edits | `evolver-grid-site/docs/...` (step 6) | only Sasha's own positions, de-identified |
| CRM (people) | none | `evolver-private-ledger/docs/02-strategy/strategic_crm_outreach_tracker.md`: the person's row + version line |
| Reflection to Sasha | end of the source card + PR body | same |

**Series first.** Before naming anything, search `30 Sources/` and `20 Maps/` for earlier material from the same person or author (`Session 1 (extract)`, a map about their work). Continue their naming and numbering, and update the existing map with a dated section instead of starting a new one.

Follow `knowledgegraph/CLAUDE.md` and `AGENTS.md` for note format, naming and link rules. They win over this table if they differ.

## 4. Extract (one pass per chunk)

**Conversation mode** (a talk Sasha took part in): sort the extraction into four lanes. **A. Their ideas** (the other person's; their IP if unreleased). **B. Sasha's own positions said live** (often the most valuable lane: match each against our corpus; many will be SAME-AS, which is a good sign, not waste). **C. The relationship** (status, what was said about the relationship, offers, open loops) → a few lines in the card, details to the CRM row. **D. Off-thread** (life news, small talk): one line, not integrated.


For each chunk, write a block in the source card under `## Extraction` with these item types, each with a timestamp:

- **Framework / model** (named structure: stages, quadrants, cycles). Copy the structure exactly as the author gives it.
- **Claim** (a statement about how things are), with the author's own words in a short quote when it carries the meaning.
- **Practice** (something one can do: steps, an exercise, a protocol).
- **Distinction** (two things the author separates that are usually confused).
- **Story / example** only if it carries a teaching that is not elsewhere.
- **Quote** worth keeping verbatim (≤ 3 per chunk).

Then **match every item against what we already have** before writing anything: search note titles, aliases and full text in `knowledgegraph` and `evolver-grid-site/docs` (start from `docs/docs_index.md`). Tag each item:

- `NEW`: nothing like it in the graph or corpus.
- `EXTENDS <note>`: adds depth, an example or a step to an existing note.
- `SAME-AS <note>`: already there in other words → only add the source link and, if valuable, the author's phrasing as an alias.
- `CONTRADICTS <note>`: says otherwise → keep both, record the tension; never overwrite Sasha's position.
- `OFF-THREAD`: true but not relevant to our work → one line in the card, no note.

Mark the chunk `done: true` in the card when its block is written.

## 5. Integrate into the graph

1. **Merge before create.** `SAME-AS` and `EXTENDS` go into the existing note (a dated section `### From <Author>, <Title> (<date>)`). A new note only for `NEW` items that are a concept, framework or practice in their own right.
2. **Every claim traceable.** Each added line cites the source card and timestamp: `([[<Author> - <Title>]] [1:23:45])`.
3. **Quoted vs hypothesis.** A link the source itself makes is *(quoted)*; a link the agent infers is *(hypothesis)*. Hypotheses never go into front matter.
4. **Maps.** Any framework with parts and arrows gets a map in `20 Maps/` (depth A always, B when it is NEW, C never), with each part linked to the notes that implement it.
5. **Cross-tradition links.** Where an idea is the same thing in another language of the corpus (e.g. a stage model ≈ the Hexagon Cycle, a field practice ≈ a Phase Shift technology), add the link marked *(hypothesis)*. This is where the real value is; spend thought here.
6. **Integrity.** Zero broken links (only notes that exist on `main`), no duplicate titles, nothing deleted. Run the repo's own checks (`scripts/` / CI `pr_check`).

## 6. Integrate into the corpus (evolver-grid-site docs)

Only where the source **changes something we do**: a module, a template, a playbook, a strategy doc, a product.

- Find the target through `docs/docs_index.md` and `docs/templates/README.md`.
- **Never multiply docs** (Sasha's rule): extend an existing doc with a dated section `### Extension from <Author>, <Title> (<date>)`, 3–10 lines, linking the graph note. A new doc only when nothing fits, and say why in the PR.
- Never rewrite Sasha's locked texts or his stated positions; add, mark, link.
- Depth C makes no corpus edits; it may list candidates in the reflection.

## 7. Reflection to Sasha (the only part he must read)

Written last, from the graph and corpus changes, not from the transcript. In the language Sasha used in the intake (Russian by default), plain words, no jargon, ≤ 400 words. Place it at the end of the source card under `## Reflection` and paste it into the PR body.

1. **In one sentence:** what this source is, at its core, for us.
2. **3–5 key insights,** each: the idea in plain words → why it matters for us → timestamp.
3. **What is really new** vs **what we already had** (name our frameworks it matches: "this is our X in other words").
4. **Where it confirms our thesis, where it challenges it.** Tensions honestly, without smoothing.
For a conversation, add the honest read of its dynamics: talk share, the turning point, what shifted. Never a strategy, a line or timing for Sasha's warm contacts: he leads those relationships.
5. **1–3 applications this week** for FindYourTopTalent / the game / a client (each a concrete move, marked *hypothesis*).
6. **One question to Sasha** that only he can answer (what resonated, what he disagrees with). His answer goes to `learnings.md` (Hark) or a dated line in the source card.
7. **Open `[?]`** and anything the agent could not verify.
8. **Counts:** chunks processed / total; notes created / extended; maps; links (quoted / hypothesis); corpus files touched (paths).

Teach-back option (depth A): end with three short questions Sasha can answer from memory in two minutes; his answers show what he integrated and what to revisit.

## 8. Definition of Done (the agent checks every line in the PR)

| Check | Pass when |
|---|---|
| Coverage | every chunk in the card has `done: true` |
| Verbatim | transcript saved with header; no summary in it |
| Traceability | every added claim has source + timestamp |
| No duplicates | no new note duplicates an existing title or concept; `SAME-AS` merged |
| Links | zero broken links; quoted / hypothesis marked; no hypothesis in front matter |
| Privacy | private source: nothing identifying in `evolver-grid-site`; someone else's unreleased work only in private repos |
| Speakers | speaker map in the header; talk share counted (conversations) |
| CRM | conversation: the person's row updated, version line added |
| Corpus | edits are dated extensions; paths listed; no new doc without a reason |
| Reflection | present, ≤ 400 words, has all 8 parts |
| Integrity | repo checks green |

One PR per repo touched, small, with the DoD table. Card `status: done`.

## 9. Cost discipline

- Cheapest capable model for acquire + extract (bulk, per chunk); strongest model for steps 5.5, 6 and 7 (cross-links, corpus, reflection). In Claude Code: `sonnet` for extraction, `opus` for integration + reflection. In Codex: per `knowledgegraph/AGENTS.md` routing.
- Read only what a step needs; search the graph by title/alias before reading notes.
- If blocked twice on the same step, stop, write what was found in the card, open `[?]`, and finish the reflection with what exists.
- A course of many videos: one source card per course, one transcript file per video, chunks across videos; run video by video, committing as you go.

## 10. Worked examples (fill in after first runs)

- *An open YouTube course (depth A, public)*: pending.
- *Private conversation with a collaborator, 2026-11-08 (depth B), run by Hark*: source card in `knowledgegraph/30 Sources/` (commit 691e2c4) + map update; raw + CRM in the private ledger (2d30be6). 2:46, ~23k words read in one pass; 4 lanes; 2 existing notes extended, no new notes (most of Sasha's lane was SAME-AS); 0 public corpus edits. Lessons folded into v1.1.
