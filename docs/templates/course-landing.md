# Course Landing

> One landing page for every mini-training, built from data. Source: issue #523 (Sasha, 2026-11-26). Applied first to *Activate Your Dormant Potential* (ADP).

## Meta-description
- **Level / parent:** L2 · Content & Transmission · parent: [course-from-source.md](./course-from-source.md) (the landing is the front door of the mini-training that template builds); sibling [course-as-app.md](./course-as-app.md) (the tile that points here)
- **Lens:** Ideal Forms (one form for every course)
- **Shift carried:** none of its own; it carries the shift of the mini-training it introduces. **Check:** a stranger reads the page and can say what they get and press one button.
- **Status · last reviewed:** v0 · 2026-11-26

## What it is
One template, many courses. Content lives in `src/data/courseSales.ts` (one entry per course; slug, title, promise and price come from the module registry `src/data/modules.ts`). `src/components/CourseSalesPage.tsx` lays it out. Route: `/academy/<slug>` (`src/pages/CourseSales.tsx`). A new course gets its landing by adding one data entry. No component edit.

## Sections, in order
| # | Section | Comes from |
|---|---|---|
| 1 | Title | registry title |
| 2 | Promise (+ one-line lead) | registry tagline; `lead` |
| 3 | Level and category chips | `level`, `category` on the entry (course object, versioning issue #522); no value, no chip |
| 4 | Version line: "Living mini-training, updated continuously. Current version vX.Y (YYYY-MM-DD)." | `version` on the entry (#522); no value, no line |
| 5 | Who it's for | `forWhom` |
| 6 | What you get: every module with its episode titles | `modules` (course data), or `inside` for recorded sessions |
| 7 | The series infographic or teaser | first episode `infographic` in course data; none, no section |
| 8 | The practice | `practice` |
| 9 | Format (+ price if any) and the **start CTA** | `format`, `price`, `cta` |
| 10 | Related: every other course in the registry | `relatedCourses(slug)` |

## Voice
Gift-first. No urgency, no scarcity, no fear. No claim, number or testimonial that is not in the course's own source. English UI. The word is **mini-training** for ADP (course-from-source, Words, 2026-11-22).
Landing law ([module-form.md](./module-form.md) §12.2): the result is named and there is one main button. Known tension: §12.2 says the button names the result in the player's voice, never "Start". #523 fixes ADP's label as "Start the mini-training"; revisit with Sasha.

## Links checklist
Each is tested (`src/data/__tests__/courseLanding.test.tsx`, `e2e/tests/course-landing.spec.ts`).
- [ ] **To the landing:** the Academy place (`/game/learn`, `AcademyPath.tsx`) cards and rows; the course page header "About this mini-training" (`CoursePage.tsx`); the course catalogue (#524, tile tap).
- [ ] **From the landing:** the start CTA → `/grow/<slug>` (top and bottom); "← Academy"; every Related row → that course's landing.
- [ ] Round trip: landing → start → course page → "About this mini-training" → landing.

## Definition of done for a new landing
Data entry added; sections 1–10 render from data; every link above present; the unit test passes; the router and README rows still point here.
