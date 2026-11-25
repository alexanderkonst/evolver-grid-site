"""ideal-client-06 · The Product Ladder. All text comes from ideal-client-06.card.yaml."""
from PIL import Image, ImageDraw

from kit import vocab as K


def build(spec):
    t = spec.text
    S = K.S
    c = K.card(spec)
    y0 = c.body_top + 20
    rx0, rx1 = 230, 330; mx = (rx0 + rx1)/2
    top_y, bot_y = y0 + 60, y0 + 640
    # rails of the ladder, from their threshold up to where you stand
    c.ln([(rx0, top_y + 40), (rx0, bot_y - 30)], K.SILVER, 150, 2)
    c.ln([(rx1, top_y + 40), (rx1, bot_y - 30)], K.SILVER, 150, 2)
    rungs = [(d["title"], d["sub"]) for d in t["rungs"]]
    al = [245, 210, 175, 145]
    for k, (tt, sub) in enumerate(rungs):
        ry = top_y + 135 + k*112
        c.iri_poly([(rx0 - 6, ry - 7), (rx1 + 6, ry - 7), (rx1 + 6, ry + 7), (rx0 - 6, ry + 7)], al[k])
        c.text(380, ry - 34, tt, "serif", 32, K.BRIGHT, 255, maxw=600)
        c.text(380, ry + 10, sub, "sans", 21, K.SILVER, 225, maxw=600)
    # you, at the top
    c.orb(mx, top_y, 54, glow=90)
    c.ctext(mx, top_y - 22, t["you"], "serif", 32, K.DARK, 255)
    c.text(380, top_y - 38, t["top"]["title"], "serif", 34, K.BRIGHT, 255, maxw=600)
    c.text(380, top_y + 8, t["top"]["sub"], "sans", 21, K.SILVER, 225, maxw=600)
    # them, at the bottom
    c.orb(mx, bot_y, 30, glow=30)
    c.text(380, bot_y - 36, t["bottom"]["title"], "serif", 32, K.BRIGHT, 255, maxw=600)
    c.text(380, bot_y + 8, t["bottom"]["sub"], "sans", 21, K.SILVER, 225, maxw=600)
    # the delta: a rotated label beside a bracket
    bx = 150
    c.ln([(bx, top_y), (bx, bot_y)], K.QUIET, 170, 1.6)
    c.ln([(bx, top_y), (bx + 14, top_y)], K.QUIET, 170, 1.6); c.ln([(bx, bot_y), (bx + 14, bot_y)], K.QUIET, 170, 1.6)
    f = K.font("sansm", 16); txt = t["delta"]
    tw = int(c.d.textlength(txt, font=f)) + 8*S*len(txt)
    tmp = Image.new("RGBA", (tw + 20*S, 30*S), (0, 0, 0, 0)); td = ImageDraw.Draw(tmp); xx = 10*S
    for ch in txt:
        td.text((xx, 4*S), ch, font=f, fill=K.rgba(K.BLUSH, 240)); xx += td.textlength(ch, font=f) + 4*S
    tmp = tmp.rotate(90, expand=True)
    my = (top_y + bot_y)/2
    c.d.rectangle([(bx - 14)*S, (my - tmp.size[1]/S/2 - 10)*S, (bx + 14)*S, (my + tmp.size[1]/S/2 + 10)*S], fill=(12, 15, 26, 255))
    c.layer.alpha_composite(tmp, (int(bx*S - tmp.size[0]/2), int(my*S - tmp.size[1]/2)))
    c.quote(80, bot_y + 110, 920, t["quote"], 30)
    return c
