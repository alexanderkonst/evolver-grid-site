"""B02 · Energy Is Received. All text comes from B02.card.yaml (labels are in spec.text; lint counts them apart)."""
import math

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


def bank(x, top, bot, amp=12, period=170):
    return [(x + amp * math.sin((y - top) * 2 * math.pi / period), y) for y in range(int(top), int(bot) + 1, 8)]


def build(spec):
    t = spec.text
    c = K.card(spec)
    attribution(c, t["attribution"])
    ax, top, bot = 660, c.body_top + 70, c.body_top + 720
    half = 130
    # left, small and faded: the battery model (crossed out)
    bx, by = 170, top + 250
    c.poly([(bx - 36, by - 55), (bx + 36, by - 55), (bx + 36, by + 55), (bx - 36, by + 55)], K.QUIET, 150, 2.4)
    c.poly([(bx - 12, by - 55), (bx - 12, by - 69), (bx + 12, by - 69), (bx + 12, by - 55)], K.QUIET, 150, 2.4)
    c.ln([(bx - 58, by - 80), (bx + 58, by + 80)], K.QUIET, 200, 3)
    c.ln([(bx + 58, by - 80), (bx - 58, by + 80)], K.QUIET, 200, 3)
    K.note(c, bx, by + 100, t["battery"], size=28, color=K.QUIET, a=210, maxw=200)
    # main: the river channel, one flow with three stones
    c.ln(bank(ax - half, top, bot), K.SILVER, 170, 2.4)
    c.ln(bank(ax + half, top, bot), K.SILVER, 170, 2.4)
    c.iri_path(bank(ax - half, top, bot), 3, 150)
    c.iri_path(bank(ax + half, top, bot), 3, 150)
    for k, (label, side) in enumerate(zip(t["stones"], (-1, 1, -1))):
        sx, sy = ax + side * 62, top + 150 + k * 100
        c.circle(sx, sy, 26, K.SILVER, 200, 2, fill_a=60)
        if side < 0:
            K.name(c, ax - half - 26, sy - 22, label, "right", size=36)
        else:
            K.name(c, ax + half + 26, sy - 22, label, "left", size=36)
    # heaven comes down, earth comes up; they meet in the hara
    hy = top + 500
    K.name(c, ax, top - 56, t["heaven"], size=38)
    c.arrow(ax, top - 6, ax, hy - 56, K.SILVER, 220, 2.6, head=14)
    c.arrow(ax, bot + 30, ax, hy + 56, K.SILVER, 220, 2.6, head=14)
    K.name(c, ax, bot + 44, t["earth"], size=38)
    c.orb(ax, hy, 36, glow=120)
    c.iri_ring(ax, hy, 52, 3, 230)
    c.ln([(ax + 58, hy), (ax + half + 36, hy)], K.SILVER, 150, 1.6)
    K.name(c, ax + half + 52, hy - 24, t["hara"], "left", size=42)
    return c
