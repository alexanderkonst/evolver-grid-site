// Daily agent cycle operations for equilibrium-agent-write (issue #90).
//
// Sibling module with no remote imports, same shape as parked.ts, so vitest can
// exercise it against an in-memory client
// (src/modules/equilibrium/__tests__/agentCockpit.test.ts). index.ts handles
// the token gate, idempotency and audit log; it calls these with the raw
// payload. `readCockpitSettings` tolerates the tables not existing yet so
// read_state keeps working if the function ships before the migration.

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;
// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

export const DEFAULT_COCKPIT_SETTINGS = {
  agents_paused: false,
  digest_time: "08:00",
  timezone: "America/Mexico_City",
} as const;

export const DIGEST_SECTIONS = ["moved", "waiting", "outbox"] as const;
export type DigestSection = (typeof DIGEST_SECTIONS)[number];
export const MAX_DIGEST_ITEMS = 50;

export interface DigestItem {
  section: DigestSection;
  text: string;
  ref?: string;
}

function isMissingTable(error: Row) {
  return error.code === "42P01" || error.code === "PGRST205" ||
    /does not exist|schema cache/i.test(String(error.message ?? ""));
}

export function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

// Calendar day (YYYY-MM-DD) of `nowMs` in the given IANA timezone.
export function localDate(nowMs: number, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(nowMs));
}

export function cleanDigestDate(value: unknown, field = "payload.date") {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    throw new Error(`${field} must be a YYYY-MM-DD date.`);
  }
  const text = value.trim();
  const parsed = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new Error(`${field} must be a valid date.`);
  }
  return text;
}

export function cleanDigestItems(value: unknown, field = "payload.items"): DigestItem[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  if (value.length > MAX_DIGEST_ITEMS) {
    throw new Error(`${field} is too long: at most ${MAX_DIGEST_ITEMS} items.`);
  }
  return value.map((raw, index) => {
    const at = `${field}[${index}]`;
    if (!raw || typeof raw !== "object") throw new Error(`${at} must be an object.`);
    const { section, text, ref } = raw as Row;
    if (typeof section !== "string" || !(DIGEST_SECTIONS as readonly string[]).includes(section)) {
      throw new Error(`${at}.section must be one of: ${DIGEST_SECTIONS.join(", ")}.`);
    }
    if (typeof text !== "string" || !text.trim()) throw new Error(`${at}.text cannot be empty.`);
    if (text.trim().length > 500) throw new Error(`${at}.text is too long.`);
    const item: DigestItem = { section: section as DigestSection, text: text.trim() };
    if (typeof ref === "string" && ref.trim()) {
      if (ref.trim().length > 2000) throw new Error(`${at}.ref is too long.`);
      item.ref = ref.trim();
    }
    return item;
  });
}

// Settings for the owner; defaults when there is no row (or no table yet).
export async function readCockpitSettings(admin: SupabaseAdmin, userId: string) {
  const { data, error } = await admin
    .from("cockpit_settings")
    .select("agents_paused, digest_time, timezone, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return { ...DEFAULT_COCKPIT_SETTINGS, updated_at: null };
    throw new Error(`Could not read cockpit settings: ${error.message}`);
  }
  return {
    agents_paused: data?.agents_paused ?? DEFAULT_COCKPIT_SETTINGS.agents_paused,
    digest_time: data?.digest_time ?? DEFAULT_COCKPIT_SETTINGS.digest_time,
    timezone: data?.timezone ?? DEFAULT_COCKPIT_SETTINGS.timezone,
    updated_at: data?.updated_at ?? null,
  };
}

// Upserts the digest for `date` (default: today in the owner's timezone), so
// an agent that runs twice in a day replaces rather than duplicates.
export async function writeDigest(
  admin: SupabaseAdmin,
  userId: string,
  params: { summaryMd: string; items: DigestItem[]; date?: string; nowMs: number; dryRun: boolean },
) {
  const { summaryMd, items, dryRun } = params;
  const settings = await readCockpitSettings(admin, userId);
  const timezone = isValidTimezone(settings.timezone) ? settings.timezone : DEFAULT_COCKPIT_SETTINGS.timezone;
  const date = params.date ?? localDate(params.nowMs, timezone);

  let digestId = "dry-run-digest-id";
  if (!dryRun) {
    const { data, error } = await admin
      .from("cockpit_digests")
      .upsert(
        { user_id: userId, date, summary_md: summaryMd, items },
        { onConflict: "user_id,date" },
      )
      .select("id")
      .single();
    if (error) throw new Error(`Could not write digest: ${error.message}`);
    digestId = data?.id ?? digestId;
  }

  const outbox = items.filter((item) => item.section === "outbox").length;
  return {
    result: {
      target: "cockpit_digests",
      digest_id: digestId,
      date,
      item_count: items.length,
      outbox_count: outbox,
      written: !dryRun,
    },
    summary: `wrote digest for ${date}`,
  };
}
