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
    ax, half = 540, 180
    top = c.body_top + 64
    bot = top + 590
    hy = top + 430
    # hero: the river channel, water flowing down (short arrows between the banks), three rocks in the bed
    c.ln(bank(ax - half, top + 30, bot), K.SILVER, 170, 2.4)
    c.ln(bank(ax + half, top + 30, bot), K.SILVER, 170, 2.4)
    c.iri_path(bank(ax - half, top + 30, bot), 3, 150)
    c.iri_path(bank(ax + half, top + 30, bot), 3, 150)
    rocks = [(ax - 95, top + 140, -1), (ax + 95, top + 240, 1), (ax - 95, top + 340, -1)]
    for (sx, sy, side), label in zip(rocks, t["stones"]):
        c.circle(sx, sy, 34, K.QUIET, 230, 2.4, fill_a=110)
        edge = ax - half - 26 if side < 0 else ax + half + 26
        K.name(c, edge, sy - 22, label, "right" if side < 0 else "left", size=36)
    for fx, fy in ((ax - 95, top + 60), (ax + 95, top + 60), (ax + 95, top + 140), (ax - 95, top + 240), (ax + 95, top + 340)):
        c.arrow(fx, fy - 20, fx, fy + 20, K.SILVER, 150, 2, head=9)
    # heaven comes down, earth comes up; they meet at the glowing hara
    K.name(c, ax, top - 56, t["heaven"], size=38)
    c.arrow(ax, top, ax, hy - 56, K.SILVER, 220, 2.6, head=14)
    c.arrow(ax, bot + 26, ax, hy + 56, K.SILVER, 220, 2.6, head=14)
    K.name(c, ax, bot + 38, t["earth"], size=38)
    c.orb(ax, hy, 36, glow=120)
    c.iri_ring(ax, hy, 52, 3, 230)
    c.ln([(ax + 58, hy), (ax + half + 22, hy)], K.SILVER, 150, 1.6)
    K.name(c, ax + half + 36, hy - 34, t["hara"], "left", size=42)
    K.note(c, ax + half + 36, hy + 14, t["hara_sub"], "left", size=26, color=K.MOON, a=225, maxw=250)
    # left, small and faded: the battery model, crossed out
    bx, by = 170, top + 480
    c.poly([(bx - 30, by - 46), (bx + 30, by - 46), (bx + 30, by + 46), (bx - 30, by + 46)], K.QUIET, 150, 2.4)
    c.poly([(bx - 10, by - 46), (bx - 10, by - 58), (bx + 10, by - 58), (bx + 10, by - 46)], K.QUIET, 150, 2.4)
    c.ln([(bx - 50, by - 68), (bx + 50, by + 68)], K.QUIET, 200, 3)
    c.ln([(bx + 50, by - 68), (bx - 50, by + 68)], K.QUIET, 200, 3)
    K.note(c, bx, by + 96, t["battery"], size=26, color=K.QUIET, a=220, maxw=170)
    # the takeaway: highest emphasis after the title
    K.name(c, 540, bot + 100, t["takeaway"], size=62, maxw=900)
    return c
