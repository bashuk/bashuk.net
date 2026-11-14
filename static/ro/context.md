# Romanian learning app: project context

## Goal and approach

Build a Romanian learning app at `https://bashuk.net/ro/`. The aim is to
spend roughly 20% of the learning time to acquire 80% of the useful basics.
The user values practical progress over completeness and accepts simple
vocabulary and some grammatical inaccuracies as a trade-off for speed.

Prefer accurate Romanian within a deliberately small teaching scope: teach
fewer common constructions rather than every grammatical possibility.
Avoid turning this into a comprehensive language course. Words, reusable
phrases, and short example sentences should enable useful conversation early.

The eventual curriculum should contain about 1,000 **seeds**. A seed is a
dictionary entry, either a word or a common phrase, not an individual inflected
form. For example, `a-fi` is one seed; its conjugations belong to its dictionary
entry. Common phrases are first-class entries, not merely examples.

## Curriculum design

- Use frequency and everyday usefulness together. The target is a useful
  curriculum, not an exact ranking of the 1,000 most frequent surface forms.
- Include a balanced mix of nouns, pronouns, verbs, adjectives, other useful
  word types, and phrases across the full curriculum. The pilot is only an
  initial subset of that mix.
- Arrange entries into explicit thematic blocks. Keep related entries together
  even when their individual frequencies differ, such as a complete set of
  subject pronouns. Prefer small blocks of roughly 5–15 seeds.
- Module order and seed order within modules define the learning path.
- Teach useful sentences from the start. Romanian often omits subject pronouns;
  examples should reflect natural usage even when conjugation tables show them.
- Document frequency sources and selection methods when expanding the
  curriculum. The current pilot is a curated selection; no external frequency
  dataset has been used or verified yet.

## Repository and file locations

This repository is a Hugo site using the Book theme. Its configuration is in
`hugo.toml`; `README.md` describes local development and publishing.

- `static/ro/seeds.json`: the approved pilot curriculum. Hugo will serve this
  at `/ro/seeds.json` when the site is built and deployed.
- `static/ro/dictionary.json`: the pilot dictionary, containing all 44 approved
  seeds with grammatical forms and three translated examples per entry.
- `static/ro/context.md`: this public project context document, served at
  `/ro/context.md` when the site is built and deployed. Keep it limited to
  public project decisions; do not add credentials, personal information, or
  private operational details.

Do not edit generated files under `public/`. The app UI has not been specified
or built. `/ro/` is the intended app route, not an existing completed app.

## Agreed data formats

The final filenames are **`seeds.json`** and **`dictionary.json`**. Earlier
discussion used `words.json` and `language.json`; those names were superseded.

### seeds.json

A JSON array of module objects, each containing `module_id`, `module`, and
`seeds`. `module` is the human-readable module name, not a generic `name` field.
`seeds` contains stable entry IDs, not full dictionary objects.

```json
[
  {
    "module_id": "first-conversations",
    "module": "First conversations",
    "seeds": ["salut", "buna-ziua", "te-rog"]
  }
]
```

This is a format example, not the full pilot. Existing IDs are lowercase ASCII
with hyphens between words. Preserve these IDs when creating dictionary entries.
They are identifiers, not display text: for example, `multumesc` should display
as `mulțumesc`, and `a-manca` as `a mânca`.

### dictionary.json

A JSON array of self-contained entries. Every object includes:

- `id`: the matching seed ID.
- `ro`: the Romanian word or phrase with correct diacritics and spacing.
- `en`: its English meaning.
- `type`: its word type, such as `noun`, `verb`, `pronoun`, `adjective`, or
  `phrase`; choose appropriate types for other entries as needed.
- `module_id` and `module`: both the module ID and its human-readable name.
- `variations`: an object mapping short grammatical form keys to Romanian forms.
- `examples`: a few short sentence objects, each with `ro` and `en` fields.

The pilot also uses `gender` on every noun (`masculine`, `feminine`, or
`neuter`) and optional English `notes` for practical usage distinctions,
such as informal/polite address or mass nouns. Notes are displayable learning
content; the app must not rely on parsing them to identify grammatical forms.

```json
[
  {
    "id": "te-rog",
    "ro": "te rog",
    "en": "please",
    "type": "phrase",
    "module_id": "first-conversations",
    "module": "First conversations",
    "variations": {},
    "examples": [
      {
        "ro": "O apă, te rog.",
        "en": "A water, please."
      }
    ]
  }
]
```

This illustrates the schema; the final entries should have a few examples each.
Every entry must have examples, including phrases. An empty `variations` object
is acceptable where no useful grammatical variants are needed.

The dictionary intentionally duplicates module metadata. Once generated, it
must be sufficient for the app to run without joining it to `seeds.json`.
The seeds file is the curriculum input; the dictionary is the runtime resource.

## Grammar scope for dictionary generation

- **Verbs:** cover present, a common past tense, and a conversational future
  construction for all six conjugation groups: `eu`, `tu`, `el/ea`, `noi`,
  `voi`, and `ei/ele`. Use the compound past (*perfect compus*) and the
  conversational `o să` future. The implemented keys are `{tense}_{subject}`,
  where tense is `present`, `past`, or `future`, and subject is `eu`, `tu`,
  `el_ea`, `noi`, `voi`, or `ei_ele`: 18 forms per verb. Values omit the subject
  pronoun. For example, `past_eu` is `am avut` and `future_el_ea` is `o să aibă`
  for `a-avea`. Future forms use the subjunctive, which can differ from the
  present indicative; do not generate them by simply prefixing present forms.
- **Nouns:** include grammatical gender, singular and plural forms, and useful
  definite forms. Romanian attaches the definite article to the noun. Keys are
  `singular`, `plural`, `singular_definite`, and `plural_definite`, with noun
  gender in the top-level `gender` field. For `lapte` and `orez`, uncommon
  plurals are deliberately omitted: these entries have only `singular` and
  `singular_definite`, with a usage note. Missing forms are absent keys, not
  empty strings or invented plurals. An app should offer the forms that exist.
- **Adjectives:** include masculine/feminine × singular/plural forms.
- **Other types and phrases:** include relevant forms without forcing every
  entry into the same conjugation or declension table. The pilot uses
  `informal` and `polite_or_plural` keys for useful phrase variants. Subject
  pronouns have empty `variations` objects because their subject forms are
  already separate seeds; object and possessive forms are postponed. The
  word types used in this pilot are `phrase`, `interjection`, `adverb`,
  `pronoun`, `verb`, and `noun`.
- Postpone detailed case rules, uncommon constructions, and exhaustive
  alternatives. Keep examples short, practical, and natural.

There are eight separate subject-pronoun seeds (`eu`, `tu`, `el`, `ea`, `noi`,
`voi`, `ei`, `ele`), while verbs use the six groups above because the
third-person masculine and feminine subjects share conjugations.

## Approved pilot

The user requested 3–4 modules with fewer than 50 seeds and has approved the
current `static/ro/seeds.json`: **44 unique seeds across four modules**.

| Order | Module ID | Module | Seeds |
| --- | --- | --- | ---: |
| 1 | `first-conversations` | First conversations | 12 |
| 2 | `subject-pronouns` | Subject pronouns | 8 |
| 3 | `core-verbs` | Core verbs | 10 |
| 4 | `food-and-drink` | Food and drink | 14 |

The first module gives immediate conversational phrases and yes/no responses;
the next two establish subjects and common actions; the final module supplies
concrete vocabulary for simple requests and sentences. Read `seeds.json` for
the exact approved IDs and order.

The user has approved the pilot dictionary: **44 entries, 132 translated
examples, and 180 verb forms**. Its IDs and order exactly match `seeds.json`.
JSON structure, duplicate keys and IDs, module metadata, expected grammatical
form keys, translated example coverage, and Romanian Unicode have been checked.
Exercises and the app have not been built. The next step is the user's app
requirements.

### Language reference checks

Entries and examples were authored for this pilot. Available verb inflections
and noun forms were cross-checked against the public
[UniMorph Romanian tables](https://github.com/unimorph/ron). That reference
does not cover every pilot entry; remaining forms and translations were
manually reviewed. There has been no independent language review. These
checks do not establish a frequency ranking or replace the future curriculum
source-selection work.

## Plan

- [x] Agree on the practical 80/20 learning goal and thematic learning path.
- [x] Define seeds as words or common phrases, with stable IDs.
- [x] Agree on `seeds.json` and a self-contained `dictionary.json` schema.
- [x] Create and validate the pilot: four modules, 44 unique seeds.
- [x] Obtain user approval of the pilot seeds.
- [x] Record project decisions and remaining work in this handoff document.
- [x] Generate `dictionary.json` for the approved pilot, finalizing grammatical
  form keys and noun gender representation.
- [x] Check pilot entries for complete seed coverage, correct module metadata,
  useful grammatical forms, Romanian diacritics, and translated examples.
- [x] Review the dictionary pilot with the user and obtain approval.
- [ ] Obtain the user's separate app requirements and build the `/ro/` app
  using the pilot dictionary.
- [ ] Verify the pilot app's learning flows and deploy when authorized.
- [ ] After the pilot app is built, expand the learning path toward 1,000
  seeds, using documented frequency sources and a useful balance of themes
  and word types.
- [ ] Expand and validate the dictionary for the larger curriculum, and check
  that the app works with the expanded content.

The implementation sequence is **pilot seeds and dictionary → pilot app →
full 1,000-seed curriculum and dictionary**. The pilot seeds and dictionary
are approved. Await the user's app requirements before implementing the app;
use the pilot to test the learning experience before expanding the content.
