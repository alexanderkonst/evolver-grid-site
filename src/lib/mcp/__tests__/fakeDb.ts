/**
 * In-memory stand-in for the slice of the Supabase client the MCP tools use.
 * Rows are plain objects; filters (`eq`, `is`, `in`) are applied lazily when
 * the builder is awaited. Fixtures in the tests are synthetic.
 */

import type { Db } from "../tools/_shared";

export type Row = Record<string, any>;

type Op = "select" | "insert" | "update" | "delete" | "upsert";

export interface FakeDbOptions {
  /** Make one operation on one table fail with a Postgres-style error. */
  fail?: { table: string; op: Op; code?: string; message?: string; /** Fail only this many times, then behave normally. */ times?: number };
  /** Edge function stub: `functions.invoke(name, { body })`. */
  invoke?: (name: string, args: { body: any }) => { data: any; error: any } | Promise<{ data: any; error: any }>;
}

export const RAW_DB_MESSAGE = 'relation "public.secret_table" violates policy "internal_policy_name"';

export function fakeDb(seed: Record<string, Row[]> = {}, options: FakeDbOptions = {}) {
  const tables: Record<string, Row[]> = JSON.parse(JSON.stringify(seed));
  const invocations: { name: string; body: any }[] = [];
  let nextId = 1;
  let clock = Date.parse("2026-10-01T00:00:00.000Z");

  const rowsOf = (table: string) => (tables[table] ??= []);

  const from = (table: string) => {
    let op: Op = "select";
    let payload: Row | Row[] | undefined;
    let upsertKeys: string[] = [];
    let ignoreDuplicates = false;
    let wantRows = false;
    let single: "none" | "maybe" | "one" = "none";
    let order: { col: string; asc: boolean } | undefined;
    let limitN: number | undefined;
    const filters: ((r: Row) => boolean)[] = [];

    const matching = () => rowsOf(table).filter((r) => filters.every((f) => f(r)));

    const finish = (rows: Row[]) => {
      let out = rows;
      if (order) {
        out = [...out].sort(
          (a, b) => (a[order!.col] < b[order!.col] ? -1 : a[order!.col] > b[order!.col] ? 1 : 0) * (order!.asc ? 1 : -1),
        );
      }
      if (limitN !== undefined) out = out.slice(0, limitN);
      if (single === "maybe") return { data: out[0] ?? null, error: null };
      if (single === "one") {
        return out[0]
          ? { data: out[0], error: null }
          : { data: null, error: { code: "PGRST116", message: "no rows returned" } };
      }
      return { data: out, error: null };
    };

    const stamp = (row: Row): Row => ({
      id: `00000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}`,
      created_at: new Date((clock += 1000)).toISOString(),
      ...row,
    });

    const run = (): { data: any; error: any } => {
      if (options.fail && options.fail.table === table && options.fail.op === op && (options.fail.times ?? 1) > 0) {
        if (options.fail.times !== undefined) options.fail.times -= 1;
        return {
          data: null,
          error: { code: options.fail.code ?? "XX000", message: options.fail.message ?? RAW_DB_MESSAGE },
        };
      }
      if (op === "select") return finish(matching());

      if (op === "insert") {
        const inserted = (Array.isArray(payload) ? payload : [payload!]).map(stamp);
        rowsOf(table).push(...inserted);
        return wantRows ? finish(inserted) : { data: null, error: null };
      }

      if (op === "upsert") {
        const items = Array.isArray(payload) ? payload : [payload!];
        const touched: Row[] = [];
        for (const item of items) {
          const existing = upsertKeys.length
            ? rowsOf(table).find((r) => upsertKeys.every((k) => r[k] === item[k]))
            : undefined;
          if (existing) {
            if (!ignoreDuplicates) Object.assign(existing, item);
            touched.push(existing);
          } else {
            const created = stamp(item);
            rowsOf(table).push(created);
            touched.push(created);
          }
        }
        return wantRows ? finish(touched) : { data: null, error: null };
      }

      if (op === "update") {
        const hit = matching();
        for (const r of hit) Object.assign(r, payload);
        return wantRows ? finish(hit) : { data: null, error: null };
      }

      // delete
      const doomed = new Set(matching());
      tables[table] = rowsOf(table).filter((r) => !doomed.has(r));
      return { data: null, error: null };
    };

    const builder: any = {
      select: () => {
        wantRows = true;
        return builder;
      },
      insert: (row: Row | Row[]) => {
        op = "insert";
        payload = row;
        wantRows = false;
        return builder;
      },
      upsert: (row: Row | Row[], opts: { onConflict?: string; ignoreDuplicates?: boolean } = {}) => {
        op = "upsert";
        payload = row;
        upsertKeys = opts.onConflict ? opts.onConflict.split(",").map((k) => k.trim()) : [];
        ignoreDuplicates = opts.ignoreDuplicates === true;
        wantRows = false;
        return builder;
      },
      update: (patch: Row) => {
        op = "update";
        payload = patch;
        wantRows = false;
        return builder;
      },
      delete: () => {
        op = "delete";
        return builder;
      },
      eq: (col: string, val: unknown) => {
        filters.push((r) => r[col] === val);
        return builder;
      },
      is: (col: string, val: unknown) => {
        filters.push((r) => (val === null ? r[col] == null : r[col] === val));
        return builder;
      },
      in: (col: string, vals: unknown[]) => {
        filters.push((r) => vals.includes(r[col]));
        return builder;
      },
      order: (col: string, o: { ascending?: boolean } = {}) => {
        order = { col, asc: o.ascending !== false };
        return builder;
      },
      limit: (n: number) => {
        limitN = n;
        return builder;
      },
      maybeSingle: () => {
        single = "maybe";
        return Promise.resolve(run());
      },
      single: () => {
        single = "one";
        return Promise.resolve(run());
      },
      then: (resolve: (v: any) => unknown, reject?: (e: unknown) => unknown) => Promise.resolve(run()).then(resolve, reject),
    };
    return builder;
  };

  const functions = {
    invoke: async (name: string, args: { body: any }) => {
      invocations.push({ name, body: args?.body });
      if (!options.invoke) return { data: null, error: { message: `no stub for ${name}` } };
      return options.invoke(name, args);
    },
  };

  const db = { from, functions } as unknown as Db;
  return { db, tables, invocations };
}

export const USER = "00000000-0000-4000-8000-0000000000aa";
export const OTHER_USER = "00000000-0000-4000-8000-0000000000bb";
