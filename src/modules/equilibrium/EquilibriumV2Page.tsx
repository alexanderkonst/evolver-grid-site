import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { InfoPopover } from "./components/InfoPopover";
import { BirthdayPrompt } from "./components/BirthdayPrompt";
import { useMdlsFlag } from "./useMdlsFlag";
import { EquilibriumMDLSPage } from "./EquilibriumMDLSPage";
import {
  getAllCyclesV2,
  getBirthdayArcPhaseNeighbors,
  type AllCyclesV2,
} from "@/lib/equilibrium-cycles";
import { CycleEnergyBar } from "./components/CycleEnergyBar";
import { SolarCycleBar } from "./components/SolarCycleBar";
import { EquilibriumSectionCard } from "./components/EquilibriumSectionCard";
import { MissionSection } from "./components/MissionSection";
import { RoleSection } from "./components/RoleSection";
import { MoonFocusInput } from "./components/MoonFocusInput";
import { StrategiesSection } from "./components/StrategiesSection";
import { WorkstreamsSection } from "./components/WorkstreamsSection";
import { SmartGoalsSection } from "./components/SmartGoalsSection";
import { DoNowSection } from "./components/DoNowSection";
import { HarvestSection } from "./components/HarvestSection";
import { PhaseTransitionEyebrow } from "./components/PhaseTransitionEyebrow";
import { SynthesisCard } from "./components/SynthesisCard";
import { UpcomingTransitions } from "./components/UpcomingTransitions";
import { SectionAnchorNav } from "./components/SectionAnchorNav";
import { WatchModeToggle, type WatchMode } from "./components/WatchModeToggle";
import { ActiveFocusBanner } from "./components/ActiveFocusBanner";
import { useEquilibriumV2 } from "./hooks/useEquilibriumV2";
import {
  DAY_OF_WEEK_SEGMENTS,
  LUNAR_SEGMENTS,
  SOLAR_SEGMENTS,
  ZODIAC_SEGMENTS,
  lunarDisplayIndex,
} from "./cycleSegments";
import { SECTION_IDS } from "./types";

/**
 * Equilibrium v2 — "Biologic Watch"
 *
 * One scrollable page, 11 sections. Spec: docs/specs/equilibrium/equilibrium_v2_spec.md
 *
 * Current state: cycle sections (boxes 4-7) wired with real cycle math + the
 * `<CycleEnergyBar>` canonical visual. Other sections render placeholders;
 * subsequent waves wire them up + the Supabase-backed sections.
 */

/**
 * Format the time-to-next-phase sub-label for the lunar pill stack.
 * "ends Tue May 19 · 2.3 days left"
 *
 * Locked 2026-05-16 per philosophical spine §6 — turns "a vibe" into
 * "a window." Users can schedule into the remainder of a phase.
 */
function formatPhaseEndsAt(phaseEndMs: number, daysRemaining: number): string {
  const end = new Date(phaseEndMs);
  const day = end.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const days = daysRemaining < 1
    ? `${Math.max(0, Math.round(daysRemaining * 24))}h left`
    : `${daysRemaining.toFixed(1)} days left`;
  return `ends ${day} · ${days}`;
}

/**
 * Watch mode persisted in localStorage so the user's preferred view sticks
 * across sessions. Default = ATTUNE per philosophical spine §11 — the
 * natural sequence is attune-then-act, so first-ever load lands on the
 * reading. After that, the user's last-used mode persists.
 */
const WATCH_MODE_KEY = "equilibrium_v2_watch_mode";

function useWatchMode(): [WatchMode, (m: WatchMode) => void] {
  const [mode, setModeState] = useState<WatchMode>(() => {
    if (typeof window === "undefined") return "attune";
    const saved = window.localStorage.getItem(WATCH_MODE_KEY);
    return saved === "act" ? "act" : "attune";
  });
  const setMode = (next: WatchMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(WATCH_MODE_KEY, next);
    } catch {
      /* localStorage unavailable — silent fallback to in-memory only. */
    }
  };
  return [mode, setMode];
}

/**
 * Cycle math hook. Sasha 2026-05-19 responsiveness pass:
 *
 *   • Tick every 5 minutes (was 60s). Cycles change so slowly — the
 *     fastest is day-of-week, which updates once per day — that
 *     per-minute updates were pure overhead. 5 minutes = enough
 *     resolution for "ends Tue · 2.3 days left" labels to feel live.
 *
 *   • Pause when the tab is hidden. `document.visibilityState` lets
 *     browsers throttle hidden tabs anyway, but explicit pausing
 *     prevents the queued-tick-fires-on-focus pattern that was making
 *     the page feel like it "recalculates" on tab return.
 *
 *   • Recompute on visibility return. If the tab was hidden for hours,
 *     cycle state could be stale — refresh once on focus, then resume
 *     the 5-minute cadence.
 *
 *   • De-dupe identical states. If neither the orb position
 *     (`segmentIndex`) nor the half-day remaining changed across all
 *     four cycles, skip the setState. No state swap = no re-render
 *     cascade for downstream sections.
 */
function cyclesShallowEqual(a: AllCyclesV2, b: AllCyclesV2): boolean {
  const round = (n: number) => Math.floor(n * 10) / 10; // ~2.4h granularity
  return (
    a.solar.segmentIndex === b.solar.segmentIndex &&
    a.zodiac.segmentIndex === b.zodiac.segmentIndex &&
    a.lunar.segmentIndex === b.lunar.segmentIndex &&
    a.dayOfWeek.segmentIndex === b.dayOfWeek.segmentIndex &&
    round(a.lunar.daysRemainingInPhase) === round(b.lunar.daysRemainingInPhase) &&
    round(a.solar.personalProgress * 100) === round(b.solar.personalProgress * 100)
  );
}

interface CyclesSnapshot {
  cycles: AllCyclesV2;
  /** Timestamp the cycles were computed at — stable across re-renders
   *  between ticks. Use this for components that need a "now" anchor
   *  (e.g. UpcomingTransitions) so they only recompute on the tick,
   *  not every render. Sasha 2026-05-24. */
  nowMs: number;
}

function useCycles(birthday?: string): CyclesSnapshot {
  const [snapshot, setSnapshot] = useState<CyclesSnapshot>(() => {
    const nowMs = Date.now();
    return { cycles: getAllCyclesV2(nowMs, birthday), nowMs };
  });

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      if (cancelled) return;
      const nowMs = Date.now();
      const next = getAllCyclesV2(nowMs, birthday);
      setSnapshot((prev) =>
        cyclesShallowEqual(prev.cycles, next) ? prev : { cycles: next, nowMs },
      );
    };

    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      refresh();
    };

    const onVisible = () => {
      if (typeof document !== "undefined" && !document.hidden) refresh();
    };

    const intervalId = window.setInterval(tick, 5 * 60_000);
    document.addEventListener("visibilitychange", onVisible);

    refresh();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [birthday]);

  return snapshot;
}

export const EquilibriumV2Page = () => {
  // MDLS feature flag — when `?mdls=1` is in the URL or
  // localStorage.equilibrium_mdls = "true", render the Stage-8 recompile.
  // Otherwise legacy liquid-glass Equilibrium remains. See:
  //   docs/specs/equilibrium/equilibrium_mdls_tracker.md
  //   docs/specs/equilibrium/equilibrium_mdls_style_guide.md
  const isMdls = useMdlsFlag();
  if (isMdls) return <EquilibriumMDLSPage />;

  const eq = useEquilibriumV2();
  const { cycles, nowMs: cyclesNowMs } = useCycles(eq.birthday ?? undefined);
  const [mode, setMode] = useWatchMode();
  const isAttune = mode === "attune";

  const activeWorkstream =
    eq.workstreams.find((w) => w.id === eq.activeWorkstreamId) ?? null;
  const activeTasks =
    activeWorkstream && eq.tasksByWorkstream[activeWorkstream.id]
      ? eq.tasksByWorkstream[activeWorkstream.id]
      : [];

  // Flat lookup for DO NOW slot rendering (across all workstreams).
  const taskById = useMemo(() => {
    const map: Record<string, (typeof activeTasks)[number] | undefined> = {};
    for (const tasks of Object.values(eq.tasksByWorkstream)) {
      for (const t of tasks) map[t.id] = t;
    }
    return map;
  }, [eq.tasksByWorkstream]);

  return (
    <main className="eq-v2-page mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <BirthdayPrompt
        birthday={eq.birthday}
        loading={eq.loading}
        userId={eq.user?.id ?? null}
        onSaved={() => void eq.refresh()}
      />
      <header className="mb-8 text-center">
        {/*
          Title + subtitle (Sasha 2026-05-16 round 7):
          • Drop the quotes around Equilibrium — it stands as the title.
          • Subtitle "Biologic Watch and Action Compass" — what this thing
            actually is, in plain words.
          • Title gets a brighter halo + larger size + tracking;
            subtitle quieter underneath.
        */}
        <h1
          className="eq-equilibrium-title eq-text-halo font-serif text-4xl font-semibold tracking-tight text-[#0a1628] sm:text-5xl"
        >
          Equilibrium
        </h1>
        <p className="eq-text-halo mt-2 font-serif text-base text-[#0a1628]/85 sm:text-lg">
          Biologic Watch and Action Compass
        </p>
        <div className="mt-5 flex justify-center">
          <WatchModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      <SectionAnchorNav mode={mode} />

      {/*
        Two modes, binary toggle. Spine §11 (round 5 clean binary):
          ATTUNE = feminine, energetic reading — Synthesis → Lunar →
            Day-of-Week → Solar → Zodiac
          ACT    = masculine, working tool with North Stars on top —
            Mission · Role · Strategy · Workstreams · Tasks · DOING NOW
        Sequence is in the user's hands: attune first, then flip to act.

        Sasha 2026-05-19 — ATTUNE order locked: Synthesis (one-glance
        read) → Current Lunar Energy → Current Day-of-Week Energy →
        Yearly Solar Energy Left → Current Zodiac Energy. Names lead
        with "Current" so each box reads as a present-tense reading
        rather than a generic cycle label.
      */}
      <div
        className={cn(
          "flex flex-col gap-6 transition-opacity duration-300",
          // Animation on ATTUNE↔ACT mode toggle (Sasha 2026-05-19).
          // Mode toggles re-key the wrapper so children remount with a
          // fresh fade-in. Keeps the cross-fade light — no layout shift.
        )}
        key={mode}
        style={{
          animation: "eq-mode-fade 320ms ease-out",
        }}
      >
        {/* ════════════ ATTUNE MODE ═════════════════════════════════ */}

        {/* Synthesis Reading — the energetic reading. Emphasized as the
            one-thing-you-need-to-know glance read (Sasha 2026-05-19).
            Gets an extra `eq-synthesis-emphasis` outer halo + accent
            ring on top of the `emphasized` (liquid-glass-strong) base. */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.synthesis}
            emphasized
            className="eq-synthesis-emphasis"
          >
            <SectionHeader title="Synthesis Reading" />
            <SynthesisCard
              cycles={cycles}
              mission={eq.missionDisplay}
              role={eq.roleDisplay}
              moonFocus={eq.state?.moon_focus_text ?? null}
              cachedReading={eq.state?.last_synthesis_text ?? null}
              cachedAt={eq.state?.last_synthesis_at ?? null}
              onPersist={eq.setLastSynthesis}
              disabled={eq.loading}
            />
          </EquilibriumSectionCard>
        )}

        {/* Current Lunar Energy + Moon Focus */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.lunar}
          >
            <SectionHeader title="Current Lunar Energy" />
            {/* Phase-transition eyebrow (Sasha 2026-05-24) — surfaces
                "since your last visit, the moon moved into Gathering"
                when the phase has shifted between sessions. Quiet
                amber band, dismissible. localStorage-tracked. */}
            <PhaseTransitionEyebrow
              currentSegmentIndex={cycles.lunar.segmentIndex}
              currentPhaseName={cycles.lunar.phase.name}
            />
            <div className="mt-4">
              <CycleEnergyBar
                segments={LUNAR_SEGMENTS}
                // Rotated display: Waning Gibbous = position 0 (Sasha
                // 2026-05-18 round 2). Cycle math returns astronomical
                // index from New Moon = 0; lunarDisplayIndex shifts by
                // +3 mod 8.
                currentIndex={lunarDisplayIndex(cycles.lunar.segmentIndex)}
                progress={cycles.lunar.progress}
                prevLabel={cycles.lunar.prevLabel}
                currentLabel={cycles.lunar.currentLabel}
                nextLabel={cycles.lunar.nextLabel}
                // Element emoji moves INTO the active pill, preceding
                // the text (Sasha 2026-05-19). Pass it as `activePillEmoji`
                // — the eyebrow umbrella is retired since the element
                // now lives where the user reads the current state.
                activePillEmoji={cycles.lunar.holonicPhase.elementEmoji}
                activePillEmojiTooltip={`${cycles.lunar.holonicPhase.element} — the umbrella for ${cycles.lunar.phase.name}`}
                activePillSubLabel={formatPhaseEndsAt(
                  cycles.lunar.phaseEndMs,
                  cycles.lunar.daysRemainingInPhase,
                )}
                // Repetition between pill and `glanceableGuidance` was
                // resolved by collapsing the guidance into the pill
                // (Sasha 2026-05-19: "decide one home for the content").
                // No more separate guidance line below the pill stack.
              />
            </div>
            <MoonFocusInput
              value={eq.state?.moon_focus_text ?? null}
              loading={eq.loading}
              onSave={eq.setMoonFocus}
            />
            {/* Coming-up: next 4 phase boundary moments (Sasha
                2026-05-24). Surfaces phase transitions as scheduling
                anchors — "Planning starts Tue May 27 03:14" — turning
                the spine into a calendar. nowMs is derived from the
                cycles tick (5-min cadence), so the panel refreshes
                without its own timer. */}
            <UpcomingTransitions nowMs={cyclesNowMs} />
          </EquilibriumSectionCard>
        )}

        {/* Current Day-of-Week Energy */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.dayOfWeek}
          >
            <SectionHeader title="Current Day-of-Week Energy" />
            <div className="mt-4">
              <CycleEnergyBar
                segments={DAY_OF_WEEK_SEGMENTS}
                currentIndex={cycles.dayOfWeek.segmentIndex}
                progress={cycles.dayOfWeek.progress}
                prevLabel={cycles.dayOfWeek.prevLabel}
                currentLabel={cycles.dayOfWeek.currentLabel}
                nextLabel={cycles.dayOfWeek.nextLabel}
              />
            </div>
          </EquilibriumSectionCard>
        )}

        {/* Yearly Solar Energy Left */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.solar}
          >
            <SectionHeader title="Yearly Solar Energy Left" />
            <div className="mt-4">
              {/*
                Solar uses its own visual (4-segment tube + golden orb + fractional
                checkpoints) — fundamentally different from the orb-arc used
                by lunar/zodiac/week. Pill labels are birthday-anchored phases per
                philosophical spine §4 — NOT calendar seasons.
              */}
              {(() => {
                const { prev, current, next } = getBirthdayArcPhaseNeighbors(
                  cycles.solar.personalProgress,
                );
                return (
                  <SolarCycleBar
                    progress={cycles.solar.personalProgress}
                    prevLabel={prev}
                    currentLabel={current}
                    nextLabel={next}
                  />
                );
              })()}
            </div>
          </EquilibriumSectionCard>
        )}

        {/* Current Zodiac Energy */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.zodiac}
          >
            <SectionHeader title="Current Zodiac Energy" />
            <div className="mt-4">
              <CycleEnergyBar
                segments={ZODIAC_SEGMENTS}
                currentIndex={cycles.zodiac.segmentIndex}
                progress={cycles.zodiac.progress}
                prevLabel={cycles.zodiac.prevLabel}
                currentLabel={cycles.zodiac.currentLabel}
                nextLabel={cycles.zodiac.nextLabel}
              />
            </div>
          </EquilibriumSectionCard>
        )}

        {/* ════════════ ACT MODE ════════════════════════════════════
          Section ORDER unchanged (Sasha 2026-05-18: "I want to make the
          section calls"). Original spine order preserved:
            Lifelong Dedication → Role → Strategy → Workstreams →
            Intuitive Tasks → DO NOW.

          NEW (2026-05-18 Phase A revised): an `ActiveFocusBanner`
          slim mirror of DO NOW renders ABOVE Lifelong Dedication, only
          when there's something actively in focus. The 1–3 focused
          tasks "replicate up" so the user sees their priority on
          landing without losing the narrative top-down order.
        */}

        {/* Active Focus Banner — slim mirror of DO NOW pinned at top.
            Renders only when focusedTaskIds.length > 0. The full DO NOW
            section at the bottom keeps all the controls. */}
        {!isAttune && eq.focusedTaskIds.length > 0 && (
          <ActiveFocusBanner
            focusedTaskIds={eq.focusedTaskIds}
            taskById={taskById}
            loading={eq.loading}
            onCompleteTask={eq.completeTask}
            onDemoteFromDoNow={eq.demoteFromDoNow}
          />
        )}

        {/* Lifelong Dedication — North Star (first in ACT order)
            "Mission" renamed to "Lifelong Dedication" in Equilibrium UI
            only (backend stays mission_*). Purpose = being; Dedication =
            doing at life scale — the verb-form of being. Spec → Spine §11. */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.mission}
          >
            {/*
              Info copy revised 2026-05-19 (Sasha): the prior "ONE sentence
              starting with 'I'" prescription was too narrow — his own
              Lifelong Dedication ("Help humanity evolve into a consciously
              coordinated civilization by awakening individual genius,
              integrating consciousness with technology, and architecting
              systems that transform human potential into coherent
              collective flourishing.") is multi-clause and doesn't start
              with 'I'. The user manual frames it as "the chosen direction
              your action keeps taking, at life scale" — what / by what
              means / toward what. The new copy invites that shape.
            */}
            <SectionHeader
              title="Lifelong Dedication"
              infoIconCopy="One sentence at life scale — the chosen direction your action keeps taking. WHAT you're devoted to · BY WHAT MEANS · TOWARD WHAT. Example: 'Help humanity evolve into a consciously coordinated civilization by awakening individual genius, integrating consciousness with technology, and architecting systems that transform human potential into coherent collective flourishing.'"
            />
            <MissionSection
              missionDisplay={eq.missionDisplay}
              loading={eq.loading}
              onSetOverride={eq.setMissionOverride}
            />
          </EquilibriumSectionCard>
        )}

        {/* Role — North Star */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.role}
          >
            {/* Info copy 2026-05-19 — paraphrased from
                docs/04-products/equilibrium_user_manual.md → "Role
                (rarely changes). One sentence. Synced from ZoG / Top
                Talent. Your current Top Talent in plain words." */}
            <SectionHeader
              title="Role"
              infoIconCopy="One sentence — your current Top Talent in plain words. Rarely changes. Synced from Top Talent Discovery. The 'how I show up' that the Lifelong Dedication points through."
            />
            <RoleSection
              roleDisplay={eq.roleDisplay}
              loading={eq.loading}
              onSetOverride={eq.setRoleOverride}
            />
          </EquilibriumSectionCard>
        )}

        {/* Current Strategy */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.strategies}
          >
            {/* Centered title (Sasha 2026-05-19: all box titles centered). */}
            <SectionHeader
              title="Current Strategy"
              infoIconCopy="The 1–3 directions translating your Lifelong Dedication into action. One sentence each, action verb first. Set when you have clarity."
            />
            {/*
              Score button — runs alignment scoring against the user's
              "highest expression" (Lifelong Dedication + Role) via the
              score-equilibrium-strategies edge function. Disabled if
              there are no filled strategies OR if neither identity
              anchor is set. Now sits on its own line BELOW the
              centered title so the title stays centered (Sasha
              2026-05-19), right-aligned.
            */}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => void eq.scoreStrategies()}
                disabled={
                  eq.scoringStrategies ||
                  eq.strategies.length === 0 ||
                  (!eq.missionDisplay && !eq.roleDisplay)
                }
                title={
                  eq.strategies.length === 0
                    ? "Add a strategy first"
                    : !eq.missionDisplay && !eq.roleDisplay
                      ? "Set your Lifelong Dedication or Role first"
                      : "Score each strategy 0–100 on alignment with your Lifelong Dedication + Role"
                }
                className="rounded-full border border-[#0a1628]/15 bg-white/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0a1628]/85 backdrop-blur-sm transition hover:bg-white/85 hover:text-[#0a1628] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {eq.scoringStrategies ? "Scoring…" : "Score alignment"}
              </button>
            </div>
            <StrategiesSection
              strategies={eq.strategies}
              loading={eq.loading}
              onUpsert={eq.upsertStrategy}
              onReorder={eq.reorderStrategies}
            />
          </EquilibriumSectionCard>
        )}

        {/* Workstreams */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.workstreams}
          >
            {/* Info copy 2026-05-19 — paraphrased from
                docs/04-products/equilibrium_user_manual.md → "Workstreams
                — the streams of work the strategies open. Up to 7. Drag
                to reorder." Phase note: surface during Seeing onward. */}
            <SectionHeader
              title="Workstreams"
              infoIconCopy="The streams of work the strategies open. Up to 7. Drag to reorder. Capture during the Seeing phase (First Quarter) when the 'how' becomes obvious — write it down before clarity drifts."
            />
            <WorkstreamsSection
              workstreams={eq.workstreams}
              archivedWorkstreams={eq.archivedWorkstreams}
              activeId={eq.activeWorkstreamId}
              loading={eq.loading}
              onSelect={eq.setActiveWorkstreamId}
              onAdd={eq.addWorkstream}
              onRename={eq.renameWorkstream}
              onDelete={eq.deleteWorkstream}
              onRestore={eq.restoreWorkstream}
              onReorder={eq.reorderWorkstreams}
            />
          </EquilibriumSectionCard>
        )}

        {/* Intuitive Tasks */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.goals}
          >
            {/* Info copy 2026-05-19 — paraphrased from
                docs/04-products/equilibrium_user_manual.md → "Intuitive
                Tasks — the concrete moves under each workstream. Up to 7
                per stream." Promote button surfaces the chosen one into
                DOING NOW. */}
            <SectionHeader
              title="Intuitive Tasks"
              infoIconCopy="The concrete moves under each workstream. Up to 7 per stream. Drag to reorder. Press DO NOW on a task to promote it into your active focus."
            />
            <SmartGoalsSection
              workstreamTitle={activeWorkstream?.title ?? null}
              tasks={activeTasks}
              focusedTaskIds={eq.focusedTaskIds}
              loading={eq.loading}
              onAddTask={(text) =>
                activeWorkstream && eq.addTask(activeWorkstream.id, text)
              }
              onRenameTask={eq.renameTask}
              onDeleteTask={eq.deleteTask}
              onReorderTasks={(ids) =>
                activeWorkstream && eq.reorderTasks(activeWorkstream.id, ids)
              }
              onPromoteToDoNow={(id) => { void eq.promoteToDoNow(id); }}
              onDemoteFromDoNow={eq.demoteFromDoNow}
              onCompleteTask={eq.completeTask}
              onUncompleteTask={eq.uncompleteTask}
            />
          </EquilibriumSectionCard>
        )}

        {/* DOING NOW — last section, full controls. Sasha 2026-05-19:
            renamed from "DO NOW" to "DOING NOW" everywhere it describes
            the CURRENT state (the banner heading + this section). The
            per-task promote button on Intuitive Tasks rows keeps "DO NOW"
            because that button is the COMMAND to start (you press it to
            activate). State vs. command — different verbs. */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.doNow}
            emphasized
          >
            {/* Info copy 2026-05-19 — paraphrased from
                docs/04-products/equilibrium_user_manual.md → "DO NOW
                (Harvesting / any execution day). The chosen action
                collapses everything above into one move. Up to 3 tasks.
                1 is recommended. Each task on the Workstream list has a
                DO NOW button — promote it here. Check the box →
                animates complete, cascades to the workstream's
                done-pile." */}
            <SectionHeader
              title="DOING NOW"
              infoIconCopy="The chosen action — everything above collapses into one move. Up to 3 tasks, ONE recommended. Promote tasks here with the DO NOW button on a workstream task. Check the box to complete; it cascades back to the workstream's done-pile."
            />
            <DoNowSection
              focusedTaskIds={eq.focusedTaskIds}
              taskById={taskById}
              loading={eq.loading}
              onCompleteTask={eq.completeTask}
              onDemoteFromDoNow={eq.demoteFromDoNow}
              onReorder={eq.reorderFocus}
            />
          </EquilibriumSectionCard>
        )}

        {/* Harvest — cross-workstream completed-task celebration feed
            (Sasha 2026-05-20). Lives below DOING NOW: the eye flows
            "what am I doing now → what have I reaped." The lunar
            spine has Harvesting + Celebrating as the cycle's peak +
            closure phases; this section makes those visible in the
            ACT-mode reading. Hidden until there's at least one
            completed task (then the section shows a quiet empty state
            inviting the first reap). */}
        {!isAttune && (
          <EquilibriumSectionCard id={SECTION_IDS.harvest}>
            <SectionHeader
              title="Harvest"
              infoIconCopy="What you've reaped. A running celebration of completed tasks across all workstreams, grouped by day. Each entry shows the workstream it came from, how long it was in focus, and when you completed it. Hover the check to restore a task if you closed it by accident."
            />
            <HarvestSection
              completedTasks={eq.completedTasksAll}
              workstreams={eq.workstreams}
              archivedWorkstreams={eq.archivedWorkstreams}
              loading={eq.loading}
              onUncompleteTask={eq.uncompleteTask}
            />
          </EquilibriumSectionCard>
        )}
      </div>
    </main>
  );
};

// ─── Helpers ───────────────────────────────────────────────────

/**
 * SectionHeader — centered box title.
 *
 * Sasha 2026-05-19: "Center all box titles" — Lunar, Solar, Zodiac,
 * Day-of-Week, Synthesis, DOING NOW, and the ACT-mode boxes. The
 * info-icon, when present, floats next to the centered title without
 * pushing it off-axis.
 *
 * The Strategy box has its own header (title + Score-alignment button)
 * that consumes this component but extends it inline; it stays
 * left-aligned by necessity (button on the right). Everything else
 * uses this centered default.
 */
const SectionHeader = ({
  title,
  infoIconCopy,
  align = "center",
}: {
  title: string;
  infoIconCopy?: string;
  align?: "center" | "left";
}) => (
  <div
    className={cn(
      "flex items-center gap-2",
      align === "center" ? "justify-center" : "",
    )}
  >
    <h2 className="eq-text-halo font-serif text-xl font-semibold text-[#0a1628] sm:text-2xl">{title}</h2>
    {infoIconCopy && <InfoPopover content={infoIconCopy} label={infoIconCopy} />}
  </div>
);

const Placeholder = ({ hint }: { hint: string }) => (
  <div className="mt-4 rounded-lg border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-xs uppercase tracking-wider text-[#0a1628]/95">
    {hint}
  </div>
);

export default EquilibriumV2Page;
