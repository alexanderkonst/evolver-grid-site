#!/usr/bin/env node
/**
 * i18n key alignment: `en` is the source of truth; `ru` and `es` must carry the same keys.
 * Usage: node scripts/i18n-key-check.mjs [--prefix village.,zogEntry.] [--same-as-en]
 *
 *   --prefix      only report keys that start with one of these prefixes (comma-separated)
 *   --same-as-en  also list keys whose ru/es value is identical to English (untranslated)
 *
 * Exits 1 when a key is missing from ru or es (or exists there without an en source).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const prefixArg = args.indexOf("--prefix");
const prefixes = prefixArg >= 0 ? (args[prefixArg + 1] ?? "").split(",").filter(Boolean) : [];
const showSame = args.includes("--same-as-en");

const flatten = (obj, path = "") =>
  Object.entries(obj).reduce((out, [k, v]) => {
    const key = path ? `${path}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
    return out;
  }, {});

const load = (lng) => flatten(JSON.parse(readFileSync(join(root, "src/locales", lng, "common.json"), "utf8")));
const inScope = (key) => prefixes.length === 0 || prefixes.some((p) => key.startsWith(p));

const en = load("en");
let failed = false;
for (const lng of ["ru", "es"]) {
  const other = load(lng);
  const missing = Object.keys(en).filter((k) => inScope(k) && !(k in other));
  const extra = Object.keys(other).filter((k) => inScope(k) && !(k in en));
  const same = Object.keys(en).filter((k) => inScope(k) && k in other && other[k] === en[k]);
  console.log(`${lng}: ${missing.length} missing, ${extra.length} without an en source, ${same.length} identical to en`);
  for (const k of missing) console.log(`  missing  ${k}`);
  for (const k of extra) console.log(`  extra    ${k}`);
  if (showSame) for (const k of same) console.log(`  same     ${k}`);
  if (missing.length || extra.length) failed = true;
}
process.exit(failed ? 1 : 0);
