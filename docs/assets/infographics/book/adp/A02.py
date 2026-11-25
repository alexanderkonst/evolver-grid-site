"""A02 · Dormant Potential. All text comes from A02.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 330
    # a signal from above reaches the seed; its rings open
    c.star(cx, cy - 250, 34, glow=70)
    K.name(c, cx + 62, cy - 272, t["signal"], "left", size=36)
    c.iri_line(cx, cy - 205, cx, cy - 30, 3, 200)
    c.dot(cx, cy - 118, 4, K.INK, 240, glow=70)
    c.rings(cx, cy + 100, [135, 195, 250], a=(110, 70, 40))
    c.orb(cx, cy + 100, 96, glow=80)
    with c.labels():
        c.ctext(cx, cy + 100 - 34, t["center"], "serif", 33, K.DARK, 255, maxw=150, lh=1.05)
    K.note(c, cx, cy + 100 + 250 + 14, t["ring"])
    return c
