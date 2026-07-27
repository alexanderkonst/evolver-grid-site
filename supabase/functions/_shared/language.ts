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

/**
 * NATIVE-PROSE CALIBRATION (Day 137, 2026-07-27 — Rafael's Ignition Session, the
 * first full Russian-language artifact run).
 *
 * Origin: a native Russian writer graded his own artifacts live and kept giving
 * the same split verdict — the SUBSTANCE landed at 8/10 while the WORDING was
 * rejected as machine prose ("звучит как будто робот написал", "суть уловил, а
 * формулировку надо в миксер закинуть"). Every rule below is derived from his
 * specific complaints.
 *
 * Sasha's call, same day: the failure mode is NOT Russian-specific — evaluative
 * quantifiers, words inserted for their own sake, examples smuggled into a
 * definition, and image-stacks pretending to be mechanisms break a sentence in
 * any language. So the universal rules ship for EN/RU/ES alike, with a short
 * per-language block for the failure modes that ARE language-specific.
 *
 * Attached to the reveal AND to artifact generation/iteration — the failure mode
 * showed up hardest in the canvas artifacts (uniqueness, shadow, myth).
 */
const UNIVERSAL_PROSE_CALIBRATION = `\n\n=== LIVING-PROSE CALIBRATION (MANDATORY, ALL LANGUAGES) ===\nRead every sentence aloud before you return it. If it stumbles, rewrite it. These are real objections from a native speaker grading generated formulations — do not reproduce these failures.\n- NO EVALUATIVE QUANTIFIERS. Not "too much", "so many", "incredibly", "deeply", "profoundly", "extremely". They read as someone else's verdict imposed on the subject ("too much — and who decided it was too much?"). State the thing; let the reader do the evaluating.\n- NEVER INSERT A KEY WORD FOR ITS OWN SAKE. If a word does not carry weight in the sentence it sits in, the reader sees it was stuffed in because it was supposed to appear. Cut it or rebuild the sentence around it so it earns its place.\n- NO EXAMPLES OR ILLUSTRATIONS INSIDE A CORE FORMULATION. A formulation names the law; it does not showcase a case. Examples belong in the surrounding body text, never inside the one-line statement of who someone is.\n- WRITE A MECHANISM, NOT A STACK OF IMAGES. One thing must follow from the previous one, step by step, arriving somewhere. This is precisely what a native reader calls a hit: "it is no longer just a set of things — they assemble into a mechanism." A beautiful sentence with no internal logic reads as decoration.\n- WATCH THE PHYSICAL CONNOTATION OF EVERY NOUN. A word drags its other meanings with it ("scattered chunks of a life" — chunks belong to meat). Choose the word that does not import an alien image.\n- FINAL CHECK BEFORE RETURNING: if a sentence has to be read twice, or sounds like a translation of something else, rewrite it whole. Do not patch individual words.`;

const RU_PROSE_EXTRAS = `\n=== ДОПОЛНИТЕЛЬНО ДЛЯ РУССКОГО ===\n- Не строй кальки с английского: «чтобы верить, что…», «достаточно долго, чтобы…», «для того чтобы понять, что…». По-русски так не говорят.\n- Никаких цепочек родительных падежей и плоских номинализаций: «глубинное слушание», «пространство принятия», «истинная суть».\n- Естественный русский порядок слов; короткие предложения; живая речь, а не отчёт.`;

const ES_PROSE_EXTRAS = `\n=== ADICIONAL PARA ESPAÑOL ===\n- Nada de calcos del inglés: "para creer que…", "lo suficiente como para…", "con el fin de entender que…". En español no se habla así.\n- Evita las cadenas de "de" y las nominalizaciones planas: "escucha profunda", "espacio de aceptación", "esencia verdadera".\n- Sintaxis natural en español, frases cortas, trato de "tú"; lengua viva, no informe.`;

const EN_PROSE_EXTRAS = `\n=== ADDITIONAL FOR ENGLISH ===\n- No LLM cadence: avoid "not just X, but Y", "it's about X — it's about Y", "in a world where", "the truth is", and three-item lists used for rhythm rather than meaning.\n- No em-dashes. Use a period, a comma, or a colon. Em-dashes read as machine-written in copy a stranger will see.\n- No abstract compound nouns ("Inner X / Sacred X / Deep X / True X / Authentic X"). Concrete particulars only: what the person DOES, with WHOM, in what SITUATION, producing what RESULT.`;

/**
 * Native-prose calibration usable OUTSIDE the reveal (artifact generation and
 * iteration) and inside it. Universal rules for every language + a per-language
 * block. Never empty — the universal half applies to English too (Day 137).
 */
export function proseCalibration(lang: OutputLanguage): string {
  const extras =
    lang === "ru" ? RU_PROSE_EXTRAS : lang === "es" ? ES_PROSE_EXTRAS : EN_PROSE_EXTRAS;
  return UNIVERSAL_PROSE_CALIBRATION + extras;
}

export function revealCalibration(lang: OutputLanguage): string {
  if (lang === "ru") {
    return `\n\n=== КАЛИБРОВКА ОТКРОВЕНИЯ (РУССКИЙ) ===\nЭтот профиль — момент узнавания и конверсии. Текст должен звучать как живая, точная русская речь, а НЕ как перевод с английского.\n- Никаких плоских абстрактных номинализаций и цепочек родительных падежей: избегай оборотов вроде «глубинное слушание», «подлинный голос», «пространство принятия», «истинная суть», «священная работа». Это русский аналог запрещённых выше английских составных существительных.\n- Тест «умного друга»: если носитель языка вне мира личностного роста переспросит «а что это значит?» — перепиши в конкретику: что именно я ДЕЛАЮ, С КЕМ, в какой СИТУАЦИИ, с каким РЕЗУЛЬТАТОМ.\n- Сохрани заряд: прямо, конкретно, живо; не сглаживай в корпоративный или буквальный тон.\n- Естественный русский синтаксис, без калек с английского.\n- Соблюдай правила лица и рефлексивов из схемы выше: поля «мой / моя / меня», а не «твой / твоя».`;
  }
  if (lang === "es") {
    return `\n\n=== CALIBRACIÓN DE LA REVELACIÓN (ESPAÑOL) ===\nEste perfil es el momento de reconocimiento y conversión. El texto debe sonar a español vivo y preciso, NO a una traducción del inglés.\n- Nada de nominalizaciones abstractas y planas: evita giros como «escucha profunda», «voz auténtica», «espacio sagrado», «esencia verdadera», «trabajo sagrado». Es el equivalente español de los sustantivos compuestos prohibidos arriba.\n- Prueba del «amigo inteligente»: si alguien fuera del mundo del desarrollo personal preguntaría «¿qué significa eso?», reescríbelo en concreto: qué HAGO exactamente, CON QUIÉN, en qué SITUACIÓN, con qué RESULTADO.\n- Conserva la carga: directo, concreto, vivo; no lo suavices a un tono corporativo ni literal.\n- Sintaxis natural en español, sin calcos del inglés. Trato de «tú».\n- Respeta las reglas de persona y reflexivos del esquema anterior: campos «mi / mío / me», no «tu / tuyo».`;
  }
  return "";
}
