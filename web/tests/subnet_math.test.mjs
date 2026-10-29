// node web/tests/subnet_math.test.mjs — checks the trainer's IPv4/IPv6 arithmetic.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The module is served to browsers as-is, so load its source directly as an ES module.
const src = readFileSync(new URL("../app/static/js/subnet-math.js", import.meta.url), "utf8");
const { compress6, expand6, facts, interesting, intToIp, ipToInt, maskOf, parsePrefix, prefixOfMask } =
  await import("data:text/javascript," + encodeURIComponent(src));

const f = facts(ipToInt("192.168.1.70"), 26);
assert.equal(intToIp(f.network), "192.168.1.64");
assert.equal(intToIp(f.broadcast), "192.168.1.127");
assert.equal(intToIp(f.first), "192.168.1.65");
assert.equal(intToIp(f.last), "192.168.1.126");
assert.equal(f.usable, 62);
assert.equal(intToIp(f.wildcard), "0.0.0.63");

const g = facts(ipToInt("172.16.45.200"), 20);
assert.equal(intToIp(g.network), "172.16.32.0");
assert.equal(intToIp(g.broadcast), "172.16.47.255");
assert.equal(interesting(20).block, 16);
assert.equal(interesting(20).ordinal, "3rd");

const h = facts(ipToInt("10.200.3.4"), 8);
assert.equal(intToIp(h.network), "10.0.0.0");
assert.equal(intToIp(h.broadcast), "10.255.255.255");
assert.equal(h.usable, 16777214);

assert.equal(intToIp(maskOf(0)), "0.0.0.0");
assert.equal(intToIp(maskOf(32)), "255.255.255.255");
assert.equal(intToIp(maskOf(27)), "255.255.255.224");
assert.equal(prefixOfMask(ipToInt("255.255.240.0")), 20);
assert.equal(prefixOfMask(ipToInt("255.0.255.0")), null);
assert.equal(parsePrefix("/26"), 26);
assert.equal(parsePrefix("26"), 26);
assert.equal(parsePrefix("255.255.255.192"), 26);
assert.equal(parsePrefix("255.255.255.193"), null);
assert.equal(ipToInt("256.1.1.1"), null);
assert.equal(ipToInt(" 10.0.0.1 "), ipToInt("10.0.0.1"));

const g6 = expand6("2001:db8::1");
assert.deepEqual(g6, ["2001", "0db8", "0000", "0000", "0000", "0000", "0000", "0001"]);
assert.equal(compress6(g6), "2001:db8::1");
assert.equal(compress6(expand6("2001:0db8:0000:0001:0000:0000:0000:0001")), "2001:db8:0:1::1");
assert.equal(compress6(expand6("2001:db8:0:0:1:0:0:1")), "2001:db8::1:0:0:1"); // first run wins a tie
assert.equal(compress6(expand6("2001:db8:0:1:1:1:1:1")), "2001:db8:0:1:1:1:1:1"); // a lone zero stays
assert.equal(compress6(expand6("fe80::")), "fe80::");
assert.equal(expand6("1::2::3"), null);
assert.equal(expand6("1:2:3:4:5:6:7:8:9"), null);
console.log("subnet-math: all assertions passed");
