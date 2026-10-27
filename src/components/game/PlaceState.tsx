import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PlaceStateName } from "@/lib/placeState";
import "./PlaceState.css";

/**
 * PlaceState — one component that renders a place, room, quest or item in its
 * state (§14.3, §14.11 of docs/02-strategy/game_of_being_you.md). Pair it with
 * `placeState()` from src/lib/placeState.ts.
 *
 *   closed  faded scene (`--lock-filter`, `--lock-dim`), no motion, no action,
 *           one line: «Opens when <real event>. Inside: <result>.»
 *   open    full colour
 *   next    open + the accent marker (`--open-accent`) and the word «Next»
 *   done    open + «Done» (colour arrives per skin; Lunar maps it later)
 *   live    open + the live marker (`--live-accent`) and the word «Live»
 *
 * The state is exposed as `data-place-state` on the root so a skin (Lunar,
 * WP-2) can map it to `--place-saturation` / `--place-glow`. Closed also carries
 * `aria-disabled` and its line as text, so it is never colour-only.
 *
 * Anything that should fade when closed goes in `scene`, or gets the `ps-fade`
 * class. `action` (ENTER) is not rendered while closed.
 */

type PlaceStateProps = {
  state: PlaceStateName;
  /** Root element (default div). */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Art that fades while closed (scene image, tile content). */
  scene?: ReactNode;
  /** Wrap the content below the scene in a div with this class (place screens position it). */
  bodyClassName?: string;
  /** The one line, shown as text (closed line, live line). */
  line?: string;
  /** ENTER and friends. Not rendered while closed. */
  action?: ReactNode;
  /** Rendered last, in every state (e.g. a way to sign in). */
  after?: ReactNode;
  /** Show the state word (Next / Done / Live). Default true. */
  tag?: boolean;
  /**
   * Mark the root `aria-disabled`. Defaults to true while closed. Pass false where a closed
   * place still opens something (a map pin opens the faded scene).
   */
  disabled?: boolean;
  children?: ReactNode;
};

const TAG_TEXT: Record<PlaceStateName, string | null> = {
  closed: "Not open yet",
  open: null,
  next: "Next",
  done: "Done",
  live: "Live",
};

/** The state as a word. Closed is read by screen readers only (the line carries it visually). */
export const PlaceStateTag = ({ state, className }: { state: PlaceStateName; className?: string }) => {
  const text = TAG_TEXT[state];
  if (!text) return null;
  return (
    <span className={cn("ps-tag", `ps-tag--${state}`, className)} data-tag={state}>
      {text}
    </span>
  );
};

export const PlaceState = ({
  state,
  as: Tag = "div",
  className,
  style,
  scene,
  bodyClassName,
  line,
  action,
  after,
  tag = true,
  disabled,
  children,
}: PlaceStateProps) => {
  const closed = state === "closed";
  const isDisabled = disabled ?? closed;
  const content = (
    <>
      {children}
      {line ? <p className="ps-line">{line}</p> : null}
      {tag ? <PlaceStateTag state={state} /> : null}
      {closed ? null : action}
      {after}
    </>
  );
  return (
    <Tag
      className={cn("ps", className)}
      style={style}
      data-place-state={state}
      aria-disabled={isDisabled ? true : undefined}
      role={isDisabled && Tag === "div" ? "group" : undefined}
    >
      {scene != null ? <div className="ps-fade ps-scene">{scene}</div> : null}
      {bodyClassName ? <div className={bodyClassName}>{content}</div> : content}
    </Tag>
  );
};

export default PlaceState;
