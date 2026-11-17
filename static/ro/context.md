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
  subject pronouns. The full-curriculum draft uses modules of 10–25 seeds,
  all multiples of five, taught in the app's five-entry Learn batches.
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
- `static/ro/curriculum-plan.md`: approved sequence and seed budgets for the
  full 1,000-entry curriculum. The user approved the module plan on 2026-11-17
  and requested preparing seeds for a separate review before expanding the
  dictionary. Approval of the module plan does not change live vocabulary.

Do not edit generated files under `public/`. The pilot app is implemented under
`static/ro/`, which Hugo serves at `/ro/`. The user has authorized publishing
the pilot through the repository's existing GitHub Pages deployment from
`main`. The app's public URL is `https://bashuk.net/ro/`.

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

For practice, every entry now also has `accepted_answers`, an object with
`en` and `ro` arrays of explicitly accepted answers. Optional `prompt_en`
provides an unambiguous English quiz prompt, such as `you (informal, plural)`.
These fields supplement the approved content; the original headwords,
translations, grammatical forms, and examples are unchanged. The dictionary
remains the app's only vocabulary input, without a runtime join to seeds.

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
The pilot app and exercises are implemented. On 2026-11-16, the user reported
that the app works well and they like the format, while noting that they have
not used it long enough to assess what is missing. Independent browser/device
verification, including iOS installation and real offline behavior, remains
unverified. The next content step is review of the full curriculum's module
plan, followed by seed expansion and then dictionary expansion.

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

## Pilot implementation decisions

The implementation follows the defaults discussed alongside the requirements,
with the timing choices documented here. Progress export/import was an optional
recommendation and is included in the pilot.

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
  not additional distinct entries toward the ten-entry target. Allow up to two
  extra retries per entry per session to avoid an endless loop. Entries still
  missed at the end remain scheduled for another session. Use only due entries
  for scheduled practice, even if this produces fewer than ten. When no entries
  are due, offer clearly labeled optional extra practice.
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
- **Backup:** Settings includes JSON export/import of progress and complete
  attempt history. Validate imports and ask for confirmation before replacing
  existing progress. Export the progress and attempts from one consistent
  database snapshot, including when another tab has changed progress.

### Review intervals and storage

- Finishing a Learn batch makes its entries immediately due for the first
  exercise. Correct answers schedule the next exercise after 5 minutes,
  20 minutes, and 1 hour respectively; passing the fourth exercise marks the
  entry mastered and schedules its next review after 1 day.
- Each successful due review of a mastered entry doubles its interval, up to
  180 days. A failed answer schedules review after 1 minute. A successful
  mastered review after a failure restarts at a 1-day interval.
- Extra practice can advance unfinished exercise milestones. Successful early
  reviews of mastered entries keep their existing due time and interval;
  failures still shorten the interval.
- Weighted random selection prioritizes overdue entries, observed failure
  ratios, and entries whose most recent attempt failed. Sample without
  replacement for the session's initial set of up to ten entries.
- Use IndexedDB (`bashuk-ro`, format version 1) for entry progress, in-progress
  learning/practice sessions, and attempt history. Save each attempt and its
  progress change in one transaction. Do not advance the UI if saving fails.
- Use a revision check to reject stale writes from another tab rather than
  silently overwrite newer progress. Reloading reads the latest saved state.
- An interrupted session resumes after reload, including feedback for an
  already submitted answer, without recording that answer twice.
- Entry details show the latest 20 attempts; exports retain the full history.
  Confirmed reset clears progress, sessions, and attempts, while retaining the
  dictionary and offline asset cache.

### Files and verification

- `static/ro/index.html`, `app.js`, and `styles.css`: the buildless app shell,
  behavior, and responsive styling. No runtime package installation is needed.
- `static/ro/sw.js`: service worker scoped to `/ro/`. Cache the app shell,
  dictionary, manifest, and icons. Cache names use the `bashuk-ro-` prefix;
  activation must not delete caches belonging to other sections of the site.
  Bump the worker's cache version when releasing shell changes.
- `static/ro/manifest.webmanifest`, `icon.svg`, and `icons/`: installation
  metadata, standard and maskable PWA icons, and the iOS touch icon.
- `tests/`: Node tests for the learning/scheduling logic, answer checking,
  distractors, backups, cache behavior, and DOM/IndexedDB integration. With
  Node 24 or newer, run `npm ci --prefix tests`, then `npm test --prefix tests`.
  These packages are test dependencies only; the app uses no external CDN.

Validation passed: 12 logic/data/cache tests and 13 DOM/IndexedDB integration
scenarios, plus JavaScript syntax and dictionary content-preservation checks.
The tests cover failed-word retries, all four exercise modes, reload recovery,
sorting, reset confirmation, import/export, failed saves, and concurrent tabs.
DOM, IndexedDB, and service-worker tests use simulations; real browser layout,
iOS Home Screen installation, and actual offline operation remain unverified.

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
- [x] Record the user's app requirements and pilot implementation decisions.
- [x] Build the home page, sequential Learn batches, and per-entry progress
  using the approved pilot dictionary.
- [x] Implement the four ordered practice modes, answer checking, and attempt
  history.
- [x] Implement randomized practice batches, failure retries, and exponential
  review scheduling, including reviews after mastery.
- [x] Build the full dictionary view with the three requested sorting modes.
- [x] Add local persistence and the settings modal with confirmed progress
  reset and progress export/import.
- [x] Add the PWA manifest, icons, and service worker for iOS installation
  and offline use.
- [x] Run automated logic, data, cache, and DOM/storage integration checks.
- [ ] Verify the app's responsive layout and flows in a real browser, and
  confirm iOS installation and offline operation on a device.
- [x] Obtain user approval to commit and publish the pilot app to `main`.
- [x] Receive initial user feedback on the published pilot: the app works well
  and the learning format is liked; longer-term feedback is still developing.
- [x] Draft a redesigned full learning path: 60 modules, 1,000 total seeds,
  with every module count a multiple of five.
- [x] Review and approve the module sequence and seed budgets (2026-11-17).
- [ ] Expand the approved plan into 1,000 unique seeds, using documented
  frequency sources and a useful balance of themes and word types. Include
  the existing 44 entries and preserve their IDs even if their modules change.
- [ ] Review and approve the expanded seeds before expanding the dictionary.
- [ ] Expand and validate the dictionary for the larger curriculum, and check
  that the app works with the expanded content.

The implementation sequence is **pilot seeds and dictionary → pilot app →
full 1,000-seed curriculum and dictionary**. The pilot seeds and dictionary
are approved, the pilot app is implemented, and initial user feedback is
positive. The full module plan is approved. The current task is to expand it
into 1,000 seeds for review, then expand the dictionary after seed approval.
Keep the live pilot dictionary unchanged during seed preparation and review.
