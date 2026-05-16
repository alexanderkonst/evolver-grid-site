import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SECTION_IDS } from "../types";

/**
 * Floating section-anchor nav for the Biologic Watch page (mobile only).
 *
 * Phase 3.3 carryover — addresses long-scroll fatigue across 11 sections.
 * Six anchor points grouped to match the four sub-result layers:
 *   Read · Identity · Rhythms · Direction · Streams · Now
 *
 * Glass-treatment pill, bottom-center on mobile, hidden on desktop (where
 * the SectionsPanel already provides nav).
 */

const ANCHORS: { id: string; label: string }[] = [
  { id: SECTION_IDS.synthesis, label: "Read" },
  { id: SECTION_IDS.mission, label: "Identity" },
  { id: SECTION_IDS.solar, label: "Rhythms" },
  { id: SECTION_IDS.strategies, label: "Direction" },
  { id: SECTION_IDS.workstreams, label: "Streams" },
  { id: SECTION_IDS.doNow, label: "Now" },
];

export const SectionAnchorNav = () => {
  const [activeId, setActiveId] = useState<string>(ANCHORS[0].id);

  // Highlight the anchor whose section is currently most-visible.
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
  }, []);

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
                    : "text-[#0a1628]/60 hover:text-[#0a1628]",
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
