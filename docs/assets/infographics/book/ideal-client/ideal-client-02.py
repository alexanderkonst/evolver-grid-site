"""ideal-client-02 · Similar, and Different. All text comes from ideal-client-02.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 300
    V = c.tri_split(cx, cy, 210)
    top, right, left = V
    c.orb(top[0], top[1], 22, glow=40); c.orb(right[0], right[1], 22, glow=40); c.iri_disc(left[0], left[1], 26, 190)
    n = t["nodes"]
    K.tag(c, cx, top[1] - 88, n["top"]["title"], n["top"]["sub"], align="center", maxw=300)
    K.tag(c, right[0] + 10, right[1] + 24, n["right"]["title"], n["right"]["sub"], align="center", maxw=260)
    K.tag(c, left[0] - 10, left[1] + 24, n["left"]["title"], n["left"]["sub"], align="center", maxw=260)
    c.quote(80, cy + 300, 920, t["quote"], 30)
    return c
