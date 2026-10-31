/**
 * The Market door (note 5): one shared experience, then each tribe's voice.
 * Sasha 2026-10-30: "one experience, eight languages". The shared headline was
 * removed (Sasha 22:43, no replacement); "Founder-Market Fit" stays as the METHOD name
 * (eyebrows, product names), never the promise.
 *
 * Lives here, not in locales/*\/common.json, because those files were being
 * edited in parallel on 2026-10-30. Fold into common.json later if wanted.
 */
type Lang = "en" | "es" | "ru";
type Copy = Record<Lang, string>;

export const MARKET_DOOR = {
  igniteEyebrow: {
    en: "Private Founder-Market Fit Session · 1:1 · 2\u00a0hours",
    es: "Private Founder-Market Fit Session · 1:1 · 2 horas",
    ru: "Private Founder-Market Fit Session · 1:1 · 2 часа",
  },
  igniteSub: {
    en: "Your work isn't landing yet. Your impact isn't paid for yet. What you build best has no users yet. In 2\u00a0hours we write the one sentence your business runs on: who it's for, what it does, why you.",
    es: "Tu trabajo aún no aterriza en el mundo. Tu impacto aún no se paga. Lo mejor que construyes aún no tiene usuarios. En 2 horas escribimos la frase sobre la que corre tu negocio: para quién es, qué hace, por qué tú.",
    ru: "Твоя работа пока не доходит до мира. Твой вклад пока никто не оплачивает. У лучшего, что ты строишь, пока нет пользователей. За 2 часа мы пишем одну фразу, на которой держится твой бизнес: для кого он, что он делает, почему именно ты.",
  },
  productsFmfLine: {
    en: "In 2 hours, the one sentence your business runs on.",
    es: "En 2 horas, la frase sobre la que corre tu negocio.",
    ru: "За 2 часа — фраза, на которой держится твой бизнес.",
  },
  productsPmfLine: {
    en: "From your gift to strangers who pay for it, again and again: a scalable product in a\u00a0month.",
    es: "De tu don a desconocidos que pagan por él, una y otra vez: un producto escalable en un mes.",
    ru: "От твоего дара к незнакомым людям, которые платят за него снова и снова: масштабируемый продукт за месяц.",
  },
} satisfies Record<string, Copy>;

/** Pick the line for the active i18n language; English when unknown. */
export const marketDoor = (key: keyof typeof MARKET_DOOR, lang?: string): string => {
  const l = (lang || "en").slice(0, 2) as Lang;
  return MARKET_DOOR[key][l] ?? MARKET_DOOR[key].en;
};
