"""ideal-client-04 · Take Them to the Next Village. All text comes from ideal-client-04.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 200
    c.wave(80, y + 90, 920, 8, 5, c=K.QUIET, a=120, wd=1.6)
    c.wave(80, y + 120, 920, 6, 6, phase=1, c=K.QUIET, a=90, wd=1.4)
    c.orb(170, y, 58); c.ctext(170, y + 150, t["pier"]["title"], "serif", 30, K.BRIGHT, 255)
    c.ctext(170, y + 192, t["pier"]["sub"], "sans", 20, K.SILVER, 225, maxw=220)
    c.orb(910, y, 62, glow=70); c.ctext(910, y - 20, t["you"], "serif", 30, K.DARK, 255)
    c.ctext(910, y + 150, t["village"]["title"], "serif", 30, K.BRIGHT, 255)
    c.ctext(910, y + 192, t["village"]["sub"], "sans", 20, K.SILVER, 225, maxw=220)
    boat = [(450, y + 70), (630, y + 70), (600, y + 100), (480, y + 100)]
    c.iri_poly(boat, 150)
    arc = [(250 + 580*u, y - 20 - 70*math.sin(math.pi*u)) for u in [i/60 for i in range(61)]]
    c.ln(arc, K.SILVER, 150, 1.8); K.head(c, arc, K.SILVER, 200, 12)
    c.quote(80, y + 300, 920, t["quote"], 30)
    return c
