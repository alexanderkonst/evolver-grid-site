# Lovable redeploy prompt — pending code changes awaiting deploy

Sasha has no direct Supabase dashboard access; all deploys go through Lovable,
where he gets two prompts a day. This file holds the standing, copy-paste-ready
redeploy request so pending fixes can be batched into a single prompt instead
of burning a slot per function.

**How to use:** copy the numbered prompt below verbatim into Lovable. After a
batch deploys, delete its entry from this file (or move it to a "done" note in
the session log) so the file only ever holds what's still pending.

---

## Pending as of 2026-07-28

1. Redeploy the edge function `suggest-asset-matches` (and its shared
   dependency `supabase/functions/_shared/matchScoring.ts`, which it imports).
   Reason: anonymized a real client's name and business details that were
   hardcoded as a calibration example in the match-rationale prompt.
2. Redeploy the edge function `proactive-match-proposal`. Reason: anonymized
   a real person's name used as a subject-line style example in the prompt.
3. Redeploy the edge function `generate-excalibur`. Reason: anonymized three
   real clients' names, one real Instagram handle, and their business/pricing
   details that were hardcoded as calibration examples in the prompt.

No schema, migration, or config changes are involved — code-only edge
function updates.
