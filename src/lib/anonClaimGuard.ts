/**
 * anonClaimGuard — decides whether this browser may promote an anonymous
 * Top Talent result (anonymous_genius_results, matched by EMAIL) into the
 * signed-in user's profile via the `claim-anonymous-zog` edge function.
 *
 * Incident 2026-10-24 (Sasha): an agent took the Top Talent quiz as a GUEST
 * and typed alexanderkonst@gmail.com into the "save my result" email box.
 * `save-anonymous-zog` is public and accepts any email, and
 * `claim-anonymous-zog` runs on every SIGNED_IN and blindly inserts the
 * newest unclaimed row for that email as a fresh snapshot + repoints
 * `game_profiles.last_zog_snapshot_id`. Result: the next time Sasha signed
 * in, someone else's Top Talent replaced his. Any account is exposed the
 * same way — whoever types your email in the guest box overwrites your
 * Top Talent at your next sign-in.
 *
 * Rule enforced here (client side, every claim call site goes through
 * `claimAnonymousZogIfAllowed`):
 *   1. A user with NO saved snapshot yet (the normal guest → sign-up
 *      funnel) may claim — nothing of theirs can be overwritten.
 *   2. A user who ALREADY has a snapshot may claim only if THIS browser
 *      itself saved the anonymous result for THIS email (marker written by
 *      `markAnonymousZogSaved` right after a successful save-anonymous-zog).
 *      A result typed in on someone else's device never matches.
 *   3. Otherwise skip. The anonymous row stays unclaimed server-side and
 *      nothing of the user's is touched.
 *
 * The edge function itself also gets a server-side guard (it now refuses to
 * claim over an existing snapshot unless `allow_existing: true` is sent);
 * the client sends that flag only in case 2.
 */
import { supabase } from "@/integrations/supabase/client";

const SAVED_MARKERS_KEY = "fytt:anon-zog-saved-by-this-browser:v1";
// A guest result older than this is not auto-claimed over an existing one.
const MARKER_TTL_MS = 14 * 24 * 60 * 60 * 1000;

type Marker = { email: string; at: number };

const normalize = (email: string | null | undefined) =>
    (email ?? "").trim().toLowerCase();

function readMarkers(): Marker[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(SAVED_MARKERS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const now = Date.now();
        return parsed.filter(
            (m): m is Marker =>
                !!m &&
                typeof m.email === "string" &&
                typeof m.at === "number" &&
                now - m.at < MARKER_TTL_MS,
        );
    } catch {
        return [];
    }
}

function writeMarkers(markers: Marker[]): void {
    if (typeof window === "undefined") return;
    try {
        if (markers.length === 0) window.localStorage.removeItem(SAVED_MARKERS_KEY);
        else window.localStorage.setItem(SAVED_MARKERS_KEY, JSON.stringify(markers));
    } catch {
        // storage disabled — claim then falls back to rule 1 only (safe side).
    }
}

/** Call right after save-anonymous-zog succeeded in this browser. */
export function markAnonymousZogSaved(email: string): void {
    const e = normalize(email);
    if (!e) return;
    const rest = readMarkers().filter((m) => m.email !== e);
    writeMarkers([...rest, { email: e, at: Date.now() }]);
}

export function hasLocalAnonymousZogSave(email: string | null | undefined): boolean {
    const e = normalize(email);
    if (!e) return false;
    return readMarkers().some((m) => m.email === e);
}

export function clearLocalAnonymousZogSave(email: string | null | undefined): void {
    const e = normalize(email);
    if (!e) return;
    writeMarkers(readMarkers().filter((m) => m.email !== e));
}

/**
 * Does this user already have a Top Talent snapshot? Fails CLOSED: on any
 * lookup error we report `true` so an existing profile is never overwritten
 * because of a network blip.
 */
export async function userHasExistingZogSnapshot(userId: string): Promise<boolean> {
    try {
        const { data: profile, error: profileError } = await supabase
            .from("game_profiles")
            .select("id, last_zog_snapshot_id")
            .eq("user_id", userId)
            .maybeSingle();
        if (profileError) return true;
        if (!profile) return false; // brand-new account, nothing to overwrite
        if (profile.last_zog_snapshot_id) return true;
        const { count, error: countError } = await supabase
            .from("zog_snapshots")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", profile.id);
        if (countError) return true;
        return (count ?? 0) > 0;
    } catch {
        return true;
    }
}

export type ClaimDecision = "claim_new_user" | "claim_own_device" | "skip_existing";

export async function decideAnonymousZogClaim(
    userId: string,
    email: string | null | undefined,
): Promise<ClaimDecision> {
    if (hasLocalAnonymousZogSave(email)) return "claim_own_device";
    const hasExisting = await userHasExistingZogSnapshot(userId);
    return hasExisting ? "skip_existing" : "claim_new_user";
}

/**
 * The ONLY way client code should invoke `claim-anonymous-zog`.
 * Returns the decision taken (for logging/tests). Never throws.
 */
export async function claimAnonymousZogIfAllowed(
    source: string,
): Promise<ClaimDecision | "no_session" | "error"> {
    try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user?.id) return "no_session";
        const decision = await decideAnonymousZogClaim(user.id, user.email);
        if (decision === "skip_existing") {
            console.info(
                `[anonClaimGuard:${source}] user already has a Top Talent and this browser did not save a guest result for their email — not claiming.`,
            );
            return decision;
        }
        const { error } = await supabase.functions.invoke("claim-anonymous-zog", {
            body: { allow_existing: decision === "claim_own_device" },
        });
        if (error) {
            console.warn(`[anonClaimGuard:${source}] claim-anonymous-zog returned error`, error);
            return "error";
        }
        clearLocalAnonymousZogSave(user.email);
        return decision;
    } catch (err) {
        console.warn(`[anonClaimGuard:${source}] claim threw`, err);
        return "error";
    }
}
