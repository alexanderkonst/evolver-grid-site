"""fmf-02 · The Mirror Principle. All text comes from fmf-02.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 300
    L, R = 270, 810
    for k, cx in enumerate((L, R)):
        c.rings(cx, cy, [62, 106, 150], a=(120, 90, 70))
        c.iri_ring(cx, cy, 150, 3, 170)
        c.orb(cx, cy, 36, glow=50, seed=k + 2)
    # Inner <-> Outer: one arrow each way
    c.arrow(L + 170, cy - 26, R - 170, cy - 26, K.SILVER, 210, 2.4, head=13)
    c.arrow(R - 170, cy + 26, L + 170, cy + 26, K.SILVER, 210, 2.4, head=13)
    K.name(c, L, cy - 150 - 70, t["inner"], size=48)
    K.name(c, R, cy - 150 - 70, t["outer"], size=48)
    K.note(c, L, cy + 150 + 34, t["left"], size=34, maxw=300)
    K.note(c, R, cy + 150 + 34, t["right"], size=34, maxw=330)
    return c
