import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { PLACE_BACK_LINK_CLASS } from "@/components/game/VillagePlaceHeader";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Face, KindChip, MoonBadge, cardClass } from "@/components/circles/CircleBits";
import { CAFE } from "@/data/circlesCopy";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import {
  canRun,
  dateRailLabel,
  formatClock,
  groupByDay,
  moonMark,
  periodFromSearch,
  rowThumbnail,
  splitByPeriod,
  statusPill,
  zoneLabel,
  zonedInstant,
  type Period,
} from "@/lib/circles";
import { circleErrorMessage, fetchCafeCircles, type Circle, type MyRsvp } from "@/lib/circlesApi";
import { MASTERMIND_LIVE_SESSION_URL, MASTERMIND_PAGE_PATH } from "@/data/mastermindSession";

/** The two real events of the Mastermind launch; their copy is `eventsSpace.featured.<id>.*`. */
const FEATURED_EVENTS = [
  { id: "liveSession", href: MASTERMIND_LIVE_SESSION_URL, external: true },
  { id: "mastermind", href: MASTERMIND_PAGE_PATH, external: false },
] as const;

type Faces = Record<string, { avatarUrl: string | null; name: string; userId: string }[]>;

const EventsSpace = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userId = useSessionUserId();
  const [search, setSearch] = useSearchParams();
  const period = periodFromSearch(`?${search.toString()}`);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mine, setMine] = useState<Record<string, MyRsvp>>({});
  const [faces, setFaces] = useState<Faces>({});
  const [goingCounts, setGoingCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (uid: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCafeCircles(uid);
      setCircles(data.circles);
      setMine(data.mine);
      setFaces(data.faces);
      setGoingCounts(data.goingCounts);
    } catch (err) {
      setError(circleErrorMessage(err, "Failed to load circles"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    load(userId);
  }, [userId, load]);

  const rows = useMemo(() => splitByPeriod(circles, period), [circles, period]);
  const days = useMemo(() => groupByDay(rows), [rows]);

  const setPeriod = (next: Period) => {
    const params = new URLSearchParams(search);
    if (next === "past") params.set("period", "past");
    else params.delete("period");
    setSearch(params, { replace: true });
  };

  return (
    <GameShellV2>
      <ErrorBoundary>
        <div className="p-6 pb-[calc(var(--chat-clearance)+1.5rem)] lg:p-8 max-w-4xl mx-auto">
          {/* Same back link as every place (WP-15), for guests and players alike. */}
          <Link to="/village" className={`${PLACE_BACK_LINK_CLASS} mb-2`}>
            {t("eventsSpace.backToVillage")}
          </Link>

          {/* Header: S1 */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarDays className="w-6 h-6 text-foreground" />
                <h1 className="text-2xl font-bold text-foreground">{CAFE.title}</h1>
              </div>
              <p className="text-muted-foreground">{CAFE.subtitle}</p>
            </div>
            {userId && (
              <Button onClick={() => navigate("/game/meet/create")} className="shrink-0">
                {CAFE.host}
              </Button>
            )}
          </div>

          {/* Upcoming | Past: writes ?period=past */}
          {/* Village register (issue #443 wave 3, item 8): the selected tab is a dark surface with a gold
              underline and off-white text, never a white pill. Mono caps like every other village label. */}
          <div role="tablist" aria-label="Period" className="inline-flex border-b border-foreground/20 mb-6">
            {(["upcoming", "past"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={`-mb-px min-h-[44px] px-4 border-b-2 font-mono text-xs font-light uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:text-foreground ${
                  period === p
                    ? "border-[color:var(--select-accent)] bg-foreground/[0.06] text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "upcoming" ? CAFE.upcoming : CAFE.past}
              </button>
            ))}
          </div>

          {(loading || userId === undefined) && (
            <div className="grid gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <SkeletonCard key={idx} className="h-20" />
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Circles, grouped on a date rail */}
          {!loading && !error && userId !== undefined && days.length === 0 && (
            <div className={`${cardClass} p-8 text-center mb-6`}>
              <p className="text-foreground mb-4 max-w-md mx-auto">{CAFE.empty}</p>
              {userId && <Button onClick={() => navigate("/game/meet/create")}>{CAFE.host}</Button>}
            </div>
          )}

          {!loading && !error && days.length > 0 && (
            <div className="space-y-6 mb-8">
              {days.map((day) => {
                const mark = moonMark(day.date);
                return (
                  <section key={day.date} aria-label={dateRailLabel(day.date)}>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      {dateRailLabel(day.date)}
                      <MoonBadge mark={mark} />
                    </h2>
                    <ul className="space-y-2">
                      {day.circles.map((c) => {
                        const pill = statusPill(mine[c.id]);
                        const runs = canRun(c, userId);
                        const people = faces[c.id] || [];
                        const where = c.online_url ? "Online" : c.location;
                        const at = zonedInstant(c.event_date, c.event_time, c.timezone);
                        // A past Care of a place shows its "after" photo; nothing else has a thumbnail.
                        const thumb = rowThumbnail(c);
                        return (
                          <li key={c.id}>
                            <div
                              role="link"
                              tabIndex={0}
                              onClick={() => navigate(`/game/meet/${c.id}`)}
                              onKeyDown={(e) => e.key === "Enter" && navigate(`/game/meet/${c.id}`)}
                              className={`${cardClass} p-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4 cursor-pointer hover:border-foreground/40 transition-colors`}
                            >
                              {thumb && <img src={thumb} alt="" loading="lazy" className="w-14 h-14 shrink-0 rounded-lg object-cover" />}
                              <div className="sm:w-28 sm:shrink-0 text-sm text-muted-foreground">
                                {formatClock(c.event_time)}
                                <span className="block text-xs">{zoneLabel(c.timezone, at)}</span>
                              </div>
                              <div className="min-w-0 w-full sm:w-auto sm:flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-foreground break-words sm:truncate">{c.title}</h3>
                                  <KindChip kind={c.kind} />
                                </div>
                                {where && <p className="text-sm text-muted-foreground truncate">{where}</p>}
                                {people.length > 0 && (
                                  <div className="flex -space-x-1.5 mt-2">
                                    {people.map((p) => (
                                      <Face key={p.userId} userId={p.userId} name={p.name} avatarUrl={p.avatarUrl} size="sm" />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="sm:shrink-0 text-sm sm:text-right">
                                {runs ? (
                                  <span className="text-muted-foreground">
                                    {CAFE.going(goingCounts[c.id] || 0)} ·{" "}
                                    <Link
                                      to={`/game/meet/${c.id}/manage`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="font-semibold text-foreground hover:underline"
                                    >
                                      {CAFE.manage}
                                    </Link>
                                  </span>
                                ) : (
                                  pill && (
                                    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                                      {pill}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}

          {/* Two real events, always shown (issue #215). The header holds the only Create Event button.
              Card fill tokenized for Aurum (Day 91), fallback keeps lapis at white/85. */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {FEATURED_EVENTS.map((event) => {
              const cls =
                "block rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(44,49,80,0.06)] hover:border-foreground/40 transition-colors";
              const body = (
                <>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {t(`eventsSpace.featured.${event.id}.when`)}
                  </p>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(`eventsSpace.featured.${event.id}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t(`eventsSpace.featured.${event.id}.price`)}
                  </p>
                  <span className="text-sm font-medium text-foreground">
                    {t(`eventsSpace.featured.${event.id}.cta`)} →
                  </span>
                </>
              );
              return event.external ? (
                <a key={event.id} href={event.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {body}
                </a>
              ) : (
                <Link key={event.id} to={event.href} className={cls}>
                  {body}
                </Link>
              );
            })}
          </div>

        </div>
      </ErrorBoundary>
    </GameShellV2>
  );
};

export default EventsSpace;
