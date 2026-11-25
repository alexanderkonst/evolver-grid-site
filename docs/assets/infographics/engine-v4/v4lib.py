"""v4 visual language for 'Business from first principles' (2026-11-12).
Base: approved v3.1 (moonlight kit, neon title glow halved, thin-film iridescence muted:
saturation 0.65, pearl base 50%, alpha x0.8). Adds: the FYTT star mark as a vector
(circle + all 15 chords of a hexagon = star tetrahedron / cube seen along its diagonal,
reproduced from evolver-grid-site src/assets/original-octahedron-mark.png), volumetric
'lunar light' orbs, thick iridescent fills, and a geometric diagram vocabulary
(hexagon, triangle in 3, quadrants, concentric rings, signals, knobs, sliders, number prisms)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from moon import S, W, H, MOON, BRIGHT, DEEP, GLOW, rgba, font
import primitives2 as P

# brand palette (docs/05-reference/brandbook.md, core pastels + Lunar skin ink)
INK = (230, 235, 242)        # lunar ink #e6ebf2
SILVER = (200, 210, 222)     # #c8d2de
QUIET = (141, 155, 171)      # #8d9bab
LAV = (164, 163, 208)        # #a4a3d0
AQUA = (167, 203, 212)       # #a7cbd4
BLUSH = (206, 164, 174)      # #cea4ae
CHAMP = (206, 201, 176)      # #cec9b0
PEARL = (231, 233, 229)      # #e7e9e5

def hexpts(cx, cy, r, rot=-90):
    return [(cx + r*math.cos(math.radians(rot + 60*k)), cy + r*math.sin(math.radians(rot + 60*k))) for k in range(6)]

def _sphere(r, tint=(1.0, 1.0, 1.0), seed=1):
    """Volumetric pearl orb 'filled with lunar light': RGBA image at 2x."""
    R = int(r*S)
    yy, xx = np.mgrid[-R:R, -R:R].astype("float32") / R
    d2 = xx**2 + yy**2
    inside = d2 <= 1
    z = np.sqrt(np.clip(1 - d2, 0, 1))
    L = np.array([-0.45, -0.55, 0.70]); L /= np.linalg.norm(L)
    diff = np.clip(-0*xx + L[0]*xx + L[1]*yy + L[2]*z, 0, 1)
    spec = np.clip(L[0]*xx + L[1]*yy + L[2]*z, 0, 1) ** 28
    rim = (1 - z) ** 2.2
    # muted thin-film tint across the body
    ang = np.arctan2(yy, xx)
    film = np.stack([0.5+0.5*np.sin(ang*1.0 + seed + 0.0 + 3*z),
                     0.5+0.5*np.sin(ang*1.0 + seed + 2.1 + 3*z),
                     0.5+0.5*np.sin(ang*1.0 + seed + 4.2 + 3*z)], -1)
    pearl = np.array(PEARL) / 255.
    base = 0.5*pearl + 0.5*(0.3 + 0.7*film)
    lum = base.mean(-1, keepdims=True); base = lum + 0.65*(base - lum)
    col = base * np.array(tint)
    core = np.exp(-((xx+0.12)**2 + (yy+0.05)**2) / 0.35)   # lunar light held inside
    shade = (0.42 + 0.50*diff + 0.25*core)[..., None]
    rgb = col*shade + rim[..., None]*0.45*base + spec[..., None]*0.9
    a = np.where(inside, 0.55 + 0.35*diff + 0.5*rim, 0)
    a = np.clip(a, 0, 1) * 0.8
    edge = np.clip((1 - np.sqrt(d2)) * R / 1.5, 0, 1)
    a = a * edge
    arr = np.dstack([np.clip(rgb, 0, 1)*255, a*255]).astype("uint8")
    return Image.fromarray(arr, "RGBA")

class V4(P.NCard):
    def __init__(self, num, total, title, essence, eyebrow=P.EYEBROW):
        super().__init__(num, total, title, essence, eyebrow)

    # ---- iridescent fills (thick elements) ----
    def iri_poly(self, pts, a=120, outline=None, w=3):
        m = self._mask()
        m.polygon([(x*S, y*S) for x, y in pts], fill=int(a*0.95))
        if outline:
            m.line([(x*S, y*S) for x, y in pts + [pts[0]]], fill=int(outline*0.95), width=int(w*S), joint="curve")

    def iri_disc(self, cx, cy, r, a=120):
        self._mask().ellipse([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], fill=int(a*0.95))

    def iri_arc(self, cx, cy, r, a0, a1, w=4, a=200):
        self._mask().arc([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], a0, a1, fill=int(a*0.95), width=int(w*S))

    def iri_path(self, pts, w=3, a=200):
        self._mask().line([(x*S, y*S) for x, y in pts], fill=int(a*0.95), width=int(w*S), joint="curve")

    def ln(self, pts, c=SILVER, a=170, w=2):
        self.d.line([(x*S, y*S) for x, y in pts], fill=rgba(c, a), width=max(1, int(w*S)), joint="curve")

    def poly(self, pts, c=SILVER, a=170, w=2, fill_a=0, fill_c=BRIGHT):
        if fill_a:
            self.d.polygon([(x*S, y*S) for x, y in pts], fill=rgba(fill_c, fill_a))
        self.ln(pts + [pts[0]], c, a, w)

    # ---- the star (brand mark) ----
    def star(self, cx, cy, r, w=None, glow=60, ring=True, a=235, hi=True):
        w = w or max(1.8, r/17)
        P_ = hexpts(cx, cy, r*0.985)
        m = self._mask()
        if glow:
            self.gd.ellipse([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], fill=rgba(GLOW, glow))
        segs = [(P_[i], P_[j]) for i in range(6) for j in range(i+1, 6)]
        for p, q in segs:
            m.line([(p[0]*S, p[1]*S), (q[0]*S, q[1]*S)], fill=int(a*0.95), width=int(w*S))
        if ring:
            m.ellipse([(cx-r-w/2)*S, (cy-r-w/2)*S, (cx+r+w/2)*S, (cy+r+w/2)*S], outline=int(a*0.95), width=int(w*1.2*S))
        if hi:  # tube highlight: a thin bright core offset toward the light
            o = -w*0.18
            for p, q in segs:
                self.d.line([((p[0]+o)*S, (p[1]+o)*S), ((q[0]+o)*S, (q[1]+o)*S)], fill=rgba(INK, 120), width=max(1, int(w*0.32*S)))
            if ring:
                self.d.ellipse([(cx-r+o)*S, (cy-r+o)*S, (cx+r+o)*S, (cy+r+o)*S], outline=rgba(INK, 110), width=max(1, int(w*0.35*S)))

    def orb(self, cx, cy, r, tint=(1, 1, 1), glow=50, seed=None):
        if glow:
            self.gd.ellipse([(cx-r*1.15)*S, (cy-r*1.15)*S, (cx+r*1.15)*S, (cy+r*1.15)*S], fill=rgba(GLOW, glow))
        im = _sphere(r, tint, seed if seed is not None else self.num)
        self.layer.alpha_composite(im, (int((cx-r)*S), int((cy-r)*S)))

    # ---- vocabulary ----
    def knob(self, cx, cy, r, val, label=None, a=220):
        """Volume knob: tick ring, filled arc up to val (0..1), pointer."""
        a0, a1 = 135, 405
        for k in range(21):
            t = math.radians(a0 + (a1-a0)*k/20)
            on = k/20 <= val + 1e-6
            r1, r2 = r+8, r+(18 if k % 5 == 0 else 13)
            self.ln([(cx+r1*math.cos(t), cy+r1*math.sin(t)), (cx+r2*math.cos(t), cy+r2*math.sin(t))], INK if on else QUIET, 230 if on else 110, 2 if on else 1.4)
        self.orb(cx, cy, r, glow=30)
        self.iri_arc(cx, cy, r+3, a0, a0 + (a1-a0)*val, 4, 230)
        t = math.radians(a0 + (a1-a0)*val)
        self.ln([(cx+r*0.25*math.cos(t), cy+r*0.25*math.sin(t)), (cx+r*0.82*math.cos(t), cy+r*0.82*math.sin(t))], INK, 250, 3)
        if label:
            self.text(cx, cy+r+28, label, "sansm", 18, SILVER, 230, align="center")

    def slider(self, x, y, w, val, label=None, right=None):
        self.ln([(x, y), (x+w, y)], QUIET, 140, 3)
        self.iri_path([(x, y), (x+w*val, y)], 5, 230)
        self.orb(x+w*val, y, 13, glow=40)
        if label: self.text(x, y-38, label, "sansm", 18, SILVER, 230)
        if right: self.text(x+w, y-38, right, "sans", 18, QUIET, 230, align="right")

    def wave(self, x, y, w, amp, freq, phase=0, c=INK, a=220, wd=2.4, iri=False, noise=0, seed=0, n=160):
        import random
        rnd = random.Random(seed)
        pts = []
        for i in range(n+1):
            t = i/n
            v = amp*math.sin(2*math.pi*freq*t + phase) + (rnd.uniform(-noise, noise) if noise else 0)
            pts.append((x + w*t, y + v))
        if iri: self.iri_path(pts, wd+1.5, 225)
        else: self.ln(pts, c, a, wd)
        return pts

    def prism(self, cx, cy, n, r=18, c=INK, a=230, w=2, fill_a=0):
        """Number prism glyph (Sasha's 'technological' row): 1 dot, 2 bars, 3 triangle, 4 square, 5..7 polygons with chords."""
        if n == 1:
            self.dot(cx, cy, 5, c, a, glow=50); return
        if n == 2:
            self.ln([(cx-r, cy-6), (cx+r, cy-6)], c, a, w+1); self.ln([(cx-r, cy+6), (cx-4, cy+6)], c, a, w+1); self.ln([(cx+4, cy+6), (cx+r, cy+6)], c, a, w+1); return
        rot = -90 if n != 4 else -45
        pts = [(cx + r*math.cos(math.radians(rot + 360*k/n)), cy + r*math.sin(math.radians(rot + 360*k/n))) for k in range(n)]
        self.poly(pts, c, a, w, fill_a=fill_a)
        if n >= 5:
            for i in range(n):
                for j in range(i+2, n):
                    if (i, j) != (0, n-1): self.ln([pts[i], pts[j]], c, a*0.45, 1)

    def tri_split(self, cx, cy, r, fill=(0.0, 0.0, 0.0), a=170):
        """Triangle split into 3 by its centroid; returns vertices (top, right, left)."""
        V = [(cx + r*math.cos(math.radians(-90 + 120*k)), cy + r*math.sin(math.radians(-90 + 120*k))) for k in range(3)]
        for k in range(3):
            if fill[k]:
                self.iri_poly([V[k], V[(k+1) % 3], (cx, cy)], int(fill[k]*255))
        self.poly(V, SILVER, a, 2)
        for v in V: self.ln([(cx, cy), v], SILVER, a*0.6, 1.4)
        return V

    def rings(self, cx, cy, radii, a=(150, 110, 80, 60), w=1.6, dashed=False):
        for i, r in enumerate(radii):
            al = a[min(i, len(a)-1)]
            if dashed:
                for k in range(0, 360, 6):
                    self.d.arc([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], k, k+3, fill=rgba(SILVER, al), width=int(w*S))
            else:
                self.d.ellipse([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], outline=rgba(SILVER, al), width=max(1, int(w*S)))

    def label(self, x, y, s, align="left", c=QUIET, size=16):
        self.text(x, y, s.upper(), "sansm", size, c, 235, align=align, spacing=0)

    def ctext(self, cx, y, s, kind="sans", size=22, c=MOON, a=225, maxw=300, lh=1.3):
        """Centered, wrapped text block."""
        f = font(kind, size)
        lines = self.wrap(s, f, maxw)
        for ln in lines:
            self.d.text((cx*S, y*S), ln, font=f, fill=rgba(c, a), anchor="ma")
            y += size*lh
        return y

    def rtext(self, x, y, s, kind="sans", size=22, c=MOON, a=225, maxw=300, lh=1.3):
        f = font(kind, size)
        for ln in self.wrap(s, f, maxw):
            self.d.text((x*S, y*S), ln, font=f, fill=rgba(c, a), anchor="ra")
            y += size*lh
        return y

    def _center(self):
        top, bot = int((self.body_top-14)*S), int((H-140)*S)
        crop = lambda im: im.crop((0, top, im.size[0], bot))
        bb = crop(self.layer).split()[3].getbbox()
        if self._iri_mask is not None:
            mb = crop(self._iri_mask).getbbox()
            if mb and bb: bb = (0, min(bb[1], mb[1]), 0, max(bb[3], mb[3]))
        if not bb: return
        dy = ((bot-top) - (bb[3]-bb[1]))//2 - bb[1]
        if dy == 0: return
        for name in ("layer", "glow"):
            im = getattr(self, name); part = crop(im)
            new = im.copy(); new.paste((0,0,0,0), (0, top, im.size[0], bot))
            new.alpha_composite(part, (0, max(0, top+dy)) if dy > 0 else (0, top+dy) if top+dy >= 0 else (0, 0))
            setattr(self, name, new)
        self.d = ImageDraw.Draw(self.layer); self.gd = ImageDraw.Draw(self.glow)
        if self._iri_mask is not None:
            m = self._iri_mask; part = m.crop((0, top, m.size[0], bot))
            new = m.copy(); new.paste(0, (0, top, m.size[0], bot)); new.paste(part, (0, top+dy), part)
            self._iri_mask = new

    def footer(self):
        fy = H - 92
        self.star(80+23, fy+23, 22, w=1.8, glow=50)
        self.text(80 + 46 + 16, fy + 11, "findyourtoptalent.com", "sansm", 22, MOON, 235)
        self.text(1000, fy + 13, f"{self.num:02d} / {self.total:02d}", "sans", 18, DEEP, 170, align="right")
        self.line(80, fy - 26, 1000, fy - 26, MOON, 45, 1)
        self.iri_line(80, H - 118, 1000, H - 118, 1, 90)
