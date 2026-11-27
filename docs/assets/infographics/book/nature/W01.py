"""W01 · Seven Lights Named Your Week. Seven classical planets on a ring (Chaldean order); the weekday order is a +3 step. All text from W01.card.yaml."""
import math
from kit import vocab as K


def pol(cx, cy, r, ang):
    a = math.radians(ang - 90)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    cx, cy = 540, (top + 1000) / 2 + 10
    R = min(255, (1000 - top) / 2 - 90)
    P = t["planets"]                                  # ring order, clockwise from the top
    pos = [pol(cx, cy, R, 360 / 7 * i) for i in range(7)]
    week = [3, 6, 2, 5, 1, 4, 0]                      # Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn: ring indexes
    c.rings(cx, cy, [R], a=(70,))
    # the +3 step: each day jumps three places on the ring
    for d in range(7):
        i, j = week[d], week[(d + 1) % 7]
        (x1, y1), (x2, y2) = pos[i], pos[j]
        if d < 6:
            f = 0.14
            c.ln([(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f), (x1 + (x2 - x1) * (1 - f), y1 + (y2 - y1) * (1 - f))], K.SILVER, 120, 1.8)
    for d in range(7):
        i = week[d]
        x, y = pos[i]
        c.orb(x, y, 25, glow=45, seed=d + 1)
        with c.labels():
            c.ctext(x, y - 14, str(d + 1), "serif", 26, K.DARK, 255, maxw=40, lh=1.0)
        ang = 360 / 7 * i
        nm, day = P[i]["name"], P[i]["day"]
        ox, oy = pol(cx, cy, R + 40, ang)
        if i == 0:                                     # top
            K.name(c, ox, oy - 52, nm, size=36)
            K.note(c, ox, oy - 8, day, size=20, color=K.QUIET)
        elif ang < 180:                                # right side, text to the right
            K.name(c, x + 38, y - 34, nm, "left", size=36, maxw=220)
            K.note(c, x + 38, y + 8, day, "left", size=20, color=K.QUIET, maxw=200)
        else:                                          # left side, text to the left
            K.name(c, x - 38, y - 34, nm, "right", size=36, maxw=220)
            K.note(c, x - 38, y + 8, day, "right", size=20, color=K.QUIET, maxw=200)
    c.orb(cx, cy, 44, glow=60, seed=3)
    with c.labels():
        c.ctext(cx, cy - 24, t["center"], "serif", 40, K.DARK, 255, maxw=80, lh=1.0)
    K.note(c, cx, 1060, t["notes"][0], size=26, color=K.PEARL)
    K.note(c, cx, 1098, t["notes"][1], size=21, color=K.QUIET)
    K.note(c, cx, 1148, t["label"], size=22, color=K.QUIET)
    return c
