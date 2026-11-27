"""M01 · The Moon Has Four Seasons. One lunar cycle, four quarters: fire, water, earth, air. All text from M01.card.yaml."""
import math
from kit import vocab as K

TINT = [K.BLUSH, K.LAV, K.CHAMP, K.AQUA]       # ember, deep blue, green-gold, pale aqua


def pol(cx, cy, r, ang):
    a = math.radians(ang)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    cx, cy = 540, (top + 1090) / 2
    R = min(215, (1090 - top) / 2 - 140)
    for k, s in enumerate(t["seasons"]):
        a0 = -135 + 90 * k
        c.ln(K.arc_pts(cx, cy, R, a0 + 2, a0 + 88), TINT[k], 240, 9)
        for j in (0.25, 0.75):                     # two phases in each season: eight in all
            x, y = pol(cx, cy, R, a0 + 90 * j)
            c.dot(x, y, 7, K.BRIGHT, 255, 90)
    S = t["seasons"]
    # top: fire, right: water, bottom: earth, left: air
    K.name(c, cx, cy - R - 132, S[0]["name"], size=44)
    K.note(c, cx, cy - R - 82, S[0]["sub"], size=24, color=K.PEARL)
    K.note(c, cx, cy - R - 48, S[0]["phases"], size=21, color=K.QUIET, maxw=300)
    K.name(c, cx + R + 36, cy - 52, S[1]["name"], "left", size=44, maxw=200)
    K.note(c, cx + R + 36, cy + 4, S[1]["sub"], "left", size=24, color=K.PEARL, maxw=200)
    K.note(c, cx + R + 36, cy + 38, S[1]["phases"], "left", size=21, color=K.QUIET, maxw=200)
    K.name(c, cx, cy + R + 36, S[2]["name"], size=44)
    K.note(c, cx, cy + R + 90, S[2]["sub"], size=24, color=K.PEARL)
    K.note(c, cx, cy + R + 124, S[2]["phases"], size=21, color=K.QUIET, maxw=300)
    K.name(c, cx - R - 36, cy - 52, S[3]["name"], "right", size=44, maxw=200)
    K.note(c, cx - R - 36, cy + 4, S[3]["sub"], "right", size=24, color=K.PEARL, maxw=200)
    K.note(c, cx - R - 36, cy + 38, S[3]["phases"], "right", size=21, color=K.QUIET, maxw=210)
    c.orb(cx, cy, 78, glow=80, seed=6)
    with c.labels():
        c.ctext(cx, cy - 34, t["center"]["name"], "serif", 30, K.DARK, 255, maxw=110, lh=1.0)
    K.note(c, cx, cy + 100, t["center"]["sub"], size=21, color=K.QUIET, maxw=240)
    K.note(c, 540, 1148, t["label"], size=22, color=K.QUIET)
    return c
