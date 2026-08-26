# Bind and publish Relationship Hub in Claude Cowork

Publish the attached artifact.html as Relationship Hub for Alexander Konstantinov.

## Clarify only these identity facts

Ask Alexander for his exact Gmail owner address and team/internal email addresses to exclude as contacts.

## Probe before binding

Probe each once and report exact tool names and response shapes:

- Gmail: search_threads, create_draft
- Connect Safely: list-linkedin-accounts, list-conversations, get-conversation-messages

Tool 3 intentionally uses both connectors. If the artifact bridge fails with both tool sets, diagnose before changing architecture. A safe fallback is explicit JSON sync through chat, not silent connector loss.

## Data laws

- Import Tool 2 records; do not create a competing LinkedIn database.
- Gmail: paginate in:sent newer_than:120d, up to ten pages of 50. Build from search results; do not call get_thread per thread.
- Create one contact for every external sender/to/cc participant. Exclude owner, team, no-reply, notifications and bulk-mail patterns.
- LinkedIn message fetches: at most 160 recent threads, strictly serial with a randomized 0.9–1.5 second gap.
- Direction uses sender ID against owner ID, never isSentByOwner.
- Merge with a stable normalized-name key for 2+ word names, otherwise source key. Adopt saved state from any source key.
- Cache data and render immediately. Full resync streams email first, then LinkedIn. Recent sync merges changed rows.
- Deterministic booking detection precedes AI. Auto-snooze booked meetings 14 days unless a longer manual snooze or Close exists.
- AI is only for ambiguous triage, summary, timing and drafts. It never changes canonical funnel facts.
- LinkedIn sends only after confirmation. Gmail creates a reply draft and must never claim the email was sent.
- Backup and restore merge. Surface localStorage quota failures.

## Commercial alignment

Every card preserves source, reply, call, offer, payment, delivery and expansion. Nurture means a dated next relationship move toward one of those states, or an explicit respectful rest.

## Verification

Run core tests and syntax-check the artifact. Test offline import, cross-channel merge, booking auto-snooze, follow-up ordering, persistence, and backup merge. Do not send anything.
