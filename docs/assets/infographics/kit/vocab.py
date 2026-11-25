"""Drawing vocabulary: engine-v4's V4 card, re-exported and instrumented. A vocabulary, not layouts.

Nothing here draws differently from engine-v4. `KitCard` subclasses `V4` and, around every drawing call,
records what was drawn (kind, bounding box in 1x px, colour, measured text lines) into `card.log`.
`lint.py` reads that log; it never looks at pixels.

Calls (all methods of the card `c`, coordinates in 1080x1350 px):
  canvas + background   card(spec) / KitCard(...)   gradient, moon halo, opal sheen, stars (drawn at init)
  title, caption        spec title (neon, serif 70) + spec caption under it; eyebrow above
  moon / orb            orb, dot, circle, iri_disc
  light / star          star (the FYT mark), dot (glow)
  line / arc / path     ln, line, arrow, arc_arrow, iri_line, iri_arc, iri_path, wave, head(), arc_pts()
  node / prism / rings  prism, rings, tri_split, poly, iri_poly, box, iri_box, knob, slider
  caption / label       text, ctext, rtext, label, tag()
  quote                 quote (iridescent bar + serif italic)
  chain                 chain(), stack(), column() (free functions: vertical chain / numbered stack / two columns)
  footer                drawn on save(): star mark + findyourtoptalent.com + "NN / TT"
"""
import inspect

from kit import skins

_V4 = skins.get("v4")  # puts engine-v4 on sys.path
import moon                                      # noqa: E402
from moon import S, W, H, font                   # noqa: E402
from v4lib import (V4, INK, SILVER, QUIET, LAV, AQUA, BLUSH, CHAMP, PEARL, hexpts)  # noqa: E402,F401
from moon import MOON, BRIGHT, DEEP, GLOW, BG_TOP, BG_BOT, rgba  # noqa: E402,F401
from primitives2 import NEON, NEON_HI, NEON_LO, IRI, EYEBROW, chain  # noqa: E402,F401
from primitives_v4 import tag, head, arc_pts     # noqa: E402,F401
from cards2 import stack, column                 # noqa: E402,F401

DARK = _V4.palette["DARK"]  # ink for text set on a light orb


class SkinHasNoRenderer(Exception):
    pass


def _pts(a):
    xs = [p[0] for p in a["pts"]]; ys = [p[1] for p in a["pts"]]
    return (min(xs), min(ys), max(xs), max(ys))


def _circ(cx, cy, r):
    return (cx - r, cy - r, cx + r, cy + r)


def _seg(a):
    return (min(a["x1"], a["x2"]), min(a["y1"], a["y2"]), max(a["x1"], a["x2"]), max(a["y1"], a["y2"]))


def _arc(a):
    ps = arc_pts(a["cx"], a["cy"], a["r"], a["a0"], a["a1"])
    return _pts({"pts": ps})


# name -> (bounding box from bound args, colour from bound args). Colour is an RGB, or a token string
# ("iri", "orb") for skin-native shaded output that is not a palette entry, or None.
_PRIMS = {
    "ln": (_pts, lambda a: a["c"]),
    "poly": (_pts, lambda a: a["c"]),
    "iri_poly": (_pts, lambda a: "iri"),
    "iri_path": (_pts, lambda a: "iri"),
    "iri_disc": (lambda a: _circ(a["cx"], a["cy"], a["r"]), lambda a: "iri"),
    "iri_ring": (lambda a: _circ(a["cx"], a["cy"], a["r"]), lambda a: "iri"),
    "iri_arc": (_arc, lambda a: "iri"),
    "iri_line": (_seg, lambda a: "iri"),
    "iri_box": (lambda a: (a["x"], a["y"], a["x"] + a["w"], a["y"] + a["h"]), lambda a: "iri"),
    "line": (_seg, lambda a: a["c"]),
    "arrow": (_seg, lambda a: a["c"]),
    "arc_arrow": (_arc, lambda a: a["c"]),
    "circle": (lambda a: _circ(a["cx"], a["cy"], a["r"]), lambda a: a["c"]),
    "dot": (lambda a: _circ(a["cx"], a["cy"], a["r"]), lambda a: a["c"]),
    "orb": (lambda a: _circ(a["cx"], a["cy"], a["r"]), lambda a: "orb"),
    "star": (lambda a: _circ(a["cx"], a["cy"], a["r"]), lambda a: "iri"),
    "rings": (lambda a: _circ(a["cx"], a["cy"], max(a["radii"])), lambda a: SILVER),
    "knob": (lambda a: _circ(a["cx"], a["cy"], a["r"] + 18), lambda a: "orb"),
    "prism": (lambda a: _circ(a["cx"], a["cy"], a["r"]), lambda a: a["c"]),
    "tri_split": (lambda a: _circ(a["cx"], a["cy"], a["r"]), lambda a: SILVER),
    "slider": (lambda a: (a["x"], a["y"] - 13, a["x"] + a["w"], a["y"] + 13), lambda a: "iri"),
    "wave": (lambda a: (a["x"], a["y"] - a["amp"] - a["noise"], a["x"] + a["w"], a["y"] + a["amp"] + a["noise"]),
             lambda a: "iri" if a["iri"] else a["c"]),
}


def _instrument(name):
    parent = getattr(V4, name)
    sig = inspect.signature(parent)
    box_fn, color_fn = _PRIMS[name]

    def call(self, *a, **k):
        if self._nest == 0:  # outermost drawing primitive only: polygons call ln, knobs call orb, ...
            args = sig.bind(self, *a, **k); args.apply_defaults()
            args = dict(args.arguments); args.pop("self", None)
            self._rec(name, box_fn(args), color_fn(args))
        self._nest += 1
        try:
            return parent(self, *a, **k)
        finally:
            self._nest -= 1
    call.__name__ = name
    return call


class KitCard(V4):
    """V4 + a log of everything drawn. `skin` must be a skin the PIL renderer can draw (v4)."""

    def __init__(self, num, total, title, essence, eyebrow=EYEBROW, skin="v4"):
        self.skin = skins.get(skin)
        if self.skin.renderer != "pil-v4":
            raise SkinHasNoRenderer(f"skin {skin!r} is a token set only in kit v1; the PIL vocabulary draws 'v4'")
        self.log, self._nest, self._role, self._container, self.body_dy = [], 0, "body", None, 0.0
        super().__init__(num, total, title, essence, eyebrow)

    # ---- recording ----
    def _rec(self, kind, bbox, color, **extra):
        self.log.append(dict(kind=kind, role=self._role, bbox=tuple(bbox), color=color, container=self._container, **extra))

    def _rec_text(self, x, y, s, kind, size, color, anchor, maxw, lh, align, spacing):
        f = font(kind, size)
        lines = self.wrap(s, f, maxw) if maxw else [s]
        anc = {"center": "ma", "right": "ra"}.get(align, "la")
        widths, x0s, y0s, x1s, y1s = [], [], [], [], []
        for i, ln in enumerate(lines):
            yy = y + i * size * lh
            if spacing:
                total = sum(f.getlength(ch) for ch in ln) + spacing * S * (len(ln) - 1)
                ox = x * S - (total / 2 if anchor == "center" else 0)
                _, t, _, b = f.getbbox(ln, anchor="la")
                l, r = 0, total  # letter-spaced: advance widths plus spacing
            else:
                ox = x * S
                l, t, r, b = f.getbbox(ln, anchor=anc)
                total = f.getlength(ln)
            widths.append(total / S)
            x0s.append((ox + l) / S); x1s.append((ox + r) / S); y0s.append(yy + t / S); y1s.append(yy + b / S)
        self._rec("text", (min(x0s), min(y0s), max(x1s), max(y1s)), color, text=s, lines=lines, widths=widths,
                  maxw=maxw, size=size, font=kind)

    # ---- text (drawn through V4/Card; logged here) ----
    def text(self, x, y, s, kind="sans", size=24, color=MOON, a=255, anchor="la", maxw=None, lh=1.3, align="left", spacing=0):
        self._rec_text(x, y, s, kind, size, color, anchor, maxw, lh, align, spacing)
        return super().text(x, y, s, kind, size, color, a, anchor, maxw, lh, align, spacing)

    def ctext(self, cx, y, s, kind="sans", size=22, c=MOON, a=225, maxw=300, lh=1.3):
        self._rec_text(cx, y, s, kind, size, c, "center", maxw, lh, "center", 0)
        return super().ctext(cx, y, s, kind, size, c, a, maxw, lh)

    def rtext(self, x, y, s, kind="sans", size=22, c=MOON, a=225, maxw=300, lh=1.3):
        self._rec_text(x, y, s, kind, size, c, "right", maxw, lh, "right", 0)
        return super().rtext(x, y, s, kind, size, c, a, maxw, lh)

    def box(self, x, y, w, h, *a, **k):
        if self._nest == 0:
            self._rec("box", (x, y, x + w, y + h), "box")
        prev, self._container = self._container, (x, y, x + w, y + h)
        self._nest += 1
        try:
            return super().box(x, y, w, h, *a, **k)
        finally:
            self._nest -= 1; self._container = prev

    # ---- header: the neon title is drawn on the glow layer, so log it here ----
    def _header(self, eyebrow, title, essence):
        self._role = "header"
        n0 = len(self.log)
        super()._header(eyebrow, title, essence)
        self.log[n0]["part"], self.log[n0 + 1]["part"] = "eyebrow", "essence"
        f = font("serif", 70)
        lines = self.wrap(title, f, 920)
        boxes = [f.getbbox(ln, anchor="la") for ln in lines]
        self._rec("text", (80 + min(b[0] for b in boxes) / S, 128 + min(b[1] for b in boxes) / S,
                           80 + max(b[2] for b in boxes) / S, 128 + (len(lines) - 1) * 70 * 1.02 + max(b[3] for b in boxes) / S),
                  NEON, text=title, lines=lines, widths=[f.getlength(ln) / S for ln in lines], maxw=920, size=70,
                  font="serif", part="title")
        self.log.insert(n0, self.log.pop())  # keep reading order: title first
        self._role = "body"

    # ---- body centering: the engine shifts body pixels by dy; mirror it in the log ----
    def _center(self):
        from PIL import Image  # noqa: F401
        top, bot = int((self.body_top - 14) * S), int((H - 140) * S)
        crop = lambda im: im.crop((0, top, im.size[0], bot))
        bb = crop(self.layer).split()[3].getbbox()
        if self._iri_mask is not None:
            mb = crop(self._iri_mask).getbbox()
            if mb and bb:
                bb = (0, min(bb[1], mb[1]), 0, max(bb[3], mb[3]))
        dy = (((bot - top) - (bb[3] - bb[1])) // 2 - bb[1]) / S if bb else 0
        super()._center()
        self.body_dy = dy
        for r in self.log:
            if r["role"] == "body":
                x0, y0, x1, y1 = r["bbox"]; r["bbox"] = (x0, y0 + dy, x1, y1 + dy)
                if r["container"]:
                    cx0, cy0, cx1, cy1 = r["container"]; r["container"] = (cx0, cy0 + dy, cx1, cy1 + dy)

    def footer(self):
        self._role = "footer"
        super().footer()
        self._role = "body"


for _name in _PRIMS:
    setattr(KitCard, _name, _instrument(_name))


def card(spec):
    """A KitCard for a spec: title, caption (the one-line meaning under the title), eyebrow, skin, NN / TT."""
    return KitCard(spec.number, spec.total, spec["title"], spec["caption"],
                   eyebrow=spec.text.get("eyebrow", EYEBROW), skin=spec["skin"])
