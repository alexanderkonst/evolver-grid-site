"""A06 · Spirit. All text comes from A06.card.yaml (the labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 320
    # three meta-abilities meet in one engine
    V = c.tri_split(cx, cy, 220, fill=(0.25, 0.25, 0.25))
    c.rings(cx, cy, [95, 150], a=(80, 50))
    for k, (v, label) in enumerate(zip(V, t["nodes"])):
        c.orb(v[0], v[1], 30, glow=50, seed=k + 1)
        K.name(c, v[0], v[1] - 88 if k == 0 else v[1] + 42, label, size=43)
    c.orb(cx, cy, 66, glow=90)
    with c.labels():
        c.ctext(cx, cy - 22, t["center"], "serif", 38, K.DARK, 255, maxw=120, lh=1.05)
    return c
