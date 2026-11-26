"""Nature B: a spiral of moon phases: crescent, half, full (the one light, at the centre). No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT
SPIRAL = (512, 512, 340, 0, 1.75, -10)       # cx, cy, r_out, r_in, turns, start angle (the spiral ends at the centre)


def build(spec):
    c = I.card(spec)
    outer = G.spiral_at(*SPIRAL, 0.0)
    half = G.spiral_at(*SPIRAL, 0.5)
    with c.side("after"):
        c.path(G.spiral(*SPIRAL)[40:], W, K.INK, 255, smooth=True)
        c.fill(G.crescent(outer[0] + 10, outer[1], 108, 94, 62), K.MOON, 255, min_dim=76)         # new -> crescent, outer end
        c.fill(G.half_disc(half[0], half[1], 92), K.MOON, 255, min_dim=92)                   # half
        c.dot(512, 512, 92, K.NEON, 255, glow=0)                                             # full: the one light
    return c
