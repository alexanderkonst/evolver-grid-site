import { useEffect, useMemo, useState } from "react";
import { InfoPopover } from "./components/InfoPopover";
import { BirthdayPrompt } from "./components/BirthdayPrompt";
import {
  getAllCyclesV2,
  getBirthdayArcPhaseNeighbors,
  type AllCyclesV2,
} from "@/lib/equilibrium-cycles";
import { CycleEnergyBar } from "./components/CycleEnergyBar";
import { SolarCycleBar } from "./components/SolarCycleBar";
import { MissionSection } from "./components/MissionSection";
import { RoleSection } from "./components/RoleSection";
import { MoonFocusInput } from "./components/MoonFocusInput";
import { StrategiesSection } from "./components/StrategiesSection";
import { WorkstreamsSection } from "./components/WorkstreamsSection";
import { SmartGoalsSection } from "./components/SmartGoalsSection";
import { DoNowSection } from "./components/DoNowSection";
import { SynthesisCard } from "./components/SynthesisCard";
import { SectionAnchorNav } from "./components/SectionAnchorNav";
import { useEquilibriumV2 } from "./hooks/useEquilibriumV2";
import {
  DAY_OF_WEEK_SEGMENTS,
  LUNAR_SEGMENTS,
  SOLAR_SEGMENTS,
  ZODIAC_SEGMENTS,
  lunarDisplayIndex,
} from "./cycleSegments";
import { SECTION_IDS } from "./types";
import type { WatchMode } from "./components/WatchModeToggle";
import {
  HeroHeadline,
  MattePolymerCard,
  EmberBreath,
  ToggleGlassDual,
  SealMedallion,
} from "@/components/mdls";

/**
 * Equilibrium MDLS variant — proof-of-paradigm recompile of EquilibriumV2Page
 * through Multi-Dimensional Living Surface (Stage 8).
 *
 * What changes from EquilibriumV2Page:
 *   • `EquilibriumSectionCard` (liquid-glass)  →  `MattePolymerCard` (matte-polymer)
 *   • `WatchModeToggle` (dark navy pill)        →  `ToggleGlassDual` (coral dot, spring slide)
 *   • Hero title  →  `<HeroHeadline>`
 *   • Synthesis Reading + DO NOW wrapped in `<EmberBreath>` for active under-glow
 *   • Lifelong Dedication card carries a `<SealMedallion>` mandala stamp
 *
 * What stays the same:
 *   • All data hooks (useEquilibriumV2, useWatchMode, useCycles)
 *   • All sub-section components (MissionSection, RoleSection, etc.)
 *   • All cycle bars (SolarCycleBar, CycleEnergyBar)
 *   • Routing, state, data shape — UI layer only
 *
 * Style Guide: docs/specs/equilibrium/equilibrium_mdls_style_guide.md
 * Tracker:     docs/specs/equilibrium/equilibrium_mdls_tracker.md
 * Feature flag: useMdlsFlag (?mdls=1 or localStorage)
 */

function formatPhaseEndsAt(phaseEndMs: number, daysRemaining: number): string {
  const end = new Date(phaseEndMs);
  const day = end.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const days =
    daysRemaining < 1
      ? `${Math.max(0, Math.round(daysRemaining * 24))}h left`
      : `${daysRemaining.toFixed(1)} days left`;
  return `ends ${day} · ${days}`;
}

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
      /* localStorage unavailable */
    }
  };
  return [mode, setMode];
}

function useCycles(birthday?: string): AllCyclesV2 {
  const [cycles, setCycles] = useState<AllCyclesV2>(() =>
    getAllCyclesV2(Date.now(), birthday),
  );

  useEffect(() => {
    const tick = () => setCycles(getAllCyclesV2(Date.now(), birthday));
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [birthday]);

  return cycles;
}

export const EquilibriumMDLSPage = () => {
  const eq = useEquilibriumV2();
  const cycles = useCycles(eq.birthday ?? undefined);
  const [mode, setMode] = useWatchMode();
  const isAttune = mode === "attune";

  const activeWorkstream =
    eq.workstreams.find((w) => w.id === eq.activeWorkstreamId) ?? null;
  const activeTasks =
    activeWorkstream && eq.tasksByWorkstream[activeWorkstream.id]
      ? eq.tasksByWorkstream[activeWorkstream.id]
      : [];

  const taskById = useMemo(() => {
    const map: Record<string, (typeof activeTasks)[number] | undefined> = {};
    for (const tasks of Object.values(eq.tasksByWorkstream)) {
      for (const t of tasks) map[t.id] = t;
    }
    return map;
  }, [eq.tasksByWorkstream]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <BirthdayPrompt
        birthday={eq.birthday}
        loading={eq.loading}
        userId={eq.user?.id ?? null}
        onSaved={() => void eq.refresh()}
      />

      <header className="mb-10">
        <HeroHeadline
          title="Equilibrium"
          subtitle="Biologic Watch and Task Manager"
          variant="serif"
        />
        <div className="mt-6 flex justify-center">
          <ToggleGlassDual
            options={[
              { value: "attune", label: "ATTUNE", title: "ATTUNE — the energetic reading" },
              { value: "act", label: "ACT", title: "ACT — the working tool" },
            ]}
            value={mode}
            onChange={setMode}
            ariaLabel="Watch viewing mode"
            variant="light"
            showCoralDot
          />
        </div>
      </header>

      <SectionAnchorNav mode={mode} />

      <div className="flex flex-col gap-6">
        {/* ════════════ ATTUNE MODE ═════════════════════════════════ */}

        {isAttune && (
          <EmberBreath active>
            <MattePolymerCard id={SECTION_IDS.synthesis} emphasized>
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
            </MattePolymerCard>
          </EmberBreath>
        )}

        {isAttune && (
          <MattePolymerCard id={SECTION_IDS.solar}>
            <SectionHeader title="Solar Energy" />
            <div className="mt-4">
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
          </MattePolymerCard>
        )}

        {isAttune && (
          <MattePolymerCard id={SECTION_IDS.zodiac}>
            <SectionHeader title="Zodiac Energy" />
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
          </MattePolymerCard>
        )}

        {isAttune && (
          <MattePolymerCard id={SECTION_IDS.lunar}>
            <SectionHeader title="Lunar Energy" />
            <div className="mt-4">
              <CycleEnergyBar
                segments={LUNAR_SEGMENTS}
                currentIndex={cycles.lunar.segmentIndex}
                progress={cycles.lunar.progress}
                prevLabel={cycles.lunar.prevLabel}
                currentLabel={cycles.lunar.currentLabel}
                nextLabel={cycles.lunar.nextLabel}
                eyebrow={cycles.lunar.holonicPhase.elementEmoji}
                eyebrowTooltip={`${cycles.lunar.holonicPhase.element} — the umbrella for ${cycles.lunar.phase.name}`}
                activePillSubLabel={formatPhaseEndsAt(
                  cycles.lunar.phaseEndMs,
                  cycles.lunar.daysRemainingInPhase,
                )}
                glanceableGuidance={cycles.lunar.phase.guidance}
              />
            </div>
            <MoonFocusInput
              value={eq.state?.moon_focus_text ?? null}
              loading={eq.loading}
              onSave={eq.setMoonFocus}
            />
          </MattePolymerCard>
        )}

        {isAttune && (
          <MattePolymerCard id={SECTION_IDS.dayOfWeek}>
            <SectionHeader title="Day-of-Week Energy" />
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
          </MattePolymerCard>
        )}

        {/* ════════════ ACT MODE ════════════════════════════════════ */}

        {!isAttune && (
          <MattePolymerCard id={SECTION_IDS.mission}>
            <div className="flex items-start gap-3">
              <SealMedallion size={32} variant="mandala" ariaLabel="Lifelong Dedication seal" />
              <div className="flex-1">
                <SectionHeader
                  title="Lifelong Dedication"
                  infoIconCopy="Your lifelong dedication. What you keep doing with your life-energy — the chosen direction your action keeps taking, at life scale."
                />
                <MissionSection
                  missionDisplay={eq.missionDisplay}
                  loading={eq.loading}
                  onSetOverride={eq.setMissionOverride}
                />
              </div>
            </div>
          </MattePolymerCard>
        )}

        {!isAttune && (
          <MattePolymerCard id={SECTION_IDS.role}>
            <SectionHeader title="Role" />
            <RoleSection
              roleDisplay={eq.roleDisplay}
              loading={eq.loading}
              onSetOverride={eq.setRoleOverride}
            />
          </MattePolymerCard>
        )}

        {!isAttune && (
          <MattePolymerCard id={SECTION_IDS.strategies}>
            <div className="flex items-center gap-2">
              <SectionHeader
                title="Current Strategy"
                infoIconCopy="Set when you have clarity"
              />
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
                className="ml-auto rounded-full bg-[#0a1628] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#0a1628]/85 disabled:cursor-not-allowed disabled:opacity-40"
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
          </MattePolymerCard>
        )}

        {!isAttune && (
          <MattePolymerCard id={SECTION_IDS.workstreams}>
            <SectionHeader title="Workstreams" />
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
          </MattePolymerCard>
        )}

        {!isAttune && (
          <MattePolymerCard id={SECTION_IDS.goals}>
            <SectionHeader title="Intuitive Tasks" />
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
              onPromoteToDoNow={(id) => {
                void eq.promoteToDoNow(id);
              }}
              onCompleteTask={eq.completeTask}
              onUncompleteTask={eq.uncompleteTask}
            />
          </MattePolymerCard>
        )}

        {!isAttune && (
          <EmberBreath active>
            <MattePolymerCard id={SECTION_IDS.doNow} emphasized>
              <SectionHeader title="DO NOW" />
              <DoNowSection
                focusedTaskIds={eq.focusedTaskIds}
                taskById={taskById}
                loading={eq.loading}
                onCompleteTask={eq.completeTask}
              />
            </MattePolymerCard>
          </EmberBreath>
        )}
      </div>

      {/* MDLS attribution footer — dev-discoverable, prod-invisible. */}
      <div className="mt-12 text-center text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/35">
        MDLS v1.0 · contemplative operating surface
      </div>
    </main>
  );
};

// ─── Helpers ───────────────────────────────────────────────────

const SectionHeader = ({
  title,
  infoIconCopy,
}: {
  title: string;
  infoIconCopy?: string;
}) => (
  <div className="flex items-center gap-2">
    <h2 className="eq-text-halo font-serif text-xl font-semibold text-[#0a1628] sm:text-2xl">
      {title}
    </h2>
    {infoIconCopy && <InfoPopover content={infoIconCopy} label={infoIconCopy} />}
  </div>
);

export default EquilibriumMDLSPage;
