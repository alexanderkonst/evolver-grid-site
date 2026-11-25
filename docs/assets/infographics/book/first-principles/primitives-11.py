"""primitives-11 · Business and Product. All text comes from primitives-11.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30; cy = y + 230
    c.rings(400, cy, [200], a=(150,)); c.rings(680, cy, [200], a=(150,))
    c.rings(400, cy, [230], a=(45,)); c.rings(680, cy, [230], a=(45,))
    c.star(310, cy - 40, 34, glow=40); c.star(770, cy - 40, 34, glow=40)
    c.ctext(300, cy + 20, t["founders"][0], "serif", 30, K.BRIGHT, 255); c.ctext(300, cy + 58, t["business"], "sans", 18, K.QUIET, 230, maxw=200)
    c.ctext(780, cy + 20, t["founders"][1], "serif", 30, K.BRIGHT, 255); c.ctext(780, cy + 58, t["business"], "sans", 18, K.QUIET, 230, maxw=200)
    # lens where the circles overlap = the product
    d, r = 280, 200
    a = math.degrees(math.acos((d/2)/r))
    lens = K.arc_pts(400, cy, r, -a, a, 30) + K.arc_pts(680, cy, r, 180 - a, 180 + a, 30)
    c.iri_poly(lens, 85, outline=230, w=3)
    c.orb(540, cy, 34, glow=80)
    c.ctext(540, cy + 52, t["product"], "sansm", 22, K.BRIGHT, 255)
    c.quote(80, cy + 300, 920, t["quote"], 30)
    return c
