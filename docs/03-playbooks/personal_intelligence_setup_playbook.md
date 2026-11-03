---
title: Personal Intelligence (AI) Setup Playbook: agentic routines
version: 0.2 (install path added; routines template + first instance, expected savings unmeasured)
date: 2026-10-17 (v0.2: 2026-11-03)
audience: anyone who wants the same AI setup (Part 0), and founders who want the loop to run without them (Part A)
status: draft, Hark reviews and merges
companions: docs/ai/README.md, docs/01-vision/ai_frontier_hark_2026-10.md, docs/01-vision/ai_os_benchmark.md
license: CC BY-NC-SA 4.0
---

# Personal Intelligence (AI) Setup Playbook: agentic routines

*A copyable template. Part 0 is the install path, step by step, from an empty account to one chat that runs your mail, messengers, files, code and media. Part A is generic: any founder can replicate it. Part B is one worked instance (Sasha's). Part A never depends on Part B.*

The setup stage has two layers. The first layer is the cognition scaffold (AI OS, see [ai_os_benchmark.md](../01-vision/ai_os_benchmark.md)): what context the model thinks in. This playbook covers the second layer, the **routines**: what the system does on its own, without being asked.

---

## Part 0. Install path, step by step

*Added 2026-11-03 (v0.2). The question this answers: "I like how you use AI: it writes in your Telegram, messages someone on WhatsApp, cuts video with sound, builds your site, and all of it lives in one interface, even one chat. How do I install that for myself?" Use it as a checklist when you walk a person through the setup. Each stage ends with a check you can see.*

### The shape

One chat is the cockpit. Behind it sit five layers; install them bottom up.

| Layer | What it gives | Stage |
|---|---|---|
| 1. Orchestrator | One chat with memory, projects, scheduled tasks, Home panels, browser | 1 |
| 2. Accounts | Mail, calendar, files, code, team chat, saved logins and keys | 2, 3 |
| 3. Hands on your machine | Your own Telegram and WhatsApp, your screen, your files | 4, 5 |
| 4. Cognition | The AI OS: how the AI thinks with you and what it may do without asking | 6 |
| 5. Workers and media | Coding agents, video and sound, publishing | 7, 8, 9 |
| 6. Routines | What runs on its own | 10 (Part A) |

Rule for the guide: one stage per sitting, finish its check, then move on. Stages 1, 2, 3 and 6 are the minimum useful setup (about 2 hours). Everything else is added when a real task asks for it.

### Stage 1. Orchestrator (20 min)

- Create an account in Hark (web, iOS, Android; Mac app optional). Ours runs on a paid plan; the free plan is enough to try.
- Say who you are in the first chat: name, city, work, language, how you like to be spoken to. The orchestrator saves it to memory.
- Create one Project per ongoing body of work (for example: business, health, a launch).
- **Check:** ask "what do you know about me?" and get a correct one-paragraph answer.

### Stage 2. Connected accounts (15 min)

- Connect Google (Gmail, Calendar, Drive, Docs, Sheets), GitHub, Slack, from Settings → Connected accounts or by asking in chat.
- **Check:** "what's on my calendar tomorrow?" and "summarize my last 5 emails" both answer from the real accounts.

### Stage 3. Vault: logins and keys (20 min)

- Save logins for the sites the AI should act on (LinkedIn, X, Instagram, your site's admin) through the secure form, never in chat.
- Save API keys the same way (examples from our setup: meeting notes, transcription, hosting, a Telegram bot token).
- Write the approval rules in plain words: what it does without asking, what it always confirms (money, outbound messages, public posts, warm contacts).
- **Check:** "open my LinkedIn notifications" works without you typing a password.

### Stage 4. Your own Telegram and WhatsApp (30 min, needs a Mac)

Why: browser sessions of Telegram Web and WhatsApp Web expire and keep asking for codes and QR scans. Running both on your own Mac as tools (MCP servers) keeps them signed in as you.

1. Download the setup script the orchestrator gives you into Downloads.
2. In Terminal type one line: `bash ~/Downloads/evolver-messengers-setup.sh`. Do not paste the script's text into Terminal.
3. Telegram: open my.telegram.org/apps, sign in, create an app (any name, platform Desktop), paste `api_id` and `api_hash` into Terminal, then the login code Telegram sends you. These stay on your Mac.
4. WhatsApp: scan the QR code with your phone (Linked devices).
5. The script prints an ADDRESS and copies an access key to the clipboard. Send the address in chat; paste the key into the secure form.
6. After a reboot: run `~/evolver-messengers/start.sh` and send the new address.
- **Check:** "show my last 5 Telegram chats" and "show my last WhatsApp messages from <name>" answer. Sending still needs your yes.

### Stage 5. Your screen and files (20 min, optional, Mac)

- Screen control (Peekaboo) and a Downloads folder bridge, both exposed the same way as Stage 4 (local server, access key, tunnel, registered as MCP).
- Shared-computer rule: the AI drives your screen only when you are not using the Mac.
- **Check:** "list the newest files in my Downloads".

### Stage 6. Cognition: the AI OS (30 min)

- Install the AI OS as a custom skill (our stack: base 5.2 plus 6.0 on top). It sets how the AI thinks: answer first, own judgment, integral lenses, compressed language. See [ai_os_benchmark.md](../01-vision/ai_os_benchmark.md).
- Add your own canon: who you are, your mission, your operating principles, your voice rules. Keep them in a repo so they outlive any one tool.
- **Check:** ask a hard decision question; the answer leads with a recommendation, the reason and a confidence, not a list of options.

### Stage 7. Workers: coding agents (40 min, needs GitHub)

- One repo as the second brain (docs, specs, logs). Ours: `evolver-grid-site`.
- Claude Code through the GitHub Action (`claude.yml`, secret `CLAUDE_CODE_OAUTH_TOKEN`): the orchestrator opens an issue with `@claude`, Claude opens a PR, checks run, the orchestrator merges.
- Optional second and third trees: Codex cloud (ChatGPT) and Jules (Gemini). Optional local runners on the Mac (launchd, one labeled issue every 30 min) for private repos, to spend the subscription instead of Actions minutes.
- **Check:** one small issue goes from "@claude" to a merged PR without you opening GitHub.

### Stage 8. Video, sound, images (20 min)

- Built into the orchestrator: ffmpeg and ImageMagick in its sandbox (cut, join, add sound, captions), image generation, transcripts from a video link.
- Generated video: Veo through Google Flow, driven by the browser on your Google account (monthly credits).
- Meetings: a notes tool (ours: Fathom) and transcription (ours: Deepgram), connected by API key.
- **Check:** send a clip and ask "add this sound at 0:03 and give me a 9:16 version".

### Stage 9. Publishing (20 min)

- Site: a hosted app (ours: Lovable with GitHub sync, Vercel). The orchestrator ships through PRs; publishing stays a human button where credits are involved.
- Social: X, LinkedIn, Instagram, a Telegram channel. One post, written once, cross-posted by a skill; anything public still gets your yes.
- **Check:** a draft post appears in chat ready to approve for all networks.

### Stage 10. Routines

Once the stages above work, add the routines in Part A in the install order given there.

### How to walk a person through it

1. **Why first (5 min).** Ask what they want the AI to take off their plate this month. That picks which optional stages they need.
2. **Minimum setup in one sitting:** Stages 1, 2, 3, 6. End with one real task done end to end from the chat.
3. **One stage per next sitting,** only when a real task needs it. A stage nobody uses is noise.
4. **Every stage ends on its check,** seen with their own eyes, not described.
5. **Approval rules before power.** Write what needs their yes before connecting messengers or money.

### Open items (v0.2)

- Exact plan names and prices are not listed here; confirm them on the day of setup.
- Stage 4 is being installed on Sasha's Mac on 2026-11-03; times and the check get corrected after the first full run.
- A Windows path for Stages 4 and 5 is not written yet.
- Each stage gets a short screen recording once the path is stable.

---

## Part A. The template

### Principle

| Role | Who | Does |
|---|---|---|
| Direction | The human | Sets goals, makes the choices, gives approvals |
| Orchestrator | A persistent AI with memory of the person and the projects (ours: Hark) | Holds context and approvals, frames work, reads one-line reports |
| Executors | Coding agents (Claude Code, Codex) | Do the heavy reading and building in the repo |
| Verification | Automation (CI, a critic agent, health checks) | Checks every result before it counts as done |

**Every routine is three parts: trigger + context + steer/verify.**

- **Trigger:** what starts it. A schedule, an event in the repo, or a webhook. Never "remember to ask".
- **Context:** what the agent is given when it starts. A prompt file, the diff, the style rules. The routine must not depend on chat history.
- **Steer/verify:** how the output is checked and corrected. A critic agent, a test, a health check, or a human edit that gets logged.

A routine that lacks one of the three is a habit, not a routine.

Design rules that apply to all seven:

1. **Generator and critic are different runs.** The agent that wrote the change does not approve it.
2. **Resumable.** Each run writes its state to a file or an issue, so a failed run can be picked up instead of restarted.
3. **One-line report.** A routine that succeeds says so in one line. A routine that fails opens an issue. Nobody reads logs.
4. **Least privilege.** Each workflow gets only the permissions it names. Secrets live in repo secrets, never in prompts or files.
5. **Loop guard.** A routine that commits must not retrigger itself (path filters or a bot-author check).

### Why

Without routines, the orchestrator's token budget goes to reading diffs, polling for merges and checking whether the site still loads. With routines, that work happens in CI and the orchestrator reads a summary. Tokens go to judgment: what to build next, what to approve, what to say to a person. Cycle time drops because nothing waits for the next time a human or orchestrator happens to look.

> **Hypothesis until measured.** Our estimate is 60 to 80 percent fewer orchestrator tokens on GitHub work and a 5 to 10 times faster loop (idea to merged and verified). Neither number is measured. A measurement is scheduled; this paragraph gets replaced by the result, whichever way it falls.

### The seven routines

Each entry: what it does, trigger, cost/benefit, skeleton. The skeletons are minimal on purpose. They use `anthropics/claude-code-action@v1` (the same action our `claude.yml` uses) and the repo secret `CLAUDE_CODE_OAUTH_TOKEN`. Replace paths, branch names and prompts with your own.

#### 1. Critic on every PR

- **Does:** a second agent reviews each pull request diff against the repo rules and comments on bugs, drift from the spec and missing tests. It does not push code.
- **Trigger:** `pull_request` opened or updated.
- **Cost/benefit:** one short agent run per PR. Errors are caught before main, and the orchestrator reads the verdict instead of the diff.
- **Ours:** `claude-review.yml` (issue #74, in progress).

```yaml
name: PR critic
on:
  pull_request:
    types: [opened, synchronize]
permissions:
  contents: read
  pull-requests: write
jobs:
  critic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Review PR #${{ github.event.pull_request.number }} against CLAUDE.md.
            Report only real defects: bugs, broken links, rule violations, missing tests.
            Post one comment. Do not edit files. If nothing is wrong, say "No findings."
```

#### 2. Event triggers

- **Does:** a push to an inbox folder (photos, infographics, voice notes) starts an agent that transcribes the new files and commits the text next to them.
- **Trigger:** `push` filtered to `inbox/**`.
- **Cost/benefit:** transcription lands in minutes, not the next morning. Cost is one run per push; the path filter keeps it from running on anything else.

```yaml
name: Inbox transcription
on:
  push:
    branches: [main]
    paths: ["inbox/**"]
permissions:
  contents: write
jobs:
  transcribe:
    if: github.actor != 'github-actions[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 2 }
      - uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Files added under inbox/ in the last commit: run `git diff --name-only --diff-filter=A HEAD~1 -- inbox/`.
            For each image, write a transcription to <name>.md beside it (text as seen, then a 3-line summary).
            Commit with message "inbox: transcribe <names>". Touch nothing outside inbox/.
```

Loop guard: the commit lands in `inbox/` too, so the actor check above is what stops the second run.

#### 3. Docs-sync

- **Does:** after code merges, an agent checks whether docs and the knowledge graph still describe what the code now does, and opens a PR with the fixes.
- **Trigger:** `push` to main, ignoring pushes that only touch docs.
- **Cost/benefit:** docs stop lagging behind the code. The human reviews a small docs PR instead of discovering drift months later.

```yaml
name: Docs sync
on:
  push:
    branches: [main]
    paths-ignore: ["docs/**", "**/*.md"]
permissions:
  contents: write
  pull-requests: write
jobs:
  docs-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 2 }
      - uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Read `git diff HEAD~1`. List docs under docs/ that describe the changed behavior.
            If any are now wrong, fix them on a branch `docs-sync/${{ github.sha }}` and open a PR.
            If none are wrong, stop and say so in one line.
```

#### 4. Post-merge verify

- **Does:** after a merge, waits for the deploy, checks the live site, and opens an issue if it is broken.
- **Trigger:** `push` to main.
- **Cost/benefit:** no agent needed, so it is nearly free. Breakage surfaces before a client notices.

```yaml
name: Post-merge verify
on:
  push:
    branches: [main]
permissions:
  issues: write
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Wait for deploy
        run: sleep 180
      - name: Check site
        id: check
        run: |
          for path in / /pricing; do
            code=$(curl -s -o /dev/null -w "%{http_code}" "https://YOUR-DOMAIN$path")
            [ "$code" = "200" ] || { echo "FAIL $path $code" >> failures.txt; }
          done
          [ ! -f failures.txt ]
        continue-on-error: true
      - name: Open issue on failure
        if: steps.check.outcome == 'failure'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh issue create -R "${{ github.repository }}" \
            --title "Post-merge check failed at ${GITHUB_SHA::7}" \
            --body "$(cat failures.txt)"
```

Replace the sleep with a deploy-status check if your host exposes one.

#### 5. Weekly graph sync

- **Does:** once a week, compares the product repo with the knowledge-graph vault and opens a PR in the vault with new or changed notes.
- **Trigger:** `schedule` (weekly) plus `workflow_dispatch` for manual runs.
- **Cost/benefit:** one run a week. Product knowledge reaches the graph even when nobody remembered to copy it.
- **Ours:** knowledgegraph #164 (in progress).

```yaml
name: Weekly graph sync
on:
  schedule:
    - cron: "0 6 * * 1"
  workflow_dispatch: {}
permissions:
  contents: read
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { path: product }
      - uses: actions/checkout@v4
        with:
          repository: YOUR-ORG/YOUR-VAULT
          path: vault
          token: ${{ secrets.VAULT_PAT }}   # fine-grained token, contents + pull requests on the vault only
      - uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Compare product/docs with vault/ for changes in the last 7 days (product git log).
            Write or update vault notes for anything new. Keep the vault's note format.
            From inside vault/, push a branch `sync/<date>` and open a PR. One-line summary as the PR body.
```

#### 6. Scheduled check-ins

- **Does:** the orchestrator wakes on a schedule, checks open loops (was the PR merged, did the reply arrive, did the deploy pass), closes what is closed, and reports in one line.
- **Trigger:** orchestrator-side schedule, not a repo workflow. Daily for fast loops, weekly for slow ones.
- **Cost/benefit:** a few cheap reads per wake. The human stops being the follow-up reminder.

Skeleton: a loop register the orchestrator owns, one row per open loop.

```yaml
# loops.yml, owned by the orchestrator
- id: pr-74
  waiting_for: "PR merged"
  check: "gh pr view 74 --json state"
  next_check: 2026-10-18
  on_done: "close loop, report one line"
  on_stuck_after: 3d        # escalate to the human, do not keep polling
- id: reply-from-contact
  waiting_for: "reply to the follow-up message"
  check: "inbox search"
  next_check: 2026-10-20
  on_done: "draft answer, ask human to approve"
```

Report format: `Closed 2: PR 74 merged, deploy green. Open 1: reply pending, next check Oct 20.`

#### 7. Learning loops

- **Does:** the agent drafts, the human edits, the agent logs each draft-to-final pair and periodically proposes updates to a style rules file. Over time drafts need fewer edits.
- **Trigger:** every human edit of a draft (logging); weekly or every N pairs (rule update).
- **Cost/benefit:** logging is nearly free. The payoff is the human leaving the loop: measure it as the share of drafts sent unedited.
- **Example:** first messages to new LinkedIn contacts.

```yaml
# learning/linkedin_first_message/pairs.yml  (append-only)
- date: 2026-10-17 (v0.2: 2026-11-03)
  draft: "<agent draft, no names>"
  final: "<what the human actually sent>"
  edit_type: [shorter, dropped_flattery]   # free tags, reused across pairs

# learning/linkedin_first_message/style_rules.md  (the agent proposes, the human approves)
# - Max 3 sentences.
# - No praise in the first line.
# Rule changes cite the pairs that justify them.
```

Update routine: every 10 pairs the agent reads `pairs.yml`, proposes at most three rule changes with the supporting pairs, and the human accepts or rejects. Accepted rules go into `style_rules.md`, which every future draft receives as context. Never put real contact names or message text into a public repo; keep the pairs file in a private location and only the rules file in public.

### Install order

1. Routine 1 (critic) and routine 4 (verify). Cheapest, and they protect everything after.
2. Routine 6 (check-ins). Starts closing loops immediately.
3. Routines 2 and 3 (event triggers, docs-sync).
4. Routine 5 (graph sync), once you have a vault worth syncing.
5. Routine 7 (learning loops), once you have a task you repeat weekly.

### Measuring it

Record a baseline for two weeks before installing, then compare:

| Metric | How |
|---|---|
| Orchestrator tokens per merged PR | Usage export, divided by merged PRs |
| Loop time | PR opened to merged and verified, median |
| Defects reaching main | Count of fix-up PRs within 48 hours of a merge |
| Human touches | Edits and approvals per PR |
| Unedited draft share (routine 7) | Drafts sent as written / drafts |

---

## Part B. Sasha's instance (worked example)

Same seven routines, with the roles filled in. No private data here; this shows the shape, not the contents.

| Role | In our setup |
|---|---|
| Direction | Sasha |
| Orchestrator | Hark. Holds context and approvals, writes issues for the executors, reads one-line reports. See [ai_frontier_hark_2026-10.md](../01-vision/ai_frontier_hark_2026-10.md) |
| Executors | Claude Code (via `claude.yml`, triggered by `@claude` in issues and PRs) and Codex |
| Verification | GitHub Actions: the PR critic, the post-merge check, the nightly `corpus-drift.yml` |

| # | Routine | Status in our repos |
|---|---|---|
| 1 | Critic on every PR | `claude-review.yml`, issue #74 in evolver-grid-site. **In progress until merged** |
| 2 | Event triggers (inbox) | Tracked in issue #74; scope to be confirmed against the merged files. **In progress until merged** |
| 3 | Docs-sync | Tracked in issue #74; scope to be confirmed against the merged files. **In progress until merged** |
| 4 | Post-merge verify | Tracked in issue #74; scope to be confirmed against the merged files. **In progress until merged** |
| 5 | Weekly graph sync | knowledgegraph #164. **In progress until merged** |
| 6 | Scheduled check-ins | Run by Hark. Loop register and report format as in Part A |
| 7 | Learning loops | First loop: LinkedIn first messages. Pairs stay in the private ledger; only the rules are public |

The split of repos and approvals follows the lane contract in `CLAUDE.md`: Claude Code does not write Hark-owned files, and Sasha approves anything outbound or involving money.

Rows 1 to 5 are written from the brief for this playbook, not from the merged files, and will be corrected once #74 and knowledgegraph #164 land. If a skeleton in Part A differs from what we shipped, the shipped workflow wins and Part A gets updated.

---

## Sources

- Anthropic, "Code with Claude" talk on routines: trigger, context and verify as the unit; scheduled, event and webhook agents; generator and critic split; resumability. This playbook follows that structure. Verify details against the recording before quoting it.
- [issue #74](https://github.com/alexanderkonst/evolver-grid-site/issues/74) (evolver-grid-site): live implementation of routines 1 to 4. In progress.
- knowledgegraph #164: live implementation of routine 5. In progress.
- [ai_os_benchmark.md](../01-vision/ai_os_benchmark.md): the cognition-scaffold layer this builds on.
- [ai_frontier_hark_2026-10.md](../01-vision/ai_frontier_hark_2026-10.md): the orchestrator layer, measured on the self-awareness holomap.
