"""Your AI A: a sphere with four linked nodes (a spoke from the sphere to each node). No text."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icon_shapes as G  # noqa: E402
from kit import icon as I, vocab as K  # noqa: E402

W = I.WEIGHT
NODES = [(-64, 350), (14, 340), (122, 350), (204, 330)]        # angle (deg), distance from the sphere: a loose constellation


def build(spec):
    c = I.card(spec)
    nodes = [G.polar(512, 512, r, a) for a, r in NODES]
    with c.side("after"):
        for p in nodes:                                                           # four spokes from the sphere's rim: one shape
            a = math.atan2(p[1] - 512, p[0] - 512)
            c.path([(512 + 110 * math.cos(a), 512 + 110 * math.sin(a)), p], W, K.INK, 255, group="spokes")
        for p in nodes[1:]:
            c.dot(p[0], p[1], 58, K.INK, 255, glow=0, group="nodes")
        c.dot(nodes[0][0], nodes[0][1], 58, K.NEON, 255, glow=0)                  # one node lit: the one light
        c.orb(512, 512, 130, glow=40)                                             # the sphere: you
    return c
