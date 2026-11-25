"""A03 · Growth Acceleration Cycle. All text comes from A03.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # three turns of one loop, each larger than the last: the flywheel
    r = 190
    nodes = [(-90, 26), (30, 36), (150, 48)]
    for k, (ang, rad) in enumerate(nodes):
        a = math.radians(ang)
        c.orb(cx + r * math.cos(a), cy + r * math.sin(a), rad, glow=50, seed=k + 2)
        nxt = nodes[(k + 1) % 3]
        c.arc_arrow(cx, cy, r, ang + 20 + rad * 0.2, nxt[0] + (360 if nxt[0] < ang else 0) - 20 - nxt[1] * 0.2, K.SILVER, 200, 2.4)
    c.rings(cx, cy, [60, 110], a=(70, 40))
    return c
