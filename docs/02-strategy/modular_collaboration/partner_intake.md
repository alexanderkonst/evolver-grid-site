# Partner intake form · «Bring your module»

v1 spec · 2026-11-22 · Hark. Roadmap step 2 («Модуль 2 простыми словами», approved 2026-11-22). Terms come from [partner_offer.md](./partner_offer.md) v2.1; data shape from the module registry `src/data/modules.ts` (PR #379).

## Status
**Short form v2 live (unlinked), 2026-11-22 22:00 MST:** https://findyourtoptalent.com/bring-your-module · issue #404, PR #407 (squash ff52ab9). Four fields (name, email, project link, optional note) + social contract checkbox; maps onto `partner_submissions` with no migration (`project_name` = hostname, one `modules` entry kind `unread`, source `short-form-v2`). Table `partner_submissions` deployed; test row «Hark test» saved 2026-11-23 04:58 UTC. Edge function `notify-partner-submission` deployed via Lovable (1.7 credits) and called after each insert, **Signal now goes to Telegram (2026-11-25):** issue #462, PR #464 (squash 7af5762), redeployed via Lovable (~0.6 credits); each submission sends Sasha a Telegram message «New partner: <host>» through the existing bot (TELEGRAM_BOT_TOKEN, TELEGRAM_FOUNDER_CHAT_ID). Test call 2026-11-25 returned telegram: true. Email is a best-effort second channel and still fails (Resend 403: notify.findyourtoptalent.com not verified); it waits for the DNS records in GoDaddy. Earlier: v1 form, issue #383, PR #386 (de76d8b).

## What it is
One page where a partner brings their project into the game by themselves. Stage 1 is partly manual: the form collects everything, Hark turns each submission into module cards by hand, the partner confirms. No AI drafting yet (needs a budget, Sasha's yes).

## Where
Route `/bring-your-module`. Not linked from any screen. It becomes reachable when the two-door public page goes live (publish = Sasha's yes). No change to the start screen, intro, Academy or other game screens.

## Fields (English)
**About you:** name; email; project name; project link.
**Your modules** (one or more, «add another»):
- What it is: course · product · session · community · whole ecosystem. Drives the place by the placement rule: course → Academy, product → Market, session → Mastermind, community → Mastermind, whole ecosystem → «own building, by our decision».
- Title.
- One result it gives, in one sentence.
- Price (free text: «$300», «free», «from $50/month»).
- Link where people buy or join it.
- Referral parameter your site reads (default `ref`; option «my site can't read referral links yet»).

**Social contract** (one required checkbox, wording from partner_offer.md): «When the game brings me a buyer, 10% of that sale goes to the game as a gift. No contract, only our word. I'll report monthly how many buyers came from the game.»

Spam guard: hidden honeypot field; no captcha.

## After submit
- A row in a new table `partner_submissions` (status `new`), anyone can insert, nobody but the service role can read.
- Thank-you screen: «Thank you. We'll draft your module cards and send them to you to confirm. Nothing goes live without your yes.»
- Each module gets a referral id `fytt-<project-slug>` and a registry entry `source: "partner"`, `integrationLevel: 0`, `place` by the rule above, `status` not live until the partner confirms.
- Until the table is deployed (migration goes through Lovable, Sasha's yes), the form falls back to a prefilled email to the site's contact address, so it never dead-ends.

## Open
- Who answers partners (confirmation email with their cards): Sasha writes, or Hark from the game's address. Needed before launch, not before the build.
- Wallet address goes into the checkbox text when the public text is approved.
- Privacy: partner contact data stored indefinitely; note in the accountant/lawyer check.
