"""primitives-04 · Uniqueness and Myth. All text comes from primitives-04.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30; cx, cy = 540, y + 290
    # coherence field: concentric rings, filings aligning as they get closer
    c.rings(cx, cy, [110, 170, 230, 290], a=(120, 90, 65, 45))
    import random
    rnd = random.Random(4)
    for i in range(140):
        ang = rnd.uniform(0, 2*math.pi); rr = rnd.uniform(130, 300)
        x, yv = cx + rr*math.cos(ang), cy + rr*math.sin(ang)*0.95
        if abs(yv - cy) > 300: continue
        order = max(0.0, 1 - (rr-130)/170)   # near: aligned on the rings; far: random
        th = ang + math.pi/2 + (1-order)*rnd.uniform(-1.5, 1.5)
        L = 9
        c.ln([(x - L*math.cos(th), yv - L*math.sin(th)), (x + L*math.cos(th), yv + L*math.sin(th))], K.INK, 90 + 120*order, 1.6)
    c.orb(cx, cy, 70, glow=90); c.star(cx, cy, 48, glow=0)
    c.label(cx - 300, cy - 300, t["field"])
    K.tag(c, 80, cy + 330, t["uniqueness"]["title"], t["uniqueness"]["sub"], "left", 36, 21, 420)
    K.tag(c, 1000, cy + 330, t["myth"]["title"], t["myth"]["sub"], "right", 36, 21, 420)
    c.quote(80, cy + 470, 920, t["quote"], 32)
    return c
