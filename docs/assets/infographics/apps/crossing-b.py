"""Crossing B: two arcs converge to one point, a light at the apex. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT


def build(spec):
    c = I.card(spec)
    left, right, apex = G.arch_arcs(512, 840, 265, 600, n=200)
    with c.side("after"):
        c.path(left, W, K.INK, 255, smooth=True)
        c.path(right, W, K.INK, 255, smooth=True)
        c.dot(apex[0], apex[1], 62, K.NEON, 255, glow=0)                         # where they meet: the one light
    return c
