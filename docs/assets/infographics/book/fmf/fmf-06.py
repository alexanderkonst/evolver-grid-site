"""fmf-06 · The Door Is Your Uniqueness. All text comes from fmf-06.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 280
    # light in: the beam of energy and directed effort
    c.iri_line(90, cy + 10, 394, cy + 10, 4.5, 210)
    c.ln([(90, cy + 10), (394, cy + 10)], K.INK, 200, 1.6)
    # the prism
    tri = [(470, cy - 130), (350, cy + 90), (590, cy + 90)]
    c.iri_poly(tri, 55, outline=170, w=3)
    c.poly(tri, K.SILVER, 210, 2.4)
    # refracted: three rays spread, then draw together into the crystal
    ex = (545, cy + 2)
    for col, dy in ((K.BLUSH, -110), (K.CHAMP, 2), (K.AQUA, 114)):
        c.ln([ex, (690, cy + dy)], col, 220, 2.2)
        c.ln([(690, cy + dy), (808, cy + 2)], col, 200, 2.2)
    c.star(880, cy + 2, 76, glow=70)
    K.note(c, 242, cy + 40, t["beam"], size=32, maxw=240)
    K.name(c, 470, cy + 90 + 34, t["prism"], size=44, maxw=300)
    K.name(c, 880, cy + 90 + 34, t["crystal"], size=44, maxw=240)
    return c
