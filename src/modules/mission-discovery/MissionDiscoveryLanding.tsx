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

import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/i18n/format";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Clipboard, Check, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// Day 67 (Sasha 2026-05-16): page-wide editorial CTA migration. Buttons
// previously used shadcn-ui + emerald-bg + gold-ring; now they sing in
// one editorial family with the landing CTA via the shared component.
import { EditorialCta } from "@/components/ui/editorial-cta";
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
// Funnel v2 (Day 77, Sasha 2026-05-20): match-path conditional "Map your
// assets →" CTA on the saved state. Returns null for build-path users.
import MatchFlowCta from "@/components/landing/MatchFlowCta";
import { useEntryPath } from "@/contexts/EntryPathContext";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { withRetry } from "@/lib/withRetry";
import { useToast } from "@/hooks/use-toast";
import { SaveErrorToastBody } from "@/components/ui/save-error-toast";
import ModuleIntro from "@/components/game/ModuleIntro";
import ModuleOutro from "@/components/game/ModuleOutro";
import { getJourneyModule } from "@/data/journeyModules";
import { resolveMissionSentence } from "./missionSynthesis";

// WP-5: this module in the module form (Intro → one button → the flow → Outro).
const MISSION_MODULE = getJourneyModule("discover-mission")!;

// ─── Editorial-register tokens (per docs/03-playbooks/ui_playbook.md) ──
// Mirror ZoneOfGeniusOverview / QoL Results. Dark ink on light glass,
// Cormorant for hero, Source Serif for body.
// Day 80 (Sasha 2026-05-23): INK_BODY + INK_MUTED bumped from 0.78/0.55
// to playbook Strong (1.5×) alphas per Part VIII "Color alphas at Strong"
// (--skin-text-body: 0.97, --skin-text-muted: 0.93). The match-path Mux
// video sits behind this surface; sub-0.92 alphas were dropping out
// of the 8-10:1 contrast band on bright bg patches. HALO_SOFT replaced
// with halo-deep token for the same reason — soft halo doesn't bridge
// variable-luminance pixel ranges.
// Day 91 (Sasha 2026-06-09): tokenized for Aurum — ink reads the skin text
// tokens (cream under dark skins) with the original literals as fallbacks.
const INK = "var(--skin-text-primary, #0a1628)";
const INK_BODY = "var(--skin-text-body, rgba(11,42,90,0.97))";
const INK_MUTED = "var(--skin-text-muted, rgba(11,42,90,0.93))";
const HALO_SOFT =
    "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))";

// ─── One-sentence-synthesis extraction ─────────────────────────────────
//
// The parsing rules (JSON-first → legacy "1 sentence synthesis:" marker →
// Issue #48 bare-single-sentence fallback) live in `missionSynthesis.ts`
// so they're unit-testable without rendering this component. See that
// module for the rationale on each layer.

type State = "prompt" | "confirm" | "saved";

const MissionDiscoveryLanding = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/";
    const { toast } = useToast();
    const { path: entryPath } = useEntryPath();

    const [state, setState] = useState<State>("prompt");
    // WP-5: the Intro shows until the player presses its one button, but only for a player
    // with no saved mission yet (set once the mount check has run, `checked`). A returning
    // player, an edit (?edit=1) and a start-over never see it.
    const [checked, setChecked] = useState(false);
    const [introPending, setIntroPending] = useState(false);
    // True right after a save in this visit: the Outro (a stable screen) takes the place of
    // the saved card. A later visit shows the saved card as before.
    const [justSaved, setJustSaved] = useState(false);
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
    // Day 77 (Sasha 2026-05-20): "start over" friction state. Distinct
    // from Edit — Edit means "tweak my current sentence" (pre-fills the
    // existing text in the confirm textarea); Start Over means "I want
    // to run the AI prompt again with fresh input" (clears aiResponse,
    // sentence, savedAt, and returns to prompt state). Both ultimately
    // overwrite the saved row on next save, but the user mental models
    // are different. The dialog mirrors the edit-friction dialog —
    // gentle pause, no hard block.
    const [startOverDialogOpen, setStartOverDialogOpen] = useState(false);

    // Day 67 (Sasha 2026-05-16): paste-back textarea ref + just-copied
    // pulse flag — Sasha flagged that "there is no continuation after
    // copying the prompt." The paste-back card was below the fold and
    // the user thought the flow dead-ended. Now Copy → smooth-scroll to
    // step 2 + the textarea pulses briefly in the gold register so the
    // "what's next" question answers itself.
    const pasteSectionRef = useRef<HTMLDivElement>(null);
    const [pulsePasteCard, setPulsePasteCard] = useState(false);

    // Day 79 (Sasha 2026-05-22): force the JOURNEY space active on mount.
    // After the auth-bounce from RequireAuth, the shell was restoring
    // whatever space was last active (often ME), so users landed on
    // /mission-discovery with the ME pane in the foreground. The
    // mission-discovery flow lives in JOURNEY (item #8) — that's where
    // attention should be. Save handler already dispatches the same
    // event on save; this mount-time dispatch makes the foregrounding
    // happen from the moment the page loads.
    useEffect(() => {
        if (typeof window === "undefined") return;
        window.dispatchEvent(
            new CustomEvent("fytt:set-active-space", {
                detail: { spaceId: "journey" },
            }),
        );
    }, []);

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
                    // Issue #45 (Sasha 2026-10-14): "EDIT MISSION" from
                    // /game/me/mission used to land here and get bounced
                    // straight to the read-only saved card — the editor was
                    // unreachable without the extra Edit-dialog hop. When the
                    // caller passes ?edit=1, drop the user directly into the
                    // editable "confirm" state with their saved mission
                    // pre-filled, instead of the "saved" card.
                    setState(searchParams.get("edit") === "1" ? "confirm" : "saved");
                } else if (searchParams.get("edit") !== "1") {
                    setIntroPending(true);
                }
            } catch {
                // Silent — landing on the prompt state is the safe default.
            } finally {
                if (!cancelled) setChecked(true);
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

        // Day 67 (Sasha 2026-05-16): scroll the paste-back card into view
        // + briefly pulse it so the next-step path is undeniable. Uses
        // requestAnimationFrame to let React commit the copied state
        // before the scroll fires (smoother visual sequencing).
        requestAnimationFrame(() => {
            pasteSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            setPulsePasteCard(true);
            setTimeout(() => setPulsePasteCard(false), 1400);
        });
    };

    const handleExtract = () => {
        // Issue #48 P1 #5: resolveMissionSentence also accepts a bare
        // single sentence (no JSON, no "1 sentence synthesis:" label) as
        // the mission directly, so pasting just the sentence no longer
        // dead-ends on the "no summary" toast.
        const resolved = resolveMissionSentence(aiResponse);
        if (resolved) {
            setSentence(resolved);
        } else {
            // Still nothing usable (e.g. a long multi-paragraph essay with
            // no marker). Empty sentence; ask the user to type the one
            // sentence they want to save. We deliberately do NOT pre-fill
            // with the full paste — that would dump the essay into a
            // textarea sized for one sentence and force the user to delete
            // most of it.
            setSentence("");
            toast({
                title: t("missionLanding.toastNoSummaryTitle"),
                description: t("missionLanding.toastNoSummaryDesc"),
            });
        }
        setState("confirm");
    };

    const handleSave = async () => {
        const finalSentence = sentence.trim();
        if (!finalSentence) {
            toast({
                title: t("missionLanding.toastEmptyTitle"),
                description: t("missionLanding.toastEmptyDesc"),
                variant: "destructive",
            });
            return;
        }
        setIsSaving(true);
        try {
            const profileId = await getOrCreateGameProfileId();
            if (!profileId) {
                toast({
                    title: t("missionLanding.toastNoProfileTitle"),
                    description: t("missionLanding.toastNoProfileDesc"),
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

            // Issue #52 (Sasha 2026-10-15): when the user arrived via the
            // "EDIT MISSION" entry (?edit=1 from /game/me/mission), SAVE MY
            // MISSION gave no confirmation and left them on the discovery
            // page. Show an explicit "Mission saved" toast and return them
            // to the Mission section they came from. Still refresh the
            // JOURNEY progress so item #8 stays in sync.
            if (searchParams.get("edit") === "1") {
                window.dispatchEvent(new CustomEvent("fytt:refresh-journey-progress"));
                toast({ title: t("missionLanding.toastSavedTitle") });
                navigate("/game/me/mission");
                return;
            }

            setState("saved");
            setJustSaved(true);

            // ── Post-save side effects ──
            // 1. Tell useJourneyProgress instances to refetch so JOURNEY
            //    item #8 picks up the new `mission_discovered_at`.
            // 2. Tell GameShellV2 to switch active space to JOURNEY so
            //    pane 2 shows the JOURNEY rail (where item #8 lives).
            // 3. Tell GameShellV2 to ensure pane 2 is open so the user
            //    sees the strikethrough animation + the next step.
            // The celebration is the Outro (ModuleOutro, WP-5): a stable screen
            // rendered below, not the `fytt:celebrate` modal, which would stack a
            // second set of buttons on top of it.
            window.dispatchEvent(new CustomEvent("fytt:refresh-journey-progress"));
            window.dispatchEvent(
                new CustomEvent("fytt:set-active-space", { detail: { spaceId: "journey" } }),
            );
            window.dispatchEvent(new CustomEvent("fytt:open-sections-panel"));
        } catch (err) {
            // Day 77 (Sasha 2026-05-20): surface the actual error.
            // Supabase errors are PostgrestError-shaped plain objects
            // (not Error instances), so the previous `err instanceof
            // Error` check fell through to a generic "Please try again."
            // and the real cause (RLS / column-missing / 401 / network)
            // was invisible. Now we extract `.message` / `.code` /
            // `.details` from whichever shape the error has and log the
            // full payload to console for ops visibility.
            //
            // Day 80 (Sasha 2026-05-22): special-case the schema-missing
            // error class (Postgres 42703 = undefined_column / 42P01 =
            // undefined_table). These mean a migration is missing in
            // production — the user can't do anything, but the toast
            // tells them clearly so they don't waste time retrying. Real
            // root cause: 3 users hit "Couldn't save mission" on Day 80
            // because the Day 66 mission_statement column migration was
            // never applied to the live DB. Fixed by running the migration;
            // this toast change makes future missed migrations obvious.
            const e: any = err;
            const errMessage =
                (e && typeof e === "object" && typeof e.message === "string" && e.message) ||
                (typeof e === "string" && e) ||
                t("missionLanding.toastSaveTryAgain");
            const errCode = e && typeof e === "object" && typeof e.code === "string" ? e.code : undefined;
            const errDetails = e && typeof e === "object" && typeof e.details === "string" ? e.details : undefined;
            const errHint = e && typeof e === "object" && typeof e.hint === "string" ? e.hint : undefined;
            console.error("[MissionDiscovery] save failed:", {
                message: errMessage,
                code: errCode,
                details: errDetails,
                hint: errHint,
                raw: err,
            });

            // Issue #50: never surface the raw PostgREST line in the toast
            // body. Friendly line up top (schema-drift gets its own); the raw
            // `[code] message — details` sits behind a <details> disclosure.
            const isSchemaError = errCode === "42703" || errCode === "42P01" || errCode === "PGRST204" || errCode === "PGRST205";
            const detail = [errCode ? `[${errCode}] ${errMessage}` : errMessage, errDetails, errHint && `hint: ${errHint}`]
                .filter(Boolean)
                .join(" — ");
            toast({
                title: isSchemaError
                    ? t("missionLanding.toastSaveSchemaTitle")
                    : t("missionLanding.toastSaveFailedTitle"),
                description: (
                    <SaveErrorToastBody detail={detail} isSchemaDrift={isSchemaError} />
                ),
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // WP-5 module form. Before: the Intro (result + one button) until the player starts,
    // unless a mission is already saved. After: the Outro right after a save.
    if (!checked) return null;
    if (introPending) {
        return (
            <div className="px-4 py-8 sm:py-10">
                <ModuleIntro module={MISSION_MODULE} onStart={() => setIntroPending(false)} />
            </div>
        );
    }
    if (state === "saved" && justSaved) {
        return (
            <div className="px-4 py-8 sm:py-10">
                <ModuleOutro module={MISSION_MODULE} result={sentence} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-12">
            {/* ── Hero ── */}
            {/* Day 67 (Sasha 2026-05-16): Sparkles glass-pill ornament
                removed — Sasha flagged it as redundant ornamentation
                above the headline. The pane-3 wordmark is also gone
                (set via hideLogo on the route in App.tsx). The h1 stands
                alone now, which is the editorial register the playbook
                calls for. */}
            <section className="text-center mb-10 sm:mb-12">
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
                    {state === "saved" ? t("missionLanding.heroTitleSaved") : t("missionLanding.heroTitle")}
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
                        {t("missionLanding.heroSubhead")}
                    </p>
                )}
            </section>

            {/* ── State 1: Prompt + paste ──
                Day 67 (Sasha 2026-05-16): the two cards are now explicitly
                numbered (1. Copy prompt · 2. Paste response). Before the
                numbering, Sasha hit Copy and thought the flow ended — the
                paste-back was below the fold and the next-step path was
                invisible. Now Copy → smooth-scroll to the numbered card
                #2 + the card pulses gold briefly (see pulsePasteCard). */}
            {state === "prompt" && (
                <div className="space-y-6">
                    {/* ─ Step 1: copy the prompt ─ */}
                    <div
                        className="liquid-glass rounded-2xl p-5 sm:p-6"
                        style={{ background: "rgba(var(--paper-rgb),0.84)" }}
                    >
                        <div className="flex items-start justify-between mb-3 gap-3">
                            <div>
                                <p
                                    className="mb-1"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 700,
                                        fontSize: "11px",
                                        letterSpacing: "0.22em",
                                        textTransform: "uppercase",
                                        color: "var(--accent-text-strong)",
                                        textShadow: "0 1px 0 rgba(var(--paper-rgb),0.9)",
                                    }}
                                >
                                    {t("missionLanding.step1Eyebrow")}
                                </p>
                                <h3
                                    className="mb-1"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 600,
                                        fontSize: "1.18rem",
                                        color: INK,
                                    }}
                                >
                                    {t("missionLanding.step1Title")}
                                </h3>
                                <p className="text-sm font-medium" style={{ color: INK }}>
                                    {t("missionLanding.step1Desc")}
                                </p>
                            </div>
                            {/* Editorial Copy pill — gold-accent inline button
                                in the same family as the rest of the gold UI.
                                EditorialCta would be too big for an in-card
                                corner button; custom-styled tight pill instead. */}
                            <button
                                type="button"
                                onClick={handleCopyPrompt}
                                className="shrink-0 inline-flex items-center gap-1.5 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    padding: "8px 14px",
                                    color: INK,
                                    background: "linear-gradient(135deg, rgba(var(--accent-bright-rgb),0.22) 0%, rgba(var(--accent-rgb),0.12) 100%)",
                                    border: "0.5px solid rgba(var(--accent-rgb),0.55)",
                                    boxShadow: "0 0 10px -2px rgba(var(--accent-bright-rgb),0.35), inset 0 0 6px -2px rgba(var(--accent-bright-rgb),0.20)",
                                }}
                            >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                                {copied ? t("missionLanding.copyButtonCopied") : t("missionLanding.copyButton")}
                            </button>
                        </div>
                        <pre
                            className="text-xs whitespace-pre-wrap p-3 rounded-lg max-h-40 overflow-y-auto"
                            style={{
                                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                                backgroundColor: "var(--skin-input-fill, rgba(var(--paper-rgb), 0.45))",
                                color: INK_MUTED,
                                border: "0.5px solid var(--skin-hairline, rgba(var(--ink-rgb),0.10))",
                            }}
                        >
                            {MISSION_DISCOVERY_PROMPT}
                        </pre>
                    </div>

                    {/* ─ Step 2: paste the response ─
                        Wrapped in liquid-glass so it visually rhymes with
                        step 1's card. Holds the ref for the Copy-triggered
                        smooth-scroll + a brief gold pulse outline (see
                        boxShadow transition when pulsePasteCard is true). */}
                    <div
                        ref={pasteSectionRef}
                        className="liquid-glass rounded-2xl p-5 sm:p-6 transition-shadow duration-700"
                        style={{
                            background: "rgba(var(--paper-rgb),0.84)",
                            boxShadow: pulsePasteCard
                                ? "0 0 0 2px rgba(var(--accent-bright-rgb),0.55), 0 0 32px -4px rgba(var(--accent-bright-rgb),0.45)"
                                : undefined,
                        }}
                    >
                        <p
                            className="mb-1"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 700,
                                fontSize: "11px",
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color: "var(--accent-text-strong)",
                                textShadow: "0 1px 0 rgba(var(--paper-rgb),0.9)",
                            }}
                        >
                            {t("missionLanding.step2Eyebrow")}
                        </p>
                        <label
                            className="block mb-3"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "1.18rem",
                                color: INK,
                            }}
                        >
                            {t("missionLanding.step2Label")}
                        </label>
                        <Textarea
                            value={aiResponse}
                            onChange={(e) => setAiResponse(e.target.value)}
                            placeholder={t("missionLanding.step2Placeholder")}
                            className="min-h-[220px]"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: INK,
                            }}
                        />
                    </div>

                    <div className="flex justify-center">
                        <EditorialCta
                            variant="primary"
                            label={t("missionLanding.findMyMission")}
                            onClick={() => {
                                // Guard inline (EditorialCta has no disabled
                                // prop). Empty paste = no-op; we don't even
                                // visit handleExtract.
                                if (aiResponse.trim()) handleExtract();
                            }}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        />
                    </div>
                </div>
            )}

            {/* ── State 2: Confirm ── */}
            {state === "confirm" && (
                <div className="space-y-6">
                    <div className="liquid-glass-strong rounded-2xl p-6 sm:p-8 text-center"
                         style={{ border: "1px solid rgba(var(--accent-rgb), 0.32)" }}>
                        <p
                            className="text-[10px] uppercase tracking-[0.32em] font-medium mb-4 flex items-center justify-center gap-1.5"
                            style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                        >
                            <Pencil className="w-3 h-3" aria-hidden="true" />
                            {t("missionLanding.confirmEyebrow")}
                        </p>
                        {/* Day 77 (Sasha 2026-05-20): textarea was
                            `border-none bg-transparent focus-visible:ring-0`
                            — visually invisible, so users couldn't tell
                            it was editable (Sasha's screenshot showed
                            "Edit if you want" copy with no edit
                            affordance). Now: subtle gold-rim border + cream
                            background + stronger focus ring so the field
                            reads as an input, not static text. Cursor stays
                            visible whether or not the textarea is focused. */}
                        <Textarea
                            value={sentence}
                            onChange={(e) => setSentence(e.target.value)}
                            placeholder={t("missionLanding.confirmPlaceholder")}
                            className="min-h-[120px] text-center resize-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--accent-rgb),0.55)] transition-shadow"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "clamp(1.15rem, 2.4vw, 1.5rem)",
                                color: INK,
                                lineHeight: 1.4,
                                background: "var(--skin-input-fill, rgba(var(--paper-warm-rgb), 0.78))",
                                border: "0.5px solid rgba(var(--accent-rgb), 0.45)",
                                boxShadow: "inset 0 1px 2px rgba(var(--shadow-rgb),0.06)",
                                cursor: "text",
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
                            {t("missionLanding.confirmHelper")}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        {/* Day 67: Back + Save both migrated to EditorialCta.
                            Emerald-bg dropped — the gold register from the
                            landing CTA is the canonical "primary" treatment.
                            isSaving gates handleSave inline. */}
                        <EditorialCta
                            variant="secondary"
                            label={t("missionLanding.back")}
                            onClick={() => {
                                if (!isSaving) setState("prompt");
                            }}
                            icon={<span aria-hidden="true">←</span>}
                            rightIcon={null}
                        />
                        <EditorialCta
                            variant="primary"
                            label={isSaving ? t("missionLanding.saving") : t("missionLanding.saveMyMission")}
                            onClick={() => {
                                if (!isSaving && sentence.trim()) handleSave();
                            }}
                            icon={<Check className="w-4 h-4" />}
                            rightIcon={null}
                        />
                    </div>
                </div>
            )}

            {/* ── State 3: Saved ── */}
            {state === "saved" && (
                <div className="space-y-6">
                    <div className="liquid-glass-strong rounded-2xl p-6 sm:p-8 text-center"
                         style={{ border: "1px solid rgba(var(--accent-rgb), 0.32)" }}>
                        <p
                            className="text-[10px] uppercase tracking-[0.32em] font-medium mb-4"
                            style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                        >
                            {t("missionLanding.savedEyebrow")}
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
                        {/* Day 77 (Sasha 2026-05-20): saved-state forward
                            CTA is now path-aware.
                              - Match-path: only "Edit" renders here;
                                MatchFlowCta below carries the forward
                                CTA ("Map your assets →"), so we don't
                                want two primary pills competing.
                              - Build-path: "Edit" + "See on profile"
                                (routes to /game/me/mission, the new
                                Mission section in the ME pane —
                                Sasha's natural next step is "show me
                                where this lives" rather than "back to
                                journey").
                            The Edit dialog (AlertDialog below) gates
                            the destructive edit with a soft pause —
                            kept identical to the prior behavior. */}
                        <EditorialCta
                            variant="secondary"
                            label={t("missionLanding.edit")}
                            onClick={() => setEditDialogOpen(true)}
                            icon={<Pencil className="w-4 h-4" />}
                            rightIcon={null}
                        />
                        {/* 2026-06-10 default flip: match funnel is the
                            default, so MatchFlowCta carries the forward
                            CTA for everyone except explicit ?path=build
                            entries. */}
                        {entryPath === "build" && (
                            <EditorialCta
                                variant="primary"
                                label={t("missionLanding.seeOnProfile")}
                                onClick={() => navigate("/game/me/mission")}
                                rightIcon={<ChevronRight className="w-4 h-4" />}
                            />
                        )}
                    </div>

                    {/* Day 77 (Sasha 2026-05-20): tertiary "start over"
                        link. Returning users who want a NEW mission (not
                        a tweak of the current sentence) need a clear path
                        that clears state and routes them back to the
                        paste-the-prompt step. Underlined italic link in
                        the muted register so it doesn't compete with the
                        primary/secondary CTAs above. */}
                    <div className="flex justify-center mt-2">
                        <button
                            type="button"
                            onClick={() => setStartOverDialogOpen(true)}
                            className="italic transition-opacity duration-200 hover:opacity-80"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontSize: "13px",
                                color: INK_MUTED,
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                            }}
                        >
                            {t("missionLanding.startOverLink")} →
                        </button>
                    </div>

                    {/* Funnel v2 (§4.4.2): match-path "Map your assets →"
                        CTA below the existing actions. Build-path users
                        see only the Edit + See-on-profile row above. */}
                    <MatchFlowCta step="mission" />
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
                            {t("missionLanding.editDialogTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 300,
                                color: INK_BODY,
                            }}
                        >
                            {savedAt
                                ? t("missionLanding.editDialogDescDated", {
                                      date: formatDate(savedAt, { month: "long", day: "numeric", year: "numeric" }),
                                  })
                                : t("missionLanding.editDialogDesc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("missionLanding.editDialogKeep")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setEditDialogOpen(false);
                                setState("confirm");
                            }}
                        >
                            {t("missionLanding.editDialogConfirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Day 77 (Sasha 2026-05-20): start-over confirmation dialog.
                Distinct from the edit-friction dialog — same gentle-
                pause register, different intent. Clears all in-memory
                mission state (aiResponse, sentence, savedAt) and routes
                back to the prompt step so the user can paste a fresh
                AI response. The DB row isn't deleted; it gets replaced
                on next save. */}
            <AlertDialog open={startOverDialogOpen} onOpenChange={setStartOverDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 700,
                                color: INK,
                            }}
                        >
                            {t("missionLanding.startOverDialogTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 300,
                                color: INK_BODY,
                            }}
                        >
                            {savedAt
                                ? t("missionLanding.startOverDialogDescDated", {
                                      date: formatDate(savedAt, { month: "long", day: "numeric", year: "numeric" }),
                                  })
                                : t("missionLanding.startOverDialogDesc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("missionLanding.startOverDialogKeep")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setStartOverDialogOpen(false);
                                setAiResponse("");
                                setSentence("");
                                setState("prompt");
                            }}
                        >
                            {t("missionLanding.startOverDialogConfirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MissionDiscoveryLanding;
