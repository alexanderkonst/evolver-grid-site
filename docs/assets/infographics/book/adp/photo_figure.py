"""A full-colour photo as the figure of an ADP card (shared by B01 to B03).

The card itself is the kit's standard card (`K.card(spec)`); this only puts the photo on the card's layer, where the
geometric figure would be. The photo's pixels are never recoloured or tinted: only its alpha is shaped, a soft
elliptical fade of its edges into the card background (opaque up to `fade[0]` of the half-size, clear at `fade[1]`).
Everything else (labels, orbs, arrows) is drawn on top through the kit vocabulary, as in any card.
"""
import os

import numpy as np
from PIL import Image

from kit import vocab as K

S = K.S


def attribution(c, s):
    """The 'After ...' line in the footer row (footer text is outside the prose word count)."""
    draw_footer = c.footer

    def footer():
        draw_footer()
        c._role = "footer"
        c.rtext(920, 1258 + 13, s, "sans", 20, K.MOON, 200, maxw=520)
        c._role = "body"
    c.footer = footer


def place(c, spec, name, cx, cy, width, fade=(0.86, 1.0), power=2):
    """Put photos/<name> (at the spec's folder) centred at (cx, cy) card px, `width` px wide. Returns (x0, y0, scale)."""
    path = os.path.join(os.path.dirname(spec.path), "photos", name)
    im = Image.open(path).convert("RGB")
    sc = width / im.size[0]
    w, h = int(round(im.size[0] * sc * S)), int(round(im.size[1] * sc * S))
    im = im.resize((w, h), Image.LANCZOS)
    yy, xx = np.mgrid[0:h, 0:w].astype("float32")
    u, v = np.abs((xx + 0.5) / w * 2 - 1), np.abs((yy + 0.5) / h * 2 - 1)
    d = (u ** power + v ** power) ** (1.0 / power)                                 # 0 centre, 1 at the edge midpoints
    t = np.clip((fade[1] - d) / (fade[1] - fade[0]), 0, 1)
    alpha = (t * t * (3 - 2 * t) * 255).astype("uint8")                           # smoothstep
    rgba = np.dstack([np.asarray(im), alpha])
    x0, y0 = cx - w / S / 2, cy - h / S / 2
    c.layer.alpha_composite(Image.fromarray(rgba, "RGBA"), (int(round(x0 * S)), int(round(y0 * S))))
    return x0, y0, sc
