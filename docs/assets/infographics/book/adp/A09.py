"""A09 · Body. All text comes from A09.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # a wide base under a bright core: vitality on a foundation
    for k, (w, h) in enumerate([(600, 70), (440, 70), (280, 70)]):
        c.iri_box(cx - w / 2, cy + 130 - k * 90, w, h, a=150 + k * 25, width=3)
    c.rings(cx, cy - 150, [60, 100], a=(80, 45))
    c.orb(cx, cy - 150, 38, glow=90)
    c.wave(140, cy + 270, 800, 12, 5, c=K.QUIET, a=150, wd=1.6)   # the signals it sends
    return c
