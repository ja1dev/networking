// node web/tests/diagrams.test.mjs — the interactive diagrams' logic, and every diagram in the built content.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Served to browsers as ES modules with bare imports; load them here through data: URLs instead.
const asModule = (src) => "data:text/javascript," + encodeURIComponent(src);
const read = (f) => readFileSync(new URL("../app/static/js/" + f, import.meta.url), "utf8");
const mathUrl = asModule(read("subnet-math.js"));
const L = await import(asModule(read("diagram-logic.js").replace('"netlab/subnet-math"', JSON.stringify(mathUrl))));

// ---- elections
const dr = {
  places: ["DR", "BDR"],
  fields: [
    { id: "prio", label: "Priority", kind: "number", rule: "highest", ineligible: 0 },
    { id: "rid", label: "Router ID", kind: "ip", rule: "highest" },
  ],
  candidates: ["R1", "R2", "R3", "R4"].map((label) => ({ label })),
};
let r = L.rank(dr, [{ prio: 1, rid: "1.1.1.1" }, { prio: 1, rid: "2.2.2.2" }, { prio: 1, rid: "3.3.3.3" }, { prio: 0, rid: "4.4.4.4" }]);
assert.deepEqual(r.map((x) => x.winner), [2, 1]);
assert.equal(r[0].walk[0].kind, "ineligible");
r = L.rank(dr, [{ prio: 200, rid: "1.1.1.1" }, { prio: 1, rid: "2.2.2.2" }, { prio: 1, rid: "3.3.3.3" }, { prio: 0, rid: "9.9.9.9" }]);
assert.deepEqual(r.map((x) => x.winner), [0, 2]);
// Priority as typed text, the way an input hands it over.
r = L.rank(dr, [{ prio: "0", rid: "1.1.1.1" }, { prio: "0", rid: "2.2.2.2" }, { prio: "5", rid: "3.3.3.3" }, { prio: "0", rid: "4.4.4.4" }]);
assert.deepEqual(r.map((x) => x.winner), [2]);
assert.equal(r.length, 1, "nobody left to be BDR");
r = L.rank(dr, [{ prio: "x", rid: "1.1.1.1" }, { prio: 1, rid: "2.2.2.2" }, { prio: 1, rid: "3.3.3.3" }, { prio: 1, rid: "4.4.4.4" }]);
assert.equal(r[0].winner, null);
assert.match(r[0].reason, /isn't a valid priority/);

const stp = {
  fields: [
    { id: "prio", label: "Bridge priority", kind: "number", rule: "lowest" },
    { id: "mac", label: "MAC", kind: "mac", rule: "lowest" },
  ],
  candidates: [{ label: "SW1" }, { label: "SW2" }],
};
assert.equal(L.decide(stp, [{ prio: 32768, mac: "0011.2233.4455" }, { prio: 32768, mac: "0011.2233.4401" }]).winner, 1);
assert.equal(L.decide(stp, [{ prio: 4096, mac: "ffff.ffff.ffff" }, { prio: 32768, mac: "0000.0000.0001" }]).winner, 0);
assert.equal(L.macValue("00:11:22:33:44:55"), L.macValue("0011.2233.4455"));

const bgp = {
  fields: [
    { id: "lp", label: "Local preference", kind: "number", rule: "highest" },
    { id: "origin", label: "Origin", kind: "choice", rule: "order", options: [{ value: "i" }, { value: "e" }, { value: "?" }] },
    { id: "nas", label: "Neighbor AS", kind: "number", rule: "context" },
    { id: "med", label: "MED", kind: "number", rule: "lowest", onlyIfSame: "nas" },
    { id: "ebgp", label: "eBGP", kind: "bool", rule: "true" },
  ],
  candidates: [{ label: "A" }, { label: "B" }],
};
// MED is skipped across different neighbour ASes, so eBGP over iBGP decides.
let d = L.decide(bgp, [{ lp: 100, origin: "i", nas: 1, med: 0, ebgp: false }, { lp: 100, origin: "i", nas: 2, med: 50, ebgp: true }]);
assert.equal(d.winner, 1);
assert.equal(d.walk.find((s) => s.field === "med").kind, "skipped");
assert.ok(!d.walk.some((s) => s.field === "nas"), "context fields are never compared");
// Same neighbour AS: MED counts.
d = L.decide(bgp, [{ lp: 100, origin: "i", nas: 1, med: 0, ebgp: false }, { lp: 100, origin: "i", nas: 1, med: 50, ebgp: true }]);
assert.equal(d.winner, 0);
assert.equal(L.decide(bgp, [{ lp: 100, origin: "?", nas: 1, med: 0, ebgp: true }, { lp: 100, origin: "e", nas: 1, med: 9, ebgp: true }]).winner, 1);
assert.equal(L.decide(bgp, [{ lp: 100, origin: "i", nas: 1, med: 0, ebgp: true }, { lp: 100, origin: "i", nas: 1, med: 0, ebgp: true }]).winner, null);

// ---- shortest paths
const g = {
  nodes: ["R1", "R2", "R3", "R4", "R5"].map((id) => ({ id })),
  links: [["R1", "R2"], ["R2", "R4"], ["R4", "R5"], ["R1", "R3"], ["R3", "R5"]].map(([a, b]) => ({ a, b })),
};
let sp = L.shortestPaths(g, [[10, 10], [10, 10], [10, 10], [64, 64], [1, 1]], "R1", "R5");
assert.equal(sp.cost, 30);
assert.deepEqual(sp.paths.map((p) => p.nodes), [["R1", "R2", "R4", "R5"]]);
sp = L.shortestPaths(g, [[10, 10], [10, 10], [10, 10], [29, 29], [1, 1]], "R1", "R5");
assert.equal(sp.cost, 30);
assert.equal(sp.paths.length, 2, "equal costs load-share");
// Costs are per direction, as OSPF's are.
sp = L.shortestPaths(g, [[10, 10], [10, 10], [10, 10], [64, 1], [1, 1]], "R5", "R1");
assert.deepEqual(sp.paths[0].nodes, ["R5", "R3", "R1"]);
assert.deepEqual(L.shortestPaths({ ...g, links: g.links.slice(0, 2) }, [[1, 1], [1, 1]], "R1", "R5"), { cost: null, paths: [] });

// ---- bits
assert.equal(L.dscpName(46), "EF (expedited forwarding: voice)");
assert.match(L.dscpName(34), /^AF41/);
assert.match(L.dscpName(10), /^AF11/);
assert.match(L.dscpName(24), /^CS3/);
assert.equal(L.dscpName(0), "Default (best effort)");
assert.equal(L.dscpName(47), "No standard name");
const f = L.ipv4Facts(0xac102dc8, 20);
assert.equal(f.network, "172.16.32.0");
assert.equal(f.broadcast, "172.16.47.255");
assert.equal(f.wildcard, "0.0.15.255");

// ---- ACLs
const std = [{ action: "deny", source: "host 10.1.1.5" }, { action: "permit", source: "10.1.1.0 0.0.0.255" }];
assert.equal(L.evaluateAcl("standard", std, { src: "10.1.1.5" }).action, "deny");
assert.equal(L.evaluateAcl("standard", std, { src: "10.1.1.6" }).hit, 1);
let a = L.evaluateAcl("standard", std, { src: "10.1.2.6" });
assert.equal(a.hit, null);
assert.equal(a.action, "deny", "implicit deny");
assert.ok(L.evaluateAcl("standard", std, { src: "10.1.300.1" }).error);
// A discontiguous wildcard: odd third octets only.
assert.ok(L.addressMatches(L.parseAddress("10.0.1.0 0.0.254.255"), 0x0a000301));
assert.ok(!L.addressMatches(L.parseAddress("10.0.1.0 0.0.254.255"), 0x0a000201));
const ext = [
  { action: "permit", proto: "tcp", src: "any", dst: "host 203.0.113.10", port: "eq 443" },
  { action: "deny", proto: "ip", src: "10.0.0.0 0.255.255.255", dst: "any" },
  { action: "permit", proto: "udp", src: "any", dst: "any", port: "range 16384 32767" },
  { action: "permit", proto: "udp", src: "any", dst: "any", port: "eq domain" },
];
assert.equal(L.evaluateAcl("extended", ext, { proto: "tcp", src: "192.0.2.1", dst: "203.0.113.10", port: "443" }).hit, 0);
a = L.evaluateAcl("extended", ext, { proto: "tcp", src: "192.0.2.1", dst: "203.0.113.10", port: "22" });
assert.equal(a.hit, null);
assert.match(a.lines[0].why.join(), /port 22 isn't eq 443/);
assert.equal(L.evaluateAcl("extended", ext, { proto: "udp", src: "10.9.9.9", dst: "8.8.8.8", port: "53" }).hit, 1);
assert.equal(L.evaluateAcl("extended", ext, { proto: "udp", src: "192.0.2.1", dst: "8.8.8.8", port: "20000" }).hit, 2);
assert.equal(L.evaluateAcl("extended", ext, { proto: "udp", src: "192.0.2.1", dst: "8.8.8.8", port: "53" }).hit, 3);
assert.equal(L.evaluateAcl("extended", ext, { proto: "icmp", src: "192.0.2.1", dst: "203.0.113.10" }).hit, null);
assert.deepEqual(L.parsePort("gt 1023"), { op: "gt", v: 1023 });
const ret = [
  { action: "permit", proto: "tcp", src: "any", dst: "10.0.0.0 0.255.255.255", established: true },
  { action: "permit", proto: "tcp", src: "192.0.2.1", srcPort: "eq bgp", dst: "any" },
  { action: "permit", proto: "ospf", src: "any", dst: "any" },
];
assert.equal(L.evaluateAcl("extended", ret, { proto: "tcp", src: "8.8.8.8", dst: "10.1.1.1", port: "51000", established: true }).hit, 0);
a = L.evaluateAcl("extended", ret, { proto: "tcp", src: "8.8.8.8", dst: "10.1.1.1", port: "51000", established: false });
assert.equal(a.hit, null);
assert.match(a.lines[0].why.join(), /established/);
assert.equal(L.evaluateAcl("extended", ret, { proto: "tcp", src: "192.0.2.1", dst: "10.1.1.1", port: "40000", srcPort: "179" }).hit, 1);
assert.equal(L.evaluateAcl("extended", ret, { proto: "tcp", src: "192.0.2.1", dst: "172.16.0.1", port: "179", srcPort: "40000" }).hit, null);
assert.equal(L.evaluateAcl("extended", ret, { proto: "ospf", src: "10.0.0.1", dst: "224.0.0.5" }).hit, 2);
assert.equal(L.parsePort("range 9 3"), undefined);

// ---- prefix lists
const pl = [
  { seq: 5, action: "deny", prefix: "10.0.0.0/8" },
  { seq: 10, action: "permit", prefix: "10.0.0.0/8", ge: 24, le: 24 },
  { seq: 15, action: "permit", prefix: "172.16.0.0/12", le: 16 },
  { seq: 20, action: "permit", prefix: "0.0.0.0/0", ge: 30 },
];
const hit = (p) => L.evaluatePrefixList(pl, p).hit;
assert.equal(hit("10.0.0.0/8"), 0);
assert.equal(hit("10.20.30.0/24"), 1);
assert.equal(hit("10.20.0.0/16"), null);
assert.equal(hit("172.16.0.0/12"), 2);
assert.equal(hit("172.20.0.0/16"), 2);
assert.equal(hit("172.20.1.0/24"), null);
assert.equal(hit("192.168.1.4/30"), 3);
assert.equal(hit("192.168.1.0/29"), null);
assert.ok(L.evaluatePrefixList(pl, "10.1.1.0").error);

// ---- step-throughs
const topo = {
  nodes: [{ id: "A" }, { id: "B" }, { id: "C" }],
  links: [{ a: "A", b: "B" }, { id: "t1", a: "A", b: "C", style: "tunnel" }, { id: "p1", a: "B", b: "C" }, { id: "p2", a: "B", b: "C" }],
  steps: [
    { nodes: { A: { badge: "DR" } }, links: { "A-B": "blocked" }, focus: ["A"], packets: [{ path: ["A", "B", "C"], via: [null, "p2"] }] },
    { nodes: { B: { badge: "BDR" } }, links: { t1: "active" } },
    { nodes: { A: null, B: { badge: null } }, links: { "B-A": null }, focus: ["t1"] },
  ],
};
let st = L.topologyState(topo, 0);
assert.deepEqual(st.packets[0].hops, [0, 3]);
assert.ok(st.focus.has("node:A"));
assert.equal(st.links[0], "blocked");
st = L.topologyState(topo, 1);
assert.equal(st.nodes.A.badge, "DR", "badges carry forward");
assert.equal(st.links[1], "active");
assert.equal(st.focus.size, 0, "focus belongs to one step");
st = L.topologyState(topo, 2);
assert.ok(!("A" in st.nodes), "null clears a node's state");
assert.deepEqual(st.nodes.B, {}, "a null field clears just that field");
assert.ok(!(0 in st.links), "null clears a link state");
assert.ok(st.focus.has("link:1"));
const seq = { messages: [{ states: { R1: "Idle" } }, {}, { states: { R1: "Up", R2: "Up" } }] };
assert.deepEqual(L.sequenceState(seq, 1), { visible: 2, states: { R1: "Idle" } });
assert.deepEqual(L.sequenceState(seq, 2).states, { R1: "Up", R2: "Up" });

// ---- every diagram in the built content runs through its logic without throwing
const contentPath = process.env.CONTENT_PATH || new URL("../app/data/content.json", import.meta.url).pathname;
let count = 0;
if (existsSync(contentPath)) {
  const content = JSON.parse(readFileSync(contentPath, "utf8"));
  for (const doc of Object.values(content.docs)) {
    for (const page of Object.values(doc.pages)) {
      for (const m of page.html.matchAll(/<script type="application\/json" class="dg-spec">(.*?)<\/script>/gs)) {
        const spec = JSON.parse(m[1].replaceAll("<\\/", "</"));
        const where = `${doc.id}/${page.id} "${spec.title}"`;
        count++;
        try {
          if (spec.type === "topology") {
            for (let i = 0; i < (spec.steps || []).length; i++) {
              const s = L.topologyState(spec, i);
              for (const p of s.packets) assert.ok(p.hops.every((h) => h !== undefined), "packet hop without a link");
            }
          } else if (spec.type === "sequence") {
            spec.messages.forEach((_, i) => L.sequenceState(spec, i));
          } else if (spec.type === "compare") {
            const res = L.rank(spec, spec.candidates.map((c) => c.values));
            assert.ok(res[0].winner !== null, "the starting values must produce a winner: " + res[0].reason);
          } else if (spec.type === "path") {
            const costs = spec.links.map((l) => l.costs || [l.cost, l.cost]);
            assert.ok(L.shortestPaths(spec, costs, spec.from, spec.to).paths.length, "from can't reach to");
          } else if (spec.type === "match") {
            for (const t of [spec.input, ...(spec.tries || [])]) {
              const res = spec.kind === "prefix-list" ? L.evaluatePrefixList(spec.rules, t)
                : L.evaluateAcl(spec.kind, spec.rules, typeof t === "string" ? { src: t } : t);
              assert.ok(!res.error, res.error);
            }
          }
        } catch (e) {
          throw new Error(`${where}: ${e.message}`);
        }
      }
    }
  }
}
console.log(`diagram logic ok; ${count} diagrams in the content checked`);
