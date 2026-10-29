// Subnetting trainer: endless generated problems, checked instantly, with the worked method.
import { api, typing } from "netlab";
import { facts, interesting, intToIp, ipToInt, parsePrefix } from "netlab/subnet-math";
import { KINDS, generate, method } from "netlab/subnet-gen";

const PREF_KEY = "netlab-subnet-prefs";

const root = document.getElementById("trainer");
const statsBox = document.getElementById("session-stats");
let prefs = { kinds: Object.keys(KINDS).filter((k) => !k.startsWith("ipv6")), range: "last" };
try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") }; } catch (e) { /* storage off */ }
const session = { n: 0, right: 0, streak: 0, best: 0, times: [] };
let problem = null;
let started = 0;
let clock;
const ip = intToIp;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---- UI ----

function renderStats() {
  const avg = session.times.length ? (session.times.reduce((a, b) => a + b, 0) / session.times.length / 1000).toFixed(1) : "–";
  statsBox.innerHTML = `
    <div><div class="stat">${session.right}/${session.n}</div><div class="stat-label">this session</div></div>
    <div><div class="stat">${session.streak}</div><div class="stat-label">streak (best ${session.best})</div></div>
    <div><div class="stat">${avg}s</div><div class="stat-label">avg when right</div></div>`;
}

function newProblem() {
  const kinds = prefs.kinds.length ? prefs.kinds : Object.keys(KINDS);
  const kind = pick(kinds);
  problem = { ...generate(kind, prefs.range), done: false };
  started = Date.now();
  const fieldHtml = problem.fields.map((f) => f.type === "yesno"
    ? `<div><label class="field">${f.label}</label><div class="row">
        <button type="button" class="btn btn-lg" data-yesno="yes">Yes</button>
        <button type="button" class="btn btn-lg" data-yesno="no">No</button></div><div class="expected" data-expected="${f.id}" hidden></div></div>`
    : `<div ${f.wide ? 'style="grid-column:1/-1"' : ""}><label class="field" for="f-${f.id}">${f.label}</label>
        <input type="text" id="f-${f.id}" data-field="${f.id}" placeholder="${f.placeholder || ""}" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="${f.id === "hosts" || f.id === "subnets" ? "numeric" : "text"}">
        <div class="expected" data-expected="${f.id}" hidden></div></div>`).join("");
  root.innerHTML = `
    <div class="spread"><span class="pill pill-accent">${KINDS[kind]}</span><span class="timer" id="clock">0s</span></div>
    <div class="problem">${problem.prompt}</div>
    <form id="answer" autocomplete="off"><div class="fields">${fieldHtml}</div>
      <div class="row" style="margin-top:16px">
        ${problem.fields.some((f) => f.type === "yesno") ? "" : '<button class="btn btn-primary" type="submit">Check</button>'}
        <button class="btn btn-ghost" type="button" id="skip">Show answer</button>
        <span class="muted tiny">${problem.fields.some((f) => f.type === "yesno") ? "<kbd>Y</kbd> / <kbd>N</kbd> answer" : "<kbd>Enter</kbd> check · <kbd>N</kbd> next (outside a field)"}</span>
      </div></form>
    <div class="work card" id="work" hidden style="background:var(--surface-2);box-shadow:none"></div>`;
  root.querySelector("input")?.focus();
  root.querySelector("#answer").addEventListener("submit", (e) => { e.preventDefault(); check(); });
  root.querySelector("#skip").addEventListener("click", () => check(true));
  root.querySelectorAll("[data-yesno]").forEach((b) => b.addEventListener("click", () => check(false, b.dataset.yesno)));
  clearInterval(clock);
  clock = setInterval(() => {
    const c = document.getElementById("clock");
    if (c && !problem.done) c.textContent = Math.round((Date.now() - started) / 1000) + "s";
  }, 500);
}

async function check(giveUp = false, yesno = null) {
  if (problem.done) { newProblem(); return; }
  const values = {};
  root.querySelectorAll("[data-field]").forEach((i) => { values[i.dataset.field] = i.value; });
  if (!giveUp && !yesno && Object.values(values).some((v) => !v.trim())) {
    root.querySelector("[data-field]:placeholder-shown")?.focus();
    return;
  }
  problem.done = true;
  const ms = Date.now() - started;
  let allOk = !giveUp;
  for (const f of problem.fields) {
    const ok = !giveUp && (f.type === "yesno" ? f.ok(yesno) : f.ok(values[f.id]));
    allOk = allOk && ok;
    const input = root.querySelector(`[data-field="${f.id}"]`);
    if (input) { input.classList.add(ok ? "ok" : "no"); input.readOnly = true; }
    if (f.type === "yesno") {
      root.querySelectorAll("[data-yesno]").forEach((b) => {
        b.disabled = true;
        if (b.dataset.yesno === yesno) b.classList.add(ok ? "btn-good" : "btn-bad");
      });
    }
    const exp = root.querySelector(`[data-expected="${f.id}"]`);
    if (!ok) { exp.textContent = "Answer: " + f.want; exp.hidden = false; }
  }
  session.n += 1;
  if (allOk) {
    session.right += 1;
    session.streak += 1;
    session.best = Math.max(session.best, session.streak);
    session.times.push(ms);
  } else session.streak = 0;
  renderStats();
  const work = root.querySelector("#work");
  work.innerHTML = `<strong>${allOk ? `✓ Correct in ${(ms / 1000).toFixed(1)}s` : giveUp ? "Worked answer" : "✗ Not quite"}</strong>${problem.work}`;
  work.hidden = false;
  const actions = root.querySelector("#answer .row");
  actions.innerHTML = '<button class="btn btn-primary" type="submit" id="next">Next problem →</button>';
  root.querySelector("#next").focus();
  api("POST", "/api/drills", { kind: problem.kind, correct: allOk, duration_ms: ms }).catch(() => {});
}

function renderPrefs() {
  const box = document.getElementById("prefs");
  box.innerHTML = `<div class="kind-list">${Object.entries(KINDS).map(([k, label]) =>
    `<label><input type="checkbox" value="${k}" ${prefs.kinds.includes(k) ? "checked" : ""} hidden>${label}</label>`).join("")}</div>
    <div class="row" style="margin-top:12px"><span class="small muted">Prefixes:</span>
      <div class="segmented"><label><input type="radio" name="range" value="last" ${prefs.range === "last" ? "checked" : ""}>/24–/30</label>
      <label><input type="radio" name="range" value="any" ${prefs.range === "any" ? "checked" : ""}>/8–/30 (any octet)</label></div></div>`;
  box.addEventListener("change", () => {
    prefs.kinds = [...box.querySelectorAll(".kind-list input:checked")].map((i) => i.value);
    prefs.range = box.querySelector("input[name=range]:checked").value;
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* storage off */ }
    newProblem();
  });
}

document.addEventListener("keydown", (e) => {
  if (!problem || e.metaKey || e.ctrlKey || e.altKey || typing(e)) return;
  const k = e.key.toLowerCase();
  if (!problem.done && problem.fields.some((f) => f.type === "yesno") && (k === "y" || k === "n")) {
    check(false, k === "y" ? "yes" : "no");
    return;
  }
  if (k === "n") newProblem();
});

// ---- calculator ----

function setupCalculator() {
  const input = document.getElementById("calc-input");
  const out = document.getElementById("calc-out");
  const run = () => {
    const raw = input.value.trim();
    if (!raw) { out.innerHTML = ""; return; }
    const m = raw.match(/^(\S+?)\s*(?:\/\s*(\d{1,2})|\s+(\d+\.\d+\.\d+\.\d+))$/);
    const addr = m ? ipToInt(m[1]) : null;
    const prefix = m ? (m[2] !== undefined ? Number(m[2]) : parsePrefix(m[3])) : null;
    if (addr === null || prefix === null || prefix > 32) {
      out.innerHTML = '<p class="muted small">Type an address with a prefix or mask, like <code>172.16.45.200/20</code> or <code>10.1.1.70 255.255.255.224</code>.</p>';
      return;
    }
    const f = facts(addr, prefix);
    const rows = [
      ["Address", `${ip(addr)}/${prefix}`], ["Subnet mask", ip(f.mask)], ["Wildcard", ip(f.wildcard)],
      ["Network", ip(f.network)], ["First usable", ip(f.first)], ["Last usable", ip(f.last)],
      ["Broadcast", ip(f.broadcast)], ["Usable hosts", f.usable.toLocaleString()],
      ["Block size", prefix === 0 ? "–" : `${interesting(prefix).block} in the ${interesting(prefix).ordinal} octet`],
    ];
    out.innerHTML = `<div class="table-wrap"><table class="calc-out">${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table></div>
      ${prefix > 0 && prefix < 32 ? `<div class="work">${method(f)}</div>` : ""}`;
  };
  input.addEventListener("input", run);
  run();
}

renderPrefs();
renderStats();
newProblem();
setupCalculator();
