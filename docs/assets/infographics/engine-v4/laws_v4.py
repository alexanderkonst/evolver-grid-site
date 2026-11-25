"""Laws of 2026-11-17 (product map day), v4 style. Run: python3 laws_v4.py"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v4lib import *
from moon import S, W, H, MOON, BRIGHT, DEEP, GLOW, rgba
from primitives_v4 import tag, head, arc_pts
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out-v4", "laws"); os.makedirs(OUT, exist_ok=True)
T = 6; cards = []
def card(f): cards.append(f); return f

@card
def l1(n):
    c = V4(n, T, "Measure the Shift in Their Words", "Only the person who lives a transformation can judge it. Give them a simple scale.")
    y = c.body_top + 30
    goals = [("“More energy”", 3, 8), ("“My uniqueness, said so it rings true”", 1, 6), ("“A whole picture of the world”", 3, 6)]
    for i, (g, a, b) in enumerate(goals):
        yy = y + i*150
        c.text(100, yy, g, "serif", 30, BRIGHT, 255, maxw=880)
        c.slider(100, yy + 70, 700, b/10)
        c.ln([(100 + 700*a/10, yy+52), (100 + 700*a/10, yy+88)], QUIET, 220, 2)
        c.text(830, yy + 56, f"{a} → {b}", "sansm", 26, INK, 240)
    c.quote(80, y + 480, 920, "Their goals. Their words. Their numbers: start, middle, end.", 32)
    return c

@card
def l2(n):
    c = V4(n, T, "Expected, Then Compared", "Write down what “enough” looks like on day one. At the end, compare with the record, not with memory.")
    y = c.body_top + 20
    rows = [("+2", "much more than I expected"), ("+1", "more than I expected"), ("0", "what I expected"), ("−1", "less than I expected"), ("−2", "much less than I expected")]
    for i, (s, t) in enumerate(rows):
        yy = y + i*96
        r = 34 if s == "0" else 28
        if s == "0": c.iri_disc(170, yy + 30, r, 150)
        else: c.rings(170, yy + 30, [r], a=(150,))
        c.ctext(170, yy + 14, s, "serif", 30, BRIGHT, 255)
        c.text(240, yy + 12, t, "serif", 32, BRIGHT if s == "0" else INK, 255 if s == "0" else 215, maxw=760)
    c.quote(80, y + 520, 920, "Goal Attainment Scaling, 1968. One question a person can always answer.", 28)
    return c

@card
def l3(n):
    c = V4(n, T, "Seen Value Restores the Exchange", "When people see what they received, they balance the exchange themselves. Unseen value distorts it.")
    cy = c.body_top + 230; L, R = 280, 800
    c.orb(L, cy, 90); c.orb(R, cy, 90)
    up = [(L + (R-L)*t, cy - 30 - 110*math.sin(math.pi*t)) for t in [i/60 for i in range(61)]]
    dn = [(R - (R-L)*t, cy + 30 + 110*math.sin(math.pi*t)) for t in [i/60 for i in range(61)]]
    c.iri_path(up[8:-8], 5, 230); head(c, up[8:-8], INK, 240, 14)
    c.ln(dn[8:-8], SILVER, 170, 2.2); head(c, dn[8:-8], SILVER, 200, 12)
    c.ctext(540, cy - 185, "the shift, seen and named", "sansm", 20, SILVER, 230, maxw=420)
    c.ctext(540, cy + 160, "money · a gift · a referral · gratitude", "sans", 21, QUIET, 235, maxw=520)
    c.ctext(L, cy - 16, "guide", "serif", 32, (20, 24, 36), 255); c.ctext(R, cy - 16, "client", "serif", 32, (20, 24, 36), 255)
    c.quote(80, cy + 270, 920, "Never ask them to price it. Show them what moved.", 32)
    return c

@card
def l4(n):
    c = V4(n, T, "Three Gates", "Who is ready to build a business from their uniqueness.")
    y = c.body_top + 20
    gates = [("In contact with their uniqueness", "a living contact, not an idea about it"), ("The decision is made", "no way back. Skin in the game, in any currency"), ("Ready to receive and to clear fast", "gifts land; resistance dissolves quickly")]
    for i, (t, s) in enumerate(gates):
        yy = y + i*170; cx = 160
        pts = [(cx-46, yy+120), (cx-46, yy+40), (cx, yy), (cx+46, yy+40), (cx+46, yy+120)]
        c.iri_path(pts, 4, 210)
        c.ctext(cx, yy + 56, str(i+1), "serif", 36, BRIGHT, 255)
        tag(c, 250, yy + 30, t, s, tsize=32, ssize=21, maxw=730)
    c.quote(80, y + 540, 920, "No money is not no decision. Revenue share is the bridge.", 30)
    return c

@card
def l5(n):
    c = V4(n, T, "Not Posed, Posed, Taken", "A decision has three states, not two. Each state needs a different journey.")
    y = c.body_top + 60; xs = [190, 540, 890]
    states = [("not posed", "the option isn’t in view yet", "The Vector"), ("posed", "torn between worlds", "The Crossing"), ("taken", "decided, moving slowly and alone", "BUILD")]
    for i, (x, (s, d, p)) in enumerate(zip(xs, states)):
        r = 70 + i*12
        (c.iri_disc if i == 2 else (lambda a, b, rr, aa=0: c.rings(a, b, [rr], a=(170,))))(x, y + 120, r, 150) if i == 2 else c.rings(x, y + 120, [r], a=(170,), dashed=(i == 0))
        c.ctext(x, y + 104, s, "serif", 30, BRIGHT, 255, maxw=200)
        c.ctext(x, y + 230, d, "sans", 20, QUIET, 230, maxw=260)
        c.ctext(x, y + 320, p, "sansm", 24, INK, 245, maxw=260)
    for a, b in [(xs[0]+95, xs[1]-95), (xs[1]+100, xs[2]-105)]:
        pts = [(a, y+120), (b, y+120)]; c.ln(pts, SILVER, 200, 2); head(c, [(a, y+120), ((a+b)/2, y+120), (b, y+120)], SILVER, 220, 12)
    c.quote(80, y + 470, 920, "After the decision, the pain moves: from “stuck” to “too slow, and alone”.", 30)
    return c

@card
def l6(n):
    c = V4(n, T, "One Shift, Three Prisms", "The unit of the whole project is a shift. Product, module and game are three faces of it.")
    cx, cy = 540, c.body_top + 260
    c.star(cx, cy, 70, glow=80)
    c.ctext(cx, cy + 90, "the shift", "serif", 30, BRIGHT, 255)
    faces = [(-90, "Product", "a shift with a price"), (30, "Game", "a shift as a lived step"), (150, "Module", "a shift as an instrument")]
    for ang, t, s in faces:
        x = cx + 300*math.cos(math.radians(ang)); yy = cy + 250*math.sin(math.radians(ang))
        c.prism(x, yy, 3, r=40, c=INK, a=220, w=2)
        c.ln([(cx + 95*math.cos(math.radians(ang)), cy + 95*math.sin(math.radians(ang))), (x - 50*math.cos(math.radians(ang)), yy - 50*math.sin(math.radians(ang)))], SILVER, 150, 1.6)
        c.ctext(x, yy + 52, t, "serif", 30, BRIGHT, 255, maxw=260)
        c.ctext(x, yy + 92, s, "sans", 20, QUIET, 230, maxw=260)
    c.quote(80, cy + 380, 920, "One key per shift, so all three never drift apart.", 30)
    return c

if __name__ == "__main__":
    for i, f in enumerate(cards, 1): print(f(i).save(os.path.join(OUT, f"laws-{i:02d}.png")))
