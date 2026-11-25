"""VI.02 · Compared to What You Expected. All text comes from VI.02.card.yaml."""
from kit import vocab as K

RADII = [38, 44, 52, 44, 38]


def build(spec):
    t = spec.text
    # the header's one-line meaning is text.lead (the first half of the Book subtitle); see the spec note
    c = K.KitCard(spec.number, spec.total, spec["title"], t["lead"], eyebrow=t["eyebrow"], skin=spec["skin"])
    y = c.body_top + 20
    xs = [140, 340, 540, 740, 940]
    cy = y + 250
    c.ctext(540, y, t["question"], "serif", 44, K.BRIGHT, 255, maxw=900)
    for i, (x, r, s) in enumerate(zip(xs, RADII, t["scale"])):
        if i == 2:
            c.iri_disc(x, cy, r, 165)
        else:
            c.rings(x, cy, [r], a=(170,))
    c.ln([(xs[0], cy), (xs[-1], cy)], K.QUIET, 120, 2)
    for x, s in zip(xs, t["scale"]):
        c.ctext(x, cy - 24, s["mark"], "serif", 40, K.BRIGHT, 255)
        c.ctext(x, cy + 80, s["label"], "sans", 22, K.SILVER, 240, maxw=240)
    return c
