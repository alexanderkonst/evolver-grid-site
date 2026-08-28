# CODEX / CLAUDE-CODE BRIEF — Merge the 3 tools into ONE portable outreach app

Owner: Sasha (single-user for now). Builders: any coding AI (Codex, Claude Code, Gemini). Eventual home: the **"Built by You" space of Find Your Top Talent** — a self-contained static web app Sasha drops in; other people can plug their own connector keys later (do NOT build the multi-user version now).

## RULE #0 — REUSE THE CODE WE ALREADY HAVE
The three working `artifact.html` files (`icp-prospector/`, `outreach-radar/`, `relationship-hub/`) are the **source of truth for all logic and UI**. Port them; do not rewrite from scratch. `core.mjs` in each folder holds the pure logic already unit-tested. The merge is mostly *reorganizing working code into one app + swapping the connector layer*, not new invention.

## Mission
1. **One app, three tabs** — Find (prospect+connect) · Connections (message) · Relationships (nurture) — over **one shared in-memory/localStorage store**. Delete all export/import/backup handoffs *between* tools; it's one dataset now (keep ONE backup/restore for the whole app).
2. **Portable, tool-agnostic runtime** — connectors isolated in ONE module (`connectors.js`) behind a small interface, so the app doesn't care which AI built it or where it's hosted. Static web app; no server required except an optional proxy (below).
3. **Iteration = data, not code** — ICPs, scoring weights, and templates live in an editable `config.json` (+ in-app editor), so Sasha retargets and rewrites copy WITHOUT code edits.
4. Preserve every safety invariant below.

## Channels — the HYBRID (important: do NOT set up Google Cloud OAuth)
- **LinkedIn = ConnectSafely REST.** The MCP tools are a 1:1 wrapper over ConnectSafely's HTTP API. Get exact routes from ConnectSafely's API docs (https://connectsafely.ai — API/MCP section; tools map to routes like `/search/people`, `/linkedin/accounts`, `/connections`, `/messaging/*`). Auth = the personal key already in `https://mcp.connectsafely.ai/?apiKey=<KEY>` (KEEP SECRET — load from localStorage/env, never commit). **CORS:** a browser calling ConnectSafely directly may be blocked → deploy a ~20-line proxy (Cloudflare Worker / tiny serverless) that forwards + adds CORS headers, and point the app at it. This is the only infra piece.
- **Gmail = OPTIONAL / deferred.** Sasha does NOT want the Google Cloud Console OAuth setup. So: **v1 ships LinkedIn-only.** Put Gmail behind the same `connectors.js` interface with a feature flag OFF. Wire it later via whichever is easiest at that time — a hosted connector service that owns the OAuth for you (e.g. Composio / Pipedream / Nango-style: you get a URL+key like ConnectSafely, no console work), OR the claude.ai Gmail connector if the app is ever run as a claude.ai artifact. **Never require the user to build OAuth from the console.** The Relationship Hub already degrades gracefully when email is empty — keep that.

`connectors.js` interface (async): `listAccounts, searchPeople, getConnections, listConversations, getConversationMessages, conversationExists, sendConnectionRequest, sendMessage` (LinkedIn) + optional `searchThreads, createDraft` (Gmail, flagged off in v1). Default impl = ConnectSafely REST. Keep the tiny `mcp` impl too (`window.claude.use('mcp')`) so it *can* still run as a claude.ai artifact — but REST is the default.

## HARD-WON GOTCHAS — do NOT rediscover these
- `get-connections`: **max 12/page**; paginate by `startIndex`; **stop on `endOfList:true`** (NOT on empty array); retry on `CONNECTIONS_UNAVAILABLE`/502.
- `list-conversations`: DB-first, often **empty** until history syncs; follow `linkedin:`-prefixed `nextCursor`; dedupe by `conversationUrn`; stop when a page adds nothing.
- `get-conversation-messages`: **often NO `senderId`** (only `senderName`). Direction MUST be defensive: `senderId===ownerId` if present, else `senderName===ownerName`; **NEVER `isSentByOwner`** (it lies). Owner profile id = first `fsd_profile` in a conversation URN tuple.
- Join LinkedIn on `profileUrn` (== `participantUrn`), **never on names**. Cross-channel merge key: 2+word name → `nm:<norm>`, else `em:<email>` / `li:<urn>`; adopt saved state across all of a person's source keys.
- Commercial stage **monotonic** (never downgrade on re-import); **first-touch source preserved**.
- **No profile photos** (LinkedIn CDN hotlink-protected + blows storage quota) → initials.
- Premium=RECRUITER, **no Sales Navigator** → sends pin `messagingChannel:"linkedin_inbox"`; send fallback order `conversationUrn` → `recipientProfileUrn` → `recipientProfileId`, each `linkedin_inbox` then `auto`; surface every attempt's full error.
- Deterministic **booking regex BEFORE any AI**; auto-snooze booked meetings 14d unless a fresh question was asked after booking; never override a longer manual snooze/Close.
- DOM: `document.getElementById('d-'+encodeURIComponent(key))` — a CSS `querySelector` on an encoded key (`%`/`:`) throws "invalid selector". (Bit twice.)
- localStorage: **surface quota failures** (red warning + prompt backup); never `catch(e){}` around `setItem`.
- Wrap every network call in a timeout + one retry; never `await` a bare connector promise (can hang forever).
- (mcp mode only) connector display names must be EXACT: `ConnectSafely.AI`, `Gmail` — wrong name → "No matching connector found" → calls hang.

## SAFETY INVARIANTS (must keep)
- **Nothing auto-sends.** Human confirmation before every connect and every message. Email = **draft only**, never send.
- **Connect = connection request with NO note** (never a message). Messages only after connection/existing thread.
- Caps: **80/week AND ~20/day** (LinkedIn safe zone); count queued+sent; block before overshoot. ConnectSafely also paces server-side.

## Editable config (`config.json`, hot-editable + in-app editor)
Seed values by copying the current 5 ICPs, `score()` weights, and `TPL_DEFAULTS` templates out of `outreach-radar/artifact.html`.
```json
{
  "icps": [{"id":"post_exit_founders","name":"Post-exit founders","strong":["former founder","ex-founder","post-exit","sabbatical","career break","next chapter"],"weak":["founder","entrepreneur","advisor"],"terms":["former founder sabbatical","ex-founder career break"]}],
  "scoreWeights": {"strongKeyword":40,"weakKeyword":20,"decisionMaker":30,"partnerships":28,"seniorLeader":18,"reach2nd":15,"reach1st":8,"transition":10,"topMarket":5,"penalty":-15},
  "templates": {"post_exit_founders":"Hi {first}, ... — Sasha"},
  "caps": {"perWeek":80,"perDay":20}
}
```

## Tests
Reuse each folder's `core.mjs` + `*.test.mjs` and the `dom.test.cjs` jsdom pattern (stubs the connector). Add tests for the REST connector against recorded fixtures.

## Build order
1. Scaffold one app + shared store; port `commercial-ledger/core.mjs` as the canonical model.
2. `connectors.js` REST impl (LinkedIn); add proxy only if CORS blocks; verify with read-only calls.
3. Port Find → Connections → Relationships as tabs over the shared store (reuse the artifact logic).
4. ICPs/weights/templates → `config.json` + editor.
5. Weekly+daily caps, confirmations, one app-wide backup/restore.
6. Gmail stays flagged OFF (wire later, no console OAuth).
7. Then layer the reply-learning loop (see CODEX_BRIEF_reply_learning.md).

## Reference
Working implementations: `../icp-prospector/artifact.html`, `../outreach-radar/artifact.html`, `../relationship-hub/artifact.html`. Canonical ledger + round-trip proof: `../commercial-ledger/`. Positioning/voice: `docs/02-strategy/positioning.md`, `docs/02-strategy/fmf_icp_deepened.md` (lead with the transition/next-chapter moment; one soft CTA = free 45-min Direction Call; keep cold messages light — no private-pain language at first contact).
