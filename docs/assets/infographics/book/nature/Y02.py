"""Y02 · Two Years Turn at Once. Inner warm ring (your year), outer cool ring (the seasons). All text from Y02.card.yaml."""
import math
from kit import vocab as K

DAYS = [(0, 14), (14, 90), (90, 270), (270, 335), (335, 365)]
WARM = [K.CHAMP, K.BLUSH, K.DEEP, K.MOON, K.CHAMP]
COOL = [K.AQUA, K.PEARL, K.LAV, K.QUIET]
OFFSET = 28   # the two years start at different points: they pull apart


def build(spec):
    t = spec.text
    c = K.card(spec)
    top = c.body_top + 20
    cx, cy = 540, (top + 1000) / 2 + 20
    R2 = min(215, (1000 - top) / 2 - 100)
    R1 = R2 - 80
    # outer ring: four seasons, 90 degrees each
    for k, s in enumerate(t["seasons"]):
        a0 = -135 + 90 * k
        c.ln(K.arc_pts(cx, cy, R2, a0 + 1.5, a0 + 88.5), COOL[k], 235, 6)
    # inner ring: five phases of your year, shifted against the seasons
    for k, (d0, d1) in enumerate(DAYS):
        a0 = -90 + OFFSET + d0 / 365 * 360
        a1 = -90 + OFFSET + d1 / 365 * 360
        pts = K.arc_pts(cx, cy, R1, a0 + 1.5, a1 - 1.5)
        if k == 1:
            c.iri_arc(cx, cy, R1, a0 + 1.5, a1 - 1.5, 10, 230)
        else:
            c.ln(pts, WARM[k], 235, 5)
    c.arc_arrow(cx, cy, R2 + 22, -120, -75, K.SILVER, 150, 2)
    c.arc_arrow(cx, cy, R1 - 24, 20, 120, K.SILVER, 150, 2)
    S = t["seasons"]
    K.name(c, cx, cy - R2 - 96, S[0]["name"], size=38)
    K.note(c, cx, cy - R2 - 52, S[0]["sub"], size=21, color=K.QUIET, maxw=220)
    K.name(c, cx + R2 + 34, cy - 30, S[1]["name"], "left", size=38, maxw=200)
    K.note(c, cx + R2 + 34, cy + 14, S[1]["sub"], "left", size=21, color=K.QUIET, maxw=200)
    K.name(c, cx, cy + R2 + 34, S[2]["name"], size=38)
    K.note(c, cx, cy + R2 + 78, S[2]["sub"], size=21, color=K.QUIET, maxw=260)
    K.name(c, cx - R2 - 34, cy - 30, S[3]["name"], "right", size=38, maxw=200)
    K.note(c, cx - R2 - 34, cy + 14, S[3]["sub"], "right", size=21, color=K.QUIET, maxw=200)
    c.orb(cx, cy, 46, glow=70, seed=4)
    with c.labels():
        c.ctext(cx, cy - 22, t["inner"], "serif", 22, K.DARK, 255, maxw=80, lh=1.0)
    K.note(c, cx, cy + 62, t["lead"], size=22, color=K.PEARL)
    K.note(c, 80, 1060, t["notes"][0], "left", size=21, color=K.QUIET, maxw=330)
    K.note(c, 1000, 1060, t["notes"][1], "right", size=21, color=K.QUIET, maxw=300)
    K.note(c, 540, 1148, t["label"], size=22, color=K.QUIET)
    return c
