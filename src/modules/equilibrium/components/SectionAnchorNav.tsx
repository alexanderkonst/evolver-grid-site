import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SECTION_IDS } from "../types";
import type { WatchMode } from "./WatchModeToggle";

/**
 * Floating section-anchor nav for the Biologic Watch page (mobile only).
 *
 * Phase 3.3 carryover — addresses long-scroll fatigue across 11 sections.
 * Anchor set adapts to the active watch mode (philosophical spine §11):
 *   ACT mode:    Read · Lunar · Direction · Streams · Now
 *   ATTUNE mode: Read · Identity · Rhythms · Direction · Streams · Now
 *
 * Glass-treatment pill, bottom-center on mobile, hidden on desktop (where
 * the SectionsPanel already provides nav).
 */

const ATTUNE_ANCHORS: { id: string; label: string }[] = [
  { id: SECTION_IDS.synthesis, label: "Read" },
  { id: SECTION_IDS.mission, label: "Identity" },
  { id: SECTION_IDS.solar, label: "Rhythms" },
  { id: SECTION_IDS.strategies, label: "Direction" },
  { id: SECTION_IDS.workstreams, label: "Streams" },
  { id: SECTION_IDS.doNow, label: "Now" },
];

// In ACT mode, identity (Mission/Role) and the bigger-cycle rhythms
// (Solar/Zodiac/Weekday) are hidden, so their anchors disappear. Lunar
// gets its own pill since it's the primary rhythm in ACT mode.
const ACT_ANCHORS: { id: string; label: string }[] = [
  { id: SECTION_IDS.synthesis, label: "Read" },
  { id: SECTION_IDS.lunar, label: "Lunar" },
  { id: SECTION_IDS.strategies, label: "Direction" },
  { id: SECTION_IDS.workstreams, label: "Streams" },
  { id: SECTION_IDS.doNow, label: "Now" },
];

interface SectionAnchorNavProps {
  mode?: WatchMode;
}

export const SectionAnchorNav = ({ mode = "act" }: SectionAnchorNavProps) => {
  const ANCHORS = mode === "attune" ? ATTUNE_ANCHORS : ACT_ANCHORS;
  const [activeId, setActiveId] = useState<string>(ANCHORS[0].id);

  // Reset active to the first anchor when mode changes (in case the
  // previously-active anchor isn't in the new mode's set).
  useEffect(() => {
    setActiveId(ANCHORS[0].id);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Highlight the anchor whose section is currently most-visible. Re-run
  // when mode flips since the anchor set changes.
  useEffect(() => {
    const sections = ANCHORS.map((a) => document.getElementById(a.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav
      aria-label="Jump to section"
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-30",
        "liquid-glass rounded-full px-2 py-1.5",
        "max-w-[calc(100vw-2rem)] overflow-x-auto",
        "sm:hidden", // mobile-only — desktop has SectionsPanel
      )}
    >
      <ul className="flex items-center gap-1 whitespace-nowrap">
        {ANCHORS.map(({ id, label }) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => handleClick(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "bg-[#0a1628] text-white"
                    : "text-[#0a1628]/90 hover:text-[#0a1628]",
                )}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SectionAnchorNav;
