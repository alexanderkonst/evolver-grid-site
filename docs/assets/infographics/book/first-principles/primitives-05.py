"""primitives-05 · Tribe and Transition. All text comes from primitives-05.card.yaml."""
import math

from kit import vocab as K


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 30
    # tribe: lights drawn toward the myth (left), then a passage A -> B (right)
    mx, my = 200, y + 170
    c.rings(mx, my, [60, 95, 130], a=(110, 70, 45))
    c.star(mx, my, 40, glow=60)
    import random
    rnd = random.Random(5)
    for i in range(14):
        ang = rnd.uniform(-1.1, 1.1); rr = rnd.uniform(150, 300)
        c.dot(mx + rr*math.cos(ang), my + rr*math.sin(ang)*0.6, 4, K.INK, 230, glow=50)
    K.tag(c, mx - 120, my + 160, t["tribe"]["title"], t["tribe"]["sub"], "left", 34, 20, 300)
    # passage
    ax, bx, py = 560, 960, y + 170
    c.ln([(ax, py), (bx, py)], K.SILVER, 120, 2)
    c.iri_path([(ax, py), (ax + (bx-ax)*0.55, py)], 6, 230)
    c.orb(ax, py, 18, glow=40); c.orb(bx, py, 24, glow=70)
    c.dot(ax + (bx-ax)*0.55, py, 7, K.INK, 255, glow=90)
    c.text(ax, py - 52, t["a"], "serif", 30, K.MOON, 230, align="center"); c.text(bx, py - 58, t["b"], "serif", 30, K.BRIGHT, 255, align="center")
    K.tag(c, bx, py + 50, t["transition"]["title"], t["transition"]["sub"], "right", 34, 20, 380)
    # cost of inaction: a curve that grows with time
    gx, gy, gw, gh = 140, y + 500, 820, 200
    c.ln([(gx, gy), (gx, gy + gh), (gx + gw, gy + gh)], K.SILVER, 140, 1.6)
    pts = [(gx + gw*tt, gy + gh - gh*0.92*(tt**2.2)) for tt in [i/80 for i in range(81)]]
    c.iri_path(pts, 5, 230)
    c.label(gx + gw, gy + gh + 14, t["axis"], "right")
    c.text(gx + 24, gy, t["cost"]["title"], "serif", 34, K.BRIGHT, 255)
    c.text(gx + 24, gy + 42, t["cost"]["sub"], "sans", 20, K.MOON, 215)
    c.quote(80, gy + gh + 80, 920, t["quote"], 32)
    return c
