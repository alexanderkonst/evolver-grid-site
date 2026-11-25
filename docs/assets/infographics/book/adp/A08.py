"""A08 · Emotions. All text comes from A08.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 320
    # one slider moves the whole wave: feeling, pain and joy together
    x0, w, amp, freq, wy = 140, 800, 80, 2.5, cy - 110
    c.wave(x0, wy, w, amp, freq, 0, iri=True, wd=2.6)
    for k in range(3):    # peaks of sin(2*pi*freq*t): t = (0.25 + k) / freq
        px = x0 + w * (0.25 + k) / freq
        K.name(c, px, wy - amp - 62, t["peak"], size=41, maxw=140)
    for k in range(2):    # troughs: t = (0.75 + k) / freq
        px = x0 + w * (0.75 + k) / freq
        K.name(c, px, wy + amp + 14, t["trough"], size=41, maxw=140)
    sy, val = cy + 150, 0.62
    c.slider(x0, sy, w, val)
    K.note(c, x0, sy - 46, t["ends"]["left"], "left", size=34)
    K.note(c, x0 + w, sy - 46, t["ends"]["right"], "right", size=34)
    K.note(c, x0 + w * val, sy + 28, t["knob"], size=31)
    with c.labels():
        c.quote(80, sy + 110, 920, t["note"], 34)
    return c
