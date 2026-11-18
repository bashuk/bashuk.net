(function RoTests() {
  const test = require("node:test"), assert = require("node:assert/strict");
  const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
  const core = require("../static/ro/app.js");
  const dictionary = JSON.parse(fs.readFileSync(path.join(__dirname, "../static/ro/dictionary.json"), "utf8"));
  const at = 1_800_000_000_000;
  function learned(ids = dictionary.map(entry => entry.id)) {
    const state = core.freshState();
    for (const id of ids) state.entries[id] = { ...core.wordState(state, id), stage: 1, learnedAt: at, dueAt: at };
    return state;
  }
  function rng(seed = 42) { return () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296); }
  test("full dictionary covers the approved curriculum in order with usable reference content", () => {
    const seeds = JSON.parse(fs.readFileSync(path.join(__dirname, "../static/ro/seeds.json"), "utf8"));
    assert.equal(dictionary.length, 1000);
    assert.equal(seeds.length, 60);
    assert.deepEqual(dictionary.map(entry => entry.id), seeds.flatMap(module => module.seeds));
    assert.equal(new Set(dictionary.map(entry => entry.id)).size, 1000);
    for (const module of seeds) for (const id of module.seeds) {
      const entry = dictionary.find(entry => entry.id === id);
      assert.equal(entry.module_id, module.module_id);
      assert.equal(entry.module, module.module);
    }
    for (const entry of dictionary) {
      assert.ok(entry.ro && entry.en && entry.type, entry.id);
      assert.equal(entry.examples.length, 3, entry.id);
      for (const example of entry.examples) assert.ok(example.ro.trim() && example.en.trim(), entry.id);
      assert.ok(Object.values(entry.variations).every(value => typeof value === "string" && value.trim()), entry.id);
      const forms = [entry.ro, ...Object.values(entry.variations)].map(core.normalize);
      assert.ok(entry.examples.some(example => forms.some(form => (` ${core.normalize(example.ro)} `).includes(` ${form} `))), `${entry.id}: examples should demonstrate the entry`);
      if (entry.type === "noun") assert.ok(["masculine", "feminine", "neuter"].includes(entry.gender), entry.id);
      if (entry.type === "adjective") for (const form of ["masculine_singular", "feminine_singular", "masculine_plural", "feminine_plural"]) assert.ok(entry.variations[form], entry.id);
      if (entry.type === "verb") {
        const count = ["a-trebui", "a-ploua", "a-ninge"].includes(entry.id) ? 3 : ["a-durea", "a-dura", "a-costa"].includes(entry.id) ? 6 : 18;
        assert.equal(Object.keys(entry.variations).length, count, entry.id);
      }
    }
    const byId = new Map(dictionary.map(entry => [entry.id, entry]));
    assert.equal(byId.get("a-curata").variations.present_tu, "cureți");
    assert.equal(byId.get("a-insista").variations.future_el_ea, "o să insiste");
    assert.equal(byId.get("a-si-aminti").variations.past_eu, "mi-am amintit");
    assert.equal(byId.get("guvern").variations.plural, "guverne");
    assert.equal(byId.get("ochelari").variations.singular, undefined);
    assert.equal(byId.get("paste").variations.singular, undefined);
  });
  test("learning follows priority and never crosses a module boundary", () => {
    let state = core.freshState();
    assert.deepEqual(core.nextLearnBatch(dictionary, state), ["salut", "buna-ziua", "la-revedere", "te-rog", "multumesc"]);
    state = learned(dictionary.slice(0, 10).map(entry => entry.id));
    assert.deepEqual(core.nextLearnBatch(dictionary, state), ["eu", "tu", "el", "ea", "noi"]);
    state = learned(dictionary.slice(0, 15).map(entry => entry.id));
    assert.deepEqual(core.nextLearnBatch(dictionary, state), dictionary.slice(15, 20).map(entry => entry.id));
    const partialModule = [...dictionary.slice(0, 7), ...dictionary.slice(10, 15)];
    assert.deepEqual(core.nextLearnBatch(partialModule, learned(partialModule.slice(0, 5).map(entry => entry.id))), partialModule.slice(5, 7).map(entry => entry.id));
    assert.deepEqual(core.nextLearnBatch(dictionary, learned()), []);
  });
  test("overall progress includes learning and each exercise milestone", () => {
    const state = core.freshState();
    assert.equal(core.overallProgress(dictionary, state), 0);
    state.entries.salut = { ...core.wordState(state, "salut"), stage: 1 };
    assert.equal(core.overallProgress(dictionary, state), 100 / (dictionary.length * 5));
    state.entries.salut.stage = 5;
    assert.equal(core.overallProgress(dictionary, state), 100 / dictionary.length);
    for (const entry of dictionary) state.entries[entry.id] = { stage: 5 };
    assert.equal(core.overallProgress(dictionary, state), 100);
  });
  test("exercise modes advance in order and mistakes repeat the current stage", () => {
    let word = core.wordState(learned(["salut"]), "salut");
    assert.equal(core.exerciseMode(word), 0);
    word = core.recordResult(word, false, at);
    assert.equal(word.stage, 1);
    assert.equal(word.failed, 1);
    assert.equal(word.total, 1);
    assert.equal(word.dueAt, at + core.MINUTE);
    for (const expected of [2, 3, 4, 5]) {
      word = core.recordResult(word, true, at);
      assert.equal(word.stage, expected);
      assert.equal(core.exerciseMode(word), Math.min(3, expected - 1));
    }
    assert.equal(word.total, 5);
    assert.equal(word.failed, 1);
    assert.equal(word.interval, core.DAY);
  });
  test("mastered entries back off exponentially, recover after failure, and remain capped", () => {
    let word = { ...core.wordState(learned(["salut"]), "salut"), stage: 5, interval: core.DAY, dueAt: at };
    word = core.recordResult(word, true, at);
    assert.equal(word.interval, 2 * core.DAY);
    const early = core.recordResult(word, true, at + core.MINUTE);
    assert.equal(early.dueAt, word.dueAt);
    assert.equal(early.interval, word.interval);
    word = core.recordResult(word, false, at + core.MINUTE);
    assert.equal(word.stage, 5);
    assert.equal(word.interval, core.MINUTE);
    word = core.recordResult(word, true, word.dueAt);
    assert.equal(word.interval, core.DAY);
    for (let i = 0; i < 20; i++) word = core.recordResult(word, true, word.dueAt);
    assert.equal(word.interval, core.MAX_INTERVAL);
  });
  test("practice excludes unseen and not-yet-due words unless extra practice is requested", () => {
    const state = learned(dictionary.slice(0, 14).map(entry => entry.id));
    state.entries.salut.dueAt = at + core.DAY;
    const selected = core.samplePractice(dictionary, state, at, false, rng());
    assert.equal(selected.length, 10);
    assert.equal(new Set(selected).size, 10);
    assert.ok(!selected.includes("salut"));
    assert.ok(selected.every(id => state.entries[id]));
    for (const progress of Object.values(state.entries)) progress.dueAt = at + core.DAY;
    assert.deepEqual(core.samplePractice(dictionary, state, at), []);
    assert.equal(core.samplePractice(dictionary, state, at, true, rng()).length, 10);
    assert.equal(core.samplePractice(dictionary, learned(["salut"]), at).length, 1);
  });
  test("failed and overdue entries receive greater selection weight", () => {
    const state = learned(["salut", "da"]);
    Object.assign(state.entries.salut, { interval: core.DAY, total: 10, failed: 10, lastCorrect: false });
    Object.assign(state.entries.da, { interval: core.DAY, total: 10, failed: 0, lastCorrect: true });
    const random = rng(7);
    let first = 0;
    for (let i = 0; i < 1000; i++) if (core.samplePractice(dictionary, state, at, false, random)[0] === "salut") first++;
    assert.ok(first > 750, `Expected failures to be prioritized, got ${first}/1000`);
    Object.assign(state.entries.salut, { total: 0, failed: 0, lastCorrect: null, dueAt: at - 5 * core.DAY });
    let overdueFirst = 0;
    for (let i = 0; i < 1000; i++) if (core.samplePractice(dictionary, state, at, false, random)[0] === "salut") overdueFirst++;
    assert.ok(overdueFirst > 750);
  });
  test("answer checking accepts explicit aliases and diacritic-free Romanian without fuzzy false positives", () => {
    const byId = new Map(dictionary.map(entry => [entry.id, entry]));
    assert.ok(core.isAccepted(byId.get("multumesc"), "ro", " MULTUMESC! "));
    assert.ok(core.isAccepted(byId.get("multumesc"), "en", "thanks"));
    assert.ok(core.isAccepted(byId.get("cu-placere"), "en", "YOU’RE welcome!"));
    assert.ok(core.isAccepted(byId.get("a-sti"), "ro", "sti"));
    assert.ok(core.isAccepted(byId.get("a-face"), "en", "make"));
    assert.ok(core.isAccepted(byId.get("scuze"), "ro", "Scuzati-ma!"));
    assert.ok(!core.isAccepted(byId.get("ei"), "ro", "ele"));
    assert.ok(!core.isAccepted(byId.get("nu-inteleg"), "en", "I understand"));
    assert.ok(!core.isAccepted(byId.get("da"), "en", ""));
    assert.ok(!core.isAccepted(byId.get("te-rog"), "ro", "va rog"));
    assert.ok(core.isAccepted(byId.get("opinie"), "ro", "parere"));
    assert.ok(core.isAccepted(byId.get("a-tine-minte"), "ro", "a-si aminti"));
    assert.ok(core.isAccepted(byId.get("doisprezece"), "ro", "douasprezece"));
    assert.ok(!core.isAccepted(byId.get("a-sti"), "ro", "a cunoaste"));
  });
  test("every entry has explicit answers; ambiguous English prompts are distinguished", () => {
    for (const entry of dictionary) {
      assert.ok(entry.accepted_answers.en.length && entry.accepted_answers.ro.length);
      assert.ok(core.isAccepted(entry, "ro", entry.ro));
      assert.ok(core.isAccepted(entry, "en", entry.en));
    }
    const byId = new Map(dictionary.map(entry => [entry.id, entry]));
    assert.notEqual(core.displayEnglish(byId.get("tu")), core.displayEnglish(byId.get("voi")));
    assert.notEqual(core.displayEnglish(byId.get("ei")), core.displayEnglish(byId.get("ele")));
    assert.notEqual(core.displayEnglish(byId.get("salut")), core.displayEnglish(byId.get("buna-ziua")));
  });
  test("multiple-choice distractors never overlap a valid answer in either language", () => {
    const random = rng(13);
    for (const entry of dictionary) for (const language of ["en", "ro"]) {
      const ids = core.choiceIds(entry, language, dictionary, random);
      assert.equal(ids.length, 4);
      assert.equal(ids.filter(id => id === entry.id).length, 1);
      const answers = new Set(core.answersFor(entry, language).map(core.normalize));
      for (const id of ids.filter(id => id !== entry.id)) {
        const other = dictionary.find(candidate => candidate.id === id);
        assert.ok(!core.answersFor(other, language).some(answer => answers.has(core.normalize(answer))), `${entry.id}: ambiguous ${id}`);
      }
    }
  });
  test("backups round-trip progress and attempts and reject corrupted history", () => {
    const state = learned(["salut"]);
    state.entries.salut = core.recordResult(state.entries.salut, false, at);
    const attempt = { id: "attempt-1", entryId: "salut", mode: 0, response: "no", correct: false, timestamp: new Date(at).toISOString(), durationMs: 1200 };
    const backup = { format: "bashuk-ro", version: 1, progress: state, attempts: [attempt] };
    const restored = core.validateBackup(JSON.parse(JSON.stringify(backup)));
    assert.deepEqual(restored.progress.entries, state.entries);
    assert.equal(restored.progress.practiceSession, null);
    assert.equal(restored.attempts.length, 1);
    assert.throws(() => core.validateBackup({ ...backup, attempts: [] }), /does not match/);
    assert.throws(() => core.validateBackup({ ...backup, attempts: [attempt, attempt] }), /invalid attempt/);
    assert.throws(() => core.validateBackup({ format: "other" }), /not a supported/);
    const negative = structuredClone(backup); negative.progress.entries.salut.failed = -1;
    assert.throws(() => core.validateBackup(negative));
  });
  test("PWA icons and declared runtime assets exist at the expected sizes", () => {
    const root = path.join(__dirname, "../static/ro");
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
    assert.equal(manifest.start_url, "/ro/");
    assert.equal(manifest.scope, "/ro/");
    for (const icon of manifest.icons) {
      const data = fs.readFileSync(path.join(root, icon.src));
      const size = Number(icon.sizes.split("x")[0]);
      assert.equal(data.readUInt32BE(16), size);
      assert.equal(data.readUInt32BE(20), size);
    }
  });
  test("service worker serves cached launches immediately, refreshes in the background, and works offline", async () => {
    const listeners = {}, stores = new Map(), root = "https://example.test/ro/", messages = [];
    let network = true, claimed = false, delayedRequests = null;
    const key = request => typeof request === "string" ? request : request.url;
    const cacheApi = {
      keys: async () => [...stores.keys()],
      delete: async name => stores.delete(name),
      open: async name => {
        if (!stores.has(name)) stores.set(name, new Map());
        const store = stores.get(name);
        return {
          addAll: async urls => { for (const url of urls) store.set(url, new Response("cached " + url)); },
          match: async request => store.get(key(request))?.clone(),
          put: async (request, response) => { store.set(key(request), response); }
        };
      }
    };
    await cacheApi.open("blog-cache");
    await cacheApi.open("bashuk-ro-old");
    const self = {
      location: new URL(root + "sw.js"),
      addEventListener: (name, handler) => { listeners[name] = handler; },
      skipWaiting: async () => {},
      clients: { claim: async () => { claimed = true; }, matchAll: async () => [{ postMessage: message => messages.push(message) }] }
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../static/ro/sw.js"), "utf8"), {
      self, caches: cacheApi, URL, Response,
      fetch: async request => {
        if (!network) throw new Error("offline");
        if (delayedRequests) return new Promise(resolve => delayedRequests.push({ request, resolve }));
        return new Response("network " + key(request));
      }
    });
    let pending;
    listeners.install({ waitUntil: promise => { pending = promise; } }); await pending;
    listeners.activate({ waitUntil: promise => { pending = promise; } }); await pending;
    assert.ok(claimed);
    assert.ok(stores.has("blog-cache"));
    assert.ok(!stores.has("bashuk-ro-old"));
    const store = stores.get("bashuk-ro-v2");
    assert.equal(store.size, 11);
    for (const url of store.keys()) {
      const relative = url.slice(root.length);
      assert.ok(fs.existsSync(path.join(__dirname, "../static/ro", relative || "index.html")), relative);
    }
    delayedRequests = [];
    for (const [url, mode] of [[root, "navigate"], [root + "dictionary.json", "cors"]]) {
      let response, refresh, served = false;
      listeners.fetch({ request: { url, method: "GET", mode }, respondWith: promise => { response = promise; }, waitUntil: promise => { refresh = promise; } });
      response.then(() => { served = true; });
      await new Promise(setImmediate);
      assert.ok(served, `${url}: cached response must not wait for the network`);
      assert.equal(await (await response).text(), "cached " + url);
      assert.equal(delayedRequests.length, 1);
      delayedRequests.shift().resolve(new Response("updated " + url));
      await refresh;
      assert.equal(await store.get(url).clone().text(), "updated " + url);
    }
    delayedRequests = null;
    store.delete(root + "dictionary.json");
    let downloaded, refreshed;
    listeners.fetch({ request: { url: root + "dictionary.json", method: "GET", mode: "cors" }, respondWith: promise => { downloaded = promise; }, waitUntil: promise => { refreshed = promise; } });
    assert.equal(await (await downloaded).text(), "network " + root + "dictionary.json");
    await refreshed;
    assert.ok(store.has(root + "dictionary.json"));
    network = false;
    for (const [url, mode] of [[root, "navigate"], [root + "dictionary.json", "cors"], [root + "app.js", "cors"], [root + "styles.css", "cors"], [root + "another-path", "navigate"]]) {
      let response;
      listeners.fetch({ request: { url, method: "GET", mode }, respondWith: promise => { response = promise; }, waitUntil: promise => { pending = promise; } });
      assert.equal((await response).status, 200, url);
    }
    let handled = false;
    listeners.fetch({ request: { url: "https://example.test/other/", method: "GET", mode: "navigate" }, respondWith: () => { handled = true; } });
    assert.equal(handled, false);
    listeners.message({ data: { type: "CACHE_STATUS" }, source: { postMessage: value => messages.push(value) }, waitUntil: promise => { pending = promise; } }); await pending;
    assert.ok(messages.some(message => message.type === "OFFLINE_READY"));
  });
})();
