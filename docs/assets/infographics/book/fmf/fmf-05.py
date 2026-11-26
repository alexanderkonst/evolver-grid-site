"""fmf-05 · Radical Simplification of Business. All text comes from fmf-05.card.yaml."""
from kit import vocab as K

STEP = 36


def ring_set(c, cx, cy, labels, seed):
    """Concentric rings, the first label in the centre, each next one in the band of its own ring."""
    radii = [44 + STEP * i for i in range(len(labels))]
    c.rings(cx, cy, radii, a=(130, 110, 90, 80, 70, 60))
    c.iri_ring(cx, cy, radii[-1], 3, 170)
    c.orb(cx, cy, 14, glow=40, seed=seed)
    K.name(c, cx, cy + 22, labels[0], size=26, kind="sans", maxw=84, color=K.BRIGHT)
    for r, s in zip(radii[1:], labels[1:]):
        K.note(c, cx, cy - r + 5, s, size=22, maxw=200)


def build(spec):
    t = spec.text
    c = K.card(spec)
    cy = c.body_top + 300
    ring_set(c, 300, cy, t["you"], 2)
    ring_set(c, 770, cy, t["client"], 3)
    return c
