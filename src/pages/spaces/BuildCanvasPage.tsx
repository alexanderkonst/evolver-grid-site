import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BookOpen,
  Users,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Target,
  Flame,
  ExternalLink,
} from "lucide-react";
import type {
  CanvasSnapshot,
  CanvasArtifactStatus,
  ArtifactStatusValue,
} from "@/types/canvas";

/* ────────────────────────────────────────
   ARTIFACT CONFIGURATION
   ──────────────────────────────────────── */

const ARTIFACT_META = [
  {
    key: "uniqueness" as const,
    label: "Uniqueness",
    number: 1,
    icon: Sparkles,
    question: "Who am I at my brightest?",
    description: "The intersection no one else occupies",
    color: "#8460ea",
    bgFrom: "rgba(132,96,234,0.08)",
    bgTo: "rgba(200,183,216,0.12)",
  },
  {
    key: "myth" as const,
    label: "Myth",
    number: 2,
    icon: BookOpen,
    question: "What must be true for my work to be inevitable?",
    description: "The lie, the truth, the line that stops the scroll",
    color: "#6b8dd6",
    bgFrom: "rgba(107,141,214,0.08)",
    bgTo: "rgba(132,96,234,0.10)",
  },
  {
    key: "tribe" as const,
    label: "Tribe",
    number: 3,
    icon: Users,
    question: "Who recognizes themselves in this myth?",
    description: "Your people — qualifiers, life situation, language",
    color: "#4aa87c",
    bgFrom: "rgba(74,168,124,0.08)",
    bgTo: "rgba(132,96,234,0.07)",
  },
  {
    key: "pain" as const,
    label: "Pain",
    number: 4,
    icon: AlertCircle,
    question: "What's unbearable about their situation?",
    description: "5-layer forensic trace — pressure to struggle synthesized",
    color: "#e07850",
    bgFrom: "rgba(224,120,80,0.08)",
    bgTo: "rgba(200,183,216,0.10)",
  },
  {
    key: "promise" as const,
    label: "Promise",
    number: 5,
    icon: Target,
    question: "What's the master transformational result?",
    description: "The exact inversion of their pain",
    color: "#8460ea",
    bgFrom: "rgba(132,96,234,0.08)",
    bgTo: "rgba(107,141,214,0.10)",
  },
  {
    key: "lead_magnet" as const,
    label: "Lead Magnet",
    number: 6,
    icon: Zap,
    question: "How do they taste the transformation?",
    description: "The pain card delivered through resonant channels",
    color: "#d4a843",
    bgFrom: "rgba(212,168,67,0.08)",
    bgTo: "rgba(200,183,216,0.07)",
  },
  {
    key: "value_ladder" as const,
    label: "Value Ladder",
    number: 7,
    icon: TrendingUp,
    question: "What are the ascending containers?",
    description: "Free → Entry → Journey → Container",
    color: "#4aa87c",
    bgFrom: "rgba(74,168,124,0.08)",
    bgTo: "rgba(107,141,214,0.07)",
  },
] as const;

/* ────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────── */

const statusConfig: Record<ArtifactStatusValue, { label: string; bg: string; text: string }> = {
  landed: { label: "Landed", bg: "rgba(74,168,124,0.2)", text: "#5fc992" },
  refining: { label: "Refining", bg: "rgba(212,168,67,0.2)", text: "#dbb64a" },
  draft: { label: "Draft", bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.4)" },
};

const getPreview = (canvas: CanvasSnapshot, key: string): string | null => {
  const artifact = canvas[key as keyof CanvasSnapshot];
  if (!artifact || typeof artifact !== "object") return null;
  const obj = artifact as unknown as Record<string, unknown>;
  for (const field of ["tagline", "distillation", "statement", "line", "name", "description", "type", "fullText"]) {
    if (typeof obj[field] === "string") {
      const val = obj[field] as string;
      return val.length > 180 ? val.slice(0, 180) + "…" : val;
    }
  }
  return null;
};

const getPrecision = (canvas: CanvasSnapshot, key: string): number | null => {
  const artifact = canvas[key as keyof CanvasSnapshot];
  if (!artifact || typeof artifact !== "object") return null;
  const obj = artifact as unknown as Record<string, unknown>;
  if (typeof obj.precision === "number") return obj.precision;
  if (typeof obj.precision_score === "number") return obj.precision_score;
  return null;
};

const getDetailFields = (canvas: CanvasSnapshot, key: string): Array<{ label: string; value: string }> => {
  const artifact = canvas[key as keyof CanvasSnapshot];
  if (!artifact || typeof artifact !== "object") return [];
  const obj = artifact as unknown as Record<string, unknown>;
  const fields: Array<{ label: string; value: string }> = [];

  // Different artifacts have different structures
  switch (key) {
    case "uniqueness":
      if (obj.archetype) fields.push({ label: "Archetype", value: String(obj.archetype) });
      if (obj.distillation) fields.push({ label: "Distillation", value: String(obj.distillation) });
      if (obj.tagline) fields.push({ label: "Tagline", value: String(obj.tagline) });
      break;
    case "myth":
      if (obj.lie) fields.push({ label: "The Lie", value: String(obj.lie) });
      if (obj.truth) fields.push({ label: "The Truth", value: String(obj.truth) });
      if (obj.line) fields.push({ label: "The Line", value: String(obj.line) });
      break;
    case "tribe":
      if (obj.name) fields.push({ label: "Tribe Name", value: String(obj.name) });
      if (obj.description) fields.push({ label: "Description", value: String(obj.description) });
      if (Array.isArray(obj.traits) && obj.traits.length) {
        fields.push({ label: "Traits", value: (obj.traits as string[]).join(" · ") });
      }
      break;
    case "pain":
      if (Array.isArray(obj.layers)) {
        (obj.layers as string[]).forEach((layer, i) => {
          const layerNames = ["Pressure", "Consequences", "Cost of Inaction", "Urgency", "Struggle Synthesized"];
          fields.push({ label: layerNames[i] || `Layer ${i + 1}`, value: layer });
        });
      }
      break;
    case "promise":
      if (obj.statement) fields.push({ label: "Promise Statement", value: String(obj.statement) });
      break;
    case "lead_magnet":
      if (obj.type) fields.push({ label: "Format", value: String(obj.type) });
      if (obj.description) fields.push({ label: "Mechanism", value: String(obj.description) });
      break;
    case "value_ladder":
      if (obj.tiers && Array.isArray(obj.tiers)) {
        (obj.tiers as Array<{ name: string; price: string; description: string }>).forEach((tier) => {
          fields.push({ label: `${tier.name} (${tier.price})`, value: tier.description });
        });
      }
      break;
  }

  // Fallback: fullText
  if (fields.length === 0 && typeof obj.fullText === "string") {
    fields.push({ label: "Full Text", value: obj.fullText });
  }

  return fields;
};

/* ────────────────────────────────────────
   PRECISION INDICATOR
   ──────────────────────────────────────── */

const PrecisionDot = ({ score }: { score: number | null }) => {
  if (score === null) return null;
  const color =
    score >= 9.5 ? "#2a7a55" : score >= 8 ? "#6b8dd6" : score >= 6 ? "#d4a843" : "#e07850";
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}40` }}
      />
      <span className="text-xs font-mono" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
};

/* ────────────────────────────────────────
   ARTIFACT CARD
   ──────────────────────────────────────── */

interface ArtifactCardProps {
  meta: (typeof ARTIFACT_META)[number];
  canvas: CanvasSnapshot;
  status: ArtifactStatusValue;
  isExpanded: boolean;
  onToggle: () => void;
}

const ArtifactCard = ({ meta, canvas, status, isExpanded, onToggle }: ArtifactCardProps) => {
  const preview = getPreview(canvas, meta.key);
  const precision = getPrecision(canvas, meta.key);
  const details = getDetailFields(canvas, meta.key);
  const hasContent = preview || details.length > 0;
  const Icon = meta.icon;
  const st = statusConfig[status];

  return (
    <div
      className="rounded-xl ring-1 ring-white/10 transition-all duration-300 group liquid-glass"
      style={{
        borderColor: isExpanded ? `${meta.color}30` : undefined,
        boxShadow: isExpanded ? `0 4px 20px ${meta.color}15` : undefined,
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer"
        aria-expanded={isExpanded}
      >
        {/* Number badge */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300"
          style={{
            background: `${meta.color}12`,
            border: `1px solid ${meta.color}20`,
            transform: isExpanded ? "scale(1.05)" : undefined,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: meta.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-mono text-white/30">{meta.number}.</span>
            <h3 className="text-sm font-semibold text-white">{meta.label}</h3>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: st.bg, color: st.text }}
            >
              {st.label}
            </span>
            <PrecisionDot score={precision} />
          </div>
          {!isExpanded && (
            <p className="text-xs text-white/40 leading-relaxed truncate">
              {preview || meta.question}
            </p>
          )}
        </div>

        {/* Expand chevron */}
        {hasContent && (
          <div className="flex-shrink-0 mt-1 text-white/30 group-hover:text-[#8460ea] transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && hasContent && (
        <div
          className="px-4 pb-4 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ borderTop: `1px solid ${meta.color}10` }}
        >
          {details.map((field, i) => (
            <div key={i}>
              <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: meta.color }}>
                {field.label}
              </p>
              <p className="text-sm text-white/60 leading-relaxed">{field.value}</p>
            </div>
          ))}
          {!details.length && preview && (
            <p className="text-sm text-white/50 leading-relaxed">{preview}</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────
   PROGRESS BAR
   ──────────────────────────────────────── */

const CanvasProgress = ({ status }: { status: CanvasArtifactStatus }) => {
  const values = Object.values(status);
  const landed = values.filter((v) => v === "landed").length;
  const refining = values.filter((v) => v === "refining").length;
  const total = values.length;
  const pctLanded = (landed / total) * 100;
  const pctRefining = ((landed + refining) / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">Canvas Completion</span>
        <span className="font-mono text-[#8460ea]">
          {landed}/{total} landed
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full relative overflow-hidden" style={{ width: `${pctRefining}%` }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, #8460ea 0%, #6894d0 ${(pctLanded / pctRefining) * 100}%, #d4a843 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────
   THE BUILD CANVAS PAGE
   ──────────────────────────────────────── */

const BuildCanvasPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [canvas, setCanvas] = useState<CanvasSnapshot | null>(null);
  const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadCanvas = async () => {
      try {
        const profileId = await getOrCreateGameProfileId();
        if (!profileId) { setLoading(false); return; }

        const { data: profileData } = await supabase
          .from("game_profiles")
          .select("last_canvas_snapshot_id")
          .eq("id", profileId)
          .single();

        if (!profileData?.last_canvas_snapshot_id) { setLoading(false); return; }

        const { data: canvasData } = await supabase
          .from("canvas_snapshots")
          .select("*")
          .eq("id", profileData.last_canvas_snapshot_id)
          .single();

        if (canvasData) {
          setCanvas(canvasData as unknown as CanvasSnapshot);
        }
      } catch (err) {
        console.error("Error loading canvas:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCanvas();
  }, []);

  const toggleArtifact = (key: string) => {
    setExpandedArtifacts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedArtifacts(new Set(ARTIFACT_META.map((a) => a.key)));
  };

  const collapseAll = () => {
    setExpandedArtifacts(new Set());
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <GameShellV2>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="premium-spinner" />
            <p className="text-sm text-white/30 animate-pulse">Loading canvas…</p>
          </div>
        </div>
      </GameShellV2>
    );
  }

  /* ── Empty State: No Canvas Yet ── */
  if (!canvas) {
    return (
      <GameShellV2>
        <ErrorBoundary>
          <div className="max-w-2xl mx-auto p-6 text-center py-16">
            {/* Hero */}
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8460ea]/10 to-[#c8b7d8]/15 mb-5">
                <Layers className="w-9 h-9 text-[#8460ea]" />
              </div>
              <h1 className="text-2xl font-display font-bold text-white mb-2">
                Unique Business Canvas
              </h1>
              <p className="text-white/50 max-w-md mx-auto leading-relaxed">
                The Canvas is built during a facilitated Ignition Session — 60–90 minutes
                where we discover your uniqueness, forge your myth, identify your tribe,
                and design your business around who you already are.
              </p>
            </div>

            {/* The 7 Artifacts — ghosted preview */}
            <div className="grid grid-cols-1 gap-2 mb-8 max-w-md mx-auto text-left">
              {ARTIFACT_META.map((artifact) => (
                <div
                  key={artifact.key}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#a4a3d0]/8"
                  style={{ background: `linear-gradient(135deg, ${artifact.bgFrom}, ${artifact.bgTo})` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${artifact.color}08`, border: `1px solid ${artifact.color}12` }}
                  >
                    <span className="text-xs font-mono" style={{ color: `${artifact.color}80` }}>
                      {artifact.number}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2c3150]/35">{artifact.label}</p>
                    <p className="text-[11px] text-[#a4a3d0]/50 truncate">{artifact.question}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* The derivation chain visual */}
            <div className="mb-8 p-4 rounded-xl bg-white/40 border border-[#a4a3d0]/10 max-w-md mx-auto">
              <p className="text-xs text-[#8460ea] uppercase tracking-widest mb-2 font-medium">
                How it works
              </p>
              <div className="flex items-center justify-center gap-1 text-[11px] text-[#2c3150]/40 font-mono flex-wrap">
                {["Uniqueness", "→", "Myth", "→", "Tribe", "→", "Pain", "→", "Promise", "→", "Magnet", "→", "Ladder"].map(
                  (item, i) => (
                    <span
                      key={i}
                      className={item === "→" ? "text-[#a4a3d0]/30" : "px-1.5 py-0.5 rounded bg-[#a4a3d0]/5"}
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
              <p className="text-[11px] text-[#2c3150]/40 mt-2">
                Each artifact derives from the previous. Change artifact 1 → everything downstream sharpens.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Button
                className="bg-[#8460ea] hover:bg-[#7350d0] text-white px-8 py-5 text-base rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_rgba(132,96,234,0.4)] hover:-translate-y-0.5"
                onClick={() => window.open("https://www.calendly.com/konstantinov", "_blank")}
              >
                <Flame className="w-4 h-4 mr-2" />
                Book Ignition Session — $555
              </Button>
              <p className="text-xs text-[#a4a3d0]">
                60–90 minutes · Full 7-artifact Canvas · AI-compiled in real time
              </p>
            </div>

            {/* If they already have Product Builder data, offer a link */}
            <div className="mt-10 pt-6 border-t border-[#a4a3d0]/10">
              <p className="text-xs text-[#2c3150]/40 mb-3">Already have a product?</p>
              <Button
                variant="outline"
                size="sm"
                className="border-[#a4a3d0]/30 text-[#2c3150]"
                onClick={() => navigate("/game/build/product-builder")}
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                Go to Product Builder
              </Button>
            </div>
          </div>
        </ErrorBoundary>
      </GameShellV2>
    );
  }

  /* ── Has Canvas Data ── */
  const artifactStatus = (canvas.artifact_status || {}) as CanvasArtifactStatus;
  const landedCount = Object.values(artifactStatus).filter((v) => v === "landed").length;

  return (
    <GameShellV2>
      <ErrorBoundary>
        <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-5">
          {/* ── Hero ── */}
          <div
            className="text-center py-8 px-6 rounded-2xl relative overflow-hidden liquid-glass ring-1 ring-white/10"
          >
            {/* Subtle shimmer overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, rgba(132,96,234,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(107,141,214,0.1) 0%, transparent 50%)",
              }}
            />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm mb-4 ring-1 ring-white/10">
                <Layers className="w-7 h-7 text-[#8460ea]" />
              </div>
              <p className="text-[11px] text-[#8460ea] uppercase tracking-[0.2em] mb-2 font-medium">
                Unique Business Canvas · {canvas.version}
              </p>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-white mb-1">
                {canvas.tagline || "My Unique Business"}
              </h1>
              {canvas.facilitator && (
                <p className="text-sm text-white/40">
                  Facilitated by {canvas.facilitator}
                  {canvas.session_number ? ` · Session ${canvas.session_number}` : ""}
                  {canvas.session_date
                    ? ` · ${new Date(canvas.session_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : ""}
                </p>
              )}
            </div>
          </div>

          {/* ── Progress ── */}
          <CanvasProgress status={artifactStatus} />

          {/* ── Controls ── */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">
              7 Artifacts
            </h2>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-[11px] text-[#8460ea] hover:text-[#7350d0] transition-colors"
              >
                Expand all
              </button>
              <span className="text-[#a4a3d0]/30">·</span>
              <button
                onClick={collapseAll}
                className="text-[11px] text-[#8460ea] hover:text-[#7350d0] transition-colors"
              >
                Collapse all
              </button>
            </div>
          </div>

          {/* ── Artifact Cards ── */}
          <div className="space-y-2">
            {ARTIFACT_META.map((meta) => (
              <ArtifactCard
                key={meta.key}
                meta={meta}
                canvas={canvas}
                status={artifactStatus[meta.key] || "draft"}
                isExpanded={expandedArtifacts.has(meta.key)}
                onToggle={() => toggleArtifact(meta.key)}
              />
            ))}
          </div>

          {/* ── Session Notes ── */}
          {canvas.notes && (
            <div className="p-4 bg-white/50 rounded-xl border border-[#a4a3d0]/15">
              <p className="text-[11px] text-[#8460ea] uppercase tracking-wider mb-2 font-medium">
                Session Notes
              </p>
              <p className="text-sm text-[#2c3150]/70 leading-relaxed whitespace-pre-wrap">
                {canvas.notes}
              </p>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-[#8460ea] hover:bg-[#7350d0] text-white rounded-xl transition-all duration-300 hover:shadow-[0_4px_16px_rgba(132,96,234,0.3)] hover:-translate-y-0.5"
              onClick={() => navigate("/game/build/product-builder")}
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Build Landing Page
            </Button>
            <Button
              variant="outline"
              className="border-white/15 text-white/70 rounded-xl hover:bg-white/5"
              onClick={() => navigate("/game/build/refine")}
            >
              <ArrowRight className="w-4 h-4 mr-1.5" />
              Refine Artifacts
            </Button>
          </div>

          {/* ── Quick Links ── */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <button
              className="p-3 rounded-xl liquid-glass ring-1 ring-white/10 hover:ring-[#8460ea]/20 transition-all text-xs text-white/50 hover:text-[#8460ea]"
              onClick={() => navigate("/game/build/my-business")}
            >
              <Eye className="w-4 h-4 mx-auto mb-1" />
              My Business
            </button>
            <button
              className="p-3 rounded-xl liquid-glass ring-1 ring-white/10 hover:ring-[#8460ea]/20 transition-all text-xs text-white/50 hover:text-[#8460ea]"
              onClick={() => navigate("/the-originals")}
            >
              <Users className="w-4 h-4 mx-auto mb-1" />
              The Originals
            </button>
          </div>
        </div>
      </ErrorBoundary>
    </GameShellV2>
  );
};

export default BuildCanvasPage;
