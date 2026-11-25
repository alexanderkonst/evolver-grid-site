"""Fixture: overflowing text, an extra accent element, an off-palette colour, text below the minimum size."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 40
    c.text(80, y, t["overflow"], "sans", 24, K.BRIGHT, maxw=300)             # one unbreakable word wider than maxw
    c.text(80, y + 80, t["second_accent"], "sansm", 28, K.NEON)              # the title already spends the accent
    c.text(80, y + 160, t["off_palette"], "sans", 28, (255, 0, 0))           # not in the v4 palette
    c.text(80, y + 240, t["too_small"], "sans", 12, K.MOON)                  # below 16 px
    return c
