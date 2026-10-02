import i18n from "./config";
import { supabase } from "@/integrations/supabase/client";
import {
  initialLocaleScope,
  isSupportedLng,
  LOCALE_STORAGE_KEY,
} from "./localeScope";

/**
 * Person-level locale persistence — mirrors SkinContext's preferred_skin
 * sync (Day 91). localStorage is the device-level source of truth; this
 * makes the choice follow the PERSON across devices via the
 * game_profiles.preferred_language column (migration 20260614000000).
 *
 * All Supabase calls are best-effort: guests no-op, and errors are
 * swallowed (column migration may be pending, or offline) — the local
 * choice always stands and the next change re-syncs.
 */

/** Fire-and-forget: persist the active locale to the user's profile. */
const syncLanguageToProfile = async (lng: string): Promise<void> => {
  if (!isSupportedLng(lng)) return;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    await (supabase as any)
      .from("game_profiles")
      .update({ preferred_language: lng } as never)
      .eq("user_id", session.user.id);
  } catch {
    // offline / migration pending — silent, local choice stands
  }
};

/** On sign-in, reconcile the active locale from the profile. */
const reconcileLanguageFromProfile = async (userId: string): Promise<void> => {
  try {
    // This device's explicit switcher choice (localStorage) is the source of
    // truth for THIS device. localStorage is written only by an explicit
    // changeLanguage — never during init (the handler is registered after
    // init) — so a non-null value means a real choice, not a default.
    //
    // Bug (2026-10-01, Sasha): the stored profile language was overriding a
    // just-made choice. A signed-in visitor who picked RU/ES on the bare
    // /quiz URL got snapped back to their profile's language ("jumps back to
    // English"). The device's explicit choice must win; the profile only
    // fills the gap on a device that has made no choice yet.
    let localChoice: string | null = null;
    try {
      localChoice = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      // ignore
    }

    const { data } = await (supabase as any)
      .from("game_profiles")
      .select("preferred_language")
      .eq("user_id", userId)
      .maybeSingle();
    const remote = (data as { preferred_language?: string | null } | null)
      ?.preferred_language;

    if (isSupportedLng(localChoice)) {
      // Explicit local choice wins. Push it up when the profile is absent or
      // stale, so the choice still follows the person to fresh devices.
      if (localChoice !== remote) void syncLanguageToProfile(localChoice as string);
      return;
    }

    // No explicit choice on this device — adopt the person's saved language
    // (the cross-device path). A URL locale prefix already owns the session,
    // so only apply when no prefix is forcing the language.
    if (isSupportedLng(remote)) {
      if (!initialLocaleScope && remote !== i18n.resolvedLanguage) {
        await i18n.changeLanguage(remote as string);
      }
    }
  } catch {
    // column migration pending / offline — local persistence stands
  }
};

let installed = false;

/** Install once from main.tsx. Idempotent. */
export function installLanguageProfileSync(): void {
  if (installed) return;
  installed = true;

  i18n.on("languageChanged", (lng) => {
    void syncLanguageToProfile(lng);
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.id) void reconcileLanguageFromProfile(session.user.id);
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user?.id) {
      void reconcileLanguageFromProfile(session.user.id);
    }
  });
}
