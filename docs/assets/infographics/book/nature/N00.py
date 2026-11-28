"""N00 · Nature, overview. Four nested rhythms around one person. All text from N00.card.yaml."""
import math
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 400
    radii = [135, 218, 302, 386]
    c.rings(cx, cy, radii, a=(120, 95, 75, 55))
    c.iri_ring(cx, cy, radii[-1], 3, 170)
    for k, (r, ring) in enumerate(zip(radii, t["rings"])):
        a = math.radians(-25 + 32 * k)
        c.orb(cx + r * math.cos(a), cy + r * math.sin(a), 13 + 3 * k, glow=40, seed=k + 3)
        ty = cy - r
        K.name(c, cx, ty + 14, ring["name"])
        with c.labels():
            c.ctext(cx, ty + 58, ring["sub"], "sans", 18, K.SILVER, 210, maxw=320)
    c.orb(cx, cy, 42, glow=80)
    with c.labels():
        c.ctext(cx, cy - 19, t["center"], "serif", 34, K.DARK, 255, maxw=100, lh=1.05)
    K.note(c, cx, cy + radii[-1] + 40, t["arc"], size=26)
    return c
