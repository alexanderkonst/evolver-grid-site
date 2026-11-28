"""N01 · Nothing Is Wrong With You. Three degrees rising, four rhythms below. All text from N01.card.yaml."""
import math
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, top = 540, c.body_top + 20
    # three degrees: a stair of orbs growing in light
    xs = [190, 360, 530]
    ys = [top + 440, top + 270, top + 100]
    rad = [26, 38, 52]
    for k in range(3):
        d = t["degrees"][k]
        if k:
            c.arrow(xs[k - 1] + rad[k - 1] * 0.7, ys[k - 1] - rad[k - 1] * 0.8, xs[k] - rad[k] * 0.8, ys[k] + rad[k] * 0.7, K.SILVER, 170, 2.2)
        c.orb(xs[k], ys[k], rad[k], glow=30 + 30 * k, seed=k + 2)
        c.iri_ring(xs[k], ys[k], rad[k] + 20 + 10 * k, 3, 60 + 60 * k)
        K.note(c, xs[k] + rad[k] + 40, ys[k] - 40, d["n"], "left", size=22, color=K.QUIET)
        K.name(c, xs[k] + rad[k] + 40, ys[k] - 14, d["name"], "left", size=46, maxw=420)
    # four rhythms, slowest to closest
    y0 = top + 690
    x0, x1 = 150, 930
    c.ln([(x0, y0), (x1, y0)], K.SILVER, 120, 2)
    c.arrow(x1 - 40, y0, x1, y0, K.SILVER, 200, 2.2)
    for k, r in enumerate(t["rhythms"]):
        x = x0 + (x1 - x0 - 60) * k / 3
        c.orb(x, y0, 16 + 5 * k, glow=40, seed=k + 8)
        K.name(c, x, y0 + 52, r["name"], size=38)
    K.note(c, x0, y0 - 66, t["from"], "left", size=22, color=K.QUIET)
    K.note(c, x1, y0 - 66, t["to"], "right", size=22, color=K.QUIET)
    K.note(c, cx, 1148, t["label"], size=22, color=K.QUIET)
    return c
