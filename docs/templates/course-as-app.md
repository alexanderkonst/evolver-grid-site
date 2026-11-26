# Course as App (the shift loop)

> Every mini-training becomes an app with one result, wrapped in a loop: teaser infographic → course → closing infographic → entry into the game.
> *Born 2026-11-25 from Sasha's insight («это прорыв»); replaces docs/strategy/courses-as-apps.md.*

## Meta-description
- Level / parent: L2 · Content & Transmission · parent: [meta-template.md](./meta-template.md); extends [course-from-source.md](./course-from-source.md) (steps 9–10: wizard, Academy)
- Lens(es): **Ideal Forms** (one result, one icon, one tagline) · **Causal** (the loop: teaser → course → infographic → game)
- Shift carried: **PST 187 The Packaged Shift** (Sasha's yes, 2026-11-25) · **before:** a course is content you consume and then leave · **after:** a course is an app with a result; its infographic both pulls people in and seals the integration, and its end is an invitation into the game · **check:** someone who finished a course enters the game on their own, and someone who saw a teaser starts the course
- What emerges: a shelf of result-apps, each one a door into the game
- As a part of the whole: the Meta-Template sees a transmission that keeps moving: what was received is condensed, and the condensed form becomes the next person's door
- Siblings / repeats: [infographic.md](./infographic.md) (the cards), [course-from-source.md](./course-from-source.md) (building the course), PST 8 One Acorn, Every Magnification
- Status · applied in · last reviewed: v0.1 (one button) · Potential, Crossing, Vision (courses exist), Nature, Your AI (to create) · 2026-11-25

## Invariant (PST 187)
**One unit: a packaged shift, before → after.** It can be shown (an icon, a teaser, a closing card), walked (a course) or pressed (a button). The end of one person's shift, condensed into one image, is the door for the next person.

## App store for AI and the button console
*(Sasha, 2026-11-25 18:12, his words: «новый тип аппстора, применимый к ИИ, и приложения там именно такие»; «значит нужно обеспечивать качество. Значит пока что я, и далее другие люди»; «ИИ интерфейс упрощается до КОНСОЛИ кнопок. Можно задать вопрос, то есть послать человеческий сигнал, а можно нажать кнопку, которая берёт на себя целый пласт работы, и чем дальше, тем более невероятные пласты».)*
- **Apps** in this store are result-apps as above: one icon before → after, one name, one tagline.
- **Quality:** every app is signed by a curator before it ships. Now: Sasha. Later: other people.
- **Console:** the AI interface has two kinds of input only: a question (a human signal) or a button (a whole layer of work). Over time buttons take on bigger and bigger layers.

## Two spaces
The Training Center splits into the **Academy of Human Development** and the **Mystery School**. Which app lives where: open.

## The steps
1. **Result.** Name the before → after in one line. This is the app.
2. **App tile** (third panel): icon (square infographic, before → after); **name** (one word, bold); tagline (the result, same size as the name, regular).
3. **Infographic series.** Every course has its own series on the kit ([infographic.md](./infographic.md)).
4. **Teaser.** A piece of the series works as a lead magnet and leads to the course.
5. **Course.** Built by [course-from-source.md](./course-from-source.md).
6. **Closing infographic.** The course ends with the infographic: an integration accelerator.
7. **Invite into the game.** Every course is an entry into the game; the ending explicitly invites the person in. (How: Sasha, pending.)
8. **Price.** The first course is free; every course after it is paid (amounts: Sasha).
9. **Update this template** after each app.

## Where the store lives
*(2026-11-26, issue #524.)* The app store is the **third panel** of the Learn space: `/game/learn/courses` (`src/components/game/CourseStore.tsx`). The **second panel** lists the same courses under a "Courses" row (`SectionsPanel`, `buildLearnSections`). Tiles carry icon, bold short name, tagline, level + category chips, version, with level/category filters (client-side). Tile → `/academy/<slug>`; "Start" → the course page. **A new course appears there by adding data, nothing else:** its entry in `src/data/courseSales.ts` (list, name, promise) and in the module registry `src/data/modules.ts` (`courseLevel`, `courseCategory`, `versionNumber`, `startRoute`). Icon: add `docs/assets/infographics/apps/<id>@128.png` and one line in `COURSE_ICONS` (`src/data/courseStore.ts`); without it the tile shows a neutral placeholder.

## Run it with AI: one button
*(Sasha, 2026-11-25: «обогати конкретикой того как его применить с помощью ИИ, облегчив человеку задачу вплоть до исчезновения всего кроме одной кнопки».)*

### For the author: one button, **Make it an app**
The author gives nothing but the course they already have (its data file `src/data/courses/<course>.ts`, or the folder of materials). Everything else the AI already knows or decides by default. The one button changes its label as it goes; there is never a second control.

| Press | What the AI does, with no question to the author | Where it lives |
|-------|---------------------------------------------------|----------------|
| **Make it an app** | 1. Reads the course, writes the result as one before → after line. 2. Names the app: one word, the noun the result is about. 3. Tagline: verb in 3rd person + object, ≤6 words, same as the result line. 4. Icon spec: «before» drawn from the before half (QUIET/silver), «after» from the after half (one NEON), ≤7 elements a side. 5. Series: one card per module on the kit, all nodes labelled. 6. Teaser: the one card that shows the whole before → after. 7. Closing card: the full series condensed into one map. 8. Invite line at the end of the course. 9. Price: first app of the person = free, others = the default tier set once by the owner. Opens one @claude issue `Template: course-as-app`, lint must be PASS, `book_build.py --check` green. | kit: `docs/assets/infographics/apps/<id>.*`, `book/<course>/` |
| **Sign** (same button) | Shows one sheet: tile, teaser, closing card, invite line. The author reads it. Any word they change in place, the AI re-renders. Pressing signs (course-from-source step 8: nothing ships unsigned). | contact sheet |
| **Publish** (same button) | Adds the cards to the manifest, puts the tile on the third panel in its space (Academy or Mystery School, from the course's own level), switches the teaser on as a lead magnet. | `book.yaml`, app shelf |

Defaults remove every fork: the author never picks a layout, a colour, a card count, a name or a price. If the AI cannot fill a field from the course, it asks one short question inside the sheet, never a form.

### For the person who takes the course: one button, **Enter the game**
- Teaser seen anywhere → one tap opens the course.
- Course ends on the closing infographic → under it the only control is **Enter the game**. What they learnt becomes their first move in the game (the result line is carried in as their starting state).
- Nothing to fill in: the platform already knows them from the course.

### Status
Spec only. Building the button is a separate @claude issue; the learner's **Enter the game** touches how a player enters the game, so it needs Sasha's yes to that exact change first.

## Applications
| App | Tagline | Course source | Status |
|-----|---------|---------------|--------|
| Potential | Accelerates The Unfolding of Your Potential | Activate Your Dormant Potential | series on kit; icon #506 |
| Crossing | Reconciles Consciousness with Science | Consciousness Meets Science | icon #506 |
| Vision | Activates Your Inner Vision | Activation of Inner Vision | icon #506 |
| Nature | Aligns You With Natural Rhythms | to create from the Equilibrium manual | icon #506 |
| Your AI | Sets up Your AI | to create | icon #506 |

## Open
- How the invitation into the game works.
- Academy vs Mystery School split per app.
- Prices after the first course.
