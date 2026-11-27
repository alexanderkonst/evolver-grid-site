"""Kit self-test. Run: python3 -m unittest discover -s docs/assets/infographics/kit -p "test_*.py" -v"""
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
INF = os.path.dirname(HERE)
sys.path.insert(0, INF)
from kit import asis, book_build, book_sync, compare, lint, render, skins, spec as specmod  # noqa: E402


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

    def test_label_words_are_counted_apart_from_the_prose_limit(self):
        labels = [text("one lens", part="label") for _ in range(12)]          # 24 label words: not prose
        prose = text(" ".join(["w"] * 25))
        r = res(Fake("v4", [prose] + labels + FOOT))
        self.assertTrue(r["words"][0], r["words"][1])
        self.assertIn("12 labels", r["words"][1])
        self.assertFalse(res(Fake("v4", [text(" ".join(["w"] * 26))] + labels + FOOT))["words"][0])  # prose limit unchanged

    def test_a_label_over_three_words_fails_and_names_itself(self):
        ok, detail = res(Fake("v4", [text("four words in label", part="label")] + FOOT))["words"]
        self.assertFalse(ok)
        self.assertIn('"four words in label"', detail)
        self.assertTrue(res(Fake("v4", [text("three word label", part="label")] + FOOT))["words"][0])

    def test_missing_spec_fields_fail(self):
        r = res(Fake("moonworld", [text("x")] + FOOT), specmod.Spec(id="x", skin="moonworld"))
        self.assertFalse(r["spec-fields"][0])
        for f in ("chapter", "title", "caption", "text", "sources"):
            self.assertIn(f, r["spec-fields"][1])


class IconFake:
    """A rendered icon as far as lint is concerned: skin, canvas size, log of elements."""
    def __init__(self, log, size=1024):
        self.skin, self.size, self.log = skins.get("v4"), size, log


NEON = skins.get("v4").accent
ICON_SPEC = specmod.Spec(id="x", kind="icon", chapter="apps", title="T", caption="C", skin="v4", text={"a": "b"}, sources=["s"])


def el(side="before", kind="dot", bbox=(200, 450, 300, 550), color=(200, 210, 222), stroke=100):
    return dict(kind=kind, role="body", bbox=bbox, color=color, container=None, side=side, stroke=stroke)


def ires(log, spec=ICON_SPEC):
    return {r: (ok, d) for r, ok, d in lint.check_icon(IconFake(log), spec)}


GOOD_ICON = [el("before"), el("after", color=NEON, bbox=(700, 450, 800, 550))]


class IconLint(unittest.TestCase):
    def test_clean_icon_passes_every_rule(self):
        r = ires(GOOD_ICON)
        self.assertEqual([k for k, (ok, _) in r.items() if not ok], [])
        self.assertEqual(set(r), set(lint.ICON_RULES))

    def test_stroke_under_6px_at_128_fails_and_names_the_element(self):
        thin = el("before", kind="ln", bbox=(100, 300, 400, 500), stroke=47)   # 47 px at 1024 = 5.9 px at 128
        ok, detail = ires(GOOD_ICON + [thin])["stroke"]
        self.assertFalse(ok); self.assertIn("ln", detail); self.assertIn("5.9", detail)
        self.assertTrue(ires(GOOD_ICON + [dict(thin, stroke=48)])["stroke"][0])

    def test_more_than_7_elements_on_one_side_fails(self):
        seven = [el("before") for _ in range(7)] + [GOOD_ICON[1]]
        self.assertTrue(ires(seven)["elements"][0])
        ok, detail = ires(seven + [el("before")])["elements"]
        self.assertFalse(ok); self.assertIn("before", detail)

    def test_accent_exactly_once_and_on_the_after_side(self):
        self.assertFalse(ires([el("before"), el("after")])["accent"][0])                             # none
        two = [el("after", color=NEON), el("after", color=NEON, bbox=(700, 450, 800, 550))]
        self.assertFalse(ires(two)["accent"][0])                                                      # two
        self.assertFalse(ires([el("before", color=NEON), el("after")])["accent"][0])                  # on the before side

    def test_palette_margins_and_text(self):
        self.assertFalse(ires(GOOD_ICON + [el("after", color=(255, 0, 0))])["palette"][0])
        self.assertFalse(ires(GOOD_ICON + [el("after", bbox=(900, 450, 1000, 550))])["margins"][0])
        words = dict(kind="text", role="body", bbox=(300, 300, 400, 330), color=(230, 235, 242), container=None,
                     side="before", text="hi", lines=["hi"], widths=[40], maxw=None, size=30, font="sans")
        self.assertFalse(ires(GOOD_ICON + [words])["no-text"][0])

    def test_spec_fields_are_required_for_icons_too(self):
        r = ires(GOOD_ICON, specmod.Spec(id="x", kind="icon", skin="v4"))
        self.assertFalse(r["spec-fields"][0])


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


V2_APPS = ("potential", "crossing", "vision", "nature", "my-ai")


class IconLintV2(unittest.TestCase):
    """Icons v2 (issue #528): one silhouette, <= 4 shapes, all on 'after', ~70% of the tile, one stroke weight."""
    def v2(self, log):
        spec = specmod.Spec(ICON_SPEC, icon_version=2)
        return {r: (ok, d) for r, ok, d in lint.check_icon(IconFake(log), spec)}

    def part(self, **kw):
        base = dict(kind="dot", role="body", bbox=(160, 160, 880, 880), color=(200, 210, 222), container=None, side="after",
                    stroke=100, geom=("disc", 512, 512, 360), group=None)
        return {**base, **kw}

    def good(self):
        return [self.part(), self.part(color=NEON, bbox=(450, 450, 550, 550))]

    def test_clean_v2_icon_passes_every_v2_rule(self):
        r = self.v2(self.good())
        self.assertEqual([k for k, (ok, _) in r.items() if not ok], [])
        self.assertEqual(set(r), set(lint.ICON_V2_RULES))

    def test_five_shapes_fail_but_a_group_counts_once(self):
        five = self.good() + [self.part() for _ in range(3)]
        ok, detail = self.v2(five)["elements"]
        self.assertFalse(ok); self.assertIn("5 shapes", detail)
        grouped = self.good() + [self.part(group="nodes") for _ in range(4)]
        self.assertTrue(self.v2(grouped)["elements"][0])

    def test_a_before_side_or_a_chevron_fails(self):
        self.assertFalse(self.v2(self.good() + [self.part(side="before")])["elements"][0])
        self.assertFalse(self.v2(self.good() + [self.part(side="mid")])["elements"][0])

    def test_the_sign_must_fill_about_70_percent(self):
        small = [self.part(bbox=(400, 400, 600, 600)), self.part(color=NEON, bbox=(450, 450, 550, 550))]
        ok, detail = self.v2(small)["fill"]
        self.assertFalse(ok); self.assertIn("20%", detail)
        big = [self.part(bbox=(80, 80, 944, 944)), self.part(color=NEON, bbox=(450, 450, 550, 550))]
        self.assertFalse(self.v2(big)["fill"][0])

    def test_every_line_and_ring_has_the_one_weight(self):
        from kit import icon
        ln = self.part(kind="ln", stroke=icon.WEIGHT)
        self.assertTrue(self.v2(self.good() + [ln])["weight"][0])
        ok, detail = self.v2(self.good() + [dict(ln, stroke=icon.WEIGHT - 8)])["weight"]
        self.assertFalse(ok); self.assertIn(f"{icon.WEIGHT - 8}px", detail)


class AppIconsV6(unittest.TestCase):
    """Icons v6 (issue #559): five apps x four themes as finished PNGs in `apps/v6/`; the v1-v3 files are gone."""
    ids = V2_APPS
    themes = ("lunar", "lapis", "aurum", "grayscale")

    def spec(self, i):
        return specmod.load(os.path.join(INF, "apps", f"{i}.card.yaml"))

    def test_five_specs_pass_the_v6_lint_and_ship_1024_and_128_for_every_theme(self):
        from PIL import Image
        for i in self.ids:
            cid, rows = lint.lint_spec(os.path.join(INF, "apps", f"{i}.card.yaml"))
            self.assertEqual([r for r in rows if r[1] != "PASS"], [], cid)
            self.assertEqual([r[0] for r in rows], list(lint.ICON_V6_RULES), cid)
            for t in self.themes:
                entry = self.spec(i)["themes"][t]
                self.assertEqual(Image.open(os.path.join(INF, "apps", entry["png"])).size, (1024, 1024), (i, t))
                self.assertEqual(Image.open(os.path.join(INF, "apps", entry["png128"])).size, (128, 128), (i, t))

    def test_the_taglines_are_kept_your_ai_is_my_ai_and_no_v3_files_remain(self):
        import glob
        specs = {i: self.spec(i) for i in self.ids}
        self.assertEqual({s["icon_version"] for s in specs.values()}, {6})
        self.assertEqual({i: s["caption"] for i, s in specs.items()}, {
            "potential": "Accelerates The Unfolding of Your Potential", "crossing": "Reconciles Consciousness with Science",
            "vision": "Activates Your Inner Vision", "nature": "Aligns You With Natural Rhythms", "my-ai": "Sets Up My AI"})
        self.assertEqual(specs["my-ai"]["title"], "My AI")
        self.assertFalse(os.path.exists(os.path.join(INF, "apps", "your-ai.card.yaml")))
        left = [os.path.basename(p) for p in glob.glob(os.path.join(INF, "apps", "*")) if os.path.isfile(p)
                and os.path.basename(p).endswith((".py", ".png")) and not os.path.basename(p).startswith("sheet")]
        self.assertEqual(left, [])

    def test_the_site_copies_in_public_match_the_kit_files_byte_for_byte(self):
        pub = os.path.join(INF, "..", "..", "..", "public", "apps", "icons")
        for i in self.ids:
            for t in self.themes:
                entry = self.spec(i)["themes"][t]
                for key, name in (("png", f"{i}-{t}.png"), ("png128", f"{i}-{t}@128.png")):
                    with open(os.path.join(INF, "apps", entry[key]), "rb") as a, open(os.path.join(pub, name), "rb") as b:
                        self.assertEqual(a.read(), b.read(), name)

    def test_ci_skips_the_render_and_the_sheet_shows_the_lunar_png(self):
        from kit import ci
        s = ci._sheet_spec(self.spec("potential"))
        self.assertTrue(s.png.endswith(os.path.join("v6", "potential-lunar.png")))
        self.assertTrue(os.path.exists(s.png))
        self.assertEqual(s["id"], "potential")

    def test_a_missing_theme_or_a_wrong_size_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            os.makedirs(os.path.join(tmp, "v6"))
            from PIL import Image
            for t in self.themes[:3]:
                Image.new("RGB", (1024, 1024)).save(os.path.join(tmp, "v6", f"x-{t}.png"))
                Image.new("RGB", (64, 64)).save(os.path.join(tmp, "v6", f"x-{t}@128.png"))
            body = {"id": "x", "kind": "icon", "icon_version": 6, "chapter": "apps", "title": "X", "caption": "C", "skin": "v4",
                    "text": {"shape": "s"}, "sources": ["s"],
                    "themes": {t: {"png": f"v6/x-{t}.png", "png128": f"v6/x-{t}@128.png"} for t in self.themes}}
            import yaml
            with open(os.path.join(tmp, "x.card.yaml"), "w", encoding="utf-8") as f:
                yaml.safe_dump(body, f)
            _, rows = lint.lint_spec(os.path.join(tmp, "x.card.yaml"))
            failed = {r[0]: r[2] for r in rows if r[1] == "FAIL"}
            self.assertIn("grayscale", failed["themes"])
            self.assertIn("64x64", failed["size"])


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


MANIFEST = """title: T
chapters:
  - number: "1"
    title: Opening
    status: to-make
    note: the main one
  - number: "2"
    title: Part
    sections:
      - number: "2.1"
        title: First
        cards:
%s
      - number: "2.2"
        title: Later
        status: to-make
        toc: "(and so on)"
"""
BOOKMD = """# Book
<!-- book:begin toc (generated) -->
old
<!-- book:end toc -->
prose stays
<!-- book:begin cards-proof (generated) -->
old
<!-- book:end cards-proof -->
tail
"""


class BookBuild(unittest.TestCase):
    """The manifest drives order, reader data and BOOK.md; --check notices drift. Built in a temp copy with two proof cards."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        r = cls.tmp.name
        os.makedirs(os.path.join(r, "book", "proof")); os.makedirs(os.path.join(r, "public"))
        for n in ("ideal-client-02", "laws-v4-l3"):
            for ext in (".card.yaml", ".py"):
                src = os.path.join(INF, "kit", "proof", n + ext)
                with open(src, encoding="utf-8") as f:
                    t = f.read()
                if ext == ".card.yaml":  # make them Book cards of chapter 2.1
                    t = t.replace('chapter: "3.2"', 'chapter: "2.1"').replace('chapter: "3.3"', 'chapter: "2.1"')
                with open(os.path.join(r, "book", "proof", n + ext), "w", encoding="utf-8") as f:
                    f.write(t)
        cls.paths = book_build.Paths(book=os.path.join(r, "book"), public=os.path.join(r, "public"),
                                     ts=os.path.join(r, "infographicBook.ts"), md=os.path.join(r, "BOOK.md"))

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def write(self, order):
        cards = "\n".join(f"          - {{id: {i}, spec: proof/{i}.card.yaml, status: draft v1}}" for i in order)
        with open(os.path.join(self.paths.book, "book.yaml"), "w", encoding="utf-8") as f:
            f.write(MANIFEST % cards)
        with open(self.paths.md, "w", encoding="utf-8") as f:
            f.write(BOOKMD)

    def test_text_generation_follows_manifest_order(self):
        self.write(["laws-v4-l3", "ideal-client-02"])
        title, chapters, errors = book_build.load(self.paths)
        self.assertEqual(errors, [])
        ts = book_build.gen_ts(title, chapters)
        self.assertLess(ts.index('id: "laws-v4-l3"'), ts.index('id: "ideal-client-02"'))
        self.assertIn('coming: true', ts)
        self.assertIn('note: "the main one"', ts)
        toc = book_build.gen_toc(chapters).splitlines()
        self.assertEqual(toc, ["1. Opening (the main one) (to make)", "2. Part", "   - 2.1 First (2 cards)", "   - 2.2 Later (and so on)"])
        lst = book_build.gen_cards_list(chapters, "proof").splitlines()
        self.assertTrue(lst[0].startswith("- [Seen Value Restores the Exchange](book/proof/laws-v4-l3.png) · "))
        self.assertTrue(lst[0].endswith("· status: draft v1"))

    def test_markers_replace_only_generated_blocks(self):
        md, found = book_build.apply_markers(BOOKMD, {"toc": "NEW", "cards-proof": "- x"})
        self.assertEqual(found, ["toc", "cards-proof"])
        self.assertIn("<!-- book:begin toc (generated) -->\nNEW\n<!-- book:end toc -->\nprose stays", md)
        self.assertEqual(book_build.apply_markers(md, {"toc": "NEW", "cards-proof": "- x"})[0], md)  # idempotent

    def test_manifest_errors_are_named(self):
        self.write(["laws-v4-l3", "ideal-client-02"])
        path = os.path.join(self.paths.book, "book.yaml")
        with open(path, encoding="utf-8") as f:
            t = f.read()
        bad = t.replace("id: ideal-client-02, spec: proof/ideal-client-02", "id: ideal-client-03, spec: proof/ideal-client-02") \
               .replace("status: draft v1}\n", "status: nope}\n", 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(bad)
        _, _, errors = book_build.load(self.paths)
        joined = "\n".join(errors)
        self.assertIn("status 'nope'", joined)
        self.assertIn("spec file is named ideal-client-02, the id must match", joined)

    def test_build_check_reorder_and_drift(self):
        self.write(["ideal-client-02", "laws-v4-l3"])
        out = []
        self.assertEqual(book_build.build(self.paths, say=out.append), 0, out)
        self.assertEqual(book_build.check(self.paths, say=out.append), 0, out)
        with open(self.paths.ts, encoding="utf-8") as f:
            before = f.read()
        self.assertIn("GENERATED by", before)
        # reordering = moving a line: the reader data, BOOK.md and the sheet follow, PNGs are not re-rendered
        self.write(["laws-v4-l3", "ideal-client-02"])
        self.assertNotEqual(book_build.check(self.paths, skip_lint=True, say=lambda *_: None), 0)  # out of sync until built
        out = []
        self.assertEqual(book_build.build(self.paths, say=out.append), 0, out)
        self.assertIn("rendered 0 of 2 card(s)", "\n".join(out))
        with open(self.paths.ts, encoding="utf-8") as f:
            after = f.read()
        self.assertLess(after.index("laws-v4-l3"), after.index("ideal-client-02"))
        self.assertEqual(book_build.check(self.paths, skip_lint=True, say=lambda *_: None), 0)
        # a hand edit of a generated file, a stale public copy and an edited spec are all caught
        with open(self.paths.ts, "a", encoding="utf-8") as f:
            f.write("// hand edit\n")
        self.assertNotEqual(book_build.check(self.paths, skip_lint=True, say=lambda *_: None), 0)
        book_build.build(self.paths, say=lambda *_: None)
        pub = os.path.join(self.paths.public, "proof", "laws-v4-l3.png")
        with open(pub, "ab") as f:
            f.write(b"x")
        self.assertNotEqual(book_build.check(self.paths, skip_lint=True, say=lambda *_: None), 0)
        book_build.build(self.paths, say=lambda *_: None)
        spec = os.path.join(self.paths.book, "proof", "ideal-client-02.card.yaml")
        with open(spec, "a", encoding="utf-8") as f:
            f.write("# touched\n")
        self.assertNotEqual(book_build.check(self.paths, skip_lint=True, say=lambda *_: None), 0)
        out = []
        book_build.build(self.paths, say=out.append)
        self.assertIn("rendered 1 of 2 card(s)", "\n".join(out))
        self.assertEqual(book_build.check(self.paths, say=lambda *_: None), 0)


AS_IS_SPEC = """id: asis-01
chapter: "2.1"
kind: as_is
source: asis-01.source.jpeg
title: "Drawn By Hand"
caption: "Shown exactly as drawn."
text:
  words: ["Myth", "Threshold"]
sources:
  - issue #563
"""


class AsIs(unittest.TestCase):
    """`kind: as_is`: the card is the author's picture; the build converts it to PNG and never restyles it."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        r = self.tmp.name
        os.makedirs(os.path.join(r, "book", "hand")); os.makedirs(os.path.join(r, "public"))
        from PIL import Image
        import numpy as np
        rng = np.random.default_rng(7)
        self.src = os.path.join(r, "book", "hand", "asis-01.source.jpeg")
        Image.fromarray(rng.integers(0, 256, (90, 120, 3), dtype=np.uint8)).save(self.src, quality=90)  # 120x90, not a kit size
        self.spec_path = os.path.join(r, "book", "hand", "asis-01.card.yaml")
        self.write_spec(AS_IS_SPEC)
        self.paths = book_build.Paths(book=os.path.join(r, "book"), public=os.path.join(r, "public"),
                                      ts=os.path.join(r, "infographicBook.ts"), md=os.path.join(r, "BOOK.md"))
        with open(os.path.join(self.paths.book, "book.yaml"), "w", encoding="utf-8") as f:
            f.write('title: T\nchapters:\n  - number: "2"\n    title: Part\n    sections:\n      - number: "2.1"\n'
                    '        title: First\n        cards:\n          - {id: asis-01, spec: hand/asis-01.card.yaml, status: approved v1}\n')
        with open(self.paths.md, "w", encoding="utf-8") as f:  # BOOK.md lists the card, as the real one does
            f.write(BOOKMD + "<!-- book:begin cards-hand -->\nold\n<!-- book:end cards-hand -->\n")

    def tearDown(self):
        self.tmp.cleanup()

    def write_spec(self, text):
        with open(self.spec_path, "w", encoding="utf-8") as f:
            f.write(text)

    def test_the_png_has_the_source_pixels_and_nothing_else(self):
        import numpy as np
        from PIL import Image
        out = os.path.join(self.tmp.name, "out.png")
        asis.build_png(specmod.load(self.spec_path), out)
        a, b = Image.open(self.src), Image.open(out)
        self.assertEqual((b.format, b.size, b.mode), ("PNG", a.size, a.mode))  # no resize, no crop, no footer band
        self.assertTrue((np.asarray(a) == np.asarray(b)).all())

    def test_lint_checks_the_file_and_the_words_only(self):
        spec = specmod.load(self.spec_path)
        self.assertTrue(asis.is_as_is(spec))
        self.assertEqual([r for r in asis.check(spec) if not r[1]], [])  # no skin, no footer, no word limit
        self.assertEqual(asis.missing(spec), [])
        os.remove(self.src)
        self.assertIn("source-file", [r for r, ok, _ in asis.check(spec) if not ok])
        self.write_spec(AS_IS_SPEC.replace('title: "Drawn By Hand"\n', "").replace('caption: "Shown exactly as drawn."\n', ""))
        self.assertEqual(sorted(asis.missing(specmod.load(self.spec_path))), ["caption", "title"])
        self.write_spec(AS_IS_SPEC.replace("source: asis-01.source.jpeg", "source: ../elsewhere.jpeg"))
        self.assertTrue(any(m.startswith("source") for m in asis.missing(specmod.load(self.spec_path))))
        self.assertEqual(lint.lint_spec(self.spec_path)[1][0][1], "FAIL")  # same spec, bad source: lint fails, does not crash

    def test_lint_spec_passes_a_good_as_is_card(self):
        cid, rows = lint.lint_spec(self.spec_path)
        self.assertEqual(cid, "asis-01")
        self.assertEqual({s for _, s, _ in rows}, {"PASS"}, rows)

    def test_book_build_copies_checks_and_notices_a_changed_source(self):
        out = []
        self.assertEqual(book_build.build(self.paths, say=out.append), 0, out)
        png = os.path.join(self.paths.book, "hand", "asis-01.png")
        pub = os.path.join(self.paths.public, "hand", "asis-01.png")
        self.assertTrue(os.path.exists(png) and os.path.exists(pub))
        self.assertEqual(book_build._sha(png), book_build._sha(pub))
        self.assertIn("asis-01", book_build.read_lock(self.paths)["cards"])
        self.assertEqual(book_build.check(self.paths, say=out.append), 0, out)
        from PIL import Image
        Image.new("RGB", (120, 90), (1, 2, 3)).save(self.src, quality=90)  # the author redraws it
        self.assertNotEqual(book_build.check(self.paths, skip_lint=True, say=lambda *_: None), 0)
        out = []
        self.assertEqual(book_build.build(self.paths, say=out.append), 0, out)
        self.assertIn("rendered 1 of 1 card(s)", "\n".join(out))
        self.assertEqual(book_build.check(self.paths, say=lambda *_: None), 0)

    def test_a_missing_source_stops_the_build(self):
        os.remove(self.src)
        out = []
        self.assertNotEqual(book_build.build(self.paths, say=out.append), 0)
        self.assertTrue(any("source-file" in l for l in out), out)


class CaptionSize(unittest.TestCase):
    """`caption_size` in a spec sets the size of the line under the title; without it the engine's 26 px stays."""
    def _caption(self, **extra):
        from kit import vocab as K
        sp = specmod.Spec(GOOD_SPEC, skin="v4", caption="Five paths, one cycle.", **extra)
        sp.path = os.path.join(HERE, "x.card.yaml")
        c = K.card(sp)
        return [r for r in c.log if r["kind"] == "text" and r["text"] == sp["caption"]][0]

    def test_default_is_the_engine_size_and_the_param_raises_it(self):
        self.assertEqual(self._caption()["size"], 26)
        self.assertEqual(self._caption(caption_size=30)["size"], 30)

    def test_labels_are_logged_as_labels(self):
        from kit import vocab as K
        sp = specmod.Spec(GOOD_SPEC, skin="v4"); sp.path = os.path.join(HERE, "x.card.yaml")
        c = K.card(sp)
        K.name(c, 540, 600, "Body")
        K.tag(c, 540, 700, "not a label")
        parts = {r["text"]: r.get("part") for r in c.log if r["kind"] == "text"}
        self.assertEqual(parts["Body"], "label")
        self.assertNotEqual(parts["not a label"], "label")


class Waivers(unittest.TestCase):
    def test_waive_turns_a_named_fail_into_a_labelled_pass(self):
        card = Fake("v4", [text("tiny", size=12)] + FOOT)
        spec = specmod.Spec(GOOD_SPEC, skin="v4", waive={"min-font": "legacy 12px note"})
        ok, detail = res(card, spec)["min-font"]
        self.assertTrue(ok); self.assertIn("WAIVED (legacy 12px note)", detail); self.assertIn('"tiny" is 12px', detail)
        self.assertFalse(res(card)["min-font"][0])  # no waiver, still a FAIL
        self.assertFalse(res(card, specmod.Spec(spec, waive={"spec-fields": "no"}))["spec-fields"][0])

    def test_empty_caption_is_allowed_when_the_book_has_none(self):
        self.assertEqual(specmod.missing(specmod.Spec(GOOD_SPEC, caption="")), [])
        self.assertIn("caption", specmod.missing(specmod.Spec({k: v for k, v in GOOD_SPEC.items() if k != "caption"})))


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
