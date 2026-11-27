"""B03 · You are a river, not a battery. All text comes from B03.card.yaml (labels are in spec.text; lint counts them apart).

Figure: the full-colour photo (photos/B03-river.jpg), never recoloured. Tags sit on the three rocks in the stream
(Heavy food, Busy mind, Held emotion); a small tag marks the battery at lower left.
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from kit import vocab as K

HERE = os.path.dirname(os.path.abspath(__file__))
S = K.S
PW, PH = 928, 1152               # photo size (px)


def attribution(c, s):
    """The 'After ...' line in the footer row (footer text is outside the prose word count)."""
    draw_footer = c.footer

    def footer():
        draw_footer()
        c._role = "footer"
        c.rtext(920, 1258 + 13, s, "sans", 20, K.MOON, 200, maxw=520)
        c._role = "body"
    c.footer = footer


def place_photo(c, path, anchor, at, scale, p=2.0, fade=(0.80, 1.0)):
    """Full-colour photo into the card background (under the glow and the drawing layer): `anchor` (source px) lands on `at`
    (card px) at `scale`. Only a soft radial fade of its edges into the card background; no tint, no recolour."""
    im = Image.open(path).convert("RGB")
    w, h = max(1, round(im.size[0] * scale * S)), max(1, round(im.size[1] * scale * S))
    im = im.resize((w, h), Image.LANCZOS)
    u = (np.arange(w)[None, :] - w / 2) / (w / 2)
    v = (np.arange(h)[:, None] - h / 2) / (h / 2)
    d = (np.abs(u) ** p + np.abs(v) ** p) ** (1 / p)
    t = np.clip((fade[1] - d) / (fade[1] - fade[0]), 0, 1)
    a = (t * t * (3 - 2 * t) * 255).astype("uint8")
    rgba = im.convert("RGBA")
    rgba.putalpha(Image.fromarray(a, "L"))
    layer = Image.new("RGBA", c.im.size, (0, 0, 0, 0))
    layer.alpha_composite(rgba, (round((at[0] - anchor[0] * scale) * S), round((at[1] - anchor[1] * scale) * S)))
    c.im = Image.alpha_composite(c.im, layer)



def scrim(c, cx, cy, w, h, a=150):
    """A soft dark pad under a tag so it reads over a busy photo (the photo itself is not touched)."""
    m = Image.new("L", c.im.size, 0)
    ImageDraw.Draw(m).ellipse([(cx - w / 2) * S, (cy - h / 2) * S, (cx + w / 2) * S, (cy + h / 2) * S], fill=a)
    m = m.filter(ImageFilter.GaussianBlur(16 * S))
    pad = Image.new("RGBA", c.im.size, K.DARK + (255,))
    pad.putalpha(m)
    c.im = Image.alpha_composite(c.im, pad)


def figure(c, t, p=4.0, fade=(0.74, 1.0)):
    """Photo at full figure height, centred; returns the source-px -> card-px mapping."""
    top, bot = c.body_top, 1206
    scale = (bot - top) / PH
    place_photo(c, os.path.join(HERE, t["photo"]), (PW / 2, 0), (540, top), scale, p=p, fade=fade)
    return lambda sx, sy: (540 + (sx - PW / 2) * scale, top + sy * scale)


def build(spec):
    t = spec.text
    c = K.card(spec)
    attribution(c, t["attribution"])
    c._center = lambda: None          # the photo is placed absolutely; no vertical re-centring of the tags against it
    at = figure(c, t)
    rocks = [(250, 555), (480, 558), (755, 535)]   # top of each rock in the photo (px)
    with c.labels():
        for (sx, sy), label in zip(rocks, t["stones"]):
            x, y = at(sx, sy)
            scrim(c, x, y - 60, 210, 70)
            K.tag(c, x, y - 78, label, align="center", tsize=32, maxw=220)
            c.ln([(x, y - 34), (x, y - 6)], K.SILVER, 170, 1.8)
        x, y = at(225, 1012)
        K.tag(c, x, y, t["battery"], align="center", tsize=26, maxw=240)
    return c
