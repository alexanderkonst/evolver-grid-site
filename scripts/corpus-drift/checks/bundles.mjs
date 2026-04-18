// C3 — Bundle symmetry + container consistency.
//
// For every step with `bundleWith: [j]`:
//   (a) Step j must have bundleWith including step.number (symmetric)
//   (b) Both canvas rows must name the SAME Commercial Container
//       (e.g., both say "Ignition bundle — Step 2+3 in one payment").

export const id = "C3";
export const name = "Bundle symmetry";

export function run({ code, canvas }) {
  const issues = [];
  const bundlePairs = new Set();

  for (const step of code) {
    if (!step.bundleWith || step.bundleWith.length === 0) continue;

    for (const partnerNumber of step.bundleWith) {
      const partner = code.find((s) => s.number === partnerNumber);
      if (!partner) {
        issues.push({
          step: step.number,
          message: `Step ${step.number} bundleWith references missing Step ${partnerNumber}`,
        });
        continue;
      }

      // (a) Symmetry
      if (!partner.bundleWith || !partner.bundleWith.includes(step.number)) {
        issues.push({
          step: step.number,
          message: `Asymmetric bundle — Step ${step.number} → ${partnerNumber}, but Step ${partnerNumber} does not name ${step.number}`,
        });
      }

      // (b) Canvas container consistency — only check each pair once.
      const pairKey = [step.number, partnerNumber].sort().join("-");
      if (bundlePairs.has(pairKey)) continue;
      bundlePairs.add(pairKey);

      const rowA = canvas.find((r) => r.number === step.number);
      const rowB = canvas.find((r) => r.number === partnerNumber);
      if (!rowA || !rowB) continue;

      const containerA = stripBundleSuffix(rowA.container);
      const containerB = stripBundleSuffix(rowB.container);
      if (containerA !== containerB) {
        issues.push({
          step: step.number,
          message: `Bundle ${pairKey}: canvas containers differ — Step ${step.number}: "${rowA.container}" vs Step ${partnerNumber}: "${rowB.container}"`,
        });
      }
    }
  }

  const totalBundles = bundlePairs.size;
  const failedBundles = new Set(
    issues.map((i) => i.message.match(/Bundle (\d+-\d+)/)?.[1]).filter(Boolean)
  ).size;

  return {
    id,
    name,
    total: totalBundles,
    aligned: totalBundles - failedBundles,
    issues,
    passed: issues.length === 0,
  };
}

function stripBundleSuffix(container) {
  return container
    .toLowerCase()
    .replace(/\s*—\s*step\s+\d+\+\d+\s+in\s+one\s+(payment|container).*/, "")
    .replace(/\s+/g, " ")
    .trim();
}
