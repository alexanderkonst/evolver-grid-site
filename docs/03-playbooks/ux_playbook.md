> §Feature Spec Template is synthesized into docs/templates/spec-handoff.md (2026-10-27). This file is kept as a source.

# The Vibe-Coding Playbook
## First Principles of Product Design

*"The ultimate goal of every product is to become one button."*

> **Meta-note:** This Playbook is itself a product — the **One-Button Product Builder**. 
> See `docs/one_button_product_builder.md` for the productized version.

### Result ≠ Feature

| Term | Definition | Focus |
|------|------------|-------|
| **Feature** | A capability the product has | What the product *does* |
| **Result** | A transformation the user receives | What the user *gets* |

Features are implementation. Results are value. The Playbook operates in **results**, not features.

---

## Quick Reference: Execution Workflow

*Follow this sequence. Don't skip. See Part 12 for details.*

```
PHASE 1: MASTER RESULT
1. State the Master Result
2. Design First Screen (promise + Magic Button)
3. Design Last Screen (result + celebration + next step)

PHASE 2: SUB-RESULTS
4. List Sub-Results that lead to Master Result
5. Sequence them
6. Define Start/End screens for each

PHASE 3: NESTED LAYERS
7. Go deeper into each Sub-Result
8. Repeat until atomic screens
9. Stop when no more nesting needed

PHASE 4: SCREEN DETAILS
10. For each screen: Data Output, Data Input, Magic Button, Navigation

PHASE 5: ROAST & ITERATE
11-13. Critique, fix, repeat until solid

PHASE 6: EXTENSION MODULES
14-18. Artifacts, Emotional States, Completion, Skip Paths, Bridges

PHASE 7: WIREFRAMES
19-21. ASCII sketches, navigation map, transitions

PHASE 8: WIREFRAME ROAST (NEW)
22-24. Roast wireframes (3 cycles), synthesize, refine

PHASE 9: BUILD
25-27. Tasks, code, verify
```

---

## Part 1: First Principles — The Chain of Definitions

To build a user journey with absurd simplicity, we must first understand what it is at its deepest level.

### What is a User Journey?

A **user journey** is a sequence. A sequence of what? **Screens**.

### What is a Screen?

A screen is the **modular unit** — the most stable building block of a graphical interface.

### What is a Graphical Interface?

An interface mirrors **how humans fundamentally interact with information**. It is a **bridge** that allows humans to act on reality. It is a technology, an instrument, a means of achieving a goal.

### Therefore:

```
User Journey = Sequence of Screens
Screen = Modular unit of Interface
Interface = Bridge to act on reality
```

Everything else is derived from this.

---

## Part 2: The Anatomy of a Screen

A screen breaks down modularly into **visual elements**. Each element has a role and may or may not be interactive. These elements can be viewed through several **dimensions** (плоскости):

### Dimension 1: Data Output (Information Delivery)

Communicating something to the user. This includes:

- **Raw information** — Text, symbols, data
- **Infographics** — Information *packaged* for optimal understanding and rapid comprehension
- **Formats** (in order of complexity): Symbol → Icon → Text → Audio → Video → Interactive 3D → VR → AR

### Dimension 2: Data Input (Information Request)

Requesting something from the user:
- Form fields, selections, uploads
- Must **minimize friction** — the user should be able to retrieve and provide this information effortlessly
- Simplest example: "Enter your name" or "Select a date"

### Dimension 3: Backend Program (The Engine)

The invisible logic that makes interactivity possible.

> A person doesn't need to understand how an engine works to drive a car — but without an engine, the car won't move. **A car without an engine is not a car — it's a cart without a horse. And a cart without a horse is not a cart — it's just a stand or a table.**

The same applies here: **an interactive element without a program behind it is not an interactive element — it's just visual decoration.**

### Dimension 4: Harmony (Beauty & Energy)

The function of visual design that creates a **feeling of harmony** through energetic impact on the person — improving their internal state.

This is not utilitarian. This is about **raising the user's internal harmony through aesthetic energy**.

### Dimension 5: Relationships Between Elements

Elements and screens can be:
- **Grouped** together
- **Encoded with logic** (if/then)
- **Positioned relative to each other** with purpose — showing their interrelationship through spatial arrangement

### Dimension 6: Function

Every element must have a **defined function**. There is always an optimization goal. No element exists without purpose.

> This is the difference between simple products and those burdened with unnecessary complexity — complexity that creates cognitive load, unpleasant usage feelings, and distracts from the elements that carry the core functional load.

---

## Part 3: The Master Parameter — Usability

**Usability** is the composite measure, the **master parameter** that includes everything we've discussed.

> We are writing **the theory of maximizing usability** through maximizing user journey quality. This theory will become a step-by-step instruction for vibe-coding modern products. Follow it, and you get incredible products. **Steve Jobs-level products.** That's the bar we're setting.

### The Usability Laws

| Principle | Effect |
|-----------|--------|
| Fewer screens | → Higher usability |
| Fewer buttons | → Higher usability |
| Simpler communication | → Higher usability |
| Fewer sub-results to reach the result | → Higher usability |

### The Limit: One Button

**The evolutionary goal of every product is to become one button.**

This is the limit. The user must express *some* intention to receive a result. In graphical interfaces, that's pressing a button. The button is the most intuitive human tool. Simpler would only be thought control.

> Like kitchen appliances — they must be absolutely clear in usage. A blender has essentially one button: on/off. A vacuum cleaner: on/off, retract cord. **This is the simplicity we're aiming for.** This is what Steve Jobs means when he compares kitchen appliances to computers.

Until we reach one button, every product is simply a **series of buttons** — the total result broken into a series of sub-results.

---

## Part 4: The Structure of a User Journey

### Start With the Result

Everything begins with **reverse engineering** the result the user should receive at the end. This applies to the entire journey and each of its parts.

If the result cannot be achieved in one step:
> "What sub-results lead us to the final result?"

We aim for the **minimum number** of sub-results.

### The Mapping

```
RESULT
  ├── Sub-result 1 → Screen(s)
  ├── Sub-result 2 → Screen(s)
  ├── Sub-result 3 → Screen(s)
  └── Final Result → End Screen
```

Each sub-result gets a screen (or minimal set of screens). **There must be logic between screens**, and the overall result determines both the first and last screens.

### First Screen (of entire journey)

- States **what result we will create** for the user
- Contains the **Magic Button**: "Start"

### Last Screen (of entire journey)

- Shows **the result that was created**
- Highlights **what we accomplished**
- Offers the **next step**: deeper engagement, adjacent result, another module, or a paid offering

---

## Part 5: Screen Templates

### The Start Screen (Per Sub-Result)

**Required elements:**
1. **Promise** — Offer the sub-result to the user
2. **Description** — Concise, clear, beautiful (minimum: icon + short text)
3. **Magic Button** — Call-to-action to begin

**Optional elements:**
- Infographics, video, beauty elements
- These don't serve core functional goals but may add value, usability, fun, or art

### The End Screen (Per Sub-Result)

Three required elements:
1. **The sub-result itself** — Show it
2. **Its value** — What's the benefit?
3. **How to use it** — The practical application

Plus:
4. **The next step** — What follows, and why it's valuable to take it

**Note:** The end screen of one sub-result and the start screen of the next *could* be combined, but to reduce cognitive overload, it's better to separate them.

### Intermediate Screen Communication (NEW)

On every intermediate screen (after any modular result is achieved), communicate **three dimensions** to the user:

| Dimension | Question | Purpose |
|-----------|----------|---------|
| 🫀 **HEART** | "What just happened?" | Core essence of the result |
| 🧠 **MIND** | "What does this mean for you?" | Significance, value for user |
| 🔥 **GUT** | "What's the next step?" | Implication, what to do now |

**Template for intermediate screens:**

```
┌─────────────────────────────────────────────────────┐
│  ✓ [HEART: What just happened]                     │
│                                                     │
│  [MIND: What this means for you]                   │
│                                                     │
│           [ GUT: Next Step Button ]                │
└─────────────────────────────────────────────────────┘
```

**Example:**

```
┌─────────────────────────────────────────────────────┐
│  ✓ Your Ideal Client profile is ready              │
│                                                     │
│  Now you know exactly who needs your gift most.    │
│                                                     │
│       [ Crystallize Your Promise → ]               │
└─────────────────────────────────────────────────────┘
```

**Under the hood:** Use this prompt to generate screen communication:

```
For the result "[MODULAR RESULT]", provide:

1. ESSENCE / HEART: What this essentially is (the core, first principle)
2. SIGNIFICANCE / MIND: What it truly means for the user
3. IMPLICATIONS / GUT: What's the key next step or consequence
```

This ensures every intermediate screen maintains user clarity and momentum.

### Sub-Screens (Information Chunking)

When one screen would have too much information:
> We break it into **sub-screens** — like how onboarding works: information broken into pieces that are easy to perceive and "live through."

Sub-screens must show:
- What comes next
- How much remains
- Where the user is in the sequence

This is achieved through **progress indicators** (bars, dots) — elements that **calm the user** because they know what's happening, how much is left, and that they're being informed.

### The Information Request Screen

When you need input from the user:

1. **What is needed** — Clearly state what information you're requesting
2. **Why it's needed** — How this input creates the result they want
3. **Input field** — With clear instructions, optimized for **minimum friction**
4. **Submit button** — Labeled with the sub-result, not just "Submit"

---

## Part 6: Navigation

Navigation allows the user to **teleport** simply and clearly to any step in product usage.

Core navigation elements:
- **Back** — Return to previous step (if logic allows)
- **Skip** — Move past current step
- **Restart** — Begin from the start
- **Save** — Preserve progress

---

## Part 7: The Button

The button is the atomic unit of user action.

### Button Elements

1. **Visual design** — Clear, clickable, inviting
2. **Call-to-action** — 1-3 words maximum (ideally 1-2)
3. **The promise** — The text names the result of pressing it

### Multiple Buttons

When logic branches, multiple buttons split users into different paths. But default to one button per screen.

---

## Part 8: Optional Elements

Everything beyond the required Start Screen, End Screen, and Button is **optional**:

- Additional screens for **beauty**
- Screens for **user education** (if needed)
- Screens for **transformational experience**
- Elements for **fun, play, delight**
- Elements that serve **no functional purpose at all — i.e., art**

When done with taste, each of these increases overall product quality. They represent quality parameters that may or may not fall under usability — but they matter.

---

## Part 9: The Playbook (Step-by-Step)

### Step 1: Define the Result
What does the user receive at the end of this product/module?

### Step 2: Break Into Sub-Results
What intermediate results lead to the final result?
*(Minimize these. Fewer = higher usability.)*

### Step 3: For Each Sub-Result, Design:
- **Start screen**: Promise + Magic Button
- **End screen**: Result + Value + Usage + Next Step

### Step 4: For Information Requests:
- What's needed + Why it matters
- Simple input field + Labeled submit

### Step 5: Add Navigation
- Back, Skip, Restart, Save as appropriate
- Progress indicators (calming function)

### Step 6: Add Optional Elements
- Beauty, transformational experience, fun, art

### Step 7: Vibe-Code It
This specification becomes instructions for AI. AI can:
- Define results
- Break into sub-results
- Write all components
- Generate the product

---

## Part 10: The Meta-Insight

> What we have just done is define **the deepest principles of web design** — the foundation on which all internet interfaces are built, without needing to know anything about web design in advance.

From these first principles, we can:
- Add any functionality
- Play with any parameters
- Assemble any screen, any user journey

**Like LEGO blocks, these primitives combine into anything.**

This is vibe-coding: Describe what you want, structured by these principles, and AI builds it.

---

## Appendix: AI Prompt Structure

When using AI to vibe-code, provide:

```
RESULT: [What the user gets]

SUB-RESULTS:
1. [First sub-result]
2. [Second sub-result]
3. [Third sub-result]

FOR EACH SUB-RESULT:
- Start screen: [Promise + button text]
- Input needed: [What + why]
- End screen: [Result shown + value + next step]

NAVIGATION: [Which elements needed]

STYLE: [Harmony/beauty notes]
```

AI handles the rest.

---

*Channeled January 2025.*
*Steve Jobs was probably watching.*

---

## Part 11: Extension Modules

*Additions that bridge first principles → implementation reality.*

The Playbook above establishes **what** and **why**. These modules address **how it lands** in practice.

---

### Module 1: Artifacts

**Principle:** Every result needs a *tangible deliverable* the user can hold.

The Playbook says: "Know your genius." The artifact is *what form that knowing takes*.

| Result | Artifact Example |
|--------|------------------|
| Unique Gift | PDF + Archetype title + 3 talents + 6 environments + 1 mastery action |
| Quality of Life | Spider chart + Growth priorities + Score |
| Connection Made | Profile link exchanged + Message sent confirmation |

**Question to ask:** "What does the user *have* after this screen that they didn't have before?"

---

### Module 2: Emotional States

**Principle:** Every transition has a *feeling*. Honor it before moving on.

Results create emotional states. The next screen must acknowledge where the user just arrived.

| After | User Feels | Next Screen Should |
|-------|------------|-------------------|
| ZoG Result | Wonder, recognition, vulnerability | Pause. Celebrate. Let them sit. |
| QoL Assessment | Honesty, slight discomfort | Validate. "That took courage." |
| Practice Complete | Accomplishment, momentum | Affirm progress. Show streak. |

**Question to ask:** "How does the user *feel* right now, and does the next screen honor that?"

---

### Module 3: Bridges

**Principle:** Spaces are not silos. Users live in *moments*, not features.

When should one space pull you into another?

| Moment | Trigger | Destination |
|--------|---------|-------------|
| "You haven't practiced in 3 days" | Notification | Transformation entry |
| "Someone with complementary genius joined" | Notification | Discover |
| "Your QoL dropped in Health" | Profile | Relevant practice |

**Question to ask:** "What event in one space should pull the user into another?"

---

### Module 4: Completion

**Principle:** Every section needs a *done* state.

If there's no ✅, users don't know they've won. Neither do devs. Neither do analytics.

| Section | Completion Condition | Celebration |
|---------|---------------------|-------------|
| Unique Gift | Archetype generated + saved | "You are a {X}. Now you have words." |
| Quality of Life | All 8 rated + priorities set | "Your map is complete." |
| First Practice | 1 practice logged | "Day 1. You're building momentum." |

**Question to ask:** "What does ✅ look like, and how do we celebrate it?"

---

### Module 5: Skip Paths

**Principle:** Users can skip. Define what happens when they do.

What's the minimum viable profile? Can they still get value?

| Section | If Skipped | Consequence |
|---------|------------|-------------|
| Unique Gift | Empty archetype | Cannot match, cannot see profile |
| Quality of Life | No QoL data | Transformation recommendations are generic |
| Mission | No mission set | Cannot match by mission |

**Question to ask:** "If they skip everything, what's the floor — and is it still valuable?"

---

### Module 6: Document Purpose

**Principle:** Every document should answer: *What decisions does this enable?*

A doc that doesn't unlock action is just words.

| Document Type | Enables These Decisions |
|---------------|------------------------|
| Screen Spec | "What should I build on this page?" |
| User Flow | "What's the happy path? The error path?" |
| Playbook | "What's the organizing principle for ALL screens?" |

**Question to ask:** "After reading this doc, what can I now decide that I couldn't before?"

---

### How Modules Compose

The original Playbook gives you:
- Master Result → Sub-Results → Screens
- Magic Button for each screen
- Start + End screen templates

These modules add:
- **Artifacts** → what tangible thing is delivered
- **Emotional States** → what transition feels right
- **Bridges** → when spaces connect
- **Completion** → when is it done
- **Skip Paths** → graceful degradation
- **Document Purpose** → what decisions are unlocked

*Together: First Principles + Extension Modules = Implementation Blueprint.*

---

*Extension Modules added January 2025.*

---

## Part 12: Execution Workflow

*The sequence of steps from definition to code.*

Follow this order. Do not skip steps. Each phase must be complete before the next.

---

### Phase 1: Define the Master Result

1. **State the Master Result** — What does the user receive at the very end?
2. **Design the First Screen** — Promise the result, Magic Button to begin
3. **Design the Last Screen** — Show the result delivered, celebrate, offer next step

---

### Phase 2: Break Into Sub-Results

4. **List Sub-Results** — What intermediate results lead to the Master Result?
5. **Sequence them** — In what order must they be delivered?
6. **For each Sub-Result:**
   - Define Start Screen (promise + Magic Button)
   - Define End Screen (result shown + value + next step)

---

### Phase 3: Nested Layers

7. **Go one level deeper** — Does each Sub-Result have its own sub-results?
8. **Repeat** — Until you reach atomic screens that can be built
9. **Stop** — When further nesting adds no clarity

---

### Phase 4: Screen Details

10. **For each screen, define:**
    - **Data Output** — What information is displayed?
    - **Data Input** — What is requested from user? Why?
    - **Magic Button** — What does it say? What does it do?
    - **Navigation** — Back? Skip? Save? Progress bar?

---

### Phase 5: Roast & Iterate

11. **Roast the spec** — Is anything missing? Vague? Wrong?
12. **Iterate** — Fix what the roast revealed
13. **Repeat** — Until the spec feels solid

---

### Phase 6: Apply Extension Modules

14. **Artifacts** — What tangible thing does user GET from each screen?
15. **Emotional States** — How does user FEEL at each transition?
16. **Completion** — What does ✅ look like for each section?
17. **Skip Paths** — What happens if user skips?
18. **Bridges** — What events pull user between spaces?

---

### Phase 7: Wireframes

19. **ASCII wireframes** — Sketch each screen structure
20. **Navigation design** — Map how screens connect
21. **Connective tissue** — Transitions, loading states, error states

---

### Phase 8: Build

22. **Break into tasks** — Code changes per screen
23. **Build** — Implement screens following the spec
24. **Verify** — Does the build match the spec?

---

### Summary

```
1. Master Result → First/Last Screen
2. Sub-Results → Start/End for each
3. Nested layers → Until atomic
4. Screen details → Data in/out, buttons, nav
5. Roast & iterate
6. Extension modules → Artifacts, emotions, completion, skips, bridges
7. ASCII wireframes + navigation
8. Build & verify
```

*Follow this. Don't skip. First principles → details → code.*

---

*Execution Workflow added January 2025.*

---

## Part 13: Advanced Modules

*Extensions discovered through practice.*

---

### Module 7: Progress Dashboard

**Principle:** Track Playbook execution visually.

At any point, you should be able to see:
- Which phases are complete
- Which phase you're in
- Overall progress percentage

```
┌─────────────────────────────────────────────┐
│  PHASE 1: Master Result          [████] ✅  │
│  PHASE 2: Sub-Results            [████] ✅  │
│  PHASE 3: Nested Layers          [████] ✅  │
│  PHASE 4: Screen Details         [██░░] 🔄  │
│  PHASE 5: Roast & Iterate        [░░░░] ⬜  │
│  PHASE 6: Extension Modules      [░░░░] ⬜  │
│  PHASE 7: Wireframes             [░░░░] ⬜  │
│  PHASE 8: Build                  [░░░░] ⬜  │
├─────────────────────────────────────────────┤
│  OVERALL: ████████░░░░░░░░░░░░░░░    37.5%  │
└─────────────────────────────────────────────┘
```

**Question to ask:** "Where are we? What's next?"

---

### Module 8: Roast Checklist

**Principle:** Standardize the critique in Phase 5.

| Category | Questions |
|----------|-----------|
| **Consistency** | Is numbering sequential? Are section names consistent? |
| **Completeness** | Is every screen covered? Any gaps in flow? |
| **Emotional** | Does each result screen have emotional state defined? |
| **Technical** | Are loading states handled? Error states? |
| **Mobile** | How does this work on mobile? Touch targets? |
| **Prerequisite** | Are dependencies clear? What unlocks what? |

**Question to ask:** "What would break if we shipped this today?"

---

### Module 9: White-Label

**Principle:** Make the product work for multiple communities.

| Layer | What Changes |
|-------|--------------|
| Branding | Logo, colors, fonts |
| Copy | Headlines, button labels |
| Content | Practices, recommendations, missions |
| Values | What's recommended, what's not |

**Question to ask:** "If Community X used this, what would they change?"

---

### Module 10: Content Curation

**Principle:** Communities must approve recommended content.

```
Content Pool → Community Filter → Approved Content → User Recommendation
```

| Permission | Who Sets |
|------------|----------|
| Global pool | Platform admin |
| Community filter | Community leader |
| User preferences | User |

**Question to ask:** "Who decides what this user sees?"

---

### Module 11: i18n (Internationalization)

**Principle:** Prepare for multiple languages from day one.

| Layer | What to Localize |
|-------|------------------|
| UI strings | Buttons, labels, messages |
| AI prompts | Prompt templates in each language |
| Static content | Practices, domain descriptions |
| Dynamic content | AI-generated results |

**Steps:**
1. Install i18n framework (react-i18next)
2. Create `locales/en.json`, `locales/ru.json`
3. Wrap strings in `t("key")`
4. Add language selector to settings

**Question to ask:** "If a Russian user sees this, will they understand?"

---

*Advanced Modules added January 2025.*

---

## Part 14: Significance & Implications

*Why this matters.*

---

### Essence

The Playbook is a **product compiler**.

You give it source code (a transformational result) and it compiles it into a running product — just as a code compiler takes human-readable code and turns it into machine-executable software.

### Significance

**This inverts the economics of product development.**

| Before | After |
|--------|-------|
| Building products requires teams | Solo founder + AI |
| Iteration is expensive (code changes) | Iteration is free (spec changes) |
| Product thinking is tacit knowledge | Product thinking is explicit, automated |
| Founders need product design skills | Founders describe transformations |

### Implications

1. **Venture Studios at Scale** — Generate 100 products from 100 unique businesses
2. **Platform for Platforms** — White-label for any community
3. **Education** — Teach product thinking through the Playbook
4. **The Playbook Becomes the Product** — Not what you build. How you build.

### Batch Processing vs Serial Processing

Traditional development is serial:
```
Idea → Line of code → Feedback → Fix → Line → Feedback → ...
Time: weeks
```

Playbook development is batch:
```
Result → Spec (all screens) → Build ALL → Feedback on entire system
Time: hours/days
```

You give feedback on 32 screens at once, not on each icon.

### AI-Friendly Structure

The Playbook gives AI agents a clear structure:

| Without Playbook | With Playbook |
|------------------|---------------|
| AI guesses what to do | AI follows phases |
| Ambiguous instructions | Explicit inputs/outputs |
| Debate about approach | First principles decide |

The Dashboard shows progress. AI knows where it is, what's done, what's next.

### Dashboard as Product Feature

The Progress Dashboard can become a **user-facing feature**:

```
User sees: "Your journey: Day 3 of 7. Profile complete. Next: First Practice."
```

And for AI agents:
```
Agent sees: "Phase 8.2 of 8. Audit existing implementation."
→ Knows exactly what to do
```

---

## Part 15: Result → Feature Translation

*When results need to become implementation specs.*

---

### The Two Layers

The Playbook operates in **Results**. Build teams operate in **Features**.

At Phase 8, results must be translated into features for implementation.

```
RESULT (Playbook)
    ↓ translation
FEATURE (Implementation)
    ↓ code
SHIPPED PRODUCT
```

---

### Feature Spec Template

When translating a Result into an implementable Feature:

```markdown
# Feature: [Short, descriptive title]

## Goal
What problem does this feature solve? Why does it exist?

## Result It Delivers
Link back to the Playbook result this implements.
(Result = what user GETS. Feature = how we deliver it.)

## User Story
As a [user type], I want to [goal], so that I can [benefit].

## Functional Requirements
List core behaviors the feature must support. Be specific and measurable.
- [ ] Behavior 1
- [ ] Behavior 2
- [ ] Behavior 3

## Data Requirements
What new tables, fields, or relationships are needed? What existing data do we reuse?
- New: [tables/fields]
- Reused: [existing data]

## User Flow
Step-by-step actions the user performs from start to finish:
1. User does X
2. System responds with Y
3. User sees Z
4. User clicks [Magic Button]
5. Result is delivered

## Acceptance Criteria
Clear conditions defining when this feature is "done":
- [ ] Condition 1
- [ ] Condition 2
- [ ] Condition 3

## Edge Cases
List tricky scenarios the system must handle:
- What if user skips?
- What if data is missing?
- What if load fails?
- What if user has no [prerequisite]?

## Non-Functional Requirements (Optional)
- Performance: [constraints]
- Security: [constraints]
- UX: [constraints]
```

---

### Key Insight: Result ≠ Feature

| Concept | Definition | Focus |
|---------|------------|-------|
| **Result** | Transformation the user receives | What user GETS |
| **Feature** | Capability the product has | What product DOES |

The Playbook defines Results. Features are derived from Results at build time.

---

### Result → Feature Example

**Result:** "User knows their unique gift"

**Feature Spec:**
```
Feature: Unique Gift Assessment

Goal: Let user discover their archetype through talent selection

Result: User knows their unique gift (Playbook 1.1)

User Story: As a new user, I want to select my top talents,
so that I can discover my archetype.

Functional Requirements:
- [ ] Display 81 talent cards
- [ ] Allow selecting exactly 10
- [ ] Narrow to 3
- [ ] Generate archetype via AI

Acceptance Criteria:
- [ ] User can complete flow in under 5 minutes
- [ ] Archetype is displayed on result screen
- [ ] Result is saved to profile
```

---

## Part 16: Full Progress Dashboard

*Nested view of all Playbook steps.*

---

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PLAYBOOK EXECUTION DASHBOARD                        │
│                         Product: EVOLVER                                    │
│                         Date: January 2026                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ PHASE 1: MASTER RESULT ────────────────────────────────── [████] ✅ ─┐  │
│  │  1.1 State the Master Result                                    ✅    │  │
│  │  1.2 Design First Screen (promise + Magic Button)               ✅    │  │
│  │  1.3 Design Last Screen (result + celebration + next)           ✅    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ PHASE 2: SUB-RESULTS ──────────────────────────────────── [████] ✅ ─┐  │
│  │  2.1 List Sub-Results                                           ✅    │  │
│  │  2.2 Sequence them                                              ✅    │  │
│  │  2.3 Define Start/End screens for each                          ✅    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ PHASE 3: NESTED LAYERS ────────────────────────────────── [████] ✅ ─┐  │
│  │  3.1 Unique Gift (6 screens)                                 ✅    │  │
│  │  3.2 Quality of Life (10 screens)                               ✅    │  │
│  │  3.3 First Practice (3 screens)                                 ✅    │  │
│  │  3.4 Unique Business (6 screens)                                ✅    │  │
│  │  3.5 Mission (4 screens)                                        ✅    │  │
│  │  3.6 Discover (3 screens)                                       ✅    │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │  Total: 32 screens                                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ PHASE 4: SCREEN DETAILS ───────────────────────────────── [████] ✅ ─┐  │
│  │  4.1 Data Output for each screen                                ✅    │  │
│  │  4.2 Data Input for each screen                                 ✅    │  │
│  │  4.3 Magic Button labels                                        ✅    │  │
│  │  4.4 Navigation (Back, Skip, Progress)                          ✅    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ PHASE 5: ROAST & ITERATE ──────────────────────────────── [████] ✅ ─┐  │
│  │  5.1 Roast Iteration 1                                          ✅    │  │
│  │  5.2 Roast Iteration 2                                          ✅    │  │
│  │  5.3 Fix issues (numbering, duplicate headers)                  ✅    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ PHASE 6: EXTENSION MODULES ────────────────────────────── [████] ✅ ─┐  │
│  │  6.1 Artifacts defined                                          ✅    │  │
│  │  6.2 Emotional States mapped                                    ✅    │  │
│  │  6.3 Completion signals specified                               ✅    │  │
│  │  6.4 Skip Paths documented                                      ✅    │  │
│  │  6.5 Bridges between spaces                                     ✅    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ PHASE 7: WIREFRAMES ───────────────────────────────────── [████] ✅ ─┐  │
│  │  7.1 ASCII wireframes (8 key screens)                           ✅    │  │
│  │  7.2 Navigation flow map                                        ✅    │  │
│  │  7.3 Transitions defined                                        ✅    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ PHASE 8: BUILD & VERIFY ───────────────────────────────── [██░░] 🔄 ─┐  │
│  │  8.1 Break into tasks                                           ✅    │  │
│  │  8.2 Translate Results → Features                               ✅    │  │
│  │  8.3 Implement screens                                          ✅    │  │
│  │  8.4 Verify against spec                                        🔄    │  │
│  │  8.5 Deploy & test                                              ⬜    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  OVERALL PROGRESS                                                           │
│  ██████████████████████████████████████████████████████████░░░░░░░   93.5%   │
├─────────────────────────────────────────────────────────────────────────────┤             │