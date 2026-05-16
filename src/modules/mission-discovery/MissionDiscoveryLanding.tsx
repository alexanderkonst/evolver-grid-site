/**
 * Mission Discovery — radically streamlined (Day 66 wave M, Sasha 2026-05-16).
 *
 * Single-screen flow. Three states:
 *
 *   1. PROMPT — show the user the prompt to copy to their own AI
 *      (ChatGPT / Claude / Gemini / etc.) + a textarea to paste the
 *      AI's response back. One button: "Find my mission".
 *
 *   2. CONFIRM — extracted one-sentence synthesis pre-filled in an
 *      editable textarea. User can edit before saving. One button:
 *      "Save my mission".
 *
 *   3. SAVED — confirmation that the mission lives on the profile.
 *      JOURNEY pane 2 is auto-opened + active space switched to
 *      JOURNEY so the user can SEE item #8 freshly struck through
 *      (with the draw-in animation in SectionsPanel) plus continue
 *      to the next available step.
 *
 * Removed in this rewrite (was in the prior ~550-line version):
 *   - "Suggest from my Excalibur" entry path
 *   - "Yes, I have clarity" → has-AI → paste/type-manually paths
 *   - "I need to discover it" → Wizard (4-column selector)
 *   - 4-step CommitFlow ceremony (celebration / connect / notifications / submissions)
 *   - Matching against the static 583-mission MISSIONS array
 *   - Multiple-missions / holonic-structure output
 *
 * Persistence: writes `mission_statement` (the sentence) and
 * `mission_discovered_at` (timestamp) to `game_profiles`. Both via
 * `withRetry` so transient network blips don't surface as failure.
 *
 * Post-save side effects: dispatches three custom events so the
 * shell + sections panel react without prop drilling:
 *   - fytt:refresh-journey-progress  → useJourneyProgress refetches
 *   - fytt:open-sections-panel       → GameShellV2 opens pane 2
 *   - fytt:set-active-space          → GameShellV2 switches to JOURNEY
 *
 * The strikethrough animation on JOURNEY item #8 is driven from
 * SectionsPanel itself — it watches for completion state transitions
 * (false → true) and animates the draw-in.
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Clipboard, Check, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { MISSION_DISCOVERY_PROMPT } from "@/prompts";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { withRetry } from "@/lib/withRetry";
import { useToast } from "@/hooks/use-toast";

// ─── Editorial-register tokens (per docs/03-playbooks/ui_playbook.md) ──
// Mirror ZoneOfGeniusOverview / QoL Results. Dark ink on light glass,
// Cormorant for hero, Source Serif for body.
const INK = "#0a1628";
const INK_BODY = "rgba(26,30,58,0.78)";
const INK_MUTED = "rgba(26,30,58,0.55)";
const HALO_SOFT =
    "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)";

// ─── One-sentence-synthesis extractor ──────────────────────────────────
//
// The prompt mandates the AI ends its response with a single line:
//   1 sentence synthesis: <sentence>
//
// Real-world responses include emphasis variants like:
//   **1 sentence synthesis:** <sentence>
//   One-sentence synthesis: <sentence>
//   1-sentence synthesis: <sentence>
//   > 1 sentence synthesis: <sentence>   (markdown blockquote)
//
// The regex is intentionally tolerant.
//
// We use the GLOBAL flag and take the LAST match because the prompt
// itself now embeds Sasha's example (which contains the marker), and
// the AI may echo that example's marker line earlier in its response
// before producing its own. The LAST occurrence is always the AI's
// final synthesis for the user.
//
// If extraction fails we leave the editable textarea empty + toast
// asks the user to type their one sentence. Never blocks the save.

const SYNTHESIS_REGEX =
    /(?:\*{0,2})\s*(?:1|one)[\s\-–]?sentence\s+synthesis\s*[:\-—]\s*(?:\*{0,2})\s*(.+?)\s*(?:\*{0,2})\s*$/gim;

const stripMarkdown = (s: string): string =>
    s.trim().replace(/^[\s>*]+|[\s>*]+$/g, "");

const extractOneSentence = (raw: string): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    // Find ALL matches, take the LAST — the AI's actual final synthesis,
    // not an echo of the prompt example.
    SYNTHESIS_REGEX.lastIndex = 0;
    const matches: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = SYNTHESIS_REGEX.exec(trimmed)) !== null) {
        if (m[1]) matches.push(m[1]);
    }
    if (matches.length > 0) {
        return stripMarkdown(matches[matches.length - 1]);
    }
    return null;
};

type State = "prompt" | "confirm" | "saved";

const MissionDiscoveryLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/";
    const { toast } = useToast();

    const [state, setState] = useState<State>("prompt");
    const [aiResponse, setAiResponse] = useState("");
    const [sentence, setSentence] = useState("");
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    // Day 66 wave M+1 (Sasha 2026-05-16): edit-friction state.
    // savedAt holds the original mission_discovered_at timestamp so
    // the confirmation dialog can name the moment ("you saved this on
    // May 16"). editDialogOpen drives the AlertDialog visibility.
    // The friction matters because a mission is meaningful — a daily-
    // edit-flow would dilute it. The dialog is a gentle pause, not
    // a hard block.
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // On mount, check whether a mission_statement already exists on the
    // user's profile — if so, skip straight to the saved state (so a
    // returning user sees their saved mission, not the empty paste form).
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data: userRes } = await supabase.auth.getUser();
                if (!userRes.user?.id || cancelled) return;
                const { data } = await (supabase as any)
                    .from("game_profiles")
                    .select("mission_statement, mission_discovered_at")
                    .eq("user_id", userRes.user.id)
                    .maybeSingle();
                if (cancelled) return;
                if (data?.mission_statement) {
                    setSentence(data.mission_statement);
                    setSavedAt(data?.mission_discovered_at ?? null);
                    setState("saved");
                }
            } catch {
                // Silent — landing on the prompt state is the safe default.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(MISSION_DISCOVERY_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExtract = () => {
        const extracted = extractOneSentence(aiResponse);
        if (extracted) {
            setSentence(extracted);
        } else {
            // No marker found. Empty sentence; ask the user to type the
            // one sentence they want to save. We deliberately do NOT
            // pre-fill with the full paste — that would dump a long
            // multi-paragraph essay into a textarea sized for one
            // sentence and force the user to delete most of it.
            setSentence("");
            toast({
                title: "Couldn't find a single-sentence summary",
                description: "Type your one-sentence mission below, then save.",
            });
        }
        setState("confirm");
    };

    const handleSave = async () => {
        const finalSentence = sentence.trim();
        if (!finalSentence) {
            toast({
                title: "Add your mission sentence",
                description: "The mission field can't be empty.",
                variant: "destructive",
            });
            return;
        }
        setIsSaving(true);
        try {
            const profileId = await getOrCreateGameProfileId();
            if (!profileId) {
                toast({
                    title: "Couldn't find your profile",
                    description: "Please refresh and try again.",
                    variant: "destructive",
                });
                return;
            }

            // Single update: write the sentence AND stamp the
            // discovered-at timestamp (idempotent — only stamps on
            // first save; subsequent saves only update the text).
            const { error: updateError } = await withRetry(() =>
                (supabase as any)
                    .from("game_profiles")
                    .update({
                        mission_statement: finalSentence,
                        // COALESCE-style: only set if currently null.
                        // We do that by NOT touching it here and running
                        // a second targeted update below that filters
                        // on `is null` for the timestamp.
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", profileId),
            );
            if (updateError) throw updateError;

            // First-write-wins timestamp for the JOURNEY item #8
            // strikethrough trigger. Subsequent edits to the sentence
            // don't move this date — preserves the "moment of discovery."
            await withRetry(() =>
                (supabase as any)
                    .from("game_profiles")
                    .update({ mission_discovered_at: new Date().toISOString() })
                    .eq("id", profileId)
                    .is("mission_discovered_at", null),
            );

            // Day 66 wave M+1: refresh savedAt so a same-session Edit →
            // Save cycle shows the correct date in the confirmation
            // dialog the NEXT time the user clicks Edit. Re-fetch
            // mission_discovered_at — preserves first-write-wins (i.e.,
            // the original moment, not the latest edit moment).
            try {
                const { data: refreshed } = await (supabase as any)
                    .from("game_profiles")
                    .select("mission_discovered_at")
                    .eq("id", profileId)
                    .maybeSingle();
                if (refreshed?.mission_discovered_at) {
                    setSavedAt(refreshed.mission_discovered_at);
                }
            } catch {
                // Non-fatal — dialog falls back to the generic phrasing.
            }

            setState("saved");

            // ── Post-save side effects ──
            // 1. Tell useJourneyProgress instances to refetch so JOURNEY
            //    item #8 picks up the new `mission_discovered_at`.
            // 2. Tell GameShellV2 to switch active space to JOURNEY so
            //    pane 2 shows the JOURNEY rail (where item #8 lives).
            // 3. Tell GameShellV2 to ensure pane 2 is open so the user
            //    sees the strikethrough animation + the next step.
            window.dispatchEvent(new CustomEvent("fytt:refresh-journey-progress"));
            window.dispatchEvent(
                new CustomEvent("fytt:set-active-space", { detail: { spaceId: "journey" } }),
            );
            window.dispatchEvent(new CustomEvent("fytt:open-sections-panel"));
        } catch (err) {
            console.error("[MissionDiscovery] save failed:", err);
            toast({
                title: "Couldn't save your mission",
                description: err instanceof Error ? err.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-12">
            {/* ── Hero ── */}
            <section className="text-center mb-10 sm:mb-12">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full liquid-glass mb-5">
                    <Sparkles className="w-7 h-7" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                </div>
                <h1
                    className="leading-[1.1] tracking-[-0.01em] mb-3"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 700,
                        fontSize: "clamp(2rem, 5vw, 2.75rem)",
                        color: INK,
                        textShadow: HALO_SOFT,
                    }}
                >
                    {state === "saved" ? "My Mission" : "Discover Your Mission"}
                </h1>
                {state === "prompt" && (
                    <p
                        className="italic leading-relaxed mx-auto max-w-[42ch]"
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            fontWeight: 300,
                            fontSize: "clamp(1rem, 2vw, 1.18rem)",
                            color: INK_BODY,
                        }}
                    >
                        Paste your AI's analysis below. We'll capture the one sentence that lands.
                    </p>
                )}
            </section>

            {/* ── State 1: Prompt + paste ── */}
            {state === "prompt" && (
                <div className="space-y-6">
                    {/* The prompt to copy */}
                    <div className="liquid-glass rounded-2xl p-5 sm:p-6">
                        <div className="flex items-start justify-between mb-3 gap-3">
                            <div>
                                <h3
                                    className="mb-1"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 600,
                                        fontSize: "1.18rem",
                                        color: INK,
                                    }}
                                >
                                    Prompt for your AI
                                </h3>
                                <p className="text-xs" style={{ color: INK_MUTED }}>
                                    Copy this. Paste it into ChatGPT, Claude, or whichever AI knows you best.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyPrompt}
                                className="shrink-0"
                            >
                                {copied ? <Check className="w-4 h-4 mr-1" /> : <Clipboard className="w-4 h-4 mr-1" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                        <pre
                            className="text-xs whitespace-pre-wrap p-3 rounded-lg max-h-40 overflow-y-auto"
                            style={{
                                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                                backgroundColor: "rgba(255, 255, 255, 0.45)",
                                color: INK_MUTED,
                                border: "0.5px solid rgba(11,42,90,0.10)",
                            }}
                        >
                            {MISSION_DISCOVERY_PROMPT}
                        </pre>
                    </div>

                    {/* Paste back */}
                    <div>
                        <label
                            className="block mb-2"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "1.05rem",
                                color: INK,
                            }}
                        >
                            Paste your AI's response
                        </label>
                        <Textarea
                            value={aiResponse}
                            onChange={(e) => setAiResponse(e.target.value)}
                            placeholder="Paste the full response — including the '1 sentence synthesis:' line at the end."
                            className="min-h-[220px]"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: INK,
                            }}
                        />
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={handleExtract}
                            disabled={!aiResponse.trim()}
                            className="ring-2 ring-[#d4af37]/40 ring-offset-2"
                        >
                            Find my mission
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ── State 2: Confirm ── */}
            {state === "confirm" && (
                <div className="space-y-6">
                    <div className="liquid-glass-strong rounded-2xl p-6 sm:p-8 text-center"
                         style={{ border: "1px solid rgba(212, 175, 55, 0.32)" }}>
                        <p
                            className="text-[10px] uppercase tracking-[0.32em] font-medium mb-4"
                            style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                        >
                            One sentence
                        </p>
                        <Textarea
                            value={sentence}
                            onChange={(e) => setSentence(e.target.value)}
                            className="min-h-[120px] text-center border-none bg-transparent focus-visible:ring-0 resize-none"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "clamp(1.15rem, 2.4vw, 1.5rem)",
                                color: INK,
                                lineHeight: 1.4,
                            }}
                        />
                        <p
                            className="mt-3 italic"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 300,
                                fontSize: "0.95rem",
                                color: INK_MUTED,
                            }}
                        >
                            Edit if you want. This is what gets saved to your profile.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setState("prompt");
                            }}
                            disabled={isSaving}
                        >
                            ← Back
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleSave}
                            disabled={isSaving || !sentence.trim()}
                            className="ring-2 ring-emerald-400/50 ring-offset-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving…" : "Save my mission"}
                        </Button>
                    </div>
                </div>
            )}

            {/* ── State 3: Saved ── */}
            {state === "saved" && (
                <div className="space-y-6">
                    <div className="liquid-glass-strong rounded-2xl p-6 sm:p-8 text-center"
                         style={{ border: "1px solid rgba(212, 175, 55, 0.32)" }}>
                        <p
                            className="text-[10px] uppercase tracking-[0.32em] font-medium mb-4"
                            style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                        >
                            My mission
                        </p>
                        <p
                            className="mx-auto max-w-[40ch]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "clamp(1.15rem, 2.4vw, 1.5rem)",
                                color: INK,
                                lineHeight: 1.4,
                                textShadow: HALO_SOFT,
                            }}
                        >
                            {sentence}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(true)}
                        >
                            Edit
                        </Button>
                        <Button
                            onClick={() => navigate(returnPath)}
                            className="ring-2 ring-[#d4af37]/40 ring-offset-2"
                        >
                            Back to journey
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Day 66 wave M+1 (Sasha 2026-05-16): edit-friction dialog.
                Mission is a meaningful artifact; clicking Edit shouldn't
                feel like editing a tweet. The pause asks the user to
                acknowledge that the original moment of discovery won't
                be preserved (version history is parked in the roadmap —
                until that lands, every save overwrites the previous
                sentence). Phrasing avoids guilt; just clarifies what
                happens. */}
            <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 700,
                                color: INK,
                            }}
                        >
                            Change your mission?
                        </AlertDialogTitle>
                        <AlertDialogDescription
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 300,
                                color: INK_BODY,
                            }}
                        >
                            {savedAt
                                ? `You saved this on ${new Date(savedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}. Editing replaces it — the original sentence won't be preserved (version history is on the roadmap).`
                                : "Editing replaces your saved mission. The original sentence won't be preserved (version history is on the roadmap)."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep it as is</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setEditDialogOpen(false);
                                setState("confirm");
                            }}
                        >
                            Yes, let me edit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MissionDiscoveryLanding;
