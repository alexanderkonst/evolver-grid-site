/**
 * Unique Business Builder — frontend mirror of inputVersionHash.
 *
 * Day 78 Phase 4b (Sasha 2026-05-29).
 *
 * MUST MATCH `supabase/functions/_shared/ubb-prompts.ts` byte-for-byte for
 * the hash to compare equal across runtimes (Deno edge + Vite browser).
 * Re-sync this file whenever the edge-side hash inputs change:
 *
 *   - ARTIFACT_INPUTS map
 *   - buildRootSummary composition order or separators
 *   - deepZogSummary / formatTopTalents / missionSummary / assetsSummary
 *     output shape or char budgets
 *   - ubbPromptHash impl
 *
 * Hash-input drift between the two files = silent false positives or false
 * negatives in the input-staleness compute. The Phase 4b smoke test should
 * catch obvious mismatches; subtler ones need a unit test (TBD).
 *
 * Why hand-maintained: same rationale as promptVersions.ts — we don't want
 * to import the full edge-side prompt corpus into the Vite bundle.
 */
import type { ArtifactKey } from "./types";

// ============================================================================
// Hash impl — identical to ubbPromptHash in ubb-prompts.ts (FNV-1a 64-bit).
// ============================================================================

const FNV_OFFSET_64 = 0xcbf29ce484222325n;
const FNV_PRIME_64 = 0x100000001b3n;
const FNV_MASK_64 = 0xffffffffffffffffn;

export function ubbPromptHash(canonical: string): string {
  let h = FNV_OFFSET_64;
  for (let i = 0; i < canonical.length; i++) {
    h ^= BigInt(canonical.charCodeAt(i));
    h = (h * FNV_PRIME_64) & FNV_MASK_64;
  }
  return h.toString(16).padStart(16, "0").slice(0, 12);
}

// ============================================================================
// Per-artifact inputsNeeded map — mirror of ARTIFACT_INPUTS in ubb-prompts.ts.
// ============================================================================

export type InputsNeeded = {
  zogHeadline?: boolean;
  zogDeep?: boolean;
  mission?: boolean;
  excalibur?: boolean;
  assets?: string[];
};

export const ARTIFACT_INPUTS: Record<ArtifactKey, InputsNeeded> = {
  uniqueness: { mission: false },
  myth: {},
  tribe: {},
  pain: { assets: ["experiences"] },
  promise: {},
  lead_magnet: { assets: ["ip", "expertise", "influence"] },
  value_ladder: { assets: ["ip", "expertise", "resources"] },
  specificity_matrix: {},
  session_bridge: { assets: ["expertise"] },
  core_belief: {},
  packaging: { assets: ["ip", "expertise"] },
  frictionless_purchase: { zogDeep: false, mission: false, assets: ["resources", "ip"] },
  reach: { zogDeep: false, assets: ["networks", "influence"] },
  delivery: { zogDeep: false, mission: false, assets: ["resources"] },
  spread: { zogDeep: false, assets: ["networks", "influence"] },
  surface_inventory: { zogDeep: false, mission: false, assets: ["influence", "networks"] },
  tuning_fork: { assets: ["influence"] },
  golden_dm: { assets: ["networks"] },
  landing_page: { assets: ["resources", "ip", "influence"] },
};

// ============================================================================
// Summarisers — copy the edge-side helpers verbatim so the strings hash equal.
// ============================================================================

export function formatTopTalents(value: unknown): string {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const items = value.slice(0, 3).map((v) => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        const candidate = o.name ?? o.title ?? o.label ?? o.text;
        if (typeof candidate === "string") return candidate;
        return JSON.stringify(v).slice(0, 80);
      }
      return String(v);
    });
    return items.join("; ");
  }
  return JSON.stringify(value).slice(0, 200);
}

type AppleseedShape = {
  bullseyeSentence?: string;
  vibrationalKey?: { name?: string; tagline?: string; tagline_simple?: string };
  threeLenses?: {
    actions?: string[];
    primeDriver?: string;
    primeDriver_meaning?: string;
    archetype?: string;
    archetype_meaning?: string;
  };
  appreciatedFor?: Array<{ effect?: string; scene?: string; outcome?: string }>;
  elevatorPitch?: string;
};

const DEEP_ZOG_MAX_CHARS = 900;

export function deepZogSummary(appleseed: unknown): string {
  if (!appleseed || typeof appleseed !== "object") return "";
  const a = appleseed as AppleseedShape;
  const lines: string[] = [];
  if (a.bullseyeSentence) lines.push(`- Bullseye: ${a.bullseyeSentence.slice(0, 200)}`);
  const vk = a.vibrationalKey;
  if (vk?.tagline || vk?.name) {
    const head = vk.name ? `${vk.name}: ` : "";
    const tagline = (vk.tagline ?? vk.tagline_simple ?? "").slice(0, 150);
    lines.push(`- Vibrational key: ${head}${tagline}`);
  }
  const tl = a.threeLenses;
  if (tl?.actions?.length) {
    const actions = tl.actions.slice(0, 3).map((s) => (s ?? "").slice(0, 80)).join("; ");
    lines.push(`- 3 actions in their zone: ${actions}`);
  }
  if (tl?.primeDriver) {
    const m = tl.primeDriver_meaning ? ` (${tl.primeDriver_meaning.slice(0, 80)})` : "";
    lines.push(`- Prime driver: ${tl.primeDriver.slice(0, 60)}${m}`);
  }
  if (tl?.archetype) {
    const m = tl.archetype_meaning ? ` (${tl.archetype_meaning.slice(0, 80)})` : "";
    lines.push(`- Archetype reading: ${tl.archetype.slice(0, 60)}${m}`);
  }
  if (a.appreciatedFor?.length) {
    const x = a.appreciatedFor[0];
    const effect = (x.effect ?? "?").slice(0, 80);
    const scene = (x.scene ?? "?").slice(0, 80);
    const outcome = (x.outcome ?? "?").slice(0, 100);
    lines.push(`- Appreciated-for scene: ${effect} in ${scene} -> ${outcome}`);
  }
  if (a.elevatorPitch) {
    lines.push(`- Elevator pitch: ${a.elevatorPitch.slice(0, 120)}`);
  }
  const out = lines.join("\n");
  return out.length > DEEP_ZOG_MAX_CHARS ? out.slice(0, DEEP_ZOG_MAX_CHARS) + "..." : out;
}

type MissionShape = { sentence?: string; discovered_at?: string | null };

export function missionSummary(mission: unknown): string {
  if (!mission || typeof mission !== "object") return "";
  const m = mission as MissionShape;
  if (!m.sentence) return "";
  const sentence = m.sentence.slice(0, 220);
  return `- Mission (the founder's declared 'what I am here to do'): ${sentence}`;
}

const ASSETS_MAX_CHARS = 1200;
const ASSETS_PER_TYPE_LIMIT = 5;

type AssetShape = {
  typeId?: string;
  subTypeId?: string;
  categoryId?: string;
  title?: string;
  description?: string;
};

export function assetsSummary(assets: unknown, filter?: string[]): string {
  if (!Array.isArray(assets) || assets.length === 0) return "";

  const byType = new Map<string, string[]>();
  for (const raw of assets) {
    if (!raw || typeof raw !== "object") continue;
    const a = raw as AssetShape;
    const type = a.typeId ?? "other";
    if (filter && !filter.includes(type)) continue;
    const title = (a.title ?? "").slice(0, 80);
    if (!title) continue;
    const desc = a.description ? `: ${a.description.slice(0, 100)}` : "";
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type)!.push(`${title}${desc}`);
  }

  if (byType.size === 0) return "";

  const lines: string[] = ["- Assets inventory (founder's concrete what-they-have):"];
  for (const [type, items] of byType.entries()) {
    const shown = items.slice(0, ASSETS_PER_TYPE_LIMIT);
    const more = items.length > ASSETS_PER_TYPE_LIMIT
      ? ` (+ ${items.length - ASSETS_PER_TYPE_LIMIT} more)`
      : "";
    lines.push(`  · ${type}: ${shown.join(" | ")}${more}`);
  }
  const out = lines.join("\n");
  return out.length > ASSETS_MAX_CHARS ? out.slice(0, ASSETS_MAX_CHARS) + "..." : out;
}

// ============================================================================
// buildRootSummary — composition order and separators must match the edge.
// ============================================================================

export type RootContextShape = {
  zog_snapshot?: Record<string, unknown>;
  excalibur_data?: Record<string, unknown>;
  mission?: { sentence: string; discovered_at: string | null };
  assets?: Array<{ typeId?: string; title?: string; description?: string | null }>;
};

export function buildRootSummary(
  rootContext: RootContextShape | undefined,
  inputs: InputsNeeded,
): string {
  const zog = rootContext?.zog_snapshot ?? {};
  const parts: string[] = [];

  if (inputs.zogHeadline !== false) {
    parts.push(`- Top talent: ${formatTopTalents((zog as any).top_three_talents)}`);
    parts.push(`- Archetype: ${(zog as any).archetype_title || "—"}`);
    parts.push(`- Core pattern: ${(zog as any).core_pattern || "—"}`);
  }
  if (inputs.zogDeep !== false) {
    const deep = deepZogSummary((zog as any).appleseed_data);
    if (deep) parts.push(deep);
  }
  if (inputs.mission !== false) {
    const m = missionSummary(rootContext?.mission);
    if (m) parts.push(m);
  }
  if (Array.isArray(inputs.assets) && inputs.assets.length > 0) {
    const a = assetsSummary(rootContext?.assets, inputs.assets);
    if (a) parts.push(a);
  }
  if (inputs.excalibur !== false && rootContext?.excalibur_data) {
    parts.push(`- Legacy business data: ${JSON.stringify(rootContext.excalibur_data).slice(0, 400)}`);
  }
  return parts.join("\n");
}

// ============================================================================
// Public entry — `inputVersionHash(rootContext, key)`.
// ============================================================================

export function inputVersionHash(
  rootContext: RootContextShape | undefined,
  key: ArtifactKey,
): string {
  const inputs = ARTIFACT_INPUTS[key];
  const summary = buildRootSummary(rootContext, inputs);
  return ubbPromptHash(summary);
}
