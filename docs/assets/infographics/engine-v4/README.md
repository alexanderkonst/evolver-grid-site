# engine-v4 · the latest house style, as code (reference)

The v4 "lunar" engine that drew the newest Book cards (Business from First Principles v4, laws v4, Find Your Ideal Client 01–09). Copied here as-is from Hark's workspace on 2026-11-25 so the style lives in the repo, not in pictures.

- `moon.py`: canvas (1080×1080, 2× supersampling), palette, fonts, background, mark.
- `v4lib.py` / `primitives2.py` / `primitives_v4.py` / `cards2.py`: card base class (`V4`) and drawing primitives (iridescent lines, orbs, stars, prisms, rings, waves, text helpers).
- `ideal_client.py`, `laws_v4.py`: two full card sets as worked examples.
- `fonts/`: Cormorant Garamond (titles), Space Grotesk (labels). `fyt-mark-gold.png`: footer mark.

Run: `pip install pillow numpy && python3 ideal_client.py` → `out-v4/ideal-client/ic-01..09.png` (out-v4 is not committed).

This is the source the spec-driven renderer (`docs/assets/infographics/render/`) extracts its tokens and layouts from. Don't add new cards here; new cards are specs.
