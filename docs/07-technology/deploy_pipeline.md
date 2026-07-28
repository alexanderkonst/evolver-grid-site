# Deploy Pipeline — Mechanism, Risk, and the Typecheck Gate

*Investigation triggered Jul 28, 2026: a generic-message commit and a near-miss route pointing at a nonexistent module both reached `main` via the "deploy" sweep. A separate bug (`/privacy` white-screening on a `ReferenceError`) had already reached production because `npm run build` did not typecheck. This doc records what the auto-commit mechanism actually is, and what changed. For the full protocol and philosophy, see `.agent/deploy.md` — this file is the incident-driven companion, not a duplicate.*

---

## What actually triggers the "deploy" commits

**It is a manual shell one-liner Sasha runs himself**, recalled from `~/.zsh_history` via up-arrow, many times a day. It is documented verbatim in `.agent/deploy.md`:

```bash
MSG="deploy" && cd ~/evolver-grid-site && bash -lc 'set -euo pipefail; branch=$(git rev-parse --abbrev-ref HEAD); git add -A; if ! git diff --cached --quiet; then git commit -m "'"$MSG"'"; fi; git fetch origin; git rebase origin/main; if [ "$branch" != "main" ]; then git push -u origin "$branch"; git checkout main; git merge --no-ff "$branch" -m "Merge $branch"; git push origin main; git branch -d "$branch"; git push origin --delete "$branch" || true; else git push origin main; fi'
```

Confirmed by:
- `git log --format='%an %ae %cn %ce %s'` — every "deploy" commit is authored **and** committed by `alexanderkonst <alexanderkonst@gmail.com>` (his real local git identity, not a bot or CI account).
- `.git/hooks/` has no active hooks (only the stock `.sample` files), and `core.hooksPath` points at the default `.git/hooks` — so nothing is firing on commit/push locally.
- No cron, no `launchctl` entry, no LaunchAgent references "deploy"/"evolver"/"lovable" on this Mac.
- No GitHub Actions workflow, Netlify/Vercel config, or Lovable config runs `git commit`. `vercel.json` only has rewrites/cache headers. The only workflow (`.github/workflows/corpus-drift.yml`) is a read-only nightly check, not a committer.
- `scripts/mcp-claude-code-bridge/server.mjs` (the Cowork ↔ Claude Code dispatch bridge) explicitly instructs headless Claude Code to commit with **a descriptive message, "NOT deploy"** — so the bridge is not the source of generic messages either; it's actually the thing warning against them.

**What it sweeps:** `git add -A` — literally everything in the working tree, tracked and untracked, regardless of which agent or process put it there. This is the root of the symptom: if a second Claude Code session, a Cowork session, or a background dispatch has half-finished edits sitting in the tree when Sasha runs his one-liner, they get swept into the same "deploy" commit and pushed straight to `main` — no branch, no PR, no review.

**Why it exists this way (by design, per `.agent/deploy.md`):** solo-founder repo, deliberate trade of speed over review ceremony. Push to `main` fires deploy to three surfaces simultaneously: alexanderkonstantinov.com (primary), Vercel, and Lovable. The one-word "deploy" message is meant to be the *terminal-sweep* label specifically for this batching pattern — it is working as designed, just without a safety net for what's being swept.

### Confirmed while investigating (live example)

At the time of this audit, `src/modules/transition-quiz/TransitionQuizPage.tsx` was mid-edit by another agent (per explicit scope constraint, not touched here) and had 8 real type errors (`TFunction` incompatibility). Had `deploy` run at that exact moment, before this gate existed, those errors would have shipped straight to production silently, because `vite build` does not typecheck — it only transpiles.

## The gap: `npm run build` never typechecked

`vite build` (esbuild/SWC under the hood) strips types without checking them. A file can have real type errors — undefined references, wrong function signatures — and still produce working-looking JS output, until the specific broken code path executes at runtime. That's exactly how `/privacy` white-screened: a `ReferenceError` that a real typecheck would have caught before it ever reached `main`.

## What changed (this pass)

1. **Added `typecheck` script** to `package.json`:
   ```json
   "typecheck": "tsc --noEmit -p tsconfig.app.json"
   ```
2. **Gated `build` on it:**
   ```json
   "build": "npm run typecheck && vite build"
   ```
   Now any path that runs `npm run build` — the three hosted deploy surfaces almost certainly build via this script — fails loudly on a type error instead of silently shipping it.
3. **Verified before/after** in an isolated `git worktree` off `HEAD` (not the live dirty tree, since another agent's in-progress work was sitting there): baseline `npm run build` at `HEAD` passed clean; `npm run typecheck` at `HEAD` passed clean (exit 0); gated `npm run build` at `HEAD` passed clean. No regression.

## What was deliberately NOT touched

- **The shell one-liner itself.** It lives in Sasha's shell history, not a file or hook this session controls. Per scope, only an existing local hook/script that is "clearly the auto-committer" gets a gate added directly — none exists. Nothing here disables, rewrites, or intercepts the one-liner.
- **No git hook was invented.** `.git/hooks/` was left as-is (no pre-commit/pre-push hook added). Adding one would be a new mechanism, not a gate on an existing one, and was out of scope for this pass.
- **Lovable's hosted sync, Vercel config, launchd/cron** — untouched, per constraint. If any hosted surface's build step does *not* run `npm run build` (e.g. calls `vite build` directly), this gate won't reach it — worth Sasha confirming per-surface.

## Decision left to Sasha

The `typecheck`-in-`build` gate only fires when something actually invokes `npm run build`. It does **not** stop the one-liner from pushing straight to `main` before any build runs, and it does **not** prevent the `git add -A` sweep from grabbing another agent's half-finished file in the first place. Two options, not acted on here:

1. **Turn the one-liner into a saved script** (e.g. `scripts/deploy-sweep.sh`) that runs `npm run typecheck` (or `npm run build`) *before* `git add -A`/commit/push, aborting the sweep on failure. This would be a new local script Sasha owns and could ask this session (or Claude Code) to create and wire into his shell alias — but that's an explicit ask, not implied by "harden the deploy process."
2. **A local `pre-push` hook** in `.git/hooks/` that runs the typecheck (or full test suite) before any push to `main` reaches the remote — would catch the one-liner too, since hooks fire regardless of how the push is invoked. Not added here because no existing hook was found to extend, and inventing new local infrastructure crossed the line drawn for this pass ("only gate an existing local hook/script that is clearly the auto-committer").

Either is a five-minute follow-up if Sasha wants the gate to reach the one-liner itself, not just the hosted build step.

---

## Privacy incident: real CRM/pulse names reached public artifacts (Jul 28, 2026)

**What leaked.** `scripts/emit-project-pulse-snapshot.mjs` (predev/prebuild) reads the
gitignored private ledgers — `docs/09-logs/project_pulse_log.md` and
`docs/02-strategy/strategic_crm_outreach_tracker.md` — and writes two JSON snapshots
that are *not* private:

- `src/generated/project-pulse-snapshot.json` — statically imported by
  `src/pages/CockpitDashboard.tsx`, so it ships inside the bundled JS for anyone who
  loads the site, admin-gated UI or not.
- `public/generated/project-pulse-snapshot.json` — served at an unauthenticated public
  URL.

Both contained real first names (Gleb, Karime, Nia, Oyi, Chris, Rafael, Sergey, and
others) and free-text pipeline strategy (`next_action`, `what_happened`, event
`title`/`pulse` slugs) — e.g. `"Sasha to send Gleb the Reflection Proposal, anchoring
the BUSINESS door."` The sibling script `scripts/emit-crm-snapshot.mjs` had the exact
same shape of leak, worse in degree: `offers[].name`/`.notes` and
`upcomingEvents[].participants`/`.notes` carried full names (e.g. "Chris Milliken",
"Andrey Kamyshan") and per-relationship dollar amounts, also reaching both the bundled
JS and a public URL.

**Why fix-forward, not history rewrite.** Sasha's explicit call: the exposure is first
names of people who know him, not financial/credential data, and rewriting git history
(`filter-branch`, force-push) is more disruptive than the leak itself. This section is
the fix-forward record, not a claim that the historical commits are clean.

**A tracked-file fix already existed for half of this.** `src/generated/crm-snapshot.json`
and `public/generated/crm-snapshot.json` were already gitignored and untracked before
this pass — someone had previously stopped committing them. That fix only addressed *git
history churn*; it did nothing about the content itself, which was (and, before this
pass, still is) real names written straight from the tracker into a bundled/public
artifact every time `predev`/`prebuild` ran. Untracking a file does not anonymize it.

**What changed.**

1. **New shared anonymizer** — `scripts/sources/anonymize.mjs`. Builds the name list
   *dynamically* from the CRM tracker itself (Master Table contacts, Offer Ledger,
   Upcoming Events participants, Energy Leak Audit, Intuitive Launch batches) plus, for
   the pulse snapshot, the pulse log's own structured `who:`/`actors:` fields — not a
   hardcoded regex list, so it stays current as contacts are added. Each distinct
   person gets a **stable token** (`P-XXXX`, derived from a hash of their fullest known
   name) — the same person always maps to the same token across runs and across both
   snapshots, so the cockpit stays internally coherent. Two people who share a first
   name (e.g. two different "Andrey"s) are kept as two different tokens rather than
   merged. Scrubbing runs over structured name fields *and* free text (`notes`,
   `next_action`, `what_happened`, event `title`/`pulse` slugs) — a name buried in prose
   or in a `snake_case` slug (`gleb_business_spiritual_integration_offer`) is scrubbed
   the same as a name in a dedicated `name` column.
2. **Both emit scripts now scrub before writing.** `emit-project-pulse-snapshot.mjs`
   and `emit-crm-snapshot.mjs` build the anonymizer from `readBroadcastTracker()` and
   run every emitted field through it before either JSON file is written. Verified: zero
   case-insensitive matches for Gleb, Karime, Nia, Oyi, Chris, Milliken, Rafael, Sergey,
   Roman, Andrey, and Kamyshan in the regenerated files.
3. **`public/generated/crm-snapshot.json`'s vestigial-copy status did NOT hold for the
   pulse snapshot — corrected from the original ask.** The plan going in was to stop
   writing `public/generated/project-pulse-snapshot.json` entirely (it looked unused
   from the frontend). Grepping the Supabase functions surfaced that
   `supabase/functions/generate-pulse-brief/index.ts` and
   `supabase/functions/equilibrium-telegram-bot/index.ts` both `fetch(`${SITE_ORIGIN}/generated/crm-snapshot.json`)`
   and `.../project-pulse-snapshot.json` **at request time**, over plain HTTP, to build
   the Founder Pulse briefs (rendered in the cockpit) and the Telegram bot's context.
   Deleting the public copy outright would have silently broken both in production.
   **What actually shipped instead:** the public copy is still written by
   `predev`/`prebuild` (so it exists in every deployed build for those two edge
   functions to fetch) but is now (a) anonymized, exactly like the bundled copy, and (b)
   untracked in git (`git rm --cached` + added to `.gitignore`) — it never needs to enter
   the repo's history again, tracked or not, since it's a pure build artifact
   regenerated on every `predev`/`prebuild`.
4. **`src/generated/project-pulse-snapshot.json` stays tracked and committed**,
   regenerated with the anonymized script, because it's statically imported by Vite at
   build time and needs to exist in a fresh checkout before the first build runs.
   `src/generated/crm-snapshot.json` stays untracked (pre-existing convention) — this
   introduces a small asymmetry between the two snapshots worth Sasha's attention if he
   wants them handled identically.

### Follow-up: closing the Cyrillic gap (Jul 28, 2026, same day)

The initial pass flagged Cyrillic names as a known gap rather than a fixed one. Sasha
confirmed this is structural, not a corner case — a large share of his contacts and
pulse-log prose are Russian — and authorized closing it. `scripts/sources/anonymize.mjs`
now handles Cyrillic on three fronts:

1. **Cross-script identity linking.** The same person often appears in both scripts
   (Gleb / Глеб, Karime / Кариме, Rafael / Рафаэль). Each Cyrillic candidate name is
   transliterated to Latin (a practical, non-canonical scheme — it only needs to be
   close enough for matching, not linguistically correct) and fuzzy-matched
   (Levenshtein distance, ~30%-of-length threshold) against the already-built Latin
   alias set. A match reuses that person's existing token; no match mints a new one
   from the transliteration. Two different people sharing a first name are still kept
   as two identities (same guard as the Latin pass), never merged.
2. **Russian declension via stemming, not exact-string matching.** Names decline
   (Глеб/Глеба/Глебу/Глебом/Глебе; Валенская/Валенской/Валенскую). The scrubber strips
   the longest matching case ending and requires the remaining stem to be **at least 4
   characters** before accepting the strip; shorter results fall back to matching only
   the exact nominative form. This is a deliberate trade-off, not an oversight: "Женя"
   minus the "я" ending would leave the stem "жен", which collides with "жена" (wife),
   "женщина" (woman), "женский" (feminine) — all plausible words in Sasha's
   spiritual-business prose. The 4-character floor sacrifices declension coverage for
   short names in exchange for not corrupting ordinary Russian sentences elsewhere in
   the same corpus. Two-word full names ("Женя Валенская") are matched and replaced as
   one unit before any single-word stem pass runs, specifically so a two-word mention
   collapses to ONE token instead of the same token twice.
3. **Free-text scanning for names not in any structured column.** "Женя Валенская"
   never appears in a CRM `name`/`participants` column — it only exists inside a
   `what_happened` prose sentence. The scrubber now deep-scans every string field (not
   just structured name columns) for **two consecutive capitalized Cyrillic words** and
   registers those as high-confidence full names. Lone single capitalized Cyrillic words
   in free prose are deliberately NOT auto-registered this way — Russian sentences
   routinely open with a capitalized common word, and treating every one as a candidate
   name would shred the pulse log's Russian narrative text. Lone first names are only
   trusted from structured fields (CRM contacts/offers/participants, pulse `who:`/
   `actors:`), where "this is a name" is a safe assumption.
4. **Residual reporting, not silent gaps.** After scrubbing, both emit scripts now scan
   their own output for capitalized-Cyrillic word pairs and lone name-like words that
   survived, and print them to the console (`⚠ ... Cyrillic token(s) survived
   scrubbing...`) rather than silently shipping them. This list is intentionally
   over-inclusive — a live run on this corpus surfaced 11 items (Рада, Посмотрю, Мой,
   Остальное, Клуб, Погоди, Логически, Трайп, Интересно, Идеальный), all verified by
   hand to be ordinary Russian words/quoted dialogue openers ("Рада тебя слышать" — "glad
   to hear from you"; "Мой основной тезис" — "my main thesis"), not missed contacts. The
   report is a review aid for whoever runs the emit scripts next, not a guarantee of
   zero false positives or zero false negatives.

**Verified:** zero matches (including declined forms) for Глеб, Карим, Рафаэл, Серге,
Женя, Валенская, Андрей, Талалаев, Ния, Роман across all four generated artifacts, in
addition to the original Latin-script list.

**Known residual limits, stated plainly rather than assumed handled:**
- **Short names (stem would resolve under 4 characters) are matched in nominative form
  only.** A declined form of a short name that doesn't happen to share the nominative's
  first 4+ characters can slip through. This is the direct trade-off described in point
  2 above.
- **Fuzzy cross-script matching is string-similarity, not identity resolution.** There is
  no ground-truth link between "Глеб" and "Gleb" beyond "these strings are close after
  transliteration." Two genuinely different short names could theoretically fall within
  the match threshold of each other and get merged; there is no way to fully rule this
  out without a real identity database.
- **Free-text registration only trusts two-consecutive-capitalized-word sequences.** A
  Cyrillic name mentioned ALONE in prose (not in a structured field, not paired with
  another capitalized word) will not be auto-registered from that mention — it will only
  get scrubbed if it also appears somewhere in a structured field (contacts/offers/
  participants/who/actors). If a brand-new contact is ever named only once, in passing,
  as a single word in prose, this pass will miss them. The residual-scan warning is the
  safety net for exactly this case, but it requires a human to read the console output.
- **Transliteration is a practical approximation, not a linguistic standard.** It was
  tuned to make the specific names in this corpus match correctly; an uncommon Cyrillic
  name with an unusual letter combination could transliterate to something too far (by
  edit distance) from its Latin counterpart to link automatically — it would still get
  its own (unlinked) token, just not necessarily the SAME token as its Latin mentions.

**Standing rule.** Any generated artifact derived from a private ledger
(`docs/09-logs/project_pulse_log.md`, `docs/02-strategy/strategic_crm_outreach_tracker.md`,
or any future private source) must run through `scripts/sources/anonymize.mjs` (or an
equivalent, purpose-built scrubber) before it is written to *any* path that is bundled
into shipped JS, served from `public/`, or fetched over an unauthenticated URL by an
edge function. Gitignoring a generated file only stops future git-history churn — it
does not anonymize the content, and the content is the actual leak.
