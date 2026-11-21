import { describe, expect, it } from "vitest";
import { emailSendErrorLine, loginErrorLine, signUpErrorLine } from "@/lib/authErrors";

const t = (key: string) => key;

describe("authErrors: plain one-liners, never raw text", () => {
  it("maps a failed log-in", () => {
    expect(loginErrorLine({ message: "Invalid login credentials", code: "invalid_credentials" }, t)).toBe("auth.loginInvalid");
    expect(loginErrorLine({ message: "Email not confirmed", code: "email_not_confirmed" }, t)).toBe("auth.loginUnconfirmed");
    expect(loginErrorLine({ status: 429, message: "x" }, t)).toBe("auth.signUpRateLimit");
    expect(loginErrorLine({ message: "TypeError: Failed to fetch" }, t)).toBe("auth.loginGenericError");
    expect(loginErrorLine(undefined, t)).toBe("auth.loginGenericError");
  });

  it("maps a failed sign-up", () => {
    expect(signUpErrorLine({ code: "weak_password", message: "Password is known to be weak" }, t)).toBe("auth.signUpWeakPassword");
    expect(signUpErrorLine({ message: "email rate limit exceeded" }, t)).toBe("auth.signUpRateLimit");
    expect(signUpErrorLine({ message: "500 Internal Server Error" }, t)).toBe("auth.signUpGenericError");
  });

  it("maps an email that did not go out", () => {
    expect(emailSendErrorLine({ message: "For security purposes, you can only request this after 20 seconds" }, t, "auth.tryAgain")).toBe(
      "auth.signUpRateLimit",
    );
    expect(emailSendErrorLine({ message: "Error sending recovery email" }, t, "auth.resetGenericError")).toBe("auth.resetGenericError");
  });
});
