"""M02 · The Seed Half. Four phases of the first half, top to bottom. All text from M02.card.yaml."""
import math
from kit import vocab as K

# (illuminated fraction, waxing?) for the four phases of this half
FRAC = [(0.5, False), (0.25, False), (0.0, False), (0.25, True)]
LIT = K.PEARL


def moon(c, x, y, r, f, waxing, lit=LIT):
    """A moon glyph: outline circle, lit part filled. f = lit fraction 0..1."""
    c.circle(x, y, r, K.QUIET, 190, 2)
    if f <= 0:
        return
    sgn = 1 if waxing else -1
    side = [(x + sgn * r * math.cos(math.radians(a)), y + r * math.sin(math.radians(a))) for a in range(-90, 91, 6)]
    k = 1 - 2 * f
    term = [(x + sgn * k * r * math.cos(math.radians(a)), y + r * math.sin(math.radians(a))) for a in range(90, -91, -6)]
    c.poly(side + term, lit, 235, 1.5, fill_a=235, fill_c=lit)


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    n = len(t["phases"])
    step = (1020 - top - 60) / (n - 1)
    x0 = 190
    for k, ph in enumerate(t["phases"]):
        y = top + 60 + k * step
        f, wax = FRAC[k]
        if k:
            c.ln([(x0, y - step + 66), (x0, y - 66)], K.SILVER, 110, 2)
        moon(c, x0, y, 52, f, wax)
        K.name(c, 290, y - 46, ph["name"], "left", size=46, maxw=470)
        K.note(c, 290, y + 8, ph["sub"], "left", size=24, color=K.QUIET, maxw=300)
        K.note(c, 1000, y - 14, ph["act"], "right", size=32, color=K.AQUA, maxw=260)
    K.note(c, 540, 1148, t["label"], size=22, color=K.QUIET)
    return c
