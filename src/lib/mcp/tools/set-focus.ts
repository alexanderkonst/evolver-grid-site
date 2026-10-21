import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { WRITE_IDEMPOTENT, runForUser, unwrap, type Db } from "./_shared";

const MAX_FOCUS_LENGTH = 4000;

export const setFocusInput = {
  text: z
    .string()
    .max(MAX_FOCUS_LENGTH)
    .describe("The Moon Focus: the intention for this lunar cycle, ideally 1-3 words. An empty string clears it."),
};

/** Same write the Equilibrium page does: upsert `moon_focus_text` on `equilibrium_state`. */
export async function setFocus(db: Db, userId: string, input: { text: string }) {
  const text = input.text.trim();
  const now = new Date().toISOString();
  unwrap(
    await db
      .from("equilibrium_state")
      .upsert(
        { user_id: userId, moon_focus_text: text === "" ? null : text, updated_at: now },
        { onConflict: "user_id" },
      ),
    "set the Moon Focus",
  );
  return { moon_focus: text === "" ? null : text, cleared: text === "", updated_at: now };
}

export default defineTool({
  name: "set_focus",
  title: "Set Moon Focus",
  description:
    "Set (or clear) the signed-in user's Moon Focus in Equilibrium: the one intention for the current lunar cycle. Overwrites the previous focus. Safe to repeat with the same text.",
  inputSchema: setFocusInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) => runForUser(ctx, "set the Moon Focus", (db, userId) => setFocus(db, userId, input)),
});
