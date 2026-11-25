/**
 * Collective: the manual circles (WP1).
 * Spec: docs/specs/collective/build_spec.md (v0.2) → "The circles".
 *
 * Counts here are Sasha's own, kept by hand; the people behind them live in the private
 * ledger, never in this repo. Live numbers (players started, Top Talent, Mission, core)
 * come from the database through `collective_public_counts()`, not from this file.
 *
 * Truth rule: an approximate number is labeled approximate («~80»). The wording for the
 * outer circles is «people reached», never «members». The circles overlap, so nothing here
 * sums them into one total.
 *
 * Orbit is left out on purpose: it is shown only once it has been estimated.
 */

type Lang = "en" | "es" | "ru";

export type CollectiveCircleKey =
  | "fire_circle"
  | "clients"
  | "self_test"
  | "containers"
  | "transformational";

export interface CollectiveCircle {
  key: CollectiveCircleKey;
  label: Record<Lang, string>;
  count: number;
  /** true → render with a leading «~» */
  isApproximate: boolean;
}

export const COLLECTIVE_CIRCLES: readonly CollectiveCircle[] = [
  {
    key: "fire_circle",
    label: { en: "Fire circle", es: "Círculo de fuego", ru: "Круг огня" },
    count: 13,
    isApproximate: true,
  },
  {
    key: "clients",
    label: { en: "Clients", es: "Clientes", ru: "Клиенты" },
    count: 20,
    isApproximate: true,
  },
  {
    key: "self_test",
    label: { en: "Self-test", es: "Autotest", ru: "Самотест" },
    count: 80,
    isApproximate: true,
  },
  {
    key: "containers",
    label: { en: "Containers", es: "Contenedores", ru: "Контейнеры" },
    count: 33,
    isApproximate: false,
  },
  {
    key: "transformational",
    label: { en: "Transformational work", es: "Trabajo transformacional", ru: "Трансформационная работа" },
    count: 100,
    isApproximate: true,
  },
];

/** «~80» for an approximate count, «33» for an exact one. */
export function formatCircleCount(circle: Pick<CollectiveCircle, "count" | "isApproximate">): string {
  return `${circle.isApproximate ? "~" : ""}${circle.count}`;
}
