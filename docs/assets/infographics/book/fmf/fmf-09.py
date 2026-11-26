"""fmf-09 · Founder Academy Dials. All text comes from fmf-09.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    T = c.body_top + 120
    pos = [(230, T), (540, T), (850, T), (385, T + 380), (695, T + 380)]
    for (x, y), (nm, measure) in zip(pos, t["dials"]):
        c.knob(x, y, 70, 0.7)
        K.name(c, x, y + 112, nm, size=38, maxw=290)
        K.note(c, x, y + 160, measure, size=26, color=K.QUIET, maxw=290)
    return c
