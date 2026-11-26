"""fmf-19 · Invitation Architecture. All text comes from fmf-19.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    T, cxf, bh = c.body_top + 10, 365, 112
    n = len(t["stages"])
    widths = [560 - 52 * i for i in range(n + 1)]
    for i, (nm, sub) in enumerate(t["stages"]):
        y = T + bh * i
        wt, wb = widths[i], widths[i + 1]
        pts = [(cxf - wt / 2, y), (cxf + wt / 2, y), (cxf + wb / 2, y + bh - 8), (cxf - wb / 2, y + bh - 8)]
        c.iri_poly(pts, 24 + 26 * i, None, 3)
        c.poly(pts, K.SILVER, 150, 1.8)
        ty = y + (bh - 8) / 2 - (20 if sub and i == 3 else 18)
        if i == 3:
            ty -= 12
        yy = K.name(c, cxf, ty, nm, size=32, maxw=wt - 70)
        if sub:
            c.ctext(cxf, yy + 2, sub, "sans", 20, K.MOON, 230, maxw=wt - 70, lh=1.2)
    # side: timeline with the "Ripe" bracket
    lx = 740
    ty0, ty1 = T + 30, T + 400
    c.iri_path([(lx, ty0), (lx, ty1)], 4, 220)
    for yy in (ty0, T + 130, T + 230, T + 330, ty1):
        c.dot(lx, yy, 6, K.INK, 255, glow=60)
    K.name(c, lx + 28, ty0 - 20, t["timeline"], "left", 32, maxw=240)
    by0, by1 = T + 270, ty1 + 14
    c.ln([(lx + 34, by0), (lx + 50, by0), (lx + 50, by1), (lx + 34, by1)], K.SILVER, 210, 2.4)
    K.name(c, lx + 68, (by0 + by1) / 2 - 20, t["ripe"], "left", 34, maxw=160)
    c.quote(710, T + 480, 290, t["notes"][0], 26)
    c.quote(710, T + 480 + 150, 290, t["notes"][1], 26)
    return c
