"""primitives-15 · Equity VC Is a Casino. All text comes from primitives-15.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t_ = spec.text
    c = K.card(spec)
    y = c.body_top + 30; cx, cy = 540, y + 270
    # roulette wheel
    R = 170
    c.rings(cx, cy, [R, R - 40, 60], a=(160, 110, 90))
    for k in range(24):
        a0 = k*15
        if k % 2 == 0:
            c.iri_poly(K.arc_pts(cx, cy, R, a0, a0 + 15, 6) + K.arc_pts(cx, cy, R - 40, a0 + 15, a0, 6), 70)
        t = math.radians(a0)
        c.ln([(cx + (R-40)*math.cos(t), cy + (R-40)*math.sin(t)), (cx + R*math.cos(t), cy + R*math.sin(t))], K.SILVER, 100, 1)
    c.orb(cx, cy, 44, glow=60)
    c.dot(cx + (R - 20)*math.cos(math.radians(-60)), cy + (R - 20)*math.sin(math.radians(-60)), 7, K.INK, 255, glow=90)
    angs = (-90, 30, 150)
    for ang in angs:
        a0 = ang + 25; a1 = ang + 95
        pts = K.arc_pts(cx, cy, R + 40, a0, a1)
        c.ln(pts, K.SILVER, 150, 2); K.head(c, pts, K.SILVER, 200)
    s = t_["steps"]
    K.tag(c, cx, cy - R - 120, s[0]["title"], s[0]["sub"], "center", 32, 20, 520)
    K.tag(c, cx + R + 30, cy + 130, s[1]["title"], s[1]["sub"], "left", 32, 20, 260)
    K.tag(c, cx - R - 30, cy + 130, s[2]["title"], s[2]["sub"], "right", 32, 20, 260)
    c.quote(80, cy + 330, 920, t_["quote"], 30)
    return c
