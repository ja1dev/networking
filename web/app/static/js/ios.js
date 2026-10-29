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
  const base = { desc: "", shut: false, ip: null, mask: null, cdp: true, bw: null, speed: null, duplex: null };
  if (type === "router") {
    return { ...base, shut: PORTS.router.includes(name), secondary: [], helpers: [], aclIn: null, aclOut: null, ospf: {}, encap: null,
      delay: null, nat: null, standby: {}, hsrpVer: 1, ipv6: { addrs: [], ll: null, enable: false, auto: false }, ospf6: {} };
  }
  if (name.startsWith("Vlan")) return { ...base, shut: name === "Vlan1" };
  return { ...base, mode: "dynamic auto", accessVlan: 1, native: 1, allowed: null, noneg: false,
    stp: { portfast: null, bpduguard: null, cost: null, prio: null, vcost: {} }, chan: null, psec: null };
}

const newLine = (vty) => ({ password: null, login: vty ? "line" : null, transport: "all", timeout: null, sync: false });

function defaultCfg(type, name) {
  if (type === "pc") return { hostname: name, ip: null, mask: null, gw: null, dns: null, dhcp: false, dhcpServer: null, ip6: null };
  const cfg = {
    hostname: type === "router" ? "Router" : "Switch",
    enableSecret: null, enablePassword: null, pwEnc: false, banner: "", domainLookup: true, domain: "",
    users: {}, rsa: 0, sshVer: null, cdp: true, intfs: {},
    lines: { con: newLine(false), vty0: newLine(true) },
    snmp: {}, snmpLoc: null, snmpContact: null, ntp: [], logHosts: [], tz: null,
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
  for (const [n, i] of Object.entries(out.intfs)) out.intfs[n] = Object.assign(newIntf(type, n), i);
  if (type === "router" && out.ospf) out.ospf = { redistStatic: false, redistSubnets: false, ...out.ospf };
  return out;
}

const newRuntime = () => ({ mac: {}, arp: {}, bindings: {}, hits: {}, logins: [], errdis: {}, psec: {}, nat: [],
  natStats: { hits: 0, misses: 0 }, hsrp: {}, nd: {} });

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
    return d.ports.filter((p) => (!ec.members[p] || ec.members[p].flag === "I") && !this.notSwitched(d, p))
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
    if (c.mode.startsWith("private-vlan")) return "access"; // PVLAN host and promiscuous ports don't negotiate
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
    if (c.x && this.specialPort(d, port)) return this.specialVlans(d, port).carries.includes(v);
    return this.swMode(d, port) === "access" ? c.accessVlan === v : this.allowed(c, v);
  }

  ingressVlan(d, port, tag) {
    const c = d.cfg.intfs[port];
    let v;
    if (c.x && this.specialPort(d, port)) {
      const sv = this.specialVlans(d, port);
      v = tag === null ? sv.untagged : sv.tagged.includes(tag) ? tag : null;
      return v !== null && d.cfg.vlans[v] ? v : null;
    }
    if (this.swMode(d, port) === "access") v = tag === null ? c.accessVlan : null;
    else v = tag === null ? c.native : (this.allowed(c, tag) ? tag : null);
    return v !== null && d.cfg.vlans[v] ? v : null;
  }

  // The 802.1Q tag a switch puts on a VLAN-v frame leaving this port; undefined = not sent.
  egressTag(d, port, v) {
    const c = d.cfg.intfs[port];
    if (c.x && this.specialPort(d, port)) {
      const sv = this.specialVlans(d, port);
      return sv.out.includes(v) ? null : sv.tagged.includes(v) ? v : undefined;
    }
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
  bridgeId(d, v, inst) {
    if (inst !== undefined && inst !== null) return this.mstBridgeId(d, inst);
    const prio = d.cfg.stp.prio[v] ?? this.defaultBridgePrio(d);
    return [prio + v, "0cd5" + hex(d.idx, 2) + "008000"];
  }

  portId(d, p, inst) {
    const s = d.cfg.intfs[p].stp, x = d.cfg.intfs[p].x;
    const mp = inst !== undefined && inst !== null && x && x.mstPrio ? x.mstPrio[inst] : undefined;
    return { prio: mp ?? (s && s.prio) ?? 128, num: isPo(p) ? 64 + poNum(p) : d.ports.indexOf(p) + 1 };
  }

  stpCost(d, p, v, inst) {
    if (inst !== undefined && inst !== null) return this.mstCost(d, p, inst);
    const s = d.cfg.intfs[p].stp || {};
    if (s.vcost && s.vcost[v] !== undefined) return s.vcost[v];
    if (s.cost) return s.cost;
    // UplinkFast adds 3000 to every port's default cost so the switch is never chosen as a transit path.
    if (this.uplinkFast(d)) return this.defaultStpCost(d, p) + 3000;
    return this.defaultStpCost(d, p);
  }

  defaultStpCost(d, p) {
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

  // One spanning-tree computation for VLAN v. stp(v), in the CCNP switching section, combines these
  // into PVST+ per VLAN, or into the CIST and the MST instances. opt.inst(d) picks the MST instance
  // whose parameters a switch uses, opt.members limits the switches, and opt.noFilter ignores BPDU
  // filter (the tree as it would be if BPDUs still flowed, for loop guard). Returns
  // {switch: {bid, root, cost, rootPort, ports: {port: {role, state, cost, pid, type, inc}}}}.
  stpCalc(v, opt = {}) {
    const out = {};
    const sws = Object.values(this.devs).filter((d) => d.type === "switch" && d.cfg.vlans[v] && (!opt.members || opt.members.has(d.name)));
    for (const d of sws) {
      const ports = this.l2ports(d).filter((p) => this.lup(d.name, p) && this.egressTag(d, p, v) !== undefined);
      if (!ports.length) continue;
      const inst = opt.inst ? opt.inst(d) : null;
      const s = out[d.name] = { bid: this.bridgeId(d, v, inst), ports: {} };
      for (const p of ports) {
        const pid = this.portId(d, p, inst);
        s.ports[p] = { cost: this.stpCost(d, p, v, inst), pid, peer: null, inc: null, edge: this.portfast(d, p), guard: this.stpGuard(d, p) };
      }
    }
    // Which links carry this VLAN's BPDUs both ways, and which disagree about it.
    for (const [dn, s] of Object.entries(out)) {
      const d = this.devs[dn];
      for (const [p, ps] of Object.entries(s.ports)) {
        const pr = this.lpeer(dn, p), pd = pr && this.devs[pr.dev];
        if (!pd || pd.type !== "switch") continue;
        ps.edge = false;
        // BPDU filter on either end: no BPDUs cross, so neither side hears the other.
        if (!opt.noFilter && (this.bpduFilter(d, p) || this.bpduFilter(pd, pr.port))) { ps.filtered = true; continue; }
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
          // Root guard: a superior BPDU on this port is never allowed to make it the root port.
          if (!ps.peer || ps.inc || ps.guard === "root") continue;
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
        if (ps.guard === "root" && tp && !tp.inc && cmpVec([t.best[0], t.best[1]], s.root) < 0) {
          Object.assign(ps, { role: "Desg", state: "BKN", inc: "ROOT_Inc" });
          continue;
        }
        if (!tp || tp.inc) { Object.assign(ps, { role: "Desg", state: "FWD" }); continue; }
        const mine = [...s.root, s.cost, ...s.bid, pidKey(ps.pid)];
        const theirs = [t.best[0], t.best[1], t.best[2], ...t.bid, pidKey(tp.pid)];
        Object.assign(ps, cmpVec(mine, theirs) < 0 ? { role: "Desg", state: "FWD" } : { role: "Altn", state: "BLK" });
      }
    }
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
      const svi = this.sviFor(sd, v);
      if (svi) out.push({ dev: sdn, ifn: svi, trail });
      for (const port of this.l2ports(sd)) {
        if (port === inPort || !this.stpFwd(sdn, port, v)) continue;
        // Protected ports never forward to one another on the same switch.
        if (inPort && this.isProtected(sd, inPort) && this.isProtected(sd, port)) continue;
        const tag = this.egressTag(sd, port, v);
        if (tag !== undefined) send(sdn, port, tag, trail);
      }
    };
    const d = this.devs[dn];
    if (d.type === "switch" && ifn.startsWith("Vlan")) swFlood(dn, +ifn.slice(4), null, []);
    else if (!ifn.startsWith("Loopback")) {
      const enc = d.type === "router" && d.cfg.intfs[ifn].encap;
      send(dn, physOf(ifn), enc && !enc.native ? enc.vlan : null, []);
    }
    while (q.length) {
      const f = q.shift();
      const fd = this.devs[f.dn];
      if (fd.type === "switch" && !this.routedPort(fd, f.port)) {
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
    return this.fhrpVipIf(dn, ip);
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
    const statics = d.cfg.routes || [];
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
        if (!this.isL3(d)) return { ...res, fail: "drop", failAt: cur };
        if (--ttl <= 0) return { ...res, fail: "ttl", failAt: cur };
      }
      const eg = this.isL3(d) ? this.routerEgress(cur, pkt.dst) : this.hostEgress(cur, pkt.dst);
      if (eg.fail) return { ...res, fail: eg.fail, failAt: cur };
      // NAT inside-to-outside happens after routing, before the outbound ACL.
      if (!originated && d.type === "router" && d.cfg.intfs[inIf].nat === "inside" && d.cfg.intfs[eg.ifn].nat === "outside"
        && !this.natOutbound(cur, eg.ifn, pkt, opts)) return { ...res, fail: "nat", failAt: cur };
      if (!originated && d.cfg.intfs[eg.ifn].aclOut && !this.aclPermits(cur, d.cfg.intfs[eg.ifn].aclOut, pkt, opts.record)) {
        return { ...res, fail: "acl", failAt: cur };
      }
      const seg = this.flood(cur, eg.ifn);
      const live = (e) => this.ifUp(e.dev, e.ifn) && this.ifAddr(e.dev, e.ifn);
      let tgt = seg.find((e) => live(e) && this.ifAddrs(e.dev, e.ifn).some((a) => a.ip === eg.nh));
      // A VRRP master, or the GLBP forwarder the AVG hands this host, answers ARP for the virtual IP.
      if (!tgt) tgt = this.fhrpTarget(cur, eg.ifn, seg, eg.nh, opts);
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
      // Dynamic ARP inspection and IP source guard on the switches along the way.
      const guard = this.l2Guard(cur, eg.ifn, tgt, pkt, opts);
      if (guard) {
        res.links.push(...tgt.trail.slice(0, guard.at + 1));
        return { ...res, fail: guard.fail, failAt: guard.dev };
      }
      const blocked = this.psecBlock(tgt.trail, this.mac(cur, eg.ifn), opts);
      if (blocked) {
        res.links.push(...tgt.trail.slice(0, blocked.at + 1));
        return { ...res, fail: "drop", failAt: blocked.dev };
      }
      if (opts.record) this.learn(cur, eg.ifn, tgt, eg.nh, res);
      if (opts.record) this.mirror(cur, eg.ifn, tgt, pkt);
      res.links.push(...tgt.trail);
      cur = tgt.dev;
      inIf = tgt.ifn;
      originated = false;
      const td = this.devs[cur];
      res.hops.push({ dev: cur, ip: this.ifAddr(cur, tgt.ifn).ip, ifn: tgt.ifn });
      if (td.type === "router") {
        const acl = td.cfg.intfs[tgt.ifn].aclIn;
        if (acl && !this.aclPermits(cur, acl, pkt, opts.record)) return { ...res, fail: "acl", failAt: cur };
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
    const eg = this.isL3(d) ? this.routerEgress(dn, dst) : this.hostEgress(dn, dst);
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
      const eg = this.isL3(this.devs[dn]) ? this.routerEgress(dn, dst) : this.hostEgress(dn, dst);
      return { ok: false, fail: eg.fail || "noip", failAt: dn, links: [] };
    }
    const o = { ...opts, natTmp: opts.natTmp || {} };
    const there = this.deliver(dn, { src, dst, proto: "icmp", icmp: "echo", id: 1 }, o);
    if (!there.ok) return { ...there, by: this.ifFacing(there) };
    const back = this.deliver(there.at, { src: there.pkt.dst, dst: there.pkt.src, proto: "icmp", icmp: "echo-reply", id: there.pkt.id }, o);
    // The reply only counts if it comes back to us, from the address we pinged.
    const ok = back.ok && back.at === dn && back.pkt.src === dst;
    const routers = back.hops.filter((h) => this.isL3(this.devs[h.dev])).length;
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
      if (!this.isL3(this.devs[e.dev]) || !this.ifUp(e.dev, e.ifn)) continue;
      const a = this.ifAddr(e.dev, e.ifn);
      if (!a) continue;
      let server = e.dev, serverIp = a.ip;
      let pool = this.devs[e.dev].cfg.dhcp ? findPool(this.devs[e.dev], a.ip) : null;
      if (!pool) {
        for (const h of this.devs[e.dev].cfg.intfs[e.ifn].helpers || []) {
          const owner = this.ownerOf(h);
          if (!owner || this.devs[owner].type !== "router") continue;
          const p = findPool(this.devs[owner], a.ip);
          if (p && this.ping(e.dev, h, { source: a.ip }).ok) { pool = p; server = owner; serverIp = h; break; }
        }
      }
      if (!pool) continue;
      // DHCP snooping drops offers arriving on untrusted ports; option 82 needs a trusting relay or server.
      if (!this.snoopAllows(pcName, e)) continue;
      const ip = this.allocate(server, pool, pcName);
      if (ip === null) return { fail: "full" };
      this.snoopBind(pcName, e, ip);
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
    for (const [dn, msgs] of Object.entries(this.pend)) for (const m of new Set(msgs)) log(dn, m);
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
      if (this.switchingSettle(log)) { changed = true; this.touch(); }
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
        const r = this.switchingCheck(c, d, intf);
        if (r !== undefined) return r;
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
    if (d.type === "router" || n.startsWith("Vlan") || i.routed) {
      if (i.routed) L.push(" no switchport");
      for (const s of i.secondary || []) L.push(` ip address ${n2ip(s.ip)} ${n2ip(s.mask)} secondary`);
      L.push(i.ip === null ? " no ip address" : ` ip address ${n2ip(i.ip)} ${n2ip(i.mask)}`);
      if (d.type === "switch") L.push(...sviLines(i));
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
      L.push(...routerIfLines(i));
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
    } else if (!n.startsWith("Vlan") && !i.routed) {
      if (i.accessVlan !== 1) L.push(" switchport access vlan " + i.accessVlan);
      if (i.native !== 1) L.push(" switchport trunk native vlan " + i.native);
      if (i.allowed !== null) L.push(" switchport trunk allowed vlan " + (i.allowed.length ? vlanStr(i.allowed) : "none"));
      L.push(...swPortPreMode(i));
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
      L.push(...swPortLines(i));
    }
    if (i.duplex) L.push(" duplex " + i.duplex);
    if (i.speed) L.push(" speed " + i.speed);
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
  if (c.tz) L.push(`clock timezone ${c.tz[0]} ${c.tz[1]} 0`);
  if (!c.domainLookup) L.push("no ip domain lookup");
  if (c.domain) L.push("ip domain name " + c.domain);
  if (d.type === "router" && c.ipv6Routing) L.push("ipv6 unicast-routing");
  L.push(...swGlobalLines(d));
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
    L.push(...swStpLines(d));
    L.push("!", ...swVlanLines(d));
  }
  if (d.type === "router" && Object.keys(c.tracks).length) {
    for (const [n, t] of Object.entries(c.tracks).sort((a, b) => a[0] - b[0])) L.push(`track ${n} interface ${t.ifn} line-protocol`);
    L.push("!");
  }
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
  for (const h of c.logHosts) L.push("logging host " + n2ip(h));
  for (const [s, a] of Object.entries(c.snmp)) L.push(`snmp-server community ${s} ${a}`);
  if (c.snmpLoc) L.push("snmp-server location " + c.snmpLoc);
  if (c.snmpContact) L.push("snmp-server contact " + c.snmpContact);
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
  L.push("!");
  for (const s of c.ntp) L.push("ntp server " + n2ip(s));
  L.push(...tailLines(d));
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
  for (const p of trunks) L.push(pad(shortIf(p), 12) + (vlanStr(active(p).filter((v) => net.stpFwd(dn, p, v) && !net.vtpPruned(d, p, v))) || "none"));
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
    const status = net.errdis(dn, p) ? "err-disabled" : i.shut ? "disabled" : up && net.spanDest(d, p) !== null ? "monitoring" : up ? "connected" : "notconnect";
    const vlan = i.routed ? "routed" : net.swMode(d, p) === "trunk" ? "trunk" : i.accessVlan;
    const fast = ifType(p) === "FastEthernet";
    L.push(pad(shortIf(p), 10) + pad(i.desc.slice(0, 18), 19) + pad(status, 13) + pad(vlan, 11)
      + lpad(up ? "a-full" : "auto", 6) + lpad(up ? (fast ? "a-100" : "a-1000") : "auto", 7) + " " + (isPo(p) ? "" : fast ? "10/100BaseTX" : "10/100/1000BaseTX"));
  }
  return L.join("\n");
}

function showSwitchport(net, dn, p) {
  const d = net.devs[dn], i = d.cfg.intfs[p], op = net.swMode(d, p);
  if (i.routed) return [`Name: ${shortIf(p)}`, "Switchport: Disabled"].join("\n");
  const adm = { access: "static access", trunk: "trunk", "dynamic auto": "dynamic auto", "dynamic desirable": "dynamic desirable",
    "private-vlan host": "private-vlan host", "private-vlan promiscuous": "private-vlan promiscuous" }[i.mode];
  const vname = (v) => `${v} (${d.cfg.vlans[v] || "Inactive"})`;
  return [`Name: ${shortIf(p)}`, "Switchport: Enabled", `Administrative Mode: ${adm}`,
    `Operational Mode: ${net.portUp(dn, p) ? (i.mode.startsWith("private-vlan") ? i.mode : op === "trunk" ? "trunk" : "static access") : "down"}`,
    "Administrative Trunking Encapsulation: dot1q", `Negotiation of Trunking: ${i.noneg || i.mode === "access" || i.mode.startsWith("private-vlan") ? "Off" : "On"}`,
    `Access Mode VLAN: ${vname(i.accessVlan)}`, `Trunking Native Mode VLAN: ${vname(i.native)}`,
    `Trunking VLANs Enabled: ${i.allowed === null ? "ALL" : vlanStr(i.allowed) || "NONE"}`,
    `Administrative private-vlan host-association: ${xr(i).pvHost ? xr(i).pvHost.join(" (") + ")" : "none"}`,
    `Administrative private-vlan mapping: ${xr(i).pvProm ? xr(i).pvProm[0] + " (" + vlanStr(xr(i).pvProm[1]) + ")" : "none"}`,
    `Voice VLAN: ${xr(i).voice ? vname(xr(i).voice) : "none"}`, `Protected: ${xr(i).prot ? "true" : "false"}`].join("\n");
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
    `PortFast BPDU Guard Default             is ${s.bgDefault ? "enabled" : "disabled"}`,
    `Portfast BPDU Filter Default            is ${(d.cfg.stpx || {}).bpdufilter ? "enabled" : "disabled"}`,
    `Loopguard Default                       is ${(d.cfg.stpx || {}).loopguard ? "enabled" : "disabled"}`,
    "EtherChannel misconfig guard            is enabled", `UplinkFast                              is ${(d.cfg.stpx || {}).uplinkfast ? "enabled" : "disabled"}`,
    `BackboneFast                            is ${(d.cfg.stpx || {}).backbonefast ? "enabled" : "disabled"}`,
    `Configured Pathcost method used is ${s.mode === "mst" ? "long" : "short"}`, "", "Name                   Blocking Listening Learning Forwarding STP Active",
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
def("RS", both, "show ip route", (c) => {
  if (c.d.type === "switch" && !c.cfg.ipRouting) {
    c.print(`Default gateway is ${c.cfg.gateway !== null ? n2ip(c.cfg.gateway) : "not set"}`, "",
      "Host               Gateway           Last Use    Total Uses  Interface", "ICMP redirect cache is empty");
    return;
  }
  c.print(showIpRoute(c.net, c.d.name));
});
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
  if (vtpDeny(c)) return;
  for (const v of ids) {
    if (v >= 1002 && v <= 1005) { c.print(`%Default VLAN ${v} may not be modified.`); return; }
  }
  for (const v of ids) if (!c.cfg.vlans[v]) c.cfg.vlans[v] = "VLAN" + String(v).padStart(4, "0");
  c.s.enter("vlan", ids);
});
def("S", "config", "no vlan <vlans|ISL VLAN IDs 1-4094>", (c, [ids]) => {
  if (vtpDeny(c)) return;
  for (const v of ids) {
    if (v === 1 || (v >= 1002 && v <= 1005)) { c.print(`%Default VLAN ${v} may not be deleted.`); continue; }
    delete c.cfg.vlans[v];
  }
});
def("S", "vlan", "name <word|The ascii name for the VLAN>", (c, [n]) => {
  if (vtpDeny(c)) return;
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
  if (c.d.type === "switch" && !n.startsWith("Vlan") && !i.routed) { c.invalid(1); return false; }
  i.ip = null; i.mask = null;
  if (i.secondary) i.secondary = [];
  return true;
}));
def("RS", IF_MODES, "no ip address <ip|IP address> <ip|IP subnet mask>", (c, [ip, mask]) => eachIf(c, (n, i) => {
  if (c.d.type === "switch" && !n.startsWith("Vlan") && !i.routed) { c.invalid(1); return false; }
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
  // A VTP client can't create the VLAN: the port waits, inactive, until VTP brings it.
  if (!c.cfg.vlans[v] && vtpOf(c.cfg).mode !== "client") {
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
def("S", both, "show spanning-tree", (c) => c.print(c.net.isMst(c.d) ? showMstTree(c.net, c.d.name) : showSpanningTree(c.net, c.d.name)));
def("S", both, "show spanning-tree vlan <num:1-4094|VLAN Switch Spanning Tree>", (c, [v]) => c.print(c.net.isMst(c.d) && c.cfg.vlans[v]
  ? showMstTree(c.net, c.d.name, mstInstOf(c.cfg, v)) : showSpanningTree(c.net, c.d.name, v)));
def("S", both, "show spanning-tree summary", (c) => c.print(showStpSummary(c.net, c.d.name)));
def("S", both, "show spanning-tree inconsistentports", (c) => {
  const L = ["", "Name                 Interface                Inconsistency", "-------------------- ------------------------ ------------------"];
  let n = 0;
  for (const v of Object.keys(c.cfg.vlans).map(Number).sort((a, b) => a - b)) {
    const s = c.net.stp(v)[c.d.name];
    for (const [p, x] of Object.entries((s && s.ports) || {})) {
      if (!x.inc) continue;
      L.push(pad("VLAN" + String(v).padStart(4, "0"), 21) + pad(p, 25) + ({ PVID_Inc: "Port VLAN ID Mismatch", ROOT_Inc: "Root Inconsistent",
        LOOP_Inc: "Loop Inconsistent" }[x.inc] || "Port Type Inconsistent"));
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
def("RS", "config", "snmp-server community <word|SNMP community string> {RO|RW}", (c, [s, a]) => { c.cfg.snmp[s] = a.toUpperCase(); });
def("RS", "config", "no snmp-server community <word|SNMP community string>", (c, [s]) => { delete c.cfg.snmp[s]; });
def("RS", "config", "snmp-server location <line|The physical location of this node>", (c, [l]) => { c.cfg.snmpLoc = l; });
def("RS", "config", "snmp-server contact <line|identification of the contact person for this managed node>", (c, [l]) => { c.cfg.snmpContact = l; });
def("RS", "config", "no snmp-server location", (c) => { c.cfg.snmpLoc = null; });
def("RS", "config", "no snmp-server contact", (c) => { c.cfg.snmpContact = null; });
def("RS", "config", "ntp server <ip|IP address of peer>", (c, [ip]) => { if (!c.cfg.ntp.includes(ip)) c.cfg.ntp.push(ip); });
def("RS", "config", "no ntp server <ip|IP address of peer>", (c, [ip]) => { c.cfg.ntp = c.cfg.ntp.filter((x) => x !== ip); });
def("RS", "config", "logging host <ip|IP address of the logging host>", (c, [ip]) => { if (!c.cfg.logHosts.includes(ip)) c.cfg.logHosts.push(ip); });
def("RS", "config", "no logging host <ip|IP address of the logging host>", (c, [ip]) => { c.cfg.logHosts = c.cfg.logHosts.filter((x) => x !== ip); });
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

// ======== CCNP switching & services ========
// MST, STP protection and errdisable recovery, VTP, VRRP and GLBP, SPAN/RSPAN/ERSPAN, DHCP snooping,
// dynamic ARP inspection, IP source guard, storm control, private VLANs, voice VLANs, protected ports
// and layer-3 switching. Their settings live in their own keys (cfg.mst, cfg.vtp, interface .x ...)
// that are only created when something is configured, so older saved states read the defaults below.

const xOf = (i) => i.x || (i.x = {});
const xr = (i) => (i && i.x) || {};
const vlanLabel = (v) => "VLAN" + String(v).padStart(4, "0");
const sortedVlans = (vlans) => Object.keys(vlans).map(Number).sort((a, b) => a - b);

// -- MST ---------------------------------------------------------------------------------------------
const MST_DEFAULT = { name: "", rev: 0, map: {}, prio: {} };
const mstOf = (cfg) => cfg.mst || MST_DEFAULT;
function mstInstOf(cfg, v) {
  for (const [i, vs] of Object.entries(mstOf(cfg).map)) if (vs.includes(v)) return +i;
  return 0;
}
// Two switches are in the same MST region when name, revision and the VLAN-to-instance table all match.
const mstKey = (cfg) => {
  const m = mstOf(cfg);
  return JSON.stringify([m.name, m.rev, Object.keys(m.map).map(Number).sort((a, b) => a - b).map((k) => [k, m.map[k]])]);
};
const mstVlansOf = (cfg, inst) => {
  if (inst !== 0) return mstOf(cfg).map[inst] || [];
  const taken = new Set(Object.values(mstOf(cfg).map).flat());
  const out = [];
  for (let v = 1; v <= 4094; v++) if (!taken.has(v)) out.push(v);
  return out;
};

// -- VTP -----------------------------------------------------------------------------------------------
const VTP_DEFAULT = { domain: "", mode: "server", ver: 1, pw: null, rev: 0, pruning: false, primary: false };
const vtpOf = (cfg) => ({ ...VTP_DEFAULT, ...(cfg.vtp || {}) });
const vtpSet = (cfg) => (cfg.vtp = { ...VTP_DEFAULT, ...(cfg.vtp || {}) });
const vlanDb = (cfg) => JSON.stringify(sortedVlans(cfg.vlans).filter((v) => v <= 1005).map((v) => [v, cfg.vlans[v]]));
const FACTORY_DB = JSON.stringify([[1, "default"]]);

// -- FHRP addresses ----------------------------------------------------------------------------------------
const vrrpMac = (g) => dotted("00005e0001" + hex(g, 2));
const glbpMac = (g, n) => dotted("0007b400" + hex(g % 256, 2) + hex(n, 2));

Object.assign(Network.prototype, {
  now() { return Date.now() + (this.skew || 0); },

  // -- layer 3 switching --------------------------------------------------------------------------------
  isL3(d) { return d.type === "router" || (d.type === "switch" && !!d.cfg.ipRouting); },
  routedPort(d, p) { return d.type === "switch" && !!(d.cfg.intfs[p] && d.cfg.intfs[p].routed); },
  notSwitched(d, p) { return this.routedPort(d, p) || !!this.spanDest(d, p); },
  isProtected(d, p) { return !!xr(d.cfg.intfs[p]).prot; },

  // The SVI that takes VLAN v's traffic: its own, or a primary VLAN's SVI mapped to secondary VLAN v.
  sviFor(d, v) {
    if (d.cfg.intfs["Vlan" + v]) return "Vlan" + v;
    const px = d.cfg.vlanx || {};
    for (const [n, i] of Object.entries(d.cfg.intfs)) {
      if (!n.startsWith("Vlan") || !xr(i).pvMap) continue;
      const p = +n.slice(4);
      if (xr(i).pvMap.includes(v) && px[p] && px[p].pv === "primary" && (px[p].assoc || []).includes(v)) return n;
    }
    return null;
  },

  // -- voice VLANs and private VLANs: ports whose VLANs aren't just an access VLAN or a trunk ---------------
  specialPort(d, p) {
    const i = d.cfg.intfs[p];
    if (i.mode.startsWith("private-vlan")) return true;
    return !!xr(i).voice && this.swMode(d, p) === "access";
  },

  // {untagged: VLAN untagged frames land in, tagged: VLANs accepted tagged, out: VLANs sent untagged,
  // carries: every VLAN the port belongs to}
  specialVlans(d, p) {
    const i = d.cfg.intfs[p], x = xr(i), px = d.cfg.vlanx || {};
    const none = { untagged: null, tagged: [], out: [], carries: [] };
    if (i.mode === "private-vlan host") {
      if (!x.pvHost) return none;
      const [P, S] = x.pvHost;
      if (!px[P] || px[P].pv !== "primary" || !(px[P].assoc || []).includes(S) || !px[S] || !["isolated", "community"].includes(px[S].pv)) return none;
      // Isolated hosts hear only the primary VLAN (the promiscuous side); community hosts also hear their community.
      return { untagged: S, tagged: [], out: px[S].pv === "community" ? [P, S] : [P], carries: [P, S] };
    }
    if (i.mode === "private-vlan promiscuous") {
      if (!x.pvProm) return none;
      const [P, secs] = x.pvProm;
      if (!px[P] || px[P].pv !== "primary") return none;
      const ok = secs.filter((s) => (px[P].assoc || []).includes(s) && px[s]);
      return { untagged: P, tagged: [], out: [P, ...ok], carries: [P, ...ok] };
    }
    // An access port with a voice VLAN: data untagged in the access VLAN, the phone's traffic tagged.
    return { untagged: i.accessVlan, tagged: [x.voice], out: [i.accessVlan], carries: [i.accessVlan, x.voice] };
  },

  // -- spanning tree: MST, guards, UplinkFast ------------------------------------------------------------
  isMst(d) { return d.type === "switch" && d.cfg.stp.mode === "mst"; },
  uplinkFast(d) { return d.type === "switch" && d.cfg.stp.mode === "pvst" && !!(d.cfg.stpx && d.cfg.stpx.uplinkfast); },
  defaultBridgePrio(d) { return this.uplinkFast(d) ? 49152 : 32768; },
  mstBridgeId(d, inst) {
    const p = mstOf(d.cfg).prio[inst] ?? 32768;
    return [p + inst, "0cd5" + hex(d.idx, 2) + "008000"];
  },
  // MST uses the long path-cost method: 20,000,000,000 divided by the bandwidth in kbit/s.
  mstCost(d, p, inst) {
    const i = d.cfg.intfs[p], x = xr(i);
    if (x.mstCost && x.mstCost[inst] !== undefined) return x.mstCost[inst];
    if (i.stp && i.stp.cost) return i.stp.cost;
    return Math.round(2e10 / this.bandwidth(d, p));
  },
  stpGuard(d, p) {
    const g = xr(d.cfg.intfs[p]).guard;
    if (g === "root" || g === "loop") return g;
    if (g === "none") return null;
    return d.cfg.stpx && d.cfg.stpx.loopguard && !this.portfast(d, p) ? "loop" : null;
  },
  // Interface BPDU filter stops BPDUs both ways. The global default only covers PortFast ports and
  // switches itself off as soon as a BPDU arrives, so it never hides a switch.
  bpduFilter(d, p) { return d.type === "switch" && xr(d.cfg.intfs[p]).bpdufilter === true; },

  // MST regions: switches running MST with the same region configuration, joined by working links.
  mstRegions() {
    if (this.c.mstRegions) return this.c.mstRegions;
    const out = [], seen = new Set();
    for (const d of Object.values(this.devs)) {
      if (!this.isMst(d) || seen.has(d.name)) continue;
      const comp = [], q = [d.name];
      seen.add(d.name);
      while (q.length) {
        const dn = q.shift(), dd = this.devs[dn];
        comp.push(dn);
        for (const p of this.l2ports(dd)) {
          if (!this.lup(dn, p)) continue;
          const pr = this.lpeer(dn, p), pd = pr && this.devs[pr.dev];
          if (!pd || seen.has(pd.name) || !this.isMst(pd) || mstKey(pd.cfg) !== mstKey(dd.cfg)) continue;
          if (this.bpduFilter(dd, p) || this.bpduFilter(pd, pr.port)) continue;
          seen.add(pd.name);
          q.push(pd.name);
        }
      }
      out.push(comp);
    }
    return (this.c.mstRegions = out);
  },

  regionOf(dn) { return this.mstRegions().find((r) => r.includes(dn)) || null; },

  // Spanning tree for VLAN v: PVST+ (one tree per VLAN) unless some switch runs MST. Then the CIST
  // spans every switch (MST switches use their instance-0 settings), each region runs its own MST
  // instance for the VLAN, and a region's boundary ports follow the CIST in every instance.
  stp(v) {
    if (this.c.stp[v]) return this.c.stp[v];
    const sws = Object.values(this.devs).filter((d) => d.type === "switch" && d.cfg.vlans[v]);
    let out;
    if (!sws.some((d) => this.isMst(d))) out = this.stpCalc(v);
    else {
      const cist = this.stpCalc(v, { inst: (d) => (this.isMst(d) ? 0 : null) });
      out = { ...cist };
      for (const region of this.mstRegions()) {
        const inst = mstInstOf(this.devs[region[0]].cfg, v);
        if (!inst) continue;
        const members = new Set(region);
        const msti = this.stpCalc(v, { inst: () => inst, members });
        for (const dn of region) {
          const m = msti[dn], c = cist[dn];
          if (!m) continue;
          for (const [p, ps] of Object.entries(m.ports)) {
            const pr = this.lpeer(dn, p);
            if (pr && members.has(pr.dev)) continue;
            const cp = c && c.ports[p];
            if (cp) Object.assign(ps, { role: cp.role === "Root" ? "Mstr" : cp.role, state: cp.state, inc: cp.inc, boundary: true });
            else ps.boundary = true;
          }
          out[dn] = { ...m, inst, cist: c };
        }
      }
    }
    this.loopGuard(v, out);
    this.c.stp[v] = out;
    return out;
  },

  // Loop guard: a root or alternate port that stops hearing BPDUs (the far end filters them) would
  // turn designated and open a loop. Loop guard holds it blocking, loop-inconsistent, instead.
  loopGuard(v, out) {
    const hit = Object.entries(out).filter(([, s]) => Object.values(s.ports).some((p) => p.guard === "loop" && p.filtered));
    if (!hit.length) return;
    const mst = Object.values(this.devs).some((d) => this.isMst(d) && d.cfg.vlans[v]);
    const base = this.stpCalc(v, { noFilter: true, inst: mst ? (d) => (this.isMst(d) ? 0 : null) : undefined });
    for (const [dn, s] of hit) {
      for (const [p, ps] of Object.entries(s.ports)) {
        const was = base[dn] && base[dn].ports[p];
        if (ps.guard === "loop" && ps.filtered && was && (was.role === "Root" || was.role === "Altn")) {
          Object.assign(ps, { role: was.role, state: "BKN", inc: "LOOP_Inc" });
          if (s.rootPort === p) s.rootPort = null;
        }
      }
    }
  },

  // -- VTP ------------------------------------------------------------------------------------------------
  // A server (or a VTPv3 primary server) whose VLAN database changed bumps its configuration revision.
  vtpRevisions() {
    let changed = false;
    for (const d of Object.values(this.devs)) {
      if (d.type !== "switch") continue;
      const db = vlanDb(d.cfg), v = vtpOf(d.cfg);
      if (d.rt.vtpSeen === undefined) d.rt.vtpSeen = FACTORY_DB;
      if (db === d.rt.vtpSeen) continue;
      d.rt.vtpSeen = db;
      if (v.mode === "server" && (v.ver !== 3 || v.primary)) {
        vtpSet(d.cfg).rev = v.rev + 1;
        changed = true;
      }
    }
    return changed;
  },

  // Switches that hear one another's VTP advertisements: trunks between switches, relayed through
  // transparent switches. Within a domain (same password and version family) the highest
  // configuration revision overwrites everyone else's VLAN database; in VTPv3 only the primary server's does.
  vtpSync(log) {
    let changed = false;
    const sws = Object.values(this.devs).filter((d) => d.type === "switch" && vtpOf(d.cfg).mode !== "off");
    const seen = new Set();
    for (const s of sws) {
      if (seen.has(s.name)) continue;
      const comp = [], q = [s];
      seen.add(s.name);
      while (q.length) {
        const d = q.shift();
        comp.push(d);
        for (const p of this.l2ports(d)) {
          if (!this.lup(d.name, p) || this.swMode(d, p) !== "trunk") continue;
          const pr = this.lpeer(d.name, p), pd = pr && this.devs[pr.dev];
          if (!pd || pd.type !== "switch" || seen.has(pd.name) || vtpOf(pd.cfg).mode === "off" || this.swMode(pd, pr.port) !== "trunk") continue;
          seen.add(pd.name);
          q.push(pd);
        }
      }
      const parts = comp.filter((d) => ["server", "client"].includes(vtpOf(d.cfg).mode));
      // A switch with no domain name takes the domain of the first advertisement it hears.
      const named = parts.filter((d) => vtpOf(d.cfg).domain).sort((a, b) => vtpOf(b.cfg).rev - vtpOf(a.cfg).rev || a.idx - b.idx);
      for (const d of parts) {
        if (vtpOf(d.cfg).domain || !named.length) continue;
        vtpSet(d.cfg).domain = vtpOf(named[0].cfg).domain;
        log(d.name, `%SW_VLAN-6-VTP_DOMAIN_NAME_CHG: VTP domain name changed to ${d.cfg.vtp.domain}.`);
        changed = true;
      }
      const groups = {};
      for (const d of parts) {
        const v = vtpOf(d.cfg);
        if (!v.domain) continue;
        const k = [v.domain, v.pw || "", v.ver === 3 ? 3 : 1].join("|");
        (groups[k] = groups[k] || []).push(d);
      }
      for (const members of Object.values(groups)) {
        let winner;
        if (vtpOf(members[0].cfg).ver === 3) winner = members.find((d) => vtpOf(d.cfg).mode === "server" && vtpOf(d.cfg).primary);
        else {
          const top = Math.max(...members.map((d) => vtpOf(d.cfg).rev));
          const best = members.filter((d) => vtpOf(d.cfg).rev === top);
          // Equal revisions with different databases: an MD5 digest mismatch, and nobody updates.
          winner = best.every((d) => vlanDb(d.cfg) === vlanDb(best[0].cfg)) ? best[0] : null;
        }
        if (!winner) continue;
        const w = vtpOf(winner.cfg);
        for (const d of members) {
          if (d === winner) continue;
          const v = vtpOf(d.cfg);
          if (v.rev === w.rev && vlanDb(d.cfg) === vlanDb(winner.cfg) && v.pruning === w.pruning) continue;
          const ext = Object.fromEntries(Object.entries(d.cfg.vlans).filter(([k]) => +k > 1005));
          d.cfg.vlans = { ...Object.fromEntries(Object.entries(winner.cfg.vlans).filter(([k]) => +k <= 1005)), ...ext };
          const wx = winner.cfg.vlanx || {};
          const keep = Object.fromEntries(Object.entries(d.cfg.vlanx || {}).filter(([k]) => +k > 1005));
          const copy = Object.fromEntries(Object.entries(wx).filter(([k]) => +k <= 1005).map(([k, x]) => [k, clone(x)]));
          if (Object.keys(copy).length || Object.keys(keep).length) d.cfg.vlanx = { ...copy, ...keep };
          else delete d.cfg.vlanx;
          Object.assign(vtpSet(d.cfg), { rev: w.rev, pruning: w.pruning, ver: v.ver === 3 ? 3 : Math.max(v.ver, w.ver) });
          d.rt.vtpSeen = vlanDb(d.cfg);
          changed = true;
        }
      }
    }
    return changed;
  },

  // VTP pruning: a VLAN nothing downstream of a trunk uses isn't sent down it.
  vtpPruned(d, p, v) {
    const vt = vtpOf(d.cfg);
    if (!vt.pruning || !["server", "client"].includes(vt.mode) || v === 1 || v > 1001) return false;
    const pr = this.lpeer(d.name, p);
    return !!pr && !this.vlanNeeded(pr.dev, pr.port, v, new Set([d.name]));
  },

  vlanNeeded(dn, inPort, v, seen) {
    const d = this.devs[dn];
    if (d.type !== "switch") return true;
    if (seen.has(dn)) return false;
    seen.add(dn);
    if (d.cfg.intfs["Vlan" + v] && !d.cfg.intfs["Vlan" + v].shut) return true;
    for (const p of this.l2ports(d)) {
      if (p === inPort || !this.lup(dn, p)) continue;
      if (this.swMode(d, p) === "access") { if (this.carries(d, p, v)) return true; continue; }
      if (!this.allowed(d.cfg.intfs[p], v)) continue;
      const pr = this.lpeer(dn, p);
      if (pr && this.vlanNeeded(pr.dev, pr.port, v, seen)) return true;
    }
    return false;
  },

  // -- errdisable recovery and CDP native VLAN checks --------------------------------------------------
  errRecover(log) {
    let changed = false;
    for (const d of Object.values(this.devs)) {
      if (d.type !== "switch") continue;
      const at = d.rt.errAt = d.rt.errAt || {}, er = d.cfg.errRec;
      for (const [p, cause] of Object.entries(d.rt.errdis)) {
        if (at[p] === undefined) { at[p] = this.now(); continue; }
        if (!er || !(er.causes.includes(cause) || er.causes.includes("all"))) continue;
        if (this.now() - at[p] < er.interval * 1000) continue;
        delete d.rt.errdis[p];
        delete at[p];
        if (d.rt.psec[p]) d.rt.psec[p].dyn = [];
        log(d.name, `%PM-4-ERR_RECOVER: Attempting to recover from ${cause} err-disable state on ${shortIf(p)}`);
        changed = true;
      }
      for (const p of Object.keys(at)) if (!d.rt.errdis[p]) delete at[p];
    }
    return changed;
  },

  cdpNative(log) {
    for (const d of Object.values(this.devs)) {
      if (d.type !== "switch") continue;
      const now = {};
      for (const p of d.ports) {
        const pr = this.peer(d.name, p), pd = pr && this.devs[pr.dev];
        if (!pd || pd.type !== "switch" || !d.cfg.cdp || !pd.cfg.cdp || !d.cfg.intfs[p].cdp || !pd.cfg.intfs[pr.port].cdp) continue;
        if (!this.portUp(d.name, p) || this.swMode(d, p) !== "trunk" || this.swMode(pd, pr.port) !== "trunk") continue;
        const a = d.cfg.intfs[p].native, b = pd.cfg.intfs[pr.port].native;
        if (a === b) continue;
        now[p] = a + "|" + b;
        if ((d.rt.cdpNative || {})[p] !== now[p]) {
          log(d.name, `%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on ${p} (${a}), with ${pd.cfg.hostname} ${pr.port} (${b}).`);
        }
      }
      d.rt.cdpNative = now;
    }
  },

  switchingSettle(log) {
    let changed = false;
    if (this.vtpRevisions()) changed = true;
    if (this.vtpSync(log)) changed = true;
    if (this.errRecover(log)) changed = true;
    this.cdpNative(log);
    if (this.vrrpSettle(log)) changed = true;
    if (this.glbpSettle(log)) changed = true;
    return changed;
  },

  // -- VRRP ---------------------------------------------------------------------------------------------
  fhrpParts(kind) {
    const parts = [];
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router") continue;
      for (const [ifn, c] of Object.entries(d.cfg.intfs)) {
        for (const [g, gc] of Object.entries(c[kind] || {})) {
          const a = this.ifAddr(d.name, ifn);
          // A GLBP router may leave the virtual IP out and learn it from the AVG; VRRP needs it configured.
          parts.push({ dev: d.name, ifn, g: +g, gc, key: ifn + "|" + g, ip: a ? a.ip : null,
            up: this.ifUp(d.name, ifn) && !!a && (kind === "glbp" || gc.ip !== null) && !gc.shut });
        }
      }
    }
    return parts;
  },

  // Group members that hear each other on the same segment (same group number and matching settings).
  fhrpClusters(parts, same) {
    const root = parts.map((_, i) => i);
    const find = (i) => (root[i] === i ? i : (root[i] = find(root[i])));
    parts.forEach((a, i) => {
      if (!a.up) return;
      for (const e of this.flood(a.dev, a.ifn)) {
        const j = parts.findIndex((b) => b.dev === e.dev && b.ifn === e.ifn && b.g === a.g && b.up && same(a, b));
        if (j >= 0) root[find(i)] = find(j);
      }
    });
    const clusters = new Map();
    parts.forEach((p, i) => { const r = find(i); if (!clusters.has(r)) clusters.set(r, []); clusters.get(r).push(p); });
    return [...clusters.values()];
  },

  vrrpPrio(m) {
    if (m.gc.ip === m.ip) return 255; // the address owner
    return Math.max(1, m.gc.prio - m.gc.tracks.reduce((s, t) => s + (this.trackUp(m.dev, t.obj) ? 0 : t.dec), 0));
  },

  vrrpSettle(log) {
    const parts = this.fhrpParts("vrrp");
    let changed = false;
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router" || !d.rt.vrrp) continue;
      for (const k of Object.keys(d.rt.vrrp)) if (!parts.some((p) => p.dev === d.name && p.key === k)) { delete d.rt.vrrp[k]; changed = true; }
    }
    for (const members of this.fhrpClusters(parts, (a, b) => !!a.gc.v3 === !!b.gc.v3 && (a.gc.auth || null) === (b.gc.auth || null))) {
      const live = members.filter((m) => m.up);
      const stateOf = (m) => ((this.devs[m.dev].rt.vrrp || {})[m.key] || {}).state || "Init";
      const better = (a, b) => this.vrrpPrio(a) > this.vrrpPrio(b) || (this.vrrpPrio(a) === this.vrrpPrio(b) && a.ip > b.ip);
      const ranked = [...live].sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : 0));
      let master = live.find((m) => stateOf(m) === "Master") || ranked[0] || null;
      // VRRP preempts by default; the address owner always takes over.
      if (master && ranked[0] !== master && better(ranked[0], master) && (ranked[0].gc.preempt || this.vrrpPrio(ranked[0]) === 255)) master = ranked[0];
      for (const m of members) {
        const next = !m.up ? "Init" : m === master ? "Master" : "Backup";
        const d = this.devs[m.dev], rt = d.rt.vrrp = d.rt.vrrp || {};
        const prev = rt[m.key] || { state: "Init", vip: null, seen: [] };
        const vip = master ? master.gc.ip : m.gc.ip;
        if (prev.state !== next) {
          const steps = prev.state === "Init" && next === "Master" ? ["Init", "Backup", "Master"] : [prev.state, next];
          for (let i = 1; i < steps.length; i++) {
            log(m.dev, m.gc.v3 ? `%VRRP-6-STATE: ${m.ifn} IPv4 group ${m.g} state ${steps[i - 1].toUpperCase()} -> ${steps[i].toUpperCase()}`
              : `%VRRP-6-STATECHANGE: ${shortIf(m.ifn)} Grp ${m.g} state ${steps[i - 1]} -> ${steps[i]}`);
          }
        }
        if (prev.state !== next || prev.vip !== vip) {
          rt[m.key] = { state: next, vip, master: master ? master.ip : null, seen: prev.seen.includes(next) ? prev.seen : prev.seen.concat([next]) };
          changed = true;
        }
      }
    }
    return changed;
  },

  vrrpMaster(dn, ifn, ip) {
    const d = this.devs[dn], c = d.cfg.intfs[ifn];
    for (const [g, gc] of Object.entries((c && c.vrrp) || {})) {
      const st = (d.rt.vrrp || {})[ifn + "|" + g];
      if (st && st.state === "Master" && (gc.ip === ip || (gc.sec || []).includes(ip))) return +g;
    }
    return null;
  },

  // -- GLBP ----------------------------------------------------------------------------------------------
  glbpWeight(m) {
    const w = m.gc.weight;
    return Math.max(0, w.max - (m.gc.wtracks || []).reduce((s, t) => s + (this.trackUp(m.dev, t.obj) ? 0 : t.dec), 0));
  },

  glbpSettle(log) {
    const parts = this.fhrpParts("glbp");
    let changed = false;
    for (const d of Object.values(this.devs)) {
      if (d.type !== "router" || !d.rt.glbp) continue;
      for (const k of Object.keys(d.rt.glbp)) if (!parts.some((p) => p.dev === d.name && p.key === k)) { delete d.rt.glbp[k]; changed = true; }
    }
    for (const members of this.fhrpClusters(parts, (a, b) => (a.gc.auth || null) === (b.gc.auth || null))) {
      const rtOf = (m) => {
        const d = this.devs[m.dev];
        d.rt.glbp = d.rt.glbp || {};
        return d.rt.glbp[m.key] || { state: "Init", vip: null, fwd: {}, hosts: {}, rr: 0, num: null, off: false, seen: [] };
      };
      const live = members.filter((m) => m.up);
      const prio = (m) => m.gc.prio;
      const better = (a, b) => prio(a) > prio(b) || (prio(a) === prio(b) && a.ip > b.ip);
      const ranked = [...live].sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : 0));
      let avg = live.find((m) => rtOf(m).state === "Active") || ranked[0] || null;
      if (avg && ranked[0] !== avg && better(ranked[0], avg) && ranked[0].gc.preempt) avg = ranked[0];
      const standby = ranked.find((m) => m !== avg) || null;
      // Weighting below the lower threshold stops a router forwarding until it climbs back over the upper one.
      const off = new Map(live.map((m) => {
        const w = this.glbpWeight(m), was = rtOf(m).off, lo = m.gc.weight.lower, hi = m.gc.weight.upper ?? m.gc.weight.max;
        return [m, lo !== null && lo !== undefined ? (was ? w < hi : w < lo) : w === 0];
      }));
      // Virtual forwarder numbers stick to a router; newcomers take the lowest free one (up to four).
      const nums = new Map(members.map((m) => [m, rtOf(m).num]));
      for (const m of [avg, ...ranked.filter((x) => x !== avg)].filter(Boolean)) {
        if (nums.get(m)) continue;
        const used = new Set([...nums.values()].filter(Boolean));
        const n = [1, 2, 3, 4].find((k) => !used.has(k));
        if (n) nums.set(m, n);
      }
      // A forwarder outlives its owner: when that router goes away another one takes over its virtual MAC.
      const allNums = new Set([...nums.values(), ...members.flatMap((m) => Object.keys(rtOf(m).fwd).map(Number))].filter(Boolean));
      const fwdOwner = {};
      for (const n of [...allNums].sort((a, b) => a - b)) {
        const m = [...nums].find(([, k]) => k === n)?.[0];
        let owner = m && m.up && !off.get(m) ? m : null;
        if (!owner) {
          // Another forwarder takes over the virtual MAC: the highest weighting, then priority.
          const cand = live.filter((x) => !off.get(x)).sort((a, b) => this.glbpWeight(b) - this.glbpWeight(a) || (better(a, b) ? -1 : 1));
          owner = cand[0] || null;
        }
        fwdOwner[n] = owner;
      }
      const hosts = Object.assign({}, ...members.map((m) => rtOf(m).hosts));
      const rr = Math.max(0, ...members.map((m) => rtOf(m).rr || 0));
      for (const m of members) {
        const next = !m.up ? "Init" : m === avg ? "Active" : m === standby ? "Standby" : "Listen";
        const prev = rtOf(m);
        const fwd = {};
        for (const [n, o] of Object.entries(fwdOwner)) if (m.up) fwd[n] = o === m ? "Active" : "Listen";
        if (prev.state !== next) {
          const steps = prev.state === "Init" && next === "Active" ? ["Speak", "Standby", "Active"] : prev.state === "Init" ? ["Speak", next] : [prev.state, next];
          for (let i = 1; i < steps.length; i++) log(m.dev, `%GLBP-6-STATECHANGE: ${m.ifn} Grp ${m.g} state ${steps[i - 1]} -> ${steps[i]}`);
        }
        for (const [n, s] of Object.entries(fwd)) {
          const was = prev.fwd[n] || "Init";
          if (was !== s && (s === "Active" || was === "Active")) log(m.dev, `%GLBP-6-FWDSTATECHANGE: ${m.ifn} Grp ${m.g} Fwd ${n} state ${was} -> ${s}`);
        }
        const vip = (avg && avg.gc.ip !== null ? avg.gc.ip : null) ?? (live.find((x) => x.gc.ip !== null) || { gc: {} }).gc.ip ?? null;
        // The most forwarders this router has carried at once, so a lab can see a takeover that has since ended.
        const peak = Math.max(prev.peak || 0, Object.values(fwd).filter((x) => x === "Active").length);
        const nextRt = { state: next, vip, fwd, hosts, rr, num: nums.get(m) || null, off: !!off.get(m), peak,
          avg: avg ? avg.ip : null, standby: standby ? standby.ip : null,
          seen: prev.seen.includes(next) ? prev.seen : prev.seen.concat([next]) };
        if (JSON.stringify(nextRt) !== JSON.stringify(prev)) { this.devs[m.dev].rt.glbp[m.key] = nextRt; changed = true; }
      }
    }
    return changed;
  },

  glbpForwarding(dn, ifn, ip) {
    const d = this.devs[dn], c = d.cfg.intfs[ifn];
    for (const [g, gc] of Object.entries((c && c.glbp) || {})) {
      const st = (d.rt.glbp || {})[ifn + "|" + g];
      if (st && st.vip === ip && Object.values(st.fwd).includes("Active")) return +g;
    }
    return null;
  },

  // The interface on which this router answers for virtual IP ip as VRRP master or a GLBP forwarder.
  fhrpVipIf(dn, ip) {
    const d = this.devs[dn];
    if (d.type !== "router") return null;
    for (const ifn of Object.keys(d.cfg.intfs)) {
      if (!this.ifUp(dn, ifn)) continue;
      if (this.vrrpMaster(dn, ifn, ip) !== null || this.glbpForwarding(dn, ifn, ip) !== null) return ifn;
    }
    return null;
  },

  // Who answers ARP for next hop nh: a VRRP master, or the GLBP forwarder the AVG hands this host.
  fhrpTarget(cur, ifn, seg, nh, opts) {
    const live = (e) => this.ifUp(e.dev, e.ifn) && this.ifAddr(e.dev, e.ifn) && this.devs[e.dev].type === "router";
    for (const e of seg) {
      if (!live(e)) continue;
      const g = this.vrrpMaster(e.dev, e.ifn, nh);
      if (g !== null) return { ...e, vmac: vrrpMac(g), vip: nh };
    }
    for (const e of seg) {
      if (!live(e)) continue;
      const c = this.devs[e.dev].cfg.intfs[e.ifn];
      for (const [g, gc] of Object.entries(c.glbp || {})) {
        const st = (this.devs[e.dev].rt.glbp || {})[e.ifn + "|" + g];
        if (!st || st.state !== "Active" || st.vip !== nh) continue;
        const n = this.glbpAssign(e, +g, st, this.mac(cur, ifn), opts);
        if (n === null) return null;
        const f = seg.find((x) => live(x) && ((this.devs[x.dev].rt.glbp || {})[x.ifn + "|" + g] || { fwd: {} }).fwd[n] === "Active");
        return f ? { ...f, vmac: glbpMac(+g, n), vip: nh } : null;
      }
    }
    return null;
  },

  // The AVG's answer to a host's ARP for the virtual IP: which forwarder's virtual MAC it gets.
  glbpAssign(avg, g, st, hostMac, opts) {
    if (st.hosts[hostMac]) return st.hosts[hostMac];
    const nums = Object.entries(st.fwd).filter(([, s]) => s !== undefined).map(([n]) => +n).sort((a, b) => a - b);
    const active = nums.filter((n) => Object.values(this.devs).some((d) => d.type === "router"
      && Object.values(d.rt.glbp || {}).some((x) => x.vip === st.vip && x.fwd[n] === "Active")));
    if (!active.length) return null;
    const gc = this.devs[avg.dev].cfg.intfs[avg.ifn].glbp[g];
    let n;
    if (gc.lb === "host-dependent") n = active[parseInt(hostMac.replace(/\./g, "").slice(-4), 16) % active.length];
    else if (gc.lb === "weighted") {
      const w = active.map((k) => {
        const owner = Object.values(this.devs).find((d) => d.type === "router" && Object.values(d.rt.glbp || {}).some((x) => x.vip === st.vip && x.fwd[k] === "Active"));
        const m = owner && Object.entries(owner.cfg.intfs).flatMap(([i, c]) => Object.values(c.glbp || {}).filter((x) => x.ip === st.vip).map((x) => ({ dev: owner.name, ifn: i, gc: x })))[0];
        return m ? Math.max(1, this.glbpWeight(m)) : 1;
      });
      const total = w.reduce((a, b) => a + b, 0);
      let k = st.rr % total, i = 0;
      while (k >= w[i]) { k -= w[i]; i++; }
      n = active[i];
    } else n = active[st.rr % active.length];
    if (opts.record) {
      // Every member keeps the AVG's table so a standby AVG carries on where it left off.
      const rr = (st.rr || 0) + 1;
      for (const d of Object.values(this.devs)) {
        for (const x of Object.values(d.rt.glbp || {})) if (x.vip === st.vip) { x.hosts = { ...x.hosts, [hostMac]: n }; x.rr = rr; }
      }
    }
    return n;
  },

  // -- SPAN, RSPAN and ERSPAN ------------------------------------------------------------------------------
  spanDest(d, p) {
    for (const [id, s] of Object.entries(d.cfg.span || {})) if (s.dst && s.dst.ifn === p) return id;
    return null;
  },

  // Copy a frame that crossed monitored ports or VLANs to every matching session.
  mirror(cur, ifn, tgt, pkt) {
    const hits = new Map();
    const add = (dn, id) => { if (!hits.has(dn)) hits.set(dn, new Set()); hits.get(dn).add(id); };
    const match = (dn, port, vlan, dir) => {
      const d = this.devs[dn];
      for (const [id, s] of Object.entries(d.cfg.span || {})) {
        for (const src of s.src || []) {
          if (src.dir !== "both" && src.dir !== dir) continue;
          const portHit = src.ifn && (src.ifn === port || (isPo(port) && d.cfg.intfs[src.ifn] && d.cfg.intfs[src.ifn].chan && d.cfg.intfs[src.ifn].chan.group === poNum(port))
            || physOf(port) === src.ifn);
          if (portHit || (src.vlans && vlan !== null && src.vlans.includes(vlan))) add(dn, id);
        }
      }
    };
    if (this.devs[cur].type === "router") match(cur, ifn, null, "tx");
    if (this.devs[tgt.dev].type === "router") match(tgt.dev, tgt.ifn, null, "rx");
    tgt.trail.forEach((h, i) => {
      if (this.devs[h.a].type === "switch") match(h.a, h.ap, i > 0 ? tgt.trail[i - 1].vlan : (ifn.startsWith("Vlan") ? +ifn.slice(4) : null), "tx");
      if (this.devs[h.b].type === "switch") match(h.b, h.bp, h.vlan, "rx");
    });
    for (const [dn, ids] of hits) for (const id of ids) this.spanCopy(dn, id, pkt);
  },

  spanRt(dn, id) {
    const rt = this.devs[dn].rt;
    rt.span = rt.span || {};
    return (rt.span[id] = rt.span[id] || { sent: 0, copies: 0, last: [] });
  },

  spanCopy(dn, id, pkt) {
    const d = this.devs[dn], s = d.cfg.span[id], src = this.spanRt(dn, id);
    const note = { src: pkt.src, dst: pkt.dst, proto: pkt.proto };
    const deliver = (rdn, rid) => {
      const r = this.spanRt(rdn, rid);
      r.copies++;
      r.last = [...r.last, note].slice(-5);
    };
    src.sent++;
    if (s.kind === "local" && s.dst && this.portUp(dn, s.dst.ifn)) deliver(dn, id);
    if (s.kind === "rspan-src" && s.remoteVlan) {
      for (const rdn of this.rspanReach(dn, s.remoteVlan)) {
        const rd = this.devs[rdn];
        for (const [rid, rs] of Object.entries(rd.cfg.span || {})) {
          if (rs.kind === "rspan-dst" && rs.remoteVlan === s.remoteVlan && rs.dst && this.portUp(rdn, rs.dst.ifn)) deliver(rdn, rid);
        }
      }
    }
    if (s.kind === "erspan-src" && !s.shut && s.erspan && s.erspan.ip !== null && s.erspan.origin !== null) {
      const owner = this.ownerOf(s.erspan.ip);
      if (owner && this.ping(dn, s.erspan.ip, { source: s.erspan.origin }).ok) {
        const od = this.devs[owner];
        const rid = Object.keys(od.cfg.span || {}).find((k) => od.cfg.span[k].kind === "erspan-dst" && od.cfg.span[k].erspan
          && od.cfg.span[k].erspan.id === s.erspan.id && !od.cfg.span[k].shut);
        if (rid) deliver(owner, rid);
        else { od.rt.erspanRx = (od.rt.erspanRx || 0) + 1; src.copies++; }
      }
    }
  },

  // Switches an RSPAN VLAN reaches from dn: the VLAN must exist as remote-span on every switch on the way.
  rspanReach(dn, v) {
    const ok = (d) => d.type === "switch" && d.cfg.vlans[v] && (d.cfg.vlanx || {})[v] && d.cfg.vlanx[v].rspan;
    if (!ok(this.devs[dn])) return [];
    const seen = new Set([dn]), q = [dn];
    while (q.length) {
      const x = this.devs[q.shift()];
      for (const p of this.l2ports(x)) {
        if (!this.lup(x.name, p) || this.egressTag(x, p, v) === undefined || !this.stpFwd(x.name, p, v)) continue;
        const pr = this.lpeer(x.name, p), pd = pr && this.devs[pr.dev];
        if (!pd || seen.has(pd.name) || !ok(pd) || this.ingressVlan(pd, pr.port, this.egressTag(x, p, v)) !== v) continue;
        seen.add(pd.name);
        q.push(pd.name);
      }
    }
    return [...seen];
  },

  // -- DHCP snooping, dynamic ARP inspection, IP source guard ---------------------------------------------
  snoopOn(d, v) { const s = d.cfg.snoop; return d.type === "switch" && !!s && s.on && s.vlans.includes(v); },
  snoopTrusted(d, p) { return !!xr(d.cfg.intfs[p]).snoopTrust; },

  // Can the client on pcName get a lease through flood entry e (a server or relay interface)?
  snoopAllows(pcName, e) {
    const t = e.trail;
    let opt82 = false;
    for (let i = 0; i < t.length; i++) {
      const sw = this.devs[t[i].b];
      if (sw.type === "switch" && t[i].vlan !== null && this.snoopOn(sw, t[i].vlan) && !this.snoopTrusted(sw, t[i].bp)) {
        if (sw.cfg.snoop.opt82 !== false) opt82 = true;
      }
      // The server's offer comes back the other way and enters switch t[i].a on port t[i].ap.
      const back = this.devs[t[i].a];
      if (i > 0 && back.type === "switch" && t[i - 1].vlan !== null && this.snoopOn(back, t[i - 1].vlan) && !this.snoopTrusted(back, t[i].ap)) {
        this.note(back.name, `%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: ${this.mac(e.dev, e.ifn)}`);
        return false;
      }
    }
    // Option 82 with a zero giaddr: an IOS server or relay drops it unless it trusts that information.
    const r = this.devs[e.dev];
    if (opt82 && !r.cfg.dhcpTrustAll && !xr(r.cfg.intfs[e.ifn]).relayTrust) return false;
    return true;
  },

  snoopBind(pcName, e, ip) {
    const mac = this.mac(pcName, "eth0");
    for (const h of e.trail) {
      const sw = this.devs[h.b];
      if (sw.type !== "switch" || h.vlan === null || !this.snoopOn(sw, h.vlan) || this.snoopTrusted(sw, h.bp)) continue;
      sw.rt.snoop = sw.rt.snoop || {};
      sw.rt.snoop[mac] = { ip, vlan: h.vlan, port: h.bp };
    }
  },

  daiOn(d, v) { return d.type === "switch" && !!d.cfg.dai && d.cfg.dai.vlans.includes(v); },

  arpOk(d, v, ip, mac) {
    const f = (d.cfg.dai.filters || {})[v];
    const acl = f && (d.cfg.arpAcls || {})[f.acl];
    if (acl && acl.some((e) => e.ip === ip && (e.mac === null || e.mac === mac))) return true;
    if (f && f.static) return false;
    return Object.entries(d.rt.snoop || {}).some(([m, b]) => m === mac && b.ip === ip && b.vlan === v);
  },

  // DAI checks the ARP request and reply crossing each switch; IP source guard checks the packet's source.
  l2Guard(cur, ifn, tgt, pkt, opts) {
    const t = tgt.trail;
    if (!t.some((h) => [h.a, h.b].some((x) => this.devs[x].type === "switch" && (this.devs[x].cfg.dai || this.devs[x].cfg.ipsg)))) return null;
    const me = { ip: (this.ifAddr(cur, ifn) || {}).ip ?? null, mac: this.mac(cur, ifn) };
    const ta = this.ifAddr(tgt.dev, tgt.ifn);
    // The ARP reply comes from the address that was asked for: a virtual IP when a VRRP or GLBP router answers.
    const them = { ip: tgt.vip ?? (ta ? ta.ip : null), mac: tgt.vmac || this.mac(tgt.dev, tgt.ifn) };
    const deny = (sw, port, v, who, other, kind) => {
      if (opts.record) {
        sw.rt.daiDrops = (sw.rt.daiDrops || 0) + 1;
        this.note(sw.name, `%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (${kind}) on ${shortIf(port)}, vlan ${v}.([${who.mac}/${n2ip(who.ip ?? 0)}/0000.0000.0000/${n2ip(other.ip ?? 0)}/${clock().split(" ").pop().slice(0, 8)} UTC ${clock().slice(0, 6).replace(/\s+/g, " ")}])`);
      }
    };
    for (let i = 0; i < t.length; i++) {
      const h = t[i], sw = this.devs[h.b];
      if (sw.type !== "switch" || h.vlan === null) continue;
      if (this.daiOn(sw, h.vlan) && !xr(sw.cfg.intfs[h.bp]).arpTrust && !this.arpOk(sw, h.vlan, me.ip, me.mac)) {
        deny(sw, h.bp, h.vlan, me, them, "Req");
        return { at: i, dev: sw.name, fail: "arp" };
      }
      const g = xr(sw.cfg.intfs[h.bp]).ipsg;
      if (g && i === 0) {
        const ok = Object.entries(sw.rt.snoop || {}).some(([m, b]) => b.port === h.bp && b.ip === pkt.src && (g !== "mac" || m === me.mac));
        if (!ok) return { at: i, dev: sw.name, fail: "drop" };
      }
    }
    for (let i = t.length - 1; i >= 0; i--) {
      const h = t[i], sw = this.devs[h.a];
      if (sw.type !== "switch") continue;
      const v = i > 0 ? t[i - 1].vlan : (ifn.startsWith("Vlan") ? +ifn.slice(4) : null);
      if (v === null || !this.daiOn(sw, v) || xr(sw.cfg.intfs[h.ap]).arpTrust || this.arpOk(sw, v, them.ip, them.mac)) continue;
      deny(sw, h.ap, v, them, me, "Res");
      return { at: i, dev: sw.name, fail: "arp" };
    }
    return null;
  },

  // -- lab checks for this section ---------------------------------------------------------------------
  switchingCheck(c, d, intf) {
    switch (c.type) {
      case "mst-root": {
        const v = mstVlansOf(d.cfg, c.instance).find((x) => d.cfg.vlans[x]);
        const s = v && this.stp(v)[d.name];
        return !!s && this.isMst(d) && s.rootPort === null && cmpVec(s.root, s.bid) === 0;
      }
      case "mst-port": {
        const v = mstVlansOf(d.cfg, c.instance).find((x) => d.cfg.vlans[x]);
        const p = v && this.stp(v)[d.name] && this.stp(v)[d.name].ports[intf];
        return !!p && (!c.role || p.role === c.role) && (!c.state || p.state === c.state);
      }
      case "mst-region": {
        const r = this.regionOf(d.name);
        return !!r && r.includes(c.peer) && (!c.name || mstOf(d.cfg).name === c.name);
      }
      case "stp-inconsistent": {
        const s = this.stp(c.vlan)[d.name], p = s && s.ports[intf];
        return !!p && p.inc === { root: "ROOT_Inc", loop: "LOOP_Inc", pvid: "PVID_Inc", type: "TYPE_Inc" }[c.kind];
      }
      case "errdisable-recovery": {
        const er = d.cfg.errRec;
        return !!er && (er.causes.includes(c.cause) || er.causes.includes("all")) && (!c.interval || er.interval === c.interval);
      }
      case "vtp": {
        const v = vtpOf(d.cfg);
        return (!c.mode || v.mode === c.mode) && (c.domain === undefined || v.domain === c.domain) && (!c.version || v.ver === c.version)
          && (c.pruning === undefined || v.pruning === c.pruning) && (c.password === undefined || v.pw === c.password)
          && (c.maxRevision === undefined || v.rev <= c.maxRevision);
      }
      case "vtp-vlan": {
        const has = d.cfg.vlans[c.vlan] !== undefined && (!c.name || d.cfg.vlans[c.vlan] === c.name);
        return c.absent ? !has : has;
      }
      case "fhrp": {
        const st = ((d.rt[c.proto] || {})[intf + "|" + c.group] || {});
        return c.seen ? (st.seen || []).includes(c.state) : st.state === c.state;
      }
      case "glbp-forwarding": {
        const st = ((d.rt.glbp || {})[intf + "|" + c.group] || {});
        if (c.peak) return (st.peak || 0) >= c.count;
        return Object.values(st.fwd || {}).filter((s) => s === "Active").length >= c.count;
      }
      case "rspan-vlan": return !!d.cfg.vlans[c.vlan] && !!((d.cfg.vlanx || {})[c.vlan] || {}).rspan;
      case "glbp-hosts": {
        const st = ((d.rt.glbp || {})[intf + "|" + c.group] || {});
        return new Set(Object.values(st.hosts || {})).size >= c.distinct;
      }
      case "span": {
        const s = (d.cfg.span || {})[c.session];
        return !!s && (!c.kind || s.kind === c.kind) && (!c.dest || (s.dst && s.dst.ifn === canonIf(d, c.dest)))
          && (!c.source || (s.src || []).some((x) => x.ifn === canonIf(d, c.source))) && (!c.vlan || (s.src || []).some((x) => (x.vlans || []).includes(c.vlan)));
      }
      case "span-copies": return ((d.rt.span || {})[c.session] || { copies: 0 }).copies >= c.min;
      case "snoop-binding": {
        return Object.values(d.rt.snoop || {}).some((b) => (!c.ip || b.ip === ip2n(c.ip)) && (!intf || b.port === intf));
      }
      case "dai-drops": return (d.rt.daiDrops || 0) >= (c.min || 1);
      case "ip-routing": return !!d.cfg.ipRouting;
      case "routed-port": return this.routedPort(d, intf);
      case "pvlan-port": {
        const i = d.cfg.intfs[intf];
        return i.mode === "private-vlan " + c.mode && this.specialVlans(d, intf).untagged !== null;
      }
      case "voice-vlan": return xr(d.cfg.intfs[intf]).voice === c.vlan && this.carries(d, intf, c.vlan);
      default: return undefined;
    }
  },

  // Console messages raised for a device whose own console wasn't the one typing: they wait here
  // until that console's next input shows them, unless the lab page already showed them.
  queueConsole(home, events) {
    this.conq = this.conq || {};
    const out = [];
    for (const [dn, msgs] of Object.entries(events)) {
      if (dn === home || this.devs[dn].type === "pc" || !msgs.length) continue;
      const items = msgs.map((m) => "*" + clock() + ": " + m);
      this.conq[dn] = [...(this.conq[dn] || []), ...items].slice(-200);
      out.push([dn, items]);
    }
    return out;
  },
  unqueueConsole(dn, items) {
    if (!this.conq || !this.conq[dn]) return;
    this.conq[dn] = this.conq[dn].filter((m) => !items.includes(m));
  },
  takeConsole(dn) {
    if (!this.conq || !this.conq[dn]) return [];
    const out = this.conq[dn];
    this.conq[dn] = [];
    return out;
  },
});

// -- show commands ---------------------------------------------------------------------------------------
const mstLabel = (i) => "MST" + i;

// show spanning-tree in MST mode: one block per instance.
function showMstTree(net, dn, onlyInst) {
  const d = net.devs[dn], L = [];
  const insts = [0, ...Object.keys(mstOf(d.cfg).map).map(Number).sort((a, b) => a - b)];
  for (const inst of insts) {
    if (onlyInst !== undefined && onlyInst !== null && inst !== onlyInst) continue;
    const v = mstVlansOf(d.cfg, inst).find((x) => d.cfg.vlans[x]);
    const s = v && net.stp(v)[dn];
    if (!s) continue;
    L.push("", mstLabel(inst).replace(/^MST(\d+)$/, (m, n) => "MST" + n.padStart(4, "0")), "  Spanning tree enabled protocol mstp",
      `  Root ID    Priority    ${s.root[0]}`, `             Address     ${dotted(s.root[1])}`);
    if (s.rootPort === null && cmpVec(s.root, s.bid) === 0) L.push("             This bridge is the root");
    else if (s.rootPort) L.push(`             Cost        ${s.cost}`, `             Port        ${s.ports[s.rootPort].pid.num} (${s.rootPort})`);
    L.push("             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec", "",
      `  Bridge ID  Priority    ${s.bid[0]}  (priority ${s.bid[0] - inst} sys-id-ext ${inst})`, `             Address     ${dotted(s.bid[1])}`,
      "             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec", "",
      "Interface           Role Sts Cost      Prio.Nbr Type", "------------------- ---- --- --------- -------- --------------------------------");
    for (const p of Object.keys(s.ports).sort(ifSort)) L.push(stpPortRow(s.ports[p], p));
  }
  if (!L.length) return "No spanning tree instances exist.";
  return L.slice(1).join("\n");
}

function stpPortRow(x, p) {
  const type = "P2p" + (x.edge ? " Edge" : "") + (x.boundary ? " Bound(PVST)" : "") + (x.inc ? " *" + x.inc : "");
  return pad(shortIf(p), 20) + pad(x.role, 5) + pad(x.state === "BKN" ? "BKN*" : x.state, 4) + pad(x.cost, 10) + pad(`${x.pid.prio}.${x.pid.num}`, 9) + type;
}

// show spanning-tree mst [N]
function showMst(net, dn, only) {
  const d = net.devs[dn];
  if (!net.isMst(d)) return "Switch is not in mst mode";
  const L = [];
  const insts = [0, ...Object.keys(mstOf(d.cfg).map).map(Number).sort((a, b) => a - b)];
  for (const inst of insts) {
    if (only !== null && only !== undefined && only !== inst) continue;
    const vlans = mstVlansOf(d.cfg, inst);
    const v = vlans.find((x) => d.cfg.vlans[x]);
    const s = v && net.stp(v)[dn];
    L.push("", `##### ${pad(mstLabel(inst), 8)}vlans mapped:   ${vlanStr(vlans)}`);
    if (!s) { L.push("Bridge        no ports are forwarding for this instance"); continue; }
    L.push(`Bridge        address ${dotted(s.bid[1])}  priority      ${s.bid[0]} (${s.bid[0] - inst} sysid ${inst})`);
    const self = s.rootPort === null && cmpVec(s.root, s.bid) === 0;
    if (inst === 0) {
      const c = s.cist || s;
      L.push(self ? "Root          this switch for the CIST"
        : `Root          address ${dotted(c.root[1])}  priority      ${c.root[0]} (${c.root[0]} sysid 0)\n              port    ${c.rootPort ? shortIf(c.rootPort) : "none"}            path cost     ${c.cost}`);
      L.push("Operational   hello time 2 , forward delay 15, max age 20, txholdcount 6",
        "Configured    hello time 2 , forward delay 15, max age 20, max hops    20");
    } else {
      L.push(self ? `Root          this switch for ${mstLabel(inst)}`
        : `Root          address ${dotted(s.root[1])}  priority      ${s.root[0]} (${s.root[0] - inst} sysid ${inst})\n              port    ${s.rootPort ? shortIf(s.rootPort) : "none"}            cost          ${s.cost}      rem hops 19`);
    }
    L.push("", "Interface        Role Sts Cost      Prio.Nbr Type", "---------------- ---- --- --------- -------- --------------------------------");
    for (const p of Object.keys(s.ports).sort(ifSort)) {
      const x = s.ports[p];
      L.push(pad(shortIf(p), 17) + pad(x.role, 5) + pad(x.state === "BKN" ? "BKN*" : x.state, 4) + pad(x.cost, 10) + pad(`${x.pid.prio}.${x.pid.num}`, 9)
        + "P2p" + (x.edge ? " Edge" : "") + (x.boundary ? " Bound(PVST)" : "") + (x.inc ? " *" + x.inc : ""));
    }
  }
  return L.slice(1).join("\n");
}

function showMstConfig(cfgM) {
  const m = cfgM;
  const insts = Object.keys(m.map).map(Number).sort((a, b) => a - b);
  const L = [`Name      [${m.name}]`, `Revision  ${pad(m.rev, 6)}Instances configured ${insts.length + 1}`, "",
    "Instance  Vlans mapped", "--------  ---------------------------------------------------------------------"];
  const taken = new Set(Object.values(m.map).flat());
  const zero = [];
  for (let v = 1; v <= 4094; v++) if (!taken.has(v)) zero.push(v);
  L.push(pad(0, 10) + vlanStr(zero));
  for (const i of insts) L.push(pad(i, 10) + vlanStr(m.map[i]));
  L.push("-------------------------------------------------------------------------------");
  return L.join("\n");
}

const ERR_CAUSES = ["arp-inspection", "bpduguard", "channel-misconfig", "dhcp-rate-limit", "link-flap", "loopback",
  "psecure-violation", "security-violation", "storm-control", "udld"];

function showErrRecovery(net, dn) {
  const d = net.devs[dn], er = d.cfg.errRec || { causes: [], interval: 300 };
  const L = ["ErrDisable Reason            Timer Status", "-----------------            --------------"];
  for (const r of ERR_CAUSES) L.push(pad(r, 29) + (er.causes.includes(r) || er.causes.includes("all") ? "Enabled" : "Disabled"));
  L.push("", `Timer interval: ${er.interval} seconds`, "", "Interfaces that will be enabled at the next timeout:", "",
    "Interface       Errdisable reason       Time left(sec)", "---------       -----------------       --------------");
  for (const [p, cause] of Object.entries(d.rt.errdis)) {
    if (!(er.causes.includes(cause) || er.causes.includes("all"))) continue;
    const at = (d.rt.errAt || {})[p] ?? net.now();
    L.push(pad(shortIf(p), 16) + lpad(cause, 17) + lpad(Math.max(0, Math.ceil(er.interval - (net.now() - at) / 1000)), 21));
  }
  return L.join("\n");
}

function showVtpStatus(net, dn) {
  const d = net.devs[dn], v = vtpOf(d.cfg);
  const n = Object.keys(d.cfg.vlans).length + 4;
  const mode = { server: "Server", client: "Client", transparent: "Transparent", off: "Off" }[v.mode];
  const digest = "0x" + [...vlanDb(d.cfg)].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7).toString(16).toUpperCase().padStart(8, "0");
  const L = ["VTP Version capable             : 1 to 3", `VTP version running             : ${v.ver}`,
    `VTP Domain Name                 : ${v.domain}`, `VTP Pruning Mode                : ${v.pruning ? "Enabled" : "Disabled"}`,
    "VTP Traps Generation            : Disabled", `Device ID                       : ${net.mac(dn, "Vlan1")}`];
  if (v.ver === 3) {
    L.push("", "Feature VLAN:", "--------------", `VTP Operating Mode                : ${v.mode === "server" ? (v.primary ? "Primary Server" : "Secondary Server") : mode}`,
      `Number of existing VLANs          : ${n}`, "Number of existing extended VLANs : 0", "Maximum VLANs supported locally   : 4096",
      `Configuration Revision            : ${v.rev}`, `Primary ID                        : ${v.primary ? net.mac(dn, "Vlan1") : "0000.0000.0000"}`,
      `MD5 digest                        : ${digest}`);
  } else {
    L.push("Configuration last modified by 0.0.0.0 at 0-0-00 00:00:00", "Local updater ID is 0.0.0.0 (no valid interface found)", "",
      "Feature VLAN:", "--------------", `VTP Operating Mode                : ${mode}`, "Maximum VLANs supported locally   : 255",
      `Number of existing VLANs          : ${n}`, `Configuration Revision            : ${v.mode === "transparent" || v.mode === "off" ? 0 : v.rev}`,
      `MD5 digest                        : ${digest}`);
  }
  return L.join("\n");
}

function showVrrp(net, dn, brief) {
  const d = net.devs[dn], L = [];
  const rows = [];
  for (const n of Object.keys(d.cfg.intfs).sort(ifSort)) {
    for (const [g, gc] of Object.entries(d.cfg.intfs[n].vrrp || {}).sort((a, b) => a[0] - b[0])) rows.push({ n, g: +g, gc, st: (d.rt.vrrp || {})[n + "|" + g] || { state: "Init" } });
  }
  const me = (r) => (net.ifAddr(dn, r.n) || {}).ip;
  const prio = (r) => (r.gc.ip !== null && r.gc.ip === me(r) ? 255 : Math.max(1, r.gc.prio - r.gc.tracks.reduce((s, t) => s + (net.trackUp(dn, t.obj) ? 0 : t.dec), 0)));
  const master = (r) => (r.st.state === "Master" ? me(r) : r.st.master);
  if (brief) {
    if (rows.some((r) => r.gc.v3)) {
      L.push("  Interface          Grp  A-F Pri  Time Own Pre State   Master addr/Group addr");
      for (const r of rows) {
        L.push("  " + pad(shortIf(r.n), 19) + lpad(r.g, 3) + " IPv4 " + pad(prio(r), 5) + lpad(0, 4) + "  " + pad(r.gc.ip === me(r) ? "Y" : "N", 4) + pad(r.gc.preempt ? "Y" : "N", 3)
          + pad(r.st.state.toUpperCase(), 8) + `${master(r) ? n2ip(master(r)) : "unknown"}${r.st.state === "Master" ? "(local)" : ""} ${r.gc.ip !== null ? n2ip(r.gc.ip) : "0.0.0.0"}`);
      }
    } else {
      L.push("Interface          Grp Pri Time  Own Pre State   Master addr     Group addr");
      for (const r of rows) {
        L.push(pad(shortIf(r.n), 19) + pad(r.g, 4) + pad(prio(r), 4) + pad(3000 + Math.round((256 - prio(r)) * 3.9), 6) + pad(r.gc.ip === me(r) ? "Y" : "", 4)
          + pad(r.gc.preempt ? "Y" : "", 4) + pad(r.st.state, 8) + pad(master(r) ? n2ip(master(r)) : "unknown", 16) + (r.gc.ip !== null ? n2ip(r.gc.ip) : "0.0.0.0"));
      }
    }
    return L.join("\n");
  }
  for (const r of rows) {
    if (r.gc.v3) {
      L.push(`${r.n} - Group ${r.g} - Address-Family IPv4`, `  State is ${r.st.state.toUpperCase()}`, "  State duration 1 mins 2.345 secs",
        `  Virtual IP address is ${r.gc.ip !== null ? n2ip(r.gc.ip) : "no address"}`, `  Virtual MAC address is ${vrrpMac(r.g).toUpperCase()}`,
        `  Advertisement interval is ${r.gc.adv * 1000} msec`, `  Preemption ${r.gc.preempt ? "enabled" : "disabled"}`, `  Priority is ${prio(r)}`);
      for (const t of r.gc.tracks) L.push(`    Track object ${t.obj} state ${net.trackUp(dn, t.obj) ? "Up" : "Down"} decrement ${t.dec}`);
      L.push(`  Master Router is ${master(r) ? n2ip(master(r)) : "unknown"}${r.st.state === "Master" ? " (local)" : ""}, priority is ${r.st.state === "Master" ? prio(r) : "unknown"}`,
        `  Master Advertisement interval is ${r.gc.adv * 1000} msec`, `  Master Down interval is ${r.st.state === "Master" ? "unknown" : (3 * r.gc.adv + 0.6).toFixed(3) + " sec"}`, "");
    } else {
      L.push(`${r.n} - Group ${r.g}`, `  State is ${r.st.state}`, `  Virtual IP address is ${r.gc.ip !== null ? n2ip(r.gc.ip) : "no address"}`,
        ...(r.gc.sec || []).map((s) => `  Secondary Virtual IP address is ${n2ip(s)}`), `  Virtual MAC address is ${vrrpMac(r.g)}`,
        `  Advertisement interval is ${r.gc.adv.toFixed(3)} sec`, `  Preemption ${r.gc.preempt ? "enabled" : "disabled"}`, `  Priority is ${prio(r)}`);
      for (const t of r.gc.tracks) L.push(`    Track object ${t.obj} state ${net.trackUp(dn, t.obj) ? "Up" : "Down"} decrement ${t.dec}`);
      if (r.gc.auth) L.push(`  Authentication text, string "${r.gc.auth}"`);
      L.push(`  Master Router is ${master(r) ? n2ip(master(r)) : "unknown"}${r.st.state === "Master" ? " (local)" : ""}, priority is ${r.st.state === "Master" ? prio(r) : "unknown"}`,
        `  Master Advertisement interval is ${r.gc.adv.toFixed(3)} sec`, `  Master Down interval is ${(3 * r.gc.adv + (256 - prio(r)) / 256).toFixed(3)} sec`, "");
    }
  }
  return L.join("\n").trimEnd();
}

function showGlbp(net, dn, brief) {
  const d = net.devs[dn], L = [];
  const rows = [];
  for (const n of Object.keys(d.cfg.intfs).sort(ifSort)) {
    for (const [g, gc] of Object.entries(d.cfg.intfs[n].glbp || {}).sort((a, b) => a[0] - b[0])) rows.push({ n, g: +g, gc, st: (d.rt.glbp || {})[n + "|" + g] || { state: "Init", fwd: {} } });
  }
  const me = (r) => (net.ifAddr(dn, r.n) || {}).ip;
  // Who owns each forwarder, as this router hears it.
  const owner = (r, f) => {
    for (const x of Object.values(net.devs)) {
      if (x.type !== "router") continue;
      for (const [k, s] of Object.entries(x.rt.glbp || {})) if (s.vip === r.st.vip && +k.split("|")[1] === r.g && s.fwd[f] === "Active") return net.ifAddr(x.name, k.split("|")[0]).ip;
    }
    return null;
  };
  if (brief) {
    L.push("Interface   Grp  Fwd Pri State    Address         Active router   Standby router");
    for (const r of rows) {
      const local = (ip) => (ip === me(r) ? "local" : ip ? n2ip(ip) : "unknown");
      L.push(pad(shortIf(r.n), 12) + pad(r.g, 5) + pad("-", 4) + pad(r.gc.prio, 4) + pad(r.st.state, 9) + pad(r.st.vip !== null && r.st.vip !== undefined ? n2ip(r.st.vip) : "unknown", 16)
        + pad(r.st.state === "Active" ? "local" : local(r.st.avg), 16) + (r.st.state === "Standby" ? "local" : r.st.standby ? local(r.st.standby) : "unknown"));
      for (const f of Object.keys(r.st.fwd).map(Number).sort((a, b) => a - b)) {
        L.push(pad(shortIf(r.n), 12) + pad(r.g, 5) + pad(f, 4) + pad("-", 4) + pad(r.st.fwd[f], 9) + pad(glbpMac(r.g, f), 16) + pad(local(owner(r, f)), 16) + "-");
      }
    }
    return L.join("\n");
  }
  for (const r of rows) {
    const local = (ip) => (ip === me(r) ? "local" : ip ? n2ip(ip) : "unknown");
    const w = Math.max(0, r.gc.weight.max - (r.gc.wtracks || []).reduce((s, t) => s + (net.trackUp(dn, t.obj) ? 0 : t.dec), 0));
    L.push(`${r.n} - Group ${r.g}`, `  State is ${r.st.state}`, `  Virtual IP address is ${r.st.vip !== null && r.st.vip !== undefined ? n2ip(r.st.vip) : "unknown"}`,
      "  Hello time 3 sec, hold time 10 sec", `  Preemption ${r.gc.preempt ? "enabled" : "disabled"}, min delay 0 sec`,
      `  Active is ${r.st.state === "Active" ? "local" : local(r.st.avg)}, priority ${r.gc.prio}`,
      `  Standby is ${r.st.state === "Standby" ? "local" : r.st.standby ? local(r.st.standby) : "unknown"}`, `  Priority ${r.gc.prio} (${r.gc.prio === 100 ? "default" : "configured"})`,
      `  Weighting ${w} (${r.gc.weight.max === 100 ? "default 100" : "configured " + r.gc.weight.max})${r.gc.weight.lower !== null ? `, thresholds: lower ${r.gc.weight.lower}, upper ${r.gc.weight.upper ?? r.gc.weight.max}` : ""}`);
    for (const t of r.gc.wtracks || []) L.push(`    Track object ${t.obj} state ${net.trackUp(dn, t.obj) ? "Up" : "Down"} decrement ${t.dec}`);
    L.push(`  Load balancing: ${r.gc.lb}`, `  Group members:`);
    const fwds = Object.keys(r.st.fwd).map(Number).sort((a, b) => a - b);
    L.push(`  There are ${fwds.length} forwarders (${Object.values(r.st.fwd).filter((s) => s === "Active").length} active)`);
    for (const f of fwds) {
      L.push(`  Forwarder ${f}`, `    State is ${r.st.fwd[f]}`, `    MAC address is ${glbpMac(r.g, f)} (default)`, `    Owner ID is ${net.mac(dn, r.n)}`,
        `    Preemption enabled, min delay 30 sec`, `    Active is ${local(owner(r, f))}, weighting ${w}`);
    }
    L.push("");
  }
  return L.join("\n").trimEnd();
}

function showMonitor(net, dn, only) {
  const d = net.devs[dn], L = [];
  const ids = Object.keys(d.cfg.span || {}).map(Number).sort((a, b) => a - b).filter((i) => only === null || i === only);
  if (only !== null && !ids.length) return "";
  const dirRows = (src, label) => {
    for (const [dir, title] of [["both", "Both"], ["rx", "RX Only"], ["tx", "TX Only"]]) {
      const xs = src.filter((x) => x.dir === dir);
      if (xs.length) L.push(`    ${pad(title, 19)}: ${xs.map((x) => (x.ifn ? shortIf(x.ifn) : vlanStr(x.vlans))).join(",")}`);
    }
    if (label && !src.length) L.push(`    ${pad("Both", 19)}: None`);
  };
  for (const id of ids) {
    const s = d.cfg.span[id];
    L.push(`Session ${id}`, "---------");
    const type = { local: "Local Session", "rspan-src": "Remote Source Session", "rspan-dst": "Remote Destination Session",
      "erspan-src": "ERSPAN Source Session", "erspan-dst": "ERSPAN Destination Session" }[s.kind] || "Local Session";
    L.push(`Type                   : ${type}`);
    if (s.kind.startsWith("erspan")) L.push(`Status                 : ${s.shut ? "Admin Disabled" : "Admin Enabled"}`);
    const ports = (s.src || []).filter((x) => x.ifn), vlans = (s.src || []).filter((x) => x.vlans);
    if (ports.length || (!vlans.length && s.kind !== "rspan-dst" && s.kind !== "erspan-dst")) { L.push("Source Ports           :"); dirRows(ports, true); }
    if (vlans.length) { L.push("Source VLANs           :"); dirRows(vlans, false); }
    if (s.kind === "rspan-dst") L.push(`Source RSPAN VLAN      : ${s.remoteVlan}`);
    if (s.kind === "rspan-src") L.push(`Dest RSPAN VLAN        : ${s.remoteVlan ?? "None"}`);
    if (s.dst) L.push(`Destination Ports      : ${shortIf(s.dst.ifn)}`, `    Encapsulation      : ${s.dst.replicate ? "Replicate" : "Native"}`, "          Ingress      : Disabled");
    if (s.kind === "erspan-src") {
      const e = s.erspan || {};
      L.push(`Destination IP Address : ${e.ip != null ? n2ip(e.ip) : "None"}`, "MTU                    : 1464", `Destination ERSPAN ID  : ${e.id ?? "None"}`,
        `Origin IP Address      : ${e.origin != null ? n2ip(e.origin) : "None"}`);
    }
    if (s.kind === "erspan-dst") {
      const e = s.erspan || {};
      L.push(`Source IP Address      : ${e.ip != null ? n2ip(e.ip) : "None"}`, `Source ERSPAN ID       : ${e.id ?? "None"}`);
    }
    L.push("");
  }
  return L.join("\n").trimEnd();
}

function showSnooping(net, dn) {
  const d = net.devs[dn], s = d.cfg.snoop || { on: false, vlans: [], opt82: true };
  const L = [`Switch DHCP snooping is ${s.on ? "enabled" : "disabled"}`, "Switch DHCP gleaning is disabled",
    "DHCP snooping is configured on following VLANs:", vlanStr(s.vlans) || "none",
    "DHCP snooping is operational on following VLANs:", (s.on ? vlanStr(s.vlans.filter((v) => d.cfg.vlans[v])) : "") || "none",
    "DHCP snooping is configured on the following L3 Interfaces:", "",
    `Insertion of option 82 is ${s.opt82 === false ? "disabled" : "enabled"}`, "   circuit-id default format: vlan-mod-port", "   remote-id: " + net.mac(dn, "Vlan1") + " (MAC)",
    "Option 82 on untrusted port is not allowed", "Verification of hwaddr field is enabled", "Verification of giaddr field is enabled",
    "DHCP snooping trust/rate is configured on the following Interfaces:", "",
    "Interface                  Trusted    Allow option    Rate limit (pps)", "-----------------------    -------    ------------    ----------------   "];
  for (const p of [...d.ports, ...Object.keys(d.cfg.intfs).filter(isPo)]) {
    const x = xr(d.cfg.intfs[p]);
    if (!x.snoopTrust && !x.snoopRate) continue;
    L.push(pad(p, 27) + pad(x.snoopTrust ? "yes" : "no", 11) + pad(x.snoopTrust ? "yes" : "no", 16) + (x.snoopRate || "unlimited"));
    L.push(`  Custom circuit-ids:`);
  }
  return L.join("\n");
}

function showSnoopBinding(net, dn) {
  const d = net.devs[dn], rows = Object.entries(d.rt.snoop || {});
  const L = ["MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface", "------------------  ---------------  ----------  -------------  ----  --------------------"];
  for (const [mac, b] of rows) L.push(pad(mac.replace(/\./g, "").match(/../g).join(":").toUpperCase(), 20) + pad(n2ip(b.ip), 17) + pad(86400, 12) + pad("dhcp-snooping", 15) + pad(b.vlan, 6) + b.port);
  L.push(`Total number of bindings: ${rows.length}`, "");
  return L.join("\n");
}

function showDai(net, dn) {
  const d = net.devs[dn], a = d.cfg.dai || { vlans: [], validate: [], filters: {} };
  const L = ["", `Source Mac Validation      : ${a.validate.includes("src-mac") ? "Enabled" : "Disabled"}`,
    `Destination Mac Validation : ${a.validate.includes("dst-mac") ? "Enabled" : "Disabled"}`,
    `IP Address Validation      : ${a.validate.includes("ip") ? "Enabled" : "Disabled"}`, "",
    " Vlan     Configuration    Operation   ACL Match          Static ACL", " ----     -------------    ---------   ---------          ----------"];
  for (const v of a.vlans) {
    const f = (a.filters || {})[v];
    L.push(" " + pad(v, 9) + pad("Enabled", 17) + pad(d.cfg.vlans[v] ? "Active" : "Inactive", 12) + pad(f ? f.acl : "", 19) + (f && f.static ? "Yes" : "No"));
  }
  L.push("", " Vlan     ACL Logging      DHCP Logging      Probe Logging", " ----     -----------      ------------      -------------");
  for (const v of a.vlans) L.push(" " + pad(v, 9) + pad("Deny", 17) + pad("Deny", 18) + "Off");
  L.push("", " Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops", " ----      ---------        -------     ----------      ---------");
  for (const v of a.vlans) L.push(" " + pad(v, 10) + pad(0, 17) + pad(d.rt.daiDrops || 0, 12) + pad(d.rt.daiDrops || 0, 16) + "0");
  return L.join("\n");
}

function showDaiIfs(net, dn) {
  const d = net.devs[dn];
  const L = ["", " Interface        Trust State     Rate (pps)    Burst Interval", " ---------------  -----------     ----------    --------------"];
  for (const p of d.ports) {
    const x = xr(d.cfg.intfs[p]);
    L.push(" " + pad(shortIf(p), 17) + pad(x.arpTrust ? "Trusted" : "Untrusted", 16) + pad(x.arpTrust ? "None" : (x.arpRate ?? 15), 14) + (x.arpTrust ? "N/A" : 1));
  }
  return L.join("\n");
}

function showIpsg(net, dn) {
  const d = net.devs[dn];
  const L = ["Interface  Filter-type  Filter-mode  IP-address       Mac-address        Vlan", "---------  -----------  -----------  ---------------  -----------------  ----------"];
  for (const p of d.ports) {
    const g = xr(d.cfg.intfs[p]).ipsg;
    if (!g) continue;
    const binds = Object.entries(d.rt.snoop || {}).filter(([, b]) => b.port === p);
    if (!binds.length) L.push(pad(shortIf(p), 11) + pad(g === "mac" ? "ip-mac" : "ip", 13) + pad("active", 13) + "deny-all");
    for (const [m, b] of binds) L.push(pad(shortIf(p), 11) + pad(g === "mac" ? "ip-mac" : "ip", 13) + pad("active", 13) + pad(n2ip(b.ip), 17) + pad(g === "mac" ? m : "", 19) + b.vlan);
  }
  return L.join("\n");
}

function showStorm(net, dn, only, kind) {
  const d = net.devs[dn];
  const L = ["Interface  Filter State   Upper        Lower        Current", "---------  -------------  -----------  -----------  ----------"];
  for (const p of d.ports) {
    if (only && p !== only) continue;
    const st = xr(d.cfg.intfs[p]).storm;
    const lvl = st && st[kind || "broadcast"];
    if (!lvl && !only) continue;
    L.push(pad(shortIf(p), 11) + pad(lvl ? (net.portUp(dn, p) ? "Forwarding" : "Link Down") : "inactive", 15) + lpad(lvl ? lvl.toFixed(2) + "%" : "100.00%", 11)
      + lpad(lvl ? lvl.toFixed(2) + "%" : "100.00%", 13) + lpad("0.00%", 12));
  }
  return L.join("\n");
}

function showPvlan(net, dn) {
  const d = net.devs[dn], px = d.cfg.vlanx || {};
  const L = ["", "Primary Secondary Type              Ports", "------- --------- ----------------- ------------------------------------------"];
  for (const p of Object.keys(px).map(Number).sort((a, b) => a - b)) {
    if (px[p].pv !== "primary") continue;
    const secs = px[p].assoc || [];
    if (!secs.length) L.push(pad(p, 8) + pad("", 10) + "primary");
    for (const s of secs) {
      const ports = d.ports.filter((q) => {
        const i = d.cfg.intfs[q], x = xr(i);
        if (i.mode === "private-vlan host") return x.pvHost && x.pvHost[0] === p && x.pvHost[1] === s;
        if (i.mode === "private-vlan promiscuous") return x.pvProm && x.pvProm[0] === p && x.pvProm[1].includes(s);
        return false;
      }).map(shortIf);
      L.push(pad(p, 8) + pad(s, 10) + pad(px[s] ? px[s].pv : "non-operational", 18) + ports.join(", "));
    }
  }
  return L.join("\n");
}

// -- running-config pieces ------------------------------------------------------------------------------
function swGlobalLines(d) {
  const c = d.cfg, L = [];
  if (d.type === "switch") {
    const v = vtpOf(c);
    if (c.vtp) {
      if (v.domain) L.push("vtp domain " + v.domain);
      if (v.mode !== "server") L.push("vtp mode " + v.mode);
      if (v.ver !== 1) L.push("vtp version " + v.ver);
    }
    if (c.ipRouting) L.push("ip routing");
    const s = c.snoop;
    if (s) {
      if (s.vlans.length) L.push("ip dhcp snooping vlan " + vlanStr(s.vlans));
      if (s.opt82 === false) L.push("no ip dhcp snooping information option");
      if (s.on) L.push("ip dhcp snooping");
    }
    const a = c.dai;
    if (a) {
      if (a.vlans.length) L.push("ip arp inspection vlan " + vlanStr(a.vlans));
      if (a.validate.length) L.push("ip arp inspection validate " + a.validate.join(" "));
      for (const [vl, f] of Object.entries(a.filters || {})) L.push(`ip arp inspection filter ${f.acl} vlan ${vl}${f.static ? " static" : ""}`);
    }
    if (c.errRec) {
      for (const cause of c.errRec.causes) L.push("errdisable recovery cause " + cause);
      if (c.errRec.interval !== 300) L.push("errdisable recovery interval " + c.errRec.interval);
    }
  } else {
    if (c.fhrpV3) L.push("fhrp version vrrp v3");
    if (c.dhcpTrustAll) L.push("ip dhcp relay information trust-all");
  }
  return L.length ? [...L, "!"] : [];
}

function swStpLines(d) {
  const c = d.cfg, L = [], x = c.stpx || {};
  if (x.bpdufilter) L.push("spanning-tree portfast bpdufilter default");
  if (x.loopguard) L.push("spanning-tree loopguard default");
  if (x.uplinkfast) L.push("spanning-tree uplinkfast");
  if (x.backbonefast) L.push("spanning-tree backbonefast");
  const m = mstOf(c);
  if (c.mst) {
    const byPrio = {};
    for (const [i, p] of Object.entries(m.prio)) (byPrio[p] = byPrio[p] || []).push(+i);
    for (const [p, is] of Object.entries(byPrio)) L.push(`spanning-tree mst ${vlanStr(is.sort((a, b) => a - b))} priority ${p}`);
    if (m.name || m.rev || Object.keys(m.map).length) {
      L.push("!", "spanning-tree mst configuration");
      if (m.name) L.push(" name " + m.name);
      if (m.rev) L.push(" revision " + m.rev);
      for (const i of Object.keys(m.map).map(Number).sort((a, b) => a - b)) L.push(` instance ${i} vlan ${vlanStr(m.map[i]).replace(/,/g, ", ")}`);
    }
  }
  return L;
}

// VLAN definitions appear in the running-config only in VTP transparent (or off) mode, as on IOS.
function swVlanLines(d) {
  const c = d.cfg, v = vtpOf(c), L = [];
  if (v.mode !== "transparent" && v.mode !== "off") return L;
  const px = c.vlanx || {};
  for (const id of sortedVlans(c.vlans)) {
    if (id === 1) continue;
    L.push("vlan " + id);
    if (c.vlans[id] !== vlanLabel(id)) L.push(" name " + c.vlans[id]);
    const x = px[id];
    if (x && x.rspan) L.push(" remote-span");
    if (x && x.pv) L.push(" private-vlan " + x.pv);
    if (x && x.pv === "primary" && (x.assoc || []).length) L.push(" private-vlan association " + vlanStr(x.assoc));
    L.push("!");
  }
  return L;
}

function swPortPreMode(i) {
  const x = xr(i), L = [];
  if (x.pvHost) L.push(` switchport private-vlan host-association ${x.pvHost[0]} ${x.pvHost[1]}`);
  if (x.pvProm) L.push(` switchport private-vlan mapping ${x.pvProm[0]} ${vlanStr(x.pvProm[1])}`);
  return L;
}

function swPortLines(i) {
  const x = xr(i), L = [];
  if (x.voice) L.push(" switchport voice vlan " + x.voice);
  if (x.prot) L.push(" switchport protected");
  if (x.storm) {
    for (const k of ["broadcast", "multicast", "unicast"]) if (x.storm[k] !== undefined) L.push(` storm-control ${k} level ${x.storm[k].toFixed(2)}`);
    if (x.storm.action) L.push(" storm-control action " + x.storm.action);
  }
  if (x.arpTrust) L.push(" ip arp inspection trust");
  if (x.ipsg) L.push(" ip verify source" + (x.ipsg === "mac" ? " port-security" : ""));
  for (const [inst, k] of Object.entries(x.mstCost || {})) L.push(` spanning-tree mst ${inst} cost ${k}`);
  for (const [inst, p] of Object.entries(x.mstPrio || {})) L.push(` spanning-tree mst ${inst} port-priority ${p}`);
  if (x.bpdufilter !== undefined) L.push(" spanning-tree bpdufilter " + (x.bpdufilter ? "enable" : "disable"));
  if (x.guard) L.push(" spanning-tree guard " + x.guard);
  if (x.snoopTrust) L.push(" ip dhcp snooping trust");
  if (x.snoopRate) L.push(" ip dhcp snooping limit rate " + x.snoopRate);
  return L;
}

function sviLines(i) {
  const x = xr(i), L = [];
  for (const h of i.helpers || []) L.push(" ip helper-address " + n2ip(h));
  if (x.pvMap && x.pvMap.length) L.push(" private-vlan mapping " + vlanStr(x.pvMap));
  return L;
}

function routerIfLines(i) {
  const L = [];
  for (const [g, v] of Object.entries(i.vrrp || {}).sort((a, b) => a[0] - b[0])) {
    if (v.v3) {
      L.push(` vrrp ${g} address-family ipv4`);
      if (v.desc) L.push("  description " + v.desc);
      if (v.prio !== 100) L.push("  priority " + v.prio);
      if (!v.preempt) L.push("  no preempt");
      else if (v.delay) L.push("  preempt delay minimum " + v.delay);
      for (const t of v.tracks) L.push(`  track ${t.obj} decrement ${t.dec}`);
      if (v.ip !== null) L.push(`  address ${n2ip(v.ip)} primary`);
      for (const s of v.sec || []) L.push(`  address ${n2ip(s)} secondary`);
      if (v.adv !== 1) L.push(`  timers advertise ${v.adv * 1000}`);
      if (v.shut) L.push("  shutdown");
      L.push("  exit-vrrp");
      continue;
    }
    if (v.desc) L.push(` vrrp ${g} description ${v.desc}`);
    if (v.ip !== null) L.push(` vrrp ${g} ip ${n2ip(v.ip)}`);
    for (const s of v.sec || []) L.push(` vrrp ${g} ip ${n2ip(s)} secondary`);
    if (v.adv !== 1) L.push(` vrrp ${g} timers advertise ${v.adv}`);
    if (v.prio !== 100) L.push(` vrrp ${g} priority ${v.prio}`);
    if (!v.preempt) L.push(` no vrrp ${g} preempt`);
    else if (v.delay) L.push(` vrrp ${g} preempt delay minimum ${v.delay}`);
    if (v.auth) L.push(` vrrp ${g} authentication text ${v.auth}`);
    for (const t of v.tracks) L.push(` vrrp ${g} track ${t.obj} decrement ${t.dec}`);
  }
  for (const [g, v] of Object.entries(i.glbp || {}).sort((a, b) => a[0] - b[0])) {
    L.push(v.ip !== null ? ` glbp ${g} ip ${n2ip(v.ip)}` : ` glbp ${g} ip`);
    if (v.prio !== 100) L.push(` glbp ${g} priority ${v.prio}`);
    if (v.preempt) L.push(` glbp ${g} preempt`);
    const w = v.weight;
    if (w.max !== 100 || w.lower !== null) L.push(` glbp ${g} weighting ${w.max}${w.lower !== null ? ` lower ${w.lower} upper ${w.upper ?? w.max}` : ""}`);
    for (const t of v.wtracks) L.push(` glbp ${g} weighting track ${t.obj} decrement ${t.dec}`);
    if (v.lb !== "round-robin") L.push(` glbp ${g} load-balancing ${v.lb}`);
    if (v.auth) L.push(` glbp ${g} authentication text ${v.auth}`);
    if (v.name) L.push(` glbp ${g} name ${v.name}`);
  }
  if (xr(i).relayTrust) L.push(" ip dhcp relay information trusted");
  return L;
}

function tailLines(d) {
  const c = d.cfg, L = [];
  if (d.type === "switch") {
    for (const r of c.routes || []) {
      L.push(["ip route", n2ip(r.net), n2ip(lenMask(r.len)), r.ifn, r.nh !== null ? n2ip(r.nh) : null, r.ad !== 1 ? r.ad : null].filter((x) => x !== null && x !== undefined).join(" "));
    }
    for (const [name, es] of Object.entries(c.arpAcls || {})) {
      L.push("arp access-list " + name);
      for (const e of es) L.push(` permit ip host ${n2ip(e.ip)} mac ${e.mac === null ? "any" : "host " + e.mac}`);
    }
  }
  for (const id of Object.keys(c.span || {}).map(Number).sort((a, b) => a - b)) {
    const s = c.span[id];
    if (s.kind === "erspan-src" || s.kind === "erspan-dst") {
      L.push(`monitor session ${id} type ${s.kind === "erspan-src" ? "erspan-source" : "erspan-destination"}`);
      if (s.desc) L.push(" description " + s.desc);
      if (s.kind === "erspan-src") {
        for (const x of s.src || []) L.push(` source interface ${x.ifn}${x.dir === "both" ? "" : " " + x.dir}`);
        if (!s.shut) L.push(" no shutdown");
        L.push(" destination");
        if (s.erspan.id != null) L.push("  erspan-id " + s.erspan.id);
        if (s.erspan.ip != null) L.push("  ip address " + n2ip(s.erspan.ip));
        if (s.erspan.origin != null) L.push("  origin ip address " + n2ip(s.erspan.origin));
      } else {
        if (s.dst) L.push(" destination interface " + s.dst.ifn);
        if (!s.shut) L.push(" no shutdown");
        L.push(" source");
        if (s.erspan.id != null) L.push("  erspan-id " + s.erspan.id);
        if (s.erspan.ip != null) L.push("  ip address " + n2ip(s.erspan.ip));
      }
      continue;
    }
    const dirs = (x) => (x.dir === "both" ? "" : " " + x.dir);
    if (s.kind === "rspan-dst") L.push(`monitor session ${id} source remote vlan ${s.remoteVlan}`);
    for (const x of s.src || []) L.push(`monitor session ${id} source ${x.ifn ? "interface " + x.ifn : "vlan " + vlanStr(x.vlans)}${dirs(x)}`);
    if (s.kind === "rspan-src" && s.remoteVlan) L.push(`monitor session ${id} destination remote vlan ${s.remoteVlan}`);
    if (s.dst) L.push(`monitor session ${id} destination interface ${s.dst.ifn}${s.dst.replicate ? " encapsulation replicate" : ""}`);
  }
  return L.length ? [...L, "!"] : [];
}

// Help is worked out when a command is defined, so it is added before the commands. Existing entries
// are left alone: they already describe the commands defined above.
const addHelp = (target, add) => { for (const [k, v] of Object.entries(add)) if (!(k in target)) target[k] = v; };
// -- help ------------------------------------------------------------------------------------------------------------
addHelp(HELP_PATH, {
  "spanning-tree mode mst": "Multiple spanning tree mode", "spanning-tree mst": "Multiple spanning tree configuration",
  "mst configuration": "Configuration submode", "mst priority": "Set the bridge priority for the spanning tree",
  "mst root": "Configure switch as root", "mst root primary": "Configure this switch as primary root for this spanning tree",
  "mst root secondary": "Configure this switch as secondary root for this spanning tree", "mst cost": "Change the interface spanning tree path cost for an instance",
  "mst port-priority": "Change the spanning tree port priority for an instance", "show spanning-tree mst": "Multiple spanning trees",
  "show spanning-tree mst configuration": "Display region configuration", "spanning-tree guard": "Change an interface's spanning tree guard mode",
  "guard root": "Set guard mode to root guard on interface", "guard loop": "Set guard mode to loop guard on interface",
  "guard none": "Set guard mode to none", "spanning-tree bpdufilter": "Don't send or receive BPDUs on this interface",
  "bpdufilter enable": "Enable BPDU filtering for this interface", "bpdufilter disable": "Disable BPDU filtering for this interface",
  "spanning-tree loopguard": "Spanning tree loopguard options", "loopguard default": "Enable loopguard by default on all ports",
  "portfast bpdufilter": "Enable portfast bpdu filter on this switch", "bpdufilter default": "Enable bdpu filter by default on all portfast ports",
  "spanning-tree uplinkfast": "Enable UplinkFast Feature", "spanning-tree backbonefast": "Enable BackboneFast Feature",
  "errdisable recovery": "Error disable recovery", "recovery cause": "Enable error disable recovery for application",
  "recovery interval": "Error disable recovery timer value", "cause all": "Enable timer to recover from all error causes",
  "cause bpduguard": "Enable timer to recover from BPDU Guard error", "cause psecure-violation": "Enable timer to recover from psecure violation error",
  "cause arp-inspection": "Enable timer to recover from arp inspection error disable state", "cause dhcp-rate-limit": "Enable timer to recover from dhcp-rate-limit error",
  "cause link-flap": "Enable timer to recover from link-flap error", "cause loopback": "Enable timer to recover from loopback error",
  "cause security-violation": "Enable timer to recover from 802.1x violation error", "cause storm-control": "Enable timer to recover from storm-control error",
  "cause udld": "Enable timer to recover from udld error", "cause channel-misconfig": "Enable timer to recover from channel misconfig error",
  "show errdisable": "Error disable", "show errdisable recovery": "Error disable recovery",
  "vtp domain": "Set the name of the VTP administrative domain.", "vtp mode": "Configure VTP device mode",
  "vtp password": "Set the password for the VTP administrative domain", "vtp version": "Set the administrative domain to VTP version",
  "vtp pruning": "Set the administrative domain to permit pruning", "vtp primary": "Make this system the primary server for a feature",
  "mode server": "Set the device to server mode.", "mode client": "Set the device to client mode.",
  "mode transparent": "Set the device to transparent mode.", "mode off": "Set the device to off mode.",
  "show vtp": "VTP information", "show vtp status": "VTP domain status", "show vtp password": "VTP password", "show vtp counters": "VTP statistics",
  "vlan private-vlan": "Configure a private VLAN", "private-vlan primary": "Configure the VLAN as a primary private VLAN",
  "private-vlan isolated": "Configure the VLAN as an isolated private VLAN", "private-vlan community": "Configure the VLAN as a community private VLAN",
  "private-vlan association": "Configure association between private VLANs", "association add": "Add a VLAN to private VLAN list",
  "association remove": "Remove a VLAN from private VLAN list", "show vlan private-vlan": "Private VLAN information",
  "show vlan remote-span": "Remote SPAN VLANs", "switchport mode private-vlan": "Set the mode to private-vlan host or promiscuous",
  "private-vlan host": "Set the mode to private-vlan host", "private-vlan promiscuous": "Set the mode to private-vlan promiscuous",
  "switchport private-vlan": "Set the private VLAN configuration", "private-vlan host-association": "Set the private VLAN host association",
  "switchport private-vlan mapping": "Set the private VLAN promiscuous mapping", "private-vlan mapping": "Set the private VLAN SVI mapping",
  "instance vlan": "Range of vlans to add to the instance mapping", "weighting track decrement": "Weighting decrement",
  "interface both": "Monitor received and transmitted traffic", "interface rx": "Monitor received traffic only",
  "interface tx": "Monitor transmitted traffic only", "vlan both": "Monitor received and transmitted traffic",
  "vlan rx": "Monitor received traffic only", "vlan tx": "Monitor transmitted traffic only",
  "vtp version 1": "Set the adminstrative domain to VTP version 1", "vtp version 2": "Set the adminstrative domain to VTP version 2",
  "vtp version 3": "Set the adminstrative domain to VTP version 3", "mapping add": "Add to private VLAN mapping list",
  "mapping remove": "Remove from private VLAN mapping list", "switchport voice": "Voice appliance attributes",
  "voice vlan": "VLAN for voice application", "voice vlan none": "Don't tell telephone about voice vlan",
  "switchport protected": "Configure an interface to be a protected port", "remote-span": "Configure as Remote SPAN VLAN",
  "storm-control broadcast": "Broadcast address storm control", "storm-control multicast": "Multicast address storm control",
  "storm-control unicast": "Unicast address storm control", "storm-control action": "Action to take for storm-control",
  "action shutdown": "Shutdown this interface if a storm occurs", "action trap": "Send SNMP trap if a storm occurs",
  "broadcast level": "Set storm suppression level on this interface", "multicast level": "Set storm suppression level on this interface",
  "unicast level": "Set storm suppression level on this interface", "show storm-control": "Show storm control configuration",
  "storm-control broadcast level": "Set storm suppression level on this interface",
  "ip dhcp snooping": "DHCP Snooping", "dhcp snooping vlan": "DHCP Snooping vlan", "snooping information": "DHCP Snooping information",
  "information option": "DHCP Snooping information option", "snooping trust": "DHCP Snooping trust config",
  "snooping limit": "DHCP Snooping limit", "limit rate": "DHCP Snooping limit rate", "snooping binding": "DHCP snooping bindings",
  "show ip dhcp snooping": "DHCP snooping", "show ip dhcp snooping binding": "DHCP snooping bindings",
  "clear ip dhcp snooping": "DHCP snooping", "dhcp relay": "DHCP relay agent parameters", "relay information": "Relay agent information option",
  "information trust-all": "Received DHCP packets may contain relay info option with zero giaddr",
  "information trusted": "Received DHCP packets may contain relay info option with zero giaddr",
  "ip arp": "IP ARP global configuration", "arp inspection": "Arp Inspection configuration", "inspection vlan": "Enable/Disable ARP Inspection on vlans",
  "inspection validate": "Validate addresses", "inspection filter": "Specify ARP acl to be applied", "inspection trust": "Configure Trust state",
  "inspection limit": "Configure Rate limit of incoming ARP packets", "validate src-mac": "Validate source MAC address",
  "validate dst-mac": "Validate destination MAC address", "validate ip": "Validate IP addresses", "src-mac dst-mac": "Validate destination MAC address",
  "src-mac ip": "Validate IP addresses", "dst-mac ip": "Validate IP addresses", "filter vlan": "Vlans to apply the filter",
  "vlan static": "Apply the ACL statically", "arp access-list": "Configure an ARP access list", "show ip arp inspection": "Show ARP Inspection",
  "inspection interfaces": "Show ARP Inspection interface state", "inspection statistics": "Show ARP Inspection statistics",
  "show arp access-list": "List ARP access lists", "permit ip": "IP addresses", "ip host": "Single Sender host", "mac host": "Single Sender MAC host",
  "mac any": "Any MAC address", "host mac": "Sender MAC address", "ip verify": "verify", "verify source": "verify source",
  "source port-security": "Port security", "show ip verify": "verify", "show ip verify source": "verify source",
  "ip routing": "Enable IP routing", "no switchport": "Set switching mode characteristics",
  "monitor session": "Configure a SPAN session", "session source": "SPAN source interface, VLAN", "session destination": "SPAN destination interface or VLAN",
  "source interface": "SPAN source interface", "source vlan": "SPAN source VLAN", "source remote": "SPAN source Remote",
  "destination interface": "SPAN destination interface", "destination remote": "SPAN destination Remote", "remote vlan": "Remote SPAN source RSPAN VLAN",
  "destination remote vlan": "Remote SPAN destination RSPAN VLAN", "encapsulation replicate": "Replicate source port encapsulation",
  "interface encapsulation": "Set encapsulation for destination interface", "session all": "Remove all SPAN sessions in the box",
  "session local": "Remove Local SPAN sessions in the box", "session remote": "Remove Remote SPAN sessions in the box",
  "show monitor": "SPAN information and configuration", "show monitor session": "SPAN session", "session type": "Session type",
  "type erspan-source": "SPAN source session", "type erspan-destination": "SPAN destination session",
  "erspan-id": "Set ERSPAN ID", "origin ip": "ERSPAN origin IP address", "ip address": "Set the IP address of an interface",
  "erspan destination": "Configure destination", "show monitor session all": "Show all SPAN sessions",
  "fhrp version": "Set FHRP version", "version vrrp": "VRRP version", "vrrp v3": "VRRP version 3",
  "vrrp address-family": "Configure VRRPv3 address family", "address-family ipv4": "Address Family", "show vrrp": "VRRP information",
  "show vrrp brief": "Brief output", "show vrrp all": "Include groups in disabled state", "show glbp": "GLBP information", "show glbp brief": "Brief output",
  "glbp ip": "Enable group and set virtual IP address", "glbp priority": "Priority level", "glbp preempt": "Overthrow lower priority designated routers",
  "glbp weighting": "Gateway weighting", "weighting track": "Weighting tracking", "glbp load-balancing": "Load balancing method",
  "load-balancing round-robin": "Load balance equally using each forwarder in turn", "load-balancing weighted": "Load balance in proportion to forwarder weighting",
  "load-balancing host-dependent": "Load balance equally, source MAC determines forwarder choice", "glbp authentication": "Authentication method",
  "glbp name": "Redundancy name", "vrrp ip": "Enable Virtual Router Redundancy Protocol (VRRP) and set virtual IP address",
  "vrrp priority": "Priority of this VRRP group", "vrrp preempt": "Enable preemption of lower priority Master",
  "vrrp track": "Event Tracking", "vrrp timers": "Set the VRRP timers", "timers advertise": "Set the Advertisement timer",
  "vrrp description": "Group specific description", "vrrp authentication": "Authentication string", "preempt delay": "Wait before preempting",
  "delay minimum": "Delay at least this long", "weighting lower": "Weighting lower threshold", "lower upper": "Weighting upper threshold",
  "address primary": "Primary Address", "address secondary": "Secondary Address",
});
addHelp(HELP, {
  mst: "Multiple spanning tree configuration", instance: "Map vlans to an MST instance", revision: "Set configuration revision number",
  current: "Display mst configuration currently used", pending: "Display the new mst configuration to be applied",
  abort: "Exit region configuration mode, aborting changes", guard: "Change an interface's spanning tree guard mode",
  bpdufilter: "Don't send or receive BPDUs on this interface", loopguard: "Spanning tree loopguard options",
  uplinkfast: "Enable UplinkFast Feature", backbonefast: "Enable BackboneFast Feature", errdisable: "Error disable",
  recovery: "Error disable recovery", cause: "Enable error disable recovery for application", vtp: "Configure global VTP state",
  "private-vlan": "Configure a private VLAN", "remote-span": "Configure as Remote SPAN VLAN", protected: "Configure an interface to be a protected port",
  voice: "Voice appliance attributes", "storm-control": "storm configuration", level: "Set storm suppression level on this interface",
  snooping: "DHCP Snooping", relay: "DHCP relay agent parameters", inspection: "Arp Inspection configuration",
  verify: "verify", routing: "Enable IP routing", session: "Configure a SPAN session", fhrp: "Configure First Hop Redundancy Protocol (FHRP)",
  vrrp: "VRRP Interface configuration commands", glbp: "Gateway Load Balancing Protocol interface commands", address: "Set the IPv4 address",
  "exit-vrrp": "Exit from VRRP configuration mode", destination: "Configure destination", "origin": "ERSPAN origin",
  "load-balancing": "Load balancing method", weighting: "Gateway weighting", "erspan-id": "Set ERSPAN ID",
});
addHelp(HELP_MODE, {
  mst: { name: "Set configuration name", show: "Display region configurations", exit: "Exit from MST configuration mode",
    "no name": "Set configuration name", "no instance": "Map vlans to an MST instance" },
  vrrp: { exit: "Exit from VRRP configuration mode", address: "Set the IPv4 address", priority: "Priority of this VRRP group",
    preempt: "Enable preemption of lower priority Master", track: "Event Tracking", timers: "Set the VRRP timers",
    description: "Group specific description", shutdown: "Disable VRRP Configuration", "no shutdown": "Disable VRRP Configuration" },
  arpacl: { permit: "Specify packets to forward", exit: "Exit from ARP access list configuration mode" },
  erspan: { source: "SPAN source interface", destination: "Configure destination", shutdown: "Disable this session",
    description: "Session description", exit: "Exit from SPAN session configuration mode" },
  erspanr: { source: "Configure source", destination: "SPAN destination interface", shutdown: "Disable this session",
    description: "Session description", exit: "Exit from SPAN session configuration mode" },
  erspandst: { "erspan-id": "Set ERSPAN ID", ip: "ERSPAN destination IP address configuration", "ip address": "ERSPAN destination IP address", origin: "ERSPAN origin", exit: "Exit from destination configuration mode" },
  erspanrsrc: { "erspan-id": "Set ERSPAN ID", ip: "ERSPAN source IP address configuration", "ip address": "ERSPAN source IP address", exit: "Exit from source configuration mode" },
});
addHelp(HELP_MODE.config, { vtp: "Configure global VTP state", errdisable: "Error disable" });


// -- modes -------------------------------------------------------------------------------------------------
Object.assign(MODES, { mst: "(config-mst)#", vrrp: "(config-if-vrrp)#", erspan: "(config-mon-erspan-src)#",
  erspandst: "(config-mon-erspan-src-dst)#", erspanr: "(config-mon-erspan-dst)#", erspanrsrc: "(config-mon-erspan-dst-src)#",
  arpacl: "(config-arp-nacl)#" });
const SW_MODES = ["mst", "vrrp", "erspan", "erspandst", "erspanr", "erspanrsrc", "arpacl"];
SUBMODES.push(...SW_MODES);
CONFIG_MODES.push(...SW_MODES);
for (const m of SW_MODES) def(m === "vrrp" || m.startsWith("erspan") ? "R" : "S", m, "end", (c) => c.s.endConfig());
def("S", ["mst", "arpacl"], "exit", (c) => c.s.enter("config", null));
def("R", "vrrp", "exit", (c) => c.s.enter("if", [c.target.ifn]));
def("R", "vrrp", "exit-vrrp", (c) => c.s.enter("if", [c.target.ifn]));
def("R", ["erspan", "erspanr"], "exit", (c) => c.s.enter("config", null));
def("R", "erspandst", "exit", (c) => c.s.enter("erspan", c.target));
def("R", "erspanrsrc", "exit", (c) => c.s.enter("erspanr", c.target));

PARAMS.insts = { fmt: "WORD", help: "MST instance range, example 0-3,5,7-9", match: (t, k) => {
  if (!/^[\d,-]+$/.test(t[k].t)) return null;
  const out = [];
  for (const part of t[k].t.split(",")) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!m) return null;
    const a = +m[1], b = m[2] !== undefined ? +m[2] : a;
    if (b < a || b > 4094) return null;
    for (let i = a; i <= b; i++) out.push(i);
  }
  return { used: 1, value: [...new Set(out)] };
} };
PARAMS.pct = { fmt: "<0.00 - 100.00>", help: "Enter rising threshold", match: (t, k) => {
  const v = Number(t[k].t);
  return /^\d{1,3}(\.\d{1,2})?$/.test(t[k].t) && v >= 0 && v <= 100 ? { used: 1, value: v } : null;
} };


// -- MST ------------------------------------------------------------------------------------------------
const mstSet = (cfg) => (cfg.mst = cfg.mst || clone(MST_DEFAULT));
def("S", "config", "spanning-tree mode mst", (c) => { c.cfg.stp.mode = "mst"; });
def("S", "config", "spanning-tree mst configuration", (c) => c.s.enter("mst", clone(mstOf(c.cfg))));
def("S", "mst", "name <word|Configuration name>", (c, [n]) => {
  if (n.length > 32) { c.print("% Name too long, maximum is 32 characters"); return; }
  mstSet(c.cfg).name = n;
});
def("S", "mst", "no name", (c) => { mstSet(c.cfg).name = ""; });
def("S", "mst", "revision <num:0-65535|Configuration revision number>", (c, [r]) => { mstSet(c.cfg).rev = r; });
def("S", "mst", "no revision", (c) => { mstSet(c.cfg).rev = 0; });
// The list may carry spaces after the commas, as show running-config prints it ("10, 20").
const mstVlanList = (c, text, at) => {
  const vs = parseVlans(text.replace(/\s+/g, ""));
  if (!vs) c.invalid(at);
  return vs;
};
def("S", "mst", "instance <num:1-4094|MST instance id> vlan <line|Range of vlans to add to the instance mapping, example 1-3,5,7-9>", (c, [i, text]) => {
  const vs = mstVlanList(c, text, 3);
  if (!vs) return;
  const m = mstSet(c.cfg);
  for (const [k, list] of Object.entries(m.map)) m.map[k] = list.filter((v) => !vs.includes(v));
  m.map[i] = [...new Set([...(m.map[i] || []), ...vs])].sort((a, b) => a - b);
  for (const k of Object.keys(m.map)) if (!m.map[k].length) delete m.map[k];
});
def("S", "mst", "no instance <num:1-4094|MST instance id>", (c, [i]) => { delete mstSet(c.cfg).map[i]; });
def("S", "mst", "no instance <num:1-4094|MST instance id> vlan <line|Range of vlans to remove from the instance mapping>", (c, [i, text]) => {
  const vs = mstVlanList(c, text, 4);
  if (!vs) return;
  const m = mstSet(c.cfg);
  if (m.map[i]) m.map[i] = m.map[i].filter((v) => !vs.includes(v));
  if (m.map[i] && !m.map[i].length) delete m.map[i];
});
def("S", "mst", "show current", (c) => c.print("Current MST configuration", showMstConfig(c.target)));
def("S", "mst", "show pending", (c) => c.print("Pending MST configuration", showMstConfig(mstOf(c.cfg))));
def("S", "mst", "show", (c) => c.print("Pending MST configuration", showMstConfig(mstOf(c.cfg))));
def("S", "mst", "abort", (c) => { c.cfg.mst = c.target; c.s.enter("config", null); });
const mstPrio = (c, insts, p) => {
  if (p % 4096) {
    c.print("% Bridge Priority must be in increments of 4096.", "% Allowed values are:",
      "  0     4096  8192  12288 16384 20480 24576 28672", "  32768 36864 40960 45056 49152 53248 57344 61440");
    return;
  }
  for (const i of insts) mstSet(c.cfg).prio[i] = p;
};
def("S", "config", "spanning-tree mst <insts> priority <num:0-61440|bridge priority in increments of 4096>", (c, [is, p]) => mstPrio(c, is, p));
def("S", "config", "no spanning-tree mst <insts> priority", (c, [is]) => { for (const i of is) delete mstSet(c.cfg).prio[i]; });
def("S", "config", "spanning-tree mst <insts> root {primary|secondary}", (c, [is, which]) => {
  for (const i of is) {
    if (which === "secondary") { mstSet(c.cfg).prio[i] = 28672; continue; }
    const v = mstVlansOf(c.cfg, i).find((x) => c.cfg.vlans[x]);
    const s = v && c.net.stp(v)[c.d.name];
    const rootPrio = s ? s.root[0] - i : 32768;
    if (s && s.rootPort === null && cmpVec(s.root, s.bid) === 0) { mstSet(c.cfg).prio[i] = Math.min(mstOf(c.cfg).prio[i] ?? 32768, 24576); continue; }
    mstSet(c.cfg).prio[i] = rootPrio > 24576 ? 24576 : Math.max(0, rootPrio - 4096);
  }
});
def("S", "config", "no spanning-tree mst <insts> root", (c, [is]) => { for (const i of is) delete mstSet(c.cfg).prio[i]; });
def("S", IF_MODES, "spanning-tree mst <insts> cost <num:1-200000000|Change an interface's per instance spanning tree path cost>", (c, [is, k]) => l2If(c, (n, i) => {
  const x = xOf(i);
  x.mstCost = x.mstCost || {};
  for (const m of is) x.mstCost[m] = k;
}));
def("S", IF_MODES, "no spanning-tree mst <insts> cost", (c, [is]) => l2If(c, (n, i) => {
  const x = xOf(i);
  for (const m of is) if (x.mstCost) delete x.mstCost[m];
  if (x.mstCost && !Object.keys(x.mstCost).length) delete x.mstCost;
}));
def("S", IF_MODES, "spanning-tree mst <insts> port-priority <num:0-240|port priority in increments of 16>", (c, [is, p]) => {
  if (p % 16) { c.print("% Port Priority in increments of 16 is required", "% Allowed values are:", "  0   16  32  48  64  80  96  112 128 144 160 176 192 208 224 240"); return; }
  l2If(c, (n, i) => {
    const x = xOf(i);
    x.mstPrio = x.mstPrio || {};
    for (const m of is) x.mstPrio[m] = p;
  });
});
def("S", IF_MODES, "no spanning-tree mst <insts> port-priority", (c, [is]) => l2If(c, (n, i) => {
  const x = xOf(i);
  for (const m of is) if (x.mstPrio) delete x.mstPrio[m];
  if (x.mstPrio && !Object.keys(x.mstPrio).length) delete x.mstPrio;
}));
def("S", both, "show spanning-tree mst", (c) => c.print(showMst(c.net, c.d.name, null)));
def("S", both, "show spanning-tree mst <num:0-4094|MST instance number>", (c, [i]) => c.print(showMst(c.net, c.d.name, i)));
def("S", both, "show spanning-tree mst configuration", (c) => c.print(showMstConfig(mstOf(c.cfg))));

// -- STP protection and errdisable recovery --------------------------------------------------------------------
const stpx = (cfg) => (cfg.stpx = cfg.stpx || {});
def("S", IF_MODES, "spanning-tree guard {root|loop|none}", (c, [g]) => l2If(c, (n, i) => { xOf(i).guard = g; }));
def("S", IF_MODES, "no spanning-tree guard", (c) => l2If(c, (n, i) => { delete xOf(i).guard; }));
def("S", IF_MODES, "spanning-tree bpdufilter {enable|disable}", (c, [w]) => l2If(c, (n, i) => { xOf(i).bpdufilter = w === "enable"; }));
def("S", IF_MODES, "no spanning-tree bpdufilter", (c) => l2If(c, (n, i) => { delete xOf(i).bpdufilter; }));
def("S", "config", "spanning-tree loopguard default", (c) => { stpx(c.cfg).loopguard = true; });
def("S", "config", "no spanning-tree loopguard default", (c) => { delete stpx(c.cfg).loopguard; });
def("S", "config", "spanning-tree portfast bpdufilter default", (c) => { stpx(c.cfg).bpdufilter = true; });
def("S", "config", "spanning-tree portfast edge bpdufilter default", (c) => { stpx(c.cfg).bpdufilter = true; });
def("S", "config", "no spanning-tree portfast bpdufilter default", (c) => { delete stpx(c.cfg).bpdufilter; });
def("S", "config", "spanning-tree uplinkfast", (c) => {
  stpx(c.cfg).uplinkfast = true;
  if (c.cfg.stp.mode !== "pvst") c.print("%Warning: UplinkFast is not effective in rapid-pvst and mst modes");
});
def("S", "config", "no spanning-tree uplinkfast", (c) => { delete stpx(c.cfg).uplinkfast; });
def("S", "config", "spanning-tree backbonefast", (c) => { stpx(c.cfg).backbonefast = true; });
def("S", "config", "no spanning-tree backbonefast", (c) => { delete stpx(c.cfg).backbonefast; });
const errRec = (cfg) => (cfg.errRec = cfg.errRec || { causes: [], interval: 300 });
const ERR_SPEC = `{all|${ERR_CAUSES.join("|")}}`;
def("S", "config", "errdisable recovery cause " + ERR_SPEC, (c, [cause]) => {
  const e = errRec(c.cfg);
  if (!e.causes.includes(cause)) e.causes.push(cause);
});
def("S", "config", "no errdisable recovery cause " + ERR_SPEC, (c, [cause]) => {
  const e = errRec(c.cfg);
  e.causes = cause === "all" ? [] : e.causes.filter((x) => x !== cause);
  if (!e.causes.length && e.interval === 300) delete c.cfg.errRec;
});
def("S", "config", "errdisable recovery interval <num:30-86400|timer-interval(sec)>", (c, [s]) => { errRec(c.cfg).interval = s; });
def("S", "config", "no errdisable recovery interval", (c) => {
  errRec(c.cfg).interval = 300;
  if (!c.cfg.errRec.causes.length) delete c.cfg.errRec;
});
def("S", both, "show errdisable recovery", (c) => c.print(showErrRecovery(c.net, c.d.name)));

// -- VTP -----------------------------------------------------------------------------------------------------
// VLAN changes a VTP client (or a VTPv3 secondary server) refuses.
function vtpDeny(c) {
  const v = vtpOf(c.cfg);
  if (v.mode === "client") { c.print("VTP VLAN configuration not allowed when device is in CLIENT mode."); return true; }
  if (v.mode === "server" && v.ver === 3 && !v.primary) { c.print("VTP VLAN configuration not allowed when device is not the primary server for vlan database."); return true; }
  return false;
}
def("S", "config", "vtp domain <word|The ascii name for the VTP administrative domain.>", (c, [n]) => {
  const v = vtpSet(c.cfg);
  if (n.length > 32) { c.print("% Domain name must be 32 characters or fewer"); return; }
  if (v.domain === n) { c.print(`Domain name already set to ${n}.`); return; }
  c.print(`Changing VTP domain name from ${v.domain || "NULL"} to ${n}`);
  Object.assign(v, { domain: n, rev: 0, primary: false });
});
def("S", "config", "vtp mode {server|client|transparent|off}", (c, [m]) => {
  const v = vtpSet(c.cfg);
  const title = { server: "VTP Server", client: "VTP Client", transparent: "Transparent", off: "VTP Off" }[m];
  if (v.mode === m) { c.print(`Device mode already ${title} for VLANS.`); return; }
  if (m === "client" && Object.values(c.cfg.vlanx || {}).some((x) => x.pv) && v.ver !== 3) {
    c.print("VTP Mode cannot be changed to Client/Server as private VLANs are configured"); return;
  }
  // Leaving server or client resets the configuration revision to 0.
  if (m === "transparent" || m === "off") v.rev = 0;
  v.mode = m;
  v.primary = false;
  c.print(`Setting device to ${title} mode for VLANS.`);
});
def("S", "config", "no vtp mode", (c) => { vtpSet(c.cfg).mode = "server"; c.print("Setting device to VTP Server mode for VLANS."); });
def("S", "config", "vtp password <word|The ascii password for the VTP administrative domain.>", (c, [p]) => {
  vtpSet(c.cfg).pw = p;
  c.print(`Setting device VTP password to ${p}`);
});
def("S", "config", "no vtp password", (c) => { vtpSet(c.cfg).pw = null; c.print("Clearing device VTP password."); });
def("S", "config", "vtp version {1|2|3}", (c, [w]) => {
  const v = vtpSet(c.cfg), ver = +w;
  if (ver === 3 && !v.domain) { c.print("Cannot set the version to 3 because domain name is not configured"); return; }
  if (v.ver === ver) return;
  v.ver = ver;
  v.primary = false;
  // A version change on a server is advertised like a VLAN change: it raises the revision.
  if (v.mode === "server" && ver !== 3) v.rev++;
});
def("S", "config", "no vtp version", (c) => { vtpSet(c.cfg).ver = 1; });
def("S", "config", "vtp pruning", (c) => {
  const v = vtpSet(c.cfg);
  if (v.mode === "client") { c.print("Pruning can only be configured on VTP server"); return; }
  if (!v.pruning && v.mode === "server" && (v.ver !== 3 || v.primary)) v.rev++;
  v.pruning = true;
  c.print("Pruning switched on");
});
def("S", "config", "no vtp pruning", (c) => {
  const v = vtpSet(c.cfg);
  if (v.pruning && v.mode === "server" && (v.ver !== 3 || v.primary)) v.rev++;
  v.pruning = false;
  c.print("Pruning switched off");
});
def("S", "priv", "vtp primary", (c) => {
  const v = vtpOf(c.cfg);
  if (v.ver !== 3 || v.mode !== "server") { c.print("% VTP primary can only be configured on a VTP version 3 server"); return; }
  c.print("This system is becoming primary server for feature vlan");
  c.s.ask("Do you want to continue? [confirm]", {}, (ans) => {
    if (ans.trim() && !/^y/i.test(ans.trim())) return;
    for (const d of Object.values(c.net.devs)) if (d.type === "switch" && d.cfg.vtp && d.cfg.vtp.domain === v.domain) d.cfg.vtp.primary = false;
    vtpSet(c.cfg).primary = true;
    c.net.note(c.d.name, `%SW_VLAN-4-VTP_PRIMARY_SERVER_CHG: ${c.net.mac(c.d.name, "Vlan1")} has become the primary server for the VLAN VTP feature`);
  });
});
def("S", both, "show vtp status", (c) => c.print(showVtpStatus(c.net, c.d.name)));
def("S", both, "show vtp password", (c) => {
  const v = vtpOf(c.cfg);
  c.print(v.pw ? `VTP Password: ${v.pw}` : "The VTP password is not configured.");
});
def("S", both, "show vtp counters", (c) => c.print(["VTP statistics:", "Summary advertisements received    : 0", "Subset advertisements received     : 0",
  "Request advertisements received    : 0", "Summary advertisements transmitted : 0", "Subset advertisements transmitted  : 0",
  "Request advertisements transmitted : 0", "Number of config revision errors   : 0", "Number of config digest errors     : 0"].join("\n")));

// -- private VLANs, RSPAN VLANs, voice VLANs, protected ports ------------------------------------------------------
const vlanx = (cfg, v) => { cfg.vlanx = cfg.vlanx || {}; return (cfg.vlanx[v] = cfg.vlanx[v] || {}); };
const tidyVlanx = (cfg) => {
  for (const [k, x] of Object.entries(cfg.vlanx || {})) {
    if (!x.pv && !x.rspan) delete cfg.vlanx[k];
    else if (x.assoc && !x.assoc.length) delete x.assoc;
  }
  if (cfg.vlanx && !Object.keys(cfg.vlanx).length) delete cfg.vlanx;
};
const pvlanOk = (c) => {
  const v = vtpOf(c.cfg);
  if (v.ver !== 3 && v.mode !== "transparent" && v.mode !== "off") {
    c.print("%Private VLANs can only be configured when VTP is in transparent/off modes");
    return false;
  }
  return true;
};
def("S", "vlan", "private-vlan {primary|isolated|community}", (c, [t]) => {
  if (!pvlanOk(c)) return;
  for (const v of c.target) {
    if (v === 1) { c.print("%Command rejected: VLAN 1 cannot be a private VLAN"); return; }
    const x = vlanx(c.cfg, v);
    x.pv = t;
    if (t !== "primary") delete x.assoc;
  }
});
def("S", "vlan", "no private-vlan {primary|isolated|community}", (c) => { for (const v of c.target) delete vlanx(c.cfg, v).pv; tidyVlanx(c.cfg); });
def("S", "vlan", "private-vlan association <vlans|Secondary VLAN IDs>", (c, [vs]) => {
  for (const v of c.target) {
    const x = vlanx(c.cfg, v);
    if (x.pv !== "primary") { c.print(`%Command rejected: VLAN ${v} is not a primary vlan`); return; }
    x.assoc = [...vs].sort((a, b) => a - b);
  }
});
def("S", "vlan", "private-vlan association add <vlans|Secondary VLAN IDs>", (c, [vs]) => {
  for (const v of c.target) { const x = vlanx(c.cfg, v); x.assoc = [...new Set([...(x.assoc || []), ...vs])].sort((a, b) => a - b); }
});
def("S", "vlan", "private-vlan association remove <vlans|Secondary VLAN IDs>", (c, [vs]) => {
  for (const v of c.target) { const x = vlanx(c.cfg, v); x.assoc = (x.assoc || []).filter((s) => !vs.includes(s)); }
  tidyVlanx(c.cfg);
});
def("S", "vlan", "no private-vlan association", (c) => { for (const v of c.target) delete vlanx(c.cfg, v).assoc; tidyVlanx(c.cfg); });
def("S", "vlan", "remote-span", (c) => { for (const v of c.target) vlanx(c.cfg, v).rspan = true; });
def("S", "vlan", "no remote-span", (c) => { for (const v of c.target) delete vlanx(c.cfg, v).rspan; tidyVlanx(c.cfg); });
def("S", IF_MODES, "switchport mode private-vlan {host|promiscuous}", (c, [m]) => l2If(c, (n, i) => {
  if (isPo(n)) { c.invalid(0); return false; }
  i.mode = "private-vlan " + m;
  xOf(i);
  return true;
}));
def("S", IF_MODES, "switchport private-vlan host-association <num:2-4094|Primary extended range VLAN ID of the private VLAN host port association> <num:2-4094|Secondary extended range VLAN ID of the private VLAN host port association>",
  (c, [p, s]) => l2If(c, (n, i) => { xOf(i).pvHost = [p, s]; }));
def("S", IF_MODES, "no switchport private-vlan host-association", (c) => l2If(c, (n, i) => { delete xOf(i).pvHost; }));
def("S", IF_MODES, "switchport private-vlan mapping <num:2-4094|Primary extended range VLAN ID of the private VLAN promiscuous port mapping> <vlans|Secondary VLAN IDs>",
  (c, [p, vs]) => l2If(c, (n, i) => { xOf(i).pvProm = [p, [...vs].sort((a, b) => a - b)]; }));
def("S", IF_MODES, "switchport private-vlan mapping <num:2-4094|Primary extended range VLAN ID of the private VLAN promiscuous port mapping> add <vlans|Secondary VLAN IDs>",
  (c, [p, vs]) => l2If(c, (n, i) => {
    const cur = xOf(i).pvProm && xOf(i).pvProm[0] === p ? xOf(i).pvProm[1] : [];
    xOf(i).pvProm = [p, [...new Set([...cur, ...vs])].sort((a, b) => a - b)];
  }));
def("S", IF_MODES, "switchport private-vlan mapping <num:2-4094|Primary extended range VLAN ID of the private VLAN promiscuous port mapping> remove <vlans|Secondary VLAN IDs>",
  (c, [p, vs]) => l2If(c, (n, i) => { if (xOf(i).pvProm) xOf(i).pvProm[1] = xOf(i).pvProm[1].filter((s) => !vs.includes(s)); }));
def("S", IF_MODES, "no switchport private-vlan mapping", (c) => l2If(c, (n, i) => { delete xOf(i).pvProm; }));
def("S", IF_MODES, "private-vlan mapping <vlans|Secondary VLAN IDs>", (c, [vs]) => eachIf(c, (n, i) => {
  if (!n.startsWith("Vlan")) { c.invalid(0); return false; }
  xOf(i).pvMap = [...vs].sort((a, b) => a - b);
  return true;
}));
def("S", IF_MODES, "no private-vlan mapping", (c) => eachIf(c, (n, i) => { if (i.x) delete i.x.pvMap; }));
def("S", both, "show vlan private-vlan", (c) => c.print(showPvlan(c.net, c.d.name)));
def("S", both, "show vlan remote-span", (c) => {
  const vs = Object.entries(c.cfg.vlanx || {}).filter(([k, x]) => x.rspan && c.cfg.vlans[k]).map(([k]) => +k);
  c.print(["", "Remote SPAN VLANs", "------------------------------------------------------------------------------", vlanStr(vs)].join("\n"));
});
def("S", IF_MODES, "switchport voice vlan <num:1-4094|Vlan for voice traffic>", (c, [v]) => l2If(c, (n, i) => {
  if (!c.cfg.vlans[v] && !vtpDeny(c)) { c.print(`% Voice VLAN does not exist. Creating vlan ${v}`); c.cfg.vlans[v] = vlanLabel(v); }
  xOf(i).voice = v;
}));
def("S", IF_MODES, "switchport voice vlan none", (c) => l2If(c, (n, i) => { delete xOf(i).voice; }));
def("S", IF_MODES, "no switchport voice vlan", (c) => l2If(c, (n, i) => { delete xOf(i).voice; }));
def("S", IF_MODES, "switchport protected", (c) => l2If(c, (n, i) => { xOf(i).prot = true; }));
def("S", IF_MODES, "no switchport protected", (c) => l2If(c, (n, i) => { delete xOf(i).prot; }));

// -- storm control -----------------------------------------------------------------------------------------------
def("S", IF_MODES, "storm-control {broadcast|multicast|unicast} level <pct>", (c, [k, lvl]) => l2If(c, (n, i) => {
  const x = xOf(i);
  x.storm = { ...(x.storm || {}), [k]: lvl };
}));
def("S", IF_MODES, "no storm-control {broadcast|multicast|unicast} level", (c, [k]) => l2If(c, (n, i) => {
  const x = xOf(i);
  if (x.storm) delete x.storm[k];
  if (x.storm && !Object.keys(x.storm).length) delete x.storm;
}));
def("S", IF_MODES, "storm-control action {shutdown|trap}", (c, [a]) => l2If(c, (n, i) => { const x = xOf(i); x.storm = { ...(x.storm || {}), action: a }; }));
def("S", IF_MODES, "no storm-control action {shutdown|trap}", (c) => l2If(c, (n, i) => { const x = xOf(i); if (x.storm) delete x.storm.action; }));
def("S", both, "show storm-control", (c) => c.print(showStorm(c.net, c.d.name, null, "broadcast")));
def("S", both, "show storm-control {broadcast|multicast|unicast}", (c, [k]) => c.print(showStorm(c.net, c.d.name, null, k)));
def("S", both, "show storm-control <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => c.print(showStorm(c.net, c.d.name, ifn, "broadcast"))));

// -- DHCP snooping, DAI, IP source guard ----------------------------------------------------------------------------
const snoop = (cfg) => (cfg.snoop = cfg.snoop || { on: false, vlans: [], opt82: true });
def("S", "config", "ip dhcp snooping", (c) => { snoop(c.cfg).on = true; });
def("S", "config", "no ip dhcp snooping", (c) => { snoop(c.cfg).on = false; });
def("S", "config", "ip dhcp snooping vlan <vlans|DHCP Snooping vlan first number or vlan range>", (c, [vs]) => {
  const s = snoop(c.cfg);
  s.vlans = [...new Set([...s.vlans, ...vs])].sort((a, b) => a - b);
});
def("S", "config", "no ip dhcp snooping vlan <vlans|DHCP Snooping vlan first number or vlan range>", (c, [vs]) => {
  const s = snoop(c.cfg);
  s.vlans = s.vlans.filter((v) => !vs.includes(v));
});
def("S", "config", "ip dhcp snooping information option", (c) => { snoop(c.cfg).opt82 = true; });
def("S", "config", "no ip dhcp snooping information option", (c) => { snoop(c.cfg).opt82 = false; });
def("S", IF_MODES, "ip dhcp snooping trust", (c) => l2If(c, (n, i) => { xOf(i).snoopTrust = true; }));
def("S", IF_MODES, "no ip dhcp snooping trust", (c) => l2If(c, (n, i) => { delete xOf(i).snoopTrust; }));
def("S", IF_MODES, "ip dhcp snooping limit rate <num:1-2048|DHCP snooping rate limit>", (c, [r]) => l2If(c, (n, i) => { xOf(i).snoopRate = r; }));
def("S", IF_MODES, "no ip dhcp snooping limit rate", (c) => l2If(c, (n, i) => { delete xOf(i).snoopRate; }));
def("S", "priv", "show ip dhcp snooping", (c) => c.print(showSnooping(c.net, c.d.name)));
def("S", "priv", "show ip dhcp snooping binding", (c) => c.print(showSnoopBinding(c.net, c.d.name)));
def("S", "priv", "clear ip dhcp snooping binding", (c) => { c.d.rt.snoop = {}; });
def("R", "config", "ip dhcp relay information trust-all", (c) => { c.cfg.dhcpTrustAll = true; });
def("R", "config", "no ip dhcp relay information trust-all", (c) => { delete c.cfg.dhcpTrustAll; });
def("R", IF_MODES, "ip dhcp relay information trusted", (c) => eachIf(c, (n, i) => { xOf(i).relayTrust = true; }));
def("R", IF_MODES, "no ip dhcp relay information trusted", (c) => eachIf(c, (n, i) => { if (i.x) delete i.x.relayTrust; }));

const dai = (cfg) => (cfg.dai = cfg.dai || { vlans: [], validate: [], filters: {} });
def("S", "config", "ip arp inspection vlan <vlans|DAI vlan first number or vlan range>", (c, [vs]) => {
  const a = dai(c.cfg);
  a.vlans = [...new Set([...a.vlans, ...vs])].sort((x, y) => x - y);
});
def("S", "config", "no ip arp inspection vlan <vlans|DAI vlan first number or vlan range>", (c, [vs]) => {
  const a = dai(c.cfg);
  a.vlans = a.vlans.filter((v) => !vs.includes(v));
});
for (const combo of ["src-mac", "dst-mac", "ip", "src-mac dst-mac", "src-mac ip", "dst-mac ip", "src-mac dst-mac ip"]) {
  def("S", "config", "ip arp inspection validate " + combo, (c) => { dai(c.cfg).validate = combo.split(" "); });
}
def("S", "config", "no ip arp inspection validate", (c) => { dai(c.cfg).validate = []; });
const daiFilter = (c, acl, vs, st) => { for (const v of vs) dai(c.cfg).filters[v] = { acl, static: st }; };
def("S", "config", "ip arp inspection filter <word|ARP acl name> vlan <vlans|Vlans to apply the filter>", (c, [a, vs]) => daiFilter(c, a, vs, false));
def("S", "config", "ip arp inspection filter <word|ARP acl name> vlan <vlans|Vlans to apply the filter> static", (c, [a, vs]) => daiFilter(c, a, vs, true));
def("S", "config", "no ip arp inspection filter <word|ARP acl name> vlan <vlans|Vlans to apply the filter>", (c, [, vs]) => { for (const v of vs) delete dai(c.cfg).filters[v]; });
def("S", "config", "arp access-list <word|access-list name>", (c, [n]) => {
  c.cfg.arpAcls = c.cfg.arpAcls || {};
  c.cfg.arpAcls[n] = c.cfg.arpAcls[n] || [];
  c.s.enter("arpacl", n);
});
def("S", "config", "no arp access-list <word|access-list name>", (c, [n]) => {
  if (c.cfg.arpAcls) delete c.cfg.arpAcls[n];
  if (c.cfg.arpAcls && !Object.keys(c.cfg.arpAcls).length) delete c.cfg.arpAcls;
});
const arpAce = (c, ip, mac) => {
  const list = c.cfg.arpAcls[c.target];
  if (!list.some((e) => e.ip === ip && e.mac === mac)) list.push({ ip, mac });
};
def("S", "arpacl", "permit ip host <ip|Sender IP address> mac host <mac|Sender MAC address>", (c, [ip, m]) => arpAce(c, ip, m));
def("S", "arpacl", "permit ip host <ip|Sender IP address> mac any", (c, [ip]) => arpAce(c, ip, null));
def("S", "arpacl", "no permit ip host <ip|Sender IP address> mac host <mac|Sender MAC address>", (c, [ip, m]) => {
  c.cfg.arpAcls[c.target] = c.cfg.arpAcls[c.target].filter((e) => !(e.ip === ip && e.mac === m));
});
def("S", IF_MODES, "ip arp inspection trust", (c) => l2If(c, (n, i) => { xOf(i).arpTrust = true; }));
def("S", IF_MODES, "no ip arp inspection trust", (c) => l2If(c, (n, i) => { delete xOf(i).arpTrust; }));
def("S", IF_MODES, "ip arp inspection limit rate <num:0-2048|Packets per second>", (c, [r]) => l2If(c, (n, i) => { xOf(i).arpRate = r; }));
def("S", IF_MODES, "no ip arp inspection limit rate", (c) => l2If(c, (n, i) => { delete xOf(i).arpRate; }));
def("S", "priv", "show ip arp inspection", (c) => c.print(showDai(c.net, c.d.name)));
def("S", "priv", "show ip arp inspection interfaces", (c) => c.print(showDaiIfs(c.net, c.d.name)));
def("S", "priv", "show ip arp inspection statistics", (c) => c.print(showDai(c.net, c.d.name)));
def("S", "priv", "show arp access-list", (c) => {
  const L = [];
  for (const [n, es] of Object.entries(c.cfg.arpAcls || {})) {
    L.push(`ARP access list ${n}`);
    for (const e of es) L.push(`    permit ip host ${n2ip(e.ip)} mac ${e.mac === null ? "any" : "host " + e.mac}`);
  }
  c.print(L.join("\n"));
});
def("S", IF_MODES, "ip verify source", (c) => l2If(c, (n, i) => { xOf(i).ipsg = "ip"; }));
def("S", IF_MODES, "ip verify source port-security", (c) => l2If(c, (n, i) => { xOf(i).ipsg = "mac"; }));
def("S", IF_MODES, "no ip verify source", (c) => l2If(c, (n, i) => { delete xOf(i).ipsg; }));
def("S", "priv", "show ip verify source", (c) => c.print(showIpsg(c.net, c.d.name)));

// -- layer-3 switching -------------------------------------------------------------------------------------------
def("S", "config", "ip routing", (c) => { c.cfg.ipRouting = true; });
def("S", "config", "no ip routing", (c) => { delete c.cfg.ipRouting; });
def("S", IF_MODES, "no switchport", (c) => eachIf(c, (n, i) => {
  if (n.startsWith("Vlan") || isPo(n)) { c.invalid(1); return false; }
  if (i.chan) { c.print(`% ${n} is a member of a port-channel; remove the channel-group first`); return false; }
  i.routed = true;
  return true;
}));
def("S", IF_MODES, "switchport", (c) => eachIf(c, (n, i) => {
  if (n.startsWith("Vlan")) { c.invalid(0); return false; }
  if (i.routed) { delete i.routed; i.ip = null; i.mask = null; }
  return true;
}));
const swRoute = (fn) => (c, args) => {
  c.cfg.routes = c.cfg.routes || [];
  fn(c, args);
  if (!c.cfg.routes.length) delete c.cfg.routes;
};
def("S", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <ip|Forwarding router's address>", swRoute((c, [n, m, nh]) => addRoute(c, n, m, undefined, nh, 1)));
def("S", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <ip|Forwarding router's address> <num:1-255|Distance metric for this route>", swRoute((c, [n, m, nh, ad]) => addRoute(c, n, m, undefined, nh, ad)));
def("S", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <intf>", swRoute((c, [n, m, i]) => addRoute(c, n, m, i, null, 1)));
def("S", "config", "ip route <ip|Destination prefix> <ip|Destination prefix mask> <intf> <ip|Forwarding router's address>", swRoute((c, [n, m, i, nh]) => addRoute(c, n, m, i, nh, 1)));
def("S", "config", "no ip route <ip|Destination prefix> <ip|Destination prefix mask>", swRoute((c, [n, m]) => delRoute(c, n, m)));
def("S", "config", "no ip route <ip|Destination prefix> <ip|Destination prefix mask> <ip|Forwarding router's address>", swRoute((c, [n, m, nh]) => delRoute(c, n, m, undefined, nh)));
def("S", IF_MODES, "ip helper-address <ip|IP destination address>", (c, [ip]) => eachIf(c, (n, i) => {
  if (!n.startsWith("Vlan") && !i.routed) { c.invalid(0); return false; }
  i.helpers = i.helpers || [];
  if (!i.helpers.includes(ip)) i.helpers.push(ip);
  return true;
}));
def("S", IF_MODES, "no ip helper-address", (c) => eachIf(c, (n, i) => { delete i.helpers; }));

// -- SPAN, RSPAN ----------------------------------------------------------------------------------------------------
const SESSION = "<num:1-66|SPAN session number>";
const spanOf = (c, id, kind) => {
  c.cfg.span = c.cfg.span || {};
  const s = c.cfg.span[id];
  if (s && kind && s.kind !== kind && !(s.kind === "local" && kind === "rspan-src" && !s.dst) && !(s.kind === "rspan-src" && kind === "local" && !s.remoteVlan)) {
    c.print(`% Session ${id} used by other feature`);
    return null;
  }
  if (!s) c.cfg.span[id] = { kind: kind || "local", src: [] };
  else if (kind) s.kind = kind;
  return c.cfg.span[id];
};
const usedAsDest = (c, ifn) => Object.entries(c.cfg.span || {}).find(([, s]) => s.dst && s.dst.ifn === ifn);
const usedAsSource = (c, ifn) => Object.entries(c.cfg.span || {}).find(([, s]) => (s.src || []).some((x) => x.ifn === ifn));
const spanSource = (c, id, ifn, dir) => c.s.withIf(ifn, 4, (n) => {
  const d = usedAsDest(c, n);
  if (d) { c.print(`% Interface(s) ${shortIf(n)} already configured as monitor destination for session ${d[0]}`); return; }
  const s = spanOf(c, id, null);
  if (!s) return;
  if (s.kind === "rspan-dst") { c.print(`% Session ${id} used by other feature`); return; }
  s.src = s.src.filter((x) => x.ifn !== n);
  s.src.push({ ifn: n, dir });
});
const spanVlanSource = (c, id, vs, dir) => {
  const s = spanOf(c, id, null);
  if (!s) return;
  if (s.kind === "rspan-dst") { c.print(`% Session ${id} used by other feature`); return; }
  s.src = s.src.filter((x) => !x.vlans);
  s.src.push({ vlans: vs, dir });
};
for (const [suffix, dir] of [["", "both"], [" both", "both"], [" rx", "rx"], [" tx", "tx"]]) {
  def("S", "config", `monitor session ${SESSION} source interface <intf>${suffix}`, (c, [id, n]) => spanSource(c, id, n, dir));
  def("S", "config", `monitor session ${SESSION} source vlan <vlans|SPAN source VLAN>${suffix}`, (c, [id, vs]) => spanVlanSource(c, id, vs, dir));
}
def("S", "config", `monitor session ${SESSION} source remote vlan <num:2-1001|Remote SPAN source RSPAN VLAN>`, (c, [id, v]) => {
  const s = spanOf(c, id, "rspan-dst");
  if (!s) return;
  if (s.src.length) { c.print(`% Session ${id} used by other feature`); return; }
  s.remoteVlan = v;
});
def("S", "config", `monitor session ${SESSION} destination interface <intf>`, (c, [id, n]) => c.s.withIf(n, 4, (ifn) => spanDst(c, id, ifn, false)));
def("S", "config", `monitor session ${SESSION} destination interface <intf> encapsulation replicate`, (c, [id, n]) => c.s.withIf(n, 4, (ifn) => spanDst(c, id, ifn, true)));
function spanDst(c, id, ifn, replicate) {
  if (ifn.startsWith("Vlan")) { c.invalid(4); return; }
  const src = usedAsSource(c, ifn);
  if (src) { c.print(`% Interface(s) ${shortIf(ifn)} already configured as monitor sources for session ${src[0]}`); return; }
  const other = usedAsDest(c, ifn);
  if (other && +other[0] !== id) { c.print(`% Interface(s) ${shortIf(ifn)} already configured as monitor destination for session ${other[0]}`); return; }
  const s = (c.cfg.span || {})[id] || spanOf(c, id, "local");
  if (!s) return;
  if (s.kind === "rspan-src") { c.print(`% Session ${id} used by other feature`); return; }
  s.dst = { ifn, replicate };
}
def("S", "config", `monitor session ${SESSION} destination remote vlan <num:2-1001|Remote SPAN destination RSPAN VLAN>`, (c, [id, v]) => {
  const s = spanOf(c, id, "rspan-src");
  if (!s) return;
  if (s.dst) { c.print(`% Session ${id} used by other feature`); return; }
  if (!(c.cfg.vlanx || {})[v] || !c.cfg.vlanx[v].rspan) c.print(`%Warning: VLAN ${v} is not configured as a remote-span VLAN`);
  s.remoteVlan = v;
});
def("RS", "config", `no monitor session ${SESSION}`, (c, [id]) => { if (c.cfg.span) delete c.cfg.span[id]; if (c.cfg.span && !Object.keys(c.cfg.span).length) delete c.cfg.span; });
def("RS", "config", "no monitor session {all|local|remote}", (c, [w]) => {
  for (const [id, s] of Object.entries(c.cfg.span || {})) {
    const remote = s.kind.startsWith("rspan") || s.kind.startsWith("erspan");
    if (w === "all" || (w === "remote") === remote) delete c.cfg.span[id];
  }
  if (c.cfg.span && !Object.keys(c.cfg.span).length) delete c.cfg.span;
});
def("S", "config", `no monitor session ${SESSION} source interface <intf>`, (c, [id, n]) => {
  const s = (c.cfg.span || {})[id];
  if (s) s.src = s.src.filter((x) => x.ifn !== n);
});
def("S", "config", `no monitor session ${SESSION} destination interface <intf>`, (c, [id]) => {
  const s = (c.cfg.span || {})[id];
  if (s) delete s.dst;
});
def("RS", both, "show monitor", (c) => c.print(showMonitor(c.net, c.d.name, null)));
def("RS", both, "show monitor session {all}", (c) => c.print(showMonitor(c.net, c.d.name, null)));
def("RS", both, `show monitor session <num:1-1024|SPAN session number>`, (c, [id]) => c.print(showMonitor(c.net, c.d.name, id)));

// ERSPAN on routers: the source session sends GRE-encapsulated copies to an IP destination.
const ERS = "<num:1-1024|SPAN session number>";
def("R", "config", `monitor session ${ERS} type {erspan-source|erspan-destination}`, (c, [id, t]) => {
  const kind = t === "erspan-source" ? "erspan-src" : "erspan-dst";
  c.cfg.span = c.cfg.span || {};
  const s = c.cfg.span[id];
  if (s && s.kind !== kind) { c.print(`% Session ${id} used by other feature`); return; }
  if (!s) c.cfg.span[id] = { kind, src: [], shut: true, erspan: { id: null, ip: null, origin: null } };
  c.s.enter(kind === "erspan-src" ? "erspan" : "erspanr", id);
});
for (const [suffix, dir] of [["", "both"], [" both", "both"], [" rx", "rx"], [" tx", "tx"]]) {
  def("R", "erspan", `source interface <intf>${suffix}`, (c, [n]) => c.s.withIf(n, 2, (ifn) => {
    const s = c.cfg.span[c.target];
    s.src = s.src.filter((x) => x.ifn !== ifn);
    s.src.push({ ifn, dir });
  }));
}
def("R", "erspan", "no source interface <intf>", (c, [n]) => { const s = c.cfg.span[c.target]; s.src = s.src.filter((x) => x.ifn !== n); });
def("R", ["erspan", "erspanr"], "shutdown", (c) => { c.cfg.span[c.target].shut = true; });
def("R", ["erspan", "erspanr"], "no shutdown", (c) => { c.cfg.span[c.target].shut = false; });
def("R", ["erspan", "erspanr"], "description <line|Up to 240 characters describing this session>", (c, [t]) => { c.cfg.span[c.target].desc = t; });
def("R", "erspan", "destination", (c) => c.s.enter("erspandst", c.target));
def("R", "erspanr", "source", (c) => c.s.enter("erspanrsrc", c.target));
def("R", "erspanr", "destination interface <intf>", (c, [n]) => c.s.withIf(n, 2, (ifn) => { c.cfg.span[c.target].dst = { ifn, replicate: false }; }));
def("R", ["erspandst", "erspanrsrc"], "erspan-id <num:1-1023|ERSPAN flow ID>", (c, [i]) => { c.cfg.span[c.target].erspan.id = i; });
def("R", ["erspandst", "erspanrsrc"], "ip address <ip|IP address>", (c, [ip]) => { c.cfg.span[c.target].erspan.ip = ip; });
def("R", "erspandst", "origin ip address <ip|IP address>", (c, [ip]) => {
  if (!c.net.l3Ifs(c.d.name).some((n) => c.net.ifAddr(c.d.name, n).ip === ip)) c.print("% Origin IP address is not configured on any interface of this router");
  c.cfg.span[c.target].erspan.origin = ip;
});

// -- VRRP ---------------------------------------------------------------------------------------------------------
const VG = "<num:1-255|group number>";
const newVrrp = (v3) => ({ ip: null, sec: [], prio: 100, preempt: true, delay: 0, tracks: [], adv: 1, desc: "", auth: null, v3, shut: false });
const vrrpLegacy = (c, g, fn) => {
  if (c.cfg.fhrpV3) { c.print("% VRRP legacy configuration is disabled while 'fhrp version vrrp v3' is configured"); return; }
  eachIf(c, (n, i) => {
    i.vrrp = i.vrrp || {};
    if (i.vrrp[g] && i.vrrp[g].v3) { c.print(`% Group ${g} is a VRRPv3 group`); return false; }
    fn(i.vrrp[g] = i.vrrp[g] || newVrrp(false), n, i);
    return true;
  });
};
const vrrpDrop = (i, g) => { if (i.vrrp) { delete i.vrrp[g]; if (!Object.keys(i.vrrp).length) delete i.vrrp; } };
def("R", IF_MODES, `vrrp ${VG} ip <ip|IP address>`, (c, [g, ip]) => vrrpLegacy(c, g, (v) => { v.ip = ip; }));
def("R", IF_MODES, `vrrp ${VG} ip <ip|IP address> secondary`, (c, [g, ip]) => vrrpLegacy(c, g, (v) => { if (!v.sec.includes(ip)) v.sec.push(ip); }));
def("R", IF_MODES, `vrrp ${VG} priority <num:1-254|Priority level>`, (c, [g, p]) => vrrpLegacy(c, g, (v) => { v.prio = p; }));
def("R", IF_MODES, `vrrp ${VG} preempt`, (c, [g]) => vrrpLegacy(c, g, (v) => { v.preempt = true; v.delay = 0; }));
def("R", IF_MODES, `vrrp ${VG} preempt delay minimum <num:0-3600|Delay in seconds>`, (c, [g, s]) => vrrpLegacy(c, g, (v) => { v.preempt = true; v.delay = s; }));
def("R", IF_MODES, `vrrp ${VG} track <num:1-1000|Tracked object> decrement <num:1-254|Priority decrement>`, (c, [g, o, dec]) => vrrpLegacy(c, g, (v) => {
  v.tracks = v.tracks.filter((t) => t.obj !== o).concat([{ obj: o, dec }]);
}));
def("R", IF_MODES, `vrrp ${VG} timers advertise <num:1-255|Advertisement interval in seconds>`, (c, [g, s]) => vrrpLegacy(c, g, (v) => { v.adv = s; }));
def("R", IF_MODES, `vrrp ${VG} description <line|Text description>`, (c, [g, t]) => vrrpLegacy(c, g, (v) => { v.desc = t; }));
def("R", IF_MODES, `vrrp ${VG} authentication text <word|authentication string>`, (c, [g, a]) => vrrpLegacy(c, g, (v) => { v.auth = a; }));
def("R", IF_MODES, `no vrrp ${VG}`, (c, [g]) => eachIf(c, (n, i) => vrrpDrop(i, g)));
def("R", IF_MODES, `no vrrp ${VG} preempt`, (c, [g]) => vrrpLegacy(c, g, (v) => { v.preempt = false; v.delay = 0; }));
def("R", IF_MODES, `no vrrp ${VG} priority`, (c, [g]) => vrrpLegacy(c, g, (v) => { v.prio = 100; }));
def("R", IF_MODES, `no vrrp ${VG} track <num:1-1000|Tracked object>`, (c, [g, o]) => vrrpLegacy(c, g, (v) => { v.tracks = v.tracks.filter((t) => t.obj !== o); }));
def("R", IF_MODES, `no vrrp ${VG} ip <ip|IP address>`, (c, [g, ip]) => vrrpLegacy(c, g, (v) => { if (v.ip === ip) v.ip = null; v.sec = v.sec.filter((s) => s !== ip); }));
def("R", IF_MODES, `no vrrp ${VG} authentication`, (c, [g]) => vrrpLegacy(c, g, (v) => { v.auth = null; }));
// VRRPv3
def("R", "config", "fhrp version vrrp v3", (c) => {
  const legacy = Object.values(c.cfg.intfs).some((i) => Object.values(i.vrrp || {}).some((v) => !v.v3));
  if (legacy) { c.print("% Remove the legacy VRRP configuration before enabling 'fhrp version vrrp v3'"); return; }
  c.cfg.fhrpV3 = true;
});
def("R", "config", "no fhrp version vrrp v3", (c) => {
  if (Object.values(c.cfg.intfs).some((i) => Object.values(i.vrrp || {}).some((v) => v.v3))) { c.print("% Remove the VRRPv3 groups first"); return; }
  delete c.cfg.fhrpV3;
});
def("R", IF_MODES, `vrrp ${VG} address-family ipv4`, (c, [g]) => {
  if (!c.cfg.fhrpV3) { c.invalid(2); return; }
  if (c.target.length !== 1) { c.print("% VRRPv3 groups are configured one interface at a time"); return; }
  const n = c.target[0], i = c.cfg.intfs[n];
  i.vrrp = i.vrrp || {};
  i.vrrp[g] = i.vrrp[g] || newVrrp(true);
  c.s.enter("vrrp", { ifn: n, g });
});
def("R", IF_MODES, `no vrrp ${VG} address-family ipv4`, (c, [g]) => eachIf(c, (n, i) => vrrpDrop(i, g)));
const v3 = (c) => c.cfg.intfs[c.target.ifn].vrrp[c.target.g];
def("R", "vrrp", "address <ip|IPv4 address>", (c, [ip]) => { v3(c).ip = ip; });
def("R", "vrrp", "address <ip|IPv4 address> primary", (c, [ip]) => { v3(c).ip = ip; });
def("R", "vrrp", "address <ip|IPv4 address> secondary", (c, [ip]) => { const v = v3(c); if (!v.sec.includes(ip)) v.sec.push(ip); });
def("R", "vrrp", "no address <ip|IPv4 address>", (c, [ip]) => { const v = v3(c); if (v.ip === ip) v.ip = null; v.sec = v.sec.filter((s) => s !== ip); });
def("R", "vrrp", "priority <num:1-254|Priority value>", (c, [p]) => { v3(c).prio = p; });
def("R", "vrrp", "no priority", (c) => { v3(c).prio = 100; });
def("R", "vrrp", "preempt", (c) => { Object.assign(v3(c), { preempt: true, delay: 0 }); });
def("R", "vrrp", "preempt delay minimum <num:0-3600|Delay in seconds>", (c, [s]) => { Object.assign(v3(c), { preempt: true, delay: s }); });
def("R", "vrrp", "no preempt", (c) => { Object.assign(v3(c), { preempt: false, delay: 0 }); });
def("R", "vrrp", "track <num:1-1000|Tracked object> decrement <num:1-255|Decrement value>", (c, [o, dec]) => {
  const v = v3(c);
  v.tracks = v.tracks.filter((t) => t.obj !== o).concat([{ obj: o, dec }]);
});
def("R", "vrrp", "no track <num:1-1000|Tracked object>", (c, [o]) => { const v = v3(c); v.tracks = v.tracks.filter((t) => t.obj !== o); });
def("R", "vrrp", "timers advertise <num:100-40000|Advertisement interval (milliseconds)>", (c, [ms]) => { v3(c).adv = ms / 1000; });
def("R", "vrrp", "description <line|Text description>", (c, [t]) => { v3(c).desc = t; });
def("R", "vrrp", "shutdown", (c) => { v3(c).shut = true; });
def("R", "vrrp", "no shutdown", (c) => { v3(c).shut = false; });
def("R", both, "show vrrp", (c) => c.print(showVrrp(c.net, c.d.name, false)));
def("R", both, "show vrrp brief", (c) => c.print(showVrrp(c.net, c.d.name, true)));
def("R", both, "show vrrp all", (c) => c.print(showVrrp(c.net, c.d.name, false)));

// -- GLBP ---------------------------------------------------------------------------------------------------------
const GG = "<num:0-1023|Group number>";
const newGlbp = () => ({ ip: null, prio: 100, preempt: false, weight: { max: 100, lower: null, upper: null }, wtracks: [], lb: "round-robin", auth: null, name: null });
const glbp = (c, g, fn) => eachIf(c, (n, i) => {
  i.glbp = i.glbp || {};
  fn(i.glbp[g] = i.glbp[g] || newGlbp(), n, i);
});
def("R", IF_MODES, `glbp ${GG} ip`, (c, [g]) => glbp(c, g, () => {}));
def("R", IF_MODES, `glbp ${GG} ip <ip|Virtual IP address>`, (c, [g, ip]) => glbp(c, g, (x) => { x.ip = ip; }));
def("R", IF_MODES, `glbp ${GG} priority <num:1-255|Priority value>`, (c, [g, p]) => glbp(c, g, (x) => { x.prio = p; }));
def("R", IF_MODES, `glbp ${GG} preempt`, (c, [g]) => glbp(c, g, (x) => { x.preempt = true; }));
def("R", IF_MODES, `glbp ${GG} preempt delay minimum <num:0-3600|Seconds to delay>`, (c, [g]) => glbp(c, g, (x) => { x.preempt = true; }));
def("R", IF_MODES, `no glbp ${GG} preempt`, (c, [g]) => glbp(c, g, (x) => { x.preempt = false; }));
def("R", IF_MODES, `glbp ${GG} weighting <num:1-254|Weighting maximum value>`, (c, [g, w]) => glbp(c, g, (x) => { x.weight = { max: w, lower: null, upper: null }; }));
def("R", IF_MODES, `glbp ${GG} weighting <num:1-254|Weighting maximum value> lower <num:1-254|Weighting lower threshold> upper <num:1-254|Weighting upper threshold>`,
  (c, [g, w, lo, hi]) => {
    if (lo > hi || hi > w) { c.print("% Thresholds must satisfy lower <= upper <= maximum"); return; }
    glbp(c, g, (x) => { x.weight = { max: w, lower: lo, upper: hi }; });
  });
def("R", IF_MODES, `glbp ${GG} weighting track <num:1-1000|Tracked object number> decrement <num:1-254|Weighting decrement>`, (c, [g, o, dec]) => glbp(c, g, (x) => {
  x.wtracks = x.wtracks.filter((t) => t.obj !== o).concat([{ obj: o, dec }]);
}));
def("R", IF_MODES, `no glbp ${GG} weighting track <num:1-1000|Tracked object number>`, (c, [g, o]) => glbp(c, g, (x) => { x.wtracks = x.wtracks.filter((t) => t.obj !== o); }));
def("R", IF_MODES, `glbp ${GG} load-balancing {round-robin|weighted|host-dependent}`, (c, [g, lb]) => glbp(c, g, (x) => { x.lb = lb; }));
def("R", IF_MODES, `no glbp ${GG} load-balancing`, (c, [g]) => glbp(c, g, (x) => { x.lb = "round-robin"; }));
def("R", IF_MODES, `glbp ${GG} authentication text <word|Authentication string>`, (c, [g, a]) => glbp(c, g, (x) => { x.auth = a; }));
def("R", IF_MODES, `glbp ${GG} name <word|Redundancy name string>`, (c, [g, nm]) => glbp(c, g, (x) => { x.name = nm; }));
def("R", IF_MODES, `no glbp ${GG}`, (c, [g]) => eachIf(c, (n, i) => { if (i.glbp) { delete i.glbp[g]; if (!Object.keys(i.glbp).length) delete i.glbp; } }));
def("R", both, "show glbp", (c) => c.print(showGlbp(c.net, c.d.name, false)));
def("R", both, "show glbp brief", (c) => c.print(showGlbp(c.net, c.d.name, true)));

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
    this._events = {};
    this.queued = [];
    this.anim = null;
    this.cx = null;
  }

  // Console messages the last command raised, per device. Messages for other devices also wait in the
  // network's console queue so their own console shows them on its next input; whoever reads them here
  // (the lab page writes them straight into those consoles) takes them off that queue.
  get events() {
    for (const [dn, items] of this.queued) this.net.unqueueConsole(dn, items);
    this.queued = [];
    return this._events;
  }

  set events(v) { this._events = v; }

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
    const waiting = this.net.takeConsole(this.home);
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
    const ev = this._events = this.net.events(before, this.net.snapshot());
    // Err-disable and violation messages come before the link going down; protocol changes after it.
    for (const [dn, msgs] of Object.entries(logs)) {
      const early = msgs.filter((m) => /^%(PM|SPANTREE|PORT_SECURITY)-/.test(m));
      ev[dn] = [...early, ...(ev[dn] || []), ...msgs.filter((m) => !early.includes(m))];
    }
    this.queued = this.net.queueConsole(this.home, ev);
    const mine = ev[this.home];
    if (mine) for (const m of mine) this.out.push("*" + clock() + ": " + m);
    return [...waiting, ...this.out].join("\n");
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
      if (d.type === "switch" && !n.startsWith("Vlan") && !c.intfs[n].routed) { this.cx.invalid(1); return; }
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
  ping(dst, source, count, size = 100) {
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
              const go = (src) => this.ask("Sweep range of sizes [n]: ", {}, () => {
                if (p === "ipv6") this.ping6(fmt6(parse6(target)), count);
                else this.ping(ip2n(target), src, count, size);
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
                const next = (k) => (k === rest.length ? go(src) : this.ask(rest[k], {}, () => next(k + 1)));
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
    const notes = /^%\s?(Access VLAN does not exist|Login disabled|OSPF: Reference|OSPFv3: Reference|The key modulus|Generating|Warning: portfast|Warning: this command enables portfast|Portfast has been configured|Only classful|OSPFv3-4-NORTRID|This simulator doesn't summarise|Voice VLAN does not exist|Warning: VLAN \d+ is not configured as a remote-span|Warning: UplinkFast)/;
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
