import assert from "node:assert/strict";
import { ICPS, MODS, termQuality, freshCandidates } from "./core.mjs";
const stats = {
  "high volume term": { found: 40, highQuality: 5 },
  "one payment term": { found: 3, highQuality: 1, downstream: { paid: 1, cashUsd: 555, calls: 1, replied: 2 } }
};
assert.ok(termQuality(stats,"one payment term") > termQuality(stats,"high volume term"),
  "term with a payment must outrank a high-volume term with zero outcomes");
const icp = ICPS[0];
const used = new Set(["former founder next chapter"]);
const current = new Set(icp.terms.map(t=>t.toLowerCase()));
const fresh = freshCandidates(icp, used, current);
assert.ok(fresh.length > 0, "generates fresh candidates");
assert.ok(!fresh.some(t=>used.has(t.toLowerCase())), "excludes already-used terms");
assert.ok(!fresh.some(t=>current.has(t.toLowerCase())), "excludes current terms");
assert.equal(new Set(fresh.map(t=>t.toLowerCase())).size, fresh.length, "no internal duplicates");
assert.ok(MODS.length >= 6, "modifier pool present");
console.log("ICP Prospector NEW logic: all tests passed");
