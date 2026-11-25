"""ideal-client-03 · Three Kinds of Marketing. All text comes from ideal-client-03.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30; xs = [190, 540, 890]
    cols = [(d["title"], d["line"], d["detail"]) for d in t["columns"]]
    for i, (x, (tt, a, b)) in enumerate(zip(xs, cols)):
        if i == 2: c.iri_disc(x, y + 80, 62, 150)
        else: c.orb(x, y + 80, 62)
        c.ctext(x, y + 180, tt, "serif", 40, K.BRIGHT, 255, maxw=300)
        c.ctext(x, y + 245, a, "sansm", 23, K.INK, 240, maxw=290)
        c.ctext(x, y + 330, b, "sans", 21, K.SILVER, 225, maxw=280)
    lab = [d["label"] for d in t["columns"]]
    c.label(190, y + 470, lab[0], align="center"); c.label(540, y + 470, lab[1], align="center"); c.label(890, y + 470, lab[2], align="center", c=K.BLUSH)
    return c
