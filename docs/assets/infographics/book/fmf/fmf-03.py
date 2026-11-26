"""fmf-03 · Three Mirrors. All text comes from fmf-03.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y0 = c.body_top + 60
    for i, (a, b) in enumerate(t["pairs"]):
        yy = y0 + i * 210
        # the mirror line, with a light at each end
        c.ln([(540, yy - 80), (540, yy + 80)], K.SILVER, 150, 2)
        c.dot(540, yy - 80, 5, K.INK, 240, glow=60)
        c.dot(540, yy + 80, 5, K.INK, 240, glow=60)
        c.arrow(494, yy - 14, 586, yy - 14, K.SILVER, 200, 2.2, head=11)
        c.arrow(586, yy + 14, 494, yy + 14, K.SILVER, 200, 2.2, head=11)
        K.name(c, 462, yy - 30, a, "right", size=52, maxw=380)
        K.name(c, 618, yy - 30, b, "left", size=52, maxw=380, color=K.SILVER)
    return c
