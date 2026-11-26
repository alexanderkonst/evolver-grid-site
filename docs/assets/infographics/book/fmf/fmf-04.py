"""fmf-04 · Inner Growth Is the Highest Leverage. All text comes from fmf-04.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    x = 230
    ys = [c.body_top + 70, c.body_top + 330, c.body_top + 590]
    # 1 inner growth: a small light
    c.orb(x, ys[0], 40, glow=50, seed=2)
    # 2 hero's journey: a wider, dashed orbit around the light
    c.rings(x, ys[1], [96, 70], a=(110, 90), dashed=True)
    c.orb(x, ys[1], 44, glow=50, seed=3)
    # 3 intentional: the star, aimed
    c.star(x, ys[2], 58, glow=70)
    c.arrow(x, ys[0] + 56, x, ys[1] - 110, K.SILVER, 210, 2.4, head=13)
    c.arrow(x, ys[1] + 110, x, ys[2] - 72, K.SILVER, 210, 2.4, head=13)
    K.note(c, x + 26, (ys[0] + ys[1]) / 2 - 36, t["link"], "left", size=34, maxw=200)
    for y, s in zip(ys, t["nodes"]):
        K.name(c, x + 150, y - 30, s, "left", size=58, maxw=620)
    return c
