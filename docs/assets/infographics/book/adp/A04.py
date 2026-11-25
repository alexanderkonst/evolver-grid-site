"""A04 · The Five Paths of Growth. All text comes from A04.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # five points, every one joined to every other
    c.prism(cx, cy, 5, 230, K.INK, 230, 2.4)
    for k in range(5):
        a = math.radians(-90 + 72 * k)
        c.orb(cx + 230 * math.cos(a), cy + 230 * math.sin(a), 24, glow=50, seed=k + 1)
    c.orb(cx, cy, 34, glow=70)
    return c
