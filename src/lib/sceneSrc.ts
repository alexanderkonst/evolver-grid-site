import { useSyncExternalStore } from "react";

/**
 * Light skins show the day renders of the title lake and the village scenes; Lunar shows
 * its own moonlit renders of the village scenes (the title lake keeps the night art);
 * the other skins keep the night art. Same file names and sizes, one folder down.
 */
const LIGHT_SKINS: ReadonlySet<string> = new Set(["lapis", "dao"]);
const LUNAR_SKIN = "lunar";

const VILLAGE_SCENE = /^\/game\/village\/([^/]+\.webp)$/;
const HERO_SCENE = "/game/hero_forest.webp";

/** The scene art for a skin: the day path on a light skin, the lunar village path on Lunar, the path unchanged otherwise. */
export const sceneSrc = (path: string, skin: string | null | undefined): string => {
  if (skin === LUNAR_SKIN) {
    const village = VILLAGE_SCENE.exec(path);
    return village ? `/game/village/lunar/${village[1]}` : path;
  }
  if (!skin || !LIGHT_SKINS.has(skin)) return path;
  if (path === HERO_SCENE) return "/game/day/hero_forest.webp";
  const village = VILLAGE_SCENE.exec(path);
  return village ? `/game/village/day/${village[1]}` : path;
};

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-skin"] });
  return () => observer.disconnect();
};
const readSkin = () => document.documentElement.dataset.skin ?? null;
const readServerSkin = () => null;

/** `sceneSrc` for the live `<html data-skin>`: the image swaps when the skin does, no reload. */
export const useSceneSrc = (path: string): string =>
  sceneSrc(path, useSyncExternalStore(subscribe, readSkin, readServerSkin));
