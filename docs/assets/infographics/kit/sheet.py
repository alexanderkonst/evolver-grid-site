"""One contact sheet PNG per batch: a grid of cards, each with its id and title, for human review.

Usage: python3 kit/sheet.py <dir | card.card.yaml ...> [--out sheet.png] [--cols 3] [--render]
A directory means every *.card.yaml in it (not fixtures). Cards are read from the PNG beside each spec;
--render draws them first. Default output: <dir>/contact-sheet.png.
"""
import argparse
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from kit import skins, spec as specmod  # noqa: E402

THUMB_W, PAD, LABEL_H = 360, 28, 64


def make_sheet(specs, out, cols=3):
    sk = skins.get("v4")
    ink, quiet, bg = sk.palette["INK"], sk.palette["QUIET"], sk.palette["BG_TOP"]
    f_id = ImageFont.truetype(os.path.join(skins.FONTS, "SpaceGrotesk-500.ttf"), 15)
    f_t = ImageFont.truetype(os.path.join(skins.FONTS, "SpaceGrotesk-400.ttf"), 17)
    thumbs = []
    for s in specs:
        im = Image.open(s.png).convert("RGB")
        thumbs.append((s, im.resize((THUMB_W, round(im.size[1] * THUMB_W / im.size[0])), Image.LANCZOS)))
    cols = max(1, min(cols, len(thumbs)))
    rows = -(-len(thumbs) // cols)
    cell_h = max(t.size[1] for _, t in thumbs) + LABEL_H
    sheet = Image.new("RGB", (PAD + cols * (THUMB_W + PAD), PAD + rows * (cell_h + PAD)), bg)
    d = ImageDraw.Draw(sheet)
    for i, (s, t) in enumerate(thumbs):
        x, y = PAD + (i % cols) * (THUMB_W + PAD), PAD + (i // cols) * (cell_h + PAD)
        sheet.paste(t, (x, y))
        d.text((x, y + t.size[1] + 10), str(s["id"]), font=f_id, fill=quiet)
        d.text((x, y + t.size[1] + 32), str(s["title"]), font=f_t, fill=ink)
    sheet.save(out, optimize=True)
    return out


def collect(targets):
    paths = []
    for t in targets:
        paths += sorted(glob.glob(os.path.join(t, "*.card.yaml"))) if os.path.isdir(t) else [t]
    return [specmod.load(p) for p in paths]


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("targets", nargs="+"); ap.add_argument("--out"); ap.add_argument("--cols", type=int, default=3)
    ap.add_argument("--render", action="store_true")
    a = ap.parse_args()
    specs = collect(a.targets)
    if not specs:
        sys.exit("no *.card.yaml found")
    if a.render:
        from kit import render
        for s in specs:
            render.render(s)
    missing = [s.png for s in specs if not os.path.exists(s.png)]
    if missing:
        sys.exit("missing PNG (render first, or pass --render): " + ", ".join(missing))
    out = a.out or os.path.join(a.targets[0] if os.path.isdir(a.targets[0]) else os.path.dirname(specs[0].path), "contact-sheet.png")
    print(make_sheet(specs, out, a.cols))
