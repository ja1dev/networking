// A Cisco IOS-style network simulator for the terminal labs.
//
// A Network holds devices (routers, switches and VPCS-style PCs) and the cables
// between them. Everything the network does is worked out from configuration on
// demand: which interfaces are up, which VLAN a frame lands in, whether DTP forms
// a trunk, OSPF neighbours and routes, ACL hits, DHCP leases, whether a ping gets
// through. What you configure is exactly what you get.
//
// A Session is one console. It parses input the way IOS does: abbreviations,
// `?` help, Tab completion, `no` and `do` forms, modes, and the familiar errors.

// ---------------------------------------------------------------- addresses
export function isIp(s) {
  const p = String(s).split(".");
  return p.length === 4 && p.every((x) => /^\d{1,3}$/.test(x) && +x <= 255);
}
export const ip2n = (s) => s.split(".").reduce((a, x) => a * 256 + +x, 0);
export const n2ip = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
export const lenMask = (l) => (l === 0 ? 0 : (0xffffffff << (32 - l)) >>> 0);
export function maskLen(m) {
  let l = 0;
  while (l < 32 && (m >>> (31 - l)) & 1) l++;
  return lenMask(l) === m ? l : -1;
}
const and = (a, b) => (a & b) >>> 0;
const sameNet = (a, b, m) => and(a, m) === and(b, m);
const wildMatch = (ip, addr, wild) => and(ip, ~wild) === and(addr, ~wild);
const bitCount = (n) => { let c = 0; for (let i = 0; i < 32; i++) c += (n >>> i) & 1; return c; };
const clone = (o) => JSON.parse(JSON.stringify(o));

// Structural equality that ignores key order (saved state can come back with its keys sorted).
export function sameData(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a).filter((k) => a[k] !== undefined), kb = Object.keys(b).filter((k) => b[k] !== undefined);
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && sameData(a[k], b[k]));
}
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

// ---------------------------------------------------------------- interfaces
const PORTS = {
  router: ["GigabitEthernet0/0", "GigabitEthernet0/1", "GigabitEthernet0/2", "GigabitEthernet0/3"],
  switch: [...Array(24)].map((_, i) => "FastEthernet0/" + (i + 1)).concat(["GigabitEthernet0/1", "GigabitEthernet0/2"]),
  pc: ["eth0"],
};
const IF_TYPES = { router: ["GigabitEthernet", "Loopback"], switch: ["FastEthernet", "GigabitEthernet", "Vlan"] };
const IF_HELP = {
  GigabitEthernet: "GigabitEthernet IEEE 802.3z", FastEthernet: "FastEthernet IEEE 802.3",
  Loopback: "Loopback interface", Vlan: "Catalyst Vlans",
};
const SHORT = { GigabitEthernet: "Gi", FastEthernet: "Fa", Loopback: "Lo", Vlan: "Vl" };
export const shortIf = (n) => n.replace(/^[A-Za-z]+/, (t) => SHORT[t] || t);
const ifType = (n) => (/^[A-Za-z]+/.exec(n) || [""])[0];
const physOf = (n) => n.split(".")[0];
const isSub = (n) => n.includes(".");
const RANK = { Vlan: 0, FastEthernet: 1, GigabitEthernet: 2, Loopback: 3, eth: 4 };

function ifSort(a, b) {
  const ta = RANK[ifType(a)] ?? 9, tb = RANK[ifType(b)] ?? 9;
  if (ta !== tb) return ta - tb;
  const na = a.slice(ifType(a).length).split(/[/.]/).map(Number);
  const nb = b.slice(ifType(b).length).split(/[/.]/).map(Number);
  for (let i = 0; i < Math.max(na.length, nb.length); i++) {
    if ((na[i] ?? -1) !== (nb[i] ?? -1)) return (na[i] ?? -1) - (nb[i] ?? -1);
  }
  return 0;
}

// Parse "g0/0", "gig 0/0", "GigabitEthernet0/0.10", "lo0", "vlan 10" into a full name.
// Returns {name, used} (name is null when the number is missing) or null.
export function parseIfName(devType, toks, k) {
  const m = /^([A-Za-z-]+)([\d/.]*)$/.exec(toks[k].t);
  if (!m || !IF_TYPES[devType]) return null;
  const types = IF_TYPES[devType].filter((t) => t.toLowerCase().startsWith(m[1].toLowerCase()));
  if (types.length !== 1) return null;
  let num = m[2], used = 1;
  if (!num) {
    const nx = toks[k + 1];
    if (!nx) return { name: null, used: 1 };
    if (!/^[\d/.]+$/.test(nx.t)) return null;
    num = nx.t; used = 2;
  }
  const t = types[0];
  const ok = t === "Loopback" ? /^\d{1,9}$/.test(num)
    : t === "Vlan" ? /^\d{1,4}$/.test(num) && +num >= 1 && +num <= 4094
      : /^\d+\/\d+(\.\d{1,9})?$/.test(num);
  return ok ? { name: t + num, used } : null;
}

// ---------------------------------------------------------------- passwords
const XLAT = "dsfd;kfoA,.iyewrkldJKDHSUBsgvca69834ncxv9873254k;fg87";
export function type7(pw) {
  const seed = [...pw].reduce((a, c) => a + c.charCodeAt(0), 0) % 16;
  let out = String(seed).padStart(2, "0");
  for (let i = 0; i < pw.length; i++) {
    out += (pw.charCodeAt(i) ^ XLAT.charCodeAt((seed + i) % XLAT.length)).toString(16).toUpperCase().padStart(2, "0");
  }
  return out;
}
export function type7decode(enc) {
  const seed = +enc.slice(0, 2);
  let out = "";
  for (let i = 2; i < enc.length; i += 2) {
    out += String.fromCharCode(parseInt(enc.slice(i, i + 2), 16) ^ XLAT.charCodeAt((seed + (i - 2) / 2) % XLAT.length));
  }
  return out;
}
function md5ish(pw) {
  // Stands in for an MD5-crypt hash in show output: stable, one-way looking, not reversible here.
  const abc = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let h = 2166136261, s = "";
  for (let i = 0; i < 26; i++) {
    h ^= pw.charCodeAt(i % pw.length) + i * 31;
    h = Math.imul(h, 16777619) >>> 0;
    s += abc[h % 64];
  }
  return "$1$" + s.slice(0, 4) + "$" + s.slice(4);
}

// ---------------------------------------------------------------- defaults
const hex = (n, w) => n.toString(16).padStart(w, "0");
const dotted = (h) => h.slice(0, 4) + "." + h.slice(4, 8) + "." + h.slice(8, 12);

function newIntf(type, name) {
  const base = { desc: "", shut: false, ip: null, mask: null, cdp: true, bw: null };
  if (type === "router") {
    return { ...base, shut: PORTS.router.includes(name), helpers: [], aclIn: null, aclOut: null, ospf: {}, encap: null };
  }
  if (name.startsWith("Vlan")) return { ...base, shut: name === "Vlan1" };
  return { ...base, mode: "dynamic auto", accessVlan: 1, native: 1, allowed: null, noneg: false };
}

const newLine = (vty) => ({ password: null, login: vty ? "line" : null, transport: "all", timeout: null, sync: false });

function defaultCfg(type, name) {
  if (type === "pc") return { hostname: name, ip: null, mask: null, gw: null, dns: null, dhcp: false, dhcpServer: null };
  const cfg = {
    hostname: type === "router" ? "Router" : "Switch",
    enableSecret: null, enablePassword: null, pwEnc: false, banner: "", domainLookup: true, domain: "",
    users: {}, rsa: 0, sshVer: null, cdp: true, intfs: {},
    lines: { con: newLine(false), vty0: newLine(true) },
  };
  for (const p of PORTS[type]) cfg.intfs[p] = newIntf(type, p);
  if (type === "router") Object.assign(cfg, { routes: [], ospf: null, acls: {}, dhcp: { excluded: [], pools: {} } });
  else {
    cfg.lines.vty5 = newLine(true);
    cfg.intfs.Vlan1 = newIntf(type, "Vlan1");
    Object.assign(cfg, { vlans: { 1: "default" }, gateway: null });
  }
  return cfg;
}

const newRuntime = () => ({ mac: {}, arp: {}, bindings: {}, hits: {}, logins: [] });

// ---------------------------------------------------------------- the network
export class Network {
  constructor(spec, saved) {
    this.spec = spec;
    this.devs = {};
    spec.devices.forEach((d, i) => {
      if (!PORTS[d.type]) throw new Error("unknown device type " + d.type);
      this.devs[d.name] = {
        name: d.name, type: d.type, idx: i, ports: PORTS[d.type],
        cfg: defaultCfg(d.type, d.name), startup: null, rt: newRuntime(),
      };
    });
    this.peers = {};
    for (const [a, ap, b, bp] of spec.links) {
      for (const [d, p] of [[a, ap], [b, bp]]) {
        if (!this.devs[d] || !this.devs[d].ports.includes(p)) throw new Error("bad link end " + d + " " + p);
        if (this.peers[d + "|" + p]) throw new Error("port used twice: " + d + " " + p);
      }
      this.peers[a + "|" + ap] = { dev: b, port: bp };
      this.peers[b + "|" + bp] = { dev: a, port: ap };
    }
    if (saved && saved.devices) {
      for (const [name, s] of Object.entries(saved.devices)) {
        const d = this.devs[name];
        if (!d) continue;
        d.cfg = Object.assign(defaultCfg(d.type, name), s.cfg);
        for (const p of d.ports) if (d.type !== "pc" && !d.cfg.intfs[p]) d.cfg.intfs[p] = newIntf(d.type, p);
        d.startup = s.startup || null;
        d.rt = Object.assign(newRuntime(), s.rt);
      }
    }
    this.touch();
  }

  touch() { this.c = { flood: {}, routes: {} }; }

  toJSON() {
    const devices = {};
    for (const d of Object.values(this.devs)) devices[d.name] = { cfg: d.cfg, startup: d.startup, rt: d.rt };
    return { v: 1, devices };
  }

  dev(name) { return this.devs[name]; }
  peer(dn, port) { return this.peers[dn + "|" + port] || null; }

  mac(dn, ifn) {
    const d = this.devs[dn];
    if (d.type === "pc") return dotted("00507966" + "68" + hex(d.idx, 2));
    if (d.type === "router") return dotted("525400" + hex(d.idx, 2) + hex(d.ports.indexOf(physOf(ifn)) + 1, 2) + "00");
    if (ifn.startsWith("Vlan")) return dotted("0cd5" + hex(d.idx, 2) + "008000");
    return dotted("0cd5" + hex(d.idx, 2) + "00" + hex(d.ports.indexOf(ifn) + 1, 4));
  }

  // -- interface state ------------------------------------------------------
  adminUp(dn, ifn) {
    const d = this.devs[dn];
    if (d.type === "pc") return true;
    const c = d.cfg.intfs[ifn];
    if (!c || c.shut) return false;
    return !isSub(ifn) || !d.cfg.intfs[physOf(ifn)].shut;
  }

  portUp(dn, port) {
    const p = this.peer(dn, port);
    return !!p && this.adminUp(dn, port) && this.adminUp(p.dev, p.port);
  }

  // {status, proto}: status is "up", "down" or "administratively down".
  ifState(dn, ifn) {
    const d = this.devs[dn];
    const c = d.type === "pc" ? {} : d.cfg.intfs[ifn];
    if (!c) return { status: "down", proto: "down" };
    if (c.shut) return { status: "administratively down", proto: "down" };
    let up;
    if (ifn.startsWith("Loopback")) up = true;
    else if (ifn.startsWith("Vlan")) up = this.sviUp(d, +ifn.slice(4));
    else up = this.portUp(dn, physOf(ifn));
    return { status: up ? "up" : "down", proto: up ? "up" : "down" };
  }

  ifUp(dn, ifn) { return this.ifState(dn, ifn).proto === "up"; }

  sviUp(d, v) {
    if (!d.cfg.vlans[v]) return false;
    return d.ports.some((p) => this.portUp(d.name, p) && this.carries(d, p, v));
  }

  // -- switching --------------------------------------------------------------
  // The operational mode of a switch port, including DTP negotiation with the far end.
  swMode(d, port) {
    const c = d.cfg.intfs[port];
    if (c.mode === "access" || c.mode === "trunk") return c.mode;
    const p = this.peer(d.name, port);
    const pd = p && this.devs[p.dev];
    if (!pd || pd.type !== "switch") return "access";
    const pc = pd.cfg.intfs[p.port];
    const peerSends = pc.mode === "dynamic desirable" || (pc.mode === "trunk" && !pc.noneg);
    if (c.mode === "dynamic desirable") return peerSends || pc.mode === "dynamic auto" ? "trunk" : "access";
    return peerSends ? "trunk" : "access";
  }

  allowed(c, v) { return c.allowed === null || c.allowed.includes(v); }

  // Does this switch port carry VLAN v (tagged or untagged)?
  carries(d, port, v) {
    const c = d.cfg.intfs[port];
    return this.swMode(d, port) === "access" ? c.accessVlan === v : this.allowed(c, v);
  }

  ingressVlan(d, port, tag) {
    const c = d.cfg.intfs[port];
    let v;
    if (this.swMode(d, port) === "access") v = tag === null ? c.accessVlan : null;
    else v = tag === null ? c.native : (this.allowed(c, tag) ? tag : null);
    return v !== null && d.cfg.vlans[v] ? v : null;
  }

  // The 802.1Q tag a switch puts on a VLAN-v frame leaving this port; undefined = not sent.
  egressTag(d, port, v) {
    const c = d.cfg.intfs[port];
    if (this.swMode(d, port) === "access") return c.accessVlan === v ? null : undefined;
    if (!this.allowed(c, v)) return undefined;
    return v === c.native ? null : v;
  }

  routerIngress(d, port, tag) {
    const subs = Object.keys(d.cfg.intfs).filter((n) => isSub(n) && physOf(n) === port && d.cfg.intfs[n].encap);
    if (tag === null) return subs.find((n) => d.cfg.intfs[n].encap.native) || port;
    return subs.find((n) => d.cfg.intfs[n].encap.vlan === tag && !d.cfg.intfs[n].encap.native) || null;
  }

  // Every L3 interface in the same broadcast domain as dn/ifn, with the cable path to it.
  flood(dn, ifn) {
    const key = dn + "|" + ifn;
    if (this.c.flood[key]) return this.c.flood[key];
    const out = [], q = [], seen = new Set();
    const send = (from, port, tag, trail) => {
      if (!this.portUp(from, port)) return;
      const p = this.peer(from, port);
      q.push({ dn: p.dev, port: p.port, tag, trail: trail.concat([{ a: from, ap: port, b: p.dev, bp: p.port, vlan: null }]) });
    };
    const swFlood = (sdn, v, inPort, trail) => {
      if (seen.has(sdn + "|" + v)) return;
      seen.add(sdn + "|" + v);
      const sd = this.devs[sdn];
      if (trail.length) trail = trail.slice(0, -1).concat([{ ...trail[trail.length - 1], vlan: v }]);
      if (sd.cfg.intfs["Vlan" + v]) out.push({ dev: sdn, ifn: "Vlan" + v, trail });
      for (const port of sd.ports) {
        if (port === inPort) continue;
        const tag = this.egressTag(sd, port, v);
        if (tag !== undefined) send(sdn, port, tag, trail);
      }
    };
    const d = this.devs[dn];
    if (d.type === "switch") swFlood(dn, +ifn.slice(4), null, []);
    else if (!ifn.startsWith("Loopback")) {
      const enc = d.type === "router" && d.cfg.intfs[ifn].encap;
      send(dn, physOf(ifn), enc && !enc.native ? enc.vlan : null, []);
    }
    while (q.length) {
      const f = q.shift();
      const fd = this.devs[f.dn];
      if (fd.type === "switch") {
        const v = this.ingressVlan(fd, f.port, f.tag);
        if (v !== null) swFlood(f.dn, v, f.port, f.trail);
      } else {
        const target = fd.type === "pc" ? (f.tag === null ? "eth0" : null) : this.routerIngress(fd, f.port, f.tag);
        if (target) out.push({ dev: f.dn, ifn: target, trail: f.trail });
      }
    }
    const res = out.filter((e) => !(e.dev === dn && e.ifn === ifn));
    this.c.flood[key] = res;
    return res;
  }

  // -- addressing -------------------------------------------------------------
  ifAddr(dn, ifn) {
    const d = this.devs[dn];
    if (d.type === "pc") return d.cfg.ip === null ? null : { ip: d.cfg.ip, mask: d.cfg.mask };
    const c = d.cfg.intfs[ifn];
    return c && c.ip !== null ? { ip: c.ip, mask: c.mask } : null;
  }

  l3Ifs(dn) {
    const d = this.devs[dn];
    if (d.type === "pc") return d.cfg.ip === null ? [] : ["eth0"];
    return Object.keys(d.cfg.intfs).filter((n) => d.cfg.intfs[n].ip !== null).sort(ifSort);
  }

  upIfs(dn) { return this.l3Ifs(dn).filter((n) => this.ifUp(dn, n)); }

  ownsIp(dn, ip) { return this.upIfs(dn).some((n) => this.ifAddr(dn, n).ip === ip); }

  ownerOf(ip) {
    for (const dn of Object.keys(this.devs)) if (this.ownsIp(dn, ip)) return dn;
    return null;
  }

  // -- OSPF -------------------------------------------------------------------
  ospfIfs(dn) {
    const d = this.devs[dn], o = d.cfg.ospf, out = [];
    if (!o) return out;
    const nets = [...o.networks].sort((a, b) => bitCount(a.wild) - bitCount(b.wild));
    for (const ifn of this.upIfs(dn)) {
      const c = d.cfg.intfs[ifn], { ip, mask } = this.ifAddr(dn, ifn), oc = c.ospf || {};
      let area = null;
      if (oc.pid === o.pid && oc.area !== undefined && oc.area !== null) area = oc.area;
      else {
        const hit = nets.find((n) => wildMatch(ip, n.addr, n.wild));
        if (hit) area = hit.area;
      }
      if (area === null) continue;
      const passive = o.passiveDefault ? !o.noPassive.includes(ifn) : o.passive.includes(ifn);
      const hello = oc.hello ?? 10;
      out.push({
        ifn, ip, mask, area, passive, hello, dead: oc.dead ?? hello * 4, prio: oc.prio ?? 1,
        ptp: !!oc.ptp, loop: ifn.startsWith("Loopback"),
        cost: oc.cost ?? Math.max(1, Math.floor((o.refBw * 1000) / this.bandwidth(d, ifn))),
      });
    }
    return out;
  }

  bandwidth(d, ifn) {
    const c = d.cfg.intfs[ifn];
    if (c.bw) return c.bw;
    const t = ifType(ifn);
    return t === "FastEthernet" ? 100000 : t === "Loopback" ? 8000000 : 1000000;
  }

  routerId(dn) {
    const d = this.devs[dn], o = d.cfg.ospf;
    if (!o) return null;
    if (o.ridHeld !== null && o.ridHeld !== undefined) return o.ridHeld;
    if (o.rid !== null) return o.rid;
    const ips = (pref) => this.upIfs(dn).filter((n) => pref === n.startsWith("Loopback")).map((n) => this.ifAddr(dn, n).ip);
    const lo = ips(true), all = ips(false);
    if (lo.length) return Math.max(...lo);
    return all.length ? Math.max(...all) : null;
  }

  ospf() {
    if (this.c.ospf) return this.c.ospf;
    const per = {};
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router" || !d.cfg.ospf) continue;
      const rid = this.routerId(d.name);
      if (rid === null) continue;
      per[d.name] = { rid, pid: d.cfg.ospf.pid, ifs: this.ospfIfs(d.name), nbrs: [], routes: [] };
    }
    // Adjacencies: who hears whom with matching parameters.
    for (const [dn, me] of Object.entries(per)) {
      for (const oi of me.ifs) {
        oi.nbrs = [];
        if (oi.passive || oi.loop) continue;
        for (const e of this.flood(dn, oi.ifn)) {
          const them = per[e.dev];
          const oj = them && them.ifs.find((x) => x.ifn === e.ifn);
          if (!oj || oj.passive || oj.loop || e.dev === dn) continue;
          if (oj.area !== oi.area || oj.mask !== oi.mask || !sameNet(oj.ip, oi.ip, oi.mask)) continue;
          if (oj.hello !== oi.hello || oj.dead !== oi.dead || oj.ptp !== oi.ptp || them.rid === me.rid) continue;
          oi.nbrs.push({ dev: e.dev, ifn: e.ifn, rid: them.rid, ip: oj.ip, prio: oj.prio });
        }
      }
    }
    // DR/BDR election on broadcast segments: highest priority, then highest router ID.
    for (const me of Object.values(per)) {
      for (const oi of me.ifs) {
        if (oi.loop) { oi.role = "LOOP"; continue; }
        if (oi.ptp) { oi.role = "P2P"; continue; }
        if (oi.passive) { oi.role = "DR"; oi.dr = { rid: me.rid, ip: oi.ip }; oi.bdr = null; continue; }
        const cands = [{ rid: me.rid, ip: oi.ip, prio: oi.prio }, ...oi.nbrs].filter((x) => x.prio > 0)
          .sort((a, b) => b.prio - a.prio || b.rid - a.rid);
        oi.dr = cands[0] || null;
        oi.bdr = cands[1] || null;
        oi.role = oi.dr && oi.dr.rid === me.rid ? "DR" : oi.bdr && oi.bdr.rid === me.rid ? "BDR" : "DROTHER";
      }
    }
    for (const me of Object.values(per)) {
      for (const oi of me.ifs) {
        for (const n of oi.nbrs || []) {
          let state;
          if (oi.ptp) state = "FULL/  -";
          else {
            const role = oi.dr && oi.dr.rid === n.rid ? "DR" : oi.bdr && oi.bdr.rid === n.rid ? "BDR" : "DROTHER";
            const full = oi.role !== "DROTHER" || role !== "DROTHER";
            state = (full ? "FULL/" : "2WAY/") + role;
          }
          me.nbrs.push({ ...n, state, local: oi.ifn, dead: oi.dead });
        }
      }
    }
    // SPF from every router.
    for (const [src, me] of Object.entries(per)) {
      const dist = { [src]: 0 }, hops = { [src]: [] }, done = new Set();
      for (;;) {
        let u = null;
        for (const n of Object.keys(dist)) if (!done.has(n) && (u === null || dist[n] < dist[u])) u = n;
        if (u === null) break;
        done.add(u);
        for (const oi of per[u].ifs) {
          for (const n of oi.nbrs || []) {
            const nd = dist[u] + oi.cost;
            const via = u === src ? [{ ip: n.ip, ifn: oi.ifn }] : hops[u];
            if (dist[n.dev] === undefined || nd < dist[n.dev]) { dist[n.dev] = nd; hops[n.dev] = [...via]; }
            else if (nd === dist[n.dev] && !done.has(n.dev)) {
              for (const h of via) if (!hops[n.dev].some((x) => x.ip === h.ip)) hops[n.dev].push(h);
            }
          }
        }
      }
      const myAreas = new Set(me.ifs.map((x) => x.area));
      const best = {};
      for (const [x, them] of Object.entries(per)) {
        if (x === src || dist[x] === undefined) continue;
        for (const oi of them.ifs) {
          const host = oi.loop && !oi.ptp;
          const len = host ? 32 : maskLen(oi.mask);
          const net = host ? oi.ip : and(oi.ip, oi.mask);
          const metric = dist[x] + oi.cost, key = net + "/" + len;
          const code = myAreas.has(oi.area) ? "O" : "O IA";
          const cur = best[key];
          if (!cur || metric < cur.metric) best[key] = { code, net, len, metric, paths: [...hops[x]] };
          else if (metric === cur.metric) for (const h of hops[x]) if (!cur.paths.some((p) => p.ip === h.ip)) cur.paths.push(h);
        }
        const o = this.devs[x].cfg.ospf;
        if (o.defaultOriginate && (o.defaultAlways || this.hasStaticDefault(x))) {
          const cur = best["0/0"];
          if (!cur || dist[x] < cur.dist) best["0/0"] = { code: "O*E2", net: 0, len: 0, metric: 1, dist: dist[x], paths: [...hops[x]] };
        }
      }
      me.routes = Object.values(best);
    }
    this.c.ospf = per;
    return per;
  }

  hasStaticDefault(dn) {
    const d = this.devs[dn];
    return d.cfg.routes.some((r) => r.net === 0 && r.len === 0 && (r.ifn ? this.ifUp(dn, r.ifn)
      : this.upIfs(dn).some((n) => { const a = this.ifAddr(dn, n); return sameNet(a.ip, r.nh, a.mask); })));
  }

  // -- routing ----------------------------------------------------------------
  routes(dn) {
    if (this.c.routes[dn]) return this.c.routes[dn];
    const d = this.devs[dn], cands = [];
    for (const ifn of this.upIfs(dn)) {
      const { ip, mask } = this.ifAddr(dn, ifn), len = maskLen(mask);
      cands.push({ code: "C", net: and(ip, mask), len, ad: 0, metric: 0, ifn });
      if (len < 32) cands.push({ code: "L", net: ip, len: 32, ad: 0, metric: 0, ifn });
    }
    const ospf = this.ospf()[dn];
    if (ospf) for (const r of ospf.routes) cands.push({ ...r, ad: 110 });
    const select = (list) => {
      const best = {};
      for (const r of list) {
        const k = r.net + "/" + r.len, b = best[k];
        if (!b || r.ad < b[0].ad) best[k] = [r];
        else if (r.ad === b[0].ad && r.code === b[0].code) b.push(r);
      }
      return Object.values(best).map((rs) => rs.length === 1 ? rs[0]
        : { ...rs[0], paths: rs.flatMap((r) => r.paths || []) });
    };
    // Static routes install once their next hop resolves (recursively) or their exit interface is up.
    let table = select(cands);
    const statics = d.type === "router" ? d.cfg.routes : [];
    const pending = new Set(statics.map((_, i) => i));
    for (let pass = 0; pass < 5 && pending.size; pass++) {
      let added = false;
      for (const i of [...pending]) {
        const s = statics[i];
        let ok;
        if (s.ifn) ok = this.ifUp(dn, s.ifn);
        else {
          const r = lpm(table, s.nh);
          ok = !!r && !(r.net === s.net && r.len === s.len);
        }
        if (!ok) continue;
        pending.delete(i);
        cands.push({ code: s.net === 0 && s.len === 0 ? "S*" : "S", net: s.net, len: s.len, ad: s.ad, metric: 0,
          paths: [{ ip: s.nh, ifn: s.ifn }] });
        added = true;
      }
      if (!added) break;
      table = select(cands);
    }
    table.sort((a, b) => a.net - b.net || a.len - b.len);
    this.c.routes[dn] = table;
    return table;
  }

  lookup(dn, ip) { return lpm(this.routes(dn), ip); }

  // Where a router sends a packet for dst: {ifn, nh, proxy} or {fail}.
  routerEgress(dn, dst, depth = 0) {
    const r = this.lookup(dn, dst);
    if (!r) return { fail: "noroute" };
    if (r.code === "C" || r.code === "L") return { ifn: r.ifn, nh: dst };
    const p = r.paths[0];
    if (p.ifn && p.ip === null) return { ifn: p.ifn, nh: dst, proxy: true };
    if (p.ifn) return { ifn: p.ifn, nh: p.ip };
    if (depth > 4) return { fail: "noroute" };
    const e = this.routerEgress(dn, p.ip, depth + 1);
    if (e.fail) return e;
    return e.nh === p.ip || e.proxy ? { ifn: e.ifn, nh: e.proxy ? p.ip : e.nh } : e;
  }

  hostEgress(dn, dst) {
    const d = this.devs[dn];
    if (d.type === "pc") {
      if (d.cfg.ip === null) return { fail: "noip" };
      if (sameNet(dst, d.cfg.ip, d.cfg.mask)) return { ifn: "eth0", nh: dst };
      return d.cfg.gw !== null ? { ifn: "eth0", nh: d.cfg.gw } : { fail: "nogw" };
    }
    const svis = this.upIfs(dn);
    const local = svis.find((n) => { const a = this.ifAddr(dn, n); return sameNet(a.ip, dst, a.mask); });
    if (local) return { ifn: local, nh: dst };
    const gw = d.cfg.gateway;
    const via = gw !== null && svis.find((n) => { const a = this.ifAddr(dn, n); return sameNet(a.ip, gw, a.mask); });
    return via ? { ifn: via, nh: gw } : { fail: "nogw" };
  }

  // -- ACLs ---------------------------------------------------------------------
  aclPermits(dn, name, pkt, record) {
    const acl = this.devs[dn].cfg.acls[name];
    if (!acl) return true; // an ACL that doesn't exist filters nothing
    for (const e of acl.entries) {
      if (e.remark !== undefined || !aclMatch(acl.type, e, pkt)) continue;
      if (record) {
        const h = this.devs[dn].rt.hits;
        h[name + "|" + e.seq] = (h[name + "|" + e.seq] || 0) + 1;
      }
      return e.action === "permit";
    }
    return false;
  }

  // -- forwarding -----------------------------------------------------------------
  // Carry one packet hop by hop. Returns {ok, at, links, hops, fail, failAt, arpMiss}.
  deliver(src, pkt, opts = {}) {
    const res = { ok: false, links: [], hops: [], arpMiss: false };
    let cur = src, originated = true, ttl = pkt.ttl ?? 255;
    for (let n = 0; n < 40; n++) {
      const d = this.devs[cur];
      if (this.ownsIp(cur, pkt.dst)) { res.ok = true; res.at = cur; return res; }
      if (!originated) {
        if (d.type !== "router") return { ...res, fail: "drop", failAt: cur };
        if (--ttl <= 0) return { ...res, fail: "ttl", failAt: cur };
      }
      const eg = d.type === "router" ? this.routerEgress(cur, pkt.dst) : this.hostEgress(cur, pkt.dst);
      if (eg.fail) return { ...res, fail: eg.fail, failAt: cur };
      if (!originated && d.cfg.intfs[eg.ifn].aclOut && !this.aclPermits(cur, d.cfg.intfs[eg.ifn].aclOut, pkt, opts.record)) {
        return { ...res, fail: "acl", failAt: cur };
      }
      const seg = this.flood(cur, eg.ifn);
      const live = (e) => this.ifUp(e.dev, e.ifn) && this.ifAddr(e.dev, e.ifn);
      let tgt = seg.find((e) => live(e) && this.ifAddr(e.dev, e.ifn).ip === eg.nh);
      if (!tgt && eg.proxy) {
        tgt = seg.find((e) => live(e) && this.devs[e.dev].type === "router" && (() => {
          const g = this.routerEgress(e.dev, pkt.dst);
          return !g.fail && g.ifn !== e.ifn;
        })());
      }
      if (!tgt) return { ...res, fail: "arp", failAt: cur };
      if (opts.record) this.learn(cur, eg.ifn, tgt, eg.nh, res);
      res.links.push(...tgt.trail);
      cur = tgt.dev;
      originated = false;
      const td = this.devs[cur];
      if (td.type === "router") {
        res.hops.push({ dev: cur, ip: this.ifAddr(cur, tgt.ifn).ip, ifn: tgt.ifn });
        const acl = td.cfg.intfs[tgt.ifn].aclIn;
        if (acl && !this.aclPermits(cur, acl, pkt, opts.record)) return { ...res, fail: "acl", failAt: cur };
      } else res.hops.push({ dev: cur, ip: this.ifAddr(cur, tgt.ifn).ip, ifn: tgt.ifn });
    }
    return { ...res, fail: "ttl", failAt: cur };
  }

  // MAC learning along the frame's path, and the sender's ARP cache.
  learn(dn, ifn, tgt, nh, res) {
    const smac = this.mac(dn, ifn), dmac = this.mac(tgt.dev, tgt.ifn);
    for (const hop of tgt.trail) {
      if (this.devs[hop.b].type === "switch" && hop.vlan !== null) this.devs[hop.b].rt.mac[hop.vlan + "|" + smac] = hop.bp;
    }
    for (let i = tgt.trail.length - 1; i >= 0; i--) {
      const hop = tgt.trail[i];
      if (this.devs[hop.a].type === "switch") {
        const v = i > 0 ? tgt.trail[i - 1].vlan : +ifn.slice(4);
        this.devs[hop.a].rt.mac[v + "|" + dmac] = hop.ap;
      }
    }
    const d = this.devs[dn], key = n2ip(nh);
    if (d.type === "router" && !d.rt.arp[key]) res.arpMiss = true;
    d.rt.arp[key] = { mac: dmac, ifn };
  }

  sourceIp(dn, dst, source) {
    const d = this.devs[dn];
    if (source !== undefined && source !== null) return source;
    if (d.type === "pc") return d.cfg.ip;
    const eg = d.type === "router" ? this.routerEgress(dn, dst) : this.hostEgress(dn, dst);
    if (eg.fail) return null;
    return this.ifAddr(dn, eg.ifn).ip;
  }

  // One echo request and its reply. {ok, fail, failAt, by, links, back}
  ping(dn, dst, opts = {}) {
    if (typeof dst === "string") dst = ip2n(dst);
    const src = this.sourceIp(dn, dst, opts.source);
    if (this.ownsIp(dn, dst)) return { ok: true, links: [], ttl: 255, hops: [] };
    if (src === null) {
      const eg = this.devs[dn].type === "router" ? this.routerEgress(dn, dst) : this.hostEgress(dn, dst);
      return { ok: false, fail: eg.fail || "noip", failAt: dn, links: [] };
    }
    const there = this.deliver(dn, { src, dst, proto: "icmp", icmp: "echo" }, opts);
    if (!there.ok) return { ...there, by: this.ifFacing(there) };
    const back = this.deliver(there.at, { src: dst, dst: src, proto: "icmp", icmp: "echo-reply" }, opts);
    const routers = back.hops.filter((h) => this.devs[h.dev].type === "router").length;
    const startTtl = this.devs[there.at].type === "pc" ? 64 : 255;
    return { ok: back.ok, fail: back.fail, failAt: back.failAt, links: there.links.concat(back.links),
      back: true, arpMiss: there.arpMiss || back.arpMiss, ttl: startTtl - routers, hops: there.hops };
  }

  // The address an ICMP error would come from: the failing router's ingress interface.
  ifFacing(res) {
    const h = res.hops.filter((x) => x.dev === res.failAt).pop();
    return h ? h.ip : null;
  }

  // Router-by-router path for traceroute: [{ip, ok}] ending at the destination when reached.
  trace(dn, dst, max = 30) {
    if (typeof dst === "string") dst = ip2n(dst);
    const src = this.sourceIp(dn, dst);
    const out = [];
    if (src === null) return out;
    for (let ttl = 1; ttl <= max; ttl++) {
      const r = this.deliver(dn, { src, dst, proto: "udp", ttl });
      if (r.ok) {
        const back = this.deliver(r.at, { src: dst, dst: src, proto: "icmp", icmp: "unreachable" });
        out.push({ ip: back.ok ? dst : null, last: true });
        return out;
      }
      if (r.fail === "ttl") {
        const h = r.hops.filter((x) => x.dev === r.failAt).pop();
        const back = this.deliver(r.failAt, { src: h.ip, dst: src, proto: "icmp", icmp: "time-exceeded" });
        out.push({ ip: back.ok ? h.ip : null });
        continue;
      }
      const by = this.ifFacing(r);
      if ((r.fail === "noroute" || r.fail === "acl") && by !== null && r.failAt !== dn) {
        out.push({ ip: by, code: r.fail === "acl" ? "A" : "H", last: true });
        return out;
      }
      out.push({ ip: null });
      for (let t = ttl + 1; t <= max; t++) out.push({ ip: null });
      return out;
    }
    return out;
  }

  // -- DHCP ---------------------------------------------------------------------
  dhcp(pcName) {
    const pc = this.devs[pcName];
    for (const e of this.flood(pcName, "eth0")) {
      if (this.devs[e.dev].type !== "router" || !this.ifUp(e.dev, e.ifn)) continue;
      const a = this.ifAddr(e.dev, e.ifn);
      if (!a) continue;
      let server = e.dev, serverIp = a.ip;
      let pool = findPool(this.devs[e.dev], a.ip);
      if (!pool) {
        for (const h of this.devs[e.dev].cfg.intfs[e.ifn].helpers) {
          const owner = this.ownerOf(h);
          if (!owner || this.devs[owner].type !== "router") continue;
          const p = findPool(this.devs[owner], a.ip);
          if (p && this.ping(e.dev, h, { source: a.ip }).ok) { pool = p; server = owner; serverIp = h; break; }
        }
      }
      if (!pool) continue;
      const ip = this.allocate(server, pool, pcName);
      if (ip === null) return { fail: "full" };
      Object.assign(pc.cfg, { ip, mask: pool.mask, gw: pool.router.length ? pool.router[0] : null,
        dns: pool.dns.length ? pool.dns[0] : null, dhcp: true, dhcpServer: serverIp });
      this.touch();
      return { ok: true, ip, mask: pool.mask, gw: pc.cfg.gw };
    }
    return { fail: "noserver" };
  }

  allocate(server, pool, client) {
    const d = this.devs[server], mac = this.mac(client, "eth0");
    for (const [ip, b] of Object.entries(d.rt.bindings)) if (b.mac === mac && sameNet(+ip, pool.net, pool.mask)) return +ip;
    const used = new Set();
    for (const dv of Object.values(this.devs)) for (const n of this.l3Ifs(dv.name)) used.add(this.ifAddr(dv.name, n).ip);
    const last = (pool.net | ~pool.mask) >>> 0;
    for (let ip = pool.net + 1; ip < last; ip++) {
      if (used.has(ip) || d.rt.bindings[ip] || d.cfg.dhcp.excluded.some(([lo, hi]) => ip >= lo && ip <= hi)) continue;
      d.rt.bindings[ip] = { mac, client, pool: pool.name };
      return ip;
    }
    return null;
  }

  // -- CDP --------------------------------------------------------------------
  cdpNeighbors(dn) {
    const d = this.devs[dn], out = [];
    if (d.type === "pc" || !d.cfg.cdp) return out;
    for (const port of d.ports) {
      const p = this.peer(dn, port);
      if (!p || !this.portUp(dn, port) || !d.cfg.intfs[port].cdp) continue;
      const pd = this.devs[p.dev];
      if (pd.type === "pc" || !pd.cfg.cdp || !pd.cfg.intfs[p.port].cdp) continue;
      let addr = null;
      if (pd.type === "router") addr = this.ifAddr(p.dev, p.port);
      else { const s = this.upIfs(p.dev)[0]; addr = s ? this.ifAddr(p.dev, s) : null; }
      out.push({ local: port, dev: pd, port: p.port, ip: addr && addr.ip });
    }
    return out;
  }

  // -- SSH / telnet -------------------------------------------------------------
  sshReady(dn) {
    const c = this.devs[dn].cfg;
    return c.rsa >= 768 && c.domain !== "" && !["Router", "Switch"].includes(c.hostname);
  }

  // -- snapshots for console log messages --------------------------------------
  snapshot() {
    const snap = {};
    const ospf = this.ospf();
    for (const d of Object.values(this.devs)) {
      if (d.type === "pc") continue;
      const ifs = {};
      for (const n of Object.keys(d.cfg.intfs)) ifs[n] = this.ifState(d.name, n);
      const nbrs = {};
      for (const n of (ospf[d.name] ? ospf[d.name].nbrs : [])) if (n.state.startsWith("FULL")) nbrs[n.rid + "|" + n.local] = n;
      snap[d.name] = { ifs, nbrs, pid: d.cfg.ospf && d.cfg.ospf.pid };
    }
    return snap;
  }

  // Console messages for what changed between two snapshots, per device.
  events(before, after) {
    const out = {};
    for (const [dn, a] of Object.entries(after)) {
      const b = before[dn] || { ifs: {}, nbrs: {} }, msgs = [];
      for (const [n, s] of Object.entries(a.ifs)) {
        const p = b.ifs[n];
        if (!p) continue;
        if (p.status !== s.status) {
          msgs.push(s.status === "administratively down"
            ? `%LINK-5-CHANGED: Interface ${n}, changed state to administratively down`
            : `%LINK-3-UPDOWN: Interface ${n}, changed state to ${s.status}`);
        }
        if (p.proto !== s.proto) msgs.push(`%LINEPROTO-5-UPDOWN: Line protocol on Interface ${n}, changed state to ${s.proto}`);
      }
      for (const [k, n] of Object.entries(a.nbrs)) {
        if (!b.nbrs[k]) msgs.push(`%OSPF-5-ADJCHG: Process ${a.pid}, Nbr ${n2ip(n.rid)} on ${n.local} from LOADING to FULL, Loading Done`);
      }
      for (const [k, n] of Object.entries(b.nbrs)) {
        if (!a.nbrs[k]) msgs.push(`%OSPF-5-ADJCHG: Process ${b.pid}, Nbr ${n2ip(n.rid)} on ${n.local} from FULL to DOWN, Neighbor Down: Interface down or detached`);
      }
      if (msgs.length) out[dn] = msgs;
    }
    return out;
  }

  // The cables as the topology diagram draws them: up/down, and trunk or access on switch ends.
  linkInfo() {
    return this.spec.links.map(([a, ap, b, bp]) => {
      const kind = (dn, p) => (this.devs[dn].type === "switch" ? this.swMode(this.devs[dn], p) : null);
      return { a, ap, b, bp, up: this.portUp(a, ap), trunk: kind(a, ap) === "trunk" || kind(b, bp) === "trunk",
        aDown: !this.adminUp(a, ap), bDown: !this.adminUp(b, bp) };
    });
  }

  // -- lab checks ----------------------------------------------------------------
  check(c) {
    const d = this.devs[c.device || c.from];
    if (!d) throw new Error("check names unknown device " + (c.device || c.from));
    const intf = c.intf ? canonIf(d, c.intf) : null;
    switch (c.type) {
      case "ping": return this.ping(c.from, c.to).ok;
      case "noping": return !this.ping(c.from, c.to).ok;
      case "hostname": return d.cfg.hostname === c.value;
      case "config": return new RegExp(c.match, "m").test(runningConfig(this, d.name));
      case "noconfig": return !new RegExp(c.match, "m").test(runningConfig(this, d.name));
      case "saved": return d.startup !== null && sameData(d.startup, d.cfg);
      case "secret": return d.cfg.enableSecret === c.value;
      case "ifup": return this.ifUp(d.name, intf);
      case "ifip": {
        const a = d.cfg.intfs[intf];
        return !!a && a.ip === ip2n(c.ip.split("/")[0]) && a.mask === lenMask(+c.ip.split("/")[1]);
      }
      case "vlan": return d.cfg.vlans[c.vlan] !== undefined && (!c.name || d.cfg.vlans[c.vlan] === c.name);
      case "access": return this.swMode(d, intf) === "access" && d.cfg.intfs[intf].accessVlan === c.vlan;
      case "trunk": {
        const p = d.cfg.intfs[intf];
        if (this.swMode(d, intf) !== "trunk" || !this.portUp(d.name, intf)) return false;
        if (c.native !== undefined && p.native !== c.native) return false;
        return !c.allowed || (p.allowed !== null && p.allowed.join(",") === [...c.allowed].sort((x, y) => x - y).join(","));
      }
      case "route": {
        const [net, len] = c.prefix.split("/");
        const r = this.routes(d.name).find((x) => x.net === ip2n(net) && x.len === +len);
        if (!r || (c.code && r.code !== c.code)) return false;
        return !c.via || (!!r.paths && r.paths.some((p) => p.ip === ip2n(c.via)));
      }
      case "noroute": {
        const [net, len] = c.prefix.split("/");
        return !this.routes(d.name).some((x) => x.net === ip2n(net) && x.len === +len && (!c.code || x.code === c.code));
      }
      case "ospf-nbrs": {
        const o = this.ospf()[d.name];
        return !!o && o.nbrs.filter((n) => n.state.startsWith("FULL")).length >= c.count;
      }
      case "rid": return this.routerId(d.name) === ip2n(c.value);
      case "ospf-nbr": {
        const o = this.ospf()[d.name];
        return !!o && o.nbrs.some((n) => n.rid === ip2n(c.neighbor) && n.state.startsWith("FULL"));
      }
      case "passive": {
        const o = this.ospf()[d.name];
        return !!o && o.ifs.some((i) => i.ifn === intf && i.passive);
      }
      case "shut": return !!d.cfg.intfs[intf] && d.cfg.intfs[intf].shut;
      case "swmode": return d.cfg.intfs[intf].mode === c.mode;
      case "acl-applied": {
        const name = d.cfg.intfs[intf] && d.cfg.intfs[intf][c.dir === "in" ? "aclIn" : "aclOut"];
        const acl = name && d.cfg.acls[name];
        return !!acl && (!c.acltype || acl.type === c.acltype) && acl.entries.some((e) => e.remark === undefined);
      }
      case "ip-range": return d.cfg.ip !== null && d.cfg.ip >= ip2n(c.from) && d.cfg.ip <= ip2n(c.to);
      case "rsa": return d.cfg.rsa >= c.bits;
      case "login-seen": return d.rt.logins.some((l) => l.proto === c.proto && (!c.user || l.user === c.user));
      case "dhcp": return d.cfg.dhcp && d.cfg.ip !== null;
      case "ssh": return this.sshReady(d.name) && d.cfg.lines.vty0.login === "local" && d.cfg.lines.vty0.transport === "ssh"
        && Object.keys(d.cfg.users).length > 0;
      case "line": {
        const l = d.cfg.lines[c.line];
        return !!l && (c.login === undefined || l.login === c.login) && (!c.password || l.password === c.password);
      }
      default: throw new Error("unknown check type " + c.type);
    }
  }
}

function lpm(table, ip) {
  let best = null;
  for (const r of table) {
    if (sameNet(ip, r.net, lenMask(r.len)) && (!best || r.len > best.len)) best = r;
  }
  return best;
}

function findPool(d, giaddr) {
  return Object.values(d.cfg.dhcp.pools).find((p) => p.net !== null && sameNet(p.net, giaddr, p.mask)) || null;
}

function aclMatch(type, e, pkt) {
  if (!wildMatch(pkt.src, e.src.addr, e.src.wild)) return false;
  if (type === "standard") return true;
  if (!wildMatch(pkt.dst, e.dst.addr, e.dst.wild)) return false;
  if (e.proto === "ip") return true;
  if (e.proto !== pkt.proto) return false;
  if (e.proto === "icmp") return !e.icmp || e.icmp === pkt.icmp;
  return !e.srcPort && !e.dstPort ? true : !!pkt.port && portMatch(e.dstPort, pkt.port);
}

function portMatch(op, port) {
  if (!op) return true;
  switch (op.op) {
    case "eq": return port === op.a;
    case "neq": return port !== op.a;
    case "lt": return port < op.a;
    case "gt": return port > op.a;
    default: return port >= op.a && port <= op.b;
  }
}

// Resolve a check's or link's interface name ("g0/1", "Gi0/1") to the device's full name.
export function canonIf(d, name) {
  if (d.type === "pc") return "eth0";
  const toks = name.split(/(?<=[A-Za-z])(?=\d)/).map((t) => ({ t }));
  const r = parseIfName(d.type, [{ t: name }], 0) || parseIfName(d.type, toks, 0);
  if (!r || !r.name) throw new Error("bad interface name " + name);
  return r.name;
}

// ---------------------------------------------------------------- formatting helpers
export function vlanStr(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    let j = i;
    while (j + 1 < list.length && list[j + 1] === list[j] + 1) j++;
    out.push(j > i + 1 ? list[i] + "-" + list[j] : j === i + 1 ? list[i] + "," + list[j] : String(list[i]));
    i = j;
  }
  return out.join(",");
}

export function parseVlans(s) {
  const out = new Set();
  for (const part of String(s).split(",")) {
    const m = /^(\d{1,4})(?:-(\d{1,4}))?$/.exec(part.trim());
    if (!m) return null;
    const a = +m[1], b = m[2] ? +m[2] : a;
    if (a < 1 || b > 4094 || b < a) return null;
    for (let v = a; v <= b; v++) out.add(v);
  }
  return [...out].sort((x, y) => x - y);
}

function aclAddr(s, ext) {
  if (s.addr === 0 && s.wild === 0xffffffff) return "any";
  if (s.wild === 0) return ext ? "host " + n2ip(s.addr) : n2ip(s.addr);
  return n2ip(s.addr) + " " + n2ip(s.wild);
}
const portStr = (p) => !p ? "" : p.op === "range" ? `range ${p.a} ${p.b}` : `${p.op} ${p.a}`;
function aceStr(type, e) {
  if (type === "standard") return aclAddr(e.src, false) + (e.log ? " log" : "");
  return [e.proto, aclAddr(e.src, true), portStr(e.srcPort), aclAddr(e.dst, true), portStr(e.dstPort), e.icmp, e.log && "log"]
    .filter(Boolean).join(" ");
}
const actionStr = (type, a) => (type === "standard" && a === "deny" ? "deny  " : a);

const PORT_NAMES = { ftp: 21, ssh: 22, telnet: 23, smtp: 25, domain: 53, bootps: 67, bootpc: 68, tftp: 69, www: 80,
  pop3: 110, ntp: 123, snmp: 161, https: 443 };
const ICMP_TYPES = ["echo", "echo-reply", "unreachable", "time-exceeded"];

// Parse what follows permit/deny in an ACL. Returns {entry} or {at: index of the bad word}.
export function parseAce(type, words) {
  let i = 0;
  const e = {};
  const lw = (k) => (words[k] || "").toLowerCase();
  const addr = () => {
    const w = lw(i);
    if (w === "any") { i++; return { addr: 0, wild: 0xffffffff }; }
    if (w === "host") {
      if (!isIp(words[i + 1] || "")) { i++; return null; }
      i += 2;
      return { addr: ip2n(words[i - 1]), wild: 0 };
    }
    if (!isIp(w)) return null;
    i++;
    if (isIp(words[i] || "")) { const wild = ip2n(words[i++]); return { addr: and(ip2n(w), ~wild), wild }; }
    return type === "standard" ? { addr: ip2n(w), wild: 0 } : (i--, null);
  };
  const port = () => {
    const op = lw(i);
    if (!["eq", "neq", "lt", "gt", "range"].includes(op)) return null;
    const num = (w) => (/^\d{1,5}$/.test(w) && +w <= 65535 ? +w : PORT_NAMES[w]);
    const a = num(lw(i + 1));
    if (a === undefined) { i++; return false; }
    if (op === "range") {
      const b = num(lw(i + 2));
      if (b === undefined) { i += 2; return false; }
      i += 3;
      return { op, a, b };
    }
    i += 2;
    return { op, a };
  };
  if (type === "extended") {
    const m = ["ip", "icmp", "tcp", "udp"].filter((x) => x === lw(i) || (lw(i) && x.startsWith(lw(i)) && lw(i).length > 1));
    if (m.length !== 1) return { at: i };
    e.proto = m[0];
    i++;
  }
  e.src = addr();
  if (!e.src) return { at: i };
  if (type === "extended") {
    const tcpudp = e.proto === "tcp" || e.proto === "udp";
    if (tcpudp) { const p = port(); if (p === false) return { at: i }; if (p) e.srcPort = p; }
    e.dst = addr();
    if (!e.dst) return { at: i };
    if (tcpudp) { const p = port(); if (p === false) return { at: i }; if (p) e.dstPort = p; }
    if (e.proto === "icmp" && ICMP_TYPES.includes(lw(i))) e.icmp = lw(i++);
  }
  if (lw(i) === "log") { e.log = true; i++; }
  return i < words.length ? { at: i } : { entry: e };
}

function majorNet(n) {
  const first = n >>> 24;
  const len = first < 128 ? 8 : first < 192 ? 16 : 24;
  return { net: and(n, lenMask(len)), len };
}

// ---------------------------------------------------------------- running-config
export function runningConfig(net, dn, onlyIf) {
  const d = net.devs[dn], c = d.cfg;
  if (d.type === "pc") {
    return [`set pcname ${c.hostname}`, c.ip === null ? "" : c.dhcp ? "ip dhcp"
      : `ip ${n2ip(c.ip)} ${c.gw === null ? "" : n2ip(c.gw) + " "}${maskLen(c.mask)}`].filter(Boolean).join("\n");
  }
  const pw = (p) => (c.pwEnc ? "7 " + type7(p) : p);
  const intfBlock = (n) => {
    const i = c.intfs[n], L = ["interface " + n];
    if (i.desc) L.push(" description " + i.desc);
    if (i.bw) L.push(" bandwidth " + i.bw);
    if (i.encap) L.push(" encapsulation dot1Q " + i.encap.vlan + (i.encap.native ? " native" : ""));
    if (d.type === "router" || n.startsWith("Vlan")) {
      L.push(i.ip === null ? " no ip address" : ` ip address ${n2ip(i.ip)} ${n2ip(i.mask)}`);
    }
    if (d.type === "router") {
      for (const h of i.helpers) L.push(" ip helper-address " + n2ip(h));
      if (i.aclIn) L.push(` ip access-group ${i.aclIn} in`);
      if (i.aclOut) L.push(` ip access-group ${i.aclOut} out`);
      const o = i.ospf;
      if (o.ptp) L.push(" ip ospf network point-to-point");
      if (o.hello !== undefined) L.push(" ip ospf hello-interval " + o.hello);
      if (o.dead !== undefined) L.push(" ip ospf dead-interval " + o.dead);
      if (o.prio !== undefined) L.push(" ip ospf priority " + o.prio);
      if (o.cost !== undefined) L.push(" ip ospf cost " + o.cost);
      if (o.pid !== undefined) L.push(` ip ospf ${o.pid} area ${o.area}`);
    } else if (!n.startsWith("Vlan")) {
      if (i.accessVlan !== 1) L.push(" switchport access vlan " + i.accessVlan);
      if (i.native !== 1) L.push(" switchport trunk native vlan " + i.native);
      if (i.allowed !== null) L.push(" switchport trunk allowed vlan " + (i.allowed.length ? vlanStr(i.allowed) : "none"));
      if (i.mode !== "dynamic auto") L.push(" switchport mode " + i.mode);
      if (i.noneg) L.push(" switchport nonegotiate");
    }
    if (!i.cdp) L.push(" no cdp enable");
    if (i.shut) L.push(" shutdown");
    return L;
  };
  const wrap = (L) => {
    const body = L.join("\n") + "\n";
    return `Building configuration...\n\nCurrent configuration : ${body.length} bytes\n` + body;
  };
  if (onlyIf) return wrap(["!", ...intfBlock(onlyIf), "end"]);
  const L = ["!", "version 15.9", c.pwEnc ? "service password-encryption" : "no service password-encryption", "!",
    "hostname " + c.hostname, "!"];
  if (c.enableSecret !== null) L.push("enable secret 5 " + md5ish(c.enableSecret));
  if (c.enablePassword !== null) L.push("enable password " + pw(c.enablePassword));
  L.push("!", "no aaa new-model");
  if (!c.domainLookup) L.push("no ip domain lookup");
  if (c.domain) L.push("ip domain name " + c.domain);
  if (d.type === "router") {
    for (const [lo, hi] of c.dhcp.excluded) L.push("ip dhcp excluded-address " + n2ip(lo) + (hi !== lo ? " " + n2ip(hi) : ""));
    for (const p of Object.values(c.dhcp.pools)) {
      L.push("!", "ip dhcp pool " + p.name);
      if (p.net !== null) L.push(` network ${n2ip(p.net)} ${n2ip(p.mask)}`);
      if (p.router.length) L.push(" default-router " + p.router.map(n2ip).join(" "));
      if (p.dns.length) L.push(" dns-server " + p.dns.map(n2ip).join(" "));
      if (p.domain) L.push(" domain-name " + p.domain);
    }
  }
  L.push("!");
  for (const [u, x] of Object.entries(c.users)) {
    L.push(`username ${u}${x.priv !== undefined ? " privilege " + x.priv : ""} ${x.secret ? "secret 5 " + md5ish(x.secret) : "password " + pw(x.password)}`);
  }
  if (c.sshVer) L.push("ip ssh version " + c.sshVer);
  L.push("!");
  for (const n of Object.keys(c.intfs).sort(ifSort)) L.push(...intfBlock(n), "!");
  if (d.type === "router" && c.ospf) {
    const o = c.ospf;
    L.push("router ospf " + o.pid);
    if (o.rid !== null) L.push(" router-id " + n2ip(o.rid));
    if (o.refBw !== 100) L.push(" auto-cost reference-bandwidth " + o.refBw);
    if (o.passiveDefault) {
      L.push(" passive-interface default");
      for (const n of o.noPassive) L.push(" no passive-interface " + n);
    } else for (const n of o.passive) L.push(" passive-interface " + n);
    for (const n of o.networks) L.push(` network ${n2ip(n.addr)} ${n2ip(n.wild)} area ${n.area}`);
    if (o.defaultOriginate) L.push(" default-information originate" + (o.defaultAlways ? " always" : ""));
    L.push("!");
  }
  if (d.type === "switch" && c.gateway !== null) L.push("ip default-gateway " + n2ip(c.gateway));
  if (d.type === "router") {
    for (const r of c.routes) {
      L.push(["ip route", n2ip(r.net), n2ip(lenMask(r.len)), r.ifn, r.nh !== null ? n2ip(r.nh) : null, r.ad !== 1 ? r.ad : null]
        .filter((x) => x !== null && x !== undefined).join(" "));
    }
    const names = Object.keys(c.acls);
    const numbered = names.filter((n) => /^\d+$/.test(n)).sort((a, b) => a - b);
    const named = names.filter((n) => !/^\d+$/.test(n)).sort();
    if (numbered.length || named.length) L.push("!");
    for (const n of named) {
      const a = c.acls[n];
      L.push(`ip access-list ${a.type} ${n}`);
      for (const e of a.entries) L.push(e.remark !== undefined ? " remark " + e.remark : ` ${e.action} ${aceStr(a.type, e)}`);
    }
    for (const n of numbered) {
      const a = c.acls[n];
      for (const e of a.entries) {
        L.push(e.remark !== undefined ? `access-list ${n} remark ${e.remark}` : `access-list ${n} ${actionStr(a.type, e.action)} ${aceStr(a.type, e)}`);
      }
    }
  }
  L.push("!");
  if (!c.cdp) L.push("no cdp run", "!");
  if (c.banner) L.push("banner motd ^C" + c.banner + "^C");
  const line = (title, l, vty) => {
    L.push(title);
    if (l.timeout) L.push(` exec-timeout ${l.timeout[0]} ${l.timeout[1]}`);
    if (l.password !== null) L.push(" password " + pw(l.password));
    if (l.sync) L.push(" logging synchronous");
    if (l.login === "local") L.push(" login local");
    else if (l.login === "line") L.push(" login");
    else if (vty) L.push(" no login");
    if (vty && l.transport !== "all") L.push(" transport input " + l.transport);
  };
  line("line con 0", c.lines.con, false);
  line("line vty 0 4", c.lines.vty0, true);
  if (c.lines.vty5) line("line vty 5 15", c.lines.vty5, true);
  L.push("!", "end");
  return wrap(L);
}

// ---------------------------------------------------------------- show commands
const ROUTE_CODES = `Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       + - replicated route, % - next hop override`;

function showIpRoute(net, dn, filter) {
  const all = net.routes(dn);
  const L = [ROUTE_CODES, ""];
  const def = all.find((r) => r.net === 0 && r.len === 0);
  if (def) {
    const p = def.paths ? def.paths[0] : null;
    L.push(`Gateway of last resort is ${p && p.ip !== null && p.ip !== undefined ? n2ip(p.ip) : "0.0.0.0"} to network 0.0.0.0`);
  } else L.push("Gateway of last resort is not set");
  L.push("");
  const shown = all.filter((r) => !filter || r.code[0] === filter);
  const groups = new Map();
  for (const r of shown) {
    const m = majorNet(r.net);
    const key = r.len < m.len ? "top|" + r.net + "/" + r.len : m.net + "/" + m.len;
    if (!groups.has(key)) groups.set(key, { major: m, routes: [] });
    groups.get(key).routes.push(r);
  }
  const text = (r, showLen) => {
    const pfx = n2ip(r.net) + (showLen ? "/" + r.len : "");
    if (r.code === "C" || r.code === "L") return [`${pfx} is directly connected, ${r.ifn}`];
    if (r.code[0] === "S") {
      const p = r.paths[0];
      if (p.ip === null) return [`${pfx} is directly connected, ${p.ifn}`];
      return r.paths.map((x, i) => (i ? "".padEnd(pfx.length + 1) : pfx + " ") + `[${r.ad}/0] via ${n2ip(x.ip)}${x.ifn ? ", " + x.ifn : ""}`);
    }
    return r.paths.map((x, i) => (i ? "".padEnd(pfx.length + 1) : pfx + " ") + `[110/${r.metric}] via ${n2ip(x.ip)}, 00:00:12, ${x.ifn}`);
  };
  for (const [key, g] of groups) {
    if (key.startsWith("top|")) {
      for (const r of g.routes) text(r, true).forEach((t, i) => L.push((i ? "" : r.code).padEnd(6) + t));
      continue;
    }
    const lens = new Set(g.routes.map((r) => r.len));
    const exact = g.routes.length === 1 && g.routes[0].len === g.major.len;
    if (exact) {
      text(g.routes[0], true).forEach((t, i) => L.push((i ? "" : g.routes[0].code).padEnd(6) + t));
      continue;
    }
    const n = g.routes.length;
    if (lens.size === 1) L.push(`      ${n2ip(g.major.net)}/${[...lens][0]} is subnetted, ${n} subnets`);
    else L.push(`      ${n2ip(g.major.net)}/${g.major.len} is variably subnetted, ${n} subnets, ${lens.size} masks`);
    for (const r of g.routes) text(r, lens.size > 1).forEach((t, i) => L.push((i ? "" : r.code).padEnd(9) + t));
  }
  return L.join("\n");
}

function showIpIntBrief(net, dn) {
  const d = net.devs[dn];
  const L = [pad("Interface", 27) + pad("IP-Address", 16) + "OK? Method Status                Protocol"];
  for (const n of Object.keys(d.cfg.intfs).sort(ifSort)) {
    const i = d.cfg.intfs[n], s = net.ifState(dn, n);
    L.push(pad(n, 27) + pad(i.ip === null ? "unassigned" : n2ip(i.ip), 16) + "YES " + pad(i.ip === null ? "unset" : "manual", 7)
      + pad(s.status, 22) + s.proto);
  }
  return L.join("\n");
}

function showInterfaces(net, dn, only) {
  const d = net.devs[dn], L = [];
  for (const n of Object.keys(d.cfg.intfs).sort(ifSort)) {
    if (only && n !== only) continue;
    const i = d.cfg.intfs[n], s = net.ifState(dn, n);
    const hw = n.startsWith("Loopback") ? "Loopback" : n.startsWith("Vlan") ? "EtherSVI" : d.type === "router" ? "iGbE" : "Fast Ethernet";
    L.push(`${n} is ${s.status}, line protocol is ${s.proto}`);
    L.push(`  Hardware is ${hw}${n.startsWith("Loopback") ? "" : `, address is ${net.mac(dn, n)} (bia ${net.mac(dn, n)})`}`);
    if (i.desc) L.push("  Description: " + i.desc);
    if (i.ip !== null) L.push(`  Internet address is ${n2ip(i.ip)}/${maskLen(i.mask)}`);
    L.push(`  MTU ${n.startsWith("Loopback") ? 1514 : 1500} bytes, BW ${net.bandwidth(d, n)} Kbit/sec, DLY 10 usec,`);
    L.push("     reliability 255/255, txload 1/255, rxload 1/255");
    if (i.encap) L.push(`  Encapsulation 802.1Q Virtual LAN, Vlan ID  ${i.encap.vlan}.`);
    else L.push(`  Encapsulation ${n.startsWith("Loopback") ? "LOOPBACK" : "ARPA"}, loopback not set`);
    if (!isSub(n) && !n.startsWith("Loopback") && !n.startsWith("Vlan")) {
      const speed = ifType(n) === "FastEthernet" ? "100Mb/s" : "1000Mb/s";
      L.push(s.proto === "up" ? `  Full-duplex, ${speed}, media type is RJ45` : "  Auto-duplex, Auto-speed, media type is RJ45");
    }
  }
  return L.join("\n");
}

function vlanPorts(net, d, v) {
  return d.ports.filter((p) => net.swMode(d, p) === "access" && d.cfg.intfs[p].accessVlan === v).map(shortIf);
}

function showVlanBrief(net, dn) {
  const d = net.devs[dn];
  const L = ["", "VLAN Name                             Status    Ports",
    "---- -------------------------------- --------- -------------------------------"];
  const ids = Object.keys(d.cfg.vlans).map(Number).sort((a, b) => a - b);
  for (const v of ids) {
    const ports = vlanPorts(net, d, v);
    const rows = [];
    for (let i = 0; i < ports.length; i += 4) rows.push(ports.slice(i, i + 4).join(", "));
    L.push(pad(v, 5) + pad(d.cfg.vlans[v], 33) + pad("active", 10) + (rows[0] || ""));
    for (const r of rows.slice(1)) L.push("".padEnd(48) + r);
  }
  for (const [v, name] of [[1002, "fddi-default"], [1003, "token-ring-default"], [1004, "fddinet-default"], [1005, "trnet-default"]]) {
    L.push(pad(v, 5) + pad(name, 33) + "act/unsup");
  }
  return L.join("\n");
}

function showTrunks(net, dn) {
  const d = net.devs[dn];
  const trunks = d.ports.filter((p) => net.portUp(dn, p) && net.swMode(d, p) === "trunk");
  if (!trunks.length) return "";
  const modeOf = (p) => ({ trunk: "on", "dynamic desirable": "desirable", "dynamic auto": "auto" })[d.cfg.intfs[p].mode];
  const allowed = (p) => d.cfg.intfs[p].allowed === null ? [...Array(4094)].map((_, i) => i + 1) : d.cfg.intfs[p].allowed;
  const active = (p) => allowed(p).filter((v) => d.cfg.vlans[v]);
  const L = ["", "Port        Mode             Encapsulation  Status        Native vlan"];
  for (const p of trunks) L.push(pad(shortIf(p), 12) + pad(modeOf(p), 17) + pad("802.1q", 15) + pad("trunking", 14) + d.cfg.intfs[p].native);
  L.push("", "Port        Vlans allowed on trunk");
  for (const p of trunks) L.push(pad(shortIf(p), 12) + (vlanStr(allowed(p)) || "none"));
  L.push("", "Port        Vlans allowed and active in management domain");
  for (const p of trunks) L.push(pad(shortIf(p), 12) + (vlanStr(active(p)) || "none"));
  L.push("", "Port        Vlans in spanning tree forwarding state and not pruned");
  for (const p of trunks) L.push(pad(shortIf(p), 12) + (vlanStr(active(p)) || "none"));
  return L.join("\n");
}

function showIntStatus(net, dn) {
  const d = net.devs[dn];
  const L = ["", "Port      Name               Status       Vlan       Duplex  Speed Type"];
  for (const p of d.ports) {
    const i = d.cfg.intfs[p], up = net.portUp(dn, p);
    const status = i.shut ? "disabled" : up ? "connected" : "notconnect";
    const vlan = net.swMode(d, p) === "trunk" ? "trunk" : i.accessVlan;
    const fast = ifType(p) === "FastEthernet";
    L.push(pad(shortIf(p), 10) + pad(i.desc.slice(0, 18), 19) + pad(status, 13) + pad(vlan, 11)
      + lpad(up ? "a-full" : "auto", 6) + lpad(up ? (fast ? "a-100" : "a-1000") : "auto", 7) + " " + (fast ? "10/100BaseTX" : "10/100/1000BaseTX"));
  }
  return L.join("\n");
}

function showSwitchport(net, dn, p) {
  const d = net.devs[dn], i = d.cfg.intfs[p], op = net.swMode(d, p);
  const adm = { access: "static access", trunk: "trunk", "dynamic auto": "dynamic auto", "dynamic desirable": "dynamic desirable" }[i.mode];
  const vname = (v) => `${v} (${d.cfg.vlans[v] || "Inactive"})`;
  return [`Name: ${shortIf(p)}`, "Switchport: Enabled", `Administrative Mode: ${adm}`,
    `Operational Mode: ${net.portUp(dn, p) ? (op === "trunk" ? "trunk" : "static access") : "down"}`,
    "Administrative Trunking Encapsulation: dot1q", `Negotiation of Trunking: ${i.noneg || i.mode === "access" ? "Off" : "On"}`,
    `Access Mode VLAN: ${vname(i.accessVlan)}`, `Trunking Native Mode VLAN: ${vname(i.native)}`,
    `Trunking VLANs Enabled: ${i.allowed === null ? "ALL" : vlanStr(i.allowed) || "NONE"}`].join("\n");
}

function showMacTable(net, dn) {
  const d = net.devs[dn];
  const rows = Object.entries(d.rt.mac).map(([k, port]) => { const [v, mac] = k.split("|"); return { v: +v, mac, port }; })
    .filter((r) => net.portUp(dn, r.port)).sort((a, b) => a.v - b.v || a.mac.localeCompare(b.mac));
  const L = ["          Mac Address Table", "-------------------------------------------", "",
    "Vlan    Mac Address       Type        Ports", "----    -----------       --------    -----"];
  for (const r of rows) L.push(lpad(r.v, 4) + "    " + pad(r.mac, 18) + pad("DYNAMIC", 12) + shortIf(r.port));
  L.push(`Total Mac Addresses for this criterion: ${rows.length}`);
  return L.join("\n");
}

function showCdp(net, dn, detail) {
  const d = net.devs[dn];
  if (!d.cfg.cdp) return "% CDP is not enabled";
  const nb = net.cdpNeighbors(dn);
  const id = (x) => x.dev.cfg.hostname + (x.dev.cfg.domain ? "." + x.dev.cfg.domain : "");
  const platform = (x) => (x.dev.type === "router" ? "IOSv" : "WS-C2960-");
  const cap = (x) => (x.dev.type === "router" ? "R B" : "S I");
  if (detail) {
    return nb.map((x) => ["-------------------------", `Device ID: ${id(x)}`, "Entry address(es): ",
      ...(x.ip !== null ? [`  IP address: ${n2ip(x.ip)}`] : []),
      `Platform: Cisco ${x.dev.type === "router" ? "IOSv" : "WS-C2960-24TT-L"},  Capabilities: ${x.dev.type === "router" ? "Router Source-Route-Bridge" : "Switch IGMP"}`,
      `Interface: ${x.local},  Port ID (outgoing port): ${x.port}`, "Holdtime : 163 sec", "",
      "Version :", "Cisco IOS Software (NetLab simulator)", ""].join("\n")).join("\n") + `\n\nTotal cdp entries displayed : ${nb.length}`;
  }
  const L = ["Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge",
    "                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,", "                  D - Remote, C - CVTA, M - Two-port Mac Relay", "",
    "Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID"];
  const sp = (n) => shortIf(n).replace(/^([A-Za-z]+)/, (t) => ({ Gi: "Gig", Fa: "Fas" })[t] + " ");
  for (const x of nb) L.push(pad(id(x).slice(0, 16), 17) + pad(sp(x.local), 18) + pad("163", 11) + pad(lpad(cap(x), 10), 12) + pad(platform(x), 10) + sp(x.port));
  L.push("", `Total cdp entries displayed : ${nb.length}`);
  return L.join("\n");
}

function showAcls(net, dn, only) {
  const d = net.devs[dn], L = [];
  const names = Object.keys(d.cfg.acls).sort((a, b) => (/^\d+$/.test(a) && /^\d+$/.test(b) ? a - b : a.localeCompare(b)));
  for (const n of names) {
    if (only && n !== only) continue;
    const a = d.cfg.acls[n];
    L.push(`${a.type === "standard" ? "Standard" : "Extended"} IP access list ${n}`);
    for (const e of a.entries) {
      if (e.remark !== undefined) continue;
      const hits = d.rt.hits[n + "|" + e.seq];
      L.push(`    ${e.seq} ${actionStr(a.type, e.action)} ${aceStr(a.type, e)}${hits ? ` (${hits} match${hits > 1 ? "es" : ""})` : ""}`);
    }
  }
  return L.join("\n");
}

function showOspfNbr(net, dn) {
  const o = net.ospf()[dn];
  const L = ["", "Neighbor ID     Pri   State           Dead Time   Address         Interface"];
  for (const n of o ? o.nbrs : []) {
    L.push(pad(n2ip(n.rid), 16) + lpad(n.prio, 3) + "   " + pad(n.state, 16) + pad("00:00:" + String(n.dead - 5).padStart(2, "0"), 12) + pad(n2ip(n.ip), 16) + n.local);
  }
  return L.join("\n");
}

function showOspfIntBrief(net, dn) {
  const o = net.ospf()[dn];
  const L = ["Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C"];
  for (const i of o ? o.ifs : []) {
    const full = (i.nbrs || []).filter((n) => o.nbrs.some((x) => x.rid === n.rid && x.local === i.ifn && x.state.startsWith("FULL"))).length;
    L.push(pad(shortIf(i.ifn), 13) + pad(o.pid, 6) + pad(i.area, 16) + pad(`${n2ip(i.ip)}/${maskLen(i.mask)}`, 19) + pad(i.cost, 6)
      + pad(i.role, 6) + `${full}/${(i.nbrs || []).length}`);
  }
  return L.join("\n");
}

function showOspfInt(net, dn, only) {
  const o = net.ospf()[dn], L = [];
  for (const i of o ? o.ifs : []) {
    if (only && i.ifn !== only) continue;
    L.push(`${i.ifn} is up, line protocol is up`, `  Internet Address ${n2ip(i.ip)}/${maskLen(i.mask)}, Area ${i.area}`,
      `  Process ID ${o.pid}, Router ID ${n2ip(o.rid)}, Network Type ${i.loop ? "LOOPBACK" : i.ptp ? "POINT_TO_POINT" : "BROADCAST"}, Cost: ${i.cost}`);
    if (i.loop) { L.push("  Loopback interface is treated as a stub Host"); continue; }
    L.push(`  Transmit Delay is 1 sec, State ${i.role === "P2P" ? "POINT_TO_POINT" : i.role}${i.ptp ? "" : `, Priority ${i.prio}`}`);
    if (!i.ptp && i.dr) L.push(`  Designated Router (ID) ${n2ip(i.dr.rid)}, Interface address ${n2ip(i.dr.ip)}`);
    if (!i.ptp && i.bdr) L.push(`  Backup Designated router (ID) ${n2ip(i.bdr.rid)}, Interface address ${n2ip(i.bdr.ip)}`);
    L.push(`  Timer intervals configured, Hello ${i.hello}, Dead ${i.dead}, Wait ${i.dead}, Retransmit 5`);
    if (i.passive) L.push("    No Hellos (Passive interface)");
    else L.push("    Hello due in 00:00:0" + Math.min(9, i.hello - 1));
    const nb = o.nbrs.filter((n) => n.local === i.ifn);
    L.push(`  Neighbor Count is ${nb.length}, Adjacent neighbor count is ${nb.filter((n) => n.state.startsWith("FULL")).length}`);
    for (const n of nb) if (n.state.startsWith("FULL")) L.push(`    Adjacent with neighbor ${n2ip(n.rid)}`);
  }
  if (only && !L.length) return `%OSPF: OSPF not enabled on ${only}`;
  return L.join("\n");
}

function showIpProtocols(net, dn) {
  const d = net.devs[dn], o = d.cfg.ospf;
  const L = ['*** IP Routing is NSF aware ***', ""];
  if (!o) return L.join("\n");
  const rid = net.routerId(dn);
  L.push(`Routing Protocol is "ospf ${o.pid}"`, "  Outgoing update filter list for all interfaces is not set",
    "  Incoming update filter list for all interfaces is not set", `  Router ID ${rid === null ? "0.0.0.0" : n2ip(rid)}`,
    "  Maximum path: 4", "  Routing for Networks:");
  for (const n of o.networks) L.push(`    ${n2ip(n.addr)} ${n2ip(n.wild)} area ${n.area}`);
  const per = net.ospf()[dn];
  const passive = per ? per.ifs.filter((i) => i.passive).map((i) => i.ifn) : [];
  if (passive.length) { L.push("  Passive Interface(s):"); for (const p of passive) L.push("    " + p); }
  L.push("  Routing Information Sources:", "    Gateway         Distance      Last Update");
  for (const n of per ? per.nbrs : []) L.push("    " + pad(n2ip(n.rid), 16) + pad("110", 14) + "00:00:12");
  L.push("  Distance: (default is 110)");
  return L.join("\n");
}

function showArp(net, dn) {
  const d = net.devs[dn];
  const L = ["Protocol  Address          Age (min)  Hardware Addr   Type   Interface"];
  const rows = [];
  for (const n of net.upIfs(dn)) {
    if (n.startsWith("Loopback")) continue;
    rows.push([net.ifAddr(dn, n).ip, "-", net.mac(dn, n), n]);
  }
  for (const [ip, e] of Object.entries(d.rt.arp)) if (net.ifUp(dn, e.ifn)) rows.push([ip2n(ip), "0", e.mac, e.ifn]);
  rows.sort((a, b) => a[0] - b[0]);
  for (const r of rows) L.push("Internet  " + pad(n2ip(r[0]), 17) + lpad(r[1], 9) + "   " + pad(r[2], 16) + "ARPA   " + r[3]);
  return L.join("\n");
}

function showDhcpBinding(net, dn) {
  const d = net.devs[dn];
  const L = ["Bindings from all pools not associated with VRF:",
    "IP address      Client-ID/              Lease expiration        Type       State      Interface",
    "                Hardware address/", "                User name"];
  for (const [ip, b] of Object.entries(d.rt.bindings).sort((a, b) => a[0] - b[0])) {
    L.push(pad(n2ip(+ip), 16) + pad("01" + b.mac.replace(/\./g, ""), 24) + pad("Infinite", 24) + pad("Automatic", 11) + pad("Active", 11) + "Unknown");
  }
  return L.join("\n");
}

function showDhcpPool(net, dn) {
  const d = net.devs[dn], L = [];
  for (const p of Object.values(d.cfg.dhcp.pools)) {
    const leased = Object.values(d.rt.bindings).filter((b) => b.pool === p.name).length;
    const size = p.net === null ? 0 : Math.max(0, 2 ** (32 - maskLen(p.mask)) - 2);
    L.push("", `Pool ${p.name} :`, " Utilization mark (high/low)    : 100 / 0", " Subnet size (first/next)       : 0 / 0",
      ` Total addresses                : ${size}`, ` Leased addresses               : ${leased}`, " Excluded addresses             : " +
      d.cfg.dhcp.excluded.reduce((a, [lo, hi]) => a + hi - lo + 1, 0), " Pending event                  : none");
    if (p.net !== null) L.push(` 1 subnet is currently in the pool :`, ` Current index        IP address range                    Leased/Excluded/Total`,
      ` ${pad(n2ip(p.net + 1), 21)}${n2ip(p.net + 1)}     - ${pad(n2ip(((p.net | ~p.mask) >>> 0) - 1), 17)}${leased} / 0 / ${size}`);
  }
  return L.join("\n");
}

function showSsh(net, dn) {
  const c = net.devs[dn].cfg;
  if (!net.sshReady(dn)) {
    return `SSH Disabled - version ${c.sshVer === 2 ? "2.0" : "1.99"}\n%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).`;
  }
  return [`SSH Enabled - version ${c.sshVer === 2 ? "2.0" : "1.99"}`, "Authentication methods:publickey,keyboard-interactive,password",
    "Authentication timeout: 120 secs; Authentication retries: 3", `Minimum expected Diffie Hellman key size : 1024 bits`,
    `IOS Keys in SECSH format(ssh-rsa, base64 encoded): ${c.hostname}.${c.domain} (${c.rsa} bits)`].join("\n");
}

function showVersion(net, dn) {
  const d = net.devs[dn];
  const model = d.type === "router" ? "IOSv (router)" : "WS-C2960-24TT-L (switch)";
  return [`Cisco IOS Software, NetLab simulated ${model}, Version 15.9`, "Technical Support: this is a study simulator, not real Cisco software.", "",
    `${d.cfg.hostname} uptime is 1 hour, 12 minutes`, `System image file is "flash:netlab-${d.type}"`, "",
    `${d.ports.length} ${d.type === "router" ? "Gigabit Ethernet" : "Ethernet"} interfaces`,
    "Configuration register is 0x2102"].join("\n");
}

export function clock() {
  const t = new Date();
  const mon = t.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const p2 = (n) => String(n).padStart(2, "0");
  return `${mon} ${String(t.getUTCDate()).padStart(2)} ${p2(t.getUTCHours())}:${p2(t.getUTCMinutes())}:${p2(t.getUTCSeconds())}.${String(t.getUTCMilliseconds()).padStart(3, "0")}`;
}

// ---------------------------------------------------------------- the grammar
const HELP = {
  "access-class": "Filter connections based on an IP access list", "access-group": "Specify access control for packets",
  "access-list": "Add an access list entry", "access-lists": "List access lists", add: "add VLANs to the current list",
  address: "Set the IP address of an interface", all: "all VLANs", allowed: "Set allowed VLAN characteristics when interface is in trunking mode",
  always: "Always advertise default route", area: "Set the OSPF area ID", arp: "ARP table", "arp-cache": "Clear the entire ARP cache",
  "auto-cost": "Calculate OSPF interface cost according to bandwidth", banner: "Define a login banner", bandwidth: "Set bandwidth informational parameter",
  begin: "Begin with the line that matches", binding: "DHCP address bindings", brief: "Brief summary", broadcast: "Specify OSPF broadcast multi-access network",
  cdp: "CDP information", clear: "Reset functions", clock: "Display the system clock", con: "Primary terminal line", configure: "Enter configuration mode",
  console: "Primary terminal line", copy: "Copy from one file to another", cost: "Interface cost", counters: "Clear access list statistical information",
  crypto: "Encryption module", "dead-interval": "Interval after which a neighbor is declared dead", default: "Set a command to its defaults",
  "default-gateway": "Specify default gateway (if not routing IP)", "default-information": "Control distribution of default information",
  "default-router": "Default routers", deny: "Specify packets to reject", description: "Interface specific description", detail: "Show detailed information",
  dhcp: "Configure DHCP server and relay parameters", disable: "Turn off privileged commands", do: "To run exec commands in config mode",
  domain: "IP DNS Resolver", "domain-lookup": "Enable IP Domain Name System hostname translation", "domain-name": "Define the default domain name",
  dot1q: "IEEE 802.1Q Virtual LAN", dynamic: "Set trunking mode to dynamically negotiate access or trunk mode", auto: "Set trunking mode dynamic negotiation parameter to AUTO",
  desirable: "Set trunking mode dynamic negotiation parameter to DESIRABLE", enable: "Turn on privileged commands",
  encapsulation: "Set encapsulation type for an interface", end: "Exit from configure mode", erase: "Erase a filesystem", exclude: "Exclude lines that match",
  "exec-timeout": "Set the EXEC timeout", "excluded-address": "Prevent DHCP from assigning certain addresses", exit: "Exit from the EXEC",
  extended: "Extended Access List", generate: "Generate new keys", "general-keys": "Generate a general purpose RSA key pair for signing and encryption",
  "hello-interval": "Time between HELLO packets", "helper-address": "Specify a destination address for UDP broadcasts", history: "Display the session command history",
  host: "A single host address", hostname: "Set system's network name", in: "inbound packets", include: "Include lines that match",
  input: "Define which protocols to use when connecting to the terminal server", interface: "Select an interface to configure",
  interfaces: "Interface status and configuration", ip: "Global IP configuration subcommands", key: "Long term key operations", length: "Set number of lines on a screen",
  line: "Configure a terminal line", local: "Local password checking", log: "Log matches against this entry", logging: "Modify message logging facilities",
  login: "Enable password checking", logout: "Exit from the EXEC", mac: "MAC configuration", "address-table": "MAC forwarding table",
  memory: "Write to NV memory", mode: "Set trunking mode of the interface", modulus: "Provide number of modulus bits on the command line", motd: "Set Message of the Day banner",
  name: "Ascii name of the VLAN", native: "Make this as native vlan", neighbor: "Neighbor list", neighbors: "CDP neighbor entries", network: "Network number and mask",
  no: "Negate a command or set its defaults", none: "no VLANs", nonegotiate: "Device will not engage in negotiation protocol on this interface",
  originate: "Distribute a default route", ospf: "OSPF information", out: "outbound packets", "passive-interface": "Suppress routing updates on an interface",
  password: "Set a password", permit: "Specify packets to forward", ping: "Send echo messages", "point-to-point": "Specify OSPF point-to-point network",
  pool: "Configure DHCP address pools", priority: "Router priority", privilege: "Set user privilege level", process: "Reset OSPF process", protocols: "IP routing protocol process parameters and statistics",
  range: "interface range command", "reference-bandwidth": "Use reference bandwidth method to assign OSPF cost", reload: "Halt and perform a cold restart",
  remark: "Access list entry comment", remove: "remove VLANs from the current list", repeat: "specify repeat count", route: "Establish static routes",
  "router-id": "router-id for this OSPF process", router: "Enable a routing process", rsa: "Generate RSA keys", "running-config": "Current operating configuration",
  run: "Enable CDP", secret: "Specify the password", section: "Filter a section of output", service: "Modify use of network based services",
  "password-encryption": "Encrypt system passwords", show: "Show running system information", shutdown: "Shutdown the selected interface",
  source: "specify source address or name", ssh: "Configure secure shell", standard: "Standard Access List", "startup-config": "Contents of startup configuration",
  status: "Show interface line status", switchport: "Set switching mode characteristics", synchronous: "Synchronized message output", telnet: "Open a telnet connection",
  terminal: "Set terminal line parameters", traceroute: "Trace route to destination", transport: "Define transport protocols for line", trunk: "Set trunking characteristics of the interface",
  username: "Establish User Name Authentication", version: "System hardware and software status", vlan: "VLAN commands", vty: "Virtual terminal",
  write: "Write running configuration to memory, network, or terminal", zeroize: "Remove keys", access: "Set access mode characteristics of the interface",
  "dns-server": "DNS servers", "-l": "Log in using this user name", lookup: "Enable IP Domain Name System hostname translation",
};

// Help that depends on where the keyword appears, keyed by the keyword path.
const HELP_PATH = {
  "show ip": "IP information", "show ip route": "IP routing table", "show ip interface": "IP interface status and configuration",
  "show ip ospf": "OSPF information", "show ip dhcp": "Show items in the DHCP database", "show ip ssh": "Information on SSH",
  "show ip arp": "IP ARP table", "show ip access-lists": "List IP access lists", "show ip protocols": "IP routing protocol process parameters and statistics",
  "show ip ospf interface": "Interface information", "show ip ospf neighbor": "Neighbor list", "show ip dhcp pool": "DHCP pools information",
  "show ip dhcp binding": "DHCP address bindings", "show vlan": "VTP VLAN status", "show mac": "MAC configuration",
  "show running-config interface": "Show interface configuration", "show interfaces trunk": "Show interface trunk information",
  "show interfaces switchport": "Show interface switchport information", "show arp": "ARP table", "show access-lists": "List access lists",
  "clear ip": "IP", "clear ip ospf": "OSPF clear commands", "clear ip dhcp": "Delete items from the DHCP database",
  "clear mac": "MAC forwarding table", "clear access-list": "Clear access list statistical information", "no ip": "Global IP configuration subcommands",
  "ip route": "Establish static routes", "ip dhcp": "Configure DHCP server and relay parameters", "ip access-list": "Named access list",
  "ip ospf": "OSPF interface commands", "ip ssh": "Configure ssh options", "ip domain": "IP DNS Resolver",
  "ip default-gateway": "Specify default gateway (if not routing IP)", "ip helper-address": "Specify a destination address for UDP broadcasts",
  "ip address": "Set the IP address of an interface", "router ospf": "Open Shortest Path First (OSPF)", "switchport access": "Set access mode characteristics of the interface",
  "switchport trunk": "Set trunking characteristics of the interface", "switchport mode": "Set trunking mode of the interface",
  "transport input": "Define which protocols to use when connecting to the terminal server", "line vty": "Virtual terminal",
};

const PARAMS = {
  ip: { fmt: "A.B.C.D", help: "IP address", match: (t, k) => (isIp(t[k].t) ? { used: 1, value: ip2n(t[k].t) } : null) },
  word: { fmt: "WORD", help: "", match: (t, k) => ({ used: 1, value: t[k].t }) },
  line: { fmt: "LINE", help: "", rest: true, match: (t, k, ctx) => ({ used: t.length - k, value: ctx.line.slice(t[k].i).trimEnd() }) },
  vlans: { fmt: "WORD", help: "VLAN IDs of the allowed VLANs when this port is in trunking mode", match: (t, k) => {
    const v = parseVlans(t[k].t);
    return v ? { used: 1, value: v } : null;
  } },
  slash: { fmt: "/nn", help: "Prefix length", match: (t, k) => {
    const m = /^\/(\d{1,2})$/.exec(t[k].t);
    return m && +m[1] <= 32 ? { used: 1, value: +m[1] } : null;
  } },
  intf: { fmt: "", help: "", intf: true, match: (t, k, ctx) => {
    const r = parseIfName(ctx.d.type, t, k);
    return r ? { used: r.used, value: r.name } : null;
  } },
};

function paramFor(spec) {
  const [kind, help] = spec.split("|");
  const m = /^num:(\d+)-(\d+)$/.exec(kind);
  if (m) {
    const lo = +m[1], hi = +m[2];
    return { fmt: `<${lo}-${hi}>`, help: help || "", match: (t, k) => (/^\d+$/.test(t[k].t) && +t[k].t >= lo && +t[k].t <= hi ? { used: 1, value: +t[k].t } : null) };
  }
  if (!PARAMS[kind]) throw new Error("unknown param " + kind);
  return { ...PARAMS[kind], help: help || PARAMS[kind].help };
}

const TREES = { router: {}, switch: {} };
const newNode = () => ({ kids: [], run: null });

function expand(spec) {
  const toks = spec.match(/<[^>]+>|\{[^}]+\}|\S+/g);
  let out = [[]];
  for (const t of toks) {
    if (t.startsWith("{")) {
      const alts = t.slice(1, -1).split("|");
      out = out.flatMap((o) => alts.map((a) => o.concat(["~" + a])));
    } else out = out.map((o) => o.concat([t]));
  }
  return out;
}

function keywordHelp(path, kw) {
  const key = path.filter((t) => !t.startsWith("<")).map((t) => t.replace(/^~/, "").toLowerCase()).concat([kw]).join(" ");
  for (let i = 0; i < key.split(" ").length; i++) {
    const tail = key.split(" ").slice(i).join(" ");
    if (HELP_PATH[tail] && tail.includes(" ")) return HELP_PATH[tail];
  }
  return HELP[kw] || "";
}

function def(types, modes, spec, fn) {
  const ts = types === "RS" ? ["router", "switch"] : types === "R" ? ["router"] : ["switch"];
  for (const t of ts) {
    for (const m of [].concat(modes)) {
      for (const toks of expand(spec)) {
        TREES[t][m] = TREES[t][m] || newNode();
        let node = TREES[t][m];
        for (const [ti, tok] of toks.entries()) {
          let kid;
          if (tok.startsWith("<")) {
            kid = node.kids.find((c) => c.key === tok);
            if (!kid) { kid = { ...newNode(), key: tok, param: paramFor(tok.slice(1, -1)) }; node.kids.push(kid); }
          } else {
            const capture = tok.startsWith("~");
            const label = capture ? tok.slice(1) : tok;
            const kw = label.toLowerCase();
            kid = node.kids.find((c) => c.kw === kw);
            const help = ti === 0 && kw === "exit" && CONFIG_MODES.includes(m) ? "Exit from configure mode" : keywordHelp(toks.slice(0, ti), kw);
            if (!kid) { kid = { ...newNode(), kw, label, capture, help }; node.kids.push(kid); }
          }
          node = kid;
        }
        if (node.run) throw new Error(`duplicate command "${spec}" in ${t}/${m}`);
        node.run = fn;
      }
    }
  }
}

export function tokenize(line) {
  return [...line.matchAll(/\S+/g)].map((m) => ({ t: m[0], i: m.index }));
}

function walk(root, toks, ctx) {
  let node = root;
  const args = [];
  for (let k = 0; k < toks.length;) {
    const w = toks[k].t.toLowerCase();
    let next = null, used = 1, val;
    const kws = node.kids.filter((c) => c.kw && c.kw.startsWith(w));
    const exact = kws.find((c) => c.kw === w);
    if (exact) next = exact;
    else if (kws.length === 1) next = kws[0];
    else if (kws.length > 1) return { err: "ambiguous", at: k, node };
    if (!next) {
      for (const c of node.kids) {
        if (!c.param) continue;
        const m = c.param.match(toks, k, ctx);
        if (m) { next = c; used = m.used; val = m.value; break; }
      }
    }
    if (!next) return { err: "invalid", at: k, node };
    if (next.capture) args.push(next.kw);
    else if (next.param) args.push(val);
    node = next;
    k += used;
  }
  return { node, args };
}

const MODES = {
  user: ">", priv: "#", config: "(config)#", if: "(config-if)#", subif: "(config-subif)#", range: "(config-if-range)#",
  line: "(config-line)#", ospf: "(config-router)#", vlan: "(config-vlan)#", pool: "(dhcp-config)#",
  stdacl: "(config-std-nacl)#", extacl: "(config-ext-nacl)#",
};
const SUBMODES = ["if", "subif", "range", "line", "ospf", "vlan", "pool", "stdacl", "extacl"];
const CONFIG_MODES = ["config", ...SUBMODES];
const IF_MODES = ["if", "subif", "range"];

// ---- exec ---------------------------------------------------------------
def("RS", "user", "enable", (c) => c.s.enable());
def("RS", "priv", "disable", (c) => c.s.enter("user", null));
def("RS", ["user", "priv"], "exit", (c) => c.s.logout());
def("RS", ["user", "priv"], "logout", (c) => c.s.logout());
def("RS", "priv", "configure terminal", (c) => c.s.configure());
def("RS", "priv", "configure", (c) => c.s.ask("Configuring from terminal, memory, or network [terminal]? ", {}, (ans) => {
  if (!ans.trim() || "terminal".startsWith(ans.trim().toLowerCase())) c.s.configure();
  else c.print("?Must be \"terminal\", \"memory\" or \"network\"");
}));
def("RS", "priv", "copy running-config startup-config", (c) => c.s.ask("Destination filename [startup-config]? ", {}, (ans) => {
  if (ans.trim() && ans.trim() !== "startup-config") { c.print("%Error opening " + ans.trim() + " (Permission denied)"); return; }
  c.s.save();
}));
def("RS", "priv", "write memory", (c) => c.s.save());
def("RS", "priv", "write", (c) => c.s.save());
const eraseNvram = (c) => c.s.ask("Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]", {}, (ans) => {
  if (ans.trim() && !"yes".startsWith(ans.trim().toLowerCase())) return;
  c.d.startup = null;
  c.print("[OK]", "Erase of nvram: complete");
});
def("RS", "priv", "write erase", eraseNvram);
def("RS", "priv", "erase startup-config", eraseNvram);
def("RS", "priv", "reload", (c) => c.s.reload());
def("RS", ["user", "priv"], "terminal length <num:0-512|Number of lines on screen (0 for no pausing)>", () => {});
def("RS", ["user", "priv"], "ping <ip|Ping destination address>", (c, [ip]) => c.s.ping(ip, null, 5));
def("RS", ["user", "priv"], "ping <ip|Ping destination address> repeat <num:1-100>", (c, [ip, n]) => c.s.ping(ip, null, n));
def("RS", ["user", "priv"], "ping <ip|Ping destination address> source <intf>", (c, [ip, ifn]) => c.s.pingFrom(ip, ifn));
def("RS", ["user", "priv"], "ping <ip|Ping destination address> source <ip|Source address>", (c, [ip, src]) => c.s.ping(ip, src, 5));
def("RS", ["user", "priv"], "traceroute <ip|Trace route to destination address>", (c, [ip]) => c.s.traceroute(ip));
def("RS", ["user", "priv"], "ssh -l <word|Login name> <ip|IP address of the remote system>", (c, [user, ip]) => c.s.remote("ssh", ip, user));
def("RS", ["user", "priv"], "telnet <ip|IP address of a remote system>", (c, [ip]) => c.s.remote("telnet", ip, null));
def("R", "priv", "clear ip ospf process", (c) => c.s.ask("Reset ALL OSPF processes? [no]: ", {}, (ans) => {
  if (!/^y(es?)?$/i.test(ans.trim())) return;
  if (c.cfg.ospf) c.cfg.ospf.ridHeld = null;
}));
def("RS", "priv", "clear arp-cache", (c) => { c.d.rt.arp = {}; });
def("S", "priv", "clear mac address-table dynamic", (c) => { c.d.rt.mac = {}; });
def("R", "priv", "clear ip dhcp binding <word|* to clear all bindings>", (c, [w]) => {
  if (w === "*") c.d.rt.bindings = {};
  else if (isIp(w)) delete c.d.rt.bindings[ip2n(w)];
  else c.invalid(4);
});
def("R", "priv", "clear access-list counters", (c) => { c.d.rt.hits = {}; });

// ---- show -----------------------------------------------------------------
const both = ["user", "priv"];
def("RS", both, "show version", (c) => c.print(showVersion(c.net, c.d.name)));
def("RS", both, "show history", (c) => c.print(c.s.history.map((h) => "  " + h).join("\n")));
def("RS", both, "show clock", (c) => c.print("*" + clock() + " UTC"));
def("RS", both, "show ip interface brief", (c) => c.print(showIpIntBrief(c.net, c.d.name)));
def("RS", both, "show interfaces", (c) => c.print(showInterfaces(c.net, c.d.name)));
def("RS", both, "show interfaces <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => c.print(showInterfaces(c.net, c.d.name, ifn))));
def("RS", both, "show cdp neighbors", (c) => c.print(showCdp(c.net, c.d.name, false)));
def("RS", both, "show cdp neighbors detail", (c) => c.print(showCdp(c.net, c.d.name, true)));
def("RS", both, "show ip route", (c) => c.print(showIpRoute(c.net, c.d.name)));
def("RS", both, "show ip route {connected|static|ospf}", (c, [f]) => c.print(showIpRoute(c.net, c.d.name, f[0].toUpperCase())));
def("RS", both, "show arp", (c) => c.print(showArp(c.net, c.d.name)));
def("RS", both, "show ip arp", (c) => c.print(showArp(c.net, c.d.name)));
def("RS", "priv", "show running-config", (c) => c.print(runningConfig(c.net, c.d.name)));
def("RS", "priv", "show running-config interface <intf>", (c, [n]) => c.s.withIf(n, 3, (ifn) => c.print(runningConfig(c.net, c.d.name, ifn))));
def("RS", "priv", "show startup-config", (c) => {
  if (!c.d.startup) { c.print("startup-config is not present"); return; }
  const tmp = new Network(c.net.spec);
  tmp.devs[c.d.name].cfg = clone(c.d.startup);
  c.print(runningConfig(tmp, c.d.name).replace("Building configuration...\n\nCurrent configuration", "Using " + JSON.stringify(c.d.startup).length + " out of 262144 bytes\n!\n! Last configuration change\n!\nCurrent configuration"));
});
def("RS", "priv", "show ip ssh", (c) => c.print(showSsh(c.net, c.d.name)));
def("S", both, "show vlan brief", (c) => c.print(showVlanBrief(c.net, c.d.name)));
def("S", both, "show vlan", (c) => c.print(showVlanBrief(c.net, c.d.name)));
def("S", both, "show interfaces trunk", (c) => c.print(showTrunks(c.net, c.d.name)));
def("S", both, "show interfaces status", (c) => c.print(showIntStatus(c.net, c.d.name)));
def("S", both, "show interfaces <intf> switchport", (c, [n]) => c.s.withIf(n, 2, (ifn) => {
  if (ifn.startsWith("Vlan")) c.invalid(3); else c.print(showSwitchport(c.net, c.d.name, ifn));
}));
def("S", both, "show mac address-table", (c) => c.print(showMacTable(c.net, c.d.name)));
def("R", "priv", "show ip ospf neighbor", (c) => c.print(showOspfNbr(c.net, c.d.name)));
def("R", "priv", "show ip ospf interface", (c) => c.print(showOspfInt(c.net, c.d.name)));
def("R", "priv", "show ip ospf interface brief", (c) => c.print(showOspfIntBrief(c.net, c.d.name)));
def("R", "priv", "show ip ospf interface <intf>", (c, [n]) => c.s.withIf(n, 4, (ifn) => c.print(showOspfInt(c.net, c.d.name, ifn))));
def("R", "priv", "show ip ospf", (c) => {
  const o = c.net.ospf()[c.d.name];
  if (!o) { c.print("%OSPF: No router process is configured"); return; }
  const areas = [...new Set(o.ifs.map((i) => i.area))];
  c.print([` Routing Process "ospf ${o.pid}" with ID ${n2ip(o.rid)}`, ` Reference bandwidth unit is ${c.cfg.ospf.refBw} mbps`,
    ` Number of areas in this router is ${areas.length}. ${areas.length} normal 0 stub 0 nssa`,
    ...areas.map((a) => `    Area ${a === 0 ? "BACKBONE(0)" : a}\n        Number of interfaces in this area is ${o.ifs.filter((i) => i.area === a).length}`)].join("\n"));
});
def("R", "priv", "show ip protocols", (c) => c.print(showIpProtocols(c.net, c.d.name)));
def("R", "priv", "show access-lists", (c) => c.print(showAcls(c.net, c.d.name)));
def("R", "priv", "show access-lists <word|ACL name or number>", (c, [n]) => c.print(showAcls(c.net, c.d.name, n)));
def("R", "priv", "show ip access-lists", (c) => c.print(showAcls(c.net, c.d.name)));
def("R", "priv", "show ip dhcp binding", (c) => c.print(showDhcpBinding(c.net, c.d.name)));
def("R", "priv", "show ip dhcp pool", (c) => c.print(showDhcpPool(c.net, c.d.name)));

// ---- global configuration ------------------------------------------------------
def("RS", CONFIG_MODES, "end", (c) => c.s.endConfig());
def("RS", "config", "exit", (c) => c.s.endConfig());
def("RS", SUBMODES, "exit", (c) => c.s.enter("config", null));
def("RS", "config", "hostname <word|This system's network name>", (c, [h]) => {
  if (!/^[A-Za-z][A-Za-z0-9-]{0,62}$/.test(h)) { c.print("% Hostname contains one or more illegal characters."); return; }
  c.cfg.hostname = h;
});
def("RS", "config", "no hostname", (c) => { c.cfg.hostname = c.d.type === "router" ? "Router" : "Switch"; });
def("RS", "config", "enable secret <line|The UNENCRYPTED (cleartext) 'enable' secret>", (c, [p]) => {
  if (p === c.cfg.enablePassword) c.print("The enable secret you have chosen is the same as your enable password.\nThis is not recommended.  Re-enter the enable secret.");
  c.cfg.enableSecret = p;
});
def("RS", "config", "enable password <line|The UNENCRYPTED (cleartext) 'enable' password>", (c, [p]) => {
  if (p === c.cfg.enableSecret) c.print("The enable password you have chosen is the same as your enable secret.\nThis is not recommended.  Re-enter the enable password.");
  c.cfg.enablePassword = p;
});
def("RS", "config", "no enable secret", (c) => { c.cfg.enableSecret = null; });
def("RS", "config", "no enable password", (c) => { c.cfg.enablePassword = null; });
def("RS", "config", "service password-encryption", (c) => { c.cfg.pwEnc = true; });
def("RS", "config", "no service password-encryption", (c) => { c.cfg.pwEnc = false; });
def("RS", "config", "banner motd <line|c  banner-text c, where 'c' is a delimiting character>", (c, [text]) => c.s.banner(text));
def("RS", "config", "no banner motd", (c) => { c.cfg.banner = ""; });
def("RS", "config", "ip domain-lookup", (c) => { c.cfg.domainLookup = true; });
def("RS", "config", "no ip domain-lookup", (c) => { c.cfg.domainLookup = false; });
def("RS", "config", "ip domain lookup", (c) => { c.cfg.domainLookup = true; });
def("RS", "config", "no ip domain lookup", (c) => { c.cfg.domainLookup = false; });
const setDomain = (c, [n]) => { c.cfg.domain = n; };
def("RS", "config", "ip domain-name <word|Default domain name>", setDomain);
def("RS", "config", "ip domain name <word|Default domain name>", setDomain);
def("RS", "config", "no ip domain-name", (c) => { c.cfg.domain = ""; });
def("RS", "config", "no ip domain name", (c) => { c.cfg.domain = ""; });
const setUser = (kind) => (c, args) => {
  const [name, ...rest] = args;
  const pw = rest.pop(), priv = rest.length ? rest[0] : undefined;
  c.cfg.users[name] = kind === "secret" ? { secret: pw, priv } : { password: pw, priv };
};
def("RS", "config", "username <word|User name> secret <line|The UNENCRYPTED (cleartext) user secret>", setUser("secret"));
def("RS", "config", "username <word|User name> password <line|The UNENCRYPTED (cleartext) user password>", setUser("password"));
def("RS", "config", "username <word|User name> privilege <num:0-15|User privilege level> secret <line|The UNENCRYPTED (cleartext) user secret>", setUser("secret"));
def("RS", "config", "username <word|User name> privilege <num:0-15|User privilege level> password <line|The UNENCRYPTED (cleartext) user password>", setUser("password"));
def("RS", "config", "no username <word|User name>", (c, [n]) => { delete c.cfg.users[n]; });
const genRsa = (c, bits) => {
  if (["Router", "Switch"].includes(c.cfg.hostname)) { c.print("% Please define a hostname other than Router."); return; }
  if (!c.cfg.domain) { c.print("% Please define a domain-name first."); return; }
  const run = (b) => {
    c.print(`The name for the keys will be: ${c.cfg.hostname}.${c.cfg.domain}`, "",
      `% The key modulus size is ${b} bits`, `% Generating ${b} bit RSA keys, keys will be non-exportable...`, "[OK] (elapsed time was 1 seconds)");
    c.cfg.rsa = b;
  };
  if (bits) { run(bits); return; }
  c.print(`The name for the keys will be: ${c.cfg.hostname}.${c.cfg.domain}`,
    "Choose the size of the key modulus in the range of 360 to 4096 for your\n  General Purpose Keys. Choosing a key modulus greater than 512 may take\n  a few minutes.\n");
  c.s.ask("How many bits in the modulus [512]: ", {}, (ans) => {
    const b = ans.trim() ? +ans.trim() : 512;
    if (!Number.isInteger(b) || b < 360 || b > 4096) { c.print("% Invalid input. Key modulus must be between 360 and 4096."); return; }
    c.cfg.rsa = b;
    c.print(`% Generating ${b} bit RSA keys, keys will be non-exportable...`, "[OK] (elapsed time was 1 seconds)");
  });
};
def("RS", "config", "crypto key generate rsa", (c) => genRsa(c, null));
def("RS", "config", "crypto key generate rsa modulus <num:360-4096|size of the key modulus>", (c, [b]) => genRsa(c, b));
def("RS", "config", "crypto key generate rsa general-keys modulus <num:360-4096|size of the key modulus>", (c, [b]) => genRsa(c, b));
def("RS", "config", "crypto key zeroize rsa", (c) => c.s.ask("% All keys will be removed.\nDo you really want to remove these keys? [yes/no]: ", {}, (ans) => {
  if (/^y(es?)?$/i.test(ans.trim())) c.cfg.rsa = 0;
}));
def("RS", "config", "ip ssh version <num:1-2|Protocol version>", (c, [v]) => {
  if (v === 2 && c.cfg.rsa < 768) c.print("Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).");
  c.cfg.sshVer = v;
});
def("RS", "config", "no ip ssh version", (c) => { c.cfg.sshVer = null; });
def("RS", "config", "cdp run", (c) => { c.cfg.cdp = true; });
def("RS", "config", "no cdp run", (c) => { c.cfg.cdp = false; });
def("RS", "config", "interface <intf>", (c, [n]) => c.s.enterIf(n));
def("RS", "config", "interface range <line|Interface list, e.g. f0/1 - 4, f0/10>", (c, [text]) => c.s.enterRange(text));
def("RS", "config", "no interface <intf>", (c, [n]) => {
  if (!n) { c.print("% Incomplete command."); return; }
  if (!c.cfg.intfs[n]) { c.invalid(2); return; }
  if (c.d.ports.includes(n) || n === "Vlan1") { c.print("% Physical interfaces cannot be removed"); return; }
  delete c.cfg.intfs[n];
});
def("RS", "config", "line {con|console} <num:0-0|First Line number>", (c) => c.s.enter("line", ["con"]));
def("RS", "config", "line vty <num:0-15|First Line number> <num:0-15|Last Line number>", (c, [a, b]) => {
  if (b < a) { c.print("%Last line number must be greater than or equal to first line number"); return; }
  const t = [];
  if (a <= 4) t.push("vty0");
  if (b >= 5) { c.cfg.lines.vty5 = c.cfg.lines.vty5 || newLine(true); t.push("vty5"); }
  c.s.enter("line", t);
});

// ---- router: routing, OSPF, DHCP, ACLs ------------------------------------------
const addRoute = (c, net, mask, ifn, nh, ad) => {
  if (ifn === null) { c.print("% Incomplete command."); return; }
  const len = maskLen(mask);
  if (len < 0 || and(net, mask) !== net) { c.print("%Inconsistent address and mask"); return; }
  if (ifn && !c.cfg.intfs[ifn]) { c.print("%Invalid interface " + ifn); return; }
  if (nh !== null && c.net.l3Ifs(c.d.name).some((n) => c.net.ifAddr(c.d.name, n).ip === nh)) {
    c.print("%Invalid next hop address (it's this router)");
    return;
  }
  const same = (r) => r.net === net && r.len === len && r.ifn === (ifn || null) && r.nh === nh;
  const ex = c.cfg.routes.find(same);
  if (ex) ex.ad = ad;
  else c.cfg.routes.push({ net, len, ifn: ifn || null, nh, ad });
};
def("R", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <ip|Forwarding router's address>", (c, [n, m, nh]) => addRoute(c, n, m, undefined, nh, 1));
def("R", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <ip|Forwarding router's address> <num:1-255|Distance metric for this route>", (c, [n, m, nh, ad]) => addRoute(c, n, m, undefined, nh, ad));
def("R", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <intf>", (c, [n, m, i]) => addRoute(c, n, m, i, null, 1));
def("R", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <intf> <num:1-255|Distance metric for this route>", (c, [n, m, i, ad]) => addRoute(c, n, m, i, null, ad));
def("R", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <intf> <ip|Forwarding router's address>", (c, [n, m, i, nh]) => addRoute(c, n, m, i, nh, 1));
def("R", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <intf> <ip|Forwarding router's address> <num:1-255|Distance metric for this route>", (c, [n, m, i, nh, ad]) => addRoute(c, n, m, i, nh, ad));
const delRoute = (c, net, mask, ifn, nh) => {
  const len = maskLen(mask);
  const before = c.cfg.routes.length;
  c.cfg.routes = c.cfg.routes.filter((r) => !(r.net === net && r.len === len && (ifn === undefined || r.ifn === ifn) && (nh === undefined || r.nh === nh)));
  if (c.cfg.routes.length === before) c.print("%No matching route to delete");
};
def("R", "config", "no ip route <ip|Destination prefix> <ip|Destination prefix mask>", (c, [n, m]) => delRoute(c, n, m));
def("R", "config", "no ip route <ip|Destination prefix> <ip|Destination prefix mask> <ip|Forwarding router's address>", (c, [n, m, nh]) => delRoute(c, n, m, undefined, nh));
def("R", "config", "no ip route <ip|Destination prefix> <ip|Destination prefix mask> <intf>", (c, [n, m, i]) => delRoute(c, n, m, i));
def("R", "config", "no ip route <ip|Destination prefix> <ip|Destination prefix mask> <ip|Forwarding router's address> <num:1-255|Distance metric for this route>", (c, [n, m, nh]) => delRoute(c, n, m, undefined, nh));
def("R", "config", "no ip route <ip|Destination prefix> <ip|Destination prefix mask> <intf> <ip|Forwarding router's address>", (c, [n, m, i, nh]) => delRoute(c, n, m, i, nh));

def("R", "config", "router ospf <num:1-65535|Process ID>", (c, [pid]) => {
  const o = c.cfg.ospf;
  if (o && o.pid !== pid) { c.print(`% This simulator runs one OSPF process per router; this router already runs "router ospf ${o.pid}".`); return; }
  if (!o) {
    c.cfg.ospf = { pid, rid: null, ridHeld: null, networks: [], passive: [], noPassive: [], passiveDefault: false,
      defaultOriginate: false, defaultAlways: false, refBw: 100 };
  }
  c.s.enter("ospf", null);
});
def("R", "config", "no router ospf <num:1-65535|Process ID>", (c, [pid]) => {
  if (c.cfg.ospf && c.cfg.ospf.pid === pid) c.cfg.ospf = null;
});
const parseArea = (w) => (isIp(w) ? ip2n(w) : /^\d{1,10}$/.test(w) && +w <= 4294967295 ? +w : null);
def("R", "ospf", "network <ip|Network number> <ip|OSPF wild card bits> area <word|OSPF area ID as a decimal value or in IP address format>", (c, [addr, wild, a]) => {
  const area = parseArea(a);
  if (area === null) { c.invalid(4); return; }
  const o = c.cfg.ospf, base = and(addr, ~wild);
  const ex = o.networks.find((n) => n.addr === base && n.wild === wild);
  if (ex && ex.area !== area) {
    c.print(`% OSPF: "network ${n2ip(base)} ${n2ip(wild)} area ${ex.area}" is already configured; remove it before using area ${area}`);
    return;
  }
  if (!ex) o.networks.push({ addr: base, wild, area });
});
def("R", "ospf", "no network <ip|Network number> <ip|OSPF wild card bits> area <word|OSPF area ID as a decimal value or in IP address format>", (c, [addr, wild, a]) => {
  const o = c.cfg.ospf, area = parseArea(a), base = and(addr, ~wild);
  const before = o.networks.length;
  o.networks = o.networks.filter((n) => !(n.addr === base && n.wild === wild && n.area === area));
  if (before === o.networks.length) c.print("% OSPF: Specified network not found");
});
def("R", "ospf", "router-id <ip|OSPF router-id in IP address format>", (c, [rid]) => c.s.setRid(rid));
def("R", "ospf", "no router-id", (c) => c.s.setRid(null));
def("R", "ospf", "passive-interface <intf>", (c, [n]) => c.s.withIf(n, 1, (ifn) => {
  const o = c.cfg.ospf;
  if (o.passiveDefault) o.noPassive = o.noPassive.filter((x) => x !== ifn);
  else if (!o.passive.includes(ifn)) o.passive.push(ifn);
}));
def("R", "ospf", "no passive-interface <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => {
  const o = c.cfg.ospf;
  if (o.passiveDefault) { if (!o.noPassive.includes(ifn)) o.noPassive.push(ifn); }
  else o.passive = o.passive.filter((x) => x !== ifn);
}));
def("R", "ospf", "passive-interface default", (c) => Object.assign(c.cfg.ospf, { passiveDefault: true, noPassive: [], passive: [] }));
def("R", "ospf", "no passive-interface default", (c) => Object.assign(c.cfg.ospf, { passiveDefault: false, noPassive: [], passive: [] }));
def("R", "ospf", "default-information originate", (c) => Object.assign(c.cfg.ospf, { defaultOriginate: true, defaultAlways: false }));
def("R", "ospf", "default-information originate always", (c) => Object.assign(c.cfg.ospf, { defaultOriginate: true, defaultAlways: true }));
def("R", "ospf", "no default-information originate", (c) => Object.assign(c.cfg.ospf, { defaultOriginate: false, defaultAlways: false }));
def("R", "ospf", "auto-cost reference-bandwidth <num:1-4294967|The reference bandwidth in terms of Mbits per second>", (c, [bw]) => {
  c.cfg.ospf.refBw = bw;
  c.print("% OSPF: Reference bandwidth is changed.\n        Please ensure reference bandwidth is consistent across all routers.");
});
def("R", "ospf", "no auto-cost reference-bandwidth", (c) => { c.cfg.ospf.refBw = 100; });

def("R", "config", "ip dhcp excluded-address <ip|Low IP address>", (c, [lo]) => c.cfg.dhcp.excluded.push([lo, lo]));
def("R", "config", "ip dhcp excluded-address <ip|Low IP address> <ip|High IP address>", (c, [lo, hi]) => {
  if (hi < lo) { c.print("% Low address is greater than high address"); return; }
  c.cfg.dhcp.excluded.push([lo, hi]);
});
def("R", "config", "no ip dhcp excluded-address <ip|Low IP address>", (c, [lo]) => {
  c.cfg.dhcp.excluded = c.cfg.dhcp.excluded.filter(([a, b]) => !(a === lo && b === lo));
});
def("R", "config", "no ip dhcp excluded-address <ip|Low IP address> <ip|High IP address>", (c, [lo, hi]) => {
  c.cfg.dhcp.excluded = c.cfg.dhcp.excluded.filter(([a, b]) => !(a === lo && b === hi));
});
def("R", "config", "ip dhcp pool <word|Pool name>", (c, [name]) => {
  if (!c.cfg.dhcp.pools[name]) c.cfg.dhcp.pools[name] = { name, net: null, mask: null, router: [], dns: [], domain: "" };
  c.s.enter("pool", name);
});
def("R", "config", "no ip dhcp pool <word|Pool name>", (c, [name]) => {
  if (!c.cfg.dhcp.pools[name]) { c.print(`%Pool ${name} not found`); return; }
  delete c.cfg.dhcp.pools[name];
});
const poolNet = (c, net, mask) => {
  const len = maskLen(mask);
  if (len < 0 || len > 30) { c.print("% Invalid mask"); return; }
  const p = c.cfg.dhcp.pools[c.target];
  p.net = and(net, mask);
  p.mask = mask;
};
def("R", "pool", "network <ip|Network number in dotted-decimal notation> <ip|Network mask>", (c, [n, m]) => poolNet(c, n, m));
def("R", "pool", "network <ip|Network number in dotted-decimal notation> <slash>", (c, [n, l]) => poolNet(c, n, lenMask(l)));
def("R", "pool", "default-router <ip|Router's IP address>", (c, [ip]) => { c.cfg.dhcp.pools[c.target].router = [ip]; });
def("R", "pool", "default-router <ip|Router's IP address> <ip|Router's IP address>", (c, [a, b]) => { c.cfg.dhcp.pools[c.target].router = [a, b]; });
def("R", "pool", "dns-server <ip|Server's name or IP address>", (c, [ip]) => { c.cfg.dhcp.pools[c.target].dns = [ip]; });
def("R", "pool", "dns-server <ip|Server's name or IP address> <ip|Server's name or IP address>", (c, [a, b]) => { c.cfg.dhcp.pools[c.target].dns = [a, b]; });
def("R", "pool", "domain-name <word|Domain name>", (c, [n]) => { c.cfg.dhcp.pools[c.target].domain = n; });
def("R", "pool", "no default-router", (c) => { c.cfg.dhcp.pools[c.target].router = []; });
def("R", "pool", "no dns-server", (c) => { c.cfg.dhcp.pools[c.target].dns = []; });
def("R", "pool", "no network", (c) => Object.assign(c.cfg.dhcp.pools[c.target], { net: null, mask: null }));

const aclAdd = (c, name, type, action, text, seq, at) => {
  const acl = c.cfg.acls[name] || (c.cfg.acls[name] = { type, entries: [] });
  if (acl.type !== type) { c.print(`% Access list ${name} is a ${acl.type} access list`); return; }
  const r = parseAce(type, tokenize(text).map((t) => t.t));
  if (r.at !== undefined) { c.invalid(at + r.at); return; }
  const next = seq ?? (acl.entries.length ? Math.max(...acl.entries.map((e) => e.seq)) + 10 : 10);
  if (acl.entries.some((e) => e.seq === next)) { c.print("% Duplicate sequence number"); return; }
  acl.entries.push({ seq: next, action, ...r.entry });
  acl.entries.sort((a, b) => a.seq - b.seq);
};
const aclRemark = (c, name, type, text) => {
  const acl = c.cfg.acls[name] || (c.cfg.acls[name] = { type, entries: [] });
  const next = acl.entries.length ? Math.max(...acl.entries.map((e) => e.seq)) + 10 : 10;
  acl.entries.push({ seq: next, remark: text });
};
def("R", "config", "access-list <num:1-99|IP standard access list> {permit|deny} <line|Address to match: any, host A.B.C.D, or A.B.C.D wildcard>",
  (c, [n, a, text]) => aclAdd(c, String(n), "standard", a, text, null, 3));
def("R", "config", "access-list <num:100-199|IP extended access list> {permit|deny} <line|Protocol, source, destination: e.g. icmp any host 10.0.0.1 echo>",
  (c, [n, a, text]) => aclAdd(c, String(n), "extended", a, text, null, 3));
def("R", "config", "access-list <num:1-99|IP standard access list> remark <line|Comment up to 100 characters>", (c, [n, t]) => aclRemark(c, String(n), "standard", t));
def("R", "config", "access-list <num:100-199|IP extended access list> remark <line|Comment up to 100 characters>", (c, [n, t]) => aclRemark(c, String(n), "extended", t));
def("R", "config", "no access-list <num:1-199|Access list number>", (c, [n]) => { delete c.cfg.acls[String(n)]; });
def("R", "config", "ip access-list {standard|extended} <word|Access-list name or number>", (c, [type, name]) => {
  const acl = c.cfg.acls[name];
  if (/^\d+$/.test(name) && ((type === "standard") !== (+name < 100))) { c.invalid(3); return; }
  if (acl && acl.type !== type) { c.print(`% A named ${acl.type} IP access list with this name already exists`); return; }
  if (!acl) c.cfg.acls[name] = { type, entries: [] };
  c.s.enter(type === "standard" ? "stdacl" : "extacl", name);
});
def("R", "config", "no ip access-list {standard|extended} <word|Access-list name or number>", (c, [, name]) => { delete c.cfg.acls[name]; });
for (const [mode, type] of [["stdacl", "standard"], ["extacl", "extended"]]) {
  const what = type === "standard" ? "Address to match: any, host A.B.C.D, or A.B.C.D wildcard" : "Protocol, source, destination: e.g. icmp any host 10.0.0.1 echo";
  def("R", mode, `{permit|deny} <line|${what}>`, (c, [a, text]) => aclAdd(c, c.target, type, a, text, null, 1));
  def("R", mode, `<num:1-2147483647|Sequence Number> {permit|deny} <line|${what}>`, (c, [seq, a, text]) => aclAdd(c, c.target, type, a, text, seq, 2));
  def("R", mode, "remark <line|Comment up to 100 characters>", (c, [t]) => aclRemark(c, c.target, type, t));
  def("R", mode, "no <num:1-2147483647|Sequence Number>", (c, [seq]) => {
    const acl = c.cfg.acls[c.target];
    acl.entries = acl.entries.filter((e) => e.seq !== seq);
  });
  def("R", mode, `no {permit|deny} <line|${what}>`, (c, [a, text]) => {
    const acl = c.cfg.acls[c.target];
    const r = parseAce(type, tokenize(text).map((t) => t.t));
    if (r.at !== undefined) { c.invalid(2 + r.at); return; }
    const want = aceStr(type, r.entry);
    acl.entries = acl.entries.filter((e) => e.remark !== undefined || e.action !== a || aceStr(type, e) !== want);
  });
}

// ---- switch: VLANs and gateway ---------------------------------------------------
def("S", "config", "vlan <vlans|ISL VLAN IDs 1-4094>", (c, [ids]) => {
  for (const v of ids) {
    if (v >= 1002 && v <= 1005) { c.print(`%Default VLAN ${v} may not be modified.`); return; }
  }
  for (const v of ids) if (!c.cfg.vlans[v]) c.cfg.vlans[v] = "VLAN" + String(v).padStart(4, "0");
  c.s.enter("vlan", ids);
});
def("S", "config", "no vlan <vlans|ISL VLAN IDs 1-4094>", (c, [ids]) => {
  for (const v of ids) {
    if (v === 1 || (v >= 1002 && v <= 1005)) { c.print(`%Default VLAN ${v} may not be deleted.`); continue; }
    delete c.cfg.vlans[v];
  }
});
def("S", "vlan", "name <word|The ascii name for the VLAN>", (c, [n]) => {
  if (n.length > 32) { c.print("% VLAN name must be 32 characters or fewer"); return; }
  for (const v of c.target) c.cfg.vlans[v] = n;
});
def("S", "vlan", "no name", (c) => { for (const v of c.target) c.cfg.vlans[v] = "VLAN" + String(v).padStart(4, "0"); });
def("S", "config", "ip default-gateway <ip|IP address of default gateway>", (c, [ip]) => { c.cfg.gateway = ip; });
def("S", "config", "no ip default-gateway", (c) => { c.cfg.gateway = null; });

// ---- interface configuration ---------------------------------------------------------
const eachIf = (c, fn) => { for (const n of c.target) if (fn(n, c.cfg.intfs[n]) === false) return; };
def("RS", IF_MODES, "description <line|Up to 240 characters describing this interface>", (c, [t]) => eachIf(c, (n, i) => { i.desc = t.slice(0, 240); }));
def("RS", IF_MODES, "no description", (c) => eachIf(c, (n, i) => { i.desc = ""; }));
def("RS", IF_MODES, "shutdown", (c) => eachIf(c, (n, i) => { i.shut = true; }));
def("RS", IF_MODES, "no shutdown", (c) => eachIf(c, (n, i) => { i.shut = false; }));
def("RS", IF_MODES, "bandwidth <num:1-10000000|Bandwidth in kilobits>", (c, [bw]) => eachIf(c, (n, i) => { i.bw = bw; }));
def("RS", IF_MODES, "no bandwidth", (c) => eachIf(c, (n, i) => { i.bw = null; }));
def("RS", IF_MODES, "cdp enable", (c) => eachIf(c, (n, i) => { i.cdp = true; }));
def("RS", IF_MODES, "no cdp enable", (c) => eachIf(c, (n, i) => { i.cdp = false; }));
def("RS", IF_MODES, "ip address <ip|IP address> <ip|IP subnet mask>", (c, [ip, mask]) => c.s.setIp(ip, mask));
def("RS", IF_MODES, "no ip address", (c) => eachIf(c, (n, i) => {
  if (c.d.type === "switch" && !n.startsWith("Vlan")) { c.invalid(1); return false; }
  i.ip = null; i.mask = null;
  return true;
}));
def("R", IF_MODES, "ip helper-address <ip|IP destination address>", (c, [ip]) => eachIf(c, (n, i) => { if (!i.helpers.includes(ip)) i.helpers.push(ip); }));
def("R", IF_MODES, "no ip helper-address", (c) => eachIf(c, (n, i) => { i.helpers = []; }));
def("R", IF_MODES, "no ip helper-address <ip|IP destination address>", (c, [ip]) => eachIf(c, (n, i) => { i.helpers = i.helpers.filter((h) => h !== ip); }));
def("R", IF_MODES, "ip access-group <word|Access-list name or number> {in|out}", (c, [name, dir]) => eachIf(c, (n, i) => {
  i[dir === "in" ? "aclIn" : "aclOut"] = name;
}));
def("R", IF_MODES, "no ip access-group <word|Access-list name or number> {in|out}", (c, [, dir]) => eachIf(c, (n, i) => {
  i[dir === "in" ? "aclIn" : "aclOut"] = null;
}));
def("R", IF_MODES, "no ip access-group {in|out}", (c, [dir]) => eachIf(c, (n, i) => { i[dir === "in" ? "aclIn" : "aclOut"] = null; }));
const ospfSet = (key, val) => (c, args) => eachIf(c, (n, i) => { i.ospf[key] = val === undefined ? args[0] : val; });
const ospfDel = (key) => (c) => eachIf(c, (n, i) => { delete i.ospf[key]; });
def("R", IF_MODES, "ip ospf cost <num:1-65535|Cost>", ospfSet("cost"));
def("R", IF_MODES, "no ip ospf cost", ospfDel("cost"));
def("R", IF_MODES, "ip ospf hello-interval <num:1-65535|Seconds>", ospfSet("hello"));
def("R", IF_MODES, "no ip ospf hello-interval", ospfDel("hello"));
def("R", IF_MODES, "ip ospf dead-interval <num:1-65535|Seconds>", ospfSet("dead"));
def("R", IF_MODES, "no ip ospf dead-interval", ospfDel("dead"));
def("R", IF_MODES, "ip ospf priority <num:0-255|Priority>", ospfSet("prio"));
def("R", IF_MODES, "no ip ospf priority", ospfDel("prio"));
def("R", IF_MODES, "ip ospf network point-to-point", ospfSet("ptp", true));
def("R", IF_MODES, "ip ospf network broadcast", ospfDel("ptp"));
def("R", IF_MODES, "no ip ospf network", ospfDel("ptp"));
def("R", IF_MODES, "ip ospf <num:1-65535|Process ID> area <word|OSPF area ID as a decimal value or in IP address format>", (c, [pid, a]) => {
  const area = parseArea(a);
  if (area === null) { c.invalid(4); return; }
  eachIf(c, (n, i) => { i.ospf.pid = pid; i.ospf.area = area; });
});
def("R", IF_MODES, "no ip ospf <num:1-65535|Process ID> area <word|OSPF area ID as a decimal value or in IP address format>", (c) => eachIf(c, (n, i) => {
  delete i.ospf.pid; delete i.ospf.area;
}));
const setEncap = (c, vlan, native) => eachIf(c, (n, i) => {
  if (!isSub(n)) { c.print("% Configuring IEEE 802.1Q encapsulation on the main interface is not supported here; use a subinterface such as " + n + "." + vlan); return false; }
  const clash = Object.keys(c.cfg.intfs).find((o) => o !== n && physOf(o) === physOf(n) && c.cfg.intfs[o].encap && c.cfg.intfs[o].encap.vlan === vlan);
  if (clash) { c.print(`Configuration of multiple subinterfaces of the same main\ninterface with the same VID (${vlan}) is not permitted.\nThis VID is already configured on ${clash}.`); return false; }
  i.encap = { vlan, native };
  return true;
});
def("R", IF_MODES, "encapsulation dot1Q <num:1-4094|IEEE 802.1Q VLAN ID>", (c, [v]) => setEncap(c, v, false));
def("R", IF_MODES, "encapsulation dot1Q <num:1-4094|IEEE 802.1Q VLAN ID> native", (c, [v]) => setEncap(c, v, true));
def("R", IF_MODES, "no encapsulation dot1Q", (c) => eachIf(c, (n, i) => { i.encap = null; i.ip = null; i.mask = null; }));

const swOnly = (c, fn) => eachIf(c, (n, i) => {
  if (n.startsWith("Vlan")) { c.invalid(0); return false; }
  return fn(n, i);
});
def("S", IF_MODES, "switchport mode {access|trunk}", (c, [m]) => swOnly(c, (n, i) => { i.mode = m; }));
def("S", IF_MODES, "switchport mode dynamic {auto|desirable}", (c, [m]) => swOnly(c, (n, i) => {
  if (i.noneg) { c.print("Command rejected: Conflict between 'nonegotiate' and 'dynamic' status."); return false; }
  i.mode = "dynamic " + m;
  return true;
}));
def("S", IF_MODES, "no switchport mode", (c) => swOnly(c, (n, i) => { i.mode = "dynamic auto"; i.noneg = false; }));
def("S", IF_MODES, "switchport access vlan <num:1-4094|VLAN ID of the VLAN when this port is in access mode>", (c, [v]) => {
  if (!c.cfg.vlans[v]) {
    c.print(`% Access VLAN does not exist. Creating vlan ${v}`);
    c.cfg.vlans[v] = "VLAN" + String(v).padStart(4, "0");
  }
  swOnly(c, (n, i) => { i.accessVlan = v; });
});
def("S", IF_MODES, "no switchport access vlan", (c) => swOnly(c, (n, i) => { i.accessVlan = 1; }));
def("S", IF_MODES, "switchport trunk native vlan <num:1-4094|VLAN ID of the native VLAN when this port is in trunking mode>", (c, [v]) => swOnly(c, (n, i) => { i.native = v; }));
def("S", IF_MODES, "no switchport trunk native vlan", (c) => swOnly(c, (n, i) => { i.native = 1; }));
def("S", IF_MODES, "switchport trunk allowed vlan <vlans>", (c, [vs]) => swOnly(c, (n, i) => { i.allowed = vs; }));
def("S", IF_MODES, "switchport trunk allowed vlan add <vlans>", (c, [vs]) => swOnly(c, (n, i) => {
  if (i.allowed !== null) i.allowed = [...new Set(i.allowed.concat(vs))].sort((a, b) => a - b);
}));
def("S", IF_MODES, "switchport trunk allowed vlan remove <vlans>", (c, [vs]) => swOnly(c, (n, i) => {
  const cur = i.allowed === null ? [...Array(4094)].map((_, k) => k + 1) : i.allowed;
  i.allowed = cur.filter((v) => !vs.includes(v));
}));
def("S", IF_MODES, "switchport trunk allowed vlan all", (c) => swOnly(c, (n, i) => { i.allowed = null; }));
def("S", IF_MODES, "switchport trunk allowed vlan none", (c) => swOnly(c, (n, i) => { i.allowed = []; }));
def("S", IF_MODES, "no switchport trunk allowed vlan", (c) => swOnly(c, (n, i) => { i.allowed = null; }));
def("S", IF_MODES, "switchport nonegotiate", (c) => swOnly(c, (n, i) => {
  if (i.mode.startsWith("dynamic")) { c.print("Command rejected: Conflict between 'nonegotiate' and 'dynamic' status."); return false; }
  i.noneg = true;
  return true;
}));
def("S", IF_MODES, "no switchport nonegotiate", (c) => swOnly(c, (n, i) => { i.noneg = false; }));

// ---- lines ------------------------------------------------------------------------
const eachLine = (c, fn) => { for (const k of c.target) fn(c.cfg.lines[k]); };
def("RS", "line", "password <line|The UNENCRYPTED (cleartext) line password>", (c, [p]) => eachLine(c, (l) => { l.password = p; }));
def("RS", "line", "no password", (c) => eachLine(c, (l) => { l.password = null; }));
def("RS", "line", "login", (c) => {
  eachLine(c, (l) => { l.login = "line"; });
  if (c.target.some((k) => c.cfg.lines[k].password === null)) {
    c.print(`% Login disabled on line ${c.target[0] === "con" ? 0 : 1}, until 'password' is set`);
  }
});
def("RS", "line", "login local", (c) => eachLine(c, (l) => { l.login = "local"; }));
def("RS", "line", "no login", (c) => eachLine(c, (l) => { l.login = null; }));
const setTransport = (c, t) => {
  if (c.target.includes("con")) { c.invalid(0); return; }
  eachLine(c, (l) => { l.transport = t; });
};
def("RS", "line", "transport input {ssh|telnet|all|none}", (c, [t]) => setTransport(c, t));
def("RS", "line", "transport input telnet ssh", (c) => setTransport(c, "telnet ssh"));
def("RS", "line", "transport input ssh telnet", (c) => setTransport(c, "telnet ssh"));
def("RS", "line", "exec-timeout <num:0-35791|Timeout in minutes>", (c, [m]) => eachLine(c, (l) => { l.timeout = [m, 0]; }));
def("RS", "line", "exec-timeout <num:0-35791|Timeout in minutes> <num:0-2147483|Timeout in seconds>", (c, [m, s]) => eachLine(c, (l) => { l.timeout = [m, s]; }));
def("RS", "line", "no exec-timeout", (c) => eachLine(c, (l) => { l.timeout = null; }));
def("RS", "line", "logging synchronous", (c) => eachLine(c, (l) => { l.sync = true; }));
def("RS", "line", "no logging synchronous", (c) => eachLine(c, (l) => { l.sync = false; }));

// ---------------------------------------------------------------- output filters
function applyFilter(text, f) {
  const lines = text.split("\n");
  if (f.kind === "include") return lines.filter((l) => f.re.test(l)).join("\n");
  if (f.kind === "exclude") return lines.filter((l) => !f.re.test(l)).join("\n");
  if (f.kind === "begin") {
    const i = lines.findIndex((l) => f.re.test(l));
    return i < 0 ? "" : lines.slice(i).join("\n");
  }
  const sections = [];
  for (const l of lines) {
    if (/^\s/.test(l) && sections.length) sections[sections.length - 1].push(l);
    else sections.push([l]);
  }
  return sections.filter((s) => s.some((l) => f.re.test(l))).map((s) => s.join("\n")).join("\n");
}

const VPCS_HELP = `
?                        Print help
arp                      Show arp table
clear ip                 Clear IPv4 address, mask, gateway and DHCP state
dhcp                     Get an address from a DHCP server (same as 'ip dhcp')
ip ARG ... [OPTION]      Configure the IPv4 address, e.g. ip 10.1.1.10/24 10.1.1.1
ping HOST [-c count]     Ping HOST with ICMP echo requests
save                     Save the configuration
show [ip|arp]            Show the PC's settings
trace HOST               Print the path packets take to HOST`;

const colonMac = (m) => m.replace(/\./g, "").match(/../g).join(":");
const ms = () => (0.3 + Math.random() * 1.5).toFixed(3);

// ---------------------------------------------------------------- a console session
export class Session {
  constructor(net, devName) {
    this.net = net;
    this.home = devName;
    this.frames = [{ dev: devName, mode: "user", target: null, via: null }];
    this.history = [];
    this.pending = null;
    this.loggedOut = false;
    this.out = [];
    this.events = {};
    this.anim = null;
    this.cx = null;
  }

  get f() { return this.frames[this.frames.length - 1]; }
  get d() { return this.net.devs[this.f.dev]; }

  // What the console shows when it is first opened.
  greeting() {
    const d = this.d;
    if (d.type === "pc") return "Welcome to the NetLab virtual PC (VPCS commands). Type '?' for help.";
    if (d.cfg.lines.con.login) {
      this.loggedOut = true;
      return "Press RETURN to get started.";
    }
    return d.cfg.banner;
  }

  prompt() {
    if (this.pending) return this.pending.prompt;
    if (this.loggedOut) return "";
    const d = this.d;
    if (d.type === "pc") return d.cfg.hostname + "> ";
    return d.cfg.hostname + MODES[this.f.mode];
  }

  masked() { return !!(this.pending && this.pending.mask); }
  print(...lines) { for (const l of lines) this.out.push(l); }
  ask(prompt, opts, fn) { this.pending = { prompt, mask: !!opts.mask, fn }; }
  enter(mode, target) { this.f.mode = mode; this.f.target = target; }

  // Run one line of input; returns the console output.
  input(line) {
    this.out = [];
    this.anim = null;
    const before = this.net.snapshot();
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      p.fn(line);
    } else if (this.loggedOut) this.login();
    else if (this.d.type === "pc") this.vpcs(line);
    else this.exec(line);
    this.net.touch();
    this.events = this.net.events(before, this.net.snapshot());
    const mine = this.events[this.home];
    if (mine) for (const m of mine) this.out.push("*" + clock() + ": " + m);
    return this.out.join("\n");
  }

  // Ctrl+C / Ctrl+Z: abandon a prompt, or leave configuration mode.
  interrupt() {
    this.out = [];
    if (this.pending) this.pending = null;
    else if (!this.loggedOut && this.d.type !== "pc" && CONFIG_MODES.includes(this.f.mode)) this.endConfig();
    return this.out.join("\n");
  }

  exec(line) {
    if (!line.trim()) return;
    this.history.push(line.trim());
    if (this.history.length > 20) this.history.shift();
    const pm = /\s\|\s*(\S*)\s*(.*)$/.exec(line);
    if (!pm) { this.run(line); return; }
    const kinds = ["include", "exclude", "begin", "section"].filter((k) => pm[1] && k.startsWith(pm[1].toLowerCase()));
    if (kinds.length !== 1 || !pm[2]) {
      this.invalidAt(pm.index + (pm[1] ? pm[0].indexOf(pm[1], pm[0].indexOf("|")) : pm[0].length));
      return;
    }
    let re;
    try { re = new RegExp(pm[2].trim()); } catch (e) { this.print("% Invalid regular expression"); return; }
    const saved = this.out;
    this.out = [];
    this.run(line.slice(0, pm.index));
    const text = this.out.join("\n");
    this.out = saved;
    this.print(applyFilter(text, { kind: kinds[0], re }));
  }

  ctx(cmd, toks) {
    const s = this, d = this.d;
    return {
      s, net: this.net, d, cfg: d.cfg, mode: this.f.mode, target: this.f.target, line: cmd, toks,
      print: (...l) => s.print(...l),
      invalid: (k) => s.invalidAt(toks.length ? toks[Math.min(k, toks.length - 1)].i : 0),
    };
  }

  invalidAt(pos) { this.print(" ".repeat(this.prompt().length + pos) + "^", "% Invalid input detected at '^' marker.", ""); }

  treeFor(toks, line) {
    const mode = this.f.mode, trees = TREES[this.d.type];
    if (CONFIG_MODES.includes(mode) && toks.length && toks[0].t.toLowerCase() === "do" && (toks.length > 1 || /\s$/.test(line))) {
      return { tree: trees.priv, toks: toks.slice(1), viaDo: true };
    }
    return { tree: trees[mode], toks, viaDo: false };
  }

  run(cmd) {
    const all = tokenize(cmd);
    if (!all.length) return;
    const mode = this.f.mode, d = this.d;
    if (CONFIG_MODES.includes(mode) && all.length === 1 && all[0].t.toLowerCase() === "do") { this.print("% Incomplete command."); return; }
    const { tree, toks, viaDo } = this.treeFor(all, cmd);
    const ctx = this.ctx(cmd, toks);
    this.cx = ctx;
    let r = walk(tree, toks, ctx);
    if ((r.err || !r.node.run) && SUBMODES.includes(mode) && !viaDo) {
      // IOS falls back to global configuration for commands the submode doesn't know.
      const r2 = walk(TREES[d.type].config, toks, ctx);
      if (!r2.err && r2.node.run) {
        this.enter("config", null);
        ctx.mode = "config";
        ctx.target = null;
        r = r2;
      }
    }
    if (r.err === "ambiguous") { this.print(`% Ambiguous command:  "${cmd.trim()}"`); return; }
    if (r.err === "invalid") {
      if (r.at === 0 && (mode === "user" || mode === "priv")) {
        const w = toks[0].t;
        this.print(d.cfg.domainLookup ? `Translating "${w}"...domain server (255.255.255.255)` : `Translating "${w}"`,
          "% Unknown command or computer name, or unable to find computer address");
        return;
      }
      this.invalidAt(toks[r.at].i);
      return;
    }
    if (!r.node.run) { this.print("% Incomplete command.", ""); return; }
    r.node.run(ctx, r.args);
  }

  // `?` pressed after `line`: returns the help text, or null when `?` is just a character here.
  help(line) {
    if (this.pending || this.loggedOut || this.d.type === "pc") return null;
    const out = this.helpIn(line, false);
    if (out.startsWith("%") && SUBMODES.includes(this.f.mode) && line.trim()) {
      const global = this.helpIn(line, true);
      if (!global.startsWith("%")) return global;
    }
    return out;
  }

  helpIn(line, global) {
    const d = this.d;
    const found = this.treeFor(tokenize(line), line);
    const tree = global && !found.viaDo ? TREES[d.type].config : found.tree, toks = found.toks;
    const ends = line === "" || /\s$/.test(line);
    const nav = ends ? toks : toks.slice(0, -1);
    const r = walk(tree, nav, this.ctx(line, toks));
    if (r.err) return r.err === "ambiguous" ? `% Ambiguous command:  "${line.trim()}"` : "% Unrecognized command";
    const node = r.node;
    if (!ends) {
      const part = toks[toks.length - 1].t.toLowerCase();
      const words = node.kids.filter((k) => k.kw && k.kw.startsWith(part)).map((k) => k.label);
      if (node.kids.some((k) => k.param && k.param.intf)) {
        for (const t of IF_TYPES[d.type]) if (t.toLowerCase().startsWith(part)) words.push(t);
      }
      return words.length ? words.sort().join("  ") : "% Unrecognized command";
    }
    if (node.param && node.param.rest) return "  <cr>";
    const params = [], kws = [];
    for (const k of node.kids) {
      if (k.kw) kws.push([k.label, k.help]);
      else if (k.param.intf) for (const t of IF_TYPES[d.type]) params.push([t, IF_HELP[t]]);
      else params.push([k.param.fmt, k.param.help]);
    }
    if (node === tree && CONFIG_MODES.includes(this.f.mode)) kws.push(["do", HELP.do]);
    const rows = [...params, ...kws.sort((a, b) => a[0].localeCompare(b[0]))];
    if (node.run) rows.push(["<cr>", ""]);
    if (!rows.length) return "% Unrecognized command";
    const w = Math.max(...rows.map((x) => x[0].length));
    return rows.map(([a, b]) => ("  " + a.padEnd(w + 2) + b).trimEnd()).join("\n");
  }

  // Tab: finish the current word when it is unambiguous.
  complete(line) {
    if (this.pending || this.loggedOut || this.d.type === "pc" || !line || /\s$/.test(line)) return line;
    const done = this.completeIn(line, false);
    if (done === line && SUBMODES.includes(this.f.mode)) return this.completeIn(line, true);
    return done;
  }

  completeIn(line, global) {
    const found = this.treeFor(tokenize(line), line);
    const tree = global && !found.viaDo ? TREES[this.d.type].config : found.tree, toks = found.toks;
    if (!toks.length) return line;
    const r = walk(tree, toks.slice(0, -1), this.ctx(line, toks));
    if (r.err) return line;
    const last = toks[toks.length - 1], part = last.t.toLowerCase();
    let cands = r.node.kids.filter((k) => k.kw && k.kw.startsWith(part)).map((k) => k.label + " ");
    if (!cands.length && /^[A-Za-z-]+$/.test(last.t) && r.node.kids.some((k) => k.param && k.param.intf)) {
      cands = IF_TYPES[this.d.type].filter((t) => t.toLowerCase().startsWith(part));
    }
    return cands.length === 1 ? line.slice(0, last.i) + cands[0] : line;
  }

  // -- modes ------------------------------------------------------------------------
  configure() {
    this.print("Enter configuration commands, one per line.  End with CNTL/Z.");
    this.enter("config", null);
  }

  endConfig() {
    this.enter("priv", null);
    const by = this.f.via ? `vty0 (${n2ip(this.f.via)})` : "console";
    this.print("*" + clock() + `: %SYS-5-CONFIG_I: Configured from console by ${by}`);
  }

  enable() {
    const c = this.d.cfg;
    const pw = c.enableSecret ?? c.enablePassword;
    if (pw === null) {
      if (this.f.via) { this.print("% No password set"); return; }
      this.enter("priv", null);
      return;
    }
    let tries = 0;
    const ask = () => this.ask("Password: ", { mask: true }, (ans) => {
      if (ans === pw) { this.enter("priv", null); return; }
      if (++tries >= 3) { this.print("% Bad secrets", ""); return; }
      ask();
    });
    ask();
  }

  logout() {
    if (this.frames.length > 1) {
      const f = this.frames.pop();
      this.print("", `[Connection to ${n2ip(f.via)} closed by foreign host]`);
      return;
    }
    this.enter("user", null);
    this.loggedOut = true;
    this.print("", `${this.d.cfg.hostname} con0 is now available`, "", "", "", "", "", "Press RETURN to get started.", "");
  }

  login() {
    const d = this.d, con = d.cfg.lines.con;
    if (d.cfg.banner) this.print(d.cfg.banner);
    const done = () => { this.loggedOut = false; };
    if (con.login === "line" && con.password !== null) {
      this.print("", "User Access Verification", "");
      let tries = 0;
      const ask = () => this.ask("Password: ", { mask: true }, (ans) => {
        if (ans === con.password) { done(); return; }
        if (++tries >= 3) { this.print("% Bad passwords", "", "Press RETURN to get started.", ""); return; }
        ask();
      });
      ask();
    } else if (con.login === "local") {
      this.print("", "User Access Verification", "");
      const askUser = () => this.ask("Username: ", {}, (user) => this.ask("Password: ", { mask: true }, (pw) => {
        const u = d.cfg.users[user.trim()];
        if (u && (u.secret ?? u.password) === pw) { done(); return; }
        this.print("", "% Login invalid", "");
        askUser();
      }));
      askUser();
    } else done();
  }

  save() {
    this.print("Building configuration...", "[OK]");
    this.d.startup = clone(this.d.cfg);
  }

  reload() {
    const d = this.d;
    const go = () => this.ask("Proceed with reload? [confirm]", {}, (ans) => {
      if (ans.trim() && !/^y/i.test(ans.trim())) return;
      d.cfg = d.startup ? clone(d.startup) : defaultCfg(d.type, d.name);
      d.rt = newRuntime();
      this.net.touch();
      if (this.frames.length > 1) {
        const f = this.frames.pop();
        this.print("", `[Connection to ${n2ip(f.via)} closed by foreign host]`);
        return;
      }
      this.enter("user", null);
      this.print("", "", "*** System restarting... ***", "", d.startup ? "Configuration loaded from startup-config." : "No startup-config found: the device boots with a blank configuration.", "");
      if (d.cfg.lines.con.login) { this.loggedOut = true; this.print("Press RETURN to get started.", ""); }
      else if (d.cfg.banner) this.print(d.cfg.banner);
    });
    const unsaved = !sameData(d.cfg, d.startup ?? defaultCfg(d.type, d.name));
    if (!unsaved) { go(); return; }
    this.ask("System configuration has been modified. Save? [yes/no]: ", {}, (ans) => {
      const a = ans.trim().toLowerCase();
      if (a && "yes".startsWith(a)) { this.save(); go(); }
      else if (a && "no".startsWith(a)) go();
      else this.print("% Please answer 'yes' or 'no'.");
    });
  }

  // -- interface helpers ------------------------------------------------------------
  withIf(n, k, fn) {
    if (!n) { this.print("% Incomplete command.", ""); return; }
    if (!this.d.cfg.intfs[n]) { this.cx.invalid(k); return; }
    fn(n);
  }

  enterIf(n) {
    const d = this.d, c = d.cfg;
    if (!n) { this.print("% Incomplete command.", ""); return; }
    if (!c.intfs[n]) {
      const virtual = n.startsWith("Loopback") || n.startsWith("Vlan") || (d.type === "router" && isSub(n) && d.ports.includes(physOf(n)));
      if (!virtual) { this.cx.invalid(1); return; }
      c.intfs[n] = newIntf(d.type, n);
    }
    this.enter(isSub(n) ? "subif" : "if", [n]);
  }

  enterRange(text) {
    const d = this.d, list = [];
    for (const part of text.split(",")) {
      const m = /^\s*([A-Za-z-]+)\s*(\d+)\/(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(part);
      const t = m && PORTS[d.type].map(ifType).filter((x, i, a) => a.indexOf(x) === i && x.toLowerCase().startsWith(m[1].toLowerCase()));
      if (!m || t.length !== 1) { this.cx.invalid(2); return; }
      const a = +m[3], b = m[4] !== undefined ? +m[4] : a;
      if (b < a) { this.cx.invalid(2); return; }
      for (let k = a; k <= b; k++) {
        const n = `${t[0]}${m[2]}/${k}`;
        if (!d.ports.includes(n)) { this.cx.invalid(2); return; }
        list.push(n);
      }
    }
    this.enter("range", [...new Set(list)]);
  }

  setIp(ip, mask) {
    const d = this.d, c = d.cfg;
    for (const n of this.f.target) {
      if (d.type === "switch" && !n.startsWith("Vlan")) { this.cx.invalid(1); return; }
      if (isSub(n) && !c.intfs[n].encap) {
        this.print("% Configuring IP routing on a LAN subinterface is only allowed if that", "subinterface is already configured as part of an IEEE 802.10, IEEE 802.1Q,", "or ISL vLAN.", "");
        return;
      }
      const len = maskLen(mask);
      if (len < 0) { this.print(`Bad mask 0x${hex(mask, 8).toUpperCase()} for address ${n2ip(ip)}`); return; }
      if (len < 31 && (and(ip, mask) === ip || ((ip | ~mask) >>> 0) === ip)) { this.print(`Bad mask /${len} for address ${n2ip(ip)}`); return; }
      for (const [o, oc] of Object.entries(c.intfs)) {
        if (o === n || oc.ip === null) continue;
        const m = and(mask, oc.mask);
        if (and(ip, m) === and(oc.ip, m)) { this.print(`% ${n2ip(and(ip, mask))} overlaps with ${o}`); return; }
      }
      c.intfs[n].ip = ip;
      c.intfs[n].mask = mask;
    }
  }

  banner(text) {
    const c = this.d.cfg;
    const delim = text.startsWith("^C") ? "^C" : text[0];
    const rest = text.slice(delim.length);
    const end = rest.indexOf(delim);
    if (end >= 0) { c.banner = rest.slice(0, end).trim(); return; }
    this.print(`Enter TEXT message.  End with the character '${delim}'.`);
    const lines = rest.trim() ? [rest.trim()] : [];
    const more = () => this.ask("", {}, (l) => {
      const k = l.indexOf(delim);
      if (k < 0) { lines.push(l); more(); return; }
      lines.push(l.slice(0, k));
      c.banner = lines.join("\n").replace(/^\n+|\n+$/g, "");
    });
    more();
  }

  setRid(rid) {
    const dn = this.d.name, o = this.d.cfg.ospf;
    const cur = this.net.routerId(dn);
    const busy = !!this.net.ospf()[dn] && this.net.ospf()[dn].nbrs.length > 0;
    const next = rid ?? null;
    if (busy && next !== null && next !== cur) {
      if (o.ridHeld === null || o.ridHeld === undefined) o.ridHeld = cur;
      o.rid = next;
      this.print('% OSPF: Reload or use "clear ip ospf process" command, for this to take effect');
      return;
    }
    if (busy && next === null) {
      if (o.ridHeld === null || o.ridHeld === undefined) o.ridHeld = cur;
      o.rid = null;
      return;
    }
    o.rid = next;
    o.ridHeld = null;
  }

  // -- ping, traceroute, remote login ---------------------------------------------------
  ping(dst, source, count) {
    const net = this.net, dn = this.d.name;
    this.print("Type escape sequence to abort.", `Sending ${count}, 100-byte ICMP Echos to ${n2ip(dst)}, timeout is 2 seconds:`);
    if (source !== null) {
      if (!net.upIfs(dn).some((n) => net.ifAddr(dn, n).ip === source)) {
        this.print("% Invalid source address- IP address not on any of our up interfaces");
        return;
      }
      this.print(`Packet sent with a source address of ${n2ip(source)}`);
    }
    let marks = "", ok = 0, first = null;
    for (let i = 0; i < count; i++) {
      const r = net.ping(dn, dst, { source: source ?? undefined, record: true });
      first = first || r;
      if (r.ok && !(i === 0 && r.arpMiss)) { marks += "!"; ok++; continue; }
      const unreachable = !r.ok && r.by !== null && r.by !== undefined && r.failAt !== dn && (r.fail === "noroute" || r.fail === "acl");
      marks += unreachable && i % 2 === 0 ? "U" : ".";
    }
    for (let i = 0; i < marks.length; i += 70) this.print(marks.slice(i, i + 70));
    this.print(`Success rate is ${Math.floor((ok * 100) / count)} percent (${ok}/${count})${ok ? ", round-trip min/avg/max = 1/1/2 ms" : ""}`);
    this.anim = { from: dn, links: first.links, ok: first.ok, failAt: first.failAt };
  }

  pingFrom(dst, ifn) {
    this.withIf(ifn, 3, (n) => {
      const a = this.net.ifAddr(this.d.name, n);
      if (!a || !this.net.ifUp(this.d.name, n)) {
        this.print("% Invalid source interface - IP not enabled or interface is down");
        return;
      }
      this.ping(dst, a.ip, 5);
    });
  }

  traceroute(dst) {
    const net = this.net, dn = this.d.name;
    if (net.sourceIp(dn, dst) === null) { this.print("% No valid source address for destination"); return; }
    this.print("Type escape sequence to abort.", `Tracing the route to ${n2ip(dst)}`, "VRF info: (vrf in name/id, vrf out name/id)");
    net.trace(dn, dst, 30).forEach((h, i) => {
      const n = lpad(i + 1, 3);
      if (h.ip === null) this.print(`${n}  *  *  * `);
      else if (h.code) this.print(`${n} ${n2ip(h.ip)} !${h.code}  *  !${h.code} `);
      else this.print(`${n} ${n2ip(h.ip)} ${i + 1} msec ${i} msec ${i + 1} msec`);
    });
    const r = net.ping(dn, dst);
    this.anim = { from: dn, links: r.links, ok: r.ok, failAt: r.failAt };
  }

  remote(proto, ip, user) {
    const net = this.net, from = this.d.name;
    if (proto === "telnet") this.print(`Trying ${n2ip(ip)} ... `);
    if (this.frames.length >= 4) { this.print("% Connection refused: too many nested sessions; exit one first"); return; }
    const owner = net.ownerOf(ip);
    if (!owner || !net.ping(from, ip).ok) { this.print("% Connection timed out; remote host not responding"); return; }
    const t = net.devs[owner];
    if (t.type === "pc") { this.print("% Connection refused by remote host"); return; }
    const vty = t.cfg.lines.vty0;
    const allows = vty.transport === "all" || vty.transport.split(" ").includes(proto);
    if (!allows || (proto === "ssh" && !net.sshReady(owner))) { this.print("% Connection refused by remote host"); return; }
    const closed = () => this.print("", `[Connection to ${n2ip(ip)} closed by foreign host]`);
    const enter = (u) => {
      if (proto === "ssh" && t.cfg.banner) this.print("", t.cfg.banner, "");
      this.frames.push({ dev: owner, mode: "user", target: null, via: ip });
      t.rt.logins.push({ proto, user: u ?? null, from });
      if (t.rt.logins.length > 20) t.rt.logins.shift();
    };
    if (proto === "telnet") { this.print("Open"); if (t.cfg.banner) this.print(t.cfg.banner); }
    const check = (u, pw) => { const x = t.cfg.users[u]; return !!x && (x.secret ?? x.password) === pw; };
    if (vty.login === null) { enter(); return; }
    if (vty.login === "line") {
      if (vty.password === null) { this.print("", "", "Password required, but none set"); closed(); return; }
      if (proto === "telnet") this.print("", "", "User Access Verification", "");
      let tries = 0;
      const ask = () => this.ask("Password: ", { mask: true }, (pw) => {
        if (pw === vty.password) { enter(); return; }
        if (++tries >= 3) { this.print("% Bad passwords"); closed(); return; }
        ask();
      });
      ask();
      return;
    }
    let tries = 0;
    if (proto === "ssh") {
      const ask = () => this.ask("Password: ", { mask: true }, (pw) => {
        if (check(user, pw)) { enter(user); return; }
        if (++tries >= 3) { this.print("% Authentication failed."); closed(); return; }
        ask();
      });
      ask();
      return;
    }
    this.print("", "", "User Access Verification", "");
    const askUser = () => this.ask("Username: ", {}, (u) => this.ask("Password: ", { mask: true }, (pw) => {
      if (check(u.trim(), pw)) { enter(u.trim()); return; }
      this.print("", "% Login invalid", "");
      if (++tries >= 3) { closed(); return; }
      askUser();
    }));
    askUser();
  }

  // -- the VPCS-style PC console ------------------------------------------------------
  vpcs(line) {
    const w = line.trim().split(/\s+/).filter(Boolean);
    if (!w.length) return;
    this.history.push(line.trim());
    const c = this.d.cfg, cmd = w[0].toLowerCase(), sub = (w[1] || "").toLowerCase();
    const bad = () => this.print(`Bad command: "${line.trim()}". Use ? for help.`);
    if (cmd === "?" || cmd === "help") this.print(VPCS_HELP);
    else if (cmd === "ip") {
      if (!sub) this.print("Usage: ip ADDRESS[/LEN] [GATEWAY] [MASK]   or   ip dhcp");
      else if (sub === "dhcp" || sub === "-d") this.vpcsDhcp();
      else this.vpcsIp(w.slice(1));
    } else if (cmd === "dhcp") this.vpcsDhcp();
    else if (cmd === "show") {
      if (!sub || "ip".startsWith(sub)) this.vpcsShow();
      else if ("arp".startsWith(sub)) this.vpcsArp();
      else bad();
    } else if (cmd === "ping") this.vpcsPing(w);
    else if (cmd === "trace" || cmd === "tracert") this.vpcsTrace(w);
    else if (cmd === "clear" && sub === "ip") {
      Object.assign(c, { ip: null, mask: null, gw: null, dns: null, dhcp: false, dhcpServer: null });
      this.print("IPv4 address/mask, gateway, DNS, and DHCP cleared");
    } else if (cmd === "arp") this.vpcsArp();
    else if (cmd === "save") this.print("Saving startup configuration to startup.vpc", ".  done");
    else bad();
  }

  vpcsShow() {
    const c = this.d.cfg;
    this.print("", `NAME        : ${c.hostname}[1]`, `IP/MASK     : ${c.ip === null ? "0.0.0.0/0" : n2ip(c.ip) + "/" + maskLen(c.mask)}`,
      `GATEWAY     : ${c.gw === null ? "0.0.0.0" : n2ip(c.gw)}`, `DNS         : ${c.dns === null ? "" : n2ip(c.dns)}`,
      ...(c.dhcp ? [`DHCP SERVER : ${n2ip(c.dhcpServer)}`] : []), `MAC         : ${colonMac(this.net.mac(this.d.name, "eth0"))}`,
      "MTU         : 1500", "");
  }

  vpcsArp() {
    const rows = Object.entries(this.d.rt.arp);
    if (!rows.length) { this.print("", "arp table is empty", ""); return; }
    this.print("", ...rows.map(([ip, e]) => `${colonMac(e.mac)}  ${ip} expires in 117 seconds`), "");
  }

  vpcsIp(args) {
    const c = this.d.cfg, net = this.net;
    const m = /^(\d+\.\d+\.\d+\.\d+)(?:\/(\d{1,2}))?$/.exec(args[0]);
    if (!m || !isIp(m[1])) { this.print("Invalid address"); return; }
    let len = m[2] !== undefined ? +m[2] : null, gw = null;
    for (const x of args.slice(1)) {
      if (/^\d{1,2}$/.test(x)) len = +x;
      else if (isIp(x) && ip2n(x) >>> 24 === 255 && maskLen(ip2n(x)) > 0) len = maskLen(ip2n(x));
      else if (isIp(x)) gw = ip2n(x);
      else { this.print("Invalid options"); return; }
    }
    if (len === null) len = 24;
    if (len < 1 || len > 30) { this.print("Invalid netmask"); return; }
    const ip = ip2n(m[1]), mask = lenMask(len);
    if (and(ip, mask) === ip || ((ip | ~mask) >>> 0) === ip) { this.print("Invalid host address"); return; }
    if (gw === ip) { this.print("Gateway can't be the PC's own address"); return; }
    this.print("Checking for duplicate address...");
    const dup = net.flood(this.d.name, "eth0").find((e) => {
      const a = net.ifAddr(e.dev, e.ifn);
      return a && a.ip === ip && net.ifUp(e.dev, e.ifn);
    });
    if (dup) { this.print(`${n2ip(ip)} is being used by MAC ${colonMac(net.mac(dup.dev, dup.ifn))}`, "Address not changed"); return; }
    Object.assign(c, { ip, mask, gw, dhcp: false, dhcpServer: null });
    this.print(`${c.hostname} : ${n2ip(ip)} ${n2ip(mask)}${gw !== null ? " gateway " + n2ip(gw) : ""}`);
  }

  vpcsDhcp() {
    const r = this.net.dhcp(this.d.name);
    if (r.ok) this.print(`DDORA IP ${n2ip(r.ip)}/${maskLen(r.mask)}${r.gw !== null ? " GW " + n2ip(r.gw) : ""}`);
    else this.print("DDD", "Can't find dhcp server");
  }

  vpcsPing(w) {
    const net = this.net, dn = this.d.name, c = this.d.cfg;
    if (!w[1] || !isIp(w[1])) { this.print("Invalid address"); return; }
    let count = 5;
    const ci = w.indexOf("-c");
    if (ci > 0) {
      count = +w[ci + 1];
      if (!Number.isInteger(count) || count < 1 || count > 100) { this.print("Invalid count, use -c 1-100"); return; }
    }
    const dst = ip2n(w[1]);
    let first = null;
    for (let i = 1; i <= count; i++) {
      const r = net.ping(dn, dst, { record: true });
      first = first || r;
      if (r.ok && !(i === 1 && r.arpMiss)) { this.print(`84 bytes from ${w[1]} icmp_seq=${i} ttl=${r.ttl} time=${ms()} ms`); continue; }
      if (!r.ok && r.fail === "nogw") { this.print("No gateway found"); break; }
      if (!r.ok && (r.fail === "noip" || (r.fail === "arp" && r.failAt === dn))) {
        const nh = c.ip !== null && sameNet(dst, c.ip, c.mask) ? dst : c.gw ?? dst;
        this.print(`host (${n2ip(nh)}) not reachable`);
        break;
      }
      if (!r.ok && r.by !== null && r.by !== undefined && r.failAt !== dn && (r.fail === "noroute" || r.fail === "acl")) {
        const [code, text] = r.fail === "acl" ? [13, "Communication administratively prohibited"] : [0, "Destination network unreachable"];
        this.print(`*${n2ip(r.by)} icmp_seq=${i} ttl=255 time=${ms()} ms (ICMP type:3, code:${code}, ${text})`);
        continue;
      }
      this.print(`${w[1]} icmp_seq=${i} timeout`);
    }
    this.anim = { from: dn, links: first.links, ok: first.ok, failAt: first.failAt };
  }

  vpcsTrace(w) {
    const net = this.net, dn = this.d.name;
    if (!w[1] || !isIp(w[1])) { this.print("Invalid address"); return; }
    const dst = ip2n(w[1]);
    this.print(`trace to ${w[1]}, 8 hops max, press Ctrl+C to stop`);
    const hops = net.trace(dn, dst, 8);
    if (!hops.length) { this.print("host not reachable"); return; }
    hops.forEach((h, i) => {
      const n = lpad(i + 1, 2);
      if (h.ip === null) this.print(`${n}   *  *  *`);
      else if (h.code) this.print(`${n}   *${n2ip(h.ip)}   ${ms()} ms (ICMP type:3, code:${h.code === "A" ? 13 : 1}, ${h.code === "A" ? "Communication administratively prohibited" : "Destination host unreachable"})`);
      else if (h.last) this.print(`${n}   *${n2ip(h.ip)}   ${ms()} ms (ICMP type:3, code:3, Destination port unreachable)`);
      else this.print(`${n}   ${n2ip(h.ip)}   ${ms()} ms  ${ms()} ms  ${ms()} ms`);
    });
    const r = net.ping(dn, dst);
    this.anim = { from: dn, links: r.links, ok: r.ok, failAt: r.failAt };
  }
}

// Apply a list of lines to a device as if typed at a fresh console, starting in
// global configuration mode for IOS devices. Throws on any error so broken lab
// definitions fail loudly in tests.
export function applyConfig(net, devName, lines) {
  const s = new Session(net, devName);
  s.loggedOut = false;
  if (net.devs[devName].type !== "pc") s.frames[0].mode = "config";
  for (const line of lines) {
    const out = s.input(line);
    const notes = /^% (Access VLAN does not exist|Login disabled|OSPF: Reference|The key modulus|Generating)/;
    if (out.split("\n").some((l) => (l.startsWith("%") && !notes.test(l)) || /^(Bad mask|Bad command|Invalid address|Command rejected)/.test(l))) {
      throw new Error(`${devName}: "${line}" -> ${out}`);
    }
  }
  if (s.pending) throw new Error(`${devName}: configuration ends at an open prompt: ${s.pending.prompt}`);
  return s;
}

// A lab's network: from saved state when there is some, otherwise from its starting configs.
export function buildLab(lab, state) {
  if (state) return new Network(lab, state);
  const net = new Network(lab);
  for (const [dev, lines] of Object.entries(lab.initial)) applyConfig(net, dev, lines);
  return net;
}
