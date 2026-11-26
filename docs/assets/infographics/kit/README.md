# Infographic kit v1

Drawing vocabulary + skins + card spec + lint + contact sheet, harvested from [engine-v4](../engine-v4/README.md). No new renderer, no layout templates. Hark writes a spec and reads lint output; Sasha looks at one contact sheet per batch.

Needs `pip install pillow numpy pyyaml` (matplotlib + scipy only for the old `fyt_style.py` scripts). Run commands from `docs/assets/infographics/`.

| File | What |
|---|---|
| `vocab.py` | the vocabulary: engine-v4's `V4` card, re-exported and instrumented (see its docstring for the call list). Every call is recorded in `card.log`. Pixel output is identical to engine-v4 |
| `skins.py` | skins as token sets: `v4` (default), `grayscale`, `moonworld` |
| `spec.py`, `render.py` | load `<card>.card.yaml`; import `<card>.py`, call `build(spec)`, save `<card>.png` |
| `lint.py` | 8 rules on a rendered card, read from `card.log` (not image recognition) |
| `book_build.py` | the Book from one manifest: `book/book.yaml` → render, lint, PNGs, reader data, BOOK.md blocks, `book/sheet.png`; `--check` for CI (see Book below) |
| `book_sync.py` | `--check`: spec title/caption equal `BOOK.md` and `src/data/infographicBook.ts` |
| `sheet.py` | one contact sheet PNG per batch: grid, each card with id + title |
| `compare.py` | mean abs pixel diff of a ported card against the engine-v4 render it came from |
| `ci.py`, `infographics.workflow.yml` | what the PR workflow runs (see CI below) |
| `icon.py` | the app-icon canvas (1024×1024, before / after, no text, no footer) on the same V4 primitives; see App icons below |
| `mpl.py` | matplotlib side of the `grayscale` skin; `../fyt_style.py` is a shim onto it |
| `proof/`, `fixtures/` | two ported cards + contact sheet; a deliberately broken card lint must FAIL |

## Skins

Tokens only; the PIL vocabulary (`vocab.py`) draws `v4`. `grayscale` is consumed by the matplotlib shim. `moonworld` has no renderer in v1: its tokens drive lint, and `KitCard` raises `SkinHasNoRenderer` for it.

| | `v4` (default) | `grayscale` | `moonworld` |
|---|---|---|---|
| source | engine-v4 `moon.py`, `v4lib.py`, `primitives2.py` (imported, not retyped) | `fyt_style.py`, `speedrun-matching/make.py` | README "Moon world" table |
| canvas, margin | 1080×1350, 80 | 1080×1080, 64 (borrowed) | 1080×1080, 64 |
| palette | INK SILVER QUIET LAV AQUA BLUSH CHAMP PEARL · MOON BRIGHT DEEP GLOW · BG_TOP BG_BOT · DARK (text on a light orb) | white + four grays | night sky ×3, ink, silver, quiet, moon |
| single accent | NEON (title; NEON_HI/LO count as the same) | none | teal `#5ec8bd` (+ core `#8fe3d9`) |
| type | Cormorant Garamond + Space Grotesk | Space Grotesk, lowercase | Cormorant Garamond Light + IBM Plex Mono Light |
| min font, max words | 16 px, 25 | 16 px, 25 | 16 px, 25 |

## Card spec

One file per card, beside its script and PNG: `<card>.card.yaml`, `<card>.py`, `<card>.png`. The spec is the single source of the card's text: the script reads `spec.text`, never literals.

| Field | Required | |
|---|---|---|
| `id` | yes | Book id: `ideal-client-02`, `primitives-07`, `III.01` |
| `chapter` | yes | Book chapter number as a string, `"3.2"` |
| `title` | yes | the neon title on the card; equals the Book title |
| `caption` | yes | the one line under the title; equals the Book caption (`""` only if the Book has none, then the script draws its own line from `text`) |
| `skin` | yes | `v4` \| `grayscale` \| `moonworld` |
| `text` | yes | every other on-card string, any shape your script wants. `eyebrow` is read by `vocab.card()` |
| `sources` | yes | list of where it came from: files, calls, sessions |
| `number`, `of` | no | footer `NN / TT` (default 1 / 1) |
| `caption_size` | no | px size of the line under the title (default: the engine's 26). ADP cards use 30, the body size of the ideal-client cards |
| `max_words` | no | waiver above the skin's 25. Only for ported legacy cards; shows up in the lint line |
| `waive` | no | `{rule: reason}`: a rule a ported legacy card fails by its original layout (`fit`, `margins`, `min-font`, ...). The lint line says `WAIVED (reason)` and keeps the detail. Never for `spec-fields` |
| `parity` | no | `{module, fn, index}`: the engine-v4 call `compare.py` diffs against |

Full example, `proof/ideal-client-02.card.yaml`:

```yaml
id: ideal-client-02
chapter: "3.2"
number: 2
of: 9
title: Similar, and Different
caption: Two corners make them like you. One corner makes them want to buy.
skin: v4
max_words: 35
parity: {module: ideal_client, fn: k2, index: 2}
text:
  eyebrow: "Ideal client · The triangle"
  nodes:
    top:   {title: Identity,  sub: similar}
    right: {title: Myth,      sub: similar}
    left:  {title: Threshold, sub: the difference}
  quote: "The difference: they stand where you once stood."
sources:
  - docs/assets/infographics/engine-v4/ideal_client.py (k2)
  - docs/assets/infographics/BOOK.md (Find Your Ideal Client, card 02)
```

and its script `proof/ideal-client-02.py`:

```python
from kit import vocab as K

def build(spec):
    t = spec.text
    c = K.card(spec)                       # canvas, background, eyebrow, neon title, caption
    cx, cy = 540, c.body_top + 300
    top, right, left = c.tri_split(cx, cy, 210)
    c.orb(top[0], top[1], 22, glow=40); c.orb(right[0], right[1], 22, glow=40); c.iri_disc(left[0], left[1], 26, 190)
    n = t["nodes"]
    K.tag(c, cx, top[1] - 88, n["top"]["title"], n["top"]["sub"], align="center", maxw=300)
    ...
    c.quote(80, cy + 300, 920, t["quote"], 30)
    return c                               # the footer is drawn on save()
```

Make a card: write the two files, then `python3 kit/render.py <card>.card.yaml` and `python3 kit/lint.py <card>.card.yaml`.

## Lint

`python3 kit/lint.py <card>.card.yaml ...`: one line per rule per card, `PASS|FAIL  <id>  <rule>  <detail>`, exit 1 on any FAIL. Failing lines name the offending text or element.

| Rule | Fails when |
|---|---|
| `fit` | a text line is wider than its `maxw` (measured with the real font), or text leaves the box it sits in |
| `words` | more than 25 on-card prose words (title, caption, eyebrow without its number, body; footer excluded), unless the spec waives. Figure labels drawn with `K.name` / `K.note` (logged `part="label"`) do not count toward the 25; instead each label may have at most 3 words (`label_words` in the skin) |
| `palette` | a colour outside the skin palette |
| `accent` | the skin accent (v4: NEON) used by more than one element. The neon title already is one |
| `margins` | a non-footer element outside the skin margin (±2 px) |
| `min-font` | text under 16 px at 1080 wide |
| `footer` | no star mark or no `findyourtoptalent.com` |
| `spec-fields` | a required spec field missing or empty, or an unknown skin |

What lint sees: everything drawn through the vocabulary (`card.log`). Raw `c.d.*` / `c.gd.*` PIL calls inside a card script are invisible to it; use the vocabulary.

## Book sync

`python3 kit/book_sync.py --check [specs]` (no args: all specs). For a spec whose `id` is a Book id, `title` and `caption` must match `BOOK.md` and `src/data/infographicBook.ts` exactly. A spec whose id is not in the Book is `SKIP`ped. Change the spec first, then BOOK.md and the .ts in the same PR.

## Contact sheet

`python3 kit/sheet.py kit/proof` writes `kit/proof/contact-sheet.png` (3 columns, id + title under each card). `--render` draws the cards first, `--out` and `--cols` as named.

## Book

`book/book.yaml` is the single source for the Book: chapters → sections → cards, in reading order. Each card entry is `{id, spec, status}`; title and caption come from the card's spec, never from the manifest. Status: `draft | approved | to-make` plus an optional version (`draft v4`). A chapter with `status: to-make` is a placeholder row ("coming" in the reader). Run from `docs/assets/infographics/`:

| Command | |
|---|---|
| `python3 kit/book_build.py` | render the cards whose spec, script or renderer changed, lint them, write PNGs to `book/**` and `public/infographics/book/**`, regenerate `src/data/infographicBook.ts`, the generated blocks of `BOOK.md` (contents, card lists) and `book/sheet.png`. A card whose pixels did not change keeps its file |
| `python3 kit/book_build.py --check` | write nothing; exit 1 if anything is out of sync: stale PNG, stale public copy, hand-edited generated file, card not in the manifest, lint FAIL, spec vs BOOK.md prose. Compares fingerprints (`book/book.lock.json`), not pixels, so it is machine-independent |
| `python3 kit/book_build.py --list` | the Book in manifest order |

Generated: `infographicBook.ts`, the `<!-- book:begin … -->` blocks of `BOOK.md`, `book/sheet.png`, `book/book.lock.json`, and every PNG. Everything else in `BOOK.md` is hand-written prose.

### Recipe: reorder
1. Move the card's line (or a whole section) in `book/book.yaml`. Chapter numbers stay as written; a card moved into another section needs its spec's `chapter` changed to that number.
2. `python3 kit/book_build.py`.
3. Commit the manifest and the regenerated files. No PNG is re-rendered; the reader, `BOOK.md` and the sheet follow.

### Recipe: add a card
1. Write `book/<folder>/<id>.card.yaml` and `<id>.py` (see Card spec; `<id>` is the file name and the spec's `id`; `chapter` = the section number).
2. Add `- {id: <id>, spec: <folder>/<id>.card.yaml, status: draft}` where it belongs in `book/book.yaml`. A new `<folder>` needs a `<!-- book:begin cards-<folder> -->` / `<!-- book:end cards-<folder> -->` pair in `BOOK.md` if you want its list there.
3. `python3 kit/book_build.py`: it renders, lints, copies to `public/`, regenerates everything. Fix any lint FAIL it prints.

### Recipe: update a card
1. Edit the card's `*.card.yaml` (text, title, caption) or `*.py` (drawing).
2. `python3 kit/book_build.py`: only that card re-renders; it prints the mean pixel diff against the previous PNG. A title or caption change also moves the reader data and the `BOOK.md` list.
3. If the card is a law (`III.01` ...), also edit its hand-written `### III.01` section in `BOOK.md` (title, Subtitle); `--check` fails until they agree.

## App icons

> Current icons are v3, see "Icons v3" below. The paragraph that follows describes the v1 before → after format and its `ICON_RULES`, kept for the rules table.

Square icons for the course-apps (Potential, Crossing, Vision, Nature, Your AI) live in [`apps/`](../apps/): `<id>.card.yaml` (`kind: icon`), `<id>.py`, `<id>.png` (1024), `<id>@128.png`, plus `sheet.png` (five mock tiles, Name bold and tagline at one size, and the five icons at 64 px; `python3 apps/make_sheet.py`).

Each icon is one idea as before → after: before on the left in QUIET / silver, after on the right with the one NEON accent, a bold chevron and a dawn bloom between. No text. A script builds `K`-style: `c = icon.card(spec)`, then `with c.side("before"): ...` / `with c.side("after"): ...` using `orb`, `dot`, `ring`, `path`, `fill`, `iri_fill`, `chevron` (call list in `icon.py`). The spec's `title` is the tile's **Name**, `caption` its tagline, `text.before` / `text.after` say the idea in words.

`python3 kit/lint.py apps/<id>.card.yaml` runs the icon rules instead of the card rules:

| Rule | Fails when |
|---|---|
| `palette` | a colour outside the v4 palette |
| `accent` | NEON is used by anything other than exactly one element, or that element is not on the after side |
| `margins` | an element outside the 80 px margin of the 1024 canvas |
| `stroke` | a shape under 6 px at 128 px (48 px at 1024): a line or ring by its width, a dot or orb by its diameter, a fill by `min_dim`, its narrowest span (the script states it; lint trusts it) |
| `elements` | more than 7 elements on one side, or more than 1 between them |
| `no-text` | any text drawn |
| `spec-fields` | as for cards |

`kit/ci.py` and `book_sync` pick the icon specs up like any other (`book_sync` SKIPs them: not Book ids).

### Icons v3 (issue #533, the final icons; replaced v1 #506 and v2 #528)

One icon per app, files `apps/<id>.card.yaml`, `<id>.py`, `<id>.png` (1024), `<id>@128.png`. One simple silhouette of the result ("after" only): no arrow, no before / after, no text. A v3 spec carries `icon_version: 3` and `halo: LAV|AQUA|BLUSH|CHAMP|PEARL` (the app's own pastel). The tile is lunar ink with that pastel rising as a gradient from the bottom edge (visible at 64 px). Scripts draw everything inside `with c.side("after")`, with shapes from `apps/icon_shapes.py`.

Family rules: every line and ring is `I.WEIGHT` wide (48 px at 1024 = 6 px at 128, the lint floor, 1.5 px at 32; v2 was 64); one NEON per icon, a smaller area than the white; the iridescent sphere (`orb`, "you / the seed": Book `ideal-client-01`, `-04`, ADP `A01`, `A02`) only in Potential and Your AI; the sign's longest side ~70% of the tile; `group="name"` makes repeated identical parts (ticks) count as one shape. `ring(..., soft=alpha)` adds a glow round a line.

| App | Sign |
|---|---|
| Potential | open bud: two white petals, a neon middle petal, the sphere |
| Crossing | two overlapping circles, the lens open: left a precise line with tick marks (science), right a soft glowing line (consciousness), one neon dot at the centre of the crossing |
| Vision | an eye, a neon four-point star as the pupil |
| Nature | one continuous line: a wave curling up into a crescent, the tip lit |
| Your AI | the sphere, a thin tilted orbit (far half behind the sphere, near half in front), one neon satellite |

`icon_version: 2` and `3` share one rule set (`ICON_V2_RULES`):

| Rule | Fails when |
|---|---|
| `elements` | more than 4 shapes (same-`group` parts count once), or anything on the `before` / `mid` side |
| `fill` | the sign's longest side is outside 62-78% of the tile (~70%) |
| `weight` | a line or ring is not exactly `I.WEIGHT` wide |

The 32 px test: `card.silhouette(32)` redraws the sign as a filled black shape; `python3 apps/make_sheet_v3.py --silhouettes out.png` lays all five out. The sheet: `python3 apps/make_sheet_v3.py` writes `apps/sheet-v3.png` (per app: 256, 64, 32 px and the tile mock with the tagline in a quieter colour, at most 2 lines; a bottom shelf of all five at 32 px). Render first: `python3 kit/render.py apps/*.card.yaml`. `sheet.png` (v1) and `sheet-v2.png` stay as history.

## Old scripts

`fyt_style.py` stays at its path and API (`import fyt_style`, `fyt_style.footer(a)`); it forwards to `kit/mpl.py`. `speedrun-matching/make.py` renders byte-identical PNGs.

## CI

`infographics.workflow.yml` runs on PRs touching `docs/assets/infographics/**`: kit self-test (`python3 -m unittest discover -s docs/assets/infographics/kit -p "test_*.py"`), then `kit/ci.py` (render the touched cards, lint, `book_sync --check`, contact sheet), then uploads `kit/out/contact-sheet.png`. It must be moved to `.github/workflows/infographics.yml` (the Claude GitHub App cannot write there). The staged copy also runs `book_build.py --check` and uploads `book/sheet.png`; it triggers on `src/data/infographicBook.ts` and `public/infographics/book/**` too.

## Migrating a card

Only when it is edited. Copy the engine-v4 function into `<card>.py`, swap `V4(...)` for `K.card(spec)`, move every string into the spec, add `parity`, run `compare.py` (expect 0.0000), then lint. Legacy cards will need `max_words`.
