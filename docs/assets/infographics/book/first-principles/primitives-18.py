"""primitives-18 · Ready to Receive. All text comes from primitives-18.card.yaml."""
from kit import vocab as K


def build(spec):
    t_ = spec.text
    c = K.card(spec)
    S = K.S
    y = c.body_top + 10
    cx, cy = 540, y + 330
    q = [(x["title"], x["sub"], x["line"], x["names"]) for x in t_["cells"]]
    # cross through the centre (the quadrant frame), cup at the crossing
    c.ln([(80, cy), (1000, cy)], K.SILVER, 70, 1.4); c.ln([(cx, y), (cx, y + 660)], K.SILVER, 70, 1.4)
    c.rings(cx, cy, [118, 150], a=(110, 55))
    # the cup: an uncovered bowl on a stem, empty, with a thirsty glow above it
    bowl = K.arc_pts(cx, cy - 40, 72, 0, 180, 30)
    c.iri_poly(bowl, 60, outline=235, w=4)
    c.ln([(cx - 72, cy - 40), (cx + 72, cy - 40)], K.INK, 140, 1.6)
    c.ln([(cx, cy + 32), (cx, cy + 70)], K.INK, 220, 3)
    c.ln([(cx - 34, cy + 72), (cx + 34, cy + 72)], K.INK, 220, 3)
    c.dot(cx, cy - 92, 5, K.INK, 255, glow=110)
    for k in range(3):
        c.ln([(cx, cy - 104 - k*14), (cx, cy - 98 - k*14)], K.INK, 160 - k*40, 1.4)
    cells = [(80, y, "left"), (1000, y, "right"), (80, cy + 40, "left"), (1000, cy + 40, "right")]
    for k, ((t, sub, line, names), (x, yy, al)) in enumerate(zip(q, cells)):
        mw = 330
        f = c.text if al == "left" else c.rtext
        if al == "left":
            c.text(x + 6, yy - 6, str(k+1), "serif", 30, K.SILVER, 230, align="center")
            c.text(x + 38, yy, t.upper(), "sansm", 22, K.BRIGHT, 255, spacing=2)
            yy2 = c.text(x, yy + 36, sub, "serifi", 24, K.SILVER, 230)
            yy2 = c.text(x, yy2 + 2, line, "serif", 28, K.BRIGHT, 255, maxw=mw, lh=1.1)
            yy2 += 8
            for nm in names:
                yy2 = c.text(x, yy2, nm, "sans", 18, K.QUIET, 245, maxw=mw, lh=1.3) + 3
        else:
            c.text(x - 6, yy - 6, str(k+1), "serif", 30, K.SILVER, 230, align="center")
            tw = c.d.textlength(t.upper(), font=K.font("sansm", 22))/S + 2*(len(t)-1)
            c.text(x - 38 - tw, yy, t.upper(), "sansm", 22, K.BRIGHT, 255, spacing=2)
            yy2 = c.rtext(x, yy + 36, sub, "serifi", 24, K.SILVER, 230, maxw=mw)
            yy2 = c.rtext(x, yy2 + 2, line, "serif", 28, K.BRIGHT, 255, maxw=mw, lh=1.1)
            yy2 += 8
            for nm in names:
                yy2 = c.rtext(x, yy2, nm, "sans", 18, K.QUIET, 245, maxw=mw, lh=1.3) + 3
    yb = y + 690
    yb = c.quote(80, yb, 920, t_["quote"], 27)
    c.text(80, yb + 18, t_["note"], "sans", 15, K.QUIET, 230, maxw=920, lh=1.35)
    return c
