"""A01 · Activate Your Dormant Potential. All text comes from A01.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # five paths around one centre: the seed that wakes
    c.rings(cx, cy, [110, 170, 230], a=(100, 70, 45))
    c.iri_ring(cx, cy, 230, 3, 190)
    for k in range(5):
        a = math.radians(-90 + 72 * k)
        c.orb(cx + 230 * math.cos(a), cy + 230 * math.sin(a), 26, glow=50, seed=k + 1)
    c.arc_arrow(cx, cy, 150, 200, 340, K.SILVER, 200, 2.4)   # one cycle
    c.orb(cx, cy, 58, glow=80)
    return c
