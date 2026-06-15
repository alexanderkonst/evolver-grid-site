# Blue Lotus · Caerulea VII

A standalone luxury landing page for Karime's high-frequency Blue Lotus tincture and the
*Initiation into the Blue Lotus Mysteries* (a one-hour recorded activation).

Built as plain static files (no build step) so it deploys anywhere and ports into
`evolver-grid-site` as a React route later with minimal effort.

## Files
- `index.html` — the page (3 acts: Threshold, Mystery, Offering)
- `confirmation.html` — post-purchase page; WhatsApp handoff + (Rite tier) the audio player + mp3 download
- `styles.css` — the full design system
- `config.js` — **the only file you edit to go live** (see below)
- `main.js` — entry ritual, scroll choreography, commerce + audio wiring
- `assets/` — drop media here

## Go-live checklist (edit `config.js`)
1. **WhatsApp** — set `whatsapp` to Karime's number, digits only (e.g. `52...`).
2. **Stripe** — create two Payment Links (555 MXN and 888 MXN). In each link's settings,
   set the post-payment redirect to:
   - 555 →  `confirmation.html?tier=vessel`
   - 888 →  `confirmation.html?tier=rite`
   Paste the two link URLs into `config.stripe`. Until set, the buttons route straight to the
   confirmation page (preview only, no payment).
3. **Audio** — drop the recording at `assets/initiation.mp3`.
4. **USD rate** — `usdRate` (display only; MXN is charged).

## Assets to drop in `assets/`
- `initiation.mp3` — the one-hour recording (Rite tier delivery)
- `ambient.mp3` — optional entry soundscape (singing bowl / drone)
- the pimped bottle image + photoreal lotus (replace the placeholder SVGs in the hero)
- `karime.jpg` — portrait for The Keeper section
- `og.jpg` — 1200x630 share card

## Run locally
`python3 -m http.server 4632` then open `http://localhost:4632`

## Deploy
Static. Drop on Vercel, Netlify, or GitHub Pages as-is.
