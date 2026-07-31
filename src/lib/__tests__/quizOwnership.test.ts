import { beforeEach, describe, expect, it } from "vitest";
import {
  buildQuizClaimPath,
  QUIZ_RESULT_STORAGE_KEY,
  readLocalQuizResult,
  rememberLocalQuizResult,
} from "../quizOwnership";

describe("quizOwnership", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("remembers a completion before a server id exists", () => {
    rememberLocalQuizResult();
    expect(readLocalQuizResult()?.completedAt).toBeTruthy();
  });

  it("adds the server id without replacing the original completion time", () => {
    rememberLocalQuizResult();
    const completedAt = readLocalQuizResult()?.completedAt;
    rememberLocalQuizResult("abc-123");
    expect(readLocalQuizResult()).toEqual({ completedAt, resultId: "abc-123" });
  });

  it("fails closed on malformed browser data", () => {
    window.localStorage.setItem(QUIZ_RESULT_STORAGE_KEY, "not-json");
    expect(readLocalQuizResult()).toBeNull();
  });

  it("builds an auth-return-safe claim route", () => {
    expect(buildQuizClaimPath("abc-123")).toBe("/quiz/r/abc-123?claim=1");
  });
});
