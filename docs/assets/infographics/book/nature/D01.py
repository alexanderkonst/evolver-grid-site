"""D01 · One Turn of the Earth. A 24-hour dial in four quarters. All text from D01.card.yaml."""
import math
from kit import vocab as K

# hours -> angle: midnight at the bottom, noon at the top, clockwise
SPAN = [(6, 12), (12, 18), (18, 22), (22, 30)]
TINT = [K.CHAMP, K.PEARL, K.BLUSH, K.LAV]


def ang(h):
    return 90 + h / 24 * 360


def pol(cx, cy, r, a):
    return cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    cx, cy = 540, (top + 1060) / 2
    R = min(215, (1060 - top) / 2 - 90)
    c.rings(cx, cy, [R - 70], a=(50,))
    for k, q in enumerate(t["quarters"]):
        h0, h1 = SPAN[k]
        a0, a1 = ang(h0) + 1.5, ang(h1) - 1.5
        if k == 0:
            c.iri_arc(cx, cy, R, a0, a1, 12, 235)
        else:
            c.ln(K.arc_pts(cx, cy, R, a0, a1), TINT[k], 240, 8)
        mid = (ang(h0) + ang(h1)) / 2
        lx, ly = pol(cx, cy, R + 62, mid)
        right = math.cos(math.radians(mid)) > 0
        al = "left" if right else "right"
        K.name(c, lx, ly - 52, q["name"], al, size=40, maxw=250)
        K.note(c, lx, ly - 4, q["hours"], al, size=22, color=K.QUIET, maxw=200)
        K.note(c, lx, ly + 30, q["sub"], al, size=28, color=K.PEARL if k < 2 else K.QUIET, maxw=200)
    for h in (6, 12, 18, 24):
        x, y = pol(cx, cy, R, ang(h))
        c.dot(x, y, 4, K.BRIGHT, 220, 50)
    c.orb(cx, cy, 64, glow=70, seed=11)
    with c.labels():
        c.ctext(cx, cy - 19, t["center"], "serif", 34, K.DARK, 255, maxw=110, lh=1.0)
    K.note(c, 540, 1148, t["label"], size=22, color=K.QUIET)
    return c
