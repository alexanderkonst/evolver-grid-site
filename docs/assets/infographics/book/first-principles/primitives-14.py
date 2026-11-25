"""primitives-14 · Two Dead Ends. All text comes from primitives-14.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30
    sx, sy = 540, y + 470
    c.orb(sx, sy, 18, glow=40)
    # fork: two paths end at walls
    L = [(sx, sy), (sx - 60, sy - 120), (sx - 200, sy - 220), (sx - 300, sy - 260)]
    R = [(sx, sy), (sx + 60, sy - 120), (sx + 200, sy - 220), (sx + 300, sy - 260)]
    for pth, wx in ((L, sx - 300), (R, sx + 300)):
        c.ln(pth, K.SILVER, 170, 2.2)
        c.ln([(wx, sy - 300), (wx, sy - 220)], K.QUIET, 220, 6)
    # the missing middle way: to the primitive
    c.iri_path([(sx, sy - 20), (sx, sy - 330)], 3, 140)
    c.star(sx, sy - 380, 46, glow=60, a=150)
    c.ctext(sx, sy - 460, t["primitive"], "sansm", 18, K.SILVER, 230)
    K.tag(c, 80, y, t["left"]["title"], t["left"]["sub"], "left", 36, 20, 330)
    for i, it in enumerate(t["left"]["items"]):
        c.text(80, y + 84 + i * 32, it, "sans", 20, K.MOON, 200, maxw=300)
    K.tag(c, 1000, y, t["right"]["title"], t["right"]["sub"], "right", 36, 20, 330)
    for i, it in enumerate(t["right"]["items"]):
        c.rtext(1000, y + 84 + i * 32, it, "sans", 20, K.MOON, 200, maxw=300)
    c.quote(80, sy + 80, 920, t["quote"], 32)
    return c
