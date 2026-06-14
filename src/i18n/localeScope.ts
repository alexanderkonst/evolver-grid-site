/**
 * localeScope — boot-time locale routing scope.
 *
 * Reserved for future per-locale URL prefixing (e.g. /ru, /es).
 * Today there is no prefix, so `prefix` is an empty string and
 * App.tsx's `initialLocaleScope?.prefix ?? ""` resolves to "".
 */
export type LocaleScope = {
  prefix: string;
};

export const initialLocaleScope: LocaleScope = {
  prefix: "",
};
