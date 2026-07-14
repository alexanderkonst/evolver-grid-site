# Spec: Warm-base email drafts (for Codex or any executor agent)

Goal: produce ready-to-send personalized Gmail drafts for Sasha's warm base. Output must require ZERO writing from Sasha, only review + send.

## Inputs
1. `docs/warm_base_platform_users.csv` — 33 platform users: email, display_name, signup_date, talent_reveal_completed, top_talent, last_activity.
2. `docs/02-strategy/warm-base/superpower_responses.csv` — Google Form export of past "Superpower discovery" participants (name, email, their answers describing their superpower IN THEIR OWN WORDS). ← Sasha to place here.

## Rules
- Deduplicate across both files by email (platform row wins for freshness; keep the superpower words from the form if present).
- Exclude: any @findyourtoptalent/admin/test/+alias addresses.
- Personalization, in priority order:
  a. If superpower/talent words exist → open with them, quoted or closely paraphrased: "When we worked together, you named [their words]."
  b. If platform user with top_talent → "You revealed [top_talent] on the platform."
  c. If neither → generic-warm variant (template B).
- Language: match the person's likely language (Russian name/answers → Russian email; else English).
- NO em-dashes anywhere. Plain human sentences. One CTA only.

## Template A (has their words) — EN
Subject: Your [top talent / their words, 2-4 words] — and what's next

Hi [Name],

Sasha here. When we worked together, you named [their superpower words]. I still remember it, and I'm writing because that work grew into something much more complete.

I now help people name what's next professionally and package it into a real offer, with AI doing the heavy lifting. Real clients, real businesses launched since.

I'm opening a few free 45-minute Direction Calls. You leave with your transition named and your strongest next direction on the table. Practically everyone does.

If this lands for where you are right now, grab a time: https://cal.com/aleksandrkonstantinov/direction-call
If not, all good. Happy to be back in touch either way.

Aleks

## Template B (no words on file) — EN
Same body, but the opener: "Sasha here. A while back you did the superpower discovery with me / created your profile on FindYourTopTalent. A lot has grown since."

Russian variants: faithful, ты/вы judged per person (default вы for form-era contacts), same structure, no em-dashes.

## Output (choose per executor capability)
1. `docs/02-strategy/warm-base/drafts.csv` with columns: email, name, language, subject, body. AND
2. `docs/02-strategy/warm-base/create_drafts.gs` — a Google Apps Script that reads the drafts from an inlined JSON array and calls GmailApp.createDraft(to, subject, body) for each. Sasha pastes it into script.google.com, runs once, and all drafts appear in his Gmail for review + send.

## Acceptance
- Every row personalized per rules; no duplicate emails; no test accounts.
- Sasha's review step: open Gmail drafts folder, skim, send. Nothing else.
