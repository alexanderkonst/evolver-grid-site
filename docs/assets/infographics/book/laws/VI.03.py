"""VI.03 · Seen Change Gets Paid Fairly. All text comes from VI.03.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 230; L, R = 280, 800
    c.orb(L, cy, 90); c.orb(R, cy, 90)
    up = [(L + (R - L) * u, cy - 30 - 110 * math.sin(math.pi * u)) for u in [i / 60 for i in range(61)]]
    dn = [(R - (R - L) * u, cy + 30 + 110 * math.sin(math.pi * u)) for u in [i / 60 for i in range(61)]]
    c.iri_path(up[8:-8], 5, 230); K.head(c, up[8:-8], K.INK, 240, 14)
    c.ln(dn[8:-8], K.SILVER, 170, 2.2); K.head(c, dn[8:-8], K.SILVER, 200, 12)
    c.ctext(540, cy - 190, t["between_up"], "sansm", 22, K.SILVER, 230, maxw=420)
    c.ctext(540, cy + 165, t["between_down"], "sans", 22, K.QUIET, 235, maxw=520)
    c.ctext(L, cy - 16, t["left"], "serif", 32, K.DARK, 255); c.ctext(R, cy - 16, t["right"], "serif", 32, K.DARK, 255)
    return c
