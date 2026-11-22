/**
 * Who came (S5): /game/meet/:id/came.
 *
 * "Only people who came count. This is what the village sees." The host (or co-host) taps
 * a face to mark Came, taps again to undo; the host is marked by default; people who came
 * without joining can be added by name. Confirm saves, and each newly marked person gets
 * one inbox note ("{Host} confirmed you came to {circle}. Leave one line?").
 * Editable from the start time until 7 days after; then fixed.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Face, PersonFace, cardClass } from "@/components/circles/CircleBits";
import { CAME } from "@/data/circlesCopy";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { useToast } from "@/hooks/use-toast";
import { canMarkCame, canRun, hostOf, startInstant } from "@/lib/circles";
import {
  circleErrorMessage,
  confirmCame,
  fetchCircle,
  fetchPeople,
  myFirstName,
  searchVillagers,
  type Circle,
  type CirclePerson,
} from "@/lib/circlesApi";

interface Added {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

const MarkCame = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = useSessionUserId();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [people, setPeople] = useState<CirclePerson[]>([]);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<Added[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Added[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id || !userId) return;
    try {
      const c = await fetchCircle(id);
      if (!c) {
        setError("This circle is not here.");
        return;
      }
      if (!canRun(c, userId)) {
        setError("Only the host and co-host can mark who came.");
        return;
      }
      const p = await fetchPeople(id);
      setCircle(c);
      setPeople(p);
      const already = p.filter((x) => x.came).map((x) => x.userId);
      // The host is marked by default, until anyone has been confirmed.
      const host = hostOf(c);
      setMarked(new Set(already.length === 0 && host ? [host] : already));
      setError(null);
    } catch (err) {
      setError(circleErrorMessage(err, "Failed to load this circle."));
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      navigate("/auth");
      return;
    }
    load();
  }, [userId, load, navigate]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => setResults(await searchVillagers(query)), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Everyone who was going, the host and co-host, and the people who came without joining.
  const list = useMemo(() => {
    const known = new Set(people.map((p) => p.userId));
    const extra: CirclePerson[] = added
      .filter((a) => !known.has(a.userId))
      .map((a) => ({ userId: a.userId, role: "guest", status: "going", came: false, name: a.name, avatarUrl: a.avatarUrl, faceVisible: true }));
    return [...people.filter((p) => p.role !== "guest" || p.status === "going" || p.came), ...extra];
  }, [people, added]);

  const toggle = (uid: string) =>
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });

  const confirm = async () => {
    if (!circle || !userId) return;
    setSaving(true);
    try {
      const guestIds = people.filter((p) => p.role === "guest" && (p.status === "going" || p.came)).map((p) => p.userId);
      await confirmCame(
        circle,
        Array.from(marked),
        guestIds,
        people.filter((p) => p.came).map((p) => p.userId),
        await myFirstName(userId),
      );
      navigate(`/game/meet/${circle.id}`);
    } catch (err) {
      toast({ title: circleErrorMessage(err), variant: "destructive" });
      setSaving(false);
    }
  };

  if (loading || userId === undefined) {
    return (
      <GameShellV2>
        <div className="min-h-[50vh] flex items-center justify-center">
          <PremiumLoader size="lg" />
        </div>
      </GameShellV2>
    );
  }

  if (error || !circle) {
    return (
      <GameShellV2>
        <div className="p-8 text-center space-y-3">
          <p className="text-muted-foreground">{error || "This circle is not here."}</p>
          <Button variant="outline" onClick={() => navigate("/game/meet")}>
            Back to the Café
          </Button>
        </div>
      </GameShellV2>
    );
  }

  const open = canMarkCame(circle);
  const tooEarly = Date.now() < startInstant(circle);

  return (
    <GameShellV2>
      <div className="p-6 pb-[calc(var(--chat-clearance)+1.5rem)] lg:p-8 max-w-2xl mx-auto space-y-5">
        <Link to={`/game/meet/${circle.id}/manage`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {circle.title}
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{CAME.headline}</h1>
          <p className="text-muted-foreground mt-1">{CAME.sub}</p>
        </div>

        {!open && <p className="text-sm text-muted-foreground">{tooEarly ? "Opens when the circle starts." : CAME.fixed}</p>}

        <ul className="grid gap-2 sm:grid-cols-2">
          {list.map((p) => {
            const on = marked.has(p.userId);
            return (
              <li key={p.userId}>
                <button
                  type="button"
                  disabled={!open || saving}
                  aria-pressed={on}
                  onClick={() => toggle(p.userId)}
                  className={`${cardClass} w-full p-3 flex items-center gap-3 text-left transition-colors disabled:opacity-60 ${
                    on ? "border-foreground" : ""
                  }`}
                >
                  <PersonFace person={p} />
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-foreground">{p.name}</span>
                  {on && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Check className="w-4 h-4" aria-hidden /> Came
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {open && (
          <div className={`${cardClass} p-5 space-y-3`}>
            <h2 className="font-semibold text-foreground">{CAME.addSomeone}</h2>
            <Input placeholder={CAME.searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={CAME.addSomeone} />
            <ul className="space-y-1">
              {results
                .filter((r) => !list.some((p) => p.userId === r.userId))
                .map((r) => (
                  <li key={r.userId}>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm hover:underline"
                      onClick={() => {
                        setAdded((prev) => [...prev, r]);
                        setMarked((prev) => new Set(prev).add(r.userId));
                        setQuery("");
                      }}
                    >
                      <Face userId={r.userId} name={r.name} avatarUrl={r.avatarUrl} linked={false} size="sm" />
                      {r.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <Button disabled={!open || saving} onClick={confirm} className="w-full">
          {CAME.confirm}
        </Button>
      </div>
    </GameShellV2>
  );
};

export default MarkCame;
