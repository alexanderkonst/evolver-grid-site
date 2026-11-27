# Template · Infographic card · v1.1 (2026-11-27)

How every card of *The Book of Psychoactive Infographics* (RU «Книга психоактивной инфографики») is made. The book's contents live in one place only: [docs/assets/infographics/BOOK.md](../assets/infographics/BOOK.md). Look and type: [docs/assets/infographics/README.md](../assets/infographics/README.md).

## Rule
A card gets its place in BOOK.md first, then it is drawn. One card = one entry. Nothing is kept elsewhere; other places link here.

### Title = the shift (first principle, Sasha, 2026-11-27 16:25 MST)
> «мне кажется лучше название, собственно весь инсайт в одной мысли, это же лучший исход от инфографики. Результат сдвига назван самыми крупными буквами!!!»

The best outcome of an infographic is the whole insight in one thought, and the result of the shift named in the biggest letters. This is the one source; the kit README, BOOK.md and course-update link here and do not restate it.

1. **The title is the whole insight as one complete thought** (a claim with a verb), the state AFTER the shift. "Life energy is received, not only generated", "You are a river, not a battery", "Excitement is your body's compass". Not a topic or a name ("The Bashar Formula", "Energy").
2. **The title is the largest type on the card.** Nothing else competes with it.
3. **The topic, source or series name moves to the eyebrow** ("BODY · THE BASHAR FORMULA").
4. **One insight per card.** When a card carries two insights, split it into two cards («not a battery: надо этот инсайт в отдельную инфографику»).
5. **Caption = how / why in one or two lines;** it never repeats the title.
6. **Self-check before render:** someone who reads only the title gets the shift. If not, rewrite the title.
7. **Icons (iconography): the same rule in picture form.** The "after" side is the shift; the icon's spec names that shift in one phrase (`shift:` field, [kit README → App icons](../assets/infographics/kit/README.md#app-icons)).

Worked example, ADP Body (2026-11-27): B01 "Excitement is your body's compass"; B02 "Life energy is received, not only generated"; B03 "You are a river, not a battery" (split out of B02 on Sasha's word).

Existing cards keep their titles until they are edited; a card that is edited, or newly made, follows the rule (as in the kit's "Migrating a card").

## Taxonomy (nested, in reading order)
1. **Fund** (архивный фонд): a part of the book, along the path a reader lives through. Roman numeral.
2. **Scheme** (схема): one card. Number inside its fund.
3. **Subscheme** (подсхема), only when needed: a card that unfolds one key of its scheme. Letter.

ID: `<Fund>.<Scheme>[.<subscheme>]`, e.g. `VI.02`, `VI.02.a`. Order in BOOK.md = order of reading.

## Contents → content
BOOK.md opens with the contents (every ID and title, in order), then one entry per card:

```
### <ID> · <Title>
- Subtitle: one line, what the picture does to the reader
- Prism: <number> · <form>   (the numeric prism: 1 point, 2 poles, 3 triad, 4 quadrants, 6, 7, 12 …)
- Scheme: what is drawn, in words, with its keys
  - key 1: label, meaning
  - key 2: label, meaning
- Notes: sources (doc, Phase Shift Technology #), caveats, open questions
- Tags: audience (client · guide · builder · public) · face (game · product · module) · privacy (public · private)
- Status: idea · draft vN · approved · published
- File: path to the PNG / script
```

## Privacy
Client books (e.g. a client's own crossing) never enter the public BOOK.md; they keep the same entry format in evolver-private-ledger, and BOOK.md only names that they exist.

## Versioning
Holonic: BOOK.md has its own version; a card's version lives in its Status line; this template has its own version. Change log at the end of each file.

## Changelog
- v1.1 (2026-11-27): first principle added under Rule, "Title = the shift" (title is the whole insight as a claim with a verb, largest type; topic to the eyebrow; one insight per card; caption never repeats the title; self-check; icons carry a `shift:` phrase). Source: Sasha, 2026-11-27 16:25 MST; issue #568; worked example ADP Body B01–B03.
- v1.0 (2026-11-17): first version, from Sasha's request (fund → scheme → subscheme; contents → content: title, subtitle, numeric prism, scheme with keys, notes).

---
Template: infographic v1.1 · Version: docs patch · Shift check: the title names the shift
Template change: infographic v1.0 → v1.1: rule "Title = the shift" added under Rule (issue #568)
