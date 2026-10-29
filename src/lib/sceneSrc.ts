import { useSyncExternalStore } from "react";

/**
 * Light skins show the day renders of the title lake and the village scenes; the other
 * skins keep the night art. Same file names and sizes, one folder down.
 */
const LIGHT_SKINS: ReadonlySet<string> = new Set(["lapis", "dao"]);

const VILLAGE_SCENE = /^\/game\/village\/([^/]+\.webp)$/;
const HERO_SCENE = "/game/hero_forest.webp";

/** The scene art for a skin: the day path on a light skin, the path unchanged otherwise. */
export const sceneSrc = (path: string, skin: string | null | undefined): string => {
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
