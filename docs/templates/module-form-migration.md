# Module form: audit and migration plan

*Audit of every player-facing module in `src/` against [module-form.md](./module-form.md), 2026-11-03 (issue #315, Sasha: «ГЕНИАЛЬНО! хорошенько поработай над этим»). Docs only: no `src/` file was touched, no route from the blueprint's §14.13 keep-constraint was touched. Code read at commit `ab6240f`.*

*How this was made.* No template in `docs/templates/` produces an audit or a migration plan, so this follows the closest parts of the template itself: §9 *Polishing an existing module* (spec fidelity audit → drift report, findings with file:line) and §12.6 *DoD (any module)* as the rubric. Each future issue is shaped by [spec-handoff.md](./spec-handoff.md) §3 and §6 (one PR = one DoD; open forks written as «Decision: X. Recommended: Y. Override?»).

*Rule carried from §12.2:* the copy law is applied **one module at a time, by Sasha's yes, never as a sweep**. The order below is a proposal; each row is a separate issue that waits for his yes.

---

## 1. What counts as a module

A module is a place where the player does one real thing and ends with a result they keep. Three groups exist in `src/`:

- **A. In the form today.** They render the shared `ModuleIntro` / `ModuleOutro` (`src/components/game/ModuleIntro.tsx`, `ModuleOutro.tsx`), whose words live in `JOURNEY_MODULES` (`src/data/journeyModules.ts`). 11 modules are live, 1 is built but unreachable.
- **B. Own screens, same look.** They use `ModuleForm.css` and the `mf` classes but not the two components: Your AI, Town Hall.
- **C. Player-facing, no form at all.** Real doors in the game that have no Intro or Outro. Whether each is a *module* in the sense of §1 is a question for Sasha; they are listed so none is missed.

Everything else in `src/App.tsx` is not a module: marketing and press pages, the investor room, auth, legal, admin, public profile and course sales pages, redirects, and hubs (Home / Character Sheet `/game/me/*`, the Village `/village/:place?`, the Quest Board). They are listed in §6 so the coverage claim can be checked.

## 2. Inventory

| # | Module (module id) | Route (`src/App.tsx`) | Main files | Group |
|---|---|---|---|---|
| 1 | Top Talent / Zone of Genius (`find-top-talent`, J1) | `/zone-of-genius/entry` (L1002); `/zone-of-genius` and `/game/journey/start` redirect to it | `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx`; copy `zogEntry.*` in `src/locales/*/common.json` | A |
| 2 | Mission Discovery (`discover-mission`, J2) | `/mission-discovery` (L1032) | `src/modules/mission-discovery/MissionDiscoveryLanding.tsx`, `MissionDiscoveryWizard.tsx` | A |
| 3 | Quality of Life map (`assess-qol`, J4) | `/quality-of-life-map/assessment`, `/results` (L983–985); Home copy at `/game/me/quality-of-life` (L992) | `src/pages/QualityOfLifeMapAssessment.tsx`, `QualityOfLifeMapResults.tsx` | A |
| 4 | Asset Mapping (`map-assets`, J5) | `/asset-mapping` (L1042), `/asset-mapping/wizard` (L1043) | `src/modules/asset-mapping/AssetMappingLanding.tsx`, `AssetMappingWizard.tsx` | A |
| 5 | Uniqueness phrase (`uniqueness-phrase`, J6) | `/ubb/uniqueness` (L936) | `src/modules/unique-business-builder/JourneySlice.tsx`, `screens/GenericArtifactScreen.tsx`, `journeySlices.ts` | A |
| 6 | Tagline (`tagline`, J7) | `/ubb/promise` (L940) | same as 5 | A |
| 7 | Free Mastermind session (`webinar`, J8) | `/game/journey/quest/webinar` (L831) | `src/components/game/QuestModule.tsx`, `src/lib/questBoard.ts` | A |
| 8 | Mastermind Nov 9–10 (`mastermind`, J9) | `/game/journey/quest/mastermind` (L831) | same as 7 | A |
| 9 | 21 days of practice (`mastery-practice`, J10) | `/game/journey/quest/mastery-practice` (L831) | same as 7 | A |
| 10 | First price (`first-price`, J11 in code) | `/game/journey/quest/first-price` (L831) | same as 7 | A |
| 11 | First sale (`first-sale`, J12 in code) | `/game/journey/quest/first-sale` (L831) | same as 7 | A |
| 12 | Academy welcome lesson (`academy-welcome`) | none reachable (see finding E2) | `src/components/game/AcademyModule.tsx`, `src/data/academyModule.ts` | A (orphaned) |
| 13 | Your AI / Familiar | `/game/your-ai` (L632) | `src/modules/familiar/FamiliarPage.tsx`, `screens/FamiliarIntroScreen.tsx`, `FamiliarRevealScreen.tsx`, `FamiliarOutroScreen.tsx` | B |
| 14 | Town Hall (J13) | `/game/coop` (L952) | `src/pages/spaces/CoopSpace.tsx` | B |
| 15 | Mastermind map entry (place `fire-circle`, labelled Mastermind) | `/build/mastermind` (L681) | `src/pages/Mastermind.tsx` | C |
| 16 | Co-working: Find collaborators | `/game/collaborate/matches` (L881) + `/connections`, `/mission`, `/people` | `src/pages/Matchmaking.tsx`, `Connections.tsx`, `MissionSelection.tsx`, `PeopleDirectory.tsx` | C |
| 17 | Café: Meet | `/game/meet` (L893), `/create`, `/my-rsvps` | `src/pages/spaces/EventsSpace.tsx`, `CreateEvent`, `MyRsvps` | C |
| 18 | Market and your stall | `/game/marketplace` (L865), `/my-products`, `/p/:slug` | `src/pages/spaces/MarketplaceSpace.tsx`, `src/components/game/MyStall.tsx` | C |
| 19 | Oracle Reading, $37 (Activate your top talent) | `/activate-top-talent` (L705) | `src/pages/ActivateTopTalent.tsx` | C |
| 20 | Free session (Ignite, $555 / 45-min door) | `/ignite` (L678), `/game/marketplace/ignite` (L869) | `src/pages/IgniteSession.tsx` | C |
| 21 | Product Builder (Launch your genius business) | `/game/build/product-builder/*` (L909) | `src/modules/product-builder/*` | C |
| 22 | Unique Business Builder, the other 11 steps | `/ubb`, `/ubb/myth`, `tribe`, `pain`, `lead-magnet`, `value-ladder`, `specificity-matrix`, `session`, `marketing`, `distribution`, `communications`, `landing-page`, `dossier` (L934–949) | `src/modules/unique-business-builder/*` | C |
| 23 | Equilibrium | `/build/equilibrium` (L1060) | `src/modules/equilibrium/EquilibriumV2Page.tsx` | C |
| 24 | Transition quiz (Step 0) | `/quiz` (L765), `/quiz/r/:id` | `src/modules/transition-quiz/*` | C |
| 25 | Academy path and courses | `/game/learn` (L844) and below; `/library`; `/grow/*` | `src/components/game/AcademyPath.tsx`, `src/pages/CoursePage.tsx`, `src/pages/Library.tsx` | C |
| 26 | Spectrum Reading (J3) | none: not built | only the faded room, `src/lib/houseRooms.ts:58` | not built |

Top Talent's deeper views (`/zone-of-genius/appleseed`, `/excalibur`, L995–996) and the assessment steps (`/zone-of-genius/assessment/*`) are part of module 1, not separate modules.

## 3. Scorecard

**Legend.** ✅ meets the contract · ◐ partial · ❌ missing. Columns follow the template: **Landing** = §12.2 and §12.6 (result named, one button in the player's voice, at most one small alternative line, one fitting image, nothing else) · **Final** = §12.4 (essence named again + one compact «first time in your life» line) · **Colour** = §12.5a (greyscale Landing → the same image in colour on the Final, with the artifact) · **Artifact** = §12.5b (one artifact assigned, unique to module and result) · **Share card** = §11 and §12.5b (the module's own card: coloured scene + artifact + the player's one line) · **DoD** = §3 DoD per module (headline = Master Result · button = result verb · Outro shows result + what it unlocked + one button back · rating asked · choice asked and stored · victory recorded).

| # | Module | Landing | Final | Colour | Artifact | Share card | DoD |
|---|---|---|---|---|---|---|---|
| 1 | Top Talent | ◐ | ❌ | ❌ | ❌ | ◐ | ◐ |
| 2 | Mission | ◐ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 3 | Quality of Life | ◐ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 4 | Assets | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 5 | Uniqueness phrase | ◐ | ❌ | ❌ | ❌ | ◐ | ✅ |
| 6 | Tagline | ◐ | ❌ | ❌ | ❌ | ◐ | ✅ |
| 7 | Free Mastermind session | ◐ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 8 | Mastermind Nov 9–10 | ◐ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 9 | 21 days of practice | ◐ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 10 | First price | ◐ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 11 | First sale | ◐ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 12 | Academy welcome | ◐ | ❌ | ❌ | ❌ | ❌ | ◐ (unreachable) |
| 13 | Your AI | ❌ | ❌ | ❌ | ❌ | ❌ | ◐ |
| 14 | Town Hall | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 15–26 | Group C and not built | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

All artifact cells read **«artifact: waits for Sasha's list»**. The one exception in the template is Top Talent, where §12.5a names the first artifact (the pointed Star of Uniqueness, in the House, issue #313); that is named, not built, so the cell stays ❌ until #313 lands.

### Evidence

**What every module in group A shares (one cause, so scored the same).**
- *Landing ◐.* The Intro has the button in the player's voice (`ModuleIntro.tsx:100–102`, verbs in `journeyModules.ts`) and an image (`:89–95`). It also carries an eyebrow (`:105`), a 1–2 line silhouette (`:109`), a «← Village» link (`:81`) and a state tag, which §12.2 «Nothing else» does not list. The image is the village place scene, shared by several modules (the `house` scene serves Mission, QoL and Assets; `workshop` serves two; `market` two; `academy` three), so it is not «one image that fits the module».
- *Final ❌.* `ModuleOutro.tsx` renders: eyebrow (`:97`), badge with the player's result (`:99–110`), where it lives and what opened (`:112–117`), choice (`:119–141`), rating (`:143–173`), one button back (`:175–180`). There is no «essence named again» element and no «first time in your life» line, and `JourneyModuleDef.outro` (`journeyModules.ts:104–115`) has no field to hold one.
- *Colour ❌.* The Outro has no image: only the badge «takes its colour in place» (`ModuleForm.css:188–191`, `motion-fill` at `src/index.css:6816`). The Intro scene is greyscale only when a skin sets `--scene-filter` (`theme-tokens.css:157–160` defaults to `none`; `skin-journey.css:69`, `lunar-world.css:40`), so on the default skin the Landing is already in colour. The Landing and Final therefore do not show the same image changing from grey to colour.
- *Share card ❌ or ◐.* The only share card is one per player, not per module: `buildShareCard` / `pickGift` choose a single line (uniqueness phrase → tagline → top talent; `src/lib/shareCard.ts:55–63`), rendered by `ShareCard.tsx` at the stall (`MyStall.tsx:150`) and the public page (`PublicProfile.tsx:399`). So modules 1, 5, 6 supply a line to that card (◐); no module has its own coloured-scene-plus-artifact card.
- *DoD ✅.* Rating, choice and victory are all there: `ModuleOutro.tsx:70–93` (rating via `useJourneyVictory`, choice via `useModuleChoice`; prompts for all twelve ids in `src/data/journeyChoices.ts:37–113`). Caveat: both are shown only to a signed-in player (`:91–92`); the template's DoD does not say what a guest sees (see template fix T7).

**1 Top Talent.**
- Landing ◐: the Intro headline is «Discover your top talent» (`journeyModules.ts:123`), not the §12.5 line «Your top talent, named in one clear sentence.»
- After the Intro (`ZoneOfGeniusEntry.tsx:1029`) the player meets a **second** screen, the route choice (`:1102`). It still carries the lines §12.5 removes: «Which way?» (`:1194`, `zogEntry.revealQuestion`), the three preamble lines (`:1135–1173`, `zogEntry.matchPreambleLine1–3`, `en/common.json:150–152`), «More precise than the test…» (`:1248`, `en/common.json:155`). The button («Find my top talent», `:1233`) and the quiet guided link (`:1259`) are right in shape.
- The courtyard image `public/images/modules/top-talent-courtyard.webp` exists but nothing in `src/` references it (grep for `top-talent-courtyard` finds only the template).
- Final ❌ / Colour ❌: the Outro appears only after a fresh save (`:940–946`, `justSaved`); a reload shows the Funnel v2 CTA instead.
- DoD ◐: all ritual parts exist, but the Outro is skipped on revisit, and the headline is not the §12.5 line.

**2 Mission.** Headline «Discover your mission» (`journeyModules.ts:139`) is an action, not the named result. Intro at `MissionDiscoveryLanding.tsx:420`, Outro at `:427` (after a fresh save only, `:424`). After the Intro, a second hero («Discover Your Mission», `:452`, `missionLanding.heroTitle`) repeats the headline over the prompt-and-paste flow.

**3 Quality of Life.** Intro at `QualityOfLifeMapAssessment.tsx:495` (`neverClosed`, because a coach can send the test); Outro at `QualityOfLifeMapResults.tsx:996–999`, only when `showOutro` (`:344–345`: standalone route, saved, path starts with `/quality-of-life-map/`). Artifact and card are blocked by a template contradiction, T5: the result is a private level, and §11 forbids levels and scores on the card.

**4 Assets.** After the Intro, the module opens a **choice screen**, «How would you like to map your assets?» (`AssetMappingLanding.tsx:692`, `en/common.json:484`) with two equal cards (`:696–760`). That is the «Which way?» pattern and a comparison of paths, which §12.2 bans. Hence ❌ on Landing. Outro at `:619` (on `hasSaved`).

**5 and 6 UBB slices.** The Intro / Outro are wrapped around the unchanged UBB screen by `JourneySlice.tsx:50` and `:53`, mounted from `GenericArtifactScreen.tsx:85–93`. A player who already has the artifact skips straight to the screen (`:8–9` comment), so the Landing is not guaranteed. The result on the Outro is the player's own phrase (`slicePhrase`), so these two are the closest to a share card: the line already exists, and `pickGift` already reads it.

**7–11 Quests.** One component, `QuestModule.tsx`: Intro `:157`, task `:158–167`, Outro `:170`. The rating is asked in the task step (`:106–132`), before the Outro; the Outro then shows it. Headlines of 7 and 8 name the *event* («Join the free Mastermind session (Nov 4)», «Mastermind Nov 9–10»; `journeyModules.ts:223`, `246`), not a transformational result; 9, 10, 11 do name a result. Quests record the player's word («no money moves here, and we take your word», `journeyModules.ts:326`), so a coloured artifact is a claim the game cannot check; this is for Sasha (Q3 below).

**12 Academy welcome.** `AcademyModule.tsx` is imported nowhere. `TransformationSpace.tsx:36` renders `AcademyPath`, and its header says the earlier landing «is kept in the code» (`:13–14`). The module's own comment still reads «COPY FOR SASHA'S REVIEW BEFORE MERGE» (`academyModule.ts:14`). The row is scored as if it were reachable; it is not.

**13 Your AI.** A parallel implementation of the form: its own Intro (`FamiliarIntroScreen.tsx:20–57`) and Outro (`FamiliarOutroScreen.tsx:23–63`), routed in `FamiliarPage.tsx:61–63`. Intro headline is a sentence, «Same question. Two answers. See what happens when your AI knows you.» (`:48`), not a named result. The Outro has the badge, where it lives, a way back, but **no rating, no real choice and no victory** (the rating sits on the Reveal screen, `FamiliarRevealScreen.tsx:46–65`, and is skippable, `:148`). It has two exits («Back to the village · Skills for your AI», `:57–61`), against the template's one.

**14 Town Hall.** Intro only (`CoopSpace.tsx:67–94`); the headline is the place name, «Town Hall» (`:92`), not a result; the single button is «Back to the village» (`:87`). Nothing is asked and nothing recorded. The blueprint calls it «thin» (§14.5 row 13), so it may not be a module at all; Q4.

**15–25 Group C.** None renders `ModuleIntro` / `ModuleOutro` or `PlaceState`. First headings, for orientation: Matchmaking `Matchmaking.tsx:1010`, Mastermind page `Mastermind.tsx:148` (an eyebrow, not a result), Oracle Reading `ActivateTopTalent.tsx:120`, Ignite `IgniteSession.tsx:359`, Product Builder `ProductBuilderEntry.tsx:21–30` («Launch Your Genius Business»), Equilibrium `EquilibriumV2Page.tsx:192`, Café `EventsSpace.tsx:81`, Quiz `TransitionQuizPage.tsx:681`. Per blueprint §14.5 several of these are known gaps (Mastermind page needs an Outro; Market stall «reskin»). The Mastermind map entry has a quest module (row 8) that links to it, so the sales page itself is the Landing's *destination*, not a module.

**26 Spectrum Reading.** Not built; the House shows a faded room with its line (`src/lib/houseRooms.ts:58`). Build, not migration.

## 4. Findings that cut across modules

- **F1. Two landings in a row.** Modules 1, 2, 4 each show `ModuleIntro` and then a second landing-like screen of their own (route choice; mission hero; asset choice). §12.5 calls the *path screen* the Landing, while §3 calls `ModuleIntro` the Landing. Until one is chosen, every module migration has to guess. See T2.
- **F2. Shared component first.** `ModuleIntro` has no prop for the small alternative line or a module image, and `ModuleOutro` has no field for the significance line or an image. Each module's change touches the same two components. Do that once, without changing any module's output (step 0 below).
- **F3. The Outro is skipped on revisit** in modules 1, 2 and 4 (shown only right after a fresh save: `justSaved` at `ZoneOfGeniusEntry.tsx:940` and `MissionDiscoveryLanding.tsx:424`, `hasSaved` at `AssetMappingLanding.tsx:616`). A returning player sees the old reveal. Quality of Life shows its Outro on every visit to the results route (`QualityOfLifeMapResults.tsx:344–345`), but not on the Home route or in the Learn copies (`/game/learn/qol-*`, App.tsx L851–852). Not a copy-law issue, but the Final screen cannot be reviewed on a returning account.
- **F4. Old copy still in the repo for the worked example.** The README says §12 was «first applied: Entry Portal path screen», yet at `ab6240f` the removed lines are still in the locale files and `ZoneOfGeniusEntry.tsx`. Check whether another branch or #313 carries it before starting module 1.
- **F5. i18n.** Intro copy has en / ru / es keys (`village.module.<id>.*`); Outro copy (`done`, `badge`, `livesIn`, `opened`, `fallbackResult`) and the rating / choice strings in `ModuleOutro.tsx` are English literals (`:146`, `:151`, `:135`). Every new Final line needs three languages.

## 5. Migration order

One module per issue, closest to done first. Size: **S** ≈ copy and wiring inside one module, **M** ≈ a screen is removed or rebuilt and an image is added, **L** ≈ a new surface or a build from nothing. Every issue also needs the artifact for its module; none is invented here.

| Step | Issue | Size | What it needs | Artifact |
|---|---|---|---|---|
| 0 | **Enabler: optional slots in `ModuleIntro` and `ModuleOutro`** (alternative line, module image, significance line, Outro image). Renders nothing when a module leaves a slot empty, so no module changes. | S–M | Sasha's yes (shared components); decision on T2 and T3 first; en/ru/es keys | none |
| 1 | **Top Talent** (the §12.5 worked example) | M | Merge the route-choice screen into the Landing: headline from §12.5, the guided path as the one small line, remove the five lines listed in §12.5, wire `top-talent-courtyard.webp` greyscale → colour on the reveal; Final line; show the Outro on revisit (F3). Check F4 first. | named in §12.5a (Star of Uniqueness, #313); the share card waits on T5 |
| 2 | **Uniqueness phrase** | S–M | Landing line + image; Final line; the line already exists for the card (`pickGift`). Fix the «skip the Intro if the artifact exists» path (F3-like). | artifact: waits for Sasha's list |
| 3 | **Tagline** | S–M | Same as 2; its Outro already says «Your stall stands in the Market». | artifact: waits for Sasha's list |
| 4 | **Mission** | M | Drop the second hero (F1); Landing headline as a named result; Final line; colour reveal. | artifact: waits for Sasha's list |
| 5 | **Assets** | M | Replace the two-card choice screen with one button + one small line (§12.2); Final line; image. The count («12 assets mapped») cannot go on a card (§11), see T5. | artifact: waits for Sasha's list |
| 6 | **Quality of Life** | M | Landing; Final line; Outro on the Home revisit route. Blocked on T5: the result is private and numeric. | artifact: waits for Sasha's list |
| 7 | **First price** | S | Landing already names a result; add Final line; `quest` flow stays. Blocked on Q3 (self-reported). | artifact: waits for Sasha's list |
| 8 | **First sale** | S | Same as 7. | artifact: waits for Sasha's list |
| 9 | **21 days of practice** | S | Same as 7. | artifact: waits for Sasha's list |
| 10 | **Free Mastermind session** | S | Headline names an event; needs a result headline from Sasha (do not invent). Note the date in the copy (Nov 4) will pass. | artifact: waits for Sasha's list |
| 11 | **Mastermind Nov 9–10** | S | Same as 10. | artifact: waits for Sasha's list |
| 12 | **Academy welcome** | S | First decide: reconnect it to the Academy (it is orphaned) or retire it. Then as 7. Copy still marked «for Sasha's review». | artifact: waits for Sasha's list |
| 13 | **Your AI** | M | Move onto `ModuleIntro` / `ModuleOutro` or write down why it stays separate; add rating, choice and victory (or Sasha says they do not apply); one exit on the Outro. | artifact: waits for Sasha's list |
| 14 | **Town Hall** | S | Result headline instead of the place name, an Outro with something asked; Q4 first. | artifact: waits for Sasha's list |
| 15+ | Group C and Spectrum Reading | L each | Not scheduled. Each needs Sasha's yes that it is a module, a Master Result in his words, and an artifact. Sizes: Mastermind page S (add an Outro to the existing page), Café M, Co-working M–L, Market and stall L, Oracle Reading M, Ignite M, Product Builder L, UBB other steps L, Equilibrium M, Quiz M, Spectrum Reading L (build). | artifact: waits for Sasha's list |

Why this order: step 1 is the example Sasha already wrote and decided. Steps 2–3 have a player-written line ready for the card. Steps 4–6 are the rest of the Your House and Workshop path, ordered by how many screens change. Steps 7–11 are thin (one component) but their artifacts are the hardest to justify (Q3). Steps 12–14 first need a keep / retire decision.

## 6. Coverage check

`src/App.tsx` routes **not** treated as modules, so the claim «every module covered» can be checked:

- Marketing, press and sales: `/`, `/home`, `/home2`, `/hero`, `/landing`, `/you`, `/web3`, `/founder*`, `/about/*`, `/sasha`, `/1-pager`, `/monetization`, `/sohn`, `/founder-market-fit`, `/human-market-fit`, `/fmf`, `/communities`, `/products/*`, `/grow/*` sales pages, `/academy/:slug`, `/activations*`, `/build/karime*`, `/karima`, `/proposalforwegoodovahere`, `/investor`, `/27`, `/the-originals`, `/destiny`, `/mens-circle*`.
- Platform: auth (`/auth*`), legal (`/privacy`, `/terms`, `/license`, `/data`), settings and contact, `/admin*`, `/genius-admin`, `/cockpit*` and `/build/cockpit*`, `/modules*`, `/m/:slug`, `/transcriber`, `/holomap`, `/dashboard`, `/mdls-preview`, `/preview*`.
- Hubs and public views: Village `/village/:place?`, Quest Board, Home / Character Sheet `/game/me/*`, `/character`, `/my-result`, `/my-artifacts`, `/intros`, `/profile/:userId`, `/p/:slug`, `/mp/:slug`, `/:username`, `/dossier/:slug`, `/page/*`, `/path`, `/playbook*`, `/game/journey`, `/next-move*`, `/map-classic`.
- **Tools and pages with no form, not given a row** (same status as group C: not a module until Sasha says so, and not scheduled): AI OS and its skills pages (`/ai-os*`), Commercial OS (`/built-by-you/commercial-os`), the Learn practice pages (`/game/learn/today`, `/paths`, `/library`, `/tests`, `/genius-assessment`, `/qol-assessment`, `/qol-results`), growth paths (`/skills`, `/growth-paths`, `/game/path/:pathId`), the business pages (`/game/build/canvas`, `/my-business`, `/refine`, `/my-page`, `/marketplace/create-page`, `/game/me/genius-business*`, `/game/me/canvas`), art (`/art`, `/game/me/art`), onboarding (`/start`), named-client ignition pages (`/sandra`, `/sergey`, `/oyi`), `/genius-offer-intake`, `/intelligences`, `/genius-layer-matching`, `/ai-upgrade`, `/resources/*`, `/events/*`, `/game/snapshot`.
- Redirects only: all `Navigate` routes (for example `/mission`, `/discover-mission`, `/activate*`, `/mastermind`, `/game/transformation/*`).

None of these routes, nor any §14.13 surface (Playbook, Roadmap `/path`, Dashboard, the old `/journey` landing, `/next-move`, `/next-move-v2`, `/map-classic`), is proposed for change.

## 7. Template fixes proposed

*Proposals only: `module-form.md` is not edited in this PR. Each is old wording → new wording. Where the fix is a decision about the game and not about the wording, it is marked **Sasha decides**.*

**T1. §3, Intro row contradicts §12.2 «Nothing else».** §3 says the Intro has «eyebrow + headline… one button». The code also has a silhouette, a back link and a state tag (`ModuleIntro.tsx:81`, `:105–109`).
- Old: «place scene; eyebrow + headline that state the result (= the module's Master Result); **one button whose label is the result as a verb**…»
- New: «place scene; headline that states the result (= the module's Master Result); **one button whose label is the result as a verb**; at most one small alternative line under it (§12.2). The way back to the village and the closed line (§6) are navigation, not content. The eyebrow and the 1–2 line silhouette of the v1 Intro are removed where §12 is applied.» **Sasha decides** whether the eyebrow («Home · Step 2») stays.

**T2. §3 and §12.5 name different screens as the Landing.** §3: «Intro (`ModuleIntro`…; the **Landing screen** of §12)». §12.5 table: «**Landing** (the module's path screen)». In code these are two screens (finding F1).
- New, in §12.2, first line: «The Landing screen is the first screen the player meets in the module, that is, `ModuleIntro`. A module has no second path screen after it: the other way to the same result is the one small line under the button.»

**T3. §12.5a greyscale vs §6 closed look.** §6: closed = `--lock-filter` (grayscale) + `--lock-dim`. §12.5a: the open Landing is greyscale. A player cannot tell an open Landing from a closed one.
- Add to §12.5a: «Greyscale on the Landing is the colouring-book state, not the lock state: an open Landing is greyscale at full brightness and has its button; a closed Landing keeps the lock look (`--lock-dim`) and shows its line in place of the button. The greyscale is set by the module, whatever the skin's `--scene-filter` is.»
- Add (image source, currently unwritten): «The Landing image is one file per module in `public/images/modules/`; until a module has its own, it shows no image (as §12.5 says for Top Talent), not the shared village-place scene.» **Sasha decides** the file naming; the only existing file is `top-talent-courtyard.webp`, whose name differs from the module id `find-top-talent`.

**T4. §12.4 «first time in their life» is not always true.** The fidelity test (§2) says only true things pass. For a retake, the 21-day practice, or a repeated quest, «first time» is false.
- Add to §12.4: «The line lives with the module's Outro copy (one field, en / ru / es). When it is literally not the player's first time, the line says what is true instead; the claim is never made.»
- Also add the missing home: «`JourneyModuleDef.outro` carries it.» (field name left to the implementer).

**T5. §11 and §12.5b disagree about the card's line, and §11 forbids what some modules produce.**
- §11.2 picks *one* line for the player (uniqueness phrase → tagline → Top Talent). §12.5b says each module has *its own* card with the player's one line.
- §11 «Never on the card: level, scores, counts, metrics, prices» removes the result of Quality of Life (a level), Assets (a count) and First price (a price).
- New §11.2: «One line, their words: for a module's card, the line the player wrote in that module; for the stall and the public page, the most personal sentence they wrote (uniqueness phrase → tagline → Top Talent).»
- New sentence for §12.5b: «A module whose result is private or numeric (Quality of Life, Assets, First price) shows its artifact on the card **without the number**, and its line comes from the Outro's real choice (§5).» **Sasha decides**; this is a game-design call, not a wording fix.

**T6. §6 states do not match the code.** The table lists `open`, `closed`, `new`, `live`. The code has `closed`, `open`, `next`, `done`, `live` (`PlaceState.tsx:12–18`); no `new`. The unlock-order line names «Fire Circle always», while the map label is Mastermind since 2026-10-28 (blueprint §14.13).
- New: replace the `new` row with `next` («open + the accent marker; the single next move») and `done` («open, colour arrives»), and write «Fire Circle (labelled Mastermind on the map)».

**T7. §3 DoD is silent on guests and on quests.** Code: rating and choice are shown only to a signed-in player (`ModuleOutro.tsx:91–92`); the Academy module keeps a guest's answers in the browser (`AcademyModule.tsx:17–20`); a quest asks the rating in the task step, before the Outro (`QuestModule.tsx:106–132`).
- Add to the DoD line of §3: «A guest's rating and choice are kept in this browser and move to the account at sign-in. In a real-world quest the rating is asked when the player says «I did it», before the Outro, and the Outro shows it.» (If the first sentence is not meant for every module, say which.)

**T8. §3 DoD uses «artifact» for two things.** The DoD says «Outro shows the artifact + what it unlocked»; §3's Result row says the result is «the artifact» (the player's words); §12.5b defines the artifact as an in-game object on the share card.
- New DoD wording: «Outro shows the result (the player's words) + what it unlocked + one button back…». Keep «artifact» for §12.5b only. In §3, Result row: «the artifact» → «the player's result».

**T9. §12.5b names no home for the artifact.** «Artifacts come from Sasha's existing artifact library» gives no path, and §12.5a says the artifact «appears in the player's House» without saying where that fact is stored.
- Add: «Library: <path, to be named by Sasha>.» and «An earned artifact is one fact in the save file (like the events `placeState()` reads), so the House, the stall and the share card read the same record.» **Sasha decides** the second sentence.

**T10. §4.3 is contradicted by the code, and §10 only says «Sasha to confirm».** The rating is answered with «Thank you. You gave it N of 10.» (`ModuleOutro.tsx:146`, same in `FamiliarRevealScreen.tsx:108`), not with a recognition.
- Add to §10 open edges: «Today's Outro answers the rating with a thank-you (`ModuleOutro.tsx:146`). It stays until Sasha confirms §4.3.» No code change is proposed here.

**T11. Header status and J-numbers.** Meta-description says «applied in Journey modules J1–J12»; the numbers disagree across sources. QoL is «Step 3» in the code's eyebrow (`journeyModules.ts:154`) but J4 in blueprint §14.2; Assets is «Step 4» (`:170`) but J5. The stall table of blueprint §14.12 calls First price J10 and First sale J11, while §14.2 and the code (`journeyModules.ts:290–330`, `quest.journey`) call them J11 and J12. J3 (Spectrum Reading) is not built, so «J1–J12» overstates what is in the form.
- New: «Applied in: the modules of `JOURNEY_MODULES` (`src/data/journeyModules.ts`), by module id.» Use ids in this file and in future issues, not J-numbers.

**T12. README status line.** `docs/templates/README.md` says §12 was «first applied: Entry Portal path screen». At `ab6240f` the code does not show it (finding F4). Either the line means «applied in the template» or the work is on another branch. Fix when F4 is answered.

## 8. Questions for Sasha

1. **Q1. One Landing or two?** (T2) Recommended: one. The Intro is the Landing; the path screen disappears into the small line. Override?
2. **Q2. Greyscale at full brightness for an open Landing, with the lock dim for closed?** (T3) Recommended: yes.
3. **Q3. Quests and the card.** First price, first sale, 21 days, webinar, Mastermind are the player's own word, unchecked. Should they earn an artifact and a share card, or are they victories only? Recommended: artifact yes for the two that open the Market (first price, first sale), after your list exists; the three others victory only until you say.
4. **Q4. Is Town Hall (and each of rows 15–25) a module, in the sense of the template?** Recommended: Town Hall waits until «your voice» exists; Mastermind page gets an Outro; the others wait.
5. **Q5. Academy welcome:** reconnect to `/game/learn` or retire? Its copy was never confirmed (`academyModule.ts:14`).
6. **Q6. Where is the artifact library?** Every row above waits on «artifact: waits for Sasha's list».
7. **Q7. Private and numeric results on the card** (T5): artifact without the number, or no card for those modules?
