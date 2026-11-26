"""fmf-09 · The Seven Artifacts. All text comes from fmf-09.card.yaml."""
from kit import vocab as K


def sub(c, x, y, s):
    """The meaning of a node: a figure label up to 3 words, else the same line set as prose."""
    if len(s.split()) <= 3:
        return K.note(c, x, y, s, "left", size=28, maxw=440)
    return c.text(x, y, s, "sans", 28, K.MOON, 225, maxw=440, lh=1.05)


def build(spec):
    t = spec.text
    c = K.card(spec)
    x, y0, step = 130, c.body_top + 20, 98
    ys = [y0 + i * step for i in range(7)]
    c.iri_line(x, ys[0], x, ys[-1], 3, 150)
    for i, ((name, meaning), y) in enumerate(zip(t["nodes"], ys)):
        c.orb(x, y, 22, glow=45, seed=i + 2)
        K.name(c, 200, y - 24, name, "left", size=44, maxw=340)
        sub(c, 560, y - 15, meaning)
    return c
