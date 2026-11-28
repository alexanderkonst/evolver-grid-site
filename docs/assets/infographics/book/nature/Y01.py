"""Y01 · Your Year Starts on Your Birthday. One ring, five phases, the birthday lit at the top. All text from Y01.card.yaml."""
import math
from kit import vocab as K

DAYS = [(0, 14), (14, 90), (90, 270), (270, 335), (335, 365)]
TINT = [K.CHAMP, K.PEARL, K.AQUA, K.DEEP, K.LAV]
WIDTH = [5, 9, 5, 5, 5]


def pol(cx, cy, r, ang):          # ang in degrees from the top, clockwise
    a = math.radians(ang - 90)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 10
    cx, cy = 540, (top + 1110) / 2 + 5
    R = min(250, (1110 - top) / 2 - 110)
    c.rings(cx, cy, [R - 62], a=(60,))
    for k, ((d0, d1), ph) in enumerate(zip(DAYS, t["phases"])):
        a0, a1 = d0 / 365 * 360 - 90, d1 / 365 * 360 - 90
        gap = 1.2 if k else 0
        pts = K.arc_pts(cx, cy, R, a0 + gap, a1 - 1.2)
        if k == 1:
            c.iri_arc(cx, cy, R, a0 + gap, a1 - 1.2, 11, 230)
        else:
            c.ln(pts, TINT[k], 235, WIDTH[k])
        mid = (d0 + d1) / 2 / 365 * 360
        x, y = pol(cx, cy, R + 44, mid)
        sub_y = 0
        if k == 0:     # right of the lit point, above the ring
            K.name(c, cx + 36, cy - R - 98, ph["name"], "left", size=38, maxw=300)
            K.note(c, cx + 36, cy - R - 54, ph["sub"], "left", size=21, color=K.QUIET, maxw=220)
        elif k == 4:   # left of the lit point
            K.name(c, cx - 36, cy - R - 98, ph["name"], "right", size=38, maxw=300)
            K.note(c, cx - 36, cy - R - 54, ph["sub"], "right", size=21, color=K.QUIET, maxw=220)
        elif k == 1:
            K.name(c, x + 6, y - 30, ph["name"], "left", size=38, maxw=230)
            K.note(c, x + 6, y + 12, ph["sub"], "left", size=21, color=K.QUIET, maxw=220)
        elif k == 2:
            K.name(c, cx, cy + R + 36, ph["name"], size=38, maxw=300)
            K.note(c, cx, cy + R + 80, ph["sub"], size=21, color=K.QUIET, maxw=220)
        else:
            K.name(c, x - 6, y - 30, ph["name"], "right", size=38, maxw=230)
            K.note(c, x - 6, y + 12, ph["sub"], "right", size=21, color=K.QUIET, maxw=220)
    px, py = pol(cx, cy, R, 0)
    c.dot(px, py, 9, K.BRIGHT, 255, 120)
    c.orb(cx, cy, 58, glow=70, seed=5)
    with c.labels():
        c.ctext(cx, cy - 20, t["center"]["name"], "serif", 25, K.DARK, 255, maxw=104, lh=1.0)
    K.note(c, cx, cy + 82, t["center"]["sub"], size=22, color=K.QUIET)
    K.note(c, cx, 1148, t["label"], size=22, color=K.QUIET)
    return c
