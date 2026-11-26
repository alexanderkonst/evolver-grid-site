"""fmf-14 · Conscious Entrepreneurship. All text comes from fmf-14.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy = 540, c.body_top + 380
    n = len(t["turns"])
    step, a0 = 102, -90
    r_of = lambda k: 84 + 112 * k / (n - 1)
    # the spiral path through the turns
    pts = []
    for i in range(0, 6 * 60 + 1):
        k = i / 60
        a = math.radians(a0 + step * k)
        r = r_of(k)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    c.iri_path(pts, 4, 210)
    c.orb(cx, cy, 44, glow=60)
    c.ctext(cx, cy - 22, t["centre"], "serif", 40, K.DARK, 255, maxw=60)
    for k, s in enumerate(t["turns"]):
        a = math.radians(a0 + step * k)
        r = r_of(k)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        c.dot(x, y, 9, K.INK, 255, glow=80)
        lx, ly = cx + 290 * math.cos(a), cy + 290 * math.sin(a)
        c.ln([(x + 12 * math.cos(a), y + 12 * math.sin(a)), (lx - 8 * math.cos(a), ly - 8 * math.sin(a))], K.QUIET, 120, 1)
        co, si = math.cos(a), math.sin(a)
        if abs(co) < 0.3:
            yy = ly - 60 if si < 0 else ly + 4
            c.ctext(lx, yy, s, "sans", 26, K.MOON, 240, maxw=300, lh=1.2)
        elif co > 0:
            c.text(lx + 6, ly - 14, s, "sans", 26, K.MOON, 240, maxw=1000 - lx - 8, lh=1.2)
        else:
            c.rtext(lx - 6, ly - 14, s, "sans", 26, K.MOON, 240, maxw=lx - 88, lh=1.2)
    return c
