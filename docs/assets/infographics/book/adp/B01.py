"""B01 · The Bashar Formula. All text comes from B01.card.yaml (labels are in spec.text; lint counts them apart)."""
from kit import vocab as K


def attribution(c, s):
    """The 'After ...' line in the footer row (footer text is outside the prose word count)."""
    draw_footer = c.footer

    def footer():
        draw_footer()
        c._role = "footer"
        c.rtext(920, 1258 + 13, s, "sans", 20, K.MOON, 200, maxw=520)
        c._role = "body"
    c.footer = footer


def build(spec):
    t = spec.text
    c = K.card(spec)
    attribution(c, t["attribution"])
    # five steps rise along one path toward "You"; step 1 (excitement, the body's signal) glows brightest.
    # Each step is a full action (main line) plus one small reason (sub-line), so the labels read alone.
    n = len(t["steps"])
    x0, y0, dx, dy = 130, c.body_top + 730, 62, 122
    pts = [(x0 + k * dx, y0 - k * dy) for k in range(n)]
    you = (x0 + n * dx + 20, y0 - n * dy - 40)
    path = pts + [you]
    for (ax, ay), (bx, by) in zip(path, path[1:]):
        c.ln([(ax, ay), (bx, by)], K.SILVER, 150, 2.4)
    c.iri_path(path, 4, 150)
    for k, ((x, y), (label, sub)) in enumerate(zip(pts, t["steps"])):
        r = 34 if k == 0 else 26
        c.orb(x, y, r, glow=120 if k == 0 else 40, seed=k + 1)
        if k == 0:
            c.iri_ring(x, y, r + 14, 3, 230)
        with c.labels():
            c.ctext(x, y - (18 if k == 0 else 15), str(k + 1), "sansm", 30 if k == 0 else 26, K.DARK, 255, maxw=60, lh=1.05)
        ny = K.name(c, x + r + 24, y - 38, label, "left", size=40 if k == 0 else 38, maxw=560)
        K.note(c, x + r + 24, y - 38 + (46 if k == 0 else 44), sub, "left", size=26, color=K.QUIET, a=235, maxw=560)
    c.orb(you[0], you[1], 52, glow=90)
    with c.labels():
        c.ctext(you[0], you[1] - 22, t["center"], "serif", 44, K.DARK, 255, maxw=100, lh=1.05)
    return c
