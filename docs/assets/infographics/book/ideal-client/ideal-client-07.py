"""ideal-client-07 · Your Method Already Exists. All text comes from ideal-client-07.card.yaml."""
from kit import vocab as K


def arrow(c, a, b, col=K.SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); K.head(c, [a, ((a[0]+b[0])/2, (a[1]+b[1])/2), b], col, al+20, 12)


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 40
    chain = [(d["title"], d["sub"]) for d in t["chain"]]
    for i, (tt, s) in enumerate(chain):
        yy = y + i*130
        if i == 3: c.iri_disc(140, yy + 22, 26, 170)
        else: c.orb(140, yy + 22, 24, glow=30)
        c.text(200, yy, tt, "serif", 34, K.BRIGHT, 255, maxw=760)
        if s: c.text(200, yy + 46, s, "sans", 21, K.SILVER, 225, maxw=760)
        if i < 3: arrow(c, (140, yy + 54), (140, yy + 106), K.QUIET, 170, 1.6)
    c.quote(80, y + 560, 920, t["quote"], 30)
    return c
