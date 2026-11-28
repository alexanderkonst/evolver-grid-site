"""O01 · Read Your Now. All four rings lit around You; four answers, one action, then the watch. All text from O01.card.yaml."""
import math
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    radii = [110, 185, 260, 335]
    R = radii[-1]
    cx = 540
    cy = top + 100 + R - 30           # rings' top label sits above the top ring's inside edge
    cy = top + R + 2
    c.rings(cx, cy, radii, a=(140, 120, 100, 80))
    c.iri_ring(cx, cy, R, 3, 190)
    for k, (r, ring) in enumerate(zip(radii, t["rings"])):
        a = math.radians(-60 + 25 * k)          # every ring is lit: one bright point each
        c.orb(cx + r * math.cos(a), cy + r * math.sin(a), 14 + 2 * k, glow=60, seed=k + 3)
        K.name(c, cx, cy - r + 6, ring["name"], size=32)
        K.note(c, cx, cy - r + 42, ring["sub"], size=19, color=K.QUIET, maxw=240)
    c.orb(cx, cy, 36, glow=90, seed=2)
    with c.labels():
        c.ctext(cx, cy - 16, t["center"], "serif", 28, K.DARK, 255, maxw=80, lh=1.0)
    # four answers -> one action -> the watch
    y = cy + R + 48
    xs = [190, 540, 890]
    for k, item in enumerate(t["chain"]):
        K.name(c, xs[k], y, item["name"], size=34, maxw=300)
        if item.get("sub"):
            K.note(c, xs[k], y + 42, item["sub"], size=20, color=K.QUIET, maxw=300)
        if k < 2:
            c.arrow(xs[k] + 150 if k == 0 else xs[k] + 110, y + 20, xs[k + 1] - (110 if k == 0 else 130), y + 20, K.SILVER, 180, 2)
    K.note(c, 540, 1148, t["label"], size=22, color=K.QUIET)
    return c
