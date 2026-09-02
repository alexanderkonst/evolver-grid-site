import { mergeLedgerRecords, normalizeRecord } from './ported-core.js';

export const STORE_KEY = 'evolver_commercial_app_v1';
export const STORE_SCHEMA = 'evolver-commercial-app';

export function initialState(config = {}) {
  return { schema: STORE_SCHEMA, version: 1, people: [], actions: [], settings: { connectorMode: 'adapter', apiBaseUrl: '', adapterUrl: '', anonKey: '', accountId: '', ownerId: '', ownerName: '', region: 'Global' }, config, configOverrides: {}, crawl: { offset: 0, done: false }, ui: { tab: 'find' } };
}

// config.json is server-owned. Only the top-level keys a user deliberately edits in
// Settings are user-owned. Return just those deviations, so the fetched config keeps
// flowing for everything the user did not touch (rather than pinning the whole config).
export function configDiff(edited, base) {
  const out = {};
  for (const k of Object.keys(edited || {})) {
    if (JSON.stringify(edited[k]) !== JSON.stringify(base?.[k])) out[k] = edited[k];
  }
  return out;
}

export function createStore(storage = globalThis.localStorage, onError = () => {}) {
  let state = initialState();
  const notify = new Set();
  // The effective `config` and the raw `serverConfig` both belong to config.json and are
  // NEVER persisted. Persisting them is exactly the stale-config bug. Everything genuinely
  // user-owned — people, actions, settings, configOverrides, crawl, ui — is persisted.
  function persist() { const { config, serverConfig, ...rest } = state; return rest; }
  function save() {
    try { storage?.setItem(STORE_KEY, JSON.stringify(persist())); return true; }
    catch (error) { onError(new Error(`Storage is full or unavailable. Export a backup now. ${error.message}`)); return false; }
  }
  function load(config) {
    let saved = null;
    try { saved = JSON.parse(storage?.getItem(STORE_KEY) || 'null'); } catch (error) { onError(new Error(`Saved data could not be read: ${error.message}`)); }
    const overrides = (saved && typeof saved.configOverrides === 'object' && saved.configOverrides) ? saved.configOverrides : {};
    // Server config is the base and wins; only deliberate overrides sit on top. Any legacy
    // `saved.config` (a full stale snapshot from before this fix) is ignored here...
    state = { ...initialState(config), ...(saved || {}), serverConfig: config, config: { ...config, ...overrides }, configOverrides: overrides, settings: { ...initialState().settings, ...(saved?.settings || {}) }, crawl: { ...initialState().crawl, ...(saved?.crawl || {}) }, ui: { ...initialState().ui, ...(saved?.ui || {}) } };
    save(); // ...and actively neutralised here: persist() drops `config`, so storage is rewritten clean.
    return state;
  }
  function commit(mutator) { mutator(state); save(); notify.forEach(fn => fn(state)); return state; }
  function mergePeople(rows) { return commit(s => { s.people = mergeLedgerRecords(s.people, rows); }); }
  function replace(next) { state = next; save(); notify.forEach(fn => fn(state)); }
  // A deliberate Settings edit: keep only what differs from the fetched config, then recompute
  // the effective config. New deploys still flow through for every key the user did not change.
  function applyConfigEdit(edited) { return commit(s => { s.configOverrides = configDiff(edited, s.serverConfig || {}); s.config = { ...(s.serverConfig || {}), ...s.configOverrides }; }); }
  function backup() { return JSON.stringify({ schema: STORE_SCHEMA, version: 1, exportedAt: new Date().toISOString(), state: persist() }, null, 2); }
  function restore(payload) {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (parsed.schema !== STORE_SCHEMA || parsed.version > 1 || !parsed.state) throw new Error('Unsupported backup file');
    parsed.state.people = (parsed.state.people || []).map(normalizeRecord);
    // Keep the live server config; take only user-owned data (including configOverrides) from
    // the backup, so an old backup cannot re-pin a stale config.
    const serverConfig = state.serverConfig || state.config || {};
    const overrides = (parsed.state.configOverrides && typeof parsed.state.configOverrides === 'object') ? parsed.state.configOverrides : {};
    replace({ ...initialState(serverConfig), ...parsed.state, serverConfig, config: { ...serverConfig, ...overrides }, configOverrides: overrides });
  }
  return { load, save, commit, mergePeople, replace, applyConfigEdit, backup, restore, get state() { return state; }, subscribe(fn) { notify.add(fn); return () => notify.delete(fn); } };
}
