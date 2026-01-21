# The Vibe-Coding Playbook
## First Principles of Product Design

*"The ultimate goal of every product is to become one button."*

---

## The Core Insight

A user journey is a **sequence of screens**. A screen is the **modular unit** of a graphical interface. An interface is a **bridge** that allows humans to act on reality — a tool for achieving a goal.

Everything else is derived from this.

---

## Part 1: The Anatomy of a Screen

Every screen element exists in one or more of these layers:

### Layer 1: Data Output (Information Delivery)
- Communicating something to the user
- Can be: symbol, icon, text, audio, video, 3D, VR/AR
- Ranges from raw information to optimized infographics

### Layer 2: Data Input (Information Request)
- Requesting something from the user
- Form fields, selections, uploads
- Must minimize friction — make it effortless to provide

### Layer 3: Backend Program (The Engine)
- The invisible logic that makes interactivity possible
- User doesn't need to understand it (like a car engine)
- Without it, an interactive element is just decoration

### Layer 4: Harmony (Beauty & Energy)
- Visual design that creates a feeling of harmony
- Energetic impact that improves the user's internal state
- Not utilitarian — but elevates the entire experience

**Key Principle:** Every element must have a defined function. If it doesn't serve a purpose, it creates cognitive load and damages usability.

---

## Part 2: The Master Parameter — Usability

**Usability** is the composite measure of product quality. It encompasses everything.

### The Usability Laws

| Less of This | = | Higher Usability |
|--------------|---|------------------|
| Fewer screens | → | Higher usability |
| Fewer buttons | → | Higher usability |
| Simpler communication | → | Higher usability |
| Fewer sub-results to reach the result | → | Higher usability |

**The evolutionary goal of every product is to become one button.**

This is the limit. The user must express *some* intention to receive a result. In graphical interfaces, that's pressing a button. A button is the most intuitive human tool. Simpler would only be thought control.

Until we reach one button, every product is simply a **series of buttons** — the total result broken into a series of sub-results.

---

## Part 3: The Structure of a User Journey

### Start With the Result

Everything begins with the **result** the user should receive at the end.

If we cannot achieve that result in one step, we ask:
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

Each sub-result gets a screen (or minimal set of screens).

### First Screen & Last Screen

**First Screen:**
- Promises the result to the user
- Describes it: concise, clear, beautiful
- Contains the **Magic Button** — "Start" or equivalent

**Last Screen:**
- Shows the result achieved
- Describes its value and how to use it
- Offers the **next step** — deeper engagement, adjacent result, or next module

---

## Part 4: Screen Templates

### The Start Screen (Per Sub-Result)

**Required elements:**
1. **Promise** — What result will the user get?
2. **Description** — Concise, clear, minimal (icon + short text minimum)
3. **Magic Button** — Call-to-action to begin

**Optional elements:**
- Infographics
- Video explanation
- Beauty/harmony elements

### The End Screen (Per Sub-Result)

**Required elements:**
1. **The Result** — Show what was achieved
2. **Its Value** — Why this matters
3. **How to Use It** — Practical application
4. **The Next Step** — Where this leads, and why it's valuable

**Note:** The end screen of one sub-result and the start screen of the next *could* be combined, but separation reduces cognitive load.

### The Information Request Screen

When you need input from the user:

1. **What is needed** — Clearly state what information you're requesting
2. **Why it's needed** — How this input creates the result they want
3. **Input field** — With clear instructions
4. **Submit button** — Labeled with the sub-result, not just "Submit"

**Critical:** Minimize friction. The information should be easy to retrieve, easy to enter. The simplest version: "Enter your name" or "Select a date."

---

## Part 5: Navigation

Users must be able to navigate. The core navigation elements:

| Element | Function |
|---------|----------|
| **Back** | Return to previous step |
| **Restart** | Begin from the start |
| **Skip** | Move past current step (if logic allows) |
| **Save** | Preserve progress |

**Progress indicators** (dots, progress bars) are calming — they show:
- What's happening
- How much remains
- Where the user is in the sequence

---

## Part 6: The Button

The button is the atomic unit of user action.

### Button Elements

1. **Visual design** — Clear, clickable, inviting
2. **Call-to-action text** — 1-2 words maximum
3. **The promise** — The text names the result of pressing it

**Example:** Not "Submit" but "Get My Genius Profile"

### Multiple Buttons

When logic branches, multiple buttons can split users into different paths. But default to one button per screen.

---

## Part 7: The Format Spectrum

Information can be delivered in increasing complexity:

```
Symbol → Icon → Text → Audio → Video → Interactive 3D → VR → AR
```

**Start simple.** Use the minimum format needed to communicate clearly.

---

## Part 8: The Playbook (Step-by-Step)

### Step 1: Define the Result
What does the user receive at the end of this product/module?

### Step 2: Break Into Sub-Results
What intermediate results lead to the final result?
*(Minimize these. Fewer = higher usability.)*

### Step 3: Design Each Sub-Result's Screens
- Start screen (promise + magic button)
- Process screens (if needed)
- End screen (result + value + next step)

### Step 4: Design Information Request Screens
- What's needed
- Why it matters
- Simple input
- Labeled submit

### Step 5: Add Navigation
- Back, Restart, Skip, Save as appropriate
- Progress indicators

### Step 6: Add Harmony (Optional)
- Beauty elements
- Transformational experience
- Delight, fun, art

### Step 7: Vibe-Code It
Hand this specification to AI. The AI can now:
- Help define results
- Break into sub-results
- Write all components
- Generate the actual product

---

## Part 9: The Meta-Insight

This playbook describes the **deepest principles of web design** — the foundation on which all internet interfaces are built.

From these principles, we can:
- Add any functionality
- Play with any parameters
- Assemble any screen, any user journey

Like LEGO blocks, these primitives combine into anything.

**This is vibe-coding:** Describe what you want, structured by these principles, and AI builds it.

---

## Summary: The Minimums

| Component | Minimum Required |
|-----------|------------------|
| Product | 1 result |
| Sub-results | As few as possible |
| Start screen | Promise + Magic Button |
| End screen | Result + Value + Next Step |
| Input screen | What + Why + Field + Submit |
| Button | 1-2 word call-to-action |
| Navigation | Back, Restart, Skip, Save |

---

*"We're writing the theory of maximizing usability through maximizing user journey quality. This theory becomes a step-by-step instruction for vibe-coding modern products. Follow it, and you get incredible products. Steve Jobs-level products. That's the bar we're setting."*

---

## Appendix: The AI Prompt Structure

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

*Channeled January 2025. Steve Jobs may have been involved.*
