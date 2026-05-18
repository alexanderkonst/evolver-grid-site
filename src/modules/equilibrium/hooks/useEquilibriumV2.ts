import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import type {
  EquilibriumFocus,
  EquilibriumState,
  EquilibriumStrategy,
  EquilibriumTask,
  EquilibriumWorkstream,
} from "../types";

/**
 * useEquilibriumV2 — primary data hook for the Biologic Watch page.
 *
 * Cast through `eqAny` for the 6 new equilibrium_* tables until the worktree's
 * Supabase types catch up with main.
 */

const eqAny = supabase as unknown as {
  from: (table: string) => any;
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>;
};

const MAX_WORKSTREAMS = 7;
const MAX_TASKS = 7;
const MAX_DONE_VISIBLE = 7;
const MAX_FOCUS = 3;

export interface EquilibriumV2Data {
  user: User | null;
  loading: boolean;

  // ─── Identity layer ────────────────────────────────────
  state: EquilibriumState | null;
  missionStatement: string | null;
  topTalentTitle: string | null;
  birthday: string | null;
  missionDisplay: string | null;
  roleDisplay: string | null;

  // ─── Intent / execution layer ──────────────────────────
  strategies: EquilibriumStrategy[];
  workstreams: EquilibriumWorkstream[];
  /** Workstreams the user has marked complete (archived). Newest first. */
  archivedWorkstreams: EquilibriumWorkstream[];
  tasksByWorkstream: Record<string, EquilibriumTask[]>;
  focusedTaskIds: string[];

  /** Currently-open workstream (drives Box 10's task list). */
  activeWorkstreamId: string | null;
  setActiveWorkstreamId: (id: string | null) => void;

  // ─── Mutations ─────────────────────────────────────────
  setMissionOverride: (text: string | null) => Promise<void>;
  setRoleOverride: (text: string | null) => Promise<void>;
  setMoonFocus: (text: string | null) => Promise<void>;
  /** Persist a fresh synthesis reading + timestamp to equilibrium_state. */
  setLastSynthesis: (text: string, at: string) => Promise<void>;

  upsertStrategy: (position: 1 | 2 | 3, text: string | null) => Promise<void>;
  /**
   * Reorder strategies by swapping texts between positions. Takes the
   * NEW ordering as a 3-tuple of texts (null = empty slot at that
   * position). Each non-null text is upserted at its new position; each
   * null is deleted. Sasha 2026-05-17.
   */
  reorderStrategies: (orderedTexts: [string | null, string | null, string | null]) => Promise<void>;

  addWorkstream: (title: string) => Promise<void>;
  renameWorkstream: (id: string, title: string) => Promise<void>;
  /** Soft-archive (workstream marked complete; data preserved + restorable). */
  deleteWorkstream: (id: string) => Promise<void>;
  /** Restore an archived workstream back to active. */
  restoreWorkstream: (id: string) => Promise<void>;
  reorderWorkstreams: (orderedIds: string[]) => Promise<void>;

  addTask: (workstreamId: string, text: string) => Promise<void>;
  renameTask: (id: string, text: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (workstreamId: string, orderedIds: string[]) => Promise<void>;

  /** Returns `{ replacedOldest }` so UI can show toast when oldest was kicked. */
  promoteToDoNow: (taskId: string) => Promise<{ replacedOldest: boolean }>;
  /** Marks task done + removes from focus (transactional via eq_complete_task RPC). */
  completeTask: (taskId: string) => Promise<void>;
  /** Reverses a completed task back to active (clears done_at). */
  uncompleteTask: (taskId: string) => Promise<void>;

  refresh: () => Promise<void>;
}

export function useEquilibriumV2(): EquilibriumV2Data {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState<EquilibriumState | null>(null);
  const [missionStatement, setMissionStatement] = useState<string | null>(null);
  const [topTalentTitle, setTopTalentTitle] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<string | null>(null);

  const [strategies, setStrategies] = useState<EquilibriumStrategy[]>([]);
  const [workstreams, setWorkstreams] = useState<EquilibriumWorkstream[]>([]);
  const [archivedWorkstreams, setArchivedWorkstreams] = useState<EquilibriumWorkstream[]>([]);
  const [tasks, setTasks] = useState<EquilibriumTask[]>([]);
  const [focus, setFocus] = useState<EquilibriumFocus[]>([]);
  const [activeWorkstreamId, setActiveWorkstreamId] = useState<string | null>(null);

  // ─── Auth subscription ─────────────────────────────────

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setUser(session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (mounted) setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ─── Fetch everything when user changes ────────────────

  const fetchAll = useCallback(async () => {
    if (!user) {
      setState(null);
      setMissionStatement(null);
      setTopTalentTitle(null);
      setBirthday(null);
      setStrategies([]);
      setWorkstreams([]);
      setTasks([]);
      setFocus([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Run all queries in parallel for snappiness.
    const [
      stateRes,
      participantRes,
      profileRes,
      strategiesRes,
      workstreamsRes,
      focusRes,
    ] = await Promise.all([
      eqAny.from("equilibrium_state").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("mission_participants")
        .select("mission_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      // NOTE: `birthday` lives on `equilibrium_state` (v2-specific user
      // state), NOT on `game_profiles`. Previously this select asked for
      // `game_profiles.birthday` which doesn't exist — the SELECT errored
      // silently, birthday stayed null forever, BD prompt always appeared
      // and Update always failed ("Couldn't save"). Fixed 2026-05-16.
      supabase
        .from("game_profiles")
        .select("id, last_zog_snapshot_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      eqAny.from("equilibrium_strategies").select("*").eq("user_id", user.id),
      eqAny.from("equilibrium_workstreams").select("*").eq("user_id", user.id),
      eqAny.from("equilibrium_focus").select("*").eq("user_id", user.id),
    ]);

    const stateRow = (stateRes.data as
      | (EquilibriumState & { birthday?: string | null })
      | null) ?? null;
    setState(stateRow);

    if (participantRes.data?.mission_id) {
      const mission = MISSIONS.find((m) => m.id === participantRes.data!.mission_id);
      setMissionStatement(mission?.statement ?? null);
    } else {
      setMissionStatement(null);
    }

    const profile = profileRes.data as
      | { id?: string; last_zog_snapshot_id?: string | null }
      | null;
    // Birthday is sourced from equilibrium_state.birthday (v2 user state).
    // Schema migration: 20260516000000_add_birthday_to_equilibrium_state.sql
    //
    // localStorage fallback (2026-05-16 round 7): if Supabase doesn't have
    // the birthday yet (e.g. migration not yet applied, or first save
    // failed silently), check localStorage. This means the watch works
    // immediately on BD entry — Supabase persistence becomes a sync-when-
    // possible concern rather than a blocker. Cross-device sync resumes
    // automatically once the column exists + an upsert succeeds.
    const cachedBd = (() => {
      try {
        return window.localStorage.getItem(`equilibrium_v2_birthday:${user.id}`);
      } catch {
        return null;
      }
    })();
    setBirthday(stateRow?.birthday ?? cachedBd ?? null);

    // Top Talent — try last_zog_snapshot_id first; fall back to latest snapshot
    // by created_at (some users have ZoG done but the pointer was never set).
    // Then read archetype_title; fall back to bullseyeSentence for pre-Day-58
    // snapshots that don't have the topTalentProfile sub-object.
    let snapData: { appleseed_data?: unknown } | null = null;
    if (profile?.last_zog_snapshot_id) {
      const { data } = await supabase
        .from("zog_snapshots")
        .select("appleseed_data")
        .eq("id", profile.last_zog_snapshot_id)
        .maybeSingle();
      snapData = data;
    }
    if (!snapData && profile?.id) {
      const { data } = await supabase
        .from("zog_snapshots")
        .select("appleseed_data")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      snapData = data;
    }
    const appleseed = snapData?.appleseed_data as
      | {
          topTalentProfile?: { archetype_title?: string };
          bullseyeSentence?: string;
        }
      | null
      | undefined;
    // Role surface — prefer the first-person bullseye sentence over the
    // archetype label (Sasha 2026-05-16 round 7: "the archetype is a
    // category like 'Fog to Framework Building' — I want the one-sentence
    // that starts with an action verb, like 'I turn fog into frameworks
    // that people can act upon right away'"). The bullseye is authored as
    // a present-tense verb phrase (e.g., "turn fog into frameworks…")
    // intended to render as "I [bullseye]" — see
    // appleseedGenerator.ts schema for `bullseyeSentence`.
    //
    // Fall back to archetype_title if no bullseye exists (older snapshots).
    const bullseye = appleseed?.bullseyeSentence?.trim();
    setTopTalentTitle(
      bullseye
        ? `I ${bullseye}`
        : appleseed?.topTalentProfile?.archetype_title ?? null,
    );

    setStrategies(
      ((strategiesRes.data as EquilibriumStrategy[] | null) ?? []).sort(
        (a, b) => a.position - b.position,
      ),
    );

    const allWs = ((workstreamsRes.data as EquilibriumWorkstream[] | null) ?? []);
    const wsList = allWs
      .filter((w) => !w.archived_at)
      .sort((a, b) => a.position - b.position);
    const wsArchived = allWs
      .filter((w) => w.archived_at)
      .sort(
        (a, b) =>
          new Date(b.archived_at ?? 0).getTime() -
          new Date(a.archived_at ?? 0).getTime(),
      );
    setWorkstreams(wsList);
    setArchivedWorkstreams(wsArchived);

    // Fetch tasks for all workstreams (one query, filtered by workstream_id IN ...).
    if (wsList.length > 0) {
      const wsIds = wsList.map((w) => w.id);
      const { data: tasksData } = await eqAny
        .from("equilibrium_tasks")
        .select("*")
        .in("workstream_id", wsIds);
      setTasks(((tasksData as EquilibriumTask[] | null) ?? []).sort((a, b) => a.position - b.position));
    } else {
      setTasks([]);
    }

    setFocus(
      ((focusRes.data as EquilibriumFocus[] | null) ?? []).sort(
        (a, b) => a.position - b.position,
      ),
    );

    // Default active workstream = first one (if not already set or no longer valid).
    setActiveWorkstreamId((prev) => {
      if (prev && wsList.some((w) => w.id === prev)) return prev;
      return wsList[0]?.id ?? null;
    });

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // ─── State upsert helper ───────────────────────────────

  const upsertState = useCallback(
    async (patch: Partial<EquilibriumState>) => {
      if (!user) return;
      const row = {
        user_id: user.id,
        ...state,
        ...patch,
        updated_at: new Date().toISOString(),
      };
      const res = await eqAny
        .from("equilibrium_state")
        .upsert(row, { onConflict: "user_id" });
      if (res.error) {
        console.warn("[equilibrium_v2] upsert state failed", res.error);
        toast.error("Couldn't save — try again.");
        return;
      }
      setState((prev) => ({
        ...(prev ?? ({} as EquilibriumState)),
        ...patch,
        user_id: user.id,
        updated_at: row.updated_at,
      } as EquilibriumState));
    },
    [user, state],
  );

  const setMissionOverride = useCallback(
    (text: string | null) => upsertState({ mission_override_text: text }),
    [upsertState],
  );
  const setRoleOverride = useCallback(
    (text: string | null) => upsertState({ role_override_text: text }),
    [upsertState],
  );
  const setMoonFocus = useCallback(
    (text: string | null) => upsertState({ moon_focus_text: text }),
    [upsertState],
  );
  const setLastSynthesis = useCallback(
    (text: string, at: string) =>
      upsertState({ last_synthesis_text: text, last_synthesis_at: at }),
    [upsertState],
  );

  // ─── Strategies ────────────────────────────────────────

  const upsertStrategy = useCallback(
    async (position: 1 | 2 | 3, text: string | null) => {
      if (!user) return;
      if (text === null || text.trim() === "") {
        // Delete the row entirely.
        const res = await eqAny
          .from("equilibrium_strategies")
          .delete()
          .eq("user_id", user.id)
          .eq("position", position);
        if (res.error) {
          console.warn("[equilibrium_v2] delete strategy failed", res.error);
          toast.error("Couldn't clear strategy — try again.");
          return;
        }
        setStrategies((prev) => prev.filter((s) => s.position !== position));
        return;
      }
      const row = {
        user_id: user.id,
        position,
        text: text.trim(),
        set_at: new Date().toISOString(),
      };
      const res = await eqAny
        .from("equilibrium_strategies")
        .upsert(row, { onConflict: "user_id,position" });
      if (res.error) {
        console.warn("[equilibrium_v2] upsert strategy failed", res.error);
        toast.error("Couldn't save strategy — try again.");
        return;
      }
      setStrategies((prev) => {
        const without = prev.filter((s) => s.position !== position);
        return [...without, row as EquilibriumStrategy].sort(
          (a, b) => a.position - b.position,
        );
      });
    },
    [user],
  );

  /**
   * Reorder strategies. The 3-tuple represents the NEW state at
   * positions 1, 2, 3. Each non-null text is upserted at that position;
   * each null position has its row deleted. Texts may have moved between
   * positions — composite key (user_id, position) absorbs that
   * automatically since we just overwrite each slot.
   */
  const reorderStrategies = useCallback(
    async (orderedTexts: [string | null, string | null, string | null]) => {
      if (!user) return;
      const now = new Date().toISOString();

      // Optimistic state update.
      const newRows: EquilibriumStrategy[] = [];
      orderedTexts.forEach((text, i) => {
        if (text && text.trim()) {
          newRows.push({
            user_id: user.id,
            position: (i + 1) as 1 | 2 | 3,
            text: text.trim(),
            set_at: now,
          } as EquilibriumStrategy);
        }
      });
      setStrategies(newRows);

      // Persist each slot. Run in parallel — composite key (user_id,
      // position) absorbs text swaps cleanly.
      await Promise.all(
        orderedTexts.map((text, i) => {
          const position = (i + 1) as 1 | 2 | 3;
          if (text && text.trim()) {
            return eqAny
              .from("equilibrium_strategies")
              .upsert(
                {
                  user_id: user.id,
                  position,
                  text: text.trim(),
                  set_at: now,
                },
                { onConflict: "user_id,position" },
              );
          }
          // Empty slot — delete the row if any exists.
          return eqAny
            .from("equilibrium_strategies")
            .delete()
            .eq("user_id", user.id)
            .eq("position", position);
        }),
      );
    },
    [user],
  );

  // ─── Workstreams ───────────────────────────────────────

  const addWorkstream = useCallback(
    async (title: string) => {
      if (!user) return;
      if (workstreams.length >= MAX_WORKSTREAMS) return;
      const position = workstreams.length;
      const row = {
        user_id: user.id,
        position,
        title: title.trim() || "Untitled",
      };
      const { data, error } = await eqAny
        .from("equilibrium_workstreams")
        .insert(row)
        .select()
        .single();
      if (error) {
        console.warn("[equilibrium_v2] add workstream failed", error);
        toast.error("Couldn't add workstream — try again.");
        return;
      }
      const created = data as EquilibriumWorkstream;
      setWorkstreams((prev) => [...prev, created]);
      setActiveWorkstreamId(created.id);
    },
    [user, workstreams.length],
  );

  const renameWorkstream = useCallback(
    async (id: string, title: string) => {
      const res = await eqAny
        .from("equilibrium_workstreams")
        .update({ title: title.trim() })
        .eq("id", id);
      if (res.error) {
        toast.error("Couldn't rename — try again.");
        return;
      }
      setWorkstreams((prev) =>
        prev.map((w) => (w.id === id ? { ...w, title: title.trim() } : w)),
      );
    },
    [],
  );

  const deleteWorkstream = useCallback(
    async (id: string) => {
      const target = workstreams.find((w) => w.id === id);
      if (!target) return;

      // Soft-archive (cascade deletes tasks via FK in schema).
      const res = await eqAny
        .from("equilibrium_workstreams")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
      if (res.error) {
        toast.error("Couldn't archive workstream — try again.");
        return;
      }
      setWorkstreams((prev) => prev.filter((w) => w.id !== id));
      const archivedAt = new Date().toISOString();
      setArchivedWorkstreams((prev) =>
        [{ ...target, archived_at: archivedAt }, ...prev],
      );
      // Tasks remain in local state — they're not deleted from DB by archive.
      if (activeWorkstreamId === id) {
        setActiveWorkstreamId(workstreams.find((w) => w.id !== id)?.id ?? null);
      }

      // Undo affordance — restore by clearing archived_at.
      toast.success(`Completed "${target.title}"`, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: async () => {
            const undoRes = await eqAny
              .from("equilibrium_workstreams")
              .update({ archived_at: null })
              .eq("id", id);
            if (undoRes.error) {
              toast.error("Couldn't undo — refresh to recover.");
              return;
            }
            setWorkstreams((prev) =>
              [...prev, { ...target, archived_at: null }].sort(
                (a, b) => a.position - b.position,
              ),
            );
            setArchivedWorkstreams((prev) =>
              prev.filter((w) => w.id !== id),
            );
          },
        },
      });
    },
    [activeWorkstreamId, workstreams],
  );

  const restoreWorkstream = useCallback(
    async (id: string) => {
      const target = archivedWorkstreams.find((w) => w.id === id);
      if (!target) return;
      const res = await eqAny
        .from("equilibrium_workstreams")
        .update({ archived_at: null })
        .eq("id", id);
      if (res.error) {
        toast.error("Couldn't restore workstream — try again.");
        return;
      }
      setArchivedWorkstreams((prev) => prev.filter((w) => w.id !== id));
      setWorkstreams((prev) =>
        [...prev, { ...target, archived_at: null }].sort(
          (a, b) => a.position - b.position,
        ),
      );
    },
    [archivedWorkstreams],
  );

  const reorderWorkstreams = useCallback(
    async (orderedIds: string[]) => {
      // Optimistic update.
      const idToPos = new Map(orderedIds.map((id, i) => [id, i]));
      setWorkstreams((prev) =>
        [...prev]
          .map((w) => ({ ...w, position: idToPos.get(w.id) ?? w.position }))
          .sort((a, b) => a.position - b.position),
      );
      // Persist each row's new position.
      await Promise.all(
        orderedIds.map((id, position) =>
          eqAny.from("equilibrium_workstreams").update({ position }).eq("id", id),
        ),
      );
    },
    [],
  );

  // ─── Tasks ─────────────────────────────────────────────

  const addTask = useCallback(
    async (workstreamId: string, text: string) => {
      const activeTasks = tasks.filter(
        (t) => t.workstream_id === workstreamId && t.status === "active",
      );
      if (activeTasks.length >= MAX_TASKS) return;
      const row = {
        workstream_id: workstreamId,
        position: activeTasks.length,
        text: text.trim() || "Untitled task",
        status: "active" as const,
      };
      const { data, error } = await eqAny
        .from("equilibrium_tasks")
        .insert(row)
        .select()
        .single();
      if (error) {
        console.warn("[equilibrium_v2] add task failed", error);
        toast.error("Couldn't add task — try again.");
        return;
      }
      setTasks((prev) => [...prev, data as EquilibriumTask]);
    },
    [tasks],
  );

  const renameTask = useCallback(async (id: string, text: string) => {
    const res = await eqAny
      .from("equilibrium_tasks")
      .update({ text: text.trim() })
      .eq("id", id);
    if (res.error) {
      toast.error("Couldn't rename task — try again.");
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: text.trim() } : t)),
    );
  }, []);

  const deleteTask = useCallback(
    async (id: string) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;

      const res = await eqAny.from("equilibrium_tasks").delete().eq("id", id);
      if (res.error) {
        toast.error("Couldn't delete task — try again.");
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setFocus((prev) => prev.filter((f) => f.task_id !== id));

      // Undo affordance — re-insert the row with original IDs preserved.
      toast.success(`Deleted "${target.text.slice(0, 40)}${target.text.length > 40 ? "…" : ""}"`, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: async () => {
            const { error: undoErr } = await eqAny
              .from("equilibrium_tasks")
              .insert({
                id: target.id,
                workstream_id: target.workstream_id,
                position: target.position,
                text: target.text,
                status: target.status,
                created_at: target.created_at,
                done_at: target.done_at,
                do_now_at: target.do_now_at,
              });
            if (undoErr) {
              toast.error("Couldn't undo — refresh to recover.");
              return;
            }
            setTasks((prev) => [...prev, target]);
          },
        },
      });
    },
    [tasks],
  );

  const reorderTasks = useCallback(
    async (workstreamId: string, orderedIds: string[]) => {
      const idToPos = new Map(orderedIds.map((id, i) => [id, i]));
      setTasks((prev) =>
        prev.map((t) =>
          t.workstream_id === workstreamId && idToPos.has(t.id)
            ? { ...t, position: idToPos.get(t.id)! }
            : t,
        ),
      );
      await Promise.all(
        orderedIds.map((id, position) =>
          eqAny.from("equilibrium_tasks").update({ position }).eq("id", id),
        ),
      );
    },
    [],
  );

  // ─── DO NOW ────────────────────────────────────────────

  const promoteToDoNow = useCallback(
    async (taskId: string): Promise<{ replacedOldest: boolean }> => {
      if (!user) return { replacedOldest: false };
      // If already in focus, no-op.
      if (focus.some((f) => f.task_id === taskId)) return { replacedOldest: false };

      const nowIso = new Date().toISOString();
      let replacedOldest = false;
      const sortedByOldest = [...focus].sort(
        (a, b) => new Date(a.promoted_at).getTime() - new Date(b.promoted_at).getTime(),
      );

      let targetPosition: 1 | 2 | 3;
      if (focus.length < MAX_FOCUS) {
        const used = new Set(focus.map((f) => f.position));
        targetPosition = ([1, 2, 3] as const).find((p) => !used.has(p)) ?? 3;
      } else {
        targetPosition = sortedByOldest[0].position;
        replacedOldest = true;
      }

      const row = {
        user_id: user.id,
        position: targetPosition,
        task_id: taskId,
        promoted_at: nowIso,
      };
      const res = await eqAny
        .from("equilibrium_focus")
        .upsert(row, { onConflict: "user_id,position" });
      if (res.error) {
        console.warn("[equilibrium_v2] promote DO NOW failed", res.error);
        return { replacedOldest: false };
      }

      setFocus((prev) => {
        const without = prev.filter((f) => f.position !== targetPosition);
        return [...without, row as EquilibriumFocus].sort(
          (a, b) => a.position - b.position,
        );
      });

      // Stamp the task with do_now_at.
      await eqAny
        .from("equilibrium_tasks")
        .update({ do_now_at: nowIso })
        .eq("id", taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, do_now_at: nowIso } : t)),
      );

      return { replacedOldest };
    },
    [user, focus],
  );

  const uncompleteTask = useCallback(
    async (taskId: string) => {
      // Reverse a "done" task back to active. Append to end of active list
      // (don't try to restore original position — the user likely wants it
      // visible right now, not buried in old position).
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return;
      const siblingActive = tasks.filter(
        (t) => t.workstream_id === target.workstream_id && t.status === "active",
      );
      const newPosition = siblingActive.length;
      const res = await eqAny
        .from("equilibrium_tasks")
        .update({ status: "active", done_at: null, position: newPosition })
        .eq("id", taskId);
      if (res.error) {
        toast.error("Couldn't restore — try again.");
        return;
      }
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "active", done_at: null, position: newPosition }
            : t,
        ),
      );
    },
    [tasks],
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      // Optimistic: mark done in local state immediately so cascade animation can run.
      const nowIso = new Date().toISOString();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: "done", done_at: nowIso } : t,
        ),
      );
      setFocus((prev) => prev.filter((f) => f.task_id !== taskId));

      const res = await eqAny.rpc("eq_complete_task", { p_task_id: taskId });
      if (res.error) {
        console.warn("[equilibrium_v2] eq_complete_task failed; refetching", res.error);
        void fetchAll();
      }
    },
    [fetchAll],
  );

  // ─── Derived display values ────────────────────────────

  const missionDisplay = useMemo(
    () => state?.mission_override_text ?? missionStatement ?? null,
    [state?.mission_override_text, missionStatement],
  );
  const roleDisplay = useMemo(
    () => state?.role_override_text ?? topTalentTitle ?? null,
    [state?.role_override_text, topTalentTitle],
  );

  const tasksByWorkstream = useMemo(() => {
    const map: Record<string, EquilibriumTask[]> = {};
    for (const t of tasks) {
      (map[t.workstream_id] ??= []).push(t);
    }
    // Sort each: active by position asc, then done by done_at desc (newest first), capped.
    for (const id in map) {
      const active = map[id]
        .filter((t) => t.status === "active")
        .sort((a, b) => a.position - b.position);
      const done = map[id]
        .filter((t) => t.status === "done")
        .sort(
          (a, b) =>
            new Date(b.done_at ?? 0).getTime() - new Date(a.done_at ?? 0).getTime(),
        )
        .slice(0, MAX_DONE_VISIBLE);
      map[id] = [...active, ...done];
    }
    return map;
  }, [tasks]);

  const focusedTaskIds = useMemo(
    () => focus.sort((a, b) => a.position - b.position).map((f) => f.task_id),
    [focus],
  );

  return {
    user,
    loading,
    state,
    missionStatement,
    topTalentTitle,
    birthday,
    missionDisplay,
    roleDisplay,
    strategies,
    workstreams,
    archivedWorkstreams,
    tasksByWorkstream,
    focusedTaskIds,
    activeWorkstreamId,
    setActiveWorkstreamId,
    setMissionOverride,
    setRoleOverride,
    setMoonFocus,
    setLastSynthesis,
    upsertStrategy,
    reorderStrategies,
    addWorkstream,
    renameWorkstream,
    deleteWorkstream,
    restoreWorkstream,
    reorderWorkstreams,
    addTask,
    renameTask,
    deleteTask,
    reorderTasks,
    promoteToDoNow,
    completeTask,
    uncompleteTask,
    refresh: fetchAll,
  };
}

export { MAX_WORKSTREAMS, MAX_TASKS, MAX_DONE_VISIBLE, MAX_FOCUS };
