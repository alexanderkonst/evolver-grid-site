"""noosphere-3 · Most Venture Funds Lose to an Index Fund. All text comes from noosphere-3.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    # BOOK.md lists no caption for this card; the committed card carries the engine line under the title.
    c = K.KitCard(spec.number, spec.total, spec["title"], t["caption"], eyebrow=t.get("eyebrow", K.EYEBROW), skin=spec["skin"])
    y = c.body_top + 10
    cols, r, gap, rg = 10, 19, 64, 50
    x0 = 540 - (cols-1)*gap/2
    for k in range(100):
        cx = x0 + (k % cols)*gap; cy = y + 28 + (k // cols)*rg
        if k < 20: c.orb(cx, cy, r, glow=50); c.iri_ring(cx, cy, r + 4, 3, 220)
        elif k < 38: c.circle(cx, cy, r, K.INK, 230, 2.5, fill_a=40)
        else: c.circle(cx, cy, r, K.QUIET, 90, 1.3)
    yy = y + 28 + 10*rg
    rows = [(d["head"], d["text"]) for d in t["rows"]]
    for i, (h, tt) in enumerate(rows):
        ly = yy + i*46
        if i == 0: c.orb(96, ly + 16, 11, glow=40); c.iri_ring(96, ly + 16, 14, 3, 220)
        elif i == 1: c.circle(96, ly + 16, 11, K.INK, 230, 2.5, fill_a=40)
        else: c.circle(96, ly + 16, 11, K.QUIET, 100, 1.3)
        c.text(124, ly, h, "sansm", 24, K.BRIGHT, 245)
        c.text(245, ly + 2, tt, "sans", 21, K.MOON, 215, maxw=760)
    c.quote(80, yy + 165, 920, t["quote"], 28)
    return c
