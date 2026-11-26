# Course Update (the iterative loop of a living mini-training)

> A mini-training is never finished: new sources arrive, and the ones that pass Sasha's signature become new micro-modules. This is the loop that does it, one source at a time, without rebuilding the course and without letting anything unsigned in.
> *Born 2026-11-26 from Sasha's request (issue #525). First run: ADP Body update.*

## Meta-description
- Level / parent: L2 · Content & Transmission · parent: [meta-template.md](./meta-template.md); the update half of [course-from-source.md](./course-from-source.md) (step 11: update the template; "a living course: it keeps improving after release")
- Lens(es): **Causal** (source in → insights → signature → infographic → micro-module → code → version → surfaces → announce; the loop turns again with the next source) · **Ideal Forms** (one signed insight = one micro-module: one idea, 90 s, one infographic, one Ask-AI button)
- Shift carried: PST 117 The Learning Ledger and the Meta-Game (candidate; same candidate as [source-integration.md](./source-integration.md)) · **before:** a published course freezes; new knowledge either never reaches it or gets pasted in unsigned and uncredited · **after:** every new source can reach the course as a signed, credited micro-module under a new version, and a person who took the course sees what changed · **check:** for any course version, Sasha (or any agent) can open the changelog line, see which source and which signed insight it came from and who originated it; Sasha's да / нет / правка on each insight is recorded · also PST 187 The Packaged Shift (the course stays a packaged shift while it grows; [course-as-app.md](./course-as-app.md))
- What emerges: a course that compounds like the graph does: each addition traceable to its source, its author and Sasha's signature.
- As a part of the whole: the Meta-Template sees this as the metabolism of [source-integration.md](./source-integration.md) pointed at one product: what the organism eats, it turns into tissue of a course that is already alive, and nothing joins the body unsigned.
- Siblings / repeats: [source-integration.md](./source-integration.md) (steps 1–2 are its card and its Use Map), [infographic.md](./infographic.md) (step 4), [course-from-source.md](./course-from-source.md) (episode format, signature, Versioning), [course-as-app.md](./course-as-app.md) (the tile and the app surface), [improvement-loop.md](./improvement-loop.md) (the loop pattern: ship, report, retro), [docs/04-workflows/notebooklm_video_production.md](../04-workflows/notebooklm_video_production.md) (video mechanics, kept as a source).
- Status · applied in · last reviewed: v0.1 · ADP Body update (2026-11-26) · 2026-11-26

## Rule
**Nothing unsigned enters the course.** Sasha signs every insight before any infographic, video or code is made for it (step 3). Agents prepare, Sasha gates. Reuse the linked templates for the how; this file holds only the order, who acts, and where Sasha says yes.

## The loop
| # | Step | Who acts | Sasha's gate | Reuse |
|---|---|---|---|---|
| 1 | **Source in.** Sasha drops a link. The agent writes the source card in the knowledgegraph and puts the course on the Use Map as target 6 (Academy / course: material for an episode or module). | Hark or any agent running source-integration | none: dropping the link is the intake | [source-integration.md](./source-integration.md) §0a, §6a (target 6) |
| 2 | **Insights → candidate list.** One line per insight. Each line carries authorship: **originator** (whose idea it is) and **carrier** (who brings it to us). Any claim beyond our position is flagged `[beyond us]`, never smoothed. | Hark or any agent | none yet; the list goes to Sasha | [source-integration.md](./source-integration.md) §1a (authorship), §4 (extract) |
| 3 | **Sasha signs each insight:** **да** / **нет** / **правка** (his edit replaces the line). Nothing unsigned goes on. | Sasha | **the gate.** Only `да` and `правка` continue; a `нет` is parked on the card with one line of why | [course-from-source.md](./course-from-source.md) step 8 (signature) |
| 4 | **Infographic per key insight** on the kit; the sheet goes to Sasha. | Hark (infographic specialty) | Sasha sees the sheet before it is used | [infographic.md](./infographic.md) |
| 5 | **NotebookLM micro-module** per signed insight: **90 s, one idea.** Infographic + video + **Ask-AI button** (video first, then the button). | Hark or an agent with NotebookLM access | Sasha watches before it ships (his signature under every word) | [course-from-source.md](./course-from-source.md) step 6–7; [notebooklm_video_production.md](../04-workflows/notebooklm_video_production.md) |
| 6 | **Code.** New episodes added to the course data file (`src/data/courses/<slug>.ts`) through an @claude issue. | Claude Code | the issue is opened by Sasha or Hark with his yes; a PR, not a direct push | [spec-handoff.md](./spec-handoff.md) |
| 7 | **Version bump.** Semver: **minor** = a new episode or module, **patch** = a fix. One changelog line (source, signed insights, date) and `updatedAt`. | Claude Code in the same PR as step 6 | none beyond the PR | [course-from-source.md](./course-from-source.md) §Versioning |
| 8 | **Surfaces pick it up from data.** The course page, the sales / landing copy and the app-store tile read the new version from the data file; nothing is edited by hand per surface. | Claude Code | none; checked with the PR | [course-as-app.md](./course-as-app.md); `src/pages/CoursePage.tsx`, `src/data/courseSales.ts` |
| 9 | **Announce** (to people who took the course, on the stream, wherever). | Hark drafts | **only with Sasha's yes**; public voice never goes out unasked | [source-integration.md](./source-integration.md) §6a target 11 |
| 10 | **Update this template** after each run: one dated line in *Applications* below, and what the run taught. | whoever ran it | none | [improvement-loop.md](./improvement-loop.md) (Planning retro) |

**Report to Sasha** after each run: the signed insights, the new version, and one clickable link to the live course page ([improvement-loop.md](./improvement-loop.md) loop step 3, "Report in meaning").

## Rules of thumb
- One source can yield many insights; **only the signed ones become micro-modules**, and each micro-module holds one idea.
- A mini-training lasts 40 minutes at most (about 12 micro-modules with their questions). When an update would pass it, the loop does not stop: propose to Sasha which episode steps out, or whether this is a second mini-training.
- Keep the source of each episode traceable: the changelog line and the course data carry the source card, so the course can be corrected live.
- The Ask-AI question works in any AI and cannot refute the video ([course-from-source.md](./course-from-source.md) step 6).
- Steps 1–3 can run before any media exists; steps 4–5 never start before step 3 is answered.
- If a source only weakens a claim the course already makes, the update is a **patch** (a fix) plus a flag to Sasha, not a new episode.

## Applications
| Date | Course | Source | Signed insights | Version | Links |
|---|---|---|---|---|---|
| 2026-11-26 | **ADP Body** (Activate Your Dormant Potential, Body path) | Bashar (five-step formula); Michio Kushi (energy is received) | to be recorded on each source card as Sasha signs them | next minor, set in the code PR | knowledgegraph#320 (sources); evolver-grid-site #521, #522–#524 (infographic, micro-modules, code) |

*Run log (one dated line per run, step 10):*
- 2026-11-26: template written from the first run's order of work; first run still in flight. Lesson so far: the course data file had no `version` / `updatedAt` yet (`CourseConfig` in `src/data/courses/types.ts`), so the first code issue adds them; later runs only fill them.

## Open
- Where the changelog lives for the learner: in the data file (read by the course page) is the working assumption; Sasha to confirm.
- Whether people who already took the course are notified by the platform or only by Sasha's announcement (step 9).
- A dedicated landing-copy template does not exist yet; step 8 points at the course-sales data and course-as-app for now.
