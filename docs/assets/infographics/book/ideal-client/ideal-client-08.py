"""ideal-client-08 · The Key Is Inside. All text comes from ideal-client-08.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    S = K.S
    c = K.card(spec)
    y = c.body_top + 30
    rows = list(zip(t["rows"], [(2, 30, 46), (20, 20, 38), (13, 30, 60)]))
    rows = [(n, k, dw, dh) for n, (k, dw, dh) in rows]
    x0 = 330
    for i, (tt, k, dw, dh) in enumerate(rows):
        yy = y + i*96
        c.text(80, yy + dh/2 - 20, tt, "serif", 28, K.QUIET, 230, maxw=240)
        step = (dw + 12) if k > 13 else (dw + 20)
        if k == 20: step = 33
        for j in range(k):
            x = x0 + j*step
            c.poly([(x, yy + dh), (x + dw, yy + dh), (x + dw, yy), (x, yy)], K.QUIET, 120, 1.3)
    c.label(80, y + 300, t["doors"], c=K.QUIET)
    # focal: the self, with the key inside
    cx, cy, R = 540, y + 520, 118
    c.rings(cx, cy, [R + 34, R + 70], a=(110, 60), dashed=True)
    c.orb(cx, cy, R, glow=110, seed=3)
    kc = K.DARK; w = 10
    bx, by, br = cx - 52, cy, 26
    c.d.ellipse([(bx - br)*S, (by - br)*S, (bx + br)*S, (by + br)*S], outline=K.rgba(kc, 255), width=int(w*S))
    c.ln([(bx + br - 2, by), (cx + 72, by)], kc, 255, w)
    c.ln([(cx + 46, by), (cx + 46, by + 26)], kc, 255, w)
    c.ln([(cx + 66, by), (cx + 66, by + 20)], kc, 255, w)
    c.label(cx, cy - R - 120, t["inside"], align="center", c=K.BLUSH, size=18)
    c.ctext(cx, cy + R + 92, t["see"], "serif", 38, K.BRIGHT, 255, maxw=900)
    c.ctext(cx, cy + R + 144, t["then"], "sans", 23, K.SILVER, 230, maxw=900)
    return c
