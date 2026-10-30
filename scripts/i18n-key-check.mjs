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

// Duplicate keys: JSON.parse keeps the last one silently, so a second "village": {...} block wipes the first (#239).
const duplicates = (lng) => {
  const src = readFileSync(join(root, "src/locales", lng, "common.json"), "utf8");
  const stack = []; // one Set of keys per open object, null for arrays
  const found = [];
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "{") stack.push(new Set());
    else if (c === "[") stack.push(null);
    else if (c === "}" || c === "]") stack.pop();
    else if (c === '"') {
      let j = i + 1;
      while (src[j] !== '"') j += src[j] === "\\" ? 2 : 1;
      const str = src.slice(i + 1, j);
      let k = j + 1;
      while (/\s/.test(src[k])) k++;
      const top = stack[stack.length - 1];
      if (src[k] === ":" && top) {
        if (top.has(str)) found.push(str);
        top.add(str);
      }
      i = j;
    }
  }
  return found;
};
for (const lng of ["en", "ru", "es"]) {
  const d = duplicates(lng);
  if (d.length) { console.log(`${lng}: duplicate keys (later block silently wins): ${d.join(", ")}`); process.exitCode = 1; }
}

const en = load("en");
let failed = false;
for (const lng of ["ru", "es"]) {
  const other = load(lng);
  const missing = Object.keys(en).filter((k) => inScope(k) && !(k in other));
  // Plural forms (_zero/_one/_two/_few/_many/_other) differ per language: an extra form is fine when en has the base or any form of it.
  const PLURAL = /_(zero|one|two|few|many|other)$/;
  const hasEnSource = (k) => {
    if (k in en) return true;
    if (!PLURAL.test(k)) return false;
    const base = k.replace(PLURAL, "");
    return base in en || ["zero", "one", "two", "few", "many", "other"].some((f) => `${base}_${f}` in en);
  };
  const extra = Object.keys(other).filter((k) => inScope(k) && !hasEnSource(k));
  const same = Object.keys(en).filter((k) => inScope(k) && k in other && other[k] === en[k]);
  console.log(`${lng}: ${missing.length} missing, ${extra.length} without an en source, ${same.length} identical to en`);
  for (const k of missing) console.log(`  missing  ${k}`);
  for (const k of extra) console.log(`  extra    ${k}`);
  if (showSame) for (const k of same) console.log(`  same     ${k}`);
  if (missing.length || extra.length) failed = true;
}
process.exit(failed || process.exitCode ? 1 : 0);
