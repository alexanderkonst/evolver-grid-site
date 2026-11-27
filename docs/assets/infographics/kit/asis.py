"""As-is cards: the author's own picture shown exactly as drawn.

A spec with `kind: as_is` and `source: <file>` (a file beside the spec) has no skin, no script and no renderer.
The build converts the source to PNG and nothing else: no resize, no crop, no footer, no restyle.
Lint checks two things only: title / caption (and id, chapter) are present, and the source file exists.

Kept out of vocab/skins/render/spec on purpose: those files are the renderer fingerprint in book.lock.json,
and touching them would mark all the drawn cards stale.
"""
import hashlib
import os

KIND = "as_is"
RULES = ("spec-fields", "source-file")
NEEDED = ("id", "chapter", "title", "caption", "source")
PNG_MODES = ("1", "L", "LA", "P", "RGB", "RGBA", "I;16")


def is_as_is(spec):
    return spec.get("kind") == KIND


def source_path(spec):
    return os.path.join(os.path.dirname(spec.path), str(spec.get("source", "")))


def missing(spec):
    """Fields an as-is spec must carry. `source` is a bare file name: the picture lives beside its spec."""
    bad = [k for k in NEEDED if not spec.get(k)]
    for k in ("title", "caption"):
        if spec.get(k) and not isinstance(spec[k], str):
            bad.append(f"{k} (must be a string)")
    src = spec.get("source")
    if src and (not isinstance(src, str) or os.path.basename(src) != src):
        bad.append("source (a file name beside the spec, no folders)")
    return bad


def check(spec):
    """-> [(rule, ok, detail)], the same shape as lint.check."""
    miss = missing(spec)
    path = source_path(spec) if spec.get("source") and not any(m.startswith("source") for m in miss) else ""
    exists = bool(path) and os.path.isfile(path)
    return [("spec-fields", not miss, "id, chapter, title, caption, source present" if not miss else f"missing: {', '.join(miss)}"),
            ("source-file", exists, os.path.basename(path) if exists else f"source file not found: {spec.get('source')!r}")]


def build_png(spec, out_png):
    """Write the source's pixels to out_png as PNG, untouched. (Only a mode PNG cannot hold, e.g. CMYK, is converted to RGB.)"""
    from PIL import Image
    with Image.open(source_path(spec)) as im:
        im.load()
        if im.mode not in PNG_MODES:
            im = im.convert("RGB")
        im.save(out_png, format="PNG", icc_profile=im.info.get("icc_profile"))
    return out_png


def fingerprint(spec):
    """What the PNG is made of: the spec and the source file."""
    h = hashlib.sha256()
    for p in (spec.path, source_path(spec)):
        with open(p, "rb") as f:
            h.update(f.read())
        h.update(b"\0")
    return h.hexdigest()
