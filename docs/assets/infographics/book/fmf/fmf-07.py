"""fmf-07 · The Key Is Its Articulation. All text comes from fmf-07.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 300
    # the funnel: five tiers, each narrower than the last
    fx, tier_h, gap = 300, 86, 8
    top = cy - (5 * tier_h + 4 * gap) / 2
    for i, s in enumerate(t["funnel"]):
        wt, wb = 400 - 40 * i, 400 - 40 * (i + 1)
        y = top + i * (tier_h + gap)
        pts = [(fx - wt / 2, y), (fx + wt / 2, y), (fx + wb / 2, y + tier_h), (fx - wb / 2, y + tier_h)]
        if i == 4:
            c.iri_poly(pts, 70, outline=180, w=2.4)
        c.poly(pts, K.SILVER, 170, 2)
        K.note(c, fx, y + tier_h / 2 - 17, s, size=28, maxw=wb - 20, color=K.BRIGHT if i == 4 else K.MOON)
    # the rings: OK on the outside, Genius at the core
    rx = 786
    rad = [56, 102, 148, 194]
    labels = list(reversed(t["rings"]))          # core first
    c.rings(rx, cy, rad, a=(130, 110, 90, 70))
    c.iri_ring(rx, cy, rad[0], 3, 190)
    c.dot(rx, cy + 18, 4, K.INK, 240, glow=60)
    K.name(c, rx, cy - 20, labels[0], size=24, kind="sans", maxw=84, color=K.BRIGHT)
    for r, s in zip(rad[1:], labels[1:]):
        K.note(c, rx, cy - r + 9, s, size=26, maxw=160)
    return c
