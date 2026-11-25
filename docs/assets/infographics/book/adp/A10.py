"""A10 · Genius. All text comes from A10.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # one unique star; three steps toward it: find, forge, live
    c.rings(cx, cy - 40, [170, 230], a=(90, 55))
    c.star(cx, cy - 40, 130, glow=80)
    xs = [340, 540, 740]
    for k, x in enumerate(xs):
        c.prism(x, cy + 250, k + 1, 22, K.INK, 230, 2.4)
        if k < 2:
            c.arrow(x + 50, cy + 250, xs[k + 1] - 50, cy + 250, K.SILVER, 170, 2, head=10)
    return c
