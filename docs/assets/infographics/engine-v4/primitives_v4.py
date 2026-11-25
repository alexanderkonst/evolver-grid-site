"""Business from first principles, v4 (2026-11-12): richer geometric language + the star mark.
Run: python3 primitives_v4.py [nums...|gains|noos]
Output: build/out-v4/ (public series), build/out-v4/private/ (client cards)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v4lib import *
from moon import S, W, H, MOON, BRIGHT, DEEP, GLOW, rgba

B = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(B, "out-v4"); PRIV = os.path.join(OUT, "private")
os.makedirs(PRIV, exist_ok=True)

# Working name for the guessed-features product (Sasha picks the final one; never "Frankenstein").
FEATURE_PILE = "The Feature Pile"

T = 19
cards = []
def card(fn): cards.append(fn); return fn

def tag(c, x, y, title, sub=None, align="left", tsize=30, ssize=20, maxw=300):
    """Label block next to a diagram node."""
    if align == "center":
        yy = c.ctext(x, y, title, "serif", tsize, BRIGHT, 255, maxw=maxw, lh=1.05)
        if sub: yy = c.ctext(x, yy+4, sub, "sans", ssize, MOON, 215, maxw=maxw)
        return yy
    if align == "right":
        yy = c.rtext(x, y, title, "serif", tsize, BRIGHT, 255, maxw=maxw, lh=1.05)
        if sub: yy = c.rtext(x, yy+4, sub, "sans", ssize, MOON, 215, maxw=maxw)
        return yy
    yy = c.text(x, y, title, "serif", tsize, BRIGHT, 255, maxw=maxw, lh=1.05)
    if sub: yy = c.text(x, yy+4, sub, "sans", ssize, MOON, 215, maxw=maxw, lh=1.3)
    return yy

def arc_pts(cx, cy, r, a0, a1, n=50):
    return [(cx + r*math.cos(math.radians(a0 + (a1-a0)*i/n)), cy + r*math.sin(math.radians(a0 + (a1-a0)*i/n))) for i in range(n+1)]

def head(c, pts, col=SILVER, a=220, size=11):
    (x1, y1), (x2, y2) = pts[-3], pts[-1]
    ang = math.atan2(y2-y1, x2-x1)
    p = [(x2*S, y2*S)] + [((x2 - size*math.cos(ang+s*0.45))*S, (y2 - size*math.sin(ang+s*0.45))*S) for s in (1, -1)]
    c.d.polygon(p, fill=rgba(col, a))

# ---------------------------------------------------------------- 01
@card
def p01(n):
    c = V4(n, T, "Two Humans", "Every business, even deep tech, is a relationship between people.")
    y = c.body_top + 40; cy = y + 190
    L, R = 300, 780
    c.rings(L, cy, [125, 160], a=(70, 40)); c.rings(R, cy, [125, 160], a=(70, 40))
    c.orb(L, cy, 95); c.orb(R, cy, 95)
    # the exchange loop: an upper arc gives, a lower arc returns (a flattened torus)
    up = [(L + (R-L)*t, cy - 40 - 120*math.sin(math.pi*t)) for t in [i/60 for i in range(61)]]
    dn = [(R - (R-L)*t, cy + 40 + 120*math.sin(math.pi*t)) for t in [i/60 for i in range(61)]]
    c.iri_path(up[8:-8], 5, 230); head(c, up[8:-8], INK, 240, 14)
    c.ln(dn[8:-8], SILVER, 170, 2.2); head(c, dn[8:-8], SILVER, 200, 12)
    c.ctext(540, cy - 200, "gives", "sansm", 18, SILVER, 230)
    c.ctext(540, cy + 172, "receives, and restores the balance", "sans", 19, QUIET, 230, maxw=420)
    c.ctext(L, cy - 16, "human", "serif", 36, (20, 24, 36), 255)
    c.ctext(R, cy - 16, "human", "serif", 36, (20, 24, 36), 255)
    c.quote(80, cy + 270, 920, "Remove the humans and it is no longer a business.", 34)
    return c

# ---------------------------------------------------------------- 02
@card
def p02(n):
    c = V4(n, T, "Process, Change, Exchange", "What happens between the two.")
    y = c.body_top + 30; cx, cy, r = 540, y + 330, 230
    V = c.tri_split(cx, cy, r, fill=(0.0, 0.0, 0.32))
    # circulation inside: process -> change -> exchange -> back
    for k in range(3):
        a0 = -90 + 120*k + 20; a1 = a0 + 80
        pts = arc_pts(cx, cy, 72, a0, a1)
        c.ln(pts, SILVER, 170, 2); head(c, pts, SILVER, 210, 10)
    for v in V: c.orb(v[0], v[1], 26, glow=60)
    c.star(cx, cy, 40, glow=40)
    tag(c, V[0][0], V[0][1] - 112, "Process", "how the change is made", "center", 36, 21, 420)
    tag(c, V[1][0] - 60, V[1][1] + 44, "Change", "the result the receiver gets", "left", 36, 21, 290)
    tag(c, V[2][0] + 60, V[2][1] + 44, "Exchange", "the receiver restores the balance: money, and not only money", "right", 36, 21, 300)
    c.quote(80, cy + 300, 920, "One side mostly gives, the other mostly receives.", 32)
    return c

# ---------------------------------------------------------------- 03
@card
def p03(n):
    c = V4(n, T, "The DNA of a Business", "Six cells. Every business that holds has all six.")
    y = c.body_top + 50; cx, cy, R = 540, y + 330, 250
    els = [("Uniqueness", None), ("Myth", None), ("Tribe", None), ("Transition", None),
           ("Transformational Promise", None), ("Tagline", None)]
    Pv = hexpts(cx, cy, R)
    # faint cube-along-diagonal: spokes from centre to every vertex (the source feeds all six)
    for k, p in enumerate(Pv):
        ang = math.atan2(p[1]-cy, p[0]-cx); r0 = 165 if k == 3 else 104
        c.ln([(cx + r0*math.cos(ang), cy + r0*math.sin(ang)), (cx + (R-26)*math.cos(ang), cy + (R-26)*math.sin(ang))], SILVER, 90, 1.4)
    c.poly(Pv, SILVER, 120, 1.6)
    # the order around: iridescent arrows between consecutive cells
    for k in range(6):
        p, q = Pv[k], Pv[(k+1) % 6]
        t0, t1 = 0.2, 0.8
        a = (p[0] + (q[0]-p[0])*t0, p[1] + (q[1]-p[1])*t0); b = (p[0] + (q[0]-p[0])*t1, p[1] + (q[1]-p[1])*t1)
        if k < 5:
            c.iri_path([a, b], 4, 220); head(c, [a, a, b], INK, 230, 13)
    c.star(cx, cy, 92, glow=80)
    c.ctext(cx, cy + 112, "the founder\u2019s uniqueness", "sansm", 18, SILVER, 235, maxw=300)
    c.ctext(cx, cy + 136, "the single source", "sans", 17, QUIET, 230, maxw=300)
    for k, (t, _) in enumerate(els):
        px, py = Pv[k]
        c.orb(px, py, 22, glow=55)
        c.text(px, py - 9, str(k+1), "sansm", 15, (20, 24, 36), 255, align="center")
        if k == 0:   tag(c, px, py - 80, t, None, "center", 34, maxw=360)
        elif k == 3: tag(c, px, py + 36, t, None, "center", 34, maxw=360)
        elif k in (1, 2): tag(c, px + 38, py - 20, t, None, "left", 34, maxw=200)
        else:        tag(c, px - 38, py - (36 if k == 4 else 20), t, None, "right", 34, maxw=200)
    c.quote(80, cy + R + 120, 920, "Six is the core. Everything else grows on top.", 32)
    return c

# ---------------------------------------------------------------- 04
@card
def p04(n):
    c = V4(n, T, "Uniqueness and Myth", "Where the energy comes from, and what it does to the space.")
    y = c.body_top + 30; cx, cy = 540, y + 290
    # coherence field: concentric rings, filings aligning as they get closer
    c.rings(cx, cy, [110, 170, 230, 290], a=(120, 90, 65, 45))
    import random
    rnd = random.Random(4)
    for i in range(140):
        ang = rnd.uniform(0, 2*math.pi); rr = rnd.uniform(130, 300)
        x, yv = cx + rr*math.cos(ang), cy + rr*math.sin(ang)*0.95
        if abs(yv - cy) > 300: continue
        order = max(0.0, 1 - (rr-130)/170)   # near: aligned on the rings; far: random
        th = ang + math.pi/2 + (1-order)*rnd.uniform(-1.5, 1.5)
        L = 9
        c.ln([(x - L*math.cos(th), yv - L*math.sin(th)), (x + L*math.cos(th), yv + L*math.sin(th))], INK, 90 + 120*order, 1.6)
    c.orb(cx, cy, 70, glow=90); c.star(cx, cy, 48, glow=0)
    c.label(cx - 300, cy - 300, "the myth: a field")
    tag(c, 80, cy + 330, "Uniqueness", "the source the energy flows from", "left", 36, 21, 420)
    tag(c, 1000, cy + 330, "Myth", "polarizes people and makes reality more coherent around it", "right", 36, 21, 420)
    c.quote(80, cy + 470, 920, "Not a distortion field. A coherence field.", 32)
    return c

# ---------------------------------------------------------------- 05
@card
def p05(n):
    c = V4(n, T, "Tribe and Transition", "Who the myth calls, and what they are walking through.")
    y = c.body_top + 30
    # tribe: lights drawn toward the myth (left), then a passage A -> B (right)
    mx, my = 200, y + 170
    c.rings(mx, my, [60, 95, 130], a=(110, 70, 45))
    c.star(mx, my, 40, glow=60)
    import random
    rnd = random.Random(5)
    for i in range(14):
        ang = rnd.uniform(-1.1, 1.1); rr = rnd.uniform(150, 300)
        c.dot(mx + rr*math.cos(ang), my + rr*math.sin(ang)*0.6, 4, INK, 230, glow=50)
    tag(c, mx - 120, my + 160, "Tribe", "people who polarize toward the myth", "left", 34, 20, 300)
    # passage
    ax, bx, py = 560, 960, y + 170
    c.ln([(ax, py), (bx, py)], SILVER, 120, 2)
    c.iri_path([(ax, py), (ax + (bx-ax)*0.55, py)], 6, 230)
    c.orb(ax, py, 18, glow=40); c.orb(bx, py, 24, glow=70)
    c.dot(ax + (bx-ax)*0.55, py, 7, INK, 255, glow=90)
    c.text(ax, py - 52, "A", "serif", 30, MOON, 230, align="center"); c.text(bx, py - 58, "B", "serif", 30, BRIGHT, 255, align="center")
    tag(c, bx, py + 50, "Transition", "the passage they are in right now", "right", 34, 20, 380)
    # cost of inaction: a curve that grows with time
    gx, gy, gw, gh = 140, y + 500, 820, 200
    c.ln([(gx, gy), (gx, gy + gh), (gx + gw, gy + gh)], SILVER, 140, 1.6)
    pts = [(gx + gw*t, gy + gh - gh*0.92*(t**2.2)) for t in [i/80 for i in range(81)]]
    c.iri_path(pts, 5, 230)
    c.label(gx + gw, gy + gh + 14, "time standing still", "right")
    c.text(gx + 24, gy, "Cost of inaction", "serif", 34, BRIGHT, 255)
    c.text(gx + 24, gy + 42, "what staying still costs them", "sans", 20, MOON, 215)
    c.quote(80, gy + gh + 80, 920, "No transition, no reason to move.", 32)
    return c

# ---------------------------------------------------------------- 06
@card
def p06(n):
    c = V4(n, T, "Promise Becomes Tagline", "The founder walked further. The promise takes others there.")
    y = c.body_top + 30
    # the founder's path: steps already walked (solid) and offered (iridescent)
    px0, py0 = 120, y + 170
    steps = [(px0 + i*110, py0 + 40*math.sin(i*0.8)) for i in range(8)]
    c.ln(steps[:5], SILVER, 150, 2); c.iri_path(steps[4:], 5, 220)
    for i, s in enumerate(steps):
        if i < 5: c.dot(s[0], s[1], 4, SILVER, 200, glow=0)
        else: c.orb(s[0], s[1], 12, glow=40)
    c.star(steps[4][0], steps[4][1], 30, glow=60)
    c.ctext(steps[4][0], steps[4][1] + 44, "the founder", "sansm", 17, SILVER, 230)
    tag(c, 80, y - 10, "Transformational promise", "the next steps of the path, offered", "left", 34, 21, 600)
    # prism: three rays enter, one beam leaves
    cx, cy = 540, y + 500
    tri = [(cx, cy - 100), (cx + 95, cy + 70), (cx - 95, cy + 70)]
    c.iri_poly(tri, 70, outline=230, w=3)
    rays = [("for whom", -70), ("what change", 0), ("how", 70)]
    for t, dy in rays:
        c.ln([(150, cy + dy*1.4), (cx - 50, cy + 10)], SILVER, 170, 2)
        c.text(150, cy + dy*1.4 - 34, t, "sansm", 20, MOON, 230)
    c.gd.rectangle([(cx + 40)*S, (cy - 4)*S, 1000*S, (cy + 24)*S], fill=rgba(GLOW, 70))
    c.iri_poly([(cx + 50, cy + 2), (990, cy - 6), (990, cy + 26), (cx + 50, cy + 18)], 230)
    c.text(990, cy + 46, "Tagline", "serif", 48, BRIGHT, 255, align="right")
    c.quote(80, cy + 170, 920, "The whole business in one sentence.", 32)
    return c

# ---------------------------------------------------------------- 07
@card
def p07(n):
    c = V4(n, T, "One Signal, Many Formats", "Deck, demo, pitch: the same signal in different clothes.")
    y = c.body_top + 30; cx, cy, R = 540, y + 300, 250
    fm = ["Deck", "Demo", "Elevator pitch", "1-min video", "Networking line", "Product Hunt one-liner"]
    c.rings(cx, cy, [120, 180], a=(90, 60), dashed=True)
    Pv = hexpts(cx, cy, R, rot=-90)
    for k, p in enumerate(Pv):
        c.ln([(cx + 100*math.cos(math.atan2(p[1]-cy, p[0]-cx)), cy + 100*math.sin(math.atan2(p[1]-cy, p[0]-cx))), p], SILVER, 110, 1.6)
        c.prism(p[0], p[1], 6, 20, INK, 220, 1.8)
    c.orb(cx, cy, 88, glow=90); c.star(cx, cy, 60, glow=0)
    c.ctext(cx, cy + 108, "Tagline", "serif", 38, BRIGHT, 255)
    for k, t in enumerate(fm):
        px, py = Pv[k]
        if k == 0: c.ctext(px, py - 64, t, "sansm", 24, BRIGHT, 245, maxw=300)
        elif k == 3: c.ctext(px, py + 34, t, "sansm", 24, BRIGHT, 245, maxw=300)
        elif k in (1, 2): c.text(px + 34, py - 14, t, "sansm", 24, BRIGHT, 245, maxw=200)
        else: c.rtext(px - 34, py - 14, t, "sansm", 24, BRIGHT, 245, maxw=200)
    c.quote(80, cy + R + 100, 920, "Work on one sentence before a whole deck.", 30)
    return c

# ---------------------------------------------------------------- 08
@card
def p08(n):
    c = V4(n, T, "Human Signal First", "AI needs a human signal. Without one, it gives low-signal output.")
    y = c.body_top + 30
    rows = [("Human writes raw", "the first signal, in their own words", dict(amp=22, freq=3.0, noise=9, seed=2)),
            ("AI amplifies", "structure, range, polish", dict(amp=55, freq=3.0, noise=4, seed=3)),
            ("Human polishes", "to the next level", dict(amp=55, freq=3.0, noise=0, seed=4))]
    for i, (t, d, wv) in enumerate(rows):
        yy = y + i*190
        c.prism(110, yy + 40, i+1, 18)
        c.text(150, yy + 14, t, "serif", 34, BRIGHT, 255)
        c.text(150, yy + 56, d, "sans", 20, MOON, 215, maxw=330)
        c.wave(520, yy + 50, 460, wv["amp"], wv["freq"], noise=wv["noise"], seed=wv["seed"], iri=(i == 2), c=INK, a=210)
        if i < 2: c.arrow(110, yy + 80, 110, yy + 160, SILVER, 150, 2, head=9)
    yy = y + 3*190
    c.text(150, yy + 14, "No human signal", "serif", 30, MOON, 200)
    c.wave(520, yy + 30, 460, 6, 11, noise=8, seed=9, c=QUIET, a=160, wd=1.6)
    c.quote(80, yy + 110, 920, "At every stage of building a unique business.", 30)
    return c

# ---------------------------------------------------------------- 09
@card
def p09(n):
    c = V4(n, T, "Primitive or Noise", "Skip the primitive and you start solving with your head.")
    y = c.body_top + 30
    # left: structure grows from the primitive (1 -> 2 -> 3 -> 6)
    lx = 290
    c.prism(lx, y + 60, 1); c.ln([(lx, y + 80), (lx, y + 110)], SILVER, 130, 1.4)
    c.prism(lx, y + 140, 2, 24); c.ln([(lx, y + 165), (lx, y + 190)], SILVER, 130, 1.4)
    c.tri_split(lx, y + 260, 60, fill=(0.35, 0.2, 0.1)); c.ln([(lx, y + 300), (lx, y + 330)], SILVER, 130, 1.4)
    c.star(lx, y + 420, 80, glow=60)
    # right: tangle
    import random
    rnd = random.Random(11)
    rx, ry = 790, y + 260
    pts = [(rx + rnd.uniform(-170, 170), ry + rnd.uniform(-200, 220)) for _ in range(40)]
    c.ln(pts, QUIET, 120, 1.3)
    for _ in range(25): c.dot(rx + rnd.uniform(-170, 170), ry + rnd.uniform(-200, 220), 2, QUIET, 140, glow=0)
    yy = y + 540
    tag(c, 80, yy, "Primitive", None, "left", 40)
    c.label(80, yy + 48, "start here", c=SILVER)
    for i, it in enumerate(["a real story", "progress you can feel", "one clear sentence"]):
        c.text(80, yy + 84 + i*36, "\u2014  " + it, "sans", 22, BRIGHT, 235, maxw=420)
    tag(c, 580, yy, "Noise", None, "left", 40)
    c.label(580, yy + 48, "skip it", c=QUIET)
    for i, it in enumerate(["a puzzle that never solves", "you convince yourself you moved", "no certainty at all"]):
        c.text(580, yy + 84 + i*36, "\u2014  " + it, "sans", 22, MOON, 190, maxw=420)
    c.quote(80, yy + 230, 920, "Begin with what cannot be removed.", 32)
    return c

# ---------------------------------------------------------------- 10
@card
def p10(n):
    c = V4(n, T, "Two Signals", "Co-founders are two signals. They amplify or they collide.")
    y = c.body_top + 30
    for k, x0 in enumerate([80, 560]):
        tune = k == 0
        c.text(x0 + 220, y, "in tune" if tune else "in conflict", "serif", 36, BRIGHT if tune else MOON, 255, align="center")
        c.wave(x0 + 20, y + 110, 400, 32, 2.5, 0, INK, 210, 2)
        c.wave(x0 + 20, y + 190, 400, 32, 2.5, 0 if tune else math.pi, INK if tune else QUIET, 190, 2)
        c.text(x0 + 220, y + 240, "+", "sans", 30, SILVER, 220, align="center")
        if tune: c.wave(x0 + 20, y + 350, 400, 64, 2.5, 0, iri=True, wd=3)
        else: c.wave(x0 + 20, y + 350, 400, 4, 9, noise=6, seed=3, c=QUIET, a=180, wd=1.8)
        c.ln([(x0 + 20, y + 286), (x0 + 420, y + 286)], SILVER, 60, 1)
        c.text(x0 + 220, y + 440, "they amplify" if tune else "friction", "sansm", 22, BRIGHT if tune else MOON, 230, align="center")
    c.ln([(540, y + 60), (540, y + 460)], SILVER, 50, 1)
    c.quote(80, y + 520, 920, "Friction means they want different things.", 32)
    return c

# ---------------------------------------------------------------- 11
@card
def p11(n):
    c = V4(n, T, "Business and Product", "Each founder has a unique business. Together they build one product.")
    y = c.body_top + 30; cy = y + 230
    c.rings(400, cy, [200], a=(150,)); c.rings(680, cy, [200], a=(150,))
    c.rings(400, cy, [230], a=(45,)); c.rings(680, cy, [230], a=(45,))
    c.star(310, cy - 40, 34, glow=40); c.star(770, cy - 40, 34, glow=40)
    c.ctext(300, cy + 20, "founder A", "serif", 30, BRIGHT, 255); c.ctext(300, cy + 58, "a unique business", "sans", 18, QUIET, 230, maxw=200)
    c.ctext(780, cy + 20, "founder B", "serif", 30, BRIGHT, 255); c.ctext(780, cy + 58, "a unique business", "sans", 18, QUIET, 230, maxw=200)
    # lens where the circles overlap = the product
    d, r = 280, 200
    a = math.degrees(math.acos((d/2)/r))
    lens = arc_pts(400, cy, r, -a, a, 30) + arc_pts(680, cy, r, 180 - a, 180 + a, 30)
    c.iri_poly(lens, 85, outline=230, w=3)
    c.orb(540, cy, 34, glow=80)
    c.ctext(540, cy + 52, "the product", "sansm", 22, BRIGHT, 255)
    c.quote(80, cy + 300, 920, "Investors buy a share of the product, not of the founders.", 30)
    return c

# ---------------------------------------------------------------- 12
@card
def p12(n):
    c = V4(n, T, "One Product, One Button", "A business starts with one product. A product is one change.")
    y = c.body_top
    # left: a wobbling tower of mismatched, guessed features
    import random
    rnd = random.Random(12)
    bx, base = 270, y + 470
    yy = base; drift = 0
    for i in range(8):
        w = rnd.uniform(90, 190) * (1 - i*0.05); h = rnd.uniform(34, 52)
        drift += rnd.uniform(-22, 22)
        ang = rnd.uniform(-0.12, 0.12) * (1 + i*0.15)
        cx, cy = bx + drift, yy - h/2
        pts = [(cx + px*math.cos(ang) - py*math.sin(ang), cy + px*math.sin(ang) + py*math.cos(ang))
               for px, py in [(-w/2, -h/2), (w/2, -h/2), (w/2, h/2), (-w/2, h/2)]]
        kind = i % 4
        c.poly(pts, SILVER if kind != 2 else QUIET, 170, 1.6, fill_a=10 + 6*(i % 2))
        if kind == 1: c.prism(cx, cy, 3, h*0.32, QUIET, 200, 1.3)
        elif kind == 3: c.circle(cx, cy, h*0.22, QUIET, 200, 1.3)
        elif kind == 2: c.ln([(cx - w*0.3, cy), (cx + w*0.3, cy)], QUIET, 180, 1.3)
        yy -= h + 2
    top = yy
    c.ln([(bx - 190, base + 2), (bx + 190, base + 2)], SILVER, 100, 1.4)
    c.text(80, top - 96, "\u201cmaybe they\u2019ll like this\u201d", "serifi", 25, MOON, 220)
    c.text(250, top - 56, "\u201cone more feature\u201d", "serifi", 25, MOON, 220)
    # right: one beam to one result
    tx, ty = 790, top - 60
    oy = base - 70
    c.gd.polygon([((tx - 14)*S, ty*S), ((tx + 14)*S, ty*S), ((tx + 40)*S, (oy - 60)*S), ((tx - 40)*S, (oy - 60)*S)], fill=rgba(GLOW, 70))
    c.iri_poly([(tx - 5, ty), (tx + 5, ty), (tx + 12, oy - 76), (tx - 12, oy - 76)], 230)
    c.rings(tx, oy, [96, 120], a=(90, 50))
    c.orb(tx, oy, 70, glow=90)
    yt = base + 50
    tag(c, 80, yt, FEATURE_PILE, "guessed features, stacked; no single change", "left", 34, 21, 400)
    tag(c, 1000, yt, "One product", "one feature, aimed at one transformational result", "right", 34, 21, 400)
    c.quote(80, yt + 160, 920, "A series of products from day one is defocus. Business suicide.", 30)
    return c

# ---------------------------------------------------------------- 13
@card
def p13(n):
    c = V4(n, T, "Start With Who", "A result can't be invented in a vacuum.")
    y = c.body_top + 30; cx, cy = 360, y + 290
    c.rings(cx, cy, [140, 210, 280], a=(150, 110, 75))
    c.orb(cx, cy, 70, glow=80)
    c.ctext(cx, cy - 18, "Who", "serif", 34, (20, 24, 36), 255)
    items = [("1", "Who", "the relationship comes first", 70), ("2", "What change", "the result they actually get", 175), ("3", "How", "the process, last", 245)]
    for i, (num, t, d, rr) in enumerate(items):
        ang = math.radians(-28 + i*28)
        px, py = cx + rr*math.cos(ang), cy + rr*math.sin(ang)
        c.dot(px, py, 6, INK, 255, glow=80)
        ly = y + 120 + i*150
        c.ln([(px + 10, py), (700, ly + 22)], SILVER, 90, 1.2)
        c.prism(690, ly + 22, i+1, 15)
        tag(c, 725, ly, t, d, "left", 34, 20, 280)
    c.iri_arc(cx, cy, 140, -40, 40, 4, 220); c.iri_arc(cx, cy, 210, -40, 40, 3, 160); c.iri_arc(cx, cy, 280, -40, 40, 2, 110)
    c.quote(80, cy + 330, 920, "Customer development: what is it for, and when is it done?", 30)
    return c

# ---------------------------------------------------------------- 14
@card
def p14(n):
    c = V4(n, T, "Two Dead Ends", "The usual way to find demand: guess segments, test, wait for a hit.")
    y = c.body_top + 30
    sx, sy = 540, y + 470
    c.orb(sx, sy, 18, glow=40)
    # fork: two paths end at walls
    L = [(sx, sy), (sx - 60, sy - 120), (sx - 200, sy - 220), (sx - 300, sy - 260)]
    R = [(sx, sy), (sx + 60, sy - 120), (sx + 200, sy - 220), (sx + 300, sy - 260)]
    for pth, wx in ((L, sx - 300), (R, sx + 300)):
        c.ln(pth, SILVER, 170, 2.2)
        c.ln([(wx, sy - 300), (wx, sy - 220)], QUIET, 220, 6)
    # the missing middle way: to the primitive
    c.iri_path([(sx, sy - 20), (sx, sy - 330)], 3, 140)
    c.star(sx, sy - 380, 46, glow=60, a=150)
    c.ctext(sx, sy - 460, "the primitive", "sansm", 18, SILVER, 230)
    tag(c, 80, y, "Manipulate", "cut corners", "left", 36, 20, 330)
    for i, it in enumerate(["manufactured need", "pressure and fear", "impulse buying"]):
        c.text(80, y + 84 + i*32, "\u2014  " + it, "sans", 20, MOON, 200, maxw=300)
    tag(c, 1000, y, "Grind", "brute force", "right", 36, 20, 330)
    for i, it in enumerate(["endless segments", "work like a machine", FEATURE_PILE.lower().replace("the ", "a ")]):
        c.rtext(1000, y + 84 + i*32, it + "  \u2014", "sans", 20, MOON, 200, maxw=300)
    c.quote(80, sy + 80, 920, "Both skip the primitive.", 32)
    return c

# ---------------------------------------------------------------- 15
@card
def p15(n):
    c = V4(n, T, "Equity VC Is a Casino", "Investors who buy shares are placing bets.")
    y = c.body_top + 30; cx, cy = 540, y + 270
    # roulette wheel
    R = 170
    c.rings(cx, cy, [R, R - 40, 60], a=(160, 110, 90))
    for k in range(24):
        a0 = k*15
        if k % 2 == 0:
            c.iri_poly(arc_pts(cx, cy, R, a0, a0 + 15, 6) + arc_pts(cx, cy, R - 40, a0 + 15, a0, 6), 70)
        t = math.radians(a0)
        c.ln([(cx + (R-40)*math.cos(t), cy + (R-40)*math.sin(t)), (cx + R*math.cos(t), cy + R*math.sin(t))], SILVER, 100, 1)
    c.orb(cx, cy, 44, glow=60)
    c.dot(cx + (R - 20)*math.cos(math.radians(-60)), cy + (R - 20)*math.sin(math.radians(-60)), 7, INK, 255, glow=90)
    steps = [("Bet", "we read the market better than others", -90), ("Fuel", "pump the founder with money to go all in", 30), ("Wait", "the bet plays, or it doesn't", 150)]
    for i, (t, d, ang) in enumerate(steps):
        a0 = ang + 25; a1 = ang + 95
        pts = arc_pts(cx, cy, R + 40, a0, a1)
        c.ln(pts, SILVER, 150, 2); head(c, pts, SILVER, 200)
    tag(c, cx, cy - R - 120, "1  Bet", steps[0][1], "center", 32, 20, 520)
    tag(c, cx + R + 30, cy + 130, "2  Fuel", steps[1][1], "left", 32, 20, 260)
    tag(c, cx - R - 30, cy + 130, "3  Wait", steps[2][1], "right", 32, 20, 260)
    c.quote(80, cy + 330, 920, "Some truth in it. And primitives nobody sees.", 30)
    return c

# ---------------------------------------------------------------- 16
def quadrants(c, cx, cy, R, items, lit=None, centre=None):
    """Circle split into 4; items: [(title, desc)] for TL, TR, BL, BR."""
    c.rings(cx, cy, [R], a=(150,))
    c.ln([(cx - R, cy), (cx + R, cy)], SILVER, 130, 1.6); c.ln([(cx, cy - R), (cx, cy + R)], SILVER, 130, 1.6)
    for k, ang in enumerate([180, 270, 90, 0]):
        if lit and lit[k]:
            c.iri_poly([(cx, cy)] + arc_pts(cx, cy, R, ang, ang + 90, 20), int(lit[k]*255))

@card
def p16(n):
    c = V4(n, T, "The Interchangeable Founder", "How the equity game sees the person running the company.")
    y = c.body_top + 30; cx, cy, R = 540, y + 290, 200
    quadrants(c, cx, cy, R, None, lit=(0.10, 0.10, 0.10, 0.10))
    # centre: an empty, dashed founder slot
    c.rings(cx, cy, [56], a=(220,), dashed=True)
    c.ctext(cx, cy - 12, "founder", "sansm", 17, SILVER, 230)
    q = [("Burning", "read as a sign the founder will reach the result"),
         ("Replaceable", "anyone who ticks the same boxes will do"),
         ("Diluted", "the founder's share, as far as possible"),
         ("Not personal", "just business: hard, high-status, burnout")]
    # glyphs inside each quadrant
    c.wave(cx - 170, cy - 70, 110, 22, 2.2, noise=6, seed=1, c=INK, a=200)           # burning: a jagged signal
    for k in range(3): c.circle(cx + 70 + k*34, cy - 70, 13, SILVER, 170, 1.4)       # replaceable: identical slots
    c.slider(cx - 170, cy + 80, 120, 0.18)                                             # diluted: a share slider low
    c.knob(cx + 110, cy + 85, 26, 1.0)                                                 # not personal: turned to max
    tag(c, 80, y - 10, q[0][0], q[0][1], "left", 32, 19, 300)
    tag(c, 1000, y - 10, q[1][0], q[1][1], "right", 32, 19, 300)
    tag(c, 80, cy + R - 20, q[2][0], q[2][1], "left", 32, 19, 300)
    tag(c, 1000, cy + R - 20, q[3][0], q[3][1], "right", 32, 19, 300)
    c.quote(80, cy + R + 140, 920, "A unique business can't swap its founder.", 30)
    return c

# ---------------------------------------------------------------- 17
@card
def p17(n):
    c = V4(n, T, "Sell What They Want", "Give what they need inside it.")
    y = c.body_top + 30; cx, cy, R = 540, y + 270, 220
    # outer shell = the want, with a door opening; inner room = the need
    c.iri_arc(cx, cy, R, 290, 250 + 360, 10, 200)
    c.ln([(cx + R*math.cos(math.radians(250)), cy + R*math.sin(math.radians(250))), (cx + (R-30)*math.cos(math.radians(250)), cy + (R-30)*math.sin(math.radians(250)))], INK, 200, 2)
    c.ln([(cx + R*math.cos(math.radians(290)), cy + R*math.sin(math.radians(290))), (cx + (R-30)*math.cos(math.radians(290)), cy + (R-30)*math.sin(math.radians(290)))], INK, 200, 2)
    pts = [(cx, cy - R - 90), (cx, cy - 110)]
    c.ln(pts, INK, 220, 2.4); head(c, [pts[0], pts[0], pts[1]], INK, 230, 13)
    c.orb(cx, cy, 100, glow=90)
    c.ctext(cx, cy - 24, "the need", "serif", 34, (20, 24, 36), 255)
    c.label(cx + 26, cy - R - 96, "the door: the want")
    tag(c, 80, cy + R + 40, "Sell the need", "they barely notice what they got; the value stays hidden", "left", 32, 20, 400)
    tag(c, 1000, cy + R + 40, "Sell the want", "they get it, and find out it works differently: the real gift shows itself", "right", 32, 20, 400)
    c.quote(80, cy + R + 200, 920, "The want is the door. The need is the room.", 32)
    return c

# ---------------------------------------------------------------- 18
@card
def p18(n):
    c = V4(n, T, "Ready to Receive", "Every tradition that asked this found the same four things.")
    y = c.body_top + 10
    cx, cy = 540, y + 330
    q = [("Hunger", "the pull", "You actually want it.",
          ["Vedanta: mumukshutva", "Christian mystics: burning fervour", "Shamanism: the call", "Mezirow: disorienting dilemma"]),
         ("Emptiness", "the room", "You stopped already knowing.",
          ["Vedanta: vairagya", "Zen: beginner\u2019s mind", "Tao Te Ching: the empty vessel", "Sufism: polishing the heart"]),
         ("Trust", "the opening", "Safe enough to let it in.",
          ["Yoga Sutra: shraddha", "Buddhism: saddha", "Rogers: conditions for change", "Siegel: window of tolerance"]),
         ("Capacity", "the vessel", "Steady enough to hold it.",
          ["Vedanta: the six virtues", "Yoga Sutra & Buddhism: energy, mindfulness, concentration", "Vygotsky: zone of proximal development"])]
    # cross through the centre (the quadrant frame), cup at the crossing
    c.ln([(80, cy), (1000, cy)], SILVER, 70, 1.4); c.ln([(cx, y), (cx, y + 660)], SILVER, 70, 1.4)
    c.rings(cx, cy, [118, 150], a=(110, 55))
    # the cup: an uncovered bowl on a stem, empty, with a thirsty glow above it
    bowl = arc_pts(cx, cy - 40, 72, 0, 180, 30)
    c.iri_poly(bowl, 60, outline=235, w=4)
    c.ln([(cx - 72, cy - 40), (cx + 72, cy - 40)], INK, 140, 1.6)
    c.ln([(cx, cy + 32), (cx, cy + 70)], INK, 220, 3)
    c.ln([(cx - 34, cy + 72), (cx + 34, cy + 72)], INK, 220, 3)
    c.dot(cx, cy - 92, 5, INK, 255, glow=110)
    for k in range(3):
        c.ln([(cx, cy - 104 - k*14), (cx, cy - 98 - k*14)], INK, 160 - k*40, 1.4)
    cells = [(80, y, "left"), (1000, y, "right"), (80, cy + 40, "left"), (1000, cy + 40, "right")]
    for k, ((t, sub, line, names), (x, yy, al)) in enumerate(zip(q, cells)):
        mw = 330
        f = c.text if al == "left" else c.rtext
        if al == "left":
            c.text(x + 6, yy - 6, str(k+1), "serif", 30, SILVER, 230, align="center")
            c.text(x + 38, yy, t.upper(), "sansm", 22, BRIGHT, 255, spacing=2)
            yy2 = c.text(x, yy + 36, sub, "serifi", 24, SILVER, 230)
            yy2 = c.text(x, yy2 + 2, line, "serif", 28, BRIGHT, 255, maxw=mw, lh=1.1)
            yy2 += 8
            for nm in names:
                yy2 = c.text(x, yy2, nm, "sans", 18, QUIET, 245, maxw=mw, lh=1.3) + 3
        else:
            c.text(x - 6, yy - 6, str(k+1), "serif", 30, SILVER, 230, align="center")
            tw = c.d.textlength(t.upper(), font=font("sansm", 22))/S + 2*(len(t)-1)
            c.text(x - 38 - tw, yy, t.upper(), "sansm", 22, BRIGHT, 255, spacing=2)
            yy2 = c.rtext(x, yy + 36, sub, "serifi", 24, SILVER, 230, maxw=mw)
            yy2 = c.rtext(x, yy2 + 2, line, "serif", 28, BRIGHT, 255, maxw=mw, lh=1.1)
            yy2 += 8
            for nm in names:
                yy2 = c.rtext(x, yy2, nm, "sans", 18, QUIET, 245, maxw=mw, lh=1.3) + 3
    yb = y + 690
    yb = c.quote(80, yb, 920, "You are ready to receive when you want it, have made room for it, feel safe enough to let it in, and are steady enough to hold it.", 27)
    c.text(80, yb + 18, "Synthesis across 20+ traditions and modern schools. \u2018When the pupil is ready\u2019 comes from Light on the Path (1885), not Buddha or Lao Tzu.", "sans", 15, QUIET, 230, maxw=920, lh=1.35)
    return c

# ---------------------------------------------------------------- 19
@card
def p19(n):
    c = V4(n, T, "Find the Primitive", "A session plan: from one question to one sentence.", eyebrow="Pitch session")
    y = c.body_top + 10
    steps = [("Ask", "what is business to you? why this story?"),
             ("Primitives", "two humans, process, change, exchange"),
             ("DNA", "which of the six cells are empty?"),
             ("Signals", "where the co-founders meet"),
             ("Amplify", "their words first, then AI"),
             ("One sentence", "for whom, what change, how")]
    gap = 112
    c.ln([(130, y + 30), (130, y + 30 + 5*gap)], SILVER, 90, 1.4)
    c.iri_path([(130, y + 30 + 4*gap), (130, y + 30 + 5*gap)], 4, 220)
    for i, (t, d) in enumerate(steps):
        yy = y + i*gap
        if i < 5: c.prism(130, yy + 30, i+1, 20)
        else: c.star(130, yy + 30, 34, glow=70)
        c.text(200, yy + 4, f"{i+1:02d}", "sansm", 16, QUIET, 230)
        c.text(250, yy, t, "serif", 34, BRIGHT, 255)
        c.text(520, yy + 10, d, "sans", 21, MOON, 220, maxw=480)
    return c

# ================================================================ gains (private: client cards)
gains = []
def gain(fn): gains.append(fn); return fn
GE = "The Crossing  \u00b7  what you received"

@gain
def g1(n):
    c = V4(n, 3, "Not Results. Organs.", "You came for energy and clarity. You left with what produces them.", eyebrow=GE)
    y = c.body_top + 20
    c.rings(300, y + 170, [110], a=(110,)); c.orb(300, y + 170, 60, glow=30)
    c.rings(780, y + 170, [160, 120], a=(150, 80)); c.orb(780, y + 170, 95, glow=80); c.star(780, y + 170, 60, glow=0)
    c.arrow(430, y + 170, 600, y + 170, SILVER, 170, 2)
    yy = y + 360
    tag(c, 80, yy, "Asked for", "July 2026", "left", 36, 20, 400)
    for i, it in enumerate(["energy back", "clarity: what and why", "a new world model", "mission and scale"]):
        c.text(80, yy + 90 + i*36, "\u2014  " + it, "sans", 22, MOON, 200, maxw=420)
    tag(c, 1000, yy, "Also got", "not on the list", "right", 36, 20, 400)
    for i, it in enumerate(["the observer", "a sense of depth", "your own ground", "why Aspect burned", "words for your story"]):
        c.rtext(1000, yy + 90 + i*36, it + "  \u2014", "sans", 22, BRIGHT, 235, maxw=420)
    c.quote(80, yy + 310, 920, "Results fade. Organs keep working on their own.", 32)
    return c

def three(c, y, rows):
    for i, (t, d) in enumerate(rows):
        yy = y + i*190
        c.tri_split(120, yy + 50, 34, fill=tuple(0.35 if k == i else 0.0 for k in range(3)), a=150)
        c.text(190, yy, t, "serif", 34, BRIGHT, 255)
        c.text(190, yy + 46, d, "sans", 22, MOON, 220, maxw=800, lh=1.36)
    return y + 3*190

@gain
def g2(n):
    c = V4(n, 3, "The Observer", "A thought or a feeling used to be you. Now you can look at it.", eyebrow=GE)
    y = c.body_top + 10
    yy = three(c, y, [("What it is", "\u201cthere is fear in me\u201d instead of being the fear; a pause between event and reaction"),
                      ("Why it matters", "Kegan: each new stage starts when yesterday\u2019s self becomes an object. It is the engine of growth itself"),
                      ("What it gives", "fewer hijacks, more choice; decisions not from fear or from proving; calm in the pitch")])
    c.quote(80, yy + 20, 920, "The next step: mental habits that change reactions.", 30)
    return c

@gain
def g3(n):
    c = V4(n, 3, "Depth", "The world stopped being flat. You feel its depth, not only think it.", eyebrow=GE)
    y = c.body_top + 10
    yy = three(c, y, [("What it is", "people, choices, ideas gained an inside; feeling became an organ of perception"),
                      ("Why it matters", "energy from proving runs out; energy from depth renews itself. Energy went 3 \u2192 8"),
                      ("What it gives", "a second way to tell real from fake; a founder who knows states from the inside")])
    c.knob(880, yy + 90, 40, 0.8); c.text(800, yy + 70, "3 \u2192 8", "serif", 30, BRIGHT, 255, align="right")
    c.quote(80, yy + 70, 520, "\u201cDid you know this is possible?\u201d", 34)
    return c

# ================================================================ noosphere
noos = []
def noo(fn): noos.append(fn); return fn
NE = "Business from first principles  \u00b7  the noosphere"

@noo
def n1(n):
    c = V4(n, 3, "Every Cell Has a Neighbor", "The world already knows each piece. Nobody holds all six from one source.", eyebrow=NE)
    y = c.body_top + 10
    rows = [("Two humans", "Christensen: people hire a product to make progress", None),
            ("Who first", "Blank: customer development, out of the building", None),
            ("Myth, tribe", "Godin: Tribes; Campbell: the hero's journey", (1, 2)),
            ("Transition, promise", "Miller: the customer is the hero, the brand the guide", (3, 4)),
            ("Tagline", "Dunford: positioning; Ries and Trout", (5,)),
            ("Uniqueness", "Thiel: a secret few people agree with", (0,))]
    for i, (a, b, lit) in enumerate(rows):
        yy = y + i*100
        gx, gy = 112, yy + 34
        Pv = hexpts(gx, gy, 24)
        c.poly(Pv, SILVER, 120, 1.3)
        for k, p in enumerate(Pv):
            if lit and k in lit: c.dot(p[0], p[1], 4.5, INK, 255, glow=70)
            else: c.dot(p[0], p[1], 2.2, QUIET, 180, glow=0)
        if lit is None: c.dot(gx, gy, 3, QUIET, 200, glow=0)
        c.text(165, yy + 14, a, "serif", 30, BRIGHT, 255)
        c.text(445, yy + 18, b, "sans", 21, MOON, 225, maxw=555)
        c.line(165, yy + 86, 1000, yy + 86, MOON, 30, 1)
    yy = y + 6*100 + 20
    c.star(112, yy + 30, 30, glow=70)
    c.quote(165, yy + 10, 835, "New here: all six grown from the founder\u2019s uniqueness.", 30)
    return c

@noo
def n2(n):
    c = V4(n, 3, "The Founder, Replaced", "Wasserman, Harvard: 212 US startups from the late 1990s and early 2000s.", eyebrow=NE)
    y = c.body_top + 30
    gx, gy, gw, gh = 150, y + 30, 820, 400
    for v in (25, 50, 75, 100):
        yv = gy + gh - gh*v/100
        c.line(gx, yv, gx + gw, yv, MOON, 30, 1); c.text(gx - 16, yv - 12, f"{v}%", "sans", 16, QUIET, 230, align="right")
    c.ln([(gx, gy), (gx, gy + gh), (gx + gw, gy + gh)], SILVER, 140, 1.6)
    data = [("founding", 0.0, 100, None), ("year 3", 0.42, 50, "still CEO"), ("year 4", 0.62, 40, "still CEO"), ("at IPO", 1.0, 25, "led it, at most")]
    pts = [(gx + gw*t, gy + gh - gh*v/100) for _, t, v, _ in data]
    smooth = []
    for i in range(len(pts) - 1):
        (x1, y1), (x2, y2) = pts[i], pts[i+1]
        for k in range(20):
            u = k/20; s = u*u*(3 - 2*u)
            smooth.append((x1 + (x2-x1)*u, y1 + (y2-y1)*s))
    smooth.append(pts[-1])
    c.iri_poly(smooth + [(gx + gw, gy + gh), (gx, gy + gh)], 38)
    c.iri_path(smooth, 5, 230)
    for (lab, t, v, note), (px, py) in zip(data, pts):
        c.orb(px, py, 14, glow=60)
        c.text(px, gy + gh + 14, lab, "sansm", 18, SILVER, 230, align="center" if 0 < t < 1 else ("left" if t == 0 else "right"))
        if note:
            c.text(px if t < 1 else px - 10, py - 100, f"{v}%", "serif", 40, BRIGHT, 255, align="center" if t < 1 else "right")
            c.text(px if t < 1 else px - 10, py - 56, note, "sans", 18, MOON, 220, align="center" if t < 1 else "right")
    c.quote(80, gy + gh + 90, 920, "Rich or king: few founders are both.", 32)
    return c

@noo
def n3(n):
    c = V4(n, 3, "Most Venture Funds Lose to an Index Fund",
           "The Kauffman Foundation checked 100 venture funds it invested in over 20 years (2012).", eyebrow=NE)
    y = c.body_top + 10
    cols, r, gap, rg = 10, 19, 64, 50
    x0 = 540 - (cols-1)*gap/2
    for k in range(100):
        cx = x0 + (k % cols)*gap; cy = y + 28 + (k // cols)*rg
        if k < 20: c.orb(cx, cy, r, glow=50); c.iri_ring(cx, cy, r + 4, 3, 220)
        elif k < 38: c.circle(cx, cy, r, INK, 230, 2.5, fill_a=40)
        else: c.circle(cx, cy, r, QUIET, 90, 1.3)
    yy = y + 28 + 10*rg
    rows = [("20 funds", "clearly beat the stock market (by 3%+ a year)"),
            ("18 funds", "about the same as the stock market (derived: 100 \u2212 20 \u2212 62)"),
            ("62 funds", "did worse than a simple index fund, after fees")]
    for i, (h, t) in enumerate(rows):
        ly = yy + i*46
        if i == 0: c.orb(96, ly + 16, 11, glow=40); c.iri_ring(96, ly + 16, 14, 3, 220)
        elif i == 1: c.circle(96, ly + 16, 11, INK, 230, 2.5, fill_a=40)
        else: c.circle(96, ly + 16, 11, QUIET, 100, 1.3)
        c.text(124, ly, h, "sansm", 24, BRIGHT, 245)
        c.text(245, ly + 2, t, "sans", 21, MOON, 215, maxw=760)
    c.quote(80, yy + 165, 920, "Managers earn fees either way. Founders and investors carry the risk.", 28)
    return c

if __name__ == "__main__":
    a = sys.argv[1:]
    if a == ["noos"]:
        for i, f in enumerate(noos, 1): print(f(i).save(os.path.join(OUT, f"noosphere-{i}.png")))
        sys.exit()
    if a == ["gains"]:
        for i, f in enumerate(gains, 1): print(f(i).save(os.path.join(PRIV, f"gains-{i}.png")))
        sys.exit()
    only = [int(x) for x in a]
    for i, f in enumerate(cards, 1):
        if only and i not in only: continue
        print(f(i).save(os.path.join(OUT, f"primitives-{i:02d}.png")))
