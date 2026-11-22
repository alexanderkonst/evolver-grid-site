/**
 * Small shared pieces of the circle screens: a face, a row of faces, the kind chip, the moon
 * mark, a toast-free copy-link helper. No numbers appear here except where the caller passes
 * a real act ("3 going" for the host).
 */
import { Link } from "react-router-dom";
import { Moon } from "lucide-react";
import { KIND_LABEL } from "@/data/circlesCopy";
import { kindOf, type CircleKind, type MoonMark } from "@/lib/circles";
import type { CirclePerson } from "@/lib/circlesApi";

export const cardClass =
  "rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm shadow-[0_4px_16px_rgba(44,49,80,0.06)]";

export const profilePath = (userId: string) => `/profile/${userId}`;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

interface FaceProps {
  userId: string;
  name: string;
  avatarUrl: string | null;
  /** Hidden profiles get no link: there is no profile page to open. */
  linked?: boolean;
  size?: "sm" | "md";
}

/** A real player's face. Links to their profile (A6) when the profile is public. */
export const Face = ({ userId, name, avatarUrl, linked = true, size = "md" }: FaceProps) => {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  const inner = (
    <span className={`${dim} shrink-0 rounded-full bg-muted overflow-hidden inline-flex items-center justify-center font-semibold text-muted-foreground`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        initials(name) || "·"
      )}
    </span>
  );
  return linked ? (
    <Link to={profilePath(userId)} title={name} aria-label={name} onClick={(e) => e.stopPropagation()}>
      {inner}
    </Link>
  ) : (
    <span title={name} aria-label={name}>
      {inner}
    </span>
  );
};

export const PersonFace = ({ person, size }: { person: CirclePerson; size?: "sm" | "md" }) => (
  <Face userId={person.userId} name={person.name} avatarUrl={person.avatarUrl} linked={person.faceVisible} size={size} />
);

export const PersonName = ({ person }: { person: CirclePerson }) =>
  person.faceVisible ? (
    <Link to={profilePath(person.userId)} className="font-medium text-foreground hover:underline">
      {person.name}
    </Link>
  ) : (
    <span className="font-medium text-foreground">{person.name}</span>
  );

export const KindChip = ({ kind }: { kind: CircleKind | string | null | undefined }) => (
  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
    {KIND_LABEL[kindOf(kind)]}
  </span>
);

/** A small moon beside a new or full moon date (A9 Equilibrium clock); full moon = Harvest. */
export const MoonBadge = ({ mark }: { mark: MoonMark }) =>
  mark ? (
    <span
      className="inline-flex items-center gap-1 text-xs text-muted-foreground"
      title={mark === "full" ? "Full moon" : "New moon"}
    >
      <Moon className={`w-3.5 h-3.5 ${mark === "full" ? "fill-current" : ""}`} aria-hidden />
      <span className="sr-only">{mark === "full" ? "Full moon" : "New moon"}</span>
    </span>
  ) : null;

/** Copy a circle link; resolves true when the clipboard took it. */
export async function copyCircleLink(id: string): Promise<boolean> {
  const url = `${window.location.origin}/game/meet/${id}`;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
