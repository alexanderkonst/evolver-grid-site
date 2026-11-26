"""fmf-11 · The Living Venture Flywheel. All text comes from fmf-11.card.yaml."""
import math

from kit import vocab as K

SIZE, MAXW = 28, 232


def put(c, x, y, s, align):
    """A node's line: a figure label up to 3 words, else the same line set as prose."""
    if len(s.split()) <= 3:
        return K.note(c, x, y, s, align, size=SIZE, maxw=MAXW)
    if align == "right":
        return c.rtext(x, y, s, "sans", SIZE, K.MOON, 225, maxw=MAXW, lh=1.05)
    if align == "center":
        return c.ctext(x, y, s, "sans", SIZE, K.MOON, 225, maxw=MAXW, lh=1.05)
    return c.text(x, y, s, "sans", SIZE, K.MOON, 225, maxw=MAXW, lh=1.05)


def height(c, s, maxw):
    return c.text_h(s, "sans", SIZE, maxw, 1.05)


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy, R, rn = 540, c.body_top + 330, 200, 30
    ang = [-90 + 60 * k for k in range(6)]
    pts = [(cx + R * math.cos(math.radians(a)), cy + R * math.sin(math.radians(a))) for a in ang]
    # the star: two triangles, one for DO and one for BE
    c.poly([pts[0], pts[2], pts[4]], K.SILVER, 120, 1.6)
    c.poly([pts[1], pts[3], pts[5]], K.SILVER, 120, 1.6)
    # the wheel: one arc from each point to the next, clockwise
    for k in range(6):
        c.arc_arrow(cx, cy, R, ang[k] + 17, ang[k] + 60 - 17, K.SILVER, 190, 2.2, head=11)
    c.star(cx, cy, 34, glow=50)
    for k, ((mode, line), (x, y)) in enumerate(zip(t["points"], pts)):
        if mode == "DO":
            c.orb(x, y, rn, glow=50, seed=k + 2)
            K.name(c, x, y - 15, mode, size=26, kind="sans", maxw=60, color=K.DARK)
        else:
            c.circle(x, y, rn, K.SILVER, 230, 2.4, fill_a=26, glow=30)
            K.name(c, x, y - 15, mode, size=26, kind="sans", maxw=60, color=K.BRIGHT)
        if k == 0:
            put(c, x, y - rn - 14 - height(c, line, MAXW), line, "center")
        elif k == 3:
            put(c, x, y + rn + 14, line, "center")
        elif k in (1, 2):
            put(c, x + rn + 18, y - height(c, line, MAXW) / 2, line, "left")
        else:
            put(c, x - rn - 18, y - height(c, line, MAXW) / 2, line, "right")
    return c
