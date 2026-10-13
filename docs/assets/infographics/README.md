# Infographics

Square (1080×1080) grayscale cards for Find Your Top Talent, all drawn in code so any font drops in.

**House style:** grayscale, pure white, as simple as possible. Space Grotesk, all lowercase (until Sasha's handwriting font replaces it). Footer on every card: grayscale octahedron mark + findyourtoptalent.com.

| Folder | What |
|---|---|
| `fyt_style.py` | font registration, auto-lowercase, `footer(a)` helper. Every script does `import fyt_style`. |
| `fonts/` | Space Grotesk 400/500/700 (house font) + trial fonts and specimen |
| `assets/` | FYT octahedron mark, gold original and grayscale |
| `speedrun-matching/` | 1 same direction, opposite gifts (collaborators) · 2 who complements you · 3 professional matchmaking tools. `python make.py` from inside the folder |
| `solids/` | cover: Sasha's handmade platonic solids. `cutout.py` → `still.py` (solids-handmade.png); `turn.py` (solids-turning.mp4/.gif, 8 s seamless loop) |
| `carousel/` | LinkedIn carousel v1 (cover + cards 1–3) and caption draft |

Requires: `pip install matplotlib pillow numpy scipy` (+ `rembg[cpu] onnxruntime` for cutout.py; ffmpeg for turn.py).

The cash-flow card is kept out of this public repo for now; it lives in evolver-private-ledger/infographics/.
