/**
 * CelebrationModal — Day 80 Wave 2 (Sasha 2026-05-22), copy revised
 * Day 80 Wave 2.1 in Sasha's voice.
 *
 * Per-save celebration modal fired by Top Talent / Mission / Assets
 * after the user crystallizes a primitive. Implements the
 * Transformative-Result Pattern from
 * docs/03-playbooks/integrated_product_building_workflow.md:
 * the after-screen confirms the result, names what was unlocked,
 * nudges toward the next step (PS), gives ONE primary CTA for the
 * next action + a subtle secondary text link back to JOURNEY.
 *
 * Anatomy (universal across all 4 variants):
 *   - Headline:   "Congrats — {what completed}!"
 *   - Statement:  "You just unlocked {capability}!"
 *   - PS line:    "PS: {next-step nudge}"
 *   - Primary CTA button:  result-verb-noun for the next action
 *                          (path-aware on graduation)
 *   - Secondary text link: "Continue your journey →"
 *
 * Variants:
 *   - "regular"    — Top Talent / Mission / Assets first saves that
 *                    don't yet complete the onboarding stack.
 *   - "graduation" — Assets save that LANDS T+M+A all true. The
 *                    "you've crystallized your collaboration profile"
 *                    milestone. Primary CTA path-aware: match path →
 *                    Find Collaborators; build path → Build A Business.
 *
 * Decoupled from save flows via `fytt:celebrate` custom event.
 * CelebrationModalListener (App.tsx) owns the modal state + once-
 * per-primitive enforcement via sessionStorage flags.
 */

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEntryPath } from "@/contexts/EntryPathContext";

export type CelebrationPrimitive = "talent" | "mission" | "assets";
export type CelebrationVariant = "regular" | "graduation";

export interface CelebrationPayload {
    primitive: CelebrationPrimitive;
    variant: CelebrationVariant;
    /** Optional surfaced result text (mission sentence, archetype name, asset count). */
    resultText?: string;
}

interface CelebrationModalProps {
    payload: CelebrationPayload | null;
    open: boolean;
    onClose: () => void;
}

type CopyBlock = {
    headline: string;
    statement: string;
    ps: string;
    primaryLabel: string;
    primaryPath: string;
};

const REGULAR_COPY: Record<CelebrationPrimitive, CopyBlock> = {
    talent: {
        headline: "Congrats — your Top Talent is articulated!",
        statement: "You just unlocked the foundation of your collaboration profile.",
        ps: "PS: discovering your mission next gives your matches direction.",
        primaryLabel: "Discover My Mission",
        primaryPath: "/mission-discovery",
    },
    mission: {
        headline: "Congrats — your Mission is named!",
        statement: "You just unlocked direction in your collaboration profile.",
        ps: "PS: mapping your assets next adds capacity to the signal.",
        primaryLabel: "Map My Assets",
        primaryPath: "/asset-mapping",
    },
    assets: {
        headline: "Congrats — your Assets are mapped!",
        statement: "You just unlocked capacity in your collaboration profile.",
        ps: "PS: discovering your mission completes your collaboration profile.",
        primaryLabel: "Discover My Mission",
        primaryPath: "/mission-discovery",
    },
};

const CelebrationModal = ({ payload, open, onClose }: CelebrationModalProps) => {
    const navigate = useNavigate();
    const { path: entryPath } = useEntryPath();

    if (!payload) return null;

    const isGraduation = payload.variant === "graduation";

    // Graduation copy is verbatim from Sasha's Day 80 Wave 2.1 spec.
    // Primary CTA is path-aware: match path → Find Collaborators;
    // build path → Build A Business.
    const copy: CopyBlock = isGraduation
        ? {
              headline: "Congrats with completing your collaboration profile!",
              statement: "You just unlocked Collaborator Matching!",
              ps: "PS: taking the optional Quality of Life assessment improves collaboration match quality.",
              primaryLabel:
                  entryPath === "match" ? "Find Collaborators" : "Build A Business",
              primaryPath:
                  entryPath === "match" ? "/game/collaborate/matches" : "/path",
          }
        : REGULAR_COPY[payload.primitive];

    const handlePrimary = () => {
        onClose();
        navigate(copy.primaryPath);
    };

    const handleContinue = () => {
        onClose();
        navigate("/game/journey");
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            {/* Day 91 (Sasha 2026-06-09): tokenized for Aurum. Cream slab +
                navy text read --skin-* tokens; original literals stay as
                fallbacks. Gold accents (border, pill, CTA) are skin-neutral
                and stay literal. */}
            <DialogContent
                className="max-w-md sm:max-w-lg"
                style={{
                    background: "var(--skin-card-fill, rgba(255, 252, 245, 0.96))",
                    border: "0.5px solid rgba(212, 175, 55, 0.55)",
                    boxShadow:
                        "0 16px 40px -20px rgba(10, 22, 40, 0.22), 0 0 22px -8px rgba(212, 175, 55, 0.32)",
                }}
            >
                <DialogHeader className="text-center">
                    <DialogTitle
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontWeight: 700,
                            fontSize: "26px",
                            lineHeight: 1.25,
                            color: "var(--skin-text-primary, #0b2a5a)",
                            letterSpacing: "-0.005em",
                            textAlign: "center",
                            marginBottom: "10px",
                        }}
                    >
                        {copy.headline}
                    </DialogTitle>
                </DialogHeader>

                {/* The "you just unlocked X" statement — set apart so it
                    lands as the moment of arrival. Gold-warm pill behind
                    the text, Cormorant treatment matching the headline. */}
                <div
                    className="mx-auto"
                    style={{
                        background: "rgba(212, 175, 55, 0.08)",
                        border: "0.5px solid rgba(212, 175, 55, 0.40)",
                        borderRadius: "12px",
                        padding: "14px 18px",
                        margin: "4px 0 16px",
                        maxWidth: "94%",
                    }}
                >
                    <p
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontWeight: 600,
                            fontSize: "19px",
                            lineHeight: 1.35,
                            color: "var(--skin-text-primary, #0b2a5a)",
                            textAlign: "center",
                            margin: 0,
                        }}
                    >
                        {copy.statement}
                    </p>
                </div>

                <DialogDescription asChild>
                    <p
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            fontWeight: 500,
                            fontStyle: "italic",
                            fontSize: "13.5px",
                            lineHeight: 1.55,
                            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.72))",
                            textAlign: "center",
                            marginTop: "2px",
                        }}
                    >
                        {copy.ps}
                    </p>
                </DialogDescription>

                {/* Primary action — large gold button, the next step.
                    Secondary "Continue your journey →" sits below as a
                    quieter text link, so the user always knows the
                    homebase is one click away even when the recommended
                    action is to keep moving forward. */}
                <div className="flex flex-col items-center gap-3 mt-5">
                    <button
                        type="button"
                        onClick={handlePrimary}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition-all duration-200 hover:translate-y-[-1px]"
                        style={{
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#fffdf6",
                            background: "linear-gradient(135deg, #b8860b, #7a5108)",
                            border: "0.5px solid rgba(212, 175, 55, 0.55)",
                            boxShadow: "0 8px 22px -6px rgba(122, 81, 8, 0.55)",
                            minWidth: "240px",
                        }}
                    >
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        {copy.primaryLabel}
                    </button>

                    <button
                        type="button"
                        onClick={handleContinue}
                        className="inline-flex items-center gap-1 italic transition-opacity duration-200 hover:opacity-80"
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            fontWeight: 500,
                            fontSize: "13px",
                            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                            textDecoration: "underline",
                            textUnderlineOffset: "3px",
                            background: "transparent",
                            border: "none",
                            padding: "4px 8px",
                            cursor: "pointer",
                        }}
                    >
                        Continue your journey →
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CelebrationModal;
