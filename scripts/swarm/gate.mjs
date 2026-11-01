// Second-key gate (#285): which PRs need an independent review before auto-merge.
//
// Gated = touches supabase/ or any non-test file under src/ (game routes live in src/).
// The same regex is inlined in .agent/pending/second-key.yml and .agent/pending/agent-automerge.yml
// (workflows cannot import repo code safely from a PR head). gate.test.mjs fails if the copies drift.

export const GATE_RE = /^(supabase\/|src\/(?!.*(?:__tests__\/|\.test\.[cm]?[jt]sx?$)))/;

export function isGatedFile(path) {
  return GATE_RE.test(path);
}

/** files: array of GitHub "list PR files" entries ({ filename, previous_filename? }). */
export function isGatedPr(files) {
  return files.some((f) => isGatedFile(f.filename) || (f.previous_filename && isGatedFile(f.previous_filename)));
}

/** The exact line both workflows must carry. */
export const GATE_LINE = `const GATE_RE = /${GATE_RE.source}/;`;
