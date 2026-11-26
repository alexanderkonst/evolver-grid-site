"""PST 187 v2 · The End Is the Door. All text comes from pst-187-packaged-shift.card.yaml.

One horizontal path, four stations: Teaser, Course, Closing infographic, The game. The game is a doorway and the ONLY
neon on the card. The engine draws the title in neon; here the title is moonlit ink, so the door can be the single accent.
From the door a thin IRI arrow curves down-right to a small sphere: Invite the next.
"""
import math

from kit import vocab as K
from moon import rgba, S


class DoorCard(K.KitCard):
    """KitCard whose title is ink (BRIGHT) instead of neon, with Sasha's attribution under the quote."""

    def __init__(self, *a, attribution="", **k):
        self._attribution = attribution
        super().__init__(*a, **k)

    def _header(self, eyebrow, title, essence):
        self._role = "header"
        n0, x = len(self.log), 80
        self.text(x, 78, f"{self.num:02d}  ·  {eyebrow.upper()}", "sansm", 17, K.DEEP, 230, spacing=3)
        self.iri_line(x, 112, x + 90, 112, 3, 240)
        y = self.text(x, 128, title, "serif", 70, K.BRIGHT, 255, maxw=920, lh=1.02) + 14
        y = self.text(x, y, essence, "sans", 26, K.MOON, 225, maxw=900, lh=1.38)
        with self.labels():
            y = self.text(x, y + 6, self._attribution, "sans", 24, K.QUIET, 235, maxw=600)
        texts = [r for r in self.log[n0:] if r["kind"] == "text"]
        for r, part in zip(texts, ("eyebrow", "title", "essence")):
            r["part"] = part
        self.body_top = y + 40
        self._role = "body"


def _bez(p0, p1, p2, n=28):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in (i / n for i in range(n + 1))]


def _arch(cx, top, w, h, n=18):
    """A doorway: straight sides, round top, open at the floor."""
    r = w / 2
    pts = [(cx - r, top + h), (cx - r, top + r)]
    pts += [(cx - r * math.cos(math.radians(a)), top + r - r * math.sin(math.radians(a))) for a in range(0, 181, 180 // n)]
    pts += [(cx + r, top + h)]
    return pts


def build(spec):
    t = spec.text
    c = DoorCard(spec.number, spec.total, spec["title"], spec["caption"], eyebrow=t["eyebrow"], skin=spec["skin"],
                 caption_size=spec.get("caption_size"), attribution=t["attribution"])
    cy = c.body_top + 175
    xs = [125, 345, 565, 785]
    st = t["stations"]
    gap = {1: 62, 2: 78, 3: 78, 4: 78}   # half-width the path leaves free at each station (gap where a line meets a node)
    ly = cy + 112                          # labels sit on one line under the stations

    # --- the path: thin IRI line, left -> right, with a small head before the door ---
    for i in range(3):
        x0, x1 = xs[i] + gap[i + 1], xs[i + 1] - gap[i + 2]
        c.iri_path([(x0, cy), (x1, cy)], 3, 210)
        c.iri_poly([(x1 + 2, cy), (x1 - 13, cy - 8), (x1 - 13, cy + 8)], 220)

    # --- 1 teaser: a small card ---
    x = xs[0]
    c.box(x - 33, cy - 44, 66, 88, fill_a=12, border_a=130)
    c.ln([(x - 17, cy - 14), (x + 17, cy - 14)], K.SILVER, 150, 2)
    c.ln([(x - 17, cy + 4), (x + 9, cy + 4)], K.SILVER, 110, 2)

    # --- 2 course: steps going up ---
    x = xs[1]
    steps = [(x - 52, cy + 40), (x - 52, cy + 12), (x - 18, cy + 12), (x - 18, cy - 16), (x + 16, cy - 16), (x + 16, cy - 44), (x + 52, cy - 44)]
    c.ln(steps, K.SILVER, 215, 3)

    # --- 3 closing infographic: a card with a lit edge, a figure drawn inside ---
    x = xs[2]
    c.box(x - 48, cy - 64, 96, 128, fill_a=26, border_a=255, glow=70)
    c.iri_ring(x, cy - 24, 15, 2.4, 210)
    c.ln([(x - 26, cy + 10), (x + 26, cy + 10)], K.SILVER, 190, 2)
    c.ln([(x - 26, cy + 28), (x + 8, cy + 28)], K.SILVER, 140, 2)

    # --- 4 the game: a doorway, the only neon on the card ---
    x = xs[3]
    door = _arch(x, cy - 78, 92, 156)
    for g, a in ((46, 40), (28, 60), (12, 80)):    # the door's own halo, on the glow layer (not a second accent element)
        halo = _arch(x, cy - 78 - g, 92 + 2 * g, 156 + g + 4)
        c.gd.polygon([(px * S, py * S) for px, py in halo], fill=rgba(K.NEON, a))
    c.poly(door, K.NEON, 255, 5, fill_a=70, fill_c=K.NEON)

    # --- labels ---
    for x, s in zip(xs, st):
        y = K.name(c, x, ly, s["title"], size=36, maxw=190)
        if s.get("sub"):
            K.note(c, x, y + 6, s["sub"], size=26, color=K.QUIET, maxw=190)

    # --- from the door, a thin IRI arrow curves down-right out to the next one ---
    sx, sy, sr = 880, cy + 330, 32
    p = _bez((xs[3] + 62, cy + 6), (sx + 40, cy + 20), (sx, sy - sr - 22))
    c.iri_path(p, 3, 215)
    (ax, ay), (bx, by) = p[-2], p[-1]
    ang = math.atan2(by - ay, bx - ax)
    tip = (bx + 22 * math.cos(ang), by + 22 * math.sin(ang))
    c.iri_poly([tip] + [(bx + 3 * math.cos(ang) + s * 9 * -math.sin(ang), by + 3 * math.sin(ang) + s * 9 * math.cos(ang)) for s in (1, -1)], 225)
    c.orb(sx, sy, sr, glow=30, seed=2)
    K.name(c, sx, sy + sr + 18, t["invite"], size=34, maxw=200)
    return c
