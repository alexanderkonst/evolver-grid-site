"""Vision A: an open eye with a four-pointed star as its pupil. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT


def build(spec):
    c = I.card(spec)
    with c.side("after"):
        c.path(G.almond(512, 512, 335, 210), W, K.INK, 255, smooth=True)       # the eye
        c.fill(G.sparkle(512, 512, 150, 54), K.NEON, 255, min_dim=2 * 54)         # the pupil: a star, the one light
    return c
