import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InfoPopover } from "./components/InfoPopover";
import { BirthdayPrompt } from "./components/BirthdayPrompt";
import { useMdlsFlag } from "./useMdlsFlag";
import { EquilibriumMDLSPage } from "./EquilibriumMDLSPage";
import { useCycles, formatPhaseEndsAt } from "./hooks/useCycles";
import { CycleEnergyBar } from "./components/CycleEnergyBar";
import { SolarCycleBar } from "./components/SolarCycleBar";
import { SolarHolonicEssence } from "./components/SolarHolonicEssence";
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
import { generateEquilibriumPdf } from "./generateEquilibriumPdf";
import {
  DAY_OF_WEEK_SEGMENTS,
  LUNAR_SEGMENTS,
  SOLAR_SEGMENTS,
  ZODIAC_SEGMENTS,
  lunarDisplayIndex,
} from "./cycleSegments";
import { SECTION_IDS } from "./types";
import { EQ_INFO_COPY } from "./equilibriumCopy";

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

/* cyclesShallowEqual + CyclesSnapshot + useCycles extracted to
 * ./hooks/useCycles.ts (Sasha 2026-06-14) so both V2 and MDLS pages
 * share the same optimized tick (5-min, hidden-tab pause, de-dupe,
 * nowMs anchor). MDLS-default SOW resource rule R2. */

export const EquilibriumV2Page = () => {
  // MDLS gate scrapped (Sasha 2026-06-14). The MDLS page is broken on
  // disk (Lovable auto-committed a mid-merge state with duplicate
  // useCycles + missing imports) and the matte-polymer parity attempt
  // did not land well visually. Until MDLS is redone cleanly, `?mdls=1`
  // is INERT: V2 (legacy liquid-glass) always renders here. The flag
  // hook and MDLS page stay in the tree as inert dead code so a future
  // rewrite can re-enable the gate without re-plumbing routing.
  // To re-enable: uncomment the two lines below.
  // const isMdls = useMdlsFlag();
  // if (isMdls) return <EquilibriumMDLSPage />;

  const eq = useEquilibriumV2();
  const { cycles, nowMs: cyclesNowMs } = useCycles(eq.birthday ?? undefined);
  const [mode, setMode] = useWatchMode();
  const [exportingPdf, setExportingPdf] = useState(false);
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

  const handleSavePdf = async () => {
    setExportingPdf(true);
    try {
      await generateEquilibriumPdf({ cycles, eq });
    } catch (error) {
      console.warn("[EquilibriumV2Page] PDF export failed:", error);
      toast.error("Couldn't save the PDF. Try again in a moment.");
    } finally {
      setExportingPdf(false);
    }
  };

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
                Arc + golden orb = fraction of the PERSONAL year remaining
                (birthday-anchored). The 5-phase named pills (Big push /
                Steady stretch / …) were removed 2026-06-22 (Sasha):
                redundant with the 4 solar cycles below.
              */}
              <SolarCycleBar progress={cycles.solar.personalProgress} />
            </div>

            {/* The 4 holonic cycles of the personal solar year —
                Seeding → Sprouting → Fruiting → Harvest, anchored to the
                user's birthday so the phase labels match the yearly solar
                progress bar above. */}
            <div className="mt-6 border-t border-white/30 pt-6">
              <SolarHolonicEssence
                currentPhaseId={cycles.solar.personalHolonicPhase.id}
              />
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
              infoIconCopy={EQ_INFO_COPY.mission}
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
              infoIconCopy={EQ_INFO_COPY.role}
            />
            <RoleSection
              roleDisplay={eq.roleDisplay}
              loading={eq.loading}
              onSetOverride={eq.setRoleOverride}
            />
          </EquilibriumSectionCard>
        )}

        {/* Focus — mirrors the ATTUNE-mode Moon Focus pill (Sasha
            2026-06-08). Same underlying `moon_focus_text` on
            `equilibrium_state`; editing here updates the same field
            visible in ATTUNE under Current Lunar Energy. Sits between
            Role and Current Strategy as a North Star row: identity
            (Dedication, Role) → present intent (Focus) → direction
            (Strategy).

            Wrapped in EquilibriumSectionCard so the box width matches
            adjacent Dedication / Role / Strategy cards. The MoonFocusInput
            uses `variant="wide"` to drop its own `max-w-md` cap and
            stretch to the card's inner width. No SectionHeader — the
            pill's internal "Focus:" label is its own header. */}
        {!isAttune && (
          <EquilibriumSectionCard id={SECTION_IDS.focus}>
            <MoonFocusInput
              value={eq.state?.moon_focus_text ?? null}
              loading={eq.loading}
              onSave={eq.setMoonFocus}
              variant="wide"
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
              infoIconCopy={EQ_INFO_COPY.strategies}
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
              onComplete={eq.completeStrategy}
              onDelete={(position) => eq.upsertStrategy(position, null)}
              onIterate={eq.iterateStrategy}
              iteratingPosition={eq.iteratingStrategyPosition}
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
              infoIconCopy={EQ_INFO_COPY.workstreams}
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
              onComplete={eq.completeWorkstream}
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
              infoIconCopy={EQ_INFO_COPY.goals}
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
              infoIconCopy={EQ_INFO_COPY.doNow}
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
              infoIconCopy={EQ_INFO_COPY.harvest}
            />
            <HarvestSection
              completedTasks={eq.completedTasksAll}
              completedStrategies={eq.completedStrategies}
              workstreams={eq.workstreams}
              archivedWorkstreams={eq.archivedWorkstreams}
              loading={eq.loading}
              onUncompleteTask={eq.uncompleteTask}
            />
          </EquilibriumSectionCard>
        )}

        {!isAttune && (
          <div className="flex justify-center pb-4 pt-2">
            <button
              type="button"
              onClick={() => void handleSavePdf()}
              disabled={exportingPdf || eq.loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#0a1628]/15 bg-[#0a1628] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(10,22,40,0.16)] transition hover:-translate-y-0.5 hover:bg-[#111f35] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {exportingPdf ? "Saving PDF..." : "Save the read as PDF"}
            </button>
          </div>
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
