/**
 * Manage a circle (S4): /game/meet/:id/manage. One page, sections, no tabs.
 *
 * Host and co-host see it. The co-host can do everything the host can except hand off and
 * cancel (enforced in the database too). Copy: src/data/circlesCopy.ts.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KindChip, PersonFace, PersonName, cardClass, copyCircleLink } from "@/components/circles/CircleBits";
import { MANAGE } from "@/data/circlesCopy";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { useToast } from "@/hooks/use-toast";
import {
  canMarkCame,
  canRun,
  dateRailLabel,
  formatTimeRange,
  hasEnded,
  isHost,
  kindOf,
  longDateLabel,
  parseDateString,
  shouldAskKeepGoing,
  toDateString,
  upcomingOfSeries,
} from "@/lib/circles";
import {
  answerAsk,
  cancelCircle,
  circleErrorMessage,
  copyToNewDate,
  extendSeries,
  fetchCameCounts,
  fetchCircle,
  fetchNotices,
  fetchPeople,
  fetchPendingHandoff,
  fetchSeries,
  myFirstName,
  offerHandoff,
  searchVillagers,
  setCohost,
  withdrawHandoff,
  writeToGoing,
  type Circle,
  type CirclePerson,
  type Handoff,
  type Notice,
} from "@/lib/circlesApi";

type Chip = "going" | "asked" | "came";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className={`${cardClass} p-5 space-y-3`}>
    <h2 className="font-semibold text-foreground">{title}</h2>
    {children}
  </section>
);

const noticeWhat = (kind: string) =>
  kind === "reminder_day" ? "Reminder · 1 day before" : kind === "reminder_hour" ? "Reminder · 1 hour before" : kind === "monday_step" ? "Monday step" : "Message";

const ManageCircle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = useSessionUserId();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [people, setPeople] = useState<CirclePerson[]>([]);
  const [series, setSeries] = useState<Circle[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [keepGoing, setKeepGoing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [chip, setChip] = useState<Chip>("going");
  const [tellThem, setTellThem] = useState(true);
  const [message, setMessage] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [handOffTo, setHandOffTo] = useState<CirclePerson | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cohostQuery, setCohostQuery] = useState("");
  const [cohostResults, setCohostResults] = useState<Array<{ userId: string; name: string }>>([]);
  const [pickCohost, setPickCohost] = useState(false);

  const load = useCallback(async () => {
    if (!id || !userId) return;
    try {
      const c = await fetchCircle(id);
      if (!c) {
        setError("This circle is not here.");
        return;
      }
      if (!canRun(c, userId)) {
        setError("Only the host and co-host can manage this circle.");
        return;
      }
      setCircle(c);
      const [p, s, n, h] = await Promise.all([
        fetchPeople(id),
        c.series_id ? fetchSeries(c.series_id) : Promise.resolve([] as Circle[]),
        fetchNotices(id),
        fetchPendingHandoff(id),
      ]);
      setPeople(p);
      setSeries(s);
      setNotices(n);
      setHandoff(h);
      setNextDate((prev) => prev || toDateString(new Date(parseDateString(c.event_date).getTime() + 7 * 86400000)));
      // Quality: nobody marked came across the last 3 ended meetings
      if (c.series_id && isHost(c, userId)) {
        const ended = s.filter((m) => !m.cancelled_at && hasEnded(m)).slice(-3);
        const counts = await fetchCameCounts(ended.map((m) => ({ id: m.id, host: m.host_id ?? m.created_by })));
        setKeepGoing(shouldAskKeepGoing(counts) && upcomingOfSeries(s).length === 0);
      }
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
    if (cohostQuery.trim().length < 2) {
      setCohostResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const found = await searchVillagers(cohostQuery);
      setCohostResults(found.map((f) => ({ userId: f.userId, name: f.name })));
    }, 250);
    return () => clearTimeout(timer);
  }, [cohostQuery]);

  const host = people.find((p) => p.role === "host") || null;
  const cohost = people.find((p) => p.role === "cohost") || null;
  const guests = useMemo(() => people.filter((p) => p.role === "guest"), [people]);
  const going = guests.filter((p) => p.status === "going");
  const asked = guests.filter((p) => p.status === "asked");
  const came = people.filter((p) => p.came);
  const shown = chip === "going" ? going : chip === "asked" ? asked : came;
  const hostRuns = !!circle && isHost(circle, userId);
  // Hand-off to the co-host or anyone who came (not the host)
  const handOffCandidates = useMemo(() => {
    const seen = new Set<string>();
    return [cohost, ...people.filter((p) => p.came)].filter((p): p is CirclePerson => {
      if (!p || p.role === "host" || seen.has(p.userId)) return false;
      seen.add(p.userId);
      return true;
    });
  }, [cohost, people]);
  const pendingTo = handoff ? people.find((p) => p.userId === handoff.to_user) : null;

  const run = async (fn: () => Promise<unknown>, done?: string) => {
    setBusy(true);
    try {
      await fn();
      if (done) toast({ title: done });
      await load();
    } catch (err) {
      toast({ title: circleErrorMessage(err), variant: "destructive" });
    } finally {
      setBusy(false);
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

  const ended = hasEnded(circle);
  const cameOpen = canMarkCame(circle);
  const upcoming = upcomingOfSeries(series).filter((m) => m.id !== circle.id);
  const where = circle.online_url ? "Online" : circle.location;

  return (
    <GameShellV2>
      <div className="p-6 pb-[calc(var(--chat-clearance)+1.5rem)] lg:p-8 max-w-2xl mx-auto space-y-5">
        <Link to={`/game/meet/${circle.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {circle.title}
        </Link>

        {ended && !circle.cancelled_at && (
          <h1 className="text-2xl font-bold text-foreground">{MANAGE.endedHeadline}</h1>
        )}
        {circle.cancelled_at && <h1 className="text-2xl font-bold text-foreground">This circle was cancelled.</h1>}

        {keepGoing && hostRuns && (
          <Section title={MANAGE.keepItGoing}>
            <p className="text-sm text-muted-foreground">{MANAGE.keepItGoingSub}</p>
            <Button disabled={busy} onClick={() => run(() => extendSeries(circle, circle.repeat_rule || "weekly"))}>
              {MANAGE.keepItGoing}
            </Button>
          </Section>
        )}

        {/* Recap */}
        <Section title={MANAGE.recap}>
          <div className="text-sm text-foreground space-y-1">
            <p className="font-medium">{circle.title}</p>
            <p>{longDateLabel(circle.event_date)}</p>
            <p className="text-muted-foreground">{formatTimeRange(circle.event_time, circle.end_time, circle.timezone, circle.event_date)}</p>
            {where && <p className="text-muted-foreground">{where}</p>}
            <KindChip kind={kindOf(circle.kind)} />
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/game/meet/${circle.id}/edit`)}>
            {MANAGE.edit}
          </Button>
        </Section>

        {/* Guests */}
        <Section title={MANAGE.guests}>
          <div className="flex gap-2" role="tablist" aria-label={MANAGE.guests}>
            {(["going", "asked", "came"] as const).map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={chip === c}
                onClick={() => setChip(c)}
                className={`rounded-full border px-3 py-1 text-sm ${chip === c ? "bg-foreground text-background border-foreground" : "border-border text-foreground"}`}
              >
                {c === "going" ? "Going" : c === "asked" ? "Asked" : "Came"}
              </button>
            ))}
          </div>
          {chip === "asked" && asked.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={tellThem} onCheckedChange={(v) => setTellThem(Boolean(v))} />
              {MANAGE.tellThem}
            </label>
          )}
          <ul className="space-y-2">
            {shown.map((p) => (
              <li key={p.userId} className="flex items-center gap-3">
                <PersonFace person={p} />
                <PersonName person={p} />
                {chip === "asked" && (
                  <span className="ml-auto flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => run(() => answerAsk(circle, p.userId, true, tellThem))}>
                      {MANAGE.yes}
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => answerAsk(circle, p.userId, false, tellThem))}>
                      {MANAGE.notThisTime}
                    </Button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {/* Hosts */}
        <Section title={MANAGE.hosts}>
          <ul className="space-y-2 text-sm">
            {[host, cohost].filter(Boolean).map((p) => (
              <li key={(p as CirclePerson).userId} className="flex items-center gap-3">
                <PersonFace person={p as CirclePerson} />
                <PersonName person={p as CirclePerson} />
                <span className="text-muted-foreground">{(p as CirclePerson).role === "host" ? "host" : "co-host"}</span>
              </li>
            ))}
          </ul>
          {hostRuns && (
            <div className="space-y-3">
              {!cohost && (
                <>
                  {pickCohost ? (
                    <div className="space-y-2">
                      {came.filter((p) => p.role === "guest").length > 0 ? (
                        <ul className="space-y-1">
                          {came
                            .filter((p) => p.role === "guest")
                            .map((p) => (
                              <li key={p.userId}>
                                <button
                                  type="button"
                                  className="text-sm underline"
                                  disabled={busy}
                                  onClick={() => run(() => setCohost(circle, p.userId)).then(() => setPickCohost(false))}
                                >
                                  {p.name}
                                </button>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <>
                          <Input placeholder="Search villagers by name" value={cohostQuery} onChange={(e) => setCohostQuery(e.target.value)} aria-label={MANAGE.addCohost} />
                          <ul className="space-y-1">
                            {cohostResults.map((r) => (
                              <li key={r.userId}>
                                <button
                                  type="button"
                                  className="text-sm underline"
                                  disabled={busy}
                                  onClick={() =>
                                    run(() => setCohost(circle, r.userId)).then(() => {
                                      setPickCohost(false);
                                      setCohostQuery("");
                                    })
                                  }
                                >
                                  {r.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setPickCohost(true)}>
                      {MANAGE.addCohost}
                    </Button>
                  )}
                </>
              )}
              {cohost && (
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => run(() => setCohost(circle, null))}>
                  Remove co-host
                </Button>
              )}

              {handoff ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{MANAGE.handOffPending(pendingTo?.name || "them")}</p>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => run(() => withdrawHandoff(handoff.id))}>
                    {CANCEL_OFFER}
                  </Button>
                </div>
              ) : (
                handOffCandidates.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{MANAGE.handOff}</p>
                    <p className="text-sm text-muted-foreground">{MANAGE.handOffSub("your co-host or anyone who came")}</p>
                    <div className="flex flex-wrap gap-2">
                      {handOffCandidates.map((p) => (
                        <Button key={p.userId} variant="outline" size="sm" onClick={() => setHandOffTo(p)}>
                          {p.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </Section>

        {/* Write to everyone going */}
        <Section title={MANAGE.writeToAll}>
          <Textarea rows={3} maxLength={1000} placeholder={MANAGE.writePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button
            size="sm"
            disabled={busy || !message.trim() || going.length === 0}
            onClick={() =>
              run(async () => {
                await writeToGoing(circle, going.map((p) => p.userId), message);
                setMessage("");
              }, "Sent.")
            }
          >
            {MANAGE.send}
          </Button>
        </Section>

        {/* Mark who came */}
        <Section title={MANAGE.markCame}>
          <Button disabled={!cameOpen} onClick={() => navigate(`/game/meet/${circle.id}/came`)}>
            {MANAGE.markCame}
          </Button>
          {!cameOpen && <p className="text-sm text-muted-foreground">{ended ? "This circle is fixed." : "Opens when the circle starts."}</p>}
        </Section>

        {/* Next meeting */}
        <Section title={MANAGE.nextMeeting}>
          <p className="text-sm text-muted-foreground">{MANAGE.nextMeetingSub}</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={nextDate}
              min={toDateString(new Date())}
              onChange={(e) => setNextDate(e.target.value)}
              aria-label={MANAGE.nextMeeting}
              className="rounded-md border border-border bg-transparent px-2 py-1.5 text-sm"
            />
            <Button
              size="sm"
              disabled={busy || !nextDate}
              onClick={() =>
                run(async () => {
                  const created = await copyToNewDate(circle, nextDate);
                  navigate(`/game/meet/${created.id}/manage`);
                })
              }
            >
              {MANAGE.copyThis}
            </Button>
          </div>
          {upcoming.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1">{MANAGE.upcomingMeetings}</p>
              <ul className="space-y-1 text-sm">
                {upcoming.map((m) => (
                  <li key={m.id}>
                    <Link to={`/game/meet/${m.id}/manage`} className="text-muted-foreground hover:text-foreground hover:underline">
                      {dateRailLabel(m.event_date)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* Reminders and their log */}
        <Section title={MANAGE.remindersTitle}>
          <p className="text-sm text-muted-foreground">{MANAGE.remindersSub}</p>
          {notices.length > 0 && (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {notices.map((n) => (
                <li key={n.id}>
                  {MANAGE.reminderLog(noticeWhat(n.kind), n.audience === "going" ? "Going" : n.audience, new Date(n.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }))}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={async () => toast({ title: (await copyCircleLink(circle.id)) ? "Link copied." : "Copy failed." })}
          >
            {MANAGE.copyLink}
          </Button>
          {hostRuns && !circle.cancelled_at && (
            <Button variant="outline" onClick={() => setCancelOpen(true)}>
              {MANAGE.cancel}
            </Button>
          )}
        </div>
      </div>

      {/* Hand off: one tap + confirm; the new host must take it, until then nothing changes */}
      <Dialog open={!!handOffTo} onOpenChange={(open) => !open && setHandOffTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{MANAGE.handOff}</DialogTitle>
            <DialogDescription>{handOffTo ? MANAGE.handOffSub(handOffTo.name) : ""}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={busy}
              onClick={async () => {
                if (!handOffTo || !userId) return;
                const to = handOffTo;
                setHandOffTo(null);
                await run(async () => offerHandoff(circle, to.userId, await myFirstName(userId)));
              }}
            >
              {MANAGE.handOffConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{MANAGE.cancel}</DialogTitle>
            <DialogDescription>{MANAGE.cancelSub}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setCancelOpen(false);
                await run(() => cancelCircle(circle, going.map((p) => p.userId)));
                navigate("/game/meet");
              }}
            >
              {MANAGE.cancelConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GameShellV2>
  );
};

const CANCEL_OFFER = "Take the offer back";

export default ManageCircle;
