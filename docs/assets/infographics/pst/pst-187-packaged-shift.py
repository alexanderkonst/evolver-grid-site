"""PST 187 · The Packaged Shift. All text comes from pst-187-packaged-shift.card.yaml (labels are in spec.text; lint counts them apart)."""
import math

from kit import vocab as K


def _arc(cx, cy, r, a0, a1, n=14):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n)))
            for i in range(n + 1)]


def build(spec):
    t = spec.text
    c = K.card(spec)
    y0 = c.body_top + 10
    cx = 540

    # --- capsule: a shift split in two, quiet before | neon after ---
    w, h = 460, 130
    r = h / 2
    cy = y0 + 365
    top, bot = cy - r, cy + r
    x0, x1 = cx - w / 2, cx + w / 2
    left = [(cx, top)] + _arc(x0 + r, cy, r, -90, -270) + [(cx, bot)]
    right = [(cx, top)] + _arc(x1 - r, cy, r, -90, 90) + [(cx, bot)]
    c.poly(left, K.SILVER, 230, 2.4, fill_a=70, fill_c=K.SILVER)    # QUIET / silver half
    c.poly(right, K.SILVER, 230, 2.4, fill_a=240, fill_c=K.NEON)    # the one NEON accent: the After half
    c.ln([(cx, top), (cx, bot)], K.SILVER, 200, 2)
    K.name(c, cx - 120, cy - 22, t["capsule"]["before"], size=40)
    K.name(c, cx + 120, cy - 22, t["capsule"]["after"], size=40, color=K.DARK)

    # --- seal: the curator's signature, on the seam ---
    c.orb(cx, bot, 21, glow=50, seed=3)
    c.ln([(cx - 8, bot), (cx - 2, bot + 7), (cx + 9, bot - 8)], K.DARK, 255, 3)
    K.note(c, cx, bot + 30, t["seal"], size=24)

    # --- three rays out of the capsule: shown, walked, pressed ---
    xs = [190, 540, 890]
    oy = y0 + 130
    for x, ray in zip(xs, t["rays"]):
        c.ln([(cx, top - 4), (x, oy + 30)], K.SILVER, 190, 2)
        c.orb(x, oy, 26, glow=50, seed=xs.index(x) + 1)
        K.name(c, x, oy - 126, ray["title"])
        K.note(c, x, oy - 78, ray["sub"], size=26)

    # --- loop arrow: right edge round to the left; the end is the next door (IRI) ---
    rr, xr, xl, yb = 45, 850, 230, bot + 95
    path = [(x1, cy), (xr - rr, cy)] + _arc(xr - rr, cy + rr, rr, -90, 0) + [(xr, yb - rr)]
    path += _arc(xr - rr, yb - rr, rr, 0, 90) + [(xl + rr, yb)] + _arc(xl + rr, yb - rr, rr, 90, 180)
    path += [(xl, cy + rr)] + _arc(xl + rr, cy + rr, rr, 180, 270) + [(xl + rr, cy), (x0 - 4, cy)]
    c.iri_path(path, 4, 215)
    c.iri_poly([(x0 - 2, cy), (x0 - 24, cy - 13), (x0 - 24, cy + 13)], 230)
    K.note(c, cx, yb + 16, t["loop"], size=32)

    # --- console: two keys side by side. Ask is a signal; Press is a layer of work (IRI) ---
    ky = yb + 92
    c.box(190, ky, 700, 130, fill_a=10, border_a=90)
    for key, (kx, kind) in zip(t["console"], ((215, "plain"), (565, "iri"))):
        if kind == "iri":
            c.iri_box(kx, ky + 15, 300, 100, 190, 3)
        else:
            c.box(kx, ky + 15, 320 - 20, 100, fill_a=22, border_a=140)
        mx = kx + 150
        K.name(c, mx, ky + 28, key["title"], size=38)
        K.note(c, mx, ky + 74, key["sub"], size=24)
    return c
