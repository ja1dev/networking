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
  // Native VLAN 10 on SW1 and 20 on SW2: SW1 sends VLAN 10 untagged, SW2 files it in VLAN 20.
  applyConfig(net, "SW1", ["interface g0/1", "switchport trunk native vlan 10"]);
  applyConfig(net, "SW2", ["interface g0/1", "switchport trunk native vlan 20"]);
  assert.ok(net.ping("A", "10.0.0.2").ok, "native VLAN mismatch hops frames between VLANs");
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
  assert.match(console_(net, "R1", "en", "show access-lists"), /10 deny {3}10\.1\.0\.0 0\.0\.0\.255 \(5 matches\)/);
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
  assert.match(console_(net, "R1", "en", "show ip dhcp binding"), /192\.168\.1\.10 +0100507966/);
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
const replayable = (line) => !/^(Building configuration|Current configuration|!|version |end$|no aaa new-model|enable secret 5|username .* secret 5|banner motd)/.test(line)
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

console.log(`ios: ${passed} tests passed`);
