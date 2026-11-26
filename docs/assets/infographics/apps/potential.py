"""Potential: a dim, closed seed -> the same sphere lit, five nodes unfolding on an orbit. No text."""
from kit import icon as I, vocab as K


def build(spec):
    c = I.card(spec)
    with c.side("before"):
        c.ring(I.BEFORE_X, 512, 160, 48, K.QUIET, 150)                     # closed
        c.orb(I.BEFORE_X, 512, 100, tint=(0.42, 0.44, 0.50), glow=0)       # dim seed
    c.chevron()
    with c.side("after"):
        c.ring(I.AFTER_X, 512, 160, 48, K.SILVER, 60)                      # the orbit, open
        c.orb(I.AFTER_X, 512, 100, glow=120)                               # lit
        for k in range(5):
            x, y = I.polar(I.AFTER_X, 512, 160, -90 + 72 * k)
            c.dot(x, y, 30, K.NEON if k == 0 else K.INK, 255, glow=70 if k == 0 else 0)
    return c
