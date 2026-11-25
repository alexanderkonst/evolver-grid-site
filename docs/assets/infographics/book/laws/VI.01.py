"""VI.01 · Their Own 0–10 Scale. All text comes from VI.01.card.yaml."""
from kit import vocab as K

# slider geometry only (no numbers on the card): (start mark, current value) as 0..1 of the track
MARKS = [(0.30, 0.75), (0.15, 0.60), (0.35, 0.55)]


def build(spec):
    t = spec.text
    c = K.card(spec)
    y = c.body_top + 29.5
    for i, (g, (a, b)) in enumerate(zip(t["goals"], MARKS)):
        yy = y + i * 160
        c.text(100, yy, g, "serif", 32, K.BRIGHT, 255, maxw=880)
        c.slider(100, yy + 75, 700, b)
        c.ln([(100 + 700 * a, yy + 57), (100 + 700 * a, yy + 93)], K.QUIET, 220, 2)
        c.text(830, yy + 61, t["readout"], "sansm", 24, K.SILVER, 225)
    c.quote(80, y + 500, 920, t["quote"], 32)
    return c
