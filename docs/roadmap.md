# Roadmap — Evolver Platform

> Single source of truth for platform development direction.
> 
> *Last updated: 2026-01-28*

---

## 📋 All Items at a Glance

| # | Item | Category | Priority | Target |
|---|------|----------|----------|--------|
| **UX POLISH** |
| 1 | Tour completion | UX | 🔴 HIGH | Today |
| 2 | Deep UX/UI pass (blocks, templates, brandbook) | UX | 🔴 HIGH | This week |
| 3 | Images instead of icons | UX | 🔴 HIGH | This week |
| 4 | Premium visual research | UX | 🟡 MED | Backlog |
| 5 | ZoG explainer + activation recording | UX | 🔴 HIGH | Today |
| 6 | Upgrades in Profile (categories) | UX | 🔴 HIGH | Today |
| 7 | Library: practices, combos, sequences | UX | 🟡 MED | This week |
| 8 | Fast design workflow | UX | 🔴 HIGH | This week |
| **DATA MODEL** |
| 9 | User results to DB (missions, resources) | Data | 🔴 HIGH | Today |
| 10 | Matchmaking types (resources, ZoG, missions) | Data | 🔴 HIGH | This week |
| **GENIUS BUSINESS** |
| 11 | Genius Business sequence spec | Product | 🔴 HIGH | Today |
| 12 | Genius Business iteration flow | Product | 🔴 HIGH | February |
| 13 | Smart packaging recommendations | Product | 🔴 HIGH | February |
| 14 | How to enter the co-op | Product | 🟡 MED | Backlog |
| 15 | Why venture studios use this | Product | 🟡 MED | Backlog |
| **PLATFORM STRATEGY** |
| 16 | Solo user landing page | Marketing | 🔴 HIGH | Today |
| 17 | Module landings (every module) | Marketing | 🔴 HIGH | This week |
| 18 | Community leader value prop | Strategy | 🟡 MED | February |
| 19 | Holonic landings for similar projects | Strategy | 🟡 MED | Backlog |
| 20 | Monetization streams (5 mechanisms) | Strategy | 🔴 HIGH | Spec done |
| **VERSIONING** |
| 21 | Module versioning | Infra | 🔴 HIGH | This week |
| 22 | User artifact versioning | Infra | 🔴 HIGH | This week |
| 23 | Holonic page navigation | Infra | 🟡 MED | This week |
| **GROWTH** |
| 24 | Invite system (modules) | Growth | 🟡 MED | February |
| 25 | Doubling invites / waitlist | Growth | 🟡 MED | February |
| 26 | Autonomous agent invites | Growth | 🔴 HIGH | March |
| **ECONOMICS** |
| 27 | Token economics (XP, reputation) | Econ | 🟡 MED | MVP has XP |
| 28 | Daily use case (Learn/Meet/Build) | Econ | ✅ DONE | — |
| **PARKED** |
| 29 | Events module (Luma-like) | Feature | 🟢 LOW | Parked |
| 30 | Admin panel & dashboard | Feature | 🟢 LOW | Future |
| 31 | Loom video for onboarding | UX | 🟢 LOW | Deferred |

---

## Current Status

| Metric | Value |
|--------|-------|
| **Current phase** | MVP Polish → Beta Ready |
| **Focus** | Tour + Genius Business + Match-making |
| **Next milestone** | 20 beta testers by Thursday |

---

## 🎯 Today's Sprint (January 28, 2026)

### Priority 1: UX Polish
- [ ] **Tour completion** — 5-space walkthrough with tooltips
- [ ] **ZoG explainer** — add activation recording + verb definitions
- [ ] **Upgrades in Profile** — categories with dropdowns

### Priority 2: Data Model
- [ ] **User results to DB** — missions, resources (rename from assets)
- [ ] **Matchmaking types spec** — resources, ZoG, missions

### Priority 3: Genius Business
- [ ] **Sequence spec** — ZoG → Seed → Product → Published

### Nice to Have Today
- [ ] **Solo user landing page** — one page for organic acquisition

### My Next Move Follow-ups (from Jan 28 session)
- [ ] **Add DB fields for hasResources/hasMission** — currently hardcoded as false in myNextMoveLogic.ts
- [ ] **BUILD badge/glow on unlock** — visual indicator on BUILD space when ZoG complete (nudge user to explore)
- [ ] **Library practices** — combos, sequences, rename "practice"

---

# ORIGINAL ROADMAP ITEMS (Preserved)

---

## 📦 PRODUCT / MODULES

### Module Landings (Priority: HIGH | Target: This Week)
**Idea #1:** Landing pages for every module!

Every module in the system gets its own landing page that explains:
- What the module does
- Transformational result
- How to use it
- How to co-create it

**Status:** Queued

---

### Module Versioning (Priority: HIGH | Target: This Week)
**Idea #3:** Version the whole thing! Every module, every piece of documentation.

Create an underlying versioning scheme:
- Module versions (v1.0, v1.1, v2.0)
- Documentation versions
- Changelog per module

**Status:** Will be added when creating module landings

---

### User Artifact Versioning (Priority: HIGH | Target: This Week)  
**Idea #4:** Version each person's artifacts.

Track evolution of user-generated content:
- Zone of Genius v1.0, v1.1...
- Genius Business v1.0, v1.1...
- Landing Page v1.0, v1.1...
- Distribution Strategy v1.0...
- Mission v1.0...
- Assets v1.0...

Creates feeling of progress and evolution. "Your Zone of Genius has evolved 3 times!"

**Status:** Part of module versioning scope

---

### Holonic Page Navigation (Priority: MEDIUM | Target: This Week)
**Idea #8:** How to show and navigate the holonic pages?

Visual representation of nested module structure:
- Zoomable hierarchy
- Breadcrumb navigation
- Module relationships

**Status:** 🔄 Design exploration needed

---

### Genius Business Iteration Flow (Priority: HIGH | Target: February)
**Idea #9:** After first Genius Business iteration, prompt for improvement.

When user sees their first Genius Business version:
1. Ask: "Want to improve any aspects? Create next iteration?"
2. Show dropdown/buttons: ICP, Transformational Promise, Methodology, etc.
3. On selection → show quality prompts (e.g., for ICP: "Describe yourself, what subcultures, who do you really speak same language with?")
4. AI generates improved version

**Key insight:** User refines iteratively, each cycle improves their business.

**Status:** February scope - after core flow works

---

### Smart Packaging Recommendations (Priority: HIGH | Target: February)
**Idea #10:** Recommend 2-3 packaging formats based on Genius Business type.

Different business types need different formats:
- From books to SaaS products
- Methodologies, playlists, 1-on-1 sessions, substacks, etc.

The system will:
1. Analyze user's Genius Business
2. Recommend 2-3 best-fit formats
3. Explain WHY each format matches their business
4. Start simple, grow complexity

**Status:** February scope - after Genius Business flow works

---

### Community Leader Dashboard (Priority: MEDIUM | Target: February)
**Idea #11:** Admin view for community leaders.

Leaders can see in one place:
- All community resources
- Member stats
- Event management
- Aggregate patterns
- Branding controls

**Status:** February scope - after core platform stable

---

## 📣 MARKETING & GROWTH

### Invite System (Priority: MEDIUM | Target: February)
**Idea #2:** Invite people to every module — to use, to co-create, to meet others working on this.

Every module can be:
- Used individually
- Co-created (contribute improvements)
- Social space (meet other users of this module)

**Status:** February scope

---

### Doubling Invites / Waitlist (Priority: MEDIUM | Target: February)
**Idea #5:** Invite users in doubling batches.

Growth strategy:
1. First 2 invites
2. First 5 invites
3. First 10 invites
4. First 100 invites
5. First 500 invites
6. Waitlist for the rest

Build a tool for this. Karime as second user.

**Status:** February - Growth hacking scope

---

### Autonomous Agent Invites (Priority: HIGH | Target: March)
**Idea #6:** Platform invites as a living organism.

The platform will reach out using agents:
- First invites are manual (Alexander)
- Then OS does the invites autonomously
- AI agents identify and reach potential users

**Status:** March - Autonomous growth scope

---

## 🎨 DESIGN / UX

### Fast Design Workflow (Priority: HIGH | Target: Today/Tomorrow)
**Idea #7:** How to make & develop design for the OS fast?

Initial ideas:
- Screenshots → send to AI → get improvements
- Standardize patterns
- Taxonomize page types
- Harmonize (layout, sizes)
- Minimalism as principle
- Types of pages catalog

**Status:** 🎯 Active

---

## 📖 PLAYBOOK IMPROVEMENTS

### Architecture Playbook Enhancement (Priority: LOW | Target: Future)
**What:** Add real code examples from Evolver codebase + Decision Trees + Anti-patterns

**Impact:** Playbook goes from 8/10 → 10/10

**Status:** Parked - optimize after MVP

---

### Distribution Playbook Enhancement (Priority: LOW | Target: Future)
**What:** Deeper integration with Marketing Playbook (Business Model → Channels)

**Current state:** MVP level, functional but thin

**Status:** Parked - will strengthen organically through use

---

# NEW ITEMS (Added Jan 28, 2026)

---

## 🎨 CLUSTER 1: UX POLISH

### 1.1 Deep UX/UI Pass (Priority: HIGH)
**What:** Design system completeness — blocks, templates, brandbook representation
**Why:** Consistency = premium feel. Any dev can build on-brand screens fast.
**Status:** 🎯 Active

---

### 1.2 Images Instead of Icons (Priority: HIGH)
**What:** Beautiful images instead of functional icons
**Why:** First impression = "wow". Users feel premium, not prototype.
**Status:** 🎯 Active

---

### 1.3 Premium Visual Research (Priority: MEDIUM)
**What:** Research/brainstorm other premium aesthetics
**Why:** Differentiation from generic SaaS. Justifies premium positioning.
**Status:** Backlog

---

### 1.4 Tour Completion (Priority: HIGH | TODAY)
**What:** Full 5-space onboarding walkthrough with tooltips
**Why:** Reduces confusion, increases activation
**Status:** 🎯 Today

---

### 1.5 Loom Video for Onboarding? (Priority: LOW)
**What:** Educational video vs. intuitive UX
**Why:** Maybe not needed IF Tour + drip unlock + My Next Move work well
**Decision:** Skip for MVP. Optional "founder welcome" video later.
**Status:** Deferred

---

### 1.6 Library: Practices, Combos, Sequences (Priority: MEDIUM)
**What:** Content organization + transformation paths. Rename "practice" to "Ritual" or "Micro-Upgrade"
**Why:** Better transformation outcomes
**Status:** 🎯 Active

---

### 1.7 ZoG Explainer + Activation Recording (Priority: HIGH)
**What:** Educational content for deeper ZoG engagement. Explain action verbs.
**Why:** ZoG becomes actionable, not just a label
**Status:** 🎯 Active

---

### 1.8 Upgrades in Profile with Categories (Priority: HIGH | TODAY)
**What:** UI organization — categories first with dropdowns
**Why:** User clarity on progress, better navigation
**Status:** 🎯 Today

---

## 📊 CLUSTER 2: DATA MODEL

### 2.1 User Results to DB (Priority: HIGH | TODAY)
**What:** Store missions, resources (rename from "assets") in database
**Why:** Enables matchmaking, recommendations, profiles. Platform becomes useful long-term.
**Status:** 🎯 Today

---

### 2.2 Matchmaking Types (Priority: HIGH)
**What:** Multi-dimensional matching:
- By resources (complementary)
- By ZoG (complementary genius)
- By mission (similar purpose)

**Intro Mechanic:** Message → "There's someone with X match. Want intro? If they agree, I'll connect you."
**Mission Groups:** Email list or Discord channel per mission initially. Chat when 3+ match.

**Why:** Core value prop "find your tribe". Network effects kick in.
**Status:** 🎯 Active

---

## 💼 CLUSTER 3: GENIUS BUSINESS

### 3.1 Genius Business Sequence (Priority: HIGH | TODAY)
**What:** Clear progression:
1. Zone of Genius → 
2. Genius Business Seed → 
3. Genius Product Creation → 
4. Published Product → 
5. (Later) Vibe-Coded Product

**Why:** Monetization path for users. Users make money = retention + proof of value.
**Status:** 🎯 Today

---

### 3.2 How to Enter the Co-op (Priority: MEDIUM)
**What:** Venture studio entry funnel — high-touch premium offering
**Why:** Revenue + deep collaboration
**Status:** Backlog

---

### 3.3 Why Venture Studios Use This (Priority: MEDIUM)
**What:** B2B positioning and value prop for studios
**Why:** Enterprise channel + legitimacy
**Status:** Backlog

---

## 🏢 CLUSTER 4: PLATFORM STRATEGY

### 4.1 Solo User Landing Page (Priority: HIGH | TODAY)
**What:** Marketing entry point for individual users
**Why:** Organic acquisition begins
**Status:** 🎯 Today

---

### 4.2 Community Leader Value Prop (Priority: MEDIUM)
**What:** What's in it for community leaders?
- Impact dashboard
- Resource pool across communities
- Connections to other leaders
- One platform for all needs

**Note:** Messenger stays separate (Telegram/Discord integration, not replacement)
**Why:** Scalable distribution via leaders = platform of platforms
**Status:** Backlog

---

### 4.3 Holonic Landings for Similar Projects (Priority: MEDIUM)
**What:** White-label / partnership model for aligned projects
**Value Exchange:** They get ready module, we get distribution
**Why:** Ecosystem play
**Status:** Backlog

---

### 4.4 Monetization Streams (Priority: HIGH)
**What:** 5 revenue mechanisms:

| Stream | Trigger |
|--------|---------|
| Commercial license | Use modules commercially → contact us |
| Contribution | Bring code/content → earn leadership role |
| Business incubator | Join co-op membership |
| Finder's fee | Published projects pay % per transaction |
| Content sales | Curated content with approval |

**Why:** Business sustainability, investment-ready
**Status:** Spec complete

---

## 💰 CLUSTER 5: ECONOMICS

### 5.1 Token Economics (Priority: MEDIUM)
**What:** Incentive layer design:
- **Value token:** XP/credits for contributions
- **Reputation token:** ZoG verification level + endorsements
- **Wallet:** Internal credits (crypto optional later)

**MVP Decision:** XP + level is enough for now
**Why:** Alignment of interests, sustainable ecosystem
**Status:** Backlog (MVP has XP)

---

### 5.2 Daily Use Case (Priority: HIGH)
**What:** Retention loop definition:
- Learn
- Meet  
- Collaborate
- Grow
- Build your genius business

**Why:** User habit formation, DAU/MAU ratio
**Status:** ✅ Defined in Daily Loop spec

---

# 📅 Timeline Overview

| Period | Focus | Key Deliverables |
|--------|-------|-----------------|
| **Jan 28** | Tour + Data Model | Tour, User DB, Genius Business Sequence |
| **Jan 29** | UX Polish | Images, Brandbook application, Landing |
| **Jan 30** | Testing | Full flow test, 20 beta invites ready |
| **Jan 31** | Launch | First beta testers enter |
| **February** | Growth | Matchmaking live, invite system, versioning |
| **March** | Autonomous | Agent-based invitations |

---

## 📦 PARKED FEATURES

### Events Module (Luma-like)
**Status:** Parked | **Priority:** Medium

Three clicks after signup:
1. See list of events
2. Pick an event
3. Get confirmation

Routes: `/events`, `/events/:id`

---

### Admin Panel & Dashboard
**Status:** Parked | **Priority:** Future

For community leadership:
- Member overview
- Invite members
- Manage branding
- View aggregate patterns
- Manage events

Routes: `/admin`, `/admin/members`, `/admin/branding`

---

### Placeholder Strategy
For unbuilt features, show:
- **[Coming Soon]** badge
- Grayed out module in sidebar
- Tooltip: "This feature is being built"

---

## Archived Sprints

### Sprint: Jan 4-29, 2025 (Network School)
- ✅ 5 Growth Paths defined
- ✅ 5 Game Spaces architecture
- ✅ ZoG + QoL onboarding
- ✅ Core documentation (29 docs)
- ✅ MVP tested with 10-50 users

---

*Roadmap updated: 2026-01-28 11:55. Original items preserved + 19 new items added.*
