"""primitives-06 · Promise Becomes Tagline. All text comes from primitives-06.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30
    # the founder's path: steps already walked (solid) and offered (iridescent)
    px0, py0 = 120, y + 170
    steps = [(px0 + i*110, py0 + 40*math.sin(i*0.8)) for i in range(8)]
    c.ln(steps[:5], K.SILVER, 150, 2); c.iri_path(steps[4:], 5, 220)
    for i, s in enumerate(steps):
        if i < 5: c.dot(s[0], s[1], 4, K.SILVER, 200, glow=0)
        else: c.orb(s[0], s[1], 12, glow=40)
    c.star(steps[4][0], steps[4][1], 30, glow=60)
    c.ctext(steps[4][0], steps[4][1] + 44, t["founder"], "sansm", 17, K.SILVER, 230)
    K.tag(c, 80, y - 10, t["promise"]["title"], t["promise"]["sub"], "left", 34, 21, 600)
    # prism: three rays enter, one beam leaves
    cx, cy = 540, y + 500
    tri = [(cx, cy - 100), (cx + 95, cy + 70), (cx - 95, cy + 70)]
    c.iri_poly(tri, 70, outline=230, w=3)
    rays = list(zip(t["rays"], (-70, 0, 70)))
    for tt, dy in rays:
        c.ln([(150, cy + dy*1.4), (cx - 50, cy + 10)], K.SILVER, 170, 2)
        c.text(150, cy + dy*1.4 - 34, tt, "sansm", 20, K.MOON, 230)
    c.gd.rectangle([(cx + 40)*K.S, (cy - 4)*K.S, 1000*K.S, (cy + 24)*K.S], fill=K.rgba(K.GLOW, 70))
    c.iri_poly([(cx + 50, cy + 2), (990, cy - 6), (990, cy + 26), (cx + 50, cy + 18)], 230)
    c.text(990, cy + 46, t["tagline"], "serif", 48, K.BRIGHT, 255, align="right")
    c.quote(80, cy + 170, 920, t["quote"], 32)
    return c
