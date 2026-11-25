"""Ideal client & marketing series (Sasha, mentoring call 2026-11-23, Fathom 206143973).
Generic: no client data. Style v4 lunar."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v4lib import *
from moon import S, W, H, MOON, BRIGHT, DEEP, GLOW, rgba
from primitives_v4 import tag, head
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out-v4", "ideal-client"); os.makedirs(OUT, exist_ok=True)
T = 9; cards = []
DARK = (20, 24, 36)
def card(f): cards.append(f); return f
def arrow(c, a, b, col=SILVER, al=200, w=2):
    c.ln([a, b], col, al, w); head(c, [a, ((a[0]+b[0])/2, (a[1]+b[1])/2), b], col, al+20, 12)

@card
def k1(n):
    c = V4(n, T, "Your Ideal Client Is You", "No one else is you. So measure everyone by how close they are to you.", eyebrow="Ideal client · The target")
    cx, cy = 540, c.body_top + 300
    radii = [250, 205, 160, 115]
    c.rings(cx, cy, radii, a=(70, 100, 130, 160))
    c.orb(cx, cy, 64, glow=70)
    c.ctext(cx, cy - 22, "you", "serif", 38, DARK, 255)
    for r, s in zip(radii, ["4", "6", "8", "9"]):
        c.ctext(cx, cy - r + 6, s, "sans", 18, QUIET, 230)
    c.ctext(cx, cy + 74, "10", "sansm", 18, INK, 235)
    for ang, r in [(-40, 90), (200, 135), (110, 182), (320, 230), (160, 228), (20, 180)]:
        x, y = cx + r*math.cos(math.radians(ang)), cy + r*math.sin(math.radians(ang))
        c.dot(x, y, 6, INK, 240, glow=60)
    c.quote(80, cy + 300, 920, "Find the people most like you. Give them what only you have.", 30)
    return c

@card
def k2(n):
    c = V4(n, T, "Similar, and Different", "Two corners make them like you. One corner makes them want to buy.", eyebrow="Ideal client · The triangle")
    cx, cy = 540, c.body_top + 300
    V = c.tri_split(cx, cy, 210)
    top, right, left = V
    c.orb(top[0], top[1], 22, glow=40); c.orb(right[0], right[1], 22, glow=40); c.iri_disc(left[0], left[1], 26, 190)
    tag(c, cx, top[1] - 88, "Identity", "similar", align="center", maxw=300)
    tag(c, right[0] + 10, right[1] + 24, "Myth", "similar", align="center", maxw=260)
    tag(c, left[0] - 10, left[1] + 24, "Threshold", "the difference", align="center", maxw=260)
    c.quote(80, cy + 300, 920, "The difference: they stand where you once stood.", 30)
    return c

@card
def k3(n):
    c = V4(n, T, "Three Kinds of Marketing", "Speak to who they are, what they believe, and where they are crossing.", eyebrow="Ideal client · Marketing")
    y = c.body_top + 30; xs = [190, 540, 890]
    cols = [("Identity", "How they describe themselves.", "Your own self-description is their portrait."),
            ("Myth", "What they believe.", "They resonate with the story you live by."),
            ("Threshold", "Where they are crossing.", "The moment of transition you have already made.")]
    for i, (x, (t, a, b)) in enumerate(zip(xs, cols)):
        if i == 2: c.iri_disc(x, y + 80, 62, 150)
        else: c.orb(x, y + 80, 62)
        c.ctext(x, y + 180, t, "serif", 40, BRIGHT, 255, maxw=300)
        c.ctext(x, y + 245, a, "sansm", 23, INK, 240, maxw=290)
        c.ctext(x, y + 330, b, "sans", 21, SILVER, 225, maxw=280)
    c.label(190, y + 470, "similarity", align="center"); c.label(540, y + 470, "similarity", align="center"); c.label(890, y + 470, "the secret sauce", align="center", c=BLUSH)
    return c

@card
def k4(n):
    c = V4(n, T, "Take Them to the Next Village", "You are the ferryman. The client comes to the pier at their threshold.", eyebrow="Ideal client · The threshold")
    y = c.body_top + 200
    c.wave(80, y + 90, 920, 8, 5, c=QUIET, a=120, wd=1.6)
    c.wave(80, y + 120, 920, 6, 6, phase=1, c=QUIET, a=90, wd=1.4)
    c.orb(170, y, 58); c.ctext(170, y + 150, "the pier", "serif", 30, BRIGHT, 255)
    c.ctext(170, y + 192, "they are ready to cross", "sans", 20, SILVER, 225, maxw=220)
    c.orb(910, y, 62, glow=70); c.ctext(910, y - 20, "you", "serif", 30, DARK, 255)
    c.ctext(910, y + 150, "the next village", "serif", 30, BRIGHT, 255)
    c.ctext(910, y + 192, "where you stand now", "sans", 20, SILVER, 225, maxw=220)
    boat = [(450, y + 70), (630, y + 70), (600, y + 100), (480, y + 100)]
    c.iri_poly(boat, 150)
    arc = [(250 + 580*t, y - 20 - 70*math.sin(math.pi*t)) for t in [i/60 for i in range(61)]]
    c.ln(arc, SILVER, 150, 1.8); head(c, arc, SILVER, 200, 12)
    c.quote(80, y + 300, 920, "\u201cI know the way to the next village. Let's go.\u201d", 30)
    return c

@card
def k5(n):
    c = V4(n, T, "The Delta Is the Product", "Your gift grows in stages. The step you've crossed is what you can hand on.", eyebrow="Ideal client · What you sell")
    y = c.body_top + 380; x0 = 120
    steps = 5; w = 168
    for i in range(steps):
        x = x0 + i*w; h = 60 + i*60
        if i in (2, 3): c.iri_poly([(x, y), (x + w - 14, y), (x + w - 14, y - h), (x, y - h)], 70 if i == 2 else 140)
        else: c.poly([(x, y), (x + w - 14, y), (x + w - 14, y - h), (x, y - h)], SILVER, 150, 1.6)
    c.ctext(x0 + 2*w + 77, y + 20, "they stand here", "sans", 20, SILVER, 230, maxw=160)
    c.ctext(x0 + 3*w + 77, y + 20, "you stand here", "sansm", 20, INK, 240, maxw=160)
    bx = x0 + 3*w - 7
    c.ln([(bx - 70, y - 300), (bx + 70, y - 300)], INK, 220, 2)
    c.ctext(bx, y - 360, "the delta", "serif", 36, BRIGHT, 255)
    c.quote(80, y + 120, 920, "The better you understand your own path, the better you package it.", 30)
    return c

@card
def k6(n):
    c = V4(n, T, "The Product Ladder", "Describe the path you walked, then cut it into pieces that make sense.", eyebrow="Offers · Your path in pieces")
    y0 = c.body_top + 20
    rx0, rx1 = 230, 330; mx = (rx0 + rx1)/2
    top_y, bot_y = y0 + 60, y0 + 640
    # rails of the ladder, from their threshold up to where you stand
    c.ln([(rx0, top_y + 40), (rx0, bot_y - 30)], SILVER, 150, 2)
    c.ln([(rx1, top_y + 40), (rx1, bot_y - 30)], SILVER, 150, 2)
    rungs = [("Long-term container", "the whole way to where you now stand"),
             ("Higher ticket", "the next product, maybe a two-day"),
             ("Entry product", "very inexpensive, quick to get, so trust forms"),
             ("Free lead magnet", "something they find useful")]
    al = [245, 210, 175, 145]
    for k, (t, sub) in enumerate(rungs):
        ry = top_y + 135 + k*112
        c.iri_poly([(rx0 - 6, ry - 7), (rx1 + 6, ry - 7), (rx1 + 6, ry + 7), (rx0 - 6, ry + 7)], al[k])
        c.text(380, ry - 34, t, "serif", 32, BRIGHT, 255, maxw=600)
        c.text(380, ry + 10, sub, "sans", 21, SILVER, 225, maxw=600)
    # you, at the top
    c.orb(mx, top_y, 54, glow=90)
    c.ctext(mx, top_y - 22, "you", "serif", 32, DARK, 255)
    c.text(380, top_y - 38, "Where you stand now", "serif", 34, BRIGHT, 255, maxw=600)
    c.text(380, top_y + 8, "the next village", "sans", 21, SILVER, 225, maxw=600)
    # them, at the bottom
    c.orb(mx, bot_y, 30, glow=30)
    c.text(380, bot_y - 36, "Their threshold", "serif", 32, BRIGHT, 255, maxw=600)
    c.text(380, bot_y + 8, "they come to the pier, ready to cross", "sans", 21, SILVER, 225, maxw=600)
    # the delta: a rotated label beside a bracket
    bx = 150
    c.ln([(bx, top_y), (bx, bot_y)], QUIET, 170, 1.6)
    c.ln([(bx, top_y), (bx + 14, top_y)], QUIET, 170, 1.6); c.ln([(bx, bot_y), (bx + 14, bot_y)], QUIET, 170, 1.6)
    f = font("sansm", 16); txt = "THE DELTA"
    tw = int(c.d.textlength(txt, font=f)) + 8*S*len(txt)
    tmp = Image.new("RGBA", (tw + 20*S, 30*S), (0, 0, 0, 0)); td = ImageDraw.Draw(tmp); xx = 10*S
    for ch in txt:
        td.text((xx, 4*S), ch, font=f, fill=rgba(BLUSH, 240)); xx += td.textlength(ch, font=f) + 4*S
    tmp = tmp.rotate(90, expand=True)
    my = (top_y + bot_y)/2
    c.d.rectangle([(bx - 14)*S, (my - tmp.size[1]/S/2 - 10)*S, (bx + 14)*S, (my + tmp.size[1]/S/2 + 10)*S], fill=(12, 15, 26, 255))
    c.layer.alpha_composite(tmp, (int(bx*S - tmp.size[0]/2), int(my*S - tmp.size[1]/2)))
    c.quote(80, bot_y + 110, 920, "You simply take people to the point where you stand now.", 30)
    return c

@card
def k7(n):
    c = V4(n, T, "Your Method Already Exists", "You've delivered results. A structure was there, even if no one saw it.", eyebrow="Offers · From sessions to product")
    y = c.body_top + 40
    chain = [("Recorded sessions", "phone voice memo is enough"), ("Transcripts", ""), ("AI synthesis", "finds the method you used"),
             ("Your product", "page · infographic · entry course")]
    for i, (t, s) in enumerate(chain):
        yy = y + i*130
        if i == 3: c.iri_disc(140, yy + 22, 26, 170)
        else: c.orb(140, yy + 22, 24, glow=30)
        c.text(200, yy, t, "serif", 34, BRIGHT, 255, maxw=760)
        if s: c.text(200, yy + 46, s, "sans", 21, SILVER, 225, maxw=760)
        if i < 3: arrow(c, (140, yy + 54), (140, yy + 106), QUIET, 170, 1.6)
    c.quote(80, y + 560, 920, "You don't build from zero. Record every session from now on.", 30)
    return c

@card
def k8(n):
    c = V4(n, T, "The Key Is Inside", "People look only at the doors available to them, not inward.", eyebrow="Uniqueness · Seeing your place")
    y = c.body_top + 30
    rows = [("Village", 2, 30, 46), ("City district", 20, 20, 38), ("Silicon Valley", 13, 30, 60)]
    x0 = 330
    for i, (t, k, dw, dh) in enumerate(rows):
        yy = y + i*96
        c.text(80, yy + dh/2 - 20, t, "serif", 28, QUIET, 230, maxw=240)
        step = (dw + 12) if k > 13 else (dw + 20)
        if k == 20: step = 33
        for j in range(k):
            x = x0 + j*step
            c.poly([(x, yy + dh), (x + dw, yy + dh), (x + dw, yy), (x, yy)], QUIET, 120, 1.3)
    c.label(80, y + 300, "the doors around you", c=QUIET)
    # focal: the self, with the key inside
    cx, cy, R = 540, y + 520, 118
    c.rings(cx, cy, [R + 34, R + 70], a=(110, 60), dashed=True)
    c.orb(cx, cy, R, glow=110, seed=3)
    kc = DARK; w = 10
    bx, by, br = cx - 52, cy, 26
    c.d.ellipse([(bx - br)*S, (by - br)*S, (bx + br)*S, (by + br)*S], outline=rgba(kc, 255), width=int(w*S))
    c.ln([(bx + br - 2, by), (cx + 72, by)], kc, 255, w)
    c.ln([(cx + 46, by), (cx + 46, by + 26)], kc, 255, w)
    c.ln([(cx + 66, by), (cx + 66, by + 20)], kc, 255, w)
    c.label(cx, cy - R - 120, "inside", align="center", c=BLUSH, size=18)
    c.ctext(cx, cy + R + 92, "See yourself first.", "serif", 38, BRIGHT, 255, maxw=900)
    c.ctext(cx, cy + R + 144, "Then the doors where you fit open to you.", "sans", 23, SILVER, 230, maxw=900)
    return c

@card
def k9(n):
    c = V4(n, T, "One Path", "Your business grows as you grow. Inner work and business work become one.", eyebrow="Uniqueness · The way")
    cx, cy = 540, c.body_top + 270
    pts = [("A trial appears", -90), ("You go straight in", 30), ("The business moves forward", 150)]
    R = 190
    c.rings(cx, cy, [R], a=(120,), dashed=True)
    for t, ang in pts:
        x, y = cx + R*math.cos(math.radians(ang)), cy + R*math.sin(math.radians(ang))
        c.orb(x, y, 30, glow=40)
        if ang == -90: c.ctext(x, y - 90, t, "serif", 30, BRIGHT, 255, maxw=360)
        elif ang == 30: c.text(x + 44, y - 18, t, "serif", 30, BRIGHT, 255, maxw=240)
        else: c.rtext(x - 44, y - 18, t, "serif", 30, BRIGHT, 255, maxw=240)
    c.iri_arc(cx, cy, R, -80, 20, 5, 220); c.iri_arc(cx, cy, R, 40, 140, 5, 220); c.iri_arc(cx, cy, R, 160, 260, 5, 220)
    c.ctext(cx, cy - 20, "less doubt", "sansm", 22, INK, 235); c.ctext(cx, cy + 12, "each turn", "sans", 20, QUIET, 225)
    c.quote(80, cy + 290, 920, "Doubt is where the energy leaks. Ask what to do now, not how.", 30)
    return c

if __name__ == "__main__":
    only = sys.argv[1:]
    for i, f in enumerate(cards, 1):
        if only and str(i) not in only: continue
        print(f(i).save(os.path.join(OUT, f"ic-{i:02d}.png")))
