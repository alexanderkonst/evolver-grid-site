// matchConsentToken — HMAC-SHA256 helpers for §8.6 magic-link consent.
//
// Day 67 (Sasha 2026-05-19): the heads-up email contains two buttons —
// "Yes, introduce us" and "Not now" — each of which is a magic link
// pointing at the match-consent edge function with a signed token.
//
// Token structure (URL-safe base64):
//
//   <payload_b64>.<signature_b64>
//
// Where payload is JSON-serialized:
//
//   { mi: "<match_interest_id>", a: "consent" | "decline", e: <epoch_ms> }
//
// Signature is HMAC-SHA256 of the payload bytes using MATCH_CONSENT_SECRET
// (edge function env var), URL-safe base64 encoded.
//
// Token verifies if:
//   1. Signature matches HMAC of payload
//   2. expires_at (e) is in the future
//
// On token rotation (secret leak), bump MATCH_CONSENT_SECRET → all
// in-flight tokens fail signature check → recipients see "this invitation
// expired" page. See docs/specs/match-mechanic/token_rotation.md.

export type ConsentAction = "consent" | "decline";

export interface ConsentPayload {
  /** match_interests row id */
  mi: string;
  /** Action requested */
  a: ConsentAction;
  /** Expires-at (epoch milliseconds) */
  e: number;
}

const TOKEN_TTL_DAYS = 30;

// ───────────────────────────────────────────────────────────────────
// URL-safe base64 helpers (no padding)
// ───────────────────────────────────────────────────────────────────

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const fromBase64Url = (b64: string): Uint8Array => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const std = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(std);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const textEncode = (s: string) => new TextEncoder().encode(s);
const textDecode = (b: Uint8Array) => new TextDecoder().decode(b);

// ───────────────────────────────────────────────────────────────────
// HMAC-SHA256
// ───────────────────────────────────────────────────────────────────

const importKey = async (secret: string): Promise<CryptoKey> => {
  return await crypto.subtle.importKey(
    "raw",
    textEncode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
};

const hmacSign = async (
  secret: string,
  data: Uint8Array,
): Promise<Uint8Array> => {
  const key = await importKey(secret);
  const sigBuf = await crypto.subtle.sign("HMAC", key, data);
  return new Uint8Array(sigBuf);
};

// Constant-time byte comparison
const constantTimeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

// ───────────────────────────────────────────────────────────────────
// Sign + verify
// ───────────────────────────────────────────────────────────────────

/**
 * Sign a consent token. Returns URL-safe `<payload>.<signature>`.
 * Defaults to 30-day expiry from now.
 */
export const signConsentToken = async (
  matchInterestId: string,
  action: ConsentAction,
  secret: string,
  ttlDays: number = TOKEN_TTL_DAYS,
): Promise<string> => {
  if (!secret) throw new Error("MATCH_CONSENT_SECRET is not set");
  const payload: ConsentPayload = {
    mi: matchInterestId,
    a: action,
    e: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = textEncode(payloadJson);
  const payloadB64 = toBase64Url(payloadBytes);

  const sigBytes = await hmacSign(secret, payloadBytes);
  const sigB64 = toBase64Url(sigBytes);

  return `${payloadB64}.${sigB64}`;
};

export interface VerifyResult {
  ok: boolean;
  payload?: ConsentPayload;
  reason?:
    | "malformed"
    | "bad_signature"
    | "expired";
}

/**
 * Verify a consent token. Returns ok=true with the payload, or ok=false
 * with a reason. Reasons drive which Aurora-styled page the consent
 * function renders.
 */
export const verifyConsentToken = async (
  token: string,
  secret: string,
): Promise<VerifyResult> => {
  if (!secret) throw new Error("MATCH_CONSENT_SECRET is not set");
  if (!token || !token.includes(".")) {
    return { ok: false, reason: "malformed" };
  }
  const [payloadB64, sigB64] = token.split(".", 2);
  if (!payloadB64 || !sigB64) {
    return { ok: false, reason: "malformed" };
  }

  let payloadBytes: Uint8Array;
  let sigBytes: Uint8Array;
  try {
    payloadBytes = fromBase64Url(payloadB64);
    sigBytes = fromBase64Url(sigB64);
  } catch {
    return { ok: false, reason: "malformed" };
  }

  // Verify signature
  const expectedSig = await hmacSign(secret, payloadBytes);
  if (!constantTimeEqual(sigBytes, expectedSig)) {
    return { ok: false, reason: "bad_signature" };
  }

  // Parse payload
  let payload: ConsentPayload;
  try {
    const parsed = JSON.parse(textDecode(payloadBytes));
    if (
      typeof parsed.mi !== "string" ||
      (parsed.a !== "consent" && parsed.a !== "decline") ||
      typeof parsed.e !== "number"
    ) {
      return { ok: false, reason: "malformed" };
    }
    payload = parsed as ConsentPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  // Check expiry
  if (payload.e < Date.now()) {
    return { ok: false, reason: "expired", payload };
  }

  return { ok: true, payload };
};
