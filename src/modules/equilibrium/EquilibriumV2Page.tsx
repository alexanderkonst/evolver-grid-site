import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { getAllCyclesV2, type AllCyclesV2 } from "@/lib/equilibrium-cycles";
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
      <header className="mb-8 text-center">
        <h1 className="font-serif text-3xl text-[#0a1628] sm:text-4xl">
          "Equilibrium" Biologic Watch
        </h1>
      </header>

      <div className="flex flex-col gap-6">
        {/* ─── BOX 1: Synthesis ──────────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.synthesis}
          variant="glass-strong"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="1. Synthesis Reading" subResult="Centered" />
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
        </PremiumCard>

        {/* ─── BOX 2: Mission ────────────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.mission}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="2. Mission" subResult="Centered" />
          <MissionSection
            missionDisplay={eq.missionDisplay}
            loading={eq.loading}
            onSetOverride={eq.setMissionOverride}
          />
        </PremiumCard>

        {/* ─── BOX 3: Role ───────────────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.role}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="3. Role" subResult="Centered" />
          <RoleSection
            roleDisplay={eq.roleDisplay}
            loading={eq.loading}
            onSetOverride={eq.setRoleOverride}
          />
        </PremiumCard>

        {/* ─── BOX 4: Solar Energy ───────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.solar}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="4. Solar Energy" subResult="In Rhythm" />
          <div className="mt-4">
            {/*
              Solar uses its own visual (4-segment tube + golden orb + fractional
              "LEFT" checkpoints) — fundamentally different from the orb-arc used
              by lunar/zodiac/week. Reference: docs/specs/equilibrium/equilibrium_v2_spec.md §3.1
              "Locked visual references" — solar mock supplied 2026-05-15.
            */}
            <SolarCycleBar
              progress={cycles.solar.personalProgress}
              prevLabel={cycles.solar.prevLabel}
              currentLabel={cycles.solar.currentLabel}
              nextLabel={cycles.solar.nextLabel}
            />
          </div>
        </PremiumCard>

        {/* ─── BOX 5: Zodiac Energy ──────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.zodiac}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="5. Zodiac Energy" subResult="In Rhythm" />
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
        </PremiumCard>

        {/* ─── BOX 6: Lunar Energy + Moon Focus ──────────────────── */}
        <PremiumCard
          id={SECTION_IDS.lunar}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="6. Lunar Energy" subResult="In Rhythm" />
          <div className="mt-4">
            <CycleEnergyBar
              segments={LUNAR_SEGMENTS}
              currentIndex={cycles.lunar.segmentIndex}
              progress={cycles.lunar.progress}
              prevLabel={cycles.lunar.prevLabel}
              currentLabel={cycles.lunar.currentLabel}
              nextLabel={cycles.lunar.nextLabel}
            />
          </div>
          <MoonFocusInput
            value={eq.state?.moon_focus_text ?? null}
            loading={eq.loading}
            onSave={eq.setMoonFocus}
          />
        </PremiumCard>

        {/* ─── BOX 7: Day-of-Week Energy ─────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.dayOfWeek}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="7. Day-of-Week Energy" subResult="In Rhythm" />
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
        </PremiumCard>

        {/* ─── BOX 8: 3 Strategies ───────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.strategies}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader
            title="8. 3 Current Strategies"
            subResult="Directed"
            infoIconCopy="Set when you have clarity"
          />
          <StrategiesSection
            strategies={eq.strategies}
            loading={eq.loading}
            onUpsert={eq.upsertStrategy}
          />
        </PremiumCard>

        {/* ─── BOX 9: Workstreams ────────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.workstreams}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="9. Workstreams" subResult="Directed" />
          <WorkstreamsSection
            workstreams={eq.workstreams}
            activeId={eq.activeWorkstreamId}
            loading={eq.loading}
            onSelect={eq.setActiveWorkstreamId}
            onAdd={eq.addWorkstream}
            onRename={eq.renameWorkstream}
            onDelete={eq.deleteWorkstream}
            onReorder={eq.reorderWorkstreams}
          />
        </PremiumCard>

        {/* ─── BOX 10: SMART Goals ───────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.goals}
          variant="glass"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader
            title="10. Intuitive S.M.A.R.T. Goals"
            subResult="Chosen"
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
            onPromoteToDoNow={(id) => eq.promoteToDoNow(id)}
            onCompleteTask={eq.completeTask}
          />
        </PremiumCard>

        {/* ─── BOX 11: DO NOW ────────────────────────────────────── */}
        <PremiumCard
          id={SECTION_IDS.doNow}
          variant="glass-strong"
          size="md"
          className="scroll-mt-24"
        >
          <SectionHeader title="11. DO NOW" subResult="Chosen + Executed" />
          <DoNowSection
            focusedTaskIds={eq.focusedTaskIds}
            taskById={taskById}
            loading={eq.loading}
            onCompleteTask={eq.completeTask}
          />
        </PremiumCard>
      </div>
    </main>
  );
};

// ─── Helpers ───────────────────────────────────────────────────

const SectionHeader = ({
  title,
  subResult,
  infoIconCopy,
}: {
  title: string;
  subResult: string;
  infoIconCopy?: string;
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <div className="flex items-center gap-2">
      <h2 className="font-serif text-xl text-[#0a1628] sm:text-2xl">{title}</h2>
      {infoIconCopy && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={infoIconCopy}
                className="text-[#0a1628]/30 hover:text-[#0a1628]/60"
              >
                <Info size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {infoIconCopy}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <span className="text-xs uppercase tracking-wider text-[#0a1628]/40">
      {subResult}
    </span>
  </div>
);

const Placeholder = ({ hint }: { hint: string }) => (
  <div className="mt-4 rounded-lg border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-xs uppercase tracking-wider text-[#0a1628]/30">
    {hint}
  </div>
);

export default EquilibriumV2Page;
