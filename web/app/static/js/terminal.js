// Terminal lab page: topology diagram, one console per device, live task checks, autosave.
import { api, debounce, toast } from "netlab";
import { buildLab, fmt6, n2ip, maskLen, Session, shortIf } from "netlab/ios";

const root = document.getElementById("term-lab");
const labId = root.dataset.lab;
const spec = JSON.parse(document.getElementById("term-spec").textContent);
const saved = JSON.parse(document.getElementById("term-saved").textContent);
// Per user too: people sharing a browser each see only their own console history.
const STORE = "netlab-term-" + root.dataset.user + "-" + labId;
const MAX_LINES = 800;

let net;
try {
  net = buildLab(spec, saved);
} catch (e) {
  console.error(e);
  toast("Your saved network for this lab couldn't be loaded, so it starts fresh.", true);
  net = buildLab(spec, null);
}

// ---------------------------------------------------------------- consoles
// Scrollback is a per-browser convenience; the network itself is saved on the server.
let buffers = {};
if (saved) {
  try { buffers = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch (e) { buffers = {}; }
}
const sessions = {};
const history = {};
let current = null;

const out = document.getElementById("term-out");
const input = document.getElementById("term-input");
const promptEl = document.getElementById("term-prompt");
const term = document.getElementById("term");
const tabs = [...document.querySelectorAll(".console-tab")];

function session(dev) {
  if (!sessions[dev]) {
    const s = new Session(net, dev);
    sessions[dev] = s;
    const buf = buffers[dev] || (buffers[dev] = []);
    if (buf.length) buf.push("", "[console reconnected]");
    const hello = s.greeting();
    if (hello) buf.push(...hello.split("\n"));
    history[dev] = { list: [], at: 0 };
  }
  return sessions[dev];
}

function write(dev, text) {
  if (!buffers[dev]) buffers[dev] = [];
  const lines = String(text).split("\n");
  buffers[dev].push(...lines);
  const extra = buffers[dev].length - MAX_LINES;
  if (extra > 0) buffers[dev].splice(0, extra);
  if (dev === current) {
    if (extra > 0) out.textContent = buffers[dev].join("\n") + "\n";
    else out.append(lines.join("\n") + "\n");
    term.scrollTop = term.scrollHeight;
  }
}

function refreshPrompt() {
  const s = sessions[current];
  promptEl.textContent = s.prompt();
  input.type = s.masked() ? "password" : "text";
}

function showDevice(dev, focus) {
  current = dev;
  session(dev);
  out.textContent = buffers[dev].length ? buffers[dev].join("\n") + "\n" : "";
  tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.dev === dev)));
  devEls.forEach((g, name) => g.classList.toggle("sel", name === dev));
  history[dev].at = history[dev].list.length;
  input.value = "";
  refreshPrompt();
  term.scrollTop = term.scrollHeight;
  if (focus) input.focus({ preventScroll: true });
}

function afterCommand(s) {
  // Other devices' consoles get their log lines as each device formats them: its console
  // logging level, sequence numbers and timestamp style (NTP-synced or not) all apply.
  for (const [dev, lines] of Object.entries(s.consoleLines || {})) {
    if (dev !== s.home && lines.length) write(dev, lines.join("\n"));
  }
  if (s.anim) animate(s.anim);
  refreshDiagram();
  evaluate();
  refreshPrompt();
  scheduleSave();
}

function run(line) {
  const s = sessions[current];
  const masked = s.masked();
  write(current, s.prompt() + (masked ? "" : line));
  const result = s.input(line);
  if (result) write(current, result);
  const h = history[current];
  if (!masked && line.trim() && h.list[h.list.length - 1] !== line) h.list.push(line);
  h.at = h.list.length;
  // A line ending in "?" shows help and hands the text back for editing, as IOS does.
  input.value = s.retype ?? "";
  afterCommand(s);
}

function handleKey(key, ctrl) {
  const s = sessions[current];
  const h = history[current];
  if (key === "Enter") { run(input.value); return true; }
  if (key === "Tab") { input.value = s.complete(input.value); return true; }
  if (key === "?") {
    const help = s.help(input.value);
    if (help === null) return false;
    write(current, s.prompt() + input.value + "?");
    write(current, help);
    return true;
  }
  if (key === "ArrowUp" && !s.masked()) {
    if (h.at > 0) input.value = h.list[--h.at];
    return true;
  }
  if (key === "ArrowDown" && !s.masked()) {
    h.at = Math.min(h.list.length, h.at + 1);
    input.value = h.list[h.at] ?? "";
    return true;
  }
  if (ctrl && (key === "c" || key === "z")) {
    write(current, s.prompt() + (s.masked() ? "" : input.value) + (key === "c" ? "^C" : "^Z"));
    const res = s.interrupt();
    if (res) write(current, res);
    input.value = "";
    afterCommand(s);
    return true;
  }
  if (ctrl && key === "l") {
    buffers[current] = [];
    out.textContent = "";
    return true;
  }
  return false;
}

input.addEventListener("keydown", (e) => {
  const ctrl = e.ctrlKey && !e.altKey && !e.metaKey;
  if (handleKey(ctrl ? e.key.toLowerCase() : e.key, ctrl)) {
    e.preventDefault();
    // Keep the caret at the end after history recall or completion.
    requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
  }
});

document.querySelectorAll("[data-key]").forEach((b) => b.addEventListener("click", () => {
  const k = b.dataset.key;
  if (k.startsWith("ctrl-")) handleKey(k.slice(5), true);
  else if (!handleKey(k, false) && k === "?") input.value += "?";
  input.focus({ preventScroll: true });
}));

term.addEventListener("click", () => {
  if (!String(window.getSelection())) input.focus({ preventScroll: true });
});
tabs.forEach((t) => t.addEventListener("click", () => showDevice(t.dataset.dev, true)));

// ---------------------------------------------------------------- the diagram
const svg = document.getElementById("topo");
const NS = "http://www.w3.org/2000/svg";
const pos = Object.fromEntries(spec.devices.map((d) => [d.name, d]));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

// Tunnels (GRE, IPsec, DMVPN) are logical links, drawn as arcs over the cabling.
const gTunnels = node("g", { class: "topo-tunnels" }, svg);
const gLinks = node("g", { class: "topo-links" }, svg);
const gPorts = node("g", { class: "topo-ports" }, svg);
const gDevs = node("g", { class: "topo-devs" }, svg);
const gAnim = node("g", { class: "topo-anim" }, svg);

// Cables between the same two devices (an EtherChannel's members, say) fan out side by side.
const pairKey = (a, b) => [a, b].sort().join("|");
const pairCount = {}, pairSeen = {};
for (const [a, , b] of spec.links) pairCount[pairKey(a, b)] = (pairCount[pairKey(a, b)] || 0) + 1;

const linkEls = spec.links.map(([a, ap, b, bp]) => {
  const key = pairKey(a, b);
  const nth = pairSeen[key] = (pairSeen[key] ?? -1) + 1;
  // Offsets are measured along the normal of the pair's canonical direction, so both ends agree.
  const [ca, cb] = [a, b].sort().map((n) => pos[n]);
  const clen = Math.hypot(cb.x - ca.x, cb.y - ca.y) || 1;
  const shift = (nth - (pairCount[key] - 1) / 2) * 14;
  const nx = -(cb.y - ca.y) / clen * shift, ny = (cb.x - ca.x) / clen * shift;
  const p = { x: pos[a].x + nx, y: pos[a].y + ny }, q = { x: pos[b].x + nx, y: pos[b].y + ny };
  const line = node("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: "topo-link" }, gLinks);
  node("title", {}, line);
  const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
  const label = (from, to, name) => {
    // Sit the label along the cable, clear of the device's own name and address below it.
    let k = Math.min(0.42, 50 / len);
    const below = (kk) => (to.y - from.y) * kk > 18 && Math.abs((to.x - from.x) * kk) < 48;
    if (below(k)) k = Math.min(0.45, 84 / len);
    const t = node("text", { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k + 4, class: "topo-port" }, gPorts);
    t.textContent = name === "eth0" ? "e0" : shortIf(name);
    t.dataset.name = t.textContent;
    node("title", {}, t);
    return t;
  };
  return { line, a: label(p, q, ap), b: label(q, p, bp) };
});

const ICONS = {
  router: (g) => {
    node("circle", { r: 24, class: "dev-body" }, g);
    node("path", { d: "M-12 -4h24m-6-5 6 5-6 5M12 4h-24m6-5-6 5 6 5", class: "dev-mark" }, g);
  },
  switch: (g) => {
    node("rect", { x: -30, y: -17, width: 60, height: 34, rx: 6, class: "dev-body" }, g);
    node("path", { d: "M-16 -6h32m-5-4 5 4-5 4M16 6h-32m5-4-5 4 5 4", class: "dev-mark" }, g);
  },
  pc: (g) => {
    node("rect", { x: -20, y: -18, width: 40, height: 27, rx: 3, class: "dev-body" }, g);
    node("path", { d: "M-8 15h16M0 9v6", class: "dev-mark" }, g);
  },
};

const devEls = new Map();
const labels = new Map();
for (const d of spec.devices) {
  const g = node("g", { class: "topo-dev dev-" + d.type, transform: `translate(${d.x} ${d.y})`, tabindex: 0, role: "button" }, gDevs);
  // The selection ring follows the icon's shape so it sits centred on it.
  if (d.type === "router") node("circle", { r: 34, class: "dev-ring" }, g);
  else if (d.type === "switch") node("rect", { x: -38, y: -25, width: 76, height: 50, rx: 12, class: "dev-ring" }, g);
  else node("rect", { x: -28, y: -26, width: 56, height: 50, rx: 10, class: "dev-ring" }, g);
  ICONS[d.type](g);
  const name = node("text", { y: d.type === "router" ? 42 : 36, class: "dev-name" }, g);
  const sub = node("text", { y: d.type === "router" ? 56 : 50, class: "dev-sub" }, g);
  const open = () => { showDevice(d.name, true); term.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" }); };
  g.addEventListener("click", open);
  g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  devEls.set(d.name, g);
  labels.set(d.name, { name, sub });
}

function drawTunnels() {
  gTunnels.replaceChildren();
  const seen = {};
  const tunnels = net.tunnelInfo();
  document.getElementById("lg-tunnel").hidden = !tunnels.length;
  for (const t of tunnels) {
    const p = pos[t.a], q = pos[t.b];
    if (!p || !q) continue;
    // Bow each arc away from the straight line; more tunnels between a pair bow further.
    const key = [t.a, t.b].sort().join("|");
    const n = seen[key] = (seen[key] || 0) + 1;
    const [ca, cb] = [t.a, t.b].sort().map((d) => pos[d]);
    const len = Math.hypot(cb.x - ca.x, cb.y - ca.y) || 1;
    const bow = Math.min(90, 26 + len * 0.12) * (n % 2 ? 1 : -1) * Math.ceil(n / 2);
    const mx = (p.x + q.x) / 2 - (cb.y - ca.y) / len * bow, my = (p.y + q.y) / 2 + (cb.x - ca.x) / len * bow;
    // A crypto map has no tunnel interface: until traffic triggers IKE there is simply no SA yet.
    const cryptoMap = !/^Tunnel/.test(t.aIf);
    const idle = cryptoMap && !t.up;
    const path = node("path", {
      d: `M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`,
      class: `topo-tunnel ${t.kind}${t.up ? " up" : ""}${idle ? " idle" : ""}${t.dynamic ? " dynamic" : ""}`,
    }, gTunnels);
    const what = cryptoMap ? "IPsec (crypto map) peering"
      : `${t.kind === "dmvpn" ? "DMVPN" : t.kind === "ipsec" ? "GRE over IPsec" : "GRE"} tunnel`;
    node("title", {}, path).textContent = `${t.a} ${shortIf(t.aIf)} - ${t.b} ${shortIf(t.bIf)}: ${what}`
      + `${t.dynamic ? " (dynamic spoke-to-spoke)" : ""}, `
      + (idle ? "no SA yet: send matching traffic to bring it up" : t.up ? "up" : "down")
      + (t.protected ? ", encrypted" : "");
    if (t.protected) {
      // The arc's midpoint (a quadratic's t = 0.5) carries a lock badge.
      const bx = (p.x + 2 * mx + q.x) / 4, by = (p.y + 2 * my + q.y) / 4;
      const g = node("g", { class: "topo-lock" + (t.up ? " up" : idle ? " idle" : ""), transform: `translate(${bx} ${by})` }, gTunnels);
      node("circle", { r: 9 }, g);
      node("path", { d: "M-3.5 -1v-2.5a3.5 3.5 0 0 1 7 0v2.5M-5 -1h10v6h-10z" }, g);
    }
  }
}

function refreshDiagram() {
  drawTunnels();
  net.linkInfo().forEach((l, i) => {
    const el = linkEls[i];
    const partial = !l.blocked && l.blockedVlans.length > 0;
    el.line.setAttribute("class", "topo-link " + (l.up ? "up" : "down") + (l.trunk && l.up ? " trunk" : "")
      + (l.blocked ? " blocked" : partial ? " partial" : "") + (l.bundled ? " bundled" : ""));
    el.line.firstChild.textContent = `${l.a} ${shortIf(l.ap)} - ${l.b} ${shortIf(l.bp)}: ` + (!l.up ? (l.aErr || l.bErr ? "err-disabled" : "down")
      : l.blocked ? "blocked (spanning tree or suspended bundle member)" : (l.bundled ? "bundled in an EtherChannel, " : "") + (l.trunk ? "trunk" : "up")
        + (partial ? `, blocked by spanning tree for VLAN ${l.blockedVlans.join(", ")}` : ""));
    for (const [t, err] of [[el.a, l.aErr], [el.b, l.bErr]]) {
      t.textContent = t.dataset.name + (err ? " err-disabled" : "");
      t.appendChild(document.createElementNS(NS, "title")).textContent = t.dataset.name + (err ? ": err-disabled (shutdown, then no shutdown, to recover)" : "");
    }
    el.a.classList.toggle("shut", l.aDown || l.aErr);
    el.b.classList.toggle("shut", l.bDown || l.bErr);
    el.a.classList.toggle("err", l.aErr);
    el.b.classList.toggle("err", l.bErr);
  });
  for (const d of spec.devices) {
    const dev = net.devs[d.name], { name, sub } = labels.get(d.name);
    name.textContent = dev.cfg.hostname;
    if (d.type === "pc") {
      const addr = dev.cfg.ip !== null ? `${n2ip(dev.cfg.ip)}/${maskLen(dev.cfg.mask)}`
        : net.addrs6(d.name, "eth0").map((x) => `${fmt6(x.a).toLowerCase()}/${x.len}`)[0] || "no IP";
      // A Linux workstation (curl, netconf-console) is marked so it isn't mistaken for a VPCS.
      sub.textContent = (d.os === "linux" ? "Linux · " : "") + addr;
    } else {
      const tag = d.model === "csr" ? "IOS-XE" : "";
      sub.textContent = [dev.cfg.hostname !== d.name ? d.name : "", tag].filter(Boolean).join(" · ");
    }
  }
}

let animToken = 0;
function mark(dev, ok) {
  const p = pos[dev];
  if (!p) return;
  const g = node("g", { class: "pkt-mark " + (ok ? "ok" : "fail"), transform: `translate(${p.x + 26} ${p.y - 26})` }, gAnim);
  node("circle", { r: 10 }, g);
  node("path", { d: ok ? "M-4 0l3 3 5-6" : "M-4 -4l8 8m0-8-8 8" }, g);
  setTimeout(() => g.remove(), 1600);
}

function animate(anim) {
  const token = ++animToken;
  gAnim.replaceChildren();
  const hops = anim.links.map((h) => [pos[h.a], pos[h.b]]);
  const end = () => mark(anim.ok ? anim.from : (anim.failAt || anim.from), anim.ok);
  if (!hops.length || reduceMotion) { end(); return; }
  const dot = node("circle", { r: 6, class: "pkt " + (anim.ok ? "" : "pkt-fail") }, gAnim);
  const per = Math.max(120, Math.min(260, 2400 / hops.length));
  let t0 = null;
  const step = (ts) => {
    if (token !== animToken) return;
    if (t0 === null) t0 = ts;
    const k = (ts - t0) / per, i = Math.floor(k);
    if (i >= hops.length) { dot.remove(); end(); return; }
    const [p, q] = hops[i], f = k - i;
    dot.setAttribute("cx", p.x + (q.x - p.x) * f);
    dot.setAttribute("cy", p.y + (q.y - p.y) * f);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------------------------------------------------------------- tasks
const taskEls = [...document.querySelectorAll(".task")];
const score = document.getElementById("term-score");
const bar = document.querySelector("#term-bar > span");
const doneBanner = document.getElementById("term-done");
let passing = new Set();
let firstCheck = true;

function evaluate() {
  const now = new Set();
  spec.tasks.forEach((t, i) => {
    let ok = false;
    try { ok = t.checks.every((c) => net.check(c)); } catch (e) { console.error("task check failed to run", i, e); }
    if (ok) now.add(i);
  });
  if (!firstCheck) {
    for (const i of now) {
      if (!passing.has(i)) toast("Task passed: " + taskEls[i].querySelector(".task-title").textContent);
    }
  }
  passing = now;
  firstCheck = false;
  taskEls.forEach((el, i) => el.classList.toggle("pass", now.has(i)));
  const total = spec.tasks.length;
  if (score) score.textContent = `${now.size} / ${total} tasks`;
  if (score) score.className = "pill " + (total && now.size === total ? "pill-good" : now.size ? "pill-accent" : "");
  if (bar) {
    bar.style.width = (total ? (100 * now.size) / total : 0) + "%";
    bar.parentElement.classList.toggle("good", total > 0 && now.size === total);
  }
  if (doneBanner) doneBanner.hidden = !(total && now.size === total);
}

// ---------------------------------------------------------------- saving
let dirty = false;
const body = () => JSON.stringify({ state: net.toJSON(), passing: [...passing] });
const keepScrollback = () => {
  try { localStorage.setItem(STORE, JSON.stringify(buffers)); } catch (e) { /* storage full or blocked */ }
};
const save = debounce(async () => {
  if (!dirty) return;
  dirty = false;
  keepScrollback();
  try {
    const res = await api("PUT", `/api/terminal/${labId}`, JSON.parse(body()));
    if (res.newly_completed) toast("Lab complete. Every task passes.");
  } catch (e) {
    dirty = true;
  }
}, 900);
function scheduleSave() { dirty = true; save(); }

// Leaving the page: send the last change even if the debounce hasn't fired yet.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "hidden") return;
  keepScrollback();
  if (!dirty) return;
  dirty = false;
  fetch(`/api/terminal/${labId}`, {
    method: "PUT", keepalive: true, body: body(),
    headers: { "Content-Type": "application/json", "X-Requested-With": "fetch" },
  }).catch(() => { dirty = true; });
});

const resetBtn = document.getElementById("term-reset");
let armed = null;
resetBtn.addEventListener("click", async () => {
  if (!armed) {
    resetBtn.classList.add("btn-bad");
    resetBtn.lastChild.textContent = " Click again to reset";
    armed = setTimeout(() => { armed = null; resetBtn.classList.remove("btn-bad"); resetBtn.lastChild.textContent = " Reset lab"; }, 4000);
    return;
  }
  clearTimeout(armed);
  resetBtn.disabled = true;
  try {
    await api("DELETE", `/api/terminal/${labId}`);
    dirty = false;
    try { localStorage.removeItem(STORE); } catch (e) { /* blocked storage */ }
    location.reload();
  } catch (e) {
    resetBtn.disabled = false;
  }
});

// ---------------------------------------------------------------- start
refreshDiagram();
evaluate();
showDevice(spec.devices[0].name, matchMedia("(pointer: fine)").matches);
