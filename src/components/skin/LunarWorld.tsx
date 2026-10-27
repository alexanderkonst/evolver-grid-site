/**
 * LunarWorld — feeds the player's color into the Lunar skin (§14.11).
 *
 *   <LunarWorldCache />  once, at the app root: applies the cached soul colors
 *                        and sky so every screen paints them without a query.
 *                        Renders nothing; does nothing under any other skin.
 *   <LunarWorldSync />   on a screen that already reads the save (Village):
 *                        reads `useCharacterSheet`, refreshes the cache and
 *                        the CSS variables when the Journey moves.
 *
 * The variables themselves are documented in src/lib/lunarWorld.ts.
 */

import { useEffect } from "react";
import { useSkin } from "@/contexts/SkinContext";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { useSoulColors } from "@/hooks/useSoulColors";
import {
  applyLunarWorld,
  clearLunarWorld,
  dawnFromChain,
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

const SyncInner = () => {
  const sheet = useCharacterSheet();
  // Explicit soul colors win; until Spectrum Reading exists the top talent
  // archetype seeds them (useSoulColors derives the same palette as the rail ring).
  const soul = useSoulColors(sheet.soulColors, sheet.topTalent);
  const colors = soul.colors;
  const dawn = dawnFromChain(sheet.chain);
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

export const LunarWorldSync = () => {
  const { skin } = useSkin();
  return skin === "lunar" ? <SyncInner /> : null;
};
