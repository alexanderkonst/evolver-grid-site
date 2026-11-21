# Module 2 · Launch plan (plan v3)

v1 · 2026-11-21 · Hark. Replaces plan v2 in [README.md](./README.md). Built from [launch_from_corpus.md](./launch_from_corpus.md) and Sasha's launch note (2026-11-21 13:29). Taken as accepted from Sasha's «Отлично» (12:44 MST): terms line 10%, one public page with two doors.

## Goal

One epic launch: one message from Sasha to many people at once. Partners connect their projects on their own on simple terms; players enter the game; Sasha learns what happened without asking anyone. Stage 1 may be partly manual.

**Done when:** a stranger can go from the message to a live partner module in the village with a working referral link, with no one touching it except one review click, and Sasha gets a daily line of who connected and who came through.

## Fixed inputs (from the canon)

- Terms: «10% of what each client who comes from the game pays you. No clients, nothing to pay.» (Sasha 2026-11-02, brief v5.1). Sold through our checkout later: 66.6 / 33.3 (monetization §6).
- Acceptance: nothing to sign; listing your module is accepting (Distributor Agreement v0.6).
- Tone: inform and inspire, no urgency, everyone keeps their own way out (brief v5.1).
- 180° line: «let's connect our systems, my players will come to you».

## Phases

Each phase starts on Sasha's «да». Gate marks what needs his explicit yes beyond that.

| # | Phase | What comes out | Who builds | Gate | Depends on |
|---|---|---|---|---|---|
| L1 | **Partner offer** (draft: [partner_offer.md](./partner_offer.md)) | One-page partner terms: 10%, attribution window, how payment is reported at stage 1, exit, quality bar, what we never do with their data | Hark (doc) | Sasha approves the text | — |
| L2 | **One module registry** (issue opened 2026-11-21) | The five module lists in code merged into one; partner fields added: owner, payee, referral rule, integration level, source | Claude issue → Hark merges | Not a core flow; Hark's zone | — |
| L3 | **Self-serve intake** | «Paste a link to your project» → our AI drafts module cards in the 9-field form → partner edits and confirms → review queue (stage 1: one manual click) | Claude issue | AI calls cost money: Sasha's yes on the model and budget | L2 |
| L4 | **Partner modules in places + attribution** | Partner modules shown inside the existing place that fits them (course → Academy, product → Market, session → Mastermind), visible to guests, with the partner link carrying a referral id; outbound clicks logged | Claude issue | Changes what a guest sees: Sasha's yes on the exact screen | L2 |
| L5 | **Public page, two doors** | «Play» and «Bring your module», terms in one line, live module rows from the registry | Hark + Claude | Publish only on Sasha's yes | L1, L3, L4 |
| L6 | **Dry run** (done by hand: [dry_run_planetir.md](./dry_run_planetir.md)) | One real external project taken through L3–L4 end to end, nothing sent to its owner (this replaces old P3) | Hark | Sasha picks the project | L3, L4 |
| L7 | **Launch message and list** | Recipients: email list via bulk tool (200 per send, opt-out), LinkedIn connections, partners/ docs, the 8 «elephant builders». Message: Sasha writes; Hark drafts only if asked | Sasha + Hark | Sending is Sasha's | L5, L6 |
| L8 | **Know automatically** | Daily line to Sasha: new partners, new modules, clicks out, players in; stage-1 review queue | Hark | Turning on a recurring report: Sasha's yes | L4 |
| L9 | **After launch** | Level 1 (return path, partner sales report), then level 2 payment split via Stripe Connect | Claude | Stripe is off-limits until Sasha lifts it | L8 |

Parallel to the launch, on Sasha's call: thought-leadership series (meaning of «SHOGUN 8 eps» still open) and session exchange (his list).

## Placement rule (Sasha, 2026-11-21 12:52: «именно»)

A partner module goes into the existing village place that fits its meaning: a course into the Academy, a product into the Market, a session into the Mastermind. A separate building only for a whole ecosystem (like Planetir), and only by Sasha's decision. This replaces «a building of their own» from brief v5.1 for partner modules.

## Order and time (estimate)

L1 and L2 start together (about 1–2 days). Then L3 and L4 in parallel (about 3–5 days with Claude). L5 and L6 next (about 2 days). L7 when Sasha sets the date. Total to launch-ready: about 1.5–2 weeks of work, likely.

## Risks

- **Empty village:** few players means little flow for partners. Counter: the message invites players and partners together; the dry run shows a real partner module.
- **Terms as opener:** the canon says terms close, not open. Counter: lead with the invitation, terms one line.
- **Low-quality listings:** self-serve lets anyone in. Counter: AI check plus one manual click at stage 1.
- **Partner data:** cards from unreleased work never go to the public repo.

## Open for Sasha

1. «Да» to start L1 + L2 now.
2. Budget for AI card drafting in L3 (model and monthly cap).
3. Which project for the dry run (L6).
4. Time bound on the 10% per client (Three Terms prefers bounded), or none.
