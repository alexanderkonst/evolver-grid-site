# UX Playbook: First Principles of Product Design

> **Thesis:** Every product is a journey toward a result. The best products reduce this journey to its minimum form — ideally, one button.

---

## The Core Equation

```
RESULT = f(SCREENS × BUTTONS × CLARITY)

Maximize usability by minimizing:
- Number of screens
- Number of buttons per screen
- Cognitive load per element
```

---

## 1. What Is a User Journey?

A **user journey** is a sequence of screens. Each screen exists to produce a **sub-result** that leads to the **final result**.

```
FINAL RESULT
    ↑
SUB-RESULT 3 → [Screen 3] → [Button]
    ↑
SUB-RESULT 2 → [Screen 2] → [Button]
    ↑
SUB-RESULT 1 → [Screen 1] → [Button]
    ↑
ENTRY → [Screen 0: Promise] → [Magic Button: Start]
```

---

## 2. What Is a Screen?

A screen is the **atomic unit** of a user interface. It has layers:

| Layer | Function | Examples |
|-------|----------|----------|
| **Data Output** | Communicate information | Text, icons, infographics, video |
| **Data Input** | Request information | Forms, sliders, selections |
| **Backend Logic** | Invisible engine | APIs, calculations, AI |
| **Aesthetics** | Harmony, energy, beauty | Colors, spacing, animation |

### Element Types

| Type | Purpose |
|------|---------|
| **Informational** | Deliver understanding |
| **Infographic** | Optimize comprehension |
| **Decorative** | Create harmony, raise internal state |
| **Interactive** | Enable action |

---

## 3. The Magic Button Principle

> **The evolutionary goal of every product is to become one button.**

The simplest possible interface: one action that delivers the full result.

Until that's possible, we decompose into sub-results, each with its own "magic button."

**Button anatomy:**
- **Call to Action (CTA):** 1-3 words describing the result of pressing
- **Format:** Visual prominence, clear contrast
- **Logic:** May branch into multiple paths (if/then)

---

## 4. Screen Types

### 4.1 Start Screen (Entry)

**Purpose:** Promise the result.

**Elements:**
- Icon (visual anchor)
- Short text (result description)
- Magic Button (`[Start]`)

**Optionally:** Infographic, video, testimonial

---

### 4.2 End Screen (Result)

**Purpose:** Deliver and describe the result.

**Elements:**
- The result itself (data, visualization, artifact)
- Description of its value
- How to use it
- Next step (upsell, adjacent result, deeper module)

---

### 4.3 Input Screen

**Purpose:** Request information from the user.

**Elements:**
- What information is needed
- Why it's needed (how it leads to the result)
- Input field with clear instruction
- Submit button (CTA = the sub-result)

**Design principle:** Minimize friction. Ask only what's necessary. Provide defaults.

---

### 4.4 Information Screens (Sub-screens)

**Purpose:** Prevent cognitive overload by breaking content into digestible chunks.

**Elements:**
- Progress indicator (dots, bar)
- Single piece of information per screen
- Navigation: `[Next]` / `[Back]`

**User must always know:**
1. Where they are in the sequence
2. How much remains
3. What comes next

---

## 5. Navigation

Navigation allows the user to **teleport** within the product.

| Action | Meaning |
|--------|---------|
| `Back` | Return to previous step |
| `Skip` | Proceed without completing this step |
| `Restart` | Begin from the start |
| `Save` | Preserve progress for later |

---

## 6. Usability Maximization Laws

| Principle | Rule |
|-----------|------|
| **Fewer screens** | = Higher usability |
| **Fewer buttons** | = Higher usability |
| **Simpler communication** | = Higher usability |
| **Fewer sub-results** | = Higher usability |
| **Clearer CTA** | = Higher usability |

---

## 7. Format Hierarchy

Complexity increases down the list:

1. Symbol / Icon
2. Text (1-3 words)
3. Sentence
4. Paragraph
5. Audio
6. Video
7. Interactive 3D
8. VR / AR

**Use the simplest format that achieves clarity.**

---

## 8. The Playbook: Step-by-Step

### Step 1: Define the Result

> What does the user walk away with?

### Step 2: Decompose into Sub-Results

> What intermediate results are necessary?
> Minimize their number.

### Step 3: Map Screens

For each sub-result:
- **Start screen:** Promise
- **Input screen(s):** If needed
- **End screen:** Deliver result

### Step 4: Define CTAs

For each screen:
- What button(s)?
- What do they say? (1-3 words max)
- Where do they lead?

### Step 5: Add Navigation

- Progress indicators
- Back / Skip / Save as appropriate

### Step 6: Polish

- Aesthetics (harmony, energy)
- Information hierarchy
- Reduce, reduce, reduce

---

## 9. Template: Screen Definition

```markdown
## [Screen Name]

**Type:** Start | Input | Result | Info
**Sub-Result:** [What this screen contributes to]
**Purpose:** [One sentence]

### Elements
- [ ] Icon/Visual
- [ ] Headline (max 5 words)
- [ ] Description (max 2 sentences)
- [ ] Input field(s) (if applicable)
- [ ] CTA Button: `[Label]` → [Destination]

### Navigation
- Back: [Yes/No] → [Where]
- Skip: [Yes/No] → [Where]
- Progress: [Step X of Y]
```

---

## 10. AI Integration

This playbook can be used as **instructions for AI** to:

1. Define results from user intent
2. Decompose into sub-results
3. Generate screen definitions
4. Write CTA copy
5. Propose navigation flows

The AI becomes a co-designer operating from first principles.

---

## Summary

> **Every product is a journey to a result.**
> 
> **Every screen is a step toward a sub-result.**
> 
> **Every button is a promise of transformation.**
> 
> **Usability = Minimum screens × Minimum buttons × Maximum clarity.**

---

*Inspired by first-principles thinking and the spirit of Steve Jobs.*
