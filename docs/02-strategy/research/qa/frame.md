# Frame: QA and testing for FYTT / The Game of Being You (2026-11-27)
Domain (function): how a tiny team (Sasha + Hark + coding agents) finds what breaks or confuses players before they meet it, proves something is ready, rehearses real exposure, breaks things on purpose, watches after release, and learns from every failure so it does not recur.
Target whole: the QA practice of findyourtoptalent.com (template docs/templates/qa-testing.md). Above: player trust and return. Below: qa-pass.md (per-PR automated pass, Playwright+axe), roasting.md (critique), spec-handoff DoD, live 3-second test (5 first-timers, San Pancho).
Constraints: no human QA staff; agents do most work; tokens scarce; core flows (title, intro, reveal, themes, game entry) change only on Sasha's yes; tiny user base (few real players) so telemetry stats are weak.
Acceptance walk: a fresh agent, given only the template, can take a new feature from spec to live and to post-mortem, catching a broken first-use path before any player does, and leave behind a regression test + a checklist line for each failure.
Thresholds: invariant = present in ~70% of exemplars across all clusters but one; 5-9 core invariants.
Out of scope: security pentesting depth, compliance/legal QA, hardware QA.
