"""App icon canvas: 1024x1024, before on the left, after on the right, no text, no footer.

Same engine-v4 primitives and palette as every kit card (orb, dot, circle, ln, iri_* come from V4); only the
canvas, the background (night sky + a dawn bloom behind the after side) and the save differ. Every element is
recorded with its `side` ("before" | "after" | "mid") and its `stroke` (px at 1024: width of a line or ring,
diameter of a dot or orb, narrowest span of a fill) so `lint.check_icon` can hold the icon to the small-size rules.

Calls (coordinates in 1024 px; zones: before centre x=272, after centre x=752, mid x=512):
  with c.side("before"):  ...                 everything drawn inside is logged on that side
  orb(cx, cy, r, tint, glow)                  pearl sphere; tint < 1 dims it, glow 0 = no halo
  dot(cx, cy, r, c, a, glow)                  flat light
  ring(cx, cy, r, w, c, a)                    outline ring, r = radius of the stroke centre
  path(pts, w, c, a)                          round-capped polyline
  fill(pts, c, a, min_dim)                    flat polygon; min_dim = its narrowest span (the caller says, lint trusts)
  iri_fill(pts, a, min_dim)                   thin-film (iridescent) polygon
  chevron(cx, cy, h, w, c, a)                 the arrow between before and after (side "mid")
Export: save(path) writes the 1024 PNG and `<name>@128.png` beside it.

Icons v2 / v3 (spec `icon_version: 2|3`, issues #528, #533): ONE silhouette of the result, drawn inside `side("after")`, no chevron,
on a lunar-ink tile with the app's pastel rising from the bottom (spec `halo: LAV|AQUA|BLUSH|CHAMP|PEARL`). Every line and ring is WEIGHT px wide.
`group="name"` makes repeated identical parts (four equal nodes) count as one shape. `silhouette(px)` redraws the sign
as a filled black shape on white, the 32 px legibility test.
"""
import contextlib
import math
import os

from PIL import Image, ImageDraw, ImageFilter

from kit import skins, vocab as K

SIZE = 1024
S = K.S
BEFORE_X, AFTER_X, MID_X = 272, 752, 512
MARGIN = 80
CENTER = 512
WEIGHT = 48            # v3: the one stroke weight of all five icons (1.5 px at 32 px, 6 px at 128 px = the lint floor); v2 was 64
HALO_START, HALO_MAX, HALO_CURVE = 0.25, 118, 1.3   # pastel gradient: starts at 30% down, alpha 150/255 at the bottom edge
HALOS = {"LAV": K.LAV, "AQUA": K.AQUA, "BLUSH": K.BLUSH, "CHAMP": K.CHAMP, "PEARL": K.PEARL}


def small_path(path):
    """`potential.png` -> `potential@128.png`."""
    stem, ext = os.path.splitext(path)
    return f"{stem}@128{ext}"


class IconCard(K.V4):
    size = SIZE

    def __init__(self, num=1, total=1, halo=None):
        self.skin = skins.get("v4")
        self.num, self.total, self.halo = num, total, halo
        self.log, self._side, self._iri_mask = [], "mid", None
        self.im = Image.new("RGBA", (SIZE * S, SIZE * S))
        self._background()
        self.glow = Image.new("RGBA", self.im.size, (0, 0, 0, 0)); self.gd = ImageDraw.Draw(self.glow)
        self.layer = Image.new("RGBA", self.im.size, (0, 0, 0, 0)); self.d = ImageDraw.Draw(self.layer)

    # ---- canvas ----
    def _background(self):
        w = h = SIZE * S
        grad = Image.new("RGBA", (1, h))
        for y in range(h):
            t = y / h
            grad.putpixel((0, y), tuple(int(K.BG_TOP[i] * (1 - t) + K.BG_BOT[i] * t) for i in range(3)) + (255,))
        self.im = grad.resize((w, h))
        if self.halo is not None:                         # v3: the app's pastel rises from the bottom edge, visible at 64 px
            up = Image.new("RGBA", (1, h))
            for y in range(h):
                t = y / h
                a = HALO_MAX * max(0.0, (t - HALO_START) / (1 - HALO_START)) ** HALO_CURVE
                up.putpixel((0, y), self.halo + (int(a),))
            self.im = Image.alpha_composite(self.im, up.resize((w, h)))
            return
        dawn = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dd = ImageDraw.Draw(dawn)
        cx, cy = AFTER_X * S, 560 * S                     # dawn: light rising behind the after side
        for r, a in ((420, 22), (300, 30), (190, 38)):
            dd.ellipse([cx - r * S, cy - r * S, cx + r * S, cy + r * S], fill=K.rgba(K.GLOW, a))
        dawn = dawn.filter(ImageFilter.GaussianBlur(90 * S))
        self.im = Image.alpha_composite(self.im, dawn)

    @contextlib.contextmanager
    def side(self, name):
        prev, self._side = self._side, name
        try:
            yield
        finally:
            self._side = prev

    def _rec(self, kind, bbox, color, stroke, geom=None, group=None):
        self.log.append(dict(kind=kind, role="body", bbox=tuple(bbox), color=color, container=None,
                             side=self._side, stroke=stroke, geom=geom, group=group))

    # ---- vocabulary (logged) ----
    def orb(self, cx, cy, r, tint=(1, 1, 1), glow=50, seed=None, group=None):
        self._rec("orb", (cx - r, cy - r, cx + r, cy + r), "orb", 2 * r, ("disc", cx, cy, r), group)
        super().orb(cx, cy, r, tint, glow, seed if seed is not None else self.num)

    def dot(self, cx, cy, r=36, c=K.BRIGHT, a=255, glow=90, group=None):
        self._rec("dot", (cx - r, cy - r, cx + r, cy + r), c, 2 * r, ("disc", cx, cy, r), group)
        super().dot(cx, cy, r, c, a, glow)

    def ring(self, cx, cy, r, w=48, c=K.SILVER, a=200, group=None, soft=0):
        """Outline ring, r = radius of the stroke centre. `soft` > 0 adds a glow around the line (alpha of the glow, 0-255)."""
        o = r + w / 2                                      # PIL draws an outline inward from the outer radius
        self._rec("ring", (cx - o, cy - o, cx + o, cy + o), c, w, ("ring", cx, cy, r, w), group)
        if soft:
            g = w * 1.6                                    # the glow layer is blurred at save time
            self.gd.ellipse([(cx - o - g / 2) * S, (cy - o - g / 2) * S, (cx + o + g / 2) * S, (cy + o + g / 2) * S],
                            outline=K.rgba(K.GLOW, soft), width=int((w + g) * S))
        super().circle(cx, cy, o, c, a, w)

    def iri_ring(self, cx, cy, r, w=48, a=200):
        o = r + w / 2
        self._rec("iri_ring", (cx - o, cy - o, cx + o, cy + o), "iri", w)
        super().iri_ring(cx, cy, o, w, a)

    def path(self, pts, w=48, c=K.SILVER, a=200, group=None, smooth=False):
        """Round-capped polyline. `smooth=True` (dense curves): a round dot at every vertex, no jagged joints."""
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        self._rec("ln", (min(xs) - w / 2, min(ys) - w / 2, max(xs) + w / 2, max(ys) + w / 2), c, w,
                  ("path", [tuple(p) for p in pts], w), group)
        if smooth:
            for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
                self.d.line([(x0 * S, y0 * S), (x1 * S, y1 * S)], fill=K.rgba(c, a), width=int(w * S))
            ends = pts
        else:
            super().ln(pts, c, a, w)
            ends = (pts[0], pts[-1])
        for x, y in ends:                                  # round caps (and round joints when smooth)
            self.d.ellipse([(x - w / 2) * S, (y - w / 2) * S, (x + w / 2) * S, (y + w / 2) * S], fill=K.rgba(c, a))

    def fill(self, pts, c=K.SILVER, a=220, min_dim=48, group=None):
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        self._rec("poly", (min(xs), min(ys), max(xs), max(ys)), c, min_dim, ("poly", [tuple(p) for p in pts]), group)
        self.d.polygon([(x * S, y * S) for x, y in pts], fill=K.rgba(c, a))

    def iri_fill(self, pts, a=235, min_dim=48):
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        self._rec("iri_poly", (min(xs), min(ys), max(xs), max(ys)), "iri", min_dim)
        super().iri_poly(pts, a)

    def chevron(self, cx=MID_X, cy=512, h=84, w=48, c=K.QUIET, a=210):
        pts = [(cx - h / 3, cy - h / 2), (cx + h / 3, cy), (cx - h / 3, cy + h / 2)]
        with self.side("mid"):
            self.path(pts, w, c, a)

    # ---- the 32 px test ----
    def silhouette(self, px=32, ss=8):
        """The sign as a filled black shape on white, `px` square (drawn at ss x, then reduced)."""
        n = px * ss
        k = n / SIZE
        im = Image.new("L", (n, n), 255); d = ImageDraw.Draw(im)
        for r in self.log:
            g = r.get("geom")
            if not g:
                continue
            if g[0] == "disc":
                _, cx, cy, rad = g
                d.ellipse([(cx - rad) * k, (cy - rad) * k, (cx + rad) * k, (cy + rad) * k], fill=0)
            elif g[0] == "ring":
                _, cx, cy, rad, w = g
                o = rad + w / 2
                d.ellipse([(cx - o) * k, (cy - o) * k, (cx + o) * k, (cy + o) * k], outline=0, width=max(1, round(w * k)))
            elif g[0] == "poly":
                d.polygon([(x * k, y * k) for x, y in g[1]], fill=0)
            elif g[0] == "path":
                _, pts, w = g
                d.line([(x * k, y * k) for x, y in pts], fill=0, width=max(1, round(w * k)), joint="curve")
                for x, y in (pts[0], pts[-1]):
                    d.ellipse([(x - w / 2) * k, (y - w / 2) * k, (x + w / 2) * k, (y + w / 2) * k], fill=0)
        return im.resize((px, px), Image.LANCZOS)

    # ---- save ----
    def save(self, path):
        g = self.glow.filter(ImageFilter.GaussianBlur(22 * S))
        out = Image.alpha_composite(self.im, g)
        out = Image.alpha_composite(out, self.layer)
        if self._iri_mask is not None:
            strip = _thin_film(*out.size, seed=self.num)
            strip.putalpha(self._iri_mask.point(lambda v: int(v * 0.8)))
            out = Image.alpha_composite(out, strip)
        out = out.convert("RGB").resize((SIZE, SIZE), Image.LANCZOS)
        out.save(path, optimize=True)
        out.resize((128, 128), Image.LANCZOS).save(small_path(path), optimize=True)
        return path


from primitives2 import _thin_film  # noqa: E402  (engine-v4 is on sys.path once vocab is imported)


def card(spec):
    """An IconCard for a spec (`kind: icon`)."""
    halo = spec.get("halo")
    if halo is not None and halo not in HALOS:
        raise ValueError(f"halo {halo!r} is not one of {', '.join(HALOS)}")
    return IconCard(spec.number, spec.total, HALOS[halo] if halo else None)


def polar(cx, cy, r, deg):
    return (cx + r * math.cos(math.radians(deg)), cy + r * math.sin(math.radians(deg)))
