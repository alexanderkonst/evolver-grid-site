"""Skins as token sets. A skin is data; the drawing vocabulary (vocab.py) and lint read it.

v4         default. Tokens are pulled from engine-v4 (moon.py, v4lib.py, primitives2.py), not retyped.
grayscale  fyt_style.py house style (matplotlib, white ground). Footer colour and fonts from fyt_style.py;
           ink grays from speedrun-matching/make.py.
moonworld  the README "Moon world" table. Tokens only: no PIL renderer ships for it in kit v1.
"""
import os, sys
from dataclasses import dataclass, field

INFOGRAPHICS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE = os.path.join(INFOGRAPHICS, "engine-v4")
FONTS = os.path.join(INFOGRAPHICS, "fonts")


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


@dataclass(frozen=True)
class Skin:
    name: str
    size: tuple                 # (w, h) px
    margin: int                 # px at `size`; every non-footer element stays inside
    min_font: int               # px at 1080 wide
    max_words: int              # on-card words, footer excluded
    palette: dict               # name -> (r, g, b): the only colours a card may use
    accent: tuple = None        # the single accent colour (None = skin has none)
    accent_family: tuple = ()   # extra RGBs that count as the same accent (v4 NEON_HI / NEON_LO)
    bg: tuple = ()
    fonts: dict = field(default_factory=dict)   # role -> family
    renderer: str = ""          # "pil-v4" = vocab.py can draw it; "" = tokens only
    iridescent: bool = False    # iri_* fills (thin-film shader) are native to the skin
    notes: str = ""

    def colors(self):
        return set(self.palette.values()) | set(self.accent_family) | ({self.accent} if self.accent else set())

    def accent_colors(self):
        return ({self.accent} if self.accent else set()) | set(self.accent_family)


def _v4():
    sys.path.insert(0, ENGINE)
    import moon, v4lib, primitives2 as p2
    names = ("INK", "SILVER", "QUIET", "LAV", "AQUA", "BLUSH", "CHAMP", "PEARL")
    pal = {n: getattr(v4lib, n) for n in names}
    pal.update({n: getattr(moon, n) for n in ("MOON", "BRIGHT", "DEEP", "GLOW")})
    pal.update(BG_TOP=moon.BG_TOP, BG_BOT=moon.BG_BOT)
    # ink for text set on a light orb; a literal (20, 24, 36) in ideal_client.py and laws_v4.py
    pal["DARK"] = (20, 24, 36)
    return Skin(
        name="v4", size=(moon.W, moon.H), margin=80, min_font=16, max_words=25,
        palette=pal, accent=p2.NEON, accent_family=(p2.NEON_HI, p2.NEON_LO),
        bg=(moon.BG_TOP, moon.BG_BOT),
        fonts={"title": "Cormorant Garamond", "label": "Space Grotesk"},
        renderer="pil-v4", iridescent=True,
        notes="IRI (thin-film) colours are shader output of iri_* calls, not palette entries.",
    )


_GRAYSCALE = Skin(
    name="grayscale", size=(1080, 1080), margin=64, min_font=16, max_words=25,
    palette={"WHITE": (255, 255, 255), "INK": hex2rgb("#1a1a1a"), "GRAY": hex2rgb("#6e6e6e"),
             "FOOTER": hex2rgb("#555555"), "LIGHT": hex2rgb("#9a9a9a")},
    accent=None, bg=((255, 255, 255),), fonts={"title": "Space Grotesk", "label": "Space Grotesk"},
    renderer="", notes="margin 64 is borrowed from moonworld (grayscale README states none).",
)

_MOONWORLD = Skin(
    name="moonworld", size=(1080, 1080), margin=64, min_font=16, max_words=25,
    palette={"SKY_TOP": hex2rgb("#090d13"), "SKY_MID": hex2rgb("#0e141c"), "SKY_BOT": hex2rgb("#121b26"),
             "SCENE": hex2rgb("#0a0e14"), "INK": hex2rgb("#e6ebf2"), "SILVER": hex2rgb("#c8d2de"),
             "QUIET": hex2rgb("#8d9bab"), "MOON": hex2rgb("#eeeae2")},
    accent=hex2rgb("#5ec8bd"), accent_family=(hex2rgb("#8fe3d9"),),
    bg=(hex2rgb("#090d13"), hex2rgb("#0e141c"), hex2rgb("#121b26")),
    fonts={"title": "Cormorant Garamond Light", "label": "IBM Plex Mono Light"},
    renderer="", notes="README 'Moon world'. Teal is spent in one place per slide.",
)

_cache = {}


def get(name):
    if name not in _cache:
        if name == "v4":
            _cache[name] = _v4()
        elif name == "grayscale":
            _cache[name] = _GRAYSCALE
        elif name == "moonworld":
            _cache[name] = _MOONWORLD
        else:
            raise KeyError(f"unknown skin {name!r} (known: {', '.join(NAMES)})")
    return _cache[name]


NAMES = ("v4", "grayscale", "moonworld")
