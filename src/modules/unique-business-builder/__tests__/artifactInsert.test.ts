import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetUnavailableArtifactColumns,
  findMissingOptionalColumn,
  friendlyArtifactError,
  insertWithOptionalColumns,
} from "../artifactInsert";

const miss = (col: string) => ({
  message: `Could not find the '${col}' column of 'user_business_artifacts' in the schema cache`,
});

const payload = {
  user_id: "u",
  artifact_key: "uniqueness",
  prompt_version_at_lock: "abc",
  input_version_at_lock: "def",
  output_language: "en",
};

describe("insertWithOptionalColumns", () => {
  beforeEach(() => {
    __resetUnavailableArtifactColumns();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("retries past several missing optional columns, one at a time", async () => {
    const insert = vi.fn(async (p: Record<string, unknown>) => {
      if ("prompt_version_at_lock" in p) return { data: null, error: miss("prompt_version_at_lock") };
      if ("input_version_at_lock" in p) return { data: null, error: miss("input_version_at_lock") };
      return { data: { id: "row" }, error: null };
    });
    const res = await insertWithOptionalColumns(payload, insert);
    expect(res.error).toBeNull();
    expect(res.data).toEqual({ id: "row" });
    expect(insert).toHaveBeenCalledTimes(3);
    expect(insert.mock.calls[2][0]).toEqual({
      user_id: "u",
      artifact_key: "uniqueness",
      output_language: "en",
    });
  });

  it("remembers unavailable columns for later inserts", async () => {
    const insert = vi.fn(async (p: Record<string, unknown>) =>
      "prompt_version_at_lock" in p
        ? { data: null, error: miss("prompt_version_at_lock") }
        : { data: { id: "row" }, error: null }
    );
    await insertWithOptionalColumns(payload, insert);
    insert.mockClear();
    await insertWithOptionalColumns(payload, insert);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert.mock.calls[0][0]).not.toHaveProperty("prompt_version_at_lock");
  });

  it("returns non-schema errors untouched, without retrying", async () => {
    const error = { code: "23505", message: "duplicate key value" };
    const insert = vi.fn(async () => ({ data: null, error }));
    const res = await insertWithOptionalColumns(payload, insert);
    expect(res.error).toBe(error);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("does not treat required-column misses as optional", () => {
    expect(findMissingOptionalColumn(miss("content_json"))).toBeNull();
    expect(findMissingOptionalColumn(miss("output_language"))).toBe("output_language");
  });
});

describe("friendlyArtifactError", () => {
  it("hides raw DB errors", () => {
    expect(friendlyArtifactError(miss("prompt_version_at_lock"), "Please retry.")).toBe("Please retry.");
    expect(friendlyArtifactError({ code: "PGRST204", message: "x" }, "Please retry.")).toBe("Please retry.");
  });

  it("passes ordinary messages through and falls back when empty", () => {
    expect(friendlyArtifactError(new Error("Network hiccup."), "fallback")).toBe("Network hiccup.");
    expect(friendlyArtifactError(null, "fallback")).toBe("fallback");
  });
});
