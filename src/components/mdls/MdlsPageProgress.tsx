import { useEffect, useState } from "react";

/**
 * MDLS · Page Progress
 *
 * Fixed-right pagination dots that show which section the user is
 * currently in. Clicking a dot scrolls to that section. Adds the
 * "chapter book" feel — the Codex reads as a sequence of named
 * sections, not an undifferentiated scroll.
 *
 * Subtle by design — small dots, low opacity, no labels until hover.
 * Restrained register, doesn't compete with the content.
 *
 * v1.0 — 2026-05-19 — Wave 9 / M4.
 */

interface Section {
  id: string;
  label: string;
}

interface MdlsPageProgressProps {
  sections: Section[];
}

export const MdlsPageProgress = ({ sections }: MdlsPageProgressProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // IntersectionObserver — tracks which section is currently most
    // visible. As the user scrolls, the active dot updates.
    const sectionEls = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio that's
        // intersecting; set that as active.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = sectionEls.findIndex((el) => el === visible.target);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      {
        // Section is "active" when at least 30% of it is visible.
        threshold: [0.3, 0.5, 0.7],
        rootMargin: "-15% 0px -25% 0px",
      },
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Use native scroll — Lenis handles the smoothing on a wrapped page
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      aria-label="Codex section navigation"
      className="fixed right-6 sm:right-8 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3"
    >
      {sections.map((section, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className="group relative flex items-center justify-end"
            aria-label={`Jump to ${section.label}`}
            aria-current={active ? "true" : undefined}
          >
            {/* Hover label — appears to the left of the dot */}
            <span
              className="absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium"
              style={{ fontFamily: "DM Sans, Inter, sans-serif" }}
            >
              {section.label}
            </span>
            {/* The dot itself — active = larger + coral, inactive = small + faint */}
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: active ? 8 : 6,
                height: active ? 8 : 6,
                backgroundColor: active
                  ? "hsl(15 88% 60%)"
                  : "rgba(10, 18, 34, 0.25)",
                boxShadow: active
                  ? "0 0 12px hsl(15 88% 60% / 0.4)"
                  : "none",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
};

export default MdlsPageProgress;
