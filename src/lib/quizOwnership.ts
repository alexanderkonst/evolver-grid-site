/**
 * Browser-local memory for the public Transition Quiz result.
 *
 * The quiz is intentionally useful before auth. This marker lets the shell
 * reveal ME on the same browser after a person has completed it, while the
 * database link remains the cross-device source of truth after they save it
 * to an account.
 */
export const QUIZ_RESULT_STORAGE_KEY = "fytt:transition-quiz-result:v1";
export const QUIZ_RESULT_EVENT = "fytt:transition-quiz-result";

export interface LocalQuizResult {
  completedAt: string;
  resultId?: string;
}

export function readLocalQuizResult(): LocalQuizResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUIZ_RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalQuizResult>;
    if (typeof parsed.completedAt !== "string") return null;
    return {
      completedAt: parsed.completedAt,
      ...(typeof parsed.resultId === "string" ? { resultId: parsed.resultId } : {}),
    };
  } catch {
    return null;
  }
}

export function rememberLocalQuizResult(resultId?: string): void {
  if (typeof window === "undefined") return;
  const previous = readLocalQuizResult();
  const value: LocalQuizResult = {
    completedAt: previous?.completedAt ?? new Date().toISOString(),
    ...(resultId ? { resultId } : previous?.resultId ? { resultId: previous.resultId } : {}),
  };

  try {
    window.localStorage.setItem(QUIZ_RESULT_STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(QUIZ_RESULT_EVENT, { detail: value }));
  } catch {
    // Storage may be disabled. The public result still works normally.
  }
}

export function buildQuizClaimPath(resultId: string): string {
  return `/quiz/r/${encodeURIComponent(resultId)}?claim=1`;
}
