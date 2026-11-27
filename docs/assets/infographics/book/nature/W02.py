"""W02 · Don't Run the Week in One Mode. Seven arcs, one per day, each with its planet and mode. All text from W02.card.yaml."""
import math
from kit import vocab as K

TINT = [K.DEEP, K.PEARL, K.BLUSH, K.AQUA, K.LAV, K.MOON, K.QUIET]    # Sun ... Saturn


def pol(cx, cy, r, ang):
    a = math.radians(ang - 90)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    cx, cy = 540, (top + 1060) / 2
    R = min(225, (1060 - top) / 2 - 100)
    seg = 360 / 7
    for d, day in enumerate(t["days"]):
        a0 = d * seg - seg / 2
        c.ln(K.arc_pts(cx, cy, R, a0 + 90 + 2.5, a0 + 90 + seg - 2.5), TINT[d], 245, 9)
        x, y = pol(cx, cy, R, d * seg)
        c.dot(x, y, 5, K.BRIGHT, 255, 70)
        lx, ly = pol(cx, cy, R + 42, d * seg)
        if d == 0:
            K.name(c, lx, ly - 76, day["name"], size=36)
            K.note(c, lx, ly - 30, day["sub"], size=21, color=K.QUIET, maxw=300)
        elif d * seg < 180:
            K.name(c, lx, ly - 32, day["name"], "left", size=36, maxw=230)
            K.note(c, lx, ly + 10, day["sub"], "left", size=21, color=K.QUIET, maxw=250)
        else:
            K.name(c, lx, ly - 32, day["name"], "right", size=36, maxw=230)
            K.note(c, lx, ly + 10, day["sub"], "right", size=21, color=K.QUIET, maxw=250)
    c.orb(cx, cy, 70, glow=70, seed=9)
    with c.labels():
        c.ctext(cx, cy - 16, t["center"], "serif", 30, K.DARK, 255, maxw=110, lh=1.0)
    K.note(c, 540, 1148, t["label"], size=22, color=K.QUIET)
    return c
