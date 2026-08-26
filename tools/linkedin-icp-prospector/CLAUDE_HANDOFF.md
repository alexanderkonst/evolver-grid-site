# Build the portable LinkedIn ICP Prospector artifact

You are operating in Claude Cowork with Alexander Konstantinov's Connect Safely MCP server. Build a persistent, self-contained HTML artifact named **ICP Prospector**.

## First: probe, show evidence, then bind

1. Call `list-linkedin-accounts` once and show Alexander the account found.
2. Call `search-people` once with `{ keywords: "former founder sabbatical", count: 5 }`.
3. Report the exact fully-qualified tool names and normalized response fields before publishing code.
4. Bind only Connect Safely tools into the artifact. Do not bind Gmail or any second MCP server.
5. Never test-send a connection request to a real person. Alexander performs the first request.

## Product truth

This is Tool 1 of one commercial ledger:

`source → connection → reply → call → offer → payment → delivery → expansion`

Its job is only to discover and qualify people, queue human-approved connection requests, and export canonical records for Tool 2. Do not add messaging or nurture features here.

Product: **Next-Chapter Positioning**. Alexander helps highly capable people name what is next professionally and package their distinctive value into a clear offer. Entry is a free 45-minute Direction Call. Paid ladder: **$555 Productize Yourself Session → $1,111 BUILT container**.

Default region: **Global**. Top markets are US, Canada, UK, Australia, Singapore, and Dubai.

## ICP experiments and search terms

Use the exact ICP definitions exported from `core.mjs` in this directory. If Claude cannot read that file, ask Alexander to attach it; do not invent replacements.

## Artifact behavior

- Wait up to 9 seconds for `window.cowork`; support honest offline mode with Retry and JSON restore.
- Run selected search terms sequentially, never in a burst.
- Dedupe strictly by `profileUrn`.
- Use the deterministic scoring and canonical record functions from `core.mjs` verbatim, adapted only for browser syntax (remove `export`).
- Ranked table: score and breakdown, name/profile link, headline, location, degree, ICP, reason, search origin, action.
- Controls: ICP chips, editable terms, region, results/search, min score, degree, text search, high-quality-only, hide requested.
- Queue connection requests one at a time. No note. Use `{ profileUrn }`; show full errors; retry explicitly.
- Cap at **80 requests/week**, Monday 00:00 UTC. Count queued + sent. Never silently exceed it.
- Persist records, terms, searches used, term performance, request history, settings, and connector binding in localStorage.
- Backup downloads one JSON file. Restore merges, never replaces. Detect storage quota failure visibly.
- Export canonical prospects as JSON with their source and full commercial stage object intact.
- Track term performance through later imports: found, high-quality, requested, accepted, replied, calls, paid. Do not optimize terms merely for volume.
- No autonomous outreach. Search and Connect are explicit human actions.

## Quality gate

Before publishing:

1. Extract the final `<script>` and run `node --check`.
2. Run offline seeded tests for scoring, recruiter penalty, dedupe, cap reset, filters, persistence round-trip, and restore merge.
3. Publish one version.
4. State exactly what was verified against the live connector and what remains schema-only.

Do not rewrite the business strategy. Build the artifact and hand Alexander the first safe search run.
