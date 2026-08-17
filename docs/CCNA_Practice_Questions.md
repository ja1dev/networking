# 📝 CCNA Practice Question Bank
### 140+ Exam-Style Questions with Answers & Full Explanations

> **How to use it:** Try each question BEFORE reading the answer. The explanation tells you *why* the right answer is right AND why the traps are wrong — that's what builds real understanding. Aim to consistently score **85%+** before your exam. Questions are grouped by the 6 official exam domains.

> **Companion to the Study Guide.** Every question here is covered somewhere in the **CCNA Study Guide** — work a chapter there, then the matching domain here. When you miss one, the guide's **Blueprint Coverage Map** appendix tells you exactly which section to re-read. For subnetting specifically, use the **Subnetting Drill Sheet**.

---

# Domain 1 — Network Fundamentals

---

**Q1.** Which device operates primarily at Layer 2 of the OSI model?

A. Router  B. Switch  C. Firewall  D. Load balancer

<details><summary>Answer</summary>

**B. Switch.** A switch forwards frames using MAC addresses, which is Layer 2 (Data Link). A router works at Layer 3 (IP addresses). *Trap:* firewalls and load balancers can work at higher layers.
</details>

---

**Q2.** What is the correct order of TCP's three-way handshake?

A. ACK, SYN, SYN-ACK  B. SYN, ACK, SYN-ACK  C. SYN, SYN-ACK, ACK  D. SYN-ACK, SYN, ACK

<details><summary>Answer</summary>

**C. SYN, SYN-ACK, ACK.** The initiator sends SYN, the receiver replies SYN-ACK, the initiator finishes with ACK. Memorize this order — it's tested a lot.
</details>

---

**Q3.** Which protocol is connectionless and does NOT guarantee delivery?

A. TCP  B. UDP  C. HTTP  D. FTP

<details><summary>Answer</summary>

**B. UDP.** UDP is fast, connectionless, and doesn't confirm delivery — good for voice/video/DNS. TCP is the reliable, connection-oriented one.
</details>

---

**Q4.** What is the data unit at Layer 3 called?

A. Frame  B. Segment  C. Packet  D. Bit

<details><summary>Answer</summary>

**C. Packet.** Layer 4 = segment, **Layer 3 = packet**, Layer 2 = frame, Layer 1 = bits. Memory trick: "Some People Fear Birthdays."
</details>

---

**Q5.** Which port number does HTTPS use?

A. 80  B. 21  C. 443  D. 22

<details><summary>Answer</summary>

**C. 443.** HTTPS = 443 (secure web). HTTP = 80, FTP = 21, SSH = 22.
</details>

---

**Q6.** A host has IP `169.254.10.5`. What most likely happened?

A. It got an address from DHCP  B. It was assigned a public IP  C. It could not reach a DHCP server (APIPA)  D. It is using a loopback

<details><summary>Answer</summary>

**C. APIPA.** The 169.254.x.x range is auto-assigned when a device can't reach a DHCP server. It's a big clue that DHCP is broken or unreachable.
</details>

---

**Q7.** Which cable type connects two switches together (without Auto-MDIX)?

A. Straight-through  B. Crossover  C. Rollover  D. Fiber only

<details><summary>Answer</summary>

**B. Crossover.** Similar devices (switch-switch, PC-PC, router-router) need a **crossover** cable. Different devices use straight-through. Rollover is for console access.
</details>

---

**Q8.** How many bits are in an IPv6 address?

A. 32  B. 48  C. 64  D. 128

<details><summary>Answer</summary>

**D. 128 bits.** IPv4 = 32 bits, MAC = 48 bits, **IPv6 = 128 bits**, written as 8 groups of 4 hex digits.
</details>

---

**Q9.** Which of the following is a private IPv4 address?

A. 8.8.8.8  B. 172.32.0.1  C. 192.168.5.20  D. 200.1.1.1

<details><summary>Answer</summary>

**C. 192.168.5.20.** Private ranges: 10.0.0.0/8, 172.16–31.0.0, 192.168.0.0/16. Note 172.**32** is OUTSIDE the private range (only 16–31), so B is a trap.
</details>

---

**Q10.** What does the Transport layer use to identify which application traffic belongs to?

A. MAC addresses  B. IP addresses  C. Port numbers  D. VLAN tags

<details><summary>Answer</summary>

**C. Port numbers.** Ports (like 80, 443, 22) identify the app/service. IP finds the host; the port finds the app on that host.
</details>

---

**Q11.** Which IPv6 address type replaces the IPv4 broadcast?

A. Anycast  B. Multicast  C. Unicast  D. Loopback

<details><summary>Answer</summary>

**B. Multicast.** IPv6 has **no broadcast** — it uses multicast to reach groups. Classic exam fact.
</details>

---

**Q12.** Convert binary `10101100` to decimal.

A. 172  B. 168  C. 160  D. 174

<details><summary>Answer</summary>

**A. 172.** 128 + 32 + 8 + 4 = 172. (Bits on: 128, 32, 8, 4.)
</details>

---

**Q13.** Which layer of the TCP/IP model maps to OSI Layers 5, 6, and 7?

A. Transport  B. Internet  C. Application  D. Network Access

<details><summary>Answer</summary>

**C. Application.** The TCP/IP Application layer combines OSI Session, Presentation, and Application.
</details>

---

**Q14.** What is the broadcast MAC address?

A. 00:00:00:00:00:00  B. FF:FF:FF:FF:FF:FF  C. 01:00:5E:00:00:01  D. FE80::1

<details><summary>Answer</summary>

**B. FF:FF:FF:FF:FF:FF.** All F's = broadcast (everyone listens). D is an IPv6 link-local, not a MAC.
</details>

---

**Q15.** A fiber run must go 10 km between buildings. Which media is appropriate?

A. Cat6 copper  B. Multimode fiber  C. Single-mode fiber  D. Coaxial

<details><summary>Answer</summary>

**C. Single-mode fiber.** Single-mode (tiny core, laser) goes many kilometers. Multimode is for shorter in-building runs; copper maxes ~100 m.
</details>

---

**Q16.** In a three-tier campus design, at which layer do end devices such as PCs and access points connect?

A. Core  B. Distribution  C. Access  D. Backbone

<details><summary>Answer</summary>

**C. Access.** The access layer is where end devices plug in — it handles VLAN assignment, port security, and PoE. Distribution does routing and policy; core moves traffic fast between distribution blocks.
</details>

---

**Q17.** A single-building company merges its core and distribution functions into one layer. What is this design called?

A. Spine-leaf  B. Collapsed core  C. Full mesh  D. Flat network

<details><summary>Answer</summary>

**B. Collapsed core** (a two-tier design). A dedicated core layer only pays off when there are enough distribution blocks to justify it; in a single site it would be extra cost and management for no benefit.
</details>

---

**Q18.** Why is spine-leaf preferred in modern data centers?

A. It eliminates the need for VLANs
B. It gives predictable, equal latency for east-west (server-to-server) traffic
C. It removes the need for spanning tree in all designs
D. It requires fewer cables than three-tier

<details><summary>Answer</summary>

**B.** Every leaf connects to every spine, so any server is the same distance from any other: leaf → spine → leaf. Data center traffic is mostly **east-west**, and this makes latency predictable regardless of which leaf a server sits on. *Trap:* D is wrong — spine-leaf typically uses **more** cabling.
</details>

---

**Q19.** Which statement correctly compares virtual machines and containers?

A. Containers include a full guest OS; VMs do not
B. VMs share the host OS kernel; containers each run a full OS
C. Containers share the host OS kernel and are smaller and faster to start than VMs
D. They are identical technologies with different names

<details><summary>Answer</summary>

**C.** A VM includes a **complete guest OS** (gigabytes, boots in minutes). A container packages only the app and its dependencies and **shares the host kernel** (megabytes, starts in seconds) — the trade-off being lighter isolation.
</details>

---

**Q20.** What does a VRF provide on a router?

A. Multiple separate routing tables on one physical router
B. Redundancy for the default gateway
C. Encryption for routing updates
D. Faster convergence for OSPF

<details><summary>Answer</summary>

**A.** **VRF (Virtual Routing and Forwarding)** splits one physical router into several virtual routers, each with its **own isolated routing table** — so two tenants can even use overlapping IP ranges. *Memory hook:* **VLANs separate at Layer 2, VRFs separate at Layer 3.**
</details>

---

**Q21.** An access point requires 25 W. Which PoE standard is the minimum that supports it?

A. 802.3af (PoE)  B. 802.3at (PoE+)  C. 802.3bt (PoE++)  D. 802.3ad

<details><summary>Answer</summary>

**B. 802.3at (PoE+)** supplies up to ~30 W. **802.3af** tops out around 15.4 W — not enough. *Trap:* **802.3ad** is link aggregation (EtherChannel), not power.
</details>

---

**Q22.** A technician plugs a laptop into a PoE switch port and worries it will be damaged. What actually happens?

A. The laptop receives power and may be damaged
B. The port shuts down
C. The switch detects no powered-device signature and sends data only
D. The port must be manually configured as non-PoE first

<details><summary>Answer</summary>

**C.** The switch performs **detection** first — it looks for the electrical signature of a powered device before supplying power. No signature, no power. It then **classifies** compliant devices to grant only the power they request.
</details>

---

**Q23.** Several PoE devices on a fully populated switch fail to power on, though their ports show link. What is the most likely cause?

A. Duplex mismatch
B. The switch's total PoE power budget is exhausted
C. STP is blocking the ports
D. The devices need 802.1X

<details><summary>Answer</summary>

**B.** A switch has a **total power budget** shared across all ports — a 370 W budget cannot run 48 ports at 30 W. Later devices are denied power while their data link works fine. Check with `show power inline`.
</details>

---

# Domain 2 — Network Access (Switching, VLANs, Wireless)

---

**Q24.** What does a switch do when it receives a frame with an unknown destination MAC?

A. Drops it  B. Floods it out all ports except the incoming one  C. Sends it to the default gateway  D. Buffers it forever

<details><summary>Answer</summary>

**B. Floods it out all other ports.** This is "unknown unicast flooding." Once the destination replies, the switch learns its port and stops flooding.
</details>

---

**Q25.** Which command puts switch port Fa0/1 into VLAN 10?

A. `vlan 10`  B. `switchport access vlan 10`  C. `switchport trunk vlan 10`  D. `ip vlan 10`

<details><summary>Answer</summary>

**B. `switchport access vlan 10`** (entered under `interface fa0/1`). You'd also set `switchport mode access`.
</details>

---

**Q26.** Which standard is used to tag frames on a trunk link?

A. 802.11  B. 802.1Q  C. 802.3  D. 802.1X

<details><summary>Answer</summary>

**B. 802.1Q.** "Dot1Q" inserts a 4-byte VLAN tag. 802.11 = Wi-Fi, 802.3 = Ethernet, 802.1X = port authentication.
</details>

---

**Q27.** On an 802.1Q trunk, which VLAN's traffic is sent untagged by default?

A. VLAN 0  B. VLAN 1 (native)  C. VLAN 1000  D. All VLANs

<details><summary>Answer</summary>

**B. VLAN 1 (the native VLAN).** Native VLAN traffic crosses the trunk untagged. Both switches must agree on the native VLAN.
</details>

---

**Q28.** What is the purpose of Spanning Tree Protocol?

A. Speed up routing  B. Prevent Layer 2 loops  C. Assign IP addresses  D. Encrypt traffic

<details><summary>Answer</summary>

**B. Prevent Layer 2 loops.** STP blocks redundant paths so broadcasts don't circle forever (broadcast storms), while keeping a backup ready.
</details>

---

**Q29.** In STP, how is the root bridge chosen?

A. Highest IP address  B. Lowest bridge ID (priority + MAC)  C. Fastest port  D. Most connections

<details><summary>Answer</summary>

**B. Lowest bridge ID.** Bridge ID = priority + MAC. Lowest priority wins; if tied, lowest MAC wins.
</details>

---

**Q30.** Which feature lets a switch port skip STP's listening/learning states for end devices?

A. BPDU Guard  B. PortFast  C. EtherChannel  D. Root Guard

<details><summary>Answer</summary>

**B. PortFast.** It moves an access port straight to forwarding. Use only on ports connected to end devices, never switch-to-switch.
</details>

---

**Q31.** What happens by default when a port-security violation occurs?

A. Port logs only  B. Port drops traffic silently  C. Port shuts down (err-disabled)  D. Port reboots

<details><summary>Answer</summary>

**C. Port shuts down.** Default violation mode is **shutdown** (err-disabled). Other modes: protect (silent drop) and restrict (drop + log).
</details>

---

**Q32.** Which LACP mode combination will successfully form an EtherChannel?

A. passive/passive  B. active/passive  C. auto/auto  D. on/active

<details><summary>Answer</summary>

**B. active/passive.** LACP needs at least one side active. passive/passive fails (both wait). on/active mismatches protocols (on = no negotiation).
</details>

---

**Q33.** Which two channels do NOT overlap on the 2.4 GHz band (pick the standard set)?

A. 1, 2, 3  B. 1, 5, 9  C. 1, 6, 11  D. 2, 7, 12

<details><summary>Answer</summary>

**C. 1, 6, 11.** These are the non-overlapping 2.4 GHz channels — using them avoids interference.
</details>

---

**Q34.** Which wireless security standard is the most secure?

A. WEP  B. WPA  C. WPA2  D. WPA3

<details><summary>Answer</summary>

**D. WPA3.** Newest and strongest. WEP is broken, WPA is weak, WPA2 is good, WPA3 is best.
</details>

---

**Q35.** In a lightweight wireless architecture, what protocol do APs use to talk to the WLC?

A. CDP  B. CAPWAP  C. LLDP  D. GRE

<details><summary>Answer</summary>

**B. CAPWAP.** Lightweight APs tunnel to the Wireless LAN Controller using CAPWAP for control and (optionally) data.
</details>

---

**Q36.** Router-on-a-stick uses what to route between VLANs on one physical link?

A. Loopbacks  B. Subinterfaces  C. SVIs  D. Trunk ACLs

<details><summary>Answer</summary>

**B. Subinterfaces.** The router creates one subinterface per VLAN, each with `encapsulation dot1q <vlan>` and an IP that acts as the gateway.
</details>

---

**Q37.** Which command shows which VLAN each access port belongs to?

A. `show mac address-table`  B. `show vlan brief`  C. `show ip route`  D. `show cdp neighbors`

<details><summary>Answer</summary>

**B. `show vlan brief`.** It lists VLANs and their assigned ports. Great first check for VLAN misconfigurations.
</details>

---

**Q38.** What is the default native VLAN, and why change it?

A. VLAN 0; performance  B. VLAN 1; security (avoid VLAN hopping)  C. VLAN 99; redundancy  D. VLAN 4094; naming

<details><summary>Answer</summary>

**B. VLAN 1; for security.** Changing the native VLAN away from the default helps prevent double-tagging VLAN-hopping attacks.
</details>

---

**Q39.** Which feature prevents a newly connected switch from taking over as the STP root bridge?

A. BPDU Guard  B. Root Guard  C. Loop Guard  D. PortFast

<details><summary>Answer</summary>

**B. Root Guard.** If a **superior BPDU** arrives on a guarded port, the port goes to **root-inconsistent** state rather than allowing that switch to win the election. *Trap:* BPDU Guard shuts the port on **any** BPDU (used on PC-facing access ports), not just superior ones.
</details>

---

**Q40.** A blocking port stops receiving BPDUs because of a unidirectional link failure and begins forwarding, creating a loop. Which feature prevents this?

A. Root Guard  B. BPDU Filter  C. Loop Guard  D. PortFast

<details><summary>Answer</summary>

**C. Loop Guard.** A blocking port stays blocking only while it keeps *hearing* BPDUs. If they stop, it would normally assume the loop is gone and start forwarding. Loop Guard treats that silence as suspicious and moves the port to **loop-inconsistent** state instead.
</details>

---

**Q41.** What is the key difference between BPDU Guard and Loop Guard?

A. They are the same feature with different names
B. BPDU Guard reacts to BPDUs arriving; Loop Guard reacts to BPDUs stopping
C. BPDU Guard is for trunks; Loop Guard is for access ports
D. Loop Guard disables spanning tree on the port

<details><summary>Answer</summary>

**B.** *The memory hook:* **BPDU Guard fears noise** (a BPDU where none should appear — on a PC port). **Loop Guard fears silence** (BPDUs disappearing from a port that should still receive them).
</details>

---

**Q42.** What is the default spanning-tree mode on modern Cisco switches, and what is its main advantage?

A. 802.1D STP — lowest CPU usage
B. Rapid PVST+ — fast convergence with a separate instance per VLAN
C. MST — one instance for all VLANs
D. PortFast — instant forwarding everywhere

<details><summary>Answer</summary>

**B. Rapid PVST+.** It combines 802.1w's fast convergence with a **per-VLAN** instance, which lets different switches be root for different VLANs so **both uplinks carry traffic** instead of one sitting idle. The cost is extra CPU.
</details>

---

# Domain 3 — IP Connectivity (Routing & OSPF)

---

**Q43.** In the routing table, what does the letter `O` mean?

A. A static route  B. A connected route  C. An OSPF-learned route  D. An offline route

<details><summary>Answer</summary>

**C. OSPF-learned.** C = connected, S = static, O = OSPF, D = EIGRP, R = RIP, B = BGP.
</details>

---

**Q44.** A router has two routes to the same network: one via OSPF, one static. Which is used?

A. OSPF (AD 110)  B. Static (AD 1)  C. Both load-balance  D. Neither

<details><summary>Answer</summary>

**B. Static (AD 1).** Lower administrative distance wins. Static (1) beats OSPF (110). Connected (0) beats everything.
</details>

---

**Q45.** Which administrative distance does a directly connected route have?

A. 0  B. 1  C. 90  D. 110

<details><summary>Answer</summary>

**A. 0.** Connected = 0 (most trusted). Static = 1, EIGRP = 90, OSPF = 110, RIP = 120.
</details>

---

**Q46.** What does a router do with a packet if no matching route exists and there is no default route?

A. Floods it  B. Sends to gateway of last resort  C. Drops it  D. Buffers it

<details><summary>Answer</summary>

**C. Drops it.** No route + no default = the packet is discarded (often with an ICMP unreachable). A default route (0.0.0.0/0) would catch it.
</details>

---

**Q47.** Which command creates a default route toward next hop 203.0.113.1?

A. `ip route 0.0.0.0 0.0.0.0 203.0.113.1`  B. `ip default 203.0.113.1`  C. `ip route default 203.0.113.1`  D. `default-gateway 203.0.113.1`

<details><summary>Answer</summary>

**A. `ip route 0.0.0.0 0.0.0.0 203.0.113.1`.** 0.0.0.0/0 matches everything not otherwise known. (`ip default-gateway` is only for a switch/host, not routing.)
</details>

---

**Q48.** When two routes to the same destination have different prefix lengths, the router chooses the one that is:

A. Learned first  B. Most specific (longest prefix)  C. From the lowest AD  D. Load-balanced

<details><summary>Answer</summary>

**B. Longest prefix match.** A /24 beats a /16 for a matching destination — the more specific route wins, regardless of AD (AD only breaks ties for the *same* prefix).
</details>

---

**Q49.** What metric does OSPF use to choose the best path?

A. Hop count  B. Bandwidth-based cost  C. Delay  D. Ticks

<details><summary>Answer</summary>

**B. Cost (based on bandwidth).** Cost = reference bandwidth ÷ link bandwidth. Faster links = lower cost = preferred. (RIP uses hop count.)
</details>

---

**Q50.** Two OSPF routers won't become neighbors. Which mismatch could be the cause?

A. Different hostnames  B. Different interface descriptions  C. Different area or subnet  D. Different clock time

<details><summary>Answer</summary>

**C. Different area or subnet.** Neighbors must match area, subnet, hello/dead timers, authentication, and MTU. Hostnames/descriptions don't matter.
</details>

---

**Q51.** In OSPF, what must the backbone area always be?

A. Area 1  B. Area 10  C. Area 0  D. Area 255

<details><summary>Answer</summary>

**C. Area 0.** The backbone is always Area 0; all other areas connect to it.
</details>

---

**Q52.** What is a wildcard mask of `0.0.0.255` equivalent to matching?

A. A single host  B. A whole /24 network  C. Everything  D. A /16 network

<details><summary>Answer</summary>

**B. A whole /24.** Wildcards are the inverse of subnet masks. 0 = must match, 255 = anything. 0.0.0.255 matches all hosts in one /24.
</details>

---

**Q53.** Which command correctly advertises 10.1.1.0/24 into OSPF area 0?

A. `network 10.1.1.0 255.255.255.0 area 0`  B. `network 10.1.1.0 0.0.0.255 area 0`  C. `network 10.1.1.0 area 0`  D. `advertise 10.1.1.0/24`

<details><summary>Answer</summary>

**B. `network 10.1.1.0 0.0.0.255 area 0`.** OSPF uses a **wildcard** mask, not a subnet mask, in the network statement.
</details>

---

**Q54.** How does OSPF pick its Router ID if not set manually?

A. Lowest interface IP  B. Highest loopback, else highest active physical IP  C. The MAC address  D. Randomly

<details><summary>Answer</summary>

**B. Highest loopback, otherwise highest active physical interface IP.** Best practice is to set `router-id` manually for predictability.
</details>

---

**Q55.** A floating static route is created by:

A. Lowering its metric  B. Giving it a higher administrative distance than the primary  C. Adding a wildcard mask  D. Using a /32

<details><summary>Answer</summary>

**B. Higher AD.** A backup ("floating") static route has a higher AD so it's only installed if the primary route disappears.
</details>

---

**Q56.** Which routing protocol type builds a full map of the network and runs SPF?

A. Distance vector  B. Link state  C. Path vector  D. Static

<details><summary>Answer</summary>

**B. Link state.** OSPF (link state) builds an LSDB and runs Dijkstra/SPF. RIP is distance vector; BGP is path vector.
</details>

---

**Q57.** What is the OSPF cost of a 100 Mbps link using the default reference bandwidth?

A. 1  B. 10  C. 19  D. 100

<details><summary>Answer</summary>

**A. 1.** Default reference is 100 Mbps, so a 100 Mbps link = 100/100 = **1**. (10 Mbps = 10.) Note: STP cost for 100 Mbps is 19 — don't confuse them!
</details>

---

**Q58.** A subnet's default gateway router fails. A second, healthy router exists on the same subnet with a different IP. Why do the PCs still lose internet access?

A. The second router needs OSPF configured
B. Hosts use a single statically-configured gateway address and cannot switch on their own
C. The switch blocks the second router's port
D. ARP automatically finds the new router within 30 seconds

<details><summary>Answer</summary>

**B.** A host's default gateway is **one fixed setting** (from DHCP or typed in). Hosts have no mechanism to discover that their gateway died and find another. *This is precisely the problem FHRPs solve.* *Trap:* A is irrelevant — routing protocols help routers, not hosts; D is wrong because ARP resolves an address you already decided to use.
</details>

---

**Q59.** Which FHRP is a Cisco-proprietary protocol that uses Active and Standby roles?

A. VRRP  B. GLBP  C. HSRP  D. LACP

<details><summary>Answer</summary>

**C. HSRP.** Cisco proprietary, roles are **Active/Standby**. *Trap:* **VRRP** is the open standard (Master/Backup); **GLBP** is Cisco but adds load balancing (AVG/AVF); **LACP** is EtherChannel, not an FHRP.
</details>

---

**Q60.** Besides a virtual IP address, what else do routers in an HSRP group share — and why does it matter?

A. A virtual MAC address, so hosts' ARP caches stay valid after failover
B. A virtual serial number, for licensing
C. The same physical IP, to avoid conflicts
D. A shared routing table

<details><summary>Answer</summary>

**A.** Hosts address frames to the **MAC** they cached from ARP. If only the IP moved, hosts would keep sending to the dead router's MAC until their ARP cache expired. Moving the **virtual MAC** too makes failover invisible. *This is a very common exam question.*
</details>

---

**Q61.** R1 (priority 110) is the HSRP active router. It reboots and R2 takes over. R1 returns to service but stays in Standby. Why?

A. R1's priority reset to 100
B. `preempt` is not configured on R1
C. HSRP requires a manual `clear` command
D. R2 now has higher priority

<details><summary>Answer</summary>

**B.** Without **`standby <grp> preempt`**, a recovered router will **not** reclaim the active role even with a better priority — HSRP won't disturb a working active router unless told to. Configure `preempt` on the router with the higher priority.
</details>

---

**Q62.** Which two commands configure a router as the preferred HSRP active router for group 1 using virtual IP 10.1.1.1? (Choose two.)

A. `standby 1 ip 10.1.1.1`
B. `standby 1 priority 50`
C. `standby 1 priority 120`
D. `hsrp 1 address 10.1.1.1`

<details><summary>Answer</summary>

**A and C.** `standby 1 ip 10.1.1.1` sets the virtual IP; priority **120** beats the default of 100. *Trap:* B (50) would make it *less* likely to be active; D is not valid IOS syntax.
</details>

---

**Q63.** Why does OSPF elect a DR and BDR on a broadcast segment?

A. To encrypt LSA exchanges
B. To reduce the number of adjacencies and duplicate flooding on a shared segment
C. To choose the best path to each network
D. Because OSPF cannot run on Ethernet without one

<details><summary>Answer</summary>

**B.** Without a DR, *n* routers would form **n(n-1)/2** adjacencies — 10 routers means 45. Every router instead becomes fully adjacent only to the **DR and BDR**, which act as a central point for flooding.
</details>

---

**Q64.** Which is used to elect the OSPF DR, in order?

A. Lowest priority, then lowest router ID
B. Highest priority, then highest router ID
C. Highest IP address only
D. Lowest cost to the root

<details><summary>Answer</summary>

**B.** **Highest OSPF interface priority** wins (default 1); ties are broken by **highest Router ID**. A priority of **0** makes a router permanently ineligible.
</details>

---

**Q65.** A new router with priority 255 is added to a segment that already has a DR. What happens?

A. It immediately becomes the DR
B. It becomes the BDR
C. It becomes a DROTHER — the DR election is not preemptive
D. The OSPF process restarts on all routers

<details><summary>Answer</summary>

**C.** The DR election is **not preemptive**. The existing DR keeps the role until it fails or the OSPF process is cleared. *Compare with HSRP, where `preempt` explicitly allows reclaiming the active role — a classic exam contrast.*
</details>

---

**Q66.** `show ip ospf neighbor` shows two neighbors in `2WAY/DROTHER`. What should you do?

A. Nothing — this is normal between DROTHERs
B. Reset the OSPF process
C. Fix the mismatched hello timers
D. Change the network type to point-to-point

<details><summary>Answer</summary>

**A. Nothing.** Two DROTHERs deliberately stop at **2WAY** and never reach FULL with each other — they only need full adjacency with the **DR and BDR**. Panicking about 2WAY between DROTHERs is a classic beginner mistake.
</details>

---

**Q67.** Which command tells OSPF to skip the DR/BDR election on a link between exactly two routers?

A. `ip ospf priority 0`
B. `ip ospf network point-to-point`
C. `no ip ospf dr`
D. `ip ospf broadcast disable`

<details><summary>Answer</summary>

**B.** With only two routers there is just one possible adjacency, so an election adds delay for nothing. *Trap:* `ip ospf priority 0` only makes **this** router ineligible — the election still happens.
</details>

---

# Domain 4 — IP Services (DHCP, DNS, NAT, NTP, SNMP)

---

**Q68.** What is the correct order of the DHCP process?

A. Offer, Discover, Request, Ack  B. Discover, Offer, Request, Ack  C. Request, Offer, Discover, Ack  D. Discover, Request, Offer, Ack

<details><summary>Answer</summary>

**B. Discover, Offer, Request, Ack (DORA).** Client discovers, server offers, client requests, server acknowledges.
</details>

---

**Q69.** Which service translates domain names into IP addresses?

A. DHCP  B. DNS  C. NAT  D. NTP

<details><summary>Answer</summary>

**B. DNS.** DNS is the internet's phone book — name to IP. DHCP hands out addresses, NAT translates addresses, NTP syncs time.
</details>

---

**Q70.** Your home router lets 20 devices share one public IP. What technology is this?

A. Static NAT  B. Dynamic NAT  C. PAT (NAT overload)  D. Proxy ARP

<details><summary>Answer</summary>

**C. PAT / NAT overload.** Many private hosts share ONE public IP, distinguished by port numbers. This is what home routers do.
</details>

---

**Q71.** DHCP clients are on a different subnet than the DHCP server. What must you configure on the router?

A. `ip default-gateway`  B. `ip helper-address <server>`  C. `ip nat inside`  D. `ip route`

<details><summary>Answer</summary>

**B. `ip helper-address`.** It relays the DHCP broadcast to the server across subnets (since routers don't forward broadcasts).
</details>

---

**Q72.** Which port does DNS primarily use?

A. 53  B. 67  C. 80  D. 123

<details><summary>Answer</summary>

**A. 53.** DNS = 53 (UDP mostly, TCP for big transfers). 67/68 = DHCP, 80 = HTTP, 123 = NTP.
</details>

---

**Q73.** Which DNS record maps a name to an IPv6 address?

A. A  B. AAAA  C. CNAME  D. MX

<details><summary>Answer</summary>

**B. AAAA.** A = IPv4, **AAAA = IPv6**, CNAME = alias, MX = mail server.
</details>

---

**Q74.** Why is NTP important on network devices?

A. Faster routing  B. Accurate timestamps for logs and certificates  C. More bandwidth  D. Encryption

<details><summary>Answer</summary>

**B. Accurate time.** Logs, security certs, and troubleshooting all depend on synchronized clocks. NTP keeps them aligned.
</details>

---

**Q75.** Which SNMP version adds encryption and authentication?

A. SNMPv1  B. SNMPv2c  C. SNMPv3  D. SNMPv2

<details><summary>Answer</summary>

**C. SNMPv3.** It adds authentication and encryption. v1 and v2c send community strings in clear text — avoid for security.
</details>

---

**Q76.** In NAT terminology, the private address of a host BEFORE translation is the:

A. Inside local  B. Inside global  C. Outside local  D. Outside global

<details><summary>Answer</summary>

**A. Inside local.** Inside local = private (before), inside global = public (after). Outside terms refer to the remote host.
</details>

---

**Q77.** A syslog message at severity level 0 means:

A. Debugging  B. Informational  C. Emergency (system unusable)  D. Warning

<details><summary>Answer</summary>

**C. Emergency.** Level 0 = Emergency (most severe). Level 7 = Debug (least). Remember: lower number = more urgent.
</details>

---

**Q78.** Which NAT type should be used so an internet host can initiate a connection to an internal web server?

A. PAT (overload)  B. Dynamic NAT  C. Static NAT  D. VRF

<details><summary>Answer</summary>

**C. Static NAT.** It creates a **permanent, bidirectional** one-to-one mapping. PAT and dynamic NAT build entries only when an **inside** host starts a conversation, so an inbound connection has no entry to match.
</details>

---

**Q79.** Which command shows the current active NAT translations?

A. `show ip nat statistics`
B. `show ip nat translations`
C. `show nat pool`
D. `show ip route nat`

<details><summary>Answer</summary>

**B. `show ip nat translations`** lists the live table (inside local/global, outside local/global). `show ip nat statistics` shows hit/miss counters and which ACL and pool are in use.
</details>

---

**Q80.** In dynamic NAT without `overload`, what happens when the address pool is exhausted?

A. Additional hosts share the last address by port
B. Additional hosts fail to be translated and cannot reach outside
C. The router creates new public addresses automatically
D. The oldest translation is dropped immediately

<details><summary>Answer</summary>

**B.** Without `overload`, mappings are strictly one-to-one, so when the pool is empty further hosts simply fail. *This is exactly why PAT (`overload`) is far more common.*
</details>

---

**Q81.** Which QoS marking is recommended for voice traffic?

A. CS3  B. AF41  C. EF (DSCP 46)  D. BE (DSCP 0)

<details><summary>Answer</summary>

**C. EF — Expedited Forwarding, DSCP 46.** *Trap:* **CS3** is call **signaling** (setting up the call), **AF41** is interactive video, **BE** is default best-effort.
</details>

---

**Q82.** What is the difference between policing and shaping?

A. Policing buffers excess traffic; shaping drops it
B. Policing drops (or re-marks) excess traffic; shaping buffers it to send later
C. Both drop excess traffic identically
D. Shaping only applies to inbound traffic

<details><summary>Answer</summary>

**B.** *Policing throws the excess away; shaping makes it wait.* Shaping adds delay and needs buffers but is gentler; policing adds no delay but loses data. Policing is typically inbound, shaping outbound.
</details>

---

**Q83.** Why is jitter a separate concern from delay for voice traffic?

A. Jitter only affects video
B. Voice must be played back at a steady rate, so *variation* in delay causes choppy audio
C. Jitter is another word for packet loss
D. Jitter only matters on wireless links

<details><summary>Answer</summary>

**B.** Jitter is the **variation** in delay. Audio played back at an uneven rate stutters even when the *average* delay is fine — *a steady 100 ms beats an erratic 40 ms.* Target is under **30 ms** of jitter for voice.
</details>

---

**Q84.** Why should a switch not trust QoS markings from a user PC?

A. PCs cannot set DSCP values
B. Any user could mark their own traffic EF and jump every queue
C. Marking is only valid at Layer 2
D. It would exhaust the switch's power budget

<details><summary>Answer</summary>

**B.** This is the **trust boundary** concept. Markings from a corporate IP phone are trusted; markings from an arbitrary PC are not, because a user could self-promote their game or download traffic to the highest-priority queue.
</details>

---

# Domain 5 — Security Fundamentals

---

**Q85.** Which part of the CIA triad ensures data isn't secretly altered?

A. Confidentiality  B. Integrity  C. Availability  D. Authentication

<details><summary>Answer</summary>

**B. Integrity.** Confidentiality = secrecy, **Integrity = data stays correct/unaltered**, Availability = it's up when needed.
</details>

---

**Q86.** Which attack fills a switch's MAC table to force flooding?

A. VLAN hopping  B. MAC flooding  C. DHCP starvation  D. ARP spoofing

<details><summary>Answer</summary>

**B. MAC flooding.** It overflows the CAM table so the switch floods frames (attacker can sniff). Defense: **port security**.
</details>

---

**Q87.** Which feature stops a rogue DHCP server on an untrusted port?

A. BPDU Guard  B. DHCP snooping  C. Port-security  D. DAI

<details><summary>Answer</summary>

**B. DHCP snooping.** It marks trusted ports (toward the real server) and blocks DHCP offers from untrusted ports.
</details>

---

**Q88.** Which protocol should replace Telnet for remote device management?

A. FTP  B. HTTP  C. SSH  D. SNMPv1

<details><summary>Answer</summary>

**C. SSH.** SSH (port 22) encrypts the session. Telnet (23) is clear text — never use it in production.
</details>

---

**Q89.** In AAA, what does the second "A" (Authorization) determine?

A. Who you are  B. What you're allowed to do  C. What you did  D. Where you are

<details><summary>Answer</summary>

**B. What you're allowed to do.** Authentication = who you are, Authorization = what you can do, Accounting = what you did.
</details>

---

**Q90.** Which AAA protocol encrypts the entire packet and uses TCP?

A. RADIUS  B. TACACS+  C. Kerberos  D. LDAP

<details><summary>Answer</summary>

**B. TACACS+.** Cisco's TACACS+ uses TCP and encrypts the whole packet — great for device admin. RADIUS uses UDP and encrypts only the password.
</details>

---

**Q91.** In 802.1X, what role does the switch play?

A. Supplicant  B. Authenticator  C. Authentication server  D. Client

<details><summary>Answer</summary>

**B. Authenticator.** The switch/AP is the "bouncer." The device is the supplicant; RADIUS is the authentication server.
</details>

---

**Q92.** Which command encrypts plain-text passwords in the running config?

A. `enable secret`  B. `service password-encryption`  C. `crypto key generate rsa`  D. `password-encrypt on`

<details><summary>Answer</summary>

**B. `service password-encryption`.** It scrambles clear-text passwords (like console/line) in the config. `enable secret` is separately hashed already.
</details>

---

**Q93.** Which defense protects against ARP spoofing (man-in-the-middle)?

A. Port-security  B. Dynamic ARP Inspection (DAI)  C. BPDU Guard  D. STP

<details><summary>Answer</summary>

**B. Dynamic ARP Inspection.** DAI validates ARP packets against the DHCP snooping database, blocking forged ARP replies.
</details>

---

**Q94.** A site-to-site VPN between two offices typically uses:

A. SSL only  B. IPsec  C. Telnet  D. GRE only

<details><summary>Answer</summary>

**B. IPsec.** Site-to-site VPNs use IPsec to encrypt traffic between office routers across the public internet.
</details>

---

**Q95.** Which combination is true multi-factor authentication?

A. A password and a security question
B. A password and a PIN
C. A password and a one-time code from a phone app
D. Two different passwords

<details><summary>Answer</summary>

**C.** MFA requires **different factor types**. A password (something you *know*) plus a phone code (something you *have*) qualifies. *Trap:* A, B, and D are all "something you know" twice — a single phishing page harvests both.
</details>

---

# Domain 5b — Access Control Lists (ACLs)

---

**Q96.** What is at the end of every ACL, even if not typed?

A. permit any  B. an implicit deny all  C. a log entry  D. nothing

<details><summary>Answer</summary>

**B. Implicit deny all.** Anything not explicitly permitted is denied. Forgetting a `permit` can block everything.
</details>

---

**Q97.** A standard ACL filters based on what?

A. Source and destination IP  B. Source IP only  C. Port numbers  D. MAC addresses

<details><summary>Answer</summary>

**B. Source IP only.** Standard ACLs (1–99) match source only. Extended ACLs (100–199) match source, destination, protocol, and port.
</details>

---

**Q98.** Where should a standard ACL be placed?

A. Close to the source  B. Close to the destination  C. On every interface  D. On the trunk

<details><summary>Answer</summary>

**B. Close to the destination.** Because it only sees source IP, placing it far from the destination could block traffic you meant to allow. (Extended ACLs go close to the source.)
</details>

---

**Q99.** In ACL processing, which rule wins?

A. The last match  B. The first match  C. The most specific  D. The lowest number

<details><summary>Answer</summary>

**B. The first match.** ACLs are read top-to-bottom; the first matching line is applied and the rest are skipped. Order matters!
</details>

---

**Q100.** Which statement permits only host 192.168.1.10?

A. `permit 192.168.1.10 0.0.0.255`  B. `permit host 192.168.1.10`  C. `permit any`  D. `permit 192.168.1.0 0.0.0.0`

<details><summary>Answer</summary>

**B. `permit host 192.168.1.10`** (same as `permit 192.168.1.10 0.0.0.0`). Wildcard 0.0.0.0 means an exact match on that one host.
</details>

---

# Domain 6 — Automation & Programmability

---

**Q101.** In SDN, which plane makes forwarding decisions?

A. Data plane  B. Control plane  C. Management plane  D. Physical plane

<details><summary>Answer</summary>

**B. Control plane.** The control plane is the "brain" (decides paths); the data plane is the "muscle" (forwards packets). SDN centralizes the control plane.
</details>

---

**Q102.** A northbound API on a controller communicates with:

A. Switches  B. Routers  C. Applications/scripts  D. The data plane

<details><summary>Answer</summary>

**C. Applications/scripts (upward).** Northbound = to apps/humans (REST). Southbound = down to devices (NETCONF/OpenFlow).
</details>

---

**Q103.** Which HTTP method is used to RETRIEVE data from a REST API?

A. POST  B. GET  C. PUT  D. DELETE

<details><summary>Answer</summary>

**B. GET.** GET reads, POST creates, PUT updates/replaces, DELETE removes.
</details>

---

**Q104.** Which data format uses curly braces and key/value pairs and is most common in REST APIs?

A. XML  B. YAML  C. JSON  D. CSV

<details><summary>Answer</summary>

**C. JSON.** JSON uses { } with "key": value. YAML uses indentation; XML uses tags.
</details>

---

**Q105.** Which automation tool is agentless and uses YAML playbooks?

A. Puppet  B. Chef  C. Ansible  D. SaltStack

<details><summary>Answer</summary>

**C. Ansible.** Agentless (nothing installed on devices), uses easy YAML playbooks. Puppet and Chef use agents.
</details>

---

**Q106.** What is the main benefit of network automation?

A. More cables  B. Consistent, fast, error-free configuration at scale  C. Slower changes  D. Replacing all routers

<details><summary>Answer</summary>

**B. Consistent, fast, error-free configuration at scale.** Automation removes repetitive manual typos and enforces one consistent config across many devices.
</details>

---

**Q107.** Cisco DNA Center is an example of:

A. A router  B. An SDN controller  C. A firewall  D. A switch OS

<details><summary>Answer</summary>

**B. An SDN controller.** DNA Center centrally manages, automates, and monitors the network (intent-based networking).
</details>

---

**Q108.** How does machine learning improve on fixed-threshold monitoring?

A. It removes the need for network telemetry
B. It learns a baseline of normal behavior and flags deviations, catching gradual degradation
C. It guarantees zero false positives
D. It replaces the need for network engineers

<details><summary>Answer</summary>

**B.** Fixed thresholds fail in both directions — alerting on harmless spikes while missing a link that slowly degrades from 5 ms to 40 ms without ever crossing a limit. ML learns what normal looks like *for this network*. *Trap:* C and D overstate it — ML gives probabilities, not certainties, and a human still owns the decision.
</details>

---

**Q109.** What does CRUD map to in a REST API?

A. Connect, Read, Update, Disconnect
B. Create=POST, Read=GET, Update=PUT/PATCH, Delete=DELETE
C. Create=GET, Read=POST, Update=DELETE, Delete=PUT
D. Copy, Restore, Undo, Deploy

<details><summary>Answer</summary>

**B.** CRUD is the four things you can do to data, mapped onto HTTP verbs that already existed — which is why REST APIs work with existing web infrastructure everywhere.
</details>

---

**Q110.** A REST API call returns **401**. What does that indicate?

A. The server crashed
B. The resource was not found
C. Authentication failed — a client-side problem
D. The request succeeded

<details><summary>Answer</summary>

**C.** **401 = not authenticated.** *The shortcut worth memorizing:* **4xx means you sent something wrong; 5xx means the server broke.** (404 = not found, 403 = authenticated but not allowed, 500 = server error.)
</details>

---

**Q111.** Which describes a declarative tool such as Terraform, compared with a procedural playbook?

A. You describe the desired end state and the tool computes what to change
B. You list each step in order and the tool executes them exactly
C. It requires an agent on every managed device
D. It can only manage cloud resources

<details><summary>Answer</summary>

**A.** *You describe the destination, not the driving directions.* The tool compares desired state to actual state and changes only the difference — so running it repeatedly is safe, a property called **idempotence**. *Trap:* C is wrong — Terraform and Ansible are both **agentless**.
</details>

---

# Domain 7 — Configuration & Troubleshooting Scenarios

---

**Q112.** After configuring an interface, `show ip interface brief` shows "administratively down." What fixes it?

A. `no shutdown`  B. `ip address`  C. Reboot  D. `enable`

<details><summary>Answer</summary>

**A. `no shutdown`.** "Administratively down" means the port is manually disabled. `no shutdown` on the interface enables it.
</details>

---

**Q113.** You can ping 8.8.8.8 but not google.com. What's broken?

A. Routing  B. DNS  C. NAT  D. The cable

<details><summary>Answer</summary>

**B. DNS.** IP connectivity works (ping by IP succeeds), but name resolution fails — a DNS server problem.
</details>

---

**Q114.** Two switches won't form a trunk. Which is a likely cause?

A. Different hostnames  B. Native VLAN or mode mismatch  C. Different IOS versions  D. Different port numbers

<details><summary>Answer</summary>

**B. Native VLAN / mode mismatch.** Mismatched native VLANs or trunk modes (e.g., access vs trunk) stop trunking and can raise errors.
</details>

---

**Q115.** A PC gets 169.254.x.x. What should you check first?

A. DNS server  B. DHCP reachability (server/relay/VLAN)  C. The default route  D. STP

<details><summary>Answer</summary>

**B. DHCP reachability.** APIPA means the client couldn't reach a DHCP server — check the server, the `ip helper-address`, and the VLAN/port.
</details>

---

**Q116.** A link is slow with many errors. One side is full-duplex, the other half. This is a:

A. Speed mismatch  B. Duplex mismatch  C. VLAN mismatch  D. MTU mismatch

<details><summary>Answer</summary>

**B. Duplex mismatch.** Mismatched duplex causes collisions/late collisions and slowness. Set both ends the same (or both to auto).
</details>

---

**Q117.** Which command shows the path packets take and where they stop?

A. `ping`  B. `traceroute`  C. `show ip route`  D. `show cdp neighbors`

<details><summary>Answer</summary>

**B. `traceroute`.** It reveals each hop along the path, helping you find where connectivity breaks.
</details>

---

**Q118.** A port-security-enabled port is err-disabled after a violation. How do you recover it?

A. `no shutdown` only  B. `shutdown` then `no shutdown`  C. Reload  D. Delete the VLAN

<details><summary>Answer</summary>

**B. `shutdown` then `no shutdown`.** You must bounce the interface (and clear the cause) to bring an err-disabled port back.
</details>

---

**Q119.** Which command shows OSPF neighbors and their states?

A. `show ip ospf neighbor`  B. `show ip route`  C. `show running-config`  D. `show ip protocols`

<details><summary>Answer</summary>

**A. `show ip ospf neighbor`.** It lists neighbors and states (e.g., FULL). Great for diagnosing why routers aren't exchanging routes.
</details>

---

**Q120.** A host's gateway is 192.168.1.65 /26, and the host is 192.168.1.130 /26. Why no internet?

A. Wrong DNS  B. Host and gateway are in different subnets  C. Bad cable  D. STP blocking

<details><summary>Answer</summary>

**B. Different subnets.** .65 is in subnet .64–.127; .130 is in subnet .128–.191. The host can't use a gateway outside its own subnet.
</details>

---

**Q121.** Which command saves the running configuration so it survives a reboot?

A. `write erase`  B. `copy running-config startup-config`  C. `reload`  D. `show startup-config`

<details><summary>Answer</summary>

**B. `copy running-config startup-config`** (or `write memory`). Running-config lives in RAM and is lost on reboot unless saved.
</details>

---

**Q122.** `show cdp neighbors detail` is most useful for:

A. Seeing routing tables  B. Discovering a neighbor's IP and platform  C. Checking VLANs  D. Viewing ACLs

<details><summary>Answer</summary>

**B. Neighbor IP/platform.** CDP reveals directly connected Cisco device details (name, port, model, IP) — handy for mapping.
</details>

---

**Q123.** A switch's MAC address table is empty for a device that's clearly connected and powered. What's a likely reason?

A. The device hasn't sent any frames yet  B. STP is off  C. Wrong IOS  D. NAT is disabled

<details><summary>Answer</summary>

**A. It hasn't sent frames yet.** Switches learn MACs from **source** addresses of incoming frames. A silent device won't be learned until it transmits.
</details>

---

**Q124.** Which show command quickly confirms an interface is "up/up" with its IP?

A. `show vlan brief`  B. `show ip interface brief`  C. `show mac address-table`  D. `show version`

<details><summary>Answer</summary>

**B. `show ip interface brief`.** It lists interfaces, IPs, and status/protocol (up/up). Fast Layer 1/2 sanity check.
</details>

---

**Q125.** A user's PC shows IP address 169.254.12.7. What does this indicate?

A. A valid public address
B. The PC failed to reach a DHCP server and self-assigned an APIPA address
C. The default gateway is misconfigured
D. The subnet mask is wrong

<details><summary>Answer</summary>

**B.** **169.254.x.x is APIPA** — a self-assigned address used when **DHCP got no answer**. It's a symptom: check the DHCP server, the VLAN/cabling, or a missing `ip helper-address` relay. *Stop troubleshooting the PC and go find out why DHCP is silent.*
</details>

---

**Q126.** On a Windows PC, which command displays the IP address, subnet mask, default gateway, and DNS servers in full detail?

A. `ifconfig`  B. `ip address`  C. `ipconfig /all`  D. `netstat -rn`

<details><summary>Answer</summary>

**C. `ipconfig /all`.** *Know all three platforms:* Windows uses **`ipconfig`**, macOS uses **`ifconfig`**, modern Linux uses **`ip address`**. Also remember the trace command differs: **`tracert`** on Windows, **`traceroute`** everywhere else.
</details>

---

**Q127.** A PC can `ping 8.8.8.8` successfully but cannot `ping google.com`. What is the most likely cause?

A. The default gateway is down
B. The subnet mask is wrong
C. A DNS problem
D. The NIC is disabled

<details><summary>Answer</summary>

**C. DNS.** Reaching an **IP** proves routing and the gateway work; failing on a **name** isolates the problem to name resolution. *That exact pairing is the classic signature of a DNS issue* and a favorite exam scenario.
</details>

---

# Domain 8 — More Fundamentals & Mixed Review

---

**Q128.** How many usable hosts are in a /27 subnet?

A. 32  B. 30  C. 62  D. 14

<details><summary>Answer</summary>

**B. 30.** Host bits = 5, 2^5 − 2 = 30.
</details>

---

**Q129.** Which address is the broadcast for 192.168.1.0/26's second subnet?

A. 192.168.1.63  B. 192.168.1.127  C. 192.168.1.128  D. 192.168.1.191

<details><summary>Answer</summary>

**B. 192.168.1.127.** Block size 64: subnets .0, .64, .128, .192. Second subnet = .64–.127, so broadcast = **.127**.
</details>

---

**Q130.** Which IPv6 address is a link-local address?

A. 2001:db8::1  B. FE80::1  C. ::1  D. FF02::1

<details><summary>Answer</summary>

**B. FE80::1.** Link-local addresses start with FE80::/10. ::1 is loopback; FF02:: is multicast; 2001:: is global unicast.
</details>

---

**Q131.** What does `::` mean in an IPv6 address?

A. End of address  B. One or more groups of all zeros (used once)  C. A separator only  D. A loopback

<details><summary>Answer</summary>

**B. A run of all-zero groups, collapsed once.** You may use `::` only a single time per address to avoid ambiguity.
</details>

---

**Q132.** Which protocol automatically lets an IPv6 host build its own address from the router's prefix?

A. DHCPv4  B. SLAAC  C. ARP  D. NAT

<details><summary>Answer</summary>

**B. SLAAC.** Stateless Address Autoconfiguration lets a host form its own IPv6 address using the advertised prefix — no DHCP needed.
</details>

---

**Q133.** Which of these is a Layer 1 problem?

A. Wrong VLAN  B. Unplugged/broken cable  C. Missing default route  D. ACL blocking

<details><summary>Answer</summary>

**B. Broken cable.** Physical media issues (cables, connectors, no link light) are Layer 1. VLANs are L2, routing/ACLs are L3+.
</details>

---

**Q134.** What is the purpose of a default gateway on a host?

A. Resolve names  B. Reach devices on other networks  C. Assign IPs  D. Encrypt traffic

<details><summary>Answer</summary>

**B. Reach other networks.** The gateway (router interface) forwards traffic destined for outside the local subnet.
</details>

---

**Q135.** Which command tests basic connectivity to an IP?

A. `ping`  B. `show run`  C. `configure terminal`  D. `copy`

<details><summary>Answer</summary>

**A. `ping`.** It sends ICMP echo requests. `!!!!!` = success, `.....` = no reply.
</details>

---

**Q136.** A trunk carries VLANs 10 and 20, but VLAN 20 traffic isn't passing while VLAN 10 works. What's a likely cause?

A. Wrong hostname  B. VLAN 20 not allowed on the trunk  C. Duplex mismatch  D. Wrong DNS

<details><summary>Answer</summary>

**B. VLAN 20 not in the allowed list.** Check `switchport trunk allowed vlan` — VLAN 20 may be pruned/omitted. Also confirm VLAN 20 exists on both switches.
</details>

---

**Q137.** Which two are valid reasons to use VLANs? (Choose the best single answer.)

A. Faster CPUs  B. Segment broadcast domains and improve security  C. Replace routers  D. Increase cable length

<details><summary>Answer</summary>

**B. Segment broadcast domains and improve security.** VLANs shrink broadcast domains and isolate groups (e.g., students vs admin). Routing between them still needs a router/L3 switch.
</details>

---

**Q138.** Which is TRUE about a /30 subnet?

A. It has 4 usable hosts  B. It has 2 usable hosts, ideal for router links  C. It's used for large LANs  D. It has no broadcast

<details><summary>Answer</summary>

**B. 2 usable hosts, ideal for point-to-point router links.** /30 = 4 addresses total, minus network and broadcast = 2 usable.
</details>

---

**Q139.** In the frame, which field detects transmission errors?

A. Preamble  B. Source MAC  C. FCS (Frame Check Sequence)  D. Type

<details><summary>Answer</summary>

**C. FCS.** The Frame Check Sequence at the end validates the frame's integrity; a bad FCS means the frame is discarded.
</details>

---

**Q140.** Which command sets a device to only allow SSH (not Telnet) for remote logins?

A. `transport input ssh`  B. `transport input all`  C. `no ip telnet`  D. `login local`

<details><summary>Answer</summary>

**A. `transport input ssh`** (under `line vty`). It restricts remote access to SSH only, blocking insecure Telnet.
</details>

---

**Q141.** What best describes "longest prefix match"?

A. Trusting the lowest AD  B. Choosing the most specific matching route  C. Load balancing  D. Picking the oldest route

<details><summary>Answer</summary>

**B. Most specific matching route.** Among matching routes, the one with the longest prefix (e.g., /24 over /16) is used to forward the packet.
</details>

---

**Q142.** You need 6 subnets from a /24, each with room for ~25 hosts. Which mask fits BOTH needs?

A. /26  B. /27  C. /28  D. /25

<details><summary>Answer</summary>

**B. /27.** /27 gives 8 subnets (≥6) and 30 hosts each (≥25). /26 gives only 4 subnets (too few); /28 gives 14 hosts (too few).
</details>

---

## 🎯 How to Use These Results

- **Score yourself by domain.** If you miss several in one domain (say OSPF or ACLs), go back to that chapter in the main guide and re-drill.
- **Re-take after a few days.** Spacing your practice helps memory stick.
- **Target 85%+ consistently** before booking the exam.
- **Pair with labs.** Reading answers isn't enough — configure these things in Packet Tracer to make them permanent.

Good luck — you're building real skills now! 🚀

*— End of Practice Question Bank —*