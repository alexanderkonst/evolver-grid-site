"""A10 · Genius. All text comes from A10.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # one unique star; three steps toward it: find, forge, live
    c.rings(cx, cy - 40, [170, 230], a=(90, 55))
    c.star(cx, cy - 40, 130, glow=80)
    K.name(c, cx, cy - 40 + 230 + 18, t["center"], size=48, maxw=400)
    xs = [220, 540, 860]
    for k, x in enumerate(xs):
        c.prism(x, cy + 330, k + 1, 22, K.INK, 230, 2.4)
        K.note(c, x, cy + 330 + 38, t["chain"][k], size=33, maxw=300)
        if k < 2:
            c.arrow(x + 90, cy + 330, xs[k + 1] - 90, cy + 330, K.SILVER, 170, 2, head=10)
    return c
