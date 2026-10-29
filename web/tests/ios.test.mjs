// node web/tests/ios.test.mjs: checks the IOS simulator and every terminal lab.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The module is served to browsers as-is, so load its source directly as an ES module.
const src = readFileSync(new URL("../app/static/js/ios.js", import.meta.url), "utf8");
const ios = await import("data:text/javascript," + encodeURIComponent(src));
const { Network, Session, applyConfig, buildLab, runningConfig, parseVlans, vlanStr, type7, type7decode, parseAce, ip2n, sameData } = ios;
const labs = JSON.parse(readFileSync(new URL("../app/terminal_labs.json", import.meta.url), "utf8"));

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    // The module is loaded from a data: URL, so keep the report to the message and our own frames.
    console.error("FAIL:", name, "\n" + e.message.slice(0, 3000));
    console.error((e.stack || "").split("\n").filter((l) => l.includes("ios.test.mjs")).join("\n"));
    process.exit(1);
  }
}

const R = (name) => ({ name, type: "router" });
const S = (name) => ({ name, type: "switch" });
const P = (name) => ({ name, type: "pc" });
const G = (n) => "GigabitEthernet0/" + n;
const F = (n) => "FastEthernet0/" + n;
const console_ = (net, dev, ...lines) => {
  const s = new Session(net, dev);
  s.greeting();
  return lines.map((l) => s.input(l)).join("\n");
};

// ---------------------------------------------------------------- helpers
test("vlan lists", () => {
  assert.deepEqual(parseVlans("10,20,30-33"), [10, 20, 30, 31, 32, 33]);
  assert.equal(parseVlans("0"), null);
  assert.equal(parseVlans("5-2"), null);
  assert.equal(vlanStr([1, 2, 3, 5, 7, 8]), "1-3,5,7,8");
});

test("type 7 round trip", () => {
  for (const pw of ["cisco", "C0nsole", "a much longer password 123!"]) assert.equal(type7decode(type7(pw)), pw);
});

test("ACL entry parsing", () => {
  assert.deepEqual(parseAce("standard", ["host", "10.1.1.1"]).entry.src, { addr: ip2n("10.1.1.1"), wild: 0 });
  assert.equal(parseAce("standard", ["any"]).entry.src.wild, 0xffffffff);
  const e = parseAce("extended", ["tcp", "10.0.0.0", "0.0.0.255", "host", "1.1.1.1", "eq", "www"]).entry;
  assert.deepEqual(e.dstPort, { op: "eq", a: 80 });
  assert.equal(parseAce("extended", ["icmp", "any", "any", "echo"]).entry.icmp, "echo");
  assert.equal(parseAce("extended", ["icmp", "10.0.0.0", "any"]).at, 1, "an extended source needs a wildcard or host");
  assert.equal(parseAce("extended", ["bogus", "any", "any"]).at, 0);
});

// ---------------------------------------------------------------- CLI behaviour
test("modes, prompts, abbreviations and errors", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const s = new Session(net, "R1");
  assert.equal(s.prompt(), "Router>");
  s.input("en");
  assert.equal(s.prompt(), "Router#");
  assert.match(s.input("s"), /% Ambiguous command:  "s"/);
  s.input("conf t");
  assert.equal(s.prompt(), "Router(config)#");
  const out = s.input("hostnme R1");
  assert.match(out, /% Invalid input detected at '\^' marker\./);
  assert.equal(out.split("\n")[0], " ".repeat("Router(config)#".length) + "^");
  assert.match(s.input("router"), /% Incomplete command\./);
  s.input("int g0/0");
  assert.equal(s.prompt(), "Router(config-if)#");
  s.input("hostname R1"); // a global command from a submode drops back to (config)
  assert.equal(s.prompt(), "R1(config)#");
  assert.match(s.input("do show ip int brief"), /GigabitEthernet0\/0 +unassigned +YES unset +administratively down down/);
  s.input("end");
  assert.equal(s.prompt(), "R1#");
  assert.match(s.input("foo"), /Translating "foo"\.\.\.domain server/);
});

test("? help and Tab completion", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const s = new Session(net, "R1");
  s.input("enable");
  assert.equal(s.help("sh"), "show");
  assert.match(s.help("show ip "), /route +IP routing table/);
  assert.match(s.help("ping "), /A\.B\.C\.D/);
  assert.equal(s.complete("sh"), "show ");
  assert.equal(s.complete("show ip ro"), "show ip route ");
  s.input("conf t");
  assert.match(s.help("interface "), /GigabitEthernet +GigabitEthernet IEEE 802\.3z/);
  assert.equal(s.complete("interface gi"), "interface GigabitEthernet");
  assert.match(s.help(""), /^ +do +To run exec commands in config mode$/m);
  assert.match(s.help("ip route 10.0.0.0 255.0.0.0 "), /GigabitEthernet/);
});

test("output filters", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const out = console_(net, "R1", "en", "conf t", "int g0/1", "ip address 10.0.0.1 255.255.255.0", "end", "show run | section GigabitEthernet0/1");
  assert.match(out, /interface GigabitEthernet0\/1\n ip address 10\.0\.0\.1 255\.255\.255\.0\n shutdown/);
  assert.doesNotMatch(out, /GigabitEthernet0\/2/);
  assert.match(console_(net, "R1", "en", "show ip int br | include 10.0"), /^GigabitEthernet0\/1 +10\.0\.0\.1/m);
});

test("interface address validation", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const out = console_(net, "R1", "en", "conf t", "int g0/0", "ip address 10.0.0.0 255.255.255.0", "ip address 10.0.0.1 255.0.255.0",
    "ip address 10.0.0.1 255.255.255.0", "int g0/1", "ip address 10.0.0.9 255.255.255.252", "int g0/0.10", "ip address 10.9.9.1 255.255.255.0");
  assert.match(out, /Bad mask \/24 for address 10\.0\.0\.0/);
  assert.match(out, /Bad mask 0xFF00FF00 for address 10\.0\.0\.1/);
  assert.match(out, /% 10\.0\.0\.8 overlaps with GigabitEthernet0\/0/);
  assert.match(out, /only allowed if that\nsubinterface is already configured as part of an IEEE 802\.10, IEEE 802\.1Q,/);
});

test("interface range and VLAN auto-create", () => {
  const net = new Network({ devices: [S("SW1")], links: [] });
  const out = console_(net, "SW1", "en", "conf t", "interface range f0/1 - 3, f0/10", "switchport access vlan 30");
  assert.match(out, /% Access VLAN does not exist\. Creating vlan 30/);
  const c = net.devs.SW1.cfg;
  for (const n of [1, 2, 3, 10]) assert.equal(c.intfs[F(n)].accessVlan, 30);
  assert.equal(c.intfs[F(4)].accessVlan, 1);
  assert.equal(c.vlans[30], "VLAN0030");
});

test("multi-line banner", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  console_(net, "R1", "en", "conf t", "banner motd #", "Line one", "Line two#");
  assert.equal(net.devs.R1.cfg.banner, "Line one\nLine two");
});

test("console login, enable secret and reload lose unsaved changes", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const s = new Session(net, "R1");
  for (const l of ["en", "conf t", "enable secret s3cret", "line con 0", "password c0n", "login", "end", "write memory",
    "conf t", "hostname Unsaved", "end"]) s.input(l);
  s.input("disable");
  s.input("enable");
  assert.equal(s.prompt(), "Password: ");
  assert.ok(s.masked());
  s.input("wrong");
  s.input("s3cret");
  assert.equal(s.prompt(), "Unsaved#");
  s.input("reload");
  assert.match(s.prompt(), /Save\? \[yes\/no\]/);
  s.input("no");
  s.input("");
  assert.equal(net.devs.R1.cfg.hostname, "Router", "reload restores startup-config");
  assert.ok(s.loggedOut);
  s.input("");
  assert.equal(s.prompt(), "Password: ");
  s.input("c0n");
  assert.equal(s.prompt(), "Router>");
});

test("show running-config hides secrets and encrypts with service password-encryption", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  console_(net, "R1", "en", "conf t", "enable secret topsecret", "line vty 0 4", "password plain", "exit");
  let run = runningConfig(net, "R1");
  assert.match(run, /^enable secret 5 \$1\$/m);
  assert.doesNotMatch(run, /topsecret/);
  assert.match(run, /^ password plain$/m);
  console_(net, "R1", "en", "topsecret", "conf t", "service password-encryption");
  run = runningConfig(net, "R1");
  assert.match(run, new RegExp("^ password 7 " + type7("plain") + "$", "m"));
});

// ---------------------------------------------------------------- switching
function twoSwitches() {
  return new Network({
    devices: [S("SW1"), S("SW2"), P("A"), P("B")],
    links: [["SW1", G(1), "SW2", G(1)], ["SW1", F(1), "A", "eth0"], ["SW2", F(1), "B", "eth0"]],
  });
}

test("DTP: which combinations form a trunk", () => {
  const cases = [
    ["dynamic auto", "dynamic auto", "access"], ["dynamic auto", "dynamic desirable", "trunk"],
    ["dynamic desirable", "dynamic desirable", "trunk"], ["trunk", "dynamic auto", "trunk"],
    ["access", "dynamic desirable", "access"], ["trunk", "trunk", "trunk"],
  ];
  for (const [a, b, want] of cases) {
    const net = twoSwitches();
    net.devs.SW1.cfg.intfs[G(1)].mode = a;
    net.devs.SW2.cfg.intfs[G(1)].mode = b;
    net.touch();
    assert.equal(net.swMode(net.devs.SW2, G(1)), want, `${a} + ${b}`);
  }
  const net = twoSwitches();
  applyConfig(net, "SW1", ["interface g0/1", "switchport mode trunk", "switchport nonegotiate"]);
  assert.equal(net.swMode(net.devs.SW2, G(1)), "access", "nonegotiate stops DTP, so dynamic auto stays access");
});

test("VLANs isolate, trunks carry them, a native mismatch leaks between VLANs", () => {
  const net = twoSwitches();
  applyConfig(net, "A", ["ip 10.0.0.1/24"]);
  applyConfig(net, "B", ["ip 10.0.0.2/24"]);
  assert.ok(net.ping("A", "10.0.0.2").ok, "everything starts in VLAN 1");
  applyConfig(net, "SW1", ["vlan 10", "vlan 20", "interface f0/1", "switchport mode access", "switchport access vlan 10"]);
  applyConfig(net, "SW2", ["vlan 10", "vlan 20", "interface f0/1", "switchport mode access", "switchport access vlan 10"]);
  assert.ok(!net.ping("A", "10.0.0.2").ok, "VLAN 10 doesn't cross an access link in VLAN 1");
  applyConfig(net, "SW1", ["interface g0/1", "switchport mode trunk"]);
  applyConfig(net, "SW2", ["interface g0/1", "switchport mode trunk"]);
  assert.ok(net.ping("A", "10.0.0.2").ok, "the trunk carries VLAN 10 tagged");
  applyConfig(net, "SW1", ["interface g0/1", "switchport trunk allowed vlan 20"]);
  assert.ok(!net.ping("A", "10.0.0.2").ok, "pruned off the trunk");
  applyConfig(net, "SW1", ["interface g0/1", "switchport trunk allowed vlan all"]);
  applyConfig(net, "SW2", ["interface f0/1", "switchport access vlan 20"]);
  assert.ok(!net.ping("A", "10.0.0.2").ok);
  // Native VLAN 10 on SW1 and 20 on SW2. Without STP, SW1's untagged VLAN 10 frames would land in
  // VLAN 20 on SW2; PVST+ notices the mismatch and blocks both native VLANs on the trunk instead.
  applyConfig(net, "SW1", ["interface g0/1", "switchport trunk native vlan 10"]);
  applyConfig(net, "SW2", ["interface g0/1", "switchport trunk native vlan 20"]);
  assert.ok(!net.ping("A", "10.0.0.2").ok, "PVST+ blocks a native VLAN mismatch rather than leaking frames");
  assert.equal(net.stp(10).SW1.ports[G(1)].inc, "PVID_Inc");
  assert.equal(net.stp(20).SW2.ports[G(1)].inc, "PVID_Inc");
  assert.match(console_(net, "SW1", "en", "show spanning-tree vlan 10"), /Gi0\/1 +Desg BKN\*4 +128\.25 +P2p \*PVID_Inc/);
  assert.match(console_(net, "SW1", "en", "show spanning-tree inconsistentports"), /VLAN0010 +GigabitEthernet0\/1 +Port VLAN ID Mismatch/);
  applyConfig(net, "SW2", ["interface g0/1", "switchport trunk native vlan 10", "interface f0/1", "switchport access vlan 10"]);
  assert.ok(net.ping("A", "10.0.0.2").ok, "matching natives clear the inconsistency");
});

test("MAC addresses are learned along the path", () => {
  const net = twoSwitches();
  applyConfig(net, "A", ["ip 10.0.0.1/24"]);
  applyConfig(net, "B", ["ip 10.0.0.2/24"]);
  console_(net, "A", "ping 10.0.0.2");
  const table = console_(net, "SW1", "en", "show mac address-table");
  assert.match(table, new RegExp(`1 +${net.mac("A", "eth0")} +DYNAMIC +Fa0/1`));
  assert.match(table, new RegExp(`1 +${net.mac("B", "eth0")} +DYNAMIC +Gi0/1`));
});

// ---------------------------------------------------------------- routing
function triangle() {
  const net = new Network({
    devices: [R("R1"), R("R2"), R("R3")],
    links: [["R1", G(0), "R2", G(0)], ["R2", G(1), "R3", G(0)], ["R3", G(1), "R1", G(1)]],
  });
  applyConfig(net, "R1", ["int g0/0", "ip add 10.0.12.1 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.13.1 255.255.255.0", "no shut", "int lo0", "ip add 1.1.1.1 255.255.255.255"]);
  applyConfig(net, "R2", ["int g0/0", "ip add 10.0.12.2 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.23.2 255.255.255.0", "no shut", "int lo0", "ip add 2.2.2.2 255.255.255.255"]);
  applyConfig(net, "R3", ["int g0/0", "ip add 10.0.23.3 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.13.3 255.255.255.0", "no shut", "int lo0", "ip add 3.3.3.3 255.255.255.255"]);
  for (const r of ["R1", "R2", "R3"]) applyConfig(net, r, ["router ospf 1", "network 0.0.0.0 255.255.255.255 area 0"]);
  return net;
}

test("OSPF: neighbours, DR election, equal-cost paths, cost changes", () => {
  const net = triangle();
  const o = net.ospf();
  for (const r of ["R1", "R2", "R3"]) assert.equal(o[r].nbrs.filter((n) => n.state.startsWith("FULL")).length, 2);
  const r1g0 = o.R1.ifs.find((i) => i.ifn === G(0));
  assert.equal(r1g0.dr.rid, ip2n("2.2.2.2"), "higher router ID wins the DR election");
  assert.equal(r1g0.role, "BDR");
  const route = net.routes("R1").find((r) => r.net === ip2n("10.0.23.0") && r.len === 24);
  assert.equal(route.code, "O");
  assert.equal(route.metric, 2);
  assert.equal(route.paths.length, 2, "two equal-cost paths");
  applyConfig(net, "R1", ["int g0/1", "ip ospf cost 10"]);
  const after = net.routes("R1").find((r) => r.net === ip2n("3.3.3.3"));
  assert.deepEqual(after.paths.map((p) => p.ip), [ip2n("10.0.12.2")], "cost 10 pushes R1 to R3 via R2");
  assert.equal(after.metric, 3);
});

test("OSPF: priority 0, timer and area mismatches", () => {
  let net = triangle();
  applyConfig(net, "R2", ["int g0/0", "ip ospf priority 0"]);
  assert.equal(net.ospf().R1.ifs.find((i) => i.ifn === G(0)).role, "DR");
  net = triangle();
  applyConfig(net, "R1", ["int g0/0", "ip ospf hello-interval 5"]);
  assert.ok(!net.ospf().R1.nbrs.some((n) => n.rid === ip2n("2.2.2.2")), "hello mismatch");
  net = triangle();
  applyConfig(net, "R1", ["int g0/0", "ip ospf 1 area 1"]);
  assert.ok(!net.ospf().R1.nbrs.some((n) => n.rid === ip2n("2.2.2.2")), "area mismatch");
});

test("OSPF: router-id changes wait for clear ip ospf process", () => {
  const net = triangle();
  const s = new Session(net, "R1");
  for (const l of ["en", "conf t", "router ospf 1"]) s.input(l);
  assert.match(s.input("router-id 9.9.9.9"), /clear ip ospf process/);
  assert.equal(net.routerId("R1"), ip2n("1.1.1.1"));
  s.input("end");
  s.input("clear ip ospf process");
  s.input("yes");
  assert.equal(net.routerId("R1"), ip2n("9.9.9.9"));
});

test("OSPF default-information originate", () => {
  const net = triangle();
  applyConfig(net, "R1", ["ip route 0.0.0.0 0.0.0.0 10.0.12.2", "router ospf 1", "default-information originate"]);
  const d = net.routes("R3").find((r) => r.net === 0 && r.len === 0);
  assert.equal(d.code, "O*E2");
  assert.match(console_(net, "R3", "en", "show ip route"), /Gateway of last resort is 10\.0\.13\.1 to network 0\.0\.0\.0/);
});

test("static routes: recursion, floating static failover", () => {
  const net = new Network({
    devices: [R("R1"), R("R2"), R("R3"), P("PC")],
    links: [["R1", G(0), "R2", G(0)], ["R1", G(1), "R3", G(0)], ["R2", G(1), "PC", "eth0"], ["R3", G(1), "R2", G(2)]],
  });
  applyConfig(net, "R1", ["int g0/0", "ip add 10.0.12.1 255.255.255.252", "no shut", "int g0/1", "ip add 10.0.13.1 255.255.255.252", "no shut",
    "ip route 192.168.2.0 255.255.255.0 10.0.12.2", "ip route 192.168.2.0 255.255.255.0 10.0.13.2 200"]);
  applyConfig(net, "R2", ["int g0/0", "ip add 10.0.12.2 255.255.255.252", "no shut", "int g0/1", "ip add 192.168.2.1 255.255.255.0", "no shut",
    "int g0/2", "ip add 10.0.32.2 255.255.255.252", "no shut", "ip route 0.0.0.0 0.0.0.0 10.0.12.1"]);
  applyConfig(net, "R3", ["int g0/0", "ip add 10.0.13.2 255.255.255.252", "no shut", "int g0/1", "ip add 10.0.32.1 255.255.255.252", "no shut",
    "ip route 192.168.2.0 255.255.255.0 10.0.32.2", "ip route 10.0.12.0 255.255.255.252 10.0.13.1"]);
  applyConfig(net, "PC", ["ip 192.168.2.10/24 192.168.2.1"]);
  const via = () => net.routes("R1").find((r) => r.net === ip2n("192.168.2.0")).paths[0].ip;
  assert.equal(via(), ip2n("10.0.12.2"));
  assert.ok(net.ping("R1", "192.168.2.10").ok);
  applyConfig(net, "R1", ["int g0/0", "shutdown"]);
  assert.equal(via(), ip2n("10.0.13.2"), "the floating static takes over");
  applyConfig(net, "R2", ["ip route 10.0.13.0 255.255.255.252 10.0.32.1"]);
  assert.ok(net.ping("R1", "192.168.2.10").ok, "the backup path works once the return route exists");
  const out = console_(net, "R1", "en", "show ip route static");
  assert.match(out, /S +192\.168\.2\.0\/24 \[200\/0\] via 10\.0\.13\.2/);
});

test("ping and traceroute output", () => {
  const net = triangle();
  const s = new Session(net, "R1");
  s.input("en");
  const first = s.input("ping 3.3.3.3");
  assert.match(first, /^\.!!!!$/m, "the first packet is lost to ARP");
  assert.match(first, /Success rate is 80 percent \(4\/5\)/);
  assert.match(s.input("ping 3.3.3.3"), /^!!!!!$/m);
  assert.match(s.input("ping 9.9.9.9"), /Success rate is 0 percent \(0\/5\)/);
  assert.match(s.input("traceroute 3.3.3.3"), /^ {2}1 3\.3\.3\.3 /m);
  assert.match(s.input("ping 3.3.3.3 source lo0"), /Packet sent with a source address of 1\.1\.1\.1/);
});

test("ACLs: standard, extended, counters, undefined ACL permits", () => {
  const net = new Network({
    devices: [R("R1"), P("A"), P("B"), P("SRV")],
    links: [["R1", G(0), "A", "eth0"], ["R1", G(1), "B", "eth0"], ["R1", G(2), "SRV", "eth0"]],
  });
  applyConfig(net, "R1", ["int g0/0", "ip add 10.1.0.1 255.255.255.0", "no shut", "int g0/1", "ip add 10.2.0.1 255.255.255.0", "no shut",
    "int g0/2", "ip add 10.9.0.1 255.255.255.0", "no shut", "int g0/2", "ip access-group NOPE out"]);
  applyConfig(net, "A", ["ip 10.1.0.10/24 10.1.0.1"]);
  applyConfig(net, "B", ["ip 10.2.0.10/24 10.2.0.1"]);
  applyConfig(net, "SRV", ["ip 10.9.0.10/24 10.9.0.1"]);
  assert.ok(net.ping("A", "10.9.0.10").ok, "an ACL that doesn't exist filters nothing");
  applyConfig(net, "R1", ["access-list 5 deny 10.1.0.0 0.0.0.255", "interface g0/2", "ip access-group 5 out"]);
  assert.ok(!net.ping("A", "10.9.0.10").ok);
  assert.ok(!net.ping("B", "10.9.0.10").ok, "implicit deny any");
  applyConfig(net, "R1", ["access-list 5 permit any"]);
  assert.ok(net.ping("B", "10.9.0.10").ok);
  const s = new Session(net, "A");
  assert.match(s.input("ping 10.9.0.10"), /\*10\.1\.0\.1 icmp_seq=1 ttl=255 .*code:13, Communication administratively prohibited/);
  assert.match(console_(net, "R1", "en", "show access-lists"), /10 deny {3}10\.1\.0\.0, wildcard bits 0\.0\.0\.255 \(5 matches\)/);
  applyConfig(net, "R1", ["interface g0/2", "no ip access-group 5 out", "ip access-list extended NOECHO",
    "deny icmp any host 10.9.0.10 echo", "permit ip any any", "interface g0/0", "ip access-group NOECHO in"]);
  assert.ok(!net.ping("A", "10.9.0.10").ok);
  assert.ok(net.ping("A", "10.2.0.10").ok);
  assert.ok(net.ping("SRV", "10.1.0.10").ok, "echo-reply from the server isn't an echo, so it passes");
});

test("DHCP: local pool, exclusions, relay, failure", () => {
  const net = new Network({
    devices: [R("R1"), R("R2"), P("A"), P("B"), P("C")],
    links: [["R1", G(0), "A", "eth0"], ["R1", G(1), "R2", G(0)], ["R2", G(1), "B", "eth0"], ["R2", G(2), "C", "eth0"]],
  });
  applyConfig(net, "R1", ["int g0/0", "ip add 192.168.1.1 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.0.1 255.255.255.252", "no shut",
    "ip route 192.168.2.0 255.255.255.0 10.0.0.2", "ip dhcp excluded-address 192.168.1.1 192.168.1.9",
    "ip dhcp pool ONE", "network 192.168.1.0 /24", "default-router 192.168.1.1",
    "ip dhcp pool TWO", "network 192.168.2.0 255.255.255.0", "default-router 192.168.2.1"]);
  applyConfig(net, "R2", ["int g0/0", "ip add 10.0.0.2 255.255.255.252", "no shut", "int g0/1", "ip add 192.168.2.1 255.255.255.0", "no shut",
    "int g0/2", "ip add 192.168.3.1 255.255.255.0", "no shut", "ip route 0.0.0.0 0.0.0.0 10.0.0.1"]);
  assert.match(console_(net, "A", "ip dhcp"), /DDORA IP 192\.168\.1\.10\/24 GW 192\.168\.1\.1/);
  assert.match(console_(net, "B", "ip dhcp"), /DDD\nCan't find dhcp server/, "no relay yet");
  applyConfig(net, "R2", ["int g0/1", "ip helper-address 10.0.0.1"]);
  assert.match(console_(net, "B", "dhcp"), /DDORA IP 192\.168\.2\.2\/24 GW 192\.168\.2\.1/);
  assert.ok(net.ping("B", "192.168.1.10").ok);
  assert.match(console_(net, "R1", "en", "show ip dhcp binding"), /192\.168\.1\.10 +0100\.5079\.6668\.\d\d/);
  assert.match(console_(net, "A", "ip dhcp"), /192\.168\.1\.10\/24/, "a client gets its old lease back");
});

test("telnet and SSH between devices", () => {
  const net = new Network({ devices: [R("R1"), R("R2")], links: [["R1", G(0), "R2", G(0)]] });
  applyConfig(net, "R1", ["int g0/0", "ip add 10.0.0.1 255.255.255.0", "no shut"]);
  applyConfig(net, "R2", ["hostname R2", "int g0/0", "ip add 10.0.0.2 255.255.255.0", "no shut"]);
  const s = new Session(net, "R1");
  s.input("en");
  assert.match(s.input("telnet 10.0.0.2"), /Password required, but none set/);
  applyConfig(net, "R2", ["line vty 0 4", "password vtypass"]);
  s.input("telnet 10.0.0.2");
  s.input("vtypass");
  assert.equal(s.prompt(), "R2>");
  assert.match(s.input("enable"), /% No password set/, "enable over a vty needs an enable password");
  s.input("exit");
  assert.equal(s.prompt(), "Router#");
  assert.match(s.input("ssh -l admin 10.0.0.2"), /% Connection refused by remote host/, "no RSA keys yet");
  const keys = applyConfig(net, "R2", ["ip domain-name lab.local", "crypto key generate rsa", "1024", "username admin secret pw",
    "line vty 0 4", "login local", "transport input ssh"]);
  assert.equal(keys.pending, null);
  assert.equal(net.devs.R2.cfg.rsa, 1024);
  assert.match(s.input("telnet 10.0.0.2"), /% Connection refused by remote host/, "telnet is no longer allowed");
  s.input("ssh -l admin 10.0.0.2");
  s.input("pw");
  assert.equal(s.prompt(), "R2>");
  assert.ok(net.check({ type: "login-seen", device: "R2", proto: "ssh", user: "admin" }));
});

// The server renders saved state with sorted keys, so nothing may depend on key order.
const sortKeys = (v) => (Array.isArray(v) ? v.map(sortKeys) : v && typeof v === "object"
  ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v);

// ---------------------------------------------------------------- spanning tree
function triangleSw() {
  const net = new Network({
    devices: [S("SW1"), S("SW2"), S("SW3"), P("A"), P("B")],
    links: [["SW1", G(1), "SW2", G(1)], ["SW1", G(2), "SW3", G(1)], ["SW2", G(2), "SW3", G(2)], ["SW2", F(1), "A", "eth0"], ["SW3", F(1), "B", "eth0"]],
  });
  applyConfig(net, "A", ["ip 10.0.0.1/24"]);
  applyConfig(net, "B", ["ip 10.0.0.2/24"]);
  return net;
}

test("STP: root election, root and alternate ports, exactly one path through a loop", () => {
  const net = triangleSw();
  const t = net.stp(1);
  assert.equal(t.SW1.rootPort, null, "lowest MAC wins with default priorities");
  assert.equal(t.SW2.rootPort, G(1));
  assert.deepEqual([t.SW3.ports[G(2)].role, t.SW3.ports[G(2)].state], ["Altn", "BLK"], "SW2 has the lower bridge ID, so SW3 blocks");
  const r = net.ping("A", "10.0.0.2");
  assert.ok(r.ok);
  assert.ok(r.links.some((l) => l.a === "SW1"), "the path goes around through the root, not over the blocked link");
  applyConfig(net, "SW3", ["spanning-tree vlan 1 root primary"]);
  assert.equal(net.devs.SW3.cfg.stp.prio[1], 24576);
  assert.ok(net.check({ type: "stp-root", device: "SW3", vlan: 1 }));
  assert.ok(net.check({ type: "stp-port", device: "SW2", intf: "Gi0/1", vlan: 1, role: "Altn", state: "BLK" }));
  const out = console_(net, "SW2", "en", "show spanning-tree");
  assert.match(out, /Root ID {4}Priority {4}24577/);
  assert.match(out, /Port {8}26 \(GigabitEthernet0\/2\)/);
  assert.match(out, /^Gi0\/1 +Altn BLK 4 +128\.25 +P2p$/m);
  assert.match(console_(net, "SW1", "en", "conf t", "spanning-tree vlan 1 priority 1000"), /% Bridge Priority must be in increments of 4096/);
  applyConfig(net, "SW2", ["interface g0/2", "spanning-tree cost 100"]);
  assert.ok(net.check({ type: "stp-port", device: "SW2", intf: "Gi0/1", vlan: 1, role: "Root" }), "a higher cost moves the root port");
  applyConfig(net, "SW1", ["spanning-tree mode rapid-pvst"]);
  assert.match(console_(net, "SW1", "en", "show spanning-tree"), /protocol rstp/);
  assert.match(runningConfig(net, "SW1"), /^spanning-tree mode rapid-pvst$/m);
});

test("STP: PortFast edge ports and BPDU guard err-disabling a port that hears a switch", () => {
  const net = triangleSw();
  applyConfig(net, "SW2", ["interface f0/1", "switchport mode access", "spanning-tree portfast", "spanning-tree bpduguard enable"]);
  assert.match(console_(net, "SW2", "en", "show spanning-tree"), /^Fa0\/1 +Desg FWD 19 +128\.1 +P2p Edge$/m);
  assert.ok(!net.devs.SW2.rt.errdis[F(1)], "a PC sends no BPDUs");
  const s = new Session(net, "SW2");
  for (const l of ["en", "conf t", "interface g0/2", "spanning-tree bpduguard enable"]) s.input(l);
  assert.equal(net.devs.SW2.rt.errdis[G(2)], "bpduguard");
  assert.match(s.input("do show interfaces status err-disabled"), /Gi0\/2 +err-disabled bpduguard/);
  assert.match(s.input("do show interfaces g0/2"), /is down, line protocol is down \(err-disabled\)/);
  s.input("no spanning-tree bpduguard");
  assert.ok(!net.ifUp("SW2", G(2)), "err-disable latches until shut / no shut");
  s.input("shutdown");
  s.input("no shutdown");
  assert.ok(net.ifUp("SW2", G(2)));
});

// ---------------------------------------------------------------- EtherChannel
function twoLinks() {
  const net = new Network({
    devices: [S("SW1"), S("SW2"), P("A"), P("B")],
    links: [["SW1", F(23), "SW2", F(23)], ["SW1", F(24), "SW2", F(24)], ["SW1", F(1), "A", "eth0"], ["SW2", F(1), "B", "eth0"]],
  });
  applyConfig(net, "A", ["ip 10.0.0.1/24"]);
  applyConfig(net, "B", ["ip 10.0.0.2/24"]);
  return net;
}

test("EtherChannel: LACP and PAgP negotiation rules", () => {
  const cases = [["active", "passive", "P"], ["active", "active", "P"], ["passive", "passive", "I"], ["on", "on", "P"],
    ["on", "active", "s"], ["desirable", "auto", "P"], ["auto", "auto", "I"]];
  for (const [a, b, flag] of cases) {
    const net = twoLinks();
    const out = applyConfig(net, "SW1", ["interface range f0/23 - 24", "channel-group 1 mode " + a]);
    applyConfig(net, "SW2", ["interface range f0/23 - 24", "channel-group 1 mode " + b]);
    assert.equal(net.ec().SW1.members[F(23)].flag, flag, `${a} + ${b}`);
    assert.ok(out);
  }
  const net = twoLinks();
  assert.match(console_(net, "SW1", "en", "conf t", "interface range f0/23 - 24", "channel-group 1 mode active"), /Creating a port-channel interface Port-channel 1/);
  assert.match(console_(net, "SW1", "en", "conf t", "interface f0/22", "channel-group 1 mode desirable"), /Command rejected \(Port-channel1, FastEthernet0\/22\): Invalid etherchnl mode/);
});

test("EtherChannel: one logical link to STP, config sync, suspended members", () => {
  const net = twoLinks();
  applyConfig(net, "SW1", ["interface range f0/23 - 24", "channel-group 1 mode active", "interface po1", "switchport mode trunk"]);
  applyConfig(net, "SW2", ["interface range f0/23 - 24", "channel-group 1 mode active"]);
  assert.equal(net.devs.SW1.cfg.intfs[F(23)].mode, "trunk", "port-channel settings are copied to members");
  assert.ok(net.check({ type: "etherchannel", device: "SW2", group: 1, protocol: "lacp", bundled: 2 }));
  assert.deepEqual(Object.keys(net.stp(1).SW2.ports).sort(), [F(1), "Port-channel1"], "STP only sees the bundle");
  assert.equal(net.stp(1).SW2.ports["Port-channel1"].cost, 12, "two FastEthernet links cost 12");
  assert.match(console_(net, "SW1", "en", "show etherchannel summary"), /^1 +Po1\(SU\) +LACP +Fa0\/23\(P\) +Fa0\/24\(P\)$/m);
  assert.match(console_(net, "SW2", "en", "show interfaces trunk"), /^Po1 +auto +802\.1q +trunking +1$/m);
  assert.ok(net.ping("A", "10.0.0.2").ok);
  applyConfig(net, "SW2", ["interface f0/24", "switchport access vlan 5"]);
  assert.equal(net.ec().SW2.members[F(24)].flag, "s", "a member that differs from its port-channel is suspended");
  applyConfig(net, "SW1", ["interface f0/23", "shutdown"]);
  assert.ok(!net.check({ type: "etherchannel", device: "SW1", group: 1 }), "no bundled members left");
  assert.ok(!net.ping("A", "10.0.0.2").ok);
});

// ---------------------------------------------------------------- port security
function psecNet() {
  const net = new Network({
    devices: [S("SW1"), S("HUB"), P("PC1"), P("PC3"), P("PC4"), P("SRV")],
    links: [["SW1", F(1), "PC1", "eth0"], ["SW1", F(3), "HUB", F(24)], ["HUB", F(1), "PC3", "eth0"], ["HUB", F(2), "PC4", "eth0"], ["SW1", F(24), "SRV", "eth0"]],
  });
  for (const [p, n] of [["PC1", 11], ["PC3", 13], ["PC4", 14], ["SRV", 100]]) applyConfig(net, p, [`ip 10.0.0.${n}/24`]);
  return net;
}

test("port security: sticky learning, restrict, shutdown and recovery", () => {
  const net = psecNet();
  assert.match(console_(net, "SW1", "en", "conf t", "interface f0/1", "switchport port-security"), /Command rejected: FastEthernet0\/1 is a dynamic port\./);
  applyConfig(net, "SW1", ["interface f0/1", "switchport mode access", "switchport port-security", "switchport port-security mac-address sticky"]);
  console_(net, "PC1", "ping 10.0.0.100 -c 1");
  assert.match(runningConfig(net, "SW1"), new RegExp(`^ switchport port-security mac-address sticky ${net.mac("PC1", "eth0").replace(/\./g, "\\.")}$`, "m"));
  assert.match(console_(net, "SW1", "en", "show port-security interface f0/1"), /Port Status {16}: Secure-up[\s\S]*Sticky MAC Addresses {7}: 1/);
  applyConfig(net, "SW1", ["interface f0/3", "switchport mode access", "switchport port-security", "switchport port-security violation restrict"]);
  console_(net, "PC3", "ping 10.0.0.100 -c 1");
  assert.match(console_(net, "PC4", "ping 10.0.0.100 -c 2"), /icmp_seq=2 timeout/);
  assert.ok(net.check({ type: "psec-violations", device: "SW1", intf: "Fa0/3", min: 2 }));
  assert.ok(net.ifUp("SW1", F(3)), "restrict drops frames but keeps the port up");
  assert.ok(net.ping("PC3", "10.0.0.100").ok && !net.ping("PC4", "10.0.0.100").ok);
  assert.match(console_(net, "SW1", "en", "show port-security"), /Fa0\/3 +1 +1 +2 +Restrict/);
  applyConfig(net, "SW1", ["interface f0/3", "switchport port-security violation shutdown"]);
  const pc4 = new Session(net, "PC4");
  pc4.input("ping 10.0.0.100 -c 1");
  assert.match(pc4.events.SW1.join("\n"), /%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0\/3[\s\S]*%PORT_SECURITY-2-PSECURE_VIOLATION[\s\S]*%LINK-3-UPDOWN: Interface FastEthernet0\/3, changed state to down/);
  assert.ok(net.check({ type: "errdisabled", device: "SW1", intf: "Fa0/3", reason: "psecure-violation" }));
  assert.ok(!net.ping("PC3", "10.0.0.100").ok);
  applyConfig(net, "SW1", ["interface f0/3", "shutdown", "no shutdown"]);
  assert.ok(net.ping("PC3", "10.0.0.100").ok, "shut / no shut clears err-disable and the dynamic secure address");
});

// ---------------------------------------------------------------- NAT
function natNet() {
  const net = new Network({
    devices: [R("R1"), R("ISP"), S("SW1"), P("PC1"), P("PC2"), P("SRV")],
    links: [["R1", G(0), "SW1", G(1)], ["R1", G(1), "ISP", G(0)], ["SW1", F(1), "PC1", "eth0"], ["SW1", F(2), "PC2", "eth0"], ["SW1", F(3), "SRV", "eth0"]],
  });
  applyConfig(net, "R1", ["int g0/0", "ip add 192.168.1.1 255.255.255.0", "no shut", "int g0/1", "ip add 203.0.113.2 255.255.255.252", "no shut", "ip route 0.0.0.0 0.0.0.0 203.0.113.1"]);
  applyConfig(net, "ISP", ["int g0/0", "ip add 203.0.113.1 255.255.255.252", "no shut", "int lo0", "ip add 8.8.8.8 255.255.255.255", "ip route 198.51.100.0 255.255.255.248 203.0.113.2"]);
  applyConfig(net, "PC1", ["ip 192.168.1.10/24 192.168.1.1"]);
  applyConfig(net, "PC2", ["ip 192.168.1.11/24 192.168.1.1"]);
  applyConfig(net, "SRV", ["ip 192.168.1.100/24 192.168.1.1"]);
  return net;
}

test("NAT: static NAT, PAT overload, translation table, pools", () => {
  const net = natNet();
  assert.ok(!net.ping("PC1", "8.8.8.8").ok, "private addresses don't route on the internet");
  applyConfig(net, "R1", ["int g0/0", "ip nat inside", "int g0/1", "ip nat outside", "access-list 1 permit 192.168.1.0 0.0.0.255",
    "ip nat inside source list 1 interface g0/1 overload", "ip nat inside source static 192.168.1.100 198.51.100.5"]);
  assert.ok(net.ping("PC1", "8.8.8.8").ok && net.ping("PC2", "8.8.8.8").ok);
  assert.ok(net.ping("ISP", "198.51.100.5").ok, "the static mapping is reachable from outside");
  assert.ok(!net.ping("ISP", "192.168.1.10").ok);
  assert.equal(net.devs.R1.rt.nat.length, 0, "checks don't leave translations behind");
  console_(net, "PC1", "ping 8.8.8.8 -c 2");
  console_(net, "PC2", "ping 8.8.8.8 -c 2");
  const t = console_(net, "R1", "en", "show ip nat translations");
  assert.match(t, /^icmp 203\.0\.113\.2:1 +192\.168\.1\.10:1 +8\.8\.8\.8:1 +8\.8\.8\.8:1$/m);
  assert.match(t, /^icmp 203\.0\.113\.2:1024 +192\.168\.1\.11:1/m, "PAT gives the second host another ID");
  assert.match(t, /^--- +198\.51\.100\.5 +192\.168\.1\.100 +--- +---$/m);
  assert.ok(net.check({ type: "nat-entry", device: "R1", local: "192.168.1.10", global: "203.0.113.2" }));
  assert.match(console_(net, "R1", "en", "show ip nat statistics"), /Outside interfaces:\n {2}GigabitEthernet0\/1\nInside interfaces: \n {2}GigabitEthernet0\/0/);
  console_(net, "R1", "en", "clear ip nat translation *");
  applyConfig(net, "R1", ["no ip nat inside source list 1 interface g0/1 overload", "ip nat pool ONE 198.51.100.1 198.51.100.1 netmask 255.255.255.248",
    "ip nat inside source list 1 pool ONE"]);
  assert.ok(net.ping("PC1", "8.8.8.8", { record: true }).ok);
  assert.ok(!net.ping("PC2", "8.8.8.8").ok, "a one-address pool without overload is exhausted");
  assert.match(console_(net, "R1", "en", "conf t", "no ip nat pool ONE"), /%Pool ONE in use, cannot destroy/);
});

// ---------------------------------------------------------------- HSRP
function hsrpNet() {
  const net = new Network({
    devices: [R("R1"), R("R2"), R("R3"), S("SW1"), P("PC1")],
    links: [["R1", G(0), "SW1", G(1)], ["R2", G(0), "SW1", G(2)], ["SW1", F(1), "PC1", "eth0"], ["R1", G(1), "R3", G(0)], ["R2", G(1), "R3", G(1)]],
  });
  const ospf = ["router ospf 1", "network 0.0.0.0 255.255.255.255 area 0"];
  applyConfig(net, "R1", ["int g0/0", "ip add 192.168.10.2 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.13.1 255.255.255.0", "no shut", ...ospf]);
  applyConfig(net, "R2", ["int g0/0", "ip add 192.168.10.3 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.23.2 255.255.255.0", "no shut", ...ospf]);
  applyConfig(net, "R3", ["int g0/0", "ip add 10.0.13.3 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.23.3 255.255.255.0", "no shut",
    "int lo0", "ip add 10.10.10.10 255.255.255.255", ...ospf]);
  applyConfig(net, "PC1", ["ip 192.168.10.10/24 192.168.10.1"]);
  return net;
}

test("HSRP: election, no preempt, preempt, tracking failover, virtual MAC", () => {
  const net = hsrpNet();
  const state = (r) => net.devs[r].rt.hsrp["GigabitEthernet0/0|10"].state;
  assert.ok(!net.ping("PC1", "10.10.10.10").ok);
  const r2 = new Session(net, "R2");
  for (const l of ["en", "conf t", "int g0/0"]) r2.input(l);
  assert.match(r2.input("standby 10 ip 192.168.10.1"), /Grp 10 state Speak -> Standby[\s\S]*Grp 10 state Standby -> Active/);
  applyConfig(net, "R1", ["int g0/0", "standby 10 ip 192.168.10.1", "standby 10 priority 110"]);
  assert.deepEqual([state("R1"), state("R2")], ["Standby", "Active"], "without preempt the active router keeps the role");
  assert.ok(net.ping("PC1", "10.10.10.10").ok && net.ping("PC1", "192.168.10.1").ok);
  applyConfig(net, "R1", ["int g0/0", "standby 10 preempt", "standby 10 track g0/1 20"]);
  assert.equal(state("R1"), "Active");
  assert.match(runningConfig(net, "R1"), /^track 1 interface GigabitEthernet0\/1 line-protocol$[\s\S]*^ standby 10 track 1 decrement 20$/m);
  r2.input("standby 10 preempt");
  applyConfig(net, "R1", ["int g0/1", "shutdown"]);
  assert.equal(state("R2"), "Active", "tracking dropped R1 to 90, and R2 preempts");
  assert.ok(net.ping("PC1", "10.10.10.10").ok, "the PC keeps the same gateway through the failover");
  applyConfig(net, "R1", ["int g0/1", "no shutdown"]);
  assert.equal(state("R1"), "Active");
  assert.ok(net.check({ type: "hsrp-seen", device: "R2", intf: "Gi0/0", group: 10, state: "Active" }));
  assert.match(console_(net, "R1", "en", "show standby brief"), /^Gi0\/0 +10 +110 P Active +local +192\.168\.10\.3 +192\.168\.10\.1$/m);
  console_(net, "PC1", "ping 192.168.10.1");
  assert.match(console_(net, "PC1", "arp"), /00:00:0c:07:ac:0a {2}192\.168\.10\.1/);
  applyConfig(net, "R2", ["int g0/0", "standby version 2"]);
  assert.equal(state("R2"), "Active", "v1 and v2 don't hear each other");
});

// ---------------------------------------------------------------- IPv6
function v6Net() {
  const net = new Network({ devices: [R("R1"), R("R2"), P("PC1"), P("PC2")],
    links: [["R1", G(0), "PC1", "eth0"], ["R1", G(1), "R2", G(1)], ["R2", G(0), "PC2", "eth0"]] });
  applyConfig(net, "R1", ["ipv6 unicast-routing", "int g0/0", "ipv6 address 2001:db8:acad:1::1/64", "no shut", "int g0/1", "ipv6 address 2001:DB8:ACAD:12::1/64", "no shut"]);
  applyConfig(net, "R2", ["ipv6 unicast-routing", "int g0/0", "ipv6 address 2001:db8:acad:2::1/64", "no shut", "int g0/1", "ipv6 address 2001:DB8:ACAD:12::2/64", "no shut"]);
  return net;
}

test("SLAAC keeps listening for router advertisements", () => {
  const net = new Network({ devices: [R("R1"), P("PC1")], links: [["R1", G(0), "PC1", "eth0"]] });
  assert.match(console_(net, "PC1", "ip auto"), /No router answered ICMPv6 Router Solicitation/);
  assert.equal(net.addrs6("PC1", "eth0").length, 0);
  applyConfig(net, "R1", ["ipv6 unicast-routing", "int g0/0", "ipv6 address 2001:db8:1::1/64", "no shut"]);
  assert.equal(ios.fmt6(net.addrs6("PC1", "eth0")[0].a), "2001:DB8:1:0:250:79FF:FE66:6801", "the address arrives with the first RA");
  assert.match(console_(net, "PC1", "show ipv6"), /GLOBAL SCOPE {6}: 2001:db8:1:0:250:79ff:fe66:6801\/64/);
  assert.ok(net.ping("PC1", "2001:DB8:1::1").ok);
  applyConfig(net, "R1", ["no ipv6 unicast-routing"]);
  assert.equal(net.addrs6("PC1", "eth0").length, 0, "no more router advertisements");
});

test("IPv6 helpers: parse, compress, EUI-64", () => {
  assert.equal(ios.fmt6(ios.parse6("2001:0db8:0000:0000:0000:0000:0000:0001")), "2001:DB8::1");
  assert.equal(ios.fmt6(ios.parse6("2001:db8:0:1:0:0:0:1")), "2001:DB8:0:1::1", "only runs of two or more zero groups compress");
  assert.equal(ios.parse6("2001:db8::1::2"), null);
  assert.equal(ios.parse6("12345::"), null);
  assert.equal(ios.fmt6(ios.parse6("::ffff:10.0.0.1")), "::FFFF:A00:1");
  const net = v6Net();
  assert.equal(ios.fmt6(net.ll6("R1", G(0))), "FE80::5054:FF:FE00:100", "EUI-64 flips the universal/local bit and inserts FFFE");
});

test("IPv6: SLAAC, static routes, OSPFv3, link-local pings", () => {
  const net = v6Net();
  assert.match(console_(net, "PC1", "ip auto"), /GLOBAL SCOPE {6}: 2001:db8:acad:1:250:79ff:fe66:6802\/64\nROUTER LINK-LAYER : 52:54:00:00:01:00/);
  console_(net, "PC2", "ip auto");
  const pc2 = ios.fmt6(net.addrs6("PC2", "eth0")[0].a);
  assert.ok(net.ping("PC1", "2001:DB8:ACAD:1::1").ok);
  assert.ok(!net.ping("PC1", pc2).ok);
  applyConfig(net, "R1", ["ipv6 route 2001:db8:acad:2::/64 2001:db8:acad:12::2"]);
  applyConfig(net, "R2", ["ipv6 route ::/0 g0/1 " + ios.fmt6(net.ll6("R1", G(1)))]);
  assert.ok(net.ping("PC1", pc2).ok, "a recursive static and a link-local next hop with an exit interface");
  assert.match(console_(net, "PC1", "ping " + pc2.toLowerCase() + " -c 1"), /icmp6_seq=1 ttl=62/);
  const rt = console_(net, "R1", "en", "show ipv6 route");
  assert.match(rt, /^S {3}2001:DB8:ACAD:2::\/64 \[1\/0\]\n {5}via 2001:DB8:ACAD:12::2$/m);
  assert.match(rt, /^L {3}FF00::\/8 \[0\/0\]/m);
  assert.match(console_(net, "R1", "en", "show ipv6 interface brief"), /^GigabitEthernet0\/0 +\[up\/up\]\n {4}FE80::5054:FF:FE00:100\n {4}2001:DB8:ACAD:1::1$/m);
  assert.match(console_(net, "R1", "en", "conf t", "ipv6 route 2001:db8::/64 fe80::1"), /% Interface has to be specified for a link-local nexthop/);
  // OSPFv3 on an IPv6-only network needs a router ID by hand.
  applyConfig(net, "R1", ["no ipv6 route 2001:db8:acad:2::/64"]);
  applyConfig(net, "R2", ["no ipv6 route ::/0"]);
  assert.match(console_(net, "R2", "en", "conf t", "int g0/1", "ipv6 ospf 1 area 0"), /%OSPFv3-4-NORTRID: OSPFv3 process 1 could not pick a router-id/);
  applyConfig(net, "R2", ["ipv6 router ospf 1", "router-id 2.2.2.2", "int g0/0", "ipv6 ospf 1 area 0"]);
  applyConfig(net, "R1", ["ipv6 router ospf 1", "router-id 1.1.1.1", "int g0/0", "ipv6 ospf 1 area 0", "int g0/1", "ipv6 ospf 1 area 0"]);
  assert.ok(net.check({ type: "ospf6-nbr", device: "R1", neighbor: "2.2.2.2" }));
  assert.match(console_(net, "R1", "en", "show ipv6 route ospf"), /^O {3}2001:DB8:ACAD:2::\/64 \[110\/2\]\n {5}via FE80::5054:FF:FE01:200, GigabitEthernet0\/1$/m);
  assert.ok(net.ping("PC1", pc2).ok);
  const s = new Session(net, "R1");
  s.input("en");
  s.input("ping FE80::5054:FF:FE01:200");
  assert.equal(s.prompt(), "Output Interface: ");
  assert.match(s.input("g0/1"), /Packet sent with a source address of FE80::5054:FF:FE00:200%GigabitEthernet0\/1\n!!!!!/);
  assert.match(console_(net, "R1", "en", "conf t", "int g0/2", "ipv6 address 2001:db8:acad:1::9/64"), /% 2001:DB8:ACAD:1::\/64 overlaps with GigabitEthernet0\/0/);
});

// ---------------------------------------------------------------- EIGRP
function eigrpNet(named) {
  const net = new Network({ devices: [R("R1"), R("R2"), R("R3"), P("PC1"), P("PC3")],
    links: [["R1", G(0), "R2", G(0)], ["R2", G(1), "R3", G(0)], ["R1", G(1), "R3", G(1)], ["R1", G(2), "PC1", "eth0"], ["R3", G(2), "PC3", "eth0"]] });
  applyConfig(net, "R1", ["int g0/0", "ip add 10.0.12.1 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.13.1 255.255.255.0", "bandwidth 100000", "no shut",
    "int g0/2", "ip add 192.168.1.1 255.255.255.0", "no shut", "int lo0", "ip add 1.1.1.1 255.255.255.255"]);
  applyConfig(net, "R2", ["int g0/0", "ip add 10.0.12.2 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.23.2 255.255.255.0", "no shut"]);
  applyConfig(net, "R3", ["int g0/0", "ip add 10.0.23.3 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.13.3 255.255.255.0", "bandwidth 100000", "no shut",
    "int g0/2", "ip add 192.168.3.1 255.255.255.0", "no shut"]);
  applyConfig(net, "PC1", ["ip 192.168.1.10/24 192.168.1.1"]);
  applyConfig(net, "PC3", ["ip 192.168.3.10/24 192.168.3.1"]);
  const nets = ["network 10.0.0.0", "network 192.168.0.0 0.0.255.255", "network 1.1.1.1 0.0.0.0"];
  for (const r of ["R1", "R2", "R3"]) {
    applyConfig(net, r, named ? ["router eigrp LAB", "address-family ipv4 unicast autonomous-system 100", ...nets] : ["router eigrp 100", ...nets]);
  }
  return net;
}

test("EIGRP: metrics, DUAL feasible successors, K mismatch, variance, redistribution", () => {
  const net = eigrpNet(false);
  assert.ok(net.check({ type: "eigrp-nbrs", device: "R1", count: 2 }));
  const r = net.routes("R1").find((x) => x.net === ip2n("192.168.3.0"));
  assert.deepEqual([r.code, r.ad, r.metric, r.paths.map((p) => p.ip)], ["D", 90, 3328, [ip2n("10.0.12.2")]], "256 x (10 + 3) over the gigabit path");
  const topo = console_(net, "R1", "en", "show ip eigrp topology");
  assert.match(topo, /^P 192\.168\.3\.0\/24, 1 successors, FD is 3328\n {8}via 10\.0\.12\.2 \(3328\/3072\), GigabitEthernet0\/0\n {8}via 10\.0\.13\.3 \(26112\/2816\), GigabitEthernet0\/1$/m);
  assert.match(topo, /^P 1\.1\.1\.1\/32, 1 successors, FD is 128256\n {8}via Connected, Loopback0$/m);
  assert.ok(net.check({ type: "eigrp-fs", device: "R1", prefix: "192.168.3.0/24", via: "10.0.13.3" }));
  assert.match(console_(net, "R1", "en", "show ip eigrp neighbors"), /^0 +10\.0\.12\.2 +Gi0\/0/m);
  applyConfig(net, "R3", ["router eigrp 100", "metric weights 0 1 1 1 0 0"]);
  assert.equal(net.eigrp().R3.nbrs.length, 0, "K values must match");
  applyConfig(net, "R3", ["router eigrp 100", "no metric weights"]);
  applyConfig(net, "R1", ["router eigrp 100", "variance 8"]);
  assert.match(console_(net, "R1", "en", "show ip route eigrp"), /D {5}192\.168\.3\.0\/24 \[90\/3328\] via 10\.0\.12\.2, 00:00:12, GigabitEthernet0\/0\n {21}\[90\/26112\] via 10\.0\.13\.3/);
  applyConfig(net, "R2", ["ip route 172.16.0.0 255.255.0.0 10.0.23.3", "router eigrp 100", "redistribute static"]);
  const ext = net.routes("R1").find((x) => x.net === ip2n("172.16.0.0"));
  assert.deepEqual([ext.code, ext.ad], ["D EX", 170]);
  applyConfig(net, "R1", ["router eigrp 100", "passive-interface g0/0"]);
  assert.ok(!net.check({ type: "eigrp-nbr", device: "R1", neighbor: "10.0.12.2" }), "no hellos on a passive interface");
  assert.ok(net.ping("PC1", "192.168.3.10").ok, "traffic falls back to the slow link");
});

test("EIGRP named mode: wide metrics and af-interface", () => {
  const net = eigrpNet(true);
  const r = net.routes("R1").find((x) => x.net === ip2n("10.0.23.0"));
  assert.equal(r.metric, 15360, "two gigabit hops: (655360 + 2 x 655360) / 128");
  assert.match(console_(net, "R1", "en", "show ip eigrp neighbors"), /^EIGRP-IPv4 VR\(LAB\) Address-Family Neighbors for AS\(100\)$/m);
  const s = new Session(net, "R1");
  for (const l of ["en", "conf t", "router eigrp LAB", "address-family ipv4 unicast autonomous-system 100", "af-interface g0/0"]) s.input(l);
  assert.equal(s.prompt(), "Router(config-router-af-interface)#");
  s.input("passive-interface");
  s.input("exit-af-interface");
  assert.equal(s.prompt(), "Router(config-router-af)#");
  assert.ok(!net.check({ type: "eigrp-nbr", device: "R1", neighbor: "10.0.12.2" }));
  assert.match(runningConfig(net, "R1"), /router eigrp LAB\n !\n address-family ipv4 unicast autonomous-system 100\n {2}!\n {2}af-interface GigabitEthernet0\/0\n {3}passive-interface\n {2}exit-af-interface/);
});

// ---------------------------------------------------------------- CLI realism
test("a line ending in ? shows help and hands the text back", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const s = new Session(net, "R1");
  s.input("en");
  s.input("conf t");
  const out = s.input("router ospf 1 ?");
  assert.match(out, /^ +vrf +VPN Routing\/Forwarding Instance\n +<cr>$/);
  assert.equal(s.retype, "router ospf 1 ");
  assert.equal(s.prompt(), "Router(config)#", "nothing ran");
  assert.match(s.input("?"), /^ +interface +Select an interface to configure$/m);
  assert.equal(s.retype, "");
  assert.match(s.input("show i?"), /% Unrecognized command/, "show isn't a config-mode command");
  s.input("end");
  assert.equal(s.input("show i?").trim(), "interfaces  inventory  ip  ipv6");
});

test("abbreviations are as ambiguous as on IOS", () => {
  const net = new Network({ devices: [R("R1"), S("SW1")], links: [] });
  assert.match(console_(net, "R1", "en", "c"), /% Ambiguous command:  "c"/);
  assert.match(console_(net, "R1", "en", "conf t", "int g0/0", "s"), /% Ambiguous command:  "s"/);
  assert.match(console_(net, "SW1", "en", "conf t", "int f0/1", "s"), /% Ambiguous command:  "s"/);
  const sw = new Session(net, "SW1");
  for (const l of ["en", "conf t", "int f0/1"]) sw.input(l);
  assert.equal(sw.help("s"), "service-policy  shutdown  spanning-tree  speed  storm-control  switchport");
  for (const cmd of ["sh run", "sh ip int br", "sh vlan br", "sh int trunk", "sh ip ro", "sh cdp nei", "sh mac add", "sh ver", "sh int status",
    "sh spanning-tree", "sh etherchannel sum", "sh port-security", "sh start", "terminal length 0", "wr"]) {
    assert.doesNotMatch(console_(net, "SW1", "en", cmd), /% (Invalid|Ambiguous|Incomplete)/, cmd);
  }
  for (const cmd of ["sh ip proto", "sh standby br", "sh ip nat tr", "sh ipv6 int br", "sh ip eigrp nei", "sh ip ospf nei", "sh track", "copy run start"]) {
    const out = console_(net, "R1", "en", cmd, "");
    assert.doesNotMatch(out, /% (Invalid|Ambiguous|Incomplete)/, cmd);
  }
});

test("Tab completes interface names and leaves ambiguous words alone", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const s = new Session(net, "R1");
  s.input("en");
  s.input("conf t");
  assert.equal(s.complete("int g0"), "int GigabitEthernet0");
  assert.equal(s.complete("int g0/1"), "int GigabitEthernet0/1");
  assert.equal(s.complete("s"), "s", "service, snmp-server and others start with s");
  assert.equal(s.complete("ipv6 rou"), "ipv6 rou", "route and router");
  assert.equal(s.complete("ipv6 uni"), "ipv6 unicast-routing ");
});

test("help texts and ranges for the new commands", () => {
  const net = new Network({ devices: [R("R1"), S("SW1")], links: [] });
  const r = new Session(net, "R1");
  for (const l of ["en", "conf t", "int g0/0"]) r.input(l);
  assert.match(r.help("standby "), /<0-4095> +group number[\s\S]*ip +Enable HSRP and set the virtual IP address/);
  assert.match(r.help("ipv6 address "), /X:X:X:X::X\/<0-128> +IPv6 prefix/);
  assert.match(r.help("ipv6 address 2001:db8::1/64 "), /eui-64 +Use eui-64 interface identifier[\s\S]*<cr>/);
  assert.match(r.help("speed "), /1000 +Force 1000 Mbps operation/);
  r.input("exit");
  assert.match(r.help("router eigrp "), /<1-65535> +Autonomous System\n +WORD +EIGRP Virtual-Instance Name/);
  assert.match(r.help("ip nat inside source "), /list +Specify access list describing local addresses\n +static +Specify static local->global mapping/);
  const w = new Session(net, "SW1");
  for (const l of ["en", "conf t", "int f0/1"]) w.input(l);
  assert.match(w.help("channel-group 1 mode "), /active +Enable LACP unconditionally[\s\S]*desirable +Enable PAgP unconditionally/);
  assert.match(w.help("switchport port-security mac-address "), /H\.H\.H +48 bit mac address\n +sticky/);
  assert.match(w.help("spanning-tree "), /bpduguard[\s\S]*portfast/);
});

test("secondary addresses are connected and routable", () => {
  const net = new Network({ devices: [R("R1"), P("A"), P("B")], links: [["R1", G(0), "A", "eth0"], ["R1", G(1), "B", "eth0"]] });
  applyConfig(net, "R1", ["int g0/0", "ip address 10.0.0.1 255.255.255.0", "ip address 10.0.1.1 255.255.255.0 secondary", "no shut",
    "int g0/1", "ip address 10.9.0.1 255.255.255.0", "no shut"]);
  applyConfig(net, "A", ["ip 10.0.1.10/24 10.0.1.1"]);
  applyConfig(net, "B", ["ip 10.9.0.10/24 10.9.0.1"]);
  assert.ok(net.ping("A", "10.9.0.10").ok, "a host in the secondary subnet uses the secondary address as its gateway");
  assert.ok(net.routes("R1").some((r) => r.code === "C" && r.net === ip2n("10.0.1.0")));
  assert.match(console_(net, "R1", "en", "show ip int brief"), /^GigabitEthernet0\/0 +10\.0\.0\.1 /m);
  assert.match(runningConfig(net, "R1"), / ip address 10\.0\.1\.1 255\.255\.255\.0 secondary\n ip address 10\.0\.0\.1 255\.255\.255\.0/);
  assert.match(console_(net, "R1", "en", "conf t", "int g0/0", "no ip address 10.0.0.1 255.255.255.0"), /Must delete secondary before deleting primary/);
  assert.match(console_(net, "R1", "en", "conf t", "int g0/1", "ip address 10.0.1.5 255.255.255.0"), /% 10\.0\.1\.0 overlaps with GigabitEthernet0\/0/);
});

test("extended ping, debug ip icmp, clock set and other exec commands", () => {
  const net = triangle();
  const s = new Session(net, "R1");
  s.input("en");
  for (const a of ["ping", "", "3.3.3.3", "2", "", "", "y", "lo0", "", "", "", "", ""]) s.input(a);
  assert.equal(s.prompt(), "Sweep range of sizes [n]: ");
  assert.match(s.input(""), /Sending 2, 100-byte ICMP Echos to 3\.3\.3\.3[\s\S]*Packet sent with a source address of 1\.1\.1\.1/);
  const r3 = new Session(net, "R3");
  r3.input("en");
  assert.match(r3.input("debug ip icmp"), /ICMP packet debugging is on/);
  const r1 = new Session(net, "R1");
  r1.input("en");
  r1.input("ping 3.3.3.3 repeat 1");
  assert.match(r1.events.R3.join("\n"), /ICMP: echo reply sent, src 3\.3\.3\.3, dst 10\.0\.13\.1/);
  assert.match(r3.input("undebug all"), /All possible debugging has been turned off/);
  r3.input("clock set 10:30:00 1 Jan 2030");
  assert.match(r3.input("show clock"), /^\*Jan {2}1 10:30:0\d\.\d{3} UTC$/);
  assert.match(console_(net, "R1", "en", "terminal monitor"), /% Console already monitors/);
  assert.match(console_(net, "R1", "en", "show inventory"), /PID: IOSv/);
  assert.match(console_(net, "R1", "en", "show ip route 3.3.3.3"), /Routing entry for 3\.3\.3\.3\/32\n {2}Known via "ospf 1", distance 110, metric 2/);
  const c = console_(net, "R1", "en", "conf t", "snmp-server community public RO", "ntp server 10.0.12.2", "logging host 10.0.12.2", "int g0/2", "speed 100", "duplex full");
  assert.doesNotMatch(c, /%/);
  const run = runningConfig(net, "R1");
  for (const l of ["snmp-server community public RO", "ntp server 10.0.12.2", "logging host 10.0.12.2", " speed 100", " duplex full"]) assert.ok(run.includes("\n" + l + "\n"), l);
});

test("ARP: routers glean the sender, only a router waiting on ARP loses the first packet", () => {
  const net = new Network({ devices: [R("R1"), R("R2"), S("SW1"), P("PC1"), P("PC2"), P("C")],
    links: [["R1", G(0), "SW1", G(1)], ["SW1", F(1), "PC1", "eth0"], ["SW1", F(2), "PC2", "eth0"], ["R1", G(1), "R2", G(0)], ["R2", G(1), "C", "eth0"]] });
  applyConfig(net, "R1", ["int g0/0", "ip add 192.168.1.1 255.255.255.0", "no shut", "int g0/1", "ip add 10.0.0.1 255.255.255.0", "no shut", "ip route 10.2.0.0 255.255.255.0 10.0.0.2"]);
  applyConfig(net, "R2", ["int g0/0", "ip add 10.0.0.2 255.255.255.0", "no shut", "int g0/1", "ip add 10.2.0.1 255.255.255.0", "no shut", "ip route 0.0.0.0 0.0.0.0 10.0.0.1"]);
  applyConfig(net, "PC1", ["ip 192.168.1.10/24 192.168.1.1"]);
  applyConfig(net, "PC2", ["ip 192.168.1.11/24 192.168.1.1"]);
  applyConfig(net, "C", ["ip 10.2.0.10/24 10.2.0.1"]);
  assert.match(console_(net, "PC1", "ping 192.168.1.1 -c 1"), /84 bytes from 192\.168\.1\.1 icmp_seq=1/, "the gateway learned PC1 from its ARP request");
  assert.match(console_(net, "PC1", "ping 10.2.0.10 -c 2"), /icmp_seq=1 timeout\n84 bytes from 10\.2\.0\.10 icmp_seq=2/, "R1 and R2 had to ARP on the way");
  assert.match(console_(net, "PC2", "ping 10.2.0.10 -c 1"), /84 bytes from 10\.2\.0\.10 icmp_seq=1/, "the remote path is already resolved");
  const s = new Session(net, "R1");
  s.input("en");
  s.input("clear arp-cache");
  assert.match(s.input("ping 192.168.1.11"), /^\.!!!!$/m, "a router pinging an un-ARPed host loses the first echo");
});

test("more IOS show commands and the do-ambiguity message", () => {
  const net = twoLinks();
  applyConfig(net, "SW1", ["interface range f0/23 - 24", "channel-group 1 mode active"]);
  applyConfig(net, "SW2", ["interface range f0/23 - 24", "channel-group 1 mode passive"]);
  assert.match(console_(net, "SW1", "en", "show etherchannel 1 port-channel"), /Port-channel: Po1 {4}\(Primary Aggregator\)[\s\S]*Number of ports = 2[\s\S]*Fa0\/23 +Active/);
  assert.match(console_(net, "SW1", "en", "show etherchannel detail"), /Port state {4}= Up Mstr Assoc In-Bndl/);
  assert.match(console_(net, "SW1", "en", "show lacp neighbor"), /^Fa0\/23 +SP +32768 +0cd5\.0100\.8000/m);
  assert.match(console_(net, "SW1", "en", "show interfaces f0/1 status"), /^Fa0\/1 +connected +1 /m);
  assert.doesNotMatch(console_(net, "SW1", "en", "show interfaces f0/1 status"), /Fa0\/2 /);
  const tri = triangleSw();
  assert.match(console_(tri, "SW3", "en", "show spanning-tree blockedports"), /^VLAN0001 +Gi0\/2$[\s\S]*: 1$/m);
  assert.match(console_(tri, "SW2", "en", "show spanning-tree root"), /^VLAN0001 +32769 0cd5\.0000\.8000 +4 +2 +20 +15 {2}Gi0\/1$/m);
  assert.match(console_(tri, "SW2", "en", "show spanning-tree interface g0/1"), /^VLAN0001 +Root FWD 4 +128\.25 +P2p$/m);
  assert.match(console_(tri, "SW2", "en", "conf t", "do c"), /% Ambiguous command: {2}"c"/);
});

test("HSRP authentication must match, and the extra standby options render", () => {
  const net = hsrpNet();
  applyConfig(net, "R1", ["int g0/0", "standby 10 ip 192.168.10.1", "standby 10 priority 110", "standby 10 preempt", "standby 10 authentication md5 key-string S3cret",
    "standby 10 name LAN-GW", "standby 10 mac-address 0000.0c00.0001"]);
  applyConfig(net, "R2", ["int g0/0", "standby 10 ip 192.168.10.1", "standby 10 authentication text other"]);
  const st = (r) => net.devs[r].rt.hsrp["GigabitEthernet0/0|10"].state;
  assert.deepEqual([st("R1"), st("R2")], ["Active", "Active"], "different keys: neither hears the other");
  applyConfig(net, "R2", ["int g0/0", "standby 10 authentication md5 key-string S3cret"]);
  assert.deepEqual([st("R1"), st("R2")], ["Active", "Standby"]);
  const run = runningConfig(net, "R1");
  for (const l of [" standby 10 authentication md5 key-string S3cret", " standby 10 name LAN-GW", " standby 10 mac-address 0000.0c00.0001"]) assert.ok(run.includes(l), l);
  console_(net, "PC1", "ping 192.168.10.1");
  assert.match(console_(net, "PC1", "arp"), /00:00:0c:00:00:01 {2}192\.168\.10\.1/);
  const s = new Session(net, "R1");
  for (const l of ["en", "conf t", "int g0/0"]) s.input(l);
  assert.match(s.help("standby 10 "), /authentication[\s\S]*follow[\s\S]*mac-address[\s\S]*name/);
  assert.match(s.help("standby version "), /<1-2> +Version number/);
});

test("a pasted config with ! comments and indented ! lines applies cleanly", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  applyConfig(net, "R1", ["!", "hostname R1", " !", "interface g0/0", " ip address 10.0.0.1 255.255.255.0", "!"]);
  assert.equal(net.devs.R1.cfg.hostname, "R1");
});

test("older saved states load with the new settings filled in", () => {
  const net = triangle();
  console_(net, "R1", "en", "write memory");
  const old = JSON.parse(JSON.stringify(net.toJSON()));
  for (const d of Object.values(old.devices)) {
    for (const c of [d.cfg, d.startup].filter(Boolean)) {
      for (const k of ["nat", "eigrp", "tracks", "ipv6Routing", "routes6", "ospf6", "snmp", "ntp", "logHosts"]) delete c[k];
      for (const i of Object.values(c.intfs)) for (const k of ["nat", "standby", "ipv6", "ospf6", "delay", "secondary", "speed", "duplex"]) delete i[k];
    }
  }
  const copy = new Network(net.spec, sortKeys(old));
  assert.ok(copy.check({ type: "saved", device: "R1" }));
  assert.ok(copy.ping("R1", "3.3.3.3").ok);
  assert.equal(runningConfig(copy, "R1"), runningConfig(net, "R1"));
});


test("sameData ignores key order but not values", () => {
  assert.ok(sameData({ a: 1, b: [1, { c: 2, d: null }] }, { b: [1, { d: null, c: 2 }], a: 1 }));
  assert.ok(!sameData({ a: 1 }, { a: 1, b: 2 }));
  assert.ok(!sameData([1, 2], [2, 1]));
  assert.ok(!sameData({ a: null }, { a: 0 }));
});

test("state survives a save and restore", () => {
  const net = triangle();
  console_(net, "R1", "en", "write memory");
  const copy = new Network(net.spec, sortKeys(JSON.parse(JSON.stringify(net.toJSON()))));
  assert.equal(runningConfig(copy, "R1"), runningConfig(net, "R1"));
  assert.ok(copy.check({ type: "saved", device: "R1" }));
  assert.ok(copy.ping("R1", "3.3.3.3").ok);
});

// ---------------------------------------------------------------- the labs
const replayable = (line) => !/^(Building configuration|Current configuration|!|version |end$|no aaa new-model|enable secret 5|username .* secret 5|banner (motd|login|exec))/.test(line)
  && line.trim() !== "";

test("labs are well formed", () => {
  const ids = new Set();
  for (const lab of labs) {
    assert.ok(!ids.has(lab.id), "duplicate lab id " + lab.id);
    ids.add(lab.id);
    for (const k of ["title", "topic", "summary", "intro", "devices", "links", "initial", "tasks", "solution", "height"]) {
      assert.ok(lab[k] !== undefined, `${lab.id} is missing ${k}`);
    }
    new Network(lab); // throws on bad links
    for (const t of lab.tasks) assert.ok(t.title && t.text && t.hint && t.checks.length, `${lab.id}: incomplete task`);
  }
});

// The page gets the spec through JSON with sorted keys, so a lab must not depend on key order.
for (const lab of labs) {
  test(`lab ${lab.id}: works the same from a key-sorted spec`, () => {
    const spec = sortKeys(JSON.parse(JSON.stringify(lab)));
    const net = buildLab(spec, null);
    for (const t of spec.tasks) {
      assert.ok(!t.checks.every((c) => net.check(c)), `${lab.id}: "${t.title}" is already solved before you start (sorted spec)`);
    }
    for (const [dev, lines] of Object.entries(lab.solution)) applyConfig(net, dev, lines);
    for (const t of spec.tasks) {
      for (const c of t.checks) assert.ok(net.check(c), `${lab.id}: "${t.title}" check ${JSON.stringify(c)} fails after the solution (sorted spec)`);
    }
  });
}

for (const lab of labs) {
  test(`lab ${lab.id}: no task starts solved, the solution solves them all, and state round-trips`, () => {
    const net = buildLab(lab, null);
    for (const t of lab.tasks) {
      assert.ok(!t.checks.every((c) => net.check(c)), `${lab.id}: "${t.title}" is already solved before you start`);
    }
    for (const [dev, lines] of Object.entries(lab.solution)) applyConfig(net, dev, lines);
    for (const t of lab.tasks) {
      for (const c of t.checks) assert.ok(net.check(c), `${lab.id}: "${t.title}" check ${JSON.stringify(c)} fails after the solution`);
    }
    const restored = buildLab(lab, sortKeys(JSON.parse(JSON.stringify(net.toJSON()))));
    for (const t of lab.tasks) for (const c of t.checks) assert.ok(restored.check(c), `${lab.id}: restored state loses ${JSON.stringify(c)}`);
    // The running-config the simulator prints can be pasted back in to rebuild the same device.
    for (const d of lab.devices) {
      if (d.type === "pc") continue;
      const text = runningConfig(net, d.name);
      const fresh = new Network(lab);
      // running-config never prints "no shutdown", so a pasted config leaves router ports shut
      // unless you add it, exactly as on real IOS; a later " shutdown" in the block re-shuts it.
      const lines = text.split("\n").filter(replayable).flatMap((l) => (l.startsWith("interface ") ? [l, " no shutdown"] : [l]));
      applyConfig(fresh, d.name, lines.map((l) => l.replace(/^(.*password) 7 (\S+)$/, (m, p, enc) => p + " " + type7decode(enc))));
      const strip = (t) => t.split("\n").filter(replayable).join("\n");
      assert.equal(strip(runningConfig(fresh, d.name)), strip(text), `${lab.id}: ${d.name} running-config doesn't replay`);
    }
  });
}


test("help text fits the command it appears in", () => {
  const net = new Network({ devices: [R("R1"), S("SW1")], links: [] });
  const r = new Session(net, "R1");
  r.input("en");
  assert.match(r.help("configure "), /terminal +Configure from the terminal/);
  assert.match(r.help(""), /clock +Manage the system clock/);
  assert.match(r.help("show ip route "), /static +Static routes/);
  assert.match(r.help("undebug "), /all +Disable all debugging/);
  r.input("conf t");
  assert.match(r.help(""), /clock +Configure time-of-day clock/);
  assert.match(r.help("ip domain "), /name +Define the default domain name/);
  assert.match(r.help("logging "), /host +Set syslog server IP address and parameters/);
  r.input("int g0/0");
  assert.match(r.help("ip address 10.0.0.1 255.255.255.0 "), /secondary +Make this IP address a secondary address\n +<cr>/);
  assert.match(r.help("cdp "), /enable +Enable CDP on interface/);
  r.input("exit");
  r.input("router ospf 1");
  assert.match(r.help(""), /network +Enable routing on an IP network/);
  r.input("exit");
  r.input("ip dhcp pool LAN");
  assert.match(r.help(""), /network +Network number and mask/);
  r.input("exit");
  r.input("line vty 0 4");
  assert.match(r.help("transport input "), /all +All protocols[\s\S]*none +No protocols[\s\S]*ssh +TCP\/IP SSH protocol/);
  const w = new Session(net, "SW1");
  for (const l of ["en", "conf t"]) w.input(l);
  assert.match(w.help("spanning-tree vlan 1 "), /priority +Set the bridge priority for the spanning tree[\s\S]*root/);
  assert.match(w.help("spanning-tree vlan 1 root "), /secondary +Configure this switch as secondary root for this spanning tree/);
  w.input("int f0/1");
  assert.match(w.help("switchport mode "), /access +Set trunking mode to ACCESS unconditionally[\s\S]*trunk +Set trunking mode to TRUNK unconditionally/);
  assert.match(w.help("switchport access "), /vlan +Set VLAN when interface is in access mode/);
});


// ---------------------------------------------------------------- VRF, tunnels, IPsec, DMVPN
const dq = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
const wan = (extraR1 = [], extraR2 = []) => {
  const net = new Network({ devices: [R("R1"), R("R2"), R("ISP"), P("PC1"), P("PC2")], links: [
    ["R1", "GigabitEthernet0/1", "ISP", "GigabitEthernet0/0"], ["R2", "GigabitEthernet0/1", "ISP", "GigabitEthernet0/1"],
    ["R1", "GigabitEthernet0/0", "PC1", "eth0"], ["R2", "GigabitEthernet0/0", "PC2", "eth0"]] });
  applyConfig(net, "ISP", ["int g0/0", "ip add 203.0.113.2 255.255.255.252", "no shut", "int g0/1", "ip add 198.51.100.2 255.255.255.252", "no shut"]);
  applyConfig(net, "R1", ["int g0/0", "ip add 192.168.1.1 255.255.255.0", "no shut", "int g0/1", "ip add 203.0.113.1 255.255.255.252", "no shut", "exit",
    "ip route 0.0.0.0 0.0.0.0 203.0.113.2", ...extraR1]);
  applyConfig(net, "R2", ["int g0/0", "ip add 192.168.2.1 255.255.255.0", "no shut", "int g0/1", "ip add 198.51.100.1 255.255.255.252", "no shut", "exit",
    "ip route 0.0.0.0 0.0.0.0 198.51.100.2", ...extraR2]);
  applyConfig(net, "PC1", ["ip 192.168.1.10/24 192.168.1.1"]);
  applyConfig(net, "PC2", ["ip 192.168.2.10/24 192.168.2.1"]);
  return net;
};
const tun = (ip, dst, more = []) => ["interface tunnel 0", `ip address ${ip} 255.255.255.252`, "tunnel source g0/1", `tunnel destination ${dst}`, ...more, "exit"];

test("VRF-lite: overlapping addresses, per-VRF tables, OSPF per VRF, vrf ping and ARP", () => {
  const net = new Network({ devices: [R("R1"), R("R2"), P("A1"), P("B1"), P("A2"), P("B2")], links: [
    ["R1", "GigabitEthernet0/0", "A1", "eth0"], ["R1", "GigabitEthernet0/1", "B1", "eth0"], ["R1", "GigabitEthernet0/2", "R2", "GigabitEthernet0/2"],
    ["R2", "GigabitEthernet0/0", "A2", "eth0"], ["R2", "GigabitEthernet0/1", "B2", "eth0"]] });
  for (const [r, n] of [["R1", 1], ["R2", 2]]) {
    applyConfig(net, r, ["vrf definition RED", "rd 65000:1", "address-family ipv4", "exit-address-family", "exit", "ip vrf BLUE", "rd 65000:2", "exit",
      "int g0/0", "vrf forwarding RED", `ip add 10.${n}.${n}.1 255.255.255.0`, "no shut", "int g0/1", "ip vrf forwarding BLUE", `ip add 10.${n}.${n}.1 255.255.255.0`, "no shut",
      "int g0/2", "no shut", "int g0/2.10", "encapsulation dot1q 10", "vrf forwarding RED", `ip add 10.0.12.${n} 255.255.255.252`,
      "int g0/2.20", "encapsulation dot1q 20", "ip vrf forwarding BLUE", `ip add 10.0.12.${n} 255.255.255.252`,
      "router ospf 10 vrf RED", "network 10.0.0.0 0.255.255.255 area 0", "exit",
      n === 1 ? "ip route vrf BLUE 10.2.2.0 255.255.255.0 10.0.12.2" : "ip route vrf BLUE 10.1.1.0 255.255.255.0 10.0.12.1"]);
  }
  for (const [pc, ip, gw] of [["A1", "10.1.1.10", "10.1.1.1"], ["B1", "10.1.1.10", "10.1.1.1"], ["A2", "10.2.2.10", "10.2.2.1"], ["B2", "10.2.2.20", "10.2.2.1"]]) {
    applyConfig(net, pc, [`ip ${ip}/24 ${gw}`]);
  }
  assert.ok(net.check({ type: "route", device: "R1", vrf: "RED", prefix: "10.2.2.0/24", code: "O" }));
  assert.ok(net.check({ type: "route", device: "R1", vrf: "BLUE", prefix: "10.2.2.0/24", code: "S" }));
  assert.equal(net.routes("R1").length, 0, "the global table is empty");
  assert.ok(net.ping("A1", "10.2.2.10").ok && net.ping("B1", "10.2.2.20").ok);
  assert.ok(!net.ping("A1", "10.2.2.20").ok && !net.ping("B1", "10.2.2.10").ok, "VRFs don't leak into each other");
  const s = new Session(net, "R1");
  s.input("en");
  assert.match(s.input("ping vrf RED 10.2.2.10"), /Success rate is [1-9]/);
  assert.match(s.input("ping 10.2.2.10"), /Success rate is 0 percent/);
  assert.match(s.input("show ip route vrf RED"), /Routing Table: RED[\s\S]*O +10\.2\.2\.0\/24 \[110\/2\] via 10\.0\.12\.2/);
  assert.match(s.input("show ip vrf"), /BLUE +65000:2 +Gi0\/1/);
  assert.match(s.input("show vrf"), /RED +65000:1 +ipv4 +Gi0\/0/);
  assert.match(s.input("show ip arp vrf RED"), /10\.0\.12\.2 .*GigabitEthernet0\/2\.10/);
  assert.match(s.input("traceroute vrf BLUE 10.2.2.20"), / 1 10\.0\.12\.2 [\s\S]* 2 10\.2\.2\.20 /);
  assert.match(s.input("show ip ospf neighbor"), /GigabitEthernet0\/2\.10/);
  s.input("conf t");
  s.input("int g0/0");
  assert.match(s.input("vrf forwarding BLUE"), /% VRF BLUE not configured\./, "BLUE is an ip vrf: it takes ip vrf forwarding");
  assert.match(s.input("ip vrf forwarding BLUE"), /% Interface GigabitEthernet0\/0 IPv4 disabled and address\(es\) removed due to enabling VRF BLUE/);
  assert.equal(net.devs.R1.cfg.intfs["GigabitEthernet0/0"].ip, null);
  assert.match(s.input("ip address 10.1.1.1 255.255.255.0"), /overlaps with GigabitEthernet0\/1/, "same VRF, same subnet");
  s.input("end");
  assert.match(runningConfig(net, "R1"), /^interface GigabitEthernet0\/2\.10\n encapsulation dot1Q 10\n vrf forwarding RED\n ip address 10\.0\.12\.1/m);
  assert.match(runningConfig(net, "R1"), /^router ospf 10 vrf RED\n network 10\.0\.0\.0 0\.255\.255\.255 area 0$/m);
  assert.match(runningConfig(net, "R1"), /^ip route vrf BLUE 10\.2\.2\.0 255\.255\.255\.0 10\.0\.12\.2$/m);
});

test("GRE: up when the destination is routable, OSPF over it, recursive routing pulls it down", () => {
  const net = wan(tun("172.16.0.1", "198.51.100.1"), [...tun("172.16.0.2", "203.0.113.1"), "router ospf 1", "network 0.0.0.0 255.255.255.255 area 0"]);
  assert.ok(net.ifUp("R1", "Tunnel0") && net.ifUp("R2", "Tunnel0"));
  assert.ok(net.ping("R1", "172.16.0.2").ok);
  assert.equal(net.bandwidth(net.devs.R1, "Tunnel0"), 100);
  const s = new Session(net, "R1");
  s.input("en");
  s.input("conf t");
  s.input("router ospf 1");
  s.input("network 192.168.1.0 0.0.0.255 area 0");
  const out = s.input("network 172.16.0.0 0.0.0.3 area 0");
  assert.match(out, /%TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing/);
  assert.equal(net.ifState("R1", "Tunnel0").proto, "down");
  assert.match(s.input("do show interfaces tunnel 0"), /Tunnel linestate evaluation down - recursive routing/);
  applyConfig(net, "R2", ["router ospf 1", "no network 0.0.0.0 255.255.255.255 area 0", "network 172.16.0.0 0.0.0.3 area 0", "network 192.168.2.0 0.0.0.255 area 0"]);
  assert.ok(net.ifUp("R1", "Tunnel0"));
  assert.ok(net.check({ type: "route", device: "R1", prefix: "192.168.2.0/24", code: "O", via: "172.16.0.2" }));
  assert.match(s.input("do show ip ospf interface brief"), /Tu0 +1 +0 +172\.16\.0\.1\/30 +1000 +P2P/);
  assert.deepEqual(net.trace("PC1", "192.168.2.10").map((h) => h.ip && dq(h.ip)), ["192.168.1.1", "172.16.0.2", "192.168.2.10"]);
  // The underlay is still ordinary IP: an ACL that drops GRE breaks the adjacency, though the tunnel stays up/up.
  applyConfig(net, "ISP", ["access-list 101 deny gre any any", "access-list 101 permit ip any any", "int g0/0", "ip access-group 101 in"]);
  assert.ok(net.ifUp("R1", "Tunnel0") && !net.check({ type: "ospf-nbr", device: "R1", neighbor: "198.51.100.1" }));
  assert.ok(!net.ping("PC1", "192.168.2.10").ok);
  // A tunnel nobody terminates is up/up too, but carries nothing; with keepalives it goes down.
  applyConfig(net, "ISP", ["int g0/0", "no ip access-group 101 in"]);
  applyConfig(net, "R2", ["int tu0", "tunnel destination 203.0.113.9"]);
  assert.ok(net.ifUp("R1", "Tunnel0") && !net.ping("R1", "172.16.0.2").ok);
  applyConfig(net, "R1", ["int tu0", "keepalive 5 3"]);
  assert.ok(!net.ifUp("R1", "Tunnel0"));
});

test("IPsec crypto map: encrypts interesting traffic, mismatches stop it, counters and shows", () => {
  const side = (peer, l, r) => ["crypto isakmp policy 10", "encr aes 256", "hash sha256", "authentication pre-share", "group 14", "exit",
    `crypto isakmp key K3y address ${peer}`, "crypto ipsec transform-set TS esp-aes 256 esp-sha-hmac", "exit",
    `access-list 110 permit ip ${l} 0.0.0.255 ${r} 0.0.0.255`, "crypto map VPN 10 ipsec-isakmp", `set peer ${peer}`, "set transform-set TS", "match address 110", "exit",
    "int g0/1", "crypto map VPN"];
  const net = wan(side("198.51.100.1", "192.168.1.0", "192.168.2.0"), side("203.0.113.1", "192.168.2.0", "192.168.1.0"));
  assert.ok(net.check({ type: "ping", from: "PC1", to: "192.168.2.10", encrypted: true }));
  assert.ok(net.check({ type: "ipsec-sa", device: "R1", peer: "198.51.100.1" }));
  assert.ok(net.ping("R1", "198.51.100.1").ok && !net.ping("R1", "198.51.100.1").crypto, "traffic the ACL doesn't match leaves in the clear");
  const pc = new Session(net, "PC1");
  pc.input("ping 192.168.2.10 -c 3");
  const s = new Session(net, "R1");
  s.input("en");
  assert.match(s.input("show crypto isakmp sa"), /198\.51\.100\.1 +203\.0\.113\.1 +QM_IDLE +\d+ ACTIVE/);
  assert.match(s.input("show crypto ipsec sa"), /#pkts encaps: 3,[\s\S]*#pkts decaps: 3,/);
  assert.match(s.input("show crypto map"), /Crypto Map IPv4 "VPN" 10 ipsec-isakmp\n\tPeer = 198\.51\.100\.1/);
  assert.match(s.input("show crypto ipsec transform-set"), /Transform set TS: \{ esp-aes 256 esp-sha-hmac  \}/);
  assert.match(runningConfig(net, "R1"), /^crypto isakmp policy 10\n encr aes 256\n hash sha256\n authentication pre-share\n group 14\ncrypto isakmp key K3y address 198\.51\.100\.1$/m);
  // Wrong pre-shared key: phase 1 fails and traffic stops.
  applyConfig(net, "R2", ["crypto isakmp key WRONG address 203.0.113.1"]);
  assert.ok(!net.ping("PC1", "192.168.2.10").ok && !net.check({ type: "ipsec-sa", device: "R1", peer: "198.51.100.1" }));
  s.input("clear crypto isakmp");
  pc.input("ping 192.168.2.10 -c 1");
  assert.match(s.input("show crypto isakmp sa"), /MM_NO_STATE/);
  applyConfig(net, "R2", ["crypto isakmp key K3y address 203.0.113.1"]);
  // Transform sets that don't match: phase 1 is fine, phase 2 fails.
  applyConfig(net, "R2", ["crypto ipsec transform-set TS esp-3des esp-md5-hmac", "exit"]);
  assert.ok(!net.ping("PC1", "192.168.2.10").ok);
  applyConfig(net, "R2", ["crypto ipsec transform-set TS esp-aes 256 esp-sha-hmac", "exit"]);
  assert.ok(net.ping("PC1", "192.168.2.10").ok);
  // ACLs that aren't mirror images.
  applyConfig(net, "R2", ["no access-list 110", "access-list 110 permit ip 192.168.2.0 0.0.0.255 10.0.0.0 0.255.255.255"]);
  assert.ok(!net.ping("PC1", "192.168.2.10").ok);
  applyConfig(net, "R2", ["no access-list 110", "access-list 110 permit ip 192.168.2.0 0.0.0.255 192.168.1.0 0.0.0.255"]);
  assert.ok(net.ping("PC1", "192.168.2.10").ok);
  // IKE needs UDP 500 across the internet.
  applyConfig(net, "ISP", ["access-list 120 deny udp any any eq isakmp", "access-list 120 permit ip any any", "int g0/1", "ip access-group 120 in"]);
  assert.ok(!net.ping("PC1", "192.168.2.10").ok);
  applyConfig(net, "ISP", ["int g0/1", "no ip access-group 120 in"]);
  // Only one side encrypting: the other drops the cleartext it expected to arrive protected.
  applyConfig(net, "R1", ["int g0/1", "no crypto map"]);
  assert.ok(!net.ping("PC1", "192.168.2.10").ok);
});

test("GRE over IPsec and IPsec VTIs: protection must match on both ends", () => {
  const side = (peer, ip, key, mode = []) => ["crypto isakmp policy 10", "encr aes", "authentication pre-share", "group 14", "exit",
    `crypto isakmp key ${key} address ${peer}`, "crypto ipsec transform-set TS esp-aes esp-sha-hmac", "mode transport", "exit",
    "crypto ipsec profile P", "set transform-set TS", "exit", ...tun(ip, peer, [...mode, "tunnel protection ipsec profile P"])];
  let net = wan(side("198.51.100.1", "172.16.0.1", "k"), side("203.0.113.1", "172.16.0.2", "k"));
  assert.ok(net.ping("R1", "172.16.0.2").ok && net.ping("R1", "172.16.0.2").crypto);
  net = wan(side("198.51.100.1", "172.16.0.1", "k"), side("203.0.113.1", "172.16.0.2", "x"));
  assert.ok(net.ifUp("R1", "Tunnel0") && !net.ping("R1", "172.16.0.2").ok, "GRE stays up/up, IPsec fails");
  net = wan(side("198.51.100.1", "172.16.0.1", "k", ["tunnel mode ipsec ipv4"]), side("203.0.113.1", "172.16.0.2", "x", ["tunnel mode ipsec ipv4"]));
  assert.ok(!net.ifUp("R1", "Tunnel0"), "a VTI is only up with an IPsec SA");
  applyConfig(net, "R2", ["crypto isakmp key k address 203.0.113.1"]);
  assert.ok(net.ifUp("R1", "Tunnel0") && net.ping("R1", "172.16.0.2").crypto);
  net = wan(side("198.51.100.1", "172.16.0.1", "k"), tun("172.16.0.2", "203.0.113.1"));
  assert.ok(!net.ping("R1", "172.16.0.2").ok, "protected on one end only");
});

test("DMVPN: registration, multicast, phase 2 next hops and resolution, phase 3 redirects and shortcuts", () => {
  const build = (phase) => {
    const net = new Network({ devices: [R("HUB"), R("S1"), R("S2"), R("INET"), P("PC1"), P("PC2")], links: [
      ["HUB", "GigabitEthernet0/1", "INET", "GigabitEthernet0/0"], ["S1", "GigabitEthernet0/1", "INET", "GigabitEthernet0/1"],
      ["S2", "GigabitEthernet0/1", "INET", "GigabitEthernet0/2"], ["S1", "GigabitEthernet0/0", "PC1", "eth0"], ["S2", "GigabitEthernet0/0", "PC2", "eth0"]] });
    applyConfig(net, "INET", ["int g0/0", "ip add 100.64.0.254 255.255.255.0", "no shut", "int g0/1", "ip add 100.64.1.254 255.255.255.0", "no shut",
      "int g0/2", "ip add 100.64.2.254 255.255.255.0", "no shut"]);
    for (const [r, n] of [["HUB", 0], ["S1", 1], ["S2", 2]]) {
      applyConfig(net, r, ["int g0/1", `ip add 100.64.${n}.1 255.255.255.0`, "no shut", "int g0/0", `ip add 10.${n}.${n}.1 255.255.255.0`, "no shut", "exit",
        `ip route 0.0.0.0 0.0.0.0 100.64.${n}.254`, "interface tunnel 0", `ip address 172.16.0.${n + 1} 255.255.255.0`, "tunnel source g0/1",
        "tunnel mode gre multipoint", "ip nhrp network-id 1",
        ...(n === 0 ? ["ip nhrp map multicast dynamic", "no ip split-horizon eigrp 100", ...(phase === 2 ? ["no ip next-hop-self eigrp 100"] : ["ip nhrp redirect"])]
          : ["ip nhrp nhs 172.16.0.1 nbma 100.64.0.1 multicast", ...(phase === 3 ? ["ip nhrp shortcut"] : [])]),
        "router eigrp 100", "network 172.16.0.0 0.0.0.255", `network 10.${n}.${n}.0 0.0.0.255`]);
    }
    applyConfig(net, "PC1", ["ip 10.1.1.10/24 10.1.1.1"]);
    applyConfig(net, "PC2", ["ip 10.2.2.10/24 10.2.2.1"]);
    return net;
  };
  const hops = (net) => net.trace("PC1", "10.2.2.10").map((h) => h.ip && dq(h.ip));
  let net = build(2);
  assert.ok(net.check({ type: "nhrp-peer", device: "HUB", peer: "172.16.0.2", registered: true }));
  assert.ok(net.check({ type: "eigrp-nbrs", device: "HUB", count: 2 }));
  assert.ok(net.check({ type: "route", device: "S1", prefix: "10.2.2.0/24", code: "D", via: "172.16.0.3" }), "phase 2 keeps the spoke as next hop");
  assert.deepEqual(hops(net), ["10.1.1.1", "172.16.0.1", "172.16.0.3", "10.2.2.10"], "unresolved: via the hub");
  new Session(net, "PC1").input("ping 10.2.2.10 -c 2");
  assert.deepEqual(hops(net), ["10.1.1.1", "172.16.0.3", "10.2.2.10"], "resolved: spoke to spoke");
  const s = new Session(net, "S1");
  s.input("en");
  assert.match(s.input("show dmvpn"), /Type:Spoke, NHRP Peers:2,[\s\S]*100\.64\.2\.1 +172\.16\.0\.3 +UP .* D/);
  assert.match(s.input("show ip nhrp"), /172\.16\.0\.3\/32 via 172\.16\.0\.3[\s\S]*NBMA address: 100\.64\.2\.1/);
  s.input("clear ip nhrp");
  assert.deepEqual(hops(net), ["10.1.1.1", "172.16.0.1", "172.16.0.3", "10.2.2.10"]);
  net = build(3);
  assert.ok(net.check({ type: "route", device: "S1", prefix: "10.2.2.0/24", code: "D", via: "172.16.0.1" }), "phase 3: the hub stays next hop");
  new Session(net, "PC1").input("ping 10.2.2.10 -c 2");
  assert.ok(net.check({ type: "nhrp-shortcut", device: "S1", prefix: "10.2.2.0/24" }));
  assert.deepEqual(hops(net), ["10.1.1.1", "172.16.0.3", "10.2.2.10"]);
  const t = new Session(net, "S1");
  t.input("en");
  assert.match(t.input("show ip route"), /D   % +10\.2\.2\.0\/24 \[90\/\d+\] via 172\.16\.0\.3, 00:00:12, Tunnel0/);
  // NHRP authentication must match for a spoke to register.
  applyConfig(net, "HUB", ["int tu0", "ip nhrp authentication HUBKEY"]);
  assert.ok(!net.check({ type: "nhrp-peer", device: "HUB", peer: "172.16.0.2", registered: true }));
  assert.ok(!net.check({ type: "eigrp-nbrs", device: "HUB", count: 1 }));
});

test("help for the VPN commands", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const s = new Session(net, "R1");
  for (const l of ["en", "conf t"]) s.input(l);
  assert.match(s.help(""), /vrf +Configure a VRF/);
  assert.match(s.help("crypto "), /isakmp +Configure ISAKMP policy[\s\S]*map +Enter a crypto map/);
  assert.match(s.help("crypto ipsec transform-set T esp-aes "), /256 +256 bit keys\.[\s\S]*esp-sha-hmac +ESP transform using HMAC-SHA auth/);
  s.input("crypto isakmp policy 10");
  assert.match(s.help("group "), /14 +Diffie-Hellman group 14 \(2048 bit\)/);
  assert.match(s.help("authentication "), /pre-share +Pre-Shared Key/);
  s.input("exit");
  s.input("int tunnel 1");
  assert.equal(s.prompt(), "Router(config-if)#");
  assert.match(s.help("tunnel mode "), /gre +generic route encapsulation protocol[\s\S]*ipsec +IPSec tunnel encapsulation/);
  assert.match(s.help("ip nhrp "), /network-id +NBMA network identifier[\s\S]*nhs +Specify a next hop server/);
  s.input("exit");
  s.input("int g0/0");
  assert.doesNotMatch(s.help(""), /tunnel /, "tunnel commands only exist on tunnel interfaces");
  assert.match(s.help(""), /vrf +VPN Routing\/Forwarding parameters on the interface/);
});

// ---------------------------------------------------------------- BGP
// Three routers in a row: A (AS 65001) - B (65002) - C (65003), each with a LAN on Loopback1.
function bgpChain() {
  const net = new Network({ devices: [R("A"), R("B"), R("C")], links: [["A", G(0), "B", G(0)], ["B", G(1), "C", G(0)]] });
  applyConfig(net, "A", ["int g0/0", "ip add 10.0.12.1 255.255.255.252", "no shut", "int lo1", "ip add 172.16.1.1 255.255.255.0"]);
  applyConfig(net, "B", ["int g0/0", "ip add 10.0.12.2 255.255.255.252", "no shut", "int g0/1", "ip add 10.0.23.1 255.255.255.252", "no shut",
    "int lo0", "ip add 2.2.2.2 255.255.255.255"]);
  applyConfig(net, "C", ["int g0/0", "ip add 10.0.23.2 255.255.255.252", "no shut", "int lo1", "ip add 172.16.3.1 255.255.255.0"]);
  return net;
}
const bgpBest = (net, dn, pfx) => (net.bgp()[dn].tables[pfx.includes(":") ? "ipv6" : "ipv4"][pfx] || []).find((p) => p.best);

test("BGP: eBGP sessions, exact-match network statements, AS_PATH and forwarding", () => {
  const net = bgpChain();
  applyConfig(net, "A", ["router bgp 65001", "neighbor 10.0.12.2 remote-as 65002", "network 172.16.1.0"]);
  const out = console_(net, "B", "en", "conf t", "router bgp 65002", "neighbor 10.0.12.1 remote-as 65001", "neighbor 10.0.23.2 remote-as 65003");
  assert.match(out, /%BGP-5-ADJCHANGE: neighbor 10\.0\.12\.1 Up/);
  applyConfig(net, "C", ["router bgp 65003", "neighbor 10.0.23.1 remote-as 65002", "network 172.16.3.0 mask 255.255.255.0"]);
  assert.ok(net.check({ type: "bgp-nbr", device: "B", neighbor: "10.0.23.2" }));
  // `network 172.16.1.0` means the classful /16, which isn't in A's table: nothing is announced.
  assert.ok(net.check({ type: "bgp-noroute", device: "C", prefix: "172.16.1.0/24" }));
  applyConfig(net, "A", ["router bgp 65001", "no network 172.16.1.0", "network 172.16.1.0 mask 255.255.255.0"]);
  assert.ok(net.check({ type: "bgp-route", device: "C", prefix: "172.16.1.0/24", path: "65002 65001", via: "10.0.23.1" }));
  const r = net.routes("A").find((x) => x.code === "B" && x.len === 24 && x.net === ip2n("172.16.3.0"));
  assert.ok(r && r.ad === 20, "eBGP routes have distance 20");
  assert.ok(net.ping("A", "172.16.3.1", { source: ip2n("172.16.1.1") }).ok);
  const s = new Session(net, "A");
  s.input("en");
  const table = s.input("show ip bgp");
  assert.match(table, /^ \*>  172\.16\.1\.0\/24    0\.0\.0\.0                  0         32768 i$/m);
  assert.match(table, /^ \*>  172\.16\.3\.0\/24    10\.0\.12\.2 {30}0 65002 65003 i$/m);
  assert.match(s.input("show ip bgp summary"), /^10\.0\.12\.2\s+4\s+65002\s+.*\s1$/m);
  // The header counts the whole table (A's own 172.16.1.0/24 and /32 too), as IOS does under a filter.
  const bgpOnly = s.input("show ip route bgp");
  assert.match(bgpOnly, /^ {6}172\.16\.0\.0\/16 is variably subnetted, 3 subnets, 2 masks$/m);
  assert.match(bgpOnly, /^B        172\.16\.3\.0\/24 \[20\/0\] via 10\.0\.12\.2, 00:00:12$/m);
  assert.doesNotMatch(bgpOnly, /^C /m);
  assert.match(s.input("show ip bgp 172.16.3.0"), /65002 65003\n    10\.0\.12\.2 from 10\.0\.12\.2 \(2\.2\.2\.2\)\n      Origin IGP, localpref 100, valid, external, best/);
});

test("BGP: what keeps a session down", () => {
  const net = bgpChain();
  applyConfig(net, "A", ["router bgp 65001", "neighbor 10.0.12.2 remote-as 65002"]);
  let out = console_(net, "B", "en", "conf t", "router bgp 65002", "neighbor 10.0.12.1 remote-as 65009");
  assert.ok(net.check({ type: "bgp-nbr", device: "A", neighbor: "10.0.12.2", state: "Active" }), "wrong AS: TCP works, OPEN is refused");
  assert.match(out, /%BGP-3-NOTIFICATION: sent to neighbor 10\.0\.12\.1 passive 2\/2 \(peer in wrong AS\)/);
  applyConfig(net, "B", ["router bgp 65002", "neighbor 10.0.12.1 remote-as 65001", "neighbor 10.0.12.1 password Cisc0"]);
  assert.ok(net.check({ type: "bgp-nbr", device: "A", neighbor: "10.0.12.2", state: "Active" }), "MD5 password on one side only");
  applyConfig(net, "A", ["router bgp 65001", "neighbor 10.0.12.2 password Cisc0"]);
  assert.ok(net.check({ type: "bgp-nbr", device: "A", neighbor: "10.0.12.2" }));
  applyConfig(net, "A", ["router bgp 65001", "neighbor 10.0.12.2 shutdown"]);
  assert.ok(net.check({ type: "bgp-nbr", device: "A", neighbor: "10.0.12.2", state: "Idle (Admin)" }));
  assert.match(console_(net, "A", "en", "show ip bgp neighbors 10.0.12.2"), /BGP state = Idle\n  Administratively shut down/);
  // eBGP between loopbacks: the connected check keeps it Idle until both ends allow multihop.
  const m = bgpChain();
  applyConfig(m, "A", ["int lo0", "ip add 1.1.1.1 255.255.255.255", "ip route 2.2.2.2 255.255.255.255 10.0.12.2",
    "router bgp 65001", "neighbor 2.2.2.2 remote-as 65002", "neighbor 2.2.2.2 update-source lo0"]);
  applyConfig(m, "B", ["ip route 1.1.1.1 255.255.255.255 10.0.12.1", "router bgp 65002", "neighbor 1.1.1.1 remote-as 65001", "neighbor 1.1.1.1 update-source lo0"]);
  assert.ok(m.check({ type: "bgp-nbr", device: "A", neighbor: "2.2.2.2", state: "Idle" }));
  applyConfig(m, "A", ["router bgp 65001", "neighbor 2.2.2.2 ebgp-multihop 2"]);
  assert.ok(m.check({ type: "bgp-nbr", device: "A", neighbor: "2.2.2.2", state: "Active" }), "the other end still insists on a directly connected peer");
  applyConfig(m, "B", ["router bgp 65002", "neighbor 1.1.1.1 ebgp-multihop 2"]);
  assert.ok(m.check({ type: "bgp-nbr", device: "A", neighbor: "2.2.2.2" }));
  // No route to the neighbor at all: Idle.
  const n = bgpChain();
  applyConfig(n, "A", ["router bgp 65001", "neighbor 9.9.9.9 remote-as 65009"]);
  assert.ok(n.check({ type: "bgp-nbr", device: "A", neighbor: "9.9.9.9", state: "Idle" }));
});

// ISP (65100) - R1 - R2 - R3 in AS 65000 with OSPF inside.
function bgpIbgp() {
  const net = new Network({ devices: [R("ISP"), R("R1"), R("R2"), R("R3")],
    links: [["ISP", G(0), "R1", G(0)], ["R1", G(1), "R2", G(0)], ["R1", G(2), "R3", G(0)]] });
  applyConfig(net, "ISP", ["int g0/0", "ip add 203.0.113.1 255.255.255.252", "no shut", "int lo0", "ip add 8.8.8.8 255.255.255.255",
    "router bgp 65100", "neighbor 203.0.113.2 remote-as 65000", "network 8.8.8.8 mask 255.255.255.255"]);
  applyConfig(net, "R1", ["int g0/0", "ip add 203.0.113.2 255.255.255.252", "no shut", "int g0/1", "ip add 10.0.12.1 255.255.255.0", "no shut",
    "int g0/2", "ip add 10.0.13.1 255.255.255.0", "no shut", "int lo0", "ip add 1.1.1.1 255.255.255.255",
    "router ospf 1", "network 10.0.0.0 0.255.255.255 area 0", "network 1.1.1.1 0.0.0.0 area 0",
    "router bgp 65000", "neighbor 203.0.113.1 remote-as 65100", "neighbor 2.2.2.2 remote-as 65000", "neighbor 2.2.2.2 update-source lo0",
    "neighbor 3.3.3.3 remote-as 65000", "neighbor 3.3.3.3 update-source lo0"]);
  for (const [d, n] of [["R2", 2], ["R3", 3]]) {
    applyConfig(net, d, ["int g0/0", `ip add 10.0.1${n}.${n} 255.255.255.0`, "no shut", "int lo0", `ip add ${n}.${n}.${n}.${n} 255.255.255.255`,
      "int lo1", `ip add 192.168.${n}.1 255.255.255.0`, "router ospf 1", "network 10.0.0.0 0.255.255.255 area 0", `network ${n}.${n}.${n}.${n} 0.0.0.0 area 0`,
      "router bgp 65000", "neighbor 1.1.1.1 remote-as 65000", "neighbor 1.1.1.1 update-source lo0", `network 192.168.${n}.0`]);
  }
  return net;
}

test("BGP: iBGP next hops, split horizon and route reflection", () => {
  const net = bgpIbgp();
  const p = (net.bgp().R2.tables.ipv4["8.8.8.8/32"] || [])[0];
  assert.ok(p && !p.valid && p.nh === "203.0.113.1", "the eBGP next hop isn't in OSPF, so the iBGP path is unusable");
  assert.match(console_(net, "R2", "en", "show ip bgp"), /^   i 8\.8\.8\.8\/32       203\.0\.113\.1              0    100      0 65100 i$/m);
  applyConfig(net, "R1", ["router bgp 65000", "neighbor 2.2.2.2 next-hop-self", "neighbor 3.3.3.3 next-hop-self"]);
  assert.ok(net.check({ type: "bgp-route", device: "R2", prefix: "8.8.8.8/32", via: "1.1.1.1" }));
  assert.equal(net.routes("R2").find((r) => r.code === "B").ad, 200, "iBGP routes have distance 200");
  // iBGP split horizon: R1 doesn't pass R3's LAN on to R2 ...
  assert.ok(net.check({ type: "bgp-noroute", device: "R2", prefix: "192.168.3.0/24" }));
  // ... but the ISP gets both LANs (iBGP-learned routes do go to eBGP peers).
  assert.ok(net.check({ type: "bgp-route", device: "ISP", prefix: "192.168.3.0/24", path: "65000" }));
  applyConfig(net, "R1", ["router bgp 65000", "bgp cluster-id 10.10.10.10", "neighbor 2.2.2.2 route-reflector-client", "neighbor 3.3.3.3 route-reflector-client"]);
  assert.ok(net.check({ type: "bgp-route", device: "R2", prefix: "192.168.3.0/24", via: "3.3.3.3", originator: "192.168.3.1", cluster: "10.10.10.10" }));
  assert.match(console_(net, "R2", "en", "show ip bgp 192.168.3.0"), /Originator: 192\.168\.3\.1, Cluster list: 10\.10\.10\.10/);
  assert.ok(net.ping("R2", "192.168.3.1", { source: ip2n("192.168.2.1") }).ok);
});

test("BGP: best-path order, MED, and policy that waits for a soft clear", () => {
  // A (65001) dual-homed to B (65002) and C (65003), which both reach D (65004).
  const net = new Network({ devices: [R("A"), R("B"), R("C"), R("D")],
    links: [["A", G(0), "B", G(0)], ["A", G(1), "C", G(0)], ["B", G(1), "D", G(0)], ["C", G(1), "D", G(1)]] });
  applyConfig(net, "A", ["int g0/0", "ip add 10.0.12.1 255.255.255.252", "no shut", "int g0/1", "ip add 10.0.13.1 255.255.255.252", "no shut",
    "router bgp 65001", "neighbor 10.0.12.2 remote-as 65002", "neighbor 10.0.13.2 remote-as 65003"]);
  for (const [d, asn, a, b, rid] of [["B", 65002, "10.0.12.2", "10.0.24.1", "2.2.2.2"], ["C", 65003, "10.0.13.2", "10.0.34.1", "3.3.3.3"]]) {
    applyConfig(net, d, ["int g0/0", `ip add ${a} 255.255.255.252`, "no shut", "int g0/1", `ip add ${b} 255.255.255.252`, "no shut",
      "int lo0", `ip add ${rid} 255.255.255.255`, `router bgp ${asn}`, `neighbor ${a.replace(/\.2$/, ".1")} remote-as 65001`,
      `neighbor ${b.replace(/\.1$/, ".2")} remote-as 65004`]);
  }
  applyConfig(net, "D", ["int g0/0", "ip add 10.0.24.2 255.255.255.252", "no shut", "int g0/1", "ip add 10.0.34.2 255.255.255.252", "no shut",
    "int lo1", "ip add 10.4.4.1 255.255.255.0", "router bgp 65004", "neighbor 10.0.24.1 remote-as 65002", "neighbor 10.0.34.1 remote-as 65003",
    "network 10.4.4.0 mask 255.255.255.0"]);
  assert.equal(bgpBest(net, "A", "10.4.4.0/24").from, "10.0.12.2", "a full tie falls through to the lowest router ID");
  applyConfig(net, "A", ["route-map LP permit 10", "set local-preference 200", "router bgp 65001", "neighbor 10.0.13.2 route-map LP in"]);
  assert.equal(bgpBest(net, "A", "10.4.4.0/24").from, "10.0.12.2", "policy added to an established session waits for a refresh");
  // The policy a session runs with survives a save/restore round trip with sorted keys.
  const copy = new Network(net.spec, sortKeys(JSON.parse(JSON.stringify(net.toJSON()))));
  assert.equal(bgpBest(copy, "A", "10.4.4.0/24").from, "10.0.12.2");
  console_(net, "A", "en", "clear ip bgp * soft in");
  assert.ok(net.check({ type: "bgp-route", device: "A", prefix: "10.4.4.0/24", via: "10.0.13.2", lp: 200 }));
  applyConfig(net, "A", ["route-map LP permit 10", "set local-preference 50"]);
  assert.equal(bgpBest(net, "A", "10.4.4.0/24").lp, 200, "editing the route-map changes nothing until a soft clear");
  console_(net, "A", "en", "clear ip bgp 10.0.13.2 soft in");
  assert.equal(bgpBest(net, "A", "10.4.4.0/24").from, "10.0.12.2", "local preference 50 loses to the default 100");
  // A hard reset re-establishes the session and logs it.
  assert.match(console_(net, "A", "en", "clear ip bgp 10.0.13.2"), /%BGP-5-ADJCHANGE: neighbor 10\.0\.13\.2 Down User reset[\s\S]*neighbor 10\.0\.13\.2 Up/);
  // Weight beats local preference, and stays on this router.
  applyConfig(net, "A", ["router bgp 65001", "neighbor 10.0.13.2 weight 100", "do clear ip bgp 10.0.13.2 soft in"]);
  assert.ok(net.check({ type: "bgp-route", device: "A", prefix: "10.4.4.0/24", via: "10.0.13.2", weight: 100, lp: 50 }));
  // Inbound engineering: prepend towards B, so D prefers C for A's network.
  applyConfig(net, "A", ["int lo1", "ip add 172.16.1.1 255.255.255.0", "router bgp 65001", "network 172.16.1.0 mask 255.255.255.0",
    "route-map PRE permit 10", "set as-path prepend 65001 65001", "router bgp 65001", "neighbor 10.0.12.2 route-map PRE out", "do clear ip bgp * soft out"]);
  assert.ok(net.check({ type: "bgp-route", device: "D", prefix: "172.16.1.0/24", via: "10.0.34.1", path: "65003 65001" }));
  // B still has the prepended path from A, but it ties with the path via D on length and loses on router ID.
  assert.ok(net.check({ type: "bgp-route", device: "B", prefix: "172.16.1.0/24", best: false, path: "65001 65001 65001" }));
  // MED: only compared between paths from the same neighbouring AS, unless always-compare-med.
  applyConfig(net, "A", ["no route-map PRE", "route-map MED-HI permit 10", "set metric 50", "route-map MED-LO permit 10", "set metric 10",
    "router bgp 65001", "no neighbor 10.0.12.2 route-map PRE out", "neighbor 10.0.12.2 route-map MED-LO out", "neighbor 10.0.13.2 route-map MED-HI out",
    "do clear ip bgp * soft out"]);
  // D hears the prefix from B and C (different ASes): MED is ignored, the tie goes to the lower router ID.
  assert.equal(bgpBest(net, "D", "172.16.1.0/24").med, null, "MED isn't passed on to a third AS");
});

test("BGP: aggregation, suppression and Null0", () => {
  const net = bgpChain();
  applyConfig(net, "A", ["int lo2", "ip add 172.16.2.1 255.255.255.0", "router bgp 65001", "neighbor 10.0.12.2 remote-as 65002",
    "network 172.16.1.0 mask 255.255.255.0", "network 172.16.2.0 mask 255.255.255.0", "aggregate-address 172.16.0.0 255.255.0.0 summary-only"]);
  applyConfig(net, "B", ["router bgp 65002", "neighbor 10.0.12.1 remote-as 65001"]);
  assert.ok(net.check({ type: "bgp-suppressed", device: "A", prefix: "172.16.1.0/24" }));
  assert.ok(net.check({ type: "bgp-route", device: "B", prefix: "172.16.0.0/16", path: "65001" }));
  assert.ok(net.check({ type: "bgp-noroute", device: "B", prefix: "172.16.1.0/24" }));
  const sum = net.routes("A").find((r) => r.code === "B" && r.len === 16);
  assert.equal(sum.paths[0].ifn, "Null0");
  assert.match(console_(net, "A", "en", "show ip bgp"), /^ s>  172\.16\.1\.0\/24/m);
  // A's connected 172.16 subnets share the major network, so the aggregate sits under its header.
  assert.match(console_(net, "A", "en", "show ip route bgp"), /^B        172\.16\.0\.0\/16 \[200\/0\] via 0\.0\.0\.0, 00:00:12, Null0$/m);
  assert.ok(!net.ping("A", "172.16.9.9").ok, "traffic for an unused part of the aggregate is dropped at Null0");
});

test("BGP: MP-BGP for IPv6", () => {
  const net = new Network({ devices: [R("R1"), R("R2")], links: [["R1", G(0), "R2", G(0)]] });
  applyConfig(net, "R1", ["ipv6 unicast-routing", "int g0/0", "ipv6 address 2001:db8:12::1/64", "no shut", "int lo1", "ipv6 address 2001:db8:1::1/64"]);
  const said = console_(net, "R1", "en", "conf t", "router bgp 65001", "neighbor 2001:db8:12::2 remote-as 65002");
  assert.match(said, /%BGP-4-NORTRID: BGP could not pick a router-id\. Please configure manually\./);
  assert.ok(net.check({ type: "bgp-nbr", device: "R1", neighbor: "2001:db8:12::2", state: "Idle" }), "no IPv4 anywhere: no router ID");
  applyConfig(net, "R1", ["router bgp 65001", "bgp router-id 1.1.1.1", "address-family ipv6", "neighbor 2001:db8:12::2 activate", "network 2001:db8:1::/64"]);
  applyConfig(net, "R2", ["ipv6 unicast-routing", "int g0/0", "ipv6 address 2001:db8:12::2/64", "no shut", "int lo1", "ipv6 address 2001:db8:2::1/64",
    "router bgp 65002", "bgp router-id 2.2.2.2", "neighbor 2001:db8:12::1 remote-as 65001",
    "address-family ipv6 unicast", "neighbor 2001:db8:12::1 activate", "network 2001:db8:2::/64"]);
  assert.ok(net.check({ type: "bgp-nbr", device: "R1", neighbor: "2001:DB8:12::2" }));
  assert.ok(net.check({ type: "bgp-route", device: "R1", prefix: "2001:db8:2::/64", path: "65002", via: "2001:DB8:12::2" }));
  assert.ok(net.check({ type: "route6", device: "R1", prefix: "2001:DB8:2::/64", code: "B" }));
  assert.ok(net.ping("R1", "2001:DB8:2::1").ok);
  const s = new Session(net, "R1");
  s.input("en");
  assert.match(s.input("show bgp ipv6 unicast"), /^ \*>  2001:DB8:2::\/64  2001:DB8:12::2           0             0 65002 i$/m);
  assert.match(s.input("show bgp ipv6 unicast summary"), /^2001:DB8:12::2  4        65002/m);
  const run = s.input("show running-config");
  assert.match(run, /^ address-family ipv6\n  network 2001:DB8:1::\/64\n  neighbor 2001:DB8:12::2 activate\n exit-address-family$/m);
  // With `bgp default ipv4-unicast` (the default) every neighbor is also active for IPv4.
  assert.match(run, /^ address-family ipv4\n  neighbor 2001:DB8:12::2 activate\n exit-address-family$/m);
  // IPv6 prefixes over an IPv4 session get an IPv4-mapped next hop that goes nowhere.
  const v4 = new Network({ devices: [R("R1"), R("R2")], links: [["R1", G(0), "R2", G(0)]] });
  for (const [d, me, them, asn, peer, lan] of [["R1", 1, 2, 65001, 65002, "1"], ["R2", 2, 1, 65002, 65001, "2"]]) {
    applyConfig(v4, d, ["ipv6 unicast-routing", "int g0/0", `ip add 10.0.12.${me} 255.255.255.0`, `ipv6 address 2001:db8:12::${me}/64`, "no shut",
      "int lo1", `ipv6 address 2001:db8:${lan}::1/64`, `router bgp ${asn}`, `neighbor 10.0.12.${them} remote-as ${peer}`,
      "address-family ipv6", `neighbor 10.0.12.${them} activate`, `network 2001:db8:${lan}::/64`]);
  }
  const path = (v4.bgp().R1.tables.ipv6["2001:DB8:2::/64"] || [])[0];
  assert.ok(path && path.nh === "::FFFF:A00:C02" && !path.valid);
});

test("BGP: prefix-lists, as-path lists, help text and a config that replays", () => {
  const net = bgpChain();
  applyConfig(net, "A", ["int lo2", "ip add 172.16.2.1 255.255.255.128", "int lo3", "ip add 10.9.0.1 255.255.0.0",
    "ip prefix-list LANS seq 5 permit 172.16.0.0/16 le 24", "ip as-path access-list 1 permit ^$",
    "route-map OUT permit 10", "match ip address prefix-list LANS", "match as-path 1", "set community 65001:100 no-export",
    "router bgp 65001", "neighbor 10.0.12.2 remote-as 65002", "neighbor 10.0.12.2 send-community", "neighbor 10.0.12.2 route-map OUT out",
    "network 172.16.1.0 mask 255.255.255.0", "network 172.16.2.0 mask 255.255.255.128", "network 10.9.0.0 mask 255.255.0.0"]);
  applyConfig(net, "B", ["router bgp 65002", "neighbor 10.0.12.1 remote-as 65001", "neighbor 10.0.23.2 remote-as 65003"]);
  applyConfig(net, "C", ["router bgp 65003", "neighbor 10.0.23.1 remote-as 65002"]);
  assert.ok(net.check({ type: "bgp-route", device: "B", prefix: "172.16.1.0/24" }));
  assert.ok(net.check({ type: "bgp-noroute", device: "B", prefix: "172.16.2.0/25" }), "le 24 stops a /25");
  assert.ok(net.check({ type: "bgp-noroute", device: "B", prefix: "10.9.0.0/16" }), "not in the prefix-list");
  assert.deepEqual(bgpBest(net, "B", "172.16.1.0/24").comm, ["65001:100", "no-export"]);
  assert.ok(net.check({ type: "bgp-noroute", device: "C", prefix: "172.16.1.0/24" }), "no-export stops at the AS boundary");
  // Context-sensitive help.
  const s = new Session(net, "A");
  for (const l of ["en", "conf t", "router bgp 65001"]) s.input(l);
  assert.match(s.help(""), /neighbor +Specify a neighbor router[\s\S]*network +Specify a network to announce via BGP/);
  assert.match(s.help("neighbor 10.0.12.2 "), /remote-as +Specify a BGP neighbor[\s\S]*update-source +Source of routing updates/);
  assert.match(s.help("neighbor 10.0.12.2 route-map OUT "), /in +Apply map to incoming routes\n +out +Apply map to outbound routes/);
  assert.match(s.help("neighbor 10.0.12.2 next-hop-self "), /<cr>/);
  // Everything above prints and pastes back into an identical config.
  const text = runningConfig(net, "A");
  assert.match(text, /^router bgp 65001\n bgp log-neighbor-changes\n network 10\.9\.0\.0 mask 255\.255\.0\.0\n network 172\.16\.1\.0 mask 255\.255\.255\.0\n network 172\.16\.2\.0 mask 255\.255\.255\.128\n neighbor 10\.0\.12\.2 remote-as 65002\n neighbor 10\.0\.12\.2 send-community\n neighbor 10\.0\.12\.2 route-map OUT out$/m);
  assert.match(text, /^ip as-path access-list 1 permit \^\$$/m);
  assert.match(text, /^ip prefix-list LANS seq 5 permit 172\.16\.0\.0\/16 le 24$/m);
  assert.match(text, /^route-map OUT permit 10\n match ip address prefix-list LANS\n match as-path 1\n set community 65001:100 no-export$/m);
  const fresh = bgpChain();
  const keep = (l) => !/^(Building configuration|Current configuration|!|version |end$|no aaa new-model)/.test(l) && l.trim();
  applyConfig(fresh, "A", text.split("\n").filter(keep).flatMap((l) => (l.startsWith("interface ") ? [l, " no shutdown"] : [l])));
  assert.equal(runningConfig(fresh, "A"), text);
});

// ---------------------------------------------------------------- CCNP routing
const ip4 = (n, ip, m = "255.255.255.0", ...extra) => ["interface " + n, " ip address " + ip + " " + m, ...extra.map((e) => " " + e), " no shutdown"];
const lineOf = (_, ...devs) => new Network({ devices: devs.map((d) => R(d)), links: devs.slice(1).map((d, i) => [devs[i], G(i ? 1 : 0), d, G(0)]) });
const fmtV6 = (n) => ios.fmt6(n);
const route = (net, dn, pfx) => net.routes(dn).find((r) => r.net === ip2n(pfx.split("/")[0]) && r.len === +pfx.split("/")[1]);
// R1 (area 1) - R2 (ABR) - R3 (area 0) - R4 (ABR) - R5 (area 2)
function ospfFive() {
  const net = new Network({ devices: ["R1", "R2", "R3", "R4", "R5"].map(R),
    links: [["R1", G(0), "R2", G(0)], ["R2", G(1), "R3", G(0)], ["R3", G(1), "R4", G(0)], ["R4", G(1), "R5", G(0)]] });
  applyConfig(net, "R1", [...ip4("g0/0", "10.0.12.1"), "interface loopback1", " ip address 172.16.1.1 255.255.255.0", " ip ospf network point-to-point",
    "interface loopback2", " ip address 172.16.2.1 255.255.255.0", " ip ospf network point-to-point",
    "router ospf 1", " router-id 1.1.1.1", " network 10.0.12.0 0.0.0.255 area 1", " network 172.16.0.0 0.0.255.255 area 1"]);
  applyConfig(net, "R2", [...ip4("g0/0", "10.0.12.2"), ...ip4("g0/1", "10.0.23.2"), "router ospf 1", " router-id 2.2.2.2",
    " network 10.0.12.0 0.0.0.255 area 1", " network 10.0.23.0 0.0.0.255 area 0"]);
  applyConfig(net, "R3", [...ip4("g0/0", "10.0.23.3"), ...ip4("g0/1", "10.0.34.3"), "router ospf 1", " router-id 3.3.3.3", " network 10.0.0.0 0.255.255.255 area 0"]);
  applyConfig(net, "R4", [...ip4("g0/0", "10.0.34.4"), ...ip4("g0/1", "10.0.45.4"), "router ospf 1", " router-id 4.4.4.4",
    " network 10.0.34.0 0.0.0.255 area 0", " network 10.0.45.0 0.0.0.255 area 2"]);
  applyConfig(net, "R5", [...ip4("g0/0", "10.0.45.5"), "ip route 192.168.50.0 255.255.255.0 Null0", "router ospf 1", " router-id 5.5.5.5",
    " network 10.0.45.0 0.0.0.255 area 2", " redistribute static subnets"]);
  return net;
}

test("OSPF areas: inter-area costs, type-4 ASBR summaries, E1 versus E2", () => {
  const net = ospfFive();
  // R1 -> R2 (1) -> R3 (1) -> R4 (1) -> 10.0.45.0/24 (1)
  assert.equal(route(net, "R1", "10.0.45.0/24").code, "O IA");
  assert.equal(route(net, "R1", "10.0.45.0/24").metric, 4);
  assert.equal(route(net, "R1", "10.0.23.0/24").metric, 2);
  const e2 = route(net, "R1", "192.168.50.0/24");
  assert.equal(e2.code, "O E2");
  assert.equal(e2.metric, 20, "E2 keeps the seed metric");
  applyConfig(net, "R5", ["router ospf 1", " redistribute static subnets metric-type 1 tag 55"]);
  const e1 = route(net, "R1", "192.168.50.0/24");
  assert.equal(e1.code, "O E1");
  assert.equal(e1.metric, 24, "E1 adds the path cost to the ASBR");
  assert.equal(e1.tag, 55);
  assert.match(console_(net, "R3", "en", "show ip ospf border-routers"), /I 5\.5\.5\.5 \[2\] via 10\.0\.34\.4/);
  assert.ok(net.check({ type: "ospf-lsa", device: "R3", lsa: "asbr-summary", area: 0 }));
  assert.ok(net.check({ type: "ospf-role", device: "R2", role: "abr" }));
  assert.ok(net.check({ type: "ospf-role", device: "R5", role: "asbr" }));
});

test("OSPF areas: stub, totally stubby, NSSA and translation, area ranges", () => {
  const net = ospfFive();
  applyConfig(net, "R2", ["router ospf 1", " area 1 stub"]);
  assert.ok(!net.check({ type: "ospf-nbr", device: "R2", neighbor: "1.1.1.1" }), "a stub flag mismatch drops the adjacency");
  applyConfig(net, "R1", ["router ospf 1", " area 1 stub"]);
  assert.equal(route(net, "R1", "0.0.0.0/0").code, "O*IA");
  assert.ok(!route(net, "R1", "192.168.50.0/24"), "no externals in a stub area");
  assert.ok(route(net, "R1", "10.0.45.0/24"), "a stub area still gets summaries");
  applyConfig(net, "R2", ["router ospf 1", " area 1 stub no-summary"]);
  assert.ok(!route(net, "R1", "10.0.45.0/24"), "totally stubby: no summaries either");
  assert.ok(net.ping("R1", "10.0.45.5", { source: ip2n("172.16.1.1") }).ok, "the default still gets traffic out");
  applyConfig(net, "R4", ["router ospf 1", " area 2 nssa"]);
  applyConfig(net, "R5", ["router ospf 1", " area 2 nssa"]);
  assert.equal(route(net, "R4", "192.168.50.0/24").code, "O N2");
  assert.equal(route(net, "R3", "192.168.50.0/24").code, "O E2", "the NSSA ABR translates type 7 to type 5");
  assert.match(console_(net, "R3", "en", "show ip ospf database external"), /Advertising Router: 4\.4\.4\.4/);
  assert.ok(!route(net, "R5", "0.0.0.0/0"), "an NSSA gets no default by itself");
  applyConfig(net, "R4", ["router ospf 1", " area 2 nssa default-information-originate"]);
  assert.equal(route(net, "R5", "0.0.0.0/0").code, "O*N2");
  // range on R2 (area 1 is totally stubby but its own routes still summarise into area 0)
  applyConfig(net, "R2", ["router ospf 1", " area 1 range 172.16.0.0 255.255.252.0"]);
  assert.equal(route(net, "R3", "172.16.0.0/22").code, "O IA");
  assert.ok(!route(net, "R3", "172.16.1.0/24"));
  assert.ok(route(net, "R2", "172.16.0.0/22").discard, "the ABR installs a discard route for the range");
  assert.match(console_(net, "R2", "en", "show ip route ospf"), /O +172\.16\.0\.0\/22 is a summary, \S+, Null0/);
});

test("OSPF: virtual links, MTU mismatch, MD5 and network types", () => {
  const net = new Network({ devices: ["R1", "R2", "R3", "R4"].map(R), links: [["R1", G(0), "R2", G(0)], ["R2", G(1), "R3", G(0)], ["R3", G(1), "R4", G(0)]] });
  applyConfig(net, "R1", [...ip4("g0/0", "10.0.12.1"), "interface loopback0", " ip address 1.1.1.1 255.255.255.255", "router ospf 1", " network 0.0.0.0 255.255.255.255 area 0"]);
  applyConfig(net, "R2", [...ip4("g0/0", "10.0.12.2", "255.255.255.0", "ip mtu 1400"), ...ip4("g0/1", "10.0.23.2"), "router ospf 1", " router-id 2.2.2.2",
    " network 10.0.12.0 0.0.0.255 area 0", " network 10.0.23.0 0.0.0.255 area 1"]);
  applyConfig(net, "R3", [...ip4("g0/0", "10.0.23.3"), ...ip4("g0/1", "10.0.34.3"), "router ospf 1", " router-id 3.3.3.3",
    " network 10.0.23.0 0.0.0.255 area 1", " network 10.0.34.0 0.0.0.255 area 2"]);
  applyConfig(net, "R4", [...ip4("g0/0", "10.0.34.4"), "interface loopback0", " ip address 4.4.4.4 255.255.255.255", "router ospf 1", " network 0.0.0.0 255.255.255.255 area 2"]);
  assert.ok(net.check({ type: "ospf-nbr-state", device: "R1", neighbor: "2.2.2.2", state: "EXSTART" }), "MTU mismatch sticks in EXSTART");
  applyConfig(net, "R1", ["interface g0/0", " ip ospf mtu-ignore"]);
  assert.ok(net.check({ type: "ospf-nbr-state", device: "R1", neighbor: "2.2.2.2", state: "EXSTART" }), "only the smaller-MTU side's mtu-ignore helps");
  applyConfig(net, "R2", ["interface g0/0", " ip ospf mtu-ignore"]);
  assert.ok(net.check({ type: "ospf-nbr", device: "R1", neighbor: "2.2.2.2" }));
  assert.ok(!net.ping("R4", "1.1.1.1").ok, "area 2 isn't attached to the backbone yet");
  applyConfig(net, "R2", ["router ospf 1", " area 1 virtual-link 3.3.3.3"]);
  applyConfig(net, "R3", ["router ospf 1", " area 1 virtual-link 2.2.2.2"]);
  assert.ok(net.check({ type: "ospf-vlink", device: "R3", neighbor: "2.2.2.2" }));
  assert.ok(net.ping("R4", "1.1.1.1").ok);
  assert.match(console_(net, "R2", "en", "show ip ospf neighbor"), /3\.3\.3\.3 +0 +FULL\/  - .*OSPF_VL0/);
  assert.match(console_(net, "R3", "en", "conf t", "router ospf 1", "area 1 stub"), /contains a virtual link/);
  // MD5: one side only, then wrong key, then matching
  applyConfig(net, "R1", ["interface g0/0", " ip ospf authentication message-digest", " ip ospf message-digest-key 1 md5 ONE"]);
  assert.ok(!net.check({ type: "ospf-nbr", device: "R1", neighbor: "2.2.2.2" }));
  const dbg = console_(net, "R2", "en", "debug ip ospf adj", "show clock");
  assert.match(dbg, /Mismatched Authentication type\. Input packet specified type 2, we use type 0/);
  applyConfig(net, "R2", ["interface g0/0", " ip ospf authentication message-digest", " ip ospf message-digest-key 1 md5 TWO"]);
  assert.ok(!net.check({ type: "ospf-nbr", device: "R1", neighbor: "2.2.2.2" }));
  applyConfig(net, "R2", ["interface g0/0", " ip ospf message-digest-key 1 md5 ONE"]);
  assert.ok(net.check({ type: "ospf-nbr", device: "R1", neighbor: "2.2.2.2" }));
  assert.match(console_(net, "R1", "en", "show ip ospf interface g0/0"), /Cryptographic authentication enabled\n    Youngest key id is 1/);
  // point-to-multipoint on one side changes the hello timer, so the adjacency drops
  applyConfig(net, "R3", ["interface g0/1", " ip ospf network point-to-multipoint"]);
  assert.ok(!net.check({ type: "ospf-nbr", device: "R4", neighbor: "3.3.3.3" }));
  applyConfig(net, "R4", ["interface g0/0", " ip ospf network point-to-multipoint"]);
  assert.ok(net.check({ type: "ospf-nbr", device: "R4", neighbor: "3.3.3.3" }));
  assert.equal(route(net, "R4", "10.0.34.3/32").code, "O", "point-to-multipoint advertises host routes");
});

test("OSPF: two processes, mutual redistribution, summary-address", () => {
  const net = lineOf(null, "X", "Y", "Z");
  applyConfig(net, "X", [...ip4("g0/0", "10.1.0.1"), "interface loopback1", " ip address 172.20.1.1 255.255.255.0", " ip ospf network point-to-point",
    "router ospf 10", " network 0.0.0.0 255.255.255.255 area 0"]);
  applyConfig(net, "Y", [...ip4("g0/0", "10.1.0.2"), ...ip4("g0/1", "10.2.0.2"), "router ospf 10", " network 10.1.0.0 0.0.0.255 area 0", " redistribute ospf 20 subnets",
    "router ospf 20", " network 10.2.0.0 0.0.0.255 area 0", " redistribute ospf 10 subnets", " summary-address 172.20.0.0 255.255.0.0"]);
  applyConfig(net, "Z", [...ip4("g0/0", "10.2.0.3"), "router ospf 1", " network 10.2.0.0 0.0.0.255 area 0"]);
  assert.equal(route(net, "Z", "172.20.0.0/16").code, "O E2");
  assert.ok(!route(net, "Z", "172.20.1.0/24"));
  assert.equal(route(net, "X", "10.2.0.0/24").code, "O E2", "connected networks of the other process come across too");
  assert.ok(net.ping("Z", "172.20.1.1").ok);
  assert.equal(net.ospfInstsOf("Y").length, 2);
  assert.match(console_(net, "Y", "en", "show running-config"), /router ospf 10\n redistribute ospf 20 subnets\n network 10\.1\.0\.0 0\.0\.0\.255 area 0\n!\nrouter ospf 20\n summary-address 172\.20\.0\.0 255\.255\.0\.0\n redistribute ospf 10 subnets/);
});

function eigrpHub() {
  const net = new Network({ devices: ["HUB", "S1", "S2"].map(R), links: [["HUB", G(0), "S1", G(0)], ["HUB", G(1), "S2", G(0)], ["S1", G(1), "S2", G(1)]] });
  applyConfig(net, "HUB", [...ip4("g0/0", "10.0.1.1"), ...ip4("g0/1", "10.0.2.1"), "router eigrp 100", " network 10.0.0.0"]);
  applyConfig(net, "S1", [...ip4("g0/0", "10.0.1.2"), ...ip4("g0/1", "10.0.12.1", "255.255.255.0", "bandwidth 1544", "delay 2000"),
    "interface loopback1", " ip address 172.16.1.1 255.255.255.0", "interface loopback2", " ip address 172.16.2.1 255.255.255.0",
    "router eigrp 100", " network 10.0.0.0", " network 172.16.0.0"]);
  applyConfig(net, "S2", [...ip4("g0/0", "10.0.2.2"), ...ip4("g0/1", "10.0.12.2", "255.255.255.0", "bandwidth 1544", "delay 2000"),
    "interface loopback0", " ip address 192.168.2.1 255.255.255.0", "router eigrp 100", " network 10.0.0.0", " network 192.168.2.0"]);
  return net;
}

test("EIGRP: interface summaries, stub routers, key-chain MD5", () => {
  const net = eigrpHub();
  applyConfig(net, "S1", ["interface g0/0", " ip summary-address eigrp 100 172.16.0.0 255.255.252.0"]);
  assert.equal(route(net, "HUB", "172.16.0.0/22").code, "D");
  // The summary is only sent out g0/0: the /24s still leak to the hub the long way, through S2.
  assert.deepEqual(route(net, "HUB", "172.16.1.0/24").paths.map((p) => p.ip), [ip2n("10.0.2.2")]);
  const sum = route(net, "S1", "172.16.0.0/22");
  assert.ok(sum.discard && sum.ad === 5, "a summary installs a Null0 route with distance 5");
  // S2's backup link means the hub may use S1 as transit for S2's LAN - until S1 is a stub
  applyConfig(net, "HUB", ["interface g0/1", " shutdown"]);
  assert.ok(route(net, "HUB", "192.168.2.0/24"), "transit through S1 while S1 isn't a stub");
  applyConfig(net, "S1", ["router eigrp 100", " eigrp stub"]);
  assert.ok(!route(net, "HUB", "192.168.2.0/24"), "a stub never advertises routes it learned");
  assert.match(console_(net, "HUB", "en", "show ip eigrp neighbors detail"), /Stub Peer Advertising \(CONNECTED SUMMARY \) Routes/);
  applyConfig(net, "HUB", ["interface g0/1", " no shutdown"]);
  // MD5 with key chains
  applyConfig(net, "HUB", ["key chain K", " key 1", "  key-string NetLab", "interface g0/0", " ip authentication mode eigrp 100 md5", " ip authentication key-chain eigrp 100 K"]);
  assert.ok(!net.check({ type: "eigrp-nbr", device: "HUB", neighbor: "10.0.1.2" }));
  applyConfig(net, "S1", ["key chain K", " key 1", "  key-string Wrong", "interface g0/0", " ip authentication mode eigrp 100 md5", " ip authentication key-chain eigrp 100 K"]);
  assert.ok(!net.check({ type: "eigrp-nbr", device: "HUB", neighbor: "10.0.1.2" }));
  applyConfig(net, "S1", ["key chain K", " key 1", "  key-string NetLab"]);
  assert.ok(net.check({ type: "eigrp-nbr", device: "HUB", neighbor: "10.0.1.2" }));
  assert.match(console_(net, "HUB", "en", "show key chain"), /key 1 -- text "NetLab"/);
});

test("EIGRP: K values, offset-lists, distribute-lists and distance", () => {
  const net = eigrpHub();
  const s = new Session(net, "S2");
  for (const l of ["en", "conf t", "router eigrp 100"]) s.input(l);
  const out = s.input("metric weights 0 1 1 1 0 0");
  assert.match(out, /Neighbor 10\.0\.2\.1 \(GigabitEthernet0\/0\) is down: metric changed/);
  assert.match(s.events.HUB.join("\n"), /Neighbor 10\.0\.2\.2 \(GigabitEthernet0\/1\) is down: K-value mismatch/);
  s.input("no metric weights");
  const base = route(net, "HUB", "172.16.1.0/24").metric;
  applyConfig(net, "HUB", ["access-list 5 permit 172.16.0.0 0.0.255.255", "router eigrp 100", " offset-list 5 in 1000 g0/0"]);
  assert.equal(route(net, "HUB", "172.16.1.0/24").metric, base + 1000);
  applyConfig(net, "HUB", ["ip prefix-list NO1 seq 5 deny 172.16.1.0/24", "ip prefix-list NO1 seq 10 permit 0.0.0.0/0 le 32", "router eigrp 100", " distribute-list prefix NO1 in"]);
  assert.ok(!route(net, "HUB", "172.16.1.0/24"));
  assert.ok(route(net, "HUB", "172.16.2.0/24"));
  assert.match(console_(net, "HUB", "en", "show ip prefix-list detail"), /seq 5 deny 172\.16\.1\.0\/24 \(hit count: [1-9]/);
  applyConfig(net, "HUB", ["router eigrp 100", " distance eigrp 80 160"]);
  assert.equal(route(net, "HUB", "172.16.2.0/24").ad, 80);
});

test("EIGRP for IPv6: classic and named mode", () => {
  const two = () => new Network({ devices: [R("A"), R("B")], links: [["A", G(0), "B", G(0)]] });
  const net = two();
  for (const [r, n] of [["A", "1"], ["B", "2"]]) {
    applyConfig(net, r, ["ipv6 unicast-routing", "interface loopback0", ` ip address ${n}.${n}.${n}.${n} 255.255.255.255`, ` ipv6 address 2001:db8:${n}::1/64`, ` ipv6 eigrp 7`,
      "interface g0/0", " ipv6 enable", " ipv6 eigrp 7", " no shutdown", "ipv6 router eigrp 7"]);
  }
  const r6 = net.routes6("B").find((x) => x.code === "D");
  assert.ok(r6 && fmtV6(r6.net) === "2001:DB8:1::");
  assert.ok(net.ping("B", "2001:db8:1::1").ok, "a link-local-only exit sources from another global address");
  const named = two();
  for (const [r, n] of [["A", "1"], ["B", "2"]]) {
    applyConfig(named, r, ["ipv6 unicast-routing", "interface loopback0", ` ip address ${n}.${n}.${n}.${n} 255.255.255.255`, ` ipv6 address 2001:db8:${n}::1/64`,
      "interface g0/0", " ipv6 enable", " no shutdown", "router eigrp LAB", " address-family ipv6 unicast autonomous-system 10"]);
  }
  assert.ok(named.check({ type: "eigrp6-nbrs", device: "A", count: 1 }));
  assert.match(console_(named, "A", "en", "show ipv6 eigrp neighbors"), /EIGRP-IPv6 VR\(LAB\) Address-Family Neighbors for AS\(10\)/);
});

test("RIP: versions, auto-summary, split horizon and redistribution seeds", () => {
  const net = lineOf(null, "R1", "R2", "R3");
  applyConfig(net, "R1", [...ip4("g0/0", "10.12.0.1"), "interface loopback1", " ip address 172.16.1.1 255.255.255.0", "router rip", " network 10.0.0.0", " network 172.16.0.0"]);
  applyConfig(net, "R2", [...ip4("g0/0", "10.12.0.2"), ...ip4("g0/1", "10.23.0.2"), "router rip", " version 2", " no auto-summary", " network 10.0.0.0"]);
  applyConfig(net, "R3", [...ip4("g0/0", "10.23.0.3"), "interface loopback0", " ip address 3.3.3.3 255.255.255.255", "router ospf 1", " network 0.0.0.0 255.255.255.255 area 0"]);
  assert.ok(!net.routes("R2").some((r) => r.code === "R"), "a version-2-only router ignores version 1 updates");
  applyConfig(net, "R1", ["router rip", " version 2"]);
  assert.equal(route(net, "R2", "172.16.0.0/16").code, "R", "auto-summary at the major network boundary");
  applyConfig(net, "R1", ["router rip", " no auto-summary"]);
  assert.equal(route(net, "R2", "172.16.1.0/24").metric, 1);
  applyConfig(net, "R2", ["router ospf 1", " network 10.23.0.0 0.0.0.255 area 0", " redistribute rip subnets", "router rip", " redistribute ospf 1"]);
  assert.ok(!route(net, "R1", "3.3.3.3/32"), "into RIP without a metric gives nothing");
  applyConfig(net, "R2", ["router rip", " redistribute ospf 1 metric 4"]);
  assert.equal(route(net, "R1", "3.3.3.3/32").metric, 5);
  assert.equal(route(net, "R3", "172.16.1.0/24").code, "O E2");
  assert.ok(net.ping("R1", "3.3.3.3", { source: ip2n("172.16.1.1") }).ok);
  applyConfig(net, "R1", ["router rip", " default-information originate"]);
  assert.equal(route(net, "R2", "0.0.0.0/0").code, "R*");
  assert.match(console_(net, "R2", "en", "show ip protocols"), /Routing Protocol is "rip"[\s\S]*Default version control: send version 2, receive version 2/);
});

test("RIPng with a default route", () => {
  const net = new Network({ devices: [R("A"), R("B")], links: [["A", G(0), "B", G(0)]] });
  applyConfig(net, "A", ["ipv6 unicast-routing", "interface g0/0", " ipv6 address 2001:db8:12::1/64", " ipv6 rip NG enable", " no shutdown",
    "interface loopback0", " ipv6 address 2001:db8:1::1/64", " ipv6 rip NG enable"]);
  applyConfig(net, "B", ["ipv6 unicast-routing", "interface g0/0", " ipv6 address 2001:db8:12::2/64", " ipv6 rip NG enable", " ipv6 rip NG default-information originate", " no shutdown"]);
  const r = net.routes6("B").find((x) => x.code === "R");
  assert.equal(r.metric, 2, "RIPng counts the receiving hop: connected 1 arrives as 2");
  assert.ok(net.routes6("A").some((x) => x.code === "R" && x.len === 0));
  assert.ok(net.check({ type: "ripng-route", device: "B", prefix: "2001:db8:1::/64" }));
});

test("route-maps and prefix-lists in redistribution: tags, metrics, deny clauses", () => {
  const net = lineOf(null, "R1", "R2", "R3");
  applyConfig(net, "R1", [...ip4("g0/0", "10.12.0.1"), "interface loopback1", " ip address 172.16.1.1 255.255.255.0", "interface loopback2", " ip address 172.16.2.1 255.255.255.0",
    "router rip", " version 2", " no auto-summary", " network 10.0.0.0", " network 172.16.0.0"]);
  applyConfig(net, "R2", [...ip4("g0/0", "10.12.0.2"), ...ip4("g0/1", "10.23.0.2"), "router rip", " version 2", " network 10.0.0.0",
    "ip prefix-list LO2 seq 5 permit 172.16.2.0/24", "route-map R2O deny 10", " match ip address prefix-list LO2", "route-map R2O permit 20", " set tag 120", " set metric 50", " set metric-type type-1",
    "router ospf 1", " network 10.23.0.0 0.0.0.255 area 0", " redistribute rip subnets route-map R2O"]);
  applyConfig(net, "R3", [...ip4("g0/0", "10.23.0.3"), "router ospf 1", " network 10.23.0.0 0.0.0.255 area 0", "route-map T120 permit 10", " match tag 120", " set metric 9"]);
  const r = route(net, "R3", "172.16.1.0/24");
  assert.equal(r.code, "O E1");
  assert.equal(r.metric, 51);
  assert.equal(r.tag, 120);
  assert.ok(!route(net, "R3", "172.16.2.0/24"), "the deny clause keeps 172.16.2.0 out");
  // routeMapEval reads the shared store (BGP's commands)
  assert.deepEqual(net.routeMapEval("R3", "T120", { net: ip2n("172.16.1.0"), len: 24, tag: 120 }).set, { metric: 9 });
  assert.equal(net.routeMapEval("R3", "T120", { net: ip2n("172.16.1.0"), len: 24, tag: 7 }).permit, false);
  assert.equal(net.routeMapEval("R3", "NOPE", { net: 0, len: 0 }), null);
  assert.equal(net.prefixListMatch("R2", "LO2", ip2n("172.16.2.0"), 24, false), "permit");
  assert.equal(net.prefixListMatch("R2", "LO2", ip2n("172.16.2.0"), 25, false), "deny");
  assert.match(console_(net, "R3", "en", "show ip route 172.16.1.0"), /Tag 120, type extern 1/);
  assert.match(console_(net, "R2", "en", "show route-map R2O"), /route-map R2O, permit, sequence 20\n  Match clauses:\n  Set clauses:\n    tag 120\n    metric 50\n    metric-type type-1/);
});

function edgeLab() {
  const net = new Network({ devices: [R("E"), R("I1"), R("I2"), R("N"), P("PC")],
    links: [["E", G(0), "I1", G(0)], ["E", G(1), "I2", G(0)], ["I1", G(1), "N", G(0)], ["I2", G(1), "N", G(1)], ["E", G(2), "PC", "eth0"]] });
  applyConfig(net, "E", [...ip4("g0/0", "10.1.0.1"), ...ip4("g0/1", "10.2.0.1"), ...ip4("g0/2", "192.168.1.1")]);
  applyConfig(net, "I1", [...ip4("g0/0", "10.1.0.2"), ...ip4("g0/1", "10.3.0.1"), "ip route 192.168.1.0 255.255.255.0 10.1.0.1", "ip route 0.0.0.0 0.0.0.0 10.3.0.2"]);
  applyConfig(net, "I2", [...ip4("g0/0", "10.2.0.2"), ...ip4("g0/1", "10.4.0.1"), "ip route 192.168.1.0 255.255.255.0 10.2.0.1", "ip route 0.0.0.0 0.0.0.0 10.4.0.2"]);
  applyConfig(net, "N", [...ip4("g0/0", "10.3.0.2"), ...ip4("g0/1", "10.4.0.2"), "interface loopback0", " ip address 8.8.8.8 255.255.255.255",
    "ip route 192.168.1.0 255.255.255.0 10.3.0.1"]);
  applyConfig(net, "PC", ["ip 192.168.1.10/24 192.168.1.1"]);
  return net;
}

test("IP SLA tracking withdraws a static route; floating static takes over", () => {
  const net = edgeLab();
  const s = new Session(net, "E");
  for (const l of ["en", "conf t", "ip sla 1", "icmp-echo 10.1.0.2 source-interface g0/0", "frequency 5", "exit", "ip sla schedule 1 life forever start-time now",
    "track 1 ip sla 1 reachability", "exit", "ip route 0.0.0.0 0.0.0.0 10.1.0.2 track 1", "ip route 0.0.0.0 0.0.0.0 10.2.0.2 10", "end"]) s.input(l);
  assert.ok(net.check({ type: "sla", device: "E", op: 1 }));
  assert.equal(route(net, "E", "0.0.0.0/0").paths[0].ip, ip2n("10.1.0.2"));
  const i1 = new Session(net, "I1");
  for (const l of ["en", "conf t", "interface g0/0"]) i1.input(l);
  i1.input("shutdown");
  assert.match((i1.events.E || []).join("\n"), /%TRACK-6-STATE: 1 ip sla 1 reachability Up -> Down/);
  assert.equal(route(net, "E", "0.0.0.0/0").paths[0].ip, ip2n("10.2.0.2"));
  assert.ok(net.check({ type: "track", device: "E", object: 1, state: "down" }));
  i1.input("no shutdown");
  assert.equal(route(net, "E", "0.0.0.0/0").paths[0].ip, ip2n("10.1.0.2"));
  assert.match(console_(net, "E", "en", "show track"), /Track 1\n  IP SLA 1 reachability\n  Reachability is Up/);
  assert.match(console_(net, "E", "en", "show running-config"), /ip sla 1\n icmp-echo 10\.1\.0\.2 source-interface GigabitEthernet0\/0\n  frequency 5\nip sla schedule 1 life forever start-time now/);
});

test("policy-based routing overrides the table; uRPF strict versus loose", () => {
  const net = edgeLab();
  applyConfig(net, "E", ["ip route 0.0.0.0 0.0.0.0 10.1.0.2"]);
  const hops = (from) => net.trace(from, "8.8.8.8").map((h) => h.ip);
  assert.ok(hops("PC").includes(ip2n("10.1.0.2")));
  applyConfig(net, "E", ["access-list 101 permit ip 192.168.1.0 0.0.0.255 any", "route-map PBR permit 10", " match ip address 101", " set ip next-hop 10.2.0.2",
    "interface g0/2", " ip policy route-map PBR"]);
  assert.ok(hops("PC").includes(ip2n("10.2.0.2")) && !hops("PC").includes(ip2n("10.1.0.2")));
  assert.ok(net.ping("PC", "8.8.8.8").ok, "replies come back the other way (asymmetric is fine)");
  assert.ok(!hops("E").includes(ip2n("10.2.0.2")), "the router's own traffic isn't policy-routed without ip local policy");
  assert.match(console_(net, "PC", "ping 8.8.8.8 -c 1") && console_(net, "E", "en", "show route-map PBR"), /Policy routing matches: [1-9]\d* packets/);
  // N's best route back to the LAN is via I1, so traffic arriving from I2 fails strict uRPF
  applyConfig(net, "N", ["interface g0/1", " ip verify unicast source reachable-via rx"]);
  assert.ok(!net.ping("PC", "8.8.8.8").ok);
  applyConfig(net, "N", ["interface g0/1", " ip verify unicast source reachable-via any"]);
  assert.ok(net.ping("PC", "8.8.8.8").ok);
  assert.match(console_(net, "N", "en", "show ip interface g0/1"), /IP verify source reachable-via ANY/);
});

test("IPv6 ACLs: the implicit ND permits and an explicit deny ipv6 any any", () => {
  const net = new Network({ devices: [R("A"), R("B"), R("C")], links: [["A", G(0), "B", G(0)], ["B", G(1), "C", G(0)]] });
  applyConfig(net, "A", ["ipv6 unicast-routing", "interface g0/0", " ipv6 address 2001:db8:1::1/64", " no shutdown", "ipv6 route ::/0 2001:db8:1::2"]);
  applyConfig(net, "B", ["ipv6 unicast-routing", "interface g0/0", " ipv6 address 2001:db8:1::2/64", " no shutdown", "interface g0/1", " ipv6 address 2001:db8:2::2/64", " no shutdown"]);
  applyConfig(net, "C", ["ipv6 unicast-routing", "interface g0/0", " ipv6 address 2001:db8:2::3/64", " no shutdown", "ipv6 route ::/0 2001:db8:2::2"]);
  applyConfig(net, "B", ["ipv6 access-list IN", " permit icmp any host 2001:db8:2::3 echo-request", "interface g0/0", " ipv6 traffic-filter IN in"]);
  assert.ok(net.ping("A", "2001:db8:2::3").ok, "implicit nd-na/nd-ns permits keep neighbour discovery working");
  assert.ok(!net.ping("A", "2001:db8:2::2").ok, "anything else is denied");
  applyConfig(net, "B", ["ipv6 access-list IN", " deny ipv6 any any log"]);
  assert.ok(!net.ping("A", "2001:db8:2::3").ok, "an explicit deny comes before the implicit ND permits");
  applyConfig(net, "B", ["ipv6 access-list IN", " sequence 1 permit icmp any any nd-na", " sequence 2 permit icmp any any nd-ns"]);
  assert.ok(net.ping("A", "2001:db8:2::3").ok);
  console_(net, "A", "en", "ping 2001:db8:2::3");
  assert.match(console_(net, "B", "en", "show ipv6 access-list"), /permit icmp any host 2001:DB8:2::3 echo-request \(\d+ match(es)?\) sequence 10/);
});

test("DHCPv6 through a relay; a host-mode router takes its default from RAs", () => {
  const net = new Network({ devices: [R("CL"), R("RL"), R("SV")], links: [["CL", G(0), "RL", G(0)], ["RL", G(1), "SV", G(0)]] });
  applyConfig(net, "SV", ["ipv6 unicast-routing", "ipv6 dhcp pool LAN", " address prefix 2001:db8:10::/64", " dns-server 2001:db8::53",
    "interface g0/0", " ipv6 address 2001:db8:23::3/64", " ipv6 dhcp server LAN", " no shutdown", "ipv6 route 2001:db8:10::/64 2001:db8:23::2"]);
  applyConfig(net, "RL", ["ipv6 unicast-routing", "interface g0/0", " ipv6 address 2001:db8:10::1/64", " no shutdown", "interface g0/1", " ipv6 address 2001:db8:23::2/64", " no shutdown"]);
  applyConfig(net, "CL", ["interface g0/0", " ipv6 enable", " ipv6 address dhcp", " no shutdown"]);
  assert.ok(!net.check({ type: "dhcp6-lease", device: "CL", intf: "g0/0" }), "no server on the segment and no relay yet");
  applyConfig(net, "RL", ["interface g0/0", " ipv6 nd managed-config-flag", " ipv6 dhcp relay destination 2001:db8:23::3"]);
  assert.ok(net.check({ type: "dhcp6-lease", device: "CL", intf: "g0/0", prefix: "2001:db8:10::/64" }));
  assert.ok(net.routes6("CL").some((r) => r.code === "ND" && r.len === 0));
  assert.ok(net.ping("CL", "2001:db8:23::3").ok);
  assert.match(console_(net, "SV", "en", "show ipv6 dhcp binding"), /Address: 2001:DB8:10::/);
  const saved = JSON.parse(JSON.stringify(net.toJSON()));
  assert.ok(new Network(net.spec, saved).check({ type: "dhcp6-lease", device: "CL", intf: "g0/0" }), "leases survive a save");
});

test("debug ip routing, Null0 statics and ip route ... Null0 forms", () => {
  const net = new Network({ devices: [R("A"), R("B")], links: [["A", G(0), "B", G(0)]] });
  applyConfig(net, "A", [...ip4("g0/0", "10.0.0.1"), "router ospf 1", " network 10.0.0.0 0.0.0.255 area 0"]);
  applyConfig(net, "B", [...ip4("g0/0", "10.0.0.2"), "router ospf 1", " network 10.0.0.0 0.0.0.255 area 0"]);
  console_(net, "A", "en", "debug ip routing");
  const b = new Session(net, "B");
  for (const l of ["en", "conf t", "interface loopback5", "ip address 5.5.5.5 255.255.255.255", "router ospf 1"]) b.input(l);
  b.input("network 5.5.5.5 0.0.0.0 area 0");
  assert.match(b.events.A.join("\n"), /RT: add 5\.5\.5\.5\/32 via 10\.0\.0\.2, ospf metric \[110\/2\]/);
  applyConfig(net, "A", ["ip route 172.16.0.0 255.255.0.0 Null0", "ip route 172.17.0.0 255.255.0.0 null 0 250"]);
  assert.match(console_(net, "A", "en", "show ip route static"), /S +172\.16\.0\.0\/16 is directly connected, Null0/);
  assert.equal(route(net, "A", "172.17.0.0/16").ad, 250);
  assert.match(console_(net, "A", "en", "ping 172.16.1.1"), /\.\.\.\.\.\nSuccess rate is 0 percent/);
  assert.match(console_(net, "A", "en", "show running-config"), /ip route 172\.16\.0\.0 255\.255\.0\.0 Null0\nip route 172\.17\.0\.0 255\.255\.0\.0 Null0 250/);
});

test("CCNP help text fits its context", () => {
  const net = new Network({ devices: [R("R1")], links: [] });
  const s = new Session(net, "R1");
  for (const l of ["en", "conf t", "router ospf 1"]) s.input(l);
  assert.match(s.help("area 1 "), /nssa +Specify a NSSA area[\s\S]*stub +Specify a stub area[\s\S]*virtual-link +Define a virtual link/);
  assert.match(s.help("redistribute static "), /metric +Metric for redistributed routes[\s\S]*metric-type +OSPF\/IS-IS exterior metric type[\s\S]*subnets +Consider subnets/);
  assert.match(s.help("redistribute static subnets "), /metric +Metric for redistributed routes/);
  s.input("router eigrp 1");
  assert.match(s.help("eigrp stub "), /connected +Do advertise connected routes[\s\S]*receive-only +Set receive only neighbor[\s\S]*summary +Do advertise summary routes/);
  s.input("exit");
  assert.match(s.help("ip route 10.0.0.0 255.0.0.0 10.1.1.1 "), /track +Install route depending on tracked item/);
});

// ---------------------------------------------------------------- QoS and management services
// R1 g0/1 - PC1, R1 g0/0 - R2 g0/0, R2 g0/1 - PC2; static routes both ways, R2 has loopback 2.2.2.2.
function svcNet() {
  const net = new Network({ devices: [R("R1"), R("R2"), P("PC1"), P("PC2")],
    links: [["R1", G(1), "PC1", "eth0"], ["R1", G(0), "R2", G(0)], ["R2", G(1), "PC2", "eth0"]] });
  applyConfig(net, "R1", ["hostname R1", "interface g0/0", "ip address 10.12.0.1 255.255.255.0", "no shutdown", "interface g0/1",
    "ip address 192.168.1.1 255.255.255.0", "no shutdown", "interface loopback0", "ip address 1.1.1.1 255.255.255.255", "exit",
    "ip route 0.0.0.0 0.0.0.0 10.12.0.2"]);
  applyConfig(net, "R2", ["hostname R2", "interface g0/0", "ip address 10.12.0.2 255.255.255.0", "no shutdown", "interface g0/1",
    "ip address 192.168.2.1 255.255.255.0", "no shutdown", "interface loopback0", "ip address 2.2.2.2 255.255.255.255", "exit",
    "ip route 192.168.1.0 255.255.255.0 10.12.0.1", "ip route 1.1.1.1 255.255.255.255 10.12.0.1"]);
  applyConfig(net, "PC1", ["ip 192.168.1.10/24 192.168.1.1"]);
  applyConfig(net, "PC2", ["ip 192.168.2.100/24 192.168.2.1"]);
  return net;
}
const svcCon = (net, dev, ...lines) => {
  const s = new Session(net, dev);
  s.greeting();
  s.input("enable");
  return lines.map((l) => s.input(l)).join("\n");
};

test("QoS: class-maps, marking seen downstream, policing by size, input queueing refused", () => {
  const net = svcNet();
  svcCon(net, "R1", "conf t", "class-map match-all ICMP", "match protocol icmp", "policy-map OUT", "class ICMP", "set dscp ef",
    "police cir 8000 bc 1500", "conform-action transmit", "exceed-action drop", "class class-default", "interface g0/0", "service-policy output OUT", "end");
  assert.equal(net.devs.R1.cfg.svc.qos.policies.OUT.classes.length, 2, "\"class class-default\" climbs out of the police and class modes");
  svcCon(net, "R2", "conf t", "class-map match-any EF", "match dscp ef", "policy-map IN", "class EF", "interface g0/0", "service-policy input IN", "end");
  console_(net, "PC1", "ping 192.168.2.100 -c 3");
  assert.ok(net.check({ type: "qos-marked", device: "R1", intf: "Gi0/0", dir: "output", class: "ICMP", min: 2 }));
  assert.ok(net.check({ type: "qos-class", device: "R2", intf: "Gi0/0", dir: "input", class: "EF", min: 2 }), "R2 sees the EF marking");
  assert.ok(!net.check({ type: "qos-police", device: "R1", intf: "Gi0/0", dir: "output", class: "ICMP", exceeded: 1 }), "small pings conform");
  const big = console_(net, "PC1", "ping 192.168.2.100 -c 4 -l 1000");
  assert.match(big, /1028 bytes from 192\.168\.2\.100/);
  assert.match(big, /timeout/, "big pings beyond the burst are dropped");
  assert.ok(net.check({ type: "qos-police", device: "R1", intf: "Gi0/0", dir: "output", class: "ICMP", conformed: 1, exceeded: 1 }));
  const show = svcCon(net, "R1", "show policy-map interface g0/0");
  assert.match(show, /Service-policy output: OUT\n\n {4}Class-map: ICMP \(match-all\)/);
  assert.match(show, /police:\n {10}cir 8000 bps, bc 1500 bytes\n {8}conformed \d+ packets/);
  assert.match(show, /Class-map: class-default \(match-any\)/);
  const run = runningConfig(net, "R1");
  assert.match(run, /policy-map OUT\n class ICMP\n  set dscp ef\n  police cir 8000 bc 1500\n   conform-action transmit \n   exceed-action drop \n class class-default/);
  const q = svcCon(net, "R2", "conf t", "policy-map Q", "class EF", "priority percent 30", "bandwidth 100", "interface g0/1", "service-policy input Q");
  assert.match(q, /Cannot configure bandwidth and priority in the same class/);
  assert.match(q, /only supported in the output direction/);
  assert.match(svcCon(net, "R1", "ping 2.2.2.2 repeat 2 size 200 timeout 1 df-bit"), /Sending 2, 200-byte ICMP Echos/);
  assert.match(svcCon(net, "R1", "conf t", "policy-map X", "class NOPE"), /class-map NOPE not configured/);
});

test("switch QoS: an untrusted port with mls qos rewrites DSCP to 0", () => {
  const net = new Network({ devices: [R("R1"), R("R2"), S("SW1"), P("PC1")],
    links: [["SW1", F(1), "PC1", "eth0"], ["SW1", G(1), "R1", G(1)], ["R1", G(0), "R2", G(0)]] });
  applyConfig(net, "R1", ["interface g0/1", "ip address 192.168.1.1 255.255.255.0", "no shutdown", "interface g0/0", "ip address 10.12.0.1 255.255.255.0", "no shutdown"]);
  applyConfig(net, "R2", ["interface g0/0", "ip address 10.12.0.2 255.255.255.0", "no shutdown", "ip route 192.168.1.0 255.255.255.0 10.12.0.1",
    "class-map match-any EF", "match dscp ef", "policy-map IN", "class EF", "interface g0/0", "service-policy input IN"]);
  applyConfig(net, "R1", ["class-map CS0", "match dscp default", "policy-map COUNT", "class CS0", "interface g0/1", "service-policy input COUNT"]);
  applyConfig(net, "SW1", ["mls qos"]);
  applyConfig(net, "PC1", ["ip 192.168.1.10/24 192.168.1.1"]);
  const s = new Session(net, "R1");
  s.input("enable");
  // R1 sources EF pings itself; nothing rewrites them, so R2 counts them.
  s.input("ping 10.12.0.2 repeat 3 tos 184");
  assert.ok(net.check({ type: "qos-class", device: "R2", intf: "Gi0/0", dir: "input", class: "EF", min: 2 }));
  console_(net, "PC1", "ping 10.12.0.2 -c 2");
  assert.ok(net.check({ type: "qos-class", device: "R1", intf: "Gi0/1", dir: "input", class: "CS0", min: 1 }));
  assert.match(console_(net, "SW1", "en", "show mls qos interface g0/1"), /trust state: not trusted/);
  applyConfig(net, "SW1", ["interface f0/1", "auto qos voip trust"]);
  assert.match(console_(net, "SW1", "en", "show mls qos interface f0/1"), /trust state: trust dscp/);
  assert.match(runningConfig(net, "SW1"), /^mls qos$/m);
});

test("AAA: method lists, local fallback when RADIUS is down, exec authorization and the console", () => {
  const net = svcNet();
  applyConfig(net, "R2", ["username netadmin privilege 15 secret Cisc0Admin!", "aaa new-model", "radius server ISE", "address ipv4 10.12.0.100 auth-port 1812 acct-port 1813",
    "key R4diusKey", "exit", "aaa group server radius ISE-GROUP", "server name ISE", "exit", "aaa authentication login VTY group ISE-GROUP local",
    "line vty 0 4", "login authentication VTY", "transport input telnet ssh"]);
  const s = new Session(net, "R1");
  s.input("enable");
  s.input("telnet 10.12.0.2");
  assert.equal(s.prompt(), "Username: ");
  s.input("netadmin");
  s.input("Cisc0Admin!");
  assert.equal(s.prompt(), "R2>", "without exec authorization a privilege 15 user starts at level 1");
  s.input("exit");
  applyConfig(net, "R2", ["aaa authorization exec default local"]);
  s.input("telnet 10.12.0.2");
  s.input("netadmin");
  s.input("Cisc0Admin!");
  assert.equal(s.prompt(), "R2#");
  assert.match(s.input("show privilege"), /Current privilege level is 15/);
  s.input("exit");
  s.input("telnet 10.12.0.2");
  s.input("netadmin");
  assert.match(s.input("wrong"), /% Authentication failed/);
  assert.ok(net.check({ type: "login", device: "R2", line: "vty", user: "netadmin", password: "Cisc0Admin!", level: 15 }));
  assert.ok(net.check({ type: "login", device: "R2", line: "con", password: "" }), "no default list: the console needs no login");
  // A list that doesn't exist locks the lines.
  assert.match(console_(net, "R2", "en", "conf t", "line vty 0 4", "login authentication NOPE"), /AAA: Warning, authentication list "NOPE" is not defined/);
  assert.ok(!net.check({ type: "login", device: "R2", line: "vty", user: "netadmin", password: "Cisc0Admin!" }));
  const run = runningConfig(net, "R2");
  assert.match(run, /^aaa new-model$/m);
  assert.match(run, /^radius server ISE\n address ipv4 10\.12\.0\.100 auth-port 1812 acct-port 1813\n key R4diusKey$/m);
  assert.match(run, /^line vty 0 4\n login authentication NOPE\n transport input telnet ssh$/m, "no plain login lines under AAA");
  assert.match(console_(net, "R2", "en", "show aaa servers"), /State: current DEAD/);
});

test("privilege levels, password length and login block-for", () => {
  const net = svcNet();
  applyConfig(net, "R2", ["enable secret level 5 Level5pass", "privilege exec level 5 show running-config", "security passwords min-length 10"]);
  assert.match(console_(net, "R2", "en", "conf t", "enable secret short"), /Password too short - must be at least 10 characters/);
  const s = new Session(net, "R2");
  s.input("enable 5");
  s.input("Level5pass");
  assert.equal(s.prompt(), "R2#");
  assert.match(s.input("show privilege"), /level is 5/);
  assert.match(s.input("show running-config"), /hostname R2/, "opened up at level 5");
  assert.match(s.input("configure terminal"), /% Invalid input detected/, "still level 15 only");
  assert.match(runningConfig(net, "R2"), /^enable secret level 5 5 \$1\$/m);
  assert.match(runningConfig(net, "R2"), /^privilege exec level 5 show running-config$/m);
  applyConfig(net, "R2", ["username admin secret LongEnough1", "login block-for 60 attempts 2 within 30", "line vty 0 4", "login local"]);
  const t = new Session(net, "R1");
  t.input("enable");
  t.input("telnet 10.12.0.2");
  t.input("admin");
  t.input("bad1");
  t.input("admin");
  t.input("bad2");
  assert.ok(net.check({ type: "quiet-mode", device: "R2" }));
  t.interrupt();
  assert.match(t.input("telnet 10.12.0.2"), /% Connection refused by remote host/);
  assert.match(console_(net, "R2", "en", "show login"), /Router presently in Quiet-Mode/);
});

test("syslog: console level, buffer, sequence numbers, hosts and SNMP traps", () => {
  const net = svcNet();
  const out = svcCon(net, "R1", "conf t", "logging console warnings", "logging buffered 16384 informational", "service sequence-numbers",
    "logging host 192.168.1.10", "snmp-server community N3tR3ad RO", "snmp-server enable traps snmp linkdown linkup", "snmp-server host 192.168.1.10 version 2c N3tR3ad",
    "interface loopback0", "shutdown", "no shutdown", "end");
  assert.match(out, /^\d{6}: \*\w+ +\d+ [\d:.]+: %LINK-3-UPDOWN: Interface Loopback0, changed state to up$/m, "severity 3 still reaches the console");
  assert.doesNotMatch(out, /%LINEPROTO-5/, "severity 5 is above the console level");
  const log = svcCon(net, "R1", "show logging");
  assert.match(log, /Console logging: level warnings/);
  assert.match(log, /Buffer logging: {2}level informational, \d+ messages logged/);
  assert.match(log, /Logging to 192\.168\.1\.10 {2}\(udp port 514, audit disabled,\n {14}link up\)/);
  assert.match(log, /Log Buffer \(16384 bytes\):\n\n[\s\S]*%LINEPROTO-5-UPDOWN: Line protocol on Interface Loopback0, changed state to up/);
  assert.ok(net.check({ type: "log-host", device: "R1", host: "192.168.1.10", min: 2 }));
  assert.ok(net.check({ type: "snmp-traps", device: "R1", host: "192.168.1.10", min: 2 }));
  assert.match(svcCon(net, "R1", "show snmp"), /\d+ Trap PDUs/);
  const run = runningConfig(net, "R1");
  for (const l of ["service sequence-numbers", "logging buffered 16384 informational", "logging console warnings", "logging host 192.168.1.10",
    "snmp-server enable traps snmp linkdown linkup", "snmp-server host 192.168.1.10 version 2c N3tR3ad"]) assert.ok(run.includes("\n" + l + "\n"), l);
});

test("SNMP: community ACLs and SNMPv3 users decide who may read and write", () => {
  const net = svcNet();
  applyConfig(net, "R1", ["access-list 10 permit 192.168.1.0 0.0.0.255", "snmp-server community N3tR3ad RO 10", "snmp-server view ALL iso included",
    "snmp-server group OPS v3 priv read ALL", "snmp-server user nms OPS v3 auth sha Auth#Pass1 priv aes 128 Priv#Pass1"]);
  assert.ok(net.check({ type: "snmp-access", device: "R1", from: "PC1", community: "N3tR3ad" }));
  assert.ok(net.check({ type: "snmp-access", device: "R1", from: "PC2", community: "N3tR3ad", ok: false }), "ACL 10 refuses the other LAN");
  assert.ok(net.check({ type: "snmp-access", device: "R1", from: "PC1", community: "N3tR3ad", write: true, ok: false }));
  assert.ok(net.check({ type: "snmp-access", device: "R1", from: "PC2", user: "nms", auth: "Auth#Pass1", priv: "Priv#Pass1" }));
  assert.ok(net.check({ type: "snmp-access", device: "R1", from: "PC2", user: "nms", auth: "Auth#Pass1", priv: "nope", ok: false }));
  assert.match(svcCon(net, "R1", "show snmp user"), /User name: nms[\s\S]*Authentication Protocol: SHA\nPrivacy Protocol: AES128\nGroup-name: OPS/);
  assert.doesNotMatch(runningConfig(net, "R1"), /snmp-server user/, "IOS never shows v3 users in the running-config");
});

test("NTP: master, authenticated client, a chain, and the clock losing its *", () => {
  const net = svcNet();
  assert.match(svcCon(net, "R1", "show ntp status"), /^Clock is unsynchronized, stratum 16, no reference clock/);
  applyConfig(net, "R2", ["ntp master 3", "ntp authentication-key 1 md5 T1meKey"]);
  applyConfig(net, "R1", ["ntp authentication-key 1 md5 T1meKey", "ntp authenticate", "ntp server 10.12.0.2 key 1"]);
  assert.ok(!net.check({ type: "ntp-sync", device: "R1" }), "a key that isn't trusted is ignored");
  applyConfig(net, "R1", ["ntp trusted-key 1"]);
  assert.ok(net.check({ type: "ntp-sync", device: "R1", peer: "10.12.0.2", stratum: 4 }));
  assert.match(svcCon(net, "R1", "show ntp associations"), /\*~10\.12\.0\.2 +127\.127\.1\.1 +3 /);
  assert.match(svcCon(net, "R1", "show clock"), /^\w{3} +\d+ [\d:.]+ UTC$/, "synchronised: no leading *");
  applyConfig(net, "R2", ["no ntp authentication-key 1", "ntp authentication-key 1 md5 Different"]);
  assert.ok(!net.check({ type: "ntp-sync", device: "R1" }), "a different key value breaks the sync");
  assert.match(svcCon(net, "R1", "show clock"), /^\*/);
  assert.match(runningConfig(net, "R1"), /^ntp authentication-key 1 md5 \S+ 7\nntp authenticate\nntp trusted-key 1\nntp server 10\.12\.0\.2 key 1$/m);
});

test("Flexible NetFlow and traditional NetFlow fill their caches from real traffic", () => {
  const net = svcNet();
  applyConfig(net, "R1", ["flow record REC", "match ipv4 source address", "match ipv4 destination address", "match ipv4 protocol", "collect counter bytes long",
    "collect counter packets long", "exit", "flow exporter EXP", "destination 192.168.2.100", "transport udp 2055", "exit", "flow monitor MON",
    "record REC", "exporter EXP", "exit", "interface g0/1", "ip flow monitor MON input", "ip flow ingress"]);
  console_(net, "PC1", "ping 192.168.2.100 -c 3");
  assert.ok(net.check({ type: "flow", device: "R1", monitor: "MON", src: "192.168.1.10", dst: "192.168.2.100", min: 3 }));
  assert.ok(net.check({ type: "flow", device: "R1", src: "192.168.1.10", dst: "192.168.2.100" }), "traditional cache too");
  const cache = svcCon(net, "R1", "show flow monitor MON cache");
  assert.match(cache, /IPV4 SOURCE ADDRESS +IPV4 DESTINATION ADDRESS +IP PROT +bytes long +pkts long/);
  assert.match(cache, /192\.168\.1\.10 +192\.168\.2\.100 +1 +252 +3/);
  assert.match(svcCon(net, "R1", "show flow exporter EXP"), /Export statistics: [1-9]\d* records sent/);
  assert.match(svcCon(net, "R1", "show ip cache flow"), /Gi0\/1 +192\.168\.1\.10 +Gi0\/0 +192\.168\.2\.100 +01/);
  assert.match(svcCon(net, "R1", "conf t", "flow monitor EMPTY", "exit", "interface g0/0", "ip flow monitor EMPTY input"), /does not have a flow record assigned/);
});

test("LLDP neighbours and EEM applets that react to syslog", () => {
  const net = svcNet();
  applyConfig(net, "R1", ["lldp run"]);
  assert.ok(!net.check({ type: "lldp-nbr", device: "R1", neighbor: "R2" }));
  applyConfig(net, "R2", ["lldp run"]);
  assert.ok(net.check({ type: "lldp-nbr", device: "R1", intf: "Gi0/0", neighbor: "R2" }));
  assert.match(svcCon(net, "R1", "show lldp neighbors"), /R2 +Gi0\/0 +120 +R +Gi0\/0\n\nTotal entries displayed: 1/);
  applyConfig(net, "R2", ["interface g0/0", "no lldp transmit"]);
  assert.ok(!net.check({ type: "lldp-nbr", device: "R1", neighbor: "R2" }));
  applyConfig(net, "R1", ["logging buffered 8192 informational", "event manager applet KEEPUP",
    'event syslog pattern "Interface GigabitEthernet0/0, changed state to administratively down"', 'action 1.0 cli command "enable"',
    'action 2.0 cli command "configure terminal"', 'action 3.0 cli command "interface g0/0"', 'action 4.0 cli command "no shutdown"',
    'action 5.0 syslog msg "re-enabled"']);
  const out = svcCon(net, "R1", "conf t", "interface g0/0", "shutdown");
  assert.match(out, /%HA_EM-6-LOG: KEEPUP: re-enabled/);
  assert.ok(net.check({ type: "eem-ran", device: "R1", applet: "KEEPUP" }));
  assert.ok(net.check({ type: "ifup", device: "R1", intf: "Gi0/0" }), "the applet brought it back");
  assert.match(svcCon(net, "R1", "show logging"), /%SYS-5-CONFIG_I: Configured from console by  on vty0 \(EEM:KEEPUP\)/);
  assert.match(svcCon(net, "R1", "show event manager policy registered"), /applet +user +syslog[\s\S]* pattern \{Interface GigabitEthernet0\/0/);
});

test("name resolution: ip host, ping by name and typing a host name telnets to it", () => {
  const net = svcNet();
  applyConfig(net, "R1", ["ip host CORE 10.12.0.2"]);
  assert.match(svcCon(net, "R1", "ping CORE"), /Sending 5, 100-byte ICMP Echos to 10\.12\.0\.2/);
  assert.match(svcCon(net, "R1", "CORE"), /Trying 10\.12\.0\.2 \.\.\. /);
  assert.match(svcCon(net, "R1", "show hosts"), /CORE +None +\(perm, OK\) +0 +IP +10\.12\.0\.2/);
  assert.match(svcCon(net, "R1", "show"), /% Type "show \?" for a list of subcommands/);
});

test("EEM: event none applets run on demand and log once", () => {
  const net = svcNet();
  applyConfig(net, "R1", ["logging buffered 8192", "event manager applet HELLO", "event none", 'action 1.0 syslog msg "manual run"']);
  assert.match(svcCon(net, "R1", "event manager run HELLO"), /%HA_EM-6-LOG: HELLO: manual run/);
  assert.equal(net.devs.R1.rt.svc.log.filter((l) => /manual run/.test(l)).length, 1);
  assert.match(svcCon(net, "R1", "event manager run NOPE"), /EEM policy NOPE not registered with event manager/);
  assert.match(runningConfig(net, "R1"), /^event manager applet HELLO\n event none\n action 1\.0 syslog msg "manual run"$/m);
});

// ---------------------------------------------------------------- CCNP switching
const on = (net, dev, ...lines) => applyConfig(net, dev, lines);
const pcs = (net, list) => { for (const [pc, ip] of list) console_(net, pc, "ip " + ip); };
const swTriangle = () => new Network({ devices: [S("SW1"), S("SW2"), S("SW3"), P("PC1"), P("PC2")],
  links: [["SW1", G(1), "SW2", G(1)], ["SW2", G(2), "SW3", G(2)], ["SW1", G(2), "SW3", G(1)], ["SW2", F(1), "PC1", "eth0"], ["SW3", F(1), "PC2", "eth0"]] });

test("MST: instances get their own roots, a region needs matching name, revision and mapping", () => {
  const net = swTriangle();
  const region = ["spanning-tree mode mst", "spanning-tree mst configuration", "name CORE", "revision 1", "instance 1 vlan 10", "instance 2 vlan 20", "exit"];
  for (const sw of ["SW1", "SW2", "SW3"]) on(net, sw, "vlan 10,20", "exit", "interface range g0/1 - 2", "switchport mode trunk", "exit", ...region);
  on(net, "SW2", "spanning-tree mst 1 priority 4096");
  on(net, "SW3", "spanning-tree mst 2 root primary");
  assert.deepEqual(net.mstRegions(), [["SW1", "SW2", "SW3"]]);
  assert.ok(net.check({ type: "mst-root", device: "SW2", instance: 1 }));
  assert.ok(net.check({ type: "mst-root", device: "SW3", instance: 2 }));
  assert.ok(net.check({ type: "mst-root", device: "SW1", instance: 0 }), "lowest MAC is the CIST root");
  // MST uses long path costs: 20000 for a gigabit link.
  assert.equal(net.stp(10).SW1.ports[G(1)].cost, 20000);
  // Instance 1 blocks on SW3, instance 2 on SW2: different VLANs use different links.
  assert.equal(net.stp(10).SW3.ports[G(1)].state, "BLK");
  assert.equal(net.stp(20).SW2.ports[G(1)].state, "BLK");
  const out = console_(net, "SW1", "en", "show spanning-tree mst configuration", "show spanning-tree mst 1");
  assert.match(out, /Name +\[CORE\]\nRevision +1 +Instances configured 3/);
  assert.match(out, /##### MST1 +vlans mapped: +10\nBridge +address 0cd5\.0000\.8000 +priority +32769 \(32768 sysid 1\)/);
  // A different revision splits the region: SW3's ports become boundary ports following the CIST.
  on(net, "SW3", "spanning-tree mst configuration", "revision 2", "exit");
  assert.deepEqual(net.mstRegions(), [["SW1", "SW2"], ["SW3"]]);
  assert.ok(net.stp(10).SW3.ports[G(2)].boundary);
  assert.match(console_(net, "SW3", "en", "show spanning-tree mst 1"), /Bound\(PVST\)/);
  // abort throws away the edits made in the submode.
  on(net, "SW3", "spanning-tree mst configuration", "revision 1", "abort");
  assert.equal(net.devs.SW3.cfg.mst.rev, 2);
  assert.match(runningConfig(net, "SW3"), /spanning-tree mode mst\n[\s\S]*spanning-tree mst 2 priority 24576\n!\nspanning-tree mst configuration\n name CORE\n revision 2\n instance 1 vlan 10\n instance 2 vlan 20/);
});

test("STP protection: root guard, loop guard with BPDU filter, UplinkFast", () => {
  const net = new Network({ devices: [S("SW1"), S("SW2"), S("ROGUE")], links: [["SW1", G(1), "SW2", G(1)], ["SW2", F(24), "ROGUE", F(24)]] });
  on(net, "SW1", "spanning-tree vlan 1 priority 4096");
  on(net, "SW2", "interface f0/24", "spanning-tree guard root");
  on(net, "ROGUE", "spanning-tree vlan 1 priority 0");
  assert.ok(net.check({ type: "stp-root", device: "SW1", vlan: 1 }), "root guard keeps the rogue from taking over");
  assert.ok(net.check({ type: "stp-inconsistent", device: "SW2", intf: "f0/24", vlan: 1, kind: "root" }));
  assert.match(console_(net, "SW2", "en", "show spanning-tree inconsistentports"), /VLAN0001 +FastEthernet0\/24 +Root Inconsistent/);
  on(net, "SW2", "interface f0/24", "no spanning-tree guard");
  assert.ok(!net.check({ type: "stp-root", device: "SW1", vlan: 1 }));

  const t = swTriangle();
  on(t, "SW1", "spanning-tree vlan 1 priority 4096");
  assert.equal(t.stp(1).SW3.ports[G(2)].state, "BLK");
  // The far end filters BPDUs: SW3's alternate port hears nothing and would start forwarding (a loop)...
  on(t, "SW2", "interface g0/2", "spanning-tree bpdufilter enable");
  assert.equal(t.stp(1).SW3.ports[G(2)].state, "FWD");
  // ...unless loop guard holds it.
  on(t, "SW3", "interface g0/2", "spanning-tree guard loop");
  assert.ok(t.check({ type: "stp-inconsistent", device: "SW3", intf: "g0/2", vlan: 1, kind: "loop" }));
  assert.equal(t.stp(1).SW3.ports[G(2)].state, "BKN");

  const u = swTriangle();
  on(u, "SW3", "spanning-tree uplinkfast");
  assert.equal(u.stp(1).SW3.bid[0], 49153, "UplinkFast raises the bridge priority to 49152");
  assert.equal(u.stp(1).SW3.ports[G(1)].cost, 3004, "and adds 3000 to port costs");
  assert.match(console_(u, "SW3", "en", "show spanning-tree summary"), /UplinkFast +is enabled/);
});

test("errdisable recovery brings a port back after the interval, and BPDU guard trips it again", () => {
  const net = new Network({ devices: [S("SW1"), S("SW2")], links: [["SW1", F(1), "SW2", F(1)]] });
  on(net, "SW1", "errdisable recovery cause bpduguard", "errdisable recovery interval 30", "interface f0/1", "spanning-tree portfast", "spanning-tree bpduguard enable");
  assert.ok(net.check({ type: "errdisabled", device: "SW1", intf: "f0/1", reason: "bpduguard" }));
  assert.ok(net.check({ type: "errdisable-recovery", device: "SW1", cause: "bpduguard", interval: 30 }));
  assert.match(console_(net, "SW1", "en", "show errdisable recovery"), /bpduguard +Enabled[\s\S]*Timer interval: 30 seconds[\s\S]*Fa0\/1 +bpduguard/);
  net.skew = 31000;
  const out = console_(net, "SW1", "");
  assert.match(out, /%PM-4-ERR_RECOVER: Attempting to recover from bpduguard err-disable state on Fa0\/1[\s\S]*%PM-4-ERR_DISABLE: bpduguard/);
  // Remove the cause and the next recovery sticks.
  on(net, "SW1", "interface f0/1", "no spanning-tree bpduguard", "no spanning-tree portfast");
  net.skew = 70000;
  console_(net, "SW1", "");
  assert.ok(!net.check({ type: "errdisabled", device: "SW1", intf: "f0/1" }));
  assert.ok(net.portUp("SW1", F(1)));
});

test("VTP: servers propagate, clients can't create VLANs, transparent switches relay and keep their own", () => {
  const net = new Network({ devices: [S("SW1"), S("SW2"), S("SW3"), S("SW4")], links: [["SW1", G(1), "SW2", G(1)], ["SW2", G(2), "SW3", G(1)], ["SW3", G(2), "SW4", G(1)]] });
  for (const sw of ["SW1", "SW2", "SW3", "SW4"]) on(net, sw, "interface range g0/1 - 2", "switchport mode trunk");
  on(net, "SW2", "vtp mode client");
  on(net, "SW3", "vtp mode transparent", "vlan 99", "name LOCAL");
  on(net, "SW4", "vtp mode client");
  on(net, "SW1", "vtp domain CCNP", "vlan 10", "name SALES", "vlan 20");
  for (const sw of ["SW2", "SW4"]) {
    assert.ok(net.check({ type: "vtp-vlan", device: sw, vlan: 10, name: "SALES" }), sw + " learns VLAN 10");
    assert.ok(net.check({ type: "vtp", device: sw, domain: "CCNP", mode: "client" }), sw + " learns the domain");
  }
  assert.ok(net.check({ type: "vtp-vlan", device: "SW3", vlan: 10, absent: true }), "transparent doesn't apply the updates");
  assert.ok(net.check({ type: "vtp-vlan", device: "SW4", vlan: 99, absent: true }), "and doesn't advertise its own VLANs");
  assert.equal(net.devs.SW2.cfg.vtp.rev, net.devs.SW1.cfg.vtp.rev);
  assert.match(console_(net, "SW2", "en", "conf t", "vlan 30"), /VTP VLAN configuration not allowed when device is in CLIENT mode\./);
  assert.match(console_(net, "SW1", "en", "show vtp status"), /VTP Operating Mode +: Server\n[\s\S]*Configuration Revision +: [1-9]/);
  assert.match(runningConfig(net, "SW3"), /\nvtp mode transparent\n[\s\S]*\nvlan 99\n name LOCAL\n!/);
  assert.ok(net.check({ type: "vtp", device: "SW3", domain: "" }), "a transparent switch never learns the domain");
  assert.doesNotMatch(runningConfig(net, "SW1"), /^vlan 10/m, "server-mode VLANs live in vlan.dat, not the running-config");
  // A different password keeps a switch out of the domain's updates.
  on(net, "SW4", "vtp password secret");
  on(net, "SW1", "vlan 40");
  assert.ok(net.check({ type: "vtp-vlan", device: "SW2", vlan: 40 }));
  assert.ok(net.check({ type: "vtp-vlan", device: "SW4", vlan: 40, absent: true }));
});

test("VTP: a switch with a higher revision wipes the domain, and transparent mode resets the revision", () => {
  const mk = () => new Network({ devices: [S("SW1"), S("NEW")], links: [["SW1", G(1), "NEW", G(1)]] });
  const net = mk();
  on(net, "NEW", "interface g0/1", "shutdown", "exit", "vtp domain CCNP", "vlan 100", "vlan 101", "vlan 102", "vlan 103", "vlan 104");
  on(net, "SW1", "vtp domain CCNP", "vlan 10,20", "interface g0/1", "switchport mode trunk");
  assert.ok(net.devs.NEW.cfg.vtp.rev > net.devs.SW1.cfg.vtp.rev);
  on(net, "NEW", "interface g0/1", "no shutdown");
  assert.ok(net.check({ type: "vtp-vlan", device: "SW1", vlan: 10, absent: true }), "SW1's VLANs are overwritten");
  assert.ok(net.check({ type: "vtp-vlan", device: "SW1", vlan: 104 }));
  const safe = mk();
  on(safe, "NEW", "interface g0/1", "shutdown", "exit", "vtp domain CCNP", "vlan 100", "vlan 101", "vlan 102", "vlan 103", "vlan 104", "exit", "vtp mode transparent", "vtp mode client");
  assert.equal(safe.devs.NEW.cfg.vtp.rev, 0, "leaving server mode resets the revision");
  on(safe, "SW1", "vtp domain CCNP", "vlan 10,20", "interface g0/1", "switchport mode trunk");
  on(safe, "NEW", "interface g0/1", "no shutdown");
  assert.ok(safe.check({ type: "vtp-vlan", device: "SW1", vlan: 10 }));
  assert.ok(safe.check({ type: "vtp-vlan", device: "NEW", vlan: 10 }));
});

test("VTP pruning and VTPv3 primary servers", () => {
  const net = new Network({ devices: [S("SW1"), S("SW2"), S("SW3"), P("PC1")], links: [["SW1", G(1), "SW2", G(1)], ["SW1", G(2), "SW3", G(1)], ["SW2", F(1), "PC1", "eth0"]] });
  on(net, "SW1", "vtp domain CCNP", "vtp pruning", "vlan 10,20", "exit", "interface range g0/1 - 2", "switchport mode trunk");
  on(net, "SW2", "vtp mode client", "interface f0/1", "switchport mode access", "switchport access vlan 10");
  on(net, "SW3", "vtp mode client");
  const out = console_(net, "SW1", "en", "show interfaces trunk");
  assert.match(out, /not pruned\nGi0\/1 +1,10\nGi0\/2 +1/);
  const v3 = new Network({ devices: [S("SW1"), S("SW2")], links: [["SW1", G(1), "SW2", G(1)]] });
  for (const sw of ["SW1", "SW2"]) on(v3, sw, "vtp domain CCNP", "vtp version 3", "interface g0/1", "switchport mode trunk");
  assert.match(console_(v3, "SW1", "en", "conf t", "vlan 50"), /not the primary server for vlan database/);
  console_(v3, "SW1", "en", "vtp primary", "");
  on(v3, "SW1", "vlan 50", "name V3");
  assert.ok(v3.check({ type: "vtp-vlan", device: "SW2", vlan: 50, name: "V3" }));
  assert.match(console_(v3, "SW1", "en", "show vtp status"), /VTP Operating Mode +: Primary Server/);
  assert.match(console_(v3, "SW1", "en", "conf t", "vtp version 3"), /^(?![\s\S]*Cannot)/);
  assert.match(console_(new Network({ devices: [S("X")], links: [] }), "X", "en", "conf t", "vtp version 3"), /Cannot set the version to 3 because domain name is not configured/);
});

const fhrpNet = () => {
  const net = new Network({ devices: [R("R1"), R("R2"), R("CORE"), S("SW1"), P("PC1"), P("PC2"), P("PC3")],
    links: [["R1", G(0), "SW1", G(1)], ["R2", G(0), "SW1", G(2)], ["SW1", F(1), "PC1", "eth0"], ["SW1", F(2), "PC2", "eth0"], ["SW1", F(3), "PC3", "eth0"],
      ["R1", G(1), "CORE", G(0)], ["R2", G(1), "CORE", G(1)]] });
  on(net, "CORE", "interface g0/0", "ip address 10.1.0.2 255.255.255.0", "no shutdown", "interface g0/1", "ip address 10.2.0.2 255.255.255.0", "no shutdown",
    "interface loopback0", "ip address 8.8.8.8 255.255.255.255", "exit", "ip route 192.168.1.0 255.255.255.0 10.1.0.1", "ip route 192.168.1.0 255.255.255.0 10.2.0.1");
  on(net, "R1", "interface g0/1", "ip address 10.1.0.1 255.255.255.0", "no shutdown", "exit", "ip route 0.0.0.0 0.0.0.0 10.1.0.2", "track 1 interface g0/1 line-protocol");
  on(net, "R2", "interface g0/1", "ip address 10.2.0.1 255.255.255.0", "no shutdown", "exit", "ip route 0.0.0.0 0.0.0.0 10.2.0.2");
  pcs(net, [["PC1", "192.168.1.11/24 192.168.1.254"], ["PC2", "192.168.1.12/24 192.168.1.254"], ["PC3", "192.168.1.13/24 192.168.1.254"]]);
  return net;
};

test("VRRP: master election, preempt by default, tracking failover, virtual MAC, owner priority 255", () => {
  const net = fhrpNet();
  on(net, "R2", "interface g0/0", "ip address 192.168.1.2 255.255.255.0", "vrrp 1 ip 192.168.1.254", "no shutdown");
  on(net, "R1", "interface g0/0", "ip address 192.168.1.1 255.255.255.0", "vrrp 1 ip 192.168.1.254", "vrrp 1 priority 110", "vrrp 1 track 1 decrement 20", "no shutdown");
  assert.ok(net.check({ type: "fhrp", proto: "vrrp", device: "R1", intf: "g0/0", group: 1, state: "Master" }), "VRRP preempts by default");
  assert.ok(net.ping("PC1", "8.8.8.8").ok);
  console_(net, "PC1", "ping 8.8.8.8 -c 1");
  assert.match(console_(net, "PC1", "show arp"), /00:00:5e:00:01:01 +192\.168\.1\.254/);
  assert.match(console_(net, "R1", "en", "show vrrp brief"), /Gi0\/0 +1 +110 +\d+ +Y +Master +192\.168\.1\.1 +192\.168\.1\.254/);
  const fail = console_(net, "R1", "en", "conf t", "interface g0/1", "shutdown");
  assert.match(fail, /%VRRP-6-STATECHANGE: Gi0\/0 Grp 1 state Master -> Backup/);
  assert.ok(net.check({ type: "fhrp", proto: "vrrp", device: "R2", intf: "g0/0", group: 1, state: "Master" }));
  assert.ok(net.ping("PC1", "8.8.8.8").ok, "traffic follows the new master");
  on(net, "R1", "interface g0/1", "no shutdown");
  assert.ok(net.check({ type: "fhrp", proto: "vrrp", device: "R1", intf: "g0/0", group: 1, state: "Master" }));
  // The router that owns the virtual address always wins with priority 255.
  on(net, "R2", "interface g0/0", "no vrrp 1", "vrrp 1 ip 192.168.1.2");
  on(net, "R1", "interface g0/0", "no vrrp 1", "vrrp 1 ip 192.168.1.2", "vrrp 1 priority 200");
  assert.match(console_(net, "R2", "en", "show vrrp brief"), /Gi0\/0 +1 +255 +\d+ +Y +Y +Master/);
  assert.match(runningConfig(net, "R1"), / vrrp 1 ip 192\.168\.1\.2\n vrrp 1 priority 200\n/);
});

test("VRRPv3 syntax and output", () => {
  const net = fhrpNet();
  assert.match(console_(net, "R1", "en", "conf t", "interface g0/0", "vrrp 1 address-family ipv4"), /Invalid input/);
  on(net, "R1", "fhrp version vrrp v3", "interface g0/0", "ip address 192.168.1.1 255.255.255.0", "no shutdown", "vrrp 1 address-family ipv4", "address 192.168.1.254 primary", "priority 120", "exit-vrrp");
  on(net, "R2", "fhrp version vrrp v3", "interface g0/0", "ip address 192.168.1.2 255.255.255.0", "no shutdown", "vrrp 1 address-family ipv4", "address 192.168.1.254 primary", "exit-vrrp");
  assert.ok(net.check({ type: "fhrp", proto: "vrrp", device: "R1", intf: "g0/0", group: 1, state: "Master" }));
  const out = console_(net, "R1", "en", "show vrrp", "show vrrp brief");
  assert.match(out, /GigabitEthernet0\/0 - Group 1 - Address-Family IPv4\n +State is MASTER/);
  assert.match(out, /Gi0\/0 +1 IPv4 120 +0 +N +Y +MASTER +192\.168\.1\.1\(local\) 192\.168\.1\.254/);
  assert.match(runningConfig(net, "R1"), /fhrp version vrrp v3[\s\S]* vrrp 1 address-family ipv4\n  priority 120\n  address 192\.168\.1\.254 primary\n  exit-vrrp/);
  assert.match(console_(net, "R1", "en", "conf t", "interface g0/0", "vrrp 2 ip 192.168.1.253"), /legacy configuration is disabled/);
  assert.ok(net.ping("PC2", "8.8.8.8").ok);
});

test("GLBP: the AVG hands hosts different forwarders, and a forwarder outlives its router", () => {
  const net = fhrpNet();
  on(net, "R1", "interface g0/0", "ip address 192.168.1.1 255.255.255.0", "glbp 1 ip 192.168.1.254", "glbp 1 priority 110", "glbp 1 preempt", "no shutdown");
  on(net, "R2", "interface g0/0", "ip address 192.168.1.2 255.255.255.0", "glbp 1 ip", "no shutdown");
  assert.ok(net.check({ type: "fhrp", proto: "glbp", device: "R1", intf: "g0/0", group: 1, state: "Active" }));
  assert.ok(net.check({ type: "fhrp", proto: "glbp", device: "R2", intf: "g0/0", group: 1, state: "Standby" }), "R2 learns the virtual IP from the AVG");
  for (const pc of ["PC1", "PC2", "PC3"]) console_(net, pc, "ping 8.8.8.8 -c 2");
  assert.ok(net.check({ type: "glbp-hosts", device: "R1", intf: "g0/0", group: 1, distinct: 2 }));
  assert.match(console_(net, "PC2", "show arp"), /00:07:b4:00:01:02 +192\.168\.1\.254/);
  assert.match(console_(net, "R1", "en", "show glbp brief"), /Gi0\/0 +1 +- +110 +Active +192\.168\.1\.254 +local +192\.168\.1\.2\nGi0\/0 +1 +1 +- +Active +0007\.b400\.0101 +local[\s\S]*Gi0\/0 +1 +2 +- +Listen +0007\.b400\.0102 +192\.168\.1\.2/);
  on(net, "R2", "interface g0/0", "shutdown");
  assert.ok(net.check({ type: "glbp-forwarding", device: "R1", intf: "g0/0", group: 1, count: 2 }), "R1 takes over forwarder 2");
  assert.ok(net.ping("PC2", "8.8.8.8").ok);
  assert.match(runningConfig(net, "R2"), / glbp 1 ip\n/);
  assert.match(runningConfig(net, "R1"), / glbp 1 ip 192\.168\.1\.254\n glbp 1 priority 110\n glbp 1 preempt\n/);
});

test("SPAN, RSPAN and ERSPAN copy the traffic they should, and a destination port stops switching", () => {
  const net = new Network({ devices: [S("SW1"), S("SW2"), R("R1"), R("R2"), P("PC1"), P("PC2"), P("SNIFF1"), P("SNIFF2")],
    links: [["SW1", G(1), "SW2", G(1)], ["SW1", F(1), "PC1", "eth0"], ["SW1", F(2), "PC2", "eth0"], ["SW1", F(24), "SNIFF1", "eth0"], ["SW2", F(24), "SNIFF2", "eth0"],
      ["SW1", G(2), "R1", G(0)], ["R1", G(1), "R2", G(0)]] });
  pcs(net, [["PC1", "10.0.0.1/24 10.0.0.254"], ["PC2", "10.0.0.2/24 10.0.0.254"], ["SNIFF1", "10.0.0.3/24"]]);
  on(net, "R1", "interface g0/0", "ip address 10.0.0.254 255.255.255.0", "no shutdown", "interface g0/1", "ip address 10.12.0.1 255.255.255.0", "no shutdown");
  on(net, "R2", "interface g0/0", "ip address 10.12.0.2 255.255.255.0", "no shutdown", "exit", "ip route 10.0.0.0 255.255.255.0 10.12.0.1");
  assert.ok(net.ping("SNIFF1", "10.0.0.1").ok);
  on(net, "SW1", "monitor session 1 source interface f0/1", "monitor session 1 destination interface f0/24");
  assert.ok(!net.ping("SNIFF1", "10.0.0.1").ok, "a SPAN destination port no longer forwards normal traffic");
  assert.match(console_(net, "SW1", "en", "show interfaces status"), /Fa0\/24 +monitoring/);
  console_(net, "PC1", "ping 10.0.0.2 -c 3");
  assert.ok(net.check({ type: "span-copies", device: "SW1", session: 1, min: 6 }), "both directions of three pings");
  assert.match(console_(net, "SW1", "en", "conf t", "monitor session 2 destination interface f0/1"), /% Interface\(s\) Fa0\/1 already configured as monitor sources for session 1/);
  // RSPAN: copies cross the trunk in VLAN 999, which must be a remote-span VLAN on both switches.
  on(net, "SW1", "vlan 999", "remote-span", "exit", "monitor session 3 source vlan 1 rx", "monitor session 3 destination remote vlan 999", "interface g0/1", "switchport mode trunk");
  on(net, "SW2", "vlan 999", "exit", "monitor session 1 source remote vlan 999", "monitor session 1 destination interface f0/24", "interface g0/1", "switchport mode trunk");
  console_(net, "PC2", "ping 10.0.0.254 -c 2");
  assert.ok(!net.check({ type: "span-copies", device: "SW2", session: 1, min: 1 }), "VLAN 999 isn't remote-span on SW2 yet");
  on(net, "SW2", "vlan 999", "remote-span");
  console_(net, "PC2", "ping 10.0.0.254 -c 2");
  assert.ok(net.check({ type: "span-copies", device: "SW2", session: 1, min: 4 }));
  assert.match(console_(net, "SW2", "en", "show monitor session 1"), /Type +: Remote Destination Session\nSource RSPAN VLAN +: 999\nDestination Ports +: Fa0\/24/);
  // ERSPAN: GRE copies to an IP address, so the destination only has to be routable.
  on(net, "R1", "monitor session 1 type erspan-source", "source interface g0/0", "no shutdown", "destination", "erspan-id 100", "ip address 10.12.0.2", "origin ip address 10.12.0.1");
  on(net, "R2", "monitor session 1 type erspan-destination", "destination interface g0/2", "no shutdown", "source", "erspan-id 100", "ip address 10.12.0.2");
  console_(net, "PC1", "ping 10.0.0.254 -c 2");
  assert.ok(net.check({ type: "span-copies", device: "R2", session: 1, min: 4 }));
  assert.match(runningConfig(net, "R1"), /monitor session 1 type erspan-source\n source interface GigabitEthernet0\/0\n no shutdown\n destination\n  erspan-id 100\n  ip address 10\.12\.0\.2\n  origin ip address 10\.12\.0\.1/);
  assert.match(runningConfig(net, "SW1"), /monitor session 1 source interface FastEthernet0\/1\nmonitor session 1 destination interface FastEthernet0\/24\nmonitor session 3 source vlan 1 rx\nmonitor session 3 destination remote vlan 999/);
});

test("DHCP snooping blocks rogue servers, option 82 needs a trusting server, DAI and IP source guard use the bindings", () => {
  const net = new Network({ devices: [S("SW1"), R("R1"), R("ROGUE"), P("PC1"), P("PC2")],
    links: [["SW1", G(1), "R1", G(0)], ["SW1", F(24), "ROGUE", G(0)], ["SW1", F(1), "PC1", "eth0"], ["SW1", F(2), "PC2", "eth0"]] });
  on(net, "ROGUE", "interface g0/0", "ip address 10.1.1.250 255.255.255.0", "no shutdown", "exit", "ip dhcp pool EVIL", "network 10.1.1.0 255.255.255.0", "default-router 10.1.1.250");
  on(net, "R1", "interface g0/0", "ip address 10.1.1.1 255.255.255.0", "no shutdown", "exit", "ip dhcp excluded-address 10.1.1.1 10.1.1.99",
    "ip dhcp pool LAN", "network 10.1.1.0 255.255.255.0", "default-router 10.1.1.1");
  assert.match(console_(net, "PC1", "ip dhcp"), /GW 10\.1\.1\.250/, "without snooping the rogue answers first");
  console_(net, "PC1", "clear ip");
  on(net, "SW1", "ip dhcp snooping", "ip dhcp snooping vlan 1");
  assert.match(console_(net, "PC1", "ip dhcp"), /Can't find dhcp server/, "nothing is trusted yet");
  assert.match(console_(net, "SW1", ""), /%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER/);
  on(net, "SW1", "interface g0/1", "ip dhcp snooping trust");
  assert.match(console_(net, "PC1", "ip dhcp"), /Can't find dhcp server/, "option 82 with giaddr 0 is dropped by the IOS server");
  on(net, "R1", "ip dhcp relay information trust-all");
  assert.match(console_(net, "PC1", "ip dhcp"), /DDORA IP 10\.1\.1\.100\/24 GW 10\.1\.1\.1/);
  assert.ok(net.check({ type: "snoop-binding", device: "SW1", ip: "10.1.1.100", intf: "f0/1" }));
  assert.match(console_(net, "SW1", "en", "show ip dhcp snooping binding"), /00:50:79:66:68:03 +10\.1\.1\.100 +86400 +dhcp-snooping +1 +FastEthernet0\/1/);
  // DAI: the static host and the untrusted uplink fail validation.
  console_(net, "PC2", "ip 10.1.1.50/24 10.1.1.1");
  on(net, "SW1", "ip arp inspection vlan 1");
  assert.ok(!net.ping("PC1", "10.1.1.1").ok, "the router's ARP reply arrives on an untrusted port");
  on(net, "SW1", "interface g0/1", "ip arp inspection trust");
  assert.ok(net.ping("PC1", "10.1.1.1").ok);
  console_(net, "PC2", "ping 10.1.1.1 -c 1");
  assert.ok(net.check({ type: "dai-drops", device: "SW1", min: 1 }));
  on(net, "SW1", "arp access-list STATIC", "permit ip host 10.1.1.50 mac host 0050.7966.6804", "exit", "ip arp inspection filter STATIC vlan 1");
  assert.ok(net.ping("PC2", "10.1.1.1").ok, "an ARP ACL vouches for the static host");
  // IP source guard: only the leased address may be used on the port.
  on(net, "SW1", "interface f0/1", "ip verify source", "exit", "no ip arp inspection vlan 1");
  assert.ok(net.ping("PC1", "10.1.1.1").ok);
  console_(net, "PC1", "ip 10.1.1.77/24 10.1.1.1");
  assert.ok(!net.ping("PC1", "10.1.1.1").ok);
  assert.match(runningConfig(net, "SW1"), /ip dhcp snooping vlan 1\nip dhcp snooping\nip arp inspection filter STATIC vlan 1/);
  assert.match(runningConfig(net, "SW1"), /interface FastEthernet0\/1\n ip verify source\n/);
  assert.match(runningConfig(net, "SW1"), /arp access-list STATIC\n permit ip host 10\.1\.1\.50 mac host 0050\.7966\.6804/);
});

test("private VLANs, protected ports and voice VLANs", () => {
  const net = new Network({ devices: [S("SW1"), R("R1"), P("PC1"), P("PC2"), P("PC3"), P("PC4")],
    links: [["SW1", G(1), "R1", G(0)], ["SW1", F(1), "PC1", "eth0"], ["SW1", F(2), "PC2", "eth0"], ["SW1", F(3), "PC3", "eth0"], ["SW1", F(4), "PC4", "eth0"]] });
  assert.match(console_(net, "SW1", "en", "conf t", "vlan 100", "private-vlan primary"), /Private VLANs can only be configured when VTP is in transparent\/off modes/);
  on(net, "SW1", "vtp mode transparent", "vlan 101", "private-vlan isolated", "vlan 102", "private-vlan community", "vlan 100", "private-vlan primary",
    "private-vlan association 101,102", "interface range f0/1 - 2", "switchport mode private-vlan host", "switchport private-vlan host-association 100 101",
    "interface range f0/3 - 4", "switchport mode private-vlan host", "switchport private-vlan host-association 100 102",
    "interface g0/1", "switchport mode private-vlan promiscuous", "switchport private-vlan mapping 100 101,102");
  on(net, "R1", "interface g0/0", "ip address 10.1.0.1 255.255.255.0", "no shutdown");
  pcs(net, [["PC1", "10.1.0.11/24 10.1.0.1"], ["PC2", "10.1.0.12/24 10.1.0.1"], ["PC3", "10.1.0.13/24 10.1.0.1"], ["PC4", "10.1.0.14/24 10.1.0.1"]]);
  const ok = (a, b) => net.ping(a, b).ok;
  assert.ok(ok("PC1", "10.1.0.1") && ok("PC3", "10.1.0.1"), "everyone reaches the promiscuous port");
  assert.ok(!ok("PC1", "10.1.0.12"), "isolated hosts can't reach each other");
  assert.ok(ok("PC3", "10.1.0.14"), "community hosts can");
  assert.ok(!ok("PC1", "10.1.0.13") && !ok("PC4", "10.1.0.12"), "and the two secondaries are kept apart");
  assert.ok(net.check({ type: "pvlan-port", device: "SW1", intf: "f0/1", mode: "host" }));
  assert.match(console_(net, "SW1", "en", "show vlan private-vlan"), /100 +101 +isolated +Fa0\/1, Fa0\/2, Gi0\/1\n100 +102 +community +Fa0\/3, Fa0\/4, Gi0\/1/);
  assert.match(runningConfig(net, "SW1"), /vlan 100\n private-vlan primary\n private-vlan association 101,102\n!\nvlan 101\n private-vlan isolated/);
  assert.match(runningConfig(net, "SW1"), /interface FastEthernet0\/1\n switchport private-vlan host-association 100 101\n switchport mode private-vlan host\n/);

  const p = new Network({ devices: [S("SW1"), P("PC1"), P("PC2"), P("PC3")], links: [["SW1", F(1), "PC1", "eth0"], ["SW1", F(2), "PC2", "eth0"], ["SW1", F(3), "PC3", "eth0"]] });
  on(p, "SW1", "interface range f0/1 - 2", "switchport mode access", "switchport protected", "interface f0/3", "switchport mode access", "switchport voice vlan 150");
  pcs(p, [["PC1", "10.0.0.1/24"], ["PC2", "10.0.0.2/24"], ["PC3", "10.0.0.3/24"]]);
  assert.ok(!p.ping("PC1", "10.0.0.2").ok, "two protected ports can't talk");
  assert.ok(p.ping("PC1", "10.0.0.3").ok, "a protected port reaches an unprotected one");
  assert.ok(p.check({ type: "voice-vlan", device: "SW1", intf: "f0/3", vlan: 150 }));
  assert.equal(p.egressTag(p.devs.SW1, F(3), 150), 150, "the voice VLAN is tagged");
  assert.equal(p.egressTag(p.devs.SW1, F(3), 1), null, "data stays untagged");
  assert.match(console_(p, "SW1", "en", "show interfaces f0/3 switchport"), /Voice VLAN: 150 \(VLAN0150\)/);
});

test("layer-3 switching: ip routing, SVIs as gateways, a routed uplink and static routes", () => {
  const net = new Network({ devices: [S("MLS"), R("R1"), P("PC1"), P("PC2")], links: [["MLS", G(1), "R1", G(0)], ["MLS", F(1), "PC1", "eth0"], ["MLS", F(2), "PC2", "eth0"]] });
  on(net, "MLS", "vlan 10,20", "interface f0/1", "switchport mode access", "switchport access vlan 10", "interface f0/2", "switchport mode access", "switchport access vlan 20",
    "interface vlan 10", "ip address 10.1.10.1 255.255.255.0", "no shutdown", "interface vlan 20", "ip address 10.1.20.1 255.255.255.0", "no shutdown");
  pcs(net, [["PC1", "10.1.10.10/24 10.1.10.1"], ["PC2", "10.1.20.10/24 10.1.20.1"]]);
  assert.ok(!net.ping("PC1", "10.1.20.10").ok, "a layer-2 switch doesn't route between its SVIs");
  assert.match(console_(net, "MLS", "en", "show ip route"), /^Default gateway is not set/m);
  assert.match(console_(net, "MLS", "en", "conf t", "interface g0/1", "ip address 10.0.0.1 255.255.255.252"), /Invalid input/);
  on(net, "MLS", "ip routing", "interface g0/1", "no switchport", "ip address 10.0.0.1 255.255.255.252", "no shutdown", "exit", "ip route 0.0.0.0 0.0.0.0 10.0.0.2");
  on(net, "R1", "interface g0/0", "ip address 10.0.0.2 255.255.255.252", "no shutdown", "interface loopback0", "ip address 8.8.8.8 255.255.255.255", "exit",
    "ip route 10.1.0.0 255.255.0.0 10.0.0.1");
  assert.ok(net.ping("PC1", "10.1.20.10").ok);
  assert.ok(net.ping("PC1", "8.8.8.8").ok);
  assert.equal(net.ping("PC1", "10.1.20.10").ttl, 63, "the switch decrements the TTL like a router");
  assert.ok(net.check({ type: "route", device: "MLS", prefix: "0.0.0.0/0", code: "S*" }));
  assert.ok(net.check({ type: "routed-port", device: "MLS", intf: "g0/1" }));
  assert.match(console_(net, "MLS", "en", "show interfaces status"), /Gi0\/1 +connected +routed/);
  assert.match(runningConfig(net, "MLS"), /ip routing\n[\s\S]*interface GigabitEthernet0\/1\n no switchport\n ip address 10\.0\.0\.1 255\.255\.255\.252\n[\s\S]*ip route 0\.0\.0\.0 0\.0\.0\.0 10\.0\.0\.2/);
  // An SVI can relay DHCP once the switch routes.
  on(net, "R1", "ip dhcp pool V20", "network 10.1.20.0 255.255.255.0", "default-router 10.1.20.1");
  on(net, "MLS", "interface vlan 20", "ip helper-address 10.0.0.2");
  assert.match(console_(net, "PC2", "ip dhcp"), /DDORA IP 10\.1\.20\.\d+\/24 GW 10\.1\.20\.1/);
});

test("console messages for another device wait for its console, unless the lab page took them", () => {
  const net = new Network({ devices: [S("SW1"), S("SW2")], links: [["SW1", G(1), "SW2", G(1)]] });
  const sw1 = new Session(net, "SW1"), sw2 = new Session(net, "SW2");
  for (const l of ["en", "conf t", "interface g0/1", "switchport mode trunk"]) sw2.input(l);
  const out = ["en", "conf t", "interface g0/1", "switchport mode trunk", "switchport trunk native vlan 99"].map((l) => sw1.input(l)).join("\n");
  assert.match(out, /%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0\/1 \(99\), with Switch GigabitEthernet0\/1 \(1\)\./);
  assert.match(sw2.input(""), /%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0\/1 \(1\), with Switch GigabitEthernet0\/1 \(99\)\./);
  assert.equal(sw2.input(""), "", "shown once");
  // The lab page reads s.consoleLines and writes them into the other console itself: no second copy.
  sw1.input("switchport trunk native vlan 98");
  assert.ok(sw1.consoleLines.SW2.length);
  assert.doesNotMatch(sw2.input(""), /NATIVE_VLAN/);
});

test("a switch with every CCNP feature replays its running-config", () => {
  const net = new Network({ devices: [S("A"), R("B")], links: [] });
  on(net, "A", "vtp domain LAB", "vtp mode transparent", "ip routing", "ip dhcp snooping vlan 10", "ip dhcp snooping", "ip arp inspection vlan 10",
    "errdisable recovery cause psecure-violation", "errdisable recovery interval 60", "spanning-tree mode mst", "spanning-tree loopguard default",
    "spanning-tree mst 1 priority 8192", "spanning-tree mst configuration", "name R1", "revision 3", "instance 1 vlan 10,20", "exit",
    "vlan 10", "name DATA", "vlan 999", "remote-span", "vlan 200", "private-vlan primary", "private-vlan association 201", "vlan 201", "private-vlan isolated",
    "interface f0/1", "switchport mode access", "switchport access vlan 10", "switchport voice vlan 150", "switchport protected", "spanning-tree guard root",
    "storm-control broadcast level 20", "storm-control action trap", "ip verify source", "spanning-tree mst 1 cost 1000",
    "interface f0/2", "switchport mode private-vlan host", "switchport private-vlan host-association 200 201",
    "interface g0/1", "no switchport", "ip address 10.0.0.1 255.255.255.0", "interface g0/2", "switchport mode trunk", "ip dhcp snooping trust", "ip arp inspection trust",
    "spanning-tree bpdufilter enable", "exit", "ip route 0.0.0.0 0.0.0.0 10.0.0.2", "arp access-list HOSTS", "permit ip host 10.0.0.5 mac any", "exit",
    "monitor session 1 source vlan 10 rx", "monitor session 1 destination remote vlan 999");
  on(net, "B", "fhrp version vrrp v3", "interface g0/0", "ip address 10.9.0.2 255.255.255.0", "glbp 5 ip 10.9.0.1", "glbp 5 weighting 110 lower 90 upper 100",
    "glbp 5 load-balancing host-dependent", "ip dhcp relay information trusted", "vrrp 3 address-family ipv4", "address 10.9.0.3 primary", "priority 90", "exit-vrrp");
  for (const dev of ["A", "B"]) {
    const text = runningConfig(net, dev);
    const fresh = new Network({ devices: [S("A"), R("B")], links: [] });
    const keep = (l) => !/^(Building configuration|Current configuration|!|version |end$|no aaa new-model)/.test(l) && l.trim() !== "";
    applyConfig(fresh, dev, text.split("\n").filter(keep).flatMap((l) => (l.startsWith("interface ") ? [l, " no shutdown"] : [l])));
    assert.equal(runningConfig(fresh, dev), text, dev);
  }
});

test("every lab check returns a real boolean at every step of typing the solution", () => {
  // Half-built config is where a check is most likely to trip over a missing field.
  for (const lab of labs.filter((l) => l.tasks.length)) {
    const net = buildLab(lab, null);
    const all = lab.tasks.flatMap((t) => t.checks);
    const verify = (when) => {
      for (const c of all) {
        let v;
        try { v = net.check(c); } catch (e) { throw new Error(`${lab.id}: ${c.type} threw ${e.message} ${when}`); }
        assert.equal(typeof v, "boolean", `${lab.id}: ${c.type} gave ${v} ${when}`);
      }
    };
    verify("before the solution");
    const types = Object.fromEntries(lab.devices.map((d) => [d.name, d.type]));
    for (const [dev, lines] of Object.entries(lab.solution)) {
      const s = new Session(net, dev);
      for (const l of types[dev] === "pc" ? lines : ["enable", "configure terminal", ...lines]) {
        s.input(l);
        verify(`after ${dev}: ${l}`);
      }
    }
  }
});

console.log(`ios: ${passed} tests passed`);
