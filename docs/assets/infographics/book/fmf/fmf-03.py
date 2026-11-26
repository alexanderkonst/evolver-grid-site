"""fmf-03 · Six Traps (1/2). All text comes from fmf-03.card.yaml."""
from kit import vocab as K


def arrow(c, a, b, col=K.SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); K.head(c, [a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), b], col, al + 20, 12)


def build(spec):
    t = spec.text
    c = K.card(spec)
    y0 = c.body_top + 20
    for i, r in enumerate(t["rows"]):
        y = y0 + 250 * i
        c.prism(120, y + 60, i + 1, r=22)
        K.name(c, 180, y, r["trap"], "left", 34, color=K.BLUSH, maxw=290)
        if r.get("sub"):
            c.text(180, y + 84, r["sub"], "sans", 22, K.QUIET, 230, maxw=290)
        arrow(c, (490, y + 50), (560, y + 50))
        c.text(590, y + 12, r["exit"], "sans", 28, K.MOON, 235, maxw=410, lh=1.3)
        if i < 2:
            c.ln([(80, y + 205), (1000, y + 205)], K.SILVER, 40, 1)
    return c
