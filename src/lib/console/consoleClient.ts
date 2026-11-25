/**
 * Your AI Console v1: the client call to the `your-ai-console` edge function.
 * A signed-out player never reaches the model: this refuses before the network, and the function
 * refuses again (401). The daily cap comes back as a calm line, never a raw error.
 * Spec: docs/specs/your-ai-console/console-v1.md
 */
import { supabase } from "@/integrations/supabase/client";
import type { ConsoleRequest } from "./phoenixChain";

export const CONSOLE_FUNCTION = "your-ai-console";

export type ConsoleErrorCode = "sign_in_required" | "daily_cap_reached" | "failed";

export class ConsoleError extends Error {
  code: ConsoleErrorCode;
  constructor(code: ConsoleErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

/** The function's error code, from an invoke error whose `context` is the failed response. */
const codeFromError = async (error: unknown): Promise<ConsoleErrorCode> => {
  const ctx = (error as { context?: unknown } | null)?.context;
  let body: unknown = null;
  if (ctx && typeof (ctx as Response).json === "function") {
    try {
      body = await (ctx as Response).json();
    } catch {
      body = null;
    }
  }
  const code = (body as { error?: unknown } | null)?.error;
  if (code === "sign_in_required" || code === "daily_cap_reached") return code;
  return "failed";
};

/** One button, one model call. Returns the model's text; parsing is `parseCardOutput`. */
export const runConsoleButton = async (request: ConsoleRequest, signedIn: boolean): Promise<string> => {
  if (!signedIn) throw new ConsoleError("sign_in_required");
  const { data, error } = await supabase.functions.invoke(CONSOLE_FUNCTION, { body: request });
  if (error) throw new ConsoleError(await codeFromError(error), error.message);
  if (data?.error) {
    const code = data.error === "daily_cap_reached" || data.error === "sign_in_required" ? data.error : "failed";
    throw new ConsoleError(code);
  }
  const text = typeof data?.text === "string" ? data.text : "";
  if (!text.trim()) throw new ConsoleError("failed", "empty");
  return text;
};
