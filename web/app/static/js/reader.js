// Reading page: live questions, section completion, autosaved notes, keyboard paging.
import { api, debounce, toast, typing } from "netlab";
import { reset, showResult, toggle, selected } from "netlab/mcq";

const reader = document.getElementById("reader");
const doc = reader.dataset.doc;
const page = reader.dataset.page;
const status = JSON.parse(document.getElementById("question-status").textContent || "{}");

// Badge each question with how it went last time, without giving the answer away.
document.querySelectorAll(".mcq").forEach((box) => {
  const prev = box.querySelector(".mcq-prev");
  if (prev && box.dataset.qid in status) {
    prev.hidden = false;
    prev.className = "mcq-prev pill " + (status[box.dataset.qid] ? "pill-good" : "pill-bad");
    prev.textContent = status[box.dataset.qid] ? "got it last time" : "missed last time";
  }
});

reader.addEventListener("click", async (e) => {
  const box = e.target.closest(".mcq");
  if (!box) return;
  const opt = e.target.closest(".mcq-opt");
  if (opt && !opt.disabled) { toggle(box, opt); return; }
  if (e.target.closest(".mcq-retry")) { reset(box); return; }
  const check = e.target.closest(".mcq-check");
  if (check && !check.disabled) {
    check.disabled = true;
    try {
      const res = await api("POST", `/api/questions/${encodeURIComponent(box.dataset.qid)}/answer`,
        { selected: selected(box) });
      showResult(box, { ...res, link: null });
      recordAnswer(box.dataset.qid, res.correct);
      const prev = box.querySelector(".mcq-prev");
      prev.hidden = false;
      prev.className = "mcq-prev pill " + (res.correct ? "pill-good" : "pill-bad");
      prev.textContent = res.correct ? "got it" : "missed";
    } catch (err) {
      check.disabled = false;
    }
  }
});

// A section is done when every question on it has been answered correctly (latest answer), or,
// with no questions, once it has been read to the end. Nothing to tick, so nothing to tick by accident.
const sectionBox = document.getElementById("section-status");
const sectionText = document.getElementById("section-text");
const total = +sectionBox.dataset.total;
const correct = { ...status };
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function showSection() {
  const right = Object.values(correct).filter(Boolean).length;
  const complete = sectionBox.classList.contains("done");
  if (total) {
    sectionText.textContent = complete
      ? `Section complete: all ${plural(total, "question")} answered correctly.`
      : `${right} of ${plural(total, "question")} answered correctly. Get ${total === 1 ? "it" : "them all"} right to complete this section.`;
  } else {
    sectionText.textContent = complete ? "Section complete: read to the end." : "This section completes when you reach the end of it.";
  }
  const tick = document.querySelector(`[data-page-link="${CSS.escape(page)}"] .tick`);
  if (tick) tick.textContent = complete ? "✓" : "";
}

function recordAnswer(qid, ok) {
  correct[qid] = ok;
  const was = sectionBox.classList.contains("done");
  const now = Object.keys(correct).length === total && Object.values(correct).every(Boolean);
  sectionBox.classList.toggle("done", now);
  showSection();
  if (now && !was) toast("Section complete");
}

if (!total && !sectionBox.classList.contains("done")) {
  // Reaching the bottom of the page counts as reading it.
  const seen = new IntersectionObserver(async (entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    seen.disconnect();
    await api("POST", "/api/pages/read", { doc, page });
    sectionBox.classList.add("done");
    showSection();
  });
  seen.observe(sectionBox);
}

const note = document.getElementById("page-note");
const noteStatus = document.getElementById("note-status");
const saveNote = debounce(async () => {
  try {
    await api("PUT", "/api/pages/note", { doc, page, note: note.value });
    noteStatus.textContent = "Saved.";
  } catch (err) {
    noteStatus.textContent = "Not saved. Check your connection; your text is still here.";
  }
}, 700);
note.addEventListener("input", () => { noteStatus.textContent = "Saving…"; saveNote(); });

document.addEventListener("keydown", (e) => {
  if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "ArrowRight") document.querySelector("[data-next]")?.click();
  if (e.key === "ArrowLeft") document.querySelector("[data-prev]")?.click();
});

// Thin progress bar showing how far down the page you are.
const bar = document.querySelector(".reading-bar");
bar.hidden = false;
const onScroll = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 100) + "%";
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const toc = document.querySelector(".toc");
const current = toc?.querySelector(".current");
if (current) toc.scrollTop = current.offsetTop - toc.clientHeight / 2;
