"""fmf-08 · The Waterfall. All text comes from fmf-08.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    x0, dx, step = 150, 56, 104
    y0 = c.body_top + 30
    prev = None
    for i, s in enumerate(t["steps"]):
        x, y = x0 + i * dx, y0 + i * step
        r = 30 - i * 3
        if prev:
            px, py, pr = prev
            pts = [(px, py + pr + 6), (px, y), (x - r - 8, y)]
            c.ln(pts, K.SILVER, 190, 2.4)
            K.head(c, pts, K.SILVER, 210, 12)
        c.orb(x, y, r, glow=45, seed=i + 2)
        K.name(c, x + r + 26, y - 26, s, "left", size=50, maxw=600)
        prev = (x, y, r)
    c.quote(80, y0 + 4 * step + 90, 920, t["note"], 32)
    return c
