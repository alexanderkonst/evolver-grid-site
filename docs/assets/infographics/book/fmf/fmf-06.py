"""fmf-06 · The Mirror Principle. All text comes from fmf-06.card.yaml."""
from kit import vocab as K


def arrow(c, a, b, col=K.SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); K.head(c, [a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), b], col, al + 20, 12)


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 270
    for cx, head, note in ((290, t["left"], t["left_note"]), (790, t["right"], t["right_note"])):
        c.rings(cx, cy, [60, 105, 150, 195], a=(170, 140, 110, 80))
        c.iri_ring(cx, cy, 195, 4, 220)
        c.orb(cx, cy, 34, glow=60)
        K.name(c, cx, cy - 290, head, size=44)
        K.note(c, cx, cy + 240, note, size=32, maxw=330)
    arrow(c, (505, cy - 12), (575, cy - 12)); arrow(c, (575, cy + 14), (505, cy + 14))
    return c
