# Course Landing: one page per mini-training, one form for all

> Every mini-training has one landing at `/academy/<slug>`. It is drawn by one component from one data file, it names the promise first, offers the course as a gift with one button, and links both ways: in from the Academy, the course page and the catalogue, and out to the course and its related courses.
> *Born 2026-11-26 from issue #523 and Sasha's quality bar the same day («очень важны шаблоны, сделай их качественно»). The one-template rule it writes down has been in the code since 2026-10-30 (`src/data/courseSales.ts`).*

## Meta-description
- Level / parent: L2 · Content & Transmission (proposed L1, Meta-Template T3) · parent: [course-as-app.md](./course-as-app.md) (the shelf whose tiles open this page); sibling of [course-from-source.md](./course-from-source.md) (step 10: «a mini-training page and a sales page»; this is the sales page)
- Lens(es): **Blueprint** (where the landing lives, what links in and out, which file holds which word) · **Ideal Forms** (one form, sections in one order, every course the same)
- Shift carried: **PST 173 Sell the Shift, Not the Content** (candidate, for Sasha to confirm) · **before:** each course has its own page, written by hand. It lists what is inside, the visitor has to guess whether any of it will change something, and the page drifts from the course as episodes change · **after:** every course has the same landing. It names the promise in one line, gives the course as a gift with one button, and fills itself from the course data, so a new episode shows up on the landing without anyone editing it · **check:** a visitor who opened `/academy/<slug>` presses the start button and reaches `/grow/<slug>` in the same visit; asked afterwards, they can say the promise in their own words · also PST 187 (The Packaged Shift: the landing is the open lid of the app), 57 (Campfire Networking: one page speaks to everyone it resonates with), 8 (One Acorn, Every Magnification: the same form at every course)
- What emerges: a shelf of landings that cannot drift. Each one is the same form, filled from data, and each is one click from the course itself
- As a part of the whole: the Meta-Template sees the doorway of a transmission. What [course-from-source.md](./course-from-source.md) gave a spine is here given a face. People meet that face before they meet the course, and it carries them into it
- Siblings / repeats: [course-as-app.md](./course-as-app.md) (the tile that links here; the teaser this page may show), [course-from-source.md](./course-from-source.md) (building the course; Versioning rule), `course-update.md` (the update loop; issue #525, not on `main` at the time of writing), [module-form.md](./module-form.md) §12 (Landing copy law), [shift-offer.md](./shift-offer.md) (the offer line under PST 173), [infographic.md](./infographic.md) (the series and teaser cards), [qa-pass.md](./qa-pass.md) (the browser checks)
- Status · applied in · last reviewed: v1.0 · Activate Your Dormant Potential (#523, 2026-11-26); Consciousness Meets Science, Founder Academy, Integral Mystery School, Activation of Inner Vision and the Live group already use the same component · 2026-11-26

**Why it exists.** Courses keep changing: [course-from-source.md](./course-from-source.md) says a mini-training keeps improving after release, and the update loop adds episodes every few weeks. A landing written by hand goes stale with the first new episode. This template makes the landing a view of the course data. One component draws it, every word lives in one file, and only Sasha signs the copy. An agent with no context can give any course its landing, or check an existing one, by following the steps below.

---

## 0. How to run it (copy one line)

Hark (or Sasha) opens one @claude issue with this line. The agent does the rest without asking.

```
Template: course-landing. Run docs/templates/course-landing.md for: <course slug>. CTA label: <Sasha's words, or "default">. Teaser: <public/ path, or "none">.
```

Doubts go into the PR body as open questions. The agent never stops to ask.

---

## 1. What a course landing is (the one-template rule)

| Part | File | Rule |
|---|---|---|
| Route | `src/App.tsx` → `<Route path="/academy/:slug" element={<CourseSales />} />` | one route for every course; never add a per-course route |
| Lookup | `src/pages/CourseSales.tsx` → `getCourseSales(slug)` | unknown slug → `<Navigate to="/game/learn" replace />` |
| Layout (the one component) | `src/components/CourseSalesPage.tsx` | lays out data only; every section carries `data-landing-section="<id>"`; no course-specific branch |
| Copy (every word) | `src/data/courseSales.ts` → `COURSE_SALES: CourseSalesData[]` (per course) + `COURSE_LANDING_COPY` (section labels, the «About this mini-training» link) | the only file where landing words live (voice rules in its header comment) |
| Title, promise, price, SEO | `src/data/modules.ts` (module registry, `place: "academy"`) read through `fromRegistry(slug)` | one source: the landing never retypes the registry |
| Modules and episodes | `src/data/courses/<course>.ts` → `CourseConfig.modules` | the landing lists what the course data holds; published episodes only (`youtubeId` not starting with `TBD`), unless `status` is set |
| Version, level, category | `src/data/courses/types.ts` → `version`, `updatedAt`, `changelog`, `level`, `category` (added by issue #522); passed to the landing as `CourseSalesData.versioning` = `versioningOf(<COURSE>)` and drawn by `src/components/CourseVersionInfo.tsx` (the same component as on the course page) | the landing shows what the course data says; bump rule in [course-from-source.md](./course-from-source.md) §Versioning (section added by #522 / #525; until they merge, the rule is in #522's body) |
| Path helpers | `courseSalesPath(slug)` → `/academy/<slug>`; `courseLandingPath(slug)` → the path, or `undefined` if the course has no landing; `relatedCourses(slug)` → the Related row | every link to or from a landing uses these, never a typed string |

## 2. Sections, in order

The order is the template. `CourseSalesPage.tsx` draws them top to bottom, and the tests check the order by the `data-landing-section` ids.

| # | Section (`data-landing-section`) | What it shows | Data field (in `src/data/courseSales.ts` unless named) | Rule |
|---|---|---|---|---|
| 1 | `title` | eyebrow, course title | `eyebrow`; `title` (registry) | eyebrow names the form: for ADP «Free mini-training» |
| 2 | *(meta)* level + category chips, version line | «Living mini-training, updated continuously. Current version v1.0 (YYYY-MM-DD).» + «What's new» | course data: `level`, `category`, `version`, `updatedAt`, `changelog` | drawn by `<CourseVersionInfo course={course.versioning} centered />` (#522). #522 places it directly under the `<h1>`, before the promise, as on the course page; the two pages keep one placement. Absent when `versioning` is unset (sessions with no course data). Never typed on the landing |
| 3 | `promise` | one line, italic | `promise` = registry `tagline` | the shift in one line, in Sasha's words where they exist; never "a course about X" |
| 4 | `start` | lead, author line, the start button | `lead`, `COURSE_LANDING_COPY.author`, `cta` | one button (§3 below) |
| 5 | `for-whom` | 2–3 lines «Who it's for» | `forWhom: string[]` | the person's own situation, never a claim about results |
| 6 | `inside` | «What you get»: modules with their episode titles, or a plain list of sessions | `modules` (= `CourseConfig.modules`) or `inside` + `insideLabel` | from course data, never retyped; video counts are computed |
| 7 | `teaser` *(optional)* | the series infographic or its teaser card | `teaser: { src, alt }` | only an image already published under `public/` (Sasha's yes). A card that sits only on the kit (`docs/assets/infographics/…`) is not published, so leave `teaser` unset |
| 8 | `practice` | the practices that come with it | `practice: string[]` (ADP: from `CourseConfig.practices`) | what the person does, plainly |
| 9 | `price` | price, format, order, the start button again | `price`, `format`, `order` | «Free» or the registry price; format counts computed from data |
| 10 | `related` | every other course with a landing: title + promise, each a link | `relatedCourses(slug)` (derived from `COURSE_SALES`) | nothing to write: a course appears here by being in `COURSE_SALES` |

Above section 1: «← Academy» (`COURSE_LANDING_COPY.back`) → `/game/learn`.

## 3. Voice

Gift first, no urgency, and no claim that is not in the course's own source. The full rules are the header comment of `src/data/courseSales.ts` and [module-form.md](./module-form.md) §12.2 (the result is named, there is one main button, nothing else asks to be read). The words come from:
- **Word for the form:** «mini-training» ([course-from-source.md](./course-from-source.md) §Words, Sasha 2026-11-22). In UI copy for ADP: «mini-training», never «course» or «mini-course».
- **CTA label:** the label in the issue (Sasha's words). The default is «Start the mini-training». See Open §1 on how this sits with §12.2.
- **English UI.** The landing has no i18n keys. The course page's eyebrow does: `course.eyebrowMiniTraining` in `src/locales/{en,ru,es}/common.json`.

## 4. Links checklist

| # | Link | From → to | Where in code | Checked by |
|---|---|---|---|---|
| L1 | Academy → landing | `/game/learn` card → `/academy/<slug>` | `src/components/game/AcademyPath.tsx` (`ACADEMY_COURSES` cards and `NEXT_COURSES` lines, both via `courseSalesPath`) | unit «the Academy (/game/learn) opens the ADP landing»; e2e DoD 4 |
| L2 | Course page → landing | `/grow/<slug>` header «About this mini-training» → `/academy/<slug>` | `src/pages/CoursePage.tsx` header, shown when `courseLandingPath(course.slug)` is defined | unit «the ADP course page header links…»; e2e DoD 2 |
| L3 | Catalogue / app store → landing | store tile → `/academy/<slug>`; tile's secondary «Start» → `/grow/<slug>` | built by issue #524 (third panel); the tile must link with `courseSalesPath(slug)` | #524's own e2e; add a row to this table's tests when it lands |
| L4 | Landing → course | start button (sections 4 and 9) → `/grow/<slug>` | `cta: { kind: "start", to: <COURSE_PATH const> }` | unit «…starts it at /grow/…»; e2e DoD 2 |
| L5 | Landing → related | Related card → `/academy/<other>` | `relatedCourses(slug)` | unit «has a Related row…»; e2e DoD 3 |
| L6 | Landing → Academy | «← Academy» → `/game/learn` | `CourseSalesPage.tsx`, top | unit «links back to the Academy» |

Paid courses use `cta.kind: "telegram"` (no checkout in code yet), and the live group uses `"waitlist"`. L4 then opens Telegram or the waitlist instead of `/grow/<slug>`.

---

## 5. The steps

Each step: **input → output · who acts · Sasha's gate.** "Agent" means Claude Code or Codex working from an @claude issue; Hark opens the issue and checks the PR.

1. **Find the course.**
   - **Input:** the slug from the run line.
   - **Output:** the data file and its path constant, e.g. `src/data/courses/activateYourDormantPotential.ts` → `COURSE_SLUG`, `COURSE_PATH`. Run `grep -n "export const .*SLUG\|export const .*PATH" src/data/courses/*.ts` and `grep -n "slug" src/data/courseSales.ts`. If `getCourseSales(slug)` already returns an entry, this is a **check run**: change only what fails a DoD row below and never add a second entry.
   - **Who acts:** agent.
   - **Sasha's gate:** none.
2. **Registry entry.**
   - **Input:** the course's title and promise.
   - **Output:** one entry in `src/data/modules.ts` with `slug`, `title` (from the course const), `tagline` (= the promise), `price` («Free» or the amount), `description` (one `<p>`, used for SEO), `startRoute` (the path const), `place: "academy"`, `space: "LEARN"`. The test `src/data/__tests__/modules.test.ts` → «every Academy course sales page has a registry entry in the Academy» must pass.
   - **Who acts:** agent.
   - **Sasha's gate:** the promise line is his words or signed by him (course-from-source step 8: nothing ships unsigned). The price is his.
3. **Landing entry.**
   - **Input:** the course data and its source doc (named in the header comment of `courseSales.ts`).
   - **Output:** one object in `COURSE_SALES`: `...fromRegistry(<slug>)`, `eyebrow`, `lead`, `forWhom` (2–3 lines), `modules: <COURSE>.modules` (or `inside` + `insideLabel`), `practice`, `format` (counts computed with `countEpisodes`), `cta`, and optionally `order`, `status`, `teaser`. Add the course's source to the header comment.
   - **Who acts:** agent drafts.
   - **Sasha's gate:** he signs `lead` and `forWhom` word by word.
4. **Version and level.**
   - **Input:** the course data file.
   - **Output:** `version`, `updatedAt`, `changelog`, `level`, `category` set on the `CourseConfig`, and `versioning: versioningOf(<COURSE>)` on the course's `COURSE_SALES` entry. Check with `grep -n "version\|level\|category" src/data/courses/<course>.ts`. If the fields do not exist yet (issue #522 not merged), the meta section is absent: say so in the PR and do not type a version line on the landing.
   - **Who acts:** agent.
   - **Sasha's gate:** level and category are proposals until he says yes; bumps follow [course-from-source.md](./course-from-source.md) §Versioning.
5. **Series or teaser.**
   - **Input:** the run line's teaser path, or none.
   - **Output:** `teaser: { src: "/<path under public/>", alt: "<what the card shows>" }`, or nothing. Check with `test -f public<src>`. Never point at `docs/assets/…`.
   - **Who acts:** agent.
   - **Sasha's gate:** publishing a card is his yes ([course-as-app.md](./course-as-app.md) step 4, [infographic.md](./infographic.md)). Without it, leave `teaser` unset.
6. **Start button.**
   - **Input:** the CTA label from the run line.
   - **Output:** `cta: { kind: "start", label: "<label>", to: <PATH const> }` for a free course; `telegram` or `waitlist` for a paid one.
   - **Who acts:** agent.
   - **Sasha's gate:** the label is his (Open §1).
7. **Links in and out.**
   - **Input:** the links checklist (§4).
   - **Output:** L1: the course is in `ACADEMY_COURSES` (`src/lib/placeColor.ts`) or `NEXT_COURSES` (`AcademyPath.tsx`). L2 and L5 follow from data with nothing to add. L3: confirm the store tile uses `courseSalesPath`. L4: the `cta`.
   - **Who acts:** agent.
   - **Sasha's gate:** none. Moving a course between the two Academy lists is his call.
8. **Tests.**
   - **Input:** the new course.
   - **Output:** in `src/components/__tests__/courseLanding.test.tsx`, a `describe` for the course, like the ADP one: sections in order, title, promise and every episode from data, the start link, Related, back link. In `e2e/tests/course-landing.spec.ts`, its `LANDING` / `COURSE` pair (the ADP walk is the pattern).
   - **Run:** `npx vitest run src/components/__tests__/courseLanding.test.tsx src/data/__tests__/modules.test.ts` · `npm run typecheck` · `npx eslint <changed files>` · then `npx vite --port 8080 --host 127.0.0.1` and `cd e2e && PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/course-landing.spec.ts`. Running vitest rewrites `supabase/functions/mcp/index.ts` through the vite plugin: `git checkout` it before committing.
   - **Who acts:** agent.
   - **Sasha's gate:** none.
9. **QA and PR.**
   - **Input:** the preview URL.
   - **Output:** [qa-pass.md](./qa-pass.md) at the three widths. The PR body opens with «Template: course-landing», has the DoD table below with fresh output quoted, and ends with «Closes #<issue>».
   - **Who acts:** agent; Hark checks the PR against §6.
   - **Sasha's gate:** none.
10. **Sign.**
    - **Input:** one screenshot of the landing at 1440 px (full page).
    - **Output:** Sasha reads it. Any word he changes goes into `courseSales.ts` or the registry and nowhere else.
    - **Who acts:** Hark sends the sheet; Sasha reads.
    - **Sasha's gate:** **merge only on his yes.**
11. **Update this template.**
    - **Input:** what the run taught.
    - **Output:** a dated line in §8 (Applications) and, if the form changed, in §10 (Genealogy).
    - **Who acts:** agent, in the same PR.
    - **Sasha's gate:** none, unless L0/L1 change ([meta-template.md](./meta-template.md) §7.6).

## 6. Definition of Done

- [ ] `getCourseSales("<slug>")` returns one entry and `/academy/<slug>` renders it; an unknown slug still goes to `/game/learn` (e2e DoD 5)
- [ ] sections render in the order of §2 (`data-landing-section` ids), and the optional ones appear only when their data exists
- [ ] no landing word outside `src/data/courseSales.ts` and the registry; no course-specific branch in `CourseSalesPage.tsx`
- [ ] title, promise and price come from the registry; modules and episodes from the course data file
- [ ] start button label as given; it opens `/grow/<slug>` (free course) or Telegram / the waitlist (paid)
- [ ] links L1–L6 present; each has a unit test or an e2e step that passed in this run (L3 when #524 is merged)
- [ ] version line and chips come from course data (once #522 is merged), never typed
- [ ] teaser only from `public/`, only after Sasha's yes
- [ ] `vitest` (course landing + modules), `typecheck` and `eslint` green; Playwright walk green locally or on the preview; output quoted in the PR
- [ ] PR names «Template: course-landing»; Sasha's yes before merge
- [ ] §8 has a dated line for this run

## 7. Cost discipline

- Read in targeted pieces: `grep -n` for slugs and constants, `sed -n` for line ranges. Never read a course transcript to write a landing. The copy comes from the course's source doc only when Sasha asks for new lines.
- One component and one data file: a new course is a data change plus tests. A PR that adds a page component or a route for one course is wrong.
- Run Playwright on one viewport while working (`--project=desktop`), then all four once before the PR. CI runs them again on the preview.
- No new dependencies, no Lovable, and no edits to the guarded areas of the batch (top talent reveal, title screen and intro, themes, how a player enters the game, the quiz, map positions, navigation-instrument behaviour).
- If the same step is blocked twice, stop. Write what was found in the PR body as an open question, and ship the rest.

## 8. Worked example: ADP, 2026-11-26 (Bashar + Kushi → Body)

**Where it started.** ADP (shown as «Your Unfolding Potential», slug `activate-your-dormant-potential`) already had a landing at `/academy/activate-your-dormant-potential`. It had no Related row, no slot for a series, an eyebrow and button that said «mini-course» / «Start the course», and no way back from the course page. The Academy (`/game/learn`) already linked to it (L1).

**This run (#523), step by step.**
1. Check run: the entry existed, so it was extended, not duplicated.
2. Registry: the ADP `description` now says «A free mini-training…». Title and promise («You grow first, and then the results follow.») were unchanged.
3. Landing entry: eyebrow «Free mini-training». `lead` and `forWhom` were unchanged.
4. Version: #522 ran in parallel (branch `claude/issue-522-20261126-1845`: ADP `version "1.0"`, `updatedAt "2026-11-25"`, level Fundamental, category General). The meta row appears on this landing once #522 merges, with no landing edit beyond its own `versioning` line.
5. Teaser: none. The ADP series (`docs/assets/infographics/book/adp/A01–A10`) and the Potential icon (`docs/assets/infographics/apps/potential.card.yaml`, files in `apps/v6/`) are on the kit, not published.
6. Start button: «Start the mini-training» → `/grow/activate-your-dormant-potential`.
7. Links: L2 added (course page header, for every course with a landing); L5 and L6 in place; L3 waits for #524. The ADP course page eyebrow also now reads «Free mini-training» (`eyebrowKey: "course.eyebrowMiniTraining"`).
8. Tests: 12 unit tests in `src/components/__tests__/courseLanding.test.tsx`; `e2e/tests/course-landing.spec.ts`, 5 checks × 4 viewports, 20/20 against a local dev server.

**The Body update this landing has to carry, with zero landing edits.** On 2026-11-26 two sources entered the Body module: Bashar's five-step formula and Michio Kushi's «energy is received» (knowledgegraph#320). They became two kit cards: #521 B01 «The Bashar Formula» and B02 «Energy Is Received», kept unpublished until Sasha says yes. When Sasha signs them and the update loop (`course-update.md`, #525) adds the episodes to the `body` module of `COURSE_MODULES`:
- **What's inside** (§2 row 6) lists the new episode titles under «6. Body» and the video count rises by itself (`countEpisodes`). Nobody edits the landing.
- **format** («N short videos · …») updates through the same count.
- **Version line** (§2 row 2) moves to the next minor (a new episode = minor, §Versioning) with one changelog line, once #522's fields exist.
- **Teaser:** B01 and B02 stay off the landing until Sasha publishes them under `public/`. Then step 5 sets `teaser`.
- **Related** and the links do not change.

**Shift check (meta-template §7.4): not yet seen.** The run ended at the PR. The first sign will be visitors going from `/academy/activate-your-dormant-potential` to `/grow/…` after the merge (Open §2).

What this taught the template: the landing must never hold episode words. Every count and title is read from the course data, which is why §2 has a data-field column and §6 has the "no landing word outside courseSales.ts" row.

## 9. Open

1. **CTA label vs. §12.2.** [module-form.md](./module-form.md) §12.2 says a module's main button names the result in the player's voice and never says «Start». The issue fixed «Start the mini-training» for the ADP landing. A course landing is a shop window, not a module's Landing screen, so this template follows the issue. Sasha decides whether landings take a result-voiced label (e.g. «Unfold my potential») instead.
2. **The shift check needs an event.** `CourseSalesPage.tsx` sends no funnel event today (`trackPageView` in `src/lib/funnelAnalytics.ts` is not called there), so the landing → start check is read by hand from the e2e walk and from what people say. A `course_landing_view` + `course_landing_start` pair would make it countable. That is a separate issue, and Sasha decides it.
3. **ADP lead and module title still say «genius».** The series v3 renamed Genius → Uniqueness (#501). The landing shows whatever the course data says, so the rename is a course-data decision (via the update loop), not a landing edit.
4. **L3 (catalogue / app store)** lands with #524.
5. **Library candidate (meta-template §7.8).** A law from this run: *a page about a living thing is a view of its data, never a copy of it* (the landing that cannot drift). It may be a new technology or a facet of PST 96 (signal-preserving propagation). Sasha decides.

## 10. Genealogy

| Source | Date | Provenance | What it contributed |
|---|---|---|---|
| `src/data/courseSales.ts` + `src/components/CourseSalesPage.tsx` | 2026-10-30 | Sasha, chat: «давай каждому курсу сделаем продающую страницу!»; built by Claude Code | the one-template rule, the route `/academy/<slug>`, the voice rules (gift-first, no urgency, no claims beyond the source), the CTA kinds |
| `src/data/modules.ts` registry note in `courseSales.ts` | 2026-10-30 → 2026-11 | code | title, promise, price and SEO from one source (`fromRegistry`) |
| [module-form.md](./module-form.md) §12 | 2026-11-03 | Sasha, dictated | the Landing copy law: result named, one button, nothing else |
| [course-from-source.md](./course-from-source.md) §Words, step 10 | 2026-11-22 | Sasha, chat | «mini-training» as the one word; a mini-training has a page and a sales page |
| [course-as-app.md](./course-as-app.md) | 2026-11-25 | Sasha («это прорыв») | the tile that opens this page; teaser as lead magnet; PST 187 |
| Issue #522 | 2026-11-26 | Sasha via Hark | version line, «What's new», level and category chips (row 2 of §2) |
| Issue #524 | 2026-11-26 | Sasha, chat: «образовательный апстор» | the store tile → landing link (L3) |
| Issue #523 + Sasha's quality bar | 2026-11-26 | Sasha via Hark; comment 11:48 «очень важны шаблоны, сделай их качественно» | this file: sections in order, links checklist, steps runnable cold, DoD, ADP worked example; the Related row, the teaser slot, the course page's «About this mini-training» link |
