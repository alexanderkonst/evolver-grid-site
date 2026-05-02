# Top Talent PDF Revamp — Progress Tracker

*Module spec for the Day 58 (Sasha 2026-05-02) PDF refactor — bringing the downloadable artifact into structural + visual alignment with the new platform Top Talent profile.*

```
═══════════════════════════════════════════════════════════════════════════════
MODULE: Top Talent PDF Revamp                STARTED: 2026-05-02
STATUS: Phase 0 — DoD draft                  PROGRESS: ░░░░░░░░░░ 0%
═══════════════════════════════════════════════════════════════════════════════

INPUT (5 elements)
├─ [x] 1. ICP — Activation buyer ($37 paid customer who wants to feed the PDF to their AI for ongoing context)
├─ [x] 2. Transformation — From "screenshot of a web page that won't render outside the browser" → to "a portable artifact that captures the full deep profile + reads in the editorial register their identity is rendered in"
├─ [x] 3. Pain of A — Today's PDF: missing the deep profile fields; navy-banner header doesn't match the cream/gold platform; decorative glyphs render mangled; "with Aleksandr" still in CTA
├─ [x] 4. Dream Outcome — A clean editorial PDF that mirrors what they see on the platform; usable as AI context attachment
└─ [x] 5. Action — Click "Download Full PDF" button at bottom of /game/me/zone-of-genius

───────────────────────────────────────────────────────────────────────────────

PHASE 1: PRODUCT                                              [░░░░░░░░] 0%
├─ [ ] Master Result + Sub-Results
├─ [ ] Screens (= PDF pages/sections)
├─ [ ] Heart/Mind/Gut per screen
└─ [ ] 🔥 ROAST GATE 1

PHASE 2: ARCHITECTURE                                         [░░░░░░░░] 0%
├─ [ ] Data contract (new fields → PDF sections)
├─ [ ] Module boundary (generateZogPdf.ts surface area)
└─ [ ] 🔥 ROAST GATE 2

PHASE 3: UI                                                   [░░░░░░░░] 0%
├─ [ ] Visual rules (editorial register adapted for jsPDF)
├─ [ ] Glassmorphism translation strategy (the easy-way-out)
├─ [ ] Building blocks (cards, headers, ornament, gold pills)
└─ [ ] 🔥 ROAST GATE 3

PHASE 4: VIBE-CODING                                          [░░░░░░░░] 0%
├─ [ ] Refactor generateZogPdf.ts
├─ [ ] Wire glyph-stripping + sentence-case formatBullseye
├─ [ ] Verification (generate sample with Sasha's snapshot, screenshot back)
└─ [ ] 🔥 ROAST GATE 4

OUTPUT
├─ [ ] Re-styled, re-shaped PDF that matches the platform register
└─ [ ] Sasha downloads, hands to his AI, AI reads cleanly

═══════════════════════════════════════════════════════════════════════════════
```

*Tracker is intentionally minimal. Full DoD lives in Sasha's chat (Day 58 PDF revamp wave).*
