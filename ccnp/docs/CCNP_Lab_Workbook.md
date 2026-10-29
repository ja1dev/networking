# 🧪 CCNP Lab Workbook

> **What this is:** the hands-on companion to the CCNP Study Guide. There are 22
> labs: 11 for ENCOR 350-401 v1.2 and 11 for ENARSI 300-410 v1.1. CCNA labs
> asked "can you make it work?" These ask the CCNP question: "can you make it
> work *the way the design says*, prove it, and fix it when someone breaks it?"
> ENARSI is mostly a troubleshooting exam, so every lab ends with faults to
> inject, and the last lab is nothing but faults.

> **How to use it:** each lab names the Study Guide sections it exercises. Read
> them first, then build the lab **without opening the solution**. Tick the
> task and verification boxes as you go; the app remembers them. When a box
> won't tick honestly, that's the lesson. The **Break it** list at the end of
> every lab is the real exam prep: break one thing at a time, look at the
> symptoms *before* you look at the config, and name the cause from the
> `show` output alone.

> **Platform:** written for your own **EVE-NG** server. **IOSv** (`vios`) for
> routers, **IOSvL2** (`viosl2`) for switches, **CSR1000v** wherever a lab
> needs IOS XE (the NETCONF/RESTCONF lab), and **VPCS** for hosts. Where a lab
> needs a real server (syslog, SNMP, RADIUS, Python), it uses either a small
> Linux node or your own laptop reached through EVE-NG's management cloud.

---

## 📖 The Labs

| # | Lab | Exam | Guide chapters |
|---|-----|------|----------------|
| 1 | MST: two instances, two roots | ENCOR | 4 |
| 2 | EtherChannel & LACP tuning | ENCOR | 3 |
| 3 | Multi-area OSPF: summarise & filter | ENCOR | 6 |
| 4 | eBGP & iBGP | ENCOR | 7, 28 |
| 5 | HSRP, VRRP & GLBP side by side | ENCOR | 9 |
| 6 | NAT & PAT at CCNP depth | ENCOR | 8 |
| 7 | NTP, syslog & SNMPv3 | ENCOR | 8, 15 |
| 8 | SPAN, RSPAN & IP SLA | ENCOR | 15 |
| 9 | QoS: classify, mark, police | ENCOR | 11 |
| 10 | NETCONF & RESTCONF on a CSR1000v | ENCOR | 19, 20 |
| 11 | EEM applets | ENCOR | 21 |
| 12 | EIGRP named mode, stubs & summaries | ENARSI | 26 |
| 13 | OSPF stub, NSSA & a virtual link | ENARSI | 27 |
| 14 | Mutual redistribution without loops | ENARSI | 23, 24 |
| 15 | BGP path manipulation | ENARSI | 28 |
| 16 | PBR with IP SLA tracking | ENARSI | 25, 32 |
| 17 | VRF-lite | ENARSI | 25 |
| 18 | GRE over IPsec (IKEv2) | ENARSI | 12 |
| 19 | DMVPN Phase 3 | ENARSI | 30 |
| 20 | AAA with RADIUS fallback & uRPF | ENARSI | 17, 31 |
| 21 | DHCPv6 & IPv6 first-hop security | ENARSI | 31, 32 |
| 22 | Final: the multi-fault troubleshooting day | ENARSI | 22 + everything |

---

## 🧰 Before Lab 1: Setting Up EVE-NG for CCNP

**Images.**

| Role | EVE-NG template | Interfaces you'll see | Notes |
|------|-----------------|------------------------|-------|
| Router | IOSv (`vios`) | Gi0/0–Gi0/3 (add more in node settings) | Has crypto (IPsec, DMVPN), EEM, IP SLA, MQC |
| Switch | IOSvL2 (`viosl2`) | Gi0/0–0/3, Gi1/0–1/3, ... | MST, LACP, SPAN/RSPAN, most first-hop security |
| IOS XE router | CSR1000v (`csr1000vng`) | GigabitEthernet1–4 | Needed for NETCONF/RESTCONF; give it 4 GB RAM and 5 minutes to boot |
| Host | VPCS | eth0 | `ip`, `ping`, `trace`, `ip auto` (IPv6 SLAAC) |
| Server (optional) | Any Linux image, or your laptop through Cloud0 | eth0 | syslog, SNMP manager, FreeRADIUS, Python |

**Reaching the lab from your laptop.** In EVE-NG, add a **Network** object of
type **Management(Cloud0)**. Anything you connect to it sits on the same
bridge as the EVE-NG server's own interface, so it can reach (and be reached
from) your home LAN. Labs 7, 10 and 20 use this to talk to real tools on your
laptop. Give the device a static address in your LAN range that nothing else
uses (or `ip address dhcp`).

**CCNP habits on top of the CCNA ones:**

1. **Build, prove, then break.** Every lab is three passes: build it to the
   spec, prove each requirement with a `show` command, then break it on
   purpose. The breaking pass is where ENARSI marks come from.
2. **Read before you `debug`.** A `show` command answers 90% of faults. If
   you do debug, set `logging buffered 64000 debugging`,
   `no logging console`, and read `show logging`. IOSv survives a noisy
   debug; production routers don't.
3. **Save configs when a lab works** (`wr` everywhere, then EVE-NG's *Export
   all CFGs*). Several labs start from an earlier lab's finished state.
4. **Change one thing at a time.** When you inject a fault, inject exactly
   one. Two faults at once teach you nothing about either.
5. **Some features need a newer image.** Where IOSv or IOSvL2 rejects a
   command (it happens with a few IPv6 first-hop security and QoS options),
   the lab tells you. The fix is a CSR1000v or Catalyst 9000v node, not a
   workaround.

**Addressing conventions used everywhere:** a link between Rx and Ry is
`10.0.xy.0/24` with Rx at `.x` and Ry at `.y` (so R1–R2 is 10.0.12.0/24, R1
is .1, R2 is .2). Router loopback0 is `x.x.x.x/32` and doubles as the router
ID. Labs that need "public" space use the documentation ranges 192.0.2.0/24,
198.51.100.0/24 and 203.0.113.0/24.

---

# Lab 1 — MST: Two Instances, Two Roots

**Guide sections:** 4.1–4.6 · **Time:** ~50 min · **Diagram:** the MST regions figure in 4.3

**Why this lab:** PVST+ runs one spanning tree per VLAN, which is wasteful
when 200 VLANs all want the same two topologies. MST lets you say "these
VLANs follow tree 1, those follow tree 2", so both distribution switches
carry traffic. The catch: every switch must agree on the region's name,
revision and VLAN map, and a mismatch fails *silently*. This lab makes you
build it, prove the load sharing, and then see the silent failure.

## Topology

```
          Gi0/0          Gi0/0
   DSW1 ───────────────────── DSW2
  Gi0/1 \                   / Gi0/1
         \                 /
     Gi0/0 \             / Gi0/1
              ASW1
         Gi1/0 |   | Gi1/1
              PC1  PC2
```

| Device | Image | Links |
|--------|-------|-------|
| DSW1 | IOSvL2 | Gi0/0 → DSW2 Gi0/0, Gi0/1 → ASW1 Gi0/0 |
| DSW2 | IOSvL2 | Gi0/0 → DSW1 Gi0/0, Gi0/1 → ASW1 Gi0/1 |
| ASW1 | IOSvL2 | Gi0/0 → DSW1, Gi0/1 → DSW2, Gi1/0 → PC1, Gi1/1 → PC2 |
| PC1, PC2 | VPCS | eth0 → ASW1 |

All three inter-switch links are 802.1Q trunks.

## Addressing

| Device | Interface | VLAN | IP |
|--------|-----------|------|-----|
| DSW1 | Vlan99 | 99 (mgmt) | 10.1.99.1/24 |
| DSW2 | Vlan99 | 99 | 10.1.99.2/24 |
| ASW1 | Vlan99 | 99 | 10.1.99.3/24 |
| PC1 | eth0 | 10 | 10.1.10.11/24 |
| PC2 | eth0 | 30 | 10.1.30.11/24 |

VLANs: 10, 20, 30, 40, 99. **Instance 1** = VLANs 10, 20 (root DSW1).
**Instance 2** = VLANs 30, 40 (root DSW2). Everything else stays in the IST
(instance 0), root DSW1.

## Tasks

1. Create VLANs 10, 20, 30, 40 and 99 on all three switches, make the three
   inter-switch links static 802.1Q trunks with DTP off (`switchport nonegotiate`),
   and put PC1 in VLAN 10 and PC2 in VLAN 30.
2. Before enabling MST, run `show spanning-tree summary` and note the mode.
   Then configure MST on all three switches: region name `CAMPUS`,
   revision `1`, instance 1 = VLANs 10,20, instance 2 = VLANs 30,40. Use
   `show pending` before you exit the MST sub-mode.
3. Make DSW1 root for MST0 and MST1 (priority 24576) and secondary for MST2
   (28672). Make DSW2 the mirror image.
4. Predict, before you look: on ASW1, which uplink forwards for MST1 and which
   for MST2? Then prove it with `show spanning-tree mst 1` and `mst 2`.
5. Configure the two PC ports on ASW1 as edge ports with BPDU guard
   (`spanning-tree portfast edge` and `spanning-tree bpduguard enable`).
6. Put root guard on DSW1 Gi0/1 and DSW2 Gi0/1 (the ports facing the access
   layer). Explain in one sentence what it protects.
7. Change the MST2 port cost on ASW1 Gi0/1 to 200000 and watch the MST2
   topology move, while MST1 doesn't. Then remove the change.

## Verification checklist

- `show spanning-tree mst configuration` is identical on all three switches:
  name `[CAMPUS]`, revision 1, instance 1 → 10,20, instance 2 → 30,40
- `show spanning-tree mst 1` on DSW1 says `Root this switch for MST1`; on
  DSW2, `show spanning-tree mst 2` says the same for MST2
- On ASW1: Gi0/0 is `Root FWD` and Gi0/1 is `Altn BLK` for MST1, and the
  opposite for MST2. That's load sharing.
- `show spanning-tree interface Gi1/0 detail` on ASW1 shows the port as edge
  with BPDU guard enabled
- `show spanning-tree mst` shows no port with `Bound` in the Type column
  (a boundary would mean a region mismatch)

<details><summary>Solution</summary>

All three switches (VLANs, trunks, region):

```
vlan 10,20,30,40,99
interface range Gi0/0 - 1
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport nonegotiate
!
spanning-tree mode mst
spanning-tree mst configuration
 name CAMPUS
 revision 1
 instance 1 vlan 10,20
 instance 2 vlan 30,40
 show pending
 exit
```

Root placement:

```
DSW1(config)# spanning-tree mst 0-1 priority 24576
DSW1(config)# spanning-tree mst 2 priority 28672
DSW1(config)# interface Gi0/1
DSW1(config-if)# spanning-tree guard root
!
DSW2(config)# spanning-tree mst 0-1 priority 28672
DSW2(config)# spanning-tree mst 2 priority 24576
DSW2(config)# interface Gi0/1
DSW2(config-if)# spanning-tree guard root
```

Access ports and the cost test on ASW1:

```
ASW1(config)# interface Gi1/0
ASW1(config-if)# switchport mode access
ASW1(config-if)# switchport access vlan 10
ASW1(config-if)# spanning-tree portfast edge
ASW1(config-if)# spanning-tree bpduguard enable
ASW1(config)# interface Gi1/1
ASW1(config-if)# switchport mode access
ASW1(config-if)# switchport access vlan 30
ASW1(config-if)# spanning-tree portfast edge
ASW1(config-if)# spanning-tree bpduguard enable
!
ASW1(config)# interface Gi0/1
ASW1(config-if)# spanning-tree mst 2 cost 200000     ! task 7
ASW1(config-if)# no spanning-tree mst 2 cost 200000  ! undo
```

**Why the prediction works:** ASW1 picks its root port per instance by the
lowest cost to *that instance's* root. For MST1 the root is DSW1, one hop
away through Gi0/0. For MST2 the root is DSW2, one hop away through Gi0/1.
So each uplink forwards for one instance and blocks for the other.

**Why the cost change in task 7 only moves MST2:** costs are per instance.
With Gi0/1's MST2 cost at 200000, the direct path to DSW2 costs 200000,
while the two-hop path through DSW1 costs 20000 + 20000 = 40000. The cheaper
path wins, so for MST2 Gi0/0 becomes the root port and Gi0/1 blocks. MST1
never looked at that number, so it doesn't move.

**Root guard** on the distribution downlinks means "if a superior BPDU ever
arrives from the access layer, block the port (`Root Inc`) rather than let a
rogue or misconfigured switch become root."
</details>

## Break it

Inject one at a time, look at the symptoms first, then fix:

1. On ASW1 only, change the MST revision to `2`.
2. On DSW2 only, map VLAN 40 to instance 1 instead of 2.
3. On ASW1, put `spanning-tree mode rapid-pvst` back.
4. Disconnect PC2 and connect a spare IOSvL2 switch to ASW1 Gi1/1 instead.

<details><summary>Break it — what you should see</summary>

1. **Revision mismatch:** ASW1 is now its own region. Its uplinks show
   `Bound(RSTP)` in `show spanning-tree mst`, and on a boundary every MSTI
   copies the CIST role. Load sharing is gone: both instances use the same
   uplink. Nothing is logged. Proof: compare `show spanning-tree mst
   configuration digest` on both ends.
2. **Mapping mismatch:** the same silent split, this time between DSW1 and
   DSW2. The name and revision match, but the digest doesn't. This is the
   one people miss, because the first two lines of the config look right.
3. **PVST+ neighbour:** DSW1 Gi0/1 and DSW2 Gi0/1 show `Bound(PVST)`. MST runs PVST
   simulation toward ASW1, and the CIST root must stay inside the MST region
   or ports go into `PVST Inc` (inconsistent) state.
4. **BPDU guard:** the moment the switch sends a BPDU, Gi1/1 goes
   err-disabled (`%SPANTREE-2-BLOCK_BPDUGUARD`). Recover with
   `shutdown` / `no shutdown` after removing the switch.
</details>

---

# Lab 2 — EtherChannel & LACP Tuning

**Guide sections:** 3.5–3.9 · **Time:** ~45 min · **Diagram:** the native VLAN mismatch figure in 3.2

**Why this lab:** at CCNA you bundled two links and called it done. At CCNP
you control *which* links carry traffic, how fast a dead member is noticed,
who makes the decisions, and how a bundle fails when the two ends disagree.
Think of LACP as two shift managers agreeing on who works today: the one with
the better (lower) system priority writes the rota, using port priorities to
decide who's on and who's on standby.

## Topology

```
        Gi0/0 ═══════ Gi0/0
        Gi0/1 ═══════ Gi0/1      Po1: L2 trunk, 4 members, max 2 active
 DSW1   Gi0/2 ═══════ Gi0/2   DSW2
        Gi0/3 ═══════ Gi0/3
        Gi1/0 ═══════ Gi1/0      Po2: L3 routed bundle, 2 members
        Gi1/1 ═══════ Gi1/1
```

| Device | Image | Links |
|--------|-------|-------|
| DSW1 | IOSvL2 | Gi0/0–0/3 and Gi1/0–1/1 → the same ports on DSW2 |
| DSW2 | IOSvL2 | as above |

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| DSW1 | Port-channel2 | 10.0.12.1/24 |
| DSW2 | Port-channel2 | 10.0.12.2/24 |
| DSW1 | Vlan10 | 10.1.10.1/24 |
| DSW2 | Vlan10 | 10.1.10.2/24 |

## Tasks

1. Build **Po1** from Gi0/0–0/3 with LACP (DSW1 `active`, DSW2 `passive`) as an
   802.1Q trunk allowing VLANs 10, 20 and 99 only. Configure trunk settings on
   the **port-channel interface**, not the members.
2. Prove all four members are bundled (`P`) before you tune anything.
3. Make DSW1 the LACP decision maker: `lacp system-priority 100` on DSW1
   (default is 32768 on DSW2).
4. Limit Po1 to two active members with `lacp max-bundle 2`, and use
   `lacp port-priority` on DSW1 so Gi0/2 and Gi0/3 are the active pair
   (lower is better).
5. Turn on LACP fast rate (`lacp rate fast`) on all Po1 members on both
   switches, and explain what changes: LACPDUs every 1 second instead of 30,
   so a silently dead member is dropped in ~3 seconds instead of ~90. (Some
   IOSvL2 builds don't accept `lacp rate`; if yours refuses it, the command
   and the concept are what the exam tests, and a Catalyst 9000v node accepts it.)
6. Build **Po2** from Gi1/0–1/1 as a Layer 3 EtherChannel (LACP active both
   ends) with the addresses above. Remember `no switchport` on the members
   *and* the port-channel.
7. Set the load-balancing method to `src-dst-ip` on both switches and check it.
8. Shut DSW1 Gi0/2 and watch a hot-standby member take its place. Then bring
   it back.

## Verification checklist

- `show etherchannel summary`: `Po1(SU)` with Gi0/2 and Gi0/3 `(P)` and Gi0/0
  and Gi0/1 `(H)` (hot-standby); `Po2(RU)` with both members `(P)`
- `show lacp sys-id` on DSW1 shows priority 100; `show lacp neighbor` on DSW1
  shows the partner's flags as `FP` or `FA` (F = fast LACPDUs) after task 5
- `show interfaces trunk` lists Po1, not the individual members, with VLANs
  10,20,99 allowed
- `ping 10.0.12.2` from DSW1 succeeds across Po2
- `show etherchannel load-balance` reports `src-dst-ip`
- After shutting Gi0/2, one of the `(H)` ports becomes `(P)` within seconds

<details><summary>Solution</summary>

Both switches (DSW2 uses `mode passive` on Po1 members):

```
vlan 10,20,99
interface range Gi0/0 - 3
 channel-group 1 mode active          ! DSW2: mode passive
 lacp rate fast
interface Port-channel1
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,20,99
 switchport nonegotiate
!
interface range Gi1/0 - 1
 no switchport
 channel-group 2 mode active
interface Port-channel2
 no switchport
 ip address 10.0.12.1 255.255.255.0   ! DSW2: .2
!
port-channel load-balance src-dst-ip
```

DSW1 only (the decision maker):

```
DSW1(config)# lacp system-priority 100
DSW1(config)# interface range Gi0/2 - 3
DSW1(config-if-range)# lacp port-priority 100
DSW1(config)# interface Port-channel1
DSW1(config-if)# lacp max-bundle 2
```

**Why the port priorities only count on DSW1:** both switches have opinions
about which ports should be active, so LACP needs a tie-breaker. The switch
with the lower system priority (then the lower MAC) wins, and *its* port
priorities choose the active members. If you set port priorities on DSW2 and
nothing changes, that's the reason.

**Why configure the port-channel, not the members:** the port-channel's
config is pushed to the members. If you configure members directly and they
end up different from each other, the mismatched ones are suspended (`s`).
</details>

## Break it

1. Set DSW2's Po1 members to `channel-group 1 mode on` (DSW1 stays LACP).
2. Put both ends in `mode passive`.
3. On DSW2 only, change Gi0/3's trunk allowed list to `10,20`.
4. On DSW2, change the Po1 native VLAN to 99 (DSW1 stays on 1).

<details><summary>Break it — what you should see</summary>

1. **`on` vs LACP:** DSW2 bundles unconditionally, DSW1 waits for LACPDUs
   that never come. DSW1's members show `(I)` (stand-alone) or `(s)`, and
   the EtherChannel misconfig guard may err-disable DSW2's Po1
   (`%PM-4-ERR_DISABLE: channel-misconfig`). Fix: same protocol both ends.
2. **passive/passive:** nobody starts the conversation. No bundle, members
   show `(I)`, `show lacp neighbor` is empty.
3. **One member's settings differ:** that member shows `(s)` suspended.
   `show etherchannel 1 detail` or the log names the mismatch. Fix by
   configuring the port-channel, which re-applies to every member.
4. **Native VLAN mismatch:** the bundle stays up, but CDP logs
   `%CDP-4-NATIVE_VLAN_MISMATCH` and untagged traffic leaks between VLAN 1
   and VLAN 99 (guide 3.2). The bundle being "up" is not proof the trunk is
   right.
</details>

---

# Lab 3 — Multi-Area OSPF: Summarise & Filter

**Guide sections:** 6.1–6.7, 6.9 · **Time:** ~60 min · **Diagram:** the multi-area OSPF figure in 6.1

**Why this lab:** areas exist to keep bad news local. A link flapping in area
1 should cause SPF runs in area 1 only; the rest of the network should hear,
at most, "there's a summary over there". You'll build three areas, read which
LSA types cross which border, summarise at an ABR, and filter a route out of
one area.

## Topology

```
 [Area 1]          [Area 0]              [Area 2]
  R1 ───── R2 ───────── R3 ───────── R4 ───── R5
     Gi0/0  Gi0/0  Gi0/1  Gi0/0 Gi0/1  Gi0/0 Gi0/1  Gi0/0
```

| Device | Image | Role | Links |
|--------|-------|------|-------|
| R1 | IOSv | Internal, area 1 | Gi0/0 → R2 Gi0/0 |
| R2 | IOSv | ABR 0/1 | Gi0/0 → R1, Gi0/1 → R3 Gi0/0 |
| R3 | IOSv | Backbone, default-route originator | Gi0/0 → R2, Gi0/1 → R4 Gi0/0 |
| R4 | IOSv | ABR 0/2 | Gi0/0 → R3, Gi0/1 → R5 Gi0/0 |
| R5 | IOSv | Internal, area 2 | Gi0/0 → R4 |

## Addressing

| Device | Interface | IP | Area |
|--------|-----------|-----|------|
| R1 | Gi0/0 | 10.0.12.1/24 | 1 |
| R1 | Lo0 | 1.1.1.1/32 | 1 |
| R1 | Lo1–Lo4 | 172.16.0.1/24, 172.16.1.1/24, 172.16.2.1/24, 172.16.3.1/24 | 1 |
| R2 | Gi0/0 / Gi0/1 | 10.0.12.2/24 / 10.0.23.2/24 | 1 / 0 |
| R2 | Lo0 | 2.2.2.2/32 | 0 |
| R3 | Gi0/0 / Gi0/1 | 10.0.23.3/24 / 10.0.34.3/24 | 0 |
| R3 | Lo0 | 3.3.3.3/32 | 0 |
| R4 | Gi0/0 / Gi0/1 | 10.0.34.4/24 / 10.0.45.4/24 | 0 / 2 |
| R4 | Lo0 | 4.4.4.4/32 | 0 |
| R5 | Gi0/0 | 10.0.45.5/24 | 2 |
| R5 | Lo0 | 5.5.5.5/32 | 2 |

## Tasks

1. Configure OSPF process 1 on every router with the router ID equal to
   Lo0, using **interface-level** `ip ospf 1 area X` commands rather than
   `network` statements.
2. Every transit link is a two-router Ethernet: set `ip ospf network
   point-to-point` on both ends so there's no DR/BDR election and no type 2
   LSA. Make all loopbacks passive (`passive-interface default` is fine if
   you un-passive the transit links).
3. Make R1's four 172.16.x.0/24 loopbacks advertise as /24 (point-to-point
   network type on the loopbacks), then confirm R5 sees four O IA routes.
4. Summarise them at the ABR R2 into a single **172.16.0.0/22** and confirm R5
   now has one O IA route. Find the discard route R2 installed and explain
   why it exists.
5. Have R3 originate a default route into OSPF with `default-information
   originate always`. Which LSA type carries it, and how does R5 see it?
6. On R4, stop area 2 from learning 10.0.12.0/24 (the R1–R2 link) using a
   prefix list and `area 2 filter-list prefix ... in`, while everything else
   still arrives.
7. Read the LSDB on R5 (`show ip ospf database`) and name every LSA type
   present and who originated it.

## Verification checklist

- `show ip ospf neighbor` on R2, R3 and R4: every neighbour `FULL/  -` (the dash
  means no DR/BDR: point-to-point)
- `show ip route ospf` on R5 after task 4: a single
  `O IA 172.16.0.0/22` route, and no 172.16.x.0/24 routes
- `show ip route ospf` on R2 includes `O 172.16.0.0/22 is a summary, ...,
  Null0` (the summary discard route)
- R5 has `O*E2 0.0.0.0/0` via R4 after task 5
- After task 6, R5 has no 10.0.12.0/24 route but still pings 1.1.1.1
- `show ip ospf database summary` on R5 lists type 3 LSAs advertised by
  4.4.4.4 only (the ABR for area 2)

<details><summary>Solution</summary>

Pattern for every router (R2 shown; others follow the addressing table):

```
R2(config)# router ospf 1
R2(config-router)# router-id 2.2.2.2
R2(config-router)# passive-interface default
R2(config-router)# no passive-interface Gi0/0
R2(config-router)# no passive-interface Gi0/1
R2(config-router)# area 1 range 172.16.0.0 255.255.252.0    ! task 4
R2(config)# interface Gi0/0
R2(config-if)# ip ospf 1 area 1
R2(config-if)# ip ospf network point-to-point
R2(config)# interface Gi0/1
R2(config-if)# ip ospf 1 area 0
R2(config-if)# ip ospf network point-to-point
R2(config)# interface Lo0
R2(config-if)# ip ospf 1 area 0
```

R1's LAN loopbacks:

```
R1(config)# interface range Lo1 - 4
R1(config-if-range)# ip ospf 1 area 1
R1(config-if-range)# ip ospf network point-to-point
```

R3 default and R4 filter:

```
R3(config)# router ospf 1
R3(config-router)# default-information originate always
!
R4(config)# ip prefix-list NO-R1R2 seq 5 deny 10.0.12.0/24
R4(config)# ip prefix-list NO-R1R2 seq 10 permit 0.0.0.0/0 le 32
R4(config)# router ospf 1
R4(config-router)# area 2 filter-list prefix NO-R1R2 in
```

**Answers to the "why" questions:**

- **The Null0 route (task 4):** R2 now advertises "send anything in
  172.16.0.0/22 to me". If one /24 inside that range disappears, packets for
  it would otherwise follow R2's default route back toward R3, and loop. The
  discard route makes R2 drop them instead.
- **The default (task 5):** `default-information originate` creates a
  **type 5** LSA, so R5 sees it as `O*E2`. `always` means "even if I have no
  default route myself"; without it R3 would need a default in its own
  table first.
- **The filter (task 6):** `filter-list ... in` filters **type 3** LSAs as the
  ABR creates them *into* area 2. It's the right tool because inside an area
  every router must have an identical LSDB; you can't filter there, only at
  the border. The permit-all line matters: a prefix list ends in an implicit
  deny, so without it area 2 would lose every inter-area route.
- **R5's LSDB (task 7):** type 1 (router LSAs from R4 and R5), type 3 (summary
  LSAs from R4 for every area-0 and area-1 prefix), type 4 (ASBR summary from
  R4, telling area 2 how to reach R3 the ASBR) and type 5 (R3's default).
  No type 2, because every link is point-to-point.
</details>

## Break it

1. Change R4 Gi0/1 to `ip ospf 1 area 0` (one side of the R4–R5 link only).
2. On R2, set `ip ospf network broadcast` on Gi0/1 only (R3 stays point-to-point).
3. On R2, change the summary to `area 0 range 172.16.0.0 255.255.252.0`.
4. Remove the `permit 0.0.0.0/0 le 32` line from R4's prefix list.

<details><summary>Break it — what you should see</summary>

1. **Area mismatch:** no adjacency. R5 logs
   `%OSPF-4-ERRRCV: Received invalid packet: mismatched area ID`. Neighbours
   must agree on the area of the link.
2. **Network-type mismatch:** the neighbours reach FULL (hello and dead
   timers still match on Ethernet), but the routes from across that link
   don't install, because one side describes the link as transit and the
   other as point-to-point. `show ip ospf database router` shows the
   inconsistent link descriptions. This is the "sneaky mismatch" in 6.7.
3. **Wrong area in `area range`:** the range must name the area the routes
   *come from* (area 1). With area 0, nothing is summarised and R5 sees four
   /24s again.
4. **Implicit deny:** area 2 loses every inter-area route; R5 can only reach
   area 2 and (via the type 5) the default. Ping 1.1.1.1 still works, through
   the default, which is exactly why this fault hides well.
</details>

---

# Lab 4 — eBGP & iBGP

**Guide sections:** 7.1–7.9, 28.1–28.3 · **Time:** ~70 min · **Diagram:** the AS_PATH loop prevention figure in 7.1

**Why this lab:** BGP doesn't discover neighbours, doesn't pick the shortest
path, and doesn't rewrite the next hop inside your AS. Each of those surprises
breaks first-time builds in a predictable way. Here you build a small
enterprise AS with two border routers talking iBGP, each connected to a
different provider, and fix the next-hop problem the way the real world does.

## Topology

```
          AS 65100                    AS 65200
            R3 ──────────────────────── R4
       Gi0/0 |  Gi0/1            Gi0/1  | Gi0/0
             |                          |
       Gi0/1 |        AS 65001          | Gi0/1
            R1 ──────────────────────── R2
                Gi0/0             Gi0/0
```

| Device | Image | AS | Links |
|--------|-------|----|-------|
| R1 | IOSv | 65001 | Gi0/0 → R2 Gi0/0, Gi0/1 → R3 Gi0/0 |
| R2 | IOSv | 65001 | Gi0/0 → R1 Gi0/0, Gi0/1 → R4 Gi0/0 |
| R3 | IOSv | 65100 (ISP A) | Gi0/0 → R1, Gi0/1 → R4 Gi0/1 |
| R4 | IOSv | 65200 (ISP B) | Gi0/0 → R2, Gi0/1 → R3 |

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| R1 | Gi0/0 / Gi0/1 | 10.0.12.1/24 / 192.0.2.1/30 |
| R1 | Lo0 / Lo10 | 1.1.1.1/32 / 10.1.1.1/24 (enterprise LAN) |
| R2 | Gi0/0 / Gi0/1 | 10.0.12.2/24 / 192.0.2.5/30 |
| R2 | Lo0 / Lo10 | 2.2.2.2/32 / 10.1.2.1/24 |
| R3 | Gi0/0 / Gi0/1 | 192.0.2.2/30 / 192.0.2.9/30 |
| R3 | Lo10 | 198.51.100.1/24 |
| R4 | Gi0/0 / Gi0/1 | 192.0.2.6/30 / 192.0.2.10/30 |
| R4 | Lo10 | 203.0.113.1/24 |

## Tasks

1. Run OSPF area 0 between R1 and R2 only (Gi0/0 and Lo0). This is the IGP that
   lets iBGP peers find each other's loopbacks. Don't run OSPF toward the ISPs.
2. Configure eBGP R1↔R3, R2↔R4 and R3↔R4 on the directly connected addresses.
   Protect R1↔R3 with an MD5 password (`neighbor ... password`).
3. Configure iBGP between R1 and R2 **using loopbacks** (`update-source Lo0`).
   Explain why loopbacks and not the physical addresses.
4. Advertise each ISP's Lo10 with a `network` statement on R3 and R4.
   Advertise the enterprise's LANs as a single **10.1.0.0/16** from R1 and R2:
   create the matching route with `ip route 10.1.0.0 255.255.0.0 Null0` and
   use `network 10.1.0.0 mask 255.255.0.0`.
5. Look at `show ip bgp` on R2 *before* fixing anything: R3's 198.51.100.0/24
   arrives from R1 but isn't best (`>` missing) or isn't in the routing table.
   Find out why from the next-hop column.
6. Fix it with `next-hop-self` on both iBGP neighbour statements.
7. Use `show ip bgp neighbors 1.1.1.1` on R2 to find the session's state,
   hold time and the number of prefixes received.

## Verification checklist

- `show ip bgp summary` on R1 shows two neighbours, 2.2.2.2 (iBGP) and
  192.0.2.2 (eBGP), each with a **number** in `State/PfxRcd`, not `Idle` or
  `Active`
- `show ip bgp` on R2 lists 198.51.100.0/24 with `*>i` and next hop 1.1.1.1
  (after `next-hop-self`), plus a second path via R4 (AS path `65200 65100`)
- R3 sees `10.1.0.0/16` from AS 65001 and nothing more specific
- `ping 198.51.100.1 source Lo10` from R2 succeeds
- `show ip bgp neighbors 192.0.2.2 | include password|BGP state` on R1 shows
  the session is MD5-protected and Established

<details><summary>Solution</summary>

R1 (R2 mirrors it with its own addresses and neighbour R4 192.0.2.6 in AS 65200):

```
router ospf 1
 router-id 1.1.1.1
 network 10.0.12.0 0.0.0.255 area 0
 network 1.1.1.1 0.0.0.0 area 0
!
ip route 10.1.0.0 255.255.0.0 Null0
!
router bgp 65001
 bgp router-id 1.1.1.1
 bgp log-neighbor-changes
 neighbor 2.2.2.2 remote-as 65001
 neighbor 2.2.2.2 update-source Loopback0
 neighbor 2.2.2.2 next-hop-self
 neighbor 192.0.2.2 remote-as 65100
 neighbor 192.0.2.2 password BGPkey1
 network 10.1.0.0 mask 255.255.0.0
```

R3 (R4 is similar, AS 65200, network 203.0.113.0):

```
router bgp 65100
 bgp router-id 3.3.3.3
 neighbor 192.0.2.1 remote-as 65001
 neighbor 192.0.2.1 password BGPkey1
 neighbor 192.0.2.10 remote-as 65200
 network 198.51.100.0 mask 255.255.255.0
```

**Why loopbacks for iBGP (task 3):** a loopback never goes down while the
router is up. If R1 and R2 had two physical paths between them, a session
built on loopbacks survives either link failing, because the IGP finds the
other path. BGP itself never finds a path to its neighbour; that's always the
IGP's job, which is why task 1 comes first.

**Why the route wasn't usable (task 5):** eBGP sets the next hop to the
sender's address, so R3's prefix arrives at R1 with next hop 192.0.2.2. iBGP
**does not change the next hop**, so R2 receives it with next hop 192.0.2.2
too, and R2 has no route to 192.0.2.0/30 (it isn't in OSPF). An unreachable
next hop makes the path invalid. `next-hop-self` makes R1 advertise itself
(1.1.1.1) as the next hop, which R2 reaches through OSPF. The alternative
fix, advertising the ISP link subnets into OSPF, works too, but drags
external addressing into your IGP.

**Why the Null0 route (task 4):** `network` in BGP doesn't enable anything on
interfaces; it says "advertise this prefix *if exactly this prefix* is in my
routing table". The static to Null0 creates that exact /16, and also
discards traffic to any unused part of it instead of bouncing it back to the
ISP.
</details>

## Break it

1. On R2, remove `update-source Loopback0` from the iBGP neighbour.
2. Change R1's MD5 password to `BGPkey2` (R3 unchanged).
3. On R1, change `network 10.1.0.0 mask 255.255.0.0` to `network 10.1.0.0`.
4. Remove the OSPF `network 2.2.2.2 0.0.0.0 area 0` line on R2.

<details><summary>Break it — what you should see</summary>

1. **Wrong source:** R2 sources its iBGP packets from 10.0.12.2, but R1 expects
   the peer to be 2.2.2.2, so R1 rejects the connection. `show ip bgp summary`
   shows `Active` or `Idle` on both ends. One end with `update-source` isn't
   enough; both must use the address the other configured.
2. **MD5 mismatch:** the session drops and stays down. R3 logs
   `%TCP-6-BADAUTH: Invalid MD5 digest from 192.0.2.1`. The log tells you
   exactly which neighbour.
3. **Classful `network`:** without `mask`, IOS assumes the classful mask
   (10.0.0.0/8 for a 10.x network) and looks for an exact 10.1.0.0/8 match,
   which doesn't exist. The prefix silently disappears from R3's table.
4. **iBGP peer unreachable:** R1 no longer has a route to 2.2.2.2, the iBGP
   session drops after the hold time (180 s by default), and both routers
   lose each other's paths. Proof: `show ip route 2.2.2.2` on R1 is empty.
</details>

---

# Lab 5 — HSRP, VRRP & GLBP Side by Side

**Guide sections:** 9.1–9.8, 2.4 · **Time:** ~60 min · **Diagram:** the FHRP load-sharing figure in 9.4

**Why this lab:** hosts get one default gateway and never ask twice. All
three First Hop Redundancy Protocols solve that by inventing a virtual router
that two real routers take turns being. They differ in who's in charge, who
forwards, and what happens when the original router comes back. Running all
three at once, one per VLAN, makes the differences hard to forget.

## Topology

```
                    R3 (Lo0 8.8.8.8 = "internet")
              Gi0/0 /          \ Gi0/1
             Gi0/1 /            \ Gi0/1
                 R1              R2
             Gi0/0 \            / Gi0/0
            (trunk) \          / (trunk)
               Gi0/0  \      /  Gi0/1
                        SW1
          Gi1/0  Gi1/1  Gi1/2  Gi1/3
           PC1    PC2    PC3    PC4
         VLAN10 VLAN20 VLAN30 VLAN30
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → SW1 Gi0/0 (trunk, subinterfaces), Gi0/1 → R3 Gi0/0 |
| R2 | IOSv | Gi0/0 → SW1 Gi0/1 (trunk, subinterfaces), Gi0/1 → R3 Gi0/1 |
| R3 | IOSv | Gi0/0 → R1, Gi0/1 → R2 |
| SW1 | IOSvL2 | Gi0/0–0/1 trunks, Gi1/0–1/3 access ports |
| PC1–PC4 | VPCS | eth0 → SW1 |

## Addressing

| Segment | Subnet | R1 | R2 | Virtual IP | FHRP |
|---------|--------|----|----|------------|------|
| VLAN 10 (Gi0/0.10) | 10.1.10.0/24 | .2 | .3 | .1 | HSRPv2 group 10 |
| VLAN 20 (Gi0/0.20) | 10.1.20.0/24 | .2 | .3 | .1 | VRRP group 20 |
| VLAN 30 (Gi0/0.30) | 10.1.30.0/24 | .2 | .3 | .1 | GLBP group 30 |
| R1–R3 | 10.0.13.0/24 | .1 | — | — | — |
| R2–R3 | 10.0.23.0/24 | — | .2 | — | — |

R3: Gi0/0 10.0.13.3, Gi0/1 10.0.23.3, Lo0 8.8.8.8/32. PCs: PC1 10.1.10.11,
PC2 10.1.20.11, PC3 10.1.30.11, PC4 10.1.30.12, all with gateway .1.

## Tasks

1. Build the switching (VLANs 10/20/30, trunks to R1 and R2, access ports)
   and the router subinterfaces. Run OSPF area 0 on all routers with the LAN
   subinterfaces passive, so each router learns 8.8.8.8 only through R3.
2. **HSRP on VLAN 10:** version 2, group 10, VIP 10.1.10.1. R1 is active
   (priority 110, preempt); R2 preempts too. Add MD5 authentication with a
   key string.
3. Track R1's uplink: `track 1 interface Gi0/1 line-protocol` and
   `standby 10 track 1 decrement 20`. Shut R1 Gi0/1 and prove R2 takes over.
   Then explain why R2 needs `preempt` for this to work.
4. Interface tracking misses a failure on the *far* end of the link. Replace
   it with route tracking: `track 2 ip route 8.8.8.8 255.255.255.255
   reachability`. Shut R3 Gi0/0 (not R1's side) and prove failover still
   happens once OSPF notices.
5. **VRRP on VLAN 20:** group 20, VIP 10.1.20.1, R2 is master (priority 110).
   Check whether you had to configure preemption, and why not.
6. **GLBP on VLAN 30:** group 30, VIP 10.1.30.1, R1 is the AVG (priority 110,
   preempt), load-balancing `round-robin`. From PC3 and PC4, ping 8.8.8.8
   and then compare `show arp` on each PC.
7. Write down the virtual MAC each protocol uses for its group and check it
   in `show standby`, `show vrrp` and `show glbp`.

## Verification checklist

- `show standby brief` on R1: group 10 `Active`, priority 110, `P` (preempt)
  flag; R2 shows `Standby`
- After task 3: R1 shows priority 90 and `Standby`; R2 is `Active`; PC1 keeps
  pinging 8.8.8.8 with at most a couple of lost replies
- `show track 2` on R1 shows `IP route 8.8.8.8 255.255.255.255 reachability`,
  `Reachability is Down` after task 4, and HSRP moves
- `show vrrp brief` on R2: group 20 `Master`, priority 110
- `show glbp` on R1: `Active router is local` (the AVG) and two forwarders,
  one `Active` on each router
- PC3 and PC4 resolve 10.1.30.1 to **different** MACs: 0007.b400.1e01 and
  0007.b400.1e02
- HSRP v2 group 10 uses vMAC 0000.0c9f.f00a; VRRP group 20 uses 0000.5e00.0114

<details><summary>Solution</summary>

R1 (R2 is the same with .3 addresses, default priorities for HSRP and GLBP,
and VRRP priority 110):

```
track 1 interface GigabitEthernet0/1 line-protocol
track 2 ip route 8.8.8.8 255.255.255.255 reachability
!
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 10.1.10.2 255.255.255.0
 standby version 2
 standby 10 ip 10.1.10.1
 standby 10 priority 110
 standby 10 preempt
 standby 10 authentication md5 key-string HsrpKey1
 standby 10 track 2 decrement 20          ! task 4 (task 3 used track 1)
!
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 10.1.20.2 255.255.255.0
 vrrp 20 ip 10.1.20.1                     ! R2 adds: vrrp 20 priority 110
!
interface GigabitEthernet0/0.30
 encapsulation dot1Q 30
 ip address 10.1.30.2 255.255.255.0
 glbp 30 ip 10.1.30.1
 glbp 30 priority 110
 glbp 30 preempt
 glbp 30 load-balancing round-robin
!
router ospf 1
 router-id 1.1.1.1
 passive-interface GigabitEthernet0/0.10
 passive-interface GigabitEthernet0/0.20
 passive-interface GigabitEthernet0/0.30
 network 10.0.13.0 0.0.0.255 area 0
 network 10.1.0.0 0.0.255.255 area 0
```

R2 also needs `standby 10 preempt` and `standby version 2` with the same
key string. R3 runs OSPF on both links and Lo0.

**Why R2 needs preempt (task 3):** HSRP never takes over from a working
active router by priority alone. R1 dropping to 90 doesn't make R2 active
unless R2 is allowed to say "my 100 beats your 90, I'm taking over". Without
preempt on R2, R1 stays active with a dead uplink and VLAN 10 is black-holed.

**Why route tracking (task 4):** in EVE-NG (and on many real links through a
provider switch) shutting the far end leaves R1's interface up/up, so
interface tracking sees nothing. Tracking the route means "do I still have a
path to the thing that matters?" OSPF removes the route after the dead
interval, and HSRP follows.

**VRRP preemption (task 5):** VRRP preempts **by default**. HSRP and GLBP
don't. That's a favourite exam question.

**GLBP (task 6):** the AVG answers each ARP for the VIP with a different
forwarder's virtual MAC, in turn. PC3 gets R1's AVF MAC (…1e01), PC4 gets
R2's (…1e02). Both routers forward for the same subnet at once, with one
VIP. The 0x1e in the MAC is the group number, 30.
</details>

## Break it

1. Change R2's HSRP key string to `HsrpKey2`.
2. Set `standby version 1` on R2 only.
3. Configure `vrrp 20 ip 10.1.20.254` on R2 (R1 keeps .1).
4. Remove `standby 10 preempt` from R1, fail the uplink, then restore it.

<details><summary>Break it — what you should see</summary>

1. **Auth mismatch:** each router ignores the other's hellos, so both become
   Active. `show standby` shows two actives, and the log shows
   `%HSRP-4-BADAUTH`. Duplicate gateways mostly still forward, which is why
   this fault survives in production until someone reads the logs.
2. **Version mismatch:** v1 and v2 use different multicast addresses
   (224.0.0.2 vs 224.0.0.102) and different vMACs, so the routers don't hear
   each other. Both go Active.
3. **VIP mismatch:** both routers become Master for their own idea of the VIP.
   `show vrrp` on each shows a different virtual address. Hosts using
   10.1.20.1 still work through R1 only, so it looks fine until R1 fails.
4. **No preempt on the original active:** after the uplink is restored, R1's
   priority goes back to 110 but R2 stays Active. Traffic takes the
   non-preferred path until something else fails. Nothing is broken, but the
   design is no longer what's running.
</details>

---

# Lab 6 — NAT & PAT at CCNP Depth

**Guide sections:** 8.5 · **Time:** ~50 min · **Diagram:** the NAT address terms figure in 8.5

**Why this lab:** CCNA NAT was "make the PCs reach the internet". CCNP NAT
is about the order of operations (when does the router see the real address,
and when the translated one?), mixing static, dynamic and PAT on one router,
and reading the translation table well enough to troubleshoot from it.

## Topology

```
 PC1 PC2 PC3 SRV
   \  |   |  /
      SW1
       | Gi0/0 (inside)
       R1
       | Gi0/1 (outside)
       R2  (ISP, Lo0 192.0.2.100)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → SW1 (inside), Gi0/1 → R2 Gi0/0 (outside) |
| R2 | IOSv | Gi0/0 → R1 |
| SW1 | IOSvL2 | all ports VLAN 1 |
| PC1, PC2, PC3 | VPCS | → SW1 |
| SRV | IOSv (acting as a server with Telnet enabled) | Gi0/0 → SW1 |

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| R1 | Gi0/0 | 10.1.1.1/24 |
| R1 | Gi0/1 | 203.0.113.2/30 |
| R2 | Gi0/0 | 203.0.113.1/30 |
| R2 | Lo0 | 192.0.2.100/32 |
| PC1 / PC2 | eth0 | 10.1.1.11 / 10.1.1.12 (gateway .1) |
| PC3 | eth0 | 10.1.1.140 (gateway .1) |
| SRV | Gi0/0 | 10.1.1.100 (default route to .1) |

The ISP has assigned the company **198.51.100.0/28** and routes it to R1
(`ip route 198.51.100.0 255.255.255.240 203.0.113.2` on R2). R2 has **no**
route to 10.1.1.0/24, just like the real internet.

## Tasks

1. Mark R1's interfaces `ip nat inside` / `ip nat outside`, give R1 a default
   route to R2, and give R2 its route to the public block.
2. **Static NAT:** SRV is reachable from the internet as 198.51.100.2 on every
   port.
3. **Static PAT (port forward):** 198.51.100.3 TCP 2323 forwards to SRV's
   Telnet (TCP 23). IOS will refuse this second mapping for the same inside
   address until you add the right keyword. Find it.
4. **Dynamic NAT without overload:** hosts in 10.1.1.0/25 (PC1, PC2) get a
   public address from a pool of 198.51.100.4–198.51.100.7, one per host.
5. **PAT:** hosts in 10.1.1.128/25 (PC3) share R1's outside address
   (`overload` on the interface).
6. Generate traffic from every host to 192.0.2.100, then read
   `show ip nat translations` and label the four columns as inside global,
   inside local, outside local and outside global.
7. Apply an inbound ACL on R1 Gi0/1 that allows only ICMP to 198.51.100.2 and
   TCP 2323 to 198.51.100.3 from the internet. Decide whether the ACL must
   name the private or the public address, and prove your answer.
8. Shrink the dynamic pool to a single address, ping from PC1 then PC2, and
   explain PC2's failure using `show ip nat statistics`.

## Verification checklist

- `show ip nat translations` shows the static entries permanently:
  `--- 198.51.100.2 10.1.1.100 --- ---` and
  `tcp 198.51.100.3:2323 10.1.1.100:23 --- ---`
- From R2: `ping 198.51.100.2` succeeds and `telnet 198.51.100.3 2323`
  reaches SRV's login prompt
- PC1's ping creates an entry with inside global from the pool (198.51.100.4–7);
  PC3's creates one with inside global 203.0.113.2 and a translated port
- `show ip nat statistics` shows the pool with `allocated` addresses and
  hit/miss counters rising
- With the task 7 ACL in place, `ping 198.51.100.3` from R2 fails while the
  Telnet to 2323 still works

<details><summary>Solution</summary>

```
R1(config)# interface Gi0/0
R1(config-if)# ip nat inside
R1(config)# interface Gi0/1
R1(config-if)# ip nat outside
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
!
R1(config)# ip nat inside source static 10.1.1.100 198.51.100.2 extendable
R1(config)# ip nat inside source static tcp 10.1.1.100 23 198.51.100.3 2323 extendable
!
R1(config)# ip access-list standard NAT-POOL-HOSTS
R1(config-std-nacl)# permit 10.1.1.0 0.0.0.127
R1(config)# ip nat pool PUBLIC 198.51.100.4 198.51.100.7 netmask 255.255.255.240
R1(config)# ip nat inside source list NAT-POOL-HOSTS pool PUBLIC
!
R1(config)# ip access-list standard PAT-HOSTS
R1(config-std-nacl)# permit 10.1.1.128 0.0.0.127
R1(config)# ip nat inside source list PAT-HOSTS interface Gi0/1 overload
!
R1(config)# ip access-list extended FROM-INTERNET
R1(config-ext-nacl)# permit icmp any host 198.51.100.2
R1(config-ext-nacl)# permit tcp any host 198.51.100.3 eq 2323
R1(config-ext-nacl)# permit icmp any host 203.0.113.2 echo-reply   ! PAT users' replies
R1(config-ext-nacl)# permit icmp any 198.51.100.0 0.0.0.15 echo-reply
R1(config)# interface Gi0/1
R1(config-if)# ip access-group FROM-INTERNET in
```

SRV: `ip route 0.0.0.0 0.0.0.0 10.1.1.1`, plus `line vty 0 4`, `password
cisco`, `login`, `transport input telnet`.

**The keyword (task 3)** is `extendable`. It tells IOS that one inside local
address deliberately has more than one static mapping. Without it the second
command is rejected as a duplicate.

**Private or public in the ACL (task 7)?** Public. For traffic arriving on the
outside interface, the inbound ACL is checked **before** NAT translates the
destination. At that moment the packet is addressed to 198.51.100.x, so that's
what the ACL must match. (Going the other way, an inbound ACL on the inside
interface sees the private source, for the same reason.) The extra
`echo-reply` lines matter: without them the inside users' own pings out
would be blocked on the way back in.

**The single-address pool (task 8):** dynamic NAT without overload is one
public address per inside host. PC1 holds the only address until its
translation times out (24 hours by default for non-PAT entries, or
`clear ip nat translation *`). PC2's packets find no free address and are
dropped; `show ip nat statistics` shows the `misses` and the pool at
`allocated 1 (100%)`.
</details>

## Break it

1. Swap `ip nat inside` and `ip nat outside` on R1.
2. Remove R2's static route to 198.51.100.0/28.
3. Change the PAT ACL to `permit 10.1.1.128 0.0.0.255`.
4. Remove `ip nat outside` from Gi0/1 entirely.

<details><summary>Break it — what you should see</summary>

1. **Reversed roles:** no inside-source translations are created for PC
   traffic (it now enters an "outside" interface). PCs' pings leave with
   private sources and R2 has no route back. `show ip nat translations` shows
   only the statics.
2. **No return route:** translations are created (so NAT looks healthy) but
   replies to 198.51.100.x never come back. A translation table filling up
   with entries and no replies points outside the NAT router.
3. **Overlapping ACLs:** 10.1.1.128 0.0.0.255 matches 10.1.1.0–255, so the
   two NAT rules now overlap for PC1 and PC2. IOS evaluates them in config
   order and the result depends on which rule matches first. Rules that
   should be exclusive must be written exclusively.
4. **No outside interface:** NAT needs both an inside and an outside
   interface on the path. Nothing translates and `show ip nat statistics`
   lists no outside interface.
</details>

---

# Lab 7 — NTP, Syslog & SNMPv3

**Guide sections:** 8.2, 15.3, 15.4, 32.2, 32.3 · **Time:** ~60 min

**Why this lab:** when something breaks at 03:12, you'll want every device's
log to say 03:12, all in one place, and you'll want to read counters remotely
without sending a community string in clear text. That's NTP, syslog and
SNMPv3: three boring services that make every other kind of troubleshooting
possible. **Story time:** logs without synchronised clocks are like witness
statements where everyone's watch is wrong by a different amount. Each one is
true, and together they're useless.

## Topology

```
  MGMT (Linux or your laptop)
     | 10.1.99.100
     | Gi0/2
     R1 ────────── R2 ────────── R3
        Gi0/0  Gi0/0  Gi0/1  Gi0/0
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → R2 Gi0/0, Gi0/2 → MGMT |
| R2 | IOSv | Gi0/0 → R1, Gi0/1 → R3 Gi0/0 |
| R3 | IOSv | Gi0/0 → R2 |
| MGMT | Linux node with `snmp` and `rsyslog` (or `tcpdump`) installed | eth0 → R1 Gi0/2 |

If you'd rather use your laptop as MGMT, connect R1 Gi0/2 to a
Management(Cloud0) network, give R1 an unused address in your home LAN, and
substitute your laptop's address for 10.1.99.100 below. On macOS,
`brew install net-snmp` gives you `snmpwalk`, and `sudo nc -klu 514` shows
incoming syslog.

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| R1 | Gi0/0 / Gi0/2 / Lo0 | 10.0.12.1/24 / 10.1.99.1/24 / 1.1.1.1/32 |
| R2 | Gi0/0 / Gi0/1 / Lo0 | 10.0.12.2/24 / 10.0.23.2/24 / 2.2.2.2/32 |
| R3 | Gi0/0 / Lo0 | 10.0.23.3/24 / 3.3.3.3/32 |
| MGMT | eth0 | 10.1.99.100/24, gateway 10.1.99.1 |

## Tasks

1. Run OSPF area 0 on every link and loopback (and R1's MGMT subnet, passive)
   so everything can reach everything.
2. **NTP hierarchy:** R1 is the authoritative source (`ntp master 3`, after
   setting its clock and time zone). R2 syncs from R1's loopback; R3 syncs
   from R2's. Every association is MD5-authenticated with key 1.
3. On R1, restrict NTP so only R2 may sync from it (`ntp access-group
   serve-only`). Then find out why R1 itself becomes unsynchronised, and fix
   it.
4. Set log timestamps on all routers to include the date, milliseconds and
   time zone.
5. **Syslog:** every router sends severity 0–6 (informational) to MGMT,
   sourced from Lo0, and keeps a 64 KB local buffer at debugging level.
   Generate a message with `shutdown` / `no shutdown` on a loopback and
   find it on MGMT.
6. **SNMPv3:** on every router create a view, a group `NOC` at `priv` level
   restricted by an ACL to MGMT, and a user `nocuser` (SHA auth, AES-128
   privacy). Walk the `system` subtree from MGMT.
7. Send SNMPv3 traps for link up/down to MGMT and capture one with
   `tcpdump -ni eth0 udp port 162`.

## Verification checklist

- `show ntp status` on R2: `Clock is synchronized, stratum 4, reference is
  1.1.1.1`; on R3: stratum 5, reference 2.2.2.2
- `show ntp associations` on R2 shows `*~1.1.1.1` (the `*` means
  synchronised to it) with `st 3`
- `show ntp associations detail` shows `authenticated` for the server
- `show logging` shows `Trap logging: level informational` and the MGMT host
  with a rising `message lines logged` counter
- Log lines carry dates and time zones, for example
  `*Oct 29 14:02:11.123 UTC: %LINK-5-CHANGED`
- `snmpwalk -v3 -l authPriv -u nocuser -a SHA -A AuthPass123 -x AES -X
  PrivPass123 10.1.99.1 1.3.6.1.2.1.1` returns the system description,
  name and uptime
- `show snmp user` lists nocuser with `Authentication Protocol: SHA` and
  `Privacy Protocol: AES128`

<details><summary>Solution</summary>

R1:

```
clock timezone UTC 0
! from privileged EXEC: clock set 14:00:00 29 Oct 2026
ntp authentication-key 1 md5 NtpKey123
ntp authenticate
ntp trusted-key 1
ntp source Loopback0
ntp master 3
access-list 10 permit 2.2.2.2
access-list 11 permit 127.127.1.1
ntp access-group serve-only 10
ntp access-group peer 11
```

R2 (R3 is the same with `ntp server 2.2.2.2 key 1`):

```
ntp authentication-key 1 md5 NtpKey123
ntp authenticate
ntp trusted-key 1
ntp source Loopback0
ntp server 1.1.1.1 key 1
```

All routers (logging and SNMPv3; change the source address in the ACL if
MGMT differs):

```
service timestamps log datetime msec localtime show-timezone
service timestamps debug datetime msec localtime show-timezone
logging buffered 64000 debugging
logging host 10.1.99.100
logging trap informational
logging source-interface Loopback0
!
ip access-list standard SNMP-MGR
 permit 10.1.99.100
snmp-server view NOCVIEW iso included
snmp-server group NOC v3 priv read NOCVIEW access SNMP-MGR
snmp-server user nocuser NOC v3 auth sha AuthPass123 priv aes 128 PrivPass123
snmp-server enable traps snmp linkdown linkup
snmp-server host 10.1.99.100 version 3 priv nocuser
snmp-server source-interface traps Loopback0
```

**Why R1 lost sync (task 3):** once *any* `ntp access-group` exists, every
NTP source not explicitly permitted is denied, and that includes R1's own
internal reference clock, 127.127.1.1, which `ntp master` uses. Permitting it
in a `peer` access group restores sync. This is the classic "I locked down
NTP and my master stopped being a master".

**Why the SNMPv3 user isn't in the running config:** the user's keys are
localised to the engine ID and stored separately. `show snmp user` is the
proof. Change the engine ID and every user must be re-created.

**`logging trap informational`** means severities 0–6 go to the server;
`debugging` (7) stays in the buffer only. Lower number = more severe.
</details>

## Break it

1. On R3, change the NTP key string to `NtpKey999`.
2. On R2, remove `ntp trusted-key 1`.
3. On R1, change `logging trap informational` to `logging trap warnings` and
   bounce a loopback.
4. Change MGMT's `snmpwalk` to `-l authNoPriv` (drop the `-x`/`-X` options).

<details><summary>Break it — what you should see</summary>

1. **Key mismatch:** R3's association to 2.2.2.2 never gets the `*`, and
   `show ntp status` says `Clock is unsynchronized`. `show ntp associations
   detail` shows the server as `insane, invalid, unsynced` /
   not authenticated.
2. **Untrusted key:** the key exists but isn't trusted, so authenticated
   packets still don't count. Same symptom as 1; the cause is visible only in
   the config. Both lines (`authentication-key` and `trusted-key`) are needed.
3. **Severity filter:** most link messages are severity 5
   (`%LINK-5-CHANGED` on shutdown, `%LINEPROTO-5-UPDOWN` both ways); only
   `%LINK-3-UPDOWN`, when the interface comes back up, is severity 3. With
   `warnings` (4), only that one reaches MGMT, while the buffer still has
   them all. The number in the message mnemonic tells you which pass.
4. **Security level too low:** the group requires `priv`, so a request at
   `authNoPriv` is refused (`authorizationError` or a timeout, depending on
   the tool). The fix is on the manager, not the router.
</details>

---

# Lab 8 — SPAN, RSPAN & IP SLA

**Guide sections:** 15.6, 15.7, 32.6 · **Time:** ~50 min · **Diagram:** the SPAN, RSPAN and ERSPAN figure in 15.6

**Why this lab:** some problems only show up in the packets, so you need a
copy of the traffic on an analyser without unplugging anything. SPAN copies
it within a switch, RSPAN carries the copy across switches in a dedicated
VLAN. IP SLA is the other half of assurance: instead of waiting for users to
complain, the router keeps measuring the path itself.

## Topology

```
  PC1 ── Gi1/0 SW1 Gi0/0 ════ Gi0/0 SW2 Gi1/2 ── SNIFF2
  R1  ── Gi1/1  │   (trunk)
 SNIFF1 ─ Gi1/2 ┘
  R1 Gi0/1 ── Gi0/0 R2 (Lo0 2.2.2.2)
```

| Device | Image | Links |
|--------|-------|-------|
| SW1 | IOSvL2 | Gi0/0 → SW2 Gi0/0 (trunk), Gi1/0 → PC1, Gi1/1 → R1 Gi0/0, Gi1/2 → SNIFF1 |
| SW2 | IOSvL2 | Gi0/0 → SW1, Gi1/2 → SNIFF2 |
| R1 | IOSv | Gi0/0 → SW1 Gi1/1 (VLAN 10), Gi0/1 → R2 Gi0/0 |
| R2 | IOSv | Gi0/0 → R1 Gi0/1 |
| PC1 | VPCS | → SW1 Gi1/0 |
| SNIFF1, SNIFF2 | VPCS (just a link endpoint) or Linux with `tcpdump` | → SW1 Gi1/2, SW2 Gi1/2 |

**Seeing the copied traffic:** in EVE-NG, right-click SW1 (or SW2) →
**Capture** → the interface facing the sniffer. Wireshark opens on that link
and shows exactly what the switch sends to the analyser port.

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| PC1 | eth0 | 10.1.10.11/24, gateway 10.1.10.1 |
| R1 | Gi0/0 / Gi0/1 | 10.1.10.1/24 / 10.0.12.1/24 |
| R2 | Gi0/0 / Lo0 | 10.0.12.2/24 / 2.2.2.2/32 |

VLAN 10 = users, VLAN 999 = RSPAN.

## Tasks

1. Build VLAN 10 on both switches, the SW1–SW2 trunk, and static routes so
   PC1 can ping 2.2.2.2 (R1: route to 2.2.2.2; R2: route to 10.1.10.0/24).
2. **Local SPAN** on SW1: copy PC1's port (both directions) to Gi1/2. Ping
   from PC1 and capture on Gi1/2. Note what happens to Gi1/2 as a normal
   port while it's a SPAN destination.
3. **RSPAN:** create VLAN 999 as `remote-span` on both switches and make sure
   the trunk carries it. On SW1, send received traffic from VLAN 10 into
   VLAN 999. On SW2, deliver VLAN 999 to Gi1/2. Capture on SW2 Gi1/2.
4. On paper, write the ERSPAN source-session config that would do task 3
   across a routed network instead (guide 15.6). IOSvL2 can't run it; a
   CSR1000v or Catalyst 9000v can.
5. **IP SLA icmp-echo** on R1: probe 2.2.2.2 from Gi0/1 every 10 seconds,
   starting now, forever.
6. **IP SLA udp-jitter** on R1 toward R2 port 16384, with `ip sla
   responder` on R2. Read the jitter and one-way results.
7. Track probe 1 with `track 1 ip sla 1 reachability` and make it fail by
   shutting R2's Lo0. Watch the track state change in the log.

## Verification checklist

- `show monitor session 1` on SW1: source `Both: Gi1/0`, destination Gi1/2
- The capture on SW1 Gi1/2 shows PC1's ICMP echo requests **and** replies
- `show vlan remote-span` lists VLAN 999 on both switches, and
  `show interfaces trunk` shows 999 allowed and forwarding
- The capture on SW2 Gi1/2 shows VLAN 10 traffic that never physically
  touched SW2's user ports
- `show ip sla statistics 1`: `Latest operation return code: OK` and a
  rising `Number of successes`
- `show ip sla statistics 2` shows RTT and source-to-destination /
  destination-to-source jitter values
- After shutting R2 Lo0: `%TRACK-6-STATE: 1 ip sla 1 reachability Up -> Down`
  and `show track 1` reports `Down`

<details><summary>Solution</summary>

SW1:

```
vlan 10
vlan 999
 remote-span
interface Gi0/0
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,999
interface range Gi1/0 - 1
 switchport mode access
 switchport access vlan 10
!
monitor session 1 source interface Gi1/0 both
monitor session 1 destination interface Gi1/2
!
monitor session 2 source vlan 10 rx
monitor session 2 destination remote vlan 999
```

SW2:

```
vlan 10
vlan 999
 remote-span
interface Gi0/0
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,999
monitor session 2 source remote vlan 999
monitor session 2 destination interface Gi1/2
```

R1 and R2:

```
R1(config)# ip route 2.2.2.2 255.255.255.255 10.0.12.2
R1(config)# ip sla 1
R1(config-ip-sla)# icmp-echo 2.2.2.2 source-interface Gi0/1
R1(config-ip-sla-echo)# frequency 10
R1(config)# ip sla schedule 1 life forever start-time now
R1(config)# ip sla 2
R1(config-ip-sla)# udp-jitter 2.2.2.2 16384 source-ip 10.0.12.1 num-packets 20 interval 20
R1(config-ip-sla-jitter)# frequency 30
R1(config)# ip sla schedule 2 life forever start-time now
R1(config)# track 1 ip sla 1 reachability
!
R2(config)# ip route 10.1.10.0 255.255.255.0 10.0.12.1
R2(config)# ip sla responder
```

ERSPAN on paper (IOS XE):

```
monitor session 3 type erspan-source
 source interface Gi1/0/1 rx
 destination
  erspan-id 100
  ip address 10.9.9.9
  origin ip address 10.1.10.2
 no shutdown
```

**Why the SPAN destination port goes quiet (task 2):** a destination port
stops being a normal switchport. It doesn't learn MACs, doesn't take part in
STP, and drops incoming traffic unless you add the `ingress` option. Don't
point a SPAN destination at a port a user needs.

**Why udp-jitter needs a responder (task 6):** ICMP echo is answered by any
IP stack, but jitter and one-way delay need the far end to timestamp the
packets on arrival and departure. `ip sla responder` is that far end.
Without it the operation fails, which the Break it list shows you.
</details>

## Break it

1. Remove VLAN 999 from the SW1–SW2 trunk's allowed list.
2. On SW2, delete the `remote-span` line under VLAN 999.
3. Remove `ip sla responder` from R2.
4. Configure a new probe `ip sla 3` but never schedule it.

<details><summary>Break it — what you should see</summary>

1. **RSPAN VLAN not trunked:** SW1's session still looks fine (`show monitor`
   reports it up), but the copy never reaches SW2. Always check
   `show interfaces trunk` end to end for the RSPAN VLAN.
2. **Ordinary VLAN on SW2:** SW2 won't accept VLAN 999 as a source for a
   remote session; the `monitor session 2 source remote vlan 999` command is
   rejected or the session shows as inactive.
3. **No responder:** probe 2's return code changes from OK to a failure
   (no connection / timeout) and its success counter stops. Probe 1 keeps
   working, which proves the path is fine and narrows the fault to the
   responder.
4. **Unscheduled probe:** `show ip sla summary` shows it as `pending`, never
   running. Configuring an operation doesn't start it.
</details>

---

# Lab 9 — QoS: Classify, Mark, Police

**Guide sections:** 11.1–11.4, 11.7 · **Time:** ~60 min · **Diagram:** the marking fields figure in 11.2

**Why this lab:** QoS is a promise you can only keep if every router agrees
on what each packet is. So you classify once, at the edge, write the answer
into the DSCP field, and from then on every hop just reads the label.
**Story time:** it's airport check-in. The desk (the trust boundary) decides
whether you're priority boarding and puts a tag on your bag; nobody further
along re-weighs your bag, they read the tag. A passenger who writes "first
class" on their own bag gets re-tagged at the desk.

## Topology

```
 H1 ── Gi0/0 R1 Gi0/1 ── Gi0/0 R2 (Lo0 2.2.2.2)
 (traffic       (edge:        (HQ: counts the
  generator)    marks + polices)  markings that arrive)
```

| Device | Image | Links |
|--------|-------|-------|
| H1 | IOSv (used as a host so it can generate Telnet, UDP and large pings) | Gi0/0 → R1 Gi0/0 |
| R1 | IOSv | Gi0/0 → H1, Gi0/1 → R2 Gi0/0 |
| R2 | IOSv | Gi0/0 → R1 Gi0/1 |

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| H1 | Gi0/0 | 10.1.1.10/24, default route to 10.1.1.1 |
| R1 | Gi0/0 / Gi0/1 | 10.1.1.1/24 / 10.0.12.1/24 |
| R2 | Gi0/0 / Lo0 | 10.0.12.2/24 / 2.2.2.2/32 |

Traffic classes (the "QoS policy document"):

| Class | Identified by | DSCP |
|-------|---------------|------|
| VOICE | UDP 16384–32767 | EF (46) |
| MGMT | TCP 22 or 23 | CS2 (16) |
| BULK | ICMP (our stand-in for bulk transfers) | AF11 (10) |
| everything else | — | DF (0) |

## Tasks

1. Static routes so H1 reaches 2.2.2.2 and R2 reaches 10.1.1.0/24. On R2,
   enable `ip sla responder` so H1 can generate voice-like UDP.
2. On R1, build ACL-based class maps for VOICE, MGMT and BULK and a policy
   map `MARK-IN` that sets each DSCP from the table. Apply it **inbound on
   Gi0/0**, the trust boundary.
3. On R1, build `WAN-OUT` for Gi0/1 outbound, matching on **DSCP** this time:
   VOICE gets `priority` 128 kbps; BULK is policed at 64 kbps with a
   three-colour policer (conform → transmit, exceed → re-mark AF12,
   violate → drop); everything else gets `fair-queue`.
4. `priority` only means something when there's congestion. Nest `WAN-OUT`
   under a parent policy `SHAPE-1M` that shapes Gi0/1 to 1 Mbps, and apply
   the parent instead.
5. On R2, apply an inbound policy `COUNT-IN` with classes that match EF,
   CS2, AF11 and AF12 and do nothing else, so their counters prove what
   arrived.
6. Generate each traffic type from H1: an IP SLA udp-jitter probe to
   2.2.2.2 port 16384 (VOICE), a Telnet to 2.2.2.2 (MGMT) and
   `ping 2.2.2.2 size 1400 repeat 3000 timeout 0` (BULK).
7. Read the counters on all three policies and account for every packet:
   which class, which DSCP, how many conformed, exceeded and violated.

## Verification checklist

- `show policy-map interface Gi0/0 input` on R1: VOICE, MGMT and BULK
  packet counters rise with their traffic, and class-default catches the rest
- `show policy-map interface Gi0/1 output` on R1: the parent shaper is
  active, and under BULK the policer shows non-zero `conformed`, `exceeded`
  **and** `violated` counts during the big ping
- `show policy-map interface Gi0/0 input` on R2: EF, CS2, AF11 and AF12
  classes all have matches, proving the markings survived the hop
- H1's big ping shows lost replies (the violated packets), while the IP SLA
  voice probe on H1 stays `OK`

<details><summary>Solution</summary>

R1 classification and marking:

```
ip access-list extended VOICE-ACL
 permit udp any any range 16384 32767
ip access-list extended MGMT-ACL
 permit tcp any any eq 22
 permit tcp any any eq 23
ip access-list extended BULK-ACL
 permit icmp any any
!
class-map match-any VOICE-IN
 match access-group name VOICE-ACL
class-map match-any MGMT-IN
 match access-group name MGMT-ACL
class-map match-any BULK-IN
 match access-group name BULK-ACL
!
policy-map MARK-IN
 class VOICE-IN
  set dscp ef
 class MGMT-IN
  set dscp cs2
 class BULK-IN
  set dscp af11
 class class-default
  set dscp default
!
interface GigabitEthernet0/0
 service-policy input MARK-IN
```

R1 egress (child queuing inside a parent shaper):

```
class-map match-any VOICE
 match dscp ef
class-map match-any BULK
 match dscp af11
!
policy-map WAN-OUT
 class VOICE
  priority 128
 class BULK
  police cir 64000 bc 8000 be 8000
   conform-action transmit
   exceed-action set-dscp-transmit af12
   violate-action drop
 class class-default
  fair-queue
!
policy-map SHAPE-1M
 class class-default
  shape average 1000000
  service-policy WAN-OUT
!
interface GigabitEthernet0/1
 service-policy output SHAPE-1M
```

R2:

```
ip sla responder
class-map match-any EF
 match dscp ef
class-map match-any CS2
 match dscp cs2
class-map match-any AF11
 match dscp af11
class-map match-any AF12
 match dscp af12
policy-map COUNT-IN
 class EF
 class CS2
 class AF11
 class AF12
interface GigabitEthernet0/0
 service-policy input COUNT-IN
```

H1:

```
ip route 0.0.0.0 0.0.0.0 10.1.1.1
ip sla 1
 udp-jitter 2.2.2.2 16384 num-packets 50 interval 20
 frequency 10
ip sla schedule 1 life forever start-time now
```

**Why classify by ACL at the edge but by DSCP in the core:** the edge is the
only place where you can afford to inspect ports and addresses (and where you
must, because you don't trust the host). After that the decision is written
in the header, so every later class map is a cheap `match dscp`. If you
classified by ACL everywhere, every router would need every ACL kept in sync.

**Why the shaper (task 4):** on a 1 Gbps virtual interface carrying a few
hundred kbps, nothing ever queues, so `priority` and `fair-queue` never
act. Shaping to 1 Mbps creates a slower virtual link with a queue, which is
exactly the situation on a real WAN handoff where the contract rate is below
the port speed.

**Reading the policer (task 7):** `bc` is the burst the policer forgives at
once; with 1400-byte pings arriving back to back, the first few conform,
then the excess bucket (`be`) fills and those packets are re-marked AF12,
then everything beyond is dropped. That's why R2 sees both AF11 and AF12.
</details>

## Break it

1. On H1, send an extended ping with Type of Service 184 (that's DSCP EF)
   and check which class it lands in on R1 and R2.
2. Change `VOICE-IN` to `class-map match-all` and add `match dscp ef` to it.
3. In `MARK-IN`, add a new first class that matches an ACL
   `permit ip any any` and sets DSCP CS1.
4. Apply `WAN-OUT` directly to Gi0/1 (no parent shaper) and repeat the
   big ping.

<details><summary>Break it — what you should see</summary>

1. **The trust boundary works:** the ICMP still matches BULK-IN and is
   re-marked AF11. H1 asked for EF; R1 decided. On R2 it counts under AF11 or
   AF12, never EF. If it had arrived as EF, your edge would be trusting the
   host.
2. **match-all with an impossible pair:** traffic from H1 arrives unmarked
   (DSCP 0), so "UDP 16384+ **and** already EF" never matches. VOICE-IN's
   counter freezes and voice falls into class-default. Use `match-any`
   unless every condition must be true.
3. **First match wins:** every packet now hits the catch-all first and is
   marked CS1; the other classes go silent. Class order in a policy map is
   the order of evaluation.
4. **No congestion, no queuing:** the policer still drops (it doesn't care
   about congestion), but the priority and fair-queue counters show nothing
   queued. Policing is about rate; queuing is about congestion.
</details>

---

# Lab 10 — NETCONF & RESTCONF on a CSR1000v

**Guide sections:** 19.8–19.9, 20.1–20.4, 20.7 · **Time:** ~75 min · **Diagram:** the RESTCONF URI figure in 20.3

**Why this lab:** the CLI was designed for a person reading a screen.
NETCONF and RESTCONF were designed for programs: they send and receive
structured data (XML or JSON) shaped by YANG models, so a script knows
exactly where the IP address is instead of scraping it out of text. ENCOR
asks you to read and interpret these calls; doing them once from your own
laptop makes the URIs, payloads and status codes stick.

## Topology

```
  Your laptop (curl, Python)
        |
  Management(Cloud0)
        | Gi1
      CSR1 ── Gi2 ─────── Gi0/0 R2
```

| Device | Image | Links |
|--------|-------|-------|
| CSR1 | CSR1000v (IOS XE 16.x or 17.x) | GigabitEthernet1 → Management(Cloud0), GigabitEthernet2 → R2 Gi0/0 |
| R2 | IOSv | Gi0/0 → CSR1 Gi2 |
| Your laptop | macOS/Linux with `curl`, Python 3, `pip install requests ncclient` | reaches CSR1 Gi1 through your LAN |

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| CSR1 | Gi1 | 192.168.1.50/24 (use any free address in your home LAN; every command below uses this one) |
| CSR1 | Gi2 | 10.0.12.1/24 (configured **by RESTCONF**, not by you) |
| R2 | Gi0/0 | 10.0.12.2/24 |

## Tasks

1. From the CSR console: hostname, Gi1 address and `no shutdown`, a default
   route to your home router, a privilege-15 user `admin` / `Cisco123`, AAA
   with local login and exec authorisation, the HTTPS server with local
   authentication, `restconf` and `netconf-yang`. Leave Gi2 unconfigured.
2. Wait a minute or two, then prove both servers are running from the CLI.
3. **RESTCONF GET:** read the hostname through the Cisco native model, then
   the whole `ietf-interfaces:interfaces` container. Note the status code.
4. **RESTCONF PATCH:** give Gi2 a description, the address 10.0.12.1/24 and
   `enabled: true` using `ietf-interfaces`. Check the CLI, then ping R2 from
   the CSR.
5. **RESTCONF POST:** create Loopback100 with 10.100.100.1/32. Run the same
   POST a second time and record the status code.
6. **RESTCONF DELETE:** remove Loopback100 and confirm it's gone.
7. **Python:** write a script with `requests` that lists every interface's
   name, enabled state and IPv4 addresses in a neat table.
8. **NETCONF by hand:** `ssh -p 830 admin@192.168.1.50 -s netconf` and read
   the `<hello>`. Find the `ietf-interfaces` capability in it. (Type `]]>]]>`
   or press Ctrl-C to leave.)
9. **NETCONF with Python:** use `ncclient` to `get-config` just Gi2 with a
   subtree filter, then `edit-config` to create Loopback200 with a
   description. Check it in `show running-config`.
10. Save the configuration. NETCONF and RESTCONF change the running config
    only.

## Verification checklist

- `show platform software yang-management process` shows `ncsshd`,
  `nginx` and `confd` as `Running`
- `show netconf-yang status` shows `netconf-yang: enabled` on port 830
- GET returns **200** with JSON such as
  `{"Cisco-IOS-XE-native:hostname": "CSR1"}`
- PATCH returns **204 No Content**, and `show run interface Gi2` shows the
  description and address; `ping 10.0.12.2` from CSR1 succeeds
- The first POST returns **201 Created**, the repeat returns **409 Conflict**
- DELETE returns **204**, and a GET on the deleted interface returns **404**
- The Python script prints one line per interface, including Gi2 with
  10.0.12.1/255.255.255.0
- `ncclient`'s `edit_config` reply has `ok` = True and Loopback200 appears in
  the running config

<details><summary>Solution</summary>

CSR1 bootstrap (console):

```
hostname CSR1
interface GigabitEthernet1
 ip address 192.168.1.50 255.255.255.0
 no shutdown
ip route 0.0.0.0 0.0.0.0 192.168.1.1
username admin privilege 15 algorithm-type scrypt secret Cisco123
aaa new-model
aaa authentication login default local
aaa authorization exec default local
ip http secure-server
ip http authentication local
restconf
netconf-yang
```

RESTCONF with curl (from your laptop):

```
# GET the hostname (200)
curl -k -u admin:Cisco123 -H "Accept: application/yang-data+json" \
  https://192.168.1.50/restconf/data/Cisco-IOS-XE-native:native/hostname

# GET all interfaces (200)
curl -k -u admin:Cisco123 -H "Accept: application/yang-data+json" \
  https://192.168.1.50/restconf/data/ietf-interfaces:interfaces

# PATCH Gi2 (204)
curl -k -u admin:Cisco123 -X PATCH \
  -H "Accept: application/yang-data+json" \
  -H "Content-Type: application/yang-data+json" \
  https://192.168.1.50/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet2 \
  -d '{"ietf-interfaces:interface": {
        "name": "GigabitEthernet2",
        "description": "To R2 - set by RESTCONF",
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": true,
        "ietf-ip:ipv4": {"address": [{"ip": "10.0.12.1", "netmask": "255.255.255.0"}]}
      }}'

# POST a new loopback (201, then 409 if repeated)
curl -k -u admin:Cisco123 -X POST -w "%{http_code}\n" \
  -H "Accept: application/yang-data+json" \
  -H "Content-Type: application/yang-data+json" \
  https://192.168.1.50/restconf/data/ietf-interfaces:interfaces \
  -d '{"ietf-interfaces:interface": {
        "name": "Loopback100",
        "description": "made by RESTCONF",
        "type": "iana-if-type:softwareLoopback",
        "enabled": true,
        "ietf-ip:ipv4": {"address": [{"ip": "10.100.100.1", "netmask": "255.255.255.255"}]}
      }}'

# DELETE it (204)
curl -k -u admin:Cisco123 -X DELETE -w "%{http_code}\n" \
  https://192.168.1.50/restconf/data/ietf-interfaces:interfaces/interface=Loopback100
```

Python with `requests` (task 7), saved as `list_interfaces.py`:

```python
import requests
import urllib3

urllib3.disable_warnings()  # the CSR uses a self-signed certificate

BASE = "https://192.168.1.50/restconf/data"
AUTH = ("admin", "Cisco123")
HEADERS = {"Accept": "application/yang-data+json"}

resp = requests.get(f"{BASE}/ietf-interfaces:interfaces",
                    auth=AUTH, headers=HEADERS, verify=False, timeout=10)
resp.raise_for_status()  # stop with a clear error on 401/404/...

for intf in resp.json()["ietf-interfaces:interfaces"]["interface"]:
    addresses = intf.get("ietf-ip:ipv4", {}).get("address", [])
    ips = ", ".join(f'{a["ip"]}/{a["netmask"]}' for a in addresses) or "no IPv4"
    state = "up" if intf.get("enabled") else "down"
    print(f'{intf["name"]:<22} {state:<5} {ips}')
```

NETCONF with `ncclient` (task 9), saved as `netconf_lab.py`:

```python
from ncclient import manager

FILTER = """
<interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces">
  <interface><name>GigabitEthernet2</name></interface>
</interfaces>
"""

CONFIG = """
<config>
  <interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces">
    <interface>
      <name>Loopback200</name>
      <description>made by NETCONF</description>
      <type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:softwareLoopback</type>
      <enabled>true</enabled>
    </interface>
  </interfaces>
</config>
"""

with manager.connect(host="192.168.1.50", port=830, username="admin",
                     password="Cisco123", hostkey_verify=False,
                     device_params={"name": "iosxe"}) as m:
    print(m.get_config(source="running", filter=("subtree", FILTER)).xml)
    reply = m.edit_config(target="running", config=CONFIG)
    print("edit-config ok:", reply.ok)
```

Task 10: `copy running-config startup-config` on the CSR (or send the
`cisco-ia:save-config` RPC if you want to stay programmatic).

**Why PATCH and not PUT for Gi2 (task 4):** PATCH merges your fields into
what's there. PUT **replaces** the whole resource with your body, so any
field you left out (an existing secondary address, for example) is removed.
On a list entry like an interface that's usually not what you meant.

**Why the second POST fails (task 5):** POST means "create". If the resource
already exists, the server refuses with 409 rather than silently changing
it. That's what makes POST safe to use for "create only if new".

**NETCONF vs RESTCONF in one line:** same YANG models, different transport
and verbs. NETCONF runs over SSH (port 830) with XML RPCs and supports
transactions and candidate datastores; RESTCONF runs over HTTPS with HTTP
verbs and JSON or XML, and is simpler to call from any tool.
</details>

## Break it

1. Change the user to `username admin privilege 1 ...` and repeat a GET.
2. Remove `ip http secure-server` and repeat a GET.
3. Send the PATCH with `Content-Type: application/json` instead of
   `application/yang-data+json`.
4. GET `.../ietf-interfaces:interfaces/interface=Loopback999`.

<details><summary>Break it — what you should see</summary>

1. **401 Unauthorized** even with the right password: the API requires
   privilege 15 (guide 20.4's worked example).
2. **Connection refused** (curl: `Failed to connect ... port 443`). No
   HTTP answer at all, because nothing is listening. A refused connection and
   an HTTP error code point to very different layers.
3. **415 Unsupported Media Type** (or 400 on some releases): RESTCONF only
   accepts the YANG media types.
4. **404 Not Found:** the URI is valid but the resource doesn't exist. A
   404 on a resource you *expect* to exist usually means a typo in the module
   prefix or key.
</details>

---

# Lab 11 — EEM Applets

**Guide sections:** 21.1, 21.2 · **Time:** ~50 min · **Diagram:** the EEM figure in 21.1

**Why this lab:** EEM is automation that lives on the router itself. It
works when the network is broken and no server can reach the box, which is
exactly when you most need something to collect evidence or react. Every
applet is "**when** this event happens, **do** these actions", and ENCOR
expects you to write one from a plain-English requirement.

## Topology

```
  R1 Gi0/1 ──────── Gi0/0 R2 (Lo0 2.2.2.2)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/1 → R2 Gi0/0 (the "uplink") |
| R2 | IOSv | Gi0/0 → R1 Gi0/1 |

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| R1 | Gi0/1 / Lo0 | 10.0.12.1/24 / 1.1.1.1/32 |
| R2 | Gi0/0 / Lo0 | 10.0.12.2/24 / 2.2.2.2/32 |

Run OSPF area 0 on both so R1 learns 2.2.2.2.

## Tasks

1. **Data collection on a failure.** Applet `UPLINK-DOWN-CAPTURE`: when
   Gi0/1's line protocol goes down, append `show ip interface brief`,
   `show ip route` and `show logging | include OSPF` to
   `flash:uplink-down.txt`, then log a severity-2 message saying so.
2. **Guard rail.** Applet `BLOCK-RELOAD`: when anyone types `reload`, don't
   run it; log a warning and print a message instead.
3. **Configuration change audit.** Applet `CONFIG-SAVED`: whenever the
   configuration is changed (`%SYS-5-CONFIG_I`), copy the running config to
   `flash:last-change.cfg` without any interactive prompt.
4. **Scheduled check.** Applet `HEARTBEAT`: every 120 seconds append
   `show clock` and `show ip ospf neighbor` to `flash:heartbeat.txt`.
5. **Manual tool.** Applet `DIAG` with `event none`, which you run with
   `event manager run DIAG`, collecting `show processes cpu sorted | include
   CPU` and `show memory statistics` into `flash:diag.txt`.
6. **React to a probe.** IP SLA 1 pings 2.2.2.2 every 5 seconds;
   `track 1 ip sla 1 reachability`. Applet `R2-LOST`: when track 1 goes down,
   log a critical message and raise the OSPF cost on Gi0/1 to 1000. Write
   its partner `R2-BACK` to undo it.
7. Test each applet by causing its event, and prove it ran.

## Verification checklist

- `show event manager policy registered` lists all seven applets with the
  right event types (syslog, cli, timer watchdog, none, track)
- After `shutdown` on R1 Gi0/1: `more flash:uplink-down.txt` contains the
  three outputs, and `show logging` has the critical message
- Typing `reload` prints your message and the router does **not** ask
  `Proceed with reload?`
- After any config change, `dir flash:` shows `last-change.cfg` with a fresh
  timestamp
- `more flash:heartbeat.txt` grows by one block every two minutes
- `show event manager history events` shows each applet's trigger time and
  status
- Shutting R2's Lo0 triggers `R2-LOST` (`show run interface Gi0/1` shows
  `ip ospf cost 1000`); restoring it triggers `R2-BACK`

<details><summary>Solution</summary>

```
file prompt quiet
!
event manager applet UPLINK-DOWN-CAPTURE
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/1, changed state to down" maxrun 60
 action 010 cli command "enable"
 action 020 cli command "show ip interface brief | append flash:uplink-down.txt"
 action 030 cli command "show ip route | append flash:uplink-down.txt"
 action 040 cli command "show logging | include OSPF | append flash:uplink-down.txt"
 action 050 syslog priority critical msg "Uplink Gi0/1 down - evidence saved to flash:uplink-down.txt"
!
event manager applet BLOCK-RELOAD
 event cli pattern "^reload" sync yes
 action 010 puts "Reload is blocked by EEM on this router. Remove applet BLOCK-RELOAD first."
 action 020 syslog priority warnings msg "Blocked a reload attempt"
 action 030 set _exit_status "0"
!
event manager applet CONFIG-SAVED
 event syslog pattern "SYS-5-CONFIG_I"
 action 010 cli command "enable"
 action 020 cli command "copy running-config flash:last-change.cfg"
 action 030 syslog msg "Running config copied to flash:last-change.cfg"
!
event manager applet HEARTBEAT
 event timer watchdog time 120
 action 010 cli command "enable"
 action 020 cli command "show clock | append flash:heartbeat.txt"
 action 030 cli command "show ip ospf neighbor | append flash:heartbeat.txt"
!
event manager applet DIAG
 event none
 action 010 cli command "enable"
 action 020 cli command "show processes cpu sorted | include CPU | append flash:diag.txt"
 action 030 cli command "show memory statistics | append flash:diag.txt"
 action 040 puts "Diagnostics saved to flash:diag.txt"
!
ip sla 1
 icmp-echo 2.2.2.2 source-interface Loopback0
 frequency 5
ip sla schedule 1 life forever start-time now
track 1 ip sla 1 reachability
!
event manager applet R2-LOST
 event track 1 state down
 action 010 syslog priority critical msg "R2 unreachable - raising OSPF cost on Gi0/1"
 action 020 cli command "enable"
 action 030 cli command "configure terminal"
 action 040 cli command "interface GigabitEthernet0/1"
 action 050 cli command "ip ospf cost 1000"
 action 060 cli command "end"
!
event manager applet R2-BACK
 event track 1 state up
 action 010 cli command "enable"
 action 020 cli command "configure terminal"
 action 030 cli command "interface GigabitEthernet0/1"
 action 040 cli command "no ip ospf cost 1000"
 action 050 cli command "end"
 action 060 syslog msg "R2 reachable again - OSPF cost restored"
```

**Why `file prompt quiet` (task 3):** `copy running-config flash:...` normally
asks `Destination filename?`. An applet can't answer prompts, so the copy
hangs until `maxrun` kills it. Silencing prompts globally is the simplest fix
(the alternative is `action ... cli command "..." pattern "..."` to answer
each prompt).

**Why `sync yes` and `_exit_status 0` (task 2):** with `sync yes`, IOS waits
for the applet before running the typed command, and the applet's exit
status decides: `0` means "skip the command", `1` means "run it". Without
`sync yes`, the applet runs in parallel and can't stop anything.

**Why `enable` first:** applets start in user EXEC. Any `show` that needs
privileged mode, and every configuration change, fails silently without it.
If you also use AAA command authorisation, add
`event manager session cli username <user>` so the applet's commands are
authorised.

**Why the applet doesn't re-trigger itself (task 3):** `copy` doesn't enter
configuration mode, so it doesn't generate `CONFIG_I`. If an applet's
actions *did* include `configure terminal`, a `CONFIG_I`-triggered applet
would loop; that's the trap in Break it 4.
</details>

## Break it

1. Remove `action 010 cli command "enable"` from `R2-LOST` and fail R2's Lo0.
2. Change `UPLINK-DOWN-CAPTURE`'s pattern to `Gi0/1, changed state to down`.
3. Add `action 015 wait 30` to `UPLINK-DOWN-CAPTURE` and remove `maxrun 60`.
4. Add `configure terminal` and `end` actions to `CONFIG-SAVED`.

<details><summary>Break it — what you should see</summary>

1. **No `enable`:** the applet runs (history shows it) and the syslog action
   fires, but the configuration commands fail, so the cost never changes.
   `debug event manager action cli` shows each command being rejected.
2. **Pattern doesn't match the real message:** syslog prints the full name
   `GigabitEthernet0/1`, so the abbreviation never matches and the applet
   never triggers. Always copy the pattern from `show logging`.
3. **maxrun:** the default is 20 seconds. The 30-second wait outlives it and
   EEM aborts the applet before the `show` commands run. The history shows
   the applet as aborted.
4. **Self-triggering loop:** the applet's own `configure terminal` / `end`
   produces a new `CONFIG_I`, which triggers the applet again. You'll see
   it in `show event manager history events` firing over and over.
   Applets that react to config changes must not make config changes.
</details>

---

# Lab 12 — EIGRP Named Mode, Stubs & Summaries

**Guide sections:** 26.1, 26.4–26.8, 26.10, 26.11 · **Time:** ~70 min · **Diagram:** the DUAL figure in 26.6

**Why this lab:** EIGRP's weak spot is the **query**. When a route disappears
and there's no backup, a router asks all its neighbours, who ask theirs,
until the whole network is involved and one slow router can leave a route
stuck-in-active. Stubs and summaries are how you build query boundaries:
stubs say "don't ask me, I'm a dead end", summaries say "I never told you
about that /24, so don't ask about it". **Story time:** a branch office
shouldn't be asked to help find the head office's lost keys; it should be
told "if it's not yours, ask HQ".

## Topology

```
            Gi0/0       Gi0/0
        R1 ─────────────────── R2        hubs (HQ)
   Gi0/1 │  \ Gi0/2   Gi0/1 /  │ Gi0/2
         │    \             /   │
         │      \         /     │
         │        \     /       │
         │          \ /         │
         │          / \         │
   Gi0/0 │        /     \       │ Gi0/1
        R3 ─ Gi0/1       Gi0/0 ─ R4      spokes (branches)
   (R3 Gi0/1 → R2 Gi0/1,  R4 Gi0/0 → R1 Gi0/2)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → R2 Gi0/0, Gi0/1 → R3 Gi0/0, Gi0/2 → R4 Gi0/0 |
| R2 | IOSv | Gi0/0 → R1 Gi0/0, Gi0/1 → R3 Gi0/1, Gi0/2 → R4 Gi0/1 |
| R3 | IOSv | Gi0/0 → R1, Gi0/1 → R2 |
| R4 | IOSv | Gi0/0 → R1, Gi0/1 → R2 |

Every spoke is dual-homed to both hubs.

## Addressing

| Link / LAN | Subnet | Addresses |
|------------|--------|-----------|
| R1–R2 | 10.0.12.0/24 | .1 / .2 |
| R1–R3 | 10.0.13.0/24 | .1 / .3 |
| R1–R4 | 10.0.14.0/24 | .1 / .4 |
| R2–R3 | 10.0.23.0/24 | .2 / .3 |
| R2–R4 | 10.0.24.0/24 | .2 / .4 |
| R1 Lo10 (HQ servers) | 10.10.0.0/24 | 10.10.0.1 |
| R3 Lo1–Lo4 (branch 3 LANs) | 10.3.0.0/24 – 10.3.3.0/24 | .1 each |
| R4 Lo1–Lo4 (branch 4 LANs) | 10.4.0.0/24 – 10.4.3.0/24 | .1 each |
| Loopback0 | x.x.x.x/32 | router ID |

## Tasks

1. Configure EIGRP **named mode** on all four routers: name `ENTERPRISE`,
   IPv4 address family, AS 100, router ID = Lo0, and `network` statements for
   every interface.
2. Make every loopback passive inside `af-interface`, and protect every
   adjacency with **HMAC-SHA-256** authentication using `af-interface default`.
3. Read `show eigrp protocols`: confirm the K values and that named mode uses
   wide metrics (look for the `RIB-scale` line).
4. Before any stubs: shut R1 Gi0/0 (the hub-to-hub link) and traceroute from
   R1 to 2.2.2.2. Note that a *branch* is now carrying HQ traffic. Restore
   the link.
5. Make R3 and R4 stubs advertising **connected and summary** routes only.
   Repeat task 4 and explain the result.
6. Summarise each branch's four LANs at the branch: R3 advertises
   10.3.0.0/22 and R4 advertises 10.4.0.0/22 out of both uplinks.
7. Branches need nothing but a default: on both hubs' spoke-facing
   interfaces, advertise a summary of `0.0.0.0/0`. Then check what that
   does to the **hub's own** routing table.
8. On R1, read `show ip eigrp topology 10.3.0.0/22` (or `all-links`) and
   name the successor and any feasible successor, justifying it with the
   feasibility condition (reported distance < feasible distance).

## Verification checklist

- `show eigrp address-family ipv4 neighbors` on R1 lists R2, R3 and R4
- `show eigrp address-family ipv4 neighbors detail` on R1 shows R3 and R4
  as `Stub Peer Advertising (CONNECTED SUMMARY) Routes` and
  `Suppressing queries`
- `show eigrp address-family ipv4 interfaces detail` shows
  `Authentication mode is HMAC-SHA-256`
- `show ip route eigrp` on R1: `D 10.3.0.0/22` and `D 10.4.0.0/22` and **no**
  10.3.x.0/24 or 10.4.x.0/24 routes
- `show ip route` on R3: `D* 0.0.0.0/0` via **both** R1 and R2, and
  `D 10.3.0.0/22 is a summary, ... Null0`
- After task 5, shutting R1 Gi0/0 leaves R1 with no route to 2.2.2.2 (the
  stubs refuse to be transit)

<details><summary>Solution</summary>

R1 (R2 is the same pattern with its own addresses and router ID):

```
router eigrp ENTERPRISE
 address-family ipv4 unicast autonomous-system 100
  eigrp router-id 1.1.1.1
  network 10.0.0.0 0.255.255.255
  network 1.1.1.1 0.0.0.0
  af-interface default
   authentication mode hmac-sha-256 EigrpKey1
  exit-af-interface
  af-interface Loopback0
   passive-interface
  exit-af-interface
  af-interface Loopback10
   passive-interface
  exit-af-interface
  af-interface GigabitEthernet0/1
   summary-address 0.0.0.0 0.0.0.0
  exit-af-interface
  af-interface GigabitEthernet0/2
   summary-address 0.0.0.0 0.0.0.0
  exit-af-interface
```

R3 (R4 the same with 10.4.0.0/22 and its own uplinks):

```
router eigrp ENTERPRISE
 address-family ipv4 unicast autonomous-system 100
  eigrp router-id 3.3.3.3
  network 10.0.0.0 0.255.255.255
  network 3.3.3.3 0.0.0.0
  eigrp stub connected summary
  af-interface default
   authentication mode hmac-sha-256 EigrpKey1
   passive-interface
  exit-af-interface
  af-interface GigabitEthernet0/0
   no passive-interface
   summary-address 10.3.0.0 255.255.252.0
  exit-af-interface
  af-interface GigabitEthernet0/1
   no passive-interface
   summary-address 10.3.0.0 255.255.252.0
  exit-af-interface
```

In named mode the HMAC-SHA-256 password is typed directly after the mode, so
no key chain is needed. Key chains are only needed for MD5 or for key
rotation.

**Task 4 and 5, the "aha":** without stubs, R1 learns 2.2.2.2 through R3 and
R4 as well, so when the hub link dies, branch routers carry hub-to-hub
traffic over their small WAN links. A stub only advertises its own connected
and summary routes, never what it learned from one hub to the other, so the
transit path vanishes. That's by design. The fix for "R1 can't reach R2" is a
second hub-to-hub link, not making a branch carry it. The bigger win is
invisible: when a route is lost, R1 and R2 no longer send queries to R3 and
R4.

**Task 7, the hub's own table:** a summary installs a matching discard route
on the router that creates it. Summarising 0.0.0.0/0 gives R1 a
`D* 0.0.0.0/0 is a summary, Null0` with AD 5. Here that's harmless, because R1
knows every specific route. If R1 also had a real default to the internet
learned by any protocol with AD above 5, the Null0 default would override it
and black-hole internet traffic. In classic mode you'd append an AD to the
summary; in named mode, use a different design (a default originated with a
static route and filtering) on hubs that also carry a real default.

**Task 8:** R1's direct path to R3 is the successor (lowest FD). The path via
R2 has a reported distance equal to R2's own distance to R3 over an equal
link, which is the **same**, not smaller, than R1's FD, so it fails the
feasibility condition and isn't a feasible successor. Equal isn't enough.
</details>

## Break it

1. On R3, change the stub to `eigrp stub receive-only`.
2. On R4, add `metric weights 0 1 1 1 1 0 0` under the address family.
3. On R2, change the HMAC password on `af-interface GigabitEthernet0/1` only
   to `EigrpKey2`.
4. On R4, change the address family to `autonomous-system 200`.

<details><summary>Break it — what you should see</summary>

1. **receive-only:** R3 still learns the default, but advertises nothing, so
   R1 and R2 lose 10.3.0.0/22 and 3.3.3.3. A receive-only stub needs the hubs
   to have static routes to its LANs.
2. **K-value mismatch:** R4's adjacencies drop and the log shows
   `K-value mismatch`. K values must match for neighbours to form.
3. **Authentication mismatch on one link:** only R2–R3 fails. R3 still
   reaches everything through R1, so users notice nothing, and
   `show eigrp address-family ipv4 neighbors` on R2 is the only clue (R3
   missing). `debug eigrp packets` shows the authentication failures.
4. **AS mismatch:** no hellos are accepted, R4 has no neighbours at all. AS
   number, authentication, K values and the primary subnet must match; the
   process name (`ENTERPRISE`) doesn't.
</details>

---

# Lab 13 — OSPF Stub, NSSA & a Virtual Link

**Guide sections:** 27.5, 27.6, 27.8, 6.2, 6.3 · **Time:** ~70 min · **Diagram:** the virtual link figure in 27.6

**Why this lab:** special area types are all about keeping LSAs out of areas
that don't need them. A branch area with one exit doesn't need 500 external
routes; one default does the same job. A virtual link is the patch for a
design rule broken by history: every area must touch area 0, and sometimes,
after a merger, one doesn't.

## Topology

```
  [Area 0]            [Area 1]          [Area 2]
  R1 ──────── R2 ──────────── R3 ──────────── R4
 (ASBR)        │  (ABR 0/1/3)    (ABR 1/2)
               │
               │ [Area 3 = NSSA]
               R5 (ASBR)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → R2 Gi0/0 (area 0) |
| R2 | IOSv | Gi0/0 → R1, Gi0/1 → R3 Gi0/0 (area 1), Gi0/2 → R5 Gi0/0 (area 3) |
| R3 | IOSv | Gi0/0 → R2 (area 1), Gi0/1 → R4 Gi0/0 (area 2) |
| R4 | IOSv | Gi0/0 → R3 (area 2) |
| R5 | IOSv | Gi0/0 → R2 (area 3) |

## Addressing

| Device | Interface | IP | Area |
|--------|-----------|-----|------|
| R1 | Gi0/0 / Lo0 | 10.0.12.1/24 / 1.1.1.1/32 | 0 / 0 |
| R2 | Gi0/0 / Gi0/1 / Gi0/2 / Lo0 | 10.0.12.2 / 10.0.23.2 / 10.0.25.2 / 2.2.2.2 | 0 / 1 / 3 / 0 |
| R3 | Gi0/0 / Gi0/1 / Lo0 | 10.0.23.3 / 10.0.34.3 / 3.3.3.3 | 1 / 2 / 1 |
| R4 | Gi0/0 / Lo0 | 10.0.34.4 / 4.4.4.4 | 2 / 2 |
| R5 | Gi0/0 / Lo0 | 10.0.25.5 / 5.5.5.5 | 3 / 3 |

All links /24; loopbacks /32. External routes for the lab: R1 owns
**192.168.100.0/24** and R5 owns **172.31.5.0/24** (each as a static route to
Null0, redistributed into OSPF).

## Tasks

1. Build OSPF process 1 everywhere as in the table (point-to-point network
   type on the links). R1 and R5 redistribute their static routes with
   `redistribute static subnets`.
2. Check R4's routing table and R1's. Area 2 doesn't touch area 0, so R3
   won't pass inter-area routes into it. Describe exactly what's missing.
3. Build a **virtual link** across area 1 between R2 and R3. Use the router
   IDs, not interface addresses. Re-check R4 and R1.
4. Try to make area 1 a stub area. Read the error and explain it.
5. Make area 2 a **stub** area (both R3 and R4) and compare R4's table before
   and after: the E2 route goes, an `O*IA` default appears. Then make it
   **totally stubby** (`no-summary` on R3 only) and compare again.
6. Make area 3 an **NSSA** (R2 and R5). Find R5's external route as `O N2` on
   R2 and as `O E2` on R1, and work out which router translated it.
7. Notice that R5 has no default route as a plain NSSA. Give it one with
   `area 3 nssa default-information-originate` on R2, then switch to
   **totally NSSA** (`no-summary`) and compare R5's table.
8. Read the LSDB on R4 and R5 and list which LSA types are present in each
   area and why.

## Verification checklist

- `show ip ospf virtual-links` on R2: `Virtual Link OSPF_VL0 to router
  3.3.3.3 is up`, and `show ip ospf neighbor` lists 3.3.3.3 on `OSPF_VL0`
- With area 2 stub: R4 shows `O*IA 0.0.0.0/0` and no `O E2 192.168.100.0`
- With area 2 totally stubby: R4 shows **only** intra-area routes and the
  `O*IA` default
- R2 shows `O N2 172.31.5.0/24`; R1 shows `O E2 172.31.5.0/24`
- `show ip ospf database external 172.31.5.0` on R1 lists advertising
  router 2.2.2.2 (the translator), not 5.5.5.5
- With totally NSSA: R5 shows an `O*IA 0.0.0.0/0` and no `O IA` routes
- `show ip ospf` on R3 (the ABR) says area 2 `It is a stub area, no summary
  LSA in this area`; on R4 it says `It is a stub area`

<details><summary>Solution</summary>

R2:

```
router ospf 1
 router-id 2.2.2.2
 area 1 virtual-link 3.3.3.3
 area 3 nssa no-summary            ! task 7 final state (before: nssa default-information-originate)
interface Gi0/0
 ip ospf 1 area 0
 ip ospf network point-to-point
interface Gi0/1
 ip ospf 1 area 1
 ip ospf network point-to-point
interface Gi0/2
 ip ospf 1 area 3
 ip ospf network point-to-point
interface Lo0
 ip ospf 1 area 0
```

R3:

```
router ospf 1
 router-id 3.3.3.3
 area 1 virtual-link 2.2.2.2
 area 2 stub no-summary            ! totally stubby: no-summary only on the ABR
interface Gi0/0
 ip ospf 1 area 1
 ip ospf network point-to-point
interface Gi0/1
 ip ospf 1 area 2
 ip ospf network point-to-point
interface Lo0
 ip ospf 1 area 1
```

R4: `area 2 stub` (plain; the `no-summary` part is only meaningful on the
ABR). R5: `area 3 nssa`, plus:

```
ip route 172.31.5.0 255.255.255.0 Null0
router ospf 1
 redistribute static subnets
```

R1 does the same with 192.168.100.0/24 in area 0.

**Task 2, what's missing:** R4 sees only area 2's own routes, and R1 sees
nothing from area 2. A router attached to two areas without a backbone
connection doesn't act as an ABR for them; inter-area routing always goes
through area 0.

**Task 4, the error:** a virtual link is a tunnel *through* the transit area,
carrying area 0 information. A stub area by definition blocks type 4 and 5
LSAs, and IOS refuses to make a transit area for a virtual link stub (or
NSSA). The transit area must be a normal area.

**Task 6, the translator:** inside an NSSA, R5 can't create type 5 LSAs, so it
creates a **type 7**, which only exists in area 3. The ABR (R2) translates it
into a type 5 for the rest of the network, which is why R1 sees R2, not R5,
as the advertising router.

**Task 7, the missing default:** a stub area gets a default automatically,
because its whole point is "use the default for everything external". An
NSSA doesn't, because it may have its own way out (the ASBR inside it). You
have to ask for one; totally NSSA gives one automatically as type 3.
</details>

## Break it

1. Remove `area 2 stub` from R4 only.
2. On R2, change the virtual link to `area 1 virtual-link 10.0.23.3`.
3. On R5, change the redistribution to `redistribute static` (no `subnets`).
4. Return area 3 to a plain NSSA (no `no-summary`, no
   `default-information-originate`) and look for any route on R5 that
   covers 192.168.100.0/24.

<details><summary>Break it — what you should see</summary>

1. **Stub flag mismatch:** the R3–R4 adjacency drops. `debug ip ospf hello`
   shows `Mismatched Stub/Transit area option bit`. Every router in an area
   must agree on its type.
2. **Virtual link by IP address:** the VL never comes up, because the
   command takes the far end's **router ID**. `show ip ospf virtual-links`
   shows it down, and area 2 is cut off again.
3. **Missing `subnets` (older IOS):** 172.31.5.0/24 is a subnet of the
   class B 172.31.0.0, so it isn't redistributed. R2 and R1 lose it. Newer
   IOS XE adds `subnets` automatically, which is why this catches people on
   older images.
4. **No default in a plain NSSA:** R5 knows the inter-area routes, but R1's
   external 192.168.100.0/24 is a type 5 LSA, which is never allowed into an
   NSSA, and there's no default to cover it. R5 has no route at all. It's
   the NSSA default trap from task 7.
</details>

---

# Lab 14 — Mutual Redistribution Without Loops

**Guide sections:** 23.2, 23.4, 23.5, 24.1–24.4 · **Time:** ~75 min · **Diagram:** the mutual redistribution figure in 24.4

**Why this lab:** redistribution erases a route's history. A route born in
EIGRP comes out of OSPF looking like any other OSPF external, and the second
boundary router can't tell it's its own route coming back. **Story time:**
it's gossip. You tell a friend something, it goes round the office, and a week
later someone tells it back to you as news from a "reliable source". Route
tags are you writing your initials on the note, so you recognise it when it
comes back.

## Topology

```
        [EIGRP AS 100]                [OSPF area 0]
              ┌──── Gi0/0 R2 Gi0/1 ────┐
  R1 Gi0/0 ───┘                        └─── Gi0/0 R4
     Gi0/1 ───┐                        ┌─── Gi0/1
              └──── Gi0/0 R3 Gi0/1 ────┘
                 (both boundaries redistribute both ways)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → R2 Gi0/0, Gi0/1 → R3 Gi0/0 (EIGRP only) |
| R2 | IOSv | Gi0/0 → R1 (EIGRP), Gi0/1 → R4 Gi0/0 (OSPF) |
| R3 | IOSv | Gi0/0 → R1 (EIGRP), Gi0/1 → R4 Gi0/1 (OSPF) |
| R4 | IOSv | Gi0/0 → R2, Gi0/1 → R3 (OSPF only) |

## Addressing

| Device | Interface | IP | Domain |
|--------|-----------|-----|--------|
| R1 | Gi0/0 / Gi0/1 | 10.0.12.1 / 10.0.13.1 | EIGRP |
| R1 | Lo0 / Lo10 | 1.1.1.1/32 / 10.1.1.1/24 | EIGRP internal |
| R1 | Lo1 | 192.168.1.1/24 | EIGRP **external** (redistributed connected) |
| R2 | Gi0/0 / Gi0/1 / Lo0 | 10.0.12.2 / 10.0.24.2 / 2.2.2.2 | boundary |
| R3 | Gi0/0 / Gi0/1 / Lo0 | 10.0.13.3 / 10.0.34.3 / 3.3.3.3 | boundary |
| R4 | Gi0/0 / Gi0/1 | 10.0.24.4 / 10.0.34.4 | OSPF |
| R4 | Lo0 / Lo10 | 4.4.4.4/32 / 10.4.4.1/24 | OSPF internal |
| R4 | Lo1 | 192.168.4.1/24 | OSPF **external** (redistributed connected) |

Links are /24. The two "external" loopbacks are what make this interesting:
EIGRP externals have AD **170**, so they lose to any OSPF route (110).

## Tasks

1. Build EIGRP AS 100 (classic mode, for variety) on R1 and the EIGRP side
   of R2 and R3; OSPF area 0 on R4 and the OSPF side of R2 and R3. Boundary
   loopbacks go in OSPF.
2. On R1, redistribute **only** Lo1 into EIGRP (route map matching the
   interface). On R4, redistribute only Lo1 into OSPF.
3. Configure mutual redistribution on **R2 only**, with a seed metric into
   EIGRP and `subnets` into OSPF. Confirm everything reaches everything.
4. Add the same mutual redistribution on **R3**. Now check
   `show ip route 192.168.1.0` on R2 and R3, and traceroute to 192.168.1.1
   from both. One boundary is sending traffic for R1's network the long way
   round through R4. Explain why using AD.
5. **Fix the loop risk with tags:** on both boundaries, tag everything going
   EIGRP→OSPF with 90 and OSPF→EIGRP with 110, and deny routes carrying the
   *other* domain's tag at each redistribution point.
6. Re-check task 4. Tags alone don't fix the long path. Try the guide's AD
   fix, `distance ospf external 171`, on R2 and R3, and check both
   192.168.1.0 (should be fixed) and 192.168.4.0 (now broken the other way).
   Explain why, then remove it.
7. **Fix the suboptimal paths with tags too:** on R2 and R3, refuse to
   *install* routes that are your own domain's routes coming back: under
   OSPF, `distribute-list route-map ... in` denying tag 90; under EIGRP,
   denying tag 110.
8. Final proof: shut R1's Lo1. 192.168.1.0/24 must disappear from every
   router within seconds and never come back on its own.

## Verification checklist

- `show ip route 192.168.1.0` on R3: `Known via "eigrp 100"`, distance 170,
  via 10.0.13.1; traceroute from R3 reaches 192.168.1.1 in **one** hop
- `show ip route 192.168.4.0` on R2: `Known via "ospf 1"`, `type extern 2`,
  via 10.0.24.4
- `show ip ospf database external 192.168.1.0` on R4 shows
  `External Route Tag: 90` from advertising routers 2.2.2.2 and 3.3.3.3
- `show ip eigrp topology 192.168.4.0/24` on R1 shows
  `Administrator tag is 110`
- `show route-map` on R2 shows the deny clauses with match counts
- After shutting R1 Lo1, `show ip route 192.168.1.0` returns
  `% Network not in table` on every router

<details><summary>Solution</summary>

R1:

```
route-map LO1-ONLY permit 10
 match interface Loopback1
router eigrp 100
 network 10.0.0.0
 network 1.1.1.1 0.0.0.0
 redistribute connected metric 100000 10 255 1 1500 route-map LO1-ONLY
```

R4:

```
route-map LO1-ONLY permit 10
 match interface Loopback1
router ospf 1
 router-id 4.4.4.4
 network 10.0.24.0 0.0.0.255 area 0
 network 10.0.34.0 0.0.0.255 area 0
 network 4.4.4.4 0.0.0.0 area 0
 network 10.4.4.0 0.0.0.255 area 0
 redistribute connected subnets route-map LO1-ONLY
```

R2 (R3 is identical apart from interfaces and router ID):

```
route-map EIGRP-TO-OSPF deny 10
 match tag 110
route-map EIGRP-TO-OSPF permit 20
 set tag 90
!
route-map OSPF-TO-EIGRP deny 10
 match tag 90
route-map OSPF-TO-EIGRP permit 20
 set tag 110
!
route-map OSPF-IN deny 10
 match tag 90                       ! our EIGRP routes coming back through OSPF
route-map OSPF-IN permit 20
!
route-map EIGRP-IN deny 10
 match tag 110                      ! OSPF routes coming back through EIGRP
route-map EIGRP-IN permit 20
!
router eigrp 100
 network 10.0.12.0 0.0.0.255
 redistribute ospf 1 metric 100000 10 255 1 1500 route-map OSPF-TO-EIGRP
 distribute-list route-map EIGRP-IN in
!
router ospf 1
 router-id 2.2.2.2
 network 10.0.24.0 0.0.0.255 area 0
 network 2.2.2.2 0.0.0.0 area 0
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
 distribute-list route-map OSPF-IN in
```

**Task 4, why the long path:** suppose R2 redistributed 192.168.1.0/24 into
OSPF first. R3 now hears it twice: from R1 as an EIGRP external (AD 170) and
from R4 as OSPF E2 (AD 110). Lower AD wins, so R3 sends traffic for a network
one hop away across the OSPF domain, through R4 and R2. And because R3's copy
is now an OSPF route, R3 redistributes it *back into EIGRP*: that's the
feedback loop waiting to happen when R1's route goes away.

**Task 6, why the AD fix half-works here:** raising OSPF externals to 171 makes
R3 prefer the EIGRP external for 192.168.1.0 (good). But R4's 192.168.4.0/24
is *also* an OSPF external, and it gets redistributed into EIGRP by the other
boundary, so R2 now hears it as EIGRP external (170) via R1 and as OSPF E2
(171) from R4, and takes the long way the other direction. The guide's AD
fix works perfectly when only one domain has externals. With externals on
both sides, the global knob can't tell "native" from "reflected"; the tag can.

**Task 7, why distribute-list in:** the tag tells the boundary "this route
was born on *my* side of the boundary". Refusing to install it from the far
side means the boundary always uses the native path. The trade-off: if R3's
own link to R1 fails, R3 won't fall back to the OSPF path to reach
192.168.1.0. Traffic *through* R3 is unaffected, because R4 still has R2's
copy.
</details>

## Break it

1. On R2, remove the `metric 100000 10 255 1 1500` from `redistribute ospf 1`.
2. On R3, remove the `permit 20` clause from `EIGRP-TO-OSPF`.
3. On R3, change `set tag 90` to `set tag 91` in `EIGRP-TO-OSPF`.
4. On R2 only, remove `distribute-list route-map OSPF-IN in` from OSPF and
   clear the OSPF process.

<details><summary>Break it — what you should see</summary>

1. **No seed metric:** OSPF routes redistributed into EIGRP get an infinite
   metric and aren't advertised. R1 loses everything behind R4 via R2 and
   uses R3 only. With *both* boundaries missing it, R1 learns nothing.
2. **No permit clause:** the route map's implicit deny blocks everything.
   R3 redistributes nothing into OSPF, and R4 only learns EIGRP routes via R2.
   It looks fine until R2 fails.
3. **Inconsistent tags:** R3's externals carry tag 91. R2's `OSPF-IN` denies
   tag 90 only, so R2 installs R3's copy of EIGRP routes from OSPF again. One
   wrong number on one router reintroduces the suboptimal path. Tag schemes
   only work when they're identical everywhere.
4. **Half the design removed:** R2 now accepts R3's E2 copy of
   192.168.1.0/24 (AD 110) over its own EIGRP external (170), so R2 takes the
   long path through R4 and R3 again. There's still no loop, because R2's
   outbound `OSPF-TO-EIGRP` denies tag 90 and the route can't re-enter EIGRP.
   That's the division of labour: outbound tag filters stop **loops**,
   inbound tag filters stop **suboptimal paths**.
</details>

---

# Lab 15 — BGP Path Manipulation

**Guide sections:** 28.6, 28.8, 7.7, 7.8, 23.2, 23.4 · **Time:** ~75 min · **Diagram:** the iBGP next hop figure in 28.2

**Why this lab:** you control which way your traffic *leaves* (with weight
and local preference, decided inside your AS), but you can only *ask* the
world how to come back in (with AS-path prepending, MED or communities,
which other ASes may ignore). Getting those two directions straight is the
whole lab.

## Topology

```
                    R5 (AS 65300, "internet")
            Gi0/0 /                \ Gi0/1
         Gi0/1   /                  \   Gi0/1
     AS 65100  R3                    R4  AS 65200
         Gi0/0  |                    |  Gi0/0
         Gi0/1  |                    |  Gi0/1
               R1 ────────────────── R2
                  Gi0/0  AS 65001  Gi0/0
```

| Device | Image | AS | Links |
|--------|-------|----|-------|
| R1 | IOSv | 65001 | Gi0/0 → R2, Gi0/1 → R3 Gi0/0 |
| R2 | IOSv | 65001 | Gi0/0 → R1, Gi0/1 → R4 Gi0/0 |
| R3 | IOSv | 65100 (ISP A) | Gi0/0 → R1, Gi0/1 → R5 Gi0/0 |
| R4 | IOSv | 65200 (ISP B) | Gi0/0 → R2, Gi0/1 → R5 Gi0/1 |
| R5 | IOSv | 65300 | Gi0/0 → R3, Gi0/1 → R4 |

## Addressing

| Link / prefix | Addresses |
|---------------|-----------|
| R1–R2 | 10.0.12.0/24 (.1/.2), OSPF area 0 with Lo0s |
| R1–R3 | 192.0.2.0/30 (R1 .1, R3 .2) |
| R2–R4 | 192.0.2.4/30 (R2 .5, R4 .6) |
| R3–R5 | 192.0.2.8/30 (R3 .9, R5 .10) |
| R4–R5 | 192.0.2.12/30 (R4 .13, R5 .14) |
| Enterprise | 10.1.0.0/16 (static to Null0 on R1 and R2, plus R1 Lo10 10.1.1.1/24) |
| R5 Lo10 / Lo11 | 8.8.8.8/24 / 9.9.9.9/24 (prefixes 8.8.8.0/24 and 9.9.9.0/24) |

## Tasks

1. Build the baseline: OSPF between R1 and R2 (Gi0/0 and Lo0), iBGP on
   loopbacks with `next-hop-self`, eBGP to each ISP, and the ISPs to R5.
   R1 and R2 both advertise 10.1.0.0/16; R5 advertises 8.8.8.0/24 and
   9.9.9.0/24.
2. **Don't become a transit AS.** Check R3's table: it can learn R4's and
   R5's routes through AS 65001. Fix it on R1 and R2 with an outbound filter
   that only lets **locally originated** routes out (AS-path regex `^$`).
3. **Outbound, everything via ISP A:** on R1, set local preference 200 on
   everything received from R3. Confirm R2 now sends 8.8.8.0/24 traffic to R1.
4. **Exception, the wrong way first:** on R2, give 9.9.9.0/24 from R4 a
   **weight** of 500. Check where R1 sends 9.9.9.0/24 traffic and explain.
5. **Exception, the right way:** replace the weight with local preference
   300 for 9.9.9.0/24 on R2's inbound policy from R4 (and keep every other
   prefix from R4).
6. **Inbound, prefer ISP A:** prepend AS 65001 three extra times toward R4.
   Check R5's choice for 10.1.0.0/16.
7. Set MED 50 toward R3 and MED 200 toward R4 and check whether R5 cares.
   Explain the result, then remove the MEDs.
8. Apply each policy change with a **soft** refresh, never a hard clear,
   and know which direction (`in` or `out`) each change needs.

## Verification checklist

- `show ip bgp` on R3 lists only `10.1.0.0/16` from AS 65001, with path
  `65001 i` (no AS 65200 or 65300 routes through 65001)
- `show ip bgp 8.8.8.0` on R2: best path `*>i` via 1.1.1.1 with
  `localpref 200`
- `show ip bgp 9.9.9.0` on R1: best path via 2.2.2.2 with `localpref 300`
- `show ip bgp 10.1.0.0` on R5: best path `65100 65001`; the other path is
  `65200 65001 65001 65001 65001`
- Traceroute from R2 to 8.8.8.8 (source Lo0) goes R1 → R3 → R5
- `show ip bgp neighbors 192.0.2.6 policy` on R2 (or `show run | section
  router bgp`) shows both route maps attached

<details><summary>Solution</summary>

R1:

```
ip as-path access-list 1 permit ^$
!
route-map ISP-A-IN permit 10
 set local-preference 200
route-map TO-ISP permit 10
 match as-path 1
!
router bgp 65001
 neighbor 2.2.2.2 remote-as 65001
 neighbor 2.2.2.2 update-source Loopback0
 neighbor 2.2.2.2 next-hop-self
 neighbor 192.0.2.2 remote-as 65100
 neighbor 192.0.2.2 route-map ISP-A-IN in
 neighbor 192.0.2.2 route-map TO-ISP out
 network 10.1.0.0 mask 255.255.0.0
```

R2:

```
ip as-path access-list 1 permit ^$
ip prefix-list NINE seq 5 permit 9.9.9.0/24
!
route-map ISP-B-IN permit 10
 match ip address prefix-list NINE
 set local-preference 300
route-map ISP-B-IN permit 20
!
route-map ISP-B-OUT permit 10
 match as-path 1
 set as-path prepend 65001 65001 65001
!
router bgp 65001
 neighbor 1.1.1.1 remote-as 65001
 neighbor 1.1.1.1 update-source Loopback0
 neighbor 1.1.1.1 next-hop-self
 neighbor 192.0.2.6 remote-as 65200
 neighbor 192.0.2.6 route-map ISP-B-IN in
 neighbor 192.0.2.6 route-map ISP-B-OUT out
 network 10.1.0.0 mask 255.255.0.0
```

Refreshes (task 8): inbound policy changes need
`clear ip bgp 192.0.2.6 soft in` (or `clear ip bgp * soft in`), outbound
changes need `soft out`.

**Task 2, why `^$`:** an empty AS path means "originated inside my own AS".
Routes from either ISP have at least one AS in the path, so they're blocked
from going to the other ISP. Without this, R3 might decide the best way to
AS 65200 is through *you*, and your WAN links carry their traffic.

**Task 4, why the weight didn't help R1:** weight is Cisco-only and
**never leaves the router**. R2 prefers R4 for 9.9.9.0/24, but R1 still
sees its own path via R3 with local preference 200 and uses it. Local
preference is carried in iBGP to every router in the AS, so it's the tool for
AS-wide decisions.

**Task 5, why `permit 20`:** without an empty permit clause, the route map's
implicit deny drops every other prefix from R4. R2 would lose ISP B's
backup routes entirely.

**Task 7, why R5 ignores the MEDs:** MED is compared only between paths from
the **same neighbouring AS**. R5's two paths come from AS 65100 and AS 65200,
so it skips the MED step. MED would work if you had two links to the same
ISP.
</details>

## Break it

1. Remove `route-map ISP-B-IN permit 20` on R2 and soft-clear inbound.
2. Change the local preference on R1, but don't clear anything. Check the
   table.
3. Prepend with `65999 65999 65999` instead of your own AS.
4. Put `set local-preference 200` in the **outbound** route map toward R3.

<details><summary>Break it — what you should see</summary>

1. **Implicit deny:** R2's table only has 9.9.9.0/24 from R4. Everything else
   from ISP B is gone, so ISP B is no longer a backup. `show ip bgp neighbors
   192.0.2.6 received-routes` (with soft-reconfiguration inbound) or the
   prefix count in `show ip bgp summary` shows the drop.
2. **No refresh:** the new value isn't applied to routes already received.
   The table shows the old local preference until a `soft in` refresh. (Newer
   IOS XE releases may refresh automatically; IOSv generally doesn't.)
3. **Prepending someone else's AS:** it lengthens the path, but if AS 65999
   ever sees it, it rejects the route (loop prevention), and it's misleading
   to anyone troubleshooting. Only prepend your own AS.
4. **Local preference to an eBGP peer:** it's not sent to eBGP neighbours at
   all. Nothing changes on R3. Local preference only influences routers
   inside your own AS.
</details>

---

# Lab 16 — PBR with IP SLA Tracking

**Guide sections:** 25.1, 32.6, 5.9 · **Time:** ~60 min · **Diagram:** the IP SLA tracking figure in 32.6

**Why this lab:** normal routing looks only at the destination. Policy-based
routing lets you say "traffic from *this* host goes *that* way", which is how
you send guest Wi-Fi out the cheap link while staff use the fast one. The
risk is that PBR keeps forwarding into a dead link unless you make it check,
and the check is IP SLA plus object tracking.

## Topology

```
                     Gi0/1      Gi0/0       Gi0/1    Gi0/0
  PC1 ─┐           ┌─────────── R2 (ISP1) ──────────────┐
       SW1 ─ Gi0/0 R1                                    R4  Lo0 8.8.8.8
  PC2 ─┘           └─────────── R3 (ISP2) ──────────────┘    Lo1 4.4.4.1
                     Gi0/2      Gi0/0       Gi0/1    Gi0/1   Lo2 4.4.4.2
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → SW1 (LAN), Gi0/1 → R2 Gi0/0, Gi0/2 → R3 Gi0/0 |
| R2 | IOSv | Gi0/0 → R1, Gi0/1 → R4 Gi0/0 |
| R3 | IOSv | Gi0/0 → R1, Gi0/1 → R4 Gi0/1 |
| R4 | IOSv | Gi0/0 → R2, Gi0/1 → R3 |
| SW1 | IOSvL2 | PC1, PC2, R1 |
| PC1, PC2 | VPCS | → SW1 |

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| R1 | Gi0/0 / Gi0/1 / Gi0/2 | 10.1.1.1/24 / 10.0.12.1/24 / 10.0.13.1/24 |
| R2 | Gi0/0 / Gi0/1 | 10.0.12.2/24 / 10.0.24.2/24 |
| R3 | Gi0/0 / Gi0/1 | 10.0.13.3/24 / 10.0.34.3/24 |
| R4 | Gi0/0 / Gi0/1 | 10.0.24.4/24 / 10.0.34.4/24 |
| R4 | Lo0 / Lo1 / Lo2 | 8.8.8.8/32 / 4.4.4.1/32 / 4.4.4.2/32 |
| PC1 / PC2 | eth0 | 10.1.1.10 / 10.1.1.20, gateway .1 |

**The "internet":** R2, R3 and R4 run OSPF area 0 among themselves (not with
R1). R2 and R3 each have a static route to 10.1.1.0/24 via R1 and
redistribute it into OSPF, so R4 has two return paths. Use
`ip ospf hello-interval 1` / `dead-interval 3` on the R2/R3/R4 links so the
"internet" reconverges quickly.

## Tasks

1. Build the provider side as described. Confirm R4 has two equal OSPF routes
   to 10.1.1.0/24.
2. On R1: IP SLA 1 pings 4.4.4.1 every 5 seconds **out Gi0/1**, IP SLA 2
   pings 4.4.4.2 **out Gi0/2**. Pin each probe target to its ISP with a /32
   static route so the probe can never wander onto the other link.
3. Track both probes (`track 1`, `track 2`) with a 10-second down delay and
   20-second up delay so one lost ping doesn't cause a flap.
4. Primary default via ISP1 tied to track 1; floating default via ISP2 with
   AD 10.
5. PBR: PC2 (10.1.1.20) always uses ISP2, **unless** track 2 is down, in
   which case it follows the normal routing table. Apply it where PC2's
   packets *enter* R1.
6. Prove it: traceroute from PC1 and PC2 to 8.8.8.8 and compare the second hop.
7. Fail ISP1 by shutting **R2 Gi0/1** (an upstream failure R1 can't see
   locally). Watch track 1 go down and PC1 move to ISP2.
8. Restore ISP1, fail ISP2 by shutting **R3 Gi0/1**, and prove PC2 falls back
   to ISP1 instead of being black-holed.

## Verification checklist

- `show ip sla statistics` on R1: both operations `OK`, success counts rising
- `show track brief` on R1: track 1 and 2 `Up`
- `show ip route static` on R1: `S* 0.0.0.0/0 [1/0] via 10.0.12.2` while
  track 1 is up; `[10/0] via 10.0.13.3` after task 7
- `show route-map PBR-LAN` shows `Policy routing matches:` counters rising
  when PC2 sends traffic; `show ip policy` lists Gi0/0
- PC1 `trace 8.8.8.8` second hop 10.0.12.2; PC2 second hop 10.0.13.3
- After task 8: `show route-map PBR-LAN` shows the next hop with
  `[down]` for track 2, and PC2's trace goes via 10.0.12.2

<details><summary>Solution</summary>

R1:

```
ip route 4.4.4.1 255.255.255.255 10.0.12.2
ip route 4.4.4.2 255.255.255.255 10.0.13.3
!
ip sla 1
 icmp-echo 4.4.4.1 source-interface GigabitEthernet0/1
 frequency 5
ip sla schedule 1 life forever start-time now
ip sla 2
 icmp-echo 4.4.4.2 source-interface GigabitEthernet0/2
 frequency 5
ip sla schedule 2 life forever start-time now
!
track 1 ip sla 1 reachability
 delay down 10 up 20
track 2 ip sla 2 reachability
 delay down 10 up 20
!
ip route 0.0.0.0 0.0.0.0 10.0.12.2 track 1
ip route 0.0.0.0 0.0.0.0 10.0.13.3 10
!
ip access-list extended PC2-TRAFFIC
 permit ip host 10.1.1.20 any
route-map PBR-LAN permit 10
 match ip address PC2-TRAFFIC
 set ip next-hop verify-availability 10.0.13.3 10 track 2
!
interface GigabitEthernet0/0
 ip policy route-map PBR-LAN
```

R2 (R3 is the same with its own addresses):

```
ip route 10.1.1.0 255.255.255.0 10.0.12.1
router ospf 1
 network 10.0.24.0 0.0.0.255 area 0
 redistribute static subnets
interface GigabitEthernet0/1
 ip ospf hello-interval 1
 ip ospf dead-interval 3
```

R4: OSPF on both links and all loopbacks, with the same timers.

**Why pin the probes (task 2):** without the /32 routes, probe 1 follows the
default route. When ISP1 fails and the default moves to ISP2, probe 1 starts
succeeding *through ISP2*, track 1 comes back up, the default moves back to
the broken ISP1, the probe fails again... a flap every few seconds. The
probe must test the path it's guarding, and only that path.

**Why `verify-availability ... track 2` (task 5):** plain `set ip next-hop
10.0.13.3` only needs 10.0.13.3 to sit on a connected interface that's up.
When R3's *upstream* dies, Gi0/2 is still up and R3 still answers ARP, so
PC2's traffic would be black-holed. With the track
attached, a down track makes PBR skip that next hop and fall through to the
routing table.

**Why on Gi0/0 (task 5):** `ip policy` acts on packets **arriving** on the
interface. PC2's packets arrive on Gi0/0. R1's own traffic (pings, probes,
routing protocols) doesn't arrive on any interface, so it's only
policy-routed with `ip local policy route-map`.
</details>

## Break it

1. Remove the two /32 pinning routes and repeat task 7.
2. Change PBR to plain `set ip next-hop 10.0.13.3` and repeat task 8.
3. Move `ip policy route-map PBR-LAN` from Gi0/0 to Gi0/2.
4. Change the PBR action to `set ip default next-hop 10.0.13.3` and
   compare PC2's path with ISP1 healthy.

<details><summary>Break it — what you should see</summary>

1. **Unpinned probe:** track 1 flaps up and down (`%TRACK-6-STATE` messages
   alternating), and PC1's connectivity comes and goes with it.
2. **No verification:** during the ISP2 upstream failure, PC2's traffic still
   goes to R3 and dies there. `show route-map` keeps counting matches, so
   the counters look healthy while the users are down.
3. **Wrong interface:** PBR on Gi0/2 only sees packets arriving *from* ISP2.
   PC2's traffic is never matched and follows the default via ISP1. The
   `Policy routing matches` counter stays at 0.
4. **`default next-hop`:** this next hop is used only when the routing table
   has **no explicit route** to the destination, and the default route
   doesn't count as explicit. On R1 the only route to 8.8.8.8 is the
   default, so PC2 still goes via ISP2. Now add
   `ip route 8.8.8.0 255.255.255.0 10.0.12.2`: PC2 follows that specific
   route via ISP1 and ignores the PBR. `set ip next-hop` overrides the
   table; `set ip default next-hop` only fills the gaps.
</details>

---

# Lab 17 — VRF-Lite

**Guide sections:** 12.5, 12.6, 25.2, 26.3, 28.9 · **Time:** ~55 min · **Diagram:** the VRF-lite figure in 25.2

**Why this lab:** a VRF turns one router into several routers that happen to
share a chassis. Each VRF has its own routing table, its own interfaces and
its own routing processes, so two customers (or two departments) can even use
the *same* addresses without ever meeting. **Story time:** it's a block of
flats. Every flat has a "Flat 1, kitchen", and nobody gets confused, because
the address includes the building entrance you came in through.

## Topology

```
 PC-RA ─ Gi0/1                         Gi0/1 ─ PC-RB
              R1 Gi0/0 ═══════ Gi0/0 R2
 PC-BA ─ Gi0/2   (.10 RED, .20 BLUE,   Gi0/2 ─ PC-BB
                  .99 global)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → R2 Gi0/0 (802.1Q subinterfaces), Gi0/1 → PC-RA, Gi0/2 → PC-BA |
| R2 | IOSv | Gi0/0 → R1, Gi0/1 → PC-RB, Gi0/2 → PC-BB |
| PC-RA, PC-RB | VPCS | customer RED |
| PC-BA, PC-BB | VPCS | customer BLUE |

## Addressing

Overlapping on purpose: RED and BLUE use exactly the same subnets.

| Device | Interface | VRF | IP |
|--------|-----------|-----|-----|
| R1 | Gi0/0.10 | RED | 10.0.12.1/30 |
| R1 | Gi0/0.20 | BLUE | 10.0.12.1/30 |
| R1 | Gi0/0.99 | global | 10.0.99.1/30 |
| R1 | Gi0/1 | RED | 192.168.1.1/24 |
| R1 | Gi0/2 | BLUE | 192.168.1.1/24 |
| R2 | Gi0/0.10 / .20 / .99 | RED / BLUE / global | 10.0.12.2/30 / 10.0.12.2/30 / 10.0.99.2/30 |
| R2 | Gi0/1 | RED | 192.168.2.1/24 |
| R2 | Gi0/2 | BLUE | 192.168.2.1/24 |
| PC-RA / PC-BA | eth0 | — | 192.168.1.10/24, gateway .1 |
| PC-RB / PC-BB | eth0 | — | 192.168.2.10/24, gateway .1 |
| R1 / R2 | Lo0 | global | 1.1.1.1/32 / 2.2.2.2/32 |

## Tasks

1. Create `vrf definition RED` and `vrf definition BLUE` on both routers,
   each with `address-family ipv4`.
2. Configure the LAN interfaces and dot1Q subinterfaces. Type the IP address
   **before** `vrf forwarding` on one interface and watch what IOS does.
3. Route RED with **OSPF** (process 10, `vrf RED`) and BLUE with **EIGRP**
   named mode (`address-family ipv4 vrf BLUE autonomous-system 20`). Route the
   global table (Lo0s over .99) with OSPF process 1.
4. Prove reachability inside each VRF: PC-RA pings PC-RB, PC-BA pings PC-BB.
5. Prove the separation: identical addresses in both VRFs, different MACs
   in `show ip arp vrf RED` and `show ip arp vrf BLUE`; the global table has
   no 192.168 routes at all.
6. Ping and traceroute from the router itself inside each VRF, and run
   the routing-protocol `show` commands for each VRF.

## Verification checklist

- `show vrf` lists RED and BLUE with their interfaces
- `show ip route vrf RED` has `O 192.168.2.0/24`; `show ip route vrf BLUE`
  has `D 192.168.2.0/24`; `show ip route` (global) has neither
- `show ip ospf 10 neighbor` (or `show ip ospf neighbor`) shows the RED
  neighbour on Gi0/0.10; `show eigrp address-family ipv4 vrf BLUE
  neighbors` shows the BLUE neighbour on Gi0/0.20
- `ping vrf RED 192.168.2.10` and `ping vrf BLUE 192.168.2.10` both succeed
  and reach **different** PCs (check the MAC in each VRF's ARP table)
- Plain `ping 192.168.2.10` from R1 fails (the global table has no route)

<details><summary>Solution</summary>

R1 (R2 mirrors it with its own addresses):

```
vrf definition RED
 address-family ipv4
 exit-address-family
vrf definition BLUE
 address-family ipv4
 exit-address-family
!
interface GigabitEthernet0/0
 no shutdown
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 vrf forwarding RED
 ip address 10.0.12.1 255.255.255.252
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 vrf forwarding BLUE
 ip address 10.0.12.1 255.255.255.252
interface GigabitEthernet0/0.99
 encapsulation dot1Q 99
 ip address 10.0.99.1 255.255.255.252
interface GigabitEthernet0/1
 vrf forwarding RED
 ip address 192.168.1.1 255.255.255.0
interface GigabitEthernet0/2
 vrf forwarding BLUE
 ip address 192.168.1.1 255.255.255.0
!
router ospf 10 vrf RED
 router-id 10.10.10.1
 network 10.0.12.0 0.0.0.3 area 0
 network 192.168.1.0 0.0.0.255 area 0
!
router eigrp VRF-EIGRP
 address-family ipv4 unicast vrf BLUE autonomous-system 20
  eigrp router-id 20.20.20.1
  network 10.0.12.0 0.0.0.3
  network 192.168.1.0
!
router ospf 1
 router-id 1.1.1.1
 network 10.0.99.0 0.0.0.3 area 0
 network 1.1.1.1 0.0.0.0 area 0
```

**Task 2, the surprise:** applying `vrf forwarding` to an interface that
already has an address prints
`% Interface ... IPv4 disabled and address(es) removed due to enabling VRF`.
Moving an interface into a VRF moves it into a different routing table, so
IOS deletes the old address rather than guess. Always set the VRF first.

**Why separate router IDs per VRF process:** each VRF's OSPF or EIGRP is a
separate process. If it picked its ID automatically it would choose from the
interfaces in *that* VRF, which here overlap. Setting them by hand avoids a
duplicate-router-ID surprise.

**Everything takes the VRF name:** `ping vrf`, `traceroute vrf`,
`show ip route vrf`, `show ip arp vrf`, `show ip cef vrf`. Forgetting it is
the most common "it's broken" that isn't.
</details>

## Break it

1. On R2, remove `vrf forwarding RED` from Gi0/0.10 (and re-add the address).
2. On R2, swap the dot1Q tags: Gi0/0.10 gets `encapsulation dot1Q 20` and
   Gi0/0.20 gets `dot1Q 10`.
3. On R1, give the RED OSPF process the same router ID as the global one
   (1.1.1.1), and on R2 do the same for its RED process (1.1.1.1).
4. From R1, run `ping 192.168.2.10` without the `vrf` keyword.

<details><summary>Break it — what you should see</summary>

1. **Interface in the wrong table:** R2's Gi0/0.10 is now in the global
   table, so the RED OSPF process on R2 doesn't run on it. No RED neighbour,
   RED sites can't talk. `show vrf` shows Gi0/0.10 missing from RED.
2. **Swapped tags:** R1's RED subinterface now talks to R2's BLUE
   subinterface. OSPF hellos arrive at an EIGRP-only interface and vice
   versa, so neither protocol forms an adjacency. Both customers are down.
   This is how VRF mistakes look on a real trunk: everything's up/up and
   nothing works.
3. **Duplicate router ID inside one OSPF domain:** R1 and R2 log
   `%OSPF-4-DUP_RTRID_NBR` and refuse the adjacency in VRF RED. Router IDs
   must be unique per OSPF domain, and each VRF is its own domain.
4. **Not a fault:** the global table has no route, so the ping fails. The
   VRF is fine. Learn to recognise this one quickly.
</details>

---

# Lab 18 — GRE over IPsec (IKEv2)

**Guide sections:** 12.7–12.11 · **Time:** ~65 min · **Diagram:** the tunnel encapsulations figure in 12.7

**Why this lab:** GRE gives you a virtual wire across the internet that can
carry anything, including routing protocol multicasts, but it's plain text.
IPsec gives you encryption but, on its own, doesn't carry multicast. Put GRE
inside IPsec and you get both: a private wire you can run OSPF over.
**Story time:** GRE is an envelope with a forwarding address; IPsec is a
locked courier bag. You put the envelope inside the bag.

## Topology

```
  Lo10 10.1.1.1/24                                Lo10 10.3.3.1/24
       R1 Gi0/0 ────── Gi0/0 R2 (ISP) Gi0/1 ────── Gi0/0 R3
      (HQ)                                              (Branch)
       └════════════ Tunnel0 172.16.13.0/30 ═══════════┘
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → R2 Gi0/0 |
| R2 | IOSv | Gi0/0 → R1, Gi0/1 → R3 Gi0/0 (the "internet": knows only public addresses) |
| R3 | IOSv | Gi0/0 → R2 Gi0/1 |

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| R1 | Gi0/0 | 203.0.113.1/30 |
| R1 | Lo10 / Tunnel0 | 10.1.1.1/24 / 172.16.13.1/30 |
| R2 | Gi0/0 / Gi0/1 | 203.0.113.2/30 / 198.51.100.2/30 |
| R3 | Gi0/0 | 198.51.100.1/30 |
| R3 | Lo10 / Tunnel0 | 10.3.3.1/24 / 172.16.13.2/30 |

R1 and R3 each have a static default to R2. R2 has no routes to 10.x or
172.16.x, so private traffic can only cross inside the tunnel.

## Tasks

1. Build the underlay and prove R1 can ping 198.51.100.1 sourced from
   Gi0/0.
2. Build a GRE tunnel (Tunnel0) between R1 and R3 using the physical
   interfaces as source and the peer's public address as destination. Add
   `keepalive 5 3` so the tunnel goes down when the far end is gone.
3. Run OSPF area 0 over Tunnel0 and the Lo10s **only**. Prove 10.1.1.0/24
   and 10.3.3.0/24 are learned through Tunnel0.
4. Capture the R1–R2 link in EVE-NG and ping 10.3.3.1 sourced from Lo10.
   You can read the inner ICMP and OSPF in plain text.
5. Protect the tunnel with IPsec: an IKEv2 keyring and profile (pre-shared
   key), a transform set with AES-256 and SHA-256 in **transport** mode, an
   IPsec profile, and `tunnel protection ipsec profile` on Tunnel0.
6. Capture again. Now you should see only ESP between the two public
   addresses.
7. Set `ip mtu 1400` and `ip tcp adjust-mss 1360` on both tunnel interfaces
   and prove that a 1400-byte ping with DF set passes and a 1450-byte one
   doesn't.

## Verification checklist

- `show interface Tunnel0` is up/up and shows `Tunnel protocol/transport GRE/IP`
  and `Tunnel protection via IPSec (profile "GRE-PROT")`
- `show ip ospf neighbor` on R1 shows 3.3.3.3 `FULL` on Tunnel0
- `show ip route ospf` on R1: `O 10.3.3.0/24 via 172.16.13.2, Tunnel0`
- `show crypto ikev2 sa` shows the peer with status `READY`
- `show crypto ipsec sa` shows `#pkts encaps` and `#pkts decaps` rising as
  you ping between the Lo10s
- The second capture shows ESP only (protocol 50), no GRE, ICMP or OSPF
- `ping 10.3.3.1 source lo10 size 1400 df-bit` succeeds; `size 1450 df-bit`
  fails with `M` (fragmentation needed)

<details><summary>Solution</summary>

R1 is shown. R3 mirrors it with the peer address 203.0.113.1 (in the
keyring, the profile's `match identity` and `tunnel destination`), tunnel
address 172.16.13.2, router ID 3.3.3.3 and its own Lo10 network.

```
ip route 0.0.0.0 0.0.0.0 203.0.113.2
!
crypto ikev2 keyring KR
 peer BRANCH
  address 198.51.100.1
  pre-shared-key GreIpsecKey1
!
crypto ikev2 profile IKEV2-PROF
 match identity remote address 198.51.100.1 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR
!
crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac
 mode transport
!
crypto ipsec profile GRE-PROT
 set transform-set TS
 set ikev2-profile IKEV2-PROF
!
interface Tunnel0
 ip address 172.16.13.1 255.255.255.252
 ip mtu 1400
 ip tcp adjust-mss 1360
 keepalive 5 3
 tunnel source GigabitEthernet0/0
 tunnel destination 198.51.100.1
 tunnel protection ipsec profile GRE-PROT
!
router ospf 1
 router-id 1.1.1.1
 network 172.16.13.0 0.0.0.3 area 0
 network 10.1.1.0 0.0.0.255 area 0
```

IKEv2 smart defaults supply a default proposal and policy, so only the
keyring and profile are mandatory. `show crypto ikev2 proposal default`
shows what's offered.

**Why transport mode:** GRE already adds a new outer IP header (public
source and destination). Tunnel mode would add *another* one inside ESP for
nothing. Transport mode encrypts the GRE packet and keeps its header,
saving 20 bytes per packet.

**Why `ip mtu 1400` and `adjust-mss 1360`:** GRE adds 24 bytes and ESP adds
roughly 50–60 more. A 1500-byte packet from the LAN would have to be
fragmented after encryption, which is slow and often broken by firewalls.
Lowering the tunnel MTU makes the router fragment (or reject, with DF) on
the way *in*, and lowering the TCP MSS makes TCP endpoints never send
segments that big in the first place. 1400 − 20 (IP) − 20 (TCP) = 1360.
</details>

## Break it

1. Change the pre-shared key on R3 to `GreIpsecKey2`.
2. Add `network 203.0.113.0 0.0.0.3 area 0` on R1 and `network
   198.51.100.0 0.0.0.3 area 0` on R3 (advertise the underlay into OSPF).
3. Change R3's transform set to `esp-aes 128 esp-sha256-hmac`.
4. On R3, change `tunnel destination` to 203.0.113.2.

<details><summary>Break it — what you should see</summary>

1. **PSK mismatch:** no IKEv2 SA (`show crypto ikev2 sa` empty or stuck),
   and `debug crypto ikev2` shows an authentication failure. With tunnel
   protection, GRE packets aren't sent unprotected, so the tunnel carries
   nothing and OSPF drops after its dead timer.
2. **Recursive routing:** each router learns the route to the other's
   *public* address through OSPF... over the tunnel. The tunnel's destination
   is now reached through the tunnel itself. IOS detects it and logs
   `%TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing`;
   the tunnel flaps. Never advertise the tunnel destination through the
   tunnel.
3. **Transform-set mismatch:** IKEv2 comes up (`READY`), but no IPsec SA
   is created, because phase 2 proposals don't match. `show crypto ipsec sa`
   has no SPIs; the debug shows `no proposal chosen`. Two phases, two places
   to check.
4. **Wrong destination:** R3 sends to R2 instead of R1. R1 ignores the
   traffic (not its peer), keepalives fail and Tunnel0 goes up/down on R3.
   Tunnel source on one end must equal tunnel destination on the other.
</details>

---

# Lab 19 — DMVPN Phase 3

**Guide sections:** 30.1–30.10 · **Time:** ~80 min · **Diagram:** the DMVPN topology figure in 30.1 and the Phase 3 sequence in 30.5

**Why this lab:** point-to-point GRE needs a tunnel per pair of sites, which
doesn't scale past a handful. DMVPN gives every router **one** multipoint
tunnel. Spokes register with the hub using NHRP; when one spoke wants to talk
to another, the hub introduces them and they build a direct tunnel on
demand. **Story time:** the hub is a receptionist. The first call goes
through reception; the receptionist says "you'll want to call them directly,
here's their number", and from then on the two talk directly.

## Topology

```
                   R1 (hub)
                    | Gi0/0  198.51.100.1
                    | Gi0/0  198.51.100.2
                   R4 (ISP)
         Gi0/1 /            \ Gi0/2
    203.0.113.1              203.0.113.5
   203.0.113.2 /              \ 203.0.113.6
       Gi0/0  R2              R3  Gi0/0
        (spoke 1)          (spoke 2)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → R4 Gi0/0 |
| R2 | IOSv | Gi0/0 → R4 Gi0/1 |
| R3 | IOSv | Gi0/0 → R4 Gi0/2 |
| R4 | IOSv | Gi0/0 → R1, Gi0/1 → R2, Gi0/2 → R3 (routes public addresses only) |

## Addressing

| Device | NBMA (Gi0/0) | Tunnel0 | LAN (Lo10) |
|--------|--------------|---------|------------|
| R1 hub | 198.51.100.1/30 | 10.0.0.1/24 | 10.10.0.1/24 |
| R2 spoke 1 | 203.0.113.2/30 | 10.0.0.11/24 | 10.11.0.1/24 |
| R3 spoke 2 | 203.0.113.6/30 | 10.0.0.12/24 | 10.12.0.1/24 |
| R4 ISP | .2 / .1 / .5 on its three links | — | — |

Each of R1, R2 and R3 has a static default to R4. The NBMA addresses are
deliberately **outside** 10.0.0.0/8, so the hub's summary never covers them.

## Tasks

1. Build the underlay. From R2, ping R3's NBMA address 203.0.113.6 and R1's
   198.51.100.1.
2. **Hub tunnel:** mGRE (`tunnel mode gre multipoint`), tunnel key 100, NHRP
   network ID 1, NHRP authentication `NHRPKEY`, dynamic multicast mapping, and
   `ip nhrp redirect`.
3. **Spoke tunnels:** mGRE with the same key and NHRP settings, the hub as
   NHS (`ip nhrp nhs 10.0.0.1 nbma 198.51.100.1 multicast`), and
   `ip nhrp shortcut`.
4. Check registration on the hub: both spokes listed, learned dynamically.
5. Run EIGRP AS 100 over Tunnel0 and the Lo10s. On the hub, disable split
   horizon on Tunnel0 and advertise a summary of 10.0.0.0/8 to the spokes.
6. From R2, `traceroute 10.12.0.1 source lo10` twice. The first goes via the
   hub (10.0.0.1, then 10.0.0.12); the second goes direct (10.0.0.12 only).
   Explain the difference with `show ip nhrp` and `show ip route` on R2.
7. Add IPsec: an IKEv1 policy (AES-256, SHA-256, DH group 14, pre-shared
   key with a wildcard peer address), a transport-mode transform set and an
   IPsec profile, applied with `tunnel protection` on all three routers.
   Repeat task 6.
8. Set `ip mtu 1400` and `ip tcp adjust-mss 1360` on all tunnels.

## Verification checklist

- `show dmvpn` on R1: two peers, NBMA 203.0.113.2 and 203.0.113.6, state
  `UP`, attribute `D` (dynamic)
- `show ip nhrp` on R1: `10.0.0.11/32 via 10.0.0.11 ... dynamic ... NBMA
  address: 203.0.113.2` and the same for 10.0.0.12
- `show ip eigrp neighbors` on R1 lists both spokes on Tunnel0; each spoke
  lists only the hub
- `show ip route` on R2 before task 6: `D 10.0.0.0/8 via 10.0.0.1`; after the
  first traceroute: an `H` (NHRP) route for 10.12.0.0/24 via 10.0.0.12
- `show dmvpn` on R2 after task 6 shows a second, dynamic entry for R3
- `show crypto isakmp sa` on R2 after task 7: `QM_IDLE` to the hub **and** to
  R3; `show crypto ipsec sa` counters rise on both

<details><summary>Solution</summary>

All three routers (IPsec, task 7):

```
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key DMVPNKEY address 0.0.0.0
crypto ipsec transform-set DMVPN-TS esp-aes 256 esp-sha256-hmac
 mode transport
crypto ipsec profile DMVPN-PROF
 set transform-set DMVPN-TS
```

Hub R1:

```
ip route 0.0.0.0 0.0.0.0 198.51.100.2
interface Tunnel0
 ip address 10.0.0.1 255.255.255.0
 no ip redirects
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp authentication NHRPKEY
 ip nhrp network-id 1
 ip nhrp holdtime 300
 ip nhrp map multicast dynamic
 ip nhrp redirect
 no ip split-horizon eigrp 100
 ip summary-address eigrp 100 10.0.0.0 255.0.0.0
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint
 tunnel key 100
 tunnel protection ipsec profile DMVPN-PROF
router eigrp 100
 network 10.0.0.0 0.0.0.255
 network 10.10.0.0 0.0.0.255
```

Spoke R2 (R3 the same with 10.0.0.12, 10.12.0.0 and its own default route):

```
ip route 0.0.0.0 0.0.0.0 203.0.113.1
interface Tunnel0
 ip address 10.0.0.11 255.255.255.0
 no ip redirects
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp authentication NHRPKEY
 ip nhrp network-id 1
 ip nhrp holdtime 300
 ip nhrp nhs 10.0.0.1 nbma 198.51.100.1 multicast
 ip nhrp shortcut
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint
 tunnel key 100
 tunnel protection ipsec profile DMVPN-PROF
router eigrp 100
 network 10.0.0.0 0.0.0.255
 network 10.11.0.0 0.0.0.255
```

**Task 6, step by step:** R2's only route to 10.12.0.1 is the hub's summary,
so the first packet goes to the hub. The hub forwards it out the *same*
tunnel it came in on, which is the trigger for `ip nhrp redirect`: it tells
R2 "there's a better next hop for this". R2 (because of `ip nhrp shortcut`)
sends an NHRP resolution request, R3 answers directly with its NBMA address,
and R2 installs an NHRP route (`H`) for 10.12.0.0/24 via 10.0.0.12, with a
direct spoke-to-spoke tunnel. The second traceroute uses it.

**Why the summary is safe here:** Phase 3 doesn't need the spokes to see each
other's specific routes (unlike Phase 2), because NHRP fills them in on
demand. That's what lets the hub send one summary to every spoke. The
summary must not cover the NBMA addresses, or the spokes would try to reach
the hub's public address through the tunnel (recursive routing).
</details>

## Break it

1. On R3, change `tunnel key 100` to `tunnel key 101`.
2. On R1, remove `ip nhrp map multicast dynamic`.
3. On R2, remove `ip nhrp shortcut`, then traceroute R2 → R3 LAN and R3 → R2
   LAN twice each.
4. On R3, change `ip nhrp network-id 1` to `ip nhrp network-id 5`.

<details><summary>Break it — what you should see</summary>

1. **Tunnel key mismatch:** R3's GRE packets carry key 101 and the hub
   drops them. R3 never registers; `show dmvpn` on R3 shows the hub in
   `NHRP` or down state, and the hub lists only R2.
2. **No multicast mapping on the hub:** registration still works (NHRP is
   unicast), so `show dmvpn` looks perfect, but EIGRP hellos (multicast)
   aren't sent to the spokes. No EIGRP neighbours, no routes. The classic
   "DMVPN is up but routing isn't".
3. **No shortcut on R2:** the hub still sends redirects, but R2 ignores them,
   so R2 → R3 always goes via the hub. R3 → R2 can still go direct (R3 has
   `shortcut`). The asymmetry is the clue.
4. **Network ID mismatch:** nothing breaks. The NHRP network ID is
   **locally significant**; it ties an interface to an NHRP instance on that
   router, and isn't compared with the peer. A good fact to have ready when a
   question offers it as the cause.
</details>

---

# Lab 20 — AAA with RADIUS Fallback & uRPF

**Guide sections:** 17.1–17.4, 31.1, 31.4 · **Time:** ~70 min · **Diagram:** the AAA conversation figure in 17.3

**Why this lab:** central authentication is only safe if you know exactly
when the router falls back to its local users. The rule surprises almost
everyone: IOS moves to the next method only when the server **doesn't
answer**. If the server answers "no", that's final. Then uRPF: a cheap check
that drops packets whose source address couldn't possibly have arrived on
that interface, which is most spoofed traffic. **Story time:** fallback is a
night porter. If the manager's phone doesn't answer, the porter decides; if
the manager answers and says "don't let them in", the porter doesn't
overrule the manager.

## Topology

```
  RAD (FreeRADIUS) ── Gi0/1 R1 Gi0/0 ────── Gi0/0 R2
   10.1.1.100                               (admin workstation + "internet",
                                              also the spoofer)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/1 → RAD, Gi0/0 → R2 Gi0/0 |
| R2 | IOSv | Gi0/0 → R1 |
| RAD | Linux node with `freeradius` installed (Ubuntu/Debian: `apt install freeradius`) | eth0 → R1 Gi0/1 |

No Linux image? Tasks 1–5 and 7 still work with no RADIUS server at all,
because fallback is exactly what happens when the server doesn't answer.
Task 6 and 8 need the server.

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| R1 | Gi0/1 / Gi0/0 / Lo0 | 10.1.1.1/24 / 10.0.12.1/24 / 1.1.1.1/32 |
| R2 | Gi0/0 / Lo0 | 10.0.12.2/24 / 2.2.2.2/32 |
| R2 | Lo66 (spoof source, unknown to R1) | 10.66.66.66/32 |
| R2 | Lo50 (spoof source, R1's own LAN) | 10.1.1.50/32 |
| RAD | eth0 | 10.1.1.100/24, gateway 10.1.1.1 |

R1: default route to R2, plus `ip route 2.2.2.2 255.255.255.255 10.0.12.2`.
R2: `ip route 10.1.1.0 255.255.255.0 10.0.12.1` and `ip route 1.1.1.1
255.255.255.255 10.0.12.1`.

## Tasks

1. **Lockout-proof order:** before `aaa new-model`, create a local user
   `admin` (privilege 15, scrypt secret) and an enable secret. Enable SSH on
   R1 (domain name, 2048-bit RSA keys, version 2).
2. Turn on AAA. Define the RADIUS server (`radius server RAD1`, key
   `RadKey123`), put it in a server group `RAD-GRP`, and source RADIUS from
   Gi0/1.
3. Build **named** method lists: `VTY-LOGIN` = RADIUS group then local;
   `CON-LOGIN` = local only; exec authorisation `VTY-EXEC` = RADIUS then
   local; exec accounting start-stop to RAD-GRP. Apply them to the vty
   lines (SSH only) and the console.
4. Make the dead-server detection quick: `radius-server dead-criteria time 5
   tries 2` and `radius-server deadtime 1`.
5. **Server unreachable:** shut R1 Gi0/1 (or leave RAD switched off). From R2,
   `ssh -l admin 1.1.1.1`. You get in after a short delay. Explain the delay.
6. **Server up, user known:** bring RAD up with a user `netadmin` /
   `radpass` that gets privilege 15 via a Cisco AV-pair. Test with
   `test aaa group RAD-GRP netadmin radpass legacy`, then SSH in as netadmin
   and check `show privilege`.
7. Now SSH in as `admin` (the local user) while RAD is **up**. Explain the
   result.
8. **uRPF:** apply strict mode (`ip verify unicast source reachable-via rx`)
   on R1 Gi0/0. From R2, ping RAD (10.1.1.100) three ways: sourced from Lo0
   (2.2.2.2), Lo66 (10.66.66.66) and Lo50 (10.1.1.50). Predict which pass.
9. Change to `reachable-via rx allow-default` and repeat. Then explain when
   you'd use loose mode (`reachable-via any`) instead.

## Verification checklist

- `show aaa servers` shows RAD1 `UP` when reachable and `DEAD` after task 5's
  failure is detected
- `show aaa method-lists authentication` lists `VTY-LOGIN` with
  `group RAD-GRP local` and `CON-LOGIN` with `local`
- Task 5: SSH as `admin` succeeds with RAD down
- Task 6: `test aaa` reports `User was successfully authenticated`, and
  `show privilege` after SSH as netadmin reports level 15
- Task 7: SSH as `admin` **fails** while RAD is up
- `show ip interface Gi0/0` on R1 shows `IP verify source reachable-via RX`
  and a rising `verification drops` counter after the spoofed pings
- Task 8 result: 2.2.2.2 passes, 10.66.66.66 and 10.1.1.50 are dropped;
  task 9: 10.66.66.66 passes, 10.1.1.50 is still dropped

<details><summary>Solution</summary>

R1:

```
username admin privilege 15 algorithm-type scrypt secret LocalPass1
enable algorithm-type scrypt secret EnablePass1
ip domain-name lab.local
crypto key generate rsa modulus 2048
ip ssh version 2
!
aaa new-model
radius server RAD1
 address ipv4 10.1.1.100 auth-port 1812 acct-port 1813
 key RadKey123
aaa group server radius RAD-GRP
 server name RAD1
 ip radius source-interface GigabitEthernet0/1
radius-server dead-criteria time 5 tries 2
radius-server deadtime 1
!
aaa authentication login VTY-LOGIN group RAD-GRP local
aaa authentication login CON-LOGIN local
aaa authorization exec VTY-EXEC group RAD-GRP local
aaa accounting exec default start-stop group RAD-GRP
!
line con 0
 login authentication CON-LOGIN
line vty 0 4
 login authentication VTY-LOGIN
 authorization exec VTY-EXEC
 transport input ssh
!
interface GigabitEthernet0/0
 ip verify unicast source reachable-via rx
```

FreeRADIUS on RAD. Add to `/etc/freeradius/3.0/clients.conf`:

```
client r1 {
    ipaddr = 10.1.1.1
    secret = RadKey123
}
```

Add to the top of `/etc/freeradius/3.0/users` (the file may be called
`mods-config/files/authorize` on newer releases):

```
netadmin Cleartext-Password := "radpass"
         Service-Type = NAS-Prompt-User,
         Cisco-AVPair = "shell:priv-lvl=15"
```

Then `sudo systemctl restart freeradius` (or run `sudo freeradius -X` in the
foreground to watch each request arrive). Give RAD its address and a default
route to 10.1.1.1.

**Task 5, the delay:** R1 first tries RAD1 and waits for the timeout and
retransmits before declaring it dead and moving to `local`. The
dead-criteria and deadtime settings make the next login immediate: for one
minute, R1 skips the dead server altogether.

**Task 7, why `admin` fails:** RAD answered with **Access-Reject** (it has
no user `admin`). A reject is an answer, so IOS stops there and never tries
`local`. Fallback is for *unreachable*, not for *refused*. That's why the
console has its own `local`-only list: if the RADIUS database is wrong, you
can still get in on the console.

**Task 8, uRPF strict:** for each arriving packet, R1 looks up the **source**
address and checks that the best route back to it leaves through the same
interface it arrived on. 2.2.2.2 is routed out Gi0/0: pass. 10.1.1.50 is
routed out Gi0/1: a packet claiming to be from R1's own LAN arriving from
the outside is spoofed: drop. 10.66.66.66 only matches the default route,
and strict uRPF ignores the default unless you add `allow-default`.

**Task 9, loose mode:** with two ISPs, return traffic can legitimately arrive
on the "wrong" interface (asymmetric routing), so strict mode drops real
traffic. Loose mode (`reachable-via any`) only checks that the source exists
somewhere in the routing table, which still drops packets from unrouted
(bogon) space.
</details>

## Break it

1. Change the RADIUS key on R1 to `RadKey999` (RAD unchanged) and log in as
   netadmin, then as admin.
2. Remove `CON-LOGIN` from the console and set the default list to
   `aaa authentication login default group RAD-GRP`, with RAD down.
3. Also apply uRPF strict on R1 Gi0/1 (the RAD side) and repeat the
   netadmin login. Predict first whether anything breaks.
4. On RAD, change the client's `ipaddr` in `clients.conf` to 1.1.1.1 (R1's
   loopback), restart FreeRADIUS, and log in as netadmin, then as admin.

<details><summary>Break it — what you should see</summary>

1. **Key mismatch:** RAD silently drops the request (it can't verify the
   authenticator) and `freeradius -X` logs a shared-secret problem. To R1
   that looks like **no answer**, so after the timeout it falls back to
   local: admin works, netadmin doesn't. A wrong key behaves like a dead
   server, not like a reject.
2. **Console lockout risk:** a method list with no `local` at the end, and a
   dead server, means nobody can log in anywhere. Recovery is the password
   recovery procedure. This is why you build and test the local fallback
   *before* touching AAA.
3. **Nothing breaks:** RAD's replies arrive on Gi0/1 from 10.1.1.100, and
   R1's best route to 10.1.1.100 is out Gi0/1, so they pass. uRPF only asks
   "is the source routed back out this interface?". On a single-homed LAN
   the answer is always yes for real hosts, which makes strict uRPF a safe
   anti-spoofing filter on user-facing interfaces.
4. **Requests from an unknown client:** R1 sources RADIUS from Gi0/1
   (10.1.1.1), but RAD now only accepts 1.1.1.1, so it ignores the requests
   (`freeradius -X` logs `unknown client`). To R1 that's no answer: after
   the timeout netadmin fails and admin works through the local fallback.
   The source address must match what the server has registered, which is
   why `ip radius source-interface` is worth setting deliberately.
</details>

---

# Lab 21 — DHCPv6 & IPv6 First-Hop Security

**Guide sections:** 32.5, 31.6, 27.1 · **Time:** ~70 min

**Why this lab:** in IPv6, hosts trust Router Advertisements completely. Any
device that sends an RA can become everyone's default gateway, and any device
that answers DHCPv6 can hand out DNS servers. First-hop security is the
switch refusing to forward RAs and DHCPv6 server messages from ports where no
router or server should be. You'll first see the attack work, then stop it.

## Topology

```
                 R1 (legitimate router + DHCPv6 server)
                  | Gi0/0
                  | Gi0/0
                 SW1
       Gi0/1 /    | Gi0/2   \ Gi0/3
           R2    PC1         R3
   (DHCPv6 client)  (SLAAC)   (rogue router + rogue DHCPv6 server)
```

| Device | Image | Links |
|--------|-------|-------|
| R1 | IOSv | Gi0/0 → SW1 Gi0/0 |
| SW1 | IOSvL2 | Gi0/0 → R1, Gi0/1 → R2, Gi0/2 → PC1, Gi0/3 → R3; all access VLAN 1 |
| R2 | IOSv (used as a host so it can run a full DHCPv6 client) | Gi0/0 → SW1 Gi0/1 |
| PC1 | VPCS | eth0 → SW1 Gi0/2 |
| R3 | IOSv (the attacker) | Gi0/0 → SW1 Gi0/3 |

**Image note:** IOSvL2 supports RA guard and DHCPv6 guard policies on most
builds. If yours rejects `ipv6 nd raguard policy`, swap SW1 for a Catalyst
9000v node; the commands are identical.

## Addressing

| Device | Interface | IP |
|--------|-----------|-----|
| R1 | Gi0/0 | 2001:db8:10:1::1/64, link-local fe80::1 |
| R2 | Gi0/0 | from DHCPv6 (stateful) |
| PC1 | eth0 | SLAAC (`ip auto`) |
| R3 | Gi0/0 | 2001:db8:bad:1::1/64 (rogue prefix) |

DNS server handed out: 2001:db8:10::53 (legitimate) and 2001:db8:bad::53
(rogue). Domain `lab.local`.

## Tasks

1. **Stateless DHCPv6:** R1 sends RAs for 2001:db8:10:1::/64 with the
   **O flag** (other-config) set and serves DNS and domain from a DHCPv6 pool.
   PC1 runs `ip auto`; check it formed a SLAAC address.
2. **Stateful DHCPv6:** add a second pool with an address prefix, switch R1
   to the **M flag** (managed-config) and make R2 a DHCPv6 client
   (`ipv6 address dhcp`). Leave the prefix's autonomous flag on, so PC1 can
   still use SLAAC alongside.
3. Give R2 a default route via fe80::1 on Gi0/0 (R2 is acting as a host, so it
   must not run `ipv6 unicast-routing`).
4. Read the bindings on R1 and the client state on R2.
5. **Attack:** on R3, enable IPv6 routing and configure the rogue prefix on
   Gi0/0 (it starts sending RAs), plus a DHCPv6 pool with the rogue DNS
   server. Restart PC1's `ip auto` and look at its addresses and router.
6. **Defend with RA guard:** on SW1, an RA guard policy with `device-role
   host` on every port except Gi0/0, and `device-role router` on Gi0/0.
7. **Defend with DHCPv6 guard:** a DHCPv6 guard policy with `device-role
   client` on host ports and `device-role server` on Gi0/0.
8. Repeat the attack. Restart PC1 (to clear its learned addresses) and R2's
   DHCPv6 client (`shutdown`/`no shutdown`), and prove only legitimate
   information arrives.

## Verification checklist

- PC1 `show ipv6` after task 1: a global 2001:db8:10:1:... address and the
  router fe80::1
- `show ipv6 dhcp binding` on R1 after task 2: R2's DUID with an `IA NA`
  address from 2001:db8:10:1::/64
- `show ipv6 dhcp interface Gi0/0` on R2: `State is OPEN`, the server's
  address and the DNS server 2001:db8:10::53
- `show ipv6 interface Gi0/0` on R1 shows `Hosts use DHCP to obtain routable
  addresses` (M flag) after task 2
- After task 5 (attack): PC1 has an extra 2001:db8:bad:1:... address
- `show ipv6 nd raguard policy HOSTS` on SW1 lists Gi0/1–0/3 as targets
- After task 8: PC1 has **no** 2001:db8:bad address, and R2's DNS server is
  only 2001:db8:10::53

<details><summary>Solution</summary>

R1 (final state, stateful + stateless info):

```
ipv6 unicast-routing
ipv6 dhcp pool STATELESS
 dns-server 2001:db8:10::53
 domain-name lab.local
ipv6 dhcp pool STATEFUL
 address prefix 2001:db8:10:1::/64
 dns-server 2001:db8:10::53
 domain-name lab.local
!
interface GigabitEthernet0/0
 ipv6 address fe80::1 link-local
 ipv6 address 2001:db8:10:1::1/64
 ipv6 nd managed-config-flag            ! task 2 (task 1 used other-config-flag)
 ipv6 dhcp server STATEFUL              ! task 1 used STATELESS
```

R2 (acting as a host):

```
interface GigabitEthernet0/0
 ipv6 enable
 ipv6 address dhcp
 no shutdown
ipv6 route ::/0 GigabitEthernet0/0 fe80::1
```

R3 (the attacker):

```
ipv6 unicast-routing
ipv6 dhcp pool ROGUE
 address prefix 2001:db8:bad:1::/64
 dns-server 2001:db8:bad::53
interface GigabitEthernet0/0
 ipv6 address 2001:db8:bad:1::1/64
 ipv6 dhcp server ROGUE
 no shutdown
```

SW1:

```
ipv6 nd raguard policy HOSTS
 device-role host
ipv6 nd raguard policy ROUTER
 device-role router
ipv6 dhcp guard policy CLIENTS
 device-role client
ipv6 dhcp guard policy SERVER
 device-role server
!
interface GigabitEthernet0/0
 ipv6 nd raguard attach-policy ROUTER
 ipv6 dhcp guard attach-policy SERVER
interface range GigabitEthernet0/1 - 3
 ipv6 nd raguard attach-policy HOSTS
 ipv6 dhcp guard attach-policy CLIENTS
```

**The flags, in one table:**

| RA flags | What hosts do |
|----------|---------------|
| no M, no O | SLAAC only (DNS via RDNSS in the RA, if offered) |
| O | SLAAC for the address, DHCPv6 for DNS and domain (stateless DHCPv6) |
| M | DHCPv6 for the address and options (stateful); SLAAC too if the prefix's A flag is still on |

**Why R2 mustn't run `ipv6 unicast-routing` (task 3):** a router ignores RAs
for the purpose of building its own default route, because routers are
supposed to *send* RAs, not obey them. Leaving routing off makes R2 behave
like a host.

**Why stateful DHCPv6 gives no gateway:** DHCPv6 has no "default router"
option. Hosts always learn the gateway from RAs, which is exactly why a rogue
RA is so dangerous even in a fully DHCPv6-managed network.

**Why the guard works at the switch:** RA guard drops RA (ICMPv6 type 134)
messages arriving on ports whose policy says `host`. DHCPv6 guard drops
DHCPv6 ADVERTISE and REPLY messages (server-to-client) arriving on `client`
ports. The rogue still sends them; the switch just won't carry them.
</details>

## Break it

1. Attach the `HOSTS` RA guard policy to Gi0/0 (R1's port) as well.
2. Remove `ipv6 dhcp server STATEFUL` from R1 Gi0/0 but leave the M flag on.
3. On R1, change back to `ipv6 nd other-config-flag` (no M flag) and restart
   R2's client.
4. Enable `ipv6 unicast-routing` on R2 and remove its static default route.

<details><summary>Break it — what you should see</summary>

1. **Guard on the router port:** the switch now drops the *legitimate* RAs
   too. Hosts lose their default router and, once the old RA times out, their
   SLAAC addresses. A policy is only as good as its port assignment.
2. **M flag with no server:** hosts are told to use DHCPv6 and nobody
   answers. R2's `show ipv6 dhcp interface` stays in `SOLICIT`; PC1 still has
   SLAAC because the A flag is on.
3. **O flag only:** R2's `ipv6 address dhcp` asks for an address, but the
   stateless pool has no address prefix, so R2 gets DNS information but no
   address. Stateful and stateless are a server-side choice as much as a
   flag.
4. **Router ignores RAs:** R2 still gets its address by DHCPv6 but has no
   default route, so it can reach only its own subnet. Proof:
   `show ipv6 route ::/0` is empty.
</details>

---

# Lab 22 — Final: The Multi-Fault Troubleshooting Day

**Guide sections:** 22.1–22.4, plus 9, 23–24, 26–28, 32 · **Time:** half a day · **Diagram:** the RIB and FIB figure in 22.4

**Why this lab:** ENARSI hands you a broken network and a symptom, never a
config diff. This lab is that day at work: a small enterprise that worked
yesterday, eight trouble tickets this morning, and faults that hide behind
each other. The method from chapter 22 is the point: **define the problem,
gather facts, form a hypothesis, test it, fix, then prove the fix** — and
write down the root cause before moving on.

## Topology

```
   PC1  PC2
     \  /
     SW1 (VLAN 1)
   Gi0/0 \   / Gi0/1
     Gi0/0 R1   R2 Gi0/0        HSRP VIP 10.10.10.1
     Gi0/1   \ /  Gi0/1
         Gi0/0 R3 Gi0/1         core: OSPF, EIGRP, BGP, NAT, DHCP
     Gi0/3 /       \ Gi0/2
   Gi0/0 R5         R4 Gi0/0    R4 = ISP (AS 65100), Lo10 8.8.8.8
   (branch, EIGRP)
```

| Device | Image | Links |
|--------|-------|-------|
| SW1 | IOSvL2 | Gi0/0 → R1, Gi0/1 → R2, Gi0/2 → PC1, Gi0/3 → PC2 |
| R1 | IOSv | Gi0/0 → SW1, Gi0/1 → R3 Gi0/0 |
| R2 | IOSv | Gi0/0 → SW1, Gi0/1 → R3 Gi0/1 |
| R3 | IOSv | Gi0/0 → R1, Gi0/1 → R2, Gi0/2 → R4, Gi0/3 → R5 |
| R4 | IOSv | Gi0/0 → R3 Gi0/2 |
| R5 | IOSv | Gi0/0 → R3 Gi0/3 |
| PC1, PC2 | VPCS | DHCP clients |

## Addressing

| Segment | Subnet | Addresses |
|---------|--------|-----------|
| Users (VLAN 1) | 10.10.10.0/24 | R1 .2, R2 .3, HSRP VIP .1, DHCP .11–.254 |
| R1–R3 | 10.0.13.0/24 | .1 / .3 |
| R2–R3 | 10.0.23.0/24 | .2 / .3 |
| R3–R5 | 10.0.35.0/24 | .3 / .5 |
| R3–R4 (internet) | 203.0.113.0/30 | R3 .1, R4 .2 |
| HQ servers (R3 Lo10) | 10.30.30.0/24 | 10.30.30.1 |
| Branch LAN (R5 Lo10) | 10.50.50.0/24 | 10.50.50.1 |
| Internet (R4 Lo10) | 8.8.8.0/24 | 8.8.8.8 |
| Loopback0 | x.x.x.x/32 | R1 1.1.1.1, R2 2.2.2.2, R3 3.3.3.3, R5 5.5.5.5 |

**What runs where:** OSPF area 0 between R1, R2 and R3 (point-to-point
links). EIGRP AS 100 with MD5 between R3 and R5. R3 redistributes between
them. eBGP R3 (AS 65001) ↔ R4 (AS 65100); R4 sends a default. R3 originates
that default into OSPF and does PAT for everything in 10.0.0.0/8. R3 is the
DHCP server, R1 and R2 relay. HSRP on the user LAN with R1 active and
tracking its uplink. SSH to R3 is allowed only from 10.10.10.0/24 and
10.0.0.0/16.

## Part A — Build the known-good baseline

- Paste the baseline configs from the solution's **Baseline** block, save
  everything, and export the configs in EVE-NG
- PC1 and PC2 get leases with `ip dhcp` (addresses from .11 up, gateway .1)
- PC1 pings 10.30.30.1, 10.50.50.1 and 8.8.8.8
- `show standby brief` on R1: Active; on R2: Standby
- `show ip bgp summary` on R3: R4 with `PfxRcd` 2; R1 and R2 have `O*E2 0.0.0.0/0`
- `show ip eigrp neighbors` on R3 lists R5; R1 has `O E2 10.50.50.0/24`
- From R1, `ssh -l admin 3.3.3.3` logs in
- Shut R1 Gi0/1: PC1's continuous ping to 8.8.8.8 recovers via R2 within
  seconds; restore it

## Tasks

Now inject the faults: paste the **Fault script** from the Break it section
(better: have someone else paste it, so you don't see it). Then work these
tickets, which are written as users report them. For each one, write down the
root cause and the command that proved it **before** you fix it. Faults can
hide each other; follow the evidence, not the ticket order.

1. **Ticket 1:** "PC2 was moved to a new desk, released its address
   (`clear ip`), and now `ip dhcp` gets nothing."
2. **Ticket 2:** "Staff at HQ can reach the HQ servers but not the internet.
   The branch says the internet works for them." (This one may only appear
   after ticket 5 is fixed.)
3. **Ticket 3:** "HQ users can't reach anything at the branch. The core
   team says R3 can ping the branch fine."
4. **Ticket 4:** "During last night's maintenance test, R1's uplink was
   unplugged and HQ lost everything until it was plugged back in. Failover
   was supposed to be automatic."
5. **Ticket 5:** "Internet is down for everyone, HQ and branch. The ISP says
   your BGP session keeps sending them errors."
6. **Ticket 6:** "The branch is completely cut off. Nothing changed on our
   side, says the branch."
7. **Ticket 7:** "Monitoring can't reach R2's loopback (2.2.2.2). R2 itself
   looks healthy, interfaces up/up, no errors."
8. **Ticket 8:** "The network team can't SSH to R3 from R1 any more:
   `Connection refused`."

## Verification checklist

- Every Part A check passes again with all faults fixed
- For every ticket you wrote down: the symptom, the root cause, the command
  output that proved it, and the fix
- Shutting R1 Gi0/1 moves HSRP to R2 and back again when it's restored
- `show ip ospf neighbor` on R3 shows R1 and R2 `FULL`; `show ip eigrp
  neighbors` shows R5
- No `% Network not in table` for 10.50.50.0, 8.8.8.0 (via default) or
  10.30.30.0 from R1, R2 or R5

<details><summary>Solution — Baseline configs</summary>

R1 (R2 is identical except: Gi0/0 10.10.10.3, Gi0/1 10.0.23.2, Lo0 2.2.2.2,
router ID 2.2.2.2, OSPF network 10.0.23.0, **no** `standby 10 priority` line
and **no** `track`):

```
hostname R1
track 1 interface GigabitEthernet0/1 line-protocol
interface Loopback0
 ip address 1.1.1.1 255.255.255.255
interface GigabitEthernet0/0
 ip address 10.10.10.2 255.255.255.0
 ip helper-address 3.3.3.3
 standby version 2
 standby 10 ip 10.10.10.1
 standby 10 priority 110
 standby 10 preempt
 standby 10 track 1 decrement 20
 no shutdown
interface GigabitEthernet0/1
 ip address 10.0.13.1 255.255.255.0
 ip ospf network point-to-point
 no shutdown
router ospf 1
 router-id 1.1.1.1
 passive-interface GigabitEthernet0/0
 network 1.1.1.1 0.0.0.0 area 0
 network 10.0.13.0 0.0.0.255 area 0
 network 10.10.10.0 0.0.0.255 area 0
```

R3:

```
hostname R3
ip domain-name lab.local
crypto key generate rsa modulus 2048
ip ssh version 2
username admin privilege 15 algorithm-type scrypt secret Admin123
ip access-list standard MGMT
 permit 10.10.10.0 0.0.0.255
 permit 10.0.0.0 0.0.255.255
line vty 0 4
 access-class MGMT in
 login local
 transport input ssh
!
ip dhcp excluded-address 10.10.10.1 10.10.10.10
ip dhcp pool USERS
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 dns-server 8.8.8.8
!
key chain BRANCH
 key 1
  key-string EigrpBranch1
!
interface Loopback0
 ip address 3.3.3.3 255.255.255.255
interface Loopback10
 ip address 10.30.30.1 255.255.255.0
interface GigabitEthernet0/0
 ip address 10.0.13.3 255.255.255.0
 ip ospf network point-to-point
 ip nat inside
 no shutdown
interface GigabitEthernet0/1
 ip address 10.0.23.3 255.255.255.0
 ip ospf network point-to-point
 ip nat inside
 no shutdown
interface GigabitEthernet0/2
 ip address 203.0.113.1 255.255.255.252
 ip nat outside
 no shutdown
interface GigabitEthernet0/3
 ip address 10.0.35.3 255.255.255.0
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 BRANCH
 ip nat inside
 no shutdown
!
router eigrp 100
 network 10.0.35.0 0.0.0.255
 redistribute ospf 1 metric 100000 10 255 1 1500
!
router ospf 1
 router-id 3.3.3.3
 passive-interface Loopback10
 network 3.3.3.3 0.0.0.0 area 0
 network 10.0.13.0 0.0.0.255 area 0
 network 10.0.23.0 0.0.0.255 area 0
 network 10.30.30.0 0.0.0.255 area 0
 redistribute eigrp 100 subnets
 default-information originate
!
router bgp 65001
 bgp router-id 3.3.3.3
 neighbor 203.0.113.2 remote-as 65100
!
ip access-list standard NAT-INSIDE
 permit 10.0.0.0 0.255.255.255
ip nat inside source list NAT-INSIDE interface GigabitEthernet0/2 overload
```

R4 (ISP):

```
hostname R4
interface Loopback10
 ip address 8.8.8.8 255.255.255.0
interface GigabitEthernet0/0
 ip address 203.0.113.2 255.255.255.252
 no shutdown
router bgp 65100
 bgp router-id 4.4.4.4
 neighbor 203.0.113.1 remote-as 65001
 neighbor 203.0.113.1 default-originate
 network 8.8.8.0 mask 255.255.255.0
```

R5 (branch):

```
hostname R5
key chain HQ
 key 1
  key-string EigrpBranch1
interface Loopback0
 ip address 5.5.5.5 255.255.255.255
interface Loopback10
 ip address 10.50.50.1 255.255.255.0
interface GigabitEthernet0/0
 ip address 10.0.35.5 255.255.255.0
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 HQ
 no shutdown
router eigrp 100
 network 5.5.5.5 0.0.0.0
 network 10.0.35.0 0.0.0.255
 network 10.50.50.0 0.0.0.255
ip route 0.0.0.0 0.0.0.0 10.0.35.3
```

SW1: leave every port in VLAN 1 (`switchport mode access`), with
`spanning-tree portfast edge` on Gi0/2–0/3. PCs: `ip dhcp`, then `save`.
</details>

<details><summary>Solution — The eight tickets</summary>

**Ticket 1 — no DHCP lease.** Facts: PC1 (old lease) works, so relay and
routing are fine; only *new* leases fail. On R3, `show ip dhcp pool` shows the
pool with 0 addresses available / `show ip dhcp server statistics` counts
DISCOVERs with no OFFERs. `show run | include excluded` reveals
`ip dhcp excluded-address 10.10.10.11 10.10.10.254`: every assignable address
is excluded. Fix: `no ip dhcp excluded-address 10.10.10.11 10.10.10.254`.
Proof: PC2's `ip dhcp` gets 10.10.10.12 or similar.

**Ticket 5 — BGP errors (fix before ticket 2).** Facts: R1 has no
`O*E2` default; R3 `show ip bgp summary` shows R4 in `Idle` or `Active`, and
the log shows `%BGP-3-NOTIFICATION: received from neighbor 203.0.113.2 2/2
(peer in wrong AS)`. `show run | section router bgp` on R3: `remote-as 65101`.
Fix: `no neighbor 203.0.113.2` then `neighbor 203.0.113.2 remote-as 65100`.
Proof: `PfxRcd` 2 and the default is back in OSPF.

**Ticket 2 — HQ can't reach the internet, the branch can.** This hid behind
ticket 5. Facts: branch traffic enters R3 on Gi0/3 and is translated; HQ
traffic enters on Gi0/0 (HSRP active R1) and isn't. `show ip nat
translations` has entries for 10.50.50.x and 10.0.35.x but none for
10.10.10.x; `show ip nat statistics` lists inside interfaces Gi0/1 and Gi0/3
only. Fix: `interface Gi0/0` → `ip nat inside`. Proof: PC1 pings 8.8.8.8 and
its translation appears.

**Ticket 3 — HQ can't reach the branch.** Facts: R3 has `D 10.50.50.0/24`
(so EIGRP is fine), but R1's `show ip route 10.50.50.0` is `% Network not in
table`. On R3, `show ip ospf database external` lists no 10.50.50.0 and no
10.0.35.0: nothing from EIGRP made it into OSPF. The config shows
`redistribute eigrp 100` without `subnets`, so on IOSv only classful networks
are redistributed and every 10.x/24 is skipped. Fix:
`redistribute eigrp 100 subnets`. Proof: `O E2 10.50.50.0/24` on R1.

**Ticket 4 — failover didn't happen.** Facts: in normal state everything
works. Repeat the test: shut R1 Gi0/1. `show standby brief` on R1 shows
priority 90; on R2, 100, but R2 stays `Standby`. R2's config is missing
`standby 10 preempt`, so it never takes over from a lower-priority active.
Fix: `standby 10 preempt` on R2. Proof: repeat the test, R2 goes Active,
PC1's ping recovers.

**Ticket 6 — the branch is cut off.** Facts: R3's `show ip eigrp neighbors`
doesn't list R5. The interfaces are up/up and pings between 10.0.35.3 and
10.0.35.5 work, so it's layer 3 control plane. `debug eigrp packets` on R3
shows `authentication failure` / bad MD5 from 10.0.35.5. Comparing
`show key chain` on both: R5's key 1 is `EigrpBranch2`. Fix: set it back to
`EigrpBranch1` on R5. Proof: the neighbour comes up. (Key-chain *names* may
differ between routers; key IDs and strings must match.)

**Ticket 7 — R2's loopback unreachable.** Facts: R2 up/up, no errors, but R3's
`show ip ospf neighbor` shows R2 stuck in `EXSTART` or `EXCHANGE`. That state
is the signature of an MTU mismatch: the database description packets are
too big for one side. `show ip interface Gi0/1 | include MTU` on R2 shows 1400;
R3 says 1500. Fix: `no ip mtu 1400` on R2 Gi0/1 (or match both). Proof:
`FULL`, and 2.2.2.2 is reachable. (`ip ospf mtu-ignore` would also form the
adjacency but leaves a real MTU mismatch in place; fix the cause.)

**Ticket 8 — SSH refused.** Facts: `ssh -l admin 3.3.3.3` from R1 →
`% Connection refused by remote host`. That's an access-class, not an
authentication failure (which would prompt for a password first). R1's SSH
leaves from 10.0.13.1. On R3, `show access-lists MGMT` shows `permit
10.0.0.0, wildcard bits 0.0.0.255` with no matches: it covers only
10.0.0.0–10.0.0.255. Fix: replace it with `permit 10.0.0.0 0.0.255.255`.
Proof: the login works and the ACL line's match counter increases.
</details>

## Break it

**Fault script.** Apply it to the baseline in one go, ideally pasted by
someone else. It is deliberately uncommented.

<details><summary>Fault script (don't read it if you're the one troubleshooting)</summary>

R2:

```
interface GigabitEthernet0/0
 no standby 10 preempt
interface GigabitEthernet0/1
 ip mtu 1400
```

R3:

```
ip dhcp excluded-address 10.10.10.11 10.10.10.254
interface GigabitEthernet0/0
 no ip nat inside
router ospf 1
 no redistribute eigrp 100 subnets
 redistribute eigrp 100
router bgp 65001
 no neighbor 203.0.113.2
 neighbor 203.0.113.2 remote-as 65101
ip access-list standard MGMT
 no permit 10.0.0.0 0.0.255.255
 permit 10.0.0.0 0.0.0.255
```

R5:

```
key chain HQ
 key 1
  key-string EigrpBranch2
```

Then clear the OSPF process on R2 and R3 (`clear ip ospf process`) so the MTU
fault shows, and clear the DHCP bindings on R3 (`clear ip dhcp binding *`).
</details>

**When you've closed all eight tickets,** make your own fault list from the
Break it sections of Labs 12–21 and do the day again on this topology. The
more of them you can name from symptoms alone, the more ready you are.

---

*— End of the CCNP Lab Workbook —*
