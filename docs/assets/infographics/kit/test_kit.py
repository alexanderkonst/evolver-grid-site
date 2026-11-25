"""Kit self-test. Run: python3 -m unittest discover -s docs/assets/infographics/kit -p "test_*.py" -v"""
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
INF = os.path.dirname(HERE)
sys.path.insert(0, INF)
from kit import book_sync, compare, lint, skins, spec as specmod  # noqa: E402


class Fake:
    """A rendered card as far as lint is concerned: a skin and a log."""
    def __init__(self, skin, log):
        self.skin, self.log = skins.get(skin), log


def text(s, *, size=20, color=(230, 235, 242), bbox=(100, 200, 300, 220), maxw=None, role="body", w=None, container=None, part=None):
    r = dict(kind="text", role=role, bbox=bbox, color=color, container=container, text=s, lines=[s],
             widths=[w if w is not None else 100], maxw=maxw, size=size, font="sans")
    if part: r["part"] = part
    return r


FOOT = [text("findyourtoptalent.com", role="footer", bbox=(140, 1270, 380, 1290)),
        dict(kind="star", role="footer", bbox=(80, 1259, 125, 1303), color="iri", container=None)]
GOOD_SPEC = specmod.Spec(id="x", chapter="1", title="T", caption="C", skin="moonworld", text={"a": "b"}, sources=["s"])


def res(card, spec=GOOD_SPEC):
    return {r: (ok, d) for r, ok, d in lint.check(card, spec)}


class LintRules(unittest.TestCase):
    def test_clean_moonworld_card_passes_every_rule(self):
        r = res(Fake("moonworld", [text("a quiet card")] + FOOT))
        self.assertEqual([k for k, (ok, _) in r.items() if not ok], [])
        self.assertEqual(set(r), set(lint.RULES))

    def test_each_rule_fails_on_its_own_violation(self):
        teal = (94, 200, 189)
        cases = {
            "fit": text("overflowing", w=410, maxw=300),
            "palette": text("red", color=(255, 0, 0)),
            "margins": text("outside", bbox=(10, 200, 300, 220)),
            "min-font": text("tiny", size=12),
        }
        for rule, rec in cases.items():
            ok, detail = res(Fake("moonworld", [rec] + FOOT))[rule]
            self.assertFalse(ok, rule); self.assertTrue(detail, rule)
        two = [text("teal one", color=teal), text("teal two", color=teal)]
        self.assertFalse(res(Fake("moonworld", two + FOOT))["accent"][0])
        self.assertTrue(res(Fake("moonworld", two[:1] + FOOT))["accent"][0])
        self.assertFalse(res(Fake("moonworld", [text("word " * 26)] + FOOT))["words"][0])
        self.assertFalse(res(Fake("moonworld", [text("no footer")]))["footer"][0])
        boxed = text("spills", bbox=(100, 200, 300, 260), container=(90, 190, 310, 230))
        self.assertFalse(res(Fake("moonworld", [boxed] + FOOT))["fit"][0])

    def test_footer_words_do_not_count_and_spec_waiver_raises_the_limit(self):
        words25 = text(" ".join(["w"] * 25))
        self.assertTrue(res(Fake("moonworld", [words25] + FOOT))["words"][0])
        over = Fake("moonworld", [text(" ".join(["w"] * 30))] + FOOT)
        self.assertFalse(res(over)["words"][0])
        waived = specmod.Spec(GOOD_SPEC, max_words=30)
        self.assertTrue(res(over, waived)["words"][0])

    def test_missing_spec_fields_fail(self):
        r = res(Fake("moonworld", [text("x")] + FOOT), specmod.Spec(id="x", skin="moonworld"))
        self.assertFalse(r["spec-fields"][0])
        for f in ("chapter", "title", "caption", "text", "sources"):
            self.assertIn(f, r["spec-fields"][1])


class RenderedCards(unittest.TestCase):
    def test_broken_fixture_fails_with_clear_lines_and_nonzero_exit(self):
        p = subprocess.run([sys.executable, os.path.join(HERE, "lint.py"), os.path.join(HERE, "fixtures", "broken.card.yaml")],
                           capture_output=True, text=True)
        self.assertEqual(p.returncode, 1)
        for needle in ('FAIL  broken-fixture  fit', "unbreakable_word", 'FAIL  broken-fixture  palette', "(255, 0, 0)",
                       'FAIL  broken-fixture  accent', "a second neon element", 'FAIL  broken-fixture  min-font'):
            self.assertIn(needle, p.stdout)

    def test_proof_cards_pass_lint_and_match_engine_v4_pixels(self):
        for path in sorted(os.path.join(HERE, "proof", f) for f in os.listdir(os.path.join(HERE, "proof")) if f.endswith(".card.yaml")):
            cid, rows = lint.lint_spec(path)
            self.assertEqual([r for r in rows if r[1] != "PASS"], [], cid)
            mean, _ = compare.compare(specmod.load(path))["committed"]
            self.assertLess(mean, 0.5, cid)


class BookSync(unittest.TestCase):
    def setUp(self):
        self.book = book_sync.parse_book(book_sync._read(book_sync.BOOK))
        self.ts = book_sync.parse_ts(book_sync._read(book_sync.TS))

    def test_parsers_see_every_card_in_both_places(self):
        self.assertEqual(set(self.book), set(self.ts))
        self.assertEqual(self.book["VI.01"]["title"], "Their Own 0–10 Scale")
        self.assertEqual(self.ts["VI.02"]["caption"], 'At the end, one question for each goal: "How far did it come true?"')
        self.assertEqual(self.book["VI.02"]["caption"], self.ts["VI.02"]["caption"])
        self.assertEqual(self.book["noosphere-3"]["caption"], "")

    def test_match_mismatch_and_skip(self):
        c = self.book["ideal-client-02"]
        same = specmod.Spec(id="ideal-client-02", title=c["title"], caption=c["caption"])
        self.assertEqual(book_sync.check_spec(same, self.book, self.ts)[0], "PASS")
        bad = specmod.Spec(same, title="Another Title")
        status, detail = book_sync.check_spec(bad, self.book, self.ts)
        self.assertEqual(status, "FAIL"); self.assertIn("Another Title", detail)
        self.assertEqual(book_sync.check_spec(specmod.Spec(id="not-in-book"), self.book, self.ts)[0], "SKIP")

    def test_main_content_passes(self):
        self.assertEqual(book_sync.main([]), 0)


class OldScripts(unittest.TestCase):
    def test_fyt_style_shim_still_serves_old_scripts(self):
        code = ("import sys; sys.path.insert(0, %r); import fyt_style, matplotlib.pyplot as plt; "
                "f = plt.figure(figsize=(4, 4)); a = f.add_axes([0, 0, 1, 1]); a.set_xlim(0, 100); a.set_ylim(0, 100); "
                "t = a.text(50, 50, 'Hello', ha='center'); assert t.get_text() == 'hello'; fyt_style.footer(a); "
                "f.savefig(sys.argv[1])" % INF)
        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "o.png")
            p = subprocess.run([sys.executable, "-c", code, out], capture_output=True, text=True)
            self.assertEqual(p.returncode, 0, p.stderr)
            self.assertGreater(os.path.getsize(out), 1000)


if __name__ == "__main__":
    unittest.main()
