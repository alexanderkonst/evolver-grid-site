"""House style for the grayscale (matplotlib) infographics: Space Grotesk, all lowercase, grayscale.
Thin shim: the implementation moved to kit/mpl.py (the `grayscale` skin of the infographic kit, kit/README.md).
Old scripts keep working unchanged: `import fyt_style` registers the font and lowercasing, `fyt_style.footer(a)`."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit.mpl import footer  # noqa: E402,F401
