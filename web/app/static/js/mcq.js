// Multiple-choice widget behaviour, shared by the reader and the quiz runner.
//
// Markup (built by build_content.py for the reader, by quiz.js for quizzes):
//   .mcq[data-qid][data-multi] > .mcq-options > li > button.mcq-opt[data-letter]
//   plus .mcq-check, .mcq-retry, .mcq-status and .mcq-explain.

export function selected(box) {
  return [...box.querySelectorAll(".mcq-opt.selected")].map((b) => b.dataset.letter);
}

export function toggle(box, btn) {
  const need = Number(box.dataset.multi || 1);
  if (need === 1) {
    box.querySelectorAll(".mcq-opt.selected").forEach((b) => { if (b !== btn) b.classList.remove("selected"); });
    btn.classList.toggle("selected");
  } else if (btn.classList.contains("selected")) {
    btn.classList.remove("selected");
  } else if (selected(box).length < need) {
    btn.classList.add("selected");
  }
  const check = box.querySelector(".mcq-check");
  if (check) check.disabled = selected(box).length !== need;
  box.querySelectorAll(".mcq-opt").forEach((b) => b.setAttribute("aria-pressed", b.classList.contains("selected")));
}

export function setSelection(box, letters) {
  box.querySelectorAll(".mcq-opt").forEach((b) => b.classList.toggle("selected", letters.includes(b.dataset.letter)));
}

// Paint the graded result: correct options green, wrong picks red, explanation shown.
export function showResult(box, { correct, answer, selected: picked, explanation_html, link }) {
  box.classList.toggle("is-right", correct);
  box.classList.toggle("is-wrong", !correct);
  box.querySelectorAll(".mcq-opt").forEach((b) => {
    const l = b.dataset.letter;
    b.disabled = true;
    b.classList.remove("selected");
    if (answer.includes(l)) b.classList.add("right");
    else if (picked.includes(l)) b.classList.add("wrong");
  });
  const status = box.querySelector(".mcq-status");
  if (status) {
    status.textContent = correct ? "Correct" : "Not quite. Answer: " + answer.join(", ");
    status.className = "mcq-status " + (correct ? "good" : "bad");
  }
  const exp = box.querySelector(".mcq-explain");
  if (exp) {
    exp.innerHTML = explanation_html + (link ? `<p class="small"><a href="${link}">Read the section this comes from →</a></p>` : "");
    exp.hidden = false;
  }
  const check = box.querySelector(".mcq-check");
  if (check) check.hidden = true;
  const retry = box.querySelector(".mcq-retry");
  if (retry) retry.hidden = false;
}

export function reset(box) {
  box.classList.remove("is-right", "is-wrong");
  box.querySelectorAll(".mcq-opt").forEach((b) => {
    b.disabled = false;
    b.classList.remove("selected", "right", "wrong");
  });
  const status = box.querySelector(".mcq-status");
  if (status) { status.textContent = ""; status.className = "mcq-status"; }
  const exp = box.querySelector(".mcq-explain");
  if (exp) { exp.hidden = true; exp.innerHTML = ""; }
  const check = box.querySelector(".mcq-check");
  if (check) { check.hidden = false; check.disabled = true; }
  const retry = box.querySelector(".mcq-retry");
  if (retry) retry.hidden = true;
}
