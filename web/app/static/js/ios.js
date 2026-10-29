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
// IPv6 addresses are BigInts in calculations and IOS-style strings ("2001:DB8::1") in configuration.
export function parse6(s) {
  if (typeof s !== "string" || !/^[0-9A-Fa-f:.]+$/.test(s) || !s.includes(":")) return null;
  const v4 = /^(.*:)(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (v4) {
    if (!isIp(v4[2])) return null;
    const n = ip2n(v4[2]);
    s = v4[1] + (n >>> 16).toString(16) + ":" + (n & 0xffff).toString(16);
  }
  const parts = s.split("::");
  if (parts.length > 2) return null;
  const groups = (x) => (x === "" ? [] : x.split(":"));
  const head = groups(parts[0]), tail = parts.length === 2 ? groups(parts[1]) : [];
  if ([...head, ...tail].some((g) => !/^[0-9A-Fa-f]{1,4}$/.test(g))) return null;
  const n = head.length + tail.length;
  if (parts.length === 2 ? n > 7 : n !== 8) return null;
  return [...head, ...Array(8 - n).fill("0"), ...tail].reduce((a, g) => (a << 16n) | BigInt(parseInt(g, 16)), 0n);
}
export function fmt6(n) {
  const g = [];
  for (let i = 7; i >= 0; i--) g.push(Number((n >> BigInt(i * 16)) & 0xffffn));
  let at = -1, run = 0;
  for (let i = 0; i < 8;) {
    if (g[i] !== 0) { i++; continue; }
    let j = i;
    while (j < 8 && g[j] === 0) j++;
    if (j - i >= 2 && j - i > run) { at = i; run = j - i; }
    i = j;
  }
  const h = (a) => a.map((x) => x.toString(16).toUpperCase()).join(":");
  return at < 0 ? h(g) : h(g.slice(0, at)) + "::" + h(g.slice(at + run));
}
const ALL6 = (1n << 128n) - 1n;
export const mask6 = (len) => (len === 0 ? 0n : ALL6 ^ ((1n << BigInt(128 - len)) - 1n));
const net6 = (a, len) => a & mask6(len);
const isLL = (a) => (a >> 118n) === 0x3fan; // FE80::/10
// The EUI-64 interface ID made from a MAC address: FFFE in the middle, the U/L bit flipped.
function eui64(mac) {
  const h = mac.replace(/\./g, "");
  const first = (parseInt(h.slice(0, 2), 16) ^ 2).toString(16).padStart(2, "0");
  return BigInt("0x" + first + h.slice(2, 6) + "fffe" + h.slice(6));
}
const linkLocal = (mac) => (0xfe80n << 112n) | eui64(mac);

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
const IF_TYPES = { router: ["GigabitEthernet", "Loopback"], switch: ["FastEthernet", "GigabitEthernet", "Port-channel", "Vlan"] };
const IF_HELP = {
  GigabitEthernet: "GigabitEthernet IEEE 802.3z", FastEthernet: "FastEthernet IEEE 802.3",
  Loopback: "Loopback interface", Vlan: "Catalyst Vlans", "Port-channel": "Ethernet Channel of interfaces",
};
const SHORT = { GigabitEthernet: "Gi", FastEthernet: "Fa", Loopback: "Lo", Vlan: "Vl", "Port-channel": "Po" };
export const shortIf = (n) => n.replace(/^[A-Za-z-]+/, (t) => SHORT[t] || t);
const ifType = (n) => (/^[A-Za-z-]+/.exec(n) || [""])[0];
const physOf = (n) => n.split(".")[0];
const isSub = (n) => n.includes(".");
const isPo = (n) => n.startsWith("Port-channel");
const poNum = (n) => +n.slice(12);
const RANK = { Vlan: 0, "Port-channel": 0.5, FastEthernet: 1, GigabitEthernet: 2, Loopback: 3, eth: 4 };

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
      : t === "Port-channel" ? /^\d{1,2}$/.test(num) && +num >= 1 && +num <= 48
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
  const base = { desc: "", shut: false, ip: null, mask: null, cdp: true, bw: null, speed: null, duplex: null, svc: newSvcIf() };
  if (type === "router") {
    return { ...base, shut: PORTS.router.includes(name), secondary: [], helpers: [], aclIn: null, aclOut: null, ospf: {}, encap: null,
      delay: null, nat: null, standby: {}, hsrpVer: 1, ipv6: { addrs: [], ll: null, enable: false, auto: false }, ospf6: {} };
  }
  if (name.startsWith("Vlan")) return { ...base, shut: name === "Vlan1" };
  return { ...base, mode: "dynamic auto", accessVlan: 1, native: 1, allowed: null, noneg: false,
    stp: { portfast: null, bpduguard: null, cost: null, prio: null, vcost: {} }, chan: null, psec: null };
}

const newLine = (vty) => ({ password: null, login: vty ? "line" : null, transport: "all", timeout: null, sync: false, authList: null });

function defaultCfg(type, name) {
  if (type === "pc") return { hostname: name, ip: null, mask: null, gw: null, dns: null, dhcp: false, dhcpServer: null, ip6: null };
  const cfg = {
    hostname: type === "router" ? "Router" : "Switch",
    enableSecret: null, enablePassword: null, pwEnc: false, banner: "", domainLookup: true, domain: "",
    users: {}, rsa: 0, sshVer: null, cdp: true, intfs: {},
    lines: { con: newLine(false), vty0: newLine(true) },
    tz: null, svc: newSvc(),
  };
  for (const p of PORTS[type]) cfg.intfs[p] = newIntf(type, p);
  if (type === "router") {
    Object.assign(cfg, { routes: [], ospf: null, acls: {}, dhcp: { excluded: [], pools: {} },
      nat: { statics: [], dyn: [], pools: {} }, eigrp: null, tracks: {}, ipv6Routing: false, routes6: [], ospf6: null });
  } else {
    cfg.lines.vty5 = newLine(true);
    cfg.intfs.Vlan1 = newIntf(type, "Vlan1");
    Object.assign(cfg, { vlans: { 1: "default" }, gateway: null,
      stp: { mode: "pvst", prio: {}, pfDefault: false, bgDefault: false } });
  }
  return cfg;
}

// Fill in settings added since a state was saved, so older saves load and compare cleanly.
function normCfg(type, name, cfg) {
  const out = Object.assign(defaultCfg(type, name), cfg);
  if (type === "pc") return out;
  if (!cfg.svc) { delete out.svc; svcMigrate(out); }
  for (const l of Object.values(out.lines)) if (l.authList === undefined) l.authList = null;
  for (const [n, i] of Object.entries(out.intfs)) out.intfs[n] = Object.assign(newIntf(type, n), i);
  if (type === "router" && out.ospf) out.ospf = { redistStatic: false, redistSubnets: false, ...out.ospf };
  return out;
}

const newRuntime = () => ({ mac: {}, arp: {}, bindings: {}, hits: {}, logins: [], errdis: {}, psec: {}, nat: [],
  natStats: { hits: 0, misses: 0 }, hsrp: {}, nd: {}, svc: newSvcRt() });

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
        d.cfg = normCfg(d.type, name, s.cfg);
        for (const p of d.ports) if (d.type !== "pc" && !d.cfg.intfs[p]) d.cfg.intfs[p] = newIntf(d.type, p);
        d.startup = s.startup ? normCfg(d.type, name, s.startup) : null;
        d.rt = Object.assign(newRuntime(), s.rt);
      }
    }
    this.pend = {};
    this.touch();
  }

  touch() { this.c = { flood: {}, routes: {}, routes6: {}, stp: {} }; }

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
    if (isPo(ifn)) {
      const first = d.ports.find((p) => d.cfg.intfs[p].chan && d.cfg.intfs[p].chan.group === poNum(ifn));
      return first ? this.mac(dn, first) : dotted("0cd5" + hex(d.idx, 2) + "00" + hex(0x40 + poNum(ifn), 4));
    }
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

  errdis(dn, port) { const d = this.devs[dn]; return d.type === "switch" ? d.rt.errdis[port] || null : null; }

  // The cable itself: both ends enabled and neither err-disabled.
  portUp(dn, port) {
    const p = this.peer(dn, port);
    if (!p || !this.adminUp(dn, port) || !this.adminUp(p.dev, p.port) || this.errdis(dn, port) || this.errdis(p.dev, p.port)) return false;
    // Two ends forced to different speeds never bring the link up.
    const sp = (x, n) => (this.devs[x].type === "pc" ? null : this.devs[x].cfg.intfs[n].speed);
    return !(sp(dn, port) && sp(p.dev, p.port) && sp(dn, port) !== sp(p.dev, p.port));
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
    else if (isPo(ifn)) up = this.lup(dn, ifn);
    else up = this.portUp(dn, physOf(ifn));
    return { status: up ? "up" : "down", proto: up ? "up" : "down" };
  }

  ifUp(dn, ifn) { return this.ifState(dn, ifn).proto === "up"; }

  // Autostate: an SVI is up while some port in its VLAN is up and forwarding.
  sviUp(d, v) {
    if (!d.cfg.vlans[v]) return false;
    return this.l2ports(d).some((p) => this.lup(d.name, p) && this.carries(d, p, v) && this.stpFwd(d.name, p, v));
  }

  // -- EtherChannel -----------------------------------------------------------
  // Per switch: each member port's flag as `show etherchannel summary` prints it (P bundled,
  // I stand-alone, s suspended, D down) and each port-channel's state and partner.
  ec() {
    if (this.c.ec) return this.c.ec;
    const st = {};
    const proto = (m) => (m === "on" ? "on" : m === "active" || m === "passive" ? "lacp" : "pagp");
    const pairs = (a, b) => (a === "on" && b === "on") || (proto(a) === proto(b) && proto(a) !== "on"
      && (a === "active" || b === "active" || a === "desirable" || b === "desirable"));
    const sws = Object.values(this.devs).filter((d) => d.type === "switch");
    for (const d of sws) {
      const s = st[d.name] = { members: {}, po: {} };
      const kind = {};
      for (const p of d.ports) {
        const ch = d.cfg.intfs[p].chan;
        if (!ch) continue;
        const po = d.cfg.intfs["Port-channel" + ch.group];
        kind[ch.group] = kind[ch.group] || ifType(p);
        let flag = null;
        if (!this.portUp(d.name, p)) flag = "D";
        else if (!po || !sameL2(d.cfg.intfs[p], po) || ifType(p) !== kind[ch.group]) flag = "s";
        s.members[p] = { group: ch.group, mode: ch.mode, proto: proto(ch.mode), flag, cand: null };
      }
    }
    // Negotiation across each cable.
    for (const d of sws) {
      for (const [p, m] of Object.entries(st[d.name].members)) {
        if (m.flag) continue;
        const pr = this.peer(d.name, p);
        const o = this.devs[pr.dev].type === "switch" ? st[pr.dev].members[pr.port] : null;
        if (o && pairs(m.mode, o.mode) && o.flag === null) m.cand = { dev: pr.dev, group: o.group };
        else m.flag = m.mode === "on" || (o && pairs(m.mode, o.mode)) ? "s" : "I";
      }
    }
    // Every member of a bundle must reach the same partner bundle, and the partner must agree.
    const partner = {};
    for (const d of sws) {
      for (const p of d.ports) {
        const m = st[d.name].members[p];
        if (!m || !m.cand) continue;
        const k = d.name + "|" + m.group;
        if (!partner[k]) partner[k] = m.cand;
      }
    }
    for (const d of sws) {
      for (const m of Object.values(st[d.name].members)) {
        if (!m.cand) continue;
        const mine = partner[d.name + "|" + m.group], theirs = partner[m.cand.dev + "|" + m.cand.group];
        const ok = mine.dev === m.cand.dev && mine.group === m.cand.group && theirs && theirs.dev === d.name && theirs.group === m.group;
        m.flag = ok ? "P" : "s";
      }
    }
    for (const d of sws) {
      for (const n of Object.keys(d.cfg.intfs).filter(isPo)) {
        const g = poNum(n), mem = Object.entries(st[d.name].members).filter(([, m]) => m.group === g);
        const bundled = mem.filter(([, m]) => m.flag === "P");
        const pt = partner[d.name + "|" + g];
        const far = pt && bundled.length ? this.devs[pt.dev].cfg.intfs["Port-channel" + pt.group] : null;
        st[d.name].po[g] = {
          up: !!far && !d.cfg.intfs[n].shut && !far.shut, members: mem.map(([p]) => p), bundled: bundled.length,
          proto: mem.length ? mem[0][1].proto : null, partner: pt ? { dev: pt.dev, port: "Port-channel" + pt.group } : null,
        };
      }
    }
    this.c.ec = st;
    return st;
  }

  member(dn, port) { const d = this.devs[dn]; return d.type === "switch" ? this.ec()[dn].members[port] || null : null; }

  // The ports a switch forwards frames on: port-channels, plus physical ports not bundled into one.
  l2ports(d) {
    const ec = this.ec()[d.name];
    return d.ports.filter((p) => !ec.members[p] || ec.members[p].flag === "I")
      .concat(Object.keys(d.cfg.intfs).filter(isPo).sort(ifSort));
  }

  // The far end of a logical link (a port-channel's partner bundle, or the cable's other end).
  lpeer(dn, port) {
    if (isPo(port)) {
      const po = this.ec()[dn].po[poNum(port)];
      return po && po.partner;
    }
    return this.peer(dn, port);
  }

  // Can frames cross this logical link? Bundled or suspended members carry nothing on their own.
  lup(dn, port) {
    if (isPo(port)) {
      const po = this.devs[dn].type === "switch" && this.ec()[dn].po[poNum(port)];
      return !!po && po.up;
    }
    if (!this.portUp(dn, port)) return false;
    const mine = this.member(dn, port), pr = this.peer(dn, port), far = this.member(pr.dev, pr.port);
    return (!mine || mine.flag === "I") && (!far || far.flag === "I");
  }

  // -- switching --------------------------------------------------------------
  // The operational mode of a switch port, including DTP negotiation with the far end.
  swMode(d, port) {
    const m = this.member(d.name, port);
    if (m && m.flag === "P") return this.swMode(d, "Port-channel" + m.group);
    const c = d.cfg.intfs[port];
    if (c.mode === "access" || c.mode === "trunk") return c.mode;
    const p = this.lpeer(d.name, port);
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

  // -- spanning tree -----------------------------------------------------------
  bridgeId(d, v) {
    const prio = d.cfg.stp.prio[v] ?? 32768;
    return [prio + v, "0cd5" + hex(d.idx, 2) + "008000"];
  }

  portId(d, p) {
    const s = d.cfg.intfs[p].stp;
    return { prio: (s && s.prio) ?? 128, num: isPo(p) ? 64 + poNum(p) : d.ports.indexOf(p) + 1 };
  }

  stpCost(d, p, v) {
    const s = d.cfg.intfs[p].stp || {};
    if (s.vcost && s.vcost[v] !== undefined) return s.vcost[v];
    if (s.cost) return s.cost;
    if (isPo(p)) {
      const po = this.ec()[d.name].po[poNum(p)], n = Math.max(1, po ? po.bundled : 1);
      const fast = po && po.members.length && ifType(po.members[0]) === "FastEthernet";
      return fast ? [19, 12, 9, 8, 7, 6, 5, 5][Math.min(n, 8) - 1] : n >= 2 ? 3 : 4;
    }
    return ifType(p) === "FastEthernet" ? 19 : 4;
  }

  portfast(d, p) {
    const s = d.cfg.intfs[p].stp;
    if (!s) return false;
    if (s.portfast !== null) return s.portfast;
    return d.cfg.stp.pfDefault && this.swMode(d, p) === "access";
  }

  bpduGuard(d, p) {
    const s = d.cfg.intfs[p].stp;
    if (!s || s.bpduguard === false) return false;
    return s.bpduguard === true || (d.cfg.stp.bgDefault && this.portfast(d, p));
  }

  // One spanning-tree instance per VLAN (PVST+ and Rapid PVST+ both run one per VLAN). Returns
  // {switch: {bid, root, cost, rootPort, ports: {port: {role, state, cost, pid, type, inc}}}}.
  stp(v) {
    if (this.c.stp[v]) return this.c.stp[v];
    const out = {};
    const sws = Object.values(this.devs).filter((d) => d.type === "switch" && d.cfg.vlans[v]);
    for (const d of sws) {
      const ports = this.l2ports(d).filter((p) => this.lup(d.name, p) && this.egressTag(d, p, v) !== undefined);
      if (!ports.length) continue;
      const s = out[d.name] = { bid: this.bridgeId(d, v), ports: {} };
      for (const p of ports) {
        const pid = this.portId(d, p);
        s.ports[p] = { cost: this.stpCost(d, p, v), pid, peer: null, inc: null, edge: this.portfast(d, p) };
      }
    }
    // Which links carry this VLAN's BPDUs both ways, and which disagree about it.
    for (const [dn, s] of Object.entries(out)) {
      const d = this.devs[dn];
      for (const [p, ps] of Object.entries(s.ports)) {
        const pr = this.lpeer(dn, p), pd = pr && this.devs[pr.dev];
        if (!pd || pd.type !== "switch") continue;
        ps.edge = false;
        const mine = this.swMode(d, p), theirs = this.swMode(pd, pr.port);
        if (mine === "access" && theirs === "trunk") { ps.inc = "TYPE_Inc"; continue; }
        if (mine === "trunk" && theirs === "trunk") {
          const a = d.cfg.intfs[p].native, b = pd.cfg.intfs[pr.port].native;
          if (a !== b && (v === a || v === b)) { ps.inc = "PVID_Inc"; continue; }
        }
        const t = out[pr.dev];
        if (t && t.ports[pr.port] && this.ingressVlan(pd, pr.port, this.egressTag(d, p, v)) === v) ps.peer = pr;
      }
    }
    // Root election and root ports: each switch keeps the best (root, cost, sender, port) it hears.
    const names = Object.keys(out);
    for (const n of names) out[n].best = [...out[n].bid, 0, ...out[n].bid, 0, 0];
    for (let round = 0; round <= names.length * 2; round++) {
      const prev = Object.fromEntries(names.map((n) => [n, out[n].best]));
      let changed = false;
      for (const n of names) {
        const s = out[n];
        let best = [...s.bid, 0, ...s.bid, 0, 0], rp = null;
        for (const [p, ps] of Object.entries(s.ports)) {
          if (!ps.peer || ps.inc) continue;
          const t = out[ps.peer.dev], tp = t.ports[ps.peer.port];
          if (tp.inc) continue;
          const pb = prev[ps.peer.dev];
          const cand = [pb[0], pb[1], pb[2] + ps.cost, ...t.bid, pidKey(tp.pid), pidKey(ps.pid)];
          if (cmpVec(cand, best) < 0) { best = cand; rp = p; }
        }
        if (cmpVec(best, s.best) !== 0) changed = true;
        s.best = best;
        s.rootPort = rp;
      }
      if (!changed) break;
    }
    for (const s of Object.values(out)) {
      s.root = [s.best[0], s.best[1]];
      s.cost = s.best[2];
      for (const [p, ps] of Object.entries(s.ports)) {
        if (ps.inc) { Object.assign(ps, { role: "Desg", state: "BKN" }); continue; }
        if (p === s.rootPort) { Object.assign(ps, { role: "Root", state: "FWD" }); continue; }
        const t = ps.peer && out[ps.peer.dev], tp = t && t.ports[ps.peer.port];
        if (!tp || tp.inc) { Object.assign(ps, { role: "Desg", state: "FWD" }); continue; }
        const mine = [...s.root, s.cost, ...s.bid, pidKey(ps.pid)];
        const theirs = [t.best[0], t.best[1], t.best[2], ...t.bid, pidKey(tp.pid)];
        Object.assign(ps, cmpVec(mine, theirs) < 0 ? { role: "Desg", state: "FWD" } : { role: "Altn", state: "BLK" });
      }
    }
    this.c.stp[v] = out;
    return out;
  }

  // Does this switch port forward VLAN v? Ports that STP isn't running on forward by default.
  stpFwd(dn, port, v) {
    const s = this.stp(v)[dn];
    const ps = s && s.ports[port];
    return !ps || ps.state === "FWD";
  }

  // Every L3 interface in the same broadcast domain as dn/ifn, with the cable path to it.
  flood(dn, ifn) {
    const key = dn + "|" + ifn;
    if (this.c.flood[key]) return this.c.flood[key];
    const out = [], q = [], seen = new Set();
    const send = (from, port, tag, trail) => {
      if (!this.lup(from, port)) return;
      const p = this.lpeer(from, port);
      q.push({ dn: p.dev, port: p.port, tag, trail: trail.concat([{ a: from, ap: port, b: p.dev, bp: p.port, vlan: null }]) });
    };
    const swFlood = (sdn, v, inPort, trail) => {
      if (seen.has(sdn + "|" + v)) return;
      seen.add(sdn + "|" + v);
      const sd = this.devs[sdn];
      if (trail.length) trail = trail.slice(0, -1).concat([{ ...trail[trail.length - 1], vlan: v }]);
      if (sd.cfg.intfs["Vlan" + v]) out.push({ dev: sdn, ifn: "Vlan" + v, trail });
      for (const port of this.l2ports(sd)) {
        if (port === inPort || !this.stpFwd(sdn, port, v)) continue;
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
        if (v !== null && this.stpFwd(f.dn, f.port, v)) swFlood(f.dn, v, f.port, f.trail);
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

  // Primary and secondary addresses of an interface.
  ifAddrs(dn, ifn) {
    const a = this.ifAddr(dn, ifn);
    const d = this.devs[dn], sec = d.type === "pc" ? [] : (d.cfg.intfs[ifn].secondary || []);
    return [...(a ? [a] : []), ...sec];
  }

  l3Ifs(dn) {
    const d = this.devs[dn];
    if (d.type === "pc") return d.cfg.ip === null ? [] : ["eth0"];
    return Object.keys(d.cfg.intfs).filter((n) => d.cfg.intfs[n].ip !== null).sort(ifSort);
  }

  upIfs(dn) { return this.l3Ifs(dn).filter((n) => this.ifUp(dn, n)); }

  // An HSRP active router answers for the virtual IP as well as its own addresses.
  ownsIp(dn, ip) { return this.upIfs(dn).some((n) => this.ifAddrs(dn, n).some((a) => a.ip === ip)) || this.vipIf(dn, ip) !== null; }

  // The interface on which dn is HSRP active for virtual IP ip, or null.
  vipIf(dn, ip) {
    const d = this.devs[dn];
    if (d.type !== "router") return null;
    for (const [k, h] of Object.entries(d.rt.hsrp)) {
      const ifn = k.split("|")[0];
      if (h.state === "Active" && h.vip === ip && this.ifUp(dn, ifn)) return ifn;
    }
    return null;
  }

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
    if (isPo(ifn)) {
      const po = this.ec()[d.name].po[poNum(ifn)];
      const mem = po ? po.members.filter((p) => this.member(d.name, p).flag === "P") : [];
      return mem.reduce((s, p) => s + this.bandwidth(d, p), 0) || 100000;
    }
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
    ospfElect(per);
    for (const [src, me] of Object.entries(per)) {
      const { dist, hops } = ospfSpf(per, src);
      const myAreas = new Set(me.ifs.map((x) => x.area));
      const best = {};
      const offer = (key, r) => {
        const cur = best[key];
        if (!cur || r.metric < cur.metric || (r.metric === cur.metric && (r.dist ?? 0) < (cur.dist ?? 0))) best[key] = r;
        else if (r.metric === cur.metric && (r.dist ?? 0) === (cur.dist ?? 0)) {
          for (const h of r.paths) if (!cur.paths.some((p) => p.ip === h.ip)) cur.paths.push(h);
        }
      };
      for (const [x, them] of Object.entries(per)) {
        if (x === src || dist[x] === undefined) continue;
        for (const oi of them.ifs) {
          const host = oi.loop && !oi.ptp;
          const len = host ? 32 : maskLen(oi.mask);
          const net = host ? oi.ip : and(oi.ip, oi.mask);
          offer(net + "/" + len, { code: myAreas.has(oi.area) ? "O" : "O IA", net, len, metric: dist[x] + oi.cost, paths: [...hops[x]] });
        }
        const o = this.devs[x].cfg.ospf;
        if (o.defaultOriginate && (o.defaultAlways || this.hasStaticDefault(x))) {
          offer("0/0", { code: "O*E2", net: 0, len: 0, metric: 1, dist: dist[x], paths: [...hops[x]] });
        }
        // Redistributed static routes arrive as type-2 externals: the seed metric (20) doesn't grow.
        if (o.redistStatic) {
          for (const r of this.liveStatics(x)) {
            if (r.len === 0 || (!o.redistSubnets && majorNet(r.net).len !== r.len)) continue;
            offer(r.net + "/" + r.len, { code: "O E2", net: r.net, len: r.len, metric: 20, dist: dist[x], paths: [...hops[x]] });
          }
        }
      }
      me.routes = Object.values(best);
    }
    this.c.ospf = per;
    return per;
  }

  // Static routes whose next hop is directly reachable (or exit interface up): what gets redistributed.
  liveStatics(dn) {
    const d = this.devs[dn];
    return d.cfg.routes.filter((r) => (r.ifn ? this.ifUp(dn, r.ifn)
      : this.upIfs(dn).some((n) => { const a = this.ifAddr(dn, n); return sameNet(a.ip, r.nh, a.mask); })));
  }

  hasStaticDefault(dn) { return this.liveStatics(dn).some((r) => r.net === 0 && r.len === 0); }

  // -- routing ----------------------------------------------------------------
  routes(dn) {
    // While BGP works out its sessions and next hops it sees the table without BGP routes in it.
    const key = this.c.bgpBusy ? dn + "|igp" : dn;
    if (this.c.routes[key]) return this.c.routes[key];
    const d = this.devs[dn], cands = [];
    for (const ifn of this.upIfs(dn)) {
      for (const { ip, mask } of this.ifAddrs(dn, ifn)) {
        const len = maskLen(mask);
        cands.push({ code: "C", net: and(ip, mask), len, ad: 0, metric: 0, ifn });
        if (len < 32) cands.push({ code: "L", net: ip, len: 32, ad: 0, metric: 0, ifn });
      }
    }
    const ospf = this.ospf()[dn];
    if (ospf) for (const r of ospf.routes) cands.push({ ...r, ad: 110 });
    const eigrp = this.eigrp()[dn];
    if (eigrp) for (const r of eigrp.routes) cands.push(r);
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
    if (!this.c.bgpBusy && d.type === "router" && d.cfg.bgp) table = select([...table, ...this.bgpRoutes(dn)]);
    table.sort((a, b) => a.net - b.net || a.len - b.len);
    this.c.routes[key] = table;
    return table;
  }

  lookup(dn, ip) { return lpm(this.routes(dn), ip); }

  // Where a router sends a packet for dst: {ifn, nh, proxy} or {fail}.
  routerEgress(dn, dst, depth = 0) {
    const r = this.lookup(dn, dst);
    if (!r) return { fail: "noroute" };
    if (r.code === "C" || r.code === "L") return { ifn: r.ifn, nh: dst };
    const p = r.paths[0];
    if (p.ifn === "Null0") return { fail: "null0" };
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
  // Carry one packet hop by hop. Returns {ok, at, pkt, links, hops, fail, failAt, arpMiss}; pkt is the
  // packet as it ended up (NAT may have rewritten its addresses on the way).
  deliver(src, pkt, opts = {}) {
    pkt = { ...pkt };
    const res = { ok: false, links: [], hops: [], arpMiss: false, pkt };
    let cur = src, originated = true, ttl = pkt.ttl ?? 255, inIf = null;
    for (let n = 0; n < 40; n++) {
      const d = this.devs[cur];
      // NAT outside-to-inside happens before routing.
      if (!originated && d.type === "router" && d.cfg.intfs[inIf].nat === "outside") this.natInbound(cur, pkt, opts);
      if (this.ownsIp(cur, pkt.dst)) {
        res.ok = true;
        res.at = cur;
        if (opts.record && pkt.proto === "icmp" && d.rt.debug && d.rt.debug.icmp) {
          if (pkt.icmp === "echo") this.note(cur, `ICMP: echo reply sent, src ${n2ip(pkt.dst)}, dst ${n2ip(pkt.src)}, topology BASE, dscp 0 topoid 0`);
          if (pkt.icmp === "echo-reply") this.note(cur, `ICMP: echo reply rcvd, src ${n2ip(pkt.src)}, dst ${n2ip(pkt.dst)}, topology BASE, dscp 0 topoid 0`);
        }
        return res;
      }
      if (!originated) {
        if (d.type !== "router") return { ...res, fail: "drop", failAt: cur };
        if (--ttl <= 0) return { ...res, fail: "ttl", failAt: cur };
      }
      const eg = d.type === "router" ? this.routerEgress(cur, pkt.dst) : this.hostEgress(cur, pkt.dst);
      if (eg.fail) return { ...res, fail: eg.fail, failAt: cur };
      // NAT inside-to-outside happens after routing, before the outbound ACL.
      if (!originated && d.type === "router" && d.cfg.intfs[inIf].nat === "inside" && d.cfg.intfs[eg.ifn].nat === "outside"
        && !this.natOutbound(cur, eg.ifn, pkt, opts)) return { ...res, fail: "nat", failAt: cur };
      if (!originated && d.cfg.intfs[eg.ifn].aclOut && !this.aclPermits(cur, d.cfg.intfs[eg.ifn].aclOut, pkt, opts.record)) {
        return { ...res, fail: "acl", failAt: cur };
      }
      if (!this.svcEgress(cur, eg.ifn, pkt, opts, originated)) return { ...res, fail: "qos", failAt: cur };
      const seg = this.flood(cur, eg.ifn);
      const live = (e) => this.ifUp(e.dev, e.ifn) && this.ifAddr(e.dev, e.ifn);
      let tgt = seg.find((e) => live(e) && this.ifAddrs(e.dev, e.ifn).some((a) => a.ip === eg.nh));
      if (!tgt) {
        // An HSRP virtual IP: the active router answers ARP with the virtual MAC.
        const v = seg.find((e) => live(e) && this.vipIf(e.dev, eg.nh) === e.ifn);
        if (v) tgt = { ...v, vmac: this.vmac(v.dev, v.ifn, eg.nh) };
      }
      if (!tgt && eg.proxy) {
        tgt = seg.find((e) => live(e) && this.devs[e.dev].type === "router" && (() => {
          const g = this.routerEgress(e.dev, pkt.dst);
          return !g.fail && g.ifn !== e.ifn;
        })());
      }
      // A NAT router answers ARP for its static and pool global addresses on the outside segment.
      if (!tgt) tgt = seg.find((e) => live(e) && this.natAnswers(e.dev, e.ifn, eg.nh));
      if (!tgt) return { ...res, fail: "arp", failAt: cur };
      const blocked = this.psecBlock(tgt.trail, this.mac(cur, eg.ifn), opts);
      if (blocked) {
        res.links.push(...tgt.trail.slice(0, blocked.at + 1));
        return { ...res, fail: "drop", failAt: blocked.dev };
      }
      if (opts.record) this.learn(cur, eg.ifn, tgt, eg.nh, res);
      res.links.push(...tgt.trail);
      if (!this.svcTrail(tgt.trail, pkt, opts)) return { ...res, fail: "qos", failAt: tgt.dev };
      cur = tgt.dev;
      inIf = tgt.ifn;
      originated = false;
      const td = this.devs[cur];
      res.hops.push({ dev: cur, ip: this.ifAddr(cur, tgt.ifn).ip, ifn: tgt.ifn });
      if (td.type === "router") {
        const acl = td.cfg.intfs[tgt.ifn].aclIn;
        if (acl && !this.aclPermits(cur, acl, pkt, opts.record)) return { ...res, fail: "acl", failAt: cur };
        if (!this.svcIngress(cur, tgt.ifn, pkt, opts)) return { ...res, fail: "qos", failAt: cur };
      }
    }
    return { ...res, fail: "ttl", failAt: cur };
  }

  // MAC learning along the frame's path, and the sender's ARP cache.
  learn(dn, ifn, tgt, nh, res) {
    const smac = this.mac(dn, ifn), dmac = tgt.vmac || this.mac(tgt.dev, tgt.ifn);
    this.learnMacs(tgt.trail, smac, dmac, ifn);
    const d = this.devs[dn], key = n2ip(nh);
    // Only a router has to ARP before it can forward, and it drops the packet while it waits.
    // Hosts resolve first and then send, so their own first packet isn't lost.
    if (d.type === "router" && !d.rt.arp[key]) res.arpMiss = true;
    const had = !!d.rt.arp[key];
    d.rt.arp[key] = { mac: dmac, ifn };
    // The ARP request carried the sender's address: routers it was aimed at (including every
    // member of an HSRP group whose virtual IP was asked for) learn the sender from it.
    const sender = this.ifAddr(dn, ifn);
    if (had || !sender) return;
    for (const e of [tgt, ...this.flood(dn, ifn).filter((x) => x !== tgt)]) {
      const r = this.devs[e.dev];
      if (r.type !== "router") continue;
      const aimed = e === tgt || Object.entries(r.cfg.intfs[e.ifn].standby || {})
        .some(([g, s]) => s.ip === nh || (r.rt.hsrp[e.ifn + "|" + g] || {}).vip === nh);
      if (aimed) r.rt.arp[n2ip(sender.ip)] = { mac: smac, ifn: e.ifn };
    }
  }

  learnMacs(trail, smac, dmac, ifn) {
    for (const hop of trail) {
      if (this.devs[hop.b].type === "switch" && hop.vlan !== null) this.devs[hop.b].rt.mac[hop.vlan + "|" + smac] = hop.bp;
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      const hop = trail[i];
      if (this.devs[hop.a].type === "switch") {
        const v = i > 0 ? trail[i - 1].vlan : +ifn.slice(4);
        this.devs[hop.a].rt.mac[v + "|" + dmac] = hop.ap;
      }
    }
  }

  // Console messages raised while forwarding (port-security violations), collected by the session.
  note(dn, msg) { (this.pend[dn] = this.pend[dn] || []).push(msg); }

  // -- port security ----------------------------------------------------------------
  // The first port along the frame's path whose port security refuses its source MAC, or null.
  psecBlock(trail, smac, opts) {
    for (let i = 0; i < trail.length; i++) {
      const hop = trail[i], sw = this.devs[hop.b];
      const ps = sw.type === "switch" && !isPo(hop.bp) && sw.cfg.intfs[hop.bp].psec;
      if (!ps || !ps.on) continue;
      if (!this.psecAdmit(sw, hop.bp, smac, hop.vlan, opts.record)) return { at: i, dev: hop.b };
    }
    return null;
  }

  psecAdmit(sw, port, mac, vlan, record) {
    const c = sw.cfg.intfs[port].psec;
    if (record && !sw.rt.psec[port]) sw.rt.psec[port] = { dyn: [], violations: 0, last: null };
    const rt = sw.rt.psec[port] || { dyn: [], violations: 0 };
    if (record) rt.last = mac + ":" + vlan;
    const known = [...c.macs, ...c.sticky, ...rt.dyn];
    if (known.includes(mac)) return true;
    if (known.length < c.max) {
      if (record) (c.stickyOn ? c.sticky : rt.dyn).push(mac);
      return true;
    }
    if (!record || c.violation === "protect") return false;
    rt.violations++;
    if (c.violation === "shutdown") {
      sw.rt.errdis[port] = "psecure-violation";
      this.note(sw.name, `%PM-4-ERR_DISABLE: psecure-violation error detected on ${shortIf(port)}, putting ${shortIf(port)} in err-disable state`);
      this.touch();
    }
    this.note(sw.name, `%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${mac} on port ${port}.`);
    return false;
  }

  // -- NAT ----------------------------------------------------------------------------
  // Translations live in rt.nat when a packet is really sent; checks work on a scratch copy.
  natTable(dn, opts) {
    const rt = this.devs[dn].rt;
    if (opts.record) return { all: () => rt.nat, add: (e) => rt.nat.push(e) };
    opts.natTmp = opts.natTmp || {};
    const tmp = opts.natTmp[dn] = opts.natTmp[dn] || [];
    return { all: () => rt.nat.concat(tmp), add: (e) => tmp.push(e) };
  }

  natCount(dn, opts, hit) {
    if (opts.record) this.devs[dn].rt.natStats[hit ? "hits" : "misses"]++;
  }

  // Inside local -> inside global on the way out. False when the packet must be dropped.
  natOutbound(dn, outIf, pkt, opts) {
    const d = this.devs[dn], nat = d.cfg.nat, tab = this.natTable(dn, opts), proto = pkt.proto === "udp" ? "udp" : "icmp";
    const flow = (ig, gid) => {
      if (!tab.all().some((e) => !e.addr && e.il === pkt.src && e.id === pkt.id && e.og === pkt.dst)) {
        tab.add({ proto, il: pkt.src, id: pkt.id, ig, gid, ol: pkt.dst, og: pkt.dst });
      }
      pkt.src = ig;
      pkt.id = gid;
      this.natCount(dn, opts, true);
      return true;
    };
    const st = nat.statics.find((s) => s.local === pkt.src);
    if (st) return flow(st.global, pkt.id);
    const known = tab.all().find((e) => !e.addr && e.il === pkt.src && e.id === pkt.id && e.og === pkt.dst);
    if (known) return flow(known.ig, known.gid);
    for (const r of nat.dyn) {
      if (!d.cfg.acls[r.acl] || !this.aclPermits(dn, r.acl, pkt, false)) continue;
      let ig;
      if (r.intf) {
        const a = this.ifAddr(dn, r.intf);
        if (!a || !this.ifUp(dn, r.intf)) { this.natCount(dn, opts, false); return false; }
        ig = a.ip;
      } else {
        const pool = nat.pools[r.pool];
        if (!pool) { this.natCount(dn, opts, false); return false; }
        if (r.overload) ig = pool.start;
        else {
          const b = tab.all().find((e) => e.addr && e.il === pkt.src);
          if (b) ig = b.ig;
          else {
            const taken = new Set(tab.all().filter((e) => e.addr).map((e) => e.ig).concat(nat.statics.map((s) => s.global)));
            for (let a = pool.start; a <= pool.end; a++) if (!taken.has(a)) { ig = a; break; }
            if (ig === undefined) { this.natCount(dn, opts, false); return false; }
            tab.add({ addr: true, il: pkt.src, ig });
          }
        }
      }
      let gid = pkt.id;
      if (r.intf || r.overload) {
        while (tab.all().some((e) => !e.addr && e.ig === ig && e.gid === gid && e.il !== pkt.src)) gid = gid < 1024 ? 1024 : gid + 1;
      }
      return flow(ig, gid);
    }
    return true; // no rule matches: the packet leaves untranslated
  }

  // Inside global -> inside local on the way in.
  natInbound(dn, pkt, opts) {
    const nat = this.devs[dn].cfg.nat, tab = this.natTable(dn, opts);
    const st = nat.statics.find((s) => s.global === pkt.dst);
    if (st) {
      if (!tab.all().some((e) => !e.addr && e.il === st.local && e.id === pkt.id && e.og === pkt.src)) {
        tab.add({ proto: pkt.proto === "udp" ? "udp" : "icmp", il: st.local, id: pkt.id, ig: st.global, gid: pkt.id, ol: pkt.src, og: pkt.src });
      }
      pkt.dst = st.local;
      this.natCount(dn, opts, true);
      return;
    }
    // ICMP errors carry the original header, so they match on the translated port alone.
    const err = pkt.icmp === "time-exceeded" || pkt.icmp === "unreachable";
    const f = tab.all().find((e) => !e.addr && e.ig === pkt.dst && e.gid === pkt.id && (err || e.og === pkt.src));
    if (f) { pkt.dst = f.il; pkt.id = f.id; this.natCount(dn, opts, true); return; }
    const b = tab.all().find((e) => e.addr && e.ig === pkt.dst);
    if (b) { pkt.dst = b.il; this.natCount(dn, opts, true); }
  }

  natAnswers(dn, ifn, ip) {
    const d = this.devs[dn];
    if (d.type !== "router" || d.cfg.intfs[ifn].nat !== "outside") return false;
    const a = this.ifAddr(dn, ifn);
    if (!a || !sameNet(a.ip, ip, a.mask) || a.ip === ip) return false;
    return d.cfg.nat.statics.some((s) => s.global === ip) || Object.values(d.cfg.nat.pools).some((p) => ip >= p.start && ip <= p.end);
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
    if (typeof dst === "string") {
      if (dst.includes(":")) return this.ping6(dn, parse6(dst), opts);
      dst = ip2n(dst);
    }
    const src = this.sourceIp(dn, dst, opts.source);
    if (this.ownsIp(dn, dst)) return { ok: true, links: [], ttl: 255, hops: [] };
    if (src === null) {
      const eg = this.devs[dn].type === "router" ? this.routerEgress(dn, dst) : this.hostEgress(dn, dst);
      return { ok: false, fail: eg.fail || "noip", failAt: dn, links: [] };
    }
    const o = { ...opts, natTmp: opts.natTmp || {} };
    const there = this.deliver(dn, { src, dst, proto: "icmp", icmp: "echo", id: 1, size: opts.size ?? 100, dscp: opts.dscp ?? 0 }, o);
    if (!there.ok) return { ...there, by: this.ifFacing(there) };
    const back = this.deliver(there.at, { src: there.pkt.dst, dst: there.pkt.src, proto: "icmp", icmp: "echo-reply", id: there.pkt.id, size: there.pkt.size, dscp: there.pkt.dscp }, o);
    // The reply only counts if it comes back to us, from the address we pinged.
    const ok = back.ok && back.at === dn && back.pkt.src === dst;
    const routers = back.hops.filter((h) => this.devs[h.dev].type === "router").length;
    const startTtl = this.devs[there.at].type === "pc" ? 64 : 255;
    return { ok, fail: ok ? undefined : back.fail || "drop", failAt: ok ? undefined : back.failAt || back.at,
      links: there.links.concat(back.links), back: true, arpMiss: there.arpMiss || back.arpMiss, ttl: startTtl - routers, hops: there.hops };
  }

  // The address an ICMP error would come from: the failing router's ingress interface.
  ifFacing(res) {
    const h = res.hops.filter((x) => x.dev === res.failAt).pop();
    return h ? h.ip : null;
  }

  // Router-by-router path for traceroute: [{ip, ok}] ending at the destination when reached.
  trace(dn, dst, max = 30, source) {
    if (typeof dst === "string") dst = ip2n(dst);
    const src = this.sourceIp(dn, dst, source);
    const out = [], o = { natTmp: {} };
    if (src === null) return out;
    const home = (back) => back.ok && back.at === dn;
    for (let ttl = 1; ttl <= max; ttl++) {
      const r = this.deliver(dn, { src, dst, proto: "udp", ttl, id: 1 }, o);
      if (r.ok) {
        const back = this.deliver(r.at, { src: r.pkt.dst, dst: r.pkt.src, proto: "icmp", icmp: "unreachable", id: r.pkt.id }, o);
        out.push({ ip: home(back) ? dst : null, last: true });
        return out;
      }
      if (r.fail === "ttl") {
        const h = r.hops.filter((x) => x.dev === r.failAt).pop();
        const back = this.deliver(r.failAt, { src: h.ip, dst: r.pkt.src, proto: "icmp", icmp: "time-exceeded", id: r.pkt.id }, o);
        out.push({ ip: home(back) ? h.ip : null });
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

  // -- HSRP ---------------------------------------------------------------------------
  vmac(dn, ifn, vip) {
    const c = this.devs[dn].cfg.intfs[ifn];
    const g = Object.keys(c.standby).find((k) => this.devs[dn].rt.hsrp[ifn + "|" + k]?.vip === vip);
    return hsrpMac(c, g);
  }

  trackUp(dn, obj) {
    const t = this.devs[dn].cfg.tracks[obj];
    return t ? this.ifUp(dn, t.ifn) : true;
  }

  hsrpPrio(dn, sc) {
    return Math.max(0, sc.prio - sc.tracks.reduce((s, t) => s + (this.trackUp(dn, t.obj) ? 0 : t.dec), 0));
  }

  // Elect active and standby routers per group. State is kept between runs because a router
  // without preempt keeps the active role even when a higher-priority router appears.
  hsrpSettle(log) {
    const parts = [];
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router") continue;
      for (const [ifn, c] of Object.entries(d.cfg.intfs)) {
        for (const [g, sc] of Object.entries(c.standby || {})) {
          parts.push({ dev: d.name, ifn, g: +g, sc, ver: c.hsrpVer || 1, key: ifn + "|" + g,
            up: this.ifUp(d.name, ifn) && !!this.ifAddr(d.name, ifn) });
        }
      }
    }
    let changed = false;
    // Forget groups that are no longer configured.
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router") continue;
      for (const k of Object.keys(d.rt.hsrp)) {
        if (!parts.some((p) => p.dev === d.name && p.key === k)) { delete d.rt.hsrp[k]; changed = true; }
      }
    }
    const root = parts.map((_, i) => i);
    const find = (i) => (root[i] === i ? i : (root[i] = find(root[i])));
    parts.forEach((a, i) => {
      if (!a.up) return;
      for (const e of this.flood(a.dev, a.ifn)) {
        // Routers only hear each other with the same group, version and authentication.
        const j = parts.findIndex((b) => b.dev === e.dev && b.ifn === e.ifn && b.g === a.g && b.ver === a.ver && b.up
          && (b.sc.auth ?? "text cisco") === (a.sc.auth ?? "text cisco"));
        if (j >= 0) root[find(i)] = find(j);
      }
    });
    const clusters = new Map();
    parts.forEach((p, i) => { const r = find(i); if (!clusters.has(r)) clusters.set(r, []); clusters.get(r).push(p); });
    const stateOf = (p) => (this.devs[p.dev].rt.hsrp[p.key] || {}).state || "Init";
    for (const members of clusters.values()) {
      const live = members.filter((m) => m.up);
      const cur = live.find((m) => stateOf(m) === "Active");
      const vip = (cur && cur.sc.ip !== null ? cur.sc.ip : null) ?? (live.find((m) => m.sc.ip !== null) || {}).sc?.ip ?? null;
      const prio = (m) => this.hsrpPrio(m.dev, m.sc);
      const ipOf = (m) => this.ifAddr(m.dev, m.ifn).ip;
      const better = (a, b) => prio(a) > prio(b) || (prio(a) === prio(b) && ipOf(a) > ipOf(b));
      const ranked = [...live].sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : 0));
      let active = null, standby = null;
      if (vip !== null && ranked.length) {
        active = cur || ranked[0];
        if (ranked[0] !== active && ranked[0].sc.preempt && better(ranked[0], active)) active = ranked[0];
        standby = ranked.find((m) => m !== active) || null;
      }
      for (const m of members) {
        const next = !m.up || vip === null ? "Init" : m === active ? "Active" : m === standby ? "Standby" : "Listen";
        const rt = this.devs[m.dev].rt.hsrp;
        const prev = rt[m.key] || { state: "Init", vip: null, changes: 0, seen: [] };
        const vipNow = m.sc.ip ?? vip;
        if (prev.state !== next) {
          const steps = prev.state === "Init" && next === "Active" ? ["Speak", "Standby", "Active"]
            : prev.state === "Init" ? ["Speak", next] : [prev.state, next];
          for (let i = 1; i < steps.length; i++) log(m.dev, `%HSRP-5-STATECHANGE: ${m.ifn} Grp ${m.g} state ${steps[i - 1]} -> ${steps[i]}`);
          changed = true;
        }
        if (prev.state !== next || prev.vip !== vipNow) {
          rt[m.key] = { state: next, vip: vipNow, changes: prev.changes + (prev.state !== next ? 1 : 0),
            seen: prev.seen.includes(next) ? prev.seen : prev.seen.concat([next]) };
          changed = true;
        }
      }
    }
    return changed;
  }

  // -- latched state ----------------------------------------------------------------
  // Things that stick once they happen: BPDU guard err-disabling a port, HSRP roles, and the
  // log messages forwarding raised. Run after every command; returns console messages per device.
  settle() {
    const logs = {};
    const log = (dn, m) => (logs[dn] = logs[dn] || []).push(m);
    for (const [dn, msgs] of Object.entries(this.pend)) for (const m of msgs) log(dn, m);
    this.pend = {};
    for (let pass = 0; pass < 6; pass++) {
      let changed = false;
      for (const d of Object.values(this.devs)) {
        if (d.type !== "switch") continue;
        for (const p of d.ports) {
          if (d.rt.errdis[p] || !this.bpduGuard(d, p)) continue;
          const pr = this.peer(d.name, p);
          if (!pr || this.devs[pr.dev].type !== "switch" || !this.adminUp(d.name, p) || !this.adminUp(pr.dev, pr.port)
            || this.errdis(pr.dev, pr.port)) continue;
          d.rt.errdis[p] = "bpduguard";
          log(d.name, `%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port ${p} with BPDU Guard enabled. Disabling port.`);
          log(d.name, `%PM-4-ERR_DISABLE: bpduguard error detected on ${shortIf(p)}, putting ${shortIf(p)} in err-disable state`);
          changed = true;
        }
        // Dynamically learned secure addresses go away when the port goes down.
        for (const [p, s] of Object.entries(d.rt.psec)) if (s.dyn.length && !this.portUp(d.name, p)) s.dyn = [];
      }
      if (changed) this.touch();
      if (this.hsrpSettle(log)) { changed = true; this.touch(); }
      if (this.bgpSettle(log)) { changed = true; this.touch(); }
      if (!changed) break;
    }
    return logs;
  }

  // -- EIGRP --------------------------------------------------------------------------
  delay(d, ifn) {
    const c = d.cfg.intfs[ifn];
    if (c.delay) return c.delay;
    const t = ifType(ifn);
    return t === "Loopback" ? 500 : t === "FastEthernet" ? 10 : 1; // tens of microseconds
  }

  eigrpRid(dn) {
    const e = this.devs[dn].cfg.eigrp;
    if (e.rid !== null) return e.rid;
    const ips = (lo) => this.upIfs(dn).filter((n) => lo === n.startsWith("Loopback")).map((n) => this.ifAddr(dn, n).ip);
    const lo = ips(true), all = ips(false);
    return lo.length ? Math.max(...lo) : all.length ? Math.max(...all) : null;
  }

  eigrpIfs(dn) {
    const d = this.devs[dn], e = d.cfg.eigrp, out = [];
    for (const ifn of this.upIfs(dn)) {
      const { ip, mask } = this.ifAddr(dn, ifn);
      const hit = e.networks.some((n) => (n.wild === null ? majorNet(ip).net === n.addr : wildMatch(ip, n.addr, n.wild)));
      if (!hit) continue;
      const passive = e.passiveDefault ? !e.noPassive.includes(ifn) : e.passive.includes(ifn);
      out.push({ ifn, ip, mask, passive, loop: ifn.startsWith("Loopback"), bw: this.bandwidth(d, ifn), dly: this.delay(d, ifn) });
    }
    return out;
  }

  // Composite metric: classic 32-bit, or the 64-bit wide metric named mode uses.
  eigrpMetric(me, vec) {
    const [k1, k2, k3, k4, k5] = me.k;
    if (me.wide) {
      const thr = Math.floor((65536 * 1e7) / vec.bw), lat = vec.dly * 655360;
      let m = k1 * thr + Math.floor((k2 * thr) / 255) + k3 * lat;
      if (k5) m = Math.floor((m * k5) / (255 + k4));
      return m;
    }
    const bw = Math.floor(1e7 / vec.bw);
    let m = k1 * bw + Math.floor((k2 * bw) / 255) + k3 * vec.dly;
    if (k5) m = Math.floor((m * k5) / (255 + k4));
    return m * 256;
  }

  // Neighbours, then DUAL: each router's feasible distance per prefix, its successors and
  // feasible successors (neighbours whose reported distance is below the feasible distance).
  eigrp() {
    if (this.c.eigrp) return this.c.eigrp;
    const per = {};
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router" || !d.cfg.eigrp) continue;
      const e = d.cfg.eigrp, rid = this.eigrpRid(d.name);
      if (rid === null) continue;
      per[d.name] = { asn: e.asn, name: e.name, wide: !!e.name, k: e.k, rid, variance: e.variance, ifs: this.eigrpIfs(d.name), nbrs: [] };
    }
    for (const [dn, me] of Object.entries(per)) {
      for (const oi of me.ifs) {
        if (oi.passive || oi.loop) continue;
        for (const x of this.flood(dn, oi.ifn)) {
          const them = per[x.dev], oj = them && them.ifs.find((i) => i.ifn === x.ifn);
          if (!oj || oj.passive || x.dev === dn || them.asn !== me.asn || them.k.join() !== me.k.join()) continue;
          if (!sameNet(oj.ip, oi.ip, oi.mask) || !sameNet(oi.ip, oj.ip, oj.mask)) continue;
          me.nbrs.push({ dev: x.dev, ifn: x.ifn, ip: oj.ip, local: oi.ifn, li: oi });
        }
      }
    }
    // What each router originates: its EIGRP-enabled connected networks, plus redistributed statics.
    const own = {};
    for (const [dn, me] of Object.entries(per)) {
      own[dn] = {};
      for (const oi of me.ifs) {
        const len = maskLen(oi.mask), net = and(oi.ip, oi.mask);
        own[dn][net + "/" + len] = { net, len, vec: { bw: oi.bw, dly: oi.dly }, ext: false, conn: true, ifn: oi.ifn };
      }
      if (!this.devs[dn].cfg.eigrp.redistStatic) continue;
      for (const r of this.liveStatics(dn)) {
        const k = r.net + "/" + r.len;
        if (own[dn][k]) continue;
        const exit = r.ifn || this.upIfs(dn).find((n) => { const a = this.ifAddr(dn, n); return sameNet(a.ip, r.nh, a.mask); });
        const d = this.devs[dn];
        own[dn][k] = { net: r.net, len: r.len, vec: { bw: this.bandwidth(d, exit), dly: this.delay(d, exit) }, ext: true, conn: false };
      }
    }
    let tab = {};
    for (const [dn, me] of Object.entries(per)) {
      tab[dn] = {};
      for (const [k, o] of Object.entries(own[dn])) tab[dn][k] = { ...o, own: true, metric: this.eigrpMetric(me, o.vec), via: [], cands: [] };
    }
    for (let round = 0; round < 64; round++) {
      const next = {};
      for (const [dn, me] of Object.entries(per)) {
        const t = next[dn] = {};
        for (const [k, o] of Object.entries(own[dn])) t[k] = { ...o, own: true, metric: this.eigrpMetric(me, o.vec), via: [], cands: [] };
        const cands = {};
        for (const n of me.nbrs) {
          for (const [k, en] of Object.entries(tab[n.dev])) {
            if (en.via.some((v) => v.dev === dn)) continue; // split horizon
            const vec = { bw: Math.min(en.vec.bw, n.li.bw), dly: en.vec.dly + n.li.dly };
            (cands[k] = cands[k] || []).push({ metric: this.eigrpMetric(me, vec), rd: en.metric, vec, ext: en.ext,
              net: en.net, len: en.len, ip: n.ip, ifn: n.local, dev: n.dev });
          }
        }
        for (const [k, cs] of Object.entries(cands)) {
          cs.sort((a, b) => a.metric - b.metric || a.ip - b.ip);
          if (t[k]) { t[k].cands = cs; continue; }
          const fd = cs[0].metric;
          t[k] = { net: cs[0].net, len: cs[0].len, vec: cs[0].vec, ext: cs[0].ext, conn: false, metric: fd,
            via: cs.filter((c) => c.metric === fd).slice(0, 4).map((c) => ({ ip: c.ip, ifn: c.ifn, dev: c.dev })), cands: cs };
        }
      }
      const sig = (tb) => JSON.stringify(Object.keys(tb).sort().map((dn) => Object.keys(tb[dn]).sort()
        .map((k) => [k, tb[dn][k].metric, tb[dn][k].via.map((v) => v.ip), tb[dn][k].cands.map((c) => c.metric + "/" + c.rd)])));
      const done = sig(next) === sig(tab);
      tab = next;
      if (done) break;
    }
    for (const [dn, me] of Object.entries(per)) {
      me.topo = tab[dn];
      me.routes = [];
      for (const [k, en] of Object.entries(tab[dn])) {
        en.fs = en.own ? [] : en.cands.filter((c) => c.rd < en.metric && !en.via.some((v) => v.ip === c.ip));
        if (en.own) continue;
        // Variance installs feasible successors whose metric is within variance x FD.
        const metricOf = (m) => (me.wide ? Math.floor(m / 128) : m);
        const extra = me.variance > 1 ? en.fs.filter((c) => c.metric <= en.metric * me.variance)
          .map((c) => ({ ip: c.ip, ifn: c.ifn, dev: c.dev, metric: metricOf(c.metric) })) : [];
        me.routes.push({ code: en.ext ? "D EX" : "D", net: en.net, len: en.len, ad: en.ext ? 170 : 90, metric: metricOf(en.metric),
          paths: [...en.via.map((v) => ({ ...v, metric: metricOf(en.metric) })), ...extra].slice(0, 4), key: k });
      }
    }
    this.c.eigrp = per;
    return per;
  }

  // -- IPv6 -----------------------------------------------------------------------------
  v6on(dn, ifn) {
    const d = this.devs[dn];
    if (d.type === "pc") return true;
    const v = d.cfg.intfs[ifn] && d.cfg.intfs[ifn].ipv6;
    return !!v && (v.addrs.length > 0 || v.ll !== null || v.enable || v.auto);
  }

  ll6(dn, ifn) {
    const d = this.devs[dn];
    if (d.type === "pc") return linkLocal(this.mac(dn, "eth0"));
    const v = d.cfg.intfs[ifn].ipv6;
    return v.ll !== null ? parse6(v.ll) : linkLocal(this.mac(dn, ifn));
  }

  // Routers on this segment sending router advertisements: IPv6 routing on, interface up with IPv6.
  ras(dn, ifn) {
    return this.flood(dn, ifn).filter((e) => this.devs[e.dev].type === "router" && this.devs[e.dev].cfg.ipv6Routing
      && this.ifUp(e.dev, e.ifn) && this.v6on(e.dev, e.ifn))
      .map((e) => ({ dev: e.dev, ifn: e.ifn, ll: this.ll6(e.dev, e.ifn),
        prefixes: this.addrs6(e.dev, e.ifn, true).filter((x) => x.len === 64).map((x) => net6(x.a, 64)) }));
  }

  // Global unicast addresses on an interface: [{a, len, how}].
  addrs6(dn, ifn, noAuto) {
    const d = this.devs[dn];
    if (d.type === "pc") {
      const c = d.cfg.ip6;
      if (!c) return [];
      if (!c.auto) return [{ a: parse6(c.a), len: c.len, how: "manual" }];
      // SLAAC keeps listening: the address follows whatever /64 a router on the segment advertises.
      const ra = this.ras(dn, "eth0").find((r) => r.prefixes.length);
      return ra ? [{ a: ra.prefixes[0] | eui64(this.mac(dn, "eth0")), len: 64, how: "auto" }] : [];
    }
    const v = d.cfg.intfs[ifn] && d.cfg.intfs[ifn].ipv6;
    if (!v) return [];
    const out = v.addrs.map((x) => ({ a: x.eui ? net6(parse6(x.a), x.len) | eui64(this.mac(dn, ifn)) : parse6(x.a), len: x.len, how: x.eui ? "eui" : "manual" }));
    if (v.auto && !noAuto && this.ifUp(dn, ifn)) {
      for (const ra of this.ras(dn, ifn)) {
        for (const p of ra.prefixes) {
          const a = p | eui64(this.mac(dn, ifn));
          if (!out.some((x) => x.a === a)) out.push({ a, len: 64, how: "auto" });
        }
      }
    }
    return out;
  }

  v6Ifs(dn) {
    const d = this.devs[dn];
    if (d.type === "pc") return ["eth0"];
    return Object.keys(d.cfg.intfs).filter((n) => this.v6on(dn, n)).sort(ifSort);
  }

  ifOwns6(dn, ifn, a) {
    if (!this.v6on(dn, ifn) || (this.devs[dn].type !== "pc" && !this.ifUp(dn, ifn))) return false;
    return this.ll6(dn, ifn) === a || this.addrs6(dn, ifn).some((x) => x.a === a);
  }

  owns6(dn, a) { return this.v6Ifs(dn).some((n) => this.ifOwns6(dn, n, a)); }

  ospf6Rid(dn) {
    const o = this.devs[dn].cfg.ospf6;
    if (!o) return null;
    if (o.rid !== null) return o.rid;
    const ips = (lo) => this.upIfs(dn).filter((n) => lo === n.startsWith("Loopback")).map((n) => this.ifAddr(dn, n).ip);
    const lo = ips(true), all = ips(false);
    return lo.length ? Math.max(...lo) : all.length ? Math.max(...all) : null;
  }

  ospf6Ifs(dn) {
    const d = this.devs[dn], o = d.cfg.ospf6, out = [];
    for (const ifn of Object.keys(d.cfg.intfs).sort(ifSort)) {
      const oc = d.cfg.intfs[ifn].ospf6 || {};
      if (oc.pid !== o.pid || oc.area === undefined || !this.ifUp(dn, ifn) || !this.v6on(dn, ifn)) continue;
      const passive = o.passiveDefault ? !o.noPassive.includes(ifn) : o.passive.includes(ifn);
      const hello = oc.hello ?? 10;
      out.push({ ifn, ip: this.ll6(dn, ifn), area: oc.area, passive, hello, dead: oc.dead ?? hello * 4, prio: oc.prio ?? 1,
        ptp: !!oc.ptp, loop: ifn.startsWith("Loopback"),
        cost: oc.cost ?? Math.max(1, Math.floor((o.refBw * 1000) / this.bandwidth(d, ifn))) });
    }
    return out;
  }

  // OSPFv3: adjacencies form over link-local addresses (no subnet check), then SPF as for OSPFv2.
  ospf6() {
    if (this.c.ospf6) return this.c.ospf6;
    const per = {};
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router" || !d.cfg.ospf6 || !d.cfg.ipv6Routing) continue;
      const rid = this.ospf6Rid(d.name);
      if (rid === null) continue;
      per[d.name] = { rid, pid: d.cfg.ospf6.pid, ifs: this.ospf6Ifs(d.name), nbrs: [], routes: [] };
    }
    for (const [dn, me] of Object.entries(per)) {
      for (const oi of me.ifs) {
        oi.nbrs = [];
        if (oi.passive || oi.loop) continue;
        for (const e of this.flood(dn, oi.ifn)) {
          const them = per[e.dev], oj = them && them.ifs.find((x) => x.ifn === e.ifn);
          if (!oj || oj.passive || oj.loop || e.dev === dn || oj.area !== oi.area) continue;
          if (oj.hello !== oi.hello || oj.dead !== oi.dead || oj.ptp !== oi.ptp || them.rid === me.rid) continue;
          oi.nbrs.push({ dev: e.dev, ifn: e.ifn, rid: them.rid, ip: oj.ip, prio: oj.prio });
        }
      }
    }
    ospfElect(per);
    for (const [src, me] of Object.entries(per)) {
      const { dist, hops } = ospfSpf(per, src);
      const myAreas = new Set(me.ifs.map((x) => x.area));
      const best = {};
      const offer = (k, r) => {
        const cur = best[k];
        if (!cur || r.metric < cur.metric || (r.metric === cur.metric && (r.dist ?? 0) < (cur.dist ?? 0))) best[k] = r;
        else if (r.metric === cur.metric && (r.dist ?? 0) === (cur.dist ?? 0)) {
          for (const h of r.paths) if (!cur.paths.some((p) => p.ip === h.ip)) cur.paths.push(h);
        }
      };
      for (const [x, them] of Object.entries(per)) {
        if (x === src || dist[x] === undefined) continue;
        for (const oi of them.ifs) {
          for (const { a, len } of this.addrs6(x, oi.ifn)) {
            const host = oi.loop && !oi.ptp;
            const net = host ? a : net6(a, len), l = host ? 128 : len;
            offer(net + "/" + l, { code: myAreas.has(oi.area) ? "O" : "OI", net, len: l, metric: dist[x] + oi.cost, paths: [...hops[x]] });
          }
        }
        const o = this.devs[x].cfg.ospf6;
        if (o.defaultOriginate && (o.defaultAlways || this.routes6(x, true).some((r) => r.len === 0 && r.code[0] === "S"))) {
          offer("0/0", { code: "OE2", net: 0n, len: 0, metric: 1, dist: dist[x], paths: [...hops[x]] });
        }
      }
      me.routes = Object.values(best);
    }
    this.c.ospf6 = per;
    return per;
  }

  // The IPv6 routing table. noOspf breaks the loop when OSPFv3 asks about a router's static default.
  routes6(dn, noOspf) {
    const key = dn + (noOspf ? "|s" : "") + (this.c.bgpBusy ? "|igp" : "");
    if (this.c.routes6[key]) return this.c.routes6[key];
    const d = this.devs[dn], cands = [];
    if (d.type !== "router") return [];
    for (const ifn of this.v6Ifs(dn)) {
      if (!this.ifUp(dn, ifn)) continue;
      for (const { a, len } of this.addrs6(dn, ifn)) {
        cands.push({ code: "C", net: net6(a, len), len, ad: 0, metric: 0, ifn });
        if (len < 128) cands.push({ code: "L", net: a, len: 128, ad: 0, metric: 0, ifn });
      }
    }
    const o6 = !noOspf && this.ospf6()[dn];
    if (o6) for (const r of o6.routes) cands.push({ ...r, ad: 110 });
    const select = (list) => {
      const best = {};
      for (const r of list) {
        const k = r.net + "/" + r.len, b = best[k];
        if (!b || r.ad < b[0].ad) best[k] = [r];
        else if (r.ad === b[0].ad && r.code === b[0].code) b.push(r);
      }
      return Object.values(best).map((rs) => (rs.length === 1 ? rs[0] : { ...rs[0], paths: rs.flatMap((r) => r.paths || []) }));
    };
    let table = select(cands);
    const pending = new Set(d.cfg.routes6.map((_, i) => i));
    for (let pass = 0; pass < 5 && pending.size; pass++) {
      let added = false;
      for (const i of [...pending]) {
        const s = d.cfg.routes6[i], nh = s.nh === null ? null : parse6(s.nh), net = parse6(s.net);
        let ok;
        if (s.ifn) ok = this.ifUp(dn, s.ifn) && this.v6on(dn, s.ifn);
        else {
          const r = lpm6(table, nh);
          ok = !isLL(nh) && !!r && !(r.net === net && r.len === s.len);
        }
        if (!ok) continue;
        pending.delete(i);
        cands.push({ code: "S", net, len: s.len, ad: s.ad, metric: 0, paths: [{ ip: nh, ifn: s.ifn }] });
        added = true;
      }
      if (!added) break;
      table = select(cands);
    }
    if (!noOspf && !this.c.bgpBusy && d.cfg.bgp) table = select([...table, ...this.bgpRoutes6(dn)]);
    table.sort((a, b) => (a.net < b.net ? -1 : a.net > b.net ? 1 : a.len - b.len));
    this.c.routes6[key] = table;
    return table;
  }

  routerEgress6(dn, dst, depth = 0) {
    const r = lpm6(this.routes6(dn), dst);
    if (!r) return { fail: "noroute" };
    if (r.code === "C" || r.code === "L") return { ifn: r.ifn, nh: dst };
    const p = r.paths[0];
    if (p.ifn === "Null0") return { fail: "null0" };
    if (p.ifn && p.ip === null) return { ifn: p.ifn, nh: dst };
    if (p.ifn) return { ifn: p.ifn, nh: p.ip };
    if (depth > 4) return { fail: "noroute" };
    const e = this.routerEgress6(dn, p.ip, depth + 1);
    if (e.fail) return e;
    return e.nh === p.ip ? { ifn: e.ifn, nh: e.nh } : e;
  }

  hostEgress6(dn, dst) {
    if (isLL(dst)) return { ifn: "eth0", nh: dst };
    const mine = this.addrs6(dn, "eth0");
    if (!mine.length) return { fail: "noip" };
    if (mine.some((x) => net6(x.a, x.len) === net6(dst, x.len))) return { ifn: "eth0", nh: dst };
    const ra = this.ras(dn, "eth0")[0];
    return ra ? { ifn: "eth0", nh: ra.ll } : { fail: "nogw" };
  }

  // Carry one IPv6 packet hop by hop; the same shape of result as deliver().
  deliver6(src, pkt, opts = {}) {
    const res = { ok: false, links: [], hops: [], arpMiss: false, pkt };
    let cur = src, originated = true, hl = 64;
    for (let n = 0; n < 40; n++) {
      const d = this.devs[cur];
      if (this.owns6(cur, pkt.dst)) { res.ok = true; res.at = cur; return res; }
      if (!originated) {
        if (d.type !== "router" || !d.cfg.ipv6Routing || isLL(pkt.dst)) return { ...res, fail: "drop", failAt: cur };
        if (--hl <= 0) return { ...res, fail: "ttl", failAt: cur };
      }
      let eg;
      if (d.type === "pc") eg = this.hostEgress6(cur, pkt.dst);
      else if (originated && opts.ifn) eg = { ifn: opts.ifn, nh: pkt.dst };
      else eg = this.routerEgress6(cur, pkt.dst);
      if (eg.fail) return { ...res, fail: eg.fail, failAt: cur };
      const tgt = this.flood(cur, eg.ifn).find((e) => this.ifOwns6(e.dev, e.ifn, eg.nh));
      if (!tgt) return { ...res, fail: "arp", failAt: cur };
      const blocked = this.psecBlock(tgt.trail, this.mac(cur, eg.ifn), opts);
      if (blocked) {
        res.links.push(...tgt.trail.slice(0, blocked.at + 1));
        return { ...res, fail: "drop", failAt: blocked.dev };
      }
      if (opts.record) {
        const dmac = this.mac(tgt.dev, tgt.ifn);
        this.learnMacs(tgt.trail, this.mac(cur, eg.ifn), dmac, eg.ifn);
        this.devs[cur].rt.nd[fmt6(eg.nh)] = { mac: dmac, ifn: eg.ifn };
      }
      res.links.push(...tgt.trail);
      cur = tgt.dev;
      originated = false;
      res.hops.push({ dev: cur, ifn: tgt.ifn });
    }
    return { ...res, fail: "ttl", failAt: cur };
  }

  // The source address a device uses towards dst: a global address, or link-local for link-local.
  sourceIp6(dn, dst, ifn) {
    const d = this.devs[dn];
    let out;
    if (d.type === "pc") out = "eth0";
    else if (ifn) out = ifn;
    else { const eg = this.routerEgress6(dn, dst); if (eg.fail) return null; out = eg.ifn; }
    if (isLL(dst)) return this.v6on(dn, out) ? this.ll6(dn, out) : null;
    const g = this.addrs6(dn, out)[0];
    return g ? g.a : null;
  }

  ping6(dn, dst, opts = {}) {
    if (dst === null) return { ok: false, fail: "noip", failAt: dn, links: [] };
    if (this.owns6(dn, dst)) return { ok: true, links: [], ttl: 64, hops: [] };
    const src = this.sourceIp6(dn, dst, opts.ifn);
    if (src === null) {
      const d = this.devs[dn];
      const eg = d.type === "pc" ? this.hostEgress6(dn, dst) : this.routerEgress6(dn, dst);
      return { ok: false, fail: eg.fail || "noip", failAt: dn, links: [] };
    }
    const there = this.deliver6(dn, { src, dst }, opts);
    if (!there.ok) return there;
    const back = this.deliver6(there.at, { src: dst, dst: src }, { ...opts, ifn: isLL(src) ? this.v6Ifs(there.at).find((n) => this.ifOwns6(there.at, n, dst)) : undefined });
    const ok = back.ok && back.at === dn;
    const routers = back.hops.filter((h) => this.devs[h.dev].type === "router").length;
    return { ok, fail: back.fail, failAt: back.failAt, links: there.links.concat(back.links), back: true,
      ttl: 64 - routers, hops: there.hops };
  }

  // A PC's stateless autoconfiguration: the first advertised /64 plus its EUI-64 interface ID.
  slaac(pcName) {
    this.devs[pcName].cfg.ip6 = { a: null, len: 64, auto: true };
    this.touch();
    const ra = this.ras(pcName, "eth0").find((r) => r.prefixes.length);
    return ra ? { a: ra.prefixes[0] | eui64(this.mac(pcName, "eth0")), router: ra } : null;
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
    const ospf = this.ospf(), ospf6 = this.ospf6(), eigrp = this.eigrp();
    for (const d of Object.values(this.devs)) {
      if (d.type === "pc") continue;
      const ifs = {};
      for (const n of Object.keys(d.cfg.intfs)) ifs[n] = this.ifState(d.name, n);
      const nbrs = {}, nbrs6 = {}, enbrs = {};
      for (const n of (ospf[d.name] ? ospf[d.name].nbrs : [])) if (n.state.startsWith("FULL")) nbrs[n.rid + "|" + n.local] = n;
      for (const n of (ospf6[d.name] ? ospf6[d.name].nbrs : [])) if (n.state.startsWith("FULL")) nbrs6[n.rid + "|" + n.local] = n;
      for (const n of (eigrp[d.name] ? eigrp[d.name].nbrs : [])) enbrs[n.ip + "|" + n.local] = n;
      snap[d.name] = { ifs, nbrs, nbrs6, enbrs, pid: d.cfg.ospf && d.cfg.ospf.pid, pid6: d.cfg.ospf6 && d.cfg.ospf6.pid,
        asn: d.cfg.eigrp && d.cfg.eigrp.asn };
    }
    return snap;
  }

  // Console messages for what changed between two snapshots, per device.
  events(before, after) {
    const out = {};
    for (const [dn, a] of Object.entries(after)) {
      const b = before[dn] || { ifs: {}, nbrs: {}, nbrs6: {}, enbrs: {} }, msgs = [];
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
      const diff = (now, was, up, down) => {
        for (const [k, n] of Object.entries(now)) if (!was[k]) msgs.push(up(n));
        for (const [k, n] of Object.entries(was)) if (!now[k]) msgs.push(down(n));
      };
      diff(a.nbrs, b.nbrs, (n) => `%OSPF-5-ADJCHG: Process ${a.pid}, Nbr ${n2ip(n.rid)} on ${n.local} from LOADING to FULL, Loading Done`,
        (n) => `%OSPF-5-ADJCHG: Process ${b.pid}, Nbr ${n2ip(n.rid)} on ${n.local} from FULL to DOWN, Neighbor Down: Interface down or detached`);
      diff(a.nbrs6 || {}, b.nbrs6 || {}, (n) => `%OSPFv3-5-ADJCHG: Process ${a.pid6}, Nbr ${n2ip(n.rid)} on ${n.local} from LOADING to FULL, Loading Done`,
        (n) => `%OSPFv3-5-ADJCHG: Process ${b.pid6}, Nbr ${n2ip(n.rid)} on ${n.local} from FULL to DOWN, Neighbor Down: Interface down or detached`);
      diff(a.enbrs || {}, b.enbrs || {}, (n) => `%DUAL-5-NBRCHANGE: EIGRP-IPv4 ${a.asn}: Neighbor ${n2ip(n.ip)} (${n.local}) is up: new adjacency`,
        (n) => `%DUAL-5-NBRCHANGE: EIGRP-IPv4 ${b.asn}: Neighbor ${n2ip(n.ip)} (${n.local}) is down: interface down`);
      if (msgs.length) out[dn] = msgs;
    }
    return out;
  }

  // What this end of a cable blocks: {all} for a suspended member or a port blocked in every VLAN
  // it carries, and {vlans} listing the VLANs spanning tree blocks it in.
  endBlocked(dn, p) {
    const d = this.devs[dn];
    if (d.type !== "switch") return { all: false, vlans: [] };
    const m = this.member(dn, p);
    if (m && m.flag === "s") return { all: true, vlans: [] };
    const lp = m && m.flag === "P" ? "Port-channel" + m.group : p;
    const rows = Object.keys(d.cfg.vlans).map(Number).map((v) => { const s = this.stp(v)[dn]; return [v, s && s.ports[lp]]; }).filter(([, x]) => x);
    const vlans = rows.filter(([, x]) => x.state !== "FWD").map(([v]) => v);
    return { all: rows.length > 0 && vlans.length === rows.length, vlans };
  }

  // The cables as the topology diagram draws them: up/down, trunk, blocked, bundled, err-disabled ends.
  linkInfo() {
    return this.spec.links.map(([a, ap, b, bp]) => {
      const kind = (dn, p) => (this.devs[dn].type === "switch" ? this.swMode(this.devs[dn], p) : null);
      const up = this.portUp(a, ap), ma = this.member(a, ap), ea = this.endBlocked(a, ap), eb = this.endBlocked(b, bp);
      const vlans = [...new Set([...ea.vlans, ...eb.vlans])].sort((x, y) => x - y);
      return { a, ap, b, bp, up, trunk: kind(a, ap) === "trunk" || kind(b, bp) === "trunk",
        blocked: up && (ea.all || eb.all), blockedVlans: up ? vlans : [], bundled: up && !!ma && ma.flag === "P",
        aDown: !this.adminUp(a, ap), bDown: !this.adminUp(b, bp), aErr: !!this.errdis(a, ap), bErr: !!this.errdis(b, bp) };
    });
  }

  // -- lab checks ----------------------------------------------------------------
  check(c) {
    const d = this.devs[c.device || c.from];
    if (!d) throw new Error("check names unknown device " + (c.device || c.from));
    const intf = c.intf ? canonIf(d, c.intf) : null;
    // A check about an interface that doesn't exist yet (say Port-channel1 before the bundle) is simply false.
    if (intf && d.type !== "pc" && !d.cfg.intfs[intf]) return c.type === "noping" || c.type === "noroute" || c.type === "noconfig";
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
        if (this.swMode(d, intf) !== "trunk" || !this.lup(d.name, intf)) return false;
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
      // spanning tree, EtherChannel, port security
      case "stp-mode": return d.cfg.stp.mode === c.mode;
      case "stp-root": {
        const s = this.stp(c.vlan)[d.name];
        return !!s && s.rootPort === null && cmpVec(s.root, s.bid) === 0;
      }
      case "stp-port": {
        const s = this.stp(c.vlan)[d.name], p = s && s.ports[intf];
        return !!p && (!c.role || p.role === c.role) && (!c.state || p.state === c.state);
      }
      case "errdisabled": return !!d.rt.errdis[intf] && (!c.reason || d.rt.errdis[intf] === c.reason);
      case "etherchannel": {
        const po = this.ec()[d.name].po[c.group];
        return !!po && po.up && po.bundled >= (c.bundled || 1) && (!c.protocol || po.proto === c.protocol);
      }
      case "psec": {
        const p = d.cfg.intfs[intf].psec;
        if (!p || !p.on) return false;
        return (c.max === undefined || p.max === c.max) && (!c.violation || p.violation === c.violation)
          && (c.sticky === undefined || p.stickyOn === c.sticky);
      }
      case "psec-macs": {
        const p = d.cfg.intfs[intf].psec, rt = d.rt.psec[intf];
        if (!p) return false;
        const n = c.kind === "sticky" ? p.sticky.length : p.macs.length + p.sticky.length + (rt ? rt.dyn.length : 0);
        return n >= c.count;
      }
      case "psec-violations": return !!d.rt.psec[intf] && d.rt.psec[intf].violations >= (c.min || 1);
      // NAT and HSRP
      case "nat-entry": return d.rt.nat.some((e) => !e.addr && e.il === ip2n(c.local) && (!c.global || e.ig === ip2n(c.global)));
      case "hsrp": return (d.rt.hsrp[intf + "|" + c.group] || {}).state === c.state;
      case "hsrp-seen": return ((d.rt.hsrp[intf + "|" + c.group] || {}).seen || []).includes(c.state);
      // IPv6 and OSPFv3
      case "ipv6-addr": {
        const [p, l] = c.prefix.split("/"), pfx = parse6(p), len = +l;
        const ifs = d.type === "pc" ? ["eth0"] : [intf];
        return ifs.some((n) => this.addrs6(d.name, n).some((x) => net6(x.a, len) === pfx && (!c.how || x.how === c.how)));
      }
      case "route6": {
        const [p, l] = c.prefix.split("/");
        const r = this.routes6(d.name).find((x) => x.net === parse6(p) && x.len === +l);
        if (!r || (c.code && r.code !== c.code)) return false;
        return !c.via || (!!r.paths && r.paths.some((x) => x.ip === parse6(c.via)));
      }
      case "ospf6-nbr": {
        const o = this.ospf6()[d.name];
        return !!o && o.nbrs.some((n) => n.rid === ip2n(c.neighbor) && n.state.startsWith("FULL"));
      }
      case "ipv6-routing": return d.cfg.ipv6Routing;
      // EIGRP
      case "eigrp-nbrs": { const e = this.eigrp()[d.name]; return !!e && e.nbrs.length >= c.count; }
      case "eigrp-nbr": { const e = this.eigrp()[d.name]; return !!e && e.nbrs.some((n) => n.ip === ip2n(c.neighbor)); }
      case "eigrp-fs": {
        const e = this.eigrp()[d.name], [net, len] = c.prefix.split("/");
        const t = e && e.topo[ip2n(net) + "/" + len];
        return !!t && t.fs.some((x) => x.ip === ip2n(c.via));
      }
      default: {
        if (SVC_CHECKS[c.type]) return SVC_CHECKS[c.type](this, c, d, intf);
        const b = this.bgpCheck(d, c);
        if (b !== undefined) return b;
        throw new Error("unknown check type " + c.type);
      }
    }
  }
}

// Port-channel members must match the bundle's layer-2 settings or they are suspended.
const L2_KEYS = ["mode", "accessVlan", "native", "allowed", "noneg"];
const sameL2 = (a, b) => L2_KEYS.every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]));
const pidKey = (pid) => pid.prio * 4096 + pid.num;
function cmpVec(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return 0;
}

// DR/BDR election on broadcast segments (highest priority, then highest router ID) and the
// resulting neighbour states. Shared by OSPFv2 and OSPFv3.
function ospfElect(per) {
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
}

// Dijkstra from src over the adjacencies, keeping every equal-cost first hop.
function ospfSpf(per, src) {
  const dist = { [src]: 0 }, hops = { [src]: [] }, done = new Set();
  for (;;) {
    let u = null;
    for (const n of Object.keys(dist)) if (!done.has(n) && (u === null || dist[n] < dist[u])) u = n;
    if (u === null) break;
    done.add(u);
    for (const oi of per[u].ifs) {
      for (const n of oi.nbrs || []) {
        if (!per[n.dev]) continue;
        const nd = dist[u] + oi.cost;
        const via = u === src ? [{ ip: n.ip, ifn: oi.ifn }] : hops[u];
        if (dist[n.dev] === undefined || nd < dist[n.dev]) { dist[n.dev] = nd; hops[n.dev] = [...via]; }
        else if (nd === dist[n.dev] && !done.has(n.dev)) {
          for (const h of via) if (!hops[n.dev].some((x) => x.ip === h.ip)) hops[n.dev].push(h);
        }
      }
    }
  }
  return { dist, hops };
}

function lpm6(table, a) {
  let best = null;
  for (const r of table) if (net6(a, r.len) === r.net && (!best || r.len > best.len)) best = r;
  return best;
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

// "show access-lists" prints a standard ACE's wildcard as "a.b.c.d, wildcard bits w.x.y.z".
function aclAddr(s, ext, show) {
  if (s.addr === 0 && s.wild === 0xffffffff) return "any";
  if (s.wild === 0) return ext ? "host " + n2ip(s.addr) : n2ip(s.addr);
  return n2ip(s.addr) + (show && !ext ? ", wildcard bits " : " ") + n2ip(s.wild);
}
// IOS shows well-known ports by name (22 and 443 stay numbers).
const PORT_SHOW = { tcp: { 20: "ftp-data", 21: "ftp", 23: "telnet", 25: "smtp", 53: "domain", 80: "www" },
  udp: { 53: "domain", 67: "bootps", 68: "bootpc", 69: "tftp", 123: "ntp", 161: "snmp" } };
const portName = (proto, n) => (PORT_SHOW[proto] || {})[n] ?? n;
const portStr = (p, proto) => !p ? "" : p.op === "range" ? `range ${portName(proto, p.a)} ${portName(proto, p.b)}` : `${p.op} ${portName(proto, p.a)}`;
function aceStr(type, e, show) {
  if (type === "standard") return aclAddr(e.src, false, show) + (e.log ? " log" : "");
  return [e.proto, aclAddr(e.src, true), portStr(e.srcPort, e.proto), aclAddr(e.dst, true), portStr(e.dstPort, e.proto), e.icmp, e.log && "log"]
    .filter(Boolean).join(" ");
}
const actionStr = (type, a) => (type === "standard" && a === "deny" ? "deny  " : a);

const PORT_NAMES = { "ftp-data": 20, ftp: 21, ssh: 22, telnet: 23, smtp: 25, domain: 53, bootps: 67, bootpc: 68, tftp: 69, www: 80,
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
      : `ip ${n2ip(c.ip)} ${c.gw === null ? "" : n2ip(c.gw) + " "}${maskLen(c.mask)}`,
    !c.ip6 ? "" : c.ip6.auto ? "ip auto" : `ip ${c.ip6.a}/${c.ip6.len}`].filter(Boolean).join("\n");
  }
  const pw = (p) => (c.pwEnc ? "7 " + type7(p) : p);
  const intfBlock = (n) => {
    const i = c.intfs[n], L = ["interface " + n];
    if (i.desc) L.push(" description " + i.desc);
    if (i.bw) L.push(" bandwidth " + i.bw);
    if (i.delay) L.push(" delay " + i.delay);
    if (i.encap) L.push(" encapsulation dot1Q " + i.encap.vlan + (i.encap.native ? " native" : ""));
    if (d.type === "router" || n.startsWith("Vlan")) {
      for (const s of i.secondary || []) L.push(` ip address ${n2ip(s.ip)} ${n2ip(s.mask)} secondary`);
      L.push(i.ip === null ? " no ip address" : ` ip address ${n2ip(i.ip)} ${n2ip(i.mask)}`);
    }
    if (d.type === "router") {
      for (const h of i.helpers) L.push(" ip helper-address " + n2ip(h));
      if (i.aclIn) L.push(` ip access-group ${i.aclIn} in`);
      if (i.aclOut) L.push(` ip access-group ${i.aclOut} out`);
      if (i.nat) L.push(" ip nat " + i.nat);
      if (i.hsrpVer === 2) L.push(" standby version 2");
      for (const [g, s] of Object.entries(i.standby).sort((a, b) => a[0] - b[0])) {
        const sg = +g === 0 ? " standby " : ` standby ${g} `;
        if (s.ip !== null) L.push(sg + "ip " + n2ip(s.ip));
        if (s.timers) L.push(sg + `timers ${s.timers[0]} ${s.timers[1]}`);
        if (s.prio !== 100) L.push(sg + "priority " + s.prio);
        if (s.preempt) L.push(sg + "preempt");
        if (s.auth) L.push(sg + "authentication " + (s.auth.startsWith("md5 ") ? "md5 key-string " + s.auth.slice(4) : s.auth.slice(5)));
        if (s.name) L.push(sg + "name " + s.name);
        if (s.mac) L.push(sg + "mac-address " + s.mac);
        if (s.follow) L.push(sg + "follow " + s.follow);
        for (const t of s.tracks) L.push(sg + `track ${t.obj} decrement ${t.dec}`);
      }
      const v6 = i.ipv6;
      if (v6.ll !== null) L.push(` ipv6 address ${v6.ll} link-local`);
      for (const a of v6.addrs) L.push(` ipv6 address ${a.a}/${a.len}${a.eui ? " eui-64" : ""}`);
      if (v6.auto) L.push(" ipv6 address autoconfig");
      if (v6.enable) L.push(" ipv6 enable");
      const o6 = i.ospf6;
      if (o6.ptp) L.push(" ipv6 ospf network point-to-point");
      if (o6.hello !== undefined) L.push(" ipv6 ospf hello-interval " + o6.hello);
      if (o6.dead !== undefined) L.push(" ipv6 ospf dead-interval " + o6.dead);
      if (o6.prio !== undefined) L.push(" ipv6 ospf priority " + o6.prio);
      if (o6.cost !== undefined) L.push(" ipv6 ospf cost " + o6.cost);
      if (o6.pid !== undefined) L.push(` ipv6 ospf ${o6.pid} area ${o6.area}`);
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
      const ps = i.psec;
      if (ps) {
        if (ps.max !== 1) L.push(" switchport port-security maximum " + ps.max);
        if (ps.on) L.push(" switchport port-security");
        if (ps.violation !== "shutdown") L.push(" switchport port-security violation " + ps.violation);
        if (ps.stickyOn) L.push(" switchport port-security mac-address sticky");
        for (const m of ps.macs) L.push(" switchport port-security mac-address " + m);
        for (const m of ps.sticky) L.push(" switchport port-security mac-address sticky " + m);
      }
      if (i.chan) L.push(` channel-group ${i.chan.group} mode ${i.chan.mode}`);
      const s = i.stp;
      if (s.portfast !== null) L.push(" spanning-tree portfast" + (s.portfast ? "" : " disable"));
      if (s.bpduguard !== null) L.push(" spanning-tree bpduguard " + (s.bpduguard ? "enable" : "disable"));
      if (s.cost) L.push(" spanning-tree cost " + s.cost);
      if (s.prio !== null) L.push(" spanning-tree port-priority " + s.prio);
      for (const [v, k] of Object.entries(s.vcost).sort((a, b) => a[0] - b[0])) L.push(` spanning-tree vlan ${v} cost ${k}`);
    }
    if (i.duplex) L.push(" duplex " + i.duplex);
    if (i.speed) L.push(" speed " + i.speed);
    if (!i.cdp) L.push(" no cdp enable");
    L.push(...svcIfConfig(d, n));
    if (i.shut) L.push(" shutdown");
    return L;
  };
  const wrap = (L) => {
    const body = L.join("\n") + "\n";
    return `Building configuration...\n\nCurrent configuration : ${body.length} bytes\n` + body;
  };
  if (onlyIf) return wrap(["!", ...intfBlock(onlyIf), "end"]);
  const L = ["!", "version 15.9", ...svcConfig(d, "service").slice(0, 2), c.pwEnc ? "service password-encryption" : "no service password-encryption",
    ...svcConfig(d, "service").slice(2), "!", "hostname " + c.hostname, "!"];
  if (c.enableSecret !== null) L.push("enable secret 5 " + md5ish(c.enableSecret));
  if (c.enablePassword !== null) L.push("enable password " + pw(c.enablePassword));
  L.push(...svcConfig(d, "logging"));
  L.push("!", ...svcConfig(d, "aaa"));
  if (c.tz) L.push(`clock timezone ${c.tz[0]} ${c.tz[1]} 0`);
  if (!c.domainLookup) L.push("no ip domain lookup");
  if (c.domain) L.push("ip domain name " + c.domain);
  L.push(...svcConfig(d, "global"));
  if (d.type === "router" && c.ipv6Routing) L.push("ipv6 unicast-routing");
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
  if (d.type === "switch") {
    const s = c.stp;
    L.push("spanning-tree mode " + s.mode);
    if (s.pfDefault) L.push("spanning-tree portfast default");
    if (s.bgDefault) L.push("spanning-tree portfast bpduguard default");
    L.push("spanning-tree extend system-id");
    const byPrio = {};
    for (const [v, p] of Object.entries(s.prio)) (byPrio[p] = byPrio[p] || []).push(+v);
    for (const [p, vs] of Object.entries(byPrio)) L.push(`spanning-tree vlan ${vlanStr(vs.sort((a, b) => a - b))} priority ${p}`);
    L.push("!");
  }
  if (d.type === "router" && Object.keys(c.tracks).length) {
    for (const [n, t] of Object.entries(c.tracks).sort((a, b) => a[0] - b[0])) L.push(`track ${n} interface ${t.ifn} line-protocol`);
    L.push("!");
  }
  L.push(...svcConfig(d, "objects"));
  for (const n of Object.keys(c.intfs).sort(ifSort)) L.push(...intfBlock(n), "!");
  if (d.type === "router" && c.eigrp) L.push(...eigrpConfig(c.eigrp), "!");
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
    if (o.redistStatic) L.push(" redistribute static" + (o.redistSubnets ? " subnets" : ""));
    if (o.defaultOriginate) L.push(" default-information originate" + (o.defaultAlways ? " always" : ""));
    L.push("!");
  }
  if (d.type === "router" && c.bgp) L.push(...bgpConfig(c), "!");
  if (d.type === "switch" && c.gateway !== null) L.push("ip default-gateway " + n2ip(c.gateway));
  if (d.type === "router") {
    for (const p of Object.values(c.nat.pools)) L.push(`ip nat pool ${p.name} ${n2ip(p.start)} ${n2ip(p.end)} netmask ${n2ip(p.mask)}`);
    for (const r of c.nat.dyn) {
      L.push(`ip nat inside source list ${r.acl} ${r.intf ? "interface " + r.intf : "pool " + r.pool}${r.overload ? " overload" : ""}`);
    }
    for (const s of c.nat.statics) L.push(`ip nat inside source static ${n2ip(s.local)} ${n2ip(s.global)}`);
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
    L.push(...bgpPolicyConfig(c));
    for (const r of c.routes6) L.push(["ipv6 route", `${r.net}/${r.len}`, r.ifn, r.nh, r.ad !== 1 ? r.ad : null].filter((x) => x !== null && x !== undefined).join(" "));
    if (c.ospf6) {
      const o = c.ospf6;
      L.push("!", "ipv6 router ospf " + o.pid);
      if (o.rid !== null) L.push(" router-id " + n2ip(o.rid));
      if (o.refBw !== 100) L.push(" auto-cost reference-bandwidth " + o.refBw);
      if (o.passiveDefault) {
        L.push(" passive-interface default");
        for (const n of o.noPassive) L.push(" no passive-interface " + n);
      } else for (const n of o.passive) L.push(" passive-interface " + n);
      if (o.defaultOriginate) L.push(" default-information originate" + (o.defaultAlways ? " always" : ""));
    }
  }
  L.push(...svcConfig(d, "late"));
  L.push("!");
  if (!c.cdp) L.push("no cdp run", "!");
  L.push(...svcConfig(d, "banners"));
  if (c.banner) L.push("banner motd ^C" + c.banner + "^C");
  const line = (title, l, vty) => {
    L.push(title);
    if (l.timeout) L.push(` exec-timeout ${l.timeout[0]} ${l.timeout[1]}`);
    if (l.password !== null) L.push(" password " + pw(l.password));
    if (l.sync) L.push(" logging synchronous");
    if (l.authList) L.push(" login authentication " + l.authList);
    // Under AAA the method lists decide; IOS stops printing the old login commands.
    if (svcOf(d).aaa.on) { /* nothing */ } else if (l.login === "local") L.push(" login local");
    else if (l.login === "line") L.push(" login");
    else if (vty) L.push(" no login");
    if (vty && l.transport !== "all") L.push(" transport input " + l.transport);
  };
  line("line con 0", c.lines.con, false);
  line("line vty 0 4", c.lines.vty0, true);
  if (c.lines.vty5) line("line vty 5 15", c.lines.vty5, true);
  L.push("!");
  L.push(...svcConfig(d, "tail"));
  L.push("end");
  return wrap(L);
}

function eigrpConfig(e) {
  const net = (n) => (n.wild === null ? "network " + n2ip(n.addr) : `network ${n2ip(n.addr)} ${n2ip(n.wild)}`);
  const kDefault = e.k.join() === "1,0,1,0,0";
  if (!e.name) {
    const L = ["router eigrp " + e.asn];
    if (!kDefault) L.push(" metric weights 0 " + e.k.join(" "));
    if (e.variance > 1) L.push(" variance " + e.variance);
    for (const n of e.networks) L.push(" " + net(n));
    if (e.redistStatic) L.push(" redistribute static");
    if (e.passiveDefault) {
      L.push(" passive-interface default");
      for (const n of e.noPassive) L.push(" no passive-interface " + n);
    } else for (const n of e.passive) L.push(" passive-interface " + n);
    if (e.rid !== null) L.push(" eigrp router-id " + n2ip(e.rid));
    return L;
  }
  const L = ["router eigrp " + e.name, " !", ` address-family ipv4 unicast autonomous-system ${e.asn}`];
  if (e.passiveDefault) L.push("  !", "  af-interface default", "   passive-interface", "  exit-af-interface");
  for (const n of e.passiveDefault ? e.noPassive : e.passive) {
    L.push("  !", "  af-interface " + n, e.passiveDefault ? "   no passive-interface" : "   passive-interface", "  exit-af-interface");
  }
  L.push("  !", "  topology base");
  if (e.variance > 1) L.push("   variance " + e.variance);
  if (e.redistStatic) L.push("   redistribute static");
  L.push("  exit-af-topology");
  for (const n of e.networks) L.push("  " + net(n));
  if (!kDefault) L.push("  metric weights 0 " + e.k.join(" ") + " 0");
  if (e.rid !== null) L.push("  eigrp router-id " + n2ip(e.rid));
  L.push(" exit-address-family");
  return L;
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
    if (r.code === "B") {
      return r.paths.map((x, i) => (i ? "".padEnd(pfx.length + 1) : pfx + " ") + `[${r.ad}/${r.metric}] via ${x.ifn === "Null0" ? "0.0.0.0" : n2ip(x.ip)}, 00:00:12${x.ifn ? ", " + x.ifn : ""}`);
    }
    if (r.code[0] === "S") {
      const p = r.paths[0];
      if (p.ip === null) return [`${pfx} is directly connected, ${p.ifn}`];
      return r.paths.map((x, i) => (i ? "".padEnd(pfx.length + 1) : pfx + " ") + `[${r.ad}/0] via ${n2ip(x.ip)}${x.ifn ? ", " + x.ifn : ""}`);
    }
    return r.paths.map((x, i) => (i ? "".padEnd(pfx.length + 1) : pfx + " ") + `[${r.ad}/${x.metric ?? r.metric}] via ${n2ip(x.ip)}, 00:00:12, ${x.ifn}`);
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
    const i = d.cfg.intfs[n], s = net.ifState(dn, n), err = net.errdis(dn, n);
    const hw = n.startsWith("Loopback") ? "Loopback" : n.startsWith("Vlan") ? "EtherSVI" : isPo(n) ? "EtherChannel"
      : d.type === "router" ? "iGbE" : "Fast Ethernet";
    L.push(`${n} is ${s.status}, line protocol is ${s.proto}${err ? " (err-disabled)" : ""}`);
    L.push(`  Hardware is ${hw}${n.startsWith("Loopback") ? "" : `, address is ${net.mac(dn, n)} (bia ${net.mac(dn, n)})`}`);
    if (i.desc) L.push("  Description: " + i.desc);
    if (i.ip !== null) L.push(`  Internet address is ${n2ip(i.ip)}/${maskLen(i.mask)}`);
    L.push(`  MTU ${n.startsWith("Loopback") ? 1514 : 1500} bytes, BW ${net.bandwidth(d, n)} Kbit/sec, DLY ${net.delay(d, n) * 10} usec,`);
    L.push("     reliability 255/255, txload 1/255, rxload 1/255");
    if (i.encap) L.push(`  Encapsulation 802.1Q Virtual LAN, Vlan ID  ${i.encap.vlan}.`);
    else L.push(`  Encapsulation ${n.startsWith("Loopback") ? "LOOPBACK" : "ARPA"}, loopback not set`);
    if (isPo(n)) {
      const po = net.ec()[dn].po[poNum(n)];
      const mem = po ? po.members.filter((p) => net.member(dn, p).flag === "P") : [];
      L.push(`  Members in this channel: ${mem.map(shortIf).join(" ")}`.trimEnd());
    }
    if (!isSub(n) && !n.startsWith("Loopback") && !n.startsWith("Vlan") && !isPo(n)) {
      const speed = ifType(n) === "FastEthernet" ? "100Mb/s" : "1000Mb/s";
      L.push(s.proto === "up" ? `  Full-duplex, ${speed}, media type is RJ45` : "  Auto-duplex, Auto-speed, media type is RJ45");
    }
  }
  return L.join("\n");
}

function vlanPorts(net, d, v) {
  return net.l2ports(d).filter((p) => net.swMode(d, p) === "access" && d.cfg.intfs[p].accessVlan === v).map(shortIf);
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
  const trunks = net.l2ports(d).filter((p) => net.lup(dn, p) && net.swMode(d, p) === "trunk");
  if (!trunks.length) return "";
  const modeOf = (p) => ({ trunk: "on", "dynamic desirable": "desirable", "dynamic auto": "auto", access: "off" })[d.cfg.intfs[p].mode];
  const allowed = (p) => d.cfg.intfs[p].allowed === null ? [...Array(4094)].map((_, i) => i + 1) : d.cfg.intfs[p].allowed;
  const active = (p) => allowed(p).filter((v) => d.cfg.vlans[v]);
  const L = ["", "Port        Mode             Encapsulation  Status        Native vlan"];
  for (const p of trunks) L.push(pad(shortIf(p), 12) + pad(modeOf(p), 17) + pad("802.1q", 15) + pad("trunking", 14) + d.cfg.intfs[p].native);
  L.push("", "Port        Vlans allowed on trunk");
  for (const p of trunks) L.push(pad(shortIf(p), 12) + (vlanStr(allowed(p)) || "none"));
  L.push("", "Port        Vlans allowed and active in management domain");
  for (const p of trunks) L.push(pad(shortIf(p), 12) + (vlanStr(active(p)) || "none"));
  L.push("", "Port        Vlans in spanning tree forwarding state and not pruned");
  for (const p of trunks) L.push(pad(shortIf(p), 12) + (vlanStr(active(p).filter((v) => net.stpFwd(dn, p, v))) || "none"));
  return L.join("\n");
}

function showIntStatus(net, dn, errOnly, only) {
  const d = net.devs[dn];
  if (errOnly) {
    const L = ["", "Port      Name               Status       Reason               Err-disabled Vlans"];
    for (const p of d.ports) {
      const r = net.errdis(dn, p);
      if (r) L.push(pad(shortIf(p), 10) + pad(d.cfg.intfs[p].desc.slice(0, 18), 19) + pad("err-disabled", 13) + r);
    }
    return L.join("\n");
  }
  const L = ["", "Port      Name               Status       Vlan       Duplex  Speed Type"];
  for (const p of [...Object.keys(d.cfg.intfs).filter(isPo).sort(ifSort), ...d.ports]) {
    if (only && p !== only) continue;
    const i = d.cfg.intfs[p], up = isPo(p) ? net.lup(dn, p) : net.portUp(dn, p);
    const status = net.errdis(dn, p) ? "err-disabled" : i.shut ? "disabled" : up ? "connected" : "notconnect";
    const vlan = net.swMode(d, p) === "trunk" ? "trunk" : i.accessVlan;
    const fast = ifType(p) === "FastEthernet";
    L.push(pad(shortIf(p), 10) + pad(i.desc.slice(0, 18), 19) + pad(status, 13) + pad(vlan, 11)
      + lpad(up ? "a-full" : "auto", 6) + lpad(up ? (fast ? "a-100" : "a-1000") : "auto", 7) + " " + (isPo(p) ? "" : fast ? "10/100BaseTX" : "10/100/1000BaseTX"));
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
  const secure = {};
  for (const p of d.ports) {
    const ps = d.cfg.intfs[p].psec;
    if (ps && ps.on) for (const m of [...ps.macs, ...ps.sticky]) secure[d.cfg.intfs[p].accessVlan + "|" + m] = p;
  }
  const rows = Object.entries({ ...d.rt.mac, ...secure }).map(([k, port]) => { const [v, mac] = k.split("|"); return { v: +v, mac, port, type: secure[k] ? "STATIC" : "DYNAMIC" }; })
    .filter((r) => net.lup(dn, r.port) || r.type === "STATIC").sort((a, b) => a.v - b.v || a.mac.localeCompare(b.mac));
  const L = ["          Mac Address Table", "-------------------------------------------", "",
    "Vlan    Mac Address       Type        Ports", "----    -----------       --------    -----"];
  for (const r of rows) L.push(lpad(r.v, 4) + "    " + pad(r.mac, 18) + pad(r.type, 12) + shortIf(r.port));
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
      L.push(`    ${e.seq} ${actionStr(a.type, e.action)} ${aceStr(a.type, e, true)}${hits ? ` (${hits} match${hits > 1 ? "es" : ""})` : ""}`);
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
  const d = net.devs[dn], o = d.cfg.ospf, e = d.cfg.eigrp;
  const L = ['*** IP Routing is NSF aware ***', ""];
  if (e) {
    const per = net.eigrp()[dn], rid = per ? per.rid : null;
    L.push(`Routing Protocol is "eigrp ${e.asn}"`, "  Outgoing update filter list for all interfaces is not set",
      "  Incoming update filter list for all interfaces is not set", "  Default networks flagged in outgoing updates",
      "  Default networks accepted from incoming updates", `  EIGRP-IPv4${e.name ? ` VR(${e.name}) Address-Family` : ""} Protocol for AS(${e.asn})`,
      `    Metric weight K1=${e.k[0]}, K2=${e.k[1]}, K3=${e.k[2]}, K4=${e.k[3]}, K5=${e.k[4]}`,
      `    Router-ID: ${rid === null ? "0.0.0.0" : n2ip(rid)}`, "    Topology : 0 (base)", "      Active Timer: 3 min",
      "      Distance: internal 90 external 170", "      Maximum path: 4", "      Maximum hopcount 100",
      `      Maximum metric variance ${e.variance}`, "", "  Automatic Summarization: disabled", "  Maximum path: 4", "  Routing for Networks:");
    for (const n of e.networks) L.push("    " + n2ip(n.addr) + (n.wild === null ? "" : "/" + (32 - bitCount(n.wild))));
    const passive = per ? per.ifs.filter((i) => i.passive).map((i) => i.ifn) : [];
    if (passive.length) { L.push("  Passive Interface(s):"); for (const p of passive) L.push("    " + p); }
    L.push("  Routing Information Sources:", "    Gateway         Distance      Last Update");
    for (const n of per ? per.nbrs : []) L.push("    " + pad(n2ip(n.ip), 16) + lpad("90", 8) + "      00:00:12");
    L.push("  Distance: internal 90 external 170", "");
  }
  if (d.cfg.bgp) L.push(...bgpProtocols(net, dn));
  if (!o) return L.join("\n");
  const rid = net.routerId(dn);
  L.push(`Routing Protocol is "ospf ${o.pid}"`, "  Outgoing update filter list for all interfaces is not set",
    "  Incoming update filter list for all interfaces is not set", `  Router ID ${rid === null ? "0.0.0.0" : n2ip(rid)}`);
  if (o.redistStatic) L.push("  It is an autonomous system boundary router", "  Redistributing External Routes from,", "    static" + (o.redistSubnets ? ", includes subnets in redistribution" : ""));
  L.push("  Maximum path: 4", "  Routing for Networks:");
  for (const n of o.networks) L.push(`    ${n2ip(n.addr)} ${n2ip(n.wild)} area ${n.area}`);
  const per = net.ospf()[dn];
  const passive = per ? per.ifs.filter((i) => i.passive).map((i) => i.ifn) : [];
  if (passive.length) { L.push("  Passive Interface(s):"); for (const p of passive) L.push("    " + p); }
  L.push("  Routing Information Sources:", "    Gateway         Distance      Last Update");
  for (const n of per ? per.nbrs : []) L.push("    " + pad(n2ip(n.rid), 16) + pad("110", 14) + "00:00:12");
  L.push("  Distance: (default is 110)");
  return L.join("\n");
}

// ---- spanning tree, EtherChannel, port security
function showSpanningTree(net, dn, only) {
  const d = net.devs[dn], L = [];
  const vlans = only ? [only] : Object.keys(d.cfg.vlans).map(Number).sort((a, b) => a - b);
  const proto = d.cfg.stp.mode === "rapid-pvst" ? "rstp" : "ieee";
  for (const v of vlans) {
    const s = net.stp(v)[dn];
    if (!s) continue;
    L.push("", "VLAN" + String(v).padStart(4, "0"), `  Spanning tree enabled protocol ${proto}`,
      `  Root ID    Priority    ${s.root[0]}`, `             Address     ${dotted(s.root[1])}`);
    if (s.rootPort === null) L.push("             This bridge is the root");
    else L.push(`             Cost        ${s.cost}`, `             Port        ${s.ports[s.rootPort].pid.num} (${s.rootPort})`);
    L.push("             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec", "",
      `  Bridge ID  Priority    ${s.bid[0]}  (priority ${s.bid[0] - v} sys-id-ext ${v})`, `             Address     ${dotted(s.bid[1])}`,
      "             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec", "             Aging Time  300 sec", "",
      "Interface           Role Sts Cost      Prio.Nbr Type", "------------------- ---- --- --------- -------- --------------------------------");
    for (const p of Object.keys(s.ports).sort(ifSort)) {
      const x = s.ports[p];
      const type = "P2p" + (x.edge ? " Edge" : "") + (x.inc ? " *" + x.inc : "");
      L.push(pad(shortIf(p), 20) + pad(x.role, 5) + pad(x.state === "BKN" ? "BKN*" : x.state, 4) + pad(x.cost, 10) + pad(`${x.pid.prio}.${x.pid.num}`, 9) + type);
    }
  }
  if (!L.length) return only ? `Spanning tree instance(s) for vlan ${only} does not exist.` : "No spanning tree instances exist.";
  return L.slice(1).join("\n");
}

function showStpSummary(net, dn) {
  const d = net.devs[dn], s = d.cfg.stp;
  const roots = Object.keys(d.cfg.vlans).map(Number).filter((v) => { const x = net.stp(v)[dn]; return x && x.rootPort === null; });
  const L = [`Switch is in ${s.mode} mode`, `Root bridge for: ${roots.length ? roots.map((v) => "VLAN" + String(v).padStart(4, "0")).join(", ") : "none"}`,
    "Extended system ID                      is enabled", `Portfast Default                        is ${s.pfDefault ? "enabled" : "disabled"}`,
    `PortFast BPDU Guard Default             is ${s.bgDefault ? "enabled" : "disabled"}`, "", "Name                   Blocking Listening Learning Forwarding STP Active",
    "---------------------- -------- --------- -------- ---------- ----------"];
  for (const v of Object.keys(d.cfg.vlans).map(Number).sort((a, b) => a - b)) {
    const x = net.stp(v)[dn];
    if (!x) continue;
    const ps = Object.values(x.ports), blk = ps.filter((p) => p.state !== "FWD").length;
    L.push(pad("VLAN" + String(v).padStart(4, "0"), 23) + lpad(blk, 8) + lpad(0, 10) + lpad(0, 9) + lpad(ps.length - blk, 11) + lpad(ps.length, 11));
  }
  return L.join("\n");
}

function showEtherchannel(net, dn) {
  const ec = net.ec()[dn];
  const groups = Object.keys(ec.po).map(Number).sort((a, b) => a - b);
  const L = ["Flags:  D - down        P - bundled in port-channel", "        I - stand-alone s - suspended", "        H - Hot-standby (LACP only)",
    "        R - Layer3      S - Layer2", "        U - in use      f - failed to allocate aggregator", "",
    "        M - not in use, minimum links not met", "        u - unsuitable for bundling", "        w - waiting to be aggregated",
    "        d - default port", "", "", `Number of channel-groups in use: ${groups.length}`, `Number of aggregators:           ${groups.length}`, "",
    "Group  Port-channel  Protocol    Ports", "------+-------------+-----------+-----------------------------------------------"];
  for (const g of groups) {
    const po = ec.po[g];
    const proto = po.proto === "lacp" ? "LACP" : po.proto === "pagp" ? "PAgP" : "-";
    const ports = po.members.map((p) => pad(`${shortIf(p)}(${ec.members[p].flag})`, 12)).join("").trimEnd();
    L.push(pad(g, 7) + pad(`Po${g}(S${po.up ? "U" : "D"})`, 16) + pad(proto, 10) + ports);
  }
  return L.join("\n");
}

const EC_STATE = { active: "Active", passive: "Passive", on: "On", desirable: "Desirable-Sl", auto: "Automatic-Sl" };
function showEcPortChannel(net, dn, only, detail) {
  const d = net.devs[dn], ec = net.ec()[dn];
  const groups = Object.keys(ec.po).map(Number).filter((g) => !only || g === only).sort((a, b) => a - b);
  if (only && !groups.length) return `Channel-group ${only} does not exist`;
  const L = ["                Channel-group listing:", "                ----------------------", ""];
  for (const g of groups) {
    const po = ec.po[g], bundled = po.members.filter((p) => ec.members[p].flag === "P");
    L.push(`Group: ${g}`, "----------");
    if (detail) {
      L.push(`Group state = L2`, `Ports: ${po.members.length}   Maxports = ${po.proto === "pagp" ? 8 : 16}`,
        `Port-channels: 1 Max Port-channels = ${po.proto === "pagp" ? 8 : 16}`, `Protocol:   ${po.proto === "lacp" ? "LACP" : po.proto === "pagp" ? "PAgP" : "-"}`,
        "                Ports in the group:", "                -------------------");
      for (const p of po.members) {
        const m = ec.members[p];
        L.push(`Port: ${shortIf(p)}`, "------------", "",
          `Port state    = ${m.flag === "P" ? "Up Mstr Assoc In-Bndl" : m.flag === "D" ? "Down Not-in-Bndl" : m.flag === "s" ? "Up Mstr Susp" : "Up Indep"}`,
          `Channel group = ${g}           Mode = ${EC_STATE[m.mode].replace("-Sl", "")}        Gcchange = -`,
          `Port-channel  = ${m.flag === "P" ? "Po" + g : "null"}            GC   =   -             Pseudo port-channel = Po${g}`,
          `Port index    = 0           Load = 0x00          Protocol = ${po.proto === "lacp" ? "LACP" : po.proto === "pagp" ? "PAgP" : "   -"}`, "");
      }
    }
    L.push("                Port-channels in the group:", "                ---------------------------", "",
      `Port-channel: Po${g}${po.proto === "lacp" ? "    (Primary Aggregator)" : ""}`, "", "------------", "",
      "Age of the Port-channel   = 0d:00h:12m:31s", `Logical slot/port   = 2/${g}          Number of ports = ${bundled.length}`,
      "HotStandBy port = null", `Port state          = ${po.up ? "Port-channel Ag-Inuse" : "Port-channel Ag-Not-Inuse"}`,
      `Protocol            =   ${po.proto === "lacp" ? "LACP" : po.proto === "pagp" ? "PAgP" : "-"}`, "Port security       = Disabled", "",
      "Ports in the Port-channel:", "", "Index   Load   Port     EC state        No of bits", "------+------+------+------------------+-----------");
    bundled.forEach((p, i) => L.push(`  ${i}     00     ${pad(shortIf(p), 9)}${pad(EC_STATE[ec.members[p].mode], 19)}0`));
    L.push("");
  }
  return L.join("\n");
}

function showLacpNbr(net, dn, proto) {
  const d = net.devs[dn], ec = net.ec()[dn];
  const L = proto === "lacp"
    ? ["Flags:  S - Device is requesting Slow LACPDUs", "        F - Device is requesting Fast LACPDUs",
      "        A - Device is in Active mode       P - Device is in Passive mode", ""]
    : ["Flags:  S - Device is sending Slow hello.  C - Device is in Consistent state.",
      "        A - Device is in Auto mode.        P - Device learns on physical port.", ""];
  for (const g of Object.keys(ec.po).map(Number).sort((a, b) => a - b)) {
    const po = ec.po[g];
    if (po.proto !== proto) continue;
    L.push(`Channel group ${g} neighbors`, "");
    if (proto === "lacp") L.push("Partner's information:", "", "                  LACP port                        Admin  Oper   Port    Port",
      "Port      Flags   Priority  Dev ID          Age    key    Key    Number  State");
    else L.push("          Partner              Partner          Partner         Partner Group", "Port      Name                 Device ID        Port       Age  Flags   Cap.");
    for (const p of po.members) {
      const pr = net.peer(dn, p), far = pr && net.member(pr.dev, pr.port);
      if (!far || far.proto !== proto || !net.portUp(dn, p)) continue;
      const fd = net.devs[pr.dev], id = dotted("0cd5" + hex(fd.idx, 2) + "008000");
      if (proto === "lacp") {
        L.push(pad(shortIf(p), 10) + pad("S" + (far.mode === "active" ? "A" : "P"), 8) + pad("32768", 10) + pad(id, 16) + pad("10s", 7) + pad("0x0", 7)
          + pad("0x" + far.group.toString(16), 7) + pad("0x" + (fd.ports.indexOf(pr.port) + 0x101).toString(16).toUpperCase(), 8) + (far.flag === "P" ? "0x3D" : "0x45"));
      } else {
        L.push(pad(shortIf(p), 10) + pad(fd.cfg.hostname, 21) + pad(id, 17) + pad(shortIf(pr.port), 11) + pad("19s", 5) + pad("SC" + (far.mode === "auto" ? "A" : ""), 8) + "10001");
      }
    }
    L.push("");
  }
  return L.join("\n");
}

function showStpInterface(net, dn, p) {
  const d = net.devs[dn], rows = [];
  for (const v of Object.keys(d.cfg.vlans).map(Number).sort((a, b) => a - b)) {
    const s = net.stp(v)[dn], x = s && s.ports[p];
    if (x) rows.push(pad("VLAN" + String(v).padStart(4, "0"), 20) + pad(x.role, 5) + pad(x.state === "BKN" ? "BKN*" : x.state, 4) + pad(x.cost, 10)
      + pad(`${x.pid.prio}.${x.pid.num}`, 9) + "P2p" + (x.edge ? " Edge" : "") + (x.inc ? " *" + x.inc : ""));
  }
  if (!rows.length) return `no spanning tree info available for ${p}`;
  return ["", "Vlan                Role Sts Cost      Prio.Nbr Type", "------------------- ---- --- --------- -------- --------------------------------", ...rows].join("\n");
}

function showStpRoot(net, dn) {
  const d = net.devs[dn];
  const L = ["", "                                        Root    Hello Max Fwd", "Vlan                   Root ID          Cost    Time  Age Dly  Root Port",
    "---------------- -------------------- --------- ----- --- ---  ------------"];
  for (const v of Object.keys(d.cfg.vlans).map(Number).sort((a, b) => a - b)) {
    const s = net.stp(v)[dn];
    if (!s) continue;
    L.push(pad("VLAN" + String(v).padStart(4, "0"), 17) + pad(`${s.root[0]} ${dotted(s.root[1])}`, 21) + lpad(s.cost, 9) + lpad(2, 6) + lpad(20, 4) + lpad(15, 4)
      + "  " + (s.rootPort ? shortIf(s.rootPort) : ""));
  }
  return L.join("\n");
}

function showStpBlocked(net, dn) {
  const d = net.devs[dn];
  const L = ["", "Name                 Blocked Interfaces List", "-------------------- ------------------------------------"];
  let n = 0;
  for (const v of Object.keys(d.cfg.vlans).map(Number).sort((a, b) => a - b)) {
    const s = net.stp(v)[dn];
    const b = s ? Object.keys(s.ports).filter((p) => s.ports[p].state !== "FWD").sort(ifSort) : [];
    if (!b.length) continue;
    n += b.length;
    L.push(pad("VLAN" + String(v).padStart(4, "0"), 21) + b.map(shortIf).join(", "));
  }
  L.push("", `Number of blocked ports (segments) in the system : ${n}`);
  return L.join("\n");
}

const PSEC_ACTION = { shutdown: "Shutdown", restrict: "Restrict", protect: "Protect" };
function showPortSecurity(net, dn) {
  const d = net.devs[dn];
  const L = ["Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action", "                (Count)       (Count)          (Count)",
    "---------------------------------------------------------------------------"];
  let total = 0;
  for (const p of d.ports) {
    const ps = d.cfg.intfs[p].psec, rt = d.rt.psec[p] || { dyn: [], violations: 0 };
    if (!ps || !ps.on) continue;
    const cur = ps.macs.length + ps.sticky.length + rt.dyn.length;
    total += Math.max(0, cur - 1);
    L.push(lpad(shortIf(p), 13) + lpad(ps.max, 15) + lpad(cur, 13) + lpad(rt.violations, 19) + lpad(PSEC_ACTION[ps.violation], 17));
  }
  L.push("---------------------------------------------------------------------------",
    `Total Addresses in System (excluding one mac per port)     : ${total}`, "Max Addresses limit in System (excluding one mac per port) : 4096");
  return L.join("\n");
}

function showPortSecurityIf(net, dn, p) {
  const d = net.devs[dn], ps = d.cfg.intfs[p].psec, rt = d.rt.psec[p] || { dyn: [], violations: 0, last: null };
  const on = !!ps && ps.on;
  const status = !on ? "Secure-down" : net.errdis(dn, p) === "psecure-violation" ? "Secure-shutdown" : net.portUp(dn, p) ? "Secure-up" : "Secure-down";
  const x = ps || { max: 1, violation: "shutdown", macs: [], sticky: [] };
  return [`Port Security              : ${on ? "Enabled" : "Disabled"}`, `Port Status                : ${status}`,
    `Violation Mode             : ${PSEC_ACTION[x.violation]}`, "Aging Time                 : 0 mins", "Aging Type                 : Absolute",
    "SecureStatic Address Aging : Disabled", `Maximum MAC Addresses      : ${x.max}`,
    `Total MAC Addresses        : ${x.macs.length + x.sticky.length + rt.dyn.length}`, `Configured MAC Addresses   : ${x.macs.length}`,
    `Sticky MAC Addresses       : ${x.sticky.length}`, `Last Source Address:Vlan   : ${rt.last || "0000.0000.0000:0"}`,
    `Security Violation Count   : ${rt.violations}`].join("\n");
}

function showPsecAddress(net, dn) {
  const d = net.devs[dn];
  const L = ["               Secure Mac Address Table", "-----------------------------------------------------------------------------",
    "Vlan    Mac Address       Type                          Ports   Remaining Age", "                                                                   (mins)",
    "----    -----------       ----                          -----   -------------"];
  let n = 0;
  for (const p of d.ports) {
    const ps = d.cfg.intfs[p].psec, rt = d.rt.psec[p] || { dyn: [] };
    if (!ps || !ps.on) continue;
    const v = d.cfg.intfs[p].accessVlan;
    for (const [list, type] of [[ps.macs, "SecureConfigured"], [ps.sticky, "SecureSticky"], [rt.dyn, "SecureDynamic"]]) {
      for (const m of list) { L.push(lpad(v, 4) + "    " + pad(m, 18) + pad(type, 30) + pad(shortIf(p), 10) + "-"); n++; }
    }
  }
  L.push("-----------------------------------------------------------------------------", `Total Addresses in System (excluding one mac per port)     : ${Math.max(0, n - 1)}`,
    "Max Addresses limit in System (excluding one mac per port) : 4096");
  return L.join("\n");
}

// ---- NAT, HSRP, tracking
function showNatTranslations(net, dn) {
  const d = net.devs[dn], c = d.cfg.nat;
  const L = [pad("Pro", 5) + pad("Inside global", 22) + pad("Inside local", 22) + pad("Outside local", 22) + "Outside global"];
  const hp = (ip, port) => n2ip(ip) + ":" + port;
  for (const e of d.rt.nat) {
    if (e.addr) L.push(pad("---", 5) + pad(n2ip(e.ig), 22) + pad(n2ip(e.il), 22) + pad("---", 22) + "---");
    else L.push(pad(e.proto, 5) + pad(hp(e.ig, e.gid), 22) + pad(hp(e.il, e.id), 22) + pad(hp(e.ol, e.id), 22) + hp(e.og, e.id));
  }
  for (const s of c.statics) L.push(pad("---", 5) + pad(n2ip(s.global), 22) + pad(n2ip(s.local), 22) + pad("---", 22) + "---");
  return L.join("\n");
}

function showNatStats(net, dn) {
  const d = net.devs[dn], c = d.cfg.nat, rt = d.rt;
  const flows = rt.nat.filter((e) => !e.addr).length, dyn = rt.nat.length;
  const ifs = (k) => Object.keys(d.cfg.intfs).filter((n) => d.cfg.intfs[n].nat === k).sort(ifSort);
  const L = [`Total active translations: ${c.statics.length + dyn} (${c.statics.length} static, ${dyn} dynamic; ${flows} extended)`,
    "Outside interfaces:", ...ifs("outside").map((n) => "  " + n), "Inside interfaces: ", ...ifs("inside").map((n) => "  " + n),
    `Hits: ${rt.natStats.hits}  Misses: ${rt.natStats.misses}`, "Expired translations: 0", "Dynamic mappings:"];
  if (c.dyn.length) L.push("-- Inside Source");
  c.dyn.forEach((r, i) => {
    if (r.intf) L.push(`[Id: ${i + 1}] access-list ${r.acl} interface ${r.intf} refcount ${rt.nat.filter((e) => !e.addr).length}`);
    else {
      const p = c.pools[r.pool];
      L.push(`[Id: ${i + 1}] access-list ${r.acl} pool ${r.pool} refcount ${rt.nat.filter((e) => e.addr || r.overload).length}`);
      if (p) {
        const used = rt.nat.filter((e) => e.addr && e.ig >= p.start && e.ig <= p.end).length;
        L.push(` pool ${r.pool}: netmask ${n2ip(p.mask)}`, `\tstart ${n2ip(p.start)} end ${n2ip(p.end)}`,
          `\ttype generic, total addresses ${p.end - p.start + 1}, allocated ${used} (${Math.floor((used * 100) / (p.end - p.start + 1))}%), misses ${rt.natStats.misses}`);
      }
    }
  });
  return L.join("\n");
}

// The virtual MAC: configured, or derived from the group number and version.
function hsrpMac(i, g) {
  const s = i.standby[g];
  if (s && s.mac) return s.mac;
  return i.hsrpVer === 2 ? dotted("00000c9ff" + hex(+g, 3)) : dotted("00000c07ac" + hex(+g, 2));
}

// The routers in the same HSRP group as dn's interface ifn, with their roles.
function hsrpPeers(net, dn, ifn, g) {
  const out = [];
  for (const e of net.flood(dn, ifn)) {
    const h = net.devs[e.dev].type === "router" && net.devs[e.dev].rt.hsrp[e.ifn + "|" + g];
    if (h) out.push({ ...h, ip: net.ifAddr(e.dev, e.ifn).ip, prio: net.hsrpPrio(e.dev, net.devs[e.dev].cfg.intfs[e.ifn].standby[g]) });
  }
  return out;
}

function showStandby(net, dn, brief) {
  const d = net.devs[dn], L = [];
  if (brief) L.push("                     P indicates configured to preempt.", "                     |",
    "Interface   Grp  Pri P State   Active          Standby         Virtual IP");
  for (const n of Object.keys(d.cfg.intfs).sort(ifSort)) {
    const i = d.cfg.intfs[n];
    for (const [g, s] of Object.entries(i.standby).sort((a, b) => a[0] - b[0])) {
      const h = d.rt.hsrp[n + "|" + g] || { state: "Init", vip: null, changes: 0 };
      const peers = hsrpPeers(net, dn, n, g);
      const act = h.state === "Active" ? "local" : (peers.find((p) => p.state === "Active") || {}).ip;
      const stb = h.state === "Standby" ? "local" : (peers.find((p) => p.state === "Standby") || {}).ip;
      const fmt = (x) => (x === undefined ? "unknown" : x === "local" ? "local" : n2ip(x));
      const prio = net.hsrpPrio(dn, s), vip = h.vip ?? s.ip;
      if (brief) {
        L.push(pad(shortIf(n), 12) + pad(g, 5) + lpad(prio, 3) + " " + (s.preempt ? "P" : " ") + " " + pad(h.state, 8) + pad(fmt(act), 16)
          + pad(fmt(stb), 16) + (vip === null ? "unknown" : n2ip(vip)));
        continue;
      }
      const vm = hsrpMac(i, g);
      L.push(`${n} - Group ${g}${i.hsrpVer === 2 ? " (version 2)" : ""}`, `  State is ${h.state}`, `    ${h.changes} state change${h.changes === 1 ? "" : "s"}, last state change 00:01:12`,
        `  Virtual IP address is ${vip === null ? "unknown" : n2ip(vip)}`, `  Active virtual MAC address is ${act === undefined ? "unknown" : vm}${h.state === "Active" ? " (MAC In Use)" : ""}`,
        `    Local virtual MAC address is ${vm} (v${i.hsrpVer || 1} default)`,
        `  Hello time ${s.timers ? s.timers[0] : 3} sec, hold time ${s.timers ? s.timers[1] : 10} sec`,
        ...(s.auth ? [`  Authentication ${s.auth.startsWith("md5 ") ? "MD5, key-string" : `text, string "${s.auth.slice(5)}"`}`] : []),
        `  Preemption ${s.preempt ? "enabled" : "disabled"}`, `  Active router is ${fmt(act)}`,
        `  Standby router is ${fmt(stb)}${stb !== undefined && stb !== "local" ? ", priority " + ((peers.find((p) => p.state === "Standby") || {}).prio) + " (expires in 9.312 sec)" : ""}`,
        `  Priority ${prio} (configured ${s.prio})`);
      for (const t of s.tracks) {
        const tr = d.cfg.tracks[t.obj];
        L.push(`    Track object ${t.obj} state ${net.trackUp(dn, t.obj) ? "Up" : "Down"} decrement ${t.dec}` + (tr ? "" : " (not configured)"));
      }
      L.push(s.name ? `  Group name is "${s.name}" (cfgd)` : `  Group name is "hsrp-${shortIf(n)}-${g}" (default)`);
    }
  }
  return L.join("\n");
}

function showTrack(net, dn) {
  const d = net.devs[dn], L = [];
  for (const [n, t] of Object.entries(d.cfg.tracks).sort((a, b) => a[0] - b[0])) {
    L.push(`Track ${n}`, `  Interface ${t.ifn} line-protocol`, `  Line protocol is ${net.ifUp(dn, t.ifn) ? "Up" : "Down"}`, "    1 change, last change 00:00:21");
    const by = [];
    for (const [ifn, i] of Object.entries(d.cfg.intfs)) {
      for (const [g, s] of Object.entries(i.standby)) if (s.tracks.some((x) => x.obj === +n)) by.push(`    HSRP ${ifn} ${g}`);
    }
    if (by.length) L.push("  Tracked by:", ...by);
  }
  return L.join("\n");
}

// ---- IPv6
function showIpv6IntBrief(net, dn) {
  const d = net.devs[dn], L = [];
  for (const n of Object.keys(d.cfg.intfs).sort(ifSort)) {
    const s = net.ifState(dn, n);
    L.push(pad(n, 23) + `[${s.status}/${s.proto}]`);
    if (!net.v6on(dn, n)) { L.push("    unassigned"); continue; }
    L.push("    " + fmt6(net.ll6(dn, n)));
    for (const a of net.addrs6(dn, n)) L.push("    " + fmt6(a.a));
  }
  return L.join("\n");
}

function showIpv6Int(net, dn, only) {
  const d = net.devs[dn], L = [];
  for (const n of Object.keys(d.cfg.intfs).sort(ifSort)) {
    if (only && n !== only) continue;
    if (!net.v6on(dn, n)) { if (only) L.push(`${n} is ${net.ifState(dn, n).status}, line protocol is ${net.ifState(dn, n).proto}`, "  IPv6 is not enabled"); continue; }
    const s = net.ifState(dn, n), addrs = net.addrs6(dn, n);
    L.push(`${n} is ${s.status}, line protocol is ${s.proto}`, `  IPv6 is ${s.proto === "up" ? "enabled" : "tentative"}, link-local address is ${fmt6(net.ll6(dn, n))} `,
      "  No Virtual link-local address(es):");
    if (addrs.length) {
      L.push("  Global unicast address(es):");
      for (const a of addrs) L.push(`    ${fmt6(a.a)}, subnet is ${fmt6(net6(a.a, a.len))}/${a.len} ${a.how === "eui" ? "[EUI]" : a.how === "auto" ? "[EUI/CAL/PRE]" : ""}`.trimEnd());
    }
    L.push("  Joined group address(es):", "    FF02::1");
    if (d.cfg.ipv6Routing) L.push("    FF02::2");
    if (d.cfg.ipv6Routing && d.cfg.intfs[n].ospf6.pid !== undefined) L.push("    FF02::5");
    L.push("  MTU is 1500 bytes", "  ND DAD is enabled, number of DAD attempts: 1", "  ND reachable time is 30000 milliseconds (using 30000)");
    if (d.cfg.ipv6Routing) L.push("  ND advertised reachable time is 0 (unspecified)", "  ND router advertisements are sent every 200 seconds",
      "  Hosts use stateless autoconfig for addresses.");
  }
  return L.join("\n");
}

const ROUTE6_CODES = `Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, H - NHRP, I1 - ISIS L1
       I2 - ISIS L2, IA - ISIS interarea, IS - ISIS summary, D - EIGRP
       EX - EIGRP external, ND - ND Default, NDp - ND Prefix, DCE - Destination
       NDr - Redirect, O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1
       OE2 - OSPF ext 2, ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2
       la - LISP alt, lr - LISP site-registrations, ld - LISP dyn-eid
       a - Application`;

function showIpv6Route(net, dn, filter) {
  const all = net.routes6(dn).filter((r) => !filter || r.code[0] === filter);
  const L = [`IPv6 Routing Table - default - ${net.routes6(dn).length + 1} entries`, ROUTE6_CODES];
  for (const r of all) {
    L.push(pad(r.code, 4) + `${fmt6(r.net)}/${r.len} [${r.ad}/${r.metric}]`);
    if (r.code === "C") L.push(`     via ${r.ifn}, directly connected`);
    else if (r.code === "L") L.push(`     via ${r.ifn}, receive`);
    else for (const p of r.paths) L.push("     via " + [p.ip !== null ? fmt6(p.ip) : null, p.ifn].filter(Boolean).join(", "));
  }
  if (!filter) L.push("L   FF00::/8 [0/0]", "     via Null0, receive");
  return L.join("\n");
}

function showOspf6Nbr(net, dn) {
  const o = net.ospf6()[dn];
  if (!o) return "";
  const d = net.devs[dn];
  const L = ["", `            OSPFv3 Router with ID (${n2ip(o.rid)}) (Process ID ${d.cfg.ospf6.pid})`, "",
    "Neighbor ID     Pri   State           Dead Time   Interface ID    Interface"];
  for (const n of o.nbrs) {
    const id = net.devs[n.dev].ports.indexOf(physOf(n.ifn)) + 1;
    L.push(pad(n2ip(n.rid), 16) + lpad(n.prio, 3) + "   " + pad(n.state, 16) + pad("00:00:" + String(n.dead - 5).padStart(2, "0"), 12) + pad(id, 16) + n.local);
  }
  return L.join("\n");
}

function showOspf6IntBrief(net, dn) {
  const o = net.ospf6()[dn];
  const L = ["Interface    PID   Area            Intf ID    Cost  State Nbrs F/C"];
  for (const i of o ? o.ifs : []) {
    const full = (i.nbrs || []).filter((n) => o.nbrs.some((x) => x.rid === n.rid && x.local === i.ifn && x.state.startsWith("FULL"))).length;
    L.push(pad(shortIf(i.ifn), 13) + pad(o.pid, 6) + pad(i.area, 16) + pad(net.devs[dn].ports.indexOf(physOf(i.ifn)) + 1, 11) + pad(i.cost, 6)
      + pad(i.role, 6) + `${full}/${(i.nbrs || []).length}`);
  }
  return L.join("\n");
}

function showIpv6Neighbors(net, dn) {
  const d = net.devs[dn];
  const L = ["IPv6 Address                              Age Link-layer Addr State Interface"];
  for (const [a, e] of Object.entries(d.rt.nd)) if (net.ifUp(dn, e.ifn)) L.push(pad(a, 42) + lpad(0, 3) + " " + pad(e.mac, 15) + pad("REACH", 6) + shortIf(e.ifn));
  return L.join("\n");
}

// ---- EIGRP
function eigrpTitle(e, what) {
  return e.name ? `EIGRP-IPv4 VR(${e.name}) Address-Family ${what} for AS(${e.asn})` : `EIGRP-IPv4 ${what} for AS(${e.asn})`;
}

function showEigrpNbrs(net, dn) {
  const e = net.devs[dn].cfg.eigrp, per = net.eigrp()[dn];
  const L = [eigrpTitle(e, "Neighbors"), "H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq",
    "                                                   (sec)         (ms)       Cnt Num"];
  (per ? per.nbrs : []).forEach((n, i) => L.push(pad(i, 4) + pad(n2ip(n.ip), 24) + pad(shortIf(n.local), 23) + lpad(13, 4) + " 00:02:11" + lpad(1, 5) + lpad(100, 6) + "  0  " + (4 + i)));
  return L.join("\n");
}

function showEigrpTopo(net, dn) {
  const e = net.devs[dn].cfg.eigrp, per = net.eigrp()[dn];
  if (!per) return "";
  const L = [`${eigrpTitle(e, "Topology Table")}/ID(${n2ip(per.rid)})`, "Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,",
    "       r - reply Status, s - sia Status ", ""];
  const keys = Object.keys(per.topo).sort((a, b) => { const [na, la] = a.split("/").map(Number), [nb, lb] = b.split("/").map(Number); return na - nb || la - lb; });
  for (const k of keys) {
    const t = per.topo[k];
    L.push(`P ${n2ip(t.net)}/${t.len}, ${t.own ? 1 : t.via.length} successors, FD is ${t.metric}`);
    if (t.conn) L.push(`        via Connected, ${t.ifn}`);
    else if (t.own) L.push(`        via Rstatic (${t.metric}/0)`);
    for (const v of t.via) {
      const c = t.cands.find((x) => x.ip === v.ip);
      L.push(`        via ${n2ip(v.ip)} (${c.metric}/${c.rd}), ${v.ifn}`);
    }
    for (const c of t.fs) L.push(`        via ${n2ip(c.ip)} (${c.metric}/${c.rd}), ${c.ifn}`);
  }
  return L.join("\n");
}

function showEigrpIfs(net, dn) {
  const e = net.devs[dn].cfg.eigrp, per = net.eigrp()[dn];
  const L = [eigrpTitle(e, "Interfaces"), "                              Xmit Queue   PeerQ        Mean   Pacing Time   Multicast    Pending",
    "Interface              Peers  Un/Reliable  Un/Reliable  SRTT   Un/Reliable   Flow Timer   Routes"];
  for (const i of per ? per.ifs.filter((x) => !x.passive) : []) {
    L.push(pad(shortIf(i.ifn), 23) + lpad(per.nbrs.filter((n) => n.local === i.ifn).length, 5) + "        0/0       0/0           1       0/0           50           0");
  }
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
    L.push(pad(n2ip(+ip), 16) + pad(("01" + b.mac.replace(/\./g, "")).match(/.{1,4}/g).join("."), 24) + pad("Infinite", 24) + pad("Automatic", 11) + pad("Active", 11) + "Unknown");
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

export function clock(offset = 0) {
  const t = new Date(Date.now() + offset);
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

// A keyword whose meaning depends on the command around it gets its own text here: the last
// words of its path (parameters left out) map to what IOS prints at that point.
Object.assign(HELP_PATH, {
  "configure terminal": "Configure from the terminal", "cdp enable": "Enable CDP on interface",
  "ipv6 enable": "Enable IPv6 on interface", "ping ipv6": "IPv6 echo", "clear ipv6": "Delete IPv6 protocol information",
  "undebug ip": "IP information", "source static": "Specify static local->global mapping",
  "inside source": "Source address translation", "ip nat pool": "Define pool of addresses",
  "source list pool": "Name pool of global addresses", "source list interface": "Specify interface for global address",
  "input ssh": "TCP/IP SSH protocol", "input telnet": "TCP/IP Telnet protocol", "input all": "All protocols",
  "input none": "No protocols", "ssh telnet": "TCP/IP Telnet protocol", "telnet ssh": "TCP/IP SSH protocol",
  "ip ssh version": "Specify protocol version to be supported", "ospf interface": "Interface information",
  "port-security interface": "Show secure interface", "port-security address": "Show secure address",
  "track interface": "Select an interface to track", "route static": "Static routes", "route connected": "Connected",
  "route eigrp": "Enhanced Interior Gateway Routing Protocol (EIGRP)", "route ospf": "Open Shortest Path First (OSPF)",
  "eigrp router-id": "router-id for this EIGRP process", "cdp neighbors": "CDP neighbor entries",
  "ipv6 neighbors": "Show IPv6 neighbor cache entries", "eigrp neighbors": "Clear IP-EIGRP neighbors",
  "copy running-config": "Copy from current system configuration", "running-config startup-config": "Copy to startup configuration",
  "erase startup-config": "Erase contents of configuration memory", "write erase": "Erase NV memory",
  "nat statistics": "Translation statistics", "nat translation *": "Delete all dynamic translations",
  "debug all": "Enable all debugging", "undebug all": "Disable all debugging", "allowed vlan all": "all VLANs",
  "allowed vlan none": "no VLANs", "username secret": "Specify the secret for the user",
  "username password": "Specify the password for the user", "privilege secret": "Specify the secret for the user",
  "privilege password": "Specify the password for the user", "enable secret": "Assign the privileged level secret (MAX of 25 characters)",
  "enable password": "Assign the privileged level password (MAX of 25 characters)", "domain name": "Define the default domain name",
  "logging host": "Set syslog server IP address and parameters", "ip address secondary": "Make this IP address a secondary address",
  "root secondary": "Configure this switch as secondary root for this spanning tree",
  "spanning-tree vlan cost": "Change an interface's per VLAN spanning tree path cost",
  "spanning-tree vlan priority": "Set the bridge priority for the spanning tree", "ip ospf network": "Network type",
  "ipv6 ospf network": "Network type", "passive-interface default": "Suppress routing updates on all interfaces",
  "portfast default": "Enable portfast by default on all access ports",
  "portfast edge default": "Enable portfast edge by default on all access ports",
  "portfast bpduguard default": "Enable bpdu guard by default on all portfast edge ports",
  "edge bpduguard default": "Enable bpdu guard by default on all portfast edge ports", "af-interface default": "Default interface",
  "portfast bpduguard": "Enable bpdu guard by default on all portfast edge ports",
  "edge bpduguard": "Enable bpdu guard by default on all portfast edge ports",
  "address-family ipv4": "Address Family", "mode trunk": "Set trunking mode to TRUNK unconditionally",
  "mode access": "Set trunking mode to ACCESS unconditionally", "mode dynamic": "Set trunking mode to dynamically negotiate access or trunk mode",
  "access vlan": "Set VLAN when interface is in access mode", "native vlan": "Set native VLAN when interface is in trunking mode",
  "allowed vlan": "Set allowed VLANs when interface is in trunking mode", "address-table dynamic": "dynamic entry type",
  "authentication text": "Plain text authentication", "ip route static": "Static routes",
});

// Keywords that mean something else depending on the mode they're typed in.
const HELP_MODE = {
  priv: { clock: "Manage the system clock" },
  user: {},
  config: { clock: "Configure time-of-day clock", track: "Object tracking configuration commands" },
  ospf: { network: "Enable routing on an IP network" },
  eigrp: { network: "Enable routing on an IP network", eigrp: "EIGRP specific commands" },
  pool: { network: "Network number and mask" },
};

// Help for the switching, NAT, HSRP, IPv6, EIGRP and housekeeping commands.
Object.assign(HELP, {
  "spanning-tree": "Spanning Tree Subsystem", "rapid-pvst": "Per-Vlan rapid spanning tree mode", pvst: "Per-Vlan spanning tree mode",
  root: "Configure switch as root", primary: "Configure this switch as primary root for this spanning tree",
  secondary: "Configure switch as secondary root", portfast: "Spanning tree portfast options", bpduguard: "Don't accept BPDUs on this interface",
  "port-priority": "Change an interface's spanning tree port priority", "extend": "Spanning Tree 802.1t extensions",
  "system-id": "Extend 12-bit system-id field (VLAN ID) into the bridge priority", edge: "Enable portfast edge on the interface",
  summary: "Summary of port states", "channel-group": "Etherchannel/port bundling configuration", active: "Enable LACP unconditionally",
  passive: "Enable LACP only if a LACP device is detected", on: "Enable Etherchannel only", "Port-channel": "Ethernet Channel of interfaces",
  etherchannel: "EtherChannel information", "port-security": "Security related command", maximum: "Max secure addresses",
  violation: "Security violation mode", protect: "Security violation protect mode", restrict: "Security violation restrict mode",
  sticky: "Configure dynamic secure addresses as sticky", "mac-address": "Secure mac address", nat: "NAT configuration commands",
  inside: "Inside address translation", outside: "Outside address translation", static: "Static address translation",
  list: "Specify access list describing local addresses", overload: "Overload an address translation",
  netmask: "Specify the network mask", "prefix-length": "Specify the prefix length", translations: "Translation entries",
  translation: "Clear dynamic translation", statistics: "Translation statistics", standby: "HSRP interface configuration commands",
  preempt: "Overthrow lower priority Active routers", timers: "Hello and hold timers", track: "Priority tracking",
  decrement: "Priority decrement", "line-protocol": "Track interface line-protocol", ipv6: "IPv6 configuration subcommands",
  "unicast-routing": "Enable unicast routing", "eui-64": "Use eui-64 interface identifier", "link-local": "Use link-local address",
  autoconfig: "Obtain address using autoconfiguration", neighbors: "Show IPv6 neighbor cache entries", eigrp: "IP-EIGRP show commands",
  topology: "Select Topology Table", "address-family": "Enter Address Family command mode", unicast: "Address Family Modifier",
  "autonomous-system": "Specify Address-Family Autonomous System Number", "af-interface": "Enter Address Family interface configuration",
  "exit-af-interface": "Exit from Address Family Interface configuration mode", "exit-af-topology": "Exit from Address Family Topology configuration mode",
  "exit-address-family": "Exit Address Family configuration mode", base: "Base topology", metric: "Modify metrics and parameters for advertisement",
  weights: "Modify metric coefficients", redistribute: "Redistribute information from another routing protocol",
  subnets: "Consider subnets for redistribution into OSPF", variance: "Control load balancing variance",
  "auto-summary": "Enable automatic network number summarization", delay: "Specify interface throughput delay",
  speed: "Configure speed operation.", duplex: "Configure duplex operation.", full: "Force full duplex operation",
  half: "Force half-duplex operation", "snmp-server": "Modify SNMP engine parameters", community: "Enable SNMP; set community string and access privs",
  location: "Text for mib object sysLocation", contact: "Text for mib object sysContact", ntp: "Configure NTP", server: "Configure NTP server",
  connect: "Open a terminal connection", debug: "Debugging functions (see also 'undebug')", undebug: "Disable debugging functions (see also 'debug')",
  icmp: "ICMP transactions", debugging: "State of each debugging option", inventory: "Show the physical inventory", users: "Display information about terminal lines",
  monitor: "Copy debug output to the current terminal line", set: "Set the time and date", timezone: "Configure time zone",
  "detected-protocols": "Restart the protocol migration process", lacp: "LACP information", pagp: "Port Aggregation Protocol",
  blockedports: "Show blocked ports", authentication: "Authentication", "key-string": "Set key string", md5: "Use MD5 authentication",
  follow: "Name of HSRP group to follow", "port-channel": "Port-channel information", "inconsistentports": "Show inconsistent ports",
  ro: "Read-only access with this community string", rw: "Read-write access with this community string",
});
Object.assign(HELP_PATH, {
  "show spanning-tree": "Spanning tree topology", "show spanning-tree root": "Status and configuration of the root bridge",
  "show spanning-tree interface": "Spanning Tree interface status and configuration", "show etherchannel detail": "Detail information",
  "show lacp neighbor": "Neighbor information", "show pagp neighbor": "Neighbor information", "standby name": "Redundancy name string",
  "standby mac-address": "Virtual MAC address", "show interfaces status": "Show interface line status", "show spanning-tree vlan": "VLAN Switch Spanning Trees", "show etherchannel summary": "One-line summary per channel-group",
  "show port-security": "Show secure port information", "show ip nat": "IP NAT information", "show standby": "HSRP information",
  "show standby brief": "Brief output", "show ipv6": "IPv6 information", "show ipv6 route": "Show IPv6 route table entries",
  "show ipv6 interface": "IPv6 interface status and configuration", "show ipv6 ospf": "OSPF information", "show ip eigrp": "IP-EIGRP show commands",
  "show ip eigrp neighbors": "IP-EIGRP neighbors", "show ip eigrp topology": "IP-EIGRP Topology Table", "show ip eigrp interfaces": "IP-EIGRP interfaces",
  "router eigrp": "Enhanced Interior Gateway Routing Protocol (EIGRP)", "ip nat": "NAT configuration commands", "ipv6 route": "Configure static routes",
  "ipv6 address": "Configure IPv6 address on interface", "ipv6 ospf": "OSPF interface commands", "ipv6 router": "Enable an IPV6 routing process",
  "ipv6 router ospf": "Open Shortest Path First (OSPF)", "eigrp router-id": "router-id for this EIGRP process", "show track": "Tracking information",
  "clear ip nat": "Clear NAT", "clear port-security": "Clear secure MAC addresses", "show interfaces status err-disabled": "Show interfaces in error-disabled state",
  "spanning-tree vlan": "VLAN Switch Spanning Tree", "spanning-tree mode": "Spanning tree operating mode", "spanning-tree cost": "Change an interface's spanning tree port path cost",
  "switchport port-security": "Security related command", "standby ip": "Enable HSRP and set the virtual IP address", "standby priority": "Priority level",
  "standby version": "HSRP version", "ip nat inside": "Inside address translation", "ip nat outside": "Outside address translation",
  "ip nat pool": "Define pool of addresses", "debug ip": "IP information", "debug ip icmp": "ICMP transactions", "show ip route eigrp": "Enhanced Interior Gateway Routing Protocol (EIGRP)",
  "show ipv6 neighbors": "Show IPv6 neighbor cache entries", "clear ip eigrp": "Clear IPv4 EIGRP", "clear counters": "Clear counters on one or all interfaces",
  "speed 10": "Force 10 Mbps operation", "speed 100": "Force 100 Mbps operation", "speed 1000": "Force 1000 Mbps operation",
  "speed auto": "Enable AUTO speed configuration", "duplex auto": "Enable AUTO duplex configuration",
  "channel-group mode auto": "Enable PAgP only if a PAgP device is detected", "channel-group mode desirable": "Enable PAgP unconditionally",
  "channel-group mode": "Etherchannel Mode of the interface", "spanning-tree bpduguard enable": "Enable BPDU guard for this interface",
  "spanning-tree bpduguard disable": "Disable BPDU guard for this interface", "spanning-tree portfast disable": "Disable portfast for this interface",
  "port-security violation shutdown": "Security violation shutdown mode", "clear port-security all": "Clear all secure MAC addresses",
  "clear port-security sticky": "Clear sticky secure MAC addresses", "clear port-security dynamic": "Clear dynamic secure MAC addresses",
  "ipv6 route": "Configure static routes", "show ipv6 route static": "Static routes", "show ipv6 route connected": "Connected routes",
  "show ipv6 route ospf": "Open Shortest Path First (OSPFv3)", "show ipv6 route local": "Local routes",
  "show ip route eigrp": "Enhanced Interior Gateway Routing Protocol (EIGRP)", "redistribute static": "Static routes",
  "spanning-tree mode pvst": "Per-Vlan spanning tree mode", "spanning-tree mode rapid-pvst": "Per-Vlan rapid spanning tree mode",
});

const PARAMS = {
  ip: { fmt: "A.B.C.D", help: "IP address", match: (t, k) => (isIp(t[k].t) ? { used: 1, value: ip2n(t[k].t) } : null) },
  word: { fmt: "WORD", help: "", match: (t, k) => ({ used: 1, value: t[k].t }) },
  line: { fmt: "LINE", help: "", rest: true, match: (t, k, ctx) => ({ used: t.length - k, value: ctx.line.slice(t[k].i).trimEnd() }) },
  vlans: { fmt: "WORD", help: "VLAN IDs of the allowed VLANs when this port is in trunking mode", match: (t, k) => {
    const v = parseVlans(t[k].t);
    return v ? { used: 1, value: v } : null;
  } },
  ip6: { fmt: "X:X:X:X::X", help: "IPv6 address", match: (t, k) => {
    const a = /\//.test(t[k].t) ? null : parse6(t[k].t);
    return a === null ? null : { used: 1, value: fmt6(a) };
  } },
  ip6pfx: { fmt: "X:X:X:X::X/<0-128>", help: "IPv6 prefix", match: (t, k) => {
    const m = /^([^/]+)\/(\d{1,3})$/.exec(t[k].t);
    const a = m && parse6(m[1]);
    return a === null || a === undefined || !m || +m[2] > 128 ? null : { used: 1, value: { a: fmt6(a), len: +m[2] } };
  } },
  mac: { fmt: "H.H.H", help: "48 bit mac address", match: (t, k) => {
    const m = /^([0-9a-f]{1,4})\.([0-9a-f]{1,4})\.([0-9a-f]{1,4})$/i.exec(t[k].t);
    return m ? { used: 1, value: m.slice(1).map((x) => x.toLowerCase().padStart(4, "0")).join(".") } : null;
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

function keywordHelp(path, kw, mode) {
  const key = path.filter((t) => !t.startsWith("<")).map((t) => t.replace(/^~/, "").toLowerCase()).concat([kw]).join(" ");
  const bare = key.replace(/^no /, "");
  if (HELP_MODE[mode] && HELP_MODE[mode][bare]) return HELP_MODE[mode][bare];
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
            const help = ti === 0 && kw === "exit" && CONFIG_MODES.includes(m) ? "Exit from configure mode" : keywordHelp(toks.slice(0, ti), kw, m);
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
  stdacl: "(config-std-nacl)#", extacl: "(config-ext-nacl)#", ospf6: "(config-rtr)#", eigrp: "(config-router)#",
  eigrpn: "(config-router)#", eigrpaf: "(config-router-af)#", afif: "(config-router-af-interface)#",
  aftop: "(config-router-af-topology)#", track: "(config-track)#",
  bgp: "(config-router)#", bgpaf: "(config-router-af)#", rmap: "(config-route-map)#",
};
const SUBMODES = ["if", "subif", "range", "line", "ospf", "vlan", "pool", "stdacl", "extacl", "ospf6", "eigrp", "eigrpn",
  "eigrpaf", "afif", "aftop", "track", "bgp", "bgpaf", "rmap"];
// Where "exit" goes from each nested mode (everything else returns to global configuration).
const PARENT = { afif: "eigrpaf", aftop: "eigrpaf", eigrpaf: "eigrpn", bgpaf: "bgp" };
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
def("RS", both, "show clock", (c) => c.print("*" + clock(c.d.rt.clockOffset || 0) + " " + (c.cfg.tz ? c.cfg.tz[0] : "UTC")));
def("RS", both, "show ip interface brief", (c) => c.print(showIpIntBrief(c.net, c.d.name)));
def("RS", both, "show interfaces", (c) => c.print(showInterfaces(c.net, c.d.name)));
def("RS", both, "show interfaces <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => c.print(showInterfaces(c.net, c.d.name, ifn))));
def("RS", both, "show cdp neighbors", (c) => c.print(showCdp(c.net, c.d.name, false)));
def("RS", both, "show cdp neighbors detail", (c) => c.print(showCdp(c.net, c.d.name, true)));
def("RS", both, "show ip route", (c) => c.print(showIpRoute(c.net, c.d.name)));
def("RS", both, "show ip route {connected|static|ospf}", (c, [f]) => c.print(showIpRoute(c.net, c.d.name, f[0].toUpperCase())));
def("R", both, "show ip route eigrp", (c) => c.print(showIpRoute(c.net, c.d.name, "D")));
def("RS", both, "show ip route <ip|Network to display information about or hostname>", (c, [ip]) => {
  const r = lpm(c.net.routes(c.d.name), ip);
  if (!r) { c.print("% Network not in table"); return; }
  const via = { C: "connected", L: "connected", S: "static", O: `ospf ${c.cfg.ospf && c.cfg.ospf.pid}`, D: `eigrp ${c.cfg.eigrp && c.cfg.eigrp.asn}`, B: `bgp ${c.cfg.bgp && c.cfg.bgp.asn}` }[r.code[0]];
  const L = [`Routing entry for ${n2ip(r.net)}/${r.len}`, `  Known via "${via}", distance ${r.ad}, metric ${r.metric}${r.code === "C" ? " (connected, via interface)" : ""}`];
  if (r.code[0] === "D") L.push(`  Redistributing via eigrp ${c.cfg.eigrp.asn}`);
  L.push("  Routing Descriptor Blocks:");
  if (r.code === "C" || r.code === "L") L.push(`  * directly connected, via ${r.ifn}`, "      Route metric is 0, traffic share count is 1");
  else r.paths.forEach((p, i) => L.push(`  ${i ? " " : "*"} ${p.ip === null ? "directly connected" : n2ip(p.ip)}${p.ip !== null ? ", from " + n2ip(p.ip) + ", 00:00:12 ago" : ""}${p.ifn ? ", via " + p.ifn : ""}`,
    `      Route metric is ${p.metric ?? r.metric}, traffic share count is 1`));
  c.print(L.join("\n"));
});
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
def("RS", SUBMODES, "exit", (c) => c.s.enter(PARENT[c.mode] || "config", null));
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
// The first key pair turns the SSH server on, and IOS logs it.
const sshOn = (c, b) => {
  const had = c.cfg.rsa > 0;
  c.cfg.rsa = b;
  if (!had && b >= 768) c.net.note(c.d.name, `%SSH-5-ENABLED: SSH ${c.cfg.sshVer === 2 ? "2.0" : "1.99"} has been enabled`);
};
const genRsa = (c, bits) => {
  if (["Router", "Switch"].includes(c.cfg.hostname)) { c.print("% Please define a hostname other than Router."); return; }
  if (!c.cfg.domain) { c.print("% Please define a domain-name first."); return; }
  const run = (b) => {
    c.print(`The name for the keys will be: ${c.cfg.hostname}.${c.cfg.domain}`, "",
      `% The key modulus size is ${b} bits`, `% Generating ${b} bit RSA keys, keys will be non-exportable...`, "[OK] (elapsed time was 1 seconds)");
    sshOn(c, b);
  };
  if (bits) { run(bits); return; }
  c.print(`The name for the keys will be: ${c.cfg.hostname}.${c.cfg.domain}`,
    "Choose the size of the key modulus in the range of 360 to 4096 for your\n  General Purpose Keys. Choosing a key modulus greater than 512 may take\n  a few minutes.\n");
  c.s.ask("How many bits in the modulus [512]: ", {}, (ans) => {
    const b = ans.trim() ? +ans.trim() : 512;
    if (!Number.isInteger(b) || b < 360 || b > 4096) { c.print("% Invalid input. Key modulus must be between 360 and 4096."); return; }
    c.print(`% Generating ${b} bit RSA keys, keys will be non-exportable...`, "[OK] (elapsed time was 1 seconds)");
    sshOn(c, b);
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
def("RS", IF_MODES, "shutdown", (c) => eachIf(c, (n, i) => {
  i.shut = true;
  // shut / no shut is how an err-disabled port is recovered.
  if (c.d.type === "switch") { delete c.d.rt.errdis[n]; if (c.d.rt.psec[n]) c.d.rt.psec[n].dyn = []; }
}));
def("RS", IF_MODES, "no shutdown", (c) => eachIf(c, (n, i) => { i.shut = false; }));
def("RS", IF_MODES, "bandwidth <num:1-10000000|Bandwidth in kilobits>", (c, [bw]) => eachIf(c, (n, i) => { i.bw = bw; }));
def("RS", IF_MODES, "no bandwidth", (c) => eachIf(c, (n, i) => { i.bw = null; }));
def("RS", IF_MODES, "cdp enable", (c) => eachIf(c, (n, i) => { i.cdp = true; }));
def("RS", IF_MODES, "no cdp enable", (c) => eachIf(c, (n, i) => { i.cdp = false; }));
def("RS", IF_MODES, "ip address <ip|IP address> <ip|IP subnet mask>", (c, [ip, mask]) => c.s.setIp(ip, mask, false));
def("R", IF_MODES, "ip address <ip|IP address> <ip|IP subnet mask> secondary", (c, [ip, mask]) => c.s.setIp(ip, mask, true));
def("RS", IF_MODES, "no ip address", (c) => eachIf(c, (n, i) => {
  if (c.d.type === "switch" && !n.startsWith("Vlan")) { c.invalid(1); return false; }
  i.ip = null; i.mask = null;
  if (i.secondary) i.secondary = [];
  return true;
}));
def("RS", IF_MODES, "no ip address <ip|IP address> <ip|IP subnet mask>", (c, [ip, mask]) => eachIf(c, (n, i) => {
  if (c.d.type === "switch" && !n.startsWith("Vlan")) { c.invalid(1); return false; }
  if (i.ip !== ip || i.mask !== mask) { c.print("% Address " + n2ip(ip) + " not found on " + n); return false; }
  if (i.secondary && i.secondary.length) { c.print("Must delete secondary before deleting primary"); return false; }
  i.ip = null; i.mask = null;
  return true;
}));
def("R", IF_MODES, "no ip address <ip|IP address> <ip|IP subnet mask> secondary", (c, [ip, mask]) => eachIf(c, (n, i) => {
  const before = i.secondary.length;
  i.secondary = i.secondary.filter((s) => !(s.ip === ip && s.mask === mask));
  if (before === i.secondary.length) { c.print("% Secondary address " + n2ip(ip) + " not found on " + n); return false; }
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

// Layer-2 settings on a port-channel are copied to its members, as IOS does.
const swOnly = (c, fn) => eachIf(c, (n, i) => {
  if (n.startsWith("Vlan")) { c.invalid(0); return false; }
  const r = fn(n, i);
  if (isPo(n)) {
    for (const p of c.d.ports) {
      const m = c.cfg.intfs[p];
      if (m.chan && m.chan.group === poNum(n)) for (const k of L2_KEYS) m[k] = clone(i[k]);
    }
  }
  return r;
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

// ---- spanning tree ---------------------------------------------------------------------
def("S", "config", "spanning-tree mode {pvst|rapid-pvst}", (c, [m]) => { c.cfg.stp.mode = m; });
def("S", "config", "no spanning-tree mode", (c) => { c.cfg.stp.mode = "pvst"; });
def("S", "config", "spanning-tree extend system-id", () => {});
const stpPrio = (c, ids, p) => {
  if (p % 4096) {
    c.print("% Bridge Priority must be in increments of 4096.", "% Allowed values are:",
      "  0     4096  8192  12288 16384 20480 24576 28672", "  32768 36864 40960 45056 49152 53248 57344 61440");
    return;
  }
  for (const v of ids) c.cfg.stp.prio[v] = p;
};
def("S", "config", "spanning-tree vlan <vlans|VLAN IDs of the spanning tree instance> priority <num:0-61440|bridge priority in increments of 4096>",
  (c, [ids, p]) => stpPrio(c, ids, p));
// root primary/secondary is a macro: it works out a priority once, and that is what gets saved.
def("S", "config", "spanning-tree vlan <vlans|VLAN IDs of the spanning tree instance> root {primary|secondary}", (c, [ids, which]) => {
  for (const v of ids) {
    if (which === "secondary") { c.cfg.stp.prio[v] = 28672; continue; }
    const s = c.net.stp(v)[c.d.name];
    const rootPrio = s ? s.root[0] - v : 32768;
    const mine = (c.cfg.stp.prio[v] ?? 32768);
    if (s && s.rootPort === null) { c.cfg.stp.prio[v] = Math.min(mine, 24576); continue; }
    c.cfg.stp.prio[v] = rootPrio > 24576 ? 24576 : Math.max(0, rootPrio - 4096);
  }
});
def("S", "config", "no spanning-tree vlan <vlans|VLAN IDs of the spanning tree instance> priority", (c, [ids]) => { for (const v of ids) delete c.cfg.stp.prio[v]; });
def("S", "config", "no spanning-tree vlan <vlans|VLAN IDs of the spanning tree instance> root", (c, [ids]) => { for (const v of ids) delete c.cfg.stp.prio[v]; });
def("S", "config", "spanning-tree portfast default", (c) => {
  c.cfg.stp.pfDefault = true;
  c.print("%Warning: this command enables portfast by default on all interfaces. You", " should now disable portfast explicitly on switched ports leading to hubs,",
    " switches and bridges as they may create temporary bridging loops.");
});
def("S", "config", "spanning-tree portfast edge default", (c) => { c.cfg.stp.pfDefault = true; });
def("S", "config", "no spanning-tree portfast default", (c) => { c.cfg.stp.pfDefault = false; });
def("S", "config", "spanning-tree portfast bpduguard default", (c) => { c.cfg.stp.bgDefault = true; });
def("S", "config", "spanning-tree portfast edge bpduguard default", (c) => { c.cfg.stp.bgDefault = true; });
def("S", "config", "no spanning-tree portfast bpduguard default", (c) => { c.cfg.stp.bgDefault = false; });
const l2If = (c, fn) => eachIf(c, (n, i) => {
  if (n.startsWith("Vlan")) { c.invalid(0); return false; }
  return fn(n, i);
});
const setPortfast = (c, on) => l2If(c, (n, i) => {
  i.stp.portfast = on;
  if (on && c.net.swMode(c.d, n) !== "access") {
    c.print(`%Warning: portfast should only be enabled on ports connected to a single`, " host. Connecting hubs, concentrators, switches, bridges, etc... to this",
      " interface  when portfast is enabled, can cause temporary bridging loops.", " Use with CAUTION", "",
      `%Portfast has been configured on ${n} but will only`, " have effect when the interface is in a non-trunking mode.");
  } else if (on) {
    c.print(`%Warning: portfast should only be enabled on ports connected to a single`, " host. Connecting hubs, concentrators, switches, bridges, etc... to this",
      " interface  when portfast is enabled, can cause temporary bridging loops.", " Use with CAUTION");
  }
});
def("S", IF_MODES, "spanning-tree portfast", (c) => setPortfast(c, true));
def("S", IF_MODES, "spanning-tree portfast edge", (c) => setPortfast(c, true));
def("S", IF_MODES, "spanning-tree portfast disable", (c) => l2If(c, (n, i) => { i.stp.portfast = false; }));
def("S", IF_MODES, "no spanning-tree portfast", (c) => l2If(c, (n, i) => { i.stp.portfast = null; }));
def("S", IF_MODES, "spanning-tree bpduguard {enable|disable}", (c, [w]) => l2If(c, (n, i) => { i.stp.bpduguard = w === "enable"; }));
def("S", IF_MODES, "no spanning-tree bpduguard", (c) => l2If(c, (n, i) => { i.stp.bpduguard = null; }));
def("S", IF_MODES, "spanning-tree cost <num:1-200000000|port path cost>", (c, [k]) => l2If(c, (n, i) => { i.stp.cost = k; }));
def("S", IF_MODES, "no spanning-tree cost", (c) => l2If(c, (n, i) => { i.stp.cost = null; }));
def("S", IF_MODES, "spanning-tree port-priority <num:0-240|port priority in increments of 16>", (c, [p]) => {
  if (p % 16) { c.print("% Port Priority in increments of 16 is required", "% Allowed values are:", "  0   16  32  48  64  80  96  112 128 144 160 176 192 208 224 240"); return; }
  l2If(c, (n, i) => { i.stp.prio = p; });
});
def("S", IF_MODES, "no spanning-tree port-priority", (c) => l2If(c, (n, i) => { i.stp.prio = null; }));
def("S", IF_MODES, "spanning-tree vlan <vlans|VLAN IDs> cost <num:1-200000000|port path cost>", (c, [ids, k]) => l2If(c, (n, i) => { for (const v of ids) i.stp.vcost[v] = k; }));
def("S", IF_MODES, "no spanning-tree vlan <vlans|VLAN IDs> cost", (c, [ids]) => l2If(c, (n, i) => { for (const v of ids) delete i.stp.vcost[v]; }));
def("S", both, "show spanning-tree", (c) => c.print(showSpanningTree(c.net, c.d.name)));
def("S", both, "show spanning-tree vlan <num:1-4094|VLAN Switch Spanning Tree>", (c, [v]) => c.print(showSpanningTree(c.net, c.d.name, v)));
def("S", both, "show spanning-tree summary", (c) => c.print(showStpSummary(c.net, c.d.name)));
def("S", both, "show spanning-tree inconsistentports", (c) => {
  const L = ["", "Name                 Interface                Inconsistency", "-------------------- ------------------------ ------------------"];
  let n = 0;
  for (const v of Object.keys(c.cfg.vlans).map(Number).sort((a, b) => a - b)) {
    const s = c.net.stp(v)[c.d.name];
    for (const [p, x] of Object.entries((s && s.ports) || {})) {
      if (!x.inc) continue;
      L.push(pad("VLAN" + String(v).padStart(4, "0"), 21) + pad(p, 25) + (x.inc === "PVID_Inc" ? "Port VLAN ID Mismatch" : "Port Type Inconsistent"));
      n++;
    }
  }
  L.push("", `Number of inconsistent ports (segments) in the system : ${n}`);
  c.print(L.join("\n"));
});
def("S", "priv", "clear spanning-tree detected-protocols", () => {});

// ---- EtherChannel ---------------------------------------------------------------------
def("S", IF_MODES, "channel-group <num:1-6|Channel group number> mode {active|passive|on|desirable|auto}", (c, [g, mode]) => {
  const proto = (m) => (m === "on" ? "on" : m === "active" || m === "passive" ? "lacp" : "pagp");
  const po = "Port-channel" + g;
  for (const n of c.target) {
    if (n.startsWith("Vlan") || isPo(n)) { c.invalid(0); return; }
    const other = c.d.ports.find((p) => p !== n && c.cfg.intfs[p].chan && c.cfg.intfs[p].chan.group === g);
    if (other && proto(c.cfg.intfs[other].chan.mode) !== proto(mode)) {
      c.print(`Command rejected (${po}, ${n}): Invalid etherchnl mode`);
      return;
    }
  }
  for (const n of c.target) {
    if (!c.cfg.intfs[po]) {
      // IOS builds the port-channel from the first member's layer-2 settings.
      c.cfg.intfs[po] = newIntf("switch", po);
      for (const k of L2_KEYS) c.cfg.intfs[po][k] = clone(c.cfg.intfs[n][k]);
      c.print(`Creating a port-channel interface Port-channel ${g}`, "");
    }
    c.cfg.intfs[n].chan = { group: g, mode };
  }
});
def("S", IF_MODES, "no channel-group", (c) => l2If(c, (n, i) => { i.chan = null; }));
def("S", both, "show etherchannel summary", (c) => c.print(showEtherchannel(c.net, c.d.name)));
def("S", both, "show etherchannel port-channel", (c) => c.print(showEcPortChannel(c.net, c.d.name, null, false)));
def("S", both, "show etherchannel <num:1-6|Channel group number> port-channel", (c, [g]) => c.print(showEcPortChannel(c.net, c.d.name, g, false)));
def("S", both, "show etherchannel detail", (c) => c.print(showEcPortChannel(c.net, c.d.name, null, true)));
def("S", both, "show etherchannel <num:1-6|Channel group number> detail", (c, [g]) => c.print(showEcPortChannel(c.net, c.d.name, g, true)));
def("S", both, "show lacp neighbor", (c) => c.print(showLacpNbr(c.net, c.d.name, "lacp")));
def("S", both, "show pagp neighbor", (c) => c.print(showLacpNbr(c.net, c.d.name, "pagp")));
def("S", both, "show spanning-tree interface <intf>", (c, [n]) => c.s.withIf(n, 3, (ifn) => c.print(showStpInterface(c.net, c.d.name, ifn))));
def("S", both, "show spanning-tree root", (c) => c.print(showStpRoot(c.net, c.d.name)));
def("S", both, "show spanning-tree blockedports", (c) => c.print(showStpBlocked(c.net, c.d.name)));
def("S", both, "show interfaces <intf> status", (c, [n]) => c.s.withIf(n, 2, (ifn) => {
  if (ifn.startsWith("Vlan")) c.invalid(3); else c.print(showIntStatus(c.net, c.d.name, false, ifn));
}));

// ---- port security ----------------------------------------------------------------------
const psec = (c, fn) => l2If(c, (n, i) => {
  if (isPo(n)) { c.print(`Command rejected: ${n} is a port-channel.`); return false; }
  if (!i.psec) i.psec = { on: false, max: 1, violation: "shutdown", macs: [], sticky: [], stickyOn: false };
  return fn(n, i.psec, i);
});
def("S", IF_MODES, "switchport port-security", (c) => psec(c, (n, ps, i) => {
  if (i.mode.startsWith("dynamic")) { c.print(`Command rejected: ${n} is a dynamic port.`); return false; }
  ps.on = true;
  return true;
}));
def("S", IF_MODES, "no switchport port-security", (c) => l2If(c, (n, i) => {
  if (i.psec) i.psec.on = false;
  delete c.d.rt.psec[n];
}));
def("S", IF_MODES, "switchport port-security maximum <num:1-132|Maximum addresses>", (c, [m]) => psec(c, (n, ps) => {
  if (ps.macs.length + ps.sticky.length > m) { c.print("Total secure mac-addresses on interface " + n + " has exceeded the maximum"); return false; }
  ps.max = m;
  return true;
}));
def("S", IF_MODES, "no switchport port-security maximum", (c) => psec(c, (n, ps) => { ps.max = 1; }));
def("S", IF_MODES, "switchport port-security violation {protect|restrict|shutdown}", (c, [v]) => psec(c, (n, ps) => { ps.violation = v; }));
def("S", IF_MODES, "no switchport port-security violation", (c) => psec(c, (n, ps) => { ps.violation = "shutdown"; }));
def("S", IF_MODES, "switchport port-security mac-address <mac>", (c, [m]) => psec(c, (n, ps) => {
  if (ps.macs.includes(m)) return true;
  if (ps.macs.length + ps.sticky.length >= ps.max) { c.print("Total secure mac-addresses on interface " + n + " has reached maximum limit."); return false; }
  ps.macs.push(m);
  return true;
}));
def("S", IF_MODES, "no switchport port-security mac-address <mac>", (c, [m]) => psec(c, (n, ps) => { ps.macs = ps.macs.filter((x) => x !== m); }));
def("S", IF_MODES, "switchport port-security mac-address sticky", (c) => psec(c, (n, ps) => {
  ps.stickyOn = true;
  // Addresses already learned dynamically become sticky.
  const rt = c.d.rt.psec[n];
  if (rt) { for (const m of rt.dyn) if (!ps.sticky.includes(m)) ps.sticky.push(m); rt.dyn = []; }
}));
def("S", IF_MODES, "no switchport port-security mac-address sticky", (c) => psec(c, (n, ps) => { ps.stickyOn = false; ps.sticky = []; }));
def("S", IF_MODES, "switchport port-security mac-address sticky <mac>", (c, [m]) => psec(c, (n, ps) => {
  if (!ps.stickyOn) { c.print("% Sticky learning is not enabled on " + n); return false; }
  if (!ps.sticky.includes(m)) ps.sticky.push(m);
  return true;
}));
def("S", IF_MODES, "no switchport port-security mac-address sticky <mac>", (c, [m]) => psec(c, (n, ps) => { ps.sticky = ps.sticky.filter((x) => x !== m); }));
def("S", both, "show port-security", (c) => c.print(showPortSecurity(c.net, c.d.name)));
def("S", both, "show port-security address", (c) => c.print(showPsecAddress(c.net, c.d.name)));
def("S", both, "show port-security interface <intf>", (c, [n]) => c.s.withIf(n, 3, (ifn) => {
  if (ifn.startsWith("Vlan") || isPo(ifn)) c.invalid(3); else c.print(showPortSecurityIf(c.net, c.d.name, ifn));
}));
def("S", "priv", "clear port-security {all|sticky|dynamic}", (c, [w]) => {
  for (const p of c.d.ports) {
    const ps = c.cfg.intfs[p].psec;
    if (!ps) continue;
    if (w !== "sticky" && c.d.rt.psec[p]) c.d.rt.psec[p].dyn = [];
    if (w !== "dynamic") ps.sticky = [];
  }
});
def("S", both, "show interfaces status err-disabled", (c) => c.print(showIntStatus(c.net, c.d.name, true)));

// ---- NAT ---------------------------------------------------------------------------------
def("R", IF_MODES, "ip nat {inside|outside}", (c, [w]) => eachIf(c, (n, i) => { i.nat = w; }));
def("R", IF_MODES, "no ip nat {inside|outside}", (c) => eachIf(c, (n, i) => { i.nat = null; }));
def("R", "config", "ip nat inside source static <ip|Inside local IP address> <ip|Inside global IP address>", (c, [l, g]) => {
  const n = c.cfg.nat;
  if (n.statics.some((s) => s.local === l && s.global === g)) return;
  if (n.statics.some((s) => s.local === l || s.global === g)) {
    c.print(`% ${n2ip(n.statics.some((s) => s.local === l) ? l : g)} already mapped (${n2ip(l)} -> ${n2ip(g)})`);
    return;
  }
  n.statics.push({ local: l, global: g });
});
def("R", "config", "no ip nat inside source static <ip|Inside local IP address> <ip|Inside global IP address>", (c, [l, g]) => {
  const n = c.cfg.nat, before = n.statics.length;
  n.statics = n.statics.filter((s) => !(s.local === l && s.global === g));
  if (n.statics.length === before) c.print("%Translation not found");
});
const natRule = (c, rule) => {
  const n = c.cfg.nat;
  n.dyn = n.dyn.filter((r) => r.acl !== rule.acl);
  n.dyn.push(rule);
};
const LIST = "<word|Access list number or name for local addresses>";
def("R", "config", `ip nat inside source list ${LIST} interface <intf>`, (c, [a, i]) => c.s.withIf(i, 7, () => natRule(c, { acl: String(a), intf: i, pool: null, overload: false })));
def("R", "config", `ip nat inside source list ${LIST} interface <intf> overload`, (c, [a, i]) => c.s.withIf(i, 7, () => natRule(c, { acl: String(a), intf: i, pool: null, overload: true })));
def("R", "config", `ip nat inside source list ${LIST} pool <word|Name pool of global addresses>`, (c, [a, p]) => natRule(c, { acl: String(a), intf: null, pool: p, overload: false }));
def("R", "config", `ip nat inside source list ${LIST} pool <word|Name pool of global addresses> overload`, (c, [a, p]) => natRule(c, { acl: String(a), intf: null, pool: p, overload: true }));
const noNatRule = (c, [a]) => {
  const n = c.cfg.nat, before = n.dyn.length;
  n.dyn = n.dyn.filter((r) => r.acl !== String(a));
  if (n.dyn.length === before) c.print("%Dynamic mapping not found");
};
def("R", "config", `no ip nat inside source list ${LIST} interface <intf>`, noNatRule);
def("R", "config", `no ip nat inside source list ${LIST} interface <intf> overload`, noNatRule);
def("R", "config", `no ip nat inside source list ${LIST} pool <word|Name pool of global addresses>`, noNatRule);
def("R", "config", `no ip nat inside source list ${LIST} pool <word|Name pool of global addresses> overload`, noNatRule);
const natPool = (c, name, start, end, mask) => {
  if (maskLen(mask) < 0) { c.print("%Invalid netmask"); return; }
  if (end < start) { c.print("%End address less than start address"); return; }
  if (!sameNet(start, end, mask)) { c.print("%End address not on same subnet as start address"); return; }
  c.cfg.nat.pools[name] = { name, start, end, mask };
};
def("R", "config", "ip nat pool <word|Pool name> <ip|Start IP address> <ip|End IP address> netmask <ip|Network mask>", (c, [n, s, e, m]) => natPool(c, n, s, e, m));
def("R", "config", "ip nat pool <word|Pool name> <ip|Start IP address> <ip|End IP address> prefix-length <num:1-32|Prefix length>", (c, [n, s, e, l]) => natPool(c, n, s, e, lenMask(l)));
def("R", "config", "no ip nat pool <word|Pool name>", (c, [n]) => {
  if (c.cfg.nat.dyn.some((r) => r.pool === n)) { c.print(`%Pool ${n} in use, cannot destroy`); return; }
  delete c.cfg.nat.pools[n];
});
def("R", "priv", "show ip nat translations", (c) => c.print(showNatTranslations(c.net, c.d.name)));
def("R", "priv", "show ip nat statistics", (c) => c.print(showNatStats(c.net, c.d.name)));
def("R", "priv", "clear ip nat translation *", (c) => { c.d.rt.nat = []; });
def("R", "priv", "clear ip nat statistics", (c) => { c.d.rt.natStats = { hits: 0, misses: 0 }; });

// ---- HSRP and object tracking ----------------------------------------------------------------
const GRP = "<num:0-4095|group number>";
const standby = (c, g, fn) => eachIf(c, (n, i) => {
  if (g > 255 && i.hsrpVer !== 2) { c.print("% Invalid group number for HSRP version 1 (0-255)"); return false; }
  if (!i.standby[g]) i.standby[g] = { ip: null, prio: 100, preempt: false, timers: null, tracks: [], auth: null, name: null, mac: null, follow: null };
  return fn(i.standby[g], n, i);
});
const standbyCmd = (spec, fn) => {
  def("R", IF_MODES, "standby " + spec, (c, args) => fn(c, 0, args));
  def("R", IF_MODES, `standby ${GRP} ` + spec, (c, [g, ...args]) => fn(c, g, args));
};
standbyCmd("ip <ip|Virtual IP address>", (c, g, [ip]) => standby(c, g, (s, n, i) => {
  if (i.ip !== null && ip === i.ip) { c.print("% address cannot equal interface IP address"); return false; }
  if (i.ip !== null && !sameNet(ip, i.ip, i.mask)) c.print("% Warning: address is not within a subnet on this interface");
  s.ip = ip;
  return true;
}));
standbyCmd("priority <num:0-255|Priority level>", (c, g, [p]) => standby(c, g, (s) => { s.prio = p; }));
standbyCmd("preempt", (c, g) => standby(c, g, (s) => { s.preempt = true; }));
standbyCmd("authentication <word|Plain text authentication string (8 chars max)>", (c, g, [k]) => standby(c, g, (s) => { s.auth = "text " + k.slice(0, 8); }));
standbyCmd("authentication text <word|Plain text authentication string (8 chars max)>", (c, g, [k]) => standby(c, g, (s) => { s.auth = "text " + k.slice(0, 8); }));
standbyCmd("authentication md5 key-string <word|Key string>", (c, g, [k]) => standby(c, g, (s) => { s.auth = "md5 " + k; }));
standbyCmd("name <word|Redundancy name string>", (c, g, [n]) => standby(c, g, (s) => { s.name = n; }));
standbyCmd("mac-address <mac>", (c, g, [m]) => standby(c, g, (s) => { s.mac = m; }));
standbyCmd("follow <word|Redundancy name of the group to follow>", (c, g, [n]) => standby(c, g, (s) => { s.follow = n; }));
standbyCmd("timers <num:1-254|Hello interval in seconds> <num:1-255|Hold time in seconds>", (c, g, [h, d]) => standby(c, g, (s) => {
  if (d <= h) { c.print("% Hold time must be greater than hello time"); return false; }
  s.timers = [h, d];
  return true;
}));
const addTrack = (c, g, obj, dec) => standby(c, g, (s) => {
  const t = s.tracks.find((x) => x.obj === obj);
  if (t) t.dec = dec; else s.tracks.push({ obj, dec });
});
standbyCmd("track <num:1-1000|Tracked object number>", (c, g, [o]) => addTrack(c, g, o, 10));
standbyCmd("track <num:1-1000|Tracked object number> decrement <num:1-255|Priority decrement>", (c, g, [o, dec]) => addTrack(c, g, o, dec));
// The older interface form creates a tracking object behind the scenes, exactly as IOS 15 does.
const trackIf = (c, g, ifn, dec) => c.s.withIf(ifn, 3, () => {
  let obj = +(Object.keys(c.cfg.tracks).find((k) => c.cfg.tracks[k].ifn === ifn) || 0);
  if (!obj) { obj = 1; while (c.cfg.tracks[obj]) obj++; c.cfg.tracks[obj] = { ifn }; }
  addTrack(c, g, obj, dec);
});
standbyCmd("track <intf>", (c, g, [ifn]) => trackIf(c, g, ifn, 10));
standbyCmd("track <intf> <num:1-255|Priority decrement>", (c, g, [ifn, dec]) => trackIf(c, g, ifn, dec));
def("R", IF_MODES, `no standby ${GRP}`, (c, [g]) => eachIf(c, (n, i) => { delete i.standby[g]; }));
const noStandby = (spec, fn) => {
  def("R", IF_MODES, "no standby " + spec, (c, args) => eachIf(c, (n, i) => i.standby[0] && fn(i.standby[0], args)));
  def("R", IF_MODES, `no standby ${GRP} ` + spec, (c, [g, ...args]) => eachIf(c, (n, i) => i.standby[g] && fn(i.standby[g], args)));
};
noStandby("ip", (s) => { s.ip = null; });
noStandby("priority", (s) => { s.prio = 100; });
noStandby("preempt", (s) => { s.preempt = false; });
noStandby("timers", (s) => { s.timers = null; });
noStandby("authentication", (s) => { s.auth = null; });
noStandby("name", (s) => { s.name = null; });
noStandby("mac-address", (s) => { s.mac = null; });
noStandby("follow", (s) => { s.follow = null; });
noStandby("track <num:1-1000|Tracked object number>", (s, [o]) => { s.tracks = s.tracks.filter((t) => t.obj !== o); });
def("R", IF_MODES, "standby version <num:1-2|Version number>", (c, [v]) => eachIf(c, (n, i) => {
  if (v === 1 && Object.keys(i.standby).some((g) => +g > 255)) { c.print("% Group numbers above 255 need HSRP version 2"); return false; }
  i.hsrpVer = v;
  return true;
}));
def("R", IF_MODES, "no standby version", (c) => eachIf(c, (n, i) => { i.hsrpVer = 1; }));
def("R", "config", "track <num:1-1000|Tracked object> interface <intf> line-protocol", (c, [o, ifn]) => c.s.withIf(ifn, 3, () => {
  c.cfg.tracks[o] = { ifn };
  c.s.enter("track", o);
}));
def("R", "config", "no track <num:1-1000|Tracked object>", (c, [o]) => { delete c.cfg.tracks[o]; });
def("R", both, "show standby", (c) => c.print(showStandby(c.net, c.d.name, false)));
def("R", both, "show standby brief", (c) => c.print(showStandby(c.net, c.d.name, true)));
def("R", both, "show track", (c) => c.print(showTrack(c.net, c.d.name)));

// ---- EIGRP ---------------------------------------------------------------------------------
const newEigrp = (asn, name) => ({ asn, name, rid: null, networks: [], passive: [], noPassive: [], passiveDefault: false,
  k: [1, 0, 1, 0, 0], redistStatic: false, variance: 1, autoSummary: false });
def("R", "config", "router eigrp <num:1-65535|Autonomous System>", (c, [asn]) => {
  const e = c.cfg.eigrp;
  if (e && (e.name || e.asn !== asn)) { c.print(`% This simulator runs one EIGRP instance per router; this router already runs "router eigrp ${e.name || e.asn}".`); return; }
  if (!e) c.cfg.eigrp = newEigrp(asn, null);
  c.s.enter("eigrp", null);
});
def("R", "config", "router eigrp <word|EIGRP Virtual-Instance Name>", (c, [name]) => {
  const e = c.cfg.eigrp;
  if (e && e.name !== name) { c.print(`% This simulator runs one EIGRP instance per router; this router already runs "router eigrp ${e.name || e.asn}".`); return; }
  if (!e) c.cfg.eigrp = newEigrp(null, name);
  c.s.enter("eigrpn", null);
});
def("R", "config", "no router eigrp <num:1-65535|Autonomous System>", (c, [asn]) => { if (c.cfg.eigrp && !c.cfg.eigrp.name && c.cfg.eigrp.asn === asn) c.cfg.eigrp = null; });
def("R", "config", "no router eigrp <word|EIGRP Virtual-Instance Name>", (c, [n]) => { if (c.cfg.eigrp && c.cfg.eigrp.name === n) c.cfg.eigrp = null; });
const enterAf = (c, asn) => {
  const e = c.cfg.eigrp;
  if (e.asn !== null && e.asn !== asn) { c.print(`% Address family IPv4 is already running autonomous-system ${e.asn}`); return; }
  e.asn = asn;
  c.s.enter("eigrpaf", null);
};
def("R", "eigrpn", "address-family ipv4 unicast autonomous-system <num:1-65535|Autonomous System>", (c, [asn]) => enterAf(c, asn));
def("R", "eigrpn", "address-family ipv4 autonomous-system <num:1-65535|Autonomous System>", (c, [asn]) => enterAf(c, asn));
def("R", "eigrpn", "no address-family ipv4 unicast autonomous-system <num:1-65535|Autonomous System>", (c) => { c.cfg.eigrp = newEigrp(null, c.cfg.eigrp.name); });
def("R", "eigrpaf", "exit-address-family", (c) => c.s.enter("eigrpn", null));
def("R", "eigrpaf", "af-interface <intf>", (c, [n]) => c.s.withIf(n, 1, (ifn) => c.s.enter("afif", ifn)));
def("R", "eigrpaf", "af-interface default", (c) => c.s.enter("afif", "default"));
def("R", "afif", "exit-af-interface", (c) => c.s.enter("eigrpaf", null));
const eigrpPassive = (c, ifn, on) => {
  const e = c.cfg.eigrp;
  if (ifn === "default") { Object.assign(e, { passiveDefault: on, passive: [], noPassive: [] }); return; }
  if (e.passiveDefault) { e.noPassive = e.noPassive.filter((x) => x !== ifn); if (!on) e.noPassive.push(ifn); }
  else { e.passive = e.passive.filter((x) => x !== ifn); if (on) e.passive.push(ifn); }
};
def("R", "afif", "passive-interface", (c) => eigrpPassive(c, c.target, true));
def("R", "afif", "no passive-interface", (c) => eigrpPassive(c, c.target, false));
def("R", "eigrpaf", "topology base", (c) => c.s.enter("aftop", null));
def("R", "aftop", "exit-af-topology", (c) => c.s.enter("eigrpaf", null));
// Commands shared by classic mode and the named-mode address family / topology.
const eigrpNet = (c, addr, wild) => {
  const e = c.cfg.eigrp;
  if (wild !== null && maskLen(wild) > 0) wild = (~wild) >>> 0; // a subnet mask is accepted and turned into a wildcard
  const n = wild === null ? { addr: majorNet(addr).net, wild: null } : { addr: and(addr, ~wild), wild };
  if (!e.networks.some((x) => x.addr === n.addr && x.wild === n.wild)) e.networks.push(n);
};
const eigrpNoNet = (c, addr, wild) => {
  const e = c.cfg.eigrp, before = e.networks.length;
  if (wild !== null && maskLen(wild) > 0) wild = (~wild) >>> 0;
  const base = wild === null ? majorNet(addr).net : and(addr, ~wild);
  e.networks = e.networks.filter((x) => !(x.addr === base && x.wild === wild));
  if (before === e.networks.length) c.print("% EIGRP: Network not found");
};
for (const m of ["eigrp", "eigrpaf"]) {
  def("R", m, "network <ip|Network number>", (c, [a]) => eigrpNet(c, a, null));
  def("R", m, "network <ip|Network number> <ip|EIGRP wild card bits>", (c, [a, w]) => eigrpNet(c, a, w));
  def("R", m, "no network <ip|Network number>", (c, [a]) => eigrpNoNet(c, a, null));
  def("R", m, "no network <ip|Network number> <ip|EIGRP wild card bits>", (c, [a, w]) => eigrpNoNet(c, a, w));
  def("R", m, "eigrp router-id <ip|EIGRP Router-ID in IP address format>", (c, [r]) => { c.cfg.eigrp.rid = r; });
  def("R", m, "no eigrp router-id", (c) => { c.cfg.eigrp.rid = null; });
  const K = "<num:0-255|K value>";
  def("R", m, `metric weights <num:0-0|Type Of Service (Only TOS 0 supported)> ${K} ${K} ${K} ${K} ${K}`, (c, [, ...k]) => { c.cfg.eigrp.k = k; });
  if (m === "eigrpaf") def("R", m, `metric weights <num:0-0|Type Of Service (Only TOS 0 supported)> ${K} ${K} ${K} ${K} ${K} <num:0-0|K6>`, (c, [, ...k]) => { c.cfg.eigrp.k = k.slice(0, 5); });
  def("R", m, "no metric weights", (c) => { c.cfg.eigrp.k = [1, 0, 1, 0, 0]; });
}
for (const m of ["eigrp", "aftop"]) {
  def("R", m, "redistribute static", (c) => { c.cfg.eigrp.redistStatic = true; });
  def("R", m, "no redistribute static", (c) => { c.cfg.eigrp.redistStatic = false; });
  def("R", m, "variance <num:1-128|Metric variance multiplier>", (c, [v]) => { c.cfg.eigrp.variance = v; });
  def("R", m, "no variance", (c) => { c.cfg.eigrp.variance = 1; });
}
def("R", "eigrp", "passive-interface <intf>", (c, [n]) => c.s.withIf(n, 1, (ifn) => eigrpPassive(c, ifn, true)));
def("R", "eigrp", "no passive-interface <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => eigrpPassive(c, ifn, false)));
def("R", "eigrp", "passive-interface default", (c) => eigrpPassive(c, "default", true));
def("R", "eigrp", "no passive-interface default", (c) => eigrpPassive(c, "default", false));
def("R", "eigrp", "auto-summary", (c) => { c.cfg.eigrp.autoSummary = true; c.print("% This simulator doesn't summarise EIGRP routes; auto-summary is off in IOS 15 and later."); });
def("R", "eigrp", "no auto-summary", (c) => { c.cfg.eigrp.autoSummary = false; });
def("R", IF_MODES, "delay <num:1-16777215|Throughput delay (tens of microseconds)>", (c, [d]) => eachIf(c, (n, i) => { i.delay = d; }));
def("R", IF_MODES, "no delay", (c) => eachIf(c, (n, i) => { i.delay = null; }));
def("R", "priv", "show ip eigrp neighbors", (c) => c.cfg.eigrp && c.print(showEigrpNbrs(c.net, c.d.name)));
def("R", "priv", "show ip eigrp topology", (c) => c.cfg.eigrp && c.print(showEigrpTopo(c.net, c.d.name)));
def("R", "priv", "show ip eigrp interfaces", (c) => c.cfg.eigrp && c.print(showEigrpIfs(c.net, c.d.name)));
def("R", "priv", "clear ip eigrp neighbors", () => {});
// OSPF redistribution of static routes.
def("R", "ospf", "redistribute static", (c) => {
  Object.assign(c.cfg.ospf, { redistStatic: true, redistSubnets: false });
  c.print("% Only classful networks will be redistributed");
});
def("R", "ospf", "redistribute static subnets", (c) => Object.assign(c.cfg.ospf, { redistStatic: true, redistSubnets: true }));
def("R", "ospf", "no redistribute static", (c) => Object.assign(c.cfg.ospf, { redistStatic: false, redistSubnets: false }));

// ---- IPv6 and OSPFv3 ---------------------------------------------------------------------------
def("R", "config", "ipv6 unicast-routing", (c) => { c.cfg.ipv6Routing = true; });
def("R", "config", "no ipv6 unicast-routing", (c) => { c.cfg.ipv6Routing = false; });
const addRoute6 = (c, pfx, ifn, nh, ad) => {
  if (ifn === null) { c.print("% Incomplete command."); return; }
  const a = parse6(pfx.a);
  if (net6(a, pfx.len) !== a) { c.print("% Invalid IPv6 prefix: host bits are set (use " + fmt6(net6(a, pfx.len)) + "/" + pfx.len + ")"); return; }
  if (nh && isLL(parse6(nh)) && !ifn) { c.print("% Interface has to be specified for a link-local nexthop"); return; }
  const r = { net: pfx.a, len: pfx.len, ifn: ifn || null, nh: nh || null, ad };
  const ex = c.cfg.routes6.find((x) => x.net === r.net && x.len === r.len && x.ifn === r.ifn && x.nh === r.nh);
  if (ex) ex.ad = ad; else c.cfg.routes6.push(r);
};
const P6 = "<ip6pfx>", NH6 = "<ip6|IPv6 address of next-hop>", AD = "<num:1-254|Administrative distance>";
def("R", "config", `ipv6 route ${P6} ${NH6}`, (c, [p, nh]) => addRoute6(c, p, undefined, nh, 1));
def("R", "config", `ipv6 route ${P6} ${NH6} ${AD}`, (c, [p, nh, ad]) => addRoute6(c, p, undefined, nh, ad));
def("R", "config", `ipv6 route ${P6} <intf>`, (c, [p, i]) => addRoute6(c, p, i, null, 1));
def("R", "config", `ipv6 route ${P6} <intf> ${AD}`, (c, [p, i, ad]) => addRoute6(c, p, i, null, ad));
def("R", "config", `ipv6 route ${P6} <intf> ${NH6}`, (c, [p, i, nh]) => addRoute6(c, p, i, nh, 1));
def("R", "config", `ipv6 route ${P6} <intf> ${NH6} ${AD}`, (c, [p, i, nh, ad]) => addRoute6(c, p, i, nh, ad));
const delRoute6 = (c, p, ifn, nh) => {
  const before = c.cfg.routes6.length;
  c.cfg.routes6 = c.cfg.routes6.filter((r) => !(r.net === p.a && r.len === p.len && (ifn === undefined || r.ifn === ifn) && (nh === undefined || r.nh === nh)));
  if (c.cfg.routes6.length === before) c.print("%No matching route to delete");
};
def("R", "config", `no ipv6 route ${P6}`, (c, [p]) => delRoute6(c, p));
def("R", "config", `no ipv6 route ${P6} ${NH6}`, (c, [p, nh]) => delRoute6(c, p, undefined, nh));
def("R", "config", `no ipv6 route ${P6} <intf>`, (c, [p, i]) => delRoute6(c, p, i));
def("R", "config", `no ipv6 route ${P6} <intf> ${NH6}`, (c, [p, i, nh]) => delRoute6(c, p, i, nh));
const newOspf6 = (pid) => ({ pid, rid: null, passive: [], noPassive: [], passiveDefault: false, defaultOriginate: false, defaultAlways: false, refBw: 100 });
def("R", "config", "ipv6 router ospf <num:1-65535|Process ID>", (c, [pid]) => {
  if (!c.cfg.ipv6Routing) { c.print("% IPv6 routing not enabled"); return; }
  const o = c.cfg.ospf6;
  if (o && o.pid !== pid) { c.print(`% This simulator runs one OSPFv3 process per router; this router already runs "ipv6 router ospf ${o.pid}".`); return; }
  if (!o) c.cfg.ospf6 = newOspf6(pid);
  c.s.enter("ospf6", null);
});
def("R", "config", "no ipv6 router ospf <num:1-65535|Process ID>", (c, [pid]) => {
  if (!c.cfg.ospf6 || c.cfg.ospf6.pid !== pid) return;
  c.cfg.ospf6 = null;
  for (const i of Object.values(c.cfg.intfs)) if (i.ospf6 && i.ospf6.pid === pid) { delete i.ospf6.pid; delete i.ospf6.area; }
});
def("R", "ospf6", "router-id <ip|OSPF router-id in IP address format>", (c, [r]) => { c.cfg.ospf6.rid = r; });
def("R", "ospf6", "no router-id", (c) => { c.cfg.ospf6.rid = null; });
def("R", "ospf6", "passive-interface <intf>", (c, [n]) => c.s.withIf(n, 1, (ifn) => {
  const o = c.cfg.ospf6;
  if (o.passiveDefault) o.noPassive = o.noPassive.filter((x) => x !== ifn);
  else if (!o.passive.includes(ifn)) o.passive.push(ifn);
}));
def("R", "ospf6", "no passive-interface <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => {
  const o = c.cfg.ospf6;
  if (o.passiveDefault) { if (!o.noPassive.includes(ifn)) o.noPassive.push(ifn); } else o.passive = o.passive.filter((x) => x !== ifn);
}));
def("R", "ospf6", "passive-interface default", (c) => Object.assign(c.cfg.ospf6, { passiveDefault: true, noPassive: [], passive: [] }));
def("R", "ospf6", "no passive-interface default", (c) => Object.assign(c.cfg.ospf6, { passiveDefault: false, noPassive: [], passive: [] }));
def("R", "ospf6", "default-information originate", (c) => Object.assign(c.cfg.ospf6, { defaultOriginate: true, defaultAlways: false }));
def("R", "ospf6", "default-information originate always", (c) => Object.assign(c.cfg.ospf6, { defaultOriginate: true, defaultAlways: true }));
def("R", "ospf6", "no default-information originate", (c) => Object.assign(c.cfg.ospf6, { defaultOriginate: false, defaultAlways: false }));
def("R", "ospf6", "auto-cost reference-bandwidth <num:1-4294967|The reference bandwidth in terms of Mbits per second>", (c, [bw]) => {
  c.cfg.ospf6.refBw = bw;
  c.print("% OSPFv3: Reference bandwidth is changed.\n        Please ensure reference bandwidth is consistent across all routers.");
});
def("R", "ospf6", "no auto-cost reference-bandwidth", (c) => { c.cfg.ospf6.refBw = 100; });
const v6If = (c, fn) => eachIf(c, (n, i) => fn(n, i.ipv6, i));
def("R", IF_MODES, "ipv6 address <ip6pfx>", (c, [p]) => v6If(c, (n, v, i) => {
  const a = parse6(p.a);
  if (isLL(a)) { c.print("% Link-local addresses use 'ipv6 address " + p.a + " link-local'"); return false; }
  if ((a >> 120n) === 0xffn) { c.print("% Multicast address is not allowed as an interface address"); return false; }
  for (const [o, oc] of Object.entries(c.cfg.intfs)) {
    if (o === n) continue;
    for (const x of oc.ipv6.addrs) {
      const l = Math.min(x.len, p.len);
      if (net6(parse6(x.a), l) === net6(a, l)) { c.print(`% ${fmt6(net6(a, p.len))}/${p.len} overlaps with ${o}`); return false; }
    }
  }
  if (!v.addrs.some((x) => x.a === p.a && x.len === p.len && !x.eui)) v.addrs.push({ a: p.a, len: p.len, eui: false });
  return true;
}));
def("R", IF_MODES, "ipv6 address <ip6pfx> eui-64", (c, [p]) => v6If(c, (n, v) => {
  if (p.len > 64) { c.print("% Prefix length must be 64 or less for an eui-64 address"); return false; }
  const net = fmt6(net6(parse6(p.a), p.len));
  if (!v.addrs.some((x) => x.a === net && x.eui)) v.addrs.push({ a: net, len: p.len, eui: true });
  return true;
}));
def("R", IF_MODES, "ipv6 address <ip6|IPv6 link-local address> link-local", (c, [a]) => v6If(c, (n, v) => {
  if (!isLL(parse6(a))) { c.print("% Invalid link-local address"); return false; }
  v.ll = a;
  return true;
}));
def("R", IF_MODES, "ipv6 address autoconfig", (c) => v6If(c, (n, v) => { v.auto = true; }));
def("R", IF_MODES, "no ipv6 address", (c) => v6If(c, (n, v) => { Object.assign(v, { addrs: [], ll: null, auto: false }); }));
def("R", IF_MODES, "no ipv6 address <ip6pfx>", (c, [p]) => v6If(c, (n, v) => { v.addrs = v.addrs.filter((x) => !(x.a === p.a && x.len === p.len && !x.eui)); }));
def("R", IF_MODES, "no ipv6 address <ip6pfx> eui-64", (c, [p]) => v6If(c, (n, v) => {
  const net = fmt6(net6(parse6(p.a), p.len));
  v.addrs = v.addrs.filter((x) => !(x.a === net && x.len === p.len && x.eui));
}));
def("R", IF_MODES, "no ipv6 address <ip6|IPv6 link-local address> link-local", (c) => v6If(c, (n, v) => { v.ll = null; }));
def("R", IF_MODES, "no ipv6 address autoconfig", (c) => v6If(c, (n, v) => { v.auto = false; }));
def("R", IF_MODES, "ipv6 enable", (c) => v6If(c, (n, v) => { v.enable = true; }));
def("R", IF_MODES, "no ipv6 enable", (c) => v6If(c, (n, v) => { v.enable = false; }));
def("R", IF_MODES, "ipv6 ospf <num:1-65535|Process ID> area <word|OSPF area ID as a decimal value or in IP address format>", (c, [pid, a]) => {
  const area = parseArea(a);
  if (area === null) { c.invalid(4); return; }
  if (!c.cfg.ipv6Routing) { c.print("% IPv6 routing not enabled"); return; }
  if (c.cfg.ospf6 && c.cfg.ospf6.pid !== pid) { c.print(`% This simulator runs one OSPFv3 process per router; this router already runs "ipv6 router ospf ${c.cfg.ospf6.pid}".`); return; }
  if (!c.cfg.ospf6) c.cfg.ospf6 = newOspf6(pid);
  eachIf(c, (n, i) => { i.ospf6.pid = pid; i.ospf6.area = area; });
  if (c.net.ospf6Rid(c.d.name) === null) c.print(`%OSPFv3-4-NORTRID: OSPFv3 process ${pid} could not pick a router-id, please configure manually`);
});
def("R", IF_MODES, "no ipv6 ospf <num:1-65535|Process ID> area <word|OSPF area ID as a decimal value or in IP address format>", (c) => eachIf(c, (n, i) => {
  delete i.ospf6.pid; delete i.ospf6.area;
}));
const o6Set = (key, val) => (c, args) => eachIf(c, (n, i) => { i.ospf6[key] = val === undefined ? args[0] : val; });
const o6Del = (key) => (c) => eachIf(c, (n, i) => { delete i.ospf6[key]; });
def("R", IF_MODES, "ipv6 ospf cost <num:1-65535|Cost>", o6Set("cost"));
def("R", IF_MODES, "no ipv6 ospf cost", o6Del("cost"));
def("R", IF_MODES, "ipv6 ospf hello-interval <num:1-65535|Seconds>", o6Set("hello"));
def("R", IF_MODES, "no ipv6 ospf hello-interval", o6Del("hello"));
def("R", IF_MODES, "ipv6 ospf dead-interval <num:1-65535|Seconds>", o6Set("dead"));
def("R", IF_MODES, "no ipv6 ospf dead-interval", o6Del("dead"));
def("R", IF_MODES, "ipv6 ospf priority <num:0-255|Priority>", o6Set("prio"));
def("R", IF_MODES, "no ipv6 ospf priority", o6Del("prio"));
def("R", IF_MODES, "ipv6 ospf network point-to-point", o6Set("ptp", true));
def("R", IF_MODES, "no ipv6 ospf network", o6Del("ptp"));
def("R", both, "ping ipv6 <ip6|Ping destination address>", (c, [a]) => c.s.ping6(a));
def("R", both, "ping <ip6|Ping destination address>", (c, [a]) => c.s.ping6(a));
def("R", both, "ping ipv6 <ip6|Ping destination address> repeat <num:1-100>", (c, [a, n]) => c.s.ping6(a, n));
def("R", both, "show ipv6 interface brief", (c) => c.print(showIpv6IntBrief(c.net, c.d.name)));
def("R", both, "show ipv6 interface", (c) => c.print(showIpv6Int(c.net, c.d.name)));
def("R", both, "show ipv6 interface <intf>", (c, [n]) => c.s.withIf(n, 3, (ifn) => c.print(showIpv6Int(c.net, c.d.name, ifn))));
def("R", both, "show ipv6 route", (c) => c.print(showIpv6Route(c.net, c.d.name)));
def("R", both, "show ipv6 route {connected|static|ospf|local}", (c, [f]) => c.print(showIpv6Route(c.net, c.d.name, { connected: "C", static: "S", ospf: "O", local: "L" }[f])));
def("R", "priv", "show ipv6 ospf neighbor", (c) => c.print(showOspf6Nbr(c.net, c.d.name)));
def("R", "priv", "show ipv6 ospf interface brief", (c) => c.print(showOspf6IntBrief(c.net, c.d.name)));
def("R", both, "show ipv6 neighbors", (c) => c.print(showIpv6Neighbors(c.net, c.d.name)));
def("R", "priv", "clear ipv6 neighbors", (c) => { c.d.rt.nd = {}; });

// ---- everyday commands that make the CLI feel like the real thing --------------------------------
for (const t of ["R", "S"]) {
  def(t, IF_MODES, "speed {10|100|1000|auto}", (c, [s]) => eachIf(c, (n, i) => {
    if (n.startsWith("Loopback") || n.startsWith("Vlan") || isSub(n)) { c.invalid(0); return false; }
    if (s === "1000" && ifType(n) === "FastEthernet") { c.invalid(1); return false; }
    i.speed = s === "auto" ? null : +s;
    return true;
  }));
  def(t, IF_MODES, "no speed", (c) => eachIf(c, (n, i) => { i.speed = null; }));
  def(t, IF_MODES, "duplex {auto|full|half}", (c, [x]) => eachIf(c, (n, i) => {
    if (n.startsWith("Loopback") || n.startsWith("Vlan") || isSub(n)) { c.invalid(0); return false; }
    if (x === "half" && i.speed === 1000) { c.print("% Duplex cannot be set to half when speed is 1000"); return false; }
    i.duplex = x === "auto" ? null : x;
    return true;
  }));
  def(t, IF_MODES, "no duplex", (c) => eachIf(c, (n, i) => { i.duplex = null; }));
}
const setTz = (c, z, h) => {
  if (!/^-?\d{1,2}$/.test(h) || Math.abs(+h) > 23) { c.invalid(3); return; }
  c.cfg.tz = [z, +h];
};
def("RS", "config", "clock timezone <word|name of time zone> <word|Hours offset from UTC (-23 to 23)>", (c, [z, h]) => setTz(c, z, h));
def("RS", "config", "clock timezone <word|name of time zone> <word|Hours offset from UTC (-23 to 23)> <num:0-59|Minutes offset from UTC>", (c, [z, h]) => setTz(c, z, h));
def("RS", "config", "no clock timezone", (c) => { c.cfg.tz = null; });
def("RS", "priv", "clock set <line|Current time and date: hh:mm:ss day month year>", (c, [t]) => {
  const m = /^(\d{1,2}):(\d{2}):(\d{2})\s+(?:(\d{1,2})\s+([A-Za-z]+)|([A-Za-z]+)\s+(\d{1,2}))\s+(\d{4})$/.exec(t.trim());
  const mon = m && ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf((m[5] || m[6]).slice(0, 3).toLowerCase());
  if (!m || mon < 0 || +m[1] > 23 || +m[2] > 59 || +m[3] > 59) { c.invalid(2); return; }
  const when = Date.UTC(+m[8], mon, +(m[4] || m[7]), +m[1], +m[2], +m[3]);
  c.d.rt.clockOffset = when - Date.now();
});
def("RS", both, "connect <ip|IP address of a remote system>", (c, [ip]) => c.s.remote("telnet", ip, null));
def("RS", "priv", "clear counters", (c) => c.s.ask(`Clear "show interface" counters on all interfaces [confirm]`, {}, () => {}));
def("RS", "priv", "clear counters <intf>", (c, [n]) => c.s.withIf(n, 2, () => c.s.ask(`Clear "show interface" counters on this interface [confirm]`, {}, () => {})));
def("RS", "priv", "debug ip icmp", (c) => { c.d.rt.debug = { ...(c.d.rt.debug || {}), icmp: true }; c.print("ICMP packet debugging is on"); });
def("RS", "priv", "no debug ip icmp", (c) => { c.d.rt.debug = { ...(c.d.rt.debug || {}), icmp: false }; c.print("ICMP packet debugging is off"); });
def("RS", "priv", "undebug ip icmp", (c) => { c.d.rt.debug = { ...(c.d.rt.debug || {}), icmp: false }; c.print("ICMP packet debugging is off"); });
const debugOff = (c) => { c.d.rt.debug = {}; c.print("All possible debugging has been turned off"); };
def("RS", "priv", "undebug all", debugOff);
def("RS", "priv", "no debug all", debugOff);
def("RS", "priv", "show debugging", (c) => {
  const on = c.d.rt.debug && c.d.rt.debug.icmp;
  c.print(on ? "IP:\n  ICMP packet debugging is on" : "");
});
def("RS", both, "terminal monitor", (c) => { if (!c.s.f.via) c.print("% Console already monitors"); });
def("RS", both, "terminal no monitor", () => {});
def("RS", both, "show inventory", (c) => {
  const pid = c.d.type === "router" ? "IOSv" : "WS-C2960-24TT-L";
  c.print(`NAME: "${c.d.type === "router" ? "IOSv" : "1"}", DESCR: "${c.d.type === "router" ? "IOSv chassis, Hw Serial#: 9" + hex(c.d.idx, 2).toUpperCase() + "SIM, Hw Revision: 1.0" : "WS-C2960-24TT-L"}"`,
    `PID: ${pid}${" ".repeat(Math.max(1, 17 - pid.length))}, VID: 1.0, SN: NETLAB${hex(c.d.idx, 4).toUpperCase()}`);
});
def("RS", both, "show users", (c) => c.print(["    Line       User       Host(s)              Idle       Location", "*  0 con 0                idle                 00:00:00",
  "", "  Interface    User               Mode         Idle     Peer Address"].join("\n")));
// Extended ping: plain "ping" in privileged mode walks through the questions.
def("RS", "priv", "ping", (c) => c.s.extendedPing());
def("RS", ["user", "priv"], "traceroute <ip|Trace route to destination address> source <intf>", (c, [ip, n]) => c.s.withIf(n, 3, (ifn) => {
  const a = c.net.ifAddr(c.d.name, ifn);
  if (!a || !c.net.ifUp(c.d.name, ifn)) { c.print("% Invalid source interface - IP not enabled or interface is down"); return; }
  c.s.traceroute(ip, a.ip);
}));

// ======== BGP ========
// BGP-4 with the IPv4 and IPv6 unicast address families: sessions that only come up when TCP 179
// really gets through, the path-vector exchange between established peers, IOS's best-path
// algorithm, and the commands and show output around them. The shared code reaches in through
// Network#bgp (sessions and tables), bgpRoutes/bgpRoutes6 (what BGP adds to the routing table),
// bgpSettle (log messages and the policy each session was brought up with), bgpCheck (lab checks)
// and bgpConfig/bgpPolicyConfig (running-config).
//
// Route-maps, prefix-lists and as-path access-lists are kept here too, in their own small
// subsection (bgpPolicy...), so BGP policy works on its own; they should be unified with the
// routing section's route-map API when the two meet.

const BGP_AFS = ["ipv4", "ipv6"];
const isV6Key = (k) => k.includes(":");
const newBgpAf = () => ({ networks: [], aggs: [], redist: {} });
const newBgp = (asn) => ({ asn, rid: null, defLp: 100, v4default: true, logChanges: true, clusterId: null,
  alwaysMed: false, sync: false, maxPaths: 1, timers: null, nbrs: {}, af: { ipv4: newBgpAf(), ipv6: null } });
const newNbrAf = (active) => ({ active, nhs: false, rrc: false, sendComm: false, defOrig: false, soft: false,
  weight: null, rmIn: null, rmOut: null, plIn: null, plOut: null });
const newBgpNbr = (remoteAs, v4default) => ({ remoteAs, desc: null, password: null, shutdown: false, multihop: null,
  noConnCheck: false, updateSource: null, af: { ipv4: newNbrAf(v4default), ipv6: newNbrAf(false) } });
const ORIGIN_RANK = { i: 0, e: 1, "?": 2 };
const ORIGIN_NAME = { i: "IGP", e: "EGP", "?": "incomplete" };
// Prefix keys: "10.1.1.0/24" for IPv4 and "2001:DB8:1::/64" for IPv6, so tables sort and compare as text.
const pfx4 = (net, len) => n2ip(net) + "/" + len;
const pfx6 = (a, len) => fmt6(net6(typeof a === "bigint" ? a : parse6(a), len)) + "/" + len;
const splitPfx = (k) => { const i = k.lastIndexOf("/"); return [k.slice(0, i), +k.slice(i + 1)]; };
const pfxNet = (k) => { const [a, l] = splitPfx(k); return isV6Key(k) ? { a: parse6(a), len: l } : { net: ip2n(a), len: l }; };
const asPathLen = (p) => p.asPath.length + (p.asSet && p.asSet.length ? 1 : 0);
const asPathStr = (p) => p.asPath.join(" ") + (p.asSet && p.asSet.length ? (p.asPath.length ? " " : "") + "{" + p.asSet.join(",") + "}" : "");
// Within the aggregate: is prefix k a more-specific of aggregate a?
const inside = (k, a) => {
  const x = pfxNet(k), y = pfxNet(a);
  if (isV6Key(k) !== isV6Key(a)) return false;
  if (isV6Key(k)) return x.len > y.len && net6(x.a, y.len) === net6(y.a, y.len);
  return x.len > y.len && and(x.net, lenMask(y.len)) === y.net;
};
// The next hop a peer sees for IPv6 prefixes sent over an IPv4 session: the IPv4-mapped address,
// which nothing can route to unless a route-map sets a real IPv6 next hop.
const mapped6 = (ip) => fmt6(parse6("::FFFF:" + n2ip(ip)));
const addrNum = (k) => (isV6Key(k) ? parse6(k) : ip2n(k));
const cmpAddr = (a, b) => { const x = addrNum(a), y = addrNum(b); return x < y ? -1 : x > y ? 1 : 0; };

// ---- policy: prefix-lists, as-path access-lists and route-maps --------------------------------
const bgpPolicyLists = (c) => (c.prefixLists = c.prefixLists || {});
const bgpPolicyMaps = (c) => (c.routeMaps = c.routeMaps || {});
const bgpPolicyAsLists = (c) => (c.asPathLists = c.asPathLists || {});

// Does a prefix-list permit prefix k? A list that doesn't exist permits everything, like IOS.
function bgpPolicyPrefixList(list, k) {
  if (!list) return true;
  const x = pfxNet(k);
  for (const e of [...list.entries].sort((a, b) => a.seq - b.seq)) {
    const y = pfxNet(e.pfx);
    if (isV6Key(k) !== isV6Key(e.pfx)) continue;
    const max = isV6Key(k) ? 128 : 32;
    const covers = isV6Key(k) ? net6(x.a, y.len) === net6(y.a, y.len) : and(x.net, lenMask(y.len)) === y.net;
    const hit = e.ge === null && e.le === null ? covers && x.len === y.len
      : covers && x.len >= (e.ge ?? y.len) && x.len <= (e.le ?? max) && x.len >= y.len;
    if (hit) return e.action === "permit";
  }
  return false;
}

// Cisco AS-path regular expressions: "_" matches a delimiter (start, end, space, braces, comma).
function bgpPolicyAsRegex(s) {
  try { return new RegExp(s.replace(/_/g, "(?:^|$|[ ,{}()])")); } catch (e) { return null; }
}

function bgpPolicyAsList(list, path) {
  if (!list) return false;
  const text = asPathStr(path);
  for (const e of list) {
    const re = bgpPolicyAsRegex(e.re);
    if (re && re.test(text)) return e.action === "permit";
  }
  return false;
}

// Run route-map `map` (a snapshot or the live one) over a path. Returns null when it denies,
// otherwise the path with the route-map's set clauses applied. `ctx` gives the lists to match
// against and whether the path is going out to an eBGP peer (as-path prepend applies there).
function bgpPolicyRouteMap(map, path, ctx) {
  if (!map) return null; // a route-map that doesn't exist denies everything
  for (const e of [...map].sort((a, b) => a.seq - b.seq)) {
    let ok = true;
    for (const m of e.match) {
      if (m.kind === "prefix-list") ok = m.names.some((n) => bgpPolicyPrefixList(ctx.prefixLists[n], path.pfx));
      else if (m.kind === "acl") ok = m.names.some((n) => {
        const acl = ctx.acls[n];
        if (!acl) return true;
        if (isV6Key(path.pfx)) return false;
        // For routes, an access-list is matched against the network number; the first hit decides.
        const net = pfxNet(path.pfx).net;
        const hit = acl.entries.find((x) => x.remark === undefined && wildMatch(net, x.src.addr, x.src.wild));
        return !!hit && hit.action === "permit";
      });
      else if (m.kind === "as-path") ok = m.names.some((n) => bgpPolicyAsList(ctx.asPathLists[n], path));
      else if (m.kind === "community") ok = m.names.some((n) => (path.comm || []).includes(n));
      if (!ok) break;
    }
    if (!ok) continue;
    if (e.action === "deny") return null;
    const out = { ...path, asPath: [...path.asPath], comm: [...(path.comm || [])] };
    for (const s of e.set) {
      if (s.kind === "weight") out.weight = s.value;
      else if (s.kind === "local-preference") out.lp = s.value;
      else if (s.kind === "metric") out.med = s.value;
      else if (s.kind === "origin") out.origin = s.value;
      else if (s.kind === "next-hop") out.nhSet = s.value;
      else if (s.kind === "prepend") out.prepend = [...(out.prepend || []), ...s.value];
      else if (s.kind === "community") out.comm = s.additive ? [...new Set([...out.comm, ...s.value])] : [...s.value];
    }
    return out;
  }
  return null;
}

// ---- the engine --------------------------------------------------------------------------------
Object.assign(Network.prototype, {
  bgpRid(dn) {
    const b = this.devs[dn].cfg.bgp;
    if (!b) return null;
    if (b.rid !== null) return b.rid;
    const ips = (lo) => this.upIfs(dn).filter((n) => lo === n.startsWith("Loopback")).map((n) => this.ifAddr(dn, n).ip);
    const l = ips(true), all = ips(false);
    return l.length ? Math.max(...l) : all.length ? Math.max(...all) : null;
  },

  // The local address a router sources a session from: its update-source, or the interface it
  // routes out of towards the neighbor.
  bgpSource(dn, key, n) {
    const v6 = isV6Key(key);
    if (n.updateSource) {
      if (!this.ifUp(dn, n.updateSource)) return null;
      if (v6) { const g = this.addrs6(dn, n.updateSource)[0]; return g ? fmt6(g.a) : null; }
      const a = this.ifAddr(dn, n.updateSource);
      return a ? n2ip(a.ip) : null;
    }
    if (v6) { const s = this.sourceIp6(dn, parse6(key)); return s === null ? null : fmt6(s); }
    const s = this.sourceIp(dn, ip2n(key));
    return s === null ? null : n2ip(s);
  },

  bgpConnected(dn, key) {
    if (isV6Key(key)) {
      const a = parse6(key);
      return this.v6Ifs(dn).some((n) => this.ifUp(dn, n) && this.addrs6(dn, n).some((x) => net6(x.a, x.len) === net6(a, x.len)));
    }
    const ip = ip2n(key);
    return this.upIfs(dn).some((n) => this.ifAddrs(dn, n).some((a) => sameNet(a.ip, ip, a.mask)));
  },

  // One TCP connection attempt to port 179 from dn to neighbor `key`.
  bgpAttempt(dn, key) {
    const me = this.devs[dn].cfg.bgp, n = me.nbrs[key];
    if (n.shutdown) return { reason: "admin" };
    if (this.bgpRid(dn) === null) return { reason: "norid" };
    const v6 = isV6Key(key), ebgp = n.remoteAs !== me.asn;
    const eg = v6 ? this.routerEgress6(dn, parse6(key)) : this.routerEgress(dn, ip2n(key));
    if (eg.fail) return { reason: "noroute" };
    const single = ebgp && !(n.multihop > 1) && !n.noConnCheck;
    if (single && !this.bgpConnected(dn, key)) return { reason: "notconnected" };
    const src = this.bgpSource(dn, key, n);
    if (src === null) return { reason: "nosource" };
    const ttl = ebgp ? n.multihop || 1 : 255;
    const send = (from, a, b, hops) => (v6
      ? this.deliver6(from, { src: parse6(a), dst: parse6(b), proto: "tcp", port: 179 }, {})
      : this.deliver(from, { src: ip2n(a), dst: ip2n(b), proto: "tcp", port: 179, ttl: hops, id: 179 }, { natTmp: {} }));
    const there = send(dn, src, key, ttl);
    if (!there.ok || there.at === dn) return { reason: "tcp" };
    const peer = this.devs[there.at], pb = peer.cfg.bgp;
    if (peer.type !== "router" || !pb || this.bgpRid(peer.name) === null) return { reason: "refused", peer: peer.name };
    const seen = v6 ? fmt6(there.pkt.src) : n2ip(there.pkt.src);
    const pn = pb.nbrs[seen];
    if (!pn || pn.shutdown) return { reason: "refused", peer: peer.name, seen };
    const pEbgp = pn.remoteAs !== pb.asn;
    if (pEbgp && !(pn.multihop > 1) && !pn.noConnCheck && !this.bgpConnected(peer.name, seen)) return { reason: "refused", peer: peer.name, seen };
    const back = send(peer.name, key, seen, pEbgp ? pn.multihop || 1 : 255);
    if (!back.ok || back.at !== dn) return { reason: "tcp" };
    if ((n.password || null) !== (pn.password || null)) return { reason: "auth", peer: peer.name, seen, src };
    if (pn.remoteAs !== me.asn) return { reason: "wrongas", peer: peer.name, seen, src, sentBy: "peer", told: pn.remoteAs };
    if (n.remoteAs !== pb.asn) return { reason: "wrongas", peer: peer.name, seen, src, sentBy: "me", told: n.remoteAs };
    if (this.bgpRid(dn) === this.bgpRid(peer.name)) return { reason: "rid", peer: peer.name, seen, src };
    return { ok: true, peer: peer.name, seen, src };
  },

  // Sessions and BGP tables for every router. Computed against the routing table without BGP in
  // it (routes() hands back the IGP-only table while this runs), so BGP never resolves through itself.
  bgp() {
    if (this.c.bgp) return this.c.bgp;
    this.c.bgpBusy = true;
    try { this.c.bgp = this.bgpCompute(); } finally { this.c.bgpBusy = false; }
    return this.c.bgp;
  },

  bgpCompute() {
    const out = {};
    const rtrs = Object.values(this.devs).filter((d) => d.type === "router" && d.cfg.bgp);
    for (const d of rtrs) {
      const b = d.cfg.bgp;
      out[d.name] = { asn: b.asn, rid: this.bgpRid(d.name), nbrs: {}, tables: { ipv4: {}, ipv6: {} }, best: { ipv4: {}, ipv6: {} } };
      for (const [k, n] of Object.entries(b.nbrs)) {
        out[d.name].nbrs[k] = { key: k, remoteAs: n.remoteAs, ebgp: n.remoteAs !== b.asn, state: "Idle", up: false,
          attempt: null, peer: null, peerKey: null, local: null, rcvd: { ipv4: 0, ipv6: 0 }, sent: { ipv4: 0, ipv6: 0 },
          adjIn: { ipv4: [], ipv6: [] }, raw: { ipv4: [], ipv6: [] }, afs: [] };
      }
    }
    // Sessions: either end's connection attempt is enough.
    for (const d of rtrs) {
      for (const k of Object.keys(d.cfg.bgp.nbrs)) {
        const s = out[d.name].nbrs[k], a = this.bgpAttempt(d.name, k);
        s.attempt = a;
        if (!a.ok) continue;
        // Each end records who it talks to, the address that end knows the peer by, and its own address.
        Object.assign(s, { up: true, state: "Established", peer: a.peer, peerKey: a.seen, local: a.src });
        Object.assign(out[a.peer].nbrs[a.seen], { up: true, state: "Established", peer: d.name, peerKey: k, local: k });
      }
    }
    for (const r of Object.values(out)) {
      for (const s of Object.values(r.nbrs)) {
        if (s.up) continue;
        const why = s.attempt && s.attempt.reason;
        s.state = why === "admin" ? "Idle (Admin)" : ["noroute", "notconnected", "norid"].includes(why) ? "Idle" : "Active";
      }
    }
    for (const [dn, r] of Object.entries(out)) {
      const b = this.devs[dn].cfg.bgp;
      for (const s of Object.values(r.nbrs)) {
        if (!s.up) continue;
        const pb = this.devs[s.peer].cfg.bgp;
        s.afs = BGP_AFS.filter((af) => b.nbrs[s.key].af[af].active && pb.nbrs[s.peerKey].af[af].active);
      }
    }
    for (const af of BGP_AFS) this.bgpExchange(out, af);
    return out;
  },

  // The policy a session runs with: the snapshot taken when it came up (or was last cleared), so a
  // route-map edited later only takes effect after `clear ip bgp ... soft`, as on IOS.
  bgpPol(dn, key, af, dir) {
    const d = this.devs[dn], live = d.cfg.bgp.nbrs[key].af[af];
    const snap = d.rt.bgp && d.rt.bgp.up[key] && d.rt.bgp.up[key].pol && d.rt.bgp.up[key].pol[af];
    if (snap && snap[dir]) return snap[dir];
    return this.bgpPolNow(d, live, dir);
  },

  bgpPolNow(d, live, dir) {
    const c = d.cfg, rm = dir === "in" ? live.rmIn : live.rmOut, pl = dir === "in" ? live.plIn : live.plOut;
    const lists = {}, asl = {};
    const maps = c.routeMaps || {}, pls = c.prefixLists || {}, asls = c.asPathLists || {};
    if (pl && pls[pl]) lists[pl] = clone(pls[pl]);
    let map = null;
    if (rm) {
      map = maps[rm] ? clone(maps[rm]) : null;
      for (const e of map || []) {
        for (const m of e.match) {
          for (const n of m.names) {
            if (m.kind === "prefix-list" && pls[n]) lists[n] = clone(pls[n]);
            if (m.kind === "as-path" && asls[n]) asl[n] = clone(asls[n]);
          }
        }
      }
    }
    return { rm, map, pl, lists, asl, weight: dir === "in" ? live.weight : null };
  },

  bgpPolicyCtx(dn, pol) {
    return { prefixLists: pol.lists, asPathLists: pol.asl, acls: this.devs[dn].cfg.acls };
  },

  // The IGP route a next hop resolves through (null when it doesn't resolve).
  bgpNhRoute(dn, af, nh) {
    if (nh === null || nh === undefined) return null;
    if (af === "ipv6") {
      const a = parse6(nh);
      if (a === null || (a >> 32n) === 0xffffn) return null; // an IPv4-mapped next hop goes nowhere
      return lpm6(this.routes6(dn), a);
    }
    return lpm(this.routes(dn), ip2n(nh));
  },

  // Paths a router originates itself: network statements, redistribution and aggregates.
  bgpLocal(dn, af) {
    const b = this.devs[dn].cfg.bgp, conf = b.af[af], paths = [];
    if (!conf) return paths;
    const v6 = af === "ipv6";
    const table = v6 ? this.routes6(dn) : this.routes(dn);
    const keyOf = (r) => (v6 ? pfx6(r.net, r.len) : pfx4(r.net, r.len));
    const nhOf = (r) => {
      if (r.code === "C" || !r.paths || !r.paths[0] || r.paths[0].ip === null || r.paths[0].ip === undefined) return v6 ? "::" : "0.0.0.0";
      return v6 ? fmt6(r.paths[0].ip) : n2ip(r.paths[0].ip);
    };
    const base = (r, origin, how) => ({ pfx: keyOf(r), nh: nhOf(r), med: r.code === "C" || r.code[0] === "S" ? 0 : r.metric ?? 0,
      lp: b.defLp, weight: 32768, origin, asPath: [], comm: [], local: true, how, ebgp: false, ibgp: false });
    const pol = { lists: this.devs[dn].cfg.prefixLists || {}, asl: this.devs[dn].cfg.asPathLists || {} };
    const ctx = this.bgpPolicyCtx(dn, pol), maps = this.devs[dn].cfg.routeMaps || {};
    for (const nw of conf.networks) {
      const r = table.find((x) => keyOf(x) === nw.pfx && x.code !== "L");
      if (!r) continue;
      let p = base(r, "i", "network");
      if (nw.rm) p = bgpPolicyRouteMap(maps[nw.rm], p, ctx);
      if (p) paths.push(p);
    }
    for (const [src, rd] of Object.entries(conf.redist)) {
      const want = (r) => (src === "connected" ? r.code === "C" : src === "static" ? r.code[0] === "S"
        : src === "ospf" ? r.code === "O" || r.code === "O IA" : src === "eigrp" ? r.code === "D" : false);
      for (const r of table.filter(want)) {
        if (paths.some((x) => x.pfx === keyOf(r))) continue;
        let p = base(r, "?", "redistribute");
        if (rd.rm) p = bgpPolicyRouteMap(maps[rd.rm], p, ctx);
        if (p) paths.push(p);
      }
    }
    return paths;
  },

  bgpBetter(dn, af, a, b) {
    const cfg = this.devs[dn].cfg.bgp;
    if (a.weight !== b.weight) return a.weight > b.weight;
    if (a.lp !== b.lp) return a.lp > b.lp;
    if (!!a.local !== !!b.local) return !!a.local;
    if (asPathLen(a) !== asPathLen(b)) return asPathLen(a) < asPathLen(b);
    if (ORIGIN_RANK[a.origin] !== ORIGIN_RANK[b.origin]) return ORIGIN_RANK[a.origin] < ORIGIN_RANK[b.origin];
    if ((cfg.alwaysMed || a.asPath[0] === b.asPath[0]) && (a.med ?? 0) !== (b.med ?? 0)) return (a.med ?? 0) < (b.med ?? 0);
    if (a.ebgp !== b.ebgp) return a.ebgp;
    if ((a.igp ?? 0) !== (b.igp ?? 0)) return (a.igp ?? 0) < (b.igp ?? 0);
    const ra = a.originator ?? a.peerRid ?? 0, rb = b.originator ?? b.peerRid ?? 0;
    if (ra !== rb) return ra < rb;
    if ((a.clusters || []).length !== (b.clusters || []).length) return (a.clusters || []).length < (b.clusters || []).length;
    return cmpAddr(a.from || "0.0.0.0", b.from || "0.0.0.0") < 0;
  },

  // Equal enough for eBGP multipath (maximum-paths): everything up to the IGP metric matches.
  bgpMultiEqual(a, b) {
    return a.weight === b.weight && a.lp === b.lp && asPathLen(a) === asPathLen(b) && a.origin === b.origin
      && (a.med ?? 0) === (b.med ?? 0) && a.ebgp && b.ebgp && a.asPath[0] === b.asPath[0] && (a.igp ?? 0) === (b.igp ?? 0);
  },

  // Rebuild every router's table for one address family from what its peers advertise, round by
  // round, until nothing changes.
  bgpExchange(out, af) {
    const names = Object.keys(out);
    for (let round = 0; round < 40; round++) {
      // 1. Every router's candidate paths and best path per prefix.
      for (const dn of names) {
        const r = out[dn], b = this.devs[dn].cfg.bgp, rid = r.rid;
        const clusterId = b.clusterId ?? rid;
        const cands = {};
        const add = (p) => (cands[p.pfx] = cands[p.pfx] || []).push(p);
        for (const p of this.bgpLocal(dn, af)) add(p);
        for (const s of Object.values(r.nbrs)) {
          s.adjIn[af] = [];
          if (!s.up || !s.afs.includes(af)) continue;
          const pol = this.bgpPol(dn, s.key, af, "in"), ctx = this.bgpPolicyCtx(dn, pol);
          for (const raw of s.raw[af]) {
            if (raw.asPath.includes(b.asn) || (raw.asSet || []).includes(b.asn)) continue;
            if (!s.ebgp && raw.originator === rid) continue;
            if (!s.ebgp && (raw.clusters || []).includes(clusterId)) continue;
            let p = { ...raw, from: s.key, ebgp: s.ebgp, ibgp: !s.ebgp, local: false, peerRid: out[s.peer].rid,
              weight: pol.weight ?? 0, lp: s.ebgp ? b.defLp : raw.lp ?? b.defLp };
            if (pol.pl && !bgpPolicyPrefixList(pol.lists[pol.pl], p.pfx)) continue;
            if (pol.rm) { p = bgpPolicyRouteMap(pol.map, p, ctx); if (!p) continue; }
            if (p.nhSet) { p.nh = p.nhSet; delete p.nhSet; }
            delete p.prepend;
            s.adjIn[af].push(p);
            add(p);
          }
        }
        // Aggregates exist while a more-specific is in the table.
        const conf = b.af[af];
        for (const ag of conf ? conf.aggs : []) {
          const kids = Object.keys(cands).filter((k) => inside(k, ag.pfx));
          if (!kids.length) continue;
          const set = ag.asSet ? [...new Set(kids.flatMap((k) => cands[k].flatMap((p) => [...p.asPath, ...(p.asSet || [])])))] : [];
          add({ pfx: ag.pfx, nh: af === "ipv6" ? "::" : "0.0.0.0", med: null, lp: b.defLp, weight: 32768, origin: "i", asPath: [],
            asSet: set, comm: [], local: true, how: "aggregate", atomic: !ag.asSet, aggregator: { asn: b.asn, rid }, ebgp: false, ibgp: false });
        }
        const best = {};
        for (const [k, list] of Object.entries(cands)) {
          for (const p of list) {
            const via = p.local ? true : this.bgpNhRoute(dn, af, p.nh);
            p.valid = !!via;
            p.igp = via && via !== true ? via.metric ?? 0 : 0;
            // With synchronization on, an iBGP path also has to be in the IGP.
            if (p.valid && b.sync && p.ibgp) {
              const igp = af === "ipv6" ? this.routes6(dn) : this.routes(dn);
              p.valid = igp.some((x) => (af === "ipv6" ? pfx6(x.net, x.len) : pfx4(x.net, x.len)) === k);
            }
          }
          let top = null;
          for (const p of list) if (p.valid && (!top || this.bgpBetter(dn, af, p, top))) top = p;
          for (const p of list) p.best = p === top;
          if (top) {
            best[k] = top;
            if (b.maxPaths > 1 && top.ebgp) {
              const extra = list.filter((p) => p !== top && p.valid && this.bgpMultiEqual(p, top)).slice(0, b.maxPaths - 1);
              for (const p of extra) p.multipath = true;
              if (extra.length) top.multipath = true;
            }
          }
          list.sort((x, y) => (x.best ? -1 : y.best ? 1 : 0));
        }
        for (const ag of conf ? conf.aggs : []) {
          if (!ag.summaryOnly || !best[ag.pfx]) continue;
          for (const [k, list] of Object.entries(cands)) if (inside(k, ag.pfx)) for (const p of list) p.suppressed = true;
        }
        r.tables[af] = cands;
        r.best[af] = best;
      }
      // 2. What every router sends each peer; compare with what the peer had.
      let changed = false;
      for (const dn of names) {
        for (const s of Object.values(out[dn].nbrs)) {
          if (!s.up) continue;
          const sent = s.afs.includes(af) ? this.bgpAdvertise(out, dn, s, af) : [];
          s.sent[af] = sent.length;
          const t = out[s.peer].nbrs[s.peerKey];
          if (JSON.stringify(t.raw[af]) !== JSON.stringify(sent)) { t.raw[af] = sent; changed = true; }
          t.rcvd[af] = sent.length;
        }
      }
      if (!changed) break;
    }
  },

  // The updates router dn sends to session s for one address family (attributes as the peer sees them).
  bgpAdvertise(out, dn, s, af) {
    const r = out[dn], b = this.devs[dn].cfg.bgp, n = b.nbrs[s.key], naf = n.af[af];
    const clusterId = b.clusterId ?? r.rid;
    const pol = this.bgpPol(dn, s.key, af, "out"), ctx = this.bgpPolicyCtx(dn, pol);
    const sent = [];
    const v6 = af === "ipv6", sessV6 = isV6Key(s.key);
    const self = v6 ? (sessV6 ? s.local : mapped6(ip2n(s.local))) : sessV6 ? null : s.local;
    // Outbound policy sees the AS_PATH before this router adds its own AS (so `^$` matches routes
    // it originated); the AS, and any prepends, go on afterwards for eBGP peers.
    const emit = (p) => {
      if (pol.pl && !bgpPolicyPrefixList(pol.lists[pol.pl], p.pfx)) return;
      let q = p;
      if (pol.rm) { q = bgpPolicyRouteMap(pol.map, { ...p }, ctx); if (!q) return; }
      if (s.ebgp) q.asPath = [b.asn, ...(q.prepend || []), ...q.asPath];
      if (q.nhSet) q.nh = q.nhSet;
      delete q.prepend;
      delete q.nhSet;
      if (s.ebgp) delete q.lp;
      if (!naf.sendComm) q.comm = [];
      sent.push(q);
    };
    if (naf.defOrig) {
      emit({ pfx: v6 ? "::/0" : "0.0.0.0/0", nh: self, med: null, lp: s.ebgp ? undefined : b.defLp, origin: "i", asPath: [], comm: [] });
    }
    for (const [k, p] of Object.entries(r.best[af]).sort(([x], [y]) => (x < y ? -1 : 1))) {
      if (p.suppressed || p.from === s.key) continue;
      if (naf.defOrig && /^(0\.0\.0\.0|::)\/0$/.test(k)) continue;
      if (p.ibgp && !s.ebgp) {
        // iBGP split horizon, relaxed by route reflection.
        const fromClient = b.nbrs[p.from] && b.nbrs[p.from].af[af].rrc;
        if (!fromClient && !naf.rrc) continue;
      }
      const comm = p.comm || [];
      if (comm.includes("no-advertise") || (s.ebgp && comm.includes("no-export"))) continue;
      const q = { pfx: k, origin: p.origin, asPath: [...p.asPath], comm: [...comm] };
      if (p.asSet && p.asSet.length) q.asSet = [...p.asSet];
      if (p.atomic) q.atomic = true;
      if (p.aggregator) q.aggregator = p.aggregator;
      const ownNh = p.local && (p.nh === "0.0.0.0" || p.nh === "::");
      if (s.ebgp) {
        q.nh = self;
        q.med = p.local ? p.med : null;
      } else {
        q.nh = ownNh || (naf.nhs && !p.ibgp) ? self : p.nh;
        q.lp = p.lp;
        q.med = p.med ?? null;
        if (p.ibgp) {
          q.originator = p.originator ?? p.peerRid;
          q.clusters = [clusterId, ...(p.clusters || [])];
        }
      }
      if (q.nh === null) continue; // no usable next hop for this family over this session
      emit(q);
    }
    return sent;
  },

  // What BGP puts in the IPv4 routing table: best paths learned from peers, and aggregates (to Null0).
  bgpRoutes(dn) { return this.bgpRib(dn, "ipv4"); },
  bgpRoutes6(dn) { return this.bgpRib(dn, "ipv6"); },

  bgpRib(dn, af) {
    const r = this.bgp()[dn];
    if (!r) return [];
    const outR = [];
    for (const [k, p] of Object.entries(r.best[af])) {
      if (p.local && p.how !== "aggregate") continue;
      const { net, a, len } = pfxNet(k);
      const ad = p.how === "aggregate" ? 200 : p.ebgp ? 20 : 200;
      const list = (r.tables[af][k] || []).filter((x) => x.best || x.multipath);
      const paths = p.how === "aggregate" ? [{ ip: null, ifn: "Null0", bgp: true }]
        : list.map((x) => ({ ip: af === "ipv6" ? parse6(x.nh) : ip2n(x.nh), ifn: null, bgp: true, from: x.from }));
      outR.push({ code: "B", net: af === "ipv6" ? a : net, len, ad, metric: p.med ?? 0, paths, bgp: true, bgpPfx: k });
    }
    return outR;
  },

  // Log messages, and the policy each session was brought up with. Called from settle().
  bgpSettle(log) {
    const all = this.bgp();
    let changed = false;
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router") continue;
      if (!d.cfg.bgp && !d.rt.bgp) continue;
      const rt = d.rt.bgp = d.rt.bgp || { up: {}, seen: {}, ribSig: {} };
      const r = all[d.name], b = d.cfg.bgp, say = (m) => { if (!b || b.logChanges) log(d.name, m); };
      const resets = rt.reset || [];
      delete rt.reset;
      // A router with no IPv4 address and no `bgp router-id` can't run BGP.
      const noRid = !!b && Object.keys(b.nbrs).length > 0 && this.bgpRid(d.name) === null;
      if (noRid && !rt.seen._rid) log(d.name, "%BGP-4-NORTRID: BGP could not pick a router-id. Please configure manually.");
      if (noRid !== !!rt.seen._rid) { if (noRid) rt.seen._rid = true; else delete rt.seen._rid; changed = true; }
      for (const [k, s] of Object.entries(r ? r.nbrs : {})) {
        const was = rt.up[k];
        if (s.up && was && resets.includes(k)) {
          say(`%BGP-5-ADJCHANGE: neighbor ${k} Down User reset`);
          say(`%BGP_SESSION-5-ADJCHANGE: neighbor ${k} IPv4 Unicast topology base removed from session  User reset`);
          rt.up[k] = { pol: this.bgpSnapshot(d, k) };
          say(`%BGP-5-ADJCHANGE: neighbor ${k} Up `);
          changed = true;
        } else if (s.up && !was) {
          rt.up[k] = { pol: this.bgpSnapshot(d, k) };
          say(`%BGP-5-ADJCHANGE: neighbor ${k} Up `);
          changed = true;
        } else if (!s.up && was) {
          delete rt.up[k];
          const why = s.attempt && s.attempt.reason === "admin" ? "Admin. shutdown" : "Peer closed the session";
          say(`%BGP-5-ADJCHANGE: neighbor ${k} Down ${why}`);
          changed = true;
        }
        // One-off complaints for sessions that can't come up.
        const a = s.attempt, why = !s.up && a ? a.reason : null;
        if (why !== (rt.seen[k] || null)) {
          if (why === "wrongas" && a.sentBy === "me") log(d.name, `%BGP-3-NOTIFICATION: sent to neighbor ${k} passive 2/2 (peer in wrong AS) 2 bytes ${(this.devs[a.peer].cfg.bgp.asn >>> 0).toString(16).toUpperCase().padStart(4, "0")}`);
          if (why === "wrongas" && a.sentBy === "peer") log(d.name, `%BGP-3-NOTIFICATION: received from neighbor ${k} active 2/2 (peer in wrong AS) 2 bytes ${(b.asn >>> 0).toString(16).toUpperCase().padStart(4, "0")}`);
          if (why === "auth") log(a.peer, `%TCP-6-BADAUTH: ${d.cfg.bgp.nbrs[k].password ? "Invalid" : "No"} MD5 digest from ${a.src}(179) to ${k}(${11000 + d.idx})`);
          if (why === "rid") log(d.name, `%BGP-3-NOTIFICATION: sent to neighbor ${k} passive 2/3 (BGP identifier wrong) 4 bytes`);
          if (why) rt.seen[k] = why; else delete rt.seen[k];
          changed = true;
        }
      }
      for (const k of Object.keys(rt.up)) {
        if (!b || !b.nbrs[k]) { delete rt.up[k]; delete rt.seen[k]; if (b) say(`%BGP-5-ADJCHANGE: neighbor ${k} Down Neighbor deleted`); changed = true; }
      }
      for (const k of Object.keys(rt.seen)) if (!k.startsWith("_") && (!b || !b.nbrs[k])) { delete rt.seen[k]; changed = true; }
      // debug ip bgp updates: report best paths that changed.
      if (r && d.rt.debug && d.rt.debug.bgp) {
        const sig = {};
        for (const af of BGP_AFS) for (const [k, p] of Object.entries(r.best[af])) if (!p.local) sig[k] = p.nh + " " + asPathStr(p);
        for (const [k, v] of Object.entries(sig)) {
          if (rt.ribSig[k] === v) continue;
          const p = r.best[isV6Key(k) ? "ipv6" : "ipv4"][k];
          log(d.name, `BGP(${isV6Key(k) ? 1 : 0}): ${p.from} rcvd UPDATE w/ attr: nexthop ${p.nh}, origin ${p.origin}, ${p.med !== null && p.med !== undefined ? `metric ${p.med}, ` : ""}merged path ${asPathStr(p)}, AS_PATH`);
          log(d.name, `BGP(${isV6Key(k) ? 1 : 0}): Revise route installing 1 of 1 routes for ${k} -> ${p.nh}(global) to main IP table`);
        }
        for (const k of Object.keys(rt.ribSig)) if (!sig[k]) log(d.name, `BGP(${isV6Key(k) ? 1 : 0}): no valid path for ${k}`);
        rt.ribSig = sig;
      } else if (rt.ribSig && Object.keys(rt.ribSig).length) rt.ribSig = {};
    }
    return changed;
  },

  bgpSnapshot(d, key) {
    const n = d.cfg.bgp.nbrs[key], pol = {};
    for (const af of BGP_AFS) pol[af] = { in: this.bgpPolNow(d, n.af[af], "in"), out: this.bgpPolNow(d, n.af[af], "out") };
    return pol;
  },

  // `clear ip bgp`: a hard reset re-establishes the sessions; soft re-reads the policy.
  bgpClear(dn, which, soft, dir) {
    const d = this.devs[dn], rt = d.rt.bgp, b = d.cfg.bgp;
    if (!b || !rt) return;
    for (const k of Object.keys(b.nbrs)) {
      if (which !== "*" && which !== k) continue;
      if (!rt.up[k]) continue;
      if (!soft) { (rt.reset = rt.reset || []).push(k); continue; }
      const now = this.bgpSnapshot(d, k);
      for (const af of BGP_AFS) {
        if (dir !== "out") rt.up[k].pol[af].in = now[af].in;
        if (dir !== "in") rt.up[k].pol[af].out = now[af].out;
      }
    }
    // The peer re-reads its side too on a hard reset.
    if (!soft) {
      const r = this.bgp()[dn];
      for (const k of rt.reset || []) {
        const s = r && r.nbrs[k];
        if (!s || !s.up) continue;
        const pr = this.devs[s.peer].rt.bgp;
        if (pr && pr.up[s.peerKey]) pr.up[s.peerKey] = { pol: this.bgpSnapshot(this.devs[s.peer], s.peerKey) };
        this.note(s.peer, `%BGP-5-ADJCHANGE: neighbor ${s.peerKey} Down Peer closed the session`);
        this.note(s.peer, `%BGP-5-ADJCHANGE: neighbor ${s.peerKey} Up `);
      }
    }
    this.touch();
  },

  // Lab checks about BGP; undefined when the check isn't a BGP one.
  bgpCheck(d, c) {
    const r = this.bgp()[d.name];
    switch (c.type) {
      case "bgp-nbr": {
        const s = r && r.nbrs[isV6Key(c.neighbor) ? fmt6(parse6(c.neighbor)) : c.neighbor];
        return !!s && s.state === (c.state || "Established");
      }
      case "bgp-nbrs": return !!r && Object.values(r.nbrs).filter((s) => s.up).length >= c.count;
      case "bgp-route": case "bgp-noroute": case "bgp-suppressed": {
        const v6 = isV6Key(c.prefix), af = v6 ? "ipv6" : "ipv4";
        const [a, l] = splitPfx(c.prefix), k = v6 ? pfx6(a, l) : pfx4(ip2n(a), l);
        const list = r ? r.tables[af][k] || [] : [];
        if (c.type === "bgp-noroute") return !list.some((p) => p.valid);
        if (c.type === "bgp-suppressed") return list.some((p) => p.suppressed);
        const pick = list.filter((p) => (c.best === false ? p.valid : p.best));
        return pick.some((p) => (!c.via || (v6 ? fmt6(parse6(c.via)) === fmt6(parse6(p.nh)) : p.nh === c.via))
          && (c.path === undefined || asPathStr(p) === c.path) && (c.lp === undefined || p.lp === c.lp)
          && (c.weight === undefined || p.weight === c.weight) && (c.med === undefined || (p.med ?? 0) === c.med)
          && (c.origin === undefined || p.origin === c.origin) && (c.from === undefined || p.from === c.from)
          && (c.originator === undefined || (p.originator !== undefined && n2ip(p.originator) === c.originator))
          && (c.cluster === undefined || (p.clusters || []).map(n2ip).join(" ") === c.cluster));
      }
      default: return undefined;
    }
  },
});

// ---- show commands ---------------------------------------------------------------------------
const BGP_STATUS = `Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,
              x best-external, a additional-path, c RIB-compressed,
              t secondary path, L long-lived-stale,
Origin codes: i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found`;

function bgpInstalled(net, dn, af, k, p) {
  const table = af === "ipv6" ? net.routes6(dn) : net.routes(dn);
  const { net: n4, a, len } = pfxNet(k);
  const r = table.find((x) => x.len === len && (af === "ipv6" ? x.net === a : x.net === n4));
  return !!r && r.code === "B" && (p.local || r.paths.some((x) => x.bgp));
}

function bgpRows(net, dn, af, filter) {
  const r = net.bgp()[dn], L = [];
  const keys = Object.keys(r.tables[af]).sort((x, y) => {
    const a = pfxNet(x), b = pfxNet(y);
    const ax = af === "ipv6" ? a.a : a.net, bx = af === "ipv6" ? b.a : b.net;
    return ax < bx ? -1 : ax > bx ? 1 : a.len - b.len;
  });
  for (const k of keys) {
    const list = r.tables[af][k].filter((p) => !filter || filter(p));
    list.forEach((p, i) => {
      const st = (p.valid ? (p.suppressed ? "s" : "*") : " ") + (p.best ? (!p.local && !bgpInstalled(net, dn, af, k, p) ? "r" : ">") : p.multipath ? "m" : " ");
      const lead = " " + st + (p.ibgp ? "i" : " ") + " ";
      const nh = p.nh === null || p.nh === undefined ? "" : p.nh;
      const metric = p.med === null || p.med === undefined ? "" : String(p.med);
      const lp = p.ibgp || (p.lp !== undefined && p.lp !== net.devs[dn].cfg.bgp.defLp) ? String(p.lp) : "";
      const path = asPathStr(p);
      // IOS wraps a field onto the next line only when it overflows its column.
      const label = i ? "" : k;
      const head = lead + (label.length > 16 ? label + "\n" + " ".repeat(22) : pad(label, 17));
      const hop = nh.length > 19 ? nh + "\n" + " ".repeat(42) : pad(nh, 20);
      const text = (head + hop + lpad(metric, 6) + " " + lpad(lp, 6) + " " + lpad(p.weight, 6) + " " + (path ? path + " " : "") + p.origin).split("\n");
      L.push(...text.map((t) => t.trimEnd()));
    });
  }
  return L;
}

function showBgpTable(net, dn, af, filter) {
  const r = net.bgp()[dn];
  if (!r) return "% BGP not active";
  const head = [`BGP table version is ${bgpVersion(r)}, local router ID is ${r.rid === null ? "0.0.0.0" : n2ip(r.rid)}`, BGP_STATUS, "",
    "     Network          Next Hop            Metric LocPrf Weight Path"];
  const rows = bgpRows(net, dn, af, filter);
  return rows.length ? [...head, ...rows].join("\n") : "";
}

const bgpVersion = (r) => 1 + Object.values(r.tables.ipv4).length + Object.values(r.tables.ipv6).length;

function bgpUpTime(s) { return s.up ? "00:04:12" : "never"; }

function showBgpSummary(net, dn, af) {
  const r = net.bgp()[dn], b = net.devs[dn].cfg.bgp;
  if (!r) return "% BGP not active";
  const keys = Object.keys(r.tables[af]), paths = keys.reduce((s, k) => s + r.tables[af][k].length, 0);
  const L = [`BGP router identifier ${r.rid === null ? "0.0.0.0" : n2ip(r.rid)}, local AS number ${b.asn}`,
    `BGP table version is ${bgpVersion(r)}, main routing table version ${bgpVersion(r)}`];
  if (keys.length) {
    L.push(`${keys.length} network entries using ${keys.length * 144} bytes of memory`, `${paths} path entries using ${paths * 84} bytes of memory`);
    const attrs = new Set(keys.flatMap((k) => r.tables[af][k].map((p) => asPathStr(p) + p.nh)));
    L.push(`${attrs.size}/${attrs.size} BGP path/bestpath attribute entries using ${attrs.size * 152} bytes of memory`,
      `${new Set(keys.flatMap((k) => r.tables[af][k].map((p) => asPathStr(p)))).size} BGP AS-PATH entries using 48 bytes of memory`,
      "0 BGP route-map cache entries using 0 bytes of memory", "0 BGP filter-list cache entries using 0 bytes of memory",
      `BGP using ${keys.length * 144 + paths * 84} total bytes of memory`, `BGP activity ${keys.length}/0 prefixes, ${paths}/0 paths, scan interval 60 secs`);
  }
  L.push("", "Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd");
  for (const [k, s] of Object.entries(r.nbrs).sort(([x], [y]) => cmpAddr(x, y))) {
    if (!b.nbrs[k].af[af].active) continue;
    const msgs = s.up ? 8 + s.rcvd[af] : 0;
    const state = s.up ? String(s.adjIn[af].length) : s.state;
    const row = pad(k, 16) + "4 " + lpad(s.remoteAs, 12) + lpad(msgs, 8) + lpad(s.up ? 8 + s.sent[af] : 0, 8)
      + lpad(s.up ? bgpVersion(r) : 0, 9) + lpad(0, 5) + lpad(0, 5) + " " + pad(bgpUpTime(s), 9) + state;
    if (k.length > 15) L.push(k, " ".repeat(16) + row.slice(16)); else L.push(row);
  }
  return L.join("\n");
}

function showBgpNeighbor(net, dn, k) {
  const r = net.bgp()[dn], b = net.devs[dn].cfg.bgp, n = b.nbrs[k], s = r.nbrs[k];
  const L = [`BGP neighbor is ${k},  remote AS ${n.remoteAs}, ${s.ebgp ? "external" : "internal"} link`];
  if (n.desc) L.push(` Description: ${n.desc}`);
  const peerRid = s.up ? n2ip(net.bgp()[s.peer].rid) : "0.0.0.0";
  L.push(`  BGP version 4, remote router ID ${peerRid}`);
  L.push(`  BGP state = ${s.state.replace(" (Admin)", "")}${s.up ? ", up for 00:04:12" : ""}`);
  if (s.state === "Idle (Admin)") L.push("  Administratively shut down");
  L.push(s.up ? "  Last read 00:00:12, last write 00:00:12, hold time is 180, keepalive interval is 60 seconds"
    : "  Last read 00:00:00, last write 00:00:00, hold time is 180, keepalive interval is 60 seconds");
  if (s.up) {
    L.push("  Neighbor sessions:", "    1 active, is not multisession capable (disabled)", "  Neighbor capabilities:",
      "    Route refresh: advertised and received(new)", "    Four-octets ASN Capability: advertised and received");
    for (const af of s.afs) L.push(`    Address family ${af === "ipv4" ? "IPv4" : "IPv6"} Unicast: advertised and received`);
    L.push("    Enhanced Refresh Capability: advertised and received", "    Multisession Capability: ",
      "    Stateful switchover support enabled: NO for session 1");
  }
  for (const af of BGP_AFS) {
    const a = n.af[af];
    if (!a.active) continue;
    L.push("", ` For address family: ${af === "ipv4" ? "IPv4" : "IPv6"} Unicast`, `  Session: ${k}`,
      `  BGP table version ${bgpVersion(r)}, neighbor version ${s.up ? bgpVersion(r) : 1}/0`, "  Output queue size : 0",
      "  Index 1, Advertise bit 0", "  1 update-group member");
    if (a.rrc) L.push("  Route-Reflector Client");
    if (a.nhs) L.push("  NEXT_HOP is always this router for eBGP paths");
    if (a.sendComm) L.push("  Community attribute sent to this neighbor");
    if (a.soft) L.push("  Inbound soft reconfiguration allowed");
    if (a.plIn) L.push(`  Incoming update prefix filter list is ${a.plIn}`);
    if (a.plOut) L.push(`  Outgoing update prefix filter list is ${a.plOut}`);
    if (a.rmIn) L.push(`  Route map for incoming advertisements is ${a.rmIn}`);
    if (a.rmOut) L.push(`  Route map for outgoing advertisements is ${a.rmOut}`);
    if (a.defOrig) L.push("  Default information originate, default sent");
    if (a.weight !== null) L.push(`  Default weight ${a.weight}`);
    L.push("                                 Sent       Rcvd", "  Prefix activity:               ----       ----",
      `    Prefixes Current:          ${lpad(s.up ? s.sent[af] : 0, 4)}       ${lpad(s.up ? s.adjIn[af].length : 0, 4)} (Consumes ${(s.up ? s.adjIn[af].length : 0) * 80} bytes)`,
      `    Prefixes Total:            ${lpad(s.up ? s.sent[af] : 0, 4)}       ${lpad(s.up ? s.adjIn[af].length : 0, 4)}`);
  }
  L.push("");
  if (s.ebgp && !(n.multihop > 1) && !n.noConnCheck) L.push(net.bgpConnected(dn, k) ? "  External BGP neighbor configured for connected checks (single-hop no-disable-connected-check)" : "  External BGP neighbor not directly connected.");
  else if (s.ebgp && n.multihop > 1) L.push(`  External BGP neighbor may be up to ${n.multihop} hops away.`);
  if (s.up) {
    L.push(`  Connections established 1; dropped 0`, "  Last reset never",
      `Local host: ${s.local}, Local port: 179`, `Foreign host: ${k}, Foreign port: ${11000 + net.devs[dn].idx}`,
      "Connection tableid (VRF): 0", "Maximum output segment queue size: 50");
  } else {
    L.push("  Connections established 0; dropped 0", "  Last reset never");
    const why = s.attempt && s.attempt.reason;
    if (why === "noroute") L.push("  No active TCP connection");
    else if (why === "wrongas") L.push("  Last notification sent 2/2 (peer in wrong AS)");
    else L.push("  No active TCP connection");
  }
  return L.join("\n");
}

function showBgpDetail(net, dn, af, k) {
  const r = net.bgp()[dn], list = r.tables[af][k];
  if (!list || !list.length) return "% Network not in table";
  const bi = list.findIndex((p) => p.best);
  const L = [`BGP routing table entry for ${k}, version ${bgpVersion(r)}`,
    `Paths: (${list.length} available, ${bi >= 0 ? "best #" + (bi + 1) : "no best path"}, table default${list.some((p) => p.suppressed) ? ", Advertisements suppressed by an aggregate." : ""})`];
  const to = Object.values(r.nbrs).filter((s) => s.up && s.afs.includes(af)).length;
  L.push(to ? "  Advertised to update-groups:" : "  Not advertised to any peer", ...(to ? ["     1         "] : []));
  list.forEach((p) => {
    L.push("  Refresh Epoch 1", "  " + (asPathStr(p) || "Local"));
    const fromTxt = p.local ? `${p.nh} from 0.0.0.0 (${n2ip(r.rid)})` : `${p.nh}${p.valid ? "" : " (inaccessible)"} from ${p.from} (${n2ip(p.peerRid ?? 0)})`;
    L.push("    " + fromTxt);
    const bits = [`Origin ${ORIGIN_NAME[p.origin]}`];
    if (p.med !== null && p.med !== undefined) bits.push(`metric ${p.med}`);
    bits.push(`localpref ${p.lp}`);
    if (p.weight) bits.push(`weight ${p.weight}`);
    if (p.valid) bits.push("valid");
    bits.push(p.local ? (p.how === "aggregate" ? "aggregated, local, atomic-aggregate" : "sourced, local") : p.ebgp ? "external" : "internal");
    if (p.best) bits.push("best");
    if (p.multipath && !p.best) bits.push("multipath");
    L.push("      " + bits.join(", "));
    if (p.comm && p.comm.length) L.push("      Community: " + p.comm.join(" "));
    if (p.originator !== undefined && p.originator !== null) L.push(`      Originator: ${n2ip(p.originator)}, Cluster list: ${(p.clusters || []).map(n2ip).join(" ")}`);
    L.push("      rx pathid: 0, tx pathid: " + (p.best ? "0x0" : "0"));
  });
  return L.join("\n");
}

function bgpProtocols(net, dn) {
  const b = net.devs[dn].cfg.bgp, r = net.bgp()[dn];
  if (!b) return [];
  const L = [`Routing Protocol is "bgp ${b.asn}"`, "  Outgoing update filter list for all interfaces is not set",
    "  Incoming update filter list for all interfaces is not set", "  IGP synchronization is " + (b.sync ? "enabled" : "disabled"),
    "  Automatic route summarization is disabled"];
  const redist = Object.keys(b.af.ipv4.redist);
  if (redist.length) L.push("  Redistributing: " + redist.map((x) => (x === "ospf" || x === "eigrp" ? x + " " + b.af.ipv4.redist[x].id : x)).join(", "));
  const nb = Object.entries(b.nbrs);
  if (nb.length) {
    L.push("  Neighbor(s):", "    Address          FiltIn FiltOut DistIn DistOut Weight RouteMap");
    for (const [k, n] of nb) {
      const a = n.af.ipv4;
      L.push(("    " + pad(k, 17) + pad(a.plIn || "", 7) + pad(a.plOut || "", 8) + pad("", 7) + pad("", 8) + pad(a.weight ?? "", 7) + [a.rmIn, a.rmOut].filter(Boolean).join(",")).trimEnd());
    }
  }
  L.push(`  Maximum path: ${b.maxPaths}`, "  Routing Information Sources:", "    Gateway         Distance      Last Update");
  const seen = new Set();
  for (const p of Object.values(r ? r.best.ipv4 : {})) if (!p.local && !seen.has(p.from)) { seen.add(p.from); L.push("    " + pad(p.from, 16) + pad(p.ebgp ? "20" : "200", 14) + "00:00:12"); }
  L.push("  Distance: external 20 internal 200 local 200", "");
  return L;
}

function showPrefixLists(c, only) {
  const L = [];
  for (const [name, pl] of Object.entries(c.prefixLists || {}).filter(([n]) => !only || n === only)) {
    L.push(`ip prefix-list ${name}: ${pl.entries.length} entries`);
    if (pl.desc) L.push("   Description: " + pl.desc);
    for (const e of [...pl.entries].sort((a, b) => a.seq - b.seq)) L.push(`   seq ${e.seq} ${e.action} ${e.pfx}${e.ge !== null ? " ge " + e.ge : ""}${e.le !== null ? " le " + e.le : ""}`);
  }
  return L.join("\n");
}

function showRouteMaps(c, only) {
  const L = [];
  for (const [name, entries] of Object.entries(c.routeMaps || {}).filter(([n]) => !only || n === only)) {
    for (const e of [...entries].sort((a, b) => a.seq - b.seq)) {
      L.push(`route-map ${name}, ${e.action}, sequence ${e.seq}`, "  Match clauses:");
      for (const m of e.match) L.push("    " + bgpMatchText(m));
      L.push("  Set clauses:");
      for (const s of e.set) L.push("    " + bgpSetText(s));
      L.push("  Policy routing matches: 0 packets, 0 bytes");
    }
  }
  return L.join("\n");
}

const bgpMatchText = (m) => (m.kind === "prefix-list" ? "ip address prefix-lists: " + m.names.join(" ")
  : m.kind === "acl" ? "ip address (access-lists): " + m.names.join(" ")
    : m.kind === "as-path" ? "as-path (as-path filter): " + m.names.join(" ") : "community (community-list filter): " + m.names.join(" "));
const bgpSetText = (s) => (s.kind === "prepend" ? "as-path prepend " + s.value.join(" ")
  : s.kind === "community" ? "community " + s.value.join(" ") + (s.additive ? " additive" : "")
    : s.kind === "next-hop" ? "ip next-hop " + s.value : s.kind === "origin" ? "origin " + ORIGIN_NAME[s.value].toLowerCase() : s.kind + " " + s.value);

// ---- running-config ------------------------------------------------------------------------------
function bgpConfig(c) {
  const b = c.bgp;
  const pw = (p) => (c.pwEnc ? "7 " + type7(p) : p);
  const L = ["router bgp " + b.asn];
  if (b.rid !== null) L.push(" bgp router-id " + n2ip(b.rid));
  if (b.alwaysMed) L.push(" bgp always-compare-med");
  if (b.clusterId !== null) L.push(" bgp cluster-id " + n2ip(b.clusterId));
  if (b.defLp !== 100) L.push(" bgp default local-preference " + b.defLp);
  L.push(b.logChanges ? " bgp log-neighbor-changes" : " no bgp log-neighbor-changes");
  if (!b.v4default) L.push(" no bgp default ipv4-unicast");
  if (b.sync) L.push(" synchronization");
  if (b.timers) L.push(` timers bgp ${b.timers[0]} ${b.timers[1]}`);
  const nbrs = Object.entries(b.nbrs).sort(([x], [y]) => cmpAddr(x, y));
  // Per-family lines: what is announced, then each neighbor's family settings.
  const afHead = (af, ind) => {
    const conf = b.af[af], out = [];
    for (const nw of [...conf.networks].sort((x, y) => cmpAddr(splitPfx(x.pfx)[0], splitPfx(y.pfx)[0]) || splitPfx(x.pfx)[1] - splitPfx(y.pfx)[1])) {
      const [a, len] = splitPfx(nw.pfx);
      if (af === "ipv6") out.push(`${ind}network ${nw.pfx}${nw.rm ? " route-map " + nw.rm : ""}`);
      else {
        const classful = majorNet(ip2n(a)).len === len;
        out.push(`${ind}network ${a}${classful ? "" : " mask " + n2ip(lenMask(len))}${nw.rm ? " route-map " + nw.rm : ""}`);
      }
    }
    for (const ag of conf.aggs) {
      const [a, len] = splitPfx(ag.pfx);
      out.push(`${ind}aggregate-address ${af === "ipv6" ? ag.pfx : a + " " + n2ip(lenMask(len))}${ag.asSet ? " as-set" : ""}${ag.summaryOnly ? " summary-only" : ""}`);
    }
    for (const [src, rd] of Object.entries(conf.redist)) out.push(`${ind}redistribute ${src}${rd.id !== undefined ? " " + rd.id : ""}${rd.rm ? " route-map " + rd.rm : ""}`);
    if (af === "ipv4" && b.maxPaths > 1) out.push(`${ind}maximum-paths ${b.maxPaths}`);
    return out;
  };
  const afNbr = (af, ind, k, n, blocks) => {
    const a = n.af[af], out = [];
    if (blocks) {
      if (a.active) out.push(`${ind}neighbor ${k} activate`);
      else if (af === "ipv4" && b.v4default) out.push(`${ind}no neighbor ${k} activate`);
    }
    if (a.rrc) out.push(`${ind}neighbor ${k} route-reflector-client`);
    if (a.nhs) out.push(`${ind}neighbor ${k} next-hop-self`);
    if (a.sendComm) out.push(`${ind}neighbor ${k} send-community`);
    if (a.defOrig) out.push(`${ind}neighbor ${k} default-originate`);
    if (a.soft) out.push(`${ind}neighbor ${k} soft-reconfiguration inbound`);
    if (a.weight !== null) out.push(`${ind}neighbor ${k} weight ${a.weight}`);
    if (a.plIn) out.push(`${ind}neighbor ${k} prefix-list ${a.plIn} in`);
    if (a.plOut) out.push(`${ind}neighbor ${k} prefix-list ${a.plOut} out`);
    if (a.rmIn) out.push(`${ind}neighbor ${k} route-map ${a.rmIn} in`);
    if (a.rmOut) out.push(`${ind}neighbor ${k} route-map ${a.rmOut} out`);
    return out;
  };
  const blocks = !!b.af.ipv6 || !b.v4default;
  if (!blocks) L.push(...afHead("ipv4", " "));
  for (const [k, n] of nbrs) {
    L.push(` neighbor ${k} remote-as ${n.remoteAs}`);
    if (n.desc) L.push(` neighbor ${k} description ${n.desc}`);
    if (n.password) L.push(` neighbor ${k} password ${pw(n.password)}`);
    if (n.shutdown) L.push(` neighbor ${k} shutdown`);
    if (n.multihop) L.push(` neighbor ${k} ebgp-multihop ${n.multihop}`);
    if (n.noConnCheck) L.push(` neighbor ${k} disable-connected-check`);
    if (n.updateSource) L.push(` neighbor ${k} update-source ${n.updateSource}`);
    if (!blocks) L.push(...afNbr("ipv4", " ", k, n, false));
  }
  if (blocks) {
    for (const af of BGP_AFS) {
      if (!b.af[af]) continue;
      L.push(" !", ` address-family ${af}`, ...afHead(af, "  "));
      for (const [k, n] of nbrs) L.push(...afNbr(af, "  ", k, n, true));
      L.push(" exit-address-family");
    }
  }
  return L;
}

function bgpPolicyConfig(c) {
  const L = [];
  const asl = Object.entries(c.asPathLists || {});
  for (const [n, list] of asl) for (const e of list) L.push(`ip as-path access-list ${n} ${e.action} ${e.re}`);
  if (asl.length) L.push("!");
  const pls = Object.entries(c.prefixLists || {});
  for (const [n, pl] of pls) {
    if (pl.desc) L.push(`ip prefix-list ${n} description ${pl.desc}`);
    for (const e of [...pl.entries].sort((a, b) => a.seq - b.seq)) L.push(`ip prefix-list ${n} seq ${e.seq} ${e.action} ${e.pfx}${e.ge !== null ? " ge " + e.ge : ""}${e.le !== null ? " le " + e.le : ""}`);
  }
  if (pls.length) L.push("!");
  for (const [n, entries] of Object.entries(c.routeMaps || {})) {
    for (const e of [...entries].sort((a, b) => a.seq - b.seq)) {
      L.push(`route-map ${n} ${e.action} ${e.seq}`);
      if (e.desc) L.push(" description " + e.desc);
      for (const m of e.match) {
        L.push(" match " + (m.kind === "prefix-list" ? "ip address prefix-list " : m.kind === "acl" ? "ip address " : m.kind === "as-path" ? "as-path " : "community ") + m.names.join(" "));
      }
      for (const s of e.set) {
        L.push(" set " + (s.kind === "prepend" ? "as-path prepend " + s.value.join(" ") : s.kind === "community" ? "community " + s.value.join(" ") + (s.additive ? " additive" : "")
          : s.kind === "next-hop" ? "ip next-hop " + s.value : s.kind === "origin" ? "origin " + (s.value === "i" ? "igp" : "incomplete") : s.kind + " " + s.value));
      }
      L.push("!");
    }
  }
  return L;
}

// ---- the grammar ------------------------------------------------------------------------------------
PARAMS.pfx4 = { fmt: "A.B.C.D/nn", help: "IP prefix <network>/<length>, e.g., 35.0.0.0/8", match: (t, k) => {
  const m = /^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/.exec(t[k].t);
  return m && isIp(m[1]) && +m[2] <= 32 ? { used: 1, value: pfx4(and(ip2n(m[1]), lenMask(+m[2])), +m[2]) } : null;
} };
PARAMS.asn = { fmt: "<1-4294967295>", help: "AS number", match: (t, k) => {
  const v = t[k].t, m = /^(\d+)(?:\.(\d+))?$/.exec(v);
  if (!m) return null;
  const n = m[2] !== undefined ? +m[1] * 65536 + +m[2] : +m[1];
  return n >= 1 && n <= 4294967295 ? { used: 1, value: n } : null;
} };
PARAMS.community = { fmt: "<1-4294967295>", help: "community number", match: (t, k) => {
  const v = t[k].t;
  if (/^\d+:\d+$/.test(v)) { const [a, b] = v.split(":").map(Number); return a <= 65535 && b <= 65535 ? { used: 1, value: v } : null; }
  if (/^\d+$/.test(v) && +v <= 4294967295) return { used: 1, value: `${Math.floor(+v / 65536)}:${+v % 65536}` };
  return ["internet", "no-export", "no-advertise", "local-as"].includes(v.toLowerCase()) ? null : null;
} };

// Add help without overwriting text other commands already use.
const helpAdd = (dict, entries) => { for (const [k, v] of Object.entries(entries)) if (!(k in dict)) dict[k] = v; };
helpAdd(HELP, {
  bgp: "Border Gateway Protocol (BGP)", "remote-as": "Specify a BGP neighbor", "update-source": "Source of routing updates",
  "ebgp-multihop": "Allow EBGP neighbors not on directly connected networks. For single-hop ebgp peers, delete ebgp-multihop then use disable-connected-check.",
  "next-hop-self": "Disable the next hop calculation for this neighbor", "route-reflector-client": "Configure a neighbor as Route Reflector client",
  "send-community": "Send Community attribute to this neighbor", "default-originate": "Originate default route to this neighbor",
  "soft-reconfiguration": "Per neighbor soft reconfiguration", inbound: "Allow inbound soft reconfiguration for this neighbor",
  "disable-connected-check": "one-hop away EBGP peer using loopback address", activate: "Enable the Address Family for this Neighbor",
  "aggregate-address": "Configure BGP aggregate entries", "summary-only": "Filter more specific routes from updates",
  "as-set": "Generate AS set path information", "address-family": "Enter Address Family command mode",
  "exit-address-family": "Exit from Address Family configuration mode", "always-compare-med": "Allow comparing MED from different neighbors",
  "log-neighbor-changes": "Log neighbor up/down and reset reason", "cluster-id": "Configure Route-Reflector Cluster-id",
  "local-preference": "BGP local preference attribute", synchronization: "Perform IGP synchronization",
  "maximum-paths": "Forward packets over multiple paths", "route-map": "Route map tag", "prefix-list": "Build a prefix list",
  "as-path": "BGP AS path list", prepend: "Prepend to the as-path", community: "BGP community attribute",
  additive: "Add to the existing community", "no-export": "Do not export to next AS (well-known community)",
  "no-advertise": "Do not advertise to any peer (well-known community)", internet: "Internet (well-known community)",
  weight: "BGP weight for routing table", origin: "BGP origin code", igp: "local IGP", incomplete: "unknown heritage",
  ge: "Minimum prefix length to be matched", le: "Maximum prefix length to be matched", seq: "sequence number of an entry",
  summary: "Summary of BGP neighbor status", "advertised-routes": "Display the routes advertised to a BGP neighbor",
  "received-routes": "Display the received routes from neighbor", routes: "Display routes learned from neighbor",
  soft: "Soft reconfig", unicast: "Address Family modifier", "*": "Clear all peers",
  description: "Neighbor specific description", password: "Set a password", ipv4: "Address family",
});
helpAdd(HELP_PATH, {
  "router bgp": "Border Gateway Protocol (BGP)", "show ip bgp": "BGP information", "show bgp": "BGP information",
  "clear ip bgp": "Clear BGP connections", "debug ip bgp": "BGP information", "undebug ip bgp": "BGP information",
  "ip bgp": "BGP information", "show ip route bgp": "Border Gateway Protocol (BGP)", "show ipv6 route bgp": "Border Gateway Protocol (BGP)",
  "neighbor activate": "Enable the Address Family for this Neighbor", "neighbor weight": "Set default weight for routes from this neighbor",
  "neighbor route-map": "Apply route map to neighbor", "neighbor prefix-list": "Filter updates to/from this neighbor",
  "neighbor description": "Neighbor specific description", "neighbor password": "Set a password",
  "neighbor shutdown": "Administratively shut down this neighbor", "bgp router-id": "Override configured router identifier (peers will reset)",
  "bgp default": "Configure BGP defaults", "default local-preference": "local preference (higher=more preferred)",
  "default ipv4-unicast": "Activate ipv4-unicast for a peer by default", "bgp bestpath": "Change the default bestpath selection",
  "match ip": "IP specific information", "match ip address": "Match address of route or match packet",
  "address prefix-list": "Match entries of prefix-lists", "match as-path": "Match BGP AS path list", "match community": "Match BGP community list",
  "set as-path": "Prepend string for a BGP AS-path attribute", "set ip": "IP specific information", "ip next-hop": "Next hop address",
  "set community": "BGP community attribute", "set metric": "Metric value for destination routing protocol",
  "set weight": "BGP weight for routing table", "set local-preference": "BGP local preference path attribute",
  "set origin": "BGP origin code", "ip prefix-list": "Build a prefix list", "ip as-path": "BGP autonomous system path filter",
  "as-path access-list": "Specify an access list name", "route-map in": "Apply map to incoming routes",
  "route-map out": "Apply map to outbound routes", "prefix-list in": "Filter incoming updates", "prefix-list out": "Filter outgoing updates",
  "soft in": "Send route-refresh", "soft out": "Resend all outbound updates", "bgp ipv6": "Address family", "bgp ipv4": "Address family",
  "redistribute connected": "Connected", "redistribute ospf": "Open Shortest Path First (OSPF)",
  "redistribute eigrp": "Enhanced Interior Gateway Routing Protocol (EIGRP)", "network mask": "Network mask",
  "neighbor update-source": "Source of routing updates", "neighbor remote-as": "Specify a BGP neighbor",
  "show route-map": "route-map information", "show ip prefix-list": "List IP prefix lists", "show ip as-path-access-list": "List AS path access lists",
  "prefix-list description": "Prefix-list specific description", "route-map description": "Route-map comment",
  "timers bgp": "BGP timers", "debug ip bgp updates": "BGP updates", "neighbors advertised-routes": "Display the routes advertised to a BGP neighbor",
  "neighbors received-routes": "Display the received routes from neighbor", "neighbors routes": "Display routes learned from neighbor",
  "unicast summary": "Summary of BGP neighbor status", "unicast neighbors": "Detailed information on TCP and BGP neighbor connections",
  "send-community standard": "Send Standard Community attributes", "send-community both": "Send Standard and Extended Community attributes",
  "undebug ip bgp updates": "BGP updates", "address-family ipv6": "Address family", "soft in": "Soft reconfig inbound update",
  "soft out": "Soft reconfig outbound update", "route-map permit": "Route map permits set operations",
  "route-map deny": "Route map denies set operations", "network route-map": "Route-map to modify the attributes",
  "mask route-map": "Route-map to modify the attributes", "connected route-map": "Route map reference",
  "static route-map": "Route map reference", "ospf route-map": "Route map reference", "eigrp route-map": "Route map reference",
});
HELP_MODE.bgp = { network: "Specify a network to announce via BGP", neighbor: "Specify a neighbor router", redistribute: "Redistribute information from another routing protocol",
  timers: "Adjust routing timers", bgp: "BGP specific commands", "no bgp": "BGP specific commands" };
HELP_MODE.bgpaf = { network: "Specify a network to announce via BGP", neighbor: "Specify a neighbor router", redistribute: "Redistribute information from another routing protocol" };
HELP_MODE.rmap = { match: "Match values from routing table", set: "Set values in destination routing protocol", description: "Route-map comment" };
HELP_MODE.priv = { ...(HELP_MODE.priv || {}), "show ip bgp neighbors": "Detailed information on TCP and BGP neighbor connections",
  "show ip bgp summary": "Summary of BGP neighbor status" };
HELP_MODE.user = { ...(HELP_MODE.user || {}), "show ip bgp neighbors": "Detailed information on TCP and BGP neighbor connections",
  "show ip bgp summary": "Summary of BGP neighbor status" };

const ASN = "<asn|AS number>";
const bgpOf = (c) => c.cfg.bgp;
const bgpAfOf = (c) => (c.mode === "bgpaf" ? c.target : "ipv4");
const nbrKey = (v) => (typeof v === "string" && v.includes(":") ? fmt6(parse6(v)) : typeof v === "number" ? n2ip(v) : v);

def("R", "config", `router bgp ${ASN}`, (c, [asn]) => {
  const b = c.cfg.bgp;
  if (b && b.asn !== asn) { c.print(`BGP is already running; AS is ${b.asn}`); return; }
  if (!b) c.cfg.bgp = newBgp(asn);
  c.s.enter("bgp", null);
});
def("R", "config", `no router bgp ${ASN}`, (c, [asn]) => {
  if (!c.cfg.bgp || c.cfg.bgp.asn !== asn) { c.print("% No BGP process configured"); return; }
  c.cfg.bgp = null;
});

// Session-level settings live under router bgp itself.
const nbrNeedAs = (c, key, fn) => {
  const n = bgpOf(c).nbrs[key];
  if (!n) { c.print("% Specify remote-as or peer-group commands first"); return; }
  fn(n);
};
for (const P of ["<ip|Neighbor address>", "<ip6|Neighbor IPv6 address>"]) {
  def("R", "bgp", `neighbor ${P} remote-as ${ASN}`, (c, [a, asn]) => {
    const b = bgpOf(c), k = nbrKey(a);
    if (isV6Key(k) ? c.net.owns6(c.d.name, parse6(k)) : c.net.ownsIp(c.d.name, ip2n(k))) { c.print("% Cannot configure the local system as neighbor"); return; }
    if (b.nbrs[k]) b.nbrs[k].remoteAs = asn;
    else b.nbrs[k] = newBgpNbr(asn, b.v4default);
  });
  def("R", "bgp", `no neighbor ${P}`, (c, [a]) => { delete bgpOf(c).nbrs[nbrKey(a)]; });
  def("R", "bgp", `no neighbor ${P} remote-as ${ASN}`, (c, [a]) => { delete bgpOf(c).nbrs[nbrKey(a)]; });
  def("R", "bgp", `neighbor ${P} description <line|Up to 80 characters describing this neighbor>`, (c, [a, d]) => nbrNeedAs(c, nbrKey(a), (n) => { n.desc = d; }));
  def("R", "bgp", `no neighbor ${P} description`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.desc = null; }));
  def("R", "bgp", `neighbor ${P} password <line|The password>`, (c, [a, p]) => nbrNeedAs(c, nbrKey(a), (n) => { n.password = p.replace(/^7\s+(\S+)$/, (m, e) => type7decode(e)); }));
  def("R", "bgp", `no neighbor ${P} password`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.password = null; }));
  def("R", "bgp", `neighbor ${P} shutdown`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.shutdown = true; }));
  def("R", "bgp", `no neighbor ${P} shutdown`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.shutdown = false; }));
  def("R", "bgp", `neighbor ${P} ebgp-multihop`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.multihop = 255; }));
  def("R", "bgp", `neighbor ${P} ebgp-multihop <num:1-255|maximum hop count>`, (c, [a, h]) => nbrNeedAs(c, nbrKey(a), (n) => { n.multihop = h === 1 ? null : h; }));
  def("R", "bgp", `no neighbor ${P} ebgp-multihop`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.multihop = null; }));
  def("R", "bgp", `neighbor ${P} disable-connected-check`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.noConnCheck = true; }));
  def("R", "bgp", `no neighbor ${P} disable-connected-check`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.noConnCheck = false; }));
  def("R", "bgp", `neighbor ${P} update-source <intf>`, (c, [a, i]) => c.s.withIf(i, 3, (ifn) => nbrNeedAs(c, nbrKey(a), (n) => { n.updateSource = ifn; })));
  def("R", "bgp", `no neighbor ${P} update-source`, (c, [a]) => nbrNeedAs(c, nbrKey(a), (n) => { n.updateSource = null; }));
  // Address-family settings: under router bgp they apply to IPv4 unicast.
  for (const m of ["bgp", "bgpaf"]) {
    const af = (c, a, fn) => nbrNeedAs(c, nbrKey(a), (n) => fn(n.af[bgpAfOf(c)]));
    def("R", m, `neighbor ${P} activate`, (c, [a]) => af(c, a, (x) => { x.active = true; }));
    def("R", m, `no neighbor ${P} activate`, (c, [a]) => af(c, a, (x) => { x.active = false; }));
    for (const [word, key] of [["next-hop-self", "nhs"], ["route-reflector-client", "rrc"], ["send-community", "sendComm"], ["default-originate", "defOrig"]]) {
      def("R", m, `neighbor ${P} ${word}`, (c, [a]) => af(c, a, (x) => { x[key] = true; }));
      def("R", m, `no neighbor ${P} ${word}`, (c, [a]) => af(c, a, (x) => { x[key] = false; }));
    }
    def("R", m, `neighbor ${P} send-community {standard|both}`, (c, [a]) => af(c, a, (x) => { x.sendComm = true; }));
    def("R", m, `neighbor ${P} soft-reconfiguration inbound`, (c, [a]) => af(c, a, (x) => { x.soft = true; }));
    def("R", m, `no neighbor ${P} soft-reconfiguration inbound`, (c, [a]) => af(c, a, (x) => { x.soft = false; }));
    def("R", m, `neighbor ${P} weight <num:0-65535|default weight>`, (c, [a, w]) => af(c, a, (x) => { x.weight = w; }));
    def("R", m, `no neighbor ${P} weight`, (c, [a]) => af(c, a, (x) => { x.weight = null; }));
    def("R", m, `neighbor ${P} route-map <word|Name of route map> {in|out}`, (c, [a, rm, dir]) => af(c, a, (x) => { x[dir === "in" ? "rmIn" : "rmOut"] = rm; }));
    def("R", m, `no neighbor ${P} route-map <word|Name of route map> {in|out}`, (c, [a, , dir]) => af(c, a, (x) => { x[dir === "in" ? "rmIn" : "rmOut"] = null; }));
    def("R", m, `neighbor ${P} prefix-list <word|Name of a prefix list> {in|out}`, (c, [a, pl, dir]) => af(c, a, (x) => { x[dir === "in" ? "plIn" : "plOut"] = pl; }));
    def("R", m, `no neighbor ${P} prefix-list <word|Name of a prefix list> {in|out}`, (c, [a, , dir]) => af(c, a, (x) => { x[dir === "in" ? "plIn" : "plOut"] = null; }));
  }
}

// What gets announced: network statements, aggregates and redistribution, per address family.
const bgpAfConf = (c) => {
  const b = bgpOf(c), af = bgpAfOf(c);
  if (!b.af[af]) b.af[af] = newBgpAf();
  return b.af[af];
};
const addNet = (c, pfx, rm) => {
  const conf = bgpAfConf(c), nw = conf.networks.find((x) => x.pfx === pfx);
  if (nw) nw.rm = rm; else conf.networks.push({ pfx, rm });
};
const delNet = (c, pfx) => { const conf = bgpAfConf(c); conf.networks = conf.networks.filter((x) => x.pfx !== pfx); };
const v4Net = (c, a, m) => {
  if (m === null) { const mj = majorNet(a); return pfx4(mj.net, mj.len); }
  if (maskLen(m) < 0) { c.print("% Invalid mask"); return null; }
  return pfx4(and(a, m), maskLen(m));
};
for (const m of ["bgp", "bgpaf"]) {
  const v4 = (c) => bgpAfOf(c) === "ipv4";
  const only4 = (c, fn) => (v4(c) ? fn() : c.print("% Invalid input detected for this address family"));
  const only6 = (c, fn) => (!v4(c) ? fn() : c.print("% Invalid input detected for this address family"));
  def("R", m, "network <ip|Network number>", (c, [a]) => only4(c, () => { const k = v4Net(c, a, null); if (k) addNet(c, k, null); }));
  def("R", m, "network <ip|Network number> mask <ip|Network mask>", (c, [a, mk]) => only4(c, () => { const k = v4Net(c, a, mk); if (k) addNet(c, k, null); }));
  def("R", m, "network <ip|Network number> mask <ip|Network mask> route-map <word|Route-map name>", (c, [a, mk, rm]) => only4(c, () => { const k = v4Net(c, a, mk); if (k) addNet(c, k, rm); }));
  def("R", m, "network <ip|Network number> route-map <word|Route-map name>", (c, [a, rm]) => only4(c, () => { const k = v4Net(c, a, null); if (k) addNet(c, k, rm); }));
  def("R", m, "no network <ip|Network number>", (c, [a]) => only4(c, () => { const k = v4Net(c, a, null); if (k) delNet(c, k); }));
  def("R", m, "no network <ip|Network number> mask <ip|Network mask>", (c, [a, mk]) => only4(c, () => { const k = v4Net(c, a, mk); if (k) delNet(c, k); }));
  def("R", m, "network <ip6pfx>", (c, [p]) => only6(c, () => addNet(c, pfx6(p.a, p.len), null)));
  def("R", m, "network <ip6pfx> route-map <word|Route-map name>", (c, [p, rm]) => only6(c, () => addNet(c, pfx6(p.a, p.len), rm)));
  def("R", m, "no network <ip6pfx>", (c, [p]) => only6(c, () => delNet(c, pfx6(p.a, p.len))));
  const agg = (c, k, opts) => {
    const conf = bgpAfConf(c);
    conf.aggs = conf.aggs.filter((x) => x.pfx !== k);
    conf.aggs.push({ pfx: k, summaryOnly: opts.includes("summary-only"), asSet: opts.includes("as-set") });
  };
  const AGG = ["", " summary-only", " as-set", " summary-only as-set", " as-set summary-only"];
  for (const tail of AGG) {
    def("R", m, `aggregate-address <ip|Aggregate address> <ip|Aggregate mask>${tail}`, (c, [a, mk]) => only4(c, () => agg(c, pfx4(and(a, mk), maskLen(mk)), tail)));
    def("R", m, `aggregate-address <ip6pfx>${tail}`, (c, [p]) => only6(c, () => agg(c, pfx6(p.a, p.len), tail)));
  }
  def("R", m, "no aggregate-address <ip|Aggregate address> <ip|Aggregate mask>", (c, [a, mk]) => { const conf = bgpAfConf(c), k = pfx4(and(a, mk), maskLen(mk)); conf.aggs = conf.aggs.filter((x) => x.pfx !== k); });
  def("R", m, "no aggregate-address <ip6pfx>", (c, [p]) => { const conf = bgpAfConf(c), k = pfx6(p.a, p.len); conf.aggs = conf.aggs.filter((x) => x.pfx !== k); });
  for (const src of ["connected", "static"]) {
    def("R", m, `redistribute ${src}`, (c) => { bgpAfConf(c).redist[src] = { rm: null }; });
    def("R", m, `redistribute ${src} route-map <word|Pointer to route-map entries>`, (c, [rm]) => { bgpAfConf(c).redist[src] = { rm }; });
    def("R", m, `no redistribute ${src}`, (c) => { delete bgpAfConf(c).redist[src]; });
  }
  def("R", m, "redistribute ospf <num:1-65535|Process ID>", (c, [id]) => { bgpAfConf(c).redist.ospf = { id, rm: null }; });
  def("R", m, "redistribute ospf <num:1-65535|Process ID> route-map <word|Pointer to route-map entries>", (c, [id, rm]) => { bgpAfConf(c).redist.ospf = { id, rm }; });
  def("R", m, "no redistribute ospf <num:1-65535|Process ID>", (c) => { delete bgpAfConf(c).redist.ospf; });
  def("R", m, "redistribute eigrp <num:1-65535|Autonomous system number>", (c, [id]) => { bgpAfConf(c).redist.eigrp = { id, rm: null }; });
  def("R", m, "redistribute eigrp <num:1-65535|Autonomous system number> route-map <word|Pointer to route-map entries>", (c, [id, rm]) => { bgpAfConf(c).redist.eigrp = { id, rm }; });
  def("R", m, "no redistribute eigrp <num:1-65535|Autonomous system number>", (c) => { delete bgpAfConf(c).redist.eigrp; });
  def("R", m, "maximum-paths <num:1-32|Number of paths>", (c, [n]) => { bgpOf(c).maxPaths = n; });
  def("R", m, "no maximum-paths", (c) => { bgpOf(c).maxPaths = 1; });
}

def("R", "bgp", "bgp router-id <ip|Manually configured router identifier>", (c, [r]) => { bgpOf(c).rid = r; });
def("R", "bgp", "no bgp router-id", (c) => { bgpOf(c).rid = null; });
def("R", "bgp", "bgp log-neighbor-changes", (c) => { bgpOf(c).logChanges = true; });
def("R", "bgp", "no bgp log-neighbor-changes", (c) => { bgpOf(c).logChanges = false; });
def("R", "bgp", "bgp default ipv4-unicast", (c) => { bgpOf(c).v4default = true; });
def("R", "bgp", "no bgp default ipv4-unicast", (c) => { bgpOf(c).v4default = false; });
def("R", "bgp", "bgp default local-preference <num:0-4294967295|Configure default local preference value>", (c, [v]) => { bgpOf(c).defLp = v; });
def("R", "bgp", "no bgp default local-preference", (c) => { bgpOf(c).defLp = 100; });
def("R", "bgp", "bgp cluster-id <ip|Route-Reflector Cluster-id in IP address format>", (c, [v]) => { bgpOf(c).clusterId = v; });
def("R", "bgp", "no bgp cluster-id", (c) => { bgpOf(c).clusterId = null; });
def("R", "bgp", "bgp always-compare-med", (c) => { bgpOf(c).alwaysMed = true; });
def("R", "bgp", "no bgp always-compare-med", (c) => { bgpOf(c).alwaysMed = false; });
def("R", "bgp", "synchronization", (c) => { bgpOf(c).sync = true; });
def("R", "bgp", "no synchronization", (c) => { bgpOf(c).sync = false; });
def("R", "bgp", "timers bgp <num:0-65535|Keepalive interval> <num:0-65535|Holdtime>", (c, [k, h]) => {
  if (h !== 0 && h < 3) { c.print("% Holdtime must be 0 or greater than or equal to 3 seconds"); return; }
  bgpOf(c).timers = k === 60 && h === 180 ? null : [k, h];
});
def("R", "bgp", "no timers bgp", (c) => { bgpOf(c).timers = null; });
def("R", "bgp", "address-family ipv4", (c) => c.s.enter("bgpaf", "ipv4"));
def("R", "bgp", "address-family ipv4 unicast", (c) => c.s.enter("bgpaf", "ipv4"));
def("R", "bgp", "address-family ipv6", (c) => { if (!bgpOf(c).af.ipv6) bgpOf(c).af.ipv6 = newBgpAf(); c.s.enter("bgpaf", "ipv6"); });
def("R", "bgp", "address-family ipv6 unicast", (c) => { if (!bgpOf(c).af.ipv6) bgpOf(c).af.ipv6 = newBgpAf(); c.s.enter("bgpaf", "ipv6"); });
def("R", "bgp", "no address-family ipv6", (c) => { const b = bgpOf(c); b.af.ipv6 = null; for (const n of Object.values(b.nbrs)) n.af.ipv6 = newNbrAf(false); });
def("R", "bgpaf", "exit-address-family", (c) => c.s.enter("bgp", null));

// ---- policy commands --------------------------------------------------------------------------
const PL = "<word|Name of a prefix list>";
const plAdd = (c, name, seq, action, pfx, ge, le) => {
  const [, len] = splitPfx(pfx);
  if ((ge !== null && ge <= len) || (le !== null && le < len) || (ge !== null && le !== null && le < ge)) {
    c.print("% Invalid prefix range for " + pfx + ", make sure: len < ge-value <= le-value");
    return;
  }
  const lists = bgpPolicyLists(c.cfg);
  const pl = lists[name] = lists[name] || { desc: null, entries: [] };
  if (seq === null) seq = (pl.entries.reduce((m, e) => Math.max(m, e.seq), 0) || 0) + 5;
  pl.entries = pl.entries.filter((e) => e.seq !== seq && !(e.pfx === pfx && e.action === action && e.ge === ge && e.le === le));
  pl.entries.push({ seq, action, pfx, ge, le });
};
for (const head of ["", " seq <num:1-4294967294|Sequence number>"]) {
  for (const tail of ["", " ge <num:1-32|Minimum prefix length to be matched>", " le <num:1-32|Maximum prefix length to be matched>",
    " ge <num:1-32|Minimum prefix length to be matched> le <num:1-32|Maximum prefix length to be matched>"]) {
    def("R", "config", `ip prefix-list ${PL}${head} {permit|deny} <pfx4>${tail}`, (c, args) => {
      const [name, ...rest] = args;
      const seq = head ? rest.shift() : null, action = rest.shift(), pfx = rest.shift();
      let ge = null, le = null;
      if (tail.includes(" ge ")) ge = rest.shift();
      if (tail.includes(" le ")) le = rest.shift();
      plAdd(c, name, seq, action, pfx, ge, le);
    });
  }
}
def("R", "config", `ip prefix-list ${PL} description <line|Up to 80 characters describing this prefix-list>`, (c, [n, d]) => {
  const lists = bgpPolicyLists(c.cfg);
  (lists[n] = lists[n] || { desc: null, entries: [] }).desc = d;
});
def("R", "config", `no ip prefix-list ${PL}`, (c, [n]) => { delete bgpPolicyLists(c.cfg)[n]; });
def("R", "config", `no ip prefix-list ${PL} seq <num:1-4294967294|Sequence number>`, (c, [n, s]) => {
  const pl = bgpPolicyLists(c.cfg)[n];
  if (pl) { pl.entries = pl.entries.filter((e) => e.seq !== s); if (!pl.entries.length && !pl.desc) delete bgpPolicyLists(c.cfg)[n]; }
});
def("R", "config", "ip as-path access-list <num:1-500|Regular expression access list number> {permit|deny} <line|A regular-expression to match BGP AS paths. Use \"ctrl-v ?\" to enter \"?\">", (c, [n, action, re]) => {
  if (!bgpPolicyAsRegex(re)) { c.print("% Invalid regular expression"); return; }
  const l = bgpPolicyAsLists(c.cfg);
  (l[n] = l[n] || []).push({ action, re });
});
def("R", "config", "no ip as-path access-list <num:1-500|Regular expression access list number>", (c, [n]) => { delete bgpPolicyAsLists(c.cfg)[n]; });

const RM = "<word|Route map tag>";
const rmEnter = (c, name, action, seq) => {
  const maps = bgpPolicyMaps(c.cfg), list = maps[name] = maps[name] || [];
  let e = list.find((x) => x.seq === seq);
  if (!e) { e = { seq, action, desc: null, match: [], set: [] }; list.push(e); }
  else e.action = action;
  c.s.enter("rmap", { name, seq });
};
def("R", "config", `route-map ${RM}`, (c, [n]) => rmEnter(c, n, "permit", 10));
def("R", "config", `route-map ${RM} {permit|deny}`, (c, [n, a]) => rmEnter(c, n, a, 10));
def("R", "config", `route-map ${RM} {permit|deny} <num:0-65535|Sequence to insert to/delete from existing route-map entry>`, (c, [n, a, s]) => rmEnter(c, n, a, s));
def("R", "config", `no route-map ${RM}`, (c, [n]) => { delete bgpPolicyMaps(c.cfg)[n]; });
def("R", "config", `no route-map ${RM} {permit|deny} <num:0-65535|Sequence to insert to/delete from existing route-map entry>`, (c, [n, , s]) => {
  const maps = bgpPolicyMaps(c.cfg);
  if (!maps[n]) return;
  maps[n] = maps[n].filter((e) => e.seq !== s);
  if (!maps[n].length) delete maps[n];
});
const rmEntry = (c) => bgpPolicyMaps(c.cfg)[c.target.name].find((e) => e.seq === c.target.seq);
const rmMatch = (c, kind, names) => {
  const e = rmEntry(c), m = e.match.find((x) => x.kind === kind);
  if (m) m.names = [...new Set([...m.names, ...names])]; else e.match.push({ kind, names });
};
const rmNoMatch = (c, kind) => { const e = rmEntry(c); e.match = e.match.filter((x) => x.kind !== kind); };
const rmSet = (c, kind, value, extra = {}) => {
  const e = rmEntry(c);
  e.set = e.set.filter((x) => x.kind !== kind);
  e.set.push({ kind, value, ...extra });
};
const rmNoSet = (c, kind) => { const e = rmEntry(c); e.set = e.set.filter((x) => x.kind !== kind); };
def("R", "rmap", "match ip address prefix-list <line|IP prefix-list name>", (c, [l]) => rmMatch(c, "prefix-list", l.split(/\s+/)));
def("R", "rmap", "no match ip address prefix-list", (c) => rmNoMatch(c, "prefix-list"));
def("R", "rmap", "match ip address <line|IP access-list number or name>", (c, [l]) => rmMatch(c, "acl", l.split(/\s+/)));
def("R", "rmap", "no match ip address", (c) => rmNoMatch(c, "acl"));
def("R", "rmap", "match as-path <line|AS path access-list>", (c, [l]) => rmMatch(c, "as-path", l.split(/\s+/)));
def("R", "rmap", "no match as-path", (c) => rmNoMatch(c, "as-path"));
def("R", "rmap", "match community <line|Community-list number or name>", (c, [l]) => rmMatch(c, "community", l.split(/\s+/)));
def("R", "rmap", "no match community", (c) => rmNoMatch(c, "community"));
def("R", "rmap", "set weight <num:0-65535|Weight value>", (c, [v]) => rmSet(c, "weight", v));
def("R", "rmap", "no set weight", (c) => rmNoSet(c, "weight"));
def("R", "rmap", "set local-preference <num:0-4294967295|Preference value>", (c, [v]) => rmSet(c, "local-preference", v));
def("R", "rmap", "no set local-preference", (c) => rmNoSet(c, "local-preference"));
def("R", "rmap", "set metric <num:0-4294967295|Metric value or Bandwidth in Kbits per second>", (c, [v]) => rmSet(c, "metric", v));
def("R", "rmap", "no set metric", (c) => rmNoSet(c, "metric"));
def("R", "rmap", "set origin {igp|incomplete}", (c, [v]) => rmSet(c, "origin", v === "igp" ? "i" : "?"));
def("R", "rmap", "no set origin", (c) => rmNoSet(c, "origin"));
def("R", "rmap", "set ip next-hop <ip|IP address of next hop>", (c, [v]) => rmSet(c, "next-hop", n2ip(v)));
def("R", "rmap", "no set ip next-hop", (c) => rmNoSet(c, "next-hop"));
def("R", "rmap", "set as-path prepend <line|AS number>", (c, [l]) => {
  const v = l.split(/\s+/).map(Number);
  if (v.some((x) => !Number.isInteger(x) || x < 1 || x > 4294967295)) { c.print("% Invalid AS number"); return; }
  rmSet(c, "prepend", v);
});
def("R", "rmap", "no set as-path prepend", (c) => rmNoSet(c, "prepend"));
def("R", "rmap", "set community <line|community number in aa:nn format, no-export, no-advertise, internet or additive>", (c, [l]) => {
  const words = l.split(/\s+/), additive = words.includes("additive");
  const vals = [];
  for (const w of words.filter((x) => x !== "additive")) {
    const wl = w.toLowerCase();
    if (["no-export", "no-advertise", "internet", "local-as"].includes(wl)) { vals.push(wl); continue; }
    const m = PARAMS.community.match([{ t: w }], 0);
    if (!m) { c.print("% Invalid community value " + w); return; }
    vals.push(m.value);
  }
  rmSet(c, "community", vals, { additive });
});
def("R", "rmap", "no set community", (c) => rmNoSet(c, "community"));
def("R", "rmap", "description <line|Comment, up to 100 characters>", (c, [d]) => { rmEntry(c).desc = d; });
def("R", "rmap", "no description", (c) => { rmEntry(c).desc = null; });

// ---- exec: show, clear, debug ------------------------------------------------------------------
const bgpShow = (c, fn) => {
  if (!c.cfg.bgp) { c.print("% BGP not active"); return; }
  c.print(fn());
};
const findKey = (c, v) => { const k = nbrKey(v); return c.cfg.bgp && c.cfg.bgp.nbrs[k] ? k : null; };
for (const [pre, af] of [["show ip bgp", "ipv4"], ["show bgp ipv4 unicast", "ipv4"], ["show bgp ipv6 unicast", "ipv6"]]) {
  def("R", both, pre, (c) => bgpShow(c, () => showBgpTable(c.net, c.d.name, af)));
  def("R", both, pre + " summary", (c) => bgpShow(c, () => showBgpSummary(c.net, c.d.name, af)));
  def("R", both, pre + " neighbors", (c) => bgpShow(c, () => Object.keys(c.cfg.bgp.nbrs).filter((k) => c.cfg.bgp.nbrs[k].af[af].active)
    .map((k) => showBgpNeighbor(c.net, c.d.name, k)).join("\n\n")));
  for (const P of ["<ip|Neighbor to display information about>", "<ip6|IPv6 neighbor to display information about>"]) {
    def("R", both, `${pre} neighbors ${P}`, (c, [a]) => bgpShow(c, () => {
      const k = findKey(c, a);
      return k ? showBgpNeighbor(c.net, c.d.name, k) : "% No such neighbor or address family";
    }));
    def("R", both, `${pre} neighbors ${P} advertised-routes`, (c, [a]) => bgpShow(c, () => {
      const k = findKey(c, a), r = c.net.bgp()[c.d.name];
      if (!k) return "% No such neighbor or address family";
      const s = r.nbrs[k];
      if (!s.up) return "";
      const peerSaw = c.net.bgp()[s.peer].nbrs[s.peerKey].raw[af];
      const L = [`BGP table version is ${bgpVersion(r)}, local router ID is ${n2ip(r.rid)}`, BGP_STATUS, "",
        "     Network          Next Hop            Metric LocPrf Weight Path"];
      for (const p of peerSaw) {
        const mine = (r.tables[af][p.pfx] || []).find((x) => x.best) || p;
        L.push(...bgpRows(c.net, c.d.name, af, (x) => x === mine).filter(() => true).slice(0, 1));
      }
      L.push("", `Total number of prefixes ${peerSaw.length} `);
      return peerSaw.length ? L.join("\n") : "";
    }));
    def("R", both, `${pre} neighbors ${P} {routes|received-routes}`, (c, [a, which]) => bgpShow(c, () => {
      const k = findKey(c, a), r = c.net.bgp()[c.d.name];
      if (!k) return "% No such neighbor or address family";
      if (which === "received-routes" && !c.cfg.bgp.nbrs[k].af[af].soft) return `% Inbound soft reconfiguration not enabled on ${k}`;
      const s = r.nbrs[k];
      const keep = which === "routes" ? new Set(s.adjIn[af]) : null;
      const L = [`BGP table version is ${bgpVersion(r)}, local router ID is ${n2ip(r.rid)}`, BGP_STATUS, "",
        "     Network          Next Hop            Metric LocPrf Weight Path"];
      if (which === "routes") L.push(...bgpRows(c.net, c.d.name, af, (p) => keep.has(p)));
      else for (const p of s.raw[af]) L.push(` *   ${pad(p.pfx, 17)}${pad(p.nh, 20)}${lpad(p.med ?? "", 6)} ${lpad(s.ebgp ? "" : p.lp ?? "", 6)} ${lpad(0, 6)} ${asPathStr(p)} ${p.origin}`.trimEnd());
      const n = which === "routes" ? s.adjIn[af].length : s.raw[af].length;
      L.push("", `Total number of prefixes ${n} `);
      return n ? L.join("\n") : "";
    }));
  }
}
def("R", both, "show ip bgp <ip|Network in the BGP routing table to display>", (c, [a]) => bgpShow(c, () => {
  const r = c.net.bgp()[c.d.name];
  const keys = Object.keys(r.tables.ipv4).filter((k) => { const { net, len } = pfxNet(k); return sameNet(a, net, lenMask(len)); });
  if (!keys.length) return "% Network not in table";
  const k = keys.sort((x, y) => pfxNet(y).len - pfxNet(x).len)[0];
  return showBgpDetail(c.net, c.d.name, "ipv4", k);
}));
def("R", both, "show ip bgp <ip|Network in the BGP routing table to display> <ip|Network mask>", (c, [a, mk]) => bgpShow(c, () =>
  showBgpDetail(c.net, c.d.name, "ipv4", pfx4(and(a, mk), maskLen(mk)))));
def("R", both, "show ip bgp <pfx4>", (c, [k]) => bgpShow(c, () => showBgpDetail(c.net, c.d.name, "ipv4", k)));
def("R", both, "show bgp ipv6 unicast <ip6pfx>", (c, [p]) => bgpShow(c, () => showBgpDetail(c.net, c.d.name, "ipv6", pfx6(p.a, p.len))));
def("R", both, "show ip route bgp", (c) => c.print(showIpRoute(c.net, c.d.name, "B")));
def("R", both, "show ipv6 route bgp", (c) => c.print(showIpv6Route(c.net, c.d.name, "B")));
def("R", "priv", "show ip prefix-list", (c) => c.print(showPrefixLists(c.cfg)));
def("R", "priv", `show ip prefix-list ${PL}`, (c, [n]) => c.print(showPrefixLists(c.cfg, n)));
def("R", "priv", "show route-map", (c) => c.print(showRouteMaps(c.cfg)));
def("R", "priv", `show route-map ${RM}`, (c, [n]) => c.print(showRouteMaps(c.cfg, n)));
def("R", "priv", "show ip as-path-access-list", (c) => c.print(Object.entries(c.cfg.asPathLists || {})
  .map(([n, l]) => `AS path access list ${n}\n` + l.map((e) => `    ${e.action} ${e.re}`).join("\n")).join("\n")));

const bgpClearCmd = (c, which, soft, dir) => {
  if (!c.cfg.bgp) { c.print("% BGP not active"); return; }
  if (which !== "*" && !c.cfg.bgp.nbrs[which]) { c.print("% No such neighbor or address family"); return; }
  c.net.bgpClear(c.d.name, which, soft, dir);
};
for (const pre of ["clear ip bgp", "clear bgp ipv4 unicast", "clear bgp ipv6 unicast"]) {
  for (const [who, get] of [["*", () => "*"], ["<ip|BGP neighbor address to clear>", (a) => nbrKey(a)], ["<ip6|BGP IPv6 neighbor to clear>", (a) => nbrKey(a)]]) {
    def("R", "priv", `${pre} ${who}`, (c, [a]) => bgpClearCmd(c, get(a), false));
    def("R", "priv", `${pre} ${who} soft`, (c, [a]) => bgpClearCmd(c, get(a), true, "both"));
    def("R", "priv", `${pre} ${who} soft {in|out}`, (c, args) => bgpClearCmd(c, get(who === "*" ? undefined : args[0]), true, args[args.length - 1]));
  }
}
const bgpDebug = (c, on) => {
  c.d.rt.debug = { ...(c.d.rt.debug || {}), bgp: on };
  c.print(on ? "BGP updates debugging is on for address family: IPv4 Unicast" : "BGP updates debugging is off for address family: IPv4 Unicast");
};
def("R", "priv", "debug ip bgp", (c) => { c.d.rt.debug = { ...(c.d.rt.debug || {}), bgp: true }; c.print("BGP debugging is on for address family: IPv4 Unicast"); });
def("R", "priv", "debug ip bgp updates", (c) => bgpDebug(c, true));
def("R", "priv", "no debug ip bgp", (c) => bgpDebug(c, false));
def("R", "priv", "no debug ip bgp updates", (c) => bgpDebug(c, false));
def("R", "priv", "undebug ip bgp", (c) => bgpDebug(c, false));
def("R", "priv", "undebug ip bgp updates", (c) => bgpDebug(c, false));
// ======== end BGP ========

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
clear [ip|ipv6]          Clear the IPv4 settings (address, gateway, DHCP) or the IPv6 address
dhcp                     Get an address from a DHCP server (same as 'ip dhcp')
ip ARG ... [OPTION]      Configure the IPv4 address, e.g. ip 10.1.1.10/24 10.1.1.1
                         or IPv6: ip 2001:db8::10/64, or ip auto for SLAAC
ping HOST [-c count]     Ping HOST (IPv4 or IPv6) with ICMP echo requests
ping6 HOST [-c count]    Ping an IPv6 HOST
save                     Save the configuration
show [ip|ipv6|arp]       Show the PC's settings
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
    this.retype = null;
    const before = this.net.snapshot();
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      p.fn(line);
    } else if (this.loggedOut) this.login();
    else if (this.d.type === "pc") this.vpcs(line);
    else if (/\?$/.test(line) && !/^\s*!/.test(line)) {
      // IOS never runs a line ending in "?": it lists the options and gives the text back to edit.
      const text = line.slice(0, -1);
      this.print(this.help(text));
      this.retype = text;
    } else this.exec(line);
    this.net.touch();
    const logs = this.net.settle();
    this.events = this.net.events(before, this.net.snapshot());
    // Err-disable and violation messages come before the link going down; protocol changes after it.
    for (const [dn, msgs] of Object.entries(logs)) {
      const early = msgs.filter((m) => /^%(PM|SPANTREE|PORT_SECURITY)-/.test(m));
      this.events[dn] = [...early, ...(this.events[dn] || []), ...msgs.filter((m) => !early.includes(m))];
    }
    this.svcAfter();
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
    if (!line.trim() || line.trim().startsWith("!")) return; // "!" starts a comment, as in pasted configs
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
    // Nested QoS modes climb back one level at a time (a policer, then its class, then the policy).
    for (let m = mode, t = this.f.target; (r.err || !r.node.run) && !viaDo && SVC_CLIMB[m];) {
      [m, t] = [SVC_CLIMB[m][0], SVC_CLIMB[m][1](t)];
      const up = walk(TREES[d.type][m], toks, ctx);
      if (!up.err && up.node.run) { this.enter(m, t); ctx.mode = m; ctx.target = t; r = up; }
    }
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
    if (r.err === "ambiguous") { this.print(`% Ambiguous command:  "${(viaDo ? cmd.trim().replace(/^do\s+/i, "") : cmd.trim())}"`); return; }
    if (r.err === "invalid") {
      if (r.at === 0 && (mode === "user" || mode === "priv")) {
        const w = toks[0].t;
        if (toks.length === 1 && svcOf(d).hosts[w] !== undefined) { this.remote("telnet", svcOf(d).hosts[w]); return; }
        this.print(d.cfg.domainLookup ? `Translating "${w}"...domain server (255.255.255.255)` : `Translating "${w}"`,
          "% Unknown command or computer name, or unable to find computer address");
        return;
      }
      this.invalidAt(toks[r.at].i);
      return;
    }
    if (!r.node.run) {
      if (r.node.kw === "show" && toks.length === 1) this.print('% Type "show ?" for a list of subcommands');
      else this.print("% Incomplete command.", "");
      return;
    }
    // Below level 15 only user-level commands and those "privilege exec" opened up are allowed.
    if (mode === "priv" && !viaDo && this.level() < 15) {
      const userOk = (() => { const u = walk(TREES[d.type].user, toks, ctx); return !u.err && u.node.run; })();
      const path = kwPath(TREES[d.type].priv, toks, ctx) || [];
      const ruled = svcOf(d).privs.some((p) => p.level <= this.level() && p.path.every((w, i) => w === path[i]));
      if (!userOk && !ruled) { this.invalidAt(toks[0].i); return; }
    }
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
    const im = /^([A-Za-z-]+)([\d/.]*)$/.exec(last.t);
    if (!cands.length && im && r.node.kids.some((k) => k.param && k.param.intf)) {
      cands = IF_TYPES[this.d.type].filter((t) => t.toLowerCase().startsWith(im[1].toLowerCase())).map((t) => t + im[2]);
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
    const by = this.eemName ? ` on vty0 (EEM:${this.eemName})` : this.f.via ? `vty0 (${n2ip(this.f.via)})` : "console";
    this.net.note(this.d.name, `%SYS-5-CONFIG_I: Configured from console by ${by}`);
  }

  enable() {
    const c = this.d.cfg;
    const pw = c.enableSecret ?? c.enablePassword;
    if (pw === null || this.eemName) {
      if (this.f.via && !this.eemName) { this.print("% No password set"); return; }
      this.enterLevel(15);
      return;
    }
    let tries = 0;
    const ask = () => this.ask("Password: ", { mask: true }, (ans) => {
      if (ans === pw) { this.enterLevel(15); return; }
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
    const d = this.d, con = d.cfg.lines.con, sv = svcOf(d);
    if (d.cfg.banner) this.print(d.cfg.banner);
    const done = (level = 1) => {
      this.loggedOut = false;
      this.enterLevel(level);
      if (sv.bannerExec) this.print(sv.bannerExec);
    };
    if (loginMethods(d, "con")) {
      this.aaaLogin(d, "con", null, (level) => done(level), () => this.print("", "Press RETURN to get started.", ""));
      return;
    }
    if (con.login && sv.bannerLogin) this.print(sv.bannerLogin);
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
        if (u && (u.secret ?? u.password) === pw) { done(u.priv ?? 1); return; }
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
      const virtual = n.startsWith("Loopback") || n.startsWith("Vlan") || (d.type === "switch" && isPo(n))
        || (d.type === "router" && isSub(n) && d.ports.includes(physOf(n)));
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

  setIp(ip, mask, secondary) {
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
        const theirs = [...(oc.ip !== null ? [{ ip: oc.ip, mask: oc.mask, sec: false }] : []), ...(oc.secondary || []).map((s) => ({ ...s, sec: true }))];
        for (const t of theirs) {
          if (o === n && (t.sec ? t.ip === ip : !secondary)) continue; // replacing this very address
          const m = and(mask, t.mask);
          if (and(ip, m) === and(t.ip, m)) {
            this.print(o === n ? `% ${n2ip(and(ip, mask))} overlaps with ${t.sec ? "secondary" : "primary"} address on ${o}` : `% ${n2ip(and(ip, mask))} overlaps with ${o}`);
            return;
          }
        }
      }
      if (secondary) {
        if (!c.intfs[n].secondary.some((s) => s.ip === ip)) c.intfs[n].secondary.push({ ip, mask });
        continue;
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
  ping(dst, source, count, size = 100, tos = 0) {
    const net = this.net, dn = this.d.name;
    this.print("Type escape sequence to abort.", `Sending ${count}, ${size}-byte ICMP Echos to ${n2ip(dst)}, timeout is 2 seconds:`);
    if (source !== null) {
      if (!net.upIfs(dn).some((n) => net.ifAddr(dn, n).ip === source)) {
        this.print("% Invalid source address- IP address not on any of our up interfaces");
        return;
      }
      this.print(`Packet sent with a source address of ${n2ip(source)}`);
    }
    let marks = "", ok = 0, first = null;
    const qosBuckets = {};
    for (let i = 0; i < count; i++) {
      const r = net.ping(dn, dst, { source: source ?? undefined, record: true, size, dscp: tos >> 2, qosBuckets, seq: i });
      first = first || r;
      if (r.ok && !(i === 0 && r.arpMiss)) { marks += "!"; ok++; continue; }
      const unreachable = !r.ok && r.by !== null && r.by !== undefined && r.failAt !== dn && (r.fail === "noroute" || r.fail === "acl");
      marks += unreachable && i % 2 === 0 ? "U" : ".";
    }
    for (let i = 0; i < marks.length; i += 70) this.print(marks.slice(i, i + 70));
    this.print(`Success rate is ${Math.floor((ok * 100) / count)} percent (${ok}/${count})${ok ? ", round-trip min/avg/max = 1/1/2 ms" : ""}`);
    this.anim = { from: dn, links: first.links, ok: first.ok, failAt: first.failAt };
  }

  // "ping" on its own: the extended ping dialogue.
  extendedPing() {
    const d = this.d;
    this.ask("Protocol [ip]: ", {}, (proto) => {
      const p = proto.trim().toLowerCase() || "ip";
      if (!["ip", "ipv6"].includes(p) || (p === "ipv6" && d.type !== "router")) {
        this.print(`% Unknown protocol - "${proto.trim()}", type "ping ?" for help`);
        return;
      }
      this.ask(`Target ${p === "ipv6" ? "IPv6" : "IP"} address: `, {}, (t) => {
        const target = t.trim();
        if (p === "ip" ? !isIp(target) : parse6(target) === null) { this.print("% Bad IP address"); return; }
        this.ask("Repeat count [5]: ", {}, (r) => {
          const count = r.trim() ? +r.trim() : 5;
          if (!Number.isInteger(count) || count < 1 || count > 100) { this.print("% A decimal number between 1 and 100."); return; }
          this.ask("Datagram size [100]: ", {}, (sz) => {
            const size = sz.trim() ? +sz.trim() : 100;
            if (!Number.isInteger(size) || size < 36 || size > 18024) { this.print("% A decimal number between 36 and 18024."); return; }
            this.ask("Timeout in seconds [2]: ", {}, () => this.ask("Extended commands [n]: ", {}, (ext) => {
              let tos = 0;
              const go = (src) => this.ask("Sweep range of sizes [n]: ", {}, () => {
                if (p === "ipv6") this.ping6(fmt6(parse6(target)), count);
                else this.ping(ip2n(target), src, count, size, tos);
              });
              if (!/^y/i.test(ext.trim())) { go(null); return; }
              this.ask("Source address or interface: ", {}, (s) => {
                const w = s.trim();
                let src = null;
                if (isIp(w)) src = ip2n(w);
                else if (w) {
                  const n = parseIfName(d.type, tokenize(w), 0);
                  const a = n && n.name && d.cfg.intfs[n.name] && this.net.ifAddr(d.name, n.name);
                  if (!a) { this.print("% Invalid source address- IP address not on any of our up interfaces"); return; }
                  src = a.ip;
                }
                const rest = ["Type of service [0]: ", "Set DF bit in IP header? [no]: ", "Validate reply data? [no]: ",
                  "Data pattern [0x0000ABCD]: ", "Loose, Strict, Record, Timestamp, Verbose[none]: "];
                const next = (k) => (k === rest.length ? go(src) : this.ask(rest[k], {}, (a) => {
                  if (k === 0 && /^\d+$/.test(a.trim()) && +a.trim() <= 255) tos = +a.trim();
                  next(k + 1);
                }));
                next(0);
              });
            }));
          });
        });
      });
    });
  }

  ping6(text, count = 5, ifn) {
    const net = this.net, dn = this.d.name, dst = parse6(text);
    if (isLL(dst) && !ifn) {
      this.ask("Output Interface: ", {}, (ans) => {
        const r = parseIfName(this.d.type, tokenize(ans.trim() || "x"), 0);
        if (!r || !r.name || !this.d.cfg.intfs[r.name]) { this.print("% Invalid interface. Use full interface name without spaces (e.g. Serial0/1)"); return; }
        this.ping6(text, count, r.name);
      });
      return;
    }
    if (!ifn && !net.owns6(dn, dst) && net.routerEgress6(dn, dst).fail) { this.print("% No valid route for destination"); return; }
    this.print("Type escape sequence to abort.", `Sending ${count}, 100-byte ICMP Echos to ${fmt6(dst)}, timeout is 2 seconds:`);
    if (ifn) this.print(`Packet sent with a source address of ${fmt6(net.ll6(dn, ifn))}%${ifn}`);
    let marks = "", ok = 0, first = null;
    for (let i = 0; i < count; i++) {
      const r = net.ping6(dn, dst, { record: true, ifn });
      first = first || r;
      if (r.ok) { marks += "!"; ok++; } else marks += ".";
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

  traceroute(dst, source) {
    const net = this.net, dn = this.d.name;
    if (net.sourceIp(dn, dst, source) === null) { this.print("% No valid source address for destination"); return; }
    this.print("Type escape sequence to abort.", `Tracing the route to ${n2ip(dst)}`, "VRF info: (vrf in name/id, vrf out name/id)");
    net.trace(dn, dst, 30, source).forEach((h, i) => {
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
    if (!allows || (proto === "ssh" && !net.sshReady(owner)) || net.svcQuiet(owner)) { this.print("% Connection refused by remote host"); return; }
    const closed = () => this.print("", `[Connection to ${n2ip(ip)} closed by foreign host]`);
    const fromIp = net.sourceIp(from, ip);
    const enter = (u, level = 1) => {
      if (proto === "ssh" && t.cfg.banner) this.print("", t.cfg.banner, "");
      if (svcOf(t).bannerExec) this.print(svcOf(t).bannerExec);
      this.frames.push({ dev: owner, mode: level >= 2 ? "priv" : "user", level, target: null, via: ip });
      t.rt.logins.push({ proto, user: u ?? null, from });
      if (t.rt.logins.length > 20) t.rt.logins.shift();
    };
    if (proto === "telnet") { this.print("Open"); if (t.cfg.banner) this.print(t.cfg.banner); }
    const check = (u, pw) => { const x = t.cfg.users[u]; return !!x && (x.secret ?? x.password) === pw; };
    if (loginMethods(t, "vty")) {
      this.aaaLogin(t, "vty", proto === "ssh" ? user : null, (level, u) => enter(u, level), closed, fromIp);
      return;
    }
    if (vty.login !== null && svcOf(t).bannerLogin) this.print(svcOf(t).bannerLogin);
    if (vty.login === null) { enter(); return; }
    if (vty.login === "line") {
      if (vty.password === null) { this.print("", "", "Password required, but none set"); closed(); return; }
      if (proto === "telnet") this.print("", "", "User Access Verification", "");
      let tries = 0;
      const ask = () => this.ask("Password: ", { mask: true }, (pw) => {
        net.svcLoginResult(owner, null, pw === vty.password, fromIp);
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
        net.svcLoginResult(owner, user, check(user, pw), fromIp);
        if (check(user, pw)) { enter(user, t.cfg.users[user].priv ?? 1); return; }
        if (++tries >= 3) { this.print("% Authentication failed."); closed(); return; }
        ask();
      });
      ask();
      return;
    }
    this.print("", "", "User Access Verification", "");
    const askUser = () => this.ask("Username: ", {}, (u) => this.ask("Password: ", { mask: true }, (pw) => {
      net.svcLoginResult(owner, u.trim(), check(u.trim(), pw), fromIp);
      if (check(u.trim(), pw)) { enter(u.trim(), t.cfg.users[u.trim()].priv ?? 1); return; }
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
      if (!sub) this.print("Usage: ip ADDRESS[/LEN] [GATEWAY] [MASK]   or   ip dhcp   or   ip auto");
      else if (sub === "dhcp" || sub === "-d") this.vpcsDhcp();
      else if (sub === "auto") this.vpcsAuto();
      else if (sub.includes(":")) this.vpcsIp6(w[1]);
      else this.vpcsIp(w.slice(1));
    } else if (cmd === "dhcp") this.vpcsDhcp();
    else if (cmd === "show") {
      if (sub === "ipv6") this.vpcsShow6();
      else if (!sub || "ip".startsWith(sub)) this.vpcsShow();
      else if ("arp".startsWith(sub)) this.vpcsArp();
      else bad();
    } else if (cmd === "ping" && (w[1] || "").includes(":")) this.vpcsPing6(w);
    else if (cmd === "ping6") this.vpcsPing6(w);
    else if (cmd === "ping") this.vpcsPing(w);
    else if (cmd === "trace" || cmd === "tracert") this.vpcsTrace(w);
    else if (cmd === "clear" && sub === "ip") {
      Object.assign(c, { ip: null, mask: null, gw: null, dns: null, dhcp: false, dhcpServer: null });
      this.print("IPv4 address/mask, gateway, DNS, and DHCP cleared");
    } else if (cmd === "clear" && sub === "ipv6") {
      c.ip6 = null;
      this.print("IPv6 address/mask cleared");
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

  vpcsShow6() {
    const net = this.net, dn = this.d.name, c = this.d.cfg;
    const ra = net.ras(dn, "eth0")[0];
    this.print("", `NAME              : ${c.hostname}[1]`, `LINK-LOCAL SCOPE  : ${fmt6(net.ll6(dn, "eth0")).toLowerCase()}/64`,
      `GLOBAL SCOPE      : ${net.addrs6(dn, "eth0").map((x) => `${fmt6(x.a).toLowerCase()}/${x.len}`).join("")}`, "DNS               : ",
      `ROUTER LINK-LAYER : ${ra ? colonMac(net.mac(ra.dev, ra.ifn)) : ""}`, `MAC               : ${colonMac(net.mac(dn, "eth0"))}`,
      "LPORT             : 20000", "RHOST:PORT        : 127.0.0.1:30000", "MTU:              : 1500", "");
  }

  // ip auto: stateless autoconfiguration from a router advertisement.
  vpcsAuto() {
    const r = this.net.slaac(this.d.name);
    if (!r) { this.print("No router answered ICMPv6 Router Solicitation", "Still listening: the address appears when a router advertises a prefix."); return; }
    this.print(`GLOBAL SCOPE      : ${fmt6(r.a).toLowerCase()}/64`, `ROUTER LINK-LAYER : ${colonMac(this.net.mac(r.router.dev, r.router.ifn))}`);
  }

  vpcsIp6(arg) {
    const m = /^([^/]+)\/(\d{1,3})$/.exec(arg);
    const a = m && parse6(m[1]);
    if (!m || a === null || +m[2] < 1 || +m[2] > 128) { this.print("Invalid address"); return; }
    if (isLL(a) || (a >> 120n) === 0xffn) { this.print("Invalid address"); return; }
    this.d.cfg.ip6 = { a: fmt6(a), len: +m[2], auto: false };
    this.print(`${this.d.cfg.hostname} : ${fmt6(a).toLowerCase()}/${m[2]}`);
  }

  vpcsPing6(w) {
    const net = this.net, dn = this.d.name;
    const dst = w[1] ? parse6(w[1]) : null;
    if (dst === null) { this.print("Invalid address"); return; }
    let count = 5;
    const ci = w.indexOf("-c");
    if (ci > 0) {
      count = +w[ci + 1];
      if (!Number.isInteger(count) || count < 1 || count > 100) { this.print("Invalid count, use -c 1-100"); return; }
    }
    const shown = fmt6(dst).toLowerCase();
    let first = null;
    for (let i = 1; i <= count; i++) {
      const r = net.ping6(dn, dst, { record: true });
      first = first || r;
      if (r.ok) { this.print(`${shown} icmp6_seq=${i} ttl=${r.ttl} time=${ms()} ms`); continue; }
      if (r.fail === "noip" || r.fail === "nogw" || (r.fail === "arp" && r.failAt === dn)) { this.print(`host (${shown}) not reachable`); break; }
      this.print(`${shown} icmp6_seq=${i} timeout`);
    }
    this.anim = { from: dn, links: first.links, ok: first.ok, failAt: first.failAt };
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
    // -l sets the ICMP data size (56 by default): the reply line counts IP and ICMP headers too.
    let data = 56;
    const li = w.indexOf("-l");
    if (li > 0) {
      data = +w[li + 1];
      if (!Number.isInteger(data) || data < 0 || data > 65500) { this.print("Invalid size, use -l 0-65500"); return; }
    }
    const dst = ip2n(w[1]);
    let first = null;
    const qosBuckets = {};
    for (let i = 1; i <= count; i++) {
      const r = net.ping(dn, dst, { record: true, size: data + 28, qosBuckets, seq: i - 1 });
      first = first || r;
      if (r.ok && !(i === 1 && r.arpMiss)) { this.print(`${data + 28} bytes from ${w[1]} icmp_seq=${i} ttl=${r.ttl} time=${ms()} ms`); continue; }
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
    const notes = /^%\s?(Access VLAN does not exist|Login disabled|OSPF: Reference|OSPFv3: Reference|The key modulus|Generating|Warning: portfast|Warning: this command enables portfast|Portfast has been configured|Only classful|OSPFv3-4-NORTRID|This simulator doesn't summarise)/;
    if (out.split("\n").some((l) => (l.startsWith("%") && !notes.test(l)) || /^(Bad mask|Bad command|Invalid address|Command rejected)/.test(l))) {
      throw new Error(`${devName}: "${line}" -> ${out}`);
    }
  }
  if (s.pending) throw new Error(`${devName}: configuration ends at an open prompt: ${s.pending.prompt}`);
  return s;
}

// A lab's network: from saved state when there is some, otherwise from its starting configs.
// The spec can arrive with its keys sorted (the page gets it through JSON with sorted keys), so the
// order is fixed here: routers and switches first, then the PCs' settings, then anything a PC does
// (pings and traceroutes), so the network a PC talks to is already built.
export function buildLab(lab, state) {
  if (state) return new Network(lab, state);
  const net = new Network(lab);
  const kind = (dev) => lab.devices.find((d) => d.name === dev).type;
  const entries = Object.entries(lab.initial).sort(([a], [b]) => lab.devices.findIndex((d) => d.name === a) - lab.devices.findIndex((d) => d.name === b));
  const act = (l) => /^\s*(ping|ping6|trace|tracert)\b/i.test(l);
  for (const [dev, lines] of entries) if (kind(dev) !== "pc") applyConfig(net, dev, lines);
  for (const [dev, lines] of entries) if (kind(dev) === "pc") applyConfig(net, dev, lines.filter((l) => !act(l)));
  for (const [dev, lines] of entries) if (kind(dev) === "pc" && lines.some(act)) applyConfig(net, dev, lines.filter(act));
  return net;
}

// ======== QoS & management services ========
// QoS (MQC and switch mls qos), AAA and privilege levels, SNMP, syslog, NTP, NetFlow and Flexible
// NetFlow, LLDP, name resolution and EEM applets. Device settings live in cfg.svc, per-interface
// settings in intf.svc and runtime state (log buffer, counters, flow caches) in rt.svc.

function newSvc() {
  return {
    ts: { log: "datetime", debug: "datetime" }, seq: false,
    logging: { on: true, buffered: null, console: 7, monitor: 7, trap: 6, hosts: [], source: null },
    aaa: { on: false, authen: {}, author: {}, console: false, groups: {}, servers: {} },
    privs: [], enableLevels: {}, blockFor: null, onFail: false, onSuccess: false, minLen: 0,
    bannerLogin: "", bannerExec: "",
    snmp: { communities: {}, groups: {}, users: {}, views: {}, hosts: [], traps: null, location: null, contact: null },
    ntp: { master: null, servers: [], auth: false, keys: {}, trusted: [], source: null },
    qos: { classes: {}, policies: {}, mls: false },
    flow: { records: {}, exporters: {}, monitors: {}, exportDst: null, exportVer: null, exportSrc: null },
    lldp: { run: false, timer: 30, hold: 120 },
    http: { server: false, secure: false },
    hosts: {}, nameServers: [],
    eem: {},
  };
}

function newSvcIf() {
  return { sp: { input: null, output: null }, flowIn: false, flowOut: false, mon: { input: [], output: [] },
    lldpTx: true, lldpRx: true, trust: null, autoqos: false };
}

function newSvcRt() {
  return { log: [], seq: 0, counts: { console: 0, monitor: 0, buffer: 0, trap: 0, hosts: {} }, qos: {}, flows: {}, tflows: {},
    exported: {}, fails: [], quietUntil: 0, totalFails: 0, eem: [], eemCount: {}, traps: {}, snmpIn: 0, boot: Date.now() };
}

// Saves made before these services existed kept SNMP communities, NTP servers and log hosts at the top level.
function svcMigrate(cfg) {
  if (cfg.svc) return;
  cfg.svc = newSvc();
  for (const [s, a] of Object.entries(cfg.snmp || {})) cfg.svc.snmp.communities[s] = { access: a, acl: null, view: null };
  if (cfg.snmpLoc) cfg.svc.snmp.location = cfg.snmpLoc;
  if (cfg.snmpContact) cfg.svc.snmp.contact = cfg.snmpContact;
  for (const ip of cfg.ntp || []) cfg.svc.ntp.servers.push({ ip, key: null, prefer: false });
  cfg.svc.logging.hosts = [...(cfg.logHosts || [])];
  for (const k of ["snmp", "snmpLoc", "snmpContact", "ntp", "logHosts"]) delete cfg[k];
}

const SEVERITIES = ["emergencies", "alerts", "critical", "errors", "warnings", "notifications", "informational", "debugging"];
const SEV_HELP = ["Immediate action needed", "Immediate action needed", "Critical conditions", "Error conditions",
  "Warning conditions", "Normal but significant conditions", "Informational messages", "Debugging messages"];
const sevOf = (m) => { const x = /^%[A-Z0-9_]+(?:-[A-Z0-9_]+)*?-([0-7])-[A-Z0-9_]+:/.exec(m); return x ? +x[1] : 7; };

const DSCP_NAMES = { default: 0, cs0: 0, cs1: 8, af11: 10, af12: 12, af13: 14, cs2: 16, af21: 18, af22: 20, af23: 22, cs3: 24,
  af31: 26, af32: 28, af33: 30, cs4: 32, af41: 34, af42: 36, af43: 38, cs5: 40, ef: 46, cs6: 48, cs7: 56 };
const dscpName = (v) => Object.entries(DSCP_NAMES).find(([n, x]) => x === v && n !== "cs0")?.[0] || String(v);
const parseDscp = (t) => (/^\d+$/.test(t) && +t <= 63 ? +t : DSCP_NAMES[t.toLowerCase()] ?? null);

// Parameters used only by these commands.
Object.assign(PARAMS, {
  dscp: { fmt: "<0-63>", help: "Differentiated services codepoint value", match: (t, k) => {
    const v = parseDscp(t[k].t);
    return v === null ? null : { used: 1, value: v };
  } },
  dscps: { fmt: "<0-63>", help: "Differentiated services codepoint value", match: (t, k) => {
    const vals = [];
    while (k + vals.length < t.length && vals.length < 8) {
      const v = parseDscp(t[k + vals.length].t);
      if (v === null) break;
      vals.push(v);
    }
    return vals.length && k + vals.length === t.length ? { used: vals.length, value: vals } : null;
  } },
  precs: { fmt: "<0-7>", help: "Enter up to 4 precedence values separated by white-spaces", match: (t, k) => {
    const vals = t.slice(k).map((x) => x.t);
    return vals.length <= 4 && vals.every((x) => /^[0-7]$/.test(x)) ? { used: vals.length, value: vals.map(Number) } : null;
  } },
  quoted: { fmt: "LINE", help: "", rest: true, match: (t, k, ctx) => ({ used: t.length - k, value: ctx.line.slice(t[k].i).trimEnd() }) },
  sev: { fmt: "<0-7>", help: "Logging severity level", match: (t, k) => {
    const w = t[k].t.toLowerCase();
    if (/^[0-7]$/.test(w)) return { used: 1, value: +w };
    const hits = SEVERITIES.filter((s) => s.startsWith(w));
    return hits.length === 1 ? { used: 1, value: SEVERITIES.indexOf(hits[0]) } : null;
  } },
});

// Modes these commands open.
Object.assign(MODES, {
  cmap: "(config-cmap)#", pmap: "(config-pmap)#", pmapc: "(config-pmap-c)#", police: "(config-pmap-c-police)#",
  flowrec: "(config-flow-record)#", flowexp: "(config-flow-exporter)#", flowmon: "(config-flow-monitor)#",
  applet: "(config-applet)#", radsrv: "(config-radius-server)#", tacsrv: "(config-server-tacacs)#",
  sgrad: "(config-sg-radius)#", sgtac: "(config-sg-tacacs+)#",
});
const SVC_MODES = ["cmap", "pmap", "pmapc", "police", "flowrec", "flowexp", "flowmon", "applet", "radsrv", "tacsrv", "sgrad", "sgtac"];
// Where a command a nested mode doesn't know is tried next, and the target that mode works on.
const SVC_CLIMB = { police: ["pmapc", (t) => t], pmapc: ["pmap", (t) => t.pol] };
SUBMODES.push(...SVC_MODES);
CONFIG_MODES.push(...SVC_MODES);

Object.assign(HELP, {
  "class-map": "Configure Class Map", "policy-map": "Configure QoS Policy Map", "match-all": "Logical-AND all matching statements under this classmap",
  "match-any": "Logical-OR all matching statements under this classmap", "service-policy": "Configure CPL Service Policy",
  police: "Police", shape: "Traffic Shaping", "fair-queue": "Enable Flow-based Fair Queuing", "conform-action": "action when rate is less than conform burst",
  "exceed-action": "action when rate is within conform and conform + exceed burst", "violate-action": "action when rate is greater than conform + exceed burst",
  transmit: "transmit packet", drop: "drop packet", "set-dscp-transmit": "set dscp and send it", cir: "Committed information rate",
  bc: "Conform burst", average: "configure token bucket: CIR (bps) [Bc (bits) [Be (bits)]] ", mls: "mls global commands",
  qos: "qos configuration", trust: "trust state for the interface", cos: "trust COS in the incoming packet", "ip-precedence": "trust IP precedence in the incoming packet",
  auto: "Configure AutoQoS", voip: "Configure AutoQoS for VoIP", "aaa": "Authentication, Authorization and Accounting.",
  "new-model": "Enable NEW access control commands and functions.(Disables OLD commands.)", authentication: "Authentication configurations parameters.",
  authorization: "Authorization configurations parameters.", accounting: "Accounting configurations parameters.",
  "local-case": "Use case-sensitive local username authentication.", "if-authenticated": "Succeed if user has authenticated.",
  radius: "Use list of all Radius hosts.", "tacacs+": "Use list of all Tacacs+ hosts.", lldp: "LLDP information",
  "event": "Event related commands", "action": "Add or modify an action statement", applet: "Register an Event Manager applet",
  "flow": "Global Flow configuration subcommands", record: "Flow Record configuration", exporter: "Flow Exporter configuration",
  collect: "Specify a collection field", "flow-export": "Specify host/port to send flow statistics", "name-server": "Specify address of name server to use",
  http: "HTTP server configuration", "secure-server": "Enable HTTP secure server", "sequence-numbers": "Stamp logger messages with a sequence number",
  timestamps: "Timestamp debug/log messages", datetime: "Timestamp with date and time", uptime: "Timestamp with system uptime",
  msec: "Include milliseconds in timestamp", localtime: "Use local time zone for timestamps", buffered: "Set buffered logging parameters",
  trap: "Set syslog server logging level", "source-interface": "Specify interface for source address in logging transactions",
  master: "Act as NTP master clock", authenticate: "Authenticate time sources", "authentication-key": "Authentication key for trusted time sources",
  "trusted-key": "Key numbers for trusted time sources", prefer: "Prefer this peer when possible", privilege: "Command privilege parameters",
  "block-for": "Set quiet-mode active time period", "on-failure": "Set options for failed login attempt", "on-success": "Set options for successful login attempt",
  security: "Infra Security CLI configurations", passwords: "Password security configuration", "min-length": "Minimum length of passwords",
  "community": "Enable SNMP; set community string and access privs", traps: "Enable SNMP Traps",
  group: "Use Server-group", "start-stop": "Record start and stop without waiting", size: "Datagram size",
  timeout: "Timeout in seconds", "df-bit": "enable do not fragment bit in IP header", tos: "Type of service",
});

Object.assign(HELP_PATH, {
  "logging host": "Set syslog server IP address and parameters", "logging trap": "Set syslog server logging level",
  "logging console": "Set console logging parameters", "logging monitor": "Set terminal line (monitor) logging parameters",
  "logging buffered": "Set buffered logging parameters", "logging source-interface": "Specify interface for source address in logging transactions",
  "logging on": "Enable logging to all enabled destinations", "show logging": "Show the contents of logging buffers",
  "clear logging": "Clear logging buffer", "service timestamps": "Timestamp debug/log messages", "timestamps log": "Timestamp log messages",
  "timestamps debug": "Timestamp debug messages", "snmp-server community": "Enable SNMP; set community string and access privs",
  "snmp-server view": "Define an SNMP MIB view", "snmp-server group": "Define a User Security Model group", "snmp-server user": "Define a user who can access the SNMP engine",
  "snmp-server host": "Specify hosts to receive SNMP notifications", "snmp-server enable": "Enable SNMP Traps or Informs",
  "snmp-server location": "Text for mib object sysLocation", "snmp-server contact": "Text for mib object sysContact",
  "snmp-server ifindex": "Enable ifindex persistence", "community view": "Restrict this community to a named MIB view",
  "group v3": "group using the User Security Model (SNMPv3)", "v3 noauth": "group using the noAuthNoPriv Security Level",
  "v3 auth": "group using the authNoPriv Security Level", "v3 priv": "group using SNMPv3 authPriv security level",
  "group read": "specify a read view for the group", "group write": "specify a write view for the group", "read write": "specify a write view for the group",
  "group access": "specify an access-list associated with this group", "read access": "specify an access-list associated with this group",
  "write access": "specify an access-list associated with this group", "user v3": "user using the v3 security model",
  "v3 auth md5": "Use HMAC MD5 algorithm for authentication", "v3 auth sha": "Use HMAC SHA algorithm for authentication",
  "user auth": "authentication parameters for the user", "md5 priv": "encryption parameters for the user", "sha priv": "encryption parameters for the user",
  "priv des": "Use 56 bit DES algorithm for encryption", "priv 3des": "Use 168 bit 3DES algorithm for encryption", "priv aes": "Use AES algorithm for encryption",
  "host version": "SNMP version to use for notification messages", "version 1": "Use SNMPv1", "version 2c": "Use SNMPv2c", "version 3": "Use SNMPv3",
  "show snmp": "snmp statistics", "snmp community": "show snmp communities", "snmp user": "show snmp users", "snmp group": "show snmp groups",
  "snmp host": "show snmp notification host", "snmp view": "show snmp view", "enable traps": "Enable SNMP Traps",
  "ntp master": "Act as NTP master clock", "ntp server": "Configure NTP server", "server key": "Configure peer authentication key",
  "server prefer": "Prefer this peer when possible", "ntp authenticate": "Authenticate time sources", "ntp authentication-key": "Authentication key for trusted time sources",
  "ntp trusted-key": "Key numbers for trusted time sources", "ntp source": "Configure interface for source address",
  "authentication-key md5": "MD5 authentication", "show ntp": "Network time protocol", "ntp status": "NTP status", "ntp associations": "NTP associations",
  "aaa new-model": "Enable NEW access control commands and functions.(Disables OLD commands.)", "aaa authentication": "Authentication configurations parameters.",
  "aaa authorization": "Authorization configurations parameters.", "aaa accounting": "Accounting configurations parameters.",
  "aaa group": "AAA group definitions", "aaa session-id": "AAA Session ID", "authentication login": "Set authentication lists for logins.",
  "authentication enable": "Set authentication list for enable.", "authorization exec": "For starting an exec (shell).",
  "authorization console": "For enabling console authorization", "login default": "The default authentication list.",
  "exec default": "The default authorization list.", "enable default": "The default authentication list.",
  "group server": "AAA group definition", "server radius": "Radius server-group definition", "server tacacs+": "Tacacs+ server-group definition",
  "login local": "Use local username authentication.", "default local": "Use local username authentication.", "default enable": "Use enable password for authentication.",
  "default line": "Use line password for authentication.", "default none": "NO authentication.", "default group": "Use Server-group",
  "local local": "Use local username authentication.", "radius server": "Server configuration", "tacacs server": "Server configuration",
  "radius-server host": "Specify a RADIUS server", "tacacs-server host": "Specify a TACACS server", "address ipv4": "IPv4 address",
  "login authentication": "Authentication parameters.", "show aaa": "Show AAA values", "aaa servers": "Show AAA Server info",
  "aaa method-lists": "Show AAA method lists", "privilege exec": "Exec mode", "exec level": "Set privilege level of command",
  "secret level": "Set exec level password", "password level": "Set exec level password", "show privilege": "Show current privilege level",
  "login block-for": "Set quiet-mode active time period", "block-for attempts": "Set max number of fail attempts",
  "attempts within": "Watch period for repeated login failures", "on-failure log": "Generate syslogs on failure logins",
  "on-success log": "Generate syslogs on successful logins", "show login": "Show login information", "login failures": "Show login failures",
  "security passwords": "Password security configuration", "banner login": "Set login banner", "banner exec": "Set EXEC process creation banner",
  "ip host": "Add an entry to the ip hostname table", "ip name-server": "Specify address of name server to use",
  "ip http": "HTTP server configuration", "http server": "Enable HTTP server", "http secure-server": "Enable HTTP secure server",
  "http authentication": "Set HTTP server authentication method", "show hosts": "IP domain-name, lookup style, nameservers, and host table",
  "service sequence-numbers": "Stamp logger messages with a sequence number", "lldp run": "Enable LLDP", "lldp timer": "Specify the rate at which LLDP packets are sent (in sec)",
  "lldp holdtime": "Specify the holdtime (in sec) to be sent in packets", "lldp transmit": "Enable LLDP transmission on interface",
  "lldp receive": "Enable LLDP reception on interface", "show lldp": "LLDP information", "lldp neighbors": "LLDP neighbor entries",
  "neighbors detail": "Show detailed information", "lldp interface": "LLDP interface status and configuration",
  "class-map match-all": "Logical-AND all matching statements under this classmap", "class-map match-any": "Logical-OR all matching statements under this classmap",
  "policy-map class": "policy criteria", "service-policy input": "Assign policy-map to the input of an interface",
  "service-policy output": "Assign policy-map to the output of an interface", "show class-map": "Show QoS Class Map",
  "show policy-map": "Show QoS Policy Map", "policy-map interface": "Show Qos Policy Map Interface", "set dscp": "Set DSCP in IP(v4) and IPv6 packets",
  "set ip": "Set IP specific values", "ip dscp": "Set IP DSCP (DiffServ CodePoints)", "set precedence": "Set precedence in IP(v4) and IPv6 packets",
  "ip precedence": "Set IP precedence", "bandwidth percent": "% of total Bandwidth", "bandwidth remaining": "percent/ratio of the remaining bandwidth",
  "remaining percent": "% of the remaining bandwidth", "priority percent": "% of total bandwidth", "shape average": "configure token bucket: CIR (bps) [Bc (bits) [Be (bits)]], send out Bc only per interval",
  "police cir": "Committed information rate", "cir bc": "Conform burst", "set-dscp-transmit": "set dscp and send it",
  "mls qos": "qos configuration", "qos trust": "trust state for the interface", "trust dscp": "trust DSCP in the incoming packet",
  "trust cos": "trust COS in the incoming packet", "auto qos": "Configure AutoQoS", "qos voip": "Configure AutoQoS for VoIP",
  "voip trust": "Trust the DSCP/CoS marking", "show mls": "Show MultiLayer Switching information", "mls qos interface": "Interface qos information",
  "ip flow": "NetFlow related commands", "flow ingress": "Enable inbound NetFlow", "flow egress": "Enable outbound NetFlow",
  "flow monitor": "Flow Monitor configuration", "ip flow monitor": "Apply a Flow Monitor", "flow record": "Flow Record configuration",
  "flow exporter": "Flow Exporter configuration", "show flow": "Flow information", "show flow monitor": "Flow monitor information",
  "show flow exporter": "Flow Exporter information", "show flow record": "Flow Record information", "show flow interface": "Flow interface information",
  "monitor cache": "Contents of the cache for the flow monitor", "ip cache": "IP fast-switching route cache", "cache flow": "Flow cache entries",
  "ip flow-export": "Specify host/port to send flow statistics", "flow-export destination": "Specify the Destination IP address",
  "flow-export version": "Specify the version number", "flow-export source": "Specify the interface for the source address",
  "match ipv4": "IPv4 fields", "ipv4 source": "IPv4 source address", "ipv4 destination": "IPv4 destination address",
  "ipv4 protocol": "IPv4 protocol", "ipv4 tos": "IPv4 type of service", "source address": "IPv4 address", "destination address": "IPv4 address",
  "match transport": "Transport layer fields", "transport source-port": "Transport source port", "transport destination-port": "Transport destination port",
  "match interface": "Interface fields", "interface input": "Input interface", "interface output": "Output interface",
  "collect counter": "Counter fields", "counter bytes": "Total number of bytes", "counter packets": "Total number of packets",
  "bytes long": "Total number of bytes (64 bit counter)", "packets long": "Total number of packets (64 bit counter)",
  "collect interface": "Interface fields", "collect timestamp": "Timestamp fields", "timestamp sys-uptime": "Value of sysUpTime",
  "sys-uptime first": "Value of sysUpTime at the first packet of the flow", "sys-uptime last": "Value of sysUpTime at the most recent packet of the flow",
  "export-protocol netflow-v9": "NetFlow Version 9", "export-protocol netflow-v5": "NetFlow Version 5", "export-protocol ipfix": "IPFIX",
  "cache timeout": "Cache timeout values", "timeout active": "Active timeout", "timeout inactive": "Inactive timeout",
  "event manager": "Event Manager configuration commands", "manager applet": "Register an Event Manager applet", "event syslog": "Syslog event",
  "syslog pattern": "Specify syslog pattern", "event none": "Manually run policy event", "event timer": "Timer event",
  "timer countdown": "Countdown timer", "timer watchdog": "Watchdog timer", "countdown time": "Countdown timer value", "watchdog time": "Watchdog timer value",
  "cli command": "Specify the CLI command", "syslog msg": "Specify the syslog message", "syslog priority": "Specify the syslog priority",
  "manager run": "Run an Event Manager policy", "show event": "Event information", "manager policy": "Registered policies",
  "policy registered": "Registered policies", "manager history": "History information", "history events": "Event history",
  "pattern occurs": "Number of occurrences before raising event",
  "action cli": "Execute a CLI command", "action syslog": "Log a syslog message", "priority emergencies": "System is unusable",
  "priority alerts": "Immediate action needed", "priority critical": "Critical conditions", "priority errors": "Error conditions",
  "priority warnings": "Warning conditions", "priority notifications": "Normal but significant conditions",
  "priority informational": "Informational messages", "priority debugging": "Debugging messages", msg: "Specify the syslog message",
  "ipv4 auth-port": "UDP port for RADIUS authentication server (default is 1812)", "auth-port acct-port": "UDP port for RADIUS accounting server (default is 1813)",
  "level 5": "Specifies an ENCRYPTED secret will follow", "monitor input": "Apply Flow Monitor on input traffic",
  "monitor output": "Apply Flow Monitor on output traffic", "flow-export version 1": "Version 1 export format",
  "flow-export version 5": "Version 5 export format", "flow-export version 9": "Version 9 export format",
  "key 0": "Specifies an UNENCRYPTED key will follow", "key 7": "Specifies HIDDEN key will follow",
  "protocol dns": "Domain Name Server lookup", "protocol https": "Secure Hypertext Transfer Protocol",
  "protocol snmp": "Simple Network Management Protocol", "protocol http": "World Wide Web traffic", "protocol icmp": "Internet Control Message Protocol",
  "protocol ip": "IP", "protocol telnet": "Telnet", "protocol ssh": "Secure Shell Protocol", "protocol ntp": "Network Time Protocol",
  "md5 7": "Encryption type", "tacacs server": "Server configuration", "flow export": "Display export statistics",
  "auth read": "specify a read view for the group", "noauth read": "specify a read view for the group", "priv read": "specify a read view for the group",
  "version 3 auth": "Use the SNMPv3 authNoPriv Security Level", "version 3 noauth": "Use the SNMPv3 noAuthNoPriv Security Level",
  "version 3 priv": "Use the SNMPv3 authPriv Security Level", "ifindex persist": "Persist interface indices",
  "aes 128": "Use 128 bit AES algorithm for encryption", "aes 192": "Use 192 bit AES algorithm for encryption",
  "aes 256": "Use 256 bit AES algorithm for encryption", included: "MIB family is included in the view",
  excluded: "MIB family is excluded from the view", "transport udp": "UDP transport protocol",
  "accounting exec": "For starting an exec (shell).", "session-id common": "Common Session ID",
});
Object.assign(HELP, { tacacs: "Modify TACACS query parameters", msg: "Specify the syslog message",
  included: "MIB family is included in the view", excluded: "MIB family is excluded from the view" });
// Words inside an AAA method list, whatever came before them.
{
  const METHOD_HELP = { local: "Use local username authentication.", "local-case": "Use case-sensitive local username authentication.",
    enable: "Use enable password for authentication.", line: "Use line password for authentication.", none: "NO authentication.",
    group: "Use Server-group", "if-authenticated": "Succeed if user has authenticated." };
  for (const prev of ["default", "login", "exec", "local", "local-case", "enable", "line", "none", "radius", "tacacs+", "group", "if-authenticated"]) {
    for (const [m, h] of Object.entries(METHOD_HELP)) if (!(prev === "login" && m === "local")) HELP_PATH[prev + " " + m] = h;
  }
  HELP_PATH["login local"] = "Use local username authentication.";
}
Object.assign(HELP_PATH, {
  "authentication local": "Use local username and passwords", "policy-map interface input": "Input policy",
  "policy-map interface output": "Output policy", "match interface input": "Input interface", "collect interface output": "Output interface",
});
Object.assign(HELP_MODE, { config: { ...(HELP_MODE.config || {}), lldp: "Global LLDP configuration subcommands" } });
for (const m of ["subif", "range"]) HELP_MODE[m] = { ...(HELP_MODE[m] || {}), "service-policy": "Configure CPL Service Policy", lldp: "LLDP interface subcommands" };

const HELP_POLICY = { description: "Policy-Map description" };
Object.assign(HELP_MODE, {
  cmap: { description: "Class-Map description", match: "classification criteria", "match any": "Any packets",
    "match dscp": "Match DSCP in IPv4 and IPv6 packets", "match precedence": "Match Precedence in IPv4 and IPv6 packets",
    "match access-group": "Access group", "match access-group name": "Named Access List", "match protocol": "Protocol" },
  pmap: { ...HELP_POLICY, class: "policy criteria" },
  pmapc: { bandwidth: "Bandwidth", priority: "Strict Scheduling Priority for this Class", set: "Set QoS values", police: "Police",
    shape: "Traffic Shaping", "service-policy": "Configure Flow Next", description: "Policy-Map class description" },
  police: { "conform-action": "action when rate is less than conform burst", "exceed-action": "action when rate is within conform and conform + exceed burst",
    "violate-action": "action when rate is greater than conform + exceed burst" },
  flowrec: { match: "Specify a key field", collect: "Specify a non-key field", description: "Provide a description for this Flow Record" },
  flowexp: { destination: "Export destination configuration", source: "Originating interface", transport: "Transport protocol",
    "export-protocol": "Export protocol version", description: "Provide a description for this Flow Exporter" },
  flowmon: { record: "Specify flow record name", exporter: "Add an exporter", cache: "Configure Flow Cache parameters",
    description: "Provide a description for this Flow Monitor" },
  applet: { event: "Add or modify event information", action: "Add or modify an action statement", description: "Add or modify an applet description" },
  radsrv: { address: "Specify the radius server address", key: "Per-server encryption key" },
  tacsrv: { address: "Specify the tacacs server address", key: "Per-server encryption key" },
  sgrad: { server: "Specify a RADIUS server" }, sgtac: { server: "Specify a TACACS+ server" },
});
for (const [m, h] of [["if", { "service-policy": "Configure CPL Service Policy", lldp: "LLDP interface subcommands" }],
  ["line", { login: "Enable password checking" }]]) HELP_MODE[m] = { ...(HELP_MODE[m] || {}), ...h };

const svcOf = (d) => d.cfg.svc;
const ifSvc = (d, ifn) => (d.cfg.intfs[ifn] && d.cfg.intfs[ifn].svc) || newSvcIf();
const levelName = (n) => SEVERITIES[n];

Object.assign(Network.prototype, {
  // -- one-way and round-trip UDP reachability (syslog, traps, NetFlow export, NTP) ---------
  svcUdp(dn, dst, port, srcIf, both = false) {
    const d = this.devs[dn];
    let src = null;
    if (srcIf && d.cfg.intfs[srcIf]) { const a = this.ifAddr(dn, srcIf); src = a && this.ifUp(dn, srcIf) ? a.ip : null; }
    if (src === null) src = this.sourceIp(dn, dst);
    if (src === null) return false;
    if (this.ownsIp(dn, dst)) return true;
    const there = this.deliver(dn, { src, dst, proto: "udp", port, id: 1 }, { natTmp: {} });
    if (!there.ok) return false;
    if (!both) return true;
    const back = this.deliver(there.at, { src: there.pkt.dst, dst: there.pkt.src, proto: "udp", port, id: 1 }, { natTmp: {} });
    return back.ok && back.at === dn;
  },

  // -- syslog -----------------------------------------------------------------------------
  // The clock a device shows: an NTP client follows the master at the top of its chain.
  svcClock(dn) {
    const st = this.svcNtp()[dn];
    let root = dn;
    for (let k = 0; k < 16 && st && this.svcNtp()[root] && this.svcNtp()[root].peerDev; k++) root = this.svcNtp()[root].peerDev;
    return { offset: this.devs[root].rt.clockOffset || 0, synced: !!(st && st.stratum < 16) };
  },

  svcStamp(dn, sev) {
    const d = this.devs[dn], s = svcOf(d), r = d.rt.svc;
    const kind = sev === 7 ? s.ts.debug : s.ts.log;
    let p = "";
    if (s.seq) p += String(r.seq).padStart(6, "0") + ": ";
    if (kind === "datetime") {
      const c = this.svcClock(dn);
      p += (c.synced ? "" : "*") + clock(c.offset) + ": ";
    } else if (kind === "uptime") {
      const up = Math.floor((Date.now() - r.boot) / 1000);
      p += [Math.floor(up / 3600), Math.floor(up / 60) % 60, up % 60].map((x) => String(x).padStart(2, "0")).join(":") + ": ";
    }
    return p;
  },

  // Every message a device raises goes through here: buffer, syslog hosts, SNMP traps.
  // Returns [{sev, text}] with each message stamped the way the device stamps it.
  svcLog(dn, msgs) {
    const d = this.devs[dn];
    if (d.type === "pc") return [];
    const s = svcOf(d), r = d.rt.svc, L = s.logging, out = [];
    for (const m of msgs) {
      const sev = sevOf(m);
      r.seq++;
      const text = this.svcStamp(dn, sev) + m;
      out.push({ sev, text, raw: m });
      if (!L.on) continue;
      if (L.console !== null && sev <= L.console) r.counts.console++;
      if (L.buffered && sev <= L.buffered.level) {
        r.counts.buffer++;
        r.log.push(text);
        let size = r.log.reduce((n, x) => n + x.length + 1, 0);
        while (size > L.buffered.size && r.log.length) size -= r.log.shift().length + 1;
      }
      if (sev <= L.trap) {
        for (const h of L.hosts) {
          if (this.svcUdp(dn, h, 514, L.source)) { r.counts.hosts[h] = (r.counts.hosts[h] || 0) + 1; r.counts.trap++; }
        }
      }
      // linkUp/linkDown and config-change notifications.
      const sn = s.snmp;
      if (sn.traps !== null && sn.hosts.length) {
        const types = sn.traps;
        const link = /^%LINK-(3-UPDOWN|5-CHANGED)/.test(m), conf = /^%SYS-5-CONFIG_I/.test(m);
        const want = (link && (types === "" || /\bsnmp\b|\blinkup\b|\blinkdown\b/.test(types))) || (conf && (types === "" || /\bconfig\b/.test(types)));
        if (want) for (const h of sn.hosts) if (this.svcUdp(dn, h.ip, 162, null)) r.traps[n2ip(h.ip)] = (r.traps[n2ip(h.ip)] || 0) + 1;
      }
    }
    return out;
  },

  // -- QoS ----------------------------------------------------------------------------------
  svcClassMatch(dn, cls, pkt) {
    if (!cls) return false;
    const test = (m) => {
      switch (m.kind) {
        case "any": return true;
        case "dscp": return m.vals.includes(pkt.dscp || 0);
        case "prec": return m.vals.includes((pkt.dscp || 0) >> 3);
        case "acl": return !!this.devs[dn].cfg.acls && !!this.devs[dn].cfg.acls[m.name] && this.aclPermits(dn, m.name, pkt, false);
        case "proto": return m.name === "ip" || pkt.proto === m.name
          || ({ http: 80, https: 443, telnet: 23, ssh: 22, dns: 53, ntp: 123, snmp: 161 })[m.name] === pkt.port;
        default: return false;
      }
    };
    const res = cls.matches.map((m) => (m.not ? !test(m) : test(m)));
    if (!res.length) return false;
    return cls.any ? res.some(Boolean) : res.every(Boolean);
  },

  // Run a policy on a packet. Returns false when a policer drops it. Counters only count recorded traffic.
  svcPolicy(dn, ifn, dir, name, pkt, opts, depth = 0) {
    const d = this.devs[dn], q = svcOf(d).qos, pol = q.policies[name];
    if (!pol || depth > 2) return true;
    const size = (pkt.size || 100) + 14;
    const classes = [...pol.classes.filter((c) => c.name !== "class-default"), pol.classes.find((c) => c.name === "class-default") || { name: "class-default", act: {} }];
    for (const c of classes) {
      if (c.name !== "class-default" && !this.svcClassMatch(dn, q.classes[c.name], pkt)) continue;
      const key = `${ifn}|${dir}|${name}|${c.name}`;
      const ctr = opts.record ? (d.rt.svc.qos[key] = d.rt.svc.qos[key] || { pkts: 0, bytes: 0, marked: 0, conf: [0, 0], exc: [0, 0], drops: 0 }) : null;
      if (ctr) { ctr.pkts++; ctr.bytes += size; }
      const a = c.act || {};
      if (a.dscp !== undefined && a.dscp !== null) { pkt.dscp = a.dscp; if (ctr) ctr.marked++; }
      if (a.prec !== undefined && a.prec !== null) { pkt.dscp = a.prec << 3; if (ctr) ctr.marked++; }
      if (a.police) {
        const p = a.police, buckets = opts.qosBuckets || (opts.qosBuckets = {});
        const b = buckets[key] || (buckets[key] = { tokens: p.bc, t: 0 });
        const now = (opts.seq || 0) * 0.002;
        b.tokens = Math.min(p.bc, b.tokens + (p.cir / 8) * Math.max(0, now - b.t));
        b.t = now;
        const conform = size <= b.tokens;
        if (conform) b.tokens -= size;
        const act = conform ? p.conform : p.exceed;
        if (ctr) { const x = conform ? ctr.conf : ctr.exc; x[0]++; x[1] += size; }
        if (act.kind === "drop") { if (ctr) ctr.drops++; return false; }
        if (act.kind === "set-dscp-transmit") pkt.dscp = act.dscp;
      }
      if (a.child && !this.svcPolicy(dn, ifn, dir, a.child, pkt, opts, depth + 1)) return false;
      return true;
    }
    return true;
  },

  // A router receiving a packet on ifn. Returns false to drop it.
  svcIngress(dn, ifn, pkt, opts) {
    const d = this.devs[dn];
    if (d.type !== "router" || !d.cfg.intfs[ifn]) return true;
    const s = ifSvc(d, ifn);
    if (s.sp.input && !this.svcPolicy(dn, ifn, "input", s.sp.input, pkt, opts)) return false;
    pkt._in = { dn, ifn };
    if (this.ownsIp(dn, pkt.dst)) this.svcFlows(dn, ifn, null, pkt, opts);
    return true;
  },

  // A router sending a packet out of ifn (routed or its own). Returns false to drop it.
  svcEgress(dn, ifn, pkt, opts, originated) {
    const d = this.devs[dn];
    if (d.type !== "router" || !d.cfg.intfs[ifn]) return true;
    const s = ifSvc(d, ifn);
    if (s.sp.output && !this.svcPolicy(dn, ifn, "output", s.sp.output, pkt, opts)) return false;
    if (!originated) this.svcFlows(dn, pkt._in && pkt._in.dn === dn ? pkt._in.ifn : null, ifn, pkt, opts);
    return true;
  },

  // Frames crossing switches: with mls qos on, an ingress port that doesn't trust DSCP rewrites it to 0
  // (CoS trust on an access port also ends at 0: untagged frames carry CoS 0). Input policies mark.
  svcTrail(trail, pkt, opts) {
    for (const hop of trail) {
      const sw = this.devs[hop.b];
      if (sw.type !== "switch" || !sw.cfg.intfs[hop.bp]) continue;
      const s = ifSvc(sw, hop.bp);
      if (svcOf(sw).qos.mls) {
        const trust = s.trust;
        if (trust === "dscp") { /* kept */ } else if (trust === "ip-precedence") pkt.dscp = ((pkt.dscp || 0) >> 3) << 3;
        else if (trust === "cos") pkt.dscp = hop.vlan !== null && this.swMode(sw, hop.bp) === "trunk" ? pkt.dscp || 0 : 0;
        else pkt.dscp = 0;
      }
      if (s.sp.input && !this.svcPolicy(hop.b, hop.bp, "input", s.sp.input, pkt, opts)) return false;
    }
    return true;
  },

  // -- NetFlow -----------------------------------------------------------------------------
  svcFlows(dn, inIf, outIf, pkt, opts) {
    if (!opts.record) return;
    const d = this.devs[dn], rt = d.rt.svc, f = svcOf(d).flow, size = (pkt.size || 100);
    const add = (store, key, base) => {
      const e = store[key] || (store[key] = { ...base, pkts: 0, bytes: 0, first: Date.now() - rt.boot });
      if (!e.pkts) this.svcExport(dn, base.mon);
      e.pkts++;
      e.bytes += size;
      e.last = Date.now() - rt.boot;
    };
    const base = { src: pkt.src, dst: pkt.dst, proto: pkt.proto, tos: (pkt.dscp || 0) << 2, sport: 0,
      dport: pkt.proto === "icmp" ? (pkt.icmp === "echo-reply" ? 0 : 0x0800) : pkt.port || 0, inIf, outIf };
    const trad = (inIf && ifSvc(d, inIf).flowIn) || (outIf && ifSvc(d, outIf).flowOut);
    if (trad) add(rt.tflows, [base.src, base.dst, base.proto, base.dport, inIf, outIf].join("|"), { ...base, mon: null });
    const mons = [...(inIf ? ifSvc(d, inIf).mon.input.map((m) => [m, "input"]) : []), ...(outIf ? ifSvc(d, outIf).mon.output.map((m) => [m, "output"]) : [])];
    for (const [m] of mons) {
      const mon = f.monitors[m], rec = mon && f.records[mon.record];
      if (!rec) continue;
      const key = rec.match.map((field) => flowField(field, base)).join("|");
      const store = rt.flows[m] || (rt.flows[m] = {});
      add(store, key, { ...base, mon: m });
    }
  },

  svcExport(dn, mon) {
    const d = this.devs[dn], f = svcOf(d).flow, rt = d.rt.svc;
    if (mon) {
      const m = f.monitors[mon];
      for (const x of (m && m.exporters) || []) {
        const e = f.exporters[x];
        if (e && e.dst !== null && this.svcUdp(dn, e.dst, e.port, e.src)) rt.exported[x] = (rt.exported[x] || 0) + 1;
      }
    } else if (f.exportDst && this.svcUdp(dn, f.exportDst.ip, f.exportDst.port, f.exportSrc)) {
      rt.exported["(traditional)"] = (rt.exported["(traditional)"] || 0) + 1;
    }
  },

  // -- NTP -------------------------------------------------------------------------------------
  // {device: {stratum, peer (address), peerDev, master, assoc: [{ip, ref, st, reach, sel}]}}
  svcNtp() {
    if (this.c.svcNtp) return this.c.svcNtp;
    const out = {};
    const ios = Object.values(this.devs).filter((d) => d.type !== "pc");
    for (const d of ios) {
      const n = svcOf(d).ntp;
      out[d.name] = n.master !== null ? { stratum: n.master, peer: null, peerDev: null, master: true } : { stratum: 16, peer: null, peerDev: null, master: false };
    }
    this.c.svcNtp = out; // provisional, so nested lookups during the passes see something
    const reach = {};
    const reachable = (d, s) => {
      const k = d.name + "|" + s.ip;
      if (reach[k] === undefined) reach[k] = this.svcUdp(d.name, s.ip, 123, svcOf(d).ntp.source, true);
      return reach[k];
    };
    const authOk = (d, s, owner) => {
      const n = svcOf(d).ntp;
      if (!n.auth) return true;
      if (s.key === null || !n.trusted.includes(s.key) || n.keys[s.key] === undefined) return false;
      return svcOf(owner).ntp.keys[s.key] === n.keys[s.key];
    };
    for (let pass = 0; pass < 16; pass++) {
      let changed = false;
      for (const d of ios) {
        const n = svcOf(d).ntp, me = out[d.name];
        let best = null;
        const assoc = [];
        for (const s of n.servers) {
          const ownerName = this.ownerOf(s.ip), owner = ownerName && this.devs[ownerName];
          const up = !!owner && owner.type !== "pc" && ownerName !== d.name && reachable(d, s);
          const st = up ? out[ownerName].stratum : 16;
          const ok = up && st < 15 && authOk(d, s, owner);
          const a = { ip: s.ip, st: up ? st : 16, reach: up ? 377 : 0, ok, prefer: s.prefer,
            ref: !up ? ".INIT." : out[ownerName].master && !out[ownerName].peer ? "127.127.1.1" : out[ownerName].peer !== null ? n2ip(out[ownerName].peer) : ".INIT.", dev: ownerName };
          assoc.push(a);
          if (ok && (!best || (a.prefer && !best.prefer) || (a.prefer === best.prefer && a.st < best.st))) best = a;
        }
        let next;
        if (best && (!n.master || best.st + 1 < n.master)) next = { stratum: best.st + 1, peer: best.ip, peerDev: best.dev, master: n.master !== null };
        else if (n.master !== null) next = { stratum: n.master, peer: null, peerDev: null, master: true };
        else next = { stratum: 16, peer: null, peerDev: null, master: false };
        next.assoc = assoc;
        if (next.stratum !== me.stratum || next.peer !== me.peer) changed = true;
        out[d.name] = next;
      }
      if (!changed) break;
    }
    return out;
  },

  // -- LLDP ------------------------------------------------------------------------------------
  svcLldp(dn) {
    const d = this.devs[dn], out = [];
    if (d.type === "pc" || !svcOf(d).lldp.run) return out;
    for (const port of d.ports) {
      const p = this.peer(dn, port);
      if (!p || !this.portUp(dn, port) || !ifSvc(d, port).lldpRx) continue;
      const pd = this.devs[p.dev];
      if (pd.type === "pc" || !svcOf(pd).lldp.run || !ifSvc(pd, p.port).lldpTx) continue;
      let addr = null;
      if (pd.type === "router") addr = this.ifAddr(p.dev, p.port);
      else { const s = this.upIfs(p.dev)[0]; addr = s ? this.ifAddr(p.dev, s) : null; }
      out.push({ local: port, dev: pd, port: p.port, ip: addr && addr.ip, hold: svcOf(pd).lldp.hold });
    }
    return out;
  },

  // -- SNMP access -------------------------------------------------------------------------------
  // Can a manager at `from` read (or write) the agent on `dn`? {ok, why}
  svcSnmpAccess(from, dn, cred, write) {
    const d = this.devs[dn], sn = svcOf(d).snmp;
    const target = this.upIfs(dn).map((n) => this.ifAddr(dn, n)).find((a) => a && this.ping(from, a.ip).ok);
    if (!target) return { ok: false, why: "unreachable" };
    const src = this.sourceIp(from, target.ip);
    if (!this.svcUdp(from, target.ip, 161, null)) return { ok: false, why: "filtered" };
    const aclOk = (acl) => !acl || !d.cfg.acls || !d.cfg.acls[acl] || this.aclPermits(dn, acl, { src, dst: target.ip, proto: "udp", port: 161 }, false);
    if (cred.community !== undefined) {
      const c = sn.communities[cred.community];
      if (!c) return { ok: false, why: "unknown community" };
      if (write && c.access !== "RW") return { ok: false, why: "read-only community" };
      if (!aclOk(c.acl)) return { ok: false, why: "access-list" };
      return { ok: true };
    }
    const u = sn.users[cred.user];
    if (!u) return { ok: false, why: "unknown user" };
    const g = sn.groups[u.group];
    if (!g) return { ok: false, why: "no group" };
    if (g.level !== "noauth" && (!u.auth || cred.auth !== u.auth.pw || (cred.authProto && cred.authProto !== u.auth.proto))) return { ok: false, why: "authentication" };
    if (g.level === "priv" && (!u.priv || cred.priv !== u.priv.pw)) return { ok: false, why: "privacy" };
    if (write && !g.write) return { ok: false, why: "no write view" };
    if (!aclOk(g.acl) || !aclOk(u.acl)) return { ok: false, why: "access-list" };
    return { ok: true };
  },
});

function flowField(field, b) {
  switch (field) {
    case "ipv4 source address": return n2ip(b.src);
    case "ipv4 destination address": return n2ip(b.dst);
    case "ipv4 protocol": return String(({ icmp: 1, tcp: 6, udp: 17 })[b.proto] ?? 0);
    case "ipv4 tos": return "0x" + hex(b.tos, 2).toUpperCase();
    case "transport source-port": return String(b.sport);
    case "transport destination-port": return String(b.dport);
    case "interface input": return b.inIf ? shortIf(b.inIf) : "Null";
    case "interface output": return b.outIf ? shortIf(b.outIf) : "Null";
    default: return "";
  }
}

const FLOW_COLS = {
  "ipv4 source address": "IPV4 SOURCE ADDRESS", "ipv4 destination address": "IPV4 DESTINATION ADDRESS", "ipv4 protocol": "IP PROT",
  "ipv4 tos": "IP TOS", "transport source-port": "TRNS SOURCE PORT", "transport destination-port": "TRNS DESTINATION PORT",
  "interface input": "INTF INPUT", "interface output": "INTF OUTPUT",
};

// -- login: AAA method lists, local users and privilege levels -----------------------------------
// The methods a login on `line` ("con" or "vty") goes through, or null without AAA.
function loginMethods(d, lineKey) {
  const a = svcOf(d).aaa;
  if (!a.on) return null;
  const l = lineKey === "con" ? d.cfg.lines.con : d.cfg.lines.vty0;
  const name = l.authList || "default";
  if (a.authen[name]) return a.authen[name];
  // No default list: the console needs nothing, VTYs use the local database. A named list that
  // doesn't exist leaves the line with no way in.
  if (name === "default") return lineKey === "con" ? ["none"] : ["local"];
  return [];
}

// Does this method list prompt for a username first?
const wantsUser = (methods) => !!methods.find((m) => m !== "none") && /^(local|local-case|group )/.test(methods.find((m) => m !== "none"));

// One attempt: {ok, level, user}. Group methods fail over: no AAA server answers in the lab.
function authenticate(net, d, lineKey, user, pw) {
  const methods = loginMethods(d, lineKey);
  const s = svcOf(d), a = s.aaa;
  const local = (u, p) => {
    const x = d.cfg.users[u];
    return x && (x.secret ?? x.password) === p ? { ok: true, level: x.priv ?? 1, user: u } : { ok: false };
  };
  if (!methods) return null;
  for (const m of methods) {
    if (m === "none") return { ok: true, level: 1, user };
    if (m === "local" || m === "local-case") {
      if (!Object.keys(d.cfg.users).length) continue; // an empty database is an error: try the next method
      return local(user, pw);
    }
    if (m === "enable") {
      const e = d.cfg.enableSecret ?? d.cfg.enablePassword;
      if (e === null) continue;
      return e === pw ? { ok: true, level: 1, user } : { ok: false };
    }
    if (m === "line") {
      const l = lineKey === "con" ? d.cfg.lines.con : d.cfg.lines.vty0;
      if (l.password === null) continue;
      return l.password === pw ? { ok: true, level: 1, user } : { ok: false };
    }
    if (m.startsWith("group ")) continue; // servers unreachable: ERROR, fall through to the next method
  }
  return { ok: false, none: true };
}

// The privilege level a successful login lands at.
function loginLevel(d, lineKey, res) {
  const a = svcOf(d).aaa;
  const u = res.user && d.cfg.users[res.user];
  if (!a.on) return u && u.priv !== undefined ? u.priv : 1;
  const author = a.author.default;
  // Exec authorization isn't applied on the console unless "aaa authorization console" is set.
  if (!author || (lineKey === "con" && !a.console)) return 1;
  if (author.includes("local") || author.includes("if-authenticated")) return u && u.priv !== undefined ? u.priv : 1;
  return 1;
}

// Expand a typed exec command to its full keywords, to compare with "privilege exec" rules.
function kwPath(tree, toks, ctx) {
  let node = tree;
  const out = [];
  for (let k = 0; k < toks.length;) {
    const w = toks[k].t.toLowerCase();
    const kws = node.kids.filter((c) => c.kw && c.kw.startsWith(w));
    let next = kws.find((c) => c.kw === w) || (kws.length === 1 ? kws[0] : null), used = 1;
    if (!next) {
      for (const c of node.kids) {
        if (!c.param) continue;
        const m = c.param.match(toks, k, ctx);
        if (m) { next = c; used = m.used; break; }
      }
    }
    if (!next) return null;
    out.push(next.kw ? next.kw : "*");
    node = next;
    k += used;
  }
  return out;
}

// -- console session: levels, logins, log output, EEM -------------------------------------------
Object.assign(Session.prototype, {
  level() { return this.f.level ?? (this.f.mode === "user" ? 1 : 15); },

  enterLevel(level) {
    this.f.level = level;
    this.enter(level >= 2 ? "priv" : "user", null);
  },

  // After each command: log every message (buffer, hosts, traps), run EEM applets that match, then
  // show this console what its logging settings let through.
  svcAfter() {
    const net = this.net, depth = this.eemDepth || 0, fmt = {};
    for (const [dn, msgs] of Object.entries(this.events)) fmt[dn] = net.svcLog(dn, msgs);
    if (depth < 3) {
      for (const [dn, msgs] of Object.entries({ ...this.events })) {
        const d = net.devs[dn];
        if (d.type === "pc") continue;
        for (const [name, ap] of Object.entries(svcOf(d).eem)) {
          if (!ap.event || ap.event.kind !== "syslog") continue;
          let re;
          try { re = new RegExp(ap.event.pattern); } catch (e) { continue; }
          const hit = msgs.find((m) => re.test(m));
          if (!hit) continue;
          const r = d.rt.svc;
          r.eemCount[name] = (r.eemCount[name] || 0) + 1;
          if (r.eemCount[name] % (ap.event.occurs || 1) !== 0) continue;
          const res = net.svcRunApplet(dn, name, depth + 1, "syslog");
          for (const [xd, xs] of Object.entries(res.events)) this.events[xd] = [...(this.events[xd] || []), ...xs];
          for (const [xd, xs] of Object.entries(res.fmt)) fmt[xd] = [...(fmt[xd] || []), ...xs];
        }
      }
    }
    this.fmt = fmt;
    this.consoleLines = {};
    for (const [dn, lines] of Object.entries(fmt)) {
      const d = net.devs[dn];
      if (d.type === "pc") continue;
      const L = svcOf(d).logging;
      this.consoleLines[dn] = L.on && L.console !== null ? lines.filter((x) => x.sev <= L.console).map((x) => x.text) : [];
    }
    for (const t of this.consoleLines[this.home] || []) this.out.push(t);
    // A VTY session sees its device's messages only after "terminal monitor".
    if (this.f.via && this.f.monitor && this.f.dev !== this.home) {
      const L = svcOf(this.d).logging;
      for (const x of fmt[this.f.dev] || []) if (L.on && L.monitor !== null && x.sev <= L.monitor) this.out.push(x.text);
    }
  },

  // An AAA login: the method list decides the prompts and the outcome.
  aaaLogin(d, lineKey, user, ok, fail, from) {
    const methods = loginMethods(d, lineKey);
    if (methods[0] === "none") { ok(1, user); return; }
    const s = svcOf(d);
    if (s.bannerLogin) this.print(s.bannerLogin);
    this.print("", "User Access Verification", "");
    let tries = 0;
    const attempt = (u) => this.ask("Password: ", { mask: true }, (pw) => {
      const r = authenticate(this.net, d, lineKey, u, pw);
      if (lineKey === "vty") this.net.svcLoginResult(d.name, u, r.ok, from);
      if (r.ok) { ok(loginLevel(d, lineKey, r), u); return; }
      this.print("", "% Authentication failed", "");
      if (++tries >= 3) { fail(); return; }
      start();
    });
    const start = () => (user === null && wantsUser(methods) ? this.ask("Username: ", {}, (u) => attempt(u.trim())) : attempt(user));
    start();
  },
});

Object.assign(Network.prototype, {
  // Watch VTY login failures for "login block-for", and log them when asked to.
  svcLoginResult(dn, user, ok, from) {
    const d = this.devs[dn], s = svcOf(d), r = d.rt.svc, now = Date.now();
    const src = from ? n2ip(from) : "0.0.0.0", at = clock().split(".")[0] + " UTC";
    if (ok) {
      if (s.onSuccess) this.note(dn, `%SEC_LOGIN-5-LOGIN_SUCCESS: Login Success [user: ${user ?? ""}] [Source: ${src}] [localport: 23] at ${at}`);
      return;
    }
    r.totalFails++;
    if (s.onFail) this.note(dn, `%SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: ${user ?? ""}] [Source: ${src}] [localport: 23] [Reason: Login Authentication Failed] at ${at}`);
    const b = s.blockFor;
    if (!b) return;
    r.fails = r.fails.filter((t) => now - t < b.within * 1000);
    r.fails.push(now);
    if (r.fails.length >= b.attempts && r.quietUntil <= now) {
      r.quietUntil = now + b.secs * 1000;
      r.fails = [];
      this.note(dn, `%SEC_LOGIN-1-QUIET_MODE_ON: Still timeleft for watching failures is ${b.within} secs, [user: ${user ?? ""}] [Source: ${src}] [localport: 23] [Reason: Login Authentication Failed] [ACL: sl_def_acl] at ${at}`);
    }
  },

  svcQuiet(dn) { return this.devs[dn].rt.svc.quietUntil > Date.now(); },

  // Run an EEM applet's actions in label order (IOS sorts the labels as text).
  svcRunApplet(dn, name, depth, why) {
    const d = this.devs[dn], ap = svcOf(d).eem[name], events = {}, fmt = {};
    const add = (map, k, xs) => { if (xs && xs.length) map[k] = [...(map[k] || []), ...xs]; };
    const s = new Session(this, dn);
    s.eemDepth = depth;
    s.eemName = name;
    for (const label of Object.keys(ap.actions).sort()) {
      const a = ap.actions[label];
      if (a.kind === "cli") {
        s.input(a.text);
        for (const [k, xs] of Object.entries(s.events || {})) add(events, k, xs);
        for (const [k, xs] of Object.entries(s.fmt || {})) add(fmt, k, xs);
      } else if (a.kind === "syslog") {
        const m = `%HA_EM-${a.prio}-LOG: ${name}: ${a.text}`;
        add(events, dn, [m]);
        add(fmt, dn, this.svcLog(dn, [m]));
      }
    }
    d.rt.svc.eem.push({ name, at: clock(), why });
    if (d.rt.svc.eem.length > 20) d.rt.svc.eem.shift();
    return { events, fmt };
  },
});

// -- small helpers for the commands below ---------------------------------------------------------
const qosOf = (c) => svcOf(c.d).qos;
const flowOf = (c) => svcOf(c.d).flow;
const eachSvcIf = (c, fn) => eachIf(c, (n, i) => { i.svc = i.svc || newSvcIf(); return fn(n, i.svc, i); });
const unquote = (t) => { const m = /^"(.*)"$/.exec(t.trim()); return m ? m[1] : t.trim(); };
const R_S = "RS";

// Passwords shorter than "security passwords min-length" are refused, as IOS does.
function minLenOk(c, pw) {
  const n = svcOf(c.d).minLen;
  if (n && pw.length < n) { c.print(`% Password too short - must be at least ${n} characters. Password configuration failed`); return false; }
  return true;
}

// Wrap the commands already defined under a keyword path so they check something first.
function guardRuns(types, modes, words, guard) {
  for (const t of types) {
    for (const m of [].concat(modes)) {
      let node = TREES[t][m];
      for (const w of words) node = node && node.kids.find((k) => k.kw === w);
      if (!node) continue;
      const visit = (n) => {
        if (n.run && !n.guarded) {
          const orig = n.run;
          n.run = (c, args) => { if (guard(c, args) !== false) orig(c, args); };
          n.guarded = true;
        }
        n.kids.forEach(visit);
      };
      visit(node);
    }
  }
}
const lastStr = (args) => [...args].reverse().find((a) => typeof a === "string") || "";
guardRuns(["router", "switch"], "config", ["enable", "secret"], (c, a) => minLenOk(c, lastStr(a)));
guardRuns(["router", "switch"], "config", ["enable", "password"], (c, a) => minLenOk(c, lastStr(a)));
guardRuns(["router", "switch"], "config", ["username"], (c, a) => (a.length >= 2 ? minLenOk(c, lastStr(a)) : true));
guardRuns(["router", "switch"], "line", ["password"], (c, a) => minLenOk(c, lastStr(a)));

// "disable" drops to level 1; "show clock" follows NTP (no leading * once synchronised).
guardRuns(["router", "switch"], "priv", ["disable"], (c) => { c.s.f.level = 1; });
for (const t of ["router", "switch"]) {
  for (const m of ["user", "priv"]) {
    const show = TREES[t][m].kids.find((k) => k.kw === "show");
    const node = show && show.kids.find((k) => k.kw === "clock");
    if (node) node.run = (c) => {
      const k = c.net.svcClock(c.d.name);
      c.print((k.synced ? "" : "*") + clock(k.offset) + " " + (c.cfg.tz ? c.cfg.tz[0] : "UTC"));
    };
    const term = TREES[t][m].kids.find((k) => k.kw === "terminal");
    const mon = term && term.kids.find((k) => k.kw === "monitor");
    if (mon) mon.run = (c) => { if (!c.s.f.via) c.print("% Console already monitors"); else c.s.f.monitor = true; };
    const no = term && term.kids.find((k) => k.kw === "no");
    const nmon = no && no.kids.find((k) => k.kw === "monitor");
    if (nmon) nmon.run = (c) => { c.s.f.monitor = false; };
  }
}

// ---- privilege levels ---------------------------------------------------------------------
def(R_S, ["user", "priv"], "enable <num:0-15|Enable level>", (c, [n]) => {
  const s = c.s, cur = s.level();
  if (n <= cur) { s.enterLevel(n); return; }
  const pw = n === 15 ? (c.cfg.enableSecret ?? c.cfg.enablePassword) : svcOf(c.d).enableLevels[n] ?? null;
  if (pw === null) {
    if (n === 15 && !s.f.via) { s.enterLevel(15); return; }
    c.print("% No password set");
    return;
  }
  let tries = 0;
  const ask = () => s.ask("Password: ", { mask: true }, (ans) => {
    if (ans === pw) { s.enterLevel(n); return; }
    if (++tries >= 3) { s.print("% Bad secrets", ""); return; }
    ask();
  });
  ask();
});
// From a level between 2 and 14, plain "enable" goes on to level 15.
def(R_S, "priv", "enable", (c) => { if (c.s.level() < 15) c.s.enable(); });
def(R_S, ["user", "priv"], "show privilege",(c) => c.print("Current privilege level is " + c.s.level()));
def(R_S, "config", "enable secret level <num:1-15|Level number> <word|The UNENCRYPTED (cleartext) 'enable' secret>", (c, [n, pw]) => {
  if (minLenOk(c, pw)) svcOf(c.d).enableLevels[n] = pw;
});
def(R_S, "config", "enable secret level <num:1-15|Level number> 5 <word|The ENCRYPTED 'enable' secret string>", (c, [n]) => {
  c.print("% Encrypted secrets can't be decoded by the simulator: set the level secret in clear text");
});
def(R_S, "config", "no enable secret level <num:1-15|Level number>", (c, [n]) => { delete svcOf(c.d).enableLevels[n]; });
def(R_S, "config", "privilege exec level <num:0-15|Privilege level> <line|Initial keywords of the command to modify>", (c, [n, text]) => {
  const toks = tokenize(text);
  const path = kwPath(TREES[c.d.type].priv, toks, c.s.ctx(text, toks));
  if (!path) { c.print("% Invalid input detected"); return; }
  const s = svcOf(c.d);
  s.privs = s.privs.filter((p) => p.path.join(" ") !== path.join(" "));
  s.privs.push({ level: n, path });
});
def(R_S, "config", "no privilege exec level <num:0-15|Privilege level> <line|Initial keywords of the command to modify>", (c, [, text]) => {
  const toks = tokenize(text);
  const path = kwPath(TREES[c.d.type].priv, toks, c.s.ctx(text, toks)) || [];
  svcOf(c.d).privs = svcOf(c.d).privs.filter((p) => p.path.join(" ") !== path.join(" "));
});

// ---- login hardening ----------------------------------------------------------------------
def(R_S, "config", "login block-for <num:1-65535|Time period in seconds> attempts <num:1-65535|Fail attempts> within <num:1-65535|Time period in seconds>",
  (c, [secs, attempts, within]) => { svcOf(c.d).blockFor = { secs, attempts, within }; });
def(R_S, "config", "no login block-for", (c) => { svcOf(c.d).blockFor = null; c.d.rt.svc.quietUntil = 0; });
def(R_S, "config", "login on-failure log", (c) => { svcOf(c.d).onFail = true; });
def(R_S, "config", "no login on-failure log", (c) => { svcOf(c.d).onFail = false; });
def(R_S, "config", "login on-success log", (c) => { svcOf(c.d).onSuccess = true; });
def(R_S, "config", "no login on-success log", (c) => { svcOf(c.d).onSuccess = false; });
def(R_S, "config", "security passwords min-length <num:0-16|Minimum length of a configured password>", (c, [n]) => { svcOf(c.d).minLen = n; });
def(R_S, "config", "no security passwords min-length", (c) => { svcOf(c.d).minLen = 0; });
def(R_S, ["user", "priv"], "show login", (c) => {
  const s = svcOf(c.d), r = c.d.rt.svc, b = s.blockFor, now = Date.now();
  const L = ["     A login delay of 1 seconds is applied.", "     No Quiet-Mode access list has been configured.", ""];
  if (!b) L.push("     Router NOT enabled to watch for login Attacks");
  else {
    L.push("     Router enabled to watch for login Attacks.", `     If more than ${b.attempts} login failures occur in ${b.within} seconds or less,`,
      `     logins will be disabled for ${b.secs} seconds.`, "");
    if (r.quietUntil > now) L.push(`     Router presently in Quiet-Mode.`, `     Will remain in Quiet-Mode for ${Math.ceil((r.quietUntil - now) / 1000)} seconds.`, "     Denying logins from all sources.");
    else {
      const recent = r.fails.filter((t) => now - t < b.within * 1000);
      L.push("     Router presently in Normal-Mode.", "     Current Watch Window", `         Time remaining: ${recent.length ? Math.max(1, b.within - Math.floor((now - recent[0]) / 1000)) : b.within} seconds.`,
        `         Login failures for current window: ${recent.length}.`);
    }
    L.push(`     Total login failures: ${r.totalFails}.`);
  }
  c.print(L.join("\n"));
});
def(R_S, "priv", "show login failures", (c) => c.print(c.d.rt.svc.totalFails ? `Total failed logins: ${c.d.rt.svc.totalFails}` : "*** No logged failed login attempts with the device.***"));

// ---- banners ------------------------------------------------------------------------------
function svcBanner(c, key, text) {
  const s = svcOf(c.d);
  const delim = text.startsWith("^C") ? "^C" : text[0];
  const rest = text.slice(delim.length);
  const end = rest.indexOf(delim);
  if (end >= 0) { s[key] = rest.slice(0, end).trim(); return; }
  c.print(`Enter TEXT message.  End with the character '${delim}'.`);
  const lines = rest.trim() ? [rest.trim()] : [];
  const more = () => c.s.ask("", {}, (l) => {
    const k = l.indexOf(delim);
    if (k < 0) { lines.push(l); more(); return; }
    lines.push(l.slice(0, k));
    s[key] = lines.join("\n").replace(/^\n+|\n+$/g, "");
  });
  more();
}
def(R_S, "config", "banner login <line|c  banner-text c, where 'c' is a delimiting character>", (c, [t]) => svcBanner(c, "bannerLogin", t));
def(R_S, "config", "banner exec <line|c  banner-text c, where 'c' is a delimiting character>", (c, [t]) => svcBanner(c, "bannerExec", t));
def(R_S, "config", "no banner login", (c) => { svcOf(c.d).bannerLogin = ""; });
def(R_S, "config", "no banner exec", (c) => { svcOf(c.d).bannerExec = ""; });

// ---- AAA ----------------------------------------------------------------------------------
const AAA_METHODS = ["local", "local-case", "enable", "line", "none", "group radius", "group tacacs+", "group <word|Server-group name>"];
function aaaLists(prefix, methods, depth, fn) {
  const walk = (spec, n) => {
    if (n >= depth) return;
    for (const m of methods) {
      const s = spec + " " + m;
      def(R_S, "config", s, fn);
      walk(s, n + 1);
    }
  };
  walk(prefix, 0);
}
const methodsOf = (c) => {
  const toks = c.toks.map((t) => t.t);
  const out = [];
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i].toLowerCase();
    const full = ["local", "local-case", "enable", "line", "none", "group", "if-authenticated"].find((x) => x.startsWith(w) && (x !== "local" || !"local-case".startsWith(w) || w === "local" || w.length <= 5));
    if (full === "group") { const g = toks[++i]; out.push("group " + (/^r/i.test(g) && "radius".startsWith(g.toLowerCase()) ? "radius" : /^t/i.test(g) && "tacacs+".startsWith(g.toLowerCase()) ? "tacacs+" : g)); }
    else if (full) out.push(full);
  }
  return out;
};
def(R_S, "config", "aaa new-model", (c) => { svcOf(c.d).aaa.on = true; });
def(R_S, "config", "no aaa new-model", (c) => { const a = svcOf(c.d).aaa; Object.assign(a, { on: false, authen: {}, author: {}, console: false }); });
for (const list of ["default", "<word|Named authentication list (max 31 characters, longer will be rejected).>"]) {
  aaaLists("aaa authentication login " + list, AAA_METHODS, 3, (c) => {
    const a = svcOf(c.d).aaa;
    if (!a.on) { c.print("% AAA must be enabled first: use \"aaa new-model\""); return; }
    const name = c.toks[3].t.toLowerCase() === "default" ? "default" : c.toks[3].t;
    a.authen[name] = methodsOf({ toks: c.toks.slice(4) });
  });
  def(R_S, "config", "no aaa authentication login " + list, (c) => { delete svcOf(c.d).aaa.authen[c.toks[4].t.toLowerCase() === "default" ? "default" : c.toks[4].t]; });
  aaaLists("aaa authorization exec " + list, ["local", "none", "if-authenticated", "group radius", "group tacacs+"], 2, (c) => {
    const a = svcOf(c.d).aaa;
    if (!a.on) { c.print("% AAA must be enabled first: use \"aaa new-model\""); return; }
    a.author[c.toks[3].t.toLowerCase() === "default" ? "default" : c.toks[3].t] = methodsOf({ toks: c.toks.slice(4) });
  });
  def(R_S, "config", "no aaa authorization exec " + list, (c) => { delete svcOf(c.d).aaa.author[c.toks[4].t.toLowerCase() === "default" ? "default" : c.toks[4].t]; });
}
def(R_S, "config", "aaa authorization console", (c) => { svcOf(c.d).aaa.console = true; });
def(R_S, "config", "no aaa authorization console", (c) => { svcOf(c.d).aaa.console = false; });
def(R_S, "config", "aaa session-id common", () => {});
def(R_S, "config", "aaa accounting exec default start-stop group {radius|tacacs+}", () => {});
for (const kind of ["radius", "tacacs"]) {
  def(R_S, "config", `${kind} server <word|Name for the ${kind} server configuration>`, (c, [n]) => {
    const a = svcOf(c.d).aaa;
    a.servers[n] = a.servers[n] || { kind, ip: null, key: null };
    c.s.enter(kind === "radius" ? "radsrv" : "tacsrv", n);
  });
  def(R_S, "config", `no ${kind} server <word|Name for the ${kind} server configuration>`, (c, [n]) => { delete svcOf(c.d).aaa.servers[n]; });
  const m = kind === "radius" ? "radsrv" : "tacsrv";
  def(R_S, m, "address ipv4 <ip|IPv4 address of the server>", (c, [ip]) => { svcOf(c.d).aaa.servers[c.target].ip = ip; });
  if (kind === "radius") def(R_S, m, "address ipv4 <ip|IPv4 address of the server> auth-port <num:0-65535|UDP port> acct-port <num:0-65535|UDP port>", (c, [ip]) => { svcOf(c.d).aaa.servers[c.target].ip = ip; });
  def(R_S, m, "key <word|The UNENCRYPTED (cleartext) server key>", (c, [k]) => { svcOf(c.d).aaa.servers[c.target].key = k; });
  def(R_S, m, "key 0 <word|The UNENCRYPTED (cleartext) server key>", (c, [k]) => { svcOf(c.d).aaa.servers[c.target].key = k; });
  def(R_S, m, "key 7 <word|The HIDDEN server key>", (c, [k]) => { svcOf(c.d).aaa.servers[c.target].key = type7decode(k); });
  def(R_S, m, "exit", (c) => c.s.enter("config", null));
  def(R_S, "config", `aaa group server ${kind === "radius" ? "radius" : "tacacs+"} <word|Server group name>`, (c, [n]) => {
    const a = svcOf(c.d).aaa;
    a.groups[n] = a.groups[n] || { kind, servers: [] };
    c.s.enter(kind === "radius" ? "sgrad" : "sgtac", n);
  });
  def(R_S, "config", `no aaa group server ${kind === "radius" ? "radius" : "tacacs+"} <word|Server group name>`, (c, [n]) => { delete svcOf(c.d).aaa.groups[n]; });
  const g = kind === "radius" ? "sgrad" : "sgtac";
  def(R_S, g, "server name <word|Name of server>", (c, [n]) => { const x = svcOf(c.d).aaa.groups[c.target]; if (!x.servers.includes(n)) x.servers.push(n); });
  def(R_S, g, "no server name <word|Name of server>", (c, [n]) => { const x = svcOf(c.d).aaa.groups[c.target]; x.servers = x.servers.filter((s) => s !== n); });
  def(R_S, g, "exit", (c) => c.s.enter("config", null));
}
def(R_S, "line", "login authentication default", (c) => eachLine(c, (l) => { l.authList = null; }));
def(R_S, "line", "login authentication <word|Use an authentication list with this name.>", (c, [n]) => {
  const a = svcOf(c.d).aaa;
  if (!a.on) { c.print("% AAA must be enabled first: use \"aaa new-model\""); return; }
  if (!a.authen[n]) c.print(`% AAA: Warning, authentication list "${n}" is not defined for LOGIN.`);
  eachLine(c, (l) => { l.authList = n; });
});
def(R_S, "line", "no login authentication", (c) => eachLine(c, (l) => { l.authList = null; }));
def(R_S, "priv", "show aaa servers", (c) => {
  const L = [];
  let id = 0;
  for (const [n, s] of Object.entries(svcOf(c.d).aaa.servers)) {
    L.push(`${s.kind === "radius" ? "RADIUS" : "TACACS+"}: id ${++id}, priority ${id}, host ${s.ip !== null ? n2ip(s.ip) : "(none)"}, ${s.kind === "radius" ? "auth-port 1812, acct-port 1813" : "port 49"}, hostname ${n}`,
      "     State: current DEAD, duration 30s, previous duration 0s", "     Dead: total time 30s, count 1",
      "     Authen: request 0, timeouts 3, failover 1, retransmission 2", "             Response: accept 0, reject 0, challenge 0", "");
  }
  c.print(L.length ? L.join("\n") : "");
});
def(R_S, "priv", "show aaa method-lists authentication", (c) => {
  const a = svcOf(c.d).aaa, L = ["authen queue=AAA_ML_AUTHEN_LOGIN"];
  let id = 0;
  for (const [n, ms] of Object.entries(a.authen)) {
    L.push(`  name=${n} valid=TRUE id=${hex(id++, 8).toUpperCase()} :state=ALIVE : ${ms.map((m) => (m.startsWith("group ") ? "SERVER_GROUP " + m.slice(6) : m.toUpperCase())).join(" ")}`);
  }
  c.print(L.join("\n"));
});

// ---- name resolution and HTTP -----------------------------------------------------------------
def(R_S, "config", "ip host <word|Name of host> <ip|Host IP address>", (c, [n, ip]) => { svcOf(c.d).hosts[n] = ip; });
def(R_S, "config", "no ip host <word|Name of host>", (c, [n]) => { delete svcOf(c.d).hosts[n]; });
def(R_S, "config", "ip name-server <ip|Domain server IP address (maximum of 6)>", (c, [ip]) => {
  const s = svcOf(c.d);
  if (!s.nameServers.includes(ip) && s.nameServers.length < 6) s.nameServers.push(ip);
});
def(R_S, "config", "no ip name-server <ip|Domain server IP address (maximum of 6)>", (c, [ip]) => { const s = svcOf(c.d); s.nameServers = s.nameServers.filter((x) => x !== ip); });
def(R_S, ["user", "priv"], "show hosts", (c) => {
  const s = svcOf(c.d);
  const L = [`Default domain is ${c.cfg.domain || "not set"}`, `Name/address lookup uses ${c.cfg.domainLookup ? "domain service" : "static mappings"}`,
    `Name servers are ${s.nameServers.length ? s.nameServers.map(n2ip).join(", ") : "255.255.255.255"}`, "",
    "Codes: UN - unknown, EX - expired, OK - OK, ?? - revalidate", "       temp - temporary, perm - permanent", "       NA - Not Applicable None - Not defined", "",
    "Host                      Port  Flags      Age Type   Address(es)"];
  for (const [n, ip] of Object.entries(s.hosts)) L.push(pad(n, 26) + pad("None", 6) + pad("(perm, OK)", 11) + pad("0", 4) + pad("IP", 7) + n2ip(ip));
  c.print(L.join("\n"));
});
def(R_S, "config", "ip http server", (c) => { svcOf(c.d).http.server = true; });
def(R_S, "config", "no ip http server", (c) => { svcOf(c.d).http.server = false; });
def(R_S, "config", "ip http secure-server", (c) => { svcOf(c.d).http.secure = true; });
def(R_S, "config", "no ip http secure-server", (c) => { svcOf(c.d).http.secure = false; });
def(R_S, "config", "ip http authentication local", () => {});
def(R_S, ["user", "priv"], "ping <word|Ping destination address or hostname>", (c, [name]) => {
  const ip = svcOf(c.d).hosts[name];
  if (ip === undefined) {
    c.print(c.cfg.domainLookup && svcOf(c.d).nameServers.length ? `Translating "${name}"...domain server (${n2ip(svcOf(c.d).nameServers[0])})` : "",
      `% Unrecognized host or address, or protocol not running.`);
    return;
  }
  c.s.ping(ip, null, 5);
});

// ---- syslog ---------------------------------------------------------------------------------
const LV = "<sev|Logging severity level>";
const logOf = (c) => svcOf(c.d).logging;
def(R_S, "config", "logging host <ip|IP address of the syslog server>", (c, [ip]) => { const L = logOf(c); if (!L.hosts.includes(ip)) L.hosts.push(ip); });
def(R_S, "config", "logging <ip|IP address of the logging host>", (c, [ip]) => { const L = logOf(c); if (!L.hosts.includes(ip)) L.hosts.push(ip); });
def(R_S, "config", "no logging host <ip|IP address of the syslog server>", (c, [ip]) => { const L = logOf(c); L.hosts = L.hosts.filter((x) => x !== ip); });
def(R_S, "config", "logging trap " + LV, (c, [n]) => { logOf(c).trap = n; });
def(R_S, "config", "logging trap", (c) => { logOf(c).trap = 6; });
def(R_S, "config", "no logging trap", (c) => { logOf(c).trap = 6; });
def(R_S, "config", "logging console " + LV, (c, [n]) => { logOf(c).console = n; });
def(R_S, "config", "logging console", (c) => { logOf(c).console = 7; });
def(R_S, "config", "no logging console", (c) => { logOf(c).console = null; });
def(R_S, "config", "logging monitor " + LV, (c, [n]) => { logOf(c).monitor = n; });
def(R_S, "config", "no logging monitor", (c) => { logOf(c).monitor = null; });
def(R_S, "config", "logging buffered", (c) => { logOf(c).buffered = { size: 8192, level: 7 }; });
def(R_S, "config", "logging buffered <num:4096-2147483647|Logging buffer size>", (c, [n]) => { logOf(c).buffered = { size: n, level: (logOf(c).buffered || { level: 7 }).level }; });
def(R_S, "config", "logging buffered <num:4096-2147483647|Logging buffer size> " + LV, (c, [n, l]) => { logOf(c).buffered = { size: n, level: l }; });
def(R_S, "config", "logging buffered " + LV, (c, [l]) => { logOf(c).buffered = { size: (logOf(c).buffered || { size: 8192 }).size, level: l }; });
def(R_S, "config", "no logging buffered", (c) => { logOf(c).buffered = null; c.d.rt.svc.log = []; });
def(R_S, "config", "logging source-interface <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => { logOf(c).source = ifn; }));
def(R_S, "config", "no logging source-interface", (c) => { logOf(c).source = null; });
def(R_S, "config", "logging on", (c) => { logOf(c).on = true; });
def(R_S, "config", "no logging on", (c) => { logOf(c).on = false; });
for (const which of ["log", "debug"]) {
  const set = (v) => (c) => { svcOf(c.d).ts[which] = v; };
  def(R_S, "config", `service timestamps ${which}`, set("uptime"));
  def(R_S, "config", `service timestamps ${which} uptime`, set("uptime"));
  def(R_S, "config", `service timestamps ${which} datetime`, set("datetime"));
  def(R_S, "config", `service timestamps ${which} datetime msec`, set("datetime"));
  def(R_S, "config", `service timestamps ${which} datetime msec localtime`, set("datetime"));
  def(R_S, "config", `service timestamps ${which} datetime localtime`, set("datetime"));
  def(R_S, "config", `no service timestamps ${which}`, set(null));
}
def(R_S, "config", "service sequence-numbers", (c) => { svcOf(c.d).seq = true; });
def(R_S, "config", "no service sequence-numbers", (c) => { svcOf(c.d).seq = false; });
def(R_S, "priv", "clear logging", (c) => c.s.ask("Clear logging buffer [confirm]", {}, (a) => { if (!a.trim() || /^y/i.test(a.trim())) c.d.rt.svc.log = []; }));
def(R_S, ["user", "priv"], "show logging", (c) => {
  const L = logOf(c), r = c.d.rt.svc;
  const lvl = (n) => (n === null ? "disabled" : "level " + levelName(n));
  const out = [`Syslog logging: ${L.on ? "enabled" : "disabled"} (0 messages dropped, 0 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)`, "",
    "No Active Message Discriminator.", "", "", "", "No Inactive Message Discriminator.", "", "",
    `    Console logging: ${lvl(L.console)}${L.console === null ? "" : `, ${r.counts.console} messages logged, xml disabled,`}`,
    ...(L.console === null ? [] : ["                     filtering disabled"]),
    `    Monitor logging: ${lvl(L.monitor)}${L.monitor === null ? "" : ", 0 messages logged, xml disabled,"}`,
    ...(L.monitor === null ? [] : ["                     filtering disabled"]),
    `    Buffer logging:  ${L.buffered ? `level ${levelName(L.buffered.level)}, ${r.counts.buffer} messages logged, xml disabled,` : "disabled, xml disabled,"}`,
    "                    filtering disabled", "    Exception Logging: size (4096 bytes)", "    Count and timestamp logging messages: disabled",
    "    Persistent logging: disabled", "", "No active filter modules.", "", `    Trap logging: level ${levelName(L.trap)}, ${r.counts.trap} message lines logged`];
  for (const h of L.hosts) {
    const ok = c.net.svcUdp(c.d.name, h, 514, L.source);
    out.push(`        Logging to ${n2ip(h)}  (udp port 514, audit disabled,`, `              link ${ok ? "up" : "down"}),`, `              ${r.counts.hosts[h] || 0} message lines logged, `,
      "              0 message lines rate-limited, ", "              0 message lines dropped-by-MD, ", "              xml disabled, sequence number disabled",
      "              filtering disabled");
  }
  out.push(`        Logging Source-Interface:       VRF Name:${L.source ? "\n        " + L.source : ""}`, "TLS Profiles: ", "");
  if (L.buffered) out.push(`Log Buffer (${L.buffered.size} bytes):`, "", ...r.log);
  c.print(out.join("\n"));
});

// ---- SNMP -------------------------------------------------------------------------------------
const snmpOf = (c) => svcOf(c.d).snmp;
const community = (access) => (c, args) => {
  const [name, view, acc, acl] = args;
  snmpOf(c).communities[name] = { access: (acc || access || "RO").toUpperCase(), acl: acl ?? null, view: view ?? null };
};
def(R_S, "config", "snmp-server community <word|SNMP community string>", (c, [n]) => community("RO")(c, [n]));
def(R_S, "config", "snmp-server community <word|SNMP community string> {RO|RW}", (c, [n, a]) => community()(c, [n, null, a]));
def(R_S, "config", "snmp-server community <word|SNMP community string> {RO|RW} <word|Std IP accesslist allowing access with this community string>", (c, [n, a, acl]) => community()(c, [n, null, a, acl]));
def(R_S, "config", "snmp-server community <word|SNMP community string> view <word|MIB view to which this community has access> {RO|RW}", (c, [n, v, a]) => community()(c, [n, v, a]));
def(R_S, "config", "no snmp-server community <word|SNMP community string>", (c, [n]) => { delete snmpOf(c).communities[n]; });
def(R_S, "config", "snmp-server location <line|The physical location of this node>", (c, [l]) => { snmpOf(c).location = l; });
def(R_S, "config", "snmp-server contact <line|identification of the contact person for this managed node>", (c, [l]) => { snmpOf(c).contact = l; });
def(R_S, "config", "no snmp-server location", (c) => { snmpOf(c).location = null; });
def(R_S, "config", "no snmp-server contact", (c) => { snmpOf(c).contact = null; });
def(R_S, "config", "snmp-server ifindex persist", () => {});
def(R_S, "config", "snmp-server view <word|Name of the view> <word|MIB view family name or OID> {included|excluded}", (c, [n, oid, inc]) => {
  const v = snmpOf(c).views;
  v[n] = (v[n] || []).filter((x) => x.oid !== oid).concat([{ oid, included: inc === "included" }]);
});
def(R_S, "config", "no snmp-server view <word|Name of the view>", (c, [n]) => { delete snmpOf(c).views[n]; });
for (const tail of ["", " read <word|View name>", " write <word|View name>", " read <word|View name> write <word|View name>",
  " access <word|Standard IP Access-list allowing access with this group>", " read <word|View name> access <word|Standard IP Access-list allowing access with this group>",
  " read <word|View name> write <word|View name> access <word|Standard IP Access-list allowing access with this group>"]) {
  def(R_S, "config", "snmp-server group <word|Name of the group> v3 {noauth|auth|priv}" + tail, (c, args) => {
    const [name, level, ...rest] = args, words = c.toks.map((t) => t.t.toLowerCase()), g = { level, read: null, write: null, acl: null };
    let k = 0;
    for (let i = 5; i < words.length; i++) {
      if ("read".startsWith(words[i])) g.read = rest[k++];
      else if ("write".startsWith(words[i])) g.write = rest[k++];
      else if ("access".startsWith(words[i])) g.acl = rest[k++];
    }
    snmpOf(c).groups[name] = g;
  });
}
def(R_S, "config", "no snmp-server group <word|Name of the group> v3 {noauth|auth|priv}", (c, [n]) => { delete snmpOf(c).groups[n]; });
const snmpUser = (c, [name, group, ...rest]) => {
  const w = c.toks.map((t) => t.t.toLowerCase()), u = { group, auth: null, priv: null, acl: null };
  const i = w.indexOf("auth");
  if (i > 0) u.auth = { proto: w[i + 1] === "m" || "md5".startsWith(w[i + 1]) ? "md5" : "sha", pw: c.toks[i + 2].t };
  const j = w.indexOf("priv");
  if (j > 0) u.priv = { proto: w[j + 1].startsWith("a") ? "aes " + w[j + 2] : w[j + 1].startsWith("3") ? "3des" : "des", pw: c.toks[w[j + 1].startsWith("a") ? j + 3 : j + 2].t };
  if (u.priv && !u.auth) { c.print("% Privacy requires authentication"); return; }
  snmpOf(c).users[name] = u;
};
def(R_S, "config", "snmp-server user <word|Name of the user> <word|Group to which the user belongs> v3", snmpUser);
def(R_S, "config", "snmp-server user <word|Name of the user> <word|Group to which the user belongs> v3 auth {md5|sha} <word|Authentication password for user>", snmpUser);
def(R_S, "config", "snmp-server user <word|Name of the user> <word|Group to which the user belongs> v3 auth {md5|sha} <word|Authentication password for user> priv {des|3des} <word|Privacy password for user>", snmpUser);
def(R_S, "config", "snmp-server user <word|Name of the user> <word|Group to which the user belongs> v3 auth {md5|sha} <word|Authentication password for user> priv aes {128|192|256} <word|Privacy password for user>", snmpUser);
def(R_S, "config", "no snmp-server user <word|Name of the user> <word|Group to which the user belongs> v3", (c, [n]) => { delete snmpOf(c).users[n]; });
const snmpHost = (c, args) => {
  const w = c.toks.map((t) => t.t.toLowerCase()), ip = args[0], name = args[args.length - 1];
  const vi = w.indexOf("version"), ver = vi > 0 ? w[vi + 1] : "1", level = ver === "3" ? w[vi + 2] : null;
  const s = snmpOf(c);
  s.hosts = s.hosts.filter((h) => h.ip !== ip).concat([{ ip, ver, level, name }]);
};
def(R_S, "config", "snmp-server host <ip|IP address of SNMP notification host> <word|SNMPv1/v2c community string or SNMPv3 user name>", snmpHost);
def(R_S, "config", "snmp-server host <ip|IP address of SNMP notification host> version {1|2c} <word|SNMPv1/v2c community string or SNMPv3 user name>", snmpHost);
def(R_S, "config", "snmp-server host <ip|IP address of SNMP notification host> version 3 {noauth|auth|priv} <word|SNMPv1/v2c community string or SNMPv3 user name>", snmpHost);
def(R_S, "config", "no snmp-server host <ip|IP address of SNMP notification host>", (c, [ip]) => { const s = snmpOf(c); s.hosts = s.hosts.filter((h) => h.ip !== ip); });
def(R_S, "config", "snmp-server enable traps", (c) => { snmpOf(c).traps = ""; });
def(R_S, "config", "snmp-server enable traps <line|Notification types>", (c, [t]) => { snmpOf(c).traps = t.toLowerCase().trim(); });
def(R_S, "config", "no snmp-server enable traps", (c) => { snmpOf(c).traps = null; });
def(R_S, ["user", "priv"], "show snmp", (c) => {
  const s = snmpOf(c), r = c.d.rt.svc;
  if (!Object.keys(s.communities).length && !Object.keys(s.users).length && !s.hosts.length) { c.print("%SNMP agent not enabled"); return; }
  const traps = Object.values(r.traps).reduce((a, b) => a + b, 0);
  c.print([`Chassis: NETLAB${hex(c.d.idx, 4).toUpperCase()}`, ...(s.contact ? ["Contact: " + s.contact] : []), ...(s.location ? ["Location: " + s.location] : []),
    `${r.snmpIn} SNMP packets input`, "    0 Bad SNMP version errors", "    0 Unknown community name", "    0 Illegal operation for community name supplied",
    "    0 Encoding errors", `    ${r.snmpIn} Number of requested variables`, "    0 Number of altered variables", "    0 Get-request PDUs",
    "    0 Get-next PDUs", "    0 Set-request PDUs", "    0 Input queue packet drops (Maximum queue size 1000)", `${traps} SNMP packets output`,
    "    0 Too big errors (Maximum packet size 1500)", "    0 No such name errors", "    0 Bad values errors", "    0 General errors",
    "    0 Response PDUs", `    ${traps} Trap PDUs`, "", ...(s.hosts.length ? ["SNMP logging: enabled", ...s.hosts.map((h) => `    Logging to ${n2ip(h.ip)}.162, 0/10, ${r.traps[n2ip(h.ip)] || 0} sent, 0 dropped.`)] : ["SNMP logging: disabled"])].join("\n"));
});
def(R_S, ["user", "priv"], "show snmp community", (c) => {
  const L = [];
  let i = 0;
  for (const [n, x] of Object.entries(snmpOf(c).communities)) {
    L.push("", `Community name: ${n}`, `Community Index: cisco${i++}`, `Community SecurityName: ${n}`, `storage-type: nonvolatile\t active${x.acl ? "\taccess-list: " + x.acl : ""}`, "");
  }
  c.print(L.join("\n"));
});
def(R_S, ["user", "priv"], "show snmp user", (c) => {
  const L = [];
  for (const [n, u] of Object.entries(snmpOf(c).users)) {
    L.push(`User name: ${n}`, `Engine ID: 80000009030052540000${hex(c.d.idx, 2)}00`, "storage-type: nonvolatile\t active",
      `Authentication Protocol: ${u.auth ? u.auth.proto.toUpperCase() : "None"}`, `Privacy Protocol: ${u.priv ? u.priv.proto.replace("aes ", "AES").toUpperCase() : "None"}`, `Group-name: ${u.group}`, "");
  }
  c.print(L.join("\n"));
});
def(R_S, ["user", "priv"], "show snmp group", (c) => {
  const L = [];
  for (const [n, g] of Object.entries(snmpOf(c).groups)) {
    L.push(`groupname: ${pad(n, 33)}security model:v3 ${g.level === "noauth" ? "noauth" : g.level}`, `contextname: <no context specified>         storage-type: nonvolatile`,
      `readview : ${pad(g.read || "v1default", 33)}writeview: ${g.write || "<no writeview specified>"}`, "notifyview: <no notifyview specified>",
      `row status: active${g.acl ? "\taccess-list: " + g.acl : ""}`, "");
  }
  c.print(L.join("\n"));
});
def(R_S, ["user", "priv"], "show snmp host", (c) => {
  const s = snmpOf(c);
  c.print(s.hosts.map((h) => [`Notification host: ${n2ip(h.ip)}\tudp-port: 162\ttype: trap`, `user: ${h.name}\tsecurity model: ${h.ver === "3" ? "v3 " + h.level : h.ver === "2c" ? "v2c" : "v1"}`, ""].join("\n")).join("\n"));
});
def(R_S, ["user", "priv"], "show snmp view", (c) => {
  const L = [];
  for (const [n, v] of Object.entries(snmpOf(c).views)) for (const e of v) L.push(`${n} ${e.oid} - ${e.included ? "included" : "excluded"} nonvolatile active`);
  c.print(L.join("\n"));
});

// ---- NTP ----------------------------------------------------------------------------------------
const ntpOf = (c) => svcOf(c.d).ntp;
def(R_S, "config", "ntp master", (c) => { ntpOf(c).master = 8; });
def(R_S, "config", "ntp master <num:1-15|Stratum number>", (c, [n]) => { ntpOf(c).master = n; });
def(R_S, "config", "no ntp master", (c) => { ntpOf(c).master = null; });
const ntpServer = (c, args) => {
  const [ip] = args, w = c.toks.map((t) => t.t.toLowerCase()), n = ntpOf(c);
  const ki = w.indexOf("key");
  const s = { ip, key: ki > 0 ? +w[ki + 1] : null, prefer: w.some((x) => x.length >= 2 && "prefer".startsWith(x)) };
  n.servers = n.servers.filter((x) => x.ip !== ip).concat([s]);
};
def(R_S, "config", "ntp server <ip|IP address of peer>", ntpServer);
def(R_S, "config", "ntp server <ip|IP address of peer> prefer", ntpServer);
def(R_S, "config", "ntp server <ip|IP address of peer> key <num:1-4294967295|Peer key number>", ntpServer);
def(R_S, "config", "ntp server <ip|IP address of peer> key <num:1-4294967295|Peer key number> prefer", ntpServer);
def(R_S, "config", "no ntp server <ip|IP address of peer>", (c, [ip]) => { const n = ntpOf(c); n.servers = n.servers.filter((x) => x.ip !== ip); });
def(R_S, "config", "ntp authenticate", (c) => { ntpOf(c).auth = true; });
def(R_S, "config", "no ntp authenticate", (c) => { ntpOf(c).auth = false; });
def(R_S, "config", "ntp authentication-key <num:1-4294967295|Key number> md5 <word|Authentication key>", (c, [n, k]) => { ntpOf(c).keys[n] = k; });
def(R_S, "config", "ntp authentication-key <num:1-4294967295|Key number> md5 <word|Authentication key> 7", (c, [n, k]) => { ntpOf(c).keys[n] = type7decode(k); });
def(R_S, "config", "no ntp authentication-key <num:1-4294967295|Key number>", (c, [n]) => { delete ntpOf(c).keys[n]; });
def(R_S, "config", "ntp trusted-key <num:1-4294967295|Key number>", (c, [n]) => { const x = ntpOf(c); if (!x.trusted.includes(n)) x.trusted.push(n); });
def(R_S, "config", "no ntp trusted-key <num:1-4294967295|Key number>", (c, [n]) => { const x = ntpOf(c); x.trusted = x.trusted.filter((k) => k !== n); });
def(R_S, "config", "ntp source <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => { ntpOf(c).source = ifn; }));
def(R_S, "config", "no ntp source", (c) => { ntpOf(c).source = null; });
def(R_S, ["user", "priv"], "show ntp status", (c) => {
  const st = c.net.svcNtp()[c.d.name];
  const synced = st.stratum < 16;
  const ref = !synced ? "no reference clock" : st.peer !== null ? "reference is " + n2ip(st.peer) : "reference is 127.127.1.1";
  c.print([`Clock is ${synced ? "synchronized" : "unsynchronized"}, stratum ${st.stratum}, ${ref}`,
    "nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10", "ntp uptime is 1500 (1/100 of seconds), resolution is 4000",
    synced ? `reference time is E9A4B2C1.6C8B4396 (${clock(c.net.svcClock(c.d.name).offset).split(".")[0]}.000 UTC)` : "reference time is 00000000.00000000 (00:00:00.000 UTC Mon Jan 1 1900)",
    `clock offset is 0.0000 msec, root delay is ${synced && st.peer !== null ? "1.00" : "0.00"} msec`, `root dispersion is ${synced ? "2.00" : "0.00"} msec, peer dispersion is ${synced ? "0.12" : "0.00"} msec`,
    `loopfilter state is '${synced ? "CTRL" : "FSET"}' (${synced ? "Normal Controlled Loop" : "Drift set from file"}), drift is 0.000000000 s/s`,
    `system poll interval is 64, ${synced ? "last update was 12 sec ago" : "never updated"}.`].join("\n"));
});
def(R_S, ["user", "priv"], "show ntp associations", (c) => {
  const st = c.net.svcNtp()[c.d.name];
  const L = ["", "  address         ref clock       st   when   poll reach  delay  offset   disp"];
  if (st.master && st.peer === null) L.push("*~127.127.1.1     .LOCL.     " + lpad(svcOf(c.d).ntp.master - 1, 6) + "     12     16   377  0.000   0.000  0.240");
  for (const a of st.assoc || []) {
    const sel = st.peer === a.ip ? "*" : a.ok ? "+" : " ";
    L.push(sel + "~" + pad(n2ip(a.ip), 16) + pad(a.ref, 13) + lpad(a.st, 5) + lpad(a.reach ? "12" : "-", 7) + lpad("64", 7) + lpad(a.reach, 6)
      + (a.reach ? "  1.000   0.500  0.190" : "  0.000   0.000 15937."));
  }
  L.push(" * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured");
  c.print(L.join("\n"));
});

// ---- QoS: class-maps and policy-maps ----------------------------------------------------------------
def(R_S, "config", "class-map <word|class-map name>", (c, [n]) => {
  const q = qosOf(c);
  q.classes[n] = q.classes[n] || { any: false, matches: [], desc: "" };
  c.s.enter("cmap", n);
});
def(R_S, "config", "class-map {match-all|match-any} <word|class-map name>", (c, [k, n]) => {
  const q = qosOf(c);
  if (q.classes[n] && q.classes[n].any !== (k === "match-any")) { c.print(`% class-map ${n} already exists with a different match type`); return; }
  q.classes[n] = q.classes[n] || { any: k === "match-any", matches: [], desc: "" };
  c.s.enter("cmap", n);
});
def(R_S, "config", "no class-map <word|class-map name>", (c, [n]) => {
  const q = qosOf(c);
  if (Object.values(q.policies).some((p) => p.classes.some((x) => x.name === n))) { c.print(`Class-map ${n} is being used`); return; }
  delete q.classes[n];
});
const cmatch = (m) => (c) => {
  const cls = qosOf(c).classes[c.target];
  cls.matches = cls.matches.filter((x) => JSON.stringify({ ...x, not: undefined }) !== JSON.stringify({ ...m, not: undefined })).concat([m]);
};
const cunmatch = (m) => (c) => {
  const cls = qosOf(c).classes[c.target];
  cls.matches = cls.matches.filter((x) => JSON.stringify(x) !== JSON.stringify(m));
};
for (const [neg, wrap] of [["", cmatch], ["no ", cunmatch]]) {
  def(R_S, "cmap", neg + "match any", (c) => wrap({ kind: "any" })(c));
  def(R_S, "cmap", neg + "match dscp <dscps>", (c, [v]) => wrap({ kind: "dscp", vals: v })(c));
  def(R_S, "cmap", neg + "match ip dscp <dscps>", (c, [v]) => wrap({ kind: "dscp", vals: v })(c));
  def(R_S, "cmap", neg + "match precedence <precs>", (c, [v]) => wrap({ kind: "prec", vals: v })(c));
  def(R_S, "cmap", neg + "match access-group <num:1-2699|Access list index>", (c, [n]) => wrap({ kind: "acl", name: String(n) })(c));
  def(R_S, "cmap", neg + "match access-group name <word|Named Access List>", (c, [n]) => wrap({ kind: "acl", name: n })(c));
  def(R_S, "cmap", neg + "match protocol {ip|icmp|http|https|telnet|ssh|dns|ntp|snmp}", (c, [p]) => wrap({ kind: "proto", name: p })(c));
}
def(R_S, "cmap", "description <line|Class-Map description>", (c, [t]) => { qosOf(c).classes[c.target].desc = t; });
def(R_S, "cmap", "exit", (c) => c.s.enter("config", null));

def(R_S, "config", "policy-map <word|policy-map name>", (c, [n]) => {
  const q = qosOf(c);
  q.policies[n] = q.policies[n] || { classes: [], desc: "" };
  c.s.enter("pmap", n);
});
def(R_S, "config", "no policy-map <word|policy-map name>", (c, [n]) => {
  const q = qosOf(c);
  const used = Object.values(c.cfg.intfs).some((i) => i.svc && (i.svc.sp.input === n || i.svc.sp.output === n));
  if (used) { c.print(`Policy map ${n} is being used`); return; }
  delete q.policies[n];
});
def(R_S, "pmap", "class <word|class-map name>", (c, [n]) => {
  const q = qosOf(c), pol = q.policies[c.target];
  if (n !== "class-default" && !q.classes[n]) { c.print(`class-map ${n} not configured`); return; }
  if (!pol.classes.find((x) => x.name === n)) pol.classes.push({ name: n, act: {} });
  c.s.enter("pmapc", { pol: c.target, cls: n });
});
def(R_S, "pmap", "no class <word|class-map name>", (c, [n]) => { const pol = qosOf(c).policies[c.target]; pol.classes = pol.classes.filter((x) => x.name !== n); });
def(R_S, "pmap", "description <line|Policy-Map description>", (c, [t]) => { qosOf(c).policies[c.target].desc = t; });
def(R_S, "pmap", "exit", (c) => c.s.enter("config", null));
const actOf = (c) => qosOf(c).policies[c.target.pol].classes.find((x) => x.name === c.target.cls).act;
const queueing = (a) => !!(a.bw || a.bwPct || a.bwRem || a.prio || a.prioPct || a.shape || a.fq);
const policyUsedInput = (c, pol) => Object.values(c.cfg.intfs).some((i) => i.svc && i.svc.sp.input === pol);
const qset = (fn) => (c, args) => {
  const a = actOf(c);
  const before = JSON.stringify(a);
  fn(a, args, c);
  if (queueing(a) && policyUsedInput(c, c.target.pol)) {
    Object.assign(a, JSON.parse(before));
    for (const k of Object.keys(a)) if (!(k in JSON.parse(before))) delete a[k];
    c.print("% Queueing features are not supported on input: remove the policy from the input direction first");
  }
};
def(R_S, "pmapc", "set dscp <dscp>", qset((a, [v]) => { a.dscp = v; a.prec = null; }));
def(R_S, "pmapc", "set ip dscp <dscp>", qset((a, [v]) => { a.dscp = v; a.prec = null; }));
def(R_S, "pmapc", "set precedence <num:0-7|Precedence value>", qset((a, [v]) => { a.prec = v; a.dscp = null; }));
def(R_S, "pmapc", "set ip precedence <num:0-7|Precedence value>", qset((a, [v]) => { a.prec = v; a.dscp = null; }));
def(R_S, "pmapc", "no set dscp", qset((a) => { a.dscp = null; }));
def(R_S, "pmapc", "no set precedence", qset((a) => { a.prec = null; }));
const noPrioWithBw = (a, c) => {
  if (a.prio || a.prioPct) { c.print("% Cannot configure bandwidth and priority in the same class"); return false; }
  return true;
};
def(R_S, "pmapc", "bandwidth <num:8-10000000|Kilo Bits per second>", qset((a, [n], c) => { if (noPrioWithBw(a, c)) { a.bw = n; a.bwPct = a.bwRem = null; } }));
def(R_S, "pmapc", "bandwidth percent <num:1-100|Percentage>", qset((a, [n], c) => { if (noPrioWithBw(a, c)) { a.bwPct = n; a.bw = a.bwRem = null; } }));
def(R_S, "pmapc", "bandwidth remaining percent <num:1-100|Percentage>", qset((a, [n], c) => { if (noPrioWithBw(a, c)) { a.bwRem = n; a.bw = a.bwPct = null; } }));
def(R_S, "pmapc", "no bandwidth", qset((a) => { a.bw = a.bwPct = a.bwRem = null; }));
const noBwWithPrio = (a, c) => {
  if (a.bw || a.bwPct || a.bwRem) { c.print("% Cannot configure bandwidth and priority in the same class"); return false; }
  return true;
};
def(R_S, "pmapc", "priority", qset((a, _, c) => { if (noBwWithPrio(a, c)) { a.prio = true; a.prioPct = null; } }));
def(R_S, "pmapc", "priority <num:8-10000000|Kilo Bits per second>", qset((a, [n], c) => { if (noBwWithPrio(a, c)) { a.prio = n; a.prioPct = null; } }));
def(R_S, "pmapc", "priority percent <num:1-100|Percentage>", qset((a, [n], c) => { if (noBwWithPrio(a, c)) { a.prioPct = n; a.prio = null; } }));
def(R_S, "pmapc", "no priority", qset((a) => { a.prio = a.prioPct = null; }));
def(R_S, "pmapc", "shape average <num:8000-10000000000|Target Bit Rate (bits per second)>", qset((a, [n]) => { a.shape = n; }));
def(R_S, "pmapc", "no shape average", qset((a) => { a.shape = null; }));
def(R_S, "pmapc", "fair-queue", qset((a) => { a.fq = true; }));
def(R_S, "pmapc", "no fair-queue", qset((a) => { a.fq = null; }));
def(R_S, "pmapc", "service-policy <word|policy-map name>", (c, [n]) => {
  if (!qosOf(c).policies[n]) { c.print(`policy map ${n} not configured`); return; }
  if (n === c.target.pol) { c.print("% A policy-map cannot contain itself"); return; }
  actOf(c).child = n;
});
def(R_S, "pmapc", "no service-policy", (c) => { actOf(c).child = null; });
const policeAct = { transmit: { kind: "transmit" }, drop: { kind: "drop" } };
const startPolice = (c, cir, bc) => {
  const a = actOf(c);
  a.police = { cir, bc: bc ?? Math.max(1500, Math.floor(cir / 32)), conform: { kind: "transmit" }, exceed: { kind: "drop" } };
  return a.police;
};
def(R_S, "pmapc", "police cir <num:8000-10000000000|Bits per second>", (c, [cir]) => { startPolice(c, cir); c.s.enter("police", c.target); });
def(R_S, "pmapc", "police cir <num:8000-10000000000|Bits per second> bc <num:1000-512000000|Burst bytes>", (c, [cir, bc]) => { startPolice(c, cir, bc); c.s.enter("police", c.target); });
def(R_S, "pmapc", "police <num:8000-10000000000|Bits per second>", (c, [cir]) => { startPolice(c, cir); c.s.enter("police", c.target); });
for (const ca of ["transmit", "drop"]) {
  for (const ea of ["transmit", "drop"]) {
    def(R_S, "pmapc", `police cir <num:8000-10000000000|Bits per second> conform-action ${ca} exceed-action ${ea}`, (c, [cir]) => {
      const p = startPolice(c, cir);
      p.conform = policeAct[ca];
      p.exceed = policeAct[ea];
    });
    def(R_S, "pmapc", `police <num:8000-10000000000|Bits per second> conform-action ${ca} exceed-action ${ea}`, (c, [cir]) => {
      const p = startPolice(c, cir);
      p.conform = policeAct[ca];
      p.exceed = policeAct[ea];
    });
  }
}
def(R_S, "pmapc", "no police", (c) => { actOf(c).police = null; });
def(R_S, "pmapc", "description <line|Policy-Map class description>", () => {});
def(R_S, "pmapc", "exit", (c) => c.s.enter("pmap", c.target.pol));
for (const which of ["conform", "exceed"]) {
  def(R_S, "police", `${which}-action {transmit|drop}`, (c, [k]) => { actOf(c).police[which] = policeAct[k]; });
  def(R_S, "police", `${which}-action set-dscp-transmit <dscp>`, (c, [v]) => { actOf(c).police[which] = { kind: "set-dscp-transmit", dscp: v }; });
}
def(R_S, "police", "violate-action {transmit|drop}", () => {});
def(R_S, "police", "exit", (c) => c.s.enter("pmapc", c.target));

def(R_S, IF_MODES, "service-policy {input|output} <word|policy-map name>", (c, [dir, n]) => {
  const pol = qosOf(c).policies[n];
  if (!pol) { c.print(`policy map ${n} not configured`); return; }
  if (dir === "input" && pol.classes.some((x) => queueing(x.act))) {
    c.print("% Queueing features (bandwidth, priority, shape, fair-queue) are only supported in the output direction");
    return;
  }
  eachSvcIf(c, (ifn, s) => { s.sp[dir] = n; });
});
def(R_S, IF_MODES, "no service-policy {input|output} <word|policy-map name>", (c, [dir, n]) => eachSvcIf(c, (ifn, s) => {
  if (s.sp[dir] === n) s.sp[dir] = null;
}));
def(R_S, IF_MODES, "no service-policy {input|output}", (c, [dir]) => eachSvcIf(c, (ifn, s) => { s.sp[dir] = null; }));

// Switch QoS.
def("S", "config", "mls qos", (c) => { qosOf(c).mls = true; });
def("S", "config", "no mls qos", (c) => { qosOf(c).mls = false; });
def("S", IF_MODES, "mls qos trust {dscp|cos|ip-precedence}", (c, [t]) => eachSvcIf(c, (n, s) => { s.trust = t; }));
def("S", IF_MODES, "no mls qos trust", (c) => eachSvcIf(c, (n, s) => { s.trust = null; }));
def("S", IF_MODES, "auto qos voip trust", (c) => {
  qosOf(c).mls = true;
  eachSvcIf(c, (n, s, i) => { s.autoqos = true; s.trust = i.mode === "trunk" ? "cos" : "dscp"; });
});
def("S", IF_MODES, "no auto qos voip trust", (c) => eachSvcIf(c, (n, s) => { s.autoqos = false; s.trust = null; }));
def("S", ["user", "priv"], "show mls qos", (c) => c.print(qosOf(c).mls ? "QoS is enabled\nQoS ip packet dscp rewrite is enabled" : "QoS is disabled\nQoS ip packet dscp rewrite is enabled"));
const mlsIf = (c, n) => {
  const s = ifSvc(c.d, n), on = qosOf(c).mls, t = s.trust;
  return [n, ...(on ? [] : ["QoS is disabled. When QoS is enabled, following settings will be applied"]),
    `trust state: ${t ? "trust " + t : "not trusted"}`, `trust mode: ${t ? "trust " + t : "not trusted"}`, `trust enabled flag: ${t ? "ena" : "dis"}`,
    "COS override: dis", "default COS: 0", "DSCP Mutation Map: Default DSCP Mutation Map", "Trust device: none", "qos mode: port-based"].join("\n");
};
def("S", ["user", "priv"], "show mls qos interface <intf>", (c, [n]) => c.s.withIf(n, 3, (ifn) => c.print(mlsIf(c, ifn))));
def("S", ["user", "priv"], "show mls qos interface", (c) => c.print(c.d.ports.map((p) => mlsIf(c, p)).join("\n\n")));

function showClassMap(c, only) {
  const q = qosOf(c), L = [];
  for (const [n, cls] of Object.entries(q.classes)) {
    if (only && n !== only) continue;
    L.push(` Class Map ${cls.any ? "match-any" : "match-all"} ${n} (id ${Object.keys(q.classes).indexOf(n) + 1})`, "");
    if (cls.desc) L.push("   Description: " + cls.desc);
    for (const m of cls.matches) L.push("   Match " + matchText(m));
    L.push("");
  }
  if (!only) L.push(" Class Map match-any class-default (id 0)", "", "   Match any ", "");
  return L.join("\n");
}
function matchText(m) {
  switch (m.kind) {
    case "any": return "any ";
    case "dscp": return "dscp " + m.vals.map((v) => `${dscpName(v)} (${v})`).join(" ");
    case "prec": return "precedence " + m.vals.join(" ");
    case "acl": return (/^\d+$/.test(m.name) ? "access-group " : "access-group name ") + m.name;
    case "proto": return "protocol " + m.name;
    default: return "";
  }
}
function policyLines(c, name, indent) {
  const q = qosOf(c), pol = q.policies[name], sp = " ".repeat(indent), L = [];
  if (!pol) return L;
  for (const x of pol.classes) {
    const a = x.act;
    L.push(`${sp}Class ${x.name}`);
    if (a.dscp !== undefined && a.dscp !== null) L.push(`${sp}  set dscp ${dscpName(a.dscp)}`);
    if (a.prec !== undefined && a.prec !== null) L.push(`${sp}  set precedence ${a.prec}`);
    if (a.prio || a.prioPct) L.push(`${sp}  priority ${a.prioPct ? a.prioPct + " (%)" : a.prio === true ? "" : a.prio + " (kbps)"}`.trimEnd());
    if (a.bw) L.push(`${sp}  bandwidth ${a.bw} (kbps)`);
    if (a.bwPct) L.push(`${sp}  bandwidth ${a.bwPct} (%)`);
    if (a.bwRem) L.push(`${sp}  bandwidth remaining ${a.bwRem} (%)`);
    if (a.shape) L.push(`${sp}  Average Rate Traffic Shaping`, `${sp}  cir ${a.shape} (bps)`);
    if (a.fq) L.push(`${sp}  fair-queue`);
    if (a.police) {
      const p = a.police, act = (x) => (x.kind === "set-dscp-transmit" ? "set-dscp-transmit " + dscpName(x.dscp) : x.kind);
      L.push(`${sp}  police cir ${p.cir} bc ${p.bc}`, `${sp}    conform-action ${act(p.conform)} `, `${sp}    exceed-action ${act(p.exceed)} `);
    }
    if (a.child) L.push(`${sp}  service-policy ${a.child}`);
  }
  return L;
}
def(R_S, ["user", "priv"], "show class-map", (c) => c.print(showClassMap(c, null)));
def(R_S, ["user", "priv"], "show class-map <word|class-map name>", (c, [n]) => c.print(qosOf(c).classes[n] ? showClassMap(c, n) : `Class-map ${n} not found`));
def(R_S, ["user", "priv"], "show policy-map", (c) => {
  const L = [];
  for (const n of Object.keys(qosOf(c).policies)) L.push(`  Policy Map ${n}`, ...policyLines(c, n, 4), "");
  c.print(L.join("\n"));
});
def(R_S, ["user", "priv"], "show policy-map <word|policy-map name>", (c, [n]) => c.print(qosOf(c).policies[n] ? [`  Policy Map ${n}`, ...policyLines(c, n, 4)].join("\n") : `Policy Map ${n} not found`));

function policyStats(c, ifn, dir, name, indent) {
  const d = c.d, q = qosOf(c), pol = q.policies[name], sp = " ".repeat(indent), L = [];
  if (!pol) return L;
  L.push(`${sp}Service-policy ${dir}: ${name}`, "");
  const classes = [...pol.classes.filter((x) => x.name !== "class-default"), pol.classes.find((x) => x.name === "class-default") || { name: "class-default", act: {} }];
  for (const x of classes) {
    const k = d.rt.svc.qos[`${ifn}|${dir}|${name}|${x.name}`] || { pkts: 0, bytes: 0, marked: 0, conf: [0, 0], exc: [0, 0], drops: 0 };
    const cls = q.classes[x.name], a = x.act;
    L.push(`${sp}  Class-map: ${x.name} (${x.name === "class-default" ? "match-any" : cls && cls.any ? "match-any" : "match-all"})  `,
      `${sp}    ${k.pkts} packets, ${k.bytes} bytes`, `${sp}    5 minute offered rate 0000 bps, drop rate 0000 bps`);
    if (x.name === "class-default") L.push(`${sp}    Match: any `);
    else for (const m of (cls ? cls.matches : [])) L.push(`${sp}    Match: ${matchText(m)}`);
    if (a.prio || a.prioPct) L.push(`${sp}    Priority: ${a.prioPct ? a.prioPct + "% " : a.prio === true ? "" : a.prio + " kbps"}, burst bytes 1500, b/w exceed drops: 0`, "");
    if (a.bw || a.bwPct || a.bwRem) {
      L.push(`${sp}    Queueing`, `${sp}    queue limit 64 packets`, `${sp}    (queue depth/total drops/no-buffer drops) 0/0/0`, `${sp}    (pkts output/bytes output) ${k.pkts}/${k.bytes}`,
        `${sp}    bandwidth ${a.bw ? a.bw + " kbps" : a.bwPct ? a.bwPct + "% " : "remaining " + a.bwRem + "%"}`);
    }
    if (a.shape) L.push(`${sp}    shape (average) cir ${a.shape}, bc ${Math.floor(a.shape / 250)}, be ${Math.floor(a.shape / 250)}`, `${sp}    target shape rate ${a.shape}`);
    if ((a.dscp !== undefined && a.dscp !== null) || (a.prec !== undefined && a.prec !== null)) {
      L.push(`${sp}    QoS Set`, `${sp}      ${a.dscp !== null && a.dscp !== undefined ? "dscp " + dscpName(a.dscp) : "precedence " + a.prec}`, `${sp}        Packets marked ${k.marked}`);
    }
    if (a.police) {
      const p = a.police, act = (z) => (z.kind === "set-dscp-transmit" ? "set-dscp-transmit " + dscpName(z.dscp) : z.kind);
      L.push(`${sp}    police:`, `${sp}        cir ${p.cir} bps, bc ${p.bc} bytes`, `${sp}      conformed ${k.conf[0]} packets, ${k.conf[1]} bytes; actions:`,
        `${sp}        ${act(p.conform)} `, `${sp}      exceeded ${k.exc[0]} packets, ${k.exc[1]} bytes; actions:`, `${sp}        ${act(p.exceed)} `,
        `${sp}      conformed 0000 bps, exceeded 0000 bps`);
    }
    if (a.child) L.push("", ...policyStats(c, ifn, dir, a.child, indent + 6));
    L.push("");
  }
  return L;
}
const showPmapIf = (c, ifn, onlyDir) => {
  const s = ifSvc(c.d, ifn), L = [];
  for (const dir of ["input", "output"]) {
    if (onlyDir && dir !== onlyDir) continue;
    if (s.sp[dir]) L.push(...policyStats(c, ifn, dir, s.sp[dir], 2));
  }
  return L.length ? [" " + ifn, "", ...L].join("\n") : "";
};
def(R_S, ["user", "priv"], "show policy-map interface", (c) => c.print(Object.keys(c.cfg.intfs).sort(ifSort).map((n) => showPmapIf(c, n)).filter(Boolean).join("\n")));
def(R_S, ["user", "priv"], "show policy-map interface <intf>", (c, [n]) => c.s.withIf(n, 3, (ifn) => c.print(showPmapIf(c, ifn))));
def(R_S, ["user", "priv"], "show policy-map interface <intf> {input|output}", (c, [n, dir]) => c.s.withIf(n, 3, (ifn) => c.print(showPmapIf(c, ifn, dir))));
// "clear counters" also zeroes the policy-map counters.
guardRuns(["router", "switch"], "priv", ["clear", "counters"], (c, args) => {
  const ifn = typeof args[0] === "string" ? canonIf(c.d, args[0]) : null;
  for (const k of Object.keys(c.d.rt.svc.qos)) if (!ifn || k.startsWith(ifn + "|")) delete c.d.rt.svc.qos[k];
});

// ---- ping options: repeat, size, timeout, df-bit, tos, source, in any order ------------------------
{
  const OPTS = {
    repeat: "<num:1-100>", size: "<num:36-18024|Datagram size>", timeout: "<num:0-3600|Timeout in seconds>",
    "df-bit": "", tos: "<num:0-255|Type of service value>", source: "<intf>",
  };
  const run = (c) => {
    const w = c.toks.map((t) => t.t);
    const dst = ip2n(w[1]);
    let count = 5, size = 100, tos = 0, src = null, bad = false;
    for (let i = 2; i < w.length; i++) {
      const k = Object.keys(OPTS).find((o) => o.startsWith(w[i].toLowerCase()));
      if (k === "repeat") count = +w[++i];
      else if (k === "size") size = +w[++i];
      else if (k === "timeout") i++;
      else if (k === "tos") tos = +w[++i];
      else if (k === "source") {
        const r = parseIfName(c.d.type, c.toks, i + 1);
        if (r && r.name && c.d.cfg.intfs[r.name]) {
          const a = c.net.ifAddr(c.d.name, r.name);
          if (!a || !c.net.ifUp(c.d.name, r.name)) bad = true; else src = a.ip;
          i += r.used;
        } else if (isIp(w[i + 1])) src = ip2n(w[++i]);
      }
    }
    if (bad) { c.print("% Invalid source interface - IP not enabled or interface is down"); return; }
    c.s.ping(dst, src, count, size, tos);
  };
  const names = Object.keys(OPTS);
  const build = (spec, used, depth) => {
    if (depth >= names.length) return;
    for (const o of names) {
      if (used.includes(o)) continue;
      if (o === "source") {
        // The source (an interface or an address) ends the line; the bare forms already exist.
        if (used.length) for (const p of ["<intf>", "<ip|Source address>"]) def(R_S, ["user", "priv"], spec + " source " + p, run);
        continue;
      }
      const s = spec + " " + o + (OPTS[o] ? " " + OPTS[o] : "");
      if (!(used.length === 0 && o === "repeat")) def(R_S, ["user", "priv"], s, run);
      build(s, [...used, o], depth + 1);
    }
  };
  build("ping <ip|Ping destination address>", [], 0);
}

// ---- NetFlow (traditional) and Flexible NetFlow -----------------------------------------------------
def("R", IF_MODES, "ip flow {ingress|egress}", (c, [k]) => eachSvcIf(c, (n, s) => { if (k === "ingress") s.flowIn = true; else s.flowOut = true; }));
def("R", IF_MODES, "no ip flow {ingress|egress}", (c, [k]) => eachSvcIf(c, (n, s) => { if (k === "ingress") s.flowIn = false; else s.flowOut = false; }));
def("R", "config", "ip flow-export destination <ip|Destination IP address> <num:1-65535|Destination UDP port>", (c, [ip, p]) => { flowOf(c).exportDst = { ip, port: p }; });
def("R", "config", "no ip flow-export destination", (c) => { flowOf(c).exportDst = null; });
def("R", "config", "ip flow-export version {1|5|9}", (c, [v]) => { flowOf(c).exportVer = v; });
def("R", "config", "ip flow-export source <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => { flowOf(c).exportSrc = ifn; }));
def("R", ["user", "priv"], "show ip cache flow", (c) => {
  const fl = Object.values(c.d.rt.svc.tflows), total = fl.reduce((a, b) => a + b.pkts, 0);
  const L = [`IP packet size distribution (${total} total packets):`, "   1-32   64   96  128  160  192  224  256  288  320  352  384  416  448  480",
    "   .000 .000 .000 1.00 .000 .000 .000 .000 .000 .000 .000 .000 .000 .000 .000", "",
    "IP Flow Switching Cache, 278544 bytes", `  ${fl.length} active, ${4096 - fl.length} inactive, ${fl.length} added`, "  0 ager polls, 0 flow alloc failures",
    "  Active flows timeout in 30 minutes", "  Inactive flows timeout in 15 seconds", "",
    "SrcIf          SrcIPaddress    DstIf          DstIPaddress    Pr SrcP DstP  Pkts"];
  for (const f of fl) {
    L.push(pad(f.inIf ? shortIf(f.inIf) : "Local", 15) + pad(n2ip(f.src), 16) + pad(f.outIf ? shortIf(f.outIf) : "Local", 15) + pad(n2ip(f.dst), 16)
      + pad(hex(({ icmp: 1, tcp: 6, udp: 17 })[f.proto] ?? 0, 2), 3) + pad(hex(f.sport, 4).toUpperCase(), 5) + pad(hex(f.dport, 4).toUpperCase(), 5) + lpad(f.pkts, 5) + " ");
  }
  c.print(L.join("\n"));
});
def("R", ["user", "priv"], "show ip flow export", (c) => {
  const f = flowOf(c);
  c.print([`Flow export v${f.exportVer || 1} is ${f.exportDst ? "enabled" : "disabled"} for main cache`,
    ...(f.exportDst ? [`  Export source and destination details :`, `  VRF ID : Default`, `    Destination(1)  ${n2ip(f.exportDst.ip)} (${f.exportDst.port})`] : []),
    `  Version ${f.exportVer || 1} flow records`, `  ${c.d.rt.svc.exported["(traditional)"] || 0} flows exported in ${c.d.rt.svc.exported["(traditional)"] || 0} udp datagrams`].join("\n"));
});

def("R", "config", "flow record <word|User defined flow record name>", (c, [n]) => {
  const f = flowOf(c);
  f.records[n] = f.records[n] || { match: [], collect: [], desc: "" };
  c.s.enter("flowrec", n);
});
def("R", "config", "no flow record <word|User defined flow record name>", (c, [n]) => {
  const f = flowOf(c);
  if (Object.values(f.monitors).some((m) => m.record === n)) { c.print(`% Flow Record: Flow Record '${n}' is in use and cannot be removed`); return; }
  delete f.records[n];
});
const recOf = (c) => flowOf(c).records[c.target];
const recField = (list, v) => (c) => {
  const r = recOf(c);
  if (Object.values(flowOf(c).monitors).some((m) => m.record === c.target && Object.values(c.cfg.intfs).some((i) => i.svc && (i.svc.mon.input.includes(c.target) || i.svc.mon.output.includes(c.target))))) {
    c.print(`% Flow Record: Flow Record '${c.target}' is in use, cannot modify`);
    return;
  }
  if (!r[list].includes(v)) r[list].push(v);
};
const recUnfield = (list, v) => (c) => { const r = recOf(c); r[list] = r[list].filter((x) => x !== v); };
for (const field of ["ipv4 source address", "ipv4 destination address", "ipv4 protocol", "ipv4 tos", "transport source-port", "transport destination-port", "interface input"]) {
  def("R", "flowrec", "match " + field, recField("match", field));
  def("R", "flowrec", "no match " + field, recUnfield("match", field));
}
for (const field of ["counter bytes", "counter bytes long", "counter packets", "counter packets long", "interface output", "timestamp sys-uptime first", "timestamp sys-uptime last"]) {
  def("R", "flowrec", "collect " + field, recField("collect", field));
  def("R", "flowrec", "no collect " + field, recUnfield("collect", field));
}
def("R", "flowrec", "description <line|Description>", (c, [t]) => { recOf(c).desc = t; });
def("R", "flowrec", "exit", (c) => c.s.enter("config", null));

def("R", "config", "flow exporter <word|User defined flow exporter name>", (c, [n]) => {
  const f = flowOf(c);
  f.exporters[n] = f.exporters[n] || { dst: null, src: null, port: 9995, proto: "netflow-v9", desc: "" };
  c.s.enter("flowexp", n);
});
def("R", "config", "no flow exporter <word|User defined flow exporter name>", (c, [n]) => {
  const f = flowOf(c);
  for (const m of Object.values(f.monitors)) m.exporters = m.exporters.filter((x) => x !== n);
  delete f.exporters[n];
});
const expOf = (c) => flowOf(c).exporters[c.target];
def("R", "flowexp", "destination <ip|Destination IPv4 address>", (c, [ip]) => { expOf(c).dst = ip; });
def("R", "flowexp", "no destination", (c) => { expOf(c).dst = null; });
def("R", "flowexp", "source <intf>", (c, [n]) => c.s.withIf(n, 1, (ifn) => { expOf(c).src = ifn; }));
def("R", "flowexp", "no source", (c) => { expOf(c).src = null; });
def("R", "flowexp", "transport udp <num:1-65535|Port value>", (c, [p]) => { expOf(c).port = p; });
def("R", "flowexp", "export-protocol {netflow-v9|netflow-v5|ipfix}", (c, [p]) => { expOf(c).proto = p; });
def("R", "flowexp", "description <line|Description>", (c, [t]) => { expOf(c).desc = t; });
def("R", "flowexp", "exit", (c) => c.s.enter("config", null));

def("R", "config", "flow monitor <word|User defined flow monitor name>", (c, [n]) => {
  const f = flowOf(c);
  f.monitors[n] = f.monitors[n] || { record: null, exporters: [], active: 1800, inactive: 15, desc: "" };
  c.s.enter("flowmon", n);
});
def("R", "config", "no flow monitor <word|User defined flow monitor name>", (c, [n]) => {
  if (Object.values(c.cfg.intfs).some((i) => i.svc && (i.svc.mon.input.includes(n) || i.svc.mon.output.includes(n)))) {
    c.print(`% Flow Monitor: Flow Monitor '${n}' is in use`);
    return;
  }
  delete flowOf(c).monitors[n];
});
const monOf = (c) => flowOf(c).monitors[c.target];
def("R", "flowmon", "record <word|Flow record name>", (c, [n]) => {
  if (!flowOf(c).records[n]) { c.print(`% Flow Record "${n}" does not exist`); return; }
  monOf(c).record = n;
});
def("R", "flowmon", "no record", (c) => { monOf(c).record = null; });
def("R", "flowmon", "exporter <word|Flow exporter name>", (c, [n]) => {
  if (!flowOf(c).exporters[n]) { c.print(`% Flow Exporter "${n}" does not exist`); return; }
  const m = monOf(c);
  if (!m.exporters.includes(n)) m.exporters.push(n);
});
def("R", "flowmon", "no exporter <word|Flow exporter name>", (c, [n]) => { const m = monOf(c); m.exporters = m.exporters.filter((x) => x !== n); });
def("R", "flowmon", "cache timeout active <num:1-604800|The active flow timeout in seconds>", (c, [t]) => { monOf(c).active = t; });
def("R", "flowmon", "cache timeout inactive <num:1-604800|The inactive flow timeout in seconds>", (c, [t]) => { monOf(c).inactive = t; });
def("R", "flowmon", "description <line|Description>", (c, [t]) => { monOf(c).desc = t; });
def("R", "flowmon", "exit", (c) => c.s.enter("config", null));

def("R", IF_MODES, "ip flow monitor <word|Flow monitor name> {input|output}", (c, [n, dir]) => {
  const m = flowOf(c).monitors[n];
  if (!m) { c.print(`% Flow Monitor: Flow Monitor '${n}' does not exist`); return; }
  if (!m.record) { c.print(`% Flow Monitor: Flow Monitor '${n}' does not have a flow record assigned`); return; }
  if (!flowOf(c).records[m.record].match.length) { c.print(`% Flow Monitor: Flow Record '${m.record}' has no match fields`); return; }
  eachSvcIf(c, (ifn, s) => { if (!s.mon[dir].includes(n)) s.mon[dir].push(n); });
});
def("R", IF_MODES, "no ip flow monitor <word|Flow monitor name> {input|output}", (c, [n, dir]) => eachSvcIf(c, (ifn, s) => { s.mon[dir] = s.mon[dir].filter((x) => x !== n); }));

function flowCache(c, name) {
  const f = flowOf(c), m = f.monitors[name], rec = m && f.records[m.record], store = c.d.rt.svc.flows[name] || {};
  const entries = Object.values(store);
  const L = ["  Cache type:                               Normal (Platform cache)", "  Cache size:                                 4096",
    `  Current entries:                       ${lpad(entries.length, 9)}`, "", `  Flows added:                           ${lpad(entries.length, 9)}`,
    "  Flows aged:                                    0", ""];
  if (!rec || !entries.length) return L.join("\n");
  const cols = [...rec.match.map((x) => ({ h: FLOW_COLS[x], v: (e) => flowField(x, e) })),
    ...rec.collect.map((x) => ({
      h: { "counter bytes": "bytes", "counter bytes long": "bytes long", "counter packets": "pkts", "counter packets long": "pkts long",
        "interface output": "intf output", "timestamp sys-uptime first": "time first", "timestamp sys-uptime last": "time last" }[x],
      v: (e) => (x.startsWith("counter bytes") ? String(e.bytes) : x.startsWith("counter packets") ? String(e.pkts) : x === "interface output" ? (e.outIf ? shortIf(e.outIf) : "Null")
        : new Date(c.d.rt.svc.boot + (x.endsWith("first") ? e.first : e.last)).toISOString().slice(11, 23)),
    }))];
  const widths = cols.map((col) => Math.max(col.h.length, ...entries.map((e) => col.v(e).length)));
  L.push(cols.map((col, i) => pad(col.h, widths[i])).join("  "), widths.map((w) => "=".repeat(w)).join("  "));
  for (const e of entries) L.push(cols.map((col, i) => (/^(bytes|pkts|IP PROT|TRNS)/.test(col.h) ? lpad(col.v(e), widths[i]) : pad(col.v(e), widths[i]))).join("  "));
  return L.join("\n");
}
def("R", ["user", "priv"], "show flow monitor", (c) => {
  const f = flowOf(c), L = [];
  for (const [n, m] of Object.entries(f.monitors)) {
    L.push(`Flow Monitor ${n}:`, `  Description:       ${m.desc || "User defined"}`, `  Flow Record:       ${m.record || "not configured"}`,
      ...(m.exporters.length ? [`  Flow Exporter:     ${m.exporters.join(", ")}`] : []), "  Cache:", "    Type:                 normal (Platform cache)",
      "    Status:               allocated", "    Size:                 4096 entries", `    Inactive Timeout:     ${m.inactive} secs`, `    Active Timeout:       ${m.active} secs`, "");
  }
  c.print(L.join("\n"));
});
def("R", ["user", "priv"], "show flow monitor <word|Flow monitor name>", (c, [n]) => {
  if (!flowOf(c).monitors[n]) { c.print(`% Flow Monitor: Flow Monitor '${n}' does not exist`); return; }
  const m = flowOf(c).monitors[n];
  c.print([`Flow Monitor ${n}:`, `  Description:       ${m.desc || "User defined"}`, `  Flow Record:       ${m.record || "not configured"}`,
    ...(m.exporters.length ? [`  Flow Exporter:     ${m.exporters.join(", ")}`] : []), "  Cache:", "    Type:                 normal (Platform cache)",
    "    Status:               allocated", "    Size:                 4096 entries", `    Inactive Timeout:     ${m.inactive} secs`, `    Active Timeout:       ${m.active} secs`].join("\n"));
});
def("R", ["user", "priv"], "show flow monitor <word|Flow monitor name> cache", (c, [n]) => {
  if (!flowOf(c).monitors[n]) { c.print(`% Flow Monitor: Flow Monitor '${n}' does not exist`); return; }
  c.print(flowCache(c, n));
});
def("R", ["user", "priv"], "show flow exporter", (c) => {
  const f = flowOf(c), L = [];
  for (const [n, e] of Object.entries(f.exporters)) {
    L.push(`Flow Exporter ${n}:`, `  Description:              ${e.desc || "User defined"}`, `  Export protocol:          ${e.proto === "netflow-v9" ? "NetFlow Version 9" : e.proto === "ipfix" ? "IPFIX (Version 10)" : "NetFlow Version 5"}`,
      "  Transport Configuration:", `    Destination IP address: ${e.dst !== null ? n2ip(e.dst) : "Not configured"}`,
      `    Source IP address:      ${e.src && c.net.ifAddr(c.d.name, e.src) ? n2ip(c.net.ifAddr(c.d.name, e.src).ip) : "0.0.0.0"}`,
      ...(e.src ? [`    Source Interface:       ${e.src}`] : []), "    Transport Protocol:     UDP", `    Destination Port:       ${e.port}`,
      `    Source Port:            ${50000 + Object.keys(f.exporters).indexOf(n)}`, "    DSCP:                   0x0", "    TTL:                    255",
      `    Output Features:        Not Used`, "", `  Export statistics: ${c.d.rt.svc.exported[n] || 0} records sent`, "");
  }
  c.print(L.join("\n"));
});
def("R", ["user", "priv"], "show flow exporter <word|Flow exporter name>", (c, [n]) => {
  const e = flowOf(c).exporters[n];
  if (!e) { c.print(`% Flow Exporter: Flow Exporter '${n}' does not exist`); return; }
  c.print([`Flow Exporter ${n}:`, `  Description:              ${e.desc || "User defined"}`, "  Transport Configuration:",
    `    Destination IP address: ${e.dst !== null ? n2ip(e.dst) : "Not configured"}`, `    Destination Port:       ${e.port}`,
    `  Export statistics: ${c.d.rt.svc.exported[n] || 0} records sent`].join("\n"));
});
def("R", ["user", "priv"], "show flow record", (c) => {
  const L = [];
  for (const [n, r] of Object.entries(flowOf(c).records)) {
    L.push(`flow record ${n}:`, `  Description:        ${r.desc || "User defined"}`, "  No. of users:       1", "  Total field space:  29 bytes", "  Fields:",
      ...r.match.map((x) => "    match " + x), ...r.collect.map((x) => "    collect " + x), "");
  }
  c.print(L.join("\n"));
});
def("R", ["user", "priv"], "show flow interface", (c) => {
  const L = [];
  for (const n of Object.keys(c.cfg.intfs).sort(ifSort)) {
    const s = ifSvc(c.d, n);
    if (!s.mon.input.length && !s.mon.output.length) continue;
    L.push(`Interface ${n}`);
    for (const dir of ["input", "output"]) for (const m of s.mon[dir]) L.push(`  FNF:  monitor:         ${m}`, `        direction:       ${dir === "input" ? "Input" : "Output"}`, "        traffic(ip):     on");
  }
  c.print(L.join("\n"));
});

// ---- LLDP ---------------------------------------------------------------------------------------
const lldpOf = (c) => svcOf(c.d).lldp;
def(R_S, "config", "lldp run", (c) => { lldpOf(c).run = true; });
def(R_S, "config", "no lldp run", (c) => { lldpOf(c).run = false; });
def(R_S, "config", "lldp timer <num:5-65534|Rate at which LLDP packets are sent (in sec)>", (c, [n]) => { lldpOf(c).timer = n; });
def(R_S, "config", "lldp holdtime <num:0-65535|Length of time (in sec) that receiver must keep this packet>", (c, [n]) => { lldpOf(c).hold = n; });
def(R_S, "config", "no lldp timer", (c) => { lldpOf(c).timer = 30; });
def(R_S, "config", "no lldp holdtime", (c) => { lldpOf(c).hold = 120; });
def(R_S, IF_MODES, "lldp {transmit|receive}", (c, [k]) => eachSvcIf(c, (n, s) => { if (k === "transmit") s.lldpTx = true; else s.lldpRx = true; }));
def(R_S, IF_MODES, "no lldp {transmit|receive}", (c, [k]) => eachSvcIf(c, (n, s) => { if (k === "transmit") s.lldpTx = false; else s.lldpRx = false; }));
def(R_S, ["user", "priv"], "show lldp", (c) => {
  const l = lldpOf(c);
  c.print(l.run ? ["", "Global LLDP Information:", "    Status: ACTIVE", `    LLDP advertisements are sent every ${l.timer} seconds`,
    `    LLDP hold time advertised is ${l.hold} seconds`, "    LLDP interface reinitialisation delay is 2 seconds"].join("\n") : "% LLDP is not enabled");
});
def(R_S, ["user", "priv"], "show lldp neighbors", (c) => {
  if (!lldpOf(c).run) { c.print("% LLDP is not enabled"); return; }
  const nb = c.net.svcLldp(c.d.name);
  const L = ["Capability codes:", "    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device", "    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other", "",
    "Device ID           Local Intf     Hold-time  Capability      Port ID"];
  for (const x of nb) L.push(pad(x.dev.cfg.hostname.slice(0, 19), 20) + pad(shortIf(x.local), 15) + pad(x.hold, 11) + pad(x.dev.type === "router" ? "R" : "B", 16) + shortIf(x.port));
  L.push("", `Total entries displayed: ${nb.length}`);
  c.print(L.join("\n"));
});
def(R_S, ["user", "priv"], "show lldp neighbors detail", (c) => {
  if (!lldpOf(c).run) { c.print("% LLDP is not enabled"); return; }
  const nb = c.net.svcLldp(c.d.name), L = [];
  for (const x of nb) {
    const r = x.dev.type === "router";
    L.push("------------------------------------------------", `Local Intf: ${shortIf(x.local)}`, `Chassis id: ${c.net.mac(x.dev.name, x.port)}`, `Port id: ${shortIf(x.port)}`,
      `Port Description: ${x.dev.cfg.intfs[x.port].desc || x.port}`, `System Name: ${x.dev.cfg.hostname}`, "", "System Description: ",
      r ? "Cisco IOS Software, IOSv Software (VIOS-ADVENTERPRISEK9-M), Version 15.9(3)M, RELEASE SOFTWARE (fc1)" : "Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.2(7)E, RELEASE SOFTWARE (fc1)",
      "", `Time remaining: ${x.hold - 7} seconds`, `System Capabilities: ${r ? "R" : "B"}`, `Enabled Capabilities: ${r ? "R" : "B"}`, "Management Addresses:",
      ...(x.ip !== null ? [`    IP: ${n2ip(x.ip)}`] : ["    None"]), "Auto Negotiation - not supported", "Physical media capabilities - not advertised",
      "Media Attachment Unit type - not advertised", "Vlan ID: - not advertised", "");
  }
  L.push("", `Total entries displayed: ${nb.length}`);
  c.print(L.join("\n"));
});
def(R_S, ["user", "priv"], "show lldp interface", (c) => {
  if (!lldpOf(c).run) { c.print("% LLDP is not enabled"); return; }
  c.print(c.d.ports.map((p) => { const s = ifSvc(c.d, p); return `${p}:\n    Tx: ${s.lldpTx ? "enabled" : "disabled"}\n    Rx: ${s.lldpRx ? "enabled" : "disabled"}\n    Tx state: IDLE\n    Rx state: WAIT FOR FRAME\n`; }).join("\n"));
});

// ---- EEM applets --------------------------------------------------------------------------------
const appletOf = (c) => svcOf(c.d).eem[c.target];
def(R_S, "config", "event manager applet <word|Name of the Event Manager applet>", (c, [n]) => {
  const e = svcOf(c.d).eem;
  e[n] = e[n] || { event: null, actions: {}, desc: "" };
  c.s.enter("applet", n);
});
def(R_S, "config", "no event manager applet <word|Name of the Event Manager applet>", (c, [n]) => { delete svcOf(c.d).eem[n]; });
def(R_S, "applet", "event syslog pattern <quoted|Regular expression to match>", (c, [t]) => {
  const m = /^"(.*)"(?:\s+occurs\s+(\d+))?\s*$/.exec(t.trim());
  if (!m) { c.print("% Invalid pattern: put the regular expression in double quotes"); return; }
  try { new RegExp(m[1]); } catch (e) { c.print("% Invalid regular expression"); return; }
  appletOf(c).event = { kind: "syslog", pattern: m[1], occurs: m[2] ? +m[2] : 1 };
});
def(R_S, "applet", "event none", (c) => { appletOf(c).event = { kind: "none" }; });
def(R_S, "applet", "event timer {countdown|watchdog} time <num:1-4294967|Time value in seconds>", (c, [k, n]) => { appletOf(c).event = { kind: "timer", timer: k, secs: n }; });
def(R_S, "applet", "action <word|Action label> cli command <quoted|CLI command to be executed>", (c, [label, t]) => {
  appletOf(c).actions[label] = { kind: "cli", text: unquote(t) };
});
def(R_S, "applet", "action <word|Action label> syslog msg <quoted|Syslog message>", (c, [label, t]) => {
  appletOf(c).actions[label] = { kind: "syslog", text: unquote(t), prio: 6 };
});
def(R_S, "applet", "action <word|Action label> syslog priority {emergencies|alerts|critical|errors|warnings|notifications|informational|debugging} msg <quoted|Syslog message>", (c, [label, p, t]) => {
  appletOf(c).actions[label] = { kind: "syslog", text: unquote(t), prio: SEVERITIES.indexOf(p) };
});
def(R_S, "applet", "no action <word|Action label>", (c, [label]) => { delete appletOf(c).actions[label]; });
def(R_S, "applet", "description <line|Applet description>", (c, [t]) => { appletOf(c).desc = t; });
def(R_S, "applet", "exit", (c) => {
  const ap = appletOf(c);
  if (!ap.event) c.print(`% Event Manager applet ${c.target}: an event must be specified before the applet can be registered`);
  c.s.enter("config", null);
});
def(R_S, "priv", "event manager run <word|Name of the Event Manager policy>", (c, [n]) => {
  const ap = svcOf(c.d).eem[n];
  if (!ap) { c.print(`EEM policy ${n} not registered with event manager`); return; }
  if (!ap.event || ap.event.kind !== "none") { c.print(`EEM policy ${n} not registered with event none Event Detector`); return; }
  const res = c.net.svcRunApplet(c.d.name, n, (c.s.eemDepth || 0) + 1, "none");
  // Their messages go out with this command's own.
  for (const [xd, xs] of Object.entries(res.events)) for (const m of xs) if (!/^%SYS-5-CONFIG_I/.test(m) || true) c.net.note(xd, m);
});
def(R_S, ["user", "priv"], "show event manager policy registered", (c) => {
  const e = svcOf(c.d).eem, L = ["No.  Class     Type    Event Type          Trap  Time Registered           Secu  Name"];
  let i = 0;
  for (const [n, ap] of Object.entries(e)) {
    if (!ap.event) continue;
    const type = ap.event.kind === "syslog" ? "syslog" : ap.event.kind === "none" ? "none" : "timer " + ap.event.timer;
    L.push(`${pad(++i, 5)}${pad("applet", 10)}${pad("user", 8)}${pad(type, 20)}${pad("Off", 6)}${pad(clock().split(".")[0] + " 2026", 27)}${pad("none", 6)}${n}`);
    if (ap.event.kind === "syslog") L.push(` pattern {${ap.event.pattern}}${ap.event.occurs > 1 ? " occurs " + ap.event.occurs : ""}`);
    if (ap.event.kind === "timer") L.push(` time ${ap.event.secs}.000`);
    L.push(" maxrun 20.000");
    for (const lb of Object.keys(ap.actions).sort()) {
      const a = ap.actions[lb];
      L.push(` action ${lb} ${a.kind === "cli" ? `cli command "${a.text}"` : `syslog ${a.prio !== 6 ? "priority " + SEVERITIES[a.prio] + " " : ""}msg "${a.text}"`}`);
    }
    L.push("");
  }
  c.print(L.join("\n"));
});
def(R_S, ["user", "priv"], "show event manager history events", (c) => {
  const L = ["No.  Job Id Proc Status    Time of Event            Event Type          Name"];
  c.d.rt.svc.eem.forEach((h, i) => L.push(`${pad(i + 1, 5)}${pad(i + 1, 7)}${pad("Actv", 5)}${pad("success", 10)}${pad(h.at.split(".")[0] + " 2026", 25)}${pad(h.why, 20)}applet: ${h.name}`));
  c.print(L.join("\n"));
});

// ---- running-config -------------------------------------------------------------------------------
// The lines these services add, by where IOS prints them.
function svcConfig(d, where) {
  const s = svcOf(d), c = d.cfg, L = [];
  const pw = (x) => (c.pwEnc ? "7 " + type7(x) : x);
  switch (where) {
    case "service": {
      const ts = (k) => (s.ts[k] === null ? `no service timestamps ${k}` : `service timestamps ${k} ${s.ts[k] === "uptime" ? "uptime" : "datetime msec"}`);
      L.push(ts("debug"), ts("log"));
      if (s.seq) L.push("service sequence-numbers");
      break;
    }
    case "logging": {
      const lg = s.logging;
      if (lg.buffered) L.push(`logging buffered ${lg.buffered.size}${lg.buffered.level !== 7 ? " " + levelName(lg.buffered.level) : ""}`);
      if (lg.console === null) L.push("no logging console");
      else if (lg.console !== 7) L.push("logging console " + levelName(lg.console));
      if (lg.monitor === null) L.push("no logging monitor");
      else if (lg.monitor !== 7) L.push("logging monitor " + levelName(lg.monitor));
      if (!lg.on) L.push("no logging on");
      for (const [n, sec] of Object.entries(s.enableLevels)) L.push(`enable secret level ${n} ${sec}`);
      break;
    }
    case "aaa": {
      const a = s.aaa;
      if (!a.on) { L.push("no aaa new-model"); break; }
      L.push("aaa new-model");
      for (const [n, g] of Object.entries(a.groups)) L.push("!", `aaa group server ${g.kind === "radius" ? "radius" : "tacacs+"} ${n}`, ...g.servers.map((x) => " server name " + x));
      if (Object.keys(a.groups).length) L.push("!");
      for (const [n, ms] of Object.entries(a.authen)) L.push(`aaa authentication login ${n} ${ms.join(" ")}`);
      for (const [n, ms] of Object.entries(a.author)) L.push(`aaa authorization exec ${n} ${ms.join(" ")}`);
      if (a.console) L.push("aaa authorization console");
      L.push("!", "!", "!", "!", "!", "aaa session-id common");
      break;
    }
    case "global": {
      for (const [n, ip] of Object.entries(s.hosts)) L.push(`ip host ${n} ${n2ip(ip)}`);
      for (const ip of s.nameServers) L.push("ip name-server " + n2ip(ip));
      if (s.blockFor) L.push(`login block-for ${s.blockFor.secs} attempts ${s.blockFor.attempts} within ${s.blockFor.within}`);
      if (s.onFail) L.push("login on-failure log");
      if (s.onSuccess) L.push("login on-success log");
      if (s.minLen) L.push("security passwords min-length " + s.minLen);
      break;
    }
    case "objects": {
      const q = s.qos, f = s.flow;
      if (s.lldp.run) {
        L.push("!");
        if (s.lldp.timer !== 30) L.push("lldp timer " + s.lldp.timer);
        if (s.lldp.hold !== 120) L.push("lldp holdtime " + s.lldp.hold);
        L.push("lldp run");
      }
      if (q.mls) L.push("mls qos");
      for (const [n, r] of Object.entries(f.records)) {
        L.push("!", "flow record " + n);
        if (r.desc) L.push(" description " + r.desc);
        for (const x of r.match) L.push(" match " + x);
        for (const x of r.collect) L.push(" collect " + x);
      }
      for (const [n, e] of Object.entries(f.exporters)) {
        L.push("!", "flow exporter " + n);
        if (e.desc) L.push(" description " + e.desc);
        if (e.dst !== null) L.push(" destination " + n2ip(e.dst));
        if (e.src) L.push(" source " + e.src);
        if (e.port !== 9995) L.push(" transport udp " + e.port);
        if (e.proto !== "netflow-v9") L.push(" export-protocol " + e.proto);
      }
      for (const [n, m] of Object.entries(f.monitors)) {
        L.push("!", "flow monitor " + n);
        if (m.desc) L.push(" description " + m.desc);
        for (const x of m.exporters) L.push(" exporter " + x);
        if (m.inactive !== 15) L.push(" cache timeout inactive " + m.inactive);
        if (m.active !== 1800) L.push(" cache timeout active " + m.active);
        if (m.record) L.push(" record " + m.record);
      }
      for (const [n, cls] of Object.entries(q.classes)) {
        L.push("!", `class-map ${cls.any ? "match-any" : "match-all"} ${n}`);
        if (cls.desc) L.push(" description " + cls.desc);
        for (const m of cls.matches) {
          const t = m.kind === "dscp" ? "dscp " + m.vals.map(dscpName).join(" ") : m.kind === "prec" ? "precedence " + m.vals.join(" ")
            : m.kind === "acl" ? (/^\d+$/.test(m.name) ? "access-group " : "access-group name ") + m.name : m.kind === "proto" ? "protocol " + m.name : "any";
          L.push(" match " + t);
        }
      }
      for (const [n, p] of Object.entries(q.policies)) {
        L.push("!", "policy-map " + n);
        if (p.desc) L.push(" description " + p.desc);
        for (const x of p.classes) {
          const a = x.act;
          L.push(" class " + x.name);
          if (a.prio === true) L.push("  priority");
          else if (a.prio) L.push("  priority " + a.prio);
          if (a.prioPct) L.push("  priority percent " + a.prioPct);
          if (a.bw) L.push("  bandwidth " + a.bw);
          if (a.bwPct) L.push("  bandwidth percent " + a.bwPct);
          if (a.bwRem) L.push("  bandwidth remaining percent " + a.bwRem);
          if (a.shape) L.push("  shape average " + a.shape);
          if (a.fq) L.push("  fair-queue");
          if (a.dscp !== undefined && a.dscp !== null) L.push("  set dscp " + dscpName(a.dscp));
          if (a.prec !== undefined && a.prec !== null) L.push("  set precedence " + a.prec);
          if (a.police) {
            const act = (z) => (z.kind === "set-dscp-transmit" ? "set-dscp-transmit " + dscpName(z.dscp) : z.kind);
            L.push(`  police cir ${a.police.cir} bc ${a.police.bc}`, `   conform-action ${act(a.police.conform)} `, `   exceed-action ${act(a.police.exceed)} `);
          }
          if (a.child) L.push("  service-policy " + a.child);
        }
      }
      if (Object.keys(f.records).length + Object.keys(f.exporters).length + Object.keys(f.monitors).length + Object.keys(q.classes).length + Object.keys(q.policies).length) L.push("!");
      break;
    }
    case "late": {
      L.push(s.http.server ? "ip http server" : "no ip http server", s.http.secure ? "ip http secure-server" : "no ip http secure-server");
      const f = s.flow;
      if (f.exportVer) L.push("ip flow-export version " + f.exportVer);
      if (f.exportSrc) L.push("ip flow-export source " + f.exportSrc);
      if (f.exportDst) L.push(`ip flow-export destination ${n2ip(f.exportDst.ip)} ${f.exportDst.port}`);
      const lg = s.logging;
      if (lg.trap !== 6) L.push("logging trap " + levelName(lg.trap));
      if (lg.source) L.push("logging source-interface " + lg.source);
      for (const h of lg.hosts) L.push("logging host " + n2ip(h));
      const sn = s.snmp;
      for (const [n, v] of Object.entries(sn.views)) for (const e of v) L.push(`snmp-server view ${n} ${e.oid} ${e.included ? "included" : "excluded"}`);
      for (const [n, x] of Object.entries(sn.communities)) L.push(`snmp-server community ${n}${x.view ? " view " + x.view : ""} ${x.access}${x.acl ? " " + x.acl : ""}`);
      for (const [n, g] of Object.entries(sn.groups)) {
        L.push(`snmp-server group ${n} v3 ${g.level}${g.read ? " read " + g.read : ""}${g.write ? " write " + g.write : ""}${g.acl ? " access " + g.acl : ""}`);
      }
      if (sn.location) L.push("snmp-server location " + sn.location);
      if (sn.contact) L.push("snmp-server contact " + sn.contact);
      if (sn.traps !== null) L.push("snmp-server enable traps" + (sn.traps ? " " + sn.traps : ""));
      for (const h of sn.hosts) L.push(`snmp-server host ${n2ip(h.ip)}${h.ver !== "1" ? " version " + h.ver + (h.level ? " " + h.level : "") : ""} ${h.name}`);
      for (const [n, x] of Object.entries(s.aaa.servers)) {
        L.push("!", `${x.kind} server ${n}`);
        if (x.ip !== null) L.push(` address ipv4 ${n2ip(x.ip)}${x.kind === "radius" ? " auth-port 1812 acct-port 1813" : ""}`);
        if (x.key !== null) L.push(" key " + pw(x.key));
      }
      break;
    }
    case "banners": {
      if (s.bannerExec) L.push("banner exec ^C" + s.bannerExec + "^C");
      if (s.bannerLogin) L.push("banner login ^C" + s.bannerLogin + "^C");
      break;
    }
    case "tail": {
      const n = s.ntp;
      for (const [k, v] of Object.entries(n.keys)) L.push(`ntp authentication-key ${k} md5 ${type7(v)} 7`);
      if (n.auth) L.push("ntp authenticate");
      for (const k of n.trusted) L.push("ntp trusted-key " + k);
      if (n.source) L.push("ntp source " + n.source);
      if (n.master !== null) L.push(n.master === 8 ? "ntp master" : "ntp master " + n.master);
      for (const x of n.servers) L.push(`ntp server ${n2ip(x.ip)}${x.key !== null ? " key " + x.key : ""}${x.prefer ? " prefer" : ""}`);
      for (const p of s.privs) L.push(`privilege exec level ${p.level} ${p.path.join(" ")}`);
      for (const [name, ap] of Object.entries(s.eem)) {
        L.push("event manager applet " + name);
        if (ap.desc) L.push(" description " + ap.desc);
        if (ap.event && ap.event.kind === "syslog") L.push(` event syslog pattern "${ap.event.pattern}"${ap.event.occurs > 1 ? " occurs " + ap.event.occurs : ""}`);
        if (ap.event && ap.event.kind === "none") L.push(" event none");
        if (ap.event && ap.event.kind === "timer") L.push(` event timer ${ap.event.timer} time ${ap.event.secs}`);
        for (const lb of Object.keys(ap.actions).sort()) {
          const a = ap.actions[lb];
          L.push(a.kind === "cli" ? ` action ${lb} cli command "${a.text}"` : ` action ${lb} syslog ${a.prio !== 6 ? "priority " + SEVERITIES[a.prio] + " " : ""}msg "${a.text}"`);
        }
      }
      if (Object.keys(s.eem).length) L.push("!");
      break;
    }
    default: break;
  }
  return L;
}

// Interface lines, printed just before " shutdown" the way IOS orders them.
function svcIfConfig(d, n) {
  const s = d.cfg.intfs[n].svc, L = [];
  if (!s) return L;
  if (s.flowIn) L.push(" ip flow ingress");
  if (s.flowOut) L.push(" ip flow egress");
  for (const m of s.mon.input) L.push(` ip flow monitor ${m} input`);
  for (const m of s.mon.output) L.push(` ip flow monitor ${m} output`);
  if (s.autoqos) L.push(" auto qos voip trust ");
  else if (s.trust) L.push(" mls qos trust " + s.trust);
  if (!s.lldpTx) L.push(" no lldp transmit");
  if (!s.lldpRx) L.push(" no lldp receive");
  if (s.sp.input) L.push(" service-policy input " + s.sp.input);
  if (s.sp.output) L.push(" service-policy output " + s.sp.output);
  return L;
}

// ---- lab checks ------------------------------------------------------------------------------------
// qos-class {device, intf, dir, policy?, class, min?}: packets matched by a class on an interface
// qos-police {device, intf, dir, class, exceeded?, conformed?}: policer outcomes
// qos-marked {device, intf, dir, class, min?}: packets the class re-marked
// login {device, line: con|vty, user?, password, level?, ok?}: what a login attempt gets
// quiet-mode {device}: login block-for has locked logins
// snmp-access {device, from, community | user + auth + priv, write?, ok?}: can a manager there use the agent
// snmp-traps {device, host, min?}: traps sent to a host
// log-buffer {device, pattern}: a message in the logging buffer
// log-host {device, host, min?}: messages delivered to a syslog server
// ntp-sync {device, peer?, stratum?}: NTP synchronised (to a peer, at a stratum)
// flow {device, monitor, src?, dst?, min?}: flows in a Flexible NetFlow cache (or the traditional cache with no monitor)
// lldp-nbr {device, intf?, neighbor}: an LLDP neighbour seen
// eem-ran {device, applet}: an EEM applet has run
const SVC_CHECKS = {
  "qos-class": (net, c, d) => {
    const k = Object.entries(d.rt.svc.qos).find(([key]) => {
      const [i, dir, pol, cls] = key.split("|");
      return i === canonIf(d, c.intf) && dir === (c.dir || "output") && (!c.policy || pol === c.policy) && cls === c.class;
    });
    return !!k && k[1].pkts >= (c.min || 1);
  },
  "qos-police": (net, c, d) => {
    const k = Object.entries(d.rt.svc.qos).find(([key]) => { const [i, dir, , cls] = key.split("|"); return i === canonIf(d, c.intf) && dir === (c.dir || "output") && cls === c.class; });
    if (!k) return false;
    return (c.exceeded === undefined || k[1].exc[0] >= c.exceeded) && (c.conformed === undefined || k[1].conf[0] >= c.conformed);
  },
  "qos-marked": (net, c, d) => {
    const k = Object.entries(d.rt.svc.qos).find(([key]) => { const [i, dir, , cls] = key.split("|"); return i === canonIf(d, c.intf) && dir === (c.dir || "output") && cls === c.class; });
    return !!k && k[1].marked >= (c.min || 1);
  },
  login: (net, c, d) => {
    const lk = c.line || "vty";
    let r = authenticate(net, d, lk, c.user ?? null, c.password);
    if (!r) {
      // Without AAA: the line's own login setting.
      const l = lk === "con" ? d.cfg.lines.con : d.cfg.lines.vty0;
      if (l.login === "local") { const u = d.cfg.users[c.user]; r = u && (u.secret ?? u.password) === c.password ? { ok: true, user: c.user } : { ok: false }; }
      else if (l.login === "line") r = { ok: l.password !== null && l.password === c.password, user: null };
      else r = { ok: true, user: null };
    }
    if (lk === "vty" && net.svcQuiet(d.name)) r = { ok: false };
    const want = c.ok !== false;
    if (r.ok !== want) return false;
    return !r.ok || c.level === undefined || loginLevel(d, lk, r) === c.level;
  },
  "quiet-mode": (net, c, d) => net.svcQuiet(d.name),
  "snmp-access": (net, c, d) => {
    const cred = c.community !== undefined ? { community: c.community } : { user: c.user, auth: c.auth, priv: c.priv, authProto: c.authProto };
    return net.svcSnmpAccess(c.from, d.name, cred, !!c.write).ok === (c.ok !== false);
  },
  "snmp-traps": (net, c, d) => (d.rt.svc.traps[c.host] || 0) >= (c.min || 1),
  "log-buffer": (net, c, d) => d.rt.svc.log.some((l) => new RegExp(c.pattern).test(l)),
  "log-host": (net, c, d) => (d.rt.svc.counts.hosts[ip2n(c.host)] || 0) >= (c.min || 1),
  "ntp-sync": (net, c, d) => {
    const st = net.svcNtp()[d.name];
    return !!st && st.stratum < 16 && (!c.peer || (st.peer !== null && st.peer === ip2n(c.peer))) && (!c.stratum || st.stratum === c.stratum);
  },
  flow: (net, c, d) => {
    const store = c.monitor ? d.rt.svc.flows[c.monitor] || {} : d.rt.svc.tflows;
    return Object.values(store).some((e) => (!c.src || e.src === ip2n(c.src)) && (!c.dst || e.dst === ip2n(c.dst)) && e.pkts >= (c.min || 1));
  },
  "lldp-nbr": (net, c, d) => net.svcLldp(d.name).some((x) => x.dev.cfg.hostname === c.neighbor && (!c.intf || x.local === canonIf(d, c.intf))),
  "eem-ran": (net, c, d) => d.rt.svc.eem.some((h) => h.name === c.applet),
};
