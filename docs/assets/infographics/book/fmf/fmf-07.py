"""fmf-07 · Inner Growth Is the Highest Leverage. All text comes from fmf-07.card.yaml."""
from kit import vocab as K


def arrow(c, a, b, col=K.SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); K.head(c, [a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), b], col, al + 20, 12)


def build(spec):
    t = spec.text
    c = K.card(spec)
    x, T = 260, c.body_top + 90
    ys = [T, T + 270, T + 540]
    c.orb(x, ys[0], 70, glow=80)
    c.rings(x, ys[1], [64], a=(150,), dashed=True)
    c.iri_arc(x, ys[1], 64, -80, 250, 5, 230)
    c.dot(x, ys[1], 8, K.INK, 240, glow=70)
    c.star(x, ys[2], 62, glow=70)
    for y, s in zip(ys, t["nodes"]):
        K.name(c, x + 130, y - 28, s, "left", 56, maxw=600)
    arrow(c, (x, ys[0] + 84), (x, ys[1] - 80), K.SILVER, 200, 3)
    arrow(c, (x, ys[1] + 80), (x, ys[2] - 76), K.SILVER, 200, 3)
    K.note(c, x + 30, (ys[0] + ys[1]) / 2 - 14, t["link"], "left", 30, K.QUIET, maxw=200)
    return c
