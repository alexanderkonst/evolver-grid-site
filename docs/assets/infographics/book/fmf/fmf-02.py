"""fmf-02 · The Session Arc. All text comes from fmf-02.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy, R = 540, c.body_top + 520, 410
    angs = [-165, -127, -90, -53, -15]
    pts = [(cx + R * math.cos(math.radians(a)), cy + R * math.sin(math.radians(a))) for a in angs]
    c.iri_arc(cx, cy, R, angs[0], angs[-1], 5, 220)
    inward = [(34, 52), (42, 56), (0, 70), (-42, 56), (-34, 52)]
    for (x, y), (dx, dy), s in zip(pts, inward, t["steps"]):
        c.orb(x, y, 28, glow=40)
        K.name(c, x + dx, y + dy - 6, s, size=30, maxw=170)
    K.note(c, cx, cy - 190, t["side"], size=28)
    c.slider(cx - 170, cy - 110, 340, 0.7)
    return c
