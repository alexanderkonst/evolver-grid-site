"""Lint rendered cards from the kit's own instrumentation (card.log), not from pixels.

Usage: python3 kit/lint.py <card>.card.yaml [...]     exit 1 if any rule FAILs
One line per rule per card:  PASS|FAIL  <card id>  <rule>  <detail with the offending text / element>

Rules (skin tokens in kit/skins.py):
  fit          every text line fits its maxw (measured with the real font) and its box, if it sits in one
  words        on-card prose words <= skin max_words (25), footer excluded; a spec may carry `max_words` as a waiver.
               Figure labels (drawn with vocab.name, part="label") are counted apart: each at most skin.label_words (3)
  (any other rule: a spec may carry `waive: {rule: reason}`; the lint line says WAIVED and keeps the detail)
  palette      only skin palette colours (accent included)
  accent       the skin's single accent (v4 NEON, moonworld teal) used by at most one element
  margins      every non-footer element inside the skin margin
  min-font     no text below the skin minimum (v4: 16 px at 1080 wide)
  footer       footer mark + findyourtoptalent.com present
  spec-fields  id, chapter, title, caption, skin, text, sources present; skin known

App icons (spec `kind: icon`, see icon.py) are checked by `check_icon` with ICON_RULES instead:
  palette      as above
  accent       the skin accent used by exactly one element, and that element is on the "after" side
  margins      every element inside the skin margin of the icon canvas
  stroke       every shape >= 6 px at 128 px (a line / ring / dot / orb: its width or diameter; a fill: its narrowest span)
  elements     at most 7 elements per side ("before", "after"), at most 1 between them ("mid")
  no-text      no text drawn on an icon
  spec-fields  as above

Icons v2 (spec `icon_version: 2`, issue #528) add two rules and tighten one (ICON_V2_RULES):
  elements     at most 4 shapes (parts drawn with the same `group` count once), all on the "after" side: no before, no chevron
  fill         the sign's longest side is 62-78% of the tile (the brief says ~70%)
  weight       every line and ring is exactly icon.WEIGHT px wide: one stroke weight for all ten
"""
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from kit import skins, spec as specmod  # noqa: E402

RULES = ("fit", "words", "palette", "accent", "margins", "min-font", "footer", "spec-fields")
ICON_RULES = ("palette", "accent", "margins", "stroke", "elements", "no-text", "spec-fields")
ICON_V2_RULES = ICON_RULES + ("fill", "weight")
ICON_V2_MAX_SHAPES = 4
ICON_V2_FILL = (0.62, 0.78)
ICON_SMALL = 128        # px: the size an icon must still read at
ICON_MIN_STROKE = 6     # px at ICON_SMALL
ICON_MAX_PER_SIDE = 7
TOL = 2  # px: rounding and glyph side-bearings
FOOTER_TEXT = "findyourtoptalent.com"


def words(rec):
    toks = [t for t in rec["text"].split() if re.search(r"[A-Za-z0-9]", t)]
    return toks[1:] if rec.get("part") == "eyebrow" else toks  # eyebrow starts with the card number: chrome


def _name(r):
    return f'"{r["text"]}"' if r["kind"] == "text" else r["kind"] + str([round(v) for v in r["bbox"]])


def _rgb(c):
    return tuple(c[:3]) if isinstance(c, (tuple, list)) else c


def check(card, spec, skin=None):
    """-> [(rule, ok, detail)] for a rendered card (anything with `.log`) and its spec."""
    skin = skin or card.skin
    log = card.log
    texts = [r for r in log if r["kind"] == "text"]
    body = [r for r in log if r["role"] != "footer"]
    out = []

    def add(rule, bad, ok_detail):
        shown = "; ".join(bad[:3]) + (f"; +{len(bad) - 3} more" if len(bad) > 3 else "")
        out.append((rule, not bad, ok_detail if not bad else shown))

    bad = []
    for r in texts:
        for ln, w in zip(r["lines"], r["widths"]):
            if r["maxw"] and w > r["maxw"] + 0.5:
                bad.append(f'"{ln}" is {w:.0f}px wide, maxw {r["maxw"]}px')
        c = r["container"]
        if c and (r["bbox"][0] < c[0] - 1 or r["bbox"][2] > c[2] + 1 or r["bbox"][1] < c[1] - 1 or r["bbox"][3] > c[3] + 1):
            bad.append(f'{_name(r)} spills out of its box {[round(v) for v in c]}')
    add("fit", bad, f"{len(texts)} text blocks fit their maxw / box")

    labels = [r for r in texts if r.get("part") == "label"]
    n = sum(len(words(r)) for r in texts if r["role"] != "footer" and r.get("part") != "label")
    limit = spec.get("max_words", skin.max_words)
    waiver = f" (spec waiver; skin default {skin.max_words})" if limit != skin.max_words else ""
    bad = [f"{n} words, limit {limit}"] if n > limit else []
    bad += [f'label "{r["text"]}" has {len(words(r))} words, label limit {skin.label_words}'
            for r in labels if len(words(r)) > skin.label_words]
    detail = f"{n} words, limit {limit}{waiver}" + (f"; {len(labels)} labels, each at most {skin.label_words} words" if labels else "")
    add("words", bad, detail)

    allowed = skin.colors()
    bad = [f"{_name(r)} uses {_rgb(r['color'])}" for r in log
           if isinstance(r["color"], (tuple, list)) and _rgb(r["color"]) not in allowed]
    add("palette", bad, f"all colours in skin {skin.name!r} palette")

    acc = skin.accent_colors()
    used = [_name(r) for r in log if isinstance(r["color"], (tuple, list)) and _rgb(r["color"]) in acc]
    if not acc:
        out.append(("accent", True, f"skin {skin.name!r} has no accent; none used" if not used else ""))
    else:
        add("accent", [f"{len(used)} elements use the accent: " + ", ".join(used)] if len(used) > 1 else [],
            f"accent used by {len(used)} element(s)")

    m, (W, H) = skin.margin, skin.size
    bad = [f"{_name(r)} outside margin {m}px" for r in body
           if r["bbox"][0] < m - TOL or r["bbox"][2] > W - m + TOL or r["bbox"][1] < m - TOL or r["bbox"][3] > H - m + TOL]
    add("margins", bad, f"{len(body)} elements inside the {m}px margin")

    floor = skin.min_font * W / 1080
    bad = [f'{_name(r)} is {r["size"]}px' for r in texts if r["size"] < floor]
    add("min-font", bad, f"smallest text {min((r['size'] for r in texts), default=0)}px, minimum {floor:g}px")

    has = any(r["role"] == "footer" and r["kind"] == "text" and FOOTER_TEXT in r["text"] for r in log) and \
        any(r["role"] == "footer" and r["kind"] == "star" for r in log)
    add("footer", [] if has else ["no footer mark + " + FOOTER_TEXT], "footer mark + " + FOOTER_TEXT)

    missing = specmod.missing(spec)
    add("spec-fields", [f"missing: {', '.join(missing)}"] if missing else [], "all required spec fields present")
    return _waived(out, spec)


def check_icon(card, spec, skin=None):
    """-> [(rule, ok, detail)] for a rendered icon (anything with `.log`, `.size`, `.skin`) and its spec.
    Icon elements carry `side` ("before" | "after" | "mid") and `stroke` (px at canvas size)."""
    skin = skin or card.skin
    log, size = card.log, card.size
    out = []

    def add(rule, bad, ok_detail):
        shown = "; ".join(bad[:3]) + (f"; +{len(bad) - 3} more" if len(bad) > 3 else "")
        out.append((rule, not bad, ok_detail if not bad else shown))

    allowed = skin.colors()
    add("palette", [f"{_name(r)} uses {_rgb(r['color'])}" for r in log
                    if isinstance(r["color"], (tuple, list)) and _rgb(r["color"]) not in allowed],
        f"all colours in skin {skin.name!r} palette")

    acc = skin.accent_colors()
    used = [r for r in log if isinstance(r["color"], (tuple, list)) and _rgb(r["color"]) in acc]
    bad = []
    if len(used) != 1:
        bad.append(f"{len(used)} elements use the accent, want exactly 1" + (": " + ", ".join(_name(r) for r in used) if used else ""))
    elif used[0].get("side") != "after":
        bad.append(f"the accent {_name(used[0])} is on the {used[0].get('side')!r} side, want 'after'")
    add("accent", bad, "one accent element, on the after side")

    m = skin.margin
    bad = [f"{_name(r)} outside margin {m}px" for r in log
           if r["bbox"][0] < m - TOL or r["bbox"][2] > size - m + TOL or r["bbox"][1] < m - TOL or r["bbox"][3] > size - m + TOL]
    add("margins", bad, f"{len(log)} elements inside the {m}px margin")

    k = ICON_SMALL / size
    bad = [f"{_name(r)} is {r['stroke'] * k:.1f}px at {ICON_SMALL}px, minimum {ICON_MIN_STROKE}px"
           for r in log if r.get("stroke") is not None and r["stroke"] * k < ICON_MIN_STROKE - 1e-6]
    add("stroke", bad, f"thinnest shape >= {ICON_MIN_STROKE}px at {ICON_SMALL}px "
        f"({min((r['stroke'] for r in log if r.get('stroke') is not None), default=0) * k:.1f}px)")

    counts = {s: sum(1 for r in log if r.get("side") == s) for s in ("before", "after", "mid")}
    v2 = spec.get("icon_version") == 2
    if v2:
        shapes = len({r["group"] if r.get("group") else id(r) for r in log if r.get("side") == "after"})
        bad = [f"{counts[s]} elements on the {s!r} side: v2 is one silhouette, all on 'after'" for s in ("before", "mid") if counts[s]]
        bad += [f"{shapes} shapes, limit {ICON_V2_MAX_SHAPES}"] if shapes > ICON_V2_MAX_SHAPES else []
        add("elements", bad, f"{shapes} shapes ({counts['after']} parts), limit {ICON_V2_MAX_SHAPES}, none before or between")
    else:
        bad = [f"{s}: {n} elements, limit {ICON_MAX_PER_SIDE}" for s, n in counts.items() if s != "mid" and n > ICON_MAX_PER_SIDE]
        bad += [f"mid: {counts['mid']} elements, limit 1"] if counts["mid"] > 1 else []
        add("elements", bad, f"before {counts['before']}, after {counts['after']}, mid {counts['mid']} (limit {ICON_MAX_PER_SIDE} per side)")

    texts = [r for r in log if r["kind"] == "text"]
    add("no-text", [f'text on an icon: "{r["text"]}"' for r in texts], "no text drawn")

    missing = specmod.missing(spec)
    add("spec-fields", [f"missing: {', '.join(missing)}"] if missing else [], "all required spec fields present")
    if v2:
        sign = [r for r in log if r.get("geom")]
        side = max(max(r["bbox"][2] for r in sign) - min(r["bbox"][0] for r in sign),
                   max(r["bbox"][3] for r in sign) - min(r["bbox"][1] for r in sign)) / size if sign else 0
        lo, hi = ICON_V2_FILL
        add("fill", [] if lo <= side <= hi else [f"the sign's longest side is {side:.0%} of the tile, want {lo:.0%}-{hi:.0%}"],
            f"the sign's longest side is {side:.0%} of the tile")
        from kit import icon as _icon
        lines = [r for r in log if r["kind"] in ("ln", "ring")]
        bad = [f"{_name(r)} is {r['stroke']}px wide, the one weight is {_icon.WEIGHT}px" for r in lines if abs(r["stroke"] - _icon.WEIGHT) > 0.5]
        add("weight", bad, f"{len(lines)} lines and rings, all {_icon.WEIGHT}px")
        order = {r: i for i, r in enumerate(ICON_V2_RULES)}
        out.sort(key=lambda t: order[t[0]])
    return _waived(out, spec)


def _waived(out, spec):
    """A spec may waive a rule for a ported legacy card: `waive: {fit: "why"}`. A waived FAIL passes and says so.
    `words` has its own waiver (`max_words`). Waivers never hide a rule that passes, and an unknown rule is an error."""
    waive = spec.get("waive") or {}
    res = []
    for rule, ok, detail in out:
        if not ok and rule in waive and rule != "spec-fields":
            ok, detail = True, f"WAIVED ({waive[rule]}): {detail}"
        res.append((rule, ok, detail))
    unknown = [r for r in waive if r not in RULES or r == "spec-fields"]
    if unknown:
        res = [(r, False, f"waive names a rule that cannot be waived: {', '.join(unknown)}") if r == "spec-fields" else (r, ok, d)
               for r, ok, d in res]
    return res


def lint_spec(path):
    """-> [(rule, status, detail)] with status PASS / FAIL / SKIP for one spec file."""
    from kit import render
    try:
        spec = specmod.load(path)
    except Exception as e:  # unreadable spec
        return "?", [("spec-fields", "FAIL", f"cannot read spec: {e}")] + [(r, "SKIP", "no spec") for r in RULES if r != "spec-fields"]
    cid = spec.get("id", os.path.basename(path))
    icon = spec.get("kind") == "icon"
    RS = (ICON_V2_RULES if spec.get("icon_version") == 2 else ICON_RULES) if icon else RULES
    missing = specmod.missing(spec)
    needed = {"title", "caption", "skin", "text"}
    if needed & {m.split(" ")[0] for m in missing}:
        return cid, [(r, "FAIL" if r == "spec-fields" else "SKIP", f"missing: {', '.join(missing)}" if r == "spec-fields" else "cannot render without spec fields") for r in RS]
    try:
        with tempfile.TemporaryDirectory() as tmp:
            card, _ = render.render(spec, os.path.join(tmp, "card.png"))
    except Exception as e:
        first = RS[0]
        return cid, [(r, "FAIL" if r == first else "SKIP", f"render failed: {type(e).__name__}: {e}" if r == first else "render failed") for r in RS]
    res = {r: (ok, d) for r, ok, d in (check_icon if icon else check)(card, spec)}
    return cid, [(r, "PASS" if res[r][0] else "FAIL", res[r][1]) for r in RS]


def main(paths):
    failed = 0
    for p in paths:
        cid, rows = lint_spec(p)
        for rule, status, detail in rows:
            print(f"{status:<4}  {cid}  {rule:<11} {detail}")
            failed += status == "FAIL"
    print(f"lint: {len(paths)} card(s), {failed} FAIL line(s)")
    return 1 if failed else 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1:]))
