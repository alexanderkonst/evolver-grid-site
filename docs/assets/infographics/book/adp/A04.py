"""A04 · The Five Paths of Growth. All text comes from A04.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 330
    R = 230
    # five points, every one joined to every other
    c.prism(cx, cy, 5, R, K.INK, 230, 2.4)
    for k, label in enumerate(t["nodes"]):
        a = math.radians(-90 + 72 * k)
        x, y = cx + R * math.cos(a), cy + R * math.sin(a)
        c.orb(x, y, 24, glow=50, seed=k + 1)
        if k == 0:
            K.name(c, x, y - 88, label)
        elif k == 1:
            K.name(c, x + 44, y - 21, label, "left")
        elif k == 4:
            K.name(c, x - 44, y - 21, label, "right")
        else:
            K.name(c, x, y + 38, label)
    c.orb(cx, cy, 84, glow=80)
    with c.labels():
        c.ctext(cx, cy - 34, t["center"], "serif", 33, K.DARK, 255, maxw=150, lh=1.05)
    return c
