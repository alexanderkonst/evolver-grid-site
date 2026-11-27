"""M04 · The Cycle Starts After You Celebrate. Eight phases round a ring; the new cycle starts after Celebrating. All text from M04.card.yaml."""
import math
from kit import vocab as K

# cycle order from Planning (top) clockwise: Planning, Planting, Clearing, Gathering, Seeing, Prep, Harvesting, Celebrating
FRAC = [(0.5, False), (0.25, False), (0.0, False), (0.25, True), (0.5, True), (0.75, True), (1.0, True), (0.75, False)]


def pol(cx, cy, r, ang):
    a = math.radians(ang)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def moon(c, x, y, r, f, waxing, lit, a=235):
    c.circle(x, y, r, K.QUIET, 190, 2)
    if f <= 0:
        return
    sgn = 1 if waxing else -1
    side = [(x + sgn * r * math.cos(math.radians(g)), y + r * math.sin(math.radians(g))) for g in range(-90, 91, 6)]
    k = 1 - 2 * f
    term = [(x + sgn * k * r * math.cos(math.radians(g)), y + r * math.sin(math.radians(g))) for g in range(90, -91, -6)]
    c.poly(side + term, lit, a, 1.5, fill_a=a, fill_c=lit)


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    cx, cy = 540, (top + 1090) / 2 + 30
    R = min(250, (1090 - top) / 2 - 95)
    ang = [-90 + 45 * k for k in range(8)]
    # ring arcs between glyphs; the one after Celebrating is the quiet
    for k in range(8):
        a0, a1 = ang[k] + 9, ang[k] + 36
        if k == 7:
            c.arc_arrow(cx, cy, R, ang[7] + 10, ang[7] + 36, K.BRIGHT, 235, 3.5)
        else:
            c.ln(K.arc_pts(cx, cy, R, a0, a1, 20), K.SILVER, 90, 1.6)
    for k in range(8):
        x, y = pol(cx, cy, R, ang[k])
        key = k in (0, 6, 7)
        lit = K.CHAMP if k in (5, 6, 7) else K.PEARL
        moon(c, x, y, 36 if key else 26, *FRAC[k], lit, 235 if key else 140)
        if k == 7:
            c.iri_ring(x, y, 46, 3, 200)
    px, py = pol(cx, cy, R, ang[0]); hx, hy = pol(cx, cy, R, ang[6]); ex, ey = pol(cx, cy, R, ang[7])
    K.name(c, px, py - 36 - 50, t["plan"], size=38)
    K.note(c, px + 50, py - 44, t["gap"], "left", size=22, color=K.QUIET, maxw=160)
    K.name(c, hx - 36 - 16, hy - 20, t["harvest"], "right", size=34, maxw=220)
    K.name(c, ex - 36 - 18, ey - 34, t["celebrate"], "right", size=38, maxw=260)
    K.note(c, ex - 36 - 18, ey + 10, t["steps"], "right", size=22, color=K.DEEP, maxw=260)
    qx, qy = pol(cx, cy, R - 62, -112.5)
    K.note(c, qx, qy - 12, t["quiet"], size=24, color=K.BRIGHT)
    c.orb(cx, cy, 70, glow=80, seed=7)
    with c.labels():
        c.ctext(cx, cy - 18, t["center"]["name"], "serif", 24, K.DARK, 255, maxw=120, lh=1.0)
    K.note(c, cx, cy + 90, t["center"]["sub"], size=24, color=K.PEARL)
    K.note(c, 540, 1148, t["label"], size=22, color=K.QUIET)
    return c
