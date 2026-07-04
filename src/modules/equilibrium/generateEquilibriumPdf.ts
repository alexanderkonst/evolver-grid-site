import jsPDF from "jspdf";
import { formatPhaseEndsAt } from "./hooks/useCycles";
import type { EquilibriumV2Data } from "./hooks/useEquilibriumV2";
import type { AllCyclesV2 } from "@/lib/equilibrium-cycles";

interface GenerateEquilibriumPdfInput {
  cycles: AllCyclesV2;
  eq: EquilibriumV2Data;
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 14;

const C = {
  bg: [251, 247, 238] as [number, number, number],
  ink: [10, 22, 40] as [number, number, number],
  muted: [96, 103, 120] as [number, number, number],
  gold: [184, 134, 11] as [number, number, number],
  line: [224, 210, 176] as [number, number, number],
};

class PdfWriter {
  private doc: jsPDF;
  private y = MARGIN;

  constructor(doc: jsPDF) {
    this.doc = doc;
    this.paintPage();
  }

  private paintPage() {
    this.doc.setFillColor(...C.bg);
    this.doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  }

  private ensureSpace(height: number) {
    if (this.y + height > FOOTER_Y) {
      this.doc.addPage();
      this.y = MARGIN;
      this.paintPage();
    }
  }

  title(text: string, subtitle: string) {
    this.doc.setTextColor(...C.ink);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(24);
    this.doc.text(text, MARGIN, this.y);
    this.y += 8;

    this.doc.setTextColor(...C.muted);
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(10);
    this.doc.text(subtitle, MARGIN, this.y);
    this.y += 10;

    this.doc.setDrawColor(...C.gold);
    this.doc.setLineWidth(0.4);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 8;
  }

  section(title: string) {
    this.ensureSpace(18);
    this.y += 3;
    this.doc.setTextColor(...C.gold);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(13);
    this.doc.text(title.toUpperCase(), MARGIN, this.y);
    this.y += 5;
    this.doc.setDrawColor(...C.line);
    this.doc.setLineWidth(0.25);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 5;
  }

  field(label: string, value: string | null | undefined) {
    const clean = normalize(value) || "Not set";
    const labelText = `${label}:`;
    const bodyX = MARGIN + 42;

    this.doc.setFont("times", "bold");
    this.doc.setFontSize(10);
    const lines = this.doc.splitTextToSize(clean, CONTENT_W - 42) as string[];
    this.ensureSpace(Math.max(7, lines.length * 5 + 2));

    this.doc.setTextColor(...C.ink);
    this.doc.text(labelText, MARGIN, this.y);

    this.doc.setFont("times", "normal");
    this.doc.setTextColor(...C.ink);
    this.doc.text(lines, bodyX, this.y);
    this.y += Math.max(7, lines.length * 5 + 2);
  }

  bullet(text: string, meta?: string | null) {
    const clean = normalize(text);
    if (!clean) return;
    const suffix = normalize(meta) ? ` (${normalize(meta)})` : "";
    const lines = this.doc.splitTextToSize(`- ${clean}${suffix}`, CONTENT_W) as string[];
    this.ensureSpace(lines.length * 5 + 2);
    this.doc.setTextColor(...C.ink);
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(10);
    this.doc.text(lines, MARGIN, this.y);
    this.y += lines.length * 5 + 2;
  }

  muted(text: string) {
    const lines = this.doc.splitTextToSize(text, CONTENT_W) as string[];
    this.ensureSpace(lines.length * 5 + 2);
    this.doc.setTextColor(...C.muted);
    this.doc.setFont("times", "italic");
    this.doc.setFontSize(10);
    this.doc.text(lines, MARGIN, this.y);
    this.y += lines.length * 5 + 2;
  }

  finish() {
    const pages = this.doc.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      this.doc.setPage(i);
      this.doc.setTextColor(...C.muted);
      this.doc.setFont("times", "normal");
      this.doc.setFontSize(8);
      this.doc.text(`Equilibrium - page ${i} of ${pages}`, MARGIN, PAGE_H - 8);
    }
  }
}

const normalize = (value: string | null | undefined) =>
  (value ?? "").replace(/\s+/g, " ").trim();

const pct = (n: number) => `${Math.round(n * 100)}%`;

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const taskMeta = (task: { done_at?: string | null; do_now_at?: string | null }) => {
  if (task.done_at) return `done ${formatDateTime(task.done_at) ?? task.done_at}`;
  if (task.do_now_at) return `doing now since ${formatDateTime(task.do_now_at) ?? task.do_now_at}`;
  return null;
};

export async function generateEquilibriumPdf({
  cycles,
  eq,
}: GenerateEquilibriumPdfInput): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pdf = new PdfWriter(doc);
  const generatedAt = new Date();

  pdf.title(
    "Equilibrium Reading",
    `Generated ${generatedAt.toLocaleString()}${eq.user?.email ? ` - ${eq.user.email}` : ""}`,
  );

  pdf.section("Current Attune State");
  pdf.field("Synthesis", eq.state?.last_synthesis_text);
  pdf.field("Synthesis cached", formatDateTime(eq.state?.last_synthesis_at));
  pdf.field("Moon focus", eq.state?.moon_focus_text);
  pdf.field(
    "Lunar",
    `${cycles.lunar.phase.name} - ${cycles.lunar.currentLabel} - ${formatPhaseEndsAt(
      cycles.lunar.phaseEndMs,
      cycles.lunar.daysRemainingInPhase,
    )}`,
  );
  pdf.field("Lunar guidance", cycles.lunar.phase.guidance);
  pdf.field(
    "Day of week",
    `${cycles.dayOfWeek.day.name} - ${cycles.dayOfWeek.day.planet} - ${cycles.dayOfWeek.currentLabel}`,
  );
  pdf.field(
    "Solar",
    `${cycles.solar.birthdayArcPhase} - ${cycles.solar.personalHolonicPhase.label} - ${pct(
      cycles.solar.personalProgress,
    )} through personal year`,
  );
  pdf.field(
    "Zodiac",
    `${cycles.zodiac.current.sign} - ${cycles.zodiac.current.energy} - ${pct(
      cycles.zodiac.progress,
    )} through sign`,
  );

  pdf.section("Lifelong Dedication");
  pdf.field("Dedication", eq.missionDisplay);

  pdf.section("Role");
  pdf.field("Role", eq.roleDisplay);

  pdf.section("Focus");
  pdf.field("Current focus", eq.state?.moon_focus_text);

  pdf.section("Current Strategy");
  const strategyByPosition = new Map(eq.strategies.map((s) => [s.position, s]));
  ([1, 2, 3] as const).forEach((position) => {
    const strategy = strategyByPosition.get(position);
    if (!strategy) {
      pdf.field(`Strategy ${position}`, null);
      return;
    }
    const score =
      typeof strategy.alignment_score === "number"
        ? `score ${strategy.alignment_score}/100`
        : "not scored";
    pdf.field(`Strategy ${position}`, `${strategy.text} - ${score}`);
    if (strategy.alignment_reasoning) {
      pdf.field("Reasoning", strategy.alignment_reasoning);
    }
  });

  pdf.section("Workstreams");
  if (eq.workstreams.length === 0) {
    pdf.muted("No active workstreams yet.");
  } else {
    eq.workstreams.forEach((workstream) => {
      const activeMark = workstream.id === eq.activeWorkstreamId ? "active" : null;
      pdf.bullet(workstream.title, activeMark);
    });
  }
  if (eq.archivedWorkstreams.length > 0) {
    pdf.muted("Completed workstreams");
    eq.archivedWorkstreams.forEach((workstream) => {
      pdf.bullet(workstream.title, `completed ${formatDateTime(workstream.archived_at) ?? ""}`);
    });
  }

  pdf.section("Intuitive Tasks");
  const workstreamLookup = new Map(
    [...eq.workstreams, ...eq.archivedWorkstreams].map((w) => [w.id, w.title]),
  );
  const allActiveTasks = Object.values(eq.tasksByWorkstream).flat();
  if (allActiveTasks.length === 0) {
    pdf.muted("No active tasks yet.");
  } else {
    for (const task of allActiveTasks) {
      const workstreamTitle = workstreamLookup.get(task.workstream_id) ?? "Unknown workstream";
      const focusLabel = eq.focusedTaskIds.includes(task.id) ? "DOING NOW" : workstreamTitle;
      pdf.bullet(task.text, focusLabel);
    }
  }

  pdf.section("Doing Now");
  if (eq.focusedTaskIds.length === 0) {
    pdf.muted("Nothing promoted into DOING NOW.");
  } else {
    const taskById = new Map(allActiveTasks.map((task) => [task.id, task]));
    eq.focusedTaskIds.forEach((taskId) => {
      const task = taskById.get(taskId);
      pdf.bullet(task?.text ?? "Missing task", task ? taskMeta(task) : null);
    });
  }

  pdf.section("Harvest");
  if (eq.completedTasksAll.length === 0 && eq.completedStrategies.length === 0) {
    pdf.muted("No completed tasks or strategies yet.");
  } else {
    eq.completedTasksAll.forEach((task) => {
      const workstreamTitle =
        task.workstream_title_snapshot ??
        workstreamLookup.get(task.workstream_id) ??
        "Unknown workstream";
      pdf.bullet(task.text, `${workstreamTitle} - ${formatDateTime(task.done_at) ?? "done"}`);
    });
    eq.completedStrategies.forEach((strategy) => {
      pdf.bullet(
        strategy.text,
        `strategy completed ${formatDateTime(strategy.done_at) ?? strategy.done_at}`,
      );
    });
  }

  pdf.finish();
  const stamp = generatedAt.toISOString().slice(0, 10);
  doc.save(`equilibrium-reading-${stamp}.pdf`);
}
