"""Render a card spec: import its script beside it, call build(spec), save the PNG beside it.

Usage: python3 kit/render.py <card>.card.yaml [...]      (writes <card>.png)
A card script is a module with `build(spec) -> KitCard`; all on-card text comes from `spec.text`.
"""
import importlib.util
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from kit import spec as specmod  # noqa: E402


def build(spec):
    name = "cardscript_" + os.path.basename(spec.stem).replace("-", "_").replace(".", "_")
    m = importlib.util.spec_from_file_location(name, spec.script)
    mod = importlib.util.module_from_spec(m)
    m.loader.exec_module(mod)
    return mod.build(spec)


def render(spec, png=None):
    """Draw the card and save it. Returns the card (with its `.log`) and the PNG path."""
    card = build(spec)
    png = png or spec.png
    card.save(png)
    return card, png


if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(render(specmod.load(p))[1])
