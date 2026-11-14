(function DomChecks() {
  const assert = require("node:assert/strict");
  const fs = require("node:fs");
  const { JSDOM, VirtualConsole } = require("jsdom");
  const { IDBFactory, IDBKeyRange, IDBDatabase } = require("fake-indexeddb");
  const root = require("node:path").join(__dirname, "../static/ro");
  const source = fs.readFileSync(root + "/app.js", "utf8");
  const html = fs.readFileSync(root + "/index.html", "utf8").replace('<script src="./app.js" defer></script>', "");
  const dictionary = JSON.parse(fs.readFileSync(root + "/dictionary.json", "utf8"));
  const core = require(root + "/app.js");
  let now = 1_800_000_000_000, passed = 0;
  function pass(label) { passed++; console.log("PASS " + label); }
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function waitFor(predicate, label) {
    for (let i = 0; i < 300; i++) { if (await predicate()) return; await pause(5); }
    throw new Error("Timed out: " + label);
  }
  async function open(idb, hash = "") {
    const errors = [];
    const console = new VirtualConsole();
    console.on("jsdomError", error => errors.push(error.message));
    const dom = new JSDOM(html, { url: "https://ro.test/ro/" + hash, runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: console });
    const w = dom.window;
    w.indexedDB = idb; w.IDBKeyRange = IDBKeyRange; w.structuredClone = structuredClone;
    w.fetch = async () => new Response(JSON.stringify(dictionary), { headers: { "Content-Type": "application/json" } });
    w.Date.now = () => now;
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event("close")); };
    w.eval(source);
    await waitFor(() => w.document.querySelector(".bottom-nav"), "app boot");
    assert.deepEqual(errors, []);
    return dom;
  }
  async function get(idb) {
    const request = idb.open("bashuk-ro", 1);
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const read = (store, key) => new Promise((resolve, reject) => {
      const objectStore = db.transaction(store).objectStore(store);
      const r = key ? objectStore.get(key) : objectStore.getAll();
      r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
    const progress = await read("meta", "main") || core.freshState();
    const attempts = await read("attempts");
    db.close();
    return { progress, attempts };
  }
  async function click(dom, selector) {
    const button = dom.window.document.querySelector(selector);
    assert.ok(button, "Missing control: " + selector);
    button.click();
    await pause(15);
  }
  async function runPractice(dom, idb) {
    let safety = 40;
    while ((await get(idb)).progress.practiceSession) {
      assert.ok(safety--, "Practice did not terminate");
      let session = (await get(idb)).progress.practiceSession;
      if (!session.result) {
        const entry = dictionary.find(entry => entry.id === session.question.entryId);
        if (session.question.mode % 2 === 0) await click(dom, `.choices [data-id="${entry.id}"]`);
        else {
          dom.window.document.getElementById("typed-answer").value = session.question.mode < 2 ? entry.accepted_answers.en[0] : entry.ro;
          dom.window.document.getElementById("answer-form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
          await pause(15);
        }
        session = (await get(idb)).progress.practiceSession;
        assert.ok(session.result.correct);
      }
      await click(dom, '[data-action="next-question"]');
    }
    await waitFor(() => dom.window.document.querySelector(".summary-card"), "practice summary");
  }
  async function main() {
    const idb = new IDBFactory();
    let dom = await open(idb, "#main");
    assert.ok(dom.window.document.body.textContent.includes("Learn something new"));
    assert.equal(dom.window.document.querySelectorAll(".module-row").length, 4);
    pass("fresh home loads all four module summaries");
    await click(dom, '[data-action="start-learn"]');
    await waitFor(() => dom.window.document.querySelector(".word-face"), "learn card");
    assert.equal(dom.window.document.querySelector(".word-face h1").textContent, "salut");
    assert.equal(Object.keys((await get(idb)).progress.entries).length, 0);
    await click(dom, '[data-action="learn-next"]');
    assert.equal(dom.window.document.querySelector(".word-face h1").textContent, "bună ziua");
    dom.window.close();
    dom = await open(idb, "#learn");
    assert.equal(dom.window.document.querySelector(".word-face h1").textContent, "bună ziua");
    pass("unfinished learning resumes without prematurely learning the batch");
    for (let i = 0; i < 4; i++) await click(dom, '[data-action="learn-next"]');
    let saved = await get(idb);
    assert.equal(Object.keys(saved.progress.entries).length, 5);
    assert.ok(Object.values(saved.progress.entries).every(entry => entry.stage === 1));
    assert.ok(dom.window.document.querySelector(".summary-card"));
    pass("finishing the batch atomically introduces exactly five entries");
    await click(dom, '[data-action="start-practice"]');
    let session = (await get(idb)).progress.practiceSession;
    const wrong = session.question.choices.find(id => id !== session.question.entryId);
    await click(dom, `.choices [data-id="${wrong}"]`);
    saved = await get(idb);
    assert.equal(saved.attempts.length, 1);
    assert.equal(saved.attempts[0].correct, false);
    assert.equal(saved.progress.practiceSession.queue.length, 6);
    assert.ok(saved.attempts[0].timestamp && saved.attempts[0].durationMs >= 0);
    dom.window.close();
    dom = await open(idb, "#practice");
    assert.ok(dom.window.document.querySelector(".feedback.wrong"));
    assert.equal((await get(idb)).attempts.length, 1);
    pass("failed answers are logged and retried; reload preserves feedback without duplicate attempts");
    await runPractice(dom, idb);
    saved = await get(idb);
    assert.equal(saved.attempts.length, 6);
    assert.ok(Object.values(saved.progress.entries).every(entry => entry.stage === 2));
    pass("a five-entry practice session finishes after an additional failed-word retry");
    for (let round = 0; round < 3; round++) {
      now += 2 * core.DAY;
      await click(dom, '.bottom-nav [data-action="start-practice"]');
      await runPractice(dom, idb);
    }
    saved = await get(idb);
    assert.equal(saved.attempts.length, 21);
    assert.ok(Object.values(saved.progress.entries).every(entry => entry.stage === 5));
    pass("all four exercise modes advance each entry independently to mastery");
    dom.window.location.hash = "dictionary";
    await waitFor(() => dom.window.document.getElementById("dictionary-search"), "dictionary");
    assert.equal(dom.window.document.querySelectorAll(".word-row").length, 44);
    const search = dom.window.document.getElementById("dictionary-search");
    search.value = "cafea"; search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    assert.equal(dom.window.document.querySelectorAll(".word-row").length, 1);
    search.value = ""; search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    const select = dom.window.document.getElementById("dictionary-sort");
    select.value = "failures"; select.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    const failedId = saved.attempts.find(attempt => !attempt.correct).entryId;
    assert.ok(dom.window.document.querySelector(".word-row").href.endsWith("/" + failedId));
    pass("dictionary search and failure-ratio sorting reflect actual attempt history");
    await click(dom, ".word-row");
    await waitFor(() => dom.window.document.querySelector("#history-list .history-item"), "entry history");
    assert.ok(dom.window.document.querySelector("#history-list").textContent.includes("Missed"));
    pass("entry details expose timestamped correct and failed attempts");
    const backup = { format: "bashuk-ro", version: 1, progress: saved.progress, attempts: saved.attempts };
    await click(dom, '[data-action="settings"]');
    await click(dom, '[data-action="confirm-reset"]');
    await click(dom, '[data-action="cancel-confirm"]');
    assert.equal((await get(idb)).attempts.length, 21);
    await click(dom, '[data-action="confirm-reset"]');
    await click(dom, '[data-action="reset"]');
    saved = await get(idb);
    assert.equal(saved.attempts.length, 0);
    assert.equal(Object.keys(saved.progress.entries).length, 0);
    pass("reset cancellation preserves data; confirmed reset clears progress and all attempts");
    await click(dom, '[data-action="settings"]');
    const input = dom.window.document.getElementById("backup-file");
    Object.defineProperty(input, "files", { value: [{ size: 1000, text: async () => JSON.stringify(backup) }], configurable: true });
    input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    await waitFor(() => dom.window.document.querySelector('[data-action="apply-import"]'), "import confirmation");
    assert.equal((await get(idb)).attempts.length, 0);
    await click(dom, '[data-action="apply-import"]');
    saved = await get(idb);
    assert.equal(saved.attempts.length, 21);
    assert.ok(Object.values(saved.progress.entries).every(entry => entry.stage === 5));
    pass("backup import validates and replaces progress only after confirmation");
    const before = JSON.stringify(saved);
    const transaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (stores, mode) {
      if (mode === "readwrite") throw new Error("Simulated quota error");
      return transaction.call(this, stores, mode);
    };
    await click(dom, '[data-action="start-learn"]');
    IDBDatabase.prototype.transaction = transaction;
    assert.equal(JSON.stringify(await get(idb)), before);
    assert.ok(dom.window.document.getElementById("toast").textContent.includes("Couldn't save"));
    pass("a storage failure leaves saved progress unchanged and shows a useful error");
    dom.window.close();
    const secondIdb = new IDBFactory();
    const a = await open(secondIdb), b = await open(secondIdb);
    await click(a, '[data-action="start-learn"]');
    const revision = (await get(secondIdb)).progress.revision;
    await click(b, '[data-action="start-learn"]');
    assert.equal((await get(secondIdb)).progress.revision, revision);
    assert.ok(b.window.document.getElementById("toast").textContent.includes("Another tab"));
    pass("simultaneous tabs cannot silently overwrite each other's progress");
    for (let i = 0; i < 5; i++) await click(a, '[data-action="learn-next"]');
    await click(a, '[data-action="start-practice"]');
    const active = (await get(secondIdb)).progress.practiceSession;
    const incorrect = active.question.choices.find(id => id !== active.question.entryId);
    await click(a, `.choices [data-id="${incorrect}"]`);
    let exported;
    b.window.URL.createObjectURL = blob => {
      const reader = new b.window.FileReader();
      reader.onload = () => { exported = JSON.parse(reader.result); };
      reader.readAsText(blob);
      return "blob:test-backup";
    };
    b.window.URL.revokeObjectURL = () => {};
    b.window.HTMLAnchorElement.prototype.click = () => {};
    await click(b, '[data-action="settings"]');
    await click(b, '[data-action="export"]');
    await waitFor(() => exported, "exported backup");
    assert.equal(exported.attempts.length, 1);
    assert.equal(Object.keys(exported.progress.entries).length, 5);
    core.validateBackup(exported);
    pass("backup export uses a consistent storage snapshot even from a stale tab");
    a.window.close(); b.window.close();
    console.log(`Passed ${passed} DOM/IndexedDB integration scenarios.`);
  }
  main().catch(error => { console.error(error); process.exitCode = 1; });
})();
