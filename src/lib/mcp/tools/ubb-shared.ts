import { z } from "zod";
import { ARTIFACT_LABELS } from "../../../modules/unique-business-builder/constants";
import { PROMPT_VERSION } from "../../../modules/unique-business-builder/promptVersions";
import { ALL_ARTIFACT_KEYS, type ArtifactKey } from "../../../modules/unique-business-builder/types";
import { ToolError, friendlyDbError, unwrap, type Db } from "./_shared";

/**
 * Server-side twin of the context the Unique Business Builder page assembles
 * in UniqueBusinessContext.tsx before it calls the generate-artifact /
 * improve-artifact edge functions: ZoG snapshot + mission + assets + the
 * founder's locked sibling artifacts. Reads are RLS-scoped to the caller.
 */

export const artifactTypeSchema = z
  .enum(ALL_ARTIFACT_KEYS as unknown as [ArtifactKey, ...ArtifactKey[]])
  .describe(
    "Artifact key. Canvas: uniqueness, myth, tribe, pain, promise, lead_magnet, value_ladder, specificity_matrix. Session: session_bridge. Market: core_belief, packaging, frictionless_purchase, reach, delivery, spread, surface_inventory, tuning_fork, golden_dm. Publication: landing_page.",
  );

export const languageSchema = z
  .string()
  .trim()
  .min(2)
  .max(10)
  .optional()
  .describe("Output language code (e.g. en, ru). Defaults to English.");

/** Row shape of public.user_business_artifacts as the UI reads it. */
export type ArtifactRow = {
  id: string;
  user_id: string;
  artifact_key: string;
  version: string;
  content: string | null;
  content_json: unknown;
  specificity_score: number | null;
  parent_version_id: string | null;
  roast_findings: unknown;
  what_changed: string | null;
  is_locked: boolean;
  step_number: number | null;
  created_at: string;
  updated_at?: string;
  prompt_version_at_lock?: string | null;
  input_version_at_lock?: string | null;
};

export function versionNumber(row: Pick<ArtifactRow, "version">): number {
  return parseInt(row.version?.replace(/\D/g, "") || "1", 10);
}

export function contentOf(row: ArtifactRow): unknown {
  return row.content_json ?? row.content ?? null;
}

/** All of the user's rows for the given keys, newest first. */
export async function loadArtifactRows(db: Db, userId: string, key?: ArtifactKey): Promise<ArtifactRow[]> {
  let query = db.from("user_business_artifacts").select("*").eq("user_id", userId);
  query = key
    ? query.eq("artifact_key", key)
    : query.in("artifact_key", ALL_ARTIFACT_KEYS as unknown as string[]);
  const rows = (unwrap(await query, "read the artifacts") ?? []) as ArtifactRow[];
  return [...rows].sort((a, b) => (b.created_at > a.created_at ? 1 : b.created_at < a.created_at ? -1 : 0));
}

export type ArtifactSummary = {
  type: ArtifactKey;
  label: string;
  status: "empty" | "draft" | "locked";
  latest_version: number | null;
  specificity: number | null;
  version_count: number;
  locked_version: number | null;
  /** A newer unlocked version exists on top of the locked one (the locked one is what feeds siblings). */
  has_unlocked_changes: boolean;
  updated_at: string | null;
  what_changed?: string | null;
  content?: unknown;
};

/** Group rows by artifact key into the per-artifact state the UI derives (latest + latest locked). */
export function summarizeArtifacts(rows: ArtifactRow[], includeContent: boolean): ArtifactSummary[] {
  return ALL_ARTIFACT_KEYS.map((key) => {
    const bucket = rows.filter((r) => r.artifact_key === key);
    const latest = bucket[0] ?? null;
    const locked = bucket.find((r) => r.is_locked) ?? null;
    const summary: ArtifactSummary = {
      type: key,
      label: ARTIFACT_LABELS[key],
      status: locked ? "locked" : latest ? "draft" : "empty",
      latest_version: latest ? versionNumber(latest) : null,
      specificity: latest ? Number(latest.specificity_score ?? 0) : null,
      version_count: bucket.length,
      locked_version: locked ? versionNumber(locked) : null,
      has_unlocked_changes: Boolean(locked && latest && latest.id !== locked.id),
      updated_at: latest?.updated_at ?? latest?.created_at ?? null,
    };
    if (includeContent && latest) {
      summary.what_changed = latest.what_changed;
      summary.content = contentOf(latest);
    }
    return summary;
  });
}

export type RootContext = {
  zog_snapshot: Record<string, unknown>;
  excalibur_data?: Record<string, unknown>;
  mission?: { sentence: string; discovered_at: string | null };
  assets?: {
    typeId: string;
    subTypeId: string | null;
    categoryId: string | null;
    title: string;
    description: string | null;
  }[];
};

/** The founder seed the edge functions expect. Missing pieces are simply omitted (graceful degradation, like the UI). */
export async function loadRootContext(db: Db, userId: string): Promise<RootContext> {
  const context: RootContext = { zog_snapshot: {} };

  const profile = unwrap(
    await db.from("game_profiles").select("id, mission_statement, mission_discovered_at").eq("user_id", userId).maybeSingle(),
    "read the profile",
  ) as { id?: string; mission_statement?: string | null; mission_discovered_at?: string | null } | null;

  if (profile?.id) {
    const snapshots = (unwrap(
      await db
        .from("zog_snapshots")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1),
      "read the Top Talent snapshot",
    ) ?? []) as Record<string, unknown>[];
    if (snapshots[0]) {
      context.zog_snapshot = snapshots[0];
      const excalibur = snapshots[0].excalibur_data;
      if (excalibur && typeof excalibur === "object") context.excalibur_data = excalibur as Record<string, unknown>;
    }
  }

  if (profile?.mission_statement) {
    context.mission = { sentence: profile.mission_statement, discovered_at: profile.mission_discovered_at ?? null };
  }

  const assetRows = (unwrap(
    await db.from("user_assets").select("type_id, sub_type_id, category_id, title, description").eq("user_id", userId),
    "read the assets",
  ) ?? []) as {
    type_id: string;
    sub_type_id: string | null;
    category_id: string | null;
    title: string;
    description: string | null;
  }[];
  if (assetRows.length > 0) {
    context.assets = assetRows.map((r) => ({
      typeId: r.type_id,
      subTypeId: r.sub_type_id,
      categoryId: r.category_id,
      title: r.title,
      description: r.description,
    }));
  }

  return context;
}

/** Locked artifacts other than `exclude`, in the shape the edge functions take as sibling context. */
export function siblingContext(rows: ArtifactRow[], exclude: ArtifactKey) {
  const out: Record<string, { content: unknown; specificity: number }> = {};
  for (const key of ALL_ARTIFACT_KEYS) {
    if (key === exclude) continue;
    const locked = rows.find((r) => r.artifact_key === key && r.is_locked);
    if (locked) out[key] = { content: contentOf(locked), specificity: Number(locked.specificity_score ?? 0) };
  }
  return out;
}

export function clampSpecificity(score: unknown): number {
  return Math.min(10, Math.max(0, Number(score) || 0));
}

const VERSION_COLUMNS = ["prompt_version_at_lock", "input_version_at_lock"] as const;

/**
 * Insert a new artifact version. Mirrors the UI's defensive bridge: if
 * PostgREST's schema cache does not know a stamp column yet, retry without it
 * (the row then carries NULL = "unknown", which staleness treats as no flag).
 */
export async function insertArtifactVersion(
  db: Db,
  payload: Record<string, unknown> & { artifact_key: ArtifactKey },
  action: string,
): Promise<ArtifactRow> {
  const attempt = (body: Record<string, unknown>) =>
    db.from("user_business_artifacts").insert(body).select("*").single();

  let res = await attempt(payload);
  if (res.error && /schema cache/i.test(String((res.error as { message?: string }).message ?? ""))) {
    const stripped = { ...payload };
    for (const col of VERSION_COLUMNS) delete stripped[col];
    res = await attempt(stripped);
  }
  if (res.error) throw new ToolError(friendlyDbError(res.error, action));
  return res.data as ArtifactRow;
}

export function promptVersionFor(key: ArtifactKey): string | null {
  return PROMPT_VERSION[key] ?? null;
}
