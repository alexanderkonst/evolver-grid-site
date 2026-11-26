"""fmf-13 · Six Traps (2/2). All text comes from fmf-13.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y0, step = c.body_top + 20, 230
    ys = [y0 + 60 + i * step for i in range(3)]
    fx, fy = 830, ys[1]
    for (name, desc), y in zip(t["traps"], ys):
        K.name(c, 80, y - 70, name, "left", size=44, maxw=470)
        c.text(80, y - 70 + 56, desc, "sans", 29, K.MOON, 235, maxw=470, lh=1.28)
        c.dot(600, y, 6, K.SILVER, 220, glow=40)
        c.ln([(606, y), (fx - 56, fy)], K.SILVER, 170, 2)
    # all three converge into one beam
    c.star(fx, fy, 46, glow=70)
    c.iri_line(fx + 56, fy, 1000, fy, 4, 210)
    K.name(c, fx + 20, fy + 70, t["focus"], size=48, maxw=300)
    return c
