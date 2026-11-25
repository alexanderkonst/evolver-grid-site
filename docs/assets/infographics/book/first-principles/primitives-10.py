"""primitives-10 · Two Signals. All text comes from primitives-10.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30
    for k, x0 in enumerate([80, 560]):
        tune = k == 0
        c.text(x0 + 220, y, t["tune"] if tune else t["conflict"], "serif", 36, K.BRIGHT if tune else K.MOON, 255, align="center")
        c.wave(x0 + 20, y + 110, 400, 32, 2.5, 0, K.INK, 210, 2)
        c.wave(x0 + 20, y + 190, 400, 32, 2.5, 0 if tune else math.pi, K.INK if tune else K.QUIET, 190, 2)
        c.text(x0 + 220, y + 240, t["plus"], "sans", 30, K.SILVER, 220, align="center")
        if tune: c.wave(x0 + 20, y + 350, 400, 64, 2.5, 0, iri=True, wd=3)
        else: c.wave(x0 + 20, y + 350, 400, 4, 9, noise=6, seed=3, c=K.QUIET, a=180, wd=1.8)
        c.ln([(x0 + 20, y + 286), (x0 + 420, y + 286)], K.SILVER, 60, 1)
        c.text(x0 + 220, y + 440, t["amplify"] if tune else t["friction"], "sansm", 22, K.BRIGHT if tune else K.MOON, 230, align="center")
    c.ln([(540, y + 60), (540, y + 460)], K.SILVER, 50, 1)
    c.quote(80, y + 520, 920, t["quote"], 32)
    return c
