"""fmf-05 · Three Mirrors. All text comes from fmf-05.card.yaml."""
from kit import vocab as K


def arrow(c, a, b, col=K.SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); K.head(c, [a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), b], col, al + 20, 12)


def build(spec):
    t = spec.text
    c = K.card(spec)
    y0 = c.body_top + 90
    for i, (l, r) in enumerate(t["pairs"]):
        y = y0 + 260 * i
        c.iri_box(80, y - 85, 920, 170, 150, 3)
        K.name(c, 420, y - 24, l, "right", 42, maxw=300)
        K.name(c, 660, y - 24, r, "left", 42, maxw=300)
        arrow(c, (452, y - 12), (628, y - 12)); arrow(c, (628, y + 14), (452, y + 14))
    return c
