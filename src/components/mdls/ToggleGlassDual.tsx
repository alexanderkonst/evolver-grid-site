import { cn } from "@/lib/utils";

/**
 * MDLS · Toggle Glass Dual
 *
 * §9.7 Component Contracts. Binary toggle with sliding glass indicator.
 * Replacement for the existing WatchModeToggle (which used `.liquid-glass`
 * + dark navy pill). The MDLS version adds:
 *   • Coral accent dot under the active label (the "one coral per surface"
 *     attention marker — used for the watch-mode toggle).
 *   • Spring-easing transition on the sliding indicator (state-change motion).
 *   • Light + dark variants for substrate parity.
 *
 * Use the existing WatchModeToggle outside MDLS surfaces; this is the
 * MDLS-flagged variant.
 */
interface ToggleGlassDualOption<T extends string> {
  value: T;
  label: string;
  title?: string;
}

interface ToggleGlassDualProps<T extends string> {
  options: [ToggleGlassDualOption<T>, ToggleGlassDualOption<T>];
  value: T;
  onChange: (next: T) => void;
  variant?: "light" | "dark";
  showCoralDot?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const ToggleGlassDual = <T extends string>({
  options,
  value,
  onChange,
  variant = "light",
  showCoralDot = true,
  ariaLabel,
  className,
}: ToggleGlassDualProps<T>) => {
  const isRight = value === options[1].value;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "mdls-toggle-glass-dual",
        variant === "dark" && "mdls-toggle-glass-dual--dark",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mdls-toggle-glass-dual__indicator",
          isRight && "mdls-toggle-glass-dual__indicator--right",
        )}
      />
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            data-active={active ? "true" : undefined}
            className="mdls-toggle-glass-dual__option"
          >
            <span className="inline-flex items-center gap-1.5">
              {opt.label}
              {showCoralDot && active && (
                <span className="mdls-coral-dot" aria-hidden="true" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ToggleGlassDual;
