// i18n Layer 3 (Day 101, 2026-06-14): output-language control for AI
// generation. The client passes `target_language` (the user's UI locale)
// in the request body; each generation function appends languageDirective()
// to its system prompt so the model writes VALUES in the user's language
// while keeping JSON field names in English (the app parses English keys).
//
// Sasha's decision: trust the model to generate natively (no separate
// translation step). The reveal (Appleseed/ZoG) additionally gets
// language-specific calibration; the rest of the product accepts the
// model-default rendering.

export const SUPPORTED_OUTPUT_LANGUAGES = ["en", "ru", "es"] as const;
export type OutputLanguage = (typeof SUPPORTED_OUTPUT_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  es: "Spanish",
};

/** Normalize an incoming target_language to a supported code; defaults to 'en'. */
export function resolveOutputLanguage(raw: unknown): OutputLanguage {
  const v = typeof raw === "string" ? raw.toLowerCase().slice(0, 2) : "";
  return (SUPPORTED_OUTPUT_LANGUAGES as readonly string[]).includes(v)
    ? (v as OutputLanguage)
    : "en";
}

/**
 * The directive appended to a generation system prompt. Empty for English
 * (no behavior change), so this is fully backward-compatible: a caller that
 * sends no target_language keeps the exact current behavior.
 */
export function languageDirective(lang: OutputLanguage): string {
  if (lang === "en") return "";
  const name = LANGUAGE_NAMES[lang] ?? "English";
  return `\n\n=== OUTPUT LANGUAGE (CRITICAL) ===\nWrite ALL human-readable output in ${name}. Keep every JSON field name / key in English EXACTLY as specified in the schema above — translate only the VALUES, never the keys. Carry the same precision, concreteness, and direct second-person register into ${name}; do not flatten the charge into corporate or literal phrasing. Do not add a note about the language; just produce the output in ${name}.`;
}
