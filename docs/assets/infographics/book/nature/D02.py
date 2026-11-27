"""D02 · Waves Inside the Day. Four sprints of about 90 minutes, a break between each, one sprint opened up. All text from D02.card.yaml."""
import math
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    x0, w = 80, 920
    n = 4
    per = w / n
    y = top + 190
    amp = 100
    # four sprints: one slow wave each; the fourth is fainter ("three or four")
    for k in range(n):
        c.wave(x0 + per * k, y, per, amp, 1, phase=math.pi / 2, c=K.PEARL if k < 3 else K.QUIET,
               a=235 if k < 3 else 150, wd=3.4 if k < 3 else 2.4, iri=(k == 0), n=80)
    for k in range(n):
        cxk = x0 + per * k + per / 2
        c.dot(cxk, y - amp, 7 if k < 3 else 5, K.BRIGHT if k < 3 else K.QUIET, 255, 90)
        if k < n - 1:
            K.note(c, x0 + per * (k + 1), y + amp + 40, t["rest"], size=22, color=K.QUIET)
    K.name(c, x0 + per / 2, y - amp - 64, t["sprint"], size=34)
    # the ~90 minute bracket over one wave
    by = y + amp + 100
    c.ln([(x0 + 4, by), (x0 + per - 4, by)], K.SILVER, 180, 2)
    c.ln([(x0 + 4, by - 9), (x0 + 4, by + 9)], K.SILVER, 180, 2)
    c.ln([(x0 + per - 4, by - 9), (x0 + per - 4, by + 9)], K.SILVER, 180, 2)
    K.note(c, x0 + per / 2, by + 18, t["cycle"], size=30, color=K.PEARL)
    # inside a sprint: arrive, a long stretch of focus, close
    sy = by + 160
    sw = 700
    sx = 540 - sw / 2
    parts = [(0.0, 0.1), (0.1, 0.9), (0.9, 1.0)]
    tint = [K.AQUA, K.PEARL, K.LAV]
    for (p0, p1), col in zip(parts, tint):
        c.ln([(sx + sw * p0 + 3, sy), (sx + sw * p1 - 3, sy)], col, 240, 10)
    K.note(c, sx, sy + 24, t["parts"][0], "left", size=24, color=K.AQUA, maxw=140)
    K.note(c, 540, sy + 24, t["parts"][1], size=24, color=K.PEARL, maxw=200)
    K.note(c, sx + sw, sy + 24, t["parts"][2], "right", size=24, color=K.LAV, maxw=140)
    # at the bottom of every rhythm: the breath
    by2 = sy + 130
    c.wave(540 - 160, by2, 320, 14, 6, c=K.AQUA, a=220, wd=2.4, n=120)
    K.note(c, 540, by2 + 30, t["breath"], size=24, color=K.QUIET)
    K.note(c, 540, 1148, t["label"], size=22, color=K.QUIET)
    return c
