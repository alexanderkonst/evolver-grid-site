"""primitives-02 · Process, Change, Exchange. All text comes from primitives-02.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30; cx, cy, r = 540, y + 330, 230
    V = c.tri_split(cx, cy, r, fill=(0.0, 0.0, 0.32))
    # circulation inside: process -> change -> exchange -> back
    for k in range(3):
        a0 = -90 + 120*k + 20; a1 = a0 + 80
        pts = K.arc_pts(cx, cy, 72, a0, a1)
        c.ln(pts, K.SILVER, 170, 2); K.head(c, pts, K.SILVER, 210, 10)
    for v in V: c.orb(v[0], v[1], 26, glow=60)
    c.star(cx, cy, 40, glow=40)
    K.tag(c, V[0][0], V[0][1] - 112, t["process"]["title"], t["process"]["sub"], "center", 36, 21, 420)
    K.tag(c, V[1][0] - 60, V[1][1] + 44, t["change"]["title"], t["change"]["sub"], "left", 36, 21, 290)
    K.tag(c, V[2][0] + 60, V[2][1] + 44, t["exchange"]["title"], t["exchange"]["sub"], "right", 36, 21, 300)
    c.quote(80, cy + 300, 920, t["quote"], 32)
    return c
