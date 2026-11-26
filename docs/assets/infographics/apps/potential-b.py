"""Potential B: a sprout rising from the sphere. A stem, two leaves (the one light). No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT


def build(spec):
    c = I.card(spec)
    with c.side("after"):
        c.path([(512, 650), (512, 400)], W, K.INK, 255)                          # the stem grows out of the sphere
        c.fill(G.lens((512, 410), 330, 170, -90 - 45) + G.lens((512, 410), 330, 170, -90 + 45)[::-1],
               K.NEON, 255, min_dim=170)                                         # two leaves: the one light
        c.orb(512, 745, 140, glow=40)                                            # the sphere
    return c
