/**
 * Strings for the invite page /join/collective/:code (WP2), en / es / ru.
 * Kept in a data file (the collectiveAdminCopy pattern), not in locales/*\/common.json.
 */
export type CollectiveJoinLang = "en" | "es" | "ru";
type Copy = Record<CollectiveJoinLang, string>;

export const COLLECTIVE_JOIN = {
  checking: { en: "Opening your invitation…", es: "Abriendo tu invitación…", ru: "Открываю ваше приглашение…" },
  usedTitle: {
    en: "This invitation has been used.",
    es: "Esta invitación ya se usó.",
    ru: "Это приглашение уже использовано.",
  },
  expiredTitle: {
    en: "This invitation has expired.",
    es: "Esta invitación caducó.",
    ru: "Срок приглашения истёк.",
  },
  invalidTitle: {
    en: "We can't find this invitation.",
    es: "No encontramos esta invitación.",
    ru: "Мы не нашли это приглашение.",
  },
  deadBody: {
    en: "Each link works once. Ask the person who sent it for a new one.",
    es: "Cada enlace funciona una sola vez. Pide uno nuevo a quien te lo envió.",
    ru: "Каждая ссылка работает один раз. Попросите новую у того, кто её отправил.",
  },
  home: { en: "Go to the home page", es: "Ir al inicio", ru: "На главную" },
  errorTitle: {
    en: "Something went wrong.",
    es: "Algo salió mal.",
    ru: "Что-то пошло не так.",
  },
  errorBody: {
    en: "Your invitation is not spent. Try again in a moment.",
    es: "Tu invitación no se ha gastado. Inténtalo de nuevo en un momento.",
    ru: "Ваше приглашение не потрачено. Попробуйте ещё раз через минуту.",
  },
  retry: { en: "Try again", es: "Intentar de nuevo", ru: "Попробовать снова" },
  profileTitle: {
    en: "You're in. Tell the Collective who you are.",
    es: "Estás dentro. Cuéntale al Colectivo quién eres.",
    ru: "Вы в Коллективе. Расскажите, кто вы.",
  },
  profileIntro: {
    en: "Four short fields. Other members will see them. Only the first is required.",
    es: "Cuatro campos cortos. Los demás miembros los verán. Solo el primero es obligatorio.",
    ru: "Четыре коротких поля. Их увидят другие участники. Обязательно только первое.",
  },
  uniquenessLabel: { en: "Your uniqueness, in one line", es: "Tu unicidad, en una línea", ru: "Ваша уникальность одной строкой" },
  uniquenessHelp: {
    en: "What only you do the way you do it.",
    es: "Lo que solo tú haces como lo haces.",
    ru: "То, что только вы делаете так, как делаете.",
  },
  offersLabel: { en: "What I offer", es: "Lo que ofrezco", ru: "Что я предлагаю" },
  seeksLabel: { en: "What I seek", es: "Lo que busco", ru: "Что я ищу" },
  siteLabel: { en: "Link to your site", es: "Enlace a tu sitio", ru: "Ссылка на ваш сайт" },
  optional: { en: "optional", es: "opcional", ru: "по желанию" },
  submit: { en: "Enter the Collective", es: "Entrar al Colectivo", ru: "Войти в Коллектив" },
  saving: { en: "Saving…", es: "Guardando…", ru: "Сохраняю…" },
  uniquenessRequired: {
    en: "Write one line about your uniqueness to continue.",
    es: "Escribe una línea sobre tu unicidad para continuar.",
    ru: "Напишите одну строку о своей уникальности, чтобы продолжить.",
  },
  siteInvalid: {
    en: "That doesn't look like a web address. Try something like mysite.com.",
    es: "Eso no parece una dirección web. Prueba algo como misitio.com.",
    ru: "Это не похоже на адрес сайта. Попробуйте вроде mysite.com.",
  },
  saveFailed: {
    en: "Couldn't save your profile. Try again.",
    es: "No se pudo guardar tu perfil. Inténtalo de nuevo.",
    ru: "Не удалось сохранить профиль. Попробуйте ещё раз.",
  },
} as const satisfies Record<string, Copy>;

export function collectiveJoinText(key: keyof typeof COLLECTIVE_JOIN, lang: string): string {
  const entry: Copy = COLLECTIVE_JOIN[key];
  return entry[lang === "es" || lang === "ru" ? lang : "en"];
}
