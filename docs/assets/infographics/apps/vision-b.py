"""Vision B: a closed eye (a lid with lashes) and a four-pointed light inside its curve. No text."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402


def build(spec):
    c = I.card(spec)
    with c.side("after"):
        c.fill(G.sparkle(512, 420, 150, 52), K.NEON, 255, min_dim=2 * 52)         # the light inside: the one light
        c.fill(G.closed_lid(512, 400, 350, 150, 96, lashes=3, lash=105, tooth=32), K.INK, 255, min_dim=96)   # the closed eye
    return c
