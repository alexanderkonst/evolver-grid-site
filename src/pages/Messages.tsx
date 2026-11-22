/**
 * Messages — the player's inbox and 1:1 threads (spec A6, issue #356).
 *
 *   /game/collaborate/messages           → inbox: threads, newest first, unread count
 *   /game/collaborate/messages/:userId   → one thread: read, reply
 *
 * Lives inside the Collaborate space (Party & Guild), so the shell's pane 2 carries the
 * "Messages" row with the unread badge. Data layer: src/lib/playerMessages.ts. Privacy is
 * enforced by RLS in supabase/migrations/20261121190000_player_messages.sql.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MessageCircle } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatTime } from "@/i18n/format";
import { splitCircleLinks, stripCircleLinks } from "@/lib/circles";
import {
  buildThreads,
  fetchMyMessages,
  INBOX_PATH,
  isMissingTableError,
  markThreadRead,
  MESSAGE_MAX_LENGTH,
  otherParty,
  sendMessage,
  threadPath,
  type PlayerMessage,
} from "@/lib/playerMessages";

interface PersonSummary {
  name: string;
  avatarUrl: string | null;
}

const cardClass =
  "rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm shadow-[0_4px_16px_rgba(44,49,80,0.06)]";

const Avatar = ({ person }: { person: PersonSummary }) => (
  <div className="w-10 h-10 shrink-0 rounded-full bg-muted overflow-hidden flex items-center justify-center">
    {person.avatarUrl ? (
      <img src={person.avatarUrl} alt={person.name} loading="lazy" className="w-full h-full object-cover" />
    ) : (
      <span className="text-xs font-semibold text-muted-foreground">
        {person.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
      </span>
    )}
  </div>
);

const Messages = () => {
  const { userId: threadUserId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const me = useSessionUserId();

  const [messages, setMessages] = useState<PlayerMessage[]>([]);
  const [people, setPeople] = useState<Record<string, PersonSummary>>({});
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fallbackName = t("messages.fallbackName");

  const loadPeople = useCallback(
    async (ids: string[]) => {
      const missing = ids.filter(Boolean);
      if (missing.length === 0) return;
      const { data } = await supabase
        .from("game_profiles")
        .select("user_id, first_name, last_name, avatar_url")
        .in("user_id", missing);
      setPeople((prev) => {
        const next = { ...prev };
        (data || []).forEach((row) => {
          if (!row.user_id) return;
          const name = `${row.first_name || ""} ${row.last_name || ""}`.trim();
          next[row.user_id] = { name: name || fallbackName, avatarUrl: row.avatar_url };
        });
        return next;
      });
    },
    [fallbackName],
  );

  const load = useCallback(
    async (viewerId: string) => {
      try {
        const rows = await fetchMyMessages();
        setMessages(rows);
        setUnavailable(false);
        const ids = new Set(rows.map((m) => otherParty(m, viewerId)));
        if (threadUserId) ids.add(threadUserId);
        await loadPeople(Array.from(ids));
      } catch (err) {
        if (isMissingTableError(err)) setUnavailable(true);
        else console.warn("[Messages] load failed", err);
      } finally {
        setLoading(false);
      }
    },
    [loadPeople, threadUserId],
  );

  useEffect(() => {
    if (!me) return;
    setLoading(true);
    void load(me);
  }, [me, load]);

  const threads = useMemo(() => (me ? buildThreads(messages, me) : []), [messages, me]);
  const totalUnread = useMemo(() => threads.reduce((sum, th) => sum + th.unread, 0), [threads]);

  const threadMessages = useMemo(() => {
    if (!me || !threadUserId) return [];
    return messages
      .filter((m) => otherParty(m, me) === threadUserId)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  }, [messages, me, threadUserId]);

  const unreadInThread = threadMessages.filter((m) => m.recipient_id === me && !m.read_at).length;

  // Opening a thread marks its incoming messages read.
  useEffect(() => {
    if (!me || !threadUserId || unreadInThread === 0) return;
    const now = new Date().toISOString();
    void markThreadRead(me, threadUserId).then(() =>
      setMessages((prev) =>
        prev.map((m) => (m.sender_id === threadUserId && m.recipient_id === me && !m.read_at ? { ...m, read_at: now } : m)),
      ),
    );
  }, [me, threadUserId, unreadInThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: "end" });
  }, [threadMessages.length]);

  const handleSend = async () => {
    if (!me || !threadUserId || sending || !draft.trim()) return;
    setSending(true);
    try {
      const sent = await sendMessage(me, threadUserId, draft);
      setMessages((prev) => [sent, ...prev]);
      setDraft("");
    } catch (err) {
      toast({
        title: isMissingTableError(err) ? t("messages.unavailable") : t("messages.sendFailed"),
        description: isMissingTableError(err) ? undefined : t("messages.cannotWrite"),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const personFor = (id: string): PersonSummary => people[id] || { name: fallbackName, avatarUrl: null };

  if (me === undefined || loading) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} className="h-20" />
          ))}
        </div>
      </GameShellV2>
    );
  }

  if (!me) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-3">{t("messages.signInTitle")}</h1>
          <Button onClick={() => navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`)}>
            {t("messages.signIn")}
          </Button>
        </div>
      </GameShellV2>
    );
  }

  // ─── One thread ───────────────────────────────────────────────
  if (threadUserId) {
    const other = personFor(threadUserId);
    return (
      <GameShellV2>
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(INBOX_PATH)} aria-label={t("messages.backToInbox")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar person={other} />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{other.name}</h1>
              <Link to={`/profile/${threadUserId}`} className="text-xs text-muted-foreground underline">
                {t("messages.viewProfile")}
              </Link>
            </div>
          </div>

          {unavailable && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {t("messages.unavailable")}
            </div>
          )}

          <div className={`${cardClass} p-4 space-y-3 min-h-[200px]`} aria-live="polite">
            {threadMessages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("messages.threadEmpty", { name: other.name })}
              </p>
            )}
            {threadMessages.map((m) => {
              const mine = m.sender_id === me;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                      mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {splitCircleLinks(m.body).map((part, i) =>
                      part.to ? (
                        <Link key={i} to={part.to} className="underline font-medium">
                          {part.text}
                        </Link>
                      ) : (
                        <span key={i}>{part.text}</span>
                      ),
                    )}
                    <div className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatDate(m.created_at, { dateStyle: "medium" })} · {formatTime(m.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="flex flex-col gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={t("messages.placeholder")}
              rows={3}
              aria-label={t("messages.placeholder")}
            />
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={sending || !draft.trim() || unavailable}>
                {t("messages.send")}
              </Button>
            </div>
          </div>
        </div>
      </GameShellV2>
    );
  }

  // ─── Inbox ────────────────────────────────────────────────────
  return (
    <GameShellV2>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3 text-foreground">
          <MessageCircle className="w-6 h-6" />
          <h1 className="text-2xl font-semibold">{t("messages.title")}</h1>
          {totalUnread > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {t("messages.unreadCount", { count: totalUnread })}
            </span>
          )}
        </div>

        {unavailable && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {t("messages.unavailable")}
          </div>
        )}

        {threads.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="w-6 h-6" />}
            title={t("messages.emptyTitle")}
            description={t("messages.emptyBody")}
            action={{ label: t("messages.findPeople"), onClick: () => navigate("/game/collaborate/people") }}
          />
        ) : (
          <ul className="space-y-3">
            {threads.map((thread) => {
              const person = personFor(thread.otherUserId);
              const mine = thread.last.sender_id === me;
              return (
                <li key={thread.otherUserId}>
                  <button
                    type="button"
                    onClick={() => navigate(threadPath(thread.otherUserId))}
                    className={`${cardClass} w-full text-left p-4 flex items-center gap-3 transition hover:border-primary/40 hover:shadow-md`}
                  >
                    <Avatar person={person} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-foreground ${thread.unread > 0 ? "font-bold" : "font-semibold"}`}>
                          {person.name}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatDate(thread.last.created_at)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {mine ? t("messages.you") : ""}
                        {stripCircleLinks(thread.last.body)}
                      </p>
                    </div>
                    {thread.unread > 0 && (
                      <span
                        className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground"
                        aria-label={t("messages.unreadCount", { count: thread.unread })}
                      >
                        {thread.unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </GameShellV2>
  );
};

export default Messages;
