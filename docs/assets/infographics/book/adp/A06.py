"""A06 · Spirit. All text comes from A06.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # three meta-abilities meet in one engine
    V = c.tri_split(cx, cy, 210, fill=(0.25, 0.25, 0.25))
    for k, v in enumerate(V):
        c.orb(v[0], v[1], 30, glow=50, seed=k + 1)
    c.rings(cx, cy, [90, 150], a=(80, 50))
    c.orb(cx, cy, 52, glow=90)
    return c
