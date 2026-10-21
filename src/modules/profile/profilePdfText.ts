/**
 * Pure text helpers for the Profile PDF (generateProfilePdf.ts). Kept free
 * of jsPDF / Supabase imports so they can be unit-tested and snapshotted
 * without a browser or a database.
 */

const ELLIPSIS = "…";

/**
 * Truncate `text` to at most `max` characters of content, cutting on a
 * word boundary and appending an ellipsis. Text that already fits is
 * returned unchanged (trimmed). A single word longer than `max` is
 * hard-cut, since there is no boundary to fall back to.
 */
export function truncateAtWord(text: string, max: number): string {
    const clean = text.trim();
    if (clean.length <= max) return clean;

    let cut = clean.slice(0, max);
    // If the character right after the cut is whitespace, the cut already
    // sits on a word boundary; otherwise back up to the previous space.
    if (!/\s/.test(clean.charAt(max))) {
        const lastSpace = cut.search(/\s\S*$/);
        if (lastSpace > 0) cut = cut.slice(0, lastSpace);
    }
    // Don't leave dangling punctuation before the ellipsis ("foo, …").
    cut = cut.replace(/[\s,;:\-–—]+$/, "");
    return cut + ELLIPSIS;
}

const normalize = (s: string): string => s.replace(/\s+/g, " ").trim().toLowerCase();

/** Strip a trailing ellipsis ("…" or "...") left by a save-time truncation. */
const stripEllipsis = (s: string): string => s.replace(/\s*(…|\.{3})\s*$/, "");

export interface AssetCardInput {
    title: string;
    description: string | null;
    source: string | null;
}

/**
 * Lines for one asset card. Asset titles are derived at save time from the
 * first sentence of the description (cut to 77 chars + "…"), so printing
 * title + description shows the same sentence twice. When the description
 * already starts with the title (truncated or not), print the description
 * alone; otherwise the title is a genuine separate label and leads.
 */
export function buildAssetCardLines(asset: AssetCardInput): string[] {
    const title = asset.title.trim();
    const description = asset.description?.trim() ?? "";
    const lines: string[] = [];

    const titleStem = normalize(stripEllipsis(title));
    const descriptionRepeatsTitle =
        description.length > 0 && titleStem.length > 0 && normalize(description).startsWith(titleStem);

    if (description && descriptionRepeatsTitle) {
        lines.push(description);
    } else {
        lines.push(title);
        if (description) lines.push(description);
    }
    if (asset.source) lines.push(`Source: ${asset.source}`);
    return lines;
}

/** Max chars of a mission statement shown in a history row. */
export const HISTORY_MISSION_MAX = 90;

const PREVIEW_FIELDS = [
    "tagline",
    "distillation",
    "statement",
    "line",
    "name",
    "description",
    "fullText",
    "text",
] as const;

/**
 * Best-effort readable text for a UBB artifact. Artifact shapes vary per
 * key (see supabase/functions/_shared/ubb-prompts.ts), so: plain string →
 * as is; object → first known headline field, then the first non-empty
 * string value. Returns null when nothing readable is found.
 */
export function artifactToText(content: unknown): string | null {
    if (typeof content === "string") return content.trim() || null;
    if (!content || typeof content !== "object") return null;
    const obj = content as Record<string, unknown>;
    for (const field of PREVIEW_FIELDS) {
        const v = obj[field];
        if (typeof v === "string" && v.trim()) return v.trim();
    }
    for (const v of Object.values(obj)) {
        if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
}
