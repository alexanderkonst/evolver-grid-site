// Cockpit Outbox operations for equilibrium-agent-write (issue #89).
//
// Kept in a sibling module with no remote imports so vitest can exercise it
// against an in-memory client (src/modules/equilibrium/__tests__/agentOutbox.test.ts).
// index.ts validates raw payloads with its shared helpers, then calls these
// with clean values. Mutators return `{ result, summary }` and honor `dryRun`
// (reads and validation happen, writes do not).
//
// The agent can draft and report back. It cannot approve: draft -> approved
// is the founder's button in the Cockpit UI, and outbox_mark_sent refuses
// anything that is not approved.

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;

export const OUTBOX_CHANNELS = ["linkedin", "email", "post"] as const;
export type OutboxChannel = (typeof OUTBOX_CHANNELS)[number];
export const OUTBOX_STATUSES = ["draft", "approved", "sent", "deleted"] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];
export const MAX_OUTBOX_READ = 100;
export const DEFAULT_OUTBOX_READ = 50;

export function cleanOutboxChannel(value: unknown): OutboxChannel {
  if (typeof value !== "string" || !(OUTBOX_CHANNELS as readonly string[]).includes(value)) {
    throw new Error(`payload.channel must be one of: ${OUTBOX_CHANNELS.join(", ")}.`);
  }
  return value as OutboxChannel;
}

export function cleanOutboxStatus(value: unknown): OutboxStatus {
  if (typeof value !== "string" || !(OUTBOX_STATUSES as readonly string[]).includes(value)) {
    throw new Error(`payload.status must be one of: ${OUTBOX_STATUSES.join(", ")}.`);
  }
  return value as OutboxStatus;
}

export function cleanOutboxLimit(value: unknown) {
  if (value === undefined || value === null) return DEFAULT_OUTBOX_READ;
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(num) || num < 1 || num > MAX_OUTBOX_READ) {
    throw new Error(`payload.limit must be an integer from 1 to ${MAX_OUTBOX_READ}.`);
  }
  return num;
}

const OUTBOX_COLUMNS =
  "id, channel, recipient_name, recipient_ref, body, status, created_by, created_at, approved_at, sent_at, sent_result";

export async function addOutboxDraft(
  admin: SupabaseAdmin,
  userId: string,
  params: {
    channel: OutboxChannel;
    recipientName?: string;
    recipientRef?: string;
    body: string;
    dryRun: boolean;
  },
) {
  const { channel, recipientName, recipientRef, body, dryRun } = params;
  // Agent-authored by definition: a human types drafts into the Cockpit UI.
  const row = {
    user_id: userId,
    channel,
    recipient_name: recipientName ?? null,
    recipient_ref: recipientRef ?? null,
    body,
    status: "draft" as const,
    created_by: "ai" as const,
  };

  let outboxId: string = "dry-run-outbox-id";
  if (!dryRun) {
    const { data: created, error } = await admin
      .from("cockpit_outbox")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(`Could not add outbox draft: ${error.message}`);
    outboxId = created.id;
  }

  const to = recipientName ? ` to ${recipientName}` : "";
  return {
    result: {
      target: "cockpit_outbox",
      outbox_id: outboxId,
      channel,
      recipient_name: row.recipient_name,
      status: "draft",
      added: !dryRun,
    },
    summary: `added ${channel} draft${to}`,
  };
}

// Newest first. With no status filter, deleted rows are left out. Sender flow:
// outbox_list { status: "approved" } -> send -> outbox_mark_sent.
export async function listOutbox(
  admin: SupabaseAdmin,
  userId: string,
  params: { status?: OutboxStatus; channel?: OutboxChannel; limit?: number } = {},
) {
  let query = admin
    .from("cockpit_outbox")
    .select(OUTBOX_COLUMNS)
    .eq("user_id", userId);
  query = params.status ? query.eq("status", params.status) : query.neq("status", "deleted");
  if (params.channel) query = query.eq("channel", params.channel);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(params.limit ?? DEFAULT_OUTBOX_READ);
  if (error) throw new Error(`Could not read outbox: ${error.message}`);

  return (Array.isArray(data) ? data : []).map((row: any) => ({
    id: row.id,
    channel: row.channel,
    recipient_name: row.recipient_name ?? null,
    recipient_ref: row.recipient_ref ?? null,
    body: row.body,
    status: row.status,
    created_by: row.created_by,
    created_at: row.created_at,
    approved_at: row.approved_at ?? null,
    sent_at: row.sent_at ?? null,
    sent_result: row.sent_result ?? null,
  }));
}

export async function markOutboxSent(
  admin: SupabaseAdmin,
  userId: string,
  params: { outboxId: string; sentResult?: string; dryRun: boolean },
) {
  const { outboxId, sentResult, dryRun } = params;
  const { data: item, error: readError } = await admin
    .from("cockpit_outbox")
    .select("id, channel, recipient_name, status")
    .eq("id", outboxId)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw new Error(`Could not read outbox item: ${readError.message}`);
  if (!item) throw new Error("Outbox item not found for this user.");
  if (item.status !== "approved") {
    throw new Error(`Cannot mark a ${item.status} item as sent: only approved items can be sent.`);
  }

  const sentAt = new Date().toISOString();
  if (!dryRun) {
    // The status filter makes this a compare-and-set: if the founder deleted
    // the item between the read and the write, nothing is updated.
    const { data: updated, error: updateError } = await admin
      .from("cockpit_outbox")
      .update({ status: "sent", sent_at: sentAt, sent_result: sentResult ?? null })
      .eq("id", outboxId)
      .eq("user_id", userId)
      .eq("status", "approved")
      .select("id");
    if (updateError) throw new Error(`Could not mark outbox item as sent: ${updateError.message}`);
    if (!Array.isArray(updated) || updated.length === 0) {
      throw new Error("Cannot mark as sent: the item is no longer approved.");
    }
  }

  return {
    result: {
      target: "cockpit_outbox",
      outbox_id: outboxId,
      channel: item.channel,
      status: "sent",
      sent_at: sentAt,
      sent_result: sentResult ?? null,
      sent: !dryRun,
    },
    summary: `marked ${item.channel} item ${outboxId} as sent`,
  };
}
