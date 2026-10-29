import { describe, expect, it } from "vitest";
import { VILLAGE_MAP, VILLAGE_PLACES } from "@/data/villagePlaces";
import { sceneSrc } from "../sceneSrc";

describe("sceneSrc: light skins use the day art", () => {
  it("lapis and dao read the day hero and the day village scenes", () => {
    for (const skin of ["lapis", "dao"]) {
      expect(sceneSrc("/game/hero_forest.webp", skin)).toBe("/game/day/hero_forest.webp");
      expect(sceneSrc("/game/village/map.webp", skin)).toBe("/game/village/day/map.webp");
      expect(sceneSrc("/game/village/quest-board.webp", skin)).toBe("/game/village/day/quest-board.webp");
    }
  });

  it("every village scene has a day file of the same name", () => {
    for (const image of [VILLAGE_MAP.image, ...VILLAGE_PLACES.map((p) => p.image)]) {
      expect(sceneSrc(image, "lapis")).toBe(image.replace("/game/village/", "/game/village/day/"));
    }
  });

  it("lunar, aurum and unknown skins keep the night art", () => {
    for (const skin of ["lunar", "aurum", "navy-gold", "", null, undefined]) {
      expect(sceneSrc("/game/hero_forest.webp", skin)).toBe("/game/hero_forest.webp");
      expect(sceneSrc("/game/village/map.webp", skin)).toBe("/game/village/map.webp");
    }
  });

  it("a path that is not a scene is unchanged", () => {
    for (const path of ["/game/village/day/map.webp", "/game/other.webp", "/logo.png", ""]) {
      expect(sceneSrc(path, "lapis")).toBe(path);
    }
  });
});
