import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_RADIO_VOLUME,
  RADIO_ON_KEY,
  RADIO_VOLUME_KEY,
  clampVolume,
  isRadioRoute,
  readRadioOn,
  readRadioVolume,
  writeRadioOn,
  writeRadioVolume,
} from "@/lib/radio";
import { DEFAULT_VILLAGE_ID, getVillageRadio, radioCreditLine } from "@/data/radioStations";

describe("A8 radio: where it lives", () => {
  it("plays in the village and on the game screens", () => {
    for (const path of ["/village", "/village/reception", "/game/journey", "/game/me/overview", "/ubb/offer", "/build/mastermind"]) {
      expect(isRadioRoute(path), path).toBe(true);
    }
  });

  it("is absent from the title screen, the Top Talent reveal and marketing / checkout", () => {
    for (const path of ["/", "/zone-of-genius/entry", "/zone-of-genius/result", "/ignite", "/auth", "/journey", "/ai-os", "/gamer"]) {
      expect(isRadioRoute(path), path).toBe(false);
    }
  });
});

/** The suite runs in plain node: a minimal in-memory localStorage on a stub `window`. */
const memory = new Map<string, string>();
const fakeStorage: Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear"> = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, String(v)),
  removeItem: (k) => void memory.delete(k),
  clear: () => memory.clear(),
};

describe("A8 radio: remembered state", () => {
  beforeEach(() => {
    memory.clear();
    vi.stubGlobal("window", { localStorage: fakeStorage });
  });

  it("is off by default", () => {
    expect(readRadioOn()).toBe(false);
  });

  it("remembers on and off", () => {
    writeRadioOn(true);
    expect(fakeStorage.getItem(RADIO_ON_KEY)).toBe("1");
    expect(readRadioOn()).toBe(true);
    writeRadioOn(false);
    expect(readRadioOn()).toBe(false);
  });

  it("remembers volume, clamped, with a default", () => {
    expect(readRadioVolume()).toBe(DEFAULT_RADIO_VOLUME);
    writeRadioVolume(0.3);
    expect(readRadioVolume()).toBe(0.3);
    writeRadioVolume(4);
    expect(readRadioVolume()).toBe(1);
    fakeStorage.setItem(RADIO_VOLUME_KEY, "junk");
    expect(readRadioVolume()).toBe(DEFAULT_RADIO_VOLUME);
    expect(clampVolume(-2)).toBe(0);
  });
});

describe("A8 radio: station per village", () => {
  it("ships San Pancho, with the stream and the credit from the issue", () => {
    const station = getVillageRadio(DEFAULT_VILLAGE_ID);
    expect(station?.streamUrl).toBe("https://listen.radioking.com/radio/680182/stream/744577");
    expect(station?.homepageUrl).toBe("https://radiosanpancho.org/");
    expect(station && radioCreditLine(station)).toBe("Radio San Pancho · The Sound of Riviera Nayarit");
  });

  it("has no station for a village that has none", () => {
    expect(getVillageRadio("nowhere")).toBeNull();
  });
});
