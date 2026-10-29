// Quiz runner: one question at a time, practice (instant feedback) or exam (timed).
import { api, el, toast, typing } from "netlab";
import { setSelection, showResult, toggle, selected } from "netlab/mcq";

const root = document.getElementById("quiz");
const quizId = root.dataset.id;
const flagKey = `netlab-quiz-flags-${quizId}`;
let state;
let index = 0;
let timerHandle;
let clockSkew = 0;
let flags = new Set();
try { flags = new Set(JSON.parse(localStorage.getItem(flagKey) || "[]")); } catch (e) { /* storage off */ }

function saveFlags() {
  try { localStorage.setItem(flagKey, JSON.stringify([...flags])); } catch (e) { /* storage off */ }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function questionMarkup(q, n) {
  const opts = q.options.map((o) =>
    `<li><button type="button" class="mcq-opt" data-letter="${o.letter}"><span class="mcq-letter">${o.letter}</span><span class="mcq-text">${o.html}</span></button></li>`).join("");
  const badge = q.multi > 1 ? `<span class="mcq-badge">Choose ${q.multi}</span>` : "";
  return `<div class="mcq" data-qid="${esc(q.id)}" data-multi="${q.multi}">
    <div class="mcq-head"><span class="mcq-num">Question ${n}</span>${badge}
      <span class="mcq-prev muted tiny">${esc(q.group_title)}</span></div>
    <div class="mcq-stem">${q.stem_html}</div>
    <ol class="mcq-options">${opts}</ol>
    <div class="mcq-actions">
      ${state.mode === "practice" ? '<button type="button" class="btn btn-primary mcq-check" disabled>Check answer</button>' : ""}
      <span class="mcq-status" aria-live="polite"></span>
    </div>
    <div class="mcq-explain" hidden></div>
  </div>`;
}

function navClass(q, i) {
  const cls = [];
  if (i === index) cls.push("current");
  if (flags.has(q.id)) cls.push("flagged");
  if (q.correct === true) cls.push("right");
  else if (q.correct === false) cls.push("wrong");
  else if (q.selected) cls.push("answered");
  return cls.join(" ");
}

function renderRunner() {
  const q = state.questions[index];
  const answered = state.questions.filter((x) => x.selected).length;
  const last = index === state.questions.length - 1;
  root.innerHTML = `
    <div class="quiz-top">
      <div><h1 style="font-size:1.25rem;margin:0">${esc(state.title)}</h1>
        <div class="muted small">${state.mode === "exam" ? "Exam mode" : "Practice mode"} · ${answered} of ${state.total} answered</div></div>
      <div class="row">${state.deadline ? '<span class="timer" id="timer">--:--</span>' : ""}
        <button class="btn btn-sm" type="button" id="finish">${state.mode === "exam" ? "Submit exam" : "End quiz"}</button></div>
    </div>
    <div class="qnav" id="qnav">${state.questions.map((x, i) =>
      `<button type="button" class="${navClass(x, i)}" data-goto="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`).join("")}</div>
    <div id="confirm"></div>
    <div id="slot">${questionMarkup(q, index + 1)}</div>
    <div class="spread" style="margin-top:8px">
      <button class="btn" type="button" id="prev" ${index === 0 ? "disabled" : ""}>← Previous</button>
      ${state.mode === "exam" ? `<button class="btn btn-ghost" type="button" id="flag">${flags.has(q.id) ? "Unflag" : "Flag for review"}</button>` : ""}
      <button class="btn ${last ? "" : "btn-primary"}" type="button" id="next" ${last ? "disabled" : ""}>Next →</button>
    </div>
    <p class="muted tiny" style="text-align:center;margin-top:16px"><kbd>A</kbd>–<kbd>E</kbd> pick · <kbd>Enter</kbd> ${state.mode === "practice" ? "check / next" : "next"} · <kbd>←</kbd> <kbd>→</kbd> move</p>`;
  const box = root.querySelector(".mcq");
  if (q.selected) setSelection(box, q.selected);
  if (q.correct !== undefined && q.answer) {
    showResult(box, { correct: q.correct, answer: q.answer, selected: q.selected, explanation_html: q.explanation_html, link: q.link });
  }
  bindRunner(box, q);
  tick();
}

function bindRunner(box, q) {
  box.addEventListener("click", async (e) => {
    const opt = e.target.closest(".mcq-opt");
    if (opt && !opt.disabled) {
      toggle(box, opt);
      if (state.mode === "exam") await saveExamAnswer(box, q);
      return;
    }
    if (e.target.closest(".mcq-check")) await checkPractice(box, q);
  });
  root.querySelector("#qnav").addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]");
    if (b) go(Number(b.dataset.goto));
  });
  root.querySelector("#prev").addEventListener("click", () => go(index - 1));
  root.querySelector("#next").addEventListener("click", () => go(index + 1));
  root.querySelector("#finish").addEventListener("click", confirmFinish);
  root.querySelector("#flag")?.addEventListener("click", () => {
    if (flags.has(q.id)) flags.delete(q.id); else flags.add(q.id);
    saveFlags();
    renderRunner();
  });
}

async function checkPractice(box, q) {
  const check = box.querySelector(".mcq-check");
  if (!check || check.disabled) return;
  check.disabled = true;
  try {
    const res = await api("POST", `/api/quiz/${quizId}/answer`, { question: q.id, selected: selected(box) });
    Object.assign(q, { selected: res.selected, correct: res.correct, answer: res.answer, explanation_html: res.explanation_html, link: res.link });
    showResult(box, res);
    box.querySelector(".mcq-retry")?.remove();
    const nav = root.querySelector(`[data-goto="${index}"]`);
    nav.className = navClass(q, index);
    if (state.questions.every((x) => x.selected)) {
      const done = el("button", { type: "button", class: "btn btn-primary" }, "See results");
      done.addEventListener("click", finish);
      box.querySelector(".mcq-actions").appendChild(done);
    }
  } catch (err) {
    check.disabled = false;
  }
}

async function saveExamAnswer(box, q) {
  const picked = selected(box);
  const complete = picked.length === q.multi;
  // A partial pick on a "choose two" counts as unanswered until it's complete.
  if (!complete && !q.selected) return;
  try {
    const res = await api("POST", `/api/quiz/${quizId}/answer`, { question: q.id, selected: complete ? picked : [] });
    q.selected = res.selected;
    root.querySelector(`[data-goto="${index}"]`).className = navClass(q, index);
  } catch (err) {
    if (/finished/.test(err.message)) load();
  }
}

function go(i) {
  if (i < 0 || i >= state.questions.length) return;
  index = i;
  renderRunner();
  root.scrollIntoView({ block: "start" });
}

function confirmFinish() {
  const open = state.questions.filter((x) => !x.selected).length;
  const flagged = state.questions.filter((x) => flags.has(x.id)).length;
  const slot = root.querySelector("#confirm");
  const notes = [];
  if (open) notes.push(`${open} unanswered (they count as wrong)`);
  if (flagged) notes.push(`${flagged} flagged for review`);
  slot.innerHTML = `<div class="card" style="margin-bottom:14px;border-color:var(--warn)">
    <strong>${state.mode === "exam" ? "Submit the exam?" : "End the quiz?"}</strong>
    <p class="small muted" style="margin:.3em 0 .8em">${notes.length ? notes.join(" · ") : "Everything is answered."}</p>
    <div class="row"><button class="btn btn-primary" type="button" id="really-finish">Yes, ${state.mode === "exam" ? "submit" : "end it"}</button>
    <button class="btn" type="button" id="keep-going">Keep going</button></div></div>`;
  slot.querySelector("#really-finish").addEventListener("click", finish);
  slot.querySelector("#keep-going").addEventListener("click", () => { slot.innerHTML = ""; });
}

async function finish() {
  clearInterval(timerHandle);
  state = await api("POST", `/api/quiz/${quizId}/finish`);
  try { localStorage.removeItem(flagKey); } catch (e) { /* storage off */ }
  renderResults();
}

function tick() {
  clearInterval(timerHandle);
  const t = root.querySelector("#timer");
  if (!t || !state.deadline) return;
  const deadline = new Date(state.deadline).getTime();
  const update = () => {
    const left = Math.max(0, Math.round((deadline - (Date.now() + clockSkew)) / 1000));
    t.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    t.classList.toggle("low", left <= 60);
    if (left === 0) {
      clearInterval(timerHandle);
      toast("Time's up. Your exam was submitted.");
      finish();
    }
  };
  update();
  timerHandle = setInterval(update, 1000);
}

function ring(pctValue, good) {
  const r = 58, c = 2 * Math.PI * r;
  return `<svg class="score-ring" viewBox="0 0 140 140" role="img" aria-label="${pctValue}%">
    <circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="12"/>
    <circle cx="70" cy="70" r="${r}" fill="none" stroke="${good ? "var(--good)" : "var(--bad)"}" stroke-width="12"
      stroke-linecap="round" stroke-dasharray="${(c * pctValue) / 100} ${c}" transform="rotate(-90 70 70)"/>
    <text x="70" y="78" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor">${pctValue}%</text></svg>`;
}

function renderResults(onlyWrong = false) {
  const total = state.total;
  const score = state.score ?? 0;
  const pctValue = total ? Math.round((100 * score) / total) : 0;
  const byTopic = {};
  for (const q of state.questions) {
    const t = (byTopic[q.group_title] ||= { n: 0, right: 0 });
    t.n += 1;
    if (q.correct) t.right += 1;
  }
  const topics = Object.entries(byTopic).sort((a, b) => a[1].right / a[1].n - b[1].right / b[1].n);
  const list = state.questions.map((q, i) => ({ q, i })).filter(({ q }) => !onlyWrong || !q.correct);
  root.innerHTML = `
    <div class="card result-head">
      ${ring(pctValue, pctValue >= 85)}
      <div>
        <h1 style="font-size:1.35rem;margin:0 0 4px">${esc(state.title)}</h1>
        <p style="margin:0">${score} of ${total} correct. ${pctValue >= 85 ? "That's exam-ready territory." : "Under 85%: re-read the weak topics below, then retry your misses."}</p>
        <div class="row" style="margin-top:12px">
          <a class="btn btn-primary" href="/quiz?source=${state.source}&filter=missed">Retry missed questions</a>
          <a class="btn" href="/quiz">New quiz</a>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>By topic</h3>
      <ul class="list">${topics.map(([t, v]) => `<li class="spread"><span>${esc(t)}</span>
        <span class="pill ${v.right / v.n >= 0.85 ? "pill-good" : "pill-bad"}">${v.right}/${v.n}</span></li>`).join("")}</ul>
    </div>
    <div class="spread" style="margin:24px 0 8px">
      <h2 style="margin:0;font-size:1.15rem">Review</h2>
      <label class="row small"><input type="checkbox" id="only-wrong" ${onlyWrong ? "checked" : ""}> Only show what I missed</label>
    </div>
    <div id="review">${list.length ? "" : '<p class="empty">Nothing missed. Nice.</p>'}</div>`;
  const review = root.querySelector("#review");
  for (const { q, i } of list) {
    const wrap = el("div", {}, questionMarkup(q, i + 1));
    const box = wrap.firstElementChild;
    if (q.selected && q.answer) {
      showResult(box, { correct: q.correct, answer: q.answer, selected: q.selected, explanation_html: q.explanation_html, link: q.link });
    } else {
      box.querySelectorAll(".mcq-opt").forEach((b) => {
        b.disabled = true;
        if ((q.answer || []).includes(b.dataset.letter)) b.classList.add("right");
      });
      const s = box.querySelector(".mcq-status");
      s.textContent = "Not answered. Answer: " + (q.answer || []).join(", ");
      s.className = "mcq-status bad";
      const exp = box.querySelector(".mcq-explain");
      if (q.explanation_html) { exp.innerHTML = q.explanation_html; exp.hidden = false; }
    }
    box.querySelector(".mcq-retry")?.remove();
    review.appendChild(box);
  }
  root.querySelector("#only-wrong").addEventListener("change", (e) => renderResults(e.target.checked));
}

document.addEventListener("keydown", (e) => {
  if (!state || state.finished || typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
  const box = root.querySelector(".mcq");
  if (!box) return;
  const key = e.key.toUpperCase();
  if (/^[A-F]$/.test(key) || /^[1-6]$/.test(key)) {
    const letter = /^[1-6]$/.test(key) ? String.fromCharCode(64 + Number(key)) : key;
    const opt = box.querySelector(`.mcq-opt[data-letter="${letter}"]`);
    if (opt && !opt.disabled) opt.click();
  } else if (e.key === "Enter") {
    const check = box.querySelector(".mcq-check");
    if (check && !check.hidden && !check.disabled) check.click();
    else root.querySelector("#next")?.click();
    e.preventDefault();
  } else if (e.key === "ArrowRight") go(index + 1);
  else if (e.key === "ArrowLeft") go(index - 1);
});

async function load() {
  state = await api("GET", `/api/quiz/${quizId}`);
  clockSkew = new Date(state.now).getTime() - Date.now();
  if (state.finished) { renderResults(); return; }
  const firstOpen = state.questions.findIndex((q) => !q.selected);
  index = firstOpen === -1 ? 0 : firstOpen;
  renderRunner();
}

load();
