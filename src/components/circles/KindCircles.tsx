/**
 * The same circles as the Café, filtered by kind (circles spec §9.1: Mastermind and Weekly
 * circles also show at the Fire Circle; canon §13.1, no second system).
 *
 * Renders nothing until there is at least one upcoming circle of those kinds, so a page that
 * mounts it looks exactly as before. Faces only, no numbers.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { KIND_LABEL } from "@/data/circlesCopy";
import { dateRailLabel, formatClock, kindOf, splitByPeriod, type CircleKind } from "@/lib/circles";
import { fetchCafeCircles, type Circle } from "@/lib/circlesApi";

interface Props {
  kinds: CircleKind[];
  heading: string;
  className?: string;
}

const KindCircles = ({ kinds, heading, className }: Props) => {
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    let live = true;
    // A guest sees public circles; the read fails quietly while circles are not deployed.
    fetchCafeCircles(null)
      .then(({ circles: all }) => {
        if (!live) return;
        const wanted = all.filter((c) => kinds.includes(kindOf(c.kind)));
        setCircles(splitByPeriod(wanted, "upcoming").slice(0, 6));
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kinds.join(",")]);

  if (circles.length === 0) return null;

  return (
    <section className={className} aria-label={heading}>
      <h2 className="text-center text-sm font-semibold uppercase tracking-widest mb-3">{heading}</h2>
      <ul className="space-y-2 max-w-md mx-auto">
        {circles.map((c) => (
          <li key={c.id}>
            <Link
              to={`/game/meet/${c.id}`}
              className="flex items-baseline justify-between gap-3 rounded-lg border border-current/20 px-4 py-2 text-sm hover:border-current/50 transition-colors"
            >
              <span className="font-medium">
                {c.title} <span className="font-normal opacity-70">· {KIND_LABEL[kindOf(c.kind)]}</span>
              </span>
              <span className="opacity-70 whitespace-nowrap">
                {dateRailLabel(c.event_date).split(" · ")[0]}, {formatClock(c.event_time)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default KindCircles;
