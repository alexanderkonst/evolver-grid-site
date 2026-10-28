/**
 * LunarWorld — feeds the player's color into the Lunar skin (§14.11).
 *
 * Lunar keeps no state of its own. Whether a place is silver or colored is
 * WP-3's `placeState()`, drawn by `PlaceState` as `data-place-state`; the CSS in
 * src/styles/lunar-world.css reads that attribute. What lives here is only what
 * the attribute cannot carry: the player's soul colors and the sky.
 *
 *   <LunarWorldCache />  once, at the app root: applies the cached soul colors
 *                        and sky so every screen paints them without a query.
 *                        Renders nothing; does nothing under any other skin.
 *   <LunarWorldSync />   on a screen that already reads the save (Village): takes
 *                        the character sheet and the `PlaceSave` it already built
 *                        for `placeState()`, refreshes the cache and the CSS
 *                        variables when the Journey moves.
 *   <LunarPaths />       the paths between colored places, lit by `placeState()`.
 *
 * The variables themselves are documented in src/lib/lunarWorld.ts.
 */

import { useEffect } from "react";
import { useSkin } from "@/contexts/SkinContext";
import type { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { useSoulColors } from "@/hooks/useSoulColors";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import type { PlaceSave, PlaceStateName } from "@/lib/placeState";
import {
  LUNAR_PATHS,
  applyLunarWorld,
  clearLunarWorld,
  dawnFromSave,
  isColored,
  readLunarWorld,
  writeLunarWorld,
} from "@/lib/lunarWorld";

export const LunarWorldCache = () => {
  const { skin } = useSkin();

  useEffect(() => {
    if (skin !== "lunar") return;
    applyLunarWorld(readLunarWorld());
    return clearLunarWorld;
  }, [skin]);

  return null;
};

type SyncProps = {
  sheet: ReturnType<typeof useCharacterSheet>;
  /** The save `placeState()` was computed from, so the sky and the places agree. */
  save: PlaceSave;
};

const SyncInner = ({ sheet, save }: SyncProps) => {
  // Explicit soul colors win; until Spectrum Reading exists the top talent
  // archetype seeds them (useSoulColors derives the same palette as the rail ring).
  const soul = useSoulColors(sheet.soulColors, sheet.topTalent);
  const colors = soul.colors;
  const dawn = dawnFromSave(save);
  const key = `${colors?.join("|") ?? ""}#${dawn.toFixed(3)}`;

  useEffect(() => {
    if (sheet.isLoading) return;
    const world = { soul: colors, dawn };
    applyLunarWorld(world);
    writeLunarWorld(world);
    // `key` carries colors + dawn, the only inputs the effect reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet.isLoading, key]);

  return null;
};

export const LunarWorldSync = (props: SyncProps) => {
  const { skin } = useSkin();
  return skin === "lunar" ? <SyncInner {...props} /> : null;
};

/**
 * Paths between places, in the same % as villagePlaces.ts. `states` is aligned with
 * VILLAGE_PLACES (the `placeState()` of each). A path is lit (`data-lit`) when both
 * ends are done / live. Render inside `.vl-drift`, under the pins.
 */
export const LunarPaths = ({ states }: { states: PlaceStateName[] }) => {
  const { skin } = useSkin();
  if (skin !== "lunar") return null;
  const at = (key: string) => {
    const i = VILLAGE_PLACES.findIndex((p) => p.key === key);
    return i < 0 ? null : { place: VILLAGE_PLACES[i], state: states[i] };
  };
  return (
    <svg className="vl-paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {LUNAR_PATHS.map(([from, to]) => {
        const a = at(from);
        const b = at(to);
        if (!a || !b) return null;
        const lit = isColored(a.state) && isColored(b.state);
        return (
          <path
            key={`${from}-${to}`}
            data-lit={lit ? "true" : "false"}
            d={`M ${a.place.x} ${a.place.y} L ${b.place.x} ${b.place.y}`}
          />
        );
      })}
    </svg>
  );
};
