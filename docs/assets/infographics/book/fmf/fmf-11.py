"""fmf-11 · The Door Is Your Uniqueness. All text comes from fmf-11.card.yaml."""
from kit import vocab as K

COL = [K.LAV, K.AQUA, K.INK, K.CHAMP, K.BLUSH]


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 300
    px, pr = 400, 150
    tri = [(px, cy - pr), (px + pr * 0.866, cy + pr * 0.5), (px - pr * 0.866, cy + pr * 0.5)]
    # beam in on the left face, rays out of the right face, converging into the crystal
    ex, ey = px - pr * 0.433, cy - pr * 0.25
    ox, oy = px + pr * 0.433, cy - pr * 0.25
    c.iri_poly(tri, 60, 200, 3)
    c.poly(tri, K.SILVER, 200, 2)
    c.ln([(80, cy + 70), (ex, ey)], K.INK, 240, 4)
    cxr, crr = 850, 100
    hexp = K.hexpts(cxr, cy, crr, rot=0)
    for col, off in zip(COL, (-120, -60, 0, 60, 120)):
        c.ln([(ox, oy), (ox + 130, cy + off), (cxr - crr, cy)], col, 200, 2.4)
    c.iri_poly(hexp, 90, 220, 3)
    c.poly(hexp, K.SILVER, 210, 2)
    for p in hexp[1:3] + hexp[4:5]:
        c.ln([(cxr, cy), p], K.SILVER, 90, 1.2)
    K.note(c, 80, cy + 100, t["beam"], "left", 26, maxw=230)
    K.name(c, px + 40, cy + pr * 0.5 + 40, t["prism"], size=38, maxw=300)
    K.name(c, cxr, cy + crr + 40, t["crystal"], size=38, maxw=260)
    return c
