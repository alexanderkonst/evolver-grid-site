import type { Page } from "@playwright/test";
import { signInAsMock } from "./signedIn";

/**
 * A signed-in player WITH a saved top talent, entirely mocked (no network, no writes, no paid call).
 * `signInAsMock` answers every backend read with an empty list; this layers the two reads that make the
 * village treat the player as one who has a result: the profile row and its zog snapshot. Later routes win,
 * so these are registered after the generic ones. The save is only ever read: writes are refused by `guard`.
 */
export const MOCK_USER_ID = "00000000-0000-0000-0000-000000000497";
const PROFILE = { id: "00000000-0000-0000-0000-0000000000a1", user_id: MOCK_USER_ID, first_name: "Smoke", avatar_url: null, last_zog_snapshot_id: "00000000-0000-0000-0000-0000000000b1", first_time_actions: {}, zone_of_genius_completed: true };
const SNAPSHOT = { id: "00000000-0000-0000-0000-0000000000b1", profile_id: PROFILE.id, archetype_title: "The Lantern Keeper" };

export async function signInWithTopTalent(page: Page, opts: { actions?: Record<string, boolean> } = {}): Promise<void> {
  await signInAsMock(page);
  const reply = (row: unknown) => (route: import("@playwright/test").Route) => {
    const wantsObject = (route.request().headers()["accept"] ?? "").includes("vnd.pgrst.object");
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "content-range": "0-0/1" }, body: JSON.stringify(wantsObject ? row : [row]) });
  };
  await page.route(/\.supabase\.co\/rest\/v1\/zog_snapshots/, reply(SNAPSHOT));
  await page.route(/\.supabase\.co\/rest\/v1\/game_profiles/, reply({ ...PROFILE, first_time_actions: opts.actions ?? {} }));
}
