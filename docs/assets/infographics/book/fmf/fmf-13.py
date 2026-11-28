"""fmf-13 · The Waterfall. All text comes from fmf-13.card.yaml."""
from kit import vocab as K


def arrow(c, a, b, col=K.SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); K.head(c, [a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), b], col, al + 20, 12)


def build(spec):
    t = spec.text
    c = K.card(spec)
    T, bw, bh, gap, dx = c.body_top + 10, 300, 84, 52, 140
    n = len(t["steps"])
    for i, s in enumerate(t["steps"]):
        x, y = 90 + dx * i, T + (bh + gap) * i
        c.box(x, y, bw, bh, fill_a=20 + 6 * i, border_a=150, glow=30 if i == n - 1 else 0)
        K.name(c, x + bw / 2, y + bh / 2 - 22, s, size=42, maxw=bw - 30)
        if i < n - 1:
            ax = x + bw - 56
            c.iri_line(ax, y + bh, ax, y + bh + gap, 5, 200)
            K.head(c, [(ax, y + bh), (ax, y + bh + gap / 2), (ax, y + bh + gap)], K.SILVER, 220, 12)
    c.quote(80, T + 4 * (bh + gap) - 80, 420, t["note"], 28)
    return c
