# 🎴 CCNA Flashcard Deck

> **What this is:** the recall-drill companion to the Study Guide. Every card is
> **atomic** — one fact, one answer — because that's what spaced repetition needs.
> The Question Bank tests exam-style reasoning; these build the instant recall
> that stops you burning clock time on the real thing.

> **How to use it:** import `CCNA_Flashcards.apkg` into Anki. Every card's fact is explained in full in the **Study Guide** — when a card keeps failing, that's your signal to go re-read the section rather than drill harder. Subdecks follow
> the guide's chapter order (the **Study Tips** table maps each chapter to its
> subdeck), so you can drill exactly what you just read. Do them **daily** —
> 15 minutes beats an hour on Sunday.

> **Format note:** this file is the source. Edit it, then rebuild the deck with
> `python ccna/scripts/build_flashcards.py`. Each card is a `**Q:**` / `**A:**` pair;
> `##` headings become subdecks and tags.

---

## 01 Network Fundamentals

**Q:** Which OSI layer do switches primarily operate at, and what address do they use?
**A:** Layer 2 (Data Link) — they forward using **MAC addresses**.

**Q:** Which OSI layer do routers operate at, and what address do they use?
**A:** Layer 3 (Network) — they forward using **IP addresses**.

**Q:** Name the 7 OSI layers, top to bottom.
**A:** Application, Presentation, Session, Transport, Network, Data Link, Physical. *(All People Seem To Need Data Processing)*

**Q:** What is the OSI Layer 4 PDU called? Layer 3? Layer 2?
**A:** L4 = **segment**, L3 = **packet**, L2 = **frame**.

**Q:** In a three-tier campus design, what are the three layers?
**A:** **Access** (end devices plug in), **Distribution** (routing + policy), **Core** (fast backbone).

**Q:** What is a "collapsed core" design?
**A:** A **two-tier** design merging core and distribution — used when a site is too small to justify a separate core.

**Q:** In spine-leaf, how many hops separate any two servers?
**A:** Always **two** (leaf → spine → leaf) — that's the point: predictable latency for east-west traffic.

**Q:** What does "east-west" traffic mean?
**A:** **Server-to-server** traffic inside the data center (vs north-south = user → server → internet).

**Q:** What's the key difference between a VM and a container?
**A:** A VM contains a **full guest OS**; a container **shares the host kernel** and holds only the app — so it's far smaller and starts in seconds.

**Q:** What does a VRF provide?
**A:** Multiple **separate routing tables** on one physical router. *VLANs separate at L2; VRFs separate at L3.*

**Q:** What are the layers of the TCP/IP model, and how do they map to OSI?
**A:** **Application, Transport, Internet, Network Access** — Application absorbs OSI 5–7; Network Access merges Data Link + Physical.

**Q:** Going down the stack, which layer adds a *trailer* as well as a header?
**A:** **Layer 2** — the frame gets a header *and* an **FCS trailer** for error detection. Every other layer adds only a header.

**Q:** IaaS vs PaaS vs SaaS — what does the provider manage in each?
**A:** **IaaS** = hardware/VMs, you run the OS up (AWS EC2). **PaaS** = platform, you bring code. **SaaS** = the whole app (Office 365). *Each step hands more of the stack to the provider.*

**Q:** What is a hybrid cloud?
**A:** **Private + public cloud working together** — e.g. steady workloads on-prem, bursts into public. (Public = shared provider infra; private = yours alone.)

**Q:** Hub vs switch vs router — what does each one segment?
**A:** A **hub segments nothing** (one collision domain). A **switch** segments **collision** domains per port. A **router** segments **broadcast** domains.

**Q:** In spine-leaf, what connects to what?
**A:** **Every leaf connects to every spine** — never leaf-to-leaf or spine-to-spine. Servers attach only to leaves.

---

## 02 TCP, UDP & Ports

**Q:** TCP or UDP: which is connection-oriented and reliable?
**A:** **TCP** — handshake, sequencing, acknowledgments, retransmission.

**Q:** Why does voice/video use UDP rather than TCP?
**A:** A **retransmitted voice packet arrives too late to be useful**. Speed and steady timing matter more than perfect delivery.

**Q:** What are the three steps of the TCP handshake?
**A:** **SYN → SYN-ACK → ACK**.

**Q:** Why does closing a TCP connection normally take four messages?
**A:** TCP is **full duplex** — each direction closes independently (FIN/ACK each way), so a half-close is legal.

**Q:** Do TCP sequence numbers count packets or bytes?
**A:** **Bytes**. That's why one ACK can confirm an arbitrary amount of data.

**Q:** What does an ACK number actually mean?
**A:** The **next byte expected** — so `Ack=3001` means "everything below 3001 arrived."

**Q:** What do three duplicate ACKs trigger?
**A:** **Fast retransmit** — resend just the missing segment without waiting for a timeout.

**Q:** Flow control vs congestion control — what does each protect?
**A:** Flow control protects the **receiver** (advertised Window field); congestion control protects the **network** (inferred from loss).

**Q:** What is the typical MSS on an Ethernet network, and how is it derived?
**A:** **1460** = 1500 MTU − 20 IP header − 20 TCP header.

**Q:** Why do tunnels (GRE/IPsec/PPPoE) cause mysterious connectivity failures?
**A:** Their extra headers **shrink the usable MTU**; traffic sized for 1500 no longer fits and gets dropped.

**Q:** Port 22?
**A:** **SSH** — encrypted remote CLI.

**Q:** Port 23?
**A:** **Telnet** — remote CLI in **plaintext**, which is why SSH replaced it.

**Q:** Port 53?
**A:** **DNS**.

**Q:** Ports 67/68?
**A:** **DHCP** — 67 on the server, 68 on the client.

**Q:** Port 80?
**A:** **HTTP**.

**Q:** Port 443?
**A:** **HTTPS** — HTTP inside TLS.

**Q:** Ports 20/21?
**A:** **FTP** — 20 carries the data, 21 the control conversation.

**Q:** Port 69?
**A:** **TFTP** — UDP, no authentication.

**Q:** Ports 161/162?
**A:** **SNMP** — the manager polls agents on 161; agents send traps to 162.

**Q:** Port 514?
**A:** **Syslog**.

**Q:** Port 123?
**A:** **NTP**.

**Q:** Port 25?
**A:** **SMTP** — *sending* mail.

**Q:** Port 110?
**A:** **POP3** — *retrieving* mail (download-and-delete; contrast IMAP 143).

**Q:** Port 143 — what protocol, and how does it differ from POP3?
**A:** **IMAP** — mail stays **on the server** and syncs across devices; POP3 (110) downloads and (typically) deletes it.

**Q:** What are the well-known and ephemeral port ranges?
**A:** Well-known **0–1023** (servers); ephemeral **49152–65535** (the client's random source port for each conversation).

**Q:** What uniquely identifies one conversation end-to-end (a "socket")?
**A:** **IP address + port + protocol** — which is how one server IP can hold thousands of simultaneous conversations apart.

**Q:** A receiver advertises TCP window size 0. What happens?
**A:** The sender **stops transmitting** until the window reopens — flow control literally pausing the conversation to protect the receiver.

**Q:** Why does DNS use both UDP *and* TCP on port 53?
**A:** **UDP** for fast single-packet queries; **TCP** when the answer is too large or for **zone transfers**, which need reliability.

---

## 03 Cables, PoE, Binary & Hex

**Q:** Which cable connects two switches together without Auto-MDIX?
**A:** A **crossover** cable (like devices → crossover; unlike devices → straight-through).

**Q:** What is the maximum length of a copper UTP Ethernet run?
**A:** **100 metres**.

**Q:** Single-mode vs multi-mode fiber — which goes further and why?
**A:** **Single-mode** — a narrower core carries one light path, so there's no modal dispersion; good for kilometres.

**Q:** PoE: how much power does 802.3af provide? 802.3at? 802.3bt?
**A:** **af ≈ 15.4 W**, **at (PoE+) ≈ 30 W**, **bt (PoE++) ≈ 60–100 W** — measured at the switch port.

**Q:** Why is a non-PoE laptop safe to plug into a PoE port?
**A:** The switch performs **detection** first — no powered-device signature means it sends **data only**.

**Q:** What are the 8 binary place values in one octet?
**A:** **128, 64, 32, 16, 8, 4, 2, 1**.

**Q:** Convert 192 to binary.
**A:** **11000000** (128 + 64).

**Q:** Convert binary 10101100 to decimal.
**A:** **172** (128 + 32 + 8 + 4).

**Q:** Convert hex AC to decimal.
**A:** **172** — A=10, C=12, so (10 × 16) + 12.

**Q:** Convert decimal 240 to hex.
**A:** **F0** — 240 ÷ 16 = 15 (F) remainder 0.

**Q:** How many hex digits in a MAC address, and why?
**A:** **12** — each hex digit is 4 bits, and 48 ÷ 4 = 12.

**Q:** Cat5e vs Cat6/6a — what speeds over 100 m?
**A:** **Cat5e = 1 Gbps**; **Cat6 = 10 Gbps only to ~55 m**; **Cat6a = 10 Gbps the full 100 m**.

**Q:** What makes a cable straight-through vs crossover, in wiring terms?
**A:** **Same standard both ends (T568B–T568B) = straight-through**; **different (T568A–T568B) = crossover** — the transmit and receive pairs swap.

**Q:** What does Auto-MDIX do?
**A:** The port **detects which pairs the far end transmits on and swaps itself** if needed — making the straight-through/crossover choice irrelevant on modern gear.

**Q:** When is fiber required instead of copper?
**A:** Runs **over 100 m**, or through **electrical interference** — light is immune to EMI, and copper's length limit is hard.

---

## 04 Switching & VLANs

**Q:** How many bits in a MAC address, and how is it split?
**A:** **48 bits** — first 24 = **OUI** (vendor), last 24 = device-specific.

**Q:** Write out the broadcast MAC address.
**A:** **FFFF.FFFF.FFFF** — all 48 bits set to 1.

**Q:** What are the three ways to address a frame?
**A:** **Unicast** (one), **Broadcast** (all), **Multicast** (a subscribed group).

**Q:** How does a switch learn MAC addresses?
**A:** From the **source MAC** of incoming frames, mapped to the port they arrived on.

**Q:** What does a switch do with a frame whose destination MAC is unknown?
**A:** **Floods** it out every port except the one it arrived on (unknown unicast flooding).

**Q:** Collision domain vs broadcast domain — what separates each?
**A:** Each **switch port** is its own collision domain; each **VLAN / router interface** bounds a broadcast domain.

**Q:** What are the three port-security violation modes, and which is default?
**A:** **protect**, **restrict**, **shutdown** — **shutdown** is the default (err-disables the port).

**Q:** How do you recover an err-disabled port?
**A:** `shutdown` then `no shutdown` on the interface (after fixing the cause).

**Q:** What problem do VLANs solve?
**A:** They split one physical switch into **multiple broadcast domains**, without buying more switches.

**Q:** Access port vs trunk port?
**A:** **Access** carries one VLAN, untagged, to an end device. **Trunk** carries many VLANs, tagged, between switches.

**Q:** What's the normal VLAN range vs the extended range?
**A:** Normal **1–1005**, extended **1006–4094**.

**Q:** Command to put port Fa0/1 into VLAN 10?
**A:** `interface fa0/1` → `switchport mode access` → `switchport access vlan 10`.

**Q:** How big is an 802.1Q tag and what's the key field?
**A:** **4 bytes**, containing a **12-bit VLAN ID** (1–4094).

**Q:** What is the native VLAN?
**A:** The one VLAN sent **untagged** across a trunk. Default is **VLAN 1** — best practice is to change it.

**Q:** Why disable DTP with `switchport nonegotiate`?
**A:** DTP can be tricked into **forming a trunk with an attacker**, exposing every VLAN. Set modes statically instead.

**Q:** Why do two VLANs need a router (or SVI) to communicate?
**A:** VLANs are **separate broadcast domains = separate subnets**, and moving between subnets is by definition Layer 3 routing.

**Q:** What is "router on a stick"?
**A:** Inter-VLAN routing via **one trunk link** to a router using **subinterfaces**, one per VLAN.

**Q:** What does `switchport voice vlan 150` do on an access port?
**A:** Lets the port carry **two VLANs**: the phone **tags** its traffic into VLAN 150, while the PC behind it stays **untagged** in the access VLAN.

**Q:** What is the default DTP mode on modern Catalyst switches, and what does it do?
**A:** **dynamic auto** — it will *accept* trunk negotiation but never *initiate* it. So **auto + auto = no trunk** (stays access).

**Q:** Which DTP combinations actually form a trunk?
**A:** At least one side must ask: **desirable + (desirable or auto)**, or one side hard-set to **trunk**. Two passive sides never start.

**Q:** How long does a learned MAC address stay in the table by default?
**A:** **300 seconds** (5 minutes) of inactivity — then it ages out and that host's frames flood again until it speaks.

**Q:** Which command answers "which port is this host plugged into?"
**A:** `show mac address-table` (optionally `| include <mac>`) — the port listed against the MAC is where it lives.

**Q:** What is an SVI?
**A:** A **Switched Virtual Interface** — `interface vlan 10` — a virtual L3 interface that gives the switch an IP *in* that VLAN (management, or a gateway on an L3 switch).

**Q:** Command to restrict a trunk to VLANs 10 and 20?
**A:** `switchport trunk allowed vlan 10,20` — and the lists must **match on both ends**, or those VLANs silently die crossing the link.

---

## 05 Spanning Tree

**Q:** What problem does STP solve?
**A:** **Layer 2 loops** — which cause broadcast storms, MAC table instability and duplicate frames. Frames have **no TTL**, so a loop never self-clears.

**Q:** What are the default STP timers?
**A:** **Hello 2 s, Max Age 20 s, Forward Delay 15 s** — hence ~30–50 s convergence.

**Q:** What is the default bridge priority, and what increments is it set in?
**A:** **32768**, in steps of **4096**.

**Q:** Why must STP priority move in steps of 4096?
**A:** The lower 12 bits of the priority field hold the **extended system ID (the VLAN)**, leaving only the top 4 bits adjustable.

**Q:** How is the root bridge elected?
**A:** **Lowest Bridge ID** — priority first, then lowest MAC address as tie-break.

**Q:** STP port costs for 10 Mbps / 100 Mbps / 1 Gbps / 10 Gbps?
**A:** **100 / 19 / 4 / 2**.

**Q:** When is STP root path cost added — sending or receiving?
**A:** On **reception** — a switch adds the cost of the port the BPDU arrived on.

**Q:** What are STP's four tie-breakers, in order?
**A:** 1) lowest **Root Bridge ID**, 2) lowest **Root Path Cost**, 3) lowest **Sender Bridge ID**, 4) lowest **Sender Port ID**.

**Q:** How many root ports does a non-root switch have? How many designated ports per segment?
**A:** Exactly **one** root port per non-root switch; exactly **one** designated port per segment.

**Q:** What does PortFast do, and where is it safe?
**A:** Skips listening/learning so a port forwards immediately — only on **access ports facing end devices**.

**Q:** What does BPDU Guard do?
**A:** **Err-disables** a port that **receives a BPDU** — a PC port should never see one.

**Q:** What does Root Guard do?
**A:** Prevents a switch on that port from becoming root — a **superior BPDU** puts the port in **root-inconsistent** state.

**Q:** What does Loop Guard protect against?
**A:** A blocking port that **stops receiving BPDUs** (unidirectional link failure) wrongly starting to forward and creating a loop.

**Q:** BPDU Guard vs Loop Guard — the one-line distinction?
**A:** **BPDU Guard reacts to a BPDU appearing; Loop Guard reacts to BPDUs disappearing.** One fears noise, the other silence.

**Q:** What is the default spanning-tree mode on modern Cisco switches?
**A:** **Rapid PVST+** — 802.1w speed with one instance per VLAN.

**Q:** Why run one spanning tree per VLAN?
**A:** Different switches can be root for different VLANs, so **both uplinks carry traffic** instead of one sitting idle.

**Q:** What are the three RSTP port states?
**A:** **Discarding, Learning, Forwarding**.

**Q:** RSTP alternate port vs backup port?
**A:** **Alternate** = backup for the **root port**, hearing superior BPDUs from *another* switch. **Backup** = backup for a **designated port** on the same shared segment (same switch).

**Q:** Why is RSTP fast without timers?
**A:** The **proposal/agreement handshake** — the neighbour blocks its own downstream ports (sync) then explicitly agrees, so safety comes from agreement rather than elapsed time.

**Q:** Why can a duplex mismatch cost you RSTP's fast convergence?
**A:** Half duplex makes RSTP treat the link as **shared** rather than point-to-point, so it falls back to timers.

**Q:** What are the 802.1D (legacy STP) port states, in order?
**A:** **Blocking → Listening → Learning → Forwarding** (plus Disabled) — listening + learning are 15 s each, hence the famous ~30 s wait.

**Q:** How does a non-root switch choose its root port?
**A:** **Lowest root path cost**; ties broken by lowest **neighbor Bridge ID**, then lowest **neighbor port ID**. One winner, always.

**Q:** What makes one BPDU "superior" to another?
**A:** A **lower Bridge ID** (or better cost) — i.e. it claims a better root. Root Guard fires precisely when a superior BPDU arrives where it shouldn't.

**Q:** Where does the VLAN number live inside the bridge priority?
**A:** In the **extended system ID** — the low 12 bits of the priority field. That's why a switch's real priority is 32768 **+ VLAN number**.

---

## 06 EtherChannel

**Q:** What does EtherChannel do for STP?
**A:** Makes several physical links appear as **one logical link**, so STP won't block the redundant members.

**Q:** LACP vs PAgP — which is the open standard?
**A:** **LACP (802.3ad)** is the standard; **PAgP** is Cisco-proprietary.

**Q:** LACP modes that will form a channel?
**A:** **active/active** or **active/passive**. (passive/passive will not.)

**Q:** Does a single file transfer go faster over a 4×1 Gbps EtherChannel?
**A:** **No** — a flow is hashed to **one link**, so it's capped at 1 Gbps. EtherChannel scales *many* conversations.

**Q:** Why hash flows to a link instead of round-robining packets?
**A:** Round-robin would deliver packets **out of order**, which TCP reads as loss — triggering retransmits and cutting throughput.

**Q:** Why prefer 2, 4 or 8 links in a bundle?
**A:** The hash space divides **evenly** only across powers of two; other counts leave links permanently lopsided.

**Q:** What are the PAgP modes, and which combinations bundle?
**A:** **desirable** (initiates) and **auto** (responds) — **desirable+desirable** or **desirable+auto** bundle; **auto+auto** does not. *Same logic as LACP active/passive.*

**Q:** What does `channel-group 1 mode on` do, and what's the risk?
**A:** **Static bundling, no protocol** — both sides must be `on`. With no negotiation to catch mistakes, a mismatch can forward into a **loop**.

**Q:** What must match on every member interface of an EtherChannel?
**A:** **Speed, duplex, and all VLAN/trunk settings** — a mismatched member is suspended (`s`) rather than bundled.

**Q:** How do you build a Layer 3 EtherChannel?
**A:** `no switchport` on the members, then the **IP address goes on the port-channel interface** — a routed bundle between L3 switches.

**Q:** In `show etherchannel summary`, what do the flags SU and (P) mean?
**A:** **S** = Layer 2, **U** = in use — a healthy bundle; **(P)** beside a member = bundled into the port-channel. *SU + all (P) is the pass mark.*

---

## 07 IP Addressing & Subnetting

**Q:** What are the three private IPv4 ranges?
**A:** **10.0.0.0/8**, **172.16.0.0–172.31.255.255**, **192.168.0.0/16**.

**Q:** What does an address in 169.254.x.x mean?
**A:** **APIPA** — the host **could not reach a DHCP server** and self-assigned.

**Q:** What is the loopback address range?
**A:** **127.0.0.0/8** (usually 127.0.0.1) — tests the local TCP/IP stack.

**Q:** Formula for usable hosts in a subnet?
**A:** **2^(host bits) − 2** (subtracting network and broadcast addresses).

**Q:** Formula for number of subnets when borrowing bits?
**A:** **2^(borrowed bits)**.

**Q:** How many usable hosts in a /24? /26? /30?
**A:** **254**, **62**, **2**.

**Q:** What mask is /26, and what is its block size?
**A:** **255.255.255.192**, block size **64**.

**Q:** What mask is /27, and what is its block size?
**A:** **255.255.255.224**, block size **32**.

**Q:** What mask is /28? /29?
**A:** **255.255.255.240** (block 16) and **255.255.255.248** (block 8).

**Q:** In 172.16.40.0/21, what is the block size and next network?
**A:** /21 = 255.255.248.0 → block **8** in the third octet → next network **172.16.48.0**.

**Q:** What is the network address of 192.168.10.77/26?
**A:** Block size 64 → boundaries 0, 64, 128, 192 → network **192.168.10.64**, broadcast **.127**.

**Q:** Why is a /30 used for router-to-router links?
**A:** It gives exactly **2 usable addresses** — one per router — wasting nothing. (/31 is also valid for p2p.)

**Q:** What is VLSM, and what's its golden rule?
**A:** Different-sized subnets from one block. **Always allocate the largest subnet first.**

**Q:** What are the Class A, B and C first-octet ranges?
**A:** **A: 1–126, B: 128–191, C: 192–223** (127 is loopback). Classes set the *default* masks /8, /16, /24.

**Q:** What are Class D and Class E used for?
**A:** **D (224–239) = multicast**, **E (240–255) = experimental** — neither is assigned to hosts.

**Q:** How many /28s fit in one /24?
**A:** **16** — four extra network bits, 2⁴ = 16 subnets of 14 usable hosts each.

**Q:** A LAN needs 100 hosts. Smallest subnet?
**A:** **/25** (126 usable) — /26 gives only 62. *Find the first power of 2 minus 2 that fits.*

**Q:** Last usable host and broadcast of 192.168.1.64/27?
**A:** Block 32 → next network .96, so broadcast **.95** and last usable **.94** — *the address one below the next network is always the broadcast.*

**Q:** Why does a /31 work on point-to-point links despite the −2 rule?
**A:** With only **two addresses and two routers**, there's nothing to broadcast *to* — RFC 3021 drops the network/broadcast reservation for p2p.

**Q:** What prefix is mask 255.255.255.252, and where do you see it constantly?
**A:** **/30** — 2 usable hosts, the classic **router-to-router link** subnet.

---

## 08 IPv6

**Q:** How long is an IPv6 address, and how long is its header?
**A:** **128 bits**; the header is a **fixed 40 bytes**.

**Q:** What are the two IPv6 shortening rules?
**A:** Drop **leading zeros** in a group, and replace **one** run of all-zero groups with `::`.

**Q:** What is the link-local prefix?
**A:** **FE80::/10** — every IPv6 interface has one, and it's never routed off the link.

**Q:** What prefix is unique local? Multicast?
**A:** Unique local **FC00::/7** (in practice FD00::/8); multicast **FF00::/8**.

**Q:** What are FF02::1 and FF02::2?
**A:** **All-nodes** and **all-routers** on the link.

**Q:** How does EUI-64 build an interface ID from a MAC?
**A:** Split the MAC, insert **FFFE** in the middle, and **flip the 7th bit** of the first byte.

**Q:** Does IPv6 have broadcast?
**A:** **No** — it uses **multicast** (and anycast) instead.

**Q:** What replaced ARP in IPv6?
**A:** **NDP** — Neighbor Solicitation / Neighbor Advertisement over ICMPv6.

**Q:** What are the five NDP message types?
**A:** **RS (133), RA (134), NS (135), NA (136), Redirect (137)**.

**Q:** Why does NDP use solicited-node multicast instead of broadcast?
**A:** A NIC filters multicast **in hardware**, so uninvolved hosts' CPUs are never interrupted — unlike ARP's broadcast.

**Q:** What is DAD and how does it work?
**A:** **Duplicate Address Detection** — the host sends an NS for **its own** tentative address; **silence means it's free**.

**Q:** What is SLAAC?
**A:** **Stateless Address Autoconfiguration** — the host learns the prefix from an **RA** and generates its own host portion.

**Q:** What do the RA M and O flags mean?
**A:** **M=1** → get the address from **stateful DHCPv6**. **O=1** → address via SLAAC but **other config (DNS)** from DHCPv6.

**Q:** Why keep DHCPv6 when SLAAC exists?
**A:** SLAAC keeps **no record** of who holds which address — enterprises needing auditing/accountability require the central ledger.

**Q:** What is the global unicast range?
**A:** **2000::/3** — the internet-routable IPv6 space (first three bits 001).

**Q:** What are `::` and `::1`?
**A:** **`::` = unspecified** (no address yet — the IPv6 0.0.0.0), **`::1` = loopback** (IPv6's 127.0.0.1).

**Q:** What is anycast?
**A:** **One address on many devices** — routing delivers to the *nearest* one. Same address, different servers; how global DNS resolvers work.

**Q:** What does `ipv6 unicast-routing` actually turn on?
**A:** **IPv6 forwarding *and* Router Advertisements** — without it a router answers its own addresses but won't route or run SLAAC for hosts.

**Q:** How is a solicited-node multicast address built?
**A:** **FF02::1:FF** + the **last 24 bits of the unicast address** — so an NS reaches almost-only the intended host instead of everyone.

**Q:** What is dual stack?
**A:** Running **IPv4 and IPv6 simultaneously** on the same interfaces — the standard migration strategy: each conversation picks a protocol.

---

## 09 Routing Fundamentals & FHRP

**Q:** What are the Administrative Distances for connected, static, EIGRP, OSPF and RIP?
**A:** **0, 1, 90, 110, 120**. (255 = untrusted/never used.)

**Q:** What does Administrative Distance decide?
**A:** **Which source to believe** when several describe the same network. Lower = more trusted.

**Q:** What does a metric decide, and how does it differ from AD?
**A:** Metric picks the **best path within one protocol**. AD picks **which protocol/source** to trust first.

**Q:** What is longest prefix match?
**A:** The router uses the **most specific** matching route — /30 beats /24 beats /8 — regardless of AD or metric.

**Q:** What is a floating static route?
**A:** A static route with a **deliberately raised AD**, so it only takes over if the preferred route disappears.

**Q:** Syntax for a default route?
**A:** `ip route 0.0.0.0 0.0.0.0 <next-hop>` — the "everywhere else" route.

**Q:** What problem does an FHRP solve?
**A:** A host's default gateway is a **single static setting** — hosts can't switch on their own, so the routers must **share one virtual IP**.

**Q:** Why must an FHRP share a virtual MAC, not just a virtual IP?
**A:** Hosts address frames to the **cached MAC**; moving only the IP would leave them sending to a dead router until ARP caches expired.

**Q:** HSRP vs VRRP vs GLBP?
**A:** **HSRP** Cisco, Active/Standby. **VRRP** open standard, Master/Backup. **GLBP** Cisco, also **load balances**.

**Q:** How does HSRP elect the active router?
**A:** **Highest priority** (default 100); tie broken by **highest IP address**.

**Q:** What does `standby 1 preempt` do, and where must it be configured?
**A:** Lets a recovered router **reclaim** Active. It's needed on the router with the **higher priority**.

**Q:** HSRP default hello and hold timers?
**A:** **Hello 3 s, hold 10 s**.

**Q:** Routing table codes C, L, S, O, D — what's each?
**A:** **C** connected, **L** local, **S** static, **O** OSPF, **D** EIGRP (for DUAL, its algorithm).

**Q:** What is the L (local) route that appears with every connected interface?
**A:** A **/32 for the interface's own address** — traffic *to the router itself*, as opposed to the connected subnet around it.

**Q:** What does "Gateway of last resort" in `show ip route` mean?
**A:** The router's **default route** is set — the `*` candidate-default marks which route catches everything nothing else matches.

**Q:** In a route entry like `[110/20]`, what are the two numbers?
**A:** **[AD / metric]** — 110 = OSPF's administrative distance (trust), 20 = that route's OSPF cost (quality). *Trust first, quality second.*

**Q:** Static route via next-hop IP vs exit interface — why prefer the next-hop?
**A:** An **exit-interface static on Ethernet** forces the router to ARP for *every* destination — works poorly on multi-access links. Next-hop (or both) is clean.

**Q:** What is the HSRP virtual MAC pattern?
**A:** **0000.0c07.acXX** — XX is the **group number in hex**. Spotting it in an ARP table tells you HSRP group and all.

---

## 10 OSPF

**Q:** What type of routing protocol is OSPF, and what algorithm does it run?
**A:** **Link-state**, running **Dijkstra's SPF** over its database.

**Q:** OSPF hello and dead intervals on broadcast/p2p links?
**A:** **Hello 10 s, Dead 40 s**.

**Q:** How is the OSPF Router ID chosen?
**A:** Manual `router-id` first; else the **highest loopback IP**; else the highest active physical interface IP.

**Q:** How is OSPF cost calculated, and what's the default reference bandwidth?
**A:** **Reference bandwidth ÷ interface bandwidth**; default reference is **100 Mbps** (so anything ≥100 Mbps computes to 1).

**Q:** What must match for OSPF neighbors to form?
**A:** **Area ID, hello/dead timers, subnet/mask, authentication, MTU**, and compatible network type. *(Router IDs must be unique, not matching.)*

**Q:** Why does OSPF elect a DR and BDR on broadcast segments?
**A:** To cut adjacencies from **n(n−1)/2** to a hub-and-spoke around the DR, avoiding duplicate flooding.

**Q:** How is the OSPF DR elected?
**A:** **Highest interface priority** (default 1), tie broken by **highest Router ID**. Priority **0** = never eligible.

**Q:** Is the OSPF DR election preemptive?
**A:** **No** — a new higher-priority router does *not* take over an existing DR. *(Contrast: HSRP with `preempt` does.)*

**Q:** Is `2WAY/DROTHER` in `show ip ospf neighbor` a problem?
**A:** **No** — two DROTHERs deliberately stop at 2WAY. They only go FULL with the **DR and BDR**.

**Q:** Which command skips the DR/BDR election on a 2-router link?
**A:** `ip ospf network point-to-point`.

**Q:** What are the OSPF neighbor states in order?
**A:** **Down → Init → 2-Way → ExStart → Exchange → Loading → Full**.

**Q:** An adjacency stuck in EXSTART/EXCHANGE usually means what?
**A:** An **MTU mismatch** — hellos are small enough to pass, but the larger DBD packets are dropped.

**Q:** What does "Init" state indicate?
**A:** **One-way communication** — you hear their hello but aren't listed in it (often an ACL or mask problem).

**Q:** OSPF LSA Type 1 and Type 2 — what are they?
**A:** **Type 1 = Router LSA** (a router's own links). **Type 2 = Network LSA**, generated by the **DR** to describe a broadcast segment.

**Q:** OSPF LSA Types 3 and 5?
**A:** **Type 3 = Summary** (inter-area, from the ABR). **Type 5 = External** (redistributed, from the ASBR).

**Q:** What does a stub area block, and what does it get instead?
**A:** Blocks **Type 5 externals**; receives a **default route** instead.

**Q:** Why must every router in an OSPF area hold an identical database?
**A:** Each computes its own tree from it — **identical input + deterministic algorithm = consistent, loop-free forwarding**.

**Q:** What does `passive-interface` do — and deliberately not do?
**A:** **Stops sending hellos** on that interface (no accidental neighbors), but the subnet is **still advertised**. Standard on LAN/loopback interfaces.

**Q:** What does `default-information originate` do?
**A:** Makes the edge router **advertise its default route into OSPF**, so every internal router learns "exit that way" without their own default.

**Q:** In `network 10.0.12.0 0.0.0.3 area 0`, what does the wildcard select?
**A:** **Which interfaces join OSPF** — any interface whose address falls in 10.0.12.0–.3. It enables *interfaces*, not routes.

**Q:** Why does a loopback show up in OSPF as /32 no matter its mask?
**A:** OSPF treats loopbacks as **host routes** by default — `ip ospf network point-to-point` on the loopback advertises the real mask.

**Q:** What's the rule when changing `auto-cost reference-bandwidth`?
**A:** Change it **identically on every router** — costs are only comparable if everyone measures with the same ruler.

---

## 11 IP Services

**Q:** What are the four DHCP steps?
**A:** **DORA** — Discover, Offer, Request, Acknowledge.

**Q:** Why is `ip helper-address` needed?
**A:** DHCP Discover is a **broadcast**, and routers don't forward broadcasts — the helper **relays** it as unicast to the server.

**Q:** What does DNS do, and on which port?
**A:** Resolves **names to IP addresses**, on port **53**.

**Q:** Pinging an IP works but pinging a hostname fails. What does that isolate, and why?
**A:** **DNS.** Reaching the IP proves routing and the gateway are fine, so only **name resolution** is left.

**Q:** Static NAT vs dynamic NAT vs PAT?
**A:** **Static** = permanent 1-to-1. **Dynamic** = from a pool, as needed. **PAT/overload** = many hosts share **one** IP using **ports**.

**Q:** Which NAT type lets an outside host initiate a connection inward, and why?
**A:** **Static NAT** — the mapping is permanent and **bidirectional**; PAT entries only exist after an inside host starts a conversation.

**Q:** What keyword turns NAT into PAT?
**A:** **`overload`** — as in `ip nat inside source list 1 interface gi0/1 overload`.

**Q:** Which command shows the live NAT table?
**A:** `show ip nat translations`.

**Q:** Why does NTP matter for security?
**A:** **Logs, certificates and authentication** all depend on accurate time; skewed clocks break correlation and validation.

**Q:** Syslog severity levels 0–7?
**A:** **0 Emergency, 1 Alert, 2 Critical, 3 Error, 4 Warning, 5 Notification, 6 Informational, 7 Debugging.** *(Lower = more severe.)*

**Q:** SNMP: what's a get vs a trap?
**A:** A **get** is the manager **polling** the device; a **trap** is the device **pushing** an alert unprompted.

**Q:** Which QoS marking is used for voice?
**A:** **EF — Expedited Forwarding, DSCP 46**.

**Q:** Policing vs shaping?
**A:** **Policing drops** excess traffic; **shaping buffers** it to send later.

**Q:** What is jitter, and what's the target for voice?
**A:** **Variation in delay** — under **30 ms**. (One-way delay under 150 ms, loss under 1%.)

**Q:** What is a QoS trust boundary?
**A:** The point where the network decides whether to **believe incoming markings** — you trust an IP phone, not a user's PC.

**Q:** What does NTP stratum measure?
**A:** **Distance from the reference clock** — stratum 1 is attached to it, each hop adds one. **Lower = more believable.**

**Q:** SNMP polling vs traps — why use both?
**A:** **Polling** (Get) proves devices are alive but misses events between sweeps; **traps** report events instantly but a dead device goes silent.

**Q:** In SNMP, what are the MIB and an OID?
**A:** The **MIB** is the tree of everything askable on a device; an **OID** is one dotted address into that tree.

**Q:** Why is SNMPv2c considered insecure?
**A:** Its **community string** is a shared password sent in **plaintext** — v3 adds real authentication and encryption.

**Q:** How does a DHCP server pick the right pool for a *relayed* request?
**A:** From **giaddr** — the relay stamps in its receiving interface's IP, telling the server which subnet the client sits on.

**Q:** What does `ip dhcp excluded-address` protect?
**A:** Statically assigned addresses (gateways, servers) — the server **won't lease** anything in the excluded range, preventing duplicates.

**Q:** CoS vs DSCP — where does each marking live?
**A:** **CoS = 3 bits in the 802.1Q tag** (L2 — dies when the tag is stripped); **DSCP = 6 bits in the IP header** (L3 — survives end to end).

**Q:** What must exist before `crypto key generate rsa` will run?
**A:** A **hostname** and an **`ip domain-name`** — the RSA keypair is named from them. Then SSH v2, a local user, and `transport input ssh`.

**Q:** FTP vs TFTP for copying an IOS image — the practical difference?
**A:** **FTP: TCP, login, reliable** — for real transfers. **TFTP: UDP, no auth, dead simple** — fine on a closed lab network. *Both live in `copy` commands.*

**Q:** `ntp master` vs `ntp server <ip>`?
**A:** **`ntp master`** = *be* the authoritative clock (sets own stratum); **`ntp server <ip>`** = *sync from* that clock as a client.

---

## 12 Security & ACLs

**Q:** What are the three parts of the CIA triad?
**A:** **Confidentiality, Integrity, Availability**.

**Q:** What's at the end of every ACL, even unwritten?
**A:** An **implicit `deny any`**.

**Q:** How are ACL entries processed?
**A:** **Top down, first match wins** — and processing stops there.

**Q:** How do you build a wildcard mask?
**A:** **Invert the subnet mask** (255 − each octet). 0 = must match, 255 = don't care. /24 → **0.0.0.255**.

**Q:** Where do you place a standard ACL vs an extended ACL, and why?
**A:** **Standard near the destination** (it only matches source, so placing it early would over-block); **extended near the source** (it's specific, so drop unwanted traffic early).

**Q:** What can a standard ACL match? An extended ACL?
**A:** Standard: **source IP only**. Extended: **source + destination IP, protocol and ports**.

**Q:** What are the three AAA functions?
**A:** **Authentication** (who are you), **Authorization** (what may you do), **Accounting** (what did you do).

**Q:** RADIUS vs TACACS+ — key differences?
**A:** RADIUS: **UDP**, encrypts only the password, combines authn+authz. TACACS+: **TCP**, encrypts the **entire payload**, separates all three functions.

**Q:** What does DHCP snooping prevent?
**A:** A **rogue DHCP server** — untrusted ports aren't allowed to send DHCP offers.

**Q:** What does Dynamic ARP Inspection prevent, and what does it rely on?
**A:** **ARP poisoning / man-in-the-middle** — it validates ARP against the **DHCP snooping binding table**.

**Q:** What is 802.1X, and what are the three roles?
**A:** Port-based authentication before network access. **Supplicant** (client), **Authenticator** (switch), **Authentication server** (RADIUS).

**Q:** What makes authentication truly multi-factor?
**A:** Two **different factor types** — know / have / are. A password + security question is **not** MFA.

**Q:** Why are biometrics risky as a sole credential?
**A:** **You can't change them.** A leaked password is replaced in seconds; a leaked fingerprint is compromised permanently.

**Q:** Why does physical access control belong in network security?
**A:** Physical access defeats most software controls — console access allows **password recovery**, and any port can be used.

**Q:** Define threat, vulnerability, exploit and mitigation in one line each.
**A:** **Vulnerability** = the weakness; **exploit** = the tool/technique that uses it; **threat** = the potential event/actor; **mitigation** = what closes the gap.

**Q:** What is social engineering? Spear phishing?
**A:** Attacking the **person, not the system** — tricking users into granting access. **Spear phishing** = a phish *targeted* at a specific person using researched detail.

**Q:** Site-to-site vs remote-access VPN?
**A:** **Site-to-site**: router-to-router tunnel joining whole networks — hosts don't know it exists. **Remote-access**: one user's client (e.g. Secure Client) into the network.

**Q:** What four protections does IPsec provide?
**A:** **Confidentiality** (encryption), **integrity** (hashing), **origin authentication**, and **anti-replay**.

**Q:** Why does `enable secret` beat `enable password`?
**A:** The secret is stored as a **hash**; the password sits in the config **readable**. If both exist, the secret wins.

**Q:** How do you insert a rule into the middle of a named ACL?
**A:** With **sequence numbers**: `ip access-list extended NAME` → `15 permit ...` slots between 10 and 20 — no delete-and-retype.

**Q:** Which command applies an ACL to the vty lines, and why not `ip access-group`?
**A:** **`access-class 15 in`** — vty lines aren't an interface; this filters *who may manage the box* regardless of which interface the SSH arrives on.

**Q:** What's the default port-security maximum, and what does the port do beyond it?
**A:** **1 MAC address** — a second MAC is a violation, and the default mode **shutdown** err-disables the port.

---

## 13 Wireless

**Q:** Which 2.4 GHz channels are non-overlapping?
**A:** **1, 6 and 11**.

**Q:** Why does 5 GHz generally outperform 2.4 GHz?
**A:** **More non-overlapping channels and less interference** — at the cost of **shorter range** and weaker wall penetration.

**Q:** What is an SSID?
**A:** The wireless **network name** clients see and join.

**Q:** What is the wireless access method, and why not CSMA/CD?
**A:** **CSMA/CA** (collision *avoidance*) — radios can't transmit and listen simultaneously, so collisions can't be detected, only avoided.

**Q:** WPA2 vs WPA3 — what's the main encryption/authentication difference?
**A:** WPA2 uses **AES-CCMP** with a 4-way handshake; **WPA3** adds **SAE** ("Dragonfly"), resisting offline dictionary attacks.

**Q:** Autonomous AP vs lightweight AP?
**A:** **Autonomous** = self-contained, configured individually. **Lightweight** = managed by a **WLC**, via CAPWAP.

**Q:** Which 802.11 standard is Wi-Fi 6, and which bands does it use?
**A:** **802.11ax** — both **2.4 and 5 GHz** (6 GHz with 6E).

**Q:** What two CAPWAP tunnels connect a lightweight AP to its WLC?
**A:** **Control (UDP 5246)** — DTLS-encrypted instructions — and **data (UDP 5247)** — client traffic, unencrypted by default.

**Q:** Why is the lightweight architecture called "split-MAC"?
**A:** The 802.11 job is split: **real-time work** (transmit, ACK, encrypt, beacons) stays **on the AP**; **management** (auth, roaming, RF planning) moves **to the WLC**.

**Q:** Which AP mode keeps serving clients at a branch even if the WAN link to the WLC dies?
**A:** **FlexConnect** — it can switch traffic locally instead of tunneling everything to the WLC.

**Q:** What do the Monitor, Sniffer and SE-Connect AP modes do?
**A:** **Monitor** hunts rogue APs/interference (no clients); **Sniffer** streams captured 802.11 frames to Wireshark; **SE-Connect** does spectrum analysis of non-Wi-Fi interferers.

**Q:** A lightweight AP connects to which switchport type? A WLC?
**A:** AP = **access port** (all traffic rides one CAPWAP tunnel); WLC = **trunk port** (it drops clients onto many VLANs).

**Q:** What is LAG on a WLC, and what's the catch?
**A:** **Link aggregation** of its trunk ports (EtherChannel idea) — but WLC LAG is **static only, no LACP/PAgP** (`mode on` at the switch).

**Q:** Which WLC interface carries CAPWAP and admin access? Which one exists per client VLAN?
**A:** The **management interface**; a **dynamic interface** per VLAN is the WLAN's exit onto the wired network.

**Q:** Name the four WLC QoS profiles, best to worst.
**A:** **Platinum (voice), Gold (video), Silver (best effort — default), Bronze (background)** — medals in order.

**Q:** What three things does a WLAN profile on a WLC tie together?
**A:** An **SSID**, a **dynamic interface** (VLAN), and a **security policy** — and it must be **enabled** (new WLANs start disabled).

**Q:** What does WPA3's SAE prevent that WPA2-PSK allows?
**A:** **Offline dictionary attacks** — the WPA2 4-way handshake can be captured and cracked offline; SAE forces a live exchange per guess.

**Q:** BSS vs ESS — and what is a BSSID?
**A:** **BSS** = one AP and its clients; the **BSSID** is that radio's MAC. **ESS** = multiple APs sharing one SSID so clients can roam.

**Q:** WPA2/WPA3-Personal vs -Enterprise?
**A:** **Personal** = one shared passphrase (PSK); **Enterprise** = **802.1X + RADIUS**, per-user credentials — revoke one user without re-keying the building.

**Q:** Why do wider channels (40/80 MHz) carry a cost?
**A:** More width = more throughput but **fewer non-overlapping channels** = more interference between APs. 2.4 GHz stays at 20 MHz for exactly that reason.

**Q:** What security does the 6 GHz band (Wi-Fi 6E) require?
**A:** **WPA3 only** — no WPA2 or open-legacy modes allowed in the new band.

---

## 14 Automation & Programmability

**Q:** What are the two planes SDN separates?
**A:** **Control plane** (decides where traffic goes) and **data plane** (actually forwards it).

**Q:** Northbound vs southbound API?
**A:** **Northbound** faces apps/users (controller ↔ your scripts). **Southbound** faces the devices (controller ↔ switches).

**Q:** What does CRUD map to in REST?
**A:** **Create=POST, Read=GET, Update=PUT/PATCH, Delete=DELETE**.

**Q:** What does a 401 mean? A 404? A 500?
**A:** **401** not authenticated, **404** not found, **500** server error. *4xx = your mistake, 5xx = the server's.*

**Q:** What does it mean that REST is stateless?
**A:** Every request carries **everything needed** to answer it — the server remembers nothing between calls, which is what makes it scalable.

**Q:** What are the JSON data types?
**A:** **String, number, boolean, null, array `[]`, object `{}`**.

**Q:** Ansible vs Terraform vs Puppet — which need agents?
**A:** **Ansible and Terraform are agentless**; **Puppet/Chef require an agent** on each node.

**Q:** Declarative vs procedural configuration?
**A:** **Declarative** describes the **desired end state** and the tool computes the change; **procedural** lists the steps to run in order.

**Q:** What is idempotence?
**A:** Applying the same change repeatedly produces the **same result** — running it ten times is as safe as once.

**Q:** How does ML-based monitoring improve on fixed thresholds?
**A:** It **learns a baseline** of normal for that network and flags deviations — catching gradual degradation that never crosses a static limit.

**Q:** Predictive vs generative AI in network operations?
**A:** **Predictive watches and warns** (anomaly detection, failure forecasts); **generative writes and explains** (draft configs, plain-English log analysis).

**Q:** What is Cisco Catalyst Center, and what was it called before?
**A:** Cisco's campus **SDN controller** (intent-based config push, plug-and-play provisioning, assurance) — formerly **DNA Center**.

**Q:** Name three ways a REST API request can authenticate.
**A:** **Basic** (user:pass, Base64), an **API key**, or a **bearer token/OAuth** (authenticate once, send a short-lived token) — all unsafe without HTTPS.

**Q:** What's the operational win of a controller-based network over box-by-box management?
**A:** **One intent, pushed everywhere** — consistent config, no per-device typos, and the controller sees the whole network for assurance. *Per-device CLI doesn't scale.*

**Q:** Underlay vs overlay vs fabric?
**A:** **Underlay** = the physical routed network; **overlay** = virtual tunnels (e.g. VXLAN) built on top; **fabric** = the two working as one system.

**Q:** Two JSON syntax rules people trip on?
**A:** **Keys are always double-quoted strings**, and **no trailing commas**. `{"vlan": 10}` — key quoted, number not.

**Q:** Ansible vs Puppet — push or pull?
**A:** **Ansible pushes** over SSH (agentless, YAML playbooks); **Puppet agents pull** from the server on a schedule.

---

## 15 Troubleshooting

**Q:** Which commands show IP settings on Windows, macOS and Linux?
**A:** **`ipconfig /all`** (Windows), **`ifconfig`** (macOS), **`ip address`** (Linux).

**Q:** What's the trace command on Windows vs everywhere else?
**A:** **`tracert`** on Windows; **`traceroute`** on macOS/Linux/IOS.

**Q:** How does traceroute actually discover the path?
**A:** It sends packets with **increasing TTL** — each hop that hits TTL 0 returns an ICMP "time exceeded," revealing itself.

**Q:** Why does a router decrement TTL?
**A:** **Loop insurance** — a misrouted packet dies instead of circulating forever.

**Q:** In a frame crossing a router, what changes and what stays the same?
**A:** **MAC addresses are rewritten every hop**; **IP addresses stay the same end to end** (unless NAT intervenes).

**Q:** Why does a PC ARP for its gateway rather than the remote destination?
**A:** Only devices **on the same segment** can answer ARP — the remote host isn't there to reply.

**Q:** A port shows "administratively down". What's the fix?
**A:** `no shutdown` on the interface.

**Q:** What symptoms indicate a duplex mismatch?
**A:** Slowness with **late collisions** on the half-duplex side and **FCS/runt errors** on the other.

**Q:** Which command shows what's connected to a Cisco device?
**A:** `show cdp neighbors` (or `show lldp neighbors` for the open standard).

**Q:** First four things to read from `ipconfig /all`?
**A:** **IP address, subnet mask, default gateway, DNS servers** — most faults show up in one of these.

**Q:** Config register 0x2102 vs 0x2142?
**A:** **0x2102** = normal boot; **0x2142** = **ignore startup-config** — the password-recovery setting (needs console access via ROMMON).

**Q:** Before booting a newly copied IOS image, what should you run?
**A:** `verify /md5 flash:image.bin` — confirm the **checksum** against Cisco's published hash before trusting it.

**Q:** Name the three classic troubleshooting approaches through the OSI model.
**A:** **Bottom-up** (cable first), **top-down** (app first), **divide-and-conquer** (start at L3 — ping works? go up; fails? go down).

**Q:** Why source a ping from a specific interface (`ping ... source lo0`)?
**A:** A plain ping only proves the *link* subnets route — sourcing from a LAN/loopback proves the far side has a **return route to that network**, which is what users actually need.

**Q:** Autonegotiation fails on one side. What does the port fall back to?
**A:** **Half duplex** (10 or 100 Mbps sensed) — which is exactly how duplex mismatches are born. Hard-code both ends or neither.

**Q:** Why is `debug` dangerous on a busy production device, and what's the safety rail?
**A:** Debug output can **consume the CPU** and lock you out. Prefer specific debugs, `undebug all` ready — and `terminal monitor` to even *see* it over SSH.
