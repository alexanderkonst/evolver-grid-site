# Module 2 · Phase 1: The Connector

Draft v2 · 2026-11-21 · rebuilt from Sasha's voice note (12:42 CST) on top of v1. Nothing sent or published. Part of [Module 2](./README.md); canon: [golden_age_canon.md](../golden_age_canon.md) Face 2.

**180° wording (2026-11-21):** the shift stays, the words change: not «buy from me» but «let's connect our systems, my players will come to you». The old line «can I incorporate into your system» reads as joining and is retired.

## Summary for decision

- **Essence:** a connector between two systems, so players from the game can easily enter a partner's ecosystem, stay as long as they want and buy what they want. Not «I join you» and not «you join me»: a link between systems, which deepens step by step along an integration roadmap.
- **What it gives partners:** a flow of clients, sized by how many people play. **What it gives the game:** a growing library of modules (courses, practitioners, products) without building them.
- **Model:** a partner model, closest to Linux Foundation and Red Hat: an open core (the game and its operating system) with many modules around it, possibly several cores connecting to each other.
- **Simplest start:** a hyperlink redirect with attribution. Very easy to build, gives partners clients from day one.
- **Decision from you:** the commission on attributed sales at level 1 (section 5), and whether to offer partners the roadmap or two fixed variants.

## 1. What a connector is

Imagine a founder like you: their own code, their own decisions, a community, products that sell, clients, terms, a codebase and documentation. Their understanding of who it is for and what transformation it gives may be clear or still forming. That does not matter, because any AI can read the codebase and documents and write the description.

So the connector has two parts:

1. **Description.** Read a project (codebase, docs, site) and decompose it into modules. Each module gets a card that says what it is, for whom, what result it gives, and where and how it plugs in.
2. **Link.** The actual path a player takes from the game into that module, and back.

Consequence: our AI can already find people's projects, describe them as modules and prepare an integration proposal for each. Any message to a person goes out only with your yes; on LinkedIn you write yourself.

## 2. Module card

1. Name and owner
2. Kind: course · practitioner service · product · tool · community
3. For whom (who arrives) and the result (what they leave with)
4. Where it plugs into the game: which space (e.g. a course sits in the Academy among other courses)
5. Entry point: URL, and later API or embedded view
6. Price, who takes the money
7. Attribution: how a game-referred client is recognised
8. Integration level today (section 4) and the next level available
9. Source: what the description was read from, and when

## 3. How it looks for the player

A player enters a game space, say the Academy, and sees courses. A course from our platform opens as it already does. A course from a partner moves the player into another module: it looks different, and another person takes the money. The player can always come back and see other courses. With URL-level integration of websites it feels like one game; it need not be one game, because the point may be exactly that the game takes mods and modules.

## 4. Integration roadmap (simplest to deepest)

| Level | What it is | Effort | Gives the partner |
|---|---|---|---|
| 0. Link | Card in the right game space, hyperlink redirect with a referral id | Hours | Clients from day one |
| 1. Return path and attribution | Way back into the game, sales reported per referral id | Days | Clear numbers, basis for commission |
| 2. Payment integration | Purchase smoothed inside the flow, split handled automatically | Weeks | Higher conversion |
| 3. Shell | Their system lives inside the game shell, or a version of their ecosystem lives inside the game | Weeks to months | Players never feel a jump |
| 4. Shared profile | The high-precision profile from the game passes at entry: they recommend the most useful simple start, their profile is created from it, or one profile serves both | Months | Personalised entry, interoperability |

Two ways to offer it: the full roadmap («start at 0, grow as it pays»), or two fixed variants («link» or «inside the shell»). My pick: the roadmap, starting everyone at level 0. Certainty: likely (55–80%).

## 5. Attribution and terms

Attribution at level 0 is simple: we know who clicked the link. Each partner link carries a referral id per player; partners report sales against it (level 1 automates that).

Terms already exist in the canon (found 2026-11-21, see [launch_from_corpus.md](./launch_from_corpus.md)); no new menu is needed:
- **Partner sells on their own site (levels 0–1):** commission-only, 10% of what each client who arrives through the game pays them; no clients, nothing to pay. Sasha, 2026-11-02: «ЭТО НАША СТРАТЕГИЯ» ([matchmaker_brief_v5.1.md](../briefs/matchmaker_brief_v5.1.md), «Build in the village»).
- **Sold through our checkout (level 2+):** the hosted split, author 66.6% / platform 33.3% when the game brought the buyer, 90% / 10% when the author did ([monetization_strategies.md](../monetization_strategies.md) §6, decided 2026-10-30).
- Spirit: [the_three_terms.md](../../05-reference/the_three_terms.md): «The gift is free. The system is paid. The name is permanent.» No equity, no pooled funds.
- Self-serve acceptance model: the Distributor Agreement's «nothing to sign on day one, the act of going commercial is the act of accepting».

Needed from Sasha: confirm 10% as the one line in the launch message (Hark's pick, likely), and whether to add a time bound per client (Three Terms prefers revenue share «bounded in time and project»).

## 6. Interoperability questions (open)

- One profile across systems or a profile per system with a handshake?
- What the game passes to partners about a player, with the player's consent.
- How several cores connect to each other (core to core, two AIs exchanging automatically).
- Whether partners can add their own game spaces, not only cards.

## 7. Against

Level 0 is only a link; if few people play, partners see little flow and the offer feels empty. The connector's value grows with the number of players, so the game's traction comes first.

## Related in the corpus
- [module-form.md](../../templates/module-form.md): existing module form template
- [ecosystem-offer.md](../../templates/ecosystem-offer.md): proposal that fits a partner's mission
- [collaboration_spectrum.md](../collaboration_spectrum.md): 11 readiness stages
- [community_whitelabel_spec.md](../community_whitelabel_spec.md): partner skins (level 3)
- [ai_matchmaker_brief.md](../ai_matchmaker_brief.md), [matchmaking_strategy.md](../matchmaking_strategy.md): person-to-person matching; project profiles parked in §7

## Next
- Phase 2 landing «bring your module»: how the industry builds partner and app-marketplace pages, then a draft.
- A sample: describe one real external project as module cards to test the card (needs your pick of the project).
