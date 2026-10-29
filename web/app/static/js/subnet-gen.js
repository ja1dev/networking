// Problem generators for the subnetting trainer. Pure functions: no DOM, so they can be tested in Node.
import {
  bitsMarked, compress6, facts, interesting, intToIp, ipToInt, maskOf, parseNumber, parsePrefix,
} from "netlab/subnet-math";

export const KINDS = {
  "mask": "Mask ↔ CIDR",
  "network": "Network & broadcast",
  "hosts-range": "First & last host",
  "host-count": "Hosts & subnets",
  "prefix-for-hosts": "Right-size a subnet",
  "same-subnet": "Same subnet?",
  "wildcard": "Wildcard masks",
  "full": "Everything at once",
  "ipv6-compress": "IPv6 shorten",
  "ipv6-expand": "IPv6 expand",
};
// "last" keeps prefixes in /24-/30; "any" uses /8-/30.
let range = "last";

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[rnd(0, arr.length - 1)];
const ip = (n) => intToIp(n);

function randomIp() {
  const kind = rnd(1, 4);
  if (kind === 1) return ipToInt(`10.${rnd(0, 255)}.${rnd(0, 255)}.${rnd(1, 254)}`);
  if (kind === 2) return ipToInt(`172.${rnd(16, 31)}.${rnd(0, 255)}.${rnd(1, 254)}`);
  if (kind === 3) return ipToInt(`192.168.${rnd(0, 255)}.${rnd(1, 254)}`);
  return ipToInt(`${pick([rnd(1, 126), rnd(128, 223)])}.${rnd(0, 255)}.${rnd(0, 255)}.${rnd(1, 254)}`);
}

function randomPrefix() {
  return range === "last" ? rnd(24, 30) : pick([rnd(8, 30), rnd(16, 30), rnd(20, 30), rnd(24, 30)]);
}

// ---- worked explanations, following the drill sheet's 3-step method ----

export function method(f) {
  const it = interesting(f.prefix);
  const octet = (f.ip >>> (24 - it.idx * 8)) & 255;
  const netOctet = (f.network >>> (24 - it.idx * 8)) & 255;
  const steps = [];
  steps.push(`/${f.prefix} = mask <code>${ip(f.mask)}</code>. The boundary sits in the <strong>${it.ordinal} octet</strong> (mask value ${it.maskOctet}).`);
  if (f.prefix % 8 === 0) {
    steps.push(`The prefix falls exactly on an octet boundary, so the network keeps the first ${f.prefix / 8} octet(s) and zeroes the rest.`);
  } else {
    const starts = [];
    for (let v = Math.max(0, netOctet - 2 * it.block); v <= Math.min(255, netOctet + 2 * it.block); v += it.block) starts.push(v);
    steps.push(`Block size = 256 − ${it.maskOctet} = <strong>${it.block}</strong>.`);
    steps.push(`Count by ${it.block} in the ${it.ordinal} octet: ${starts.map((v) => v === netOctet ? `<strong>${v}</strong>` : v).join(", ")}… The IP's ${octet} falls in the block starting at <strong>${netOctet}</strong>.`);
  }
  steps.push(`Network <code>${ip(f.network)}</code>, broadcast <code>${ip(f.broadcast)}</code> (next network − 1).`);
  if (f.prefix <= 30) steps.push(`Usable hosts <code>${ip(f.first)}</code> – <code>${ip(f.last)}</code>: 2<sup>${f.hostBits}</sup> − 2 = <strong>${f.usable.toLocaleString()}</strong>.`);
  return `<ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
    <div class="bits"><span class="muted small">IP&nbsp;&nbsp;&nbsp;</span>${bitsMarked(f.ip, f.prefix)}<br><span class="muted small">Mask </span>${bitsMarked(f.mask, f.prefix)}</div>
    <div class="muted tiny" style="margin-top:4px"><span style="color:var(--accent)">■</span> network bits &nbsp; <span style="color:var(--warn)">■</span> host bits</div>`;
}

// ---- problem generators. Each returns { kind, prompt, fields[], check(values) -> per-field ok, work } ----

const ipField = (id, label, want) => ({ id, label, want: ip(want), ok: (v) => ipToInt(v) === want, placeholder: "a.b.c.d" });
const numField = (id, label, want) => ({ id, label, want: want.toLocaleString(), ok: (v) => parseNumber(v) === want, placeholder: "number" });

const GEN = {
  "mask"() {
    const p = rnd(8, 30);
    if (Math.random() < 0.5) {
      return { prompt: `Convert <code>/${p}</code> to a dotted-decimal mask.`,
        fields: [ipField("mask", "Subnet mask", maskOf(p))],
        work: `<p>/${p} = ${p} one-bits: <span class="bits">${bitsMarked(maskOf(p), p)}</span>. Each full octet of ones is 255; the partial octet is the sum of its bit values.</p>` };
    }
    return { prompt: `Convert <code>${ip(maskOf(p))}</code> to CIDR notation.`,
      fields: [{ id: "cidr", label: "Prefix length", want: "/" + p, ok: (v) => parsePrefix(v) === p && !String(v).includes("."), placeholder: "/nn" }],
      work: `<p>Count the one-bits: <span class="bits">${bitsMarked(maskOf(p), p)}</span> = <strong>/${p}</strong>. Shortcut: 8 per 255, plus the partial octet's bits (128=1, 192=2, 224=3, 240=4, 248=5, 252=6, 254=7).</p>` };
  },
  "network"() {
    const f = facts(randomIp(), randomPrefix());
    return { prompt: `What are the network and broadcast addresses for <code>${ip(f.ip)}/${f.prefix}</code>?`,
      fields: [ipField("net", "Network address", f.network), ipField("bc", "Broadcast address", f.broadcast)], work: method(f) };
  },
  "hosts-range"() {
    const f = facts(randomIp(), Math.min(30, randomPrefix()));
    return { prompt: `What are the first and last usable host addresses in the subnet of <code>${ip(f.ip)} ${ip(f.mask)}</code>?`,
      fields: [ipField("first", "First usable", f.first), ipField("last", "Last usable", f.last)], work: method(f) };
  },
  "host-count"() {
    if (Math.random() < 0.5) {
      const p = rnd(range === "last" ? 24 : 16, 30);
      return { prompt: `How many usable host addresses does a <code>/${p}</code> subnet provide?`,
        fields: [numField("hosts", "Usable hosts", 2 ** (32 - p) - 2)],
        work: `<p>Host bits = 32 − ${p} = ${32 - p}. Usable = 2<sup>${32 - p}</sup> − 2 = <strong>${(2 ** (32 - p) - 2).toLocaleString()}</strong> (minus the network and broadcast addresses).</p>` };
    }
    const base = pick(range === "last" ? [24] : [8, 16, 20, 22, 24]);
    const p = rnd(base + 1, Math.min(30, base + 8));
    return { prompt: `You subnet <code>${ip(maskOf(base) & randomIp())}/${base}</code> into <code>/${p}</code> subnets. How many subnets do you get?`,
      fields: [numField("subnets", "Number of subnets", 2 ** (p - base))],
      work: `<p>Borrowed bits = ${p} − ${base} = ${p - base}. Subnets = 2<sup>${p - base}</sup> = <strong>${(2 ** (p - base)).toLocaleString()}</strong>.</p>` };
  },
  "prefix-for-hosts"() {
    const maxBits = range === "last" ? 8 : 14;
    const hb = rnd(2, maxBits);
    const need = rnd(2 ** (hb - 1) - 1, 2 ** hb - 2);
    const p = 32 - hb;
    return { prompt: `A VLAN needs <strong>${need.toLocaleString()}</strong> hosts. What is the longest prefix (smallest subnet) that fits?`,
      fields: [{ id: "prefix", label: "Prefix (or mask)", want: `/${p} (${ip(maskOf(p))})`, sample: "/" + p, ok: (v) => parsePrefix(v) === p, placeholder: "/nn" }],
      work: `<p>Find the smallest power of two that's at least ${need} + 2: 2<sup>${hb - 1}</sup> − 2 = ${(2 ** (hb - 1) - 2).toLocaleString()} is too small, 2<sup>${hb}</sup> − 2 = <strong>${(2 ** hb - 2).toLocaleString()}</strong> fits. ${hb} host bits → /${32 - hb} = <code>${ip(maskOf(p))}</code>.</p>` };
  },
  "same-subnet"() {
    const p = randomPrefix();
    const a = randomIp();
    const fa = facts(a, p);
    const it = interesting(p);
    let b;
    if (Math.random() < 0.5) b = fa.network + rnd(1, Math.max(1, fa.usable));
    else {
      // A neighbouring block: close enough to look plausible, never wrapping past 0 or 255.255.255.255.
      const shift = it.block * rnd(1, 2) * 2 ** (24 - it.idx * 8);
      const down = fa.network - shift >= 0 && (Math.random() < 0.5 || fa.network + shift > 0xffffffff);
      b = (down ? fa.network - shift : fa.network + shift) + rnd(1, Math.max(1, fa.usable));
    }
    const same = facts(b, p).network === fa.network;
    const fb = facts(b, p);
    return { prompt: `With mask <code>/${p}</code>, are <code>${ip(a)}</code> and <code>${ip(b)}</code> in the same subnet?`,
      fields: [{ id: "same", label: "Same subnet?", type: "yesno", want: same ? "Yes" : "No", sample: same ? "yes" : "no", ok: (v) => v === (same ? "yes" : "no") }],
      work: `<p>${ip(a)} is in <code>${ip(fa.network)}/${p}</code>; ${ip(b)} is in <code>${ip(fb.network)}/${p}</code>. ${same ? "Same network: they talk directly." : "Different networks: traffic between them needs a router."}</p>${method(fa)}` };
  },
  "wildcard"() {
    const p = rnd(range === "last" ? 24 : 8, 30);
    const f = facts(randomIp(), p);
    if (Math.random() < 0.5) {
      return { prompt: `What wildcard mask matches the subnet <code>${ip(f.network)}/${p}</code> in an ACL or OSPF <code>network</code> statement?`,
        fields: [ipField("wc", "Wildcard mask", f.wildcard)],
        work: `<p>Wildcard = 255.255.255.255 − mask: 255.255.255.255 − ${ip(f.mask)} = <code>${ip(f.wildcard)}</code>. Zero bits must match; one bits are "don't care".</p>` };
    }
    return { prompt: `An ACL entry reads <code>permit ${ip(f.network)} ${ip(f.wildcard)}</code>. What's the matching prefix length?`,
      fields: [{ id: "pl", label: "Prefix length", want: "/" + p, ok: (v) => parsePrefix(v) === p, placeholder: "/nn" }],
      work: `<p>Invert the wildcard: 255.255.255.255 − ${ip(f.wildcard)} = ${ip(f.mask)} = <strong>/${p}</strong>.</p>` };
  },
  "full"() {
    const f = facts(randomIp(), Math.min(30, randomPrefix()));
    return { prompt: `Work out everything for <code>${ip(f.ip)}/${f.prefix}</code>.`,
      fields: [ipField("mask", "Subnet mask", f.mask), ipField("net", "Network", f.network), ipField("first", "First usable", f.first),
        ipField("last", "Last usable", f.last), ipField("bc", "Broadcast", f.broadcast), numField("hosts", "Usable hosts", f.usable)],
      work: method(f) };
  },
  "ipv6-compress"() {
    const groups = Array.from({ length: 8 }, () => {
      const r = Math.random();
      if (r < 0.4) return "0000";
      if (r < 0.7) return rnd(0, 0xff).toString(16).padStart(4, "0");
      return rnd(0, 0xffff).toString(16).padStart(4, "0");
    });
    groups[0] = pick(["2001", "2001", "fe80", "2600", "fd00", "2a00"]);
    const want = compress6(groups);
    return { prompt: `Write <code>${groups.join(":")}</code> in its shortest valid form.`,
      fields: [{ id: "short", label: "Compressed address", want, ok: (v) => String(v).trim().toLowerCase() === want, placeholder: "2001:db8::1", wide: true }],
      work: `<ol><li>Drop leading zeros in every group: <code>${groups.map((g) => g.replace(/^0+(?=.)/, "")).join(":")}</code></li>
        <li>Replace the <strong>longest</strong> run of all-zero groups (two or more) with <code>::</code>, the first one on a tie, and only once: <code>${want}</code></li></ol>` };
  },
  "ipv6-expand"() {
    const groups = Array.from({ length: 8 }, () => (Math.random() < 0.45 ? "0000" : rnd(0, 0xffff).toString(16).padStart(4, "0")));
    groups[0] = pick(["2001", "fe80", "2600", "fd00"]);
    const short = compress6(groups);
    const want = groups.join(":");
    return { prompt: `Expand <code>${short}</code> to all 32 hex digits.`,
      fields: [{ id: "full", label: "Full address", want, ok: (v) => String(v).trim().toLowerCase() === want, placeholder: "xxxx:xxxx:…", wide: true }],
      work: `<p>Pad each group to four digits, then fill <code>::</code> with as many <code>0000</code> groups as it takes to reach eight: <code>${want}</code>.</p>` };
  },
};

export function generate(kind, prefixRange = "last") {
  range = prefixRange;
  return { kind, ...GEN[kind]() };
}
