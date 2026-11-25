"""VII.01 · One Transformation, Three Forms. All text comes from VII.01.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    f = t["forms"]
    c.star(cx, cy, 70, glow=80)
    c.ctext(cx, cy + 86, t["centre"], "serif", 30, K.BRIGHT, 255)
    top, right, left = (cx, cy - 229), (cx + 280.5, cy + 135), (cx - 280.5, cy + 135)
    for p in (top, right, left):
        c.prism(p[0], p[1] - (1.5 if p is top else 0), 3, r=30, c=K.INK, a=220, w=2)
    c.ln([(cx, cy - 185), (cx, cy - 91)], K.SILVER, 150, 1.6)
    c.ln([(cx + 79, cy + 46), (773, cy + 112.5)], K.SILVER, 150, 1.6)
    c.ln([(cx - 80, cy + 46), (306, cy + 112.5)], K.SILVER, 150, 1.6)
    # Product: title and sub to the right of the prism
    c.text(top[0] + 50, top[1] - 31, f["top"]["title"], "serif", 32, K.BRIGHT, 255)
    c.text(top[0] + 50, top[1] + 11, f["top"]["sub"], "sans", 22, K.QUIET, 230)
    # Game step, Module: centred under their prisms
    c.ctext(right[0], right[1] + 42, f["right"]["title"], "serif", 32, K.BRIGHT, 255, maxw=260)
    c.ctext(right[0], right[1] + 84.5, f["right"]["sub"], "sans", 22, K.QUIET, 230, maxw=260)
    c.ctext(left[0], left[1] + 42, f["left"]["title"], "serif", 32, K.BRIGHT, 255, maxw=260)
    c.ctext(left[0], left[1] + 84, f["left"]["sub"], "sans", 22, K.QUIET, 230, maxw=260)
    return c
