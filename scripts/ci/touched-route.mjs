#!/usr/bin/env node
// Maps changed files to ONE public route to smoke-check.
//
// Usage: git diff --name-only A B | node scripts/ci/touched-route.mjs
// Prints a path like "/build/karime", or nothing when no static route maps.
//
// Method: read src/App.tsx, resolve which component each import brings in,
// find the first static <Route path="..."> rendering that component, and
// match changed files against the import specifiers (file or directory).

import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";

// Already checked unconditionally by the verifier.
const SKIP = [/^\/build\/equilibrium$/, /^\/$/];
const app = readFileSync("src/App.tsx", "utf8");

// identifier -> import specifier normalised to a "src/..." path, no extension
const importOf = new Map();
const norm = (spec) =>
  spec.startsWith("@/") ? `src/${spec.slice(2)}` : `src/${spec.replace(/^\.\//, "")}`;
const IMPORT_RE = /import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*["']([^"']+)["']/g;
for (const m of app.matchAll(IMPORT_RE)) {
  const named = (m[2] || "").split(",").map((s) => s.split(" as ").pop().trim());
  for (const id of [m[1], ...named].filter(Boolean)) importOf.set(id, norm(m[3]));
}
const LAZY_RE = /const\s+(\w+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(\s*["']([^"']+)["']/g;
for (const m of app.matchAll(LAZY_RE)) importOf.set(m[1], norm(m[2]));

// component -> first static route path rendering it
const routeOf = new Map();
const ROUTE_RE = /<Route\s+path="([^"]+)"\s+element=\{(.*)\}\s*\/>/g;
for (const [, path, element] of app.matchAll(ROUTE_RE)) {
  if (/[:*]/.test(path) || /<Navigate\b/.test(element) || SKIP.some((r) => r.test(path))) continue;
  // The innermost tag is the page; outer tags are gates/shells shared by many routes.
  const tags = element.match(/<[A-Z]\w*/g) ?? [];
  const page = tags.at(-1)?.slice(1);
  if (page && !routeOf.has(page)) routeOf.set(page, path);
}

const files = [];
for await (const line of createInterface({ input: process.stdin })) {
  if (line.trim()) files.push(line.trim());
}

for (const f of files) {
  const base = f.replace(/\.(tsx?|jsx?)$/, "");
  for (const [id, spec] of importOf) {
    const route = routeOf.get(id);
    if (!route) continue;
    // Exact file, a directory's index, or (for module dirs) any file inside it.
    const inDir = spec.split("/").length > 2 && f.startsWith(`${spec}/`);
    if (base === spec || base === `${spec}/index` || inDir) {
      console.log(route);
      process.exit(0);
    }
  }
}
