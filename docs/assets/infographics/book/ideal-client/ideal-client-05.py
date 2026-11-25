"""ideal-client-05 · The Delta Is the Product. All text comes from ideal-client-05.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 380; x0 = 120
    steps = 5; w = 168
    for i in range(steps):
        x = x0 + i*w; h = 60 + i*60
        if i in (2, 3): c.iri_poly([(x, y), (x + w - 14, y), (x + w - 14, y - h), (x, y - h)], 70 if i == 2 else 140)
        else: c.poly([(x, y), (x + w - 14, y), (x + w - 14, y - h), (x, y - h)], K.SILVER, 150, 1.6)
    c.ctext(x0 + 2*w + 77, y + 20, t["they_stand"], "sans", 20, K.SILVER, 230, maxw=160)
    c.ctext(x0 + 3*w + 77, y + 20, t["you_stand"], "sansm", 20, K.INK, 240, maxw=160)
    bx = x0 + 3*w - 7
    c.ln([(bx - 70, y - 300), (bx + 70, y - 300)], K.INK, 220, 2)
    c.ctext(bx, y - 360, t["delta"], "serif", 36, K.BRIGHT, 255)
    c.quote(80, y + 120, 920, t["quote"], 30)
    return c
