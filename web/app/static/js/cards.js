// Flashcard study session: spaced repetition ("due") or a schedule-free run-through ("cram").
import { api, typing } from "netlab";

const root = document.getElementById("study");
const deck = root.dataset.deck;
const mode = root.dataset.mode;
const LEARN_AHEAD_SECONDS = 20 * 60;
const RATINGS = [
  { r: 1, key: "1", label: "Again", cls: "again" },
  { r: 2, key: "2", label: "Hard", cls: "hard" },
  { r: 3, key: "3", label: "Good", cls: "good" },
  { r: 4, key: "4", label: "Easy", cls: "easy" },
];

let queue = [];
let current = null;
let flipped = false;
let busy = false;
const session = { reviewed: 0, again: 0, started: Date.now() };

function counts() {
  const all = current ? [current, ...queue] : queue;
  if (mode === "cram") return `<div class="counts"><span>${all.length} left</span></div>`;
  const n = (pred) => all.filter(pred).length;
  return `<div class="counts" title="new · learning · due">
    <span class="n-new">${n((c) => c.state === "new")}</span>
    <span class="n-learn">${n((c) => c.state === "learning" || c.state === "relearning")}</span>
    <span class="n-due">${n((c) => c.state === "review")}</span></div>`;
}

function render() {
  if (!current) { renderDone(); return; }
  const buttons = mode === "cram"
    ? `<button class="btn again btn-lg" data-rate="1">Again<small>see it again</small></button>
       <button class="btn good btn-lg" data-rate="3" style="grid-column: span 3">Got it<small>drop from this run</small></button>`
    : RATINGS.map((b) => `<button class="btn ${b.cls}" data-rate="${b.r}">${b.label}<small>${current.preview[b.r]}</small></button>`).join("");
  root.innerHTML = `
    ${counts()}
    <div class="card flashcard" id="face" style="margin-top:12px" tabindex="0" aria-live="polite">
      <div class="front">${current.front_html}</div>
      ${flipped ? `<div class="back">${current.back_html}</div>` : '<div class="muted small" style="margin-top:18px">Recall the answer, then tap or press Space</div>'}
    </div>
    ${flipped ? `<div class="rate">${buttons}</div>`
              : '<div class="rate" style="grid-template-columns:1fr"><button class="btn btn-primary btn-lg" id="show">Show answer</button></div>'}`;
  root.querySelector("#face").addEventListener("click", flip);
  root.querySelector("#show")?.addEventListener("click", flip);
  root.querySelectorAll("[data-rate]").forEach((b) => b.addEventListener("click", () => rate(Number(b.dataset.rate))));
}

function renderDone() {
  const mins = Math.max(1, Math.round((Date.now() - session.started) / 60000));
  const recall = session.reviewed ? Math.round(100 * (1 - session.again / session.reviewed)) : null;
  root.innerHTML = `<div class="card empty">
    <h2 style="margin-top:0">${session.reviewed ? "Session complete" : "Nothing due right now"}</h2>
    <p>${session.reviewed
      ? `${session.reviewed} card${session.reviewed === 1 ? "" : "s"} in about ${mins} min${recall !== null ? ` · ${recall}% recalled first time` : ""}.`
      : mode === "cram" ? "This deck has no cards." : "Reviews are scheduled for later, and today's new cards are used up. Come back tomorrow, or cram a deck."}</p>
    <div class="row" style="justify-content:center"><a class="btn btn-primary" href="/cards">Back to decks</a>
    <a class="btn" href="/cards/study?${deck ? `deck=${deck}&` : ""}mode=cram">Cram this ${deck ? "deck" : "collection"}</a></div></div>`;
}

function flip() {
  if (!current || flipped) return;
  flipped = true;
  render();
}

function next() {
  current = queue.shift() || null;
  flipped = false;
  render();
}

async function rate(r) {
  if (!current || !flipped || busy) return;
  session.reviewed += 1;
  if (r === 1) session.again += 1;
  if (mode === "cram") {
    if (r === 1) queue.splice(Math.min(queue.length, 4), 0, current);
    next();
    return;
  }
  busy = true;
  const card = current;
  try {
    const res = await api("POST", `/api/cards/${card.id}/review`, { rating: r });
    // Short learning steps come back in this session; graduated cards are done for today.
    if (res.due_in_seconds <= LEARN_AHEAD_SECONDS) {
      card.state = res.state;
      card.preview = res.preview;
      const gap = r === 1 ? 3 : 6;
      queue.splice(Math.min(queue.length, gap), 0, card);
    }
    next();
  } catch (err) {
    session.reviewed -= 1;
    if (r === 1) session.again -= 1;
  } finally {
    busy = false;
  }
}

document.addEventListener("keydown", (e) => {
  if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === " " || e.key === "Enter") {
    if (!flipped) { e.preventDefault(); flip(); }
    else if (e.key === " " && mode !== "cram") { e.preventDefault(); rate(3); }
    return;
  }
  if (!flipped) return;
  if (mode === "cram") {
    if (e.key === "1") rate(1);
    if (["2", "3", "4"].includes(e.key)) rate(3);
  } else if (["1", "2", "3", "4"].includes(e.key)) rate(Number(e.key));
});

async function load() {
  if (mode === "cram") {
    queue = JSON.parse(document.getElementById("cram-cards").textContent);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  } else {
    const res = await api("GET", "/api/cards/queue" + (deck ? `?deck=${encodeURIComponent(deck)}` : ""));
    queue = res.cards;
  }
  next();
}

load();
