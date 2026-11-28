"""B02 · Life energy is received, not only generated. All text comes from B02.card.yaml (labels are in spec.text; lint counts them apart)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import vocab as K  # noqa: E402
import photo_figure as P  # noqa: E402

PHOTO = (928, 1152)
COLUMN, BELLY, GROUND = (465, 120), (462, 770), (462, 985)    # where the tags point, in photo px


def build(spec):
    t = spec.text
    c = K.card(spec)
    P.attribution(c, t["attribution"])
    cx, cy, width = 540, 802, 640
    x0, y0, sc = P.place(c, spec, t["photo"], cx, cy, width, fade=(0.80, 1.0), power=4)
    at = lambda p: (x0 + p[0] * sc, y0 + p[1] * sc)
    hx, hy = at(BELLY)
    colx, coly = at(COLUMN)
    gx, gy = at(GROUND)
    with c.labels():
        # Heaven by the light column (it comes down), Hara by the belly glow, Earth by the ground (it comes up)
        K.tag(c, colx + 62, coly - 22, t["heaven"], align="left", tsize=36, maxw=240)
        c.ln([(colx + 18, coly), (colx + 54, coly)], K.SILVER, 170, 1.6)
        c.orb(hx, hy, 9, glow=0)
        c.ln([(hx + 16, hy), (hx + 150, hy)], K.SILVER, 190, 1.6)
        K.tag(c, hx + 164, hy - 22, t["hara"], align="left", tsize=40, maxw=200)
        K.tag(c, gx + 62, gy - 22, t["earth"], align="left", tsize=36, maxw=240)
        c.ln([(gx + 18, gy), (gx + 54, gy)], K.SILVER, 170, 1.6)
    return c
