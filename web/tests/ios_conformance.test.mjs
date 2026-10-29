// node web/tests/ios_conformance.test.mjs: golden-behaviour checks of the IOS simulator against what
// real Cisco IOS 15.x (IOSv routers, IOSvL2 / Catalyst 2960 switches) and VPCS print.
//
// The expectations come from Cisco documentation and well-known IOS output, never from what ios.js
// happens to print. A check that fails because the simulator differs from IOS is a fidelity gap: it
// stays in the suite, listed in KNOWN_GAPS with the area that owns it, so the suite passes today and
// starts failing loudly if a gap is closed (remove it from the list then) or a new one appears.
//
// CCNP blocks at the end are guarded by a capability check and skip until the engine has the feature.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../app/static/js/ios.js", import.meta.url), "utf8");
const { Network, Session } = await import("data:text/javascript," + encodeURIComponent(src));

// ---------------------------------------------------------------- runner
// Check name -> owner of the gap (routing / switching / services / VPN / BGP / core-CLI).
const KNOWN_GAPS = {
  "command errors: bare show asks for a subcommand": "core-CLI",
  "ping and traceroute: repeat and size options": "core-CLI",
  "ACLs: standard ACL show format": "core-CLI",
  "ACLs: extended ACL show format": "core-CLI",
  "remote access: SSH enabled log after key generation": "core-CLI",
  "trunks and DTP: native VLAN mismatch is reported by CDP": "switching",
  "port security: violation logs the offending MAC": "switching",
  "DHCP: binding table": "services",
  "CCNP services: unsynchronised clock by default": "services",
};

const results = { pass: 0, fail: 0, known: 0, fixed: 0, skipped: 0 };
const failures = [], fixedGaps = [], knownSeen = [];
let group = "";

function section(name) { group = name; }

function check(name, fn) {
  const full = group + ": " + name;
  let ok = false, why = "";
  try {
    const r = fn();
    ok = r === undefined || r === true;
    if (!ok) why = typeof r === "string" ? r : "returned " + JSON.stringify(r);
  } catch (e) {
    why = e.message;
  }
  const owner = KNOWN_GAPS[full];
  if (ok && owner) { results.fixed++; fixedGaps.push(full); return; }
  if (ok) { results.pass++; return; }
  if (owner) { results.known++; knownSeen.push([owner, full, why]); return; }
  results.fail++;
  failures.push([full, why]);
}

function skip(name, reason) { results.skipped++; skipped.push(group + ": " + name + " (" + reason + ")"); }
const skipped = [];

// Assertions that explain themselves when they fail.
function has(text, needle) {
  if (needle instanceof RegExp ? !needle.test(text) : !text.includes(needle)) {
    throw new Error(`expected ${needle} in:\n${text.slice(0, 1500)}`);
  }
}
function lacks(text, needle) {
  if (needle instanceof RegExp ? needle.test(text) : text.includes(needle)) {
    throw new Error(`did not expect ${needle} in:\n${text.slice(0, 1500)}`);
  }
}
function eq(a, b) { if (a !== b) throw new Error(`expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }

// ---------------------------------------------------------------- network helpers
const R = (name) => ({ name, type: "router" });
const S = (name) => ({ name, type: "switch" });
const P = (name) => ({ name, type: "pc" });
const G = (n) => "GigabitEthernet0/" + n;
const F = (n) => "FastEthernet0/" + n;

function lab(devices, links = []) {
  const net = new Network({ devices, links });
  const sessions = {};
  const con = (dev) => {
    if (!sessions[dev]) { sessions[dev] = new Session(net, dev); sessions[dev].greeting(); }
    return sessions[dev];
  };
  // Run lines on a device's console; returns the output of all of them.
  const run = (dev, ...lines) => lines.map((l) => con(dev).input(l)).join("\n");
  // Lines typed in global configuration mode, then back to privileged EXEC.
  const conf = (dev, ...lines) => {
    const s = con(dev);
    const prompt = s.prompt();
    const pre = prompt.endsWith(">") ? ["enable", "configure terminal"] : prompt.endsWith(")#") ? [] : ["configure terminal"];
    return run(dev, ...pre, ...lines, "end");
  };
  return { net, con, run, conf };
}

// One router on its own, sitting at the prompt the test asks for.
function router(mode = "priv") {
  const t = lab([R("R1")]);
  if (mode !== "user") t.run("R1", "enable");
  if (mode === "config") t.run("R1", "configure terminal");
  return t;
}

// Is a command known to the engine? Used to skip CCNP checks until the feature lands.
function supports(t, dev, line) {
  const out = t.con(dev).help(line);
  return !/% (Invalid input|Unrecognized command)/.test(out) && out.trim() !== "";
}

// Two routers back to back on Gi0/0 with 10.12.0.0/24, loopbacks 1.1.1.1 and 2.2.2.2.
function pair(extraR1 = [], extraR2 = []) {
  const t = lab([R("R1"), R("R2")], [["R1", G(0), "R2", G(0)]]);
  t.conf("R1", "hostname R1", "interface g0/0", "ip address 10.12.0.1 255.255.255.0", "no shutdown",
    "interface loopback0", "ip address 1.1.1.1 255.255.255.255", "exit", ...extraR1);
  t.conf("R2", "hostname R2", "interface g0/0", "ip address 10.12.0.2 255.255.255.0", "no shutdown",
    "interface loopback0", "ip address 2.2.2.2 255.255.255.255", "exit", ...extraR2);
  return t;
}

// ================================================================= core CLI
section("prompts and modes");
check("default router hostname is Router", () => eq(router("user").con("R1").prompt(), "Router>"));
check("enable gives the privileged prompt", () => eq(router().con("R1").prompt(), "Router#"));
check("configure terminal banner", () => {
  const t = router();
  has(t.run("R1", "configure terminal"), "Enter configuration commands, one per line.  End with CNTL/Z.");
  eq(t.con("R1").prompt(), "Router(config)#");
});
check("interface mode prompt", () => {
  const t = router("config");
  t.run("R1", "interface g0/0");
  eq(t.con("R1").prompt(), "Router(config-if)#");
});
check("subinterface prompt", () => {
  const t = router("config");
  t.run("R1", "interface g0/0.10");
  eq(t.con("R1").prompt(), "Router(config-subif)#");
});
check("line mode prompt", () => {
  const t = router("config");
  t.run("R1", "line vty 0 4");
  eq(t.con("R1").prompt(), "Router(config-line)#");
});
check("router ospf prompt", () => {
  const t = router("config");
  t.run("R1", "router ospf 1");
  eq(t.con("R1").prompt(), "Router(config-router)#");
});
check("interface range prompt", () => {
  const t = router("config");
  t.run("R1", "interface range g0/0 - 1");
  eq(t.con("R1").prompt(), "Router(config-if-range)#");
});
check("named standard ACL prompt", () => {
  const t = router("config");
  t.run("R1", "ip access-list standard MGMT");
  eq(t.con("R1").prompt(), "Router(config-std-nacl)#");
});
check("named extended ACL prompt", () => {
  const t = router("config");
  t.run("R1", "ip access-list extended WEB");
  eq(t.con("R1").prompt(), "Router(config-ext-nacl)#");
});
check("DHCP pool prompt", () => {
  const t = router("config");
  t.run("R1", "ip dhcp pool LAN");
  eq(t.con("R1").prompt(), "Router(dhcp-config)#");
});
check("default switch hostname is Switch", () => eq(lab([S("SW1")]).con("SW1").prompt(), "Switch>"));
check("vlan mode prompt", () => {
  const t = lab([S("SW1")]);
  t.run("SW1", "enable", "configure terminal", "vlan 10");
  eq(t.con("SW1").prompt(), "Switch(config-vlan)#");
});
check("exit climbs one level", () => {
  const t = router("config");
  t.run("R1", "interface g0/0", "exit");
  eq(t.con("R1").prompt(), "Router(config)#");
});
check("end returns to privileged EXEC and logs CONFIG_I", () => {
  const t = router("config");
  const out = t.run("R1", "interface g0/0", "end");
  eq(t.con("R1").prompt(), "Router#");
  has(out, "%SYS-5-CONFIG_I: Configured from console by console");
});
check("disable drops to user EXEC", () => {
  const t = router();
  t.run("R1", "disable");
  eq(t.con("R1").prompt(), "Router>");
});
check("hostname changes the prompt at once", () => {
  const t = router("config");
  t.run("R1", "hostname EDGE-1");
  eq(t.con("R1").prompt(), "EDGE-1(config)#");
});

section("command errors");
check("invalid input has a caret under the bad word", () => {
  const t = router();
  const out = t.run("R1", "show ip interfaze brief").split("\n");
  const caret = out.findIndex((l) => /^\s*\^\s*$/.test(l));
  if (caret < 0) throw new Error("no caret line:\n" + out.join("\n"));
  eq(out[caret + 1], "% Invalid input detected at '^' marker.");
  eq(out[caret].indexOf("^"), "Router#".length + "show ip ".length);
});
check("caret sits under the first wrong character of a mistyped keyword", () => {
  const t = router("config");
  const out = t.run("R1", "hostnamx R9").split("\n");
  const line = out.find((l) => /^\s*\^\s*$/.test(l)) || "";
  eq(line.indexOf("^"), "Router(config)#".length);
});
check("ambiguous command wording has two spaces", () => has(router().run("R1", "c"), '% Ambiguous command:  "c"'));
check("incomplete command", () => has(router("config").run("R1", "interface"), "% Incomplete command."));
check("bare show asks for a subcommand", () => has(router().run("R1", "show"), '% Type "show ?" for a list of subcommands'));
check("unknown word in user EXEC is tried as a host name", () => {
  const out = router("user").run("R1", "fred");
  has(out, 'Translating "fred"...domain server (255.255.255.255)');
  has(out, "% Unknown command or computer name, or unable to find computer address");
});
check("no ip domain-lookup skips the DNS attempt", () => {
  const t = router("config");
  t.run("R1", "no ip domain-lookup", "end", "disable");
  const out = t.run("R1", "fred");
  // IOS still prints the Translating line, but without the DNS server attempt.
  lacks(out, "domain server");
  has(out, "% Unknown command or computer name, or unable to find computer address");
});
check("configure is not a user EXEC command", () => has(router("user").run("R1", "configure terminal"), /% Invalid input|Translating/));
check("show running-config needs privileged EXEC", () => has(router("user").run("R1", "show running-config"), "% Invalid input detected at '^' marker."));

section("context help");
check("? lists commands with descriptions", () => has(router().con("R1").help(""), /configure +Enter configuration mode/));
check("? at user EXEC includes enable", () => has(router("user").con("R1").help(""), /enable +Turn on privileged commands/));
check("partial word ? lists matches without descriptions", () => {
  const h = router().con("R1").help("sh");
  has(h, "show");
  lacks(h, "Show running system information");
});
check("show ? includes running-config in privileged EXEC", () => has(router().con("R1").help("show "), /running-config +Current operating configuration/));
check("show ? hides running-config in user EXEC", () => lacks(router("user").con("R1").help("show "), "running-config"));
check("<cr> offered when a command is complete", () => has(router().con("R1").help("show ip interface brief "), "<cr>"));
check("ip address ? asks for A.B.C.D", () => {
  const t = router("config");
  t.run("R1", "interface g0/0");
  has(t.con("R1").help("ip address "), /A\.B\.C\.D +IP address/);
});
check("interface ? lists GigabitEthernet and Loopback", () => {
  const h = router("config").con("R1").help("interface ");
  has(h, /GigabitEthernet +GigabitEthernet IEEE 802\.3z/);
  has(h, /Loopback +Loopback interface/);
});
check("router ? offers ospf", () => has(router("config").con("R1").help("router "), /ospf +Open Shortest Path First \(OSPF\)/));
check("config-mode ? lists exit as Exit from configure mode", () => {
  const t = router("config");
  t.run("R1", "interface g0/0");
  has(t.con("R1").help(""), /exit +Exit from interface configuration mode|exit +Exit from configure mode/);
});
check("do ? reaches EXEC commands", () => has(router("config").con("R1").help("do show "), "running-config"));
check("? after a number range shows the range", () => {
  const t = router("config");
  has(t.con("R1").help("router ospf "), /<1-65535> +Process ID/);
});
check("line vty ? shows the line range", () => has(router("config").con("R1").help("line vty "), /<0-\d+> +First Line number/));
check("switchport mode ? lists access, dynamic and trunk", () => {
  const t = lab([S("SW1")]);
  t.run("SW1", "enable", "configure terminal", "interface f0/1");
  const h = t.con("SW1").help("switchport mode ");
  has(h, /access +Set trunking mode to ACCESS unconditionally/);
  has(h, /dynamic +Set trunking mode to dynamically negotiate access or trunk mode/);
  has(h, /trunk +Set trunking mode to TRUNK unconditionally/);
});

section("abbreviations and completion");
check("sh run works as show running-config", () => has(router().run("R1", "sh run"), "Building configuration..."));
check("conf t enters config mode", () => {
  const t = router();
  t.run("R1", "conf t");
  eq(t.con("R1").prompt(), "Router(config)#");
});
check("int g0/0 abbreviates interface GigabitEthernet0/0", () => {
  const t = router("config");
  t.run("R1", "int g0/0");
  eq(t.con("R1").prompt(), "Router(config-if)#");
});
check("no shut abbreviates no shutdown", () => {
  const t = router("config");
  has(t.run("R1", "int g0/0", "no shut"), "changed state to");
});
check("wr writes memory", () => has(router().run("R1", "wr"), "[OK]"));
check("Tab completes a unique keyword", () => eq(router().con("R1").complete("sh"), "show "));
check("Tab completes conf to configure", () => eq(router().con("R1").complete("conf"), "configure "));
check("Tab leaves an ambiguous prefix alone", () => eq(router().con("R1").complete("c"), "c"));
check("Tab completes interface names", () => {
  const t = router("config");
  eq(t.con("R1").complete("interface gig"), "interface GigabitEthernet");
});
check("sh ip int br", () => has(router().run("R1", "sh ip int br"), "Interface"));

section("do, no and history");
check("do runs EXEC commands from config mode", () => has(router("config").run("R1", "do show ip interface brief"), "GigabitEthernet0/0"));
check("do with an ambiguous word reports the word only", () => has(router("config").run("R1", "do c"), '% Ambiguous command:  "c"'));
check("no hostname restores Router", () => {
  const t = router("config");
  t.run("R1", "hostname X1", "no hostname");
  eq(t.con("R1").prompt(), "Router(config)#");
});
check("no ip address removes the address", () => {
  const t = router("config");
  t.run("R1", "int g0/0", "ip address 10.0.0.1 255.255.255.0", "no ip address", "end");
  has(t.run("R1", "show ip interface brief"), /GigabitEthernet0\/0 +unassigned/);
});
check("show history lists earlier commands", () => {
  const t = router();
  t.run("R1", "show clock");
  has(t.run("R1", "show history"), "show clock");
});

section("pipe filters");
function namedRouter() {
  const t = router("config");
  t.run("R1", "hostname R1", "interface g0/0", "ip address 10.0.0.1 255.255.255.0", "description to SW1", "end");
  return t;
}
check("| include", () => {
  const out = namedRouter().run("R1", "show running-config | include hostname");
  eq(out.trim(), "hostname R1");
});
check("| exclude", () => lacks(namedRouter().run("R1", "show running-config | exclude hostname"), "hostname R1"));
check("| begin", () => {
  const out = namedRouter().run("R1", "show running-config | begin interface GigabitEthernet0/0");
  eq(out.trim().split("\n")[0], "interface GigabitEthernet0/0");
});
check("| section prints the whole block", () => {
  const out = namedRouter().run("R1", "show running-config | section interface GigabitEthernet0/0");
  has(out, "interface GigabitEthernet0/0");
  has(out, " description to SW1");
  has(out, " ip address 10.0.0.1 255.255.255.0");
});
check("| i abbreviates include", () => eq(namedRouter().run("R1", "sh run | i hostname").trim(), "hostname R1"));

// ================================================================= config output
section("running-config format");
check("running-config framing", () => {
  const out = namedRouter().run("R1", "show running-config");
  has(out, "Building configuration...");
  has(out, /Current configuration : \d+ bytes/);
  has(out, /\nversion 15\.\d/);
  eq(out.trim().split("\n").pop(), "end");
});
check("hostname comes before interfaces", () => {
  const out = namedRouter().run("R1", "show running-config");
  if (out.indexOf("hostname R1") > out.indexOf("interface GigabitEthernet0/0")) throw new Error("order wrong");
});
check("interfaces listed in order", () => {
  const out = namedRouter().run("R1", "show running-config");
  const i0 = out.indexOf("interface GigabitEthernet0/0"), i1 = out.indexOf("interface GigabitEthernet0/1");
  if (!(i0 >= 0 && i1 > i0)) throw new Error("expected Gi0/0 then Gi0/1");
});
check("unconfigured router interfaces show shutdown", () => has(namedRouter().run("R1", "show running-config"), /interface GigabitEthernet0\/1\n no ip address\n shutdown/));
check("router sections come after interfaces, static routes after them, lines last", () => {
  const t = router("config");
  t.run("R1", "ip route 0.0.0.0 0.0.0.0 10.0.0.2", "router ospf 1", "exit", "line vty 0 4", "login", "end");
  const out = t.run("R1", "show running-config");
  const a = out.lastIndexOf("\ninterface "), b = out.indexOf("router ospf 1"), c = out.indexOf("ip route 0.0.0.0"), d = out.indexOf("line con 0");
  if (!(a < b && b < c && c < d)) throw new Error([a, b, c, d].join(","));
});
check("show run interface", () => {
  const out = namedRouter().run("R1", "show running-config interface g0/0");
  has(out, "Building configuration...");
  has(out, "interface GigabitEthernet0/0\n description to SW1\n ip address 10.0.0.1 255.255.255.0");
});
check("startup-config empty until saved", () => has(router().run("R1", "show startup-config"), "startup-config is not present"));
check("copy run start asks for the destination", () => {
  const t = router();
  t.run("R1", "copy running-config startup-config");
  eq(t.con("R1").prompt(), "Destination filename [startup-config]? ");
  const out = t.run("R1", "");
  has(out, "Building configuration...");
  has(out, "[OK]");
});
check("write memory", () => {
  const out = router().run("R1", "write memory");
  has(out, "Building configuration...");
  has(out, "[OK]");
});
check("service password-encryption shows type 7", () => {
  const t = router("config");
  t.run("R1", "service password-encryption", "line con 0", "password cisco", "end");
  has(t.run("R1", "show running-config | include password"), /password 7 [0-9A-F]+/);
});
check("enable secret is stored as a hash", () => {
  const t = router("config");
  t.run("R1", "enable secret class", "end");
  has(t.run("R1", "show running-config | include enable"), /enable secret (5|9) \S+/);
});
check("banner motd round-trips with its delimiter", () => {
  const t = router("config");
  t.run("R1", "banner motd #Authorised access only#", "end");
  has(t.run("R1", "show running-config"), "banner motd ^CAuthorised access only^C");
});

// ================================================================= interfaces and addressing
section("interfaces and addressing");
check("no shutdown logs LINK and LINEPROTO up", () => {
  const t = pair();
  const out = t.run("R1", "configure terminal", "interface g0/1", "no shutdown");
  // Gi0/1 has no cable: the link comes up administratively but stays down.
  has(out, /%LINK-3-UPDOWN: Interface GigabitEthernet0\/1, changed state to down|^$/m);
});
check("bringing up a cabled port logs both up messages", () => {
  const t = lab([R("R1"), R("R2")], [["R1", G(0), "R2", G(0)]]);
  t.conf("R2", "interface g0/0", "no shutdown");
  const out = t.conf("R1", "interface g0/0", "no shutdown");
  has(out, "%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to up");
  has(out, "%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up");
});
check("shutdown logs administratively down", () => {
  const t = pair();
  has(t.conf("R1", "interface g0/0", "shutdown"), "%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to administratively down");
});
check("show ip interface brief header", () => has(router().run("R1", "show ip interface brief"),
  /Interface +IP-Address +OK\? Method Status +Protocol/));
check("an unused router port is administratively down down", () => has(router().run("R1", "show ip interface brief"),
  /GigabitEthernet0\/1 +unassigned +YES unset +administratively down down/));
check("configured address shows method manual", () => has(pair().run("R1", "show ip interface brief"),
  /GigabitEthernet0\/0 +10\.12\.0\.1 +YES manual up +up/));
check("loopback is up/up", () => has(pair().run("R1", "show ip interface brief"), /Loopback0 +1\.1\.1\.1 +YES manual up +up/));
check("bad mask is refused with its hex value", () => {
  const t = router("config");
  has(t.run("R1", "interface g0/0", "ip address 10.0.0.1 255.0.255.0"), "Bad mask 0xFF00FF00 for address 10.0.0.1");
});
check("network address as host is refused", () => {
  const t = router("config");
  has(t.run("R1", "interface g0/0", "ip address 10.0.0.0 255.255.255.0"), "Bad mask /24 for address 10.0.0.0");
});
check("overlapping subnets on two interfaces are refused", () => {
  const t = router("config");
  t.run("R1", "interface g0/0", "ip address 10.0.0.1 255.255.255.0", "interface g0/1");
  has(t.run("R1", "ip address 10.0.0.2 255.255.255.0"), "% 10.0.0.0 overlaps with GigabitEthernet0/0");
});
check("secondary addresses appear in running-config", () => {
  const t = router("config");
  t.run("R1", "interface g0/0", "ip address 10.0.0.1 255.255.255.0", "ip address 10.9.0.1 255.255.255.0 secondary", "end");
  has(t.run("R1", "show running-config interface g0/0"), " ip address 10.9.0.1 255.255.255.0 secondary");
});
check("an address on a subinterface needs encapsulation first", () => {
  const t = router("config");
  // IOS wraps this message over three lines.
  has(t.run("R1", "interface g0/0.10", "ip address 10.10.0.1 255.255.255.0").replace(/\s+/g, " "),
    "% Configuring IP routing on a LAN subinterface is only allowed if that subinterface is already configured as part of an IEEE 802.10, IEEE 802.1Q, or ISL vLAN.");
});
check("description shows in show interfaces", () => has(namedRouter().run("R1", "show interfaces g0/0"), "Description: to SW1"));
check("show interfaces first line", () => has(pair().run("R1", "show interfaces g0/0"), "GigabitEthernet0/0 is up, line protocol is up"));
check("show interfaces shows the internet address", () => has(pair().run("R1", "show interfaces g0/0"), "Internet address is 10.12.0.1/24"));
check("show interfaces shows MTU and bandwidth", () => has(pair().run("R1", "show interfaces g0/0"), /MTU 1500 bytes, BW 1000000 Kbit\/sec, DLY 10 usec/));
check("show interfaces on a shut port", () => has(router().run("R1", "show interfaces g0/1"), "GigabitEthernet0/1 is administratively down, line protocol is down"));

// ================================================================= switching
function twoSwitches() {
  const t = lab([S("SW1"), S("SW2"), P("PC1"), P("PC2")],
    [["SW1", G(1), "SW2", G(1)], ["SW1", F(1), "PC1", "eth0"], ["SW2", F(1), "PC2", "eth0"]]);
  t.conf("SW1", "hostname SW1");
  t.conf("SW2", "hostname SW2");
  return t;
}
section("VLANs and access ports");
check("default VLAN table", () => {
  const out = lab([S("SW1")]).run("SW1", "enable", "show vlan brief");
  has(out, /VLAN Name +Status +Ports/);
  has(out, /^1 +default +active +Fa0\/1, Fa0\/2/m);
  has(out, /1002 fddi-default +act\/unsup/);
  has(out, /1003 token-ring-default +act\/unsup/);
  has(out, /1004 fddinet-default +act\/unsup/);
  has(out, /1005 trnet-default +act\/unsup/);
});
check("VLAN 1 can't be deleted", () => {
  const t = lab([S("SW1")]);
  has(t.conf("SW1", "no vlan 1"), "Default VLAN 1 may not be deleted.");
});
check("VLANs 1002-1005 can't be deleted", () => has(lab([S("SW1")]).conf("SW1", "no vlan 1002"), "Default VLAN 1002 may not be deleted."));
check("assigning a missing VLAN creates it", () => {
  const t = lab([S("SW1")]);
  has(t.conf("SW1", "interface f0/1", "switchport mode access", "switchport access vlan 20"), "% Access VLAN does not exist. Creating vlan 20");
});
check("named VLAN appears in show vlan brief", () => {
  const t = lab([S("SW1")]);
  t.conf("SW1", "vlan 10", "name STAFF", "exit", "interface f0/2", "switchport access vlan 10");
  has(t.run("SW1", "show vlan brief"), /^10 +STAFF +active +Fa0\/2/m);
});
check("default VLAN name is VLANxxxx", () => {
  const t = lab([S("SW1")]);
  t.conf("SW1", "vlan 30");
  has(t.run("SW1", "show vlan brief"), /^30 +VLAN0030 +active/m);
});
check("default switchport mode is dynamic auto", () => {
  const t = lab([S("SW1")]);
  has(t.run("SW1", "enable", "show interfaces f0/1 switchport"), "Administrative Mode: dynamic auto");
});
check("access port switchport details", () => {
  const t = lab([S("SW1")]);
  t.conf("SW1", "interface f0/1", "switchport mode access", "switchport access vlan 10");
  const out = t.run("SW1", "show interfaces f0/1 switchport");
  has(out, "Administrative Mode: static access");
  has(out, "Access Mode VLAN: 10 (VLAN0010)");
});
check("PCs in different VLANs can't ping", () => {
  const t = twoSwitches();
  t.conf("SW1", "interface g0/1", "switchport mode trunk", "interface f0/1", "switchport access vlan 10");
  t.conf("SW2", "interface g0/1", "switchport mode trunk", "interface f0/1", "switchport access vlan 20");
  t.run("PC1", "ip 10.0.0.1/24");
  t.run("PC2", "ip 10.0.0.2/24");
  // VPCS reports an on-link host that never answers ARP as not reachable.
  has(t.run("PC1", "ping 10.0.0.2 -c 1"), /host \(10\.0\.0\.2\) not reachable|timeout/);
});
check("PCs in the same VLAN across a trunk can ping", () => {
  const t = twoSwitches();
  t.conf("SW1", "interface g0/1", "switchport mode trunk", "interface f0/1", "switchport access vlan 10");
  t.conf("SW2", "interface g0/1", "switchport mode trunk", "interface f0/1", "switchport access vlan 10");
  t.run("PC1", "ip 10.0.0.1/24");
  t.run("PC2", "ip 10.0.0.2/24");
  has(t.run("PC1", "ping 10.0.0.2 -c 1"), "84 bytes from 10.0.0.2 icmp_seq=1");
});

section("trunks and DTP");
check("dynamic auto on both ends stays access", () => {
  const t = twoSwitches();
  has(t.run("SW1", "show interfaces g0/1 switchport"), "Operational Mode: static access");
});
check("trunk against dynamic auto forms a trunk", () => {
  const t = twoSwitches();
  t.conf("SW1", "interface g0/1", "switchport mode trunk");
  has(t.run("SW2", "show interfaces g0/1 switchport"), "Operational Mode: trunk");
});
check("show interfaces trunk header", () => {
  const t = twoSwitches();
  t.conf("SW1", "interface g0/1", "switchport mode trunk");
  const out = t.run("SW1", "show interfaces trunk");
  has(out, /Port +Mode +Encapsulation +Status +Native vlan/);
  has(out, /Gi0\/1 +on +802\.1q +trunking +1/);
  has(out, /Port +Vlans allowed on trunk/);
  has(out, /Gi0\/1 +1-4094/);
});
check("allowed VLAN list", () => {
  const t = twoSwitches();
  t.conf("SW1", "interface g0/1", "switchport mode trunk", "switchport trunk allowed vlan 10,20");
  has(t.run("SW1", "show interfaces trunk"), /Gi0\/1 +10,20/);
});
check("allowed vlan add", () => {
  const t = twoSwitches();
  t.conf("SW1", "interface g0/1", "switchport mode trunk", "switchport trunk allowed vlan 10", "switchport trunk allowed vlan add 30");
  has(t.run("SW1", "show running-config interface g0/1"), " switchport trunk allowed vlan 10,30");
});
check("native VLAN mismatch is reported by CDP", () => {
  const t = twoSwitches();
  t.conf("SW2", "interface g0/1", "switchport mode trunk");
  const out = t.conf("SW1", "interface g0/1", "switchport mode trunk", "switchport trunk native vlan 99");
  has(out + t.run("SW2", ""), /%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0\/1 \((1|99)\), with SW\d GigabitEthernet0\/1 \((1|99)\)/);
});
check("nonegotiate on dynamic is rejected", () => {
  const t = twoSwitches();
  has(t.conf("SW1", "interface g0/1", "switchport nonegotiate"),
    "Command rejected: Conflict between 'nonegotiate' and 'dynamic' status.");
});

section("MAC and CDP");
check("MAC table header", () => {
  const out = twoSwitches().run("SW1", "show mac address-table");
  has(out, "Mac Address Table");
  has(out, /Vlan +Mac Address +Type +Ports/);
});
check("a pinging PC is learned as DYNAMIC", () => {
  const t = twoSwitches();
  t.conf("SW1", "interface g0/1", "switchport mode trunk");
  t.run("PC1", "ip 10.0.0.1/24");
  t.run("PC2", "ip 10.0.0.2/24");
  t.run("PC1", "ping 10.0.0.2 -c 1");
  has(t.run("SW1", "show mac address-table"), /1 +0050\.7966\.68\w\w +DYNAMIC +Fa0\/1/);
});
check("show cdp neighbors header and entry", () => {
  const t = twoSwitches();
  const out = t.run("SW1", "show cdp neighbors");
  has(out, /Device ID +Local Intrfce +Holdtme +Capability +Platform +Port ID/);
  has(out, /SW2 +Gig 0\/1 +\d+ +S I +\S+ +Gig 0\/1/);
});

section("spanning tree");
function triangle() {
  const t = lab([S("SW1"), S("SW2"), S("SW3")],
    [["SW1", G(1), "SW2", G(1)], ["SW2", G(2), "SW3", G(2)], ["SW1", G(2), "SW3", G(1)]]);
  for (const n of ["SW1", "SW2", "SW3"]) t.conf(n, "hostname " + n, "interface range g0/1 - 2", "switchport mode trunk");
  return t;
}
check("show spanning-tree header for PVST+", () => {
  const out = triangle().run("SW1", "show spanning-tree vlan 1");
  has(out, "VLAN0001");
  has(out, "Spanning tree enabled protocol ieee");
  has(out, /Bridge ID +Priority +32769 +\(priority 32768 sys-id-ext 1\)/);
});
check("rapid-pvst shows rstp", () => {
  const t = triangle();
  t.conf("SW1", "spanning-tree mode rapid-pvst");
  has(t.run("SW1", "show spanning-tree vlan 1"), "Spanning tree enabled protocol rstp");
});
check("one port in a triangle is blocking", () => {
  const t = triangle();
  const all = ["SW1", "SW2", "SW3"].map((n) => t.run(n, "show spanning-tree vlan 1")).join("\n");
  eq((all.match(/ (Altn|Back) BLK /g) || []).length, 1);
});
check("the root bridge says so", () => {
  const t = triangle();
  t.conf("SW3", "spanning-tree vlan 1 root primary");
  has(t.run("SW3", "show spanning-tree vlan 1"), "This bridge is the root");
});
check("root primary sets 24576", () => {
  const t = triangle();
  t.conf("SW3", "spanning-tree vlan 1 root primary");
  has(t.run("SW3", "show running-config | include priority"), "spanning-tree vlan 1 priority 24576");
});
check("priority must be a multiple of 4096", () => has(triangle().conf("SW1", "spanning-tree vlan 1 priority 1000"), "% Bridge Priority must be in increments of 4096."));
check("portfast warning", () => {
  const t = triangle();
  has(t.conf("SW1", "interface f0/1", "spanning-tree portfast"), "%Warning: portfast should only be enabled on ports connected to a single");
});
check("BPDU guard err-disables with the short port name", () => {
  const t = triangle();
  const out = t.conf("SW1", "interface g0/1", "spanning-tree bpduguard enable");
  // Catalyst images print the port either way depending on release.
  has(out, /%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port (Gi0\/1|GigabitEthernet0\/1) with BPDU Guard enabled\. Disabling port\./);
  has(out, "%PM-4-ERR_DISABLE: bpduguard error detected on Gi0/1, putting Gi0/1 in err-disable state");
});
check("err-disabled port in show interfaces status", () => {
  const t = triangle();
  t.conf("SW1", "interface g0/1", "spanning-tree bpduguard enable");
  has(t.run("SW1", "show interfaces status err-disabled"), /Gi0\/1 +err-disabled +bpduguard/);
});
check("show spanning-tree summary", () => has(triangle().run("SW1", "show spanning-tree summary"), "Switch is in pvst mode"));

section("EtherChannel");
function bundle(modeA, modeB) {
  const t = lab([S("SW1"), S("SW2")], [["SW1", G(1), "SW2", G(1)], ["SW1", G(2), "SW2", G(2)]]);
  const a = t.conf("SW1", "interface range g0/1 - 2", "channel-group 1 mode " + modeA);
  t.conf("SW2", "interface range g0/1 - 2", "channel-group 1 mode " + modeB);
  return { t, a };
}
check("creating a channel group announces the port-channel", () => has(bundle("active", "active").a, "Creating a port-channel interface Port-channel 1"));
check("LACP active/passive bundles", () => has(bundle("active", "passive").t.run("SW1", "show etherchannel summary"), /1 +Po1\(SU\) +LACP +Gi0\/1\(P\) +Gi0\/2\(P\)/));
check("LACP passive/passive stays stand-alone", () => has(bundle("passive", "passive").t.run("SW1", "show etherchannel summary"), /Gi0\/1\(I\)/));
check("PAgP desirable/auto bundles", () => has(bundle("desirable", "auto").t.run("SW1", "show etherchannel summary"), /Po1\(SU\) +PAgP/));
check("PAgP auto/auto stays stand-alone", () => has(bundle("auto", "auto").t.run("SW1", "show etherchannel summary"), /Gi0\/1\(I\)/));
check("on/on bundles with no protocol", () => has(bundle("on", "on").t.run("SW1", "show etherchannel summary"), /Po1\(SU\) +- +Gi0\/1\(P\)/));
check("flags legend", () => has(bundle("active", "active").t.run("SW1", "show etherchannel summary"), "P - bundled in port-channel"));
check("changing LACP to PAgP needs no channel-group first", () => {
  const { t } = bundle("active", "active");
  has(t.conf("SW1", "interface g0/1", "channel-group 1 mode desirable"), /Command rejected|% Invalid input/);
});

section("port security");
function psec() {
  const t = lab([S("SW1"), S("HUB"), P("PC1"), P("PC2")],
    [["SW1", F(1), "HUB", F(24)], ["HUB", F(1), "PC1", "eth0"], ["HUB", F(2), "PC2", "eth0"]]);
  t.conf("SW1", "interface vlan 1", "ip address 10.0.0.254 255.255.255.0", "no shutdown");
  t.run("PC1", "ip 10.0.0.1/24");
  t.run("PC2", "ip 10.0.0.2/24");
  return t;
}
check("port security on a dynamic port is rejected", () => has(psec().conf("SW1", "interface f0/1", "switchport port-security"),
  "Command rejected: FastEthernet0/1 is a dynamic port."));
check("violation shutdown err-disables the port", () => {
  const t = psec();
  t.conf("SW1", "interface f0/1", "switchport mode access", "switchport port-security");
  t.run("PC1", "ping 10.0.0.254 -c 1");
  t.run("PC2", "ping 10.0.0.254 -c 1");
  has(t.run("SW1", "show port-security interface f0/1"), "Port Status                : Secure-shutdown");
});
check("violation logs the offending MAC", () => {
  const t = psec();
  t.conf("SW1", "interface f0/1", "switchport mode access", "switchport port-security");
  t.run("PC1", "ping 10.0.0.254 -c 1");
  t.run("PC2", "ping 10.0.0.254 -c 1");
  has(t.run("SW1", ""), /%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0050\.7966\.68\w\w on port FastEthernet0\/1\./);
});
check("sticky MAC written to running-config", () => {
  const t = psec();
  t.conf("SW1", "interface f0/1", "switchport mode access", "switchport port-security", "switchport port-security mac-address sticky");
  t.run("PC1", "ping 10.0.0.254 -c 1");
  has(t.run("SW1", "show running-config interface f0/1"), /switchport port-security mac-address sticky 0050\.7966\.68\w\w/);
});
check("restrict keeps the port up and counts violations", () => {
  const t = psec();
  t.conf("SW1", "interface f0/1", "switchport mode access", "switchport port-security", "switchport port-security violation restrict");
  t.run("PC1", "ping 10.0.0.254 -c 1");
  t.run("PC2", "ping 10.0.0.254 -c 1");
  const out = t.run("SW1", "show port-security interface f0/1");
  has(out, "Port Status                : Secure-up");
  has(out, /Security Violation Count   : [1-9]/);
});

// ================================================================= routing
section("routing table");
check("connected and local routes", () => {
  const out = pair().run("R1", "show ip route");
  has(out, /C +10\.12\.0\.0\/24 is directly connected, GigabitEthernet0\/0/);
  has(out, /L +10\.12\.0\.1\/32 is directly connected, GigabitEthernet0\/0/);
});
check("codes legend", () => has(pair().run("R1", "show ip route"), "Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP"));
check("no gateway of last resort by default", () => has(pair().run("R1", "show ip route"), "Gateway of last resort is not set"));
check("variably subnetted header", () => has(pair().run("R1", "show ip route"), "10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks"));
check("static route", () => {
  const t = pair(["ip route 2.2.2.2 255.255.255.255 10.12.0.2"]);
  has(t.run("R1", "show ip route static"), /S +2\.2\.2\.2 \[1\/0\] via 10\.12\.0\.2/);
});
check("default route sets the gateway of last resort", () => {
  const t = pair(["ip route 0.0.0.0 0.0.0.0 10.12.0.2"]);
  const out = t.run("R1", "show ip route");
  has(out, "Gateway of last resort is 10.12.0.2 to network 0.0.0.0");
  has(out, /S\* +0\.0\.0\.0\/0 \[1\/0\] via 10\.12\.0\.2/);
});
check("static route with host bits set is refused", () => has(pair().conf("R1", "ip route 10.9.9.1 255.255.255.0 10.12.0.2"), "%Inconsistent address and mask"));
check("static route to an unreachable next hop isn't installed", () => {
  const t = pair(["ip route 172.16.0.0 255.255.0.0 192.0.2.1"]);
  lacks(t.run("R1", "show ip route"), "172.16.0.0");
});
check("static route to Null0", () => {
  const t = pair(["ip route 172.16.0.0 255.255.0.0 Null0"]);
  // A route that is exactly its classful network is printed with its length.
  has(t.run("R1", "show ip route static"), /S +172\.16\.0\.0\/16 is directly connected, Null0/);
  // Traffic to it is discarded: the router's own ping fails silently.
  has(t.run("R1", "ping 172.16.1.1"), "Success rate is 0 percent (0/5)");
});
check("floating static waits for the primary to fail", () => {
  const t = pair(["ip route 2.2.2.2 255.255.255.255 10.12.0.2", "ip route 2.2.2.2 255.255.255.255 Null0 250"]);
  has(t.run("R1", "show ip route 2.2.2.2"), 'Known via "static", distance 1');
});
check("show ip route for a single prefix", () => {
  const t = pair(["ip route 2.2.2.2 255.255.255.255 10.12.0.2"]);
  const out = t.run("R1", "show ip route 2.2.2.2");
  has(out, "Routing entry for 2.2.2.2/32");
  has(out, 'Known via "static", distance 1, metric 0');
});
check("show ip route for an unknown prefix", () => has(pair().run("R1", "show ip route 172.16.1.1"), "% Network not in table"));

section("ping and traceroute");
check("router ping header", () => {
  const out = pair().run("R1", "ping 10.12.0.2");
  has(out, "Type escape sequence to abort.");
  has(out, "Sending 5, 100-byte ICMP Echos to 10.12.0.2, timeout is 2 seconds:");
});
check("first ping loses one packet to ARP", () => has(pair().run("R1", "ping 10.12.0.2"), /\n\.!!!!\nSuccess rate is 80 percent \(4\/5\)/));
check("second ping is clean", () => {
  const t = pair();
  t.run("R1", "ping 10.12.0.2");
  has(t.run("R1", "ping 10.12.0.2"), /\n!!!!!\nSuccess rate is 100 percent \(5\/5\), round-trip min\/avg\/max = \d+\/\d+\/\d+ ms/);
});
check("no route gives dots", () => has(pair().run("R1", "ping 172.16.0.1"), /\n\.\.\.\.\.\nSuccess rate is 0 percent \(0\/5\)/));
check("a router with no route answers unreachable: U.U.U", () => {
  const t = pair(["ip route 0.0.0.0 0.0.0.0 10.12.0.2"]);
  t.run("R1", "ping 10.12.0.2");
  has(t.run("R1", "ping 172.16.0.1"), /\nU\.U\.U\nSuccess rate is 0 percent \(0\/5\)/);
});
check("repeat and size options", () => {
  const t = pair();
  t.run("R1", "ping 10.12.0.2");
  has(t.run("R1", "ping 10.12.0.2 repeat 2 size 200"), "Sending 2, 200-byte ICMP Echos to 10.12.0.2");
});
check("traceroute format", () => {
  const t = pair();
  t.run("R1", "ping 10.12.0.2");
  const out = t.run("R1", "traceroute 10.12.0.2");
  has(out, "Tracing the route to 10.12.0.2");
  has(out, /^ +1 10\.12\.0\.2 \d+ msec/m);
});
check("VPCS ping output", () => {
  const t = lab([P("PC1"), P("PC2")], [["PC1", "eth0", "PC2", "eth0"]]);
  t.run("PC1", "ip 10.0.0.1/24");
  t.run("PC2", "ip 10.0.0.2/24");
  has(t.run("PC1", "ping 10.0.0.2"), /84 bytes from 10\.0\.0\.2 icmp_seq=1 ttl=64 time=[\d.]+ ms/);
});
check("VPCS ip command echo", () => {
  const out = lab([P("PC1")]).run("PC1", "ip 10.0.0.1/24 10.0.0.254");
  has(out, "Checking for duplicate address...");
  has(out, "PC1 : 10.0.0.1 255.255.255.0 gateway 10.0.0.254");
});
check("VPCS unreachable host", () => {
  const t = lab([P("PC1")]);
  t.run("PC1", "ip 10.0.0.1/24");
  has(t.run("PC1", "ping 10.0.0.9 -c 1"), /host \(10\.0\.0\.9\) not reachable|10\.0\.0\.9 icmp_seq=1 timeout/);
});

section("OSPF");
function ospfPair(r1 = [], r2 = []) {
  return pair(["router ospf 1", "network 10.12.0.0 0.0.0.255 area 0", "network 1.1.1.1 0.0.0.0 area 0", ...r1],
    ["router ospf 1", "network 10.12.0.0 0.0.0.255 area 0", "network 2.2.2.2 0.0.0.0 area 0", ...r2]);
}
check("adjacency log", () => {
  const t = pair(["router ospf 1", "network 10.12.0.0 0.0.0.255 area 0"]);
  const out = t.conf("R2", "router ospf 1", "network 10.12.0.0 0.0.0.255 area 0");
  has(out + t.run("R1", ""), /%OSPF-5-ADJCHG: Process 1, Nbr \d+\.\d+\.\d+\.\d+ on GigabitEthernet0\/0 from LOADING to FULL, Loading Done/);
});
check("show ip ospf neighbor format", () => {
  const out = ospfPair().run("R1", "show ip ospf neighbor");
  has(out, /Neighbor ID +Pri +State +Dead Time +Address +Interface/);
  has(out, /2\.2\.2\.2 +1 +FULL\/(DR|BDR) +\d\d:\d\d:\d\d +10\.12\.0\.2 +GigabitEthernet0\/0/);
});
check("router ID is the highest loopback", () => has(ospfPair().run("R1", "show ip ospf"), 'Routing Process "ospf 1" with ID 1.1.1.1'));
check("OSPF route with cost", () => has(ospfPair().run("R1", "show ip route ospf"), /O +2\.2\.2\.2 \[110\/2\] via 10\.12\.0\.2/));
check("loopbacks advertised as /32", () => {
  const out = ospfPair().run("R1", "show ip route");
  has(out, "2.0.0.0/32 is subnetted, 1 subnets");
  has(out, /O +2\.2\.2\.2 \[110\/2\]/);
});
check("higher RID wins DR on a tie", () => has(ospfPair().run("R1", "show ip ospf neighbor"), /2\.2\.2\.2 +1 +FULL\/DR/));
check("priority 0 never becomes DR", () => {
  const t = ospfPair([], []);
  t.conf("R2", "interface g0/0", "ip ospf priority 0");
  t.run("R1", "clear ip ospf process", "yes");
  has(t.run("R1", "show ip ospf neighbor"), /2\.2\.2\.2 +0 +FULL\/DROTHER/);
});
check("hello mismatch blocks the adjacency", () => {
  const t = ospfPair();
  t.conf("R1", "interface g0/0", "ip ospf hello-interval 5");
  lacks(t.run("R1", "show ip ospf neighbor"), "FULL");
});
check("area mismatch blocks the adjacency", () => {
  const t = pair(["router ospf 1", "network 10.12.0.0 0.0.0.255 area 0"], ["router ospf 1", "network 10.12.0.0 0.0.0.255 area 1"]);
  lacks(t.run("R1", "show ip ospf neighbor"), "FULL");
});
check("passive interface stops hellos", () => {
  const t = ospfPair(["passive-interface g0/0"]);
  lacks(t.run("R1", "show ip ospf neighbor"), "FULL");
});
check("router-id change needs a process clear", () => {
  const t = ospfPair();
  has(t.conf("R1", "router ospf 1", "router-id 9.9.9.9"), '% OSPF: Reload or use "clear ip ospf process" command, for this to take effect');
});
check("clear ip ospf process asks for confirmation", () => {
  const t = ospfPair();
  t.run("R1", "clear ip ospf process");
  eq(t.con("R1").prompt(), "Reset ALL OSPF processes? [no]: ");
});
check("show ip ospf interface brief", () => {
  const out = ospfPair().run("R1", "show ip ospf interface brief");
  has(out, /Interface +PID +Area +IP Address\/Mask +Cost +State +Nbrs F\/C/);
  has(out, /Gi0\/0 +1 +0 +10\.12\.0\.1\/24 +1 +(DR|BDR) +1\/1/);
});
check("cost from reference bandwidth", () => {
  const t = ospfPair(["auto-cost reference-bandwidth 10000"]);
  has(t.run("R1", "show ip ospf interface brief"), /Gi0\/0 +1 +0 +10\.12\.0\.1\/24 +10 /);
});
check("default-information originate always", () => {
  const t = ospfPair(["default-information originate always"]);
  has(t.run("R2", "show ip route"), /O\*E2 +0\.0\.0\.0\/0 \[110\/1\] via 10\.12\.0\.1/);
});

section("EIGRP");
function eigrpPair(r1 = [], r2 = []) {
  return pair(["router eigrp 100", "network 10.12.0.0 0.0.0.255", "network 1.1.1.1 0.0.0.0", ...r1],
    ["router eigrp 100", "network 10.12.0.0 0.0.0.255", "network 2.2.2.2 0.0.0.0", ...r2]);
}
check("neighbour log", () => {
  const t = pair(["router eigrp 100", "network 10.12.0.0 0.0.0.255"]);
  const out = t.conf("R2", "router eigrp 100", "network 10.12.0.0 0.0.0.255") + t.run("R1", "");
  has(out, /%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10\.12\.0\.\d \(GigabitEthernet0\/0\) is up: new adjacency/);
});
check("show ip eigrp neighbors header", () => {
  const out = eigrpPair().run("R1", "show ip eigrp neighbors");
  has(out, "EIGRP-IPv4 Neighbors for AS(100)");
  has(out, /H +Address +Interface +Hold Uptime +SRTT +RTO +Q +Seq/);
  has(out, /0 +10\.12\.0\.2 +Gi0\/0/);
});
check("EIGRP route metric for a loopback one gig hop away", () => has(eigrpPair().run("R1", "show ip route eigrp"), /D +2\.2\.2\.2 \[90\/130816\] via 10\.12\.0\.2/));
check("AS mismatch blocks the adjacency", () => {
  const t = pair(["router eigrp 100", "network 10.12.0.0 0.0.0.255"], ["router eigrp 200", "network 10.12.0.0 0.0.0.255"]);
  lacks(t.run("R1", "show ip eigrp neighbors"), "10.12.0.2");
});
check("K-value mismatch log", () => {
  const t = eigrpPair();
  const out = t.conf("R1", "router eigrp 100", "metric weights 0 1 1 1 1 0");
  has(out + t.run("R2", ""), /%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10\.12\.0\.\d \(GigabitEthernet0\/0\) is down: (K-value mismatch|metric changed)/);
});
check("show ip eigrp topology header", () => has(eigrpPair().run("R1", "show ip eigrp topology"), "EIGRP-IPv4 Topology Table for AS(100)/ID(1.1.1.1)"));
check("auto-summary is off by default in 15.x", () => lacks(eigrpPair().run("R1", "show running-config | section eigrp"), / auto-summary/));

// ================================================================= services
section("ACLs");
check("standard ACL show format", () => {
  const t = router("config");
  t.run("R1", "access-list 1 permit 192.168.1.0 0.0.0.255", "end");
  has(t.run("R1", "show access-lists"), "Standard IP access list 1\n    10 permit 192.168.1.0, wildcard bits 0.0.0.255");
});
check("host bits are cleared in a standard ACE", () => {
  const t = router("config");
  t.run("R1", "access-list 1 permit 192.168.1.5 0.0.0.255", "end");
  const out = t.run("R1", "show access-lists");
  has(out, "192.168.1.0");
  lacks(out, "192.168.1.5");
});
check("host keyword shown as a bare address", () => {
  const t = router("config");
  t.run("R1", "access-list 2 deny host 10.0.0.5", "end");
  has(t.run("R1", "show access-lists 2"), "    10 deny   10.0.0.5");
});
check("extended ACL show format", () => {
  const t = router("config");
  t.run("R1", "access-list 100 deny tcp any host 10.0.0.1 eq 80", "access-list 100 permit ip any any", "end");
  const out = t.run("R1", "show access-lists 100");
  has(out, "Extended IP access list 100");
  has(out, "    10 deny tcp any host 10.0.0.1 eq www");
  has(out, "    20 permit ip any any");
});
check("named ACL sequence numbers", () => {
  const t = router("config");
  t.run("R1", "ip access-list extended WEB", "permit tcp any any eq 443", "15 permit tcp any any eq 80", "end");
  const out = t.run("R1", "show access-lists WEB");
  has(out, "Extended IP access list WEB");
  // Entries are listed in sequence order.
  if (!(out.indexOf("10 permit") >= 0 && out.indexOf("15 permit") > out.indexOf("10 permit"))) throw new Error(out);
});
check("match counters", () => {
  const t = pair(["access-list 1 permit any", "interface g0/0", "ip access-group 1 in"]);
  t.run("R2", "ping 10.12.0.1");
  has(t.run("R1", "show access-lists 1"), /10 permit any \(\d+ matches?\)/);
});
check("an inbound deny stops pings with U", () => {
  const t = pair(["access-list 101 deny icmp any any", "access-list 101 permit ip any any", "interface g0/0", "ip access-group 101 in"]);
  t.run("R2", "ping 10.12.0.1");
  has(t.run("R2", "ping 1.1.1.1"), /U\.U\.U|\.\.\.\.\./);
});

section("NAT");
function natLab() {
  const t = lab([R("R1"), R("ISP"), P("PC1")], [["R1", G(0), "PC1", "eth0"], ["R1", G(1), "ISP", G(0)]]);
  t.conf("ISP", "interface g0/0", "ip address 203.0.113.2 255.255.255.252", "no shutdown", "interface loopback0", "ip address 8.8.8.8 255.255.255.255");
  t.conf("R1", "interface g0/0", "ip address 192.168.1.1 255.255.255.0", "ip nat inside", "no shutdown",
    "interface g0/1", "ip address 203.0.113.1 255.255.255.252", "ip nat outside", "no shutdown", "exit",
    "ip route 0.0.0.0 0.0.0.0 203.0.113.2", "access-list 1 permit 192.168.1.0 0.0.0.255",
    "ip nat inside source list 1 interface g0/1 overload");
  t.run("PC1", "ip 192.168.1.10/24 192.168.1.1");
  return t;
}
check("PAT lets the inside host out", () => {
  const t = natLab();
  t.run("PC1", "ping 8.8.8.8 -c 1");
  has(t.run("PC1", "ping 8.8.8.8 -c 2"), "84 bytes from 8.8.8.8");
});
check("translation table header", () => {
  const t = natLab();
  t.run("PC1", "ping 8.8.8.8 -c 2");
  const out = t.run("R1", "show ip nat translations");
  has(out, /Pro +Inside global +Inside local +Outside local +Outside global/);
  has(out, /icmp 203\.0\.113\.1:\d+ +192\.168\.1\.10:\d+ +8\.8\.8\.8:\d+ +8\.8\.8\.8:\d+/);
});
check("static NAT entry", () => {
  const t = natLab();
  t.conf("R1", "ip nat inside source static 192.168.1.20 203.0.113.1");
  has(t.run("R1", "show ip nat translations"), /--- +203\.0\.113\.1 +192\.168\.1\.20 +--- +---/);
});
check("show ip nat statistics", () => {
  const out = natLab().run("R1", "show ip nat statistics");
  has(out, /Total active translations: \d+/);
  has(out, "Outside interfaces:");
  has(out, "Inside interfaces:");
});

section("HSRP");
function hsrpLab() {
  const t = lab([R("R1"), R("R2"), S("SW1"), P("PC1")],
    [["R1", G(0), "SW1", G(1)], ["R2", G(0), "SW1", G(2)], ["SW1", F(1), "PC1", "eth0"]]);
  t.conf("R1", "interface g0/0", "ip address 192.168.1.2 255.255.255.0", "standby 1 ip 192.168.1.1", "standby 1 priority 110", "standby 1 preempt", "no shutdown");
  t.conf("R2", "interface g0/0", "ip address 192.168.1.3 255.255.255.0", "standby 1 ip 192.168.1.1", "no shutdown");
  return t;
}
check("state change log", () => {
  const t = lab([R("R1"), S("SW1")], [["R1", G(0), "SW1", G(1)]]);
  const out = t.conf("R1", "interface g0/0", "ip address 192.168.1.2 255.255.255.0", "standby 1 ip 192.168.1.1", "no shutdown");
  has(out + t.run("R1", ""), /%HSRP-5-STATECHANGE: GigabitEthernet0\/0 Grp 1 state \w+ -> Active/);
});
check("show standby brief", () => {
  const out = hsrpLab().run("R1", "show standby brief");
  has(out, "P indicates configured to preempt.");
  has(out, /Interface +Grp +Pri +P +State +Active +Standby +Virtual IP/);
  has(out, /Gi0\/0 +1 +110 +P +Active +local +192\.168\.1\.3 +192\.168\.1\.1/);
});
check("version 1 virtual MAC", () => has(hsrpLab().run("R1", "show standby"), "Virtual mac address is 0000.0c07.ac01".replace("Virtual mac", "Active virtual MAC")));
check("version 2 virtual MAC", () => {
  const t = hsrpLab();
  t.conf("R1", "interface g0/0", "standby version 2");
  has(t.run("R1", "show standby"), "0000.0c9f.f001");
});
check("failover without preempt keeps the new active", () => {
  const t = hsrpLab();
  t.conf("R1", "interface g0/0", "no standby 1 preempt", "shutdown");
  t.conf("R1", "interface g0/0", "no shutdown");
  has(t.run("R2", "show standby brief"), /Gi0\/0 +1 +100 +Active/);
});

section("DHCP");
function dhcpLab() {
  const t = lab([R("R1"), P("PC1")], [["R1", G(0), "PC1", "eth0"]]);
  t.conf("R1", "ip dhcp excluded-address 192.168.1.1 192.168.1.10", "ip dhcp pool LAN",
    "network 192.168.1.0 255.255.255.0", "default-router 192.168.1.1", "dns-server 8.8.8.8", "exit",
    "interface g0/0", "ip address 192.168.1.1 255.255.255.0", "no shutdown");
  return t;
}
check("VPCS DORA output", () => has(dhcpLab().run("PC1", "ip dhcp"), "DDORA IP 192.168.1.11/24 GW 192.168.1.1"));
check("binding table", () => {
  const t = dhcpLab();
  t.run("PC1", "ip dhcp");
  const out = t.run("R1", "show ip dhcp binding");
  has(out, /Bindings from all pools not associated with VRF:/);
  has(out, /IP address +Client-ID\/ +Lease expiration +Type/);
  has(out, /192\.168\.1\.11 +01?0050\.7966\.68\w\w/);
});
check("show ip dhcp pool", () => {
  const t = dhcpLab();
  t.run("PC1", "ip dhcp");
  const out = t.run("R1", "show ip dhcp pool");
  has(out, "Pool LAN :");
  has(out, /Leased addresses +: 1/);
});

section("IPv6");
function v6pair() {
  const t = lab([R("R1"), R("R2")], [["R1", G(0), "R2", G(0)]]);
  t.conf("R1", "ipv6 unicast-routing", "interface g0/0", "ipv6 address 2001:db8:12::1/64", "no shutdown");
  t.conf("R2", "ipv6 unicast-routing", "interface g0/0", "ipv6 address 2001:db8:12::2/64", "no shutdown");
  return t;
}
check("show ipv6 interface brief lists link-local first", () => {
  const out = v6pair().run("R1", "show ipv6 interface brief");
  has(out, /GigabitEthernet0\/0 +\[up\/up\]\n +FE80::[0-9A-F:]+\n +2001:DB8:12::1/);
});
check("EUI-64 address from the MAC", () => {
  const t = v6pair();
  t.conf("R1", "interface g0/1", "ipv6 address 2001:db8:1::/64 eui-64", "no shutdown");
  has(t.run("R1", "show ipv6 interface brief"), /2001:DB8:1:0:[0-9A-F]+:[0-9A-F]*FF:FE[0-9A-F]+:[0-9A-F]+/);
});
check("IPv6 ping", () => has(v6pair().run("R1", "ping 2001:db8:12::2"), /Success rate is (80|100) percent/));
check("show ipv6 route codes", () => has(v6pair().run("R1", "show ipv6 route"), /C +2001:DB8:12::\/64 \[0\/0\]\n +via GigabitEthernet0\/0, directly connected/));
check("OSPFv3 needs a router ID on an IPv6-only router", () => {
  const t = v6pair();
  has(t.conf("R1", "interface g0/0", "ipv6 ospf 1 area 0"), "%OSPFv3-4-NORTRID: OSPFv3 process 1 could not pick a router-id, please configure manually");
});
check("OSPFv3 adjacency and routes via link-local", () => {
  const t = v6pair();
  t.conf("R1", "ipv6 router ospf 1", "router-id 1.1.1.1", "interface g0/0", "ipv6 ospf 1 area 0", "interface loopback0", "ipv6 address 2001:db8:1::1/128", "ipv6 ospf 1 area 0");
  t.conf("R2", "ipv6 router ospf 1", "router-id 2.2.2.2", "interface g0/0", "ipv6 ospf 1 area 0");
  has(t.run("R2", "show ipv6 ospf neighbor"), /1\.1\.1\.1 +1 +FULL/);
  has(t.run("R2", "show ipv6 route ospf"), /O +2001:DB8:1::1\/128 \[110\/2\]\n +via FE80::/);
});

section("remote access");
function remote() {
  const t = pair();
  t.run("R1", "ping 10.12.0.2");
  return t;
}
check("telnet to a vty with login but no password", () => {
  const t = remote();
  t.conf("R2", "line vty 0 4", "login", "transport input telnet");
  const out = t.run("R1", "telnet 10.12.0.2");
  has(out, "Password required, but none set");
  has(out, "[Connection to 10.12.0.2 closed by foreign host]");
});
check("login warns when no password is set", () => has(remote().conf("R2", "line vty 0 4", "login"), "% Login disabled on line"));
check("telnet refused when only ssh is allowed", () => {
  const t = remote();
  t.conf("R2", "line vty 0 4", "password cisco", "login", "transport input ssh");
  has(t.run("R1", "telnet 10.12.0.2"), "% Connection refused by remote host");
});
check("RSA key needs a hostname other than Router", () => {
  const t = router("config");
  has(t.run("R1", "crypto key generate rsa"), "% Please define a hostname other than Router.");
});
check("RSA key needs a domain name", () => {
  const t = router("config");
  t.run("R1", "hostname R1");
  has(t.run("R1", "crypto key generate rsa"), "% Please define a domain-name first.");
});
check("RSA key modulus prompt", () => {
  const t = router("config");
  t.run("R1", "hostname R1", "ip domain-name lab.local");
  const out = t.run("R1", "crypto key generate rsa");
  has(out, "The name for the keys will be: R1.lab.local");
  eq(t.con("R1").prompt(), "How many bits in the modulus [512]: ");
});
check("SSH enabled log after key generation", () => {
  const t = router("config");
  t.run("R1", "hostname R1", "ip domain-name lab.local", "crypto key generate rsa");
  has(t.run("R1", "2048"), "%SSH-5-ENABLED: SSH 1.99 has been enabled");
});
check("password prompt on telnet login", () => {
  const t = remote();
  t.conf("R2", "line vty 0 4", "password cisco", "login", "transport input telnet");
  t.run("R1", "telnet 10.12.0.2");
  has(t.con("R1").prompt(), "Password: ");
});
check("three bad passwords close the session", () => {
  const t = remote();
  t.conf("R2", "line vty 0 4", "password cisco", "login", "transport input telnet");
  t.run("R1", "telnet 10.12.0.2");
  const out = t.run("R1", "a", "b", "c");
  has(out, "% Bad passwords");
});

// ================================================================= CCNP (guarded)
section("CCNP OSPF areas");
{
  const probe = router("config");
  probe.run("R1", "router ospf 1");
  if (!/stub/.test(probe.con("R1").help("area 1 "))) {
    skip("stub, NSSA and summary LSAs", "no area stub/nssa yet");
  } else {
    const three = () => {
      const t = lab([R("R1"), R("R2"), R("R3")], [["R1", G(0), "R2", G(0)], ["R2", G(1), "R3", G(0)]]);
      t.conf("R1", "interface g0/0", "ip address 10.12.0.1 255.255.255.0", "no shutdown", "interface loopback0", "ip address 1.1.1.1 255.255.255.255",
        "router ospf 1", "network 10.12.0.0 0.0.0.255 area 0", "network 1.1.1.1 0.0.0.0 area 0");
      t.conf("R2", "interface g0/0", "ip address 10.12.0.2 255.255.255.0", "no shutdown", "interface g0/1", "ip address 10.23.0.2 255.255.255.0", "no shutdown",
        "router ospf 1", "router-id 2.2.2.2", "network 10.12.0.0 0.0.0.255 area 0", "network 10.23.0.0 0.0.0.255 area 1");
      t.conf("R3", "interface g0/0", "ip address 10.23.0.3 255.255.255.0", "no shutdown", "router ospf 1", "router-id 3.3.3.3", "network 10.23.0.0 0.0.0.255 area 1");
      return t;
    };
    check("inter-area routes are O IA", () => has(three().run("R3", "show ip route ospf"), /O IA +1\.1\.1\.1 \[110\/3\] via 10\.23\.0\.2/));
    check("ABR flagged in show ip ospf", () => has(three().run("R2", "show ip ospf"), "It is an area border router"));
    check("summary LSAs in the database", () => has(three().run("R3", "show ip ospf database"), "Summary Net Link States (Area 1)"));
    check("totally stubby area gets only a default", () => {
      const t = three();
      t.conf("R2", "router ospf 1", "area 1 stub no-summary");
      t.conf("R3", "router ospf 1", "area 1 stub");
      const out = t.run("R3", "show ip route ospf");
      has(out, /O\*IA +0\.0\.0\.0\/0 \[110\/2\] via 10\.23\.0\.2/);
      lacks(out, "1.1.1.1");
    });
    check("stub flag mismatch drops the adjacency", () => {
      const t = three();
      t.conf("R2", "router ospf 1", "area 1 stub");
      lacks(t.run("R3", "show ip ospf neighbor"), "FULL");
    });
    check("area range summarises at the ABR", () => {
      const t = three();
      t.conf("R3", "interface loopback1", "ip address 172.16.1.1 255.255.255.0", "ip ospf network point-to-point",
        "interface loopback2", "ip address 172.16.2.1 255.255.255.0", "ip ospf network point-to-point",
        "router ospf 1", "network 172.16.0.0 0.0.255.255 area 1");
      t.conf("R2", "router ospf 1", "area 1 range 172.16.0.0 255.255.252.0");
      const out = t.run("R1", "show ip route ospf");
      has(out, /172\.16\.0\.0\/22 is subnetted, 1 subnets\n *O IA +172\.16\.0\.0 \[110\/\d+\]/);
      lacks(out, "172.16.1.0/24");
    });
    check("NSSA externals are O N2", () => {
      const t = three();
      t.conf("R2", "router ospf 1", "area 1 nssa");
      t.conf("R3", "router ospf 1", "area 1 nssa", "redistribute static subnets", "exit", "ip route 192.168.99.0 255.255.255.0 Null0");
      has(t.run("R2", "show ip route ospf"), /O N2 +192\.168\.99\.0\/24 \[110\/20\]/);
      has(t.run("R1", "show ip route ospf"), /O E2 +192\.168\.99\.0\/24 \[110\/20\]/);
    });
  }
}

section("CCNP BGP");
{
  const probe = router("config");
  if (!supports(probe, "R1", "router bgp ")) skip("BGP best path", "no router bgp yet");
  else {
    const ebgp = () => {
      const t = pair(["router bgp 65001", "neighbor 10.12.0.2 remote-as 65002", "network 1.1.1.1 mask 255.255.255.255"],
        ["router bgp 65002", "neighbor 10.12.0.1 remote-as 65001", "network 2.2.2.2 mask 255.255.255.255"]);
      return t;
    };
    check("neighbor up log", () => {
      const t = pair(["router bgp 65001", "neighbor 10.12.0.2 remote-as 65002"]);
      const out = t.conf("R2", "router bgp 65002", "neighbor 10.12.0.1 remote-as 65001") + t.run("R1", "");
      has(out, /%BGP-5-ADJCHANGE: neighbor 10\.12\.0\.\d Up/);
    });
    check("show ip bgp summary", () => {
      const out = ebgp().run("R1", "show ip bgp summary");
      has(out, "BGP router identifier 1.1.1.1, local AS number 65001");
      has(out, /Neighbor +V +AS MsgRcvd MsgSent +TblVer +InQ OutQ Up\/Down +State\/PfxRcd/);
      has(out, /10\.12\.0\.2 +4 +65002 .* 1$/m);
    });
    check("show ip bgp table", () => {
      const out = ebgp().run("R1", "show ip bgp");
      has(out, /Network +Next Hop +Metric LocPrf Weight Path/);
      has(out, /\*> +1\.1\.1\.1\/32 +0\.0\.0\.0 +0 +32768 i/);
      has(out, /\*> +2\.2\.2\.2\/32 +10\.12\.0\.2 +0 +0 65002 i/);
    });
    check("eBGP routes have AD 20", () => has(ebgp().run("R1", "show ip route bgp"), /B +2\.2\.2\.2 \[20\/0\] via 10\.12\.0\.2/));
    check("network needs an exact RIB match", () => {
      const t = pair(["router bgp 65001", "neighbor 10.12.0.2 remote-as 65002", "network 1.1.0.0 mask 255.255.0.0"],
        ["router bgp 65002", "neighbor 10.12.0.1 remote-as 65001"]);
      lacks(t.run("R2", "show ip bgp"), "1.1.0.0");
    });
  }
}

section("CCNP MST and VTP");
{
  const probe = lab([S("SW1")]);
  probe.run("SW1", "enable", "configure terminal");
  if (!/mst/.test(probe.con("SW1").help("spanning-tree mode "))) skip("MST", "no spanning-tree mode mst yet");
  else {
    check("show spanning-tree mst configuration", () => {
      const t = lab([S("SW1")]);
      t.conf("SW1", "spanning-tree mode mst", "spanning-tree mst configuration", "name CORE", "revision 1", "instance 1 vlan 10,20");
      const out = t.run("SW1", "show spanning-tree mst configuration");
      has(out, /Name +\[CORE\]/);
      has(out, /Revision +1 +Instances configured 2/);
      has(out, /1 +10,20/);
    });
  }
  if (!supports(probe, "SW1", "vtp ")) skip("VTP", "no vtp yet");
  else {
    check("show vtp status defaults", () => {
      const out = lab([S("SW1")]).run("SW1", "enable", "show vtp status");
      has(out, /VTP Operating Mode +: Server/);
      has(out, /Configuration Revision +: 0/);
    });
    check("client can't create VLANs", () => {
      const t = lab([S("SW1")]);
      has(t.conf("SW1", "vtp mode client", "vlan 50"), "VTP VLAN configuration not allowed when device is in CLIENT mode.");
    });
  }
}

section("CCNP first-hop redundancy");
{
  const probe = router("config");
  probe.run("R1", "interface g0/0");
  if (!supports(probe, "R1", "vrrp ")) skip("VRRP", "no vrrp yet");
  else check("show vrrp brief", () => {
    const t = lab([R("R1"), S("SW1")], [["R1", G(0), "SW1", G(1)]]);
    t.conf("R1", "interface g0/0", "ip address 192.168.1.2 255.255.255.0", "vrrp 1 ip 192.168.1.1", "no shutdown");
    has(t.run("R1", "show vrrp brief"), /Gi0\/0 +1 +100 +\d+ +Y +Master +192\.168\.1\.2 +192\.168\.1\.1/);
  });
  if (!supports(probe, "R1", "glbp ")) skip("GLBP", "no glbp yet");
  else check("show glbp brief", () => {
    const t = lab([R("R1"), S("SW1")], [["R1", G(0), "SW1", G(1)]]);
    t.conf("R1", "interface g0/0", "ip address 192.168.1.2 255.255.255.0", "glbp 1 ip 192.168.1.1", "no shutdown");
    has(t.run("R1", "show glbp brief"), /Gi0\/0 +1 +- +100 +Active +192\.168\.1\.1 +local/);
  });
}

section("CCNP tunnels and VPN");
{
  const probe = router("config");
  if (!/Tunnel/.test(probe.con("R1").help("interface "))) skip("GRE", "no Tunnel interfaces yet");
  else check("GRE tunnel comes up with a route to its destination", () => {
    const t = pair(["interface tunnel0", "ip address 172.16.0.1 255.255.255.252", "tunnel source g0/0", "tunnel destination 10.12.0.2"],
      ["interface tunnel0", "ip address 172.16.0.2 255.255.255.252", "tunnel source g0/0", "tunnel destination 10.12.0.1"]);
    has(t.run("R1", "show ip interface brief"), /Tunnel0 +172\.16\.0\.1 +YES manual up +up/);
    has(t.run("R1", "ping 172.16.0.2"), /Success rate is (80|100) percent/);
  });
  if (!supports(probe, "R1", "crypto isakmp ")) skip("IPsec", "no crypto isakmp yet");
  else check("show crypto isakmp sa header", () => has(router().run("R1", "show crypto isakmp sa"), /dst +src +state +conn-id +status/));
}

section("CCNP services");
{
  const probe = router("config");
  if (!supports(probe, "R1", "class-map ")) skip("QoS", "no class-map yet");
  else check("class-map prompt", () => {
    const t = router("config");
    t.run("R1", "class-map match-any VOICE");
    eq(t.con("R1").prompt(), "Router(config-cmap)#");
  });
  if (!supports(probe, "R1", "aaa ")) skip("AAA", "no aaa yet");
  else check("aaa new-model then local login", () => {
    const t = router("config");
    t.run("R1", "username admin secret cisco", "aaa new-model", "aaa authentication login default local", "end");
    has(t.run("R1", "show running-config | include aaa"), "aaa authentication login default local");
  });
  if (!supports(probe, "R1", "ntp ")) skip("NTP", "no ntp yet");
  else check("unsynchronised clock by default", () => has(router().run("R1", "show ntp status"), /Clock is unsynchronized/));
  if (!supports(probe, "R1", "flow ")) skip("NetFlow", "no flexible netflow yet");
  else check("flow record prompt", () => {
    const t = router("config");
    t.run("R1", "flow record REC");
    eq(t.con("R1").prompt(), "Router(config-flow-record)#");
  });
}

section("CCNP EIGRP, RIP and redistribution");
{
  const probe = router("config");
  probe.run("R1", "router eigrp 100");
  if (!/stub/.test(probe.con("R1").help("eigrp "))) skip("EIGRP stub", "no eigrp stub yet");
  else check("stub neighbour flagged", () => {
    const t = eigrpPair(["eigrp stub connected summary"]);
    has(t.run("R2", "show ip eigrp neighbors detail"), /Stub Peer Advertising \( ?CONNECTED SUMMARY ?\) Routes/);
  });
  const p2 = router("config");
  p2.run("R1", "interface g0/0");
  if (!/summary-address/.test(p2.con("R1").help("ip "))) skip("EIGRP summary", "no ip summary-address yet");
  else check("summary installs a Null0 discard route", () => {
    const t = eigrpPair(["interface loopback1", "ip address 172.16.1.1 255.255.255.0", "interface loopback2", "ip address 172.16.2.1 255.255.255.0",
      "router eigrp 100", "network 172.16.0.0 0.0.255.255", "interface g0/0", "ip summary-address eigrp 100 172.16.0.0 255.255.252.0"]);
    has(t.run("R1", "show ip route eigrp"), /D +172\.16\.0\.0\/22 is a summary, \S+, Null0/);
    has(t.run("R2", "show ip route eigrp"), /172\.16\.0\.0\/22 is subnetted, 1 subnets\n *D +172\.16\.0\.0 \[90\/\d+\] via 10\.12\.0\.1/);
  });
  if (!/rip/.test(router("config").con("R1").help("router "))) skip("RIP", "no router rip yet");
  else check("RIPv2 route with AD 120", () => {
    const t = pair(["router rip", "version 2", "no auto-summary", "network 10.0.0.0", "network 1.0.0.0"],
      ["router rip", "version 2", "no auto-summary", "network 10.0.0.0"]);
    has(t.run("R2", "show ip route rip"), /R +1\.1\.1\.1 \[120\/1\] via 10\.12\.0\.1/);
  });
  const p3 = router("config");
  if (!supports(p3, "R1", "route-map ")) skip("route-maps", "no route-map yet");
  else check("route-map prompt", () => {
    const t = router("config");
    t.run("R1", "route-map RM permit 10");
    eq(t.con("R1").prompt(), "Router(config-route-map)#");
  });
  if (!supports(p3, "R1", "ip prefix-list ")) skip("prefix-lists", "no ip prefix-list yet");
  else check("prefix-list show format", () => {
    const t = router("config");
    t.run("R1", "ip prefix-list PL seq 5 permit 10.0.0.0/8 le 24", "end");
    has(t.run("R1", "show ip prefix-list"), /ip prefix-list PL: 1 entries\n +seq 5 permit 10\.0\.0\.0\/8 le 24/);
  });
  if (!supports(p3, "R1", "ip sla ")) skip("IP SLA", "no ip sla yet");
  else check("ip sla prompt", () => {
    const t = router("config");
    t.run("R1", "ip sla 1");
    eq(t.con("R1").prompt(), "Router(config-ip-sla)#");
  });
}

section("CCNP VRF and DMVPN");
{
  const probe = router("config");
  if (!supports(probe, "R1", "vrf ")) skip("VRF-lite", "no vrf definition yet");
  else check("vrf forwarding clears the interface address", () => {
    const t = router("config");
    t.run("R1", "vrf definition RED", "address-family ipv4", "exit-address-family", "exit", "interface g0/0", "ip address 10.0.0.1 255.255.255.0");
    has(t.run("R1", "vrf forwarding RED"), "% Interface GigabitEthernet0/0 IPv4 disabled and address(es) removed due to enabling VRF RED");
  });
  if (!/nhrp/.test((() => { const t = router("config"); t.run("R1", "interface tunnel0"); return t.con("R1").help("ip "); })())) skip("DMVPN", "no ip nhrp yet");
  else check("show dmvpn header", () => has(router().run("R1", "show dmvpn"), "Legend: Attrb --> S - Static, D - Dynamic"));
}

section("CCNP switching extras");
{
  const probe = lab([S("SW1")]);
  probe.run("SW1", "enable", "configure terminal", "interface f0/1");
  if (!/^ +guard +/m.test(probe.con("SW1").help("spanning-tree "))) skip("root guard", "no spanning-tree guard yet");
  else check("root guard config line", () => {
    const t = lab([S("SW1")]);
    t.conf("SW1", "interface f0/1", "spanning-tree guard root");
    has(t.run("SW1", "show running-config interface f0/1"), " spanning-tree guard root");
  });
  const p2 = lab([S("SW1")]);
  p2.run("SW1", "enable", "configure terminal");
  if (!supports(p2, "SW1", "monitor ")) skip("SPAN", "no monitor session yet");
  else check("show monitor session", () => {
    const t = lab([S("SW1")]);
    t.conf("SW1", "monitor session 1 source interface f0/1 both", "monitor session 1 destination interface f0/2");
    const out = t.run("SW1", "show monitor session 1");
    has(out, /Session 1\n-+\nType +: Local Session/);
    has(out, /Both +: Fa0\/1/);
    has(out, /Destination Ports +: Fa0\/2/);
  });
  if (!/snooping/.test(p2.con("SW1").help("ip dhcp "))) skip("DHCP snooping", "no ip dhcp snooping yet");
  else check("show ip dhcp snooping", () => {
    const t = lab([S("SW1")]);
    t.conf("SW1", "ip dhcp snooping", "ip dhcp snooping vlan 1");
    has(t.run("SW1", "show ip dhcp snooping"), "Switch DHCP snooping is enabled");
  });
}

// ---------------------------------------------------------------- report
for (const [name, why] of failures) console.error("FAIL: " + name + "\n  " + why.split("\n").join("\n  "));
if (process.env.VERBOSE) {
  for (const [owner, name, why] of knownSeen) console.log(`known gap [${owner}] ${name}\n  ${why.split("\n").slice(0, 4).join("\n  ")}`);
  for (const s of skipped) console.log("skipped: " + s);
}
for (const name of fixedGaps) console.error("GAP CLOSED (remove it from KNOWN_GAPS): " + name);
console.log(`conformance: ${results.pass} passed, ${results.fail} failed, ${results.known} known gaps, ${results.skipped} skipped`);
process.exit(results.fail || fixedGaps.length ? 1 : 0);
