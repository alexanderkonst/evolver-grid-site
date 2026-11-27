"""B01 · Excitement is your body's compass. All text comes from B01.card.yaml (labels are in spec.text; lint counts them apart).

Figure: the full-colour photo of the five-ribbed flower (photos/B01-flower-moon.jpg, moonlight and rib angles are in the
photo, never recoloured). Five numbered steps sit at the five rib tips, in cycle order clockwise from the top rib,
joined by a thin ring with arrowheads (5 -> 1). `You` sits on the throat.
"""
import math
import os

import numpy as np
from PIL import Image

from kit import vocab as K

HERE = os.path.dirname(os.path.abspath(__file__))
S = K.S
FLOWER_C = (512, 530)            # flower centre in the 1024 px photo
FLOWER_R = 430                   # rim radius in the photo (px)
RIBS = [270, 342, 54, 126, 198]  # rib angles in the photo, 0 = right, clockwise


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


def build(spec):
    t = spec.text
    c = K.card(spec)
    attribution(c, t["attribution"])
    c._center = lambda: None          # the photo is placed absolutely; no vertical re-centring of the labels against it
    cx = 540
    rr = 262                          # ring / node radius
    scale = (rr - 30) / FLOWER_R      # flower rim sits 30 px inside the ring
    top = c.body_top
    cy = top + 440                    # label + ring + labels balanced in the body area (about 100 px air above and below)
    place_photo(c, os.path.join(HERE, t["photo"]), FLOWER_C, (cx, cy), scale, p=2.0, fade=(0.84, 1.0))
    # thin ring with arrowheads between the five nodes (a cycle, 5 -> 1)
    nr, gap = 22, math.degrees(math.asin(22 / rr)) + 4
    for k, a0 in enumerate(RIBS):
        a1 = a0 + 72
        c.arc_arrow(cx, cy, rr, a0 + gap, a1 - gap, K.SILVER, 200, 2.2, head=13)
    for k, (ang, label) in enumerate(zip(RIBS, t["steps"])):
        nx, ny = cx + rr * math.cos(math.radians(ang)), cy + rr * math.sin(math.radians(ang))
        c.orb(nx, ny, nr, glow=70 if k == 0 else 40, seed=k + 1)
        with c.labels():
            c.ctext(nx, ny - 15, str(k + 1), "sansm", 26, K.DARK, 255, maxw=60, lh=1.05)
            if ang == 270:
                K.tag(c, nx, ny - nr - 14 - 38, label, align="center", tsize=34, maxw=520)
            elif ang in (342, 54):
                x = nx + nr + 14
                K.tag(c, x, ny - 18, label, align="left", tsize=29, maxw=1000 - x)
            else:
                x = nx - nr - 14
                K.tag(c, x, ny - 18, label, align="right", tsize=29, maxw=x - 80)
    # `You` on the throat
    c.orb(cx, cy, 40, glow=90)
    with c.labels():
        c.ctext(cx, cy - 20, t["center"], "serif", 40, K.DARK, 255, maxw=100, lh=1.05)
    return c
