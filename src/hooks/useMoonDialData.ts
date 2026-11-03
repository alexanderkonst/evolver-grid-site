import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * The player's own Equilibrium lines for the village moon dial (village-as-dashboard step 2):
 * Moon Focus and the one HUMAN DO NOW. Read with the player's own session from the same
 * tables the Equilibrium page uses (row-level security: a player only ever reads their rows).
 * No token, no agent endpoint, nothing written.
 *
 * HUMAN DO NOW: `equilibrium_do_now` (owner = human, at most one per player), falling back to
 * the first focused task in `equilibrium_focus` (what the Equilibrium page still shows).
 */
export type MoonDialData = {
  status: "loading" | "guest" | "ready";
  moonFocus: string | null;
  doNow: string | null;
};

// The equilibrium_* tables are typed loosely here, as in useEquilibriumV2.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const text = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

async function readDoNow(userId: string): Promise<string | null> {
  const human = await db
    .from("equilibrium_do_now")
    .select("task_id, subtask_id")
    .eq("user_id", userId)
    .eq("owner", "human")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  let taskId: string | null = human.data?.task_id ?? null;
  const subtaskId: string | null = human.data?.subtask_id ?? null;
  if (subtaskId) {
    const sub = await db.from("equilibrium_subtasks").select("text").eq("id", subtaskId).maybeSingle();
    const s = text(sub.data?.text);
    if (s) return s;
  }
  if (!taskId) {
    const focus = await db
      .from("equilibrium_focus")
      .select("task_id")
      .eq("user_id", userId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    taskId = focus.data?.task_id ?? null;
  }
  if (!taskId) return null;
  const task = await db.from("equilibrium_tasks").select("text, status").eq("id", taskId).maybeSingle();
  if (task.data?.status === "done") return null;
  return text(task.data?.text);
}

export const useMoonDialData = (): MoonDialData => {
  const [data, setData] = useState<MoonDialData>({ status: "loading", moonFocus: null, doNow: null });
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) {
          if (live) setData({ status: "guest", moonFocus: null, doNow: null });
          return;
        }
        const [state, doNow] = await Promise.all([
          db.from("equilibrium_state").select("moon_focus_text").eq("user_id", user.id).maybeSingle(),
          readDoNow(user.id).catch(() => null),
        ]);
        if (live) setData({ status: "ready", moonFocus: text(state.data?.moon_focus_text), doNow });
      } catch {
        // A read that fails shows the empty state, never an error on the map.
        if (live) setData({ status: "ready", moonFocus: null, doNow: null });
      }
    };
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return data;
};

export default useMoonDialData;
