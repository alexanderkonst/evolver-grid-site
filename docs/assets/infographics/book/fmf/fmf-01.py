"""fmf-01 · Gamified Professional Success. All text comes from fmf-01.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    T, x = c.body_top + 10, 150
    c.box(80, T, 280, 76, t["button"], tsize=32, tkind="serif", fill_a=22, border_a=170, glow=40)
    ys = [T + 190 + 170 * i for i in range(4)]
    c.iri_path([(x, T + 76), (x, T + 120), (x, ys[-1])], 4, 220)
    for y, s in zip(ys, t["steps"]):
        c.orb(x, y, 30, glow=40)
        c.text(x + 70, y - 22, s, "serif", 38, K.BRIGHT, 255, maxw=720, lh=1.1)
    return c
