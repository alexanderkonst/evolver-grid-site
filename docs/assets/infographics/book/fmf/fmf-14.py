"""fmf-14 · Founder Academy Dials. All text comes from fmf-14.card.yaml."""
from kit import vocab as K

VALS = [0.62, 0.8, 0.5, 0.7, 0.58]    # pointer positions are decoration, not data


def build(spec):
    t = spec.text
    c = K.card(spec)
    r = 66
    y1 = c.body_top + 130
    pos = [(200, y1), (540, y1), (880, y1), (370, y1 + 370), (710, y1 + 370)]
    for (x, y), (name, measure), v in zip(pos, t["dials"], VALS):
        c.knob(x, y, r, v)
        K.name(c, x, y + r + 40, name, size=40, maxw=320)
        K.note(c, x, y + r + 40 + 52, measure, size=28, maxw=300, color=K.SILVER)
    return c
