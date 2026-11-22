/**
 * Circle page (S3). Serves /game/meet/:id and /events/:id (old links keep working).
 *
 * The same card shows different actions by role: a guest sees their status, the host sees
 * "Manage". Only "came" counts: before the circle you see who is going (faces, no number);
 * after it, who came (faces) and the one line each of them left. No likes, no views.
 * Spec: issue #384 (S3, S6, S7; Care of a place: PR #388). Copy: src/data/circlesCopy.ts.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Video } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import AddToCalendarButton from "@/components/events/AddToCalendarButton";
import WeeklyPanel from "@/components/circles/WeeklyPanel";
import { KindChip, MoonBadge, PersonFace, PersonName, cardClass, copyCircleLink } from "@/components/circles/CircleBits";
import { CARE, CIRCLE_PAGE, HOST_FORM, WEEKLY } from "@/data/circlesCopy";
import { useEventRsvp } from "@/hooks/useEvents";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { useToast } from "@/hooks/use-toast";
import {
  LINE_MAX,
  afterPhotoOf,
  canRun,
  dateBadge,
  dateRailLabel,
  endInstant,
  formatTimeRange,
  hasEnded,
  hostOf,
  isHost,
  isWeekly,
  joinState,
  kindOf,
  longDateLabel,
  moonMark,
  repeatSummary,
  startInstant,
  timeToMinutes,
  upcomingOfSeries,
  validLine,
  type RsvpStatus,
} from "@/lib/circles";
import {
  acceptHandoff,
  askToJoin,
  circleErrorMessage,
  deleteLine,
  fetchCircle,
  fetchLines,
  fetchMyRsvp,
  fetchPeople,
  fetchPendingHandoff,
  fetchSeries,
  joinCircle,
  leaveCircle,
  myFirstName,
  saveLine,
  type Circle,
  type CircleLine,
  type CirclePerson,
  type Handoff,
  type MyRsvp,
} from "@/lib/circlesApi";
import { threadPath } from "@/lib/playerMessages";

const mapUrl = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

const COVER: Record<string, string> = {
  weekly_circle: "from-[#2c3150] to-[#8460ea]",
  mastermind: "from-[#8460ea] to-[#a4a3d0]",
  practice: "from-[#a4a3d0] to-[#d9d4f5]",
  dinner: "from-[#e8a96b] to-[#f6d9b5]",
  gathering: "from-[#6bb59a] to-[#c5e6d9]",
  care: "from-[#4f9a6b] to-[#d3ecb8]",
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const userId = useSessionUserId();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [people, setPeople] = useState<CirclePerson[]>([]);
  const [mine, setMine] = useState<MyRsvp | null>(null);
  const [lines, setLines] = useState<CircleLine[]>([]);
  const [series, setSeries] = useState<Circle[]>([]);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [myName, setMyName] = useState("");
  const [askOpen, setAskOpen] = useState(false);
  const [askLine, setAskLine] = useState("");
  const [lineDraft, setLineDraft] = useState("");
  const [showSeries, setShowSeries] = useState(false);

  // The existing email-reminder fields (event_rsvps.email / wants_reminder) keep working.
  const reminder = useEventRsvp(id);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const c = await fetchCircle(id);
      if (!c) {
        setError("not-found");
        return;
      }
      setCircle(c);
      const [p, l, s, h, m] = await Promise.all([
        fetchPeople(id),
        fetchLines(id),
        c.series_id ? fetchSeries(c.series_id) : Promise.resolve([] as Circle[]),
        userId ? fetchPendingHandoff(id) : Promise.resolve(null),
        userId ? fetchMyRsvp(id, userId) : Promise.resolve(null),
      ]);
      setPeople(p);
      setLines(l);
      setSeries(s);
      setHandoff(h);
      setMine(m);
      setError(null);
    } catch (err) {
      setError(circleErrorMessage(err, "Failed to load this circle."));
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    if (userId === undefined) return;
    load();
  }, [userId, load]);

  useEffect(() => {
    if (userId) myFirstName(userId).then(setMyName).catch(() => undefined);
  }, [userId]);

  // After "Host circle": one-line toast with Copy link.
  useEffect(() => {
    const state = location.state as { justHosted?: boolean } | null;
    if (!state?.justHosted || !circle) return;
    toast({
      title: HOST_FORM.created,
      action: (
        <ToastAction
          altText="Copy link"
          onClick={async () => {
            const ok = await copyCircleLink(circle.id);
            toast({ title: ok ? "Link copied." : "Copy failed." });
          }}
        >
          Copy link
        </ToastAction>
      ),
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [circle, location.pathname, location.state, navigate, toast]);

  const firstName = (myName || "").split(" ")[0];
  const host = useMemo(() => people.find((p) => p.role === "host") || null, [people]);
  const cohost = useMemo(() => people.find((p) => p.role === "cohost") || null, [people]);
  const going = useMemo(() => people.filter((p) => p.role === "guest" && p.status === "going"), [people]);
  const came = useMemo(() => people.filter((p) => p.came), [people]);
  const personById = (uid: string) => people.find((p) => p.userId === uid);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
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
        <div className="text-center p-8 space-y-3">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">{error === "not-found" || !error ? "This circle is not here." : error}</h2>
          <Button variant="outline" onClick={() => navigate("/game/meet")}>
            Back to the Café
          </Button>
        </div>
      </GameShellV2>
    );
  }

  const kind = kindOf(circle.kind);
  const now = Date.now();
  const ended = hasEnded(circle, now);
  const hostRuns = isHost(circle, userId);
  const runs = canRun(circle, userId);
  const myStatus = (mine?.status as RsvpStatus | null) ?? null;
  const state = joinState({ circle, myStatus, goingCount: going.length, now });
  const badge = dateBadge(circle.event_date);
  const online = !!circle.online_url;
  const showOnlineLink = online && (state === "joined" || runs);
  const nextMeetings = upcomingOfSeries(series, now).filter((m) => m.id !== circle.id);
  const isMember = runs || myStatus === "going" || !!mine?.came;
  const myLine = lines.find((l) => l.user_id === userId) || null;
  const durationMinutes = Math.max(
    30,
    Math.round((endInstant(circle) - startInstant(circle)) / 60000) || timeToMinutes(circle.end_time || "00:00"),
  );
  const toHostPath = hostOf(circle) ? threadPath(hostOf(circle) as string) : null;
  const iHaveHandoff = !!handoff && handoff.to_user === userId;

  const submitLine = async () => {
    const valid = validLine(lineDraft);
    if (!valid || !userId) return;
    await run(async () => {
      await saveLine(circle.id, userId, valid);
      setLineDraft("");
    });
  };

  return (
    <GameShellV2>
      <div className="p-6 pb-[calc(var(--chat-clearance)+1.5rem)] lg:p-8 max-w-2xl mx-auto space-y-5">
        <Link to="/game/meet" className="text-sm text-muted-foreground hover:text-foreground">
          ← Café
        </Link>

        {/* Cover */}
        <div className={`h-44 rounded-xl overflow-hidden bg-gradient-to-br ${COVER[kind]} relative`}>
          {circle.photo_url && <img src={circle.photo_url} alt="" loading="lazy" className="w-full h-full object-cover" />}
        </div>

        {/* Host banner and hand-off offer */}
        {hostRuns && (
          <div className={`${cardClass} p-4 flex items-center justify-between gap-3`}>
            <span className="text-sm font-medium text-foreground">{CIRCLE_PAGE.youHost}</span>
            <Button size="sm" onClick={() => navigate(`/game/meet/${circle.id}/manage`)}>
              {CIRCLE_PAGE.manage}
            </Button>
          </div>
        )}
        {!hostRuns && cohost?.userId === userId && (
          <div className={`${cardClass} p-4 flex items-center justify-between gap-3`}>
            <span className="text-sm font-medium text-foreground">You co-host this circle.</span>
            <Button size="sm" onClick={() => navigate(`/game/meet/${circle.id}/manage`)}>
              {CIRCLE_PAGE.manage}
            </Button>
          </div>
        )}
        {iHaveHandoff && handoff && (
          <div className={`${cardClass} p-4 flex items-center justify-between gap-3`}>
            <span className="text-sm font-medium text-foreground">{CIRCLE_PAGE.offerTitle(personById(handoff.from_user)?.name || host?.name || "The host")}</span>
            <Button size="sm" disabled={busy} onClick={() => run(() => acceptHandoff(handoff.id))}>
              {CIRCLE_PAGE.takeCircle}
            </Button>
          </div>
        )}

        {/* Title, date, place */}
        <div className={`${cardClass} p-6 space-y-4`}>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-14 rounded-lg border border-border text-center overflow-hidden">
              <div className="bg-muted text-[10px] font-semibold tracking-wide py-0.5">{badge.month}</div>
              <div className="text-xl font-bold py-1 text-foreground">{badge.day}</div>
            </div>
            <div className="min-w-0 space-y-1.5">
              <h1 className="text-2xl font-bold text-foreground">{circle.title}</h1>
              <KindChip kind={kind} />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <CalendarDays className="w-4 h-4 text-muted-foreground" aria-hidden />
              {longDateLabel(circle.event_date)}
              <MoonBadge mark={moonMark(circle.event_date)} />
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" aria-hidden />
              {formatTimeRange(circle.event_time, circle.end_time, circle.timezone, circle.event_date)}
            </p>
            {online ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Video className="w-4 h-4" aria-hidden />
                {showOnlineLink ? (
                  <a href={circle.online_url as string} target="_blank" rel="noopener noreferrer" className="underline text-foreground">
                    {circle.online_url}
                  </a>
                ) : (
                  CIRCLE_PAGE.onlineAfterJoin
                )}
              </p>
            ) : (
              circle.location && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" aria-hidden />
                  <a href={mapUrl(circle.location)} target="_blank" rel="noopener noreferrer" className="underline text-foreground">
                    {circle.location}
                  </a>
                </p>
              )
            )}
          </div>

          {/* Hosted by */}
          {host && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">{CIRCLE_PAGE.hostedBy}</span>
              <PersonFace person={host} />
              <PersonName person={host} />
              {cohost && <span className="text-sm text-muted-foreground">{CIRCLE_PAGE.with(cohost.name)}</span>}
              {userId && host.userId !== userId && (
                <Link to={threadPath(host.userId)} className="ml-auto text-sm font-medium text-foreground hover:underline">
                  {CIRCLE_PAGE.write}
                </Link>
              )}
            </div>
          )}

          {circle.description && <p className="text-sm text-foreground whitespace-pre-wrap pt-3 border-t border-border">{circle.description}</p>}

          {/* Repeating */}
          {circle.series_id && circle.repeat_rule && circle.repeat_rule !== "never" && (
            <div className="pt-3 border-t border-border text-sm">
              <button type="button" className="text-muted-foreground hover:text-foreground text-left" onClick={() => setShowSeries((v) => !v)}>
                {CIRCLE_PAGE.meets(repeatSummary(circle.repeat_rule), nextMeetings[0] ? dateRailLabel(nextMeetings[0].event_date).split(" · ")[0] : null)}
              </button>
              {showSeries && (
                <ul className="mt-2 space-y-1">
                  {series.filter((m) => !m.cancelled_at).map((m) => (
                    <li key={m.id}>
                      <Link to={`/game/meet/${m.id}`} className={`hover:underline ${m.id === circle.id ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {dateRailLabel(m.event_date)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Join card, by state. The host has the banner above instead. */}
        {!hostRuns && (
          <div className={`${cardClass} p-5 space-y-3`}>
            {userId === null && state !== "cancelled" && state !== "ended" ? (
              <>
                <p className="text-foreground">{CIRCLE_PAGE.signInToJoin}</p>
                <Button onClick={() => navigate("/auth")}>Sign in</Button>
              </>
            ) : (
              <>
                {state === "open" && (
                  <>
                    <p className="text-foreground">{CIRCLE_PAGE.joinOpen(firstName || "you")}</p>
                    <Button disabled={busy} onClick={() => run(() => joinCircle(circle.id))}>
                      {CIRCLE_PAGE.join}
                    </Button>
                  </>
                )}
                {state === "ask" && (
                  <>
                    <p className="text-foreground">{CIRCLE_PAGE.askTitle}</p>
                    <Button disabled={busy} onClick={() => setAskOpen(true)}>
                      {CIRCLE_PAGE.ask}
                    </Button>
                  </>
                )}
                {state === "full" && (
                  <>
                    <p className="text-foreground">{CIRCLE_PAGE.full}</p>
                    {toHostPath && (
                      <Button variant="outline" onClick={() => navigate(toHostPath)}>
                        {CIRCLE_PAGE.writeToHost}
                      </Button>
                    )}
                  </>
                )}
                {state === "joined" && (
                  <>
                    <p className="text-foreground font-medium">{CIRCLE_PAGE.joined}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <AddToCalendarButton
                        title={circle.title}
                        description={circle.description || ""}
                        date={circle.event_date}
                        time={circle.event_time}
                        location={circle.location || circle.online_url || ""}
                        durationMinutes={durationMinutes}
                        timezone={circle.timezone || "UTC"}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(() => leaveCircle(circle.id))}
                        className="text-sm text-muted-foreground underline hover:text-foreground"
                      >
                        {CIRCLE_PAGE.cantMakeIt}
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={reminder.wantsReminder}
                        onChange={(e) => reminder.setWantsReminder(e.target.checked)}
                        aria-label="Email me a reminder"
                      />
                      Email me a reminder too
                    </label>
                    {reminder.wantsReminder && (
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={reminder.reminderEmail}
                          onChange={(e) => reminder.setReminderEmail(e.target.value)}
                          aria-label="Email for the reminder"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={reminder.updating || !reminder.reminderEmail}
                          onClick={() =>
                            run(() => reminder.updateRsvp("going", { email: reminder.reminderEmail, wantsReminder: true }))
                          }
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </>
                )}
                {state === "asked" && (
                  <>
                    <p className="text-foreground">{CIRCLE_PAGE.asked}</p>
                    <Button variant="outline" disabled={busy} onClick={() => run(() => leaveCircle(circle.id))}>
                      {CIRCLE_PAGE.withdraw}
                    </Button>
                  </>
                )}
                {state === "declined" && <p className="text-foreground">{CIRCLE_PAGE.declined}</p>}
                {state === "cancelled" && <p className="text-foreground">{CIRCLE_PAGE.cancelled}</p>}
                {state === "ended" && <p className="text-foreground">{CIRCLE_PAGE.ended}</p>}
              </>
            )}
          </div>
        )}

        {/* Care of a place: the "after" photo, above Came. One photo, no caption, no count. */}
        {afterPhotoOf(circle) && (
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={afterPhotoOf(circle) as string} alt={CARE.afterAlt} loading="lazy" className="w-full max-h-96 object-cover" />
          </div>
        )}

        {/* Going → after the circle: Came. Faces only, no number. */}
        {ended && came.length > 0 ? (
          <div className={`${cardClass} p-5 space-y-3`}>
            <h2 className="font-semibold text-foreground">{CIRCLE_PAGE.came}</h2>
            <div className="flex flex-wrap gap-2">
              {came.map((p) => (
                <PersonFace key={p.userId} person={p} />
              ))}
            </div>
          </div>
        ) : (
          !ended &&
          going.length > 0 && (
            <div className={`${cardClass} p-5 space-y-3`}>
              <h2 className="font-semibold text-foreground">{CIRCLE_PAGE.going}</h2>
              <div className="flex flex-wrap gap-2">
                {going.map((p) => (
                  <PersonFace key={p.userId} person={p} />
                ))}
              </div>
            </div>
          )
        )}

        {/* S6: one line, for people marked came only; lines show under Came */}
        {mine?.came && (
          <div className={`${cardClass} p-5 space-y-3`}>
            <h2 className="font-semibold text-foreground">{CIRCLE_PAGE.oneLine}</h2>
            {myLine ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground">{myLine.body}</p>
                <div className="flex gap-3 text-sm">
                  <button type="button" className="underline text-muted-foreground hover:text-foreground" onClick={() => setLineDraft(myLine.body)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="underline text-muted-foreground hover:text-foreground"
                    onClick={() => userId && run(() => deleteLine(circle.id, userId))}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : null}
            {(!myLine || lineDraft) && (
              <div className="space-y-2">
                <Input
                  value={lineDraft}
                  maxLength={LINE_MAX}
                  onChange={(e) => setLineDraft(e.target.value)}
                  placeholder={isWeekly(kind) ? WEEKLY.linePlaceholder : CIRCLE_PAGE.linePlaceholder}
                  aria-label={isWeekly(kind) ? WEEKLY.linePlaceholder : CIRCLE_PAGE.linePlaceholder}
                />
                <Button size="sm" disabled={busy || !validLine(lineDraft)} onClick={submitLine}>
                  {CIRCLE_PAGE.leaveLine}
                </Button>
              </div>
            )}
          </div>
        )}
        {lines.length > 0 && (
          <ul className="space-y-3">
            {lines.map((l) => {
              const author = personById(l.user_id);
              return (
                <li key={l.id} className={`${cardClass} p-4 flex gap-3`}>
                  {author && <PersonFace person={author} size="sm" />}
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{l.body}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{author ? <PersonName person={author} /> : "A villager"}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* S7: the Save Point and the weekly step */}
        {isWeekly(kind) && (
          <WeeklyPanel circle={circle} userId={userId} people={people} runsCircle={runs} isMember={isMember} />
        )}
      </div>

      {/* Ask to join: a line for the host (optional) */}
      <Dialog open={askOpen} onOpenChange={setAskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{CIRCLE_PAGE.askModalTitle}</DialogTitle>
          </DialogHeader>
          <Textarea rows={3} maxLength={200} value={askLine} onChange={(e) => setAskLine(e.target.value)} autoFocus />
          <Button
            disabled={busy}
            onClick={async () => {
              await run(() => askToJoin(circle, askLine, myName || "Someone"));
              setAskOpen(false);
              setAskLine("");
            }}
          >
            {CIRCLE_PAGE.ask}
          </Button>
        </DialogContent>
      </Dialog>
    </GameShellV2>
  );
};

export default EventDetail;
