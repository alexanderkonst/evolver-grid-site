import { mergeLedgerRecords, normalizeRecord } from './ported-core.js';

export const STORE_KEY = 'evolver_commercial_app_v1';
export const STORE_SCHEMA = 'evolver-commercial-app';

export function initialState(config = {}) {
  return { schema: STORE_SCHEMA, version: 1, people: [], actions: [], settings: { connectorMode: 'rest', apiBaseUrl: '', accountId: '', ownerId: '', ownerName: '', region: 'Global' }, config, crawl: { offset: 0, done: false }, ui: { tab: 'find' } };
}

export function createStore(storage = globalThis.localStorage, onError = () => {}) {
  let state = initialState();
  const notify = new Set();
  function save() {
    try { storage?.setItem(STORE_KEY, JSON.stringify(state)); return true; }
    catch (error) { onError(new Error(`Storage is full or unavailable. Export a backup now. ${error.message}`)); return false; }
  }
  function load(config) {
    let saved = null;
    try { saved = JSON.parse(storage?.getItem(STORE_KEY) || 'null'); } catch (error) { onError(new Error(`Saved data could not be read: ${error.message}`)); }
    state = { ...initialState(config), ...(saved || {}), config: { ...config, ...(saved?.config || {}) }, settings: { ...initialState().settings, ...(saved?.settings || {}) }, crawl: { ...initialState().crawl, ...(saved?.crawl || {}) }, ui: { ...initialState().ui, ...(saved?.ui || {}) } };
    return state;
  }
  function commit(mutator) { mutator(state); save(); notify.forEach(fn => fn(state)); return state; }
  function mergePeople(rows) { return commit(s => { s.people = mergeLedgerRecords(s.people, rows); }); }
  function replace(next) { state = next; save(); notify.forEach(fn => fn(state)); }
  function backup() { return JSON.stringify({ schema: STORE_SCHEMA, version: 1, exportedAt: new Date().toISOString(), state }, null, 2); }
  function restore(payload) {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (parsed.schema !== STORE_SCHEMA || parsed.version > 1 || !parsed.state) throw new Error('Unsupported backup file');
    parsed.state.people = (parsed.state.people || []).map(normalizeRecord);
    replace({ ...initialState(parsed.state.config), ...parsed.state });
  }
  return { load, save, commit, mergePeople, replace, backup, restore, get state() { return state; }, subscribe(fn) { notify.add(fn); return () => notify.delete(fn); } };
}
