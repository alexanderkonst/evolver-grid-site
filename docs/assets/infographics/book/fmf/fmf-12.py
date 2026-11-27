"""fmf-12 · The Key Is Its Articulation. All text comes from fmf-12.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    T, cxf = c.body_top + 20, 300
    n = len(t["funnel"])
    widths = [440 - 60 * i for i in range(n + 1)]
    bh = 116
    for i, s in enumerate(t["funnel"]):
        y = T + bh * i
        wt, wb = widths[i], widths[i + 1]
        pts = [(cxf - wt / 2, y), (cxf + wt / 2, y), (cxf + wb / 2, y + bh - 8), (cxf - wb / 2, y + bh - 8)]
        c.iri_poly(pts, 30 + 36 * i, None, 3)
        c.poly(pts, K.SILVER, 150, 1.8)
        K.name(c, cxf, y + bh / 2 - 26, s, size=32, maxw=wt - 40)
    ry, rx = T + bh * n / 2 - 10, 800
    radii = [90, 140, 190]
    c.rings(rx, ry, radii, a=(160, 130, 100))
    c.iri_ring(rx, ry, radii[-1], 4, 210)
    c.orb(rx, ry, 48, glow=60)
    with c.labels():
        c.ctext(rx, ry - 20, t["rings"][0], "serif", 34, K.DARK, 255, maxw=90)
        for r, s in zip(radii, t["rings"][1:]):
            c.ctext(rx, ry - r + 14, s, "sans", 22, K.INK, 240, maxw=150)
    return c
