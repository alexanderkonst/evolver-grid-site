"""primitives-17 · Sell What They Want. All text comes from primitives-17.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30; cx, cy, R = 540, y + 270, 220
    # outer shell = the want, with a door opening; inner room = the need
    c.iri_arc(cx, cy, R, 290, 250 + 360, 10, 200)
    c.ln([(cx + R*math.cos(math.radians(250)), cy + R*math.sin(math.radians(250))), (cx + (R-30)*math.cos(math.radians(250)), cy + (R-30)*math.sin(math.radians(250)))], K.INK, 200, 2)
    c.ln([(cx + R*math.cos(math.radians(290)), cy + R*math.sin(math.radians(290))), (cx + (R-30)*math.cos(math.radians(290)), cy + (R-30)*math.sin(math.radians(290)))], K.INK, 200, 2)
    pts = [(cx, cy - R - 90), (cx, cy - 110)]
    c.ln(pts, K.INK, 220, 2.4); K.head(c, [pts[0], pts[0], pts[1]], K.INK, 230, 13)
    c.orb(cx, cy, 100, glow=90)
    c.ctext(cx, cy - 24, t["need"], "serif", 34, (20, 24, 36), 255)
    c.label(cx + 26, cy - R - 96, t["door"])
    K.tag(c, 80, cy + R + 40, t["sell_need"]["title"], t["sell_need"]["sub"], "left", 32, 20, 400)
    K.tag(c, 1000, cy + R + 40, t["sell_want"]["title"], t["sell_want"]["sub"], "right", 32, 20, 400)
    c.quote(80, cy + R + 200, 920, t["quote"], 32)
    return c
