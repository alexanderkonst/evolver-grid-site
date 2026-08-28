# Commercial OS

Portable, LinkedIn-first commercial ledger merging the three reference artifacts.

## Run

Serve this directory over HTTP (ES modules and `config.json` cannot load from `file://`):

```sh
python3 -m http.server 4173 --directory commercial-tools/app
```

Open `http://localhost:4173`, then use **Settings** to select ConnectSafely REST and enter:

- API/proxy base URL (persisted locally)
- personal API key (held in `sessionStorage` only; never included in backups)

If ConnectSafely blocks browser CORS, deploy the Worker in `proxy/cloudflare-worker.js`, set its `CONNECTSAFELY_ORIGIN`, and use the Worker URL as the base URL.

Gmail is deliberately disabled in v1. The connector interface contains a disabled placeholder; no Google OAuth is required.

## Verify

```sh
node --test commercial-tools/app/app.test.mjs
node --test commercial-tools/*/*.test.mjs
```
