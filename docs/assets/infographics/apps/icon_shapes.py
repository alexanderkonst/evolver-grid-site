"""Geometry for the app icons (issues #528, #533): small pure functions that return point lists in 1024 px.
Used by `<id>.py`; nothing here draws."""
import math

CX = CY = 512


def polar(cx, cy, r, deg):
    return (cx + r * math.cos(math.radians(deg)), cy + r * math.sin(math.radians(deg)))


def lens(base, length, width, deg, n=24):
    """A pointed leaf / petal: starts at `base`, reaches `length` along `deg` (0 = right, -90 = up), `width` at its widest."""
    ux, uy = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    nx, ny = -uy, ux
    side = [(t / n, width / 2 * math.sin(math.pi * (t / n) ** 0.8)) for t in range(n + 1)]
    left = [(base[0] + ux * length * t + nx * w, base[1] + uy * length * t + ny * w) for t, w in side]
    right = [(base[0] + ux * length * t - nx * w, base[1] + uy * length * t - ny * w) for t, w in reversed(side)]
    return left + right[1:]


def almond(cx, cy, half_w, half_h, n=40):
    """Closed eye outline: two arcs meeting in points left and right. Closed point list (first == last)."""
    xs = [-half_w + 2 * half_w * i / n for i in range(n + 1)]
    top = [(cx + x, cy - half_h * (1 - (x / half_w) ** 2)) for x in xs]
    bot = [(cx + x, cy + half_h * (1 - (x / half_w) ** 2)) for x in reversed(xs)]
    return top + bot[1:]


def sparkle(cx, cy, r_out, r_in, points=4, rot=-90):
    return [polar(cx, cy, r_out if k % 2 == 0 else r_in, rot + 180 / points * k) for k in range(2 * points)]


def ellipse(cx, cy, a, b, tilt_deg, t0=0, t1=360, n=120):
    """Points of an ellipse (semi-axes a, b) tilted by `tilt_deg` (negative = rising to the right), parameter t0..t1 in degrees.
    t = 0 is the right end of the long axis; t = 90 is the lower side (screen y grows downwards)."""
    c, s = math.cos(math.radians(tilt_deg)), math.sin(math.radians(tilt_deg))
    pts = []
    for i in range(n + 1):
        t = math.radians(t0 + (t1 - t0) * i / n)
        x, y = a * math.cos(t), b * math.sin(t)
        pts.append((cx + x * c - y * s, cy + x * s + y * c))
    return pts


def wave_curl(xj, yj, R, wave_len, amp, wave_len_total, sweep, n=60):
    """ONE continuous centre line: a wave that arrives from the left, bottoms out at (xj, yj) and curls up into a circle of
    radius R (centre (xj, yj - R)), anticlockwise on screen, `sweep` degrees: the crescent. Tangent is continuous at the join.
    -> (points, tip). The wave is `wave_len_total` px long (to the left of xj), crest-to-crest `wave_len`."""
    k = 2 * math.pi / wave_len
    xs = [xj - wave_len_total + wave_len_total * i / n for i in range(n + 1)]
    pts = [(x, yj + amp * (math.cos(k * (x - xj)) - 1) / 2) for x in xs]          # y = yj at xj (a trough), above it elsewhere
    cy = yj - R
    m = int(sweep)
    for i in range(1, m + 1):                                                      # from the bottom of the circle (90 deg), anticlockwise
        pts.append(polar(xj, cy, R, 90 - i))
    return pts, pts[-1]


def bbox(pts):
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def shift(pts, dx, dy):
    return [(x + dx, y + dy) for x, y in pts]


def scale(pts, k, cx=CX, cy=CY):
    return [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in pts]
