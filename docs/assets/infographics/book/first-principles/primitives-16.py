"""primitives-16 · The Interchangeable Founder. All text comes from primitives-16.card.yaml."""
from kit import vocab as K


def quadrants(c, cx, cy, R, items, lit=None, centre=None):
    """Circle split into 4; items: [(title, desc)] for TL, TR, BL, BR."""
    c.rings(cx, cy, [R], a=(150,))
    c.ln([(cx - R, cy), (cx + R, cy)], K.SILVER, 130, 1.6); c.ln([(cx, cy - R), (cx, cy + R)], K.SILVER, 130, 1.6)
    for k, ang in enumerate([180, 270, 90, 0]):
        if lit and lit[k]:
            c.iri_poly([(cx, cy)] + K.arc_pts(cx, cy, R, ang, ang + 90, 20), int(lit[k]*255))


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30; cx, cy, R = 540, y + 290, 200
    quadrants(c, cx, cy, R, None, lit=(0.10, 0.10, 0.10, 0.10))
    # centre: an empty, dashed founder slot
    c.rings(cx, cy, [56], a=(220,), dashed=True)
    c.ctext(cx, cy - 12, t["founder"], "sansm", 17, K.SILVER, 230)
    q = t["quadrants"]
    # glyphs inside each quadrant
    c.wave(cx - 170, cy - 70, 110, 22, 2.2, noise=6, seed=1, c=K.INK, a=200)           # burning: a jagged signal
    for k in range(3): c.circle(cx + 70 + k*34, cy - 70, 13, K.SILVER, 170, 1.4)       # replaceable: identical slots
    c.slider(cx - 170, cy + 80, 120, 0.18)                                               # diluted: a share slider low
    c.knob(cx + 110, cy + 85, 26, 1.0)                                                   # not personal: turned to max
    K.tag(c, 80, y - 10, q[0]["title"], q[0]["sub"], "left", 32, 19, 300)
    K.tag(c, 1000, y - 10, q[1]["title"], q[1]["sub"], "right", 32, 19, 300)
    K.tag(c, 80, cy + R - 20, q[2]["title"], q[2]["sub"], "left", 32, 19, 300)
    K.tag(c, 1000, cy + R - 20, q[3]["title"], q[3]["sub"], "right", 32, 19, 300)
    c.quote(80, cy + R + 140, 920, t["quote"], 30)
    return c
