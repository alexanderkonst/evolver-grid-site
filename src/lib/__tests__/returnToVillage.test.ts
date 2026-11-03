import { describe, expect, it } from "vitest";
import { isGameScreen, isTypingTarget, isVillageMap, shouldReturnToVillage, type ReturnKeyInput } from "@/lib/returnToVillage";

const press = (over: Partial<ReturnKeyInput>): ReturnKeyInput => ({
  key: "m",
  typing: false,
  modalOpen: false,
  pathname: "/game/learn",
  ...over,
});

describe("return to village (medallion keys)", () => {
  it("M and Esc go back from a game screen", () => {
    expect(shouldReturnToVillage(press({ key: "m" }))).toBe(true);
    expect(shouldReturnToVillage(press({ key: "M" }))).toBe(true);
    expect(shouldReturnToVillage(press({ key: "м" }))).toBe(true);
    expect(shouldReturnToVillage(press({ key: "Escape" }))).toBe(true);
  });
  it("never while typing or over a modal", () => {
    expect(shouldReturnToVillage(press({ typing: true }))).toBe(false);
    expect(shouldReturnToVillage(press({ key: "Escape", modalOpen: true }))).toBe(false);
  });
  it("never with a modifier, a repeat or a handled event", () => {
    expect(shouldReturnToVillage(press({ metaKey: true }))).toBe(false);
    expect(shouldReturnToVillage(press({ ctrlKey: true }))).toBe(false);
    expect(shouldReturnToVillage(press({ shiftKey: true }))).toBe(false);
    expect(shouldReturnToVillage(press({ repeat: true }))).toBe(false);
    expect(shouldReturnToVillage(press({ defaultPrevented: true }))).toBe(false);
  });
  it("not on the map, not off the game, and Esc in a place is the village's own", () => {
    expect(shouldReturnToVillage(press({ pathname: "/village" }))).toBe(false);
    expect(shouldReturnToVillage(press({ pathname: "/" }))).toBe(false);
    expect(shouldReturnToVillage(press({ pathname: "/village/academy" }))).toBe(true);
    expect(shouldReturnToVillage(press({ key: "Escape", pathname: "/village/academy" }))).toBe(false);
  });
  it("knows the game screens", () => {
    expect(isGameScreen("/village/cafe")).toBe(true);
    expect(isGameScreen("/game/learn")).toBe(true);
    expect(isGameScreen("/zone-of-genius/entry")).toBe(true);
    expect(isGameScreen("/")).toBe(false);
    expect(isVillageMap("/village")).toBe(true);
  });
  it("text fields count as typing, buttons do not", () => {
    const input = { tagName: "INPUT", type: "text" } as unknown as Element;
    const check = { tagName: "INPUT", type: "checkbox" } as unknown as Element;
    const area = { tagName: "TEXTAREA" } as unknown as Element;
    const div = { tagName: "DIV", isContentEditable: true } as unknown as Element;
    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget(check)).toBe(false);
    expect(isTypingTarget(area)).toBe(true);
    expect(isTypingTarget(div)).toBe(true);
    expect(isTypingTarget(null)).toBe(false);
  });
});
