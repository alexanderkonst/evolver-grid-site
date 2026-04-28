/**
 * ImproveReviewDrawer — the rite of judgment.
 *
 * Shows the proposed improvement from the Improve button. The founder
 * reads what the 27-perspective roast found, sees the before/after,
 * decides: keep this version, or reject and try again.
 *
 * Desktop: right-side sheet. Mobile: bottom sheet.
 *
 * Day 53 (Sasha 2026-04-27): full editorial re-skin. Drawer body is
 * now liquid-glass-dark (the dark editorial register used elsewhere
 * for decision rooms — /ignite, dossier review, etc.). Cormorant
 * headers, gold ✦ ornaments on quadrant labels, semantic accept/reject
 * pills (gold for accept, soft navy for reject). The before/after
 * blocks render as illuminated glass panels rather than raw JSON dumps.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Check, X } from "lucide-react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { SpecificityBadge } from "./SpecificityBadge";
import { ARTIFACT_LABELS } from "../constants";
import type { RoastQuadrant } from "../types";

const QUADRANT_LABELS: Record<RoastQuadrant, string> = {
  UL: "Soul · does it feel true from the inside?",
  UR: "Engineering · does it work mechanically?",
  LL: "Resonance · would the tribe recognize themselves?",
  LR: "Architecture · does it serve at scale?",
  "13": "Center · does the whole see what the parts missed?",
  depth: "Depth · Essence → Significance → Implications balance",
  "27": "Crystallization · the one irreversible action named?",
};

export function ImproveReviewDrawer() {
  const { pendingImprovement, acceptImprovement, rejectImprovement, artifacts } = useUniqueBusiness();

  const open = !!pendingImprovement;
  const pending = pendingImprovement;
  const current = pending ? artifacts[pending.artifact_key]?.latest : null;

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && pending) rejectImprovement();
      }}
    >
      <SheetContent
        className="liquid-glass-dark w-full overflow-y-auto sm:max-w-[520px]"
        style={{
          // Override shadcn Sheet's white bg — we want the dark glass
          // body so the drawer reads as the decision room, not a
          // settings dialog.
          background: "rgba(10, 18, 34, 0.78)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          color: "rgba(245, 241, 232, 0.94)",
          border: "0.5px solid rgba(212, 175, 55, 0.28)",
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.18), 0 24px 60px -18px rgba(10, 22, 40, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.18)",
        }}
      >
        {pending && (
          <>
            {/* ═══ Header ═══ */}
            <SheetHeader className="space-y-3 pr-8">
              <SheetTitle asChild>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    style={{
                      color: "#f4d472",
                      textShadow: "0 0 14px rgba(244,212,114,0.7), 0 0 4px rgba(212,175,55,0.9)",
                      fontSize: "18px",
                    }}
                  >
                    ✦
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 600,
                      fontSize: "22px",
                      letterSpacing: "-0.005em",
                      color: "rgba(245, 241, 232, 0.96)",
                    }}
                  >
                    {/* Day 53 night iter 2: was "Improvement proposed" —
                        Microsoft-y. "A sharper version" is brand-coherent
                        (specificity vocabulary) and reads like a pull quote
                        rather than a software notification. */}
                    A sharper version
                  </span>
                </div>
              </SheetTitle>
              <SheetDescription asChild>
                <div
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontStyle: "italic",
                    fontSize: "14.5px",
                    color: "rgba(245, 241, 232, 0.72)",
                  }}
                >
                  {ARTIFACT_LABELS[pending.artifact_key]}
                </div>
              </SheetDescription>
              <div className="pt-1">
                <SpecificityBadge
                  score={pending.result.specificity_score}
                  delta={pending.result.specificity_delta}
                />
              </div>
            </SheetHeader>

            {/* ═══ Body sections ═══ */}
            <section className="mt-7 space-y-6">
              {/* What the roast found */}
              <div>
                <SectionLabel>What the roast found</SectionLabel>
                <ul className="mt-3 space-y-3">
                  {pending.result.roast_findings.map((f, i) => (
                    <li key={i}>
                      <div
                        className="flex items-baseline gap-2"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "11.5px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#f4d472",
                          fontWeight: 600,
                        }}
                      >
                        <span aria-hidden="true" style={{ fontSize: "10px", opacity: 0.85 }}>✦</span>
                        {QUADRANT_LABELS[f.quadrant as RoastQuadrant] || f.quadrant}
                      </div>
                      <div
                        className="mt-1"
                        style={{
                          fontFamily: "'Source Serif 4', serif",
                          fontSize: "14.5px",
                          lineHeight: 1.55,
                          color: "rgba(245, 241, 232, 0.92)",
                        }}
                      >
                        {f.weakness}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What changed */}
              {pending.result.what_changed && (
                <div>
                  <SectionLabel>What changed</SectionLabel>
                  <p
                    className="mt-2"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontSize: "14.5px",
                      lineHeight: 1.55,
                      color: "rgba(245, 241, 232, 0.85)",
                    }}
                  >
                    {pending.result.what_changed}
                  </p>
                </div>
              )}

              {/* Before / After — Day 53 night iter 2 (Sasha 2026-04-27):
                  was rendering raw JSON.stringify. Founders couldn't read
                  the proposed change easily — cryptic key-value dump. Now
                  uses DarkContentRenderer which parallels the cream
                  ArtifactContentView in GenericArtifactScreen but tuned
                  for the dark drawer body (gold labels, cream-on-navy
                  prose, gold middot bullets). Comparing Before to After
                  is now a comparison of legible content, not of JSON. */}
              <div className="space-y-4">
                <div>
                  <SectionLabel muted>Before</SectionLabel>
                  <div
                    className="mt-2 overflow-x-auto rounded-xl px-4 py-3.5"
                    style={{
                      background: "rgba(245, 241, 232, 0.04)",
                      border: "0.5px solid rgba(245, 241, 232, 0.10)",
                    }}
                  >
                    <DarkContentRenderer content={current?.content ?? null} muted />
                  </div>
                </div>
                <div>
                  <SectionLabel>After</SectionLabel>
                  <div
                    className="mt-2 overflow-x-auto rounded-xl px-4 py-3.5"
                    style={{
                      background: "rgba(244, 212, 114, 0.06)",
                      border: "0.5px solid rgba(244, 212, 114, 0.32)",
                      boxShadow: "inset 0 0 18px -8px rgba(244, 212, 114, 0.20)",
                    }}
                  >
                    <DarkContentRenderer content={pending.result.improved_content} />
                  </div>
                </div>
              </div>

              {/* Crystallized action */}
              {pending.result.crystallized_action && (
                <div
                  className="rounded-xl px-4 py-3.5"
                  style={{
                    background: "rgba(244, 212, 114, 0.06)",
                    border: "0.5px solid rgba(244, 212, 114, 0.40)",
                    boxShadow: "0 0 22px -8px rgba(244, 212, 114, 0.32)",
                  }}
                >
                  <SectionLabel>Next irreversible action</SectionLabel>
                  <div
                    className="mt-1.5"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontSize: "15px",
                      lineHeight: 1.55,
                      color: "rgba(245, 241, 232, 0.96)",
                    }}
                  >
                    {pending.result.crystallized_action}
                  </div>
                </div>
              )}
            </section>

            {/* ═══ Decision row ═══ */}
            <div className="mt-9 flex gap-3">
              <button
                onClick={rejectImprovement}
                className="group flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 transition-all duration-200 hover:translate-y-[-0.5px]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "12.5px",
                  color: "rgba(245, 241, 232, 0.78)",
                  background: "rgba(245, 241, 232, 0.04)",
                  border: "0.5px solid rgba(245, 241, 232, 0.20)",
                }}
              >
                {/* Day 53 night iter 2: "Reject" was adversarial — the
                    AI's roast is a best-effort gift, not a proposal to
                    refute. "Discard" is neutral, accurate, lower-stakes:
                    "I don't keep this one; I'll press Improve again." */}
                <X className="h-4 w-4" aria-hidden="true" />
                Discard
              </button>
              <button
                onClick={acceptImprovement}
                className="group flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 transition-all duration-300 hover:translate-y-[-1px]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "12.5px",
                  color: "rgba(245, 241, 232, 0.98)",
                  background: "linear-gradient(135deg, rgba(212, 175, 55, 0.42) 0%, rgba(244, 212, 114, 0.32) 50%, rgba(212, 175, 55, 0.42) 100%)",
                  border: "0.5px solid rgba(244, 212, 114, 0.85)",
                  boxShadow:
                    "inset 0 1px 0 0 rgba(255, 255, 255, 0.30), 0 0 22px -4px rgba(244, 212, 114, 0.55), 0 0 48px -12px rgba(212, 175, 55, 0.40)",
                  textShadow: "0 0 14px rgba(244, 212, 114, 0.55)",
                }}
              >
                <Check className="h-4 w-4" aria-hidden="true" style={{ color: "#fff8e0" }} />
                Accept
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ─── Dark content renderer ──────────────────────────────────────── */
//
// Renders artifact content for the dark drawer body. Parallels the cream
// ArtifactContentView in GenericArtifactScreen but tuned for navy bg:
// gold tracked-uppercase labels, cream-on-navy Source Serif prose, gold
// middot bullets. Strips protocol tracer fields (_energies, _distillation)
// from the public render — they're audit trail, not human-facing.
//
// `muted` flag: when true (Before panel), prose color drops to a faded
// cream so the After panel reads as the brighter, "active" version.

function DarkContentRenderer({
  content,
  muted = false,
}: {
  content: unknown;
  muted?: boolean;
}) {
  const proseColor = muted ? "rgba(245, 241, 232, 0.62)" : "rgba(245, 241, 232, 0.92)";
  const labelColor = muted ? "rgba(245, 241, 232, 0.45)" : "#f4d472";
  const labelShadow = muted ? "none" : "0 0 8px rgba(244, 212, 114, 0.30)";

  if (content === null || content === undefined) {
    return (
      <div
        className="italic"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "13.5px",
          color: "rgba(245, 241, 232, 0.45)",
        }}
      >
        (empty)
      </div>
    );
  }
  if (typeof content === "string") {
    return (
      <div
        className="whitespace-pre-wrap"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: proseColor,
        }}
      >
        {content}
      </div>
    );
  }
  if (typeof content === "object") {
    return (
      <div className="space-y-3">
        {Object.entries(content as Record<string, unknown>).map(([k, v]) => {
          if (k.startsWith("_")) return null; // strip tracer fields
          return (
            <div key={k}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "10.5px",
                  letterSpacing: "0.20em",
                  textTransform: "uppercase",
                  color: labelColor,
                  textShadow: labelShadow,
                }}
              >
                {k.replace(/[_-]+/g, " ")}
              </div>
              <div className="mt-1">{darkRenderValue(v, proseColor)}</div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ fontFamily: "'Source Serif 4', serif", color: proseColor }}>
      {String(content)}
    </div>
  );
}

function darkRenderValue(v: unknown, proseColor: string): React.ReactNode {
  const proseStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontSize: "14px",
    lineHeight: 1.55,
    color: proseColor,
  };

  if (v === null || v === undefined) {
    return (
      <span
        className="italic"
        style={{ ...proseStyle, color: "rgba(245, 241, 232, 0.45)" }}
      >
        (empty)
      </span>
    );
  }
  if (typeof v === "string") {
    return <span className="whitespace-pre-wrap" style={proseStyle}>{v}</span>;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return (
      <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", ...proseStyle }}>
        {String(v)}
      </span>
    );
  }
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x === "string")) {
      return (
        <ul className="space-y-1 pl-0">
          {v.map((s, i) => (
            <li key={i} className="flex gap-2" style={proseStyle}>
              <span
                aria-hidden="true"
                className="flex-shrink-0"
                style={{
                  color: "#f4d472",
                  textShadow: "0 0 6px rgba(244,212,114,0.45)",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                ·
              </span>
              <span>{s as string}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div className="space-y-1.5">
        {v.map((x, i) => (
          <div
            key={i}
            className="rounded p-2"
            style={{ border: "0.5px solid rgba(245, 241, 232, 0.10)" }}
          >
            {darkRenderValue(x, proseColor)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof v === "object") {
    return (
      <div className="space-y-1.5">
        {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
          <div key={k}>
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 500,
                fontSize: "9.5px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(245, 241, 232, 0.55)",
              }}
            >
              {k.replace(/[_-]+/g, " ")}:
            </span>{" "}
            <span style={proseStyle}>{darkRenderValue(val, proseColor)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span style={proseStyle}>{String(v)}</span>;
}

/* ─── Section label helper ───────────────────────────────────────── */

function SectionLabel({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600,
        fontSize: "11px",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: muted ? "rgba(245, 241, 232, 0.55)" : "#f4d472",
        textShadow: muted ? "none" : "0 0 10px rgba(244, 212, 114, 0.35)",
      }}
    >
      {children}
    </div>
  );
}
