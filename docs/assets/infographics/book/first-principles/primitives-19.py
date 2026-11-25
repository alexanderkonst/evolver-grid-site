"""primitives-19 · Find the Primitive. All text comes from primitives-19.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 10
    steps = [(s["title"], s["sub"]) for s in t["steps"]]
    gap = 112
    c.ln([(130, y + 30), (130, y + 30 + 5*gap)], K.SILVER, 90, 1.4)
    c.iri_path([(130, y + 30 + 4*gap), (130, y + 30 + 5*gap)], 4, 220)
    for i, (ti, d) in enumerate(steps):
        yy = y + i*gap
        if i < 5: c.prism(130, yy + 30, i+1, 20)
        else: c.star(130, yy + 30, 34, glow=70)
        c.text(200, yy + 4, f"{i+1:02d}", "sansm", 16, K.QUIET, 230)
        c.text(250, yy, ti, "serif", 34, K.BRIGHT, 255)
        c.text(520, yy + 10, d, "sans", 21, K.MOON, 220, maxw=480)
    return c
