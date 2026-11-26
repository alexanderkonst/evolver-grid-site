"""Crossing: two rings far apart -> two rings overlapping into one vesica (one coin, two sides). No text."""
import math

from kit import icon as I, vocab as K


def lens(cx, cy, r, d, n=40):
    """Overlap of two circles of radius r stacked vertically, centres d apart (a vesica when d == r)."""
    h = math.sqrt(r * r - (d / 2) ** 2)
    a0 = math.degrees(math.atan2(d / 2, h))
    low = [I.polar(cx, cy - d / 2, r, a0 + (180 - 2 * a0) * i / n) for i in range(n + 1)]          # lower arc of the top ring
    top = [I.polar(cx, cy + d / 2, r, 180 + a0 + (180 - 2 * a0) * i / n) for i in range(n + 1)]    # upper arc of the bottom ring
    return low + top


def build(spec):
    c = I.card(spec)
    with c.side("before"):
        c.ring(I.BEFORE_X, 512 - 200, 90, 48, K.QUIET, 170)
        c.ring(I.BEFORE_X, 512 + 200, 90, 48, K.QUIET, 170)
    c.chevron()
    with c.side("after"):
        r = 130
        c.fill(lens(I.AFTER_X, 512, r, r), K.NEON, 235, min_dim=r)          # the one coin
        c.ring(I.AFTER_X, 512 - r / 2, r, 48, K.SILVER, 235)
        c.ring(I.AFTER_X, 512 + r / 2, r, 48, K.SILVER, 235)
    return c
