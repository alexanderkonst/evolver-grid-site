import { describe, expect, it } from "vitest";
import {
  computeRouting,
  decodeShareState,
  encodeShareState,
  isNotYetStage,
  routeAfterBuyingFrame,
  type CoreAnswers,
} from "../engine";

describe("transition quiz engine", () => {
  it("keeps stages 1–3 in the no-ask ending", () => {
    expect([1, 2, 3].every((stage) => isNotYetStage(stage as 1 | 2 | 3))).toBe(true);
    expect(isNotYetStage(4)).toBe(false);
  });

  it("offers the direction-call qualifier for a ripe route", () => {
    const answers: CoreAnswers = {
      stage: 5,
      uniqueness: "integration",
      emergingWorkStage: "named",
    };

    expect(computeRouting(answers)).toEqual({
      showBuyingFrame: true,
      route: "directionCall",
    });
  });

  it("routes a crossed participant to the peer door", () => {
    const answers: CoreAnswers = {
      stage: 7,
      uniqueness: "transmission",
      emergingWorkStage: "working",
    };

    expect(computeRouting(answers)).toEqual({
      showBuyingFrame: false,
      route: "crossedPeer",
    });
  });

  it("honors the closed buying-frame answer", () => {
    expect(routeAfterBuyingFrame("closed")).toBe("none");
    expect(routeAfterBuyingFrame("open")).toBe("directionCall");
  });

  it("round-trips share state and rejects malformed tokens", () => {
    const state = {
      stage: 5 as const,
      uniqueness: "integration" as const,
      emergingWorkStage: "named" as const,
    };

    expect(decodeShareState(encodeShareState(state))).toEqual(state);
    expect(decodeShareState("not-valid-base64")).toBeNull();
  });
});
