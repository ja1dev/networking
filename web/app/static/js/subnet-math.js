// IPv4/IPv6 arithmetic for the subnetting trainer. Pure functions, no DOM.

export function ipToInt(s) {
  const m = String(s).trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const o = m.slice(1).map(Number);
  if (o.some((x) => x > 255)) return null;
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
}

export function intToIp(n) {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export function maskOf(prefix) {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

export function prefixOfMask(mask) {
  // Valid masks are a run of ones then zeros; anything else returns null.
  let p = 0;
  while (p < 32 && (mask >>> (31 - p)) & 1) p++;
  return maskOf(p) === mask ? p : null;
}

export function parsePrefix(s) {
  const t = String(s).trim();
  const m = t.match(/^\/?\s*(\d{1,2})$/);
  if (m && Number(m[1]) <= 32) return Number(m[1]);
  const mask = ipToInt(t);
  return mask === null ? null : prefixOfMask(mask);
}

export function parseNumber(s) {
  const t = String(s).trim().replace(/[,\s_]/g, "");
  return /^\d+$/.test(t) ? Number(t) : null;
}

export function facts(ip, prefix) {
  const mask = maskOf(prefix);
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const hostBits = 32 - prefix;
  const usable = prefix >= 31 ? (prefix === 31 ? 2 : 1) : 2 ** hostBits - 2;
  return {
    ip, prefix, mask, network, broadcast, hostBits, usable,
    wildcard: (~mask) >>> 0,
    first: prefix >= 31 ? network : network + 1,
    last: prefix >= 31 ? broadcast : broadcast - 1,
  };
}

// Which octet the prefix boundary falls in (0-based), and its mask value/block size.
export function interesting(prefix) {
  const idx = Math.min(3, Math.floor(prefix / 8));
  const maskOctet = (maskOf(prefix) >>> (24 - idx * 8)) & 255;
  return { idx, maskOctet, block: 256 - maskOctet, ordinal: ["1st", "2nd", "3rd", "4th"][idx] };
}

export function bits(n) {
  return [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, "0")).join(".");
}

// Binary with the network part and host part marked, for the worked answers.
export function bitsMarked(n, prefix) {
  const raw = bits(n);
  let seen = 0;
  let out = "";
  for (const ch of raw) {
    if (ch === ".") { out += "."; continue; }
    out += seen < prefix ? `<span class="n">${ch}</span>` : `<span class="h">${ch}</span>`;
    seen++;
  }
  return out;
}

// ---- IPv6 ----

export function expand6(s) {
  const t = String(s).trim().toLowerCase();
  if (!/^[0-9a-f:]+$/.test(t) || (t.match(/::/g) || []).length > 1) return null;
  let groups;
  if (t.includes("::")) {
    const [a, b] = t.split("::");
    const left = a ? a.split(":") : [];
    const right = b ? b.split(":") : [];
    const fill = 8 - left.length - right.length;
    if (fill < 1) return null;
    groups = [...left, ...Array(fill).fill("0"), ...right];
  } else {
    groups = t.split(":");
  }
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.map((g) => g.padStart(4, "0"));
}

// RFC 5952 canonical form: drop leading zeros, "::" for the longest run of 2+ zero groups (first on a tie).
export function compress6(groups) {
  const g = groups.map((x) => x.replace(/^0+(?=.)/, ""));
  let bestStart = -1, bestLen = 0;
  for (let i = 0; i < 8;) {
    if (g[i] === "0") {
      let j = i;
      while (j < 8 && g[j] === "0") j++;
      if (j - i > bestLen && j - i >= 2) { bestStart = i; bestLen = j - i; }
      i = j;
    } else i++;
  }
  if (bestStart === -1) return g.join(":");
  const left = g.slice(0, bestStart).join(":");
  const right = g.slice(bestStart + bestLen).join(":");
  return `${left}::${right}`;
}
