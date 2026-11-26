"""Geometry for the v2 app icons (issue #528): small pure functions that return point lists in 1024 px.
Used by `<id>-a.py` / `<id>-b.py`; nothing here draws."""
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


def vesica(cx, cy, r, d, n=40):
    """Overlap of two circles of radius r, centres d apart on a horizontal line (a lens standing up)."""
    h = math.sqrt(r * r - (d / 2) ** 2)
    a0 = math.degrees(math.atan2(h, d / 2))
    right = [polar(cx - d / 2, cy, r, -a0 + 2 * a0 * i / n) for i in range(n + 1)]       # right edge: arc of the left circle
    left = [polar(cx + d / 2, cy, r, 180 - a0 + 2 * a0 * i / n) for i in range(n + 1)]   # left edge: arc of the right circle
    return right + left


def arch_arcs(cx, base_y, half_w, height, n=40):
    """Two arcs that start apart at the base and meet at one apex: -> (left points, right points, apex)."""
    c = (height ** 2 - half_w ** 2) / (2 * half_w)
    R = half_w + c
    sweep = math.degrees(math.atan2(height, c))
    left = [polar(cx + c, base_y, R, 180 + sweep * i / n) for i in range(n + 1)]
    right = [polar(cx - c, base_y, R, -sweep * i / n) for i in range(n + 1)]
    return left, right, (cx, base_y - height)


def almond(cx, cy, half_w, half_h, n=40):
    """Closed eye outline: two arcs meeting in points left and right. Closed point list (first == last)."""
    xs = [-half_w + 2 * half_w * i / n for i in range(n + 1)]
    top = [(cx + x, cy - half_h * (1 - (x / half_w) ** 2)) for x in xs]
    bot = [(cx + x, cy + half_h * (1 - (x / half_w) ** 2)) for x in reversed(xs)]
    return top + bot[1:]


def sparkle(cx, cy, r_out, r_in, points=4, rot=-90):
    return [polar(cx, cy, r_out if k % 2 == 0 else r_in, rot + 180 / points * k) for k in range(2 * points)]


def closed_lid(cx, cy, half_w, sag, thick, lashes=3, lash=90, tooth=44, n=48):
    """One polygon: a tapered eyelid (a crescent curving down, like a closed eye) with `lashes` teeth under it."""
    def edge(x, extra):
        k = 1 - (x / half_w) ** 2
        return cy + sag * k + extra * k
    xs = [-half_w + 2 * half_w * i / n for i in range(n + 1)]
    pts = [(cx + x, edge(x, 0)) for x in xs]                                   # lid line, left to right
    slots = sorted((-half_w + 2 * half_w * (k + 1) / (lashes + 1) for k in range(lashes)), reverse=True)
    for x in reversed(xs):                                                      # lower edge, right to left
        while slots and x <= slots[0]:
            sx = slots.pop(0)
            yb = edge(sx, thick)
            pts += [(cx + sx + tooth, yb), (cx + sx + 1.0 * lash * (sx / half_w), yb + lash), (cx + sx - tooth, yb)]
        pts.append((cx + x, edge(x, thick)))
    return pts


def crescent(cx, cy, R, rb, d, n=48):
    """Outer circle minus an inner circle shifted right by d: a crescent with its horns pointing right."""
    x0 = (d * d + R * R - rb * rb) / (2 * d)
    y0 = math.sqrt(R * R - x0 * x0)
    t0 = math.degrees(math.atan2(y0, x0))
    outer = [polar(cx, cy, R, t0 + (360 - 2 * t0) * i / n) for i in range(n + 1)]
    u = math.degrees(math.atan2(y0, x0 - d))
    inner = [polar(cx + d, cy, rb, (360 - u) - (360 - 2 * u) * i / n) for i in range(n + 1)]
    return outer + inner


def half_disc(cx, cy, r, n=40):
    """Right half of a disc (first quarter moon), flat edge on the left."""
    return [polar(cx, cy, r, -90 + 180 * i / n) for i in range(n + 1)]


def wave(cx, cy, width, amp, periods=1.0, n=60):
    return [(cx - width / 2 + width * i / n, cy - amp * math.sin(2 * math.pi * periods * i / n)) for i in range(n + 1)]


def spiral(cx, cy, r_out, r_in, turns, start_deg, n=400):
    """Archimedean spiral from the outside in, counter-clockwise on screen. -> points, first = outer end."""
    return [polar(cx, cy, r_out + (r_in - r_out) * i / n, start_deg - 360 * turns * i / n) for i in range(n + 1)]


def spiral_at(cx, cy, r_out, r_in, turns, start_deg, t):
    return polar(cx, cy, r_out + (r_in - r_out) * t, start_deg - 360 * turns * t)
