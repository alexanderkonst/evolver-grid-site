import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OutboxChannel = "linkedin" | "email" | "post";
type OutboxStatus = "draft" | "approved" | "sent" | "deleted";

interface OutboxItem {
  id: string;
  channel: OutboxChannel;
  recipient_name: string | null;
  recipient_ref: string | null;
  body: string;
  status: OutboxStatus;
  created_by: "human" | "ai";
  created_at: string;
  approved_at: string | null;
  sent_at: string | null;
  sent_result: string | null;
}

const OUTBOX_CHANNEL_ORDER: OutboxChannel[] = ["linkedin", "email", "post"];

const CHANNEL_LABEL: Record<OutboxChannel, string> = {
  linkedin: "LinkedIn",
  email: "Email",
  post: "Post",
};

/** Open drafts and approved items, grouped by channel in a fixed order, newest first inside a group. */
function groupOutboxByChannel(items: OutboxItem[]) {
  return OUTBOX_CHANNEL_ORDER.map((channel) => ({
    channel,
    items: items
      .filter((item) => item.channel === channel && (item.status === "draft" || item.status === "approved"))
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  })).filter((group) => group.items.length > 0);
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );

// cockpit_outbox is not in the generated Supabase types until the migration is
// applied and types are regenerated, so go through an untyped handle.
const outboxTable = () => (supabase as any).from("cockpit_outbox");

const COLUMNS =
  "id, channel, recipient_name, recipient_ref, body, status, created_by, created_at, approved_at, sent_at, sent_result";

/**
 * Founder Cockpit Outbox (issue #89). Every outbound item waits here as a
 * draft. Send only marks it approved; the actual sending is done outside the
 * site by Hark, which reads approved items. Nothing sends from this page.
 */
export default function OutboxSection() {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await outboxTable()
      .select(COLUMNS)
      .in("status", ["draft", "approved", "sent"])
      .order("created_at", { ascending: false })
      .limit(200);
    if (loadError) {
      setError(loadError.message);
    } else {
      setError(null);
      setItems((data ?? []) as OutboxItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => groupOutboxByChannel(items), [items]);
  const sentCount = useMemo(() => items.filter((item) => item.status === "sent").length, [items]);

  // Runs one update guarded by the item's current status. Zero rows back means
  // it changed elsewhere (e.g. Hark marked it sent), so reload instead of
  // pretending it worked.
  const mutate = async (item: OutboxItem, patch: Partial<OutboxItem>, allowedFrom: OutboxStatus[]) => {
    setBusyId(item.id);
    setError(null);
    const { data, error: updateError } = await outboxTable()
      .update(patch)
      .eq("id", item.id)
      .in("status", allowedFrom)
      .select("id");
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return false;
    }
    if (!Array.isArray(data) || data.length === 0) {
      setError("This item changed elsewhere. Reloaded.");
      await load();
      return false;
    }
    await load();
    return true;
  };

  const approve = (item: OutboxItem) =>
    mutate(item, { status: "approved", approved_at: new Date().toISOString() }, ["draft"]);

  const remove = (item: OutboxItem) => mutate(item, { status: "deleted" }, ["draft", "approved"]);

  const startEdit = (item: OutboxItem) => {
    setEditingId(item.id);
    setEditText(item.body);
  };

  const saveEdit = async (item: OutboxItem) => {
    const body = editText.trim();
    if (!body) {
      setError("Text cannot be empty.");
      return;
    }
    if (await mutate(item, { body }, ["draft"])) setEditingId(null);
  };

  return (
    <section className="mb-5 rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
          <Send className="h-4 w-4" />
          Outbox · Nothing sends itself
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-[#9ea7b3]">
            Send approves. Hark sends approved items.
            {sentCount > 0 ? ` ${sentCount} sent.` : ""}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-[#9ea7b3] transition hover:text-[#f6d58a] disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-[#f0a37a]/35 bg-[#24100d] p-3 text-sm text-[#ffc0a5]">{error}</p>
      )}

      {loading && items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-[#9ea7b3]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </p>
      ) : groups.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-[#07090d] p-4 text-sm leading-6 text-[#9ea7b3]">
          No drafts waiting. New drafts from your agents land here.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.channel}>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#93f0e8]">
                {CHANNEL_LABEL[group.channel]} · {group.items.length}
              </p>
              <ul className="space-y-3">
                {group.items.map((item) => {
                  const isDraft = item.status === "draft";
                  const isEditing = editingId === item.id;
                  const busy = busyId === item.id;
                  return (
                    <li key={item.id} className="rounded-xl border border-white/10 bg-[#07090d] p-4">
                      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-[#fff7e8]">
                          {item.recipient_name ?? (item.channel === "post" ? "Public post" : "No recipient")}
                          {item.recipient_ref && (
                            <span className="ml-2 break-all text-xs font-normal text-[#9ea7b3]">{item.recipient_ref}</span>
                          )}
                        </p>
                        <span className="text-xs text-[#9ea7b3]">
                          {item.created_by === "ai" ? "AI draft" : "Your draft"} · {formatDate(item.created_at)}
                        </span>
                      </div>

                      {isEditing ? (
                        <textarea
                          value={editText}
                          onChange={(event) => setEditText(event.target.value)}
                          rows={Math.min(14, Math.max(4, editText.split("\n").length + 1))}
                          maxLength={8000}
                          aria-label="Edit draft text"
                          className="w-full rounded-lg border border-[#d6a84d]/35 bg-[#0d1117] p-3 text-sm leading-6 text-[#f6efe3] outline-none focus:border-[#f6d58a]/70"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#e9ddca]">{item.body}</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void saveEdit(item)}
                              disabled={busy}
                              className="inline-flex h-9 items-center gap-2 rounded-full border border-[#4ecdc4]/35 bg-[#071d1d] px-4 text-sm font-medium text-[#93f0e8] transition hover:border-[#93f0e8]/70 disabled:opacity-60"
                            >
                              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              disabled={busy}
                              className="inline-flex h-9 items-center rounded-full border border-white/10 px-4 text-sm font-medium text-[#cfc4b5] transition hover:border-white/25"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {isDraft ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void approve(item)}
                                  disabled={busy}
                                  className="inline-flex h-9 items-center gap-2 rounded-full border border-[#4ecdc4]/35 bg-[#071d1d] px-4 text-sm font-medium text-[#93f0e8] transition hover:border-[#93f0e8]/70 disabled:opacity-60"
                                >
                                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                  Send
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEdit(item)}
                                  disabled={busy}
                                  className="inline-flex h-9 items-center rounded-full border border-[#d6a84d]/35 bg-[#15100a] px-4 text-sm font-medium text-[#f6d58a] transition hover:border-[#f6d58a]/70 disabled:opacity-60"
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <span className="rounded-full border border-[#4ecdc4]/30 bg-[#071d1d] px-3 py-1 text-xs text-[#93f0e8]">
                                Approved{item.approved_at ? ` · ${formatDate(item.approved_at)}` : ""} · waiting for Hark
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => void remove(item)}
                              disabled={busy}
                              className="inline-flex h-9 items-center rounded-full border border-white/10 px-4 text-sm font-medium text-[#cfc4b5] transition hover:border-[#f0a37a]/50 hover:text-[#ffc0a5] disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
