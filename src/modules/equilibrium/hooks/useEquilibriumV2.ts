import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import type {
  EquilibriumFocus,
  EquilibriumState,
  EquilibriumStrategy,
  EquilibriumStrategyCompletion,
  EquilibriumStrategyIteration,
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
  /**
   * All completed tasks across every workstream, newest-completion
   * first. Uncapped. Source for the Harvest celebration section
   * (Sasha 2026-05-20). Each row keeps `created_at`, `do_now_at`,
   * `done_at`, `workstream_id` so the UI can compute durations +
   * workstream attribution.
   */
  completedTasksAll: EquilibriumTask[];
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
  /**
   * Mark a strategy COMPLETE (Sasha 2026-05-29). Moves it from
   * equilibrium_strategies → equilibrium_strategy_completions, freeing
   * the position slot for a new direction. Appears in Harvest.
   */
  completeStrategy: (position: 1 | 2 | 3) => Promise<void>;
  /** All completed strategies, newest first. Powers the Harvest union. */
  completedStrategies: EquilibriumStrategyCompletion[];
  /**
   * Score each filled strategy 0-100 against the user's "highest
   * expression" (Lifelong Dedication + Role). Calls the
   * score-equilibrium-strategies edge function, caches scores +
   * reasoning per strategy row. Returns true on success, false on
   * failure (toast shown either way). Sasha 2026-05-17.
   */
  scoreStrategies: () => Promise<boolean>;
  /** True while the alignment scoring round-trip is in flight. */
  scoringStrategies: boolean;
  /**
   * Run one Strategy Crucible pass on a single saved strategy. Returns
   * an ephemeral suggestion; accepting it still goes through
   * upsertStrategy so the existing edit/save model remains the source
   * of truth.
   */
  iterateStrategy: (
    position: 1 | 2 | 3,
  ) => Promise<EquilibriumStrategyIteration | null>;
  /** Position currently being iterated, used for row-level loading UI. */
  iteratingStrategyPosition: 1 | 2 | 3 | null;

  addWorkstream: (title: string) => Promise<void>;
  renameWorkstream: (id: string, title: string) => Promise<void>;
  /**
   * HARD delete — permanently removes the workstream + cascade-deletes
   * its tasks and any focus rows pointing at those tasks. Irreversible.
   */
  deleteWorkstream: (id: string) => Promise<void>;
  /**
   * Soft-archive — marks the workstream complete (sets archived_at)
   * and moves it to the Completed pile. Reversible via Undo toast +
   * restoreWorkstream. Tasks under it are preserved (not deleted).
   */
  completeWorkstream: (id: string) => Promise<void>;
  /** Restore an archived workstream back to active. */
  restoreWorkstream: (id: string) => Promise<void>;
  reorderWorkstreams: (orderedIds: string[]) => Promise<void>;

  addTask: (workstreamId: string, text: string) => Promise<void>;
  renameTask: (id: string, text: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (workstreamId: string, orderedIds: string[]) => Promise<void>;

  /** Returns `{ replacedOldest }` so UI can show toast when oldest was kicked. */
  promoteToDoNow: (taskId: string) => Promise<{ replacedOldest: boolean }>;
  /**
   * Remove a task from DOING NOW focus without completing it (Sasha
   * 2026-05-19: "the currently focused task can only exit focus via
   * completion — add a demote affordance"). The task stays active in
   * Intuitive Tasks; only the focus row is dropped.
   */
  demoteFromDoNow: (taskId: string) => Promise<void>;
  /**
   * Reorder the focused tasks within DOING NOW (Sasha 2026-05-27).
   * Receives the NEW task-id ordering (e.g., the drag-drop result).
   * Persists by assigning positions 1..N to the supplied order and
   * preserves `promoted_at` so the "replace oldest at cap" logic in
   * promoteToDoNow continues to work correctly.
   */
  reorderFocus: (orderedTaskIds: string[]) => Promise<void>;
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
  const [completedStrategies, setCompletedStrategies] = useState<EquilibriumStrategyCompletion[]>([]);
  const [workstreams, setWorkstreams] = useState<EquilibriumWorkstream[]>([]);
  const [archivedWorkstreams, setArchivedWorkstreams] = useState<EquilibriumWorkstream[]>([]);
  const [tasks, setTasks] = useState<EquilibriumTask[]>([]);
  const [focus, setFocus] = useState<EquilibriumFocus[]>([]);
  const [activeWorkstreamId, setActiveWorkstreamId] = useState<string | null>(null);
  const [scoringStrategies, setScoringStrategies] = useState(false);
  const [iteratingStrategyPosition, setIteratingStrategyPosition] =
    useState<1 | 2 | 3 | null>(null);

  // ─── Auth subscription ─────────────────────────────────
  //
  // Sasha 2026-05-19: Mission / Role / etc. were re-rendering every
  // time the user returned to the tab. Root cause: Supabase silently
  // refreshes JWTs in the background and fires onAuthStateChange with a
  // FRESH User object that has the same `id` but a new reference. The
  // old setUser unconditionally swapped in the new object → `user`
  // reference changed → `fetchAll` callback re-keyed → effect re-ran →
  // `setLoading(true)` ran → every section flashed back through its
  // skeleton state, refetched, and re-rendered.
  //
  // Fix: swap user reference ONLY when identity actually changed
  // (sign-in / sign-out / different account). Same-id refreshes are
  // no-ops at the React-state level — the existing object stays, no
  // downstream re-render. Cuts a full refetch+re-render per tab focus.
  useEffect(() => {
    let mounted = true;

    const applyUser = (next: User | null) => {
      if (!mounted) return;
      setUser((prev) => {
        // Same id (or both null) → keep the existing reference. This is
        // the critical line for the re-render fix.
        if ((prev?.id ?? null) === (next?.id ?? null)) return prev;
        return next;
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applyUser(session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      applyUser(session?.user ?? null);
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
      setCompletedStrategies([]);
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
      strategyCompletionsRes,
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
        .select("id, last_zog_snapshot_id, mission_statement")
        .eq("user_id", user.id)
        .maybeSingle(),
      eqAny.from("equilibrium_strategies").select("*").eq("user_id", user.id),
      eqAny
        .from("equilibrium_strategy_completions")
        .select("*")
        .eq("user_id", user.id)
        .order("done_at", { ascending: false }),
      eqAny.from("equilibrium_workstreams").select("*").eq("user_id", user.id),
      eqAny.from("equilibrium_focus").select("*").eq("user_id", user.id),
    ]);

    const stateRow = (stateRes.data as
      | (EquilibriumState & { birthday?: string | null })
      | null) ?? null;
    setState(stateRow);

    const profile = profileRes.data as
      | { id?: string; last_zog_snapshot_id?: string | null; mission_statement?: string | null }
      | null;

    const canonicalMissionStatement = profile?.mission_statement?.trim() || null;
    if (canonicalMissionStatement) {
      setMissionStatement(canonicalMissionStatement);
    } else if (participantRes.data?.mission_id) {
      const mission = MISSIONS.find((m) => m.id === participantRes.data!.mission_id);
      setMissionStatement(mission?.statement ?? null);
    } else {
      setMissionStatement(null);
    }
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
    setCompletedStrategies(
      (strategyCompletionsRes.data as EquilibriumStrategyCompletion[] | null) ??
        [],
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
  //
  // Sasha 2026-05-19 responsiveness pass: previously `upsertState`
  // depended on `[user, state]`. Every state change → new upsertState
  // identity → new setMissionOverride / setRoleOverride / setMoonFocus
  // identities → every section that took those as props re-rendered.
  // That made React.memo useless on MissionSection / RoleSection.
  //
  // Fix: keep the latest `state` in a ref so upsertState can read it
  // synchronously without listing it as a dep. The function reference
  // is now stable as long as `user` is stable, which the auth-id guard
  // above ensures across tab refocus. Net effect: stable callbacks,
  // stable downstream sections.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const upsertState = useCallback(
    async (patch: Partial<EquilibriumState>) => {
      if (!user) return;
      const row = {
        user_id: user.id,
        ...stateRef.current,
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
    [user],
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

  /**
   * Mark a strategy COMPLETE (Sasha 2026-05-29). Two server-side ops
   * in sequence (no transaction wrapper — Supabase JS client doesn't
   * expose one cleanly, and the optimistic local update covers the
   * brief gap):
   *
   *   (1) INSERT into equilibrium_strategy_completions — capture the
   *       full row + original_position + done_at=now()
   *   (2) Remove the live row at (user_id, position) — frees the slot
   *       for a new direction
   *
   * If the INSERT succeeds but the DELETE fails (rare), we refetch
   * to repair the local state. The user momentarily sees both rows
   * (live + completion); refetch resolves it.
   *
   * Tasks under this strategy are NOT affected — strategies and tasks
   * are independent in the data model. The completion appears in
   * Harvest with the strategy's text + alignment metadata + a
   * "strategy" attribution (vs "from <workstream>" for tasks).
   */
  const completeStrategy = useCallback(
    async (position: 1 | 2 | 3) => {
      if (!user) return;
      const target = strategies.find((s) => s.position === position);
      if (!target) return;

      const doneAt = new Date().toISOString();
      const completionRow: Omit<EquilibriumStrategyCompletion, "id"> = {
        user_id: user.id,
        text: target.text,
        original_position: target.position,
        set_at: target.set_at,
        done_at: doneAt,
        alignment_score: target.alignment_score ?? null,
        alignment_reasoning: target.alignment_reasoning ?? null,
      };

      // Optimistic: drop from live, prepend to completions. The id is
      // assigned by the server; we use a temporary so React can key
      // the new row, and the next fetchAll will resync with the real id.
      const tempId = `tmp-${Date.now()}`;
      setStrategies((prev) => prev.filter((s) => s.position !== position));
      setCompletedStrategies((prev) => [
        { id: tempId, ...completionRow },
        ...prev,
      ]);

      const insRes = await eqAny
        .from("equilibrium_strategy_completions")
        .insert(completionRow);
      if (insRes.error) {
        toast.error("Couldn't archive strategy — refreshing.");
        void fetchAll();
        return;
      }

      const delRes = await eqAny
        .from("equilibrium_strategies")
        .delete()
        .eq("user_id", user.id)
        .eq("position", position);
      if (delRes.error) {
        toast.error("Strategy archived, but couldn't clear slot — refreshing.");
        void fetchAll();
        return;
      }

      toast.success(`Completed strategy "${target.text.slice(0, 40)}…"`);
      // Refetch in background to get the real completion id (replaces the temp).
      void fetchAll();
    },
    [user, strategies, fetchAll],
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

  /**
   * Hard-delete a workstream (Sasha 2026-05-20).
   *
   * Was previously a soft-archive that stashed the workstream into a
   * "completed pile" — Sasha: "I actually want to delete it, not
   * complete it, because otherwise it just stays there forever."
   *
   * Now: real DELETE on equilibrium_workstreams.id. Schema cascades
   * automatically:
   *   • equilibrium_tasks.workstream_id → ON DELETE CASCADE
   *   • equilibrium_focus.task_id      → ON DELETE CASCADE (via task)
   * So one delete removes the workstream, its tasks, and any focus
   * rows pointing at those tasks. Single round-trip, no orphans.
   *
   * The chip layer guards this with a window.confirm() — destructive
   * action needs an explicit "are you sure" because there's no undo.
   * (We dropped the 5-second toast-Undo pattern because reversing a
   * cascade delete from local state is fragile — tasks were already
   * gone server-side.)
   *
   * Existing archived workstreams (from the previous soft-archive
   * behavior) remain in equilibrium_workstreams with `archived_at`
   * set. The "completed pile" UI continues to render them with a
   * Restore action; this hard-delete doesn't touch them.
   */
  const deleteWorkstream = useCallback(
    async (id: string) => {
      const target = workstreams.find((w) => w.id === id);
      if (!target) return;

      // Optimistic: drop from local state immediately. If the DELETE
      // fails, we refetch to repair (rare; FKs make this delete
      // straightforward).
      setWorkstreams((prev) => prev.filter((w) => w.id !== id));
      setTasks((prev) => prev.filter((t) => t.workstream_id !== id));
      setFocus((prev) =>
        prev.filter((f) => {
          // Drop any focus row whose task belonged to this workstream.
          const task = target && tasks.find((t) => t.id === f.task_id);
          return !task || task.workstream_id !== id;
        }),
      );
      if (activeWorkstreamId === id) {
        setActiveWorkstreamId(
          workstreams.find((w) => w.id !== id)?.id ?? null,
        );
      }

      const res = await eqAny
        .from("equilibrium_workstreams")
        .delete()
        .eq("id", id);
      if (res.error) {
        toast.error("Couldn't delete workstream — refreshing.");
        void fetchAll();
        return;
      }

      toast.success(`Deleted "${target.title}"`);
    },
    [activeWorkstreamId, workstreams, tasks, fetchAll],
  );

  /**
   * Mark a workstream COMPLETE (Sasha 2026-05-29 — re-added alongside
   * hard delete). Soft-archives the workstream into the Completed pile
   * below the active chips. Reversible via `restoreWorkstream`.
   *
   * Distinct from `deleteWorkstream`, which removes the workstream and
   * all its tasks permanently. Sasha's mental model:
   *   • ✓ complete — "I finished this work, preserve the record"
   *   • 🗑 delete — "this was a mistake or no longer relevant, gone"
   *
   * Tasks belonging to the archived workstream stay in the DB (the row
   * just gets an archived_at timestamp on the workstream itself).
   */
  const completeWorkstream = useCallback(
    async (id: string) => {
      const target = workstreams.find((w) => w.id === id);
      if (!target) return;

      const archivedAt = new Date().toISOString();
      // Optimistic: drop from active list, prepend to archived pile.
      setWorkstreams((prev) => prev.filter((w) => w.id !== id));
      setArchivedWorkstreams((prev) =>
        [{ ...target, archived_at: archivedAt }, ...prev],
      );
      if (activeWorkstreamId === id) {
        setActiveWorkstreamId(
          workstreams.find((w) => w.id !== id)?.id ?? null,
        );
      }

      const res = await eqAny
        .from("equilibrium_workstreams")
        .update({ archived_at: archivedAt })
        .eq("id", id);
      if (res.error) {
        toast.error("Couldn't complete workstream — refreshing.");
        void fetchAll();
        return;
      }

      // Toast with Undo affordance — clicking Undo clears archived_at
      // and the row comes back to active.
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
            setArchivedWorkstreams((prev) => prev.filter((w) => w.id !== id));
            setWorkstreams((prev) =>
              [...prev, { ...target, archived_at: null }].sort(
                (a, b) => a.position - b.position,
              ),
            );
          },
        },
      });
    },
    [activeWorkstreamId, workstreams, fetchAll],
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

  /**
   * Demote a task out of DOING NOW without completing it. Just deletes
   * the equilibrium_focus row by task_id. The task stays active in
   * Intuitive Tasks; the user can re-promote it later. Sasha 2026-05-19
   * — added because "the currently focused task can only exit focus
   * via completion" was a forced choice the user didn't always want.
   */
  const demoteFromDoNow = useCallback(
    async (taskId: string) => {
      if (!user) return;
      // Optimistic: remove from focus locally first so the UI feels instant.
      setFocus((prev) => prev.filter((f) => f.task_id !== taskId));

      const res = await eqAny
        .from("equilibrium_focus")
        .delete()
        .eq("user_id", user.id)
        .eq("task_id", taskId);
      if (res.error) {
        console.warn("[equilibrium_v2] demote DO NOW failed; refetching", res.error);
        void fetchAll();
      }
    },
    [user, fetchAll],
  );

  /**
   * Reorder DOING NOW focus rows (Sasha 2026-05-27).
   *
   * Takes a new task-id ordering and assigns positions 1..N. Server
   * write strategy: DELETE all focus rows for the user, then INSERT
   * the new ones. The table has a UNIQUE constraint on (user_id,
   * position), so naive sequential UPDATEs would collide during the
   * swap. Delete-and-insert avoids that without needing a stored
   * procedure or transaction wrapper.
   *
   * Microsecond gap between DELETE and INSERT where the server has
   * zero focus rows for this user. Optimistic local update covers
   * the UI for that window; if the INSERT fails we refetch.
   *
   * promoted_at is preserved per task — when a row was promoted is
   * separate from how it's currently ordered. The "replace oldest
   * at cap" logic in promoteToDoNow still uses promoted_at and so
   * stays correct even after manual reorders.
   */
  const reorderFocus = useCallback(
    async (orderedTaskIds: string[]) => {
      if (!user) return;
      const trimmed = orderedTaskIds.slice(0, MAX_FOCUS);

      // Build new focus rows. Preserve promoted_at from existing rows
      // when the task was already focused; default to now for any new
      // task ids passed in (shouldn't happen during reorder but safe).
      const nowIso = new Date().toISOString();
      const newRows: EquilibriumFocus[] = trimmed.map((taskId, i) => ({
        user_id: user.id,
        position: (i + 1) as 1 | 2 | 3,
        task_id: taskId,
        promoted_at:
          focus.find((f) => f.task_id === taskId)?.promoted_at ?? nowIso,
      }));

      // Optimistic local update — UI shows the new order immediately.
      setFocus(newRows);

      // Server: drop then re-insert. The (user_id, position) unique
      // constraint blocks naive sequential UPDATEs during swap.
      const delRes = await eqAny
        .from("equilibrium_focus")
        .delete()
        .eq("user_id", user.id);
      if (delRes.error) {
        console.warn("[equilibrium_v2] reorder focus DELETE failed; refetching", delRes.error);
        void fetchAll();
        return;
      }
      if (newRows.length === 0) return;
      const insRes = await eqAny.from("equilibrium_focus").insert(newRows);
      if (insRes.error) {
        console.warn("[equilibrium_v2] reorder focus INSERT failed; refetching", insRes.error);
        void fetchAll();
      }
    },
    [user, focus, fetchAll],
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
      // Optimistic: mark done in local state immediately so cascade
      // animation can run.
      //
      // Sasha 2026-05-24: also stamp workstream_title_snapshot so the
      // celebration record survives a later hard-delete of the parent
      // workstream. The server-side eq_complete_task RPC does the
      // canonical write; this is just the local mirror so Harvest
      // shows the right citation immediately without waiting for a
      // refetch.
      const nowIso = new Date().toISOString();
      setTasks((prev) => {
        // Look up the task's parent workstream title for the snapshot.
        const target = prev.find((t) => t.id === taskId);
        const parentTitle = target
          ? workstreams.find((w) => w.id === target.workstream_id)?.title ??
            target.workstream_title_snapshot ??
            null
          : null;
        return prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "done",
                done_at: nowIso,
                workstream_title_snapshot:
                  parentTitle ?? t.workstream_title_snapshot,
              }
            : t,
        );
      });
      setFocus((prev) => prev.filter((f) => f.task_id !== taskId));

      const res = await eqAny.rpc("eq_complete_task", { p_task_id: taskId });
      if (res.error) {
        console.warn("[equilibrium_v2] eq_complete_task failed; refetching", res.error);
        void fetchAll();
      }
    },
    [fetchAll, workstreams],
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

  /**
   * Score filled strategies against the user's "highest expression"
   * (Lifelong Dedication + Role) via the score-equilibrium-strategies
   * edge function. Returns true on success.
   *
   * Defined here (after the displays) so it can close over the latest
   * memoed values. Optimistic + persistent: scores update local state
   * immediately, then upsert to equilibrium_strategies in parallel.
   */
  const scoreStrategies = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    const filled = strategies.filter((s) => s.text?.trim());
    if (filled.length === 0) {
      toast.error("No strategies to score yet.");
      return false;
    }
    if (!missionDisplay && !roleDisplay) {
      toast.error("Set Lifelong Dedication or Role first.");
      return false;
    }

    setScoringStrategies(true);
    try {
      const { data, error } = await supabase.functions.invoke<{
        scores: { score: number; reasoning: string }[];
      }>("score-equilibrium-strategies", {
        body: {
          lifelong_dedication: missionDisplay,
          role: roleDisplay,
          strategies: filled.map((s) => s.text),
        },
      });
      if (error || !data?.scores) throw error ?? new Error("no scores returned");

      const now = new Date().toISOString();
      // Build updated row set: scores aligned with filled-strategy order.
      const updatedFilled = filled.map((row, i) => {
        const s = data.scores[i];
        return {
          ...row,
          alignment_score: s?.score ?? null,
          alignment_reasoning: s?.reasoning ?? null,
          alignment_scored_at: now,
        };
      });

      // Optimistic state: keep all strategies, replace updated ones by position.
      setStrategies((prev) =>
        prev.map((s) => {
          const upd = updatedFilled.find((u) => u.position === s.position);
          return upd ?? s;
        }),
      );

      // Persist updates in parallel. Update by (user_id, position) so we
      // don't overwrite the text/set_at fields.
      await Promise.all(
        updatedFilled.map((row) =>
          eqAny
            .from("equilibrium_strategies")
            .update({
              alignment_score: row.alignment_score,
              alignment_reasoning: row.alignment_reasoning,
              alignment_scored_at: row.alignment_scored_at,
            })
            .eq("user_id", row.user_id)
            .eq("position", row.position),
        ),
      );

      toast.success("Strategies scored.");
      return true;
    } catch (e) {
      console.warn("[equilibrium_v2] score strategies failed", e);
      toast.error("Couldn't score strategies — try again.");
      return false;
    } finally {
      setScoringStrategies(false);
    }
  }, [user, strategies, missionDisplay, roleDisplay]);

  const iterateStrategy = useCallback(
    async (
      position: 1 | 2 | 3,
    ): Promise<EquilibriumStrategyIteration | null> => {
      if (!user) return null;
      const target = strategies.find((s) => s.position === position);
      if (!target?.text?.trim()) {
        toast.error("Add a strategy first.");
        return null;
      }

      setIteratingStrategyPosition(position);
      try {
        const { data, error } =
          await supabase.functions.invoke<EquilibriumStrategyIteration>(
            "iterate-equilibrium-strategy",
            {
              body: {
                strategy: target.text,
                lifelong_dedication: missionDisplay,
                role: roleDisplay,
              },
            },
          );
        if (error || !data?.bottomLine || !data?.proposedStrategy) {
          throw error ?? new Error("no iteration returned");
        }
        return data;
      } catch (e) {
        console.warn("[equilibrium_v2] iterate strategy failed", e);
        toast.error("Couldn't iterate strategy — try again.");
        return null;
      } finally {
        setIteratingStrategyPosition(null);
      }
    },
    [user, strategies, missionDisplay, roleDisplay],
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

  /**
   * Cross-workstream done tasks — the data source for the Harvest
   * section (Sasha 2026-05-20). All completed tasks across the whole
   * system, newest-completion first, no cap. Each row carries the
   * upstream task's `created_at`, `do_now_at`, `done_at` so the UI
   * can compute "time in focus" + relative timestamps. UNLIKE the
   * per-workstream `done` slice above which truncates to
   * MAX_DONE_VISIBLE, this list is uncapped — the celebration feed
   * is the place to see EVERY win.
   */
  const completedTasksAll = useMemo<EquilibriumTask[]>(() => {
    return tasks
      .filter((t) => t.status === "done" && t.done_at)
      .sort(
        (a, b) =>
          new Date(b.done_at ?? 0).getTime() - new Date(a.done_at ?? 0).getTime(),
      );
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
    completedTasksAll,
    focusedTaskIds,
    activeWorkstreamId,
    setActiveWorkstreamId,
    setMissionOverride,
    setRoleOverride,
    setMoonFocus,
    setLastSynthesis,
    upsertStrategy,
    reorderStrategies,
    completeStrategy,
    completedStrategies,
    scoreStrategies,
    scoringStrategies,
    iterateStrategy,
    iteratingStrategyPosition,
    addWorkstream,
    renameWorkstream,
    deleteWorkstream,
    completeWorkstream,
    restoreWorkstream,
    reorderWorkstreams,
    addTask,
    renameTask,
    deleteTask,
    reorderTasks,
    promoteToDoNow,
    demoteFromDoNow,
    reorderFocus,
    completeTask,
    uncompleteTask,
    refresh: fetchAll,
  };
}

export { MAX_WORKSTREAMS, MAX_TASKS, MAX_DONE_VISIBLE, MAX_FOCUS };
