"""Vision: a single dot on one axis -> a twelve-pointed star around an eye-like centre. No text."""
from kit import icon as I, vocab as K


def star12(cx, cy, r_out, r_in):
    return [I.polar(cx, cy, r_out if k % 2 == 0 else r_in, -90 + 15 * k) for k in range(24)]


def eye(cx, cy, half_w, half_h, n=30):
    xs = [-half_w + 2 * half_w * i / n for i in range(n + 1)]
    return [(cx + x, cy - half_h * (1 - (x / half_w) ** 2)) for x in xs] + \
           [(cx + x, cy + half_h * (1 - (x / half_w) ** 2)) for x in reversed(xs)]


def build(spec):
    c = I.card(spec)
    with c.side("before"):
        c.path([(I.BEFORE_X, 232), (I.BEFORE_X, 792)], 48, K.QUIET, 150)     # one axis
        c.dot(I.BEFORE_X, 512, 44, K.SILVER, 230, glow=0)                    # one dot
    c.chevron()
    with c.side("after"):
        c.fill(star12(I.AFTER_X, 512, 190, 122), K.SILVER, 240, min_dim=2 * 122)  # twelve points
        c.fill(eye(I.AFTER_X, 512, 100, 56), K.BG_TOP, 250, min_dim=112)     # the eye
        c.dot(I.AFTER_X, 512, 36, K.NEON, 255, glow=60)                      # iris: the one light
    return c
