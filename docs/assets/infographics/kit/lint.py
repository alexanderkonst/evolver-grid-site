"""Lint rendered cards from the kit's own instrumentation (card.log), not from pixels.

Usage: python3 kit/lint.py <card>.card.yaml [...]     exit 1 if any rule FAILs
One line per rule per card:  PASS|FAIL  <card id>  <rule>  <detail with the offending text / element>

Rules (skin tokens in kit/skins.py):
  fit          every text line fits its maxw (measured with the real font) and its box, if it sits in one
  words        on-card words <= skin max_words (25), footer excluded; a spec may carry `max_words` as a waiver
  (any other rule: a spec may carry `waive: {rule: reason}`; the lint line says WAIVED and keeps the detail)
  palette      only skin palette colours (accent included)
  accent       the skin's single accent (v4 NEON, moonworld teal) used by at most one element
  margins      every non-footer element inside the skin margin
  min-font     no text below the skin minimum (v4: 16 px at 1080 wide)
  footer       footer mark + findyourtoptalent.com present
  spec-fields  id, chapter, title, caption, skin, text, sources present; skin known
"""
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from kit import skins, spec as specmod  # noqa: E402

RULES = ("fit", "words", "palette", "accent", "margins", "min-font", "footer", "spec-fields")
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

    n = sum(len(words(r)) for r in texts if r["role"] != "footer")
    limit = spec.get("max_words", skin.max_words)
    waiver = f" (spec waiver; skin default {skin.max_words})" if limit != skin.max_words else ""
    add("words", [f"{n} words, limit {limit}"] if n > limit else [], f"{n} words, limit {limit}{waiver}")

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
    missing = specmod.missing(spec)
    needed = {"title", "caption", "skin", "text"}
    if needed & {m.split(" ")[0] for m in missing}:
        return cid, [(r, "FAIL" if r == "spec-fields" else "SKIP", f"missing: {', '.join(missing)}" if r == "spec-fields" else "cannot render without spec fields") for r in RULES]
    try:
        with tempfile.TemporaryDirectory() as tmp:
            card, _ = render.render(spec, os.path.join(tmp, "card.png"))
    except Exception as e:
        return cid, [(r, "FAIL" if r == "fit" else "SKIP", f"render failed: {type(e).__name__}: {e}" if r == "fit" else "render failed") for r in RULES]
    res = {r: (ok, d) for r, ok, d in check(card, spec)}
    return cid, [(r, "PASS" if res[r][0] else "FAIL", res[r][1]) for r in RULES]


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
