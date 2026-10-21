import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { WRITE_IDEMPOTENT, ToolError, runForUser, unwrap, type Db } from "./_shared";

export const MAX_STRATEGIES = 3;

export const setStrategiesInput = {
  strategies: z
    .array(z.string().trim().min(1).max(4000))
    .max(MAX_STRATEGIES)
    .describe(
      "The strategies in priority order (position 1 first), at most 3. The list replaces the current strategies: positions beyond the list are cleared.",
    ),
};

type StrategyRow = { position: number; text: string };

/**
 * Replace-all with the Equilibrium page's semantics (reorderStrategies): each
 * listed text is upserted at its position, unlisted positions are deleted.
 * Unchanged positions are left alone so `set_at` and alignment scores survive
 * a repeated call.
 */
export async function setStrategies(db: Db, userId: string, input: { strategies: string[] }) {
  const texts = input.strategies.map((s) => s.trim()).filter(Boolean);
  if (texts.length > MAX_STRATEGIES) {
    throw new ToolError(`Equilibrium holds at most ${MAX_STRATEGIES} strategies. Pick the ${MAX_STRATEGIES} that matter most.`);
  }

  const existing = (unwrap(
    await db.from("equilibrium_strategies").select("position, text").eq("user_id", userId),
    "read the current strategies",
  ) ?? []) as StrategyRow[];
  const byPosition = new Map(existing.map((r) => [r.position, r.text]));

  const now = new Date().toISOString();
  const written: number[] = [];
  const cleared: number[] = [];

  for (let position = 1; position <= MAX_STRATEGIES; position++) {
    const text = texts[position - 1];
    if (text !== undefined) {
      if (byPosition.get(position) === text) continue;
      unwrap(
        await db
          .from("equilibrium_strategies")
          .upsert({ user_id: userId, position, text, set_at: now }, { onConflict: "user_id,position" }),
        "save the strategies",
      );
      written.push(position);
    } else if (byPosition.has(position)) {
      unwrap(
        await db.from("equilibrium_strategies").delete().eq("user_id", userId).eq("position", position),
        "clear a strategy slot",
      );
      cleared.push(position);
    }
  }

  return {
    strategies: texts.map((text, i) => ({ position: i + 1, text })),
    written_positions: written,
    cleared_positions: cleared,
    unchanged: written.length === 0 && cleared.length === 0,
  };
}

export default defineTool({
  name: "set_strategies",
  title: "Set strategies",
  description:
    "Set the signed-in user's 1-3 Equilibrium strategies, in priority order. Replaces the current list (unlisted slots are cleared); repeating the same list changes nothing.",
  inputSchema: setStrategiesInput,
  annotations: { ...WRITE_IDEMPOTENT, destructiveHint: true },
  handler: (input, ctx) => runForUser(ctx, "save the strategies", (db, userId) => setStrategies(db, userId, input)),
});
