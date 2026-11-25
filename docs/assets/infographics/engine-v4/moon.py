"""Moonlight infographic kit (FYTT). 1080x1350, rendered at 2x then downsampled."""
import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

B = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(B, "fonts")
S = 2
W, H = 1080, 1350
MOON = (217, 209, 180)
BRIGHT = (233, 228, 207)
DEEP = (207, 194, 154)
GLOW = (236, 230, 208)
BG_TOP = (9, 11, 20)
BG_BOT = (17, 21, 36)

_fc = {}
def font(kind, size):
    key = (kind, size)
    if key in _fc: return _fc[key]
    if kind.startswith("serif"):
        path = os.path.join(F, "CormorantGaramond-Italic[wght].ttf" if kind.endswith("i") else "CormorantGaramond[wght].ttf")
        f = ImageFont.truetype(path, size * S)
        w = {"serif": 600, "serifi": 500, "serifm": 500}.get(kind, 600)
        try: f.set_variation_by_axes([w])
        except Exception: pass
    else:
        wt = {"sans": 400, "sansm": 500, "sansb": 700}[kind]
        f = ImageFont.truetype(os.path.join(F, f"SpaceGrotesk-{wt}.ttf"), size * S)
    _fc[key] = f
    return f

def rgba(c, a=255): return (c[0], c[1], c[2], int(a))

class Card:
    def __init__(self, num, total, eyebrow, title, essence):
        self.num, self.total = num, total
        self.im = Image.new("RGBA", (W*S, H*S))
        self._background()
        self.glow = Image.new("RGBA", self.im.size, (0,0,0,0))
        self.gd = ImageDraw.Draw(self.glow)
        self.layer = Image.new("RGBA", self.im.size, (0,0,0,0))
        self.d = ImageDraw.Draw(self.layer)
        self._header(eyebrow, title, essence)

    # ---------- background ----------
    def _background(self):
        w, h = self.im.size
        grad = Image.new("RGBA", (1, h))
        for y in range(h):
            t = y / h
            grad.putpixel((0, y), tuple(int(BG_TOP[i]*(1-t) + BG_BOT[i]*t) for i in range(3)) + (255,))
        self.im = grad.resize((w, h))
        # moon halo top-right
        halo = Image.new("RGBA", (w, h), (0,0,0,0))
        hd = ImageDraw.Draw(halo)
        cx, cy = int(w*0.86), int(h*0.07)
        for r, a in [(560, 26), (380, 34), (230, 44), (120, 60)]:
            hd.ellipse([cx-r*S, cy-r*S, cx+r*S, cy+r*S], fill=rgba(GLOW, a))
        halo = halo.filter(ImageFilter.GaussianBlur(120*S))
        self.im = Image.alpha_composite(self.im, halo)
        md = Image.new("RGBA", (w, h), (0,0,0,0)); mdd = ImageDraw.Draw(md)
        mx, my, mr = 990*S, 74*S, 26*S
        mdd.ellipse([mx-mr*2.2, my-mr*2.2, mx+mr*2.2, my+mr*2.2], fill=rgba(GLOW, 40))
        md = md.filter(ImageFilter.GaussianBlur(30*S)); mdd = ImageDraw.Draw(md)
        mdd.ellipse([mx-mr, my-mr, mx+mr, my+mr], fill=rgba(BRIGHT, 235))
        mdd.ellipse([mx-mr+13*S, my-mr-6*S, mx+mr+13*S, my+mr-6*S], fill=(0,0,0,0))
        self.im = Image.alpha_composite(self.im, md)
        # opal sheen: faint diagonal iridescent band
        op = Image.new("RGBA", (w, h), (0,0,0,0))
        od = ImageDraw.Draw(op)
        cols = [(180, 200, 230), (210, 190, 225), (190, 225, 210), (233, 228, 207)]
        for i, c in enumerate(cols):
            off = i * 70 * S
            od.polygon([(0, int(h*0.60)+off), (w, int(h*0.30)+off), (w, int(h*0.30)+off+60*S), (0, int(h*0.60)+off+60*S)], fill=rgba(c, 14))
        op = op.filter(ImageFilter.GaussianBlur(70*S))
        self.im = Image.alpha_composite(self.im, op)
        # stars
        rnd = random.Random(7 + 0)
        sd = ImageDraw.Draw(self.im)
        for _ in range(80):
            x, y = rnd.randrange(w), rnd.randrange(h)
            r = rnd.choice([1, 1, 1, 2]) * S // 2
            a = rnd.randrange(12, 48)
            sd.ellipse([x-r, y-r, x+r, y+r], fill=rgba(BRIGHT, a))

    # ---------- text helpers ----------
    def wrap(self, text, f, maxw):
        words, lines, cur = text.split(), [], ""
        for wd in words:
            t = (cur + " " + wd).strip()
            if self.d.textlength(t, font=f) <= maxw*S or not cur:
                cur = t
            else:
                lines.append(cur); cur = wd
        if cur: lines.append(cur)
        return lines

    def text(self, x, y, s, kind="sans", size=24, color=MOON, a=255, anchor="la", maxw=None, lh=1.3, align="left", spacing=0):
        """Draw (wrapped) text at 1x coords. Returns bottom y (1x)."""
        f = font(kind, size)
        lines = self.wrap(s, f, maxw) if maxw else [s]
        yy = y
        for ln in lines:
            if spacing:
                self._spaced(x, yy, ln, f, color, a, anchor, spacing)
            else:
                ax = x
                if align == "center": anc = "ma"
                elif align == "right": anc = "ra"
                else: anc = "la"
                self.d.text((ax*S, yy*S), ln, font=f, fill=rgba(color, a), anchor=anc)
            yy += size * lh
        return yy

    def _spaced(self, x, y, s, f, color, a, anchor, sp):
        total = sum(self.d.textlength(ch, font=f) for ch in s) + sp*S*(len(s)-1)
        cx = x*S - (total/2 if anchor == "center" else 0)
        for ch in s:
            self.d.text((cx, y*S), ch, font=f, fill=rgba(color, a))
            cx += self.d.textlength(ch, font=f) + sp*S

    def text_h(self, s, kind, size, maxw, lh=1.3):
        f = font(kind, size)
        return len(self.wrap(s, f, maxw)) * size * lh

    # ---------- header / footer ----------
    def _header(self, eyebrow, title, essence):
        x = 80
        self.text(x, 78, f"FRAMEWORK {self.num:02d}  ·  {eyebrow.upper()}", "sansm", 17, DEEP, 230, spacing=3)
        self.line(x, 112, x+60, 112, DEEP, 200, 2)
        y = self.text(x, 128, title, "serif", 70, BRIGHT, 255, maxw=920, lh=1.02)
        y += 14
        y = self.text(x, y, essence, "sans", 26, MOON, 225, maxw=900, lh=1.38)
        self.body_top = y + 34

    def footer(self):
        mark = Image.open(os.path.join(B, "fyt-mark-gold.png")).convert("RGBA")
        mark = mark.crop(mark.getbbox())
        # tint to moonlight: use luminance as alpha mask
        g = mark.convert("L")
        a = ImageChops.multiply(g.point(lambda v: min(255, int(v*1.25))), mark.split()[3])
        tinted = Image.new("RGBA", mark.size, rgba(BRIGHT))
        tinted.putalpha(a)
        size = 46 * S
        tinted = tinted.resize((size, int(size * mark.size[1] / mark.size[0])), Image.LANCZOS)
        fy = H - 92
        # glow behind mark
        self.gd.ellipse([80*S - 10*S, fy*S - 10*S, 80*S + size + 10*S, fy*S + size + 10*S], fill=rgba(GLOW, 70))
        self.layer.alpha_composite(tinted, (80*S, fy*S))
        self.text(80 + 46 + 16, fy + 11, "findyourtoptalent.com", "sansm", 22, MOON, 235)
        self.text(1000, fy + 13, f"{self.num:02d} / {self.total:02d}", "sans", 18, DEEP, 170, align="right")
        self.line(80, fy - 26, 1000, fy - 26, MOON, 45, 1)

    # ---------- shapes ----------
    def line(self, x1, y1, x2, y2, c=MOON, a=180, w=2):
        self.d.line([(x1*S, y1*S), (x2*S, y2*S)], fill=rgba(c, a), width=int(w*S))

    def arrow(self, x1, y1, x2, y2, c=MOON, a=200, w=2, head=12, glow=False):
        self.line(x1, y1, x2, y2, c, a, w)
        ang = math.atan2(y2-y1, x2-x1)
        p = [(x2*S, y2*S)]
        for s in (+1, -1):
            p.append(((x2 - head*math.cos(ang + s*0.45))*S, (y2 - head*math.sin(ang + s*0.45))*S))
        self.d.polygon(p, fill=rgba(c, a))

    def arc_arrow(self, cx, cy, r, a0, a1, c=MOON, a=190, w=2, head=13):
        pts = []
        n = 40
        for i in range(n+1):
            t = math.radians(a0 + (a1-a0)*i/n)
            pts.append(((cx + r*math.cos(t))*S, (cy + r*math.sin(t))*S))
        self.d.line(pts, fill=rgba(c, a), width=int(w*S), joint="curve")
        x2, y2 = pts[-1][0]/S, pts[-1][1]/S
        x1, y1 = pts[-3][0]/S, pts[-3][1]/S
        ang = math.atan2(y2-y1, x2-x1)
        p = [(x2*S, y2*S)]
        for s in (+1, -1):
            p.append(((x2 - head*math.cos(ang + s*0.45))*S, (y2 - head*math.sin(ang + s*0.45))*S))
        self.d.polygon(p, fill=rgba(c, a))

    def circle(self, cx, cy, r, c=MOON, a=180, w=2, fill_a=0, glow=0):
        if glow:
            self.gd.ellipse([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], fill=rgba(GLOW, glow))
        self.d.ellipse([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], outline=rgba(c, a), width=int(w*S), fill=rgba(BRIGHT, fill_a) if fill_a else None)

    def dot(self, cx, cy, r=5, c=BRIGHT, a=255, glow=90):
        self.gd.ellipse([(cx-r*3)*S, (cy-r*3)*S, (cx+r*3)*S, (cy+r*3)*S], fill=rgba(GLOW, glow))
        self.d.ellipse([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], fill=rgba(c, a))

    def box(self, x, y, w, h, title=None, sub=None, tsize=26, ssize=19, align="center", fill_a=14, border_a=120, glow=0, pad=18, tkind="sansm", title_color=BRIGHT):
        if glow:
            self.gd.rounded_rectangle([x*S, y*S, (x+w)*S, (y+h)*S], radius=18*S, fill=rgba(GLOW, glow))
        self.d.rounded_rectangle([x*S, y*S, (x+w)*S, (y+h)*S], radius=16*S, fill=rgba(BRIGHT, fill_a), outline=rgba(MOON, border_a), width=int(1.5*S))
        # vertical centering
        th = self.text_h(title, tkind, tsize, w-2*pad, 1.2) if title else 0
        sh = self.text_h(sub, "sans", ssize, w-2*pad, 1.32) if sub else 0
        gap = 8 if (title and sub) else 0
        yy = y + (h - th - sh - gap)/2
        tx = x + w/2 if align == "center" else x + pad
        if title:
            yy = self.text(tx, yy, title, tkind, tsize, title_color, 255, maxw=w-2*pad, lh=1.2, align=align)
        if sub:
            self.text(tx, yy + gap, sub, "sans", ssize, MOON, 215, maxw=w-2*pad, lh=1.32, align=align)

    def note(self, x, y, w, s, size=21, a=215, kind="sans", color=MOON, lh=1.38):
        return self.text(x, y, s, kind, size, color, a, maxw=w, lh=lh)

    def quote(self, x, y, w, s, size=30):
        self.line(x, y+6, x, y + self.text_h(s, "serifi", size, w-24, 1.2) - 4, DEEP, 200, 2)
        return self.text(x+20, y, s, "serifi", size, BRIGHT, 240, maxw=w-24, lh=1.2)

    def save(self, path):
        self.footer()
        g = self.glow.filter(ImageFilter.GaussianBlur(22*S))
        out = Image.alpha_composite(self.im, g)
        out = Image.alpha_composite(out, self.layer)
        out = out.convert("RGB").resize((W, H), Image.LANCZOS)
        out.save(path, optimize=True)
        return path
