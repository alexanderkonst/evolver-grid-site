# Appleseed Methodology: Roasting Protocol

> This document describes the iterative refinement process that transforms raw AI output into high-signal Appleseed.

---

## The Problem

First AI output = accurate but not amplified.
- Contains the right information
- But lacks vibrational precision
- May have generic language
- May miss archetypal naming

---

## The Solution: Adversarial Refinement (Roasting)

The roasting protocol applies constructive critique loops that:
1. Surface what's generic or flat
2. Identify where signal is diluted
3. Force re-articulation at higher precision
4. Compound improvements across rounds

---

## The 4-Step Roasting Cycle

Each cycle contains 4 steps:

### Step 1: Initial Roast
```
"Please roast this result from a place of tough love.
What's generic? What's imprecise? Where did you play it safe?"
```

### Step 2: Deepen the Critique
```
"Please continue roasting — no fixing or improving yet.
Just another round of roasting with tough love."
```

### Step 3: Meta-Roast (Roast the Roast)
```
"Now please roast your own roast.
Still no fixing or improvement. What did your critique miss?"
```

### Step 4: Synthesize Improvements
```
"Now with all of this constructive feedback,
please produce the next iteration of the result."
```

---

## Cycle Repetition

| Rounds | Signal Quality |
|--------|----------------|
| 1-2    | Initial refinement, major issues addressed |
| 3-4    | Deep polish, subtle improvements |
| 5+     | Diminishing returns (if done correctly) |

Typically: **3-5 complete cycles** produce sufficient signal.

---

## Signal Integrity Check

After each cycle, ask:
- Is the signal amplified? (More precise, more resonant?)
- Is noise avoided? (No new generic language introduced?)
- Does the person recognize themselves? (The ultimate test)

---

## Implementation in Software

### Option A: Manual Cycles (V1)
User sees initial output → clicks "Refine" → AI runs roasting internally → shows improved version

### Option B: Automated Pipeline (V2)
```
raw_signal 
  → generate_initial_appleseed()
  → roast_cycle(1)
  → roast_cycle(2)
  → roast_cycle(3)
  → final_appleseed
```

All roasting happens server-side. User sees only the final result.

### Option C: Visible Refinement (V3)
User watches the refinement in real-time:
1. Initial Appleseed appears (grayed)
2. "Refining your essence..." 
3. Watch sections update with improvements
4. Final version crystallizes

---

## Roasting Prompt Template

For automated implementation:

```typescript
const ROASTING_PROMPTS = {
  step1: `You are a tough-love editor reviewing an Appleseed.
Roast this result: What's generic? What's imprecise? 
Where is the vibrational key weak? Where does the language fall flat?
Be specific. Be constructive. Be fierce.

Appleseed to roast:
{appleseed}`,

  step2: `Continue roasting. No fixes yet.
What else is wrong? What nuance did you miss?
Where is the signal still diluted?`,

  step3: `Now roast your own roast.
What did your critique miss? Were you too soft anywhere?
What's the deepest issue you haven't named?`,

  step4: `Now synthesize all this feedback.
Produce the next iteration of the Appleseed.
Keep what was strong. Fix what was weak.
Amplify the signal. Cut the noise.`
};
```

---

## Quality Gates

Before declaring Appleseed complete:

- [ ] Unique Vibrational Key is not generic (passes uniqueness check)
- [ ] Three Lenses are specific to this person
- [ ] Life Scene is sensory and embodied
- [ ] Monetization Avenues are concrete
- [ ] Elevator Pitch has no filler words
- [ ] Person would recognize themselves instantly

---

## AI Model Strategy

### Phase 1: Lovable Built-in (Current)
- Use Lovable's Gemini Flash 2.5 (or equivalent)
- Compose prompts that Lovable can pass to its AI
- Handles basic generation + 1-2 roasting cycles

### Phase 2: API Integration (Future)
- Direct OpenAI / Claude API calls
- More control over temperature, system prompts
- Full 3-5 cycle automated pipeline
- Higher quality, more consistent output

---

*This methodology ensures each Appleseed reaches production quality through structured adversarial refinement.*
