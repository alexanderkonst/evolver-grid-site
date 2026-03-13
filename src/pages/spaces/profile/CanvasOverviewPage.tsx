import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import {
  Sparkles,
  BookOpen,
  Users,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CanvasSnapshot,
  CanvasArtifactStatus,
  ArtifactStatusValue,
} from "@/types/canvas";

const ARTIFACT_CONFIG = [
  {
    key: "uniqueness" as const,
    label: "Uniqueness",
    icon: Sparkles,
    question: "Who am I at my brightest?",
    gradient: "from-[#8460ea]/10 to-[#c8b7d8]/20",
  },
  {
    key: "myth" as const,
    label: "Myth",
    icon: BookOpen,
    question: "What must be true for my work to be inevitable?",
    gradient: "from-[#6b8dd6]/10 to-[#8460ea]/15",
  },
  {
    key: "tribe" as const,
    label: "Tribe",
    icon: Users,
    question: "Who recognizes themselves in this myth?",
    gradient: "from-[#7ec8a0]/10 to-[#8460ea]/10",
  },
  {
    key: "pain" as const,
    label: "Pain",
    icon: AlertCircle,
    question: "What's unbearable about their situation?",
    gradient: "from-[#e88e72]/10 to-[#c8b7d8]/15",
  },
  {
    key: "promise" as const,
    label: "Promise",
    icon: ArrowRight,
    question: "What's the master transformational result?",
    gradient: "from-[#8460ea]/10 to-[#6b8dd6]/15",
  },
  {
    key: "lead_magnet" as const,
    label: "Lead Magnet",
    icon: Zap,
    question: "How do people get in the door?",
    gradient: "from-[#e8c87e]/10 to-[#c8b7d8]/10",
  },
  {
    key: "value_ladder" as const,
    label: "Value Ladder",
    icon: TrendingUp,
    question: "What are the ascending containers?",
    gradient: "from-[#7ec8a0]/10 to-[#6b8dd6]/10",
  },
];

const statusBadge = (status: ArtifactStatusValue) => {
  switch (status) {
    case "landed":
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Landed
        </span>
      );
    case "refining":
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          Refining
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#a4a3d0]/20 text-[#a4a3d0]">
          Draft
        </span>
      );
  }
};

const getArtifactPreview = (canvas: CanvasSnapshot, key: string): string | null => {
  const artifact = canvas[key as keyof CanvasSnapshot];
  if (!artifact || typeof artifact !== "object") return null;

  const obj = artifact as unknown as Record<string, unknown>;

  // Try common preview fields
  if (typeof obj.tagline === "string") return obj.tagline;
  if (typeof obj.distillation === "string") return obj.distillation;
  if (typeof obj.statement === "string") return obj.statement;
  if (typeof obj.line === "string") return obj.line;
  if (typeof obj.name === "string") return obj.name;
  if (typeof obj.description === "string") return obj.description;
  if (typeof obj.type === "string") return obj.type;
  if (typeof obj.fullText === "string") return obj.fullText.slice(0, 120) + "…";

  return null;
};

const CanvasOverviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [canvas, setCanvas] = useState<CanvasSnapshot | null>(null);

  useEffect(() => {
    const loadCanvas = async () => {
      try {
        const profileId = await getOrCreateGameProfileId();
        if (!profileId) {
          setLoading(false);
          return;
        }

        // Get the profile's last canvas snapshot ID
        const { data: profileData } = await supabase
          .from("game_profiles")
          .select("last_canvas_snapshot_id" as any)
          .eq("id", profileId)
          .single() as any;

        if (!profileData?.last_canvas_snapshot_id) {
          setLoading(false);
          return;
        }

        // Load canvas snapshot
        const { data: canvasData } = await supabase
          .from("canvas_snapshots" as any)
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

  if (loading) {
    return (
      <GameShellV2>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-[#a4a3d0]">Loading…</div>
        </div>
      </GameShellV2>
    );
  }

  // No Canvas yet
  if (!canvas) {
    return (
      <GameShellV2>
        <div className="max-w-2xl mx-auto p-6 text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8460ea]/10 mb-6">
            <Sparkles className="w-8 h-8 text-[#8460ea]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2c3150] mb-3">
            Your Unique Business Canvas
          </h1>
          <p className="text-[#2c3150]/60 mb-2 max-w-md mx-auto">
            The Canvas is built during a facilitated session where you discover
            your uniqueness, myth, tribe, pain, promise, lead magnet, and value
            ladder.
          </p>
          <p className="text-sm text-[#a4a3d0] mb-8 max-w-sm mx-auto">
            7 artifacts. 1 session. A complete foundation for your unique
            business.
          </p>

          {/* Empty state - show all 7 artifacts as ghosted cards */}
          <div className="grid grid-cols-1 gap-2 mb-8 max-w-md mx-auto text-left">
            {ARTIFACT_CONFIG.map((artifact, i) => (
              <div
                key={artifact.key}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#a4a3d0]/5 border border-[#a4a3d0]/10"
              >
                <div className="w-8 h-8 rounded-lg bg-[#a4a3d0]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-[#a4a3d0]">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2c3150]/40">
                    {artifact.label}
                  </p>
                  <p className="text-xs text-[#a4a3d0]/60 truncate">
                    {artifact.question}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="wabi-primary"
            onClick={() =>
              window.open("https://www.calendly.com/konstantinov", "_blank")
            }
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book a Canvas Session
          </Button>
        </div>
      </GameShellV2>
    );
  }

  // Has Canvas data
  const artifactStatus = (canvas.artifact_status || {}) as CanvasArtifactStatus;

  return (
    <GameShellV2>
      <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Hero */}
        <div className="text-center py-8 bg-gradient-to-br from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5] rounded-2xl px-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/60 mb-4">
            <Sparkles className="w-7 h-7 text-[#8460ea]" />
          </div>
          <p className="text-xs text-[#8460ea] uppercase tracking-widest mb-2">
            Unique Business Canvas · {canvas.version}
          </p>
          <h1 className="text-3xl font-display font-bold text-[#2c3150] mb-2">
            {canvas.tagline || "My Unique Business"}
          </h1>
          {canvas.facilitator && (
            <p className="text-sm text-[#2c3150]/50">
              Facilitated by {canvas.facilitator} · Session{" "}
              {canvas.session_number}
            </p>
          )}
        </div>

        {/* 7 Artifact Cards */}
        <div className="space-y-3">
          {ARTIFACT_CONFIG.map((artifact, i) => {
            const preview = getArtifactPreview(canvas, artifact.key);
            const status = artifactStatus[artifact.key] || "draft";
            const Icon = artifact.icon;

            return (
              <div
                key={artifact.key}
                className={`p-4 rounded-xl border border-[#a4a3d0]/20 bg-gradient-to-r ${artifact.gradient} hover:border-[#8460ea]/30 transition-all group`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-4 h-4 text-[#8460ea]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#a4a3d0] font-mono">
                        {i + 1}.
                      </span>
                      <h3 className="font-semibold text-[#2c3150] text-sm">
                        {artifact.label}
                      </h3>
                      {statusBadge(status)}
                    </div>
                    {preview ? (
                      <p className="text-sm text-[#2c3150]/70 leading-relaxed">
                        {preview}
                      </p>
                    ) : (
                      <p className="text-sm text-[#a4a3d0]/60 italic">
                        {artifact.question}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Session Notes */}
        {canvas.notes && (
          <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
            <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-2 font-medium">
              Session Notes
            </p>
            <p className="text-sm text-[#2c3150]/70 leading-relaxed whitespace-pre-wrap">
              {canvas.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="wabi-primary"
            className="flex-1"
            onClick={() => navigate("/game/build/product-builder")}
          >
            <Zap className="w-4 h-4 mr-2" />
            Build Landing Page
          </Button>
          <Button
            variant="outline"
            className="border-[#a4a3d0]/30 text-[#2c3150]"
            onClick={() => navigate("/the-originals")}
          >
            <Users className="w-4 h-4 mr-1" />
            Community
          </Button>
        </div>
      </div>
    </GameShellV2>
  );
};

export default CanvasOverviewPage;
