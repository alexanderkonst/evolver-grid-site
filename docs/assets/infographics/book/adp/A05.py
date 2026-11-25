"""A05 · Balanced Growth. All text comes from A05.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 320
    # five levels rise together; one practice crosses them all
    val, x0, w = 0.72, 140, 800
    top = cy - 200
    for i, label in enumerate(t["lines"]):
        c.slider(x0, top + i * 100, w, val)
        K.name(c, x0, top + i * 100 - 50, label, "left", size=36)
    bx = x0 + w * val
    c.iri_line(bx, top - 40, bx, top + 440, 3.5, 200)
    y = K.name(c, bx, top + 460, t["bar"]["title"], size=38)
    K.note(c, bx, y + 2, t["bar"]["sub"], maxw=300)
    return c
