"""apps/sheet-v3.png: the sheet for app icons v3 (issue #533). One row per app: the icon at 256, 64 and 32 px, then the app-tile
mock (icon, Name bold, tagline in a quieter colour, at most 2 lines, Space Grotesk). Bottom row: all five side by side at 32 px, like a shelf.
Reads the specs (`icon_version: 3`: title, caption, number) and the icon PNGs beside them.

Usage, from docs/assets/infographics/:  python3 apps/make_sheet_v3.py        (render the icons first: python3 kit/render.py apps/*.card.yaml)
        python3 apps/make_sheet_v3.py --silhouettes out.png      the 32 px black-silhouette test, one per app
"""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
from kit import skins, spec as specmod  # noqa: E402

FONTS = skins.FONTS
PAL = skins.get("v4").palette
PAD, GAP, ROW_GAP = 56, 56, 40
BIG, MID, SMALL = 256, 64, 32
TEXT, ICON_TILE = 26, 160                 # Name and tagline share the size TEXT
LABEL_W, HEAD = 200, 44
TEXT_W = 440                              # room for the tagline: at most 2 lines (checked)
TILE_W = 24 + ICON_TILE + 24 + TEXT_W + 24
TILE_BG = (26, 32, 46)


def rounded(im, radius):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius=radius, fill=255)
    out = im.convert("RGBA"); out.putalpha(m)
    return out


def icon(png, px):
    return rounded(Image.open(png).convert("RGB").resize((px, px), Image.LANCZOS), round(px * 0.22))


def wrap(d, s, font, maxw):
    lines, cur = [], ""
    for w in s.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    lines += [cur] if cur else []
    if len(lines) == 2:                                  # balance two lines: no lonely last word
        words = s.split()
        best = min(range(1, len(words)), key=lambda k: max(d.textlength(" ".join(words[:k]), font=font), d.textlength(" ".join(words[k:]), font=font)))
        lines = [" ".join(words[:best]), " ".join(words[best:])]
    return lines


def specs():
    """The v3 specs in number order."""
    found = [specmod.load(p) for p in glob.glob(os.path.join(HERE, "*.card.yaml"))]
    return sorted((s for s in found if s.get("icon_version") == 3), key=lambda s: s.number)


def main(out=os.path.join(HERE, "sheet-v3.png")):
    rows = specs()
    bold = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-700.ttf"), TEXT)
    reg = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-400.ttf"), TEXT)
    label = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-700.ttf"), 34)
    small = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-400.ttf"), 20)
    group_w = BIG + 24 + MID + 24 + SMALL
    row_h = BIG + 40
    shelf_h = 150
    W = PAD * 2 + LABEL_W + group_w + TILE_W + GAP * 2
    H = PAD * 2 + HEAD + len(rows) * (row_h + ROW_GAP) + shelf_h
    sheet = Image.new("RGB", (W, H), PAL["BG_TOP"])
    d = ImageDraw.Draw(sheet)
    d.rounded_rectangle([PAD // 2, PAD // 2, W - PAD // 2, H - PAD // 2], radius=36, fill=PAL["BG_BOT"])
    xi = PAD + LABEL_W
    xt = xi + group_w + GAP
    d.text((xi, PAD), "256 · 64 · 32 px", font=small, fill=PAL["QUIET"])
    d.text((xt, PAD), "as an app tile", font=small, fill=PAL["QUIET"])
    for i, s in enumerate(rows):
        y = PAD + HEAD + i * (row_h + ROW_GAP)
        d.text((PAD, y + 40 + BIG // 2 - 20), s["title"], font=label, fill=PAL["INK"])      # the app name
        for px, (ix, iy) in ((BIG, (xi, y + 40)), (MID, (xi + BIG + 24, y + 40 + BIG - MID))):
            d.rounded_rectangle([ix - 1, iy - 1, ix + px, iy + px], radius=round(px * 0.22) + 1, outline=(52, 62, 82), width=2)  # tile edge
            sheet.paste(icon(s.png, px), (ix, iy), icon(s.png, px))
        sheet.paste(icon(s.png, SMALL), (xi + BIG + 24 + MID + 24, y + 40 + BIG - SMALL), icon(s.png, SMALL))
        # the app tile mock: icon, Name bold, tagline regular in a quieter colour
        ty = y + 40 + (BIG - (ICON_TILE + 48)) // 2
        d.rounded_rectangle([xt, ty, xt + TILE_W, ty + ICON_TILE + 48], radius=28, fill=TILE_BG)
        sheet.paste(icon(s.png, ICON_TILE), (xt + 24, ty + 24), icon(s.png, ICON_TILE))
        tx = xt + 24 + ICON_TILE + 24
        lines = wrap(d, s["caption"], reg, TEXT_W)
        if len(lines) > 2:
            raise SystemExit(f"{s['id']}: tagline wraps to {len(lines)} lines, the tile allows 2")
        cy = ty + (ICON_TILE + 48 - TEXT * 1.3 * (1 + len(lines))) / 2
        d.text((tx, cy), s["title"], font=bold, fill=PAL["INK"])
        cy += TEXT * 1.3
        for ln in lines:
            d.text((tx, cy), ln, font=reg, fill=PAL["QUIET"])
            cy += TEXT * 1.3
    # the shelf: all five at 32 px, side by side
    sy = PAD + HEAD + len(rows) * (row_h + ROW_GAP)
    d.text((PAD, sy + 24), "all five at 32 px", font=small, fill=PAL["QUIET"])
    gap = 28
    total = len(rows) * SMALL + (len(rows) - 1) * gap
    x0 = xi
    for k, s in enumerate(rows):
        sheet.paste(icon(s.png, SMALL), (x0 + k * (SMALL + gap), sy + 16), icon(s.png, SMALL))
    d.rounded_rectangle([x0 - 16, sy + 16 + SMALL + 4, x0 + total + 16, sy + 16 + SMALL + 10], radius=3, fill=(52, 62, 82))   # the ledge
    sheet.save(out, optimize=True)
    return out


def silhouettes(out):
    """The 32 px test: each sign as a filled black shape on white, redrawn from the render log (kit/icon.py `silhouette`)."""
    from kit import render
    rows = specs()
    K = 6                                                    # shown at 6x, nearest neighbour, so the pixels stay honest
    cell = SMALL * K
    sheet = Image.new("RGB", (len(rows) * (cell + 12) + 12, cell + 24), (230, 40, 40))
    for i, s in enumerate(rows):
        sheet.paste(render.build(s).silhouette(SMALL).convert("RGB").resize((cell, cell), Image.NEAREST), (12 + i * (cell + 12), 12))
    sheet.save(out)
    return out


if __name__ == "__main__":
    print(silhouettes(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[1] == "--silhouettes" else main())
