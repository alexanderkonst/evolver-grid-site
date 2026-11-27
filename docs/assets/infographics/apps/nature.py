"""Nature: one continuous line, a wave that curls up into a crescent moon. The lit tip of the crescent is the one light. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT

R = 190                                     # radius of the crescent
SWEEP = 238                                 # how far the line curls round (deg)


def line():
    """The line, placed so its bounding box (stroke included) is centred on the tile: the optical centre is the middle."""
    pts, tip = G.wave_curl(540, 720, R, 380, 90, 440, SWEEP)
    x0, y0, x1, y1 = G.bbox(pts)
    return G.shift(pts, 512 - (x0 + x1) / 2, 512 - (y0 + y1) / 2)


def build(spec):
    c = I.card(spec)
    pts = line()
    with c.side("after"):
        c.path(pts[:-1], W, K.INK, 255, smooth=True)                                # wave -> crescent, one line
        c.dot(pts[-1][0], pts[-1][1], 44, K.NEON, 255, glow=0)                     # the lit tip of the crescent
    return c
