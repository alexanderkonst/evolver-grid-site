"""A07 · Mind. All text comes from A07.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # lenses: the same view through wider and wider circles
    xs = [170, 310, 480, 670, 856]
    for k, x in enumerate(xs):
        r = 46 + k * 22
        c.iri_ring(x, cy, r, 3, 150 + k * 20)
        c.dot(x, cy, 5, K.INK, 240, glow=60)
    c.ln([(xs[0] - 70, cy), (xs[-1] + 134, cy)], K.QUIET, 110, 1.4)
    return c
