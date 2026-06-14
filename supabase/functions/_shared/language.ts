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

/**
 * Reveal-specific calibration (Day 101, 2026-06-14). Per Sasha's decision, the
 * REVEAL (Appleseed / ZoG snapshot) is the conversion artifact and gets extra
 * language-specific calibration beyond the generic directive — the rest of the
 * product accepts the model-default rendering. The English source prompt bans
 * abstract compound nouns ("Inner X / Sacred X / Deep X") via the 5-second-friend
 * test; this attaches the equivalent anti-flattening guidance for RU/ES, whose
 * failure mode is different (flat nominalizations / genitive chains / calques),
 * so a non-English reveal reads as living, charged native prose rather than
 * translationese. Append AFTER languageDirective(); empty for English.
 */
export function revealCalibration(lang: OutputLanguage): string {
  if (lang === "ru") {
    return `\n\n=== КАЛИБРОВКА ОТКРОВЕНИЯ (РУССКИЙ) ===\nЭтот профиль — момент узнавания и конверсии. Текст должен звучать как живая, точная русская речь, а НЕ как перевод с английского.\n- Никаких плоских абстрактных номинализаций и цепочек родительных падежей: избегай оборотов вроде «глубинное слушание», «подлинный голос», «пространство принятия», «истинная суть», «священная работа». Это русский аналог запрещённых выше английских составных существительных.\n- Тест «умного друга»: если носитель языка вне мира личностного роста переспросит «а что это значит?» — перепиши в конкретику: что именно я ДЕЛАЮ, С КЕМ, в какой СИТУАЦИИ, с каким РЕЗУЛЬТАТОМ.\n- Сохрани заряд: прямо, конкретно, живо; не сглаживай в корпоративный или буквальный тон.\n- Естественный русский синтаксис, без калек с английского.\n- Соблюдай правила лица и рефлексивов из схемы выше: поля «мой / моя / меня», а не «твой / твоя».`;
  }
  if (lang === "es") {
    return `\n\n=== CALIBRACIÓN DE LA REVELACIÓN (ESPAÑOL) ===\nEste perfil es el momento de reconocimiento y conversión. El texto debe sonar a español vivo y preciso, NO a una traducción del inglés.\n- Nada de nominalizaciones abstractas y planas: evita giros como «escucha profunda», «voz auténtica», «espacio sagrado», «esencia verdadera», «trabajo sagrado». Es el equivalente español de los sustantivos compuestos prohibidos arriba.\n- Prueba del «amigo inteligente»: si alguien fuera del mundo del desarrollo personal preguntaría «¿qué significa eso?», reescríbelo en concreto: qué HAGO exactamente, CON QUIÉN, en qué SITUACIÓN, con qué RESULTADO.\n- Conserva la carga: directo, concreto, vivo; no lo suavices a un tono corporativo ni literal.\n- Sintaxis natural en español, sin calcos del inglés. Trato de «tú».\n- Respeta las reglas de persona y reflexivos del esquema anterior: campos «mi / mío / me», no «tu / tuyo».`;
  }
  return "";
}
