# Romanian dictionary: preparation and review

**Status: full dictionary approved for publication, 2026-11-18.** The approved
seed curriculum is committed and pushed as `b01c999`. The user has also approved
committing and pushing the dictionary expansion and its app compatibility changes.

## Content and scope

`dictionary.json` contains exactly the approved 1,000 seed IDs, in the order
defined by `seeds.json`, across all 60 modules. Each entry includes both module
fields, its Romanian headword and English gloss, primary word type, grammatical
forms, three translated examples, and explicit accepted answers for practice.
Usage notes and qualified English quiz prompts clarify common ambiguities.
The app needs no runtime lookup into the seed or review files.

| Content | Count |
| --- | ---: |
| Dictionary entries | 1,000 |
| Modules | 60 |
| Romanian/English example pairs | 3,000 |
| Reference forms | 6,469 |
| Verb forms, included in the reference total | 4,329 |
| Nouns | 398 |
| Verbs | 245 |
| Adjectives | 103 |
| Phrases | 85 |
| Adverbs | 63 |
| Numerals | 30 |
| Pronouns | 21 |
| Conjunctions | 19 |
| Prepositions | 19 |
| Determiners | 9 |
| Interjections | 6 |
| Articles | 1 |
| Particles | 1 |

All 44 pilot IDs are retained, together with their reviewed forms, examples,
and existing accepted answers. Common object-pronoun forms and further aliases
have been added. Their module metadata now follows the approved full curriculum.

## Grammar choices

- Ordinary verbs have 18 forms: six subject groups in the present, compound
  past, and conversational `o să` future. The future uses subjunctive forms.
  Reflexive and dative markers change with the subject and tense.
- `a trebui`, `a ploua`, and `a ninge` have three impersonal forms each.
  `a durea`, `a dura`, and `a costa` have six common third-person forms each.
  Notes explain the constructions; unsupported personal forms are omitted.
- Nouns include gender and common singular, plural, and definite forms.
  Uncommon plurals are omitted for mass nouns in their beginner sense.
  `ochelari` and pasta `paste` are taught as plural-only. `dată` distinguishes
  calendar plural `date` from occasion plural `dăți`.
- Adjectives have four gender/number forms, even when some spellings coincide.
  `ultim` additionally shows the definite forms used in its examples.
- Pronouns, determiners, numerals, and phrases have relevant common variants.
  This is a limited reference for practical learning, not exhaustive declension.
- Quiz prompts distinguish grammatical function and meaning where needed:
  `un` as an article versus `unu` as a number; `a ști` versus `a cunoaște`;
  polite versus informal address; and masculine versus feminine groups.
  Deliberately overlapping synonyms, such as `părere/opinie` and the two
  expressions for remembering, accept each other's base answers. Qualifiers
  keep genuinely different uses separate.

## Sources, authorship, and attribution

Headwords, meanings, IDs, and priority come from the approved `seed-review.md`
and `seeds.json`; frequency-selection references are in `seed-sources.md`.

Available inflections were checked against and adapted from
[UniMorph Romanian (`ron`)](https://github.com/unimorph/ron), whose
[README](https://github.com/unimorph/ron/blob/master/README.md) credits Wikipedia
and identifies [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
UniMorph-derived form data retains that attribution and those license terms.
Changes include mapping the forms to this app's keys, correcting inconsistent
source labels and particular paradigms, limiting the teaching scope, and adding
missing forms. Raw labels were not treated as authoritative: noun number/gender
was checked through article-bearing forms, and adjective paradigms were curated
separately. Corrections include `guverne`, `curăț/cureți/curăță`, and `să insiste`.

The consulted UniMorph table snapshot has SHA-256:

```text
0c007e572cacf37b0e538f024cea9e630cc17669c4faa7a5054655530871fd22
```

[dexonline](https://dexonline.ro/) supplied spelling and conjugation spot checks,
including restricted price/duration verbs and the plural of `euro`. Missing
paradigms, usage notes, accepted answers, and examples were composed for this
dictionary. New examples combine short reusable beginner patterns with bespoke
sentences for idioms, abstract vocabulary, and constructions that need context.
No subtitle sentences or dictionary definitions were copied into the examples.

## Validation and remaining review

Automated checks cover exact seed order and coverage, unique IDs, all module
metadata, three nonempty bilingual examples per entry, the presence of the
target or a listed form in the examples, expected verb/adjective forms, noun
gender, and accepted base answers. Pilot forms and examples were also checked
for preservation. All 1,000 entries are checked for overlapping multiple-choice
answers in both languages.

Run `npm test --prefix tests` with the test dependencies installed. The suite
contains 13 logic/data/cache tests and 14 DOM/IndexedDB integration scenarios.
It exercises learning and all four practice modes with the expanded dictionary,
progress and attempts, search/sorting, backups/reset, concurrent tabs, simulated
offline caching, immediate cached responses despite stalled network requests,
background refreshes, and rendering of impersonal/restricted verbs, reflexives,
adjectives, and plural-only nouns.

The app changes display only the verb subjects actually supplied, and use a
forms grid for impersonal verbs. Service-worker cache version 2 refreshes
the changed app shell. Cached navigation and dictionary responses return
immediately while the worker checks for updates in the background; a first
download is needed if no local copy exists. The dictionary is 914,256 bytes
uncompressed (about 914 KB), or 121,099 bytes with local gzip compression.
Actual transfer encoding depends on hosting. Existing IndexedDB entry
IDs and progress remain compatible; the overall progress denominator becomes
1,000 entries.

These checks establish data coverage and app behavior, not independent fluency
review. There has been no independent Romanian-language review of every entry.
Real-device iOS installation and offline operation remain outside the simulated
tests. The user approved committing and publishing this expansion on 2026-11-18.
