"""A01 · Activate Your Dormant Potential. All text comes from A01.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 330
    R = 230
    # five paths around one centre: the seed that wakes
    c.rings(cx, cy, [110, 230], a=(100, 45))
    c.iri_ring(cx, cy, R, 3, 190)
    c.arc_arrow(cx, cy, 170, 200, 340, K.SILVER, 200, 2.4)   # one cycle
    K.note(c, cx, cy - 150, t["arc"], size=26)
    for k, label in enumerate(t["nodes"]):
        a = math.radians(-90 + 72 * k)
        x, y = cx + R * math.cos(a), cy + R * math.sin(a)
        c.orb(x, y, 26, glow=50, seed=k + 1)
        if k == 0:
            K.name(c, x, y - 90, label)
        elif k == 1:
            K.name(c, x + 46, y - 21, label, "left")
        elif k == 4:
            K.name(c, x - 46, y - 21, label, "right")
        else:
            K.name(c, x, y + 42, label)
    c.orb(cx, cy, 58, glow=80)
    with c.labels():
        c.ctext(cx, cy - 24, t["center"], "serif", 44, K.DARK, 255, maxw=100, lh=1.05)
    return c
