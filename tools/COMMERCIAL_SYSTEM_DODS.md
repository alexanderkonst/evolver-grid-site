# Canonical Commercial System — Definitions of Done

## Release 1: Source-complete

Owner: Codex.

- [x] Three project-adapted artifacts exist.
- [x] One versioned ledger contract connects all three.
- [x] First-touch source attribution survives downstream enrichment.
- [x] Commercial stages are monotonic.
- [x] Tool 3 outcomes return to Tool 1 by ICP and search term.
- [x] Deterministic tests pass for each tool.
- [x] End-to-end ledger round trip passes.
- [x] Every artifact script passes JavaScript syntax validation.
- [x] Original requirements, implementations and master handoff are packaged together.
- [x] Package integrity is verified after creation.
- [x] No secrets, account IDs or private connector URLs are included.

Release verdict: PASS.

## Release 2: Connector-bound

Owner: Claude Cowork with Sasha present.

- [ ] Exact Connect Safely tool names and schemas are observed.
- [ ] Sasha's LinkedIn account and owner profile ID are confirmed.
- [ ] Gmail owner and internal exclusions are confirmed.
- [ ] Tool 1 performs one five-result search.
- [ ] Tool 2 reads a small conversation sample and verifies one person.
- [ ] Tool 3 reads small Gmail and LinkedIn samples.
- [ ] No live message, email or connection request is sent during verification.
- [ ] Each artifact reopens with cached data.
- [ ] Each artifact saves a recoverable backup.

Release verdict: pending private connector access.

## Release 3: Feature-parity

Owner: Claude Cowork.

- [ ] Every gap in CLAUDE_MASTER_HANDOFF.md is implemented or blocked by observed connector behavior.
- [ ] Tool 1 refreshes search terms without repetition and ranks terms by downstream commercial outcomes.
- [ ] Tool 2 completes crawl/cursor recovery, message caching, template editing and defensive send paths.
- [ ] Tool 3 completes incremental sync, AI ambiguity handling, summaries, timing, pipeline and snooze/close views.
- [ ] Full original-document acceptance matrix is produced.

Release verdict: pending connector-bound completion.

## Release 4: Operationally live

Owner: Sasha.

- [ ] Sasha approves and sends the first Tool 1 connection request.
- [ ] Sasha approves and sends the first Tool 2 LinkedIn message.
- [ ] Sasha approves the first Tool 3 Gmail draft.
- [ ] One real person advances without duplication from source to reply/call.
- [ ] One real offer/payment is recorded on that same canonical person.
- [ ] Tool 3 export updates the originating Tool 1 search-term outcome.
- [ ] Weekly commercial ritual is completed once.

Release verdict: pending real use.

## Deployment DoD

- [ ] Release branch is pushed.
- [ ] CI/build is green.
- [ ] PR is merged to main.
- [ ] Production deployment completes.
- [ ] Production URL responds successfully.
- [ ] Existing customer-facing surfaces show no regression.

Important: deploying this repository distributes and preserves the handoff package. It does not bind Claude's private connectors. Connector-bound and operationally-live DoDs remain separate gates.
