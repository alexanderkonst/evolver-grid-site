# Bug brief — Commercial OS renders a stale config forever

**Status:** FIXED (Option B), 2026-09-02. Verified locally — all suites pass (`node app.test.mjs` 16/16, `node deployment.test.mjs` 2/2) plus a real-browser repro: seeding the poisoned five-ICP snapshot then reloading shows the three v4.0 streams, drops the `config` key from storage, and preserves people/settings/crawl. Acceptance #5 (Safari + Chrome on the *live* site) pending production deploy.
**Severity:** blocking. The tool cannot receive any config change, so every brief, lexicon, stream and archetype update is invisible in the browser.
**Repo:** `evolver-grid-site` · **Files:** `commercial-tools/app/src/store.js`, `commercial-tools/app/src/app.js`

---

## Symptom

The deployed tool shows old configuration that no amount of deploying, publishing, hard-refreshing or switching browsers clears. Different browsers show *different* old versions.

- **Safari:** three streams (`client_founder_in_transition`, `practitioner_partners`, `operators_at_altitude`), Settings shows `briefVersion: ai_matchmaker_brief.md v3.0 (Day 168, 2026-08-27)`.
- **Chrome:** the pre-v3.0 five ICPs (`post_exit_founders`, `fractional_executives`, `coaches_solopreneurs`, `consultants_transition`, `community_holders`), same stale `briefVersion`.
- Person counts also differ per browser (70 vs 0).

## What is NOT wrong

The server is correct. Verified live:

```
GET https://findyourtoptalent.com/commercial-os/config.json
briefVersion : matchmaker_brief_v4.0.md
brief.version: v4.0
icps         : client_founder_in_transition, practitioner_partners, operators_at_altitude
archetypes   : 5
mfLexicon    : present
```

**Two different browsers showing two different stale versions of the same URL rules out CDN, edge and HTTP caching** — a shared cache would serve both the same thing. The staleness is per-browser, therefore client-side persistence.

## Root cause

`commercial-tools/app/src/store.js`, `load()`, line 20:

```js
state = { ...initialState(config), ...(saved || {}),
          config: { ...config, ...(saved?.config || {}) },   // <-- saved wins
          settings: {...}, crawl: {...}, ui: {...} };
```

The **saved** config from `localStorage` is spread *after* the freshly fetched `config.json`, so every key present in the saved copy overrides the deployed file. `localStorage` holds a complete deep snapshot of whatever config existed when that browser first ran the tool, including the whole `icps` array, so the arrays are replaced wholesale rather than merged.

Consequence: **once a browser has run the tool even once, it is permanently pinned to that day's config.** Hard refresh clears the HTTP cache, not `localStorage`, which is why nothing the user tried had any effect, and why each browser is frozen at a different date.

Two aggravating paths write config into that snapshot:

1. `app.js` → `#save-settings` handler does `s.config = config` from the Settings JSON editor, so opening Settings and saving once pins that config permanently.
2. `store.restore()` does `{ ...initialState(parsed.state.config), ...parsed.state }`, so restoring an old backup re-pins an old config.

There is no version stamp on the persisted config and nothing invalidates it.

## The distinction the fix must encode

`config.json` is **server-owned**. `people`, `actions`, `settings`, `crawl`, `ui` are **user-owned**. The current merge treats all of them as user-owned. Only the config half is wrong; do not change the merge for the genuinely user-owned keys.

## Fix options

| | Approach | Trade-off |
|---|---|---|
| **A** | Invert the merge: `config: { ...(saved?.config \|\| {}), ...config }` | One-line, fetched always wins. But Settings edits are then silently discarded on reload, which changes existing behaviour without telling the user. |
| **B** *(recommended)* | Stop persisting `config` at all. Strip it before `save()`. Keep deliberate user edits in a separate small `configOverrides` object, applied *under* the fetched config and shown as such in Settings. | Preserves the Settings feature with honest precedence. Slightly more work. |
| **C** | Version-stamp: persist `configVersion` and drop the saved config whenever the fetched version differs. | Smallest safe change, but leaves the same trap for any two deploys sharing a version string. |

## Migration is mandatory, and the fix fails without it

The user's browsers already hold poisoned snapshots. **Whatever option ships must actively neutralise the existing saved config**, not merely change precedence for future loads:

- Option A does this implicitly (fetched wins from the next load).
- Options B and C must **delete the `config` key from the persisted state on first load after the fix**.

Verify against a `localStorage` entry that actually contains the old five-ICP config, not a clean profile. Reproduce it by seeding `evolver_commercial_app_v1` with an old config before testing.

## Acceptance

1. With a stale `config` in `localStorage` under key `evolver_commercial_app_v1`, loading the tool shows `brief.version: v4.0`, three streams, and five archetypes.
2. `people`, `actions`, `settings.accountId`, `crawl` and `ui` all survive the fix. **No user data may be lost** — this is a ledger.
3. A regression test in `commercial-tools/app/app.test.mjs` seeds a stale saved config, calls `load()` with a fresh one, and asserts the fresh values win while user data persists.
4. `node app.test.mjs` and `node deployment.test.mjs` pass.
5. Confirm in both Safari and Chrome on the live site.

## Out of scope

Do not change the search logic, scoring, lexicon, archetypes or brief. Do not touch `scripts/sync-brief-to-tool.mjs`. This is a persistence bug only.
