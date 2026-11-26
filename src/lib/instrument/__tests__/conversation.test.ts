import { expect, it, vi } from "vitest";
import { validateButtons } from "@/data/yourAiCatalog";
import type { DialogueMessage } from "@/modules/zone-of-genius/yourAiTurn";

it("restores the same player's conversation and chips after a reload", async () => {
  const stored = new Map<string, string>();
  vi.stubGlobal("window", { sessionStorage: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
  } });
  try {
    const messages: DialogueMessage[] = [
      { role: "player", text: "Launch a cohort.", buttons: [] },
      { role: "ai", text: "Start with a short practice.", buttons: validateButtons(["practice:breathwork"]) },
    ];
    const beforeReload = await import("../conversation");
    beforeReload.writeConversation("player", messages);
    vi.resetModules();
    const afterReload = await import("../conversation");
    expect(afterReload.readConversation("player")).toEqual(messages);
    expect(afterReload.readConversation("other")).toEqual([]);
  } finally {
    vi.unstubAllGlobals();
  }
});
