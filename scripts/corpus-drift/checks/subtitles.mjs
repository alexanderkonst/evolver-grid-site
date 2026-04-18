// C2 — Canonical subtitle in PLAYBOOK_STEPS matches the Canonical Subtitle
// column in the canvas v3.0 table. These are psychoactive and should never drift.

export const id = "C2";
export const name = "Subtitles";

export function run({ code, canvas }) {
  const issues = [];
  let aligned = 0;

  for (const step of code) {
    const canvasRow = canvas.find((r) => r.number === step.number);
    if (!canvasRow) continue; // handled by C1

    if (normalise(step.subtitle) === normalise(canvasRow.subtitle)) {
      aligned += 1;
      continue;
    }

    issues.push({
      step: step.number,
      expected: canvasRow.subtitle,
      actual: step.subtitle ?? "(missing)",
      message: `Subtitle drift on Step ${step.number}`,
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

function normalise(raw) {
  if (!raw) return "";
  return raw.toLowerCase().replace(/[\s,.;:]+/g, " ").trim();
}
