"""primitives-03 · The DNA of a Business. All text comes from primitives-03.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 50; cx, cy, R = 540, y + 330, 250
    els = [(s, None) for s in t["cells"]]
    Pv = K.hexpts(cx, cy, R)
    # faint cube-along-diagonal: spokes from centre to every vertex (the source feeds all six)
    for k, p in enumerate(Pv):
        ang = math.atan2(p[1]-cy, p[0]-cx); r0 = 165 if k == 3 else 104
        c.ln([(cx + r0*math.cos(ang), cy + r0*math.sin(ang)), (cx + (R-26)*math.cos(ang), cy + (R-26)*math.sin(ang))], K.SILVER, 90, 1.4)
    c.poly(Pv, K.SILVER, 120, 1.6)
    # the order around: iridescent arrows between consecutive cells
    for k in range(6):
        p, q = Pv[k], Pv[(k+1) % 6]
        t0, t1 = 0.2, 0.8
        a = (p[0] + (q[0]-p[0])*t0, p[1] + (q[1]-p[1])*t0); b = (p[0] + (q[0]-p[0])*t1, p[1] + (q[1]-p[1])*t1)
        if k < 5:
            c.iri_path([a, b], 4, 220); K.head(c, [a, a, b], K.INK, 230, 13)
    c.star(cx, cy, 92, glow=80)
    c.ctext(cx, cy + 112, t["source1"], "sansm", 18, K.SILVER, 235, maxw=300)
    c.ctext(cx, cy + 136, t["source2"], "sans", 17, K.QUIET, 230, maxw=300)
    for k, (tt, _) in enumerate(els):
        px, py = Pv[k]
        c.orb(px, py, 22, glow=55)
        c.text(px, py - 9, str(k+1), "sansm", 15, K.DARK, 255, align="center")
        if k == 0:   K.tag(c, px, py - 80, tt, None, "center", 34, maxw=360)
        elif k == 3: K.tag(c, px, py + 36, tt, None, "center", 34, maxw=360)
        elif k in (1, 2): K.tag(c, px + 38, py - 20, tt, None, "left", 34, maxw=200)
        else:        K.tag(c, px - 38, py - (36 if k == 4 else 20), tt, None, "right", 34, maxw=200)
    c.quote(80, cy + R + 120, 920, t["quote"], 32)
    return c
