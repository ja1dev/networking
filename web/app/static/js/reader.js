// Reading page: live questions, "done" checkbox, autosaved notes, keyboard paging.
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
      const prev = box.querySelector(".mcq-prev");
      prev.hidden = false;
      prev.className = "mcq-prev pill " + (res.correct ? "pill-good" : "pill-bad");
      prev.textContent = res.correct ? "got it" : "missed";
    } catch (err) {
      check.disabled = false;
    }
  }
});

const done = document.getElementById("page-done");
done.addEventListener("change", async () => {
  try {
    await api("POST", "/api/pages/complete", { doc, page, completed: done.checked });
    const link = document.querySelector(`[data-page-link="${CSS.escape(page)}"] .tick`);
    if (link) link.innerHTML = done.checked ? "✓" : "";
    toast(done.checked ? "Marked as done" : "Marked as not done");
  } catch (err) {
    done.checked = !done.checked;
  }
});

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
