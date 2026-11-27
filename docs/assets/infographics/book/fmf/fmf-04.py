"""fmf-04 · Six Traps (2/2). All text comes from fmf-04.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 330
    fx = 840
    ys = [cy - 260, cy, cy + 260]
    for r, y in zip(t["rows"], ys):
        c.prism(110, y + 12, 3, r=16, c=K.BLUSH)
        K.name(c, 160, y - 26, r["trap"], "left", 34, color=K.BLUSH, maxw=400)
        c.text(160, y + 22, r["sub"], "sans", 24, K.MOON, 230, maxw=380)
        c.ln([(570, y + 6), (680, y + 6), (fx - 36, cy)], K.SILVER, 150, 2)
    c.iri_line(fx + 30, cy, 1000, cy, 6, 230)
    c.orb(fx, cy, 34, glow=70)
    K.name(c, 925, cy + 30, t["focus"], size=36, maxw=150)
    return c
