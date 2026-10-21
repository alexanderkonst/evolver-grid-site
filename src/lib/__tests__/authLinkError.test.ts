import { describe, expect, it } from "vitest";
import { parseAuthLinkError } from "../authLinkError";

describe("parseAuthLinkError", () => {
  it("flags an expired confirmation link from the URL fragment", () => {
    const result = parseAuthLinkError(
      "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
    );
    expect(result).toEqual({
      code: "otp_expired",
      error: "access_denied",
      description: "Email link is invalid or has expired",
      expired: true,
    });
  });

  it("handles the short form without a description", () => {
    const result = parseAuthLinkError("#error=access_denied&error_code=otp_expired");
    expect(result?.expired).toBe(true);
    expect(result?.description).toBeNull();
  });

  it("reads PKCE-style errors from the query string", () => {
    const result = parseAuthLinkError("?error=access_denied&error_code=otp_expired");
    expect(result?.expired).toBe(true);
  });

  it("reports other link errors as not expired", () => {
    const result = parseAuthLinkError("#error=server_error&error_code=unexpected_failure");
    expect(result).not.toBeNull();
    expect(result?.expired).toBe(false);
  });

  it("returns null when there is no error", () => {
    expect(parseAuthLinkError("")).toBeNull();
    expect(parseAuthLinkError(null)).toBeNull();
    expect(parseAuthLinkError(undefined)).toBeNull();
    expect(parseAuthLinkError("#access_token=abc&refresh_token=def&type=signup")).toBeNull();
    expect(parseAuthLinkError("?tab=export")).toBeNull();
  });
});
