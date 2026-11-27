"""B02 · Life energy is received, not only generated. All text comes from B02.card.yaml (labels are in spec.text; lint counts them apart).

Figure: the full-colour photo (photos/B02-received.jpg), never recoloured. Tags sit where the photo shows the thing:
Heaven by the light column, Earth by the ground, Hara by the belly glow.
"""
import math
import os

import numpy as np
from PIL import Image

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
    with c.labels():
        x, y = at(560, 70)
        K.tag(c, x, y, t["heaven"], align="left", tsize=38, maxw=300)
        x, y = at(464, 985)
        K.tag(c, x, y, t["earth"], align="center", tsize=38, maxw=300)
        gx, gy = at(520, 770)
        tx, ty = at(650, 770)
        K.tag(c, tx, ty - 22, t["hara"], align="left", tsize=38, maxw=200)
    c.ln([(gx + 6, gy), (tx - 12, gy)], K.SILVER, 170, 1.8)
    return c
