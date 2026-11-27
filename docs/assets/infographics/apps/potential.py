"""Potential: an open bud. Three petals rise from the sphere; the middle one is the one light. No text. (v2 A, sign at ~70%.)"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT

K70 = 1.0                                  # scale about the tile centre so the sign is ~70% of the tile
DY = -13                                   # the sign's vertical centre onto the tile centre


def build(spec):
    c = I.card(spec)
    with c.side("after"):
        def p(pts):
            return G.scale(G.shift(pts, 0, DY), K70)
        base = (512, 640)                                                       # at the rim of the sphere
        c.fill(p(G.lens(base, 390, 160, -90 - 54)), K.INK, 255, min_dim=160 * K70)     # left petal
        c.fill(p(G.lens(base, 390, 160, -90 + 54)), K.INK, 255, min_dim=160 * K70)     # right petal
        c.fill(p(G.lens(base, 470, 170, -90)), K.NEON, 255, min_dim=170 * K70)         # the middle petal: the one light
        cx, cy = p([(512, 740)])[0]
        c.orb(cx, cy, 140 * K70, glow=40)                                       # the sphere: you, the seed
    return c
