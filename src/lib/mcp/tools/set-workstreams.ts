import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { WRITE_IDEMPOTENT, ToolError, normalizeText, runForUser, unwrap, type Db } from "./_shared";

/** Mirrors MAX_WORKSTREAMS in useEquilibriumV2 / equilibrium-agent-write. */
export const MAX_WORKSTREAMS = 3;

export const setWorkstreamsInput = {
  workstreams: z
    .array(z.string().trim().min(1).max(180))
    .max(MAX_WORKSTREAMS)
    .describe("Workstream titles in the order they should appear (at most 3). Existing titles are kept, new ones are created."),
  archive_unlisted: z
    .boolean()
    .default(false)
    .describe(
      "Archive active workstreams that are not in the list (soft, reversible in the app; their tasks are preserved). Default false: unlisted workstreams are left alone and reported.",
    ),
};

type WorkstreamRow = { id: string; title: string; position: number };

/**
 * Converge the active workstreams on `workstreams` without ever deleting.
 * Matching is by normalized title, so repeating a call is a no-op.
 */
export async function setWorkstreams(
  db: Db,
  userId: string,
  input: { workstreams: string[]; archive_unlisted?: boolean },
) {
  const wanted: string[] = [];
  for (const title of input.workstreams.map((t) => t.trim()).filter(Boolean)) {
    if (!wanted.some((w) => normalizeText(w) === normalizeText(title))) wanted.push(title);
  }

  const active = (unwrap(
    await db
      .from("equilibrium_workstreams")
      .select("id, title, position")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("position", { ascending: true }),
    "read the current workstreams",
  ) ?? []) as WorkstreamRow[];

  const matchFor = (title: string) => active.find((w) => normalizeText(w.title) === normalizeText(title));
  const listedExisting = wanted.map(matchFor).filter((w): w is WorkstreamRow => Boolean(w));
  const unlisted = active.filter((w) => !listedExisting.includes(w));
  const toCreate = wanted.filter((t) => !matchFor(t));

  const archiving = input.archive_unlisted === true ? unlisted : [];
  const remaining = active.length - archiving.length + toCreate.length;
  if (remaining > MAX_WORKSTREAMS) {
    const names = unlisted.map((w) => `"${w.title}"`).join(", ");
    throw new ToolError(
      `Equilibrium holds at most ${MAX_WORKSTREAMS} active workstreams, and this would make ${remaining}. ` +
        `Existing workstreams not in your list: ${names || "none"}. ` +
        `Include them in the list, pass archive_unlisted=true to archive them, or group your workstreams.`,
    );
  }

  const now = new Date().toISOString();
  const archived: string[] = [];
  for (const ws of archiving) {
    unwrap(
      await db.from("equilibrium_workstreams").update({ archived_at: now }).eq("id", ws.id).eq("user_id", userId),
      "archive a workstream",
    );
    archived.push(ws.title);
  }

  // Final order: the listed ones as given, then any unlisted ones that survive.
  const survivingUnlisted = unlisted.filter((w) => !archiving.includes(w));
  const created: string[] = [];
  const finalTitles: { id: string; title: string }[] = [];
  let position = 0;

  for (const title of wanted) {
    const existing = matchFor(title);
    if (existing) {
      if (existing.position !== position) {
        unwrap(
          await db.from("equilibrium_workstreams").update({ position }).eq("id", existing.id).eq("user_id", userId),
          "reorder the workstreams",
        );
      }
      finalTitles.push({ id: existing.id, title: existing.title });
    } else {
      const row = unwrap(
        await db
          .from("equilibrium_workstreams")
          .insert({ user_id: userId, position, title })
          .select("id, title")
          .single(),
        "create a workstream",
      ) as { id: string; title: string };
      created.push(row.title);
      finalTitles.push({ id: row.id, title: row.title });
    }
    position++;
  }
  for (const ws of survivingUnlisted) {
    if (ws.position !== position) {
      unwrap(
        await db.from("equilibrium_workstreams").update({ position }).eq("id", ws.id).eq("user_id", userId),
        "reorder the workstreams",
      );
    }
    position++;
  }

  return {
    workstreams: finalTitles,
    created,
    archived,
    left_unlisted: survivingUnlisted.map((w) => w.title),
    unchanged: created.length === 0 && archived.length === 0,
  };
}

export default defineTool({
  name: "set_workstreams",
  title: "Set workstreams",
  description:
    "Set the signed-in user's active Equilibrium workstreams (max 3) and their order. Existing workstreams are matched by title and kept (with their tasks); missing ones are created. Never deletes: unlisted workstreams stay unless archive_unlisted=true (soft archive, reversible in the app). Repeating the same call changes nothing.",
  inputSchema: setWorkstreamsInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) =>
    runForUser(ctx, "save the workstreams", (db, userId) => setWorkstreams(db, userId, input)),
});
