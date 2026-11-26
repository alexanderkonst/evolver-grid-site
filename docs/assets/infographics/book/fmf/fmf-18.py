"""fmf-18 · The Eight Phases. All text comes from fmf-18.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy, R = 540, c.body_top + 360, 235
    P = [(cx + R * math.cos(math.radians(-90 + 45 * k)), cy + R * math.sin(math.radians(-90 + 45 * k))) for k in range(8)]
    c.poly(P, K.SILVER, 150, 2)
    c.rings(cx, cy, [R * 0.6], a=(70,), dashed=True)
    c.orb(cx, cy, 44, glow=60)
    for k in range(8):
        a, b = P[k], P[(k + 1) % 8]
        mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        K.head(c, [a, ((a[0] + mid[0]) / 2, (a[1] + mid[1]) / 2), mid], K.SILVER, 210, 12)
    for k, (p, (nm, sub)) in enumerate(zip(P, t["phases"])):
        c.orb(p[0], p[1], 22, glow=40)
        co = math.cos(math.radians(-90 + 45 * k))
        if k == 0:
            K.name(c, p[0], p[1] - 76, nm, size=38, maxw=260)
        elif k == 4:
            y = K.name(c, p[0], p[1] + 38, nm, size=38, maxw=260)
            if sub:
                c.ctext(p[0], y + 4, sub, "sans", 24, K.QUIET, 235, maxw=300)
        elif co > 0.1:
            K.name(c, p[0] + 40, p[1] - 22, nm, "left", 38, maxw=200)
        elif co < -0.1:
            K.name(c, p[0] - 40, p[1] - 22, nm, "right", 38, maxw=200)
        else:
            K.name(c, p[0] + 40, p[1] - 22, nm, "left", 38, maxw=200)
    return c
