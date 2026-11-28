"""B01 · Excitement is your body's compass. All text comes from B01.card.yaml (labels are in spec.text; lint counts them apart)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import vocab as K  # noqa: E402
import photo_figure as P  # noqa: E402

RIBS = (270, 342, 54, 126, 198)          # degrees, 0 = right, clockwise; the top rib points straight up
FLOWER_C, FLOWER_R = (512, 530), 432     # flower centre and rim radius in the 1024 px photo


def build(spec):
    t = spec.text
    c = K.card(spec)
    P.attribution(c, t["attribution"])
    cx, cy = 540, 812
    width = 635
    sc = width / 1024
    # the photo, placed so the flower centre sits at (cx, cy)
    P.place(c, spec, t["photo"], cx + (512 - FLOWER_C[0]) * sc, cy + (512 - FLOWER_C[1]) * sc, width)
    rim = FLOWER_R * sc
    R = rim + 32                           # the steps sit just outside the rim, at the rib tips
    ang = [math.radians(a) for a in RIBS]
    pts = [(cx + R * math.cos(a), cy + R * math.sin(a)) for a in ang]
    # a thin circle with an arrowhead between each pair of nodes, clockwise: 1 > 2 > 3 > 4 > 5 > 1
    for k in range(5):
        a0 = RIBS[k] + 10
        a1 = RIBS[(k + 1) % 5] + (360 if RIBS[(k + 1) % 5] < RIBS[k] else 0) - 10
        c.arc_arrow(cx, cy, R, a0, a1, K.SILVER, 210, 2.4)
    c.iri_ring(cx, cy, R, 1.5, 70)
    for k, (x, y) in enumerate(pts):
        c.orb(x, y, 25, glow=60 if k == 0 else 30, seed=k + 1)
        if k == 0:
            c.iri_ring(x, y, 38, 3, 230)
        with c.labels():
            c.ctext(x, y - 15, str(k + 1), "sansm", 26, K.DARK, 255, maxw=60, lh=1.05)
    # the labels, kit K.tag style, outside the rim: top above, upper sides above and outward, lower ones below
    lab = t["steps"]
    with c.labels():
        K.tag(c, pts[0][0], pts[0][1] - 76, lab[0], align="center", tsize=32, maxw=420)
        K.tag(c, pts[1][0] + 10, pts[1][1] - 102, lab[1], align="left", tsize=30, maxw=165)
        K.tag(c, pts[2][0], pts[2][1] + 38, lab[2], align="center", tsize=30, maxw=240)
        K.tag(c, pts[3][0], pts[3][1] + 38, lab[3], align="center", tsize=30, maxw=240)
        K.tag(c, pts[4][0] - 10, pts[4][1] - 136, lab[4], align="right", tsize=30, maxw=167)
    # You, on the throat of the flower
    c.orb(cx, cy, 42, glow=70)
    with c.labels():
        c.ctext(cx, cy - 22, t["center"], "serif", 44, K.DARK, 255, maxw=100, lh=1.05)
    return c
