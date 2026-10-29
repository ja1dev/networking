// Interactive diagrams in the reading pages. Each <figure class="dg"> carries its spec as JSON;
// this draws it and wires it up. Kinds:
//   topology  a network map; click any device or link to learn about it, and with steps,
//             walk through a process as badges, link states and moving packets change
//   sequence  a ladder of messages between devices, revealed one message at a time
//   compare   an election you can rig: edit the candidates and watch the tie-breakers decide
//   path      a weighted topology; change costs or endpoints and see the shortest path(s)
//   bits      clickable bits for a byte, an IPv4 address and prefix, or a DSCP value
//   match     an ACL or prefix list; type a packet or prefix and watch the lines evaluate
import {
  dscpName, evaluateAcl, evaluatePrefixList, ipv4Facts, rank, sequenceState, shortestPaths, topologyState,
} from "netlab/diagram-logic";
import { intToIp, ipToInt } from "netlab/subnet-math";

const NS = "http://www.w3.org/2000/svg";
const UX = 120, UY = 110;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function svgEl(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) n.append(kid);
  return n;
}

// ---------------------------------------------------------------- device icons

const ICONS = {
  router: (g) => {
    svgEl("circle", { r: 22, class: "dg-body" }, g);
    svgEl("path", { d: "M-11 -4h22m-5-4 5 4-5 4M11 4h-22m5-4-5 4 5 4", class: "dg-mark" }, g);
  },
  switch: (g) => {
    svgEl("rect", { x: -28, y: -16, width: 56, height: 32, rx: 6, class: "dg-body" }, g);
    svgEl("path", { d: "M-15 -5h30m-5-4 5 4-5 4M15 5h-30m5-4-5 4 5 4", class: "dg-mark" }, g);
  },
  l3switch: (g) => {
    svgEl("rect", { x: -28, y: -16, width: 56, height: 32, rx: 6, class: "dg-body" }, g);
    svgEl("path", { d: "M-15 -5h30m-5-4 5 4-5 4M15 5h-30m5-4-5 4 5 4", class: "dg-mark" }, g);
    svgEl("circle", { r: 5, cx: 0, cy: -16, class: "dg-body dg-l3dot" }, g);
  },
  firewall: (g) => {
    svgEl("rect", { x: -24, y: -17, width: 48, height: 34, rx: 3, class: "dg-body" }, g);
    svgEl("path", { d: "M-24 -6h48M-24 5h48M-8 -17v11M10 -17v11M0 -6v11M-14 5v12M14 5v12", class: "dg-mark dg-thin" }, g);
  },
  host: (g) => {
    svgEl("rect", { x: -19, y: -17, width: 38, height: 26, rx: 3, class: "dg-body" }, g);
    svgEl("path", { d: "M-8 16h16M0 9v7", class: "dg-mark" }, g);
  },
  server: (g) => {
    svgEl("rect", { x: -15, y: -21, width: 30, height: 42, rx: 3, class: "dg-body" }, g);
    svgEl("path", { d: "M-8 -11h16M-8 -3h16M-8 5h16", class: "dg-mark dg-thin" }, g);
  },
  cloud: (g) => {
    svgEl("path", {
      d: "M-26 12a11 11 0 0 1 2-21a14 14 0 0 1 26-6a12 12 0 0 1 22 9a9 9 0 0 1 -2 18z",
      class: "dg-body",
    }, g);
  },
  ap: (g) => {
    svgEl("rect", { x: -18, y: -6, width: 36, height: 16, rx: 8, class: "dg-body" }, g);
    svgEl("path", { d: "M-9 -12a13 13 0 0 1 18 0M-14 -18a20 20 0 0 1 28 0", class: "dg-mark dg-thin" }, g);
  },
  wlc: (g) => {
    svgEl("rect", { x: -26, y: -14, width: 52, height: 28, rx: 4, class: "dg-body" }, g);
    svgEl("path", { d: "M-9 2a13 13 0 0 1 18 0M-14 -4a20 20 0 0 1 28 0", class: "dg-mark dg-thin" }, g);
  },
  controller: (g) => {
    svgEl("path", { d: "M-22 0l11-19h22l11 19-11 19h-22z", class: "dg-body" }, g);
    svgEl("circle", { r: 6, class: "dg-mark dg-thin" }, g);
  },
  // A neutral box for things that aren't devices: a YANG node, a route-map clause, a process.
  box: (g) => {
    svgEl("rect", { x: -30, y: -14, width: 60, height: 28, rx: 7, class: "dg-body" }, g);
  },
  phone: (g) => {
    svgEl("rect", { x: -13, y: -19, width: 26, height: 38, rx: 4, class: "dg-body" }, g);
    svgEl("path", { d: "M-6 -11h12M-6 -4h12M-6 3h12", class: "dg-mark dg-thin" }, g);
  },
};
// How far below its centre each kind's name sits, and the reach of its selection ring.
const SIZE = { box: 14, router: 22, switch: 16, l3switch: 18, firewall: 17, host: 17, server: 21, cloud: 15,
  ap: 10, wlc: 14, controller: 19, phone: 19 };
const WIDTH = { box: 30, router: 22, switch: 28, l3switch: 28, firewall: 24, host: 19, server: 15, cloud: 26,
  ap: 18, wlc: 26, controller: 22, phone: 13 };

// ---------------------------------------------------------------- topology drawing

// Draws nodes, links and zones into an <svg>, and returns handles to restyle them per step.
function drawTopology(svg, spec, onPick) {
  const pos = Object.fromEntries(spec.nodes.map((n) => [n.id, { x: n.x * UX, y: n.y * UY, n }]));
  const gZones = svgEl("g", { class: "dg-zones" }, svg);
  const gLinks = svgEl("g", { class: "dg-links" }, svg);
  const gPaths = svgEl("g", { class: "dg-paths" }, svg);
  const gLabels = svgEl("g", { class: "dg-labels" }, svg);
  const gNodes = svgEl("g", { class: "dg-nodes" }, svg);
  const gAnim = svgEl("g", { class: "dg-anim" }, svg);
  const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const grow = (x0, y0, x1, y1) => {
    box.x0 = Math.min(box.x0, x0); box.y0 = Math.min(box.y0, y0);
    box.x1 = Math.max(box.x1, x1); box.y1 = Math.max(box.y1, y1);
  };

  // Zones (areas, sites, VLANs, trust zones) wrap their members, drawn first so they sit behind.
  for (const z of spec.zones || []) {
    const pad = 46 + (z.pad || 0) * 12;
    const ms = z.nodes.map((id) => pos[id]);
    const x0 = Math.min(...ms.map((p) => p.x)) - pad - 14, x1 = Math.max(...ms.map((p) => p.x)) + pad + 14;
    const y0 = Math.min(...ms.map((p) => p.y)) - pad - 10, y1 = Math.max(...ms.map((p) => p.y)) + pad + 26;
    svgEl("rect", { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 14, class: `dg-zone tone-${z.tone || "muted"}` }, gZones);
    svgEl("text", { x: x0 + 10, y: y0 + 17, class: `dg-zone-label tone-${z.tone || "muted"}` }, gZones).textContent = z.label;
    grow(x0, y0, x1, y1);
  }

  // Parallel links between the same pair fan out side by side; tunnels bow away as arcs.
  const pairCount = {}, pairSeen = {};
  const pairKey = (a, b) => [a, b].sort().join("|");
  for (const l of spec.links) pairCount[pairKey(l.a, l.b)] = (pairCount[pairKey(l.a, l.b)] || 0) + 1;
  const links = spec.links.map((l, i) => {
    const key = pairKey(l.a, l.b);
    const nth = pairSeen[key] = (pairSeen[key] ?? -1) + 1;
    const [ca, cb] = [l.a, l.b].sort().map((id) => pos[id]);
    const clen = Math.hypot(cb.x - ca.x, cb.y - ca.y) || 1;
    const nx = -(cb.y - ca.y) / clen, ny = (cb.x - ca.x) / clen;
    // Labelled parallel links sit further apart so their labels don't stack.
    const labelled = pairCount[key] > 1 && spec.links.some((x) => pairKey(x.a, x.b) === key && (x.label || x.aLabel || x.bLabel));
    const shift = (nth - (pairCount[key] - 1) / 2) * (labelled ? 30 : 14);
    const p = { x: pos[l.a].x + nx * shift, y: pos[l.a].y + ny * shift };
    const q = { x: pos[l.b].x + nx * shift, y: pos[l.b].y + ny * shift };
    const style = l.style || "solid";
    let d, at;
    if (style === "tunnel") {
      const bow = 34 + clen * 0.08;
      const sign = l.a < l.b ? 1 : -1;
      const c = { x: (p.x + q.x) / 2 + nx * bow * sign, y: (p.y + q.y) / 2 + ny * bow * sign };
      d = `M${p.x} ${p.y} Q${c.x} ${c.y} ${q.x} ${q.y}`;
      at = (t) => ({ x: (1 - t) ** 2 * p.x + 2 * (1 - t) * t * c.x + t * t * q.x, y: (1 - t) ** 2 * p.y + 2 * (1 - t) * t * c.y + t * t * q.y });
    } else {
      d = `M${p.x} ${p.y} L${q.x} ${q.y}`;
      at = (t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
    const g = svgEl("g", { class: `dg-link style-${style}`, tabindex: l.info ? 0 : -1 }, gLinks);
    svgEl("path", { d, class: "dg-hit" }, g);
    const line = svgEl("path", { d, class: "dg-line" }, g);
    if (l.info) {
      g.classList.add("has-info");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `${l.a} to ${l.b}${l.label ? ": " + l.label : ""}`);
      const pick = () => onPick({ title: `${nodeName(spec, l.a)} ↔ ${nodeName(spec, l.b)}${l.label ? " · " + l.label : ""}`, html: l.info }, g);
      g.addEventListener("click", pick);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    }
    const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const endLabel = (text, from) => {
      if (!text) return null;
      // Sit just clear of the device's icon at that end, however short the link.
      const kind = pos[from === "a" ? l.a : l.b].n.kind || "router";
      const t = Math.min(0.45, Math.max(46, WIDTH[kind] + 22) / len);
      const pt = at(from === "a" ? t : 1 - t);
      const el = svgEl("text", { x: pt.x + nx * 11, y: pt.y + ny * 11 + 4, class: "dg-port" }, gLabels);
      el.textContent = text;
      return el;
    };
    endLabel(l.aLabel, "a");
    endLabel(l.bLabel, "b");
    let mid = null;
    if (l.label) {
      const pt = at(0.5);
      mid = svgEl("text", { x: pt.x - nx * 17, y: pt.y - ny * 17 + 4, class: "dg-link-label" }, gLabels);
      mid.textContent = l.label;
    }
    return { g, line, at, from: l.a, to: l.b, mid };
  });

  const nodes = new Map();
  for (const n of spec.nodes) {
    const { x, y } = pos[n.id];
    const kind = n.kind || "router";
    const g = svgEl("g", { class: `dg-node kind-${kind}`, transform: `translate(${x} ${y})` }, gNodes);
    const r = Math.max(SIZE[kind], WIDTH[kind]) + 9;
    svgEl("circle", { r, class: "dg-ring" }, g);
    ICONS[kind](g);
    const name = svgEl("text", { y: SIZE[kind] + 17, class: "dg-name" }, g);
    name.textContent = n.label ?? n.id;
    let below = SIZE[kind] + 17;
    if (n.sub) {
      below += 14;
      svgEl("text", { y: below, class: "dg-sub" }, g).textContent = n.sub;
    }
    const badge = svgEl("g", { class: "dg-badge", transform: `translate(${WIDTH[kind] + 4} ${-SIZE[kind] - 4})` }, g);
    const span = Math.max(name.textContent.length * 8.4, (n.sub || "").length * 6.8, WIDTH[kind] * 2) / 2 + 6;
    // Leave room on the right for the longest badge any step (or the path widget) hangs on this node.
    const longest = Math.max(4, ...(spec.steps || []).map((st) => st.nodes?.[n.id]?.badge?.length || 0));
    grow(x - span, y - SIZE[kind] - 24, Math.max(x + span, x + WIDTH[kind] + 4 + Math.max(22, longest * 7.2 + 12)) + 4, y + below + 8);
    if (n.info) {
      g.classList.add("has-info");
      g.setAttribute("tabindex", 0);
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", n.label ?? n.id);
      const pick = () => onPick({ title: (n.label ?? n.id) + (n.sub ? " · " + n.sub : ""), html: n.info }, g);
      g.addEventListener("click", pick);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    }
    nodes.set(n.id, { g, badge, kind });
  }
  const P = 18;
  svg.setAttribute("viewBox", `${box.x0 - P} ${box.y0 - P} ${box.x1 - box.x0 + 2 * P} ${box.y1 - box.y0 + 2 * P}`);
  svg.dataset.width = box.x1 - box.x0 + 2 * P;
  return { nodes, links, gPaths, gAnim, pos };
}

function nodeName(spec, id) {
  const n = spec.nodes.find((x) => x.id === id);
  return n ? (n.label ?? n.id) : id;
}

function setBadge(handle, badge, tone) {
  handle.badge.replaceChildren();
  if (!badge) return;
  const w = Math.max(22, badge.length * 7.2 + 12);
  svgEl("rect", { x: 0, y: -10, width: w, height: 20, rx: 10, class: `dg-badge-bg tone-${tone || "accent"}` }, handle.badge);
  svgEl("text", { x: w / 2, y: 4, class: "dg-badge-text" }, handle.badge).textContent = badge;
}

// Arrows along a path's links, so direction reads even without animation.
function drawRoute(topo, hops, path, tone, at = 0.5) {
  hops.forEach((li, h) => {
    const L = topo.links[li];
    const forward = L.from === path[h];
    const t = forward ? at : 1 - at;
    const a = L.at(t - 0.06), b = L.at(t + 0.06);
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + (forward ? 0 : 180);
    const m = L.at(t);
    svgEl("path", { d: "M-7 -6 L5 0 L-7 6 z", class: `dg-arrow tone-${tone}`, transform: `translate(${m.x} ${m.y}) rotate(${ang})` }, topo.gPaths);
  });
}

function runPackets(topo, packets, token) {
  topo.gAnim.replaceChildren();
  for (const p of packets) {
    const tone = p.tone || "accent";
    drawRoute(topo, p.hops, p.path, tone);
    const g = svgEl("g", { class: `dg-pkt tone-${tone}` }, topo.gAnim);
    svgEl("circle", { r: 7 }, g);
    let label = null;
    if (p.label) {
      label = svgEl("text", { y: -12, class: "dg-pkt-label" }, g);
      label.textContent = p.label;
    }
    const place = (pt) => g.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    // At rest the packet waits on the last link, just short of the device, so it doesn't hide the icon.
    const last = topo.links[p.hops[p.hops.length - 1]];
    const endAt = last.at(last.from === p.path[p.path.length - 2] ? 0.62 : 0.38);
    if (reduceMotion) { place(endAt); continue; }
    const per = 900;
    let t0 = null;
    const frame = (ts) => {
      if (token.dead) return;
      if (t0 === null) t0 = ts;
      // Loop with a short pause at the far end so the trip can be watched again.
      const total = p.hops.length * per + 900;
      const k = ((ts - t0) % total) / per;
      const i = Math.min(Math.floor(k), p.hops.length - 1);
      if (k >= p.hops.length) place(endAt);
      else {
        const L = topo.links[p.hops[i]];
        const f = k - i;
        place(L.at(L.from === p.path[i] ? f : 1 - f));
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}

function applyTopologyState(topo, spec, st) {
  const anyFocus = st.focus.size > 0;
  spec.nodes.forEach((n) => {
    const hnd = topo.nodes.get(n.id);
    const s = st.nodes[n.id] || {};
    setBadge(hnd, s.badge, s.tone);
    hnd.g.classList.toggle("is-down", s.state === "down");
    hnd.g.classList.toggle("is-active", s.state === "active");
    hnd.g.classList.toggle("is-focus", st.focus.has("node:" + n.id));
    hnd.g.classList.toggle("is-dim", s.state === "dim" || (anyFocus && !st.focus.has("node:" + n.id)));
  });
  topo.links.forEach((L, i) => {
    const s = st.links[i];
    for (const c of ["active", "blocked", "down", "dim"]) L.g.classList.toggle("is-" + c, s === c);
    L.g.classList.toggle("is-focus", st.focus.has("link:" + i));
    if (anyFocus && !st.focus.has("link:" + i) && s !== "active") L.g.classList.add("is-dim");
  });
  topo.gPaths.replaceChildren();
}

// ---------------------------------------------------------------- shared chrome

function infoPanel() {
  const title = h("strong");
  const body = h("div", { class: "dg-info-body" });
  const close = h("button", { type: "button", class: "dg-info-close", "aria-label": "Close" }, "×");
  const panel = h("div", { class: "dg-info", hidden: true, role: "region", "aria-live": "polite" }, close, title, body);
  let picked = null;
  const hide = () => { panel.hidden = true; picked?.classList.remove("is-picked"); picked = null; };
  close.addEventListener("click", hide);
  const show = (info, el) => {
    if (picked === el && !panel.hidden) { hide(); return; }
    picked?.classList.remove("is-picked");
    picked = el;
    el.classList.add("is-picked");
    title.textContent = info.title;
    body.innerHTML = info.html;
    panel.hidden = false;
  };
  return { panel, show, hide };
}

// Back / Next controls with clickable progress dots. Arrow keys step while the figure has focus.
function stepper(fig, count, go) {
  let at = 0;
  const back = h("button", { type: "button", class: "btn btn-sm dg-back" }, "← Back");
  const next = h("button", { type: "button", class: "btn btn-sm btn-primary dg-next" }, "Next →");
  const dots = h("div", { class: "dg-dots", role: "group", "aria-label": "Steps" });
  const counter = h("span", { class: "dg-count muted small" });
  const dotEls = [];
  for (let k = 0; k < count; k++) {
    const d = h("button", { type: "button", class: "dg-dot", "aria-label": `Step ${k + 1}` });
    d.addEventListener("click", () => set(k));
    dots.append(d);
    dotEls.push(d);
  }
  const set = (k) => {
    at = Math.max(0, Math.min(count - 1, k));
    back.disabled = at === 0;
    next.textContent = at === count - 1 ? "Start over ↺" : "Next →";
    dotEls.forEach((d, j) => { d.classList.toggle("on", j === at); d.classList.toggle("seen", j < at); });
    counter.textContent = `Step ${at + 1} of ${count}`;
    go(at);
  };
  back.addEventListener("click", () => set(at - 1));
  next.addEventListener("click", () => set(at === count - 1 ? 0 : at + 1));
  fig.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      set(at + (e.key === "ArrowRight" ? 1 : -1));
    }
  });
  const bar = h("div", { class: "dg-controls" }, back, dots, counter, next);
  return { bar, set };
}

function frame(fig, spec, hint) {
  const head = h("figcaption", { class: "dg-head" },
    h("span", { class: "dg-kind" }, hint),
    h("strong", { class: "dg-title" }, spec.title));
  fig.append(head);
  if (spec.caption) fig.append(h("div", { class: "dg-caption", html: spec.caption }));
}

function svgBox(spec, label) {
  const wrap = h("div", { class: "dg-canvas" });
  const svg = svgEl("svg", { class: "dg-svg", role: "img", "aria-label": label }, wrap);
  return { wrap, svg };
}

// Wide drawings keep a legible minimum width on phones and scroll sideways inside their box.
function fitWidth(wrap, svg, minScale = 0.62) {
  const w = +svg.dataset.width;
  if (w) svg.style.minWidth = Math.round(w * minScale) + "px";
  svg.style.maxWidth = Math.round(w * 1.15) + "px";
}

// ---------------------------------------------------------------- kinds

function mountTopology(fig, spec) {
  const steps = spec.steps || [];
  frame(fig, spec, steps.length ? "Step through" : "Explore");
  const { wrap, svg } = svgBox(spec, spec.title);
  const info = infoPanel();
  const topo = drawTopology(svg, spec, info.show);
  fitWidth(wrap, svg, 0.5);
  fig.append(wrap);
  const clickable = spec.nodes.some((n) => n.info) || spec.links.some((l) => l.info);
  if (!steps.length) {
    if (clickable) fig.append(h("p", { class: "dg-hint muted small" }, "Click a device or link to see what it does."));
    fig.append(info.panel);
    applyTopologyState(topo, spec, { nodes: {}, links: {}, focus: new Set(), packets: [] });
    return;
  }
  const caption = h("div", { class: "dg-step", "aria-live": "polite" });
  let live = { dead: false };
  const go = (i) => {
    live.dead = true;
    live = { dead: false };
    const st = topologyState(spec, i);
    applyTopologyState(topo, spec, st);
    runPackets(topo, st.packets, live);
    caption.replaceChildren(
      h("div", { class: "dg-step-title" }, steps[i].title),
      h("div", { class: "dg-step-text", html: steps[i].text }));
    info.hide();
  };
  const { bar, set } = stepper(fig, steps.length, go);
  fig.append(caption, bar);
  if (clickable) fig.append(h("p", { class: "dg-hint muted small" }, "Tip: click a device or link for details."));
  fig.append(info.panel);
  set(0);
}

const SEQ_ROW = 54, SEQ_TOP = 92;

function mountSequence(fig, spec) {
  frame(fig, spec, "Step through");
  const { wrap, svg } = svgBox(spec, spec.title);
  const hasStates = spec.messages.some((m) => m.states);
  const top = SEQ_TOP + (hasStates ? 26 : 0);
  // Each gap between neighbouring actors is as wide as the messages crossing it need, so one long
  // label widens only the gaps it spans, never the whole ladder.
  const at = Object.fromEntries(spec.actors.map((a, i) => [a.id, i]));
  const textW = (m) => Math.max(m.label.length * 7.8, (m.detail || "").length * 6.8);
  const noteW = (m) => m.note.length * 7.2 + 28;
  const nameW = (a) => (a.label ?? a.id).length * 8.4;
  const gaps = spec.actors.slice(1).map((a, i) => Math.max(150, (nameW(spec.actors[i]) + nameW(a)) / 2 + 24));
  const widen = (i0, i1, need) => {
    const have = gaps.slice(i0, i1).reduce((x, y) => x + y, 0);
    if (have < need) for (let k = i0; k < i1; k++) gaps[k] += (need - have) / (i1 - i0);
  };
  for (const m of spec.messages) {
    if (m.note) {
      const ix = m.over.map((id) => at[id]);
      const lo = Math.min(...ix), hi = Math.max(...ix);
      if (hi > lo) widen(lo, hi, noteW(m) - 40);
    } else if (m.from !== m.to) {
      const lo = Math.min(at[m.from], at[m.to]), hi = Math.max(at[m.from], at[m.to]);
      widen(lo, hi, textW(m) + 34);
    } else if (at[m.from] < gaps.length) {
      widen(at[m.from], at[m.from] + 1, textW(m) + 70);
    }
  }
  const col = {};
  let x = 0;
  spec.actors.forEach((a, i) => { col[a.id] = x; x += gaps[i] || 0; });
  // Everything that can stick out past the outer lifelines: names, notes, self-messages.
  let minX = Infinity, maxX = -Infinity;
  const reach = (x0, x1) => { minX = Math.min(minX, x0); maxX = Math.max(maxX, x1); };
  for (const a of spec.actors) reach(col[a.id] - Math.max(60, nameW(a) / 2 + 10), col[a.id] + Math.max(60, nameW(a) / 2 + 10));
  const noteBox = (m) => {
    const xs = m.over.map((id) => col[id]);
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    const w = Math.max(Math.max(...xs) - Math.min(...xs) + 160, noteW(m));
    return [mid - w / 2, mid + w / 2];
  };
  for (const m of spec.messages) {
    if (m.note) reach(...noteBox(m));
    else if (m.from === m.to) reach(col[m.from], col[m.from] + 54 + textW(m) + 8);
  }
  const shift = 16 - minX;
  for (const id in col) col[id] += shift;
  const width = maxX - minX + 32;
  const height = top + spec.messages.length * SEQ_ROW + 20;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.dataset.width = width;
  const stateEls = {};
  for (const a of spec.actors) {
    const x = col[a.id];
    svgEl("line", { x1: x, y1: 70, x2: x, y2: height - 8, class: "dg-lifeline" }, svg);
    const g = svgEl("g", { class: `dg-node kind-${a.kind || "router"}`, transform: `translate(${x} 30) scale(.85)` }, svg);
    ICONS[a.kind || "router"](g);
    svgEl("text", { x, y: 72, class: "dg-name" }, svg).textContent = a.label ?? a.id;
    if (hasStates) {
      const sg = svgEl("g", { class: "dg-state", transform: `translate(${x} ${92})` }, svg);
      stateEls[a.id] = sg;
    }
  }
  const rows = spec.messages.map((m, i) => {
    const y = top + i * SEQ_ROW + 22;
    const g = svgEl("g", { class: `dg-msg tone-${m.tone || "accent"}` }, svg);
    if (m.note) {
      const [x0, x1] = noteBox(m);
      svgEl("rect", { x: x0, y: y - 16, width: x1 - x0, height: 30, rx: 6, class: "dg-note" }, g);
      svgEl("text", { x: (x0 + x1) / 2, y: y + 4, class: "dg-note-text" }, g).textContent = m.note;
      return g;
    }
    const x1 = col[m.from], x2 = col[m.to];
    if (m.from === m.to) {
      svgEl("path", { d: `M${x1} ${y - 8} h46 v18 h-40`, class: "dg-msg-line" }, g);
      svgEl("path", { d: `M${x1 + 6} ${y + 10} l8 -5 v10 z`, class: "dg-msg-head" }, g);
      svgEl("text", { x: x1 + 54, y: y + 4, class: "dg-msg-label start" }, g).textContent = m.label;
      if (m.detail) svgEl("text", { x: x1 + 54, y: y + 18, class: "dg-msg-detail start" }, g).textContent = m.detail;
      return g;
    }
    const dir = x2 > x1 ? 1 : -1;
    const end = m.drop ? x1 + (x2 - x1) * 0.6 : x2 - dir * 4;
    svgEl("line", { x1, y1: y, x2: end, y2: y, class: "dg-msg-line" + (m.dashed ? " dashed" : "") }, g);
    if (m.drop) {
      svgEl("path", { d: `M${end - 6} ${y - 6} l12 12 m0 -12 l-12 12`, class: "dg-msg-drop" }, g);
    } else {
      svgEl("path", { d: `M${end} ${y} l${-dir * 10} -6 v12 z`, class: "dg-msg-head" }, g);
    }
    const mx = (x1 + x2) / 2;
    svgEl("text", { x: mx, y: y - 7, class: "dg-msg-label" }, g).textContent = m.label;
    if (m.detail) svgEl("text", { x: mx, y: y + 16, class: "dg-msg-detail" }, g).textContent = m.detail;
    return g;
  });
  fitWidth(wrap, svg, 0.7);
  fig.append(wrap);
  const caption = h("div", { class: "dg-step", "aria-live": "polite" });
  const go = (i) => {
    const st = sequenceState(spec, i);
    rows.forEach((g, k) => {
      g.classList.toggle("is-hidden", k >= st.visible);
      g.classList.toggle("is-current", k === i);
    });
    for (const [id, sg] of Object.entries(stateEls)) {
      sg.replaceChildren();
      const s = st.states[id];
      if (!s) continue;
      const w = Math.max(40, s.length * 7.4 + 16);
      svgEl("rect", { x: -w / 2, y: -11, width: w, height: 22, rx: 11, class: "dg-state-bg" }, sg);
      svgEl("text", { y: 4, class: "dg-state-text" }, sg).textContent = s;
    }
    const m = spec.messages[i];
    caption.replaceChildren(
      h("div", { class: "dg-step-title" }, m.note ? m.note : m.label),
      h("div", { class: "dg-step-text", html: m.text }));
  };
  const { bar, set } = stepper(fig, spec.messages.length, go);
  fig.append(caption, bar);
  set(0);
}

function mountCompare(fig, spec) {
  frame(fig, spec, "Try it");
  const values = spec.candidates.map((c) => ({ ...c.values }));
  const inputs = [];
  const editor = (f, ci) => {
    const c = spec.candidates[ci], v = values[ci][f.id];
    let cell;
    if (f.editable === false) return h("span", { class: "dg-fixed" }, display(f, v));
    if (f.kind === "choice") {
      cell = h("select", { "aria-label": `${c.label} ${f.label}` },
        f.options.map((o) => h("option", { value: o.value, selected: o.value === v }, o.label)));
    } else if (f.kind === "bool") {
      cell = h("select", { "aria-label": `${c.label} ${f.label}` },
        h("option", { value: "true", selected: v === true }, "yes"), h("option", { value: "false", selected: v === false }, "no"));
    } else {
      cell = h("input", {
        value: String(v), "aria-label": `${c.label} ${f.label}`, spellcheck: "false", class: "dg-in-" + f.kind,
        inputmode: f.kind === "number" ? "numeric" : undefined,
      });
    }
    cell.addEventListener("input", () => {
      values[ci][f.id] = f.kind === "bool" ? cell.value === "true" : cell.value;
      update();
    });
    inputs.push({ cell, ci, f });
    return cell;
  };
  const fieldHead = (f, fi, scope) => h("th", { scope, "data-field": f.id }, h("span", { class: "dg-field-n" }, String(fi + 1)), " ", f.label,
    h("span", { class: "dg-rule muted tiny" }, ruleText(f)));
  const candHead = (c, scope) => h("th", { scope, class: "dg-cand-head" }, h("span", { class: "dg-cand" }, c.label), h("span", { class: "dg-place" }));
  // Tie-breakers run down the side when there are more of them than candidates (BGP's long list);
  // otherwise candidates run down the side, so a crowded segment (a DR election) still fits.
  const fieldsDown = spec.fields.length > spec.candidates.length;
  const table = h("table", { class: "dg-table" + (fieldsDown ? "" : " cands-down") });
  let candHeads;
  if (fieldsDown) {
    candHeads = spec.candidates.map((c) => candHead(c, "col"));
    table.append(h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Tie-breakers, in order"), candHeads)));
    table.append(h("tbody", {}, spec.fields.map((f, fi) => h("tr", {}, fieldHead(f, fi, "row"),
      spec.candidates.map((_, ci) => h("td", { "data-field": f.id }, editor(f, ci)))))));
  } else {
    candHeads = spec.candidates.map((c) => candHead(c, "row"));
    table.append(h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Tie-breakers, in order →"), spec.fields.map((f, fi) => fieldHead(f, fi, "col")))));
    table.append(h("tbody", {}, spec.candidates.map((_, ci) => h("tr", {}, candHeads[ci],
      spec.fields.map((f) => h("td", { "data-field": f.id }, editor(f, ci)))))));
  }
  const result = h("div", { class: "dg-result", "aria-live": "polite" });
  const walkList = h("ol", { class: "dg-walk" });
  const reset = h("button", { type: "button", class: "btn btn-sm" }, "Reset values");
  reset.addEventListener("click", () => {
    spec.candidates.forEach((c, ci) => { values[ci] = { ...c.values }; });
    for (const { cell, ci, f } of inputs) cell.value = String(values[ci][f.id]);
    update();
  });
  if (spec.prompt) fig.append(h("div", { class: "dg-prompt", html: spec.prompt }));
  fig.append(h("div", { class: "dg-table-wrap" }, table), result, walkList, h("div", { class: "dg-actions" }, reset));

  function update() {
    const res = rank(spec, values);
    candHeads.forEach((th) => { th.classList.remove("win"); th.querySelector(".dg-place").textContent = ""; });
    table.querySelectorAll("[data-field]").forEach((el) => el.classList.remove("decider"));
    const first = res[0];
    walkList.replaceChildren();
    for (const r of res) {
      if (r.winner === null) continue;
      candHeads[r.winner].classList.add("win");
      candHeads[r.winner].querySelector(".dg-place").textContent = r.place;
    }
    // Explain the first place's walk step by step; later places only name who won and why.
    for (const s of first.walk) {
      const f = spec.fields.find((x) => x.id === s.field);
      const names = (ks) => ks.map((k) => spec.candidates[k].label).join(", ");
      let text;
      if (s.kind === "ineligible") text = `${f.label}: ${names(s.out)} can't take part (${f.label} ${f.ineligible}).`;
      else if (s.kind === "skipped") text = `${f.label}: skipped, because the candidates left have different ${s.why} values.`;
      else if (s.kind === "tie") text = `${f.label}: everyone left has ${s.best}, a tie. Keep going.`;
      else {
        text = s.left.length === 1
          ? `${f.label}: ${names(s.left)} wins with ${s.best}.`
          : `${f.label}: ${names(s.left)} share the best (${s.best}); ${names(s.out)} drop out.`;
        table.querySelectorAll(`[data-field="${f.id}"]`).forEach((el) => el.classList.add("decider"));
      }
      walkList.append(h("li", { class: "dg-walk-" + s.kind }, text));
    }
    if (first.winner === null) {
      result.className = "dg-result bad";
      result.textContent = first.reason;
      return;
    }
    result.className = "dg-result good";
    const lines = res.filter((r) => r.winner !== null).map((r) => {
      const decider = [...r.walk].reverse().find((s) => s.kind === "decided");
      const f = decider && spec.fields.find((x) => x.id === decider.field);
      return `${r.place}: ${spec.candidates[r.winner].label}${f ? ` (decided by ${f.label})` : ""}.`;
    });
    result.textContent = lines.join(" ");
  }
  update();
}

function ruleText(f) {
  if (f.rule === "highest") return "higher wins";
  if (f.rule === "lowest") return "lower wins";
  if (f.rule === "true") return "yes wins";
  if (f.rule === "false") return "no wins";
  if (f.rule === "context") return "not compared itself";
  return "best: " + f.options.map((o) => o.label).join(" > ");
}

function display(f, v) {
  if (f.kind === "choice") return f.options.find((o) => o.value === v)?.label ?? String(v);
  if (f.kind === "bool") return v ? "yes" : "no";
  return String(v);
}

function mountPath(fig, spec) {
  frame(fig, spec, "Try it");
  if (spec.prompt) fig.append(h("div", { class: "dg-prompt", html: spec.prompt }));
  const { wrap, svg } = svgBox(spec, spec.title);
  const info = infoPanel();
  const topo = drawTopology(svg, spec, info.show);
  fitWidth(wrap, svg, 0.5);
  const costs = spec.links.map((l) => (l.costs ? [...l.costs] : [l.cost, l.cost]));
  // Each link's cost sits in a pill on the line; the route arrows keep clear of it.
  const gCosts = svgEl("g", { class: "dg-costs-layer" }, svg);
  const costLabels = topo.links.map((L) => {
    const pt = L.at(0.5);
    const g = svgEl("g", { transform: `translate(${pt.x} ${pt.y})` }, gCosts);
    const bg = svgEl("rect", { y: -10, height: 20, rx: 10, class: "dg-cost-bg" }, g);
    const t = svgEl("text", { y: 4.5, class: "dg-cost" }, g);
    return { t, bg };
  });
  const pick = (id, sel) => h("select", { "aria-label": id },
    spec.nodes.map((n) => h("option", { value: n.id, selected: n.id === sel }, n.label ?? n.id)));
  const from = pick("Path from", spec.from), to = pick("Path to", spec.to);
  const ends = h("div", { class: "dg-ends" }, h("label", {}, "From ", from), h("label", {}, "To ", to));
  const metric = spec.metric || "Cost";
  const editors = h("div", { class: "dg-costs" });
  spec.links.forEach((l, i) => {
    if (l.editable === false) return;
    const mk = (k, lbl) => {
      const inp = h("input", { value: String(costs[i][k]), inputmode: "numeric", size: 5, "aria-label": `${metric} ${lbl}` });
      inp.addEventListener("input", () => {
        const n = Number(inp.value);
        costs[i][k] = inp.value.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : null;
        inp.classList.toggle("bad", costs[i][k] === null);
        update();
      });
      return inp;
    };
    const A = nodeName(spec, l.a), B = nodeName(spec, l.b);
    if (l.costs) {
      editors.append(h("label", {}, `${A} → ${B}`, mk(0, `${A} to ${B}`)), h("label", {}, `${B} → ${A}`, mk(1, `${B} to ${A}`)));
    } else {
      const inp = mk(0, `${A} to ${B}`);
      inp.addEventListener("input", () => { costs[i][1] = costs[i][0]; update(); });
      editors.append(h("label", {}, `${A} – ${B}${l.label ? " (" + l.label + ")" : ""}`, inp));
    }
  });
  const result = h("div", { class: "dg-result", "aria-live": "polite" });
  const reset = h("button", { type: "button", class: "btn btn-sm" }, "Reset");
  reset.addEventListener("click", () => {
    spec.links.forEach((l, i) => { costs[i] = l.costs ? [...l.costs] : [l.cost, l.cost]; });
    editors.querySelectorAll("input").forEach((inp) => inp.classList.remove("bad"));
    let k = 0;
    spec.links.forEach((l, i) => {
      if (l.editable === false) return;
      const inputs = editors.querySelectorAll("input");
      inputs[k++].value = String(costs[i][0]);
      if (l.costs) inputs[k++].value = String(costs[i][1]);
    });
    from.value = spec.from; to.value = spec.to;
    update();
  });
  from.addEventListener("change", update);
  to.addEventListener("change", update);
  fig.append(wrap, ends, result, h("details", { class: "dg-costs-box", open: true },
    h("summary", {}, `Change the ${metric.toLowerCase()}s`), editors), h("div", { class: "dg-actions" }, reset), info.panel);

  function update() {
    costLabels.forEach(({ t, bg }, i) => {
      const [ab, ba] = costs[i];
      t.textContent = ab === ba ? String(ab ?? "?") : `${ab ?? "?"}/${ba ?? "?"}`;
      const w = t.textContent.length * 7.6 + 12;
      bg.setAttribute("x", -w / 2);
      bg.setAttribute("width", w);
    });
    applyTopologyState(topo, spec, { nodes: {}, links: {}, focus: new Set(), packets: [] });
    topo.nodes.forEach((n, id) => {
      setBadge(n, id === from.value ? "from" : id === to.value ? "to" : "", id === from.value ? "accent" : "good");
    });
    if (costs.some(([a, b]) => a === null || b === null)) {
      result.className = "dg-result bad";
      result.textContent = `Every ${metric.toLowerCase()} must be a number of 0 or more.`;
      return;
    }
    if (from.value === to.value) {
      result.className = "dg-result";
      result.textContent = "Pick two different devices.";
      return;
    }
    const r = shortestPaths(spec, costs, from.value, to.value);
    if (!r.paths.length) {
      result.className = "dg-result bad";
      result.textContent = `${nodeName(spec, to.value)} can't be reached from ${nodeName(spec, from.value)}.`;
      return;
    }
    const used = new Set(r.paths.flatMap((p) => p.links));
    topo.links.forEach((L, i) => L.g.classList.toggle("is-active", used.has(i)));
    r.paths.forEach((p) => drawRoute(topo, p.links, p.nodes, "accent", 0.3));
    const names = (p) => p.nodes.map((id) => nodeName(spec, id)).join(" → ");
    result.className = "dg-result good";
    result.textContent = r.paths.length === 1
      ? `Best path: ${names(r.paths[0])}, total ${metric.toLowerCase()} ${r.cost}.`
      : `${r.paths.length} equal-cost paths (total ${r.cost}), traffic is shared across them: ${r.paths.map(names).join(";  ")}.`;
  }
  update();
}

function bitRow(count, value, onFlip, place = true, split = null) {
  const row = h("div", { class: "dg-bits" });
  for (let i = count - 1; i >= 0; i--) {
    const on = Math.floor(value / 2 ** i) % 2 === 1;
    const b = h("button", {
      type: "button", class: "dg-bit" + (on ? " on" : "") + (split !== null && count - 1 - i >= split ? " host" : ""),
      "aria-pressed": on ? "true" : "false", "aria-label": `bit worth ${2 ** i}`,
    }, h("span", { class: "dg-bit-v" }, on ? "1" : "0"), place ? h("span", { class: "dg-bit-p" }, String(2 ** i)) : null);
    b.addEventListener("click", () => onFlip(i));
    row.append(b);
  }
  return row;
}

function mountBits(fig, spec) {
  frame(fig, spec, "Try it");
  if (spec.prompt) fig.append(h("div", { class: "dg-prompt", html: spec.prompt }));
  const area = h("div", { class: "dg-bits-area" });
  const out = h("div", { class: "dg-facts", "aria-live": "polite" });
  fig.append(area, out);
  const fact = (k, v) => h("div", {}, h("span", { class: "muted small" }, k), h("code", {}, v));

  if (spec.mode === "octet" || spec.mode === "dscp") {
    const width = spec.mode === "octet" ? 8 : 6;
    let v = spec.value;
    const input = h("input", { value: String(v), inputmode: "numeric", size: 4, "aria-label": "Decimal value" });
    input.addEventListener("input", () => {
      const n = Number(input.value);
      if (/^\d+$/.test(input.value.trim()) && n < 2 ** width) { v = n; input.classList.remove("bad"); draw(false); }
      else input.classList.add("bad");
    });
    const draw = (syncInput = true) => {
      if (syncInput) input.value = String(v);
      area.replaceChildren(bitRow(width, v, (i) => { v ^= 2 ** i; draw(); }),
        h("label", { class: "dg-dec" }, "Decimal ", input));
      const facts = spec.mode === "octet"
        ? [fact("Binary", v.toString(2).padStart(8, "0")), fact("Decimal", String(v)), fact("Hex", "0x" + v.toString(16).toUpperCase().padStart(2, "0"))]
        : [fact("DSCP", `${v} (binary ${v.toString(2).padStart(6, "0")})`), fact("Name", dscpName(v)),
          fact("IP precedence", String(v >> 3)), fact("Whole ToS byte", `${v << 2} (0x${(v << 2).toString(16).toUpperCase().padStart(2, "0")})`)];
      out.replaceChildren(...facts);
    };
    draw();
    return;
  }

  // ipv4: 32 clickable bits, the network part shaded by the prefix slider.
  let ip = ipToInt(spec.value), prefix = spec.prefix ?? 24;
  const addr = h("input", { value: intToIp(ip), size: 15, spellcheck: "false", "aria-label": "IPv4 address" });
  const slider = h("input", { type: "range", min: 0, max: 32, value: prefix, "aria-label": "Prefix length" });
  const plabel = h("strong", {}, "/" + prefix);
  addr.addEventListener("input", () => {
    const n = ipToInt(addr.value);
    addr.classList.toggle("bad", n === null);
    if (n !== null) { ip = n; draw(false); }
  });
  slider.addEventListener("input", () => { prefix = +slider.value; draw(); });
  const controls = h("div", { class: "dg-ip-controls" }, h("label", {}, "Address ", addr),
    spec.showPrefix === false ? null : h("label", {}, "Prefix ", slider, plabel));
  const draw = (syncInput = true) => {
    if (syncInput) addr.value = intToIp(ip);
    plabel.textContent = "/" + prefix;
    const octets = h("div", { class: "dg-octets" });
    for (let o = 0; o < 4; o++) {
      const val = (ip >>> (24 - 8 * o)) & 255;
      const split = spec.showPrefix === false ? null : Math.max(0, Math.min(8, prefix - 8 * o));
      octets.append(h("div", { class: "dg-octet" },
        bitRow(8, val, (i) => { ip = (ip ^ (2 ** (i + 24 - 8 * o))) >>> 0; draw(); }, o === 0, split),
        h("div", { class: "dg-octet-v" }, String(val))));
    }
    area.replaceChildren(controls, octets);
    if (spec.showPrefix === false) { out.replaceChildren(fact("Address", intToIp(ip)), fact("Binary", [0, 1, 2, 3].map((o) => ((ip >>> (24 - 8 * o)) & 255).toString(2).padStart(8, "0")).join("."))); return; }
    const f = ipv4Facts(ip, prefix);
    out.replaceChildren(fact("Mask", `${f.mask} (/${prefix})`), fact("Wildcard", f.wildcard), fact("Network", f.network),
      fact("Broadcast", f.broadcast), fact("Hosts", prefix >= 31 ? `${f.first} – ${f.last} (${f.usable}, point-to-point or host route)` : `${f.first} – ${f.last} (${f.usable.toLocaleString()} usable)`));
  };
  draw();
}

function mountMatch(fig, spec) {
  frame(fig, spec, "Try it");
  if (spec.prompt) fig.append(h("div", { class: "dg-prompt", html: spec.prompt }));
  const kind = spec.kind;
  const name = spec.name || (kind === "prefix-list" ? "LIST" : kind === "extended" ? "101" : "10");
  const list = h("ol", { class: "dg-acl" });
  const lines = spec.rules.map((r) => {
    let text;
    if (kind === "prefix-list") text = `ip prefix-list ${name} seq ${r.seq} ${r.action} ${r.prefix}${r.ge !== undefined ? " ge " + r.ge : ""}${r.le !== undefined ? " le " + r.le : ""}`;
    else if (kind === "extended") {
      text = `${r.action} ${r.proto} ${r.src}${r.srcPort ? " " + r.srcPort : ""} ${r.dst}${r.port ? " " + r.port : ""}${r.established ? " established" : ""}`;
    } else text = `${r.action} ${r.source}`;
    if (kind !== "prefix-list" && r.seq !== undefined) text = `${r.seq} ${text}`;
    const why = h("span", { class: "dg-acl-why" });
    const li = h("li", {}, h("code", {}, text), why);
    list.append(li);
    return { li, why };
  });
  const implicit = h("li", { class: "dg-acl-implicit" }, h("code", {}, kind === "prefix-list" ? "(implicit deny anything else)" : "deny any  (implicit, never shown)"), h("span", { class: "dg-acl-why" }));
  list.append(implicit);
  const result = h("div", { class: "dg-result", "aria-live": "polite" });
  const inputs = {};
  const form = h("div", { class: "dg-packet" });
  const field = (key, label, value, size) => {
    const inp = h("input", { value, size, spellcheck: "false", "aria-label": label });
    inp.addEventListener("input", update);
    inputs[key] = inp;
    form.append(h("label", {}, label + " ", inp));
  };
  if (kind === "prefix-list") field("prefix", "Route", spec.input, 18);
  else if (kind === "extended") {
    const t = spec.input;
    const all = [t, ...(spec.tries || [])];
    const protos = ["tcp", "udp", "icmp", "ospf", "eigrp", "gre", "esp", "pim"]
      .filter((p) => ["tcp", "udp", "icmp"].includes(p) || all.some((x) => x.proto === p) || spec.rules.some((r) => r.proto === p));
    const proto = h("select", { "aria-label": "Protocol" }, protos.map((p) => h("option", { value: p, selected: p === t.proto }, p)));
    proto.addEventListener("change", update);
    inputs.proto = proto;
    form.append(h("label", {}, "Protocol ", proto));
    field("src", "Source", t.src, 14);
    if (spec.rules.some((r) => r.srcPort) || all.some((x) => x.srcPort !== undefined)) field("srcPort", "Src. port", String(t.srcPort ?? ""), 5);
    field("dst", "Destination", t.dst, 14);
    field("port", "Dest. port", String(t.port ?? ""), 5);
    if (spec.rules.some((r) => r.established) || all.some((x) => x.established !== undefined)) {
      const est = h("input", { type: "checkbox", "aria-label": "ACK or RST set" });
      est.checked = !!t.established;
      est.addEventListener("change", update);
      inputs.established = est;
      form.append(h("label", {}, est, " ACK/RST set (a reply)"));
    }
  } else field("src", "Source address", spec.input, 15);
  const tries = spec.tries?.length ? h("div", { class: "dg-tries" }, h("span", { class: "muted small" }, "Try: "),
    spec.tries.map((t) => {
      const b = h("button", { type: "button", class: "btn btn-sm" }, typeof t === "string" ? t
        : `${t.proto} ${t.src}${t.srcPort !== undefined ? ":" + t.srcPort : ""} → ${t.dst}${t.port !== undefined ? ":" + t.port : ""}${t.established ? " (reply)" : ""}`);
      b.addEventListener("click", () => {
        if (typeof t === "string") (inputs.prefix || inputs.src).value = t;
        else {
          for (const k of ["proto", "src", "srcPort", "dst", "port"]) if (inputs[k]) inputs[k].value = String(t[k] ?? "");
          if (inputs.established) inputs.established.checked = !!t.established;
        }
        update();
      });
      return b;
    })) : null;
  fig.append(form, tries, list, result);

  function update() {
    let r;
    if (kind === "prefix-list") r = evaluatePrefixList(spec.rules, inputs.prefix.value);
    else if (kind === "extended") {
      r = evaluateAcl(kind, spec.rules, {
        proto: inputs.proto.value, src: inputs.src.value, dst: inputs.dst.value, port: inputs.port.value,
        srcPort: inputs.srcPort?.value, established: inputs.established?.checked,
      });
    } else r = evaluateAcl(kind, spec.rules, { src: inputs.src.value });
    for (const inp of Object.values(inputs)) inp.classList.remove("bad");
    lines.forEach(({ li, why }, i) => {
      const s = r.lines[i];
      li.className = s ? "is-" + s.state : "";
      why.textContent = !s ? "" : s.state === "match" ? "match: stop here" : s.state === "skipped" ? "not checked" : s.why.join(", ");
    });
    implicit.className = r.error ? "dg-acl-implicit" : r.hit === null ? "dg-acl-implicit is-match" : "dg-acl-implicit is-skipped";
    implicit.lastChild.textContent = r.error ? "" : r.hit === null ? "nothing matched, so it's denied" : "not reached";
    if (r.error) { result.className = "dg-result bad"; result.textContent = r.error; return; }
    const verb = kind === "prefix-list" ? (r.action === "permit" ? "permitted (the route is allowed)" : "denied (the route is filtered)")
      : (r.action === "permit" ? "permitted" : "denied");
    result.className = "dg-result " + (r.action === "permit" ? "good" : "bad");
    result.textContent = r.hit === null ? `No line matches, so the implicit deny catches it: ${verb}.` : `Line ${r.hit + 1} matches first: ${verb}.`;
  }
  update();
}

const MOUNT = {
  topology: mountTopology, sequence: mountSequence, compare: mountCompare,
  path: mountPath, bits: mountBits, match: mountMatch,
};

export function mountAll(root = document) {
  root.querySelectorAll("figure.dg[data-kind]").forEach((fig) => {
    if (fig.dataset.ready) return;
    const spec = JSON.parse(fig.querySelector("script.dg-spec").textContent);
    fig.replaceChildren();
    fig.tabIndex = -1;
    MOUNT[spec.type](fig, spec);
    fig.dataset.ready = "1";
  });
}

