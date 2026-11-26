"""fmf-10 · Clarity, Strategy, Action. All text comes from fmf-10.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy, R = 540, c.body_top + 330, 250
    v = [(cx + R * math.cos(math.radians(a)), cy + R * math.sin(math.radians(a))) for a in (-90, 30, 150)]
    # the triangle, walked clockwise: clarity -> strategy -> action (and round again)
    for k in range(3):
        (x1, y1), (x2, y2) = v[k], v[(k + 1) % 3]
        d = math.hypot(x2 - x1, y2 - y1); ux, uy = (x2 - x1) / d, (y2 - y1) / d
        c.arrow(x1 + ux * 52, y1 + uy * 52, x2 - ux * 52, y2 - uy * 52, K.SILVER, 200, 2.2, head=13)
    for k, ((x, y), s) in enumerate(zip(v, t["nodes"])):
        c.orb(x, y, 34, glow=50, seed=k + 2)
        K.name(c, x, y - 21, str(k + 1), size=40, color=K.DARK, maxw=60)
    K.name(c, v[0][0], v[0][1] - 34 - 62, t["nodes"][0], size=54, maxw=360)
    K.name(c, v[1][0], v[1][1] + 34 + 18, t["nodes"][1], size=50, maxw=340)
    K.name(c, v[2][0], v[2][1] + 34 + 18, t["nodes"][2], size=54, maxw=300)
    K.name(c, cx, cy - 8, t["center"], size=32, maxw=190, color=K.SILVER)
    return c
