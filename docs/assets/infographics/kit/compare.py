"""Pixel-compare a ported card with the engine-v4 render of the same card.

Usage: python3 kit/compare.py <card>.card.yaml [...]
The spec names the engine call:  parity: {module: ideal_client, fn: k2, index: 2}  (engine-v4/<module>.py).
Prints mean absolute difference per RGB channel value (0 = identical, 255 = inverted) for
(a) a fresh kit render and (b) the committed PNG beside the spec, each against a fresh engine-v4 render.
"""
import importlib
import os
import sys
import tempfile

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from kit import skins, spec as specmod, render  # noqa: E402


def mad(a, b):
    x, y = np.asarray(Image.open(a).convert("RGB"), dtype=float), np.asarray(Image.open(b).convert("RGB"), dtype=float)
    return float(np.abs(x - y).mean()), int(np.abs(x - y).max())


def engine_render(parity, png):
    sys.path.insert(0, skins.ENGINE)
    mod = importlib.import_module(parity["module"])
    getattr(mod, parity["fn"])(parity["index"]).save(png)


def compare(spec):
    with tempfile.TemporaryDirectory() as tmp:
        eng, kit = os.path.join(tmp, "engine.png"), os.path.join(tmp, "kit.png")
        engine_render(spec["parity"], eng)
        render.render(spec, kit)
        res = {"fresh": mad(kit, eng)}
        if os.path.exists(spec.png):
            res["committed"] = mad(spec.png, eng)
    return res


if __name__ == "__main__":
    for p in sys.argv[1:]:
        s = specmod.load(p)
        for what, (m, mx) in compare(s).items():
            print(f"{s['id']}  {what:<9} vs engine-v4: mean abs diff {m:.4f}, max {mx}")
