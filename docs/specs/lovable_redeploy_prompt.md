# Lovable redeploy prompt — pending code changes awaiting deploy

Sasha has no direct Supabase dashboard access; all deploys go through Lovable,
where he gets two prompts a day. This file holds the standing, copy-paste-ready
redeploy request so pending fixes can be batched into a single prompt instead
of burning a slot per function.

**How to use:** copy the numbered prompt below verbatim into Lovable. After a
batch deploys, delete its entry from this file (or move it to a "done" note in
the session log) so the file only ever holds what's still pending.

---

## Pending

_None._

## Done

- 2026-07-28 — redeployed `suggest-asset-matches` (with shared
  `_shared/matchScoring.ts`), `proactive-match-proposal`, and
  `generate-excalibur` after anonymizing real client names, an Instagram
  handle, and business/pricing details hardcoded as prompt calibration
  examples. Code-only; no schema/migration/config changes.

