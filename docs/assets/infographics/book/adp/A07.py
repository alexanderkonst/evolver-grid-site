"""A07 · Mind. All text comes from A07.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 320
    # lenses: the same view through wider and wider circles
    xs = [170, 310, 480, 670, 856]
    c.ln([(xs[0] - 70, cy), (xs[-1] + 134, cy)], K.QUIET, 110, 1.4)
    for k, x in enumerate(xs):
        r = 46 + k * 22
        c.iri_ring(x, cy, r, 3, 150 + k * 20)
        c.dot(x, cy, 5, K.INK, 240, glow=60)
    K.name(c, xs[0], cy + 46 + 22, t["first"], size=36, maxw=220)
    K.name(c, xs[-1] - 40, cy + 134 + 22, t["last"], size=36, maxw=360)
    # the arrow: as we grow
    ay = cy - 134 - 56
    c.arrow(xs[0] - 20, ay, xs[-1] + 100, ay, K.SILVER, 200, 2.4, head=12)
    K.note(c, (xs[0] + xs[-1]) / 2, ay - 44, t["arrow"], size=34)
    return c
