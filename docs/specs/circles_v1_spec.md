# Circles v1 — player-hosted gatherings in the village Café

Draft 2026-11-21, v1.1 15:57 (host + co-host + hand-off added; decided by Sasha 16:41) · v1.2 2026-11-22 (Weekly circle, §9 settled) · Built in issue #384 (migration `supabase/migrations/20261122220000_circles_v1.sql`; held for Sasha's yes before it is applied).
Lands on: launch spec A11 (a real community plays as its village) + A6 (social network, live #363). Mechanic FB-2. Creation ladder step 3.
Sources: Luma walk-through 2026-11-21 (research/luma_findings.md, luma_patterns.md); GoBY §13.1, §13.2, §16.2–16.3, §21.2, §21.5; repo snapshot 4b478ad.

> This file is the spec as handed over in issue #384, copied in unchanged so the code has something to point at. What the build did differently, and what it left out, is in the pull request for #384.

## 1. What a circle is
A circle is a real gathering a player hosts: a mastermind, a practice, a dinner, or another kind. People join, meet in person (or on a call), and the host confirms who actually came. Only "came" counts anywhere in the game. Sign-ups never count.

Rules taken from canon:
- Real people only: every face links to a real player's profile (A6).
- A number appears only where it mirrors a real act: "4 came". No views, no likes, no ranking of circles or hosts.
- Words: circle, gathering, host, came, Harvest (full moon). Never raid, battle, quest-grind words.
- **Decided (Sasha 2026-11-21 16:41: «да!!!! делай»; GoBY §24.1 #10, commit 4494ccd):** every circle has a host who holds it (whoever created it), an optional co-host, and the host role passes on in one tap. Succession, decision and conflict rules are added only on demand (§8). Origin: Mafia mechanic, «crucial», the start of self-governance.
- Quality is held by a person who already walked that path (Sasha, accepted 2026-11-21): a host has come to a circle before; a co-host has come to this circle.
- Guests (not signed in) can browse the Café; hosting needs a profile (Café opens after profile, §13.3; #229 keeps Create hidden from guests).

## 2. What already exists (we extend it, no new system)
- Café = `/game/meet` (EventsSpace), create at `/game/meet/create`, detail `/events/:id`, `/game/meet/my-rsvps`.
- Tables `events` (title, description, photo_url, event_date, event_time, timezone, location, visibility, community_id, created_by) and `event_rsvps` (status going|maybe|not_going, email, wants_reminder), `communities`.
- Inbox `/game/messages` (player_messages, A6).

## 3. Ten Luma habits we copy
1. One create screen, title autofocused, everything else prefilled: a circle exists after typing only its name.
2. Settings as compact rows that show their value ("Capacity · Unlimited", "Ask to join · Off"); tap opens a small popover, never a new page.
3. Every option explains itself in one line at the moment of choosing.
4. Popovers and modals over the same screen; only real workspaces (manage, who came) get their own URL.
5. The same card shows different actions by role: guest sees their status, host sees "Manage".
6. One-tap join for a signed-in player, name prefilled. Approval swaps the button to "Ask to join".
7. Copy names the state and the next step ("This circle has ended. Mark who came.").
8. Reminders on by default, explained once, with a visible log of what was sent.
9. Repeat by reuse: "Next meeting" copies everything except guests (Luma's Clone Event).
10. Upcoming / Past as a toggle that writes the URL (`?period=past`); date rail rows for scanning; time always with its timezone.

What we change from Luma: Luma has no repeat control (only Clone) and counts registrations. We add a simple repeat and count only "came".

## 4. Screens

### S1. Café list — `/game/meet`
- Header: «Café» · subtitle "Circles hosted by villagers. Come in person." · primary button **Host a circle** (signed-in players only).
- Toggle **Upcoming | Past** (`?period=past`).
- Rows grouped by date rail ("Nov 24 · Tuesday"): time with timezone, title, kind chip (Mastermind / Practice / Dinner / Gathering), host face + name, place, faces of people going.
- Right side of each row, by role: your status pill (**Going**, **Asked**, **Came**) or, for the host, "3 going · **Manage**".
- Full moon dates carry a small moon mark (A9 Equilibrium clock), so a Harvest circle is visible as one.
- Empty state: "No circles yet this week. Host the first one: a dinner, a practice, a mastermind." + Host a circle.
- Tap a row → S3 (page, back returns to the same scroll and toggle).

### S2. Host a circle — `/game/meet/new`
One screen. Left: cover preview (auto from kind and the player's skin; "Change photo" optional). Right, top to bottom:
1. **Circle name** — large borderless field, autofocus, placeholder "Name your circle".
2. **Kind** — chips: Mastermind · Practice · Dinner · Gathering. Picking a kind sets sensible defaults (below); the host can change any of them.
3. **When** — one card: start date (today), start time (next full hour), end (+90 min), timezone detected ("GMT-07:00 Mazatlan"). Popover calendar, past days disabled, full moon and new moon marked.
4. **Repeats** — row "Repeats · Never". Popover: Never · Every week · Every 2 weeks · Every month · Every new moon · Every full moon. Sub-copy: "We'll put the next 4 meetings in the Café. Each one has its own guest list."
5. **Where** — row "Add a place". Popover: places of your village (San Pancho list, recent first), any address, or "Online" with a link field. Sub-copy: "A real place, or a call link."
6. **About** — row "Add a few words". Modal with one text field, placeholder "Who is it for? What will you do together?", button Done.
7. **Options** (compact rows):
   - **Ask to join · Off** — "You approve each person before they're in."
   - **Capacity · Unlimited** — popover with a number; "Joining closes when the circle is full."
   - **Co-host · None** — pick one villager. "Holds the circle with you and can take it over."
   - **Who can see · Village** — Village ("Shown in the Café") / Link only ("Only people with the link can join").
8. Primary button **Host circle**.

Defaults by kind: Mastermind → capacity 8, Ask to join on, repeats every week. Practice → open, unlimited. Dinner → capacity 10, Ask to join on. Gathering → open.
After Host circle: land on S3 as host with a one-line toast "Your circle is in the Café." and the action **Copy link**.

### S3. Circle page — `/game/meet/:id`
- Cover, title, kind chip, date badge (NOV / 24), "Tuesday, November 24", "7:00 PM – 8:30 PM GMT-7", place (map link) or "Online · link after you join".
- **Hosted by** face + name → profile, with **Write** (A6). Co-host shown beside the host as "with {name}".
- **Going**: faces of people going (each → profile). After the circle: **Came** faces instead, nothing else.
- Join card, by state:
  - Open: "Join, {name}?" + **Join** (one tap).
  - Ask to join: "The host says yes to each person." + **Ask to join** → small modal "A line for the host (optional)" + Ask to join.
  - Full: "This circle is full." + **Write to the host**.
  - Joined: "You're in." + **Add to calendar** (.ics) + "Can't make it" (link).
  - Asked: "Waiting for the host's yes." + "Withdraw".
- Repeating circle: line "Meets every week · next: Dec 1" → series list.
- Host sees a banner: "You host this circle." + **Manage**.
- After it ends, for people the host marked Came: "One line about this circle?" (see S6). Lines show under Came.

### S4. Manage — `/game/meet/:id/manage`
One page, sections (no tabs):
- **Recap**: date, place, kind; **Edit** (opens S2 prefilled as a modal-free page, button "Save").
- **Guests**: chips Going · Asked · Came. Asked rows have inline **Yes** / **Not this time**; a change notifies the person in their inbox (checkbox "Tell them", on by default).
- **Hosts**: host and co-host. **Add co-host** (search villagers who came to this circle, or anyone for a first meeting). **Hand off** — "Pass the circle to {co-host or anyone who came}. You become a guest." One tap + confirm; the new host gets an inbox note and must tap **Take the circle**; until then nothing changes. Co-host can do everything the host can except hand off and cancel.
- **Write to everyone going** — one message to each going player's inbox (player_messages).
- **Mark who came** → S5 (active from start time until 7 days after).
- **Next meeting** — "Copy this circle to a new date. Guests aren't copied." For a series, shows the upcoming meetings.
- **Copy link**.
- **Cancel circle** — "Everyone going gets a note in their inbox." Confirm.
- Ended state headline: "This circle has ended. Mark who came."

### S5. Who came — `/game/meet/:id/came`
- Headline: "Who was really there?" Sub-copy: "Only people who came count. This is what the village sees."
- List of everyone who was going: tap a face to mark **Came** (tap again to undo). Host is marked by default.
- **Add someone who came** — search villagers by name (for people who came without joining).
- Primary **Confirm**. Editable for 7 days after the circle; then fixed.
- After Confirm: each person marked Came gets one inbox note: "{Host} confirmed you came to {circle}. Leave one line?" → S6.

### S6. One line
- On the circle page, for people marked Came only: a single text field (up to 200 characters), placeholder "What did you take from it?", button **Leave line**. One line per person per meeting; editable, deletable.
- Lines appear under Came with the author's face and name. No likes, no replies, no counts, no feed. To answer a line: Write (A6).

### S7. Weekly circle (v1.2, settled 2026-11-22 14:42 under Sasha's «делай что дальше» + his 14:10 rule «делай как рекомендуешь на основании наших решений»; it applies GoBY §24.1 #25, accepted 2026-11-22, commit 4691137)

A circle template, the core bundle: Circle (#10) × Rhythm (#7) × Save Point speech rule × peer confirmation (#15, #16). The four parts work only together, so the template turns all four on at once.

**In S2, kind chip "Weekly circle"** sets: 5–12 people (host sees "Best with 5 to 12"; not enforced), Ask to join on, repeats every Sunday, reminders on.
Helper line under the chip: "A small circle that meets every Sunday. On Monday each of you sets one step. On Sunday each of you says how it went."

**Monday, inbox note to each member:**
"New week in {circle}. What is your one step?"
Fields: "My step" (one line) · "Done when…" (one line, written now, before the week) · "Who will confirm it?" (pick one person already on that step; default: someone in the circle who has walked it).
Button: **Set my step**.

**Sunday, the Save Point. Host script on the circle page (host and co-host see it; guests see the three questions):**
"Welcome to the Save Point.
One rule: speak only from your own experience. No advice, no blame.
Each of us answers three questions:
1. What did I intend?
2. What happened?
3. What do I take with me?
Others listen. Then the next person."

**After the circle:** host marks who came (S5). The one line in S6 becomes "What I take with me" (≤200 chars, seen as §9 Q2 decides).

**Confirming the step:** the person picked on Monday gets: "{Name} says their step is done. Done when: {done when}. Do you confirm?" Buttons **I confirm** · **Not yet**, with one line in words. Confirmed → a stamp (#14). Never scored, never ranked.

## 5. Reminders
- On by default for everyone going: an inbox note 1 day before and 1 hour before ("{Circle} is tomorrow at 7:00 PM, {place}"). Email as well when the player turned on reminders (event_rsvps.wants_reminder already exists).
- The host sees the log on S4: "Reminder · To: Going · Sent Nov 23".
- To the host, once the circle ends: "Mark who came" (inbox).

## 6. What "came" opens (ladder and House)
- Step 3 of the creation ladder opens when a player has hosted a circle where at least one other person was marked Came. No timers, levels or payment.
- Badge "First circle" (A12) at that moment, with a short celebration (DL-3).
- Who can host: anyone with a profile who has come to at least one circle (marked Came). Proposal, not decided: the first circles in a village are hosted by its founders, so newcomers can come first and host next.
- Your House, owner only: "People who came to your circles: 12" and "Circles you came to: 5", shown only when non-zero (A5 rule).
- On a public profile: the circles a person hosts (upcoming) and the faces of people who came, never numbers.
- Quality: a circle with nobody marked Came across 3 meetings stops repeating and asks the host "Keep it going?". Nobody else judges circles in v1.

## 7. Data (needs Sasha's yes before any migration)
- `events`: + `kind` (mastermind|practice|dinner|gathering), `end_time`, `capacity` (null = unlimited), `requires_approval` (bool), `online_url`, `series_id` (uuid), `repeat_rule` (never|weekly|biweekly|monthly|new_moon|full_moon), `cancelled_at`. Keep `visibility` (village|link).
- `event_rsvps.status`: + `asked`, `declined`; + `came` (bool), `came_marked_at`.
- `events`: + `host_id` (starts as `created_by`, changes on hand-off), `cohost_id` (nullable). Hand-off: new table `circle_handoffs` (event_id or series_id, from_user, to_user, created_at, accepted_at); on accept, host moves for this meeting and all future meetings of the series.
- New `circle_lines` (event_id, user_id, body ≤ 200, created_at), unique (event_id, user_id); insert allowed only when that user's rsvp has came = true.
- RLS: host or co-host updates `came` and approves; only the host hands off or cancels; a player edits only their own rsvp and line.

## 8. Not in v1 (build when asked)
Tickets and paid circles · waitlist · QR check-in · registration questions · themes · insights and referral links · following a host or village calendar and iCal feeds · embed · feedback emails · editing "this and following" meetings of a series · Harvest as a special village-wide format · fuller succession (rotating host each meeting, the circle choosing its next host, what happens when a host goes quiet) — designed from Sasha's three templates: forming a group from zero, integral leadership, integrating a founders group into one product.

## 9. Settled 2026-11-22 (by our decisions, Sasha's 14:10 rule)
1. Mastermind and Weekly circles also show at the Fire Circle: the same circles filtered by kind (canon §13.1), no second system.
2. Host gate kept: a host has come to at least one circle (GoBY §24.1 #15: quality is held by someone who walked the path). Exception so a village can start: its founders/ambassador may host the first circles (§21.5: gatherings led by the village ambassador). Whoever creates the circle is its host (#10).
3. Lines are seen by everyone who can see the circle: they are the proof a circle is alive.
4. Still open, needed only for succession beyond v1: Sasha's three templates (group from zero, integral leadership, founders group into one product).

## 10. Reference, not a decision: Symviosis (main chat 2026-11-22; knowledgegraph card 0678d41)
Four layers clusters → circles → threads → posts; a circle holds objectives, goals, roles, wallets, tasks, decision-making, courses, events, with features switched on per circle; AI joins every circle call and builds shared memory members can ask; circles visible across networks with fine-grained control; profile depth set by community trust. Our v1 already matches "features per circle" in spirit (kind sets defaults). Build-own vs plug-in Symviosis is a later fork and it is Sasha's.
