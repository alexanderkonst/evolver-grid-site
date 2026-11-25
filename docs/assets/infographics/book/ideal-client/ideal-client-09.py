"""ideal-client-09 · One Path. All text comes from ideal-client-09.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 270
    pts = list(zip(t["points"], [-90, 30, 150]))
    R = 190
    c.rings(cx, cy, [R], a=(120,), dashed=True)
    for tt, ang in pts:
        x, y = cx + R*math.cos(math.radians(ang)), cy + R*math.sin(math.radians(ang))
        c.orb(x, y, 30, glow=40)
        if ang == -90: c.ctext(x, y - 90, tt, "serif", 30, K.BRIGHT, 255, maxw=360)
        elif ang == 30: c.text(x + 44, y - 18, tt, "serif", 30, K.BRIGHT, 255, maxw=240)
        else: c.rtext(x - 44, y - 18, tt, "serif", 30, K.BRIGHT, 255, maxw=240)
    c.iri_arc(cx, cy, R, -80, 20, 5, 220); c.iri_arc(cx, cy, R, 40, 140, 5, 220); c.iri_arc(cx, cy, R, 160, 260, 5, 220)
    c.ctext(cx, cy - 20, t["center"]["line1"], "sansm", 22, K.INK, 235); c.ctext(cx, cy + 12, t["center"]["line2"], "sans", 20, K.QUIET, 225)
    c.quote(80, cy + 290, 920, t["quote"], 30)
    return c
