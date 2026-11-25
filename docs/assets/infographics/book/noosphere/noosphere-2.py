"""noosphere-2 · The Founder, Replaced. All text comes from noosphere-2.card.yaml."""
from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30
    gx, gy, gw, gh = 150, y + 30, 820, 400
    for v, tick in zip((25, 50, 75, 100), t["ticks"]):
        yv = gy + gh - gh*v/100
        c.line(gx, yv, gx + gw, yv, K.MOON, 30, 1); c.text(gx - 16, yv - 12, tick, "sans", 16, K.QUIET, 230, align="right")
    c.ln([(gx, gy), (gx, gy + gh), (gx + gw, gy + gh)], K.SILVER, 140, 1.6)
    d = t["data"]
    data = [(d[0]["label"], 0.0, 100, d[0]["note"] or None, d[0]["value"]), (d[1]["label"], 0.42, 50, d[1]["note"], d[1]["value"]),
            (d[2]["label"], 0.62, 40, d[2]["note"], d[2]["value"]), (d[3]["label"], 1.0, 25, d[3]["note"], d[3]["value"])]
    pts = [(gx + gw*u, gy + gh - gh*v/100) for _, u, v, _, _ in data]
    smooth = []
    for i in range(len(pts) - 1):
        (x1, y1), (x2, y2) = pts[i], pts[i+1]
        for k in range(20):
            u = k/20; s = u*u*(3 - 2*u)
            smooth.append((x1 + (x2-x1)*u, y1 + (y2-y1)*s))
    smooth.append(pts[-1])
    c.iri_poly(smooth + [(gx + gw, gy + gh), (gx, gy + gh)], 38)
    c.iri_path(smooth, 5, 230)
    for (lab, u, v, note, vlab), (px, py) in zip(data, pts):
        c.orb(px, py, 14, glow=60)
        c.text(px, gy + gh + 14, lab, "sansm", 18, K.SILVER, 230, align="center" if 0 < u < 1 else ("left" if u == 0 else "right"))
        if note:
            c.text(px if u < 1 else px - 10, py - 100, vlab, "serif", 40, K.BRIGHT, 255, align="center" if u < 1 else "right")
            c.text(px if u < 1 else px - 10, py - 56, note, "sans", 18, K.MOON, 220, align="center" if u < 1 else "right")
    c.quote(80, gy + gh + 90, 920, t["quote"], 32)
    return c
