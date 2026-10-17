// Parked-section operations for equilibrium-agent-write (issue #66).
//
// Kept in a sibling module with no remote imports so vitest can exercise it
// against an in-memory client (src/modules/equilibrium/__tests__/agentParked.test.ts).
// index.ts validates raw payloads with its shared helpers, then calls these
// with clean values. Each mutator returns `{ result, summary }` and honors
// `dryRun` (reads and validation happen, writes do not).

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;

export const PARKED_KINDS = ["strategy", "workstream", "task", "idea"] as const;
export type ParkedKind = (typeof PARKED_KINDS)[number];
export const MAX_PARKED_READ = 50;

export function cleanParkedKind(value: unknown): ParkedKind {
  if (typeof value !== "string" || !(PARKED_KINDS as readonly string[]).includes(value)) {
    throw new Error(`payload.kind must be one of: ${PARKED_KINDS.join(", ")}.`);
  }
  return value as ParkedKind;
}

// A strategy has no title of its own: use the first line, trimmed to 120
// chars, so the parked list stays scannable. The full text goes in `body`.
export function titleFromStrategyText(text: string) {
  const firstLine = text.trim().split("\n")[0].trim();
  return firstLine.length > 120 ? `${firstLine.slice(0, 117).trimEnd()}...` : firstLine;
}

export async function parkStrategy(
  admin: SupabaseAdmin,
  userId: string,
  params: { position: number; agentName: string; dryRun: boolean },
) {
  const { position, agentName, dryRun } = params;
  const { data: strategy, error: readError } = await admin
    .from("equilibrium_strategies")
    .select("position, text, alignment_score")
    .eq("user_id", userId)
    .eq("position", position)
    .maybeSingle();
  if (readError) throw new Error(`Could not read strategy: ${readError.message}`);
  if (!strategy) throw new Error(`Strategy not found at position ${position}.`);

  const row = {
    user_id: userId,
    kind: "strategy" as const,
    title: titleFromStrategyText(String(strategy.text ?? "")),
    body: strategy.text,
    source_position: strategy.position,
    alignment_score: strategy.alignment_score ?? null,
    parked_by: agentName,
  };

  let parkedId: string = "dry-run-parked-id";
  if (!dryRun) {
    const { data: created, error: insertError } = await admin
      .from("equilibrium_parked")
      .insert(row)
      .select("id")
      .single();
    if (insertError) throw new Error(`Could not park strategy: ${insertError.message}`);
    parkedId = created.id;

    const { error: deleteError } = await admin
      .from("equilibrium_strategies")
      .delete()
      .eq("user_id", userId)
      .eq("position", position);
    if (deleteError) {
      // Copy succeeded but the slot could not be freed: roll the copy back so
      // the strategy is not duplicated across both tables.
      await admin.from("equilibrium_parked").delete().eq("id", parkedId).eq("user_id", userId);
      throw new Error(`Could not free strategy slot: ${deleteError.message}`);
    }
  }

  return {
    result: {
      target: "equilibrium_parked",
      parked_id: parkedId,
      kind: "strategy",
      source_position: position,
      title: row.title,
      parked: !dryRun,
    },
    summary: `parked strategy ${position}`,
  };
}

export async function parkItem(
  admin: SupabaseAdmin,
  userId: string,
  params: { kind: ParkedKind; title: string; body?: string; agentName: string; dryRun: boolean },
) {
  const { kind, title, body, agentName, dryRun } = params;
  let parkedId: string = "dry-run-parked-id";
  if (!dryRun) {
    const { data: created, error } = await admin
      .from("equilibrium_parked")
      .insert({ user_id: userId, kind, title, body: body ?? null, parked_by: agentName })
      .select("id")
      .single();
    if (error) throw new Error(`Could not park item: ${error.message}`);
    parkedId = created.id;
  }
  return {
    result: { target: "equilibrium_parked", parked_id: parkedId, kind, title, parked: !dryRun },
    summary: `parked ${kind} "${title}"`,
  };
}

export async function unparkStrategy(
  admin: SupabaseAdmin,
  userId: string,
  params: { parkedId: string; position?: number; dryRun: boolean },
) {
  const { parkedId, dryRun } = params;
  const { data: parked, error: readError } = await admin
    .from("equilibrium_parked")
    .select("id, kind, title, body, source_position, alignment_score")
    .eq("id", parkedId)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw new Error(`Could not read parked item: ${readError.message}`);
  if (!parked) throw new Error("Parked item not found for this user.");
  if (parked.kind !== "strategy") {
    throw new Error(`Cannot unpark a ${parked.kind} as a strategy: only kind 'strategy' can be restored.`);
  }

  const position = params.position ?? parked.source_position;
  if (!Number.isInteger(position) || position < 1 || position > 3) {
    throw new Error("payload.position is required (integer from 1 to 3) when the parked strategy has no source position.");
  }
  const text = String(parked.body ?? parked.title ?? "").trim();
  if (!text) throw new Error("Parked strategy has no text to restore.");

  if (!dryRun) {
    const { error: upsertError } = await admin
      .from("equilibrium_strategies")
      .upsert({
        user_id: userId,
        position,
        text,
        alignment_score: parked.alignment_score ?? null,
        set_at: new Date().toISOString(),
      }, { onConflict: "user_id,position" });
    if (upsertError) throw new Error(`Could not restore strategy: ${upsertError.message}`);

    const { error: deleteError } = await admin
      .from("equilibrium_parked")
      .delete()
      .eq("id", parkedId)
      .eq("user_id", userId);
    if (deleteError) throw new Error(`Could not remove restored item from parked: ${deleteError.message}`);
  }

  return {
    result: {
      target: "equilibrium_strategies",
      parked_id: parkedId,
      position,
      text,
      restored: !dryRun,
    },
    summary: `restored parked strategy to position ${position}`,
  };
}

// Newest first, limit 50. Tolerates the table not existing yet so read_state
// keeps working if the function is deployed before the migration is applied.
export async function readParked(admin: SupabaseAdmin, userId: string) {
  const { data, error } = await admin
    .from("equilibrium_parked")
    .select("id, kind, title, body, parked_at")
    .eq("user_id", userId)
    .order("parked_at", { ascending: false })
    .limit(MAX_PARKED_READ);
  if (error) {
    const missingTable = error.code === "42P01" || error.code === "PGRST205" ||
      /does not exist|schema cache/i.test(String(error.message ?? ""));
    if (missingTable) return [];
    throw new Error(`Could not read parked: ${error.message}`);
  }
  return (Array.isArray(data) ? data : []).map((row: any) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body ?? null,
    parked_at: row.parked_at,
  }));
}
