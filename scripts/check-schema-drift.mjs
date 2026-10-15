#!/usr/bin/env node
/**
 * check-schema-drift.mjs — Issue #50 (Sasha 2026-10-14), item 5.
 *
 * The lightest guard against the Issue #49 class of bug: a migration file
 * lives in the repo but was never applied to the live DB, so a column the
 * code writes (`zog_snapshots.output_language`) is silently missing in prod
 * and every save fails with `[PGRST204] Could not find the … column` — for
 * MONTHS, because nothing in CI noticed.
 *
 * How it works: for each (table, column) in schema-drift-manifest.json it
 * asks PostgREST for exactly that column with no rows
 * (`GET /rest/v1/<table>?select=<column>&limit=0`). PostgREST answers 200
 * when the column exists and 400 with code `42703` / `PGRST204` when it
 * doesn't. No rows are read, no data leaves the DB — just a schema probe.
 *
 * Run it against PROD in CI (post-deploy, or on a schedule) so an unapplied
 * migration fails loudly instead of silently breaking saves. It can also be
 * wired as a startup health check in an edge function.
 *
 * Env (either VITE_-prefixed or bare):
 *   SUPABASE_URL        e.g. https://xxxx.supabase.co
 *   SUPABASE_ANON_KEY   anon key is enough for a schema probe
 *
 * Exit codes: 0 = all columns present (or env absent and --strict not set);
 *             1 = drift detected, or env absent WITH --strict.
 *
 * Flags:
 *   --strict   treat missing env as a failure (use in CI where creds must
 *              be present); default is to skip with a warning so local dev
 *              and the test suite don't break when creds aren't configured.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const strict = process.argv.includes("--strict");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const SCHEMA_DRIFT_CODES = new Set(["42703", "42P01", "PGRST204", "PGRST205"]);

function loadManifest() {
  const raw = readFileSync(join(__dirname, "schema-drift-manifest.json"), "utf8");
  const parsed = JSON.parse(raw);
  return parsed.tables || {};
}

async function probeColumn(table, column) {
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(
    table,
  )}?select=${encodeURIComponent(column)}&limit=0`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (res.ok) return { ok: true };
  let body = {};
  try {
    body = await res.json();
  } catch {
    // Non-JSON body — keep the status for the message.
  }
  const code = body?.code;
  const drift = code ? SCHEMA_DRIFT_CODES.has(code) : res.status === 400;
  return {
    ok: false,
    drift,
    status: res.status,
    code,
    message: body?.message || body?.hint || `HTTP ${res.status}`,
  };
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const msg =
      "[schema-drift] SUPABASE_URL / SUPABASE_ANON_KEY not set — skipping the live schema probe.";
    if (strict) {
      console.error(msg + " (--strict: treating as failure)");
      process.exit(1);
    }
    console.warn(msg);
    process.exit(0);
  }

  const tables = loadManifest();
  const missing = [];
  const errors = [];
  let checked = 0;

  for (const [table, columns] of Object.entries(tables)) {
    for (const column of columns) {
      checked += 1;
      try {
        const r = await probeColumn(table, column);
        if (r.ok) continue;
        if (r.drift) {
          missing.push({ table, column, code: r.code, message: r.message });
        } else {
          // A non-drift error (401/403/network) shouldn't mask real drift,
          // but it does mean the probe couldn't confirm the column. Surface
          // it so a misconfigured run is visible rather than falsely green.
          errors.push({ table, column, status: r.status, code: r.code, message: r.message });
        }
      } catch (err) {
        errors.push({ table, column, message: String(err?.message || err) });
      }
    }
  }

  if (missing.length > 0) {
    console.error(`\n[schema-drift] ❌ ${missing.length} column(s) MISSING from the live schema:`);
    for (const m of missing) {
      console.error(`  - ${m.table}.${m.column}  [${m.code}] ${m.message}`);
    }
    console.error(
      "\nA migration that adds these is almost certainly unapplied in this environment. " +
        "Apply the pending migration(s) before the next deploy.\n",
    );
    process.exit(1);
  }

  if (errors.length > 0) {
    console.error(`\n[schema-drift] ⚠️  ${errors.length} column(s) could not be verified:`);
    for (const e of errors) {
      console.error(`  - ${e.table}.${e.column}  ${e.code ? `[${e.code}] ` : ""}${e.message}`);
    }
    // Couldn't-verify is a hard failure in strict mode (CI should be green
    // only when it actually confirmed the schema), a warning otherwise.
    process.exit(strict ? 1 : 0);
  }

  console.log(`[schema-drift] ✓ ${checked} column(s) present in the live schema.`);
}

main().catch((err) => {
  console.error("[schema-drift] unexpected failure:", err);
  process.exit(1);
});
