/**
 * Mini-training 1 · AI as a Mirror: the profile fields a prompt is filled from.
 * Spec: docs/02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror.md (v0.6), «Profile fields used».
 *
 * A MirrorProfile holds only fields that HAVE a value. An empty field is simply absent, so a
 * prompt can drop its whole label line and never needs a stand-in.
 */
import { QOL_DOMAIN_COLUMNS, type QolStageColumns } from "@/lib/qolLevel";
import { DOMAINS, type DomainId } from "@/modules/quality-of-life-map/qolConfig";
import { TALENTS } from "@/modules/zone-of-genius/talents";

export type MirrorField =
  | "first_name"
  | "top_talents"
  | "archetype"
  | "mastery_action"
  | "mission"
  | "priority_area"
  | "weakest_area";

export type MirrorProfile = Partial<Record<MirrorField, string>>;

/** Raw rows as read from the three tables (all optional: any of them may be missing). */
export type MirrorSources = {
  game_profile?: {
    first_name?: unknown;
    mission_statement?: unknown;
    qol_priorities?: unknown;
  } | null;
  zog_snapshot?: {
    top_three_talents?: unknown;
    archetype_title?: unknown;
    mastery_action?: unknown;
  } | null;
  qol_snapshot?: Partial<QolStageColumns> | null;
};

/** Trim, collapse whitespace, strip a trailing period (the label adds its own). Empty -> "". */
export function cleanValue(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().replace(/\.+$/, "").trim();
}

const domainName = (id: unknown): string => {
  const domain = DOMAINS.find((d) => d.id === id);
  return domain ? domain.name.toLowerCase() : "";
};

/** `zog_snapshots.top_three_talents`: long-form strings today; talent ids in older rows. */
export function talentsText(raw: unknown): string {
  if (!Array.isArray(raw)) return "";
  return raw
    .map((item) => {
      if (typeof item === "string") return cleanValue(item);
      if (typeof item === "number") return cleanValue(TALENTS.find((t) => t.id === item)?.name);
      if (item && typeof item === "object") return cleanValue((item as { name?: unknown }).name);
      return "";
    })
    .filter(Boolean)
    .join("; ");
}

/**
 * Lowest stage of the 8 life areas. A tie for the lowest, or any missing stage, returns ""
 * (spec: «when several areas share the lowest stage, leave {weakest_area} out»; no invented
 * defaults, same rule as computeQolLevel).
 */
export function weakestAreaName(snapshot: Partial<QolStageColumns> | null | undefined): string {
  if (!snapshot) return "";
  const scored: { id: DomainId; score: number }[] = [];
  for (const [id, column] of Object.entries(QOL_DOMAIN_COLUMNS) as [DomainId, keyof QolStageColumns][]) {
    const score = snapshot[column];
    if (typeof score !== "number" || !Number.isFinite(score)) return "";
    scored.push({ id, score });
  }
  const lowest = Math.min(...scored.map((d) => d.score));
  const atLowest = scored.filter((d) => d.score === lowest);
  return atLowest.length === 1 ? domainName(atLowest[0].id) : "";
}

export function buildMirrorProfile(sources: MirrorSources): MirrorProfile {
  const gp = sources.game_profile;
  const zog = sources.zog_snapshot;
  const priorities = Array.isArray(gp?.qol_priorities) ? gp.qol_priorities : [];

  const fields: MirrorProfile = {
    first_name: cleanValue(gp?.first_name),
    top_talents: talentsText(zog?.top_three_talents),
    archetype: cleanValue(zog?.archetype_title),
    mastery_action: cleanValue(zog?.mastery_action),
    mission: cleanValue(gp?.mission_statement),
    priority_area: domainName(priorities[0]),
    weakest_area: weakestAreaName(sources.qol_snapshot),
  };
  // Keep only fields that have a value.
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v)) as MirrorProfile;
}

/** A fixture with some empty fields (no mastery action, a tie in the weakest area), for `?demo=1`. */
export const DEMO_MIRROR_PROFILE: MirrorProfile = {
  first_name: "Alex",
  top_talents: "Naming what is happening; Building the frame; Making it usable",
  archetype: "Experience-to-Direction Turning",
  mission: "Dedicate your life to helping people see their own pattern",
  priority_area: "health",
};
