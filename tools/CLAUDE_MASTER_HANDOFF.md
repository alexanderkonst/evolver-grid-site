# MASTER HANDOFF — Build and Run Sasha's Canonical Commercial System

You are in one Claude Cowork session with Alexander "Sasha" Konstantinov. Connect Safely is already bound to this Claude account. Gmail may need to be enabled for Tool 3.

This is a continuation of substantial implementation work done in Codex. Do not restart from generic prompts and do not replace the supplied canonical architecture.

## Mission

Finish, bind, publish and safely run three persistent artifacts:

1. ICP Prospector
2. Outreach Radar
3. Relationship Hub

They are three views over one commercial ledger:

source → connection → reply → call → offer → payment → delivery → expansion

The work is successful only when one real/test-safe person can travel through the three tools without duplication or loss of source attribution, and Tool 3 outcomes return to Tool 1.

## Files Sasha will attach

### Original requirements — authoritative for feature parity

- linkedin-icp-prospector-setup-guide.md
- marcela-outreach-radar-prompt.md
- Prompt_ Build _Relationship Hub_ for Marcela.md

### Canonical architecture and activation

- COMMERCIAL_SYSTEM_DODS.md
- COMMERCIAL_SYSTEM_RUNBOOK.md
- commercial-ledger/SCHEMA.md
- commercial-ledger/core.mjs
- commercial-ledger/core.test.mjs
- commercial-ledger/integration.test.mjs

### Tool 1

- linkedin-icp-prospector/artifact.html
- linkedin-icp-prospector/core.mjs
- linkedin-icp-prospector/core.test.mjs
- linkedin-icp-prospector/CLAUDE_HANDOFF.md

### Tool 2

- linkedin-outreach-radar/artifact.html
- linkedin-outreach-radar/core.mjs
- linkedin-outreach-radar/core.test.mjs
- linkedin-outreach-radar/CLAUDE_HANDOFF.md

### Tool 3

- relationship-hub/artifact.html
- relationship-hub/core.mjs
- relationship-hub/core.test.mjs
- relationship-hub/CLAUDE_HANDOFF.md

## Business truth — do not rewrite

Product category: Next-Chapter Positioning.

Promise: help highly capable people name what is next professionally and package their distinctive value into a clear offer.

Canonical person ladder:

- Free: 45-minute Direction Call
- Paid: $555 Productize Yourself Session
- Expansion: $1,111 BUILT container

Canonical LinkedIn ICP experiments:

- Post-exit founders in visible transition
- Fractional executives
- Coaches and solopreneurs with abstract positioning
- Big Four / MBB consultants approaching transition
- Community and ecosystem holders

Default region is Global. Priority markets: US, Canada, UK, Australia, Singapore and Dubai.

Operating limits:

- No autonomous outreach
- No test message or connection request to a real person
- Explicit confirmation before every send
- Tool 1 weekly request cap: 80
- LinkedIn message reads are serial and gently delayed
- One CTA per outreach message

## What Codex already completed

- Project-adapted ICPs, search terms and deterministic scoring.
- Canonical identity and commercial-stage models.
- First-touch source attribution.
- Monotonic funnel stages; enrichment cannot downgrade a person.
- Tool 1, Tool 2 and Tool 3 artifact shells.
- Deterministic core tests for all tools.
- Shared evolver-commercial-ledger v1 envelope.
- Legacy import compatibility for people and contacts arrays.
- Tool 3 outcome aggregation by original ICP/search term.
- Tool 3 → Tool 1 outcome feedback ingestion.
- Offline end-to-end round-trip test.

Preserve this code unless live connector evidence requires a narrowly explained adapter change.

## Known completion gaps — do not ignore

The artifacts are strong MVP shells, not full parity with every original requirement. Complete these gaps in Claude:

### Tool 1 gaps

- Probe and bind exact fully-qualified Connect Safely tool names.
- Validate the real search response adapter.
- Complete editable search-term performance UI.
- Implement Refresh search terms and auto-refresh with used-term exclusion.
- Rank term quality using downstream replies, calls, payments and cash, not volume alone.
- Complete sortable columns and score-breakdown UX.
- Verify queue state updates one row without resetting the table.
- Verify Monday UTC cap reset against live time.

### Tool 2 gaps

- Probe all required connector calls and premium status.
- Complete full connection crawl/resume behavior; connector may return only 10 per page.
- Follow all conversation cursors and stop only when a page adds no new threads.
- Cache messages keyed by conversation lastActivityAt.
- Add bulk Verify visible rows.
- Complete editable per-ICP Template view.
- Complete Update template via reverse token substitution.
- Read Sasha's last month of sent LinkedIn messages and propose his real voice before finalizing templates.
- Add full attachment/unread/recovered/high-priority markers where live schema supports them.
- Verify defensive send fallback and show full errors.

### Tool 3 gaps

- Ask once for Sasha's Gmail owner address and internal/team exclusions.
- Probe Gmail and LinkedIn response shapes.
- Complete Gmail pagination up to ten pages and per-participant extraction.
- Complete LinkedIn conversation pagination and 160-thread serial message cap with randomized 0.9–1.5s delay.
- Implement true recent incremental sync based on last sync.
- Add AI triage only for deterministic ambiguities.
- Add Summarise, Smart timing and voice-matched Draft follow-up.
- Add Pipeline kanban, Snoozed filters and Closed filters.
- Implement saved-state fallback across source identity keys.
- Verify Gmail action creates a draft reply and never claims it sent.
- Verify booked-meeting auto-snooze and fresh-question exception.

### Cross-tool gaps

- Confirm one canonical envelope imports cleanly through all three published artifacts.
- Confirm source attribution survives Gmail enrichment.
- Confirm downstream outcomes visibly update Tool 1 term performance.
- Save a backup after each first substantial sync.

## Required work order

### Phase 0 — connector reconnaissance

Before editing code:

1. Probe every required Connect Safely and Gmail tool once.
2. Show Sasha:
   - exact fully-qualified tool name
   - required arguments
   - normalized response fields
   - any discrepancy from the supplied prompts
3. Identify the LinkedIn accountId and owner profile ID.
4. Ask for Gmail owner/team addresses only when beginning Tool 3.

Do not bulk crawl in chat. Bulk work runs inside the artifact.

### Phase 1 — Tool 1

1. Finish the listed gaps.
2. Extract the script and run node --check.
3. Run deterministic/offline tests.
4. Publish as ICP Prospector.
5. Run exactly one five-result search for one ICP.
6. Do not connect to anyone.
7. Save backup and export canonical ledger.

### Phase 2 — Tool 2

1. Finish gaps.
2. Publish as Outreach Radar.
3. Import Tool 1 ledger.
4. Refresh a small conversation sample.
5. Verify one visible row.
6. Draft one message but do not send.
7. Save backup and export canonical ledger.

### Phase 3 — Tool 3

1. Confirm Gmail identity/exclusions.
2. Finish gaps.
3. Publish as Relationship Hub.
4. Import Tool 2 ledger.
5. Sync a small Gmail sample first, then a small LinkedIn sample.
6. Confirm one known cross-channel person merges.
7. Confirm booking auto-snooze using test-safe/cached data.
8. Create one Gmail draft only if Sasha explicitly approves the recipient; do not send.
9. Save backup and export canonical ledger.

### Phase 4 — close the loop

1. Import Tool 3 canonical export into Tool 1.
2. Confirm its outcomes attach to originating ICP/search terms.
3. Show Sasha a compact verification table:

   Tool | Published | Live read verified | Write path verified | Backup saved | Remaining risk

Write path verified means schema and confirmation flow verified. It does not require sending to a real person.

## Quality and safety gates

- Bind only the connector tools each artifact actually needs.
- If adding Gmail causes the artifact bridge to disappear, diagnose and report before changing architecture.
- Wait for window.cowork; preserve honest offline mode.
- Dedupe LinkedIn strictly by profileUrn.
- Cross-channel merge prefers stable normalized full name, then source identity.
- Never use isSentByOwner for LinkedIn direction.
- Never render LinkedIn profile photos.
- Never swallow localStorage errors.
- Restore merges; it never replaces.
- Never remove someone merely because new conversation information was found.
- Never send during testing.
- State exactly what was live-verified and what remains schema-only.

## Completion standard

Do not say "done" merely because three artifacts render.

DONE means:

- all original feature gaps above are either implemented or explicitly blocked by observed connector behavior;
- three artifacts are published and reopen with cached data;
- small live reads succeed;
- no duplicates appear in the cross-tool test;
- the shared ledger completes a full round trip;
- backups exist;
- Sasha receives the verification table and operating instructions.

Begin with Phase 0. Do not ask Sasha to re-explain the business.
