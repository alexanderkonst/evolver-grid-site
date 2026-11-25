import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from moon import *

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out")
os.makedirs(OUT, exist_ok=True)
T = int(os.environ.get("GLEB_T", "62"))
cards = {}
def card(n):
    def deco(fn): cards[n] = fn; return fn
    return deco

# ---------- helpers ----------
def row(c, x, y, w, h, title, desc, num=None, glow=0, fill_a=10, border_a=110, tsize=30, dsize=19):
    c.box(x, y, w, h, None, None, fill_a=fill_a, border_a=border_a, glow=glow)
    tx = x + 24
    if num is not None:
        c.text(x + 26, y + h/2 - 24, str(num), "serif", 40, DEEP, 240)
        tx = x + 76
    th = tsize * 1.1
    dh = c.text_h(desc, "sans", dsize, w - (tx - x) - 24, 1.3) if desc else 0
    yy = y + (h - th - dh - (6 if desc else 0)) / 2
    c.text(tx, yy, title, "serif", tsize, BRIGHT, 255, maxw=w - (tx - x) - 20, lh=1.1)
    if desc:
        c.text(tx, yy + th + 6, desc, "sans", dsize, MOON, 210, maxw=w - (tx - x) - 24, lh=1.3)

def stack(c, items, x, y, w, h, gap, numbered=False, hi=None, tsize=30, dsize=19):
    for i, (t, d) in enumerate(items):
        row(c, x, y + i*(h+gap), w, h, t, d, num=(i+1) if numbered else None,
            glow=60 if hi == i else 0, fill_a=22 if hi == i else 10, border_a=180 if hi == i else 110, tsize=tsize, dsize=dsize)
    return y + len(items)*(h+gap) - gap

def column(c, x, y, w, h, head, sub, items, good=True, hsize=46):
    c.box(x, y, w, h, None, None, fill_a=22 if good else 8, border_a=170 if good else 80, glow=50 if good else 0)
    c.text(x+28, y+26, head, "serif", hsize, BRIGHT if good else MOON, 255)
    yy = c.text(x+28, y+26+hsize*1.15, sub, "sans", 20, DEEP, 230, maxw=w-56)
    yy += 22
    for it in items:
        c.text(x+28, yy, "\u2014", "sans", 20, DEEP, 200)
        yy = c.text(x+58, yy, it, "sans", 21, BRIGHT if good else MOON, 235 if good else 200, maxw=w-86, lh=1.34) + 16
    return yy

def side(c, x, y, w, items, tsize=28, dsize=20, gap=30):
    for t, d in items:
        y = c.text(x, y, t, "serif", tsize, BRIGHT, 255, maxw=w, lh=1.1)
        y = c.text(x, y + 6, d, "sans", dsize, MOON, 210, maxw=w, lh=1.36) + gap
    return y

def label(c, x, y, s, align="left"):
    c.text(x, y, s.upper(), "sansm", 16, DEEP, 230, align=align)

# ================= CALL 3 (2026-08-30) =================

@card(18)
def c18():
    c = Card(18, T, "Mind", "Subject Becomes Object",
             "The mind matures one move at a time: what we were inside of becomes something we can see, name and build with.")
    y0 = c.body_top
    stages = ["Impulses: hot, cold, hungry, danger", "Words: \u201cthe tree is not me\u201d", "Simple logical chains",
              "Family and tribe logic", "Mature subjectivity", "Others see the world differently",
              "Abstractions and systems", "Integration, first principles"]
    h, gap = 88, 12
    x, w = 80, 560
    for i, s in enumerate(stages):
        k = len(stages) - 1 - i
        y = y0 + i*(h+gap)
        c.box(x + k*8, y, w - k*16, h, None, None, fill_a=8 + (7-k)*3, border_a=80 + (7-k)*14, glow=50 if k == 7 else 0)
        c.text(x + k*8 + 22, y + h/2 - 22, str(k+1), "serif", 34, DEEP, 240)
        c.text(x + k*8 + 66, y + h/2 - 13, stages[k], "sans", 22, BRIGHT, 235, maxw=w - k*16 - 86)
    c.text(x + w/2, y0 + 8*(h+gap) + 6, "Before stage 1: one soup, no subject, no object", "sans", 18, MOON, 190, align="center")
    rx, rw = 690, 310
    label(c, rx, y0 + 6, "The rule (after Kegan)")
    y = c.text(rx, y0 + 38, "What was subject becomes object, at every stage.", "serif", 30, BRIGHT, 255, maxw=rw, lh=1.12)
    y = c.text(rx, y + 18, "Once something is an object, you can act on it, like Lego. A brick you can\u2019t see, you can\u2019t build with.", "sans", 20, MOON, 215, maxw=rw, lh=1.38)
    label(c, rx, y + 34, "Integration")
    c.text(rx, y + 64, "Simplify without losing signal and without adding noise.", "sans", 20, MOON, 215, maxw=rw, lh=1.38)
    c.quote(80, y0 + 8*(h+gap) + 58, 920, "The lens never fully clears. Evolution built the mind to see a small slice.", 28)
    return c

@card(19)
def c19():
    c = Card(19, T, "Truth", "Two Truths",
             "The mind maps. Feeling touches. One gives a picture of the world, always refracted. The other is contact with what is, right now.")
    y0 = c.body_top
    # flashlight in a dark field
    cx, cy = 140, y0 + 140
    c.box(80, y0, 920, 280, None, None, fill_a=4, border_a=60)
    c.dot(cx, cy, 8, glow=140)
    p = [(cx*S, cy*S), (420*S, (cy-70)*S), (420*S, (cy+70)*S)]
    c.gd.polygon(p, fill=rgba(GLOW, 90))
    c.line(cx, cy, 420, cy-70, MOON, 120, 1.5); c.line(cx, cy, 420, cy+70, MOON, 120, 1.5)
    c.text(280, cy - 12, "the mind", "serifi", 26, BRIGHT, 240, align="center")
    c.text(720, y0 + 80, "The territory", "serif", 38, MOON, 230, align="center")
    c.text(720, y0 + 132, "far deeper than any map: what the beam never reaches", "sans", 19, MOON, 190, align="center", maxw=440)
    yc = y0 + 320
    column(c, 80, yc, 450, 420, "Relative", "the mind\u2019s picture",
           ["Built through the lens, so always refracted", "Grows sharper as the lens matures", "Only the mind turns things into objects to act on"], good=False)
    column(c, 550, yc, 450, 420, "Absolute", "felt directly",
           ["What is, without passing through the mind", "Needs no proof: an itch is there or it isn\u2019t", "Only ever in the present"], good=True)
    c.quote(80, yc + 480, 920, "Thinking about feeling is not feeling. Feeling is feeling.", 30)
    return c

@card(20)
def c20():
    c = Card(20, T, "Perception", "Three Ways to Meet a Mug",
             "Thinking about an object is not perceiving it. Two of these modes are thought. Only one is contact.")
    y0 = c.body_top
    cx = 540
    # mug glyph
    c.box(cx - 55, y0 + 10, 110, 120, None, None, fill_a=18, border_a=200, glow=60)
    c.circle(cx + 78, y0 + 70, 30, MOON, 200, 3)
    items = [("Active thinking", "System 2. Slow, costly, you drive it.", "\u201c7 \u00d7 8 + 123\u201d", False),
             ("Passive thinking", "System 1. Thoughts arise; nobody drives.", "\u201cWhy does it have two handles?\u201d", False),
             ("Feeling", "Colour, texture, weight, presence.", "direct contact", True)]
    w, gap = 290, 25
    x0 = 540 - (3*w + 2*gap)/2
    yb = y0 + 220
    for i, (t, d, e, good) in enumerate(items):
        x = x0 + i*(w+gap)
        c.line(cx, y0 + 140, x + w/2, yb - 6, MOON, 90 if not good else 180, 1.5)
        c.box(x, yb, w, 360, None, None, fill_a=22 if good else 8, border_a=180 if good else 90, glow=60 if good else 0)
        c.text(x + w/2, yb + 34, t, "serif", 34, BRIGHT if good else MOON, 255, align="center", maxw=w-30)
        c.text(x + w/2, yb + 100, d, "sans", 20, MOON, 215, align="center", maxw=w-44, lh=1.36)
        c.text(x + w/2, yb + 270, e, "serifi", 24, DEEP, 240, align="center", maxw=w-40)
    label(c, x0 + 2*(w+gap) + w/2, yb + 380, "Sasha\u2019s addition to Kahneman", align="center")
    y = yb + 450
    c.box(80, y, 920, 130, None, None, fill_a=6, border_a=70)
    c.text(110, y + 26, "Inflamed mind  \u2192  still lake", "serif", 30, BRIGHT, 250)
    c.text(110, y + 72, "Meditation calms the water, and you see how many thoughts arise on their own.", "sans", 20, MOON, 210, maxw=860)
    return c

@card(21)
def c21():
    c = Card(21, T, "Feeling", "One Knob",
             "We imagine two dials: turn pain down, turn joy up. There is only one. Mute the hard feelings, and joy goes quiet with them.")
    y0 = c.body_top
    # myth: two small dials crossed out
    lx = 270
    label(c, lx, y0, "The myth", align="center")
    for i, (t, d) in enumerate([("pain", -60), ("joy", 60)]):
        cx, cy = lx - 85 + i*170, y0 + 130
        c.circle(cx, cy, 62, MOON, 110, 1.5, fill_a=6)
        a = math.radians(-90 + d)
        c.line(cx, cy, cx + 44*math.cos(a), cy + 44*math.sin(a), MOON, 150, 3)
        c.text(cx, cy + 80, t, "sans", 20, MOON, 180, align="center")
    c.line(lx - 170, y0 + 50, lx + 170, y0 + 230, DEEP, 170, 2)
    c.line(lx - 170, y0 + 230, lx + 170, y0 + 50, DEEP, 170, 2)
    # reality: one vertical slider
    rx = 700
    label(c, rx, y0, "The reality", align="center")
    top, bot = y0 + 50, y0 + 640
    c.box(rx - 22, top, 44, bot - top, None, None, fill_a=10, border_a=150)
    ky = top + 110
    c.box(rx - 60, ky - 20, 120, 40, None, None, fill_a=60, border_a=230, glow=90)
    c.text(rx - 70, top + 10, "MORE", "sansm", 16, DEEP, 230, align="right")
    c.text(rx - 70, bot - 26, "LESS", "sansm", 16, DEEP, 230, align="right")
    c.text(rx + 80, top + 80, "Joy, peace, aliveness", "serif", 30, BRIGHT, 255, maxw=220, lh=1.1)
    c.text(rx + 80, top + 156, "and grief, anger, fear: all of it", "sans", 19, MOON, 210, maxw=220)
    c.text(rx + 80, bot - 110, "Numb", "serif", 28, MOON, 230)
    c.text(rx + 80, bot - 70, "life gets flatter", "sans", 19, MOON, 190, maxw=220)
    yb = y0 + 300
    side(c, 80, yb, 470, [("Running from pain", "turns everything down at once."),
                          ("Dopamine spikes", "a new car, an achievement: short highs the brain adapts away."),
                          ("Turning it up", "feeling more is the way aliveness returns.")], tsize=28, dsize=20, gap=26)
    c.quote(80, bot + 50, 920, "There is only one knob.", 34)
    return c

@card(22)
def c22():
    c = Card(22, T, "Feeling", "Why Feel?",
             "Three reasons the heart comes first: it keeps you alive, it chooses better, and it knows before the mind can explain.")
    y0 = c.body_top
    items = [("Aliveness", "One knob for all feeling. Feel more, and you live more."),
             ("Better decisions", "Partner, co-founder, client, community: we choose by what feels right, not by pros and cons. Better feeling gives better information, as instant knowing."),
             ("Knowing", "Insight comes first; the explanation follows. Einstein and Newton saw it, then did the math.")]
    h, gap = 206, 22
    stack(c, items, 80, y0, 920, h, gap, numbered=True, hi=None, tsize=38, dsize=22)
    y = y0 + 3*(h+gap) + 10
    w3 = 290
    for i, (t, d) in enumerate([("Feel", "contact"), ("Know", "insight"), ("Explain", "the mind\u2019s map")]):
        x = 80 + i*(w3 + 25)
        c.box(x, y, w3, 100, t, d, tsize=28, ssize=18, glow=40 if i == 0 else 0)
        if i < 2: c.arrow(x + w3 + 4, y + 46, x + w3 + 21, y + 46, MOON, 200, head=9)
    c.quote(80, y + 140, 920, "Experience without interpretation stays \u201cI felt something.\u201d Interpretation without experience is head-games.", 26)
    return c

@card(23)
def c23():
    c = Card(23, T, "Heart and mind", "Orchestra, Not Cacophony",
             "Heart and mind are different instruments. Each in its own role makes music. Out of role, they make noise.")
    y0 = c.body_top
    w = 450
    column(c, 80, y0, w, 470, "Heart", "a qubit of the whole",
           ["A fractal piece of the universe\u2019s quantum computer", "Has all the information", "Knows without a chain of logic"], good=True)
    column(c, 550, y0, w, 470, "Mind", "a classical computer",
           ["An old machine: think MS-DOS", "Maps, predicts, interprets", "Sees a tiny slice of reality"], good=False)
    y = y0 + 500
    c.box(80, y, w, 170, "Faith", "The leap when the mind can\u2019t see the outcome.", tsize=34, ssize=20, align="left", pad=26, tkind="serif")
    c.box(550, y, w, 170, "Skepticism", "Healthy. It keeps interpretation honest.", tsize=34, ssize=20, align="left", pad=26, tkind="serif")
    c.quote(80, y + 220, 920, "The mind is not the enemy. Let it interpret what comes in, not write the code.", 28)
    return c

@card(24)
def c24():
    c = Card(24, T, "Feeling", "What Do We Feel?",
             "Emotion is only one slice of feeling. The range runs from a tingle in the skin to light along the spine.")
    y0 = c.body_top
    cx, cy = 410, y0 + 360
    layers = [("Subtle", "light, energy, inner landscapes"), ("The world", "beauty, presence, other people"),
              ("Emotions", "a spectrum, low to high vibration"), ("Pain & pleasure", "the basic signal"),
              ("Impulses", "hunger, desire, toward / away"), ("Sensations", "tingle, itch, pressure")]
    n = len(layers)
    for i, (t, d) in enumerate(layers):
        r = 330 - i*52
        c.circle(cx, cy, r, MOON, 60 + i*28, 1.5, fill_a=3 + i*3, glow=6 + i*10)
    for i, (t, d) in enumerate(layers):
        r = 330 - i*52
        yy = cy - r + 12 if i < n-1 else cy - 16
        c.text(cx, yy, t, "sansm", 19 if i < n-1 else 22, BRIGHT, 240, align="center")
    rx, rw = 780, 220
    y = y0 + 30
    for i, (t, d) in enumerate(reversed(layers)):
        y = c.text(rx, y, t, "serif", 26, BRIGHT, 255, maxw=rw, lh=1.1)
        y = c.text(rx, y + 2, d, "sans", 18, MOON, 205, maxw=rw, lh=1.3) + 18
    c.quote(80, cy + 380, 920, "The heart is also a sensor: it picks up fields, moods and places.", 28)
    return c

@card(25)
def c25():
    c = Card(25, T, "Breath", "Breath, the Master Lever",
             "Breath is the one autopilot you can steer on purpose. It moves every other system with it, and links the body to the subtle.")
    y0 = c.body_top
    # 5.5 / 5.5 wave
    x0, x1, ym, amp = 100, 980, y0 + 90, 60
    pts = []
    for i in range(301):
        t = i/300
        pts.append(((x0 + (x1-x0)*t)*S, (ym - amp*math.sin(t*2*math.pi*2.5))*S))
    c.d.line(pts, fill=rgba(BRIGHT, 220), width=3*S, joint="curve")
    c.gd.line(pts, fill=rgba(GLOW, 120), width=10*S)
    c.text(x0 + (x1-x0)*0.1, ym - amp - 34, "in 5.5 s", "sans", 18, DEEP, 230, align="center")
    c.text(x0 + (x1-x0)*0.3, ym + amp + 12, "out 5.5 s", "sans", 18, DEEP, 230, align="center")
    yc = y0 + 220
    column(c, 80, yc, 450, 440, "Coherent", "calm and resonant",
           ["5.5 s in, 5.5 s out, through the nose", "Only as much air as the body wants", "About five breaths bring the body into resonance"], good=True)
    column(c, 550, yc, 450, 440, "Active", "charge",
           ["More air than usual", "More energy in, to direct", "Clears overwhelm and jitters"], good=False)
    y = yc + 480
    c.box(80, y, 920, 120, None, None, fill_a=6, border_a=70)
    c.text(110, y + 24, "Two settings: pace and relaxation", "serif", 30, BRIGHT, 250)
    c.text(110, y + 68, "Rhythm underneath it all: filling and emptying, life and death.", "sans", 20, MOON, 210, maxw=860)
    return c

@card(26)
def c26():
    c = Card(26, T, "Practice", "The Heart Breath",
             "Awareness and feeling in one practice. You calm down and stay fully present. About three minutes.")
    y0 = c.body_top
    steps = [("Settle", "Sit straight, eyes closed, three deep breaths."),
             ("Pace", "5.5 s in, 5.5 s out, through the nose, no effort."),
             ("Align", "Palms stacked on the heart, centres like beads on one thread."),
             ("Rest", "Attention on that point. Breathe through it."),
             ("Release", "Let go of control. Feel the seat, palms, back. Open, then notice the shift.")]
    stack(c, steps, 80, y0, 560, 150, 18, numbered=True, tsize=32, dsize=20)
    cx, cy = 830, y0 + 360
    rings = [("doorway", 170), ("point", 120), ("energetic", 75)]
    for i, (t, r) in enumerate([("Doorway", 165), ("Energetic heart", 112), ("Physical heart", 60)]):
        c.circle(cx, cy, r, MOON, 80 + i*50, 1.5, fill_a=4 + i*6, glow=10 + i*25)
    c.dot(cx, cy, 6, glow=160)
    label(c, cx, cy - 230, "Levels of the heart", align="center")
    c.text(cx, cy - 158, "Doorway", "sansm", 17, BRIGHT, 230, align="center")
    c.text(cx, cy - 104, "Energetic", "sansm", 17, BRIGHT, 230, align="center")
    c.text(cx, cy - 50, "Physical", "sansm", 17, BRIGHT, 230, align="center")
    c.text(cx, cy + 20, "the point", "serifi", 22, BRIGHT, 240, align="center")
    c.text(cx, cy + 200, "It opens on its own. It can\u2019t be pushed.", "sans", 19, MOON, 210, align="center", maxw=330)
    c.quote(80, y0 + 5*168 + 10, 920, "Most people never feel their energetic heart in their whole life.", 28)
    return c

# ================= CALL 4 (2026-09-03) =================

@card(27)
def c27():
    c = Card(27, T, "Transformation", "The Guide Creates Conditions",
             "In a transformation, nobody can change for you. A guide can only make the change easier.")
    y0 = c.body_top
    column(c, 80, y0, 450, 440, "Product", "the vendor delivers",
           ["You pay, the result arrives", "Water for someone thirsty", "Nothing in you has to change"], good=False)
    column(c, 550, y0, 450, 440, "Transformation", "you do the change",
           ["Teacher, doctor, coach, therapist", "The guide creates conditions", "Guides differ by the consciousness in those conditions"], good=True, hsize=42)
    y = y0 + 480
    c.box(80, y, 920, 210, None, None, fill_a=14, border_a=150, glow=30)
    c.text(110, y + 26, "The container", "serif", 34, BRIGHT, 255)
    c.text(110, y + 84, "Finish the full course, like antibiotics. Transformation stirs up resistance (\u201cnot today\u201d, doubt); a fixed package carries you through it. The minimum ticket in is trust.", "sans", 20, MOON, 215, maxw=860, lh=1.38)
    c.quote(80, y + 260, 920, "My job is to create conditions. I can\u2019t change for a person.", 30)
    return c

@card(28)
def c28():
    c = Card(28, T, "Knowing", "Fantasy to Self-Evident",
             "Know only what you have lived. Mysteries are meant to open in your own understanding, until they are self-evident.")
    y0 = c.body_top
    steps = [("Hearsay", "someone\u2019s story; a broken telephone"),
             ("Projection", "the mind imagines before experience"),
             ("Experience", "reality shows itself, after the fact"),
             ("Self-evident", "no book needed: you simply know")]
    h, gap = 120, 46
    x, w = 80, 600
    for i, (t, d) in enumerate(steps):
        k = 3 - i
        y = y0 + i*(h+gap)
        row(c, x + k*0, y, w, h, steps[k][0], steps[k][1], num=k+1, glow=60 if k == 3 else 0,
            fill_a=22 if k >= 2 else 8, border_a=170 if k >= 2 else 90, tsize=32, dsize=20)
    vy = y0 + 2*(h+gap) - gap/2
    for xx in range(80, 690, 18):
        c.line(xx, vy, xx + 9, vy, DEEP, 200, 2)
    c.text(700, vy - 12, "the veil", "serifi", 24, DEEP, 240)
    rx, rw = 760, 240
    y = side(c, rx, y0 + 4, rw, [("Don\u2019t conclude fast", "Give it a session or two."),
                                  ("Ask why it came", "\u201cWhy did this topic come to me now?\u201d"),
                                  ("Keep 100% agency", "Any \u201cforces\u201d: which ones, on what terms?")], tsize=26, dsize=19, gap=24)
    c.quote(80, y0 + 4*(h+gap) + 10, 920, "Beginner\u2019s mind: drop the wish to have it figured out, and keep an honest account of what you truly lived.", 26)
    return c

@card(29)
def c29():
    c = Card(29, T, "The mystical", "Grade the Mystical",
             "Magic is a mechanism you don\u2019t understand yet, like a chemistry demo in class. Grade each claim on its own.")
    y0 = c.body_top
    qs = [("Possible?", "Do I believe it can happen?"),
          ("Witnessed?", "Have I seen real evidence?"),
          ("Understood?", "Do I grasp what it is and how it works?")]
    x, w = 80, 600
    for i, (t, d) in enumerate(qs):
        y = y0 + i*175
        inset = i*40
        c.box(x + inset, y, w - 2*inset, 140, None, None, fill_a=10 + i*8, border_a=110 + i*35, glow=20 + i*25)
        c.text(x + inset + 28, y + 26, f"{i+1}  {t}", "serif", 34, BRIGHT, 255)
        c.text(x + inset + 28, y + 82, d, "sans", 20, MOON, 215, maxw=w - 2*inset - 56)
        if i < 2: c.arrow(x + w/2, y + 142, x + w/2, y + 173, MOON, 180, head=8)
    rx, rw = 730, 270
    label(c, rx, y0 + 4, "Different layers")
    y = y0 + 36
    for t in ["Reincarnation", "Contact with other beings", "Breatharians", "Levitation"]:
        c.dot(rx + 6, y + 13, 4)
        y = c.text(rx + 24, y, t, "sans", 20, BRIGHT, 235, maxw=rw-24) + 12
    c.text(rx, y + 6, "Levitation is real mastery, not the entry level.", "sans", 19, MOON, 200, maxw=rw, lh=1.36)
    yb = y0 + 560
    c.box(80, yb, 920, 150, None, None, fill_a=6, border_a=80)
    c.text(110, yb + 24, "The trap", "serif", 32, BRIGHT, 255)
    c.text(110, yb + 72, "Stuffing yourself with concepts instead of unlocking abilities. Real understanding is lived and has come down into the body.", "sans", 20, MOON, 210, maxw=860, lh=1.38)
    c.quote(80, yb + 190, 920, "It opens exactly when it\u2019s needed. Check where the wanting comes from.", 28)
    return c

@card(30)
def c30():
    c = Card(30, T, "Sensing", "The Ladder of Sensing",
             "The common mistake is to treat sensing as emotion. Emotion is one rung. Thinking eats the bandwidth that sensing needs.")
    y0 = c.body_top
    rungs = [("Crown", "unity; contact with any being"), ("Third eye", "inner vision; seeing the invisible"),
             ("Throat", "words that ring with truth"), ("Heart", "the subtle; an infinite doorway"),
             ("Solar plexus", "impulse and motivation"), ("Sacral", "emotions, the animal layer"),
             ("Root", "hunger, sex, thirst, safety")]
    x, w = 80, 600
    y = y0
    for i, (t, d) in enumerate(rungs):
        heart = t == "Heart"
        h = 150 if heart else 102
        c.box(x, y, w, h, None, None, fill_a=26 if heart else 8, border_a=200 if heart else 100, glow=70 if heart else 0)
        c.dot(x + 34, y + h/2, 6 if heart else 4, glow=150 if heart else 60)
        c.text(x + 64, y + h/2 - (38 if heart else 32), t, "serif", 38 if heart else 32, BRIGHT, 255)
        c.text(x + 64, y + h/2 + (8 if heart else 6), d, "sans", 21 if heart else 19, MOON, 215, maxw=w - 90)
        y += h + 10
    c.arrow(712, y - 10, 712, y0 + 10, MOON, 130, 1.5)
    rx, rw = 750, 250
    label(c, rx, y0 + 300, "The heart rung")
    c.text(rx, y0 + 330, "Physical heart, then an energetic one, then an infinitely small prism of light: a doorway that adds a dimension, again and again.", "sans", 19, MOON, 215, maxw=rw, lh=1.38)
    c.text(rx, y0 + 600, "Walk into a room and feel what the last 15 minutes left in the air.", "serifi", 24, BRIGHT, 235, maxw=rw, lh=1.2)
    return c

@card(31)
def c31():
    c = Card(31, T, "Intuition", "Vibe First, Reasons Later",
             "The heart chooses; the mind explains afterwards. With practice, the heart becomes a radar you trust more than reasoning.")
    y0 = c.body_top
    steps = [("Enter", "walk in and feel the space"), ("Sense", "comfort, pull, which table calls"),
             ("Choose", "let the radar decide"), ("Explain", "the reasons arrive afterwards")]
    w, gap = 212, 24
    x0 = 80
    for i, (t, d) in enumerate(steps):
        x = x0 + i*(w+gap)
        c.box(x, y0, w, 170, t, d, tsize=32, ssize=19, glow=55 if i == 2 else 0, tkind="serif")
        if i < 3: c.arrow(x + w + 3, y0 + 85, x + w + gap - 3, y0 + 85, MOON, 200, head=8)
    y = y0 + 220
    c.box(80, y, 920, 170, None, None, fill_a=14, border_a=140, glow=25)
    label(c, 110, y + 24, "Sasha\u2019s example")
    c.text(110, y + 54, "After 1.5 years of travel, he and Karime each felt \u201cAmsterdam\u201d on their own. Asked why, he caught himself inventing reasons afterwards: bikes, freedom.", "sans", 21, BRIGHT, 230, maxw=860, lh=1.4)
    y += 210
    side(c, 80, y, 440, [("Practice", "\u201cVibe restaurants\u201d: feel the place, don\u2019t compare menus."),
                         ("Bugs exist", "Projection, shadow, habit. Telling them apart grows with the work.")], tsize=30, dsize=20, gap=30)
    side(c, 560, y, 440, [("Every space has an address", "People, businesses, countries: each has its own vibration."),
                          ("A question is a container", "It fills over months. Track \u201cclearer\u201d, not \u201canswered\u201d.")], tsize=30, dsize=20, gap=30)
    c.quote(80, y + 300, 920, "Sit in silence and let the information come.", 30)
    return c

@card(32)
def c32():
    c = Card(32, T, "Breath", "Breath as a Sovereign Tool",
             "Free, generated from inside, always with you. External tools are powerful when used soberly, and become crutches when they aren\u2019t.")
    y0 = c.body_top
    column(c, 80, y0, 450, 330, "Passive", "release",
           ["Even 5.5-second breathing", "Drop every technique; total release"], good=False)
    column(c, 550, y0, 450, 330, "Active", "charge",
           ["In and out through the mouth", "Three-step inhale; easy exhale", "Hold with full tension, then let go"], good=True)
    y = y0 + 380
    label(c, 80, y, "The rubber band: every practice stretches you, then you spring back")
    bars = [("3\u20135 min", 0.25), ("30 min", 0.45), ("90 min", 0.7), ("+ external", 1.0)]
    bw, gap = 200, 40
    base = y + 250
    for i, (t, v) in enumerate(bars):
        x = 80 + i*(bw+gap)
        hh = 190*v
        c.box(x, base - hh, bw, hh, None, None, fill_a=14 + i*8, border_a=120 + i*30, glow=20 + i*15)
        c.text(x + bw/2, base + 12, t, "sansm", 19, BRIGHT, 235, align="center")
    c.text(1000, y + 36, "amplitude", "sans", 18, DEEP, 220, align="right")
    c.quote(80, base + 70, 920, "Dependency is believing you can only get there with something external. That is giving away your sovereignty.", 26)
    return c

@card(33)
def c33():
    c = Card(33, T, "Practice", "The Elevator of Practice",
             "A strong practice is a lift to a higher floor. You spend time with your future self, ride back down, and the artifacts stay with you.")
    y0 = c.body_top
    sx, sw = 110, 160
    top, bot = y0 + 10, y0 + 640
    c.box(sx, top, sw, bot - top, None, None, fill_a=6, border_a=120)
    floors = 6
    for i in range(floors + 1):
        yy = bot - i*(bot - top)/floors
        c.line(sx + sw, yy, sx + sw + 140, yy, MOON, 60, 1)
    # staircase
    for i in range(floors):
        yy = bot - i*(bot - top)/floors
        c.line(sx + sw + 20 + i*20, yy, sx + sw + 20 + i*20, yy - (bot-top)/floors, MOON, 100, 1.5)
        c.line(sx + sw + 20 + i*20, yy - (bot-top)/floors, sx + sw + 40 + i*20, yy - (bot-top)/floors, MOON, 100, 1.5)
    c.box(sx + 22, top + 30, sw - 44, 80, None, None, fill_a=60, border_a=230, glow=90)
    c.arrow(sx + sw/2, bot - 30, sx + sw/2, top + 130, BRIGHT, 200, 2)
    c.text(sx + sw/2, bot + 14, "lift", "sansm", 17, DEEP, 230, align="center")
    c.text(sx + sw + 80, bot + 14, "stairs", "sansm", 17, DEEP, 230, align="center")
    rx, rw = 460, 540
    steps = [("Ride up", "retreat, breathwork, deep practice"), ("Orient", "be your activated potential, your future self"),
             ("Collect", "clarity, overview, subtle sensing, gratitude"), ("Return", "back to your own floor"),
             ("Use", "the artifacts fuel the climb on foot")]
    stack(c, steps, rx, y0, rw, 112, 18, numbered=True, hi=2, tsize=30, dsize=19)
    c.quote(80, bot + 70, 920, "Bring it down into the body. An observer without sensing stays in the clouds.", 28)
    return c

@card(34)
def c34():
    c = Card(34, T, "Four quadrants", "Four Sides of Everything",
             "Any person, cup, company or policy has four sides at once. Each discipline sees one and calls it the whole.")
    y0 = c.body_top
    gx, gy, gs = 80, y0 + 40, 330
    quads = [("I", "inner experience only you live", "mission, founder, ethics"),
             ("It", "what can be measured", "metrics, cash flow"),
             ("We", "culture and shared meaning", "culture, rules, agreements"),
             ("Its", "systems and their interactions", "team and tech systems")]
    for i, (t, d, e) in enumerate(quads):
        x = gx + (i % 2)*(gs + 20); y = gy + (i // 2)*(gs + 20)
        c.box(x, y, gs, gs, None, None, fill_a=18 if t == "I" else 10, border_a=170, glow=45 if t == "I" else 0)
        c.text(x + 28, y + 22, t, "serif", 64, BRIGHT, 255)
        c.text(x + 28, y + 112, d, "sans", 20, MOON, 220, maxw=gs - 56, lh=1.34)
        c.text(x + 28, y + gs - 66, e, "serifi", 22, DEEP, 240, maxw=gs - 56, lh=1.15)
    label(c, gx + gs/2, gy - 32, "Interior", align="center")
    label(c, gx + gs + 20 + gs/2, gy - 32, "Exterior", align="center")
    rx, rw = 795, 205
    y = side(c, rx, y0 + 30, rw, [("Singular", "top row"), ("Plural", "bottom row")], tsize=26, dsize=18, gap=24)
    y = side(c, rx, y + 10, rw, [("The trap", "Mistaking one side for the whole: \u201clove is just hormones.\u201d"),
                                 ("Understanding", "happens in I first, then is measured in It.")], tsize=26, dsize=19, gap=24)
    c.text(gx, gy + 2*gs + 40 + 6, "In italics: the same four sides of a business.", "sans", 18, MOON, 180)
    c.quote(80, gy + 2*gs + 100, 920, "Use it as an audit: which side of your life or company have you been neglecting?", 28)
    return c

@card(35)
def c35():
    c = Card(35, T, "The university of the soul", "Love and Wisdom",
             "One curriculum for everyone. Each of us takes it in a unique order, through unique situations, across many lives.")
    y0 = c.body_top
    cx = 540
    pts = []
    for i in range(61):
        t = math.pi * i / 60
        pts.append(((cx - 380*math.cos(t))*S, (y0 + 250 - 200*math.sin(t))*S))
    c.d.line(pts, fill=rgba(MOON, 160), width=2*S, joint="curve")
    c.gd.line(pts, fill=rgba(GLOW, 70), width=10*S)
    c.text(cx, y0 + 110, "Wise love", "serif", 42, BRIGHT, 255, align="center")
    c.text(cx, y0 + 166, "not blind, not self-sacrifice", "sans", 20, MOON, 210, align="center")
    pw, ph = 330, 420
    for i, (t, items) in enumerate([("Love", ["acceptance", "gratitude", "kindness", "compassion", "trust", "service"]),
                                     ("Wisdom", ["discernment", "seeing many where one seemed", "honesty that serves", "saying the uncomfortable thing"])]):
        x = cx - 380 - pw/2 + i*760
        x = max(80, min(x, 1000 - pw))
        y = y0 + 270
        c.box(x, y, pw, ph, None, None, fill_a=16, border_a=160, glow=35)
        c.text(x + pw/2, y + 26, t, "serif", 44, BRIGHT, 255, align="center")
        yy = y + 110
        for it in items:
            yy = c.text(x + pw/2, yy, it, "sans", 21, MOON, 215, align="center", maxw=pw - 40) + 16
    mx, mw = 440, 200
    y = y0 + 300
    label(c, cx, y, "Your path", align="center")
    pp = []
    for i in range(80):
        t = i/79
        pp.append(((cx + 40*math.sin(t*3*math.pi))*S, (y + 40 + t*290)*S))
    c.d.line(pp, fill=rgba(BRIGHT, 200), width=2*S, joint="curve")
    c.dot(cx, y + 330, 5)
    c.quote(80, y0 + 740, 920, "Growth has two sides: potential activating, and lessons worked through. Wisdom takes love to the next rank.", 26)
    return c

@card(36)
def c36():
    c = Card(36, T, "Inner work", "When Something Surfaces",
             "A lesson rises in many forms. Meet it where it is loudest, and feel it rather than analyze it.")
    y0 = c.body_top
    forms = ["thought", "emotion", "block", "posture", "memory"]
    w, gap = 168, 20
    for i, f in enumerate(forms):
        x = 80 + i*(w+gap)
        c.box(x, y0, w, 70, f, None, tsize=22, glow=50 if f == "emotion" else 0, fill_a=22 if f == "emotion" else 8)
    c.arrow(540, y0 + 80, 540, y0 + 120, MOON, 200, head=9)
    steps = [("Choose the loudest", "go where it shows up strongest"),
             ("Feel, don\u2019t analyze", "an emotion: be with it; energy: breathe through it"),
             ("Close your eyes", "vision takes about 80% of attention"),
             ("Let it move", "a felt emotion is never static")]
    yb = stack(c, steps, 80, y0 + 130, 920, 118, 18, numbered=True, tsize=32, dsize=20)
    y = yb + 50
    label(c, 540, y, "The middle path", align="center")
    c.line(140, y + 60, 940, y + 60, MOON, 140, 2)
    c.dot(540, y + 60, 8, glow=150)
    c.text(140, y + 80, "\u201cNothing\u2019s wrong with me\u201d", "sans", 19, MOON, 200)
    c.text(940, y + 80, "\u201cI\u2019m broken, I need healing\u201d", "sans", 19, MOON, 200, align="right")
    c.text(540, y + 118, "Whole and sovereign now, and still releasing.", "serifi", 28, BRIGHT, 245, align="center", maxw=860)
    return c

@card(37)
def c37():
    c = Card(37, T, "Inner work", "One Lesson, Every Layer",
             "One energetic system. A lesson starts far above us and lands, layer by layer, all the way into the cells.")
    y0 = c.body_top
    layers = [("Source", "the cosmos, the planet\u2019s collective growth"),
              ("Soul", "an evolutionary lesson to learn"),
              ("Archetype", "a myth or hero who faced the same lesson"),
              ("Mind", "a limiting belief, often only a partial truth"),
              ("Energy", "a block in the body\u2019s energy blueprint"),
              ("Emotion", "a feeling that was pushed down"),
              ("Body", "tension, a trigger point, hormones, cells")]
    h, gap = 96, 16
    for i, (t, d) in enumerate(layers):
        y = y0 + i*(h+gap)
        inset = i*10
        c.box(80 + inset, y, 700 - 2*inset, h, None, None, fill_a=22 - i*2, border_a=190 - i*15, glow=60 if i == 0 else 0)
        c.text(108 + inset, y + h/2 - 20, t, "serif", 32, BRIGHT, 255)
        c.text(330, y + h/2 - 12, d, "sans", 19, MOON, 215, maxw=430 - inset)
    c.arrow(830, y0 + 20, 830, y0 + 7*(h+gap) - 30, MOON, 150, 1.5)
    c.text(860, y0 + 300, "The physical is a subset of the energetic.", "sans", 19, MOON, 210, maxw=150, lh=1.38)
    c.quote(80, y0 + 7*(h+gap) + 30, 920, "Shortcut: ask which myth tells your lesson, and you\u2019ll see its whole arc.", 28)
    return c

@card(38)
def c38():
    c = Card(38, T, "Spirit", "Spirit, Not Guru",
             "Spirituality is strength of spirit, not a guru on a stage. The strongest spirits often look ordinary.")
    y0 = c.body_top
    cx, cy, R = 540, y0 + 480, 390
    pts = []
    for i in range(61):
        t = math.pi * i / 60
        pts.append(((cx - R*math.cos(t))*S, (cy - 330*math.sin(t))*S))
    c.d.line(pts, fill=rgba(MOON, 150), width=2*S, joint="curve")
    c.gd.line(pts, fill=rgba(GLOW, 60), width=10*S)
    phases = [(0.0, "The child", "expresses selfhood unconsciously"),
              (0.33, "The mold", "society shapes; we resist, then let it"),
              (0.67, "The journey", "the hero\u2019s path, a subset of the spiritual one"),
              (1.0, "Conscious selfhood", "the same self, now with awareness and intent")]
    for t, name, d in phases:
        a = math.pi * t
        x, y = cx - R*math.cos(a), cy - 330*math.sin(a)
        c.dot(x, y, 7, glow=140)
        tx = max(170, min(x, 910))
        ty = y + 26 if t in (0.0, 1.0) else y - 128
        c.text(tx, ty, name, "serif", 30, BRIGHT, 255, align="center", maxw=260, lh=1.1)
        c.text(tx, ty + 42, d, "sans", 18, MOON, 210, align="center", maxw=240, lh=1.32)
    c.text(cx, cy - 60, "Selfhood never changes.", "serifi", 30, BRIGHT, 245, align="center")
    c.text(cx, cy - 16, "Only the awareness around it does.", "sans", 20, MOON, 215, align="center")
    y = cy + 170
    side(c, 80, y, 440, [("Intensity reveals", "An intense life makes the shadows visible.")], tsize=28, dsize=20)
    side(c, 560, y, 440, [("Ordinary on the outside", "Steve Jobs, Michael Singer: strong spirits, no robes.")], tsize=28, dsize=20)
    c.quote(80, y + 150, 920, "Spirituality is strength of spirit.", 30)
    return c

if __name__ == "__main__":
    which = [int(a) for a in sys.argv[1:]] or sorted(cards)
    for n in which:
        p = cards[n]().save(os.path.join(OUT, f"gleb-framework-{n:02d}.png"))
        print(p)
