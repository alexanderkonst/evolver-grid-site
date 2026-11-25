"""III.02 · Which Program to Offer. All text comes from III.02.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 55
    xs = [190, 540, 890]
    cy = y + 230
    for i, (x, s) in enumerate(zip(xs, t["stages"])):
        c.ctext(x, y, s["ask"], "serif", 30, K.BRIGHT, 255, maxw=290, lh=1.1)
        if i == 2:
            c.iri_disc(x, cy, 70, 150)
        else:
            c.rings(x, cy, [70], a=(170,), dashed=(i == 0))
        c.ctext(x, cy + 100, s["program"], "sansm", 30, K.INK, 245, maxw=300)
    for a, b in [(xs[0] + 85, xs[1] - 85), (xs[1] + 85, xs[2] - 85)]:
        c.ln([(a, cy), (b, cy)], K.SILVER, 200, 2)
        K.head(c, [(a, cy), ((a + b) / 2, cy), (b, cy)], K.SILVER, 220, 12)
    return c
