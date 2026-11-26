"""A09 · Body. All text comes from A09.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 320
    # a wide base under a bright core: vitality on a foundation
    for k, (w, h) in enumerate([(600, 70), (440, 70), (280, 70)]):
        c.iri_box(cx - w / 2, cy + 130 - k * 90, w, h, a=150 + k * 25, width=3)
    K.name(c, cx, cy + 130 + 17, t["steps"], size=36, maxw=560)
    c.rings(cx, cy - 170, [60, 100], a=(80, 45))
    c.orb(cx, cy - 170, 38, glow=90)
    K.name(c, cx + 100 + 22, cy - 170 - 19, t["top"], "left", size=46)
    c.wave(140, cy + 290, 800, 12, 5, c=K.QUIET, a=150, wd=1.6)   # the signals it sends
    y = K.note(c, cx, cy + 290 + 30, t["wave"]["title"], size=34)
    K.note(c, cx, y, t["wave"]["sub"], size=34)
    return c
