# Romanian seed selection: method and references

**Status: seeds approved, 2026-11-17.** The module plan and the
1,000 entries are approved. Read [the complete seed list](seed-review.md)
alongside the ID-only curriculum in `seeds.json`. The approved seeds were
committed and pushed as `b01c999`. The full dictionary was approved for publication
on 2026-11-18; see [dictionary preparation and sources](dictionary-sources.md).

## Selection method

1. Keep the approved 60-module sequence and every module's exact seed budget.
2. Choose useful dictionary headwords, grammatical words, and reusable phrases
   for the module's intended task. Include the existing 44 pilot entries.
3. Consult frequency evidence to identify common vocabulary and gaps, and to
   review weaker candidates. Prefer broad everyday usefulness over narrow
   specialist terms. For example, common movement adverbs and general verbs
   take some slots that could otherwise become longer object-name lists.
4. Keep related sets and contrasts together: pronouns, numbers, weekdays,
   seasons, common opposites, and functional patterns. Within-module order is
   editorial and roughly follows usefulness; it is not a strict frequency sort.
5. Keep inflections under their dictionary entries. Do not count plurals,
   conjugations, or adjective gender/number variants as additional seeds.
   A lexicalized expression such as `a ține minte` (to remember) can be a
   separate seed from the ordinary verb `a ține` (to hold).
6. Write short English glosses for review and preserve correct Romanian
   diacritics. These are seed descriptions, not complete definitions, examples,
   grammatical tables, or the final accepted-answer lists.

The result is a frequency-informed practical curriculum. It is **not a claim
to be the statistically exact 1,000 most frequent Romanian lemmas**. Module
budgets and practical needs deliberately retain some lower-frequency items,
such as socks or specific health vocabulary, while related variants and proper
names are consolidated or omitted.

## Frequency and language references

- [FrequencyWords by Hermit Dave](https://github.com/hermitdave/FrequencyWords),
  specifically the [Romanian 2018 50,000-token list](https://github.com/hermitdave/FrequencyWords/blob/master/content/2018/ro/ro_50k.txt).
  This provides counts of surface forms from OPUS OpenSubtitles 2018, drawn
  from [OpenSubtitles](https://www.opensubtitles.org/). Its dialogue is a useful
  signal for conversational vocabulary, but subtitles are translated and
  genre-dependent rather than a representative sample of all Romanian speech.
  The repository identifies its content license as CC BY-SA 4.0.
- [wordfreq 3.1.1 by Robyn Speer](https://github.com/rspeer/wordfreq), using
  Romanian frequency lookups. This provides a second signal from combined
  sources. Its underlying data is a historical snapshot, not a live measure
  of current speech. See its [source acknowledgments](https://github.com/rspeer/wordfreq/blob/master/NOTICE.md)
  for corpus attribution and data terms; the bundled frequency data is
  distributed under CC BY-SA 4.0.
- [UniMorph Romanian](https://github.com/unimorph/ron), used where available
  to connect a headword to attested inflected forms during the frequency
  audit. The existing pilot dictionary also supplied verified forms for its
  entries. This is partial form matching, not a complete corpus lemmatizer.
- [dexonline](https://dexonline.ro/), consulted for spot checks of spelling
  and expression meanings. This does not constitute an independent language
  review of every proposed entry.

Frequency references were consulted on 2026-11-17. The downloaded FrequencyWords
file has 50,000 rows and SHA-256:

```text
af4d7d1fc980ee7f988a5114dd34478dd5c7abd1e66a45c25a5da330f06faba5
```

The entries and English glosses were authored for this curriculum; no subtitle
sentences or dictionary definitions were copied into the review list.

### What the frequency audit verifies

Of the 1,000 entries, 907 have a single-word lexical target after removing a
verb's infinitive/reflexive prefix. The remainder are multiword expressions.
All 907 have a headword or an available mapped form represented in at least
one frequency reference: 906 in the subtitle reference and 900 in wordfreq.

This verifies reference coverage, **not a top-1,000 rank**. A frequent inflected
form can support a much less frequent citation form. Zero in wordfreq means
the lookup is unavailable at that dataset's coverage threshold; it is not
proof that a normal Romanian word is unused. Multiword entries were selected
for their communicative function, without inventing phrase-frequency ranks
from their component-word counts.

## Word-type balance

Each seed is counted once by its proposed primary learning use. A word can
have additional grammatical functions that the dictionary will explain.

| Group | Entries |
| --- | ---: |
| Nouns | 398 |
| Verbs, including useful phrasal verbs | 245 |
| Adjectives | 103 |
| Adverbs | 63 |
| Reusable phrases | 85 |
| Numerals | 30 |
| Pronouns | 21 |
| Conjunctions | 19 |
| Prepositions | 19 |
| Determiners | 9 |
| Interjections | 6 |
| Article | 1 |
| Particle | 1 |
| **Total** | **1,000** |

The everyday domains make the noun share about 40%, somewhat above the
module plan's rough one-third aim. Verbs account for about 25%; modifiers,
function words, numbers, and phrases make up the rest. These proportions are
visible for review rather than presented as a statistical quota or a corpus
distribution.

## IDs, meanings, and the later dictionary

- All 44 pilot IDs are retained. They have new module assignments in the
  expanded curriculum. The full dictionary now carries those module assignments
  while preserving the IDs used by existing local progress.
- Keep Romanian spellings from `seed-review.md`; do not reconstruct them
  from ASCII IDs. Those tables contain every ID, headword, proposed type,
  English gloss, module, and global learning priority.
- Explicitly disambiguated IDs prevent collisions: `ca` (că, that) versus
  `ca-like` (ca, like/as); `sau` (or) versus `sau-possessive` (său);
  `fata` (fată, girl) versus `fata-face` (față, face/front);
  `rau` (rău, bad) versus `rau-river` (râu, river);
  `mare` (big) versus `mare-sea` (sea); and `peste` (pește, fish) versus
  `peste-over` (peste, over/across).
- Give each seed one home module. Repeated words inside useful expressions
  are intentional; duplicated standalone seeds or mere inflection slots are
  not. Distinct lexical meanings, such as big versus sea, can have separate
  entries even when their Romanian spelling is identical.
- Include normal plural-only or predominantly plural usage where appropriate,
  such as `ochelari` and `paste`. `pantalon` is the citation headword for
  the clothing entry, with the normal plural `pantaloni` to be made clear in
  the dictionary. Do not invent unnatural singulars to fill a schema.
- Put gender/number counterparts and common alternate forms in variations:
  examples include `doi/două`, `un/o`, `meu/mea/mei/mele`, and the forms of
  demonstratives. `unu` (one) and `un` (a/an) are separate entries for their
  different numeral/article functions, not separate gender variants.
- For impersonal or restricted verbs such as `a trebui`, `a ploua`, and
  `a ninge`, teach the natural core forms and explain the restriction instead
  of forcing unnatural forms for every pronoun.
- Preserve qualifiers for ambiguous English prompts. Later dictionary work
  must distinguish person/number, grammatical function, and meanings such as
  place versus seat, time versus weather, or English "like" as a verb versus
  a comparison word. Supply explicit accepted answers as in the pilot.
- The dictionary must remain self-contained. When it is eventually expanded,
  include each entry's new module metadata, grammatical forms, notes, examples,
  accepted answers, and any necessary quiz prompt qualifier.

## Review boundary

The user approved committing and pushing these seeds and review documents,
then building the full dictionary. Expand and validate that dictionary before
publishing the new runtime vocabulary. Keep the existing pilot IDs stable.
