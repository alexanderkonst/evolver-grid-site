"""Your AI: an iridescent sphere, a thin tilted orbit, one neon satellite riding it. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT

TILT, A, B = -22, 360, 130                  # orbit: tilt, long and short semi-axis (centre line)
SAT = -35                                   # where the satellite sits on the orbit (deg of the ellipse parameter)


def build(spec):
    c = I.card(spec)
    sat = G.ellipse(512, 512, A, B, TILT, SAT, SAT, n=1)[0]
    with c.side("after"):
        c.path(G.ellipse(512, 512, A, B, TILT, 180, 360), W, K.INK, 255, group="orbit", smooth=True)   # the far half, behind the sphere
        c.orb(512, 512, 130, glow=40)                                                                  # the sphere: you
        c.path(G.ellipse(512, 512, A, B, TILT, 0, 180), W, K.INK, 255, group="orbit", smooth=True)     # the near half, in front
        c.dot(sat[0], sat[1], 46, K.NEON, 255, glow=0)                                                # the one light, riding the orbit
    return c
