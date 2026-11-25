"""primitives-07 · One Signal, Many Formats. All text comes from primitives-07.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30; cx, cy, R = 540, y + 300, 250
    fm = t["formats"]
    c.rings(cx, cy, [120, 180], a=(90, 60), dashed=True)
    Pv = K.hexpts(cx, cy, R, rot=-90)
    for k, p in enumerate(Pv):
        c.ln([(cx + 100*math.cos(math.atan2(p[1]-cy, p[0]-cx)), cy + 100*math.sin(math.atan2(p[1]-cy, p[0]-cx))), p], K.SILVER, 110, 1.6)
        c.prism(p[0], p[1], 6, 20, K.INK, 220, 1.8)
    c.orb(cx, cy, 88, glow=90); c.star(cx, cy, 60, glow=0)
    c.ctext(cx, cy + 108, t["tagline"], "serif", 38, K.BRIGHT, 255)
    for k, tt in enumerate(fm):
        px, py = Pv[k]
        if k == 0: c.ctext(px, py - 64, tt, "sansm", 24, K.BRIGHT, 245, maxw=300)
        elif k == 3: c.ctext(px, py + 34, tt, "sansm", 24, K.BRIGHT, 245, maxw=300)
        elif k in (1, 2): c.text(px + 34, py - 14, tt, "sansm", 24, K.BRIGHT, 245, maxw=200)
        else: c.rtext(px - 34, py - 14, tt, "sansm", 24, K.BRIGHT, 245, maxw=200)
    c.quote(80, cy + R + 100, 920, t["quote"], 30)
    return c
