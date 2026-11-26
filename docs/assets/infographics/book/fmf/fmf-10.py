"""fmf-10 · Radical Simplification of Business. All text comes from fmf-10.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 260
    for cx, side, step in ((300, t["left"], 44), (770, t["right"], 38)):
        radii = [72 + step * i for i in range(len(side["rings"]))]
        c.rings(cx, cy, radii, a=(150, 120, 100, 85, 70))
        c.iri_ring(cx, cy, radii[-1], 4, 210)
        c.orb(cx, cy, 46, glow=70)
        with c.labels():
            c.ctext(cx, cy - 16, side["centre"], "serif", 30, K.DARK, 255, maxw=90)
            for r, s in zip(radii, side["rings"]):
                c.ctext(cx, cy - r + 9, s, "sans", 19, K.INK, 235, maxw=200)
    return c
