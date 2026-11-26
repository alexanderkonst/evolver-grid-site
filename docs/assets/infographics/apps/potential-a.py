"""Potential A: an open bud. Three petals rise from the sphere; the middle one is the one light. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT


def build(spec):
    c = I.card(spec)
    with c.side("after"):
        base = (512, 640)                                                       # at the rim of the sphere
        c.fill(G.lens(base, 390, 160, -90 - 54), K.INK, 255, min_dim=160)       # left petal
        c.fill(G.lens(base, 390, 160, -90 + 54), K.INK, 255, min_dim=160)       # right petal
        c.fill(G.lens(base, 470, 170, -90), K.NEON, 255, min_dim=170)           # the middle petal: the one light
        c.orb(512, 740, 140, glow=40)                                           # the sphere: you, the seed
    return c
