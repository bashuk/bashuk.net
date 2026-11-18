(function RomanianApp() {
  "use strict";
  const MINUTE = 60_000, DAY = 86_400_000, MAX_INTERVAL = 180 * DAY;
  const MODE_LABELS = ["Ro → En · multiple choice", "Ro → En · typing", "En → Ro · multiple choice", "En → Ro · typing"];
  const STAGE_LABELS = ["Not learned", "Learned", "Ro → En choice passed", "Ro → En typing passed", "En → Ro choice passed", "Mastered"];
  const SUBJECTS = [["eu", "eu"], ["tu", "tu"], ["el_ea", "el / ea"], ["noi", "noi"], ["voi", "voi"], ["ei_ele", "ei / ele"]];
  function freshState() {
    return { version: 1, revision: 0, entries: {}, learnSession: null, practiceSession: null, lastSummary: null };
  }
  function wordState(state, id) {
    return { stage: 0, learnedAt: null, dueAt: 0, interval: 0, lastReviewed: null, lastCorrect: null, total: 0, failed: 0, lapses: 0, ...(state.entries[id] || {}) };
  }
  function normalize(value) {
    return String(value).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
      .replace(/[’']/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  }
  function answersFor(entry, language) {
    return entry.accepted_answers?.[language] || [entry[language]];
  }
  function isAccepted(entry, language, answer) {
    const normalized = normalize(answer);
    return normalized.length > 0 && answersFor(entry, language).some(value => normalize(value) === normalized);
  }
  function displayEnglish(entry) { return entry.prompt_en || entry.en; }
  function exerciseMode(progress) { return Math.min(3, Math.max(0, progress.stage - 1)); }
  function nextLearnBatch(dictionary, state) {
    const first = dictionary.find(entry => wordState(state, entry.id).stage === 0);
    return first ? dictionary.filter(entry => entry.module_id === first.module_id && wordState(state, entry.id).stage === 0).slice(0, 5).map(entry => entry.id) : [];
  }
  function overallProgress(dictionary, state) {
    return dictionary.length ? dictionary.reduce((sum, entry) => sum + wordState(state, entry.id).stage, 0) / (5 * dictionary.length) * 100 : 0;
  }
  function recordResult(progress, correct, now) {
    const next = { ...progress, total: progress.total + 1, failed: progress.failed + (correct ? 0 : 1), lastReviewed: now, lastCorrect: correct };
    if (!correct) {
      next.lapses = progress.lapses + 1;
      next.interval = MINUTE;
      next.dueAt = now + MINUTE;
      return next;
    }
    if (progress.stage < 5) {
      next.stage = progress.stage + 1;
      next.interval = ({ 2: 5 * MINUTE, 3: 20 * MINUTE, 4: 60 * MINUTE, 5: DAY })[next.stage];
      next.dueAt = now + next.interval;
    } else if (now >= progress.dueAt) {
      next.interval = progress.interval < DAY ? DAY : Math.min(MAX_INTERVAL, progress.interval * 2);
      next.dueAt = now + next.interval;
    }
    return next;
  }
  function samplePractice(dictionary, state, now, early = false, random = Math.random) {
    const pool = dictionary.filter(entry => {
      const progress = wordState(state, entry.id);
      return progress.stage > 0 && (early || progress.dueAt <= now);
    }).map(entry => {
      const progress = wordState(state, entry.id);
      const interval = Math.max(MINUTE, progress.interval);
      const overdue = 1 + Math.min(8, Math.max(0, now - progress.dueAt) / interval);
      const future = 1 / (1 + Math.max(0, progress.dueAt - now) / interval);
      const difficulty = 1 + 3 * progress.failed / Math.max(1, progress.total);
      return { id: entry.id, weight: overdue * future * difficulty * (progress.lastCorrect === false ? 2 : 1) };
    });
    const selected = [];
    while (pool.length && selected.length < 10) {
      const total = pool.reduce((sum, item) => sum + item.weight, 0);
      let target = random() * total;
      let index = pool.length - 1;
      for (let i = 0; i < pool.length; i++) {
        target -= pool[i].weight;
        if (target < 0) { index = i; break; }
      }
      selected.push(pool.splice(index, 1)[0].id);
    }
    return selected;
  }
  function shuffled(array, random = Math.random) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function choiceIds(entry, language, learned, random = Math.random) {
    const targetAnswers = new Set(answersFor(entry, language).map(normalize));
    const label = item => normalize(language === "en" ? displayEnglish(item) : item.ro);
    const labels = new Set([label(entry)]);
    const candidates = shuffled(learned.filter(item => item.id !== entry.id &&
      !answersFor(item, language).some(answer => targetAnswers.has(normalize(answer)))), random)
      .sort((a, b) => Number(b.type === entry.type) - Number(a.type === entry.type));
    const choices = [entry.id];
    for (const candidate of candidates) {
      if (labels.has(label(candidate))) continue;
      labels.add(label(candidate));
      choices.push(candidate.id);
      if (choices.length === 4) break;
    }
    return shuffled(choices, random);
  }
  function validateBackup(data) {
    if (!data || data.format !== "bashuk-ro" || data.version !== 1 || !data.progress ||
        data.progress.version !== 1 || !data.progress.entries || Array.isArray(data.progress.entries) || !Array.isArray(data.attempts)) {
      throw new Error("This is not a supported Română progress backup.");
    }
    const result = freshState(), ids = new Set(), counts = new Map();
    for (const attempt of data.attempts) {
      if (!attempt || typeof attempt.id !== "string" || ids.has(attempt.id) ||
          !/^[a-z]+(?:-[a-z]+)*$/.test(attempt.entryId) || !Number.isInteger(attempt.mode) ||
          attempt.mode < 0 || attempt.mode > 3 || typeof attempt.response !== "string" ||
          typeof attempt.correct !== "boolean" || !Number.isFinite(Date.parse(attempt.timestamp)) ||
          !Number.isFinite(attempt.durationMs) || attempt.durationMs < 0) {
        throw new Error("The backup contains an invalid attempt record.");
      }
      ids.add(attempt.id);
      const count = counts.get(attempt.entryId) || { total: 0, failed: 0 };
      count.total++; if (!attempt.correct) count.failed++;
      counts.set(attempt.entryId, count);
    }
    for (const [id, progress] of Object.entries(data.progress.entries)) {
      if (!/^[a-z]+(?:-[a-z]+)*$/.test(id) || !progress || !Number.isInteger(progress.stage) || progress.stage < 0 || progress.stage > 5) {
        throw new Error("The backup contains invalid entry progress.");
      }
      for (const key of ["total", "failed", "lapses", "dueAt", "interval"]) {
        if (!Number.isFinite(progress[key]) || progress[key] < 0) throw new Error("The backup contains invalid review data.");
      }
      if (![progress.total, progress.failed, progress.lapses].every(Number.isInteger) ||
          progress.failed > progress.total || (progress.stage > 0 && (!Number.isFinite(progress.learnedAt) || progress.learnedAt < 0)) ||
          (progress.lastReviewed !== null && (!Number.isFinite(progress.lastReviewed) || progress.lastReviewed < 0)) ||
          ![null, true, false].includes(progress.lastCorrect)) {
        throw new Error("The backup contains invalid progress totals.");
      }
      const count = counts.get(id) || { total: 0, failed: 0 };
      if (count.total !== progress.total || count.failed !== progress.failed) throw new Error("Attempt history does not match the progress totals.");
      result.entries[id] = { ...wordState(freshState(), id), ...progress };
      counts.delete(id);
    }
    if (counts.size) throw new Error("Attempt history references missing entries.");
    return { progress: result, attempts: data.attempts };
  }
  const core = { freshState, wordState, normalize, answersFor, isAccepted, displayEnglish, exerciseMode, nextLearnBatch, overallProgress, recordResult, samplePractice, choiceIds, validateBackup, MINUTE, DAY, MAX_INTERVAL };
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  if (typeof document === "undefined") return;

  let dictionary = [], byId = new Map(), state = freshState(), database, saving = false, offlineReady = false;
  let toastTimer, pendingImport = null;
  const ui = { search: "", sort: "priority" };
  const app = document.getElementById("app"), settings = document.getElementById("settings");
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M12 5v16M3 3h5a4 4 0 0 1 4 3 4 4 0 0 1 4-3h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z"/>',
    practice: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    dictionary: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18m4-13h4m-4 4h4m-4 4h3"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    settings: '<path d="M9.5 4 10 2h4l.5 2 2 .9 2-.6 2 3.4L19 9.2v2.3l1.5 1.4-2 3.5-2-.6-2 1L14 19h-4l-.5-2.2-2-1-2 .6-2-3.5L5 11.5V9.2L3.5 7.7l2-3.4 2 .6z"/><circle cx="12" cy="10.5" r="3"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>'
  };
  function icon(name, extra = "") { return `<svg ${extra} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`; }
  function button(label, action, kind = "", attrs = "") { return `<button class="button ${kind}" data-action="${action}" ${attrs}>${label}</button>`; }
  function steps(stage) { return `<span class="steps" role="img" aria-label="${stage * 20}% complete, ${escape(STAGE_LABELS[stage])}">${Array.from({ length: 5 }, (_, i) => `<span class="${i < stage ? `filled ${stage === 5 ? "mastered" : ""}` : ""}"></span>`).join("")}</span>`; }
  function toast(message) {
    const node = document.getElementById("toast"); node.textContent = message; node.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { node.hidden = true; }, 5500);
  }
  function relativeTime(time) {
    const delta = time - Date.now();
    if (delta <= 0) return "now";
    if (delta < MINUTE) return "in less than a minute";
    if (delta < 60 * MINUTE) return `in ${Math.ceil(delta / MINUTE)} min`;
    if (delta < DAY) return `in ${Math.ceil(delta / (60 * MINUTE))} hr`;
    return `in ${Math.ceil(delta / DAY)} day${Math.ceil(delta / DAY) === 1 ? "" : "s"}`;
  }
  function route() { return (location.hash.slice(1) || "home").split("/"); }
  function go(path) {
    if (location.hash === `#${path}`) render(); else location.hash = path;
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("bashuk-ro", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore("meta");
        const attempts = db.createObjectStore("attempts", { keyPath: "id" });
        attempts.createIndex("entryId", "entryId");
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); toast("A newer app version is open. Reload this tab before continuing."); };
        resolve(db);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Close other Română tabs and try again."));
    });
  }
  function readRecord(store, key) {
    return new Promise((resolve, reject) => {
      const request = database.transaction(store, "readonly").objectStore(store).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function allAttempts(id) {
    return new Promise((resolve, reject) => {
      const store = database.transaction("attempts", "readonly").objectStore("attempts");
      const request = id ? store.index("entryId").getAll(id) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function persist(next, attempt = null, replacement = null) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(["meta", "attempts"], "readwrite");
      let conflict = false;
      const meta = transaction.objectStore("meta"), request = meta.get("main");
      request.onsuccess = () => {
        if ((request.result?.revision || 0) !== (state.revision || 0)) {
          conflict = true; transaction.abort(); return;
        }
        next.revision = (state.revision || 0) + 1;
        meta.put(next, "main");
        const attempts = transaction.objectStore("attempts");
        if (replacement !== null) { attempts.clear(); replacement.forEach(item => attempts.add(item)); }
        if (attempt) attempts.add(attempt);
      };
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("Storage is unavailable."));
      transaction.onabort = () => reject(conflict ? new Error("Another tab updated your progress. Reload before continuing.") : transaction.error || new Error("Saving was interrupted."));
    });
  }
  async function commit(next, attempt = null, replacement = null) {
    if (saving) return false;
    saving = true;
    try {
      await persist(next, attempt, replacement);
      state = next;
      return true;
    } catch (error) {
      toast(`Couldn't save your progress. Nothing was advanced. ${error.message || "Please try again."}`);
      return false;
    } finally { saving = false; }
  }
  function makeQuestion(session, next) {
    const item = session.queue[session.index], entry = byId.get(item.id);
    const mode = exerciseMode(wordState(next, item.id));
    return {
      entryId: item.id, mode, startedAt: Date.now(),
      choices: mode % 2 === 0 ? choiceIds(entry, mode < 2 ? "en" : "ro", dictionary.filter(item => wordState(next, item.id).stage > 0)) : []
    };
  }
  async function startLearn() {
    if (saving) return;
    if (!state.learnSession) {
      const ids = nextLearnBatch(dictionary, state);
      if (!ids.length) { go("learn"); return; }
      const next = structuredClone(state); next.learnSession = { ids, index: 0 };
      if (!await commit(next)) return;
    }
    go("learn");
  }
  async function startPractice(early = false) {
    if (saving) return;
    if (!state.practiceSession) {
      const ids = samplePractice(dictionary, state, Date.now(), early);
      if (!ids.length) { go("practice"); return; }
      const next = structuredClone(state);
      next.practiceSession = { ids, queue: ids.map(id => ({ id, retries: 0 })), index: 0, result: null, correct: 0, attempts: 0, early };
      next.practiceSession.question = makeQuestion(next.practiceSession, next);
      if (!await commit(next)) return;
    }
    go("practice");
  }
  async function learnNext(back = false) {
    if (saving || !state.learnSession) return;
    const next = structuredClone(state), session = next.learnSession;
    if (back) session.index = Math.max(0, session.index - 1);
    else if (session.index < session.ids.length - 1) session.index++;
    else {
      const now = Date.now();
      for (const id of session.ids) {
        const progress = wordState(next, id);
        if (progress.stage === 0) next.entries[id] = { ...progress, stage: 1, learnedAt: now, dueAt: now };
      }
      next.lastSummary = { type: "learn", ids: [...session.ids] };
      next.learnSession = null;
    }
    if (await commit(next)) {
      if (next.learnSession) { render(); window.scrollTo({ top: 0, behavior: "instant" }); }
      else go("summary");
    }
  }
  async function submitAnswer(response) {
    if (saving || !state.practiceSession || state.practiceSession.result) return;
    const next = structuredClone(state), session = next.practiceSession, question = session.question;
    const entry = byId.get(question.entryId), language = question.mode < 2 ? "en" : "ro", choice = question.mode % 2 === 0;
    if (choice && !question.choices.includes(response)) return;
    if (!choice && !String(response).trim()) return;
    const correct = choice ? response === entry.id : isAccepted(entry, language, response);
    const submitted = choice ? (language === "en" ? displayEnglish(byId.get(response)) : byId.get(response).ro) : String(response).trim();
    const now = Date.now(), old = wordState(next, entry.id);
    next.entries[entry.id] = recordResult(old, correct, now);
    const attempt = {
      id: crypto.randomUUID(), entryId: entry.id, mode: question.mode, response: submitted,
      correct, timestamp: new Date(now).toISOString(), durationMs: Math.max(0, now - question.startedAt),
      prompt: question.mode < 2 ? entry.ro : displayEnglish(entry), expected: language === "en" ? entry.en : entry.ro
    };
    session.result = { ...attempt, chosenId: choice ? response : null };
    session.attempts++; if (correct) session.correct++;
    const item = session.queue[session.index];
    if (!correct && item.retries < 2) session.queue.push({ id: item.id, retries: item.retries + 1 });
    if (await commit(next, attempt)) {
      render();
      document.getElementById("feedback")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      document.querySelector('[data-action="next-question"]')?.focus({ preventScroll: true });
    }
  }
  async function nextQuestion() {
    if (saving || !state.practiceSession?.result) return;
    const next = structuredClone(state), session = next.practiceSession;
    session.index++; session.result = null;
    if (session.index >= session.queue.length) {
      next.lastSummary = { type: "practice", ids: session.ids, correct: session.correct, attempts: session.attempts };
      next.practiceSession = null;
    } else session.question = makeQuestion(session, next);
    if (await commit(next)) {
      if (next.practiceSession) { render(); window.scrollTo({ top: 0, behavior: "instant" }); }
      else go("summary");
    }
  }
  function header(active) {
    return `<header class="app-header"><a class="brand" href="#home" aria-label="Română home"><span class="brand-mark">ro.</span><span>Română<small>A little, every day.</small></span></a><div class="row"><span class="connection" id="connection" role="status">${offlineReady ? "Ready offline" : "On this device"}</span><button class="icon-button" data-action="settings" aria-label="Open settings">${icon("settings")}</button></div></header>`;
  }
  function navigation(active) {
    return `<nav class="bottom-nav" aria-label="Main navigation">${[
      ["home", "Home", "home"], ["learn", "Learn", "book"], ["practice", "Practice", "practice"], ["dictionary", "Dictionary", "dictionary"]
    ].map(([key, label, picture]) => key === "learn" || key === "practice" ?
      `<button class="nav-item ${active === key ? "active" : ""}" data-action="start-${key}" ${key === "practice" ? 'data-auto-early="true"' : ""} ${active === key ? 'aria-current="page"' : ""}>${icon(picture)}<span>${label}</span></button>` :
      `<a class="nav-item ${active === key ? "active" : ""}" href="#${key}" ${active === key ? 'aria-current="page"' : ""}>${icon(picture)}<span>${label}</span></a>`).join("")}</nav>`;
  }
  function counts() {
    const learned = dictionary.filter(entry => wordState(state, entry.id).stage > 0);
    const due = learned.filter(entry => wordState(state, entry.id).dueAt <= Date.now());
    return { learned, due, mastered: learned.filter(entry => wordState(state, entry.id).stage === 5) };
  }
  function homeView() {
    const { learned, due, mastered } = counts(), progress = overallProgress(dictionary, state), batch = nextLearnBatch(dictionary, state);
    const nextEntry = byId.get(batch[0]);
    const nextDue = learned.length ? Math.min(...learned.map(entry => wordState(state, entry.id).dueAt)) : null;
    const modules = [...new Map(dictionary.map(entry => [entry.module_id, entry.module])).entries()];
    const date = new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" }).format(new Date());
    return `<section class="intro"><div><p class="eyebrow">Your everyday Romanian</p><h1>Puțin, <em>în fiecare zi.</em></h1><p class="muted">A little, every day. That's how it sticks.</p></div><div class="date-mark">${date}<br>Small steps. Real progress.</div></section>
      <div class="home-grid"><section class="overview" aria-label="Overall progress"><div><p class="eyebrow">The bigger picture</p><h2>Every word is a step.</h2><p>Learn it. Recall it. Make it yours.</p><div class="overview-stats"><div><strong>${learned.length}<span> / ${dictionary.length}</span></strong><span>introduced</span></div><div><strong>${mastered.length}</strong><span>mastered</span></div><div><strong>${due.length}</strong><span>ready to review</span></div></div></div><div class="ring" style="--progress:${progress}%" role="progressbar" aria-label="Overall learning progress" aria-valuenow="${progress.toFixed(1)}" aria-valuemin="0" aria-valuemax="100"><div class="ring-inner"><strong>${progress > 0 && progress < 1 ? progress.toFixed(1) : Math.round(progress)}%</strong><span>of your journey</span></div></div></section>
      <div class="action-grid"><button class="action-card" data-action="start-learn"><span class="action-icon">${icon("book")}</span><h2>${state.learnSession ? "Continue learning" : "Learn something new"}</h2><p>${state.learnSession ? "Your small batch is right where you left it." : nextEntry ? `${escape(nextEntry.module)}. One small batch at a time.` : "You've met every word. Keep making them stick."}</p><span class="small">${state.learnSession ? `${state.learnSession.ids.length} words in progress` : batch.length ? `${batch.length} new ${batch.length === 1 ? "word" : "words"} · at your pace` : "All words introduced"} </span>${icon("arrow", 'class="arrow"')}</button>
      <button class="action-card practice" data-action="start-practice" data-auto-early="true"><span class="action-icon">${icon("practice")}</span><h2>${state.practiceSession ? "Continue practice" : "Make it stick"}</h2><p>${state.practiceSession ? "Pick up your saved practice session." : !learned.length ? "A little recall goes a long way. Learn a batch to begin." : due.length ? "A few familiar words, ready to come back to you." : `Your next scheduled review is ${relativeTime(nextDue)}. Extra practice is always here.`}</p><span class="small">${state.practiceSession ? `${state.practiceSession.ids.length} words in this session` : due.length ? `${Math.min(10, due.length)} words ready · mixed practice` : learned.length ? "Extra practice · optional" : "Your words will appear here"}</span>${icon("arrow", 'class="arrow"')}</button></div></div>
      <div class="section-title"><h2>Your learning path</h2><a class="text-button" href="#dictionary">Open dictionary ${icon("arrow")}</a></div>
      <section class="module-list" aria-label="Module progress">${modules.map(([id, name], index) => {
        const entries = dictionary.filter(entry => entry.module_id === id), number = entries.filter(entry => wordState(state, entry.id).stage > 0).length;
        const pct = overallProgress(entries, state);
        return `<div class="module-row"><span class="module-number">${String(index + 1).padStart(2, "0")}</span><div class="module-content"><strong>${escape(name)}</strong><div class="module-progress" role="progressbar" aria-label="${escape(name)} progress" aria-valuenow="${pct.toFixed(1)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div></div><span class="small muted">${number} / ${entries.length} learned</span></div>`;
      }).join("")}</section><p class="microcopy">Your progress lives on this device. No account, just a little practice.</p>`;
  }
  function formsHtml(entry) {
    const variations = entry.variations, keys = Object.keys(variations);
    if (!keys.length) return "";
    let content;
    const subjects = SUBJECTS.filter(([key]) => ["present", "past", "future"].some(tense => variations[`${tense}_${key}`]));
    if (entry.type === "verb" && subjects.length) {
      content = `<div class="table-wrap" tabindex="0" role="region" aria-label="Conjugation table, scroll horizontally for all tenses"><table><thead><tr><th>Subject</th><th>Present</th><th>Past</th><th>Future</th></tr></thead><tbody>${subjects.map(([key, name]) => `<tr><th scope="row">${name}</th>${["present", "past", "future"].map(tense => `<td lang="ro">${escape(variations[`${tense}_${key}`] || "—")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    } else {
      const labels = { singular: "Singular", plural: "Plural", singular_definite: "The · singular", plural_definite: "The · plural", informal: "Informal", polite_or_plural: "Polite or plural", present_impersonal: "Present · impersonal", past_impersonal: "Past · impersonal", future_impersonal: "Future · impersonal" };
      content = `<div class="forms-grid">${Object.entries(variations).map(([key, value]) => `<div class="form-item"><small>${escape(labels[key] || key.replaceAll("_", " "))}</small><span lang="ro">${escape(value)}</span></div>`).join("")}</div>`;
    }
    return `<details class="word-section"><summary>Forms <small>${keys.length} variations</small></summary>${content}</details>`;
  }
  function wordCard(entry) {
    return `<article class="word-card"><div class="word-face"><div class="badges"><span class="badge">${escape(entry.type)}</span>${entry.gender ? `<span class="badge">${escape(entry.gender)}</span>` : ""}</div><h1 lang="ro">${escape(entry.ro)}</h1><p class="word-translation">${escape(entry.en)}</p>${entry.notes ? `<p class="note">${escape(entry.notes)}</p>` : ""}</div>${formsHtml(entry)}<section class="word-section"><h2>In everyday conversation</h2>${entry.examples.map(example => `<div class="example"><span lang="ro">${escape(example.ro)}</span><span class="translation">${escape(example.en)}</span></div>`).join("")}</section></article>`;
  }
  function emptyView(title, message, action = "start-learn", label = "Learn a small batch", picture = "book") {
    return `<div class="narrow"><div class="empty"><span class="action-icon">${icon(picture)}</span><h1>${title}</h1><p>${message}</p>${button(label, action)}</div></div>`;
  }
  function learnView() {
    const session = state.learnSession;
    if (!session) {
      return nextLearnBatch(dictionary, state).length ?
        emptyView("Your next small step.", "Meet up to five new words, with examples and useful forms. Take your time.", "start-learn", "Start learning") :
        emptyView("You've met them all.", "Every pilot word is introduced. A little practice will help them stay.", "start-practice", "Keep practising", "check");
    }
    const entry = byId.get(session.ids[session.index]);
    return `<div class="narrow"><a href="#home" class="back-link">${icon("back")} Save & leave</a><div class="lesson-top"><span class="eyebrow">${escape(entry.module)}</span><span class="small muted">Word ${session.index + 1} of ${session.ids.length}</span></div><div class="lesson-track" aria-label="Word ${session.index + 1} of ${session.ids.length}">${session.ids.map((id, i) => `<span class="${i <= session.index ? "filled" : ""}"></span>`).join("")}</div>${wordCard(entry)}<div class="lesson-actions">${button("Previous", "learn-back", "secondary", session.index === 0 ? "disabled" : "")}${button(session.index === session.ids.length - 1 ? `Finish batch ${icon("check")}` : `Next word ${icon("arrow")}`, "learn-next")}</div><p class="microcopy">The batch is marked learned when you finish. No rush.</p></div>`;
  }
  function practiceView() {
    const session = state.practiceSession;
    if (!session) {
      const { learned, due } = counts();
      if (!learned.length) return emptyView("A few words first.", "Learn your first small batch, then come back to put it into practice.", "start-learn", "Learn your first words", "practice");
      const nextDue = Math.min(...learned.map(entry => wordState(state, entry.id).dueAt));
      return emptyView(due.length ? "Ready for a little recall?" : "You're up to date.", due.length ? `${due.length} learned entries are ready to review.` : `Your next scheduled review is ${relativeTime(nextDue)}. You can also practise early, if you feel like it.`, due.length ? "start-practice" : "practice-early", due.length ? "Start practice" : "Do some extra practice", "practice");
    }
    const question = session.question, entry = byId.get(question.entryId), result = session.result;
    const language = question.mode < 2 ? "en" : "ro", choice = question.mode % 2 === 0;
    const progress = wordState(state, entry.id), current = session.queue[session.index];
    const prompt = question.mode < 2 ? entry.ro : displayEnglish(entry);
    const direction = question.mode < 2 ? "Romanian → English" : "English → Romanian";
    return `<div class="narrow"><a class="back-link" href="#home">${icon("back")} Save & leave</a><div class="lesson-top"><span class="eyebrow">${session.ids.length} words · ${session.early ? "extra practice" : "scheduled practice"}</span><span class="small muted">Question ${session.index + 1} of ${session.queue.length}</span></div><div class="lesson-track" role="progressbar" aria-label="Practice session" aria-valuenow="${session.index}" aria-valuemin="0" aria-valuemax="${session.queue.length}"><span class="filled" style="flex:${Math.max(.01, session.index)}"></span><span style="flex:${session.queue.length - session.index}"></span></div>
      <section class="question-card"><div class="row between"><p class="question-direction">${icon(choice ? "practice" : "book")} ${direction}</p>${current.retries ? '<span class="badge retry">Another look</span>' : `<span class="badge">${Math.min(4, question.mode + 1)} / 4</span>`}</div><h1 class="prompt" ${question.mode < 2 ? 'lang="ro"' : ""}>${escape(prompt)}</h1><p class="instruction">${choice ? "Choose the right meaning." : language === "en" ? "Type the English meaning. One meaning is enough." : "Type the Romanian. Diacritics are optional."}</p>
      ${choice ? `<div class="choices">${question.choices.map((id, index) => {
        const candidate = byId.get(id), label = language === "en" ? displayEnglish(candidate) : candidate.ro;
        const status = result ? id === entry.id ? "right" : id === result.chosenId ? "wrong" : "" : "";
        return `<button class="choice ${status}" data-action="choose" data-id="${escape(id)}" ${result ? "disabled" : ""}><span class="choice-number">${index + 1}</span><span ${language === "ro" ? 'lang="ro"' : ""}>${escape(label)}</span>${status ? icon(status === "right" ? "check" : "close", 'class="answer-icon"') : ""}</button>`;
      }).join("")}</div>` : `<form id="answer-form"><label class="screen-reader" for="typed-answer">${language === "en" ? "English" : "Romanian"} answer</label><input class="answer-input" id="typed-answer" name="answer" type="text" placeholder="${language === "en" ? "Your English answer…" : "Răspunsul tău…"}" lang="${language}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" required maxlength="300" ${result ? `disabled value="${escape(result.response)}"` : ""}>${!result ? '<button class="button full" type="submit">Check answer</button>' : ""}</form>`}
      <div class="entry-status"><span>${progress.stage === 5 ? "Mastered · still growing" : `${progress.stage * 20}% of this word's journey`}</span>${steps(progress.stage)}</div></section>
      ${result ? `<section id="feedback" class="feedback ${result.correct ? "" : "wrong"}" role="status"><h2>${icon(result.correct ? "check" : "close")} ${result.correct ? "That's it." : "Not quite. You'll see it again."}</h2><p>${result.correct ? "The dictionary form:" : "The answer to remember:"} <span class="expected" ${language === "ro" ? 'lang="ro"' : ""}>${escape(language === "en" ? entry.en : entry.ro)}</span></p><p class="small"><span lang="ro">${escape(entry.examples[0].ro)}</span><br><span class="muted">${escape(entry.examples[0].en)}</span></p>${!result.correct && current.retries >= 2 ? '<p class="small">Let this one rest for a moment. It will be ready to review again soon.</p>' : ""}${button(`${session.index === session.queue.length - 1 ? "Finish practice" : "Continue"} ${icon("arrow")}`, "next-question")}</section>` : '<p class="microcopy">Every attempt helps choose what you practise next.</p>'}</div>`;
  }
  function summaryView() {
    const summary = state.lastSummary;
    if (!summary) return homeView();
    const learned = summary.type === "learn", total = summary.ids.length;
    const remaining = summary.ids.filter(id => wordState(state, id).lastCorrect === false).length;
    return `<div class="narrow"><section class="summary-card"><span class="action-icon">${icon("check")}</span><p class="eyebrow">${learned ? "A small batch, a real step" : "Practice complete"}</p><h1>${learned ? `${total} more ${total === 1 ? "word" : "words"} in your world.` : "A little more familiar."}</h1><p>${learned ? "You've met them. Now a little recall will help them stay." : remaining ? `${remaining} ${remaining === 1 ? "entry needs" : "entries need"} another look. The app will bring them back soon.` : "Good work. Your next reviews are scheduled for you."}</p>
      <div class="summary-stats"><div><strong>${total}</strong><span>${learned ? "words introduced" : "words practised"}</span></div><div><strong>${learned ? `${Math.round(overallProgress(dictionary, state))}%` : `${summary.correct} / ${summary.attempts}`}</strong><span>${learned ? "overall progress" : "answers correct"}</span></div></div><div class="summary-words">${summary.ids.map(id => `<span lang="ro">${escape(byId.get(id)?.ro || id)}</span>`).join("")}</div><div class="summary-actions">${learned ? button("Practise your words", "start-practice") : '<a class="button" href="#home">Back to home</a>'}${learned ? '<a class="button secondary" href="#home">Back to home</a>' : button("Learn a small batch", "start-learn", "secondary")}</div></section></div>`;
  }
  function dictionaryRows() {
    const search = normalize(ui.search);
    let list = dictionary.filter(entry => normalize(`${entry.ro} ${entry.en} ${entry.module}`).includes(search));
    const indices = new Map(dictionary.map((entry, index) => [entry.id, index]));
    if (ui.sort === "alphabetical") list.sort((a, b) => a.ro.localeCompare(b.ro, "ro"));
    else if (ui.sort === "failures") list.sort((a, b) => {
      const ap = wordState(state, a.id), bp = wordState(state, b.id);
      const ar = ap.total ? ap.failed / ap.total : -1, br = bp.total ? bp.failed / bp.total : -1;
      return br - ar || bp.total - ap.total || indices.get(a.id) - indices.get(b.id);
    });
    return `<p class="list-note">${list.length} ${list.length === 1 ? "entry" : "entries"} · ${ui.sort === "priority" ? "In learning order" : ui.sort === "failures" ? "Most failed first · unattempted last" : "Romanian alphabetical order"}</p><div class="word-list">${list.length ? list.map(entry => {
      const progress = wordState(state, entry.id);
      return `<a class="word-row" href="#entry/${encodeURIComponent(entry.id)}"><span class="word-rank">${String(indices.get(entry.id) + 1).padStart(2, "0")}</span><div><strong lang="ro">${escape(entry.ro)}</strong><span class="word-en">${escape(displayEnglish(entry))}</span>${steps(progress.stage)}</div><span class="word-module">${escape(entry.module)}</span><span class="word-failures">${progress.total ? `${Math.round(progress.failed / progress.total * 100)}% missed` : "Not tried"}<small>${progress.total} ${progress.total === 1 ? "attempt" : "attempts"}</small></span>${icon("arrow")}</a>`;
    }).join("") : '<p class="muted" style="padding:24px">No entries match your search.</p>'}</div>`;
  }
  function dictionaryView() {
    return `<div class="page-heading"><p class="eyebrow muted">Every word, in one place</p><h1>Your Romanian wordbook.</h1><p>Look something up. Find a tricky word. See how far it's come.</p></div><div class="dictionary-tools"><label class="search-field">${icon("search")}<span class="screen-reader">Search dictionary</span><input id="dictionary-search" type="search" placeholder="Find a word…" value="${escape(ui.search)}" autocomplete="off"></label><label class="sort-field"><span class="screen-reader">Sort dictionary</span><select id="dictionary-sort"><option value="priority" ${ui.sort === "priority" ? "selected" : ""}>Priority</option><option value="alphabetical" ${ui.sort === "alphabetical" ? "selected" : ""}>Alphabetical</option><option value="failures" ${ui.sort === "failures" ? "selected" : ""}>Failure ratio</option></select></label></div><div id="dictionary-results">${dictionaryRows()}</div>`;
  }
  function entryView(id) {
    const entry = byId.get(id);
    if (!entry) return emptyView("Word not found.", "Return to the dictionary to find an entry.", "dictionary", "Open dictionary");
    const progress = wordState(state, id);
    queueMicrotask(() => loadHistory(id));
    return `<div class="narrow"><a class="back-link" href="#dictionary">${icon("back")} Dictionary</a><div class="lesson-top"><span class="eyebrow">${escape(entry.module)}</span><span class="badge">${escape(STAGE_LABELS[progress.stage])}</span></div><div class="entry-status"><span>${progress.stage * 20}% complete${progress.stage ? ` · next review ${relativeTime(progress.dueAt)}` : ""}</span>${steps(progress.stage)}</div>${wordCard(entry)}<div class="section-title"><h2>Practice history</h2><span class="small muted">${progress.total} attempts</span></div><section class="word-card word-section" id="history-list"><p class="muted small">Loading attempts…</p></section></div>`;
  }
  async function loadHistory(id) {
    try {
      const attempts = await allAttempts(id);
      if (route()[0] !== "entry" || decodeURIComponent(route()[1] || "") !== id) return;
      const node = document.getElementById("history-list");
      if (!node) return;
      attempts.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
      node.innerHTML = attempts.length ? `${attempts.length > 20 ? `<p class="small muted">Most recent 20 of ${attempts.length} attempts. Export a backup for the complete history.</p>` : ""}${attempts.slice(0, 20).map(attempt => `<div class="history-item">${icon(attempt.correct ? "check" : "close", `class="${attempt.correct ? "success-text" : "failure-text"}"`)}<div><small>${escape(MODE_LABELS[attempt.mode])}</small><p>${escape(attempt.response)} · <span class="${attempt.correct ? "success-text" : "failure-text"}">${attempt.correct ? "Correct" : "Missed"}</span></p><time datetime="${escape(attempt.timestamp)}">${escape(new Date(attempt.timestamp).toLocaleString())} · ${(attempt.durationMs / 1000).toFixed(1)} sec</time></div></div>`).join("")}` : '<p class="small muted">No attempts yet. Once you practise this entry, every answer will appear here.</p>';
    } catch { const node = document.getElementById("history-list"); if (node) node.textContent = "History couldn't load. Please reopen this entry."; }
  }
  function updateConnection() {
    const node = document.getElementById("connection");
    if (!node) return;
    node.textContent = !navigator.onLine ? offlineReady ? "Offline · ready" : "Offline" : offlineReady ? "Ready offline" : "On this device";
    node.classList.toggle("offline", !navigator.onLine);
  }
  function render() {
    let [page, id] = route();
    if (page === "main") {
      const main = document.getElementById("main");
      if (main) { main.focus(); return; }
      page = "home";
    }
    if (!["home", "learn", "practice", "dictionary", "entry", "summary"].includes(page)) page = "home";
    const title = ({ home: "A little, every day", learn: "Learn", practice: "Practice", dictionary: "Dictionary", entry: byId.get(id)?.ro || "Dictionary", summary: "Small steps" })[page];
    document.title = `${title} · Română`;
    const content = page === "home" ? homeView() : page === "learn" ? learnView() : page === "practice" ? practiceView() :
      page === "dictionary" ? dictionaryView() : page === "entry" ? entryView(decodeURIComponent(id || "")) : summaryView();
    app.innerHTML = `${header(page)}<main id="main" class="main" tabindex="-1">${content}</main>${navigation(page === "entry" ? "dictionary" : page)}`;
    updateConnection();
  }
  function renderSettings(confirm = "") {
    const { learned } = counts();
    settings.innerHTML = `<div class="row between"><h2 id="settings-title">Make yourself at home.</h2><button class="icon-button" data-action="close-settings" aria-label="Close settings">${icon("close")}</button></div><p class="small muted" style="margin-top:14px">A little Romanian, on your terms.</p>
      <div class="install-tip"><h3>Take it with you</h3><p>On iPhone, open this page in Safari, tap Share, then <strong>Add to Home Screen</strong>. Open the app once while online to prepare it for offline use.</p><span class="badge">${offlineReady ? "App and dictionary ready offline" : "Offline download not confirmed yet"}</span></div>
      <section class="modal-section"><h3>Progress on this device</h3><p>${learned.length} learned entries. Progress and answer history stay in this browser. Nothing is sent to a server.</p><div class="row wrap">${button(`${icon("download")} Export backup`, "export", "secondary")}${button(`${icon("upload")} Import backup`, "import", "secondary")}</div><input id="backup-file" type="file" accept=".json,application/json" hidden></section>
      <section class="modal-section"><h3>A fresh start</h3><p>Reset learning progress, review schedules, and all attempts. The dictionary and offline download stay available.</p>${button("Reset all progress", "confirm-reset", "secondary")}</section>
      ${confirm === "reset" ? `<section class="confirm-panel" role="alert"><h3>Reset everything?</h3><p>This permanently deletes all learning progress and attempts on this device. Export a backup first if you want to keep them.</p><div class="row">${button("Keep my progress", "cancel-confirm", "secondary")}${button("Yes, reset everything", "reset", "danger")}</div></section>` :
        confirm === "import" ? `<section class="confirm-panel" role="alert"><h3>Replace your progress?</h3><p>This backup contains ${Object.keys(pendingImport.progress.entries).length} entries and ${pendingImport.attempts.length} attempts. Importing replaces the progress currently on this device.</p><div class="row">${button("Cancel", "cancel-confirm", "secondary")}${button("Replace with backup", "apply-import", "danger")}</div></section>` : ""}`;
    if (confirm) settings.querySelector(".confirm-panel")?.scrollIntoView({ block: "nearest" });
  }
  async function exportBackup() {
    try {
      const snapshot = await new Promise((resolve, reject) => {
        const transaction = database.transaction(["meta", "attempts"], "readonly");
        const progress = transaction.objectStore("meta").get("main");
        const attempts = transaction.objectStore("attempts").getAll();
        transaction.oncomplete = () => resolve({ progress: progress.result || freshState(), attempts: attempts.result });
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      const text = JSON.stringify({ format: "bashuk-ro", version: 1, exportedAt: new Date().toISOString(), ...snapshot }, null, 2);
      const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = `romana-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast("Backup exported. Keep it somewhere safe.");
    } catch { toast("The backup couldn't be exported. Please try again."); }
  }
  async function importFile(file) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast("This backup is too large to import (25 MB maximum)."); return; }
    try { pendingImport = validateBackup(JSON.parse(await file.text())); renderSettings("import"); }
    catch (error) { toast(error.message || "This file isn't a valid progress backup."); }
  }
  async function handleAction(action, element) {
    if (saving) return;
    if (action === "start-learn") return startLearn();
    if (action === "start-practice" || action === "practice-early") {
      return startPractice(action === "practice-early" || (element?.dataset.autoEarly === "true" && counts().due.length === 0));
    }
    if (action === "learn-next" || action === "learn-back") return learnNext(action === "learn-back");
    if (action === "choose") return submitAnswer(element.dataset.id);
    if (action === "next-question") return nextQuestion();
    if (action === "dictionary") return go("dictionary");
    if (action === "settings") { renderSettings(); settings.showModal(); return; }
    if (action === "close-settings") { settings.close(); return; }
    if (action === "confirm-reset") return renderSettings("reset");
    if (action === "cancel-confirm") { pendingImport = null; return renderSettings(); }
    if (action === "export") return exportBackup();
    if (action === "import") return document.getElementById("backup-file").click();
    if (action === "reset") {
      if (await commit(freshState(), null, [])) { settings.close(); go("home"); toast("A fresh start. All progress has been reset."); }
    }
    if (action === "apply-import" && pendingImport) {
      if (await commit(pendingImport.progress, null, pendingImport.attempts)) {
        pendingImport = null; settings.close(); go("home"); toast("Your progress has been restored.");
      }
    }
  }
  async function registerOffline() {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
      navigator.serviceWorker.addEventListener("message", event => {
        if (event.data?.type === "OFFLINE_READY") { offlineReady = true; updateConnection(); }
      });
      const ready = await navigator.serviceWorker.ready;
      ready.active?.postMessage({ type: "CACHE_STATUS" });
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "activated") { installing.postMessage({ type: "CACHE_STATUS" }); }
        });
      });
    } catch { toast("Offline setup couldn't finish. You can keep using the app online and try again later."); }
  }
  async function boot() {
    try {
      const response = await fetch("./dictionary.json");
      if (!response.ok) throw new Error("The dictionary could not be downloaded. Connect once and reload.");
      dictionary = await response.json();
      if (!Array.isArray(dictionary) || !dictionary.length || new Set(dictionary.map(entry => entry.id)).size !== dictionary.length ||
          dictionary.some(entry => !entry.id || !entry.ro || !entry.en || !Array.isArray(entry.examples) || !entry.variations)) {
        throw new Error("The dictionary is incomplete. Please reload after the download finishes.");
      }
      byId = new Map(dictionary.map(entry => [entry.id, entry]));
      database = await openDatabase();
      state = await readRecord("meta", "main") || freshState();
      if (state.version !== 1) throw new Error("This progress format needs a newer version of the app.");
      if (state.learnSession?.ids.some(id => !byId.has(id))) state.learnSession = null;
      if (state.practiceSession?.queue.some(item => !byId.has(item.id))) state.practiceSession = null;
      document.addEventListener("click", event => {
        const target = event.target.closest("[data-action]");
        if (target) { event.preventDefault(); Promise.resolve(handleAction(target.dataset.action, target)).catch(() => toast("Something didn't finish. Your saved progress is still here. Please try again.")); }
      });
      document.addEventListener("submit", event => {
        if (event.target.id === "answer-form") { event.preventDefault(); submitAnswer(new FormData(event.target).get("answer")); }
      });
      document.addEventListener("input", event => {
        if (event.target.id === "dictionary-search") { ui.search = event.target.value; document.getElementById("dictionary-results").innerHTML = dictionaryRows(); }
      });
      document.addEventListener("change", event => {
        if (event.target.id === "dictionary-sort") { ui.sort = event.target.value; document.getElementById("dictionary-results").innerHTML = dictionaryRows(); }
        if (event.target.id === "backup-file") importFile(event.target.files[0]);
      });
      settings.addEventListener("click", event => { if (event.target === settings) { const rect = settings.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) settings.close(); } });
      settings.addEventListener("close", () => { pendingImport = null; });
      window.addEventListener("hashchange", render);
      window.addEventListener("online", updateConnection); window.addEventListener("offline", updateConnection);
      window.addEventListener("pageshow", event => {
        if (event.persisted) readRecord("meta", "main").then(saved => { if (saved) state = saved; render(); }).catch(() => toast("Please reload to read your latest progress."));
      });
      render();
      registerOffline();
    } catch (error) {
      app.innerHTML = `<main class="main narrow"><section class="empty"><span class="brand-mark">ro.</span><h1 style="margin-top:24px">Let's get you ready.</h1><p>${escape(error.message || "Local progress storage is unavailable. Enable browser storage and reload.")}</p><button class="button" onclick="location.reload()">Try again</button></section></main>`;
    }
  }
  boot();
})();
