"""primitives-01 · Two Humans. All text comes from primitives-01.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 40; cy = y + 190
    L, R = 300, 780
    c.rings(L, cy, [125, 160], a=(70, 40)); c.rings(R, cy, [125, 160], a=(70, 40))
    c.orb(L, cy, 95); c.orb(R, cy, 95)
    up = [(L + (R - L) * u, cy - 40 - 120 * math.sin(math.pi * u)) for u in [i / 60 for i in range(61)]]
    dn = [(R - (R - L) * u, cy + 40 + 120 * math.sin(math.pi * u)) for u in [i / 60 for i in range(61)]]
    c.iri_path(up[8:-8], 5, 230); K.head(c, up[8:-8], K.INK, 240, 14)
    c.ln(dn[8:-8], K.SILVER, 170, 2.2); K.head(c, dn[8:-8], K.SILVER, 200, 12)
    c.ctext(540, cy - 200, t["gives"], "sansm", 18, K.SILVER, 230)
    c.ctext(540, cy + 172, t["receives"], "sans", 19, K.QUIET, 230, maxw=420)
    c.ctext(L, cy - 16, t["human"], "serif", 36, K.DARK, 255)
    c.ctext(R, cy - 16, t["human"], "serif", 36, K.DARK, 255)
    c.quote(80, cy + 270, 920, t["quote"], 34)
    return c
