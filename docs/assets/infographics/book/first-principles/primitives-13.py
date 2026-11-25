"""primitives-13 · Start With Who. All text comes from primitives-13.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30; cx, cy = 360, y + 290
    c.rings(cx, cy, [140, 210, 280], a=(150, 110, 75))
    c.orb(cx, cy, 70, glow=80)
    c.ctext(cx, cy - 18, t["centre"], "serif", 34, (20, 24, 36), 255)
    its = t["items"]
    items = [(its[0]["num"], its[0]["title"], its[0]["sub"], 70), (its[1]["num"], its[1]["title"], its[1]["sub"], 175), (its[2]["num"], its[2]["title"], its[2]["sub"], 245)]
    for i, (num, tt, d, rr) in enumerate(items):
        ang = math.radians(-28 + i*28)
        px, py = cx + rr*math.cos(ang), cy + rr*math.sin(ang)
        c.dot(px, py, 6, K.INK, 255, glow=80)
        ly = y + 120 + i*150
        c.ln([(px + 10, py), (700, ly + 22)], K.SILVER, 90, 1.2)
        c.prism(690, ly + 22, i+1, 15)
        K.tag(c, 725, ly, tt, d, "left", 34, 20, 280)
    c.iri_arc(cx, cy, 140, -40, 40, 4, 220); c.iri_arc(cx, cy, 210, -40, 40, 3, 160); c.iri_arc(cx, cy, 280, -40, 40, 2, 110)
    c.quote(80, cy + 330, 920, t["quote"], 30)
    return c
