"""A08 · Emotions. All text comes from A08.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # one slider moves the whole wave: feeling, pain and joy together
    c.wave(140, cy - 70, 800, 80, 2.5, iri=True, wd=2.6)
    c.wave(140, cy + 40, 800, 14, 2.5, c=K.QUIET, a=150, wd=1.6)
    c.slider(140, cy + 190, 800, 0.62)
    return c
