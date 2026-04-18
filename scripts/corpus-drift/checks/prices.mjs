// C1 — Prices in PLAYBOOK_STEPS match the Price column in the canvas v3.0 table.
//
// Normalisation: the canvas sometimes brackets prices with "(bundled with Step N)"
// — we strip that before comparing to the code's raw `price` string.

export const id = "C1";
export const name = "Prices";

export function run({ code, canvas }) {
  const issues = [];
  let aligned = 0;

  for (const step of code) {
    const canvasRow = canvas.find((r) => r.number === step.number);
    if (!canvasRow) {
      issues.push({
        step: step.number,
        message: `Step ${step.number} missing from canvas v3.0 table`,
      });
      continue;
    }

    if (pricesMatch(step.price, canvasRow.price)) {
      aligned += 1;
      continue;
    }

    issues.push({
      step: step.number,
      expected: canvasRow.price,
      actual: step.price ?? "(undefined)",
      message: `Price drift on Step ${step.number}`,
    });
  }

  return {
    id,
    name,
    total: code.length,
    aligned,
    issues,
    passed: issues.length === 0,
  };
}

/**
 * Two prices match if:
 *  - Both empty / TBD / undefined
 *  - Both "free"
 *  - Same set of dollar amounts appear in both (ignoring bundle notes and verbose terms)
 *  - Same rev-share/equity token appears in both
 */
function pricesMatch(codeRaw, canvasRaw) {
  const a = summarise(codeRaw);
  const b = summarise(canvasRaw);

  if (a.tbd && b.tbd) return true;
  if (a.free && b.free) return true;

  // Dollar amounts must match as sets
  const sameDollars =
    a.dollars.length === b.dollars.length &&
    a.dollars.every((d) => b.dollars.includes(d));
  if (!sameDollars) return false;

  // Rev-share / equity tokens must agree
  if (a.revShare !== b.revShare) return false;
  if (a.equity !== b.equity) return false;

  return true;
}

function summarise(raw) {
  if (!raw) return { tbd: true, free: false, dollars: [], revShare: false, equity: false };
  const lower = raw.toLowerCase();

  if (/\btbd\b|^\s*$|spec only/.test(lower)) {
    return { tbd: true, free: false, dollars: [], revShare: false, equity: false };
  }

  // Strip bundle suffixes / parenthetical terms to focus on core money shape.
  const core = lower
    .replace(/\(bundled with[^)]*\)/g, "")
    .replace(/full terms:[^)]*\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();

  const free = /^\s*free\s*$/.test(core);
  const dollars = Array.from(core.matchAll(/\$([\d,\.]+)/g))
    .map((m) => m[1].replace(/[,.]$/, ""))
    .map((n) => n.replace(/,/g, ""))
    .sort();
  const revShare = /rev(enue)?\s*share|rev\s*share/.test(core);
  const equity = /\bequity\b/.test(core);

  return { tbd: false, free, dollars, revShare, equity };
}
