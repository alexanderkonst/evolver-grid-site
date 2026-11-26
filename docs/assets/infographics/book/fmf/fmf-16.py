"""fmf-16 · The Living Venture Flywheel. All text comes from fmf-16.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy, R = 540, c.body_top + 330, 215
    P = K.hexpts(cx, cy, R, rot=-90)
    do, be = [P[0], P[2], P[4]], [P[1], P[3], P[5]]
    c.poly(do, K.INK, 200, 2.2)
    c.poly(be, K.LAV, 200, 2.2)
    c.arc_arrow(cx, cy, 64, -80, 230, K.SILVER, 200, 2.4)
    for k, ((x, y), (tag, s)) in enumerate(zip(P, t["points"])):
        a = math.radians(-90 + 60 * k)
        co, si = math.cos(a), math.sin(a)
        if tag == "DO":
            c.orb(x, y, 32, glow=50)
            c.ctext(x, y - 12, tag, "sansm", 22, K.DARK, 255, maxw=60)
        else:
            c.circle(x, y, 32, K.LAV, 230, 2.4, fill_a=22, glow=30)
            c.ctext(x, y - 12, tag, "sansm", 22, K.INK, 255, maxw=60)
        if k == 0:
            c.ctext(x, y - 90, s, "serif", 34, K.BRIGHT, 255, maxw=420, lh=1.05)
        elif k == 3:
            c.ctext(x, y + 48, s, "serif", 34, K.BRIGHT, 255, maxw=420, lh=1.05)
        elif co > 0:
            c.text(x + 48, y - 20, s, "serif", 34, K.BRIGHT, 255, maxw=1000 - x - 48, lh=1.05)
        else:
            c.rtext(x - 48, y - 20, s, "serif", 34, K.BRIGHT, 255, maxw=x - 48 - 80, lh=1.05)
    return c
