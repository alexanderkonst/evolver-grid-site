import type { CSSProperties, ReactNode } from "react";

/**
 * Founder Cockpit building blocks. Colour comes from the semantic tokens in
 * src/styles/theme-tokens.css (--surface-*, --text-*, --accent-*, --cta-*) and the
 * RGB triples (--ink-rgb, --accent-rgb) every skin maps; nothing here names a colour,
 * so Lunar, Aurum and the rest each render their own palette.
 */

export type LayerId = "identity" | "flow" | "delivery" | "return" | "operations";

export const LAYERS: Array<{ id: LayerId; label: string; question: string }> = [
  { id: "identity", label: "Identity", question: "Who am I, what do I sell?" },
  { id: "flow", label: "Flow", question: "Who is coming to me, and where do they stop?" },
  { id: "delivery", label: "Delivery", question: "Who am I serving right now, and what is their next step?" },
  { id: "return", label: "Return", question: "What came back?" },
  { id: "operations", label: "Operations", question: "What waits on me, and what is the agent doing?" },
];

export const ink = (alpha: number) => `rgba(var(--ink-rgb), ${alpha})`;
export const accentTint = (alpha: number) => `rgba(var(--accent-rgb), ${alpha})`;

export const text = {
  primary: { color: "var(--text-primary)" } satisfies CSSProperties,
  body: { color: "var(--text-body)" } satisfies CSSProperties,
  muted: { color: "var(--text-muted)" } satisfies CSSProperties,
  faint: { color: "var(--text-faint)" } satisfies CSSProperties,
  accent: { color: "var(--accent-text)" } satisfies CSSProperties,
};

/** A quiet inset surface inside a card (rows, ladder steps, notices). */
export const inset: CSSProperties = {
  background: ink(0.05),
  border: `1px solid ${ink(0.1)}`,
};

/** Dashed / error-toned notice that still reads on every skin. */
export const notice: CSSProperties = {
  background: ink(0.04),
  border: `1px dashed ${ink(0.22)}`,
  color: "var(--text-muted)",
};

/** Secondary pill button. */
export const pillButton = (active: boolean): CSSProperties =>
  active
    ? {
        color: "var(--accent-text)",
        background: "var(--surface-selected)",
        border: "1px solid var(--surface-selected-border)",
      }
    : {
        color: "var(--text-muted)",
        background: "transparent",
        border: `1px solid ${ink(0.16)}`,
      };

/** Primary action: the skin's CTA tokens. */
export const ctaStyle: CSSProperties = {
  background: "var(--cta-bg)",
  color: "var(--cta-text)",
  border: "1px solid var(--cta-border)",
  boxShadow: "var(--cta-shadow)",
};

/** Glass card with a soft sheen edge. At most one glowing element per card. */
export function Card({
  children,
  className = "",
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
}) {
  return (
    <Tag
      {...rest}
      className={`relative overflow-hidden rounded-[18px] p-5 ${className}`}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-card-border)",
        boxShadow: "var(--surface-card-shadow)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[18px]"
        style={{
          padding: 1,
          background: `linear-gradient(120deg, ${accentTint(0.35)}, ${ink(0.08)} 35%, ${ink(0.1)} 60%, ${accentTint(0.05)})`,
          WebkitMask: "linear-gradient(black 0 0) content-box, linear-gradient(black 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(black 0 0) content-box, linear-gradient(black 0 0)",
          maskComposite: "exclude",
        }}
      />
      <div className="relative">{children}</div>
    </Tag>
  );
}

/** One of the five layer cards: title, tag line, the question it answers, then its answer. */
export function LayerCard({
  layer,
  tag,
  className = "",
  children,
}: {
  layer: LayerId;
  tag: string;
  className?: string;
  children: ReactNode;
}) {
  const meta = LAYERS.find((item) => item.id === layer)!;
  return (
    <Card className={className} id={`cockpit-layer-${layer}`}>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-serif text-2xl font-medium" style={text.primary}>
          {meta.label}
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={text.accent}>
          {tag}
        </span>
      </div>
      <p className="mb-4 text-[13px]" style={text.faint}>
        {meta.question}
      </p>
      {children}
    </Card>
  );
}

/** A figure with a label (ladder step, queue count). `hot` marks the one that matters. */
export function Tile({ value, label, hot = false }: { value: string; label: string; hot?: boolean }) {
  return (
    <div
      className="min-w-0 flex-1 rounded-xl px-2 py-2.5 text-center"
      style={{
        ...inset,
        ...(hot ? { border: "1px solid var(--surface-selected-border)", boxShadow: `0 0 18px -6px ${accentTint(0.6)}` } : null),
      }}
    >
      <b className="block font-serif text-[22px] font-medium" style={hot ? text.accent : text.primary}>
        {value}
      </b>
      <small className="text-[10.5px] uppercase tracking-[0.08em]" style={text.muted}>
        {label}
      </small>
    </div>
  );
}

/** Missing value: an em dash, never a made-up number. */
export const fmtCount = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? String(value) : "—");

export const fmtUsd = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? `$${value.toLocaleString("en-US")}` : "—";

export const fmtAsOf = (value?: string | null) => {
  if (!value) return "date not in data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date not in data";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};
