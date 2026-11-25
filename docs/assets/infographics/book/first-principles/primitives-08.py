"""primitives-08 · Human Signal First. All text comes from primitives-08.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30
    rws = t["rows"]
    rows = [(rws[0]["title"], rws[0]["sub"], dict(amp=22, freq=3.0, noise=9, seed=2)),
            (rws[1]["title"], rws[1]["sub"], dict(amp=55, freq=3.0, noise=4, seed=3)),
            (rws[2]["title"], rws[2]["sub"], dict(amp=55, freq=3.0, noise=0, seed=4))]
    for i, (tt, d, wv) in enumerate(rows):
        yy = y + i*190
        c.prism(110, yy + 40, i+1, 18)
        c.text(150, yy + 14, tt, "serif", 34, K.BRIGHT, 255)
        c.text(150, yy + 56, d, "sans", 20, K.MOON, 215, maxw=330)
        c.wave(520, yy + 50, 460, wv["amp"], wv["freq"], noise=wv["noise"], seed=wv["seed"], iri=(i == 2), c=K.INK, a=210)
        if i < 2: c.arrow(110, yy + 80, 110, yy + 160, K.SILVER, 150, 2, head=9)
    yy = y + 3*190
    c.text(150, yy + 14, t["none"], "serif", 30, K.MOON, 200)
    c.wave(520, yy + 30, 460, 6, 11, noise=8, seed=9, c=K.QUIET, a=160, wd=1.6)
    c.quote(80, yy + 110, 920, t["quote"], 30)
    return c
