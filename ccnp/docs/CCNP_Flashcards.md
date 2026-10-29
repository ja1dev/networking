# 🎴 CCNP Enterprise Flashcard Deck

> **What this is:** the recall-drill companion to the CCNP Study Guide, covering
> **ENCOR 350-401 v1.2** and **ENARSI 300-410 v1.1**. Every card is **atomic** — one
> fact, one answer — because that's what spaced repetition needs. The exam-style
> questions in the guide test reasoning; these build the instant recall of numbers,
> orders and commands that stops you burning clock time on the real thing.

> **How to use it:** every card's fact is explained in full in the **Study Guide** — when a card keeps failing, that's your signal to go re-read the section rather than drill harder. Decks follow the exam blueprints, ENCOR first (decks 01–11), then ENARSI (decks 12–18), so you can drill exactly what you just read. Do them **daily** — 15 minutes beats an hour on Sunday.

> **Format note:** this file is the source. Each card is a `**Q:**` / `**A:**` pair;
> `##` headings become decks. Every question must be unique.

---

## 01 Architecture & High Availability

**Q:** In a three-tier campus, what does each layer do?
**A:** **Access** connects endpoints, **distribution** aggregates access switches and applies routing and policy, **core** is the fast backbone between distribution blocks.

**Q:** When does a two-tier (collapsed core) design make sense?
**A:** When the site is small enough that a separate core adds cost without benefit, so core and distribution are merged into one layer.

**Q:** In a spine-leaf fabric, how many hops separate any two leaf-attached servers?
**A:** Always **two** (leaf → spine → leaf), which gives predictable latency for east-west traffic.

**Q:** In spine-leaf, what is never connected to what?
**A:** Leaves never connect to other leaves, and spines never connect to other spines. Every leaf connects to every spine.

**Q:** What is the "routed access" design, and what does it remove?
**A:** Layer 3 runs all the way to the access switch, so the access-distribution uplinks are routed. It removes STP blocking on uplinks and the need for an FHRP.

**Q:** What does RPR (Route Processor Redundancy) leave the standby supervisor doing?
**A:** Only **partially booted**, so a switchover takes minutes, line cards reset and traffic stops.

**Q:** What does SSO (Stateful Switchover) keep synchronized on the standby supervisor?
**A:** Startup and running config, Layer 2 protocol state, the **FIB** and adjacency tables, so the standby takes over in about 1–3 seconds with line cards still forwarding.

**Q:** Why does SSO alone still cause a routing outage?
**A:** Routing adjacencies don't survive the switchover. Neighbours see them drop, assume the whole router died and reroute around it — unless **NSF** with graceful restart is on.

**Q:** What does NSF (Non-Stop Forwarding) do during a supervisor switchover?
**A:** Keeps the data plane forwarding on the **last known FIB** while the new active control plane rebuilds its routing tables.

**Q:** What is the difference between an NSF-capable and an NSF-aware router?
**A:** **NSF-capable** is the restarting router (dual supervisors, SSO). **NSF-aware** is a neighbour that understands graceful restart and **holds the routes** instead of tearing them down.

**Q:** Which command enables IETF graceful restart under OSPF?
**A:** `nsf ietf` under `router ospf` (or `nsf cisco` for Cisco's own method).

**Q:** Which LSA does an OSPF router send to announce a graceful restart, and what is the default restart interval?
**A:** A **grace LSA** (Type 9 opaque LSA); the default restart interval is **120 seconds**.

**Q:** In `show redundancy states`, which peer state do you want, and which one means a disruptive failover?
**A:** **STANDBY HOT** is fully synchronized (stateful). **STANDBY COLD** means the standby isn't synchronized and a failover would behave like RPR.

**Q:** Why can very aggressive BFD timers defeat NSF?
**A:** BFD can declare the neighbour down (e.g. 50 ms × 3 = 150 ms) before graceful restart finishes, so the adjacency is torn down anyway.

**Q:** How many switches can a StackWise stack hold, and how many control planes does it have?
**A:** Up to **eight** switches, with **one** control plane: an active plus an SSO standby; the rest are members.

**Q:** How is the StackWise active switch elected?
**A:** The current active keeps its role (not preemptive), then highest **stack priority** (1–15, default 1), then platform tiebreakers ending in the **lowest MAC address**.

**Q:** In which mode do you set stack priority, and with what command?
**A:** **Privileged EXEC**, not config mode: `switch 1 priority 15`.

**Q:** A repaired stack switch with the highest priority rejoins a running stack. What role does it get?
**A:** **Member** — the stack election isn't preemptive, so it doesn't take the active role back.

**Q:** What does StackWise Virtual do, and on which platforms?
**A:** Joins **two** distribution or core switches (Catalyst 9400/9500/9600) into **one logical switch** with one control plane. VSS did the same on the Catalyst 6500/6800 and 4500-X.

**Q:** What is the StackWise Virtual Link (SVL)?
**A:** The high-speed EtherChannel between the two StackWise Virtual switches that carries control traffic and any data that must cross between them (VSS called it the **VSL**).

**Q:** What is the Dual-Active Detection (DAD) link for?
**A:** It detects the case where the SVL fails but **both switches are still alive**, so the old active enters recovery mode instead of both being active (split brain).

**Q:** In StackWise Virtual, what happens to the old active switch when dual-active is detected?
**A:** It enters **recovery mode** and shuts down all its interfaces except the SVL and DAD links.

**Q:** What is a Multichassis EtherChannel (MEC)?
**A:** An access switch's bundle with one member to each switch of a StackWise Virtual pair. The access switch sees one ordinary EtherChannel.

**Q:** Why does a StackWise Virtual pair remove the need for both STP blocking and an FHRP?
**A:** The access switch sees one logical switch over one EtherChannel, so there's no loop to block, and there's only **one gateway SVI**, so nothing to fail over between.

**Q:** In what order does ISSU upgrade a dual-supervisor switch?
**A:** Upgrade the **standby** → switchover → upgrade the old active (now standby) → **commit** (or roll back).

**Q:** Why does ISSU require SSO?
**A:** Every step of ISSU is a supervisor switchover, so without a stateful switchover each step would be an outage.

**Q:** What is the main difference between HSRP/VRRP and GLBP in an HA design?
**A:** HSRP and VRRP have **one forwarding router per group**; GLBP lets **every router in one group forward** at once.

---

## 02 SD-WAN & SD-Access

**Q:** Name the four Catalyst SD-WAN components with their old names.
**A:** **SD-WAN Manager** (vManage), **SD-WAN Validator** (vBond), **SD-WAN Controller** (vSmart) and **WAN Edge** (cEdge/vEdge).

**Q:** Which SD-WAN plane does the SD-WAN Manager belong to, and what does it do?
**A:** The **management plane**: the single GUI and REST API for templates, policy, monitoring, upgrades and certificates. It pushes config to devices over **NETCONF**.

**Q:** What is the SD-WAN Validator's job?
**A:** The **orchestration plane** and first point of contact: it authenticates new devices, tells them where the Controllers and Manager are, and helps with **NAT traversal**. It needs a public IP.

**Q:** What is the SD-WAN Controller's job?
**A:** The **control plane**: it runs **OMP** with every WAN Edge like a BGP route reflector, applies centralized control policy and distributes data-plane encryption keys.

**Q:** Between which devices does OMP run?
**A:** Between each **WAN Edge and the Controllers** — never edge to edge.

**Q:** What three route types does OMP carry?
**A:** **OMP routes** (site prefixes), **TLOC routes** (transport attachment points) and **service routes** (firewall/IPS services at a site).

**Q:** What three things make up a TLOC?
**A:** **System IP + color + encapsulation** (IPsec or GRE).

**Q:** What is a TLOC "color"?
**A:** A label for the transport type (`mpls`, `biz-internet`, `lte`…) that decides which TLOCs build tunnels to each other and whether public or private addresses are used.

**Q:** How are SD-WAN data-plane encryption keys distributed?
**A:** Each edge sends its keys to the **Controller**, which reflects them over **OMP** — not pairwise IKE.

**Q:** What runs inside every SD-WAN tunnel, and what are its default timers?
**A:** **BFD**, at a **1 s hello** with a **multiplier of 7** (about 7 s to declare a tunnel down). It also measures loss, latency and jitter.

**Q:** What does SD-WAN Application-Aware Routing do?
**A:** Uses BFD's loss/latency/jitter measurements against **SLA classes** and moves an application to a path that meets its SLA.

**Q:** In SD-WAN, what are VPN 0 and VPN 512?
**A:** **VPN 0** is the transport (underlay, WAN-facing) VPN. **VPN 512** is out-of-band management. Service VPNs carry user traffic.

**Q:** Which SD-WAN policy type is delivered directly to one device, and how?
**A:** **Localized policy** (QoS, ACLs, route filtering), pushed by the Manager to the device over NETCONF.

**Q:** Which SD-WAN policy acts on OMP routes and TLOCs to change the topology?
**A:** **Centralized control policy**, applied on the Controllers (e.g. hub-and-spoke instead of full mesh).

**Q:** What happens to SD-WAN forwarding if the Controllers become unreachable?
**A:** The data plane keeps forwarding. OMP **graceful restart** keeps the last-known routes and keys (by default up to **12 hours**).

**Q:** Name two common reasons a WAN Edge never onboards.
**A:** An **organization name** mismatch (case-sensitive, it's in the certificates) or a serial number missing from the **authorized WAN Edge list**. Wrong clock/NTP breaking certificate checks is a third.

**Q:** What protocol forms the SD-Access underlay when Catalyst Center's LAN automation builds it?
**A:** **IS-IS** (routed IP, no VLANs and no STP between switches).

**Q:** What are the SD-Access control plane, data plane and policy plane?
**A:** Control plane **LISP**, data plane **VXLAN-GPO**, policy plane **TrustSec** (SGTs and SGACLs from ISE).

**Q:** What is the SD-Access control plane node?
**A:** A switch running **LISP Map Server/Map Resolver** that holds the host tracking database: each endpoint and the edge it sits behind. It is not Catalyst Center.

**Q:** What does an SD-Access edge node do?
**A:** It's the access switch: a LISP **xTR** and VXLAN **VTEP** that authenticates endpoints, registers them with the control plane node and provides the **anycast gateway**.

**Q:** What is the SD-Access anycast gateway?
**A:** The **same gateway IP and MAC** for a subnet on every edge node, so endpoints keep their gateway wherever they roam.

**Q:** What does an SD-Access border node do?
**A:** Connects the fabric to everything outside it (DC, WAN, internet, legacy network), advertising external prefixes in and fabric prefixes out.

**Q:** What does an SD-Access intermediate node know about the overlay?
**A:** **Nothing** — it just routes the VXLAN packets between loopbacks in the underlay.

**Q:** In SD-Access, what is macro-segmentation and what is micro-segmentation?
**A:** **Macro**: Virtual Networks (VNs), which are **VRFs**. **Micro**: **SGTs** inside a VN, enforced by SGACLs.

**Q:** In SD-Access, what is a fusion router for?
**A:** It **leaks routes between VN VRFs** and the shared-services network (DHCP, DNS, ISE), usually reached over VRF-Lite + eBGP from the border.

**Q:** What is SD-Access "fabric in a box"?
**A:** Border, control plane and edge roles all on **one switch** (or stack), for a small site.

**Q:** Which SD-Access VN carries fabric APs and extended nodes, and what table does it map to?
**A:** **INFRA_VN**, which maps to the **global routing table**, not a VRF.

**Q:** In SD-Access, where does fabric wireless client data go?
**A:** The AP encapsulates it in **VXLAN straight to the edge switch**; only control traffic (CAPWAP) goes to the fabric WLC.

**Q:** What is the SD-WAN equivalent of SD-Access's RLOC?
**A:** The **TLOC**: both are location abstractions (TLOC = System IP + color + encap; RLOC = fabric node loopback).

---

## 03 QoS

**Q:** Name the three QoS models.
**A:** **Best effort** (no QoS), **IntServ** (per-flow reservation with RSVP) and **DiffServ** (mark at the edge, per-hop behaviour by class).

**Q:** Why did DiffServ beat IntServ?
**A:** IntServ needs every router to keep **per-flow state**, which doesn't scale. DiffServ routers only need to know a handful of classes.

**Q:** How big is the CoS field, where does it live, and when is it lost?
**A:** **3 bits** (0–7) in the 802.1Q tag. It disappears at the first router, because routing strips the tag.

**Q:** How many bits is DSCP, and where does it live?
**A:** **6 bits** (0–63), the top of the IP ToS/Traffic Class byte. It survives end to end across routed hops.

**Q:** What is the formula for the DSCP value of AFxy?
**A:** **DSCP = 8x + 2y** (x is the class/queue, y is the drop precedence).

**Q:** What DSCP value is EF, and what is it used for?
**A:** **46** (binary 101110) — voice.

**Q:** What are the DSCP values of AF11, AF21, AF31 and AF41?
**A:** **10, 18, 26, 34**.

**Q:** What DSCP value is AF43?
**A:** **38** (8×4 + 2×3).

**Q:** What DSCP value is CS3, and what is it typically used for?
**A:** **24** (8 × 3) — call signalling.

**Q:** What DSCP value is CS6, and what is it typically used for?
**A:** **48** — routing protocol traffic.

**Q:** In AFxy, which digit picks the queue and which picks the drop priority?
**A:** **x** is the class (the queue); **y** is drop precedence within that class (1 low, 3 high).

**Q:** What is the full ToS byte value of a packet marked EF?
**A:** **0xB8** (184): DSCP 46 = 101110 plus two ECN bits 00.

**Q:** What are the three parts of an MQC configuration?
**A:** **class-map** (which traffic), **policy-map** (what to do), **service-policy** (where and which direction).

**Q:** What is the default match logic of a class-map?
**A:** **`match-all`** (logical AND). `match-any` is OR.

**Q:** Where does traffic that matches no class in a policy-map go?
**A:** **`class-default`**, which always exists.

**Q:** What does `set qos-group` do?
**A:** Sets an **internal** label that never leaves the box, so an output policy can match a decision made at input.

**Q:** What is NBAR2 used for in QoS?
**A:** Deep packet inspection that classifies **applications** (Webex, Teams…) even when they share a port like 443.

**Q:** Why shouldn't a switch trust markings from a user PC?
**A:** Any user or software can set DSCP 46 on bulk traffic and jump the voice queue. Trust only devices you control, like IP phones (often conditionally via CDP/LLDP).

**Q:** What is the key behavioural difference between policing and shaping?
**A:** **Policing drops or remarks** excess traffic immediately (no buffering). **Shaping buffers** excess and sends it later (adds delay, smooths rate).

**Q:** Why can shaping only be applied outbound?
**A:** Shaping means holding packets that haven't been sent yet, and you can only hold packets waiting to leave.

**Q:** In which units are Bc and Be on `shape` versus `police`?
**A:** **Bits** on `shape`, **bytes** on `police`.

**Q:** How is the shaping interval Tc calculated?
**A:** **Tc = Bc ÷ CIR**.

**Q:** What three results can a two-rate, three-color policer give?
**A:** **Conform, exceed, violate** (using CIR and PIR).

**Q:** What does CBWFQ give each class?
**A:** A **guaranteed minimum bandwidth** (`bandwidth`).

**Q:** What does LLQ add on top of CBWFQ?
**A:** One **strict-priority queue** (`priority`) served before all others, for voice.

**Q:** Why does the LLQ priority queue have a built-in policer on routers?
**A:** So a misbehaving priority class can't **starve** every other queue.

**Q:** On a 100 Mbps interface with 20 Mbps of priority, how much does `bandwidth remaining percent 30` guarantee?
**A:** **24 Mbps** — 30% of the 80 Mbps left after the priority queue (`bandwidth percent 30` would be 30 Mbps).

**Q:** On Catalyst switches, what does `priority level 1` versus `priority level 2` mean?
**A:** Two strict-priority queues: level 1 is always served first (voice), level 2 next (video).

**Q:** What does WRED do?
**A:** Drops packets **randomly before** the queue is full, more aggressively for higher drop precedence, so TCP flows slow down at different times instead of all at once.

**Q:** What does ECN do instead of dropping?
**A:** Uses the bottom **2 bits** of the ToS byte to signal congestion to the endpoints so they slow down without losing packets.

---

## 04 Virtualization

**Q:** What is a Type 1 hypervisor? Give examples.
**A:** A **bare-metal** hypervisor running directly on the hardware: VMware ESXi, Microsoft Hyper-V, KVM, Xen.

**Q:** What is a Type 2 hypervisor? Give examples.
**A:** A **hosted** hypervisor running on top of a normal OS: VMware Workstation/Fusion, VirtualBox, Parallels.

**Q:** Why is a Type 1 hypervisor faster than a Type 2?
**A:** There's no host OS in the way; a Type 2 sends every I/O request through the host OS scheduler.

**Q:** What is a vNIC really connected to?
**A:** A software port on a **virtual switch** inside the hypervisor.

**Q:** What is the advantage of a distributed vSwitch over a standard vSwitch?
**A:** Port groups are defined **once** for many hosts, so a migrating VM finds the same network everywhere.

**Q:** What is SR-IOV?
**A:** A PCIe feature where one physical NIC presents many **virtual functions**; a VM gets one directly and **bypasses the vSwitch** for near line-rate performance.

**Q:** Why can a vMotion succeed but the VM lose connectivity afterwards?
**A:** The VM's VLAN isn't allowed on the new host's uplink trunk — the migration uses a separate network, so it "succeeds".

**Q:** What is Cisco's virtual IOS XE router called?
**A:** **Catalyst 8000V** (successor to the CSR 1000v).

**Q:** What does a VRF give a router?
**A:** A separate **routing table and forwarding table** per VRF, so groups can be isolated and can even use overlapping addresses.

**Q:** Why must `vrf forwarding` be applied before `ip address` on an interface?
**A:** Putting an interface into a VRF **removes its IP address**, so you must re-enter the address afterwards.

**Q:** How do you ping a host that lives in VRF CUST-A?
**A:** `ping vrf CUST-A 10.1.1.1` — a plain ping uses the global table.

**Q:** What IP protocol number is GRE?
**A:** **47**.

**Q:** What is GRE's biggest weakness?
**A:** It's **not encrypted** — anyone on the path can read the inner packets.

**Q:** What does `keepalive 10 3` do on a GRE tunnel?
**A:** Sends a keepalive every **10 s** and brings line protocol down after **3** missed replies, so a dead tunnel doesn't stay up/up.

**Q:** What causes `%TUN-5-RECURDOWN` on a GRE tunnel?
**A:** **Recursive routing**: the route to the tunnel destination points into the tunnel itself.

**Q:** Why add `ip tcp adjust-mss` on a tunnel interface?
**A:** GRE and IPsec headers make full-size packets too big; lowering the TCP MSS (e.g. 1360) stops fragmentation and black-holed large transfers.

**Q:** What IP protocol numbers are ESP and AH?
**A:** ESP = **50**, AH = **51**.

**Q:** Why does almost everyone use ESP instead of AH?
**A:** AH doesn't encrypt, and it authenticates the outer IP header, so it **breaks through NAT**.

**Q:** What is the difference between IPsec tunnel and transport mode?
**A:** **Tunnel** mode encrypts the whole original packet and adds a new IP header (site-to-site, default). **Transport** mode encrypts only the payload (e.g. GRE over IPsec).

**Q:** What does IKEv1 Phase 1 build, and how many messages does Main Mode use?
**A:** The **ISAKMP SA** (secure management channel), in **6** messages (Aggressive Mode uses 3).

**Q:** What does IKEv1 Phase 2 (Quick Mode) build, and in how many messages?
**A:** The **IPsec SAs** that carry data, in **3** messages.

**Q:** What are the two IKEv2 exchanges, and how many messages in total?
**A:** **IKE_SA_INIT** (crypto + Diffie-Hellman) and **IKE_AUTH** (authenticate + first Child SA): **4** messages.

**Q:** What UDP ports does IKE use?
**A:** **UDP 500**, and **UDP 4500** when NAT traversal is in use.

**Q:** What is the advantage of a VTI over a crypto map?
**A:** Anything **routed into** the tunnel interface is encrypted, so routing protocols, QoS and ACLs work naturally, and new subnets need only a route.

**Q:** In `show crypto isakmp sa`, what do QM_IDLE and MM_NO_STATE mean?
**A:** **QM_IDLE** = Phase 1 healthy. **MM_NO_STATE** = Phase 1 stuck at the first exchange (no reply or no matching policy).

**Q:** In `show crypto ipsec sa`, encaps rise but decaps stay at 0. Where do you look?
**A:** At the **far side**: its return routing into the tunnel, or something in the path blocking ESP / UDP 4500.

**Q:** In LISP, what is the difference between an EID and an RLOC?
**A:** The **EID** says *who* (the endpoint's address); the **RLOC** says *where* (the LISP router the EID sits behind).

**Q:** What do the LISP ITR and ETR do?
**A:** The **ITR** looks up the destination's RLOC and **encapsulates**; the **ETR** **decapsulates** and registers its EIDs with the Map Server.

**Q:** What is the difference between a LISP Map Server and Map Resolver?
**A:** The **MS** accepts **Map-Registers** from ETRs; the **MR** accepts **Map-Requests** from ITRs.

**Q:** What do LISP PITR and PETR roles do?
**A:** **PITR** attracts traffic from non-LISP sites to LISP EIDs; **PETR** takes traffic from LISP sites to non-LISP destinations.

**Q:** Which UDP ports does LISP use?
**A:** **4342** for control, **4341** for data.

**Q:** What UDP port does VXLAN use, and how big is the VNI?
**A:** **UDP 4789**; the VNI is **24 bits** (about 16 million segments).

**Q:** How much overhead does VXLAN add, and what MTU does the underlay need?
**A:** **50 bytes** (54 with an 802.1Q tag), so the underlay needs at least 1550, usually **9000/9216** jumbo frames.

**Q:** Why is VXLAN carried in UDP with a hashed source port?
**A:** So underlay routers can **ECMP load-balance** different inner flows between the same two VTEPs.

**Q:** Which BGP EVPN route types advertise MAC/IP addresses and IP prefixes?
**A:** **Type 2** for MAC/IP, **Type 5** for IP prefixes (Type 3 discovers peers for BUM replication).

---

## 05 Layer 2

**Q:** Which DTP mode combinations form a trunk?
**A:** `trunk` with anything except `access`; `dynamic desirable` with `desirable` or `auto`. **`auto` + `auto` stays access**.

**Q:** What command stops a trunk port from sending DTP frames?
**A:** `switchport nonegotiate`.

**Q:** What happens with a native VLAN mismatch on a trunk?
**A:** Untagged traffic leaks between the two VLANs, CDP logs a native VLAN mismatch, and Rapid PVST+ marks the port **PVID-inconsistent** and blocks it for that VLAN (`show spanning-tree inconsistentports`).

**Q:** What does VTPv3 add over v1/v2?
**A:** Only the **primary server** can change VLANs, protection against accidental overwrite, propagation of **extended VLANs (1006–4094)** and of **MST** config.

**Q:** Which LACP and PAgP modes initiate, and which only respond?
**A:** LACP: `active` initiates, `passive` responds. PAgP: `desirable` initiates, `auto` responds.

**Q:** Which EtherChannel mode pairs never form a bundle?
**A:** `passive` + `passive`, `auto` + `auto`, any LACP with any PAgP mode, and `on` with any negotiating mode.

**Q:** Why is EtherChannel mode `on` the most dangerous?
**A:** No protocol checks the far end really bundled, so a misconfiguration can create a **loop** or black hole silently.

**Q:** Which settings must match on every EtherChannel member?
**A:** Speed, duplex, switchport mode (and L2 vs L3), access VLAN or native/allowed VLANs, trunk encapsulation, and the protocol family (LACP or PAgP).

**Q:** In `show etherchannel summary`, what do the flags `P`, `s` and `I` mean?
**A:** **P** = bundled. **s** = suspended (config mismatch). **I** = stand-alone (no LACP/PAgP partner heard).

**Q:** In `show etherchannel summary`, what does `H` mean on a member?
**A:** LACP **hot-standby**: more members than can be active (max 8), or `max-bundle` reached.

**Q:** How many ports can an LACP channel have, and how many are active?
**A:** Up to **16**; only **8** active, the rest hot-standby.

**Q:** What does `port-channel min-links` do?
**A:** Takes the whole port-channel down if fewer than that many members are up, so routing moves traffic elsewhere instead of congesting the survivors.

**Q:** What priority value does `spanning-tree vlan 10 root primary` usually set?
**A:** **24576** (or 4096 below the current root if that's lower); `root secondary` sets **28672**.

**Q:** With extended system ID, what is the bridge priority of a switch with priority 24576 in VLAN 10?
**A:** **24586** (24576 + VLAN 10).

**Q:** What are the short (802.1D-1998) STP costs for 100 Mbps, 1 Gbps and 10 Gbps?
**A:** **19, 4, 2**.

**Q:** What are the long (802.1t) STP costs for 1 Gbps, 10 Gbps and 100 Gbps?
**A:** **20,000; 2,000; 200**.

**Q:** STP port cost versus port priority: which switch do you configure each on?
**A:** **Cost** on the downstream switch choosing its root port. **Port priority** on the **upstream** switch, on the port the downstream switch connects to.

**Q:** Why should the STP root and the FHRP active router be the same switch per VLAN?
**A:** The access switch forwards toward the root; if the gateway is on the other switch, traffic takes an extra hop across the inter-switch link.

**Q:** What are the four RSTP port roles?
**A:** **Root, designated, alternate** (backup path to root via another switch) and **backup** (backup for a designated port on the same segment).

**Q:** What are the three RSTP port states?
**A:** **Discarding, learning, forwarding** (discarding replaces disabled, blocking and listening).

**Q:** Why are 802.1D timers slow, and how long can convergence take?
**A:** 15 s listening + 15 s learning, plus up to 20 s max age to notice a failure: **30–50 seconds**.

**Q:** In MST, what is instance 0 called, and what is special about it?
**A:** The **IST**; it's the only instance that sends BPDUs (other instances ride in it as M-records).

**Q:** What three settings must match for two switches to be in the same MST region?
**A:** **Region name, revision number and VLAN-to-instance mapping** (compared as an MD5 digest).

**Q:** What is the CIST regional root?
**A:** The switch in each MST region **closest to the CIST root** — the region's entry point.

**Q:** What is an MST boundary port?
**A:** A port facing **a different region** or a non-MST switch (802.1D, RSTP or PVST+).

**Q:** What replaces the message-age timer inside an MST region, and what is its default?
**A:** A **hop count** — `max-hops`, default **20**.

**Q:** Why does MST scale better than Rapid PVST+?
**A:** It sends **one BPDU per port** for all instances and runs a few instances instead of one tree per VLAN.

**Q:** What does `spanning-tree portfast bpduguard default` do?
**A:** Enables **BPDU guard on every PortFast port**: any received BPDU err-disables the port.

**Q:** Global BPDU filter versus per-interface BPDU filter: what is the difference?
**A:** **Global** (PortFast ports): stops sending BPDUs but if one is received the port loses PortFast. **Per-interface**: never sends, ignores everything — STP is effectively off.

**Q:** What does root guard do, and on which port role does it belong?
**A:** Puts the port into **root-inconsistent** if a superior BPDU arrives; it belongs on **designated** ports facing switches that should never be root.

**Q:** What does loop guard do, and on which ports does it belong?
**A:** If BPDUs stop arriving on a root or alternate port, it goes **loop-inconsistent** instead of forwarding. It belongs on **root and alternate** ports.

**Q:** Why can't root guard and loop guard be used on the same port?
**A:** They protect **opposite roles**: root guard on designated ports, loop guard on root/alternate ports.

**Q:** UDLD normal versus aggressive mode?
**A:** **Normal** logs and marks the port. **Aggressive** retries 8 times (once per second), then **err-disables** the port.

---

## 06 Routing Concepts: EIGRP vs OSPF, eBGP & PBR

**Q:** What kind of protocol is EIGRP, and what kind is OSPF?
**A:** EIGRP is an **advanced distance-vector** protocol (DUAL); OSPF is a **link-state** protocol (SPF on a full map of the area).

**Q:** What IP protocol numbers and multicast addresses do EIGRP and OSPF use?
**A:** EIGRP: protocol **88**, **224.0.0.10** (FF02::A). OSPF: protocol **89**, **224.0.0.5** all routers / **224.0.0.6** DR/BDR (FF02::5 / FF02::6).

**Q:** What are the default EIGRP hello and hold timers on LAN links?
**A:** Hello **5 s**, hold **15 s** (60/180 s on slow NBMA links).

**Q:** What are the default OSPF hello and dead timers on broadcast and point-to-point links?
**A:** Hello **10 s**, dead **40 s**.

**Q:** What are the default classic EIGRP K values, and what do they mean?
**A:** **K1 = 1, K3 = 1**, others 0: only **bandwidth** and **delay** count.

**Q:** What is the classic EIGRP metric formula with default K values?
**A:** **256 × (10⁷ ÷ slowest bandwidth in kbps + total delay in tens of µs)**.

**Q:** What is the classic EIGRP metric of a connected GigabitEthernet network?
**A:** **2816** = 256 × (10 + 1).

**Q:** Why does the EIGRP metric use the slowest bandwidth but the total delay?
**A:** Throughput is limited by the narrowest link, while delay adds up hop by hop.

**Q:** What are EIGRP wide metrics, and where are they used?
**A:** A **64-bit** metric in named mode that measures delay in **picoseconds** so fast links can be told apart.

**Q:** How is OSPF cost calculated, and what is the default reference bandwidth?
**A:** Cost = reference bandwidth ÷ interface bandwidth; the default reference is **100 Mbps**, so everything 100 Mbps and faster costs 1.

**Q:** Which command raises the OSPF reference bandwidth, and where must it be set?
**A:** `auto-cost reference-bandwidth 100000` (in Mbps) under `router ospf` — on **every** router.

**Q:** Which protocol can do unequal-cost load balancing, and with what command?
**A:** **EIGRP**, with `variance` (OSPF only does equal-cost).

**Q:** What is EIGRP named mode, in one line?
**A:** `router eigrp NAME` with everything under `address-family … autonomous-system N`, `af-interface` and `topology base` — one process for IPv4 and IPv6, with wide metrics.

**Q:** In what order does a router choose a route for a destination?
**A:** **Longest prefix match** first, then lowest **administrative distance** between sources, then lowest **metric** within one protocol.

**Q:** Which OSPF LSA types does an ABR generate?
**A:** **Type 3** (summary) and **Type 4** (ASBR summary).

**Q:** What is the OSPF command to summarize inter-area routes, and where is it configured?
**A:** `area 1 range 10.1.0.0 255.255.0.0` on the **ABR**.

**Q:** What is the OSPF command to summarize external routes, and where is it configured?
**A:** `summary-address 192.168.0.0 255.255.0.0` on the **ASBR**.

**Q:** How do you filter Type 3 LSAs at an ABR?
**A:** `area 1 filter-list prefix NAME in|out` on the ABR.

**Q:** What does an OSPF `distribute-list in` actually filter?
**A:** Only what goes into **this router's routing table** — the LSAs are still in the LSDB and still flooded.

**Q:** What does `passive-interface` do in OSPF?
**A:** Stops hellos on the interface (so no adjacency forms) but still **advertises its network**.

**Q:** Which OSPF network types elect a DR, and which don't?
**A:** **Broadcast** and **non-broadcast** elect a DR/BDR; **point-to-point** and **point-to-multipoint** don't.

**Q:** What TCP port does BGP use?
**A:** **TCP 179**.

**Q:** What is the default TTL of eBGP packets, and why does it matter?
**A:** **1**, so the eBGP neighbour must be directly connected unless you add `ebgp-multihop`.

**Q:** Which commands start an eBGP session from AS 65001 to 203.0.113.2 in AS 65002 and advertise 10.1.0.0/16?
**A:** `router bgp 65001`, `neighbor 203.0.113.2 remote-as 65002`, `network 10.1.0.0 mask 255.255.0.0` (the exact prefix must be in the RIB).

**Q:** What does BGP's `network` command require before it advertises a prefix?
**A:** An **exact match** (prefix and mask) in the routing table.

**Q:** Which mnemonic captures the BGP best-path order, and what does it stand for?
**A:** **N WLLA OMNI**: Next hop reachable, Weight, Local pref, Locally originated, AS path, Origin, MED, Neighbour type (eBGP over iBGP), IGP metric to next hop.

**Q:** What does policy-based routing (PBR) let you route by?
**A:** Something **other than the destination** — source address, application, packet size — using a route-map applied **inbound** with `ip policy route-map`.

**Q:** What is the AD of routes learned via eBGP, and via iBGP?
**A:** eBGP **20**, iBGP **200**.

---

## 07 IP Services: NTP, PTP, NAT & FHRP

**Q:** What port does NTP use?
**A:** **UDP 123**.

**Q:** What does NTP stratum 16 mean?
**A:** **Unsynchronized** — the clock shouldn't be trusted.

**Q:** What default stratum does `ntp master` use?
**A:** **8**.

**Q:** What is the difference between `ntp server` and `ntp peer`?
**A:** `ntp server` = client/server (I adjust to it, never the reverse). `ntp peer` = symmetric active (we may adjust to each other).

**Q:** What three NTP authentication commands must all be present on a client?
**A:** `ntp authenticate`, `ntp authentication-key N md5 KEY` and `ntp trusted-key N` (plus `key N` on the `ntp server` line).

**Q:** Which `ntp access-group` type lets matched hosts synchronize this router?
**A:** **`peer`** (`serve` and `serve-only` let them get time but not sync this router).

**Q:** In `show ntp associations`, what do `*`, `+` and `x` mean?
**A:** `*` = the **sys.peer** I'm synced to. `+` = acceptable candidate. `x` = **falseticker**.

**Q:** In `show ntp associations`, what does a `reach` of 377 mean?
**A:** The last **8 polls all answered** (it's an octal shift register).

**Q:** What time zone does NTP always carry?
**A:** **UTC** — local time needs `clock timezone` and `clock summer-time`.

**Q:** What accuracy can PTP reach versus NTP, and why?
**A:** PTP: **sub-microsecond**; NTP: milliseconds. PTP timestamps in **hardware** at the port.

**Q:** What UDP ports does PTP use?
**A:** **319** (event messages) and **320** (general messages).

**Q:** What are the four PTP messages used in the delay request-response exchange?
**A:** **Sync**, **Follow_Up**, **Delay_Req** and **Delay_Resp**.

**Q:** What is a PTP boundary clock?
**A:** A switch that is **slave** on its upstream port and **master** on its downstream ports, regenerating time.

**Q:** What is a PTP transparent clock?
**A:** A switch that doesn't sync itself but writes each packet's **residence time** into the **correction field**.

**Q:** What does a PTP log interval of -3 mean?
**A:** 2⁻³ s — **eight messages per second** (negative means faster than once per second).

**Q:** Which PTP value works like STP root priority to pin the grandmaster election?
**A:** **priority1** (lower wins).

**Q:** Define inside local, inside global and outside global.
**A:** **Inside local**: inside host's real (private) address. **Inside global**: that host as seen from outside (public). **Outside global**: an outside host's real address.

**Q:** Which command configures PAT using the outside interface's address?
**A:** `ip nat inside source list 1 interface GigabitEthernet0/0 overload`.

**Q:** For traffic going inside to outside, does NAT happen before or after routing?
**A:** **After routing** (inbound ACL → routing → NAT → outbound ACL).

**Q:** Which command shows active NAT translations?
**A:** `show ip nat translations`.

**Q:** What port, multicast address and virtual MAC does HSRPv1 use?
**A:** **UDP 1985**, **224.0.0.2**, vMAC **0000.0c07.acXX** (XX = group in hex).

**Q:** What multicast address, group range and virtual MAC does HSRPv2 use?
**A:** **224.0.0.102**, groups **0–4095**, vMAC **0000.0c9f.fXXX**.

**Q:** What are the default HSRP hello and hold timers and priority?
**A:** Hello **3 s**, hold **10 s**, priority **100**.

**Q:** Is preemption on by default in HSRP and in VRRP?
**A:** HSRP: **off**. VRRP: **on**.

**Q:** What happens if one HSRP router runs v1 and the other v2?
**A:** They can't hear each other, so **both go Active**.

**Q:** By how much does HSRP tracking lower priority if you give no decrement?
**A:** **10**.

**Q:** What protocol number, multicast address and virtual MAC does VRRP use?
**A:** **IP protocol 112**, **224.0.0.18**, vMAC **0000.5e00.01XX**.

**Q:** What VRRP priority does the address owner get, and why?
**A:** **255** — the VIP is one of its real interface addresses, so it always becomes Master.

**Q:** What are VRRP's role names, and who sends advertisements?
**A:** **Master** and **Backup**; only the Master advertises (every 1 s by default).

**Q:** Which VRRP version supports IPv6, and which removed authentication?
**A:** **VRRPv3** does both: it adds IPv6 and has no authentication.

**Q:** What port does GLBP use, and what are its two roles?
**A:** **UDP 3222**; the **AVG** (answers ARP, hands out virtual MACs) and up to four **AVFs** (forward).

---

## 08 Multicast

**Q:** What is the 224.0.0.0/24 multicast range, and what is special about it?
**A:** **Local network control**: link-local, TTL 1, **never routed** (e.g. .5/.6 OSPF, .10 EIGRP, .13 PIM).

**Q:** What multicast range is reserved for SSM?
**A:** **232.0.0.0/8**.

**Q:** What multicast range is administratively scoped (the "private" multicast range)?
**A:** **239.0.0.0/8**.

**Q:** How is a multicast IP mapped to a MAC address?
**A:** **01:00:5e** plus a 0 bit, then the **low-order 23 bits** of the group address.

**Q:** Why can 32 multicast groups share one MAC address?
**A:** Only 23 of the 28 variable group bits are copied, so **5 bits are lost** (2⁵ = 32 overlap).

**Q:** What IP protocol number is IGMP, and between whom does it run?
**A:** **2**; between hosts and their **local router** — it never crosses a router.

**Q:** To which address does an IGMPv2 host send a Leave?
**A:** **224.0.0.2** (all routers).

**Q:** What does a router do after receiving an IGMPv2 Leave?
**A:** Sends a **group-specific query** to check whether anyone else still wants the group.

**Q:** How is the IGMPv2 querier elected?
**A:** The router with the **lowest IP address** wins.

**Q:** Where do IGMPv3 reports go, and what key feature does v3 add?
**A:** To **224.0.0.22**; v3 adds **source filtering** (INCLUDE/EXCLUDE lists), the basis of SSM.

**Q:** How often does IOS send IGMP general queries by default?
**A:** Every **60 s** (RFC default is 125 s), with a 10 s max response time.

**Q:** What IP protocol number is PIM, and where are its hellos sent?
**A:** **103**; hellos to **224.0.0.13** every **30 s**.

**Q:** Why is PIM called "protocol independent"?
**A:** It has no routing table of its own; it uses the **unicast routing table** for RPF checks.

**Q:** What does (S,G) mean, and what does (*,G) mean?
**A:** `(S,G)` = traffic from source S to group G (source tree/SPT). `(*,G)` = traffic to G from any source (shared tree rooted at the RP).

**Q:** How does PIM dense mode work, and why is it obsolete?
**A:** **Flood and prune**: it sends every stream everywhere and re-floods when prunes expire (≈3 min), wasting bandwidth and state.

**Q:** In PIM sparse mode, what does the first-hop router do when a source starts sending?
**A:** Wraps the packets in unicast **Register** messages to the RP.

**Q:** What does the RP send after it joins the source tree?
**A:** A **Register-Stop** to the first-hop router.

**Q:** Why do last-hop routers switch from the shared tree to the SPT?
**A:** The first packet reveals the source, so they join the shortest path to it and prune off the RP tree. The shared tree exists for **source discovery**.

**Q:** What is the multicast RPF check?
**A:** A packet is accepted only if it arrives on the interface the **unicast route back to the source** (or RP, for shared-tree traffic) uses; otherwise it's dropped.

**Q:** What problem does the multicast RPF check prevent?
**A:** **Loops and duplicates** — only the copy arriving on the shortest path back to the source passes.

**Q:** What does PIM Source-Specific Multicast (SSM) remove?
**A:** The **RP and shared tree**: receivers join (S,G) directly using IGMPv3.

**Q:** What is bidirectional PIM for?
**A:** **Many-to-many** applications: traffic flows up and down one shared tree, so no (S,G) state is created per source.

**Q:** What does MSDP do?
**A:** Shares **active-source information between RPs** in different PIM domains (over TCP 639).

**Q:** What does the PIM Assert mechanism resolve?
**A:** Two routers forwarding the same stream onto one LAN; the winner (best AD/metric to the source) keeps forwarding.

**Q:** What does IGMP snooping do on a switch?
**A:** Listens to IGMP so it forwards a group only to ports with receivers (and the **mrouter port**), instead of flooding the VLAN.

**Q:** What PIM state flag on a last-hop router shows it has switched to the SPT?
**A:** **T** on the (S,G) entry.

---

## 09 Network Assurance

**Q:** Why should you source an extended ping from a loopback or LAN interface?
**A:** It proves the far end has a **route back** to that network; a default ping uses the exit interface's address.

**Q:** In ping output, what do `!`, `.`, `U` and `M` mean?
**A:** `!` reply, `.` timeout, `U` destination unreachable, `M` could not fragment (DF set).

**Q:** Why are debugs dangerous on a busy router?
**A:** Debug output is CPU work; a per-packet debug can drive the **CPU to 100%** and take the router down.

**Q:** What does a conditional debug do, and with what command?
**A:** Limits debug output to one interface, IP or peer: e.g. `debug condition interface Gi0/1` before `debug ip ospf adj`.

**Q:** Do debug conditions disappear after `undebug all`?
**A:** **No** — clear them with `undebug condition` (or `no debug condition all`).

**Q:** Why can't you see log or debug messages over SSH by default?
**A:** They go to the console; you need `terminal monitor` in that session.

**Q:** List the eight syslog severity levels in order.
**A:** 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging. *(Every Awesome Cisco Engineer Will Need Ice cream Daily)*

**Q:** Which syslog severity is `%LINEPROTO-5-UPDOWN`?
**A:** **5 — notifications**.

**Q:** What are the parts of an IOS log message after the timestamp?
**A:** **Facility, severity, mnemonic**, then the description (e.g. `%LINK-3-UPDOWN: Interface…`).

**Q:** What is the default `logging trap` level for a syslog server?
**A:** **Informational (6)**.

**Q:** What port does syslog use?
**A:** **UDP 514**.

**Q:** What does a leading `*` on a log timestamp mean?
**A:** The clock is **not NTP-synchronized** (not authoritative).

**Q:** What ports does SNMP use for polls and for traps/informs?
**A:** **UDP 161** for polls, **UDP 162** for traps and informs.

**Q:** What is the difference between an SNMP trap and an inform?
**A:** A **trap** is fire-and-forget; an **inform** is acknowledged and retransmitted.

**Q:** Which SNMP versions added GetBulk and informs?
**A:** **v2c**.

**Q:** What are the three SNMPv3 security levels?
**A:** **noAuthNoPriv** (`noauth`), **authNoPriv** (`auth`), **authPriv** (`priv`: authentication and encryption).

**Q:** What are the four building blocks of Flexible NetFlow?
**A:** **Flow record**, **flow exporter**, **flow monitor**, and applying the monitor to an **interface**.

**Q:** In a flow record, what is the difference between `match` and `collect`?
**A:** `match` fields are **keys** that define a separate flow; `collect` fields are **non-key** values measured per flow (bytes, packets).

**Q:** Which command applies a flow monitor to an interface?
**A:** `ip flow monitor FM-NAME input` (and/or `output`) under the interface.

**Q:** What are the default Flexible NetFlow inactive and active timeouts?
**A:** Inactive **15 s**; active **1800 s** (30 minutes).

**Q:** SPAN versus RSPAN versus ERSPAN: how do the copies travel?
**A:** **SPAN**: inside one switch. **RSPAN**: across trunks in a dedicated **RSPAN VLAN**. **ERSPAN**: in **GRE** across a routed network.

**Q:** What command makes a VLAN usable for RSPAN?
**A:** `remote-span` under the VLAN, so switches don't learn MACs from the mirrored frames.

**Q:** What happens to a SPAN destination port?
**A:** It stops acting as a normal port: no normal forwarding, no STP, and incoming traffic is ignored by default.

**Q:** Why does an IP SLA operation often never run?
**A:** It was never **scheduled** — you need `ip sla schedule 10 life forever start-time now` (default life is 3600 s).

**Q:** Which IP SLA operation measures jitter, and what does it require?
**A:** **udp-jitter**, which needs `ip sla responder` on the far Cisco device.

**Q:** IP SLA tracking: `reachability` versus `state`?
**A:** **reachability** is up for OK *or* over-threshold. **state** is up for **OK only**.

**Q:** Which UDP port does the IP SLA control message go to on the responder?
**A:** **UDP 1967**.

**Q:** What are Catalyst Center's four workflows?
**A:** **Design, Policy, Provision, Assurance**.

**Q:** How does a new device find Catalyst Center for Plug and Play?
**A:** **DHCP option 43**, a DNS lookup of **`pnpserver.<domain>`**, or Cisco's PnP Connect cloud.

**Q:** In Catalyst Center Assurance, what do health scores 1–3, 4–7 and 8–10 mean?
**A:** **Poor, Fair, Good**.

**Q:** What does Catalyst Center's AI Network Analytics learn?
**A:** A **dynamic baseline** of what's normal for your network at each time, then flags anomalies against it instead of static thresholds.

**Q:** What is SWIM in Catalyst Center?
**A:** **Software Image Management**: golden images, compliance flags, distribution, and automated pre- and post-checks.

**Q:** Which template languages does Catalyst Center support?
**A:** **Velocity** and **Jinja2**.

---

## 10 Security

**Q:** What do console, AUX and VTY lines give access to?
**A:** **Console**: local physical port. **AUX**: legacy modem port. **VTY**: remote Telnet/SSH sessions (one line per session).

**Q:** Which command limits which source IPs can reach the VTY lines?
**A:** `access-class MGMT in` under `line vty`.

**Q:** Which command allows only SSH on the VTY lines?
**A:** `transport input ssh`.

**Q:** What happens to VTY logins with `login` but no `password`?
**A:** Every session is refused: **"Password required, but none set"**.

**Q:** What are IOS privilege levels 0, 1 and 15?
**A:** **0**: almost nothing (logout, enable). **1**: user EXEC (`>`), the default. **15**: privileged EXEC (`#`).

**Q:** Rank IOS password types 0, 7, 5, 8 and 9 from weakest to strongest.
**A:** **0** clear text, **7** reversible, **5** MD5, **8** PBKDF2-SHA-256, **9** scrypt (best).

**Q:** Which command creates a type 9 local user password?
**A:** `username admin algorithm-type scrypt secret PASSWORD`.

**Q:** What does `aaa new-model` do immediately?
**A:** Turns on AAA, so every line without a named list uses the **default** method list — misconfigure it and you lock yourself out.

**Q:** Write a login method list that tries TACACS+ then the local database.
**A:** `aaa authentication login default group tacacs+ local`.

**Q:** Why is the console usually given its own local-only method list?
**A:** The console is your way in when the network is broken, which is exactly when the AAA server may be unreachable.

**Q:** TACACS+ versus RADIUS: transport and what each encrypts?
**A:** **TACACS+**: TCP 49, encrypts the whole payload, separates AAA. **RADIUS**: UDP 1812/1813, encrypts only the password, combines authN and authZ.

**Q:** Which AAA protocol suits per-command device administration, and which suits network access?
**A:** **TACACS+** for device admin (per-command authorization); **RADIUS** for network access (802.1X, VPN).

**Q:** What does `aaa authorization exec` give a user?
**A:** Their **EXEC session attributes** from the server, such as privilege level 15 so they land at `#`.

**Q:** In a CoPP ACL, what does `permit` mean?
**A:** "**Belongs in this class**" — the policer decides what happens to it. It doesn't mean "allow".

**Q:** Where is a CoPP policy attached?
**A:** `control-plane` then `service-policy input POLICY-NAME`.

**Q:** Why must class-default be policed in CoPP?
**A:** Anything you didn't classify lands there; left unlimited, a flood of unexpected traffic still reaches the CPU.

**Q:** What are the three planes of a network device?
**A:** **Data plane** (forwards through, in hardware), **control plane** (routing protocols, ARP, STP on the CPU), **management plane** (SSH, SNMP, NTP on the CPU).

**Q:** What does DNS-layer security (Cisco Umbrella / Secure Access) do?
**A:** Blocks lookups of malicious domains **before** a connection is ever made.

**Q:** What is Cisco Talos?
**A:** Cisco's **threat-intelligence** organization; it feeds verdicts on IPs, domains, files and IPS signatures into every Cisco security product.

**Q:** What is Cisco Secure Malware Analytics (formerly Threat Grid)?
**A:** A **sandbox** that detonates suspicious files in an isolated VM and reports what they do.

**Q:** What does Cisco Secure Network Analytics (formerly Stealthwatch) use to spot threats?
**A:** **NetFlow** from the network, with behaviour modelling to detect anomalies like data exfiltration.

**Q:** What are the three 802.1X roles?
**A:** **Supplicant** (endpoint), **authenticator** (switch/WLC, relays), **authentication server** (RADIUS, usually ISE).

**Q:** Which EAP method uses certificates on both client and server?
**A:** **EAP-TLS**.

**Q:** What does ISE posture assessment check?
**A:** The **health** of the device: OS patches, antivirus running, disk encryption — before granting full access.

**Q:** What does a next-generation firewall add beyond stateful inspection?
**A:** **Application visibility and control**, **IPS**, **URL filtering**, malware protection, **identity awareness** and optional TLS decryption.

**Q:** How big is a TrustSec SGT, and where is it carried inline?
**A:** **16 bits**, in the **Cisco Meta Data (CMD)** field of the Ethernet frame (EtherType 0x8909).

**Q:** What does SXP do, and over what transport?
**A:** Sends **IP-to-SGT mappings** from devices that can't tag inline, over **TCP 64999**.

**Q:** Where is TrustSec policy usually enforced, and why?
**A:** At **egress**, because the egress device knows both the source tag and the destination's group.

**Q:** What standard is MACsec, and what key agreement does it use?
**A:** **IEEE 802.1AE**, with keys from **MKA** (MACsec Key Agreement, 802.1X-2010).

**Q:** Is MACsec end-to-end or hop-by-hop?
**A:** **Hop-by-hop**: encrypted on each link and decrypted inside each device so it can switch, apply QoS and read SGTs.

**Q:** What does MACsec leave visible in a frame?
**A:** Only the **destination and source MAC**; the 802.1Q tag, SGT and payload are encrypted and integrity-protected.

**Q:** Which HTTP code do REST APIs typically return when a client is rate-limited?
**A:** **429 Too Many Requests**.

**Q:** Why is HTTP Basic authentication safe only over HTTPS?
**A:** Base64 is **encoding, not encryption** — anyone capturing the request can read the username and password.

---

## 11 Automation & AI

**Q:** What Python data type is `{"name": "Gi1", "mtu": 1500}`?
**A:** A **dictionary** (key-value pairs).

**Q:** What Python data type is `["R1", "R2", "R3"]`?
**A:** A **list** (ordered, mutable).

**Q:** What does an f-string like `f"{host} is up"` do?
**A:** Inserts the value of the variable `host` into the string.

**Q:** What is the difference between Python's `json.loads()` and `json.dumps()`?
**A:** `loads()` turns a JSON **string into** Python objects; `dumps()` turns Python objects **into** a JSON string.

**Q:** Which Python construct catches an error so a script doesn't crash?
**A:** `try:` / `except:`.

**Q:** In JSON, which quotes must keys and strings use?
**A:** **Double quotes** only — single quotes are invalid.

**Q:** Is a trailing comma allowed in JSON?
**A:** **No** — a comma after the last item makes the JSON invalid.

**Q:** How are true, false and null written in JSON versus Python?
**A:** JSON: `true`, `false`, `null` (lowercase). Python: `True`, `False`, `None`.

**Q:** What is YANG?
**A:** A **data modelling language** (RFC 7950) that describes the configuration and state data a device has. It doesn't configure anything itself.

**Q:** In YANG, what is a container, a list and a leaf?
**A:** **Container**: a group of nodes (one instance, a JSON object). **List**: many entries identified by a **key** (JSON array). **Leaf**: one typed value.

**Q:** In a YANG tree, what do `rw` and `ro` mean?
**A:** `rw` = **configuration** data you can write; `ro` = **state** (operational) data you can only read.

**Q:** Name the three families of YANG models.
**A:** **IETF** (vendor-neutral, common features), **OpenConfig** (operator-written, vendor-neutral), **native** (e.g. `Cisco-IOS-XE-native`, covers everything).

**Q:** What transport and port does NETCONF use, and what encoding?
**A:** **SSH, TCP 830**, with **XML** encoding.

**Q:** What is the difference between NETCONF `<get>` and `<get-config>`?
**A:** `<get>` returns **config and operational state**; `<get-config>` returns **configuration only** from a named datastore.

**Q:** What are the three NETCONF datastores?
**A:** **running** (live), **startup** (boot), **candidate** (scratch copy you edit, then `<commit>`).

**Q:** What makes NETCONF transactional?
**A:** A change is applied **all or nothing** (with lock, validate and commit), so a failure doesn't leave the device half-configured.

**Q:** Which IOS XE command enables NETCONF?
**A:** `netconf-yang`.

**Q:** Which IOS XE commands enable RESTCONF?
**A:** `restconf` plus `ip http secure-server` (and a privilege-15 user for authentication).

**Q:** What transport does RESTCONF use, and what is its URI root?
**A:** **HTTPS (TCP 443)**; the root is `/restconf/data/` for data.

**Q:** Which Content-Type header requests YANG data as JSON over RESTCONF?
**A:** `application/yang-data+json`.

**Q:** RESTCONF PUT versus PATCH?
**A:** **PUT replaces** the whole resource (omitted leaves are removed); **PATCH merges** into it.

**Q:** Which HTTP codes do a successful RESTCONF POST and a successful PATCH return?
**A:** POST: **201 Created**. PATCH: **204 No Content**.

**Q:** What is the difference between HTTP 401 and 403?
**A:** **401** = not authenticated (wrong or missing credentials/token). **403** = authenticated but **not allowed**.

**Q:** What does HTTP 202 mean from Catalyst Center?
**A:** **Accepted** — an asynchronous task was started; poll its **task ID** for the result.

**Q:** How does a script authenticate to the Catalyst Center Intent API?
**A:** POST with Basic auth to `/dna/system/api/v1/auth/token`, then send the token in the **`X-Auth-Token`** header on later calls.

**Q:** Which Catalyst Center API direction is the Intent API?
**A:** **Northbound** (REST, for your scripts and apps).

**Q:** How does a script log in to the SD-WAN Manager API?
**A:** A form POST to **`/j_security_check`**, which returns a **JSESSIONID** cookie; changes also need an **X-XSRF-TOKEN** from `/dataservice/client/token`.

**Q:** Under which path does the SD-WAN Manager REST API live?
**A:** **`/dataservice/`**.

**Q:** What are the two halves of an EEM applet?
**A:** One **event** (the trigger) and one or more **actions** (what to do).

**Q:** Name four EEM event detectors.
**A:** `syslog`, `cli`, `timer`, `track` (also `interface`, `snmp` and `none`).

**Q:** Why is the first CLI action of an EEM applet usually `enable`?
**A:** Applets start in **user EXEC** with no privilege.

**Q:** Why do EEM action labels like `1.0` and `10.0` cause bugs?
**A:** Labels sort **as strings**, so `10.0` runs before `2.0`. Use padded labels like `010`, `020`.

**Q:** What is the default EEM `maxrun`, and when must you raise it?
**A:** **20 seconds**; raise it when the actions (including any `wait`) take longer.

**Q:** Which EEM variable holds the output of the last `cli` action?
**A:** `$_cli_result`.

**Q:** Is Ansible agent-based or agentless, push or pull, and what language are playbooks?
**A:** **Agentless**, **push**, **YAML** playbooks.

**Q:** Are Puppet and Chef agent-based or agentless, and push or pull?
**A:** **Agent-based** and **pull** (Ruby-based DSLs).

**Q:** What does "idempotent" mean in automation?
**A:** Running it twice has the **same effect as once** — if the device is already correct, nothing changes.

**Q:** Is Terraform agent-based, and how does it describe infrastructure?
**A:** **Agentless**; it uses **declarative** HCL configuration and keeps a **state file** of what it built.

**Q:** Predictive AI versus generative AI in network operations?
**A:** **Predictive/analytical** learns baselines and flags anomalies. **Generative** (LLMs) understands and produces language and code, like answering questions or drafting configs.

**Q:** What guardrail must AI-generated config changes pass before reaching production?
**A:** **Human-in-the-loop** approval plus validation (lab test, pre/post checks) through the normal change pipeline.

---

## 12 Route Control: AD, Route Maps & Redistribution

**Q:** What is the AD of a connected route and a static route?
**A:** Connected **0**, static **1**.

**Q:** What is the AD of an EIGRP summary route?
**A:** **5** (the local Null0 discard route).

**Q:** What are the ADs of EIGRP internal and EIGRP external routes?
**A:** Internal **90**, external **170**.

**Q:** What are the ADs of OSPF, IS-IS and RIP?
**A:** OSPF **110**, IS-IS **115**, RIP **120**.

**Q:** What is the AD of NHRP routes, and of a DHCP-learned default route?
**A:** NHRP **250**; DHCP default **254**.

**Q:** What does an AD of 255 mean?
**A:** **Unknown/untrusted** — the route is never installed.

**Q:** What AD must a floating static backing up an OSPF route have?
**A:** **Higher than 110** — e.g. 111 or more.

**Q:** For OSPF, what is the source address in `distance 95 1.1.1.1 0.0.0.0 10`?
**A:** The **router ID of the router that originated the LSA**, not the neighbour's interface IP.

**Q:** Which command changes EIGRP's internal and external AD?
**A:** `distance eigrp 90 170` (with your values) under the EIGRP process.

**Q:** What does the prefix-list entry `10.0.0.0/8 le 24` match?
**A:** Any prefix inside 10/8 with length **8 to 24**.

**Q:** What does the prefix-list entry `0.0.0.0/0 le 32` match?
**A:** **Every** IPv4 route ("permit any").

**Q:** What does the prefix-list entry `0.0.0.0/0` match on its own?
**A:** The **default route only**.

**Q:** What does IOS do if you type `ip prefix-list P permit 10.1.1.0/16`?
**A:** Silently **zeroes the host bits** and stores `10.1.0.0/16`.

**Q:** Why does a standard ACL match routes less precisely than a prefix list?
**A:** It checks only the **network address**, not the **prefix length**.

**Q:** How do route-map clauses process a route?
**A:** **Top to bottom, first match wins**, with an **implicit deny** at the end.

**Q:** In a route-map, are different match types in one clause ANDed or ORed?
**A:** **ANDed**; several values on one match line are **ORed**.

**Q:** What does a route-map clause with no `match` line match?
**A:** **Everything** — used for a final "permit the rest" clause.

**Q:** What does `deny` mean in a PBR route-map?
**A:** **Route normally** (no policy) — not drop.

**Q:** What is the default seed metric when redistributing into EIGRP?
**A:** **Infinite** — the routes aren't advertised until you set a metric.

**Q:** Write a redistribute command that gives EIGRP a usable seed metric.
**A:** `redistribute ospf 1 metric 100000 100 255 1 1500` (bandwidth, delay, reliability, load, MTU).

**Q:** What is the default seed metric and type when redistributing into OSPF?
**A:** Cost **20**, type **E2** (cost **1** for routes from BGP).

**Q:** What is the difference between OSPF E1 and E2 routes?
**A:** **E2** keeps the seed metric everywhere; **E1** adds the internal cost to reach the ASBR.

**Q:** Which OSPF routes does redistribution into BGP take by default?
**A:** Only **internal** (intra- and inter-area) routes, not OSPF externals.

**Q:** Why do two-point mutual redistribution designs create loops?
**A:** A route leaves its domain at one boundary router and comes back in at the other with a **better AD**, so it's preferred over the native path.

**Q:** How do tags prevent redistribution loops?
**A:** Tag routes as they're redistributed (`set tag`), then **deny that tag** (`match tag`) when redistributing in the other direction.

**Q:** Which loop-prevention mechanism never advertises a route out of the interface it was learned on?
**A:** **Split horizon** (RIP and EIGRP).

**Q:** What metric does RIP use for route poisoning?
**A:** **16** (infinity).

**Q:** What does a summary route create locally to prevent loops?
**A:** A **discard route to Null0** for the summary prefix.

**Q:** Which PBR command uses the policy next hop only when the routing table has no explicit route?
**A:** `set ip default next-hop` (a default route doesn't count as explicit).

**Q:** Where must PBR be applied, and what command makes it affect the router's own traffic?
**A:** On the **ingress** interface (`ip policy route-map`); `ip local policy route-map` for locally generated traffic.

**Q:** What does `set ip next-hop verify-availability 203.0.113.1 10 track 1` do?
**A:** Uses that next hop only while **track object 1** is up.

**Q:** What is VRF-Lite?
**A:** VRFs **without MPLS**: separate routing tables on one router, kept apart hop by hop (typically with 802.1Q subinterfaces per VRF).

**Q:** How is BFD detection time calculated?
**A:** **Interval × multiplier** — e.g. 50 ms × 3 = **150 ms**.

**Q:** Which UDP ports does BFD use?
**A:** **3784** single-hop control, **3785** echo, **4784** multihop.

**Q:** What does BFD do when it detects a failure?
**A:** Notifies its **clients** (OSPF, EIGRP, BGP…); it never changes routing itself.

**Q:** What is BFD echo mode?
**A:** Each side sends packets **addressed to itself** that the neighbour's forwarding plane loops back, testing the real data path.

---

## 13 EIGRP

**Q:** Which values must match for two EIGRP routers to become neighbours?
**A:** **AS number, K values, authentication, primary subnet**, and the interface must not be passive.

**Q:** Why don't EIGRP hello and hold timers need to match?
**A:** Each hello carries the **sender's hold time**, which the receiver uses.

**Q:** What log message appears when EIGRP K values differ?
**A:** **K-value mismatch**.

**Q:** An EIGRP neighbour forms, then resets after about 16 retransmissions, repeatedly. What's the likely cause?
**A:** A **one-way path** (e.g. an ACL in one direction): multicast hellos pass, but unicast reliable packets don't.

**Q:** What happens if only one router has a static EIGRP `neighbor` statement?
**A:** The adjacency fails: `neighbor` makes that interface use **unicast** and stop processing multicast hellos.

**Q:** What is EIGRP reported distance (RD)?
**A:** The **neighbour's own metric** to the destination — what it tells you.

**Q:** What is EIGRP feasible distance (FD)?
**A:** **Your best total metric** to the destination (neighbour's RD + your cost to that neighbour).

**Q:** What is the EIGRP feasibility condition?
**A:** A neighbour is a **feasible successor** only if its **RD < the current FD**.

**Q:** Why does RD < FD guarantee a loop-free backup?
**A:** The neighbour is closer to the destination than you are, so its path can't run back through you.

**Q:** What happens when the EIGRP successor fails and a feasible successor exists?
**A:** The FS is promoted **immediately and locally** — no queries, route stays passive.

**Q:** What happens when the EIGRP successor fails and there is no feasible successor?
**A:** The route goes **active** and the router **queries** every neighbour, waiting for all replies.

**Q:** What are EIGRP's active timer and SIA-query timings?
**A:** Active timer **180 s**; an **SIA-query** is sent at **90 s**; no reply by 180 s resets that neighbour.

**Q:** Which command shows which neighbours haven't replied to an EIGRP query?
**A:** `show ip eigrp topology active` (pending replies marked `r`).

**Q:** Why does `eigrp stub` reduce SIA problems?
**A:** The hub **never queries** a stub, so the query domain is bounded.

**Q:** What does `eigrp stub` advertise with no keyword?
**A:** **`connected summary`**.

**Q:** What does `eigrp stub receive-only` advertise?
**A:** **Nothing** — it only learns.

**Q:** Will an EIGRP stub re-advertise a route learned from one neighbour to another?
**A:** **No** — unless it's allowed by a `leak-map`.

**Q:** How many equal-cost paths does EIGRP install by default?
**A:** **4** (`maximum-paths`).

**Q:** What rule does `variance` use to install unequal-cost paths?
**A:** A path is used if it's a **feasible successor** and its metric is **less than FD × variance**.

**Q:** Successor FD is 3000 and a feasible successor's metric is 4000. What is the smallest variance that uses both?
**A:** **2** (4000 ÷ 3000 = 1.33, round up).

**Q:** Which command shows EIGRP paths that are not feasible successors?
**A:** `show ip eigrp topology all-links`.

**Q:** In EIGRP named mode, what goes under `af-interface`?
**A:** Per-interface settings: hello/hold, **passive-interface**, **authentication**, split horizon, summary-address.

**Q:** In EIGRP named mode, what goes under `topology base`?
**A:** Routing-table settings: `variance`, `maximum-paths`, `redistribute`, `distance`, `distribute-list`.

**Q:** Which EIGRP authentication types does classic mode support, and which does named mode add?
**A:** Classic: **MD5** only. Named mode adds **HMAC-SHA-256**.

**Q:** Why does the key ID matter in EIGRP MD5 authentication?
**A:** The packet carries the **key number**; the receiver must have the same key number with the same string.

**Q:** Why does a key chain have separate send and accept lifetimes?
**A:** For **key rollover without an outage**: accept the new key everywhere before any router starts sending it.

**Q:** What source address do EIGRP for IPv6 hellos and next hops use?
**A:** The **link-local** address (hellos to FF02::A).

**Q:** Why does EIGRP for IPv6 still need a 32-bit router ID?
**A:** The router ID is a protocol field (e.g. for tagging externals); with no IPv4 address you must set `eigrp router-id`.

**Q:** In named mode, how do IPv6 interfaces join EIGRP?
**A:** **Automatically** — every IPv6-enabled interface joins; you turn them off rather than on.

**Q:** Why does a DMVPN hub running EIGRP need `no ip split-horizon eigrp`?
**A:** Spoke routes arrive on the tunnel interface, and split horizon would stop the hub advertising them back out the same interface to other spokes.

**Q:** Has EIGRP auto-summary been on or off by default since IOS 15?
**A:** **Off**.

**Q:** What problem does a duplicate EIGRP router ID cause?
**A:** External routes from the other router with the same RID are **ignored** (treated as its own).

---

## 14 OSPFv2/v3

**Q:** What OSPF hello fields must match to form an adjacency?
**A:** **Area ID, hello/dead interval, authentication, subnet mask** (not on p2p) and the **stub area flag**.

**Q:** An OSPF neighbour is stuck in EXSTART/EXCHANGE. What's the classic cause?
**A:** An **MTU mismatch**.

**Q:** An OSPF neighbour is stuck in INIT. What does it mean?
**A:** **One-way communication**: my hellos reach them but theirs don't reach me (ACL or L2 problem).

**Q:** Every OSPF neighbour on a broadcast segment stays in 2WAY/DROTHER. Why?
**A:** All routers have **priority 0**, so no DR can be elected.

**Q:** What problem does a duplicate OSPF router ID between non-adjacent routers cause?
**A:** Routes flap and CPU climbs from LSA **flood wars** (`%OSPF-4-FLOOD_WAR`).

**Q:** What must match for OSPFv3 neighbours besides the usual hello fields?
**A:** The **instance ID** (default 0).

**Q:** What are the default hello and dead timers for non-broadcast and point-to-multipoint networks?
**A:** **30 s / 120 s**.

**Q:** Which OSPF network types need manual `neighbor` statements?
**A:** **Non-broadcast** and **point-to-multipoint non-broadcast**.

**Q:** What does OSPF point-to-multipoint advertise for each endpoint?
**A:** **/32 host routes**, with no DR.

**Q:** What happens with a broadcast versus point-to-point OSPF network type mismatch?
**A:** The adjacency **forms** (both 10/40) but **routes break** — one side expects a DR and Type 2 LSA, the other doesn't.

**Q:** How is a loopback advertised by OSPF by default?
**A:** As a **/32**, unless `ip ospf network point-to-point` is set.

**Q:** What are OSPF LSA types 1, 2 and 3, and who generates them?
**A:** **1** Router (every router), **2** Network (the **DR**), **3** Summary (the **ABR**).

**Q:** What are OSPF LSA types 4, 5 and 7, and who generates them?
**A:** **4** ASBR summary (**ABR**), **5** External (**ASBR**), **7** NSSA external (ASBR in an NSSA).

**Q:** What happens to Type 7 LSAs at the NSSA ABR?
**A:** They're **translated into Type 5** before being flooded into Area 0.

**Q:** Which LSA types does a stub area block, and how does it get a default?
**A:** Blocks **4 and 5**; the ABR injects a **Type 3 default** automatically.

**Q:** Which LSA types does a totally stubby area block?
**A:** **3 (except the default), 4 and 5**.

**Q:** How do you configure a totally stubby area?
**A:** `area 1 stub` on all routers in the area, plus `area 1 stub no-summary` on the **ABR**.

**Q:** Does a plain NSSA get a default route automatically?
**A:** **No** — the ABR needs `area 1 nssa default-information-originate` (a Type 7 default).

**Q:** Does a totally NSSA get a default route automatically?
**A:** **Yes** — `area 1 nssa no-summary` on the ABR injects a **Type 3** default.

**Q:** Can a stub or totally stubby area contain an ASBR?
**A:** **No** — redistribution needs an **NSSA**.

**Q:** What is the OSPF ABR's definition?
**A:** A router with interfaces in **Area 0 and another area**.

**Q:** What is a virtual link configured with, and in which area?
**A:** The **remote router ID**, in the **transit area**: `area 1 virtual-link 3.3.3.3`.

**Q:** What area type can a virtual link's transit area not be?
**A:** **Stub or NSSA** — it must be a normal area.

**Q:** Which area's authentication does an OSPF virtual link inherit?
**A:** **Area 0's** — the virtual link is an Area 0 interface.

**Q:** What is the OSPF route preference order regardless of cost?
**A:** **Intra-area (O) > inter-area (O IA) > E1/N1 > E2/N2**.

**Q:** Two E2 routes have the same metric. What breaks the tie?
**A:** The lower **forward metric** (internal cost to the ASBR).

**Q:** Which OSPFv3 LSA types are new, and what do they carry?
**A:** **Type 8** Link LSA (link-local address and prefixes on one link) and **Type 9** Intra-Area-Prefix LSA (the area's prefixes).

**Q:** Why did OSPFv3 move prefixes out of the router and network LSAs?
**A:** So **renumbering doesn't trigger SPF** — topology and prefixes are separate.

**Q:** How does OSPFv3 authenticate?
**A:** With **IPsec** AH or ESP (or the newer key-chain trailer on recent IOS XE).

**Q:** Why does an OSPFv3 IPv4 address family still need IPv6 on the interface?
**A:** OSPFv3 always **talks over IPv6** link-local addresses.

**Q:** Which command originates a default route into OSPF even without one in the RIB?
**A:** `default-information originate always`.

---

## 15 BGP

**Q:** What are the six BGP neighbour states in order?
**A:** **Idle, Connect, Active, OpenSent, OpenConfirm, Established**.

**Q:** What does a BGP neighbour stuck in Active mean?
**A:** The TCP connection **keeps failing** — e.g. wrong neighbour IP, missing `update-source`, missing `ebgp-multihop`, or TCP 179 blocked.

**Q:** What are the default BGP keepalive and hold timers?
**A:** Keepalive **60 s**, hold **180 s**; both sides use the **lower** proposed hold time.

**Q:** What does BGP neighbour state `Idle (PfxCt)` mean?
**A:** The **maximum-prefix** limit was exceeded and the session was shut down.

**Q:** How does BGP authenticate neighbours?
**A:** A **TCP MD5 signature** on every segment: `neighbor X password KEY`.

**Q:** Why does iBGP peering between loopbacks need `update-source`?
**A:** TCP checks addresses, so packets must come **from the loopback** the peer has configured as the neighbour.

**Q:** Which command lets eBGP peer with a loopback more than one hop away?
**A:** `neighbor X ebgp-multihop 2`.

**Q:** What does `neighbor X ttl-security hops 1` do?
**A:** Sends with TTL **255** and accepts only TTL ≥ 254 (GTSM), blocking spoofed remote packets.

**Q:** What is the iBGP split-horizon rule?
**A:** Routes learned from an iBGP peer are **never advertised to another iBGP peer**.

**Q:** Why doesn't iBGP change the next hop, and what fixes the resulting problem?
**A:** iBGP keeps the original eBGP next hop; `neighbor X next-hop-self` on the border router fixes unreachable next hops.

**Q:** In `show ip bgp`, what does an `(inaccessible)` next hop cause?
**A:** The route can't be best — next-hop reachability is step 0 of best-path.

**Q:** What is the private 2-byte ASN range?
**A:** **64512–65534**.

**Q:** What is the private 4-byte ASN range?
**A:** **4200000000–4294967294**.

**Q:** What is 4-byte ASN 65546 in asdot notation?
**A:** **1.10** (1 × 65536 + 10).

**Q:** What does `no bgp default ipv4-unicast` do?
**A:** Stops IOS activating every neighbour for IPv4 unicast automatically; you `activate` each neighbour in the address family it needs.

**Q:** Which command applies a new inbound BGP policy without dropping the session?
**A:** `clear ip bgp 10.1.12.2 soft in` (route refresh).

**Q:** What does `neighbor X soft-reconfiguration inbound` store, and why use it?
**A:** An **unfiltered copy** of everything received, so `show ip bgp neighbors X received-routes` works for troubleshooting.

**Q:** What is the default BGP weight, and for locally originated routes?
**A:** **0**; **32768** for locally originated routes.

**Q:** What is the scope of BGP weight?
**A:** **This router only** (Cisco-proprietary, never advertised).

**Q:** What is the default LOCAL_PREF, and is higher or lower preferred?
**A:** **100**; **higher** wins.

**Q:** What is the BGP ORIGIN preference order?
**A:** **IGP (i) < EGP (e) < incomplete (?)** — lowest wins.

**Q:** When is MED compared by default?
**A:** Only between paths from the **same neighbouring AS**; lower wins.

**Q:** After IGP metric to the next hop, what are the remaining BGP tie-breakers?
**A:** **Oldest eBGP path**, lowest **router ID**, shortest **cluster list**, lowest **neighbour address**.

**Q:** Which BGP attributes influence your outbound traffic, and which influence inbound?
**A:** **Outbound** (how you leave): weight, LOCAL_PREF. **Inbound** (how others reach you): AS-path prepend, MED.

**Q:** In which direction do you apply LOCAL_PREF and AS-path prepending?
**A:** LOCAL_PREF **inbound** on routes received; AS-path prepend **outbound** toward the less-preferred link.

**Q:** To whom does a route reflector reflect a route learned from a client?
**A:** All **other clients** and all **non-clients**.

**Q:** To whom does a route reflector reflect a route learned from a non-client?
**A:** **Clients only**.

**Q:** Which two attributes does a route reflector add to prevent loops?
**A:** **ORIGINATOR_ID** and **CLUSTER_LIST**.

**Q:** Does a route reflector change the next hop of reflected routes?
**A:** **No** — clients still need a route to the original next hop.

**Q:** What does the AS-path regex `^$` match?
**A:** Routes with an **empty AS path** — routes you originated (used to avoid becoming transit).

**Q:** What does the AS-path regex `_65200$` match?
**A:** Routes **originated** by AS 65200.

**Q:** Which command filters BGP routes using an AS-path access list?
**A:** `neighbor X filter-list N in|out`.

**Q:** What does `neighbor X allowas-in` do, and on which router?
**A:** On the **customer (CE)**, it accepts paths containing its **own AS** (needed when one AS has sites joined through a provider).

**Q:** What does `neighbor X as-override` do, and on which router?
**A:** On the **provider (PE)**, it replaces the customer's AS in the path with the provider's AS when advertising to that customer.

**Q:** What does `maximum-prefix 1000 warning-only` do?
**A:** Keeps the session up and only logs a message when the limit is exceeded.

**Q:** Why must the DMVPN hub be a route reflector when running iBGP with spokes?
**A:** iBGP split horizon would stop the hub passing one spoke's routes to another.

---

## 16 MPLS & DMVPN

**Q:** How big is an MPLS label header, and what fields does it have?
**A:** **32 bits** (4 bytes): **label** (20), **TC/EXP** (3), **S** bottom-of-stack (1), **TTL** (8).

**Q:** What does the MPLS S bit mean?
**A:** **1** on the last label before the IP header (bottom of stack), 0 on labels above it.

**Q:** What does MPLS label 3 (implicit null) do?
**A:** Never appears in a packet; it tells the upstream router to **pop the label** before sending (PHP).

**Q:** What is an LSR versus an LER?
**A:** **LSR** (P router) swaps labels in the core. **LER** (PE router) pushes or pops labels at the edge.

**Q:** What are the three MPLS label operations?
**A:** **Push** (ingress PE), **swap** (P routers), **pop** (penultimate or egress router).

**Q:** What is Penultimate Hop Popping (PHP), and why?
**A:** The router **before** the egress PE pops the label, so the egress PE does one IP lookup instead of a label lookup plus an IP lookup.

**Q:** What ports and address does LDP use?
**A:** **UDP 646** hellos to **224.0.0.2** for discovery; **TCP 646** for the session.

**Q:** LDP discovery works but the session never forms. What's the classic cause?
**A:** The neighbour's **LDP router ID (transport address) isn't reachable** — e.g. its loopback isn't in the IGP.

**Q:** What is the difference between the LIB and the LFIB?
**A:** The **LIB** holds every label binding from every neighbour; the **LFIB** holds only the one outgoing label via the IGP's best next hop.

**Q:** What does an MPLS Route Distinguisher do?
**A:** Makes overlapping customer prefixes **unique** in BGP by prepending a 64-bit value (creating a **VPNv4** prefix).

**Q:** What does an MPLS Route Target do?
**A:** A BGP **extended community** that controls which VRFs **import** a route.

**Q:** How many RDs and RTs can a VPN route carry?
**A:** Exactly **one RD**; **one or many RTs**.

**Q:** In an MPLS L3VPN, what do the outer and inner labels mean?
**A:** **Outer** (LDP transport label): get to the egress PE. **Inner** (VPN label, from MP-BGP): which VRF and prefix at that PE.

**Q:** What command must be on the PE iBGP sessions so Route Targets are sent?
**A:** `neighbor X send-community extended`.

**Q:** In DMVPN, what is the NBMA address versus the tunnel address?
**A:** **NBMA** = the physical, internet-facing (underlay) address. **Tunnel** = the overlay address on the mGRE interface.

**Q:** Which command makes a tunnel interface multipoint GRE?
**A:** `tunnel mode gre multipoint` (no `tunnel destination`).

**Q:** In NHRP, what are the hub and spokes called?
**A:** Hub = **NHS** (Next Hop Server); spokes = **NHCs** (clients).

**Q:** What does an NHRP Registration Request tell the hub?
**A:** The spoke's **tunnel address and NBMA address**, so the hub creates a dynamic mapping.

**Q:** Which NHRP message does a spoke send to learn another spoke's NBMA address?
**A:** An **NHRP Resolution Request** (answered with a Resolution Reply).

**Q:** Which NHRP message does the hub send in DMVPN Phase 3?
**A:** An **NHRP Redirect** (traffic indication), telling the spoke a better direct path exists.

**Q:** Name the main NHRP message types.
**A:** **Registration**, **Resolution**, **Redirect**, **Purge** and **Error**.

**Q:** Which hub command replicates multicast routing hellos to every registered spoke?
**A:** `ip nhrp map multicast dynamic`.

**Q:** Which one-line spoke command defines the hub as NHS with its NBMA address and multicast mapping?
**A:** `ip nhrp nhs 10.0.0.1 nbma 198.51.100.1 multicast`.

**Q:** Does `ip nhrp network-id` need to match between hub and spokes?
**A:** **No** — it's locally significant (but `ip nhrp authentication` must match).

**Q:** What are DMVPN Phase 1, 2 and 3, in one line each?
**A:** **Phase 1**: hub-and-spoke only (p2p GRE spokes). **Phase 2**: spoke-to-spoke triggered by the routing table, no summarization. **Phase 3**: spoke-to-spoke via NHRP redirect/shortcut, summarization allowed.

**Q:** Why can't the hub summarize in DMVPN Phase 2?
**A:** Spoke-to-spoke tunnels are triggered by the **routing table's next hop** (the other spoke), so the specific routes with original next hops must be kept.

**Q:** Which commands enable DMVPN Phase 3?
**A:** `ip nhrp redirect` on the **hub**, `ip nhrp shortcut` on the **spokes**.

**Q:** What routing-table code marks a DMVPN Phase 3 shortcut route?
**A:** **H** (NHRP).

**Q:** Which IPsec mode does DMVPN usually use, and why?
**A:** **Transport mode** — GRE already adds a new IP header with the NBMA addresses.

**Q:** Which command applies IPsec protection to a DMVPN tunnel?
**A:** `tunnel protection ipsec profile PROFILE-NAME`.

**Q:** Which OSPF network type suits DMVPN Phase 2, and what must the hub be?
**A:** **Broadcast**, with the **hub as DR** (spokes `ip ospf priority 0`).

**Q:** Which OSPF network type suits DMVPN Phase 1 and Phase 3?
**A:** **Point-to-multipoint** (next hop rewritten to the hub).

**Q:** Which EIGRP command lets DMVPN Phase 2 spokes see each other as next hop?
**A:** `no ip next-hop-self eigrp 100` on the hub's tunnel interface.

**Q:** What does each `show dmvpn` state mean: IKE, IPsec, NHRP, UP?
**A:** **IKE**: Phase 1 not done. **IPsec**: Phase 2 not up. **NHRP**: crypto up, registration/resolution incomplete. **UP**: all good.

---

## 17 Infrastructure Security

**Q:** What does IOS do when a AAA server returns FAIL?
**A:** **Stops** — login denied; the next method is **not** tried.

**Q:** What does IOS do when a AAA server returns ERROR (no response)?
**A:** Tries the **next method** in the list.

**Q:** Why doesn't IOS fall back to local when the server says "wrong password"?
**A:** That would let anyone the server rejects try again against weaker local accounts — a security hole.

**Q:** Which command tests AAA credentials against a server group without logging in?
**A:** `test aaa group TACACS-GRP user password legacy`.

**Q:** Why should AAA requests be sourced from a loopback?
**A:** The server trusts devices by **source IP**; a loopback gives a stable, registered address (`ip tacacs source-interface Loopback0`).

**Q:** What does the `local` versus `local-case` AAA method change?
**A:** `local-case` makes the **username case-sensitive**; passwords are always case-sensitive.

**Q:** What are the standard numbered ACL ranges?
**A:** **1–99** and **1300–1999**.

**Q:** What are the extended numbered ACL ranges?
**A:** **100–199** and **2000–2699**.

**Q:** Do outbound ACLs filter traffic generated by the router itself?
**A:** **No** — router-originated traffic isn't checked by an outbound ACL on that router.

**Q:** Why do inbound ACLs often break routing protocols?
**A:** The **implicit deny** also drops OSPF (protocol 89), EIGRP (88) and BGP (TCP 179) unless explicitly permitted.

**Q:** What makes a time-based ACL fail after a reboot?
**A:** No NTP — the router judges time by **its own clock**, which may be wrong (`*` in `show clock`).

**Q:** Which command applies an IPv6 ACL to an interface?
**A:** `ipv6 traffic-filter NAME in|out`.

**Q:** What implicit permits does an IPv6 ACL have before its implicit deny?
**A:** **Neighbor Discovery**: NS and NA (`permit icmp any any nd-ns` / `nd-na`).

**Q:** Why does an explicit `deny ipv6 any any` break IPv6 neighbours?
**A:** It matches **before** the implicit ND permits, so NS/NA are dropped — add ND permits above it.

**Q:** What does uRPF strict mode check?
**A:** The best route back to the source must point **out the interface the packet arrived on** (`ip verify unicast source reachable-via rx`).

**Q:** What does uRPF loose mode check?
**A:** That **any route** to the source exists, not via Null0 (`ip verify unicast source reachable-via any`).

**Q:** Why does uRPF strict mode break on asymmetric routing?
**A:** Return traffic arrives on a different interface from the one the router would use to reach the source, so legitimate packets are dropped.

**Q:** What does uRPF `allow-default` change?
**A:** Lets the **default route** satisfy the check (otherwise a source matched only by 0.0.0.0/0 fails).

**Q:** What does uRPF require to work?
**A:** **CEF** must be enabled.

**Q:** Why does a CoPP ACL for BGP need two lines?
**A:** One side uses TCP 179 as **destination**, the other as **source**: `permit tcp any any eq bgp` and `permit tcp any eq bgp any`.

**Q:** How should EIGRP and OSPF be matched in a CoPP ACL?
**A:** By **protocol** (`permit eigrp any any`, `permit ospf any any`) — they have no ports.

**Q:** Which command shows CoPP class counters and drops?
**A:** `show policy-map control-plane`.

**Q:** What does IPv6 RA Guard do?
**A:** Drops **Router Advertisements** (and redirects) on host-facing ports; only ports set as `device-role router` may send them.

**Q:** What does DHCPv6 Guard do?
**A:** Drops DHCPv6 **server** messages (Advertise, Reply) on client-facing ports.

**Q:** What is the IPv6 first-hop security binding table?
**A:** A table of **IPv6 address ↔ MAC ↔ port ↔ VLAN** built by snooping ND and DHCPv6 — the IPv6 counterpart of the DHCP snooping table.

**Q:** What does IPv6 ND Inspection do?
**A:** Checks NS/NA messages against the **binding table** and drops ones claiming an address owned by someone else.

**Q:** What does IPv6 Source Guard do?
**A:** Drops **data traffic** whose source address isn't in the binding table for that port.

**Q:** What can a rogue IPv6 Router Advertisement do to hosts on a link?
**A:** Make itself their **default gateway** (man-in-the-middle), hand out a fake prefix, or send router lifetime 0 to kill the real gateway — which is why **RA Guard** exists.

---

## 18 Infrastructure Services

**Q:** What four things does IOS need before SSH works?
**A:** A **hostname**, an **`ip domain name`**, an **RSA key** (`crypto key generate rsa modulus 2048`) and `ip ssh version 2`.

**Q:** What is the default `exec-timeout` on a line?
**A:** **10 minutes**.

**Q:** What port does TFTP use, and does it authenticate?
**A:** **UDP 69**; **no** authentication.

**Q:** What ports do FTP and SCP use?
**A:** FTP **TCP 21** (plus a data channel); SCP **TCP 22** over SSH.

**Q:** Which command enables the SCP server on a router?
**A:** `ip scp server enable` (with AAA authorization so the user reaches privilege 15).

**Q:** Why does a TFTP copy from a multi-interface router often time out?
**A:** It's sourced from an unexpected interface; fix with `ip tftp source-interface Loopback0`.

**Q:** Why are SNMPv3 users missing from the running configuration?
**A:** Their passwords become **localized keys** tied to the engine ID, so they aren't shown.

**Q:** SNMP v2c polls time out but `show snmp` shows "Unknown community name" rising. What is wrong?
**A:** The NMS is reaching the router with the **wrong community** (the agent silently ignores it).

**Q:** What does `snmp-server ifindex persist` do?
**A:** Keeps **ifIndex numbers** stable across reloads so the NMS's graphs stay attached to the right interfaces.

**Q:** What are the default levels for console, monitor and buffered logging?
**A:** **Debugging (7)** for all three.

**Q:** Which command adds millisecond, local-time timestamps to log messages?
**A:** `service timestamps log datetime msec localtime show-timezone`.

**Q:** What does `service sequence-numbers` help you detect?
**A:** **Lost syslog messages** — gaps in the sequence on the server.

**Q:** Where must `ip helper-address` be configured?
**A:** On the **client-facing** interface/SVI where the DHCP broadcast arrives.

**Q:** How does a DHCP server pick the pool for a relayed request?
**A:** From the **giaddr** — the relay's IP on the interface the request arrived on.

**Q:** What do DHCP options 3, 6 and 150 carry?
**A:** **3** default router, **6** DNS servers, **150** TFTP server IP list (Cisco phones).

**Q:** What does DHCP option 43 carry, and who uses it?
**A:** **Vendor-specific information** — e.g. APs finding their WLC, or PnP devices finding Catalyst Center.

**Q:** What is DHCP option 82?
**A:** **Relay Agent Information**: which switch and port the client is on, inserted by relays or snooping switches.

**Q:** Why can an IOS DHCP server ignore requests from a DHCP-snooping switch?
**A:** The switch inserts **option 82 with giaddr 0**, which IOS treats as untrusted; fix with `ip dhcp relay information trusted` (or disable option 82 insertion).

**Q:** What disables both the IOS DHCP server and relay?
**A:** `no service dhcp`.

**Q:** What do IPv6 RA flags M=0 O=0 mean?
**A:** **SLAAC only** — addresses from SLAAC, DNS from the RA (RDNSS).

**Q:** What do IPv6 RA flags M=0 O=1 mean?
**A:** **Stateless DHCPv6** — address from SLAAC, other info (DNS) from DHCPv6.

**Q:** What does the IPv6 RA flag M=1 mean?
**A:** **Stateful DHCPv6** — the address comes from DHCPv6.

**Q:** What does DHCPv6 never provide?
**A:** A **default gateway** — hosts always learn it from Router Advertisements.

**Q:** Which command relays DHCPv6 on an interface?
**A:** `ipv6 dhcp relay destination 2001:db8::10`.

**Q:** Why probe a public address like 8.8.8.8 instead of the ISP next hop for IP SLA tracking?
**A:** The next hop answers whenever the local link is up, even when the ISP's network behind it is down.

**Q:** Why does an IP SLA probe need a pinned host route to its target?
**A:** Otherwise, after failover, the probe follows the backup route, succeeds, and brings the primary back by mistake.

**Q:** What does `delay down 10 up 30` on a track object do?
**A:** Waits **10 s** before going down and **30 s** before coming back up, so one lost probe or a flap doesn't move traffic.

**Q:** NetFlow v5 versus v9?
**A:** **v5**: fixed record, **IPv4 only**. **v9**: **template-based**, so it can carry IPv6, MPLS and new fields.

**Q:** Which export formats can Flexible NetFlow use?
**A:** **v5, v9 or IPFIX**.

**Q:** A v9 collector receives packets but can't decode them. Why?
**A:** It hasn't received the **template** yet (it started after the template was sent).

**Q:** In Catalyst Center Assurance, how is network health calculated?
**A:** The **percentage of healthy devices** (score 8–10), overall and per site and role.

**Q:** What does Catalyst Center Path Trace show?
**A:** The hop-by-hop **L2/L3 path** between two endpoints and whether **ACLs** along it permit the flow.

**Q:** What does Catalyst Center Assurance "time travel" let you do?
**A:** See the network's **health at a past moment**, for problems that have already cleared.
