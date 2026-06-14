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
    const { data } = await (supabase as any)
      .from("game_profiles")
      .select("preferred_language")
      .eq("user_id", userId)
      .maybeSingle();
    const remote = (data as { preferred_language?: string | null } | null)
      ?.preferred_language;
    if (isSupportedLng(remote)) {
      // A URL locale prefix (/ru, /es) is explicit and owns the session;
      // only apply the remote choice when no prefix is forcing the language.
      if (!initialLocaleScope && remote !== i18n.resolvedLanguage) {
        await i18n.changeLanguage(remote as string);
      }
      return;
    }
    // Remote empty: push up this device's explicit choice, if any.
    let hasExplicitLocal = false;
    try {
      hasExplicitLocal =
        window.localStorage.getItem(LOCALE_STORAGE_KEY) !== null;
    } catch {
      // ignore
    }
    if (hasExplicitLocal) void syncLanguageToProfile(i18n.resolvedLanguage || "en");
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
