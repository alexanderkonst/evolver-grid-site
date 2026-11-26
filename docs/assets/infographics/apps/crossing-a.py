"""Crossing A: a vesica. Two overlapping circles, the lens between them lit. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT


def build(spec):
    c = I.card(spec)
    r, d = 215, 215
    with c.side("after"):
        c.fill(G.vesica(512, 512, r, d), K.NEON, 255, min_dim=r)                 # the lens: the one light
        c.ring(512 - d / 2, 512, r, W, K.INK, 255)
        c.ring(512 + d / 2, 512, r, W, K.INK, 255)
    return c
