"""Crossing: two overlapping circles, the lens left open. Left: a precise thin line with tick marks (science).
Right: a soft glowing line (consciousness). One neon dot at the centre of the crossing. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT

R, D = 196, 186                            # radius of each circle, distance between the centres
TICKS = [120 + 15 * k for k in range(9)]  # tick marks on the outer left arc, 120..240 deg
DX = 40                                    # ticks make the sign lean left: shift it right so the whole sign is centred


def build(spec):
    c = I.card(spec)
    xl, xr = 512 - D / 2 + DX, 512 + D / 2 + DX
    with c.side("after"):
        c.ring(xl, 512, R, W, K.INK, 255)                                          # science: a precise line
        for deg in TICKS:                                                          # ...with tick marks, like a scale
            a, b = G.polar(xl, 512, R + W / 2 + 12 + W / 2, deg), G.polar(xl, 512, R + W / 2 + 12 + W / 2 + 30, deg)
            c.path([a, b], W, K.INK, 255, group="ticks")
        c.ring(xr, 512, R, W, K.SILVER, 235, soft=110)                             # consciousness: a soft glowing line
        c.dot(512 + DX, 512, 40, K.NEON, 255, glow=0)                             # the one light: the centre of the crossing
    return c
