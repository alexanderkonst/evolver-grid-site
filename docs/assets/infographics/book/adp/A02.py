"""A02 · Dormant Potential. All text comes from A02.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # a signal from above reaches the seed; its rings open
    c.star(cx, cy - 250, 34, glow=70)
    c.iri_line(cx, cy - 205, cx, cy - 30, 3, 200)
    c.rings(cx, cy + 90, [110, 165, 220], a=(110, 70, 40))
    c.orb(cx, cy + 90, 58, glow=80)
    c.dot(cx, cy - 118, 4, K.INK, 240, glow=70)
    return c
