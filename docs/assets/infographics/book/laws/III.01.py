"""III.01 · Three Readinesses Multiply. All text comes from III.01.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30
    X, Wd, split = 100, 800, 0.3          # three 0-10 scales; the low 30% of each is the "not yet" zone
    for i, name in enumerate(t["scales"]):
        yy = y + i * 130
        c.text(X, yy, name, "serif", 34, K.BRIGHT, 255, maxw=880)
        sy = yy + 80
        c.ln([(X, sy), (X + Wd * split, sy)], K.QUIET, 140, 3)
        c.iri_path([(X + Wd * split, sy), (X + Wd, sy)], 5, 240)
        c.text(X, sy + 12, t["low"], "sans", 18, K.QUIET, 230)
        c.text(X + Wd + 9, sy + 12, t["high"], "sans", 18, K.QUIET, 230, align="right")
    c.text(X, y + 3 * 130 + 10, t["not_yet"], "sans", 20, K.BLUSH, 235)
    c.ctext(540, y + 3 * 130 + 60, t["formula"], "serif", 38, K.INK, 255, maxw=900)
    return c
