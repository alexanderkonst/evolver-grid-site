/**
 * Strings for the /admin «Collective members» panel (WP1), en / es / ru.
 * Kept in a data file (the marketDoorCopy pattern), not in locales/*\/common.json.
 */
export type CollectiveAdminLang = "en" | "es" | "ru";
type Copy = Record<CollectiveAdminLang, string>;

export const COLLECTIVE_ADMIN = {
  title: {
    en: "Collective members",
    es: "Miembros del Colectivo",
    ru: "Участники Коллектива",
  },
  intro: {
    en: "Grant or revoke core membership. Search a player by name or email.",
    es: "Concede o retira la membresía del núcleo. Busca a un jugador por nombre o correo.",
    ru: "Выдать или отозвать членство в ядре. Найдите игрока по имени или email.",
  },
  searchPlaceholder: {
    en: "Search a player",
    es: "Buscar un jugador",
    ru: "Найти игрока",
  },
  membersHeading: {
    en: "Members now",
    es: "Miembros ahora",
    ru: "Сейчас в ядре",
  },
  noMembers: {
    en: "No members yet.",
    es: "Aún no hay miembros.",
    ru: "Пока никого нет.",
  },
  noMatches: {
    en: "No player matches.",
    es: "Ningún jugador coincide.",
    ru: "Игрок не найден.",
  },
  typeToSearch: {
    en: "Type at least 2 characters.",
    es: "Escribe al menos 2 caracteres.",
    ru: "Введите минимум 2 символа.",
  },
  grant: { en: "Grant", es: "Conceder", ru: "Выдать" },
  revoke: { en: "Revoke", es: "Retirar", ru: "Отозвать" },
  working: { en: "Working…", es: "Procesando…", ru: "Выполняю…" },
  isMember: { en: "member", es: "miembro", ru: "в ядре" },
  loading: { en: "Loading…", es: "Cargando…", ru: "Загрузка…" },
  loadFailed: {
    en: "Couldn't load members.",
    es: "No se pudieron cargar los miembros.",
    ru: "Не удалось загрузить участников.",
  },
  granted: { en: "Membership granted.", es: "Membresía concedida.", ru: "Членство выдано." },
  revoked: { en: "Membership revoked.", es: "Membresía retirada.", ru: "Членство отозвано." },
  actionFailed: {
    en: "Couldn't update membership.",
    es: "No se pudo actualizar la membresía.",
    ru: "Не удалось обновить членство.",
  },
} as const satisfies Record<string, Copy>;

export function collectiveAdminText(key: keyof typeof COLLECTIVE_ADMIN, lang: string): string {
  const entry: Copy = COLLECTIVE_ADMIN[key];
  return entry[lang === "es" || lang === "ru" ? lang : "en"];
}
