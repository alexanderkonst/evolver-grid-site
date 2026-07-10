/**
 * Profile PDF Generator — Day 79 (Sasha 2026-05-15).
 *
 * One unified portable artifact of EVERYTHING the user has produced
 * across the platform's ME space:
 *
 *   • Cover            — name, archetype, bullseye, date generated
 *   • Top Talent       — full editorial set sourced from generateZogPdf
 *                        (reuses renderHero / renderHowItShowsUp /
 *                        renderThreeKeyTalents / renderTopShadow /
 *                        renderPathOfMastery / renderOneAction /
 *                        renderIdealEnvironments /
 *                        renderComplementaryPartner / renderMonetization
 *                        verbatim — single source of truth for the
 *                        Top Talent register).
 *   • Mission          — game_profiles.mission_statement (canonical,
 *                        written by Mission Discovery) with the
 *                        missions-table statement + categories as
 *                        fallback.
 *   • Assets           — user_assets grouped by type (Expertise,
 *                        Experiences, Networks, Resources, IP,
 *                        Influence).
 *   • Quality of Life  — qol_snapshots latest 8-domain stages, text-
 *                        based bar render (radar-chart rasterization
 *                        deferred to Wave 2).
 *   • Footer           — page N of M, brand.
 *
 * Empty-section handling: if a data source is missing for the user,
 * that section renders with an editorial "Not yet completed — start
 * here" line instead of being skipped. Keeps the PDF continuous; the
 * user sees what they have AND what's available to fill in.
 *
 * Entry point: button on Settings → Export tab. Future mount points
 * (Top Talent Overview footer, etc.) call the same function — no
 * caller arguments, the generator fetches its own data.
 *
 * Filename: my-profile-<archetype-slug>-YYYY-MM-DD.pdf.
 */

import jsPDF from "jspdf";
import { formatDate } from "@/i18n/format";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import type { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import { ASSET_TYPES, type AssetTypeId } from "@/modules/asset-mapping/data/assetTypes";
import { mapTalentsJson } from "@/modules/profile-space/useProfileSpaceData";
import { buildHistoryEvents } from "@/modules/profile-space/changeLines";
import type {
    AssetLite as HistoryAssetLite,
    HistoryEvent,
    ProfileSpaceData,
    QolSnapshotLite as HistoryQolSnapshotLite,
    ZogSnapshotLite as HistoryZogSnapshotLite,
} from "@/modules/profile-space/types";
import {
    // primitives
    PdfBuilder,
    setupFonts,
    C,
    PAGE_W,
    FOOTER_Y,
    MARGIN,
    CONTENT_W,
    SECTION_GAP,
    slugifyArchetype,
    formatBullseye,
    stripDecorativeGlyphs,
    // section renderers (Top Talent — reused verbatim)
    renderHero,
    renderHowItShowsUp,
    renderThreeKeyTalents,
    renderTopShadow,
    renderOneAction,
    renderPathOfMastery,
    renderIdealEnvironments,
    renderComplementaryPartner,
    renderMonetization,
} from "@/modules/zone-of-genius/generateZogPdf";

// ─────────────────────────────────────────────────────────────────────
// Types — local shapes for the data sources we fetch beyond Top Talent
// ─────────────────────────────────────────────────────────────────────

interface MissionData {
    statement: string | null;
    categories: string[] | null;
}

interface AssetRow {
    id?: string;
    title: string;
    type_id: string;
    description: string | null;
    source: string | null;
    created_at?: string | null;
}

interface QolData {
    growth_stage: number;
    happiness_stage: number;
    health_stage: number;
    home_stage: number;
    impact_stage: number;
    love_relationships_stage: number;
    social_ties_stage: number;
    wealth_stage: number;
    created_at: string;
}

interface ProfileBundle {
    userName: string | null;
    userEmail: string | null;
    appleseed: AppleseedData | null;
    excalibur: ExcaliburData | null;
    mission: MissionData | null;
    assets: AssetRow[];
    qol: QolData | null;
    // Day 95 (Sasha 2026-06-13): paid-access flag. The deeper Top Talent
    // sections in the PDF are paid content — a free user must not be able
    // to export them via Settings → Export. True iff paid / coupon / tier.
    // FAIL-OPEN: defaults true and stays true if the access read errors
    // (e.g. before the migration is applied), mirroring useDeeperAccess.
    hasDeeperAccess: boolean;
    // Day 119 (Profile Space D5, Sasha 2026-07-09): full snapshot
    // histories + mission discovery date, added ONLY to power the
    // "Profile history" section via changeLines.ts's buildHistoryEvents
    // — the rest of the PDF still reads appleseed/excalibur/qol (latest)
    // as before. Cheap re-queries of tables already touched above.
    zogHistory: HistoryZogSnapshotLite[];
    qolHistory: HistoryQolSnapshotLite[];
    missionDiscoveredAt: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Data fetcher — pulls everything the user has in a single pass
// ─────────────────────────────────────────────────────────────────────

async function loadProfileBundle(): Promise<ProfileBundle> {
    const bundle: ProfileBundle = {
        userName: null,
        userEmail: null,
        appleseed: null,
        excalibur: null,
        mission: null,
        assets: [],
        qol: null,
        hasDeeperAccess: true, // fail-open default (see interface note)
        zogHistory: [],
        qolHistory: [],
        missionDiscoveredAt: null,
    };

    // Auth — user identity
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        bundle.userEmail = user.email ?? null;
        // user_metadata may carry a friendly name; fall back to email-localpart
        const metaName =
            (user.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
            (user.user_metadata as { full_name?: string; name?: string } | undefined)?.name ??
            null;
        bundle.userName = metaName ?? (user.email ? user.email.split("@")[0] : null);
    }

    const profileId = await getOrCreateGameProfileId();
    if (!profileId) {
        // No profile → return mostly-empty bundle. Caller will render
        // a cover + empty-state pages.
        return bundle;
    }

    // Top Talent — pointer in game_profiles → latest zog_snapshot
    try {
        // Day 79 fix (Sasha 2026-06-09): the select previously asked for
        // `mission_override_text`, which is NOT a game_profiles column
        // (it lives on equilibrium_state, the sibling product). PostgREST
        // rejects the whole query on an unknown column, and because we
        // ignored `error`, the failure was silent: profileData came back
        // null, mission_statement never got read, and the Mission section
        // rendered "Not yet discovered" for users who HAVE a mission.
        // (Top Talent still rendered only because the snapshot-pointer
        // fallback below re-queries by profile_id — it masked the bug.)
        const { data: profileData, error: profileError } = await supabase
            .from("game_profiles")
            .select("last_zog_snapshot_id, mission_statement, mission_discovered_at")
            .eq("id", profileId)
            .single();
        if (profileError) {
            console.warn("[generateProfilePdf] game_profiles fetch failed:", profileError);
        }

        let snapshotId =
            (profileData as { last_zog_snapshot_id?: string | null } | null)
                ?.last_zog_snapshot_id ?? null;

        // Same defensive fallback as ZoGPerspectiveView — if the
        // pointer is null, fetch the most recent snapshot for this
        // profile, then heal the pointer for next read.
        if (!snapshotId) {
            const { data: latest } = await supabase
                .from("zog_snapshots")
                .select("id")
                .eq("profile_id", profileId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            snapshotId = (latest as { id?: string } | null)?.id ?? null;
            if (snapshotId) {
                void supabase
                    .from("game_profiles")
                    .update({ last_zog_snapshot_id: snapshotId })
                    .eq("id", profileId);
            }
        }

        if (snapshotId) {
            const { data: snapshotData } = await supabase
                .from("zog_snapshots")
                .select("appleseed_data, excalibur_data")
                .eq("id", snapshotId)
                .single();
            bundle.appleseed =
                (snapshotData as { appleseed_data?: unknown } | null)?.appleseed_data as
                    | AppleseedData
                    | null ?? null;
            bundle.excalibur =
                (snapshotData as { excalibur_data?: unknown } | null)?.excalibur_data as
                    | ExcaliburData
                    | null ?? null;
        }

        // Mission — game_profiles.mission_statement is the canonical
        // source (written by MissionDiscoveryLanding, read by UBB +
        // ProfileMissionSection). The missions table is the secondary
        // fallback for categories + legacy rows.
        const profileStatement =
            (profileData as { mission_statement?: string | null } | null)
                ?.mission_statement ?? null;
        bundle.missionDiscoveredAt =
            (profileData as { mission_discovered_at?: string | null } | null)
                ?.mission_discovered_at ?? null;

        const { data: missionRow } = await supabase
            .from("missions")
            .select("statement, categories")
            .eq("profile_id", profileId)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        const missionTableStatement =
            (missionRow as { statement?: string | null } | null)?.statement ?? null;
        const categories =
            (missionRow as { categories?: string[] | null } | null)?.categories ?? null;

        const resolvedStatement =
            profileStatement ?? missionTableStatement ?? null;
        if (resolvedStatement || (categories && categories.length > 0)) {
            bundle.mission = { statement: resolvedStatement, categories };
        }
    } catch (err) {
        console.warn("[generateProfilePdf] Top Talent / Mission fetch failed:", err);
    }

    // Deeper-access read — ISOLATED in its own query so that if the
    // activation_unlocked_at column doesn't exist yet (pre-migration),
    // the failure can't poison the Top Talent / Mission read above. Same
    // fail-open contract as useDeeperAccess: on error, hasDeeperAccess
    // stays true (default), so grandfathered users keep their full PDF
    // before the migration lands; after it, free users get the gated PDF.
    try {
        const { data: accessRow, error: accessErr } = await supabase
            .from("game_profiles")
            .select("activation_unlocked_at, entitlement_tier")
            .eq("id", profileId)
            .maybeSingle();
        if (accessErr) {
            console.warn("[generateProfilePdf] access read failed — failing open:", accessErr.message);
        } else {
            const unlockedAt = (accessRow as { activation_unlocked_at?: string | null } | null)
                ?.activation_unlocked_at ?? null;
            const tier = (accessRow as { entitlement_tier?: string | null } | null)
                ?.entitlement_tier ?? "tasting";
            bundle.hasDeeperAccess = unlockedAt != null || tier !== "tasting";
        }
    } catch (err) {
        console.warn("[generateProfilePdf] access read threw — failing open:", err);
    }

    // ZoG history — Day 119 (D5): all snapshots for this profile, for
    // the "Profile history" section. Cheap re-query of the same table
    // already read above for the latest appleseed/excalibur.
    try {
        const { data: zogRows, error: zogHistErr } = await supabase
            .from("zog_snapshots")
            .select("id, archetype_title, core_pattern, top_three_talents, top_ten_talents, created_at")
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false });
        if (zogHistErr) {
            console.warn("[generateProfilePdf] zog history fetch failed:", zogHistErr);
        } else {
            bundle.zogHistory = (zogRows ?? []).map((row) => ({
                id: row.id,
                archetypeTitle: row.archetype_title ?? null,
                corePattern: row.core_pattern ?? null,
                topThreeTalents: mapTalentsJson(row.top_three_talents),
                topTenTalents: mapTalentsJson(row.top_ten_talents),
                createdAt: row.created_at,
            }));
        }
    } catch (err) {
        console.warn("[generateProfilePdf] zog history fetch threw:", err);
    }

    // Assets — user_assets list, latest first
    try {
        if (user?.id) {
            const { data: assets } = await supabase
                .from("user_assets")
                .select("id, title, type_id, description, source, created_at")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false });
            bundle.assets = ((assets as AssetRow[] | null) ?? []).filter(
                (a) => a && a.title,
            );
        }
    } catch (err) {
        console.warn("[generateProfilePdf] Assets fetch failed:", err);
    }

    // Quality of Life — latest qol_snapshot for this profile
    try {
        const { data: qol } = await supabase
            .from("qol_snapshots")
            .select(
                "growth_stage, happiness_stage, health_stage, home_stage, impact_stage, love_relationships_stage, social_ties_stage, wealth_stage, created_at",
            )
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (qol) {
            bundle.qol = qol as QolData;
        }
    } catch (err) {
        console.warn("[generateProfilePdf] QoL fetch failed:", err);
    }

    // QoL history — Day 119 (D5): all snapshots, for "Profile history".
    try {
        const { data: qolRows, error: qolHistErr } = await supabase
            .from("qol_snapshots")
            .select(
                "id, created_at, wealth_stage, health_stage, happiness_stage, love_relationships_stage, impact_stage, growth_stage, social_ties_stage, home_stage",
            )
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false });
        if (qolHistErr) {
            console.warn("[generateProfilePdf] qol history fetch failed:", qolHistErr);
        } else {
            bundle.qolHistory = (qolRows ?? []).map((row) => ({
                id: row.id,
                createdAt: row.created_at,
                stages: {
                    wealth: row.wealth_stage,
                    health: row.health_stage,
                    happiness: row.happiness_stage,
                    loveRelationships: row.love_relationships_stage,
                    impact: row.impact_stage,
                    growth: row.growth_stage,
                    socialTies: row.social_ties_stage,
                    home: row.home_stage,
                },
            }));
        }
    } catch (err) {
        console.warn("[generateProfilePdf] qol history fetch threw:", err);
    }

    return bundle;
}

// ─────────────────────────────────────────────────────────────────────
// Cover page — name, archetype, bullseye, date
// ─────────────────────────────────────────────────────────────────────

function renderCover(b: PdfBuilder, bundle: ProfileBundle) {
    const { appleseed, userName } = bundle;
    const archetype = appleseed?.vibrationalKey?.name
        ? stripDecorativeGlyphs(appleseed.vibrationalKey.name)
        : null;
    const bullseye = appleseed?.bullseyeSentence
        ? formatBullseye(appleseed.bullseyeSentence)
        : null;

    // Push down ~1/3 of the page so the cover sits in the upper-third
    // sweet spot — visual rest space below.
    b.y = 70;

    b.ornament();
    b.y += 6;

    // Top eyebrow — what this document IS
    b.eyebrow("Personal Profile", { center: true });
    b.y += 3;

    // Big title — user name, or fallback to "Your Top Talent Profile"
    const titleText = userName ? formatTitleName(userName) : "Your Top Talent Profile";
    b.title(titleText, { size: 28, center: true });
    b.y += 4;

    // Subtitle — archetype if available
    if (archetype) {
        b.body(`My top talent is ${archetype}.`, { italic: true, size: 12, center: true });
        b.y += 2;
    }

    // Bullseye — first-person, italic, the line that opens the platform
    if (bullseye) {
        b.body(`I ${bullseye}.`, { italic: true, size: 11, center: true });
    }

    b.y += 10;
    b.ornament();
    b.y += 6;

    // Date generated — small, muted, low-key
    const today = new Date();
    const dateStr = formatDate(today, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    b.body(`Generated ${dateStr}`, { size: 8.5, center: true, color: C.muted });

    // Footer brand mark — pin at bottom of page
    const restoreY = b.y;
    b.y = FOOTER_Y - 8;
    b.body("findyourtoptalent.com", { size: 9, center: true, color: C.muted, italic: true });
    b.y = restoreY;
}

/** Title-case a name: "alexander konstantinov" → "Alexander Konstantinov". */
function formatTitleName(raw: string): string {
    return raw
        .split(/\s+/)
        .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()))
        .join(" ")
        .trim();
}

// ─────────────────────────────────────────────────────────────────────
// Section header — gold ornament + eyebrow + title trio.
// Used by each non-Top-Talent section to mark a fresh chapter.
// ─────────────────────────────────────────────────────────────────────

function renderSectionHeader(b: PdfBuilder, eyebrow: string, title: string) {
    b.newPage();
    b.y += 6;
    b.ornament();
    b.y += 4;
    b.eyebrow(eyebrow, { center: true });
    b.y += 2;
    b.title(title, { size: 22, center: true });
    b.y += 4;
}

// ─────────────────────────────────────────────────────────────────────
// Mission section
// ─────────────────────────────────────────────────────────────────────

function renderMissionSection(b: PdfBuilder, mission: MissionData | null) {
    renderSectionHeader(b, "Mission", "Your Mission");

    if (!mission || !mission.statement) {
        b.y += 4;
        b.body(
            "Not yet discovered. Visit findyourtoptalent.com/mission-discovery to articulate the mission your talent serves.",
            { italic: true, color: C.muted, center: true },
        );
        return;
    }

    // The mission statement — primary body, larger size, room to breathe.
    b.cardBody(mission.statement, { tinted: true });
    b.y += SECTION_GAP;

    // Categories — if present, render as a comma-separated muted line.
    if (mission.categories && mission.categories.length > 0) {
        b.eyebrow("Categories");
        b.y += 1;
        b.body(mission.categories.join(" · "), { italic: true, color: C.muted });
    }
}

// ─────────────────────────────────────────────────────────────────────
// Assets section — grouped by type
// ─────────────────────────────────────────────────────────────────────

function renderAssetsSection(b: PdfBuilder, assets: AssetRow[]) {
    renderSectionHeader(b, "Assets", "Your Assets");

    if (assets.length === 0) {
        b.y += 4;
        b.body(
            "Not yet mapped. Visit findyourtoptalent.com/asset-mapping to inventory the expertise, experiences, networks, resources, IP, and influence you bring to the table.",
            { italic: true, color: C.muted, center: true },
        );
        return;
    }

    // Group assets by type_id, preserving the canonical order from ASSET_TYPES.
    const grouped: Record<string, AssetRow[]> = {};
    for (const a of assets) {
        const tid = a.type_id || "other";
        if (!grouped[tid]) grouped[tid] = [];
        grouped[tid].push(a);
    }

    const typeLabel = (id: string): string => {
        const found = ASSET_TYPES.find((t) => t.id === (id as AssetTypeId));
        return found ? found.title : id;
    };

    // Render in canonical order; any unknown type_id falls to the end.
    const canonicalIds = ASSET_TYPES.map((t) => t.id);
    const orderedIds = [
        ...canonicalIds.filter((id) => grouped[id]?.length),
        ...Object.keys(grouped).filter((id) => !canonicalIds.includes(id as AssetTypeId)),
    ];

    for (const tid of orderedIds) {
        const group = grouped[tid];
        if (!group?.length) continue;

        b.y += 2;
        b.eyebrow(typeLabel(tid));
        b.y += 1;

        for (const a of group) {
            const lines: string[] = [a.title];
            if (a.description) lines.push(a.description);
            if (a.source) lines.push(`Source: ${a.source}`);
            b.cardBody(lines.join("\n"));
            b.y += 3;
        }
        b.y += SECTION_GAP / 2;
    }
}

// ─────────────────────────────────────────────────────────────────────
// Quality of Life section — 8 domains, text-based bars
// ─────────────────────────────────────────────────────────────────────

const QOL_DOMAINS: Array<{ key: keyof QolData; label: string }> = [
    { key: "happiness_stage", label: "Happiness" },
    { key: "health_stage", label: "Health" },
    { key: "love_relationships_stage", label: "Love & Relationships" },
    { key: "social_ties_stage", label: "Social Ties" },
    { key: "wealth_stage", label: "Wealth" },
    { key: "home_stage", label: "Home" },
    { key: "growth_stage", label: "Growth" },
    { key: "impact_stage", label: "Impact" },
];

const QOL_MAX_STAGE = 7; // Mirrors the QoL Map UI's stage scale (1–7).

function renderQolBar(b: PdfBuilder, label: string, stage: number) {
    const barX = MARGIN + 60;
    const barW = CONTENT_W - 60 - 18;
    const barH = 3.2;

    b.ensureSpace(barH + 6);
    // Label — left side
    b.doc.setFont(b.fonts.body, "normal");
    b.doc.setFontSize(9);
    b.doc.setTextColor(...C.inkBody);
    b.doc.text(label, MARGIN, b.y);

    // Bar track — soft cream
    b.doc.setFillColor(...C.goldFill);
    b.doc.setDrawColor(...C.goldHairline);
    b.doc.setLineWidth(0.2);
    b.doc.roundedRect(barX, b.y - barH + 0.6, barW, barH, 1, 1, "FD");

    // Filled portion
    const fillW = Math.max(0, Math.min(stage / QOL_MAX_STAGE, 1)) * barW;
    if (fillW > 0) {
        b.doc.setFillColor(...C.gold);
        b.doc.roundedRect(barX, b.y - barH + 0.6, fillW, barH, 1, 1, "F");
    }

    // Numeric — right side
    b.doc.setFont(b.fonts.body, "bold");
    b.doc.setFontSize(8.5);
    b.doc.setTextColor(...C.goldDeep);
    b.doc.text(`${stage}/${QOL_MAX_STAGE}`, PAGE_W - MARGIN, b.y, { align: "right" });

    b.y += 7;
}

function renderQolSection(b: PdfBuilder, qol: QolData | null) {
    renderSectionHeader(b, "Quality of Life", "Your Quality of Life");

    if (!qol) {
        b.y += 4;
        b.body(
            "Not yet assessed. Visit findyourtoptalent.com/quality-of-life-map to map where you stand across 8 life domains.",
            { italic: true, color: C.muted, center: true },
        );
        return;
    }

    // Snapshot date
    const dateStr = formatDate(qol.created_at, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    b.body(`Snapshot from ${dateStr}.`, { italic: true, color: C.muted, center: true });
    b.y += SECTION_GAP;

    // 8 domain bars
    for (const { key, label } of QOL_DOMAINS) {
        const stage = Number(qol[key] ?? 0);
        renderQolBar(b, label, stage);
    }

    // Average — quick orientation line
    const sum = QOL_DOMAINS.reduce((acc, { key }) => acc + Number(qol[key] ?? 0), 0);
    const avg = sum / QOL_DOMAINS.length;
    b.y += SECTION_GAP / 2;
    b.body(
        `Overall stage: ${avg.toFixed(1)} / ${QOL_MAX_STAGE}.`,
        { italic: true, color: C.muted, center: true },
    );
}

// ─────────────────────────────────────────────────────────────────────
// Top Talent — empty-state when no appleseed exists
// ─────────────────────────────────────────────────────────────────────

function renderTopTalentEmpty(b: PdfBuilder) {
    renderSectionHeader(b, "Top Talent", "Your Top Talent");
    b.y += 4;
    b.body(
        "Not yet generated. Visit findyourtoptalent.com to take the 15-minute Top Talent assessment.",
        { italic: true, color: C.muted, center: true },
    );
}

// ─────────────────────────────────────────────────────────────────────
// Profile history — Day 119 (D5). Reuses buildHistoryEvents from
// changeLines.ts (the same deterministic diff logic that powers the
// Profile Space progression timeline on-screen) so the PDF and the
// live UI can never drift into two different "what changed" stories.
// Renders one row per event: date, title, change line. Skipped
// entirely when there is nothing to show.
// ─────────────────────────────────────────────────────────────────────

function buildPdfHistoryEvents(bundle: ProfileBundle): HistoryEvent[] {
    const assets: HistoryAssetLite[] = bundle.assets
        .filter((a): a is AssetRow & { id: string; created_at: string } => !!a.id && !!a.created_at)
        .map((a) => ({
            id: a.id,
            title: a.title,
            typeId: a.type_id ?? null,
            description: a.description ?? null,
            createdAt: a.created_at,
        }));

    const data: ProfileSpaceData = {
        identity: null,
        zogLatest: bundle.zogHistory[0] ?? null,
        zogHistory: bundle.zogHistory,
        mission: {
            statement: bundle.mission?.statement ?? null,
            categories: bundle.mission?.categories ?? [],
            discoveredAt: bundle.missionDiscoveredAt,
        },
        assets,
        qolLatest: bundle.qolHistory[0] ?? null,
        qolHistory: bundle.qolHistory,
        requests: [], // Not fetched for the PDF (D5 scope: zog + qol history only)
        loading: false,
        error: null,
        reload: async () => {},
    };

    return buildHistoryEvents(data);
}

// A title-key like "profileSpace.history.zog" → a plain English label
// for the PDF, which is English-only (see file header). Kept local so
// this file doesn't need an i18n dependency just for four labels.
const HISTORY_KIND_LABEL: Record<HistoryEvent["kind"], string> = {
    zog: "Top Talent snapshot",
    qol: "Quality of Life snapshot",
    mission: "Mission discovered",
    asset: "Assets added",
    request: "Collaboration request sent",
};

function renderProfileHistorySection(b: PdfBuilder, bundle: ProfileBundle) {
    const events = buildPdfHistoryEvents(bundle);
    if (events.length === 0) return;

    renderSectionHeader(b, "Progression", "Profile History");
    b.y += 2;

    for (const event of events) {
        const dateStr = formatDate(event.date, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        const label = HISTORY_KIND_LABEL[event.kind] ?? event.kind;
        b.cardBody(`${dateStr} — ${label}\n${event.changeLine}`);
        b.y += 3;
    }
}

// ─────────────────────────────────────────────────────────────────────
// Footer — page N of M, brand. Copied from generateZogPdf so the file
// stays self-sufficient and we can iterate this footer independently if
// the unified profile wants different chrome later.
// ─────────────────────────────────────────────────────────────────────

function renderFooter(b: PdfBuilder) {
    const pageCount = b.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        b.doc.setPage(i);
        b.doc.setFont(b.fonts.body, "normal");
        b.doc.setFontSize(7);
        b.doc.setTextColor(...C.muted);
        b.doc.text(
            `Page ${i} of ${pageCount}  ·  findyourtoptalent.com  ·  Personal Profile`,
            PAGE_W / 2,
            FOOTER_Y,
            { align: "center" },
        );
    }
}

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

/**
 * Build the unified Personal Profile PDF and trigger a download in the
 * browser. The function handles its own data fetching — callers don't
 * need to pre-load anything.
 *
 * Side effects: opens the browser save-dialog with the generated PDF.
 *
 * Throws if jsPDF.save() fails. The data-fetch layer is internally
 * lenient — missing tables / rows render as empty-section pages, not
 * exceptions.
 */
export async function generateProfilePdf(): Promise<void> {
    const bundle = await loadProfileBundle();

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const fonts = await setupFonts(doc);
    const b = new PdfBuilder(doc, fonts);

    // ── Cover ─────────────────────────────────────────────────────
    renderCover(b, bundle);

    // ── Top Talent ────────────────────────────────────────────────
    if (bundle.appleseed) {
        b.newPage();
        // renderHero is the first-level identity (archetype + bullseye +
        // core pattern) — free-tier, always included.
        renderHero(b, bundle.appleseed);
        // Day 95 (Sasha 2026-06-13): the eight DEEP sections are the paid
        // $37 product. Only render them when the user has actually
        // activated (paid / coupon / tier). A free user exporting via
        // Settings → Export gets the hero + a locked note, not the paid
        // depth — closing the PDF as a paywall-bypass vector. (Fail-open:
        // hasDeeperAccess defaults true, so grandfathered users and the
        // pre-migration window keep the full export.)
        if (bundle.hasDeeperAccess) {
            renderHowItShowsUp(b, bundle.appleseed);
            renderThreeKeyTalents(b, bundle.appleseed);
            renderTopShadow(b, bundle.appleseed);
            renderPathOfMastery(b, bundle.appleseed);
            renderOneAction(b, bundle.appleseed);
            renderIdealEnvironments(b, bundle.appleseed);
            renderComplementaryPartner(b, bundle.appleseed);
            renderMonetization(b, bundle.appleseed);
        } else {
            b.y += SECTION_GAP;
            b.eyebrow("Locked");
            b.body(
                "Your full deeper Top Talent profile — How It Shows Up, Three Talents in Depth, Top Shadow, Path of Mastery, One Action, Ideal Environments, Complementary Partner, and Monetization — unlocks with the $37 Top Talent Activation. Visit findyourtoptalent.com/activate-top-talent.",
                { italic: true, color: C.muted },
            );
        }
    } else {
        renderTopTalentEmpty(b);
    }

    // ── Mission ───────────────────────────────────────────────────
    renderMissionSection(b, bundle.mission);

    // ── Assets ────────────────────────────────────────────────────
    renderAssetsSection(b, bundle.assets);

    // ── Quality of Life ───────────────────────────────────────────
    renderQolSection(b, bundle.qol);

    // ── Profile history (D5) ──────────────────────────────────────
    renderProfileHistorySection(b, bundle);

    // ── Footer (page numbers across all pages) ────────────────────
    renderFooter(b);

    // ── Save ──────────────────────────────────────────────────────
    const slug = bundle.appleseed?.vibrationalKey?.name
        ? slugifyArchetype(bundle.appleseed.vibrationalKey.name)
        : "personal-profile";
    const today = new Date();
    const dateSlug = today.toISOString().slice(0, 10); // YYYY-MM-DD
    doc.save(`my-profile-${slug}-${dateSlug}.pdf`);
}
