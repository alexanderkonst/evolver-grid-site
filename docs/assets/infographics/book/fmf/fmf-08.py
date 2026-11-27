"""fmf-08 · The Seven Artifacts. All text comes from fmf-08.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    T, x = c.body_top + 10, 120
    ys = [T + 106 * i for i in range(7)]
    c.iri_path([(x, ys[0]), (x, ys[-1])], 3, 170)
    for i, (y, (nm, sub)) in enumerate(zip(ys, t["items"])):
        c.dot(x, y + 20, 20, K.INK if i else K.BRIGHT, 255, glow=60)
        c.ctext(x, y + 4, str(i + 1), "sansm", 20, K.DARK, 255, maxw=40)
        K.name(c, x + 60, y - 6, nm, "left", 42, maxw=420)
        c.text(x + 60, y + 44, sub, "sans", 24, K.QUIET, 235, maxw=700)
    return c
