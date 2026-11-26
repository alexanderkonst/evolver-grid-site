"""apps/sheet-v2.png: the choice sheet for app icons v2 (issue #528). One row per app: A and B at 256, 64 and 32 px,
then the A tile mock (icon, Name bold, tagline at the same size, Space Grotesk). Rows are labelled with the app name and A / B.
Reads the specs (`icon_version: 2`: title, caption, number) and the icon PNGs beside them.

Usage, from docs/assets/infographics/:  python3 apps/make_sheet_v2.py        (render the icons first: kit/render.py apps/<id>-a.card.yaml ...)
        python3 apps/make_sheet_v2.py --silhouettes out.png      the 32 px black-silhouette test, A and B for every app
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
TEXT, ICON_TILE = 26, 160            # Name and tagline share the size TEXT
LABEL_W, HEAD = 230, 44
TILE_W = ICON_TILE + 24 * 3 + 330


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
    return lines + ([cur] if cur else [])


def pairs():
    """-> [(app id, spec A, spec B)] in number order."""
    specs = [specmod.load(p) for p in glob.glob(os.path.join(HERE, "*.card.yaml"))]
    by = {}
    for s in specs:
        if s.get("icon_version") == 2:
            app, _, v = s["id"].rpartition("-")
            by.setdefault(app, {})[v] = s
    return sorted(((app, v["a"], v["b"]) for app, v in by.items()), key=lambda t: t[1].number)


def main(out=os.path.join(HERE, "sheet-v2.png")):
    rows = pairs()
    bold = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-700.ttf"), TEXT)
    reg = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-400.ttf"), TEXT)
    label = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-700.ttf"), 34)
    ab = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-700.ttf"), 28)
    small = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-400.ttf"), 20)
    group_w = BIG + 24 + MID + 24 + SMALL
    row_h = BIG + 40
    W = PAD * 2 + LABEL_W + group_w * 2 + TILE_W + GAP * 3
    H = PAD * 2 + HEAD + len(rows) * (row_h + ROW_GAP) - ROW_GAP
    sheet = Image.new("RGB", (W, H), PAL["BG_TOP"])
    d = ImageDraw.Draw(sheet)
    d.rounded_rectangle([PAD // 2, PAD // 2, W - PAD // 2, H - PAD // 2], radius=36, fill=PAL["BG_BOT"])
    xa = PAD + LABEL_W
    xb = xa + group_w + GAP
    xt = xb + group_w + GAP
    d.text((xa, PAD), "A   256 · 64 · 32 px", font=small, fill=PAL["QUIET"])
    d.text((xb, PAD), "B   256 · 64 · 32 px", font=small, fill=PAL["QUIET"])
    d.text((xt, PAD), "A as an app tile", font=small, fill=PAL["QUIET"])
    for i, (app, a, b) in enumerate(rows):
        y = PAD + HEAD + i * (row_h + ROW_GAP)
        d.text((PAD, y + 4), a["title"], font=label, fill=PAL["INK"])                    # the app name
        d.text((PAD, y + 56), "A  ·  B", font=ab, fill=PAL["SILVER"])
        for x0, s in ((xa, a), (xb, b)):
            d.text((x0, y), "A" if s is a else "B", font=ab, fill=PAL["SILVER"])         # which variant
            for px, (ix, iy) in ((BIG, (x0, y + 40)), (MID, (x0 + BIG + 24, y + 40 + BIG - MID))):
                d.rounded_rectangle([ix - 1, iy - 1, ix + px, iy + px], radius=round(px * 0.22) + 1, outline=(52, 62, 82), width=2)  # tile edge
                sheet.paste(icon(s.png, px), (ix, iy), icon(s.png, px))
            sheet.paste(icon(s.png, SMALL), (x0 + BIG + 24 + MID + 24, y + 40 + BIG - SMALL), icon(s.png, SMALL))
        # the A tile mock: icon, Name bold, tagline at the same size
        ty = y + 40 + (BIG - (ICON_TILE + 48)) // 2
        d.rounded_rectangle([xt, ty, xt + TILE_W, ty + ICON_TILE + 48], radius=28, fill=(26, 32, 46))
        sheet.paste(icon(a.png, ICON_TILE), (xt + 24, ty + 24), icon(a.png, ICON_TILE))
        tx = xt + 24 + ICON_TILE + 24
        lines = wrap(d, a["caption"], reg, TILE_W - (tx - xt) - 24)
        block = TEXT * 1.3 * (1 + len(lines))
        cy = ty + (ICON_TILE + 48 - block) / 2
        d.text((tx, cy), a["title"], font=bold, fill=PAL["INK"])
        cy += TEXT * 1.3
        for ln in lines:
            d.text((tx, cy), ln, font=reg, fill=PAL["SILVER"])
            cy += TEXT * 1.3
    sheet.save(out, optimize=True)
    return out


def silhouettes(out):
    """The 32 px test: each sign as a filled black shape on white, redrawn from the render log (kit/icon.py `silhouette`)."""
    from kit import render
    rows = pairs()
    K = 6                                                    # shown at 6x, nearest neighbour, so the pixels stay honest
    cell = SMALL * K
    sheet = Image.new("RGB", (len(rows) * (cell + 12) + 12, 2 * (cell + 12) + 12), (230, 40, 40))
    for i, (_, a, b) in enumerate(rows):
        for j, s in enumerate((a, b)):
            card = render.build(s)
            sheet.paste(card.silhouette(SMALL).convert("RGB").resize((cell, cell), Image.NEAREST), (12 + i * (cell + 12), 12 + j * (cell + 12)))
    sheet.save(out)
    return out


if __name__ == "__main__":
    print(silhouettes(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[1] == "--silhouettes" else main())
