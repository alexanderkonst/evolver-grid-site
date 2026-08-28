# Commercial System — 3 LinkedIn/Gmail tools over one ledger

Editable source for the three tools built in Cowork. **You own this code** — edit it in Codex, Gemini, Claude Code, or any editor. Nothing here is locked to Claude.

- `icp-prospector/` — Tool 1: find + score ICP prospects on LinkedIn, queue human-approved connects.
- `outreach-radar/` — Tool 2: reconcile connections + conversations, score, draft in-voice, send with confirmation.
- `relationship-hub/` — Tool 3: unify LinkedIn + Gmail, triage follow-ups, auto-snooze booked meetings, draft the next move.
- `commercial-ledger/` — shared canonical envelope (`evolver-commercial-ledger` v1) all three import/export.

Each tool is ONE self-contained `artifact.html` (HTML + CSS + JS, no build step). `core.mjs` holds the pure logic (also inlined in the artifact) so it can be unit-tested. `*.test.*` are the tests.

## What is and isn't tied to Claude

- **The code is portable.** Plain HTML/JS. Open and edit anywhere.
- **The one Claude-specific piece is the runtime bridge.** The artifacts reach LinkedIn/Gmail through `window.claude.use("mcp")`, which the **claude.ai artifact viewer injects**. It exists only when the page runs as a *published claude.ai artifact opened inside claude.ai*. Opened as a plain local file or on another host, `window.claude` is absent and the tool runs in **offline mode** (import/restore a JSON backup to review data; no live connector).
- **The connectors themselves** (ConnectSafely, Gmail) are external MCP servers — not our code.

So today's fastest edit loop: change `artifact.html` → re-publish to claude.ai as an artifact → open it there. See "Publishing" below.

## Publishing (keeps the live connectors working)

Publish `artifact.html` as a claude.ai Artifact with these capabilities:

```json
// Tool 1 & 2
{"mcp":{"servers":[{"server":"ConnectSafely.AI","tools":["list-linkedin-accounts","get-connections","search-people","list-conversations","get-conversation-messages","conversation-exists","send-connection-request","conversations-send-message"]}]},"downloads":true}
// Tool 3 (adds Gmail)
{"mcp":{"servers":[{"server":"ConnectSafely.AI","tools":["list-linkedin-accounts","list-conversations","get-conversation-messages","conversations-send-message"]},{"server":"Gmail","tools":["search_threads","create_draft","list_labels"]}]},"downloads":true}
```

Rules learned the hard way:
- **The `server` name must EXACTLY match the connector's display name in claude.ai.** Here: `ConnectSafely.AI` (with a dot) and `Gmail`. A wrong name = the "This artifact uses connectors" grant shows *No matching connector found* and every call hangs. `listTools()` inside the tool prints the real granted names.
- **Tool names are the exact upstream names** (lowercase-hyphen for ConnectSafely, lowercase-underscore for Gmail).
- When publishing via Claude's Artifact tool, the file must OMIT its own `<!doctype>/<html>/<head>/<body>` (Claude wraps it). These files are written that way already. If you host them yourself, wrap them in a normal HTML document.
- Backups/exports go through the `downloads` capability (the sandbox blocks plain `<a download>`).

## Running the tests (no connectors needed)

```bash
cd outreach-radar && npm i jsdom --no-save
node core.test.mjs        # pure-logic unit tests
node dom.test.cjs         # full offline end-to-end under jsdom (stubs the connector)
```
`dom.test.cjs` stubs `window.claude.use("mcp")`, so it exercises the whole UI + connector code path offline.

## Making it fully independent of claude.ai (optional, bigger job)

Replace the `mcpCall()` layer (the `window.claude.use("mcp")` calls) with **direct API calls**:
- **ConnectSafely** has a REST API — your personal endpoint is `https://mcp.connectsafely.ai/?apiKey=…` (keep that key secret; don't commit it). Call its HTTP endpoints instead of `mcp.callTool("ConnectSafely.AI", …)`.
- **Gmail** via the Google API with your own OAuth client.

Then the tools run as normal web apps on any host, no claude.ai involved. The domain logic (`core.mjs`, scoring, triage, merge, ledger) stays exactly as-is — only the thin connector wrapper changes.

## Connector facts (as of build)

- Account: Aleksandr Konstantinov · Premium=RECRUITER · **no Sales Navigator** → LinkedIn sends pin `messagingChannel:"linkedin_inbox"`.
- `get-connections` returns 12/page; paginate by `startIndex`, stop on `endOfList:true`.
- `list-conversations` is DB-first and often empty until history syncs; follow the `linkedin:`-prefixed `nextCursor`.
- `get-conversation-messages` may omit `senderId` → direction is detected defensively (sender name vs owner name), never `isSentByOwner`.
- Gmail `create_draft` reply field is `replyToMessageId`. Owner: personalytics@gmail.com.

## Safety (kept deliberately)

Nothing sends automatically. Tool 1 "Connect" sends a **connection request only, with no note** — never a message. Every LinkedIn message and connect is human-confirmed; every email is created as a **draft** (never sent). Weekly connect cap 80 (under ConnectSafely's 90).
