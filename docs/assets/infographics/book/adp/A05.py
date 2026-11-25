"""A05 · Balanced Growth. All text comes from A05.card.yaml; the picture is wordless."""
import math

from kit import vocab as K


def build(spec):
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    # five levels rise together; one practice crosses them all
    val, x0, w = 0.72, 140, 800
    top = cy - 200
    for i in range(5):
        c.slider(x0, top + i * 100, w, val)
    c.iri_line(x0 + w * val, top - 40, x0 + w * val, top + 440, 3.5, 200)
    return c
