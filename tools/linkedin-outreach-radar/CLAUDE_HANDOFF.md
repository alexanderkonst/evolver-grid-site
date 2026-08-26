# Bind and publish Outreach Radar in Claude Cowork

Build/publish the attached `artifact.html` as a persistent artifact named **Outreach Radar** for Alexander Konstantinov.

## Probe before binding

Call each once and show the normalized response shape:

1. `list-linkedin-accounts`
2. `get-connections` with the smallest page
3. `list-conversations` with count 5
4. `get-conversation-messages` for one conversation
5. `conversation-exists` for Alexander's own/test-safe profile slug if supported
6. `get-account-premium-status`

Report exact fully-qualified tool names. Bind **only Connect Safely**. Do not bind Gmail or another MCP server.

## Non-negotiable data rules

- Import and preserve Tool 1's canonical records.
- One unified people list keyed by `profileUrn`; conversation participants are adopted even if absent from connections.
- Extract owner profile ID from a conversation URN. Determine direction from `senderId`; ignore `isSentByOwner` and list-level sender fields.
- Before opening any cold draft, run `conversation-exists`. If it finds a missing thread, adopt it and fetch messages. Never remove the person as the consequence of discovering a conversation.
- Crawl connections via `startIndex` and cache every page. Load conversations through all available cursors, dedupe by conversation URN, then fetch messages serially.
- No profile photos.
- Explicitly use `linkedin_inbox` for non-premium accounts. Sending fallback order: conversation URN → profile URN → profile slug; surface every full error.
- Confirm every send. Never test-send. Alexander sends the first real message.
- LocalStorage writes must surface quota failures. Backup downloads JSON; restore merges.

## Copy behavior

Templates must be editable local data, not code. Maintain per-ICP templates with `{first}`, `{name}`, `{company}`, and `[[company: ...]]`. Before finalizing default copy, read Alexander's last month of sent LinkedIn messages and propose the voice pattern for his approval. One CTA: Direction Call. No autonomous messaging.

## Verification

Run the attached core tests, syntax-check the final script, and test import → reconcile → tab filters → draft save → backup/restore offline. State which paths were live-verified and which remain schema-only.
