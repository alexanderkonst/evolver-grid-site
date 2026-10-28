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

## Moon world (public)

Public infographics and the small brand mark live in the moon world of The Game of Being You (Sasha, 2026-10-27). Taken from the live game's Lunar skin (`src/styles/theme-tokens.css`, `[data-skin="lunar"]` in `src/index.css`, `src/lib/gameFonts.ts`). The grayscale house style above stays for internal cards until Sasha says otherwise.

**Palette** (6, no others)

| Role | Hex |
|---|---|
| night sky, top → bottom | `#090d13` → `#0e141c` → `#121b26` (scene bg `#0a0e14`) |
| moonlit ink (titles, main words) | `#e6ebf2` |
| silver (line work, secondary words) | `#c8d2de` |
| quiet labels | `#8d9bab` |
| moon disc | `#eeeae2` |
| the one accent: a light | `#5ec8bd` (core `#8fe3d9`) |

**Type** (the game's pair)
- Cormorant Garamond Light: titles and key words; Light Italic for the one-line meaning under a word.
- IBM Plex Mono Light: small labels (be / do), curved path labels, footer.
- All lowercase, English. No tracked caps, no eyebrows.

**Line**: one weight, 2 px at 1080, silver at ~65% opacity. Round, open arcs; gaps where a line meets a node.

**Motifs**
- The moon = seeing / BE. One moon per slide, pale disc with a soft halo.
- A small teal light = a person, a path, DO. Other players appear as nameless lights: lights carry no names or faces.
- Night sky: a few faint stars at the edges, never behind words.
- Crystal solids (octahedron) may appear as thin silver outlines; no gold, no 3D.
- Teal is spent in one place per slide.

**Layout (1080×1080)**
- Margins 64 px; title top-centered, one line (serif 44).
- One idea per slide, one figure in the middle, little text (aim ≤ 25 words besides the footer).
- Footer centered at the bottom: moon-world mark (44 px) + `findyourtoptalent.com` in mono 20.
- Drawn in code (PIL/SVG), never by an image model, so text stays crisp.

**Mark**: drawn by brief, not by a designer. Must read at 32 px: one moon, one octahedron outline, at most one teal light, night ground. Candidates are reviewed by Sasha before any swap (follow the Logo Change SOP in `docs/05-reference/brandbook.md`).
