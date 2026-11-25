"""ideal-client-01 · Your Ideal Client Is You. All text comes from ideal-client-01.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    radii = [250, 205, 160, 115]
    c.rings(cx, cy, radii, a=(70, 100, 130, 160))
    c.orb(cx, cy, 64, glow=70)
    c.ctext(cx, cy - 22, t["you"], "serif", 38, K.DARK, 255)
    for r, s in zip(radii, t["ring_labels"]):
        c.ctext(cx, cy - r + 6, s, "sans", 18, K.QUIET, 230)
    c.ctext(cx, cy + 74, t["ten"], "sansm", 18, K.INK, 235)
    for ang, r in [(-40, 90), (200, 135), (110, 182), (320, 230), (160, 228), (20, 180)]:
        x, y = cx + r*math.cos(math.radians(ang)), cy + r*math.sin(math.radians(ang))
        c.dot(x, y, 6, K.INK, 240, glow=60)
    c.quote(80, cy + 300, 920, t["quote"], 30)
    return c
