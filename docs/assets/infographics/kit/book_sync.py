"""Check that cards with a spec agree with the Book: BOOK.md and src/data/infographicBook.ts.

Usage: python3 kit/book_sync.py --check [<card>.card.yaml ...]     (no files: every spec under infographics/)
For each spec whose id is a Book card id: its title and caption must equal BOOK.md's and infographicBook.ts's.
A spec whose id is not in the Book is SKIPped (proofs, drafts). Specs are the source: fix the spec, then BOOK.md / .ts.
Reads src/ only; never writes it.
"""
import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from kit import skins, spec as specmod  # noqa: E402

BOOK = os.path.join(skins.INFOGRAPHICS, "BOOK.md")
TS = os.path.normpath(os.path.join(skins.INFOGRAPHICS, "..", "..", "..", "src", "data", "infographicBook.ts"))


def parse_book(md):
    """id -> {title, caption} from BOOK.md card lists and from the '### ID · Title' sections."""
    cards = {}
    for line in md.splitlines():
        m = re.match(r"^- \[(.+?)\]\(book/[^/)]+/([^)]+?)\.png\)(?: · (.*))?$", line)
        if m:
            rest = m.group(3) or ""
            rest = re.sub(r"(^| · )status: .*$", "", rest).strip()
            cards[m.group(2)] = {"title": m.group(1), "caption": rest}
    cur = None
    for line in md.splitlines():
        h = re.match(r"^### ([IVX]+\.\d+) · (.+)$", line)
        if h:
            cur = h.group(1); cards[cur] = {"title": h.group(2), "caption": ""}
        elif cur and (s := re.match(r"^- Subtitle: (.*)$", line)):
            cards[cur]["caption"] = s.group(1).strip()
    return cards


def parse_ts(src):
    """id -> {title, caption} from the BOOK_CHAPTERS literal (JSON string literals, so unescape with json)."""
    s = r'"((?:[^"\\]|\\.)*)"'
    cards = {}
    for m in re.finditer(r'\{\s*id:\s*' + s + r',\s*title:\s*' + s + r'(?:,\s*caption:\s*' + s + ')?', src):
        cards[json.loads(f'"{m.group(1)}"')] = {"title": json.loads(f'"{m.group(2)}"'),
                                                 "caption": json.loads(f'"{m.group(3)}"') if m.group(3) is not None else ""}
    return cards


def check_spec(spec, book, ts):
    """-> (status, detail)"""
    cid = spec.get("id")
    inb, ints = cid in book, cid in ts
    if not inb and not ints:
        return "SKIP", "not a Book card id"
    bad = []
    if inb != ints:
        bad.append(f"in {'BOOK.md' if inb else 'infographicBook.ts'} only")
    for where, src in (("BOOK.md", book), ("infographicBook.ts", ts)):
        if cid in src:
            for k in ("title", "caption"):
                if (spec.get(k) or "") != src[cid][k]:
                    bad.append(f'{k} differs in {where}: spec "{spec.get(k) or ""}" vs "{src[cid][k]}"')
    return ("FAIL", "; ".join(bad)) if bad else ("PASS", "title + caption match BOOK.md and infographicBook.ts")


def _read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def find_specs():
    found = glob.glob(os.path.join(skins.INFOGRAPHICS, "**", "*.card.yaml"), recursive=True)
    return sorted(p for p in found if os.sep + "fixtures" + os.sep not in p)


def main(paths):
    book = parse_book(_read(BOOK))
    ts = parse_ts(_read(TS))
    failed = 0
    for p in paths or find_specs():
        spec = specmod.load(p)
        status, detail = check_spec(spec, book, ts)
        print(f"{status:<4}  {spec.get('id', p)}  book_sync   {detail}")
        failed += status == "FAIL"
    print(f"book_sync: {len(book)} BOOK.md ids, {len(ts)} reader ids, {failed} FAIL line(s)")
    return 1 if failed else 0


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] != "--check":
        sys.exit(__doc__)
    sys.exit(main(args[1:]))
