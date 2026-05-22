/**
 * CelebrationModal — Day 80 Wave 2 (Sasha 2026-05-22).
 *
 * Per-save celebration modal fired by Top Talent / Mission / Assets
 * after the user crystallizes a primitive. Implements the
 * Transformative-Result Pattern from
 * docs/03-playbooks/integrated_product_building_workflow.md:
 * the after-screen confirms the result, names where it lives,
 * names what it unlocks, gives ONE primary CTA back to JOURNEY.
 *
 * Two variants:
 *   - "regular"    — fires on Top Talent / Mission / Assets first saves
 *                    that don't yet complete the onboarding stack.
 *   - "graduation" — fires on the Assets save that LANDS T+M+A all
 *                    true. The "you're crystallized" milestone.
 *                    Primary CTA shifts from "Continue your journey"
 *                    to the path-aware opening — "Find Collaborators"
 *                    on match path, "Continue your journey" otherwise.
 *
 * Decoupled from save flows via custom event `fytt:celebrate`.
 * CelebrationModalListener (mounted in App.tsx) owns the modal state
 * and once-per-primitive enforcement via sessionStorage.
 */

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEntryPath } from "@/contexts/EntryPathContext";

export type CelebrationPrimitive = "talent" | "mission" | "assets";
export type CelebrationVariant = "regular" | "graduation";

export interface CelebrationPayload {
    /** Which primitive just crystallized */
    primitive: CelebrationPrimitive;
    /** Variant — graduation only fires on Assets save that completes T+M+A */
    variant: CelebrationVariant;
    /** The result text to surface in the body (archetype name, mission sentence, asset count summary) */
    resultText?: string;
}

interface CelebrationModalProps {
    payload: CelebrationPayload | null;
    open: boolean;
    onClose: () => void;
}

const PRIMITIVE_LABELS: Record<CelebrationPrimitive, {
    eyebrow: string;
    headline: string;
    profilePath: string;
    profileLabel: string;
    unlocks: string;
}> = {
    talent: {
        eyebrow: "✦ YOUR TOP TALENT IS SAVED",
        headline: "Your top talent lives on your profile.",
        profilePath: "/game/me/zone-of-genius",
        profileLabel: "See on profile →",
        unlocks: "Your matches and collaborations now read from this.",
    },
    mission: {
        eyebrow: "✦ YOUR MISSION IS SAVED",
        headline: "Your mission lives on your profile.",
        profilePath: "/game/me/mission",
        profileLabel: "See on profile →",
        unlocks: "Your collaborators are now paired against this sentence.",
    },
    assets: {
        eyebrow: "✦ YOUR ASSETS ARE SAVED",
        headline: "Your assets live on your profile.",
        profilePath: "/game/me/assets",
        profileLabel: "See on profile →",
        unlocks: "The matching engine now factors in what you bring.",
    },
};

const CelebrationModal = ({ payload, open, onClose }: CelebrationModalProps) => {
    const navigate = useNavigate();
    const { path: entryPath } = useEntryPath();

    if (!payload) return null;

    const isGraduation = payload.variant === "graduation";
    const labels = PRIMITIVE_LABELS[payload.primitive];

    // Graduation overrides the regular labels.
    const eyebrow = isGraduation ? "✦ YOU'RE CRYSTALLIZED" : labels.eyebrow;
    const headline = isGraduation
        ? "T+M+A complete. The world opens."
        : labels.headline;
    const body = isGraduation
        ? "You've crystallized the three primitives the matching engine needs. Find Collaborators is now open. Quality of Life is optional — it refines match quality but isn't required."
        : labels.unlocks;
    const showResultBlock = !isGraduation && !!payload.resultText;

    // Graduation primary CTA: route to /game/collaborate/matches on match path,
    // else /game/journey. Regular always routes to /game/journey.
    const primaryLabel = isGraduation
        ? entryPath === "match"
            ? "Find Collaborators →"
            : "Continue your journey →"
        : "Continue your journey →";
    const primaryTarget = isGraduation && entryPath === "match"
        ? "/game/collaborate/matches"
        : "/game/journey";

    const handlePrimary = () => {
        onClose();
        navigate(primaryTarget);
    };

    const handleSecondary = () => {
        onClose();
        navigate(labels.profilePath);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent
                className="max-w-md sm:max-w-lg"
                style={{
                    background: "rgba(255, 252, 245, 0.95)",
                    border: "0.5px solid rgba(212, 175, 55, 0.55)",
                    boxShadow:
                        "0 16px 40px -20px rgba(10, 22, 40, 0.20), 0 0 22px -8px rgba(212, 175, 55, 0.30)",
                }}
            >
                <DialogHeader className="text-center">
                    <p
                        style={{
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "#5d4307",
                            marginBottom: "12px",
                        }}
                    >
                        {eyebrow}
                    </p>
                    <DialogTitle
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontWeight: 700,
                            fontSize: "26px",
                            lineHeight: 1.2,
                            color: "#0b2a5a",
                            letterSpacing: "-0.005em",
                            textAlign: "center",
                        }}
                    >
                        {headline}
                    </DialogTitle>
                </DialogHeader>

                {showResultBlock && payload.resultText && (
                    <div
                        className="mx-auto"
                        style={{
                            background: "rgba(212, 175, 55, 0.06)",
                            border: "0.5px solid rgba(212, 175, 55, 0.30)",
                            borderRadius: "12px",
                            padding: "14px 18px",
                            margin: "8px 0 12px",
                            maxWidth: "90%",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 600,
                                fontStyle: "italic",
                                fontSize: "15px",
                                lineHeight: 1.55,
                                color: "#0b2a5a",
                                textAlign: "center",
                                margin: 0,
                            }}
                        >
                            "{payload.resultText}"
                        </p>
                    </div>
                )}

                <DialogDescription asChild>
                    <p
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            fontWeight: 500,
                            fontSize: "14.5px",
                            lineHeight: 1.6,
                            color: "rgba(11, 42, 90, 0.85)",
                            textAlign: "center",
                            marginTop: "6px",
                        }}
                    >
                        {body}
                    </p>
                </DialogDescription>

                {!isGraduation && (
                    <p
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            fontStyle: "italic",
                            fontSize: "13px",
                            color: "rgba(11, 42, 90, 0.55)",
                            textAlign: "center",
                            marginTop: "-4px",
                        }}
                    >
                        Always editable in your profile.
                    </p>
                )}

                <DialogFooter className="sm:flex-row gap-2 sm:gap-3 sm:justify-center mt-4">
                    <button
                        type="button"
                        onClick={handleSecondary}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                        style={{
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            letterSpacing: "0.10em",
                            textTransform: "uppercase",
                            color: "#0b2a5a",
                            background: "transparent",
                            border: "0.5px solid rgba(11, 42, 90, 0.30)",
                        }}
                    >
                        {labels.profileLabel}
                    </button>
                    <button
                        type="button"
                        onClick={handlePrimary}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-1px]"
                        style={{
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            letterSpacing: "0.10em",
                            textTransform: "uppercase",
                            color: "#fffdf6",
                            background: "linear-gradient(135deg, #b8860b, #7a5108)",
                            border: "0.5px solid rgba(212, 175, 55, 0.55)",
                            boxShadow: "0 6px 18px -6px rgba(122, 81, 8, 0.5)",
                        }}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        {primaryLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CelebrationModal;
