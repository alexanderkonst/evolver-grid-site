"""noosphere-1 · Every Cell Has a Neighbor. All text comes from noosphere-1.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 10
    lits = [None, None, (1, 2), (3, 4), (5,), (0,)]
    rows = [(d["title"], d["line"], lit) for d, lit in zip(t["rows"], lits)]
    for i, (a, b, lit) in enumerate(rows):
        yy = y + i*100
        gx, gy = 112, yy + 34
        Pv = K.hexpts(gx, gy, 24)
        c.poly(Pv, K.SILVER, 120, 1.3)
        for k, p in enumerate(Pv):
            if lit and k in lit: c.dot(p[0], p[1], 4.5, K.INK, 255, glow=70)
            else: c.dot(p[0], p[1], 2.2, K.QUIET, 180, glow=0)
        if lit is None: c.dot(gx, gy, 3, K.QUIET, 200, glow=0)
        c.text(165, yy + 14, a, "serif", 30, K.BRIGHT, 255)
        c.text(445, yy + 18, b, "sans", 21, K.MOON, 225, maxw=555)
        c.line(165, yy + 86, 1000, yy + 86, K.MOON, 30, 1)
    yy = y + 6*100 + 20
    c.star(112, yy + 30, 30, glow=70)
    c.quote(165, yy + 10, 835, t["quote"], 30)
    return c
