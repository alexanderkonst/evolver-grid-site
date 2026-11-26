"""fmf-01 · Gamified Professional Success. All text comes from fmf-01.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    px = 150                                   # the path runs down this line
    y0 = c.body_top + 20
    # "New Game": the button at the start of the path
    with c.labels():
        c.box(80, y0, 300, 80, t["button"], tsize=36, tkind="serif", fill_a=22, border_a=170, glow=40)
    ys = [y0 + 80 + 130 + i * 150 for i in range(4)]
    radii = [22, 27, 33, 40]
    prev = y0 + 80
    for i, (y, r) in enumerate(zip(ys, radii)):
        c.iri_line(px, prev, px, y - r - 6, 3.5, 200)
        K.head(c, [(px, y - r - 40), (px, y - r - 20), (px, y - r - 6)], K.SILVER, 220, 12)
        if i < 3:
            c.orb(px, y, r, glow=45, seed=i + 2)
        else:
            c.star(px, y, r + 8, glow=60)      # the last step: together
        c.text(px + 78, y - 24, t["steps"][i], "serif", 38, K.BRIGHT, 255, maxw=720, lh=1.1)
        prev = y + r + 8
    return c
