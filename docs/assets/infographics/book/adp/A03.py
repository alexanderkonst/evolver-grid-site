"""A03 · Growth Acceleration Cycle. All text comes from A03.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 320
    # three turns of one loop, each larger than the last: the flywheel
    r = 190
    nodes = [(-90, 26), (30, 36), (150, 48)]
    for k, (ang, rad) in enumerate(nodes):
        a = math.radians(ang)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        c.orb(x, y, rad, glow=50, seed=k + 2)
        nxt = nodes[(k + 1) % 3]
        c.arc_arrow(cx, cy, r, ang + 20 + rad * 0.2, nxt[0] + (360 if nxt[0] < ang else 0) - 20 - nxt[1] * 0.2, K.SILVER, 200, 2.4)
        label = t["nodes"][k]
        if k == 0:
            K.name(c, x, y - rad - 54, label, size=46)
        elif k == 1:
            K.name(c, x + rad + 18, y - 19, label, "left", size=46)
        else:
            K.name(c, x - rad - 18, y - 19, label, "right", size=46)
    c.rings(cx, cy, [125], a=(70,))
    K.name(c, cx, cy - 46, t["center"]["title"], size=43)
    K.note(c, cx, cy + 4, t["center"]["sub"], size=27, maxw=230)
    return c
