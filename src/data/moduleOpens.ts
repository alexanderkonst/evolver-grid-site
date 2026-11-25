/**
 * What a module opens (GoBY §25.6, epic #453 phase 5): the second line of every module Intro.
 *
 * «What you get» is the module's own `silhouette`. «What it opens» is read here, never typed
 * per module: the places whose `rule.opens` the module's completion meets (VILLAGE_PLACES), and
 * the next module on the path (JOURNEY_MODULES order, which is §14.2 order). A module that is
 * not on the path (an Academy lesson) names its next step in `opensNext`.
 *
 * Words are the village's own: place names are `village.place.<key>.name`, the next step is its
 * Intro headline `village.module.<id>.headline`. Only the sentence frames live under
 * `village.opens.*`.
 */

import { JOURNEY_MODULES, journeyStepOf, moduleText, type JourneyModuleDef } from "@/data/journeyModules";
import { VILLAGE_PLACES, getVillagePlace, type VillagePlace } from "@/data/villagePlaces";
import { TRIAD_STEPS } from "@/lib/placeState";
import { placeName } from "@/lib/villageCopy";
import type { TFunction } from "i18next";

export type ModuleOpens = {
  /** Places that open when this module is done, in village order. */
  places: VillagePlace[];
  /** The next step on the path: its place and the words that name it. */
  next?: { place: VillagePlace; module?: JourneyModuleDef; label?: string };
};

/** The events a finished module meets. Only these can open a place (`rule.opens`). */
const eventsMetBy = (module: JourneyModuleDef): Set<string> => {
  const events = new Set<string>([module.id]);
  // The tagline is the artifact that saves the offer, and with it finishes «Build a business».
  if (module.id === "tagline") {
    events.add("offer-saved");
    events.add("build-business");
  }
  // The triad (talent, mission, assets) is whole when its last step on the path is done.
  const lastTriad = JOURNEY_MODULES.filter((m) => TRIAD_STEPS.some((id) => id === journeyStepOf(m.id))).pop();
  if (lastTriad?.id === module.id) events.add("triad");
  return events;
};

export const moduleOpens = (module: JourneyModuleDef): ModuleOpens => {
  const events = eventsMetBy(module);
  const places = VILLAGE_PLACES.filter((p) => p.rule.opens && events.has(p.rule.opens));

  const at = JOURNEY_MODULES.findIndex((m) => m.id === module.id);
  const following = at >= 0 ? JOURNEY_MODULES[at + 1] : undefined;
  const followingPlace = following ? getVillagePlace(following.place) : undefined;
  if (following && followingPlace) return { places, next: { place: followingPlace, module: following } };

  const own = module.opensNext;
  const ownPlace = own ? getVillagePlace(own.place) : undefined;
  return { places, next: own && ownPlace ? { place: ownPlace, label: own.label } : undefined };
};

/** A sentence frame in the reader's language, `{{name}}` filled in; the English is the fallback. */
const say = (t: TFunction | undefined, key: string, english: string, params: Record<string, string>): string =>
  t ? String(t(key, { ...params, defaultValue: english })) : english.replace(/\{\{(\w+)\}\}/g, (_, k: string) => params[k] ?? "");

/** «Home and Quest Board», «A, B and C». */
const joinNames = (names: string[], t?: TFunction): string => {
  if (names.length < 2) return names[0] ?? "";
  const head = names.slice(0, -1).join(", ");
  return say(t, "village.opens.and", "{{head}} and {{last}}", { head, last: names[names.length - 1] });
};

/**
 * The «what it opens» line in the reader's language, one line:
 * «Opens: Home and Quest Board. Next on your path: Discover your mission.»
 * The next step's place goes in front of its name («Workshop · …») unless that place was just named as opened.
 */
export const moduleOpensText = (module: JourneyModuleDef, t?: TFunction): string => {
  const { places, next } = moduleOpens(module);
  const parts: string[] = [];
  if (places.length) {
    const list = joinNames(places.map((p) => placeName(p, t)), t);
    parts.push(say(t, "village.opens.places", "Opens: {{places}}.", { places: list }));
  }
  if (next) {
    const name = next.module ? moduleText(next.module, "headline", t) : next.label ?? "";
    const at = placeName(next.place, t);
    // «Workshop · Your uniqueness in one phrase», as the eyebrows write it; no place that was just named or already starts the name.
    const named = places.some((p) => p.key === next.place.key) || name.startsWith(at);
    const where = named ? name : `${at} · ${name}`;
    parts.push(say(t, "village.opens.next", "Next on your path: {{next}}.", { next: where }));
  }
  return parts.join(" ");
};
