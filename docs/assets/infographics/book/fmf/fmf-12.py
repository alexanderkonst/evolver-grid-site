"""fmf-12 · Six Traps (1/2). All text comes from fmf-12.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y0, step = c.body_top + 20, 230
    for i, row in enumerate(t["rows"]):
        y = y0 + i * step
        if i:
            c.ln([(80, y - 40), (1000, y - 40)], K.QUIET, 70, 1.2)
        # the trap: a broken ring
        c.rings(150, y + 52, [34], a=(120,), dashed=True)
        K.name(c, 210, y + 4, row["trap"], "left", size=44, maxw=300)
        if row["tag"]:
            K.note(c, 210, y + 4 + 100, row["tag"], "left", size=28, maxw=300)
        # the exit: a whole ring and the way out
        c.arrow(520, y + 52, 566, y + 52, K.SILVER, 210, 2.4, head=12)
        c.text(600, y + 14, row["exit"], "sans", 29, K.MOON, 235, maxw=400, lh=1.28)
    return c
