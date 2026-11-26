"""Nature: a jagged line out of phase with a dim moon -> a smooth wave in phase with a lit moon-phase arc. No text."""
import math

from kit import icon as I, vocab as K

WAVE_Y, MOON_Y, PERIOD, AMP = 690, 350, 240, 70


def crescent(cx, cy, R=96, rb=86, d=50, n=40):
    """Outer circle minus an inner circle shifted right by d: a crescent with its horns pointing right."""
    x0 = (d * d + R * R - rb * rb) / (2 * d)
    y0 = math.sqrt(R * R - x0 * x0)
    t0 = math.degrees(math.atan2(y0, x0))
    outer = [I.polar(cx, cy, R, t0 + (360 - 2 * t0) * i / n) for i in range(n + 1)]
    u = math.degrees(math.atan2(y0, x0 - d))
    inner = [I.polar(cx + d, cy, rb, (360 - u) - (360 - 2 * u) * i / n) for i in range(n + 1)]
    return outer + inner


def build(spec):
    c = I.card(spec)
    jag = [(-150, -20), (-85, -90), (-25, 55), (40, -80), (95, 70), (150, -40)]     # trough under the moon: out of phase
    with c.side("before"):
        c.fill(crescent(I.BEFORE_X, MOON_Y), K.QUIET, 130, min_dim=60)
        c.path([(I.BEFORE_X + x, WAVE_Y + y) for x, y in jag], 48, K.QUIET, 190)
    c.chevron()
    with c.side("after"):
        c.fill(crescent(I.AFTER_X, MOON_Y), K.MOON, 245, min_dim=60)
        wave = [(I.AFTER_X + x, WAVE_Y - AMP * math.cos(2 * math.pi * x / PERIOD)) for x in range(-150, 151, 6)]
        c.path(wave, 48, K.NEON, 245)                                                  # crest under the moon: in phase
    return c
