"""Nature A: a crescent moon over one wave. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT


def build(spec):
    c = I.card(spec)
    with c.side("after"):
        c.fill(G.crescent(470, 345, 205, 182, 100), K.MOON, 255, min_dim=120)     # the moon
        c.path(G.wave(512, 705, 700, 62), W, K.NEON, 255, smooth=True)                         # one wave: the one light
    return c
