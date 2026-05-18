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
import { EquilibriumSectionCard } from "./components/EquilibriumSectionCard";
import { MissionSection } from "./components/MissionSection";
import { RoleSection } from "./components/RoleSection";
import { MoonFocusInput } from "./components/MoonFocusInput";
import { StrategiesSection } from "./components/StrategiesSection";
import { WorkstreamsSection } from "./components/WorkstreamsSection";
import { SmartGoalsSection } from "./components/SmartGoalsSection";
import { DoNowSection } from "./components/DoNowSection";
import { SynthesisCard } from "./components/SynthesisCard";
import { SectionAnchorNav } from "./components/SectionAnchorNav";
import { WatchModeToggle, type WatchMode } from "./components/WatchModeToggle";
import { useEquilibriumV2 } from "./hooks/useEquilibriumV2";
import {
  DAY_OF_WEEK_SEGMENTS,
  LUNAR_SEGMENTS,
  SOLAR_SEGMENTS,
  ZODIAC_SEGMENTS,
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

/** Cycle math updates once per minute — cycles change too slowly to need finer. */
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

export const EquilibriumV2Page = () => {
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

  // Flat lookup for DO NOW slot rendering (across all workstreams).
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
      <header className="mb-8 text-center">
        {/*
          Title + subtitle (Sasha 2026-05-16 round 7):
          • Drop the quotes around Equilibrium — it stands as the title.
          • Subtitle "Biologic Watch and Task Manager" — what this thing
            actually is, in plain words.
          • Title gets a brighter halo + larger size + tracking;
            subtitle quieter underneath.
        */}
        <h1
          className="eq-text-halo font-serif text-4xl font-semibold tracking-tight text-[#0a1628] sm:text-5xl"
          style={{
            textShadow:
              "0 0 18px rgba(255,255,255,0.55), 0 0 6px rgba(255,255,255,0.4)",
          }}
        >
          Equilibrium
        </h1>
        <p className="eq-text-halo mt-2 font-serif text-base text-[#0a1628]/85 sm:text-lg">
          Biologic Watch and Task Manager
        </p>
        <div className="mt-5 flex justify-center">
          <WatchModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      <SectionAnchorNav mode={mode} />

      {/*
        Two modes, binary toggle. Spine §11 (round 5 clean binary):
          ATTUNE = feminine, energetic reading — Synthesis · Solar ·
            Zodiac · Lunar+MoonFocus · Day-of-Week
          ACT    = masculine, working tool with North Stars on top —
            Mission · Role · Strategy · Workstreams · Tasks · DO NOW
        Sequence is in the user's hands: attune first, then flip to act.
      */}
      <div className="flex flex-col gap-6">
        {/* ════════════ ATTUNE MODE ═════════════════════════════════ */}

        {/* Synthesis Reading — the energetic reading */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.synthesis}
            emphasized
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

        {/* Solar Energy */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.solar}
          >
            <SectionHeader title="Solar Energy" />
            <div className="mt-4">
              {/*
                Solar uses its own visual (4-segment tube + golden orb + fractional
                "LEFT" checkpoints) — fundamentally different from the orb-arc used
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

        {/* Zodiac Energy */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.zodiac}
          >
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
          </EquilibriumSectionCard>
        )}

        {/* Lunar Energy + Moon Focus */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.lunar}
          >
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
          </EquilibriumSectionCard>
        )}

        {/* Day-of-Week Energy */}
        {isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.dayOfWeek}
          >
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
          </EquilibriumSectionCard>
        )}

        {/* ════════════ ACT MODE ════════════════════════════════════ */}

        {/* Lifelong Dedication — North Star (Sasha 2026-05-16 round 6:
            "Mission" renamed to "Lifelong Dedication" in Equilibrium UI
            only. Backend identifiers stay `mission_*` for cross-platform
            engineering consistency. Purpose = being; Dedication = doing
            at life scale — the verb-form of being. Spec → Spine §11.) */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.mission}
          >
            <SectionHeader
              title="Lifelong Dedication"
              infoIconCopy="Your lifelong dedication. What you keep doing with your life-energy — the chosen direction your action keeps taking, at life scale."
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
            <SectionHeader title="Role" />
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
            <div className="flex items-center gap-2">
              <SectionHeader title="Current Strategy"
                infoIconCopy="Set when you have clarity" />
              {/*
                Score button — runs alignment scoring against the user's
                "highest expression" (Lifelong Dedication + Role) via the
                score-equilibrium-strategies edge function. Disabled if
                there are no filled strategies OR if neither identity
                anchor is set (scoring needs at least one). Sasha 2026-05-17.
              */}
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
          </EquilibriumSectionCard>
        )}

        {/* Workstreams */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.workstreams}
          >
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
          </EquilibriumSectionCard>
        )}

        {/* Intuitive Tasks */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.goals}
          >
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
              onPromoteToDoNow={(id) => { void eq.promoteToDoNow(id); }}
              onCompleteTask={eq.completeTask}
              onUncompleteTask={eq.uncompleteTask}
            />
          </EquilibriumSectionCard>
        )}

        {/* DO NOW */}
        {!isAttune && (
          <EquilibriumSectionCard
            id={SECTION_IDS.doNow}
            emphasized
          >
            <SectionHeader title="DO NOW" />
            <DoNowSection
              focusedTaskIds={eq.focusedTaskIds}
              taskById={taskById}
              loading={eq.loading}
              onCompleteTask={eq.completeTask}
            />
          </EquilibriumSectionCard>
        )}
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
