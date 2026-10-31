> Its production method is synthesized into docs/templates/course-from-source.md (2026-10-27). This file is kept as a source.

# Video Production Plan — NotebookLM → YouTube → Platform

> **Created:** 2026-02-05
> **Last Updated:** 2026-02-05 15:42 GMT+8
> **Status:** 🔄 In Progress — Module 1 of 36
> **Goal:** Generate video overviews for all micro-modules and deploy to platform

---

> **2026-10-26:** course renamed **Activate Your Dormant Potential** (mini-course; tagline: how to master your spirit, mind, emotions, body and unique genius). Earlier working titles dropped; seasons are called modules; 6 modules, 38 episodes, 1:17:47; module 6 = Genius / Uniqueness; Emotions = 4 episodes (E01E01 The Emotional Slider). Final list + transcripts: `activate_your_dormant_potential_transcripts.md`.

## 🧭 Course-from-Source Template

Moved to [docs/templates/course-from-source.md](../templates/course-from-source.md) (2026-10-27).

## 🧭 Course-from-Source Application 2: "Consciousness Meets Science" (Mystery School intro) — draft, awaiting Sasha
Source: Sasha's Medium article *Consciousness Meets Science: How Inner Experiences and Science Co-Reveal the Nature of Reality* (EN; RU version «Сознание и наука» on the same Medium). The article already carries its structure; Step 1 = adopt it, Sasha adjusts.
Season code **C** (Consciousness). ~15 episodes, ~27 min total.

**Core idea, the paradigm shift the whole article rests on (Sasha, 2026-10-27):** historically, mystics were the ones who found the new and pushed the edges of what we know about the world. Then science arrived, pushed mysticism out and cast it into ostracism, and forgot that insights come from within first, and only afterwards are shaped, formalized, proven and applied. Humanity got confused and lost its direction. What is happening now is the return of mysticism to its original role: expanding the edges of the known about the Universe and about the present moment. Every module serves this idea; the course opens and closes on it.

| Module | Episode | Idea (article section) |
|---|---|---|
| 1. Two sides of one coin (Foundational, Sasha writes) | C01E00 | Mystics first: insight is born within, then science shapes, proves and applies it; why we lost direction and why mysticism returns |
| | C01E01 | The thesis: inner experience and science co-reveal reality; the invitation |
| | C01E02 | Inner experience as data: first-person truth, why it can't be fully relayed |
| 2. Eight shared experiences | C02E01 | Sacred geometry visions · expanded, interconnected awareness |
| | C02E02 | Third-eye vision and intuitive insight · enhanced bodily awareness |
| | C02E03 | Receiving messages · the spiritual heart as a pulsating point |
| | C02E04 | Tunnels and wormholes · being a toroidal field |
| 3. Paths in | C03E01 | Four doors: vision quest, psychedelic renaissance (with safety), meditation, NDE and spontaneous awakening |
| | C03E02 | Public voices (Jim Carrey, Russell Brand, Tony Robbins): you are not alone |
| 4. Science that rhymes | C04E01 | Holographic principle, fractals and scale invariance, complexity and emergence |
| | C04E02 | Quantum fields and entanglement; strings as hypothesis |
| | C04E03 | Neuroscience of meditation; philosophy of mind (panpsychism, IIT, Orch-OR) |
| 5. An integral theory of everything | C05E01 | The Integral Map of cutting-edge sciences (4 domains) |
| | C05E02 | The meta-model: Planck "pixels", toroidal dynamos, zero-point field, holonic whole |
| | C05E03 | Implications and call: the mystic's role returns, and it is yours; experience it yourself (Outro → live Fire Circle evening) |

Open for Sasha: final structure; who writes Module 1; episode count; RU, EN or both.

**Ready-to-load episode texts + NotebookLM prompts (EN, 15 episodes, 2026-10-27):** `consciousness_meets_science_course.md`.

## 🧭 Course-from-Source Application 3: "Activation of Inner Vision" (advanced micro-course, unlocks after Integral Mystery School) — draft, awaiting Sasha
Source: Sasha's paper *27-Perspective Vision* (/27, `src/pages/IntegralTheoryUpgrade1.tsx`, v1.2). Season code **V** (Vision). 3 modules, 9 episodes, ~15–18 min. Structure follows the paper's own arc (Sasha, 2026-10-30): The Twelve (two axes, 12 dimensions, the 13th) → The Octave (14–25, the 26th, the 27th) → The Landing (descent octave, the instrument, the act). No price shown for now.
Episode texts, prompts and word counts: `activation_of_inner_vision_course.md`. Course data: `src/data/courses/activationOfInnerVision.ts` (ids `TBD` until upload). Page: `/grow/activation-of-inner-vision`.

---

## 🎬 Naming Convention (TV Series Style)

### Format
```
F01E04 — Five Paths of Growth — Planetary OS v1.0
│  │
│  └── Episode number within season
└───── Season code: F=Foundational, S=Spirit, M=Mind, E=Emotions, B=Body, G=Genius
```

### Season Codes
| Code | Path | Episodes |
|------|------|----------|
| **F** | Foundational | F01E01 – F01E07 (7 episodes) |
| **S** | Spirit | S01E01 – S01E10 (10 episodes) |
| **M** | Mind | M01E01 – M01E05 (5 episodes) |
| **E** | Emotions | E01E01 – E01E05 (5 episodes) |
| **B** | Body | B01E01 – B01E03 (3 episodes) |
| **G** | Genius | G01E01 – G01E06 (6 episodes) |
| **V** | Activation of Inner Vision (advanced micro-course) | V01E01 – V03E03 (9 episodes) |

### Examples
- `F01E04 — Five Paths of Growth — Planetary OS v1.0`
- `S01E04 — Conscious Breath — Planetary OS v1.0`
- `M01E01 — What is Mind — Planetary OS v1.0`

---

## 📊 Progress Dashboard

### Overall Status
| Metric | Count | Progress |
|--------|-------|----------|
| Source Files Ready | 22/36 | ████████████░░░░░░ 61% |
| Notebooks Created | 1/36 | █░░░░░░░░░░░░░░░░░ 3% |
| Videos Generated | 0/36 | ░░░░░░░░░░░░░░░░░░ 0% |
| YouTube Uploaded | 0/36 | ░░░░░░░░░░░░░░░░░░ 0% |

### Current Session Progress
```
🔄 ACTIVE: F01E04 — Five Paths of Growth
   Step: [3/8] Configuring Video Overview
```

---

## 📋 DETAILED WORKFLOW — Per Module (8 Steps)

Each module goes through these exact steps:

| Step | Action | Duration | Automation |
|------|--------|----------|------------|
| **1** | Create new notebook in NotebookLM | ~10 sec | ✅ Automated |
| **2** | Paste source text from file | ~15 sec | ✅ Automated |
| **3** | Click "Insert" to add source | ~5 sec | ✅ Automated |
| **4** | Rename notebook (F01E04 format) | ~10 sec | ✅ Automated |
| **5** | Open "Customize Video Overview" | ~5 sec | ✅ Automated |
| **6** | Select "Custom" style + enter Bio-Light prompt | ~20 sec | ✅ Automated |
| **7** | Enter AI Host Focus prompt | ~15 sec | ✅ Automated |
| **8** | Click "Generate" → **DON'T WAIT** → next module | ~5 sec | ✅ Automated |

**Total active time per module: ~85 seconds**
**Generation time (background): 10-20 minutes**

---

## 🎨 Video Configuration Prompts

### Custom Style Prompt (same for all)
```
Bio-luminescent, iridescent pastel gradients on dark background. 
Organic, alive, breathing aesthetic. Sacred geometry subtle accents.
Soft glowing light effects. Mysterious yet inviting.
```

### AI Host Focus Template
```
Focus on the practical transformation message. 
Keep it direct, warm, and precise.
[MODULE-SPECIFIC CONTENT — e.g., "Explain how the five paths reinforce each other synergistically"]
Maximum 90 seconds. Educational but inspiring tone.
```

---

## ✅ MASTER CHECKLIST — All 36 Modules

### Legend
| Icon | Meaning |
|------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Complete |
| ❌ | Error/retry needed |
| ⏳ | Waiting (generation in progress) |

---

### 🟢 SEASON F: Foundational Training (7 episodes)

| Episode | Title | Steps 1-4 | Step 5-7 | Step 8 | Download | YouTube |
|---------|-------|-----------|----------|--------|----------|---------|
| **F01E04** | Five Paths of Growth | ✅ | 🔄 | ⬜ | ⬜ | ⬜ |
| **F01E05** | Body Path Defined | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **F01E06** | Emotions Path Defined | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **F01E07** | Mind Path Defined | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **F01E08** | Genius Path Defined | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **F01E09** | Spirit Path Defined | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **F01E10** | Balanced Growth | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

### 🟣 SEASON S: Spirit Path (10 episodes)

| Episode | Title | Steps 1-4 | Step 5-7 | Step 8 | Download | YouTube |
|---------|-------|-----------|----------|--------|----------|---------|
| **S01E01** | What is Spirit? | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E02** | Noticing Present Moment | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E03** | Noticing Quality | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E04** | Conscious Breath | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E05** | Heart Opening Protocol | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E06** | Meta-Awareness | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E07** | Decision Making by Feeling | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E08** | Intuitive Knowing | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E09** | What Meditation Really Is | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **S01E10** | States of Consciousness | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

### 🔵 SEASON M: Mind Path (5 episodes)

| Episode | Title | Steps 1-4 | Step 5-7 | Step 8 | Download | YouTube |
|---------|-------|-----------|----------|--------|----------|---------|
| **M01E01** | What is Mind? | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **M01E02** | Stages of Development | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **M01E03** | Recognizing Your Stage | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **M01E04** | Growing to Next Stage | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **M01E05** | Cognitive Distortions | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

### 🟡 SEASON E: Emotions Path (5 episodes) ⚠️ SOURCE FILES NEEDED

| Episode | Title | Source | Steps 1-4 | Step 5-7 | Step 8 | Download | YouTube |
|---------|-------|--------|-----------|----------|--------|----------|---------|
| **E01E01** | What Are Emotions? | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **E01E02** | Emotional Patterns | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **E01E03** | Processing Emotions | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **E01E04** | Working with Intense Emotions | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **E01E05** | Emotional Mastery | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

### 🟠 SEASON B: Body Path (3 episodes) ⚠️ SOURCE FILES NEEDED

| Episode | Title | Source | Steps 1-4 | Step 5-7 | Step 8 | Download | YouTube |
|---------|-------|--------|-----------|----------|--------|----------|---------|
| **B01E01** | What is Body? | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **B01E02** | Body Foundations | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **B01E03** | Reading Your Body | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

### 🔴 SEASON G: Genius Path (6 episodes) ⚠️ SOURCE FILES NEEDED

| Episode | Title | Source | Steps 1-4 | Step 5-7 | Step 8 | Download | YouTube |
|---------|-------|--------|-----------|----------|--------|----------|---------|
| **G01E01** | What is Genius? | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **G01E02** | Discovering Unique Gift | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **G01E03** | Articulating Genius Offer | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **G01E04** | The Masks We Wear | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **G01E05** | Authentic Expression | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **G01E06** | Genius in Full Expression | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 📹 YouTube Metadata Template

### Title Format
```
F01E04 — Five Paths of Growth — Planetary OS v1.0
```

### Description Template
```
Episode [X] of [Season Name] in the Planetary OS Transformation Curriculum.

[Brief 1-sentence summary of the module]

Part of the Foundational Training for human potential activation.

🌍 Learn more: https://evolver.space
📚 Full curriculum: [link to come]

#PlanetaryOS #PersonalGrowth #Transformation #HumanPotential
```

### Tags
```
planetary os, personal growth, transformation, human potential, 
self development, consciousness, [path-specific tags]
```

---

## 📝 Execution Log

### Session 1: 2026-02-05 15:00-??:??

| Time | Module | Step | Action | Status |
|------|--------|------|--------|--------|
| 15:20 | F01E04 | 1 | Create new notebook | ✅ |
| 15:21 | F01E04 | 2 | Paste source text | ✅ |
| 15:22 | F01E04 | 3 | Insert source | ✅ |
| 15:23 | F01E04 | 4 | Rename notebook | ✅ |
| 15:24 | F01E04 | 5 | Open Video Overview dialog | 🔄 |
| 15:?? | F01E04 | 6 | Select Custom style | ⬜ |
| 15:?? | F01E04 | 7 | Enter focus prompt | ⬜ |
| 15:?? | F01E04 | 8 | Click Generate | ⬜ |

---

## 🔧 Pre-requisites

- [x] Browser Relay extension installed
- [x] NotebookLM logged in
- [x] YouTube logged in (alexanderkonst@gmail.com)
- [ ] Create missing source files (14 needed: E1-E5, B1-B3, G1-G6)
- [ ] Create download folder for videos

---

## 🎯 Current Task Queue

1. **NOW:** Finish F01E04 Video Overview configuration (Steps 5-8)
2. **THEN:** Continue batch creation for F01E05 → F01E10
3. **THEN:** Continue with S01E01 → S01E10
4. **THEN:** Continue with M01E01 → M01E05
5. **PARALLEL:** Create missing source files during generation wait time
6. **HARVEST:** Return to download all generated videos (~20 min after last generation triggered)
7. **UPLOAD:** Batch upload to YouTube with correct naming

---

*Plan version 2.0 — Updated 2026-02-05 15:42*
