import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SECTION_IDS } from "../types";
import type { WatchMode } from "./WatchModeToggle";

/**
 * Floating section-anchor nav for the Biologic Watch page (mobile only).
 *
 * Anchor set adapts to the active watch mode (philosophical spine §11
 * round 5 — clean binary):
 *   ATTUNE mode: Read · Solar · Zodiac · Lunar · Week
 *   ACT mode:    Mission · Strategy · Streams · Now
 *
 * Each anchor points at a section that ACTUALLY EXISTS in the current
 * mode — never to a hidden section.
 *
 * Glass-treatment pill, bottom-center on mobile, hidden on desktop (where
 * the SectionsPanel already provides nav).
 */

// ATTUNE mode shows: Synthesis, Solar, Zodiac, Lunar+MoonFocus, Day-of-Week.
const ATTUNE_ANCHORS: { id: string; label: string }[] = [
  { id: SECTION_IDS.synthesis, label: "Read" },
  { id: SECTION_IDS.solar, label: "Solar" },
  { id: SECTION_IDS.zodiac, label: "Zodiac" },
  { id: SECTION_IDS.lunar, label: "Lunar" },
  { id: SECTION_IDS.dayOfWeek, label: "Week" },
];

// ACT mode shows (original spine order; Sasha makes the section calls):
// Lifelong Dedication → Role → Strategy → Workstreams → Tasks → DO NOW.
// "Dedication" anchor covers the North Star block at top.
// The Active Focus Banner (above Lifelong Dedication when in-focus tasks
// exist) is not its own anchor — it's a transient mirror of DO NOW.
const ACT_ANCHORS: { id: string; label: string }[] = [
  { id: SECTION_IDS.mission, label: "Dedication" },
  { id: SECTION_IDS.strategies, label: "Strategy" },
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
