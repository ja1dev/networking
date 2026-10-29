// The thinking behind the interactive diagrams, kept free of the DOM so the tests can run it:
// what a step-through shows at each step, who wins an election, the shortest paths through a
// weighted topology, bit maths for addresses and DSCP, and how ACLs and prefix lists match.
import { facts, intToIp, ipToInt, maskOf } from "netlab/subnet-math";

// ---------------------------------------------------------------- links and steps

// A link is named by its id, or "A-B" (either order) when it's the only link between A and B.
export function linkIndex(spec) {
  const index = new Map();
  const pairs = new Map();
  spec.links.forEach((l, i) => {
    const pair = [l.a, l.b].sort().join("-");
    pairs.set(pair, (pairs.get(pair) || 0) + 1);
    if (l.id) index.set(l.id, i);
  });
  spec.links.forEach((l, i) => {
    if (pairs.get([l.a, l.b].sort().join("-")) === 1) {
      index.set(`${l.a}-${l.b}`, i);
      index.set(`${l.b}-${l.a}`, i);
    }
  });
  return index;
}

// The link a packet takes from one node to the next: the named link, else the only one between them.
export function hopLink(spec, index, from, to, via) {
  if (via !== undefined && via !== null) return index.get(via);
  return index.get(`${from}-${to}`);
}

// What a topology shows at step i. Node badges and link states carry forward from earlier
// steps until a later step changes them (null clears); focus and packets belong to one step.
export function topologyState(spec, i) {
  const index = linkIndex(spec);
  const nodes = {}, links = {};
  const steps = spec.steps || [];
  for (let k = 0; k <= i && k < steps.length; k++) {
    for (const [id, st] of Object.entries(steps[k].nodes || {})) {
      if (st === null) delete nodes[id];
      else {
        // A null field clears just that field (say, the badge) and keeps the rest.
        nodes[id] = { ...nodes[id], ...st };
        for (const [k, v] of Object.entries(st)) if (v === null) delete nodes[id][k];
      }
    }
    for (const [ref, st] of Object.entries(steps[k].links || {})) {
      const li = index.get(ref);
      if (st === null) delete links[li];
      else links[li] = st;
    }
  }
  const step = steps[i] || {};
  const focus = new Set();
  for (const ref of step.focus || []) {
    if (index.has(ref)) focus.add("link:" + index.get(ref));
    else focus.add("node:" + ref);
  }
  const packets = (step.packets || []).map((p) => ({
    ...p,
    hops: p.path.slice(1).map((to, h) => hopLink(spec, index, p.path[h], to, p.via?.[h])),
  }));
  return { nodes, links, focus, packets };
}

// The ladder at message i: which messages are visible and each actor's state so far.
export function sequenceState(spec, i) {
  const states = {};
  for (let k = 0; k <= i && k < spec.messages.length; k++) {
    Object.assign(states, spec.messages[k].states || {});
  }
  return { visible: i + 1, states };
}

// ---------------------------------------------------------------- elections

// MACs written any common way compare as one 48-bit number.
export function macValue(s) {
  const hex = String(s).toLowerCase().replace(/[^0-9a-f]/g, "");
  return hex.length === 12 ? parseInt(hex, 16) : null;
}

export function fieldValue(field, raw) {
  if (field.kind === "number") {
    const n = Number(raw);
    return raw === "" || raw === null || !Number.isFinite(n) ? null : n;
  }
  if (field.kind === "mac") return macValue(raw);
  if (field.kind === "ip") return ipToInt(String(raw));
  if (field.kind === "choice") {
    const at = field.options.findIndex((o) => o.value === raw);
    return at < 0 ? null : at;
  }
  if (field.kind === "bool") return raw === true || raw === "true" ? 1 : raw === false || raw === "false" ? 0 : null;
  return null;
}

// How good a value is, lower is better, so every rule compares the same way.
function badness(field, v) {
  if (field.rule === "highest") return -v;
  if (field.rule === "lowest" || field.rule === "order") return v;
  if (field.rule === "true") return v ? 0 : 1;
  if (field.rule === "false") return v ? 1 : 0;
  throw new Error("unknown rule " + field.rule);
}

function show(field, raw) {
  if (field.kind === "choice") return field.options.find((o) => o.value === raw)?.label ?? String(raw);
  if (field.kind === "bool") return raw === true || raw === "true" ? "yes" : "no";
  return String(raw);
}

// Walk the tie-breakers in order until one candidate is left. Returns each comparison made
// and the winner's index; an unbroken tie or a bad value leaves winner null with a reason.
export function decide(spec, values, among) {
  let left = among ?? values.map((_, k) => k);
  const walk = [];
  // A candidate that can never win (OSPF priority 0, for one) drops out before the comparison.
  for (const f of spec.fields) {
    if (f.ineligible === undefined) continue;
    const out = left.filter((k) => String(values[k][f.id]) === String(f.ineligible));
    if (out.length) {
      walk.push({ field: f.id, kind: "ineligible", out, left: left.filter((k) => !out.includes(k)) });
      left = left.filter((k) => !out.includes(k));
    }
  }
  if (!left.length) return { walk, winner: null, reason: "No candidate is eligible." };
  for (const f of spec.fields) {
    if (left.length === 1) break;
    if (f.rule === "context") continue;
    if (f.onlyIfSame) {
      const ref = spec.fields.find((x) => x.id === f.onlyIfSame);
      const seen = new Set(left.map((k) => String(values[k][ref.id])));
      if (seen.size > 1) {
        walk.push({ field: f.id, kind: "skipped", why: ref.label, left });
        continue;
      }
    }
    const parsed = left.map((k) => [k, fieldValue(f, values[k][f.id])]);
    const bad = parsed.find(([, v]) => v === null);
    if (bad) {
      return { walk, winner: null, reason: `${spec.candidates[bad[0]].label}: "${values[bad[0]][f.id]}" isn't a valid ${f.label.toLowerCase()}.` };
    }
    const best = Math.min(...parsed.map(([, v]) => badness(f, v)));
    const keep = parsed.filter(([, v]) => badness(f, v) === best).map(([k]) => k);
    walk.push({
      field: f.id,
      kind: keep.length === left.length ? "tie" : "decided",
      best: show(f, values[keep[0]][f.id]),
      left: keep,
      out: left.filter((k) => !keep.includes(k)),
    });
    left = keep;
  }
  if (left.length > 1) return { walk, winner: null, reason: "Every tie-breaker ties, so there is no single winner." };
  return { walk, winner: left[0] };
}

// Fill each named place (DR, then BDR) by running the election again without the earlier winners.
export function rank(spec, values) {
  const places = spec.places || [spec.winner || "Winner"];
  const results = [];
  let among = values.map((_, k) => k);
  for (const place of places) {
    if (!among.length) break;
    const r = decide(spec, values, among);
    // A later place nobody can fill (every remaining router has priority 0) is simply left empty.
    if (r.winner === null && results.length) break;
    results.push({ place, ...r });
    if (r.winner === null) break;
    among = among.filter((k) => k !== r.winner);
  }
  return results;
}

// ---------------------------------------------------------------- shortest paths

// Dijkstra over the link costs (a link may cost differently each way). Returns every
// equal-cost best path from `from` to `to` as node lists, with the total cost.
export function shortestPaths(spec, costs, from, to) {
  const adj = new Map(spec.nodes.map((n) => [n.id, []]));
  spec.links.forEach((l, i) => {
    const [ab, ba] = costs[i];
    if (ab !== null && l.down !== true) adj.get(l.a).push([l.b, ab, i]);
    if (ba !== null && l.down !== true) adj.get(l.b).push([l.a, ba, i]);
  });
  const dist = new Map([[from, 0]]);
  const prev = new Map([[from, []]]);
  const done = new Set();
  while (true) {
    let u = null;
    for (const [n, d] of dist) if (!done.has(n) && (u === null || d < dist.get(u))) u = n;
    if (u === null) break;
    done.add(u);
    for (const [v, c, li] of adj.get(u)) {
      const nd = dist.get(u) + c;
      if (!dist.has(v) || nd < dist.get(v)) { dist.set(v, nd); prev.set(v, [[u, li]]); }
      else if (nd === dist.get(v) && !prev.get(v).some(([p, pl]) => p === u && pl === li)) prev.get(v).push([u, li]);
    }
  }
  if (!dist.has(to)) return { cost: null, paths: [] };
  const paths = [];
  const walk = (n, nodes, links) => {
    if (paths.length >= 8) return;
    if (n === from) { paths.push({ nodes: [from, ...nodes], links: [...links] }); return; }
    for (const [p, li] of prev.get(n)) walk(p, [n, ...nodes], [li, ...links]);
  };
  walk(to, [], []);
  return { cost: dist.get(to), paths };
}

// ---------------------------------------------------------------- bits

export function dscpName(d) {
  if (d === 46) return "EF (expedited forwarding: voice)";
  if (d === 0) return "Default (best effort)";
  if (d === 44) return "VOICE-ADMIT";
  if (d % 8 === 0) return `CS${d / 8} (class selector ${d / 8})`;
  const x = d >> 3, y = (d & 7) >> 1;
  if ((d & 1) === 0 && x >= 1 && x <= 4 && y >= 1 && y <= 3) {
    return `AF${x}${y} (assured forwarding class ${x}, drop probability ${["", "low", "medium", "high"][y]})`;
  }
  return "No standard name";
}

export function ipv4Facts(ip, prefix) {
  const f = facts(ip, prefix);
  return {
    address: intToIp(ip),
    mask: intToIp(maskOf(prefix)),
    wildcard: intToIp(f.wildcard),
    network: intToIp(f.network),
    broadcast: intToIp(f.broadcast),
    first: intToIp(f.first),
    last: intToIp(f.last),
    usable: f.usable,
  };
}

// ---------------------------------------------------------------- matching

const PORT_NAMES = {
  "ftp-data": 20, ftp: 21, ssh: 22, telnet: 23, smtp: 25, domain: 53, bootps: 67, bootpc: 68, tftp: 69,
  www: 80, pop3: 110, ntp: 123, snmp: 161, snmptrap: 162, bgp: 179, https: 443, syslog: 514,
};

// "any", "host A.B.C.D", "A.B.C.D W.W.W.W", or a bare address (a host, as a standard ACL reads it).
export function parseAddress(text) {
  const t = String(text).trim().toLowerCase().split(/\s+/);
  if (t.length === 1 && t[0] === "any") return { addr: 0, wild: 0xffffffff };
  if (t.length === 2 && t[0] === "host") {
    const a = ipToInt(t[1]);
    return a === null ? null : { addr: a, wild: 0 };
  }
  if (t.length === 1) {
    const a = ipToInt(t[0]);
    return a === null ? null : { addr: a, wild: 0 };
  }
  if (t.length === 2) {
    const a = ipToInt(t[0]), w = ipToInt(t[1]);
    return a === null || w === null ? null : { addr: a, wild: w };
  }
  return null;
}

// Wildcard matching: the 0 bits must match, the 1 bits don't care.
export function addressMatches(spec, ip) {
  const care = (~spec.wild) >>> 0;
  return ((ip & care) >>> 0) === ((spec.addr & care) >>> 0);
}

export function parsePort(text) {
  if (text === undefined || text === null || text === "") return null;
  const t = String(text).trim().toLowerCase().split(/\s+/);
  const num = (s) => (s in PORT_NAMES ? PORT_NAMES[s] : /^\d+$/.test(s) && +s <= 65535 ? +s : null);
  if (t[0] === "range" && t.length === 3) {
    const lo = num(t[1]), hi = num(t[2]);
    return lo === null || hi === null || lo > hi ? undefined : { op: "range", lo, hi };
  }
  if (["eq", "neq", "lt", "gt"].includes(t[0]) && t.length === 2) {
    const v = num(t[1]);
    return v === null ? undefined : { op: t[0], v };
  }
  return undefined;
}

function portMatches(p, port) {
  if (p.op === "eq") return port === p.v;
  if (p.op === "neq") return port !== p.v;
  if (p.op === "lt") return port < p.v;
  if (p.op === "gt") return port > p.v;
  return port >= p.lo && port <= p.hi;
}

// Check a packet against an ACL top-down. Each line reports whether it matched and why not;
// lines after the first match are never read. No match means the implicit deny at the end.
export function evaluateAcl(kind, rules, packet) {
  const lines = [];
  let hit = null;
  const src = ipToInt(packet.src), dst = kind === "extended" ? ipToInt(packet.dst) : null;
  if (src === null || (kind === "extended" && dst === null)) return { error: "Enter a valid IPv4 address.", lines, hit };
  for (const [i, r] of rules.entries()) {
    if (hit !== null) { lines.push({ state: "skipped" }); continue; }
    const why = [];
    if (kind === "extended") {
      if (r.proto !== "ip" && r.proto !== packet.proto) why.push(`protocol is ${packet.proto}, not ${r.proto}`);
      if (!addressMatches(parseAddress(r.src), src)) why.push("source doesn't match");
      if (!addressMatches(parseAddress(r.dst), dst)) why.push("destination doesn't match");
      if ((packet.proto === "tcp" || packet.proto === "udp") && r.proto === packet.proto) {
        if (r.srcPort) {
          const port = Number(packet.srcPort);
          if (!portMatches(parsePort(r.srcPort), port)) why.push(`source port ${packet.srcPort || "?"} isn't ${r.srcPort}`);
        }
        if (r.port) {
          const port = Number(packet.port);
          if (!portMatches(parsePort(r.port), port)) why.push(`port ${port} isn't ${r.port}`);
        }
        // "established" matches return traffic: TCP segments with ACK or RST set.
        if (r.established && !packet.established) why.push("not part of an established session (no ACK/RST)");
      }
    } else if (!addressMatches(parseAddress(r.source), src)) {
      why.push("source doesn't match");
    }
    if (why.length) lines.push({ state: "miss", why });
    else { lines.push({ state: "match" }); hit = i; }
  }
  return { lines, hit, action: hit === null ? "deny" : rules[hit].action };
}

export function parsePrefixText(text) {
  const m = String(text).trim().match(/^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/);
  if (!m || +m[2] > 32) return null;
  const a = ipToInt(m[1]);
  return a === null ? null : { addr: a, len: +m[2] };
}

// Prefix lists: the first `len` bits must match, then the length must be exactly len,
// or within ge..le when either is given (ge alone runs to /32, le alone starts at len).
export function evaluatePrefixList(rules, input) {
  const p = parsePrefixText(input);
  if (!p) return { error: "Enter a prefix like 10.1.0.0/16.", lines: [], hit: null };
  const lines = [];
  let hit = null;
  for (const [i, r] of rules.entries()) {
    if (hit !== null) { lines.push({ state: "skipped" }); continue; }
    const rp = parsePrefixText(r.prefix);
    const m = maskOf(rp.len);
    const why = [];
    if (((p.addr & m) >>> 0) !== ((rp.addr & m) >>> 0)) why.push(`the first ${rp.len} bits differ`);
    const lo = r.ge ?? rp.len, hi = r.le ?? (r.ge !== undefined ? 32 : rp.len);
    if (p.len < lo || p.len > hi) why.push(lo === hi ? `length /${p.len} isn't /${lo}` : `length /${p.len} is outside /${lo}–/${hi}`);
    if (why.length) lines.push({ state: "miss", why });
    else { lines.push({ state: "match" }); hit = i; }
  }
  return { lines, hit, action: hit === null ? "deny" : rules[hit].action };
}
