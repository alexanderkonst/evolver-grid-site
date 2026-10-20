# Founder Cockpit — Outbox

> *© 2026 Alexander Konstantinov · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)*
>
> Status: **built, migration not yet deployed** (issue #89, 2026-10-20). Borrowed mechanic: Polsia, "every outbound item is a draft with a human-press button."
> Companions: [`../05-specs/founder_cockpit_equilibrium_writeback_sow.md`](../05-specs/founder_cockpit_equilibrium_writeback_sow.md) (the `equilibrium-agent-write` contract this extends).

## What it is

An Outbox section in the Founder Cockpit (`/build/cockpit`, founder only). Every outbound item (a LinkedIn message, an email, a public post) waits there as a draft. Nothing sends itself. The site never sends anything and holds no third-party API keys.

## Flow

```
agent -> outbox_add_draft -> draft
Sasha reads it in the Cockpit: Edit / Delete / Send
Send -> status = approved          (a human press, in the UI)
Hark -> outbox_list {status: approved} -> sends it outside the site
Hark -> outbox_mark_sent -> status = sent
```

Status values: `draft`, `approved`, `sent`, `deleted`. Delete is soft (status `deleted`), so the record stays.

## UI

- Drafts and approved items, grouped by channel (LinkedIn, Email, Post), newest first.
- Each card shows recipient name, recipient reference, who wrote it (AI or you) and the full text.
- Draft card: **Send** (sets `approved`), **Edit** (inline, drafts only), **Delete**.
- Approved card: shows "Approved · waiting for Hark" and **Delete**. Edit is off once approved, so the text Hark reads cannot change under it.
- Sent items are not listed; the header shows a count.
- A button press that finds the item changed elsewhere (for example Hark marked it sent) reloads the list instead of failing quietly.

Code: `src/components/cockpit/OutboxSection.tsx`, mounted in `src/pages/CockpitDashboard.tsx` behind the founder check.

## Data

Migration: `supabase/migrations/20261020000000_cockpit_outbox.sql`. Apply it separately from the code deploy; the UI shows a load error and the new function ops fail until it is applied.

`cockpit_outbox`: `id`, `user_id` (needed for owner RLS), `channel` (`linkedin|email|post`), `recipient_name`, `recipient_ref`, `body` (1–8000 chars), `status`, `created_by` (`human|ai`), `created_at`, `approved_at`, `sent_at`, `sent_result`.

RLS: select, insert, update and delete are limited to `user_id = auth.uid()`. The edge function writes with the service role, scoped to `EQUILIBRIUM_AGENT_WRITE_USER_ID`.

## Agent operations

Added to `equilibrium-agent-write` (`supabase/functions/equilibrium-agent-write/outbox.ts`). Same token gate (`x-agent-token`), same operation allowlist, same `dry_run` and `idempotency_key` as the other write operations.

| Operation | Payload | Effect |
|---|---|---|
| `outbox_add_draft` | `channel`, `body`, optional `recipient_name`, `recipient_ref` | Inserts a `draft` with `created_by = ai`. It cannot create an approved item. |
| `outbox_list` | optional `status`, `channel`, `limit` (1–100, default 50) | Read-only, newest first. Without `status`, deleted items are left out. Hark fetches work with `{"status": "approved"}`. |
| `outbox_mark_sent` | `outbox_id`, optional `sent_result` | `approved` → `sent`, stamps `sent_at`. Refuses draft, deleted and already-sent items. |

Example, Hark picking up approved items:

```bash
curl -s "$SUPABASE_URL/functions/v1/equilibrium-agent-write" \
  -H "x-agent-token: $EQUILIBRIUM_AGENT_WRITE_TOKEN" -H "content-type: application/json" \
  -d '{"operation":"outbox_list","payload":{"status":"approved"}}'
```

## Out of scope

- Sending from the site, and any third-party API key in the frontend.
- Creating a draft by hand in the UI. The `human` value of `created_by` is in the schema for that later step.
- Showing sent history in the UI. Use `outbox_list {"status": "sent"}`.

## Tests

`src/modules/equilibrium/__tests__/agentOutbox.test.ts`: draft-only creation, list filters and ordering, approved-only mark-sent, ownership, `dry_run`, payload validation.
