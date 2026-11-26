"""Your AI B: a sphere inside an orbit ring, one light on the ring. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT


def build(spec):
    c = I.card(spec)
    sat = G.polar(512, 512, 315, -40)
    with c.side("after"):
        c.ring(512, 512, 315, W, K.INK, 255)                                      # the orbit
        c.orb(512, 512, 150, glow=40)                                             # the sphere: you
        c.dot(sat[0], sat[1], 60, K.NEON, 255, glow=0)                            # the one light, riding the ring
    return c
