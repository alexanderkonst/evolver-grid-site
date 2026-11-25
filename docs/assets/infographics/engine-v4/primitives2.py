from PIL import ImageFilter
"""Business from first principles: Sasha's 2026-11-11 dictation as a minimal series.
Style v2: moonlight kit + neon green title + quiet iridescent accents."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from moon import *
import moon
from cards2 import stack
def column(c, x, y, w, h, head, sub, items, good=True, hsize=46):
    c.box(x, y, w, h, None, None, fill_a=22 if good else 8, border_a=170 if good else 80, glow=50 if good else 0)
    c.text(x+30, y+30, head, "serif", hsize+6, BRIGHT if good else MOON, 255)
    yy = c.text(x+30, y+30+(hsize+6)*1.15, sub, "sans", 24, DEEP, 230, maxw=w-60) + 34
    for it in items:
        c.text(x+30, yy, "\u2014", "sans", 26, DEEP, 200)
        yy = c.text(x+66, yy, it, "sans", 26, BRIGHT if good else MOON, 235 if good else 200, maxw=w-96, lh=1.32) + 24
    return yy

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out", "primitives")
os.makedirs(OUT, exist_ok=True)
NEON = (150, 222, 70)          # backlit heliconia leaf / young iguana, sampled by eye
NEON_HI = (186, 238, 104)      # light through the leaf
NEON_LO = (108, 190, 44)       # iguana flank
IRI = [(255, 140, 220), (170, 140, 255), (110, 220, 255), (130, 255, 200), (255, 230, 150), (255, 140, 220)]
EYEBROW = "Business from first principles"

def _thin_film(w, h, seed=7):
    import numpy as np
    lw, lh = max(8, w // 16), max(8, h // 16)
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:lh, 0:lw] / np.array([lh, lw]).reshape(2, 1, 1)
    d = 360 + 520 * (0.6 * xx + 0.4 * yy)
    for k in range(4):  # soft swirls, like oil on wet asphalt
        fx, fy, ph = rng.uniform(1, 3.5), rng.uniform(1, 3.5), rng.uniform(0, 6.28)
        d += 55 / (k + 1) * np.sin(6.28 * (fx * xx + fy * yy) + ph + np.sin(6.28 * fy * xx) )
    n = 1.33
    lam = np.array([640., 545., 455.]).reshape(3, 1, 1)
    refl = np.sin(2 * np.pi * n * d[None] / lam) ** 2          # soap-film interference
    film = refl.transpose(1, 2, 0)
    pearl = np.array([236, 232, 226]) / 255.
    col = 0.50 * pearl + 0.50 * (0.25 + 0.75 * film)           # pearl base keeps it quiet
    lum = col.mean(axis=2, keepdims=True)
    col = lum + 0.65 * (col - lum)                                # restrained saturation
    arr = (np.clip(col, 0, 1) * 255).astype("uint8")
    im = Image.fromarray(arr, "RGB").resize((w, h), Image.BICUBIC).convert("RGBA")
    return im

def _iri_strip(w, h):
    g = Image.new("RGBA", (w, h))
    px = []
    n = len(IRI) - 1
    for x in range(w):
        t = (x / (380 * S) + 0.0) % n
        i = min(int(t), n - 1); f = t - i
        a, b = IRI[i], IRI[i + 1]
        px.append(tuple(int(a[k] * (1 - f) + b[k] * f) for k in range(3)) + (255,))
    row = Image.new("RGBA", (w, 1)); row.putdata(px)
    return row.resize((w, h))

class NCard(Card):
    def __init__(self, num, total, title, essence, eyebrow=EYEBROW):
        self._iri_mask = None
        super().__init__(num, total, eyebrow, title, essence)

    def _mask(self):
        if self._iri_mask is None:
            self._iri_mask = Image.new("L", self.im.size, 0)
            self._md = ImageDraw.Draw(self._iri_mask)
        return self._md

    def iri_line(self, x1, y1, x2, y2, w=3.5, a=175):
        self._mask().line([(x1*S, y1*S), (x2*S, y2*S)], fill=int(a*0.95), width=int(w*S))

    def iri_ring(self, cx, cy, r, w=3.5, a=200):
        self._mask().ellipse([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], outline=int(a*0.95), width=int(w*S))

    def iri_box(self, x, y, w, h, a=160, width=3):
        self._mask().rounded_rectangle([x*S, y*S, (x+w)*S, (y+h)*S], radius=16*S, outline=int(a*0.95), width=int(width*S))

    def _header(self, eyebrow, title, essence):
        x = 80
        self.text(x, 78, f"{self.num:02d}  ·  {eyebrow.upper()}", "sansm", 17, DEEP, 230, spacing=3)
        self.iri_line(x, 112, x+90, 112, 3, 240)
        f = font("serif", 70)
        lines = self.wrap(title, f, 920)
        yy = 128
        y0 = yy
        tmask = Image.new("L", self.im.size, 0); td = ImageDraw.Draw(tmask)
        for ln in lines:
            self.gd.text((x*S, yy*S), ln, font=f, fill=rgba(NEON, 46))
            td.text((x*S, yy*S), ln, font=f, fill=255)
            yy += 70 * 1.02
        import numpy as np
        hgt = self.im.size[1]
        t = np.clip((np.arange(hgt) / S - y0) / max(1, (yy - y0)), 0, 1)[:, None]
        hi, lo = np.array(NEON_HI), np.array(NEON_LO)
        grad = (hi * (1 - t) + lo * t).astype("uint8")
        g = np.repeat(grad[:, None, :], self.im.size[0], axis=1).reshape(hgt, self.im.size[0], 3)
        base = Image.fromarray(g, "RGB").convert("RGBA")
        from PIL import ImageChops
        for rad, k in ((24, 0.28), (8, 0.38)):   # wide breath, then close halo
            gm = tmask.filter(ImageFilter.GaussianBlur(rad*S)).point(lambda v, k=k: int(min(255, v*k*1.6)))
            gl = Image.fromarray(np.clip(g.astype("int16") - 10, 0, 255).astype("uint8"), "RGB").convert("RGBA")
            gl.putalpha(gm); self.layer.alpha_composite(gl)
        gi = base.copy(); gi.putalpha(tmask)
        self.layer.alpha_composite(gi)
        yy += 14
        yy = self.text(x, yy, essence, "sans", 26, MOON, 225, maxw=900, lh=1.38)
        self.body_top = yy + 40

    def quote(self, x, y, w, s, size=30):
        h = self.text_h(s, "serifi", size, w-24, 1.2)
        self.iri_line(x, y+6, x, y + h - 4, 2, 230)
        return self.text(x+20, y, s, "serifi", size, BRIGHT, 240, maxw=w-24, lh=1.2)

    def footer(self):
        super().footer()
        self.iri_line(80, H - 118, 1000, H - 118, 1, 90)

    def _center(self):
        top, bot = int((self.body_top-14)*S), int((H-140)*S)
        def crop(im): return im.crop((0, top, im.size[0], bot))
        bb = crop(self.layer).split()[3].getbbox()
        if not bb: return
        dy = ((bot-top) - (bb[3]-bb[1]))//2 - bb[1]
        if dy <= 0: return
        for name in ("layer", "glow"):
            im = getattr(self, name); part = crop(im)
            new = im.copy(); new.paste((0,0,0,0), (0, top, im.size[0], bot))
            new.alpha_composite(part, (0, top+dy))
            setattr(self, name, new)
        self.d = ImageDraw.Draw(self.layer); self.gd = ImageDraw.Draw(self.glow)
        if self._iri_mask is not None:
            m = self._iri_mask; part = m.crop((0, top, m.size[0], bot))
            new = m.copy(); new.paste(0, (0, top, m.size[0], bot)); new.paste(part, (0, top+dy), part)
            self._iri_mask = new

    def save(self, path):
        self._center()
        self.footer()
        g = self.glow.filter(ImageFilter.GaussianBlur(22*S))
        out = Image.alpha_composite(self.im, g)
        out = Image.alpha_composite(out, self.layer)
        if self._iri_mask is not None:
            strip = _thin_film(*out.size, seed=self.num)
            strip.putalpha(self._iri_mask.point(lambda v: int(v*0.8)))
            out = Image.alpha_composite(out, strip)
        out = out.convert("RGB").resize((W, H), Image.LANCZOS)
        out.save(path, optimize=True)
        return path
    def footer_line_off(self): pass

# neutralise base footer rule (we draw iridescent one)
_base_line = Card.line

T = 19
cards = []
def card(fn): cards.append(fn); return fn

def chain(c, y, items, w=920, x=80, h=150, gap=24):
    """Vertical chain of boxes with arrows."""
    for i, (t, d) in enumerate(items):
        yy = y + i*(h+gap+20)
        c.box(x, yy, w, h, t, d, tsize=38, ssize=24)
        if i < len(items)-1:
            c.arrow(x+w/2, yy+h+4, x+w/2, yy+h+gap+16, MOON, 190, 2, head=9)
    return y + len(items)*(h+gap+20) - gap - 20

@card
def p01(n):
    c = NCard(n, T, "Two Humans", "Every business, even deep tech, is a relationship between people.")
    y = c.body_top + 60
    c.circle(330, y+120, 90, BRIGHT, 230, 2, glow=70); c.iri_ring(330, y+120, 104, 1, 150)
    c.circle(750, y+120, 90, BRIGHT, 230, 2, glow=70); c.iri_ring(750, y+120, 104, 1, 150)
    c.text(330, y+105, "human", "serif", 36, BRIGHT, 255, align="center")
    c.text(750, y+105, "human", "serif", 36, BRIGHT, 255, align="center")
    c.arrow(430, y+100, 650, y+100, BRIGHT, 220, 2)
    c.arrow(650, y+140, 430, y+140, MOON, 170, 2)
    c.quote(80, y+340, 920, "Remove the humans and it is no longer a business.", 34)
    return c

@card
def p02(n):
    c = NCard(n, T, "Process, Change, Exchange", "What happens between the two.")
    y = c.body_top + 20
    stack(c, [("Process", "how the change is made"),
              ("Change", "the result the receiver gets"),
              ("Exchange", "the receiver restores the balance: money, and not only money")],
          80, y, 920, 160, 24, numbered=True, tsize=40, dsize=24)
    c.quote(80, y+580, 920, "One side mostly gives, the other mostly receives.", 32)
    return c

@card
def p03(n):
    c = NCard(n, T, "The DNA of a Business", "Six cells. Every business that holds has all six.")
    y = c.body_top + 10
    els = ["Uniqueness", "Myth", "Tribe", "Transition", "Promise", "Tagline"]
    for i, e in enumerate(els):
        col, r = i % 2, i // 2
        x = 80 + col*470; yy = y + r*190
        c.box(x, yy, 450, 165, e, None, tsize=40, fill_a=14, border_a=120)
        if i == 5: c.iri_box(x-6, yy-6, 462, 177, 200, 2)
        c.text(x+22, yy+14, f"{i+1}", "sansm", 16, DEEP, 220)
    c.quote(80, y+610, 920, "Six is the core. Everything else grows on top.", 32)
    return c

@card
def p04(n):
    c = NCard(n, T, "Uniqueness and Myth", "Where the energy comes from, and what it does to the space.")
    y = c.body_top + 20
    c.box(80, y, 920, 170, "Uniqueness", "the source the energy flows from", tsize=40, ssize=22)
    c.arrow(540, y+180, 540, y+240, BRIGHT, 220, 2)
    c.box(80, y+250, 920, 170, "Myth", "polarizes people and makes reality more coherent around it", tsize=40, ssize=22)
    c.quote(80, y+470, 920, "Not a distortion field. A coherence field.", 32)
    return c

@card
def p05(n):
    c = NCard(n, T, "Tribe and Transition", "Who the myth calls, and what they are walking through.")
    y = c.body_top + 20
    chain(c, y, [("Tribe", "people who polarize toward the myth"),
                 ("Transition", "the passage they are in right now"),
                 ("Cost of inaction", "what staying still costs them")])
    c.quote(80, y+600, 920, "No transition, no reason to move.", 32)
    return c

@card
def p06(n):
    c = NCard(n, T, "Promise Becomes Tagline", "The founder walked further. The promise takes others there.")
    y = c.body_top + 20
    c.box(80, y, 920, 130, "Transformational promise", "the next steps of the path, offered", tsize=32, ssize=21)
    c.arrow(540, y+140, 540, y+200, BRIGHT, 220, 2)
    c.box(140, y+210, 800, 150, "Tagline", "for whom  ·  what change  ·  how", tsize=48, ssize=24, glow=60, border_a=200)
    c.iri_box(132, y+202, 816, 166, 210, 2)
    c.quote(80, y+420, 920, "The whole business in one sentence.", 32)
    return c

@card
def p07(n):
    c = NCard(n, T, "One Signal, Many Formats", "Deck, demo, pitch: the same signal in different clothes.")
    y = c.body_top + 20
    fm = ["Deck", "Demo", "Elevator pitch", "1-min video", "Networking line", "Product Hunt one-liner"]
    for i, e in enumerate(fm):
        col, r = i % 2, i // 2
        c.box(80 + col*470, y + r*110, 450, 92, e, None, tsize=28, fill_a=8, border_a=90)
    yy = y + 3*110 + 10
    c.arrow(540, yy, 540, yy+50, BRIGHT, 220, 2)
    c.box(240, yy+60, 600, 100, "Tagline", None, tsize=40, glow=60, border_a=200)
    c.iri_box(232, yy+52, 616, 116, 210, 2)
    c.quote(80, yy+210, 920, "Work on one sentence before a whole deck.", 30)
    return c

@card
def p08(n):
    c = NCard(n, T, "Human Signal First", "AI needs a human signal. Without one, it gives low-signal output.")
    y = c.body_top + 20
    chain(c, y, [("Human writes raw", "the first signal, in their own words"),
                 ("AI amplifies", "structure, range, polish"),
                 ("Human polishes", "to the next level")])
    c.quote(80, y+600, 920, "At every stage of building a unique business.", 30)
    return c

@card
def p09(n):
    c = NCard(n, T, "Primitive or Noise", "Skip the primitive and you start solving with your head.")
    y = c.body_top + 10
    column(c, 80, y, 440, 560, "Primitive", "start here", ["a real story", "progress you can feel", "one clear sentence"], good=True, hsize=42)
    column(c, 560, y, 440, 560, "Noise", "skip it", ["a puzzle that never solves", "you convince yourself you moved", "no certainty at all"], good=False, hsize=42)
    c.quote(80, y+610, 920, "Begin with what cannot be removed.", 32)
    return c

@card
def p10(n):
    c = NCard(n, T, "Two Signals", "Co-founders are two signals. They amplify or they collide.")
    y = c.body_top + 30
    # in tune
    for k, x0 in enumerate([80, 560]):
        c.box(x0, y, 440, 330, None, None, fill_a=14 if k == 0 else 6, border_a=150 if k == 0 else 80)
        c.text(x0+220, y+26, "in tune" if k == 0 else "in conflict", "serif", 36, BRIGHT if k == 0 else MOON, 255, align="center")
        pts1, pts2 = [], []
        for i in range(61):
            xx = x0 + 40 + i*6
            pts1.append((xx*S, (y+180 + 40*math.sin(i/6))*S))
            ph = 0 if k == 0 else math.pi
            pts2.append((xx*S, (y+200 + 40*math.sin(i/6 + ph))*S))
        c.d.line(pts1, fill=rgba(BRIGHT, 220), width=int(2*S))
        c.d.line(pts2, fill=rgba(MOON if k else BRIGHT, 160), width=int(2*S))
        c.text(x0+220, y+270, "they amplify" if k == 0 else "friction", "sans", 22, MOON, 220, align="center")
    c.quote(80, y+390, 920, "Friction means they want different things.", 32)
    return c

@card
def p11(n):
    c = NCard(n, T, "Business and Product", "Each founder has a unique business. Together they build one product.")
    y = c.body_top + 40
    c.circle(420, y+190, 180, BRIGHT, 200, 2, glow=40)
    c.circle(660, y+190, 180, BRIGHT, 200, 2, glow=40)
    c.iri_ring(540, y+190, 70, 2, 220)
    c.text(330, y+175, "founder A", "serif", 30, BRIGHT, 255, align="center")
    c.text(750, y+175, "founder B", "serif", 30, BRIGHT, 255, align="center")
    c.text(540, y+165, "the", "sans", 20, MOON, 230, align="center")
    c.text(540, y+190, "product", "sansm", 22, BRIGHT, 255, align="center")
    c.quote(80, y+430, 920, "Investors buy a share of the product, not of the founders.", 30)
    return c

@card
def p12(n):
    c = NCard(n, T, "One Product, One Button", "A business starts with one product. A product is one change.")
    y = c.body_top + 60
    c.circle(540, y+170, 170, BRIGHT, 230, 2, glow=90); c.iri_ring(540, y+170, 188, 2, 200)
    c.text(540, y+145, "one result", "serif", 44, BRIGHT, 255, align="center")
    c.quote(80, y+430, 920, "A series of products from day one is defocus. Business suicide.", 30)
    return c

@card
def p13(n):
    c = NCard(n, T, "Start With Who", "A result can't be invented in a vacuum.")
    y = c.body_top + 20
    chain(c, y, [("Who", "the relationship comes first"),
                 ("What change", "the result they actually get"),
                 ("How", "the process, last")])
    c.quote(80, y+600, 920, "Customer development: what is it for, and when is it done?", 30)
    return c

@card
def p14(n):
    c = NCard(n, T, "Two Dead Ends", "The usual way to find demand: guess segments, test, wait for a hit.")
    y = c.body_top + 10
    column(c, 80, y, 440, 560, "Manipulate", "cut corners", ["manufactured need", "pressure and fear", "impulse buying"], good=False, hsize=40)
    column(c, 560, y, 440, 560, "Grind", "brute force", ["endless segments", "work like a machine", "the product bolted on"], good=False, hsize=40)
    c.quote(80, y+610, 920, "Both skip the primitive.", 32)
    return c

@card
def p15(n):
    c = NCard(n, T, "Equity VC Is a Casino", "Investors who buy shares are placing bets.")
    y = c.body_top + 20
    chain(c, y, [("Bet", "we read the market better than others"),
                 ("Fuel", "pump the founder with money to go all in"),
                 ("Wait", "the bet plays, or it doesn't")])
    c.quote(80, y+600, 920, "Some truth in it. And primitives nobody sees.", 30)
    return c

@card
def p16(n):
    c = NCard(n, T, "The Interchangeable Founder", "How the equity game sees the person running the company.")
    y = c.body_top + 20
    stack(c, [("Burning", "read as a sign the founder will reach the result"),
              ("Replaceable", "anyone who ticks the same boxes will do"),
              ("Diluted", "the founder's share, as far as possible"),
              ("Not personal", "just business: hard, high-status, burnout")],
          80, y, 920, 135, 20, tsize=38, dsize=23)
    c.quote(80, y+640, 920, "A unique business can't swap its founder.", 30)
    return c

@card
def p17(n):
    c = NCard(n, T, "Sell What They Want", "Give what they need inside it.")
    y = c.body_top + 10
    column(c, 80, y, 440, 560, "Sell the need", "what I see", ["they barely notice what they got", "the value stays hidden"], good=False, hsize=40)
    column(c, 560, y, 440, 560, "Sell the want", "what they ask for", ["they get it", "and find out it works differently", "the real gift shows itself"], good=True, hsize=40)
    c.quote(80, y+610, 920, "The want is the door. The need is the room.", 32)
    return c

@card
def p18(n):
    c = NCard(n, T, "Ready to Receive", "Traditions asked what a student needs before deep knowledge is given.")
    y = c.body_top + 10
    stack(c, [("Discernment", "viveka: the real from the passing"),
              ("Detachment", "vairagya: free from the pull of results"),
              ("Self-discipline", "shat-sampat: calm, restraint, faith, focus"),
              ("Burning wish", "mumukshutva: wanting freedom more than comfort")],
          80, y, 920, 135, 20, numbered=True, tsize=36, dsize=23)
    c.quote(80, y+640, 920, "Vedanta's four qualities. Depth meets readiness.", 30)
    return c

@card
def p19(n):
    c = NCard(n, T, "Find the Primitive", "A session plan: from one question to one sentence.", eyebrow="Pitch session")
    y = c.body_top
    stack(c, [("Ask", "what is business to you? why this story?"),
              ("Primitives", "two humans, process, change, exchange"),
              ("DNA", "which of the six cells are empty?"),
              ("Signals", "where the co-founders meet"),
              ("Amplify", "their words first, then AI"),
              ("One sentence", "for whom, what change, how")],
          80, y, 920, 112, 14, numbered=True, tsize=34, dsize=22)
    return c

gains = []
def gain(fn): gains.append(fn); return fn
GE = "The Crossing  \u00b7  what you received"

@gain
def g1(n):
    c = NCard(n, 3, "Not Results. Organs.", "You came for energy and clarity. You left with what produces them.", eyebrow=GE)
    y = c.body_top
    column(c, 80, y, 440, 600, "Asked for", "July 2026", ["energy back", "clarity: what and why", "a new world model", "mission and scale"], good=False, hsize=40)
    column(c, 560, y, 440, 600, "Also got", "not on the list", ["the observer", "a sense of depth", "your own ground", "why Aspect burned", "words for your story"], good=True, hsize=40)
    c.iri_box(554, y-6, 452, 612, 190, 2)
    c.quote(80, y+650, 920, "Results fade. Organs keep working on their own.", 32)
    return c

def three(c, y, rows):
    return stack(c, rows, 80, y, 920, 175, 22, tsize=38, dsize=23)

@gain
def g2(n):
    c = NCard(n, 3, "The Observer", "A thought or a feeling used to be you. Now you can look at it.", eyebrow=GE)
    y = c.body_top
    three(c, y, [("What it is", "\u201cthere is fear in me\u201d instead of being the fear; a pause between event and reaction"),
                 ("Why it matters", "Kegan: each new stage starts when yesterday\u2019s self becomes an object. It is the engine of growth itself"),
                 ("What it gives", "fewer hijacks, more choice; decisions not from fear or from proving; calm in the pitch")])
    c.quote(80, y+620, 920, "The next step: mental habits that change reactions.", 30)
    return c

@gain
def g3(n):
    c = NCard(n, 3, "Depth", "The world stopped being flat. You feel its depth, not only think it.", eyebrow=GE)
    y = c.body_top
    three(c, y, [("What it is", "people, choices, ideas gained an inside; feeling became an organ of perception"),
                 ("Why it matters", "energy from proving runs out; energy from depth renews itself. Energy went 3 \u2192 8"),
                 ("What it gives", "a second way to tell real from fake; a founder who knows states from the inside")])
    c.quote(80, y+620, 920, "\u201cDid you know this is possible?\u201d", 34)
    return c

noos = []
def noo(fn): noos.append(fn); return fn
NE = "Business from first principles  \u00b7  the noosphere"

@noo
def n1(n):
    c = NCard(n, 3, "Every Cell Has a Neighbor", "The world already knows each piece. Nobody holds all six from one source.", eyebrow=NE)
    y = c.body_top
    rows = [("Two humans", "Christensen: people hire a product to make progress"),
            ("Who first", "Blank: customer development, out of the building"),
            ("Myth, tribe", "Godin: Tribes; Campbell: the hero's journey"),
            ("Transition, promise", "Miller: the customer is the hero, the brand the guide"),
            ("Tagline", "Dunford: positioning; Ries and Trout"),
            ("Uniqueness", "Thiel: a secret few people agree with")]
    for i, (a, b) in enumerate(rows):
        yy = y + i*104
        c.box(80, yy, 920, 88, None, None, fill_a=10, border_a=90)
        c.text(108, yy+28, a, "serif", 30, BRIGHT, 255)
        c.text(400, yy+32, b, "sans", 22, MOON, 225, maxw=580)
    c.quote(80, y+650, 920, "New here: all six grown from the founder\u2019s uniqueness.", 30)
    return c

@noo
def n2(n):
    c = NCard(n, 3, "The Founder, Replaced", "Wasserman, Harvard: 212 US startups from the late 1990s and early 2000s.", eyebrow=NE)
    y = c.body_top + 20
    data = [("year 3", 50, "still CEO"), ("year 4", 40, "still CEO"), ("at IPO", 25, "led it, at most")]
    for i, (lab, v, note) in enumerate(data):
        yy = y + i*170
        c.text(80, yy, lab, "sansm", 22, DEEP, 230)
        c.box(80, yy+40, 920, 80, None, None, fill_a=6, border_a=70)
        wv = 920 * v / 100
        c.box(80, yy+40, wv, 80, None, None, fill_a=40, border_a=200, glow=50)
        c.iri_line(80+wv, yy+44, 80+wv, yy+116, 3, 240)
        c.text(80+wv+24, yy+58, f"{v}%  {note}", "serif", 34, BRIGHT, 255)
    c.quote(80, y+540, 920, "Rich or king: few founders are both.", 32)
    return c

@noo
def n3(n):
    c = NCard(n, 3, "Most Venture Funds Lose to an Index Fund",
              "The Kauffman Foundation checked 100 venture funds it invested in over 20 years (2012).", eyebrow=NE)
    y = c.body_top + 10
    cols, r, gap, rg = 10, 20, 64, 52
    x0 = 540 - (cols-1)*gap/2
    for k in range(100):
        cx = x0 + (k % cols)*gap; cy = y + 28 + (k // cols)*rg
        if k < 20:
            c.circle(cx, cy, r, BRIGHT, 240, 2, glow=60); c.iri_ring(cx, cy, r+5, 3, 230)
        elif k < 38:
            c.circle(cx, cy, r, MOON, 170, 2)
        else:
            c.circle(cx, cy, r, DEEP, 110, 1.5)
    yy = y + 28 + 10*rg
    rows = [(BRIGHT, 250, "20 funds", "clearly beat the stock market (by 3%+ a year)"),
            (MOON, 210, "18 funds", "about the same as the stock market"),
            (DEEP, 200, "62 funds", "did worse than a simple index fund, after fees")]
    for i, (col, a, h, t) in enumerate(rows):
        ly = yy + i*46
        if i == 0:
            c.circle(96, ly+16, 11, BRIGHT, 240, 2, glow=60); c.iri_ring(96, ly+16, 15, 3, 230)
        elif i == 1:
            c.circle(96, ly+16, 11, MOON, 170, 2)
        else:
            c.circle(96, ly+16, 11, DEEP, 110, 1.5)
        c.text(124, ly, h, "sansm", 25, BRIGHT, 245)
        c.text(250, ly+2, t, "sans", 23, MOON, 215)
    c.quote(80, yy+165, 920, "Managers earn fees either way. Founders and investors carry the risk.", 28)
    return c

if __name__ == "__main__":
    if sys.argv[1:] == ["noos"]:
        for i, f in enumerate(noos, 1):
            print(f(i).save(os.path.join(OUT, f"noosphere-{i}.png")))
        sys.exit()
    if sys.argv[1:] == ["gains"]:
        for i, f in enumerate(gains, 1):
            print(f(i).save(os.path.join(OUT, f"gleb-gains-{i}.png")))
        sys.exit()
    only = [int(a) for a in sys.argv[1:]]
    for i, f in enumerate(cards, 1):
        if only and i not in only: continue
        print(f(i).save(os.path.join(OUT, f"primitives-{i:02d}.png")))
