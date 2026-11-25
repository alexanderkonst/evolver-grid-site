"""primitives-12 · One Product, One Button. All text comes from primitives-12.card.yaml."""
import math
import random

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top
    # left: a wobbling tower of mismatched, guessed features
    rnd = random.Random(12)
    bx, base = 270, y + 470
    yy = base; drift = 0
    for i in range(8):
        w = rnd.uniform(90, 190) * (1 - i*0.05); h = rnd.uniform(34, 52)
        drift += rnd.uniform(-22, 22)
        ang = rnd.uniform(-0.12, 0.12) * (1 + i*0.15)
        cx, cy = bx + drift, yy - h/2
        pts = [(cx + px*math.cos(ang) - py*math.sin(ang), cy + px*math.sin(ang) + py*math.cos(ang))
               for px, py in [(-w/2, -h/2), (w/2, -h/2), (w/2, h/2), (-w/2, h/2)]]
        kind = i % 4
        c.poly(pts, K.SILVER if kind != 2 else K.QUIET, 170, 1.6, fill_a=10 + 6*(i % 2))
        if kind == 1: c.prism(cx, cy, 3, h*0.32, K.QUIET, 200, 1.3)
        elif kind == 3: c.circle(cx, cy, h*0.22, K.QUIET, 200, 1.3)
        elif kind == 2: c.ln([(cx - w*0.3, cy), (cx + w*0.3, cy)], K.QUIET, 180, 1.3)
        yy -= h + 2
    top = yy
    c.ln([(bx - 190, base + 2), (bx + 190, base + 2)], K.SILVER, 100, 1.4)
    c.text(80, top - 96, t["maybe"], "serifi", 25, K.MOON, 220)
    c.text(250, top - 56, t["more"], "serifi", 25, K.MOON, 220)
    # right: one beam to one result
    tx, ty = 790, top - 60
    oy = base - 70
    c.gd.polygon([((tx - 14)*K.S, ty*K.S), ((tx + 14)*K.S, ty*K.S), ((tx + 40)*K.S, (oy - 60)*K.S), ((tx - 40)*K.S, (oy - 60)*K.S)], fill=K.rgba(K.GLOW, 70))
    c.iri_poly([(tx - 5, ty), (tx + 5, ty), (tx + 12, oy - 76), (tx - 12, oy - 76)], 230)
    c.rings(tx, oy, [96, 120], a=(90, 50))
    c.orb(tx, oy, 70, glow=90)
    yt = base + 50
    K.tag(c, 80, yt, t["pile"]["title"], t["pile"]["sub"], "left", 34, 21, 400)
    K.tag(c, 1000, yt, t["one"]["title"], t["one"]["sub"], "right", 34, 21, 400)
    c.quote(80, yt + 160, 920, t["quote"], 30)
    return c
