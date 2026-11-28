"""fmf-17 · Metaphysical Basis: Elements and Centres. All text comes from fmf-17.card.yaml."""
import math

from kit import vocab as K


def arrow(c, a, b, col=K.SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); K.head(c, [a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), b], col, al + 20, 12)


def tetra(c, x, y, r=26):
    p = [(x, y - r), (x + r * 0.9, y + r * 0.7), (x - r * 0.9, y + r * 0.7)]
    c.poly(p, K.INK, 220, 2)
    for q in p:
        c.ln([(x, y + r * 0.15), q], K.INK, 150, 1.4)


def cube(c, x, y, r=22):
    o = 11
    a = [(x - r, y - r + o), (x + r - o, y - r + o), (x + r - o, y + r), (x - r, y + r)]
    b = [(x - r + o, y - r), (x + r, y - r), (x + r, y + r - o), (x - r + o, y + r - o)]
    c.poly(a, K.INK, 220, 2)
    c.poly(b, K.INK, 160, 1.6)
    for p, q in zip(a, b):
        c.ln([p, q], K.INK, 160, 1.6)


def octa(c, x, y, r=28):
    t, rr, bt, l = (x, y - r), (x + r * 0.8, y), (x, y + r), (x - r * 0.8, y)
    c.poly([t, rr, bt, l], K.INK, 220, 2)
    c.ln([t, (x + r * 0.25, y + 6), bt], K.INK, 150, 1.4)
    c.ln([l, (x + r * 0.25, y + 6), rr], K.INK, 150, 1.4)


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 290, c.body_top + 330
    cr = t["cross"]
    c.ln([(cx, cy - 200), (cx, cy + 200)], K.SILVER, 150, 2)
    c.ln([(cx - 200, cy), (cx + 200, cy)], K.SILVER, 150, 2)
    sp = [(cx + (3 + 0.85 * k) * math.cos(k * 0.55), cy + (3 + 0.85 * k) * math.sin(k * 0.55)) for k in range(0, 41)]
    c.iri_path(sp, 3.5, 230)
    slots = {"tl": (cx - 100, cy - 160, octa), "tr": (cx + 100, cy - 160, tetra), "bl": (cx - 100, cy + 85, None), "br": (cx + 100, cy + 85, cube)}
    for key, (x, y, glyph) in slots.items():
        nm, solid = cr[key]
        if glyph:
            glyph(c, x, y if key[0] == "t" else y - 36)
        K.name(c, x, y + 28 if key[0] == "t" else y, nm, size=36, maxw=170)
        if solid:
            K.note(c, x, y + 68 if key[0] == "t" else y + 42, solid, size=22, color=K.QUIET, maxw=170)
    arrow(c, (cx - 46, cy + 106), (cx + 46, cy + 106), K.SILVER, 200, 2.4)
    # centres: hexagram
    hx, hy, R = 770, cy, 118
    P = K.hexpts(hx, hy, R, rot=-90)
    c.poly([P[0], P[2], P[4]], K.INK, 210, 2)
    c.poly([P[1], P[3], P[5]], K.LAV, 210, 2)
    for k, (p, nm) in enumerate(zip(P, t["star"])):
        c.dot(p[0], p[1], 7, K.INK, 255, glow=70)
        a = math.radians(-90 + 60 * k)
        co, si = math.cos(a), math.sin(a)
        if k == 0:
            K.name(c, p[0], p[1] - 60, nm, size=36, maxw=150)
        elif k == 3:
            K.name(c, p[0], p[1] + 20, nm, size=36, maxw=150)
        elif co > 0:
            K.name(c, p[0] + 18, p[1] - 20, nm, "left", 36, maxw=100)
        else:
            K.name(c, p[0] - 18, p[1] - 20, nm, "right", 36, maxw=100)
    return c
