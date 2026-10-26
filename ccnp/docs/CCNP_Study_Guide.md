# 🌐 The Super Friendly CCNP Enterprise Study Guide
### ENCOR 350-401 (v1.2) + ENARSI 300-410 (v1.1) — Same Friendly Voice, Professional Depth

> **What is this?** The sequel to the CCNA guide. It teaches everything on the two exams that earn **CCNP Enterprise**: the core exam **ENCOR 350-401 v1.2** (architecture, virtualization, infrastructure, assurance, security, automation and AI) and the concentration exam **ENARSI 300-410 v1.1** (advanced routing, VPNs, infrastructure security and services). Same approach as before — plain language, the *why* behind every mechanism, real configs — but pitched at someone who already holds a CCNA.

> **How it's organised:** **Part I** (Chapters 1–21) follows the ENCOR blueprint. **Part II** (Chapters 22–32) follows ENARSI, and deliberately *builds on* Part I: where ENCOR asks you to describe or configure something, ENARSI asks you to troubleshoot it, so the Part II chapters assume the Part I version and go deeper instead of repeating it. **Part III** is the exam strategy and study plans, followed by two **Blueprint Coverage Maps** (one per exam) that point every official topic at the section that teaches it.

> **What it assumes:** you passed CCNA. Subnetting, VLANs, single-area OSPF, ACLs and the packet walk are not re-taught. Where a chapter builds on something from the CCNA guide it says so — e.g. *(CCNA guide 16.11)* — and **Appendix C** lists the CCNA sections worth re-reading before each part.

> **About the 🔬 depth sections:** a few sections go past what the blueprint asks for — the mechanism underneath rather than the behaviour. They're marked, so you can skip them on a tight timeline.

> **Every chapter opens with a Blueprint line** naming the exact exam topics it covers, so you always know which exam (and which line of it) you're studying for.

---

## 📖 Table of Contents

**Part I — ENCOR 350-401: Enterprise Core**

1. [The CCNP Mindset & Enterprise Network Design](#chapter-1)
2. [High Availability: Redundancy, SSO/NSF & Stacking](#chapter-2)
3. [Layer 2 Revisited: Trunking & EtherChannel Troubleshooting](#chapter-3)
4. [Spanning Tree at CCNP Depth: RSTP, MST & Enhancements](#chapter-4)
5. [Routing Concepts: EIGRP vs OSPF, Path Selection & PBR](#chapter-5)
6. [OSPFv2/v3: Multi-Area, Summarization & Filtering](#chapter-6)
7. [BGP Fundamentals & eBGP](#chapter-7)
8. [Time & Translation: NTP, PTP, NAT/PAT](#chapter-8)
9. [First Hop Redundancy: HSRP & VRRP](#chapter-9)
10. [Multicast](#chapter-10)
11. [QoS](#chapter-11)
12. [Device & Data-Path Virtualization: Hypervisors, VRF, GRE & IPsec](#chapter-12)
13. [Network Virtualization: LISP & VXLAN](#chapter-13)
14. [Catalyst SD-WAN & SD-Access](#chapter-14)
15. [Network Assurance Tools: Debugs, SNMP, Syslog, Flexible NetFlow, SPAN, IP SLA](#chapter-15)
16. [Cisco Catalyst Center: Traditional & AI-Powered Workflows](#chapter-16)
17. [Device Access Control, AAA, ACLs & CoPP](#chapter-17)
18. [Security Design & REST API Security](#chapter-18)
19. [Python & JSON for Network Engineers](#chapter-19)
20. [YANG, NETCONF, RESTCONF & Controller APIs](#chapter-20)
21. [EEM, Orchestration Tools & AI in Operations](#chapter-21)

**Part II — ENARSI 300-410: Advanced Routing & Services**

22. [The Troubleshooting Method & Administrative Distance](#chapter-22)
23. [Route Maps, Prefix Lists & Loop Prevention](#chapter-23)
24. [Redistribution & Summarization](#chapter-24)
25. [PBR, VRF-Lite & BFD](#chapter-25)
26. [EIGRP In Depth](#chapter-26)
27. [OSPF In Depth](#chapter-27)
28. [BGP In Depth](#chapter-28)
29. [MPLS & Layer 3 VPNs](#chapter-29)
30. [DMVPN](#chapter-30)
31. [Infrastructure Security: AAA, ACLs, uRPF, CoPP & IPv6 First-Hop Security](#chapter-31)
32. [Infrastructure Services: Management, SNMP, Logging, DHCP, IP SLA, NetFlow & Assurance](#chapter-32)

**Part III — Passing Both Exams**

33. [Exam Strategy & Study Plans](#chapter-33)

**Appendices**

- [Appendix A: ENCOR 350-401 v1.2 Blueprint Coverage Map](#blueprint-encor)
- [Appendix B: ENARSI 300-410 v1.1 Blueprint Coverage Map](#blueprint-enarsi)
- [Appendix C: The CCNA Foundations to Re-Read First](#bridge)
- [Glossary](#glossary)

---

<a name="part-1"></a>
# Part I — ENCOR 350-401: Enterprise Core

ENCOR is the **core** exam: required for CCNP Enterprise, and also the qualifying exam for **CCIE Enterprise Infrastructure**. (Since 19 March 2026 the CCIE Enterprise Wireless track has its own core exam, **WLCOR 350-101**, which is why v1.2 could drop wireless.) It is wide rather than deep — six domains running from campus design to Python — and v1.2 (live since **19 March 2026**) renamed the last domain **Automation and Artificial Intelligence**, adopted the current product names (Catalyst Center, SD-WAN Manager) and dropped the wireless topics that v1.1 carried.

| Domain | Weight | Chapters |
|--------|--------|----------|
| 1.0 Architecture | 15% | 1, 2, 9, 11, 14 |
| 2.0 Virtualization | 10% | 12, 13 |
| 3.0 Infrastructure | 30% | 3–10 |
| 4.0 Network Assurance | 10% | 15, 16, 20 |
| 5.0 Security | 20% | 17, 18 |
| 6.0 Automation and Artificial Intelligence | 15% | 19, 20, 21 |

*Infrastructure is almost a third of the exam on its own — Chapters 3 to 10 are where the marks are.*

---

<a name="chapter-1"></a>
# Chapter 1: The CCNP Mindset & Enterprise Network Design

> **Blueprint:** ENCOR 1.1 — Explain the different design principles used in an enterprise network; ENCOR 1.1.a — High-level enterprise network design such as 2-tier, 3-tier, fabric, and cloud.

## 1.1 You Passed CCNA. What Actually Changes Now?

Congratulations — you've proven you understand how a network works. CCNP asks a different question. CCNA was mostly **"what does this do, and how do I turn it on?"** CCNP is **"which way should I build this, what breaks when it gets big, and how do I prove it's working?"**

That sounds like a small shift. It isn't. Here's what it looks like in practice:

| CCNA asked you… | CCNP asks you… |
|-----------------|----------------|
| Configure OSPF on two routers | Design OSPF for 400 routers so one flapping link doesn't make all 400 recalculate |
| What does HSRP do? | HSRP or VRRP? What's the failover time? What happens to the ARP caches of 2,000 hosts? |
| Which port does STP block? | Why did the root bridge move at 3 a.m., and which guard would have stopped it? |
| What is a VLAN? | Should this VLAN span the whole building, or should we route at the access layer? |
| Is the link up? | Is the path *meeting its SLA* right now, and how would you know before the users do? |

**Why does the exam care so much about "why" and "which"?** Because at the professional level, almost every technology has **two or three valid ways** to do the same job, and each comes with a cost. A spanning-tree design is simpler to understand but wastes links; a routed-access design uses every link but needs more IP planning. A big flat OSPF area is easy to configure but fragile at scale; multi-area is robust but needs summarization discipline. CCNP questions are built around those trade-offs, so memorized commands alone won't carry you. *You're no longer being tested on whether you know the tool — you're being tested on whether you'd pick the right one.*

### The Three Habits That Carry You Through Both Exams

1. **Think in failure domains.** For every design, ask: "if *this* breaks, how much of the network notices?" The answer should always be "as little as possible." You'll see this idea in every chapter — OSPF areas, STP scope, VRFs, EtherChannel, even QoS.
2. **Think in planes.** Every network device does three separate jobs: the **data plane** forwards packets, the **control plane** decides where they should go (OSPF, BGP, STP), and the **management plane** is how *you* talk to the box (SSH, SNMP, NETCONF). Problems — and security — live in one plane at a time. SD-WAN, SD-Access and Catalyst Center all start by pulling one of these planes apart (Chapters 14 and 16).
3. **Prove it.** At CCNA, "it pings" was success. At CCNP, success is measurable: an IP SLA probe is green, NetFlow shows the traffic took the path you designed, the adjacency has been FULL for 40 days. Chapters 15 and 32 are all about this.

### How This Guide Is Laid Out

- **Part I (Chapters 1–21)** follows the **ENCOR 350-401 v1.2** blueprint — the core exam everyone must pass. It's broad: design, switching, routing, services, virtualization, assurance, security and automation.
- **Part II (Chapters 22–32)** follows **ENARSI 300-410 v1.1** — the advanced routing concentration. It's narrow and deep, and most of its blueprint verbs are **"Troubleshoot"**. Those chapters assume the matching ENCOR chapter and go further.
- **Part III** holds the exam strategy, study plans, a coverage map for **every** blueprint line of both exams, and the glossary.

> **What's assumed:** CCNA is the floor. Subnetting in your head, the packet walk (CCNA guide 14.8), single-area OSPF and its internals (CCNA guide 16.10–16.11), STP mechanics (CCNA guide 9.10–9.11), and basic ACLs. If any of those feel shaky, re-read them now — this guide builds on them without stopping.

## 1.2 The Design Principles Behind Every Enterprise Network

Before any specific architecture, there are a handful of principles every good design follows. Every design choice in this chapter is one of these principles applied to a specific situation.

| Principle | What it means | What it buys you |
|-----------|---------------|------------------|
| **Hierarchy** | Split the network into layers, each with one job | Predictable traffic paths; each layer can be sized and changed on its own |
| **Modularity** | Build in repeatable blocks (a building, a data center pod, a branch) | Grow by adding a block, not redesigning; one block's failure stays in that block |
| **Resiliency** | No single point of failure on important paths | Failures cause a blip instead of an outage (Chapter 2) |
| **Flexibility** | Leave room to add services without a redesign | New VLANs, new sites, new overlays slot in |
| **Simplicity** | The fewest moving parts that meet the requirements | Fewer things to break; faster troubleshooting at 3 a.m. |

**Why is "simplicity" listed as a design principle, when it sounds like an absence of design?** Because every feature you add is something that can fail, something to configure consistently across hundreds of devices, and something the next engineer has to understand while the network is down. Redundancy is good — but two redundant paths you understand beat four you don't. *A design you can't troubleshoot under pressure is not a resilient design, no matter how many backup links it has.*

### Failure Domains — The Idea Underneath Everything

A **failure domain** is the part of the network affected when one thing breaks. Some examples you already know:

| Thing that fails | Failure domain | How designs shrink it |
|------------------|----------------|------------------------|
| A broadcast storm in a VLAN | Every port in that VLAN, on every switch it spans | Keep VLANs small and local; route between them |
| An STP topology change | Every switch in that spanning-tree instance | Routed access; fewer switches per L2 domain |
| A flapping OSPF link | Every router in that **area** (they all rerun SPF) | Multi-area design with summarization (Chapter 6) |
| A core switch reload | Everything behind it, unless there's a redundant peer | Dual cores, dual uplinks, SSO (Chapter 2) |

**Why do "small failure domains" and "routing instead of switching" keep showing up together?** Because Layer 2 is a **flooding** technology: unknown unicast, broadcast and STP changes all spread across the whole VLAN. Layer 3 is a **summarizing** technology: a router can hide a thousand prefixes behind one summary and simply not tell the rest of the network about local chaos. *Every time you move a routing boundary closer to the edge, you shrink how far a problem can spread.*

## 1.3 The Three-Tier Hierarchical Campus

You met this in CCNA (guide 1.7). At CCNP you need to know *why each layer does what it does*, and *what goes wrong* when layers blur.

![Three-tier campus versus collapsed core](images/c01_tiers.png)

| Layer | Job | What lives here | What should NOT live here |
|-------|-----|-----------------|---------------------------|
| **Access** | Connect endpoints | Access ports, PoE, port security, 802.1X, QoS marking/trust, BPDU guard | Complex policy, inter-site routing |
| **Distribution** | Aggregate access, enforce policy, be the L2/L3 boundary | SVIs and FHRP gateways, route summarization, ACLs, STP root | End users |
| **Core** | Move packets between distribution blocks as fast as possible | High-speed L3 links, fast-converging routing | Policy, filtering, anything that slows forwarding or fails often |

**Why should the core be "dumb and fast"?** Because the core is the one place where **everything** passes through. Any feature there — an ACL, a QoS policy, NAT — is applied to every packet in the network, and any bug in that feature can take down every building at once. Keep the core to one job (forward, converge fast) and push intelligence out to the distribution layer, where a mistake only affects one block. *The core is the spine of the network; you want it boring.*

**Why is the distribution layer where summarization happens?** Because each distribution pair sits at the edge of a block — a building, a floor group — and knows every subnet inside it. If it advertises one summary (`10.20.0.0/16`) toward the core instead of 200 specific /24s, two good things happen: the core's routing table stays small, and a subnet flapping in that building **doesn't propagate** past the distribution layer, because the summary stays up as long as *any* component is up. *Summarization is how the distribution layer turns "something changed in building 20" into "nothing changed" for everyone else.*

### When Do You Need a Separate Core?

The core exists to stop distribution blocks from needing a full mesh to each other. With **n** distribution pairs and no core, each pair needs links to every other pair:

| Distribution blocks | Full-mesh links needed — n(n−1)/2 | With a core: links per block |
|---------------------|-----------------------------------|------------------------------|
| 2 | 1 | not needed |
| 4 | 6 | 2 uplinks each |
| 8 | 28 | 2 uplinks each |
| 16 | 120 | 2 uplinks each |

Once you have more than about three distribution blocks, the mesh becomes unmanageable and a core pays for itself.

## 1.4 Two-Tier (Collapsed Core)

In a smaller site — one building, a few floors — the distribution and core roles are **collapsed** into one pair of switches. Access switches uplink to that pair, and that pair also connects to the WAN edge and data center.

**Why is collapsed core the most common real-world campus design?** Because most sites don't have enough distribution blocks to justify a separate core (see the table above). Collapsing saves two or more expensive chassis, their power and cabling, and an entire tier of configuration — and you can always split the core out later if the site grows. *Hierarchy is a logical idea first; you only build the physical tier when the scale demands it.*

| Design | Fits | Pros | Cons |
|--------|------|------|------|
| **Two-tier (collapsed core)** | Single building, small/medium campus | Cheaper, fewer devices, simpler | Doesn't scale past a few blocks; core and distribution failures are the same failure |
| **Three-tier** | Large multi-building campus | Scales by adding blocks; clear roles | More devices, more cost, more config |

## 1.5 Where Layer 2 Ends: Three Access-Distribution Models

The single most important campus design decision is **where Layer 2 stops and Layer 3 begins**. There are four common answers.

| Model | L2/L3 boundary | STP's role | FHRP needed? | VLANs can span access switches? |
|-------|----------------|-----------|--------------|--------------------------------|
| **Layer 2 access (looped)** | Distribution | Blocks one uplink per VLAN | Yes, at distribution | Yes |
| **Layer 2 access (loop-free / "V")** | Distribution | Present but nothing to block | Yes | No (each VLAN local to one access switch) |
| **Routed access** | **Access switch** | Only on edge ports (no switch-to-switch loops) | **No** — the access switch *is* the gateway | No |
| **Virtual switching (StackWise Virtual / VSS)** | Distribution (one logical switch) | Present, but nothing blocks — uplinks are one EtherChannel | No — one logical gateway | Yes |

**Why does routed access make spanning tree nearly irrelevant?** Because every access-to-distribution uplink becomes a routed point-to-point link. Routed links don't carry broadcasts or BPDUs between switches, so there's no Layer 2 loop to break and nothing for STP to block. Both uplinks forward at once, using **ECMP** (equal-cost multipath) in OSPF or EIGRP, and if one fails, the routing protocol reconverges in well under a second with tuned timers or BFD (Chapter 25). *Routed access trades VLAN flexibility for speed, full link utilization, and a tiny failure domain.*

**So why isn't everyone using routed access?** Because some applications still need a VLAN to exist in more than one closet — wireless controllers in older designs, certain building-management systems, or an application that expects hosts in the same subnet. Routed access can't stretch a VLAN. That need, at scale, is exactly what overlays like **VXLAN** and **SD-Access** solve: run a routed underlay for stability, and stretch Layer 2 *virtually* on top of it (Chapters 13 and 14).

> **Exam trap:** in the looped Layer 2 model, the **STP root** and the **HSRP/VRRP active gateway** for each VLAN should be the **same distribution switch**. If they're split, traffic from a host goes up a blocked-path detour: it crosses the access switch to the STP root, then over the inter-distribution link to the active gateway. Chapter 4 (4.1) and Chapter 9 come back to this.

## 1.6 Fabric Designs: Spine-Leaf

Data centers carry mostly **east-west** traffic (server to server: app tier to database, VM to storage), not the **north-south** traffic (users to the internet) that a campus mostly carries. A three-tier tree is built for north-south; for east-west it sends traffic up and down the tree through a core that becomes a bottleneck.

**Spine-leaf** fixes this with a simple rule: **every leaf connects to every spine, leaves never connect to each other, spines never connect to each other.**

![Spine-leaf fabric](images/c01_spine_leaf.png)

| Property | Why it matters |
|----------|----------------|
| Any leaf to any leaf is **always exactly two hops** (leaf → spine → leaf) | Latency is predictable no matter where workloads sit |
| Every leaf has **equal-cost paths** through every spine | ECMP spreads load across all spines; no STP blocking |
| Need more bandwidth? **Add a spine.** Need more ports? **Add a leaf.** | Scales out horizontally instead of buying a bigger box |
| A spine failure removes **1/n of the capacity**, not connectivity | Graceful degradation |

**Why is the underlay in a fabric almost always routed (OSPF, IS-IS or eBGP)?** Because the whole point is to use **every** spine link at once. Spanning tree would block all but one path to each spine; a routing protocol happily installs every equal-cost path. Workloads still often need Layer 2 adjacency (VM mobility across racks), so a **VXLAN overlay** carries Layer 2 over the routed fabric (Chapter 13). *This "routed underlay + overlay" pattern is the single most important architecture idea in modern Cisco design — SD-Access, SD-WAN and data-center fabrics all use it.*

**The word "fabric" in the blueprint** means exactly this pattern: a physical underlay that's simple, routed, and redundant, plus a logical overlay that gives you the segmentation and mobility you want. In the campus, Cisco's fabric is **SD-Access** (Chapter 14).

## 1.7 The WAN Edge and Branches

The enterprise doesn't end at the campus. Sites connect through a **WAN edge**, and the design questions change: links are slower, more expensive, and owned by someone else.

| WAN option | What it is | Typical use |
|------------|-----------|-------------|
| **MPLS L3VPN** | Provider-run private network; provider routes your traffic between sites | Predictable SLA, voice/video between sites (Chapter 29) |
| **Internet + IPsec / DMVPN** | Encrypted tunnels over cheap broadband | Low cost, flexible, hub-and-spoke or spoke-to-spoke (Chapters 12, 30) |
| **Metro Ethernet** | Provider gives you a Layer 2 circuit | Sites in the same city |
| **Cellular (4G/5G)** | Wireless WAN link | Backup or temporary sites |
| **SD-WAN** | Controller-managed overlay across **all** of the above | Uses every transport at once, picks paths per application (Chapter 14) |

Branch designs are usually described by redundancy: **single router, single link** (cheapest, no redundancy), **single router, dual links** (protects against carrier failure), and **dual routers, dual links** (protects against both carrier and hardware failure — the two routers run an FHRP on the LAN side).

**Why did SD-WAN take over the WAN edge?** Because traditional WAN designs made you choose: expensive MPLS for quality, or cheap internet for bandwidth, with failover only when a link dies completely. SD-WAN measures loss, latency and jitter on *every* path continuously and steers each application onto whichever path currently meets its needs — voice over MPLS, Microsoft 365 straight out the local internet link. *The WAN went from "primary and backup" to "all paths, all the time, chosen per app."*

## 1.8 Cloud and Hybrid Designs

Some of the "network" now lives in someone else's data center.

| Model | You manage | Provider manages | Example |
|-------|------------|------------------|---------|
| **On-premises** | Everything | Nothing | Your own data center |
| **IaaS** | OS, apps, data, virtual network design | Hardware, hypervisor, physical network | AWS EC2, Azure VMs |
| **PaaS** | Apps and data | Everything underneath | Managed databases, app platforms |
| **SaaS** | Your data and users | The whole application | Microsoft 365, Webex |

| Deployment | Meaning |
|------------|---------|
| **Public cloud** | Shared provider infrastructure, rented on demand |
| **Private cloud** | Cloud-style self-service on infrastructure dedicated to one organization |
| **Hybrid cloud** | On-prem and public cloud connected and used together |
| **Multicloud** | More than one public cloud provider in use |

**How do you actually connect to a cloud?** Three common ways: an **IPsec VPN over the internet** (cheap, quick, variable performance), a **dedicated private circuit** such as AWS Direct Connect or Azure ExpressRoute (predictable, costs more, usually runs eBGP to the provider — Chapter 7), or an **SD-WAN cloud on-ramp**, where virtual SD-WAN routers run inside the cloud and join your fabric.

**Why does cloud change network design at all, if it's "just another site"?** Because traffic patterns flip. When applications lived in your data center, branch traffic hairpinned through headquarters and the HQ firewall. With SaaS, sending a branch's Microsoft 365 traffic across the WAN to HQ, out HQ's internet, and back adds latency for no benefit. Modern designs use **direct internet access (DIA)** at branches for trusted SaaS, with security delivered in the cloud. *The center of gravity moved off-site, so the WAN design had to follow it.*

## 1.9 Choosing a Design — Putting It Together

| Situation | Sensible starting design | Why |
|-----------|-------------------------|-----|
| One building, ~500 users | Two-tier collapsed core, L2 access with StackWise Virtual pair | Cheap, simple, no blocked links |
| Large campus, many buildings | Three-tier, routed or virtual-switching distribution, summarization at distribution | Scales by block, small failure domains |
| Campus that needs segmentation and mobility at scale | SD-Access fabric | Routed underlay, VXLAN overlay, policy by group |
| Data center | Spine-leaf with VXLAN EVPN overlay | Predictable east-west, scale-out |
| Many branches, mixed transports | SD-WAN | Per-app path selection across MPLS, internet, LTE |

*Every row is the same few principles — hierarchy, modularity, small failure domains, and the simplest thing that meets the requirement — applied to a different situation.* When an exam question describes a scenario and asks for "the best design," find the requirement that dominates (scale? cost? east-west traffic? segmentation?) and the answer usually picks itself.

---

<a name="chapter-2"></a>
# Chapter 2: High Availability: Redundancy, SSO/NSF & Stacking

> **Blueprint:** ENCOR 1.1.b — High availability techniques such as redundancy, FHRP, and SSO.

## 2.1 What "Highly Available" Actually Means

**Availability** is the fraction of time a service works. It's quoted in "nines," and each extra nine cuts the allowed downtime tenfold:

| Availability | Downtime per year | Downtime per month |
|--------------|-------------------|--------------------|
| 99% ("two nines") | ~3.65 days | ~7.3 hours |
| 99.9% | ~8.8 hours | ~44 minutes |
| 99.99% | ~53 minutes | ~4.4 minutes |
| **99.999% ("five nines")** | **~5.3 minutes** | **~26 seconds** |

**Why do the nines matter for design, not just for contracts?** Because five nines allows only about five minutes of downtime a *year*. A single router reboot takes longer than that. So a five-nines target is impossible with any single device, however reliable, and that one fact forces every high-availability technique in this chapter. *You don't reach five nines by buying a better box. You reach it by making sure that when any one box fails, nobody notices.*

High availability has two halves, and good designs need both:

1. **Redundancy:** have a second one of everything that matters (link, device, power supply, supervisor, path).
2. **Fast failover:** when the first one fails, switch to the second one **fast enough that applications don't break**. A redundant path that takes 50 seconds to start forwarding (classic STP) is redundancy without availability.

**What does "fast enough" mean?** Roughly: a TCP session survives a few seconds of loss; a voice call starts to break up after ~150–200 ms of loss and drops after a few seconds; some trading and industrial applications care about tens of milliseconds. Those are the targets the techniques below are aiming at.

## 2.2 The Layers of Redundancy

Redundancy has to exist at every layer, because a failure at any one of them is still an outage.

| Layer | Single point of failure | Redundancy technique | Chapter |
|-------|-------------------------|----------------------|---------|
| Power | One PSU, one circuit | Dual PSUs on separate circuits/UPS | — |
| Supervisor / route processor | One control-plane CPU | Dual supervisors with **SSO** | 2.3 |
| Chassis / switch | One switch | **Stacking**, **StackWise Virtual**, dual devices | 2.5–2.6 |
| Link | One cable | **EtherChannel**, ECMP routing | 3, 5 |
| Default gateway | One router IP for hosts | **FHRP** (HSRP, VRRP, GLBP) | 2.4, 9 |
| Layer 2 path | One forwarding path | STP alternate ports (RSTP), virtual switching | 4 |
| Layer 3 path | One route | Dynamic routing + **BFD** for fast detection | 5, 25 |
| WAN / site | One carrier | Dual carriers, SD-WAN | 1.7, 14 |

**Why isn't adding a second device enough on its own?** Because the second device only helps if the network **knows to use it** — and knows quickly. Two routers with no FHRP still leave hosts pointing at one dead IP; two uplinks with classic STP still sit 30–50 seconds in listening/learning. *Redundancy is the spare tire; the failover mechanism is knowing how to change it in seconds.*

## 2.3 Supervisor Redundancy: RPR, SSO and NSF

A modular switch (Catalyst 9400/9600) or a router with two route processors has two control-plane "brains." The question is how ready the standby brain is when the active one dies.

| Mode | Standby state | Switchover time | What's lost |
|------|---------------|-----------------|-------------|
| **RPR** (Route Processor Redundancy) | Partially booted; config not fully applied | Minutes (line cards reset) | Everything — traffic stops |
| **SSO** (Stateful Switchover) | **Fully booted**, config and state synchronized continuously | ~1–3 seconds or less | Routing adjacencies must re-form — unless NSF is on |

With **SSO**, the active supervisor continuously copies its startup and running configuration, plus Layer 2 protocol state, the **FIB** (forwarding table) and adjacency tables, to the standby. When the active fails, the standby takes over with the line cards still forwarding.

**Why doesn't SSO alone give you a hitless failover for routing?** Because routing protocols run on the supervisor CPU, and their *sessions with neighbors* don't survive the switchover. The new active supervisor has to re-form OSPF, EIGRP and BGP adjacencies. Worse, when a neighbor sees an adjacency drop, it assumes the whole router died and **reroutes around it** — throwing away a forwarding path that's actually still working, because the line cards never stopped. That's what NSF fixes.

### NSF and Graceful Restart

**NSF (Non-Stop Forwarding)** keeps the data plane forwarding on the **last known FIB** during a switchover, while the control plane rebuilds. It works hand-in-hand with **graceful restart** in the routing protocols:

| Role | Meaning |
|------|---------|
| **NSF-capable** | The restarting router itself — has dual supervisors with SSO, can keep forwarding while its control plane restarts |
| **NSF-aware** | A neighbor that understands graceful restart — when the restarting router says "I'm restarting, keep using me," it **holds the routes** instead of tearing them down |

The sequence is:

1. Active supervisor fails; the standby takes over via SSO. Line cards keep forwarding using the existing FIB.
2. The new active supervisor signals its neighbors (OSPF uses grace LSAs or Cisco's link-local signaling; BGP uses the graceful-restart capability negotiated when the session came up).
3. NSF-aware neighbors **don't** drop the routes. They help the restarting router resynchronize its databases.
4. The restarted control plane rebuilds the RIB, refreshes the FIB, and stale entries are flushed.

**Why do the neighbors need to cooperate?** Because the restarting router can't stop its neighbors from reacting to a dropped adjacency. If they don't understand graceful restart, they reroute anyway, and the failover becomes a visible outage. *NSF is a team agreement: "I'm only rebooting my brain, not my hands — please keep sending me packets."*

```
! Supervisor redundancy (default on most dual-sup platforms)
SW(config)# redundancy
SW(config-red)# mode sso

! Graceful restart per routing protocol
SW(config)# router ospf 1
SW(config-router)# nsf ietf              ! RFC 3623 graceful restart (or: nsf cisco)
SW(config)# router eigrp 100
SW(config-router)# nsf
SW(config)# router bgp 65001
SW(config-router)# bgp graceful-restart
```

```
SW# show redundancy states
       my state = 13 -ACTIVE
     peer state = 8  -STANDBY HOT
           Mode = Duplex
 Redundancy Mode (Operational) = sso
 Redundancy Mode (Configured)  = sso
```

**Read it:** `STANDBY HOT` is what you want — the peer is fully synchronized and ready for a stateful switchover. A peer stuck in `STANDBY COLD` means it's running RPR-style (often due to a software or configuration mismatch between supervisors), and a failover will be disruptive.

> **Exam trap:** NSF and **fast-converging** timers pull in opposite directions. NSF wants neighbors to *wait* through a restart; very aggressive hello/dead timers or BFD want neighbors to *detect failure instantly*. If BFD declares the neighbor down in 150 ms, it can tear down the adjacency before graceful restart finishes. On dual-supervisor boxes, set timers so that a supervisor switchover completes inside them.

## 2.4 First Hop Redundancy — The Architecture

Hosts are configured with **one** default gateway IP. If that router dies, the host can't reach anything off-subnet, however many other routers exist. A **First Hop Redundancy Protocol (FHRP)** lets two or more routers share a **virtual IP and virtual MAC**, so the gateway the hosts know never disappears.

| FHRP | Standard | Roles | Load balancing within one VLAN | Default timers (hello/hold) |
|------|----------|-------|---------------------------------|------------------------------|
| **HSRP** | Cisco | Active / Standby | No (split VLANs between routers instead) | 3 s / 10 s |
| **VRRP** | IETF (RFC 5798 for v3) | Master / Backup | No | 1 s advertisement / ~3.6 s master-down interval |
| **GLBP** | Cisco | AVG / AVF | **Yes** — different hosts get different virtual MACs | 3 s / 10 s |

**Why is the FHRP decision an architectural one, not just a config detail?** Because it has to line up with everything else in the design:

- In a **looped Layer 2 access** design, the FHRP active router for a VLAN should also be the **STP root** for that VLAN (Chapter 4), or traffic takes a detour across the inter-distribution link.
- Spreading load means making **different routers active for different VLANs** (odd VLANs on one distribution switch, even on the other), because HSRP and VRRP don't balance within one VLAN.
- In **routed access**, there's no FHRP at all — the access switch is the only gateway.
- In **StackWise Virtual / VSS**, there's no FHRP either — the two physical switches are one logical gateway with one IP.

Chapter 9 covers HSRP and VRRP configuration, priority, preemption and object tracking in detail.

## 2.5 Stacking: Many Switches, One Brain

**StackWise** (on Catalyst 9200 and 9300, e.g. StackWise-480 on the 9300) joins up to eight access switches with dedicated stacking cables into **one logical switch**: one management IP, one configuration, one control plane.

| Stack role | Job |
|-----------|-----|
| **Active** | Runs the control plane and management for the entire stack |
| **Standby** | Synchronized via **SSO**; takes over if the active fails |
| **Members** | Forward traffic using tables programmed by the active |

The active is elected by: (1) the current active keeps the role (the election is not preemptive), (2) highest **stack priority** (1–15, default 1), then platform tiebreakers ending in (3) the **lowest MAC address**. Because the election only happens when the stack boots or the active fails, pin the active and standby deliberately:

```
Stack# switch 1 priority 15        ! privileged EXEC, not config mode
Stack# switch 2 priority 14        ! intended standby
Stack# show switch
Switch/Stack Mac Address : 7c21.0e5a.1b00 - Local Mac Address
                                             H/W   Current
Switch#   Role    Mac Address     Priority Version  State
-------------------------------------------------------------
*1       Active   7c21.0e5a.1b00     15     V01     Ready
 2       Standby  7c21.0e5a.2c80     14     V01     Ready
 3       Member   7c21.0e5a.3d00     1      V01     Ready
```

**Why is a stack better than separate access switches?** Two reasons. First, **cross-stack EtherChannel**: an uplink bundle can use one port on switch 1 and one on switch 3, so losing a whole switch only loses half the uplink bandwidth — with no STP blocking, because the bundle is one logical link. Second, **operational simplicity**: eight switches managed as one. *A stack turns "eight devices, eight configs" into "one device with eight line cards."*

## 2.6 StackWise Virtual (and VSS Before It)

**StackWise Virtual (SV)** does the same thing for **two distribution or core switches** (Catalyst 9400/9500/9600): two physical chassis become **one logical switch** with one control plane. Its predecessor, **VSS** (Virtual Switching System), did the same on the Catalyst 6500/6800 and 4500-X.

![StackWise Virtual pair with multichassis EtherChannel](images/c02_svl.png)

| Component | Purpose |
|-----------|---------|
| **StackWise Virtual Link (SVL)** | High-speed EtherChannel between the two switches carrying control traffic and data that has to cross between them (VSS called this the **VSL**) |
| **Dual-Active Detection (DAD) link** | Separate link used *only* to detect the case where the SVL fails but both switches are alive |
| **Multichassis EtherChannel (MEC)** | An access switch's uplink bundle with one member to each physical switch — looks like one ordinary EtherChannel to the access switch |
| **One active control plane** | One switch runs the control plane and management; the other is **SSO standby**. Both forward data. |

**Why does StackWise Virtual remove the need for both STP blocking and FHRP?** Look at what the access switch sees: one upstream "switch" and one EtherChannel to it. A single logical link has no loop for STP to block, so **every uplink forwards**. And because there's only one logical distribution switch, there's only one gateway SVI — nothing for HSRP to fail over between. Failover becomes "an EtherChannel member went down," which takes milliseconds. *You get the redundancy of two boxes with the simplicity of one.*

**Why is the Dual-Active Detection link essential?** Imagine the SVL fails while both switches are still running. The standby no longer hears the active, assumes it died, and becomes active too. Now there are **two** switches using the same IP addresses, the same router ID and the same MAC addresses — a **dual-active** split brain that corrupts routing, ARP and the forwarding tables of every neighbor. The DAD link (or ePAgP through an access switch) lets the switches discover that they're both alive. The switch that was formerly the active goes into **recovery mode**, shuts down all its non-SVL interfaces, and waits for the SVL to come back. *Losing half the box is a minor event; having two boxes both believe they're the whole box is a disaster.*

```
! On each switch, before conversion (then reload both)
SW1(config)# stackwise-virtual
SW1(config-stackwise-virtual)# domain 10
SW1(config)# interface range TenGigabitEthernet1/0/47 - 48
SW1(config-if-range)# stackwise-virtual link 1          ! these form the SVL
SW1(config)# interface TenGigabitEthernet1/0/46
SW1(config-if)# stackwise-virtual dual-active-detection ! DAD link
SW1# write memory
SW1# reload

SW# show stackwise-virtual          ! domain, switches, SVL members
SW# show stackwise-virtual link     ! SVL port state: should be U (up)
SW# show stackwise-virtual dual-active-detection
SW# show redundancy states          ! one ACTIVE, one STANDBY HOT
```

After conversion, interfaces are numbered with the switch number first, so the same port appears as `Te1/0/1` on switch 1 and `Te2/0/1` on switch 2. A multichassis EtherChannel then uses one interface from each.

### Comparing the Options

| Technique | Scope | Control planes | FHRP needed | STP blocks uplinks |
|-----------|-------|----------------|-------------|--------------------|
| Two independent switches + HSRP | Distribution | 2 | Yes | Yes (looped L2) |
| **StackWise** | Access (up to 8) | 1 (active + SSO standby) | n/a at access | No, with cross-stack EtherChannel |
| **StackWise Virtual / VSS** | Distribution / core (2) | 1 (active + SSO standby) | **No** | **No** (MEC) |
| Routed access | Access to distribution | 1 per switch | **No** | **No** (no L2 uplinks) |

## 2.7 ISSU — Upgrading Without an Outage

Software has to be upgraded, and a reboot costs minutes — which blows the five-nines budget in one go. **ISSU (In-Service Software Upgrade)** uses the SSO pair to upgrade one half at a time:

1. Load the new image onto the **standby**, which reboots on it.
2. Do a **switchover**: the upgraded standby becomes active (SSO keeps forwarding).
3. Upgrade the old active, which comes back as the new standby.
4. Commit the upgrade (or roll back if something's wrong).

On IOS XE install mode, the whole sequence runs with one command, for example `install add file bootflash:<image>.bin activate issu commit`.

**Why does ISSU need SSO underneath it?** Because each step in the sequence is a supervisor switchover. If the switchover weren't stateful, every step would be an outage. *ISSU is just SSO used on purpose, twice, with an upgrade in between.*

## 2.8 Putting HA Together — Matching Techniques to Failures

| Failure | What saves you | Typical recovery |
|---------|----------------|------------------|
| Supervisor crash | SSO + NSF | Sub-second to ~3 s, routing stays up |
| One switch in a stack dies | Stack SSO + cross-stack EtherChannel | Milliseconds for traffic on surviving members |
| Distribution switch dies (SV pair) | StackWise Virtual + MEC | Milliseconds (EtherChannel member loss) |
| Distribution router dies (independent pair) | HSRP/VRRP + routing reconvergence | ~1–10 s depending on timers |
| Uplink fiber cut | EtherChannel or ECMP | Milliseconds |
| Neighbor silently stops forwarding | BFD + routing protocol | ~150–900 ms with typical BFD timers |
| WAN carrier outage | Dual carriers, SD-WAN, IP SLA tracking | Seconds |

*Every high-availability technique is the same idea: have a second one, keep it warm, and make the switch-over faster than the application can notice.*

---

<a name="chapter-3"></a>
# Chapter 3: Layer 2 Revisited: Trunking & EtherChannel Troubleshooting

> **Blueprint:** ENCOR 3.1.a — Troubleshoot static and dynamic 802.1q trunking protocols; ENCOR 3.1.b — Troubleshoot static and dynamic EtherChannels.

CCNA taught you how to *build* trunks and EtherChannels (CCNA guide 8.1–8.2, 10.1–10.4). ENCOR's verb is **troubleshoot**. That means knowing every way they fail, what each failure looks like in `show` output, and which single command proves the cause. This chapter is organized around exactly that.

## 3.1 Static vs Dynamic Trunking — A Quick Recap

A trunk carries many VLANs over one link by adding an **802.1Q tag** (4 bytes, holding a 12-bit VLAN ID) to every frame except those in the **native VLAN**, which cross untagged.

There are two ways to make a link a trunk:

- **Static:** `switchport mode trunk` — the port is a trunk, full stop.
- **Dynamic:** let **DTP (Dynamic Trunking Protocol)**, a Cisco protocol, negotiate. DTP frames are sent about every 30 seconds to the Cisco multicast MAC `0100.0ccc.cccc`.

| Mode | What it does | Sends DTP? |
|------|--------------|------------|
| `switchport mode access` | Always access | **Yes**: it still sends DTP, to tell the neighbor "I am not a trunk". Stop it with `nonegotiate` |
| `switchport mode trunk` | Always trunk | **Yes** — still sends DTP unless `nonegotiate` |
| `switchport mode dynamic desirable` | **Actively asks** to trunk | Yes |
| `switchport mode dynamic auto` | Trunks only **if asked** | Yes (but only responds) |
| `switchport nonegotiate` | Turns DTP off (used with trunk or access) | No |

On Catalyst 9000 switches, the default for a Layer 2 port is **`dynamic auto`**.

### Trunk Encapsulation — the Command That Gets Forgotten

Switches that support both **ISL** (Cisco's legacy trunk encapsulation) and 802.1Q default to **`switchport trunk encapsulation negotiate`** (shown as "Auto"). On those platforms — including many older Catalysts and the **IOL L2 images** you'll use in EVE-NG — a port can't be made a static trunk until you pick the encapsulation:

```
SW1(config-if)# switchport mode trunk
Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured
to "trunk" mode.
SW1(config-if)# switchport trunk encapsulation dot1q     ! choose 802.1Q explicitly
SW1(config-if)# switchport mode trunk                    ! now accepted
```

Catalyst 9000 switches support only 802.1Q, so the `encapsulation` command doesn't exist there and the trunk just works. **Why does the switch refuse rather than guess?** Because a static trunk sends tagged frames without negotiating. If it guessed ISL while the neighbor used 802.1Q, every frame would be unreadable on the far side. Making you choose removes the guess. *If `switchport mode trunk` is rejected in a lab, this is almost always why.*

### The DTP Outcome Matrix (Memorize This)

| Side A ↓ / Side B → | **access** | **dynamic auto** | **dynamic desirable** | **trunk** |
|---------------------|------------|------------------|-----------------------|-----------|
| **access** | Access | Access | Access | **Mismatch** |
| **dynamic auto** | Access | **Access** | Trunk | Trunk |
| **dynamic desirable** | Access | Trunk | Trunk | Trunk |
| **trunk** | **Mismatch** | Trunk | Trunk | Trunk |

**Why do two `dynamic auto` ports end up as access?** Because `auto` is purely passive. It will agree to trunk if the other side asks, but it never asks. Two passive ports wait politely for each other forever, and the link falls back to access. This catches people out because both ports are *willing* to trunk. *Willing on both sides isn't enough — somebody has to start the conversation.*

**Why is "trunk on one side, access on the other" a mismatch and not just "access"?** Because a static trunk doesn't wait for agreement. It sends tagged frames regardless, while the access side expects untagged frames in one VLAN. Traffic in the native VLAN may still work (it's untagged on both ends), while every other VLAN silently fails. Partial connectivity is the classic symptom of a trunking mismatch.

**Why does `switchport nonegotiate` cause problems when the other side is dynamic?** With `nonegotiate`, the port sends no DTP at all. A neighbor in `dynamic auto` or `dynamic desirable` never hears a DTP reply, so it never becomes a trunk and stays access, while your side is a hard trunk: a mismatch.

> **Best practice and exam answer:** hard-code both ends — `switchport mode trunk` plus `switchport nonegotiate` on switch-to-switch links, and `switchport mode access` on user ports. DTP is a security risk (an attacker's device can negotiate a trunk and reach every VLAN — **switch spoofing**) and an unpredictability risk.

### The VTP Domain Trap

DTP carries the **VTP domain name**. If the two switches have **different VTP domain names**, DTP won't negotiate a trunk (statically configured trunks are unaffected). So if a dynamic trunk refuses to form between switches that look correctly configured, check `show vtp status` on both ends.

### Reading `show interfaces switchport`

`show interfaces trunk` lists only ports that **are** trunking. When a link *should* be a trunk and isn't, this is the command that shows what each side was told to do and what actually happened:

```
SW1# show interfaces Gi1/0/1 switchport
Name: Gi1/0/1
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)
Trunking VLANs Enabled: ALL
Pruning VLANs Enabled: 2-1001
```

| Field | What it tells you |
|-------|-------------------|
| **Administrative Mode** | What you configured (`dynamic auto`, `trunk`, `static access`…) |
| **Operational Mode** | What the port is **actually doing** right now (`trunk` or `static access`) |
| **Administrative Trunking Encapsulation** | `dot1q`, `isl` or `negotiate`; "negotiate" on a static trunk explains a rejected command |
| **Negotiation of Trunking** | `On` = DTP is running; `Off` = `nonegotiate` is set |
| **Access Mode VLAN** | The VLAN used if the port ends up access |
| **Trunking Native Mode VLAN** | This side's native VLAN; compare it with the neighbor's |
| **Trunking VLANs Enabled** | The allowed list (3.3) |

**Reading the example:** the port is configured `dynamic auto` but is operating as `static access`, and DTP is on. Combined with the matrix above, the neighbor must also be `auto` (or access): nobody asked to trunk. *Administrative vs operational mode is the first thing to compare on any "why isn't this a trunk?" question.*

## 3.2 Native VLAN Mismatch

![Native VLAN mismatch leaking frames between VLANs](images/c03_native_mismatch.png)

Each end of a trunk decides on its own which VLAN untagged frames belong to. If SW1's native VLAN is 10 and SW2's is 20, an untagged frame SW1 sends from VLAN 10 arrives at SW2 and is placed in **VLAN 20**. Traffic **leaks between VLANs**, which is both a security problem and very confusing.

Cisco switches detect it in two ways:

- **CDP** reports it: `%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet1/0/1 (10), with SW2 GigabitEthernet1/0/1 (20).`
- **PVST+ / Rapid PVST+** carries the sending VLAN inside its BPDUs. When the VLAN in the BPDU doesn't match the receiving port's native VLAN, the port is put into a **PVID-inconsistent** (port VLAN ID) state and **blocked** for the affected VLANs, so the leak doesn't become a loop.

```
SW2# show spanning-tree inconsistentports
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0010             GigabitEthernet1/0/1     Port VLAN ID Mismatch
VLAN0020             GigabitEthernet1/0/1     Port VLAN ID Mismatch
```

**Fix:** make the native VLAN match on both ends — and in production, set it to an **unused VLAN** that carries no user traffic, so an untagged frame never lands anywhere useful. That also defeats **double-tagging (VLAN hopping)** attacks, which depend on the attacker's access VLAN being the trunk's native VLAN.

```
SW(config-if)# switchport trunk native vlan 999
SW(config)# vlan dot1q tag native          ! optional: tag native VLAN frames too
```

## 3.3 Allowed VLAN Lists and Pruning

A trunk can only carry VLANs that are **(1) allowed** on the trunk, **(2) exist and are active** on the switch, and **(3) not pruned** and in STP forwarding state. `show interfaces trunk` shows exactly those three filters in order:

```
SW1# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Gi1/0/1     on           802.1q         trunking      999

Port        Vlans allowed on trunk
Gi1/0/1     10,20,30,999

Port        Vlans allowed and active in management domain
Gi1/0/1     10,20,999

Port        Vlans in spanning tree forwarding state and not pruned
Gi1/0/1     10,999
```

**How to read it, line by line:**

- VLAN 30 is **allowed** but missing from "allowed and active" → **VLAN 30 doesn't exist** on this switch (`show vlan brief`). Create it.
- VLAN 20 is active but missing from the last list → it's either **blocked by STP** on this port (`show spanning-tree vlan 20`) or **pruned** by VTP because the neighbor has no ports in it.
- `Mode on` means statically configured trunk; `desirable`/`auto` means DTP formed it.

*That one command is the whole trunk-troubleshooting flowchart: allowed → exists → forwarding.*

> **Exam trap — the most destructive typo in switching:** `switchport trunk allowed vlan 40` **replaces** the entire list with just VLAN 40, instantly cutting every other VLAN on that trunk. To add a VLAN, use `switchport trunk allowed vlan add 40`. (`remove`, `except` and `all` also exist.)

## 3.4 VTP — Version 3 and Why It Exists

VTP (CCNA guide 8.3) synchronizes the VLAN database from a server to clients. Its notorious failure: a switch with a **higher configuration revision number** joins the domain and **overwrites every switch's VLAN database** with its own — possibly deleting every VLAN in production.

**VTP version 3** addresses this and more:

| Feature | VTPv1/v2 | VTPv3 |
|---------|----------|-------|
| Who can change VLANs | Any server | Only the **primary server** (one per domain, per feature) |
| Accidental overwrite protection | None | A new switch can't become primary without an explicit takeover |
| Extended VLANs (1006–4094) | Not propagated | **Propagated** |
| MST instance mapping | No | **Yes** (can propagate MST config) |

```
SW1(config)# vtp domain CORP
SW1(config)# vtp version 3
SW1(config)# vtp mode server
SW1# vtp primary vlan              ! exec mode: become primary server (prompts to confirm)
SW1# show vtp status
```

**Why is "transparent" or "off" still the most common real-world VTP setting?** Because even VTPv3 is a mechanism that lets one switch change many switches' VLAN databases. Most enterprises prefer to configure VLANs explicitly, increasingly through automation (Chapters 19–21), so the blast radius of one mistake stays at one switch.

## 3.5 EtherChannel Negotiation — The Mode Matrix

EtherChannel bundles 2–8 active links into one logical **port-channel** (CCNA guide Chapter 10). Members can be bundled statically (`on`) or negotiated by **LACP** (IEEE 802.3ad, now 802.1AX) or **PAgP** (Cisco).

| Protocol | Active mode (initiates) | Passive mode (responds) |
|----------|-------------------------|-------------------------|
| **LACP** | `active` | `passive` |
| **PAgP** | `desirable` | `auto` |
| **Static** | `on` (no protocol) | — |

| Side A ↓ / Side B → | **on** | **active** | **passive** | **desirable** | **auto** |
|---------------------|--------|------------|-------------|---------------|----------|
| **on** | **Channel** | No | No | No | No |
| **active** | No | **Channel** | **Channel** | No | No |
| **passive** | No | **Channel** | No | No | No |
| **desirable** | No | No | No | **Channel** | **Channel** |
| **auto** | No | No | No | **Channel** | No |

**Read the matrix by three rules:** the protocols must match (LACP with LACP, PAgP with PAgP), at least one side must be the initiator (`passive`+`passive` and `auto`+`auto` never form), and **`on` only bundles with `on`**, because `on` sends no protocol frames at all.

**Why is `on` the most dangerous mode?** Because with no protocol, nothing checks that the other end has really bundled. If SW1 is `on` and SW2 has ports in individual mode (or bundled differently), SW1 sends frames over the members as one logical link while SW2 treats them as separate links. STP on SW2 sees separate ports, while SW1 hashes broadcasts out one member and floods them back from another: the ingredients for a **loop**. LACP and PAgP prevent this by refusing to bundle until both sides agree. *Negotiation isn't overhead — it's the safety check.*

### EtherChannel Misconfig Guard

For the `on`-mode danger, STP has a safety net: **EtherChannel misconfiguration guard** (enabled by default on Catalyst switches). If a switch's port-channel receives BPDUs from multiple different source MACs (a sign the far side isn't bundling), it puts the channel's member ports into **err-disabled** state.

```
SW(config)# spanning-tree etherchannel guard misconfig     ! on by default
%PM-4-ERR_DISABLE: channel-misconfig (STP) error detected on Po1, putting Gi1/0/1 in
err-disable state
```

## 3.6 Why Members Get Suspended — Attribute Mismatches

Even with matching modes, a port joins the bundle **only if its configuration matches the port-channel's**. A mismatched member is **suspended** — up physically, but excluded from the bundle.

| Must match across all members (and the port-channel) |
|------------------------------------------------------|
| Speed and duplex |
| Switchport mode (access vs trunk) — and Layer 2 vs Layer 3 (`no switchport`) |
| Access VLAN (if access) |
| Native VLAN and allowed VLAN list (if trunk) |
| Trunk encapsulation |
| LACP/PAgP mode family (can't mix LACP and PAgP members in one channel) |

**Why must the members match so strictly?** Because the switch treats the bundle as **one** interface. If one member allowed VLAN 30 and another didn't, a frame for VLAN 30 hashed onto the wrong member would vanish — and the hash is per-flow (CCNA guide 10.4), so you'd get a bizarre "some conversations in VLAN 30 work, others don't" fault. Suspending the odd member out is the switch refusing to build a link that would behave inconsistently.

> **Best practice:** configure the **port-channel interface**, not the members. Settings applied to `interface Port-channel1` are pushed to every member, so they can't drift apart.

## 3.7 Reading `show etherchannel summary`

```
SW1# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        M - not in use, minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

Group  Port-channel  Protocol    Ports
------+-------------+-----------+------------------------------------------
1      Po1(SU)         LACP      Gi1/0/1(P)  Gi1/0/2(P)  Gi1/0/3(s)
2      Po2(SD)         LACP      Gi1/0/5(I)  Gi1/0/6(I)
```

| Flag | Meaning | What to check |
|------|---------|---------------|
| **(SU)** on the port-channel | Layer 2, in use — healthy | — |
| **(RU)** | Layer 3 port-channel in use — healthy | — |
| **(SD)** / **(RD)** | Port-channel is **down** | No member is bundled — look at the member flags |
| **(P)** | Member bundled — healthy | — |
| **(s)** | **Suspended** — config doesn't match the bundle | `show run int` on the member vs the port-channel; `show interfaces Gi1/0/3 etherchannel` |
| **(I)** | **Stand-alone** — no LACP/PAgP partner heard | Far end not configured for the channel, wrong protocol, or `passive`+`passive` |
| **(H)** | LACP **hot-standby** (more than 8 members, or max-bundle reached) | Normal by design; lower LACP port priority = preferred active |
| **(D)** | Member link down | Layer 1 — cable, optic, `shutdown` |
| **(w)** | Waiting to aggregate | Usually transient; persistent means negotiation trouble |
| **(M)** | Min-links not met | `port-channel min-links` set higher than bundled members |

**Reading the example:** Po1 is healthy with two bundled members, but Gi1/0/3 is suspended — it has a configuration mismatch. Po2 is down because both members are stand-alone: they're not hearing LACPDUs, so the far side is probably not configured with LACP (or is `passive` to our `passive`).

### Proving What the Partner Is Doing

`show etherchannel summary` shows *your* side. These two commands show the **partner's** side, as learned from its LACPDUs:

```
SW1# show lacp neighbor
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode

Channel group 1 neighbors

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
Gi1/0/1   SA      32768     7c21.0e5a.2c00  12s    0x0    0x1    0x102   0x3D
Gi1/0/2   SA      32768     7c21.0e5a.2c00  15s    0x0    0x1    0x103   0x3D
```

- **Dev ID** is the partner's LACP system ID (its MAC). If two members show **different** Dev IDs, they are cabled to two different switches, and they can't bundle (unless the far side is a StackWise Virtual pair or a stack, which presents one system ID: Chapter 2).
- **Flags** show the partner's mode: `A` active, `P` passive. A member with **no neighbor entry at all** is the `(I)` stand-alone case: no LACPDUs are arriving.
- **Oper Key** must be the same on every member the partner bundles together.

```
SW1# show etherchannel 1 port-channel
                Port-channels in the group:
                ---------------------------
Port-channel: Po1    (Primary Aggregator)
Age of the Port-channel   = 0d:02h:11m:40s
Logical slot/port   = 9/1          Number of ports = 2
Port state          = Port-channel Ag-Inuse
Protocol            =   LACP
Port security       = Disabled

Ports in the Port-channel:
Index   Load   Port       EC state        No of bits
------+------+----------+------------------+-----------
  0     55     Gi1/0/1    Active             4
  1     AA     Gi1/0/2    Active             4

Time since last port bundled:    0d:02h:11m:32s    Gi1/0/2
```

The **Load** column is the hash-bucket bitmap each member owns (CCNA guide 10.4): two members split the 8 buckets 4 and 4. "Time since last port bundled/unbundled" is a quick way to spot a member that keeps flapping in and out of the bundle.

## 3.8 LACP Tuning Worth Knowing

```
SW1(config)# lacp system-priority 100                ! lower = this switch decides
SW1(config)# interface range Gi1/0/1 - 4
SW1(config-if-range)# channel-group 1 mode active
SW1(config-if-range)# lacp port-priority 100          ! lower = preferred active member
SW1(config-if-range)# lacp rate fast                  ! LACPDUs every 1 s (default 30 s)
SW1(config)# interface Port-channel1
SW1(config-if)# port-channel min-links 2              ! take Po1 down below 2 members
SW1(config)# port-channel load-balance src-dst-ip     ! global hash input
```

**Why do the system priority and port priority exist?** LACP supports up to **16** members per channel, but only **8** can be active; the rest are **hot-standby**. The two switches must agree on *which* 8, so the switch with the better (lower) **system priority** — or lower MAC on a tie — gets to decide, and it uses **port priority** to choose. *One side has to be in charge of the decision, or each side could pick a different eight.*

**Why would you want `min-links`?** Because a port-channel with only one surviving member is still "up," so routing protocols keep sending full traffic to it — and congest it. `min-links` takes the whole bundle down below a threshold, so routing shifts traffic to a better path instead.

**Why `lacp rate fast`?** With the default slow rate, a unidirectional failure (one fiber strand broken) can take up to 90 seconds (3 × 30 s) to detect through LACP. Fast rate detects it in about 3 seconds.

### Layer 3 EtherChannel

A port-channel can also be a **routed** link, which is common between distribution and core switches. The rule is that the members and the port-channel must **all** be Layer 3 (`no switchport`), and the IP address goes on the **port-channel only**:

```
SW1(config)# interface range Gi1/0/49 - 50
SW1(config-if-range)# no switchport                 ! members become routed ports first
SW1(config-if-range)# channel-group 10 mode active  ! creates Port-channel10 as Layer 3
SW1(config)# interface Port-channel10
SW1(config-if)# no switchport                        ! already L3 if created this way
SW1(config-if)# ip address 10.0.0.1 255.255.255.252 ! the IP lives here, never on members
```

In `show etherchannel summary` a healthy Layer 3 bundle shows **`Po10(RU)`**. **Why must you add `no switchport` to the members before `channel-group`?** Because the port-channel interface is created with the same Layer 2/Layer 3 personality as the first member added. Add Layer 2 members and you get a Layer 2 port-channel. Then a later `no switchport` on the port-channel conflicts with its members and they suspend. *Decide the layer first, then bundle.*

## 3.9 Troubleshooting Summary — Symptom → Cause → Proof

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Link up, but only some VLANs pass | Trunk/access mismatch, or VLAN not allowed / not created | `show interfaces trunk`, `show interfaces Gi1/0/1 switchport` |
| `switchport mode trunk` rejected ("encapsulation is Auto") | ISL-capable platform with encapsulation still `negotiate` | `show interfaces Gi1/0/1 switchport` (Administrative Trunking Encapsulation); fix with `switchport trunk encapsulation dot1q` |
| Port configured dynamic but operating as access | Neither side asks to trunk (`auto`+`auto`), or the far side is access | `show interfaces Gi1/0/1 switchport` (Administrative vs Operational Mode) |
| Dynamic trunk won't form between correct-looking switches | `auto`+`auto`, `nonegotiate` on one side, or VTP domain mismatch | `show dtp interface Gi1/0/1`, `show vtp status` |
| Frames leaking between VLANs; port blocked for one VLAN | Native VLAN mismatch | CDP log message, `show spanning-tree inconsistentports` |
| VLANs vanished across many switches | VTP revision-number overwrite (v1/v2) | `show vtp status` (revision, last modified by) |
| One trunk VLAN missing from the forwarding list | STP blocking or VTP pruning | `show spanning-tree vlan X`, `show interfaces trunk` (last section) |
| Port-channel down, members `(I)` | No partner protocol (mode mismatch) | `show etherchannel summary`, `show lacp neighbor` |
| One member `(s)` | Member config differs from bundle | `show interfaces Gi1/0/3 etherchannel`, compare `show run` |
| Members err-disabled after enabling `on` | Misconfig guard: far side not bundled | `show interfaces status err-disabled`, log `channel-misconfig` |
| Bundle up but one flow can't exceed one link's speed | Normal per-flow hashing | `show etherchannel load-balance`; `test etherchannel load-balance` |

*Two commands answer most Layer 2 link questions: `show interfaces trunk` for VLANs, `show etherchannel summary` for bundles. Learn to read every line of both.*

---

<a name="chapter-4"></a>
# Chapter 4: Spanning Tree at CCNP Depth: RSTP, MST & Enhancements

> **Blueprint:** ENCOR 3.1.c — Configure and verify common Spanning Tree Protocols (RSTP, MST) and Spanning Tree enhancements such as root guard and BPDU guard.

The CCNA guide covered the election (9.3), the flavors (9.8), the guards (9.9) and the mechanics underneath (9.10–9.11). This chapter assumes all of that. It adds **MST**, the RSTP behaviors that matter for troubleshooting, and the full toolkit of enhancements — including where each one belongs in a real campus.

## 4.1 Root Placement Is a Design Decision

STP will always elect a root. The only question is whether **you** chose it. In a campus, the root for each VLAN belongs at the **distribution layer**, and it must line up with the FHRP:

| VLAN | STP root | STP secondary | HSRP/VRRP active |
|------|----------|---------------|------------------|
| 10, 30, 50 (odd) | DIST-1 | DIST-2 | **DIST-1** |
| 20, 40, 60 (even) | DIST-2 | DIST-1 | **DIST-2** |

```
DIST-1(config)# spanning-tree vlan 10,30,50 root primary     ! priority 24576 (or lower)
DIST-1(config)# spanning-tree vlan 20,40,60 root secondary   ! priority 28672
```

**Why must the STP root and the FHRP active router be the same switch?** Because the access switch's root port points **toward the root**. If DIST-1 is the STP root but DIST-2 is the active gateway, a host's traffic goes up the forwarding uplink to DIST-1, then crosses the inter-distribution link to reach the gateway on DIST-2 — an extra hop, and that link becomes a bottleneck. Aligning them makes the forwarding path and the gateway the same path. *STP decides which way the road goes; the FHRP decides where the exit is. Put the exit at the end of the road.*

> **Exam trap:** `root primary` is a **macro**, not a setting. It runs once, looks at the current root's priority, and writes `spanning-tree vlan X priority 24576` into the config (or a value 4096 lower than the current root if that's already 24576 or less). If a switch with priority 0 joins later, `root primary` won't react, because it's already written a fixed number. For a deterministic design, set explicit priorities.

### Path Cost: Short vs Long

| Link speed | Short (802.1D-1998) | Long (802.1t) |
|------------|---------------------|---------------|
| 10 Mbps | 100 | 2,000,000 |
| 100 Mbps | 19 | 200,000 |
| 1 Gbps | 4 | 20,000 |
| 10 Gbps | 2 | 2,000 |
| 100 Gbps | no distinct value — can't be told apart | 200 |

**Why does the long method exist?** Same problem as OSPF's reference bandwidth (CCNA guide 16.6): the short values bottom out at 10 Gbps, so 10, 40 and 100 Gbps links would look nearly equal. Long costs keep scaling. **MST always uses long costs.** Set the method identically everywhere with `spanning-tree pathcost method long` and confirm it in `show spanning-tree summary`.

### STP Topology Tuning — Cost and Port Priority

Root placement decides **where** the tree is anchored. Two more knobs decide **which links** a non-root switch uses to reach it. Both act on the root-port tiebreakers (CCNA guide 9.10): lowest **root path cost**, then lowest **sender bridge ID**, then lowest **sender port priority**, then lowest **sender port number**.

| Knob | Command (PVST+ / Rapid PVST+) | MST equivalent | Configured on | Influences |
|------|-------------------------------|----------------|---------------|------------|
| **Port cost** | `spanning-tree [vlan X] cost N` | `spanning-tree mst N cost N` | The switch **choosing** a root port (the downstream port) | That switch's root path cost via that port, and everything below it |
| **Port priority** | `spanning-tree [vlan X] port-priority N` | `spanning-tree mst N port-priority N` | The **upstream** switch, on the port the downstream switch connects to | The neighbor's tiebreak when it has two links to the **same** upstream switch |

Port priority is 0–240 in steps of 16 (default **128**). Cost is any value in the switch's cost method.

**Why is cost set on the downstream switch but port priority on the upstream one?** Because of where each value enters the calculation. Root path cost is added **on the receiving port**: a switch adds its own port's cost to the cost advertised in the BPDU it hears. So lowering a port's cost makes **that** switch prefer that port. Port priority, by contrast, is compared as the **sender's** port ID, the value carried in the BPDU from the upstream switch. So you set it where the BPDU comes from. *Cost: "how expensive is my door?" Priority: "which of your doors do I prefer?"*

**Worked example.** ACC1 has two 1 Gbps uplinks, Gi1/0/1 and Gi1/0/2, both to DIST-1 (the root) on DIST-1's Gi1/0/10 and Gi1/0/11. Both paths cost 20,000 (long method), and both BPDUs come from the same bridge ID. The tiebreak falls to the sender port ID: 128.10 beats 128.11, so ACC1's root port is **Gi1/0/1** (the link to Gi1/0/10). You can make Gi1/0/2 the root port either way:

```
! Option 1 — on DIST-1 (upstream): make Gi1/0/11 the preferred sender port
DIST-1(config)# interface Gi1/0/11
DIST-1(config-if)# spanning-tree vlan 10 port-priority 64      ! 64.11 beats 128.10

! Option 2 — on ACC1 (downstream): make Gi1/0/2 the cheaper path
ACC1(config)# interface Gi1/0/2
ACC1(config-if)# spanning-tree vlan 10 cost 10000              ! 10,000 beats 20,000
```

Option 2 is the more common real-world fix because it acts earlier in the decision order (cost before port ID) and works even when the two uplinks go to **different** upstream switches. Port priority only ever matters between parallel links to the **same** neighbor. Verify with `show spanning-tree vlan 10`: the Role column moves `Root` to Gi1/0/2 and `Altn` to Gi1/0/1.

> **Exam trap:** setting `port-priority` on ACC1's own uplinks does **nothing** to ACC1's root-port choice. ACC1 compares the priorities *DIST-1* advertises, not its own.

## 4.2 RSTP Behaviors You Need for Troubleshooting

RSTP (802.1w) replaced timer-based convergence with **handshakes** (CCNA guide 9.11). On Cisco switches you run it per VLAN as **Rapid PVST+**, enabled with one global command:

```
SW(config)# spanning-tree mode rapid-pvst     ! RSTP per VLAN (alternatives: pvst, mst)
SW# show spanning-tree summary | include mode
Switch is in rapid-pvst mode
```

Recap of the vocabulary:

| Port role | Meaning |
|-----------|---------|
| **Root** | Best path toward the root (one per non-root switch) |
| **Designated** | The one port on each segment that forwards onto it, away from the root (every root-bridge port is designated) |
| **Alternate** | A backup path to the root via a **different** switch — discarding, ready to take over instantly |
| **Backup** | A backup for a designated port on the **same** shared segment (rare: hubs) |

| Port state | Learns MACs? | Forwards? |
|------------|--------------|-----------|
| **Discarding** (replaces disabled, blocking, listening) | No | No |
| **Learning** | Yes | No |
| **Forwarding** | Yes | Yes |

### Link Types — Why Duplex Matters to STP

RSTP's fast proposal/agreement handshake only works on **point-to-point** links, which RSTP infers from **full duplex**. A half-duplex port is treated as **shared** and falls back to slow timer-based convergence.

```
SW1# show spanning-tree vlan 10
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- -----------------------
Gi1/0/1             Root FWD 4         128.1    P2p
Gi1/0/2             Altn BLK 4         128.2    P2p
Gi1/0/10            Desg FWD 4         128.10   P2p Edge
Gi1/0/24            Desg FWD 19        128.24   Shr
```

**Reading it:** Gi1/0/2 is an **alternate** — it will become root port immediately if Gi1/0/1 fails. Gi1/0/10 is an **edge** port (PortFast). Gi1/0/24 shows `Shr`: it negotiated half duplex, so if it ever has to move to forwarding it'll wait out the timers. Fix the duplex — or, if a switch link really is full duplex but misdetected, force `spanning-tree link-type point-to-point`.

### Topology Changes — The Part That Floods Your Network

In RSTP, a **topology change (TC)** happens only when a **non-edge** port moves **to forwarding**. (Ports going down don't trigger TC in RSTP; edge ports never do.) The switch that sees the change sets the TC flag in its BPDUs and **flushes MAC addresses** learned on all its non-edge ports, and every switch receiving the TC does the same and passes it on.

**Why does that matter?** Because after a MAC flush, switches don't know where anyone is, so they **flood** unicast traffic until they relearn. One flapping switch port without PortFast on an access switch can cause repeated TCs, repeated flushes, and network-wide flooding that looks like a performance problem. *This is the strongest reason to put PortFast on every host port: edge ports don't generate topology changes.*

```
SW1# show spanning-tree vlan 10 detail | include occur|from
  Number of topology changes 4127 last change occurred 00:00:09 ago
          from GigabitEthernet1/0/33
```

A rapidly climbing TC count with a recent `from` interface leads you straight to the flapping port. Follow it hop by hop until you find the switch where the `from` port is an access port.

### Interop With Legacy STP

RSTP is backward compatible **per port**: if a port hears an 802.1D BPDU, that port falls back to 802.1D behavior and timers. It's correct, just slow, so a single old switch can make part of your network converge in 30–50 seconds again.

## 4.3 MST — Multiple Spanning Tree (802.1s)

Rapid PVST+ runs **one RSTP instance per VLAN**. That's great for load balancing (CCNA guide 9.8), but it scales badly: 500 VLANs means 500 instances, 500 sets of BPDUs on every trunk every 2 seconds, and 500 elections for the CPU to run. Yet in a typical campus there are only **two or three distinct topologies** — "VLANs that should use the left uplink" and "VLANs that should use the right."

**MST** runs **a few instances** and **maps many VLANs to each one**:

| MST instance | VLANs mapped | Root | Effect |
|--------------|--------------|------|--------|
| **0 (IST)** | Everything not mapped elsewhere | DIST-1 | Default instance; carries the BPDUs |
| **1** | 10, 30, 50, … (odd) | DIST-1 | Odd VLANs use the left uplink |
| **2** | 20, 40, 60, … (even) | DIST-2 | Even VLANs use the right uplink |

Same load balancing as PVST+, with **three** instances instead of hundreds.

**Why does MST beat PVST+ at scale, and what's the catch?** The win is CPU and BPDU overhead: MST sends **one BPDU per port** that carries the information for every instance (each instance is an "M-record" inside it). The catch is coordination: every switch must agree on exactly which VLANs belong to which instance, and that agreement is what an MST **region** is.

### MST Regions

Switches are in the **same region** only if **all three** of these match exactly:

1. **Region name** (case-sensitive)
2. **Revision number**
3. **VLAN-to-instance mapping table** (all 4094 VLANs)

Any difference makes a different region — even one VLAN mapped differently.

![MST regions, the CIST and boundary ports](images/c04_mst_regions.png)

| Term | Meaning |
|------|---------|
| **IST** (instance 0) | The internal spanning tree inside a region; the only instance that sends BPDUs |
| **MSTI** (1, 2, …) | User-created instances; information carried as M-records inside IST BPDUs |
| **CIST** | Common and Internal Spanning Tree — the single tree that spans **all** regions and any non-MST switches |
| **CIST root** | The root of that whole tree (best bridge ID anywhere) |
| **CIST regional root** | The switch in each region closest to the CIST root — the region's "entry point" |
| **Boundary port** | A port connecting to a **different region** or to a non-MST switch (802.1D, RSTP or PVST+) |

**Why can't MSTIs cross region boundaries?** Because another region might map VLAN 10 to a completely different instance — or not have that instance at all. Instance 1 means nothing outside the region that defined it. So at the boundary, the whole region looks to the outside like **one big virtual switch** participating in the CIST. Inside the region, MSTIs can load balance; across regions, only the CIST exists. *A region is a promise: "we all agree what instance 1 means." Outside the promise, only the common tree applies.*

### Configuring MST

```
SW(config)# spanning-tree mode mst
SW(config)# spanning-tree mst configuration
SW(config-mst)# name CAMPUS                  ! must match across the region
SW(config-mst)# revision 1                   ! must match
SW(config-mst)# instance 1 vlan 10,30,50     ! mapping must match
SW(config-mst)# instance 2 vlan 20,40,60
SW(config-mst)# show pending                 ! review before it applies
SW(config-mst)# exit                         ! changes apply on exit
SW(config)# spanning-tree mst 0-1 priority 24576   ! on DIST-1: root for IST and MSTI 1
SW(config)# spanning-tree mst 2 priority 28672     ! on DIST-1: secondary for MSTI 2
```

```
SW# show spanning-tree mst configuration
Name      [CAMPUS]
Revision  1     Instances configured 3
Instance  Vlans mapped
--------  ---------------------------------------------------------------
0         1-9,11-19,21-29,31-39,41-49,51-59,61-4094
1         10,30,50
2         20,40,60

SW# show spanning-tree mst 1
##### MST1    vlans mapped:   10,30,50
Bridge        address 7c21.0e5a.1b00  priority      24577 (24576 sysid 1)
Root          this switch for MST1
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Gi1/0/1          Desg FWD 20000     128.1    P2p
Gi1/0/2          Desg FWD 20000     128.2    P2p Bound(PVST)
```

**Notice two things.** The priority shows `24577` because the extended system ID now carries the **instance number** (1), not a VLAN. And `Bound(PVST)` marks a **boundary port** facing a PVST+ switch.

> **Exam traps:** (1) Changes made in `spanning-tree mst configuration` mode only take effect when you **exit**, and changing the mapping on a live switch briefly puts it in a different region — schedule it. (2) **Map VLANs before you create them**, and keep the mapping identical everywhere — a single mismatched VLAN splits the region and silently kills your MSTI load balancing at that point. (3) Since VTPv3 can propagate the MST configuration (3.4), that's one way to keep it consistent.

### What a Region Mismatch Looks Like

Suppose DIST-1 maps VLANs 20, 40 **and 60** to instance 2, but ACC3 was configured with only `instance 2 vlan 20,40`. The name and revision match, but the mapping tables differ, so the two switches compute different configuration digests and treat each other as **different regions**. Nothing errors and nothing is logged. The only evidence is that the link has become a boundary:

```
ACC3# show spanning-tree mst interface Gi1/0/1
GigabitEthernet1/0/1 of MST0 is root forwarding
Edge port: no             (default)        port guard : none        (default)
Link type: point-to-point (auto)           bpdu filter: disable     (default)
Boundary : boundary       (RSTP)           bpdu guard : disable     (default)
Bpdus sent 14, received 2310

Instance Role Sts Cost      Prio.Nbr Vlans mapped
-------- ---- --- --------- -------- -------------------------------
0        Root FWD 20000     128.1    1-19,21-39,41-4094
2        Mstr FWD 20000     128.1    20,40
```

Read it from the top: **`Boundary : boundary (RSTP)`** says the neighbor's BPDUs don't match this region. `show spanning-tree mst` flags the same port as **`Bound(RSTP)`** in its Type column. In the instance table, MSTI 2's role is **`Mstr`** (master): on a boundary port every MSTI simply copies the port's CIST role and state. The consequence is the real damage. ACC3 was supposed to send even VLANs up its *other* uplink. Now all instances follow the CIST at this link, and **load balancing is silently gone**.

**Fix:** compare `show spanning-tree mst configuration` on both switches (the `digest` keyword shows the computed MD5 digest, which must match) and make the mapping identical.

### MST Hop Count

Inside a region, MST doesn't use the 802.1D message-age timer to age out information. It uses a **hop count**: the regional root sends BPDUs with the hop count set to **`max-hops` (default 20)**, each switch decrements it, and information that reaches 0 is discarded. A region with a diameter larger than 20 switches needs `spanning-tree mst max-hops 30` (range 1–255). Like the other timers, configure it on the regional root.

### MST and PVST+ Interoperation

When an MST region meets PVST+ switches, the boundary port runs **PVST simulation**: the MST side sends copies of its IST (CIST) BPDU in every VLAN, and checks the per-VLAN BPDUs it receives against the CIST.

The rule that keeps it working: **the root must be consistent.** Either the CIST root is **inside the MST region** and it's better (lower priority) than every PVST+ VLAN root, or the PVST+ side holds the root for **all** VLANs. If the roots are split — for example, the PVST+ side is root for VLAN 20 but not VLAN 10 — the boundary port goes into a **PVST simulation inconsistent** state and blocks.

*Best practice: when migrating to MST, put the CIST root (and all MSTI roots) in the MST core, and migrate from the core outward.*

## 4.4 Edge Ports: PortFast Done Right

PortFast marks a port as an **edge port**: it goes straight to forwarding and never generates topology changes (4.2).

```
SW(config-if)# spanning-tree portfast              ! access port to a host
SW(config-if)# spanning-tree portfast trunk        ! trunk to a hypervisor or AP in FlexConnect
SW(config)# spanning-tree portfast default         ! all ACCESS ports become edge by default
```

(IOS XE 16 and later spell these `spanning-tree portfast edge`, `portfast edge trunk` and `portfast edge default`, and the global guard defaults below become `spanning-tree portfast edge bpduguard default` and `spanning-tree portfast edge bpdufilter default`. Older releases accept the shorter forms. The behavior is identical.)

**Why does `portfast trunk` exist when PortFast is supposed to be for hosts?** Because some hosts use trunks: a server running a hypervisor with VMs in several VLANs, or a router-on-a-stick. Those endpoints still can't form a switching loop, so the port is safe to treat as an edge port — but plain `spanning-tree portfast` is ignored on a trunk, so you have to say so explicitly.

An edge port that **receives a BPDU** immediately loses its edge status and becomes a normal STP port. That's a safety net, but a weak one: the port has already been forwarding. BPDU guard turns that into a hard stop.

## 4.5 The Enhancements, One by One

![Where each STP enhancement belongs in a campus](images/c04_guards.png)

### BPDU Guard — "No Switches Here"

```
SW(config-if)# spanning-tree bpduguard enable            ! per port
SW(config)# spanning-tree portfast bpduguard default     ! every PortFast port
SW(config)# errdisable recovery cause bpduguard          ! optional auto-recovery
SW(config)# errdisable recovery interval 300             ! seconds
```

A BPDU arriving on the port **err-disables** it. The port stays down until someone runs `shutdown`/`no shutdown`, or until err-disable recovery brings it back.

**Why prefer the global `portfast bpduguard default` over per-port configuration?** Because it ties the two features together automatically: every port you make an edge port is protected, and you can't forget one. *Whenever you mark a port as "only hosts here," you also want "...and shut it if that turns out to be false."*

### BPDU Filter — Two Very Different Behaviors

| Configured how | Behavior | Risk |
|----------------|----------|------|
| **Global:** `spanning-tree portfast bpdufilter default` | Applies to **PortFast** ports: sends a few BPDUs at link-up, then stops. If a BPDU is **received**, the port loses PortFast and filtering and runs normal STP | Low — it backs out safely |
| **Per-interface:** `spanning-tree bpdufilter enable` | **Never sends, ignores everything received** — STP is effectively off on the port | **High** — a loop through this port will never be blocked |

**Why use BPDU filter at all?** On a port facing a network you deliberately keep out of your STP domain (a service provider handoff, another organization), or to stop sending BPDUs to thousands of host ports. The global form is the safe one. *Interface-level BPDU filter turns spanning tree off; never use it toward anything that could be a switch.*

> **Exam trap:** if BPDU guard and BPDU filter are both on one port, the filter wins: BPDUs are dropped before guard can see them, so the port never err-disables.

### Root Guard — "You May Not Become Root Through This Port"

```
SW(config-if)# spanning-tree guard root
```

Configured on **designated ports** facing switches that should never be on the path to the root — typically distribution downlinks to access switches, or ports to other organizations. If a **superior** BPDU arrives, the port goes **root-inconsistent** (no forwarding). It **recovers automatically** when the superior BPDUs stop.

### Loop Guard — "Silence Is Not Permission"

```
SW(config-if)# spanning-tree guard loop           ! per port
SW(config)# spanning-tree loopguard default        ! all point-to-point ports
```

Protects **root and alternate ports** (the ports that *receive* BPDUs). If BPDUs stop arriving on such a port — for example, because of a unidirectional link failure — instead of moving to designated/forwarding, the port goes **loop-inconsistent** (blocking) for that instance. It recovers automatically when BPDUs resume.

**Why can't root guard and loop guard be used on the same port?** Because they protect opposite port roles. Root guard belongs on **designated** ports (which send BPDUs, and should never receive superior ones). Loop guard belongs on **root/alternate** ports (which receive BPDUs, and must keep receiving them). IOS refuses to enable both on one interface.

### UDLD — Unidirectional Link Detection

A **unidirectional link** is one where traffic flows one way only — classically a fiber pair where one strand is broken or crossed. The port stays up (light is received), so STP can be fooled: the downstream switch stops getting BPDUs and unblocks its port, creating a loop.

**UDLD** is a Cisco Layer 2 protocol where neighbors **echo each other's identity** back. If a switch stops seeing itself echoed, the link isn't working in both directions.

| Mode | When the link is detected unidirectional |
|------|-----------------------------------------|
| **Normal** | Logs the problem and marks the port; the port keeps running (STP decides what happens) |
| **Aggressive** | After the neighbor stops responding, tries to re-establish 8 times (once per second), then **err-disables** the port |

```
SW(config)# udld enable                 ! normal mode on all FIBER ports
SW(config)# udld aggressive             ! aggressive mode on all fiber ports
SW(config-if)# udld port aggressive     ! per interface (copper or fiber)
SW# show udld neighbors
SW# show udld Gi1/0/49
```

UDLD must run on **both ends** of the link. The default message interval is 15 seconds.

### Loop Guard vs UDLD

| Question | Loop guard | UDLD |
|----------|-----------|------|
| What it detects | BPDUs stopped arriving (any cause) | Link not bidirectional at Layer 1/2 |
| Scope | Per STP instance/VLAN | Whole port |
| Works on EtherChannel members | Acts on the bundle | Acts on each physical member |
| Action | Loop-inconsistent (auto-recovers) | Logs (normal) or err-disable (aggressive) |

**Why run both?** Because they catch different failures. UDLD catches a broken fiber strand even on a link STP isn't blocking, and can disable just one member of an EtherChannel. Loop guard catches BPDU loss from causes UDLD can't see — a software bug, a congested CPU dropping BPDUs. *Belt and braces for the one failure STP can't detect on its own.*

## 4.6 The Complete Guard Map

| Feature | Port type | Triggers on | Port result | Recovery |
|---------|-----------|-------------|-------------|----------|
| **PortFast** | Access/host | — | Instant forwarding, no TCs | — |
| **BPDU guard** | Access/host (edge) | **Any** BPDU received | **err-disabled** | Manual or errdisable recovery |
| **BPDU filter (global)** | Edge | BPDU received → loses edge status | Normal STP | Automatic |
| **BPDU filter (interface)** | Special cases only | — | STP off on the port | — |
| **Root guard** | Designated, toward access/outside | **Superior** BPDU | **root-inconsistent** | Automatic |
| **Loop guard** | Root / alternate | BPDUs **stop** | **loop-inconsistent** | Automatic |
| **UDLD aggressive** | Fiber uplinks (both ends) | Link not bidirectional | **err-disabled** | Manual or errdisable recovery |

### Verification Cheat Sheet

```
SW# show spanning-tree summary              ! mode, portfast/bpduguard/loopguard defaults
SW# show spanning-tree inconsistentports    ! root-, loop-, PVID- and type-inconsistent ports
SW# show spanning-tree interface Gi1/0/10 detail   ! edge status, guard settings, BPDU counts
SW# show interfaces status err-disabled     ! which ports and why (bpduguard, udld...)
SW# show errdisable recovery                ! which causes auto-recover and the timer
```

*The pattern behind every enhancement: STP trusts BPDUs completely. Each guard adds one rule about when a BPDU — or its absence — should be distrusted.*

---

<a name="chapter-5"></a>
# Chapter 5: Routing Concepts — EIGRP vs OSPF, Path Selection & PBR

> **Blueprint:** ENCOR 3.2.a — Compare routing concepts of EIGRP and OSPF (advanced distance vector vs. link state, load balancing, path selection, path operations, metrics, and area types); ENCOR 3.2.d — Describe policy-based routing.

At CCNA you learned that routers learn routes and pick the best one. At CCNP you need to know **how** each protocol thinks, because that's what lets you predict its behaviour and find a fault without guessing. This chapter compares the two interior protocols ENCOR expects you to know — **EIGRP** and **OSPF** — then covers the decision every router makes for every packet, and the one tool that lets you override that decision: **policy-based routing**.

Chapter 26 takes EIGRP to troubleshooting depth, and Chapter 6 (with Chapter 27 behind it) does the same for OSPF. This chapter is the comparison that makes both of them make sense.

---

## 5.1 Three Ways to Build a Routing Protocol

The CCNA guide (16.2) split routing protocols into two families. There are really **three**, and EIGRP is the one that doesn't fit the CCNA picture:

| Family | Example | What a router knows | What it shares | Who computes the path |
|--------|---------|---------------------|----------------|-----------------------|
| **Distance vector** | RIP | Only what neighbours tell it | Its whole routing table, periodically | Neighbours, effectively — you trust their answer |
| **Advanced distance vector** | **EIGRP** | Neighbours' metrics *plus* enough to prove a path is loop-free | Only changes, only when they happen | Each router, using the DUAL algorithm |
| **Link state** | **OSPF**, IS-IS | A full map of its area | Facts about its own links (LSAs) | Each router, running SPF over the map |

**Why is EIGRP called "advanced" distance vector rather than link state?** Because it still never sees the map. An EIGRP router knows, for each destination, "my neighbour R2 says it's 1000 away, and the link to R2 costs me 2000" — that's a **vector** (direction) and a **distance**, exactly like RIP. What makes it *advanced* is what it does with that information. RIP blindly believes the lowest number and needs hop-count limits, hold-down timers and split horizon to stop the loops that blind belief creates. EIGRP instead keeps **every** neighbour's reported distance and uses a mathematical test — the **feasibility condition** (5.3) — to prove which alternatives *cannot* be loops. *It keeps distance vector's light footprint while dealing with the loops that make RIP so fragile.*

**And what does link state buy that EIGRP doesn't have?** A complete view. OSPF routers in an area hold an identical database (CCNA guide 16.11), so every router can compute any path itself. The price is memory and CPU — every router stores the whole area and reruns SPF when it changes — which is exactly why OSPF needs **areas** to scale, and EIGRP doesn't.

| Property | Distance vector (RIP) | Advanced DV (EIGRP) | Link state (OSPF) |
|----------|-----------------------|---------------------|-------------------|
| Updates | Full table every 30 s | Partial, bounded, on change | LSAs on change + refresh every 30 min |
| Loop prevention | Split horizon, poison, hold-down, max 15 hops | Feasibility condition (DUAL) | Identical LSDB + SPF |
| Convergence | Slow (minutes) | Very fast with a feasible successor | Fast (SPF run) |
| Scaling tool | None | Summarization anywhere, stub routers | Areas, summarization at ABR/ASBR |
| Memory/CPU | Low | Low–moderate | Moderate–high |

---

## 5.2 EIGRP Fundamentals

**EIGRP** (Enhanced Interior Gateway Routing Protocol) was Cisco-proprietary until Cisco published it as informational **RFC 7868** in 2016. In practice it remains a Cisco-network protocol.

### How EIGRP Talks

| Item | Value |
|------|-------|
| Transport | Its own IP protocol, **number 88** (not TCP or UDP) |
| Reliability | **RTP** — Reliable Transport Protocol — acknowledges Updates, Queries and Replies |
| Multicast address | **224.0.0.10** (IPv6: **FF02::A**) |
| Hello / hold timers | **5 s / 15 s** on most links; **60 s / 180 s** on slow NBMA links (≤ T1) |
| Administrative distance | **90** internal, **170** external (redistributed), **5** summary |
| Packet types | Hello, Update, Query, Reply, Ack (plus SIA-Query/SIA-Reply) |

**Why does EIGRP need its own reliable transport when it isn't using TCP?** Because EIGRP sends updates **only once**, only when something changes. RIP could afford to lose an update — another full copy arrives in 30 seconds. EIGRP never re-sends unless asked, so a lost update would leave a neighbour wrong *forever*. RTP adds acknowledgements and sequence numbers to the packets that matter (Update, Query, Reply) while letting Hellos go unacknowledged. *Partial, triggered updates are only safe if delivery is guaranteed — RTP is that guarantee.*

### The Three Tables

| Table | Command | What's in it |
|-------|---------|--------------|
| **Neighbor table** | `show ip eigrp neighbors` | Every adjacent EIGRP router, its hold time and RTP counters |
| **Topology table** | `show ip eigrp topology` | Every destination, with **every** neighbour's reported distance — the raw material for DUAL |
| **Routing table** | `show ip route eigrp` | Only the winners (successors), marked `D` (or `D EX` for external) |

### What Must Match to Become Neighbors

- Same **autonomous system number** (the `router eigrp 100` number — unlike OSPF's process ID, this one *does* have to match).
- Same **K-values** (5.4).
- Same **subnet** on the connecting interface (primary addresses).
- Matching **authentication**, if configured.

Hello and hold timers **don't** have to match — each router simply tells its neighbour how long to wait. That's a classic difference from OSPF, where mismatched hello/dead timers block the adjacency.

---

## 5.3 DUAL — How EIGRP Picks a Path and a Backup

DUAL (the **Diffusing Update Algorithm**) is the heart of EIGRP. It needs four terms, and the exam uses all of them:

| Term | Meaning |
|------|---------|
| **Reported distance (RD)** — also called *advertised distance (AD)* | The neighbour's own metric to the destination, as it told you |
| **Feasible distance (FD)** | *Your* best total metric to the destination (RD + the cost of the link to that neighbour), for the best path |
| **Successor** | The neighbour on the path with the lowest total metric — installed in the routing table |
| **Feasible successor (FS)** | A backup neighbour that passes the **feasibility condition**, ready to take over instantly |

**The feasibility condition:** a neighbour is a feasible successor only if its **RD is lower than the current FD**.

![DUAL at R1: R2 is successor, R3 feasible successor, R4 not a backup](images/c05_dual.png)

| Neighbour | RD (their distance) | Total via them | Verdict |
|-----------|---------------------|----------------|---------|
| R2 | 1000 | 3000 | **Successor** — lowest total, so FD = 3000 |
| R3 | 2500 | 4000 | **Feasible successor** — 2500 < 3000 |
| R4 | 3500 | 3600 | **Not a backup** — 3500 is not < 3000, even though its total (3600) beats R3's |

**Why does "RD < FD" prove a path is loop-free?** Think about what a loop would look like. If R4's path to 10.9.9.0 ran *back through R1*, then R4's distance would have to include R1's own distance — at least 3000 — plus R4's cost to reach R1, so R4's RD would be **greater** than 3000. Turn that around: if a neighbour reports a distance **smaller** than my own best, its path *can't* go through me, because nothing that goes through me can be shorter than me. *A neighbour who is closer to the destination than you are cannot be routing via you.* R4 might actually be fine — but EIGRP can't *prove* it, so it won't pre-approve it as a backup.

**Why does the FS matter so much?** Because it's what makes EIGRP converge in well under a second. When the successor fails and an FS exists, the router simply promotes it — no calculation, no asking anyone. The route stays **passive** (`P` in the topology table).

**And with no FS?** The route goes **active** (`A`): the router sends **Queries** to its neighbours asking "do you have another way?" and waits for every **Reply**. If replies never come back, the route becomes **stuck in active (SIA)** — a famous EIGRP failure mode that Chapter 26 dissects, along with the stub routers and summarization that prevent it.

### Reading the Topology Table

```
R1# show ip eigrp topology
EIGRP-IPv4 Topology Table for AS(100)/ID(1.1.1.1)
Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,
       r - reply Status, s - sia Status

P 10.9.9.0/24, 1 successors, FD is 3072
        via 10.0.12.2 (3072/2816), GigabitEthernet0/1
        via 10.0.13.3 (5632/2816), GigabitEthernet0/2
```

Each `via` line shows **(total metric / reported distance)**. The first line is the successor (3072 = FD). The second has RD 2816 < FD 3072, so it's a feasible successor — that's why it's listed at all. **`show ip eigrp topology` only shows successors and feasible successors**; to see every path EIGRP heard, including ones that failed the feasibility test, use `show ip eigrp topology all-links`.

---

## 5.4 The EIGRP Metric — K-Values, Classic and Wide

### The Classic Composite Metric

EIGRP's metric can combine **bandwidth, delay, load and reliability**, weighted by five **K-values**:

`metric = 256 × [ K1·BW + (K2·BW)/(256 − load) + K3·delay ] × [ K5/(reliability + K4) ]`

The last bracket is applied only when K5 is non-zero. With the defaults **K1 = 1, K2 = 0, K3 = 1, K4 = 0, K5 = 0**, the whole thing collapses to:

`metric = 256 × ( BW + delay )`

| Term | How it's calculated | Whose value? |
|------|---------------------|--------------|
| **BW** | 10,000,000 ÷ *slowest* bandwidth on the path (in kbps), truncated | The **minimum** along the path |
| **delay** | Sum of interface delays on the path, in **tens of microseconds** | The **total** along the path |

**Worked example.** A path crosses a T1 (1544 kbps, delay 20,000 µs) and a GigabitEthernet link (1,000,000 kbps, delay 10 µs):

- BW = 10,000,000 ÷ 1544 = **6476** (the T1 is the bottleneck)
- delay = (20,000 + 10) ÷ 10 = **2001**
- metric = 256 × (6476 + 2001) = **2,170,112**

**Why minimum bandwidth but total delay?** Because they describe different things. A path's **throughput** is limited by its narrowest pipe — a 10 Gbps link after a T1 doesn't make the T1 faster — so only the bottleneck matters. **Latency** is additive: every link adds its own delay. *Bandwidth is a bottleneck; delay is a sum.*

**Why are load and reliability switched off by default?** Because they change constantly. A metric built on load would rise when a link got busy, shift traffic away, fall, shift traffic back — a routing protocol oscillating with its own traffic. Cisco's own guidance is to leave K2, K4 and K5 at zero. **K-values must match between neighbours**, or the adjacency won't form (the log says `K-value mismatch`).

> **Exam trap — tune delay, not bandwidth.** To steer EIGRP traffic, change `delay` on an interface. `bandwidth` also feeds QoS and other protocols' calculations, so changing it to influence routing can break things elsewhere.

### Wide Metrics — Why Classic Ran Out of Room

Classic EIGRP's bandwidth term is 10⁷ ÷ kbps. For 10 Gbps that's 10⁷ ÷ 10⁷ = **1**; for 40 or 100 Gbps it truncates to **0**. And the smallest delay classic can express is 10 µs. So **every link at 10 Gbps and above looks identical** to classic EIGRP.

**Named mode** (5.6) uses **wide metrics**: a 64-bit calculation that measures delay in **picoseconds** and scales the bandwidth term by 65,536, so modern links are told apart again. Wide metrics also add a **K6** (for extended attributes such as jitter and energy; 0 by default). Because the routing table still holds a 32-bit metric, the 64-bit value is divided by the **RIB scale** (`metric rib-scale`, default **128**) before installation — which is why named-mode metrics in `show ip route` look different from the topology table.

*Same idea as OSPF's reference-bandwidth problem (CCNA guide 16.6): a 1990s scale that ran out of room at modern speeds.*

---

## 5.5 Load Balancing — Equal and Unequal Cost

**Equal-cost (ECMP).** Both EIGRP and OSPF install up to **4** equal-cost paths by default (`maximum-paths` raises it; the platform maximum varies, commonly 16 or 32). CEF then shares traffic across them per flow (5.8).

**Unequal-cost — EIGRP only.** The `variance` multiplier lets EIGRP use paths that are *worse* than the best:

```
R1(config)# router eigrp 100
R1(config-router)# variance 2          ! use any FS whose metric < 2 x FD
```

A path joins the routing table only if **both** hold:

1. It is a **feasible successor** (RD < FD) — so it's provably loop-free.
2. Its total metric is **less than variance × FD**.

Using the 5.3 numbers with `variance 2`: FD = 3000, so the limit is 6000. R3 (total 4000, FS) is installed alongside R2. R4 (total 3600) is **not** — it's under the limit but fails the feasibility condition. Traffic is then shared **in inverse proportion to metric** (`traffic-share balanced`, the default), so the better path carries more.

**Why can EIGRP do unequal-cost balancing but OSPF can't?** Because EIGRP has a built-in **proof of loop-freedom** for each alternative — the feasibility condition. OSPF's SPF produces one shortest-path tree; any non-shortest path is, by definition, not on it, and OSPF has no mechanism to prove a longer path won't loop. *Unequal-cost balancing is only safe if you can prove the worse path doesn't come back through you — and only EIGRP keeps that proof.*

---

## 5.6 Configuring EIGRP — Classic and Named Mode

### Classic (Autonomous-System) Mode

```
R1(config)# router eigrp 100                        ! AS 100 - must match neighbours
R1(config-router)# eigrp router-id 1.1.1.1          ! stable ID (used for externals, logs)
R1(config-router)# network 10.0.12.0 0.0.0.255      ! enable EIGRP on matching interfaces
R1(config-router)# network 192.168.1.0 0.0.0.255
R1(config-router)# passive-interface GigabitEthernet0/3   ! advertise, but no hellos
R1(config-router)# variance 2
```

Auto-summary is **off** by default since IOS 15.0 — older material that says otherwise predates it. Interface-level settings (timers, authentication, delay) are configured on each interface: `ip hello-interval eigrp 100 5`, `delay 100`.

### Named Mode — Everything in One Place

```
R1(config)# router eigrp CORP                       ! name is local only
R1(config-router)# address-family ipv4 unicast autonomous-system 100
R1(config-router-af)# eigrp router-id 1.1.1.1
R1(config-router-af)# network 10.0.12.0 0.0.0.255
R1(config-router-af)# af-interface default
R1(config-router-af-interface)# passive-interface    ! passive everywhere by default...
R1(config-router-af-interface)# exit-af-interface
R1(config-router-af)# af-interface GigabitEthernet0/1
R1(config-router-af-interface)# no passive-interface ! ...except toward real neighbours
R1(config-router-af-interface)# exit-af-interface
R1(config-router-af)# topology base
R1(config-router-af-topology)# variance 2            ! routing-table policy lives here
R1(config-router-af-topology)# maximum-paths 4
R1(config-router-af-topology)# exit-af-topology
R1(config-router-af)# exit-address-family
```

**Why did Cisco add named mode?** Because classic EIGRP scattered its configuration — process settings under `router eigrp`, timers and authentication under each interface, and IPv6 EIGRP as an entirely separate process (`ipv6 router eigrp`). Named mode gathers everything into one hierarchy with three levels: **address family** (IPv4 or IPv6, VRF), **af-interface** (per-link settings) and **topology base** (what goes into the routing table). It's also the only way to get **wide metrics** and features like SHA-256 authentication. *One AS number can be configured either way, and neighbours don't care which — classic and named mode routers peer happily.*

### Verifying

```
R1# show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(100)
H   Address        Interface   Hold Uptime   SRTT   RTO  Q  Seq
                               (sec)         (ms)        Cnt Num
0   10.0.12.2      Gi0/1         13 02:14:07    1   100  0  42
1   10.0.13.3      Gi0/2         12 02:13:58    2   100  0  37
```

**Q Cnt** (queue count) should be **0**. A Q Cnt that stays above zero means updates are waiting for acknowledgement — a struggling neighbour or a lossy link, and an early warning of SIA trouble. **Hold** counts down from 15 and resets with each hello; if it keeps reaching low single digits, hellos are being lost.

---

## 5.7 OSPF, Seen Side by Side

You know OSPF from CCNA (16.3–16.11); Chapter 6 extends it to multiple areas. For the comparison ENCOR asks for, what matters is:

- **Metric — cost.** `reference bandwidth ÷ interface bandwidth`, summed along the path. One dimension, no K-values. Set `auto-cost reference-bandwidth` identically everywhere (CCNA guide 16.6), or override per interface with `ip ospf cost`.
- **Load balancing — equal cost only.** Up to 4 paths by default (`maximum-paths`). No variance.
- **Path selection inside OSPF** — before cost is even compared, OSPF prefers route *types* in a fixed order: **intra-area (O) → inter-area (O IA) → external type 1 (E1/N1) → external type 2 (E2/N2)**. A cheaper inter-area path never beats an intra-area one. Chapter 27 covers this in depth.
- **Area types** — trade detail for simplicity:

| Area type | Keeps out | Gets instead |
|-----------|-----------|--------------|
| **Backbone (area 0)** | nothing | all areas connect through it |
| **Normal** | nothing | full detail |
| **Stub** | Types 4 and 5 (externals, and the ASBR summaries that locate them) | a default route from the ABR |
| **Totally stubby** | Types 3, 4 and 5 | a default route only |
| **NSSA** | Types 4 and 5 — but can originate its own externals as Type 7 | local externals (+ default if configured) |
| **Totally NSSA** | Types 3, 4 and 5 | local Type 7 externals + a default route |

EIGRP has **no areas** at all — it limits the blast radius of a change with **summarization** (which it can do on any interface, on any router) and **stub routers**, which stop queries from spreading.

### EIGRP vs OSPF — the Comparison Table

| Feature | EIGRP | OSPF |
|---------|-------|------|
| Type | Advanced distance vector | Link state |
| Algorithm | DUAL | Dijkstra SPF |
| Metric | Composite (bandwidth + delay by default) | Cost (bandwidth-based) |
| Transport | IP protocol 88, RTP | IP protocol 89 |
| Multicast | 224.0.0.10 / FF02::A | 224.0.0.5, 224.0.0.6 / FF02::5, FF02::6 |
| AD | 90 internal, 170 external | 110 |
| Hierarchy | Flat — no areas | Areas, area 0 mandatory backbone |
| Summarization | Any interface, any router | Only at ABRs and ASBRs |
| Unequal-cost balancing | Yes (`variance`) | No |
| Backup path | Pre-computed feasible successor | Recomputed by SPF |
| Neighbor match | AS number, K-values, subnet, auth | Area, subnet, timers, auth, MTU, stub flag, network type compatibility |
| Vendor support | Cisco (RFC 7868 informational) | Open standard, every vendor |

**Why would anyone choose EIGRP over OSPF, or vice versa?** EIGRP is simpler to design (no area planning), converges extremely fast with feasible successors, and summarizes anywhere. OSPF is a **multi-vendor standard** with a predictable hierarchical design and far better visibility — every router can show you the full map of its area. *Mixed-vendor or very large structured networks lean OSPF; all-Cisco networks that value simplicity often run EIGRP.*

---

## 5.8 Path Selection — the Order a Router Actually Uses

A router answers "where does this packet go?" by applying three rules in a **fixed order**. Mixing up the order is one of the most common CCNP mistakes.

| Step | Rule | Decides between |
|------|------|-----------------|
| **1** | **Longest prefix match** | Different prefixes covering the destination — the most specific wins, always |
| **2** | **Administrative distance** | The *same* prefix learned from different sources — lowest AD gets into the RIB |
| **3** | **Metric** | The *same* prefix from the *same* protocol — lowest metric wins (ties → ECMP) |

**Worked example.** R1's routing table holds:

| Route | Source | AD/metric |
|-------|--------|-----------|
| 10.1.0.0/16 | EIGRP | 90/3072 |
| 10.1.1.0/24 | OSPF | 110/20 |
| 0.0.0.0/0 | static | 1/0 |

A packet to **10.1.1.5** follows the **OSPF /24**. EIGRP's lower AD is irrelevant: AD only compares routes for the **same prefix**, and /24 and /16 are different prefixes. Longest match is decided at forwarding time, among everything already in the table. *AD decides what gets into the table; longest match decides what gets used.*

### Administrative Distance Reference

| Source | AD |
|--------|----|
| Connected | 0 |
| Static | 1 |
| EIGRP summary | 5 |
| **eBGP** | **20** |
| **EIGRP (internal)** | **90** |
| **OSPF** | **110** |
| IS-IS | 115 |
| RIP | 120 |
| **EIGRP external** | **170** |
| **iBGP** | **200** |
| Unknown / unusable | 255 (never installed) |

Chapter 22 shows how AD causes real-world problems — especially when routes are redistributed — and how to change it with `distance`.

### 🔬 From RIB to FIB — How the Decision Actually Gets Executed

Running a lookup through the routing table for every packet would be far too slow, so IOS uses **Cisco Express Forwarding (CEF)**:

| Structure | Built from | Holds |
|-----------|-----------|-------|
| **RIB** (routing table) | Routing protocols, statics, connected | Best routes, possibly with recursive next hops |
| **FIB** (`show ip cef`) | The RIB, with recursion pre-resolved | Prefix → final next hop + outgoing interface |
| **Adjacency table** (`show adjacency detail`) | ARP / ND | Pre-built Layer 2 rewrite headers per next hop |

**Why pre-compute both tables?** Because the slow parts of forwarding — recursive lookups ("the next hop for this BGP route is reached via that OSPF route") and building the new Ethernet header — are done **once, when the topology changes**, not per packet. The per-packet work becomes one longest-match lookup in the FIB and a header copy from the adjacency table, simple enough to do in hardware. That's the **control plane** (building the tables) and **data plane** (using them) split you'll meet again with SD-WAN and SD-Access in Chapter 14.

**ECMP and CEF.** With multiple equal paths, CEF load-shares **per destination (per flow) by default**, hashing source and destination addresses so one conversation always takes one path. Per-packet sharing (`ip load-sharing per-packet`) exists but reorders packets, which TCP treats as loss — avoid it. *Same reasoning as EtherChannel hashing (CCNA guide 10.4).*

---

## 5.9 Policy-Based Routing — Routing by Something Other Than Destination

Every rule in 5.8 looks at **one** field: the destination address. Sometimes that isn't what you want:

- Guest traffic should leave through the cheap internet link, staff traffic through the MPLS WAN.
- Traffic from the backup server should take the slow link so it doesn't crowd out users.
- Voice should prefer the low-latency path regardless of what OSPF thinks.

**Policy-based routing (PBR)** lets you match packets on **source address, protocol, ports, packet length** — anything an ACL can match — and override the routing table's answer.

### How It's Built

PBR is a **route map** (Chapter 23 covers route maps fully) applied to an **incoming** interface:

```
R1(config)# ip access-list extended GUEST-NET
R1(config-ext-nacl)# permit ip 10.50.0.0 0.0.255.255 any
R1(config)# route-map WAN-POLICY permit 10
R1(config-route-map)# match ip address GUEST-NET      ! which packets
R1(config-route-map)# set ip next-hop 203.0.113.1     ! where they go instead
R1(config)# interface GigabitEthernet0/2              ! the interface guests ARRIVE on
R1(config-if)# ip policy route-map WAN-POLICY
```

| Piece | Role |
|-------|------|
| `match ip address` | Selects packets via an ACL |
| `set ip next-hop` | Forces the next hop, ignoring the routing table |
| `set ip default next-hop` | Used **only if** the routing table has no explicit route (default route excluded) |
| `set interface` | Forces the exit interface (best used on point-to-point links) |
| `ip policy route-map` | Applies PBR to packets **arriving** on this interface |
| `ip local policy route-map` | Applies PBR to packets the **router itself** originates (pings, syslog, SNMP) |

**What happens to traffic the route map doesn't match?** It's routed **normally**. A packet that falls through every sequence, or hits a `deny` sequence, simply uses the routing table. PBR is an override, not a replacement. Likewise, if the configured next hop isn't reachable (not on a connected, up subnet), the packet falls back to normal routing.

**Why is PBR applied inbound and not outbound?** Because the forwarding decision happens when a packet **arrives**. By the time a packet is queued on an outgoing interface, the router has already chosen that interface — there's nothing left to override. That's also why router-generated traffic needs the separate `ip local policy`: those packets never arrive on any interface.

**Why not use PBR everywhere?** Because it's **invisible to the routing protocols**. OSPF and EIGRP don't know about the policy, so they can't route around a failed policy next hop (unless you add tracking — Chapter 25), and anyone troubleshooting with `show ip route` sees the wrong answer. *PBR is a precise tool for exceptions; if most traffic needs it, the routing design is wrong.*

Chapter 25 covers PBR configuration in depth — `verify-availability` with IP SLA tracking, `set ip next-hop recursive`, and verifying with `show route-map` and `debug ip policy`.

---

## 5.10 Summary — What to Be Able to Explain

| You should be able to… | Section |
|------------------------|---------|
| Explain why EIGRP is "advanced distance vector", not link state | 5.1 |
| Define RD, FD, successor, FS and apply the feasibility condition | 5.3 |
| Calculate a classic EIGRP metric and explain why wide metrics exist | 5.4 |
| Explain why only EIGRP does unequal-cost load balancing | 5.5 |
| Configure EIGRP in classic and named mode | 5.6 |
| Compare EIGRP and OSPF across metric, hierarchy, convergence and area types | 5.7 |
| Apply longest-match → AD → metric in the right order | 5.8 |
| Describe what PBR does, where it's applied and when it falls back | 5.9 |

---

<a name="chapter-6"></a>
# Chapter 6: OSPFv2/v3 — Multi-Area, Summarization & Filtering

> **Blueprint:** ENCOR 3.2.b — Configure simple OSPFv2/v3 environments, including multiple normal areas, summarization, and filtering (neighbor adjacency, point-to-point and broadcast network types, and passive-interface).

The CCNA guide built single-area OSPF (16.3–16.10) and then lifted the lid in 16.11: adjacency states, LSA types, and stub areas. This chapter turns that preview into a working multi-area design — the shape almost every real OSPF network has — and adds the two tools that make areas worth having: **summarization** and **filtering**. It finishes with **OSPFv3**, which is OSPF for IPv6 (and, optionally, IPv4 too).

Chapter 27 goes further for ENARSI: NBMA network types, virtual links, the full area-type matrix and authentication.

---

## 6.1 Why Multiple Areas — and the Router Roles They Create

Recall the reason areas exist (CCNA guide 16.5): in one big area, every router stores every link and reruns SPF whenever **any** link anywhere flaps. Areas **contain the detail**. Inside an area, routers know the full map; between areas, they exchange only **summaries** of what's reachable.

That creates four router roles — one router can hold several at once:

| Role | Definition | Example below |
|------|------------|---------------|
| **Internal router** | All interfaces in one area | R1 |
| **Backbone router** | At least one interface in area 0 | R3, ABR1, ABR2 |
| **ABR** (Area Border Router) | Interfaces in area 0 **and** at least one other area | ABR1, ABR2 |
| **ASBR** (Autonomous System Boundary Router) | Redistributes routes from outside OSPF | R5 |

![Multi-area OSPF with an ABR between each area and an ASBR in an NSSA](images/c06_multiarea.png)

**The golden rule:** every non-backbone area must touch **area 0**, and traffic between two non-backbone areas always crosses area 0. **Why?** Because inter-area routing in OSPF is really **distance vector**. An ABR doesn't pass area 1's map into area 0 — it passes "network X, cost Y", the same kind of rumour RIP trades. Rumours can loop. Forcing every inter-area exchange through a single backbone gives the rumours a strict hub-and-spoke shape with no path back around, so they can't loop. *Inside an area OSPF is link state; between areas it's a distance-vector star centred on area 0.* (An area that can't physically reach area 0 needs a **virtual link** — Chapter 27.)

---

## 6.2 LSA Types — What Each Router Says, and How Far It Travels

The CCNA guide listed the LSA types (16.11). Here's what each one is **for** in a multi-area network, and the command that shows it:

| Type | Name | Generated by | Floods within | Becomes route code | `show ip ospf database …` |
|------|------|--------------|---------------|--------------------|---------------------------|
| **1** | Router | Every router | Its own area | `O` | `router` |
| **2** | Network | The **DR** on a broadcast segment | Its own area | `O` | `network` |
| **3** | Summary | **ABR** — one per prefix (or per range) | Into the next area | `O IA` | `summary` |
| **4** | ASBR summary | **ABR** — "the ASBR is reachable via me" | Into the next area | — (none) | `asbr-summary` |
| **5** | External | **ASBR** | Whole OSPF domain (not stub areas) | `O E1` / `O E2` | `external` |
| **7** | NSSA external | **ASBR inside an NSSA** | That NSSA only | `O N1` / `O N2` | `nssa-external` |

Following the diagram from left to right:

1. **R1** describes its links in a **Type 1**; a DR on any area 1 LAN adds a **Type 2**. Both stay inside area 1.
2. **ABR1** reads area 1's Type 1/2 database, works out each prefix and its cost, and advertises each prefix into area 0 as a **Type 3**. Area 0 routers see `O IA` routes — "inter-area, reached via ABR1."
3. **R5** redistributes EIGRP routes. Because area 2 is an NSSA (6.3), they enter as **Type 7**.
4. **ABR2** translates each Type 7 into a **Type 5** and floods it to the rest of the domain. In the translated LSA, **ABR2 itself** is the advertising router, not R5. Area 0 routers already know how to reach ABR2 from its Type 1 LSA, so nothing more is needed there. Routers in **area 1** don't have ABR2's Type 1, so **ABR1** advertises a **Type 4** into area 1 saying "ABR2, the router advertising these externals, is reachable through me."

**Why is a Type 4 needed at all?** A Type 5 says "network X is reachable via ASBR R5" — but routers in area 1 have never seen R5's Type 1 LSA (it's in another area), so they have no idea how to reach R5. The ABR fills the gap with a Type 4: "R5 is reachable through me, at this cost." *Type 5 says what's out there; Type 4 says how to get to the router that said it.* (When an NSSA ABR translates Type 7 to Type 5, **the ABR itself** becomes the advertising router, so other areas just need a path to the ABR.)

### E1 versus E2

External routes come in two metric styles, chosen at redistribution time (`metric-type 1` or `2`):

| Type | Metric used | Default? | Use when |
|------|-------------|----------|----------|
| **E2 / N2** | The external **seed metric only** — internal cost to the ASBR is ignored | **Yes** (seed 20; 1 for routes from BGP) | One exit point, or you don't care which ASBR is used |
| **E1 / N1** | Seed metric **plus** the internal cost to reach the ASBR | No | Several ASBRs advertise the same prefix and you want the *closest* one used |

With E2, if two E2 routes have the same seed metric, OSPF does break the tie on the cost to the ASBR (the "forward metric") — but it never adds it into the displayed metric.

---

## 6.3 Area Types at ENCOR Depth

ENCOR 3.2.b asks for **multiple normal areas**; Chapter 5.7 summarised the special types. Configuration is short:

| Area type | Config (in `router ospf`) | Where |
|-----------|---------------------------|-------|
| Stub | `area 1 stub` | **Every** router in area 1 |
| Totally stubby | `area 1 stub no-summary` | ABR only (other routers just need `area 1 stub`) |
| NSSA | `area 2 nssa` | Every router in area 2 |
| Totally NSSA | `area 2 nssa no-summary` | ABR only (others need `area 2 nssa`) |

**Why must every router in a stub area agree?** Because the stub setting is carried as a **flag in the Hello** (the E-bit). Two routers that disagree about whether external LSAs may exist in their area would build different databases — so OSPF refuses the adjacency. *A mismatched stub flag is one of the quieter reasons neighbours never form.*

**Default routes:** stub and totally stubby areas get a Type 3 default from the ABR automatically, and so does a totally NSSA. A plain **NSSA does not** — add `area 2 nssa default-information-originate` on the ABR if area 2 needs one.

### Originating a Default Into Normal Areas

In normal areas, a default route is just another external route, and it's created on the router that owns the exit (typically the internet edge) with **`default-information originate`**:

```
EDGE(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1          ! the real exit
EDGE(config)# router ospf 1
EDGE(config-router)# default-information originate          ! only while a default is in RIB
EDGE(config-router)# default-information originate always   ! ...or: advertise it regardless
EDGE(config-router)# default-information originate metric 10 metric-type 1  ! optional
```

The command makes EDGE an **ASBR** and floods `0.0.0.0/0` as a **Type 5** LSA, seen elsewhere as `O*E2 0.0.0.0/0` (metric 1, type E2 by default).

**Without `always`**, nothing is originated unless EDGE has a default route in its routing table from **some other source**, such as a static route, DHCP or BGP. If that default disappears, the Type 5 is withdrawn. **Why is that the safer default behaviour?** Because the default route is a promise: "send me anything you can't route and I'll deliver it." If EDGE has lost its own exit, it can't keep that promise, and withdrawing the advertisement lets the rest of the network fail over to another exit. **`always`** keeps advertising even with no default in EDGE's RIB. Use it when the default should point at EDGE no matter what, for example when EDGE forwards to a firewall reached by a route that isn't a default. Used carelessly, it **black-holes** traffic at a router that has nowhere to send it.

With two internet exits, advertise the default from both and use `metric-type 1` (E1) so each router picks the **closest** exit, or give one exit a lower `metric` to make it primary.

---

## 6.4 Configuring Multi-Area OSPFv2

Two ways to put an interface in an area. Both are valid IOS XE, and you'll see both on the exam:

```
! Method 1 - network statements (wildcard match, as in CCNA)
ABR1(config)# router ospf 1
ABR1(config-router)# router-id 2.2.2.2
ABR1(config-router)# network 10.1.12.0 0.0.0.255 area 1
ABR1(config-router)# network 10.0.23.0 0.0.0.255 area 0

! Method 2 - directly on the interface (clearer, and wins over network statements)
ABR1(config)# interface GigabitEthernet0/1
ABR1(config-if)# ip ospf 1 area 1
ABR1(config)# interface GigabitEthernet0/2
ABR1(config-if)# ip ospf 1 area 0
```

**Why prefer interface mode?** Because it's explicit. A `network` statement is a pattern; if someone later adds an interface whose address happens to match, it silently joins OSPF, in whatever area the pattern says. Interface-level `ip ospf 1 area 1` puts exactly one interface in exactly one area, and reading the interface config tells you everything. *Patterns surprise you; statements don't.*

An ABR needs nothing special — it **becomes** an ABR the moment it has interfaces in area 0 and another area. Verify with:

```
ABR1# show ip ospf | include border|Number of areas in
 It is an area border router
 Number of areas in this router is 2. 2 normal 0 stub 0 nssa
```

The full `show ip ospf` output then lists each area (`Area BACKBONE(0)`, `Area 1`) with its interface count, authentication and configured ranges.

---

## 6.5 Summarization

Without summarization, ABR1 sends one Type 3 LSA into area 0 for **every** prefix in area 1. A flap of any one of them ripples into every other area as a changed Type 3. Summarization replaces the list with one advertisement — and a single summary only changes if **every** component route disappears.

OSPF can summarize in exactly **two** places, each with its own command:

| Where | Summarizes | Command (under `router ospf`) |
|-------|-----------|-------------------------------|
| **ABR** | Internal routes (Type 1/2) of an area, into Type 3s | `area <area-id> range <net> <mask>` |
| **ASBR** | Redistributed externals (Type 5 or 7) | `summary-address <net> <mask>` |

### Inter-Area Summary at the ABR

Area 1 contains 10.1.0.0/24, 10.1.1.0/24, 10.1.2.0/24 and 10.1.3.0/24:

```
ABR1(config)# router ospf 1
ABR1(config-router)# area 1 range 10.1.0.0 255.255.252.0    ! one /22 instead of four /24s
```

The `area` number is the area **the routes live in** (area 1), not the area the summary is sent to. Now area 0 sees a single `O IA 10.1.0.0/22`. On ABR1 itself a new route appears:

```
ABR1# show ip route ospf | include Null0
O        10.1.0.0/22 is a summary, 00:01:12, Null0
```

**Why does the ABR install a summary route pointing at Null0?** To prevent a loop. Suppose 10.1.3.0/24 goes down. Other areas still route 10.1.3.x toward ABR1 (the /22 summary is still advertised). ABR1 has no /24 anymore, so without the discard route it would follow its **default route** — possibly straight back into area 0, which sends it back to ABR1, and so on until the TTL dies. The Null0 summary catches anything inside the /22 that has no more specific route and **drops it** on the spot. *A summary is a promise; the Null0 route makes sure the router can't keep that promise by bouncing traffic in circles.*

### External Summary at the ASBR

```
R5(config)# router ospf 1
R5(config-router)# summary-address 172.16.0.0 255.255.0.0   ! summarize redistributed routes
```

> **Exam trap — right command, right router.** `area range` on an ASBR does **nothing** to external routes, and `summary-address` on an ABR does **nothing** to inter-area routes. Inter-area: `area range` on the ABR. External: `summary-address` on the ASBR (or on the NSSA ABR doing the Type 7→5 translation).

**The design price of summarizing:** you lose detail. Routers outside the area can no longer see that 10.1.3.0/24 is down — they'll keep sending traffic to ABR1, which drops it. And with two ABRs advertising the same summary, a failure *behind* one of them is invisible to the other areas. Summaries trade precision for stability.

---

## 6.6 Filtering

Filtering in OSPF is unusual, because of the link-state rule that **every router in an area must hold an identical LSDB**. You can't simply stop an LSA from reaching one router in the middle of an area. What you *can* do depends on where you are:

| Tool | Where | What it actually filters | Effect on LSDB |
|------|-------|--------------------------|----------------|
| `area X filter-list prefix NAME in|out` | ABR | **Type 3** LSAs entering (`in`) or leaving (`out`) area X | Changes other areas' LSDBs — consistently |
| `area X range … not-advertise` | ABR | Suppresses the summary (and its components) | Same — no Type 3 is created |
| `distribute-list … in` | Any router | Routes going from the LSDB **into the routing table** | **None** — LSAs still arrive and flood on |
| `distribute-list … out` | ASBR | Redistributed routes before they become Type 5/7 | Externals never created |

### Type 3 Filtering at the ABR

Stop area 0 (and everything beyond it) from learning area 1's lab network 10.1.3.0/24:

```
ABR1(config)# ip prefix-list NO-LAB seq 5 deny 10.1.3.0/24
ABR1(config)# ip prefix-list NO-LAB seq 10 permit 0.0.0.0/0 le 32   ! allow everything else
ABR1(config)# router ospf 1
ABR1(config-router)# area 1 filter-list prefix NO-LAB out           ! out OF area 1
```

`out` means "Type 3s generated **from** area 1's routes"; `in` means "Type 3s being sent **into** area 1." Don't forget the final `permit … le 32`: like an ACL, a prefix list ends in an **implicit deny**, and without that line you'd filter every inter-area route. (Prefix-list syntax in full: Chapter 23.)

### The distribute-list "in" Trap

```
R3(config)# router ospf 1
R3(config-router)# distribute-list prefix NO-LAB in
```

This removes 10.1.3.0/24 from **R3's routing table only**. R3 still holds the LSA, still floods it to its neighbours, and they still install the route — and may forward traffic for it **to R3**, which now has no route and drops it (or follows a default). *A distribute-list in OSPF is a local blindfold, not a wall.* Use it deliberately, for example to stop one router installing a path it shouldn't use; use ABR filtering when you mean "this area should not know."

---

## 6.7 Neighbor Adjacency — Network Types & Passive Interfaces

### Point-to-Point vs Broadcast

You know both from CCNA (16.10). The ENCOR-level detail is what happens when they **mismatch**:

| Network type | DR/BDR | Hello / Dead | Default on |
|--------------|--------|--------------|------------|
| **Broadcast** | Yes | 10 / 40 s | Ethernet |
| **Point-to-point** | No | 10 / 40 s | Serial (HDLC/PPP), GRE tunnels |
| Non-broadcast, point-to-multipoint | (Chapter 27) | 30 / 120 s | Frame Relay–style NBMA |

On an Ethernet link between exactly two routers, it's common to change the type so no DR election is held:

```
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip ospf network point-to-point     ! configure on BOTH ends
```

### DR/BDR on Broadcast Links — a Recap

On a **broadcast** segment, OSPF elects a **DR** and **BDR** (CCNA guide 16.10). Every other router (DROTHER) forms a full adjacency only with those two. The rules that ENCOR still tests:

- **Highest interface priority wins** (`ip ospf priority 0–255`, default 1), then **highest router ID**.
- **Priority 0** = never DR or BDR.
- The election is **not preemptive**. A better router arriving later doesn't take over until the DR fails or OSPF is reset (`clear ip ospf process`).

```
R4(config-if)# ip ospf priority 0            ! R4 may never be DR/BDR on this segment
R4# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1         100   FULL/DR         00:00:36    10.1.1.1        GigabitEthernet0/0
2.2.2.2          50   FULL/BDR        00:00:33    10.1.1.2        GigabitEthernet0/0
3.3.3.3           1   2WAY/DROTHER    00:00:38    10.1.1.3        GigabitEthernet0/0
```

**Read the last line carefully:** two DROTHERs stop at **2WAY** with each other by design, so `2WAY/DROTHER` is healthy, not stuck. FULL with the DR and BDR, 2WAY with other DROTHERs, is a correct broadcast segment. A neighbor stuck in 2WAY on a **point-to-point** link is the problem case.

### The Sneaky Mismatch

One end set to `ip ospf network point-to-point`, the other left as broadcast. The timers are identical (10/40), so the hellos are accepted and the adjacency may even reach **FULL**. But the broadcast side expects a DR and describes the link through a Type 2 LSA, while the point-to-point side doesn't. The two routers describe the same link differently, SPF can't match them up, and **routes across that link never appear**. *FULL neighbours with missing routes should make you check `show ip ospf interface` on both ends.*

Neighbour requirements you must be able to recite (and the command that proves each):

| Must match | Proven by |
|------------|-----------|
| Area ID | `show ip ospf interface` |
| Subnet and mask (on broadcast links) | `show ip interface brief`, `show run interface` |
| Hello / dead intervals | `show ip ospf interface` |
| Authentication type and key | `debug ip ospf adj` ("Mismatched authentication") |
| Stub/NSSA flags | `debug ip ospf hello` ("mismatched Stub/Transit area option bit") |
| MTU (or the adjacency stalls in ExStart/Exchange) | `show interface | include MTU` |
| **Unique** router IDs | `show ip ospf` — duplicates log `%OSPF-4-DUP_RTRID` |

### Passive Interfaces

```
R1(config)# router ospf 1
R1(config-router)# passive-interface default                ! no hellos anywhere...
R1(config-router)# no passive-interface GigabitEthernet0/1  ! ...except to real neighbours
```

A passive interface **stops sending and processing hellos** — so no neighbour can form on it — but its subnet is **still advertised**. That's exactly right for user LANs: the users' subnet must be reachable, but no device there should be able to become an OSPF neighbour and inject routes.

**Why "passive-interface default" rather than listing the user ports?** Safety by default. A new interface added next year is passive unless someone consciously makes it a routing link. *Fail closed: an interface has to be invited into the routing protocol, not remembered and excluded.*

---

## 6.8 OSPFv3 — OSPF for IPv6 (and IPv4)

OSPFv3 (RFC 5340) is the same protocol — same areas, LSA flooding, SPF, DR/BDR, network types — rebuilt for IPv6. What changed:

| Topic | OSPFv2 | OSPFv3 |
|-------|--------|--------|
| Runs over | IPv4 subnets | IPv6 **links** — an interface can have many prefixes |
| Multicast | 224.0.0.5 / 224.0.0.6 | **FF02::5 / FF02::6** |
| Neighbour addresses / next hops | Interface IPv4 address | **Link-local** addresses |
| Router ID | 32-bit | **Still 32-bit, dotted** — set it manually if the router has no IPv4 address |
| Addressing in Type 1/2 | Yes | **No** — topology only; prefixes moved to new LSAs |
| New LSAs | — | **Type 8** link LSA (link-local + prefixes on a link), **Type 9** intra-area-prefix LSA |
| Authentication | In OSPF itself | IPsec (or the OSPFv3 authentication trailer) |

**Why separate topology from addressing?** In OSPFv2 a prefix change on a router changes its Type 1 LSA, and a changed Type 1 means a full SPF run for the area. OSPFv3 keeps topology (Type 1/2) and prefixes (Type 8/9) in separate LSAs, so adding or removing a prefix triggers only a cheap partial recalculation. *The map of the roads and the list of addresses on each road change at different speeds, so OSPFv3 keeps them on different pages.*

### Traditional OSPFv3 Configuration

```
R1(config)# ipv6 unicast-routing                     ! IPv6 routing is OFF by default
R1(config)# ipv6 router ospf 1
R1(config-rtr)# router-id 1.1.1.1                    ! required if no IPv4 address exists
R1(config-rtr)# passive-interface GigabitEthernet0/3
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ipv6 address 2001:db8:12::1/64
R1(config-if)# ipv6 ospf 1 area 0                    ! no network statements in OSPFv3
```

### Address-Family OSPFv3 — One Process, Both Protocols

Modern IOS XE uses `router ospfv3` with **address families**, which can carry **IPv4 routes too** — over the same IPv6-style protocol machinery:

```
R1(config)# router ospfv3 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# address-family ipv6 unicast
R1(config-router-af)# passive-interface default
R1(config-router-af)# no passive-interface GigabitEthernet0/1
R1(config-router-af)# area 1 range 2001:db8:1::/48    ! IPv6 inter-area summary
R1(config-router-af)# exit-address-family
R1(config-router)# address-family ipv4 unicast
R1(config-router-af)# exit-address-family
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ospfv3 1 ipv6 area 0
R1(config-if)# ospfv3 1 ipv4 area 0                  ! same link, IPv4 AF (needs IPv6 enabled)
```

Each address family runs as a **separate instance** with its own neighbours and database, so `show ospfv3 neighbor` lists them per AF. The IPv4 address family still needs IPv6 enabled on the interface, because OSPFv3 packets themselves always travel over IPv6 link-local addresses.

### Verifying OSPFv3

```
R1# show ospfv3 neighbor
          OSPFv3 1 address-family ipv6 (router-id 1.1.1.1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
2.2.2.2           1   FULL/BDR        00:00:36    4               GigabitEthernet0/1

R1# show ipv6 route ospf
OI  2001:DB8:1::/48 [110/2]
     via FE80::2, GigabitEthernet0/1
```

Note the **link-local next hop** (`FE80::2`) — that's normal and correct for OSPFv3. The traditional-mode commands (`show ipv6 ospf neighbor`, `show ipv6 ospf interface`) still work for processes configured with `ipv6 router ospf`.

---

## 6.9 Verification and Troubleshooting Toolkit

| Command | Answers |
|---------|---------|
| `show ip ospf interface brief` | Which interfaces run OSPF, in which area, cost, state (DR/BDR/P2P) |
| `show ip ospf interface Gi0/1` | Network type, timers, DR/BDR, passive status |
| `show ip ospf neighbor` | Neighbours and adjacency state |
| `show ip ospf database` | LSDB summary per area and LSA type |
| `show ip ospf border-routers` | How this router reaches each ABR and ASBR |
| `show ip route ospf` | What made it into the RIB (`O`, `O IA`, `O E1/E2`, `O N1/N2`) |
| `show ip protocols` | Router ID, areas, networks, passive interfaces, distribute-lists |

| Symptom | Likely cause | Prove it with |
|---------|--------------|---------------|
| No neighbour at all | Passive interface, wrong area, ACL blocking 224.0.0.5, subnet mismatch | `show ip ospf interface`, `show ip protocols` |
| Neighbour stuck in **Init** | One-way hellos — ACL or multicast problem on one side | `debug ip ospf hello` |
| Stuck in **ExStart/Exchange** | MTU mismatch | `show interface | include MTU` |
| FULL, but routes missing across the link | Network-type mismatch (p2p vs broadcast) | `show ip ospf interface` on both ends |
| Route present in LSDB but not in RIB | `distribute-list in`, or a better-AD route from another protocol | `show ip protocols`, `show ip route <prefix>` |
| Inter-area route missing everywhere | `area filter-list` or `range … not-advertise` on the ABR; area not connected to area 0 | `show run | section router ospf` on ABRs |
| External route missing in one area | Area is stub/totally stubby (by design) | `show ip ospf` — area type |
| Summary not appearing | `area range` used for externals, or `summary-address` used on an ABR | Check which router type you're on |

---

## 6.10 Summary — What to Be Able to Explain

| You should be able to… | Section |
|------------------------|---------|
| Name the router roles and why every area must touch area 0 | 6.1 |
| Say which router generates each LSA type and how far it floods | 6.2 |
| Explain E1 vs E2 | 6.2 |
| Configure stub/totally stubby/NSSA and say where each command goes | 6.3 |
| Configure multi-area OSPF with network statements or interface mode | 6.4 |
| Summarize at an ABR vs an ASBR, and explain the Null0 route | 6.5 |
| Filter Type 3s at an ABR and explain why distribute-list in is local only | 6.6 |
| Diagnose p2p/broadcast mismatches and use passive-interface correctly | 6.7 |
| Configure OSPFv3 traditionally and with address families | 6.8 |

---

<a name="chapter-7"></a>
# Chapter 7: BGP Fundamentals & eBGP

> **Blueprint:** ENCOR 3.2.c — Configure and verify eBGP between directly connected neighbors (best path selection algorithm and neighbor relationships).

BGP is the biggest new protocol of CCNP, and the one the CCNA never touched. It's also the protocol that runs the internet: every ISP, cloud provider and multi-homed enterprise uses it to tell the rest of the world which addresses it owns. ENCOR asks you to bring up **eBGP between directly connected neighbours** and to understand **how BGP picks a best path**. Chapter 28 takes it to ENARSI depth — iBGP, route reflectors, multihop, policy and IPv6.

The single most useful thing to grasp before any command: **BGP is not trying to find the fastest path. It's trying to find the path your policy prefers.**

---

## 7.1 Why BGP Exists — Routing Between Organizations

OSPF and EIGRP are **IGPs** (Interior Gateway Protocols): they run inside one organization, where everyone trusts everyone and the goal is the shortest path. Between organizations, both assumptions collapse:

- **Nobody trusts anybody.** Your ISP will not let you join its OSPF and see its internal map, and you shouldn't want to.
- **"Shortest" isn't the goal.** You prefer the ISP you pay less, an ISP prefers its paying customers over its peers, and a bank may require that its traffic never crosses certain countries. Those are **business** decisions.
- **Scale.** The global IPv4 table is around a million prefixes. SPF over that, recomputed on every change anywhere, is impossible.

BGP (Border Gateway Protocol, version 4) answers all three. It's an **EGP** — an Exterior Gateway Protocol — and a **path-vector** protocol.

**Why "path vector"?** Every BGP route carries the **list of autonomous systems** it has passed through — the `AS_PATH`. That list does two jobs. It's a **rough distance** (fewer ASes is usually better), and it's a **loop detector**: a router that sees its **own AS number** in an incoming path rejects the route, because accepting it would mean routing through itself.

![AS_PATH loop prevention: R1 rejects a path that already contains AS 65001](images/c07_aspath.png)

*No hop counts, no feasibility maths, no shared map — the path itself is the proof.* That is why BGP needs no areas and no SPF to stay loop-free across tens of thousands of independent networks.

### BGP Terms You Need First

| Term | Meaning |
|------|---------|
| **Autonomous System (AS)** | A network under one administrative policy, identified by an **AS number (ASN)** |
| **eBGP** | BGP between routers in **different** ASes — AD **20** |
| **iBGP** | BGP between routers in the **same** AS — AD **200** (Chapter 28) |
| **Prefix / NLRI** | A route BGP advertises (Network Layer Reachability Information) |
| **Path attributes** | The properties attached to each prefix (AS_PATH, NEXT_HOP, LOCAL_PREF, MED…) that policy reads and changes |

**Why is eBGP's AD 20 — better than OSPF — but iBGP's 200?** An eBGP route came from **outside** your network, from the only router that actually knows it; nothing inside your AS can know better, so trust it over your IGP. An iBGP route came from **inside**, where your IGP already describes the topology directly; if the IGP and iBGP both know a prefix, the IGP's first-hand knowledge should win. *Trust outsiders about the outside, insiders' own map about the inside.*

---

## 7.2 Autonomous System Numbers

| Range | Type | Use |
|-------|------|-----|
| 1 – 64,495 | Public 2-byte | Assigned by RIRs (ARIN, RIPE…) |
| 64,496 – 64,511 | Documentation (RFC 5398) | Reserved for examples in books and RFCs, like 192.0.2.0/24 for addresses |
| **64,512 – 65,534** | **Private 2-byte** | Internal use, labs, customer-to-ISP links — never seen on the internet |
| 65,536 – 4,199,999,999 | Public 4-byte | Assigned since 2-byte numbers ran out |
| **4,200,000,000 – 4,294,967,294** | **Private 4-byte** | Internal use |
| 0, 65,535, 4,294,967,295 | Reserved | Never used |
| 23,456 | AS_TRANS | Stands in for a 4-byte ASN when talking to an old 2-byte-only router |

4-byte ASNs can be written as plain numbers (**asplain**, e.g. `65538`) or as two 16-bit halves (**asdot**, e.g. `1.2`). IOS XE uses asplain by default; `bgp asnotation dot` switches the display.

**Why do private ASNs exist?** For the same reason private IP addresses do (CCNA guide 11.4). An enterprise that connects to a single ISP still needs an ASN to run BGP, but the outside world never needs to see it — the ISP strips the private ASN (`remove-private-as`) and advertises the customer's prefixes as part of its own AS.

---

## 7.3 How a BGP Session Works

### Neighbours Are Configured, Not Discovered

IGPs find neighbours with multicast hellos. BGP doesn't. Every neighbour is **configured by hand** with its IP address and AS number, and BGP talks to it over **TCP port 179** — ordinary unicast TCP.

**Why TCP, when OSPF and EIGRP built their own reliability?** Because BGP's updates are huge (a full internet table) and travel between organizations, potentially across many hops. TCP already solves reliable, ordered, flow-controlled delivery of large data — so BGP simply uses it and spends no effort reinventing it. It's also why BGP sends updates **once** and afterwards only changes: TCP guarantees they arrived. *BGP is an application that happens to carry routes.*

**Why configure neighbours manually?** Because a BGP session is a **business relationship**. You peer with a specific ISP on a specific link under a contract; automatically forming sessions with whoever answers would be a security disaster on the internet.

### Directly Connected eBGP and TTL

By default, eBGP packets are sent with **TTL 1**, so an eBGP neighbour must be **directly connected** — exactly ENCOR's scope. Peering between loopbacks or across another router needs `ebgp-multihop` (or `disable-connected-check`); that's Chapter 28.

### Message Types

| Message | Purpose |
|---------|---------|
| **OPEN** | Starts the session: BGP version, my AS, hold time, router ID, capabilities |
| **KEEPALIVE** | "Still here" — sent every keepalive interval, and to confirm an OPEN |
| **UPDATE** | Advertises new prefixes with their attributes, and/or withdraws old ones |
| **NOTIFICATION** | An error — sent just before the session is closed |
| **ROUTE-REFRESH** | Asks the neighbour to resend its updates (used by soft reset, 7.8) |

### Timers

| Timer | Cisco default | Notes |
|-------|---------------|-------|
| **Keepalive** | **60 s** | |
| **Hold time** | **180 s** | Neighbour declared dead if nothing heard for this long |

The hold time is **negotiated**: each side proposes one in its OPEN and **both use the lower value**; the keepalive is then a third of that. A hold time of **0** disables keepalives entirely. Timers don't have to match to form a session — unlike OSPF. Change them with `timers bgp <keepalive> <hold>` under `router bgp` or per neighbour.

**Why are BGP timers so slow compared with OSPF's 10/40 seconds?** Because a BGP session flap is expensive: tearing it down withdraws every prefix learned from that neighbour — possibly a million — and re-establishing re-sends them all. Slow timers avoid declaring a busy neighbour dead. When fast failure detection matters, the modern answer is **BFD** (Chapter 25), not shorter BGP timers.

### Neighbour States

![BGP finite state machine from Idle to Established](images/c07_states.png)

| State | What's happening | Stuck here usually means |
|-------|------------------|--------------------------|
| **Idle** | Not trying yet (or backing off after an error) | No route to the neighbour, or repeated failures |
| **Idle (Admin)** | Administratively disabled with `neighbor X shutdown` | Intentional — `no neighbor X shutdown` re-enables it |
| **Connect** | TCP SYN sent, waiting | Usually passes quickly |
| **Active** | TCP failed; **actively retrying** | No route to the neighbour, wrong neighbour IP, ACL blocking TCP 179, wrong source address |
| **OpenSent** | TCP is up; my OPEN sent | Waiting for theirs |
| **OpenConfirm** | OPENs exchanged and accepted; waiting for KEEPALIVE | Rarely stuck here |
| **Established** | Session up — UPDATEs flow | Healthy |

> **Exam trap — "Active" is bad.** It sounds healthy, but it means the TCP session **failed** and BGP is retrying. A neighbour that cycles between **Idle and Active** almost always has an IP-reachability or addressing problem. One that reaches **OpenSent** and then drops back to Idle has a working TCP connection but a rejected OPEN: a wrong `remote-as` or a router-ID clash. An **MD5 password mismatch** fails earlier than that. The TCP segments themselves fail authentication (`%TCP-6-BADAUTH`), so TCP never comes up and the neighbour never leaves Idle/Active.

---

## 7.4 Configuring eBGP Between Directly Connected Neighbours

The lab: **R1** (AS 65001, the enterprise) and **ISP** (AS 65002) share 203.0.113.0/30. R1 owns 198.51.100.0/24 and wants to advertise it.

```
R1(config)# router bgp 65001                            ! one BGP process per router - local AS
R1(config-router)# bgp router-id 1.1.1.1                ! set it, like OSPF
R1(config-router)# bgp log-neighbor-changes             ! log every state change (default on)
R1(config-router)# neighbor 203.0.113.2 remote-as 65002 ! different AS = eBGP
R1(config-router)# neighbor 203.0.113.2 description ISP-A uplink
R1(config-router)# address-family ipv4 unicast
R1(config-router-af)# neighbor 203.0.113.2 activate     ! exchange IPv4 routes with it
R1(config-router-af)# network 198.51.100.0 mask 255.255.255.0
R1(config-router-af)# exit-address-family
R1(config)# ip route 198.51.100.0 255.255.255.0 Null0   ! anchor route - see below
```

```
ISP(config)# router bgp 65002
ISP(config-router)# bgp router-id 2.2.2.2
ISP(config-router)# neighbor 203.0.113.1 remote-as 65001
ISP(config-router)# address-family ipv4 unicast
ISP(config-router-af)# neighbor 203.0.113.1 activate
```

### The BGP Router ID

Every BGP speaker needs a 32-bit **router ID**, carried in its OPEN message. It's chosen the same way as OSPF's:

1. `bgp router-id` if configured;
2. otherwise the highest IPv4 address on an **up loopback**;
3. otherwise the highest IPv4 address on an **up physical interface**.

Two peers with the **same** router ID can't form a session. On an IPv6-only router there's no IPv4 address to borrow, so `bgp router-id` is mandatory. *Set it explicitly, like every other router ID in this book.*

**What decides eBGP vs iBGP?** Nothing but the numbers: if `remote-as` differs from the local AS in `router bgp`, it's eBGP; if it's the same, it's iBGP. There is no separate command.

**About `activate`.** BGP is multiprotocol — one session can carry IPv4, IPv6, VPN routes and more, each in its own **address family**. On IOS XE, IPv4 unicast is activated automatically for every neighbour (`bgp default ipv4-unicast` is on by default), so the `activate` line above is redundant but harmless. Many engineers turn that default off with `no bgp default ipv4-unicast`, so that no address family is ever exchanged by accident — and then `activate` becomes mandatory. *If a neighbour is Established but no routes are exchanged, check `activate` first.*

### Shutting Down and Securing a Neighbour

```
R1(config-router)# neighbor 192.0.2.6 shutdown            ! keep the config, drop the session
R1(config-router)# neighbor 203.0.113.2 password S3cr3tK3y ! TCP MD5 (RFC 2385) on the session
```

**`neighbor shutdown`** tears the session down and holds it in **Idle (Admin)** while keeping every line of its configuration: the clean way to take a peer out of service for maintenance. **`neighbor password`** adds an MD5 signature to every TCP segment of the session. Both sides must have the same password. If they don't match (or only one side has one), the receiving router drops the segments and logs:

```
%TCP-6-BADAUTH: Invalid MD5 digest from 203.0.113.2(179) to 203.0.113.1(31744) tabled
%TCP-6-BADAUTH: No MD5 digest from 203.0.113.2(179) to 203.0.113.1(31744) tabled
```

**Why authenticate TCP rather than BGP itself?** Because the attack BGP fears most is at the TCP layer. A forged TCP reset from anywhere on the internet tears down a session and withdraws every route. Signing every segment means a spoofed SYN or RST without the key is simply discarded. (Chapter 28.3 adds TTL security.)

### The `network` Command Is Not What You Think

In OSPF and EIGRP, `network` enables the protocol on interfaces. In BGP it means something completely different:

> **BGP `network` = "advertise this prefix — if, and only if, an exactly matching route (same prefix and same mask) is already in my routing table."**

| Situation | Advertised? |
|-----------|-------------|
| `network 198.51.100.0 mask 255.255.255.0`, RIB has 198.51.100.0/24 | **Yes** |
| Same command, RIB has only 198.51.100.0/25 and .128/25 | **No** — no exact /24 |
| Same command, RIB has 198.51.100.0/16 | **No** — mask must match exactly |
| `network 198.51.100.0` with **no mask** | Uses the **classful** mask (/24 for a Class C address) |

**Why does BGP insist on an exact match?** Because advertising a prefix to the world is a promise: "send traffic for this block to me, and I can deliver it." BGP refuses to make that promise unless the router can actually route the block. That's also why the Null0 static above is standard practice: it guarantees the /24 always exists in the RIB, so the advertisement stays **stable** even if internal subnets flap. Traffic for unused parts of the block is simply dropped — the same discard-route idea OSPF uses for summaries (6.5).

### Advertising a Summary — `aggregate-address`

The other way to put a prefix into BGP is to summarize routes that are **already in the BGP table**:

```
R1(config-router-af)# aggregate-address 198.51.96.0 255.255.248.0 summary-only
```

The aggregate (here a /21) is created only while **at least one** more-specific component exists in the BGP table, and R1 installs a Null0 discard route for it automatically. Without `summary-only`, BGP advertises the aggregate **and** every component. With it, the components are **suppressed** (marked `s` in `show ip bgp`) and only the summary is sent. `as-set` keeps the component paths' AS numbers in the aggregate for loop prevention. Chapters 24.6 and 28 cover aggregation in depth.

### eBGP for IPv6

The same session machinery carries IPv6 in the **IPv6 unicast address family** (MP-BGP). The common design peers over IPv6 addresses for IPv6 routes:

```
R1(config)# ipv6 unicast-routing
R1(config)# ipv6 route 2001:db8:100::/48 Null0                 ! anchor route, as for IPv4
R1(config)# router bgp 65001
R1(config-router)# neighbor 2001:db8:0:12::2 remote-as 65002
R1(config-router)# address-family ipv4 unicast
R1(config-router-af)# no neighbor 2001:db8:0:12::2 activate   ! no IPv4 routes on this session
R1(config-router)# address-family ipv6 unicast
R1(config-router-af)# neighbor 2001:db8:0:12::2 activate      ! IPv6 AF is never on by default
R1(config-router-af)# network 2001:db8:100::/48               ! exact match rule applies
```

Verify with `show bgp ipv6 unicast summary` and `show bgp ipv6 unicast`. **Why the `no … activate` under IPv4?** Because `bgp default ipv4-unicast` activates IPv4 for **every** neighbour, including one addressed over IPv6. That would try to exchange IPv4 routes whose next hop is an IPv6 address, which is useless. Deactivating it (or using `no bgp default ipv4-unicast` globally) keeps each session carrying only what it should. Chapter 28.4 covers MP-BGP in depth.

---

## 7.5 Verifying the Session and the Table

### `show ip bgp summary` — Is the Session Up?

```
R1# show ip bgp summary
BGP router identifier 1.1.1.1, local AS number 65001
BGP table version is 4, main routing table version 4
3 network entries using 744 bytes of memory

Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
203.0.113.2     4 65002      27      25        4    0    0 00:21:43        2
192.0.2.6       4 65003      31      29        4    0    0 00:19:02        1
192.0.2.10      4 65004       0       0        1    0    0 never    Active
```

The last column is the one that matters. **A number** means the session is **Established**, and the number is how many prefixes were received. **A word** (Idle, Active…) means it is **not** established, and the word is the current state. Here ISP-A is up with 2 prefixes and ISP-B (AS 65003) is up with 1. The neighbour in AS 65004 has **never** come up and is stuck in Active, so check reachability to 192.0.2.10.

### `show ip bgp` — the BGP Table

```
R1# show ip bgp
BGP table version is 4, local router ID is 1.1.1.1
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path
Origin codes: i - IGP, e - EGP, ? - incomplete

     Network          Next Hop            Metric LocPrf Weight Path
 *>  10.20.0.0/16     203.0.113.2              0             0 65002 i
 *   10.30.0.0/16     192.0.2.6                              0 65003 65002 65030 i
 *>                   203.0.113.2                            0 65002 65030 i
 *>  198.51.100.0/24  0.0.0.0                  0         32768 i
```

| Field | How to read it |
|-------|----------------|
| `*` | **Valid** — the path is usable (next hop reachable) |
| `>` | **Best** — this path won and is offered to the routing table and to neighbours |
| `i` (left) | Learned via **iBGP** |
| `r` | **RIB-failure** — BGP chose it, but a route with lower AD already owns that prefix in the RIB |
| Next Hop `0.0.0.0` | **Locally originated** by this router (`network` or redistribution) |
| Weight `32768` | Default weight for locally originated routes (others get 0) |
| Path | The AS_PATH, **nearest AS first**, origin AS last |
| `i` / `e` / `?` (right) | **Origin**: `i` = `network` command, `e` = EGP (historic), `?` = redistributed |

10.30.0.0/16 has two paths: the line without a prefix is a second path to the same network. The one via 203.0.113.2 wins — its AS_PATH is shorter (2 ASes vs 3). Note that only the **best** path is advertised to neighbours, and only the best is offered to the routing table.

### `show ip bgp neighbors` — the Session in Detail

When a session misbehaves, this is the command that explains why:

```
R1# show ip bgp neighbors 203.0.113.2
BGP neighbor is 203.0.113.2,  remote AS 65002, external link
 Description: ISP-A uplink
  BGP version 4, remote router ID 2.2.2.2
  BGP state = Established, up for 00:21:43
  Last read 00:00:12, last write 00:00:41, hold time is 180, keepalive interval is 60 seconds
  Neighbor capabilities:
    Route refresh: advertised and received(new)
    Four-octets ASN Capability: advertised and received
    Address family IPv4 Unicast: advertised and received
 ...
  Connections established 1; dropped 0
  Last reset never
 ...
Local host: 203.0.113.1, Local port: 179
Foreign host: 203.0.113.2, Foreign port: 26743
```

| Line | What it tells you |
|------|-------------------|
| `remote AS 65002, external link` | The AS you configured, and whether this is eBGP (`external`) or iBGP (`internal`) |
| `remote router ID` | The neighbour's BGP router ID: check for duplicates here |
| `BGP state = …` | The current state (7.3) and how long it's been there |
| `hold time is 180, keepalive interval is 60` | The **negotiated** timers, the lower of the two proposals |
| `Neighbor capabilities` | What both sides agreed in their OPENs: route refresh (needed for soft reset), 4-byte ASNs, each address family |
| `Connections established / dropped` and `Last reset` | How often the session has flapped and the **reason** for the last reset (e.g. hold timer expired, or a NOTIFICATION received) |
| `Local host … Local port: 179` | Which side **accepted** the TCP connection. Local port 179 means the neighbour initiated; a random local port means you did |

More views you'll use constantly:

| Command | Shows |
|---------|-------|
| `show ip bgp 10.30.0.0/16` | Every path for one prefix, all attributes, and which is best (and why it's valid) |
| `show ip bgp neighbors 203.0.113.2` | Session detail: state, timers, capabilities, last error/NOTIFICATION |
| `show ip bgp neighbors 203.0.113.2 advertised-routes` | What you're sending that neighbour |
| `show ip bgp neighbors 203.0.113.2 routes` | What you accepted from it (after inbound policy) |
| `show ip route bgp` | What actually made it into the routing table (`B`) |

---

## 7.6 Path Attributes

Everything BGP decides, it decides by reading **path attributes**. They fall into four categories, and the categories decide whether a router must understand and forward them:

| Category | Must every BGP router recognise it? | Must it be in every UPDATE? | Passed on to other ASes? | Examples |
|----------|------------------------------------|-----------------------------|--------------------------|----------|
| **Well-known mandatory** | Yes | **Yes** | Yes | `ORIGIN`, `AS_PATH`, `NEXT_HOP` |
| **Well-known discretionary** | Yes | No | Yes (LOCAL_PREF only inside the AS) | `LOCAL_PREF`, `ATOMIC_AGGREGATE` |
| **Optional transitive** | No | No | **Yes**, even if not understood | `COMMUNITY`, `AGGREGATOR` |
| **Optional non-transitive** | No | No | **No** | `MED` (`MULTI_EXIT_DISC`), `ORIGINATOR_ID`, `CLUSTER_LIST` |

The ones that matter for path selection at ENCOR level:

| Attribute | Meaning | Scope | Preferred |
|-----------|---------|-------|-----------|
| **Weight** | Cisco-only, **not a real attribute** — never leaves the router | This router only | **Highest** (default 0; 32768 if local) |
| **LOCAL_PREF** | "How much this AS likes this exit" | Shared across the **whole AS** via iBGP, never sent to eBGP peers | **Highest** (default 100) |
| **AS_PATH** | ASes the route crossed | Global | **Shortest** |
| **ORIGIN** | How the route entered BGP | Global | **i < e < ?** |
| **MED** | "Which of my links you should use to reach me" — a hint to a neighbouring AS | Sent to one neighbouring AS, not beyond | **Lowest** (missing treated as 0) |
| **NEXT_HOP** | The IP to forward to | Changed by eBGP; kept by iBGP (Chapter 28) | Must be **reachable** |

### NEXT_HOP on eBGP

When a router advertises a route to an **eBGP** neighbour, it sets NEXT_HOP to **its own address on that session**, the IP the neighbour peers with. That's why R1's routes from ISP-A show next hop 203.0.113.2. For a directly connected neighbour that address sits on a connected subnet, so the next hop is always reachable and every path is valid at step 0 of the algorithm.

**Why does eBGP rewrite the next hop?** Because the receiving AS can't reach anything deep inside the advertising AS. The only address it's guaranteed to reach is the one on the shared link. iBGP does **not** rewrite it by default, and that's the source of the most common iBGP problem: routes in the table but not marked best because the next hop is unreachable. Chapter 28.2 covers that problem and its fix, `next-hop-self`.

---

## 7.7 The Best-Path Algorithm

When BGP holds several paths to one prefix, it walks down this list and **stops at the first step that produces a winner**. Paths must first be **valid**: the next hop must be reachable (and, for iBGP with synchronization enabled — off by default since IOS 12.2(8)T — synchronized).

| Step | Prefer | Notes |
|------|--------|-------|
| 0 | Next hop **reachable** | Unreachable next hop = not a candidate at all |
| 1 | Highest **Weight** | Cisco-only; local to the router |
| 2 | Highest **LOCAL_PREF** | AS-wide outbound policy |
| 3 | **Locally originated** | `network`, `aggregate-address` or redistribution on this router |
| 4 | Highest **AIGP** | Rarely used; ignored unless configured |
| 5 | Shortest **AS_PATH** | Each prepended AS counts; `AS_SET` counts as 1 |
| 6 | Lowest **ORIGIN** | IGP `i` < EGP `e` < incomplete `?` |
| 7 | Lowest **MED** | Compared only between paths from the **same neighbouring AS** (by default) |
| 8 | **eBGP over iBGP** | External paths are preferred |
| 9 | Lowest **IGP metric** to the next hop | "The closest exit" |
| 10 | Multipath check | If `maximum-paths` is set, equal paths are installed together |
| 11 | **Oldest** eBGP path | Stability — don't flip between equal paths |
| 12 | Lowest **router ID** of the advertising neighbour | |
| 13 | Shortest **cluster list** | Route-reflector environments |
| 14 | Lowest **neighbour address** | Final tie-breaker |

**Mnemonic: "N WLLA OMNI"** — **N**ext hop reachable, **W**eight, **L**ocal pref, **L**ocally originated, **A**S path (with AIGP folded in), **O**rigin, **M**ED, **N**eighbour type (eBGP over iBGP), **I**GP metric. After those, the tie-breakers run oldest → router ID → cluster list → neighbour address.

**Why is the order "policy first, distance second"?** Look at what comes first: weight and local preference — both values **you** set. AS-path length, the nearest thing BGP has to a distance, is only step 5. That ordering encodes BGP's purpose: *business intent overrides topology*. If you've expressed a preference, BGP obeys it; only when you haven't does it fall back to "fewer ASes is probably better."

**Why is MED compared only between paths from the same AS?** Because MED is a neighbour's **private suggestion** about its own links ("enter me via the New York link, not Chicago"). AS 65002's MED values are on AS 65002's scale; comparing them with AS 65003's MEDs would be comparing two different companies' internal numbering. (`bgp always-compare-med` overrides this — use it only if every neighbour uses a consistent scheme.)

---

## 7.8 Influencing the Path — A Preview of Chapter 28

The key mental model is **direction**. Which attribute you touch depends on whether you're steering traffic **leaving** your AS or **arriving** at it:

| Goal | Attribute | Set on | Applied to updates |
|------|-----------|--------|--------------------|
| **Outbound** traffic — which exit *this router* uses | Weight | This router | Inbound (as routes arrive) |
| **Outbound** traffic — which exit the *whole AS* uses | LOCAL_PREF | Edge routers | Inbound |
| **Inbound** traffic — make a path look worse to others | AS-path prepend | Edge routers | **Outbound** (as you advertise) |
| **Inbound** traffic — suggest an entry link to one neighbour AS | MED | Edge routers | **Outbound** |

**Why is "inbound traffic" controlled by "outbound" updates?** Because routes and traffic flow in **opposite directions**. To change how the world sends traffic **to** you, you change what you **tell** the world. And it's only a request — other ASes apply their own policy first, so prepending and MED *influence* inbound traffic but can't *force* it. Outbound traffic, by contrast, is entirely yours to decide.

### Examples

```
! Prefer ISP-A for everything this router sends out (weight - local only)
R1(config)# router bgp 65001
R1(config-router)# neighbor 203.0.113.2 weight 200

! Make the whole AS prefer ISP-A (local preference - shared via iBGP)
R1(config)# route-map FROM-ISP-A permit 10
R1(config-route-map)# set local-preference 200
R1(config)# router bgp 65001
R1(config-router)# address-family ipv4 unicast
R1(config-router-af)# neighbor 203.0.113.2 route-map FROM-ISP-A in

! Make the world prefer the OTHER link to reach us: prepend toward ISP-B
R1(config)# route-map TO-ISP-B permit 10
R1(config-route-map)# set as-path prepend 65001 65001 65001
R1(config)# router bgp 65001
R1(config-router)# address-family ipv4 unicast
R1(config-router-af)# neighbor 192.0.2.6 route-map TO-ISP-B out

! Suggest an entry link to a neighbour AS with MED (lower = preferred)
R1(config)# route-map TO-ISP-A permit 10
R1(config-route-map)# set metric 50
R1(config)# router bgp 65001
R1(config-router)# address-family ipv4 unicast
R1(config-router-af)# neighbor 203.0.113.2 route-map TO-ISP-A out
```

**After changing policy, it doesn't apply to routes already exchanged.** BGP doesn't re-evaluate history; you must ask for a refresh:

```
R1# clear ip bgp 203.0.113.2 soft in     ! re-apply inbound policy (route refresh)
R1# clear ip bgp 203.0.113.2 soft out    ! resend our updates through outbound policy
```

Never use a plain `clear ip bgp *` on a production router — it **tears down every session**, withdrawing every route. *Soft clears re-run policy; hard clears restart the internet connection.*

**Why prepend your own AS rather than some other number?** Because prepending another AS's number would make that AS **reject** the route (loop prevention — 7.1), and it would be lying about the path. Repeating your own ASN makes the path longer without changing who's on it.

---

## 7.9 Troubleshooting eBGP

| Symptom | Likely cause | Prove it with |
|---------|--------------|---------------|
| Neighbour stuck in **Active** / **Idle** | No route to neighbour IP, wrong neighbour address, ACL blocking TCP 179 | `ping 203.0.113.2`, `show ip bgp neighbors … | include state`, `show access-lists` |
| Session reaches OpenSent, then resets | `remote-as` mismatch (log: `%BGP-3-NOTIFICATION: sent to neighbor … 2/2 (peer in wrong AS)`), or duplicate router ID | `show ip bgp neighbors … | include Last reset`, `debug ip bgp` |
| Never leaves Idle/Active; neighbour reachable by ping | MD5 password mismatch, or password on one side only | Log `%TCP-6-BADAUTH` (Invalid / No MD5 digest); compare `neighbor … password` on both sides |
| Shows `Idle (Admin)` | `neighbor … shutdown` configured | `show run | include neighbor` |
| eBGP to a loopback never comes up | TTL 1 default — not directly connected | Configure `ebgp-multihop` and `update-source` (Chapter 28) |
| Established, 0 prefixes | Neighbour not `activate`d in the AF, nothing advertised, inbound filter | `show ip bgp summary`, `… advertised-routes` on the peer |
| Your prefix not advertised | `network` mask doesn't exactly match a RIB route | `show ip route 198.51.100.0 255.255.255.0` |
| Prefix in BGP table, not `>` | Next hop unreachable, or another path won | `show ip bgp <prefix>` |
| Best path marked `r` | A route with lower AD (often a static or IGP) already owns the prefix | `show ip route <prefix>` |
| Policy change has no effect | Routes not refreshed | `clear ip bgp <nbr> soft in/out` |

---

## 7.10 Summary — What to Be Able to Explain

| You should be able to… | Section |
|------------------------|---------|
| Explain why BGP is path vector and how AS_PATH prevents loops | 7.1 |
| Tell eBGP from iBGP, and explain AD 20 vs 200 | 7.1, 7.4 |
| Recognise private and 4-byte ASNs | 7.2 |
| Describe the session: TCP 179, message types, timers, TTL 1 | 7.3 |
| Walk the state machine and diagnose Active/Idle | 7.3, 7.9 |
| Configure eBGP with address families and the exact-match `network` rule | 7.4 |
| Read `show ip bgp summary` and `show ip bgp` | 7.5 |
| Classify attributes (well-known mandatory etc.) | 7.6 |
| Recite the best-path order and explain why policy comes first | 7.7 |
| Pick the right attribute for inbound vs outbound traffic | 7.8 |

---

<a name="chapter-8"></a>
# Chapter 8: Time & Translation — NTP, PTP, NAT/PAT

> **Blueprint:** ENCOR 3.3.a — Interpret network time protocol configurations such as NTP and PTP; ENCOR 3.3.b — Configure NAT/PAT

This chapter pairs two services that look unrelated but share something important. Both are invisible when they work and confusing when they break. A wrong clock does nothing dramatic. It just makes every log you read slightly untrustworthy. A broken NAT rule shows up as "the internet is down for *some* users", which sounds like a routing problem until you look at the translation table. CCNA introduced both (CCNA guide 17.3 and 17.4). CCNP wants you to read the configurations fluently, understand the precision ladder from NTP to PTP, and know NAT's order of operations well enough to predict what an ACL or a route will see.

---

## 8.1 Why Time Is Infrastructure, Not a Nicety

The CCNA guide gave three reasons to synchronize clocks: log correlation, certificates, and time-based features. At CCNP level, add the ones that bite in production:

- **AAA and key rotation.** TACACS+/RADIUS accounting records, Kerberos tickets and key chains with `accept-lifetime` and `send-lifetime` all assume the device knows what time it is. A router whose clock drifted to 1993 after a reload will reject a key chain that "hasn't started yet", and an OSPF or EIGRP adjacency that uses it quietly drops.
- **Assurance data.** Flexible NetFlow records, IP SLA results and Catalyst Center telemetry (Chapters 15–16) are all time series. Unsynchronized timestamps make a latency spike on one device look as if it came *after* the outage it actually caused.
- **Distributed applications.** Financial trading, industrial control, cellular radio and broadcast video need clocks that agree to the **microsecond or better**. NTP can't deliver that, which is the whole reason PTP exists (8.4).

*A network without synchronized time can still forward packets. It just can't tell you the truth about what happened.*

---

## 8.2 NTP In Depth

**NTP** runs over **UDP 123**. Current IOS XE speaks **NTPv4**, which adds IPv6 support and remains backward-compatible with NTPv3. Clocks are organized by **stratum**, meaning how many hops a clock is from a reference source:

| Stratum | Meaning |
|---------|---------|
| **0** | The reference itself: GPS receiver, atomic clock. Never on the network directly |
| **1** | A server attached to a stratum-0 source |
| **2–15** | Each hop away adds one: syncing to a stratum-3 server makes you stratum 4 |
| **16** | **Unsynchronized.** Nobody should believe this clock |

### The Three Relationships

| Command | Relationship | Who adjusts whom |
|---------|--------------|------------------|
| `ntp server X` | **Client/server** | I adjust to X; X never adjusts to me |
| `ntp peer X` | **Symmetric active** | We may adjust to each other. Used between equals, like two core routers that each have upstream servers |
| `ntp master [stratum]` | **Authoritative source** | I serve my own internal clock (default **stratum 8**) |
| `ntp broadcast` / `ntp broadcast client` | **Broadcast** | The server announces the time on a segment and clients just listen. Rare today, because it can't be authenticated per client |

**Why would you ever use `ntp master` when real time sources exist?** For an isolated lab or an air-gapped network, *agreement* matters more than *accuracy*. If every device follows one router's clock, logs still correlate, even if that clock is two minutes off the real world. The deliberately mediocre default of stratum 8 means that any real upstream source (stratum 1–4) wins as soon as one becomes reachable. *A confident-but-humble clock: use me only if nothing better shows up.*

**Why `ntp peer` between core routers instead of making one the server?** It removes the single point of failure. Give each core router its own upstream server and peer them. If CORE1 loses its upstream, it can follow CORE2 rather than drifting, and the reverse is also true.

### Try It — A Realistic Enterprise NTP Config

```
! --- CORE1: client of two external sources, peer of CORE2, server to the campus
clock timezone EST -5 0
clock summer-time EDT recurring
ntp authentication-key 1 md5 S3cretKey1               ! newer IOS XE also offers SHA
ntp authenticate                                      ! require auth on ALL sources
ntp trusted-key 1                                     ! key 1 is acceptable for sync
ntp source Loopback0                                  ! stable source address
ntp server 192.0.2.10 key 1 prefer                    ! preferred upstream
ntp server 192.0.2.11 key 1
ntp peer 10.255.0.2 key 1                             ! CORE2
ntp update-calendar                                   ! write time to hardware clock
ntp access-group peer 10                              ! who may sync with me
ntp access-group serve-only 20                        ! who may only ask me the time
!
access-list 10 permit 192.0.2.10                      ! upstream servers MUST be here
access-list 10 permit 192.0.2.11
access-list 10 permit 10.255.0.2                      ! CORE2 (peer)
access-list 20 permit 10.0.0.0 0.255.255.255          ! campus clients
!
! --- Access switch: just a client of the cores
ntp server 10.255.0.1
ntp server 10.255.0.2
```

**Read the authentication lines as a three-part chain, because all three must be present:**

1. `ntp authentication-key` *defines* a key.
2. `ntp trusted-key` *marks* it as acceptable for synchronization.
3. `ntp authenticate` *turns enforcement on*. Without it, the keys exist but unauthenticated sources are still accepted.

Then `key 1` on the `ntp server` line tells the client which key to sign its requests with. **Exam trap:** forgetting `ntp trusted-key` is the classic broken config. The key is defined and authentication is on, but no key is trusted, so the client refuses every server and never syncs.

**Why does NTP authentication matter at all?** Because whoever controls your clock controls certificate validity, log timelines and key lifetimes. A rogue NTP server that shifts every router forward a year can expire every certificate in the network at once. Authentication proves the time came from a source you chose.

### NTP Access Control — the Four Access-Group Types

`ntp access-group` filters NTP itself, separately from any interface ACL. There are four types, from most to least permissive:

| Type | Allows the matched hosts to… |
|------|------------------------------|
| `peer` | Request time, send control queries, **and synchronize this router to them** |
| `serve` | Request time and send control queries, but **not** sync this router |
| `serve-only` | Request time only |
| `query-only` | Send control queries only (`ntpq`-style); no time service |

When a packet arrives, IOS checks the types in that order and the **first type whose ACL permits the source wins**. A source that matches none of the configured ACLs is denied.

**Exam trap — the upstream server that stops syncing:** the moment you configure *any* `ntp access-group`, every source must be permitted by a type that allows what it needs. Your own upstream servers send *replies that sync you*, so they must be in the **`peer`** ACL. Add `ntp access-group serve-only 20` for clients but forget to list 192.0.2.10 in ACL 10, and the router silently stops synchronizing. `show ntp associations` shows the server with reach `0` and no `*`, even though `ping 192.0.2.10` works. *Access control on a time server must allow both directions: who may ask me, and whom I may believe.*

### Reading `show ntp associations`

```
CORE1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
*~192.0.2.10      .GPS.            1     37     64   377  12.41   -0.212  1.903
+~192.0.2.11      .PPS.            1     12     64   377  14.02    0.388  2.110
 ~10.255.0.2      192.0.2.11       2     50     64   377   0.81    0.501  1.441
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured
```

| Column / symbol | How to read it |
|-----------------|----------------|
| `*` | The **sys.peer**: the source I'm actually synchronized to |
| `+` | **Candidate**: acceptable, used in the combined estimate |
| `-` | **Outlier**: discarded by the selection algorithm |
| `x` | **Falseticker**: disagrees with the majority. NTP thinks this clock is lying |
| `~` | Configured statically (as opposed to learned dynamically) |
| `st` | Stratum of that source. Mine will be this + 1 |
| `poll` | Seconds between polls (grows from 64 toward 1024 as the clock stabilizes) |
| `reach` | **Octal** shift register of the last 8 polls. `377` = all 8 answered; `0` = nothing ever came back |
| `offset` | How far my clock is from theirs, in **milliseconds** |

**Why can NTP call a server a "falseticker"?** NTP doesn't trust any single source. It compares all of them and assumes the truth lies where most of them agree. A clock that disagrees with the majority gets an `x`. This is why best practice is **at least three** (ideally four) upstream servers: with two that disagree, NTP can't tell which one is lying.

```
CORE1# show ntp status
Clock is synchronized, stratum 2, reference is 192.0.2.10
nominal freq is 250.0000 Hz, actual freq is 249.9998 Hz, precision is 2**10
...
```

`Clock is unsynchronized, stratum 16` means NTP hasn't settled on a source yet. A fresh sync can take **several minutes**, because NTP needs a few polls before it trusts a source. Don't troubleshoot a config you entered 30 seconds ago.

### NTP Troubleshooting

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| `reach 0` for a server | No reply: routing, ACL blocking UDP 123, wrong source interface | `show ntp associations`, `ping 192.0.2.10 source Loopback0` |
| Reach is `377` but never `*` | Auth failure (key mismatch, missing `trusted-key`) or server unsynchronized (stratum 16) | `show ntp associations detail` ("authenticated"/"insane"), `debug ntp packets` |
| Synchronized but logs show wrong hour | Time zone/summer-time not set. NTP always carries **UTC** | `show clock detail`, `show run | include clock` |
| Server stopped syncing right after adding `ntp access-group` | Upstream server not permitted in the **`peer`** ACL | `show run | include ntp access-group`, then the ACL; `show ntp associations` |
| Every source shows `x` or `-` | Sources disagree badly with each other | Compare offsets; remove the bad source |
| Logs have no real timestamps | `service timestamps` not configured | `service timestamps log datetime msec localtime show-timezone` |

---

## 8.3 How NTP and PTP Differ — the Precision Ladder

| Feature | NTP | PTP (IEEE 1588) |
|---------|-----|-----------------|
| Typical accuracy | **Milliseconds** across a WAN, sub-ms on a LAN | **Sub-microsecond**, down to tens of nanoseconds |
| Where timestamps are taken | In software, by the operating system | In **hardware**, at the physical port, as the packet crosses it |
| Transport | UDP 123 | UDP **319** (event) / **320** (general) to 224.0.1.129, or raw Ethernet (EtherType **0x88F7**) |
| Hierarchy | Stratum levels, client chooses | **Best Master Clock Algorithm** elects one grandmaster |
| Network role | Devices are clients and servers | Switches can **actively correct** timing as packets pass |
| Used for | Logs, certs, AAA: *everything* | Industrial automation, power utilities, 5G radio, broadcast video (AES67/SMPTE 2110), trading |

**Why can't NTP just try harder and reach microseconds?** Because its error comes mostly from **variable delay it can't see**. NTP timestamps a packet when software handles it, which happens after an unpredictable wait in interrupt handling and output queues. NTP then assumes the path delay is the same in both directions, and every queue along the way breaks that assumption. PTP attacks both problems: it timestamps in **hardware at the wire**, and it lets the **switches in the path** measure and remove their own delay (8.4). *NTP estimates across a fog; PTP clears the fog hop by hop.*

---

## 8.4 PTP — Precision Time Protocol

![PTP Sync, Follow_Up, Delay_Req and Delay_Resp timestamps t1–t4](images/c08_ptp_exchange.png)

### The Four-Message Exchange

PTP calculates offset and delay from four timestamps:

| Step | Message | Timestamp |
|------|---------|-----------|
| 1 | Master sends **Sync** | Master records **t1** at the moment it leaves |
| 2 | Master sends **Follow_Up** carrying t1 | (two-step clocks; one-step clocks embed t1 in Sync itself) |
| 3 | Slave receives Sync | Slave records **t2** |
| 4 | Slave sends **Delay_Req** | Slave records **t3** |
| 5 | Master replies **Delay_Resp** carrying the arrival time | **t4** |

With all four numbers the slave can compute:

- **Mean path delay** = [(t2 − t1) + (t4 − t3)] ÷ 2
- **Offset from master** = [(t2 − t1) − (t4 − t3)] ÷ 2

**Why does this math depend on the path being symmetric?** Because dividing by two assumes the trip out took as long as the trip back. If a switch in the path held the Sync for 40 µs in a queue but forwarded the Delay_Req immediately, the slave would blame half of that 40 µs on its own clock. That's the problem the PTP-aware clock types below exist to fix.

### Clock Types

| Clock type | What it does | Why it exists |
|------------|--------------|---------------|
| **Grandmaster** | The domain's ultimate source, usually GPS-locked | Someone has to be the truth |
| **Ordinary clock** | An endpoint with one PTP port, either master or (usually) slave | Servers, sensors, cameras |
| **Boundary clock (BC)** | A switch that is **slave** on its upstream port and **master** on its downstream ports, re-generating time | Breaks a large domain into hops, so no device sees accumulated queuing error and the grandmaster isn't serving thousands of slaves |
| **Transparent clock (TC)** | A switch that **doesn't sync itself** but measures how long each PTP packet sat inside it (its **residence time**) and writes that into the packet's **correction field** | Removes the switch's own queuing delay from the math. **E2E** TCs correct residence time only; **P2P** TCs also measure each link's delay |

### The Best Master Clock Algorithm (BMCA)

Every PTP clock advertises itself in **Announce** messages, and every port independently picks the best one it hears. The comparison order is:

1. **Priority1** (0–255, lower wins, default **128**). The administrator's override.
2. **Clock class**: how good the source is (locked to GPS beats free-running).
3. **Clock accuracy**
4. **Offset scaled log variance**: how stable it is.
5. **Priority2**: a second administrative tiebreaker.
6. **Clock identity**: a unique ID derived from the MAC address. The final tiebreaker.

*If this reminds you of the STP root bridge election (configurable priority first, then MAC as the tiebreaker), that's because it solves the same problem: elect one root everyone agrees on, without a central controller.*

### Interpreting a PTP Configuration

ENCOR asks you to *interpret* PTP configs, not memorize every platform's syntax, which differs across Catalyst, IE and Nexus switches. Here is a representative Catalyst 9000 IOS XE config:

```
ptp mode boundary delay-req        ! act as a boundary clock, end-to-end delay mechanism
ptp domain 0                       ! PTP domain: clocks only listen within one domain
ptp priority1 128                  ! default; lower it to make this switch preferred master
ptp priority2 128
!
interface TenGigabitEthernet1/0/1  ! uplink toward the grandmaster
 ptp announce interval 1           ! log2 seconds: 2^1 = one Announce every 2 s
 ptp sync interval -3              ! 2^-3 = 8 Sync messages per second
 ptp delay-req interval -3
```

**How to read it:**

- **`mode boundary`** means the switch will sync to whatever its uplink hears and serve time downstream. `e2etransparent` or `p2ptransparent` would mean "correct packets in flight, don't sync". **`delay-req`** names the delay mechanism: the four-message exchange above, as opposed to peer-delay.
- **`domain`** is a namespace. A slave in domain 0 ignores a grandmaster in domain 24, so a mismatch looks like "no master found".
- **Intervals are logarithmic (base 2).** `-3` means 2⁻³ s, or eight messages per second. **Negative numbers mean *faster* than one per second.** Reading `-3` as "every 3 seconds" is the classic interpretation trap.
- **`priority1`** works like STP root priority. Lowering it on the grandmaster-facing switch (or the grandmaster itself) pins the election.

```
SW1# show ptp parent
 Parent Clock:
  Parent Clock Identity: 0x0:1D:C1:FF:FE:12:34:56
 Grandmaster Clock:
  Grandmaster Clock Identity: 0x0:1D:C1:FF:FE:12:34:56
  Grandmaster Clock Quality:
        Class: 6                        ! 6 = locked to a primary reference (GPS)
        Accuracy: Within 100ns
  Priority1: 0
  Priority2: 128
```

Use `show ptp clock` (my own clock and mode), `show ptp port` (each port's state: MASTER, SLAVE or PASSIVE) and `show ptp parent` (who won BMCA). *Port states again mirror STP: one upstream "root" port (SLAVE), downstream "designated" ports (MASTER), and PASSIVE ports that hear a better master but aren't used, like a blocking port.*

---

### PTP Profiles

IEEE 1588 is a toolkit, and industries publish **profiles** that fix the options (message rates, delay mechanism, transport, domain numbers) for their use case. Clocks only interoperate if they run the same profile:

| Profile | Where it's used | Notable choices |
|---------|-----------------|-----------------|
| **Default (1588)** | General enterprise / data center | E2E delay-request, Layer 3 (UDP 319/320) or Layer 2 |
| **Power (IEEE C37.238 / IEC 61850-9-3)** | Substations, grid protection | Peer-delay, Layer 2 Ethernet transport |
| **802.1AS (gPTP)** | AVB/TSN audio-video, automotive | Peer-delay, Layer 2 only, every bridge must be time-aware |
| **AES67 / SMPTE ST 2059-2** | Broadcast audio and video over IP | Faster message rates, specific domain numbers |
| **Telecom (G.8275.x)** | Mobile fronthaul/backhaul | Strict accuracy budgets, boundary clocks at every hop |

*On the exam, recognizing that a mismatched profile (or domain) means "no master found" matters more than memorizing every profile's numbers.*

## 8.5 NAT/PAT at CCNP Depth

### The Four Address Terms

![Inside local, inside global, outside global and outside local](images/c08_nat_terms.png)

| Term | Means | Example |
|------|-------|---------|
| **Inside local** | An inside host's address *as seen inside*: the real, usually private address | 10.1.1.10 |
| **Inside global** | That same inside host *as seen from outside*: the translated public address | 203.0.113.10 |
| **Outside global** | An outside host's real address | 198.51.100.80 |
| **Outside local** | That outside host *as seen from inside*. Usually identical to outside global unless you translate outside addresses too | 198.51.100.80 |

**How to never mix them up:** the first word (*inside*/*outside*) says **whose address it is**. The second word (*local*/*global*) says **which side is looking at it**. "Inside global" = an inside host's address, as the global side sees it.

### Order of Operations: Where NAT Happens Relative to Routing and ACLs

| Direction | Order on IOS / IOS XE |
|-----------|------------------------|
| **Inside → outside** | Inbound ACL on the inside interface → **routing** → **NAT** (inside source translated) → outbound ACL on the outside interface |
| **Outside → inside** | Inbound ACL on the outside interface → **NAT** (inside global translated back to inside local) → **routing** → outbound ACL on the inside interface |

**Why does this order matter in practice? Three consequences:**

1. **An inbound ACL on the *outside* interface sees the *public* (inside global) destination**, because NAT hasn't untranslated it yet. Write `permit tcp any host 203.0.113.10 eq 443`, not the 10.x address. This is a top troubleshooting trap.
2. **An outbound ACL on the outside interface sees the already-translated source.** Matching on 10.1.1.0/24 there matches nothing.
3. **For traffic coming in, NAT happens before routing,** so the router routes on the *real inside* address. That's how a reply to 203.0.113.10 gets routed to 10.1.1.10 at all. Going out, routing happens first, so the egress interface must be marked `ip nat outside` for translation to trigger.

*Rule of thumb: the outside world, including outside-facing ACLs, only ever sees global addresses.*

### Try It — Every Flavor in One Router

```
interface GigabitEthernet0/0/0
 description LAN
 ip address 10.1.1.1 255.255.255.0
 ip nat inside
interface GigabitEthernet0/0/1
 description ISP - 203.0.113.0/27 assigned
 ip address 203.0.113.2 255.255.255.224
 ip nat outside
!
! 1) Static one-to-one: web server always 203.0.113.10, both directions
ip nat inside source static 10.1.1.10 203.0.113.10
!
! 2) Static PAT (port forwarding): outside :2222 -> inside SSH bastion :22
ip nat inside source static tcp 10.1.1.20 22 203.0.113.11 2222 extendable
!
! 3) Dynamic PAT from a pool for the users subnet
ip access-list standard NAT-USERS
 permit 10.1.1.0 0.0.0.255
ip nat pool USERS 203.0.113.20 203.0.113.23 prefix-length 27
ip nat inside source list NAT-USERS pool USERS overload
!
! (Alternative 3: PAT on the outside interface's own address)
! ip nat inside source list NAT-USERS interface GigabitEthernet0/0/1 overload
```

**Why does the static server still work when the dynamic rule also matches 10.1.1.10?** Static translations take precedence over dynamic ones for the hosts they cover. The server gets 203.0.113.10 both ways, and every other host in the ACL is overloaded onto the pool.

**Why `extendable`?** It lets the same inside local address appear in more than one static translation. For example, one server can be published on two public addresses or ports. IOS adds it automatically when you configure overlapping static port entries. Read it as "this static entry is allowed to share its local address".

**Why a pool with `overload` instead of just the interface?** A single public IP gives about 64,000 ports per protocol. That's plenty for an office, but not for a large campus or a carrier, and some services rate-limit per source IP. A pool spreads the sessions across several addresses. PAT on the **interface** wins when the ISP assigns the address via DHCP, because the rule follows whatever address the interface currently holds.

### Dynamic NAT Without Overload — One Public Address per Host

Drop the `overload` keyword and the same pool behaves completely differently:

```
ip access-list standard NAT-LAB
 permit 10.1.2.0 0.0.0.255
ip nat pool LAB-POOL 203.0.113.24 203.0.113.27 netmask 255.255.255.224
ip nat inside source list NAT-LAB pool LAB-POOL      ! no overload = one-to-one
```

| Behaviour | Dynamic NAT (no `overload`) | PAT (`overload`) |
|-----------|-----------------------------|------------------|
| Mapping | One inside host ↔ one pool address | Many hosts share one address, told apart by port |
| Translation entry | A simple entry with **no ports**, held until the timeout (24 h default) | Per-flow entry with ports, short timeouts (TCP 24 h, UDP 5 min, DNS 1 min) |
| Capacity | **4 addresses = 4 concurrent hosts** | Roughly 64,000 sessions per address |
| Failure mode | Host number 5 gets **no translation** until an entry expires | Rarely runs out |
| Inbound reachability | The outside can reach the host on its current mapped address while the entry exists | Only for sessions the inside started (or static port forwards) |

**Why would anyone choose the one-to-one version?** For applications that break under port translation. Some protocols embed addresses or expect a fixed source port, and partner firewalls may whitelist one address per host. It also makes logs simple: every public address maps to exactly one internal host at a time. The price is that the pool must be as big as the number of simultaneous users, and idle entries hold addresses hostage until they time out. That's why shorter timeouts (below) and `clear ip nat translation *` are the usual fixes when a one-to-one pool runs dry.

### NAT for Overlapping Networks (briefly)

After a merger, both companies may use 10.1.0.0/16. Translating only one side isn't enough, because each side needs to see the *other* side under a non-overlapping address. The fix is to translate **both** directions: `ip nat inside source` for your hosts, plus `ip nat outside source static 10.1.5.5 172.31.5.5` so that your hosts reach the partner's server as 172.31.5.5 (its **outside local** address). DNS replies must also hand out the translated address. *This is the one case where outside local ≠ outside global.*

### Verifying

```
R1# show ip nat translations
Pro  Inside global        Inside local       Outside local       Outside global
---  203.0.113.10         10.1.1.10          ---                 ---
tcp  203.0.113.11:2222    10.1.1.20:22       ---                 ---
tcp  203.0.113.20:51344   10.1.1.57:51344    142.250.72.14:443   142.250.72.14:443
udp  203.0.113.20:60211   10.1.1.61:60211    8.8.8.8:53          8.8.8.8:53
```

- Lines with `---` on the outside are **static entries**. They exist with no traffic flowing.
- Lines with protocol and ports are **live PAT sessions**, created by traffic.
- Outside local = outside global here. Nothing is translating the outside.
- **Port preservation:** IOS PAT keeps the inside source port (51344 → 51344) whenever that port is free on the public address, and only picks a different port when two inside hosts collide on the same one. Don't read an unchanged port as "PAT isn't working".

```
R1# show ip nat statistics
Total active translations: 214 (2 static, 212 dynamic; 213 extended)
Outside interfaces:
  GigabitEthernet0/0/1
Inside interfaces:
  GigabitEthernet0/0/0
Hits: 1882301  Misses: 4410
Expired translations: 39821
Dynamic mappings:
-- Inside Source
[Id: 1] access-list NAT-USERS pool USERS refcount 212
 pool USERS: id 1, netmask 255.255.255.224
        start 203.0.113.20 end 203.0.113.23
        type generic, total addresses 4, allocated 1 (25%), misses 0
```

**Hits** means a packet matched an existing translation. **Misses** means a packet needed a new entry to be created. A **misses** counter on the *pool* line that keeps climbing means the pool can't hand out addresses. That points to a non-overload pool that is exhausted, the classic dynamic-NAT failure.

### Timeouts

| Entry type | Default timeout |
|------------|-----------------|
| Simple dynamic translation (no ports) | **86,400 s** (24 h) |
| TCP PAT entry | **86,400 s** (24 h) |
| UDP PAT entry | **300 s** |
| DNS | **60 s** |
| TCP after FIN/RST | **60 s** (`finrst-timeout`) |

Tune them with `ip nat translation timeout <sec>` and per-protocol variants such as `ip nat translation udp-timeout 120`. **Why would you shorten them?** Because a dynamic pool *without* overload is held by an entry until it expires. With a 24-hour default, ten users can exhaust a ten-address pool for a whole day after they've gone home.

### NAT Troubleshooting

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| No translations created at all | Missing `ip nat inside`/`outside`, or interfaces swapped | `show ip nat statistics` (interface lists) |
| Some hosts translate, others don't | NAT ACL doesn't match their subnet | `show ip access-lists NAT-USERS` (hit counts) |
| First N users work, the rest fail | Pool without `overload` exhausted | Pool `misses` counter, `show ip nat translations` |
| Server unreachable from the internet | Inbound ACL written for the private address; or missing static entry | `show ip access-lists` on the outside ACL; `show ip nat translations` |
| Return traffic never arrives | ISP not routing the pool's addresses to you; pool not in the outside subnet and no route | `debug ip nat` (limit it with an ACL), traceroute from outside |
| Translation works only after `clear` | Stale entries after a rule change. Existing sessions keep their old mapping | `clear ip nat translation *` |

**Exam trap:** changing a NAT rule doesn't touch translations that already exist. If you fix the config and nothing changes, clear the table, then retest.

---

## 8.6 Chapter Summary

| Topic | The one-line idea |
|-------|-------------------|
| NTP stratum | Lower = closer to the truth; 16 = unsynchronized |
| NTP auth | Key + **trusted-key** + **authenticate** + `key` on the server line |
| `show ntp associations` | `*` = synced to; `reach 377` = 8/8 replies; offset in ms |
| PTP vs NTP | Hardware timestamps + on-path correction → sub-µs |
| BC vs TC | Boundary re-generates time; transparent corrects residence time |
| BMCA | Priority1 → class → accuracy → variance → priority2 → identity |
| PTP intervals | log₂ seconds. **Negative = faster than 1/s** |
| NAT terms | First word = whose address; second = who's looking |
| NAT order | In→out: route then NAT. Out→in: NAT then route |
| Outside ACL | Matches **global** (public) addresses |

---

<a name="chapter-9"></a>
# Chapter 9: First Hop Redundancy — HSRP & VRRP

> **Blueprint:** ENCOR 3.3.c — Configure first hop redundancy protocols, such as HSRP, VRRP; ENCOR 1.1.b — High availability techniques such as redundancy, FHRP (the FHRP part; SSO and stacking are in Chapter 2)

The CCNA guide (14.7) explained *why* a first-hop redundancy protocol exists. A PC has exactly one default gateway, so two physical routers must pretend to be one virtual router with a shared IP and MAC. At CCNP you have to build it properly. That means choosing the right protocol and version, making failover depend on what actually matters (the uplink, not just the LAN port), splitting the load across both routers, and aligning all of it with Spanning Tree so traffic doesn't take a detour. Chapter 2 places FHRPs among the other high-availability tools. This chapter is the engineering.

---

## 9.1 What Every FHRP Has in Common

All three protocols (HSRP, VRRP and GLBP) share one mechanism:

1. A group of routers on a segment agrees on a **virtual IP (VIP)**. Hosts use the VIP as their default gateway.
2. The VIP maps to a **virtual MAC**, so a host's ARP cache never has to change during failover.
3. One router **actively forwards** for that VIP. The others listen to its hellos.
4. When the hellos stop, a backup takes over the VIP *and* the virtual MAC, and sends a **gratuitous ARP** so the switches relearn which port the MAC lives on.

**Why does the virtual MAC matter as much as the virtual IP?** A host doesn't send frames to an IP address. It sends them to whatever MAC its ARP cache holds for the gateway, and it may keep that entry for hours. If failover moved only the IP, every host would keep sending frames to the dead router's MAC until its ARP entry aged out. Moving the MAC too makes failover invisible to hosts. *The host never learns that anything happened, which is the whole point.*

---

## 9.2 HSRP Mechanics

**HSRP (Hot Standby Router Protocol)** is Cisco-proprietary and runs over **UDP 1985**. One router is **Active** (forwards traffic), one is **Standby** (next in line), and any others are in **Listen**.

### Version 1 vs Version 2

| Property | HSRPv1 | HSRPv2 |
|----------|--------|--------|
| Group numbers | 0–255 | **0–4095**, so the group can match the VLAN number |
| Virtual MAC | `0000.0c07.acXX` (XX = group in hex) | `0000.0c9f.fXXX` (XXX = group in hex) |
| Hello destination | **224.0.0.2** (all routers) | **224.0.0.102** (HSRP-specific) |
| IPv6 support | No | **Yes** (FF02::66, vMAC `0005.73a0.0XXX`) |
| Millisecond timers | Yes | Yes, plus better timer advertisement |
| Default | **Yes** (on most IOS) | Enable with `standby version 2` |

**Why did v2 move off 224.0.0.2?** Because 224.0.0.2 means "all routers on this subnet", so every router has to process HSRPv1 hellos even if it doesn't run HSRP. A dedicated group address (224.0.0.102) means only HSRP speakers care. v2 also makes **group = VLAN** possible across a 4,000-VLAN campus. Group 100 on VLAN 100 is self-documenting.

**Exam trap:** v1 and v2 **don't interoperate**. If one side runs v1 and the other v2, both routers go **Active**, because each one's hellos are invisible to the other.

**Quick check:** HSRPv1 group 10 → vMAC `0000.0c07.ac0a` (10 = 0x0a). HSRPv2 group 100 → `0000.0c9f.f064` (100 = 0x064).

### States

| State | What's happening |
|-------|------------------|
| Initial | HSRP starting, interface just came up |
| Learn | Waiting to hear the VIP from the Active router (if the VIP isn't configured locally) |
| Listen | Knows the VIP; neither Active nor Standby. **Silent**: listens for hellos but sends none |
| Speak | Sending hellos, taking part in the election |
| **Standby** | Next in line. Sends hellos |
| **Active** | Forwards for the VIP and answers ARP with the vMAC |

### The Election

1. **Highest priority wins.** The range is 0–255 and the default is **100**.
2. **Tie: highest interface IP address wins.**
3. **Preemption is OFF by default.** A higher-priority router that comes up later does **not** take over until you configure `standby X preempt`.

**Why is preempt off by default?** Because every takeover is a small disruption: a gratuitous ARP, a MAC move and possibly lost packets. If the "better" router is flapping, preemption makes every flap cause *two* outages, one when it dies and one when it grabs the role back. Cisco's default favors stability, and you opt in when you have a reason. When you do enable it, add a **delay** (`preempt delay minimum 60`) so a rebooting router finishes building its routing table *before* it attracts traffic it can't yet route.

### Timers

The defaults are **hello 3 s, hold 10 s**. The hold time is how long a router waits without hearing hellos before declaring the Active router dead. You can tune them down to sub-second (`standby 10 timers msec 250 msec 750`) for faster failover, at the cost of more CPU and more risk of false failovers on a busy control plane. *For true sub-second detection, BFD (Chapter 25) is often the better tool.*

---

## 9.3 Try It — HSRP Done Properly

```
track 1 interface GigabitEthernet1/0/48 line-protocol   ! the uplink toward the core
!
interface Vlan10
 ip address 10.10.10.2 255.255.255.0
 standby version 2
 standby 10 ip 10.10.10.1                      ! the VIP hosts use as gateway
 standby 10 priority 110                       ! I should be Active for VLAN 10
 standby 10 preempt delay minimum 60           ! take it back, but only after 60 s
 standby 10 authentication md5 key-string Hsrp!Key
 standby 10 track 1 decrement 20               ! uplink down -> 110-20 = 90 < 100
```

### Why Tracking Is Not Optional

Picture DSW1 as Active for VLAN 10. Its **uplink** to the core fails, but its VLAN 10 interface is still up. HSRP hellos on VLAN 10 keep flowing, so DSW1 stays Active and keeps attracting every host's traffic, which it can no longer send anywhere useful. HSRP only watches the LAN segment, and it has no idea the uplink is gone.

**Tracking** links HSRP priority to something that *does* matter. When track object 1 goes down, priority drops by 20, from 110 to 90. DSW2 is at 100, so it now has the higher priority. **But DSW2 only takes over if DSW2 has `preempt` configured.** Tracking lowers your priority. Preemption is what lets the *other* router act on that.

**Default decrement:** if you write `standby 10 track 1` with no `decrement` value, the priority drops by **10**. **Exam trap:** the decrement has to be big enough to cross the other router's priority. 110 − 5 = 105 is still higher than 100, so nothing happens. Do the arithmetic every time.

### Tracking More Than Interfaces

An uplink can be up/up while the path beyond it is broken. Track **reachability** instead, using IP SLA (Chapter 15):

```
ip sla 1
 icmp-echo 10.255.255.1 source-interface Vlan10   ! ping something beyond the uplink
 frequency 5
ip sla schedule 1 life forever start-time now
!
track 2 ip sla 1 reachability
 delay down 10 up 30                               ! damp flaps: wait before acting
!
interface Vlan10
 standby 10 track 2 decrement 20
```

`track X ip route 0.0.0.0 0.0.0.0 reachability` is another common choice: "Am I still learning a default route?"

### Authentication

`standby 10 authentication md5 key-string …` stops a rogue device from sending priority-255 hellos and hijacking the gateway. Plain-text authentication (`standby 10 authentication text`) only prevents accidents, because the password is visible in a capture. A mismatch means each router ignores the other's hellos, which again produces **two Actives**.

The **key-chain** form lets you rotate keys without an outage, because each key has its own lifetime (the time must be right for that to work, which is one more reason NTP from Chapter 8 matters):

```
key chain HSRP-KEYS
 key 1
  key-string Hsrp!Key2026
!
interface Vlan10
 standby 10 authentication md5 key-chain HSRP-KEYS
```

### IPv6 HSRP

```
interface Vlan10
 standby version 2                          ! required for IPv6
 standby 110 ipv6 autoconfig                ! VIP = link-local derived from the vMAC
 standby 110 priority 110
 standby 110 preempt
```

**Why is the IPv6 VIP a link-local address?** Because IPv6 hosts learn their default gateway from **Router Advertisements**, and the router in an RA is identified by its **link-local** address (CCNA guide 13.8). The HSRP Active router sends RAs from the virtual link-local address, so hosts install the VIP as their gateway automatically, without any static configuration.

---

## 9.4 Load Sharing — Using Both Routers

A single HSRP group leaves the Standby router idle, holding only a backup role. To use both:

**Run a separate group per VLAN, and alternate which router is Active.**

![Two distribution switches, each HSRP Active and STP root for different VLANs](images/c09_fhrp_loadshare.png)

| VLAN | HSRP Active | **STP root** (Chapter 4) |
|------|-------------|--------------------------|
| 10 | DSW1 (priority 110) | DSW1 |
| 20 | DSW2 (priority 110) | DSW2 |

**Why must the STP root and the HSRP Active router be the same switch?** Picture them misaligned. For VLAN 10, DSW2 is the STP root, so the access switch's uplink to DSW1 is *blocking* for VLAN 10. HSRP Active is DSW1. A host's frame to the gateway now goes up to DSW2 (the only forwarding path), across the inter-distribution link, and then to DSW1. Every packet takes an extra hop across a link that was never sized for it. Aligning them means the forwarding uplink leads *directly* to the Active gateway. *Layer 2 and Layer 3 redundancy have to agree on which box is "primary", or traffic zig-zags between them.*

The matching configs, side by side. Each switch is primary for one VLAN and backup for the other, and both preempt so the design restores itself after a failure:

```
! --- DSW1: Active for VLAN 10, Standby for VLAN 20
spanning-tree vlan 10 root primary
spanning-tree vlan 20 root secondary
interface Vlan10
 ip address 10.10.10.2 255.255.255.0
 standby version 2
 standby 10 ip 10.10.10.1
 standby 10 priority 110
 standby 10 preempt delay minimum 60
 standby 10 track 1 decrement 20
interface Vlan20
 ip address 10.10.20.2 255.255.255.0
 standby version 2
 standby 20 ip 10.10.20.1
 standby 20 preempt                         ! default priority 100
!
! --- DSW2: Active for VLAN 20, Standby for VLAN 10
spanning-tree vlan 20 root primary
spanning-tree vlan 10 root secondary
interface Vlan10
 ip address 10.10.10.3 255.255.255.0
 standby version 2
 standby 10 ip 10.10.10.1
 standby 10 preempt                         ! takes over if DSW1 drops to 90
interface Vlan20
 ip address 10.10.20.3 255.255.255.0
 standby version 2
 standby 20 ip 10.10.20.1
 standby 20 priority 110
 standby 20 preempt delay minimum 60
 standby 20 track 1 decrement 20
```

**Why does the *backup* side need `preempt` too?** Tracking on DSW1 only lowers DSW1's priority to 90. DSW2 must be allowed to seize the role from a lower-priority Active, and that's exactly what `preempt` permits. Without it, DSW1 stays Active at priority 90 while its uplink is dead.

This is the per-VLAN load sharing pattern. It balances **per VLAN**, not per host, so it only splits traffic well if the VLANs carry similar loads.

---

## 9.5 VRRP — the Open Standard

**VRRP (Virtual Router Redundancy Protocol)** does the same job, standardized as RFC 3768 (v2) and RFC 5798 (v3). It is **IP protocol 112** (no UDP), and advertisements go to **224.0.0.18** (IPv4) or **FF02::12** (IPv6).

| Property | VRRP |
|----------|------|
| Roles | **Master** and **Backup** (no separate "standby": all non-masters are backups) |
| Virtual MAC | `0000.5e00.01XX` (IPv4), `0000.5e00.02XX` (IPv6), XX = group in hex |
| Group range | 1–255 |
| Priority | Default **100**; **255 = address owner** |
| **Preemption** | **ON by default** |
| Advertisement | Master only, every **1 s** (v3 counts in centiseconds: 100 cs) |
| Versions | v2: IPv4 only, optional authentication. v3: IPv4 + IPv6, sub-second, **no authentication** |

**What is the "address owner"?** VRRP lets the VIP be one of the router's *real* interface addresses. The router that owns that address automatically gets priority **255** and always becomes Master. That's a sensible default: if the real owner is alive, it should answer for its own address.

**Why does only the Master advertise in VRRP, while HSRP's Active *and* Standby both send hellos?** Different design choices. VRRP keeps the segment quiet: backups listen, and if they hear nothing for the **master down interval** (3 × advertisement interval + skew time, where skew = (256 − priority) ÷ 256 s), the best backup takes over. With the defaults that's 3 × 1 + 156/256 ≈ **3.6 s**, and the skew means a priority-200 backup times out slightly sooner than a priority-100 one, so the best backup naturally wins. HSRP's Standby announces itself, so everyone knows the succession in advance; any further HSRP routers sit silently in **Listen**.

### Try It — VRRPv3 on IOS XE

```
fhrp version vrrp v3                       ! enable VRRPv3 syntax globally
!
interface Vlan20
 ip address 10.10.20.2 255.255.255.0
 vrrp 20 address-family ipv4
  address 10.10.20.1 primary               ! the VIP
  priority 110
  track 1 decrement 20                     ! same tracking idea as HSRP
  ! preempt is already on by default
 exit-vrrp
```

Older IOS uses VRRPv2 syntax at interface level (`vrrp 20 ip 10.10.20.1`, `vrrp 20 priority 110`). Know both when reading configs.

### VRRPv2 vs VRRPv3 — Versions Must Match

VRRPv2 and VRRPv3 use different packet formats, so a v2 router and a v3 router on the same segment **don't understand each other's advertisements**. Both become Master, the same symptom as an HSRP version mismatch. Two ways to fix it:

- Run the same version on both. On IOS XE, `fhrp version vrrp v3` switches the whole box to v3 syntax.
- During a migration, put **`vrrpv2`** under the v3 IPv4 address family. The v3 router then also sends v2-format advertisements that the old router understands.

```
interface Vlan20
 vrrp 20 address-family ipv4
  vrrpv2                                   ! interoperate with VRRPv2 neighbours
```

**VRRPv2 authentication** exists (v3 removed it, per RFC 5798):

```
interface Vlan20
 vrrp 20 ip 10.10.20.1
 vrrp 20 authentication md5 key-string Vrrp!Key   ! or: authentication text <pw>
```

As with HSRP, a key mismatch makes each router ignore the other's advertisements, so both claim Master.

```
DSW1# show vrrp brief
Interface      Grp  A-F Pri  Time Own Pre State   Master addr/Group addr
Vl20            20 IPv4 110     0  N   Y  MASTER  10.10.20.2(local) 10.10.20.1
```

---

## 9.6 GLBP — Briefly, for Comparison

**GLBP (Gateway Load Balancing Protocol)**, Cisco-proprietary on **UDP 3222** to **224.0.0.102**, solves the "idle standby" problem *inside one group*. One router is the **AVG** (Active Virtual Gateway). It hands out **different virtual MACs** to different hosts in its ARP replies, and up to **four AVFs** (Active Virtual Forwarders) each forward for their own vMAC (`0007.b400.XXYY`). Everyone shares one VIP, yet hosts spread across all routers. Load balancing is **round-robin** by default, or weighted, or host-dependent.

It's elegant, but it fits poorly in modern designs. Spreading one VLAN's hosts across two gateways conflicts with STP alignment (9.4), and Catalyst 9000 switches often don't support it at all. You'll meet it in comparison questions far more than in production. It isn't named in the ENCOR v1.2 blueprint, which says "HSRP, VRRP".

---

## 9.7 Comparison Table (Exam Gold)

| Feature | HSRP | VRRP | GLBP |
|---------|------|------|------|
| Standard | Cisco | **IETF** (RFC 5798) | Cisco |
| Transport | UDP 1985 | **IP protocol 112** | UDP 3222 |
| Multicast | 224.0.0.2 (v1) / .102 (v2) | **224.0.0.18** | 224.0.0.102 |
| Roles | Active / Standby | Master / Backup | AVG / AVF |
| Virtual MAC | 0000.0c07.acXX / 0000.0c9f.fXXX | 0000.5e00.01XX | 0007.b400.XXYY |
| Default priority | 100 | 100 (255 = owner) | 100 |
| Preempt default | **Off** | **On** | Off (AVG) / On (AVF) |
| Default timers | 3 s / 10 s | 1 s advert, ~3.6 s master down | 3 s / 10 s |
| VIP can be a real IP? | No | **Yes** | No |
| Load balancing in one group | No | No | **Yes** |

---

## 9.8 Troubleshooting FHRPs

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| **Both routers Active/Master** | Hellos not arriving: VLAN not allowed on the trunk, ACL dropping 224.0.0.2/.102/.18, **version** or **group number** mismatch, **authentication** mismatch | `show standby` (look for "Standby router is unknown"), `debug standby packets` |
| **Both VRRP routers Master** | VRRPv2 on one router, v3 on the other; or a v2 auth mismatch | `show vrrp` on both (version, auth), `debug vrrp packets` |
| Higher-priority router never takes over | `preempt` not configured | `show standby brief` (`P` column missing) |
| Uplink failed but no failover | No tracking, or the decrement is too small to cross the peer's priority | `show standby` (shows tracked objects and current priority), `show track` |
| Failover flaps repeatedly | Tracked object flapping; timers too aggressive | `show track` (change counters), add `delay down/up`, raise preempt delay |
| Duplicate address messages for the VIP | VIP configured as a real interface address on another device (HSRP) | `show ip arp`, syslog `%IP-4-DUPADDR` |
| Hosts lose connectivity for ~minutes after failover | Switch CAM didn't update; gratuitous ARP lost | `show mac address-table address <vMAC>` |
| Traffic hairpins between distribution switches | STP root and FHRP Active misaligned | `show spanning-tree vlan X` vs `show standby brief` |

```
DSW1# show standby vlan 10
Vlan10 - Group 10 (version 2)
  State is Active
    5 state changes, last state change 00:12:41
  Virtual IP address is 10.10.10.1
  Active virtual MAC address is 0000.0c9f.f00a (MAC In Use)
  Hello time 3 sec, hold time 10 sec
  Preemption enabled, delay min 60 secs
  Active router is local
  Standby router is 10.10.10.3, priority 100 (expires in 9.168 sec)
  Priority 110 (configured 110)
    Track object 1 state Up decrement 20
```

**Read it from the top:** this router is Active, and it lists a real **Standby router**, so hellos are flowing both ways. Preemption is on, with a delay. Priority equals configured priority, which means no tracked object has fired. If you saw `Standby router is unknown` on *both* switches, they can't hear each other. Go straight to the first row of the table.

---

## 9.9 Chapter Summary

| Concept | Remember |
|---------|----------|
| Virtual MAC | Moves with the VIP so hosts' ARP caches stay valid |
| HSRP election | Priority (default 100) → highest IP; **preempt off** |
| HSRPv2 | Groups 0–4095, 224.0.0.102, needed for IPv6 |
| Tracking | Lowers priority; the **peer's preempt** makes it matter |
| Load sharing | One group per VLAN, alternate Active, **align with STP root** |
| VRRP | Open, protocol 112, 224.0.0.18, **preempt on**, owner = 255 |
| Two Actives | Always means the hellos aren't getting through |

---

<a name="chapter-10"></a>
# Chapter 10: Multicast

> **Blueprint:** ENCOR 3.3.d — Describe multicast protocols, such as RPF check, PIM SM, IGMP v2/v3, SSM, bidir, and MSDP

Multicast is the topic most CCNA graduates have seen the least of. CCNA mentions it only as a type of address. ENCOR's verb is **describe**, so you don't need to build a multicast network from memory. You do need to explain every moving part precisely: how hosts ask for a stream, how routers build a delivery tree toward them, and why a router will drop a perfectly good multicast packet that arrives on the "wrong" interface. Each protocol answers one question. Learn the question first, and the protocol follows.

---

## 10.1 Why Multicast Exists

Suppose one video server must send a 5 Mbps stream to 200 viewers.

| Method | What the source sends | What the network carries | Problem |
|--------|----------------------|--------------------------|---------|
| **Unicast** | 200 copies (1 Gbps) | 200 copies on the first links | Source and nearby links melt; doesn't scale |
| **Broadcast** | 1 copy | Every host on the subnet gets it | Doesn't cross routers; bothers everyone |
| **Multicast** | **1 copy** | Copies made **only where paths split**, delivered **only to subscribers** | Needs protocols to know who wants what |

**Why can't the source just send unicast and let the network cope?** Because the cost grows with the number of receivers, and it's paid on the links nearest the source. With multicast, the source sends once, and each router replicates the packet only onto branches that lead to interested receivers. *One copy per link, no matter how many viewers are downstream.*

Multicast is almost always **UDP**, which means no handshake, no retransmission and best-effort delivery. Typical uses are IPTV and video distribution, market-data feeds, software imaging (one image pushed to 500 PCs), music-on-hold, and routing protocols themselves (OSPF's 224.0.0.5).

**The two halves of every multicast design:**

1. **Host ↔ first router:** a receiver says "I want group G". That's **IGMP**.
2. **Router ↔ router:** routers build a tree from the source to every router with interested receivers. That's **PIM**.

---

## 10.2 Multicast Addressing

IPv4 multicast is **224.0.0.0/4** (224.0.0.0 – 239.255.255.255, the old Class D). A group address is a **destination only**: a packet is never *sourced* from a multicast address.

| Range | Name | Behavior |
|-------|------|----------|
| **224.0.0.0/24** | Local network control | **Link-local, TTL 1, never routed.** 224.0.0.1 all hosts, .2 all routers, .5/.6 OSPF, .9 RIPv2, .10 EIGRP, .13 PIM, .18 VRRP, .22 IGMPv3, .102 HSRPv2/GLBP |
| 224.0.1.0/24 | Internetwork control | Routable control: 224.0.1.1 NTP, .39/.40 Auto-RP, .129 PTP |
| **232.0.0.0/8** | **Source-Specific Multicast (SSM)** | Reserved for (S,G) delivery (10.6) |
| 233.0.0.0/8 | GLOP | Static ranges mapped from 16-bit AS numbers |
| **239.0.0.0/8** | **Administratively scoped** | The "private addresses" of multicast; use inside your organization |

### Mapping a Group to a MAC Address

![The low 23 bits of the group address copied into a 01:00:5e MAC](images/c10_mcast_mac.png)

An Ethernet NIC needs a **MAC** to filter on. IPv4 multicast MACs are built like this:

- The first 25 bits are fixed: **01:00:5e** plus one 0 bit.
- The **low-order 23 bits** of the group address are copied in.

A group address has 28 significant bits (32 minus the fixed `1110` prefix). Only 23 fit, so **5 bits are lost**, and **2⁵ = 32 different groups map to the same MAC**.

**Worked example:** 239.1.1.1 → `01:00:5e:01:01:01`. And 224.**129**.1.1? The second octet, 129, is `1000 0001`. Its top bit falls into the 5 lost bits, leaving `000 0001` = 01, so this group *also* becomes `01:00:5e:01:01:01`.

**Why does this overlap matter?** A host that joined 239.1.1.1 will have its NIC accept frames for 224.129.1.1 too. The IP stack discards them, but only after the CPU has looked at them. It's mostly harmless, but it's why addressing plans avoid groups that differ only in those 5 bits. *Exam favorite: "how many IP groups share one multicast MAC?" The answer is 32.*

(IPv6 multicast is FF00::/8, mapped to MAC **33:33** plus the low 32 bits. IPv6 uses **MLD** instead of IGMP: MLDv1 ≈ IGMPv2, MLDv2 ≈ IGMPv3.)

---

## 10.3 IGMP — Hosts Asking for Groups

**IGMP** runs between hosts and their **local router** (IP protocol 2). It never crosses a router.

### IGMPv2

| Message | Sent to | Purpose |
|---------|---------|---------|
| **Membership Report** (join) | The group itself | "I want group G". Sent unsolicited when joining, and in answer to queries |
| **General Query** | 224.0.0.1 | Router asks: "Does anyone still want *any* groups?" Every **60 s** by default on IOS (RFC default 125 s). Hosts must answer within the **max response time, 10 s** by default |
| **Group-Specific Query** | The group | "Does anyone *still* want G?" Sent after a Leave |
| **Leave Group** | **224.0.0.2** | "I'm done with G" (new in v2) |

**Why does a router send a group-specific query after a Leave, instead of just pruning?** Because IGMP tracks *whether anyone* on the subnet wants a group, not *who*. One host leaving tells the router nothing about the other 30 hosts on the VLAN. So the router asks once more, using a short **max response time** (the *last member query interval*, 1 s by default on IOS, sent twice). If nobody answers, the router stops forwarding. This **low leave latency** is what v2 added over v1, where a router only noticed silence after several minutes.

*Don't confuse this with the switch feature called **immediate-leave** (sometimes "fast-leave") in IGMP snooping, below. That one removes a port the instant a Leave arrives, with no query at all, and is only safe when a single host sits behind each port.*

**The querier:** if a subnet has several routers, only one should send queries. In IGMPv2 the **lowest IP address** wins the querier election. (In IGMPv1 there was no election, so the PIM DR did it.)

**Report suppression (v2):** when a host hears another host's report for the same group, it suppresses its own. The router only needs one "yes" per group.

### IGMPv3

| Change | Why it matters |
|--------|----------------|
| Reports go to **224.0.0.22** | Routers and snooping switches hear every report |
| **No report suppression** | Every host reports, so the router can track individual members (precise, fast leaves) |
| **No separate Leave message** | Leaving is a **state-change report** (for example "change G to INCLUDE {}", or BLOCK a source). The router then sends a group-and-source-specific query |
| **Source filtering**: INCLUDE / EXCLUDE source lists | A host can say "group G, but **only from source S**". This is the foundation of **SSM** (10.6) |

*IGMPv2 says "I want G". IGMPv3 says "I want G from S", and that one extra word removes the need for an RP.*

### IGMP Snooping (Layer 2)

A switch treats multicast frames like broadcasts by default and **floods** them to every port in the VLAN. A 20 Mbps stream then hits every PC whether or not anyone is watching. **IGMP snooping** has the switch listen to IGMP reports passing through it and build a table mapping each group to the ports that asked for it. It then forwards each group only to those ports, plus the **mrouter port** facing the router. Snooping is on by default on Catalyst switches.

**Why must the switch know the mrouter port?** Because routers don't send IGMP reports. They send queries and PIM hellos, and the switch identifies the router port from those. If no querier exists on a VLAN (a VLAN with no router), reports eventually time out and snooping breaks. The fix is `ip igmp snooping querier`.

**Immediate-leave:** `ip igmp snooping vlan 10 immediate-leave` makes the switch drop a port from the group the moment it sees a Leave, skipping the query. It's great for a VLAN where each port has exactly one receiver (an IPTV set-top box, say), and wrong anywhere a port leads to several hosts, because one host leaving would cut off the rest.

**Verifying IGMP and snooping:**

```
R1# show ip igmp groups                      ! router: groups with members, per interface
R1# show ip igmp interface Gi0/1             ! version, querier, query/max-response timers
SW1# show ip igmp snooping                   ! global and per-VLAN snooping state
SW1# show ip igmp snooping groups            ! group -> ports table the switch built
SW1# show ip igmp snooping mrouter           ! which port leads to the multicast router
SW1# show ip igmp snooping querier           ! who is querying in each VLAN
```

If `show ip igmp snooping groups` lists a group but no ports, or `mrouter` shows nothing, the stream either floods or never reaches the router. Those two outputs pin down most Layer 2 multicast faults.

---

## 10.4 PIM — Building the Tree Between Routers

**PIM (Protocol Independent Multicast)** is IP protocol **103**, with hellos to **224.0.0.13** every **30 s**. "Protocol independent" means PIM has **no routing table of its own**. It borrows the **unicast** routing table (whatever OSPF, EIGRP, BGP or static routes put there) to work out which direction a source or RP lies in.

### Two Kinds of Tree

![PIM-SM: shared tree through the RP vs shortest-path tree straight from the source](images/c10_pim_trees.png)

| Tree | Notation | Root | Pros / cons |
|------|----------|------|-------------|
| **Source tree / shortest-path tree (SPT)** | **(S,G)** | The source | Optimal path; state for *every* source × group |
| **Shared tree (RPT)** | **(\*,G)** | The **Rendezvous Point (RP)** | One tree per group regardless of source; path may detour via the RP |

### Dense Mode vs Sparse Mode

| Mode | Assumption | Mechanism |
|------|------------|-----------|
| **PIM Dense Mode (DM)** | "Receivers are everywhere" | **Flood and prune**: send everywhere, routers with no receivers send Prunes. Prunes expire (≈3 min) and the flood repeats |
| **PIM Sparse Mode (SM)** | "Receivers are few; nobody gets traffic unless they ask" | **Explicit join** toward an RP; traffic flows only down branches that joined |

**Why is dense mode essentially obsolete?** Because flood-and-prune puts every stream on every link at least every few minutes, and keeps state on routers that never wanted it. Sparse mode's "pull, don't push" model scales, which is why it's the enterprise default and the one ENCOR names.

### PIM Neighbors, the DR and the Assert

PIM routers find each other with hellos to 224.0.0.13 (`show ip pim neighbor`). On a **multi-access** segment with several PIM routers, two elections decide who does what:

**The Designated Router (DR).** One router per segment is elected **DR**:

1. Highest **DR priority** wins (`ip pim dr-priority`, default **1**).
2. Tie: highest IP address.

On a **receiver** segment, the DR is the router that turns IGMP reports into PIM Joins (so only one Join goes upstream). On a **source** segment, the DR is the one that sends PIM Register messages to the RP. `show ip pim interface` shows the DR for each interface.

**The Assert.** Sometimes two routers both forward the same (S,G) onto one LAN, for example two routers each with a downstream receiver segment that is the same VLAN. Each sees the other's copies arriving on its own *outgoing* interface, which means the LAN is getting every packet twice. They exchange **PIM Assert** messages, and the winner is:

1. Lowest **administrative distance** of the route back to the source (or RP).
2. Tie: lowest **metric** to the source.
3. Tie: highest IP address.

The loser stops forwarding onto that LAN. *The DR decides who asks for traffic; the Assert decides who delivers it when two routers end up delivering.*

---

## 10.5 PIM Sparse Mode Step by Step

Picture a source S, its **first-hop router (FHR)**, an **RP**, and a receiver behind its **last-hop router (LHR)**.

1. **Receiver joins.** The host sends an IGMP report for G. The LHR (the PIM **DR** on that segment) sends a **PIM (\*,G) Join** hop by hop **toward the RP**. Every router along the way adds (\*,G) state, which builds the **shared tree**.
2. **Source starts sending.** The FHR doesn't yet know if anyone wants the traffic. It wraps the multicast packets in unicast **PIM Register** messages and sends them straight to the RP.
3. **RP joins toward the source.** The RP has receivers for G, so it de-encapsulates the packets, forwards them down the shared tree, and sends an **(S,G) Join** toward S. Once native multicast arrives along that path, the RP sends **Register-Stop** to the FHR, which ends the tunnelled phase.
4. **SPT switchover.** When the LHR receives the first packet, it now knows S's address. It sends an **(S,G) Join directly toward S** and, once traffic arrives on that path, prunes S off the shared tree (an **(S,G) RPT-bit prune** toward the RP). On IOS the default **SPT threshold is 0**: switch immediately on the first packet.

**Why bother with a shared tree at all if everyone switches to the SPT immediately?** Because of **source discovery**. A receiver knows the group but not the sources, and the LHR can't join a tree toward a source it has never heard of. The RP is the **meeting place** where sources register and receivers join. Once the first packet has introduced the source, the LHR builds the shortest path straight to it. *The RP is the introduction, not the long-term delivery path.*

### The RPF Check — Multicast's Loop Prevention

Unicast forwarding asks "where is the destination?" Multicast can't ask that, because the destination is a group spread across the network. It asks the reverse question:

**Reverse Path Forwarding (RPF) check:** when a multicast packet arrives, look up the **source** address (or the **RP** address, for shared-tree traffic) in the **unicast** routing table. If the packet arrived on the interface this router would use to send traffic *back toward that source*, it **passes** and is replicated downstream. If it arrived on any other interface, it is **dropped**.

**Why does this prevent loops?** In a meshed network, copies of the same packet can arrive over several paths. Only the copy arriving on the shortest path back to the source passes, and every duplicate or looping copy fails the check. That guarantees a tree, which has no loops by definition. *Multicast flows away from the source along paths the unicast table already agrees on.*

**The classic RPF failure:** the unicast table and the multicast path disagree. A typical case is a stream coming in on a link where PIM is enabled, while the unicast route to the source points out a *different* link where PIM isn't. The packets fail RPF and are silently dropped. The fixes are to enable PIM on the RPF interface, fix the unicast routing, or add a static multicast route (`ip mroute`) to override RPF.

### Reading `show ip mroute`

```
R3# show ip mroute 239.1.1.1
(*, 239.1.1.1), 00:04:12/00:02:51, RP 10.0.0.1, flags: SJC
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.1.13.1
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:04:12/00:02:51

(10.5.5.10, 239.1.1.1), 00:03:58/00:02:59, flags: JT
  Incoming interface: GigabitEthernet0/0, RPF nbr 10.1.23.2
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:03:58/00:02:51
```

| Item | Meaning |
|------|---------|
| `(*, G)` + `RP 10.0.0.1` | Shared-tree entry, rooted at that RP |
| `(S, G)` | Source-tree entry for one specific source |
| **Incoming interface / RPF nbr** | The interface that passes the RPF check, and the upstream neighbor |
| **Outgoing interface list (OIL)** | Where copies are replicated. Empty = nothing downstream wants it |
| Flags **S** / **C** / **J** / **T** | **S**parse; **C**onnected receiver; **J**oin SPT; **T** = traffic is flowing on the SPT |

Seeing an (S,G) entry with the **T** flag at the LHR means the switchover in step 4 happened.

---

## 10.6 SSM, Bidir and MSDP — Three Variations on PIM-SM

### Source-Specific Multicast (SSM)

If the receiver already knows the source, which IGMPv3 makes possible, the LHR can **join (S,G) toward the source immediately**. There's **no RP, no shared tree, no Register** step. The SSM range is **232.0.0.0/8**.

```
ip multicast-routing                ! some platforms: ip multicast-routing distributed
ip pim ssm default                  ! treat 232/8 as SSM
interface Vlan10
 ip pim sparse-mode
 ip igmp version 3                  ! receivers must send (S,G) reports
```

**Why is SSM increasingly the default for one-to-many services (IPTV, market data)?** Because the RP is the most complex and fragile part of PIM-SM. It's a single meeting point you have to place, make redundant and keep reachable. SSM removes it entirely. As a bonus, a host can't receive a stream from an unexpected source sending to the same group, because the subscription names the source.

### Bidirectional PIM (Bidir)

For **many-to-many** applications (each participant is both source and receiver), PIM-SM would create (S,G) state for *every* participant. **Bidir PIM** keeps **only (\*,G)** state. Traffic flows **up** the shared tree toward the RP and **down** to receivers, with no Register messages and no SPT switchover. Since packets travel in both directions, the normal RPF check can't apply. Instead, each link elects a **Designated Forwarder (DF)**, the router allowed to forward traffic toward the RP on that link. *Bidir trades optimal paths for very small state, which is the right trade when there are thousands of sources.*

### MSDP — Connecting RPs

Each PIM-SM domain has its own RP, so a receiver in domain A can't discover a source in domain B: they register with different RPs. **MSDP (Multicast Source Discovery Protocol)** runs between RPs over **TCP 639**. When a source registers with one RP, that RP sends **Source-Active (SA)** messages to its MSDP peers. A peer RP with receivers for that group then joins toward the source across the domain boundary.

Its other big use is inside **one** domain: **Anycast RP**. Several routers share the same RP address (a /32 loopback), so sources and receivers reach the *nearest* one through normal unicast routing. MSDP between those RPs makes sure each one learns sources that registered with the others. *That gives you RP redundancy and load sharing, built from ordinary routing.*

### How Routers Learn the RP

| Method | How | Notes |
|--------|-----|-------|
| **Static** | `ip pim rp-address 10.0.0.1` on every router | Simple and predictable; manual everywhere |
| **Auto-RP** (Cisco) | Candidate RPs announce to **224.0.1.39**; a **mapping agent** picks one per group and announces to **224.0.1.40** | Chicken-and-egg: those groups need flooding before an RP is known (`ip pim autorp listener`) |
| **BSR** (standard, PIMv2) | A **bootstrap router** is elected; candidate RPs unicast to it; it floods the RP set hop by hop in PIM messages to 224.0.0.13 | Standards-based; IPv6 too |

---

## 10.7 Chapter Summary

| Question | Protocol / answer |
|----------|-------------------|
| How does a host ask for a group? | **IGMP** (v2: group; v3: group + source) |
| How does a switch avoid flooding? | **IGMP snooping** |
| How do routers build delivery trees? | **PIM** (sparse mode; uses the unicast table) |
| How are loops prevented? | **RPF check**: arrive on the interface back toward the source |
| How do receivers find unknown sources? | Via the **RP** (shared tree), then SPT switchover |
| How do you skip the RP? | **SSM** (232/8 + IGMPv3) |
| Many-to-many with tiny state? | **Bidir PIM** (\*,G) only, DF per link |
| How do RPs share sources? | **MSDP** (TCP 639), also used for Anycast RP |
| Groups per multicast MAC? | **32** (5 bits lost) |

---

<a name="chapter-11"></a>
# Chapter 11: QoS — Quality of Service

> **Blueprint:** ENCOR 1.4 — Interpret QoS configurations

The CCNA guide (17.7) explained *why* QoS exists: voice can't tolerate delay or jitter, a backup job will happily eat every bit of a link, and tail drop causes TCP global synchronization. ENCOR's verb is **interpret**. You'll be shown a QoS configuration, or the `show policy-map interface` output that comes with it, and asked what it does to a given packet. This chapter builds that skill. It first fills in the full marking vocabulary and the toolkit at CCNP depth, then reads a realistic WAN-edge policy line by line.

---

## 11.1 The Three QoS Models

| Model | Idea | Reality |
|-------|------|---------|
| **Best effort** | No QoS. First in, first out | The default; fine until a link congests |
| **IntServ** (Integrated Services) | Each application **reserves** bandwidth end to end with **RSVP** before sending; every router keeps per-flow state | Strict guarantees, but per-flow state on every hop doesn't scale to an enterprise or the internet |
| **DiffServ** (Differentiated Services) | Traffic is **classified and marked** at the edge into a handful of classes; each hop applies a **per-hop behavior (PHB)** based on the marking | Scales because routers keep **no per-flow state**. It's the model behind everything below |

**Why did DiffServ win?** Because state is what kills scale. IntServ asks every router in the path to remember every conversation. DiffServ asks every router to remember about **eight classes** and read one field in each packet. The trade-off is that DiffServ gives **relative** guarantees ("voice goes first") rather than absolute ones ("this call gets 80 kbps end to end"). For an enterprise, that's almost always the right trade.

---

## 11.2 Classification and Marking — the Vocabulary

![The IP ToS byte: 6-bit DSCP plus 2-bit ECN, and the 3-bit 802.1Q PCP](images/c11_marking_fields.png)

| Field | Where | Size | Values |
|-------|-------|------|--------|
| **CoS / PCP** | 802.1Q tag (Layer 2) | 3 bits | 0–7. **Disappears at the first router**, since the tag doesn't survive routing |
| **IP Precedence** | ToS byte, top 3 bits (legacy) | 3 bits | 0–7 |
| **DSCP** | ToS byte, top **6** bits (Layer 3) | 6 bits | 0–63. Survives end to end across routed hops |
| **ECN** | ToS byte, bottom 2 bits | 2 bits | Congestion signalling without dropping (11.6) |

**Why mark at Layer 3 rather than relying on CoS?** CoS lives in the 802.1Q tag, and a router strips the tag when it routes the packet. So CoS can't describe a packet's class past the first Layer 3 hop. DSCP is part of the IP header, so it survives routing, which makes it the marking that matters end to end. Switches commonly map one to the other at the boundary.

### The Standard PHBs

| PHB | DSCP name | Decimal | Binary | Meaning / typical use |
|-----|-----------|---------|--------|-----------------------|
| **Default (BE)** | DF / CS0 | 0 | 000000 | Best effort |
| **EF** — Expedited Forwarding | EF | **46** | 101110 | Low delay, low jitter, low loss: **voice** |
| **AF** — Assured Forwarding | AFxy | 8x + 2y | — | 4 classes × 3 drop precedences |
| **CS** — Class Selector | CS1–CS7 | **8 × n** | nnn000 | Backward-compatible with IP Precedence (CS3 = 24 = Precedence 3) |

### The AF Table (Memorize the Pattern, Not the Numbers)

| Class | Low drop (y=1) | Medium drop (y=2) | High drop (y=3) | Common use |
|-------|---------------|-------------------|-----------------|------------|
| **AF1x** | AF11 = **10** | AF12 = 12 | AF13 = 14 | Bulk data |
| **AF2x** | AF21 = **18** | AF22 = 20 | AF23 = 22 | Transactional data |
| **AF3x** | AF31 = **26** | AF32 = 28 | AF33 = 30 | Multimedia streaming |
| **AF4x** | AF41 = **34** | AF42 = 36 | AF43 = 38 | Interactive video |

**The formula is DSCP = 8x + 2y.** For AF32: 8×3 + 2×2 = 28. The **first digit (x) is the class**, which decides the queue. The **second digit (y) is drop precedence *within* that class**, which decides who gets dropped first when that queue fills. **Exam trap:** AF13 isn't "better" than AF11. Same queue, but AF13 is dropped **first**. Within an AF class, a higher y means a higher drop probability.

**Why have drop precedence at all?** It lets you be gentle with traffic that exceeds its share instead of brutal. A policer can **remark** out-of-contract traffic from AF11 to AF13 rather than dropping it. It still travels in the same queue, but if that queue congests, the excess traffic is first in line to be dropped (11.6). *Over your limit, you still get on the bus, but you'll be the first one asked to leave.*

### Classification Tools

- **ACLs** and header fields (ports, addresses) for traffic you can identify by port.
- **Incoming markings** (`match dscp ef`) when the source is trusted.
- **NBAR / NBAR2** (Network-Based Application Recognition): deep packet inspection that identifies **applications** (Webex, Teams, YouTube, BitTorrent) even when they share port 443. Use `match protocol webex-meeting`. Run `ip nbar protocol-discovery` on an interface to see what's actually on the link.

### Trust Boundaries

The trust boundary is the point where you start believing markings. Everything outside it is remarked.

| Where | Typical policy |
|-------|----------------|
| Cisco IP phone port | Trust the phone (often conditionally: only if CDP/LLDP sees a phone); the phone remarks the attached PC's traffic to 0 |
| User PC port | Don't trust; classify and mark yourself (or set to 0) |
| Uplinks between your own switches/routers | Trust (the edge already did the work) |
| Internet / partner links | Don't trust; remark |

**Why not trust PCs?** Because any user or piece of software can set DSCP 46 on a file transfer and jump the voice queue. Marking is an honor system. You trust only devices you control. **Platform note:** older Catalyst switches with `mls qos` enabled treat every port as untrusted until you say otherwise. Catalyst 9000 switches preserve (trust) incoming markings by default, so on those you must *explicitly* remark untrusted ports.

---

## 11.3 MQC — the Three-Part Structure Every Config Uses

Every modern Cisco QoS configuration uses the **Modular QoS CLI**. Learn its three parts and you can read any of them:

| Part | Command | Answers |
|------|---------|---------|
| 1. **Class map** | `class-map [match-any|match-all] NAME` + `match …` | **Which** traffic? |
| 2. **Policy map** | `policy-map NAME` + `class NAME` + actions | **What** happens to it? |
| 3. **Service policy** | `service-policy {input|output} NAME` on an interface | **Where** and in which direction? |

- **`match-all`** (the default!) requires **every** `match` line to be true (logical AND). **`match-any`** needs just one (OR). **Exam trap:** a `match-all` class with `match dscp ef` and `match dscp cs3` matches nothing, because one packet can't carry two DSCP values.
- Classes in a policy are checked **top to bottom; first match wins**.
- Anything unmatched falls into **`class-default`**, which always exists, even if you don't configure it.

### Marking on Ingress — Reading a Classification Policy

Queuing policies (11.5, 11.7) *act on* markings, but someone has to *set* them first, at the trust boundary, **inbound** on the access port. ENCOR shows you policies like this one and asks what happens to a given packet:

```
class-map match-any VOICE-IN
 match protocol rtp audio                    ! NBAR: identify by application
class-map match-any WEBEX-IN
 match protocol webex-meeting
class-map match-all BULK-IN
 match access-group name BACKUP-SERVERS      ! ACL: identify by address/port
!
policy-map MARK-ACCESS-IN
 class VOICE-IN
  set dscp ef                                ! Layer 3 marking, survives routing
 class WEBEX-IN
  set dscp af41
 class BULK-IN
  set dscp af11
  set qos-group 10                           ! internal label, never leaves this box
 class class-default
  set dscp default                           ! untrusted: wipe whatever the PC sent
!
interface GigabitEthernet1/0/10
 description user port
 service-policy input MARK-ACCESS-IN
```

| `set` action | What it changes | Lifetime |
|--------------|-----------------|----------|
| `set dscp X` | The 6-bit DSCP in the IP header | End to end, until someone re-marks it |
| `set cos X` | The 3-bit PCP in the 802.1Q tag | Only while the frame stays tagged. Gone at the first router or access port |
| `set qos-group N` | An **internal** label inside this device | Never leaves the box. Lets an output policy match on a decision made at input (`match qos-group 10`) without changing the packet |
| `set precedence X` | The top 3 bits of the ToS byte (legacy) | End to end |

**Reading it:** a Webex packet the PC marked EF is re-marked to AF41, because the policy classifies by **application** and ignores what the PC claimed. An unknown packet marked EF is reset to 0 by `class-default`. *An ingress marking policy is how an untrusted port is "re-colored" to match your design.*

---

## 11.4 Policing vs Shaping at CCNP Depth

The CCNA guide gave the core difference: **policing drops (or remarks) the excess; shaping buffers it.** CCNP adds the mechanics.

### The Token Bucket

Both tools use a **token bucket**. Tokens drip in at the **CIR** (committed information rate), sending traffic spends tokens, and the bucket's size is the **Bc** (committed burst). With tokens available, traffic **conforms**. Without them, it **exceeds**.

**Units trap:** IOS counts the buckets differently for the two tools. On **`shape`**, Bc and Be are in **bits**. On **`police`**, `bc` and `be` are in **bytes**. The CIR is in bits per second for both. So `shape average 50000000 200000` means a 200,000-*bit* burst, while `police cir 10000000 bc 312500` means a 312,500-*byte* (2.5 Mbit) burst. Read the command before you do the arithmetic.

| Term | Means |
|------|-------|
| **CIR** | The average rate being enforced (bps) |
| **Bc** | Committed burst: the amount allowed in one interval (**bits** on `shape`, **bytes** on `police`) |
| **Be** | Excess burst: extra allowed if previous intervals were under-used (same units as Bc) |
| **Tc** | Time interval = **Bc (bits) ÷ CIR (bps)**. A shaper releases Bc bits every Tc |

### Policer Flavors

| Policer | Rates / buckets | Results |
|---------|-----------------|---------|
| Single-rate, two-color | CIR, Bc | conform / exceed |
| Single-rate, three-color (RFC 2697) | CIR, Bc, Be | conform / exceed / **violate** |
| Two-rate, three-color (RFC 2698) | CIR **and PIR** | conform / exceed / violate |

```
policy-map POLICE-GUEST
 class class-default
  police cir 10000000 bc 312500 be 312500   ! 10 Mbps; bc/be in BYTES (250 ms)
   conform-action transmit
   exceed-action set-dscp-transmit af13      ! remark, don't drop: drop first later
   violate-action drop
```

### Choosing Between Them

| Situation | Tool | Why |
|-----------|------|-----|
| ISP enforcing your contract **inbound** at their edge | Policing | They don't want to buffer your excess |
| Your router sending into a 50 Mbps circuit delivered on a 1 Gbps port | **Shaping** (outbound) | Smooth to the contract rate yourself, or the ISP's policer drops it (and drops it blindly) |
| Limiting a guest VLAN or a scavenger class | Policing | Cheap, no buffering, no added delay |
| Voice/video | Neither on the voice itself, beyond the LLQ's built-in policer | Shaping adds delay. Voice is protected by the priority queue instead |

**Why does shaping only work outbound?** Because buffering means *holding packets you haven't sent yet*, and you can only hold what's waiting to leave. Traffic arriving inbound has already crossed the wire. You can drop or remark it, but you can't make it arrive later.

---

## 11.5 Queuing — Who Leaves First

Queuing only matters during **congestion**, when the interface's hardware transmit ring is full and packets wait in software queues. With no congestion, every QoS queuing policy is idle.

| Mechanism | How it works | Problem it solves / leaves |
|-----------|--------------|----------------------------|
| **FIFO** | One queue | No differentiation |
| **WFQ** | Automatic per-flow fairness | Fair, but can't prioritize voice |
| **CBWFQ** | You define classes; each gets a **guaranteed minimum bandwidth** (`bandwidth`) | Guarantees bandwidth, but voice can still wait behind a full-size packet in another queue: **jitter** |
| **LLQ** | CBWFQ **plus one strict-priority queue** (`priority`) served before all others | Voice gets near-zero queueing delay |

**Why does the LLQ have a built-in policer?** A strict-priority queue is always served first. If it could take unlimited bandwidth, a misbehaving "voice" class could starve every other class completely. So `priority 10000` (or `priority percent 10`) is both a promise and a **cap**: up to that rate during congestion, and any excess in the priority class is **dropped**. *The fast lane is fast because it's small.* Cisco's guidance is to keep the total priority (real-time) traffic at or below about **33%** of the link.

**`bandwidth` vs `bandwidth remaining`:** `bandwidth percent 30` guarantees 30% of the **interface (or shaped) rate**. `bandwidth remaining percent 30` divides what's **left after the priority queue** is served. A single policy can't mix the two styles across its classes.

### Queuing on Catalyst 9000 Switches

Routers queue in software; Catalyst switches queue in **hardware** (the UADP ASIC), so the model is fixed. A Catalyst 9000 port supports up to **2P6Q3T**: **8 egress queues**, of which up to **2 are strict priority**, each with **3 drop thresholds** (WTD, weighted tail drop). An egress policy maps classes onto those queues:

```
policy-map C9K-EGRESS
 class VOICE
  priority level 1                           ! first strict-priority queue
  police rate percent 10                     ! cap it, as with router LLQ
 class VIDEO
  priority level 2                           ! second priority queue, served after level 1
  police rate percent 20
 class SIGNALING
  bandwidth remaining ratio 5                ! share of what the PQs leave
 class CRITICAL-DATA
  bandwidth remaining ratio 25
  queue-buffers ratio 20                     ! give this queue a bigger buffer slice
 class class-default
  bandwidth remaining ratio 25
!
interface GigabitEthernet1/0/49
 service-policy output C9K-EGRESS
```

| Command | Meaning |
|---------|---------|
| `priority level 1` / `level 2` | Two strict-priority queues; level 1 is always served before level 2. Voice in 1, video in 2 |
| `police rate percent N` | Caps a priority queue so it can't starve the others (Catalyst doesn't add an implicit LLQ policer the way routers do, so configure it) |
| `bandwidth remaining ratio N` | Weights for sharing the bandwidth left after the priority queues. Ratios are relative to each other, not percentages of the link |
| `queue-buffers ratio N` | Share of the port's buffer memory given to this queue. Deeper buffers absorb bursts (good for data), at the cost of delay |

**Why two priority queues?** Because voice and interactive video are both real-time, but video is bursty and far bigger. In one shared priority queue, a video burst would sit in front of voice packets. Level 1 for voice and level 2 for video keeps voice ahead of everything, including video.

### AutoQoS — Reading What It Generates

**AutoQoS** is a macro: one interface command expands into Cisco's recommended trust, classification, marking and queuing config. Exam questions show the command (or the config it produced) and ask what it does:

| Command (interface) | Use it on | What it does |
|---------------------|-----------|--------------|
| `auto qos voip cisco-phone` | Access port with a Cisco IP phone | **Conditional trust**: trusts markings only while CDP detects a Cisco phone (it adds `trust device cisco-phone`), plus ingress and egress policies for voice |
| `auto qos trust dscp` | Uplinks between your own switches | Trusts incoming DSCP; adds the egress queuing policy |
| `auto qos voip cisco-softphone` | PCs running softphones | Classifies and polices voice/signalling from an untrusted PC |
| `auto qos classify [police]` | Untrusted user ports | Classifies by ACL/NBAR and marks; optionally polices |

`trust device cisco-phone` is the key line to recognize. If the phone is unplugged and a PC is connected directly, CDP no longer sees a phone, so the switch stops trusting and the PC's self-marked EF is ignored. The generated class-maps and policy-maps have names beginning `AutoQos-4.0-` (for example an input policy for Cisco phones and a shared output queuing policy). `show auto qos interface Gi1/0/10` lists what was applied, and `show running-config` shows the full expansion. *AutoQoS doesn't do anything you couldn't type yourself: it's the Cisco-validated design typed for you, and you still need to read it.*

---

## 11.6 Congestion Avoidance — Dropping Smartly

When a queue fills, new packets are **tail-dropped**. Tail drop hits every TCP flow in the queue at once, all of them back off together, the link goes idle, then all of them ramp up together again. That's **TCP global synchronization**, a sawtooth that wastes capacity. The CCNA guide covered this.

**WRED (Weighted Random Early Detection)** starts dropping *some* packets **before** the queue is full, randomly, so individual TCP flows slow down at different times:

| WRED parameter | Meaning |
|----------------|---------|
| **Minimum threshold** | Queue depth where random drops start |
| **Maximum threshold** | Depth where drop probability reaches its maximum; beyond it, everything is dropped (tail drop) |
| **Mark probability denominator** | Drop probability at the max threshold: 10 → 1 in 10 |

"Weighted" means each **DSCP** gets its own thresholds. With `random-detect dscp-based`, AF13 starts being dropped at a *shallower* queue depth than AF11. That's drop precedence (11.2) put into action.

**ECN** lets WRED **mark** packets (set the ECN bits to "congestion experienced") instead of dropping them, *if* both endpoints support ECN. The receiver echoes the signal and the sender slows down. The result is the same signal with no lost packet (`random-detect ecn`).

**Why not use WRED on the voice class?** Voice is UDP and has no congestion response, so dropping voice packets early just degrades the call for no benefit. WRED belongs on **TCP-heavy** classes.

---

## 11.7 Interpreting a Real Policy — Line by Line

This is the skill ENCOR tests. Here's a typical **WAN edge**: a 1 Gbps interface handing off to a **50 Mbps** circuit.

![Hierarchical policy: parent shaper at 50 Mbps containing the child queuing policy](images/c11_hqos.png)

```
class-map match-any VOICE
 match dscp ef
class-map match-any VIDEO
 match dscp af41 af42 af43
class-map match-any SIGNALING
 match dscp cs3
class-map match-any CRITICAL-DATA
 match dscp af21 af22 af23
class-map match-all SCAVENGER
 match dscp cs1
!
policy-map WAN-QUEUING                     ! child: the queuing decisions
 class VOICE
  priority percent 10                      ! LLQ: strict priority, capped at 5 Mbps
 class VIDEO
  bandwidth percent 30                     ! guaranteed 15 Mbps during congestion
 class SIGNALING
  bandwidth percent 5
 class CRITICAL-DATA
  bandwidth percent 25
  random-detect dscp-based                 ! WRED: AF23 dropped before AF21
 class SCAVENGER
  bandwidth percent 1                      ! "less than best effort"
 class class-default
  bandwidth percent 25
  fair-queue                               ! flow fairness inside the default class
  random-detect dscp-based
!
policy-map WAN-SHAPER                      ! parent: create congestion at 50 Mbps
 class class-default
  shape average 50000000
  service-policy WAN-QUEUING               ! nest the child inside the shaper
!
interface GigabitEthernet0/0/1
 description 50M MPLS handoff on a 1G port
 service-policy output WAN-SHAPER
```

**Reading it like an exam question:**

1. **Where and which way?** Outbound on Gi0/0/1, the only direction where queuing and shaping can work.
2. **Why the parent shaper?** This is the crucial insight. The interface is 1 Gbps, so it never congests at 50 Mbps of traffic, and the queuing policy *alone* would **never activate**. The ISP's policer at 50 Mbps would then drop the excess blindly, voice included. The parent **shapes to 50 Mbps**, which creates congestion *locally*, where your child policy decides who waits. This parent/child arrangement is **Hierarchical QoS (HQoS)**. *You can only prioritize traffic in a queue you control, so you make the queue happen on your own router.*
3. **What does each percentage mean?** They're percentages of the **parent's shaped rate** (50 Mbps), not of 1 Gbps. Voice gets strict priority up to 5 Mbps, video 15 Mbps guaranteed, and so on.
4. **What happens to a packet marked AF22?** `match-any` on CRITICAL-DATA matches it, so it goes into a queue guaranteed 12.5 Mbps, with WRED dropping it ahead of AF21 if the queue builds.
5. **And a packet marked AF31?** No class matches it, so it lands in **class-default**.
6. **What happens to a voice burst at 7 Mbps during congestion?** 5 Mbps goes via the priority queue. The other 2 Mbps is **dropped** by the LLQ's implicit policer, not queued.
7. **When there's no congestion?** Every class may use any spare bandwidth. Guarantees are minimums, enforced only when traffic is contending.

### Reading `show policy-map interface`

```
R1# show policy-map interface GigabitEthernet0/0/1 output
 GigabitEthernet0/0/1
  Service-policy output: WAN-SHAPER
    Class-map: class-default (match-any)
      18723401 packets, 9811625540 bytes
      30 second offered rate 48211000 bps, drop rate 212000 bps
      Match: any
      Queueing
      queue limit 208 packets
      (queue depth/total drops/no-buffer drops) 64/30211/0
      shape (average) cir 50000000, bc 200000, be 200000
      target shape rate 50000000

      Service-policy : WAN-QUEUING
        Class-map: VOICE (match-any)
          4011201 packets, 802240200 bytes
          30 second offered rate 3980000 bps, drop rate 0000 bps
          Match: dscp ef (46)
          Priority: 10% (5000 kbps), burst bytes 125000, b/w exceed drops: 0

        Class-map: CRITICAL-DATA (match-any)
          2210334 packets, 1489102776 bytes
          30 second offered rate 14870000 bps, drop rate 96000 bps
          Match: dscp af21 (18) af22 (20) af23 (22)
          Queueing
          (queue depth/total drops/no-buffer drops) 22/8120/0
          bandwidth 25% (12500 kbps)
            Exp-weight-constant: 9 (1/512)
            class  Transmitted  Random drop  Tail drop  Minimum  Maximum  Mark
                                                        thresh   thresh   prob
            af21   1.9M         120          0          32       40       1/10
            af23   0.2M         7990         10         24       40       1/10
```

| Line | What it tells you |
|------|-------------------|
| Parent `offered rate 48211000 bps` | About 48 Mbps offered against a 50 Mbps shaper. The circuit is nearly full |
| `queue depth 64`, `total drops 30211` | Congestion is real right now. The policy is earning its keep |
| `shape (average) cir 50000000`, `bc 200000` | Tc = 200,000 bits ÷ 50 Mbps = **4 ms** intervals |
| VOICE `Priority: 10% (5000 kbps)` | Percent resolved against the **shaped** rate: 5 Mbps, not 100 Mbps |
| VOICE `b/w exceed drops: 0` | The LLQ policer has never fired. Voice fits its cap |
| CRITICAL-DATA `offered 14.87 Mbps` vs `bandwidth 25% (12500 kbps)` | Offered above its guarantee, so drops in this class are expected when the link is full |
| WRED table: `af23` minimum threshold 24 vs `af21` 32 | AF23 starts random drops at a shallower depth. Its drop count (7,990) dwarfs AF21's (120): **drop precedence working as designed** |

### Reading a Policer's Counters

The guest policer from 11.4, applied inbound, under load:

```
R1# show policy-map interface GigabitEthernet0/0/2 input
 GigabitEthernet0/0/2
  Service-policy input: POLICE-GUEST
    Class-map: class-default (match-any)
      812334 packets, 498221010 bytes
      30 second offered rate 13200000 bps, drop rate 1100000 bps
      Match: any
      police:
          cir 10000000 bps, bc 312500 bytes, be 312500 bytes
        conformed 702113 packets, 421268000 bytes; actions:
          transmit
        exceeded 98112 packets, 66710000 bytes; actions:
          set-dscp-transmit af13
        violated 12109 packets, 10243010 bytes; actions:
          drop
        conformed 9980000 bps, exceeded 2100000 bps, violated 1100000 bps
```

| Line | What it tells you |
|------|-------------------|
| `offered rate 13200000 bps` | Guests are trying to send 13.2 Mbps into a 10 Mbps policy |
| `cir 10000000 bps, bc 312500 bytes` | The contract: 10 Mbps, with bursts measured in **bytes** (it's a policer) |
| `conformed … 9980000 bps` | Just under 10 Mbps passes untouched: the CIR is being used fully |
| `exceeded … set-dscp-transmit af13` | 2.1 Mbps of burst above CIR is **sent but re-marked** AF13, so it will be dropped first if a queue downstream fills |
| `violated … drop` | 1.1 Mbps (matching the class `drop rate`) is discarded outright |

*Conformed + exceeded + violated = offered. If the drop rate equals the violated rate, the policer is the only thing dropping in this class.*

**Exam-style reasoning:** "Users complain voice is choppy. Which counter do you check?" Check VOICE `b/w exceed drops`. If it's climbing, the priority queue is too small, or something non-voice is marked EF. "Video is fine but bulk transfers are slow during business hours." Bulk drops in class-default are expected behavior under contention, not a fault.

### QoS Troubleshooting

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| All counters stay at 0 | Policy applied in the wrong direction or on the wrong interface | `show policy-map interface` / `show running-config interface` |
| Everything lands in class-default | Markings not arriving (untrusted port reset them) or `match-all` misuse | Class-map `Match:` counters, `show class-map` |
| Queuing configured but never activates on a fast port | No parent shaper; the interface never congests | Offered rate far below interface speed, queue depth 0 |
| Voice choppy despite LLQ | Priority policer drops; or jitter introduced elsewhere (no QoS on another hop) | `b/w exceed drops`, then check each hop's policy |
| Policy rejected when applied | Mixing `bandwidth` and `bandwidth remaining`, or total over 100% | The CLI error on `service-policy` |

---

## 11.8 Chapter Summary

| Concept | Remember |
|---------|----------|
| DiffServ | Mark at the edge, PHB per hop, no per-flow state |
| DSCP | 6 bits; EF = 46; AFxy = 8x + 2y; CSn = 8n |
| AF drop precedence | Same queue, **higher y dropped first** |
| CoS | 3 bits in the 802.1Q tag; lost at the first router |
| MQC | class-map (which) → policy-map (what) → service-policy (where) |
| `match-all` | Default; AND logic |
| LLQ | Strict priority **with an implicit policer** |
| Shaping | Outbound only, buffers, adds delay; Tc = Bc ÷ CIR |
| HQoS | Parent shaper creates the congestion the child queues manage |
| WRED | Early random drops per DSCP; prevents global sync; not for voice |

---

<a name="chapter-12"></a>
# Chapter 12: Device & Data-Path Virtualization: Hypervisors, VRF, GRE & IPsec

> **Blueprint:** ENCOR 2.1 — Describe device virtualization technologies (2.1.a hypervisor type 1 and 2, 2.1.b virtual machine, 2.1.c virtual switching); ENCOR 2.2 — Configure and verify data path virtualization technologies (2.2.a VRF, 2.2.b GRE and IPsec tunneling)

Virtualization is one idea used over and over: **make one physical thing behave like several independent ones**, or **make several separate things behave like one**. A server becomes many servers. One router becomes several routing tables. A path across someone else's network becomes a private wire. This chapter covers the three forms ENCOR asks you to *configure* (VRF, GRE, IPsec) and the device-level form it asks you to *describe* (hypervisors, VMs, virtual switches).

You met the idea in the CCNA guide (1.9). Here we go from "what is it" to "how does it work, and how do I build and prove it".

---

## 12.1 Device Virtualization — Why Bother?

A physical server in 2005 typically ran **one** application at 5–15% CPU. The rest of the box (power, cooling, rack space, licences) was wasted. Virtualization lets one physical host run many isolated **virtual machines (VMs)**, each believing it owns real hardware.

**Why does this matter to a network engineer and not just a server admin?** Because the moment servers became VMs, **the access layer moved inside the server**. Traffic between two VMs on the same host may never touch a physical switch, so your VLANs, ACLs and monitoring have to reach into that host too. *Virtualization didn't remove the network; it hid part of it inside a box.*

## 12.2 Hypervisors — Type 1 vs Type 2

The **hypervisor** (or *virtual machine monitor*) is the software layer that creates VMs and shares physical CPU, memory, storage and NICs between them.

| Feature | Type 1 — bare metal | Type 2 — hosted |
|---------|-------------------------|---------------------|
| Runs on | Directly on the hardware | On top of a normal OS (Windows, macOS, Linux) |
| Examples | VMware ESXi, Microsoft Hyper-V, KVM, Xen | VMware Workstation/Fusion, Oracle VirtualBox, Parallels |
| Performance | Near-native — no host OS in the way | Lower — every call passes through the host OS |
| Typical use | Data centers, production, NFV | Labs, desktops, testing |
| Failure domain | Hypervisor only | Host OS *and* hypervisor |

**Why is type 1 faster?** Because a type 2 hypervisor is just another application. When a VM asks for disk or network I/O, the request goes VM → hypervisor → **host OS** → hardware, and the host OS schedules it among everything else it's doing. A type 1 hypervisor *is* the operating system: VM → hypervisor → hardware. One fewer layer to wait on, and nothing else competing for the CPU.

> **Exam trap:** KVM is the one that confuses people. It's a Linux kernel module, so it "runs on Linux". It's still classed as **type 1**, because the kernel itself becomes the hypervisor; there's no separate host OS underneath it. Your EVE-NG server is built on exactly this (QEMU/KVM).

## 12.3 What a Virtual Machine Actually Is

A VM is a set of files (a config file plus virtual disks) and a share of the host's resources. The hypervisor presents **virtual hardware** to it:

| Virtual component | What the VM sees | What's really happening |
|-------------------|------------------|-------------------------|
| **vCPU** | A processor core | A time-slice of a physical core, scheduled by the hypervisor |
| **vRAM** | Memory | A portion of physical RAM (can be overcommitted) |
| **Virtual disk** | A hard drive | A file (`.vmdk`, `.vhdx`, `.qcow2`) on host storage |
| **vNIC** | An Ethernet card with a MAC | A software port on a **virtual switch** |

Each VM runs its **own guest OS** with its own kernel. That's the key difference from a **container**, which shares the host's kernel and packages only the application and its libraries (CCNA guide 1.9). VMs give stronger isolation; containers are lighter and start in seconds.

**Why can a VM be moved to another host while it's running (vMotion / live migration)?** Because the VM is *just state*: memory pages, CPU registers and a disk file on shared storage. The hypervisor copies memory to the new host, pauses the VM for a few milliseconds to copy the last changes, and resumes it there. The VM keeps its MAC and IP, which is exactly why the **same VLAN must exist on both hosts**. *Live migration is one of the main reasons data centers wanted Layer 2 stretched everywhere — and one of the main reasons VXLAN exists (Chapter 13).*

## 12.4 Virtual Switching

Every vNIC plugs into a **virtual switch (vSwitch)**: a software Layer 2 switch inside the hypervisor. It learns MACs, supports VLANs (port groups) and connects to the outside world through the host's physical NICs (**uplinks**), which are normally configured as **802.1Q trunks** on the physical switch.

| Type | Scope | Example |
|------|-------|---------|
| **Standard vSwitch** | One host — configured host by host | VMware vSphere Standard Switch, Linux bridge |
| **Distributed vSwitch** | Many hosts, managed as one switch from a central console | VMware vSphere Distributed Switch (VDS) |
| **Open vSwitch (OVS)** | Programmable, multi-host, open source | KVM/OpenStack environments |

**Why does a distributed switch matter?** Consistency. With standard vSwitches, an admin must create "VLAN 20 – Finance" identically on 40 hosts; miss one and a VM that migrates there loses its network. A distributed switch defines the port group **once** and every host gets it, and a VM's port settings and statistics follow it when it moves.

### Getting Packets Out Faster

Software switching costs CPU. Two techniques reduce that:

- **SR-IOV (Single Root I/O Virtualization)**: a PCIe feature that lets one physical NIC present many lightweight **virtual functions (VFs)**. A VM is given a VF directly and **bypasses the vSwitch**, getting near line-rate performance. The trade-off: the hypervisor can no longer see or police that traffic, and live migration becomes harder.
- **DPDK**: a set of user-space libraries that let a virtual switch or virtual router poll the NIC directly instead of waiting for kernel interrupts.

### Cisco's Place in This: NFV

**Network Functions Virtualization (NFV)** runs network functions (routers, firewalls, WAN optimizers) as VMs instead of dedicated appliances. Cisco examples: **Catalyst 8000V** (virtual IOS XE router, successor to CSR 1000v), **Secure Firewall Threat Defense Virtual** (virtual NGFW), and the **Catalyst 9800-CL** (cloud/virtual wireless controller, which replaced the AireOS vWLC). Catalyst 9000 switches can also host containers and small apps directly (*application hosting*) for tools such as packet capture or monitoring agents.

*The network engineer's takeaway:* VMs connect to vSwitches, vSwitches connect to your physical switch via trunks, and NFV means some of your routers are now VMs too.

---

## 12.5 VRF — Many Routing Tables in One Router

Device virtualization splits a *server*. **VRF (Virtual Routing and Forwarding)** splits a *router*. Each VRF is a separate routing table and forwarding table (CEF FIB) inside the same box. An interface belongs to exactly one VRF, and by default **packets in one VRF can never reach another**.

**Story Time 📖:** a VRF is like a block of flats sharing one building. Every flat can have a "Room 1"; the same address in different flats is no conflict. And there's no internal door between flats: to get from one to another you must go out through a deliberate exit.

**Why use VRFs?**

- **Overlapping addresses.** Two customers (or two merged companies) both use `10.0.0.0/8`. In separate VRFs, that's fine.
- **Segmentation.** Guest Wi-Fi, IoT, PCI payment systems and corporate users share hardware but cannot reach each other unless you route between VRFs on purpose (often through a firewall).
- **Management isolation.** Many devices put the management port in its own VRF (e.g. `Mgmt-vrf` on Catalyst 9000) so management traffic never mixes with user traffic.

**VRF-Lite vs MPLS VPN.** Using VRFs on their own, hop by hop, with each link carrying one VRF (usually one 802.1Q subinterface per VRF), is called **VRF-Lite**. When VRFs are carried across an MPLS core using MP-BGP, it's an **MPLS L3VPN** (Chapter 29). Chapter 25 covers VRF-Lite troubleshooting and route leaking for ENARSI. ENCOR wants you to configure and verify the basics.

## 12.6 Configuring a VRF on IOS XE (Try It!)

Modern IOS XE uses the **multiprotocol** syntax `vrf definition` (the older `ip vrf` is IPv4-only):

```
R1(config)# vrf definition CUST-A
R1(config-vrf)#  rd 65000:1                 ! route distinguisher - optional for VRF-Lite,
                                            ! required once BGP/MPLS carries the VRF
R1(config-vrf)#  address-family ipv4        ! enable IPv4 in this VRF
R1(config-vrf-af)#  exit-address-family
R1(config-vrf)#  address-family ipv6        ! and IPv6, if you need it
R1(config-vrf-af)#  exit-address-family
R1(config)# vrf definition CUST-B
R1(config-vrf)#  address-family ipv4
R1(config-vrf-af)#  exit-address-family
```

Now put interfaces into the VRFs. **Order matters:**

```
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# vrf forwarding CUST-A
% Interface GigabitEthernet0/1 IPv4 disabled and address(es) removed due to enabling VRF CUST-A
R1(config-if)# ip address 10.1.1.1 255.255.255.0   ! re-enter it - it was wiped
```

**Why does `vrf forwarding` delete the IP address?** Because an IP address is installed as a *connected route in a specific routing table*. Moving the interface to a different table means the old connected route is now in the wrong place, so IOS removes the address rather than leave it half-attached. *Always apply `vrf forwarding` first, then the IP address.* Forgetting this is the number one VRF lab mistake: the interface looks configured but has no address.

The same address can now be reused in the other VRF:

```
R1(config)# interface GigabitEthernet0/2
R1(config-if)# vrf forwarding CUST-B
R1(config-if)# ip address 10.1.1.1 255.255.255.0   ! identical IP - legal, different table
```

Routing is per-VRF too:

```
R1(config)# ip route vrf CUST-A 0.0.0.0 0.0.0.0 10.1.1.254   ! static route inside CUST-A
R1(config)# router ospf 10 vrf CUST-A                       ! an OSPF process for CUST-A only
R1(config-router)#  network 10.1.1.0 0.0.0.255 area 0
```

### VRF-Lite Across a Link: One Subinterface per VRF

A VRF only exists inside one router. To carry two VRFs to a neighbour without MPLS, give each VRF its **own logical link**, normally an 802.1Q subinterface on a shared trunk. This is VRF-Lite:

```
! ---- R1: one physical link to R2, two VRFs riding it
interface GigabitEthernet0/3
 no ip address
interface GigabitEthernet0/3.100
 encapsulation dot1Q 100
 vrf forwarding CUST-A                         ! vrf first, then the address
 ip address 172.16.100.1 255.255.255.252
interface GigabitEthernet0/3.200
 encapsulation dot1Q 200
 vrf forwarding CUST-B
 ip address 172.16.100.1 255.255.255.252       ! same IP again: different table
!
router ospf 10 vrf CUST-A
 network 172.16.100.0 0.0.0.3 area 0
router ospf 20 vrf CUST-B
 network 172.16.100.0 0.0.0.3 area 0
```

R2 mirrors it with `.2` on each subinterface. Each VRF now has its own adjacency over its own VLAN, and nothing in CUST-A can ever be routed into CUST-B, because they never share a table or a link. **The scaling cost is obvious:** every VRF needs a subinterface, an address and a routing process on *every* hop. That's the problem MPLS L3VPN solves (Chapter 29), and Chapter 25 covers VRF-Lite troubleshooting.

### Verifying — Everything Needs the VRF Name

```
R1# show vrf
  Name                Default RD       Protocols   Interfaces
  CUST-A              65000:1          ipv4,ipv6   Gi0/1
  CUST-B              <not set>        ipv4        Gi0/2

R1# show ip route vrf CUST-A
R1# show ip vrf interfaces CUST-A          ! which interfaces + IPs are in the VRF
R1# ping vrf CUST-A 10.1.1.254
R1# traceroute vrf CUST-A 10.1.1.254
R1# show ip arp vrf CUST-A
```

**The trap that catches everyone:** `ping 10.1.1.254` with no VRF keyword uses the **global** table. If the address only exists in CUST-A, the ping fails and it looks like the network is broken. *Every VRF verification command needs `vrf NAME`.*

---

## 12.7 GRE — A Virtual Wire Across Any IP Network

**Generic Routing Encapsulation (GRE, IP protocol 47)** wraps one packet inside another IP packet. The outer packet travels between two public addresses (the **tunnel source** and **destination**); the inner packet can be anything: IPv4, IPv6, even multicast and routing protocol hellos.

![Tunnel encapsulations compared](images/c12_tunnel_headers.png)

**Why tunnel at all?** Because the network in the middle (the internet, a provider) only knows how to route between the *public* addresses. It has never heard of your `10.x` networks and won't carry OSPF multicast. GRE makes two distant routers look **directly connected** over a point-to-point link, so you can run a routing protocol over it just as you would over a cable.

### The Cost: 24 Bytes

GRE adds a **new IP header (20 bytes) + a GRE header (4 bytes minimum)** = **24 bytes**. The tunnel interface's default IP MTU is therefore **1476** (1500 − 24).

### Configuring a GRE Tunnel

```
! R1 - public address 198.51.100.1 on Gi0/0
R1(config)# interface Tunnel0
R1(config-if)#  ip address 172.16.0.1 255.255.255.252    ! the "inside" of the tunnel
R1(config-if)#  tunnel source GigabitEthernet0/0         ! or the public IP
R1(config-if)#  tunnel destination 203.0.113.2           ! R2's public IP
R1(config-if)#  ! tunnel mode gre ip is the default - no need to type it
R1(config-if)#  ip mtu 1400                              ! leave room for IPsec later
R1(config-if)#  ip tcp adjust-mss 1360                   ! = 1400 - 40 (IP + TCP headers)
R1(config-if)#  keepalive 10 3                           ! detect a dead far end
R1(config)# router ospf 1
R1(config-router)#  network 172.16.0.0 0.0.0.3 area 0    ! routing runs OVER the tunnel
R1(config-router)#  network 10.1.0.0 0.0.255.255 area 0  ! advertise the LAN
```

R2 mirrors it (source and destination swapped, `172.16.0.2`).

**Why `ip tcp adjust-mss`?** Hosts assume a 1500-byte MTU and send TCP segments of 1460 bytes. After GRE (and IPsec) is added, those packets are too big; the router must fragment them or, if DF is set and the ICMP "fragmentation needed" message is blocked somewhere, **silently drop them**. The classic symptom: *ping works, small web pages load, big downloads and HTTPS hang.* `adjust-mss` rewrites the MSS value in TCP SYNs passing through the tunnel, so both hosts agree to use smaller segments from the start (CCNA guide 2.7 explains MSS). *Fix the MTU problem at the handshake instead of fragmenting every packet.*

### Tunnel Line Protocol and Keepalives

A GRE tunnel interface is **up/up as soon as there is a route to the tunnel destination**, even if the far router is switched off. GRE itself has no handshake.

**Why add keepalives then?** Because without them the tunnel stays up/up while forwarding into a black hole. With `keepalive 10 3`, the router sends a keepalive every 10 seconds and brings line protocol **down** after 3 missed replies, so static routes pointing into the tunnel are withdrawn and a backup path can take over. (A routing protocol running over the tunnel detects failure on its own, via its hellos.)

### The Recursive Routing Trap

```
%TUN-5-RECURSIVE: Tunnel0 temporarily disabled due to recursive routing
```

This happens when the router learns the route **to the tunnel destination through the tunnel itself**. Example: R2 advertises its public `203.0.113.0/24` into OSPF over the tunnel. R1 now has a "better" route to 203.0.113.2 via Tunnel0, so to send a tunnel packet it must first send it through the tunnel... which needs a tunnel packet... The router detects the loop and shuts the tunnel down. It comes back, relearns the route, and fails again, so the tunnel flaps.

**The fix:** never advertise the tunnel endpoints (the public/transport addresses) into the routing protocol that runs over the tunnel. Reach them through the underlay (a static or default route out the physical interface) and advertise only the inside networks. *Underlay addresses go in the underlay; overlay routes go in the overlay. Mixing them is how the tunnel ends up routing through itself.*

### Verifying GRE

```
R1# show interface Tunnel0
Tunnel0 is up, line protocol is up
  Internet address is 172.16.0.1/30
  BW 100 Kbit/sec, DLY 50000 usec,
  Tunnel source 198.51.100.1 (GigabitEthernet0/0), destination 203.0.113.2
  Tunnel protocol/transport GRE/IP
    Key disabled, sequencing disabled
  Keepalive set (10 sec), retries 3
  Tunnel transport MTU 1476 bytes
```

Read three things: **line protocol up**, the **source/destination** are what you intended, and **transport GRE/IP**. Note the default tunnel **bandwidth of 100 kbps**: OSPF and EIGRP compute metrics from it, so set `bandwidth` on the tunnel if path selection matters.

**GRE's big weakness:** it is **not encrypted**. Anyone on the path can read the inner packets. That's what IPsec is for.

---

## 12.8 IPsec — Making the Tunnel Private

**IPsec** is a framework of protocols that provides:

| Service | What it means | Provided by |
|---------|---------------|-------------|
| **Confidentiality** | Nobody can read it | Encryption — AES (CBC or GCM) |
| **Integrity** | Nobody changed it | HMAC — SHA-256/384/512 (or GCM's built-in check) |
| **Authentication** | It really came from the peer | Pre-shared keys or certificates (RSA/ECDSA) |
| **Anti-replay** | Old packets can't be re-sent | Sequence numbers |

### ESP vs AH

| Protocol | IP protocol # | Encrypts? | Authenticates outer IP header? | Works through NAT? |
|----------|---------------|-----------|-------------------------------|--------------------|
| **ESP** | **50** | **Yes** | No | **Yes** (with NAT-T) |
| **AH** | **51** | **No** | Yes | **No** |

**Why does nearly everyone use ESP?** Because AH doesn't encrypt, and by authenticating the outer IP header, AH breaks the moment NAT rewrites that header (the integrity check fails). ESP protects the payload and leaves the outer header alone, so NAT can change it. When NAT is detected, IKE switches to **NAT Traversal (NAT-T)**, wrapping ESP in **UDP 4500**.

### Tunnel Mode vs Transport Mode

- **Tunnel mode** encrypts the **entire original packet** and adds a **new IP header**. Used site-to-site, when the routers are protecting traffic *for others*. The default.
- **Transport mode** encrypts only the **payload**, keeping the original IP header. Used when the endpoints of the traffic are the IPsec peers themselves. The classic case being **GRE over IPsec**, where the GRE packet is already between the two routers. Transport mode saves 20 bytes.

### IKE — Agreeing on Keys

Before any data is encrypted, the peers use **IKE (Internet Key Exchange, UDP 500)** to authenticate each other and agree on algorithms and keys. The result is a set of **Security Associations (SAs)**: one-way agreements, so every tunnel has an inbound and an outbound IPsec SA.

| Version | Phase / exchange | What it builds | Messages |
|---------|------------------|----------------|----------|
| **IKEv1** | **Phase 1** — Main Mode (or Aggressive Mode) | An authenticated, encrypted management channel: the **ISAKMP SA** | 6 (Main) / 3 (Aggressive) |
| **IKEv1** | **Phase 2** — Quick Mode | The **IPsec SAs** that carry data | 3 |
| **IKEv2** | **IKE_SA_INIT** | Negotiates crypto, Diffie-Hellman exchange | 2 |
| **IKEv2** | **IKE_AUTH** | Authenticates peers + builds the first **Child SA** (IPsec SA) | 2 |

**Why did IKEv2 replace IKEv1?** Four messages instead of nine; built-in NAT-T, dead peer detection and EAP support; asymmetric authentication (each side can use a different method); and far fewer ambiguous options, so interoperability is better. *IKEv2 is the default choice for anything new, and FlexVPN on IOS XE is built on it.*

**Why Diffie-Hellman?** Because the two routers need a shared secret key, but every packet between them crosses an untrusted network. DH lets each side combine a private value with the other side's public value so that **both compute the same secret without ever sending it**. The DH **group** sets its strength: prefer groups **19, 20** (elliptic curve) or **14+**; groups 1, 2 and 5 are considered broken.

### Crypto Maps vs Virtual Tunnel Interfaces

| Feature | Crypto map (legacy, policy-based) | VTI / tunnel protection (route-based) |
|---------|---------------------------------------|------------------------------------------|
| What gets encrypted | Traffic matching a crypto ACL ("interesting traffic") | Anything **routed into** the tunnel interface |
| Applied to | The physical outside interface | A tunnel interface |
| Routing protocols over it | Not on its own (no multicast); only by putting GRE inside it (12.10) | **Yes** |
| QoS, ACLs, NetFlow per tunnel | Awkward | Natural — it's an interface |
| Add a new subnet | Edit ACLs on **both** sides | Just route it |

**Why is VTI the modern answer?** Because it turns VPN design back into *routing*. With a crypto map, the routing table says "send it out Gi0/0" and a hidden ACL decides whether it's encrypted, so two separate policies must agree. With a VTI, encryption is simply a property of an interface: if the route points into the tunnel, it's encrypted. *One decision instead of two, and you can run OSPF across it.*

## 12.9 Configuring a Static VTI with IKEv2 (Try It!)

Site A (R1, public `198.51.100.1`) to Site B (R2, public `203.0.113.2`). A **static VTI** uses `tunnel mode ipsec ipv4`: no GRE header, pure IPsec tunnel mode.

```
! ---- Phase "IKE_SA_INIT": what crypto to offer
crypto ikev2 proposal PROP-AES256
 encryption aes-cbc-256
 integrity sha256
 group 19
crypto ikev2 policy POL-1
 proposal PROP-AES256
!
! ---- Who the peer is and the shared secret
crypto ikev2 keyring KR-SITEB
 peer R2
  address 203.0.113.2
  pre-shared-key Str0ng-Secret!          ! same key configured on both ends
!
! ---- "IKE_AUTH": how we identify and authenticate the peer
crypto ikev2 profile IKEV2-PROF
 match identity remote address 203.0.113.2 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR-SITEB
!
! ---- The Child SA: how data is protected
crypto ipsec transform-set TS-AES256 esp-aes 256 esp-sha256-hmac
 mode tunnel
crypto ipsec profile IPSEC-PROF
 set transform-set TS-AES256
 set ikev2-profile IKEV2-PROF
!
! ---- The routable interface
interface Tunnel1
 ip address 172.16.1.1 255.255.255.252
 ip mtu 1400
 ip tcp adjust-mss 1360
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4                   ! static VTI - no GRE header
 tunnel destination 203.0.113.2
 tunnel protection ipsec profile IPSEC-PROF
!
ip route 10.2.0.0 255.255.0.0 Tunnel1     ! or run OSPF/EIGRP over Tunnel1
```

R2 is the mirror image: keyring peer address `198.51.100.1`, match identity `198.51.100.1`, its own tunnel IP `172.16.1.2`.

**Read the config as a chain of references**, because that's how to troubleshoot it. The tunnel points to the **IPsec profile**; the IPsec profile points to the **transform set** and the **IKEv2 profile**; the IKEv2 profile points to the **keyring**. A typo in any name breaks the chain, usually without an obvious error.

### IKEv2 Smart Defaults

IOS XE ships with **built-in IKEv2 and IPsec defaults** (FlexVPN *smart defaults*): a default IKEv2 proposal and policy, a default IPsec transform set, and an IPsec profile named `default`. The only things you must supply are the parts that can't have a default, namely **who the peer is and how to authenticate it**:

```
crypto ikev2 keyring KR-SITEB
 peer R2
  address 203.0.113.2
  pre-shared-key Str0ng-Secret!
crypto ikev2 profile IKEV2-PROF
 match identity remote address 203.0.113.2 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR-SITEB
!
crypto ipsec profile default                 ! the built-in profile...
 set ikev2-profile IKEV2-PROF                ! ...just needs to know the IKEv2 profile
!
interface Tunnel1
 tunnel protection ipsec profile default
```

`show crypto ikev2 proposal default` and `show crypto ipsec transform-set default` reveal what the defaults actually are on your release. **Why does this matter for the exam?** Because a config with no `crypto ikev2 proposal` or `transform-set` is *not* incomplete. It's using the defaults, and both sides will agree as long as both use them. Defining your own proposal (as in the full config above) overrides the default for that policy.

## 12.10 GRE over IPsec

Why put GRE inside IPsec when a VTI already supports routing? Because GRE can carry things a pure IPsec VTI can't: **non-IP protocols, multiple protocols over one tunnel**, and it's the basis for **mGRE in DMVPN** (Chapter 30). The config is the same, except the tunnel stays in its default GRE mode, and transport mode saves 20 bytes:

```
crypto ipsec transform-set TS-GRE esp-aes 256 esp-sha256-hmac
 mode transport                       ! GRE already supplies the outer header
crypto ipsec profile GRE-PROT
 set transform-set TS-GRE
 set ikev2-profile IKEV2-PROF
!
interface Tunnel0
 ip address 172.16.0.1 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel destination 203.0.113.2
 tunnel protection ipsec profile GRE-PROT   ! the only line that adds encryption
```

`tunnel protection` automatically protects exactly the GRE traffic between tunnel source and destination. No crypto ACL is needed.

### The Legacy Way: GRE over IPsec With IKEv1 and a Crypto Map

You'll still meet this form in production and in exam exhibits, so read it fluently. The same GRE tunnel is protected not by `tunnel protection`, but by a **crypto map** on the *physical* interface, whose ACL selects the GRE packets:

```
! ---- IKEv1 Phase 1: the ISAKMP policy and the PSK
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key Str0ng-Secret! address 203.0.113.2
!
! ---- Phase 2: how data is protected
crypto ipsec transform-set TS-LEGACY esp-aes 256 esp-sha256-hmac
 mode transport                               ! GRE supplies the outer header
!
! ---- "Interesting traffic": the GRE packets between the two public IPs
ip access-list extended GRE-TO-R2
 permit gre host 198.51.100.1 host 203.0.113.2
!
crypto map VPN-MAP 10 ipsec-isakmp
 set peer 203.0.113.2
 set transform-set TS-LEGACY
 match address GRE-TO-R2
!
interface GigabitEthernet0/0                  ! the PHYSICAL outside interface
 crypto map VPN-MAP
!
interface Tunnel0                             ! plain GRE, no tunnel protection
 ip address 172.16.0.1 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel destination 203.0.113.2
```

**Reading it:** sequence 10 of crypto map VPN-MAP says "anything matching ACL GRE-TO-R2, leaving Gi0/0, gets encrypted to peer 203.0.113.2 with TS-LEGACY". The peer's ACL must be the **mirror image** (`permit gre host 203.0.113.2 host 198.51.100.1`). Mismatched ACLs are the classic crypto-map failure: Phase 1 comes up but Phase 2 is rejected.

Verify Phase 1 with `show crypto isakmp sa`:

```
R1# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
203.0.113.2     198.51.100.1    QM_IDLE           1001 ACTIVE
```

| State | Meaning |
|-------|---------|
| **QM_IDLE** | **Healthy.** Phase 1 is complete and the ISAKMP SA is idle, ready to build or rekey Phase 2 SAs |
| MM_NO_STATE | Phase 1 stuck at the first exchange: no reply from the peer, or no matching ISAKMP policy |
| MM_KEY_EXCH | Keys exchanged but authentication failed: usually a pre-shared key mismatch |

*IKEv1 crypto maps and IKEv2 VTIs protect traffic equally well. The difference is that a crypto map ties encryption to an ACL, while a VTI ties it to routing (12.8).*

## 12.11 Verifying and Troubleshooting Tunnels

```
R1# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA
Tunnel-id Local                 Remote                fvrf/ivrf            Status
1         198.51.100.1/500      203.0.113.2/500       none/none            READY
      Encr: AES-CBC, keysize: 256, PRF: SHA256, Hash: SHA256, DH Grp:19, Auth sign: PSK

R1# show crypto ipsec sa interface Tunnel1
   local  ident (addr/mask/prot/port): (0.0.0.0/0.0.0.0/0/0)
   remote ident (addr/mask/prot/port): (0.0.0.0/0.0.0.0/0/0)
    #pkts encaps: 1520, #pkts encrypt: 1520, #pkts digest: 1520
    #pkts decaps: 1498, #pkts decrypt: 1498, #pkts verify: 1498
     inbound esp sas:
      spi: 0x8C4F21A3(2354004387)
        transform: esp-256-aes esp-sha256-hmac ,
        in use settings ={Tunnel, }

R1# show crypto session
Interface: Tunnel1
Session status: UP-ACTIVE
Peer: 203.0.113.2 port 500
```

**How to read it:**

- IKEv2 SA **READY** means the peers authenticated each other. Without READY, nothing else matters.
- **encaps rising, decaps stuck at 0** means you're sending but nothing comes back. Look at the *far* side: its routing back into the tunnel, or an ACL/firewall in the path dropping ESP (protocol 50) or UDP 4500.
- **Both counters at 0** means no traffic is being routed into the tunnel. Check the routing table, not the crypto.
- `in use settings ={Tunnel, }` versus `{Transport, }` confirms the mode.

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Tunnel up/up, but nothing gets through (plain GRE) | Far end down, no keepalives configured | `show interface Tunnel0` (no keepalive line); `ping` the tunnel IP |
| `%TUN-5-RECURSIVE`, tunnel flapping | Tunnel destination learned via the tunnel | `show ip route 203.0.113.2` points out Tunnel0 |
| IKEv2 SA never reaches READY | PSK mismatch, proposal mismatch, identity mismatch | `debug crypto ikev2` ("AUTH_FAILED", "NO_PROPOSAL_CHOSEN") |
| SA up, encaps grow, decaps stay 0 | Return routing on the peer, or ESP/UDP 4500 blocked | `show crypto ipsec sa` on **both** ends |
| Pings work, big transfers hang | MTU/MSS — oversized packets dropped | `ping 10.2.1.1 size 1500 df-bit` fails; `ip tcp adjust-mss` missing |
| Interface IP missing after config | `vrf forwarding` applied after `ip address` | `show run interface` — no address line |
| `ping` to a VRF host fails, routes look fine | Pinging from the global table | `ping vrf NAME …` succeeds |

*The underlying principle for every tunnel problem:* check the **underlay** first (can I reach the far public IP?), then the **tunnel** (up, SA ready?), then the **overlay** (routes pointing into it?). Fix them in that order. An overlay problem can't be solved while the underlay is broken.

## 12.12 Chapter Summary

| Topic | What to be able to say |
|-------|------------------------|
| Type 1 vs type 2 hypervisor | Type 1 runs on bare metal (ESXi, Hyper-V, KVM); type 2 runs on a host OS (Workstation, VirtualBox) |
| Virtual machine | Virtual hardware (vCPU, vRAM, vNIC, vDisk) as files plus state; can live-migrate if the VLAN exists on both hosts |
| Virtual switching | vSwitch/distributed switch inside the hypervisor; SR-IOV and DPDK to go faster |
| VRF | Separate routing table per VRF; `vrf forwarding` **before** `ip address`; every command needs the VRF name |
| VRF-Lite | One subinterface (or link) per VRF per hop; no MPLS |
| GRE | IP protocol 47, 24 bytes overhead, carries multicast/routing protocols, no encryption, up/up without keepalives |
| Recursive routing | Never let the tunnel destination be learned through the tunnel |
| IPsec | ESP (protocol 50) encrypts; tunnel vs transport mode; IKE on UDP 500/4500 |
| IKEv1 vs IKEv2 | Main/Aggressive + Quick Mode (9 or 6 messages) vs IKE_SA_INIT + IKE_AUTH (4) |
| Crypto map vs VTI | ACL-driven, on the physical interface vs route-driven, on a tunnel interface |
| Verification | `show crypto isakmp sa` (QM_IDLE), `show crypto ikev2 sa` (READY), `show crypto ipsec sa` (encaps/decaps) |

---

<a name="chapter-13"></a>
# Chapter 13: Network Virtualization: LISP & VXLAN

> **Blueprint:** ENCOR 2.3 — Describe network virtualization concepts (2.3.a LISP, 2.3.b VXLAN)

Chapter 12 virtualized *devices* and *paths*. This chapter virtualizes the **network itself**: a logical network (an *overlay*) built on top of a plain routed IP network (the *underlay*). Two protocols do the heavy lifting, and they're worth learning together because **SD-Access uses both** (Chapter 14): **LISP** answers *where is this endpoint?* and **VXLAN** carries the traffic once you know.

ENCOR asks you to *describe* them, so you won't configure these. You do need to know every role, message and number precisely.

---

## 13.1 The Problem Overlays Solve

Traditional IP addressing does two jobs with one number. `10.2.3.4` says **who** the device is (its identity) *and* **where** it is (its location, because the prefix ties it to one subnet in one place).

**Why is that a problem?** Because the two jobs conflict as soon as something **moves**:

- A VM live-migrates to a host in another building (12.3). Its identity must stay the same, so applications and sessions survive, but its location just changed.
- A laptop roams from floor 1 to floor 4, onto a different switch and different subnet.
- A branch with two ISPs (multihoming) wants one stable set of addresses while choosing between providers.

If the address *is* the location, moving means renumbering, which breaks sessions. The old workaround was **stretching Layer 2** (the same VLAN everywhere), which brings back huge broadcast domains and spanning tree across the campus or data center.

*The overlay idea: give each endpoint a stable identity, and keep a separate, changeable record of where it currently is.*

## 13.2 Underlay vs Overlay

| Term | What it is | Example |
|------|------------|---------|
| **Underlay** | The physical, routed IP network. Only needs to get packets between tunnel endpoints | OSPF or IS-IS between switches, all links routed |
| **Overlay** | The logical network built from tunnels on top of the underlay | VXLAN segments, LISP-routed endpoint prefixes |
| **Encapsulation** | How overlay packets ride the underlay | VXLAN (UDP 4789), LISP data plane (UDP 4341) |
| **Control plane** | How tunnel endpoints learn *who is behind which endpoint* | LISP mapping system, BGP EVPN, or flood-and-learn |

**Why is a simple routed underlay so attractive?** Because routed links have **no spanning tree**, use **every link at once with ECMP**, and converge in milliseconds. The overlay provides the flexibility endpoints need (mobility, segmentation, stretched subnets) *without* turning the physical network back into one giant Layer 2 domain.

---

## 13.3 LISP — Locator/ID Separation Protocol

**LISP** (RFC 9300/9301, originally RFC 6830) splits the address into two namespaces:

| Name | Stands for | Answers | Example |
|------|-----------|---------|---------|
| **EID** | Endpoint Identifier | **Who** — the address of the host or prefix | `10.2.3.4`, `10.2.0.0/16` |
| **RLOC** | Routing Locator | **Where** — the address of the LISP router that the EID currently sits behind | `198.51.100.2` |

The underlay only routes **RLOCs**. It never needs to know any EID. EID-to-RLOC mappings live in a **mapping system**, which works rather like DNS for locations.

**Story Time 📖:** an EID is your name and an RLOC is the address of the hotel you're staying at tonight. When you change hotels you update one directory entry ("Alex is now at the Riverside"). Your friends still look you up by name, and the postal service only ever needs to know how to reach hotels.

### The LISP Roles

| Role | Job |
|------|-----|
| **ITR** (Ingress Tunnel Router) | Receives packets from local hosts, looks up the destination EID's RLOC, **encapsulates** and sends it |
| **ETR** (Egress Tunnel Router) | Receives LISP-encapsulated packets, **decapsulates** and delivers them to local EIDs. Also **registers** its EIDs with the mapping system |
| **xTR** | A router doing both ITR and ETR — the normal case at a site edge |
| **MS** (Map Server) | Accepts **Map-Registers** from ETRs; holds the authoritative EID-to-RLOC database |
| **MR** (Map Resolver) | Accepts **Map-Requests** from ITRs and passes them into the mapping system |
| **MS/MR** | Both functions on one box — the usual deployment (and SD-Access's *control plane node*) |
| **PITR** (Proxy ITR) | Attracts traffic **from non-LISP sites** to LISP EIDs, and encapsulates it on their behalf |
| **PETR** (Proxy ETR) | Receives traffic **from LISP sites to non-LISP destinations** (e.g. the internet) and decapsulates it |
| **PxTR** | A router doing both proxy roles — the bridge between the LISP and non-LISP worlds |

### The Conversation, Step by Step

![LISP map-register, map-request and map-reply flow](images/c13_lisp_flow.png)

0. **Map-Register.** Each ETR tells the Map Server which EID prefixes are behind it ("10.2.0.0/16 is reachable at RLOC 198.51.100.2"). This repeats periodically (about every 60 seconds), authenticated with a shared key. If the ETR asks for it, the Map Server acknowledges each registration with a **Map-Notify**, so the ETR knows it was accepted.
1. **Map-Request.** A host at site A sends a packet to `10.2.3.4`. The ITR has no mapping in its cache, so it sends a Map-Request to the **Map Resolver**.
2. **Forwarding.** The MR/MS finds which ETR registered that prefix and **forwards the request to that ETR**. (Alternatively, the MS can be configured to answer on the ETR's behalf — *proxy reply*.)
3. **Map-Reply.** The ETR replies **directly to the ITR** with the mapping: EID prefix, RLOC(s), plus a **priority and weight** for each RLOC (used for multihoming and load sharing) and a TTL.
4. **Data.** The ITR caches the mapping in its **map-cache** and encapsulates packets to the RLOC. Every later packet to that prefix uses the cache with no further lookups until the TTL expires. The default map-cache TTL in a Map-Reply is **24 hours** (1,440 minutes); mobility events refresh entries long before that (see below).

If the mapping system answers with a **negative Map-Reply** (the destination isn't a LISP EID), the ITR forwards natively or sends traffic to a **PETR**.

**Why does the ETR, not the Map Server, send the reply?** Because the ETR is the **authority on its own site**. It knows which of its RLOCs are currently up and what priorities and weights to advertise. Answering itself guarantees the ITR gets the freshest possible locator information. *The mapping system is a directory that routes questions to the right person; it isn't the person.*

**Why is this "pull" model scalable?** An ITR only learns mappings for destinations it actually talks to, on demand. A branch xTR talking to five sites holds five cache entries, not a full table of every EID in the company. Compare BGP or OSPF, which **push** every route to every router whether it's needed or not.

### Instance IDs — VRFs Inside LISP

A LISP EID is really a pair: **(Instance ID, EID prefix)**. The **Instance ID (IID)** is a 24-bit number carried in the LISP header and in every register, request and reply, and each IID maps to one VRF on the xTR. Two customers (or two SD-Access virtual networks) can therefore both use 10.1.0.0/16 without colliding in the mapping system, because the Map Server stores them under different IIDs. *The IID does for LISP exactly what the VNI does for VXLAN and the route distinguisher does for MPLS VPNs: it keeps overlapping address spaces apart.* In SD-Access, every virtual network (VN) gets its own IID.

### LISP on the Wire

| Plane | Transport | Notes |
|-------|-----------|-------|
| Control (Map-Register/Request/Reply) | **UDP 4342** | |
| Data (encapsulated packets) | **UDP 4341** | Outer IP (20) + UDP (8) + LISP header (8) = **36 bytes** for IPv4 |

**Mobility, the payoff.** When an endpoint moves to a new xTR, that xTR registers the EID from its own RLOC. The Map Server updates the mapping and sends a **Map-Notify** to the old xTR, which tells any ITR still sending to the old location (a *Solicit-Map-Request*) to refresh its cache. The host keeps its IP address and the underlay never changes. *This is the mechanism SD-Access uses for wired and wireless roaming.*

---

## 13.4 VXLAN — Layer 2 Over Layer 3

**VXLAN (Virtual Extensible LAN, RFC 7348)** encapsulates a **complete Ethernet frame** inside a UDP packet so it can cross a routed network. The two endpoints of a VXLAN tunnel are **VTEPs**.

### Why VXLAN Exists

1. **The VLAN ID is only 12 bits** — 4,094 usable segments. A multi-tenant data center or cloud runs out fast.
2. **Workloads need Layer 2 adjacency across a routed fabric** — live migration (12.3), clusters, and legacy apps that assume a shared subnet — without stretching spanning tree across the data center.
3. **Routed underlays are better** — ECMP across all links, no blocked ports, fast convergence (13.2).

VXLAN gives you Layer 2 *service* over a Layer 3 *network*.

### The Header

![VXLAN encapsulation and header](images/c13_vxlan_header.png)

| Field | Size | Purpose |
|-------|------|---------|
| Outer Ethernet | 14 B | Hop-by-hop MACs across the underlay |
| Outer IP | 20 B | Source VTEP → destination VTEP |
| Outer UDP | 8 B | **Destination port 4789**; source port is a hash of the inner frame |
| VXLAN header | 8 B | Flags + **24-bit VNI** |
| Inner frame | — | The original Ethernet frame, untouched |

**Total overhead: 50 bytes** (54 if the outer frame carries an 802.1Q tag). Underlay links therefore need a larger MTU, typically **9000 or 9216 jumbo**, or at minimum 1550, otherwise full-size 1500-byte frames from hosts get dropped.

**Why is the VNI 24 bits?** Because 2²⁴ = **16,777,216** segments ends the scarcity problem for good. Each **VNI (VXLAN Network Identifier)** is one Layer 2 segment, just as each VLAN ID was. VTEPs map local VLANs to VNIs: VLAN 10 on leaf 1 and VLAN 210 on leaf 2 can both be VNI 10010, so VLAN numbers become merely *local*.

**Why put it in UDP rather than straight into IP?** For **load balancing**. Underlay routers spread traffic over ECMP paths by hashing the 5-tuple. If every VXLAN packet between two VTEPs had the same outer header, all their flows would hash onto one path. By setting the **UDP source port from a hash of the inner frame's headers**, each inner flow gets a different outer 5-tuple, so it spreads across the fabric, while packets of a single flow stay in order on one path. *UDP is the cheapest header that carries a field routers already hash on.*

### VTEPs

A **VTEP (VXLAN Tunnel Endpoint)** encapsulates and decapsulates. It has a local IP in the underlay (usually a loopback) and one or more VNIs. VTEPs can be hardware (a leaf switch such as a Nexus 9000 or Catalyst 9000) or software (a hypervisor vSwitch).

### The Control-Plane Question: How Does a VTEP Learn Where MACs Are?

VXLAN itself only defines the encapsulation. A VTEP still needs to know *"MAC 00aa.bb01.0203 in VNI 10010 is behind VTEP 10.0.0.12"*, and to handle broadcasts, unknown unicast and multicast (**BUM** traffic).

| Approach | How BUM traffic is handled | How MACs are learned | Trade-off |
|----------|---------------------------|----------------------|-----------|
| **Flood and learn — multicast underlay** | Each VNI maps to a multicast group; BUM is sent to the group | Data plane: like a switch, learn the source MAC + source VTEP from received packets | Simple, but needs PIM in the underlay (Chapter 10) and still floods |
| **Flood and learn — ingress replication** | The VTEP unicasts a copy to every other VTEP in a configured list | Data plane learning | No multicast needed, but more replication load |
| **BGP EVPN** | Ingress replication or multicast, with peers discovered via BGP (route type 3) | **Control plane:** VTEPs advertise MAC and IP addresses in MP-BGP (route type 2); prefixes as type 5 | Scales, little flooding, ARP suppression, distributed anycast gateway. The data-center standard |
| **LISP** (SD-Access) | Fabric handles it; flooding is optional per pool | Edges register endpoints with the LISP control plane node | Campus-optimized; pull-based |

**Why is BGP EVPN preferred over flood-and-learn?** Because flood-and-learn repeats the oldest Layer 2 behaviour (flood to everyone until you learn) across a whole fabric, and it needs every VTEP to observe traffic before it knows anything. EVPN **tells** every VTEP where every MAC and IP is as soon as it appears, so unknown-unicast flooding mostly disappears, VTEPs can answer ARP locally (**ARP suppression**), and the same default gateway can exist on every leaf (**anycast gateway**). *Control-plane learning replaces guessing with knowing.*

### 🔬 VXLAN-GPO — How SD-Access Carries Policy

SD-Access uses a VXLAN variant with the **Group Policy Option (VXLAN-GPO)**, which uses some reserved header bits to carry a **16-bit Scalable Group Tag (SGT)**. The destination edge can then enforce group-based policy (Chapter 14) without looking anything up. *One header carries the segment (VNI = virtual network) and the identity group (SGT).*

---

## 13.5 LISP vs VXLAN at a Glance

| Topic | LISP | VXLAN |
|-------|----------|-----------|
| Main job | **Control plane** — the EID-to-RLOC mapping system (it also defines its own data plane) | **Data plane** — the encapsulation |
| Encapsulates | IP packets (Layer 3) | Ethernet frames (Layer 2) |
| UDP port | 4342 control / 4341 data | **4789** |
| Overhead (IPv4 underlay) | 36 bytes | **50 bytes** |
| Segment ID | Instance ID (24-bit) | VNI (24-bit) |
| Learning model | Pull, on demand | Flood-and-learn, or a control plane (BGP EVPN / LISP) |
| Where you'll meet it | SD-Access control plane, multihomed branches, mobility | Data-center fabrics (EVPN), SD-Access data plane |

**Exam trap:** "Which protocol does SD-Access use for its data plane?" — **VXLAN** (with GPO). "Control plane?" — **LISP**. "Underlay routing?" — **IS-IS** (when Catalyst Center's LAN automation builds it). "Policy plane?" — **TrustSec/SGT**. Learn the four as a set; questions usually test whether you can keep them apart.

---

<a name="chapter-14"></a>
# Chapter 14: Catalyst SD-WAN & SD-Access

> **Blueprint:** ENCOR 1.2 — Explain the working principles of the Cisco Catalyst SD-WAN solution (1.2.a control and data plane elements, 1.2.b benefits and limitations); ENCOR 1.3 — Explain the working principles of the Cisco SD-Access solution (1.3.a control and data plane elements, 1.3.b traditional campus interoperating with SD-Access)

These are Cisco's two big **controller-based architectures** for the enterprise: **SD-WAN** for connecting sites across any transport, and **SD-Access** for the campus. Both apply the same idea from the CCNA guide's SDN chapter (22.2): separate the *brain* (management and control) from the *muscle* (forwarding), centralize the brain, and express what you want as **policy** rather than box-by-box CLI.

They're also where Chapters 12 and 13 come together. SD-WAN is built on **IPsec tunnels** and **VRF-style segmentation**; SD-Access is built on **LISP + VXLAN + VRFs**.

> **Names changed in 2023.** Cisco renamed the SD-WAN components. Learn the new names, but recognise the old ones, because documentation and many exam-prep sources still use them: **SD-WAN Manager = vManage**, **SD-WAN Controller = vSmart**, **SD-WAN Validator = vBond**. **Catalyst Center = DNA Center.**

---

## 14.1 Why SD-WAN? The Problem With the Traditional WAN

The classic enterprise WAN was **MPLS** circuits from one provider to every branch: reliable, but expensive, slow to order and rigid. Meanwhile:

- Applications moved **to the cloud** (Microsoft 365, SaaS, IaaS), but branch traffic was still backhauled to the data center first, adding latency.
- **Broadband and 4G/5G** became cheap and fast, but each is unreliable on its own.
- Every branch router was configured by hand, so policy drifted from site to site.

**SD-WAN's answer:** treat every transport — MPLS, internet, LTE — as a pool of interchangeable paths, build **encrypted tunnels over all of them**, measure each path continuously, and let a **central policy** decide which application uses which path.

## 14.2 Catalyst SD-WAN Components

![Catalyst SD-WAN components and planes](images/c14_sdwan_planes.png)

| Component (former name) | Plane | Job |
|-------------------------|-------|-----|
| **SD-WAN Manager** (vManage) | **Management** | Single GUI and REST API: configuration templates/configuration groups, policy authoring, monitoring, software upgrades, certificates. Pushes config to devices over NETCONF |
| **SD-WAN Validator** (vBond) | **Orchestration** | The **first point of contact**. Authenticates every new device, tells it where the Controllers and Managers are, and helps with **NAT traversal** (it sees each device's public, post-NAT address). Must have a public, reachable IP |
| **SD-WAN Controller** (vSmart) | **Control** | The routing brain. Runs **OMP** with every WAN Edge, acting like a BGP route reflector: receives routes and TLOCs, applies **centralized control policy**, and redistributes them. Also distributes data-plane encryption keys |
| **WAN Edge** (cEdge — Catalyst 8000/8300/8500, ISR 1000/4000 on IOS XE; vEdge on legacy Viptela OS) | **Data** | The branch/DC routers. Build IPsec tunnels to each other, forward traffic, enforce data policy, measure paths |

**Why split it into four roles?** Each one has a different scaling and security need. The Validator must sit on the public internet so devices behind NAT can reach it, but it holds no routes. The Controllers need to be highly available and scale with the number of edges. The Manager is a heavyweight database and GUI that people log in to. Separating them means a busy GUI never slows routing, and an exposed orchestrator never holds the routing table. *Separate planes, separate failure domains.*

**Where the controllers run:** on-premises (VMs in your data center), in a private cloud, or **Cisco-hosted (cloud-delivered)**, where Cisco runs the Manager, Controllers and Validators for you and you only own the WAN Edges. The architecture and roles are identical in every case; only who operates the controller VMs changes.

### How a New WAN Edge Joins (Zero-Touch Provisioning)

1. The router boots with no configuration, gets an IP via DHCP on its WAN port, and contacts the **PnP Connect** cloud service (or a configured Validator address).
2. PnP Connect redirects it to the organisation's **Validator**.
3. The Validator authenticates the device by **certificate and serial number** (it must be on the authorised device list uploaded from Cisco's Plug and Play portal), then tells it the addresses of the **Controllers** and **Manager**.
4. The edge builds **permanent control connections** to the Controllers and Manager. The connection to the Validator is torn down once onboarding is done (it's transient).
5. The Manager pushes the device's configuration; the Controller starts sending routes and policy via OMP.

**Onboarding prerequisites, the usual reasons a device never joins:**

- **Organization name** must match exactly (case-sensitive) on every component, because it is embedded in the certificates each side checks.
- **The device must be on the authorised WAN Edge list** (its chassis/serial number), uploaded to the SD-WAN Manager and synced to the Validators and Controllers. An unknown serial is rejected at the Validator.
- **A trusted root CA chain** must be installed, so each side can validate the others' certificates (Cisco's PKI by default, or an enterprise CA).
- The edge needs a **unique system IP and site ID**, the **Validator's address** (or reachability to PnP Connect), and working DNS/NTP: certificate checks fail if the clock is wrong.

### Control Connections: DTLS or TLS

All control traffic runs inside **DTLS** (Datagram TLS, over UDP, the default) or **TLS** (over TCP) tunnels, authenticated with certificates in both directions. Nothing is trusted just because it's on the right subnet. The default base port is **12346** (UDP for DTLS). Devices with several control connections use **port offsets** above it, and **port hopping** moves to 12366, 12386, 12406 and 12426 if a NAT or firewall blocks the base port. Firewalls in front of controllers must allow this range.

## 14.3 OMP and TLOCs — How Routes and Paths Are Shared

**OMP (Overlay Management Protocol)** runs between each WAN Edge and the Controllers, never edge to edge. It carries three kinds of route:

| OMP route type | What it advertises |
|----------------|--------------------|
| **OMP routes** (vRoutes) | The service-side prefixes a site can reach — its LANs, learned via connected, static, OSPF, EIGRP or BGP and redistributed into OMP |
| **TLOC routes** | The site's transport attachment points, and how to reach them |
| **Service routes** | Network services (firewall, IPS) available at a site, for service chaining |

A **TLOC (Transport Locator)** identifies one WAN attachment point of one router. It is the tuple:

**TLOC = System IP + Color + Encapsulation**

- **System IP** — a unique router ID, like an OSPF router ID (not necessarily routable).
- **Color** — a label for the transport type: `mpls`, `biz-internet`, `public-internet`, `lte`, `private1`... Colors decide which TLOCs try to build tunnels to each other and whether to use public (post-NAT) or private addresses.
- **Encapsulation** — IPsec (normal) or GRE.

**Why TLOCs instead of just IP addresses?** Because a WAN interface's IP can change (DHCP on broadband, NAT, a new circuit), and the overlay shouldn't care. An OMP route says *"10.20.0.0/16 is reachable via TLOC {System IP 1.1.1.20, color biz-internet}"*. If that circuit's public address changes, only the TLOC route changes; the prefixes stay valid. *Notice that's exactly LISP's split from 13.3 — identity (the prefix) is separated from location (the TLOC).*

## 14.4 The Data Plane

- WAN Edges build **IPsec tunnels directly to each other**, one per pair of TLOCs that policy allows. By default this is a **full mesh** of tunnels across all colors; policy can restrict it to hub-and-spoke or regional topologies.
- **Encryption keys are distributed by the Controller over OMP** rather than negotiated pairwise with IKE. Each edge generates its keys, sends them to the Controller, and the Controller reflects them to the edges that need them. *Why? Pairwise IKE between 1,000 sites would mean about 500,000 negotiations; one channel to the Controller scales linearly.*
- **BFD** runs inside every tunnel, both to detect failure and to **measure loss, latency and jitter** continuously. The defaults are a **1 s hello** with a **multiplier of 7**, so a dead tunnel is declared down after about **7 seconds**. Tune the hello interval down per color if you need faster failover.
- **Application-Aware Routing (AAR)** uses those measurements. You define **SLA classes** ("voice: loss < 1%, latency < 150 ms, jitter < 30 ms") and map applications (identified by DPI, NBAR2) to them. If the current path breaks the SLA, traffic moves to one that meets it.

**Segmentation:** VPNs in SD-WAN are VRFs. **VPN 0** is the transport (underlay) VPN facing the WAN; **VPN 512** is out-of-band management; **service VPNs** (e.g. 1–511) carry user traffic. The VPN ID travels in the data packets, so segments stay separate end to end.

**What if the Controllers are unreachable?** The data plane keeps forwarding. OMP **graceful restart** lets edges keep using their last-known routes and keys (by default for up to 12 hours), so a controller outage isn't a site outage. New changes simply can't be made until the controllers come back.

### Policy: Centralized vs Localized

SD-WAN policy comes in two families, defined in SD-WAN Manager:

| Policy type | Family | Delivered to | Acts on | Example |
|-------------|--------|--------------|---------|---------|
| **Control policy** | Centralized | The **Controllers** | OMP routes and TLOCs (the topology) | Build hub-and-spoke instead of full mesh; prefer a data-center exit |
| **Data policy** | Centralized | Controllers, then to edges via OMP | Packets at the edges | Direct internet access for guest traffic; send a subnet through a firewall (service chaining) |
| **App-aware routing policy** | Centralized | Controllers, then to edges via OMP | Applications vs SLA classes | Voice must use a path with < 150 ms latency |
| **Localized policy** | Localized | **Directly to one device** by the Manager (NETCONF) | That device's interfaces and routing protocols | QoS shaping, ACLs, route filtering on the LAN-side OSPF |

**Why the split?** Centralized policy expresses *network-wide intent* ("branches talk only through hubs"), so it belongs on the Controller that sees every route. Localized policy is about *one box's interfaces* (queues, ACLs), so it's pushed straight to that box. A classic exam question: "Which policy changes the overlay topology?" Centralized **control** policy, because it manipulates OMP routes and TLOCs on the Controller.

## 14.5 SD-WAN Benefits and Limitations

| Benefits | Limitations |
|----------|-------------|
| **Transport independence** — MPLS, broadband and LTE are all usable, all encrypted | **Controller dependency** — the overlay needs Controllers and Validators for onboarding and changes; they must be designed for HA |
| **Application-aware path selection** based on measured SLAs | **Overhead** — IPsec + extra headers reduce usable MTU; BFD probes add a little traffic on every tunnel |
| **Centralized policy** — one place to define routing, QoS, security | **Complexity and new skills** — OMP, TLOCs, colors, templates are a new model to learn and troubleshoot |
| **Zero-touch provisioning** — ship a router, plug it in | **Licensing and cost** — subscription licences; savings depend on replacing MPLS |
| **Direct cloud / internet access** from branches (Cloud OnRamp for SaaS/IaaS) | **Internet transports have no SLA** — SD-WAN steers around problems; it can't create bandwidth that isn't there |
| **Built-in segmentation** (VPNs) and encryption | **Full-mesh scale** — tunnel counts grow as roughly n²; large designs need regional/hub topologies |

---

## 14.6 SD-Access — The Campus Fabric

Traditional campus networks segment with VLANs and ACLs: every new group means new VLANs, new subnets, new ACL lines on many switches, and policy tied to IP addresses that change as users move. **SD-Access** replaces this with a **fabric** in which:

- **Identity drives policy.** A user or device authenticates (802.1X/MAB via **ISE**) and is placed in a **virtual network** and a **group** automatically, wherever it plugs in.
- **The same subnet can exist on every access switch**, so users keep their IP addresses while roaming.
- **Everything is automated** by **Catalyst Center** (Chapter 16).

### The Planes of the Fabric

| Plane | Technology | Role |
|-------|------------|------|
| **Underlay** | Routed IP, normally **IS-IS** (built by Catalyst Center LAN automation; OSPF possible for manual underlays) | Connects all fabric nodes' loopbacks. No VLANs and no STP between switches |
| **Overlay — control plane** | **LISP** (13.3) | Tracks which endpoint (EID) sits behind which edge switch (RLOC) |
| **Overlay — data plane** | **VXLAN-GPO** (13.4) | Carries endpoint traffic between fabric nodes, including the VN and the SGT |
| **Policy plane** | **Cisco TrustSec** — **SGTs** and SGACLs, from **ISE** | Decides who may talk to whom, by group |
| **Management plane** | **Catalyst Center** | Design, automation, assurance |

## 14.7 SD-Access Fabric Roles

![SD-Access fabric roles and the fusion router](images/c14_sda_roles.png)

| Role | What it does |
|------|--------------|
| **Control plane node** | The **LISP Map Server/Map Resolver**. Holds the *host tracking database*: every endpoint's identity and which edge it's behind. Often co-located with the border |
| **Edge node** | The access switch endpoints connect to. A LISP **xTR** and VXLAN VTEP. Authenticates endpoints, registers them with the control plane node, and provides the **anycast gateway**: the same gateway IP and MAC for a subnet on every edge |
| **Border node** | Connects the fabric to everything outside it: the data center, WAN, internet or a traditional network. Advertises external prefixes into the fabric and fabric prefixes out. Types: **internal** (known internal networks), **external** (default exit, e.g. to the internet), and **anywhere/internal + external** |
| **Intermediate node** | Any underlay switch between edges and borders. Just routes IP. It **knows nothing about the overlay** — it only sees VXLAN packets between loopbacks |
| **Fabric WLC** | Wireless controller integrated with the fabric. It handles the **control plane** for wireless clients (registering them with the control plane node), while AP **data** traffic is VXLAN-encapsulated straight to the edge switch. Wireless and wired then share the same policy model |
| **Extended node** | A small Layer 2 switch (e.g. Catalyst IE or compact switches) hanging off an edge, extending the fabric to places like factory floors |

**Why the anycast gateway?** Because in a traditional campus, a user's gateway lives on one distribution switch (with HSRP, Chapter 9). Roam to a different building and the subnet, and possibly the IP address, changes. In SD-Access, **every edge node owns the same gateway** for every subnet, so wherever an endpoint lands, its gateway is one hop away and its address stays valid. LISP tells the fabric where that endpoint now lives. *Mobility without stretching VLANs.*

### More Fabric Building Blocks

| Term | Meaning |
|------|---------|
| **Fabric in a box (FiaB)** | Border, control plane and edge roles all on **one switch** (or stack). For a small site that still wants the fabric's policy model |
| **INFRA_VN** | The VN that carries **fabric APs and extended nodes**. It maps to the **global routing table**, not a VRF, because APs need to reach the WLC and the underlay |
| **DEFAULT_VN** | A VN created by default for user endpoints when you don't need macro segmentation |
| **Extended node** | Layer 2 switch connected to an edge node. Ports are placed in VLANs that map to fabric VNs, but it **can't enforce SGACLs**; the edge node enforces for it |
| **Policy extended node** | A more capable extended node (selected Catalyst IE/compact models) that **can carry SGTs inline and enforce SGACLs** itself |

**Fabric APs.** Access points connect to an **edge node** and run in **local mode**. They sit in the **INFRA_VN**, so they reach the WLC in the global table. Control traffic (CAPWAP) goes to the fabric WLC as normal, but **client data does not**: the AP encapsulates each client's frames in **VXLAN straight to its edge switch**, which treats the wireless client like a wired one (same VN, same SGT enforcement, same anycast gateway). *Wireless becomes just another access port of the fabric.*

### Macro vs Micro Segmentation

| Level | Mechanism | Separates | Example |
|-------|-----------|-----------|---------|
| **Macro** | **Virtual Network (VN) = a VRF** | Whole routing domains; no communication between VNs unless deliberately routed outside the fabric | Corporate VN, Guest VN, IoT VN |
| **Micro** | **Scalable Group Tag (SGT)** within a VN | Groups inside the same VN, enforced by SGACLs | In the Corporate VN, *Contractors* can't reach *Finance-Servers* |

**Why two levels?** VRFs are strong walls but blunt. Every extra VN needs its own routing tables, and crossing between them requires a fusion device. SGTs are lightweight and plentiful, so you can write fine-grained "group A to group B" rules without new subnets or IP-based ACLs. *Use VNs for "these must never meet", and SGTs for "these share a network but have different permissions".*

**Why tag-based policy beats IP ACLs:** an IP ACL says "10.1.5.0/24 cannot reach 10.9.0.0/16". When users move, change subnet, or DHCP hands out new addresses, the rule is wrong. An SGT policy says "*Contractors* cannot reach *Finance-Servers*". The tag follows the authenticated identity, so the rule stays correct wherever the user connects. The ingress edge stamps the SGT into the VXLAN-GPO header, and the egress edge enforces the SGACL.

## 14.8 Traditional Campus Interoperating With SD-Access

Very few organisations rip out the whole campus at once. The blueprint asks how the fabric connects to what's already there.

**1. Layer 3 handoff at the border, through a fusion router.** The border node hands each VN out as a separate VRF, usually over **802.1Q subinterfaces with eBGP per VRF (VRF-Lite)**, to an external **fusion router** (or firewall).

**Why is it called a "fusion" router?** Because the VNs are deliberately isolated, yet they all need **shared services** — DHCP, DNS, ISE, Catalyst Center, the internet. The fusion device **leaks routes between VRFs** (or a firewall routes between them under security policy), *fusing* the separate VNs with the shared-services and global routing tables at one controlled point. *Isolation inside the fabric, controlled sharing at the edge of it.*

**2. Layer 2 handoff (Layer 2 border).** A border node can bridge a fabric subnet to a **traditional VLAN** outside the fabric. Endpoints in the old network and in the fabric then share one subnet with one gateway (in the fabric). This is the migration tool: move users switch by switch, without readdressing hosts that are still on the old network.

**3. Routed connection to the existing core.** The traditional distribution/core simply becomes "outside" the fabric. Fabric prefixes are advertised to it from the border via BGP or redistributed into the existing IGP, and the legacy network's prefixes are imported into the fabric.

**4. Underlay coexistence.** Existing switches that support the fabric roles can be added; those that don't can act as intermediate nodes (pure IP routing) or stay outside the fabric entirely.

| Interop need | Tool | Typical design |
|--------------|------|----------------|
| Fabric users reach DHCP/DNS/ISE | Fusion router / firewall | Route leaking between VN VRFs and the shared-services VRF |
| Fabric reaches DC, WAN, internet | External border | VRF-Lite + eBGP per VN to fusion / WAN edge |
| Migrate a subnet without readdressing | Layer 2 border handoff | Fabric subnet bridged to legacy VLAN during the cutover |
| Legacy core keeps running | Border advertises fabric prefixes | BGP or IGP redistribution at the border |

### Connecting Fabric Sites: Transits

A large organisation runs several **fabric sites** (a campus, a branch, a data center), and something must join them. That joining network is a **transit**:

| Transit | How sites connect | What survives between sites |
|---------|-------------------|-----------------------------|
| **SD-Access transit** | Native fabric: VXLAN between site borders over an IP network, with **transit control plane nodes** acting as a LISP map server *between* sites | VN **and SGT** stay in the VXLAN header end to end. Single policy domain |
| **IP-based transit** | Borders hand off with **VRF-Lite + BGP** (or across an SD-WAN/MPLS network) | VNs survive as VRFs, but the VXLAN header is removed, so SGTs must be re-carried another way (inline tagging on the links, or SXP) |

**Why does SD-Access transit need its own control plane node?** Because each site's control plane node only knows its own endpoints. The **transit control plane node** aggregates the sites' prefixes, so a border can ask "which site has 10.9.4.0/24?" and tunnel straight there. *It's LISP again, one level up.*

**Exam trap:** the **control plane node** is not "the controller". The controller (management plane) is **Catalyst Center**. The control plane node is a *switch* running LISP MS/MR. Don't mix them up.

---

## 14.9 SD-WAN and SD-Access Side by Side

| Topic | Catalyst SD-WAN | SD-Access |
|-------|---------------------|---------------|
| Domain | WAN — connecting sites | Campus / branch LAN |
| Management | SD-WAN Manager | Catalyst Center |
| Control plane | OMP via SD-WAN Controllers | LISP via control plane nodes |
| Data plane | IPsec tunnels between WAN Edges | VXLAN-GPO between fabric nodes |
| Segmentation | VPNs (VRFs) | VNs (VRFs) + SGTs |
| Path / location abstraction | TLOC (System IP + color + encap) | RLOC (fabric node loopback) |
| Onboarding | Validator + PnP, certificates | Catalyst Center PnP / LAN automation |
| Policy | Centralized control and data policy, AAR | Group-based access control via ISE |

*The pattern repeats:* a central controller holds intent, a control protocol maps identities to locations, tunnels carry the data across a simple underlay, and VRFs plus tags keep the segments apart. Learn the pattern once and both architectures make sense.

---

<a name="chapter-15"></a>
# Chapter 15: Network Assurance Tools: Debugs, SNMP, Syslog, Flexible NetFlow, SPAN & IP SLA

> **Blueprint:** ENCOR 4.1 — Diagnose network problems using tools such as debugs, conditional debugs, traceroute, ping, SNMP, and syslog; ENCOR 4.2 — Configure and verify Flexible NetFlow; ENCOR 4.3 — Configure SPAN/RSPAN/ERSPAN; ENCOR 4.4 — Configure and verify IP SLA

**Network assurance** means being able to *prove* the network is doing what you intended, and to find out quickly when it isn't. The CCNA guide gave you ping, traceroute, syslog and SNMP as concepts (21.6, 17.5, 17.6). ENCOR expects you to use each one as a working diagnostic tool and to add four more: conditional debugs, Flexible NetFlow, traffic mirroring and IP SLA.

Each tool answers a different question:

| Question | Tool |
|----------|------|
| Can I reach it, and by which path? | **ping, traceroute** (extended) |
| What is the device doing internally, packet by packet? | **debug** — ideally *conditional* |
| What has the device been telling me happened? | **syslog** |
| How are its counters and health trending? | **SNMP** |
| Who is talking to whom, how much, using what? | **Flexible NetFlow** |
| What exactly is in the packets? | **SPAN / RSPAN / ERSPAN** + a packet analyzer |
| Is the path performing well right now, continuously? | **IP SLA** |

Chapter 32 returns to SNMP, logging, IP SLA and NetFlow at ENARSI **troubleshooting** depth. This chapter gets them configured and working.

---

## 15.1 Ping and Traceroute — Extended Versions

A basic `ping` sources from the outgoing interface with 5 × 100-byte packets. The **extended** options answer much more precise questions:

```
R1# ping 10.2.2.2 source Loopback0 repeat 10 size 1500 df-bit
Type escape sequence to abort.
Sending 10, 1500-byte ICMP Echos to 10.2.2.2, timeout is 2 seconds:
Packet sent with a source address of 1.1.1.1
Packet sent with the DF bit set
MMMMMMMMMM
Success rate is 0 percent (0/10)
```

| Option | Question it answers |
|--------|---------------------|
| `source Loopback0` | Does the **far end have a route back** to this network? (A default ping sources from the exit interface, which may be reachable when your LANs aren't) |
| `repeat 1000` | Is there **intermittent** loss? Five packets can't show 1% loss |
| `size 1500 df-bit` | What MTU does the path support? `M` = "fragmentation needed but DF set" |
| `vrf NAME` | Test inside a VRF (12.6) |

**Ping result codes:** `!` reply · `.` timeout · `U` destination unreachable · `M` could not fragment · `Q` source quench · `&` TTL exceeded · `?` unknown packet type.

**Why does sourcing from a loopback catch so many problems?** Because routing is a two-way problem. A plain ping from R1 to R2 uses the link's own subnet, which R2 knows as directly connected, so it always works. Real user traffic comes from R1's LANs. If R2 has no route back to *those*, users fail while your basic ping succeeds. *Always test the way the traffic actually flows.*

**Traceroute** (IOS sends UDP probes with increasing TTL) shows the path hop by hop, with these markers: `*` no reply within the timeout · `!H` host unreachable · `!N` network unreachable · `!P` protocol unreachable · `!A` administratively prohibited (an ACL). A trace that stops at one hop while the next hop's own pings work usually points at an ACL, or at a device configured not to send ICMP unreachables.

**How does traceroute know it has arrived?** Each intermediate router whose TTL expires answers with ICMP **time exceeded**. The destination itself isn't expiring anything; it receives a UDP probe aimed at a high port nobody listens on (33434 and up) and answers with ICMP **port unreachable**. That different reply is the signal that the trace is complete. If the destination filters UDP or doesn't send unreachables, the last line is `* * *` repeated to the 30-hop maximum, even though the host is reachable.

## 15.2 Debugs — and Doing Them Safely

`debug` makes IOS print events from a process as they happen: `debug ip ospf adj`, `debug ip bgp updates`, `debug crypto ikev2`. It is the most detailed tool you have, and the most dangerous.

**Why are debugs dangerous?** Debug output is generated by the **CPU**. A debug that fires per packet (`debug ip packet` on a busy router) can drive the CPU to 100%, and the router may then drop routing protocol hellos, lose neighbors and lock you out of the console. *A debug can cause a bigger outage than the one you were investigating.*

**Safe debugging habits:**

```
R1(config)# no logging console                ! don't send debug output to the slow console
R1(config)# logging buffered 1000000 debugging ! to RAM instead - read: show logging
R1(config)# service timestamps debug datetime msec   ! so you can correlate events
R1# terminal monitor                          ! see log output on an SSH/VTY session
R1# undebug all                               ! (or: no debug all) - the stop button
```

**Why does `terminal monitor` matter?** Log and debug messages go to the console by default. If you're connected over SSH, you see **nothing** until you enter `terminal monitor`. It applies only to your current session, so you must repeat it on each login. *"I turned on debug and nothing happened" is usually a missing `terminal monitor`.*

### Conditional Debugs — Narrowing the Firehose

A **debug condition** limits debug output to traffic that matches a filter, such as an interface, an IP address or a peer:

```
R1# debug condition interface GigabitEthernet0/1   ! only events on this interface
R1# debug condition ip 10.1.1.50                    ! only events involving this host
R1# debug ip ospf adj
R1# show debug condition                          ! lists the active conditions
R1# undebug all
R1# no debug condition all                          ! conditions persist - clear them too
```

Many feature debugs also accept their own filters, for example an ACL with `debug ip packet 101 detail`, or a neighbor with `debug ip bgp 10.0.0.2 updates`.

**Exam trap:** debug conditions **stay in place** after `undebug all`. If you forget to clear them, the next engineer's debug silently shows only part of the picture.

## 15.3 Syslog

Every IOS log message has a **severity** from 0 to 7. Lower numbers are more severe, and choosing a level includes **that level and everything more severe**.

| Level | Keyword | Example |
|-------|---------|---------|
| 0 | emergencies | System unusable |
| 1 | alerts | Immediate action needed (e.g. temperature) |
| 2 | critical | Critical condition (hardware failure) |
| 3 | errors | Interface errors, failed operations |
| 4 | warnings | Config warnings, approaching limits |
| 5 | notifications | Normal but significant: interface up/down, neighbor changes (`%LINEPROTO-5-UPDOWN`) |
| 6 | informational | ACL log hits, general info |
| 7 | debugging | Debug output |

*Mnemonic: **E**very **A**wesome **C**isco **E**ngineer **W**ill **N**eed **I**ce-cream **D**aily.*

**Reading a message.** Every IOS log line has the same shape:

```
*Oct 26 14:02:11.318 EST: %LINK-3-UPDOWN: Interface Gi0/1, changed state to down
```

| Part | Here | Meaning |
|------|------|---------|
| Timestamp | `Oct 26 14:02:11.318 EST` | From `service timestamps` (a leading `*` means the clock isn't NTP-synchronized) |
| **FACILITY** | `LINK` | The subsystem that generated it (`LINEPROTO`, `OSPF`, `BGP`, `SYS`…) |
| **SEVERITY** | `3` | 0–7 as in the table above (here, errors) |
| **MNEMONIC** | `UPDOWN` | Short code for the event type |
| Description | `Interface Gi0/1, …` | The human-readable detail |

So `%FACILITY-SEVERITY-MNEMONIC` tells you, before you read a word of the description, who is talking and how serious it is.

**Where messages go, and each destination's own level:**

| Destination | Command | Default level | Notes |
|-------------|---------|---------------|-------|
| Console | `logging console <level>` | debugging (7) | Slow serial line; heavy logging here can hurt CPU |
| VTY sessions | `logging monitor <level>` | debugging (7) | Only shown in a session that ran `terminal monitor` |
| Local buffer | `logging buffered <size> <level>` | debugging (7) | Read with `show logging`; lost on reload |
| Syslog server | `logging trap <level>` + `logging host` | informational (6) | The only destination that survives a reload |

Each destination filters independently. Sending debugs to the buffer but only warnings to the server is a normal design.

```
R1(config)# service timestamps log datetime msec localtime show-timezone
R1(config)# logging buffered 64000 informational  ! local RAM buffer, levels 0-6
R1(config)# logging host 10.0.0.50                ! syslog server, UDP 514
R1(config)# logging trap warnings                 ! send levels 0-4 to the server
R1(config)# logging source-interface Loopback0    ! consistent source IP
R1# show logging                                  ! settings + the local buffer
```

**Why set `logging source-interface`?** The syslog server identifies devices by source IP. Without it, a router's messages come from whichever interface faces the server, which can change after a reroute, so its logs appear under a different "device". A loopback is always the same.

**Why are timestamps essential?** Because troubleshooting is **correlating events across devices**: "BGP dropped on R1 at 14:02:11.318 — what happened on R2 at that moment?" Without accurate time (NTP, Chapter 8) and millisecond timestamps, logs from different devices can't be lined up. *Logs without synchronised timestamps are anecdotes.*

## 15.4 SNMP

SNMP lets a **manager** (NMS) read and write **MIB** variables on an **agent** (the device). Agents listen on **UDP 161**; traps and informs go to the manager on **UDP 162**.

**MIBs and OIDs.** A **MIB** (Management Information Base) is a structured definition of what can be read or set: interface counters, CPU load, routing table entries. Every individual variable has an **OID** (Object Identifier), a dotted path through a global tree. For example `1.3.6.1.2.1.2.2.1.10` is `ifInOctets` (under iso.org.dod.internet.mgmt.mib-2.interfaces). Standard MIBs live under `1.3.6.1.2.1` (mib-2); vendor MIBs under `1.3.6.1.4.1` (enterprises; Cisco is `.9`). Appending an index selects one instance: `…10.3` is the input octet counter of interface index 3.

| Operation | Direction | What it does |
|-----------|-----------|--------------|
| **Get** | Manager → agent | Read one OID |
| **GetNext** | Manager → agent | Read the *next* OID in the tree (how tables are walked) |
| **GetBulk** (v2c+) | Manager → agent | Read many next OIDs in one request |
| **Walk** | Manager tool | Repeated GetNext/GetBulk to dump a whole subtree (`snmpwalk`) |
| **Set** | Manager → agent | Write a value (needs RW access) |
| **Trap / Inform** | Agent → manager | Unsolicited notification of an event |

| Version | Security | Notes |
|---------|----------|-------|
| **v1 / v2c** | **Community string**, sent in clear text | v2c added GetBulk and informs. Read-only (RO) or read-write (RW) communities |
| **v3** | **Users and groups**, with authentication and encryption | The only version you should deploy today |

### SNMPv3 Security Levels

| Level | Authentication | Encryption | Keyword |
|-------|----------------|------------|---------|
| **noAuthNoPriv** | Username only | No | `noauth` |
| **authNoPriv** | HMAC-SHA (MD5 is legacy) | No | `auth` |
| **authPriv** | HMAC-SHA (MD5 is legacy) | **Yes** (AES; DES/3DES are legacy) | `priv` |

### Traps vs Informs

- **Trap** — the agent sends a notification and forgets it. If the UDP packet is lost, the event is lost.
- **Inform** — the manager must **acknowledge** it, and the agent retransmits until it does. Reliable, but uses more memory and traffic.

**Why not always use informs?** Because during a big failure, when hundreds of events fire, the device must hold every unacknowledged inform in memory and keep retransmitting, possibly toward a manager it can no longer reach. Informs are for events you can't afford to lose; traps are fine for high-volume, lower-value ones.

### Configuring SNMPv2c (Read-Only, Restricted)

You'll still see v2c on older estates and in exam exhibits. The only protection a community string has is the ACL attached to it:

```
R1(config)# access-list 20 permit host 10.0.0.50                  ! the NMS only
R1(config)# snmp-server community R3ad0nly RO 20                  ! RO + ACL
R1(config)# snmp-server host 10.0.0.50 version 2c R3ad0nly        ! trap destination
R1(config)# snmp-server enable traps
```

**Why the ACL matters:** the community string crosses the network in clear text. Anyone who captures it can poll the device, and with an RW community, change its configuration. Restricting the community to the NMS address is the minimum; v3 is the real fix.

### Configuring SNMPv3 (authPriv)

```
R1(config)# snmp-server view ALL-MIB iso included             ! what the group can see
R1(config)# snmp-server group NMS-GRP v3 priv read ALL-MIB    ! group requires authPriv
R1(config)# snmp-server user nms-admin NMS-GRP v3 auth sha AuthPass#1 priv aes 128 PrivPass#1
R1(config)# snmp-server host 10.0.0.50 version 3 priv nms-admin   ! where to send traps
R1(config)# snmp-server enable traps                          ! or enable specific ones
R1# show snmp user
R1# show snmp group
```

**Informs over v3 need one more step.** For a trap, the *sending* router is the authoritative SNMP engine, so the user above (keyed to the router's own engine ID) works. For an **inform**, the *receiver* is authoritative, because it must acknowledge. The router therefore needs the manager's engine ID and a copy of the user localized to it:

```
! (global configuration mode)
snmp-server engineID remote 10.0.0.51 800000090300AABBCCDDEE01
snmp-server user nms-admin NMS-GRP remote 10.0.0.51 v3 auth sha Auth#1 priv aes 128 Priv#1
snmp-server host 10.0.0.51 informs version 3 priv nms-admin
```

Configure the `engineID remote` **before** the remote user: the user's keys are computed from that engine ID. Skip it, and the informs are sent but never acknowledged, so the router keeps retransmitting them and the manager never logs a single event.

**A quirk worth knowing:** SNMPv3 users **don't appear in `show running-config`**. Their keys are localized and hashed, so you verify them with `show snmp user`. This surprises people the first time they check a config backup.

---

## 15.5 Flexible NetFlow

SNMP tells you an interface is 90% busy. **NetFlow** tells you **who** is using it: which hosts, which applications, how many bytes. A **flow** is a set of packets sharing the same **key fields**, classically the 7-tuple: source/destination IP, source/destination port, protocol, ToS and input interface.

**Flexible NetFlow (FNF)** is the modern IOS XE implementation. You choose exactly which fields define a flow and which are collected. It is built from four parts:

| Component | Job | Command |
|-----------|-----|---------|
| **Flow record** | Which fields are **keys** (`match`, define a flow) and which are **non-key** (`collect`, measured per flow) | `flow record` |
| **Flow exporter** | Where to send flow data, how, and in what format | `flow exporter` |
| **Flow monitor** | Ties a record to one or more exporters; holds the **cache** | `flow monitor` |
| **Interface** | Applies the monitor, input and/or output | `ip flow monitor … input` |

**Why the key/non-key distinction?** Key fields decide *what counts as a separate flow*. Add `match transport destination-port` and HTTPS and SSH between the same hosts become separate flows. Non-key fields are just *measurements* recorded about each flow: bytes, packets, timestamps. *Keys determine the granularity of the answer; non-keys determine what you learn about each flow.*

### Configuring It (Try It!)

```
flow record REC-WAN
 match ipv4 source address            ! key fields - define the flow
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 match interface input
 collect counter bytes long           ! non-key fields - measured per flow
 collect counter packets long
 collect timestamp absolute first
 collect timestamp absolute last
!
flow exporter EXP-COLLECTOR
 destination 10.0.0.60                ! the NetFlow collector
 source Loopback0
 transport udp 2055                   ! collector's port (2055, 9995, 9996 are common)
 export-protocol netflow-v9           ! or ipfix
!
flow monitor MON-WAN
 record REC-WAN
 exporter EXP-COLLECTOR
 cache timeout active 60              ! export long-lived flows every 60 s
!
interface GigabitEthernet0/0
 ip flow monitor MON-WAN input
 ip flow monitor MON-WAN output
```

### Verifying

```
R1# show flow monitor MON-WAN cache format table
IPV4 SRC ADDR  IPV4 DST ADDR  TRNS SRC PORT  TRNS DST PORT  IP PROT  bytes long  pkts long
=============  =============  =============  =============  =======  ==========  =========
10.1.1.25      52.96.10.4             51544            443        6    18422190      13021
10.1.1.40      10.2.0.10              62011             22        6       41250        310

R1# show flow exporter EXP-COLLECTOR statistics    ! are packets actually being sent?
R1# show flow interface GigabitEthernet0/0         ! which monitors are applied where
R1# show flow monitor MON-WAN statistics           ! cache size, active/added/aged flows
```

**Why `cache timeout active`?** A flow is normally exported when it **ends** (TCP FIN/RST, or inactive for 15 seconds by default). A two-hour file transfer would then appear on the collector only after it finished, so for two hours the graphs would show nothing. The active timeout forces long flows to be exported in slices (default 1800 s; 60 s is common), so the collector sees traffic as it happens.

**Common FNF problems:** monitor applied in only one direction (half the conversation is missing); the exporter's source interface has no route to the collector; a collector expecting a different port or format (v5 vs v9 vs IPFIX). **NetFlow v5** has a *fixed* format (IPv4 only, no templates); **v9 and IPFIX** are *template-based*, which is what makes flexible records possible.

---

## 15.6 SPAN, RSPAN and ERSPAN — Copying Traffic to an Analyzer

NetFlow summarizes traffic; sometimes you need the **actual packets**, for Wireshark, an IDS or a recorder. A switch normally forwards a frame only to its destination port, so you have to tell it to **mirror** traffic to a monitoring port.

![SPAN, RSPAN and ERSPAN compared](images/c15_span.png)

| Type | Source and destination | Transport for the copies |
|------|------------------------|--------------------------|
| **SPAN** (local) | Same switch | Internal |
| **RSPAN** (remote) | Different switches, same Layer 2 domain | A dedicated **RSPAN VLAN** across trunks |
| **ERSPAN** (encapsulated remote) | Anywhere reachable by IP | **GRE** across a routed network |

### Local SPAN

```
SW1(config)# monitor session 1 source interface Gi1/0/1 both    ! rx, tx, or both
SW1(config)# monitor session 1 source vlan 10 rx                ! VLANs can be sources too
SW1(config)# monitor session 1 destination interface Gi1/0/24   ! the analyzer port
SW1# show monitor session 1
```

### RSPAN

```
! On EVERY switch the copies cross:
vlan 999
 remote-span                          ! marks it as RSPAN - no MAC learning in this VLAN
!
! Source switch
SW1(config)# monitor session 1 source interface Gi1/0/1 both
SW1(config)# monitor session 1 destination remote vlan 999
!
! Destination switch
SW2(config)# monitor session 1 source remote vlan 999
SW2(config)# monitor session 1 destination interface Gi1/0/24
```

**Why must the VLAN be flagged `remote-span`?** Because mirrored frames still carry their **original** MAC addresses. In a normal VLAN, intermediate switches would learn those MACs on the wrong port (the mirror path) and could start forwarding *real* traffic for those hosts along it. In an RSPAN VLAN, MAC learning is disabled, so the copies simply flood along to the destination. The RSPAN VLAN must also be **allowed on every trunk** in the path.

### ERSPAN (IOS XE)

```
! Source router/switch
monitor session 10 type erspan-source
 source interface GigabitEthernet1/0/1 both
 no shutdown                          ! ERSPAN sessions are shut by default
 destination
  erspan-id 100                       ! must match on the receiver
  ip address 10.9.9.9                 ! the receiving device or analyzer
  origin ip address 10.1.1.1          ! source of the GRE packets
!
! Destination switch (if a switch, not an analyzer, decapsulates)
monitor session 20 type erspan-destination
 destination interface GigabitEthernet1/0/24
 no shutdown
 source
  erspan-id 100
  ip address 10.9.9.9
```

Many analyzers (Wireshark, commercial probes) can receive and decode ERSPAN directly, so a destination session isn't always needed.

### SPAN Rules and Limits

- A **destination port** stops being a normal switch port: it doesn't forward ordinary traffic or take part in STP, and by default it ignores incoming traffic.
- **Oversubscription:** mirroring `both` directions of a 1 Gbps port can produce up to 2 Gbps of copies, more than a 1 Gbps destination can carry. The excess is **silently dropped**, so your capture may be missing packets.
- The number of monitor sessions is limited by platform, often to just a few per switch. Check the platform's limits before you rely on another one being free.
- Mirroring adds load; ERSPAN adds GRE overhead to the network it crosses (so mind the MTU).
- A port can't be both a source and a destination, and an EtherChannel member can't be a destination.

---

## 15.7 IP SLA — Measuring the Path Continuously

Ping tells you about **now**, when you happen to run it. **IP SLA** makes the router run probes **continuously, on a schedule**, keep statistics, and (combined with tracking) **react** when performance degrades.

```
R1(config)# ip sla 10
R1(config-ip-sla)#  icmp-echo 8.8.8.8 source-interface GigabitEthernet0/0
R1(config-ip-sla-echo)#  frequency 10            ! probe every 10 s (default 60)
R1(config-ip-sla-echo)#  threshold 300           ! ms - above this, "over threshold"
R1(config-ip-sla-echo)#  timeout 1000            ! ms to wait for a reply
R1(config)# ip sla schedule 10 life forever start-time now
```

```
R1# show ip sla statistics 10
IPSLA operation id: 10
        Latest RTT: 14 milliseconds
Latest operation start time: 10:42:31 UTC Mon Oct 26 2026
Latest operation return code: OK
Number of successes: 412
Number of failures: 3
Operation time to live: Forever

R1# show ip sla configuration 10
R1# show ip sla summary
```

**Why `life forever`?** An operation that's configured but not **scheduled** never runs, and the default life is 3600 seconds, after which it silently stops. Forgetting the schedule, or leaving the default life, is the classic "my IP SLA does nothing" problem.

### Operation Types You Should Recognise

| Operation | Measures | Needs a responder? |
|-----------|----------|--------------------|
| `icmp-echo` | Reachability and round-trip time | No — any device that answers ping |
| `udp-jitter` | Delay, **jitter**, loss in each direction, MOS for voice | **Yes** — `ip sla responder` on the far Cisco device |
| `tcp-connect` | Can a TCP session be opened to a port (application up?) | No for well-known ports; yes otherwise |
| `http` | Web response time | No |
| `udp-echo` | UDP round trip | Usually |

**Why does `udp-jitter` need a responder?** Because measuring **one-way** delay and jitter requires timestamps from *both* ends. A plain ping only shows the round trip. The **IP SLA responder** timestamps each probe on arrival and departure, and subtracts its own processing time, so the measurements reflect the network rather than the far router's CPU.

### Try It — udp-jitter for Voice Quality

```
R2(config)# ip sla responder                         ! far end: answer and timestamp probes
!
R1(config)# ip sla 20
R1(config-ip-sla)#  udp-jitter 10.2.2.2 16384 codec g711ulaw source-ip 10.1.1.1
R1(config-ip-sla-jitter)#  frequency 30
R1(config)# ip sla schedule 20 life forever start-time now
!
R1# show ip sla statistics 20
```

The `codec g711ulaw` keyword makes the probe mimic a G.711 call (packet size and interval), so the statistics include a **MOS** (Mean Opinion Score) and **ICPIF** voice-quality estimate alongside one-way latency, jitter and loss in each direction. If R2's responder is missing, every operation fails with a **timeout** return code, even though R2 answers pings.

### From Measurement to Action

On its own, IP SLA only measures. Linked to a **track object**, it can change routing:

```
track 1 ip sla 10 reachability
ip route 0.0.0.0 0.0.0.0 198.51.100.254 track 1   ! primary default - removed if probe fails
ip route 0.0.0.0 0.0.0.0 203.0.113.254 10         ! floating backup (CCNA guide 15.5)
```

**`state` or `reachability`?** Two ways to turn a probe into up/down, and the difference is the **threshold**:

| Track keyword | Up when the return code is | Down when |
|---------------|----------------------------|-----------|
| `track 1 ip sla 10 reachability` | OK **or Over threshold** | Timeout or other failure |
| `track 1 ip sla 10 state` | **OK only** | Over threshold, timeout, failure |

So with `threshold 300`, a path answering in 450 ms keeps a `reachability` track **up** (it's slow but reachable) but takes a `state` track **down** (it's failing its SLA). Pick `state` when "too slow" should trigger failover, and `reachability` when only "dead" should.

```
R1# show track 1
Track 1
  IP SLA 10 reachability
  Reachability is Up
    3 changes, last change 00:41:12
  Latest operation return code: OK
  Latest RTT (millisecs) 14
  Tracked by:
    Static IP Routing 0
```

Read it as: what it tracks, its current state, **how often it has flapped** (the change counter), the latest probe result, and **what depends on it** (here, a static route).

This is how a router fails over when an ISP's *link* stays up but the ISP's *network* is broken, which an interface-down check would never notice. Chapter 9 uses the same tracking to lower HSRP priority, and Chapter 32 covers troubleshooting tracking and jitter operations at ENARSI depth.

---

## 15.8 Choosing the Right Tool

| Symptom | First tool | Then |
|---------|-----------|------|
| "Site B is unreachable" | Extended ping **sourced from the LAN**, traceroute | Routing table on each hop; ACLs at the hop where the trace stops |
| "OSPF neighbor keeps flapping" | `show logging` (look for `%OSPF-5-ADJCHG`) | Conditional `debug ip ospf adj` on that interface |
| "The WAN link is full — by what?" | **Flexible NetFlow** cache / collector | QoS (Chapter 11) or a conversation with the top talker |
| "VoIP calls are choppy" | **IP SLA udp-jitter** | QoS marking/queuing on the path |
| "The app vendor wants a packet capture" | **SPAN / ERSPAN** to Wireshark | Analyze the handshake and retransmissions |
| "CPU and interface trends over a month" | **SNMP** polling to the NMS | Thresholds and alerts |
| "Failover didn't happen when the ISP broke" | `show track`, `show ip sla statistics` | Check the schedule, life and the target used |

*The habit to build:* go from broad and cheap tools (logs, counters, flows) to narrow and expensive ones (debugs, captures). Start the expensive ones only once you know where to point them.

---

<a name="chapter-16"></a>
# Chapter 16: Cisco Catalyst Center: Traditional & AI-Powered Workflows

> **Blueprint:** ENCOR 4.5 — Describe how Cisco Catalyst Center (formerly Cisco DNA Center) is used to apply network configuration, monitoring, and management using traditional and AI-powered workflows

**Cisco Catalyst Center** (called **DNA Center** until 2023) is Cisco's controller for the enterprise campus, branch and wireless network. It's the management plane of SD-Access (Chapter 14), but it manages traditional networks too. You met it in the CCNA guide as "the controller" (22.2). ENCOR wants you to describe *how it is used*: how intent becomes configuration, how monitoring becomes **assurance**, and what its AI features actually do.

> **A note on product claims.** Catalyst Center's features, especially the AI ones, change with every release and depend on licensing (most AI features require the **Advantage** tier, and some need cloud connectivity). This chapter describes the capabilities and the ideas behind them. Check Cisco's current release notes before you rely on a specific feature in production.

---

## 16.1 From Box-by-Box to Intent

**The traditional way:** an engineer works out what is needed ("a new floor needs a voice VLAN with QoS"), translates it into CLI, then logs in to each switch and types it, hoping every box ends up consistent. Monitoring is a separate set of tools (SNMP graphs, syslog server, NetFlow collector) that each show one slice, and correlating them is a manual job.

**Intent-based networking (IBN)** turns that around:

1. **Express the intent** (*what* you want: "voice gets priority on every access port at this site").
2. **Translate and activate.** The controller works out the per-device configuration and pushes it to every device consistently.
3. **Assure.** Continuously collect telemetry and verify the network *is* behaving as intended. When it isn't, explain why and suggest a fix.

**Why does the "assure" step matter so much?** Because pushing configuration was never the hard part; scripts could already do that. The hard part is knowing whether the network is actually *delivering* what you asked for, right now, for every user. A config that was pushed successfully can still produce terrible voice quality. *IBN closes the loop: intent → config → verification → back to intent.*

| Aspect | Traditional CLI management | Catalyst Center (controller-based) |
|--------|----------------------------|------------------------------------|
| Unit of work | One device | A site, a group, a policy |
| Consistency | Depends on the engineer's discipline | Templates and intent enforced everywhere; drift is flagged |
| New device | Console cable, manual config | **Plug and Play** — zero-touch |
| Software upgrades | Device by device, manual checks | **SWIM** — golden images, automated pre/post checks |
| Monitoring | Separate SNMP, syslog, NetFlow tools | **Assurance** — correlated health scores per device, client, application |
| Troubleshooting | Engineer's experience + `show` commands | Guided issues with suggested actions, path trace, AI baselines |
| Integration | Screen-scraping CLI | **Intent API** (REST), webhooks, ITSM integration (Chapter 20) |

## 16.2 The Four Workflows

The Catalyst Center interface is organized around four lifecycle workflows, plus a platform layer for integration.

![Catalyst Center workflows and the assurance loop](images/c16_workflow.png)

### Discovery and Inventory — Getting Existing Devices In

PnP (below) handles *new* devices. An existing network gets into Catalyst Center through **Discovery**:

1. **Choose how to find devices:** a **CDP** or **LLDP** crawl outward from a seed device (with a hop limit), or an **IP address range/subnet** scan.
2. **Supply credentials**, because Catalyst Center must log in to and poll what it finds: **CLI** (SSH username, password, enable secret), **SNMP** (v2c read/write communities or v3 users), and optionally **NETCONF** (port 830) and HTTP(S) credentials.
3. **Discovered devices land in the Inventory** with their reachability status ("Reachable", "Unreachable", "Authentication failed"), software version, platform and role. From there you **assign them to a site** in the hierarchy, which applies that site's settings.

**Why do so many discoveries end in "Authentication failed" or "Unreachable"?** Because Discovery is just SSH and SNMP under the hood. Wrong CLI credentials, an SNMP community that doesn't match (or an SNMP ACL that doesn't permit the Catalyst Center address), or SSH not enabled on the device all stop it. *Catalyst Center manages a device only as well as it can log in to it.*

### Design — Describe the Network You Want

- **Network hierarchy:** Areas → Buildings → Floors (with floor maps for wireless). Everything else (settings, policies, reports) attaches to a place in this hierarchy, and child sites inherit from parents.
- **Network settings:** AAA servers, DHCP, DNS, NTP, syslog, SNMP and NetFlow collectors, time zone, banners, all defined once per site.
- **IP address pools:** IP Address Management (IPAM) built in, or integrated with an external IPAM.
- **Image repository:** which software version is the **golden image** for each device family.
- **Wireless:** SSIDs, RF profiles.

**Why define settings once at the site level?** So a new switch dropped into "Building 3" automatically gets the right NTP server, syslog collector and AAA configuration. *Settings become a property of the place, not something someone has to remember to type.*

### Policy — Describe Who Can Do What

- **Group-based access control** with **ISE**: define scalable groups (SGTs) and the policy matrix between them (14.7).
- **Virtual networks** for SD-Access macro-segmentation.
- **Application policy (QoS):** classify applications as business-relevant, default or business-irrelevant, and Catalyst Center generates the matching QoS configuration (classification, marking, queuing) per platform (Chapter 11).

### Provision — Make It Real

- **Plug and Play (PnP):** a new device boots with no configuration and finds Catalyst Center through **DHCP option 43**, a DNS lookup of **`pnpserver.<domain>`**, or Cisco's cloud **PnP Connect** redirect. It then receives its image and Day-0 configuration automatically.
- **Templates:** Day-N configuration written in **Velocity** or **Jinja2**, with variables filled in per device or site, and pushed consistently.
- **SWIM (Software Image Management):** mark a golden image, and Catalyst Center flags non-compliant devices, distributes the image, runs **pre-checks** (flash space, config saved, startup config valid), activates it in a maintenance window, and runs **post-checks**.
- **LAN automation and fabric provisioning** for SD-Access: build the IS-IS underlay automatically and assign fabric roles (14.7).
- **Compliance:** compares running configurations, images and security advisories against the intended state, and flags drift.

**Why do PnP and templates together matter so much?** Because the costliest part of rolling out 300 branch switches isn't buying them. It's the engineer time spent consoling into each one, and the configuration errors that slip in. With PnP and templates, a non-technical person at the site plugs the switch in, and it gets exactly the same validated configuration as every other site.

### Assurance — Prove It Works

Catalyst Center continuously collects telemetry — **streaming telemetry**, **SNMP**, **syslog**, **NetFlow**, wireless data from controllers and APs, and data from ISE and other integrations — and correlates it into **health scores** and **issues**.

| Health score | Meaning |
|--------------|---------|
| **8–10** | Good |
| **4–7** | Fair |
| **1–3** | Poor |
| — | No data (shown grey, not scored) |

- **Device health** combines KPIs such as CPU, memory, interface errors, reachability and (for APs) radio utilization and interference.
- **Client health** combines onboarding (association, authentication, DHCP) and connectivity (RSSI, SNR, data rate) for each wired and wireless client.
- **Network health** is the **percentage of devices that are healthy** (score 8–10) — overall and per site and category.
- **Application health** uses NBAR/AVC data: throughput, latency, packet loss and jitter per application.

**Issues** are detected problems with context: *what* happened, *where*, *when*, the impact (how many clients), and **suggested actions** (often a guided set of checks that Catalyst Center can run for you).

**Tools inside Assurance:**

- **Path Trace** — pick a source and destination, and Catalyst Center computes the hop-by-hop path from its knowledge of the topology, routing and configuration, including ACLs that would block the flow.
- **Intelligent Capture** — packet-level and RF data for a specific wireless client, captured by the AP.
- **Sensor tests** — dedicated sensors (or APs in sensor mode) that act as synthetic clients, testing onboarding, DNS, DHCP, web access and more, on a schedule.
- **Time travel** — scroll health back in time to see the state *when the user complained*, not just now.

**Why is "time travel" so valuable?** Because most user complaints arrive after the fact: "the Wi-Fi was terrible during the 10 o'clock meeting". With traditional tools you'd see a healthy network at 2 p.m. and close the ticket. With stored, correlated history you can look at that client, AP and moment directly. *Assurance turns "can't reproduce" into evidence.*

### Platform — Talk to Everything Else

The **Intent API** (northbound REST) exposes most of Catalyst Center's functions, so scripts, ITSM tools (e.g. ServiceNow) and orchestrators can drive and query it. Event notifications can be pushed out by webhook, email or syslog. Chapter 20 covers the API and its response codes.

---

### How Catalyst Center Talks to Devices (Southbound)

Intent is turned into device changes, and telemetry collected, over ordinary management protocols:

| Protocol | Used for |
|----------|----------|
| **SSH / CLI** | Pushing configuration (templates, provisioning) and running show commands for inventory and compliance. The workhorse |
| **NETCONF** (SSH, port 830) | Model-driven configuration on IOS XE devices that support it (Chapter 20) |
| **SNMP** | Polling device status and counters for inventory and assurance; receiving traps |
| **Syslog, NetFlow, streaming telemetry** | Event and flow data feeding Assurance |
| **HTTPS / RESTCONF and controller APIs** | Talking to wireless controllers, ISE (pxGrid/ERS) and other integrated systems |

*Northbound, Catalyst Center offers the Intent API (REST) to your scripts (Chapter 20). Southbound, it is still mostly SSH and SNMP to the devices, which is why device credentials and reachability are the first things to check when provisioning fails.*

## 16.3 AI-Powered Workflows

The v1.2 blueprint specifically asks about **AI-powered workflows**. The core idea: the network already produces vastly more telemetry than people can read, so machine learning and reasoning engines turn that data into **baselines, anomalies, root causes and natural-language answers**.

### AI Network Analytics — Learned Baselines and Anomaly Detection

A traditional alert uses a **static threshold**: "alert when DHCP response time > 500 ms". That threshold is always wrong somewhere. Too low for a busy Monday morning at headquarters, too high for a quiet branch.

**AI Network Analytics** sends anonymized telemetry to Cisco's cloud ML service, which learns a **dynamic baseline** for *your* network: what is normal for this KPI, at this site, at this time of day and week. Then it:

- **Detects anomalies** — deviations from the learned normal (for example, onboarding failures at one site far above what's usual for a Tuesday at 9 a.m.), rather than crossings of a fixed line.
- **Peer comparison** — compares a site or AP with similar ones ("this building's roaming times are worse than your other buildings").
- **Trends and insights** — longer-term patterns, such as recurring interference or growing capacity pressure.

**Why do learned baselines beat static thresholds?** A static threshold produces two kinds of noise: *false alarms* where "high" is normal, and *missed problems* where a large deviation still sits below the line. A baseline asks "is this unusual **here and now**?", which is the question an experienced engineer actually asks. *It cuts alert fatigue while catching subtle problems earlier.*

### Machine Reasoning Engine (MRE) — Automated Root-Cause Analysis

The **Machine Reasoning Engine** encodes troubleshooting knowledge from Cisco experts (TAC, engineering) as **reasoning workflows**. Given an issue, it gathers the relevant data from devices (configs, `show` output, state) and works through the logical steps an expert would, to reach a **root cause and a recommended fix**.

Typical uses include:

- **Network Reasoner** tools — guided checks such as diagnosing high CPU, an interface that is down, or a failed ping between devices.
- **Security advisories** — checking whether a published Cisco PSIRT vulnerability actually applies to each device's *configuration*, not just its software version.
- **Compliance and best-practice checks** across the network.

**Why "reasoning" rather than ML?** Because many problems have a *known* logical diagnosis ("BGP is down → is the neighbor reachable? → are the AS numbers right? → is there an ACL on TCP 179?"). Learning that from data would be pointless when experts can write it down. MRE automates **known expertise**; ML finds **unknown patterns**. Catalyst Center uses both.

### AI Endpoint Analytics

Identifies and classifies endpoints (IP phones, cameras, medical devices, printers, IoT) using deep packet inspection, network probes and ML clustering. It suggests labels for unknown devices so they can be placed in the correct **group** for policy (14.7, with ISE).

### Natural-Language Operations — the AI Assistant

Cisco has added a generative-AI **AI Assistant** to Catalyst Center and other management platforms. Operators can ask questions in plain language ("which sites had the most client onboarding failures this week?", "why is this AP unhealthy?") and receive summarized answers, explanations of issues and suggested next steps. Cisco has also introduced **AI Canvas**, a collaborative workspace in which AI agents help with troubleshooting across Cisco's platforms ("AgenticOps"). Availability, scope and licensing vary by release.

**What's different from traditional workflows?** The engineer no longer needs to know *which page or command* holds the answer. They state the question, and the system finds and correlates the data. The engineer's judgement still matters: AI output is a starting point that must be verified, especially before any change is made.

## 16.4 Traditional vs AI-Powered — Same Problem, Two Workflows

**Scenario:** users at the Leeds office report that Wi-Fi "keeps dropping" every morning.

| Step | Traditional workflow | AI-powered Catalyst Center workflow |
|------|----------------------|-------------------------------------|
| Detect | Wait for complaints | **AI baseline** flags abnormal disconnects at that site at 08:30–09:30, before most tickets arrive |
| Scope | Ask users which floor; check WLC logs | **Issue** lists the affected clients, APs and floor; client health over time |
| Correlate | Compare syslog times with RF graphs by hand | Peer comparison shows only this building; insights show co-channel interference rising at the same times |
| Root cause | Engineer's experience, maybe a site visit | Guided checks / **MRE** reasoning plus RF data point to channel planning on two APs |
| Fix | Change channels on the WLC by hand | Apply an RF profile change in **Design**, provision it to the site |
| Verify | Wait for complaints to stop | Assurance shows client health back to 8–10 the next morning (**time travel** to compare) |

*The point:* the network and the engineer haven't changed. What's changed is how quickly the evidence is assembled, and that the system can see a problem *before* users report it.

## 16.5 Exam-Ready Summary

| Term | One-line meaning |
|------|------------------|
| **Catalyst Center** | Cisco's enterprise controller (formerly DNA Center); management plane for SD-Access and traditional networks |
| **Design / Policy / Provision / Assurance** | The four lifecycle workflows: describe the network, define access/QoS policy, push it, prove it works |
| **PnP** | Zero-touch onboarding via DHCP option 43, DNS `pnpserver`, or PnP Connect |
| **Templates** | Velocity/Jinja2 configuration with variables, applied consistently |
| **SWIM** | Golden images, automated distribution and activation with pre/post checks |
| **Health score** | 1–10 per device/client/application; 8–10 good, 4–7 fair, 1–3 poor |
| **Path Trace** | Computed hop-by-hop path between two endpoints, including ACL checks |
| **AI Network Analytics** | Cloud ML — learned baselines, anomaly detection, peer comparison, trends |
| **Machine Reasoning Engine** | Expert knowledge encoded as automated root-cause workflows |
| **AI Endpoint Analytics** | ML-assisted endpoint classification for group policy |
| **AI Assistant** | Natural-language questions and guided answers about the network |
| **Intent API** | Northbound REST API (Chapter 20) |

---

<a name="chapter-17"></a>
# Chapter 17: Device Access Control, AAA, ACLs & CoPP

> **Blueprint:** ENCOR 5.1.a — Lines and local user authentication; ENCOR 5.1.b — Authentication and authorization using AAA; ENCOR 5.2.a — ACLs; ENCOR 5.2.b — CoPP

At CCNA you learned that a router should have passwords, that AAA has three A's, and that ACLs filter traffic (CCNA guide 18.4, Chapter 19). At CCNP the question changes from *"what is it?"* to *"how do I lock down a device so that the right people get exactly the right access, it keeps working when the AAA server dies, and nobody can knock it over by flooding its CPU?"* This chapter builds that answer in four layers: **the lines** you log in through, **who you are** (local users and AAA), **what traffic is allowed through** the box (ACLs), and **what traffic is allowed to the box's own brain** (CoPP).

**Chapter 31** takes the same features into troubleshooting depth for ENARSI. Here we build them correctly.

---

## 17.1 The Doors Into a Device — Console, AUX and VTY Lines

Every Cisco device has **lines**: the doors an administrator can walk through to get a CLI.

| Line | What it is | Typical numbering | Reach |
|------|------------|-------------------|-------|
| **Console** (`line con 0`) | Physical serial/USB port on the device | Exactly one | You must be standing there (or on a terminal server) |
| **AUX** (`line aux 0`) | Auxiliary serial port, historically for a modem | One (many platforms no longer have it) | Out-of-band dial-in |
| **VTY** (`line vty 0 4`, `0 15`, …) | Virtual terminals for Telnet/SSH sessions | 5 or 16+ — one per simultaneous remote session | Anywhere with IP reachability |

**Why are VTYs numbered as a range?** Because each one is a *slot* for one remote session. `line vty 0 4` is five slots, so five admins can be connected at once; a sixth is refused. Newer IOS XE images have `vty 0 15` or more. **The trap:** if you configure `line vty 0 4` but the device also has `line vty 5 15`, those extra eleven lines keep their *old* settings — possibly Telnet with a weak password. *Always check `show running-config | section line vty` to see every VTY block, not just the first one.*

### Hardening the lines

```
R1(config)# line con 0
R1(config-line)# exec-timeout 10 0          ! log out an idle session after 10 min 0 s
R1(config-line)# logging synchronous        ! stop log messages chopping your typing
R1(config-line)# login local                ! authenticate against the local user database
!
R1(config)# line aux 0
R1(config-line)# transport input none       ! nothing can open a session through AUX
R1(config-line)# no exec                    ! and no EXEC shell even if something connects
!
R1(config)# ip access-list standard MGMT-HOSTS
R1(config-std-nacl)# permit 10.99.0.0 0.0.0.255   ! the management subnet only
!
R1(config)# line vty 0 15
R1(config-line)# transport input ssh        ! SSH only — Telnet sends passwords in clear text
R1(config-line)# exec-timeout 10 0
R1(config-line)# login local
R1(config-line)# access-class MGMT-HOSTS in ! only these sources may even attempt to log in
```

**Why `access-class` rather than an ACL on an interface?** Because the VTY is the thing you want to protect, no matter which interface the session arrives on. An interface ACL protects one door in the building; `access-class` protects the room itself. A router with ten interfaces and a loopback would need the same entry on all eleven; `access-class` does it once. *Note that `access-class ... in` checks the **source** of incoming sessions, and `access-class ... out` restricts where a user may connect to **from** the router (via `telnet`/`ssh` out of it).* If management sessions arrive in a VRF, add `vrf-also` (`access-class MGMT-HOSTS in vrf-also`), or the ACL silently doesn't apply to them.

**Why `exec-timeout` matters for security, not just tidiness.** An abandoned privileged session on a console is a logged-in root shell for whoever walks past next. `exec-timeout 0 0` (never time out) is a lab convenience you should never see in production.

### Three ways a line can authenticate (before AAA)

Without AAA, each line decides for itself how to check who you are. There are exactly three options, and the exam expects you to read them:

```
R1(config)# line con 0
R1(config-line)# password C0ns0le-Pw     ! the line has its own password...
R1(config-line)# login                   ! ...and "login" says "ask for it"
!
R1(config)# line vty 0 15
R1(config-line)# login local             ! ask for a username + password from "username" lines
!
R1(config)# line aux 0
R1(config-line)# no login                ! no prompt at all — whoever connects gets a shell
```

| Line config | Prompt you see | Checked against |
|-------------|----------------|-----------------|
| `password X` + `login` | `Password:` only | The line's own password |
| `login local` | `Username:` then `Password:` | The local `username ... secret` database |
| `no login` | Nothing | Nobody — open door |

**The two traps.** First, `login` **without** a `password` on a VTY line refuses every session with *"Password required, but none set"*. VTYs (unlike the console) won't let you in with no password configured. Second, `login local` with **no** `username` lines locks everyone out, because there is nothing to match. *`password` is a shared secret per door; `login local` is per-person identity, which is what accounting and audit need.*

**Landing straight in privileged mode.** By default a line session starts at level 1 (`R1>`). `privilege level 15` under a line drops everyone who logs in through that line straight into `R1#`:

```
R1(config)# line con 0
R1(config-line)# privilege level 15      ! console users start at level 15
```

It's convenient on a console in a locked room, and dangerous on VTYs with a shared line password, because then knowing one password means full control. With `login local`, the **user's** privilege (`username X privilege N`) decides the level instead.

### SSH prerequisites (recap from CCNA guide 6.6, with the CCNP extras)

```
R1(config)# hostname R1
R1(config)# ip domain name corp.example
R1(config)# crypto key generate rsa modulus 3072   ! RSA keys need hostname + domain first
R1(config)# ip ssh version 2
R1(config)# ip ssh time-out 60                     ! seconds to finish logging in
R1(config)# ip ssh authentication-retries 3
R1(config)# login block-for 120 attempts 5 within 60  ! brute-force brake (see below)
```

`login block-for 120 attempts 5 within 60` means: *if 5 logins fail within 60 seconds, refuse all logins for 120 seconds* ("quiet mode"). Pair it with `login quiet-mode access-class MGMT-HOSTS` so your management subnet can still get in while the device is shrugging off an attack.

---

## 17.2 Local Users, Privilege Levels and Password Hashes

### Privilege levels

IOS has **16 privilege levels, 0–15**:

| Level | Meaning |
|-------|---------|
| **0** | Almost nothing — `logout`, `enable`, `disable`, `help`, `exit` |
| **1** | User EXEC (`R1>`) — the default after login |
| **2–14** | Unused by default — you can move commands into them |
| **15** | Privileged EXEC (`R1#`) — everything |

```
R1(config)# username noc privilege 5 algorithm-type scrypt secret N0c-Viewer!
R1(config)# privilege exec level 5 show running-config   ! level 5 may RUN the command...
R1(config)# username admin privilege 15 algorithm-type scrypt secret Adm1n-Str0ng!
```

A user created at `privilege 15` lands straight in `R1#` on login. A level-5 user gets `R1#` too (any level above 1 shows `#`) but can only run commands assigned to levels 0–5. Check where you are with `show privilege`.

> **Exam trap — the near-empty running config.** Moving `show running-config` to level 5 lets the NOC user *run* it, but below level 15 the output only includes the commands that user is **allowed to configure**. A level-5 user with no configuration commands sees little more than the `version` line, `end`, and a few headers. It's a classic "why can't my NOC see the config?" question. The fixes: assign `show running-config view full` to the level (the `view full` option shows the whole config regardless of the user's level), or grant `file privilege 5` so a level-5 user can read the config as a file with `more system:running-config`. With AAA, command authorization (17.4) is the cleaner answer.

**Separate enable passwords per level.** `enable secret` can be set per level, and `enable N` asks for that level's password:

```
R1(config)# enable algorithm-type scrypt secret level 5 Lvl5-Pw!   ! the level-5 enable secret
R1> enable 5                 ! prompts for the level-5 secret; lands at level 5
R1# show privilege
Current privilege level is 5
```

Plain `enable` with no number means `enable 15`. This is how small shops gave a NOC "a bit more than user mode" before AAA, and it still shows up in exam exhibits.

**Why do local custom privilege levels fall out of favour at scale?** Because they're per-device. Maintaining `privilege exec level 5 ...` lines identically on 800 switches is exactly the problem AAA command authorization (17.4) solves centrally. *Local levels are a fine fallback; they are a poor primary policy.*

### Password types — what the number in the config means

When you view the config, every password carries a **type** number that tells you how it's stored:

| Type | How it's stored | Command that produces it | Verdict |
|------|-----------------|--------------------------|---------|
| **0** | Clear text | `password X` (no service password-encryption) | Never |
| **7** | Vigenère-style reversible encoding | `service password-encryption` | Hides from shoulder-surfers only — reversible in seconds |
| **4** | SHA-256, but **unsalted with a single iteration** (a flawed implementation) | Old `enable secret` on some 15.x releases | Deprecated and removed — weaker than type 5 |
| **5** | MD5 hash (salted) | `secret X` on older IOS | Deprecated — too fast to brute-force |
| **8** | PBKDF2 with SHA-256 | `algorithm-type sha256 secret X` | Good |
| **9** | scrypt | `algorithm-type scrypt secret X` | Best — memory-hard |

```
R1(config)# enable algorithm-type scrypt secret En4ble-Str0ng!
R1# show running-config | include secret
enable secret 9 $9$nhEmQVczB7dqsO$X.HsgL6x1il0RxkOSSvyQYwucySCt7qFm4v7pqCxkKM
username admin privilege 15 secret 9 $9$7Mbz3XS/W/tKpe$ue8JC8/kk4lCSUbsZB3CKS5U7PmzKX...
```

**Why is a hash (types 5/8/9) fundamentally different from type 7?** Type 7 is *encoding*: the device has to turn it back into the original to use it, so anyone with the algorithm (it's public) can too. A hash is one-way: the device never needs the original. At login it hashes what you typed and compares hashes. To "crack" a hash an attacker has to guess passwords and hash every guess. **Why is scrypt (type 9) better than MD5 (type 5) when both are one-way?** Because cracking is a speed race. MD5 was designed to be *fast*, so a GPU can try billions of guesses per second. scrypt is deliberately *slow and memory-hungry*, so every guess costs real RAM, which makes massively parallel GPU cracking expensive. *The goal of a password hash is to be slow on purpose.*

> **Exam trap:** `enable password` and `enable secret` can both exist; if they do, **`enable secret` wins** and `enable password` is ignored. And `service password-encryption` does **not** touch `secret` values. It only converts type 0 to type 7.

---

## 17.3 AAA — Turning It On and Building Method Lists

![AAA conversation between an admin, the router and a TACACS+ server](images/c17_aaa_flow.png)

### `aaa new-model` changes everything at once

```
R1(config)# aaa new-model
```

The moment you enter this, **line-level `login` and `password` commands stop being used**. Every line that doesn't name its own list (console and VTYs alike) now authenticates through the `default` method list, and if you haven't defined one, the implicit default is **local**. The VTYs are where this bites, because that's where a remote admin is when it happens. *Why does that matter?* Because if you type `aaa new-model` on a remote router that has no local usernames, your next SSH session has nothing to authenticate against. **Always create a local privilege-15 user before `aaa new-model`.** That's the exam-style "locked yourself out" scenario, and in real life it's the one where you drive to the data centre.

### Defining servers and server groups (modern IOS XE syntax)

```
R1(config)# tacacs server ISE-1
R1(config-server-tacacs)# address ipv4 10.99.0.21
R1(config-server-tacacs)# key 0 T@cacsSharedKey
R1(config-server-tacacs)# single-connection          ! reuse one TCP session for many requests
!
R1(config)# tacacs server ISE-2
R1(config-server-tacacs)# address ipv4 10.99.0.22
R1(config-server-tacacs)# key 0 T@cacsSharedKey
!
R1(config)# aaa group server tacacs+ ADMIN-TACACS
R1(config-sg-tacacs+)# server name ISE-1             ! tried first
R1(config-sg-tacacs+)# server name ISE-2             ! tried if ISE-1 does not answer
R1(config-sg-tacacs+)# ip tacacs source-interface Loopback0
!
R1(config)# radius server ISE-R1
R1(config-radius-server)# address ipv4 10.99.0.21 auth-port 1812 acct-port 1813
R1(config-radius-server)# key 0 R@diusSharedKey
R1(config)# aaa group server radius ACCESS-RADIUS
R1(config-sg-radius)# server name ISE-R1
```

**Why put the source interface on a loopback?** The AAA server only answers devices it has been told about, identified by **source IP**. If the request leaves from whichever physical interface faces the server, a routing change can switch the source IP and the server will silently ignore the device. A loopback never goes down, so the device's identity never moves. *This is the same reason OSPF prefers a loopback for its router ID (CCNA guide 16.7).*

### Method lists — the ordered "how do I check this?" list

A **method list** is a named, ordered list of places to check:

```
R1(config)# aaa authentication login default group ADMIN-TACACS local
R1(config)# aaa authentication login CONSOLE local
R1(config)# aaa authentication enable default group ADMIN-TACACS enable
!
R1(config)# line con 0
R1(config-line)# login authentication CONSOLE      ! console uses the named list
! (VTYs use "default" automatically — no command needed)
```

| Part | Meaning |
|------|---------|
| `login` | This list authenticates **logins** (as opposed to `enable`, `dot1x`, `ppp`) |
| `default` | Applied to **every line automatically** unless a line names another list |
| `CONSOLE` | A **named** list — only used where you apply it with `login authentication CONSOLE` |
| `group ADMIN-TACACS local` | Try the TACACS+ group first; then the local user database |

The methods you can put in a list, and what each one checks:

| Method keyword | Checks | Notes |
|----------------|--------|-------|
| `group tacacs+` | Every TACACS+ server defined globally | Generic — all servers, in config order |
| `group radius` | Every RADIUS server defined globally | Generic |
| `group NAME` | Only the servers in that named server group | Preferred: you control membership and order |
| `local` | Local `username` database, username matched **case-insensitively** | Password is always case-sensitive |
| `local-case` | Local database, username **case-sensitive** | `Admin` ≠ `admin` |
| `enable` | The enable secret | Common last resort in `aaa authentication enable` lists |
| `line` | The line's own `password` | Lets old per-line passwords act as a fallback |
| `none` | Nothing — always succeeds | Only as a deliberate last resort (e.g. console of a lab box) |

Methods are tried left to right, up to four, and the ERROR-vs-FAIL rule below decides when the router moves on.

**Why give the console its own `local`-only list?** Because the console is the door you use when the network is broken, and a broken network often means the AAA server is unreachable. If the console tries TACACS+ first, every login waits for timeouts before falling back. Some designs deliberately keep the console independent of the network.

### The rule everyone gets wrong — ERROR vs FAIL

**The next method in the list is tried only when the current one returns an ERROR, never when it returns a FAIL.**

| What the TACACS+ server does | Result | Does the router try `local` next? |
|------------------------------|--------|-----------------------------------|
| Doesn't answer (down, unreachable, wrong key → no valid reply) | **ERROR** | **Yes** |
| Answers "this user/password is wrong" | **FAIL** (reject) | **No** — login denied, list stops |

**Why is it designed this way?** Think about what fallback is *for*: keeping you in when the central server is **unavailable**. If a rejection from the server also fell through to `local`, then any account the security team disabled centrally could still log in with a stale local password. That would turn the backup door into a bypass. *The fallback is for an absent server, never for a server that said no.* This is also why the local fallback account should have a long, vaulted password and be audited: it's the one account that works when ISE is down.

> **Exam trap:** "The admin's TACACS+ account was disabled but they can still log in using the local account" is **impossible** while the TACACS+ server is reachable. If they can, the server must be unreachable (ERROR), so check reachability, keys and source interface (Chapter 31).

---

## 17.4 Authorization and Accounting

Authentication proves who you are. **Authorization** decides what you may do. On a device you authorize two things:

```
R1(config)# aaa authorization exec default group ADMIN-TACACS local if-authenticated
R1(config)# aaa authorization commands 15 default group ADMIN-TACACS local if-authenticated
R1(config)# aaa authorization console        ! without this, the console skips authorization
R1(config)# aaa authorization config-commands
```

| Command | What gets authorized |
|---------|----------------------|
| `aaa authorization exec` | Whether you get a shell at all, **and at which privilege level** (the server returns e.g. `priv-lvl=15`) |
| `aaa authorization commands 15` | **Every single level-15 command**, one by one, as you type it (TACACS+ only — see why below) |
| `if-authenticated` | Last-resort method: "if they authenticated, allow it" — keeps you working if the server dies |

**Why does per-command authorization need TACACS+ rather than RADIUS?** Because RADIUS combines authentication and authorization into one exchange at login. It hands back a bundle of attributes and the conversation is over. TACACS+ keeps the three A's **separate**, so the device can ask a fresh question ("may `admin` run `configure terminal`?") for every command, long after login. *That separation is the whole reason TACACS+ is the device-administration protocol.*

**Accounting** records what happened:

```
R1(config)# aaa accounting exec default start-stop group ADMIN-TACACS
R1(config)# aaa accounting commands 15 default start-stop group ADMIN-TACACS
```

`start-stop` sends a record when something begins and when it ends (session duration). `stop-only` sends just the end. With `commands 15` accounting, the server keeps a line for every config command and who typed it. That's the answer to "who shut that interface at 03:12?"

### TACACS+ vs RADIUS — the CCNP version of the table

| Property | **TACACS+** | **RADIUS** |
|----------|-------------|------------|
| Transport | **TCP 49** | **UDP 1812** (auth) / **1813** (accounting); legacy 1645/1646 |
| Encryption | **Entire payload** | **Only the password** attribute |
| AAA separation | Authentication, authorization, accounting **separate** | Authentication + authorization **combined** |
| Per-command authorization | **Yes** | No |
| Origin | Cisco (now RFC 8907, informational) | IETF standard (RFC 2865/2866) |
| Primary job | **Device administration** | **Network access** — 802.1X, VPN, Wi-Fi (18.3, Chapter 31) |

**Why TCP for TACACS+ and UDP for RADIUS?** TACACS+ authorizes command by command, so a reliable, long-lived session (`single-connection`) suits it. RADIUS handles thousands of short, independent access requests (every laptop joining the network), and connectionless UDP with its own retries is lighter for that.

### Verifying

```
R1# test aaa group ADMIN-TACACS jsmith Secr3t! legacy
Sending password
User successfully authenticated
R1# show tacacs                 ! per-server: connection state, packets sent/received, errors
R1# show aaa servers            ! UP/DEAD state, request counts, response times
R1# show aaa sessions
R1# debug aaa authentication    ! Chapter 31 walks through reading this output
```

---

## 17.5 ACLs at CCNP Depth

CCNA taught standard vs extended, wildcards, placement and the implicit deny (CCNA guide Chapter 19). CCNP adds four practical skills: **editing in place**, **object-groups**, **`established`**, and **IPv6 ACLs**. It also adds the habit of reading hit counters as a troubleshooting tool.

### Number ranges, for completeness

| Type | Numbers |
|------|---------|
| Standard IPv4 | 1–99, 1300–1999 |
| Extended IPv4 | 100–199, 2000–2699 |

On IOS XE, a numbered ACL and a named ACL are the same thing internally. `ip access-list extended 110` opens numbered ACL 110 in named-ACL mode, so you get sequence numbers for it too.

### Sequence numbers — editing without rewriting

```
R1# show access-lists EDGE-IN
Extended IP access list EDGE-IN
    10 permit tcp any host 203.0.113.10 eq 443 (18234 matches)
    20 permit tcp any host 203.0.113.10 eq 80 (512 matches)
    30 deny ip any any log (97 matches)
!
R1(config)# ip access-list extended EDGE-IN
R1(config-ext-nacl)# 25 permit udp any host 203.0.113.53 eq domain   ! insert between 20 and 30
R1(config-ext-nacl)# no 20                                          ! remove one line only
R1(config)# ip access-list resequence EDGE-IN 10 10                 ! renumber 10, 20, 30 ...
```

**Why does this matter so much in production?** Before sequence numbers, changing one line of a numbered ACL meant removing the whole ACL and re-entering it. For the few seconds in between, an interface ACL that's been deleted either permits everything or doesn't exist. Inserting by sequence number changes **one rule atomically**. *The `(N matches)` counters are your first troubleshooting tool: a rule with 0 matches after a test either isn't being reached or doesn't match what you think it does.* Clear them with `clear ip access-list counters EDGE-IN` before you test.

### Object-groups — naming sets of things

When the same servers and ports appear in many rules, object-groups turn an ACL into readable policy:

```
R1(config)# object-group network WEB-SERVERS
R1(config-network-group)# host 10.20.0.10
R1(config-network-group)# host 10.20.0.11
R1(config-network-group)# 10.20.1.0 255.255.255.0          ! note: subnet MASK, not wildcard
!
R1(config)# object-group service WEB-PORTS
R1(config-service-group)# tcp eq 80
R1(config-service-group)# tcp eq 443
!
R1(config)# ip access-list extended TO-WEB
R1(config-ext-nacl)# 10 permit object-group WEB-PORTS any object-group WEB-SERVERS
R1(config-ext-nacl)# 20 deny ip any object-group WEB-SERVERS log
R1(config-ext-nacl)# 30 permit ip any any
```

**Why use object-groups if the device expands them into the same rules anyway?** Because humans maintain ACLs. Adding a third web server is now one line in `WEB-SERVERS`, and every rule that references the group picks it up. Without groups you'd hunt through the ACL for every rule mentioning the old servers and inevitably miss one. *Object-groups move the "what" (which hosts) away from the "policy" (what they may do).*

### `established` — the cheap return-traffic trick

```
R1(config)# ip access-list extended FROM-INTERNET
R1(config-ext-nacl)# permit tcp any 10.0.0.0 0.255.255.255 established
R1(config-ext-nacl)# deny ip any any log
```

`established` matches TCP segments with the **ACK or RST** bit set. Every TCP segment *except the very first SYN* of a connection has ACK set. So this lets replies to inside-initiated sessions back in, while blocking new connections initiated from outside.

**Why isn't this a firewall?** Because it's **stateless**. The router doesn't remember which connections actually exist; it just looks at flag bits, and an attacker can set ACK on a crafted packet to probe through. It also does nothing for UDP or ICMP replies. *It's a filter that trusts what the packet says about itself. A stateful firewall (18.4) remembers what really happened.*

### Placement at CCNP level

The CCNA placement rules still hold (extended near the source, standard near the destination). CCNP adds three refinements:

- **Infrastructure ACLs (iACLs)** at the network edge deny traffic *to your own device addresses* (loopbacks, link IPs) from the outside, except for what must reach them (BGP from your peer, for example). They protect the control plane before CoPP ever sees the packet.
- **Inbound beats outbound** where you have the choice: a packet denied inbound never consumes a route lookup.
- **`ip access-group` applies to transit traffic.** Outbound interface ACLs do **not** filter traffic the router itself generates. Protecting the router's own management uses `access-class` (17.1) and CoPP (17.6).

### IPv6 ACLs — the same idea with three differences

```
R1(config)# ipv6 access-list V6-EDGE-IN
R1(config-ipv6-acl)# permit tcp any host 2001:db8:20::10 eq 443
R1(config-ipv6-acl)# permit icmp any any nd-na              ! keep neighbor discovery working
R1(config-ipv6-acl)# permit icmp any any nd-ns
R1(config-ipv6-acl)# deny ipv6 any any log
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ipv6 traffic-filter V6-EDGE-IN in           ! not "access-group"
```

| Difference | IPv4 ACL | IPv6 ACL |
|------------|----------|----------|
| Types | Standard and extended | **Named extended only** |
| Address match | Wildcard masks | **Prefix lengths** (`2001:db8::/32`) |
| Applied with | `ip access-group` | **`ipv6 traffic-filter`** |
| Hidden lines at the end | `deny ip any any` | `permit icmp any any nd-na`, `permit icmp any any nd-ns`, **then** `deny ipv6 any any` |

**Why does IPv6 hide two permits before the implicit deny?** Because IPv6 has no ARP. Neighbor Discovery (NS/NA) is how neighbours find each other's MACs (CCNA guide 13.8), and it runs over ICMPv6. If the implicit deny blocked ND, any IPv6 ACL would break basic reachability on the link. **The trap:** those hidden permits sit *after* your last line. If you write your own explicit `deny ipv6 any any` at the end (to log it, say), you've placed it *above* the hidden ND permits, and you break neighbor discovery. *That's why the example above permits `nd-na` and `nd-ns` explicitly before its own deny.* Chapter 31 covers IPv6 filtering troubleshooting.

---

## 17.6 Control Plane Policing (CoPP)

![CoPP sits between the forwarding hardware and the route processor](images/c17_copp.png)

### Three planes, one weak spot

| Plane | What it does | Example traffic | Handled by |
|-------|--------------|-----------------|------------|
| **Data plane** | Forwards *through* the device | User packets | Forwarding hardware (ASIC/CEF) — fast |
| **Control plane** | Builds the forwarding tables | OSPF hellos, BGP updates, ARP, STP BPDUs | **The CPU** |
| **Management plane** | Lets people manage the device | SSH, SNMP, NTP, syslog | **The CPU** |

**Why does the CPU need its own protection?** A switch ASIC can forward tens or hundreds of gigabits per second. The CPU behind it can process only a few thousand packets per second. Any traffic *addressed to* the device, or that needs CPU handling (TTL expiry, ARP, IP options), is **punted** from the fast hardware up to that slow CPU. If an attacker, or just a loop or a misbehaving host, floods the box with SSH SYNs, pings or ARP, the CPU drowns. **When the CPU drowns, OSPF hellos go unanswered, neighbours time out, and the router drops off the network even though its forwarding hardware is idle.** *CoPP is a bouncer on the narrow staircase between the warehouse floor and the manager's office.*

### Building a CoPP policy with MQC

CoPP uses the same **Modular QoS CLI** you'll use for QoS in Chapter 11: **class-map** (what), **policy-map** (what to do), **service-policy** (where). The "where" is the special `control-plane` configuration mode.

**Step 1 — ACLs that identify the traffic** (a `permit` means *"belongs in this class"*, not "allow"):

```
ip access-list extended COPP-ROUTING
 permit ospf any any
 permit tcp any any eq bgp            ! BGP sessions in either direction:
 permit tcp any eq bgp any            !   to port 179 and from port 179
ip access-list extended COPP-MGMT
 permit tcp 10.99.0.0 0.0.0.255 any eq 22
 permit udp 10.99.0.0 0.0.0.255 any eq snmp
 permit udp any eq ntp any eq ntp
ip access-list extended COPP-ICMP
 permit icmp any any echo
 permit icmp any any echo-reply
 permit icmp any any ttl-exceeded
 permit icmp any any unreachable
```

**Step 2 — classes:**

```
class-map match-any CM-COPP-ROUTING
 match access-group name COPP-ROUTING
class-map match-any CM-COPP-MGMT
 match access-group name COPP-MGMT
class-map match-any CM-COPP-ICMP
 match access-group name COPP-ICMP
```

**Step 3 — policy: a rate per class:**

```
policy-map PM-COPP
 class CM-COPP-ROUTING
  police cir 1000000 conform-action transmit exceed-action transmit  ! measure, never drop
 class CM-COPP-MGMT
  police cir 512000 conform-action transmit exceed-action drop
 class CM-COPP-ICMP
  police cir 64000 conform-action transmit exceed-action drop       ! pings get a trickle
 class class-default
  police cir 128000 conform-action transmit exceed-action drop      ! everything unexpected
```

**The order of classes matters.** A policy-map is evaluated **top-down, and the first class that matches wins**. A packet that would match two classes is policed only by the first. So put the most specific classes first (routing, then management from known sources, then ICMP) and broader ones after them. `class-default` is always evaluated **last**, whatever position you type it in, and catches everything nothing else matched. *If a broad class like "all TCP" sat above the BGP class, BGP would be policed at the generic rate, and the routing class above would never see a packet.*

**Step 4 — attach it to the control plane:**

```
R1(config)# control-plane
R1(config-cp)# service-policy input PM-COPP
```

### The design reasoning behind each class

- **Routing gets generous treatment, often `exceed-action transmit`.** Dropping your own OSPF or BGP packets causes the very outage CoPP exists to prevent. Many designs police routing only to *measure* it at first, then tighten.
- **Management is restricted by source.** SSH from the management subnet is in `CM-COPP-MGMT`. SSH from anywhere else doesn't match that ACL, so it falls into `class-default` and gets the small rate.
- **ICMP gets a trickle.** You want ping and traceroute to work for troubleshooting, but a ping flood shouldn't eat the CPU.
- **`class-default` is the safety net**, and it must be policed, not left unlimited. Anything you didn't anticipate lands here. *An unpoliced class-default means CoPP protects you from everything except what you didn't think of, which is exactly what attackers use.*

**Why `permit` in a CoPP ACL never means "allow".** The ACL is only a classifier. `permit` puts a packet *into* the class, and the policer decides its fate. A `deny` line just means "not this class, try the next one." Nothing is ever dropped *by* the ACL. *Read CoPP ACLs as membership lists.*

### Verifying

```
R1# show policy-map control-plane
 Control Plane
  Service-policy input: PM-COPP
    Class-map: CM-COPP-ICMP (match-any)
      14520 packets, 1393920 bytes
      5 minute offered rate 61000 bps, drop rate 12000 bps
      Match: access-group name COPP-ICMP
      police:
          cir 64000 bps, bc 2000 bytes
        conformed 11201 packets, 1075296 bytes; actions:
          transmit
        exceeded 3319 packets, 318624 bytes; actions:
          drop
```

Read it as: *ICMP is arriving at ~61 kbps against a 64 kbps contract, and 3,319 packets have been dropped.* That's either an attack or a monitoring system pinging too aggressively, and now you know which class to investigate. A climbing `exceeded` count on the **routing** class is a design error: the rate is too low for your network.

> 🔬 **Platform note.** On Catalyst 9000 switches, CoPP is **on by default** as a system-defined policy (`system-cpp-policy`). You tune its per-queue rates (`show policy-map system-cpp-policy`) rather than attaching your own policy to `control-plane`. Routers (ISR/ASR/Catalyst 8000) use the user-defined MQC policy shown above. Both follow the same idea: classify punted traffic and rate-limit it per class.

---

## 17.7 Putting It Together — A Hardening Checklist

| Layer | Control | Section |
|-------|---------|---------|
| Doors | SSH only, `access-class`, `exec-timeout`, AUX disabled, all VTY ranges covered | 17.1 |
| Identity | scrypt secrets, local fallback admin, `login block-for` | 17.1, 17.2 |
| Central policy | `aaa new-model`, TACACS+ group with loopback source, local fallback | 17.3 |
| Least privilege | exec + command authorization, command accounting | 17.4 |
| Transit filtering | iACLs at the edge, object-group based policy ACLs, IPv6 equivalents | 17.5 |
| CPU protection | CoPP with routing / management / ICMP / default classes | 17.6 |

*Each layer assumes the one before it might fail. That's the defense-in-depth idea Chapter 18 applies to the whole network.*

---

<a name="chapter-18"></a>
# Chapter 18: Security Design & REST API Security

> **Blueprint:** ENCOR 5.3 — Describe REST API security; ENCOR 5.4.a — Threat defense; ENCOR 5.4.b — Endpoint security; ENCOR 5.4.c — Next-generation firewall; ENCOR 5.4.d — TrustSec and MACsec

Chapter 17 hardened **one device**. This chapter zooms out to the **whole network**: which security components exist, where each one sits, and what each catches that the others miss. Then it zooms back in on something you'll use daily as automation grows (Chapters 19–21): the **APIs** that controllers and devices expose, and how they're secured.

The blueprint verb here is **describe**, so the exam wants you to know what each piece is for and how the pieces fit together. You won't be configuring a firewall policy. The exception is TrustSec and MACsec, where you should know the mechanics well enough to explain a packet's journey.

---

## 18.1 Defense in Depth — Why One Wall Is Never Enough

**Story Time 📖:** A medieval castle didn't rely on its outer wall. It had a moat, the wall, a gatehouse, guards inside, a keep, and locked rooms in the keep. An attacker who climbed the wall still had five more problems. *Each layer assumes the one before it has already failed.*

Modern networks work the same way, for a reason the castle builders never faced: **the attacker is often already inside.** A phishing email lands on a laptop, a contractor plugs in an infected device, a cloud app is compromised. The old model of a hard perimeter firewall around a soft trusted inside fails the moment anything inside is compromised, because everything inside trusts everything else.

| Stage of an attack | What defends against it | Component (this chapter) |
|--------------------|-------------------------|--------------------------|
| Before — reaching you | Block known-bad destinations and senders | DNS-layer security, email security, threat intelligence |
| At the edge | Inspect and control traffic crossing boundaries | Next-generation firewall (18.4) |
| Getting onto the network | Prove identity and health before granting access | ISE, 802.1X, posture (18.3) |
| Moving inside | Limit who can talk to whom | TrustSec segmentation (18.5) |
| On the host | Detect and stop malicious behaviour on the device | Endpoint security (18.3) |
| On the wire | Stop eavesdropping and tampering on links | MACsec (18.6) |
| After — already in | Spot abnormal behaviour and contain it | Network analytics (NetFlow-based), retrospective file analysis |

**Why the "before, during, after" framing?** No single control catches everything, so the design question isn't "is it blocked?" but "how quickly do we see it and how far can it spread?" *Prevention fails sometimes; detection and containment are what limit the damage when it does.*

This is the thinking behind **zero trust**: *never trust because of location, always verify identity and posture, and grant the least access needed.* TrustSec (18.5) and ISE are Cisco's main tools for building it into the campus.

---

## 18.2 Threat Defense — The Cisco Secure Portfolio

The exam expects you to recognise the main products and what each one contributes. Several were renamed, so you'll see both names in study material:

| Component | Older name | What it does |
|-----------|-----------|--------------|
| **Cisco Talos** | — | Cisco's threat-intelligence organisation. It researches threats and feeds verdicts (bad IPs, domains, file hashes, IPS signatures) into **every** product below. |
| **Cisco Secure Firewall** | Firepower / FTD | Next-generation firewall and IPS (18.4). Managed by Firewall Management Center (FMC) or cloud-delivered management. |
| **Cisco Umbrella** / **Cisco Secure Access** | OpenDNS | **DNS-layer security**: blocks lookups to malicious domains *before* a connection exists. Secure Access is the broader cloud **SSE** (Security Service Edge) service: secure web gateway, cloud firewall, CASB and zero-trust access. |
| **Cisco Secure Endpoint** | AMP for Endpoints | Endpoint detection and response on laptops and servers (18.3) |
| **Cisco Secure Malware Analytics** | Threat Grid | **Sandbox**: detonates suspicious files in an isolated VM and reports what they do |
| **Cisco Secure Network Analytics** | Stealthwatch | Collects **NetFlow** (Chapter 15) from the network and uses behaviour modelling to spot anomalies: data exfiltration, scanning, unusual peers |
| **Cisco Secure Email** | ESA | Filters phishing, spam and malicious attachments |
| **Cisco ISE** | — | **Identity Services Engine**: the policy brain for network access. It handles 802.1X/MAB authentication, posture, guest access, profiling, and assigns TrustSec tags (18.5). |
| **Cisco Secure Web Appliance** | WSA (Web Security Appliance) | On-premises **web proxy**: URL filtering, malware scanning of downloads, application visibility for HTTP/HTTPS |
| **Cisco Secure Client** | AnyConnect | The endpoint **VPN client** and agent bundle: remote-access VPN, ISE posture module, Umbrella roaming module, Secure Endpoint connector |
| **Cisco Duo** | — | **Multi-factor authentication** and device-trust checks for applications, VPN and admin logins — the "something you have" factor |
| **Cisco XDR** | SecureX | **Extended detection and response**: correlates telemetry from endpoint, network, firewall, email and cloud into one incident view, with automated response actions |

**Why is DNS-layer security such an effective early control?** Almost every connection starts with a DNS lookup, including malware calling home to its command-and-control server. If the resolver refuses to answer for a known-bad domain, the connection never happens. This works for every port and protocol, and it covers devices that can't run an agent. *Blocking at DNS stops the attack before any packet of it exists.*

**Why does Secure Network Analytics use NetFlow instead of inspecting packets?** Because NetFlow records exist on every router and switch already, and they're cheap. Inspecting full packets everywhere is impossible at campus scale, and encryption hides payloads anyway. Flow records show *who talked to whom, how much, and when*. That's enough to spot an internal host suddenly sending 40 GB to an unknown country at 3 a.m. *Metadata catches behaviour that payload inspection misses, including inside encrypted traffic.*

---

## 18.3 Endpoint Security and Posture

The endpoint is where most attacks actually execute, so it needs its own defence:

- **Endpoint protection / EDR (Cisco Secure Endpoint):** a lightweight agent on the host checks files against cloud verdicts (from Talos) at execution, watches behaviour (a Word document spawning PowerShell, for example), and can **quarantine** files or isolate the host. Its standout feature is **retrospective security**. If a file that was considered clean last week is later convicted, the system knows every machine where it ran and can act on all of them.
- **Posture assessment (ISE + Secure Client agent):** before granting full network access, ISE checks the device's **health**: Is the OS patched? Is antivirus running and current? Is the disk encrypted? A non-compliant device can be placed in a **remediation** VLAN or given a restricted policy until it's fixed.
- **Profiling:** ISE identifies *what* a device is (IP phone, printer, camera) from DHCP, CDP/LLDP, HTTP and similar clues. Devices that can't do 802.1X still get an appropriate policy, usually via MAB (MAC Authentication Bypass).

### 802.1X — the identity check at the switch port

The CCNA guide (18.6) introduced 802.1X as "the bouncer at the port". CCNP expects the moving parts by name:

| Role | Who plays it | Does what |
|------|--------------|-----------|
| **Supplicant** | Software on the endpoint (Windows/macOS native, Secure Client) | Presents credentials |
| **Authenticator** | The access switch (or WLC) | Relays between the two — never checks credentials itself |
| **Authentication server** | A RADIUS server, usually **ISE** | Decides, and returns the policy (VLAN, downloadable ACL, SGT) |

Two protocols carry the conversation: **EAPOL** (EAP over LAN, EtherType 0x888E) between supplicant and switch, and **RADIUS** (UDP 1812/1813) between switch and ISE. The switch unwraps EAP from EAPOL and re-wraps it in RADIUS. Until authentication succeeds, an 802.1X port passes **only EAPOL** (plus whatever the deployment mode allows, below).

The **EAP method** decides what credential is proven, and how:

| EAP method | Credentials | Notes |
|------------|-------------|-------|
| **EAP-TLS** | Certificates on **both** client and server | Strongest; no passwords at all; needs a PKI to issue client certs |
| **PEAP** (usually with MSCHAPv2 inside) | Server certificate + username/password | Builds a TLS tunnel using only the server's cert, then runs the password exchange inside it |
| **EAP-FAST** | Protected Access Credential (PAC) or certs | Cisco-designed tunnel method; supports **EAP chaining** |
| **EAP chaining** (EAP-FAST, or the standard **TEAP**) | Machine **and** user credentials in one session | Lets ISE require "a corporate laptop *and* a valid employee", not just one of them |

Not everything can run a supplicant. Printers, cameras and badge readers fall back to **MAB (MAC Authentication Bypass)**: the switch sends the device's MAC address to ISE as the identity, and ISE checks it against its profiling database. MAB is weak on its own because MACs are easily spoofed, which is why it's paired with profiling and a restricted policy. Guests and BYOD users get **WebAuth**, where the switch redirects the browser to a login or acceptable-use portal (usually ISE's central WebAuth).

```
R1(config)# aaa new-model
R1(config)# aaa authentication dot1x default group ISE-RADIUS
R1(config)# aaa authorization network default group ISE-RADIUS  ! lets ISE push VLAN/ACL/SGT
R1(config)# aaa accounting dot1x default start-stop group ISE-RADIUS
R1(config)# dot1x system-auth-control                         ! global on-switch for 802.1X
!
R1(config)# interface GigabitEthernet1/0/10
R1(config-if)# switchport mode access
R1(config-if)# switchport access vlan 10
R1(config-if)# authentication host-mode multi-auth     ! each MAC behind the port authenticates
R1(config-if)# authentication order dot1x mab          ! try 802.1X first, then MAB
R1(config-if)# authentication priority dot1x mab       ! if both succeed, 802.1X wins
R1(config-if)# authentication port-control auto        ! actually enforce
R1(config-if)# dot1x pae authenticator
R1(config-if)# mab
```

**Why separate `order` from `priority`?** `order` is the sequence the switch *tries* methods in. `priority` decides which result *wins* if a later attempt succeeds too. With `order mab dot1x` (MAB first, for faster printer onboarding) plus `priority dot1x mab`, a laptop that MAB'd onto a restricted policy can still be upgraded the moment its supplicant completes 802.1X. *Order is about speed; priority is about trust.*

Deployments roll out in three stages, because turning on enforcement on day one locks out every device you forgot about:

| Mode | Config idea | Effect |
|------|-------------|--------|
| **Monitor mode** | `authentication open` | Authenticate and log everything, but **forward all traffic** whether it passes or fails. Pure visibility. |
| **Low-impact mode** | `authentication open` + a **pre-auth port ACL** | Limited access (DHCP, DNS, ISE) before authentication; full access after |
| **Closed mode** | Default 802.1X behaviour | Nothing but EAPOL until authenticated |

Newer IOS XE uses the **IBNS 2.0** style (`access-session` commands and C3PL policy maps) for the same functions. The concepts are identical; only the syntax differs.

**Posture** builds on this: after 802.1X or MAB authentication, ISE can hold the device in a restricted state, have the Secure Client posture module report its health, and then issue a **Change of Authorization (CoA)** that moves it to full access, or to remediation if it fails.

**Why check posture rather than just identity?** Because a valid user on an infected or unpatched laptop is still a threat. Authentication proves *who* is connecting, and posture proves the *device* is in a safe state. *Zero trust verifies both, every time.*

---

## 18.4 Next-Generation Firewalls

### What "next-generation" adds

A **traditional stateful firewall** tracks connections. It knows that a returning packet belongs to a session an inside host started, which is something the stateless ACL `established` trick (17.5) cannot do. But it decides purely on **IP addresses, protocols and ports** (Layers 3–4).

**Why isn't that enough anymore?** Because ports stopped meaning anything. Almost everything — web apps, file sharing, video, malware command-and-control — runs over **TCP 443**. A rule that says "permit 443" permits all of it. A port-based firewall can't distinguish your CRM from a cloud file-sharing service leaking data, or from a botnet's encrypted check-in.

A **next-generation firewall (NGFW)** keeps the stateful engine and adds layers of understanding:

| Capability | What it adds | Example policy it enables |
|------------|--------------|---------------------------|
| **Stateful inspection** | Connection tracking (the baseline) | Return traffic allowed automatically |
| **Application visibility and control (AVC)** | Identifies the *application* regardless of port (thousands of app signatures) | "Allow Webex, block BitTorrent, even on 443" |
| **Intrusion prevention (IPS)** | Signature and anomaly matching for exploits (Snort engine on Secure Firewall) | Drop an exploit against an unpatched server |
| **URL filtering** | Categorises and scores websites | Block gambling and newly registered domains |
| **Advanced malware protection** | File-hash reputation, sandboxing of unknown files | Block a known-bad PDF mid-download |
| **Identity awareness** | Rules by user or group (from ISE or AD) | "Finance can reach the ERP; contractors cannot" |
| **TLS decryption** (optional) | Inspect inside encrypted sessions | Required for IPS or malware inspection of HTTPS content |

**Why is TLS decryption the uncomfortable trade-off?** Without it, the NGFW sees only the server name and certificate of most traffic, so IPS and file inspection are mostly blind. With it, the firewall becomes a deliberate man-in-the-middle, with real costs in performance, privacy (banking and health sites are usually exempted), and certificate management on every endpoint. *Designs usually decrypt selectively, by risk category.*

### Where firewalls sit

| Placement | Protects |
|-----------|----------|
| **Internet edge** | The classic north–south boundary |
| **Data-centre edge / internal segmentation** | East–west traffic between zones (users ↔ servers, PCI zone) |
| **Branch** (often inside SD-WAN routers, Chapter 14) | Direct internet access without backhauling to HQ |
| **Cloud** (virtual NGFW or cloud-delivered firewall) | Workloads and users that never touch your hardware |

---

## 18.5 Cisco TrustSec — Segmentation by Role, Not by IP

![TrustSec: classify at the edge, carry the tag, enforce at egress](images/c18_trustsec.png)

### The problem it solves

Traditional segmentation ties policy to **IP addresses**: "10.1.20.0/24 may reach 10.50.0.0/24 on 443". That works until users move, subnets are reused, and the rule list grows to thousands of lines on dozens of devices, each a copy that can drift. *IP addresses describe where something is, but policy is really about what something is.*

**TrustSec** gives every packet a label describing the role of its sender. That label is a **Security Group Tag (SGT)**, a **16-bit** number such as 10 = Employees, 20 = Contractors, 30 = PCI-Servers. Policy is then written between **groups**: "Contractors → PCI-Servers: deny." It doesn't matter which IP, VLAN or building the contractor is in today.

### Three functions: classify, propagate, enforce

**1. Classification — the tag is assigned where traffic enters**

| Method | How |
|--------|-----|
| **Dynamic** | ISE returns the SGT as an authorization result after 802.1X or MAB. *The usual method for users and endpoints.* |
| **Static** | Mapped by configuration: IP/subnet → SGT, VLAN → SGT, or port → SGT. *For servers and devices that never authenticate.* |

**2. Propagation — the tag must reach the enforcement point**

| Method | How it carries the tag | Requirement |
|--------|------------------------|-------------|
| **Inline tagging** | The SGT rides in the frame itself, in a **Cisco Meta Data (CMD)** field inserted in the Ethernet header (EtherType **0x8909**) | Every hop must support TrustSec hardware. Often protected by MACsec. |
| **SXP** (SGT Exchange Protocol) | The *IP-to-SGT mappings* are sent over a **TCP (port 64999)** control-plane connection from devices that can't tag to devices that can enforce | Works across non-TrustSec hardware. Scales less well. |

In SD-Access (Chapter 14), the SGT is carried in the **VXLAN header's group policy field** (Chapter 13). That's the same concept on an overlay.

**3. Enforcement — usually at egress**

The switch or firewall nearest the **destination** looks up *(source SGT, destination SGT)* in a matrix downloaded from ISE and applies a **Security Group ACL (SGACL)**:

| Source ↓ / Destination → | Employees (10) | PCI-Servers (30) | Printers (40) |
|--------------------------|----------------|------------------|---------------|
| **Employees (10)** | permit | deny | permit |
| **Contractors (20)** | deny | deny | permit |

**Why enforce at egress rather than ingress?** Because the ingress switch knows the source's group but not necessarily the destination's. The egress device, close to the destination, knows both. It also means the matrix is pushed only to devices that protect a given group, not to every access switch. *Classify where you know the source, enforce where you know the destination.*

**Why is this simpler than ACLs at scale?** An IP-based policy for 10 groups across 50 subnets could need thousands of ACL entries copied to many devices. The SGT matrix for 10 groups has at most 100 cells, defined once in ISE. A new subnet, a moved user or a re-IP'd server needs **no policy change**, because their group didn't change.

---

## 18.6 MACsec — Encrypting the Wire

**MACsec (IEEE 802.1AE)** encrypts Ethernet frames at **Layer 2**, link by link, at line rate in switch hardware.

| Property | Detail |
|----------|--------|
| Standard | IEEE **802.1AE** (encryption); keys agreed by **MKA** — MACsec Key Agreement, IEEE **802.1X-2010** |
| Cipher | AES-GCM, 128- or 256-bit — confidentiality **and** integrity |
| Scope | **Hop by hop**: encrypted on each link, decrypted inside each device, re-encrypted on the next link |
| What's protected | Everything after the source MAC, including the 802.1Q tag and the CMD/SGT field. The MAC addresses stay visible so switching works. |
| Overhead | A SecTAG header (8–16 bytes) plus a 16-byte integrity check value (ICV): up to 32 bytes per frame. Mind your MTU. |

### Two deployment shapes

- **Host-to-switch (downlink):** the endpoint authenticates with **802.1X**, ISE indicates MACsec is required, and the derived keys feed **MKA**. The cable from desk to closet, the easiest place to tap, is now encrypted.
- **Switch-to-switch (uplink):** between network devices, typically with **MKA using a pre-shared key** (or 802.1X between switches). Protects trunks running through shared risers, between buildings, or across a provider's dark fibre.

**Why hop-by-hop instead of end-to-end like IPsec?** Because the network *needs* to look inside frames at every hop: to read the SGT for enforcement, apply QoS, run NetFlow and do security inspection. IPsec (Chapter 12) hides the payload from everything in the middle, which is right across an untrusted WAN but wrong inside your own campus. MACsec protects each **wire** while every **device** still sees the traffic. *IPsec protects a conversation across someone else's network; MACsec protects the cables in your own.*

**Why MACsec and TrustSec go together.** An inline SGT in clear text could be forged by anyone who taps the link and rewrites the tag. MACsec's integrity check makes the tag tamper-proof between trusted devices.

---

## 18.7 REST API Security

Controllers like Catalyst Center and SD-WAN Manager (Chapter 20), and devices running RESTCONF, expose **REST APIs** that can reconfigure the entire network. *An API is an administrator's CLI without the human.* It needs every protection an admin login gets, plus some that only matter when the caller is a program.

### The building blocks

| Control | What it does | Why it matters for APIs |
|---------|--------------|-------------------------|
| **Transport encryption — HTTPS/TLS** | Encrypts and integrity-protects every request and response | Credentials and tokens travel in headers on every call; over plain HTTP they're readable by anyone on the path |
| **Authentication** | Proves *who* is calling (methods below) | Anonymous APIs that change config are a gift to attackers |
| **Authorization (RBAC)** | Decides *what* that caller may do: read-only, specific sites, specific APIs | A monitoring script should never hold credentials that can delete devices |
| **Rate limiting / throttling** | Caps requests per client per time window (often returning **429 Too Many Requests**) | Protects the controller from runaway scripts and brute force |
| **Input validation** | Rejects malformed or unexpected payloads (returning **400**) | Blocks injection attacks and stops a bad automation run corrupting config |
| **Logging and auditing** | Records who called what, when, from where | APIs are invisible otherwise, and accountability matters as much as for CLI changes (17.4) |
| **Certificate validation** | The *client* verifies the server's certificate | Without it the client can be tricked into sending credentials to an impostor. `verify=False` in a lab script is fine; in production it's a vulnerability. |

### Authentication methods compared

| Method | How it works | Strengths | Weaknesses |
|--------|--------------|-----------|------------|
| **HTTP Basic** | `Authorization: Basic <base64(user:pass)>` on every request | Simple; used by RESTCONF on IOS XE | Base64 is **encoding, not encryption**. Safe only inside TLS, and the real password travels on every call. |
| **API key** | A long static secret in a header or query string | Easy for service-to-service use | Usually long-lived. A leaked key works until someone notices and rotates it. |
| **Token (session) based** | Authenticate once (usually Basic), receive a **token**, send the token on later calls, e.g. Catalyst Center's `X-Auth-Token` (Chapter 20) | The password crosses the wire once. Tokens expire. | You must handle token expiry and refresh. |
| **OAuth 2.0** | An authorization server issues **scoped**, short-lived **access tokens** (often JWT bearer tokens) after the user or app authenticates; **refresh tokens** obtain new ones | Delegation without sharing passwords, fine-grained scopes, central revocation | More moving parts |

**Why do tokens expire?** Because every credential eventually leaks: into a log file, a screenshot, a Git commit. A password or static key that leaks stays valid until someone notices. A token that expires after an hour (Catalyst Center's tokens are valid for about 60 minutes by default) limits the attacker's window to the remainder of that hour. *Short-lived credentials turn a breach into an inconvenience.*

**Why is Base64 in Basic auth so often misread as encryption?** Because the header looks scrambled: `YWRtaW46Q2lzY28xMjM=`. But anyone can decode it instantly to `admin:Cisco123`. Basic auth provides **no confidentiality on its own**; all of its safety comes from the TLS around it.

**Secret hygiene for the caller.** Most API breaches aren't clever attacks on the controller. They're credentials leaking from the *client* side:

- **Never hardcode credentials** in scripts. Read them from environment variables or a secrets vault (HashiCorp Vault, a cloud secrets manager, Ansible Vault), so the code can be shared and committed safely.
- **Keep keys out of URLs.** An API key in a query string (`?api_key=...`) gets written to web-server access logs, proxy logs and browser history. Send it in a header instead.
- **Least privilege per integration.** One service account per script, scoped to exactly what it needs, so a leak can be revoked without breaking everything else.
- **Rotate** keys and secrets on a schedule, and immediately when someone leaves or a leak is suspected.

> **Exam focus:** expect questions that pair a scenario with a control: "a script is overloading the controller" → **rate limiting**; "credentials visible in a packet capture" → **HTTPS/TLS**; "a read-only monitoring tool changed configuration" → **authorization / RBAC**; "a stolen credential remained usable for months" → **expiring tokens / OAuth 2.0**.

---

<a name="chapter-19"></a>
# Chapter 19: Python & JSON for Network Engineers

> **Blueprint:** ENCOR 6.1 — Interpret basic Python components and scripts; ENCOR 6.2 — Construct valid JSON-encoded files

The verbs in this blueprint matter. **Interpret** Python means you'll be shown a script and asked what it does, what it prints, or why it fails. You won't have to write one from scratch. **Construct** JSON means you must be able to produce, or spot, **valid** JSON exactly. So this chapter teaches reading Python fluently and writing JSON without a single mistake.

You'll use both constantly in Chapter 20 (RESTCONF and controller APIs return JSON) and Chapter 21 (Ansible). *Python is the language you automate in; JSON is the language the network answers in.*

---

## 19.1 Why Python, and How a Script Runs

Python is **interpreted**: you run `python3 script.py`, and the interpreter reads the file **top to bottom**, executing each line as it reaches it. Two consequences matter when you read scripts:

- **A function's body runs only when it's *called*,** not when the interpreter reaches its `def` line. A `def` just defines it.
- **Indentation is syntax.** Python has no `{ }` braces. The lines that belong to a loop, `if` or function are the ones indented beneath it. Four spaces is the convention. Get it wrong and you get an `IndentationError`, or worse, code that runs in the wrong block.

**Why did the network industry settle on Python?** Readability (it reads close to English), a huge library ecosystem for networking (`requests`, `netmiko`, `ncclient`, `napalm`, Ansible itself), and it's preinstalled on most Linux systems, including the Guest Shell on IOS XE. *The libraries are the real reason: someone has already written the hard part.*

---

## 19.2 Variables and Data Types

A variable is a **name pointing at a value**. There's no declaration, and the type comes from the value:

```python
hostname = "R1"            # str   — text, in single or double quotes
vlan_id = 20               # int   — whole number
cpu_load = 37.5            # float — decimal number
is_up = True               # bool  — True or False (capitalised!)
next_hop = None            # None  — "no value"
```

| Type | Example | Notes |
|------|---------|-------|
| `str` | `"GigabitEthernet1"` | Immutable. `+` concatenates. `len()` gives the length. |
| `int` | `1500` | `"1500"` (str) is **not** the same as `1500` (int) |
| `float` | `99.9` | |
| `bool` | `True`, `False` | |
| `list` | `["R1", "R2", "R3"]` | Ordered, changeable, indexed from **0** |
| `dict` | `{"name": "R1", "asn": 65001}` | **Key → value** pairs; the workhorse for API data |
| `tuple` | `("10.0.0.1", 22)` | Like a list but immutable |
| `None` | `None` | Python's "nothing" — becomes `null` in JSON |

**The classic type trap:**

```python
mtu = "1500"
print(mtu + 100)       # TypeError: can only concatenate str (not "int") to str
print(int(mtu) + 100)  # 1600
```

**Why does this come up constantly in network scripts?** Because everything a device sends as CLI output is text. `"1500"` scraped from `show interface` is a string until you convert it with `int()`. JSON from an API, by contrast, often *does* carry real numbers. *Always know whether you're holding text or a number.*

### Arithmetic — three kinds of division

```python
print(7 / 2)     # 3.5   — "/" ALWAYS returns a float, even 8 / 2 gives 4.0
print(7 // 2)    # 3     — floor division: round DOWN to a whole number
print(7 % 2)     # 1     — modulo: the remainder
print(-7 // 2)   # -4    — floor goes down, toward negative infinity, not toward zero
print(2 ** 10)   # 1024  — exponent
```

*Exam trap:* `print(8 / 2)` prints `4.0`, not `4`. If the question's answer choices include both, the float is the right one.

### Sets — unique values only

```python
vlans = {10, 20, 20, 30}       # duplicates vanish
print(len(vlans))              # 3
a = {10, 20, 30}
b = {20, 30, 40}
print(a & b)                   # {20, 30}  — in both (intersection)
print(a - b)                   # {10}      — in a but not b
```

A set is unordered and holds each value once. Scripts use it to answer "which VLANs exist on SW1 but not SW2?" in one line. `{}` on its own is an empty **dict**, not a set; an empty set is `set()`.

---

## 19.3 Strings and f-strings

```python
intf = "GigabitEthernet1"
print(intf.lower())               # gigabitethernet1
print(intf.startswith("Gig"))     # True
print(intf[0:3])                  # Gig   (slice: index 0 up to, not including, 3)
print("10.1.1.1/24".split("/"))   # ['10.1.1.1', '24']
print(" R1 \n".strip())           # R1    (removes surrounding whitespace)

vlan = 20
name = "USERS"
print(f"vlan {vlan}\n name {name}")   # f-string: {} evaluates the expression inside
```

Output of the last line:

```
vlan 20
 name USERS
```

**f-strings** (the `f` before the quote) are how scripts build CLI commands and URLs:

```python
host = "10.0.0.1"
url = f"https://{host}/restconf/data/ietf-interfaces:interfaces"
```

### The two older formatting styles

f-strings arrived in Python 3.6. Older scripts, and plenty of exam snippets, use `.format()` or the `%` operator. All three produce the same text:

```python
sw, count = "SW1", 3
print(f"{sw} has {count} uplinks")
print("{} has {} uplinks".format(sw, count))     # {} filled left to right
print("{0} has {1} uplinks, {0}!".format(sw, count))  # numbered: reuse an argument
print("%s has %d uplinks" % (sw, count))         # %s = string, %d = integer
```

Every line prints `SW1 has 3 uplinks` (the third adds `, SW1!`). Format specs work in all of them: `f"{port:>4}"` right-aligns in 4 characters, and `f"{util:.1f}"` shows one decimal place (`37.46` → `37.5`).

---

## 19.4 Lists and Dictionaries

### Lists — ordered collections

```python
routers = ["R1", "R2", "R3"]
print(routers[0])       # R1   — first item is index 0
print(routers[-1])      # R3   — negative counts from the end
routers.append("R4")    # add to the end
print(len(routers))     # 4
print("R2" in routers)  # True
```

### Dictionaries — key/value lookups

```python
device = {
    "hostname": "R1",
    "mgmt_ip": "10.0.0.1",
    "interfaces": ["Gi1", "Gi2"],
}
print(device["hostname"])            # R1
print(device["interfaces"][1])       # Gi2   — dict, then list index
device["os"] = "IOS-XE"              # add a key
print(device.get("serial"))          # None — .get() doesn't crash on a missing key
print(device["serial"])              # KeyError: 'serial'
```

Three methods walk a dict:

```python
device = {"hostname": "R1", "mgmt_ip": "10.0.0.1"}
print(list(device.keys()))     # ['hostname', 'mgmt_ip']
print(list(device.values()))   # ['R1', '10.0.0.1']
for key, value in device.items():
    print(f"{key}={value}")    # hostname=R1  then  mgmt_ip=10.0.0.1
```

Dicts keep **insertion order** (guaranteed since Python 3.7), so `items()` returns keys in the order they were added.

### List comprehensions — a loop in one line

```python
intfs = [{"name": "Gi1", "status": "up"},
         {"name": "Gi2", "status": "down"},
         {"name": "Gi3", "status": "up"}]
up = [i["name"] for i in intfs if i["status"] == "up"]
print(up)                      # ['Gi1', 'Gi3']
```

Read it right to left: *for each `i` in `intfs`, if its status is up, keep `i["name"]`.* It's exactly equivalent to a four-line `for` loop with `append()`.

**Why are dictionaries *the* data structure of network automation?** Because API responses are nested key/value structures, and JSON maps one-to-one onto Python dicts and lists (19.9). Reading API output in Python is mostly chaining lookups: `data["response"][0]["hostname"]`. *When you see a chain of square brackets in a script, read it left to right as "open this, then open that inside it."*

---

## 19.5 Conditionals and Loops

```python
cpu = 85
if cpu > 90:
    print("critical")
elif cpu > 75:
    print("warning")          # this one runs — the first true branch wins
else:
    print("ok")
```

Comparison operators: `==` (equal; `=` is *assignment*), `!=`, `>`, `<`, `>=`, `<=`. Logical: `and`, `or`, `not`. Membership: `in`.

### `for` loops — once per item

```python
for vlan in [10, 20, 30]:
    print(f"vlan {vlan}")

for name, ip in {"R1": "10.0.0.1", "R2": "10.0.0.2"}.items():
    print(name, ip)            # R1 10.0.0.1 / R2 10.0.0.2

for i in range(3):             # 0, 1, 2 — range stops BEFORE its argument
    print(i)
```

`range()` takes up to three arguments: `range(stop)`, `range(start, stop)`, `range(start, stop, step)`. The stop value is **never** included:

```python
print(list(range(1, 4)))         # [1, 2, 3]
print(list(range(10, 31, 10)))   # [10, 20, 30]
print(list(range(5, 0, -1)))     # [5, 4, 3, 2, 1]  — counting down
```

`enumerate()` gives you a counter alongside each item, so you don't keep one by hand:

```python
for index, sw in enumerate(["SW1", "SW2"], start=1):
    print(index, sw)             # 1 SW1   then   2 SW2
```

### Nested loops — predict the output

```python
for sw in ["SW1", "SW2"]:
    for port in range(1, 3):
        print(f"{sw}-Gi1/0/{port}")
```

The **inner** loop runs completely for each turn of the outer loop:

```
SW1-Gi1/0/1
SW1-Gi1/0/2
SW2-Gi1/0/1
SW2-Gi1/0/2
```

*Count lines before reading them:* 2 switches × 2 ports = 4 lines. If an answer choice has a different number of lines, eliminate it.

### `while` loops — repeat while a condition holds

```python
retries = 0
while retries < 3:
    retries += 1               # same as retries = retries + 1
print(retries)                 # 3
```

`break` leaves a loop immediately. `continue` skips to the next iteration.

---

## 19.6 Functions, Imports and Exceptions

### Functions

```python
def build_vlan(vlan_id, name="UNNAMED"):     # name has a default value
    return f"vlan {vlan_id}\n name {name}"

print(build_vlan(30, "VOICE"))
print(build_vlan(40))                        # uses the default: name UNNAMED
```

A function **returns** a value with `return`. If it has no `return`, it returns `None`. That's a classic "predict the output" trap when someone writes `result = print_something()`.

### Imports

```python
import json                              # whole module: use as json.loads(...)
import requests
from netmiko import ConnectHandler       # one name from a module
from ncclient import manager
```

| Library | What it does |
|---------|--------------|
| `requests` | HTTP client for REST APIs (RESTCONF, Catalyst Center, SD-WAN Manager) |
| `json` | Convert between JSON text and Python objects (standard library) |
| `netmiko` | SSH to devices and send CLI commands (screen-scraping, made robust) |
| `ncclient` | NETCONF client (Chapter 20) |

### Exceptions — handling failure without crashing

```python
try:
    response = requests.get(url, timeout=5)
    response.raise_for_status()      # turns 4xx/5xx status codes into an exception
except requests.exceptions.Timeout:
    print("device did not answer")
except requests.exceptions.HTTPError as err:
    print(f"API error: {err}")
finally:
    print("done")                    # runs whether or not there was an error
```

The full form has four clauses, and each runs at a different time:

| Clause | Runs when |
|--------|-----------|
| `try:` | Always — the code that might fail |
| `except X:` | Only if an exception of type X was raised in `try` |
| `else:` | Only if `try` finished **without** an exception |
| `finally:` | **Always**, last, error or not — used for cleanup like closing sessions |

```python
try:
    vlan = int("20")
except ValueError:
    print("not a number")
else:
    print(f"vlan {vlan} ok")     # runs: no exception happened
finally:
    print("checked")             # always runs
```

Output: `vlan 20 ok` then `checked`. Change `"20"` to `"twenty"` and the output becomes `not a number` then `checked`.

**Why does production automation wrap every network call in `try`?** Because networks fail: a device is down, a password expired, an API returns 503 while it upgrades. A script pushing a change to 300 devices must not die at device 47 and leave you guessing which ones changed. *Catch the failure, record it, move on, and report at the end.*

### `if __name__ == "__main__":`

You'll see this at the bottom of almost every real script:

```python
def main():
    print("collecting inventory")

if __name__ == "__main__":
    main()
```

Python sets the special variable `__name__` to `"__main__"` when a file is **run directly** (`python inventory.py`), and to the module's name when the file is **imported** by another script. So the guarded block runs only when you run the file, not when someone imports its functions to reuse them. *It means "if this file is the program, start here."*

---

## 19.7 Reading a Real Script — Line by Line

This is the shape of exam question you should expect. Read it, then predict the output:

```python
import requests

requests.packages.urllib3.disable_warnings()     # lab: silence self-signed cert warnings

HOST = "10.0.0.1"
URL = f"https://{HOST}/restconf/data/ietf-interfaces:interfaces"
HEADERS = {"Accept": "application/yang-data+json"}

def get_interfaces():
    resp = requests.get(URL, headers=HEADERS, auth=("admin", "Cisco123"), verify=False)
    if resp.status_code == 200:
        return resp.json()["ietf-interfaces:interfaces"]["interface"]
    print(f"Error {resp.status_code}")
    return []

for intf in get_interfaces():
    state = "up" if intf["enabled"] else "down"
    print(f'{intf["name"]:<20}{state}')
```

| Line(s) | What it does |
|---------|--------------|
| `import requests` | Loads the HTTP library |
| `disable_warnings()` | Suppresses the warning that the certificate isn't verified (because `verify=False` below). Fine in a lab, a security gap in production (18.7). |
| `URL = f"..."` | Builds the RESTCONF URL for the `ietf-interfaces` YANG model (Chapter 20) |
| `HEADERS` | Asks for **JSON** encoding of the YANG data |
| `def get_interfaces():` | Defines a function; nothing runs yet |
| `requests.get(...)` | Sends an HTTPS GET with Basic auth. `resp` holds status code, headers and body. |
| `resp.status_code == 200` | 200 = OK (the full code list is in 20.7) |
| `resp.json()[...]["interface"]` | Parses the JSON body into a dict, then digs down to the **list** of interfaces |
| `for intf in get_interfaces():` | *Now* the function runs; the loop walks the returned list |
| `"up" if ... else "down"` | Conditional expression: a one-line if/else |
| `{intf["name"]:<20}` | Format spec: left-align in a 20-character column |

If the device returns two interfaces, GigabitEthernet1 enabled and GigabitEthernet2 disabled, the output is:

```
GigabitEthernet1    up
GigabitEthernet2    down
```

If the password is wrong, the device returns **401**: the script prints `Error 401`, the function returns an empty list, the loop runs zero times, and nothing else prints. **Interpreting the failure path is as examinable as the success path.**

### A second example — netmiko over SSH

```python
from netmiko import ConnectHandler

device = {
    "device_type": "cisco_ios",
    "host": "10.0.0.2",
    "username": "admin",
    "password": "Cisco123",
}

with ConnectHandler(**device) as conn:          # opens SSH; closes it when the block ends
    output = conn.send_command("show ip interface brief")
    commands = ["interface Loopback100", "description Managed by Python"]
    conn.send_config_set(commands)              # enters config mode, sends, exits

for line in output.splitlines():
    if "up" in line and "Loopback" not in line:
        print(line.split()[0])                  # first column = interface name
```

The `**device` syntax **unpacks** the dict into keyword arguments: `host="10.0.0.2", username=...`. The `with` block guarantees the SSH session is closed even if an error occurs. The final loop prints the name of every non-loopback interface whose line contains "up".

**Why is netmiko considered a fallback compared with RESTCONF?** Because it scrapes **human-formatted text**. If a software upgrade changes a column width, `split()[0]` can silently pick the wrong field. An API returns **structured data** whose keys don't move. *Parse text when you must; consume structured data when you can.*

---

## 19.8 JSON — The Rules, Exactly

**JSON (JavaScript Object Notation)** is a text format for structured data. It has exactly **six value types**:

| JSON type | Example | Python equivalent |
|-----------|---------|-------------------|
| **object** | `{"name": "R1"}` | `dict` |
| **array** | `[1, 2, 3]` | `list` |
| **string** | `"GigabitEthernet1"` | `str` |
| **number** | `1500`, `99.5`, `-3` | `int` / `float` |
| **boolean** | `true`, `false` | `True`, `False` |
| **null** | `null` | `None` |

### The rules that make or break validity

1. **Keys must be strings in double quotes.** `{"vlan": 10}` is valid. `{vlan: 10}` and `{'vlan': 10}` are both **invalid**.
2. **Strings use double quotes only.** Single quotes are never valid JSON.
3. **No trailing commas.** `[1, 2, 3,]` and `{"a": 1,}` are invalid.
4. **Commas *between* items, colons between key and value.** Missing either is invalid.
5. **`true`, `false`, `null` are lowercase.** `True`, `False`, `None` (Python spellings) are invalid.
6. **No comments.** `//` and `#` are invalid in JSON.
7. **Numbers aren't quoted unless you mean a string.** `"mtu": 1500` is a number; `"mtu": "1500"` is a string. Both are valid, but they're different.
8. **Whitespace between tokens doesn't matter.** One line or pretty-printed, it's the same document.
9. **A document has exactly one top-level value.** RFC 8259 allows *any* value there (`42`, `"hello"` and `true` are each a complete, valid JSON text), but APIs almost always send one object `{...}` or one array `[...]`.
10. **Numbers have a strict grammar.** No leading zeros (`010`), no leading `+`, no hex (`0x1F`), no bare decimal point (`.5` must be `0.5`), and no `NaN` or `Infinity`. Exponents (`1e3`) and negatives (`-3`) are fine.
11. **Some characters in strings must be escaped with a backslash:** `\"` for a double quote, `\\` for a backslash, `\n` for a newline.

### Spot the error

| Snippet | Valid? | Why |
|---------|--------|-----|
| `{"hostname": "R1", "asn": 65001}` | **Yes** | |
| `{'hostname': 'R1'}` | No | Single quotes |
| `{"vlans": [10, 20, 30,]}` | No | Trailing comma in the array |
| `{"enabled": True}` | No | `True` must be `true` |
| `{"enabled": "true"}` | Yes | Valid, but the value is the *string* "true", not a boolean |
| `{"name": "R1" "asn": 65001}` | No | Missing comma between pairs |
| `{"interfaces": {"name": "Gi1"}, {"name": "Gi2"}}` | No | Two objects need to be inside an **array**: `[{...}, {...}]` |
| `{"ip": 10.0.0.1}` | No | `10.0.0.1` isn't a number; it must be the string `"10.0.0.1"` |
| `{"desc": null}` | Yes | |
| `{"vlan": 010}` | No | Leading zero — numbers may not start with 0 (except `0` and `0.x`) |
| `{"loss": NaN}` | No | `NaN` and `Infinity` aren't JSON; use `null` or a string. (Python's `json` accepts them as a non-standard extension, but other parsers and APIs reject them.) |
| `{"mask": 0xFF}` | No | No hex in JSON |
| `{"offset": +1}` | No | A leading `+` is not allowed (`-1` is fine) |
| `{"path": "C:\\cfg"}` | Yes | The backslash is escaped as `\\` |
| `{"desc": "say "hi""}` | No | Inner quotes must be escaped: `"say \"hi\""` |
| `{"a": 1, "a": 2}` | Parses, but don't | RFC 8259 says names **should** be unique; behaviour then varies by parser. Python's `json` keeps the **last** value. |
| `[1, "two", null]` | Yes | Arrays may mix types |
| `"just a string"` | Yes | Any value is a valid JSON text on its own |

**Why is JSON this strict when Python is more forgiving?** Because JSON is an exchange format between programs written in many languages, so it has to be unambiguous to every parser. A single malformed character makes the whole document unreadable. The API answers **400 Bad Request** and changes nothing. *The strictness is the feature: a document either means exactly one thing or it's rejected.*

---

## 19.9 JSON ↔ Python

```python
import json

text = '{"hostname": "R1", "enabled": true, "vlans": [10, 20], "desc": null}'
data = json.loads(text)              # loads = load from String → Python dict
print(data["enabled"])               # True   (JSON true became Python True)
print(data["vlans"][1])              # 20
print(data["desc"])                  # None

back = json.dumps(data, indent=2)    # dumps = dump to String → JSON text
```

`json.load(f)` and `json.dump(obj, f)` (no `s`) do the same with **files**. Memory hook: *the `s` stands for string.* `requests` gives you `resp.json()`, which is just `json.loads(resp.text)` for you.

---

## 19.10 Construct It — Practice With Answers ✏️

**Exercise 1.** Write valid JSON describing router R1 with ASN 65001, BGP enabled, two neighbours (10.0.0.2 in remote AS 65002, and 10.0.0.6 in remote AS 65003), and no description.

<details>
<summary>Answer</summary>

```json
{
  "hostname": "R1",
  "bgp": {
    "asn": 65001,
    "enabled": true,
    "neighbors": [
      {"address": "10.0.0.2", "remote_as": 65002},
      {"address": "10.0.0.6", "remote_as": 65003}
    ]
  },
  "description": null
}
```

Check yourself: the IPs are **strings**, the ASNs are **numbers**, `true` and `null` are lowercase, the two neighbours are objects **inside an array**, and there's **no comma** after the last item at any level.

</details>

**Exercise 2.** Fix this so it is valid JSON (there are five errors):

```
{'interface': "Loopback0", "ipv4": 1.1.1.1, "shutdown": False, "tags": ["core", "mgmt",]
```

<details>
<summary>Answer</summary>

```json
{"interface": "Loopback0", "ipv4": "1.1.1.1", "shutdown": false, "tags": ["core", "mgmt"]}
```

1. `'interface'` → `"interface"` (double quotes)
2. `1.1.1.1` → `"1.1.1.1"` (an IP is a string)
3. `False` → `false`
4. Trailing comma after `"mgmt"` removed
5. Missing closing `}` added

</details>

**Exercise 3.** Given `data = {"response": [{"hostname": "SW1", "upTime": "10 days"}, {"hostname": "SW2", "upTime": "3 days"}]}`, what does this print?

```python
for dev in data["response"]:
    if "10" in dev["upTime"]:
        print(dev["hostname"].lower())
```

<details>
<summary>Answer</summary>

`sw1`. The loop visits both devices. Only SW1's `upTime` string contains the substring `"10"`, and `.lower()` turns `SW1` into `sw1`.

</details>

**Exercise 4.** What does this print?

```python
ports = ["Gi1/0/1", "Gi1/0/2", "Gi1/0/3"]
for n, p in enumerate(ports):
    if n % 2 == 0:
        print(p)
```

<details>
<summary>Answer</summary>

```
Gi1/0/1
Gi1/0/3
```

`enumerate` starts at 0 by default, so `n` is 0, 1, 2. `n % 2 == 0` is true for 0 and 2: the first and third ports.

</details>

**Exercise 5.** What does this print?

```python
vlans = {"SW1": [10, 20, 30], "SW2": [20, 30, 40]}
common = set(vlans["SW1"]) & set(vlans["SW2"])
print(len(common), 30 // 4, 30 / 4)
```

<details>
<summary>Answer</summary>

`2 7 7.5`. The intersection is {20, 30} (two items). `30 // 4` floors to 7, and `30 / 4` is always a float: 7.5.

</details>

**Exercise 6.** Is each of these valid JSON? `{"mtu": 1500.0}` · `{"id": 007}` · `[]` · `{"up": TRUE}` · `null`

<details>
<summary>Answer</summary>

Valid, **invalid** (leading zeros), valid (an empty array), **invalid** (`true` must be lowercase), valid (any single value is a valid JSON text).

</details>

**Exercise 7.** What does this print, and what would it print if `"8"` were `"eight"`?

```python
def check(v):
    try:
        n = int(v)
    except ValueError:
        return "bad"
    else:
        return "%s x2 = %d" % (v, n * 2)
    finally:
        print("checked", end=" ")

print(check("8"))
```

<details>
<summary>Answer</summary>

`checked 8 x2 = 16`. `finally` runs before the function actually returns, so its `print` (with `end=" "` instead of a newline) appears first, then the returned string is printed. With `"eight"`, `int()` raises `ValueError` and the output is `checked bad`.

</details>

---

<a name="chapter-20"></a>
# Chapter 20: YANG, NETCONF, RESTCONF & Controller APIs

> **Blueprint:** ENCOR 4.6 — Configure and verify NETCONF and RESTCONF; ENCOR 6.3 — Describe the high-level principles and benefits of a data modeling language, such as YANG; ENCOR 6.4 — Describe APIs for Cisco Catalyst Center and SD-WAN Manager; ENCOR 6.5 — Interpret REST API response codes and results in payload using Cisco Catalyst Center and RESTCONF

Chapter 19 gave you the languages: Python to drive, JSON to read. This chapter is about **what you talk to**. There are two layers:

- **Devices**, configured through **model-driven programmability**: YANG models, carried by NETCONF or RESTCONF.
- **Controllers** (Catalyst Center, SD-WAN Manager), which manage hundreds of devices and expose their own **REST APIs**.

**Why does CCNP care so much about this?** Because the CLI was built for humans, and its output is formatted for eyes, not programs. Every automation tool that screen-scrapes CLI output (19.7) is one software upgrade away from breaking. Model-driven programmability gives programs what the CLI gives people: a **stable, structured, documented** way to read and change a device.

![The model-driven programmability stack](images/c20_mdp_stack.png)

---

## 20.1 YANG — A Data Model for Network Devices

**YANG** (Yet Another Next Generation, RFC 7950) is a **data modelling language**. It doesn't configure anything itself. It **describes** what configuration and state data exists, its structure, its data types and its constraints.

**Story Time 📖:** A YANG model is like the blank **form** at the DMV. It says there's a "name" field (text, required), a "date of birth" field (a date, must be in the past), and a list of "vehicles", each with make, model and plate. The form isn't your data; it's the agreed **shape** of the data. Once everyone uses the same form, any clerk can process any application without guessing.

### The building blocks

| YANG node | What it holds | JSON shape it becomes | Example |
|-----------|---------------|-----------------------|---------|
| **module** | The whole model, with a namespace and prefix | Prefix on top-level keys | `ietf-interfaces` |
| **container** | A group of related nodes (one instance) | Object `{}` | `interfaces` |
| **list** | Many entries, each identified by a **key** | Array of objects `[{}, {}]` | `interface`, keyed by `name` |
| **leaf** | One value of a defined type | `"key": value` | `enabled` (boolean), `mtu` (uint16) |
| **leaf-list** | Many values of one type | Array of values | DNS servers `["8.8.8.8", "1.1.1.1"]` |

A trimmed piece of the real `ietf-interfaces` module:

```
module ietf-interfaces {
  namespace "urn:ietf:params:xml:ns:yang:ietf-interfaces";
  prefix if;
  container interfaces {
    list interface {
      key "name";
      leaf name        { type string; }
      leaf description { type string; }
      leaf type        { type identityref { base interface-type; } mandatory true; }
      leaf enabled     { type boolean; default "true"; }
    }
  }
}
```

The same data as **JSON** (what RESTCONF returns):

```json
{
  "ietf-interfaces:interfaces": {
    "interface": [
      {
        "name": "GigabitEthernet1",
        "description": "Uplink to core",
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": true
      }
    ]
  }
}
```

Read the mapping: **container → object, list → array of objects, leaf → key/value**. The module name prefixes the top-level key (`ietf-interfaces:interfaces`). *Once you can map a YANG tree to its JSON shape, you can predict any RESTCONF payload without ever seeing one.*

### Reading a YANG tree

Nobody reads raw YANG to find a path. Engineers (and exam exhibits) use the **tree view** that the `pyang` tool prints with `pyang -f tree`. An excerpt of `ietf-interfaces` (RFC 8343):

```
module: ietf-interfaces
  +--rw interfaces
     +--rw interface* [name]
        +--rw name                        string
        +--rw description?                string
        +--rw type                        identityref
        +--rw enabled?                    boolean
        +--rw link-up-down-trap-enable?   enumeration {if-mib}?
        +--ro admin-status                enumeration {if-mib}?
        +--ro oper-status                 enumeration
        +--ro last-change?                yang:date-and-time
        +--ro phys-address?               yang:phys-address
        +--ro speed?                      yang:gauge64
        +--ro statistics
           +--ro discontinuity-time    yang:date-and-time
           +--ro in-octets?            yang:counter64
           +--ro in-errors?            yang:counter32
```

Read it symbol by symbol:

| Symbol | Meaning | In this tree |
|--------|---------|--------------|
| `+--rw` | **Configuration** data: readable and writable | `name`, `description`, `enabled` — things you set |
| `+--ro` | **State** (operational) data: read-only, declared `config false` in the model | `oper-status`, `speed`, the `statistics` counters |
| `*` | A **list** (or leaf-list): many entries | `interface*` — one entry per interface |
| `[name]` | The list's **key**: what identifies each entry | Why the RESTCONF URI says `interface=GigabitEthernet1` |
| `?` | **Optional** leaf (may be absent) | `description?` |
| No `?` on a leaf | Mandatory, or always present | `type` is mandatory |
| `{if-mib}?` | Exists only if the device supports that **feature** | `admin-status` |
| Indentation | Nesting: each level is a container or list inside the one above | `statistics` is a container inside each `interface` |
| Right-hand column | The leaf's **data type** | `boolean`, `string`, `yang:counter64` |

**Why does the rw/ro split matter in practice?** Because it tells you what you can **send** versus what you can only **read**. A RESTCONF PATCH that tries to set `oper-status` is rejected, because it's state, not configuration. And `?content=config` (20.3) returns only the `rw` nodes, while `?content=nonconfig` returns only the `ro` ones. *`rw` is what you intend; `ro` is what actually happened.* Older models (RFC 7223) kept state in a separate `interfaces-state` container; the current model merges them into one tree, as shown.

### Who writes the models

| Model family | Written by | Strength | Weakness |
|--------------|-----------|----------|----------|
| **IETF** (`ietf-interfaces`, `ietf-ip`, …) | Standards body | Vendor-neutral | Covers only common features |
| **OpenConfig** (`openconfig-interfaces`, …) | Operators (Google, Microsoft, AT&T, …) | Vendor-neutral, operationally focused, including streaming telemetry | Still not every feature |
| **Native** (`Cisco-IOS-XE-native`, …) | The vendor | Covers **everything** the platform can do | Cisco-only; your code won't work on another vendor |

**Why use YANG at all — what problem does it solve?** Three things:

1. **Structure instead of text.** A program reads `"enabled": true` directly. It doesn't need a regex to find "administratively down" in CLI output.
2. **Validation before change.** The model defines types and constraints, so the device can reject `mtu = 99999` or a missing mandatory leaf *before* touching the configuration.
3. **One model, many protocols.** The same YANG model is served over NETCONF (XML), RESTCONF (JSON or XML) and gNMI. Learn the model once and use it everywhere.

*YANG is the contract; NETCONF and RESTCONF are just two delivery trucks that carry data shaped by it.*

---

## 20.2 NETCONF — The Transactional Protocol

**NETCONF** (RFC 6241) is a protocol for reading and changing device configuration using **XML-encoded** YANG data over **SSH, TCP port 830**.

### NETCONF's four layers

| Layer | Contents |
|-------|----------|
| **Content** | The configuration or state data itself — XML shaped by a YANG model |
| **Operations** | `<get>`, `<get-config>`, `<edit-config>`, … |
| **Messages** | `<rpc>` (client request) and `<rpc-reply>` (server answer), each with a `message-id`; plus `<notification>` |
| **Transport** | SSH (port 830), securely carrying it all |

### Operations

| Operation | What it does |
|-----------|--------------|
| `<get>` | Retrieve **configuration and operational state** (counters, status) |
| `<get-config>` | Retrieve **configuration only**, from a named datastore |
| `<edit-config>` | Change configuration (merge, replace, create, delete, remove) |
| `<copy-config>` | Replace a whole datastore with another |
| `<delete-config>` | Delete a datastore (not running) |
| `<lock>` / `<unlock>` | Take exclusive control of a datastore while you change it |
| `<commit>` | Make the **candidate** datastore become running |
| `<close-session>` / `<kill-session>` | End your session / forcibly end another |

### Datastores

| Datastore | Meaning |
|-----------|---------|
| **running** | The live configuration (always exists) |
| **startup** | Loaded at boot (optional capability) |
| **candidate** | A scratch copy you edit, validate, then `<commit>` all at once (optional capability) |

**Why is NETCONF "transactional", and why does that matter?** With the CLI, a 40-line change is 40 separate commands, each applied immediately. If line 23 fails, lines 1–22 are already live and you have a half-configured device. NETCONF with the **candidate** datastore stages the entire change, validates it as a whole, and commits it **all or nothing**. Add `<lock>` and nobody else can change the device mid-edit. Across many devices this makes network-wide changes safe in a way CLI scripts never are. *A transaction is the difference between "the change worked" and "most of the change worked."*

### A NETCONF request in practice

```python
from ncclient import manager

with manager.connect(host="10.0.0.1", port=830, username="admin", password="Cisco123",
                     hostkey_verify=False) as m:
    for cap in m.server_capabilities:            # the <hello> exchange lists capabilities
        if "candidate" in cap:
            print(cap)
    flt = """<filter><interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"/>
             </filter>"""
    reply = m.get_config(source="running", filter=flt)
    print(reply.xml)                             # XML: <rpc-reply><data>...</data></rpc-reply>
```

When a session opens, both sides send a **`<hello>`** listing their **capabilities**: the operations, datastores and YANG models they support. That's how a client discovers what the device can do.

### What actually goes over the wire

`ncclient` hides the protocol, but you can speak NETCONF by hand. Opening the NETCONF **SSH subsystem** on port 830 shows exactly what the library does:

```
$ ssh -p 830 admin@10.0.0.1 -s netconf
<?xml version="1.0" encoding="UTF-8"?>
<hello xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <capabilities>
    <capability>urn:ietf:params:netconf:base:1.0</capability>
    <capability>urn:ietf:params:netconf:base:1.1</capability>
    <capability>urn:ietf:params:netconf:capability:candidate:1.0</capability>
    ...hundreds of YANG module capabilities...
  </capabilities>
  <session-id>2871</session-id>
</hello>]]>]]>
```

The device speaks first with its `<hello>` and a **session-id**. The client must answer with its own `<hello>` (without a session-id) before sending any RPC. Each message is then followed by a **framing marker** so the receiver knows where it ends:

| NETCONF version | Framing | How a message ends |
|-----------------|---------|--------------------|
| **1.0** (`base:1.0`) | End-of-message marker | The literal sequence `]]>]]>` |
| **1.1** (`base:1.1`) | **Chunked** framing | Each chunk starts `#<length>` on its own line; the message ends with `##` |

If **both** sides advertise `base:1.1`, they switch to chunked framing right after the hello exchange. Chunked framing exists because `]]>]]>` could legally appear *inside* XML data and cut a message short; a length prefix can't be fooled. *That's why a hand-typed session works until 1.1 kicks in: from then on, every message needs a correct byte count.*

An `<edit-config>` that creates a loopback looks like this (the same data a RESTCONF PATCH would carry as JSON):

```xml
<rpc message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <edit-config>
    <target><running/></target>
    <config>
      <interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces">
        <interface xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">
          <name>Loopback100</name>
          <description>Created by NETCONF</description>
          <type>ianaift:softwareLoopback</type>
          <enabled>true</enabled>
        </interface>
      </interfaces>
    </config>
  </edit-config>
</rpc>]]>]]>
```

The device answers `<rpc-reply message-id="101" ...><ok/></rpc-reply>`. The **message-id** ties each reply to its request. Read the structure from the outside in: **message** (`<rpc>`) → **operation** (`<edit-config>`) → **datastore** (`<target><running/>`) → **content** (YANG-shaped data). Those are exactly the four layers in the table above. To delete instead of merge, mark the node with an operation attribute: `<interface nc:operation="delete">`, with `xmlns:nc` bound to the base NETCONF namespace. Use `<target><candidate/></target>` followed by `<commit/>` for the transactional version.

---

## 20.3 RESTCONF — YANG over HTTP

**RESTCONF** (RFC 8040) exposes the **same YANG data** through a **REST-style HTTPS API**. If you know how to use a web API, you know how to use RESTCONF.

### URI structure

![Anatomy of a RESTCONF URI](images/c20_restconf_uri.png)

```
https://10.0.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet1
```

| Part | Meaning |
|------|---------|
| `https://10.0.0.1` | The device, over HTTPS (port 443) |
| `/restconf` | The API root (discoverable via `GET /.well-known/host-meta`) |
| `/data` | The datastore resource: configuration and state. `/operations` is for RPCs. |
| `ietf-interfaces:interfaces` | **module:top-level-container** |
| `/interface=GigabitEthernet1` | A **list** entry selected by its **key** value |

A slash in a key value must be percent-encoded: `GigabitEthernet1%2F0%2F1` for `GigabitEthernet1/0/1`.

### Building URIs — beyond one key

The path always follows the YANG tree: **container names are path segments, a list entry is `list=key`**. A few patterns cover nearly everything:

| You want | URI after `https://10.0.0.1/restconf/data/` |
|----------|---------------------------------------------|
| One leaf from the **native** model | `Cisco-IOS-XE-native:native/hostname` |
| A native-model interface (keyed by number only) | `Cisco-IOS-XE-native:native/interface/GigabitEthernet=1` |
| A list with a **two-part key** | `openconfig-acl:acl/acl-sets/acl-set=MGMT,ACL_IPV4` (keys `name` and `type`, comma-separated, in the order the model declares them) |
| One leaf inside a list entry | `ietf-interfaces:interfaces/interface=Loopback100/description` |

RFC 8040 **query parameters** shape what comes back:

| Parameter | Effect | Example |
|-----------|--------|---------|
| `?depth=N` | Only N levels of nesting below the target | `.../interfaces?depth=2` lists interfaces without their contents |
| `?content=config` | Configuration (`rw`) nodes only | Back up just the intent |
| `?content=nonconfig` | State (`ro`) nodes only | Just counters and status |
| `?content=all` | Both (the default) | |
| `?fields=...` | Only the named children | `.../interfaces?fields=interface(name;enabled)` |

Notice the response's top-level key follows the **target**: GET `.../native/hostname` returns `{"Cisco-IOS-XE-native:hostname": "R1"}`, not the whole native tree.

### HTTP methods → operations

| HTTP method | RESTCONF meaning | NETCONF equivalent | Success code |
|-------------|------------------|--------------------|--------------|
| **GET** | Read | `<get>` / `<get-config>` | 200 OK |
| **POST** | **Create** a new child resource (fails if it already exists) | `<edit-config>` create | **201 Created** |
| **PUT** | **Create or replace** the target resource entirely | `<edit-config>` replace | 201 Created or **204 No Content** |
| **PATCH** | **Merge** into the existing resource | `<edit-config>` merge | **204 No Content** |
| **DELETE** | Remove the resource | `<edit-config>` delete | **204 No Content** |

Here are both, in full, against the same loopback:

```
$ curl -k -u admin:Cisco123 -X PATCH \
    -H "Content-Type: application/yang-data+json" \
    -H "Accept: application/yang-data+json" \
    https://10.0.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback100 \
    -d '{"ietf-interfaces:interface": [{"name": "Loopback100",
                                       "description": "PATCHed"}]}'
HTTP/1.1 204 No Content
```

PATCH merged the description in; the loopback's IP and enabled state are untouched. Now the PUT:

```
$ curl -k -u admin:Cisco123 -X PUT \
    -H "Content-Type: application/yang-data+json" \
    https://10.0.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback100 \
    -d '{"ietf-interfaces:interface": [{"name": "Loopback100",
                                       "type": "iana-if-type:softwareLoopback",
                                       "description": "Replaced",
                                       "enabled": true}]}'
HTTP/1.1 204 No Content
```

**204** because the resource already existed and was replaced; the same PUT to a new name returns **201 Created**. After this PUT the loopback has *only* what the body listed: any IPv4 address configured under it in this model is gone. Note the body's top-level key is the **list name** (`interface`, as an array with one entry), and its `name` must match the key in the URI. If they differ, the device returns **400**.

**Why does the PUT vs PATCH distinction matter so much?** Because **PUT replaces**. PUT an interface body containing only a description, and every leaf you *didn't* include (IP address, enabled state) is removed from that resource. **PATCH merges**: it changes only the leaves you send. *PUT is "make it exactly this", PATCH is "change just these bits." Mixing them up is how a one-line description change takes an interface's IP away.*

### Media types — the `Accept` and `Content-Type` headers

| Header value | Meaning |
|--------------|---------|
| `application/yang-data+json` | YANG data encoded as JSON |
| `application/yang-data+xml` | YANG data encoded as XML |

`Accept` says what format you want **back**. `Content-Type` says what format you're **sending** (needed on POST, PUT and PATCH). Send a body with the wrong or missing `Content-Type` and you get **415 Unsupported Media Type**.

### NETCONF vs RESTCONF

| Property | NETCONF | RESTCONF |
|----------|---------|----------|
| Transport | **SSH, port 830** | **HTTPS, port 443** |
| Encoding | XML | **JSON or XML** |
| Operations | RPCs (`get-config`, `edit-config`, …) | HTTP methods (GET, POST, PUT, PATCH, DELETE) |
| Datastores | running, candidate, startup; locking; commit | Effectively a single unified datastore view; no candidate/lock |
| Transactions | Yes — all-or-nothing with candidate and commit | Each request stands alone |
| Best for | Multi-step, multi-device transactional change | Simple reads and edits, web tooling, quick scripts |

---

## 20.4 Enabling and Verifying NETCONF and RESTCONF on IOS XE

Both need a **privilege-15 user** (they authenticate through AAA) and **AAA** enabled.

```
R1(config)# username admin privilege 15 algorithm-type scrypt secret Cisco123
R1(config)# aaa new-model
R1(config)# aaa authentication login default local
R1(config)# aaa authorization exec default local       ! the API user needs priv 15 granted
!
! --- NETCONF ---
R1(config)# netconf-yang                               ! starts the NETCONF server on port 830
!
! --- RESTCONF ---
R1(config)# ip http secure-server                      ! RESTCONF rides on the HTTPS server
R1(config)# ip http authentication local
R1(config)# restconf
```

**Verify:**

```
R1# show netconf-yang status
netconf-yang: enabled
netconf-yang candidate-datastore: disabled
netconf-yang side-effect-sync: enabled
netconf-yang ssh port: 830
...
R1# show platform software yang-management process
confd            : Running
nesd             : Running
syncfd           : Running
ncsshd           : Running              ! NETCONF SSH daemon
dmiauthd         : Running
nginx            : Running              ! web server that fronts RESTCONF
ndbmand          : Running
pubd             : Running
R1# show netconf-yang sessions
R1# show ip http server secure status
```

The candidate datastore is off by default on IOS XE. `netconf-yang feature candidate-datastore` turns it on (with a brief restart of the NETCONF server).

A quick end-to-end test of RESTCONF from any workstation:

```
curl -k -u admin:Cisco123 -H "Accept: application/yang-data+json" \
  https://10.0.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0
```

| Symptom | Likely cause | Proof |
|---------|--------------|-------|
| NETCONF connection refused on 830 | `netconf-yang` not configured, or the processes are still starting (they take a minute or two after enabling) | `show platform software yang-management process` |
| RESTCONF returns **401** | Wrong credentials, or the user isn't privilege 15 | `show running-config | include username`, `debug aaa authentication` |
| RESTCONF connection refused on 443 | `ip http secure-server` missing | `show ip http server secure status` |
| RESTCONF returns **404** for a valid-looking URI | Wrong module prefix or key, or the resource doesn't exist | Try a `GET` on the parent container |

---

## 20.5 Catalyst Center APIs

Cisco **Catalyst Center** (formerly DNA Center, Chapter 16) manages the campus. It exposes APIs in four directions:

| Direction | API | Purpose |
|-----------|-----|---------|
| **Northbound** | **Intent API** (REST) | *You* (scripts, apps) tell Catalyst Center **what** you want: device inventory, sites, health, templates, path trace |
| **Southbound** | **Multivendor SDK** | Catalyst Center manages devices, including third-party ones via device packages |
| **Eastbound** | **Events and notifications** | Catalyst Center pushes events (device down, compliance failure) to webhooks, email, syslog |
| **Westbound** | **Integration API** | Connects to IT systems: ITSM (ServiceNow), IPAM, reporting |

**Why is it called the "Intent" API?** Because you describe *outcomes* ("give me client health for this site", "deploy this template to these switches"), not device commands. Catalyst Center works out the per-device configuration. *That's the abstraction a controller buys you: one API call for what would be a hundred CLI sessions.*

### Authentication flow — get a token, then use it

![Catalyst Center token authentication sequence](images/c20_cc_token.png)

**Step 1 — request a token** with HTTP Basic credentials:

```
POST https://cc.corp.example/dna/system/api/v1/auth/token
Authorization: Basic YWRtaW46Q2lzY28xMjM=
```

```json
{"Token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1ZTk..."}
```

**Step 2 — send the token** in the **`X-Auth-Token`** header on every later call:

```
GET https://cc.corp.example/dna/intent/api/v1/network-device
X-Auth-Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1ZTk...
```

The token is valid for **about one hour**. After that, calls return **401** and the script must request a new one (18.7 explains why tokens expire).

In Python:

```python
import requests
BASE = "https://cc.corp.example"
tok = requests.post(f"{BASE}/dna/system/api/v1/auth/token",
                    auth=("admin", "Cisco123"), verify=False).json()["Token"]
hdrs = {"X-Auth-Token": tok, "Accept": "application/json"}
devices = requests.get(f"{BASE}/dna/intent/api/v1/network-device",
                       headers=hdrs, verify=False).json()["response"]
for d in devices:
    print(d["hostname"], d["managementIpAddress"], d["reachabilityStatus"])
```

Common Intent API paths you should recognise:

| Path | Returns or does |
|------|-----------------|
| `/dna/intent/api/v1/network-device` | Device inventory |
| `/dna/intent/api/v1/site` | Site hierarchy |
| `/dna/intent/api/v1/network-health` | Overall network health score |
| `/dna/intent/api/v1/client-health` | Client health by category |
| `/dna/intent/api/v1/template-programmer/...` | Configuration templates |
| `/dna/intent/api/v1/task/{taskId}` | Status of an asynchronous job |

### Asynchronous calls — the 202 pattern

Long-running operations (deploying a template, running a command across 200 devices) don't return the result straight away. They return **202 Accepted** with a **task ID**:

```json
{
  "response": {
    "taskId": "6f2a-4b1c-9d0e-81a7",
    "url": "/api/v1/task/6f2a-4b1c-9d0e-81a7"
  },
  "version": "1.0"
}
```

The script then **polls** `GET /dna/intent/api/v1/task/{taskId}` until the task reports it has finished (and whether it ended in error). **Why asynchronous?** An HTTP request that waited ten minutes for 200 switches would time out. The API says "accepted, here's your ticket" and lets you check back. *202 means "I'll do it", not "it's done".*

---

## 20.6 Catalyst SD-WAN Manager APIs

**SD-WAN Manager** (formerly vManage, Chapter 14) is the management plane of Catalyst SD-WAN. Its REST API lives under **`/dataservice/`** and covers device inventory, monitoring (interface stats, tunnel health, alarms), configuration templates and policies.

### Authentication flow — session cookie plus XSRF token

**Step 1 — log in** with a **form POST** (not Basic auth):

```
POST https://vmanage.corp.example/j_security_check
Content-Type: application/x-www-form-urlencoded

j_username=admin&j_password=Cisco123
```

A successful login sets a **`JSESSIONID`** session **cookie**. *Gotcha:* a failed login usually still returns **200**, with an HTML login page as the body instead of a cookie. Scripts must check for the cookie, not just the status code.

**Step 2 — fetch the XSRF token** (needed for any request that changes something):

```
GET https://vmanage.corp.example/dataservice/client/token
Cookie: JSESSIONID=...
```

The response body *is* the token string.

**Step 3 — call the API** with the cookie, plus the **`X-XSRF-TOKEN`** header on POST, PUT and DELETE:

```
GET https://vmanage.corp.example/dataservice/device
Cookie: JSESSIONID=...
```

```json
{
  "header": {"title": "Devices"},
  "data": [
    {"host-name": "branch1-cedge", "system-ip": "10.255.1.1", "reachability": "reachable",
     "device-type": "vedge", "version": "17.12.03"}
  ]
}
```

**Why does SD-WAN Manager need an XSRF token on top of the cookie?** A browser automatically attaches cookies to every request to that site, including requests triggered by a malicious page in another tab (**cross-site request forgery**). The XSRF token must be read and deliberately copied into a header, and a forged cross-site request can't do that. *The cookie proves who you are; the XSRF token proves the request came from your own code.*

| Property | Catalyst Center | SD-WAN Manager |
|----------|-----------------|----------------|
| API base | `/dna/intent/api/v1/...` | `/dataservice/...` |
| Login | `POST /dna/system/api/v1/auth/token` with Basic auth | `POST /j_security_check` with form fields |
| Credential on later calls | **`X-Auth-Token`** header | **`JSESSIONID`** cookie (+ **`X-XSRF-TOKEN`** header for changes) |
| Data wrapper in responses | `"response": ...` | `"data": [...]` |

---

## 20.7 HTTP Response Codes — Reading the Answer

Every HTTP response starts with a **status code**. The first digit is the category:

| Class | Meaning | Who's at fault |
|-------|---------|----------------|
| **1xx** | Informational | — |
| **2xx** | **Success** | — |
| **3xx** | **Redirection** — look elsewhere | — |
| **4xx** | **Client error** — *your request* is wrong | You / your script |
| **5xx** | **Server error** — the request may be fine, the server failed | The device or controller |

The codes you must know:

| Code | Name | Typical network-API meaning |
|------|------|-----------------------------|
| **200** | OK | GET succeeded; data in the body |
| **201** | Created | POST (or PUT) created a new resource |
| **202** | Accepted | Async job queued; poll the task ID (Catalyst Center) |
| **204** | No Content | Success with no body: RESTCONF PATCH, PUT-replace, DELETE |
| **301 / 302** | Moved / Found | Redirect, e.g. HTTP → HTTPS |
| **304** | Not Modified | Cached copy still valid |
| **400** | Bad Request | Malformed JSON/XML or invalid values (19.8) |
| **401** | Unauthorized | **Not authenticated**: missing, wrong or expired credentials or token |
| **403** | Forbidden | **Authenticated but not allowed** (RBAC, 18.7) |
| **404** | Not Found | Wrong URI, module, key, or the resource doesn't exist |
| **405** | Method Not Allowed | e.g. POST to a resource that only supports GET |
| **409** | Conflict | RESTCONF POST of something that **already exists** |
| **415** | Unsupported Media Type | Wrong or missing `Content-Type` (e.g. `application/json` where `application/yang-data+json` was required) |
| **429** | Too Many Requests | Rate limit hit (18.7) |
| **500** | Internal Server Error | Server-side failure processing a valid-looking request |
| **503** | Service Unavailable | Server overloaded, starting up, or under maintenance; retry later |

**Why is 401 vs 403 a favourite exam distinction?** Because the fixes are completely different. **401** says *"I don't know who you are"*: fix the credentials or get a fresh token. **403** says *"I know exactly who you are, and you may not do this"*: changing the password won't help; the account needs a different role. *401 is identity; 403 is permission.*

### Interpreting a payload — worked example

A script sends this RESTCONF request:

```
POST https://10.0.0.1/restconf/data/ietf-interfaces:interfaces
Content-Type: application/yang-data+json
{"ietf-interfaces:interface": {"name": "Loopback10", "type": "iana-if-type:softwareLoopback"}}
```

The response:

```
HTTP/1.1 409 Conflict
Content-Type: application/yang-data+json
{
 "errors": {
  "error": [
   {
    "error-type": "application",
    "error-tag": "data-exists",
    "error-message": "object already exists: /if:interfaces/if:interface[if:name='Loopback10']"
   }
  ]
 }
}
```

Read it: **409** plus `error-tag: data-exists` means Loopback10 **already exists**. POST only creates. To change the existing interface, use **PATCH** (merge) or **PUT** (replace). RESTCONF error bodies always follow this `errors → error[] → error-type / error-tag / error-message` shape. *The status code tells you the category; the error-tag and message tell you the exact cause.*

---

<a name="chapter-21"></a>
# Chapter 21: EEM, Orchestration Tools & AI in Operations

> **Blueprint:** ENCOR 6.6 — Construct an EEM applet to automate configuration, troubleshooting, or data collection; ENCOR 6.7 — Compare agent vs. agentless orchestration tools; ENCOR 6.0 — Automation and Artificial Intelligence (domain context)

Chapters 19 and 20 automated the network **from outside**: a script or controller reaches in through an API. This chapter covers the other two places automation lives:

- **On the box itself**: the **Embedded Event Manager (EEM)**, which reacts to events locally, even when the network that would carry a script's commands is broken.
- **Across the fleet**: **orchestration tools** (Ansible, Puppet, Chef, SaltStack) that keep hundreds of devices in a declared state.

It finishes with the newest part of the v1.2 blueprint's domain title, **AI in network operations**: what it is genuinely good for, and the guardrails that keep it safe.

Note the verb for EEM: **construct**. You must be able to *write* a working applet, which means getting the syntax exactly right.

---

## 21.1 EEM — Automation That Lives on the Device

![EEM: an event detector triggers an applet, which runs its actions in order](images/c21_eem.png)

**EEM** is an event-driven automation engine built into IOS and IOS XE. Its logic is one sentence: **when *this* happens, do *these* things.**

**Why put automation on the device rather than in an external script?** Three reasons:

1. **It works when the network doesn't.** If an uplink fails, a central server can't reach the device to collect diagnostics. EEM is already there.
2. **It reacts in the moment.** The CPU spikes for 20 seconds at 3 a.m. By the time a human logs in, it's gone. An applet triggered by the spike captures `show processes cpu sorted` *during* the event.
3. **No infrastructure.** No server, no credentials stored elsewhere, no Python environment. It's just configuration.

*EEM is your on-site technician who never sleeps and does exactly what the runbook says.*

### Anatomy of an applet

```
event manager applet <NAME>
 event <detector> <parameters>          ! one trigger (several only with event tags)
 action <label> <action-type> <args>    ! one or more actions, run in label order
```

### Event detectors (the "when")

| Detector | Fires when | Example |
|----------|------------|---------|
| `syslog` | A log message matches a regular expression | `event syslog pattern "%LINEPROTO-5-UPDOWN.*GigabitEthernet0/1.*down"` |
| `cli` | Someone types a command matching a pattern | `event cli pattern "^reload" sync no skip yes` |
| `timer` | Time-based: `watchdog` (every N s), `cron`, `countdown`, `absolute` | `event timer cron cron-entry "0 2 * * *"` |
| `track` | A tracked object (IP SLA, interface state, Chapter 15) changes state | `event track 10 state down` |
| `interface` | An interface counter crosses a threshold | `event interface name GigabitEthernet0/1 parameter input_errors entry-op ge entry-val 100 entry-type increment poll-interval 60` — `entry-type` is required: `value` (the raw counter), `increment` (change since the last poll) or `rate` (change per second) |
| `snmp` | An SNMP OID value crosses a threshold | `event snmp oid <oid> get-type exact entry-op ge entry-val 90 poll-interval 30` |
| `none` | Never automatically — only when run by hand | `event none` + `event manager run <NAME>` |

### Actions (the "do")

| Action | Purpose |
|--------|---------|
| `cli command "<cmd>"` | Run a CLI command, exactly as if typed |
| `syslog msg "<text>"` | Generate a log message (optionally `priority`) |
| `mail server ... to ... from ... subject ... body ...` | Send an email |
| `wait <seconds>` | Pause |
| `set <var> <value>`, `if` / `else` / `end`, `foreach` | Variables and flow control |
| `puts "<text>"` | Print to the terminal (useful with `event none`) |
| `reload` | Reload the device |

The output of the most recent `cli` action is stored in the built-in variable **`$_cli_result`**.

### Variables, regexp and decisions

EEM fills in built-in variables depending on what triggered the applet, and you can create your own with `set`:

| Variable | Holds | Available when |
|----------|-------|----------------|
| `$_cli_result` | Output of the most recent `cli` action | Any applet that runs a `cli` action |
| `$_syslog_msg` | The full syslog message that matched | `event syslog` |
| `$_cli_msg` | The command the user typed | `event cli` |
| `$_event_type_string` | The type of event that fired (e.g. `syslog`, `timer watchdog`) | Any event |
| `$_event_pub_time` | When the event was published | Any event |
| `$_regexp_result` | `1` if the last `regexp` matched, `0` if not | After a `regexp` action |

The `regexp` action pulls a value out of command output, and `if` / `else` / `end` act on it:

```
event manager applet ERR-CHECK
 event timer watchdog time 600
 action 010 cli command "enable"
 action 020 cli command "show interface GigabitEthernet0/1 | include input errors"
 action 030 regexp "([0-9]+) input errors" "$_cli_result" match errs
 action 040 if $errs gt "1000"
 action 050  syslog priority warnings msg "Gi0/1 has $errs input errors"
 action 060 else
 action 070  syslog msg "Gi0/1 input errors OK ($errs)"
 action 080 end
```

How to read action 030: apply the pattern to `$_cli_result`, put the **whole match** in `match` and the **first bracketed group** (the number) in `errs`. `if` compares numerically when both sides are numbers (`eq`, `ne`, `gt`, `ge`, `lt`, `le`). Two more actions round out the toolkit: `set count 0` creates a variable, and `increment count` adds 1 to it (or `increment count 5` adds 5), which is how an applet counts loop iterations or retries.

### More than one trigger — event tags and correlation

An applet normally has one event. To fire on a **combination**, give each event a tag and add a `trigger` block that correlates them:

```
event manager applet BOTH-UPLINKS-DOWN
 event tag e1 track 10 state down
 event tag e2 track 20 state down
 trigger
  correlate event e1 and event e2
 action 010 syslog priority critical msg "Both WAN uplinks are down"
```

This fires only when **both** tracked objects are down, which one-event applets can't express. `or` works too, and `trigger occurs 3 period 60` makes an applet fire only if its event happens three times within 60 seconds, which is handy for ignoring a single flap.

### The two rules everyone gets wrong

**Rule 1 — an applet starts at user EXEC.** A `cli` action runs in a fresh session with **no privilege**. So the **first** CLI action is almost always `enable`, and `configure terminal` must appear explicitly before any config command:

```
 action 1.0 cli command "enable"
 action 2.0 cli command "configure terminal"
 action 3.0 cli command "interface Gi0/1"
```

**Rule 2 — action labels sort as *strings*, not numbers.** EEM runs actions in **lexical (alphabetical) order** of their labels:

| Labels you wrote | Order EEM runs them |
|------------------|---------------------|
| `1.0`, `2.0`, … `9.0`, `10.0` | **`1.0`, `10.0`, `2.0`**, `3.0` … `9.0` |
| `010`, `020`, … `100` | `010`, `020`, … `100` ✔ |
| `1.0`, `1.1`, … `1.9`, `2.0` | ✔ (all same length before the dot) |

**Why does lexical ordering cause real bugs?** Compare `"10.0"` and `"2.0"` character by character: `"1"` sorts before `"2"`, so `10.0` runs *before* `2.0`. An applet with ten actions labelled `1.0` to `10.0` runs its tenth action second, perhaps saving the config before making the change. *Pad labels to equal width (`010`, `020` …) or keep them under ten, and leave gaps so you can insert actions later.*

> **Watch out for AAA.** If command authorization is on (17.4), applet commands are authorized too, as a user with no name, and get rejected. Fix it with `event manager session cli username "eem-svc"` pointing at an account that's authorized on the AAA server.

---

## 21.2 Three Applets You Should Be Able to Write

### 1 — Configuration: restore a backup route when a tracked object fails

```
track 10 ip sla 1 reachability
!
event manager applet WAN1-DOWN
 event track 10 state down
 action 010 cli command "enable"
 action 020 cli command "configure terminal"
 action 030 cli command "ip route 0.0.0.0 0.0.0.0 192.0.2.254 name EEM-BACKUP"
 action 040 cli command "end"
 action 050 syslog priority warnings msg "WAN1 SLA failed - EEM installed backup default"
!
event manager applet WAN1-UP
 event track 10 state up
 action 010 cli command "enable"
 action 020 cli command "configure terminal"
 action 030 cli command "no ip route 0.0.0.0 0.0.0.0 192.0.2.254 name EEM-BACKUP"
 action 040 cli command "end"
 action 050 syslog msg "WAN1 SLA restored - EEM removed backup default"
```

*In practice a tracked floating static (`ip route ... track 10`, Chapter 15) does this natively. The applet shows the pattern, which applies to any change a static route can't express: shutting a port, changing an HSRP priority, swapping an ACL.*

### 2 — Troubleshooting: capture evidence the moment an uplink drops

```
event manager applet UPLINK-DOWN-CAPTURE
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/1, changed state to down"
 action 010 cli command "enable"
 action 020 cli command "show clock | append flash:uplink-down.txt"
 action 030 cli command "show interface GigabitEthernet0/1 | append flash:uplink-down.txt"
 action 040 cli command "show logging | append flash:uplink-down.txt"
 action 050 cli command "show ip ospf neighbor | append flash:uplink-down.txt"
 action 060 syslog priority errors msg "Gi0/1 down - diagnostics in flash:uplink-down.txt"
```

The `| append flash:...` filter writes each output to a file instead of the screen, so the evidence is waiting when someone investigates. **Why include `show clock` first?** So every captured block is timestamped. *Evidence without a time is a guess about when it happened.*

### 3 — Data collection: sample CPU every 5 minutes

```
event manager applet CPU-SAMPLER
 event timer watchdog time 300 maxrun 60
 action 010 cli command "enable"
 action 020 cli command "show clock | append flash:cpu-log.txt"
 action 030 cli command "show processes cpu sorted 5min | append flash:cpu-log.txt"
```

`watchdog time 300` re-arms every 300 seconds. **`maxrun 60`** raises the applet's time limit. The default maximum runtime is **20 seconds**, after which EEM kills the applet mid-action, which matters when a command is slow or an applet collects many outputs.

### Bonus — guard a dangerous command

```
event manager applet BLOCK-RELOAD
 event cli pattern "^reload" sync no skip yes
 action 010 syslog priority critical msg "Command '$_cli_msg' blocked by EEM"
 action 020 puts "Reload is disabled by policy. Use the change process."
```

`skip yes` means the matched command is **not executed**; `$_cli_msg` holds the command that was typed. `sync no` runs the applet asynchronously (the CLI doesn't wait for it).

### Running, verifying and debugging

```
R1# event manager run CPU-SAMPLER            ! only works for applets with "event none"
R1# show event manager policy registered     ! every registered applet and its trigger
No.  Class   Type    Event Type          Trap  Time Registered          Name
1    applet  user    timer watchdog      Off   Mon Oct 26 14:02:11 2026  CPU-SAMPLER
 name {CPU-SAMPLER} time 300.000 maxrun 60.000
 action 010 cli command "enable"
 ...
R1# show event manager history events        ! when applets fired, and the result
R1# debug event manager action cli           ! watch each cli action run, and its output
```

| Symptom | Cause | Proof / fix |
|---------|-------|-------------|
| Applet never fires | The syslog regex doesn't match the real message (spacing, interface name) | Compare against `show logging` exactly; simplify the pattern |
| Fires, but config commands fail | Missing `enable` or `configure terminal` | `debug event manager action cli` shows `% Invalid input` |
| Actions run in a strange order | Labels sorted lexically (`10.0` before `2.0`) | `show event manager policy registered` lists the order |
| Applet stops part-way through | Hit the 20-second `maxrun` | Add `maxrun` to the event line |
| `cli` commands rejected | AAA command authorization | `event manager session cli username` |

---

## 21.3 Orchestration Tools — Agent vs Agentless

EEM automates **one device reacting to itself**. Orchestration (configuration management) tools automate **the fleet**: you declare what every device should look like, and the tool makes it so, repeatably and idempotently.

**Idempotent** means *running it twice has the same effect as running it once*. If NTP is already configured correctly, the tool changes nothing and reports "ok". **Why is idempotency the property that makes these tools safe?** Because you can run the whole playbook against 500 devices every night. Devices that drifted get corrected, compliant devices are untouched, and the report shows exactly what changed. *A script that blindly re-sends commands every time can't tell you what was different; an idempotent tool can.*

### The two architectural questions

**1. Agent or agentless?**

- **Agent-based:** a software **agent** is installed on every managed node. It runs continuously, talks to a central server, and applies configuration locally.
- **Agentless:** nothing is installed. The control node connects with protocols the device already speaks: **SSH**, **NETCONF**, **REST APIs**.

**2. Push or pull?**

- **Push:** the central node **sends** changes to devices when you run it.
- **Pull:** each agent **periodically asks** the server "what should I look like?" and converges itself.

**Why does agentless fit network devices so well?** Because you usually **can't install software** on a router or switch, and even where you can, you don't want a third-party daemon on your core. Every device already has SSH and, on IOS XE, NETCONF and RESTCONF (Chapter 20). An agentless tool uses what's there. *Agents suit fleets of servers you fully control; network gear favours agentless.*

| Property | **Ansible** | **Puppet** | **Chef** | **SaltStack (Salt)** |
|----------|-------------|------------|----------|----------------------|
| Architecture | **Agentless** | **Agent-based** (agent + Puppet server) | **Agent-based** (chef-client + Chef Infra Server) | **Agent-based** (minions + master); agentless via `salt-ssh` |
| Model | **Push** | **Pull** (agents check in, every **30 min** by default) | **Pull** (chef-client runs periodically) | **Push** (fast, over an event bus); minions can also pull |
| Transport to devices | SSH, NETCONF, HTTP APIs | Agent ↔ server over HTTPS | Agent ↔ server over HTTPS | ZeroMQ message bus (minions); SSH with salt-ssh |
| Language you write | **YAML** playbooks (Jinja2 templates) | Puppet **DSL** (Ruby-like) — *manifests* | **Ruby DSL** — *recipes* in *cookbooks* | **YAML** *states* (Jinja2); written in Python |
| Tool written in | Python | Ruby (server in Clojure/JRuby) | Ruby (server in Erlang) | Python |
| Network-device fit | **Excellent** — the de facto standard for network automation | Limited (agentless device modules exist; designed for servers) | Limited | Good (proxy minions for devices that can't run an agent) |
| Well-known port | **TCP 22** (SSH) or **830** (NETCONF) to each device | **TCP 8140** (agent → Puppet server) | **TCP 443** (HTTPS to Chef Infra Server) | **TCP 4505** (master publishes) / **4506** (minions return) |
| Who's in charge | **Control node** + **managed nodes** listed in an **inventory** | **Puppet server** (formerly "master") + **agents** | **Workstation** (`knife`) → **Chef Infra Server** → **nodes** running chef-client | **Master** + **minions** (or **proxy minions** for network gear) |
| Units of work | **Playbook** → **plays** → **tasks**, each calling a **module**; reusable **roles** | **Manifests** grouped into **modules**; the server compiles a **catalog** per node | **Cookbooks** containing **recipes** made of **resources** | **States** (SLS files) organized in a **top file** |
| How it learns about a node | **Facts** gathered at run time | **Facter** | **Ohai** | **Grains** (node facts); **pillars** hold per-node secrets/data on the master |

**Memory hooks:** *Ansible* is agentless, push and YAML. *Puppet and Chef* are agent-based, pull and Ruby. *Salt* is agent-based, push and YAML, with a fast message bus.

> **Exam trap:** "Which tool requires no software on the managed device?" → **Ansible**. "Which uses a pull model with agents checking in to a master?" → **Puppet** (or Chef). "Which uses Ruby-based recipes and cookbooks?" → **Chef**.

---

## 21.4 A Small Ansible Example

**Inventory** — which devices, and how to reach them (`inventory.ini`):

```ini
[branch_routers]
br1 ansible_host=10.10.1.1
br2 ansible_host=10.10.2.1

[branch_routers:vars]
ansible_network_os=cisco.ios.ios
ansible_connection=ansible.netcommon.network_cli
ansible_user=automation
ansible_password=Vault-Stored-Secret
```

**Playbook** — the desired state (`ntp.yml`):

```yaml
---
- name: Standardize NTP and login banner on branch routers
  hosts: branch_routers
  gather_facts: false

  tasks:
    - name: Ensure both NTP servers are configured
      cisco.ios.ios_config:
        lines:
          - ntp server 10.0.0.1
          - ntp server 10.0.0.2

    - name: Ensure the login banner is set
      cisco.ios.ios_banner:
        banner: login
        text: "Authorized access only"
        state: present

    - name: Save running-config if anything changed
      cisco.ios.ios_config:
        save_when: modified
```

Run it: `ansible-playbook -i inventory.ini ntp.yml`.

| Line | Meaning |
|------|---------|
| `hosts: branch_routers` | Target the inventory group |
| `gather_facts: false` | Skip server-style fact collection, which doesn't apply to routers |
| `cisco.ios.ios_config` | A **module** (fully qualified collection name) that compares `lines` with the running config and sends only what's missing |
| `ansible_connection=...network_cli` | Connect via SSH to the CLI. `ansible.netcommon.netconf` or `httpapi` would use NETCONF or REST instead. |
| `save_when: modified` | `write memory` only if a change was made |

On the first run, each router reports **changed**. On the second run, they report **ok**, because nothing needed doing. **That's idempotency you can see.** Passwords in real use live in **Ansible Vault** (encrypted), not plain text.

---

## 21.5 AI in Network Operations

ENCOR v1.2 renamed this domain **"Automation and Artificial Intelligence"**, and Chapter 16 covers Catalyst Center's AI-powered workflows. Here's the general picture you need. Expect *describe*-level questions about purpose and benefits, not machine-learning mathematics.

### Two kinds of AI, two different jobs

| Kind | What it does | Network examples |
|------|--------------|------------------|
| **Predictive / analytical AI (ML, AIOps)** | Learns **baselines** from telemetry and flags deviations; correlates many signals to a probable root cause; forecasts trends | Dynamic baselines for client onboarding times (not fixed thresholds); anomaly detection in flows (18.2); predicting link congestion or capacity exhaustion; grouping 400 alarms into one incident |
| **Generative AI (LLM assistants)** | Understands and produces natural language and code | "Why are clients at Building 4 failing to onboard?" answered from assurance data; summarising an incident; drafting a configuration, a template, an EEM applet or an Ansible playbook from a description; explaining unfamiliar `show` output |

**Why do baselines beat static thresholds?** A fixed rule like "alert if DHCP takes over 5 seconds" fires constantly on a busy Monday morning and stays silent when a quiet site degrades from 0.2 to 2 seconds. A learned baseline knows *what is normal for this site at this hour* and flags what's genuinely unusual. *AIOps turns alert floods into a short list of things that are actually wrong.*

### Guardrails — how to use AI safely

A generated configuration is a **suggestion from a very fast junior engineer who has never seen your network**. It can be fluent, confident and wrong: a non-existent command, a plausible but wrong mask, a missing `permit` that blackholes a site. Good practice:

| Guardrail | Why |
|-----------|-----|
| **Human-in-the-loop** for any change | A person reviews and approves before anything touches production |
| **Validate before deploy** | Syntax checks, a lab or digital-twin test, pre/post-change checks (e.g. neighbour counts, route counts) |
| **Least-privilege access** for AI tools | An assistant that only *reads* telemetry can't break anything; write access goes through the normal change process |
| **Change through the existing pipeline** | AI output enters the same version control, review, idempotent deployment (Ansible) and rollback path as human changes |
| **Protect sensitive data** | Configs contain secrets, keys and topology; know where prompts and data go before sharing them with a service |
| **Audit trail** | Record what was suggested, who approved it and what was deployed (the AI version of 17.4 accounting) |

*The pattern that works: AI proposes and explains, automation executes idempotently, and humans approve. Each does what it's best at.* This is the same layering as the rest of Part I: Python and APIs (Chapters 19–20) are the hands, orchestration (21.3) is the discipline, and AI is an increasingly capable advisor on top.

---

<a name="part-2"></a>
# 🛠️ Part II — ENARSI 300-410: Advanced Routing & Services

Part I got you through **ENCOR**, the core exam that every CCNP Enterprise candidate takes. Part II prepares you for **ENARSI (300-410)**, the *concentration* exam. It's shorter, at **90 minutes**, but narrower and deeper, and its verbs change. ENCOR mostly says *describe*, *configure* and *verify*. ENARSI says **troubleshoot** again and again. Of its 25 numbered topics, 18 start with that word.

That changes how you study. ENARSI rarely asks *"what does this command do?"* It shows you a broken network — a route missing from the table, a neighbor stuck, a packet taking the wrong path — and asks *why*. The chapters in this part build on Part I's foundations (OSPF in Chapter 6, EIGRP in Chapter 5, BGP in Chapter 7, VRFs in Chapter 12). They add the configuration depth and, above all, the **diagnostic reasoning** that turns "I know OSPF" into "I can find the OSPF fault in under five minutes."

> **The ENARSI weights:** Layer 3 Technologies **35%** · VPN Technologies **20%** · Infrastructure Security **20%** · Infrastructure Services **25%**. Chapters 22–28 are the Layer 3 domain, 29–30 are VPN, 31 is security and 32 is services.

---

<a name="chapter-22"></a>
# Chapter 22: The Troubleshooting Method & Administrative Distance

> **Blueprint:** ENARSI 1.1 — Troubleshoot administrative distance (all routing protocols).

## 22.1 Why a Method Beats Instinct

Every engineer has watched a colleague "troubleshoot" by changing things at random until the problem goes away. Sometimes it works. When it does, nobody knows *why* it worked. When it doesn't, the network is now broken in two ways.

A **structured method** is a way to shrink the search space on purpose. Each test you run should rule out a large chunk of the possible causes, whatever its result. *Good troubleshooting is less about knowing the answer and more about asking the question that eliminates the most wrong answers.*

The general loop never changes:

1. **Define the problem precisely.** "The internet is down" is not a problem statement. "Hosts in VLAN 20 at Branch 3 cannot reach 10.50.0.0/16; VLAN 10 can" is one.
2. **Gather facts.** Use `show` commands, logs, recent changes, and the scope of the outage (who is affected and who isn't).
3. **Form a hypothesis** that explains *all* the facts, not just some.
4. **Test it**, ideally with a command that proves or disproves it rather than a config change.
5. **Fix, then verify** that the original symptom is gone and that nothing else broke.
6. **Document** what happened, so the next person doesn't start from zero.

**Why is "who is *not* affected" so valuable?** Because the difference between a working host and a broken one points straight at the cause. If VLAN 10 works and VLAN 20 doesn't, everything the two VLANs share is ruled out: the uplink, the WAN, the core and the destination. What's left is the handful of things that differ — VLAN 20's SVI, its ACL, its DHCP scope, its HSRP group. *One comparison just eliminated most of the network.*

## 22.2 The Six Classic Approaches

Cisco's troubleshooting material names these approaches, and ENARSI scenarios quietly reward knowing when to use each one:

| Approach | How it works | Best when |
|----------|--------------|-----------|
| **Top-down** | Start at the application (Layer 7) and work down | The problem looks app-specific: "web works, VoIP doesn't" |
| **Bottom-up** | Start at the physical layer and work up | You suspect hardware or cabling, or have no clue at all. Thorough but slow |
| **Divide-and-conquer** | Start in the middle (usually Layer 3: *can I ping it?*) and go up or down depending on the result | The most common default: one ping splits the OSI stack in half |
| **Follow-the-path** | Trace the packet hop by hop from source to destination, checking each device's forwarding decision | Routing problems: the best fit for most ENARSI questions |
| **Compare configurations** | Diff a broken device against a known-good one | Sites built from a template, or a change that "only touched one thing" |
| **Swap components** | Replace a suspect part (a cable, an SFP, a whole device) and see if the problem follows it | Suspected hardware; it isolates the fault but doesn't explain it |

**Why is follow-the-path the natural fit for routing problems?** Because each router makes its forwarding decision **independently**, using only its own tables (CCNA guide 14.8). A packet that fails somewhere fails at *one specific router*, the one whose table holds the wrong answer. Following the path finds that router directly, without guessing. *Routing faults are local decisions with global symptoms; follow-the-path turns the global symptom back into the one local decision that caused it.*

**Exam trap:** don't treat these as competitors. Real troubleshooting chains them. You divide-and-conquer with a ping, follow the path with `traceroute` to find the failing hop, then compare that hop's config with its healthy twin.

## 22.3 A Repeatable Workflow for "The Route Is Wrong"

Most Layer 3 tickets reduce to one of three complaints: **the route is missing**, **the route points the wrong way**, or **traffic is dropped even though the route looks right**. The same set of questions answers all three. Ask them in this order on the router where traffic goes astray:

| Step | Question | Command that answers it |
|------|----------|-------------------------|
| 1 | Is there a route for the destination at all? Which prefix matches (longest match)? | `show ip route 10.50.1.1` |
| 2 | Which **source** installed it (connected, static, OSPF, EIGRP, BGP)? | The route code and `[AD/metric]` in that output |
| 3 | Did another source *also* offer this prefix and lose? | `show ip ospf database`, `show ip eigrp topology`, `show bgp ipv4 unicast <prefix>` |
| 4 | If the expected source lost, was it on **AD**, or did that protocol never learn it? | Compare ADs; check the protocol's own table |
| 5 | Is the next hop reachable, and what does the forwarding plane actually do? | `show ip cef 10.50.1.1 detail`, `show adjacency` |
| 6 | Is something *overriding* the table — PBR, an ACL, a VRF? | `show ip policy`, `show ip interface`, `show vrf` |

`show ip route <address>` (with an address, not a prefix) is the single most useful routing command. It runs the router's real longest-match lookup and tells you everything about the winning route:

```
R2# show ip route 10.50.1.1
Routing entry for 10.50.0.0/16
  Known via "ospf 1", distance 110, metric 20, type extern 2, forward metric 2
  Last update from 10.0.23.3 on GigabitEthernet0/1, 00:12:41 ago
  Routing Descriptor Blocks:
  * 10.0.23.3, from 3.3.3.3, 00:12:41 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1
```

**Read it like a detective:** this route came from OSPF (`Known via "ospf 1"`), it's an **E2 external** (so someone *redistributed* it — Chapter 24), its originator was router 3.3.3.3 (`from 3.3.3.3`), and the next hop is 10.0.23.3. If you expected this prefix to come from EIGRP, you now have your question: *why did OSPF's 110 beat EIGRP?* The answer is almost always administrative distance (22.5).

**Why check the protocol's own table in step 3, not just the routing table?** Because the routing table shows only **winners**. A prefix can sit perfectly healthy in the EIGRP topology table, or in the BGP table, and simply lose the AD contest. If you look only at `show ip route`, it looks as if EIGRP "doesn't know" the route, and you'll waste an hour debugging EIGRP neighbors that are fine. *The RIB is the result of the election; the protocol tables are the ballots.*

## 22.4 Control Plane vs Data Plane — the RIB and the FIB

![Routing protocols feed the RIB, CEF builds the FIB and adjacency table from it](images/c22_rib_fib.png)

The routing table is not what actually forwards packets on a modern Cisco router. There are two layers:

| Structure | Built by | Contains | Used for |
|-----------|----------|----------|----------|
| **RIB** — routing table (`show ip route`) | The control plane: every routing source competes, best AD wins | Best route per prefix, possibly a *recursive* next hop | Deciding **what** the best path is |
| **FIB** — CEF table (`show ip cef`) | CEF, copied from the RIB with recursion already resolved | Prefix → resolved next hop + outgoing interface | Forwarding every packet at speed |
| **Adjacency table** (`show adjacency`) | CEF, from ARP / neighbor discovery | Next hop → pre-built Layer 2 header (rewrite string) | Building the outgoing frame |

**Why split them at all — why not forward straight from the routing table?** Because the routing table is built for *deciding*, not *forwarding*. A BGP route might say "next hop 192.0.2.1", which is three recursive lookups away from an actual interface. Doing that recursion for **every packet** would be painfully slow. CEF does it **once**, when the route changes, and stores the answer. It even pre-builds the Ethernet header in the adjacency table, so forwarding becomes a single lookup plus a header copy. *The RIB thinks; the FIB just acts, quickly, on what the RIB already decided.*

This matters in troubleshooting because the two can **disagree** for short periods, or when something has gone wrong. CEF also has forwarding states the RIB never shows:

```
R2# show ip cef 10.50.1.1 detail
10.50.0.0/16, epoch 2
  nexthop 10.0.23.3 GigabitEthernet0/1

R2# show adjacency GigabitEthernet0/1 detail
Protocol Interface                 Address
IP       GigabitEthernet0/1        10.0.23.3(10)
                                   0 packets, 0 bytes
                                   epoch 0
                                   sourced in sev-epoch 2
                                   Encap length 14
                                   5254001A2B3C5254004D5E6F0800
                                   ARP
```

That long hex string is the **rewrite**: destination MAC, source MAC and EtherType 0x0800, ready to stamp onto every packet. If ARP for the next hop has failed, you'll see the adjacency as **incomplete**, and packets matching that route are dropped — even though `show ip route` looks perfect.

| CEF entry you see | What it means |
|-------------------|---------------|
| `nexthop 10.0.23.3 Gi0/1` | Normal: forward out Gi0/1 using that adjacency |
| `attached` | Directly connected subnet: ARP for the destination itself |
| `receive` | Addressed to the router itself: punt to the CPU (control plane) |
| `drop` / `discard` | Deliberately dropped, e.g. a route to Null0 (a summary discard route, 24.6) |
| `glean` | Connected subnet, but no ARP entry yet for the host: the router ARPs first |
| `punt` | CEF can't switch it; hand it to process switching (slow path) |

Two more CEF tools earn their place in an ENARSI troubleshooting kit:

```
R2# show ip cef exact-route 10.1.1.10 10.50.1.1   ! which ECMP link will THIS flow use?
R2# show ip cef 10.50.0.0 255.255.0.0 internal    ! deep detail incl. load-share buckets
```

`exact-route` answers the question that confuses people with equal-cost paths: "traceroute went one way, but the user's traffic goes another." CEF load-shares **per flow** by hashing source and destination (like EtherChannel, CCNA guide 10.4). Different flows can legitimately take different paths.

## 22.5 Administrative Distance — How the Router Chooses Between Sources

You met AD at CCNA (CCNA guide 14.4): when two **different sources** offer the same prefix, the **lower AD wins**. Metric only compares routes *within* one protocol. ENARSI expects you to know the complete table and to recognize the problems it causes.

| Route source | Default AD | Note |
|--------------|-----------|------|
| Connected interface | **0** | Includes the local /32 (`L`) routes |
| Static route | **1** | Static pointing only to an interface is also 1 (old docs said 0) |
| EIGRP summary route | **5** | The local Null0 discard route a summary creates (24.6) |
| External BGP (eBGP) | **20** | Learned from a different AS |
| EIGRP internal | **90** | Routes native to the EIGRP AS |
| IGRP | **100** | Obsolete; still on the exam list |
| OSPF | **110** | All types: intra, inter, E1, E2, N1, N2 |
| IS-IS | **115** | |
| RIP | **120** | |
| ODR (On-Demand Routing) | **160** | Legacy CDP-based hub-and-spoke |
| EIGRP external | **170** | Redistributed into EIGRP |
| Internal BGP (iBGP) | **200** | Learned from the same AS |
| BGP local (aggregates, `network` backdoor) | **200** | Locally generated BGP routes |
| NHRP | **250** | DMVPN shortcut routes (Chapter 30) |
| DHCP-learned default route | **254** | Default route installed by `ip address dhcp`; also OSPF's default for its external-summary discard route |
| Unknown / unreachable | **255** | **Never** installed |

**Why does eBGP get 20 but iBGP 200 — the same protocol with wildly different trust?** Because the two are learned in completely different situations. An eBGP route comes from a *directly attached neighbor in another AS*, usually your ISP, and is often the only way to reach that prefix. It should beat your IGPs. An iBGP route was carried across your own AS, and your **IGP already knows how to reach anything inside your AS** more precisely. If iBGP routes beat the IGP, a BGP route could hijack your internal paths and create loops, since iBGP next hops themselves are resolved through the IGP. So iBGP is pushed below every IGP. *eBGP is "news from outside, believe it"; iBGP is "rumor about our own house, let the IGP decide."*

**Why is EIGRP external (170) so much worse than EIGRP internal (90)?** Because an external route was **redistributed** from somewhere else, and redistribution throws away the original protocol's loop information (23.6). EIGRP deliberately trusts those routes less, so if the same prefix is *also* learned natively by some protocol, the native path wins. This one design decision prevents many redistribution loops. *Lower trust for second-hand information is a built-in safety margin.*

### Floating Static Routes

A static route with a **raised AD** sits idle as long as a better source offers the prefix, and "floats" into the RIB the moment that source withdraws it:

```
R1(config)# ip route 0.0.0.0 0.0.0.0 10.0.12.2        ! primary default, AD 1
R1(config)# ip route 0.0.0.0 0.0.0.0 172.16.0.1 250   ! backup via LTE, AD 250
```

### When Two Sources Tie on AD

AD is designed to be unique per protocol, but `distance` lets you create a tie, for example two OSPF processes (both 110) offering the same prefix, or EIGRP raised to 110 to match OSPF. Know three facts:

- **There is no load sharing across protocols or processes.** Only **one** source is installed for a prefix. ECMP only happens between paths *inside* one routing process.
- **Which source wins a tie is implementation behaviour, not a rule you can design around.** IOS typically keeps the route that is already installed, and some releases fall back to the protocols' *default* ADs to break the tie. The result can therefore depend on which protocol converged first. That makes it non-deterministic after a reload. *Never leave two protocols at the same AD on purpose.*
- **Two static routes with the same AD to the same prefix *do* load-share.** They are the same source, so both go into the RIB and CEF splits flows across them. That's why a floating static must use a different AD from the primary.

**Exam trap:** a floating static must have an AD **higher** than the route it backs up. A backup for an OSPF-learned route needs an AD above 110 — set it at 111 or more. Leave the backup at the default AD of 1 and it beats OSPF immediately, so your "backup" link carries all the traffic.

## 22.6 Changing AD — the `distance` Command, Protocol by Protocol

Each protocol tunes AD differently, and the syntax is a favorite exam detail:

```
! OSPF — per route type
R1(config)# router ospf 1
R1(config-router)# distance ospf intra-area 110 inter-area 110 external 175

! EIGRP — internal and external (classic mode)
R1(config)# router eigrp 100
R1(config-router)# distance eigrp 90 175

! EIGRP named mode — same command, under the topology
R1(config)# router eigrp CAMPUS
R1(config-router)# address-family ipv4 unicast autonomous-system 100
R1(config-router-af)# topology base
R1(config-router-af-topology)# distance eigrp 90 175

! BGP — external, internal, local
R1(config)# router bgp 65001
R1(config-router)# address-family ipv4 unicast
R1(config-router-af)# distance bgp 20 200 200

! RIP, or any protocol: one AD for routes from a given source
R1(config)# router rip
R1(config-router)# distance 125
```

There is also a generic, **per-source** form that changes AD only for routes learned from particular neighbors, optionally only for prefixes matching an ACL:

```
R1(config)# access-list 10 permit 10.50.0.0 0.0.255.255
R1(config)# router ospf 1
R1(config-router)# distance 200 3.3.3.3 0.0.0.0 10
!               AD^   ^source  ^wildcard  ^ACL: only these prefixes
```

For EIGRP the per-source form works the same way (`distance 95 10.0.12.2 0.0.0.0 10` under `router eigrp 100`), but it is documented to affect **internal** EIGRP routes. External EIGRP routes keep the distance set by `distance eigrp <internal> <external>`. If a per-source change "does nothing" to a D EX route, that is why. Confirm the result with `show ip route <prefix>` rather than trusting the config.

**Exam trap:** for OSPF, the "source" in that command is the **Router ID of the router that originated the LSA** — not the neighbor's interface address. For EIGRP, RIP and BGP it's the **neighbor's IP address**. Getting this wrong means the command matches nothing and silently does nothing.

**Why would you ever change AD instead of fixing the metric?** Because metrics only compete *inside* one protocol. If OSPF and EIGRP both offer a prefix, no OSPF cost and no EIGRP delay will change the outcome. AD is the only lever that works *between* protocols. *Metric picks the best road on one map; AD picks which map to trust.*

### The BGP Backdoor

A special AD case: say you learn a partner's network over eBGP (AD 20), but you also have a private back-to-back link to that partner running OSPF (AD 110). eBGP wins and your traffic crosses the internet instead of the private link. The `backdoor` keyword fixes this:

```
R1(config-router-af)# network 172.30.0.0 mask 255.255.0.0 backdoor
```

This tells BGP: *"treat my eBGP-learned copy of this prefix as AD 200 (local)."* The IGP's 110 now wins. The prefix is **not** advertised by this `network` statement — `backdoor` only changes the distance.

## 22.7 When AD Causes the Problem

AD is a blunt rule: it doesn't care about path quality, only about *who said it*. Three classic ENARSI scenarios come from that:

**1. Suboptimal routing after redistribution.** Router R3 redistributes EIGRP into OSPF. Another router, R4, runs **both** protocols and learns a distant EIGRP-native prefix two ways: as **EIGRP internal (90)** over a slow path, and as **OSPF E2 (110)** over a fast path. EIGRP wins on AD, so R4 takes the slow path. Nothing is "broken", but users complain. The fix is to lower OSPF's AD for exactly those prefixes, or change where redistribution happens. (A trickier case — EIGRP *external* routes at 170 losing to OSPF's 110 — is in 24.4.)

**2. A backup that isn't.** A floating static at AD 5 meant to back up EIGRP (90) is always preferred. The "backup" link carries everything — until somebody notices the bill.

**3. Routing loops at two-point mutual redistribution.** A prefix travels out of a domain at one boundary router and back into it at another, now wearing a *better* AD than the original. Routers start preferring the looped-back copy. This is the most important AD problem on the exam, and it gets its own section with the fix (24.4).

| Symptom | Likely AD cause | Command that proves it |
|---------|-----------------|------------------------|
| Traffic takes a slow path although a faster one exists | Faster path learned by a higher-AD protocol | `show ip route <dest>` — check *Known via* and distance |
| Backup link carries traffic while primary is up | Floating static AD too low | `show ip route static`, `show run | include ip route` |
| Route flaps between two next hops every few seconds | Mutual redistribution feedback | `show ip route <dest>` repeatedly; watch *Known via* change |
| Expected protocol's route missing from RIB | Lost on AD to another source | `show ip eigrp topology <prefix>` / `show ip ospf database` — present but not installed |
| `distance` command has no effect | Wrong source (OSPF RID vs neighbor IP) or ACL mismatch | `show ip protocols` shows the distance list; verify the ACL |
| Partner prefix goes via internet, not private link | eBGP (20) beating the IGP | `show ip route <prefix>` shows `bgp`; fix with `backdoor` |

**Verify what you set:** `show ip protocols` lists every distance a protocol is using, including per-source entries:

```
R1# show ip protocols | section ospf
Routing Protocol is "ospf 1"
  ...
  Routing Information Sources:
    Gateway         Distance      Last Update
    3.3.3.3              200      00:03:12
    2.2.2.2              110      00:03:12
  Distance: (default is 110)
    Address         Wild mask       Distance  List
    3.3.3.3         0.0.0.0              200  10
  Distance: intra-area 110 inter-area 110 external 175
```

Read it from the bottom up. The **Address / Wild mask / Distance / List** block is the per-source rule: LSAs originated by RID 3.3.3.3, for prefixes permitted by ACL 10, get AD 200. The **Routing Information Sources** table shows it taking effect, with 3.3.3.3 at 200. If the block is there but the source still shows 110, the ACL doesn't match the prefixes you think it does.

---

<a name="chapter-23"></a>
# Chapter 23: Route Maps, Prefix Lists & Loop Prevention

> **Blueprint:** ENARSI 1.2 — Troubleshoot route map for any routing protocol (attributes, tagging, filtering); ENARSI 1.3 — Troubleshoot loop prevention mechanisms (filtering, tagging, split horizon, route poisoning).

## 23.1 Why Policy Tools Exist

Out of the box, a routing protocol advertises everything it knows, to everyone it can, and prefers paths by its own metric. Real networks need to say things like:

- "Advertise our customer subnets to the ISP, but **never** our infrastructure /30s."
- "Redistribute EIGRP into OSPF, but mark every route so it can't come back later."
- "Send web traffic from the guest VLAN out the cheap link, whatever the routing table says."

Saying that takes two kinds of tool. **Matching tools** — prefix lists and ACLs — pick out *which* routes or packets you mean. **Policy tools** — route maps — say *what to do* with them: permit, deny, or change an attribute. *A prefix list is the noun; a route map is the sentence.*

## 23.2 Prefix Lists — Matching Routes Precisely

![How ge and le define the range of prefix lengths a prefix-list entry matches](images/c23_prefix_range.png)

A prefix list entry has two parts, and **both** must match for a route to match:

1. **The network bits.** The first *N* bits of the route must equal the first *N* bits of the entry, where *N* is the entry's prefix length.
2. **The prefix length.** The route's length must fall in the allowed range. With no `ge`/`le`, the range is exactly *N*. `ge` sets a minimum length, `le` sets a maximum.

```
ip prefix-list NAME [seq n] {permit | deny} network/len [ge min] [le max]
```

The rule IOS enforces is **len < ge ≤ le ≤ 32**. If you give only `ge`, the maximum becomes 32. If you give only `le`, the minimum stays *len*.

| Entry | Matches | Doesn't match |
|-------|---------|---------------|
| `10.0.0.0/8` | 10.0.0.0/8 **only** | 10.1.0.0/16 (wrong length) |
| `10.0.0.0/8 le 24` | Anything inside 10/8 with length **8–24**: 10.0.0.0/8, 10.1.0.0/16, 10.1.2.0/24 | 10.1.2.0/25, 10.1.2.1/32 |
| `10.0.0.0/8 ge 24` | Anything inside 10/8 with length **24–32** | 10.1.0.0/16 |
| `10.0.0.0/8 ge 24 le 24` | Only the **/24s** inside 10/8 | 10.1.2.0/23, 10.1.2.0/25 |
| `172.16.0.0/16 ge 20 le 22` | 172.16.32.0/20, 172.16.4.0/22 | 172.16.0.0/16, 172.17.0.0/20 (wrong network bits) |
| `0.0.0.0/0` | The **default route only** | Everything else |
| `0.0.0.0/0 le 32` | **Every** IPv4 route ("permit any") | — |
| `0.0.0.0/0 ge 32` | Every **host route** (/32) | Anything shorter |
| `0.0.0.0/0 ge 25` | Every route **longer than /24** | /24 and shorter |

### Try It ✏️ — Does It Match?

The entry is `ip prefix-list P permit 192.168.0.0/16 ge 24 le 26`. For each route: do the first 16 bits equal 192.168? Is the length between 24 and 26?

| Route | First 16 bits = 192.168? | Length 24–26? | Result |
|-------|--------------------------|---------------|--------|
| 192.168.10.0/24 | Yes | 24 — yes | **Match** |
| 192.168.10.128/25 | Yes | 25 — yes | **Match** |
| 192.168.0.0/16 | Yes | 16 — no | No match |
| 192.168.10.4/30 | Yes | 30 — no | No match |
| 192.169.1.0/24 | No (192.169) | — | No match |

**Why do prefix lists need a length range at all — isn't the network enough?** Because in routing, **10.0.0.0/8 and 10.0.0.0/24 are different routes**, even though they start at the same address. A summary and one of its components share network bits and differ only in length. An ACL can't easily express "the /8 but not the /24"; a prefix list does it in one line. *The length is part of a route's identity, so a route-matching tool has to match it.*

### Sequence Numbers, Implicit Deny, and Order

Entries are checked in **sequence-number order** (default steps of 5), and the **first match wins**. Anything that matches no entry is **denied** by an invisible final entry. Sequence numbers let you insert a line later without rewriting the list:

```
ip prefix-list TO-ISP seq 5  deny   10.0.0.0/8 le 32        ! no internal space
ip prefix-list TO-ISP seq 10 permit 203.0.113.0/24          ! our public block
ip prefix-list TO-ISP seq 15 permit 198.51.100.0/24 le 25   ! customer block + halves
```

```
R1# show ip prefix-list detail TO-ISP
ip prefix-list TO-ISP:
   count: 3, range entries: 2, sequences: 5 - 15, refcount: 2
   seq 5 deny 10.0.0.0/8 le 32 (hit count: 14, refcount: 1)
   seq 10 permit 203.0.113.0/24 (hit count: 2, refcount: 1)
   seq 15 permit 198.51.100.0/24 le 25 (hit count: 0, refcount: 1)
```

**Hit counts are your best troubleshooting friend.** An entry with hit count 0 that *should* be matching is either written wrong or never consulted.

IPv6 works identically with `ipv6 prefix-list`, with lengths up to 128.

**Exam trap: the silent rewrite.** Type `ip prefix-list P permit 10.1.1.0/16` and IOS doesn't reject it. It **zeroes the host bits** and stores `10.1.0.0/16`. Because the entry was "fixed" for you, it may match far more (or other) routes than you meant. Always check `show run | include prefix-list` or `show ip prefix-list` after typing one, and read what IOS actually stored.

## 23.3 ACLs for Route Matching — and Why Prefix Lists Usually Win

Older configs (and some exam questions) match routes with ACLs. Here an ACL tests the **route**, not a packet, so its fields mean something different:

| ACL type | What it checks when matching routes |
|----------|-------------------------------------|
| **Standard** | Only the **network address**, against the wildcard. It **cannot see the prefix length**: `permit 10.1.0.0 0.0.255.255` matches 10.1.0.0/16, 10.1.5.0/24 *and* 10.1.5.4/30 |
| **Extended — in BGP** (route maps, `neighbor distribute-list`) | The "source" field matches the **network address**; the "destination" field matches the **subnet mask** |
| **Extended — in an IGP distribute list** (EIGRP, RIP) | The "source" field matches the **update source**, the neighbour that advertised the route; the "destination" field matches the **network address** |

The two extended-ACL meanings are a favourite trick. In an EIGRP `distribute-list 110 in`, `access-list 110 deny ip host 10.0.12.2 10.50.0.0 0.0.255.255` means "ignore 10.50.x.x **when heard from 10.0.12.2**", which is per-neighbour filtering by prefix. The prefix-list form of the same idea is `distribute-list prefix NETS gateway NEIGHBORS in` (below). Behaviour for extended ACLs in other IGP contexts, such as redistribution route maps, is less consistent across releases. That's one more reason to use prefix lists for routes.

So to match *exactly* the /24s inside 10.1.0.0/16 with an extended ACL in **BGP**:

```
access-list 101 permit ip 10.1.0.0 0.0.255.0 host 255.255.255.0
!                         ^network: 10.1.x.0   ^mask: exactly /24
```

That works, but compare it with `ip prefix-list P permit 10.1.0.0/16 ge 24 le 24`. Prefix lists are clearer, they're processed more efficiently, they can be edited by sequence number, and they show hit counts. *Use ACLs to match packets and prefix lists to match routes* — the one big exception is PBR (Chapter 25), which matches **packets** and so uses ACLs.

**Exam trap:** the same extended ACL means three different things depending on where it's referenced. In **BGP** it's network/mask. In an **IGP distribute list** it's neighbour/network. In **PBR** it's an ordinary packet filter with source and destination addresses. *Before reading an extended ACL, find out who is calling it.*

## 23.4 Route Maps — If/Then Logic for Routing

![A route map is evaluated clause by clause; the first clause that matches decides, and an unmatched route hits the implicit deny](images/c23_route_map_flow.png)

A route map is an ordered list of **clauses** (sequence numbers). Each clause has an action (`permit` or `deny`), optional `match` statements (the *if*), and optional `set` statements (the *then*):

```
route-map RM-OSPF-TO-EIGRP deny 10
 match ip address prefix-list INFRA-P2P        ! if it's an infrastructure /30...
!                                               ...drop it (deny), stop here
route-map RM-OSPF-TO-EIGRP permit 20
 match ip address prefix-list BRANCH-LANS      ! if it's a branch LAN...
 set tag 110                                   ! ...mark it, and accept it
route-map RM-OSPF-TO-EIGRP permit 30           ! no match = matches everything
 set tag 111                                   ! accept the rest, marked differently
```

The evaluation rules, every one of which shows up in troubleshooting questions:

| Rule | Detail |
|------|--------|
| **Top to bottom, first match wins** | Clauses are tried in sequence order; once one matches, its action is applied and processing **stops** (unless `continue`, below) |
| **`permit` / `deny` mean different things by context** | In redistribution and BGP filtering: permit = accept the route, deny = filter it. In PBR: permit = policy-route the packet, deny = **route normally** |
| **Implicit deny at the end** | A route that matches no clause is denied: not redistributed, not advertised, not accepted |
| **A clause with no `match` matches everything** | That's how you write a final "permit the rest" clause |
| **Different match types in one clause = AND** | `match ip address prefix-list X` + `match tag 5` → both must be true |
| **Several values in one match = OR** | `match ip address prefix-list A B` → in A **or** in B. Two `match ip address` lines in one clause merge into one line, so they're OR too |
| **`set` only runs on a permit match** | `set` statements in a deny clause do nothing |

**Why does the meaning of "deny" change with context?** Because the route map itself only answers one question: *"does this item fall into this clause, and is the clause permit or deny?"* What "deny" *does* belongs to the feature calling the route map. Redistribution asks "should I redistribute this?", so deny means no. PBR asks "should I apply special forwarding?", so deny means "no special treatment" — normal routing, not a drop. *The route map is a classifier; the feature decides the consequence.*

### Prefix-List Deny Inside a Route-Map Permit

This combination trips up almost everyone:

```
ip prefix-list LANS seq 5 deny   10.9.0.0/16
ip prefix-list LANS seq 10 permit 10.0.0.0/8 le 24
route-map RM permit 10
 match ip address prefix-list LANS
```

10.9.0.0/16 hits the prefix list's **deny**. That does *not* mean "drop the route". It means **"this clause doesn't match."** The route falls through to the next clause, and with no next clause, the implicit deny filters it. Here the outcome is the same, but add a `route-map RM permit 20` with no match and 10.9.0.0/16 is suddenly accepted by clause 20. *Inside a route map, a match list's deny means "not me", never "drop".*

### Common `set` Clauses

| Set clause | Used with | Effect |
|------------|-----------|--------|
| `set metric 100000 100 255 1 1500` | Redistribution into EIGRP | Seed metric: bandwidth, delay, reliability, load, MTU |
| `set metric 50` | Into OSPF / RIP / BGP (MED) | Seed cost / hop count / MED |
| `set metric-type type-1` | Into OSPF | E1 instead of the default E2 |
| `set tag 110` | Redistribution | Marks the route (23.5) |
| `set local-preference 200` | BGP inbound | Prefer this exit for the whole AS |
| `set weight 500` | BGP inbound | Prefer on this router only |
| `set as-path prepend 65001 65001` | BGP outbound | Make our path look longer to the neighbor |
| `set community 65001:100` | BGP | Attach a community tag |
| `set ip next-hop 10.1.1.1` | PBR / BGP | Override the next hop |

### More `match` Options

`match ip address` is the most common, but troubleshooting questions use the others:

| Match clause | Matches routes… | Typical use |
|--------------|-----------------|-------------|
| `match ip address prefix-list NAME` | by prefix and length | Almost everything |
| `match ip route-source prefix-list NAME` | by the **advertising router's** address | "Accept this prefix only from R3" |
| `match ip next-hop prefix-list NAME` | by next-hop address | Policy by exit point |
| `match route-type internal` / `external type-1` / `external type-2` / `nssa-external` / `local` | by route type | `redistribute ospf 1 route-map X` taking only E2s, or only internals |
| `match interface Gi0/1` | whose next hop is out that interface | Redistributing only routes learned on one link |
| `match metric 20 [+- deviation]` | by metric value | Selecting OSPF externals seeded at a known metric |
| `match tag 90` | by route tag (23.5) | Loop prevention at redistribution points |
| `match source-protocol ospf 1` | by the protocol that installed the route | Mixed-source redistribution (IOS XE) |

### `continue` — Evaluating More Than One Clause

Normally the first matching clause ends processing. In **BGP** route maps you can add `continue` so that, after a clause matches and its `set` runs, evaluation carries on to a later clause. That lets independent policies stack — tag by region in one clause, set local preference by customer type in another:

```
route-map FROM-PEER permit 10
 match ip address prefix-list EU-ROUTES
 set community 65001:44 additive
 continue 20                                ! keep going to clause 20
route-map FROM-PEER permit 20
 match ip address prefix-list GOLD-CUSTOMERS
 set local-preference 200
route-map FROM-PEER permit 30               ! accept everything else unchanged
```

### Where Route Maps Get Applied

| Feature | Command | Chapter |
|---------|---------|---------|
| Redistribution | `redistribute ospf 1 route-map NAME` | 24 |
| BGP neighbor policy | `neighbor 192.0.2.1 route-map NAME in|out` | 28 |
| Policy-based routing | `ip policy route-map NAME` (interface) | 25 |
| Distribute list (IGP filtering) | `distribute-list route-map NAME in` | below |
| Conditional default | `default-information originate route-map NAME` | 24.8 |

### Distribute Lists — Filtering an IGP

A **distribute list** filters routes in or out of a routing protocol. It can reference an ACL, a prefix list or a route map:

```
router eigrp 100
 distribute-list prefix NO-LAB in GigabitEthernet0/1    ! ignore these updates from Gi0/1
 distribute-list prefix CORE-ONLY out GigabitEthernet0/2 ! advertise only these out Gi0/2
!
router ospf 1
 distribute-list route-map NOT-IN-RIB in                 ! keep these out of the RIB
```

You can also filter by **who** advertised a route, not just what it is. The `gateway` keyword adds a second prefix list that matches the **update source**:

```
ip prefix-list LAB-NETS  seq 5 permit 10.99.0.0/16 le 32
ip prefix-list FROM-R3   seq 5 permit 10.0.13.3/32
!
router eigrp 100
 distribute-list prefix LAB-NETS gateway FROM-R3 in    ! accept lab nets only from R3
```

A route must match **both** lists to be permitted: the right prefix *and* the right neighbour. Routes from other neighbours fail the gateway list and are denied, so add further entries if they should be allowed. `distribute-list gateway NAME in` on its own filters purely by neighbour.

### Offset Lists — Nudging a Distance-Vector Metric

A distribute list is all-or-nothing. An **offset list** keeps the route but makes it look **worse** by adding to its metric, which steers path selection without removing anything. It exists for the distance-vector protocols, **EIGRP and RIP** (OSPF has `ip ospf cost` instead):

```
access-list 20 permit 10.50.0.0 0.0.255.255
!
router eigrp 100
 offset-list 20 in 50000 GigabitEthernet0/2   ! routes in ACL 20 heard on Gi0/2: +50000
!
router rip
 offset-list 0 out 3 GigabitEthernet0/1        ! ACL 0 = every route; RIP hop count +3
```

The syntax is `offset-list {acl | 0} {in | out} <offset> [interface]`. `in` adjusts routes as they're received, `out` adjusts what you advertise, and **ACL number 0 means "all routes"**. Leave off the interface and it applies on every interface. In EIGRP named mode the command lives under `topology base`. Chapter 26 shows what the offset does to EIGRP's FD and RD and therefore to the feasibility condition.

**Why add metric instead of filtering?** Because filtering removes the path entirely, while an offset only changes its *rank*. The worse path stays in the topology table and can still take over if the preferred one fails. *A distribute list is a wall; an offset list is a toll — traffic avoids it, but it's still open.*

**Why can't an OSPF distribute list filter what neighbors learn?** Because OSPF doesn't advertise *routes*. It floods **LSAs**, and every router in an area must hold an identical LSDB (CCNA guide 16.11). A distribute list can't edit the LSDB without breaking that rule, so OSPF's `distribute-list in` only stops the result of SPF from entering **this router's** RIB. The LSAs still flood onward. To really stop routes from spreading in OSPF you filter at the boundaries where routes are *created*: on an ABR with `area X filter-list prefix NAME in|out` or `area X range ... not-advertise` (Chapter 6, 6.6, and 24.6; a troubleshooting walk-through is in 27.10), or on an ASBR by filtering redistribution (where `distribute-list out` does work, on redistributed routes only). *In OSPF, filter where information is summarized or born, not where it's flooded.*

**Exam trap:** an OSPF `distribute-list in` can create a **black hole**. The filtering router keeps flooding the LSA, so its neighbors still compute a path *through* it — and it drops the traffic, because the route isn't in its own table.

## 23.5 Route Tagging

A **tag** is a 32-bit number attached to a route. Routing protocols carry it but never act on it themselves — it's a sticky note for **your** policies. OSPF carries it in external (Type 5/7) LSAs, EIGRP in external routes, and RIPv2 in every route. BGP has no tag attribute of its own (it uses communities), but tags can be mapped to and from BGP during redistribution.

```
route-map EIGRP-TO-OSPF permit 10
 set tag 90                         ! "this route was born in EIGRP"
!
route-map OSPF-TO-EIGRP deny 10
 match tag 90                       ! "it was born in EIGRP — don't send it back"
route-map OSPF-TO-EIGRP permit 20
```

**Why tag at all, instead of filtering by prefix?** Because prefix filters must be **maintained**: every new subnet means editing lists on every boundary router, and the one you forget becomes a loop. A tag records a route's *origin*, which stays true however many subnets get added. *Prefix filters describe a network as it was; tags describe where a route came from, which never goes out of date.* Chapter 24 uses exactly this to make two-point mutual redistribution safe.

```
R2# show ip route 10.20.0.0
Routing entry for 10.20.0.0/16
  Known via "ospf 1", distance 110, metric 20
  Tag 90, type extern 2, forward metric 1
```

## 23.6 Loop Prevention — Every Mechanism, and What It Defends

A routing loop happens when routers disagree about a path, so packets bounce between them until their TTL runs out. Each protocol family has its own defenses:

| Mechanism | Protocol(s) | How it prevents loops |
|-----------|-------------|-----------------------|
| **Split horizon** | RIP, EIGRP (on by default) | Never advertise a route out of the interface you learned it on — the neighbor that told you doesn't need to hear it back |
| **Route poisoning** | RIP, EIGRP | When a route fails, advertise it as **unreachable** (RIP metric 16; EIGRP infinite delay) instead of just going silent |
| **Poison reverse** | RIP, EIGRP | Advertise a learned route *back* to its source with an infinite metric — an explicit "don't use me for this" that overrides split horizon |
| **Hold-down timers** | RIP (180 s) | After a route fails, ignore *worse* news about it for a while, so stale information can't resurrect it |
| **Maximum hop count** | RIP (15), EIGRP (100 by default, up to 255) | Counting to infinity stops at a ceiling |
| **Feasibility condition (DUAL)** | EIGRP | Only accept a backup path that's provably loop-free (Chapter 26) |
| **Identical LSDB + SPF** | OSPF, IS-IS | Every router computes a tree from the same map, so loops can't form inside an area |
| **Area 0 hub rule** | OSPF | Inter-area routes must pass through the backbone; ABRs ignore Type 3 LSAs received from non-backbone areas (Chapter 27) |
| **AS_PATH check** | eBGP | Reject any route whose AS_PATH already contains your own AS |
| **iBGP split horizon** | iBGP | Never pass iBGP-learned routes to other iBGP peers (hence full mesh or route reflectors with ORIGINATOR_ID and CLUSTER_LIST — Chapter 28) |
| **TTL** | IP itself | Even if all else fails, a looping packet dies after at most 255 hops |
| **Tagging + filtering** | Redistribution | Stop routes from re-entering the domain they came from (24.4) |

**Why did distance-vector protocols need so many add-ons?** Because a distance-vector router believes its neighbors (CCNA guide 16.2). When a network fails, router A may hear from B that "I can reach it in 3", not knowing B's path runs back through A. The two routers then pass the dead route back and forth, each adding one, and **count to infinity**. Each mechanism closes one door: split horizon stops the most direct echo, poisoning spreads bad news actively, hold-down stops old good news from overriding new bad news, and the hop limit puts an end to the counting. *Link-state needs fewer patches because no router trusts another's conclusions — only its raw facts.*

**RIP footnote:** on legacy **Frame Relay physical (multipoint) interfaces**, IOS turned RIP split horizon **off by default**, because spokes behind one interface had to hear each other. Subinterfaces kept it on. You'll only see this in older exam scenarios, but it explains why the same RIP config behaved differently on `Serial0` and `Serial0.1`.

**Exam trap — split horizon on a hub:** on a DMVPN or Frame Relay-style hub, every spoke arrives on **one** multipoint interface. Split horizon stops the hub from advertising spoke A's routes out that same interface to spoke B. With EIGRP over DMVPN you must disable it on the hub (Chapter 30):

```
interface Tunnel0
 no ip split-horizon eigrp 100           ! classic mode
!
router eigrp DMVPN                        ! named mode equivalent
 address-family ipv4 unicast autonomous-system 100
  af-interface Tunnel0
   no split-horizon
```

**Why can redistribution break all of these at once?** Because every mechanism above works **inside one protocol**. When a route crosses into another protocol, it loses its history: its AS_PATH, its original metric, the fact that it was a feasible successor. To the new protocol it's a brand-new external route. Send it back into its original protocol at a second router and nothing remembers it has been there before. *Redistribution is the one place where you have to supply the memory yourself — that's what tags are for.*

## 23.7 Troubleshooting Route Maps and Filters

| Symptom | Cause | Command that proves it |
|---------|-------|------------------------|
| Nothing gets redistributed / advertised | No clause matches, so the implicit deny catches everything | `show route-map NAME` — check every clause; is there a final permit? |
| *Everything* gets through a filter meant to be selective | `match` references an ACL or prefix list that **doesn't exist** (typo, or wrong case); IOS treats it as match-all | `show ip prefix-list NAME` / `show access-lists NAME` returns nothing |
| Nothing redistributed, or a BGP neighbour sends/accepts nothing | The **route map itself** doesn't exist. `redistribute … route-map MISSING` redistributes nothing; a missing BGP neighbour route map denies everything on current IOS/IOS XE. That's the *opposite* of a missing ACL inside an existing route map | `show route-map MISSING` returns nothing; `show run | include route-map` |
| Prefix-list-denied route still accepted | A later permit clause catches it after the prefix list's deny meant "no match" | Walk the clauses; `show ip prefix-list detail` hit counts |
| `match ip address NAME` never matches | You meant `match ip address prefix-list NAME`; without the keyword, IOS looks for an **ACL** named NAME | `show route-map NAME` shows `ip address (access-lists): NAME` |
| Prefix-list entry never hits | Length range wrong (forgot `le`/`ge`), so the route's length falls outside it | `show ip prefix-list detail` — hit count 0 |
| BGP policy change has no effect | Policy is applied only to *new* updates | `clear ip bgp <neighbor> soft in|out` |
| OSPF neighbor still learns a filtered route | `distribute-list in` affects only the local RIB | `show ip ospf database` on the neighbor |
| Traffic black-holed through one router | OSPF `distribute-list in` on a transit router | `show ip route <dest>` there (missing) while neighbors point to it |
| Two clauses' `set`s expected, only one applied | First match wins; no `continue` | Add `continue` (BGP), or merge the clauses |

```
R1# show route-map RM-OSPF-TO-EIGRP
route-map RM-OSPF-TO-EIGRP, deny, sequence 10
  Match clauses:
    ip address prefix-lists: INFRA-P2P
  Set clauses:
  Policy routing matches: 0 packets, 0 bytes
route-map RM-OSPF-TO-EIGRP, permit, sequence 20
  Match clauses:
    ip address prefix-lists: BRANCH-LANS
  Set clauses:
    tag 110
  Policy routing matches: 0 packets, 0 bytes
```

The `Policy routing matches` counters only count **PBR** packets — for redistribution and BGP they stay at zero, so don't read zero as "not matching". For those uses, check the prefix list hit counts and the resulting routing tables instead.

---

<a name="chapter-24"></a>
# Chapter 24: Redistribution & Summarization

> **Blueprint:** ENARSI 1.4 — Troubleshoot redistribution between any routing protocols or routing sources; ENARSI 1.5 — Troubleshoot manual and auto-summarization with any routing protocol.

## 24.1 Why Redistribution Exists — and Why It's Dangerous

In a perfect world, one network runs one routing protocol. Real networks don't. Company A, running EIGRP, buys company B, running OSPF. A branch learns its WAN routes from the provider over BGP. A lab segment is reached through a static route. **Redistribution** is how routes from one source get advertised into another protocol.

It's also the most error-prone feature in routing, for one reason: **every routing protocol speaks a different metric language**, and none of them understands the others' loop prevention. EIGRP's composite metric means nothing to OSPF, OSPF's cost means nothing to RIP, and BGP's AS_PATH vanishes the moment a route enters an IGP. *Redistribution is translation between languages that don't share words for "distance" or "I've been here before" — so you have to supply both.*

Two rules hold whenever you redistribute:

1. **Redistribution reads from the redistributing router's own RIB.** A router can only redistribute a route that is **in its own routing table**, installed by the source protocol (plus that protocol's connected interfaces — 24.2). A route that lost on AD, or that the source protocol knows but didn't install, can't be redistributed.
2. **The receiving protocol needs a starting metric** — a **seed metric** — because the original one is meaningless to it.

**Why does rule 1 cause so many tickets?** Because the route you want to redistribute may be sitting in the OSPF database, healthy, yet lose on AD to a static route or another protocol. `redistribute ospf 1` then quietly skips it: OSPF didn't *win* that prefix on this router, so it isn't OSPF's to give away. *If it isn't in `show ip route` with the right code, it isn't going to be redistributed.*

## 24.2 Seed Metrics and Defaults, Protocol by Protocol

| Redistributing **into** | Default seed metric | What you need to know |
|------------------------|---------------------|-----------------------|
| **EIGRP** | **Infinite** — routes are *not* advertised | Always set one, with `metric` on the redistribute line, `default-metric`, or a route map. Exceptions: from another EIGRP AS (metric is kept), and connected/static routes (metric taken from the interface) |
| **OSPF** | Cost **20**, type **E2** | Routes from **BGP** get cost **1**. Use `metric-type 1` for E1 |
| **RIP** | **Infinite** (16) for routes from another protocol | Set `metric` (a hop count) or `default-metric`. On IOS, redistributed **connected** and **static** routes are an exception and are advertised with a small default hop count (typically 1) even without a metric. Don't rely on it: set a metric explicitly so the result doesn't depend on the source |
| **BGP** | **MED = the IGP metric**; origin incomplete (`?`) | Weight 32768 locally. OSPF→BGP takes **internal routes only** by default |

The EIGRP metric takes five values: **bandwidth** (kbps), **delay** (tens of microseconds), **reliability** (out of 255), **load** (out of 255) and **MTU**:

```
router eigrp 100
 redistribute ospf 1 metric 100000 100 255 1 1500     ! 100 Mbps, 1 ms delay
!                          bw(kbps) ^delay(10 us)  ^rel ^load ^MTU
! — or set a default for every redistributed source:
 default-metric 100000 100 255 1 1500
```

**Why does EIGRP refuse to advertise a route with no seed metric, when OSPF happily uses 20?** Because EIGRP's DUAL algorithm depends on metrics being *meaningful*: feasible-successor checks compare real distances (Chapter 26), and an invented number could make a looping path look feasible. EIGRP chooses "unreachable" over guessing. OSPF externals are just tagged numbers sitting outside SPF, so a flat 20 is harmless. *EIGRP's metric is load-bearing; OSPF's external metric is a label.*

### Connected and Static Routes into OSPF

```
router ospf 1
 redistribute connected subnets route-map LOOPBACKS-ONLY   ! E2, cost 20
 redistribute static subnets metric 50 metric-type 1
```

Two details trip people up:

- **An interface already covered by a `network` statement (or `ip ospf area`) is already an *internal* OSPF route.** Redistributing connected routes doesn't turn it into an external, because OSPF only redistributes connected networks it isn't already advertising. Seeing a subnet as `O` in one place and `O E2` in another means it's being advertised by two different routers in two different ways.
- **Redistributing connected routes pulls in *every* connected interface**, including management and lab subnets. Always pair it with a route map or prefix list naming exactly what you want.

### EIGRP to EIGRP — Two Autonomous Systems

Two EIGRP processes (AS 100 and AS 200) on one router don't share routes; you have to redistribute between them. This is the one redistribution that needs **no seed metric**: EIGRP copies the original composite-metric components across. But the route becomes **external** in the receiving AS, with AD **170** instead of 90:

```
router eigrp 100
 redistribute eigrp 200          ! metric components carried over automatically
router eigrp 200
 redistribute eigrp 100
```

**The AD contest this creates:** the boundary router learns a prefix that lives in AS 200 natively as **internal (90)**. If it also hears it inside AS 100 as an **external (170)** reflected from a second boundary router, the internal copy wins, which is fine. Now reverse it: a router in AS 100 that hears an AS 100-native prefix as external from AS 200's redistribution still prefers its own internal 90. Trouble starts only when the *native* source is lost. The router then falls back to the reflected external, and the two boundary routers can point at each other. Tag on the way out of each AS and deny the tag on the way back in, exactly as in 24.4.

### Proving Where an EIGRP External Came From

`show ip eigrp topology <prefix>` is the single best redistribution-forensics command. For an external, it shows who injected the route, from what, and with what tag:

```
R2# show ip eigrp topology 192.168.5.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(2.2.2.2) for 192.168.5.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 51456
  Descriptor Blocks:
  10.0.12.1 (GigabitEthernet0/1), from 10.0.12.1, Send flag is 0x0
      Composite metric is (51456/51200), route is External
      Vector metric:
        Minimum bandwidth is 100000 Kbit
        Total delay is 1010 microseconds
        Reliability is 255/255
        Load is 1/255
        Minimum MTU is 1500
        Hop count is 1
        Originating router is 1.1.1.1
      External data:
        AS number of route is 0
        External protocol is RIP, external metric is 2
        Administrator tag is 120 (0x00000078)
```

Read the bottom half. **Originating router 1.1.1.1** is the router-ID of the ASBR that redistributed it. If that equals the local router's own EIGRP router-ID, the local router **discards** the external, which is the duplicate-RID fault in 26.11. **External protocol RIP, metric 2** is where it came from. **Administrator tag 120** proves the tagging route map ran. The numbers also tie back to the seed metric `100000 100 255 1 1500`: 100 Mbps gives 10⁷/100,000 = 100, and 100 tens of µs of delay gives 100. So RD = 256 × (100 + 100) = **51,200**. One more GigabitEthernet hop adds 10 µs (1 unit): FD = 256 × (100 + 101) = **51,456**.

### Selecting Which OSPF Routes Get Redistributed

When OSPF is the **source**, `match` chooses route types. The default differs by target:

```
router eigrp 100
 redistribute ospf 1 match internal external 2 metric 100000 100 255 1 1500
! internal = intra- and inter-area; external 1/2 = E1/E2; nssa-external = N1/N2
```

Into EIGRP, RIP and OSPF the default is to take internal *and* external routes. Into **BGP** it's internal only (below). Leaving out `external` is a common way to stop externals bouncing between domains. The same thing can be done with `match route-type` in a route map (23.4).

### Limiting What Redistribution Can Inject

A route map with no filter, or a misbehaving source, can flood an IGP with thousands of externals. OSPF can cap it:

```
router ospf 1
 redistribute maximum-prefix 2000 80            ! warn at 80%, stop injecting at 2000
! redistribute maximum-prefix 2000 80 warning-only   ! log only, never stop
```

It's cheap insurance on any ASBR that redistributes BGP.

### Redistributing IPv6

IPv6 redistribution uses the same ideas with two differences: **connected networks aren't included unless you say so**, and matching uses IPv6 prefix lists.

```
ipv6 prefix-list BRANCH6 seq 5 permit 2001:db8:100::/40 le 64
route-map EIGRP6-TO-OSPF6 permit 10
 match ipv6 address prefix-list BRANCH6
!
ipv6 router ospf 1
 redistribute eigrp 100 include-connected route-map EIGRP6-TO-OSPF6
!
ipv6 router eigrp 100
 redistribute ospf 1 metric 100000 100 255 1 1500 include-connected
```

### The OSPF `subnets` Keyword

On classic IOS, `redistribute eigrp 100` into OSPF redistributed only **classful** networks — 10.0.0.0/8 if it existed exactly, but not 10.1.1.0/24. You had to add `subnets`. Current IOS XE adds `subnets` automatically (you'll see it appear in the running config), but older platforms and exam questions still feature the trap: **"only some routes get redistributed into OSPF" → check for `subnets`.**

```
router ospf 1
 redistribute eigrp 100 subnets metric-type 1 route-map EIGRP-TO-OSPF
```

### What Comes Along: Connected Networks and Route Types

When you redistribute protocol X, IPv4 includes not just X's learned routes but also the **connected networks of interfaces where X is enabled**. IPv6 does **not** — you have to add `include-connected`:

```
ipv6 router ospf 1
 redistribute eigrp 100 include-connected
```

**Exam trap:** OSPF into BGP takes only **intra- and inter-area** routes by default, not OSPF externals. To include them:

```
router bgp 65001
 address-family ipv4 unicast
  redistribute ospf 1 match internal external 1 external 2
```

### BGP into an IGP — Deliberately Hard

By default a router redistributes only **eBGP**-learned routes into an IGP. **iBGP** routes are skipped unless you add `bgp redistribute-internal`.

**Why the protection?** Two reasons. First, a full internet table is over a million prefixes, and pushing it into OSPF or EIGRP would overwhelm every router in the domain. Second, iBGP routes usually came *from* your IGP edge to begin with, so redistributing them back in is a classic loop. In practice you redistribute only a few filtered prefixes, or better, originate a default route instead. *BGP-to-IGP redistribution should always be filtered — the default only protects you from the worst mistake.*

## 24.3 OSPF External Types — E1 vs E2

| Type | Metric as it travels | Best when |
|------|---------------------|-----------|
| **E2** (default) | Stays at the seed metric everywhere; internal cost to the ASBR is ignored (used only as a tie-breaker, the *forward metric*) | One exit point, or when the external cost is all that matters |
| **E1** | Seed metric **plus** the internal OSPF cost to reach the ASBR | Several ASBRs advertise the same prefix, and each router should pick its *nearest* exit |

For the same prefix, OSPF **always prefers E1 over E2**, whatever the metrics. N1 and N2 are the NSSA equivalents (Type 7, Chapter 27). In the rare case where a Type 5 and a Type 7 describe the same prefix with the same type and metric, the tie-break follows RFC 3101's rules (which changed the older RFC 1587 preference). Treat that as a sign the design is wrong rather than something to memorise.

### The Forwarding Address — Why an External Can Be in the LSDB but Not the RIB

Every Type 5 and Type 7 LSA carries a **Forwarding Address (FA)**. If it's `0.0.0.0`, traffic for the external goes **to the ASBR** that originated it. If it's non-zero, traffic goes **to that address** instead. This happens when the ASBR's next hop for the external sits on a shared segment that OSPF also runs on, so the other routers can skip the extra hop through the ASBR.

The rule ENARSI tests: **a router installs an external route only if it can reach the forwarding address through an OSPF intra-area or inter-area route.** If the FA is reachable only through a static route, another protocol, or another external, or not at all, the LSA sits in the database and the route never appears.

On IOS an ASBR sets a non-zero FA in a Type 5 only when the next-hop interface is OSPF-enabled, not passive, and of a broadcast-style network type (not point-to-point or point-to-multipoint). **Type 7 LSAs in an NSSA carry a non-zero FA**, normally an address of the NSSA ASBR, and the ABR keeps it when it translates them into Type 5. That creates a classic fault. Filter or summarize away the subnet containing the FA at the NSSA ABR (`area range … not-advertise`, `area filter-list`), and every router outside the NSSA loses the external, even though the Type 5 is right there.

```
R5# show ip ospf database external 172.20.0.0
  Link State ID: 172.20.0.0 (External Network Number )
  Advertising Router: 4.4.4.4
        Metric Type: 2 (Larger than any link state path)
        Metric: 20
        Forward Address: 10.1.45.5          <- must be reachable as O or O IA
R5# show ip route 10.1.45.5
% Subnet not in table                       <- so 172.20.0.0/16 is never installed
```

*An external route is a signpost. If the town it points to isn't on your OSPF map, you can't follow it.*

**Why would E2 ever be the default if it ignores internal distance?** Because the typical external route is "the internet, via our one firewall", where internal distance doesn't change the decision. E2 is also stable: the external metric doesn't change as internal links flap, so less churn. E1 earns its place when there's a real choice of exits. *E2 says "the cost is out there"; E1 says "the cost includes getting there."*

## 24.4 Two-Point Mutual Redistribution — the Classic Loop

![Two routers redistributing both ways create a feedback path; tags stop routes returning to their origin domain](images/c24_mutual_redist.png)

One redistribution point is a single point of failure, so designs use two. Picture a **RIP** domain and an **OSPF** domain joined by **R1** and **R2**, each redistributing **both ways**. Follow the RIP prefix 192.168.5.0/24:

1. R1 learns 192.168.5.0/24 from RIP (AD 120) and redistributes it into OSPF as an E2 route.
2. R2 now hears the prefix twice: natively from **RIP (AD 120)**, and from **OSPF E2 (AD 110)** via R1.
3. **OSPF wins on AD.** R2 installs the OSPF route, sending traffic for a RIP-domain network across the OSPF domain to R1 — a **suboptimal path**, even though R2 sits right next to the RIP domain.
4. R2 now redistributes *its* routing table entry — the OSPF one — back into RIP. If the original RIP source fails, RIP routers keep hearing 192.168.5.0/24 from R2, R2 points into OSPF, OSPF points at R1, R1 points into RIP... **A routing loop** that lives until a timer or TTL breaks it.

**Why does this happen when both protocols work perfectly?** Because AD tells R2 to trust OSPF (110) over RIP (120) **without knowing the OSPF route is just RIP's own route, reflected**. Redistribution erased its history. The same pattern appears with EIGRP **externals** (170 — they lose to OSPF's 110) and with anything else whose native AD is higher than the protocol it gets reflected through. *The loop isn't a bug in either protocol; it's the missing memory at the boundary.*

### Fix 1 — Tag and Filter (stop the route returning home)

Configure the **same** policy on **both** R1 and R2:

```
route-map RIP-TO-OSPF deny 10
 match tag 110                     ! born in OSPF? never send it back to OSPF
route-map RIP-TO-OSPF permit 20
 set tag 120                       ! mark everything leaving RIP as "born in RIP"
!
route-map OSPF-TO-RIP deny 10
 match tag 120                     ! born in RIP? never send it back to RIP
route-map OSPF-TO-RIP permit 20
 set tag 110                       ! mark everything leaving OSPF as "born in OSPF"
!
router ospf 1
 redistribute rip subnets route-map RIP-TO-OSPF
router rip
 version 2
 redistribute ospf 1 metric 3 route-map OSPF-TO-RIP
```

Now a route can cross the boundary **once**. The tag travels with it (RIPv2 and OSPF externals both carry tags), and the other boundary router recognizes and refuses to send it back.

### Fix 2 — Correct the AD (stop the suboptimal choice)

Tags stop the loop, but R2 still prefers the OSPF E2 copy (110) of a RIP route over its native RIP route (120). Making OSPF *externals* less trusted than RIP fixes that on both boundary routers:

```
router ospf 1
 distance ospf external 125        ! native RIP (120) now beats reflected E2s
```

This affects **every** OSPF external route on that router, so make sure that's acceptable. To be surgical, use the per-source `distance` command with an ACL listing just the RIP-domain prefixes (22.6).

**Which fix does the exam want?** Usually **both**: tags stop routes re-entering their origin domain (the loop), AD tuning makes boundary routers prefer the native path (the suboptimal routing). *Tags fix the memory problem; AD fixes the trust problem.*

### Troubleshooting Redistribution

| Symptom | Cause | Command that proves it |
|---------|-------|------------------------|
| Routes redistributed into EIGRP or RIP never appear | No seed metric (infinite by default) | `show run | section router eigrp` — no `metric` / `default-metric` |
| Only classful networks reach OSPF | Missing `subnets` (older IOS) | `show ip ospf database external` — only /8, /16, /24 classful prefixes |
| Some source routes are missing after redistribution | They're not in the RIB *from that source* (lost on AD) | `show ip route <prefix>` — *Known via* a different source |
| Connected subnets missing (IPv6) | No `include-connected` | `show ipv6 route` on a neighbor |
| OSPF externals missing from BGP | Default `match internal` only | `show bgp ipv4 unicast` — compare with `show ip route ospf` |
| iBGP prefixes not redistributed into the IGP | Expected default behavior | Add `bgp redistribute-internal` — only with a filter |
| Route flaps between two sources every few seconds | Mutual redistribution feedback | Repeated `show ip route <prefix>`; `debug ip routing` |
| Boundary router uses a long path to a nearby prefix | Reflected copy wins on AD | `show ip route <prefix>` shows `ospf … type extern 2` and a `Tag` from the other domain |
| Route map filters everything | No final permit clause | `show route-map NAME` (23.7) |

```
R2# show ip ospf database external 192.168.5.0
  LS Type: AS External Link
  Link State ID: 192.168.5.0 (External Network Number )
  Advertising Router: 1.1.1.1
  Network Mask: /24
        Metric Type: 2 (Larger than any link state path)
        Metric: 20
        Forward Address: 0.0.0.0
        External Route Tag: 120
```

`Advertising Router` is the ASBR that injected it, and `External Route Tag: 120` proves the tagging policy ran. If the tag is missing, the route map on that ASBR isn't being applied.

## 24.5 Summarization — Fewer Routes, More Stability

**Summarization** advertises one shorter prefix in place of many longer ones: 10.1.0.0/16 instead of 256 /24s. It shrinks routing tables, and it hides instability. When 10.1.37.0/24 flaps, routers outside the summary don't even notice, because the /16 stays up as long as *any* component exists.

**Why does hiding detail make a network more stable?** Because every advertised change forces work: EIGRP sends queries (Chapter 26), OSPF re-runs SPF. A summary is a **wall that stops churn spreading**. A flapping link inside the summarized area is handled locally and never reaches the rest of the network. *Summarization is to routing what areas are to OSPF: keep detail local, share only what others need.*

It has costs, which ENARSI tests directly — covered in 24.7.

## 24.6 Summarization in Each Protocol

### EIGRP — Auto and Manual

**Auto-summary** summarizes to the classful boundary whenever a route crosses a major-network boundary. It's **off by default since IOS 15.0** and should stay off: with **discontiguous networks** (subnets of 172.16.0.0 on both sides of a 10.x core), both edges advertise 172.16.0.0/16 and the core load-shares between them — sending half the traffic to the wrong site.

Manual summaries are configured **per interface**, so you can summarize differently toward different neighbors:

```
! Classic mode
interface GigabitEthernet0/1
 ip summary-address eigrp 100 10.1.0.0 255.255.0.0

! Named mode
router eigrp CAMPUS
 address-family ipv4 unicast autonomous-system 100
  af-interface GigabitEthernet0/1
   summary-address 10.1.0.0 255.255.0.0
```

The summary is advertised as long as **at least one** component route exists, and it carries the **lowest metric** of its components. Use `summary-metric` in named mode to pin it, so it doesn't change every time the best component changes. A **leak map** lets you advertise selected components alongside the summary:

```
route-map LEAK-VOICE permit 10
 match ip address prefix-list VOICE-SUBNET      ! components to advertise as well
!
! Classic mode
interface GigabitEthernet0/1
 ip summary-address eigrp 100 10.1.0.0 255.255.0.0 leak-map LEAK-VOICE
!
! Named mode — leak map on the interface, fixed metric under the topology
router eigrp CAMPUS
 address-family ipv4 unicast autonomous-system 100
  af-interface GigabitEthernet0/1
   summary-address 10.1.0.0 255.255.0.0 leak-map LEAK-VOICE
  exit-af-interface
  topology base
   summary-metric 10.1.0.0/16 100000 100 255 1 1500
```

Components matched by the leak map are advertised **in addition to** the summary, so a neighbour gets the /16 for everything plus the specific voice /24 for an optimal path. The `summary-metric` values are the same five components as a seed metric (24.2).

### EIGRP and OSPF for IPv6

```
interface GigabitEthernet0/1
 ipv6 summary-address eigrp 100 2001:db8:10::/48     ! classic IPv6 EIGRP
!
router ospfv3 1
 address-family ipv6 unicast
  area 1 range 2001:db8:10::/48                       ! ABR, inter-area
  summary-prefix 2001:db8:200::/40                    ! ASBR, externals
```

The rules are the same as IPv4: per interface for EIGRP, ABR (`area range`) or ASBR (`summary-prefix`, the IPv6 name for `summary-address`) for OSPFv3.

### RIP

RIPv2's **auto-summary** is still enabled by default on many IOS releases, unlike EIGRP's. Check `show ip protocols` for "Automatic network summarization is in effect" and turn it off with `no auto-summary` under `router rip`. Manual summaries go on the interface:

```
interface GigabitEthernet0/1
 ip summary-address rip 10.1.0.0 255.255.0.0
```

**RIP restriction:** a manual RIP summary **can't be shorter than the classful network** (no supernets such as 172.16.0.0/12). The command is rejected or ignored. Summarizing beyond the classful boundary needs another protocol.

```
R1# show ip route 10.1.0.0 255.255.0.0
Routing entry for 10.1.0.0/16
  Known via "eigrp 100", distance 5, metric 2816, type internal
  Routing Descriptor Blocks:
  * directly connected, via Null0
```

### The Null0 Discard Route — Why Every Summary Creates One

Every summarizing router installs a route for the summary pointing to **Null0** — a virtual interface that silently discards packets. EIGRP gives it AD **5**; OSPF and BGP install their own Null0 routes too.

**Why would a router deliberately drop traffic?** Picture R1 advertising 10.1.0.0/16 upstream, with a default route pointing back upstream. A packet arrives for 10.1.99.0, a subnet that *doesn't exist* inside the summary. Without the discard route, R1's longest match is the **default**, so it sends the packet back upstream. The upstream router matches the /16 summary and sends it back to R1. **Loop** — until TTL expires, wasting bandwidth both ways. The Null0 route is longer than the default, so R1 drops the packet immediately. *The discard route is the summarizer saying: "I claimed this whole block, so if I don't have the piece, nobody does."*

**Exam trap:** don't delete the Null0 route because it "looks wrong" in the table. Removing it (OSPF: `no discard-route internal` or `no discard-route external`) brings the loop back.

### OSPF — `area range` vs `summary-address`

OSPF can only summarize where routes are **created as summaries**, so there are exactly two places, with two commands (Chapter 6 covers the ENCOR basics):

| Command | Where | Summarizes |
|---------|-------|-----------|
| `area 1 range 10.1.0.0 255.255.0.0` | **ABR**, in `router ospf` | Intra-area routes of area 1, advertised as one Type 3 into other areas |
| `summary-address 172.16.0.0 255.255.0.0` | **ASBR**, in `router ospf` | Redistributed external routes (Type 5/7) |

```
router ospf 1
 area 1 range 10.1.0.0 255.255.0.0 cost 50            ! fixed cost, no flapping metric
 area 1 range 10.1.200.0 255.255.255.0 not-advertise  ! hide this block entirely
 summary-address 172.16.0.0 255.255.0.0               ! on the ASBR, for externals
```

**Exam trap:** `area range` on a router that isn't an ABR for that area does nothing. `summary-address` on a router that isn't redistributing anything does nothing. Neither produces an error — the summary just never appears. And `not-advertise` is a quiet **filtering** tool, so remember it when a prefix "mysteriously" never leaves its area.

### BGP — `aggregate-address`

```
router bgp 65001
 address-family ipv4 unicast
  aggregate-address 10.0.0.0 255.0.0.0 summary-only    ! advertise the /8, suppress the rest
```

| Option | Effect |
|--------|--------|
| *(none)* | Advertise the aggregate **and** all its components |
| `summary-only` | Advertise only the aggregate; components are suppressed (`s` in `show bgp`) |
| `as-set` | Include the components' AS numbers in the aggregate's AS_PATH as a set, preserving loop detection |
| `suppress-map` / `unsuppress-map` | Suppress (or leak) selected components |

Two rules: the aggregate is only created if **at least one component exists in the BGP table** (not just the RIB), and the router installs a local **Null0** route for it (AD 200). Without `as-set`, the aggregate carries the **ATOMIC_AGGREGATE** attribute, a warning that path information was lost.

**Why is `as-set` optional, if it preserves loop detection?** Because it makes the aggregate **unstable**. Every time a component from some AS appears or disappears, the AS_SET changes and the aggregate is re-advertised to the whole internet. Most operators skip `as-set` and accept the small loop risk, because their aggregates cover only their own address space. *Accuracy versus stability — BGP almost always picks stability.*

## 24.7 What Summarization Breaks

| Problem | How it happens | Mitigation |
|---------|----------------|------------|
| **Suboptimal routing** | Two ABRs advertise the same summary; a remote router picks the closer ABR, which may be the *farther* one from the actual subnet | Leak specific prefixes (leak map, `summary-only` off), or accept it |
| **Black hole** | Two routers advertise a summary; one has *lost* a component but keeps advertising the summary (other components still exist) and drops that traffic to Null0 | Summarize at one point, or leak the critical components; link the summarizers directly so one can reach the other's subnets |
| **Discontiguous networks** | Auto-summary at classful boundaries on both sides of a core | `no auto-summary` (the default since 15.0) |
| **Metric churn** | Summary metric follows its best component, flapping with it | `summary-metric` (EIGRP), `cost` on `area range` (OSPF) |
| **Missing summary** | No component in the RIB / BGP table, or wrong router | `show ip route` for components; check you're on the ABR/ASBR |
| **Unwanted loops without discard** | `no discard-route internal|external` (OSPF) | Restore the Null0 route |

**Why is the black hole so nasty?** Because everything *looks* healthy. Both summarizers are up, both advertise the summary, and the routing tables all agree. Only the traffic that happens to choose the summarizer missing that one subnet disappears into Null0. Pings to other subnets work, so it looks like an application issue. *Summaries are promises; a summarizer can keep promising after it's lost the ability to deliver.* The test that exposes it is a `traceroute` that stops at the summarizing router, combined with `show ip route <specific>` on that router showing only the Null0 summary.

## 24.8 Originating a Default Route — Protocol by Protocol

A default route is the most-redistributed "route" of all, and every protocol has its own way to originate one. Each has a precondition that the exam likes to break.

### OSPF — `default-information originate`

```
router ospf 1
 default-information originate                          ! only if a default is in the RIB
 default-information originate always                   ! even with no default route
 default-information originate metric 10 metric-type 1  ! seed it as E1, cost 10
 default-information originate route-map ISP-ALIVE      ! conditional (below)
```

The router becomes an ASBR and floods a **Type 5 for 0.0.0.0/0** (default metric 1, type E2). The precondition: **without `always`, a default route must already be in this router's RIB from some other source**, typically a static to the ISP or one learned by BGP. No default in the RIB means nothing is originated and no error is shown. *That's the classic ENARSI fault: the config looks right, but `show ip ospf database external 0.0.0.0` is empty.*

**Why not just always use `always`?** Because then the router advertises a default even when its own exit is dead, and draws all traffic into a black hole. Without `always`, the advertisement disappears with the upstream route, and traffic shifts to another exit automatically. Use `always` only when the router is the sole exit and blackholing is acceptable, or pair it with a **conditional route map**:

```
ip prefix-list ISP-PROBE seq 5 permit 198.51.100.0/24   ! exists only while the ISP is up
route-map ISP-ALIVE permit 10
 match ip address prefix-list ISP-PROBE
!
router ospf 1
 default-information originate always route-map ISP-ALIVE
```

The route map is checked against the **RIB**. While 198.51.100.0/24 is present (learned from the ISP by BGP, say), the default is advertised. When it disappears, the default is withdrawn.

For NSSAs the command is different (`area X nssa default-information-originate`), and so are the rules. See 27.5.

### EIGRP

EIGRP has no `default-information originate`. The two common methods:

```
ip route 0.0.0.0 0.0.0.0 203.0.113.1
router eigrp 100
 redistribute static metric 100000 100 255 1 1500   ! 0/0 becomes an external (D*EX)
!
! or: summarize to a default toward a stub branch
interface GigabitEthernet0/2
 ip summary-address eigrp 100 0.0.0.0 0.0.0.0
```

**Exam trap 1:** a 0.0.0.0/0 summary **suppresses every more-specific route** out of that interface. The branch receives *only* the default, which is often exactly the point.

**Exam trap 2:** like every EIGRP summary, it installs a local **Null0 discard route** for 0.0.0.0/0 at **AD 5**. A static default (AD 1) still beats it. But if this router learns *its own* default dynamically, for example from eBGP (20) or OSPF (110), the AD-5 Null0 route wins and the router blackholes everything it was meant to forward upstream. Give the summary a worse AD with the optional distance argument:

```
interface GigabitEthernet0/2
 ip summary-address eigrp 100 0.0.0.0 0.0.0.0 250   ! local discard route at AD 250
```

### BGP

BGP won't advertise a default learned from redistribution unless told to, and has a per-neighbour shortcut:

```
router bgp 65001
 address-family ipv4 unicast
  neighbor 10.0.0.2 default-originate                   ! send 0/0 to this neighbour only
  neighbor 10.0.0.2 default-originate route-map HAVE-ISP  ! only if HAVE-ISP matches the RIB
  network 0.0.0.0                                       ! advertise a default from the RIB
  default-information originate                         ! needed if 0/0 is redistributed
```

`neighbor default-originate` doesn't need a default in the RIB or the BGP table. It generates one for that neighbour, which is why the conditional route-map form exists.

### RIP

```
router rip
 default-information originate [route-map NAME]
```

### Troubleshooting Default Origination

| Symptom | Cause | Command that proves it |
|---------|-------|------------------------|
| OSPF default not advertised | No default in the RIB and no `always` | `show ip route 0.0.0.0`; `show ip ospf database external 0.0.0.0` empty |
| OSPF default still advertised after ISP failure | `always` without a condition | Config review; add a route-map condition |
| Conditional default never appears | Route map's prefix not in the RIB (or prefix list typo) | `show ip route <probe prefix>`; `show route-map` |
| EIGRP branch learns nothing but 0/0 | 0/0 summary suppresses specifics | `show ip protocols` lists the summary; `show ip route` on the branch |
| Edge router blackholes upstream traffic after adding a 0/0 EIGRP summary | Local Null0 summary (AD 5) beats a dynamically learned default (eBGP 20, OSPF 110) or a floating static | `show ip route 0.0.0.0` shows `via Null0`, distance 5; fix with the summary's AD argument |
| NSSA routers get no default | `default-information-originate` missing on the NSSA ABR/ASBR, or no default on a non-ABR ASBR | 27.5 |

---

<a name="chapter-25"></a>
# Chapter 25: PBR, VRF-Lite & BFD

> **Blueprint:** ENARSI 1.6 — Configure and verify policy-based routing; ENARSI 1.7 — Configure and verify VRF-Lite; ENARSI 1.8 — Describe Bidirectional Forwarding Detection.

Three tools that change the normal rules of routing. **PBR** overrides *where* a packet goes, **VRF-Lite** gives one router several separate routing tables, and **BFD** changes *how fast* a router notices a path has died.

## 25.1 Policy-Based Routing — Routing by Something Other Than Destination

![PBR diverts matching traffic to a second exit while everything else follows the routing table](images/c25_pbr.png)

Normal routing looks at **one field**: the destination address. Chapter 5 introduced PBR as the exception. Here you configure and troubleshoot it. PBR lets a router decide using the **source address**, protocol, port, packet size or DSCP — anything an ACL can match. Typical uses:

- Send the guest VLAN out the cheap broadband link and corporate traffic over MPLS.
- Push backup or replication traffic onto a link that's idle during the day.
- Steer specific traffic through a firewall or WAN optimizer that isn't on the normal path.

PBR is a **route map applied to an interface**. Every packet *arriving* on that interface is checked against the route map before the normal routing lookup:

```
ip access-list extended GUEST-WEB
 permit tcp 10.20.0.0 0.0.255.255 any eq 80
 permit tcp 10.20.0.0 0.0.255.255 any eq 443
!
route-map PBR-GUEST permit 10
 match ip address GUEST-WEB              ! guest web traffic...
 set ip next-hop 203.0.113.1             ! ...goes to the broadband router
!
interface GigabitEthernet0/2.20          ! the guest VLAN's gateway interface
 ip policy route-map PBR-GUEST           ! INBOUND — PBR only sees arriving packets
```

The rules that decide what happens to each packet:

| Packet... | Result |
|-----------|--------|
| Matches a **permit** clause with a usable `set` | Policy-routed as the `set` says |
| Matches a **deny** clause | **Routed normally** — deny means "no policy", not "drop" (23.4) |
| Matches **no** clause | Routed normally |
| Matches a permit clause, but the next hop is down / not adjacent | Falls through to the next `set` option, then to normal routing |

**Why is PBR applied inbound only?** Because by the time a packet would leave an interface, the routing decision has *already been made* — that's how the router chose the outbound interface. PBR has to run **before** the routing lookup to replace it, and the only place that happens is on ingress. *To change the decision, you have to get in before it's made.*

### The `set` Options and Their Order

| Set clause | Meaning |
|------------|---------|
| `set ip next-hop 203.0.113.1` | Forward to this **directly connected** next hop, *ignoring* the routing table |
| `set ip next-hop verify-availability 203.0.113.1 10 track 1` | Use it only while tracking object 1 is up (usually an IP SLA probe) |
| `set ip next-hop recursive 192.0.2.9` | The next hop is **not** directly connected; resolve it through the RIB |
| `set interface Tunnel0` | Send out this interface (best on point-to-point links) |
| `set ip default next-hop 203.0.113.1` | Use it **only if** the routing table has no explicit route for the destination (a default route doesn't count) |
| `set default interface Tunnel0` | Same idea, with an interface |

**The evaluation order.** When one clause contains several `set` options, IOS tries them in a fixed order regardless of the order you typed them, and uses the first one that's usable:

1. `set ip next-hop` (including `verify-availability` / `recursive`)
2. `set interface`
3. `set ip default next-hop`, but only if the RIB has no explicit route
4. `set default interface`, likewise
5. Otherwise, normal routing

Within one `set ip next-hop` line you can list several addresses (`set ip next-hop 203.0.113.1 198.51.100.1`). The router uses the **first one that is reachable and adjacent**, and moves to the next only when it isn't. That gives you an ordered primary/backup in a single line.

**Why do "default" versions exist?** They flip the priority. Plain `set ip next-hop` says *"policy first, routing table never."* The `default` forms say *"routing table first, policy only for what it can't route."* A branch might use `set ip default next-hop` to send unknown (internet) destinations out a local breakout, while every known corporate prefix still follows the routing table. *Plain = policy overrides routing; default = routing overrides policy.*

**Exam trap:** plain `set ip next-hop` to an address that's down doesn't drop traffic. It fails over to normal routing, so the policy *silently stops applying*. If the next hop is still in ARP and the interface is up, though, PBR keeps sending to a router that may be dead upstream. That's why production PBR uses `verify-availability` with tracking:

```
ip sla 1
 icmp-echo 203.0.113.1 source-interface GigabitEthernet0/0
 frequency 5
ip sla schedule 1 life forever start-time now
track 1 ip sla 1 reachability            ! up while the probe succeeds
!
route-map PBR-GUEST permit 10
 match ip address GUEST-WEB
 set ip next-hop verify-availability 203.0.113.1 10 track 1
```

### Policy for Traffic the Router Generates

`ip policy` only sees packets **arriving** on an interface. Packets the router itself originates — pings, syslog, SNMP traps, routing protocol traffic — never arrive anywhere. For those, use **local policy**:

```
R1(config)# ip local policy route-map PBR-MGMT
```

IPv6 works the same way with `ipv6 policy route-map` and `ipv6 local policy route-map`, using IPv6 ACLs and `set ipv6 next-hop`.

### Verifying and Troubleshooting PBR

```
R1# show ip policy
Interface      Route map
Gi0/2.20       PBR-GUEST

R1# show route-map PBR-GUEST
route-map PBR-GUEST, permit, sequence 10
  Match clauses:
    ip address (access-lists): GUEST-WEB
  Set clauses:
    ip next-hop verify-availability 203.0.113.1 10 track 1  [up]
  Policy routing matches: 18442 packets, 9871234 bytes

R1# debug ip policy
IP: s=10.20.4.7 (GigabitEthernet0/2.20), d=93.184.216.34, len 60, FIB policy match
IP: s=10.20.4.7 (GigabitEthernet0/2.20), d=93.184.216.34, g=203.0.113.1, len 60,
    FIB policy routed
IP: s=10.20.9.9 (GigabitEthernet0/2.20), d=10.1.1.5, len 84, FIB policy rejected(no match)
    - normal forwarding
```

Each debug line names the **ingress interface**, the source and destination, and the verdict. *Policy match* followed by *policy routed* with a `g=` gateway means the `set` worked. *Policy rejected (no match)* means the packet matched no permit clause (here the ICMP from 10.20.9.9 isn't in the web ACL) and got normal routing. If you see *policy match* but never *policy routed*, the next hop is unusable and the packet fell through. Run it with a **conditional debug** or an ACL on a busy router (32.3).

**Unlike redistribution, PBR counters are real.** `Policy routing matches` counts packets, so if it isn't increasing while users test, the packets aren't matching.

| Symptom | Cause | Command that proves it |
|---------|-------|------------------------|
| Counters stay at zero | Policy on the wrong interface or direction (it must be on the **ingress** interface) | `show ip policy` |
| Counters rise, but traffic still follows the routing table | Next hop unreachable or not adjacent, so it falls through | `show route-map` (track state), `show ip arp <next-hop>` |
| Wrong traffic is policy-routed | ACL too broad, or a deny clause missing | `show access-lists GUEST-WEB` hit counts |
| Router's own traffic ignores the policy | Needs `ip local policy` | `show ip policy` lists `local` |
| Policy keeps sending to a dead upstream | Plain `set ip next-hop` with no tracking | Add `verify-availability ... track` |
| Return traffic takes a different path | PBR is one-way; the return path follows normal routing (asymmetric, may break stateful firewalls/NAT) | `traceroute` from the far side |

**Why is asymmetry such a common PBR side effect?** Because PBR changes only **this router's** decision for **this direction**. The reply comes back through routers that know nothing about your policy, so it follows their routing tables. A firewall that saw only the outbound half of a TCP session will drop the reply. *Every PBR design needs an answer to "and how does the reply come home?"*

## 25.2 VRF-Lite — Several Routers Inside One

![One router, two VRFs — each with its own interfaces and routing table, even with overlapping addresses](images/c25_vrf_lite.png)

A **VRF** (Virtual Routing and Forwarding instance) gives a router a completely separate **routing table, CEF table and set of interfaces** for each customer, department or security zone. Chapter 12 introduced the concept. **VRF-Lite** means using VRFs *without* MPLS: each VRF is carried hop by hop over its own interfaces or 802.1Q subinterfaces, with its own routing protocol instance. (VRFs with MPLS — L3VPNs — are Chapter 29.)

**Why not just use ACLs to separate departments?** Because ACLs keep traffic apart by *filtering* a shared routing table, so one mistake in one line leaks everything. VRFs keep traffic apart by **construction**: a packet arriving on a RED interface can only be looked up in RED's table, and RED's table contains no route to BLUE. There's nothing to filter, because there's no path. VRFs also allow **overlapping addresses** — RED and BLUE can both use 10.1.1.0/24 — which ACLs can never handle. *ACLs say "you may not go there"; VRFs mean "there" doesn't exist.*

### Configuring VRFs and Interfaces

```
vrf definition RED
 rd 65000:1                        ! optional for pure VRF-Lite; required for BGP in the VRF
 address-family ipv4
 exit-address-family
 address-family ipv6               ! the multiprotocol syntax supports both families
 exit-address-family
!
vrf definition BLUE
 rd 65000:2
 address-family ipv4
 exit-address-family
!
interface GigabitEthernet0/1
 vrf forwarding RED                ! assign FIRST...
 ip address 10.1.1.1 255.255.255.0 ! ...then re-add the IP (assigning wipes it)
!
interface GigabitEthernet0/2
 vrf forwarding BLUE
 ip address 10.1.1.1 255.255.255.0 ! the same address — legal, different table
!
interface GigabitEthernet0/3.10    ! one trunk to the next router carries both VRFs
 encapsulation dot1Q 10
 vrf forwarding RED
 ip address 172.16.0.1 255.255.255.252
interface GigabitEthernet0/3.20
 encapsulation dot1Q 20
 vrf forwarding BLUE
 ip address 172.16.0.5 255.255.255.252
```

**Exam trap:** putting an interface into a VRF **removes its IP address**. IOS warns you (`% Interface GigabitEthernet0/1 IPv4 disabled and address(es) removed due to enabling VRF RED`), but in a simulation it's easy to miss. An interface that "lost its IP" after a VRF change is behaving as designed.

You'll also meet the older IPv4-only syntax: `ip vrf RED` and `ip vrf forwarding RED` on the interface. It works the same for IPv4. `vrf definition` is the current form and supports IPv6.

### Routing Protocols per VRF

Each VRF needs its own routing. Every protocol has a VRF-aware form:

```
! Static
ip route vrf RED 0.0.0.0 0.0.0.0 172.16.0.2

! OSPF — a separate process per VRF
router ospf 10 vrf RED
 router-id 1.1.1.10
 network 10.1.1.0 0.0.0.255 area 0
 network 172.16.0.0 0.0.0.3 area 0

! EIGRP classic — an address family per VRF under one process
router eigrp 100
 address-family ipv4 vrf BLUE autonomous-system 20
  network 10.1.1.0 0.0.0.255
  network 172.16.0.4 0.0.0.3
 exit-address-family

! EIGRP named mode
router eigrp CORE
 address-family ipv4 unicast vrf BLUE autonomous-system 20
  network 10.1.1.0 0.0.0.255

! BGP — an address family per VRF (the VRF must have an RD)
router bgp 65000
 address-family ipv4 vrf RED
  neighbor 172.16.0.2 remote-as 65001
  neighbor 172.16.0.2 activate
  redistribute connected
```

🔬 **`capability vrf-lite`.** When a VRF-Lite router's OSPF process connects to an MPLS provider edge, the PE sets the **DN (down) bit** on the Type 3, 5 and 7 LSAs it originates toward the customer. It also tags the Type 5s with a **domain tag** derived from the BGP AS. Both are loop-prevention marks for MPLS VPNs: a PE that receives an LSA with the DN bit set (or its own domain tag) must not use it. A VRF-Lite router behaving like a PE would ignore them too, and routes would go missing. `capability vrf-lite` under `router ospf 10 vrf RED` turns those PE checks off. Remember it as: "OSPF in a VRF, routes from the provider missing → `capability vrf-lite`."

### VRF-Aware Verification — Everything Needs `vrf`

The most common VRF mistake isn't a config error. It's **testing in the wrong table**. A plain `ping 10.1.1.5` uses the **global** table, which has no route to anything in RED:

| Task | Command |
|------|---------|
| List VRFs and their interfaces | `show vrf` / `show vrf detail` / `show ip vrf interfaces` |
| Routing table of one VRF | `show ip route vrf RED` |
| Test reachability inside a VRF | `ping vrf RED 10.1.1.5` / `traceroute vrf RED 10.1.1.5` |
| ARP / CEF inside a VRF | `show ip arp vrf RED` / `show ip cef vrf RED` |
| Per-VRF protocol state | `show ip ospf 10 neighbor`, `show ip eigrp vrf BLUE neighbors`, `show ip bgp vpnv4 vrf RED summary` (or `show bgp vpnv4 unicast vrf RED summary`) |
| Management access into a VRF | `ssh -vrf MGMT -l admin 10.9.9.9` |

```
R1# show vrf
  Name                             Default RD            Protocols   Interfaces
  BLUE                             65000:2               ipv4        Gi0/2
                                                                     Gi0/3.20
  RED                              65000:1               ipv4,ipv6   Gi0/1
                                                                     Gi0/3.10
```

### Route Leaking — Controlled Holes Between VRFs

Sometimes separate VRFs must share something: every VRF needs the shared DNS servers or the internet edge. **Route leaking** imports specific routes from one table into another.

**With static routes** (simple, small scale): a static route in one table can point to a next hop in another, as long as you **name the exit interface**, or use the `global` keyword for a next hop in the global table:

```
! RED reaches shared services (192.168.100.0/24) in the global table
ip route vrf RED 192.168.100.0 255.255.255.0 192.168.0.1 global
! Global table returns traffic to RED's subnet via RED's interface
ip route 10.1.1.0 255.255.255.0 GigabitEthernet0/1 10.1.1.2
```

**With BGP route targets** (scalable): even on a single router, VRFs can export routes tagged with a **route target** and import other VRFs' targets. BGP does the copying, so it must be running, with an address family for each VRF:

```
vrf definition RED
 address-family ipv4
  route-target export 65000:1
  route-target import 65000:1
  route-target import 65000:100        ! also import SHARED's routes
vrf definition SHARED
 rd 65000:100
 address-family ipv4
  route-target export 65000:100
  route-target import 65000:100
  route-target import 65000:1          ! and send RED's routes back the other way
!
router bgp 65000
 address-family ipv4 vrf RED
  redistribute connected
 address-family ipv4 vrf SHARED
  redistribute connected
```

**Why must leaking always be configured in both directions?** For the same reason PBR is one-way: each table answers only for its own lookups. If RED learns how to reach SHARED but SHARED has no route back to RED, requests arrive and replies vanish. **Leaking also reintroduces the overlap problem**: if RED and BLUE both use 10.1.1.0/24 and both leak into SHARED, SHARED cannot tell them apart. *Every hole you punch between VRFs needs a return path and unique addresses on both sides.*

| Symptom | Cause | Command that proves it |
|---------|-------|------------------------|
| Interface lost its IP | `vrf forwarding` applied after the address | `show ip interface brief`; re-add the IP |
| Ping fails, but routes look fine | Pinged in the global table | `ping vrf RED ...` |
| VRF neighbor never forms | Routing process not in the VRF, or neighbor's subinterface in a different VRF / VLAN | `show ip ospf 10 interface brief`, `show vrf` on both sides |
| BGP VRF address family rejected | VRF has no RD | `show vrf detail` |
| One-way connectivity across a leak | Return leak missing | `show ip route vrf SHARED <src-subnet>` |
| OSPF routes from an MPLS provider missing in VRF | DN-bit check | `capability vrf-lite` |
| EIGRP in a VRF sends no hellos at all | Classic-mode `address-family ipv4 vrf BLUE` entered **without** `autonomous-system 20` (or a different AS than the neighbour) | `show ip eigrp vrf BLUE interfaces` is empty; `show run | section router eigrp` |

## 25.3 BFD — Detecting Failure in Milliseconds

![When a switch sits between routers, the link stays up after the far router dies — only hellos or BFD notice](images/c25_bfd.png)

Every routing protocol detects a dead neighbor by **missing hellos**: OSPF waits 40 seconds by default (the dead interval), EIGRP 15 seconds (hold time), BGP up to 180 seconds (hold time). For all that time, the router keeps forwarding into a black hole.

You might think a failed link would be noticed instantly, and if the cable is plugged straight into the router, it is: the interface goes down. But most real links run **through something**: a switch, a provider's Ethernet service, a DWDM system. When the *far* router dies, your interface to the switch **stays up**. Only the missing hellos reveal it.

**Bidirectional Forwarding Detection (BFD)** is a tiny, dedicated liveness protocol (RFC 5880/5881). It runs **one** lightweight session between two neighbors, exchanging packets every few tens of milliseconds, and notifies any routing protocol that registered with it the moment the session fails.

**Why not just tune each protocol's hello timers down?** Three reasons. First, **CPU**: routing hellos are processed by the control plane, and sub-second hellos from several protocols on many interfaces add up. BFD is designed to be cheap, and many platforms run it in hardware or a distributed data plane. Second, **one session serves everyone**: OSPF, EIGRP, BGP, static routes and HSRP can all use the same BFD session, instead of each running its own fast timers. Third, **uniformity**: BGP can't go below a 3-second hold time, but BFD gives BGP the same sub-second detection as everything else. *BFD separates "is my neighbor alive?" from "what routes does my neighbor have?" — and answers the first question once, fast, for everyone.*

### How BFD Works

| Item | Detail |
|------|--------|
| **Asynchronous mode** | The standard mode: each side sends control packets at the negotiated interval; if *multiplier* packets in a row are missed, the session goes down |
| **Echo mode** | Each side sends echo packets **addressed to itself**; the neighbor's forwarding plane simply loops them back. Tests the real data path without the neighbor's CPU. On by default on Cisco when async mode runs; control packets then slow down (`bfd slow-timers`) |
| **Transport** | UDP **3784** (single-hop control), **3785** (echo), **4784** (multihop, e.g. eBGP multihop) |
| **Detection time** | interval × multiplier — e.g. 50 ms × 3 = **150 ms** |
| **What BFD does on failure** | Tells its **clients**; it never changes routing itself. The client tears down the adjacency and reconverges |

### Configuring BFD

BFD timers go on the **interface**, and each routing protocol then **registers** as a client:

```
interface GigabitEthernet0/0
 bfd interval 50 min_rx 50 multiplier 3   ! send every 50 ms, expect every 50 ms, 3 misses
 no ip redirects                          ! echo mode requires this; IOS warns otherwise
!
router ospf 1
 bfd all-interfaces                       ! or per interface: ip ospf bfd
!
router eigrp 100                          ! classic mode
 bfd interface GigabitEthernet0/0         ! or: bfd all-interfaces
!
router eigrp CORE                         ! named mode
 address-family ipv4 unicast autonomous-system 100
  af-interface GigabitEthernet0/0
   bfd
!
router bgp 65001
 neighbor 10.0.12.2 fall-over bfd         ! BGP: per neighbor
!
ip route static bfd GigabitEthernet0/0 10.0.12.2      ! static: track the next hop...
ip route 10.50.0.0 255.255.0.0 GigabitEthernet0/0 10.0.12.2  ! ...for this route
```

HSRP can use the same session. On IOS releases that support it, HSRP registers with BFD automatically once the interface has BFD timers (`standby bfd` is on by default; `no standby bfd` turns it off), and `show standby neighbors` shows whether BFD is up toward each peer.

**Both neighbors** need BFD configured, or the session never comes up. Timers are **negotiated**: each side sends at the slower of its own `interval` and the other side's `min_rx`.

```
R1# show bfd neighbors

IPv4 Sessions
NeighAddr                    LD/RD         RH/RS     State     Int
10.0.12.2                     1/1          Up        Up        Gi0/0

R1# show bfd neighbors details
...
Session state is UP and using echo function with 50 ms interval.
OurAddr: 10.0.12.1
Local Diag: 0, Demand mode: 0, Poll bit: 0
MinTxInt: 1000000, MinRxInt: 1000000, Multiplier: 3
Received MinRxInt: 1000000, Received Multiplier: 3
Holddown (hits): 0(0), Hello (hits): 1000(84)
Rx Count: 84, Rx Interval (ms) min/max/avg: 1/1008/880 last: 236 ms ago
Registered protocols: OSPF EIGRP CEF
Uptime: 00:01:12
```

Notice what echo mode did. Detection is running on **echo packets every 50 ms**, so the **control** packets dropped to 1,000,000 µs (1 s, the `MinTxInt`/`MinRxInt` values are in microseconds), because they only need to keep the session alive. Without echo mode those fields would show 50000 (50 ms). `Holddown (hits)` counts how often the detection timer nearly expired. A climbing number means the timers are too tight for the path.

`LD/RD` are the local and remote **discriminators** (session IDs), `RH/RS` is the remote side's state, and `Registered protocols` shows which clients will be told when the session fails. **If your protocol isn't in that list, BFD failing won't help it.**

| Symptom | Cause | Command that proves it |
|---------|-------|------------------------|
| No BFD session at all | BFD configured on one side only, or no client registered | `show bfd neighbors` on both routers |
| Session up, but the protocol still waits for its dead timer | Protocol not registered (`bfd all-interfaces` / `fall-over bfd` missing) | `show bfd neighbors details` — Registered protocols |
| Session flaps constantly | Timers too aggressive for the platform or a busy CPU | `show bfd neighbors details` — Holddown hits; raise the interval |
| Echo mode not running | `ip redirects` on, or not supported by the peer | Warning in the log; `show bfd neighbors details` |

### Templates and Multihop BFD

On IOS XE, timers can be packaged in a **template** and reused. Multihop sessions (eBGP between loopbacks, for example) *must* use a template, and they're mapped by address pair instead of attached to an interface:

```
bfd-template single-hop FAST
 interval min-tx 50 min-rx 50 multiplier 3
!
interface GigabitEthernet0/0
 bfd template FAST                       ! replaces the per-interface bfd interval line
!
bfd-template multi-hop WAN-MH
 interval min-tx 300 min-rx 300 multiplier 3
bfd map ipv4 10.9.9.9/32 10.1.1.1/32 WAN-MH   ! destination, source, template
!
router bgp 65001
 neighbor 10.9.9.9 update-source Loopback0
 neighbor 10.9.9.9 ebgp-multihop 2
 neighbor 10.9.9.9 fall-over bfd multi-hop
```

Multihop BFD uses UDP **4784** and doesn't support echo mode. There's no single neighbour to loop the packets back, and the path can change underneath the session. Use more conservative timers than single-hop.

**Exam framing:** ENARSI 1.8 says **describe**, not configure. Expect questions on *why* BFD exists, async vs echo, how detection time is calculated, and which protocols can use it. The configuration above is what you'll type in a lab and what turns those descriptions into something you can verify.

---

<a name="chapter-26"></a>
# Chapter 26: EIGRP In Depth

> **Blueprint:** ENARSI 1.9 — Troubleshoot EIGRP (classic and named mode; VRF and global): 1.9.a address families (IPv4, IPv6) · 1.9.b neighbor relationship and authentication · 1.9.c loop-free path selection (RD, FD, FC, successor, feasible successor, stuck in active) · 1.9.d stubs · 1.9.e load balancing (equal and unequal cost) · 1.9.f metrics

Chapter 5 compared EIGRP with OSPF at the concept level: what an "advanced distance vector" protocol is, and why EIGRP converges fast. This chapter is the ENARSI version. You'll configure EIGRP **both ways IOS XE allows**, for **IPv4 and IPv6**, in the **global table and inside a VRF**. You'll work DUAL through with real numbers, and you'll learn to find the one broken thing in an EIGRP network quickly.

**The ENARSI mindset for this chapter:** nearly every EIGRP question is a troubleshooting question in disguise. A neighbor won't form, a route is missing, a backup path isn't used, a router went stuck-in-active. Each of those has a short list of causes, and each cause has a command that proves it. That's the shape of everything below.

---

## 26.1 Two Ways to Configure the Same Protocol: Classic vs Named Mode

IOS has two configuration styles for EIGRP. Both run the **same protocol on the wire**, so a classic-mode router and a named-mode router become neighbors happily. The exam expects you to read and write both.

| Aspect | Classic mode | Named mode |
|--------|--------------|------------|
| Starts with | `router eigrp 100` (the AS number) | `router eigrp CORP` (any name) |
| AS number lives | in the `router` command | in `address-family … autonomous-system 100` |
| IPv6 | separate `ipv6 router eigrp 100` process | another `address-family ipv6` in the **same** process |
| Per-interface settings | scattered across interfaces (`ip hello-interval eigrp 100 …`) | collected under `af-interface` inside the process |
| Per-topology settings | process level (`variance`, `maximum-paths`) | under `topology base` |
| Metrics | 32-bit classic metric | **64-bit wide metrics** (26.10) |
| HMAC-SHA-256 auth | not available | available |

**Why did Cisco invent named mode if classic still works?** Because classic EIGRP's configuration grew by accretion. Each new feature added another interface command with the AS number embedded in it, and IPv6 needed an entirely separate process. Troubleshooting meant hunting through every interface stanza to rebuild the picture in your head. Named mode puts **everything about one EIGRP instance in one hierarchical block**: the process, then the address family, then its interfaces and its topology. *One `show run | section router eigrp` tells you the whole story.* It's also where all new features land: wide metrics and SHA-256 authentication exist only there.

### The same network, configured both ways

R1 runs EIGRP AS 100 on `10.0.0.0/8`. Gi0/0 faces a LAN with no routers on it, so it should be passive. Gi0/1 faces R2.

```
! ---- Classic mode ----
router eigrp 100
 eigrp router-id 1.1.1.1
 network 10.0.0.0 0.255.255.255          ! enable EIGRP on interfaces in 10/8
 passive-interface GigabitEthernet0/0    ! advertise the LAN, but no hellos there
 variance 2
!
interface GigabitEthernet0/1
 ip hello-interval eigrp 100 5           ! per-interface tuning lives on the interface
 ip hold-time eigrp 100 15
```

```
! ---- Named mode ----
router eigrp CORP
 address-family ipv4 unicast autonomous-system 100
  eigrp router-id 1.1.1.1
  network 10.0.0.0 0.255.255.255
  af-interface default
   passive-interface                     ! passive everywhere by default...
  exit-af-interface
  af-interface GigabitEthernet0/1
   no passive-interface                  ! ...except where a neighbor lives
   hello-interval 5
   hold-time 15
  exit-af-interface
  topology base
   variance 2                            ! routing-table behavior lives here
  exit-af-topology
 exit-address-family
```

The three sub-modes of named mode are worth memorizing, because questions show you a config and ask what's wrong with it:

| Sub-mode | What goes there | Examples |
|----------|-----------------|----------|
| `address-family` | Things about the *instance* | `network`, `eigrp router-id`, `eigrp stub`, `metric weights` |
| `af-interface` | Things about one *interface* | `hello-interval`, `hold-time`, `passive-interface`, `authentication`, `split-horizon`, `summary-address` |
| `topology base` | Things about the *routing table* | `variance`, `maximum-paths`, `redistribute`, `distance`, `distribute-list`, `offset-list` |

**Exam trap:** in named mode, `af-interface default` applies to every interface, and a specific `af-interface` overrides it. The "passive by default, unpassive the uplinks" pattern above is common. If an adjacency won't form, check whether that interface ever got its `no passive-interface`.

Verification commands differ slightly too. Classic uses `show ip eigrp …`. Named mode supports those and also the address-family form:

```
R1# show eigrp address-family ipv4 neighbors
R1# show eigrp address-family ipv4 topology
R1# show eigrp protocols                  ! K values, router-ID, stub status, AD
```

---

## 26.2 EIGRP for IPv6

**Classic mode** runs IPv6 as a separate process, and it is enabled **per interface**. There's no `network` command:

```
ipv6 unicast-routing
!
ipv6 router eigrp 100
 eigrp router-id 1.1.1.1      ! REQUIRED if the router has no IPv4 address at all
 passive-interface GigabitEthernet0/0
!
interface GigabitEthernet0/1
 ipv6 address 2001:db8:12::1/64
 ipv6 eigrp 100               ! this is how an interface joins the IPv6 process
```

**Exam trap: the shut-down process.** On older IOS releases a classic `ipv6 router eigrp 100` process was created in a **shutdown** state, and nothing happened until you entered `no shutdown` under it. The interfaces showed `ipv6 eigrp 100`, but there were no neighbours and no error. If a classic IPv6 EIGRP config "looks perfect" and nothing forms, check `show ipv6 protocols` and `show run | section ipv6 router eigrp` for a `shutdown` line.

```
ipv6 router eigrp 100
 no shutdown                  ! harmless where it's the default; essential where it isn't
```

**Named mode** adds an address family, and **every IPv6-enabled interface joins automatically**. You turn interfaces *off* rather than on:

```
router eigrp CORP
 address-family ipv6 unicast autonomous-system 100
  eigrp router-id 1.1.1.1
  af-interface GigabitEthernet0/2
   shutdown                   ! exclude this interface from EIGRP for IPv6
  exit-af-interface
 exit-address-family
```

**Why does EIGRP for IPv6 still need a 32-bit router ID?** Because the router ID is a protocol field, not an address. EIGRP uses it to tag external routes (so a router can recognize and reject its own redistributed routes). It's a 32-bit number in dotted-decimal form whatever address family is running. On a router with any IPv4 address, IOS picks one automatically. On an **IPv6-only** router there's nothing to pick from, so the process won't start until you set one.

Things that change for IPv6:

| Detail | IPv4 | IPv6 |
|--------|------|------|
| Hello destination | 224.0.0.10 | FF02::A |
| Hello source / next hop | interface IPv4 address | the **link-local** address |
| Neighbor must be on same subnet? | yes | no — link-local only |
| Show commands | `show ip eigrp …` | `show ipv6 eigrp …` |

**Why are IPv6 neighbors and next hops link-local?** Because a link-local address always exists and is always on-link. That makes it the stable way to say "the router on the other end of this wire". It also explains a common puzzle: two IPv6 EIGRP routers can become neighbors even though their **global** prefixes don't match. The adjacency doesn't depend on those prefixes at all.

---

## 26.3 EIGRP Inside a VRF

VRF-Lite (Chapter 25) gives a router several separate routing tables. To run EIGRP inside one of them, you add a VRF address family. **The syntax is nearly identical in classic and named mode.** That's a frequent source of exam confusion, so here are both together:

```
vrf definition CUST_A
 address-family ipv4
!
interface GigabitEthernet0/3
 vrf forwarding CUST_A                   ! (re-enter the IP afterwards — this clears it)
 ip address 172.16.1.1 255.255.255.0
```

```
! ---- Classic mode: VRF AF inside the numbered process ----
router eigrp 1
 address-family ipv4 vrf CUST_A autonomous-system 200
  network 172.16.0.0 0.0.255.255
 exit-address-family
```

```
! ---- Named mode ----
router eigrp CORP
 address-family ipv4 unicast vrf CUST_A autonomous-system 200
  network 172.16.0.0 0.0.255.255
 exit-address-family
```

**Why does the VRF address family need its own `autonomous-system`?** Because the classic process number (`router eigrp 1`) is only the *global* table's AS. The VRF instance is a separate EIGRP instance that sends its own hellos with its own AS number, and the router at the other end must match **that** number. Leave it out and the address family never sends hellos at all. *Process 1 and AS 200 coexisting on one router is normal: one table, one instance, one AS each.*

Verify with the VRF keyword everywhere:

```
R1# show ip eigrp vrf CUST_A neighbors
R1# show ip eigrp vrf CUST_A topology
R1# show ip route vrf CUST_A eigrp
```

---

## 26.4 Neighbor Relationships — Why Adjacencies Fail

EIGRP neighbors find each other with hellos to **224.0.0.10** (IP protocol **88**). They then exchange the full topology using RTP, the Reliable Transport Protocol: updates, queries and replies are acknowledged. After that, they send only changes.

| Must match / must work | Doesn't have to match |
|------------------------|------------------------|
| **AS number** | Hello / hold timers |
| **K values** (metric weights) | Router ID (unique is best practice) |
| **Authentication** (mode, and the key in use) | Interface bandwidth / delay |
| **Primary subnet** on the shared link (IPv4) | Process name (named mode) |
| Interface **not passive** on either side | Classic vs named mode |
| Hellos actually delivered (ACLs, L2) | |

**Why don't EIGRP's hello and hold timers need to match, when OSPF's do?** Because EIGRP puts its **hold time inside each hello**. The receiver then uses the number the *sender* chose. "Declare me dead if you hear nothing for 15 seconds" is a promise the speaker makes about itself, so neighbors can safely use different rhythms. OSPF instead treats the timers as a property of the shared link, and both ends must agree. *Mismatched EIGRP timers don't block an adjacency, but they can make it flap.* If R1 says hold 3 s but only sends a hello every 5 s, R2 drops R1 between hellos, over and over.

Default timers: **hello 5 s / hold 15 s** on most links, and **hello 60 s / hold 180 s** on NBMA interfaces at T1 speed or slower.

### Symptom → cause → proof

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| No neighbor, no log message | AS mismatch (hellos silently ignored) | `show run | section eigrp` both sides; `debug eigrp packets hello` |
| `K-value mismatch` in the log | `metric weights` differ | `show ip protocols` — compare `K1=… K5=` |
| `Auth failure` / `authentication mode mismatch` | wrong key-string, key ID, or one side unauthenticated | `debug eigrp packets` shows `(invalid authentication)` |
| `not on common subnet` in the log | IPv4 addressing / mask error | `show ip int brief`, the log message itself |
| No neighbor; interface missing from list | `passive-interface`, or `network` didn't match | `show ip eigrp interfaces` (passive interfaces are absent) |
| Neighbor comes up, then is torn down after ~16 retransmissions (roughly a minute or more) and repeats | one-way path: ACL in one direction, unidirectional link, or unicast EIGRP blocked while multicast hellos pass | `retry limit exceeded` in the log; `show ip eigrp neighbors` — uptime keeps resetting, `Q Cnt` > 0; `show ip eigrp neighbors detail` (retransmit counts) |
| Neighbor on one side only, or no neighbour after adding a `neighbor` statement | **static `neighbor` command** on one end only (below) | `show run | section eigrp` both ends; `show ip eigrp neighbors detail` shows `Static neighbor` |

**Why does a one-way ACL produce a *flapping* neighbor instead of no neighbor?** Because EIGRP hellos are multicast, but the reliable packets (the initial updates and their ACKs) are often **unicast**. If an ACL permits protocol 88 to 224.0.0.10 but blocks unicast EIGRP, or blocks traffic in one direction only, the hellos get through and the neighbor appears. The reliable exchange then fails, RTP retries **16 times**, and the neighbor is torn down with `retry limit exceeded`. Then it comes back, and the cycle repeats. A safe ACL entry is:

```
ip access-list extended EDGE_IN
 permit eigrp any any            ! protocol 88 — covers both multicast hellos and unicast
```

### The Static `neighbor` Command — A Classic Self-Inflicted Fault

```
router eigrp 100
 neighbor 10.1.12.2 GigabitEthernet0/1      ! unicast hellos to this peer only
```

A static neighbour statement makes EIGRP send **unicast** hellos to that address, for links that don't carry multicast. The side effect is the trap: **on that interface, EIGRP stops sending and processing multicast hellos.** Configure it on R1 only, and R1 ignores R2's multicast hellos while R2 never hears from R1 at 224.0.0.10. Every other dynamic neighbour on R1's interface disappears too. **Both ends need matching `neighbor` statements**, and every router on that segment that should peer with R1 needs one.

Reading the neighbor table well is half the job:

```
R1# show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(100)
H   Address        Interface   Hold Uptime    SRTT   RTO  Q  Seq
                               (sec)          (ms)       Cnt Num
0   10.1.12.2      Gi0/1         13 02:41:07    4   100  0  37
1   10.1.13.3      Gi0/2         11 00:00:42 1020  5000  4  12
```

- **Hold** counting down from 15 and resetting is healthy.
- **Uptime** that keeps resetting to seconds is a flapping neighbor.
- A **Q Cnt** that stays above 0 means packets are waiting for ACKs. Together with a huge **SRTT/RTO** (as on 10.1.13.3), that points to a lossy or one-way path.

---

## 26.5 Authentication — MD5 and HMAC-SHA-256

EIGRP authentication means every packet carries a digest, so a rogue router can't inject routes. Both methods use a **key chain** (except the SHA password shortcut).

```
key chain EIGRP_KEYS
 key 1
  key-string S3cr3t!
  accept-lifetime 00:00:00 Jan 1 2026 infinite
  send-lifetime   00:00:00 Jan 1 2026 infinite
```

**Classic mode — MD5 only:**

```
interface GigabitEthernet0/1
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 EIGRP_KEYS
```

**Named mode — MD5 or HMAC-SHA-256**, under the `af-interface`:

```
router eigrp CORP
 address-family ipv4 unicast autonomous-system 100
  af-interface GigabitEthernet0/1
   authentication mode md5
   authentication key-chain EIGRP_KEYS
  exit-af-interface
  af-interface GigabitEthernet0/2
   authentication mode hmac-sha-256 Str0ngP@ss    ! SHA with an inline password
   ! (or: authentication mode hmac-sha-256 + authentication key-chain NAME)
  exit-af-interface
```

**Exam trap: the key ID matters for MD5.** An EIGRP MD5 packet carries the **key number** of the key that signed it. The receiver looks up *its own* key with that number. If R1 sends with key 1 and R2's only key is key 2 with the same string, authentication fails. Matching strings aren't enough; the numbers must match too.

**Why does a key chain have separate send and accept lifetimes?** For key **rollover without an outage**. You add key 2 on every router with an accept lifetime that starts now, and a send lifetime that starts next week. For a while every router *accepts* both keys and *sends* key 1. Then, on schedule, every router switches to sending key 2, which everyone already accepts. Finally you remove key 1. *If send and accept were the same window, there'd be a moment where one router signs with a key its neighbor won't accept yet.* (Lifetimes depend on clocks, which is one more reason Chapter 8's NTP matters.)

**Classic IPv6 EIGRP** authenticates with the same key chain, configured with IPv6 interface commands:

```
interface GigabitEthernet0/1
 ipv6 authentication mode eigrp 100 md5
 ipv6 authentication key-chain eigrp 100 EIGRP_KEYS
```

In named mode the `af-interface` commands are identical under `address-family ipv6`.

Verify: `show key chain`, `show ip eigrp interfaces detail` (shows the auth mode and key chain per interface), and `debug eigrp packets` (look for `invalid authentication` or `key 1 not found`).

---

## 26.6 DUAL — Successors, Feasible Successors and the Feasibility Condition

DUAL (Diffusing Update Algorithm) is why EIGRP converges in milliseconds when a backup exists, and **guarantees loop-freedom** without a full map. It runs on four terms:

| Term | Meaning |
|------|---------|
| **Reported Distance (RD)** | The neighbor's own metric to the destination — what it *tells* you (also called advertised distance) |
| **Feasible Distance (FD)** | Your **best** total metric to the destination: neighbor's RD + your cost to reach that neighbor |
| **Successor** | The neighbor providing the FD — the route installed in the routing table |
| **Feasible Successor (FS)** | A backup neighbor whose **RD < FD** — a loop-free backup kept ready in the topology table |

The rule in that last row is the **feasibility condition (FC)**: *a neighbor qualifies as a backup only if its reported distance is strictly less than my current feasible distance.*

### Worked example

![DUAL on R1: three neighbors, one successor, one feasible successor, one rejected path](images/c26_dual.png)

R1 has three paths to 10.9.9.0/24:

| Via | RD (neighbor's metric) | R1's cost to neighbor | Total | Role |
|-----|------------------------|-----------------------|-------|------|
| R2 | 1000 | 2000 | **3000** | **Successor** — lowest total, so FD = 3000 |
| R3 | 2500 | 1500 | 4000 | **Feasible successor** — RD 2500 < FD 3000 ✓ |
| R4 | 3500 | 100 | 3600 | **Not** a feasible successor — RD 3500 ≥ 3000 ✗ |

Look closely at R4. Its *total* (3600) is better than R3's (4000), yet R4 isn't a backup and R3 is. That's the whole point of the condition.

**Why does "RD < FD" guarantee a loop-free backup?** Because of what R4's RD *means*. If R4 is further from the destination than R1 is, R4's own best path **might run through R1**. R1 can't see R4's path; it only knows R4's distance. If that path does lead back through R1, then the moment R1 fails over to R4, packets bounce between them. A neighbor whose RD is *smaller* than my best distance is strictly **closer** to the destination than I am, so its path can't loop back through me. *The condition is conservative: it rejects some paths that would actually have worked, like R4 here. In exchange, every path it accepts is provably safe, and that's what lets EIGRP fail over instantly with no checking.*

**What happens when the successor fails:**

- **An FS exists** (R2 dies, R3 qualifies): R1 promotes R3 **immediately and locally**. There are no queries. The route stays **passive** and convergence takes well under a second.
- **No FS exists:** R1 marks the route **active** and **queries** every neighbor ("do you have a path to 10.9.9.0/24?"). It must wait for **every** reply before choosing a new successor.

Read the topology table to see all of this:

```
R1# show ip eigrp topology 10.9.9.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 10.9.9.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3000
  Descriptor Blocks:
  10.1.12.2 (GigabitEthernet0/1), from 10.1.12.2, Send flag is 0x0
      Composite metric is (3000/1000), route is Internal
  10.1.13.3 (GigabitEthernet0/2), from 10.1.13.3, Send flag is 0x0
      Composite metric is (4000/2500), route is Internal
```

The pair in parentheses is **(total metric / reported distance)**. Plain `show ip eigrp topology` lists **only successors and feasible successors**. To see R4's non-feasible path as well, add **`all-links`**:

```
R1# show ip eigrp topology all-links
P 10.9.9.0/24, 1 successors, FD is 3000, serno 41
        via 10.1.12.2 (3000/1000), GigabitEthernet0/1
        via 10.1.13.3 (4000/2500), GigabitEthernet0/2
        via 10.1.14.4 (3600/3500), GigabitEthernet0/3
```

*If you're asked "why isn't EIGRP using the backup path?", the answer is usually in the `all-links` output: compare the path's RD with the FD.*

---

## 26.7 Queries and Stuck-in-Active

When a route goes **active**, the query **diffuses**. Each queried neighbor that has no feasible successor of its own goes active too and queries *its* neighbors, and so on. The original router can't finish until every reply comes back up that tree.

**Why must a router wait for every single reply?** Because DUAL's loop-freedom depends on it. Choosing a new successor before everyone has answered could mean picking a neighbor whose information is already stale: one that's still routing through *you*. Waiting until everyone has recomputed is what keeps the new path safe. *The cost of that safety is that one slow or broken router can hold up the whole computation.*

That's **stuck-in-active (SIA)**. The protocol bounds the wait:

| Time | Event |
|------|-------|
| 0 s | Route goes active; queries sent |
| **90 s** (half the active timer) | No reply yet → send an **SIA-query** to that neighbor ("are you still working on it?") |
| — | Neighbor answers with an **SIA-reply** ("still working, I'm waiting on my own neighbors") → timer resets; up to 3 SIA-queries |
| **180 s** with no reply at all | Neighbor declared **SIA** → that **adjacency is reset** |

**Why did Cisco add SIA-query/SIA-reply instead of just resetting at 3 minutes?** Because in the old behavior, the router that got torn down was often innocent. A neighbor three hops away might be the one that's lost; your direct neighbor is just waiting on it, like you are. Resetting your direct neighbor flushes good routes and starts new queries, which can cascade. The SIA-query asks the direct neighbor to prove it's alive and still working. Only a neighbor that **doesn't answer** gets reset, so the reset lands near the actual problem.

```
%DUAL-3-SIA: Route 10.9.9.0/24 stuck-in-active state in IP-EIGRP(0) 100.
             Cleaning up
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.1.13.3 (Gi0/2) is down: stuck in active
```

**Finding the cause:** while the route is active, `show ip eigrp topology active` lists which neighbors haven't replied (marked with `r`). Follow that trail hop by hop until you find the router that's overloaded, flapping or on a lossy link. **Fix the cause by bounding the query domain**, not by raising `timers active-time`. The two tools for that are **stubs** (next section) and **summarization** (Chapter 24). A router that receives a query for a prefix it only knows as part of a summary replies "unreachable" immediately, so the query stops there.

---

## 26.8 Stub Routing — Keeping Spokes Out of Queries

A branch router with one or two uplinks to the hub can never be a useful transit path. Querying it is wasted time, and in a hub with hundreds of spokes, those queries are how SIA happens. **`eigrp stub`** tells neighbors this router is a dead end:

```
! Classic                                 ! Named mode
router eigrp 100                          router eigrp CORP
 eigrp stub connected summary              address-family ipv4 unicast autonomous-system 100
                                            eigrp stub connected summary
```

**Why does marking a spoke as a stub bound the query domain?** Because the stub announces itself in its hello, and the hub then **never sends it queries**. The hub knows the stub has no alternate paths to offer, so it doesn't wait on spokes that can't help. A hub with 500 stub spokes can recompute a lost route by querying only the other hubs. *The stub keyword is a promise: "I'm never a transit path, so don't ask me."*

The keywords control **what the stub advertises** (it still receives everything):

| Keyword | Stub advertises |
|---------|-----------------|
| `connected` | its connected routes (that are in EIGRP) |
| `summary` | its summary routes |
| `static` | static routes redistributed into EIGRP |
| `redistributed` | any redistributed routes |
| `receive-only` | **nothing** — learns only |
| `leak-map NAME` | routes learned from other neighbors that match the route-map (an exception to "never transit") |
| *(no keyword)* | defaults to **`connected summary`** |

**Exam trap:** a stub **doesn't re-advertise routes it learned from one EIGRP neighbor to another**. Consider a spoke with two hubs, where Hub-1's LAN reaches Hub-2 only through the spoke. After `eigrp stub`, that path disappears, because transit through a stub is exactly what the stub feature forbids. That's what `leak-map` is for. In `show ip eigrp neighbors detail` on the hub, a stub neighbor shows `Stub Peer Advertising (CONNECTED SUMMARY) Routes` and `Suppressing queries`.

---

## 26.9 Load Balancing — Equal and Unequal Cost

**Equal-cost:** EIGRP installs up to **4** equal-metric paths by default (`maximum-paths`, whose ceiling is 16 or 32 depending on the platform; it goes under `topology base` in named mode).

**Unequal-cost** is EIGRP's unique trick, and it's done with **`variance`**. A path is installed if:

1. it is a **feasible successor** (passes the FC), **and**
2. its metric **< variance × FD**.

Using 26.6's numbers (FD 3000) with `variance 2`, so the limit is 6000:

| Path | Metric | FS? | < 6000? | Installed? |
|------|--------|-----|---------|------------|
| via R2 | 3000 | successor | yes | **yes** |
| via R3 | 4000 | yes (RD 2500 < 3000) | yes | **yes** |
| via R4 | 3600 | **no** (RD 3500 ≥ 3000) | yes | **no** |

**Why does variance only consider feasible successors?** Because traffic actually flows over every installed path *at the same time*. If R1 sent part of its traffic to R4, and R4's best path ran back through R1, that traffic would loop. The FC that makes a path safe as a backup is the same guarantee that makes it safe to share load across. *R4 has the better metric, but it can't be proven loop-free, so it gets no traffic.*

Traffic is shared **in inverse proportion to the metric** (`traffic-share balanced`, the default), so R2 carries more than R3 here. `traffic-share min across-interfaces` installs both paths but uses only the best, which gives instant failover without sharing load.

```
R1# show ip route 10.9.9.0
  Routing Descriptor Blocks:
  * 10.1.12.2, from 10.1.12.2, via GigabitEthernet0/1
      Route metric is 3000, traffic share count is 4
    10.1.13.3, from 10.1.13.3, via GigabitEthernet0/2
      Route metric is 4000, traffic share count is 3
```

---

## 26.10 Metrics — Classic Composite and Wide

### The classic formula

EIGRP's **classic** metric combines five K values:

`metric = 256 × [ K1·BW + (K2·BW)/(256 − load) + K3·DLY ] × [ K5/(reliability + K4) ]`

The last bracket only applies if K5 ≠ 0; when K5 = 0 it's treated as 1.

| Term | Meaning | Default K |
|------|---------|-----------|
| **BW** | 10⁷ ÷ **lowest** bandwidth on the path in kbps | **K1 = 1** |
| **load** | link utilization (1–255) | K2 = 0 |
| **DLY** | **sum** of interface delays on the path, in tens of µs | **K3 = 1** |
| reliability (K4, K5 terms) | 1–255 | K4 = 0, K5 = 0 |

With the defaults, it collapses to **`metric = 256 × (10⁷ / min-BW-kbps + Σdelay/10)`**.

**Worked:** a connected GigabitEthernet network: BW term = 10⁷ / 1,000,000 = **10**; delay 10 µs → **1**. Metric = 256 × (10 + 1) = **2816**, the number you'll see on every Gi-connected EIGRP route. Add a second Gi hop and the delay sum becomes 2: 256 × 12 = **3072**.

**Why are load and reliability off by default?** Because they **change by the second**. A metric that follows load means routes change as traffic changes. Traffic then moves to the "lighter" path, which makes it heavier, and the routes flip back. That's self-inflicted route flapping. Bandwidth and delay are configured values that stay put, so they make stable metrics. *That's also why the exam steers you to change **delay**, not bandwidth, when you want to influence EIGRP. Delay is additive along the path and doesn't affect QoS or other features that read `bandwidth`.*

### Wide metrics (named mode)

Classic metrics have a scaling problem. The BW term is 10⁷ / kbps, so 10 Gbps → 1, and 100 Gbps → 0.1, which truncates to 0. Delay can't separate them either. **Classic EIGRP can't distinguish links faster than about 10 Gbps.**

Named mode uses **wide (64-bit) metrics**. They're computed in picoseconds and with a 65,536 scaling factor, so every modern speed gets a distinct value. They also add a **K6** term (jitter/energy, default 0). The routing table still holds only 32-bit metrics, so the wide value is divided by **`metric rib-scale`** (default **128**) before installation. *That's why the metric in `show ip route` doesn't equal the one in `show eigrp address-family ipv4 topology`. The topology table shows the full 64-bit number; the RIB shows it ÷ 128.*

Named-mode and classic routers interoperate: a named-mode router detects classic neighbors and scales metrics to match. **K values, though, must still match.** In named mode `metric weights` takes seven numbers: the TOS (always 0) and then K1–K6, for example `metric weights 0 1 0 1 0 0 0`. Classic mode takes six: the TOS and then K1–K5.

### Tuning the Path — Delay, Bandwidth and Offsets

Three knobs change which path EIGRP prefers, each with different side effects:

```
interface GigabitEthernet0/2
 delay 200                       ! tens of µs: 200 = 2,000 µs added for this link
 bandwidth 50000                 ! kbps — also changes QoS %, OSPF cost, EIGRP pacing
!
router eigrp 100
 offset-list 30 in 25600 GigabitEthernet0/2   ! +25600 to routes in ACL 30 heard here
```

Work the effect through R1's paths from 26.6. Suppose R1 wants R3 (total 4000) to be the successor instead of R2 (3000):

- **Raising delay on R1's link to R2** raises R1's cost to R2 and therefore the **total (FD candidate)** via R2. It does **not** change R2's RD, because RD is R2's own distance. Push R1's cost to R2 past 3000 (total > 4000) and R3 becomes the successor. R2 can stay a feasible successor as long as its RD (1000) is below the new FD (4000).
- **An offset list `in` on the R2 interface** adds to the metric as received from R2, so both the RD R1 records for R2 and the total via R2 rise. That can **remove R2 as a feasible successor**, if its adjusted RD reaches the FD. Offsetting a path makes it less preferred *and* can stop it qualifying as a backup.
- **Changing `bandwidth`** works only if it changes the **minimum** bandwidth along the path, and it has side effects. QoS percentages, OSPF cost and EIGRP's own pacing (below) all read it. That's why **delay is the preferred knob**: it's additive, predictable and used by nothing else.

### EIGRP Bandwidth Pacing — `ip bandwidth-percent eigrp`

EIGRP limits its own packets to **50% of the interface's configured `bandwidth`** by default, so a burst of updates can't starve user traffic. That's usually invisible until `bandwidth` is set unrealistically low. The classic case is a **tunnel interface**, whose default bandwidth is very low (historically 100 kbps). There, EIGRP is paced to a few kbps, and a large topology takes minutes to converge, or SIA appears under load:

```
interface Tunnel0
 bandwidth 10000                         ! tell EIGRP the real capacity
 ip bandwidth-percent eigrp 100 25       ! classic: EIGRP may use 25% of that
!
router eigrp CORP                        ! named mode equivalent
 address-family ipv4 unicast autonomous-system 100
  af-interface Tunnel0
   bandwidth-percent 25
```

`show ip eigrp interfaces detail` shows the pacing interval. Values in the hundreds of milliseconds on a fast link mean the `bandwidth` is wrong.

**Exam trap — K values and `show ip protocols`:**

```
R1# show ip protocols
  EIGRP-IPv4 Protocol for AS(100)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
```

If one router has been changed to `metric weights 0 1 1 1 0 0`, the neighbor drops with `K-value mismatch`. That line is the first place to look.

---

## 26.11 The EIGRP Troubleshooting Checklist

Work top-down: **neighbors, then the topology table, then the routing table.** Each layer depends on the one before it.

| Question | Command | What you're looking for |
|----------|---------|------------------------|
| Which interfaces run EIGRP? | `show ip eigrp interfaces [detail]` | Missing = `network` didn't match or passive; detail shows hello/hold, auth, split horizon |
| Who are my neighbors? | `show ip eigrp neighbors [detail]` | Missing, flapping uptime, Q Cnt stuck, stub flags |
| What does the process think? | `show ip protocols` | AS, K values, router ID, `network`s, passive list, AD 90/170, variance |
| Is the route learned at all? | `show ip eigrp topology [prefix]` | Present? Passive or Active? FD and RD values |
| Why isn't a path used? | `show ip eigrp topology all-links` | RD vs FD → feasibility condition |
| Why isn't it in the RIB? | `show ip route [prefix]` | Better-AD source wins (Chapter 22); `D` vs `D EX` |
| Is something stuck active? | `show ip eigrp topology active` | Neighbors with outstanding replies (`r`) |

And the classic route-level causes:

| Symptom | Cause | Proof / fix |
|---------|-------|-------------|
| Route in topology table, not in RIB | another source with lower AD (static 1, OSPF 110 beats EIGRP external 170) | `show ip route` shows the winner; Chapter 22 |
| Spoke routes missing between spokes on a hub | **split horizon** on the hub's multipoint interface | `no split-horizon` on the hub (Chapter 30) |
| Externals redistributed by one ASBR missing on **one particular router** (and anything that can only learn them through it) | **duplicate router ID**: that router shares the ASBR's EIGRP RID, sees its "own" RID as the originator and discards the externals. Other routers have them | On a router that has the route: `show ip eigrp topology <prefix>` → `Originating router is X`. On the router missing it: `show ip protocols` → `Router-ID: X`. Same value = proven. Fix `eigrp router-id` |
| Neighbour loss after adding unicast peering | `neighbor` statement on one side only | 26.4 |
| Discontiguous network reachability broken | `auto-summary` on (default **off** since IOS 15) | `show ip protocols` → `Automatic Summarization: disabled` |
| Backup path not used for load sharing | not a feasible successor | `all-links`: RD ≥ FD |
| Route flaps / SIA in a large network | unbounded query domain | configure stubs (26.8), summarize (Chapter 24) |

*If you can tell from `show ip eigrp topology all-links` alone why a path is or isn't used, you understand DUAL well enough for ENARSI.*

---

<a name="chapter-27"></a>
# Chapter 27: OSPF In Depth

> **Blueprint:** ENARSI 1.10 — Troubleshoot OSPF (v2/v3): 1.10.a address families (IPv4, IPv6) · 1.10.b neighbor relationship and authentication · 1.10.c network types (point-to-point, multipoint, broadcast, nonbroadcast), area types (backbone, normal, transit, stub, NSSA, totally stub), router types (internal, backbone, ABR, ASBR), virtual link · 1.10.d path preference

The CCNA guide (16.9–16.11) covered neighbor requirements, the DR/BDR election, the adjacency state machine and LSA types 1–7. Chapter 6 added multi-area design, summarization, filtering and OSPFv3 basics. This chapter covers the remaining ENARSI material: **every network type, every area type, virtual links, authentication, OSPFv3 address families and path preference**, all aimed at diagnosing what's broken.

---

## 27.1 OSPFv3 and Address Families

OSPFv3 was written for IPv6. With **address families**, a single OSPFv3 process can carry **IPv4 routes too**:

```
ipv6 unicast-routing
!
router ospfv3 1
 router-id 1.1.1.1                    ! 32-bit RID, shared by both AFs
 address-family ipv6 unicast
  passive-interface GigabitEthernet0/0
 exit-address-family
 address-family ipv4 unicast
  area 1 stub
 exit-address-family
!
interface GigabitEthernet0/1
 ip address 10.1.12.1 255.255.255.0
 ipv6 address 2001:db8:12::1/64
 ospfv3 1 ipv6 area 0                 ! join the IPv6 AF
 ospfv3 1 ipv4 area 0                 ! join the IPv4 AF — same process, separate instance
```

**Why does the IPv4 address family still need IPv6 on the interface?** Because OSPFv3 always **talks over IPv6**. Its hellos come from the interface's **link-local** address to **FF02::5** (all OSPF routers) and **FF02::6** (DR/BDR), even when the routes it carries are IPv4. The IPv4 address family runs as a separate OSPFv3 **instance** (instance IDs 64–95, versus 0–31 for IPv6). Each instance has its own adjacencies and its own LSDB, but they all use the IPv6 transport. *An interface with only an IPv4 address can't run OSPFv3 at all.* Enable IPv6 on it (even just `ipv6 enable` for a link-local address) and the IPv4 AF comes up.

What's different inside OSPFv3, and why it matters for troubleshooting:

| OSPFv2 | OSPFv3 |
|--------|--------|
| Router and network LSAs (1, 2) carry prefixes | Router/network LSAs carry **topology only**; prefixes move to new LSAs |
| — | **Type 8 Link LSA**: a router's link-local address and prefixes on one link (link scope) |
| — | **Type 9 Intra-Area-Prefix LSA**: the area's prefixes (replaces the prefix part of types 1/2) |
| Type 3 Summary, Type 4 ASBR Summary | renamed **Inter-Area-Prefix** and **Inter-Area-Router** |
| Neighbors must share an IPv4 subnet | Neighbors meet over link-local — global prefixes **don't** need to match |
| Authentication built into OSPF | Authentication uses **IPsec** (or, on newer IOS XE, a key-chain trailer) |

**Why move prefixes out of the router LSA?** So that **renumbering doesn't trigger SPF**. In OSPFv2, changing a prefix on an interface changes the router LSA, which is the same object that describes the topology, so every router reruns the full SPF. In OSPFv3 the shape of the network (types 1/2) and the addresses on it (type 9) are separate. Adding a prefix only changes a type 9 LSA, and routers update their routes without recomputing the tree.

Verification uses `ospfv3`-prefixed commands, with an AF keyword where needed:

```
R1# show ospfv3 neighbor
R1# show ospfv3 ipv4 neighbor             ! just the IPv4 AF's adjacencies
R1# show ospfv3 database
R1# show ip route ospfv3                  ! IPv4 routes learned through OSPFv3
```

---

## 27.2 Neighbor Failures Beyond the CCNA List

The CCNA list (area, subnet, timers, authentication, MTU) still applies. Two more matching items come in at this level, plus failures that let an adjacency form but break the database.

**Hello-packet items that must match:** area ID, hello/dead interval, authentication, subnet mask (except on point-to-point links), and the **stub area flag** (the E/N option bits).

| Symptom | Cause | Command that proves it |
|---------|-------|------------------------|
| No neighbor; `Mismatched area ID` | interfaces in different areas | `debug ip ospf adj`; `show ip ospf interface brief` |
| No neighbor; `mismatched hello parameters` | hello/dead or mask differ | `show ip ospf interface Gi0/1` — compare `Timer intervals` |
| No neighbor; nothing obvious in the config | **stub flag mismatch** — one side `area 1 stub`, other not | `debug ip ospf hello` → `Hello from X with mismatched Stub/Transit area option bit` |
| No neighbor; `Mismatch Authentication type` / `key` | type or key differs | `debug ip ospf adj` |
| Stuck **EXSTART/EXCHANGE** | **MTU mismatch** (CCNA 16.11) | `show interface | i MTU`; fix the MTU, or `ip ospf mtu-ignore` as a last resort |
| **No adjacency** with a directly connected neighbour; `%OSPF-4-DUP_RTRID_NBR` logged | **duplicate RID between neighbours**: the two routers on the link share a router ID, so the adjacency is refused | the log message names the RID and interface; `show ip ospf` on both ends |
| Adjacencies FULL, but routes come and go and CPU climbs; `%OSPF-4-FLOOD_WAR` (or a duplicate-RID-in-area message) | **duplicate RID between non-adjacent routers** in the same area: each keeps "correcting" the other's router LSA (below) | `show ip ospf database router <RID>` — sequence number racing upward; `show ip ospf` on suspects |
| No adjacency in **OSPFv3**; both ends look right | **instance ID mismatch**: `ospfv3 1 ipv6 area 0 instance 1` on one end, default instance 0 on the other. Packets for another instance are ignored | `show ospfv3 interface` — compare `Instance ID` |
| No adjacency; interface missing from the neighbour's view | **passive interface** on one side (no hellos sent or processed), or the interface was put in the wrong area by a `network` statement / `ip ospf area` | `show ip ospf interface Gi0/1` — `No Hellos (Passive interface)`; area shown per interface |
| Neighbour stuck in **LOADING** | link-state requests not satisfied: an LSA the neighbour can't supply or keeps failing (often a corrupted or oversized LSA on an MTU-marginal path, or a bug) | `show ip ospf neighbor detail`; `debug ip ospf adj` for `BADSEQNUM` / retransmitted LS requests |
| Neighbor FULL, routes missing, odd next hops | **network type mismatch** (27.4) | `show ip ospf interface` — `Network Type` both ends |
| Stuck **2-WAY** with every neighbor | both routers priority 0 on a broadcast segment — no DR can be elected | `show ip ospf neighbor` → `2WAY/DROTHER` everywhere |
| Neighbor stuck **INIT** | one-way: my hellos reach them, theirs don't reach me (ACL, L2 issue) | `debug ip ospf hello`; check inbound ACLs for protocol 89 / 224.0.0.5 |

**Why does a stub-flag mismatch block the adjacency?** Because area type is a promise about what the LSDB contains. A stub area must never hold Type 5 LSAs. If a router that believes the area is normal became adjacent to one that believes it's stub, it would flood Type 5s into a database that's supposed to have none, and the two routers would disagree about what the area *is*. OSPF prevents that by refusing adjacencies when the stub (or NSSA) bit differs. *Every router in an area must agree on its type, so the type is checked in every hello.*

**Why is a duplicate router ID so destructive?** Because the RID is how every LSA identifies its author. Two routers using the same RID generate "the same" router LSA with different contents. Each sees the other's version as a newer copy of *its own* LSA and floods a correction, so the LSA flip-flops forever. That's the "flood war": CPU climbs, SPF runs constantly, and routes come and go. The fix is a unique RID followed by `clear ip ospf process`. *The RID only changes when the process restarts.*

---

## 27.3 Authentication

OSPFv2 has three authentication types, carried in every packet header: **0 null**, **1 plain text**, **2 MD5** (plus HMAC-SHA via key chains). The *type* can be enabled per interface or for a whole area. The *keys* always live on the interfaces.

```
! ---- MD5, per interface ----
interface GigabitEthernet0/1
 ip ospf authentication message-digest           ! type 2 on this interface
 ip ospf message-digest-key 1 md5 S3cr3t!         ! key ID 1 must match the neighbor's
```

```
! ---- MD5, area-wide type, per-interface keys ----
router ospf 1
 area 0 authentication message-digest             ! every Area 0 interface uses type 2
interface GigabitEthernet0/1
 ip ospf message-digest-key 1 md5 S3cr3t!
```

```
! ---- HMAC-SHA-256 via a key chain (modern IOS XE) ----
key chain OSPF_KC
 key 1
  key-string Str0ngP@ss
  cryptographic-algorithm hmac-sha-256
interface GigabitEthernet0/1
 ip ospf authentication key-chain OSPF_KC
```

Plain text (type 1) is `ip ospf authentication` plus `ip ospf authentication-key PASS`, or `area 0 authentication` with no keyword. It keeps out mistakes, not attackers, since the password crosses the wire in the clear.

**Why can you set the type per area but not the key?** Because the **type** is a policy decision ("Area 0 must be authenticated"), and one line under the process enforces it everywhere. The **key** is a property of each link, shared by the two routers on it, and different links can use different keys. *The interface command overrides the area setting*, which is how one link can use a different type from the rest of its area.

**Exam trap — virtual links inherit Area 0's authentication.** A virtual link (27.6) is an Area 0 interface. If Area 0 has `area 0 authentication message-digest`, the virtual link needs a key too. Supply it on the `area X virtual-link` line (`area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 S3cr3t!`), or the virtual link won't come up even though both ends look correct.

**OSPFv3 authentication** uses IPsec AH or ESP, per interface or per area:

```
interface GigabitEthernet0/1
 ospfv3 authentication ipsec spi 256 sha1 0123456789ABCDEF0123456789ABCDEF01234567
!
router ospfv3 1
 area 0 authentication ipsec spi 500 md5 0123456789ABCDEF0123456789ABCDEF
```

The **SPI and the key must match** on both ends. The SHA-1 key is 40 hex characters; the MD5 key is 32. A mismatch looks like an adjacency that never leaves DOWN. Check `show ospfv3 interface` (look for the `authentication` line) and `show crypto ipsec sa`.

---

## 27.4 Network Types

OSPF behaves differently depending on what it believes the link is. The network type is set per interface with `ip ospf network <type>`, or `ospfv3 network` in v3:

| Network type | Default on | Hello/Dead | DR/BDR? | Neighbors | Next hop for routes across it |
|--------------|-----------|------------|---------|-----------|-------------------------------|
| **broadcast** | Ethernet | 10 / 40 | **yes** | discovered (multicast) | the originating router's interface |
| **point-to-point** | serial (HDLC/PPP), GRE tunnels | 10 / 40 | no | discovered | the neighbor |
| **non-broadcast** (NBMA) | Frame Relay main interface | **30 / 120** | **yes** | **manual `neighbor`** | the originating router (needs L2 mapping to it) |
| **point-to-multipoint** | — (configure it) | **30 / 120** | no | discovered | the hub; advertises **/32 host routes** per endpoint |
| **point-to-multipoint non-broadcast** | — | 30 / 120 | no | **manual `neighbor`** | as point-to-multipoint |
| loopback | loopbacks | — | — | — | advertised as a **/32** unless `ip ospf network point-to-point` |

**Why does non-broadcast need `neighbor` statements?** Because on an NBMA cloud the underlying network **can't deliver multicast**, so hellos to 224.0.0.5 never arrive. Instead, you list the neighbors and OSPF unicasts hellos to them:

```
router ospf 1
 neighbor 10.0.0.2                            ! unicast hellos to each spoke
 neighbor 10.0.0.3
interface Serial0/0
 ip ospf network non-broadcast
 ip ospf priority 255                         ! the hub must be DR...
! on each spoke:  ip ospf priority 0         ! ...because only the hub reaches everyone
```

**Where do the `neighbor` statements go?** Strictly, only on routers that are **eligible to become DR or BDR** (non-zero priority), which in a hub-and-spoke design means the **hub**. The hub unicasts hellos to each spoke, and a priority-0 spoke replies to the hello it receives, so the spokes need no `neighbor` lines. Adding them on spokes is harmless but not required.

**Why must the hub be the DR on a hub-and-spoke NBMA network?** Because the DR has to reach every router on the segment, and on a partial mesh **only the hub does**. A spoke that won the election couldn't flood to the other spokes, and the LSDB would never synchronize. Priority 0 on every spoke rules them out.

**Why does point-to-multipoint advertise host routes and avoid a DR?** It treats the shared subnet as a **collection of point-to-point links**. There's no DR, and each endpoint is advertised as a /32. Routes to spoke LANs then point through the **hub**, which can reach everyone. That fixes the partial-mesh problem without depending on spoke-to-spoke reachability or on a correct DR.

### Network-type mismatches

| Mismatch | Result |
|----------|--------|
| broadcast ↔ non-broadcast | **No adjacency** — timers differ (10/40 vs 30/120) |
| point-to-point ↔ point-to-multipoint | **No adjacency** — timers differ |
| **broadcast ↔ point-to-point** | **Adjacency forms (both 10/40) — but routes break.** One side expects a DR and a Type 2 LSA, the other describes a p2p link. SPF can't make the two descriptions agree, so routes across the link are missing |
| point-to-multipoint ↔ broadcast | adjacency may form after a timer fix; same inconsistency |

*The dangerous mismatch is the one where the timers match. The neighbor shows FULL and everything looks healthy, yet routes are missing.* That's why `show ip ospf interface` (`Network Type BROADCAST` vs `POINT_TO_POINT`) belongs on your checklist even when the adjacency is up.

---

## 27.5 Area Types and Router Types

**Router types** (one router can be several):

| Type | Definition |
|------|-----------|
| **Internal** | all interfaces in one area |
| **Backbone** | at least one interface in Area 0 |
| **ABR** | interfaces in Area 0 **and** another area; generates Type 3 (and Type 4) LSAs |
| **ASBR** | redistributes external routes into OSPF; generates Type 5 (or Type 7 in an NSSA) |

**Area types** decide which LSAs get in. The table is the core of this section:

| Area type | Config (all routers in the area) | Blocks | Default route |
|-----------|----------------------------------|--------|---------------|
| **Backbone** (Area 0) | — | nothing | — |
| **Normal** | — | nothing | only if originated |
| **Stub** | `area 1 stub` | Types **4, 5** | ABR injects default **(Type 3)** automatically |
| **Totally stubby** | `area 1 stub` + on the **ABR**: `area 1 stub no-summary` | Types **3** (except the default), **4, 5** | automatic Type 3 default |
| **NSSA** | `area 1 nssa` | Types 4, 5 — but **allows Type 7** from a local ASBR | **not automatic**: ABR needs `area 1 nssa default-information-originate` (Type 7 default) |
| **Totally NSSA** | `area 1 nssa` + on the **ABR**: `area 1 nssa no-summary` | Types 3 (except default), 4, 5; allows 7 | automatic Type 3 default |
| **Transit** | (any normal area carrying a virtual link) | — | — |

**Why block Type 4 along with Type 5?** A Type 4 LSA only says "here's how to reach ASBR X", and it exists so routers can use the Type 5s that ASBR originates. Block the Type 5s and the Type 4s are useless.

**Why doesn't a plain NSSA get an automatic default route, when a stub area does?** Because an NSSA, unlike a stub area, may have a **way out of its own**: the local ASBR's external connection. Injecting a default automatically could pull traffic toward the ABR that should leave through the local ASBR, or the reverse. Cisco makes you decide, with `default-information-originate`. **Totally NSSA** does get the automatic default, because `no-summary` has removed inter-area routes, and without a default nothing outside the area would be reachable.

**What happens to Type 7s:** the NSSA's ABR **translates Type 7 to Type 5** as it floods them into Area 0. If there are several ABRs, the one with the **highest router ID** does the translation. Elsewhere in the domain the routes appear as normal `O E1/E2`; inside the NSSA they show as **`O N1/N2`**.

### Default Routes in Stub and NSSA Areas — the ENARSI Detail

Normal-area default origination (`default-information originate [always] [metric] [metric-type] [route-map]`, and the "no default in the RIB, nothing originated" fault) is covered in 24.8. NSSAs have their own command and their own rule:

```
router ospf 1
 area 1 nssa default-information-originate [metric 10] [metric-type 1]
```

| Where it's configured | Behaviour |
|-----------------------|-----------|
| On the **NSSA ABR** | Originates a **Type 7 default** into the NSSA **unconditionally**. No default is needed in the ABR's RIB, because the ABR's way out is Area 0 |
| On an **NSSA ASBR that is not an ABR** | Originates the Type 7 default **only if a default route exists in its RIB**, like `default-information originate` without `always` |
| `area 1 nssa no-summary` on the ABR | Totally NSSA: a **Type 3** default is injected automatically, with no `default-information-originate` needed |

Two more NSSA knobs show up in troubleshooting questions:

```
router ospf 1
 area 1 nssa no-redistribution                 ! ABR that is also an ASBR: redistribute
                                               !   into normal areas only, not into the NSSA
 area 1 nssa translate type7 suppress-fa       ! translated Type 5s carry FA 0.0.0.0
```

`no-redistribution` stops an ABR's own redistributed routes from being injected into the NSSA as Type 7s, which avoids duplicates when they also arrive through Area 0. `suppress-fa` is the fix for the **forwarding-address black hole** described in 24.3. If routers outside the NSSA can't reach the Type 7's forwarding address, perhaps because that subnet is filtered or summarized away at the ABR, the translated Type 5s are never installed. With the FA suppressed, traffic is sent to the translating ABR instead.

**Rules that create exam questions:**

- **Area 0 can't be stub or NSSA.**
- A **virtual link can't cross a stub or NSSA area** (27.6).
- A stub or totally stubby area **can't contain an ASBR**. Redistributing there means the area has to be an NSSA.
- `no-summary` only matters **on the ABR**. Internal routers just need `stub`/`nssa`, and that flag must still match everywhere (27.2).

---

## 27.6 Virtual Links

OSPF's rule: **every area must attach to Area 0**, and Area 0 must be contiguous. A **virtual link** is the repair when that can't be done physically: a logical Area 0 adjacency tunneled through a **transit area**.

![Virtual link through transit Area 1 connects Area 2 to the backbone](images/c27_virtual_link.png)

```
! On R2 (ABR between Area 0 and Area 1)
router ospf 1
 area 1 virtual-link 3.3.3.3          ! the FAR end's ROUTER ID, not an IP address
! On R3 (Area 1 and Area 2)
router ospf 1
 area 1 virtual-link 2.2.2.2
```

**Why does Area 2 need a backbone connection at all? R3 is connected to it.** Because OSPF's inter-area design is a strict **hub and spoke around Area 0**. An ABR only advertises summaries *into* Area 0 and *out of* Area 0. Without an Area 0 interface, R3 isn't really an ABR: it won't generate Type 3s for Area 2 into Area 1, and the rest of the network never learns Area 2's prefixes. The virtual link gives R3 an Area 0 interface, so it becomes a true ABR. *The "every area touches Area 0" rule is what prevents inter-area loops. Distance-vector-style summaries only flow through the backbone, so they can't circle around.*

The two uses:

1. **An area not attached to Area 0** (as drawn), common after a merger or a quick fix.
2. **A partitioned (discontiguous) Area 0.** A link failure splits the backbone in two, and a virtual link through a normal area joins the halves.

The rules:

- Configured with the **remote router ID**, in the **transit area's** number.
- The transit area **must be normal**, never stub or NSSA, because the virtual link's traffic has to be routable across it with full information.
- The virtual link is **in Area 0**, so it inherits Area 0's authentication (27.3).
- Verify with `show ip ospf virtual-links` (look for `Virtual Link OSPF_VL0 to router 3.3.3.3 is up` and `Adjacency State FULL`). `show ip ospf neighbor` lists it on `OSPF_VL0`.

*A virtual link is a repair, not a design. If your topology needs one long-term, renumber the areas.*

---

## 27.7 Path Preference

When OSPF knows several routes to the same prefix, it doesn't compare cost first. It compares **route type** first, and only uses cost within the same type:

| Rank | Code | Route type | Cost compared |
|------|------|------------|---------------|
| 1 | `O` | Intra-area | total cost |
| 2 | `O IA` | Inter-area | total cost |
| 3 | `O E1` / `O N1` | External type 1 | external metric **+** internal cost to the ASBR |
| 4 | `O E2` / `O N2` | External type 2 (**default**) | external metric only; tie → lowest **forwarding metric** (cost to the ASBR) |

**Why does an intra-area route beat a cheaper inter-area one?** For loop prevention, again. Intra-area routes come from the router's own SPF over a complete map. Inter-area routes are distance-vector-style summaries passed on by ABRs. Trusting the full map before the summary keeps the hub-and-spoke area model consistent. *An `O` with cost 500 beats an `O IA` with cost 10, and the exam will test exactly that.*

**E1 vs E2 — when does it matter?** **E2** (the default, seed metric **20**; **1** for routes redistributed from BGP) keeps the external metric **constant** throughout the OSPF domain. Every router sees the same cost no matter how far away the ASBR is. That's fine with a single exit. **E1** **adds** the internal path cost, so with two ASBRs advertising the same prefix, each router picks the **closer** exit. *Use E1 when you have multiple exits and want each router to use its nearest one.* With E2 and equal external metrics, the tiebreaker is the **forwarding metric** (the internal cost to the ASBR), which you can see in `show ip ospf database external` and `show ip route`.

```
R5# show ip route 192.0.2.0
Routing entry for 192.0.2.0/24
  Known via "ospf 1", distance 110, metric 20, type extern 2, forward metric 64
```

---

## 27.8 Reading the LSDB

When routes are missing, the LSDB tells you whether the information **arrived** and the problem is in route calculation, or whether it **never arrived**.

```
R1# show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Router Link States (Area 0)
Link ID         ADV Router      Age   Seq#       Checksum Link count
1.1.1.1         1.1.1.1         412   0x80000007 0x00A1B2 3
2.2.2.2         2.2.2.2         398   0x80000005 0x003C4D 2

                Net Link States (Area 0)
Link ID         ADV Router      Age   Seq#       Checksum
10.1.12.2       2.2.2.2         398   0x80000002 0x00E5F6

                Summary Net Link States (Area 0)
Link ID         ADV Router      Age   Seq#       Checksum
172.16.1.0      2.2.2.2         377   0x80000001 0x0012AB

                Type-5 AS External Link States
Link ID         ADV Router      Age   Seq#       Checksum Tag
192.0.2.0       3.3.3.3         210   0x80000001 0x0077CD 0
```

How to read it:

- **Router Link States** = Type 1, one per router in the area. **Net Link States** = Type 2, one per DR segment; the Link ID is the **DR's interface IP**.
- **Summary Net** = Type 3 from the ABR shown in ADV Router. **Summary ASB** = Type 4. **Type-5 AS External** = redistributed routes from the ASBR. **Type-7** appears only inside an NSSA.
- **Age** counts up to **3600 s** (MaxAge, then the LSA is flushed). Each LSA is refreshed every **1800 s**, with its **sequence number** incremented. A sequence number that keeps climbing quickly means a flapping LSA, often the duplicate-RID flood war from 27.2.

**Drill-down commands:** `show ip ospf database router 2.2.2.2` (that router's links and costs), `show ip ospf database external 192.0.2.0` (metric type, forward address), `show ip ospf border-routers` (the ABRs and ASBRs this router can reach). *If a Type 5 is in the database but the route isn't in the table, the ASBR is probably unreachable. `show ip ospf border-routers` will be missing it.*

---

## 27.9 The OSPF Troubleshooting Checklist

| Layer | Question | Command |
|-------|----------|---------|
| Interfaces | Is OSPF on the right interfaces, in the right area, with the right type and timers? | `show ip ospf interface brief` / `show ip ospf interface Gi0/1` |
| Neighbors | Are they FULL (or 2-WAY between DROTHERs)? | `show ip ospf neighbor` |
| Process | RID, area types, reference bandwidth, `distribute-list`s? | `show ip ospf`, `show ip protocols` |
| Database | Did the LSA arrive? From whom? | `show ip ospf database …` |
| Reachability of the advertiser | ABR/ASBR reachable? | `show ip ospf border-routers` |
| RIB | Did OSPF's route lose to a lower AD? | `show ip route prefix` (Chapter 22) |

Route-level causes to remember:

| Symptom | Cause |
|---------|-------|
| Externals missing in one area only | area is stub/totally stubby (expected — check for the default) |
| Inter-area routes missing in one area | `no-summary` on its ABR, or an `area X filter-list` / `area X range … not-advertise` (Chapter 6) |
| Area's routes missing everywhere else | area not attached to Area 0 → virtual link needed (27.6) |
| Prefix in LSDB, not in RIB | `distribute-list in` filtering the RIB (LSDB unaffected — Chapter 23), or a lower-AD source |
| Route via the far exit instead of the near one | externals are E2 — use E1 (27.7) |
| Suboptimal path everywhere | `auto-cost reference-bandwidth` inconsistent between routers (CCNA 16.6) |
| Default route missing in a normal area | no default in the originator's RIB and no `always` (24.8) |
| Externals in the LSDB, not in the RIB, on routers outside an NSSA | forwarding address unreachable (24.3) — `suppress-fa` or stop filtering the FA subnet |
| Loopback advertised as /32 instead of /24 | loopback network type — `ip ospf network point-to-point` |

*Most OSPF faults come down to two routers disagreeing about something: an area, a type, a timer, a key, an RID or a reference bandwidth. Find the disagreement and you've found the fault.*

## 27.10 Walk-Through: Tracing an ABR Filter

ABR filtering (`area X filter-list`, `area X range … not-advertise`, Chapter 6, 6.6) is quiet. It produces no log message and no error, and the prefix simply never leaves its area. Here's the method on a real-looking fault.

**Symptom:** users in Area 2 can't reach 10.1.50.0/24, which lives in Area 1. Everyone else can.

**Step 1 — Is the route missing, or just losing?** On an Area 2 router:

```
R6# show ip route 10.1.50.0
% Subnet not in table
R6# show ip ospf database summary 10.1.50.0
            OSPF Router with ID (6.6.6.6) (Process ID 1)
R6#                                          <- no Type 3 at all
```

No Type 3 in Area 2's database means the problem is upstream, at an ABR, not in R6's calculation.

**Step 2 — Does the Area 0 side have it?** On a backbone router:

```
R2# show ip ospf database summary 10.1.50.0
                Summary Net Link States (Area 0)
  Link State ID: 10.1.50.0 (summary Network Number)
  Advertising Router: 3.3.3.3                   <- Area 1's ABR advertised it into Area 0
```

So Area 1's ABR (3.3.3.3) is fine, and the prefix reached the backbone. The loss is at the ABR **between Area 0 and Area 2**.

**Step 3 — Inspect that ABR's filters:**

```
R5# show run | section router ospf
router ospf 1
 area 2 filter-list prefix NO-LAB in
R5# show ip prefix-list NO-LAB
ip prefix-list NO-LAB: 2 entries
   seq 5 deny 10.1.0.0/16 le 24
   seq 10 permit 0.0.0.0/0 le 32
```

`area 2 filter-list … in` filters Type 3s going **into** Area 2. Seq 5 was meant to block a lab /16 but uses `le 24`, so it also catches 10.1.50.0/24. Fix the prefix list (for example `deny 10.1.0.0/16` with no `le`, to block only the /16 itself, or a deny for the real lab range) and check `show ip prefix-list detail NO-LAB` hit counts afterwards.

**What to remember from the method:** work outward from the router with the problem using **`show ip ospf database summary <prefix>`** in each area, and find the area boundary where the Type 3 stops existing. The ABR at that boundary is where the filter is. Remember the direction, too: `in` filters Type 3s entering the named area, `out` filters Type 3s generated *from* the named area's routes. And `distribute-list in` would have left the LSA in the database and removed only the route (Chapter 23). *LSA present but route missing points at a distribute list or AD. LSA absent points at an ABR filter or range.*

---

<a name="chapter-28"></a>
# Chapter 28: BGP In Depth

> **Blueprint:** ENARSI 1.11 — Troubleshoot BGP (internal and external, unicast, and VRF-Lite): 1.11.a address families (IPv4, IPv6) · 1.11.b neighbor relationship and authentication (next-hop, multihop, 4-byte AS, private AS, route refresh, synchronization, operation, peer group, states and timers) · 1.11.c path preference (attributes and best-path) · 1.11.d route reflector (excluding multiple route reflectors, confederations, dynamic peer) · 1.11.e policies (inbound/outbound filtering, path manipulation)

Chapter 7 covered the BGP foundations: path-vector routing, eBGP between directly connected neighbors, the message types, and the best-path algorithm in outline. ENARSI adds **iBGP** and everything it brings with it: next-hop handling, loopback peering, route reflectors, address families, VRFs. It also adds the policy tools that make BGP useful, and the troubleshooting skill to see why a session isn't Established or why the "wrong" path won.

**The mindset:** BGP has no automatic discovery and almost no automatic behavior. Every neighbor is configured by hand, every policy is explicit, and the best-path algorithm is deterministic. So when BGP does something surprising, the reason is always visible in the output somewhere. Your job is to know where to look.

---

## 28.1 iBGP vs eBGP — Different Rules for Different Neighbors

| Behavior | eBGP (different AS) | iBGP (same AS) |
|----------|---------------------|----------------|
| Administrative distance | **20** | **200** |
| Default TTL of BGP packets | **1** — neighbor must be directly connected | 255 — can be many hops away |
| Next hop when advertising | changed to **self** | **unchanged** (28.2) |
| AS_PATH | own AS **prepended** | unchanged |
| Re-advertising learned routes | to all peers | **never to another iBGP peer** (iBGP split horizon) |
| LOCAL_PREF | not sent | sent |
| Typical peering address | directly connected interface | **loopback** |

**Why can't an iBGP router pass an iBGP-learned route to another iBGP peer?** Because inside one AS, BGP has **no loop detection**. eBGP spots loops by finding its own AS number in the AS_PATH, but iBGP doesn't add to the AS_PATH, so a route circling among iBGP peers would look the same every time around. The **iBGP split-horizon rule** removes the possibility: a route learned from an iBGP peer is never sent to another iBGP peer. The consequence is that every iBGP router must hear every route **directly** from the router that learned it. That means either a **full mesh** of iBGP sessions, n(n−1)/2 of them, or a **route reflector** (28.7) that's allowed to break the rule under controlled conditions.

**Why peer iBGP on loopbacks?** Because the session should survive any single link failure. A loopback never goes down, and the IGP finds *some* path to it as long as one exists. Peering on a physical interface IP ties the session to that one cable. Two pieces of configuration make it work:

```
router bgp 65001
 neighbor 2.2.2.2 remote-as 65001
 neighbor 2.2.2.2 update-source Loopback0    ! source my packets from my loopback
```

**Why is `update-source` needed?** Because BGP runs over TCP, and TCP checks addresses. R2 is configured with `neighbor 1.1.1.1`, so it only accepts a connection *from* 1.1.1.1. Without `update-source`, R1 sources the TCP SYN from its outgoing physical interface. R2 sees an unknown address and refuses it, so **R1's** connection attempts fail. Strictly, the session can still come up if R2 has `update-source Loopback0`: R2 opens the TCP connection *from* 2.2.2.2 to 1.1.1.1, R1 recognises 2.2.2.2 as a configured neighbor and accepts it. The session only stays stuck in **Active** when **neither** side can open a connection the other will accept. *Configure `update-source` on both ends anyway, so either side can initiate and the behavior is predictable — and both ends need a route to the other's loopback.*

**eBGP between loopbacks** (often used to load-share across two parallel links) runs into the TTL-1 rule, because the loopback is one hop beyond the directly connected interface:

| Command | What it does | Use when |
|---------|--------------|----------|
| `neighbor X ebgp-multihop 2` | sends eBGP packets with TTL 2 (or any number up to 255) | the eBGP peer really is more than one hop away |
| `neighbor X disable-connected-check` | keeps TTL 1, but skips the "peer address must be on a connected subnet" check | loopback peering between **directly connected** routers |
| `neighbor X ttl-security hops 1` | sends with TTL **255**, accepts only TTL ≥ 254 (GTSM) | protecting eBGP from spoofed remote packets; **can't be combined with `ebgp-multihop`** |

**Why is TTL security stronger than TTL 1?** Because an attacker anywhere on the internet can craft a packet that **arrives** with TTL 1. They just set the starting TTL to the right number of hops. Nobody, though, can make a packet *arrive* with TTL 254 from more than one hop away, because every router along the way decrements it. Starting high and requiring a high value on arrival proves the packet came from a directly connected router.

---

## 28.2 Next Hop and `next-hop-self`

![iBGP keeps the eBGP next hop unless the border router rewrites it](images/c28_next_hop.png)

When R1 learns 8.8.8.0/24 from the ISP, the next hop is the ISP's address, 203.0.113.1. When R1 passes the route to iBGP peer R2, **the next hop doesn't change**. R2 needs a route to 203.0.113.1, and the IGP usually doesn't carry the ISP link's subnet.

```
R2# show ip bgp 8.8.8.0
BGP routing table entry for 8.8.8.0/24, version 0
Paths: (1 available, no best path)
  65100
    203.0.113.1 (inaccessible) from 1.1.1.1 (1.1.1.1)
      Origin IGP, metric 0, localpref 100, valid, internal
```

**`(inaccessible)` and `no best path`** are the symptom. The route is in the BGP table but can't be used, because step 0 of the best-path algorithm (28.6) is "**is the next hop reachable?**". The two fixes:

```
router bgp 65001
 neighbor 2.2.2.2 next-hop-self      ! on R1: rewrite next hop to my update-source (1.1.1.1)
! — or — advertise the ISP link into the IGP (passive) so 203.0.113.1 is reachable
```

**Why doesn't iBGP change the next hop by default?** Because the original next hop is often the **better** forwarding answer. In a shared-segment design, or when the exit router isn't the BGP speaker, the true exit is the eBGP peer, and rewriting it would detour traffic through R1. BGP keeps the most specific forwarding information it has and leaves the choice to you. *In a typical enterprise edge, `next-hop-self` on the border router toward its iBGP peers is the standard configuration.*

---

## 28.3 Sessions: States, Timers and Why They Get Stuck

BGP's finite-state machine:

| State | Meaning | Stuck here usually means |
|-------|---------|--------------------------|
| **Idle** | not trying (or waiting before retrying) | no route to the neighbor; `neighbor shutdown` → `Idle (Admin)`; max-prefix exceeded → `Idle (PfxCt)` |
| **Connect** | TCP three-way handshake in progress | — (brief) |
| **Active** | the TCP attempt **failed**; retrying and listening | wrong neighbor IP, missing `update-source`, missing `ebgp-multihop`, ACL blocking **TCP 179**, peer not configured |
| **OpenSent** | TCP up, OPEN sent, waiting for theirs | — |
| **OpenConfirm** | OPENs exchanged, waiting for KEEPALIVE | — |
| **Established** | exchanging UPDATEs | healthy |

**The trap in the name:** "Active" sounds healthy, but it means **failure**. The router is actively *trying* to connect and not succeeding. A session that **flips between Idle and Active** is a TCP problem. A session that reaches OpenSent and then drops back is a **parameter mismatch** detected in the OPEN message, and the router logs a NOTIFICATION that names it:

```
%BGP-3-NOTIFICATION: sent to neighbor 10.1.12.2 passive 2/2 (peer in wrong AS) 2 bytes FDE9
%BGP-5-ADJCHANGE: neighbor 10.1.12.2 Down BGP Notification sent
```

`2/2` is the OPEN error **bad peer AS**. The `FDE9` is the AS the peer actually sent (0xFDE9 = 65001).

**Timers:** keepalive **60 s**, hold **180 s** by default. They're **negotiated**: each side proposes a hold time in its OPEN, and both use the **lower** value. Set them per neighbor with `neighbor X timers 10 30` or globally with `timers bgp 10 30`. *The timers don't have to match, unlike OSPF's.* For sub-second failure detection, use **BFD** (`neighbor X fall-over bfd`, Chapter 25), not aggressive timers.

**Authentication** uses a TCP MD5 signature on every segment (RFC 2385):

```
router bgp 65001
 neighbor 10.1.12.2 password BGPs3cr3t
```

A mismatched or missing password means the TCP session never establishes. The session sits in **Active/Idle**, and the log names the cause directly:

```
%TCP-6-BADAUTH: Invalid MD5 digest from 10.1.12.2(179) to 10.1.12.1(34521)
%TCP-6-BADAUTH: No MD5 digest from 10.1.12.2(179) to 10.1.12.1(34521)
```

"Invalid" means the passwords differ. "No digest" means the other side has none configured.

**The summary command** shows everything at a glance:

```
R1# show bgp ipv4 unicast summary
BGP router identifier 1.1.1.1, local AS number 65001
Neighbor     V    AS  MsgRcvd MsgSent  TblVer InQ OutQ Up/Down  State/PfxRcd
2.2.2.2      4 65001     1204    1199      88   0    0 18:22:41       14
10.1.12.2    4 65100       31      29      88   0    0 00:27:10      812
10.1.13.3    4 65200        0       0       1   0    0 never    Active
```

A **number** in State/PfxRcd means Established, and the number is how many prefixes were received. A **word** (Idle, Active) means the session is down.

---

## 28.4 Address Families, MP-BGP and IPv6

Multiprotocol BGP (MP-BGP) carries any **address family** (IPv4 unicast, IPv6 unicast, VPNv4, …) over any session. One TCP session can carry several families, and each neighbor must be **activated** per family.

```
router bgp 65001
 bgp router-id 1.1.1.1
 no bgp default ipv4-unicast                  ! don't auto-activate IPv4 for every neighbor
 neighbor 10.1.12.2 remote-as 65100           ! IPv4 transport session
 neighbor 2001:DB8:12::2 remote-as 65100      ! IPv6 transport session
 !
 address-family ipv4 unicast
  neighbor 10.1.12.2 activate
  network 198.51.100.0 mask 255.255.255.0
 exit-address-family
 !
 address-family ipv6 unicast
  neighbor 2001:DB8:12::2 activate
  network 2001:DB8:100::/48
 exit-address-family
```

**Why use `no bgp default ipv4-unicast`?** By default, IOS activates **every** neighbor for IPv4 unicast, including IPv6-transport neighbors. You end up with IPv4 routes being exchanged over sessions you meant for IPv6 only. Turning the default off makes activation explicit: a neighbor carries exactly the families you `activate`. *It's what you want in any dual-stack design, and if you forget an `activate`, the session comes up but no prefixes are exchanged for that family.*

**Carrying IPv6 prefixes over an IPv4 session works, with one catch.** The next hop has to be an IPv6 address, so IOS builds an **IPv4-mapped** one (`::FFFF:10.1.12.2`). It isn't routable, so the routes show as inaccessible. Either run a native IPv6 session for the IPv6 family (as above, the clean design), or set a real next hop with an outbound route map (`set ipv6 next-hop 2001:DB8:12::1`).

Verify per family: `show bgp ipv6 unicast summary`, `show bgp ipv6 unicast`, and `show bgp all summary`.

**4-byte AS numbers.** ASNs were 16-bit (to 65535) and are now 32-bit. There are two notations for the same number:

| asplain | asdot | Calculation |
|---------|-------|-------------|
| 65546 | 1.10 | 1 × 65536 + 10 |
| 131072 | 2.0 | 2 × 65536 |

`router bgp 65546` and `router bgp 1.10` are the same AS. `bgp asnotation dot` changes only how IOS **displays** it. Older speakers that only understand 2-byte ASNs see **AS 23456** (AS_TRANS) standing in for any 4-byte AS. *If you see 23456 in a path, an old router is somewhere upstream.*

**Private ASNs:** **64512–65534** (2-byte) and **4200000000–4294967294** (4-byte). They're fine inside an organization or between a customer and its ISP, but they must never reach the internet. The ISP (or your edge) strips them:

```
neighbor 203.0.113.1 remove-private-as              ! strip if the path is ALL private ASNs
neighbor 203.0.113.1 remove-private-as all          ! strip private ASNs wherever they appear
neighbor 203.0.113.1 remove-private-as all replace-as   ! replace them with my own AS
```

---

## 28.5 Operations: Refreshing Policy, Synchronization, Peer Groups

**Applying a policy change.** BGP doesn't re-evaluate routes it already holds when you change a route map. You have to make it reprocess them:

| Method | How | Cost |
|--------|-----|------|
| Hard reset | `clear ip bgp 10.1.12.2` | drops the session — **avoid in production** |
| **Route refresh** (default, negotiated capability) | `clear ip bgp 10.1.12.2 soft in` | asks the peer to resend its routes; no session drop, no extra memory |
| Soft reconfiguration inbound | `neighbor X soft-reconfiguration inbound`, then `clear … soft in` | stores an **unfiltered copy** of everything received — memory-heavy |
| Outbound | `clear ip bgp 10.1.12.2 soft out` | re-sends my routes through the new outbound policy |

**Why does `soft-reconfiguration inbound` still exist when route refresh works?** For **troubleshooting**. With it, `show ip bgp neighbors X received-routes` shows exactly what the peer sent **before** your inbound policy filtered it, next to `routes` (what survived the policy). Comparing the two tells you immediately whether a route is missing because the peer never sent it or because your filter dropped it. Without it, `received-routes` isn't available. (`advertised-routes` always works for the outbound direction.)

**Synchronization** was an old rule: *don't use or advertise an iBGP-learned route unless the same prefix is also in the IGP.* It existed for transit ASes whose internal routers didn't all run BGP. It made sure traffic sent across the AS wouldn't reach a non-BGP router that would drop it. Modern designs run BGP on every transit router (or use MPLS), so synchronization is **disabled by default** (since IOS 12.2(8)T) and is deprecated — many current IOS XE releases no longer accept the `synchronization` command at all. *Know what it was and why it's off. Turning it on would also mean redistributing the full BGP table into the IGP.*

**Peer groups and templates** keep large neighbor lists consistent:

```
! Peer group — neighbors share one outbound policy (and one update calculation)
router bgp 65001
 neighbor IBGP peer-group
 neighbor IBGP remote-as 65001
 neighbor IBGP update-source Loopback0
 neighbor IBGP next-hop-self
 neighbor 2.2.2.2 peer-group IBGP
 neighbor 3.3.3.3 peer-group IBGP
```

```
! Peer templates — session and policy separated, inheritable, more flexible
router bgp 65001
 template peer-session IBGP-SESSION
  remote-as 65001
  update-source Loopback0
 exit-peer-session
 template peer-policy IBGP-POLICY
  next-hop-self
  send-community both
 exit-peer-policy
 neighbor 2.2.2.2 inherit peer-session IBGP-SESSION
 address-family ipv4 unicast
  neighbor 2.2.2.2 inherit peer-policy IBGP-POLICY
```

**Why were peer groups originally about CPU, not convenience?** Because a peer group's members are guaranteed to share the **same outbound policy**, so BGP computes the update **once** and copies it to every member. On a route reflector with hundreds of clients, that saves a lot of CPU. Modern IOS builds **update groups** automatically from any neighbors with identical outbound policy, so the CPU benefit no longer depends on peer groups. Templates add flexibility: a neighbor can inherit a session template *and* a policy template, and templates can inherit from each other.

---

## 28.6 Path Preference — the Best-Path Algorithm in Full

BGP picks **one** best path per prefix (unless multipath is on), comparing candidates **one attribute at a time** in a fixed order. The first difference decides:

| Step | Prefer | Scope / default | How you manipulate it |
|------|--------|-----------------|-----------------------|
| 0 | Next hop **reachable** | — | `next-hop-self`, IGP (28.2) |
| 1 | Highest **WEIGHT** | Cisco-only, **this router only**; default 0 (32768 if locally originated) | `neighbor X weight 200` or `set weight` (inbound) |
| 2 | Highest **LOCAL_PREF** | whole AS (iBGP); default **100** | `set local-preference 200` (inbound), `bgp default local-preference` |
| 3 | **Locally originated** | `network`, `aggregate-address`, `redistribute` | originate it yourself |
| 4 | Highest **AIGP** | rarely used; ignored unless configured | — |
| 5 | Shortest **AS_PATH** | `AS_SET` counts as 1 | `set as-path prepend 65001 65001` (outbound); `bgp bestpath as-path ignore` skips this step |
| 6 | Lowest **ORIGIN** | IGP (`i`) < EGP (`e`) < incomplete (`?`) | `set origin igp` |
| 7 | Lowest **MED** | compared only between paths from the **same neighbor AS**; default 0 | `set metric 50` (outbound) |
| 8 | **eBGP over iBGP** | — | — |
| 9 | Lowest **IGP metric to the next hop** | — | IGP costs |
| 10 | (multipath check if `maximum-paths` configured) | — | `maximum-paths 2` (28.11) |
| 11 | **Oldest** eBGP path | stability | — |
| 12 | Lowest **BGP router ID** of the advertiser | (originator ID if reflected) | `bgp router-id` |
| 13 | Shortest **CLUSTER_LIST** | reflected paths | — |
| 14 | Lowest **neighbor address** | — | — |

The numbering and mnemonic are the same as Chapter 7's (7.7): **"N WLLA OMNI"** — **N**ext hop reachable, **W**eight, **L**ocal pref, **L**ocally originated, **A**S path (with AIGP folded in), **O**rigin, **M**ED, **N**eighbor type (eBGP over iBGP), **I**GP metric. After those, the tie-breakers run oldest → router ID → cluster list → neighbor address.

**The direction rule, and the logic that ties it together.** Every attribute either influences **your own outbound traffic** or **asks your neighbors** to send traffic to you a certain way:

| Goal | Tool | Applied |
|------|------|---------|
| Choose which exit **my** traffic uses — this router only | WEIGHT | **inbound** on routes from the preferred peer |
| Choose which exit **my whole AS** uses | LOCAL_PREF | **inbound** at the preferred border router |
| Influence how **other ASes** send traffic **to me** | AS_PATH prepend, MED | **outbound** toward the less-preferred link |

**Why does LOCAL_PREF beat AS_PATH length?** Because BGP is **policy first, distance second**. LOCAL_PREF is *your* decision about your own traffic: "we pay less on ISP-A, so leave through ISP-A". AS_PATH length is only a rough measure of distance, the number of networks the route crosses. An AS's own business policy has to override that, or BGP couldn't express commercial reality. *That's also why weight and LOCAL_PREF come first: they're the attributes you control. Everything after them is information you received.*

**Why is MED compared only between paths from the same neighbor AS?** Because MED values are **set by the neighbor AS to suit its own network**. AS 65100's MED 10 and AS 65200's MED 50 come from different scales with different meanings, so comparing them is meaningless. `bgp always-compare-med` overrides this when you know both neighbors use a consistent scheme (for example, two ISPs that both use IGP cost). Configure it **on every router in the AS**, or the routers will make inconsistent decisions. Related: a path with no MED counts as **0** (the best value), unless `bgp bestpath med missing-as-worst` is set.

### Worked policy: dual-homed to two ISPs

Requirement: all outbound traffic uses ISP-A; inbound traffic should arrive via ISP-A too.

```
route-map FROM-ISPA permit 10
 set local-preference 200             ! my whole AS prefers ISP-A's routes
!
route-map TO-ISPB permit 10
 set as-path prepend 65001 65001 65001  ! make my prefixes look 3 hops farther via ISP-B
!
router bgp 65001
 address-family ipv4 unicast
  neighbor 203.0.113.1 route-map FROM-ISPA in
  neighbor 198.51.100.1 route-map TO-ISPB out
```

Then `clear ip bgp * soft`. Verify outbound with `show ip bgp` (look for `200` in the LocPrf column on ISP-A's paths). For inbound, check from outside, for example on a looking glass, that your prefix shows the prepended path via ISP-B.

```
R1# show ip bgp 8.8.8.0
Paths: (2 available, best #1, table default)
  65100
    203.0.113.1 from 203.0.113.1 (203.0.113.1)
      Origin IGP, metric 0, localpref 200, valid, external, best
  65200 65100
    198.51.100.1 from 198.51.100.1 (198.51.100.1)
      Origin IGP, metric 0, localpref 100, valid, external
```

*To explain why a path won, compare the two entries in the table's order and stop at the first difference. Here it's localpref 200 vs 100, at step 2.*

---

## 28.7 Route Reflectors

A **route reflector (RR)** is the scalable alternative to an iBGP full mesh. Its **clients** peer only with the RR, and the RR is allowed to re-advertise iBGP routes, under rules that preserve loop-freedom.

![Route reflector reflection rules for clients and non-clients](images/c28_route_reflector.png)

```
router bgp 65001
 neighbor 2.2.2.2 remote-as 65001
 neighbor 2.2.2.2 update-source Loopback0
 neighbor 2.2.2.2 route-reflector-client     ! the ONLY extra line — configured on the RR
```

Clients need no special configuration. They peer with the RR as an ordinary iBGP neighbor.

| Route received from | RR reflects it to |
|---------------------|-------------------|
| an **eBGP** peer | all clients and non-clients (normal behavior) |
| a **client** | all **other clients** and all **non-clients** |
| a **non-client** | **clients only** (non-clients must still be fully meshed with each other) |

**Loop prevention: two new attributes.** Reflection removes the iBGP split-horizon protection, so the RR adds two attributes:

- **ORIGINATOR_ID**: the router ID of the router that first put the route into the AS. A router that receives a route carrying its **own** RID as originator drops it.
- **CLUSTER_LIST**: each RR **prepends its cluster ID** (by default its router ID; set with `bgp cluster-id`) as it reflects. An RR that sees its own cluster ID in the list drops the route. It's the iBGP equivalent of AS_PATH loop detection.

**Why does a route from a non-client only go to clients?** Because non-clients are, by definition, still in a full mesh with each other. The non-client that originated the route has already sent it to every other non-client directly, so reflecting it again would only create duplicates. Clients rely entirely on the RR, so they must receive it.

**Exam traps:**

- An RR **doesn't change the next hop** or any other attribute when it reflects. Clients still need a route to the original next hop, so `next-hop-self` belongs on the **border** router.
- An RR only reflects its **best** path. Clients therefore see fewer alternatives than a full mesh would give them, which can make their path choice suboptimal.
- Reflected paths show `Originator: … Cluster list: …` in `show ip bgp <prefix>`. Use that to confirm a route came through the RR.

---

## 28.8 Policies — Filtering and Path Manipulation

Four filter tools can be attached to a neighbor, `in` or `out`:

| Tool | Matches on | Applied with |
|------|------------|--------------|
| **Prefix list** | prefix + length (`ge`/`le`) | `neighbor X prefix-list NAME in|out` |
| **AS-path access list** | AS_PATH via regex | `neighbor X filter-list N in|out` |
| **Route map** | anything (prefix lists, AS-path lists, communities…) — and can **set** attributes | `neighbor X route-map NAME in|out` |
| Distribute list | standard/extended ACL (legacy) | `neighbor X distribute-list N in|out` |

Prefix lists and route-map logic are Chapter 23's subject. What's specific to BGP is the **AS-path regex**:

| Regex | Matches | Typical use |
|-------|---------|-------------|
| `^$` | empty AS_PATH — **routes I originated** | outbound to ISPs: advertise only my own prefixes, **never become transit** |
| `^65100_` | learned directly from AS 65100 (any route that neighbor sent) | |
| `^65100$` | **originated by** AS 65100 and learned directly from it — nothing behind it | accept only the neighbor's own prefixes |
| `_65200$` | **originated** by AS 65200 | |
| `_65300_` | passed **through** AS 65300 anywhere | block a distrusted AS |
| `^[0-9]+$` | exactly one AS — the neighbor's own routes | accept only the peer's customer-free routes |
| `.*` | anything | the final permit-all |

`_` matches any delimiter (a space, the start or end of the string), `^` the start, `$` the end.

```
ip as-path access-list 1 permit ^$
!
router bgp 65001
 address-family ipv4 unicast
  neighbor 203.0.113.1 filter-list 1 out      ! advertise only locally originated routes
```

**Why is `^$` outbound the most important enterprise BGP filter?** Because without it, a dual-homed enterprise re-advertises ISP-A's routes to ISP-B. If ISP-B prefers that path, its traffic toward ISP-A starts flowing **through your network**, over your links, at your cost. That's the classic "accidental transit AS" outage. Allowing out only the paths with an empty AS_PATH, meaning routes you originated, stops it. *Test a regex before you apply it: `show ip bgp regexp ^$` lists exactly what it matches.*

### Communities

A **community** is a 32-bit tag (written `AS:value` after `ip bgp-community new-format`) that groups routes so policy can be applied to the group. Standard communities aren't sent to neighbors unless you configure it:

```
router bgp 65001
 address-family ipv4 unicast
  neighbor 2.2.2.2 send-community             ! standard; "both" adds extended communities
!
route-map TAG-BRANCH permit 10
 set community 65001:100 additive             ! add to existing communities, don't replace
!
ip community-list standard BRANCH permit 65001:100
route-map MATCH-BRANCH permit 10
 match community BRANCH
 set local-preference 150
```

Well-known communities have built-in meanings that every BGP speaker honors:

| Community | Meaning |
|-----------|---------|
| **no-export** | don't advertise outside this AS (or confederation) |
| **no-advertise** | don't advertise to **any** peer, iBGP or eBGP |
| **local-AS** | don't advertise outside this sub-AS within a confederation (= no-export without confederations) |
| internet | advertise normally |

**Exam trap — the forgotten `send-community`.** The route map sets the community correctly, `show ip bgp` on the local router shows it, but the neighbor never sees it, so its policy never matches. The tag is only sent with `send-community` on the **sending** router, under the right address family. Check with `show ip bgp <prefix>` on the receiver. If there's no `Community:` line, the sender didn't send it.

---

## 28.9 BGP in a VRF (VRF-Lite)

VRF-Lite (Chapter 25) can use BGP as a per-VRF routing protocol, for example to peer with a customer or firewall context per VRF. Each VRF gets its own address family under the **one** BGP process:

```
vrf definition CUST_A
 rd 65001:1                                 ! REQUIRED for BGP — even without MPLS
 address-family ipv4
!
router bgp 65001
 address-family ipv4 vrf CUST_A
  neighbor 172.16.1.2 remote-as 65010
  neighbor 172.16.1.2 activate
  redistribute connected
 exit-address-family
```

**Why does BGP demand a route distinguisher when VRF-Lite doesn't otherwise need one?** Because BGP stores every VRF's routes in **one shared BGP table**, internally as VPNv4 routes. If CUST_A and CUST_B both have 10.1.1.0/24, the RD is what keeps them apart: `65001:1:10.1.1.0/24` and `65001:2:10.1.1.0/24`. Without an RD, IOS refuses the address family with *"VRF CUST_A does not have an RD configured"*. Chapter 29 explains RDs fully, since they're the core of MPLS L3VPN.

Verify per VRF:

```
R1# show ip bgp vpnv4 vrf CUST_A summary
R1# show ip bgp vpnv4 vrf CUST_A
R1# show ip route vrf CUST_A bgp
```

---

## 28.10 The BGP Troubleshooting Checklist

**First, the session:**

| Symptom | Cause | Proof |
|---------|-------|-------|
| `Idle` | no route to the neighbor address | `show ip route <neighbor>`; `ping <neighbor> source lo0` |
| `Active` (loopback peering) | missing `update-source` or no route to the loopback | `show ip bgp neighbors X | i Local host` shows the wrong source |
| `Active` (eBGP to a loopback) | TTL 1 — missing `ebgp-multihop` / `disable-connected-check` | `show ip bgp neighbors X | i hop` |
| `Active`, `BADAUTH` log | MD5 password mismatch / missing | `%TCP-6-BADAUTH` |
| `Active`, nothing logged | ACL dropping TCP 179, or peer has no matching `neighbor` | `show access-lists`; check the other side's config |
| Reaches OpenSent, then NOTIFICATION `2/2` | wrong `remote-as` | log shows the AS received |
| `Idle (PfxCt)` | `maximum-prefix` exceeded (28.11) | `show ip bgp neighbors X` shows the reset reason; recover with `clear ip bgp X` |
| `Idle (Admin)` | `neighbor X shutdown` | config |
| Established, 0 prefixes for a family | neighbor not `activate`d in that AF | `show bgp all summary` |

**Then, the routes:**

| Symptom | Cause | Proof |
|---------|-------|-------|
| `network` statement not advertised | no **exact** match (prefix **and** mask) in the RIB | `show ip route <prefix> <mask>` |
| Route present, no `>` (not best), `inaccessible` | next hop unreachable | `show ip bgp <prefix>`; fix with `next-hop-self` (28.2) |
| iBGP route not passed on to another iBGP peer | iBGP split horizon | needs full mesh or RR (28.7) |
| Route best in BGP, flagged `r` | **RIB failure** — a lower-AD source owns the prefix | `show ip bgp rib-failure` |
| Route never arrives at the peer | outbound filter / policy | `show ip bgp neighbors X advertised-routes` |
| Peer says it sent it, I don't have it | inbound filter | `received-routes` vs `routes` (28.5) |
| "Wrong" path chosen | best-path order (28.6) | `show ip bgp <prefix>` — first differing attribute |
| Routes from my other site (same AS) never arrive | AS_PATH loop check drops paths containing my own AS | `debug ip bgp updates` shows the denial; fix with `allowas-in` (CE) or `as-override` (PE) — 28.11 |
| Only one path installed although two look equal | `maximum-paths` not set, or paths differ in an attribute multipath requires | `show ip bgp <prefix>` shows `multipath` only when it works (28.11) |
| Communities ignored downstream | no `send-community` | receiver's `show ip bgp <prefix>` |
| Policy change has no effect | routes not re-evaluated | `clear ip bgp X soft in/out` |

*BGP troubleshooting is always two questions in order: is the session Established, and then is the route sent, received, accepted, and best? Each question has its own command, and the answers are always in the output.*


---

## 28.11 More Knobs the Exam Expects You to Recognise

These don't change how BGP works; each one bends one specific rule. ENARSI questions show them in a config and ask what they do — or show the symptom of the one that's missing.

### Protecting the router: `maximum-prefix`

```
router bgp 65001
 address-family ipv4 unicast
  neighbor 203.0.113.1 maximum-prefix 1000 80 restart 30
  ! 1000 = limit; 80 = warn (syslog) at 80% of it (default threshold is 75%)
  ! restart 30 = after tearing the session down, retry automatically after 30 minutes
```

| Variant | What happens when the limit is exceeded |
|---------|------------------------------------------|
| `maximum-prefix 1000` | Session torn down, state **`Idle (PfxCt)`**, and it **stays down** until you `clear ip bgp 203.0.113.1` |
| `maximum-prefix 1000 restart 30` | Torn down, then re-established automatically after 30 minutes |
| `maximum-prefix 1000 warning-only` | Session stays up; only a syslog message is generated |

**Why tear down a working session over a number?** Because a peer that suddenly sends far more routes than agreed has usually made a mistake — leaking a full internet table, or redistributing an IGP into BGP — and accepting it could exhaust your memory or reroute your traffic. *A dropped session is a contained failure; a router out of memory is not.*

### Same AS at two sites: `allowas-in` and `as-override`

BGP's loop prevention (23.6) drops any path whose AS_PATH already contains the receiver's own AS. That breaks a legitimate design: two branch sites that **share one private AS** (say 65010) connected through a provider AS 64500. Site B receives Site A's prefix with AS_PATH `64500 65010`, sees its own 65010 and silently drops it.

| Fix | Configured on | How it works |
|-----|---------------|--------------|
| `neighbor 192.0.2.1 allowas-in [count]` | the **customer** (CE) router, toward the provider | Accept paths containing my own AS, up to `count` times (1–10; default 3) |
| `neighbor 192.0.2.2 as-override` | the **provider** (PE) router, toward the customer | When advertising to that neighbor, replace every occurrence of the neighbor's AS in the AS_PATH with the provider's own AS, so `64500 65010` becomes `64500 64500` |

*`allowas-in` relaxes the check on the receiver; `as-override` rewrites the path so the check never fires. Both deliberately weaken loop prevention, so use them only where the topology makes a loop impossible.* Chapter 29 shows where this appears in MPLS L3VPNs.

### Sending a default: `neighbor default-originate`

```
router bgp 64500
 address-family ipv4 unicast
  neighbor 198.51.100.2 default-originate                 ! send 0.0.0.0/0 to this peer
  neighbor 198.51.100.3 default-originate route-map HAVE-UPLINK  ! only while the map matches
```

Unlike `network 0.0.0.0` (which needs an exact 0.0.0.0/0 in the RIB) or redistributing a default, `default-originate` sends a default to **that neighbor only** and does **not** require a default route in the local routing table. The optional route map makes it conditional — for example, advertise the default only while the upstream prefix is still present.

### Changing the AS you present: `local-as`

```
router bgp 65001
 neighbor 203.0.113.9 remote-as 64999
 neighbor 203.0.113.9 local-as 65100 no-prepend replace-as
```

The neighbor sees this router as AS **65100** even though its real process is 65001. It's used for **migrations and mergers**: the peer's configuration doesn't have to change on the day you renumber. By default the local-as value is prepended to received paths; `no-prepend` and `replace-as` hide it so the old AS doesn't appear twice. *If a peer expects one AS and the router's `router bgp` number is different, check for `local-as` before declaring a `remote-as` mismatch.*

### Using several paths at once: `maximum-paths`

```
router bgp 65001
 address-family ipv4 unicast
  maximum-paths 2          ! up to 2 equal eBGP paths into the RIB
  maximum-paths ibgp 2     ! up to 2 equal iBGP paths
```

By default BGP installs **one** best path. Multipath only combines paths that tie on everything up to the IGP-metric step — weight, local preference, AS_PATH **length and contents**, origin and MED — and, for eBGP, come from the same neighboring AS. One path is still marked best (`>`); the others show `multipath` in `show ip bgp <prefix>`. (`bgp bestpath as-path multipath-relax` relaxes the "same AS_PATH contents" requirement so paths from different ASes of equal length can be combined.)

### Ignoring AS_PATH length: `bgp bestpath as-path ignore`

This skips step 5 of the best-path algorithm entirely, so paths are compared as if their AS_PATH lengths were equal. It's a hidden command on IOS — it works but isn't listed by `?` — and is rarely appropriate, because it throws away BGP's only distance measure. Recognise it if an exam config uses it to explain why a longer path won.

---

<a name="chapter-29"></a>
# Chapter 29: MPLS & Layer 3 VPNs

> **Blueprint:** ENARSI 2.1 — Describe MPLS operations (LSR, LDP, label switching, LSP); ENARSI 2.2 — Describe MPLS Layer 3 VPN.

Both blueprint items here say **describe**, not configure. You won't build a service-provider core in the exam, but you *will* be shown labels, LFIB entries, route targets and a PE configuration and asked what they mean. So this chapter does what the exam does: it teaches each moving part and then shows you real configuration and `show` output to read. Read the configs as you'd read code someone else wrote.

## 29.1 Why Label Switching Exists

The story usually told is "MPLS was invented because IP lookups were slow." That *was* true in the 1990s — longest-prefix matching against a big table was expensive, and an exact-match lookup on a short fixed label was cheap. Today, with CEF and hardware forwarding, IP lookups are just as fast. **MPLS survived because of what labels let you build, not because of speed.**

**Why is a label more powerful than a destination IP address?** Because a label is **decoupled from the packet's contents**. A router forwarding plain IP can only ask one question: "where does *this destination address* go?" A label-switching router asks "what does *label 18* mean?" — and label 18 can mean anything the network agreed on: "the path to PE2's loopback", "customer A's network 10.2.2.0/24", "the traffic-engineered tunnel through the cheap links". That indirection gives you three things plain IP can't:

| What labels enable | Why plain IP can't do it |
|--------------------|--------------------------|
| **A BGP-free core** — P routers know only the provider's loopbacks, never the internet table or customer routes | An IP router must know the destination to forward; a label router only needs to know the label |
| **L3VPNs** — overlapping customer address spaces (two customers both using 10.0.0.0/8) across one core | The destination 10.1.1.1 is ambiguous; a label is not |
| **Traffic engineering** — steering traffic down a path that isn't the IGP's shortest one | IP forwarding always follows the destination's best route |

*Labels replace "where is this going?" with "which agreed path is this on?" — and that one change is the whole of MPLS.*

## 29.2 The Label Itself

An MPLS label is a **32-bit shim header** inserted **between the Layer 2 header and the IP header** — which is why MPLS is often called "Layer 2.5". Ethernet announces it with EtherType **0x8847** (MPLS unicast) instead of 0x0800 (IPv4).

![The 32-bit MPLS label and where it sits in the frame](images/c29_mpls_label.png)

| Field | Bits | What it does |
|-------|------|--------------|
| **Label** | 20 | The value routers switch on. 0–15 are reserved; Cisco allocates dynamic labels from **16** upward |
| **TC** (Traffic Class, formerly **EXP**) | 3 | QoS marking — copied from IP precedence by default so the core can still honour priority |
| **S** (Bottom of Stack) | 1 | **1** on the last label before the IP header, 0 on every label above it |
| **TTL** | 8 | Loop protection, exactly like IP's TTL — decremented at every label hop |

**Why is there an S bit — why would a packet carry more than one label?** Because a **label stack** lets different parts of the network handle different questions independently. In an L3VPN (29.6), the outer label says "get me to PE2" and the inner label says "and once there, this belongs to customer A". The core only ever reads the top label. The S bit tells the router reading a label whether there's another one underneath or the IP header comes next.

The reserved labels you'll see in output:

| Label | Name | Meaning |
|-------|------|---------|
| **0** | IPv4 explicit null | "Pop me at the last hop, but keep my TC bits until then" |
| **2** | IPv6 explicit null | Same for IPv6 |
| **3** | **Implicit null** | Never appears in a packet. Advertised to say "**pop the label before sending to me**" — PHP (29.4) |

## 29.3 The Cast: LSRs, LERs, PEs, Ps and CEs

| Role | Generic name | Provider name | What it does |
|------|--------------|---------------|--------------|
| Edge router where labels are **added** or **removed** | **LER** (Label Edge Router) | **PE** (Provider Edge) | IP lookup on one side, label imposition/disposition on the other |
| Router in the middle that only **swaps** labels | **LSR** (Label Switch Router) | **P** (Provider) | Label in → label out; never looks at the IP header |
| Customer's router | — | **CE** (Customer Edge) | Runs plain IP; **doesn't know MPLS exists** |

Strictly, every MPLS router is an LSR; "LER" just means one sitting at the edge. The **LSP** (Label Switched Path) is the one-directional sequence of labels a packet follows from ingress LER to egress LER. *One-directional* matters: the return traffic takes a separate LSP, built separately, possibly through different routers.

## 29.4 Push, Swap, Pop — and Penultimate Hop Popping

Every label operation is one of three:

| Operation | Where | What happens |
|-----------|-------|--------------|
| **Push** (impose) | Ingress PE | IP packet arrives; FIB lookup says "send with label 18"; label pushed on |
| **Swap** | P routers | Label 18 in → LFIB says "out Gi0/2 with label 21" |
| **Pop** (dispose) | Penultimate or egress router | Top label removed |

**Penultimate Hop Popping (PHP).** Without it, the egress PE would do two lookups for every packet: a label lookup ("label 21 is mine — pop it") and then an IP or VPN lookup on what's underneath. PHP removes the first one. The egress PE advertises **implicit-null (label 3)** for its own loopback, which tells its upstream neighbour "**don't bother sending me a label for this — pop it for me**". The penultimate router pops instead of swapping, and the egress PE receives a packet it can process with a single lookup.

**Why let the second-to-last router do the egress router's job?** Because the penultimate router is doing a label lookup *anyway* — popping instead of swapping costs it nothing extra. The egress PE, which would otherwise have done a label lookup purely to discover "this one's for me", is spared a lookup on every packet. *The work moves to where it's free.*

In `show mpls forwarding-table`, PHP shows up as **`Pop Label`** (older IOS: `Pop tag`):

```
P2# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
17         16         1.1.1.1/32       1767110       Gi0/1      10.0.23.3
19         Pop Label  3.3.3.3/32       20416         Gi0/1      10.0.23.3   ! P1 is next door
21         Pop Label  4.4.4.4/32       1849302       Gi0/2      10.0.24.4   ! PHP toward PE2
```

Read the last line as: "a packet arriving **with label 21** is destined for 4.4.4.4/32; **pop** the label and send it out Gi0/2 to 10.0.24.4." P2 is the penultimate hop toward PE2, so PE2 asked it (via label 3) to pop. Label 21 is the one P2 advertised to P1 for 4.4.4.4 — the same 21 you'll see in P1's bindings below and in the packet walk (29.11). The middle line is PHP again: P1 owns 3.3.3.3, so it advertised implicit-null and P2 pops. The first line is an ordinary **swap**: label 17 in, label 16 (P1's label for PE1's loopback) out. P2's directly connected subnets have no entries at all — for those, P2 itself is the egress and advertises implicit-null to its neighbours.

> **Exam trap:** `Pop Label` and `No Label` are different. **Pop Label** = "remove the top label" (PHP — normal). **No Label** = "I have no outgoing label for this, so send it as plain IP" — and on a P router in a BGP-free core that's a **broken LSP**, because the next router may not have the IP route.

## 29.5 LDP — How Routers Agree on Labels

Labels are locally significant: each router picks its own label for each prefix and tells its neighbours. **LDP** (Label Distribution Protocol) is how they tell each other.

### Discovery and session

| Step | Transport | Detail |
|------|-----------|--------|
| **1. Discovery** | **UDP 646** hellos to **224.0.0.2** (all routers) | Sent on every interface with `mpls ip`; every 5 s, hold 15 s by default |
| **2. Session** | **TCP 646** | Opened to the neighbour's **transport address** (= its LDP router ID by default); the router with the **higher** LDP ID actively opens it |
| **3. Label exchange** | Over that TCP session | Each router advertises a label binding for every IGP prefix in its table |

**Why must the LDP router ID be reachable — and why is it usually a loopback?** Because the TCP session goes to the transport address, which defaults to the LDP router ID. If R1's LDP ID is 1.1.1.1 but nobody has a route to 1.1.1.1, hellos still arrive (they're link-local multicast) yet the TCP session can never open — LDP sits forever in discovery. That's why you advertise loopbacks into the IGP and pin the ID: `mpls ldp router-id Loopback0 force`.

### LIB versus LFIB

| Table | Contains | Command |
|-------|----------|---------|
| **LIB** (Label Information Base) | **Every** binding: my local label, plus the label **every** neighbour advertised, for each prefix | `show mpls ldp bindings` |
| **LFIB** (Label Forwarding Information Base) | Only the **one** outgoing label from the **IGP's best next hop** | `show mpls forwarding-table` |

```
P1# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 14
        local binding:  label: 18
        remote binding: lsr: 1.1.1.1:0, label: 19
        remote binding: lsr: 2.2.2.2:0, label: 21
```

P1 (LDP ID 3.3.3.3) has two LDP neighbours, PE1 (1.1.1.1) and P2 (2.2.2.2), so it holds two remote bindings — never one from itself. The IGP's next hop to 4.4.4.4 is P2, so the LFIB swaps P1's local 18 for P2's **21**; PE1's label 19 sits unused in the LIB. P1 keeps both remote bindings but the LFIB uses only the one from whichever neighbour the IGP says is the next hop to 4.4.4.4. **Why keep labels you aren't using?** Cisco runs LDP in **liberal retention** mode: if the IGP reconverges and the best next hop changes, the label from the new next hop is already in the LIB, so the LFIB updates instantly instead of waiting for a fresh label request. *The IGP picks the path; LDP just makes sure a label is ready for whichever path it picks.*

### What the configuration looks like

```
mpls label protocol ldp               ! the default on IOS XE; shown for clarity
mpls ldp router-id Loopback0 force    ! stable, reachable LDP ID
!
interface GigabitEthernet0/1
 mpls ip                              ! run LDP + label switching on this core link
!
router ospf 1
 mpls ldp autoconfig area 0           ! alternative: enable LDP on every OSPF area-0 link
```

```
P1# show mpls ldp neighbor
    Peer LDP Ident: 2.2.2.2:0; Local LDP Ident 3.3.3.3:0
        TCP connection: 2.2.2.2.646 - 3.3.3.3.38211
        State: Oper; Msgs sent/rcvd: 41/40; Downstream
        Up time: 00:18:22
        LDP discovery sources:
          GigabitEthernet0/2, Src IP addr: 10.0.23.2
        Addresses bound to peer LDP Ident:
          10.0.23.2       10.0.24.2       2.2.2.2
```

**What's the `:0` after every LDP ID?** An LDP identifier is six bytes: the 4-byte router ID plus a 2-byte **label space** ID. **`:0` means the platform-wide label space** — the router uses one pool of labels for all interfaces, so a label means the same thing whichever interface it arrives on. That's the normal case for Ethernet core links (frame-mode MPLS). A non-zero value indicates a per-interface label space, which you'll essentially never see today.

Note the port pairing: the peer with the **higher LDP ID** (3.3.3.3) used an ephemeral port and connected *to* 646 on 2.2.2.2. The "Addresses bound" list matters too: it's how P1 maps "next hop 10.0.23.2 in my routing table" to "the LDP peer 2.2.2.2 whose labels I should use".

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| No LDP neighbour at all | `mpls ip` missing on one side, or UDP 646 filtered | `show mpls interfaces`, `show mpls ldp discovery` |
| Discovery works, session never forms | LDP router ID not reachable / TCP 646 blocked | `show mpls ldp discovery detail`, `ping` the ID from the transport source |
| `No Label` toward a PE loopback | That prefix is **summarized** in the IGP, or LDP down on the next hop | `show mpls forwarding-table <prefix>`, `show ip route <prefix>` |
| Large packets fail, pings work | Each label adds **4 bytes**; core MTU too small | `ping <pe> size 1500 df-bit`, `show mpls interfaces detail` |

> **Exam trap:** never summarize PE loopbacks in the core IGP. LDP binds labels to **exact prefixes**. If P routers only have 4.4.0.0/16, there's no binding for 4.4.4.4/32, the LSP breaks, and VPN traffic dies even though `ping 4.4.4.4` from a P router works fine.

### LDP–IGP Synchronization

The IGP and LDP converge separately, and the IGP is usually faster. When a core link comes up (or LDP restarts on it), OSPF can start routing over the link **before** LDP has exchanged labels there. Plain IP traffic survives that, but labeled VPN traffic arriving at a router with no outgoing label is sent unlabeled (`No Label`) and dropped by a BGP-free core — a black hole lasting until LDP catches up.

```
router ospf 1
 mpls ldp sync                 ! on every OSPF link where LDP runs
!
P1# show mpls ldp igp sync
```

With synchronization on, OSPF advertises the link with its **maximum metric** until LDP is fully up on it, so traffic keeps using the old path until labels exist on the new one. *The IGP waits for LDP instead of racing ahead of it.* (IS-IS has the equivalent `mpls ldp sync` under its process.)

## 29.6 MPLS Layer 3 VPNs — The Problem

A provider sells "private WAN" service to many customers over one shared core. Two problems:

1. **Customers overlap.** Customer A and Customer B both use 10.1.0.0/16 internally. A single routing table can't hold both.
2. **The core shouldn't care.** The P routers must not carry thousands of customer routes.

MPLS L3VPN solves the first with **VRFs + route distinguishers**, the second with **labels**, and glues it together with **MP-BGP** between PEs.

![MPLS L3VPN — routes travel by MP-BGP, packets travel by a two-label stack](images/c29_l3vpn_walk.png)

## 29.7 VRFs on the PE

Each PE holds a separate **VRF** (a separate routing table and CEF table — see Chapter 12 for VRF basics and Chapter 25 for VRF-Lite) per customer, and each customer-facing interface is placed in its customer's VRF. CEs talk to their own VRF and never see anyone else's routes. P routers have no VRFs at all.

## 29.8 Route Distinguisher vs Route Target — Why Both Exist

This is the single most-asked L3VPN concept. They sound alike and do completely different jobs.

| Aspect | **Route Distinguisher (RD)** | **Route Target (RT)** |
|---|---|---|
| **Is** | A 64-bit value **prepended** to the IPv4 prefix | A BGP **extended community** attached to the route |
| **Job** | Make overlapping prefixes **unique** inside BGP | Control which VRFs **import** the route |
| **Result** | 65000:100:10.1.0.0/16 ≠ 65000:200:10.1.0.0/16 — a **VPNv4** prefix (96 bits) | "Any VRF importing 65000:100 takes this route" |
| **How many per route** | Exactly **one** | **One or many** |
| **Policy?** | None — just a uniqueness tag | All of it |

**Why isn't the RD enough on its own — couldn't the RD also say which VPN a route belongs to?** Because a route can have only *one* RD, yet many real designs need a route to land in *several* VRFs. An **extranet** (Customer A's servers shared with Customer B), a **hub-and-spoke VPN** (spokes import only the hub's routes; the hub imports everyone's) and a **shared-services VRF** all need "this route belongs in VRFs X *and* Y". RTs are a list, so a route can carry several and each VRF picks what it wants. The RD's only job is to stop BGP treating two customers' 10.1.0.0/16 as the same prefix and keeping just one. *The RD makes routes unique; the RT decides where they go.*

> **Exam trap:** the RD and RT are often configured with the **same number** (e.g. both 65000:100). That's a convention, not a requirement — they're unrelated fields. A question showing matching RDs but mismatched RTs is testing whether you know that **only the RTs decide import**.

## 29.9 MP-BGP Between PEs

PEs exchange customer routes as **VPNv4** prefixes over an iBGP session (address family `vpnv4`), each update carrying:

- the **VPNv4 prefix** (RD + IPv4 prefix),
- the **RT** extended communities (so `send-community extended` must be on),
- a **VPN label** chosen by the advertising PE for that prefix,
- a **next hop** of the advertising PE's **loopback** — which must be a /32 with an LSP to it.

The receiving PE checks each route's RTs against every local VRF's `import` list, strips the RD and installs the plain IPv4 prefix into each matching VRF.

## 29.10 The Two-Label Stack

Packets crossing the core carry **two** labels:

| Label | Called | Allocated by | Read by | Means |
|-------|--------|--------------|---------|-------|
| **Outer (top)** | Transport / **LDP** label | LDP, hop by hop | P routers | "Get me to PE2's loopback" |
| **Inner (bottom, S=1)** | **VPN** label | **Egress PE**, advertised in MP-BGP | Egress PE only | "This belongs to VRF CUST_A, prefix 10.2.2.0/24" |

**Why can't one label do both jobs?** Because the two labels answer questions owned by different parts of the network. The transport label must be understood by **every P router**, so it's tied to something every P router knows — the PE loopback, learned through the IGP. The VPN label is meaningful only to **the egress PE**: no P router has the VRF, so it couldn't act on it anyway. Keeping them separate means the core never learns a single customer route, and adding a new customer changes nothing on any P router. *The outer label is the envelope's street address; the inner label is the apartment number only the building's doorman reads.*

## 29.11 End-to-End Packet Walk

Topology: **CE1 → PE1 (1.1.1.1) → P1 → P2 → PE2 (4.4.4.4) → CE2**. CE2's LAN is 10.2.2.0/24 in VRF CUST_A.

**Control plane first (routes and labels):**

1. CE2 advertises 10.2.2.0/24 to PE2 (eBGP, OSPF, static — 29.12).
2. PE2 installs it in VRF CUST_A, assigns VPN label **24**, and sends it to PE1 by MP-BGP as `65000:100:10.2.2.0/24`, RT 65000:100, label 24, next hop 4.4.4.4.
3. PE1 imports it into CUST_A (RT matches) with next hop 4.4.4.4.
4. Independently, LDP has built an LSP to 4.4.4.4: PE2 advertised implicit-null to P2, P2 advertised label 21 to P1, P1 advertised label 18 to PE1.

**Data plane (a packet from CE1 to 10.2.2.10):**

| Hop | Receives | Lookup | Sends |
|-----|----------|--------|-------|
| **CE1** | — | Plain IP route to PE1 | IP packet |
| **PE1** | IP on a CUST_A interface | VRF CUST_A FIB → next hop 4.4.4.4, VPN label 24, LDP label 18 | labels **18, 24** + IP |
| **P1** | Label 18 | LFIB: 18 → swap 21 | labels **21, 24** + IP |
| **P2** | Label 21 | LFIB: 21 → **Pop** (PHP) | label **24** + IP |
| **PE2** | Label 24 | VPN label 24 → VRF CUST_A, out to CE2 | IP packet |
| **CE2** | IP | Plain IP | Delivered |

Notice the VPN label 24 is never touched by P1 or P2. And notice what P1 and P2 *don't* need: any route to 10.2.2.0/24, any VRF, any BGP.

## 29.12 CE–PE Routing Options

| Option | Why choose it | Watch out for |
|--------|---------------|---------------|
| **Static** | Single-homed small site; simplest | No failure detection without IP SLA (32.6) |
| **eBGP** | The most common — scales, policy-rich, PE already speaks BGP | Same customer AS at every site → AS-path loop check drops routes; fix with `as-override` on the PE or `allowas-in` on the CE — both explained in 28.11 |
| **OSPF** | Customer already runs OSPF everywhere | Routes arrive as inter-area (Type 3) or external; 🔬 sham-links and the **down bit** prevent loops and backdoor problems |
| **EIGRP** | Customer runs EIGRP | Multi-homed sites need **Site of Origin (SoO)** to stop routes looping back in |

## 29.13 Reading a PE Configuration

```
vrf definition CUST_A
 rd 65000:100                              ! makes CUST_A prefixes unique as VPNv4
 address-family ipv4
  route-target export 65000:100            ! tag routes leaving this VRF
  route-target import 65000:100            ! accept routes carrying this RT
 exit-address-family
!
interface Loopback0
 ip address 1.1.1.1 255.255.255.255        ! /32: the BGP next hop AND LDP ID
!
interface GigabitEthernet0/1
 description Core link to P1
 ip address 10.0.13.1 255.255.255.0
 mpls ip                                   ! LDP + labels on the core side only
!
interface GigabitEthernet0/2
 description CE1 - Customer A
 vrf forwarding CUST_A                     ! NOTE: wipes the IP address; re-enter it after
 ip address 192.168.1.1 255.255.255.252
!
mpls ldp router-id Loopback0 force
!
router ospf 1                              ! core IGP: carries loopbacks, no customer routes
 router-id 1.1.1.1
 network 1.1.1.1 0.0.0.0 area 0
 network 10.0.13.0 0.0.0.255 area 0
!
router bgp 65000
 bgp router-id 1.1.1.1
 no bgp default ipv4-unicast
 neighbor 4.4.4.4 remote-as 65000          ! iBGP to the other PE (often via route reflector)
 neighbor 4.4.4.4 update-source Loopback0
 !
 address-family vpnv4
  neighbor 4.4.4.4 activate
  neighbor 4.4.4.4 send-community extended ! RTs are extended communities
 exit-address-family
 !
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101     ! eBGP to CE1, inside the VRF
  neighbor 192.168.1.2 activate
 exit-address-family
```

What each block tells you: the **VRF** defines the customer's table and its import/export policy; the **core interface** runs LDP while the **customer interface** doesn't; the **IGP** carries only provider loopbacks and links; **BGP** has two personalities — `vpnv4` to other PEs (customer routes in transit) and `ipv4 vrf` to the CE (customer routes at the edge).

The verification set you should recognise:

| Command | Answers |
|---------|---------|
| `show vrf` / `show ip vrf interfaces` | Which interfaces are in which VRF |
| `show ip route vrf CUST_A` | The customer's table as PE1 sees it (remote routes show next hop 4.4.4.4) |
| `show bgp vpnv4 unicast all` | Every VPNv4 route, grouped by RD |
| `show bgp vpnv4 unicast all labels` | The VPN label in/out for each prefix |
| `show mpls forwarding-table 4.4.4.4 32` | The transport label toward the remote PE |
| `ping vrf CUST_A 10.2.2.10 source Gi0/2` | End-to-end test from inside the VRF |

> 🔬 **Depth: why traceroute through a provider often shows nothing in the middle.** By default the ingress PE copies the IP TTL into the label TTL, so the core hops answer traceroute. Providers commonly configure `no mpls ip propagate-ttl forwarded`, which sets the label TTL to 255 — the core becomes invisible and the customer sees the whole MPLS cloud as a single hop.

---

<a name="chapter-30"></a>
# Chapter 30: DMVPN

> **Blueprint:** ENARSI 2.3 — Configure and verify DMVPN (single hub): 2.3.a GRE/mGRE, 2.3.b NHRP, 2.3.c IPsec, 2.3.d Dynamic neighbor, 2.3.e Spoke-to-spoke.

Chapter 12 built a single GRE tunnel and protected it with IPsec: one tunnel, two routers, both addresses typed in by hand. That's fine for two sites. For fifty branches it falls apart. **DMVPN (Dynamic Multipoint VPN)** is how Cisco connects many branches over the internet with **one tunnel interface per router**, a hub that never needs reconfiguring when a branch is added, and branches that build **direct tunnels to each other on demand**.

## 30.1 The Problem DMVPN Solves

Picture a hub and 50 branches using point-to-point GRE:

| Design | Tunnels on the hub | Branch-to-branch traffic | Adding branch 51 |
|--------|--------------------|--------------------------|------------------|
| Hub-and-spoke p2p GRE | **50** interfaces, 50 configs | Hairpins through the hub (two internet crossings) | Edit the hub |
| Full mesh p2p GRE | 50 on the hub, **49 on every branch** — 1,225 tunnels | Direct | Edit **every** router |
| **DMVPN** | **1** mGRE interface | Direct, built **on demand** | Configure only the new branch |

DMVPN gets there by combining three technologies, each answering one question:

| Piece | Answers |
|-------|---------|
| **mGRE** (multipoint GRE) | "How can one tunnel interface reach many destinations?" |
| **NHRP** (Next Hop Resolution Protocol) | "What's the real internet address behind this tunnel address?" |
| **IPsec** | "How do I keep it private across the internet?" |

Plus a routing protocol running over the tunnel to exchange the sites' LANs.

![DMVPN — one mGRE interface per router, NHRP maps tunnel IPs to internet IPs](images/c30_dmvpn_topology.png)

## 30.2 mGRE — One Interface, Many Destinations

A normal GRE tunnel has `tunnel destination` — exactly one far end. An **mGRE** tunnel (`tunnel mode gre multipoint`) has **no destination at all**. It's a tunnel interface that behaves like a shared LAN: every router's tunnel interface sits in **one subnet** (say 10.0.0.0/24), like hosts on an Ethernet segment.

That immediately raises the question an Ethernet segment answers with ARP: *I want to send to 10.0.0.12 on this tunnel — what outer (internet) address do I put on the GRE packet?* There's no broadcast on the internet to ask with. That's NHRP's job.

Two addresses per router, and you must keep them straight:

| Address | DMVPN term | Example | Lives in |
|---------|-----------|---------|----------|
| The tunnel interface IP | **Tunnel / overlay address** | 10.0.0.11 | The inside of the GRE packet |
| The physical internet-facing IP | **NBMA / underlay address** | 203.0.113.11 | The outer IP header |

## 30.3 NHRP — ARP for the Internet

**NHRP** is a client/server protocol. The **hub** is the **NHS** (Next Hop Server); spokes are **NHCs** (clients).

**Registration.** When a spoke's tunnel comes up it sends an **NHRP Registration Request** to the hub: "I'm 10.0.0.11 and you can reach me at 203.0.113.11." The hub stores that as a **dynamic** mapping. The spoke only needs to know the hub's addresses in advance — configured statically — which is exactly why spokes can be added without touching the hub. Registrations are refreshed at one-third of the holdtime by default (`ip nhrp holdtime`, default 7200 s; commonly lowered to 300–600 so stale entries age out faster). The refresh interval can be set explicitly with `ip nhrp registration timeout <seconds>` on the spoke — useful when you want the hub to notice a returning spoke quickly without shortening how long its mappings live.

**Resolution.** When a spoke needs to reach another spoke's tunnel address, it sends an **NHRP Resolution Request**; the answer (the other spoke's NBMA address) lets it build a direct GRE tunnel. Phase 3 adds **Redirect** messages to trigger this (30.4).

| Command | On | Does |
|---------|----|------|
| `ip nhrp network-id 1` | All | Enables NHRP on the interface. **Locally significant** — it identifies the NHRP domain on *this* router; it doesn't have to match peers (though by convention it does) |
| `ip nhrp authentication KEY` | All | Cleartext string (max 8 chars) that **must match**; NHRP packets with the wrong key are dropped |
| `ip nhrp map multicast dynamic` | Hub | Replicate multicast (routing hellos!) to every spoke that registers |
| `ip nhrp nhs 10.0.0.1` | Spoke | "My NHS is the hub's tunnel IP" |
| `ip nhrp map 10.0.0.1 198.51.100.1` | Spoke | Static mapping: hub tunnel IP → hub NBMA IP |
| `ip nhrp map multicast 198.51.100.1` | Spoke | Send multicast (routing hellos) to the hub |
| `ip nhrp nhs 10.0.0.1 nbma 198.51.100.1 multicast` | Spoke | **Newer one-line form** of the three lines above |
| `ip nhrp redirect` | Hub | Phase 3: tell spokes "there's a better path" |
| `ip nhrp shortcut` | Spoke | Phase 3: accept redirects and install shortcut routes |

**Why does the hub need `ip nhrp map multicast dynamic`?** Because mGRE has no destination, so the router has no idea where to send a multicast packet like an EIGRP hello (224.0.0.10) or OSPF hello (224.0.0.5). This command says "send a copy of every multicast to each spoke that has registered". Without it the hub's hellos go nowhere, and **routing adjacencies never form even though `show dmvpn` looks perfect**. That mismatch — NHRP up, routing down — is the classic DMVPN troubleshooting question.

## 30.4 The Three Phases

"Phase" describes how spoke-to-spoke traffic is handled. ENARSI expects you to compare them and know the routing implications.

| Aspect | **Phase 1** | **Phase 2** | **Phase 3** |
|--------|-------------|-------------|-------------|
| Spoke tunnel type | **p2p GRE** (`tunnel destination` = hub) | mGRE | mGRE |
| Spoke-to-spoke traffic | Always through the hub | **Direct** tunnels | **Direct** tunnels |
| What triggers the direct tunnel | Nothing — never built | The spoke's **routing table**: next hop is the other spoke's tunnel IP | **NHRP Redirect** from the hub |
| Hub may summarize / send only a default | **Yes** | **No** — next hop must be preserved | **Yes** |
| Key NHRP commands | — | — | Hub `ip nhrp redirect`, spokes `ip nhrp shortcut` |
| Scales to | Small | Medium (every spoke needs every route) | **Large** |

**Why can't Phase 2 summarize at the hub?** Because in Phase 2 the *routing table* is what triggers the spoke-to-spoke tunnel. Spoke 1 looks up 10.12.0.0/24, sees next hop **10.0.0.12** (Spoke 2's tunnel address), resolves it with NHRP and goes direct. That only works if the route reached Spoke 1 with **the original next hop intact** — and with **every specific route**. If the hub sent a summary or a default, the next hop would be the hub (10.0.0.1) and Spoke 1 would happily send everything through the hub forever.

**How does Phase 3 get away with summarizing?** It moves the decision from the routing table to NHRP. Spokes may know only "default via hub". The hub notices a packet entering and leaving **the same DMVPN tunnel interface** — a hairpin — and sends the source spoke an **NHRP Redirect**. The spoke then resolves the destination and installs an **NHRP shortcut route** that overrides the routing table for that destination. *Phase 2 asks the routing protocol to know everything; Phase 3 lets the routing protocol be lazy and lets NHRP fix the path when traffic actually flows.*

## 30.5 Spoke-to-Spoke in Phase 3, Step by Step

![Phase 3 — the hub redirects, the spokes resolve each other, traffic goes direct](images/c30_phase3_seq.png)

1. A host behind **Spoke 1** sends to 10.12.0.10 (behind Spoke 2). Spoke 1's route is the hub's summary, so the packet goes **to the hub**.
2. The hub forwards it on to Spoke 2 — out the **same** tunnel it came in on. Seeing that hairpin, the hub sends an **NHRP Redirect** (traffic indication) back to Spoke 1.
3. Spoke 1 sends an **NHRP Resolution Request** for 10.12.0.10. It travels through the hub to Spoke 2.
4. Spoke 2 answers **directly** to Spoke 1 (bringing up IPsec between them first): "10.12.0.0/24 is behind me, NBMA 203.0.113.12."
5. Spoke 1 installs an **NHRP shortcut**: 10.12.0.0/24 via 10.0.0.12. Later packets go spoke-to-spoke. Return traffic triggers the same process in reverse.

On the spoke, the shortcut appears in the routing table with an `H` code and a "next hop override":

```
Spoke1# show ip route nhrp
H     10.12.0.0/24 [250/1] via 10.0.0.12, 00:01:12, Tunnel0
```

Shortcuts age out with the NHRP holdtime when traffic stops — the direct tunnel is genuinely **on demand**.

## 30.6 Securing It: IPsec Profiles

Chapter 12's site-to-site tunnels always **named the peer**: a tunnel destination (and, for a crypto map, a `set peer`) typed in by hand, plus a pre-shared key bound to that peer's address. DMVPN can't name its peers — spokes are discovered dynamically, and spoke-to-spoke peers aren't known until traffic needs them. So DMVPN uses an **IPsec profile** attached to the tunnel interface with `tunnel protection` (the same mechanism Chapter 12 used with a VTI), and authenticates with a **wildcard pre-shared key or certificates** instead of per-peer keys. Whenever GRE needs to reach a new NBMA address, IPsec negotiates with it automatically.

```
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key DMVPN-PSK address 0.0.0.0 0.0.0.0   ! wildcard: any peer may connect
!
crypto ipsec transform-set TS-DMVPN esp-aes 256 esp-sha256-hmac
 mode transport                     ! GRE already adds an outer header; tunnel mode wastes 20 B
!
crypto ipsec profile DMVPN-PROF
 set transform-set TS-DMVPN
!
interface Tunnel0
 tunnel protection ipsec profile DMVPN-PROF
```

**Why transport mode?** GRE already wraps the packet in a new IP header with the NBMA addresses. IPsec tunnel mode would add *another* IP header with the same addresses — 20 bytes of pure duplication. Transport mode encrypts the GRE packet and keeps its outer header. (Tunnel mode still works; it's just less efficient.)

**Spokes behind NAT.** When a spoke sits behind a NAT device, IKE detects it and switches to **NAT-T** (ESP inside UDP 4500). Add `crypto isakmp nat keepalive 20` (IKEv1; IKEv2 has `crypto ikev2 nat keepalive`) so the NAT device's translation for that UDP flow never times out between bursts of traffic. If the underlay interface lives in its own VRF — common when the internet link must be kept out of the global table — that's **front-door VRF (FVRF)**, covered in Chapter 12; on DMVPN it's `tunnel vrf <name>` on the tunnel plus a VRF-aware keyring.

**Why a wildcard pre-shared key?** Because the hub can't list spokes it hasn't met. A wildcard PSK means every spoke shares one secret — acceptable in a lab, and the reason production DMVPN usually uses **IKEv2 with certificates (PKI)** so each router proves its own identity.

## 30.7 Complete Working Configuration (Phase 3, EIGRP)

Hub NBMA 198.51.100.1, Spoke 1 NBMA 203.0.113.11, Spoke 2 NBMA 203.0.113.12. Tunnel subnet 10.0.0.0/24. LANs 10.10.0.0/24 (hub), 10.11.0.0/24, 10.12.0.0/24. The crypto block in 30.6 is on all three routers.

**Hub**

```
interface Tunnel0
 ip address 10.0.0.1 255.255.255.0
 no ip redirects
 ip mtu 1400                          ! leave room for GRE + IPsec overhead
 ip tcp adjust-mss 1360               ! 1400 - 20 (IP) - 20 (TCP)
 ip nhrp authentication NHRPKEY
 ip nhrp network-id 1
 ip nhrp holdtime 300
 ip nhrp map multicast dynamic        ! routing hellos to every registered spoke
 ip nhrp redirect                     ! Phase 3
 no ip split-horizon eigrp 100        ! see 30.8
 ip summary-address eigrp 100 10.0.0.0 255.0.0.0   ! Phase 3 allows summarizing
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint
 tunnel key 100                       ! must match on every router
 tunnel protection ipsec profile DMVPN-PROF
!
router eigrp 100
 network 10.0.0.0 0.0.0.255
 network 10.10.0.0 0.0.0.255
```

**Spoke 1** (Spoke 2 identical except its addresses)

```
interface Tunnel0
 ip address 10.0.0.11 255.255.255.0
 no ip redirects
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp authentication NHRPKEY
 ip nhrp network-id 1
 ip nhrp holdtime 300
 ip nhrp nhs 10.0.0.1 nbma 198.51.100.1 multicast   ! hub: tunnel IP, NBMA IP, send multicast
 ip nhrp shortcut                     ! Phase 3: install shortcut routes
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint
 tunnel key 100
 tunnel protection ipsec profile DMVPN-PROF
!
router eigrp 100
 network 10.0.0.0 0.0.0.255
 network 10.11.0.0 0.0.0.255
!
ip route 0.0.0.0 0.0.0.0 203.0.113.1  ! underlay default to the ISP
```

**Why `ip summary-address` here and not on a spoke?** The 10.0.0.0/8 summary from the hub is what lets each spoke carry one route instead of fifty; that's the scaling win of Phase 3. One thing to check whenever you summarize over a tunnel: the summary must never cover the **NBMA** (underlay) addresses. If the internet-facing addresses also fell inside 10.0.0.0/8, spokes would learn the route to the hub's NBMA address *through the tunnel itself*. That's recursive routing, and the tunnel shuts itself down (30.10).

## 30.8 Routing Protocols Over DMVPN

### EIGRP

Two hub-side defaults get in the way, because the hub has **one** interface facing every spoke:

| Default behaviour | Problem on a DMVPN hub | Fix | Needed in |
|-------------------|------------------------|-----|-----------|
| **Split horizon** — don't advertise a route out the interface it was learned on | Spoke 1's LAN, learned on Tunnel0, is never sent to Spoke 2 — also on Tunnel0 | `no ip split-horizon eigrp 100` on the hub tunnel | Phase 1/2/3 whenever spokes need specific routes from each other (unnecessary only if the hub sends just a summary/default) |
| **Next-hop-self** — EIGRP sets itself as next hop | Spoke 2 sees Spoke 1's LAN via 10.0.0.1, so traffic always hairpins | `no ip next-hop-self eigrp 100` on the hub tunnel | **Phase 2 only** |

Phase 3 leaves next-hop-self **on** — the hub *should* be the next hop until NHRP redirects. 🔬 On named-mode EIGRP the same knobs are `no split-horizon` and `no next-hop-self` under `af-interface Tunnel0`.

### OSPF

OSPF cares about network type, and the default on a tunnel interface is **point-to-point** — which permits **one** neighbour. On an mGRE hub with several spokes, adjacencies flap as each new spoke replaces the last.

| Network type | DR? | Next hop to other spokes | Fits |
|--------------|-----|--------------------------|------|
| **point-to-point** (default) | No | — | **Never on the mGRE hub** (one neighbour max) |
| **broadcast** | Yes — **hub must be DR**; spokes `ip ospf priority 0` | Preserved (the other spoke) | **Phase 2** |
| **point-to-multipoint** | No | Rewritten to the hub | Phase 1 and **Phase 3** |
| **non-broadcast** | Yes | Preserved | Phase 2, but needs `neighbor` statements on the hub |

**Hub and spokes must use the same network type.** The types don't just change DR behaviour; they change the default timers — broadcast and point-to-point use hello 10 s / dead 40 s, while point-to-multipoint and non-broadcast use hello 30 s / dead 120 s. A hub on point-to-multipoint and a spoke on broadcast therefore have mismatched hello/dead intervals and **never form an adjacency**. Even where the timers happen to match (point-to-point vs broadcast), mixing a DR type with a non-DR type gives inconsistent LSAs and missing routes. Pick one type for the whole DMVPN cloud and set it on every tunnel interface.

**Why must the hub be DR in broadcast mode?** Spokes only have adjacencies with the hub (they can't exchange hellos until a spoke-to-spoke tunnel exists, and multicast only flows hub↔spoke). If a spoke became DR, other spokes couldn't reach it to synchronise — the LSDB would fragment. Priority 0 on every spoke guarantees the hub wins.

One OSPF limitation to remember: all DMVPN routers share one area for the tunnel, and OSPF can only summarize at an ABR/ASBR — so OSPF over DMVPN can't give spokes "just a summary" as easily as EIGRP or BGP. That's why large Phase 3 designs favour EIGRP or BGP.

### BGP and dynamic neighbors

A hub configured with one `neighbor` statement per spoke would need editing for every new branch — defeating the point of DMVPN. **BGP dynamic neighbors** fix that: the hub listens for BGP sessions from a whole subnet.

```
router bgp 65000
 neighbor SPOKES peer-group                         ! create the peer group FIRST
 neighbor SPOKES remote-as 65000                    ! iBGP spokes
 bgp listen range 10.0.0.0/24 peer-group SPOKES   ! accept any spoke from the tunnel subnet
 bgp listen limit 200                               ! cap on dynamic peers
 neighbor SPOKES timers 10 30
 !
 address-family ipv4
  neighbor SPOKES activate
  neighbor SPOKES route-reflector-client            ! iBGP: reflect spoke routes to spokes
  network 10.10.0.0 mask 255.255.255.0
 exit-address-family
```

Type it in that order: `bgp listen range … peer-group SPOKES` is rejected if the peer group doesn't exist yet. (In `show running-config`, IOS may display the `bgp listen` lines first — that's display order, not the order you can enter them.)

Spokes configure a normal static `neighbor 10.0.0.1 remote-as 65000`; the **spoke** initiates and the hub accepts because the source falls inside the listen range. Dynamic peers show up in `show ip bgp summary` with an asterisk:

```
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
*10.0.0.11      4 65000      22      25       9    0    0 00:09:41        1
*10.0.0.12      4 65000      21      25       9    0    0 00:09:30        1
* Dynamically created based on a listen range command
```

**Why route-reflector-client?** iBGP's split-horizon rule says a route learned from one iBGP peer isn't passed to another (Chapter 28). The hub must be a route reflector for spokes to learn each other's LANs. A route reflector **doesn't change the next hop**, which suits Phase 2; for Phase 3 you can instead send spokes only a default or summary (`neighbor SPOKES default-originate` plus outbound filtering). With **eBGP** spokes in different ASes, a dynamic peer-group still needs to know which ASes to accept: give the first with `neighbor SPOKES remote-as 65001` and list the rest with `neighbor SPOKES alternate-as 65002 65003`.

## 30.9 Verification

```
Hub# show dmvpn
Legend: Attrb --> S - Static, D - Dynamic, I - Incomplete
        N - NATed, L - Local, X - No Socket
        T1 - Route Installed, T2 - Nexthop-override
        # Ent --> Number of NHRP entries with same NBMA peer

Interface: Tunnel0, IPv4 NHRP Details
Type:Hub, NHRP Peers:2,

 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
     1 203.0.113.11          10.0.0.11    UP 00:14:03     D
     1 203.0.113.12          10.0.0.12    UP 00:13:50     D
```

```
Spoke1# show dmvpn
Interface: Tunnel0, IPv4 NHRP Details
Type:Spoke, NHRP Peers:2,

 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
     1 198.51.100.1           10.0.0.1    UP 00:14:05     S
     2 203.0.113.12          10.0.0.12    UP 00:00:41   DT1
```

How to read them: on the **hub**, every spoke is **D** (dynamic — learned by registration). On the **spoke**, the hub is **S** (static — configured with `nhs`), and Spoke 2 appeared **D** only once traffic flowed: that's a live spoke-to-spoke tunnel, and **T1** says an NHRP shortcut route was installed. The **State** column tells you how far each peer has got, and the states run in the order the layers come up:

| State | Meaning | Look at |
|-------|---------|---------|
| `IKE` | IKE (phase 1) negotiation not yet complete | Underlay reachability, ISAKMP policy, PSK/certificates |
| `IPsec` | IKE done; IPsec (phase 2) SA not yet established | Transform set / IPsec profile mismatch |
| `NHRP` | Crypto is up; NHRP registration or resolution not complete | NHRP authentication string, NHS/NBMA mapping, `ip nhrp network-id` present |
| `UP` | Crypto and NHRP both up | Routing, if traffic still fails |

*If a peer is stuck, the state names the layer that's broken.* (Without `tunnel protection`, the crypto states are skipped.)

| Command | Use it to see |
|---------|---------------|
| `show dmvpn detail` | Per-peer detail including crypto session state |
| `show ip nhrp` | The NHRP cache: tunnel IP → NBMA mappings, static/dynamic, expiry |
| `show ip nhrp nhs detail` | Spoke's view of its hub: registration requests sent/replies received |
| `show crypto isakmp sa` | IKE phase 1 — `QM_IDLE` is healthy; `MM_NO_STATE` means phase 1 failing |
| `show crypto ipsec sa` | IPsec SAs per peer — `#pkts encaps/decaps` should both rise |
| `show ip route nhrp` | Phase 3 shortcut routes (code `H`) |
| `debug nhrp packet` | Registration, resolution and redirect messages as they happen |

## 30.10 Troubleshooting DMVPN

Work **underlay → NHRP → IPsec → routing**, in that order: each layer depends on the one before.

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Spoke never appears on hub | Underlay: no route to hub NBMA, or ACL/ISP blocking **UDP 500/4500 and ESP (IP 50)** | `ping 198.51.100.1 source Gi0/0`, `show crypto isakmp sa` |
| `show dmvpn` state stuck at `IKE` | IKE phase 1 failing: PSK mismatch, ISAKMP policy mismatch, UDP 500/4500 blocked | `show crypto isakmp sa` (`MM_NO_STATE`), `debug crypto isakmp` |
| `show dmvpn` state stuck at `IPsec` | Phase 2 mismatch: transform set or mode in the IPsec profile | `show crypto ipsec sa` (no SAs), `debug crypto ipsec` |
| `show dmvpn` state stuck at `NHRP` | Crypto is fine; NHRP isn't: authentication string mismatch, wrong `nhs`/NBMA mapping | `show ip nhrp nhs detail`, `debug nhrp packet` |
| Registration fails, IPsec up | **NHRP authentication** string mismatch, or wrong NHS/NBMA mapping on the spoke | `show ip nhrp nhs detail` (requests sent, no replies), `debug nhrp packet` |
| Nothing at all over the tunnel; GRE counters rise on one side only | **`tunnel key` mismatch** — GRE packets with the wrong key are silently discarded | `show interface Tunnel0` (key shown), compare configs |
| `show dmvpn` all UP, but **no routing neighbours** | Hub missing `ip nhrp map multicast dynamic`, or spoke missing `multicast` on its NHS/map | `show ip eigrp neighbors`, `show ip nhrp multicast` |
| OSPF adjacencies to spokes keep flapping | Hub tunnel left at OSPF network type **point-to-point** | `show ip ospf interface Tunnel0` |
| OSPF hub and spoke never become neighbours | **Network-type mismatch** (e.g. point-to-multipoint vs broadcast) → hello/dead 30/120 vs 10/40 | `show ip ospf interface Tunnel0` on both — compare type and timers |
| Spokes learn each other's routes but traffic still hairpins (Phase 2) | `no ip next-hop-self eigrp` missing on the hub | `show ip route` on spoke: next hop is 10.0.0.1 |
| Spokes don't learn each other's routes at all | Split horizon still on at the hub; or iBGP hub isn't a route reflector | `show ip eigrp topology`, `show ip bgp neighbors ... advertised-routes` |
| Phase 3: no spoke-to-spoke tunnel ever forms | `ip nhrp redirect` missing on hub or `ip nhrp shortcut` missing on spoke | `show ip nhrp traffic` (no redirects), `show dmvpn` (no D entries on spoke) |
| Pings work, web pages / file copies hang | **MTU**: GRE + IPsec overhead pushes full-size packets past 1500 with DF set | `ping 10.12.0.10 size 1400 df-bit`, check `ip mtu 1400` + `ip tcp adjust-mss 1360` |
| `%TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing` | The route to the **NBMA** address is being learned **through the tunnel** | `show ip route 198.51.100.1` — must point to the physical interface |
| Spoke behind NAT can't build spoke-to-spoke | NAT on underlay; needs NAT-T (UDP 4500) and NHRP sees the post-NAT address | `show dmvpn` attribute **N** (NATed) |
| NATed spoke drops off after idle periods | NAT translation for UDP 4500 timed out | Add `crypto isakmp nat keepalive 20`; `show crypto isakmp sa detail` |

**Why is `ip tcp adjust-mss` needed if `ip mtu` is already set?** `ip mtu 1400` makes the *router* fragment (or drop, if DF is set) anything bigger than 1400 entering the tunnel. Many hosts set DF and rely on Path MTU Discovery — which breaks when an ICMP "fragmentation needed" message is filtered somewhere. `adjust-mss` rewrites the MSS in TCP SYNs passing through, so the two hosts agree on segments small enough to fit **before** the first big packet is ever sent. *`ip mtu` handles the packet that's too big; `adjust-mss` stops TCP from ever making one.* (The TCP mechanics are in CCNA guide 2.7.)

---

<a name="chapter-31"></a>
# Chapter 31: Infrastructure Security: AAA, ACLs, uRPF, CoPP & IPv6 First-Hop Security

> **Blueprint:** ENARSI 3.1 — Troubleshoot device security using IOS AAA (TACACS+, RADIUS, local database); ENARSI 3.2 — Troubleshoot router security features: 3.2.a IPv4 ACLs (standard, extended, time-based), 3.2.b IPv6 traffic filter, 3.2.c uRPF; ENARSI 3.3 — Troubleshoot CoPP (Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF, BGP); ENARSI 3.4 — Describe IPv6 first-hop security (RA guard, DHCP guard, binding table, ND inspection/snooping, source guard).

Chapter 17 taught you to **build** AAA, ACLs and CoPP for ENCOR. ENARSI's verbs are different: almost everything here says **troubleshoot**. That means you need to know how each feature *fails*, what the failure looks like from the outside, and which command proves the cause. Every section ends with that table.

There's a theme running through the whole chapter, and it's worth naming up front: **security features fail closed.** A broken routing protocol usually announces itself. A broken security feature quietly drops something — a login, a routing hello, a neighbour discovery packet — and the symptom shows up somewhere else entirely.

## 31.1 IOS AAA — How Method Lists Really Behave

A **method list** is an ordered list of places to check credentials:

```
aaa authentication login VTY-AUTH group TACACS-GRP local
```

"For logins using the VTY-AUTH list, ask the TACACS-GRP servers first; then the local user database."

The single most important — and most misunderstood — rule:

| Server's answer | What IOS does next |
|-----------------|--------------------|
| **PASS** (accept) | Logs you in |
| **FAIL** (reject — wrong password, unknown user) | **Stops. Login denied.** The next method is **not** tried |
| **ERROR** (no response, timeout, unreachable, can't decrypt) | Tries the **next method** in the list |

**Why doesn't IOS fall back to `local` when the server says "wrong password"?** Because then the fallback would be a security hole: anyone the central server rejects — a fired employee whose account was disabled — could try again against a stale local account. The fallback exists for **availability** (the server is down, so let admins in with the emergency local account), not as a second chance. *Local is the spare key for when the lock is broken, not a second lock you can try when the first one says no.*

That rule produces two of the most common exam scenarios:

1. **"The TACACS server is down and I can't log in."** The list ends with `group TACACS-GRP` and no `local` — no fallback exists. Or `local` is there but **no local username was ever created**, so the fallback has nothing to check.
2. **"My local password works on the console but not on SSH."** The VTY list's first method is answering FAIL (the server is up and rejecting) — so local is never consulted.

### A typical working configuration

```
aaa new-model
!
username admin privilege 15 secret 9 $9$...      ! the emergency local account
!
tacacs server ISE-1
 address ipv4 10.10.10.5
 key 7 0822455D0A16                               ! must match the server exactly
!
aaa group server tacacs+ TACACS-GRP
 server name ISE-1
 ip tacacs source-interface Loopback0             ! the IP the server knows us by
!
aaa authentication login default local            ! console etc.: local only (safe)
aaa authentication login VTY-AUTH group TACACS-GRP local
aaa authorization exec VTY-AUTH group TACACS-GRP local if-authenticated
aaa accounting exec default start-stop group TACACS-GRP
!
line vty 0 15
 login authentication VTY-AUTH
 authorization exec VTY-AUTH
 transport input ssh
```

### Authenticating the `enable` command

Login authentication only gets you to the EXEC prompt. With `aaa new-model`, the **`enable`** command has its own method list:

```
aaa authentication enable default group TACACS-GRP enable
!                                 ^ ask TACACS+ first   ^ fall back to the local enable secret
```

The same PASS/FAIL/ERROR rule applies: if TACACS+ is unreachable (ERROR), the router falls back to the locally configured `enable secret`; if TACACS+ rejects the password (FAIL), you're denied. Two things catch people. First, a list of just `group TACACS-GRP` with no `enable` fallback means a server outage leaves nobody able to reach privileged mode. Second, if the `enable` method is listed but no `enable secret` was ever configured, the fallback has nothing to check. (On the TACACS+ server, enable passwords are a separate setting from the login password, so a user who logs in fine can still be rejected at `enable`.) *A user stuck at the `>` prompt usually has an enable-authentication problem, not a login problem — `debug aaa authentication` shows `ENABLE` as the action.*

RADIUS looks the same with `radius server ISE-1` / `address ipv4 10.10.10.5 auth-port 1812 acct-port 1813` / `key ...`, `aaa group server radius RADIUS-GRP`, and `ip radius source-interface`.

| Protocol | Transport | Encrypts | Separates authN / authZ / accounting | Typical use |
|----------|-----------|----------|---------------------------------------|-------------|
| **TACACS+** | **TCP 49** | The whole payload | **Yes** — per-command authorization possible | Device administration |
| **RADIUS** | **UDP 1812/1813** (legacy 1645/1646) | Only the password | No — authN and authZ combined | Network access (802.1X, VPN) |

**Why does `aaa new-model` lock people out?** The moment you enter it, every line that doesn't name a list uses the **default** list — and if there is no default list, IOS uses **local** authentication on every such line, console and VTYs alike (see 17.3). The VTYs are where it bites. If you had `line vty` with `password cisco` and no local usernames, you've just made remote login impossible. **Always create a local privileged user *before* `aaa new-model`**, and keep a console session open while you test.

### Authorization — logged in, but at the wrong level

Authentication says *who* you are; **exec authorization** gives you your privilege level. A classic symptom: TACACS+ login succeeds, but you land at `Router>` instead of `Router#`. The server authenticated you, but either `aaa authorization exec` isn't configured (so IOS never asks for your privilege level) or the server's profile doesn't return `priv-lvl=15`. Note that **console** lines aren't subject to exec authorization unless you also configure `aaa authorization console`.

> **Exam trap:** `aaa authorization commands 15 default group TACACS-GRP` with **no `local` or `if-authenticated` fallback** means that if the server goes down, every privileged command you type is refused — *including* the commands to fix it.

### The troubleshooting toolkit

```
R1# test aaa group TACACS-GRP admin Str0ngPass legacy
Sending password
User successfully authenticated
```

`test aaa` exercises the server **without risking a login** — the first thing to run. (`legacy` is the older output format; RADIUS tests typically use `new-code`.)

```
R1# debug aaa authentication
R1# debug tacacs
AAA/AUTHEN/LOGIN (00000041): Pick method list 'VTY-AUTH'
TPLUS: Queuing AAA Authentication request 65 for processing
TPLUS(00000041)/0/NB_WAIT: socket event 2
TPLUS: Received authen response status GET_PASSWORD (8)
TPLUS: Received authen response status FAIL (2)          ! the server REJECTED -> stop
AAA/AUTHEN (00000041): status = FAIL
```

That `FAIL` is the server's verdict, so local isn't tried. Compare with an unreachable server:

```
TPLUS(00000042)/0/NB_WAIT: timed out                      ! no answer -> ERROR
AAA/AUTHEN/LOGIN (00000042): Method=LOCAL                 ! fell back to local
```

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Every login times out, then local works | Server unreachable: routing, ACL, or **TCP 49 / UDP 1812** blocked | `test aaa group ...`, `show tacacs` / `show aaa servers` (state DEAD, timeouts) |
| Server logs "unknown device" / no record of the request | Router sourcing from the wrong IP — the server only trusts registered device IPs | `debug tacacs` shows source; fix `ip tacacs source-interface` |
| TACACS+: "invalid packet" / decryption errors; RADIUS: server drops silently | **Shared key mismatch** | Server logs; `show aaa servers` failed counts; re-enter key on both |
| Correct password rejected, local password also rejected | Server is answering **FAIL** (account/policy), so local never tried | `debug aaa authentication` shows `status = FAIL` |
| Server down and nobody can log in | No `local` fallback, or no local user exists | `show running-config | include aaa authentication|username` |
| Logs in at `>` instead of `#` | No `aaa authorization exec`, or server not returning priv-lvl 15 | `debug aaa authorization`, `show privilege` |
| Configuration commands refused | Command authorization with dead server and no fallback | `debug aaa authorization` (`FAIL`/`ERROR` per command) |
| Console locked out too | `default` list used on console points to server only | Console list should be local; `line con 0` → `login authentication` |

## 31.2 IPv4 ACLs — Standard, Extended and Time-Based

You've built ACLs since CCNA (CCNA guide Ch 19) and Chapter 17 reviewed them. ENARSI asks you to troubleshoot them. Almost every ACL fault is one of six things:

| Fault | Example | Proof |
|-------|---------|-------|
| **Order** — a broader line above a specific one | `deny ip 10.1.0.0 0.0.255.255 any` above `permit tcp host 10.1.1.5 ...` | `show access-lists`: the specific line's counter stays 0 |
| **Implicit deny** catches traffic you forgot | Routing hellos, DHCP, ICMP unreachable | Add `deny ip any any log` temporarily and watch the log |
| **Wrong direction** | Filtering `in` on the wrong interface | `show ip interface Gi0/1 | include access list` |
| **Wrong wildcard** | `10.1.1.0 0.0.0.255` written as `10.1.1.0 255.255.255.0` | `show access-lists` — IOS shows what it stored |
| **Wrong protocol / port side** | `eq 80` on the **source** port of a client request | Think through one packet's actual header |
| **Outbound ACLs don't see router-originated traffic** | A ping *from* the router passes an outbound ACL that denies it | Test from a host behind the router instead |

**Why do inbound ACLs so often break routing protocols?** Because the implicit `deny ip any any` doesn't distinguish user traffic from control traffic. An inbound extended ACL on a WAN link that permits only "the business traffic" also drops **OSPF (IP protocol 89)**, **EIGRP (88)**, **BGP (TCP 179)**, **BFD (UDP 3784/3785)**, and HSRP hellos. The adjacency drops after the dead timer — and it looks like a routing problem. Every inbound ACL on a routed link should explicitly permit the control protocols that link carries.

### Time-based ACLs

A **time range** makes ACL entries active only at certain times:

```
time-range BUSINESS-HOURS
 periodic weekdays 8:00 to 18:00             ! recurring
time-range CONTRACTOR-ACCESS
 absolute start 00:00 01 November 2026 end 23:59 31 December 2026   ! one-off window
!
ip access-list extended GUEST-IN
 10 permit tcp 10.50.0.0 0.0.0.255 any eq 443 time-range BUSINESS-HOURS
 20 permit udp 10.50.0.0 0.0.0.255 any eq domain
 30 deny   ip 10.50.0.0 0.0.0.255 any log
```

```
R1# show time-range
time-range entry: BUSINESS-HOURS (inactive)
   periodic weekdays 8:00 to 18:00
   used in: IP ACL entry
R1# show access-lists GUEST-IN
Extended IP access list GUEST-IN
    10 permit tcp 10.50.0.0 0.0.0.255 any eq 443 time-range BUSINESS-HOURS (inactive)
```

**Why is a time-based ACL really an NTP problem?** Because the router judges "is it 9 a.m. on a weekday?" against **its own clock**. A router that rebooted without NTP may believe it's 00:00 on 1 March 1993 — every `periodic weekdays` entry is wrong, and every `absolute` window is either not yet started or long over. When a time-based ACL "randomly" blocks things, the first commands are `show clock` and `show ntp status` (NTP in Chapter 8). Remember too that `periodic` times are in the router's **configured time zone**.

## 31.3 IPv6 Traffic Filters

IPv6 ACLs are always **named**, use **prefix lengths** instead of wildcards, and are applied with **`ipv6 traffic-filter`** rather than `ip access-group`:

```
ipv6 access-list V6-EDGE-IN
 permit tcp any host 2001:DB8:10::80 eq 443
 permit icmp any any echo-request
 deny ipv6 any any log
!
interface GigabitEthernet0/0
 ipv6 traffic-filter V6-EDGE-IN in
```

The trap is at the bottom. Every IPv6 ACL ends with **three** implicit lines, not one:

```
 permit icmp any any nd-na        ! implicit
 permit icmp any any nd-ns        ! implicit
 deny ipv6 any any                ! implicit
```

**Why does IPv6 implicitly permit Neighbor Discovery?** Because ND is IPv6's ARP (CCNA guide 13.8). In IPv4, ARP isn't IP, so an IP ACL can't block it. In IPv6, neighbour solicitations and advertisements **are** ICMPv6 packets, so a plain implicit deny would block address resolution and every neighbour on the link would become unreachable. The implicit permits keep ND alive.

**And why does the ACL above break the link anyway?** Because it ends with an **explicit** `deny ipv6 any any log`. The explicit deny matches first, so the implicit ND permits underneath it are never reached. Neighbour entries go stale, then fail — and the interface "mysteriously" stops forwarding a few minutes after the ACL is applied. Whenever you write your own final deny, add the ND permits **above** it yourself:

```
ipv6 access-list V6-EDGE-IN
 permit icmp any any nd-na
 permit icmp any any nd-ns
 permit icmp any any router-advertisement   ! if this side must learn a router via RA
 permit tcp any host 2001:DB8:10::80 eq 443
 deny ipv6 any any log
```

Note what the implicit lines **don't** include: router solicitations/advertisements. An inbound filter on a host-facing or ISP-facing interface that relies on SLAAC or RA-learned default routes must permit them explicitly.

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Link works for minutes, then IPv6 neighbours fail | Explicit `deny ipv6 any any` blocking NS/NA | `show ipv6 access-list` (deny counter rising), `show ipv6 neighbors` (INCMP/STALE) |
| Router loses its IPv6 default route | RAs denied inbound | `show ipv6 route ::/0`, `show ipv6 routers` |
| OSPFv3 / EIGRP for IPv6 neighbour down | Link-local multicast routing traffic denied (OSPFv3 = IP proto 89 to FF02::5/6) | `show ipv6 access-list` counters |
| ACL applied but nothing filtered | Applied with `ip access-group` (wrong family) or wrong direction | `show ipv6 interface Gi0/0 | include access list` |

## 31.4 Unicast Reverse Path Forwarding (uRPF)

Attackers spoof source addresses so their traffic can't be traced, and so replies (in reflection attacks) hit a victim. **uRPF** drops packets whose **source** address doesn't make sense, by checking the source against the FIB. It needs **CEF** (on by default).

| Mode | Command | A packet passes if… | Use where |
|------|---------|---------------------|-----------|
| **Strict** | `ip verify unicast source reachable-via rx` | The best route back to the source points **out the interface the packet arrived on** | Single-homed edges — customer-facing links, access layer |
| **Loose** | `ip verify unicast source reachable-via any` | **Any** route to the source exists (not via Null0) | Multihomed / asymmetric edges — internet links |
| **VRF-aware** 🔬 | uRPF on an interface in a VRF checks **that VRF's** FIB; `ip verify unicast vrf NAME permit` (or `deny`) checks the source against another VRF | Provider edges, remote-triggered blackholing per VRF |

Options worth knowing:

- **`allow-default`** — let the default route satisfy the check. Without it, a source matched only by `0.0.0.0/0` **fails** (otherwise loose mode would pass everything on a router with a default route, making it useless).
- **`allow-self-ping`** — let the router ping itself (off by default).
- **An ACL number** at the end — `... reachable-via rx 120` — is consulted for packets that **fail** the check: `permit` forwards them anyway, `deny` drops them; with `log`, you see who's failing.

**Why does strict mode break on asymmetric routing?** Because it assumes the path *to* a source is the path *from* it. Picture a site dual-homed to two ISPs: traffic from 198.51.100.7 arrives on ISP-B's link, but your best route to 198.51.100.7 is via ISP-A. Strict uRPF on the ISP-B interface says "if this were genuine, it would have come in on ISP-A" — and drops perfectly legitimate traffic. That's why strict mode belongs on single-homed links and **loose** mode on multihomed ones.

```
R1# show ip interface Gi0/1 | include verify|drops
  IP verify source reachable-via RX, allow default
   173 verification drops
   0 suppressed verification drops
R1# show ip traffic | include RPF
        0 no route, 173 unicast RPF, 0 forced drop
```

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Legitimate traffic from some sources dropped on a multihomed edge | **Strict** mode with asymmetric routing | `show ip interface ... verification drops`, `show ip route <source>` (best path is a different interface) |
| Loose mode drops nothing — even spoofed bogons | `allow-default` configured with a default route present | `show run interface` |
| Everything from a branch dropped after a routing change | Route to the branch's subnet moved to a different interface (strict) | `show ip cef <source>` |
| uRPF command accepted but no drops ever | CEF disabled | `show ip cef summary` |

## 31.5 Control Plane Policing (CoPP) — Troubleshooting

Chapter 17 built CoPP: classify traffic **destined to the router itself** (management, routing, ICMP), police each class, attach the policy to `control-plane`. ENARSI lists the protocols explicitly — Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF, BGP — so you must be able to match each one correctly.

![CoPP — only traffic addressed to the router meets the policers](images/c31_copp.png)


| Protocol | Match | Easy mistake |
|----------|-------|--------------|
| Telnet | `tcp ... eq telnet` (23) | — |
| SSH | `tcp ... eq 22` | — |
| HTTP / HTTPS | `tcp ... eq www` / `eq 443` | Forgetting 443 when RESTCONF/GUI uses HTTPS |
| SNMP | `udp ... eq snmp` (161) | Using `tcp`, or matching 162 (traps go *from* the router) |
| EIGRP | `permit eigrp any any` (IP protocol **88**) | Matching a port — EIGRP has none |
| OSPF | `permit ospf any any` (IP protocol **89**) | Same |
| BGP | `tcp any any eq bgp` **and** `tcp any eq bgp any` (179) | Matching only one direction — see below |

**Why does BGP need two lines?** A BGP session is one TCP connection; one side connects *to* port 179 from a random port, and the other side's packets come back *from* port 179 to that random port. If the neighbour opened the session, its packets arrive with **destination** 179. If *you* opened it, they arrive with **source** 179. Match only `eq bgp` as the destination and your router polices or drops half of all sessions — which half depends on who happened to connect first, so BGP fails "randomly" after a reset.

```
ip access-list extended COPP-ROUTING
 permit ospf any any
 permit eigrp any any
 permit tcp any any eq bgp
 permit tcp any eq bgp any
ip access-list extended COPP-MGMT
 permit tcp 10.99.0.0 0.0.0.255 any eq 22
 permit tcp 10.99.0.0 0.0.0.255 any eq telnet
 permit tcp 10.99.0.0 0.0.0.255 any eq www
 permit tcp 10.99.0.0 0.0.0.255 any eq 443
 permit udp 10.99.0.0 0.0.0.255 any eq snmp
ip access-list extended COPP-ICMP
 permit icmp any any
!
class-map match-all CM-ROUTING
 match access-group name COPP-ROUTING
class-map match-all CM-MGMT
 match access-group name COPP-MGMT
class-map match-all CM-ICMP
 match access-group name COPP-ICMP
!
policy-map PM-COPP
 class CM-ROUTING
  police 512000 conform-action transmit exceed-action transmit   ! never drop routing
 class CM-MGMT
  police 256000 conform-action transmit exceed-action drop
 class CM-ICMP
  police 64000 conform-action transmit exceed-action drop
 class class-default
  police 64000 conform-action transmit exceed-action drop
!
control-plane
 service-policy input PM-COPP
```

Two rules for reading a CoPP ACL:

1. **`deny` in a classification ACL doesn't drop anything.** It means "this packet doesn't belong in this class" — the packet moves on to the next class. Only the **policer's actions** drop.
2. **Classes are checked top to bottom, first match wins**, and anything unmatched lands in **`class-default`**. That's where surprises live: NTP, BFD, HSRP/VRRP, DHCP relay replies, LDP, IP SLA responses — anything you didn't classify — share class-default's (usually small) rate.

```
R1# show policy-map control-plane
 Control Plane
  Service-policy input: PM-COPP
    Class-map: CM-MGMT (match-all)
      2380 packets, 301922 bytes
      5 minute offered rate 3000 bps, drop rate 0000 bps
      Match: access-group name COPP-MGMT
      police:
          cir 256000 bps, bc 8000 bytes
        conformed 2380 packets, 301922 bytes; actions: transmit
        exceeded 0 packets, 0 bytes; actions: drop
    Class-map: class-default (match-any)
      9113 packets, 812540 bytes
      5 minute offered rate 9000 bps, drop rate 2000 bps
        exceeded 1408 packets, 129536 bytes; actions: drop     ! something is being dropped
```

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| SSH to router slow or refused; works from some hosts | Source subnet not in the MGMT ACL → class-default policer drops | `show policy-map control-plane` (class-default exceeded rising) |
| BGP sessions fail after a reset, randomly | Only one BGP direction classified | `show access-lists COPP-ROUTING` (one line counting, other 0) |
| OSPF/EIGRP neighbours flap under load | Routing in a class with `exceed-action drop` and too low a rate | `exceeded` counter in that class |
| BFD / HSRP / NTP flapping | Not classified → starved in class-default | Add a class; watch class-default drops fall |
| SNMP polls time out, CPU is fine | SNMP matched as TCP, or policed hard | `show access-lists`, `show snmp` (packets input not rising) |
| Policy configured, nothing counted | `service-policy` not attached to `control-plane`, or attached `output` | `show run | section control-plane` |

> On **Catalyst 9000** switches CoPP isn't user-built in the same way: they ship with a fixed system policy (`system-cpp-policy`) whose class rates you tune. `show policy-map control-plane` still shows the counters.

## 31.6 IPv6 First-Hop Security

IPv6 hosts trust what they hear on the local link: whoever sends a **Router Advertisement** becomes a default gateway; whoever answers a **Neighbor Solicitation** owns that address. ENARSI only asks you to **describe** the protections, so focus on matching each feature to the attack it stops.

| Attack | How it works | Feature that stops it |
|--------|--------------|-----------------------|
| **Rogue RA** | A host sends RAs: hosts adopt it as default gateway (man-in-the-middle), or a fake prefix, or router lifetime 0 (kills the real gateway) | **RA Guard** |
| **Rogue DHCPv6 server** | A host answers DHCPv6 with its own DNS server or addresses | **DHCPv6 Guard** |
| **ND spoofing** | A forged Neighbor Advertisement claims another host's IPv6 address — IPv6's ARP poisoning | **ND Inspection / snooping** (validated against the **binding table**) |
| **Source address spoofing** | A host sends traffic using an address it doesn't own | **IPv6 Source Guard** (uses the binding table) |
| **DAD denial of service** | A host answers every Duplicate Address Detection probe, so no one can claim an address | ND inspection with the binding table |

How the pieces fit:

- **RA Guard** — on host-facing ports, **drop RAs and ICMPv6 redirects**. Only ports facing real routers (`device-role router`) may send them. *The IPv6 version of "only trusted ports may speak for the gateway".*
- **DHCPv6 Guard** — on host-facing ports (`device-role client`), drop DHCPv6 **server** messages (Advertise, Reply). The IPv6 equivalent of DHCP snooping's trusted/untrusted ports (CCNA guide 18.3).
- **Binding table** — the foundation. The switch **snoops** ND and DHCPv6 to build a table of **IPv6 address ↔ MAC ↔ port ↔ VLAN** — the IPv6 version of the DHCP snooping binding table. On IOS XE this is **SISF device-tracking** (`show device-tracking database`).
- **ND Inspection / ND snooping** — checks NS/NA messages against the binding table and drops ones that claim an address owned by someone else.
- **IPv6 Source Guard** — drops **data** traffic whose source address isn't in the binding table for that port — the IPv6 counterpart of IPv4 IP Source Guard.

What the policies look like (for recognition):

```
ipv6 nd raguard policy HOST-PORTS
 device-role host                     ! RAs from these ports are dropped
!
ipv6 dhcp guard policy DHCP-CLIENTS
 device-role client                   ! DHCPv6 server replies from these ports are dropped
!
device-tracking policy TRACK-HOSTS    ! builds the binding table (SISF)
 tracking enable
!
interface range GigabitEthernet1/0/1 - 46
 ipv6 nd raguard attach-policy HOST-PORTS
 ipv6 dhcp guard attach-policy DHCP-CLIENTS
 device-tracking attach-policy TRACK-HOSTS
```

ND inspection and Source Guard follow the same policy-and-attach pattern. On releases that still offer the classic commands:

```
ipv6 nd inspection policy ND-HOSTS
 device-role host                     ! validate NS/NA from these ports against the table
!
ipv6 source-guard policy SG-HOSTS     ! data packets must come from a bound address
!
interface range GigabitEthernet1/0/1 - 46
 ipv6 nd inspection attach-policy ND-HOSTS
 ipv6 source-guard attach-policy SG-HOSTS
```

Newer SISF-based IOS XE releases fold ND inspection into the device-tracking policy itself (for example `security-level guard`, which drops ND messages that conflict with the binding table) rather than a separate `ipv6 nd inspection` policy. Either way the dependency is the same: Source Guard and ND inspection are only as good as the binding table beneath them, so the device-tracking/snooping policy must be attached to the same ports.

**Why does almost every feature depend on the binding table?** Because "is this message lying?" can only be answered if the switch already knows the truth. RA Guard and DHCPv6 Guard are simple port-role rules; but deciding that an NA for 2001:db8::5 is forged, or that a data packet's source is spoofed, requires a record of which port actually owns 2001:db8::5. *First build the truth (binding table), then police against it (ND inspection, source guard).*

> **Exam trap:** RA Guard has a known weakness — an attacker can hide the RA behind **IPv6 extension headers** or fragments so a simple inspection never sees it. Modern implementations drop such packets; know that the evasion exists.

---

<a name="chapter-32"></a>
# Chapter 32: Infrastructure Services: Management, SNMP, Logging, DHCP, IP SLA, NetFlow & Assurance

> **Blueprint:** ENARSI 4.1 — Troubleshoot device management: 4.1.a console and VTY, 4.1.b Telnet, HTTP, HTTPS, SSH, SCP, 4.1.c (T)FTP; ENARSI 4.2 — Troubleshoot SNMP (v2c, v3); ENARSI 4.3 — Troubleshoot network problems using logging (local, syslog, debugs, conditional debugs, timestamps); ENARSI 4.4 — Troubleshoot IPv4 and IPv6 DHCP (client, IOS DHCP server, relay, options); ENARSI 4.5 — Troubleshoot network performance issues using IP SLA (jitter, tracking objects, delay, connectivity); ENARSI 4.6 — Troubleshoot NetFlow (v5, v9, Flexible NetFlow); ENARSI 4.7 — Troubleshoot network problems using Cisco DNA Center (Catalyst Center) Assurance.

This is the **25%** domain of ENARSI — a quarter of the exam — and it's made of services you've met before: SSH (CCNA), SNMP, syslog, DHCP (CCNA Ch 17), NetFlow and IP SLA (Chapter 15), Catalyst Center (Chapter 16). What's new is the angle. ENARSI hands you a broken service and asks **why**. So each section here is short on "how to build it" (you have that) and long on "how it breaks and how you prove it".

## 32.1 Device Management Access

### Console and VTY lines

Every way into a router lands on a **line**: the console (`line con 0`) or a virtual terminal (`line vty 0 15` on most IOS XE platforms; `0 4` on older ones). Each line has its own login method, timeout, allowed protocols and access list.

```
aaa new-model
username admin privilege 15 secret 9 $9$...    ! local fallback account
aaa authentication login CONSOLE local         ! console: local only, works with servers down
aaa authentication login VTY-AUTH group TACACS-GRP local    ! VTYs: as in 31.1
!
line con 0
 exec-timeout 10 0
 logging synchronous                   ! log messages don't overwrite what you're typing
 login authentication CONSOLE          ! the local-only list defined above
line vty 0 15
 exec-timeout 15 0
 access-class MGMT-HOSTS in            ! who may connect TO the router
 transport input ssh                   ! which protocols may connect
 login authentication VTY-AUTH
```

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| `% Connection refused by remote host` | Protocol not in `transport input` (e.g. Telnet when only SSH allowed) | `show run | section line vty` |
| Connection refused only from some hosts | `access-class` doesn't permit that source | `show access-lists MGMT-HOSTS` (deny counter rises) |
| Connects, then immediately closed: "Password required, but none set" | `login` with no `password` on the line (no AAA) | `show run | section line vty` |
| Worked, now new sessions are refused | All VTY lines in use (stuck sessions) | `show users`, then `clear line vty N` |
| Sessions drop after idle minutes | `exec-timeout` (default 10 min) | `show line vty 0` |

> **Exam trap:** `access-class` on a VTY line filters connections **to** the router (`in`) — or, with `out`, connections the router *initiates* from that line. It's not `access-group`, and applying a standard ACL as `ip access-group` on an interface to "protect SSH" also filters all transit traffic.

### Telnet versus SSH

Telnet (TCP 23) sends everything — including passwords — in clear text. SSH (TCP 22) encrypts the session. SSH needs four things in place, and a missing one is the usual fault:

```
hostname R1                            ! 1. a hostname other than "Router"
ip domain name example.com             ! 2. a domain name (the RSA key is named host.domain)
crypto key generate rsa modulus 2048   ! 3. an RSA key pair
ip ssh version 2
username admin privilege 15 secret ... ! 4. something to authenticate against
line vty 0 15
 transport input ssh
 login local                           ! or an AAA list
```

```
R1# show ip ssh
SSH Enabled - version 2.0
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3
```

**Why does SSH need a domain name?** Because IOS names the RSA key pair after the router's fully qualified name — `R1.example.com`. Without a hostname and domain, `crypto key generate rsa` refuses to run, and without a key SSH is simply disabled (`show ip ssh` → "SSH Disabled"). Key size matters too: SSH version 2 needs a modulus of at least **768** bits, and modern clients reject anything under **2048**.

| Symptom | Likely cause | Proof |
|---------|--------------|-------|
| SSH refused; Telnet works | No RSA key (missing hostname/domain), or `transport input telnet` only | `show ip ssh`, `show crypto key mypubkey rsa` |
| Client: "no matching key exchange / host key" | Key too small or old algorithms | `show ip ssh`; regenerate with `modulus 2048` or larger |
| Prompts for password, always rejected | Authentication method/list issue | `debug ip ssh`, `debug aaa authentication` |

### HTTP and HTTPS

The web server serves the device GUI (WebUI) and **RESTCONF** (Chapter 20).

```
no ip http server                      ! disable clear-text HTTP
ip http secure-server                  ! HTTPS (TCP 443) — needed by RESTCONF
ip http authentication local           ! or: aaa
ip http access-class ipv4 MGMT-HOSTS   ! restrict who may connect
```

Common faults: HTTPS server not enabled (RESTCONF fails to connect); `ip http authentication` left at the default **enable** method so users are prompted for the enable password; users below privilege 15 getting read-only or refused; the access-class excluding the client.

### SCP, TFTP and FTP — moving files

| Protocol | Transport | Authentication | Encrypted | Typical failure |
|----------|-----------|----------------|-----------|-----------------|
| **TFTP** | **UDP 69** | **None** | No | Wrong source IP; server directory/permissions; file size (older servers cap at **32 MB**) |
| **FTP** | **TCP 21** (+ data channel) | Username/password | No | Credentials; active/passive data channel blocked by a firewall |
| **SCP** | **TCP 22** (runs over SSH) | SSH user | **Yes** | SCP server not enabled; user lacks exec authorization at privilege 15 |

```
ip tftp source-interface Loopback0      ! the IP the TFTP server sees
ip ftp source-interface Loopback0
ip ftp username backup
ip ftp password 7 ...
!
R1# copy running-config tftp://10.1.1.50/R1-confg
R1# copy flash:c8000v-universalk9.17.12.04.SPA.bin ftp://10.1.1.50/images/
```

**SCP server on the router** (so a PC can push or pull files with `scp`):

```
aaa new-model
aaa authentication login default local
aaa authorization exec default local    ! SCP needs the user to land at privilege 15
ip scp server enable
```

**Why does SCP fail with "Privilege denied" when SSH logins work?** Because an interactive SSH user can type `enable`, but an SCP transfer can't — it needs the session to *start* at privilege 15. That only happens when **exec authorization** assigns the privilege level from the user's account. No `aaa authorization exec` → the transfer starts at level 1 → refused.

**Why does `ip tftp source-interface` fix "timed out" so often?** A router with several interfaces sources the transfer from whichever interface faces the server. If the server only allows (or has a firewall rule for) the management loopback, or there's no return route to the egress interface's subnet, the request leaves but the reply never arrives. Pinning the source makes the device's identity predictable — the same reason we pin TACACS+, SNMP and syslog sources.

## 32.2 SNMP v2c and v3

Chapter 15 covered SNMP's model (manager, agent, MIB, OIDs; polls on **UDP 161**, traps/informs to **UDP 162**). Here's what breaks.

### SNMPv2c

```
access-list 20 permit 10.1.1.60                  ! only the NMS
snmp-server community N3tM0n RO 20               ! community + permission + ACL
snmp-server location DC1-Row4
snmp-server host 10.1.1.60 version 2c N3tM0n     ! where traps go
snmp-server enable traps
snmp-server trap-source Loopback0
snmp-server ifindex persist                      ! keep ifIndex numbers stable across reloads
```

**Why `ifindex persist`?** The NMS stores interface statistics by **ifIndex**, an SNMP number for each interface. Without persistence, adding a module or reloading can renumber interfaces, and the NMS silently starts graphing the wrong interface under the old name. *Graphs that "jumped" after a reload are an ifIndex problem, not a traffic problem.*

The community is a **password sent in clear text**, which is why v2c should be read-only and ACL-restricted.

### SNMPv3

v3 adds **authentication** (HMAC — SHA/MD5) and **privacy** (encryption — AES/DES), through a hierarchy of **view → group → user**:

```
snmp-server view FULL iso included                          ! which OIDs are visible
snmp-server group NMS-GRP v3 priv read FULL write FULL access 20
snmp-server user nmsuser NMS-GRP v3 auth sha AuthPass123 priv aes 128 PrivPass123
snmp-server host 10.1.1.60 version 3 priv nmsuser
```

| Security level | Keyword | Authentication | Encryption |
|----------------|---------|----------------|------------|
| noAuthNoPriv | `noauth` | Username only | No |
| authNoPriv | `auth` | Yes | No |
| **authPriv** | `priv` | Yes | **Yes** |

**Why aren't SNMPv3 users shown in the running configuration?** Because the user's passwords are converted into **localized keys** — hashed together with the router's **SNMP engine ID** — and only the keys are stored. That has two consequences you'll be tested on: `show running-config` won't show `snmp-server user` lines (use `show snmp user`), and **changing the engine ID invalidates every user** — they must be re-created. The engine ID defaults to one derived from a MAC address, so it can change if you replace hardware or set `snmp-server engineID local` later.

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| v2c polls time out | Wrong community (the agent **silently ignores** it) or ACL denies the NMS | `show snmp` → "Unknown community name" / "Illegal operation" counters rise |
| Reads work, writes fail | Community is `RO`, or the v3 group has no `write` view | `show snmp community`, `show snmp group` |
| Some OIDs return noSuchObject | The view excludes them | `show snmp view` |
| v3: "authorizationError" or unknown user | User's security level higher than the group's, or user created under a different group | `show snmp user`, `show snmp group` |
| v3: "wrong digests" / decryption errors | Auth or priv password/algorithm mismatch with the NMS | `show snmp` (wrong digests counter), `debug snmp packets` |
| v3 stopped after an engine ID change | Localized keys invalid | `show snmp engineID`; re-create users |
| Traps never arrive | No `snmp-server host`, traps not enabled, wrong trap source, UDP 162 blocked | `show snmp host`, `debug snmp packets` |

**Traps or informs?** A **trap** is fire-and-forget over UDP — if it's lost, nobody knows. An **inform** is acknowledged and retransmitted. When an NMS is missing events from a lossy site, informs are the fix.

SNMPv3 informs need two extra lines, and their absence is a classic "informs never arrive" fault. For an inform, the **receiver** (the NMS) is the authoritative SNMP engine, so the router must localize the user's keys with the **NMS's** engine ID, not its own:

```
snmp-server engineID remote 10.1.1.60 800000090300AABBCCDDEEFF   ! the NMS's engine ID
snmp-server user nmsuser NMS-GRP remote 10.1.1.60 v3 auth sha AuthPass1 priv aes 128 PrivPass1
snmp-server host 10.1.1.60 informs version 3 priv nmsuser
snmp-server enable traps
```

Configure the remote engine ID **before** the remote user (the keys are computed from it when the user is created). `show snmp engineID` lists both the local and the remote engine IDs; `show snmp user` shows the remote user against that engine. Traps don't need any of this — for a trap the router itself is authoritative, which is why v3 traps work with only the local user.

## 32.3 Logging

### Severity and destinations

| Level | Keyword | Level | Keyword |
|-------|---------|-------|---------|
| 0 | emergencies | 4 | warnings |
| 1 | alerts | 5 | notifications |
| 2 | critical | 6 | informational |
| 3 | errors | 7 | debugging |

Setting a level means "**this level and everything more severe**" — `logging trap warnings` sends 0–4.

| Destination | Command | Default | Notes |
|-------------|---------|---------|-------|
| **Console** | `logging console <level>` | debugging | Slow — a debug flood here can hang the router |
| **VTY (monitor)** | `logging monitor <level>` | debugging | Shown only after `terminal monitor` in **that** session |
| **Local buffer** | `logging buffered <size> <level>` | on, in RAM | `show logging`; lost at reload |
| **Syslog server** | `logging host 10.1.1.70` + `logging trap <level>` | trap level **informational** | UDP 514; set `logging source-interface` |

**Why is "I enabled debug but see nothing" so common?** Three independent switches must line up: the debug must be on; the destination you're looking at must have a level of **debugging (7)**; and on a VTY, `terminal monitor` must be enabled in your session. Debug output is severity 7, so a buffer set to `informational` silently discards it.

### Timestamps — making logs useful

```
service timestamps log datetime msec localtime show-timezone
service timestamps debug datetime msec localtime show-timezone
service sequence-numbers
clock timezone EST -5 0
ntp server 10.1.1.1
```

**Why do timestamps decide whether logs are evidence or noise?** Troubleshooting is correlation: "the BGP session dropped at 14:02:17.331 — what did the firewall log at the same instant?" That requires every device's clock to agree (**NTP**, Chapter 8) and to log with **datetime and milliseconds**. The default `uptime` format ("3w2d") can't be lined up against anything. Sequence numbers reveal whether messages were lost in transit to the syslog server.

### Conditional debugging

A plain `debug ip packet` on a busy router is dangerous: it tries to print every packet. Narrow the output before you enable it:

```
R1# debug condition interface GigabitEthernet0/1     ! only events tied to this interface
R1# debug ip packet 120 detail                       ! only packets matching ACL 120
R1# show debug condition
R1# undebug all                                      ! ALWAYS have this ready
R1# no debug condition all                           ! conditions survive undebug all
```

Conditions filter debugs that support them (most interface- and protocol-related debugs do); an ACL attached to `debug ip packet` restricts which packets are shown. Note that `debug ip packet` only sees **process-switched** traffic — CEF-switched transit packets never appear. Conditions are **separate from the debugs**: `undebug all` turns off the debugs but leaves the conditions configured, so a later debug may show far less than you expect. Clear them with `no debug condition all` when you're done (or remove one with `no debug condition <id>`). *Debug the smallest thing you can, to the buffer, with timestamps — and know your undo commands before you press Enter.*

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Syslog server receives nothing | No route/ACL, wrong `logging host`, UDP 514 blocked, trap level too low | `show logging` (host line: "xx message lines logged"), `ping` from the source interface |
| Server receives logs from an "unknown" IP | Source not pinned | Set `logging source-interface Loopback0` |
| Timestamps don't match other devices | No NTP / wrong time zone / uptime format | `show clock detail`, `show ntp status` |
| Debug output missing | Buffer level < 7, or no `terminal monitor` | `show logging` (levels per destination) |
| Router sluggish after debugging | Console logging of a high-volume debug | `no logging console`; `undebug all` |

## 32.4 DHCP for IPv4

### The IOS DHCP server and relay

```
ip dhcp excluded-address 10.1.10.1 10.1.10.20   ! never hand these out
ip dhcp pool VLAN10
 network 10.1.10.0 255.255.255.0
 default-router 10.1.10.1
 dns-server 10.1.1.53
 domain-name example.com
 option 150 ip 10.1.1.80                          ! Cisco IP phones: TFTP server(s)
 lease 2                                          ! days
!
interface Vlan20                                  ! on the L3 switch where clients live
 ip address 10.1.20.1 255.255.255.0
 ip helper-address 10.1.1.10                      ! relay DHCP to the central server
```

**How does a central server know which pool to use for a relayed request?** The relay agent writes the IP address of the interface the request **arrived on** into the **giaddr** field before unicasting it to the server. The server picks the pool whose `network` contains giaddr, and sends the reply back to the relay. That's why a missing pool for 10.1.20.0/24 on the server — or a relay interface with the wrong IP — means no address, even though the relay "works".

`ip helper-address` relays more than DHCP: by default it also forwards TFTP (69), DNS (53), Time (37), TACACS (49), NetBIOS (137/138) and IEN-116 name service (42). Use `no ip forward-protocol udp <port>` to stop the ones you don't want.

| Option | Carries | Typical use |
|--------|---------|-------------|
| **3** | Default router | `default-router` |
| **6** | DNS servers | `dns-server` |
| **43** | Vendor-specific information | APs finding their **WLC** (sub-option 0xF1 + controller IPs, in hex) |
| **66** | TFTP server **name** | Phones/devices that take a hostname |
| **150** | TFTP server **IP list** (Cisco) | Cisco IP phones fetching config |
| **82** | Relay Agent Information | Inserted by relays/snooping switches: which switch and port the client is on |

### DHCP client

```
interface GigabitEthernet0/0
 ip address dhcp                       ! e.g. an internet-facing link
R1# show dhcp lease
```

A DHCP-learned default route is installed with **AD 254**, so any static or dynamic default wins over it.

### What breaks

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Clients get 169.254.x.x (APIPA) | No server reachable: missing `ip helper-address`, server not reachable from relay | `debug ip dhcp server packet` on server (nothing arrives) |
| Clients get APIPA, relay seems configured | `ip helper-address` on the **wrong interface** — it belongs on the **client-facing** interface/SVI (where the broadcast arrives), not the uplink toward the server | `show ip interface Vlan10 | include Helper` |
| Relay forwards, server never answers | **No pool matching giaddr** | `show ip dhcp pool`, `debug ip dhcp server events` |
| Server ignores relayed requests from a switch running DHCP snooping | Switch inserted **option 82 with giaddr 0**; IOS server drops it as untrusted | `debug ip dhcp server packet`; fix with `no ip dhcp snooping information option` on the switch or `ip dhcp relay information trust-all` on the relay/server |
| Pool exhausted / addresses skipped | Addresses found in use by **conflict detection** (server pings before offering) | `show ip dhcp conflict`, `show ip dhcp pool` (leased vs total) |
| Clients get an address that conflicts with a static device | Static range not in `excluded-address` | `show ip dhcp binding` |
| Phones/APs don't find TFTP/WLC | Option 150/43 missing or malformed | `show run | section dhcp pool` |
| Nothing works at all | **`no service dhcp`** — disables the server *and* relay | `show run | include service dhcp` |

## 32.5 DHCP for IPv6

IPv6 splits address assignment between **Router Advertisements** and **DHCPv6**, controlled by flags in the RA:

| RA flags | Model | Host gets address from | Host gets DNS etc. from |
|----------|-------|------------------------|-------------------------|
| M=0, O=0 | **SLAAC** only | SLAAC | RDNSS in the RA (if supported) |
| M=0, **O=1** | **Stateless DHCPv6** | SLAAC | DHCPv6 |
| **M=1** | **Stateful DHCPv6** | DHCPv6 | DHCPv6 |

**The one thing DHCPv6 never provides is a default gateway.** Hosts always learn their default router from RAs. A host with a perfect DHCPv6 address and no RA has no way off the link.

```
ipv6 dhcp pool V6-VLAN10
 address prefix 2001:DB8:10::/64 lifetime infinite infinite    ! stateful only
 dns-server 2001:DB8:1::53
 domain-name example.com
!
interface Vlan10
 ipv6 address 2001:DB8:10::1/64
 ipv6 dhcp server V6-VLAN10
 ipv6 nd managed-config-flag            ! M=1: use DHCPv6 for addresses
 ipv6 nd other-config-flag              ! O=1: and for other information
 ipv6 nd prefix 2001:DB8:10::/64 2592000 604800 no-autoconfig   ! stop SLAAC too
```

On a relay (the server is elsewhere):

```
interface Vlan20
 ipv6 dhcp relay destination 2001:DB8:1::10
```

DHCPv6 runs on **UDP 546 (client) / 547 (server/relay)**; clients solicit to the multicast address **FF02::1:2** (All DHCP Relay Agents and Servers) — there's no broadcast in IPv6. A router can be a client with `ipv6 address dhcp`.

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Hosts use SLAAC and ignore DHCPv6 | M flag not set | `show ipv6 interface Vlan10` ("hosts use DHCP to obtain routable addresses") |
| Hosts get **two** addresses (SLAAC + DHCPv6) | M=1 but the prefix still has autonomous (A) flag set | Add `no-autoconfig` to `ipv6 nd prefix` |
| DHCPv6 address but no off-link connectivity | RAs suppressed (`ipv6 nd ra suppress`) or filtered — no default route | `show ipv6 routers` on a client router; check RA Guard (31.6) |
| Relayed clients get nothing | Missing `ipv6 dhcp relay destination`, or server has no route back to the relay's link | `debug ipv6 dhcp`, `show ipv6 dhcp interface` |
| Stateless clients have no DNS | O flag not set or pool has no `dns-server` | `show ipv6 dhcp pool` |

## 32.6 IP SLA and Object Tracking

IP SLA makes the router **generate synthetic traffic** and measure the result (Chapter 15 introduced it). ENARSI uses it for two jobs: measuring performance (**delay, jitter, loss**) and testing **connectivity** to drive failover through **object tracking**.

### Connectivity and failover

```
ip sla 10
 icmp-echo 8.8.8.8 source-interface GigabitEthernet0/0   ! probe *through* ISP-A
 threshold 300
 timeout 1000
 frequency 5
ip sla schedule 10 life forever start-time now
!
track 1 ip sla 10 reachability
 delay down 10 up 30                                       ! dampen flaps
!
ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1               ! primary: only while track 1 is up
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10                   ! floating backup (AD 10)
ip route 8.8.8.8 255.255.255.255 203.0.113.1               ! pin the probe to ISP-A
```

![IP SLA + tracking — the probe watches the path, the track decides which default route lives](images/c32_ipsla_track.png)

**Why the extra host route to 8.8.8.8?** Without it, when ISP-A fails, the backup default takes over — and the *probe itself* now follows the backup route through ISP-B, succeeds, brings track 1 back up, which reinstalls the primary route, which fails the probe, which… The route flaps forever. Pinning the probe target to ISP-A means the probe always tests the **primary** path, whatever the routing table currently prefers. *A probe must test the path you're deciding about, not whichever path happens to be in use.*

**Hardening the pinned route.** `ip route 8.8.8.8 255.255.255.255 203.0.113.1` has its own weakness: if ISP-A's interface goes **down**, the next hop becomes unreachable, the host route is removed, and the probe falls back to the default — through ISP-B. Two common fixes keep the probe on ISP-A no matter what:

```
ip route 8.8.8.8 255.255.255.255 GigabitEthernet0/0 203.0.113.1   ! interface-qualified
ip route 8.8.8.8 255.255.255.255 Null0 250                        ! floating discard
```

The interface-qualified route ties the probe to Gi0/0. The floating Null0 route (AD 250) takes over when the primary host route disappears, so the probe is **dropped** instead of leaking out through ISP-B. A dropped probe correctly reports ISP-A as down. *The probe must fail when the path fails; it must never succeed by taking a different path.*

**Why probe 8.8.8.8 instead of the ISP's next hop?** The next hop (203.0.113.1) answers as long as the local link is up — even when the ISP's own upstream is down. Probing something **beyond** the ISP tests the path you actually care about.

| Track type | Up when… |
|------------|----------|
| `track 1 ip sla 10 reachability` | Return code is **OK** *or* **Over threshold** |
| `track 1 ip sla 10 state` | Return code is **OK** only — slow counts as down |
| `track 2 interface Gi0/0 line-protocol` | Interface line protocol up |

### Jitter and delay

Voice and video care about **one-way delay**, **jitter** (variation in delay) and **loss** — none of which a ping measures properly. The **udp-jitter** operation sends a stream of timestamped UDP packets:

```
! On the far-end router — REQUIRED for udp-jitter:
ip sla responder
!
! On the measuring router:
ip sla 20
 udp-jitter 10.2.2.2 16384 codec g711ulaw     ! simulate a G.711 voice call
 tos 184                                       ! mark like real voice (DSCP EF)
 frequency 60
ip sla schedule 20 life forever start-time now
```

**Why does udp-jitter need a responder?** Because the far end must **timestamp** each packet when it arrives and when it replies, so the sender can separate the outbound and return legs and subtract the responder's own processing time. An ordinary host would just drop the packets. One-way delay values additionally need both routers' clocks synchronised with **NTP**; round-trip and jitter don't.

```
R1# show ip sla statistics 20
IPSLAs Latest Operation Statistics
IPSLA operation id: 20
Type of operation: udp-jitter
        Latest RTT: 41 milliseconds
Latest operation return code: OK
RTT Values:
        Number Of RTT: 1000       RTT Min/Avg/Max: 38/41/77 milliseconds
Packet Loss Values:
        Loss Source to Destination: 0   Loss Destination to Source: 0
Jitter Time:
        Source to Destination Jitter Min/Avg/Max: 0/2/18 milliseconds
        Destination to Source Jitter Min/Avg/Max: 0/1/9 milliseconds
Voice Score Values:
        Calculated Planning Impairment Factor (ICPIF): 1
        MOS score: 4.34
```

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Statistics show nothing / "Number of successes: 0", never ran | Operation **not scheduled** — the most common fault | `show ip sla configuration 10` (look for schedule), `show ip sla summary` |
| udp-jitter return code "No connection" / timeout | **`ip sla responder` missing** on the far end, or UDP blocked | `show ip sla responder` on the target |
| Probe fails though path is fine | Wrong source interface, or ACL/CoPP drops probes | `show ip sla statistics`, `debug ip sla trace` |
| Track never goes down when ISP fails | Probing the ISP next hop instead of beyond it | `show track` |
| Default route flaps every few seconds | Probe follows the backup path after failover | Missing host route pinning the probe |
| Failover too slow | `frequency`/`timeout` too long, or track `delay down` too long | `show ip sla configuration`, `show track` |
| One-way delay values nonsensical | Clocks not NTP-synced | `show ntp status` both ends |

## 32.7 NetFlow — v5, v9 and Flexible NetFlow

NetFlow answers "**who** is talking to **whom**, using **what**, and how much?" — the question SNMP interface counters can't. A **flow** is a set of packets sharing the same **key fields**; the router keeps a counter per flow in its **cache** and exports expired flows to a **collector**. Chapter 15 configured Flexible NetFlow; here we compare versions and troubleshoot.

| Version | Format | Flexible? | IPv6 / MPLS | Key fields |
|---------|--------|-----------|-------------|------------|
| **v5** | **Fixed** record | No | **No** — IPv4 only | Fixed 7: src/dst IP, src/dst port, protocol, ToS, input interface |
| **v9** | **Template-based** — the exporter first sends a template describing its records | Record content set by the feature | Yes | Defined by the template |
| **Flexible NetFlow** | Cisco's configuration model, exporting as **v5, v9 or IPFIX** | **Yes** — you choose `match` (key) and `collect` (non-key) fields | Yes | Whatever you `match` |

**Why did NetFlow move to templates?** Because a fixed v5 record can't grow: there's no room for IPv6 addresses, MPLS labels, application IDs or anything invented later. A v9 exporter sends a **template** first ("my records are: field 8 for 4 bytes, field 12 for 4 bytes…"), then data records that follow it. New fields need a new template, not a new protocol version. The catch: **the collector can't decode any data until it has received the template** — the source of a whole class of v9 problems.

Traditional (v5/v9) configuration, for recognition:

```
interface GigabitEthernet0/1
 ip flow ingress                              ! collect flows entering this interface
!
ip flow-export version 9                     ! or: ip flow-export version 5
ip flow-export destination 10.1.1.70 2055
ip flow-export source Loopback0
R1# show ip cache flow
R1# show ip flow export
```

The only difference between a v5 and a v9 export in traditional NetFlow is the `ip flow-export version` line. **Set it explicitly and match the collector**: a collector expecting v9 templates can't parse v5 records and vice versa, and only v9 can carry IPv6 flows. `show ip flow export` shows the version in use, the destination, and the count of export failures.

Flexible NetFlow (record → exporter → monitor → interface):

```
flow record FR-BASIC
 match ipv4 source address
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 match interface input
 collect counter bytes long
 collect counter packets long
!
flow exporter FE-COLLECTOR
 destination 10.1.1.70
 source Loopback0
 transport udp 2055
 export-protocol netflow-v9
 template data timeout 60              ! resend templates every 60 s
!
flow monitor FM-BASIC
 record FR-BASIC
 exporter FE-COLLECTOR
 cache timeout active 60
!
interface GigabitEthernet0/1
 ip flow monitor FM-BASIC input
```

| Symptom | Likely cause | Command that proves it |
|---------|--------------|------------------------|
| Collector shows nothing; cache full of flows | Exporter destination, **UDP port** mismatch (2055 / 9995 / 9996 / IPFIX 4739 — must match the collector), route, or ACL | `show flow exporter statistics` (packets sent), `show flow exporter FE-COLLECTOR` |
| Collector receives packets but can't decode them (v9) | **Template not received** — collector started after the template was sent | Lower `template data timeout`; check collector logs |
| Collector lists the router under an unexpected IP | No `source` on the exporter | `show flow exporter` |
| Cache empty | Monitor not applied to the interface, or applied in wrong direction | `show flow interface Gi0/1`, `show flow monitor FM-BASIC cache` |
| Traffic totals half of reality | Only `input` monitored on some interfaces — traffic in the other direction never seen | `show flow interface` on every relevant interface |
| Long transfers appear late or as one giant spike | Active timeout too long (FNF default **1800 s**) | `show flow monitor FM-BASIC` — lower `cache timeout active` |
| Collector shows no IPv6 | Exporting **v5** (IPv4-only) or record only matches IPv4 | `show flow exporter`, record definition |

## 32.8 Catalyst Center (formerly DNA Center) Assurance

Chapter 16 introduced Catalyst Center. **Assurance** is its troubleshooting half: it ingests telemetry from every device and client — streaming telemetry, SNMP, syslog, NetFlow, ISE and DHCP/DNS data, wireless data — and turns it into **health scores** and **issues**. ENARSI asks you to use it for four things named in the blueprint: **network health, device health, connectivity, and monitoring**.

| View | Tells you | Typical use |
|------|-----------|-------------|
| **Network Health** | The **percentage of healthy devices**, broken down by site and device role (core, distribution, access, router, WLC, AP) | "Is anything wrong right now, and where?" |
| **Device Health / Device 360** | A **1–10 score** per device: **Poor 1–3 (red), Fair 4–7 (orange), Good 8–10 (green)** — built from KPIs such as CPU, memory, reachability, interface errors, link status | Drilling into one switch: which KPI dragged its score down |
| **Client Health / Client 360** | Per-client onboarding and connectivity: association, authentication, DHCP, DNS, RF quality for wireless | "Why can't *this user* connect?" — showing which onboarding step failed |
| **Issues** | Detected problems with **severity**, affected devices/clients, **root cause** and **suggested actions** (guided remediation) | Working the queue: what's broken, why, and the CLI checks Catalyst Center recommends |
| **Path Trace** | The hop-by-hop **L2/L3 path** between two endpoints, with interfaces, and whether **ACLs** along the path permit the flow | "The app server is unreachable from this VLAN" — find the hop or ACL in the way |
| **Time travel** | The network's health at a past moment | "It was broken at 9:40 and fine now" — see what it looked like then |

**Why is Assurance more than a fancy SNMP poller?** Because it **correlates**. A classic NMS tells you "interface Gi1/0/48 errors increased" and "client 10.1.20.55 failed DHCP" as two unrelated alarms. Assurance knows the client is attached to that switch, that DHCP is relayed through that uplink, and that the errors started at the same minute — so it raises **one issue** with a probable root cause. Its AI-driven analytics (Chapter 16) go further, learning each site's **baseline** so it can flag "abnormal for *this* network" rather than relying on fixed thresholds.

A troubleshooting workflow that matches how the exam frames it:

1. **Network Health** — find the site/role with a falling score.
2. **Device 360** — open the worst device; see which KPI (CPU, memory, link errors, reachability) is red and when it changed.
3. **Issues** — read the root cause and **suggested actions**; run the recommended commands (Catalyst Center can run them for you and show the output).
4. **Client 360** — if users report it, confirm which onboarding step fails (association → authentication → DHCP → DNS).
5. **Path Trace** — prove whether the forwarding path and ACLs allow the flow end to end.
6. **Time travel** — for intermittent problems, compare "then" with "now".

> **Exam trap:** health scores come from data Catalyst Center **receives**. A device that's unmanaged, unreachable, or not sending telemetry/syslog/SNMP to Catalyst Center can look "unknown" or stay stale — that's a monitoring gap, not a healthy device. When one device's data looks wrong, check its reachability and telemetry configuration from Catalyst Center (inventory: **Managed** vs **Unreachable** / sync errors) before trusting its score.

---

<a name="part-3"></a>
# Part III — Passing Both Exams

<a name="chapter-33"></a>
# Chapter 33: Exam Strategy & Study Plans

## 33.1 How the Certification Fits Together

CCNP Enterprise is **two exams**, and each one earns something on its own:

| You pass | You earn |
|----------|----------|
| **ENCOR 350-401** alone | Cisco Certified Specialist – Enterprise Core, and eligibility to book the **CCIE Enterprise Infrastructure** lab (CCIE Enterprise Wireless now qualifies through WLCOR 350-101 instead) |
| **ENARSI 300-410** alone | Cisco Certified Specialist – Enterprise Advanced Infrastructure Implementation |
| **Both** (in either order) | **CCNP Enterprise** |

The certification is valid for **three years**. You can recertify by passing exams again or by earning Continuing Education credits, and passing ENCOR again on its own also recertifies it.

**Why does ENCOR come first in this guide, if the order is up to you?** Because ENARSI is built on top of it. ENCOR asks you to *configure* simple OSPF and eBGP; ENARSI asks you to *troubleshoot* multi-area OSPF, iBGP route reflection and redistribution between them. Studying ENARSI first means learning the foundation and the advanced layer at the same time, while ENCOR first means Part II feels like the next floor of a building you already know. The rare exception: if your day job is heavy routing work and you want a quick early win, ENARSI first is defensible. *For everyone else, take ENCOR first, then ENARSI while the core is still fresh.*

## 33.2 The Exams Themselves

| Exam | Duration | Blueprint version | Domains |
|------|----------|-------------------|---------|
| **ENCOR 350-401** | 120 minutes | **v1.2** (since 19 March 2026) | 6 — wide coverage |
| **ENARSI 300-410** | 90 minutes | **v1.1** | 4 — deep, troubleshooting-heavy |

These are the versions **at the time of writing (October 2026)**. Cisco refreshes blueprints periodically, and ENARSI v1.1 is the older of the two, so confirm the current version on the Cisco Learning Network before you book. If a version changes, compare its topic list against Appendix A or B line by line.

Things that hold for both:

- **You cannot go back.** Once you submit an answer, it is final. Answer each question as if it were the last one.
- **Question types** include multiple choice (single and multiple answer), drag-and-drop, and hands-on simulation or lab-style items. Cisco does not publish question counts and adjusts formats over time, so check the current exam page on the Cisco Learning Network the week you book.
- **Scores are scaled** and the passing mark is not published. Don't try to calculate it during the exam; just make every answer count.

**Why do the two exams feel so different, even though they share topics?** Look at the verbs in each blueprint. ENCOR mostly says *describe*, *explain*, *interpret* and *configure*: can you recognise it, and can you set it up? ENARSI says **troubleshoot** almost every time: here's a broken network, find the fault. ENCOR rewards breadth: a little of everything from QoS to Python. ENARSI rewards depth: given a stuck BGP session, can you name the four likely causes and the command that proves each one? *Study for ENCOR with understanding plus recall; study for ENARSI by breaking labs on purpose.*

## 33.3 Your Lab

You already run **EVE-NG**, and that covers almost everything. What to run where:

| Topic area | Best platform | Notes |
|------------|---------------|-------|
| Switching, STP/MST, EtherChannel (Ch 3–4) | **IOL L2** images in EVE-NG | Lightweight; lab with 4–6 switches at once |
| Routing, redistribution, BGP, PBR, VRF-Lite, BFD (Ch 5–7, 22–28) | **IOL L3** or **vIOS** | Run many routers on modest hardware |
| HSRP/VRRP, NAT, NTP, multicast, QoS policies (Ch 8–11) | IOL L3 / vIOS | Multicast needs a source and a receiver — use VPCS or Linux nodes |
| GRE, IPsec, DMVPN, MPLS L3VPN (Ch 12, 29, 30) | IOL L3 or **Catalyst 8000v** | All work on IOL; the 8000v gives you IKEv2 defaults identical to production |
| NETCONF, RESTCONF, EEM, Flexible NetFlow, IP SLA (Ch 15, 20, 21, 32) | **Catalyst 8000v** (IOS XE) | Model-driven APIs need IOS XE |
| Python, Ansible, JSON (Ch 19–21) | A Linux node in EVE-NG, or your laptop | Point scripts at the 8000v |
| Catalyst Center, SD-WAN, SD-Access (Ch 14, 16, 20) | **Cisco DevNet sandboxes** | Real controllers without the hardware; several are always-on |

**Why bother with a full lab when the blueprint says "describe" for so much of it?** Because the configure and troubleshoot items are where people lose marks, and you can't fake those. A lab is also the only reliable way to find out you've misunderstood something: reading lets you believe a wrong idea indefinitely, but a router tells you within seconds. *Every chapter with config in it should end with you typing that config and breaking it once.*

## 33.4 The Study Loop

The same loop that got you through CCNA, extended slightly for CCNP:

1. **Read the chapter.** Note every **Why?** you couldn't have answered before reading.
2. **Lab it.** Type the configs yourself rather than pasting them. Then **break one thing on purpose** and fix it using only `show` and `debug` output. ENARSI is a troubleshooting exam, so practise troubleshooting.
3. **Explain it out loud (the Feynman test).** Explain the chapter's core mechanism as if teaching someone, without notes. Wherever you hand-wave, you've found a gap. Go back to that section. Having Claude play the skeptical student who keeps asking "but *why*?" works well here.
4. **Check against the blueprint.** Find the chapter's lines in Appendix A or B. For each one, can you do what the verb says (describe, configure, troubleshoot)?
5. **Move on.** Don't wait for perfection. Review comes from the schedule below, not from re-reading the same chapter five times.

**Why the Feynman step, when reading again feels more productive?** Because re-reading creates familiarity, and familiarity feels like understanding. Explaining from memory forces retrieval, and retrieval is what both the exam and a 3 a.m. outage demand. *If you can't explain it, you don't know it yet. You only recognise it.*

## 33.5 ENCOR Study Plans

### The 10-Week Plan (steady pace, ~1–1.5 hrs/day)

| Week | Chapters | Focus | Lab |
|------|----------|-------|-----|
| **1** | 1–2 | Design models, high availability | Build the base campus topology you'll reuse |
| **2** | 3–4 | Trunking/EtherChannel faults, RSTP, MST, STP guards | Break DTP and LACP; migrate PVST+ to MST |
| **3** | 5–6 | EIGRP vs OSPF, multi-area OSPF, OSPFv3 | Three areas, summarization, filtering |
| **4** | 7 | eBGP and best-path selection | Two ASes; steer traffic with weight and local-pref |
| **5** | 8–9 | NTP, PTP, NAT/PAT, HSRP, VRRP | HSRP with tracking; PAT with a pool |
| **6** | 10–11 | Multicast, QoS | PIM-SM with a static RP; read your own `show policy-map` |
| **7** | 12–14 | VRF, GRE, IPsec, LISP, VXLAN, SD-WAN, SD-Access | GRE over IPsec with a VTI; explore the DevNet SD-WAN sandbox |
| **8** | 15–16 | Debugs, SNMP, syslog, Flexible NetFlow, SPAN, IP SLA, Catalyst Center | Flexible NetFlow + ERSPAN on an 8000v |
| **9** | 17–18 | AAA, ACLs, CoPP, security design, REST API security | Local fallback AAA; a CoPP policy |
| **10** | 19–21 + review | Python, JSON, YANG, NETCONF/RESTCONF, EEM, Ansible, AI | RESTCONF from Python; three EEM applets. Then Appendix A as a checklist |

### The 5-Week Sprint (~2.5–3 hrs/day)

| Week | Chapters | The one thing you must leave the week able to do |
|------|----------|---------------------------------------------------|
| **1** | 1–4 | Read `show etherchannel summary` and `show spanning-tree mst` cold, and say what's wrong |
| **2** | 5–9 | Configure multi-area OSPF and eBGP from a blank router, and recite best-path order |
| **3** | 10–14 | Explain an SD-Access packet flow: LISP lookup, VXLAN encapsulation, SGT enforcement |
| **4** | 15–18 | Configure AAA with fallback, CoPP and Flexible NetFlow without notes |
| **5** | 19–21 + review | Predict a Python script's output, and write valid JSON and an EEM applet from scratch |

**If you fall behind, cut in this order:** 🔬 depth sections first, then the second lab in a week (keep the first), then shorten the review week. **Never cut Infrastructure (Ch 3–10).** It's 30% of the exam.

## 33.6 ENARSI Study Plans

### The 6-Week Plan (steady pace, ~1–1.5 hrs/day)

| Week | Chapters | Lab — always finish by breaking it |
|------|----------|-------------------------------------|
| **1** | 22–23 | AD puzzles; prefix-list ge/le drills; route maps with tags |
| **2** | 24–25 | Two-point mutual redistribution, cause the loop, fix it with tags; PBR; VRF-Lite; BFD |
| **3** | 26–27 | EIGRP named mode with stubs and variance; OSPF NSSA plus a virtual link |
| **4** | 28 | iBGP with a route reflector, communities, AS-path filters |
| **5** | 29–30 | A small MPLS L3VPN; DMVPN Phase 3 with IPsec |
| **6** | 31–32 + review | AAA lockout recovery, uRPF, CoPP, SNMPv3, DHCP relay, IP SLA tracking. Then Appendix B as a checklist |

### The 3-Week Sprint (~3 hrs/day)

| Week | Chapters |
|------|----------|
| **1** | 22–25: the tools (AD, route maps, redistribution, PBR, VRF, BFD) |
| **2** | 26–28: the three protocols, in depth |
| **3** | 29–32 + review: VPNs, security, services |

**ENARSI's honest truth:** reading is the smaller half of the work. If you only have so many hours, put more of them into **breaking labs** than into reading. A good ENARSI week is one where you've seen every `show` command in the chapter return output that tells you something is broken.

## 33.7 Exam-Day Tactics

- **Read the last sentence first.** CCNP stems are long, and the question is often in the last line. Knowing what's being asked tells you which details in the scenario matter.
- **"Choose two" means two.** Most people who miss a multiple-answer question found one right answer and stopped thinking.
- **Budget the clock.** You can't go back, so time can't be reclaimed later. Glance at the clock every ten questions and keep a steady pace instead of saving time for review that won't exist.
- **Sims:** read every task before you type anything, verify each task with a `show` command, and remember that what's graded is usually the running config's effect, not how elegant it is.
- **Unsure? Eliminate.** CCNP distractors are usually real commands or real features used in the wrong place. Ask "would this even apply here?" before "is this right?"

## 33.8 Must-Memorize Cheat Sheet

### Administrative distance

| Source | AD | Source | AD |
|--------|----|--------|----|
| Connected | 0 | OSPF | 110 |
| Static | 1 | IS-IS | 115 |
| EIGRP summary | 5 | RIP | 120 |
| **eBGP** | **20** | EIGRP external | 170 |
| EIGRP internal | 90 | **iBGP** | **200** |
| Unknown / unusable | 255 |  |  |

### Protocols, ports and addresses

| What | Value |
|------|-------|
| OSPF | IP protocol 89 · 224.0.0.5 (all OSPF) · 224.0.0.6 (DR/BDR) · FF02::5 / FF02::6 |
| EIGRP | IP protocol 88 · 224.0.0.10 · FF02::A |
| PIM / IGMP | 224.0.0.13 (PIM) · IGMPv3 reports to 224.0.0.22 · SSM range 232.0.0.0/8 |
| HSRP | UDP 1985 · v1 224.0.0.2 · v2 224.0.0.102 · vMAC v1 0000.0c07.acXX, v2 0000.0c9f.fXXX |
| VRRP | IP protocol 112 · 224.0.0.18 · vMAC 0000.5e00.01XX |
| BGP | TCP 179 |
| LDP | UDP 646 (hellos) · TCP 646 (session) |
| GRE / ESP / AH | IP protocols 47 / 50 / 51 |
| IKE | UDP 500, and UDP 4500 with NAT traversal |
| VXLAN · LISP | UDP 4789 · UDP 4342 (control) / 4341 (data) |
| NTP · PTP | UDP 123 · UDP 319 (event) / 320 (general) |
| SNMP · syslog | UDP 161 (polls), 162 (traps/informs) · UDP 514 |
| TACACS+ · RADIUS | TCP 49 · UDP 1812 auth / 1813 accounting |
| NETCONF · RESTCONF | SSH, TCP 830 · HTTPS, TCP 443 |

### BGP best path, in order

**N WLLA OMNI** (the same mnemonic Chapter 7 teaches): **N**ext hop reachable → highest **W**eight → highest **L**ocal preference → **L**ocally originated → shortest **A**S path → lowest **O**rigin (IGP < EGP < incomplete) → lowest **M**ED → **N**eighbour type (eBGP over iBGP) → lowest **I**GP metric to the next hop. Then the tie-breakers: oldest eBGP path → lowest router ID → shortest cluster list → lowest neighbour address. Chapter 7.7 walks through every step and Chapter 28.6 shows how to manipulate each one.

### OSPF LSAs

| Type | Name | Generated by | Blocked by |
|------|------|--------------|------------|
| 1 | Router | Every router | — |
| 2 | Network | DR | — |
| 3 | Summary | ABR | Totally stubby, totally NSSA |
| 4 | ASBR summary | ABR | Stub, totally stubby, NSSA, totally NSSA |
| 5 | External | ASBR | Stub, totally stubby, NSSA, totally NSSA |
| 7 | NSSA external | ASBR in an NSSA | (converted to Type 5 by the ABR) |

### QoS markings

DSCP for AF*xy* = **8x + 2y**: AF11 = 10, AF21 = 18, AF31 = 26, AF41 = 34. **EF = 46** (voice). CS*n* = 8n: CS3 = 24 (signalling), CS6 = 48 (routing).

### HTTP status codes

**200** OK · **201** Created · **202** Accepted (async task started — Catalyst Center returns a task ID) · **204** No Content · **400** Bad Request · **401** Unauthorized (not authenticated) · **403** Forbidden (authenticated but not allowed) · **404** Not Found · **405** Method Not Allowed · **409** Conflict · **415** Unsupported Media Type · **429** Too Many Requests (rate-limited) · **500** Internal Server Error · **503** Service Unavailable.

---

<a name="blueprint-encor"></a>
# 🗺️ Appendix A: ENCOR 350-401 v1.2 Blueprint Coverage Map

Cisco publishes the official topic list for **ENCOR 350-401 v1.2**, the version in effect since 19 March 2026. This table maps **every** item on it to the sections that teach it. Use it two ways: as the final checklist before you book the exam, and as the index to go back to when a practice question catches you out. A **bold** section is the main treatment. Sections in *(italics)* are the ENARSI-depth follow-ups in Part II: not needed for ENCOR, but the next place to go if you want more.

The verb matters. **Describe/Explain** means recognise and explain it. **Interpret** means read a config or output and say what it does. **Configure/Construct** means produce it from scratch. **Troubleshoot** means find what's broken.

## 1.0 Architecture (15%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 1.1 | Explain the different design principles used in an enterprise network | **1.2**, 1.9 |
| 1.1.a | High-level enterprise network design such as 2-tier, 3-tier, fabric, and cloud | **1.3–1.6**, 1.7, **1.8** |
| 1.1.b | High availability techniques such as redundancy, FHRP, and SSO | **2.1–2.8**, 9.1, 9.4 |
| 1.2 | Explain the working principles of the Cisco Catalyst SD-WAN solution | **14.1–14.5**, 14.9 |
| 1.2.a | SD-WAN control and data planes elements | **14.2–14.4** |
| 1.2.b | Benefits and limitations of Catalyst SD-WAN solution | **14.1**, **14.5** |
| 1.3 | Explain the working principles of the Cisco SD-Access solution | **14.6–14.8**, 14.9 |
| 1.3.a | SD-Access control and data planes elements | **14.6**, **14.7** (LISP and VXLAN themselves: 13) |
| 1.3.b | Traditional campus interoperating with SD-Access | **14.8** |
| 1.4 | Interpret QoS configurations | 11.1–11.6, **11.7** (line-by-line reading) |

## 2.0 Virtualization (10%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 2.1 | Describe device virtualization technologies | **12.1–12.4** |
| 2.1.a | Hypervisor type 1 and 2 | **12.2** |
| 2.1.b | Virtual machine | **12.1**, **12.3** |
| 2.1.c | Virtual switching | **12.4** |
| 2.2 | Configure and verify data path virtualization technologies | **12.5–12.11** |
| 2.2.a | VRF (configure and verify) | **12.5**, **12.6**, 12.11 *(25.2 VRF-Lite with routing protocols)* |
| 2.2.b | GRE and IPsec tunneling (configure and verify) | **12.7–12.11** *(30 DMVPN)* |
| 2.3 | Describe network virtualization concepts | **13.1–13.5** |
| 2.3.a | LISP | **13.1–13.3**, 13.5 |
| 2.3.b | VXLAN | 13.2, **13.4**, 13.5 |

## 3.0 Infrastructure (30%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 3.1 | Layer 2 | **3**, **4** |
| 3.1.a | Troubleshoot static and dynamic 802.1q trunking protocols | **3.1–3.4**, 3.9 |
| 3.1.b | Troubleshoot static and dynamic EtherChannels | **3.5–3.9** |
| 3.1.c | Configure and verify RSTP, MST, and STP enhancements (root guard, BPDU guard) | **4.1–4.2** RSTP, **4.3** MST, **4.4–4.6** enhancements |
| 3.2 | Layer 3 | **5**, **6**, **7** |
| 3.2.a | Compare EIGRP and OSPF (DV vs link state, load balancing, path selection, path operations, metrics, area types) | **5.1–5.8** *(26 EIGRP, 27 OSPF in depth)* |
| 3.2.b | Configure simple OSPFv2/v3 — multiple normal areas, summarization, filtering, adjacency, p2p/broadcast, passive-interface | **6.1–6.9** *(27)* |
| 3.2.c | Configure and verify eBGP between directly connected neighbors (best path, neighbor relationships) | **7.1–7.9** *(28)* |
| 3.2.d | Describe policy-based routing | **5.9** *(25.1 configuration)* |
| 3.3 | IP Services | **8**, **9**, **10** |
| 3.3.a | Interpret NTP and PTP configurations | **8.1–8.4** |
| 3.3.b | Configure NAT/PAT | **8.5** |
| 3.3.c | Configure FHRPs such as HSRP and VRRP | **9.1–9.5**, 9.7, 9.8 (GLBP comparison 9.6) |
| 3.3.d | Describe multicast — RPF check, PIM SM, IGMP v2/v3, SSM, bidir, MSDP | **10.2–10.6** (IGMP 10.3, PIM-SM 10.4–10.5, RPF 10.5, SSM/bidir/MSDP 10.6) |

## 4.0 Network Assurance (10%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 4.1 | Diagnose problems using debugs, conditional debugs, traceroute, ping, SNMP, and syslog | **15.1–15.4**, 15.8 *(32 troubleshooting depth)* |
| 4.2 | Configure and verify Flexible NetFlow | **15.5** *(32)* |
| 4.3 | Configure SPAN/RSPAN/ERSPAN | **15.6** |
| 4.4 | Configure and verify IP SLA | **15.7**, tracking in 9 *(32)* |
| 4.5 | Describe how Catalyst Center applies configuration, monitoring and management using traditional and AI-powered workflows | **16.1–16.5** |
| 4.6 | Configure and verify NETCONF and RESTCONF | **20.2–20.4** |

## 5.0 Security (20%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 5.1 | Configure and verify device access control | **17.1–17.4** |
| 5.1.a | Lines and local user authentication | **17.1**, **17.2** |
| 5.1.b | Authentication and authorization using AAA | **17.3**, **17.4** *(31 troubleshooting)* |
| 5.2 | Configure and verify infrastructure security features | **17.5–17.7** |
| 5.2.a | ACLs | **17.5** *(31)* |
| 5.2.b | CoPP | **17.6**, 17.7 *(31)* |
| 5.3 | Describe REST API security | **18.7** |
| 5.4 | Describe the components of network security design | **18.1–18.6** |
| 5.4.a | Threat defense | **18.1**, **18.2** |
| 5.4.b | Endpoint security | **18.3** |
| 5.4.c | Next-generation firewall | **18.4** |
| 5.4.d | TrustSec and MACsec | **18.5**, **18.6** |

## 6.0 Automation and Artificial Intelligence (15%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 6.1 | Interpret basic Python components and scripts | **19.1–19.7** |
| 6.2 | Construct valid JSON-encoded files | **19.8–19.10** |
| 6.3 | Describe data modeling language principles and benefits, such as YANG | **20.1** |
| 6.4 | Describe APIs for Catalyst Center and SD-WAN Manager | **20.5**, **20.6** |
| 6.5 | Interpret REST API response codes and payload results (Catalyst Center, RESTCONF) | **20.7**, 20.5 |
| 6.6 | Construct an EEM applet to automate configuration, troubleshooting, or data collection | **21.1**, **21.2** |
| 6.7 | Compare agent vs. agentless orchestration tools | **21.3**, **21.4** |
| *(note)* | *The "Artificial Intelligence" half of the domain title — not a numbered item* | **21.5**, and 16.3–16.4 (AI-powered workflows) |

---

<a name="blueprint-enarsi"></a>
# 🗺️ Appendix B: ENARSI 300-410 v1.1 Blueprint Coverage Map

Every item on Cisco's official **ENARSI 300-410 v1.1** topic list, mapped to the sections that teach it. A **bold** section is the main treatment. Nearly every line says *troubleshoot*, so for each one ask yourself: given a broken lab, could I find this fault with `show` and `debug` alone?

## 1.0 Layer 3 Technologies (35%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 1.1 | Troubleshoot administrative distance (all routing protocols) | **22.3**, **22.5–22.7** (method 22.1–22.3, RIB/FIB 22.4) |
| 1.2 | Troubleshoot route map for any routing protocol (attributes, tagging, filtering) | **23.2–23.5**, 23.7 |
| 1.3 | Troubleshoot loop prevention mechanisms (filtering, tagging, split horizon, route poisoning) | **23.6**, 23.5, 24.4 |
| 1.4 | Troubleshoot redistribution between any routing protocols or sources | **24.1–24.4**, **24.8** (default-route origination) |
| 1.5 | Troubleshoot manual and auto-summarization with any routing protocol | **24.5–24.7** |
| 1.6 | Configure and verify policy-based routing | **25.1** (concept: 5.9) |
| 1.7 | Configure and verify VRF-Lite | **25.2** (concept: 12.5–12.6) |
| 1.8 | Describe Bidirectional Forwarding Detection | **25.3** |
| 1.9 | Troubleshoot EIGRP (classic and named mode; VRF and global) | **26.1**, **26.3**, 26.11 (concepts: 5.2–5.6) |
| 1.9.a | Address families (IPv4, IPv6) | **26.1**, **26.2** |
| 1.9.b | Neighbor relationship and authentication | **26.4**, **26.5** |
| 1.9.c | Loop-free path selection (RD, FD, FC, successor, feasible successor, stuck in active) | **26.6**, **26.7** |
| 1.9.d | Stubs | **26.8** |
| 1.9.e | Load balancing (equal and unequal cost) | **26.9** |
| 1.9.f | Metrics | **26.10** |
| 1.10 | Troubleshoot OSPF (v2/v3) | **27.1–27.10**, 24.8 (default origination) (foundation: 6) |
| 1.10.a | Address families (IPv4, IPv6) | **27.1** |
| 1.10.b | Neighbor relationship and authentication | **27.2**, **27.3** |
| 1.10.c | Network types, area types, and router types | **27.4**, **27.5** |
| 1.10.c.i | Network types: point-to-point, multipoint, broadcast, nonbroadcast | **27.4** |
| 1.10.c.ii | Area types: backbone, normal, transit, stub, NSSA, totally stub | **27.5** |
| 1.10.c.iii | Router types: internal, backbone, ABR, ASBR | **27.5** |
| 1.10.c.iv | Virtual link | **27.6** |
| 1.10.d | Path preference | **27.7** |
| 1.11 | Troubleshoot BGP (internal and external, unicast, and VRF-Lite) | **28.1**, **28.9**, 28.10 (foundation: 7) |
| 1.11.a | Address families (IPv4, IPv6) | **28.4** |
| 1.11.b | Neighbor relationship and authentication (next-hop, multihop, 4-byte AS, private AS, route refresh, synchronization, operation, peer group, states and timers) | **28.1–28.5**, 28.11 (maximum-prefix, local-as, default-originate): multihop 28.1, next-hop 28.2, auth/states/timers 28.3, 4-byte and private AS 28.4, route refresh/synchronization/peer groups 28.5 |
| 1.11.c | Path preference (attributes and best-path) | **28.6** (algorithm first met in 7.7) |
| 1.11.d | Route reflector (excluding multiple route reflectors, confederations, dynamic peer) | **28.7** |
| 1.11.e | Policies (inbound/outbound filtering, path manipulation) | **28.8**, **28.11** (allowas-in, as-override, multipath, as-path ignore) |

## 2.0 VPN Technologies (20%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 2.1 | Describe MPLS operations (LSR, LDP, label switching, LSP) | **29.1–29.5** |
| 2.2 | Describe MPLS Layer 3 VPN | **29.6–29.13** |
| 2.3 | Configure and verify DMVPN (single hub) | **30.1–30.10** |
| 2.3.a | GRE/mGRE | **30.2**, 30.7 (GRE itself: 12.7) |
| 2.3.b | NHRP | **30.3–30.5** |
| 2.3.c | IPsec | **30.6** (IPsec itself: 12.8–12.10) |
| 2.3.d | Dynamic neighbor | **30.8** |
| 2.3.e | Spoke-to-spoke | **30.4**, **30.5** |

## 3.0 Infrastructure Security (20%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 3.1 | Troubleshoot device security using IOS AAA (TACACS+, RADIUS, local database) | **31.1** (configuration: 17.3–17.4) |
| 3.2 | Troubleshoot router security features | **31.2–31.4** |
| 3.2.a | IPv4 access control lists (standard, extended, time-based) | **31.2** (17.5) |
| 3.2.b | IPv6 traffic filter | **31.3** |
| 3.2.c | Unicast reverse path forwarding (uRPF) | **31.4** |
| 3.3 | Troubleshoot control plane policing (Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF, BGP) | **31.5** (configuration: 17.6) |
| 3.4 | Describe IPv6 First Hop security (RA guard, DHCP guard, binding table, ND inspection/snooping, source guard) | **31.6** |

## 4.0 Infrastructure Services (25%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 4.1 | Troubleshoot device management | **32.1** (lines: 17.1) |
| 4.1.a | Console and VTY | **32.1** (17.1) |
| 4.1.b | Telnet, HTTP, HTTPS, SSH, SCP | **32.1** |
| 4.1.c | (T)FTP | **32.1** |
| 4.2 | Troubleshoot SNMP (v2c, v3) | **32.2** (15.4) |
| 4.3 | Troubleshoot using logging (local, syslog, debugs, conditional debugs, timestamps) | **32.3** (15.2, 15.3) |
| 4.4 | Troubleshoot IPv4 and IPv6 DHCP (client, IOS server, relay, options) | **32.4** IPv4, **32.5** IPv6 |
| 4.5 | Troubleshoot performance using IP SLA (jitter, tracking objects, delay, connectivity) | **32.6** (15.7) |
| 4.6 | Troubleshoot NetFlow (v5, v9, flexible NetFlow) | **32.7** (15.5) |
| 4.7 | Troubleshoot using Catalyst Center (formerly DNA Center) assurance — connectivity, monitoring, device health, network health | **32.8** (16) |

---

<a name="bridge"></a>
# 🌉 Appendix C: The CCNA Foundations to Re-Read First

CCNP doesn't re-teach CCNA. It assumes it. These are the sections of the **CCNA Study Guide** that each part of this book builds on directly. Many of them are the 🔬 depth sections, which were written to be the runway for exactly this. If one feels shaky, spend twenty minutes on it before starting the CCNP chapter. It's cheaper than getting lost halfway through.

| Before CCNP chapter | Re-read in the CCNA guide | Why it matters here |
|---------------------|---------------------------|---------------------|
| 1 — Design | 1.7 Architectures, 1.8 SOHO/on-prem/cloud | Chapter 1 starts where those stop |
| 2, 9 — HA and FHRP | 14.7 FHRP & HSRP | Chapter 9 assumes the active/standby/virtual-IP idea |
| 3 — Trunking & EtherChannel | 8.1–8.2 802.1Q and DTP, 10.2–10.4 EtherChannel | The mode matrices extend these tables |
| 4 — STP | 9.8–9.11 PVST+, guards, BPDU mechanics, RSTP sync | MST and the guards assume the decision order and port roles cold |
| 5–6, 27 — OSPF | 16.9–16.11 neighbour requirements, DR/BDR, LSAs, area types | Multi-area starts from LSA types 1–7 |
| 5, 22 — Routing logic | 14.3–14.5 longest match, AD, metric | The three-step path selection is the spine of Part II |
| 8 — NTP & NAT | 17.3 NAT, 17.4 NTP | Inside/outside local/global terms are used without definition |
| 10 — Multicast | 5.4 unicast/broadcast/multicast | Multicast MAC mapping builds on Ethernet addressing |
| 11 — QoS | 17.7 QoS | The toolkit vocabulary (classify, mark, queue, police) carries over |
| 12 — VRF & tunnels | 1.9 VRFs, 2.7 TCP (MSS and MTU) | GRE/IPsec MTU problems are 2.7's MSS story in practice |
| 15, 32 — Assurance | 17.5 Syslog, 17.6 SNMP | Severity levels and SNMP versions are assumed |
| 17, 31 — Security | 18.4 AAA, 18.6 802.1X, 19 ACLs | AAA method lists and ACL logic are the starting point |
| 19–21 — Automation | 22.3–22.6 APIs, REST, JSON/YAML/XML, tools | Part I's automation chapters go from concept to working code |
| 13 & 31 — IPv6 pieces | 13.8 NDP & SLAAC | RA guard and ND inspection protect the messages taught there |
| Everything | 14.8 A Day in the Life of a Packet | Still the best troubleshooting method you own |

*If you can explain every row's CCNA section out loud, you're ready for Part I.*

---

<a name="glossary"></a>
# 📚 Glossary (Quick Definitions)

Terms the CCNA glossary already covers (VLAN, ARP, OSPF and so on) aren't repeated here. The chapter number shows where each term is taught.

| Term | Meaning | Ch |
|------|---------|----|
| **802.1X** | Port-based access control: supplicant ↔ authenticator (switch) ↔ authentication server (RADIUS/ISE), using EAP | 18 |
| **AAA** | Authentication, Authorization and Accounting — the framework for who can log in, what they can do, and what they did | 17, 31 |
| **ABR** | Area Border Router — OSPF router with interfaces in Area 0 and another area; generates Type 3 LSAs | 6, 27 |
| **Address family** | A protocol's per-address-type configuration context (IPv4, IPv6, VPNv4, a VRF) | 7, 26–28 |
| **Agentless** | Orchestration that needs no software on the managed device (e.g. Ansible over SSH/NETCONF) | 21 |
| **AIOps** | Using machine learning and AI to detect, correlate and explain operational problems | 16, 21 |
| **Ansible / Puppet / Chef / Salt** | Orchestration tools: Ansible is agentless push over SSH/NETCONF; Puppet and Chef are agent-based pull; Salt is agent-based (minions) and can also run agentless over SSH | 21 |
| **Anycast RP** | Several multicast RPs sharing one address, kept in sync (often with MSDP) | 10 |
| **AS_PATH** | BGP attribute listing every AS a route has crossed; used for loop prevention and path length | 7, 28 |
| **ASBR** | Autonomous System Boundary Router — injects external routes into OSPF | 6, 27 |
| **BFD** | Bidirectional Forwarding Detection — lightweight, sub-second link-failure detection for routing protocols | 25 |
| **Bidir PIM** | PIM variant that uses only shared trees, suited to many-to-many groups | 10 |
| **Border node** | SD-Access node connecting the fabric to external networks | 14 |
| **Catalyst Center** | Cisco's campus controller and assurance platform (formerly DNA Center) | 16, 20 |
| **CEF** | Cisco Express Forwarding — the FIB and adjacency table built from the RIB for fast forwarding | 5, 22 |
| **CIST / IST** | MST's Common and Internal Spanning Tree — instance 0, which carries BPDUs and interoperates with other regions | 4 |
| **Cluster list** | BGP attribute route reflectors add to prevent reflection loops | 28 |
| **Community** | BGP tag attached to routes to drive policy (no-export, no-advertise, custom values) | 28 |
| **Conditional debug** | A debug limited to one interface, address or peer, so it's safe on a busy box | 15, 32 |
| **CoPP** | Control Plane Policing — MQC policy that rate-limits traffic destined to the router's CPU | 17, 31 |
| **Data model** | A structured, machine-readable schema for configuration and state (see YANG) | 20 |
| **Datastore** | A NETCONF configuration store: running, candidate or startup | 20 |
| **DMVPN** | Dynamic Multipoint VPN — mGRE + NHRP (+ IPsec) giving hub-and-spoke with on-demand spoke-to-spoke tunnels | 30 |
| **DSCP** | 6-bit DiffServ field in the IP header used for QoS marking | 11 |
| **DUAL** | EIGRP's Diffusing Update Algorithm — computes loop-free successors and feasible successors | 5, 26 |
| **EAP** | Extensible Authentication Protocol — the 802.1X method family (EAP-TLS, PEAP, EAP-FAST) | 18 |
| **EAPOL** | EAP over LAN — how 802.1X carries EAP between the supplicant and the switch | 18 |
| **Edge node** | SD-Access access-layer switch where endpoints attach; acts as the VXLAN tunnel endpoint | 14 |
| **EEM** | Embedded Event Manager — on-box automation triggered by syslog, CLI, timers, tracking and other events | 21 |
| **EID / RLOC** | LISP's Endpoint Identifier (who) and Routing Locator (where) | 13 |
| **ERSPAN** | Encapsulated Remote SPAN — mirrored traffic carried in GRE across a routed network | 15 |
| **Feasible distance (FD)** | EIGRP's best total metric to a destination | 5, 26 |
| **Feasible successor** | EIGRP backup route that passes the feasibility condition (RD < FD) and is guaranteed loop-free | 5, 26 |
| **FIB** | Forwarding Information Base — the data-plane copy of the best routes | 22 |
| **Flexible NetFlow** | NetFlow with user-defined records (key and non-key fields), exporters and monitors | 15, 32 |
| **GRE** | Generic Routing Encapsulation — a simple tunnel that can carry any protocol, including multicast | 12 |
| **HSRP** | Cisco's Hot Standby Router Protocol — active/standby virtual gateway | 9 |
| **iACL** | Infrastructure ACL — an edge ACL protecting the network's own addresses | 17 |
| **iBGP / eBGP** | BGP between routers in the same AS / in different ASes | 7, 28 |
| **Idempotent** | An operation that gives the same result however many times it runs (PUT, DELETE; Ansible tasks) | 20, 21 |
| **IKE** | Internet Key Exchange — negotiates IPsec security associations (IKEv1, IKEv2) | 12, 30 |
| **Intent-based networking** | Declaring the desired outcome and letting a controller translate and verify it | 16 |
| **IP SLA** | Synthetic probes that measure reachability, delay and jitter, often driving tracked failover | 15, 32 |
| **ISE** | Identity Services Engine — Cisco's RADIUS/TACACS+ policy server for 802.1X, posture and TrustSec | 18 |
| **JSON** | JavaScript Object Notation — the text data format most network APIs use | 19, 20 |
| **LDP** | Label Distribution Protocol — distributes MPLS label bindings between neighbors | 29 |
| **LFIB** | Label Forwarding Information Base — the MPLS data-plane table | 29 |
| **LISP** | Locator/ID Separation Protocol — the SD-Access control plane | 13, 14 |
| **LLQ** | Low Latency Queuing — CBWFQ plus a policed strict-priority queue for voice | 11 |
| **Local preference** | BGP attribute (higher wins) that steers outbound traffic across an AS | 7, 28 |
| **MAB** | MAC Authentication Bypass — authenticating a non-802.1X device by its MAC address | 18 |
| **MACsec** | IEEE 802.1AE hop-by-hop Layer 2 encryption, keyed by MKA | 18 |
| **MED** | Multi-Exit Discriminator — BGP hint (lower wins) to a neighbor AS about which entry point to use | 7, 28 |
| **Method list** | Named or default ordered list of AAA sources (group, local, enable, none) applied to lines or services | 17, 31 |
| **mGRE** | Multipoint GRE — one tunnel interface reaching many peers | 30 |
| **MKA** | MACsec Key Agreement — the protocol that establishes MACsec keys | 18 |
| **MP-BGP** | Multiprotocol BGP — address families beyond IPv4 unicast (IPv6, VPNv4) | 28, 29 |
| **MPLS** | Multiprotocol Label Switching — forwarding on short labels instead of IP lookups | 29 |
| **MQC** | Modular QoS CLI — class-map, policy-map, service-policy | 11, 17 |
| **MSDP** | Multicast Source Discovery Protocol — shares active sources between RPs | 10 |
| **MST** | Multiple Spanning Tree (802.1s) — maps many VLANs onto a few spanning-tree instances | 4 |
| **NETCONF** | XML-over-SSH (TCP 830) protocol for model-driven configuration | 20 |
| **Next-hop-self** | Makes an iBGP speaker advertise itself as next hop, fixing unreachable eBGP next hops | 28 |
| **NGFW** | Next-generation firewall — stateful firewall plus application awareness, IPS, URL and malware filtering | 18 |
| **NHRP** | Next Hop Resolution Protocol — DMVPN's tunnel-to-public-address resolution | 30 |
| **NSF / SSO** | Non-Stop Forwarding / Stateful Switchover — keep forwarding while a supervisor or control plane fails over | 2 |
| **NSSA** | Not-So-Stubby Area — stub area that may still import externals as Type 7 LSAs | 6, 27 |
| **OAuth 2.0** | Token-based authorization framework for APIs; the client presents a short-lived bearer token | 18 |
| **OMP** | Overlay Management Protocol — SD-WAN's BGP-like control protocol between edges and controllers | 14 |
| **Orchestration** | Automating multi-step change across many devices (Ansible, Puppet, Chef, Salt) | 21 |
| **PBR** | Policy-Based Routing — forwarding decided by a route map instead of only the destination | 5, 25 |
| **PHP** | Penultimate Hop Popping — the second-to-last LSR removes the transport label | 29 |
| **PIM-SM** | Protocol Independent Multicast – Sparse Mode — explicit-join multicast routing via an RP | 10 |
| **Prefix list** | Ordered list matching prefixes and lengths (ge/le) for route filtering | 23 |
| **Privilege level** | IOS access level 0–15; 1 is user EXEC, 15 is full control | 17 |
| **PTP** | Precision Time Protocol (IEEE 1588) — sub-microsecond clock synchronisation | 8 |
| **RADIUS** | AAA protocol over UDP 1812/1813; combines authentication and authorization; encrypts only the password | 17, 31 |
| **RD / RT** | Route Distinguisher (makes VPN prefixes unique) / Route Target (controls VRF import and export) | 29 |
| **Redistribution** | Injecting routes from one routing source into another protocol | 24 |
| **Reported distance (RD)** | EIGRP: a neighbor's own metric to the destination (also called advertised distance) | 26 |
| **RESTCONF** | HTTPS-based, REST-style access to YANG-modelled data | 20 |
| **RIB** | Routing Information Base — the routing table | 22 |
| **Route map** | Ordered if/then policy (match/set) used by redistribution, BGP, PBR and more | 23 |
| **Route reflector** | iBGP speaker allowed to re-advertise iBGP routes (client routes to clients and non-clients, non-client routes to clients), removing the full mesh | 28 |
| **RP** | Rendezvous Point — PIM-SM's meeting point for sources and receivers | 10 |
| **RPF check** | Multicast loop check: accept a packet only on the interface towards its source (or RP) | 10 |
| **RSPAN** | Remote SPAN — mirrored traffic carried in a dedicated VLAN | 15 |
| **SD-Access** | Cisco's campus fabric: LISP control plane, VXLAN data plane, TrustSec policy plane | 14 |
| **SD-WAN Manager / Controller / Validator** | Catalyst SD-WAN's management, control and orchestration components (formerly vManage, vSmart, vBond) | 14, 20 |
| **SGACL** | Security Group ACL — a TrustSec policy written between source and destination SGTs | 18 |
| **SGT** | Security Group Tag — TrustSec's role-based label carried with traffic | 14, 18 |
| **SIA** | Stuck in Active — an EIGRP query that never got all its replies | 26 |
| **SSM** | Source-Specific Multicast — receivers join (S,G) directly; range 232/8; needs IGMPv3 | 10 |
| **StackWise Virtual** | Two Catalyst chassis acting as one logical switch for multichassis EtherChannel | 2 |
| **Stub router (EIGRP)** | Router that tells neighbors not to query it, bounding the query domain | 26 |
| **Successor** | EIGRP's best route to a destination | 5, 26 |
| **SXP** | SGT Exchange Protocol — carries IP-to-SGT mappings over TCP 64999 to devices that can't tag inline | 18 |
| **TACACS+** | Cisco AAA protocol over TCP 49; separates authentication, authorization and accounting; encrypts the whole payload | 17, 31 |
| **TLOC** | Transport Locator — an SD-WAN edge's attachment point to a transport (system IP, colour, encapsulation) | 14 |
| **TrustSec** | Cisco role-based segmentation using SGTs and SGACLs | 18 |
| **uRPF** | Unicast Reverse Path Forwarding — drops packets whose source isn't reachable back through the arrival interface (strict) or at all (loose) | 31 |
| **Variance** | EIGRP multiplier enabling unequal-cost load balancing across feasible successors | 5, 26 |
| **Virtual link** | OSPF logical link through a transit area to connect a stranded area to Area 0 | 27 |
| **VNI** | VXLAN Network Identifier — 24-bit segment ID (~16 million segments) | 13 |
| **VRF / VRF-Lite** | Virtual routing table on one router; VRF-Lite is VRFs without MPLS | 12, 25 |
| **VRRP** | Standards-based FHRP (master/backup) | 9 |
| **VTEP** | VXLAN Tunnel Endpoint — encapsulates and decapsulates VXLAN | 13 |
| **VTI** | Virtual Tunnel Interface — routable IPsec tunnel interface | 12 |
| **VXLAN** | L2-over-UDP (port 4789) overlay with 24-bit segment IDs | 13 |
| **Weight** | Cisco-only, router-local BGP attribute; highest wins, checked first | 7, 28 |
| **XSRF token** | Anti-cross-site-request-forgery token SD-WAN Manager requires on POST/PUT/DELETE calls | 20 |
| **YANG** | Data modelling language describing device configuration and state | 20 |

---

## 🎉 That's Both Exams

ENCOR proves you understand the whole enterprise network. ENARSI proves you can find the fault in it. The habit that carries you through both is the one from the CCNA guide: refuse to accept *that* something works until you know *why*. Book ENCOR, lab everything, explain it out loud, and come back to Chapter 33 when you're ready for the next one. 🌐
