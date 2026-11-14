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

Do not edit generated files under `public/`. The app requirements are recorded
below, but the app has not been built. `/ro/` is the intended app route.

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
Exercises and the app have not been built. The user's initial app requirements
and the proposed pilot defaults are recorded below.

### Language reference checks

Entries and examples were authored for this pilot. Available verb inflections
and noun forms were cross-checked against the public
[UniMorph Romanian tables](https://github.com/unimorph/ron). That reference
does not cover every pilot entry; remaining forms and translations were
manually reviewed. There has been no independent language review. These
checks do not establish a frequency ranking or replace the future curriculum
source-selection work.

## App requirements

### Home and learning

- Build a mobile-first app at `/ro/` with two primary actions: **Learn** and
  **Practice**. Also show overall progress, an entry point to the full
  dictionary, and access to a settings modal.
- In Learn, introduce batches of five new seeds. Use fewer only at the end
  of a module; never combine modules to fill a batch.
- Select new seeds sequentially in dictionary order, which represents the
  curriculum's priority order. Do not randomize new learning batches.
- Let the learner inspect the Romanian entry, English meaning, type, module,
  grammatical forms, examples and translations, gender, and any notes.
- Mark the batch's entries as learned after the learner finishes the batch.

### Practice and progress

- Each learned entry moves independently through these exercise modes, in
  order: Romanian → English multiple choice; Romanian → English typing;
  English → Romanian multiple choice; English → Romanian typing.
- Show a progress bar per entry and an overall progress bar that includes
  partial progress through the states before mastery.
- Practice batches target ten entries, using fewer if the available learned
  pool is smaller. Practice can draw from all learned modules.
- The app manages practice selection and review timing. Use randomized,
  non-uniform selection with exponential backoff: successful entries return
  less frequently, while failed entries receive earlier repeat practice.
- Continue reviewing mastered entries occasionally, with intervals increasing
  exponentially after successful recall. Mastery must not remove an entry
  permanently from practice.
- Record every submitted attempt, including failures, with its timestamp.

### Dictionary and settings

- The dictionary view includes the whole dictionary, including entries that
  have not yet been learned. Support sorting by priority (dictionary order),
  Romanian alphabetical order, and failure ratio to surface difficult entries.
- Include a settings modal with a reset-all-progress action. Require explicit
  confirmation before clearing learning states, review schedules, and attempt
  history.

### Installation, offline use, and storage

- Make the app a PWA that can be added to the iOS Home Screen. Cache the app
  assets and the complete dictionary for offline use after a successful
  initial download.
- Store progress and attempt history locally in the browser, with no
  server-side storage or account requirement. The user accepts that progress
  will not automatically transfer between devices.
- A single HTML file, one main JavaScript file, and one CSS file are sufficient
  for the app. The user does not require splitting the implementation into
  many files for code readability. Add the PWA manifest, service worker, and
  icons needed for installation and caching.

## Proposed pilot implementation defaults

These recommendations were discussed alongside the requirements. They provide
a starting point for implementation; exact scheduling constants and weights
have not been fixed. Progress export/import is an optional recommendation,
not an additional confirmed requirement.

- **Progress model:** use five milestones per seed: finish Learn, then pass
  each of the four exercise modes in order. An unseen entry starts at 0%;
  each milestone adds 20%, and passing the final mode marks it mastered.
  Overall progress is `(completed milestones / (5 × total dictionary entries))
  × 100%`.
- **Progress versus scheduling:** track the completed milestones separately
  from review timing. A correct answer advances an unfinished entry one
  milestone; failure keeps the current milestone and schedules another try.
  Successful reviews of mastered entries extend the interval without adding
  progress beyond 100%; failed reviews shorten it. Continue reviewing mastered
  entries with English → Romanian typing.
- **Practice sessions:** select up to ten distinct learned entries, weighted
  toward overdue entries and previous failures. Repeat failed entries after
  intervening questions when possible; those retries are additional attempts,
  not additional distinct entries toward the ten-entry target. Exact retry
  delays and behavior when no entries are due remain implementation decisions.
- **Typed answers:** ignore case, whitespace, and incidental punctuation.
  Accept Romanian without diacritics, then show the correct spelling. Define
  explicit accepted English alternatives rather than depending on fuzzy
  matching or treating the display translation as the only valid answer.
- **Prompt and choice clarity:** distinguish `tu` from `voi` and `ei` from
  `ele` in English prompts using short number, gender, or politeness
  qualifiers. Account for synonyms and formal/informal phrase variants.
  Multiple-choice distractors must not be other valid answers to the prompt.
- **Exercise scope:** initially test the seed's base word or phrase. Show
  conjugations and other variations as reference material in Learn and the
  dictionary; exercises for those forms can be added later.
- **Attempt history:** retain entry ID, exercise mode, submitted answer,
  correctness, timestamp, and response duration for every attempt. Compute
  failure ratio as failed attempts divided by all attempts for the entry;
  show the attempt count alongside it and distinguish unattempted entries
  from entries with a measured 0% failure ratio.
- **Offline assets:** keep the app and dictionary available without external
  network dependencies after caching. Scope the service worker to `/ro/` so
  its caching behavior stays within the learning app.
- **Optional backup:** consider JSON export/import of progress in Settings
  alongside reset, since local progress otherwise has no portable backup.

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
- [x] Record the user's app requirements and proposed pilot defaults.
- [ ] Build the home page, sequential Learn batches, and per-entry progress
  using the approved pilot dictionary.
- [ ] Implement the four ordered practice modes, answer checking, and attempt
  history.
- [ ] Implement randomized practice batches, failure retries, and exponential
  review scheduling, including reviews after mastery.
- [ ] Build the full dictionary view with the three requested sorting modes.
- [ ] Add local persistence and the settings modal with confirmed progress
  reset; consider the optional progress export/import feature.
- [ ] Add the PWA manifest, icons, and service worker for iOS installation
  and offline use.
- [ ] Verify the pilot app's learning flows and deploy when authorized.
- [ ] After the pilot app is built, expand the learning path toward 1,000
  seeds, using documented frequency sources and a useful balance of themes
  and word types.
- [ ] Expand and validate the dictionary for the larger curriculum, and check
  that the app works with the expanded content.

The implementation sequence is **pilot seeds and dictionary → pilot app →
full 1,000-seed curriculum and dictionary**. The pilot seeds and dictionary
are approved, and the initial app requirements are documented. The next
implementation phase is the pilot app. Use it to test the learning experience
before expanding the content to 1,000 seeds.
