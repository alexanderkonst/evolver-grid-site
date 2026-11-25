"""primitives-09 · Primitive or Noise. All text comes from primitives-09.card.yaml."""
import random

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30
    # left: structure grows from the primitive (1 -> 2 -> 3 -> 6)
    lx = 290
    c.prism(lx, y + 60, 1); c.ln([(lx, y + 80), (lx, y + 110)], K.SILVER, 130, 1.4)
    c.prism(lx, y + 140, 2, 24); c.ln([(lx, y + 165), (lx, y + 190)], K.SILVER, 130, 1.4)
    c.tri_split(lx, y + 260, 60, fill=(0.35, 0.2, 0.1)); c.ln([(lx, y + 300), (lx, y + 330)], K.SILVER, 130, 1.4)
    c.star(lx, y + 420, 80, glow=60)
    # right: tangle
    rnd = random.Random(11)
    rx, ry = 790, y + 260
    pts = [(rx + rnd.uniform(-170, 170), ry + rnd.uniform(-200, 220)) for _ in range(40)]
    c.ln(pts, K.QUIET, 120, 1.3)
    for _ in range(25): c.dot(rx + rnd.uniform(-170, 170), ry + rnd.uniform(-200, 220), 2, K.QUIET, 140, glow=0)
    yy = y + 540
    p, nz = t["primitive"], t["noise"]
    K.tag(c, 80, yy, p["title"], None, "left", 40)
    c.label(80, yy + 48, p["label"], c=K.SILVER)
    for i, it in enumerate(p["items"]):
        c.text(80, yy + 84 + i*36, t["bullet"] + it, "sans", 22, K.BRIGHT, 235, maxw=420)
    K.tag(c, 580, yy, nz["title"], None, "left", 40)
    c.label(580, yy + 48, nz["label"], c=K.QUIET)
    for i, it in enumerate(nz["items"]):
        c.text(580, yy + 84 + i*36, t["bullet"] + it, "sans", 22, K.MOON, 190, maxw=420)
    c.quote(80, yy + 230, 920, t["quote"], 32)
    return c
