"""fmf-15 · Clarity, Strategy, Action. All text comes from fmf-15.card.yaml."""
import math

from kit import vocab as K


def arrow(c, a, b, col=K.SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); K.head(c, [a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), b], col, al + 20, 12)


def build(spec):
    t = spec.text
    c = K.card(spec)
    cx, cy, R = 540, c.body_top + 330, 300
    V = [(cx + R * math.cos(math.radians(-90 + 120 * k)), cy + R * math.sin(math.radians(-90 + 120 * k))) for k in range(3)]
    for i in range(3):
        a, b = V[i], V[(i + 1) % 3]
        d = math.hypot(b[0] - a[0], b[1] - a[1])
        u = ((b[0] - a[0]) / d, (b[1] - a[1]) / d)
        arrow(c, (a[0] + u[0] * 60, a[1] + u[1] * 60), (b[0] - u[0] * 60, b[1] - u[1] * 60), K.SILVER, 190, 2.4)
    for (x, y), (num, nm, sub) in zip(V, t["nodes"]):
        c.orb(x, y, 38, glow=60)
        c.ctext(x, y - 22, num, "serif", 44, K.DARK, 255, maxw=60)
    (tx, ty), (rx, ry), (lx, ly) = V
    K.name(c, tx + 70, ty - 22, t["nodes"][0][1], "left", 52, maxw=300)
    K.name(c, rx, ry + 54, t["nodes"][1][1], size=52, maxw=300)
    K.note(c, rx, ry + 116, t["nodes"][1][2], size=30, color=K.QUIET)
    K.name(c, lx, ly + 54, t["nodes"][2][1], size=52, maxw=300)
    K.note(c, cx, cy + 10, t["centre"][0], size=32, maxw=300)
    K.note(c, cx, cy + 52, t["centre"][1], size=32, maxw=300, color=K.QUIET)
    return c
