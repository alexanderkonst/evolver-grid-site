"""Your AI: a dim sphere and scattered, unconnected nodes -> the same nodes linked into a constellation around a lit 'you' sphere. No text."""
from kit import icon as I, vocab as K

NODES = [(-112, -182), (128, -152), (-142, 178), (118, 228)]      # offsets from the centre, before
ORDER = [0, 1, 3, 2, 0]                                           # the constellation, as a closed outline


def build(spec):
    c = I.card(spec)
    with c.side("before"):
        c.orb(I.BEFORE_X, 512, 64, tint=(0.42, 0.44, 0.50), glow=0)
        for dx, dy in NODES:
            c.dot(I.BEFORE_X + dx, 512 + dy - 20, 34, K.QUIET, 190, glow=0)
    c.chevron()
    with c.side("after"):
        pts = [(I.AFTER_X + NODES[k][0], 512 + NODES[k][1]) for k in ORDER]
        c.path(pts, 48, K.SILVER, 120)
        c.orb(I.AFTER_X, 512, 64, glow=110)
        c.dot(I.AFTER_X, 512, 26, K.NEON, 255, glow=60)
        for k in range(4):
            c.dot(pts[k][0], pts[k][1], 36, K.INK, 255, glow=0)
    return c
