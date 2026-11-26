import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { GOLD_TEXT_STYLE } from "@/lib/landingDesign";
import { BODY_STYLE, EYEBROW_STYLE, TITLE_STYLE } from "@/pages/Library";
import { PLACE_BACK_LINK_CLASS } from "@/components/game/VillagePlaceHeader";
import {
  filterTiles,
  getCourseTiles,
  tileCategories,
  tileLevels,
  type CourseTile,
} from "@/data/courseStore";
import type { CourseCategory, CourseLevel } from "@/types/module";

/**
 * CourseStore — panel 3 of the Learn space (/game/learn/courses): the educational app store.
 * Panel 2 (SectionsPanel, Learn) lists the courses; this panel shows them as tiles.
 *
 * One tile per course (docs/templates/course-as-app.md, step 2): icon, bold short name, result
 * tagline, level + category chips, version. Tapping the tile opens the course landing
 * (/academy/<slug>); "Start" opens the course page. Level and category filter client-side.
 * Data: src/data/courseStore.ts. No animation and no transform: the ornament of the other Academy pages (a looping spin) is left out on purpose, so reduced motion needs no case.
 */

const chipBase =
  "inline-flex items-center min-h-[32px] rounded-full px-3 text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.7)]";
const chipOff = "border-[rgba(212,175,55,0.35)] bg-transparent hover:bg-[rgba(212,175,55,0.12)]";
const chipOn = "border-[rgba(122,81,8,0.55)] bg-[rgba(212,175,55,0.3)] font-semibold";

const cardStyle = {
  boxShadow: "0 8px 24px -12px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.22)",
};

function FilterRow<T extends string>({
  label,
  values,
  active,
  onChange,
}: {
  label: string;
  values: T[];
  active: T | null;
  onChange: (value: T | null) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2" data-testid={`store-filter-${label.toLowerCase()}`}>
      <span className="text-[10.5px] mr-1" style={EYEBROW_STYLE}>{label}</span>
      <button type="button" aria-pressed={active === null} onClick={() => onChange(null)} className={`${chipBase} ${active === null ? chipOn : chipOff}`} style={BODY_STYLE}>
        All
      </button>
      {values.map((v) => (
        <button key={v} type="button" aria-pressed={active === v} onClick={() => onChange(active === v ? null : v)} className={`${chipBase} ${active === v ? chipOn : chipOff}`} style={BODY_STYLE}>
          {v}
        </button>
      ))}
    </div>
  );
}

function Tile({ tile }: { tile: CourseTile }) {
  return (
    <li data-testid="store-tile" data-slug={tile.slug} className="rounded-2xl p-4 liquid-glass-strong flex flex-col gap-3" style={cardStyle}>
      <Link
        to={tile.landingPath}
        data-testid="store-tile-link"
        className="flex items-start gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.7)]"
      >
        {tile.icon ? (
          <img src={tile.icon} alt="" width={64} height={64} className="flex-shrink-0 w-16 h-16 rounded-xl object-cover" />
        ) : (
          <span aria-hidden="true" className="flex-shrink-0 w-16 h-16 rounded-xl inline-flex items-center justify-center border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.08)]" style={BODY_STYLE}>
            <GraduationCap className="w-7 h-7" />
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block text-lg font-semibold leading-snug" style={{ ...TITLE_STYLE, fontWeight: 600 }}>{tile.name}</span>
          <span className="block text-base leading-snug" style={BODY_STYLE}>{tile.tagline}</span>
        </span>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {tile.level && <span data-testid="chip-level" className="rounded-full border border-[rgba(212,175,55,0.35)] px-2.5 py-0.5 text-xs" style={BODY_STYLE}>{tile.level}</span>}
        {tile.category && <span data-testid="chip-category" className="rounded-full border border-[rgba(212,175,55,0.35)] px-2.5 py-0.5 text-xs" style={BODY_STYLE}>{tile.category}</span>}
        {tile.version && <span data-testid="tile-version" className="text-xs tabular-nums" style={BODY_STYLE}>v{tile.version}</span>}
        {tile.startPath && (
          <Link
            to={tile.startPath}
            data-testid="store-start"
            aria-label={`Start ${tile.name}`}
            className="ml-auto inline-flex items-center min-h-[44px] px-3 text-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.7)] rounded-md"
            style={BODY_STYLE}
          >
            Start
          </Link>
        )}
      </div>
    </li>
  );
}

const CourseStore = () => {
  const tiles = useMemo(() => getCourseTiles(), []);
  const levels = useMemo(() => tileLevels(tiles), [tiles]);
  const categories = useMemo(() => tileCategories(tiles), [tiles]);
  const [level, setLevel] = useState<CourseLevel | null>(null);
  const [category, setCategory] = useState<CourseCategory | null>(null);
  const shown = filterTiles(tiles, level, category);

  return (
    <div className="p-6 pb-24 lg:p-10 lg:pb-12 max-w-3xl mx-auto">
      <Link to="/game/learn" className={`${PLACE_BACK_LINK_CLASS} mb-2`}>← Academy</Link>
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-semibold mb-4 tracking-tight leading-[1.05]" style={TITLE_STYLE}>
          <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>Courses</span>
        </h1>
        <div aria-hidden="true" className="h-px max-w-md mx-auto my-5" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)" }} />
        <p className="text-base sm:text-lg italic max-w-xl mx-auto leading-relaxed" style={BODY_STYLE}>
          Each one is an app with one result. Pick the result you want.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <FilterRow<CourseLevel> label="Level" values={levels} active={level} onChange={setLevel} />
        <FilterRow<CourseCategory> label="Category" values={categories} active={category} onChange={setCategory} />
      </div>

      {shown.length > 0 ? (
        <ul aria-label="Courses" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 list-none p-0 m-0">
          {shown.map((tile) => <Tile key={tile.slug} tile={tile} />)}
        </ul>
      ) : (
        <p role="status" className="text-center text-sm italic" style={BODY_STYLE}>No course matches these filters.</p>
      )}
    </div>
  );
};

export default CourseStore;
