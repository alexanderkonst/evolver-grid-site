# Infographic kit v1

Drawing vocabulary + skins + card spec + lint + contact sheet, harvested from [engine-v4](../engine-v4/README.md). No new renderer, no layout templates. Hark writes a spec and reads lint output; Sasha looks at one contact sheet per batch.

Needs `pip install pillow numpy pyyaml` (matplotlib + scipy only for the old `fyt_style.py` scripts). Run commands from `docs/assets/infographics/`.

| File | What |
|---|---|
| `vocab.py` | the vocabulary: engine-v4's `V4` card, re-exported and instrumented (see its docstring for the call list). Every call is recorded in `card.log`. Pixel output is identical to engine-v4 |
| `skins.py` | skins as token sets: `v4` (default), `grayscale`, `moonworld` |
| `spec.py`, `render.py` | load `<card>.card.yaml`; import `<card>.py`, call `build(spec)`, save `<card>.png` |
| `lint.py` | 8 rules on a rendered card, read from `card.log` (not image recognition) |
| `book_sync.py` | `--check`: spec title/caption equal `BOOK.md` and `src/data/infographicBook.ts` |
| `sheet.py` | one contact sheet PNG per batch: grid, each card with id + title |
| `compare.py` | mean abs pixel diff of a ported card against the engine-v4 render it came from |
| `ci.py`, `infographics.workflow.yml` | what the PR workflow runs (see CI below) |
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
| `caption` | yes | the one line under the title; equals the Book caption (`""` only if the Book has none) |
| `skin` | yes | `v4` \| `grayscale` \| `moonworld` |
| `text` | yes | every other on-card string, any shape your script wants. `eyebrow` is read by `vocab.card()` |
| `sources` | yes | list of where it came from: files, calls, sessions |
| `number`, `of` | no | footer `NN / TT` (default 1 / 1) |
| `max_words` | no | waiver above the skin's 25. Only for ported legacy cards; shows up in the lint line |
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
| `words` | more than 25 on-card words (title, caption, eyebrow without its number, body; footer excluded), unless the spec waives |
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

## Old scripts

`fyt_style.py` stays at its path and API (`import fyt_style`, `fyt_style.footer(a)`); it forwards to `kit/mpl.py`. `speedrun-matching/make.py` renders byte-identical PNGs.

## CI

`infographics.workflow.yml` runs on PRs touching `docs/assets/infographics/**`: kit self-test (`python3 -m unittest discover -s docs/assets/infographics/kit -p "test_*.py"`), then `kit/ci.py` (render the touched cards, lint, `book_sync --check`, contact sheet), then uploads `kit/out/contact-sheet.png`. It must be moved to `.github/workflows/infographics.yml` (the Claude GitHub App cannot write there).

## Migrating a card

Only when it is edited. Copy the engine-v4 function into `<card>.py`, swap `V4(...)` for `K.card(spec)`, move every string into the spec, add `parity`, run `compare.py` (expect 0.0000), then lint. Legacy cards will need `max_words`.
