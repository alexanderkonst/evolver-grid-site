# Collective: full build spec and delegation plan v0.1

Status: draft v0.1, 2026-11-25 (Hark), for Sasha's review. Asked by Sasha: «сделай полную спецификацию по построению ВСЕГО ЧТО НУЖНО ПОСТРОИТЬ с прицелом на делегирование агентам»; «онбоардинг для модулей - думаю тоже часть».
Sources: [collective_architecture_v0.1.md](../../02-strategy/collective/collective_architecture_v0.1.md) (v0.4, 16 parts) · [collective_in_game_v0.1.md](../../02-strategy/collective/collective_in_game_v0.1.md) (v0.5, space and rooms) · [collective_terms_roadmap.md](../../02-strategy/collective/collective_terms_roadmap.md). Template: [spec-handoff](../../templates/spec-handoff.md). Delegation mechanics: same as [navigation-instrument/sow.md](../navigation-instrument/sow.md) §«Delegation mechanics».

## TLDR

Collective is its own space in the game (/game/collective). It opens to members only; Sasha makes a person a member by hand or by an invite link for peers. Inside: rooms, one per part of the architecture that has a use case. Each room has its own short onboarding. Outside, every player sees one shelf of members' landings in the Market.
Work is split into **Wave 0 (Sasha's content, no code)** and **13 work packages (WP)** in three waves. Each WP = one @claude issue = one branch = one PR; Hark opens the PR, reviews against the DoD and merges on green.

## Hard lines (every WP)

- No change to the title screen, intro, the Top Talent / Mission / Assets reveals, how a player enters the game, the themes, the Workshop (/ubb), Sasha's method, sessions or /playbook. The one exception is WP2's invite path, which needs Sasha's yes to that exact change.
- Town Hall is not part of this build.
- The fund (architecture part 15) is not shown anywhere until it exists.
- en / es / ru strings for every new text; 390 px clean; reduced motion honoured; no new dependency; no 3D library.
- New tables have RLS. A migration or edge-function deploy goes through Lovable and costs credits: Hark batches them and asks Sasha first.
- Public repo: no client or member names in code, fixtures or docs. Test data uses «member 1», «member 2».

## Map: architecture part → what gets built

| # | Part | Built as | WP | Wave |
|---|---|---|---|---|
| 0 | Door | Nothing new (game as is) | — | — |
| 1 | Founder Cockpit | «My business» room links to the live cockpit | WP7 | 2 |
| 2 | AI harness | «AI» room: next rung; rungs 4–5 if Sasha says members-only | WP13 | 3 |
| 3 | Matchmaking | Inside «Collaborations»: matches among members first | WP6 | 2 |
| 4 | Scaling experts | «Experts» room | WP11 | 3 |
| 5 | Mini-hackathons | «Hackathons» room + date on the clock + shipped things in the deeds feed | WP12 | 3 |
| 6 | Rhythm | Collective dates on the moon ring (inside WP12) | WP12 | 3 |
| 7 | Terms | «Terms» room: one line of terms, own rev-share record | WP8 | 2 |
| 8 | Landing | Public page: separate track (landing v2 draft), not in this spec | — | — |
| 9 | Shared infrastructure | The game itself | — | — |
| 10 | Media synergy | Not built (not described yet) | — | later |
| 11 | Shared improvement budget | Inside «Terms»: what the budget improves this moon (text from Sasha) | WP8 | 2 |
| 12 | Internal collaborations (key) | «Collaborations» room | WP6 | 2 |
| 13 | Mutual promotion | «Members» room + Market shelf for all players | WP5, WP9 | 2 |
| 14 | Train-the-trainer | Not built (Sasha's method; Sasha sets the form) | — | later |
| 15 | Fund | Not built, not shown | — | later |
| — | Module onboarding | Welcome into Collective + first-visit intro per room | WP10 | 2 |

## Wave 0: content only Sasha can give (no code)

Each item unblocks a WP. Hark asks for them in one message, not one by one.

| ID | What | Unblocks |
|---|---|---|
| S1 | Yes to the invite path: an invited peer lands straight in Collective, skipping the reveals | WP2 |
| S2 | Yes to the map place (Earth quarter) and art for it (or a placeholder) | WP3 |
| S3 | The one line of terms as members will read it | WP8 |
| S4 | Shared budget: source and what it improves this moon | WP8 |
| S5 | Expert roster: name, what each scales, booking link | WP11 |
| S6 | First hackathon: date and theme | WP12 |
| S7 | Rungs 4–5: members-only or open | WP13 |
| S8 | First members (kept in the private ledger, never in this repo) | go-live |

## Data model (all new, Supabase, RLS on)

| Table | Columns | Who reads / writes |
|---|---|---|
| `user_roles` (exists) | add role value `collective_member` | Read: the user and admins. Write: admins only (Sasha), via `has_role()` |
| `collective_members` | user_id (pk), joined_at, invited_by, landing_url, uniqueness_line, status (active/paused) | Read: members and, for landing_url + uniqueness_line + name only, any signed-in player (Market shelf). Write: the member (own landing_url, uniqueness_line), admins (status) |
| `collective_invites` | code (pk), created_by, created_at, expires_at, used_by, used_at, note | Admins only; redeem through a security-definer function |
| `collective_collabs` | id, author_id, kind (joint-offer / shared-client / co-product / referral), title, offer, need, status (open/closed), created_at | Members read all; author writes own |
| `collective_collab_joins` | collab_id, user_id, note, created_at | Members read; a member writes own |
| `collective_revshare_entries` | id, user_id, month, revenue, share (10% computed), note, created_at | The member reads and writes own; admins read all |
| `collective_experts` | id, name, scales, booking_url, sort | Members read; admins write (Wave 3) |
| `collective_events` | id, kind (hackathon), title, theme, starts_at, ends_at, join_url | Members read; admins write (Wave 3) |
| `collective_event_joins`, `collective_shipped` | event_id, user_id, (shipped: title, url) | Members read; own write (Wave 3) |

Terms line, budget text, AI rung visibility: a config file `src/data/collective.ts` (Sasha edits text there through Hark), no table.

## Wave 1: membership (foundation)

**WP1 · Membership and admin toggle.**
- Migration: role value, `collective_members`, RLS, helper `is_collective_member(uid)`.
- Hook `useCollectiveMember()` → `{ isMember, member }`.
- Admin screen (existing admin area, admin email only): find a player, make member / pause. Sets role + row.
- DoD: 1 · RLS test: non-member cannot read members-only columns; 2 · admin toggle creates role and row; 3 · hook unit tests; 4 · non-admin cannot reach the toggle.

**WP2 · Invite link for peers.** (needs S1)
- Admin creates a link (/join/collective/:code), single use, expires in 30 days.
- Visitor: sign up or sign in → `redeem_collective_invite(code)` → member → lands on /game/collective with the welcome (WP10).
- The guard that sends new players into the reveals lets a member through to /game/collective only. Players without a member role see no change.
- DoD: 1 · used or expired code shows a plain message; 2 · redeem is atomic (two tabs, one wins); 3 · Playwright: invited new account lands in Collective; 4 · Playwright: an uninvited new account still enters the game exactly as before.

## Wave 2: the space and its first rooms

**WP3 · Place on the village map.** (needs S2; `villagePlaces.ts` is shared with the navigation instrument: one writer per wave, append-only)
- New place `collective`, element earth, route /game/collective, `opens: "collective-member"`.
- Closed sign for everyone else: «Opens by invitation, when your unique business works.» (en/es/ru).
- DoD: 1 · non-member sees it closed with the sign; 2 · member sees it open; 3 · no overlap at 390 px; 4 · other places unchanged (snapshot).

**WP4 · The Collective space shell.**
- Route /game/collective (RequireAuth + member guard). Non-member: a calm page with what Collective is and «by invitation».
- One screen, a section per room, in this order: Members, Collaborations, My business, Terms; rooms from Wave 3 appear only when their content exists (config flag).
- DoD: 1 · guard tests; 2 · empty states for every room; 3 · 390 px, reduced motion, axe clean.

**WP5 · Members room (mutual promotion).**
- List of active members: name, uniqueness line, landing link. A member edits own landing_url and uniqueness_line.
- «Share» on a member: copies a short text + the landing link.
- DoD: 1 · own edit only; 2 · invalid URL rejected; 3 · share text in three languages.

**WP6 · Collaborations room (key).**
- Post: kind, title, what I offer, what I need. Join: a note; the author gets it through the existing messages (`player_messages`).
- «Matches» strip on top: members ranked by the existing matchmaking engine, members first.
- Close own post.
- DoD: 1 · post, join, close flow in Playwright; 2 · join creates one message to the author; 3 · only members see posts; 4 · matches list never shows non-members inside this room.

**WP7 · My business room.**
- One card: «Open your cockpit» → /build/cockpit, with the count of the member's offers if the cockpit already exposes it. No change to the cockpit.
- DoD: 1 · link correct; 2 · works with zero offers.

**WP8 · Terms room.** (needs S3, S4)
- The one line of terms from `src/data/collective.ts`.
- Own rev-share record: month + revenue → 10% shown; a list of own entries. Self-reported; no payment flow.
- «Shared budget this moon»: text from config; hidden while empty.
- DoD: 1 · 10% computed and rounded the same in all three locales; 2 · only own entries visible; 3 · budget block hidden when config is empty.

**WP9 · Market shelf for all players.**
- In /game/marketplace: a shelf «Founders of the Collective»: active members with landing_url set. Visible to any signed-in player. No other Market change.
- DoD: 1 · non-member player sees the shelf; 2 · paused members hidden; 3 · shelf hidden when empty.

**WP10 · Onboarding for Collective and its rooms.**
- Welcome on first entry (three steps, skippable): «You're in the Collective» (one line what it is) → set your landing and uniqueness line (WP5 form) → one first action: post or join a collaboration.
- Every room, on first visit: one line what the room is for + one first action button. Seen state stored in the player's save; never shown twice.
- Pattern reuses the existing progressive onboarding approach ([progressive_onboarding_spec.md](../progressive-onboarding/progressive_onboarding_spec.md)); no new framework.
- DoD: 1 · welcome shows once; 2 · each room intro shows once and is skippable; 3 · never shown to non-members; 4 · reduced-motion variant.

## Wave 3: rooms that wait on Sasha's content

**WP11 · Experts room.** (needs S5) Table `collective_experts`; cards: name, what they scale, «Book» → booking_url. DoD: list from table; hidden while empty.

**WP12 · Hackathons room + rhythm.** (needs S6) Table `collective_events`; next hackathon: date, theme, «Join»; the date appears on the moon ring of the four-ring clock for members; after the event, a member adds what they shipped (title + link) and it appears in the deeds feed (A16). DoD: join flow; date on the clock only for members; shipped item in the feed.

**WP13 · AI room.** (needs S7) Shows the member's next rung of the AI ladder (rungs 1–2 live: /mini-trainings/ai-as-a-mirror, /mini-trainings/ai-that-knows-you). If Sasha says members-only, rungs 4–5 are listed here when built. DoD: correct next rung from the player's progress.

## Not built in this spec

Media synergy (10), train-the-trainer (14), fund (15), the public landing (8, separate track), automatic membership by a sign in the game (next phase; Sasha grants by hand now).

## Order and parallelism

```
Wave 0  Sasha: S1–S8 (one message)
Wave 1  WP1 → WP2                         (WP2 after S1)
Wave 2  WP3 · WP4 → WP5 · WP6 · WP7 · WP8 · WP9 · WP10   (after WP1; WP3 after nav-instrument waves touching villagePlaces.ts)
Wave 3  WP11 · WP12 · WP13                (each after its S-item)
Go-live Lovable: migrations deploy (credits, Sasha's yes) → publish (free) → Sasha grants first members (S8)
```

File lock per wave: WP3 owns `villagePlaces.ts`; WP4 owns `src/pages/collective/CollectiveSpace.tsx` and the room order; WP5–WP10 each own their room component under `src/components/collective/`; `src/data/collective.ts` and locale files are append-only.

## Agents and review

- Builder: Claude through @claude issues in evolver-grid-site, one issue per WP, body = the WP text above + hard lines + DoD.
- Hark: opens issues per wave, opens PRs, reviews (spec-handoff §7 + hard lines), merges on green with every DoD row evidenced, drives to the end with a driver task, reports to Sasha in meaning after each wave.
- Sasha: Wave 0 content and the three gates: invite path (S1), migrations deploy (credits), publish of Collective to members.

---
*v0.1 · 2026-11-25 · first full spec.*
