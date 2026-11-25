"""What the PR workflow runs: render the cards a PR touched, lint them, check the Book, build one contact sheet.

Usage: python3 kit/ci.py [--base origin/main] [--all] [--out kit/out]
Touched = a spec, its script or its PNG changed vs --base; a change to kit code, engine-v4 or fyt_style.py touches every spec.
Exit 1 if lint or book_sync FAILs (or rendering breaks). The sheet lands in <out>/contact-sheet.png.
"""
import argparse
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from kit import book_sync, lint, render, sheet, skins, spec as specmod  # noqa: E402

REPO = os.path.normpath(os.path.join(skins.INFOGRAPHICS, "..", "..", ".."))
GLOBAL = ("docs/assets/infographics/kit/", "docs/assets/infographics/engine-v4/", "docs/assets/infographics/fyt_style.py")
NOT_GLOBAL = ("docs/assets/infographics/kit/proof/", "docs/assets/infographics/kit/fixtures/", "docs/assets/infographics/kit/out/",
              "docs/assets/infographics/kit/README.md")


def changed_files(base):
    r = subprocess.run(["git", "diff", "--name-only", f"{base}...HEAD", "--", "docs/assets/infographics"],
                       cwd=REPO, capture_output=True, text=True, check=True)
    return [l for l in r.stdout.splitlines() if l]


def touched_specs(base, everything=False):
    allspecs = book_sync.find_specs()
    if everything:
        return allspecs
    files = changed_files(base)
    if any(f.startswith(GLOBAL) and not f.startswith(NOT_GLOBAL) for f in files):
        return allspecs
    out = []
    for p in allspecs:
        stem = os.path.relpath(p, REPO)[: -len(".card.yaml")]
        if any(f in (stem + ".card.yaml", stem + ".py", stem + ".png") for f in files):
            out.append(p)
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="origin/main"); ap.add_argument("--all", action="store_true")
    ap.add_argument("--out", default=os.path.join(skins.INFOGRAPHICS, "kit", "out"))
    a = ap.parse_args()
    paths = touched_specs(a.base, a.all)
    if not paths:
        print("no card specs touched; nothing to render")
        sys.exit(0)
    print(f"cards: {', '.join(os.path.basename(p)[:-len('.card.yaml')] for p in paths)}")
    os.makedirs(a.out, exist_ok=True)
    specs = [specmod.load(p) for p in paths]
    for s in specs:
        render.render(s)
    rc = lint.main(paths)
    rc |= book_sync.main(paths)
    print(sheet.make_sheet(specs, os.path.join(a.out, "contact-sheet.png")))
    sys.exit(rc)
