"""B03 · You are a river, not a battery. All text comes from B03.card.yaml (labels are in spec.text; lint counts them apart)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import vocab as K  # noqa: E402
import photo_figure as P  # noqa: E402

ROCKS = [(250, 558), (480, 556), (750, 540)]   # the tops of the left, centre and right rock, in photo px
BATTERY = (228, 1010)                          # below the battery on the bank, in photo px


def build(spec):
    t = spec.text
    c = K.card(spec)
    P.attribution(c, t["attribution"])
    cx, cy, width = 540, 775, 690
    x0, y0, sc = P.place(c, spec, t["photo"], cx, cy, width, fade=(0.80, 1.0), power=4)
    at = lambda p: (x0 + p[0] * sc, y0 + p[1] * sc)
    with c.labels():
        for k, (p, label) in enumerate(zip(ROCKS, t["rocks"])):
            x, y = at(p)
            # left tag runs out to the left of its rock, right tag to the right, centre one is centred: they never touch
            align = ("right", "center", "left")[k]
            tx = x + (16 if align == "right" else -16 if align == "left" else 0)
            K.tag(c, tx, y - 150, label, align=align, tsize=36, maxw=260)
            c.ln([(x, y - 98), (x, y + 6)], K.SILVER, 190, 1.6)
            c.orb(x, y + 14, 8, glow=0)
        bx, by = at(BATTERY)
        K.note(c, bx, by, t["battery"], size=26, color=K.MOON, a=230, maxw=200)
    return c
