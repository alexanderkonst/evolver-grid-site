# Template · Infographic card · v1.0 (2026-11-17)

How every card of *The Book of Psychoactive Infographics* (RU «Книга психоактивной инфографики») is made. The book's contents live in one place only: [docs/assets/infographics/BOOK.md](../assets/infographics/BOOK.md). Look and type: [docs/assets/infographics/README.md](../assets/infographics/README.md).

## Rule
A card gets its place in BOOK.md first, then it is drawn. One card = one entry. Nothing is kept elsewhere; other places link here.

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
- v1.0 (2026-11-17): first version, from Sasha's request (fund → scheme → subscheme; contents → content: title, subtitle, numeric prism, scheme with keys, notes).
