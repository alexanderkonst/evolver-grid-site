"""Card spec: `<card>.card.yaml` beside `<card>.py` and `<card>.png`. See README.md for the format."""
import os

import yaml

REQUIRED = ("id", "chapter", "title", "caption", "skin", "text", "sources")


class Spec(dict):
    """The parsed YAML plus where it lives. `spec.text` is the on-card strings; scripts read only that."""
    path = ""

    @property
    def text(self):
        return self.get("text") or {}

    @property
    def number(self):
        return int(self.get("number", 1))

    @property
    def total(self):
        return int(self.get("of", self.number))

    @property
    def stem(self):
        return self.path[: -len(".card.yaml")]

    @property
    def script(self):
        return self.stem + ".py"

    @property
    def png(self):
        return self.stem + ".png"


def load(path):
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        raise ValueError(f"{path}: a card spec is a YAML mapping")
    s = Spec(data)
    s.path = os.path.abspath(path)
    return s


def missing(spec):
    """Required fields that are absent or empty, plus an unknown skin."""
    from kit import skins
    bad = [k for k in REQUIRED if not spec.get(k) and not (k == "caption" and spec.get(k) == "")]  # "" = the Book has none
    if spec.get("skin") and spec["skin"] not in skins.NAMES:
        bad.append(f"skin (unknown {spec['skin']!r})")
    for k in ("title", "caption"):
        if spec.get(k) and not isinstance(spec[k], str):
            bad.append(f"{k} (must be a string)")
    if spec.get("text") and not isinstance(spec["text"], dict):
        bad.append("text (must be a mapping)")
    if spec.get("sources") and not isinstance(spec["sources"], list):
        bad.append("sources (must be a list)")
    return bad
