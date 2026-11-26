"""apps/sheet.png: five mock app tiles on a panel (icon, Name bold, tagline at the same size, Space Grotesk)
and the five icons at 64 px in one row. Reads the specs (title, caption) and the icon PNGs beside them.

Usage, from docs/assets/infographics/:  python3 apps/make_sheet.py        (render the icons first: kit/render.py apps/<id>.card.yaml)
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
TILE_W, GAP, PAD, ICON, TEXT = 300, 36, 56, 216, 26     # name and tagline share the size TEXT
SMALL = 64


def rounded(im, radius):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius=radius, fill=255)
    out = im.convert("RGBA"); out.putalpha(m)
    return out


def wrap(d, s, font, maxw):
    lines, cur = [], ""
    for w in s.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    return lines + ([cur] if cur else [])


def main(out=os.path.join(HERE, "sheet.png")):
    specs = sorted((s for s in (specmod.load(p) for p in glob.glob(os.path.join(HERE, "*.card.yaml")))
                    if s.get("icon_version") != 2), key=lambda s: s.number)       # v1 only; v2 has make_sheet_v2.py
    bold = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-700.ttf"), TEXT)
    reg = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-400.ttf"), TEXT)
    small = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk-400.ttf"), 20)
    n = len(specs)
    W = PAD * 2 + n * TILE_W + (n - 1) * GAP
    tile_h = 28 + ICON + 24 + TEXT * 1.3 * 4 + 28
    H = int(PAD + tile_h + 64 + SMALL + PAD)
    sheet = Image.new("RGB", (W, H), PAL["BG_TOP"])
    d = ImageDraw.Draw(sheet)
    # the panel
    d.rounded_rectangle([PAD // 2, PAD // 2, W - PAD // 2, PAD + tile_h + PAD // 2], radius=36, fill=PAL["BG_BOT"])
    for i, s in enumerate(specs):
        x, y = PAD + i * (TILE_W + GAP), PAD
        d.rounded_rectangle([x, y, x + TILE_W, y + tile_h], radius=28, fill=(26, 32, 46))
        icon = rounded(Image.open(s.png).convert("RGB").resize((ICON, ICON), Image.LANCZOS), 52)
        sheet.paste(icon, (x + (TILE_W - ICON) // 2, y + 28), icon)
        ty = y + 28 + ICON + 24
        d.text((x + 22, ty), s["title"], font=bold, fill=PAL["INK"])          # Name, bold
        ty += TEXT * 1.3
        for ln in wrap(d, s["caption"], reg, TILE_W - 44):                     # tagline, same size
            d.text((x + 22, ty), ln, font=reg, fill=PAL["SILVER"])
            ty += TEXT * 1.3
    # the five icons at 64 px, one row
    ry = int(PAD + tile_h + 64)
    d.text((PAD, ry - 34), "64 px", font=small, fill=PAL["QUIET"])
    for i, s in enumerate(specs):
        ic = rounded(Image.open(s.png).convert("RGB").resize((SMALL, SMALL), Image.LANCZOS), 14)
        sheet.paste(ic, (PAD + i * (SMALL + 28), ry), ic)
    sheet.save(out, optimize=True)
    return out


if __name__ == "__main__":
    print(main())
